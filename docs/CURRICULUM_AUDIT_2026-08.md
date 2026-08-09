# Curriculum & Code Audit — August 8, 2026

Lead Curriculum Builder review of both courses against the mid-2026 AI job market, plus a
multi-agent code review of the platform. Produced by two orchestrated review workflows
(29 agents total: curriculum readers, live web job-market researchers, gap synthesis with
adversarial critique; code finders with adversarial verification) with key claims
independently re-verified by hand (code compilation checks confirmed locally).

**Job-market evidence base (mid-2026):** AI Engineer is the #1 fastest-growing US job title
(+143% YoY). The employer-required core has consolidated: Python + production engineering,
LLM API fluency, agentic orchestration (mentions +280% YoY), RAG + vector DBs, and — the
biggest shift since 2024 — **evals and observability** (observability in ~40% of postings;
eval design repeatedly called the single best signal of real LLM experience). MCP is now a
named JD requirement. The hiring loop has consolidated into: theory screen → coding round
(increasingly AI-assisted or debug-focused) → project deep-dive → AI system design →
behavioral. The single strongest portfolio signal: **a deployed, eval-gated, domain-vertical
project with a live URL**. Video-completion certificates are ignored; senior-skewed market
(entry-level down ~25% at big tech).

**Overall verdict:** the curriculum's bones are excellent — the evals, context-engineering,
agent-harness, and security framing match 2026 hiring priorities better than almost any
published course. It fails the market test on three axes: (1) broken/stale flagship code,
(2) no scaffolded practice layer despite the market paying for deployed artifacts,
(3) a handful of missing 2026 load-bearing skills (MCP server building, framework labs,
cloud deployment, hiring-loop prep).

---

## 1 · P0 fixes (existing content)

### 1.1 Broken pattern code (verified locally — these do not compile)

A content-pipeline corruption class stripped regex backslashes and injected literal
newlines into string literals. Verified via `py_compile`:

| Module | Status | Detail |
|---|---|---|
| `rag` (b2) | **SyntaxError** | Unterminated string literal (line 42) — the centerpiece RAG pipeline crashes on paste |
| `halluc` (b4) | **SyntaxError** | Unterminated f-string (line 132); `\b` degraded to a literal backspace char; `\s` stripped (`ignores+`) — the 4-layer defense code is non-functional |
| `aisec` (b5) | **SyntaxError** | Unterminated string (line 52); INJECTION_PATTERNS regexes corrupted (`ignores+(alls+)?`) — flagship defense matches nothing |
| `agents` (b3) | **SyntaxError** | Unterminated f-string (line 136) in `verify_completion` |
| `multimodal` (b5) | Compiles, but | FIGURE_QUERY_PATTERNS regexes backslash-corrupted (`b)` where `\b)` intended) — intent override never fires |
| `dataeng` (b5) | Compiles, but | `recall_at_5()` counts "any results returned" → the blue-green quality gate always passes at 1.0 (a no-op eval gate, the exact anti-pattern the module warns against) |
| `finetune` (b5) | Runs nowhere current | `torch` used without import; `TrainingArguments`/`SFTTrainer` args fail on TRL ≥0.12 / transformers ≥4.46 |

Why P0: take-homes are 40%+ RAG / 30%+ agent builds, and hiring managers verify portfolio
code "in 60 seconds." A graduate pasting the course's canonical code and hitting a
SyntaxError fails the exact screen the course exists to pass.

### 1.2 Content-currency & CI validation infrastructure (ships WITH the P0 wave)

Root-cause fix for 1.1 — without it the defect class recurs on next content regen:
- CI: `py_compile`/lint every PATTERNS block; regex-escape sanity checks; dead-link and
  `#`-placeholder checker (two confirmed `#` placeholder links in AI Foundations).
- Extract ALL perishable facts (model names, prices, release dates) into single-source
  dated data blocks with a rendered "last verified" stamp, referenced by modules — today
  the June-2026 snapshot is woven through concepts, cards, DEPTH answers, and quiz
  explanations in at least `landscape`, `llm`, `harness`, `multimodal`.
- Claim-citation register for load-bearing numbers (the 78/42 CORE-Bench claim anchors
  quiz items in two modules but is unverifiable; the 4-15x multi-agent token multiplier
  needs a source date — it is from Anthropic's 2025 multi-agent research post).

### 1.3 Model/landscape refresh (`landscape` + `llm`, echoes in `multimodal`, `evals`, `design`, `mlops`, `memory`)

- The "June 2026" snapshot is a release cycle stale. Live research reports July 2026 GA of
  a new flagship generation (GPT-5.6 July 9, Claude Opus 5 July 24, Gemini 3.6 Flash
  July 21 — **re-verify against provider pages during the edit**; the module's own rule is
  "never quote prices from memory").
- Note: the existing names (Opus 4.8, GPT-5.5, Gemini 3.1 Pro) are real-but-stale, not
  fabricated — one internal reviewer's "invented names" claim was overruled on critique.
- 2024-era pins to purge: `gpt-4o` / `gpt-4o-mini` hardcoded in `evals` (judge),
  `halluc`, `memory`, `multimodal` code; `design`'s gateway YAML pins
  `claude-sonnet-4-6-20260115` — a date-suffixed Claude ID form that does not exist
  (teach pinning with a real ID); `mlops` calls a Claude model through an `AsyncOpenAI`
  client (fails as written).
- Fix internal inconsistencies: 70× vs 71× cost spread; llm-module "$0.14–$10" vs
  scenario s2 "$1.50–$10" to fill 1M.
- Stale docs domains throughout (docs.anthropic.com / docs.claude.com →
  platform.claude.com, code.claude.com); "Claude 4 best practices" resource is a
  generation behind.

### 1.4 `aisec`: wrong OWASP numbering + missing 2026 attack classes

- Teaches the superseded 2023/24 OWASP LLM Top 10 numbering (quiz answers included) and
  misattributes indirect injection to "LLM08" — wrong under both numberings. Produces
  verifiably wrong interview answers in a supply-constrained, high-paying niche.
- Add: OWASP Agentic Top 10; MCP tool-poisoning/rug-pull supply-chain attacks; guardrail
  models (Llama Guard 3/4, Prompt Guard, NeMo Guardrails); red-team tooling beyond
  promptfoo (garak, PyRIT); dual-LLM/CaMeL and spotlighting defense patterns.

### 1.5 `evals`: protect the course's strongest hiring asset

- Judge hardcodes `gpt-4o` with 2024-era SDK usage in the course's most interview-critical
  code; single-vendor (Braintrust+OpenAI) despite vendor-neutral prose; sync judge call
  blocks the async online worker; nondeterministic `hash()` in stored records;
  contradictory quiz explanations (Q6 vs Q9).
- Add statistical literacy (A/B testing, significance) — named by two research streams as
  a required evals-engineer entry skill; currently absent everywhere.

---

## 2 · P0 additions (the job-market gap)

### 2.1 Scaffolded lab track + deployed domain-vertical capstone
The #1 structural gap, flagged by every block reader: excellent build-exercise prose,
zero scaffolding — no starter repos, datasets, grading, or deployment. The course is
reading+quiz in practice, while the market's strongest signal is the deployed, eval-gated
project.
- Starter repos + small provided datasets/golden sets per build exercise (also fixes the
  Block 1 context-module exercise that depends on an agent harness not built until Block 3).
- Capstone 1 (post-Block 2): agentic RAG over a provided domain corpus — hybrid retrieval
  on pgvector, reranking, retrieval-grading loop, promptfoo/RAGAS eval harness.
- Capstone 2 (Blocks 3–4): production agent in the learner's chosen vertical
  (healthcare/fintech/legal) — budgets/checkpoints, trace instrumentation, eval suite
  gating CI, deployed to a live URL with cost dashboard, architecture README + recorded
  walkthrough (mirrors the take-home/live-defense format).
- Reposition certificate marketing around the evaluated capstone, not completion.

### 2.2 MCP Engineering module (new, Block 3 after `tools`)
Currently one conceptual bullet; the market has dedicated MCP Developer job categories and
"implementing MCP servers" as a standard JD line. The 2026-07-28 stateless spec rewrite
(MRTR, header routing, CIMD auth; Roots/Sampling/Logging deprecated) means competing
courses teaching the 2024-11 handshake are already stale — a currency moat.
Lab: ship an MCP server exposing the learner's capstone retrieval index.

### 2.3 Agent framework decision-set labs (expand `harness`)
Rebuild the module's hand-rolled loop in LangGraph (graph, checkpointing, HITL interrupt);
same task on Claude Agent SDK; decision map LangGraph vs Claude Agent SDK vs OpenAI Agents
SDK vs CrewAI vs Microsoft Agent Framework/Google ADK (name-drop tier, incl. LlamaIndex for
document-centric work); sunset literacy (classic LangChain chains, AutoGen/SK maintenance
mode). Also add the mid-2026 "harness capabilities moving into the platform layer" story
(managed/hosted agents, server-side compaction, tool search/deferred loading, task budgets).

### 2.4 Cloud deployment lessons (Block 4 `design`) — promoted to P0 on critique
Cloud platforms appear in ~55% of postings (AWS ~72% of those, Docker/K8s ~58%, CI/CD ~34%)
— the largest JD-keyword surface graduates can't currently claim honestly, and the
mechanism by which the capstone gets its live URL. Containerize the capstone, CI with eval
gate, deploy behind the existing LiteLLM gateway content; one managed-platform walkthrough
(Bedrock, with Azure OpenAI/Vertex variants); include a Kubernetes orientation (most-demanded
MLOps tool; currently absent).

### 2.5 Hiring-loop preparation module (new, end of Block 4)
The per-module "interview answer" snippets are raw material; assemble into drills:
- 3 timed AI-system-design scenarios (RAG pipeline, agentic architecture, eval methodology)
  with rubric-scored model answers.
- Failing-trace lab: 5 provided traces (runaway tool calls, retrieval drift, prompt
  regression, silent multi-agent drift, cost runaway) — diagnose and fix.
- Take-home playbook: eval-set-first build order, design-decision doc, walkthrough video.
- Both coding modes: AI-assisted round etiquette (judging model output) and AI-off refresher.
- Agent benchmark literacy (tau-bench, SWE-bench-class, Terminal-Bench) — flagged missing
  by two readers.
- FDE and Evals-Engineer loop variants; honest cert guidance (proctored cloud certs retain
  ATS value; completion badges don't).

---

## 3 · P1 (strong differentiators)

- **AI-assisted engineering workflow module** (Mastery Block 1, after `prompt`): delegation
  workflow with Claude Code/Cursor, judging AI output via seeded-bug review exercises,
  CLAUDE.md conventions, interview transfer. Neither course teaches the workflow the
  audience will use daily; also sets up the harness module pedagogically.
- **RAG 2026 expansion** (`rag` + `embed`): GraphRAG (Neo4j worked example), late-interaction
  retrieval (ColBERT-class), visual document retrieval (ColPali-class), agentic
  retrieval-grading lab against a provided golden set; reranker/embedding roster refresh
  (Cohere Rerank 3.5, Voyage rerank-2.5, BGE-v2, Qwen3-Reranker; gemini-embedding,
  Qwen3-Embedding, multimodal embeddings).
- **`vecdb` refresh**: object-storage/serverless tier (turbopuffer, S3 Vectors),
  pgvectorscale/DiskANN against the module's own pgvector ceiling; add a selection scenario.
- **`memory` refresh**: provider-native memory surfaces (Anthropic memory tool,
  product-memory reference implementations), graph/temporal-KG memory (Zep/Graphiti);
  fix stale model pin.
- **`finetune`**: GRPO/RLVR reasoning-RL lesson + distillation, completing
  Prompt → RAG → Fine-tune → Distill; hosted RFT survey; current base-model defaults;
  **vLLM/SGLang serving lab** (serve the tuned adapter; recompute landscape break-even
  math against measured numbers).
- **`tools`**: strict tool use correction ("constrained decoding ensures well-formed args"
  is only true with strict mode), structured outputs coverage (JD line item; currently a
  named gap), tool search/deferred loading, programmatic tool calling, cache-invalidation
  cost of changing tool definitions, MCP credential handling; quiz to 10 items.
- **`multi` + `lead` consistency**: platform-native multi-agent surfaces; replace lead's
  blanket "wait on most multi-agent" with a conditional decision rule; add in-force
  governance specifics (EU AI Act high-risk obligations, NIST AI RMF, ISO/IEC 42001);
  lead quiz to 10 items.
- **`prompt`**: automated prompt optimization (DSPy/GEPA-class) — established practice,
  currently absent; add a Gemini prompting reference.
- **Foundations course currency pass** ("the raw engine still works this way; your 2026
  app adds these defaults"): fix the chat blank-slate experiment (fails under default-on
  memory — use temporary/incognito chat), update `tools` for native image gen and
  reasoning indicators, soften over-predicted failure demos, fix `#` placeholder links.
- **Foundations module 9: "Your AI Can Act Now"** (new, between `tools` and `using`):
  agentic features in consumer apps, reasoning modes, connectors/MCP in plain English,
  judging AI output as a skill, mini-capstone (prompt → ground → verify → revise against a
  rubric), career framing (AI-fluency roles vs the engineer track, Mastery as the bridge).
  Consider a concept-level RAG + coding-agent-fluency lesson here (entry-level postings
  increasingly name both).
- **FDE career lesson** (`lead`): fastest-growing adjacent role (postings up 800%+ YoY);
  decomposition case-study format, client-specific eval frameworks, comp map.
- **Block 5 hygiene**: dedupe near-duplicate DEEP/DEPTH worked examples in all five
  modules; quiz parity for `mlops`/`dataeng`/`multimodal` (5 → 10); operationalize
  `mlops` drift detection (promised as its "third instrument," never implemented);
  `multimodal` tile-token math correction; Azure Form Recognizer → Azure AI Document
  Intelligence; qdrant `.search()` → `query_points`.

## 4 · P2 (nice to have)

- A2A / agent-interop landscape lesson (`multi`): "MCP is how an agent uses its hands,
  A2A is how two agents shake them"; ACP/AGNTCY awareness.
- Computer-use, browser, voice — **and video** — agents lesson (`multimodal` + pointer
  from `agents`); without video the course's "multimodal" claim stays incomplete.
- Foundations `using`: dated "landscape right now" data block; subscription-vs-per-token
  payment reconciliation; honest expectation-setting (senior-skewed market).
- Python/PyTorch prerequisite framing note (PyTorch in ~67% of postings; asyncio +
  pandas/Polars/DuckDB as the evals-interview substrate) — a "what we assume you know"
  page with pointers, not new modules.

---

## 5 · Platform code review (separate workflow, 12 confirmed findings)

All high-severity findings survived adversarial verification:

| Sev | Finding | Where |
|---|---|---|
| HIGH | Stripe webhook blind-upserts by user_id → old sub's `deleted` event clobbers the new active membership (user billed, access lost) | `app-next/app/api/stripe-webhook/route.ts:36` |
| HIGH | No webhook idempotency/ordering guard → retried stale `active` snapshot resurrects access after cancellation | `app-next/app/api/stripe-webhook/route.ts:78` |
| HIGH | Certificates forgeable: issuance trusts client-writable progress row, skips entitlement check (found by two independent reviewers) | `app-next/app/api/certificate/route.ts:42` |
| HIGH | `/api/grade` cross-course entitlement bypass leaks paid scenario content | `app-next/app/api/grade/route.ts:40` |
| HIGH | Mount-time visit stamp writes empty blob over server progress when initial fetch fails | `app-next/components/learn/StoreProvider.tsx:85` |
| MED | Checkout allows double-subscribe → silent double billing; cancel only kills the tracked sub | `app-next/app/api/checkout/route.ts:40` |
| MED | `redeem_access_code` unconditionally reactivates revoked entitlements | `supabase/migrations/20260615000000_multi_course.sql:179` |
| MED | Unthrottled redeem RPC + guessable codes → brute-force unlock | `app-next/app/api/admin/create-code/route.ts:19` |
| MED | Rate limiting fails open to per-instance cooldown → AI-endpoint cost amplification | `app-next/lib/ratelimit.ts:104` |
| MED | Whole-blob last-write-wins progress sync: stale tab erases newer progress from another device | `app-next/components/learn/StoreProvider.tsx:71` |
| MED | Quiz-balance guardrail silently skips courses missing from its hardcoded list | `content/validate-quizzes.mjs:22` |
| MED* | Legacy edge function calls dropped 2-arg `grant_stripe_entitlement` → legacy purchases charge but never grant access (*plausible, needs manual confirmation if legacy flow is live) | `supabase/functions/stripe-webhook/index.ts:36` |

Note the certificate forgery finding compounds with §2.1: the plan repositions the product
around the certificate-backed capstone, so cert integrity is a curriculum-credibility issue,
not just a security bug.

---

## 6 · Suggested sequencing

1. **Week 1 (P0 credibility wave):** fix the 7 broken/stale pattern-code modules + ship CI
   content validation (§1.1–1.2) + certificate forgery and Stripe webhook fixes (§5).
2. **Weeks 2–4:** landscape/model refresh with dated data blocks (§1.3), aisec OWASP fix
   (§1.4), evals hardening (§1.5); start the lab-track scaffolding (§2.1).
3. **Month 2:** MCP module, framework labs, cloud deployment lessons, hiring-loop module
   (§2.2–2.5); Capstone 1 live.
4. **Month 3:** P1 wave (AI-assisted workflow module, RAG 2026, finetune/serving,
   Foundations module 9 + currency pass); Capstone 2 live; certificate repositioning.
