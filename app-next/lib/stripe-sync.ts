import type Stripe from "stripe";
import { PLANS } from "./plans";

// Single source of truth for turning a Stripe Subscription into the fields we
// persist / display. Previously the webhook and the account page each derived
// these inline and DRIFTED — the webhook read current_period_end only off the
// subscription while the account page also checked the item. Centralizing here
// means they can never disagree again.

// current_period_end lives on the subscription (Stripe API <= 2024-06-20) OR on
// the subscription item (API 2025+ made each item carry its own period). Read
// both and validate it's a finite number so we never produce `new Date(NaN)`.
export function subscriptionPeriodEndUnix(sub: Stripe.Subscription): number | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = (sub.items?.data?.[0] as unknown as { current_period_end?: number })
    ?.current_period_end;
  const v = top ?? item ?? null;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function subscriptionPeriodEndISO(sub: Stripe.Subscription): string | null {
  const unix = subscriptionPeriodEndUnix(sub);
  return unix ? new Date(unix * 1000).toISOString() : null;
}

// Resolve our plan id. Prefer the price id mapping (the real source of truth on
// every event, including renewals where metadata may be absent); fall back to
// the `plan` we stamped into metadata at checkout/switch.
export function subscriptionPlanId(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  const priceId = item
    ? typeof item.price === "string"
      ? item.price
      : item.price?.id ?? null
    : null;
  const byPrice = priceId
    ? PLANS.find((p) => process.env[p.priceEnv] === priceId)?.id ?? null
    : null;
  return byPrice ?? ((sub.metadata?.plan as string | undefined) ?? null);
}

// The row shape persisted to public.subscriptions. Used by both the webhook and
// the reconciliation endpoint so writes are always identical.
export function subscriptionRow(sub: Stripe.Subscription, userId: string) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  return {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    plan: subscriptionPlanId(sub),
    status: sub.status,
    current_period_end: subscriptionPeriodEndISO(sub),
    updated_at: new Date().toISOString(),
  };
}

// When backfilling from a customer's subscriptions, pick the one that represents
// their current membership: paying states first, then most recently created.
const STATUS_RANK: Record<string, number> = {
  active: 0,
  trialing: 1,
  past_due: 2,
  unpaid: 3,
  incomplete: 4,
};

export function pickPrimarySubscription(
  subs: Stripe.Subscription[],
): Stripe.Subscription | null {
  const usable = subs.filter((s) => s.status in STATUS_RANK);
  if (usable.length === 0) return null;
  return usable.sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    return rank !== 0 ? rank : b.created - a.created;
  })[0];
}
