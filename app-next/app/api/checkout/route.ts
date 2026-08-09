import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";
import { planById } from "@/lib/plans";

export const runtime = "nodejs";

// Stripe statuses under which the subscription is still alive and can bill
// again on its own (past_due/unpaid are dunning: a later payment retry
// succeeds and billing resumes). A user with one of these must not be able to
// start a second checkout. Deliberately NOT the same predicate as
// hasActiveMembership — that answers "can they access content right now",
// which is false during dunning precisely when double-subscribe is most
// likely ("card failed, I'll just subscribe again").
const LIVE_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];

// If the row's period ended this long ago and Stripe never sent another event,
// the row is stale (e.g. a missed deletion webhook) — don't lock the user out
// of re-subscribing forever. Stripe's dunning retries span up to ~4 weeks.
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

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

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, status, current_period_end")
    .maybeSingle();

  // A member completing a second checkout would end up with two live Stripe
  // subscriptions while our table tracks only one — silent double billing,
  // and cancel would only ever kill the tracked one. Plan changes go through
  // /api/subscription/switch, not checkout.
  const periodEndMs = sub?.current_period_end
    ? new Date(sub.current_period_end).getTime()
    : null;
  if (
    sub &&
    LIVE_STATUSES.includes(sub.status) &&
    (periodEndMs === null || periodEndMs > Date.now() - STALE_AFTER_MS)
  ) {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = process.env.NEXT_PUBLIC_SITE_URL!;

  // Reuse an existing Stripe customer so a re-subscribe doesn't create
  // duplicates. If our row hasn't been written yet (webhook lag), look the
  // customer up by email before falling back to customer_email — otherwise a
  // second checkout in that window creates a SECOND Stripe customer, and the
  // webhook's per-customer convergence can never see both subscriptions.
  let customerId = sub?.stripe_customer_id as string | undefined;
  if (!customerId && user.email) {
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    customerId = existing.data[0]?.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    ...(customerId
      ? { customer: customerId }
      : { customer_email: user.email ?? undefined }),
    metadata: { user_id: user.id, plan: plan.id },
    subscription_data: { metadata: { user_id: user.id, plan: plan.id } },
    success_url: `${site}/courses?subscribed=1`,
    cancel_url: `${site}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
