// stripe-webhook — grants entitlement after a successful payment.
// Deploy WITHOUT JWT verification (Stripe calls it, not a logged-in user):
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets needed: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
//   (SUPABASE_URL is injected automatically.)
import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

// Service-role client bypasses RLS so it can write entitlements.
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (e) {
    return new Response(`bad signature: ${e?.message ?? e}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.client_reference_id;
    const customer = typeof s.customer === "string" ? s.customer : null;
    // mode guard: this legacy function sells the ONE-TIME purchase only. The
    // app-next membership flow creates mode:'subscription' sessions on the
    // same Stripe account (both webhook endpoints receive the same events) —
    // granting on those would mint a permanent entitlement for what is
    // actually a cancellable monthly subscription.
    if (userId && s.payment_status === "paid" && s.mode === "payment") {
      // Migration 20260615 (multi-course) dropped the 2-arg RPC signature, so
      // this call must pass the course or every paid legacy checkout 500s and
      // never grants access. The legacy web/ front-end sells exactly one
      // product: the original ai-eng course; metadata may override.
      const course = (s.metadata?.course as string | undefined) ?? "ai-eng";
      const { error } = await admin.rpc("grant_stripe_entitlement", {
        p_user: userId, p_customer: customer, p_course: course,
      });
      if (error) return new Response(`grant failed: ${error.message}`, { status: 500 });
    }
  }

  // Acknowledge everything else so Stripe stops retrying.
  return new Response("ok", { status: 200 });
});
