# Connect (platform) pricing — effective 2026-07-01

**Pricing sheet — marketplaces and platforms using connected accounts**

Connect pricing is **additive**: the platform pays normal Core card processing on every
charge, plus the Connect fees below. Core rates are billed at the **platform's** tier, not
the connected account's.

## Connect fees

| Item | Fee |
|---|---|
| Platform routing fee, per charge routed to a connected account | **0.4% of the charge** |
| Active connected account, per month | **USD 2.00** |
| Payout to a US connected account | **USD 0.25** |
| Payout to an EU connected account | **USD 0.35** |
| Cross-border payout FX markup | **2.0%** (see FX pricing sheet) |

An account counts as *active* in a calendar month if it processed at least one charge in that
month. Accounts that are onboarded but idle are free.

## Worked example

A Scale-tier platform takes a USD 100.00 card charge on behalf of a US seller and pays the
seller out the same week:

- Core processing (Scale, 2.3% + USD 0.20) = **USD 2.50**
- Connect routing fee (0.4%) = **USD 0.40**
- Seller payout (US) = **USD 0.25**
- Plus USD 2.00 for that seller's active-account fee that month

Total transaction cost: **USD 3.15**, plus the monthly per-seller and platform subscription
fees.

## Negative balances

If a connected account's balance cannot cover a refund, dispute, or dispute fee, Meridian
recovers the amount from the platform's balance, then from the platform's bank account by
ACH debit. Platforms should hold their own reserve against sellers with elevated dispute
rates.

## Billing

Connect fees are aggregated and invoiced monthly against the platform account, not deducted
per transaction.
