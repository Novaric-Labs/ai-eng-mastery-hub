---
name: ai-foundations-course
description: Source-of-truth notes and recurring brittle-claim watchpoints for the AI Foundations beginner course (content/ai-foundations.json + video/data/prefaces-ai-foundations.mjs)
metadata:
  type: project
---

The AI Foundations course (branch feat/multi-course-catalog) is a beginner course on how LLMs/chat assistants work. 8 modules: whatai, tokens, context, prompting, chat, limits, tools, using.

Reviewed 2026-06-16. Technical content (token model, context window, statelessness, hallucination, knowledge cutoff, tool use, multimodality, model selection) was found accurate and beginner-appropriate; all 40 quiz answer-indices verified correct. The course was deliberately written to avoid brittle specifics (no exact prices, context-window sizes, or "latest model is X" claims) — preserve that discipline in any edits.

**Why:** beginner audience; the whole pedagogy rests on the "text-prediction machine" mental model, reinforced consistently across PLAIN/mental/DEEP/DEPTH/QUIZ/CARDS/SCENARIOS.
**How to apply:** when editing, keep terms consistent (token ≈ ¾ word / ~4 chars; "stateless"; "grounding"; "knowledge cutoff"). Module 8 `using` links to Engineering Mastery via "#" placeholder on purpose — not a finding. Each module's DEEP.res cites vendor docs — see [[vendor-doc-urls]] for which are stale.

Brittle-claim watchpoints for re-review: any future addition of exact pricing, exact context-window token counts, or named "current best model" would break the course's deliberately evergreen framing.
