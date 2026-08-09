# FAQ: getting started with Meridian Pay

**Merchant-facing FAQ — last reviewed 2026-07-16**

**How long does approval take?**
Most accounts are verified automatically in under one business day. Accounts sent to manual
review take up to three business days. The KYC/KYB policy lists what triggers manual review.

**Can I take payments before verification finishes?**
Usually yes. New accounts can be switched on for charges while verification is pending, but
payouts stay disabled and there is a USD 5,000 cumulative processing cap until it clears.

**When do I get my first payout?**
Not immediately. Every new account's first payout is held for seven calendar days after its
first successful charge, on top of the normal regional schedule. This is not negotiable and
support cannot lift it.

**Which plan should I start on?**
Starter has no monthly fee and suits accounts under roughly USD 40,000 a month; above that the
lower percentage rate on Growth usually pays for the subscription. The pricing sheet has the
exact rates.

**Do I need to worry about PCI?**
If you use hosted Checkout or Vault.js, you are in SAQ A scope and there is very little to do.
If you post raw card numbers to your own servers you are in SAQ D scope, which is a
substantially larger programme.

**What do I need to build before going live?**
A webhook endpoint that verifies signatures and returns 200 within ten seconds, idempotency
keys on every POST, and a plan for handling declines. Build against test-mode keys first.

**Can I use my personal bank account for payouts?**
No. The payout account must belong to the verified legal entity. Third-party accounts are
rejected during verification.

**Do you support marketplaces?**
Yes, through Meridian Connect. Each seller is verified separately and platform pricing is
additive.
