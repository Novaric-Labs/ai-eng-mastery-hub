import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { subscriptionRow } from "@/lib/stripe-sync";

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

  // Shared row builder — derives plan + period-end the same way the account page
  // and the reconciliation endpoint do, and never throws on a missing period.
  await db.from("subscriptions").upsert(subscriptionRow(sub, userId));
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
    // Don't echo the verification error to the caller; log it server-side. A
    // bare 400 is all Stripe (or an attacker probing the endpoint) should see.
    console.error("stripe-webhook signature verification failed:", e);
    return new NextResponse("invalid signature", { status: 400 });
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
    // Log the detail; return a generic 500 so we don't leak DB/internal error
    // text. Stripe retries on any non-2xx, which is what we want here.
    console.error(`stripe-webhook handler error (${event.type}):`, e);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
