---
name: course-aware-labels
description: How learn-shell UI copy is branched per course slug (ModuleView + shared learn-labels module)
metadata:
  type: project
---

The same `app-next/components/learn/*` renders every course; copy was originally hard-coded for the engineer/staff audience of the Mastery Hub (`ai-eng`) and reads wrong for the beginner `ai-foundations` course.

**Slug source:** the active course slug is on the Zustand store as `courseSlug` (set in `lib/store.ts`, threaded from `app/learn/[course]/page.tsx` → `LearnApp` → StoreProvider). Read it in any component via `useCourseStore((s) => ({ ..., courseSlug: s.courseSlug }))`. Course display meta lives in `lib/courses.ts` (`courseBySlug`). Slugs: `ai-eng` (Mastery, live, 21 modules / 5 blocks) and `ai-foundations` (beginner, coming_soon, 8 modules / 2 blocks — block ids b1 "Getting Started", b2 "Working With Models"; content authored in `content/ai-foundations.json`).

**Two label homes:**
- `ModuleView.tsx` keeps its OWN inline `SectionLabels` / `labelsFor(slug)` block (section titles like "Architectural tradeoffs" → "Trade-offs to weigh"). Do NOT fold this into the shared module — keep ai-eng output byte-identical.
- `app-next/lib/learn-labels.ts` is the SHARED module for the rest of the learn shell: `learnLabelsFor(slug)` returns a `LearnLabels` object, `DEFAULT_LABELS` = byte-for-byte ai-eng copy, `LABELS_BY_COURSE["ai-foundations"]` overrides. Consumed by Dashboard, Scenarios, StartHere, TutorBot, and Tour. Tour builds its `TOURS` map via a `buildTours(L)` factory called inside the effect (TOURS was a module const; now slug-parameterized, `courseSlug` added to effect deps).

**How to apply:** build a `Record<slug, Labels>` + `DEFAULT` and resolve `MAP[slug] ?? DEFAULT`. Default-to-Mastery keeps `ai-eng` identical and makes unknown/future slugs safe. Branch ONLY human-readable strings — never field-render or guarding logic.

**Byte-identical gotchas (verified):** `&amp;`/literal `&` and `&apos;`/`'` render the same DOM text, so moving JSX text into a string constant rendered via `<Html>` is safe. Use STRAIGHT quotes in label strings (the originals used `&apos;`, not curly `' '`). `<Html as="span">` wraps content in an inert `<span>` (visually identical, matches existing ModuleView usage) — acceptable since the bar is "visually identical", not DOM-identical. Multi-line JSX text collapses whitespace to single spaces; mirror that as one-line strings.

**Beginner voice:** warm, plain-English, no jargon. Established reframes: "module"→"lesson", "Mastery exam"→"Block review", "production judgment / senior-level skill"→ practical "make the call in a realistic situation", "21 modules, 5 blocks"→"8 lessons, 2 blocks". Mirror the ModuleView beginner mappings ("Explain it to a friend", "Questions to ask yourself", "Speed & cost notes", "Privacy & safety notes").

**Why:** launching `ai-foundations` (beginner) alongside `ai-eng` (engineer) on shared rendering code; the two audiences need different framings for the same UI.
