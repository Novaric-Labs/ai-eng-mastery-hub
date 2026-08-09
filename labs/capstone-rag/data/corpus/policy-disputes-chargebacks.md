# Disputes and chargebacks policy

**Policy — effective 2026-05-01**

A dispute (chargeback) is opened by the cardholder's issuing bank. Meridian has no ability to
stop one being filed.

## What happens immediately

The disputed amount **and** the USD 15.00 dispute fee are withdrawn from the merchant's
balance the moment the dispute is created. The merchant is notified by the `dispute.created`
webhook and by email. If the merchant wins, the amount and the fee are both returned. If the
merchant loses, both are kept.

## Evidence deadline

The merchant has **5 calendar days from notification** to submit evidence. Scale and
Enterprise accounts may request **one 3-calendar-day extension** through support, and the
request must be made *before* the original deadline expires — there are no retroactive
extensions, and Starter and Growth accounts are not eligible for one.

If no evidence is submitted by the deadline, the dispute is **automatically accepted** on the
merchant's behalf and counts as a loss. Meridian forwards submitted evidence to the card
network within **7 calendar days**. The network's decision typically takes **60 to 75 days**
and is final; there is no second appeal on this product.

## Refunds and disputes do not mix

Once a dispute is open on a charge, that charge **cannot be refunded**. The only paths are to
submit evidence or to accept the dispute. Refunding a disputed charge outside Meridian (for
example by bank transfer) risks the cardholder being paid twice.

## Retrieval requests

A retrieval request (pre-dispute inquiry) is not a dispute. No funds move, no fee is charged,
and the response window is **10 calendar days**. Answering one well often prevents a dispute.

## Dispute rate thresholds

Above a **0.9%** monthly dispute rate an account enters a network monitoring programme and
Meridian may impose a rolling reserve. Above **1.5%**, Meridian may suspend processing or
close the account.
