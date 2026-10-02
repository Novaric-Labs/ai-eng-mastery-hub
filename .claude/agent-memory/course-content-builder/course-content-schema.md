---
name: course-content-schema
description: Exact JSON schema + authoring conventions for Novacademy course content files in content/*.json
metadata:
  type: project
---

Novacademy courses are authored as a single `content/<course-id>.json` file. A seed step maps its top-level keys into `content` table rows (e.g. `meta:blocks`, `meta:catalog`, `module:<id>`, `quiz:<id>`, `glossary`, `plain`, `cards`, `scenarios`, `videos`). The runtime types live in `app-next/lib/course.ts` (`buildCourse`).

**Why:** This is the canonical structural template; new courses must match `content/ai-foundations.json` exactly or they won't reassemble at runtime.

**How to apply:** Required top-level keys: BLOCKS, MODULES, PLAIN, GLOSSARY, DEEP, DEPTH, PATTERNS, QUIZ, CARDS, SCENARIOS.
- BLOCKS: `[{id,name}]` (block names use " · " separator).
- MODULES: `[{id,block,title,tag,why,mental,concepts:[[term,def]],mistakes:[],flags:[],ask:[],estMin}]`. Optional `isNew`/`isUpd`.
- PLAIN: `{moduleId: string}` plain-English intro per module.
- GLOSSARY: `[[term, def, moduleId]]` 3-tuples.
- DEEP[id]: `{worked, good:[], build, res:[[label,url,note]]}`.
- DEPTH[id]: `{mech, trade:[[a,b,c]], scale:[], sec:[], interview}`. The `trade` 3-col table renders with a per-course heading (default "How the options compare").
- PATTERNS[id]: `{intro, code, notes:[], debug:[[symptom,cause,fix]]}` — the Code/Patterns tab. **Set `"PATTERNS": {}` (empty object) to hide that tab entirely** (used for non-coder courses).
- QUIZ[id]: array of `{q, o:[options], a:correctIndex(number), exp}`. ai-foundations uses exactly 5 per module.
- CARDS: `[{m:moduleId, f:front, b:back}]` flashcards.
- SCENARIOS: `[{id,block,title,sit,task,model,pts:[]}]`. `model` = model answer, `pts` = judging points.

Rich text fields are trusted inline-HTML fragment strings: `<b>`, `<br><br>`, `<code>`, `<a href>`. Lists are arrays of strings; tables are arrays of fixed-length tuples.

Validate after authoring: `node -e` parse + check every module id has MODULE/PLAIN/DEEP/DEPTH/QUIZ entries, quiz `a` indices in range, blocks valid, card/glossary moduleId refs valid.

Related: [[using-claude-course]]

**Render rules learned in the Oct 2026 review (binding for every course):**
- Plain-text fields (rendered literally, no tags/entities): module `title`, `tag`, concept terms, `trade[i][0]`, `debug[i][0]`, `res[i][0]` label, glossary term, scenario `title`, and the **first 140 chars of `sit`** (Scenarios list preview). Everything else is HTML (`<b> <br> <code> <em> <a href="https://…">`); escape literal angle-bracket tokens as `&lt;…&gt;` or the browser swallows them. `PATTERNS.code` shows verbatim in a `<pre>`.
- `res` notes are rendered as written (the UI's old hard-coded "Use when:" label was removed) — write each note as a self-contained "when to reach for it" line; url `"#"` renders a non-link label (never leave it empty).
- Quiz options are shuffled and re-lettered A–D at runtime, so `exp` and options must NEVER refer to an option by letter — `content/validate-quizzes.mjs` rejects it (alongside the length-outlier and correct-is-longest skew rules). Answer position doesn't matter; answer length does.
- `isNew`/`isUpd` are seeded but no app component renders them (harmless to leave both).
- Adding modules changes copy outside the content file: `app-next/lib/courses.ts` (moduleCount, blurb, estHours), `app-next/lib/learn-labels.ts` (tour counts, start-page block paths, per-course lists), the tutor scope in `app-next/app/api/tutor/route.ts` (it declines off-scope topics), and preface scripts in `video/data/prefaces*.mjs`.
