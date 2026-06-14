# Deploy guide — AI Engineering Mastery Hub (login + purchase + tester codes)

This stands up the product: **Supabase** (auth + database + entitlements),
**Stripe** (one-time purchase), **Vercel** (hosts the front-end). Free tiers
cover early usage. Budget ~30–45 min the first time.

> You run these steps with your own accounts; the code is in this repo. Stripe
> keys etc. live in Supabase/Vercel as secrets — never commit them.

---

## 0. Prerequisites
- Accounts: [Supabase](https://supabase.com), [Stripe](https://stripe.com), [Vercel](https://vercel.com).
- Install the [Supabase CLI](https://supabase.com/docs/guides/cli): `npm i -g supabase` then `supabase login`.
- A custom domain is optional (Vercel gives you a free `*.vercel.app` URL to start).

---

## 1. Supabase: database + content
1. Create a new Supabase project. Note the **Project URL** and **anon key**
   (Settings → API), and the **service_role key** (keep this secret).
2. Link the CLI and apply the schema + content:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push                      # runs supabase/migrations/0001_init.sql
   psql "<your-db-connection-string>" -f supabase/seed.sql   # loads course content
   ```
   (DB connection string: Settings → Database → Connection string → URI.)
   To regenerate `seed.sql` after editing content: `node content/extract.mjs && node content/seed.mjs`.
3. Auth providers (Authentication → Providers):
   - **Email**: enabled by default — the front-end uses magic links (no
     passwords). Optionally turn off "Confirm email" for faster testing.
   - **Google**: enable it, then create an OAuth client in the
     [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     (OAuth consent screen + "Web application" credentials). Set the authorized
     redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`, then
     paste the Client ID + Secret into Supabase.
   - Add your site URL (step 5) under Authentication → URL Configuration
     (Site URL + Redirect URLs) so magic-link/Google redirects come back to your app.

✅ Check: in the SQL editor, `select tier, count(*) from content group by tier;`
should show **6 public, 42 paid**.

---

## 2. Stripe: the product
1. (Keep Stripe in **Test mode** until you've verified everything.)
2. Products → add a product, e.g. "AI Engineering Mastery Hub — Lifetime
   Access". Add a **one-time price** (set your number — start with a
   founder's price; you can change it later). Copy the **Price ID** (`price_…`).
3. Developers → API keys → copy the **Secret key** (`sk_test_…`).

---

## 3. Deploy the edge functions
```bash
# secrets the functions read (service_role stays server-side only):
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_PRICE_ID=price_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \   # filled in step 4; set a placeholder for now
  SITE_URL=https://your-site.vercel.app \
  SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...

supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt   # Stripe calls this, not a user
```

---

## 4. Stripe → webhook
1. Stripe → Developers → Webhooks → add endpoint:
   `https://<project-ref>.functions.supabase.co/stripe-webhook`
2. Event to send: **`checkout.session.completed`**.
3. Copy the endpoint's **Signing secret** (`whsec_…`) and update the secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

---

## 5. Front-end → Vercel
The deployable front-end is **`web/index.html`** — the study app with the course
content stripped out (it's fetched from Supabase after login) plus the auth +
paywall + progress-sync boot layer. It's a committed build artifact; regenerate
it any time with `node web/build.mjs` (re-run after editing the app or boot.js).

1. `cp web/config.example.js web/config.js` and fill in your **Supabase URL**,
   **anon (public) key**, and **functions base URL**
   (`https://<project-ref>.functions.supabase.co`). `config.js` is gitignored;
   in Vercel add these as the file or via an env-injected `config.js`.
2. Deploy: import the repo in Vercel with **root directory = `web/`** (it's a
   static site — no build command needed), or run `vercel --prod` from `web/`.
   Copy the resulting URL.
3. Put that URL into: the `SITE_URL` secret (step 3 — redeploy `create-checkout`),
   and Supabase Auth → URL Configuration (Site URL + Redirect URLs).

---

## 5b. Deploying the Next.js app (`app-next/`) — recommended front-end
The `app-next/` project is the framework version (server-gated content, SEO
marketing pages, login/purchase/admin in one repo). To deploy it instead of the
static `web/` build:
1. In Vercel, import the repo with **root directory = `app-next`**. Framework
   preset: Next.js (no extra build config).
2. Set env vars (Vercel → Settings → Environment Variables) from
   `app-next/.env.example`: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_SITE_URL` (your Vercel URL), and `ADMIN_EMAILS` (who can open `/admin`).
3. Point the Stripe webhook at **`https://<your-site>/api/stripe-webhook`** and
   the Supabase Auth redirect URLs at your Vercel domain + `/auth/callback`.
4. Local dev: `cd app-next && cp .env.example .env.local && npm install && npm run dev`.
   Forward Stripe events with `stripe listen --forward-to localhost:3000/api/stripe-webhook`.

Pages: `/` landing, `/pricing`, `/login` (magic link + Google), `/learn` (the
gated app — content fetched server-side per entitlement), `/admin` (generate
access codes; admins only).

## 6. Tester / access codes
Two independent mechanisms:

**A. Direct unlock codes** (no payment — best for testers). Either use the
**`/admin` page** in the Next.js app (sign in as an `ADMIN_EMAILS` user → fill the
form), or insert in the Supabase SQL editor:
```sql
insert into access_codes (code, max_redemptions, expires_at, note) values
  ('BETA-ALEX',   1,  now() + interval '30 days', 'Alex'),
  ('LAUNCH-2026', 50, now() + interval '14 days', 'launch cohort');
```
A tester signs up, opens the app, enters the code → instant access. Check usage:
`select code, redeemed_count, max_redemptions from access_codes;`

**B. Stripe promotion codes** (a free or discounted *checkout*). Stripe →
Products → Coupons → create a 100%-off coupon → add a promotion code (e.g.
`FREEBETA`). Testers click Buy and enter it at checkout. (`allow_promotion_codes`
is already on.)

---

## 7. End-to-end test (do this before going live)
1. Sign up as a new user → you should see the **free preview** (Start Here,
   glossary, the LLM sample module) but paid modules are locked.
2. Click **Buy** → Stripe Checkout → pay with test card `4242 4242 4242 4242`,
   any future expiry/CVC → redirected back → **paid content unlocks** (the
   webhook flipped your entitlement). Verify: `select * from entitlements;`.
3. New user + **Enter code** `LAUNCH-2026` → unlocks without paying.
4. Confirm progress syncs: complete a quiz, log in on another browser → progress
   is there.

When all four pass, switch Stripe to **Live mode**, swap the live keys/price/
webhook secret, redeploy the functions, and you're live.

---

## Ops cheatsheet
- **Refund / revoke access:** `update entitlements set active=false where user_id='…';`
- **Comp someone manually:** `insert into entitlements(user_id,source) values('<uid>','manual');`
- **Who bought:** `select * from entitlements where source='stripe' order by granted_at desc;`
- **Rotate content:** edit the HTML data (or `content.json`), rerun
  `content/seed.mjs`, re-apply `seed.sql` (it upserts).
- **Costs:** Supabase + Vercel free tiers are generous; Stripe takes ~2.9%+30¢
  per sale. No fixed monthly cost to start.
