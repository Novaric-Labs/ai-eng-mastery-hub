---
name: ai-eng-course
description: Authoring conventions for the AI Engineering Mastery Hub (content/content.json, 24 modules) — typography, ladder ownership, code conventions for current APIs
metadata:
  type: project
---

`content/content.json` is minified single-line JSON; edit it via per-module fragments (split → edit → merge reproducing the file byte-for-byte), never by hand. 24 modules / 5 blocks after the Oct 2026 review; Block 3 gained `computer` (after harness), Block 5 gained `serving` (after finetune) and `voice` (last).

**How to apply:**
- Typography: no em dashes anywhere in this file (en dashes only for ranges), US spelling. Preface captions in `video/data/prefaces.mjs` keep the house form "A short preface — …" (the video pipeline is exempt).
- Dated "as of <month>" stamps only in `llm` and `landscape`; state other facts without stamps.
- Ownership (the ladder): ai-eng teaches how to BUILD; ai-architect only sizes/places/authorizes and cites these owners — effort mechanism → `llm`; structured outputs → `prompt`; context primitives → `context`; trifecta/Rule of Two → `aisec`; pass^k and agent evals → `evals`; durable execution → `agents`; MCP, tool search, idempotency → `tools`; audit logs/record-keeping → `mlops`; provenance/labeling → `multimodal`; disclosure UX → `lead` + `halluc` + `voice`; self-hosting economics → `serving`.
- Code conventions: Claude 5.5-generation API (no temperature/top_p/top_k, no forced tool_choice, no prefill, no budget_tokens; effort via `output_config`; read text from text blocks, never `content[0]`; transcripts are append-only); anthropic SDK ≥1.x; OpenAI via the Responses API (`responses.parse(text_format=…)`); google-genai (not google-generativeai). Every Python sample must compile; four samples are intentionally non-Python (prompt YAML+code, vecdb SQL, design LiteLLM YAML, lead template).
- Self-hosted cost = GPU $/hour ÷ (tokens/s × 3,600 × utilization) × 1e6, with all three inputs stated as assumptions.

Related: [[course-content-schema]], [[ai-architect-course]].
