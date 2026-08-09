# Instant Payouts (United States only)

**Product doc — last reviewed 2026-07-18**

Instant Payouts move the available balance to an eligible US debit card in **under 30 minutes**
in the typical case, including weekends and US bank holidays. They run on domestic
debit-card push rails, not ACH.

## Availability

- **United States only.** Instant Payouts are not offered in the EU or the UK; there is no
  SEPA equivalent and no plan to add one. EU accounts use the T+1 SEPA schedule.
- **Growth, Scale, and Enterprise tiers only.** Starter accounts must use standard payouts.
- **Not available to Connect connected accounts**, in any country or tier.

## Eligibility

An account must have at least **30 days** of processing history, a dispute rate below
**0.9%**, no open risk review, and an eligible US debit card on file. Bank accounts alone
cannot receive an instant payout — the destination must be a debit card that supports push
payments. Roughly 5% of US debit cards do not.

## Fee

**1.25% of the payout amount, minimum USD 0.50**, deducted from the payout itself. Standard
ACH payouts remain free on all tiers, so the fee is the entire cost of choosing speed. The
fee is charged even if the payout later fails and is refunded only when the failure is
Meridian's fault.

## Limits

- **USD 25,000** maximum per individual payout.
- **USD 100,000** maximum per rolling 24-hour window across all instant payouts.

Requests above either limit are rejected with `amount_too_large`; split them or fall back to a
standard payout. Limits are not raised on request below the Enterprise tier.

## Interaction with the first payout hold

Instant Payouts do not bypass the 7-calendar-day hold on an account's first payout.
