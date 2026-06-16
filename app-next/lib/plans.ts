// Membership plans — one subscription unlocks the entire platform (all courses).
// All plans are recurring Stripe subscriptions billed at their interval; the
// longer plans bill less per month. Display copy lives here; the actual Stripe
// recurring price for each plan is referenced by env var (set in Vercel/Stripe).

export type Plan = {
  id: "monthly" | "quarterly" | "biannual" | "annual";
  label: string;
  /** Total charged each billing cycle, e.g. "$90". */
  priceLabel: string;
  /** Billing cadence shown under the price, e.g. "billed every 3 months". */
  cadence: string;
  /** Effective monthly rate, e.g. "$30/mo". */
  perMonth: string;
  /** Savings vs paying monthly, e.g. "Save 14%". */
  save?: string;
  /** Small ribbon, e.g. "Best value". */
  badge?: string;
  /** Visually emphasised plan. */
  highlight?: boolean;
  /** Env var holding this plan's Stripe recurring price id (server-only). */
  priceEnv: string;
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    label: "Monthly",
    priceLabel: "$35",
    cadence: "billed monthly",
    perMonth: "$35/mo",
    priceEnv: "STRIPE_PRICE_MONTHLY",
  },
  {
    id: "quarterly",
    label: "3 months",
    priceLabel: "$90",
    cadence: "billed every 3 months",
    perMonth: "$30/mo",
    save: "Save 14%",
    priceEnv: "STRIPE_PRICE_QUARTERLY",
  },
  {
    id: "biannual",
    label: "6 months",
    priceLabel: "$150",
    cadence: "billed every 6 months",
    perMonth: "$25/mo",
    save: "Save 29%",
    highlight: true,
    priceEnv: "STRIPE_PRICE_BIANNUAL",
  },
  {
    id: "annual",
    label: "1 year",
    priceLabel: "$250",
    cadence: "billed yearly",
    perMonth: "$21/mo",
    save: "Save 40%",
    badge: "Best value",
    priceEnv: "STRIPE_PRICE_ANNUAL",
  },
];

export const planById = (id: string): Plan | undefined =>
  PLANS.find((p) => p.id === id);
