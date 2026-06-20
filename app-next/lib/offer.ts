// The launch "Founding Member" offer — single source of truth for the copy the
// site shows. The Stripe coupon + promotion code that actually apply the
// discount are created once by scripts/create-founding-offer.ps1 (run in LIVE
// mode by the owner). Checkout already sends `allow_promotion_codes: true`, so a
// member just enters FOUNDING.code on the Stripe Checkout page to redeem; the
// 40% applies for the life of the subscription (coupon duration = forever).
//
// The offer is time-boxed: it ends on `endsAtISO`. That window is enforced by the
// promotion code's `expires_at` in Stripe — keep the script's expiry and the
// `endsLabel`/`endsAtISO` here in sync so the on-site copy matches what Stripe
// will actually honor.
export const FOUNDING = {
  code: "FOUNDING40",
  percentOff: 40,
  /** Human-readable deadline shown on-site, e.g. "July 3". */
  endsLabel: "July 3",
  /** Machine deadline (matches the Stripe promo code's expires_at). */
  endsAtISO: "2026-07-03",
} as const;
