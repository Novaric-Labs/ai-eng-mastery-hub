# Standard payouts — United States (ACH)

**Operations doc — last reviewed 2026-07-30**

Applies to accounts whose legal entity is registered in the United States and whose payout
destination is a US bank account. EU-domiciled accounts follow the SEPA payout doc.

## Schedule

Funds settle to the merchant's Meridian balance, then pay out on **T+2 business days**.
The daily cutoff is **17:00 America/New_York**. Charges captured after the cutoff belong to
the next business day's settlement batch and therefore pay out one business day later.

Business days follow the US Federal Reserve calendar. A payout that would land on a Federal
Reserve holiday moves to the next business day. The minimum payout amount is **USD 1.00**;
balances below that roll into the next batch.

## First payout hold

A new account's first payout is held for **7 calendar days** after its first successful
charge, regardless of tier. The hold runs once per account and is not removable by support.
It exists to cover early refund and dispute risk on an unproven account.

## Payout lifecycle

`pending` → `in_transit` → `paid`, or `failed`. Expect `in_transit` to last one to two
business days; the ACH network gives no intraday visibility, so a payout sitting in
`in_transit` is normal until its expected arrival date passes.

## Failed payouts

If the receiving bank returns the credit (closed account, wrong routing number, name
mismatch), the payout moves to `failed` and Meridian retries it **once** on the next business
day. A second failure pauses payouts on the account and raises a task for the merchant to
correct their bank details. The funds return to the Meridian balance; they are never lost.

Bank statements show the account's configured payout descriptor, defaulting to
`MERIDIAN PAYOUT`.
