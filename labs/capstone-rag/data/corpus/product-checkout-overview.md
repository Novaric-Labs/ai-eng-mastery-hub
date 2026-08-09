# Meridian Checkout

**Product doc — last reviewed 2026-07-14**

Meridian Checkout is our hosted payment page. The merchant creates a Checkout Session
server-side and redirects the buyer to it, or mounts it as an embedded modal on their own
domain. Card data is entered inside a Meridian-controlled iframe, so no primary account
number (PAN) ever reaches merchant infrastructure.

## Supported payment methods

- Cards (Visa, Mastercard, Amex, Discover)
- Bank debit (ACH debit) — US accounts only
- SEPA Direct Debit — EU accounts only
- Apple Pay and Google Pay (enabled by default; no extra fee)

## Session behaviour

A Checkout Session expires **24 hours** after creation. Expired sessions cannot be reused;
create a new one. Every session requires a `success_url` and a `cancel_url`. The page is
localised in 14 languages, selected from the buyer's `Accept-Language` header unless the
merchant pins `locale` explicitly.

Do not treat the redirect to `success_url` as proof of payment — buyers can close the tab.
Confirm on the `checkout.session.completed` webhook event instead (see the v2 webhooks doc).

## Strong Customer Authentication

For buyers whose card was issued in the EEA or the UK, Checkout applies 3-D Secure
automatically to satisfy PSD2 Strong Customer Authentication. Meridian attempts a
Transaction Risk Analysis exemption for eligible transactions up to **EUR 500**, which
suppresses the challenge screen when the issuer accepts it. US-issued cards are not subject
to SCA and are not challenged by default.

## Compliance scope

Because the merchant never handles PAN data, Checkout keeps the merchant in **PCI DSS
SAQ A** scope. See the PCI DSS scope doc for the full mapping, including the SAQ D case for
direct Core API card handling.
