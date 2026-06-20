import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { subscriptionRow, pickPrimarySubscription } from "@/lib/stripe-sync";

export const runtime = "nodejs";

// Self-healing reconciliation. Access is gated on the `subscriptions` DB row,
// which is normally written by the Stripe webhook. If that event is delayed,
// dropped, or the endpoint was briefly misconfigured, a paying user would have
// NO access and /account would show "no membership". This endpoint backfills the
// row straight from Stripe for the signed-in user, so access never hinges on a
// single webhook delivery. Idempotent and safe to call repeatedly.
export async function POST() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Find the user's Stripe customer(s): a known mapping if we have one, plus any
  // customer matching their email (how checkout created it). A user only ever
  // reconciles their own customer/email, and we always write their own user id.
  const customerIds: string[] = [];
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .maybeSingle();
  if (existing?.stripe_customer_id) customerIds.push(existing.stripe_customer_id);
  if (user.email) {
    const customers = await stripe.customers.list({ email: user.email, limit: 10 });
    for (const c of customers.data) {
      if (!customerIds.includes(c.id)) customerIds.push(c.id);
    }
  }
  if (customerIds.length === 0) {
    return NextResponse.json({ ok: true, synced: false });
  }

  // Gather subscriptions across the matched customers and pick the primary one.
  const all: Stripe.Subscription[] = [];
  for (const cid of customerIds) {
    const subs = await stripe.subscriptions.list({
      customer: cid,
      status: "all",
      limit: 10,
    });
    all.push(...subs.data);
  }
  const primary = pickPrimarySubscription(all);
  if (!primary) {
    return NextResponse.json({ ok: true, synced: false });
  }

  await supabaseAdmin().from("subscriptions").upsert(subscriptionRow(primary, user.id));
  return NextResponse.json({ ok: true, synced: true, status: primary.status });
}
