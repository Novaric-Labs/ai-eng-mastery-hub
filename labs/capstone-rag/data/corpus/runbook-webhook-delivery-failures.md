# Runbook: webhook delivery failures

**Support runbook — owner: Developer Support — last reviewed 2026-07-22**

## Symptom triage

Pull the endpoint's delivery log first. The failure mode is usually visible in the response
code alone.

**Timeouts (no status recorded).** The endpoint did not answer within the v2 budget of 10
seconds. The fix is almost always architectural: acknowledge with 200 immediately, enqueue,
process asynchronously. Merchants doing database writes or third-party calls inline will keep
timing out under load no matter how many retries we send.

**401/403 from the merchant's own verification code.** Signature verification is failing.
Check three things in order:

1. Are they verifying the **raw request body**? Re-serialising the JSON changes the bytes and
   invalidates the HMAC. This is the most common cause by a wide margin.
2. Is their **clock** within the 5-minute tolerance? Container hosts with drifting clocks
   produce intermittent, load-independent failures.
3. Did they recently migrate from v1 and leave **HMAC-SHA1** verification in place against the
   `Meridian-Signature` header? v2 is HMAC-SHA256 over `"{t}.{body}"`. See the v1 deprecation
   doc for the full migration list.

**5xx from the endpoint.** Merchant-side error. Confirm the retry schedule with them: up to 21
attempts over 72 hours, and the endpoint is disabled automatically after 72 hours of
continuous failure.

## Recovery

Re-enable the disabled endpoint in the dashboard, then replay the missed events. Replay is
available for **30 days**; anything older must be backfilled from the API by listing the
objects directly.

## What not to promise

Never tell a merchant that deliveries are ordered or exactly-once. Delivery is at-least-once
and unordered by design; if their system breaks on a duplicate, the bug is missing
deduplication on the event `id`.
