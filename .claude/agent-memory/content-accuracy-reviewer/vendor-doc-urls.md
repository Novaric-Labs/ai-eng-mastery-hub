---
name: vendor-doc-urls
description: Known-stale / redirecting vendor documentation URLs (OpenAI + Anthropic) cited across Novacademy courses, with current targets
metadata:
  type: reference
---

Verified 2026-06-16 while reviewing AI Foundations course resource links.

**Anthropic docs moved host:** every `docs.anthropic.com/en/docs/...` URL now 301-redirects to `platform.claude.com/docs/en/docs/...`. Destination content still exists and matches (prompt-engineering/overview, system-prompts, tool-use/overview, reduce-hallucinations all live). Links work via redirect but are no longer canonical — prefer platform.claude.com.

**anthropic.com/learn** redirects to "Anthropic Academy" — a practical/enterprise hub. It does NOT have dedicated beginner pages for "What is an LLM", "What are tokens?", "Context windows". AI Foundations cites this same generic URL for 4 different specific topics, which over-promises topic-specific content.

**OpenAI help-center article slugs are brittle:**
- `help.openai.com/en/articles/6783457-what-is-chatgpt` is really titled "What is ChatGPT?" (still references a 2021 cutoff). Course mis-cites it as "Why does ChatGPT sometimes give wrong answers?".
- `help.openai.com/en/articles/8077698-how-do-i-use-chatgpt` no longer surfaces in search (likely removed/merged). Current capabilities article: `9260256-chatgpt-capabilities-overview`.
- `help.openai.com/en/articles/8590148-memory-faq` (ChatGPT memory) — not re-verified; check.

**OpenAI platform docs migrating:** `platform.openai.com/docs/guides/prompt-engineering` and `/docs/models` still resolve, but OpenAI is moving docs to `developers.openai.com/api/docs/...`. Watch for future breakage.

**How to apply:** when a course cites a vendor help-center article by numeric slug + a paraphrased title, verify the slug's ACTUAL title — they drift. Prefer linking to a stable hub over a deep slug when the exact article title isn't load-bearing.
