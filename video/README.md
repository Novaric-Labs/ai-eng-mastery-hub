# Novacademy video pipeline

Renders module **preface videos** (narrated motion explainers) with [Remotion](https://remotion.dev),
then uploads them to the private `course-video` Supabase bucket the app reads from.

Pipeline: **TTS (ElevenLabs) → audio-aligned slide timing + captions → MP4 + poster → upload.**

Kept as a separate package so Remotion's heavy render deps (a headless Chromium)
never touch the Next app's build.

## One-time setup

```bash
cd video
npm install
cp .env.example .env      # fill in ELEVENLABS_API_KEY
```

Quick check Remotion works on this machine (no key needed — renders silent slides):

```bash
npm run smoke             # writes out/_smoke/smoke.mp4
npm run studio            # live-edit the composition in the browser
```

## Produce a video (e.g. RAG)

The script + slides live in `data/<id>.mjs` (one file per video). To make the RAG one:

```bash
# 1. render: TTS + MP4 + poster + captions  (needs ELEVENLABS_API_KEY)
node --env-file=.env scripts/render.mjs rag

# 2. upload to the course-video bucket (reuses Supabase service role)
node --env-file=../app-next/.env.local scripts/upload.mjs rag

# 3. set the real duration in ../content/videos.mjs, then re-seed the videos row
cd ../app-next && node --env-file=.env.local scripts/seed-db.mjs
```

The player (owner-only until launch) then plays it on the RAG module. To launch to
everyone, drop the `admin &&` guard in `app-next/components/learn/ModuleView.tsx`.

## Add another module

1. Copy `data/rag.mjs` to `data/<id>.mjs`, rewrite the segments (keep it a *preface*).
2. Add a `<id>` entry to `../content/videos.mjs`.
3. `render.mjs <id>` → `upload.mjs <id>` → re-seed.

## Notes
- **Voice:** defaults to ElevenLabs "Rachel". Override per-run with `ELEVENLABS_VOICE_ID`,
  or per-video via `voiceId` in the data file.
- **Remotion licensing:** free for individuals and small companies; a company license is
  required past a size threshold — see https://remotion.dev/license. (Novacademy is well
  under it today, but worth knowing.)
- **Captions** are generated from the real audio alignment, so they stay in sync.
