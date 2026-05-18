// retake-fee-checkout — user pays ₹99 to skip the 30-day test cooldown
// Apple IAP consumable product: nuvexa.retake.skip
// Client purchases via StoreKit, posts receipt here; we verify + flag attempt as retake-paid.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient, getUserFromRequest } from "../_shared/supabase.ts";

const BodySchema = z.object({
  course_id: z.string().uuid(),
  jws_representation: z.string().min(10),
});

const APPLE_VERIFY_PROD = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_VERIFY_SANDBOX = "https://sandbox.itunes.apple.com/verifyReceipt";
const RETAKE_PRODUCT_ID = "nuvexa.retake.skip";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body" }, 400);

    const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    if (!sharedSecret) return json({ error: "server_misconfigured" }, 500);

    const verifyBody = {
      "receipt-data": parsed.data.jws_representation,
      password: sharedSecret,
      "exclude-old-transactions": true,
    };
    let appleRes = await fetch(APPLE_VERIFY_PROD, {
      method: "POST",
      body: JSON.stringify(verifyBody),
    });
    let appleJson = await appleRes.json();
    if (appleJson.status === 21007) {
      appleRes = await fetch(APPLE_VERIFY_SANDBOX, {
        method: "POST",
        body: JSON.stringify(verifyBody),
      });
      appleJson = await appleRes.json();
    }
    if (appleJson.status !== 0) return json({ error: "apple_verification_failed" }, 400);

    const latest = appleJson.latest_receipt_info?.[0];
    if (!latest || latest.product_id !== RETAKE_PRODUCT_ID)
      return json({ error: "invalid_product" }, 400);

    const supa = serviceClient();

    // Idempotency
    const { data: existing } = await supa
      .from("iap_receipts")
      .select("id")
      .eq("transaction_id", latest.transaction_id)
      .maybeSingle();
    if (existing) return json({ ok: true, idempotent: true });

    await supa.from("iap_receipts").insert({
      user_id: user.id,
      transaction_id: latest.transaction_id,
      original_transaction_id: latest.original_transaction_id,
      product_id: RETAKE_PRODUCT_ID,
      raw_receipt: appleJson,
    });

    // Flag latest attempt for this course as retake-fee paid → client can start new attempt
    await supa
      .from("test_attempts")
      .update({ retake_fee_paid: true })
      .eq("user_id", user.id)
      .eq("course_id", parsed.data.course_id);

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
