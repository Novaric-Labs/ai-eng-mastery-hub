---
name: ai-architect-course
description: Review notes and verified/unverified arithmetic for the Advanced "AI Architect" course (content/ai-architect.json, 12 modules, branch feat/ai-architect-course)
metadata:
  type: project
---

The AI Architect course (content/ai-architect.json, ~588KB, 12 modules: reqs, budgets, shapes, failure, blast, capacity, seams, statearch, migrate, quality, orgarch, review) sits above the `ai-eng` Mastery course (content/content.json). Reviewed 2026-08-29 at commit 2c72b3b.

**Design contract to preserve on any edit:**
- Every `DEEP.<mod>.worked` must contain *executed* arithmetic the reader can reproduce. Treat an unreproducible figure as a defect, not a rounding detail.
- Exactly ONE dated price/quota reference is allowed, in `DEPTH.budgets.mech` ("Price and quota anchors — as of August 2026"), expressed as **ratios** not vendor prices. Verified 2026-08-29: no hardcoded $/token, no context-window sizes, no model names presented as current, no quota ceilings stated as fact anywhere else. **Preserve this discipline.**
- Every `DEEP.<mod>.res` entry is `[label, url, note]`, exactly 4 entries, and exactly one note per module opens "Use right now:" while the rest open "Use when".
- Eleven artifacts thread 11 producing modules → the `review` capstone. Verified 1:1 and correct.

**Verified-correct arithmetic (do not re-derive):** capacity's Erlang-C table (34/36/38/40/42 workers at a=33.33 erlangs reproduces to 11.73/1.86/0.64/0.26/0.11s exactly); seams' exit-cost engineer-weeks (109h/241h, 2.91/6.43 wks, 4.4:1); orgarch's review queue (162 reviews, 0.69 util, M/M/1 waits 2.2/4.2/12 days, break-evens 8.7/11.6/28.9 teams); migrate's two-proportion sample sizes (5,570 and 1,499 per arm) and its rule-of-three use (3/rate); shapes' composite blend ($0.0152 → $0.0191 → $0.0274); budgets' reliability composition (0.999×0.998×0.995×0.999 = 99.1%, one retry on three stages → 99.9%, 4.01 calls/task); quality's detection-lag chain (5.4/16/162 days).

**Known error classes that recurred — check these first on re-review:**
1. **Escape-fraction vs catch-fraction inversion.** Prose says "20% are noticed and reversed" while the number used is 20% *escaping*. Cross-check any mitigation percentage against the inverted requirement stated later in the same passage.
2. **Delta vs total.** A "saved" figure computed from the whole pre-control defect stream instead of the reduction (quality's $6,464 should be $4,954).
3. **Person-days added to calendar/working days.** "2 labellers for 4 days ... about 11 working days" (migrate) and SCENARIOS[8] "10 working days → new total 30 days".
4. **Overrun-vs-ceiling confused with increase-vs-current-spend** ($2,040 vs $4,800 in budgets; propagates to DEPTH.budgets.interview and QUIZ.budgets[8].exp).
5. **Summary totals that don't reconcile with the prose components** (quality's $10,600/$8,300 come from PATTERNS.quality.code's fuller model — compute + false blocks + escapes + detection-lag defects — not from the narrative figures).
6. **Narration drifting from its own table** (capacity: "six workers"/"18%" for a 34→42 step that is 8 workers/24%; repeated in DEPTH.capacity.mech).

**Methodological tension to watch:** `DEPTH.budgets.mech` teaches "you may not sum p95s" (root-sum-square instead), but `DEEP.review.worked` Q2 and `DEEP.quality.worked` both sum p95s. Review's Q2 is the worst case — non-dominant spreads sum to 1,190ms there, exactly the condition budgets warns about.

**Unverifiable-by-design figures** (author should publish inputs or soften): budgets' RSS result 2,467ms / simulated 2,520ms (stage p50s never given); failure's FMEA register totals 1,503/928/715 (the 11 rows are never shown); blast's suggest-only 3.6 (the 0.3% escape share is never stated, unlike the 20%/95% for the other tiers).

**Distinctness vs content.json:** mechanically clean (0 shared 12-word spans). Conceptual overlaps are real but mostly acceptable — the sharpest are `blast` vs `aisec` (same "structure beats persuasion" thesis, though blast's tier arithmetic is unique) and `failure.mental`'s silent-200 opening vs `mlops`. Of the five modules checked (seams/quality/migrate/orgarch/review) all are genuinely distinct; `review` restates `lead`'s decision-memo stance in new vocabulary.

**FMEA convention:** the course uses Detection/Detectability correctly (1 = easy to detect, 10 = undetectable), and GLOSSARY states "all three on 1-10 and all higher-is-worse" correctly. Note it reduces *Occurrence* for a detection control (modelling "escape likelihood"), a deliberate adaptation of standard FMEA rather than an error. Little's Law, Amdahl, Conway, rule of three and statistical power are all stated correctly.

See [[vendor-doc-urls]] for the resource-link findings from this review.

**October 2026 review (14 modules now).** Added `runs` (b2, after capacity: long-running runs, checkpoints, approval gates, resumability — artifact: run contract) and `regarch` (b4, after orgarch: compliance as architecture — artifact: obligation-evidence register). The capstone assembles 13 artifacts; `review`'s linter has R9 (run contracts — must test that the downstream HONOURS the idempotency key, plus durability) and R10 (obligations — evidence window = detection lag + reporting window). **R9/R10 must stay in parity with the runs/regarch audits.** The anchors table in DEPTH.budgets.mech is "as of October 2026" and now carries region pinning (~1.1×), tokenizer drift, cache write vs read (12.5×), speed tiers, reasoning-as-output and long-context surcharges — `runs` and `regarch` point at those rows.

New error classes found in Oct 2026 (add to the list above): prose inputs changed without re-running the calculator ("code is right" failed in migrate — prose was fixed in Aug, code wasn't); two fields moving narrated as one; percent taken off the wrong base; a scenario reusing another example's requirement figure; "passes" claimed while over tolerance; a calculator missing a term the prose subtracts; rollback trigger at baseline−MDE (only 50% power); placement narrative ≠ calculator comparator; detection lag reused across routes (it scales inversely with a route's own volume). The "when is summing p95s safe" rule is: the naive sum overshoots by at most ≈ the sum of the non-dominant stages' spreads — variance share is not the test.

Cite, don't define: pass^k (ai-eng evals), reasoning effort (ai-eng llm), trifecta/Rule of Two (ai-eng aisec). Regulatory dates enter as weeks-from-today parameters; statutory figures (EU AI Act six-month log floor, 15-day reporting) only as labelled counsel inputs — unverified first-party. Word budgets run ~5,500–6,500 in several modules (accepted). Style: hyphen ranges, straight apostrophes, refer to other modules by visible title.
