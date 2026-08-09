# Standard payouts — European Union (SEPA)

**Operations doc — last reviewed 2026-07-30**

Applies to accounts whose legal entity is registered in an eligible SEPA country and whose
payout destination is a SEPA IBAN. US-domiciled accounts follow the US ACH payout doc.

## Schedule

Settled balance pays out on **T+1 business day** — one business day faster than the US ACH
schedule. The daily cutoff is **15:00 Europe/Amsterdam**. Charges captured after the cutoff
join the next business day's batch.

Business days follow the TARGET2 calendar, which is not the same as any single national
holiday calendar: TARGET2 closes on 1 January, Good Friday, Easter Monday, 1 May, 25
December, and 26 December. The minimum payout amount is **EUR 1.00**.

## Rails

Payouts are sent as **SEPA Credit Transfer** only. Meridian does **not** send payouts over
SEPA Instant Credit Transfer, so a payout initiated on a Friday afternoon arrives on the next
TARGET2 business day, not over the weekend.

**Instant Payouts are not available for EU-domiciled accounts.** The Instant Payouts product
is US-only and runs on domestic debit-card rails that have no SEPA equivalent. There is no
same-day payout option in the EU.

## IBAN requirements

The IBAN must belong to the verified legal entity and must be held in an eligible SEPA
country. Third-party IBANs are rejected at verification, not at payout time. A name mismatch
between the IBAN holder and the registered entity is the most common EU payout rejection.

## First payout hold

The **7 calendar day** hold on an account's first payout after its first successful charge
applies in the EU exactly as it does in the US.
