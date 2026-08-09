# Webhooks (v2)

**Product doc — last reviewed 2026-07-21**

## Signature verification

Every delivery carries a `Meridian-Signature` header:

```
Meridian-Signature: t=1754697600,v1=5f2c...9ab
```

`v1` is an **HMAC-SHA256** of the string `"{t}.{raw_request_body}"`, keyed with the endpoint's
signing secret (`whsec_...`). Verify against the raw body — parsing and re-serialising the
JSON changes the bytes and breaks the signature. Reject any delivery whose timestamp `t` is
more than **5 minutes** from your clock.

## Delivery and retries

Your endpoint must return a 2xx status within **10 seconds**. Anything else counts as a
failure. Meridian retries a failed delivery up to **21 attempts over 72 hours** with
exponential backoff: 10s, 30s, 1m, 5m, 15m, 30m, then hourly for the remainder of the window.

After **72 hours** of continuous failure the endpoint is disabled automatically and the
account owner is emailed. Re-enable it in the dashboard, then replay the missed events —
deliveries are replayable for **30 days**.

Delivery is **at-least-once and unordered**. The same event can arrive twice, and
`charge.succeeded` can land before `checkout.session.completed`. Store the event `id` and
ignore duplicates; never assume ordering.

## Handling pattern

Acknowledge with 200 first, enqueue the work, process asynchronously. Doing real work inline
is the most common cause of timeout-driven retry storms.

## Event types

`checkout.session.completed`, `charge.succeeded`, `charge.failed`, `refund.succeeded`,
`dispute.created`, `dispute.closed`, `payout.paid`, `payout.failed`, `account.updated`.

Legacy v1 endpoints use a different header and hash — see the v1 deprecation doc.
