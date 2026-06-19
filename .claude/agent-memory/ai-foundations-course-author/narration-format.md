---
name: narration-format
description: "Preface-video narration script format (prefaces.mjs) and the clean-narration voice rules"
metadata:
  type: project
---

Narration = per-module PREFACE videos. Source of truth: `video/data/prefaces.mjs` (scripts/slides) → `video/scripts/gen-videos.mjs` generates `content/videos.mjs` (the in-app registry, seeded as public `videos` row). Engineering Mastery has one preface per module (21).

**Shape:** `PREFACES = {moduleId: {title, caption, segments:[{say, slide:{kicker, lines:[...]}}]}}`.
- `title` — short hook title (also in videos.mjs meta)
- `caption` — "A short preface — ..." one-liner
- `segments` — typically 5. Each `say` is a narration sentence/2 (concatenated, space-joined, sent to TTS). Each `slide` shows while it plays: `kicker` (short label) + `lines` (1-2 short lines). Use single `*asterisks*` in slide lines for teal emphasis.

**Design rule (from the file header):** a PREFACE, not a summary. Arc = Hook → the tension/why → the core idea (reuse the module's own mental model) → "now go read." Grounded in the lesson (accurate, consistent) but sets the reader up rather than restating content. Last segment names the module + a "go in" nudge.

**Clean-narration voice (project preference):** smooth, studio-clean, natural inflection, written to be read aloud. No unpronounceable symbols — spell things out ("ninety-five percent", "two hundred, OK", "three to five times"), natural spoken phrasing, short sentences, rhetorical questions ok. See user memory audio-style-clean-narration.

**Status:** AI Foundations narration is PENDING — scripts can be written now, but rendering/upload to the storage bucket is a separate media-production step (same pipeline as Engineering Mastery preface videos).
