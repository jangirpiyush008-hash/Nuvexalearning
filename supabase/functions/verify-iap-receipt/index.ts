// verify-iap-receipt — server-side Apple receipt verification
// Client sends StoreKit 2 transaction JWS; we verify with Apple, then create enrollment.
// Idempotency: transaction_id is unique in iap_receipts.

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { serviceClient, getUserFromRequest } from "../_shared/supabase.ts";

const BodySchema = z.object({
  jws_representation: z.string().min(10),
  product_id: z.string().min(1),
});

const APPLE_VERIFY_PROD = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_VERIFY_SANDBOX = "https://sandbox.itunes.apple.com/verifyReceipt";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_body", details: parsed.error.flatten() }, 400);

    const { jws_representation, product_id } = parsed.data;

    // TODO(prod): verify JWS signature against Apple root cert + parse payload.
    // For scaffolding we POST receipt to verifyReceipt for sandbox first, then prod.
    const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    if (!sharedSecret) return json({ error: "server_misconfigured" }, 500);

    const verifyBody = {
      "receipt-data": jws_representation,
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
    if (appleJson.status !== 0) {
      return json({ error: "apple_verification_failed", status: appleJson.status }, 400);
    }

    const latest = appleJson.latest_receipt_info?.[0];
    if (!latest) return json({ error: "no_transaction_found" }, 400);

    const transactionId = latest.transaction_id as string;
    const originalTransactionId = latest.original_transaction_id as string;
    const receivedProductId = latest.product_id as string;
    if (receivedProductId !== product_id) {
      return json({ error: "product_id_mismatch" }, 400);
    }

    const supa = serviceClient();

    // Idempotency check — same transaction never grants twice.
    const { data: existing } = await supa
      .from("iap_receipts")
      .select("id")
      .eq("transaction_id", transactionId)
      .maybeSingle();
    if (existing) return json({ ok: true, idempotent: true });

    await supa.from("iap_receipts").insert({
      user_id: user.id,
      transaction_id: transactionId,
      original_transaction_id: originalTransactionId,
      product_id: receivedProductId,
      raw_receipt: appleJson,
    });

    // Resolve product_id → course
    const { data: course } = await supa
      .from("courses")
      .select("id, slug")
      .eq("slug", productToCourseSlug(receivedProductId))
      .maybeSingle();

    if (!course) return json({ error: "course_not_found_for_product" }, 404);

    await supa
      .from("enrollments")
      .upsert({ user_id: user.id, course_id: course.id }, { onConflict: "user_id,course_id" });

    return json({ ok: true, course_id: course.id });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function productToCourseSlug(productId: string): string {
  // Convention: nuvexa.course.{slug}
  return productId.replace(/^nuvexa\.course\./, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
