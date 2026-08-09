# PCI DSS scope and merchant responsibilities

**Compliance doc — last reviewed 2026-05-20**

Meridian Pay is assessed annually as a **PCI DSS v4.0.1 Level 1 service provider**. The
current Attestation of Compliance (AOC) and a Report on Compliance summary are available to
merchants in the Trust Center in the dashboard. This document covers PCI DSS only; other
assurance programmes are out of scope here.

## Which SAQ applies to a merchant

| Integration | Merchant SAQ |
|---|---|
| Hosted Checkout (redirect or iframe) | **SAQ A** |
| Vault.js hosted fields | **SAQ A** |
| Core API with raw PAN posted to merchant servers | **SAQ D** |

The dividing line is simple: if a PAN ever touches merchant infrastructure, the merchant is in
SAQ D scope and inherits the full control set, including quarterly ASV scans by an Approved
Scanning Vendor and annual penetration testing. Almost every merchant should choose an SAQ A
integration.

## Merchant levels

Merchant validation level is set by annual card transaction volume, not by Meridian: above
**6 million** transactions a year a merchant is Level 1 and needs an onsite assessment and a
ROC. Below that, self-assessment questionnaires are sufficient.

## Technical requirements Meridian enforces

- **TLS 1.2 minimum** on all API and webhook connections; TLS 1.3 preferred. TLS 1.0 and 1.1
  are refused at the edge.
- The API **never returns a PAN**. Responses expose `last4`, `brand`, expiry, and a
  `fingerprint` only.
- Signing secrets and API keys must never be embedded in client-side code or mobile binaries.

## Getting evidence for your own audit

Download the AOC from the Trust Center, plus the responsibility matrix mapping each PCI
requirement to Meridian, to the merchant, or to both. Enterprise accounts can request a
completed security questionnaire through their technical account manager.
