# KYC / KYB onboarding policy

**Policy — effective 2026-06-15**

Every Meridian account must be verified before it can receive money. Connect connected
accounts are verified individually; a platform's verification never carries over to a seller.

## Information collected

Legal entity name, registration number, registered address, merchant category code (MCC),
statement descriptor, and settlement bank details. For each **beneficial owner holding 25% or
more** of the entity, plus **one control person** (an officer or director with signing
authority), Meridian collects name, date of birth, residential address, a government ID
document, and a tax identifier.

## Verification timing

Automated verification clears most accounts in **under 1 business day**. Accounts routed to
manual review — mismatched registry data, high-risk MCC, non-standard ownership structures —
take up to **3 business days**.

## Processing before verification completes

An account may be enabled for charges while verification is pending. In that state it is
`charges_enabled / payouts_disabled`: the merchant can take payments, but **no payout is
released and a USD 5,000 cumulative processing cap applies** until verification clears. Once
verified, held funds are released on the normal payout schedule — subject to the 7-calendar-day
first payout hold described in the payout docs.

## Screening

Every owner, control person, and legal entity is screened against OFAC, EU, and UK sanctions
lists at onboarding, and re-screened daily thereafter. A screening hit suspends the account
pending review.

## Prohibited businesses

Meridian does not onboard unlicensed money services, illegal goods, adult content, gambling
without a licence in the operating jurisdiction, multi-level marketing, or shell entities with
no verifiable operations.

## Ongoing obligations

Merchants must report a change in beneficial ownership within **30 days**. Meridian re-verifies
the account and may pause payouts until the new owner clears screening.
