// redeem-credit — spend AI Credits on partner offers, addons, retake fees, etc.
// Validates balance, writes spent txn, decrements wallet.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient, getUserFromRequest } from "../_shared/supabase.ts";

const BodySchema = z.object({
  amount_paise: z.number().int().positive(),
  description: z.string().min(1).max(280),
  reference_id: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

    const supa = serviceClient();

    const { data: wallet } = await supa
      .from("credits_wallet")
      .select("balance_paise, lifetime_spent_paise")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet || Number(wallet.balance_paise) < parsed.data.amount_paise) {
      return json({ error: "insufficient_balance" }, 402);
    }

    await supa.from("credit_transactions").insert({
      user_id: user.id,
      amount_paise: -parsed.data.amount_paise,
      type: "spent",
      reference_id: parsed.data.reference_id ?? null,
      description: parsed.data.description,
    });

    await supa
      .from("credits_wallet")
      .update({
        balance_paise: Number(wallet.balance_paise) - parsed.data.amount_paise,
        lifetime_spent_paise: Number(wallet.lifetime_spent_paise) + parsed.data.amount_paise,
      })
      .eq("user_id", user.id);

    return json({ ok: true });
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
