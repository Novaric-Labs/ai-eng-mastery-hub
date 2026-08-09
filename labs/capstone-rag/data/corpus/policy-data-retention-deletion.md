# Data retention and deletion policy

**Policy — effective 2026-04-01**

## Retention schedule

| Data | Retained |
|---|---|
| Transaction and financial records | **7 years** after account closure |
| KYC/KYB verification records | 7 years after account closure |
| Support tickets and correspondence | 3 years |
| API request logs | **13 months** |
| Webhook delivery logs and payloads | **90 days** |
| Dashboard access and audit logs | 13 months |

Backups are rolling and are purged within **35 days**, so deleted records can persist in
backup for up to 35 days after erasure from primary storage.

## Deletion requests

Meridian acknowledges a data subject deletion request within **5 business days** and fulfils
it within **30 calendar days**. Merchants submit requests on behalf of their customers through
the dashboard or the API.

**Records covered by the 7-year financial recordkeeping obligation are not erased.** They are
*restricted*: removed from search, dashboards, and exports, and retained only to satisfy
anti-money-laundering and tax recordkeeping law. A customer who asks to be deleted will still
have their past transactions on file, and Meridian tells them so rather than claiming full
erasure. Directly identifying contact data (email, phone, shipping address) *is* erased on the
normal 30-day schedule.

## Card data

Merchants using hosted Checkout or Vault never store PANs, so there is nothing for them to
delete. Deleting a vault token invalidates it immediately; Meridian retains the token record
(not the PAN) under the transaction retention schedule.

## Residency

Accounts with an EU legal entity are processed and stored in the EU region. US accounts are
processed in the US region. Meridian offers a DPA with Standard Contractual Clauses for
transfers, available in the dashboard.
