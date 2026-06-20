# Creator / Affiliate Playbook

How to run the pay-for-performance creator channel. The core idea: **each creator
gets a unique Stripe promo code that is both their audience's discount and your
attribution.** Stripe reports redemptions per code, so you always know who drove
which subscriptions — and therefore what commission is owed.

No code change is needed to add a creator: `/api/checkout` already sends
`allow_promotion_codes: true`, so a code works the moment it exists in Stripe.

---

## Deal structure (offer this order)

1. **Affiliate / rev-share first (default).** Pay only on results:
   - **35% of first-year revenue** per member they refer, **or**
   - a flat **$15–20 bounty** per paying signup.
   - Their code gives their audience a discount (default 15% off first payment) as
     the hook. This is near-zero downside — you only pay when you get paid.
2. **Flat-fee placement — only after a creator proves a conversion rate** via the
   affiliate run. Now you can estimate ROI instead of guessing.

Target smaller/mid creators (10k–200k) — they convert far better than mega-influencers
for paid education: AI/dev YouTubers, AI newsletters, build-in-public X/LinkedIn accounts.

---

## Minting a code

```powershell
# one-time
stripe login

# 15% off first payment (default), LIVE:
cd app-next
./scripts/create-creator-code.ps1 -Code FIRESHIP -Live

# richer offer (e.g. a newsletter): 20% off first 3 months
./scripts/create-creator-code.ps1 -Code TLDRAI -PercentOff 20 -Months 3 -Live
```

Keep the code recognizable (creator name) so reporting stays legible. Run once per
creator — re-running with the same code is a safe no-op.

---

## Tracking redemptions & reconciling commission

- **Per-creator redemptions:** Stripe Dashboard → Product catalog → Coupons →
  `Creator: <CODE>` → redemptions list (shows customer + date).
- **Revenue per creator:** cross-reference those customers' subscriptions, or filter
  Payments by the coupon. For rev-share, commission = 35% × their members' first-year
  paid revenue.
- **Funnel context:** the site-wide `checkout_started` / `subscribed` analytics events
  (Vercel Analytics) tell you overall conversion; the Stripe coupon tells you the
  per-creator slice. Together they rank creators by real conversion rate.

Log every creator here so you can reconcile what you owe:

| Creator | Platform / size | Code | Offer | Deal | Date live | Redemptions | Paid members | Commission owed | Paid out |
|---|---|---|---|---|---|---|---|---|---|
| _example_ | YouTube 40k | FIRESHIP | 15% off first payment | 35% first-year | — | 0 | 0 | $0 | — |

---

## Rules of thumb

- **Don't pay flat fees until conversion is proven.** Affiliate is the audition.
- **One code per creator, always** — shared codes destroy attribution.
- **Re-book winners, cut duds** after each round using the table above.
- A creator code and the Founding Member code (`FOUNDING40`) can't stack — Stripe
  applies one promotion code per checkout. That's fine: each is its own funnel.
