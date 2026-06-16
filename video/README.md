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

## Where the scripts live

All preface scripts + slides are in **`data/prefaces.mjs`**, keyed by module id
(one registry for the whole course). Edit there to change wording. `title`/`caption`
feed the in-app player; `../content/videos.mjs` is GENERATED from this + rendered
durations (don't hand-edit it).

## Produce videos

```bash
# 1. render one or many  (needs ELEVENLABS_API_KEY). Omit ids for ALL modules.
node --env-file=.env scripts/render-all.mjs rag context embed
#    (single module: scripts/render.mjs <id>)

# 2. upload each to the course-video bucket (reuses Supabase service role)
for id in rag context embed; do
  node --env-file=../app-next/.env.local scripts/upload.mjs $id
done

# 3. regenerate the app's video registry from what's rendered
node scripts/gen-videos.mjs

# 4. re-seed the videos content row
cd ../app-next && node --env-file=.env.local scripts/seed-db.mjs   # or upsert just the videos row
```

The player (owner-only until launch) then plays them. To launch to everyone, drop
the `admin &&` guard in `app-next/components/learn/ModuleView.tsx`.

## Add / change a module

1. Edit its entry in `data/prefaces.mjs` (keep it a *preface*, grounded in the lesson).
2. `render-all.mjs <id>` → `upload.mjs <id>` → `gen-videos.mjs` → re-seed.

## Notes
- **Voice:** defaults to ElevenLabs "Rachel". Override per-run with `ELEVENLABS_VOICE_ID`,
  or per-video via `voiceId` in the data file.
- **Remotion licensing:** free for individuals and small companies; a company license is
  required past a size threshold — see https://remotion.dev/license. (Novacademy is well
  under it today, but worth knowing.)
- **Captions** are generated from the real audio alignment, so they stay in sync.
