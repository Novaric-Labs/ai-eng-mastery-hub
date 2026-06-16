import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // raw body + signature verification need Node

// Service-role client bypasses RLS to upsert subscription state.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Mirror a Stripe subscription into our `subscriptions` table. Keyed by user_id
// (carried in metadata at checkout); falls back to matching an existing row by
// customer id for events that lack it (renewals, cancels).
async function syncSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  const db = admin();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = sub.metadata?.user_id as string | undefined;

  if (!userId) {
    const { data } = await db
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id as string | undefined;
  }
  if (!userId) return; // can't attribute this subscription to a user yet

  await db.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    plan: (sub.metadata?.plan as string | undefined) ?? null,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.text(); // raw body for signature verification
  const sig = request.headers.get("stripe-signature");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (e) {
    return new NextResponse(`bad signature: ${(e as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        // Membership purchase: fetch the created subscription and sync it. Carry
        // the user_id from the session metadata onto the subscription record.
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof s.subscription === "string" ? s.subscription : s.subscription.id,
          );
          if (!sub.metadata?.user_id && s.client_reference_id) {
            sub.metadata = { ...sub.metadata, user_id: s.client_reference_id };
          }
          await syncSubscription(stripe, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(stripe, event.data.object as Stripe.Subscription);
        break;
      }
    }
  } catch (e) {
    return new NextResponse(`handler error: ${(e as Error).message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
