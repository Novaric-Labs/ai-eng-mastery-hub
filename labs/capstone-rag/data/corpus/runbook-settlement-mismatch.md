# Runbook: settlement total does not match the merchant's ledger

**Support runbook — owner: Payments Ops — last reviewed 2026-07-28**

A merchant reports that yesterday's payout or settlement file does not equal the revenue
their own system booked. In almost every case the merchant's ledger is right about gross
sales and wrong about *when* and *how* money moved. Work the list before escalating.

## 1. Timing boundary

Charges captured after the regional cutoff belong to the next settlement batch. A merchant
comparing calendar days against settlement batches will always see a rolling discrepancy of
roughly one day's late-evening volume.

## 2. FX applied at settlement

Cross-currency charges convert at the **settlement date's** reference rate, not the
authorisation date's, and refunds convert at the refund date's rate. Merchants who book
revenue at authorisation will never reconcile to the cent. Look for the `fx_adjustment` line
in the settlement file; that is the whole gap. See the FX and cross-border pricing sheet.

## 3. Money that left mid-cycle

Check for items that debit the balance outside the sales flow:

- Disputes — the disputed amount **and** the USD 15.00 fee are withdrawn the moment the
  dispute opens, before any decision.
- Refunds issued after the cutoff, which land in the next batch.
- Instant Payout fees, which are deducted from the payout itself rather than billed
  separately, so the payout is smaller than the balance that funded it.
- Connect platform fees, which are invoiced monthly rather than netted per transaction — an
  easy double-count if the platform also subtracts them per charge.

## 4. Fees on refunded charges

The fixed per-transaction fee is never returned, and the percentage fee comes back only on
refunds issued within 48 hours. Merchants who assume a refund is fee-neutral will be short by
exactly the retained fees.

## Escalation

If the gap survives all of the above, send Payments Ops the settlement file ID, the merchant's
ledger export, and the date range. Do not adjust a balance manually.
