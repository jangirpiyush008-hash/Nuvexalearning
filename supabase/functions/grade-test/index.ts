// grade-test — Claude Sonnet 4.6 grades open-ended answers against rubric
// MCQ scored deterministically; open-ended graded via Claude.
// On submit, calls grant-reward internally (idempotent via attempt_id).

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient, getUserFromRequest } from "../_shared/supabase.ts";

const BodySchema = z.object({
  attempt_id: z.string().uuid(),
  answers: z.record(z.string(), z.string()),  // question_id → answer text
});

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body", details: parsed.error.flatten() }, 400);

    const supa = serviceClient();

    const { data: attempt, error: attemptErr } = await supa
      .from("test_attempts")
      .select("id, user_id, course_id, submitted_at")
      .eq("id", parsed.data.attempt_id)
      .single();
    if (attemptErr || !attempt) return json({ error: "attempt_not_found" }, 404);
    if (attempt.user_id !== user.id) return json({ error: "forbidden" }, 403);
    if (attempt.submitted_at) return json({ error: "already_submitted" }, 409);

    const { data: test } = await supa
      .from("tests")
      .select("question_pool, pass_threshold_pct, reward_threshold_pct")
      .eq("course_id", attempt.course_id)
      .single();
    if (!test) return json({ error: "test_not_found" }, 404);

    const questions = test.question_pool as Array<{
      id: string;
      type: "mcq" | "open";
      prompt: string;
      correct?: string;  // for mcq
      rubric?: string;   // for open
      points: number;
    }>;

    let earned = 0;
    let total = 0;
    for (const q of questions) {
      total += q.points;
      const userAnswer = parsed.data.answers[q.id] ?? "";
      if (q.type === "mcq") {
        if (userAnswer === q.correct) earned += q.points;
      } else {
        const score = await gradeOpenEnded(q.prompt, q.rubric ?? "", userAnswer);
        earned += Math.round(score * q.points);
      }
    }
    const scorePct = total > 0 ? +(earned / total * 100).toFixed(2) : 0;

    await supa
      .from("test_attempts")
      .update({
        submitted_at: new Date().toISOString(),
        score_pct: scorePct,
        answers: parsed.data.answers,
      })
      .eq("id", attempt.id);

    // Fire-and-await grant-reward
    const grantRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/grant-reward`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ attempt_id: attempt.id }),
      },
    );
    const grant = await grantRes.json();

    return json({ ok: true, score_pct: scorePct, reward: grant });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

async function gradeOpenEnded(prompt: string, rubric: string, answer: string): Promise<number> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return 0;
  const res = await fetch(CLAUDE_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      system: "You grade student answers strictly against the rubric. Output ONLY a number from 0.0 to 1.0.",
      messages: [
        {
          role: "user",
          content: `Question: ${prompt}\n\nRubric: ${rubric}\n\nStudent answer: ${answer}\n\nScore (0.0-1.0):`,
        },
      ],
    }),
  });
  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "0";
  const num = parseFloat(text.match(/[\d.]+/)?.[0] ?? "0");
  return Math.max(0, Math.min(1, isNaN(num) ? 0 : num));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
