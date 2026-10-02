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

**October 2026 review (10 lessons now).** Added `actions` ("When AI Takes Action": agents, deep research, browser agents, connectors, prompt injection in plain English) and `safely` ("Using AI Responsibly": data/training settings, AI at work, sycophancy, bias, deepfakes and scams, copyright) in b2; `chat` moved to the end of b1 so each block has 25 quiz items (the block review samples 20). Existing lessons updated for thinking modes, memory-by-default and temporary chats, context rot, automatic web search with sources, voice mode and image/video generation. Evergreen discipline held (no prices, token counts or model versions). Verified points: rating/reporting a chat can let the company train on it even with training off (Anthropic privacy policy, effective 2026-09-10); the EU bans most workplace/school emotion-recognition AI (medical/safety exceptions). Watch: "Engineering Mastery" (the course's name for the next course) vs catalog title "AI Engineering Mastery Hub"; academy.claude.com AI Fluency course URL and OpenAI help-center slugs are unverified from cloud sessions.
