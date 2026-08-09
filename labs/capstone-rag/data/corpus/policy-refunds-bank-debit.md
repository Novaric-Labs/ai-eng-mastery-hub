# Refund policy — bank debit (ACH debit)

**Policy — effective 2026-05-01**

Applies to US bank debit charges. Card refunds are governed by a separate, more permissive
policy — do not apply the card rules here.

## Settlement must complete first

An ACH debit charge is **not final for 3 business days** after submission. A refund cannot be
issued during that window; the API returns `charge_not_settled`. If the customer needs the
money back before settlement completes, cancel the charge instead of refunding it.

## Window and partials

A settled bank debit charge can be refunded for up to **60 calendar days** — half the card
window. **Partial refunds are not supported on bank debit.** The only option is a full refund
of the original amount. Merchants who need to return part of a bank debit payment must refund
in full and re-charge the correct amount.

## Returns

The receiving bank can return an ACH debit after settlement. The common return codes are:

- **R01** — insufficient funds
- **R02** — account closed
- **R10** — customer says the debit was unauthorised
- **R29** — corporate customer not authorised

Each return costs the merchant **USD 2.50** (see the Core pricing sheet) and reverses the
charge.

## Unauthorised returns

R10 is effectively a dispute. A **consumer** account holder can raise one for up to **60
calendar days** after settlement. A **corporate** account holder has only **2 business days**.
Unauthorised returns count toward the account's dispute rate and are handled under the
disputes and chargebacks policy, with the same evidence deadlines.

Repeated R01 returns on the same customer trigger automatic bank debit suspension for that
customer after three failures in 30 days.
