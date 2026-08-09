# Meridian Vault (card storage and tokenization)

**Product doc — last reviewed 2026-06-28**

Meridian Vault stores cards for repeat billing. Merchants collect card details with Vault.js
(Meridian-hosted input fields) and receive a **vault token** (`pm_...`) that can be charged
later. The API never returns a PAN — only `last4`, `brand`, `exp_month`, `exp_year`, and a
stable `fingerprint` for deduplication.

## Vault tokens vs network tokens

These are two different things and the distinction matters:

- A **vault token** is a Meridian identifier for a stored card. It is what your code holds.
- A **network token** is issued by Visa, Mastercard, or Amex in place of the real card number.
  Vault requests one automatically wherever the issuer supports it.

When a network token backs a stored card, the card keeps working after the customer is
reissued a physical card — the network updates the token's underlying credentials without any
action from you or the customer. Cards without network token support fall back to the card
updater service, which refreshes expiry dates nightly. Merchants on network tokens see roughly
**1.4 percentage points** higher authorisation rates in our own portfolio data.

## Portability

A vault token is scoped to a single Meridian merchant account. It is not valid on another
merchant's account and cannot be handed to another processor as-is. To migrate stored cards
away from Meridian, open a card data export request in the dashboard: Meridian delivers the
PANs directly to a **PCI-attested** destination processor, never to the merchant, and the
request takes **7 business days** to fulfil.

## Compliance scope

Vault.js keeps the merchant in PCI DSS SAQ A scope, the same as hosted Checkout.
