// The launch "Founding Member" offer — single source of truth for the copy the
// site shows. The Stripe coupon + promotion code that actually apply the
// discount are created once by scripts/create-founding-offer.ps1 (run in LIVE
// mode by the owner). Checkout already sends `allow_promotion_codes: true`, so a
// member just enters FOUNDING.code on the Stripe Checkout page to redeem; the
// 40% applies for the life of the subscription (coupon duration = forever).
//
// `maxMembers` here is only display copy ("first 100"); the real cap is enforced
// by the promotion code's max_redemptions in Stripe.
export const FOUNDING = {
  code: "FOUNDING40",
  percentOff: 40,
  maxMembers: 100,
} as const;
