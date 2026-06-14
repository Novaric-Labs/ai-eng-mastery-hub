# AI Engineering Mastery Hub

A self-paced course app, now packaged as a deployable product with login,
one-time purchase, and tester access codes.

## Layout
```
AI_ENG_1_v6.HTM     The app (rendering engine + content + UX). Source of truth
                    for both the content and the UI.
content/
  content.json      Course content extracted from the app (regen: extract.mjs)
  extract.mjs       Pull content out of the HTML into content.json
  seed.mjs          Split content into public-preview vs paid -> supabase/seed.sql
supabase/
  migrations/0001_init.sql   Tables + Row-Level Security + redeem function
  seed.sql                   Content rows (generated; safe to re-run)
  functions/create-checkout  Stripe Checkout session (one-time purchase)
  functions/stripe-webhook   Payment -> grants entitlement
web/
  build.mjs         Strips content out of the app, assembles index.html
  index.html        DEPLOYABLE front-end (content fetched after login; gated)
  boot.js           Auth (magic link + Google) + paywall + progress sync
  config.example.js Copy to config.js, add your Supabase keys (gitignored)
docs/DEPLOY.md      Step-by-step: Supabase + Stripe + Vercel, test cards, codes
```

## How it works (hard paywall)
- `web/index.html` ships **without** the paid content — it's pulled from Supabase
  after login, and Row-Level Security only returns paid rows to entitled users.
  Free preview (Start Here, glossary, plain-English intros, the LLM sample
  module) is public for conversion.
- Access is granted by a **Stripe purchase** (webhook flips an entitlement) or a
  **direct unlock code** (`redeem_access_code` RPC). Stripe promotion codes also
  work at checkout.
- Per-user progress lives in the `progress` table (syncs across devices), with
  `localStorage` kept as an offline cache.

## Rebuild after editing content or UI
```
node content/extract.mjs && node content/seed.mjs   # refresh content + seed.sql
node web/build.mjs                                   # rebuild web/index.html
```

## Deploy
See **docs/DEPLOY.md**. You run it once with your own Supabase/Stripe/Vercel
accounts; the code here is everything else.
