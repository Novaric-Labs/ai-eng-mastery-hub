# FACTS — models, prices, platforms (canonical for the October 2026 review)

**Status: complete** (sections A–H written). Facts are as of 2026-10-01; last edit 2026-10-02. Researcher: models & platforms.
Known gaps (marked inline as NOT VERIFIED): Mistral, Amazon Nova, Microsoft, Cohere lineups/prices; most embedding and
media prices; benchmark leaderboard numbers. Cause: most vendor hosts are blocked by this environment's egress proxy and
the session-wide WebSearch budget (200 calls, shared by all agents) ran out mid-research.

Legend:
- **[verified first-party]** / **[V]** = fetched directly from the vendor's own page, SDK repo, PyPI package, or installed
  SDK source (URL given). Safe to state as fact with an "as of October 2026" date.
- **[first-party, search-index text]** / **[S]** = the vendor's own page (URL given), but read through WebSearch result text
  because the host is blocked here. Numbers were cross-checked across several queries; treat as first-party with slightly
  lower confidence and spot-check the URL in a browser before publishing a price.
- **[tracker-only — unconfirmed]** / **[T]** = third-party trackers/news only. Do NOT state as fact in course text.
- "MTok" = million tokens. Prices are USD list prices, standard (non-batch, non-priority) tier unless noted.
- Most consequential for code samples: see A1 "Code-breaking" bullet, E3, E6 and the end of H.

---

## A. CHANGED SINCE 2026-08-29 (what an August-written course now gets wrong)

### A1. Anthropic (all [verified first-party])
Sources: release notes https://platform.claude.com/docs/en/release-notes/overview ·
models overview https://platform.claude.com/docs/en/about-claude/models/overview ·
pricing https://platform.claude.com/docs/en/about-claude/pricing ·
deprecations https://platform.claude.com/docs/en/about-claude/model-deprecations

- **2026-08-10 (already stale in the Aug-29 text):** Claude Sonnet 5's introductory $2/$10 price became the
  **standard** price. Pricing footnote: "The previously scheduled increase to $3/$15 per million input/output tokens on
  September 1, 2026 will not occur." → Any "Sonnet 5 $2/$10 promo through Aug 31, then $3/$15" text is wrong.
- **2026-08-18:** Console "Workbench" is now **playground** (https://platform.claude.com/playground). Legacy Workbench
  at platform.claude.com/workbench sunset 2026-08-17.
- **2026-08-19:** Computer use **out of beta** as the toolset `computer_toolset_20260801`; new **browser use** tool
  `browser_toolset_20260801`; **Files API GA**; **Agent Skills + Skills API (`/v1/skills`) GA** on the Claude API.
- **2026-08-20:** **Python SDK v1.0** (`anthropic`) released. Breaking: v1.0+ *removes* `temperature`, `top_p`, `top_k`
  from request types — passing them raises `TypeError` (deprecations page, "API parameter deprecations"). On Claude 4.7+
  models the API itself returns 400 for non-default values of those params.
- **2026-08-27:** Python SDK 1.2.0 — `client.beta.files` / `client.beta.skills` no longer need beta headers.
- **2026-09-01:** **Claude Fable 5.1** (`claude-fable-5-1`) and **Claude Mythos 5.1** (`claude-mythos-5-1`, limited
  availability via Project Glasswing) launched. $10/$50; cache reads **$0.25/MTok (0.025×)**. `tool_choice` `any`/`tool`
  NOT supported on Fable 5.1 / Mythos 5.1. Output carries Anthropic's text watermark. Per-message effort changes (beta).
- **2026-09-14:** On-demand **compaction** endpoint behaviour in the Messages API (beta) —
  https://platform.claude.com/docs/en/build-with-claude/compaction-on-demand
- **2026-09-22:** **Claude Opus 5.5** (`claude-opus-5-5`) launched at **$4/$20** (cheaper than Opus 5's $5/$25);
  cache reads $0.20/MTok (0.05×); thinking cannot be disabled; Fast mode (research preview) $8/$40.
- **2026-09-23:** Cache diagnostics GA.
- **2026-09-28:** **Claude Sonnet 5.5** (`claude-sonnet-5-5`) launched at **$2/$10**; release notes say "Code written for
  Claude Sonnet 5 can break on Claude Sonnet 5.5 in five ways" (see migration guide).
- **2026-09-30:** **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) deprecated; retires **2026-11-30**; replacement
  `claude-sonnet-5-5`.
- **Code-breaking for course samples (all three September models — Fable 5.1, Opus 5.5, Sonnet 5.5):** each returns
  **400** for forced tool choice (`tool_choice` `{"type": "any"}` / `{"type": "tool", ...}` → use `auto` + `strict: true`
  or structured outputs), **assistant prefill** (also rejected since Opus 4.6), non-default `temperature`/`top_p`/`top_k`,
  and manual `thinking` budgets; all three also reject `thinking: {"type": "disabled"}` (Sonnet 5.5's lowest setting is
  `{"type": "between_tools"}`; Opus 5 and Sonnet 5 still accept `disabled`). Responses now **start with thinking blocks**,
  and in tool loops the
  assistant message must be echoed back **unmodified** (edited/dropped thinking blocks → 400). `computer_20251124` →
  400 on the Claude API/Google Cloud (use `computer_toolset_20260801`). Sources:
  https://platform.claude.com/docs/en/models/opus-5-5/migration-guide ,
  https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
- **Unchanged:** Claude Haiku 4.5 is still the only Haiku, $1/$5, 200K context, retirement "not sooner than
  October 15, 2026". **No Haiku successor and no Haiku 4.5 deprecation notice** on the deprecations page as of
  2026-10-01 (Anthropic gives ≥60 days' notice, so Haiku 4.5 cannot retire before ~2026-11-30 at the earliest).
- Course naming check: "Claude Fable 5" / "Opus 5" / "Sonnet 5" still exist but are now **legacy (still available)**,
  not the current lineup. Opus 5 is still $5/$25; Sonnet 5 is $2/$10.

### A2. Other vendors (dated; includes a few items dated just before 08-29 that the August text still gets wrong)
Labels: **[V]** = verified first-party (fetched); **[S]** = first-party page text via search index (vendor host blocked
here — see the sourcing caveats in B2/B3); **[T]** = tracker-only. Details + URLs are in section B.

**OpenAI**
- 2026-07-30 — "Priority processing" **renamed Fast mode** (2× Standard); GPT-5.6 Terra cut 20% → $2/$12 [S].
- 2026-08 (exact day not verified; promo runs "at least through November 21, 2026") — **GPT-5.6 Sol cut to $4/$20
  promotional** (was $5/$30) [S]. → The course's "Sol $5/$30" is stale, and GPT-5.6 is no longer the current family.
- 2026-08-12 — `openai` Python SDK **3.0.0** (httpx2 default; `httpx` no longer auto-installed) [V].
- 2026-08-14 — SDK 3.1.0: "**Deprecated Sora video APIs**"; Ultrafast tier support (Ultrafast announced 2026-08-20) [V]/[S].
- 2026-08-26 — **Assistants API sunset; no longer available** → Responses + Conversations [S].
- **2026-09-03 — GPT-6 Astra** (`gpt-6-astra`): flagship, $10/$50, cached $1, 1.05M context, 128K output [V date / S price].
- 2026-09-08 — GPT Image 2.5 (`gpt-image-2.5-flare`, `gpt-image-2.5-sunburst`) [V].
- 2026-09-10 — **Agents API** (beta; hosted agents) and "Live API" added to the SDK [V]; Agents API public beta announced at
  DevDay 2026 [S].
- **2026-09-22 — GPT-6 Sol** (`gpt-6-sol`, $2/$10) and **GPT-6 Luna** (`gpt-6-luna`, $0.10/$0.50) — "50% [below] their
  GPT-5.6 promotional pricing" [V date / S price]. No GPT-6 "Terra".
- **2026-09-29 — GPT-6.1 Sol** (`gpt-6.1-sol`, $2/$10, cached $0.10 = 5%) — "near-Astra intelligence … at one-fifth of
  Astra's … prices" [V date / S price].
- Scheduled: `gpt-4.1-nano` shutdown **2026-10-23**; GPT-5 and o3 families shutdown **2026-12-11** [S].
- Pricing mechanics that changed in 2026: OpenAI now **bills cache writes at 1.25×** (GPT-5.6+), `24h` cache retention by
  default for non-ZDR orgs, >272K-token prompts billed 2× input / 1.5× output [S].

**Google**
- 2026-07-21 — Gemini 3.5 Flash-Lite ($0.30/$2.50) and Gemini 3.6 Flash [S]. 2026-08-13 — Gemini 3.7 Flash [V date].
- **2026-09-02 — Gemini 3.8 Flash GA** (`gemini-3.8-flash`): **$0.75/$3.75 introductory through 2026-12-31, then
  $1.50/$7.50 from 2027-01-01**; 1M in / 64K out; `thinking_level` low/medium(default)/high [V date / S price].
- 2026-09-03 Lyria 3.5 · 2026-09-15 **Gemini 3.8 Live** GA · 2026-09-22 **Gemini 3.8 Flash TTS** GA [S]; SDK [V].
- 2026-09-18 — Gemini 2.5 models limited to users who already used them [S].
- **~2026-09-30 — Gemini 4 Argon** announced; **restricted** to the Fairwind Program (trusted cyber defenders); intro
  $2/$10; no public model id; paid-API/Ultra access "later" [S; date T].
- **Unchanged:** Gemini 3.1 Pro is still `gemini-3.1-pro-preview` at **$2/$12** (≤200K prompt) — the course figure stands;
  Gemini 3.5 Pro is not public [S].
- **Renamed:** Vertex AI → **"Gemini Enterprise Agent Platform"** (google-genai README: "formerly Vertex AI";
  `genai.Client(enterprise=True, …)`; `vertexai=True` kept as a legacy flag) [V; rename date not verified].
- Gemma 4 (2026-03-31) is **Apache-2.0** [S] — fix any "Gemma licence" text that predates it.

**xAI** — **2026-09-21 Grok 4.7** (`grok-4.7`): 500K context, $2 / $0.50 cached / $6 (<200K prompt); `reasoning_effort` up to
`xhigh` [S]. Course "Grok 4.6 at 500K" → one version behind. Brand now "SpaceXAI" (xAI joined SpaceX) [S].

**Meta** — Muse Glimmer (30B, **Apache-2.0**, ~2026-08-10) is correct [S; date T]. Since then: Muse Spark 1.2 + Muse Code
(coding agent, ~2026-08-05) and **Muse Spark 1.3** (~2026-09-02; API-only, 1M context, $1.25 in) [S existence; dates T].
Promised open weights for Muse Spark 1.2 had **not** shipped as of early September [T].

**DeepSeek** — API now `deepseek-flash` = **DeepSeek-V4.1-Flash** and `deepseek-v4-pro` = **V4-Pro-0813**; 1M context, 384K
max output; **peak / off-peak pricing** (Flash $0.30/$1.20 peak, Pro $1.32/$3.96 peak, half off-peak) [S]. Release dates
not verified. → "DeepSeek V4 Pro/Flash" should become "V4 Pro / V4.1 Flash".

**Alibaba Qwen** [V, GitHub] — 2026-08-12 **Qwen3.8-2.4T-A95B open weights** (the "Max" model); 2026-08-14 Qwen3.8-27B;
2026-08-26 **Qwen3.8-Flash-Next** (6B active; "early preview of the architecture used in Qwen4"). "Qwen 3.8" in the
course is current.

**Moonshot** [V, GitHub] — **Kimi K3** (repo 2026-07-27): 2.8T total / 104B active, 1M context, "Kimi K3 License"; API
`kimi-k3`. → "Kimi K2.7" was already stale on Aug 29.

**Zhipu / Z.ai** [V, GitHub] — **GLM-5.3** (744B-A40B) and **GLM-5.3-Flash** (320B-A18B), README updated 2026-08-27 →
"GLM-5.2" is one behind. Z.ai shipped the ZCode coding-agent harness (2026-09-20).

**MiniMax** [V, GitHub] — **MiniMax-M3** (2026-06; 428B / 23B active, 1M) is still the latest LLM — course OK. New:
MiniMax-H3 open video+audio model (2026-07-30).

**Mistral** — `mistralai` SDK **3.0.0 on 2026-09-28** (major) [V]; model/price changes since August **not verified**.

**Trend worth one sentence in the courses** [V, GitHub org listings]: nearly every lab now ships its own terminal coding
agent / harness — Kimi Code CLI, Z.ai ZCode, MiniMax Code, Qwen Code, Meta Muse Code, and DeepSeek Harness components
(repos created 2026-09-30) — alongside Claude Code, Codex and Gemini/Antigravity.

---

## B. CURRENT LINEUPS

### B1. Anthropic — [verified first-party] (models overview, pricing, deprecations pages above; read 2026-10-01)

Positioning (overview page): "start with **Claude Opus 5.5** for most workloads"; **Fable 5.1** for demanding reasoning
and long-horizon agentic work → flagship = Fable 5.1, default/workhorse = Opus 5.5, speed/intelligence balance =
Sonnet 5.5, fast-cheap = Haiku 4.5.

| Model | API id (Claude API) | Released | $/MTok in / out | Cache read (hit) | Cache write 5m / 1h | Batch in / out | Context | Max output | Thinking | Default effort | Status / retirement |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Claude Fable 5.1 | `claude-fable-5-1` | 2026-09-01 | $10 / $50 | $0.25 (0.025×) | $12.50 / $20 | $5 / $25 | 1M | 128K | Adaptive (always on) | `high` | Active; not sooner than 2027-09-01 |
| Claude Mythos 5.1 | `claude-mythos-5-1` | 2026-09-01 | $10 / $50 | $0.25 | $12.50 / $20 | $5 / $25 | — | — | — | — | Active, **limited availability (invite-only, Project Glasswing)**; ≥2027-09-01 |
| Claude Opus 5.5 | `claude-opus-5-5` | 2026-09-22 | $4 / $20 | $0.20 (0.05×) | $5 / $8 | $2 / $10 | 1M | 128K | Adaptive (always on; cannot be disabled) | `medium` | Active; ≥2027-09-22 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | 2026-09-28 | $2 / $10 | $0.20 (0.1×) | $2.50 / $4 | $1 / $5 | 1M | 128K | Adaptive | `high` | Active; ≥2027-09-28 |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` (alias `claude-haiku-4-5`) | 2025-10-01 (id date) | $1 / $5 | $0.10 | $1.25 / $2 | $0.50 / $2.50 | 200K | 64K | Extended (manual `budget_tokens`); effort **not supported** | n/a | Active; ≥2026-10-15 |
| *Legacy, still available:* Claude Fable 5 | `claude-fable-5` | (pre-Aug) | $10 / $50 | $1 | $12.50 / $20 | $5 / $25 | | | | | Active; ≥2027-06-09 |
| Claude Opus 5 | `claude-opus-5` | 2026-07-24 | $5 / $25 | $0.50 | $6.25 / $10 | $2.50 / $12.50 | 1M | 128K | Adaptive | | Active; ≥2027-07-24 |
| Claude Sonnet 5 | `claude-sonnet-5` | (pre-Aug) | **$2 / $10 (standard since 2026-08-10)** | $0.20 | $2.50 / $4 | $1 / $5 | | | | | Active; ≥2027-06-30 |
| Claude Opus 4.8 / 4.7 / 4.6 / 4.5 | `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5-20251101` | | $5 / $25 | $0.50 | $6.25 / $10 | $2.50 / $12.50 | | | | | Active; Opus 4.5 ≥2026-11-24 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | | $3 / $15 | $0.30 | $3.75 / $6 | $1.50 / $7.50 | | | | | Active; ≥2027-02-17 |
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | | $3 / $15 | $0.30 | | | | | | | **Deprecated 2026-09-30 → retires 2026-11-30** |
| Retired | Opus 4.1 (2026-08-05), Opus 4 & Sonnet 4 (2026-06-15), Haiku 3 (2026-04-20), Haiku 3.5 & Sonnet 3.7 (2026-02-19) | | | | | | | | | | `claude-mythos-preview` deprecated 2026-06-09 (retirement TBA) |

Platform notes (all [verified first-party], pricing + overview pages):
- All current models: text + image input, text output, vision, tool use, multilingual.
- **Long context**: Claude 4.6+ models get the full 1M window at **standard** per-token pricing (no long-context premium).
- **Tokenizer**: Claude 4.7+ use a newer tokenizer producing ~30% more tokens for the same text; 1M tokens ≈ 555k words
  (≈750k words on pre-4.7 models).
- **Batch** = 50% off input and output. Cache multipliers: 5-min write 1.25×, 1-hour write 2×, read 0.1× (0.05× Opus 5.5,
  0.025× Fable 5.1/Mythos 5.1). Multipliers stack with batch and data residency.
- **Data residency**: `inference_geo: "us"` = 1.1× on all token categories (Claude 4.6+); `"global"` default.
- **Fast mode** (research preview, Claude API only, not Batch): Opus 5.5 $8/$40; Opus 5 / Opus 4.8 $10/$50; param
  `speed: "fast"`.
- **Max output on Batches**: up to 300K output tokens with beta header `output-300k-2026-03-24` (Opus 5.5, Opus 5,
  Sonnet 5.5, Sonnet 5, Opus 4.8/4.7/4.6, Sonnet 4.6).
- **Sampling params**: `temperature`/`top_p`/`top_k` deprecated — 400 error on non-default values on Claude 4.7+; Python
  SDK v1.0+ removes them (TypeError). → **Any course code passing `temperature=` to a current Claude model is wrong.**
- **Extended thinking** (`thinking: {type: "enabled", budget_tokens: N}`) is deprecated on Opus 4.6 / Sonnet 4.6 and **not
  accepted on later models**; current models use adaptive thinking steered by `effort`.
- **Managed Agents**: tokens at model rates + **$0.08 per session-hour** runtime.
- **Tools pricing**: web search **$10 per 1,000 searches** + tokens; web fetch no extra charge; code execution free when
  used with `web_search_20260209`/`web_fetch_20260209` (or later), otherwise 1,550 free container-hours/org/month then
  $0.05/hour/container (5-min minimum).
- Every model ID from the 4.6 generation on is a dateless **pinned snapshot** (not a moving alias).
- Cloud IDs: Bedrock `anthropic.claude-opus-5-5` etc.; Google Cloud (Vertex) `claude-opus-5-5`; Microsoft Foundry and
  "Claude Platform on AWS" use the Claude API IDs. Bedrock/Google Cloud set their own retirement dates.

### B2. OpenAI

**Sourcing caveat (read this).** Every OpenAI host (openai.com, platform.openai.com, developers.openai.com,
help.openai.com, community.openai.com) is blocked by this environment's egress proxy. OpenAI facts therefore come from:
(a) OpenAI's own GitHub SDK repo (fetched directly) → **[verified first-party]**; and (b) the text of OpenAI's own pages as
returned by WebSearch restricted to `openai.com` / `developers.openai.com` → marked **[first-party, search-index text]**.
Treat (b) as "first-party, high-but-not-perfect confidence": the numbers were consistent across 3+ independent
queries, but an editor with browser access should spot-check https://developers.openai.com/api/docs/pricing before
publishing an OpenAI price.

First-party SDK evidence (openai-python CHANGELOG, https://github.com/openai/openai-python/blob/main/CHANGELOG.md ,
and model enum https://github.com/openai/openai-python/blob/main/src/openai/types/shared/chat_model.py ) [verified first-party]:
- v3.8.0 **2026-09-03** "add gpt-6-astra" · v3.18.0 **2026-09-22** "add GPT-6 Sol and Luna model identifiers" ·
  v3.19.0 2026-09-22 "add GPT-Rosalind research model" · v3.21.0 **2026-09-29** "add GPT-6.1 Sol model identifier" ·
  v3.10.0 2026-09-08 "add GPT Image 2.5 models" · v3.12.0 2026-09-10 "Add Live API" · v3.13.0 2026-09-10 "add Agents API" ·
  v3.9.0 2026-09-05 "Add prompt cache diagnostics" · v3.15.0 2026-09-18 "managed Responses WebSocket sessions",
  "prompt-cache prewarming", "compaction progress events" · v3.22.0 2026-09-29 "add computer use to beta agents".
- SDK model enum (current): `gpt-6-astra`, `gpt-6.1-sol`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`,
  `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.4`(-mini/-nano), … **There is no `gpt-6-terra`** — the GPT-6 family is Astra / Sol / Luna.

Positioning: flagship = **GPT-6 Astra**; workhorse = **GPT-6.1 Sol** ("near-Astra intelligence … at one-fifth of Astra's
standard API input and output token prices"); fast-cheap = **GPT-6 Luna**. The 3-tier GPT-5.6 naming (Sol/Terra/Luna)
was replaced by Astra/Sol/Luna in GPT-6.

| Model | API id | Released | $/MTok in / out | Cached in | Cache write | Context | Max out | Reasoning (`reasoning.effort`) | Modalities | Status | Source / label |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GPT-6 Astra | `gpt-6-astra` | 2026-09-03 | $10 / $50 | $1 (10%) | $12.50 | 1,050,000 | 128K | `low`/`medium`/`high`/`xhigh`/`max`; **no `none`** | text+image in, text out | GA, flagship (also on Azure + Amazon Bedrock) | https://developers.openai.com/api/docs/models/gpt-6-astra , https://openai.com/index/gpt-6-astra/ [first-party, search-index text]; date [verified first-party, SDK] |
| GPT-6.1 Sol | `gpt-6.1-sol` | 2026-09-29 | $2 / $10 | **$0.10 (5%)** | ($2.50 = 1.25×) | 1,050,000 | 128K | default `medium`; up to `xhigh`/`max`. Snippets conflict on whether `none` is accepted — one model-page snippet says "none and minimal reasoning efforts not supported" → **don't teach `none` for 6.1 Sol** | text+image in, text out | GA, workhorse (Ultrafast "coming later") | https://openai.com/index/introducing-gpt-6-1-sol/ , https://developers.openai.com/api/docs/models/gpt-6.1-sol [first-party, search-index text] |
| GPT-6 Sol | `gpt-6-sol` | 2026-09-22 | $2 / $10 | $0.20 | $2.50 | 1,050,000 | 128K | `none`/`low`/`medium`(default)/`high`/`xhigh`/`max`; knowledge cutoff 2026-04-20 | text+image in, text out | GA (superseded by 6.1 Sol within a week) | https://openai.com/index/introducing-gpt-6-sol-and-luna/ , https://developers.openai.com/api/docs/models/gpt-6-sol [first-party, search-index text] |
| GPT-6 Luna | `gpt-6-luna` | 2026-09-22 | $0.10 / $0.50 | $0.01 | $0.125 | 1,050,000 | 128K | default `medium` | text+image in, text out | GA, fast-cheap | https://developers.openai.com/api/docs/models/gpt-6-luna [first-party, search-index text] |
| GPT-5.6 Sol | `gpt-5.6-sol` | 2026-07 (community announcement: "coming July 9") | **$4 / $20 promotional** (was $5 / $30), "at least through November 21, 2026"; long-context (>272K) $8 / $30 | | 1.25× | 1,050,000 | | | | Previous gen, still available | https://developers.openai.com/api/docs/models/gpt-5.6-sol [first-party, search-index text] |
| GPT-5.6 Terra | `gpt-5.6-terra` | 2026-07 | $2 / $12 (20% cut effective 2026-07-30) | $0.20 | 1.25× | | | | | Previous gen; named replacement for several deprecated minis | https://developers.openai.com/api/docs/models/gpt-5.6-terra [first-party, search-index text] |
| GPT-5.6 Luna | `gpt-5.6-luna` | 2026-07 | $0.20 / $1.20 | | 1.25× | 1,050,000 | | | | Previous gen | https://developers.openai.com/api/docs/models/gpt-5.6-luna [first-party, search-index text] |
| Specialist | `gpt-5.6-cyber`, "Daybreak Blue" (`gpt-daybreak-blue-latest`), GPT-Rosalind (research) | | | | | | | | | Restricted/specialist programs (names only — access terms and prices not verified) | model pages on developers.openai.com [first-party, search-index — titles only]; Rosalind [verified first-party, SDK] |

OpenAI pricing mechanics (https://developers.openai.com/api/docs/pricing , /guides/prompt-caching , /guides/fast-mode ,
/guides/ultrafast-mode — [first-party, search-index text]):
- **Tiers:** Standard; **Batch** and **Flex** = 50% of Standard; **Fast mode** = 2× Standard (Priority processing was
  **renamed Fast mode on 2026-07-30**); **Ultrafast** (announced 2026-08-20; GA on Astra, preview on GPT-5.6 Sol;
  Astra Ultrafast ≈6× Standard in the API, "up to 8x faster").
- **Long-context surcharge:** prompts with **>272K input tokens** are billed at 2× input/cache rates and 1.5× output for
  the *whole request* (stated on the Astra, GPT-5.6 Sol and GPT-5.6 Luna pages).
- **Prompt caching (changed in 2026):** still automatic, but **for GPT-5.6 and later, cache *writes* cost 1.25× the
  uncached input rate** (no longer free); cached reads 10% of input (5% on GPT-6.1 Sol). `prompt_cache_retention`
  defaults to **`24h`** for organizations without Zero Data Retention (`in_memory` for ZDR orgs). `prompt_cache_key`
  is now mainly for per-tenant cache accounting on GPT-5.6+.

OpenAI deprecations / sunsets (https://developers.openai.com/api/docs/deprecations — [first-party, search-index text]):
- **Assistants API sunset 2026-08-26** — no longer available; migrate to **Responses + Conversations** APIs.
- GPT-5 and o3 families: deprecation announced 2026-06-11, **shutdown 2026-12-11** (e.g. `gpt-5-mini-2025-08-07` →
  replacement `gpt-5.6-terra`; `gpt-5-pro-2025-10-06` → `gpt-5.6-sol` with `reasoning.mode: "pro"`).
- `gpt-4.1-nano` shutdown **2026-10-23** (replacement `gpt-5.6-luna`). `chatgpt-4o-latest` shut down 2026-02-17.
- Chat Completions: **still supported, not deprecated**; Responses is "recommended for all new projects".
- Unconfirmed: one search summary claimed GPT-4.5 was "re-introduced at DevDay 2026" — a targeted first-party search
  found only "GPT-4.5 was retired on May 28, 2026 … ChatGPT only; no changes to the API". **[tracker/search-summary only —
  do not use]**.

DevDay 2026 (https://openai.com/index/devday-2026-recap/ — [first-party, search-index text]; exact event date not
confirmed, appears to be ~2026-09-29 alongside GPT-6.1 Sol): **Agents API (public beta)** — hosted execution on a managed
Codex harness, memory, tools, multi-agent, computer use; "no additional fees" beyond tokens/tools
(https://openai.com/index/introducing-the-agents-api/). **Decisions API** (limited preview; uses Luna to classify/route
over predefined answers). Codex Cloud. GPT-6.1 Sol.

### B3. Google (Gemini API + Gemma)

**Sourcing caveat.** ai.google.dev, blog.google, docs.cloud.google.com are blocked by the egress proxy here. Sources:
google-genai SDK changelog on GitHub (fetched) **[verified first-party]**; Google's own pages via WebSearch restricted to
`ai.google.dev` / `blog.google` / `deepmind.google` **[first-party, search-index text]**.

SDK evidence (https://github.com/googleapis/python-genai/blob/main/CHANGELOG.md) [verified first-party]: v2.18.1
(2026-08-13) "Added gemini-3.7-flash model"; v2.22.0 (2026-09-02) "Add Gemini 3.8 Flash model to SDKs"; v2.26.0
(2026-09-30) "Add Gemini 3.8 Flash TTS and Gemini 3.8 Flash Lite TTS models"; v2.18.0 (2026-08-12) "Deferred service tier
publicly available"; v2.14.0 (2026-07-22) "Deprecation warnings for Imagen and video generation methods". Latest
`google-genai` = **2.27.0 (2026-10-01)**.

Positioning: **Pro tier is still Gemini 3.1 Pro (preview)**; Gemini 3.5 Pro is "testing with partners", not public.
Workhorse = **Gemini 3.8 Flash** (Google calls each new Flash "our most intelligent workhorse model"); fast-cheap =
**Gemini 3.5 Flash-Lite** / 3.1 Flash-Lite. New frontier **Gemini 4 Argon** is restricted (see below).

| Model | API id | Released | $/MTok in / out (Standard) | Cache / other | Context / max out | Thinking control | Status | Source / label |
|---|---|---|---|---|---|---|---|---|
| Gemini 4 Argon | none public | announced ~2026-09-30 | "introductory price of $2 … input and $10 … output" | — | "1 million token limit" | — | **Restricted: rolling out to trusted cyber defenders via the Fairwind Program**; paid-API + Google AI Ultra access promised later, no date | https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/ [first-party, search-index text]; date from news (thehackernews 2026-10, engadget) [tracker-only] |
| Gemini 3.1 Pro | `gemini-3.1-pro-preview` | 2026-02 (preview) | **$2 / $12 (≤200K prompt); $4 / $18 (>200K)** | | 1M in / 64K out | `thinking_level`: `low` / `medium` / `high` (default) | **Still Preview**; deprecations table shows 2026-02-19 (most likely its release date — the search summary called it a "deprecation date") and **no shutdown date**; `gemini-3-pro-preview` shut down 2026-03-09 and now points to 3.1 | https://ai.google.dev/gemini-api/docs/pricing , /deprecations [first-party, search-index text] |
| Gemini 3.8 Flash | `gemini-3.8-flash` | **2026-09-02 (GA)** | **$0.75 / $3.75 introductory through 2026-12-31 → $1.50 / $7.50 from 2027-01-01** (output incl. thinking) | context cache $0.075 → $0.15 /MTok + storage $0.50 → $1.00 /MTok/hour; Batch 50% | 1M in / 64K out | `thinking_level` `low` / `medium` (default) / `high` | GA | https://ai.google.dev/gemini-api/docs/latest-model , /pricing [first-party, search-index text]; date [verified first-party, SDK] |
| Gemini 3.8 Flash Cyber | — | 2026-09-02 | — | | | | Trusted defenders (Fairwind Program) | blog.google 3-8-flash-and-3-8-flash-cyber [first-party, search-index text] |
| Gemini 3.7 Flash | `gemini-3.7-flash` | 2026-08-13 | $0.75 / $3.75 intro → $1.50 / $7.50 from 2027-01-01 | | | | GA (superseded) | /models/gemini-3.7-flash [first-party, search-index text] |
| Gemini 3.6 Flash | `gemini-3.6-flash` (presumed) | 2026-07 | | | | | GA (superseded) | blog.google gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber [first-party, search-index text] |
| Gemini 3.5 Flash | `gemini-3.5-flash` | 2026-05-19 | $1.50 / $9.00 | | | | GA | [first-party, search-index text] |
| Gemini 3.5 Flash-Lite | `gemini-3.5-flash-lite` | 2026-07-21 | $0.30 / $2.50 (Batch $0.15/$1.25; Priority $0.54/$4.50) | | | | GA, fast-cheap | https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite [first-party, search-index text] |
| Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | 2026-05-07 (GA) | $0.25 / $1.50 (audio in $0.50); Batch $0.125/$0.75; Priority $0.45/$2.70 | | | | GA; earliest shutdown 2027-05-07 | /pricing, /deprecations [first-party, search-index text] |
| Gemini 3.8 Live / 3.8 Live Extended Thinking | (see Live API docs) | **2026-09-15 GA** | | | | audio-to-audio | GA | /changelog [first-party, search-index text] |
| Gemini 3.8 Flash TTS / 3.8 Flash-Lite TTS | (see TTS docs) | **2026-09-22 GA** | | 150+ voices, voice design/replication | | | GA | /changelog [first-party, search-index text]; SDK v2.26.0 |
| Gemini 2.5 Pro / Flash / Flash-Lite | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` | 2025 | | | | | **Since 2026-09-18, access limited to users who actively used them before**; no shutdown date listed (`gemini-2.5-flash-image` earliest shutdown 2026-10-02). Forum posts cite an Oct 16–17 2026 shutdown — **conflict; not on the deprecations page** | /changelog, /deprecations [first-party, search-index text] |

Google service tiers (https://ai.google.dev/gemini-api/docs/optimization [first-party, search-index text]): Standard;
**Flex** 50% off (sheddable, 1–15 min target); **Priority** "75% to 100% more than standard" (e.g. 1.8× on Flash-Lite);
**Batch** 50% off (≤24 h); context caching "90% discount + prorated token storage"; a **Deferred** tier went public
2026-08-12 (SDK). Other September items: Lyria 3.5 music model (2026-09-03); "agentic video understanding" (2026-09-01);
Antigravity Agent `antigravity-preview-09-2026` (2026-09-17).

**Gemma** (open weights) [first-party, search-index text — https://ai.google.dev/gemma/docs/core/model_card_4 ,
https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/ ]: **Gemma 4** released 2026-03-31 (E2B, E4B,
26B A4B MoE, 31B dense) + Gemma 4 12B "Unified" 2026-06-03; **Apache 2.0 licence** (a change from the earlier Gemma
Terms of Use); context 128K (E2B/E4B) / 256K (12B, 26B A4B, 31B). No Gemma 5 found.

### B4. xAI ("SpaceXAI")

Sourcing: docs.x.ai / x.ai / media.x.ai blocked here → **[first-party, search-index text]** from x.ai and docs.x.ai.
**Company naming changed:** x.ai pages now say "SpaceXAI" ("xAI joins SpaceX", https://x.ai/news/xai-joins-spacex);
the API is still documented as the "xAI API" at docs.x.ai with `grok-*` model ids. Use "xAI (now part of SpaceX)" in
prose unless an editor confirms the preferred name.

| Model | API id | Released | $/MTok in / cached / out (<200K prompt) | ≥200K prompt | Context | Reasoning | Status | Source |
|---|---|---|---|---|---|---|---|---|
| Grok 4.7 | `grok-4.7` | **2026-09-21** (model card revision date) | $2 / $0.50 / $6 | $4 / $1 / $12 (launch post). **Conflict:** one docs snippet shows $4 / $1.50 / $18 — that equals the 1.5× "Fast" long-context rate, so treat $4/$1/$12 as standard | **500K**; text+image in, text out; "no text output limit" | `reasoning_effort` `low`/`medium`/`high` (default)/`xhigh` | GA flagship ("frontier model for coding, agentic tasks, and knowledge work"); new larger base model vs 4.6 | https://x.ai/news/grok-4-7 , https://docs.x.ai/developers/grok-4-7 [first-party, search-index text] |
| Grok 4.7 Fast | — | 2026-09 | 2× standard (1.5× long-context) | | | | **Not on the public xAI API** — Cursor and Grok Build only | same |
| Grok 4.6 | `grok-4.6` | (pre-Aug) | $2 / $0.50 / $6 | $4 / $1 / $12 | 500K | | Still served | https://docs.x.ai/developers/models/grok-4.6 [first-party, search-index text] |
| Grok 4.5 | `grok-4.5` | | $2 / $0.30 / — | $4 / $0.60 / $12 | | | Still served ("intelligent coding model") | same |
| Grok 4.3 | `grok-4.3` | | $1.25 / $0.20 / $2.50 | | | | Cheaper tier | https://docs.x.ai/developers/models/grok-4.3 [first-party, search-index text] |

Course impact: "Grok 4.6 at 500K" is now one version behind; **Grok 4.7 is current (500K context, $2/$6)**. xAI also
retired older models on 2026-05-15 (https://docs.x.ai/developers/migration/may-15-retirement).

### B5. Meta (Meta Superintelligence Labs — "Muse" family; Llama is legacy)

Sourcing: ai.meta.com, developer.meta.com, huggingface.co are blocked here → **[first-party, search-index text]** from
developer.meta.com / ai.meta.com / about.fb.com, plus trackers where noted.

| Model | id | Released | Price $/MTok | Context | Licence / access | Status | Source |
|---|---|---|---|---|---|---|---|
| Muse Spark 1.3 | `muse-spark-1.3` (and `muse-spark-1.3-contributor`) | 2026-09-02 [tracker-only — date] | Standard $1.25 in (first-party snippet); $4.25 out [tracker-only]. "Contributor" tier $0.10 in / $0.20 out [tracker] **in exchange for Meta training on your prompts/outputs** | 1M | Proprietary, hosted; **Meta Model API** (OpenAI-SDK-compatible, public preview, US developers); also on OpenRouter | Current Meta flagship API model | https://developer.meta.com/ai/models/muse-spark/ [first-party, search-index text] |
| Muse Spark 1.2 + **Muse Code** (terminal coding agent) | | 2026-08-05 [tracker] | $1.25 / $4.25 | | Zuckerberg said 1.2 weights *will* be opened; **nothing shipped as of early Sept** [tracker] | Superseded by 1.3 | https://developer.meta.com/ai/resources/blog/build-with-muse-code/ [first-party, search-index text] |
| Muse Spark 1.1 | | 2026-04 (Muse Spark launched April 2026) | "starts at $1.25 input / $4.25 output" | 1M | Meta Model API public preview | Superseded | https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/ , https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/ [first-party, search-index text] |
| **Muse Glimmer** (open weights) | — | 2026-08-10 [tracker — date] | free weights | 128K "pre-extension" | **Apache-2.0**, weights on Hugging Face; 30B dense multimodal (incl. ~1.8B vision encoder); runs on one consumer GPU / Mac; first Meta open-weights release since Llama 4 and first under Apache-2.0 | Current | https://developer.meta.com/ai/resources/blog/build-with-muse-glimmer/ [first-party, search-index text]; specs from InfoQ 2026-08 & Artificial Analysis [tracker] |

Course check: "Meta 'Muse Glimmer' Apache-2.0" is **correct** (30B, 2026-08-10). The August text's framing should add
that Meta's frontier line is now the **proprietary, API-only Muse Spark** (1.3 current); Llama is no longer Meta's
current release line.
Cross-sheet note: FACTS-landscape §C lists "Llama 4 Scout / Maverick … newest in Meta's official table" (meta-llama repo).
That is true *for the Llama line*, but Meta's newest open-weights model is **Muse Glimmer** (Meta developer blog, [S];
Hugging Face card not reachable from here to confirm the licence file first-hand).

### B6. Mistral AI — PARTIAL (docs.mistral.ai and mistral.ai blocked; no prices verified)
Current family names per Mistral's own pages (https://mistral.ai/models/ , https://docs.mistral.ai/resources/changelogs —
[first-party, search-index text]): **Mistral Medium 3.5** ("frontier-class multimodal … agentic and coding … adjustable
reasoning"), **Mistral Large 3** (open-weight sparse MoE, 41B active / 675B total; docs id page `mistral-large-3-25-12`
→ Dec 2025), **Mistral Small 4** (hybrid: unifies Magistral reasoning + Pixtral vision + Devstral agentic coding),
**Ministral 3** (3B / 8B / 14B; base, instruct, reasoning; image understanding), Magistral, Devstral, Codestral,
**Mistral OCR 4**, **Voxtral TTS**. Prices, context windows and release dates: **not verified this pass** — editors must
not add Mistral prices without checking https://mistral.ai/pricing .

### B7. DeepSeek — [first-party, search-index text] (api-docs.deepseek.com blocked; no DeepSeek-V4 repo on GitHub)
Source: https://api-docs.deepseek.com/quick_start/pricing/ ; V4 preview news https://api-docs.deepseek.com/news/news260424/
(2026-04-24); V4.1-Flash news https://www.deepseek.com/en/news/deepseek-v4-1-flash/ .

| API model name | Underlying model | Context / max out | $/MTok cache-hit / cache-miss input / output (**peak**) | Off-peak (50% off) |
|---|---|---|---|---|
| `deepseek-flash` | **DeepSeek-V4.1-Flash** | 1M / 384K | $0.006 / $0.30 / $1.20 | $0.003 / $0.15 / $0.60 |
| `deepseek-v4-pro` | **DeepSeek-V4-Pro-0813** (an Aug-13 refresh of V4 Pro) | 1M / 384K | $0.044 / $1.32 / $3.96 | $0.022 / $0.66 / $1.98 |

- **Change vs the August text:** "DeepSeek V4 Pro / Flash" → Flash is now **V4.1-Flash** behind the API name
  `deepseek-flash`; Pro is the 0813 snapshot. DeepSeek now has **peak vs off-peak pricing**. V4.1-Flash's KV cache needs
  ~1/4 the HBM and 1/8 the SSD of the previous generation (DeepSeek news). Release date of V4.1-Flash and licence of the
  V4.x weights: **not verified** (historically MIT; check the Hugging Face card before stating).
- Whether legacy names `deepseek-chat` / `deepseek-reasoner` still resolve: **not verified**.

### B8. Alibaba Qwen — [verified first-party] for open weights (GitHub QwenLM READMEs, fetched); API prices [first-party, search-index text]
Sources: https://github.com/QwenLM/Qwen3.8 (README news), https://github.com/QwenLM/Qwen3.8-Flash-Next ,
Alibaba Cloud Model Studio pages (https://www.alibabacloud.com/help/en/model-studio/model-pricing ,
https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-max ), Qwen blog https://qwen.ai/blog?id=qwen3.8 .

| Model | Released | Size | Weights | Context | Price (Model Studio, global) |
|---|---|---|---|---|---|
| **Qwen3.8-2.4T-A95B** ("Qwen3.8-Max") | **2026-08-12** | 2.4T total / 95B active MoE | **Open** (HF + ModelScope) | 262,144 (deploy examples) | API "Qwen3.8-Max": $1.65 in / $4.951 out per MTok; max output 128K |
| Qwen3.8-27B | 2026-08-14 | 27B dense | Open | 262,144 | — |
| **Qwen3.8-Flash-Next** | **2026-08-26** | 125B main + 51B N-gram embeddings, **6B active**; multimodal | Open | 262,144 | "early preview of the architecture used in **Qwen4**" |
| Qwen3.8-Flash (API) | 2026-08 | MoE, multimodal | (open per Alibaba blog) | | $0.16 in / $0.47 out (QwenCloud) |
| Qwen3.6-35B-A3B / Qwen3.6-27B | 2026-04-16 / 04-22 | | Open | | |
| Qwen3.5 (397B-A17B, 122B-A10B, 35B-A3B, 27B, 9B/4B/2B/0.8B) | 2026-02-16 → 03-02 | | Open | | |

Reasoning depth is tunable with `reasoning_effort` (README). Licence: README defers to the licence file shipped with
each checkpoint (Qwen3.x checkpoints have historically been Apache-2.0) — **check the HF card before stating a licence**.
Also new: **Qwen-Image-2.1** open image-generation model (repo created 2026-09-14). Course check: "Qwen 3.8" is
**correct and current**; add that the flagship 2.4T model's weights are open and Qwen3.8-Flash-Next previews Qwen4.

### B9. Moonshot AI (Kimi) — [verified first-party] (GitHub README + commit history, fetched)
Source: https://github.com/MoonshotAI/Kimi-K3 (repo initial commit **2026-07-27**; tech report updated to 2026-08-06).
- **Kimi K3**: open-weight, natively multimodal (text, image, video) agentic MoE — **2.8T total / 104B activated**,
  896 experts (16 per token), 93 layers (69 KDA + 24 gated MLA), MoonViT-V2 vision encoder, MXFP4 weights;
  **context 1,048,576**; licence "**Kimi K3 License**" (read it before calling it "open source"); API on
  https://platform.kimi.ai as `kimi-k3` with OpenAI- and Anthropic-compatible endpoints. Pricing: not verified.
- Course check: "Kimi K2.7" is **stale** — K3 shipped ~2026-07-27 (already before the Aug-29 pass). Kimi Code CLI
  (TypeScript, `MoonshotAI/kimi-code`) replaced the archived Python Kimi CLI.

### B10. Zhipu / Z.ai (GLM) — [verified first-party] (GitHub README + commits, fetched)
Source: https://github.com/zai-org/GLM-5 (commit "update GLM-5.3" on **2026-08-27**).
- **GLM-5.3** (744B total / 40B active) and **GLM-5.3-Flash** (320B / 18B active; sparse + linear-attention hybrid) are
  the current releases; GLM-5.2 (744B-A40B) introduced a "solid 1M-token context". Weights on HF + ModelScope; API on
  https://z.ai as `glm-5.x`. Licence not stated in README (GLM-5 family was MIT at launch — verify on HF). Z.ai also
  shipped the **ZCode** coding-agent harness (repo 2026-09-20).
- Course check: "GLM-5.2" → **GLM-5.3 is current** (late Aug 2026).

### B11. MiniMax — [verified first-party] (GitHub READMEs, fetched)
Sources: https://github.com/MiniMax-AI/MiniMax-M3 , https://github.com/MiniMax-AI/MiniMax-H3 .
- **MiniMax-M3** (repo 2026-06-01): ~428B total / ~23B active, **1M context**, natively multimodal (text, image, video),
  MiniMax Sparse Attention, three reasoning modes (enabled / adaptive / disabled); weights `MiniMaxAI/MiniMax-M3` on HF;
  API at https://platform.minimax.io . No M3.x successor found. Course "MiniMax M3" is **still current**.
- **MiniMax-H3** (repo 2026-07-30): open-weight **video** generation with native stereo audio (up to 2K, 15 s);
  hosted "H3 Max" via fal. MiniMax-Music3 (2026-08-11).

### B12. Amazon Nova, Microsoft, Cohere — NOT VERIFIED this pass
docs.aws.amazon.com, learn.microsoft.com and docs.cohere.com are blocked by the egress proxy, and the session's shared
WebSearch budget ran out (200/200) before these were reached. What is known first-party:
- **Amazon**: AWS sample repos show **Nova 2 Sonic** (speech-to-speech) in active use (2026-03 → 09) [V, GitHub
  aws-samples]; Bedrock hosts Claude (`anthropic.claude-opus-5-5` …), GPT-6 Astra ("available … through … AWS Bedrock",
  OpenAI) [S], and the `openai` SDK added "Bedrock Runtime endpoint support" (3.2.0, 2026-08-17) [V]. Nova text-model
  lineup and prices: **check https://aws.amazon.com/nova/ and https://aws.amazon.com/bedrock/pricing/ before stating.**
- **Microsoft**: Claude models run in **Microsoft Foundry** (Anthropic-operated "Hosted on Anthropic" deployments billed in
  CCUs via Azure Marketplace; US Data Zone = 1.1×) [V, Anthropic pricing page]; GPT-6 Astra is on Azure [S]. Microsoft's
  own MAI models: not verified.
- **Cohere**: `cohere` SDK 7.2.0 (2026-09-28), client class `cohere.ClientV2` [V]. Current Command / Embed / Rerank versions
  and prices: not verified — check https://docs.cohere.com/docs/models .
- **Newly significant labs**: none verified this pass beyond the reshuffles above (Meta's MSL "Muse" line; xAI under
  SpaceX). Do not add a new lab to course text without a first-party source.

---

## C. EMBEDDINGS & RERANKERS — PARTIAL (vendor doc hosts blocked; ids verified from SDKs/repos, prices mostly NOT verified)

| Vendor | Current ids (evidence) | Dims / max input | Price | Label |
|---|---|---|---|---|
| OpenAI | `text-embedding-3-small`, `text-embedding-3-large` (+ legacy `text-embedding-ada-002`) — **no newer OpenAI embedding model exists** in the SDK enum (`src/openai/types/embedding_model.py`, read 2026-10-02) | (unchanged since 2024: 1536 / 3072 default dims, `dimensions` param to shorten; 8,191-token input) | not re-verified | ids [verified first-party]; dims/prices from prior knowledge — re-check https://developers.openai.com/api/docs/pricing |
| Google | `gemini-embedding-001` (README) and **`gemini-embedding-2`** ("Gemini Embedding 2.0", **multimodal** embeddings, per-modality token counts) — python-genai CHANGELOG | not verified | not verified | ids [verified first-party, SDK changelog] |
| Voyage AI (MongoDB) | **Voyage 4** family; `voyage-4-nano` is an open model runnable locally via `voyageai[local]` (sentence-transformers), "unit-norm Matryoshka embeddings at every dimension", 1000-input batch limit — PyPI `voyageai` 0.5.0 README | not verified | not verified | [verified first-party, PyPI README]; other voyage-4 tier names [not verified] |
| Cohere | SDK README still shows `embed-english-v3.0` / `command-r-plus-08-2024` (stale examples). Current Embed / Rerank versions **not verified** (docs.cohere.com blocked) | | | — |
| Jina AI | **jina-embeddings-v5** (Jina's own repos, e.g. `jina-ai/jina-grep-cli` "powered by Jina embeddings v5"); v4 GGUF builds exist | | | [verified first-party, GitHub]; specs not verified |
| Mistral | `mistral-embed` (mistralai SDK README); `codestral-embed` existed in 2025 — status not verified | | | partial |
| Amazon | Titan Text Embeddings V2 / Nova multimodal embeddings — **not verified** (AWS docs blocked) | | | — |
| Alibaba Qwen (open) | `Qwen3-Embedding-0.6B / 4B / 8B` (1024 / 2560 / 4096 dims, MRL), `Qwen3-Reranker-0.6B / 4B / 8B`; 32K sequence length; 100+ languages; 8B was #1 on MTEB multilingual (70.58, as of 2025-06-05). No Qwen3.5/3.8 embedding release found | | open weights (Apache-2.0 historically — verify on HF) | [verified first-party, github.com/QwenLM/Qwen3-Embedding] |
| BAAI BGE (open) | `bge-m3`, `bge-reranker-v2-m3`, `bge-reranker-v2.5-gemma2-lightweight`, `bge-multilingual-gemma2`, `bge-en-icl` (FlagEmbedding 1.4.2 README) | | open | [verified first-party, PyPI README] |
| Anthropic | **No first-party embedding model** — Anthropic's docs point to Voyage AI (unchanged) | | | prior knowledge; not re-checked this pass |

Durable teaching points (safe): Matryoshka/truncatable dimensions are now standard (Voyage 4, Qwen3-Embedding, OpenAI
`dimensions`); multimodal embeddings are mainstream (Gemini Embedding 2); rerankers are a separate model call
(Cohere Rerank, Voyage rerank, Qwen3-Reranker, bge-reranker). Avoid quoting embedding prices in course text unless an
editor re-verifies them on the vendor page.

---

## D. SPEECH / REALTIME / IMAGE / VIDEO — names verified from SDK enums & changelogs; prices NOT verified

**OpenAI** [verified first-party: openai-python `src/openai/types/*` enums + CHANGELOG, read 2026-10-02]
- Image: `gpt-image-2` (snapshot 2026-04-21), **`gpt-image-2.5-flare` and `gpt-image-2.5-sunburst` (2026-09-08,
  "GPT Image 2.5")**, `gpt-image-1.5`, `gpt-image-1`(-mini), `chatgpt-image-latest`; `dall-e-2`/`dall-e-3` legacy.
  Pricing unit: per image / per image-token (not verified).
- Speech-to-text: **`gpt-transcribe`** (new), `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize`,
  `whisper-1`. Text-to-speech: `gpt-4o-mini-tts` (2025-12-15 snapshot), `tts-1`, `tts-1-hd`.
- Realtime / voice: **`gpt-realtime-2.1`, `gpt-realtime-2.1-mini`**, `gpt-realtime-2`, `gpt-realtime-1.5`, `gpt-realtime`,
  `gpt-audio-1.5`, `gpt-audio-mini`; SDK added a "Live API" (2026-09-10) and "Realtime translations" (2026-10-01).
  Pricing unit: per audio token (not verified).
- Video: `sora-2`, `sora-2-pro` — **SDK 3.1.0 (2026-08-14) "Deprecated Sora video APIs"** → do not teach the Sora API as a
  current building block without checking https://developers.openai.com/api/docs/deprecations .

**Google** [verified first-party: python-genai CHANGELOG/README; GA dates from ai.google.dev changelog, search-index]
- Speech: **Gemini 3.8 Flash TTS / 3.8 Flash-Lite TTS (GA 2026-09-22)**; `gemini-3.1-flash-tts-preview` earlier.
- Realtime: **Gemini 3.8 Live and 3.8 Live Extended Thinking (GA 2026-09-15)**, audio-to-audio via the Live API
  (live translation `TranslationConfig`, ephemeral tokens).
- Image: Gemini native image models (`gemini-3.1-flash-image`, `gemini-3-pro-image`; "Nano Banana" branding) + Imagen 4
  (`imagen-4.0-generate-001`). **SDK 2.14.0 (2026-07-22) added deprecation warnings to Imagen `generate_images`/`edit_images`
  and to `generate_videos` with prompt/text/image args** — Imagen-style endpoints are on their way out.
- Video: Veo (`veo-3.1-generate-preview` in README). Music: **Lyria 3.5** (2026-09-03; full-length songs, 44.1 kHz stereo).

**Others** (names only): xAI — Grok Imagine (image/video), Grok voice [not verified this pass]; Meta — Muse Image
(developer.meta.com/ai/models/muse-image/) [first-party, search-index]; MiniMax — **MiniMax-H3** open-weight video+audio
model (2026-07-30) and Music3 [verified first-party, GitHub]; Alibaba — **Qwen-Image-2.1** open image model (2026-09-14)
[verified first-party, GitHub]; Mistral — Voxtral TTS [first-party, search-index]; Amazon — Nova Sonic / Nova 2 Sonic
speech-to-speech (aws-samples repos) [names only].

---

## E. API & PLATFORM FEATURES (as of 2026-10-01)

### E1. Python SDK packages — versions [verified first-party: PyPI JSON, read 2026-10-02]
| Vendor | Package (`pip install …`) | Latest | Major-version history (breaking) | Requires |
|---|---|---|---|---|
| Anthropic | `anthropic` | **1.11.0** (2026-09-30) | **1.0.0 on 2026-08-20** — httpx→**httpx2**, removes `temperature`/`top_p`/`top_k` from request types (TypeError if passed); 1.2.0 (08-27) beta Files/Skills renames | Python ≥3.10 |
| OpenAI | `openai` | **3.23.0** (2026-10-01) | 2.0.0 (2025-09-30); **3.0.0 on 2026-08-12** — "HTTPX2 is now the default HTTP client, and `httpx` is no longer installed automatically" | ≥3.10 |
| Google | `google-genai` (import `from google import genai`) | **2.27.0** (2026-10-01) | 1.0.0 (2025-02-05); 2.0.0 (2026-05-07). README warns **3.0.0 will remove Automatic Function Calling from `models.generate_content`** (use Chats) — pin `<3.0.0` | ≥3.10 |
| Anthropic agents | `claude-agent-sdk` | 0.2.163 (2026-09-30) | (renamed from Claude Code SDK in 2025) | ≥3.10 |
| OpenAI agents | `openai-agents` | 0.22.3 (2026-09-17) | | ≥3.10 |
| Google agents | `google-adk` | **2.10.0** (2026-09-25) | 2.0.0 (2026-05-19) | ≥3.10 |
| Cohere | `cohere` | 7.2.0 (2026-09-28) | | |
| Voyage | `voyageai` | 0.5.0 (2026-07-10) | | |
| Mistral | `mistralai` | **3.0.0 (2026-09-28)** | 2.0.0 (2026-03-10) — a major bump 3 days before this review; check its migration notes before touching Mistral code | |
Changelogs: https://github.com/anthropics/anthropic-sdk-python/blob/main/CHANGELOG.md ,
https://github.com/openai/openai-python/blob/main/CHANGELOG.md , https://github.com/googleapis/python-genai/blob/main/CHANGELOG.md

### E2. Canonical minimal calls (copy these shapes; all from the vendors' own docs/READMEs)

**Anthropic** — https://platform.claude.com/docs/en/get-started [verified first-party]
```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1000,
    messages=[{"role": "user", "content": "What should I search for to find the latest developments in renewable energy?"}],
)
for block in message.content:
    if block.type == "text":
        print(block.text)
```
Effort (https://platform.claude.com/docs/en/build-with-claude/effort): add `output_config={"effort": "medium"}`.
Structured output (https://platform.claude.com/docs/en/build-with-claude/structured-outputs, **GA**):
`client.messages.parse(model=..., max_tokens=1024, messages=[...], output_format=MyPydanticModel)` → `response.parsed_output`
(raw API: `output_config.format` with `type: "json_schema"`; the old top-level `output_format` param + `structured-outputs-2025-11-13`
beta header is deprecated). Strict tools: `"strict": true` on a tool definition.
Note: the doc example reads text by iterating `content` blocks (thinking blocks come first on current models) — **don't teach
`message.content[0].text`** for current Claude models.

**OpenAI** — https://github.com/openai/openai-python (README) [verified first-party]; model id swapped to a current one
```python
from openai import OpenAI

client = OpenAI()  # reads OPENAI_API_KEY

response = client.responses.create(
    model="gpt-6.1-sol",                     # README example still says "gpt-5.5"
    instructions="You are a coding assistant that talks like a pirate.",
    input="How do I check if a Python object is an instance of a class?",
    reasoning={"effort": "low"},             # optional; shape from developers.openai.com reasoning guide [search-index]
)
print(response.output_text)
```
Chat Completions still works: `client.chat.completions.create(model=..., messages=[{"role": "developer", ...}, {"role": "user", ...}])`
→ `completion.choices[0].message.content`.

**Google Gemini** — https://github.com/googleapis/python-genai (README) [verified first-party]
```python
from google import genai
from google.genai import types

client = genai.Client()  # reads GEMINI_API_KEY (or GOOGLE_API_KEY)
response = client.models.generate_content(
    model="gemini-3.8-flash",                 # README uses the alias "gemini-flash-latest"
    contents="Why is the sky blue?",
    config=types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_level="low")),  # optional
)
print(response.text)
```
- `types.ThinkingConfig` has fields `include_thoughts`, `thinking_budget` (int; 0 = off, -1 = automatic; 2.5-era models)
  and `thinking_level` (`ThinkingLevel` = `MINIMAL` / `LOW` / `MEDIUM` / `HIGH`, a **case-insensitive** enum, so
  `"low"` is accepted) [verified first-party, google/genai/types.py + _common.py source]. Gemini 3.8 Flash documents
  `low` / `medium` (default) / `high` [first-party, search-index].
- **Vertex AI was renamed "Gemini Enterprise Agent Platform"**: the README says "Gemini Enterprise Agent Platform (formerly
  Vertex AI)" and now shows `genai.Client(enterprise=True, project='your-project-id', location='global')`; env var
  `GOOGLE_GENAI_USE_ENTERPRISE`. `vertexai=True` still works ("Legacy flag for enterprise", google/genai/client.py)
  [verified first-party]. Date of the rename: not verified.

### E3. Anthropic API features [verified first-party, platform.claude.com, read 2026-10-01]
- **Thinking** (https://platform.claude.com/docs/en/build-with-claude/thinking): `thinking={"type": "adaptive"}` is the mode;
  on Fable 5.1 / Mythos 5.1 / Opus 5.5 / Opus 5 / Sonnet 5.5 / Sonnet 5 / Fable 5 thinking is **on by default** with no
  `thinking` field. `"enabled"` + `budget_tokens` → **400 error** on every 5.x model and Opus 4.7/4.8 (deprecated on 4.6;
  only Haiku 4.5, Sonnet 4.5, Opus 4.5 still use it). `"disabled"`: 400 on Opus 5.5, Fable 5.x, Sonnet 5.5; on Opus 5 only
  at effort ≤ high. **Sonnet 5.5's lowest setting is `thinking={"type": "between_tools"}`** (no up-front thinking;
  only at effort ≤ high). `display`: `"omitted"` (default on 5.x/4.7/4.8 — empty thinking text), `"summarized"`,
  `"updates"` (beta header `thinking-display-updates-2026-08-18`). Thinking tokens bill as output and count toward
  `max_tokens`. Interleaved thinking is automatic with adaptive thinking.
- **Effort** (GA, no header): `output_config={"effort": "low"|"medium"|"high"|"xhigh"|"max"}`. Default `high` everywhere
  except **Opus 5.5 = `medium`**. `xhigh` on Fable/Mythos 5.x, Opus 5.5/5/4.8/4.7, Sonnet 5.5/5. Haiku 4.5: not supported.
  Per-message effort changes (cache-preserving) are beta: header `mid-conversation-output-config-2026-07-01`, an
  empty-content `role: "system"` message carrying `output_config`.
- **Request requirements on the current models** (https://platform.claude.com/docs/en/models/opus-5-5/migration-guide ,
  https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide): on **Opus 5.5 and Sonnet 5.5** (and Fable 5.1 /
  Mythos 5.1 per the 2026-09-01 release notes) these return 400 — manual thinking budgets, non-default sampling params
  (`temperature`/`top_p`/`top_k`), **assistant prefill**, **forced tool choice** (`tool_choice` `any`/`tool`, also on the
  token-counting endpoint; use `auto` + `strict: true` with `additionalProperties: false`, or structured outputs), and
  `thinking: disabled` (Sonnet 5.5: use `between_tools`). Thinking blocks are signed over the prior conversation and are
  model/account-bound: keep histories append-only and **pass the assistant message back unmodified** in tool loops (for
  accounts created on/after 2026-08-31 an edited replay returns 400). Computer use only via `computer_toolset_20260801`
  on the Claude API/Google Cloud. Opus 5.5 accepts mid-conversation `role: "system"` messages after a user turn.
  Legacy models (Opus 5, Opus 4.x, Sonnet 5/4.6, Haiku 4.5) still accept forced tool choice.
- **Prompt caching** (https://platform.claude.com/docs/en/build-with-claude/prompt-caching): **automatic caching** = one
  top-level `cache_control={"type": "ephemeral"}` (recommended start); or explicit breakpoints on blocks, **max 4**.
  TTL `5m` default or `{"type": "ephemeral", "ttl": "1h"}`. Minimum cacheable prefix: **512 tokens** (Fable/Mythos 5.x,
  Opus 5.5, Opus 5, Sonnet 5.5), 1,024 (Opus 4.8, Sonnet 5, Sonnet 4.6/4.5), 2,048 (Opus 4.7), 4,096 (Opus 4.6/4.5,
  Haiku 4.5). Changing effort, thinking, tool_choice or images invalidates the message cache; changing tools invalidates
  everything. Usage fields: `cache_creation_input_tokens`, `cache_read_input_tokens`, `input_tokens`. **Cache diagnostics GA
  2026-09-23.**
- **Server tools / tool versions** (https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference):
  web search `web_search_20260318` / `_20260209` / `_20250305` ($10 per 1,000 searches); web fetch `web_fetch_20260318` /
  `_20260309` / `_20260209` / `_20250910` (no extra charge); code execution `code_execution_20260521` / `_20260120`
  (programmatic tool calling) / `_20250825`; tool search `tool_search_tool_regex_20251119` / `tool_search_tool_bm25_20251119`
  (undated aliases accepted); advisor `advisor_20260301` (beta `advisor-tool-2026-03-01`); MCP connector `mcp_toolset`
  (beta `mcp-client-2025-11-20`). Client tools: memory `memory_20250818`, bash `bash_20250124`, text editor
  `text_editor_20250728`, **computer use `computer_toolset_20260801` (GA 2026-08-19)**, **browser use
  `browser_toolset_20260801` (new 2026-08-19)**. None of the GA server tools need a beta header any more.
- **Context management**: compaction **on demand** (beta header `compact-2026-09-04`, top-level `compaction` param) and
  **at a token threshold** (beta) — https://platform.claude.com/docs/en/build-with-claude/compaction ; **context editing**
  (clear old tool results / thinking by rule) — /build-with-claude/context-editing. Mid-conversation system messages
  (GA on Fable 5 / Mythos 5 / Opus 4.8 since 2026-07-15; turn-scoped variant beta 2026-09-01).
- **Files API GA** and **Agent Skills + Skills API (`/v1/skills`) GA** since 2026-08-19. Skills = folder with `SKILL.md`
  (YAML `name` ≤64 chars lowercase/hyphens, `description` ≤1024 chars) + optional scripts/resources; progressive
  disclosure (~100 tokens metadata per skill until triggered); on the API they run inside the code-execution container
  (`container` param with `skill_id`; pre-built `pptx`, `xlsx`, `docx`, `pdf`); no network, no package installs.
  https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- **Batch**: 50% off; Message Batches support up to 300K output with beta `output-300k-2026-03-24`.
- **Claude Managed Agents** (hosted agent harness; sessions in Anthropic cloud or self-hosted sandbox; $0.08/session-hour
  + tokens) — https://platform.claude.com/docs/en/managed-agents/overview
- **Claude Agent SDK** (https://code.claude.com/docs/en/agent-sdk/overview): "Build production AI agents with Claude Code
  as a library" — Python `claude-agent-sdk`, TypeScript `@anthropic-ai/claude-agent-sdk`; built-in tools, hooks, subagents,
  MCP, permissions, sessions, skills, plugins. The Console "Workbench" is now **playground** (2026-08-18).

### E4. OpenAI API features [first-party, search-index text unless marked]
- **Responses API** = recommended for new projects; **Chat Completions still supported** (not deprecated);
  **Assistants API sunset 2026-08-26** (gone) → Responses + **Conversations** API
  (https://developers.openai.com/api/docs/guides/migrate-to-responses , /api/docs/assistants/migration).
- Reasoning: `reasoning={"effort": ...}`; the SDK's `ReasoningEffort` type allows `none` | `minimal` | `low` | `medium` |
  `high` | `xhigh` | `max` [V, E6] but support is per model [S]: GPT-6 Sol/Luna/6.1 Sol default `medium`; Astra and
  (per one snippet) 6.1 Sol reject `none`. Also `reasoning.summary` ("auto"), `reasoning.mode: "pro"` (pro mode, replaces
  separate `*-pro` models), `text={"verbosity": "low"|...}`.
- Structured outputs: `text.format` with `type: "json_schema"`, `strict: true` (Responses) / `response_format` (Chat
  Completions); SDK helpers `client.responses.parse(..., text_format=PydanticModel)` and
  `client.chat.completions.parse(..., response_format=PydanticModel)` [V — openai-python helpers.md + installed SDK].
- Built-in tools in Responses: web search, file search, code interpreter, image generation, remote MCP, computer use, shell
  (list from OpenAI's "Why we built the Responses API" text + SDK changelog; not exhaustively re-verified).
- Service tiers: Standard / Batch (−50%) / Flex (−50%) / **Fast** (2×; renamed from Priority 2026-07-30) / **Ultrafast**.
- Caching: automatic; **cache writes now billed at 1.25× on GPT-5.6+**; `prompt_cache_retention` (`in_memory` | `24h`,
  default `24h` for non-ZDR orgs); prompt-cache prewarming and cache diagnostics added in SDK (Sept 2026)
  [SDK: verified first-party].
- Compaction: Responses "compact" endpoint (`/api/reference/resources/beta/subresources/responses/methods/compact`);
  compaction progress events (SDK 3.15.0, 2026-09-18).
- **Agents API** (public beta, announced at DevDay 2026; SDK `client.beta.agents…`, v3.13.0 2026-09-10): hosted agent
  sessions on a managed Codex harness with memory, tools, multi-agent, computer use; "no additional fees".
  **OpenAI Agents SDK** = `openai-agents` (Python) — separate client-side framework, still 0.x.
- Realtime: "Live API" added in SDK 3.12.0 (2026-09-10) [verified first-party, SDK]; details not verified.

### E5. Google Gemini API features [first-party, search-index text unless marked]
- Thinking: `thinking_config.thinking_level` (`low` / `medium` / `high`; enum also has `MINIMAL`); older
  `thinking_budget` is for 2.5-era models.
- **Interactions API** — "a unified interface for interacting with Gemini models and agents … stateful conversations,
  specialized agents (like deep research), and multimodal inputs/outputs" [verified first-party, python-genai README].
- Context caching: explicit (`client.caches`, "90% discount + prorated token storage"); Batch API (−50%, ≤24 h); Flex
  (−50%); Priority (+75–100%); Deferred tier (public 2026-08-12).
- Built-in tools: Google Search grounding, Google Maps grounding (SDK 2.16.0), code execution, URL context, computer use,
  function calling with JSON schema (SDK 2.18.0).
- **Google ADK** (`google-adk` 2.10.0) is Google's agent framework; "Antigravity" agents are exposed as models in the API.

### E6. Offline SDK check — installed `anthropic==1.11.0`, `openai==3.23.0`, `google-genai==2.27.0` in a scratch venv and inspected signatures (no network calls) [verified first-party, 2026-10-02]
- `anthropic`: `client.messages.create` accepts `output_config`, top-level `cache_control`, `thinking`, `inference_geo`,
  `diagnostics`; it has **no `temperature` / `top_p`** — passing `temperature=0.2` raises
  `TypeError: Messages.create() got an unexpected keyword argument 'temperature'`. `speed`, `compaction` and
  `context_management` exist only on `client.beta.messages.create`. `client.messages.parse` takes `output_format=` (and
  `output_config`). Thinking param types: `ThinkingConfigAdaptiveParam`, `ThinkingConfigBetweenToolsParam`,
  `ThinkingConfigDisabledParam`, `ThinkingConfigEnabledParam`. `ModelParam` ids: claude-sonnet-5-5, claude-fable-5-1,
  claude-opus-5-5, claude-mythos-5-1, claude-sonnet-5, claude-fable-5, claude-mythos-5, claude-opus-5, claude-opus-4-8,
  claude-opus-4-7, claude-mythos-preview, claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5(-20251001),
  claude-opus-4-5(-20251101), claude-sonnet-4-5(-20250929).
- `openai`: `client.responses.create` accepts `reasoning`, `text`, `conversation`, `prompt_cache_key`,
  `prompt_cache_retention`, `service_tier`; `client.responses.parse(..., text_format=Model)` exists. `ReasoningEffort` =
  `none | minimal | low | medium | high | xhigh | max` (per-model support varies). Service-tier literal: `auto`, `default`,
  `flex`, `scale`, `priority`, `fast`, `ultrafast`. `client.beta.agents` and `client.conversations` exist;
  **`client.beta.assistants` is still in the SDK even though the API was sunset 2026-08-26** — code using it will
  type-check and then fail at runtime.
- `google-genai`: `types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_level="low"))` validates
  (→ `ThinkingLevel.LOW`); `client.interactions`, `client.caches`, `client.batches` exist.
- The three E2 snippets pass `python3 -m py_compile`.

---

## F. CANONICAL DOC URLS (tested 2026-10-01/02 where the proxy allowed)

**Anthropic** [V — fetched]
- API docs root: `https://platform.claude.com/docs/en/…` (docs.claude.com and docs.anthropic.com are legacy hosts).
- Models overview — canonical path is now **https://platform.claude.com/docs/en/models/overview** (the page's own
  front-matter URL); the older https://platform.claude.com/docs/en/about-claude/models/overview still serves the same page.
  Per-model pages: `/docs/en/models/opus-5-5/overview`, `/models/fable-5-1/overview`, `/models/sonnet-5-5/overview`,
  `/models/haiku-4-5/overview`; migration guides at `/docs/en/models/<model>/migration-guide`.
- Pricing `/docs/en/about-claude/pricing` · Deprecations `/docs/en/about-claude/model-deprecations` · Release notes
  `/docs/en/release-notes/overview` · Quickstart `/docs/en/get-started` · Effort `/docs/en/build-with-claude/effort` ·
  Thinking `/docs/en/build-with-claude/thinking` · Prompt caching `/docs/en/build-with-claude/prompt-caching` · Structured
  outputs `/docs/en/build-with-claude/structured-outputs` · Compaction `/docs/en/build-with-claude/compaction` · Tool use
  `/docs/en/agents-and-tools/tool-use/overview` · Tool reference `/docs/en/agents-and-tools/tool-use/tool-reference` ·
  Agent Skills `/docs/en/agents-and-tools/agent-skills/overview` · MCP connector `/docs/en/agents-and-tools/mcp-connector` ·
  Managed Agents `/docs/en/managed-agents/overview` · Client SDKs `/docs/en/cli-sdks-libraries/overview` ·
  Console playground https://platform.claude.com/playground (Workbench renamed 2026-08-18).
- Claude Code docs: **https://code.claude.com/docs/en/overview** (index: https://code.claude.com/docs/llms.txt).
  **Agent SDK: https://code.claude.com/docs/en/agent-sdk/overview** — `platform.claude.com/docs/en/agent-sdk/overview`
  returns **307 → code.claude.com**.
- Redirects observed: `docs.claude.com/en/docs/about-claude/models/overview` → **302** →
  `platform.claude.com/docs/en/about-claude/models/overview`; `docs.claude.com/en/docs/claude-code/overview` → **301** →
  `code.claude.com/docs/en/overview`. `docs.anthropic.com` could not be tested (blocked here) — don't link it in new text.

**OpenAI** [S — hosts blocked; inferred from where every first-party search hit lives]
- Canonical API docs: **https://developers.openai.com/api/docs/…** — e.g. `/api/docs/models`, `/api/docs/models/gpt-6-astra`,
  `/api/docs/pricing`, `/api/docs/deprecations`, `/api/docs/changelog`, `/api/docs/guides/reasoning`,
  `/api/docs/guides/migrate-to-responses`, `/api/docs/guides/prompt-caching`, `/api/docs/guides/latest-model` ("Using GPT-6").
  API reference: `https://developers.openai.com/api/reference/…`. Codex docs: `https://developers.openai.com/codex/`.
- `platform.openai.com/docs/…` is the legacy location (a few search hits still point there); redirect behaviour **not
  tested**. Use developers.openai.com links in course text. Announcements: `https://openai.com/index/<slug>/`.

**Google** [S, plus one tested redirect]
- Gemini API: **https://ai.google.dev/gemini-api/docs/…** — `/models`, `/pricing`, `/changelog`, `/deprecations`,
  `/latest-model` ("What's new in Gemini 3.8 Flash"), `/models/gemini-3.8-flash`. Some pages now also appear under
  `/gemini-api/docs/generate-content/…` and `/gemini-api/docs/interactions/…` (docs being reorganised around the
  Interactions API) — link the short top-level paths.
- Gemma: https://ai.google.dev/gemma/docs . Model cards: https://deepmind.google/models/model-cards/… .
- Google Cloud (now "Gemini Enterprise Agent Platform"): **`cloud.google.com/vertex-ai/generative-ai/docs/models` → 301 →
  `https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models`** [V — redirect observed]. Update old cloud.google.com
  doc links to docs.cloud.google.com.

**Others** [S]: xAI https://docs.x.ai/developers/models (note `/developers/` path), release notes
https://docs.x.ai/developers/release-notes · Meta https://developer.meta.com/ai/ (Meta Model API) · DeepSeek
https://api-docs.deepseek.com/quick_start/pricing/ · Qwen https://www.alibabacloud.com/help/en/model-studio/model-pricing ·
Kimi https://platform.kimi.ai · Z.ai https://z.ai · MiniMax https://platform.minimax.io · Mistral https://docs.mistral.ai/ ·
PyPI https://pypi.org/project/<package>/ .

---

## G. BENCHMARKS & INDEPENDENT TRACKERS (tracker sites are blocked here; status from the benchmarks' own GitHub repos [V] or vendor posts [S])

- **Artificial Analysis** (artificialanalysis.ai) — independent aggregator: an "Intelligence Index" composite plus measured
  speed/latency/price per provider. Caveat: the index's eval mix is re-versioned periodically, so scores are only
  comparable within one version; quote version + date.
- **LMArena** (lmarena.ai) — crowd-sourced blind pairwise votes → Elo-style ranks (text, webdev, vision, search…). Measures
  human *preference*, not correctness; sensitive to style/length; vendors test anonymous pre-release variants there.
- **SWE-bench Verified** — 500 human-validated GitHub issues (Python repos), resolved = hidden tests pass. Caveats:
  near-saturated at the top, contamination risk, heavily scaffold-dependent. **SWE-bench Multimodal v2** (480 tasks) was
  open-sourced **2026-09-01** [V, github.com/SWE-bench/SWE-bench]. **SWE-bench Pro** (Scale AI; harder, multi-language,
  partly held out) is the common "harder" companion [prior knowledge — not re-verified]. In Sept-2026 launches both
  OpenAI and Google instead headlined **DeepSWE v1.1** ("long-horizon software engineering") [S]; maintainer not verified.
- **Terminal-Bench** — agents completing real tasks in a terminal sandbox. Now "a **continuous benchmark**, with tagged
  releases published on the Harbor Hub" under `github.com/harbor-framework/terminal-bench` (the README's leaderboard link
  is tagged `4-0-0`, while 2026 model READMEs cite Terminal-Bench 2.1 / 3.0 — see FACTS-landscape §G); Terminal-Bench 2
  and 1 remain as fixed sets; **Terminal-Bench-Science** covers research workflows (OpenAI cited "Terminal-Bench Science
  0.1" for GPT-6.1 Sol) [V repos / S citation]. Always quote the version and agent harness.
- **HLE (Humanity's Last Exam)** — ~2,500 expert-written questions across fields (CAIS + Scale;
  github.com/centerforaisafety/hle). Caveats: label errors led to **HLE-Verified**, a revised subset (Google quotes
  "54.9% on HLE-Verified" for Gemini 3.8 Flash) [V repo / S]; with-tools vs no-tools scores are not comparable.
- **ARC-AGI** (ARC Prize) — novel-abstraction puzzles; ARC-AGI-2 (static grids) and **ARC-AGI-3 (interactive game
  environments; ARC Prize 2026 runs on it via Kaggle)** [V, github.com/arcprize]. Caveat: report cost per task with score.
- **GPQA Diamond** — 198 graduate-level science multiple-choice questions; effectively saturated at the frontier, so low
  signal for ranking top models [prior knowledge].
- Also in Sept-2026 vendor posts [S]: **AutomationBench** (multi-app business workflows; OpenAI), **Vals Index** (finance,
  legal, tax, coding "economic impact"; Google Argon), computer-use suites (OSWorld-style). These are vendor-selected —
  look for independent replication before citing.
- Teaching caveats (durable): vendor-reported ≠ independent; effort/thinking settings and scaffolds change scores by many
  points; benchmarks get versioned, saturated and contaminated; always cite benchmark version + setting + date.

---

## H. SAFE PHRASING — durable vs will-rot

**Durable (fine to state without a date):**
- Every major vendor sells a **tiered family** (flagship / workhorse / fast-cheap); pick the cheapest tier that passes
  your evals.
- **Output tokens cost several times input** — 5× at Anthropic (all current models), OpenAI GPT-6 (all tiers) and
  Gemini 3.8 Flash; 6× on Gemini 3.1 Pro; 3× on Grok 4.7 → say "typically 3–6×, most often 5×".
- **Batch ≈ 50% off** at Anthropic, OpenAI and Google.
- **Prompt caching** makes repeated prefixes ~90%+ cheaper to *read* (cache reads 2.5–10% of base input), but writes can
  carry a premium (Anthropic 1.25× for 5-min / 2× for 1-hour; OpenAI now 1.25× on GPT-5.6+; Google charges storage/hour).
- **~1M-token context is now normal at the frontier** (Claude Fable/Opus/Sonnet 5.x, GPT-6 family 1.05M, Gemini 3.x,
  Kimi K3, MiniMax M3, DeepSeek V4.x, GLM-5.2+); exceptions exist (Grok 4.7 500K; Claude Haiku 4.5 200K). Long-prompt
  surcharges differ: none at Anthropic; OpenAI >272K → 2× input / 1.5× output; Gemini 3.1 Pro >200K → $4/$18;
  xAI ≥200K → 2×.
- **Reasoning depth is set by an effort-style knob**, not raw token budgets: Anthropic `output_config.effort`
  (low…max), OpenAI `reasoning.effort` (none…max), Google `thinking_level` (low/medium/high), xAI `reasoning_effort`.
  Thinking tokens bill as output.
- Stateful "responses"-style APIs with **server-side tools** (web search, code execution, MCP, computer use) are standard;
  OpenAI's Assistants API is gone.
- Strong **open-weight** models at ~1M context come mostly from Chinese labs (Qwen, Kimi, GLM, DeepSeek, MiniMax) plus
  Google Gemma 4 and Meta Muse Glimmer — **licences differ** (Apache-2.0, MIT, custom) → "check the licence file".
- Frontier **cyber-capable models are increasingly gated** to vetted defenders (Claude Mythos 5.1 via Project Glasswing,
  Gemini 4 Argon / 3.8 Flash Cyber via Fairwind, GPT-5.6 Cyber) — teach the pattern, not availability.

**Ratios for ai-architect's single "as of" anchor (derived from the verified prices above):**
batch 0.5× · cache read 0.1× base (0.05× Opus 5.5 and GPT-6.1 Sol; 0.025× Fable 5.1) · cache write 1.25× (Anthropic 5-min,
OpenAI) / 2× (Anthropic 1-hour) · output:input 5× (3–6× range) · "fast/priority" tiers 2× (Anthropic Opus 5.5 fast
$8/$40 vs $4/$20; OpenAI Fast; Google Priority 1.75–2×), OpenAI Ultrafast ≈6× · US-only data residency 1.1× (Anthropic) ·
**flagship-to-cheapest price spread: 10× at Anthropic (Fable 5.1 $10 vs Haiku 4.5 $1), ~8× at Google (3.1 Pro $2 vs
3.1 Flash-Lite $0.25), 100× at OpenAI (GPT-6 Astra $10 vs GPT-6 Luna $0.10).**

**Will rot within a quarter (date-stamp "as of October 2026", or avoid):**
- Every specific price, especially promotional or introductory ones: GPT-5.6 Sol $4/$20 (promo "at least through
  2026-11-21"); Gemini 3.8/3.7 Flash $0.75/$3.75 (→ $1.50/$7.50 on 2027-01-01); Gemini 4 Argon "$2/$10 introductory";
  Meta Muse Spark "contributor" tier.
- "Latest" / "best" model names: OpenAI shipped four GPT-6 models in four weeks; Google three Flash versions in six weeks;
  Anthropic three new models in September. Use API ids + "as of".
- Retirement/shutdown dates: Haiku 4.5 (≥2026-10-15; no successor announced — likely to change soon), Sonnet 4.5
  (2026-11-30), `gpt-4.1-nano` (2026-10-23), GPT-5 / o3 (2026-12-11), Gemini 2.5 access limits.
- Beta headers and dated tool versions (`compact-2026-09-04`, `web_search_20260318`, `computer_toolset_20260801`…).
- SDK major versions (anthropic 1.x since 2026-08-20; openai 3.x since 2026-08-12; google-genai 2.x with 3.0 announced;
  mistralai 3.0 on 2026-09-28).
- Benchmark scores/ranks.
- Product names in flux: Vertex AI → **Gemini Enterprise Agent Platform**; xAI → **SpaceXAI**; Console Workbench →
  **playground**; OpenAI Priority → **Fast mode**.

**Code-sample rules that follow from the above (ai-eng):**
- Claude: no `temperature`/`top_p`/`top_k` (TypeError in SDK ≥1.0; 400 on 4.7+), no `budget_tokens` on 5.x, no assistant
  prefill, **no forced `tool_choice` (`any`/`tool`) on Opus 5.5, Sonnet 5.5 or Fable 5.1** — for "make the model call
  this tool / return this JSON" use `client.messages.parse(..., output_format=Model)` or `strict: true` + `tool_choice`
  auto; read text by filtering `block.type == "text"`; in tool loops append `response.content` unchanged (thinking blocks
  included); use `output_config={"effort": …}`.
- OpenAI: `client.responses.create(model="gpt-6.1-sol" | "gpt-6-luna" | "gpt-6-astra", input=…, reasoning={"effort": …})`;
  never Assistants (`client.beta.assistants`/threads) in new code — the SDK still exposes it but the API is gone.
- Google: `from google import genai`; `client.models.generate_content(model="gemini-3.8-flash", …)`; `enterprise=True`
  (legacy `vertexai=True`) for the Cloud platform; never the old `google-generativeai` package (`import
  google.generativeai`) — PyPI titles it "[Deprecated] Google AI Python SDK for the Gemini API" (last release 0.8.6,
  2025-12-16) [V].
