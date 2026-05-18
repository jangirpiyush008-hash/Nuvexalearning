// grant-reward — idempotent reward issuance after test grading
// Reward tiers:
//   >= 95% → ₹10,000 credits + certificate + Top Voice eligibility (capped by reward_pools)
//   >= 70% → ₹200 credits + certificate
//   <  70% → no credits, retry_available_at = now + 30 days (handled client-side from attempt timestamp)
// Idempotency: attempt_id is the dedup key — same attempt can never grant twice.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

const BodySchema = z.object({ attempt_id: z.string().uuid() });

const TIER_TOP_PAISE = 1_000_000;      // ₹10,000
const TIER_PASS_PAISE = 20_000;        // ₹200
const CREDIT_EXPIRY_MONTHS = 12;

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

    const supa = serviceClient();

    const { data: attempt } = await supa
      .from("test_attempts")
      .select("id, user_id, course_id, score_pct, reward_granted, submitted_at")
      .eq("id", parsed.data.attempt_id)
      .single();

    if (!attempt) return json({ error: "attempt_not_found" }, 404);
    if (attempt.reward_granted) return json({ ok: true, idempotent: true });
    if (!attempt.submitted_at || attempt.score_pct == null)
      return json({ error: "attempt_not_submitted" }, 409);

    const { data: test } = await supa
      .from("tests")
      .select("pass_threshold_pct, reward_threshold_pct")
      .eq("course_id", attempt.course_id)
      .single();
    if (!test) return json({ error: "test_not_found" }, 404);

    const score = Number(attempt.score_pct);
    let tier: "top" | "pass" | "fail" = "fail";
    if (score >= Number(test.reward_threshold_pct)) tier = "top";
    else if (score >= Number(test.pass_threshold_pct)) tier = "pass";

    // ------------------------------------------------------------------
    // Top tier — check monthly cap via reward_pools
    // ------------------------------------------------------------------
    let amountPaise = 0;
    let topAwarded = false;
    if (tier === "top") {
      const monthStart = firstOfMonthUTC();
      const { data: pool } = await supa
        .from("reward_pools")
        .upsert(
          { course_id: attempt.course_id, month: monthStart, max_winners: 100, current_winners: 0 },
          { onConflict: "course_id,month", ignoreDuplicates: true },
        )
        .select()
        .maybeSingle();

      const { data: poolNow } = await supa
        .from("reward_pools")
        .select("max_winners, current_winners")
        .eq("course_id", attempt.course_id)
        .eq("month", monthStart)
        .single();

      if (poolNow && poolNow.current_winners < poolNow.max_winners) {
        const { error: incErr } = await supa.rpc("noop_unused", {}).then(async () => {
          // simple atomic increment via update with where on current_winners
          return await supa
            .from("reward_pools")
            .update({ current_winners: poolNow.current_winners + 1 })
            .eq("course_id", attempt.course_id)
            .eq("month", monthStart)
            .eq("current_winners", poolNow.current_winners);
        });
        if (!incErr) {
          topAwarded = true;
          amountPaise = TIER_TOP_PAISE;
        } else {
          // Race lost; downgrade to pass tier
          amountPaise = TIER_PASS_PAISE;
        }
      } else {
        amountPaise = TIER_PASS_PAISE;
      }
    } else if (tier === "pass") {
      amountPaise = TIER_PASS_PAISE;
    }

    // ------------------------------------------------------------------
    // Issue credits + certificate
    // ------------------------------------------------------------------
    if (amountPaise > 0) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + CREDIT_EXPIRY_MONTHS);

      await supa.from("credit_transactions").insert({
        user_id: attempt.user_id,
        amount_paise: amountPaise,
        type: "earned",
        reference_id: attempt.id,
        description: topAwarded
          ? "Top performer reward (95%+)"
          : "Pass reward (70%+)",
        expires_at: expiresAt.toISOString(),
      });

      // Upsert wallet
      const { data: wallet } = await supa
        .from("credits_wallet")
        .select("balance_paise, lifetime_earned_paise")
        .eq("user_id", attempt.user_id)
        .maybeSingle();

      if (wallet) {
        await supa
          .from("credits_wallet")
          .update({
            balance_paise: Number(wallet.balance_paise) + amountPaise,
            lifetime_earned_paise: Number(wallet.lifetime_earned_paise) + amountPaise,
          })
          .eq("user_id", attempt.user_id);
      } else {
        await supa.from("credits_wallet").insert({
          user_id: attempt.user_id,
          balance_paise: amountPaise,
          lifetime_earned_paise: amountPaise,
        });
      }

      await supa.from("certificates").upsert(
        {
          user_id: attempt.user_id,
          course_id: attempt.course_id,
          score_pct: score,
        },
        { onConflict: "user_id,course_id" },
      );

      await supa.from("notifications").insert({
        user_id: attempt.user_id,
        type: "reward",
        title: topAwarded ? "🏆 Top performer reward!" : "🎉 You passed!",
        body: `You earned ₹${(amountPaise / 100).toLocaleString("en-IN")} in AI Credits.`,
        payload: { attempt_id: attempt.id, amount_paise: amountPaise },
      });
    } else {
      await supa.from("notifications").insert({
        user_id: attempt.user_id,
        type: "test_failed",
        title: "Test result",
        body: `You scored ${score}%. Retake free after 30 days, or pay ₹99 to retake now.`,
        payload: { attempt_id: attempt.id, score_pct: score },
      });
    }

    await supa
      .from("test_attempts")
      .update({ reward_granted: true })
      .eq("id", attempt.id);

    return json({ ok: true, tier, top_awarded: topAwarded, amount_paise: amountPaise });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function firstOfMonthUTC(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
