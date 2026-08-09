# Refund policy — card payments

**Policy — effective 2026-05-01**

Applies to card charges only. Bank debit (ACH debit) refunds follow a different and stricter
policy — see the bank debit refund doc.

## Window

A card charge can be refunded for up to **120 calendar days** after the charge date. After
120 days the API returns `charge_too_old_to_refund` and the merchant must pay the customer
by another means.

## Partial refunds

Partial refunds are supported. A charge may be refunded in multiple parts up to the original
captured amount. A refund cannot itself be refunded or reversed once submitted — issue a new
charge if a refund was sent in error.

## Timing for the cardholder

Meridian releases the refund immediately, but the cardholder normally sees it in **5 to 10
business days**, controlled by the issuing bank. Refunds appear as a separate credit line on
the statement, not as a reversal of the original charge, which is a frequent source of "I was
charged twice" support contacts.

## Fees on refunds

The **fixed per-transaction fee is never returned**. The **percentage fee is returned only if
the refund is issued within 48 hours of the charge**. See the Core pricing sheet for the
per-tier rates these apply to.

## Funding a refund

Refunds are drawn from the merchant's available Meridian balance. If the balance is
insufficient, Meridian debits the linked bank account by ACH. A failed refund debit pauses
payouts until the negative balance is cleared.

## Disputed charges

A charge with an open dispute **cannot be refunded**. Submit evidence or accept the dispute
instead; see the disputes and chargebacks policy.
