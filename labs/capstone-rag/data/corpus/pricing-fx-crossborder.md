# FX and cross-border pricing — effective 2026-07-01

**Pricing sheet — currency conversion**

Meridian supports charging buyers in **40 presentment currencies** and settling merchants in
**8 settlement currencies** (USD, EUR, GBP, CAD, AUD, JPY, SEK, CHF). Conversion happens
whenever the presentment currency differs from the account's settlement currency.

## Markups

| Conversion | Markup |
|---|---|
| Core: presentment currency → merchant settlement currency | **1.5%** |
| Connect: platform settlement currency → connected account payout currency | **2.0%** |

The markup is applied on top of a daily reference rate sourced from our banking partner at
**06:00 UTC**. The rate published in the dashboard each morning is the rate you will get for
that day's settlement.

## When the rate is locked

This is the single most misread part of our pricing. **The FX rate is applied at settlement,
not at authorisation.** A charge authorised on Monday evening and settled on Tuesday morning
converts at Tuesday's reference rate. On volatile days this is the usual explanation for a
settlement total that does not match a merchant's own ledger, because most merchant systems
book revenue at authorisation time.

Refunds convert at the rate in force on the **refund** date, not the original charge date, so
a full refund of a cross-currency charge rarely nets to exactly zero in the settlement
currency. The difference is FX movement, not a Meridian fee, and it is reported separately in
the settlement file as `fx_adjustment`.

## Multi-currency balances

Accounts on Scale and Enterprise can hold balances in more than one settlement currency and
pay out each to a matching local bank account, which avoids conversion entirely. Starter and
Growth accounts hold a single settlement currency.

Disputes on cross-currency charges are debited at the dispute date's rate; the USD 15.00
dispute fee is always billed in the settlement currency at that day's rate.
