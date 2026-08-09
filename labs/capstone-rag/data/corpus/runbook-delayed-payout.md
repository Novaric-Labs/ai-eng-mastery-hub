# Runbook: merchant reports a delayed payout

**Support runbook — owner: Payments Ops — last reviewed 2026-07-25**

Work these checks in order. Do not promise an arrival date at any point.

## 1. Confirm what the payout object says

Look up the payout. If it is `in_transit` and its expected arrival date has not passed, there
is nothing wrong — ACH and SEPA give no intraday visibility. Explain the schedule from the
relevant regional payout doc and close.

## 2. Check the first payout hold

Is this the account's first payout? Every new account holds its first payout for **7 calendar
days** after its first successful charge. Support cannot waive it. This is the single most
common cause of "my payout is missing" in the first week.

## 3. Check verification state

If the account is `charges_enabled / payouts_disabled`, KYC/KYB is incomplete and payouts are
blocked with a USD 5,000 processing cap. Point the merchant at the outstanding verification
item in the dashboard.

## 4. Check for a bank return

A `failed` payout with a return code means the receiving bank rejected the credit. Meridian
retries once on the next business day; a second failure pauses payouts until bank details are
corrected. The money is on the Meridian balance, not lost.

## 5. Check the cutoff and the calendar

Confirm the charge was captured before the regional cutoff and that no bank holiday
intervened. The US and EU calendars differ — use the correct regional payout doc.

## 6. Risk review — handle with care

If the account is in `review`, **do not tell the merchant they are under investigation** and do
not speculate about cause or timeline. Use the approved wording in the AML policy: the account
is under review, no further detail is available, Risk Ops will make contact if needed.
Escalate to Risk Ops; never to the merchant.

## Escalation

Payout `in_transit` for more than **2 business days** past its expected arrival date goes to
Treasury with the payout ID and the destination bank's return history.
