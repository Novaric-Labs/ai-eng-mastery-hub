---
name: content-format
description: "The content.json schema the Novacademy platform consumes, plus the seed pipeline that loads it into Supabase"
metadata:
  type: project
---

Course content is ONE JSON file (`content/content.json`) consumed by `content/seed.mjs` → `supabase/seed.sql` → `public.content` table (also `app-next/scripts/seed-db.mjs` for the Next app, same row split). Engineering Mastery course = `content/content.json` (slug `ai-eng`, 21 modules, 537KB).

**Why:** single source of truth; the React app reassembles flat content rows client-side by row-id prefix (see [[ai-foundations-scope]] for the multi-course seeding gap).

**Top-level keys in content.json:**
- `BLOCKS` — `[{id:"b1", name:"Block 1 · Foundations"}]` (module groupings/sections)
- `MODULES` — array; each: `{id, block, title, tag, why, mental, concepts:[[term,def]...], mistakes:[str], flags:[str], ask:[str], estMin}`. `tag` = one-line subtitle. `why` = why-this-matters paragraph. `mental` = the mental-model paragraph (uses `<b>` HTML). `concepts` = term/definition pairs. `mistakes`/`flags`/`ask` = bullet arrays.
- `DEEP` — `{moduleId: {worked, good:[str], build, res:[[title,url,note]...]}}`. `worked` = worked example (HTML `<b>` allowed), `good` = signs of doing it right, `build` = a build-this exercise, `res` = resource links.
- `DEPTH` — `{moduleId: {mech, trade:[[choice,axis,detail]...], scale:[str], sec:[str], interview}}`. `mech` = how-it-works-under-the-hood (HTML, `<br><br>` for paragraphs), `trade` = trade-off triples, `scale` = scale/cost/latency bullets, `sec` = security/governance bullets, `interview` = a "say it out loud" articulation paragraph. **ALL FIVE subkeys are REQUIRED** — `app-next/components/learn/ModuleView.tsx` renders `dp.scale`/`dp.sec`/`dp.interview` UNGUARDED, so omitting any one crashes the module's DEPTH section. Every Mastery module has the full shape. (For Foundations, beginner-reframe: `scale`→practical cost/speed notes, `sec`→safety/privacy notes, `interview`→"explain it to a friend".)
- `PATTERNS` — `{moduleId: {intro, code, notes:[str], debug:[[symptom,cause,check]...]}}`. `code` is a multiline string (escaped `\n`), usually Python. `notes` = "why these lines are load-bearing" bullets, `debug` = symptom/cause/check triples. **ALL FOUR REQUIRED** — `p.notes`/`p.debug` render unguarded; omitting them crashes the Patterns tab. (Foundations uses pseudo-code, not real Python.)
- `QUIZ` — `{moduleId: [{q, o:[4 options], a:correctIndex, exp}]}`. ~5 questions/module.
- `CARDS` — SHARED flat array (not per-module key): `[{m:moduleId, f:front, b:back}]`. Spaced-repetition flashcards.
- `SCENARIOS` — SHARED flat array: `[{id:"s1", block, title, sit, task, model}]`. `model` = model answer.
- `GLOSSARY` — SHARED flat array of triples: `[[term, plain-english-def, moduleId]]`.
- `PLAIN` — `{moduleId: "one plain-English paragraph"}`. The accessible TL;DR per module.

**Style conventions inside content:** HTML `<b>`/`<br>` inline (rendered via dangerouslySetInnerHTML — trusted). Em-dashes and `·` used freely. Dollar/token figures are concrete. Second person ("you'll oversee"). Engineering Mastery is dense/intermediate.

**Seed pipeline (multi-course as of 2026-06-16):** `content/seed.mjs` and `app-next/scripts/seed-db.mjs` now both iterate a `COURSES` array: `{course,json,sample,videos}` — `ai-eng`(content.json, sample `llm`, VIDEOS from videos.mjs) AND `ai-foundations`(ai-foundations.json, sample `whatai`, VIDEOS from videos-ai-foundations.mjs). They emit BOTH courses' rows, each tagged `course_id` (composite PK course_id,id per migration 0003). Row split unchanged: public = meta:blocks, meta:catalog, glossary, plain, videos, sample module(module:+quiz:); paid = other modules + cards + scenarios. The ai-eng inserts are byte-identical to the pre-change single-course output (verified by diff). Re-run: `node content/seed.mjs`. **VIDEOS are course-scoped** — the app reads one `videos` content row per course_id, and module ids collide across courses (`context`,`tools` exist in both), so AI Foundations has its OWN registry `content/videos-ai-foundations.mjs` (gen-videos.mjs now emits both, foundations renders namespaced to `public/af-<id>/`). Foundations videos registry is empty until prefaces are rendered.
