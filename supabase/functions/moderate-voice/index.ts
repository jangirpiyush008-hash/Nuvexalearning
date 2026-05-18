// moderate-voice — Claude Haiku flags abuse/spam before publishing
// Called by client before insert; sets is_public based on result.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
});

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

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
        max_tokens: 50,
        system: `Classify the message. Output ONLY JSON: {"allow": true|false, "reason": "..."}.
Reject: hate, harassment, sexual content, PII leaks, spam, scams, off-topic promos.
Allow: honest reviews even if negative, constructive criticism.`,
        messages: [{ role: "user", content: parsed.data.text }],
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? '{"allow":false,"reason":"parse_error"}';
    const verdict = safeParse(text);

    return json({ ok: true, ...verdict });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function safeParse(s: string): { allow: boolean; reason: string } {
  try {
    const m = s.match(/\{[\s\S]*\}/);
    if (!m) return { allow: false, reason: "no_json" };
    const obj = JSON.parse(m[0]);
    return { allow: !!obj.allow, reason: String(obj.reason ?? "") };
  } catch {
    return { allow: false, reason: "parse_error" };
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
