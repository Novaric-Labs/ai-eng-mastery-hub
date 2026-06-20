# Novacademy Go-To-Market Plan (8 weeks)

A week-by-week plan to get real sales, with conversion goals to measure against.
Numbers are **targets to validate, not promises** — early traffic is small and
high-variance (one Show HN or creator can swing a week 5×). Each week shows a
conservative **Base** case and a **Good week**. Early on, the **leading indicators
(signups, preview completion) matter more than revenue** — they predict revenue 1–3
weeks out, since free→paid conversion lags.

Companion docs: `owner-action-plan.md` (launch hygiene), `creator-affiliate-playbook.md`
(the creator channel). Conversion events (`signup` → `preview_started` →
`checkout_started` → `subscribed`) fire to Vercel Analytics — that dashboard is how
you read the funnel.

## Funnel model (rough cold-start benchmarks)

| Stage | Warm (your network) | Community (HN/Reddit) | Creator (w/ code) |
|---|---|---|---|
| Visitor → free signup | ~20% | ~5% | ~4% |
| Signup → completes a free module | ~40% | ~35% | ~40% |
| Activated → paid | ~15% | ~4% | ~6% |

Effective revenue per member ≈ **$20/mo MRR** (blend of founding-discounted monthly +
amortized annual). The Founding offer is **40% off for life, through July 3**
(code `FOUNDING40`) — a time-boxed launch window to drive urgency.

---

## Week 0 — Instrument & arm (no sales expected)
**Build (Claude):** ✅ conversion tracking, ✅ privacy placeholders filled, ✅ Founding
banner + Stripe script, ✅ testimonials component, ✅ creator-code system.
**You:**
- [ ] Verify RLS in prod (owner-action-plan §1, 5 min)
- [ ] Run `create-founding-offer.ps1 -Live` (after `stripe login`)
- [ ] Set up Google Search Console + submit sitemap
- [ ] Line up 15–20 people to comp for testimonials

| Goal | Target |
|---|---|
| Tracking firing on all 4 events | ✅ / ❌ |
| Founding code live in Stripe | ✅ / ❌ |
| Paid members | 0 (expected) |
| **On track =** | every event shows in the dashboard; offer + 1 testimonial live |

## Week 1 — Warm launch (your network)
**You:**
- [ ] Personal LinkedIn + X "I built this" post (Founding link)
- [ ] DM 15–20 engineers comp codes for honest feedback + a quote
- [ ] Add collected quotes to `lib/testimonials.ts`

| Goal | Base | Good week | Actual |
|---|---|---|---|
| Free signups | 40–80 | 150 | |
| Free-module completions | 15–30 | 60 | |
| **Paid founding members** | **3–6** | 10–12 | |
| Testimonials collected | 3–5 | 8 | |
| MRR (cumulative) | ~$80–120 | ~$220 | |

**On track =** first paying members exist + you have quotes for social proof.

## Week 2 — Public launch (communities)
**You:**
- [ ] Show HN (frame as build story; reply fast to comments)
- [ ] 2–3 surgical Reddit posts (lead with a free module, link in comments)
- [ ] Indie Hackers + dev.to launch posts
- [ ] Push free AI Foundations as the lead magnet

| Goal | Base | Good week (lands) | Actual |
|---|---|---|---|
| Visitors | 800–2,000 | 5,000+ | |
| Free signups | 60–120 | 300 | |
| **New paid members** | **4–10** | 20–30 | |
| MRR (cumulative) | ~$200–320 | ~$700 | |

**On track =** one channel clearly outperforms — that's your wedge.
> ⚠️ Highest-variance week. Have all assets ready; post when rested and responsive.

## Week 3 — Creator outreach, round 1 (affiliate-first)
**You:**
- [ ] Pitch 10–15 creators (see `creator-affiliate-playbook.md`)
- [ ] Mint codes for those who commit (`create-creator-code.ps1 -Live`)
- [ ] Goal is deals signed, not sales yet

| Goal | Base | Good week | Actual |
|---|---|---|---|
| Creator deals signed | 2–4 | 6 | |
| New paid members (organic tail) | 3–8 | 15 | |
| MRR (cumulative) | ~$300–480 | ~$900 | |

**On track =** ≥2 creators committed with live codes.

## Week 4 — Creator placements live + content engine starts
**You:**
- [ ] Creators publish; you support in their comments
- [ ] Publish 1st SEO article (e.g. "What a RAG pipeline actually is")
- [ ] Start 3×/week build-in-public posts

| Goal | Base | Good week | Actual |
|---|---|---|---|
| Creator-attributed signups | 80–200 | 600 | |
| **New paid members** | **6–15** | 30 | |
| MRR (cumulative) | ~$450–750 | ~$1,400 | |

**On track =** per-creator code data ranks creators by real conversion rate.

## Week 5 — Double down + optimize
**You:**
- [ ] Re-book best creator(s) — now consider a small flat fee (proven ROI)
- [ ] Cut the duds; 2nd SEO post
- [ ] Fix the worst funnel drop-off (from analytics)

| Goal | Base | Good week | Actual |
|---|---|---|---|
| New paid members | 6–14 | 25 | |
| Free→paid rate improvement | +0.5–1pt | +2pt | |
| MRR (cumulative) | ~$600–1,000 | ~$1,900 | |

**On track =** you can name your best channel and worst funnel step, with numbers.

## Week 6 — Scale what works
**You:**
- [ ] 3–4 more creator deals modeled on winners
- [ ] 3rd SEO post (GSC should show first impressions)
- [ ] Test retargeting ads to `/pricing` visitors only

| Goal | Base | Good week | Actual |
|---|---|---|---|
| New paid members | 8–18 | 30 | |
| Organic search clicks (GSC) | 10–50/wk | 150 | |
| MRR (cumulative) | ~$800–1,350 | ~$2,500 | |

## Week 7 — Compound
**You:**
- [ ] Maintain creator cadence; 4th SEO post
- [ ] Add a referral code; ask happy members for referrals/reviews
- [ ] Start simple email nurture for signups who didn't convert

| Goal | Base | Good week | Actual |
|---|---|---|---|
| New paid members | 8–18 | 30 | |
| Email-recovered conversions | 2–5 | 12 | |
| MRR (cumulative) | ~$1,000–1,700 | ~$3,100 | |

## Week 8 — Review & decide the next bet
**You:**
- [ ] Full funnel review
- [ ] Decide the scale bet: more creators, harder on SEO, or cautious paid ads — the data now tells you which

| Metric | Base (8 wks) | Good | Actual |
|---|---|---|---|
| **Cumulative paid members** | **45–90** | 150–200 | |
| **MRR** | **~$1,000–1,800** | ~$3,000–4,000 | |
| Proven, repeatable channel | 1 | 2 | |

---

## How to read this
- Hitting **Base case = doing well**: a real, growing business and a known channel by week 8.
- The most important outcome **isn't MRR — it's exiting week 8 with one channel you can
  predict** ("$X to creator → Y members"). Then growth is a dial, not a guess.
- **Biggest risk:** skipping Week 0. Without tracking, every week is anecdote, not data,
  and the optimization loop breaks.
