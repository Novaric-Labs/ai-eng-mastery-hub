# Course review — October 2026

Review date: 2026-10-01/02 · Branch: `claude/eloquent-fermi-2o5wi8` · Previous pass: 2026-08-29 (`99734cc`).

Goal: make all three courses accurate, current as of October 2026, and complete for their level of the
modern AI landscape. Method: a lead agent per course, two landscape researchers (the fact sheets in this
folder), block editors (audit + fix, then expansions), authors for new modules, and an independent
verifier per course. Every change was validated with the schema/render checker, the quiz validator, and
by compiling or running every code sample.

## Results

| Course | Before | After | New modules |
|---|---|---|---|
| AI Foundations (`ai-foundations`) | 8 lessons · 240 min · 40 quiz | 10 lessons · 330 min · 50 quiz · 55 cards · 45 glossary | When AI Takes Action (`actions`) · Using AI Responsibly (`safely`) |
| AI Engineering Mastery Hub (`ai-eng`) | 21 modules · 760 min · 146 quiz | 24 modules · 970 min · 199 quiz · 109 cards · 87 glossary | Computer-Use & Browser Agents (`computer`) · Serving & Self-Hosting Open Models (`serving`) · Voice & Realtime Agents (`voice`) |
| AI Architect (`ai-architect`) | 12 modules · 555 min · 108 quiz | 14 modules · 655 min · 133 quiz · 56 cards · 42 glossary | Long-Running Runs (`runs`) · Compliance as Architecture (`regarch`) |

Foundations also moved `chat` into Block 1 (5/5 split, so each block review samples 20 of 25 questions).

### Bugs fixed that predate this review (highlights)
- **Quiz explanations referred to options by letter** (112 in ai-eng, 1 in ai-architect) although the app shuffles and re-letters options, so ~75% pointed at the wrong answer. `content/validate-quizzes.mjs` now rejects this.
- **Code damaged by the original HTML→JSON extraction**: `\n` escapes became real newlines (4 samples didn't compile) and regex backslashes were stripped, so halluc's and aisec's injection/PII screens could never match.
- **Wrong teaching**: pgvector "pre-filters via WHERE" (it filters after the HNSW scan; verified by building pgvector 0.8.7); inverted token arithmetic; latency formula; "streaming hides TTFT"; misattributed CORE-Bench and contextual-retrieval figures; a 4×/15× multiplier misread; finetune cost off by 10–100×; LoRA counts that disagreed; a checkpoint chosen on the test split; a recall metric that could never fail.
- **ai-architect arithmetic**: ~20 errors in blocks 1–2 and ~55 fixes in blocks 3–4 where prose had drifted from the calculators; an inverted "when is summing p95s safe" rule and quiz key; the capstone's worked text contradicting its own linter.
- **App**: resource notes rendered as "Use when: Use when…" (hard-coded label removed); the Flashcards paywall said "21 modules" in every course; ai-architect had no tutor/explain/grader config and silently used the Mastery Hub's; the tutor would have declined every newly added topic as off-scope.

### Brought current (October 2026)
Claude Fable 5.1 / Opus 5.5 / Sonnet 5.5 / Haiku 4.5 lineup, prices and API behaviour (no sampling params, forced tool_choice, prefill or budget_tokens on the 5.5 generation; adaptive thinking via effort; anthropic SDK 1.x); GPT-6 family, Responses API, Assistants shutdown; Gemini 3.8 / google-genai; open-weight leaders; MCP 2026-07-28 (stateless, authorization), A2A 1.0, Agent Skills; OWASP GenAI LLM Top 10 **2026** + Agentic Top 10; OTel `gen_ai.provider.name`; EU AI Act Digital Omnibus timeline (durable phrasing); canonical doc hosts.

## Deploying
1. Merge the branch (Vercel deploys the app copy, tutor scopes and UI fixes).
2. Apply `supabase/seed.sql` (regenerated; upserts only, no schema change). Preview and prod share one Supabase project, so the seed publishes content immediately — do it together with step 1.
3. Five new preface scripts are written but **not rendered**: `actions`, `safely` (`video/data/prefaces-ai-foundations.mjs`) and `computer`, `serving`, `voice` (`video/data/prefaces.mjs`); ai-architect has no prefaces. The registries only list rendered videos, so nothing breaks meanwhile.
4. `isNew`/`isUpd` flags are seeded but not displayed by any component.

## Needs a browser check (hosts blocked from the review environment)
- **Non-Anthropic prices and limits** used in ai-eng are first-party pages seen via search index, not fetched: GPT-6 prices and the >272K long-context surcharge (the "$0.20 on GPT-6 Luna to fill 1M tokens" figure depends on it applying to Luna), Luna's effort range, "GPT-6 accepts temperature only at effort none", Gemini 3.1 Pro / 3.8 Flash prices (3.8 Flash intro price ends 2026-12-31), Grok 4.7, DeepSeek V4.1, Gemma 4 / Muse Glimmer Apache-2.0, text-embedding-3-small $0.02/M, voyage-4-large and Voyage 4's shared embedding space.
- **Regulation**: EU AI Act Art. 50 timing and the high-risk dates (search-index only; ai-eng states them at month level); ai-architect's statutory figures (six-month log floor, 15-day incident reporting, GDPR one-month erasure) appear only as labelled counsel inputs. No US state laws are named.
- **Other**: the FCC ruling that AI voices are "artificial" (voice); the AIAG-VDA 2019 Action Priority note (failure); Foundations' academy.claude.com AI Fluency URL, the 3Blue1Brown video length, and 8 OpenAI help-center articles; resource URLs on blocked hosts across all courses (kept as canonical — a blocked fetch is not a dead link).

## Watch list
- Haiku 4.5: retirement "not sooner than 2026-10-15", no successor announced. The app's tutor, explain and grader routes use `claude-haiku-4-5`, and ai-eng's `llm` worked example and tiering use it.
- Sonnet 4.5 retires 2026-11-30; OpenAI GPT-5/o3 shut down 2026-12-11 (stated in `landscape`).
- Owner's calls left open: Foundations calls the next course "Engineering Mastery" (catalog: "AI Engineering Mastery Hub"); the two new Foundations prefaces run longer than the others; ai-architect modules are 5–18% over the word guideline (accepted).

## Reference
`FACTS-models.md` and `FACTS-landscape.md` are the review's fact sheets (labels: [V] fetched first-party, [S] first-party page via search index, [T] tracker-only). Start the next review from them. Lessons for future agents are recorded in `.claude/agent-memory/`.
