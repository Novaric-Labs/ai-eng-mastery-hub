import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";
import { planById } from "@/lib/plans";

export const runtime = "nodejs";

// Switches the member's plan (e.g. monthly -> annual) by swapping the price on
// their single subscription item. Prorations are created so the change is fair
// mid-cycle. The webhook syncs the new plan/period back into our DB.
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = planById(String(body.plan ?? ""));
  if (!plan) {
    return NextResponse.json({ error: "unknown_plan" }, { status: 400 });
  }
  const newPrice = process.env[plan.priceEnv];
  if (!newPrice) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .maybeSingle();
  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const current = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  const item = current.items.data[0];
  if (!item?.id) {
    return NextResponse.json({ error: "no_subscription_item" }, { status: 400 });
  }

  // Same-plan guard compares against the LIVE Stripe price — the same source of
  // truth the account page uses to show the current plan. The DB `plan` column
  // lags behind a switch until the webhook syncs it, which previously rejected a
  // valid switch *back* to the original plan as "same_plan".
  const currentPriceId =
    typeof item.price === "string" ? item.price : item.price?.id ?? null;
  if (currentPriceId === newPrice) {
    return NextResponse.json({ error: "same_plan" }, { status: 400 });
  }

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: item.id, price: newPrice }],
    proration_behavior: "create_prorations",
    metadata: { user_id: user.id, plan: plan.id },
  });

  return NextResponse.json({ ok: true });
}
