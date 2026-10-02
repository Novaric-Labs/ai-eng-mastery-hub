---
name: ai-eng-course
description: Review notes for the AI Engineering Mastery Hub (content/content.json, 24 modules after the Oct 2026 review) — recurring error classes, canonical facts, house rules
metadata:
  type: project
---

The Mastery Hub (`ai-eng`, content/content.json, minified single-line JSON) was fully reviewed 2026-10-01/02: all 21 modules audited and expanded, three added (`computer` b3, `serving` b5, `voice` b5) → 24 modules, 970 estMin, 199 quiz items.

**Recurring error classes — check these first on any re-review:**
- **Quiz letter references.** Options are shuffled and re-lettered A–D at runtime (`app-next/lib/store.ts` prepItems + Quiz.tsx chips), so "(C)", "B would…", "option D" in an `exp` point at the wrong option ~75% of the time. 112 items had this in Oct 2026; `content/validate-quizzes.mjs` now rejects them.
- **Extraction damage in PATTERNS.code.** The original HTML→JSON extraction turned `\n` escapes into real newlines (broken string literals) and stripped regex backslashes (`\b` became a backspace; `\s+` became `s+`), so injection/PII screens silently never matched. Compile every Python sample and grep code for U+0008 and backslash-less regex tokens.
- **Inverted or wrong unit arithmetic:** 1,000 tokens ≈ 750 words (not the reverse); latency = TTFT + output_tokens / TPS (divide); streaming hides decode time, not TTFT; non-Latin scripts and code need MORE tokens per word; $/1K vs $/M mix-ups (finetune was 10–100× off); a self-hosted $/MTok figure needs a GPU price, tokens/s and utilization, all stated.
- **Misattributed figures:** the 78%/42% CORE-Bench result was Claude Opus 4.5 (Princeton HAL, Dec 2025); Anthropic's 4×/15× token multiples are agents-vs-chat and multi-agent-vs-chat; Anthropic's contextual retrieval is LLM-written chunk context (35/49/67% failure reductions), not header prepending.
- **Silent API drift in code:** see [[vendor-doc-urls]] and the facts below.

**Canonical facts used (verified first-party 2026-10-01 on platform.claude.com):** Fable 5.1 $10/$50, Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 4.5 $1/$5 (200K; no successor announced); 1M context on the 5.x models; cache reads 0.1× (0.05× Opus 5.5, 0.025× Fable 5.1), writes 1.25×, Batch 50% off. On every current Claude model except Haiku 4.5: non-default temperature/top_p/top_k, forced tool_choice, assistant prefill, budget_tokens and thinking:disabled return 400; anthropic SDK ≥1.0 removed the sampling params. Effort steers adaptive thinking; thinking tokens bill as output. Text watermark: Fable 5.1 and Mythos 5.1 only. Image tokens ⌈w/28⌉×⌈h/28⌉ (÷750 is obsolete). Non-Anthropic prices were only search-index verified — re-check them first.

**House rules:** no em dashes anywhere in this file (en dashes for ranges only), US spelling; "as of <month>" stamps only in `llm` and `landscape`; ai-eng OWNS component definitions that ai-architect cites (effort → llm, trifecta/Rule of Two → aisec, pass^k → evals, durable execution → agents, idempotency → tools, audit logs → mlops, provenance → multimodal). OpenAI code uses the Responses API (`responses.parse(text_format=…)`). Only DEPTH mech/trade/scale/sec/interview render — extra DEPTH keys are dead data.

**Why:** live paid flagship; dated facts and code samples rot fastest here.
**How to apply:** run validate-quizzes, compile every Python sample, and diff dated facts against the vendor's own model/pricing pages before editing. Related: [[vendor-doc-urls]], [[ai-architect-course]], [[review-environment]].
