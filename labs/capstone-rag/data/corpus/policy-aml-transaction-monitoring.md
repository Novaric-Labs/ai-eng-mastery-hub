# AML and transaction monitoring policy

**Policy — internal and merchant-facing summary — effective 2026-06-15**

## Ongoing screening

All account owners, control persons, and legal entities are re-screened against OFAC, EU, and
UK sanctions lists **daily**. A confirmed match freezes the account and its balance
immediately.

## Monitoring rules

Automated rules raise a Risk Ops alert when:

- **Velocity:** an account processes more than **USD 50,000 in 24 hours** while on the Starter
  tier, or more than **3x its trailing 30-day daily average** on any tier.
- **Card testing:** more than **50 declines in 10 minutes** from a single IP address or a
  single card BIN.
- **Structuring:** repeated charges just under a reporting or review threshold.
- **Geography:** charges or payouts touching a high-risk jurisdiction on the FATF list.

Risk Ops triages every alert within **1 business day**.

## Account review status

An account under investigation is moved to `review`. In this state charges may continue, but
**payouts are paused** and the balance is held. Reviews are resolved by Risk Ops, never by
front-line support.

## Tipping-off is prohibited

Staff must **not** tell a merchant that their account is under investigation, that a Suspicious
Activity Report has been filed or is being considered, or that a specific transaction
triggered an alert. This is a legal prohibition, not a customer service preference. The only
approved wording is that the account is under review, that no further detail is available, and
that Risk Ops will make contact if information is needed. Do not speculate about timelines.

SARs are filed by Meridian's BSA officer. Merchants are never copied.

## Reserves

Accounts with elevated risk may be placed on a **rolling reserve of 5% held for 90 days**.
Reserves are reviewed quarterly and released when the risk profile improves.
