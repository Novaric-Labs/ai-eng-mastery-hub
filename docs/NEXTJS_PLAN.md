# Plan — Next.js rebuild (login + purchase + tester codes, server-gated content)

## Goal & why
Re-platform the study app onto **Next.js (App Router) + TypeScript on Vercel**,
keeping the **Supabase + Stripe backend already built**. The wins over the
vanilla single-file version:
- **Truly hard paywall:** module content is fetched + gated in a **Server
  Component**, so paid HTML is never serialized to a non-entitled browser.
- **SEO-able marketing/landing/pricing pages** (server-rendered) to actually sell.
- **Real routes** (`/learn/rag`) replacing the custom hash router — back button,
  deep links, and shareable URLs for free.
- **Component structure** instead of the fragile string-concat + override-layer
  rendering, so the app is maintainable as it grows.
- **One repo, one deploy:** Stripe edge functions become Next route handlers.

**Non-goals:** changing the curriculum/content, changing the data model
(reuse `20260101000000_init.sql`), or adding new product features beyond what exists.

## What's reused vs new
| Reused as-is | Ported / new |
|---|---|
| `supabase/migrations/20260101000000_init.sql` (tables, RLS, `redeem_access_code`, `grant_stripe_entitlement`) | Stripe edge fns → Next route handlers (`app/api/*`) |
| `content/content.json` + `extract.mjs` + `seed.mjs` (seeds the same `content` table) | The rendering engine → React components |
| Stripe checkout/webhook **logic** (near-identical code) | Custom hash router → App Router file routes |
| The CSS theme (`:root` vars + component styles) → `globals.css` | Auth wiring → `@supabase/ssr` (cookie sessions) |
| All UX behavior (quiz, Leitner cards, streak/XP, celebrations, paywall rules) | Progress: `localStorage` → React hook over Supabase |

## Architecture

```
                         ┌────────────────────────── Vercel (Next.js) ──────────────────────────┐
  Visitor ──► /  /pricing  (Server Components, SEO)                                              │
          ──► /login        signInWithOtp / signInWithOAuth(google) ─► Supabase Auth ─► cookies  │
          ──► /auth/callback  exchangeCodeForSession ─► redirect /learn                          │
          ──► /learn (Server layout)                                                             │
                 │  getUser() → if none, redirect /login                                         │
                 │  is_entitled() + select content (RLS, user-scoped)                            │
                 │     entitled?  → pass FULL content  ┐                                         │
                 │     not?       → pass PREVIEW only  ┘─► <LearnApp> (Client) renders UI,        │
                 │                                          locks paid modules, "Buy"/"Code"      │
          ──► POST /api/checkout      ─► Stripe Checkout (Node runtime) ─► redirect to Stripe    │
          ◄── POST /api/stripe-webhook ◄─ Stripe  ─► grant_stripe_entitlement (service role)     │
                         └───────────────────────────────────────────────────────────────────────┘
   Supabase: auth.users · content(RLS) · entitlements(RLS) · progress(RLS) · access_codes(RPC-only)
```

## Repo structure (new app, deploy root = repo root or `/app-next`)
```
app/
  layout.tsx                 root layout: theme class, global CSS, fonts
  page.tsx                   marketing landing (server, SEO metadata)
  pricing/page.tsx           pricing (server)
  login/page.tsx             email magic-link form + "Continue with Google"
  auth/callback/route.ts     exchangeCodeForSession → redirect /learn
  learn/
    layout.tsx               SERVER: session gate + entitlement + content fetch
    page.tsx                 dashboard (renders <LearnApp initial=…/>)
    [section]/page.tsx       optional deep routes (module/cards/scen/path/gloss)
  api/
    checkout/route.ts        POST → Stripe Checkout session (Node runtime)
    stripe-webhook/route.ts  POST → verify sig, grant entitlement (Node runtime)
components/
  LearnApp.tsx               client root: holds content + progress, renders views
  Sidebar.tsx Dashboard.tsx ModuleView.tsx SectionRail.tsx
  Quiz.tsx Flashcards.tsx Scenarios.tsx Glossary.tsx LearningPath.tsx StartHere.tsx
  Paywall.tsx Celebrate.tsx Streak.tsx ThemeToggle.tsx MobileDrawer.tsx
lib/
  supabase/server.ts client.ts middleware.ts
  entitlement.ts content.ts stripe.ts types.ts
  useProgress.ts             React hook: load/save progress via Supabase (+ local cache)
middleware.ts                refresh Supabase session cookie on each request
content/                     content.json + extract.mjs + seed.mjs  (reused)
supabase/migrations/20260101000000_init.sql                                   (reused, unchanged)
.env.example  next.config.ts  tsconfig.json  package.json
```

## Key implementation notes

**Auth (`@supabase/ssr`).** `lib/supabase/server.ts` = `createServerClient` bound
to `cookies()`; `lib/supabase/client.ts` = `createBrowserClient`; `middleware.ts`
calls `supabase.auth.getUser()` to refresh the cookie. Login page: magic link via
`signInWithOtp({ email, options:{ emailRedirectTo: '/auth/callback' }})` and Google
via `signInWithOAuth({ provider:'google', options:{ redirectTo:'/auth/callback' }})`.

**Server-gated content (the hard-paywall upgrade).** `app/learn/layout.tsx` is a
Server Component: `getUser()` (redirect to `/login` if absent), then with the
user-scoped server client `select('id,tier,data').from('content')` — RLS returns
public always + paid only if entitled — plus `rpc('is_entitled')`. It hydrates the
same shape `LearnApp` expects. **Paid rows are fetched server-side and only sent to
entitled clients;** non-entitled clients receive preview rows only, so the content
is never in their page source.

**Stripe as route handlers** (`app/api/checkout`, `app/api/stripe-webhook`),
`export const runtime = 'nodejs'` (raw body + signature verification need Node).
Logic is a direct port of the two edge functions already written; the webhook uses
a service-role client to call `grant_stripe_entitlement`. Configure the Stripe
webhook endpoint to `https://<site>/api/stripe-webhook`.

**Access codes:** client calls `supabase.rpc('redeem_access_code', { p_code })`
directly (the function is `SECURITY DEFINER`, RLS-safe) — no API route needed.
Stripe promotion codes still work via `allow_promotion_codes` at checkout.

**Progress:** `useProgress` loads the user's `progress.state` on mount and
debounce-upserts on change (RLS own-row), with `localStorage` as an offline cache —
same semantics as the vanilla build, expressed as React state.

**Routing/state:** App Router owns top-level navigation (`/learn`, `/learn/rag`,
`/learn/cards`…). Inside, a lightweight store (Zustand) holds `content`, `entitled`,
and `progress`; component tree replaces the render-string functions. Keep the
existing CSS verbatim in `globals.css` (it's already themed via CSS vars) — no
Tailwind rewrite.

## Component port mapping (1:1 with today's engine)
- `renderSide` → `Sidebar` (+ `Streak`, `ThemeToggle`, `MobileDrawer`)
- `renderDash` → `Dashboard` (streak/XP hero, blocks, "how to use")
- `renderMod` (+ tabs, depth sections, wayfinding rail) → `ModuleView` + `SectionRail`
- `renderQuiz`/quiz engine → `Quiz` (keyboard, running score, results+review)
- flashcards (`renderCards`, Leitner, flip, keyboard, summary) → `Flashcards`
- `renderScen` (answer box, reveal, self-grade) → `Scenarios`
- `renderGloss` (search) → `Glossary`; learning path → `LearningPath`; `renderStart` → `StartHere`
- paywall gating → `Paywall` + per-view `entitled` checks
- celebrations/confetti/toast → `Celebrate` (respect `prefers-reduced-motion`)

## Phases
- **P0 — product shell (no course UI yet):** Next scaffold, `@supabase/ssr` auth
  (magic link + Google), middleware, marketing + pricing + login pages, Stripe
  checkout+webhook route handlers, access-code redemption, `/learn` server gate
  rendering a placeholder. *Outcome: you can sign up, pay, redeem a code, and the
  server correctly gates access.*
- **P1 — port the learning app:** Dashboard, ModuleView, Quiz/Exam, Flashcards,
  Scenarios, Glossary, Path, StartHere as components; `useProgress` over Supabase;
  paywall locks. *Outcome: full feature parity with the vanilla app.*
- **P2 — polish:** SSR content gating verified, SEO metadata + `sitemap.ts` +
  OpenGraph on marketing pages, light/dark theme, analytics, error/empty states.

## Env vars (`.env.example`)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`.

## Cutover from the vanilla build
Same Supabase project and Stripe product — only the front-end host changes. Point
the Stripe webhook to `/api/stripe-webhook`, update Supabase Auth redirect URLs to
the Next site, and deploy. The `content` table, RLS, and entitlements are untouched,
so existing testers/buyers keep access. The vanilla `web/index.html` can stay live
until the Next app reaches parity (P1), then flip DNS.

## Verification
- **Local:** `npm run dev`, sign in (magic link prints to the Supabase logs / inbox),
  Google OAuth, redeem a seeded code, buy with Stripe test card `4242…` (use
  `stripe listen --forward-to localhost:3000/api/stripe-webhook`).
- **Paywall:** view page source as a non-entitled user → **no paid content present**
  (the server-gate win); entitled user → full content.
- **RLS:** unchanged from the validated `20260101000000_init.sql` (already tested on Postgres).
- **SEO:** landing/pricing return server HTML with metadata (curl the routes).

## Risks / calls
- The port is the bulk of the effort (P1). Mitigation: content/data already
  separated (`content.json`), and the component mapping is 1:1 with existing logic.
- Stripe webhook must run on the Node runtime (not Edge) — specified above.
- Keep one source of truth for content: `content.json` → DB seed; don't fork copies.
