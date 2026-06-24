# Week 2 — Public Launch Assets (communities)

Ready-to-post drafts for the Week 2 public launch. Everything leads with the **free
AI Foundations** course as the lead magnet and surfaces the **FOUNDING40** offer
(40% off for life, ends **July 4**) without being salesy.

**Goal for the week:** one channel clearly outperforms — that's your wedge. Post when
rested and responsive; reply fast in the first 2 hours (that's what decides HN/Reddit).

---

## Pre-launch checklist (do this BEFORE posting anything)

- [ ] **Verify `FOUNDING40` actually redeems** — start a real checkout on the live site,
      enter the code, confirm 40% applies. If it errors, run
      `cd app-next; ./scripts/create-founding-offer.ps1 -Live`.
- [ ] **Test the free path end-to-end** as a logged-out stranger: land → sign up →
      open AI Foundations → confirm all 8 modules are reachable (not just the sample).
- [ ] **Have the homepage tab + a checkout tab open** so you can answer "is it really
      free?" / "what's behind the paywall?" with a screenshot in seconds.
- [ ] **Block 3–4 hours** to babysit comments. A launch post with no author replies dies.
- [ ] Decide your one-line answer to "why should I trust this vs. a YouTube playlist?"
      (suggested: graded — quizzes, mastery exams, spaced-repetition, real scenarios,
      a certificate — not passive video.)

---

## Positioning (shared across all posts)

- **What it is:** Novacademy — a structured school for *actually shipping* AI features,
  not passive tutorials.
- **Free lead magnet:** **AI Foundations** — 8 modules, beginner, "zero to fluent": what
  LLMs, tokens, context windows, and prompts actually are. Free, no card.
- **Paid flagship:** **AI Engineering Mastery Hub** — 21 modules: RAG, agents, harnesses,
  evals, production judgment. One membership ($35/mo) unlocks every course.
- **Why it's different:** graded quizzes + block mastery exams + spaced-repetition
  flashcards + real production scenarios + a certificate on completion. You're tested,
  not just shown.
- **Links:** Foundations (free) → https://www.novacademy.ai/courses ·
  Home → https://www.novacademy.ai

---

## 1) Show HN

**Title (pick one):**
- `Show HN: Novacademy – Learn to actually ship LLM features (free beginner course)`
- `Show HN: I built a graded AI-engineering school, not another video course`

**Body:**
> I'm a software engineer and I kept watching AI tutorials that made sense in the moment
> and evaporated by the time I tried to build anything. So I built the thing I wanted:
> a structured course that *tests* you instead of just showing you.
>
> Novacademy has two courses right now:
> - **AI Foundations** (free, 8 modules) — plain-English mental models for how LLMs,
>   tokens, context windows, and prompts actually work.
> - **AI Engineering Mastery Hub** (21 modules) — the real production job: RAG, agents,
>   harnesses, evals, and the judgment to ship.
>
> The part I care most about: it's not passive. Every module has a quiz, every block has
> a mastery exam, there are spaced-repetition flashcards for the concepts that fade, and
> "production scenario" exercises where you make a call and get graded against a model
> answer. Finish a course and you get a certificate that attests to graded work, not
> attendance.
>
> The beginner course is free — I'd genuinely love feedback on whether the mental models
> land, especially from people who've tried and bounced off this stuff before.
>
> Free course: https://www.novacademy.ai/courses
>
> (Full disclosure: the advanced course is a $35/mo membership. The free one is a complete
> course, not a trailer.)

**Notes:** HN rewards honesty and hates marketing voice. Lead with the *why I built it*,
disclose the paid tier yourself before someone "catches" you, and be in the thread to
answer technical questions. Post Tue–Thu, ~8–9am ET.

---

## 2) Reddit (2–3 surgical posts — read each sub's rules first; most ban direct promo)

> ⚠️ Reddit will nuke obvious self-promo. The pattern that works: **lead with genuine,
> standalone value in the post; put the link in a comment**, and only if it's allowed /
> asked for. Use a real account with history, not a fresh one.

### 2a) r/learnmachinelearning — *value-first, free resource*
**Title:** `I wrote a plain-English beginner path for "how LLMs actually work" — free, feedback welcome`

**Body:**
> A lot of beginners here ask the same thing: what *is* a token, what's a context window,
> why does prompting feel like guesswork. I tried to write the explanation I wish I'd had —
> 8 short modules, no math-heavy prerequisites, each with a quick quiz so it sticks.
>
> It's free (the platform's a side project of mine). Happy to take the whole thing apart
> if the mental models are wrong or unclear — that's the feedback I actually want. I'll
> drop the link in a comment so this isn't just an ad; mods, remove if it crosses a line.

### 2b) r/PromptEngineering — *lead with a concrete takeaway* (full post body below)
**Title:** `The mental model that finally made context windows click for me`

**Body:**
> Most "prompting tips" threads skip the one idea that makes the rest obvious, so here's
> the model that unstuck me.
>
> **The AI does all its thinking at a desk of a fixed size.** Everything it can "see" right
> now has to fit on that desk: your instructions, the conversation so far, any document you
> pasted, and the answer it's about to write. That desk is the *context window*, and it's
> measured in tokens (≈ ¾ of a word each). Two facts fall out of it and explain almost
> every weird thing a model does:
>
> 1. **If it's not on the desk, the model doesn't know it.** No memory of you, your last
> chat, or anything you didn't put in front of it this time. A fresh conversation starts
> with an empty desk.
> 2. **The desk is finite.** Pile on too much and stuff slides off the edge or gets buried.
>
> That's why long chats "forget" the start (it scrolled off the desk), why pasting a
> 50-page doc + one question gives worse answers (your question is now buried under a
> mountain of text the model half-ignores), and why each new chat feels like meeting a
> stranger.
>
> So the practical rules write themselves: **front-load what matters**, **re-state things
> that scrolled out of a long chat instead of assuming it remembers**, **paste the
> relevant section, not the whole binder**, and **start a fresh chat when you switch
> topics** so the desk isn't cluttered with an unrelated conversation.
>
> The one sentence to keep: *the model only knows what's on the desk right now.*
>
> I expanded this into a free beginner course if it's useful — link in a comment. Mostly
> posting the model here because it's the thing that finally made prompting feel less like
> guesswork.

### 2c) r/SideProject or r/EntrepreneurRideAlong — *build story*
**Title:** `I built a graded AI course platform to fix my own "tutorials don't stick" problem`

**Body:**
> Engineer here. Built Novacademy because video courses never tested me, so nothing stuck.
> Mine grades you — quizzes, mastery exams, spaced repetition, production scenarios. Free
> beginner course live, advanced is a membership. Sharing the build + happy to answer
> anything about the stack or the strategy. Link in comments.

**Notes:** Stagger these across the week (don't post all three day one). Reply to every
comment. If a sub explicitly allows links in-post, fine — otherwise comment.

---

## 3) Indie Hackers

**Title:** `Launching Novacademy: a graded AI school, free beginner course + founding offer`

**Body:**
> **What:** Novacademy — structured, *graded* AI courses (not passive video). Free
> beginner course (AI Foundations, 8 modules) + an advanced AI-engineering track (RAG,
> agents, evals, production).
>
> **Why:** I'm an engineer who bounced off every AI tutorial because none of them tested
> me. So I built one that does — quizzes, mastery exams, spaced-repetition flashcards,
> graded production scenarios, certificates.
>
> **Model:** one membership unlocks every course — $35/mo (or cheaper on 3/6/12-mo plans).
> The beginner course is fully free as the on-ramp.
>
> **Founding offer:** first members get **40% off for life** with code `FOUNDING40`
> through **July 4** — I'd rather reward early believers than run ads.
>
> **Ask for IH:** I'm validating which channel converts before I scale spend. If you try
> the free course, I want the brutal version of "would you pay for the next one and why
> not." Free course: https://www.novacademy.ai/courses
>
> Will post numbers transparently as the launch unfolds.

**Notes:** IH rewards transparency and founder voice. The "I'll post numbers" promise is
your follow-up content for Weeks 3–4.

---

## 4) dev.to (technical article that doubles as a lead magnet)

**Title:** `RAG, explained by what actually breaks in production`

**Tags:** `#ai #machinelearning #beginners #career`

> ✅ **Full paste-ready draft:** `docs/week2-devto-rag-article.md` (~1,300 words, dev.to
> frontmatter, `published: false` so you can preview first). Set a `cover_image` and flip
> `published: true` when ready.
>
> ✅ **Matching `/blog` version (canonical):** `app-next/content/blog/rag-what-breaks-in-production.mdx`
> (slug `rag-what-breaks-in-production`, `draft: false`). The dev.to post's `canonical_url`
> points here — keep both live together so your site gets the SEO credit, not dev.to.

**Notes:** dev.to is SEO + evergreen — keeps pulling signups after launch week and seeds
the Week 4 content engine.

---

## 5) Second evergreen post (beginner lead magnet) — DONE

`app-next/content/blog/context-windows-explained.mdx` — "Context Windows, Explained Without
the Jargon" (beginner, feeds the *free* Foundations course). Triple-duty: a `/blog`
evergreen, a second dev.to cross-post, and the source content for the r/PromptEngineering
post above. `draft: false`.

---

## After you post — track which channel wins

Watch the Vercel Analytics funnel events (`signup`, `preview_started`, `checkout_started`,
`subscribed`) per referrer. Whichever channel produces the best
**visitor → free signup → paid** ratio is your Week 3+ wedge — double down there, drop the
rest. **On track = one channel clearly outperforms.**
