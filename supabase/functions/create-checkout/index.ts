// create-checkout — starts a Stripe Checkout session for the signed-in user.
// Deploy: supabase functions deploy create-checkout
// Secrets needed: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SITE_URL
//   (SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.)
import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Identify the caller from their Supabase JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });
    const site = Deno.env.get("SITE_URL")!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // one-time "lifetime access" purchase
      line_items: [{ price: Deno.env.get("STRIPE_PRICE_ID")!, quantity: 1 }],
      allow_promotion_codes: true, // Stripe-side tester/marketing coupons
      client_reference_id: user.id, // the webhook maps this back to the user
      customer_email: user.email ?? undefined,
      success_url: `${site}/?checkout=success`,
      cancel_url: `${site}/?checkout=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
