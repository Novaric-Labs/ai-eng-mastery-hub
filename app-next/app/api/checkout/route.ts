import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";
import { planById } from "@/lib/plans";

export const runtime = "nodejs";

// Starts a Stripe Checkout session for a membership plan (recurring). One
// membership unlocks the whole platform, so checkout is plan-based, not
// course-based.
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = planById(String(body.plan ?? "monthly"));
  if (!plan) {
    return NextResponse.json({ error: "unknown_plan" }, { status: 400 });
  }
  const price = process.env[plan.priceEnv];
  if (!price) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 400 });
  }

  // Reuse an existing Stripe customer if we already have one for this user, so
  // a re-subscribe doesn't create duplicates.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .maybeSingle();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    ...(sub?.stripe_customer_id
      ? { customer: sub.stripe_customer_id }
      : { customer_email: user.email ?? undefined }),
    metadata: { user_id: user.id, plan: plan.id },
    subscription_data: { metadata: { user_id: user.id, plan: plan.id } },
    success_url: `${site}/courses?subscribed=1`,
    cancel_url: `${site}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
