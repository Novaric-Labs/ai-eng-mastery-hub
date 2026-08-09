# Webhooks (v1) — DEPRECATED

**Legacy doc — v1 webhooks sunset on 2026-12-31**

This document describes the original webhook system. It is retained for merchants still
migrating. **Do not build new integrations against v1.** After 2026-12-31 no v1 deliveries
will be sent, and endpoints still configured for v1 will silently stop receiving events.

## v1 signature verification

Deliveries carry an `X-Meridian-Sig-V1` header containing an **HMAC-SHA1** digest of the raw
body, keyed with the endpoint secret. There is no timestamp inside the signature; v1 sends the
delivery time in a separate `X-Meridian-Timestamp` header, and the accepted clock skew is
**15 minutes**.

## v1 delivery and retries

The v1 endpoint timeout is **5 seconds**. A failed delivery is retried up to **8 attempts over
24 hours**, doubling from 60 seconds. There is no replay: events that exhaust their retries in
v1 are lost, which is the single most common reason merchants migrate.

## Migrating to v2

1. Switch verification to `Meridian-Signature` and HMAC-SHA256 over `"{t}.{body}"`, with a
   5-minute tolerance. Verify the raw bytes.
2. Raise your endpoint's response budget from 5 to 10 seconds — v2 waits longer before
   counting a delivery as failed.
3. Remap event names. v1 used `payment_success`, `payment_failed`, `refund_created`,
   `chargeback_opened`, `payout_sent`. The v2 equivalents are `charge.succeeded`,
   `charge.failed`, `refund.succeeded`, `dispute.created`, and `payout.paid`.
4. Deduplicate on the event `id`. v1 claimed ordered delivery; v2 makes no ordering promise
   and is explicitly at-least-once.

Run both endpoints in parallel for one billing cycle, compare volumes, then disable v1.
