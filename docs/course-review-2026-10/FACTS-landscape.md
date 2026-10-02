# FACTS-landscape — protocols, standards, security, regulation, open-weight ecosystem, curriculum topic map

Status: **COMPLETE (v2, 2026-10-02).** H (topic map) updated with verified facts; §A–G written. A, B, C, E, G mostly first-party verified; D partly; **F is the weakest — EU dates are first-party-located [V-idx], US/UK/China items are [M]/[S] and must be checked at the listed official URLs before publishing.** Cross-checked against FACTS-models.md (open-weight lineups aligned to it).

Owner: landscape researcher. Date basis: today = 2026-10-01/02. Model lineups, prices, context windows and vendor API features live in `FACTS-models.md` (other researcher) — not duplicated here.
Conventions: **[verified: URL]** = checked first-party this pass; **[unconfirmed]** = not confirmed first-party, do not publish as fact; **[hype]** / **[substance]** = my honest read.
Level tags: **B** = ai-foundations (non-engineers, evergreen, no versions/prices) · **I** = ai-eng (builders) · **A** = ai-architect (decides/sizes/places/authorizes; never introduces a component).

---

## H. CURRICULUM TOPIC MAP (Oct 2026)

### H.0 How to use this map

- Each topic lists what to teach **at each level** and the **current coverage** I found by reading the module/concept lists of the three course files on 2026-10-01 (`ai-foundations` 8 modules, `ai-eng` 21, `ai-architect` 12). "GAP" = absent or only incidental. Coverage notes are based on concept lists + keyword search, so treat "GAP" as "confirm in the module before writing".
- The ladder rule from the brief applies: B explains *what it is and how to use it well*; I teaches *how to build it and the production judgment*; A only *sizes, places, budgets, sequences or authorizes* it (one clause per component, never a concept entry).
- Rows marked **NEW-12mo** became standard practice between Oct 2025 and Oct 2026.

### H.1 Priority gaps by course (start here)

**ai-foundations (B) — biggest gaps.** The course has zero coverage of agents and almost none of responsible use.
1. **Agents / "AI that does things"** (H.10, H.13, H.15): the word "agent" does not appear in the course. In 2026 the major consumer assistants ship agent modes, browser/computer-use agents and connectors (verified this pass for Claude — Claude in Chrome GA, computer use GA; others [M]). Teach: model + tools + loop; what to delegate; reading approval prompts; why a web page can hijack an agent (prompt injection in plain English). Strong candidate for a **new b2 module** (or a large expansion of `tools`).
2. **Thinking modes** (H.2): when to switch on "thinking"/deeper effort, why it is slower and costs more, when it does not help. Fits `using` ("Match effort to stakes" exists — make it explicit).
3. **Deep research features + checking citations** (H.11): fits `tools` or `limits`.
4. **Responsible use bundle** (H.31–H.36): privacy (what happens to what you type, memory, connectors), sycophancy and over-reliance, bias, copyright basics, deepfakes/voice-clone scams and content credentials, "you have a right to know it's AI". Currently only per-module "Privacy & safety notes". Strong candidate for a **new b2 module "Using AI Responsibly"**.
5. **Generation beyond text** (H.19–H.20, H.35): `tools` has "Generating images is a different model" — extend to video, voice cloning, editing, provenance labels.
6. **AI at work** (H.37): projects/custom instructions/connectors/memory as everyday workflow; evidence that AI speed-ups are real for some tasks and illusory for others.

**ai-eng (I) — gaps in the agentic and post-training layers.**
1. **Agent security refresh** (H.29): `aisec` (and quiz/cards/scenarios citing "LLM08") still teaches the **2023 OWASP LLM numbering** (LLM02 "Insecure Output Handling", LLM03 "Training Data Poisoning", LLM08 "Excessive Agency"). The **current edition is "OWASP GenAI LLM Top 10 2026", published 2026-08-04** — Excessive Agency is now **LLM03:2026**, Improper Output Handling **LLM10:2026**, new **LLM08:2026 Hidden Context Exposure** (full list §E.1, verified). Missing: lethal trifecta (appears only in ai-architect), tool poisoning/rug pulls, malicious MCP servers/skills supply chain, slopsquatting, exfiltration channels, CaMeL/dual-LLM design patterns, **OWASP Top 10 for Agentic Applications (ASI01–ASI10)**.
2. **Computer-use and browser agents** (H.13): zero coverage. Build loop, sandboxed VM, DOM/API-first rule, injection exposure.
3. **Coding agents as an engineering practice** (H.14): partly in `harness`. Missing: repo context files (AGENTS.md/CLAUDE.md), plan→implement→test loops, review discipline, CI/background agents, security of agents in repos.
4. **Agent protocols beyond MCP basics** (H.15–H.16): `tools` describes MCP only as "write once, use everywhere". Current spec is **2026-07-28** (stateless core, no sessions, Multi Round-Trip Requests for elicitation, OAuth hardening with Client ID Metadata Documents, Tasks/Apps/Skills as official extensions; Roots/Sampling/Logging deprecated) — §A.1. Also **A2A 1.0** (2026-03-12), **Agent Skills** (open standard since 2025-12-18, adopted by GitHub Copilot and others), **AGENTS.md** (AAIF project) — §A.2–A.4.
5. **Reasoning models engineering** (H.2): effort parameter/adaptive thinking, thinking-token cost and latency, interleaved thinking with tools, prompting differences. Concept "Reasoning as a dial" exists in `landscape` — needs a build-level treatment.
6. **RL-based post-training** (H.24): `finetune` has LoRA/QLoRA/DPO/RLHF but **no RFT, RLVR/GRPO, distillation pipeline** (zero mentions of reinforcement fine-tuning or GRPO).
7. **Self-hosting & inference optimization** (H.26–H.27): serving stacks, quantization formats, speculative decoding, KV-cache/prefix caching, throughput-vs-latency — mentioned only in passing.
8. **Voice/realtime agents** (H.19) and **image/video generation + provenance** (H.20, H.35): `multimodal` covers vision/doc ingestion and "audio input"; no speech-to-speech agents, no generation APIs, no C2PA/watermarking.
9. **Compliance engineering** (H.30): `lead` has one line on "EU AI Act-class" risk tiers. Missing: **EU Art. 50 transparency duties (apply since 2026-08-02; marking grace for older systems to 2026-12-02)**, the **Digital Omnibus delay of high-risk obligations to 2027-12-02 / 2028-08-02** (adopted, in force 2026-07-27), record-keeping/logging, provider-vs-deployer role (fine-tuning can make you a provider), US state laws touching builders (companion-chatbot rules, frontier transparency) — see §F (US dates need verification).
10. Smaller: durable execution for long-running agents (H.12), agentic search vs vector RAG and deep-research loops (H.7, H.11), late-interaction/visual-document retrieval (H.7), agent identity/authorization (H.28), OTel GenAI conventions status (still "Development", moved to its own repo — §A.5), framework landscape facts (Microsoft Agent Framework 1.0 replaced Semantic Kernel/AutoGen; GitHub "coding agent" renamed "cloud agent"; TGI in maintenance mode — §B, §C), eval-tool ownership changes (promptfoo → OpenAI, Langfuse → ClickHouse — §G).

**ai-architect (A) — governance and placement gaps (without introducing components).**
1. **Regulatory and compliance architecture** (H.30): Block 4 "Governing the System" has **no regulation content** (no EU AI Act, ISO/IEC 42001; NIST AI RMF only as a resource). Teach: classify each feature by role (provider/deployer) and risk tier, turn obligations into architecture requirements (logs retained, human-oversight control points, transparency marking, incident reporting clocks), map controls to ISO/IEC 42001 / NIST AI RMF. Regulatory change is itself a revisit trigger — the EU just moved high-risk dates by 16 months (Annex III: 2026-08-02 → 2027-12-02) and 12 months (Annex I: 2027-08-02 → 2028-08-02) (§F.1). Keep dates out of prose except in one dated note (house rule). Fits `quality`/`review` or a new b4 module.
2. **Placement decisions: API vs self-hosted open weights vs on-device** (H.25–H.27): TCO break-even, capacity in GPUs vs quota, data residency, licence constraints — as calculators. Fits `seams`/`capacity`/`budgets`.
3. **Agent authorization architecture** (H.28): `blast` has autonomy tiers and the trifecta test; add identity (whose credentials does the agent act with), delegated scopes, approval as a control point with false-block rate, audit trail completeness.
4. **Reasoning effort as a budget dimension** (H.2): effort changes p95 latency and cost variance per task — belongs in `budgets` (as parameters, no prices).
5. **Protocol and ecosystem bets as seams** (H.15–H.16): MCP/A2A/Skills under neutral foundations lower exit cost; vendor-specific agent runtimes raise it. One clause each in `seams`.
6. **Supply-chain governance** (H.29, H.30): who approves a new MCP server, skill, model or dataset; AI-BOM; licence review for open weights. Fits `orgarch`/`quality`.
7. **Human oversight that actually works** (H.34): automation bias makes "human in the loop" a weak control unless rate-limited and measured — fits `failure`/`quality` (oversight escape rate as a number).
8. **Long-running/durable agent state** (H.12): checkpoint/replay as a state-architecture decision — fits `statearch`.
9. **Compute, energy and concentration risk** (H.38): single-provider dependency, regional capacity, power constraints as capacity inputs — fits `capacity`.

### H.1b Concrete outdated statements spotted in current course text (for the module editors)

1. **ai-eng `aisec`** concept "OWASP LLM Top 10 as a review checklist", plus quiz/cards/scenarios/`res` notes citing "LLM08" for excessive agency and "LLM02 Insecure Output Handling": these are **2023 v1.1 IDs**. Current = OWASP GenAI LLM Top 10 **2026** (published 2026-08-04): Excessive Agency = **LLM03:2026**, Improper Output Handling = **LLM10:2026**, Supply Chain = LLM04:2026, Data and Model Poisoning = LLM05:2026, Unbounded Consumption = LLM06:2026 (§E.1 has the full crosswalk).
2. **ai-eng `mlops`** (concept text, a card, and `PATTERNS.code`: `span.set_attribute("gen_ai.system", "openai")`): `gen_ai.system` was **renamed `gen_ai.provider.name`** in OTel semconv v1.37; the GenAI conventions are still "Development" status and now live in `open-telemetry/semantic-conventions-genai` (§A.5).
3. **ai-eng `tools`** MCP text ("stdio or HTTP transport … write the integration once"): accurate but dated — add authorization, structured output, elicitation, extensions, the 2026-07-28 stateless revision, and that Sampling/Roots/Logging are now deprecated (§A.1).
4. **ai-eng `evals`** "Eval harness tooling (2026)": promptfoo is now **part of OpenAI** (still MIT open source); Langfuse is **part of ClickHouse** since Jan 2026 (§G.1) — fine to keep listing them; don't call them independent startups.
5. **ai-eng `lead`** "Regulatory landscape (EU AI Act-class)…": generic; the dated EU facts changed (high-risk postponed to 2027-12-02 / 2028-08-02; Art. 50 live since 2026-08-02) (§F.1).
6. **Open-weight names/licences** anywhere (ai-eng `landscape`): Gemma 4 is Apache-2.0; Meta's newest open model is Muse Glimmer (Apache-2.0) while Llama 4 is the last Llama; Kimi K3 has a custom licence with commercial thresholds (§C.1, FACTS-models §B).

---

### Cluster 1 — How models work and how to choose them

#### H.1a LLM basics (tokens, next-token prediction, training stages, stateless, knowledge cutoff)
- Levels: B, I
- B: prediction machine; tokens; pretraining → post-training (instruction tuning, human feedback, reinforcement learning on checkable tasks) in one picture; why it sounds confident; stateless chat; knowledge cutoff.
- I: sampling (temperature/top-p, and why reasoning models often fix or ignore them), input vs output vs thinking tokens, caching and batch economics, latency anatomy (TTFT vs tokens/sec).
- A: — (consumes as parameters).
- Why 2026: everything else (cost, hallucination, context) is explained by these mechanics.
- Coverage: B `whatai`/`tokens`/`chat` ✓ (add one line on post-training with RL, see H.24). I `llm` ✓.

#### H.2 Reasoning ("thinking") models and effort control — NEW-12mo for effort APIs
- Levels: B, I, A
- B: "thinking" modes spend extra time working through a problem before answering; better for multi-step maths, code, planning, tricky analysis; slower and costlier; little gain for lookups or rewriting; the visible "thoughts" are a summary, not a guaranteed true account of how it decided.
- I: test-time compute; effort/thinking-level parameters (vendor specifics in FACTS-models); adaptive thinking (model decides how long to think within an effort setting); thinking tokens billed as output; interleaved thinking between tool calls; carrying thinking blocks across turns where the API requires it; prompting differences (state the goal and constraints, drop "think step by step" boilerplate); measure quality vs effort on your eval set before choosing a default; latency SLO impact.
- A: effort is a third routing dimension next to model tier and context size; budget p95 latency and per-task cost variance by effort level; cap effort per route; treat "max effort" as an escalation rung, not a default.
- Why 2026: every frontier vendor now exposes reasoning as a dial on one model rather than a separate model family; the dial is the biggest single lever on cost and latency per task.
- Substance vs hype: substance for math/code/agentic tasks; gains on open-ended writing are small; chain-of-thought text is not a faithful explanation (monitorability is an active safety topic, H.36).
- Coverage: B partial (`using` "Match effort to stakes"). I partial (`landscape` "Reasoning as a dial, not a model"; `prompt` "Chain of thought" — check it isn't teaching CoT prompting as the main lever for reasoning models). A partial (effort mentioned; not a budget input).

#### H.3 Model landscape, selection and routing
- Levels: B, I, A
- B: big vs small, fast vs thinking, product features matter more than leaderboard position; no versioned names (house rule).
- I: tiering/cascades, routing by task, benchmark literacy (contamination, saturation, vendor-reported vs independent), open vs closed trade-offs, model migration testing. Current lineup facts → FACTS-models.md.
- A: exit cost, portability test, deprecation clock, multi-vendor seams (`seams`, `migrate`).
- Why 2026: model releases arrive every few weeks; teams that can swap models on evidence win on cost.
- Coverage: B `using` ✓. I `landscape` ✓ (dated "August 2026" — refresh). A `seams`/`migrate` ✓.

#### H.4 Benchmarks and capability measurement (literacy)
- Levels: B (light), I, A (light)
- B: leaderboards measure narrow things; your own test on your own task beats a headline score.
- I: what the agentic benchmarks measure (software-engineering, terminal, tool-use with simulated users, computer-use, web browsing, economically-valuable-task suites), why scores move with the harness, contamination; build a private eval set (H.21).
- A: never let a public benchmark be the acceptance criterion; require task-level evals on your distribution.
- Why 2026: vendors now headline agentic benchmarks whose results depend heavily on scaffolding and effort settings.
- Substance vs hype: [hype] treating a 2–3 point benchmark delta as a buying signal.
- Coverage: I `landscape` "Benchmarks lie (a little)" ✓; extend to agentic benchmarks.

### Cluster 2 — Context, prompting, memory, retrieval

#### H.5 Prompting → context engineering, compaction and memory — NEW-12mo (term and APIs)
- Levels: B, I, A
- B: prompting basics (task, context, format, example, iterate); "more text isn't always better"; projects/custom instructions as reusable context; memory features and how to view/delete them.
- I: context engineering as the discipline (what enters the window, in what order, when it leaves); context rot and lost-in-the-middle; compaction/summarisation and tool-result clearing; just-in-time retrieval via tools; sub-agent context isolation; cache-aware layout; file-based and tool-based memory; memory poisoning.
- A: context budget as an architectural allocation (fixed floors for system prompt/tools, per-turn growth, compaction thresholds); where memory lives and its deletion fan-out (`statearch`).
- Why 2026: agents run for hours; what stays in the window now determines quality more than prompt wording.
- Coverage: B `prompting`/`context`/`chat` ✓. I `prompt`/`context`/`memory` ✓ (strong). A `statearch` partial.

#### H.6 Long context vs retrieval
- Levels: B (light), I, A
- B: a bigger window is not perfect recall; ask for quotes/page refs.
- I: when stuffing beats RAG (small corpora, one-off analysis, with caching), when it doesn't (freshness, permissions, cost per query, recall degradation with length); measure needle-in-haystack is not enough — test multi-hop recall on your data.
- A: cost/latency break-even per query volume; cache-hit assumptions as budget inputs.
- Why 2026: 1M-token windows are common on frontier models, so "do we still need RAG?" is asked in every design review.
- Coverage: I `rag` "RAG vs long context" ✓; `llm` ✓. A `budgets` partial.

#### H.7 RAG and its 2026 variants
- Levels: B (concept), I (build), A (place/budget)
- B: "grounding": answers built from your documents (notebook-style tools, file uploads, enterprise search); still check the cited passage.
- I: pipeline; chunking; **hybrid** (BM25 + dense); **reranking** (cross-encoders/LLM rerankers); **contextual retrieval** (prepend chunk context before embedding/BM25); query rewriting/HyDE; parent-child; **GraphRAG** (entity/community graphs — good for global "what are the themes" questions, costly to build and refresh); **late interaction** (ColBERT-style multi-vector) and **visual document retrieval** (ColPali-style page-image embeddings; skip OCR for charts/tables); **agentic search** (the model iterates search/grep/read tools instead of one-shot top-k — what coding agents and deep-research features do); permissions-aware retrieval; citations.
- A: freshness contracts, re-index economics, which shape fits (`shapes`, `statearch`), per-query cost.
- Why 2026: one-shot vector top-k is no longer the default; hybrid + rerank is the floor and agentic search is displacing static pipelines for many tasks.
- Substance vs hype: [substance] hybrid + rerank, contextual retrieval; [mixed] GraphRAG (real wins on global questions, heavy maintenance); [hype] "RAG is dead" (long context and agentic search changed RAG, they didn't remove retrieval).
- Coverage: I `rag` ✓ (hybrid, rerank, agentic RAG, query transform), `dataeng` (KG integration, parent-child) ✓, `multimodal` (doc ingestion) ✓. GAPS: late interaction/ColPali (0 mentions), GraphRAG trade-offs (1 mention), agentic search over tools vs index.

#### H.8 Embeddings and vector stores
- Levels: I, A (light)
- I: embedding choice, dimensions/Matryoshka truncation, quantised vectors, pgvector-first, filtering, multi-tenancy, multimodal embeddings.
- A: re-embedding cost as migration budget (`statearch`, `migrate`).
- Coverage: I `embed`/`vecdb` ✓.

#### H.8b Document intelligence (parsing PDFs, tables, scans)
- Levels: I
- I: VLM-based parsing vs classic OCR/layout pipelines, page-image retrieval, table extraction evaluation, cost per page.
- Coverage: I `multimodal`/`dataeng` ✓.

### Cluster 3 — Agents

#### H.10 What an agent is → building the loop → autonomy and authorization
- Levels: B, I, A
- B: agent = model + tools + a loop that keeps going until done; examples in everyday apps (agent mode, deep research, coding helpers, browser agents); what to delegate (reversible, checkable tasks); approval prompts and why to read them; agents make more mistakes the longer the task; never hand an agent your passwords or payment details casually.
- I: workflow vs agent; agentic loop; stopping conditions; error compounding; tool design; human-in-the-loop; budgets and timeouts; observability; evals (H.21).
- A: autonomy tiers by reversibility; blast radius; who authorizes which tier (`blast`, `failure`).
- Why 2026: agents moved from demos to default product surfaces; the 2025–26 incident record (MITRE ATLAS case studies, §E.4) is dominated by agents *acting* — tool calls, exfiltration, code execution — not by models merely saying something wrong.
- Substance vs hype: [substance] coding, research, and back-office agents with checkable outputs; [hype] "fully autonomous digital employees" for open-ended, irreversible work.
- Coverage: B **GAP (0 mentions of "agent")**. I `agents` ✓. A `blast` ✓.

#### H.11 Deep research features and agentic research loops — NEW-12mo as a mainstream feature
- Levels: B, I, A (light)
- B: what deep-research modes do (plan, search many sources, read, write a cited report over minutes); great for orientation, literature scans and comparisons; failure modes (confident synthesis of weak sources, citation that doesn't support the claim, paywalled/fresh info missing); how to spot-check citations.
- I: build the loop (planner, search tool, fetch/read, notes/scratchpad, synthesis with citations), source-quality filtering, budget caps, citation-faithfulness evals, injection exposure from fetched pages.
- A: cost and time ceilings per report; where human review sits.
- Why 2026: deep-research modes ship in the major assistants [M — not re-verified this pass] and open models now advertise it as a headline capability (Kimi K3's README: "producing deep research with interactive visualizations" [V]).
- Coverage: B GAP. I GAP (adjacent: `rag` "Agentic RAG"). A —.

#### H.12 Agent harnesses, long-running agents and durable execution
- Levels: I, A
- I: harness responsibilities (context management, tools, permissions, hooks, sandbox, sub-agents, skills, checkpoints); build vs adopt (Agent SDKs and frameworks — LangGraph 1.x, OpenAI Agents SDK, Claude Agent SDK, Google ADK 2.x, Microsoft Agent Framework 1.x (successor to Semantic Kernel and AutoGen, which is in maintenance mode), CrewAI, Pydantic AI 2.x, Strands — §B.3); long-running tasks: progress files, checkpoints, resumability; **durable execution** engines (Temporal, DBOS, Restate, Inngest, Vercel Workflow — persist each step so an agent survives crashes/deploys and can wait days for approval — §B.4); idempotent tools.
- A: state placement for long-running agents (`statearch`); retry/replay semantics as reliability budget; build-vs-adopt as exit cost (`seams`).
- Why 2026: multi-hour agents and human approvals that wait days made "the process died" a top failure mode.
- Coverage: I `harness` ✓ (strong; no mention of durable-execution engines). A partial.

#### H.13 Computer-use and browser agents — NEW-12mo (consumer agentic browsers, computer-use APIs)
- Levels: B, I, A
- B: agents that see a screen and click/type for you; agentic browsers; good for tedious multi-site chores; slow and error-prone; a web page can contain hidden instructions that hijack them; keep them away from banking/email unless you supervise; log out of sensitive sites or use a separate profile.
- I: screenshot→reason→action loop; coordinate vs accessibility-tree/DOM actions; prefer API/DOM tools (e.g. a browser-automation MCP server) when available — pixels are the last resort; sandboxed VM/container per task; allow-listed domains; credential handling (never in the prompt); confirmation gates for purchases/sends; evals on recorded environments.
- A: authorization tier for screen-level actions (they bypass API-level scopes); isolation boundary; when a computer-use agent is the wrong shape (an API exists).
- Why 2026: every major lab ships a computer-use model or agentic browser; they carry the highest prompt-injection exposure of any agent type. Verified examples: Anthropic computer use is GA on the Claude API and **Claude in Chrome is GA on paid plans** (per-site permissions, stops before purchases); GitHub Copilot added computer use (preview) with the explicit rule "prefer an API/MCP/CLI when one exists" (§B.2).
- Substance vs hype: [mixed] real for form-filling and legacy UIs; reliability on long tasks is still well below humans. Documented hijacks exist (MITRE ATLAS "AI ClickFix" and computer-use data-destruction case studies, §E.4).
- Coverage: B GAP. I GAP (0 mentions). A partial (`blast` generic).

#### H.14 Coding agents and AI-assisted software development — NEW-12mo (agentic coding is the default workflow)
- Levels: B (light), I, A
- B: "vibe coding" — non-engineers can build small apps by describing them; what's safe to build that way (personal tools, prototypes) and what isn't (anything holding other people's data or money) without a professional review.
- I: terminal/IDE/cloud coding agents (§B); repo instruction files (AGENTS.md/CLAUDE.md); plan → implement → test loop with tests as the oracle; small diffs; parallel agents in worktrees/sandboxes; background/CI agents opening PRs; code review discipline for agent PRs; secrets and prompt injection via repo content/issues; package hallucination (slopsquatting); measuring real productivity (cycle time, defect escape, review load) rather than lines generated.
- A: governance of agent-authored changes (review gates, branch protections, who owns an agent PR), capacity of human review as the real bottleneck, measurement plan.
- Why 2026: coding agents now run in four places — terminal, IDE, desktop app and cloud/CI — and platforms host each other's agents (GitHub runs Anthropic Claude and OpenAI Codex as third-party agents; GitHub renamed its "coding agent" to "Copilot cloud agent"; GitHub Agentic Workflows run agents inside Actions with read-only tokens and declared "safe outputs") (§B.1). The bottleneck moved from typing to specification and review. ["most professional code is written with agents" — no first-party statistic verified; don't state a percentage.]
- Substance vs hype: [substance] large speed-ups on well-specified, well-tested work; [evidence of hype] a 2025 randomized study found experienced developers on their own mature repos were slower with AI tools while believing they were faster (§G cites it) — teach measurement, not vibes.
- Coverage: B GAP (one "vibe" mention). I partial (`harness` landscape). A GAP.

#### H.15 MCP (Model Context Protocol) — current-spec capabilities NEW-12mo
- Levels: B (one line), I, A (one clause)
- B: "connectors/apps" let an assistant reach your other tools; MCP is the common plug; only connect what you trust and check what each connector can do.
- I: servers/clients/hosts; tools, resources, prompts; transports (stdio, Streamable HTTP); **authorization (OAuth-based)** for remote servers (Client ID Metadata Documents now preferred over Dynamic Client Registration); **elicitation** (server asks the user for input mid-call — form or URL mode); **structured tool output** (output schemas, `structuredContent`); the **2026-07-28 stateless model** (no initialize handshake, no sessions, Multi Round-Trip Requests — remote servers scale like ordinary HTTP services); **official extensions**: Tasks (long-running calls), MCP Apps (interactive UI in the chat; works in Claude, ChatGPT, VS Code…), Skills over MCP; the **MCP Registry** (preview); security (tool poisoning, rug pulls, token passthrough anti-pattern, least-privilege scopes, pin/allow-list servers). **Do not teach Sampling/Roots/Logging as core features — deprecated in 2026-07-28.** Versions/dates → §A.1.
- A: MCP as a seam that lowers exit cost; who approves a new server (supply chain governance).
- Why 2026: MCP is the de facto tool-integration standard across vendors and, since 2025-12-09, a founding project of the Linux Foundation's Agentic AI Foundation (§A.1).
- Coverage: B GAP (connectors not named). I `tools` ✓ basic (no OAuth/elicitation/structured output/registry). A one mention.

#### H.16 Agent-to-agent and other agent protocols (A2A, AGENTS.md, Agent Skills, payments, llms.txt)
- Levels: I, A (light)
- I: **A2A 1.0** (released 2026-03-12; Linux Foundation project; signed Agent Cards, task lifecycle, JSON-RPC/gRPC/REST bindings; when you actually need it vs plain tool calls/MCP); **AGENTS.md** (repo instructions for coding agents; AAIF project); **Agent Skills** (open standard since 2025-12-18: folder with SKILL.md + scripts/references/assets, loaded by progressive disclosure; read by Claude products, GitHub Copilot and others — §A.4); **agent payment/commerce protocols** (AP2, ACP, x402, UCP — awareness, §A.6); **llms.txt** (docs index for agents; no evidence it affects AI search ranking — §A.7).
- A: which protocol bets reduce exit cost; trust boundaries between agents you don't own (`blast`, `seams`).
- Why 2026: interop between agents and tools is consolidating under neutral foundations; skills became the standard way to package know-how for agents.
- Substance vs hype: [substance] MCP, AGENTS.md, Skills; [early] A2A in production outside large enterprises; [hype/early] agent payments; [low evidence] llms.txt as an SEO/visibility lever.
- Coverage: I partial (`harness` "Skills & extensibility"; A2A 0 mentions). A partial.

#### H.17 Multi-agent systems
- Levels: I, A
- I: orchestrator–worker, sub-agents as context isolation, handoffs, cost multiplier, shared state, debugging.
- A: when multi-agent is justified by a constraint (context, parallelism, isolation) vs adds coordination tax.
- Coverage: I `multi` ✓. A `shapes` partial.

### Cluster 4 — Multimodal

#### H.18 Vision and document understanding
- Levels: B, I
- B: assistants read photos, screenshots, charts, handwriting; still hallucinate small text and numbers; check.
- I: VLM selection, resolution/token cost, document ingestion, grounding boxes, cross-modal evals.
- Coverage: B `tools` ✓. I `multimodal` ✓.

#### H.19 Voice and realtime agents — NEW-12mo (speech-to-speech in production)
- Levels: B, I, A (light)
- B: voice mode; real-time conversation; voice cloning exists and is used in scams (agree a family code word).
- I: cascaded (STT → LLM → TTS) vs native speech-to-speech; latency budget (sub-second turn), turn detection/barge-in, WebRTC/SIP telephony, tool calls during speech, transcripts for evals, disclosure that the caller is an AI.
- A: latency budget composition; disclosure obligations (§F) as requirements.
- Why 2026: voice agents are a common production use case (support, scheduling, sales) [M] and carry AI-disclosure obligations (EU Art. 50 chatbot disclosure; US state companion/bot-disclosure laws — §F).
- Coverage: B light. I partial (`multimodal` "Audio input patterns"; no speech-to-speech agents). A —.

#### H.20 Image and video generation and editing; provenance
- Levels: B, I, A (light)
- B: how image/video generators differ from chat models; editing by instruction; consistent characters; what they get wrong; labels and content credentials; rights and likeness.
- I: generation/editing APIs, cost per image/second of video, safety filters, **provenance**: C2PA content credentials and invisible watermarks (e.g. SynthID; text watermarking) — how to attach/check them and their limits; labeling obligations (§F).
- A: rights/likeness review as a control point; labeling as a compliance requirement.
- Why 2026: generation quality reached photorealism (video with synchronized audio). Labeling is now law, not etiquette: EU AI Act Art. 50 applies since 2026-08-02 (marking grace for older systems to 2026-12-02) with a Code of Practice on Transparency of AI-Generated Content; China's labeling measures have applied since 2025-09-01 (§F). Concrete vendor example (post dated 2026-08-14): "Future Claude models will generate text that contains a watermark", applied "globally at launch", with older models (launched before 2026-08-02) being added under the EU transition period; SynthID-Text-style, weak on short or factual text, removed by full rewrites; detection offered to eligible organisations (regulators, media, fact-checkers, researchers…); image/SVG files get a signed C2PA content credential [V: https://www.anthropic.com/news/claude-text-watermark].
- Coverage: B partial (`tools`). I GAP (0 mentions). A —.

### Cluster 5 — Quality, evaluation, observability

#### H.21 Evals (including agent evals)
- Levels: B (habit), I, A
- B: test the assistant on a few examples you know the answer to before trusting it for a task.
- I: eval-driven development; golden sets from failures; code-based graders first, LLM-as-judge with calibration against human labels (§G); pairwise vs pointwise; agent evals: task success in sandboxed environments, trajectory/tool-call checks, pass@k vs pass^k (reliability), cost/latency per task; online evals; red-team suites; tooling (§G).
- A: quality gates as control points with authority and false-block rate (`quality`); sample sizes for rollouts (`migrate`).
- Why 2026: agents make outputs long and non-deterministic; without evals, model upgrades and prompt changes are guesses.
- Coverage: I `evals` ✓ (strong). A `quality`/`migrate` ✓.

#### H.22 Observability and tracing
- Levels: I, A (light)
- I: traces/spans for LLM calls, tool calls and agent steps; OpenTelemetry GenAI semantic conventions (**still "Development" status; moved to the dedicated `semantic-conventions-genai` repo; now include agent spans, MCP, reasoning and cache token counts** — §A.5); token/cost attribution; PII in traces; sampling for online evals; MCP 2026-07-28 tells servers to use OpenTelemetry rather than MCP logging.
- A: trace retention vs privacy; isolation through logs (`blast`).
- Coverage: I `mlops`/`design` ✓ (verify OTel wording against §A status).

#### H.23 Hallucination, grounding and guardrails
- Levels: B, I, A
- B: hallucination, grounding, verify specifics.
- I: faithfulness scoring, abstention, structured constraints, layered guardrails (input/output classifiers, policy models), UX honesty.
- A: guardrail placement and false-block budgets.
- Coverage: B `limits` ✓. I `halluc` ✓. A `quality` ✓.

### Cluster 6 — Adaptation, open weights, inference

#### H.24 Fine-tuning, RL fine-tuning, distillation, synthetic data — RFT/RLVR NEW-12mo in mainstream practice
- Levels: B (one paragraph), I, A
- B: three ways to customise: instructions/prompts, giving it your documents (grounding), and retraining (fine-tuning) — usually in that order.
- I: SFT; LoRA/QLoRA; preference optimisation (DPO and variants); RLHF/RLAIF; **RL with verifiable rewards (RLVR) and GRPO-family algorithms** (open model recipes now literally read "Pretrain → SFT → RLVR"); **reinforcement fine-tuning** as a product (e.g. OpenAI's fine-tuning API takes `method.type` = `supervised` | `dpo` | `reinforcement`, RFT with a grader — §D.3); **distillation** (teacher → student, incl. distilling reasoning traces; mind provider terms — unauthorised distillation is a documented threat); synthetic data generation and filtering; reward hacking; catastrophic forgetting; eval methodology; tooling (TRL 1.x, Unsloth, Axolotl, verl — §D.2).
- A: decision economics (prompt/RAG first; fine-tune when volume × per-call savings or latency justify it); ownership of training data rights; re-tune cost on every base-model migration.
- Why 2026: reasoning models are trained with RL on verifiable tasks, and the same recipe is now offered as a product for narrow domains; distillation into small models is a major cost lever for high-volume, narrow tasks.
- Coverage: B GAP (fine-tuning not explained). I `finetune` ✓ for SFT/LoRA/DPO; **GAP: RFT/RLVR/GRPO/distillation**. A partial.

#### H.25 Small and on-device models
- Levels: B, I, A
- B: some AI runs on your phone/laptop (privacy, offline, faster for small tasks; less capable); assistants silently hand off to cloud models.
- I: small language models for routing, classification, extraction; quantisation; on-device runtimes; distillation into SLMs; when an SLM matches a frontier model on a narrow task.
- A: edge vs cloud placement as a latency/privacy/cost decision.
- Coverage: B GAP. I partial. A GAP.

#### H.26 Open weights and self-hosting
- Levels: B (light), I, A
- B: "open-weight" vs "open-source" vs closed; you can run some models yourself.
- I: leading families and licences (§C.1 — e.g. gpt-oss Apache-2.0; Kimi K3's licence adds revenue/MAU conditions; Llama's custom licence); serving stacks (vLLM, SGLang, TensorRT-LLM, llama.cpp/Ollama; orchestration layers NVIDIA Dynamo / llm-d; **Hugging Face TGI is in maintenance mode**); quantisation formats (GGUF, AWQ/GPTQ, FP8, MXFP4, NVFP4); GPU memory sizing (weights + KV cache); LoRA adapters at serving time; security (model provenance, pickle files, trust_remote_code, poisoned GGUF chat templates — ATLAS AML.CS0064).
- A: build-vs-buy TCO break-even; capacity in GPUs; licence obligations; data residency; sovereignty requirements.
- Why 2026: open-weight models are close behind the frontier at a fraction of the price, and data-residency demands push some workloads in-house.
- Coverage: B GAP. I partial (`landscape` "Open weights are frontier-adjacent", few serving details). A GAP.

#### H.27 Inference optimisation and cost engineering
- Levels: B (intuition), I, A
- B: bigger/thinking = slower/costlier; ask for shorter answers; pick the smaller model for simple tasks.
- I: prompt caching (layout for hits), batch APIs, model cascades/routing, effort control, output-length control, streaming, speculative decoding, KV-cache/prefix caching, continuous batching, quantisation, disaggregated prefill/decode (awareness), token accounting per task.
- A: cost per task (p95 not mean), quota vs fleet capacity, degradation ladders (`budgets`, `capacity`).
- Why 2026: per-token prices fall while tokens per task explode (reasoning + agents) — cost engineering moved from per-call to per-task.
- Coverage: B `using` ✓. I `llm`/`design` partial (caching/batch ✓; serving-side optimisation thin). A ✓.

### Cluster 7 — Security, safety, governance, society

#### H.28 Agent identity, authorization and delegation — NEW-12mo
- Levels: I, A
- I: agents act with *someone's* credentials — per-user OAuth vs service accounts; scoped, short-lived tokens; never put credentials in context; MCP authorization; audit logs that tie each action to user + agent + approval.
- A: authorization architecture per autonomy tier; approval as a control point; non-repudiation; separation of duties for agents.
- Why 2026: agent platforms and identity providers have started issuing first-class identities to agents [M — not re-verified this pass]; MCP's 2026-07-28 auth hardening and the OWASP ASI03 "Identity & Privilege Abuse" entry make this a mainstream concern; "the agent did it" is not an audit answer.
- Coverage: I GAP (0 mentions of OAuth). A partial (`blast`).

#### H.29 AI security (LLM + agentic)
- Levels: B (personal safety), I, A
- B: prompt injection in plain English (a web page or email can carry instructions the AI obeys); don't let agents read untrusted content while holding your private data and a way to send it out; AI-powered scams (voice clones, deepfake video calls, phishing).
- I: OWASP Top 10 for LLM Apps **2026 edition (published 2026-08-04)** and OWASP Top 10 for Agentic Applications 2026 (§E); direct/indirect injection; **lethal trifecta**; tool poisoning and rug pulls; malicious MCP servers/skills/packages; **slopsquatting**; exfiltration channels (markdown images, links, tool calls, DNS); design patterns (least privilege, dual-LLM/CaMeL-style plan/data separation, action-selector, sandboxing, egress allow-lists, human approval); red-teaming; incident response; MITRE ATLAS as threat vocabulary.
- A: trifecta test per agent; isolation boundaries; supply-chain approval process; incident clocks.
- Why 2026: real exploits in 2025–26 hit production agents, coding assistants and MCP/skill ecosystems — MITRE ATLAS v2026.09 carries 73 case studies including EchoLeak (zero-click M365 Copilot exfiltration), a poisoned Postmark MCP server, poisoned agent skills, OpenClaw RCE, and an espionage campaign run through a coding agent (§E.4); injection is unsolved at the model level, so defense is architectural. Reference lists: OWASP LLM Top 10 **2026** (2026-08-04) and OWASP Agentic Top 10 (ASI01–ASI10), MITRE ATLAS v2026.09.
- Coverage: B partial (no injection explanation). I `aisec`/`halluc`/`tools` ✓ but **stale OWASP numbering** and missing agentic classes. A `blast` ✓ (trifecta).

#### H.30 AI governance and regulation
- Levels: B, I, A
- B: the rules exist and are arriving (EU AI Act transparency: you should be told when you're dealing with AI or AI-made content; bans on some uses; AI literacy duty for organisations); keep it evergreen — no dates in Foundations.
- I: compliance engineering: role (provider vs deployer; modifying a model can make you a provider), risk tier, transparency/marking, logging/record-keeping, human oversight, incident reporting, US state laws relevant to builders (companion chatbots, frontier transparency, consumer-protection), China labeling — dates in §F; NIST AI RMF/GenAI profile and ISO/IEC 42001 as the control frameworks auditors ask about.
- A: obligation → architecture requirement mapping; an AI management system (ISO/IEC 42001) as the governance spine; regulatory change as a revisit trigger.
- Why 2026: EU GPAI obligations apply since 2025-08-02; Art. 50 transparency since 2026-08-02; the Digital Omnibus (Regulation (EU) 2026/1744, in force 2026-07-27) postponed high-risk obligations to 2027-12-02 (Annex III) / 2028-08-02 (Annex I) and added a ban on nudifier/CSAM generators (§F.1). Several US state laws took effect 2026-01-01 (California SB 53 and SB 243, Texas TRAIGA — [M], verify) while a December 2025 executive order targets state AI laws (§F.2–F.3). Enterprise buyers ask for ISO/IEC 42001-style evidence.
- Coverage: B GAP. I minimal (`lead` one line). A GAP (NIST resource only).

#### H.31 Privacy and data protection
- Levels: B, I, A
- B: what you type may be stored/reviewed/used for training depending on settings and account type; memory features; connectors grant access to your files/mail; don't paste others' personal data or secrets; work vs personal accounts.
- I: PII detection/redaction, data minimisation, retention and zero-data-retention options, DPAs, training opt-outs, data residency, deletion fan-out across caches/indexes/traces, memorisation/extraction risk.
- A: data flow and residency architecture; deletion SLAs (`statearch`).
- Coverage: B partial (sec notes). I partial. A `statearch` partial.

#### H.32 Bias and fairness
- Levels: B, I, A (light)
- B: models absorb patterns from their training data, including stereotypes; consequences in hiring/lending/health; keep humans accountable for consequential decisions.
- I: disaggregated evals across groups, counterfactual testing, documentation; legal hooks (algorithmic-discrimination laws — §F).
- A: impact assessments as gates for consequential decisions.
- Coverage: B GAP. I minimal. A GAP.

#### H.33 Copyright, licensing and IP
- Levels: B, I, A (light)
- B: who owns outputs (often unclear/limited protection for purely AI-generated works), training-data disputes in the courts, don't pass off generated work where disclosure is required, style/likeness concerns.
- I: licence terms of models and outputs, open-weight licence restrictions, training-data provenance for fine-tuning, indemnities offered by vendors, code licence contamination in generated code.
- A: legal review as a control point; vendor indemnity as part of buy decisions.
- Coverage: B GAP. I minimal. A GAP.

#### H.34 Sycophancy, over-reliance and calibrated trust
- Levels: B, I, A
- B: models tend to agree with you and flatter; ask for critique and counter-arguments; automation bias; skill atrophy; emotional reliance on companion chatbots (special care for teens).
- I: sycophancy evals; product design for calibrated trust (show sources, uncertainty, friction on consequential actions); companion-chatbot safeguards (§F SB 243).
- A: "human in the loop" as a control with a measured escape rate, not an assumption.
- Why 2026: publicised sycophancy regressions and chatbot-harm cases [M] drove new law (California SB 243 on companion chatbots, §F.3) and vendor safeguards.
- Coverage: B GAP. I minimal (2 mentions). A GAP.

#### H.35 Deepfakes and synthetic-media literacy
- Levels: B, I
- B: what's now easy to fake (voice, face, video, documents); verification habits (call back on a known number, family code word, check the source not the clip); content credentials and watermarks help but can be stripped, and a missing label proves nothing; generic AI-text detectors are unreliable — don't accuse people on their output (vendor watermark checks are a different, narrower thing).
- I: provenance implementation (C2PA signing at generation, watermark checks), labeling duties (EU Art. 50; China labeling measures — §F), abuse prevention (likeness consent, NCII policies: the EU Omnibus added a ban on nudifier/CSAM generators; the US TAKE IT DOWN Act requires 48-hour takedown of non-consensual intimate imagery [M]); deepfake fraud against identity checks is documented (MITRE ATLAS CS0033 live deepfake injection vs mobile KYC; CS0034 ProKYC) [V].
- Coverage: B GAP. I GAP.

#### H.36 AI safety basics
- Levels: B, I, A (light)
- B: how labs try to make models safe (training for helpful/honest/harmless behaviour, refusal policies, testing for dangerous capabilities); limits (jailbreaks); why companies publish safety frameworks.
- I: model specs/constitutions; safety classifiers; reward hacking and specification gaming in agents (agents that edit tests to pass); chain-of-thought monitoring; frontier safety frameworks and system cards as inputs to vendor choice.
- A: vendor safety posture and incident history as part of vendor risk.
- Coverage: B partial (`limits`). I partial. A GAP.

#### H.37 AI at work and productivity
- Levels: B, I (team lead), A (org)
- B: practical workflows (drafting, summarising, analysis, learning), projects/custom instructions/connectors, matching tasks to tools, verifying, disclosure norms at work.
- I: rolling out assistants and agents to a team, measuring impact, change management (`lead`).
- A: org design around AI platforms (`orgarch`).
- Substance vs hype: [substance] measurable gains on bounded tasks; [hype] blanket "10x" claims; evidence is mixed and task-dependent.
- Coverage: B `using` partial. I `lead` ✓. A `orgarch` ✓.

#### H.38 Compute, energy and AI economics
- Levels: B (light), I (light), A
- B: AI runs in large data centres; energy/water use per query is small but adds up at scale; why prices are falling.
- I: GPU generations and what they mean for self-hosting (§C); price-per-token trends vs tokens-per-task growth.
- A: capacity planning in GPUs/quota; provider concentration risk; power/region constraints.
- Coverage: B light. I light. A `capacity` partial.

#### H.39 Generative UI and agent-facing product surfaces — NEW-12mo, early
- Levels: I (light), A (light)
- I: apps rendered inside assistants (MCP UI extensions / vendor apps SDKs), structured outputs driving UI, streaming partial results; designing for agent customers (APIs and docs that agents can use).
- A: distribution through assistants as a channel decision.
- Substance vs hype: [early] — teach as awareness.
- Coverage: GAP everywhere (fine for now; one concept in ai-eng `tools` or `design`).

### H.40 Hype watch (say so explicitly in courses)
- "AGI next year" timelines; "agents replace whole jobs"; "RAG is dead"; "prompt engineering is dead" (it became context engineering); "multi-agent is always better"; AI-text detectors; benchmark deltas as purchasing signals; llms.txt as an AI-SEO fix; agent payments as near-term mass behaviour; "self-improving" agents. Substance to keep: reasoning dials, coding agents, hybrid retrieval + rerank, evals, caching/batching, MCP/Skills, architectural injection defenses.

### H.41 Watch list — likely to change before the next review (re-verify, don't freeze into prose)
- MCP Registry leaving preview; Sampling/Roots/Logging removal (eligible from the first spec revision on/after 2027-07-28).
- OTel GenAI conventions moving from Development to stable.
- A2A adoption beyond large enterprise platforms; agent-commerce protocols (AP2/ACP/UCP/x402) consolidating.
- US: federal pre-emption of state AI laws (EO of 2025-12-11 → litigation/legislation); Colorado AI Act status after 2026-06-30; New York RAISE effective 2027-01-01.
- EU: harmonised standards and Commission guidelines for high-risk systems ahead of 2027-12-02; Art. 50 marking grace ends 2026-12-02.
- Eval/observability vendor consolidation (promptfoo → OpenAI, Langfuse → ClickHouse in 2026).
- Open-weight licences adding commercial thresholds (Kimi K3) — re-read licences each release.

(Topic-level dated facts are in §A–G below.)

---

## Verification legend and limits (read before using §A–G)

- **[V]** verified this pass by fetching a first-party source (spec repo, vendor doc, official package registry). URL given.
- **[V-idx]** first-party page located in search results (title/snippet seen), but the page itself could not be fetched because this session's egress policy blocks it; content corroborated by ≥2 independent secondary sources. Good enough to plan with; re-check before publishing a date.
- **[S]** secondary sources only (law-firm notes, trade press, trackers) → treat as **[unconfirmed]**.
- **[M]** from my training knowledge (≤ mid-2026), not re-verified this pass → **[unconfirmed]** for anything time-sensitive.
- **Access limits this pass:** egress blocks eur-lex, consilium, europarl, digital-strategy.ec, whitehouse.gov, federalregister.gov, all US state legislature sites, gov.uk, cac.gov.cn, nist.gov, owasp.org, openai.com, ai.google.dev, docs.cloud.google.com, huggingface.co, arxiv.org, cursor.com, linuxfoundation.org. Reachable: raw.githubusercontent.com (spec repos), pypi.org, registry.npmjs.org, anthropic.com / claude.com / platform.claude.com / code.claude.com, blog.modelcontextprotocol.io, cloud.google.com/blog. The session-wide WebSearch budget (200) was exhausted early in this pass. **Consequence: §F (regulation) is the weakest section** — every US/UK/China date there is [M] or [S] and must be confirmed against the official URL listed before it goes into a course.

---

## A. PROTOCOLS & STANDARDS

### A.1 MCP (Model Context Protocol)

- **Current spec version: `2026-07-28`**, released 2026-07-28 ("the largest revision of the protocol since launch"; RC published 2026-05-21; beta SDKs 2026-06-29). Previous revisions: `2025-11-25` (one-year anniversary), `2025-06-18`, `2025-03-26`, `2024-11-05`. [V: https://blog.modelcontextprotocol.io/tags/release/ ; changelog source https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/docs/specification/2026-07-28/changelog.mdx]
- **What changed in 2026-07-28** [V, changelog]:
  - **Stateless core**: the `initialize`/`initialized` handshake is gone; every request carries protocol version and client capabilities in `_meta`; new required `server/discover` RPC. **Protocol-level sessions and the `Mcp-Session-Id` header removed** from Streamable HTTP (servers needing state mint explicit handles passed as tool arguments). Practical effect: remote MCP servers can sit behind ordinary load balancers without session affinity.
  - **Multi Round-Trip Requests (MRTR)** replace server-initiated requests (elicitation, sampling, roots): the server returns `resultType: "input_required"` with `inputRequests`; the client retries the original request with `inputResponses`. All results now carry `resultType`.
  - `subscriptions/listen` replaces the GET stream and `resources/subscribe`; SSE resumability removed; `ping` and `logging/setLevel` removed.
  - **Tasks** (long-running/async calls) moved out of core into the official extension `io.modelcontextprotocol/tasks` (polling via `tasks/get`, input via `tasks/update`).
  - **Cacheable list results** (`ttlMs`, `cacheScope`); servers SHOULD return `tools/list` in deterministic order "to improve LLM prompt cache hit rates"; required `Mcp-Method`/`Mcp-Name` headers so gateways can route without parsing bodies; OpenTelemetry trace-context propagation (`traceparent`, `tracestate`, `baggage`) documented for `_meta`.
  - **Structured tool I/O**: `inputSchema`/`outputSchema` accept any JSON Schema 2020-12 keywords; `structuredContent` may be any JSON value.
  - **Authorization hardening**: clients MUST validate `iss` per RFC 9207; credentials bound to the issuing authorization server; `application_type` required in Dynamic Client Registration; **Dynamic Client Registration deprecated in favour of Client ID Metadata Documents (CIMD)**.
  - **Deprecated** (remain functional; earliest removal = first revision on/after 2027-07-28): **Roots, Sampling, Logging, Dynamic Client Registration**; the old HTTP+SSE transport (deprecated since 2025-03-26) reclassified. A formal feature-lifecycle policy (Active → Deprecated → Removed, ≥12-month window) was adopted. [V: .../2026-07-28/deprecated.mdx]
- **2025-11-25 highlights** (still relevant background) [V]: OpenID Connect discovery; icons; incremental scope consent via `WWW-Authenticate`; **URL-mode elicitation**; tool calling inside sampling; CIMD recommended; experimental tasks; SDK tiering; JSON Schema 2020-12 as default dialect.
- **Capabilities to teach, as of Oct 2026**: tools (with output schemas / structured content), resources, prompts; elicitation (form and URL mode, now via MRTR); OAuth-based authorization for remote servers (Protected Resource Metadata, CIMD); **official extensions** — **MCP Apps** (interactive UI rendered in sandboxed iframes; extension spec dated 2026-01-26; client docs exist for ChatGPT, Claude, VS Code, Goose, Postman) [V: https://github.com/modelcontextprotocol/ext-apps], **Tasks**, **Skills over MCP** (discover/read Agent Skills via MCP resources), auth extensions (OAuth client credentials; enterprise-managed authorization) [V: docs/extensions/overview.mdx]. Do **not** teach Sampling/Roots/Logging as core features any more.
- **Registry**: official MCP Registry at https://registry.modelcontextprotocol.io launched in **preview 2025-09-08** [V-idx: blog post "Introducing the MCP Registry"]; API v0.1 frozen 2025-10-24 [S]; **GA status as of Oct 2026 [unconfirmed]** (one third-party source says v0.1 was still live in Aug 2026).
- **SDKs**: Tier 1 = TypeScript, Python, Go, C# (all updated for 2026-07-28); Rust SDK supports it in beta; Ruby SDK 1.0 (Tier 2) 2026-07-27 [V: release blog]. PyPI `mcp` **2.0.0 released 2026-07-28**, latest 2.2.0 (2026-09-07); npm `@modelcontextprotocol/sdk` 1.31.0 (2026-09-28) [V: pypi.org, registry.npmjs.org].
- **Governance**: on **2025-12-09** MCP became a founding project of the **Agentic AI Foundation (AAIF)**, "a directed fund under the Linux Foundation", co-founded by Anthropic, Block and OpenAI with support from Google, Microsoft, AWS, Cloudflare and Bloomberg; the other founding projects are **goose** (Block) and **AGENTS.md** (OpenAI). Technical decisions stay with the MCP maintainers via the SEP process. [V: https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/]. AAIF member counts [S, unconfirmed].
- **Canonical URLs**: spec https://modelcontextprotocol.io/specification/2026-07-28 · changelog https://modelcontextprotocol.io/specification/2026-07-28/changelog · release post https://blog.modelcontextprotocol.io/posts/2026-07-28/ · extensions https://modelcontextprotocol.io/extensions/overview · registry https://registry.modelcontextprotocol.io
- **Course implications**: ai-eng `tools` describes MCP only as "write once, use everywhere" — add remote servers + OAuth authorization, structured output, elicitation, extensions (Apps, Tasks), the registry, and the stateless 2026-07-28 change; never teach token passthrough (a server forwarding the client's token to downstream APIs) — the spec's security guidance forbids it [M]. ai-architect: one clause in `seams` (MCP is now foundation-governed, lowering exit cost).

### A.2 A2A (Agent2Agent Protocol)

- **Version: 1.0** (spec "Latest Released Version 1.0.0"; protocol version is Major.Minor, sent as `A2A-Version: 1.0`). **v1.0.0 released 2026-03-12**, patch **v1.0.1 on 2026-05-26** (spec fixes). v1.0 broke compatibility with v0.3.0: spec refactored into a canonical data model (`spec/a2a.proto` is normative) + protocol bindings (**JSON-RPC, gRPC, HTTP/REST**, plus custom); OAuth flows modernised (implicit/password removed; device code and PKCE added); `tasks/list`; multi-tenancy; **signed Agent Cards** (`AgentCardSignature`, with JSON canonicalisation). [V: https://raw.githubusercontent.com/a2aproject/A2A/main/CHANGELOG.md ; docs/specification.md]
- **Governance**: Linux Foundation project (repo `a2aproject/A2A`, Apache-2.0; v1.0 added an "LF prefix" to the proto package) [V]. Originally announced by Google 2025-04-09 and donated to the LF in 2025 [M]. **Not** one of the AAIF founding projects [V: AAIF announcement lists MCP, goose, AGENTS.md]. "150+ supporting organizations" at the one-year mark (Apr 2026) [S].
- **Adoption signals**: Python `a2a-sdk` 1.0.0 (2026-04-20), latest 1.2.1 (2026-09-30) [V: PyPI]; Microsoft Agent Framework 1.0 advertises "cross-runtime interoperability via A2A and MCP" [V: microsoft/autogen README]; AP2 is defined as an extension of A2A and MCP [V: Google Cloud blog].
- **Canonical URLs**: https://a2a-protocol.org/latest/specification/ (not fetched) · https://github.com/a2aproject/A2A
- **Teach**: A2A = delegation between *opaque agents you don't own* (Agent Card discovery, task lifecycle, streaming/push, auth); MCP = agent-to-tool/context. Most teams need MCP first; A2A when integrating with other organisations' agents or enterprise agent platforms. [substance, early in production outside large enterprises]

### A.3 AGENTS.md

- "A simple, open format for guiding coding agents … a README for agents" (dev-environment tips, test commands, PR conventions). Site https://agents.md ; repo https://github.com/agentsmd/agents.md (identical content at `openai/agents.md`). AAIF founding project since 2025-12-09. [V]
- Teach next to vendor-specific files (CLAUDE.md, `.github/copilot-instructions.md`) — same idea, different filenames; keep them short, factual, and in version control.

### A.4 Agent Skills — yes, an open standard

- Launched by Anthropic **2025-10-16**; **published as an open standard on 2025-12-18** with the spec at https://agentskills.io (organisation-wide skill management and a partner skills directory announced the same day). [V: https://claude.com/blog/skills update note]
- Format: a folder with a required `SKILL.md` (YAML metadata, at minimum `name` and `description`, plus instructions) and optional `scripts/`, `references/`, `assets/`. Loaded by **progressive disclosure**: discovery (only name + description at startup) → activation (full SKILL.md when the task matches) → execution (run bundled scripts / read referenced files on demand). Repo https://github.com/agentskills/agentskills (code Apache-2.0, docs CC-BY-4.0); "originally developed by Anthropic, released as an open standard … open to contributions". [V]
- On Anthropic's own platform, **Agent Skills + the Skills API (`/v1/skills`) went GA on the Claude API on 2026-08-19** (per FACTS-models §A1, [V] there).
- Cross-vendor adoption, first-party evidence: **GitHub Copilot** supports skills in cloud agent, code review, Copilot CLI, the Copilot app and VS Code agent mode, reading `.github/skills`, `.claude/skills` or `.agents/skills` (personal: `~/.copilot/skills`, `~/.agents/skills`), plus `gh skill` to install from repos [V: github/docs `about-agent-skills.md`]; MCP has an official **Skills over MCP** extension [V]; the MCP Apps repo ships its own Agent Skills [V]. Claims of 30+ adopting tools (Codex, Gemini CLI, Cursor, …) [S].
- Governance: stewardship body **[unconfirmed]** (one secondary source claims AAIF; the official repo does not say so).
- Security note: skills are executable supply chain — MITRE ATLAS case study "Supply Chain Compromise via Poisoned ClawdBot Skill" (AML.CS0049) [V, §E].

### A.5 OpenTelemetry GenAI semantic conventions

- **Status: Development** (not stable) for the GenAI conventions as a whole and for individual `gen_ai.*` attributes (e.g. `gen_ai.operation.name`, `gen_ai.provider.name`) [V: https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/README.md].
- **Moved to a dedicated repo** `open-telemetry/semantic-conventions-genai` — a breaking change recorded in core semconv **v1.42.0** (core repo is now at v1.44.0); all `gen_ai.*`, OpenAI-specific and MCP conventions now live there [V: core CHANGELOG].
- Coverage: model spans, **agent spans** (`invoke_agent` client vs internal, `create_agent`, `execute_tool`), events (incl. an evaluation-result event), metrics (operation duration, token usage, time-to-first-chunk), **MCP** conventions, provider-specific notes (Anthropic, OpenAI, Azure AI Inference, AWS Bedrock). Recent additions: `gen_ai.usage.reasoning.output_tokens`, `gen_ai.usage.cache_read.input_tokens` / `cache_creation.input_tokens`, retrieval spans, `gen_ai.request.stream`. Earlier renames to know: `gen_ai.system` → `gen_ai.provider.name`; chat history moved from per-message events to `gen_ai.input.messages` / `gen_ai.output.messages` attributes (v1.37). [V: core CHANGELOG]
- Course wording: "OpenTelemetry's GenAI semantic conventions (still in Development status as of October 2026 — pin the schema version; names still change)". MCP 2026-07-28 tells servers to use OpenTelemetry instead of MCP Logging [V].

### A.6 Agent payment / commerce protocols (teach as awareness; [early])

| Protocol | Who | Status (Oct 2026) | Source |
|---|---|---|---|
| **AP2** Agent Payments Protocol | Google + 60+ orgs at launch | Announced **2025-09-16**; "Mandates" = cryptographically signed verifiable credentials (Intent Mandate, Cart Mandate) proving what the user authorised; usable "as an extension of A2A and MCP"; A2A **x402 extension** for crypto | [V: https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol ; repo google-agentic-commerce/AP2] |
| **ACP** Agentic Commerce Protocol | Maintained by **OpenAI and Stripe** | **Beta**; spec versions 2025-09-29 (initial), 2025-12-12, 2026-01-16, 2026-01-30, **2026-04-17** (cart, feed, orders, authentication, MCP) | [V: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol] |
| **x402** | Coinbase-originated; repo now `x402-foundation/x402` | Uses HTTP 402 for internet-native payments (crypto and fiat); SDK v2 (`@x402/core` 2.28.0, 2026-09-29) | [V: repo + npm]; x402 Foundation under the Linux Foundation announced 2026-04-02, operational 2026-07-14 [S] |
| **UCP** Universal Commerce Protocol | Google + Shopify (co-developed) | Apache-2.0 open standard for discovery/checkout/orders between agents and merchants | [V: repo Universal-Commerce-Protocol/ucp]; announced 2026-01-11 at NRF, 20+ partners [S] |

Teaching point: the hard problems are authorisation evidence (what exactly did the human approve?), human-present vs delegated purchases, spending limits, and dispute liability — not the wire format.

### A.7 llms.txt

- A proposal (Answer.AI, 2024 [M]) for a `/llms.txt` Markdown index that helps LLMs/agents read a site's docs; repo https://github.com/AnswerDotAI/llms-txt. Real use: docs sites publish it for coding agents (e.g. the Inspect eval framework publishes `inspect.aisi.org.uk/llms.txt` [V: inspect_ai README]). No first-party evidence that major search/AI crawlers use it for ranking or citation [unconfirmed]. Teach as "docs for agents", **not** as an SEO lever. [hype if sold as AI-SEO]

---

## B. AGENTIC ECOSYSTEM (versions from official package registries, 2026-10-01)

### B.1 Coding agents

- **Claude Code** (Anthropic): terminal, IDE, GitHub (@claude), desktop/web; docs https://code.claude.com/docs/en/overview ; npm install deprecated in favour of native installers; `@anthropic-ai/claude-code` 2.1.287 (2026-10-01). [V: anthropics/claude-code README, npm]
- **OpenAI Codex**: Codex CLI (local, open source), IDE extension, desktop app (`codex app`), cloud agent "Codex Web" at chatgpt.com/codex; `@openai/codex` 0.160.0 (2026-10-01). [V: openai/codex README, npm]
- **Gemini CLI** (Google): open source (Apache-2.0), MCP support, free tier "60 requests/min and 1,000 requests/day with personal Google account"; `@google/gemini-cli` 0.62.0 (2026-09-29). [V: README, npm]
- **GitHub Copilot**: the "Copilot coding agent" is now **Copilot cloud agent** (docs redirect from coding-agent URLs); **Copilot CLI** (`@github/copilot` 1.0.91; "same agentic harness as Copilot cloud agent"; ships GitHub's MCP server); **GitHub Copilot app** (desktop, parallel agent sessions, per-session model and reasoning effort); **third-party coding agents on GitHub** — Anthropic Claude and OpenAI Codex (public preview); **GitHub Agentic Workflows** (preview: markdown-defined agent automations run in Actions, firewalled containers, read-only tokens by default, writes only via declared "safe outputs"); **computer use** in Copilot CLI/app (preview; macOS/Windows); Copilot Memory, hooks, plugins, Agent Skills. [V: github/docs content/copilot/concepts/agents/*]
- Trend (from FACTS-models §A, [V] there): nearly every model lab now ships its own terminal coding agent — Kimi Code CLI, Z.ai ZCode, MiniMax Code, Qwen Code, Meta Muse Code, DeepSeek harness components — alongside Claude Code, Codex and Gemini CLI/Antigravity. Teaching consequence: the harness is a commodity layer; what differs is model quality, permissions/sandboxing, and ecosystem (skills, MCP, CI integration).
- Others with first-party package evidence: opencode (`opencode-ai` 1.18.34), Amp (Sourcegraph; npm renamed to `@ampcode/cli`), Qwen Code 0.24.7, Kilo Code CLI 7.8.3 [V: npm]. **Cursor**, Windsurf/Devin, Google Jules/Antigravity, AWS Kiro, JetBrains Junie, Factory, Cline: not verified this pass (sites blocked) [unconfirmed].
- Agent SDKs that expose these harnesses: **Claude Agent SDK** (`claude-agent-sdk` 0.2.163; 0.1.0 on 2025-09-28 when it was renamed from the Claude Code SDK) [V: PyPI].

### B.2 Computer-use and browser agents

- **Anthropic**: computer use is **GA on the Claude API** (tool version `computer_toolset_20260801`, no beta header) and beta on some cloud platforms; documented mitigations: dedicated VM/container with minimal privileges, no sensitive data/credentials, domain allow-list, human confirmation for consequential actions; automatic classifiers flag prompt injection in screenshots [V: https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool]. A separate **browser use** toolset (`browser_toolset_20260801`) shipped the same day computer use left beta (2026-08-19) (FACTS-models §A1). **Claude in Chrome** is GA on all paid plans; default "automatic approval with guardrails" or per-site **Permissions Mode**; a separate safety check reviews actions for hidden instructions; stops before purchases/financial actions [V: https://claude.com/chrome].
- **GitHub Copilot** computer use (preview): accessibility tree + screenshots; docs say prefer an API/MCP/CLI/browser tool when one exists [V].
- **OpenAI**: computer-use tool in the Responses API (`ComputerToolCall`, batched actions) [V: openai/openai-openapi spec]; ChatGPT agent mode and the Atlas browser [unconfirmed this pass].
- **Google** (Gemini computer-use model; Gemini in Chrome), **Microsoft** (Copilot Studio computer use; Edge Copilot Mode), **Perplexity Comet**: [unconfirmed this pass — first-party sites blocked].
- Real incidents: "AI ClickFix: Hijacking Computer-Use Agents Using ClickFix" (AML.CS0055), "Data Destruction via Indirect Prompt Injection Targeting Claude Computer-Use" (AML.CS0046) [V: MITRE ATLAS changelog].

### B.3 Agent frameworks (latest version · date of 1.0/2.0)

| Framework | Latest (date) | Milestone | Notes |
|---|---|---|---|
| LangGraph / LangChain | 1.2.12 (2026-09-21) / 1.4.3 (2026-09-28) | both 1.0 on 2025-10-17 | JS `@langchain/langgraph` 1.4.18 |
| OpenAI Agents SDK | `openai-agents` 0.22.3 (2026-09-17); JS 0.18.0 | still 0.x | Temporal integration now a separate package `temporalio-openai-agents` [V] |
| Claude Agent SDK | 0.2.163 (2026-09-30) | 0.1.0 2025-09-28 | Claude Code's harness as a library |
| Google ADK | 2.10.0 (2026-09-25) | 1.0 2025-05-20; **2.0 2026-05-19** | |
| **Microsoft Agent Framework** | 1.19.0 (2026-09-18) | **1.0 2026-04-02** | Successor to **Semantic Kernel and AutoGen; AutoGen is in maintenance mode**; graph workflows with checkpointing, HITL, time-travel; A2A + MCP; durable extension [V: READMEs] |
| CrewAI | 1.15.23 (2026-09-28) | 1.0 2025-10-20 | |
| Pydantic AI | 2.52.0 (2026-09-30) | 1.0 2025-09-05; **2.0 2026-06-23** | |
| AWS Strands Agents | 1.57.2 (2026-10-01) | 1.0 2025-07-15 | |
| Mastra (TS) / Vercel AI SDK | `@mastra/core` 1.74.0 / `ai` 7.0.127 | | |
| smolagents / Llama Stack | 1.26.0 / 0.7.3 | | |

[V: pypi.org/pypi/<pkg>/json and registry.npmjs.org, fetched 2026-10-01/02]

### B.4 Durable execution for agents

- Why: multi-hour agents and approvals that wait days need each step persisted so a crash/deploy resumes instead of restarting (and doesn't repeat side effects).
- Options [V: PyPI/npm]: **Temporal** (`temporalio` 1.34.0; OpenAI Agents SDK integration via `temporalio-openai-agents`), **DBOS** (3.2.0, Postgres-backed), **Restate** (Python SDK 1.0.5), **Inngest** (4.21.1), **Vercel Workflow SDK** (`workflow` 5.0.1), Microsoft Agent Framework durable extension (Durable Task / Azure Functions), LangGraph checkpointers; MCP's Tasks extension covers long-running *tool calls* at the protocol level.
- Teach (I): idempotency keys on side-effecting tools, deterministic replay, human-approval as a durable wait, timeouts/compensation. (A): where state lives, replay cost, exit cost of a workflow engine.

---

## C. OPEN-WEIGHT MODELS & SELF-HOSTING (brief; lineups/prices are in FACTS-models.md)

### C.1 Leading open-weight families and licences

**Lineups, sizes and dates are canonical in `FACTS-models.md` (§A "Changed since", §B3–B11) — use that sheet for model names.** This table is about *licence types*, aligned with it on 2026-10-02.

| Family (current open release) | Licence type | Source |
|---|---|---|
| OpenAI **gpt-oss** 120b / 20b (117B/5.1B active; 21B/3.6B; 120b fits one 80 GB GPU; native **MXFP4**) | **Apache-2.0** | [V: openai/gpt-oss] |
| **Qwen** 3.5 → 3.6 → **3.8** (incl. 2.4T-A95B flagship weights, Aug 2026; Qwen3.8-Flash-Next previews Qwen4) | per-checkpoint licence on Hugging Face (Qwen3.x historically Apache-2.0) — check each card | [V: QwenLM READMEs; FACTS-models B8] |
| **DeepSeek** R1, V3.2-Exp (open, **MIT**); current API models V4-Pro / V4.1-Flash | V4-family weight licence [unconfirmed]; NVIDIA published "DeepSeek-V4 on NVIDIA Blackwell" optimisations (2026-07-17) | [V: deepseek-ai repos, NVIDIA/TensorRT-LLM README; FACTS-models B7] |
| **Kimi K3** (Moonshot; 2.8T total / 104B active, 1M context) | **"Kimi K3 License"**: MIT-style, but a Model-as-a-Service business with >$20M revenue over 12 months needs a separate agreement, and products with >100M MAU or >$20M monthly revenue must display "Kimi K3". (K2/K2.5 were "Modified MIT".) | [V: MoonshotAI/Kimi-K3 LICENSE] |
| **GLM-5.3** / 5.3-Flash (Z.ai) | not stated in README (GLM-4.5 was MIT; GLM-5 family MIT at launch per FACTS-models) — verify on HF | [V: zai-org/GLM-5] |
| **MiniMax-M3** (~428B / ~23B active, 1M, multimodal); MiniMax-H3 open video+audio generation | licence file on HF [unconfirmed] (M2 was MIT) | [V: MiniMax-AI repos] |
| **NVIDIA Nemotron 3** Nano (31.6B/3.6B), Super (120.6B/12.7B), Ultra (550B/55B, 1M ctx); Nemotron 3.5 Lightning (30B-A3B) | NVIDIA Nemotron Open Model License; Lightning weights + data + recipes under **OpenMDW-1.1** | [V: NVIDIA-NeMo/Nemotron] |
| **Meta**: newest open weights = **Muse Glimmer** (30B, 2026-08) — Meta's frontier line (Muse Spark) is proprietary; **Llama 4** (2025-04-05) is the last Llama | Muse Glimmer **Apache-2.0** [S per FACTS-models B5]; Llama 4 **Llama 4 Community License** (custom + acceptable-use policy) [V: meta-llama/llama-models] | |
| **Gemma 4** (Google, 2026-03-31) | **Apache-2.0** (a change from the earlier Gemma Terms of Use) [S per FACTS-models B3] | [V: Gemma 4 checkpoints exist in google-deepmind/gemma] |
| **Mistral Large 3** (open-weight MoE, 41B active / 675B total) and smaller Mistral open models | [S per FACTS-models B6]; licences not verified; `mistral-inference` repo archived [V] | |
| **IBM Granite 4.0** | **Apache-2.0** | [V] |
| AI2 **OLMo** (fully open: weights + data + code) | Apache-2.0 [M]; active repo `allenai/OLMo-core` | [V: repo notice] |

Teaching points: "open-weight" ≠ "open source" (training data and code usually withheld; OLMo and Nemotron publish more); licences range from Apache/MIT to custom terms with revenue/MAU thresholds and attribution duties (Kimi K3, Llama) — **read the licence of the exact checkpoint**; most frontier-adjacent open models are very large MoEs, so *total* parameters set memory and *active* parameters set speed/cost per token; Meta's shift from open Llama to a proprietary flagship is a reminder that "open" is a vendor strategy that can change.

### C.2 Serving stacks [V: READMEs/PyPI]

- **vLLM** 0.30.0 (2026-09-22): PagedAttention, continuous batching, chunked prefill, prefix caching; quantisation FP8, MXFP8/MXFP4, NVFP4, INT8/INT4, GPTQ/AWQ, GGUF; speculative decoding (n-gram, suffix, EAGLE, DFlash); **disaggregated prefill/decode/encode**; NVIDIA/AMD/Intel/CPU plus plugins (TPU, Gaudi, Ascend, Apple Silicon…).
- **SGLang** 0.5.21 (2026-10-01): NVIDIA A100→B300/GB300, AMD MI300X–MI355X, Google TPU v6e/v7, Intel, Apple Silicon.
- **TensorRT-LLM** (NVIDIA-optimised); **NVIDIA Dynamo** (orchestration layer *above* vLLM/SGLang/TRT-LLM: disaggregated serving, KV-aware routing, autoscaling); **llm-d** v0.7 (May 2026; Kubernetes-native, prefix-cache-aware routing, P/D disaggregation, tiered KV offload).
- **llama.cpp** (GGUF, CPU/GPU/Apple) and **Ollama** (local runner) for laptops/edge; **Hugging Face TGI is in maintenance mode** — don't recommend it for new deployments.

### C.3 Quantisation formats

GGUF (llama.cpp k-/i-quants, local), GPTQ and AWQ (4-bit weight-only, GPU), FP8 (Hopper and later), **MXFP4** (OCP microscaling; gpt-oss ships in it), **NVFP4** (Blackwell), INT8/INT4, NF4 (bitsandbytes, used by QLoRA). Rule of thumb to teach: weight memory ≈ params × bits/8, plus KV cache that grows with context × concurrency.

### C.4 Accelerators (brief)

NVIDIA Hopper (H100/H200) → Blackwell (B200/GB200) → Blackwell Ultra (B300/GB300) are all in current serving-stack support lists [V: SGLang]; Rubin generation shipping status [unconfirmed]. AMD Instinct MI300X/MI325X/MI350X/MI355X [V: SGLang]; Google TPU v6e and v7 [V: SGLang]; AWS Trainium, Apple Silicon (Metal/MLX) for local. Keep course prose generation-agnostic; put specifics in dated notes.

---

## D. TRAINING / ADAPTATION

### D.1 Techniques (stable content; teach in ai-eng `finetune`)

- **SFT** (supervised fine-tuning on input→output pairs); **LoRA** (low-rank adapters) and **QLoRA** (LoRA on a 4-bit NF4 base).
- **Preference optimisation**: RLHF with PPO + reward model; **DPO** and variants (IPO, KTO, ORPO, SimPO) [M].
- **RLAIF** / constitution-style AI feedback.
- **RLVR** (reinforcement learning with verifiable rewards — unit tests, exact answers, graders) using **GRPO-family** algorithms (group-relative advantages, no value model); this is how reasoning models are trained, and open recipes now list it explicitly (NVIDIA Nemotron 3 Ultra: "Pretrain → SFT → RLVR") [V: Nemotron README]. Z.ai built an RL framework (`slime`) for GLM-5 [V].
- **Reinforcement fine-tuning (RFT)** as a product: you supply prompts + a grader; the vendor runs RL on a reasoning model.
- **Distillation**: train a small model on a large model's outputs or reasoning traces (e.g. DeepSeek-R1-Distill-Qwen/Llama models [V: DeepSeek-R1 README]); note provider terms often forbid distilling their outputs into competing models, and unauthorised distillation campaigns are now a documented threat (MITRE ATLAS AML.CS0056 "Model Distillation Campaigns Targeting Anthropic Claude") [V].
- **Synthetic data**: generate → filter (graders/dedup) → mix with real data; watch for model collapse and eval contamination.
- Failure modes: reward hacking, catastrophic forgetting, over-refusal/under-refusal shifts, eval leakage.

### D.2 Tooling [V: PyPI]

Hugging Face **TRL** 1.14.1 (1.0 on 2026-03-30; SFT/DPO/GRPO trainers), **Unsloth** 2026.9.14, **Axolotl** 0.20.0, **verl** 0.9.1 (RL at scale), NVIDIA NeMo RL recipes; managed RL platforms (e.g. Thinking Machines Tinker) [unconfirmed].

### D.3 Who offers fine-tuning of which models (vendor API features overlap FACTS-models.md — check there first)

- **OpenAI** API: fine-tuning `method.type` ∈ **`supervised`, `dpo`, `reinforcement`**; RFT takes a grader and a `reasoning_effort` hyperparameter; the official RFT example uses `o4-mini` [V: openai/openai-openapi spec]. Exact list of currently fine-tunable models [unconfirmed — docs blocked].
- **Google** (Gemini supervised and preference tuning — note Vertex AI is now branded **"Gemini Enterprise Agent Platform"** per the google-genai README, FACTS-models §A), **Azure AI Foundry** (SFT/DPO/RFT for OpenAI models), **Amazon Bedrock** (Nova customisation; Claude 3 Haiku fine-tuning historically), **Mistral**, Together/Fireworks (open models): [unconfirmed this pass].
- **Anthropic**: no self-serve fine-tuning on the Claude API as far as I know [M — confirm with FACTS-models.md].
- Teaching consequence: courses should present RFT/DPO/SFT as *methods* with dated vendor examples, not as a stable vendor matrix.

---

## E. SECURITY

### E.1 OWASP Top 10 for LLM Applications — **current edition: "OWASP GenAI LLM Top 10 2026", published 2026-08-04** [V]

Source: https://github.com/GenAI-Security-Project/GenAI-LLM-Top10 (README + `2026/README.md`); publication page https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/ ; DOI 10.5281/zenodo.22109015.

| 2026 ID | Risk | 2025 ID | 2023 (v1.1) ID — what ai-eng `aisec` uses today |
|---|---|---|---|
| LLM01:2026 | Prompt Injection | LLM01 | LLM01 |
| LLM02:2026 | Sensitive Information Disclosure | LLM02 | LLM06 |
| **LLM03:2026** | **Excessive Agency** | LLM06 | **LLM08** |
| LLM04:2026 | Supply Chain | LLM03 | LLM05 |
| LLM05:2026 | Data and Model Poisoning | LLM04 | LLM03 "Training Data Poisoning" |
| LLM06:2026 | Unbounded Consumption | LLM10 | LLM04 "Model Denial of Service" |
| LLM07:2026 | Misinformation | LLM09 | LLM09 "Overreliance" |
| **LLM08:2026** | **Hidden Context Exposure** (new name/scope; covers what 2025 called System Prompt Leakage, plus tool schemas, retrieved policy text) | LLM07 | — |
| LLM09:2026 | Vector and Embedding Weaknesses | LLM08 | — |
| **LLM10:2026** | **Improper Output Handling** | LLM05 | **LLM02** "Insecure Output Handling" |

(2026 column [V]; 2025 column [V: repo `2025/` entry files]; 2023 v1.1 column [V for LLM02/LLM03/LLM08 via the legacy repo `Archive/1_1_vulns/`, rest M].) Notes from the 2026 text [V]: Excessive Agency's root causes are excessive functionality, permissions and autonomy, and in agentic systems it maps to ASI02/ASI03/ASI08; LLM08 says design as if hidden context is discoverable — never put credentials in it or rely on its secrecy for authorisation; LLM01 mitigations now include **"Budget agent capabilities with the Rule of Two as a floor"** (Meta, 2025-10-31), strict output-schema validation in trusted code, and stripping invisible Unicode (tag-block, variation selectors, zero-width) at every ingest/render boundary.
**Action for ai-eng `aisec` (+ `halluc`, `tools`, `agents` quizzes/cards that cite "LLM08 Excessive Agency" or "LLM02 Insecure Output Handling")**: renumber to 2026 IDs, or drop numbers and cite names + "(OWASP LLM Top 10, 2026 edition)".

### E.2 OWASP Top 10 for Agentic Applications — "2026" edition, announced 2025-12-09 [V via OWASP 2026 Appendix A]

ASI01 Agent Goal Hijack · ASI02 Tool Misuse & Exploitation · ASI03 Identity & Privilege Abuse · ASI04 Agentic Supply Chain Vulnerabilities (incl. MCP servers and tool registries) · ASI05 Unexpected Code Execution (RCE) · ASI06 Memory & Context Poisoning · ASI07 Insecure Inter-Agent Communication · ASI08 Cascading Failures · ASI09 Human-Agent Trust Exploitation · ASI10 Rogue Agents.
Publication: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ (not fetched). Related OWASP outputs: GenAI Data Security 2026 (DSGAI) v1.0 (2026-03-17); AIVSS scoring v0.8 [V: Appendix A versions table].

### E.3 MITRE ATLAS

- Latest content **v2026.09 (2026-09-14)**: 16 tactics, 120 techniques, 88 sub-techniques, 40 mitigations, 73 case studies; monthly content releases since 2026.05 (earlier 5.x versions) [V: https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/CHANGELOG.md]. Agent-specific techniques include AI Agent Context Poisoning (AML.T0080, memory/thread), AI Agent Tool Invocation (AML.T0053), Exfiltration via AI Agent Tool Invocation (AML.T0086), AI Agent Tool Poisoning (AML.T0110: definition/implementation/runtime response), AI Agent Tool Credential Harvesting (AML.T0098), Discover AI Agent Configuration (AML.T0084), Cost Harvesting: Agentic Resource Consumption (AML.T0034.002); mitigations include Generative AI Guardrails (AML.M0020) and new AI Honeypots (AML.M0039). Site: https://atlas.mitre.org

### E.4 2025–26 attack classes, with documented incidents (MITRE ATLAS case-study IDs [V])

- **Indirect prompt injection via tools/content** → data exfiltration: EchoLeak, zero-click M365 Copilot (CS0059; CVE-2025-32711); Slack AI (CS0035); Copilot Studio agent tools (CS0037); Gemini via calendar invitations (CS0063); ZombieAgent on ChatGPT (CS0066); "Living off AI" via Jira Service Management (CS0039); ChatGPT memory hijack (CS0040).
- **Malicious/poisoned MCP servers and tools (incl. rug pulls — a tool definition that changes after approval)**: Poisoned Postmark MCP server exfiltrating email (CS0053); remote poisoned MCP tool (CS0054); MCP server used by Cursor (CS0045); ATLAS technique AI Agent Tool Poisoning (AML.T0110).
- **Malicious skills / agent configs / extensions (supply chain)**: poisoned ClawdBot skill (CS0049); OpenClaw 1-click RCE and C2 via prompt injection (CS0050, CS0051); exposed ClawdBot control interfaces (CS0048); "Rules File Backdoor" against AI coding assistants (CS0041); malicious agent in the Amazon Q VS Code extension (CS0047); poisoned GGUF chat templates (CS0064); model namespace reuse (CS0065).
- **Agents as attack tools**: GTG-1002 espionage campaign using Claude Code (CS0069); multi-agent framework compromising government systems (CS0071); AI-orchestrated malware (LAMEHUG CS0044).
- **Computer-use hijacking**: AI ClickFix (CS0055); data destruction via injection against Claude computer use (CS0046).
- **Secrets leakage in agent CI**: Claude Code GitHub Action secret exposure (CS0067).
- **Slopsquatting / package hallucination**: models recommend non-existent packages that attackers then register (ChatGPT Package Hallucination CS0022; Spracklen et al., USENIX Security 2025, cited in OWASP LLM07:2026) [V]. The share of hallucinated packages varies a lot by model (≈5% commercial vs ≈20% open models in that study [M]) — teach "pin, verify, use an allow-listed registry", not a single number.
- **Exfiltration channels to teach**: markdown image URLs and links rendered by the client, tool calls that send data (email, HTTP, issue comments), invisible Unicode, DNS/URL parameters, logs [V: OWASP LLM01:2026 examples].
- **The "lethal trifecta"** (Simon Willison, 2025-06-16): private data + untrusted content + an external communication channel in one agent ⇒ assume exfiltration is possible [V via OWASP 2026 references]. Meta's **Agents Rule of Two** (2025-10-31): an agent should have at most two of {untrusted input, sensitive data/systems, ability to change state or communicate externally} without per-action human approval [V via OWASP LLM01:2026].

### E.5 Defences that work (architectural, because model-level injection resistance is not sufficient)

Least privilege and scoped, short-lived credentials (identity from the session, never from model output); capability budgeting with the trifecta / Rule of Two; sandboxing (containers/VMs, no ambient secrets, network egress allow-lists); human approval on consequential, irreversible or external actions; **plan/data separation patterns** — dual-LLM (privileged planner never sees untrusted text) and **CaMeL** (Google/DeepMind/ETH, 2025: a privileged model writes a program, untrusted data is handled by a quarantined model, capabilities track data flow; research artifact, not a product) [V: google-research/camel-prompt-injection]; action-selector and plan-then-execute patterns; Spotlighting/delimiting untrusted content (Microsoft) [V via OWASP refs]; strict output schema validation; output rendering controls (no auto-loading remote images/links); pin and verify MCP servers/skills/packages (hash pinning, allow-listed registries); prompt-injection classifiers as one layer only; red-teaming + regression suites; incident response. Vendor-side controls now shipping: injection classifiers on tool results/screenshots, per-site permissions and sensitive-action stops (Anthropic computer use / Claude in Chrome [V]); GitHub Agentic Workflows' read-only tokens + declared "safe outputs" [V].

---

## F. REGULATION & GOVERNANCE (status as of 2026-10-01) — weakest-verified section, see legend

### F.1 EU AI Act (Regulation (EU) 2024/1689)

- Baseline schedule (Art. 113) [M, stable law]: in force 2024-08-01; **2025-02-02** prohibitions (Art. 5) and AI literacy (Art. 4); **2025-08-02** GPAI model obligations, governance, penalties regime (GPAI models already on the market before that date have until **2027-08-02**); **2026-08-02** general application incl. **Art. 50 transparency** and the Commission's power to fine GPAI providers.
- **Digital Omnibus on AI — ADOPTED and in force.** "Regulation (EU) 2026/1744 of the European Parliament and of the Council of 8 July 2026 amending Regulations (EU) 2024/1689, (EU) 2018/1139 and (EU) 2023/1230 as regards the simplification of the implementation of harmonised rules on artificial intelligence (Digital Omnibus on AI)" [V-idx: https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng]. Published in the OJ 2026-07-24, **in force 2026-07-27** [S, consistent across sources]. Path: Commission proposal 2025-11-19 [M] → provisional agreement **2026-05-07** [V-idx: https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/] → EP approval 2026-06-16, Council adoption 2026-06-29 [S].
- **What it changed** [V-idx Council release + S]:
  - **High-risk obligations postponed**: stand-alone (Annex III) systems from **2027-12-02**; high-risk AI embedded in regulated products (Annex I) from **2028-08-02**.
  - **Art. 50(2) marking of AI-generated content**: systems placed on the market before 2026-08-02 get a grace period to **2026-12-02** (shorter than the Commission proposed). Everything else in Art. 50 applies from 2026-08-02 [S; corroborated first-party by Anthropic: "The EU law includes a transition period for Anthropic models launched before August 2, 2026" — https://www.anthropic.com/news/claude-text-watermark, 2026-08-14].
  - National AI regulatory sandboxes deadline moved to **2027-08-02**.
  - **New prohibited practice**: AI systems that generate non-consensual sexual/intimate content or child sexual abuse material ("nudifier" apps).
  - AI-literacy duty (Art. 4) softened toward "take measures to support" AI literacy [S — exact wording unverified]; SME/small-mid-cap documentation relief [S].
  - Not changed: GPAI obligations (since 2025-08-02), AI Office enforcement from 2026-08-02 [S].
- **Codes of practice**: **GPAI Code of Practice** published 2025-07-10 [M] (chapters: transparency, copyright, safety & security; Anthropic announced it would sign on 2025-07-21 [V: https://www.anthropic.com/news/eu-code-practice]). **Code of Practice on Transparency of AI-Generated Content** (marking/labelling under Art. 50) — finalised 2026; Anthropic says it signed it in July 2026 [V: https://www.anthropic.com/news/claude-text-watermark].
- **What Art. 50 means for builders** [M, stable law text]: chatbots must tell people they are interacting with AI (unless obvious); providers of generative systems must mark synthetic audio/image/video/text in a machine-readable, detectable way; deployers must disclose deepfakes, and AI-generated text published to inform the public on matters of public interest unless it had human editorial review. Fine-tuning or otherwise modifying a GPAI model can make you a "provider" for the modification (Commission GPAI guidelines use a compute threshold of about one-third of the original model's training compute) [M].
- Course guidance: Foundations — evergreen phrasing ("in the EU you have a right to know when you're talking to an AI, and AI-made media must be labelled; some uses are banned"). ai-eng — dated table above with source. ai-architect — obligations → requirements mapping, no dates in prose except via a dated note.

### F.2 United States — federal [M unless marked; whitehouse.gov/federalregister.gov blocked]

- EO 14110 (Biden) revoked by **EO 14179** (2025-01-23). **America's AI Action Plan** (2025-07-23) with accompanying EOs (incl. federal-procurement "unbiased AI principles", data-centre permitting, AI exports). OMB memos M-25-21/M-25-22 on federal AI use and procurement (Apr 2025).
- **EO "Ensuring a National Policy Framework for Artificial Intelligence" (2025-12-11)**: DOJ **AI Litigation Task Force** to challenge state AI laws; Commerce to list "onerous" state laws; conditions on certain federal (BEAD) funds; FTC/FCC follow-ups; a legislative recommendation for a federal standard that would pre-empt state laws (with carve-outs such as child safety). **No federal pre-emption statute was in force as of my knowledge; status as of Oct 2026 [unconfirmed]** — the 10-year state-law moratorium was stripped from the July 2025 reconciliation bill 99–1 (2025-07-01).
- **TAKE IT DOWN Act** (signed 2025-05-19): crime to publish non-consensual intimate imagery incl. AI deepfakes; covered platforms must remove within 48 hours of a valid request, platform obligations from 2026-05-19.
- NIST's US AI Safety Institute renamed **Center for AI Standards and Innovation (CAISI)** (June 2025).

### F.3 United States — states [M; verify at the official URL before publishing any date]

| Law | Status (best knowledge) | Official source to check |
|---|---|---|
| **Colorado AI Act** (SB 24-205; high-risk AI in consequential decisions; developer/deployer duty of care vs algorithmic discrimination, impact assessments, notices, AG enforcement) | Effective date moved from 2026-02-01 to **2026-06-30** by SB 25B-004 (Aug 2025). **Whether the 2026 session amended or delayed it again is [unconfirmed] — NEEDS VERIFICATION**; do not state "in force" without checking. | https://leg.colorado.gov/bills/sb24-205 |
| **California SB 53** — Transparency in Frontier AI Act | Signed 2025-09-29, **effective 2026-01-01**. Frontier developers (>10^26 FLOP); "large" ones (> $500M revenue) publish a frontier AI framework and transparency reports, report critical safety incidents to Cal OES within 15 days (24 h if imminent danger), whistleblower protections, civil penalties up to $1M/violation. Requirements as described in Anthropic's endorsement (2025-09-08) [V: https://www.anthropic.com/news/anthropic-is-endorsing-sb-53]. | https://leginfo.legislature.ca.gov (SB-53, 2025–26) |
| **California SB 243** — companion chatbots | Signed 2025-10-13, **effective 2026-01-01**: disclose the bot is AI; suicide/self-harm protocols with crisis referrals; for known minors, break reminders at least every 3 hours and no sexually explicit content; annual reports to the Office of Suicide Prevention from 2027-07-01; private right of action. | leginfo (SB-243) |
| **Texas TRAIGA** (HB 149) | Signed 2025-06-22, **effective 2026-01-01**: bans certain intentional harmful uses (manipulation toward self-harm/violence, intent to unlawfully discriminate, sexual deepfakes/CSAM, government social scoring), disclosure duties for government and health-care AI interactions, AG enforcement with 60-day cure, 36-month sandbox, Texas AI Council. | https://capitol.texas.gov (HB 149, 89R) |
| **New York RAISE Act** | Signed 2025-12-19 with agreed chapter amendments moving it toward SB 53 (revenue-based scope, safety protocols, 72-hour incident reporting, new oversight office); **effective 2027-01-01** [M — verify]. | https://www.nysenate.gov (S6953-B / A6453-B) |
| Also relevant | Illinois HB 3773 (AI in employment decisions, eff. 2026-01-01); California CCPA automated-decision-making regulations (ADMT duties from 2027-01-01); Utah AI disclosure law. [M] | |

### F.4 United Kingdom [M]

No AI-specific statute in force; sector regulators apply existing law. AI Security Institute (renamed from AI Safety Institute, Feb 2025); AI Opportunities Action Plan (Jan 2025); **Data (Use and Access) Act 2025** (Royal Assent 2025-06-19; required government reports on AI and copyright); Online Safety Act duties reach in-scope generative-AI services. A frontier-AI bill and the copyright-and-AI outcome: **status as of Oct 2026 [unconfirmed]**.

### F.5 China [M]

**Measures for Labeling AI-Generated Synthetic Content** (CAC, MIIT, MPS, NRTA; issued 2025-03-14, **effective 2025-09-01**) plus mandatory national standard **GB 45438-2025** (same date): explicit (visible) labels and implicit (metadata) labels on AI-generated text, images, audio, video and virtual scenes; platforms must detect and label; users must declare AI content. Builds on the Deep Synthesis Provisions (2023) and the Interim Measures for Generative AI Services (2023-08-15; algorithm/model filing). Amended Cybersecurity Law with AI provisions effective 2026-01-01 [M, unconfirmed detail].

### F.6 Frameworks and standards

- **NIST AI RMF 1.0** (AI 100-1, Jan 2023) and **Generative AI Profile NIST AI 600-1** (July 2024) are still the current versions — OWASP's version-pinned 2026 mapping (Aug 2026) cites both as v1.0 [V: OWASP 2026 Appendix A]. The AI Action Plan directed NIST to revise the RMF [M]; revision status [unconfirmed]. A NIST "Cyber AI Profile" was in draft [M, unconfirmed].
- **ISO/IEC 42001:2023** — AI management system (AIMS) standard, certifiable (published Dec 2023) [M, stable]; companions **ISO/IEC 42005:2025** (AI system impact assessment) and **ISO/IEC 42006:2025** (requirements for bodies certifying 42001), ISO/IEC 23894:2023 (AI risk management guidance) [M].
- **CSA AI Controls Matrix (AICM) v1.1** (2026-06-22) [V via OWASP Appendix A].
- EU harmonised standards (CEN-CENELEC JTC 21) ran late — the reason the Omnibus postponed high-risk dates [M].

---

## G. EVALUATION & OBSERVABILITY PRACTICE

### G.1 Tooling (latest versions 2026-10-01 [V: PyPI/npm/READMEs])

| Tool | Version | What to know |
|---|---|---|
| **Inspect** (UK AI Security Institute) | `inspect-ai` 0.3.273 | Open-source eval framework used for frontier/agent evals; sandboxed agent tasks; docs publish llms.txt |
| **promptfoo** | npm 0.123.1 | Eval + red-teaming CLI; **"Promptfoo is now part of OpenAI. Promptfoo remains open source and MIT licensed."** [V: README] |
| **Braintrust** | `braintrust` 0.44.0 | Hosted evals/experiments/logging; SDK Apache-2.0 |
| **LangSmith** | `langsmith` 0.14.3 | LangChain's tracing/eval platform (framework-agnostic) |
| **Arize Phoenix** | `arize-phoenix` 20.19.0 | Open-source, self-hosted; OpenTelemetry/OpenInference tracing; remote MCP server; integrations incl. OpenAI Agents SDK and Claude Agent SDK |
| **DeepEval** (Confident AI) | 4.2.7 (4.0 on 2026-05-08) | pytest-style metrics; full agent-trajectory and per-step (tool use, retrieval, handoff) evals |
| **RAGAS** | 0.4.3 (2026-01-13) | RAG metrics + `agent_evals`; repo now under vibrantlabsai; slower release cadence |
| **Langfuse** | `langfuse` 4.16.0 (v4 2026-03-10) | Open-source tracing/evals; **part of ClickHouse since January 2026** [V: README] |
| MLflow 3 | 3.16.1 | GenAI tracing/evaluation in the MLflow stack |
| OpenAI Evals | — | Evals now run in the OpenAI dashboard; graders shared with RFT [V: openai/evals README] |
| W&B Weave, Galileo, Patronus, HoneyHive | — | [unconfirmed this pass] |

Consolidation note for courses: two well-known eval/observability tools changed hands in 2026 (promptfoo → OpenAI; Langfuse → ClickHouse) — mention owners only with a date, or not at all.

### G.2 OpenTelemetry GenAI conventions — see A.5 (Development status; dedicated repo).

### G.3 LLM-as-judge and agent-eval practice (stable guidance, no dates)

- Prefer deterministic/code graders (exact match, schema, unit tests, tool-call assertions) and use LLM judges only for what code can't check.
- Calibrate every judge against human labels (agreement or Cohen's κ on a held-out set) and re-calibrate when the judge model changes; write rubrics as binary/ordinal criteria with examples; use pairwise comparison for "which is better"; swap positions to cancel position bias; control for length bias; avoid self-preference (don't let a model family grade itself in a comparison); have the judge reason before scoring; audit a sample of judge decisions.
- **Agent evals**: grade outcomes in sandboxed, resettable environments (did the ticket get resolved? did tests pass?) plus trajectory checks (right tools, no forbidden actions, step/cost/latency budgets); report reliability across repeats (pass^k — all k attempts succeed — not just pass@k); include adversarial/injection cases; track cost per successful task.
- Vendor-headlined agentic benchmarks in 2026 model READMEs include Terminal-Bench (2.1/3.0), SWE-bench Pro, BrowseComp, Vending-Bench 2 [V: GLM-5 and Kimi K3 READMEs] — scores depend heavily on harness, effort setting and context management (Kimi K3's README reports a different BrowseComp score with vs without context compaction [V]).
- Productivity evidence to cite carefully: METR's 2025 randomized study found experienced open-source developers were slower with early-2025 AI tools on their own repositories while believing they were faster [M — metr.org blocked; verify before quoting numbers].

