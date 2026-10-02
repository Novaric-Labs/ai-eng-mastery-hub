---
name: review-environment
description: What is and isn't reachable when reviewing courses from a claude.ai cloud session — blocked vendor hosts, shared search budget, first-party fallbacks
metadata:
  type: reference
---

Observed in the Oct 2026 cloud-session review (may differ on a local machine or a different network policy):

- **Blocked by the egress proxy:** openai.com, developers.openai.com, platform.openai.com, help.openai.com, ai.google.dev, owasp.org, genai.owasp.org, modelcontextprotocol.io, eur-lex.europa.eu and most EU/US government sites, artificialanalysis.ai, huggingface.co, arxiv.org, youtube.com, most vector-DB/embedding vendor docs, academy.claude.com, privacy.claude.com.
- **Reachable:** platform.claude.com (append `.md` to a docs URL for clean markdown), code.claude.com, anthropic.com, claude.com, support.claude.com, github.com, raw.githubusercontent.com, pypi.org, registry.npmjs.org.
- **WebSearch budget is ~200 calls per session, shared by every sub-agent** — it ran out mid-review. Research early, once, into a shared fact sheet, and mark each fact [V] fetched first-party / [S] first-party page seen via search-index text / [T] tracker-only (never publish [T]).
- **First-party fallbacks that worked:** spec repos on GitHub (MCP: raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/docs/specification/<ver>/…; OWASP GenAI LLM Top 10: GenAI-Security-Project/GenAI-LLM-Top10; OTel GenAI conventions: open-telemetry/semantic-conventions-genai; MITRE ATLAS: mitre-atlas/atlas-data); SDK wheels from PyPI to check signatures; a scratch venv + mock HTTP transport to run course code end-to-end offline.

**Rule:** an EGRESS_BLOCKED fetch is not a dead link — keep canonical URLs you can't open and list them for a browser check.

Related: [[vendor-doc-urls]], [[ai-eng-course]].
