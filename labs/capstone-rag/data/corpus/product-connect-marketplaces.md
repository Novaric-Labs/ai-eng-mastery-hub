# Meridian Connect (marketplaces and platforms)

**Product doc — last reviewed 2026-07-09**

Meridian Connect lets a platform onboard sellers, split each payment, and pay sellers out.
Sellers are modelled as **connected accounts** under the platform's account.

## Onboarding connected accounts

Every connected account completes its own KYC/KYB verification — the platform's verification
does not carry over. The platform may collect the data itself through the Connect API or hand
the seller a Meridian-hosted onboarding link. Until a connected account is verified it runs in
`charges_enabled / payouts_disabled` state, exactly as described in the KYC/KYB onboarding
policy.

## Splitting a payment

Create the charge on the connected account and set `application_fee_amount` to the platform's
cut. Meridian settles the remainder to the connected account's balance. Processing fees for
the charge are billed at the **platform's** Core pricing tier, not the seller's.

## Payouts to connected accounts

Payout schedules are configured per connected account (daily, weekly, or manual). Standard
rails apply: US connected accounts follow the T+2 ACH schedule, EU connected accounts follow
the T+1 SEPA schedule.

**Instant Payouts are not available to connected accounts**, in any country. Platforms that
need faster seller funding should use a daily automatic schedule.

## Coverage

Connected accounts are supported in the US and in 12 SEPA countries. Cross-border payouts
(platform settling in one currency, seller receiving another) carry the Connect FX markup —
see the FX and cross-border pricing doc.

## Liability

The platform is financially liable for its connected accounts: disputes, refunds, and
negative balances are recovered from the platform if the seller's balance cannot cover them.
If a connected account's dispute rate exceeds **0.9%**, Meridian may raise the platform's
rolling reserve.
