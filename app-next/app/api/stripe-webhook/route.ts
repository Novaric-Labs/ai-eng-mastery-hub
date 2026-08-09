import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { pickPrimarySubscription, subscriptionRow } from "@/lib/stripe-sync";

export const runtime = "nodejs"; // raw body + signature verification need Node

// Service-role client bypasses RLS to upsert subscription state.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Mirror a customer's membership into our `subscriptions` table. Keyed by
// user_id (carried in metadata at checkout); falls back to matching an existing
// row by customer id for events that lack it (renewals, cancels).
//
// The event's subscription object is used only to identify the customer/user —
// never persisted directly. Stripe does not guarantee event ordering, retries
// can deliver a stale snapshot hours after the state changed, and a customer
// can briefly hold two subscriptions (cancel -> re-subscribe), where mirroring
// the old subscription's terminal event would clobber the row that represents
// the new, paid-for one (the table keys one row per user). Re-listing the
// subscriptions and persisting the primary means every event — including a
// stale, duplicated, or out-of-order one — converges the row toward live
// Stripe truth. We list across both the event's customer AND the customer
// already stored on the row, covering users whose history spans two Stripe
// customers; /api/subscription/sync (email-based) remains the wider net.
async function syncSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  const db = admin();
  const eventCustomerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = sub.metadata?.user_id as string | undefined;
  let storedCustomerId: string | undefined;

  if (userId) {
    const { data } = await db
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    storedCustomerId = data?.stripe_customer_id as string | undefined;
  } else {
    const { data } = await db
      .from("subscriptions")
      .select("user_id, stripe_customer_id")
      .eq("stripe_customer_id", eventCustomerId)
      .maybeSingle();
    userId = data?.user_id as string | undefined;
    storedCustomerId = data?.stripe_customer_id as string | undefined;
  }
  if (!userId) return; // can't attribute this subscription to a user yet

  const customerIds = [...new Set([eventCustomerId, storedCustomerId])].filter(
    (c): c is string => !!c,
  );
  const live: Stripe.Subscription[] = [];
  for (const cid of customerIds) {
    live.push(
      ...(await stripe.subscriptions
        .list({ customer: cid, status: "all", limit: 100 })
        .autoPagingToArray({ limit: 100 })),
    );
  }
  const primary =
    pickPrimarySubscription(live) ??
    // No usable membership left: persist the newest terminal state (canceled /
    // expired) so access actually ends, rather than leaving a stale row.
    [...live].sort((a, b) => b.created - a.created)[0] ??
    sub;

  // Shared row builder — derives plan + period-end the same way the account page
  // and the reconciliation endpoint do, and never throws on a missing period.
  await db.from("subscriptions").upsert(subscriptionRow(primary, userId));
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
