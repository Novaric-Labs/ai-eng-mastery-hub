# Novacademy Affiliate Program

The formal, scalable version of the creator channel. `creator-affiliate-playbook.md`
covers the **manual** way to run a handful of creators (hand-minted Stripe promo codes
+ a reconciliation table). This doc is what the 90-day plan calls "formalize a
Scrimbassador-style program": a public, self-serve program with proper tracking, a
generous recurring payout, and a recruiting engine — so the channel scales past ~5
creators without becoming a spreadsheet chore.

**Companion docs:** `marketing-plan.md` (8-week GTM), `90-day-growth-plan.md` (the
quarter), `creator-affiliate-playbook.md` (the manual fallback, still valid for
one-off white-glove deals).

**Single source of truth for the terms:** `app-next/lib/affiliate.ts` — the
`/affiliates` page reads from it, so changing a number there updates the site. Keep
this doc in sync with that file.

---

## 1. The terms (what we offer)

| Lever | Value | Why |
|---|---|---|
| **Commission** | **30% recurring, for 12 months** per referred member | Beats every incumbent (most cap at first month). Scrimba's exact model. At ~$20/mo effective revenue that's **up to ~$72 per member** — generous enough to win a creator's priority, still profitable on lifetime value. |
| **Learner discount** | **15% off** via the affiliate's code | The discount *is* the call-to-action in their content — it gives the audience a reason to click now. |
| **Partner tier** | **up to 40%** or a flat placement fee | Invite-only, for creators who prove they convert. The "raise" that re-books winners. |
| **Cookie window** | **60 days** | Generous attribution so a creator still gets credit when someone subscribes a few weeks after watching. |
| **Cost to join** | Free, no cap on earnings | Zero-CAC distribution: we only pay when we get paid. |

**Stacking:** an affiliate's code and the Founding code (`FOUNDING40`) can't combine —
Stripe applies one promotion code per checkout. That's fine; each is its own funnel.

---

## 2. Tooling — Tolt (Stripe-native attribution)

The manual playbook's weakness: Stripe promo codes track *discount redemptions*, not
*clicks*, don't compute recurring commission over time, and give affiliates **no
dashboard**. Affiliates don't promote hard when they can't see what they're earning.

**[Tolt](https://tolt.io)** (~$29/mo) fixes all three. It plugs into our existing
Stripe subscriptions with near-zero code and gives every affiliate a referral link
with click tracking, automatic recurring-commission accounting, a self-serve earnings
dashboard, and payout exports (PayPal/Wise). This is how Scrimba's `?via=` links work.

### Setup checklist (owner, ~30 min)

- [ ] Create a Tolt account, connect the **live** Stripe account (OAuth, read + events).
- [ ] Create the program: **30% recurring, 12-month limit**, 60-day cookie.
- [ ] Add the Tolt tracking script to `app-next/app/layout.tsx` (one `<script>` in
      `<head>`; Tolt gives you the exact snippet). It reads the `?via=` / `tolt`
      referral param and drops the attribution cookie.
- [ ] In the checkout flow, pass the Tolt referral id with the Stripe Checkout Session
      (Tolt's docs: set `client_reference_id` or the `tolt_referral` metadata on the
      session in `/api/checkout`). This is the one ~5-line code change — it links a
      Stripe subscription back to the referring affiliate.
- [ ] Point the affiliate signup link at Tolt's hosted page: set
      `NEXT_PUBLIC_AFFILIATE_SIGNUP_URL` in Vercel (Prod + Preview) to the Tolt signup
      URL. Until then the `/affiliates` "Become an affiliate" button safely falls back
      to `partners@novacademy.ai` — no dead link ships.
- [ ] Mint each affiliate's **15%-off Stripe coupon** as their discount hook (reuse
      `scripts/create-creator-code.ps1`). Tolt handles attribution; the Stripe coupon
      handles the learner discount. They're two layers on the same link.

> Alternative considered: **Rewardful** (~$49/mo) — more mature, same Stripe-native
> model. We chose Tolt for cost; if we outgrow it, Rewardful is a clean migration.

---

## 3. The `/affiliates` landing page

Built in this branch — a public, indexable Next.js page (`app-next/app/affiliates/`)
matching the `/pricing` style. It pitches the 30%/12-month offer, explains the 3 steps,
shows the two tiers, and CTAs to the Tolt signup. It's in the sitemap and linked from
`/pricing`. This is what turns the program from "a thing I DM creators about" into
"a program people can find and join."

When Tolt is live, the only change needed is setting `NEXT_PUBLIC_AFFILIATE_SIGNUP_URL`.

---

## 4. Member referral program (give-a-month / get-a-month)

Distinct from affiliates: your **paying members** are your warmest sellers, and the
ask is tiny. The 90-day plan flags "add a referral code" but never designs it. Design:

- **Offer:** a member shares their personal link/code → a friend who subscribes gets
  **their first month 15% off** (reuse the affiliate discount), and the **referrer
  gets one month of account credit** once the friend's first payment clears.
- **Why credit, not cash:** account credit keeps members subscribed longer (it's a
  retention lever, not just acquisition) and avoids payout overhead.
- **Tracking:** two viable builds —
  1. **Lightweight in-app (recommended):** a per-member referral code (Stripe
     customer-scoped promo code) surfaced in **Account → Refer a friend**; on the
     friend's first successful invoice, the existing subscription webhook credits the
     referrer via a one-time Stripe coupon/credit on their next invoice. Members never
     touch an "affiliate dashboard" — it lives where they already are.
  2. **Reuse Tolt:** members are just affiliates whose reward is account credit. Faster
     to stand up, but the affiliate-dashboard UX is clunky for ordinary learners.
- **Status:** not built in this PR. It's a small phase-2 build (one Account UI section +
  a webhook branch). Flagged here so it's designed before it's needed; ship it once the
  affiliate program is live and we have members worth asking.

---

## 5. Recruiting engine

Target **small/mid creators (10k–200k)** — they convert far better than mega-influencers
for paid education, and the incumbents ignore them. Affiliate-first is the audition;
prove conversion, then offer the Partner tier or a flat fee.

### Where to find them
- AI / developer YouTubers and live streamers
- AI / data / dev **newsletters** (highest intent per click)
- Build-in-public creators on X and LinkedIn
- Bootcamp, course-community, and **Discord** operators
- Bloggers who write "best AI course / how to learn X" roundups (these rank and compound)

### Starter target list (research + verify fit before pitching)
> Real, public creators/brands as *categories of target* — confirm audience match and
> current contact before outreach. Don't spam; personalize every pitch.

| Channel type | Example targets to research |
|---|---|
| AI newsletters | TLDR AI, Ben's Bites, The Rundown AI, Latent Space, Last Week in AI |
| Dev/AI YouTube | mid-size channels doing Claude/LLM/agent build tutorials (10k–200k) |
| X build-in-public | indie devs shipping AI side-projects with engaged replies |
| LinkedIn | "AI for non-engineers" educators and career-switch coaches |
| Communities | AI/ML Discords, no-code AI groups, bootcamp alumni Slacks |

### Recruiting funnel
1. **Build a list** of 30–50 targets in a sheet (name, platform, size, contact, angle).
2. **Personalized outreach** (templates below) — affiliate-first, no flat fee.
3. **Approve + onboard** via Tolt; mint their 15% Stripe coupon.
4. **Support the launch:** give them a free membership to review, talking points, and
   show up in their comments when they post.
5. **Rank by real conversion** from the Tolt dashboard after 2–4 weeks.
6. **Re-book winners** (Partner tier / flat fee), cut duds.

---

## 6. Outreach templates

### A) Cold pitch — creator (X/YouTube/newsletter)

> **Subject:** Partnering with you on AI education
>
> Hi {name} — I've been following your work on {specific thing they made}; the way you
> {specific detail} is exactly how we think about teaching this stuff.
>
> I run Novacademy, a membership that teaches the real AI skills people are scrambling
> for — RAG, agents, evals, the judgment to actually ship. I'd love to set you up as an
> affiliate: **30% recurring for 12 months** on anyone who subscribes through your link,
> and your audience gets **15% off**. Free to join, you get a dashboard with live
> earnings, and I'll comp you a full membership so you can see it's genuinely good before
> you ever mention it.
>
> No pressure to post on a schedule — share it when it fits something you're already
> making. Want me to send your link and a comp code?
>
> — {you}, {link to /affiliates}

### B) Warm / community operator

> Hey {name} — your {community/Discord/cohort} is full of exactly the people Novacademy
> is built for. We run an affiliate program (30% recurring for 12 months, 15% off for
> your members) and I'd love to offer your community a dedicated code + a few free
> memberships to give away. Worth a quick chat?

### C) Newsletter sponsor-style (performance-first)

> Hi {name} — instead of a flat sponsorship, would you test us on performance? Affiliate
> link in one issue: you keep **30% of every subscription for a year**, your readers get
> **15% off**. If it converts we'll talk a flat placement after — but this way you risk
> nothing and I prove the numbers first. Comp membership on the way if you're game.

### D) Member referral nudge (in-app / email, phase 2)

> Know someone leveling up on AI? Give them **15% off** their first month — and you'll
> get a **free month** when they join. Your link: {referral link}.

---

## 7. Operations

- **Approval:** approve anyone with a genuine, relevant audience. Reject coupon/deal
  sites and incentivized-traffic farms (they cannibalize organic conversions).
- **Payouts:** monthly via Tolt's export → PayPal/Wise. Hold a 30-day window before
  paying a commission to cover refunds/chargebacks (matches the 14-day guarantee + buffer).
- **Self-referral / fraud:** no commission on an affiliate referring their own account;
  Tolt flags duplicate emails/cards. Spot-check the first payout per affiliate.
- **Terms page:** before launch, add a short affiliate terms section (allowed channels,
  no trademark-bidding on paid search, no spam, payout schedule, right to claw back
  refunded commissions). Can live under `/terms` or a dedicated section — small follow-up.
- **Reconciliation:** Tolt is the source of truth for commission owed. The old manual
  table in `creator-affiliate-playbook.md` is only for any white-glove deal run outside
  Tolt.

---

## 8. Launch sequence (maps to the 90-day plan, Month 2)

1. Stand up Tolt + the layout script + the checkout metadata change (§2).
2. Set `NEXT_PUBLIC_AFFILIATE_SIGNUP_URL`; the `/affiliates` page goes fully live.
3. Build the 30–50 target list; send 10–15 personalized pitches (§5–6).
4. Onboard the first 5–10; comp memberships; support their launches.
5. After 2–4 weeks, rank by Tolt conversion data; re-book winners on the Partner tier.
6. Phase 2: ship the member referral program (§4) once there are members to ask.

**North star for the channel:** exit with a known "$X to affiliates → Y members"
number — a growth dial you can turn, not a guess.
