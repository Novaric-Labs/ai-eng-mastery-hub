import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";

// Shared body of the subscription cancel/resume routes: authenticate, look up
// the caller's own subscription row, and flip cancel_at_period_end in Stripe.
// The webhook syncs the resulting customer.subscription.updated event back
// into our DB.
export async function setCancelAtPeriodEnd(flag: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .maybeSingle();
  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: flag,
  });

  return NextResponse.json({ ok: true });
}
