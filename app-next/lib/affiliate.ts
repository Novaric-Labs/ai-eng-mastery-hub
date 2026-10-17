// The Novacademy affiliate program — single source of truth for the terms the
// /affiliates page (and any marketing copy) shows. Keep this in sync with
// docs/affiliate-program.md, which explains the program and how to operate it.
//
// Attribution + commissions are tracked by Tolt (https://tolt.io), a Stripe-native
// affiliate tool: each affiliate gets a referral link with click tracking and a
// self-serve dashboard, and recurring commission is computed automatically off the
// Stripe subscription. Once the Tolt program is live, set
// NEXT_PUBLIC_AFFILIATE_SIGNUP_URL to the Tolt-hosted signup URL; until then the
// "Apply" button falls back to email so it never ships a dead link.
export const AFFILIATE = {
  /** Recurring commission rate paid on a referred member's payments. */
  commissionPct: 30,
  /** How many months of a referred member's payments earn commission. */
  commissionMonths: 12,
  /** The discount an affiliate's code gives their audience (the hook). */
  learnerDiscountPct: 15,
  /** Invited "Partner" tier rate for proven converters. */
  partnerTierPct: 40,
  /** Days a referral click is attributed (Tolt default cookie window). */
  cookieDays: 60,
  contactEmail: "partners@novacademy.ai",
  /** Tolt-hosted signup page; falls back to email until the program is live. */
  signupUrl:
    process.env.NEXT_PUBLIC_AFFILIATE_SIGNUP_URL ||
    "mailto:partners@novacademy.ai?subject=Novacademy%20affiliate%20program",
} as const;
