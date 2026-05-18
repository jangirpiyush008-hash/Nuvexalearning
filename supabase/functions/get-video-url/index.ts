// get-video-url — issues Cloudflare Stream signed URL
// Trial lessons: 60-second token. Paid: only if enrollment exists.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient, getUserFromRequest } from "../_shared/supabase.ts";

const BodySchema = z.object({ lesson_id: z.string().uuid() });

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

    const supa = serviceClient();

    const { data: lesson } = await supa
      .from("lessons")
      .select("id, course_id, video_stream_id, is_trial")
      .eq("id", parsed.data.lesson_id)
      .single();
    if (!lesson) return json({ error: "lesson_not_found" }, 404);
    if (!lesson.video_stream_id) return json({ error: "no_video" }, 404);

    if (!lesson.is_trial) {
      // Paid lesson: require enrollment
      const { data: enrollment } = await supa
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .maybeSingle();
      if (!enrollment) return json({ error: "not_enrolled" }, 403);
    }

    const expSeconds = lesson.is_trial ? 60 : 60 * 60 * 2; // 60s trial, 2h paid
    const token = await signCloudflareStream(lesson.video_stream_id, expSeconds);
    const playbackUrl = `https://customer-${Deno.env.get("CF_STREAM_CUSTOMER")}.cloudflarestream.com/${token}/manifest/video.m3u8`;

    return json({ ok: true, url: playbackUrl, expires_in: expSeconds, is_trial: lesson.is_trial });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

async function signCloudflareStream(videoUid: string, expSeconds: number): Promise<string> {
  // Cloudflare Stream signed token via API.
  // For brevity here we hit Stream's "/sign" endpoint; replace with JWT signing for prod.
  const apiToken = Deno.env.get("CF_STREAM_API_TOKEN");
  const accountId = Deno.env.get("CF_ACCOUNT_ID");
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoUid}/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSeconds }),
    },
  );
  const j = await res.json();
  if (!j.success) throw new Error("cf_sign_failed");
  return j.result.token;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
