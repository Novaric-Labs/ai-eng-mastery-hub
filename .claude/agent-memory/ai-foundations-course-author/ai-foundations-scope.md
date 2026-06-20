---
name: ai-foundations-scope
description: "AI Foundations course: declared meta, where content lives, the module plan, and written-vs-pending status"
metadata:
  type: project
---

**Declared course meta** (`app-next/lib/courses.ts` + `supabase/migrations/0003`): slug `ai-foundations`, title "AI Foundations", Beginner, 6–8 hrs, **moduleCount: 8**, status `coming_soon`, accent `#7c6bff`. Positioning: "Zero to fluent — what LLMs, tokens, and prompts actually are, before the deep course." It's the gentle on-ramp / cheaper prereq to the Mastery Hub.

**No curriculum/outline or content existed before 2026-06-16** — only the catalog meta + DB anchor row. The 8-module plan below was proposed by me and needs user confirmation.

**Where content goes:** `content/ai-foundations.json` (same schema as content.json). The seed pipeline is now MULTI-COURSE (generalized 2026-06-16) — see [[content-format]]. Do NOT overwrite `content/content.json` — that's the Mastery Hub. The single free sample is `whatai` (not `llm`, which is Mastery's sample).

**LOCKED 8-module plan (user-approved 2026-06-16; block b1, b2 split TBD — currently all authored modules are b1):**
1. `whatai` — What AI Actually Is (LLMs demystified) [SAMPLE/free]
2. `tokens` — Tokens & How Models Read Text
3. `context` — The Context Window (the model's short memory)
4. `prompting` — Talking to the Model: Prompting Basics
5. `chat` — How Chat Works (statelessness, conversation history)
6. `limits` — What Models Get Wrong (hallucination, knowledge cutoff)
7. `tools` — Beyond Text (images, files, internet, tools)
8. `using` — Putting It Together (choosing a model, cost intuition → on-ramp to Mastery Hub)

BLOCKS declared: b1 "Getting Started", b2 "Working With Models". FINAL block assignment (locked 2026-06-16): b1 = whatai, tokens, context, prompting (modules 1–4 "Getting Started"); b2 = chat, limits, tools, using (modules 5–8 "Working With Models").

**SCHEMA NOTE — SCENARIOS have an extra `pts` field:** each scenario also carries `pts:[str]` (key teaching points / rubric bullets), beyond the {id,block,title,sit,task,model} in [[content-format]]. Mirror it for every new scenario.

**Status (update as authored):**
- ALL 8 MODULES AUTHORED & VALIDATED 2026-06-16. Full Mastery shape each (mod + PLAIN + GLOSSARY + DEEP + DEPTH{mech,trade,scale,sec,interview} + PATTERNS{intro,code,notes,debug} + QUIZ×5 + CARDS + SCENARIO+pts + preface script).
  - Modules 1-3 `whatai`,`tokens`,`context`: done earlier (whatai retro-fixed for unguarded subkeys).
  - Modules 4-8 `prompting`,`chat`,`limits`,`tools`,`using`: AUTHORED this session, beginner altitude, all unguarded DEPTH.scale/sec/interview + PATTERNS.notes/debug present (re-validated all 8). `using` is the on-ramp to Engineering Mastery (links to it in DEEP.res + final quiz).
- Validation: structural check across all 8 passes — 8 modules, GLOSSARY 26 terms, CARDS 31, SCENARIOS s1–s8, QUIZ 40 questions (5×8). Prefaces: 8 modules × 5 segments, imports clean.
- Seed-pipeline multi-course generalization: DONE 2026-06-16 (see [[content-format]]).
- Preface VIDEOS: scripts written for ALL 8 modules in prefaces-ai-foundations.mjs; render/upload is separate media production (videos registry still empty until rendered — see [[narration-format]]).
- NOT YET COMMITTED as of end of 2026-06-16 session (content files untracked on feat/multi-course-catalog; do not merge).
- Concurrent-agent note: another agent edits app-next UI section labels (interview→"Explain it to a friend", scale→"Speed & cost notes", sec→"Privacy & safety notes", ask→"Questions to ask yourself"). Content authored to fit those beginner labels.
