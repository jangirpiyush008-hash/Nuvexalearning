// claude-pdf-qa — "Ask Nuvexa AI" Q&A grounded in current PDF page text
// Uses Haiku 4.5 with prompt caching on the page_text block.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { getUserFromRequest, serviceClient } from "../_shared/supabase.ts";

const BodySchema = z.object({
  lesson_id: z.string().uuid(),
  page_text: z.string().min(1).max(20000),
  question: z.string().min(1).max(1000),
});

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

    // Verify the user can access this lesson's parent course
    const supa = serviceClient();
    const { data: lesson } = await supa
      .from("lessons")
      .select("course_id, is_trial")
      .eq("id", parsed.data.lesson_id)
      .single();
    if (!lesson) return json({ error: "lesson_not_found" }, 404);

    if (!lesson.is_trial) {
      const { data: enrollment } = await supa
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .maybeSingle();
      if (!enrollment) return json({ error: "not_enrolled" }, 403);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "server_misconfigured" }, 500);

    const res = await fetch(CLAUDE_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 600,
        system: "You answer questions strictly from the provided lesson text. If the answer is not in the text, say so. Be concise. Plain text only.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Lesson text:\n\n${parsed.data.page_text}`,
                cache_control: { type: "ephemeral" },
              },
              { type: "text", text: `Question: ${parsed.data.question}` },
            ],
          },
        ],
      }),
    });
    const data = await res.json();
    const answer = data?.content?.[0]?.text ?? "";

    return json({ ok: true, answer });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
