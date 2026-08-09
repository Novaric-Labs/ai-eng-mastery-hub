# Meridian Core API (v2)

**Product doc — last reviewed 2026-07-02**

Base URL: `https://api.meridianpay.example/v2`

## Authentication

Bearer authentication with a secret key: `Authorization: Bearer sk_live_...`. Test mode uses
`sk_test_...` keys against the same base URL; test-mode objects are fully isolated and never
settle. Secret keys are shown once at creation and can be rolled from the dashboard.

## Versioning

Each account has a default API version pinned at signup. Override per request with the
`Meridian-Version` header, for example `Meridian-Version: 2026-06-01`. Breaking changes ship
only in a new dated version. Deprecated versions get **12 months** of notice and carry a
`Meridian-Sunset` response header for the whole notice period.

## Idempotency

Send an `Idempotency-Key` header (UUIDv4) on every POST. Meridian stores the first response
for that key for **24 hours** and replays it byte-for-byte on retry, so a client timeout can
never double-charge a buyer. Reusing a key with a different request body returns a
`400 idempotency_key_reuse` error. Keys expire after 24 hours and may then be reused.

## Rate limits

**100 requests/second** sustained per account, with a burst allowance of **200**. Exceeding
the limit returns `429 rate_limit_exceeded` with a `Retry-After` header in seconds. Retry
with exponential backoff and jitter; do not retry tighter than `Retry-After`.

## Pagination and errors

List endpoints are cursor-paginated: `limit` (max **100**), `starting_after`, `ending_before`.
Errors return a typed object with `type`, `code`, `message`, `param`, and `doc_url`. Branch
on `code`, never on `message` — messages are not part of the stable contract.
