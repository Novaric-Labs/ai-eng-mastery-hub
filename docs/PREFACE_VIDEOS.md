# Preface videos

Short (~60–90s) videos at the top of a module that **preface** the topic — set up the
problem and why it matters — rather than restating the reading. Sparse by design:
only modules where a visual/narrative preface genuinely helps get one.

## How it's wired (already built)

- **Registry:** `content/videos.mjs` — a sparse `{ moduleId: VideoMeta }` map. Seeded as
  the `videos` content row (tier `public`) by both seed paths.
- **Type:** `VideoMeta` in `app-next/lib/course.ts` (`src`, `poster`, `vtt`, `duration`,
  `title`, `caption`, `tier`). Exposed as `course.videos`.
- **Player:** `app-next/components/learn/VideoPreface.tsx` — click-to-play, fetches a signed
  URL on demand, captions support, respects reduced motion. Mounted at the top of the Learn
  tab and on the locked-module preview in `ModuleView.tsx`.
- **Delivery:** `app-next/app/api/video/[id]/route.ts` — resolves the path from the trusted
  `videos` row, enforces access (`public` = free teaser, `paid` = entitled-only), returns a
  short-lived signed URL from the private `course-video` Storage bucket.
- **Storage:** `supabase/migrations/0002_video_bucket.sql` — private bucket `course-video`.

### Feature flag (live-but-hidden)
The player only renders for the **owner/admin** (`admin &&` guard in `ModuleView.tsx`). To
launch to everyone, delete that guard — the API access model already does the right thing
(public teasers stay open, paid videos stay gated).

## Producing a video

1. **Script** — keep it a *preface*: hook → the problem → why it matters → "now go learn how."
   ~140–170 words ≈ 75–90s. (RAG draft below.)
2. **Voiceover** — TTS (e.g. ElevenLabs). Export a WAV/MP3.
3. **Visuals** — narrated motion explainer: a few branded slides / a diagram that builds as
   the narration goes. Render to **MP4 (H.264, 1080p, 16:9)**. Good fit for our stack:
   [Remotion](https://www.remotion.dev/) (React → MP4) so slides reuse the brand tokens; or
   any slide tool + screen capture for the first one.
4. **Captions** *(optional)* — a `.vtt` next to the MP4 for accessibility.
5. **Poster** *(optional)* — a 1280×720 JPG from the title frame.

## Deploying a video

```bash
# 1. Create the private bucket (once)
supabase db push   # applies 0002_video_bucket.sql
# (or run the SQL in supabase/migrations/0002_video_bucket.sql in the SQL editor)

# 2. Upload the files to the bucket at the paths in content/videos.mjs
#    e.g. rag/preface.mp4, rag/preface.jpg, rag/preface.en.vtt
#    via Supabase dashboard → Storage → course-video, or the CLI.

# 3. Set the real duration in content/videos.mjs, then re-seed the videos row
cd app-next && node --env-file=.env.local scripts/seed-db.mjs
#    then POST scripts/seed-payload.json (see scripts/seed-db.sh)
```

The player appears for the owner immediately (signed URL on play). To add more modules,
add entries to `content/videos.mjs` and repeat.

## Upgrade path (later)
For scale/quality, swap Supabase Storage for **Cloudflare Stream / Mux**: keep `VideoMeta`,
change only how `/api/video/[id]` resolves `src` → a signed playback URL. Nothing else moves.

---

## Draft script — RAG (`rag`)

> Here's a question that quietly breaks most people's mental model of AI: if a language
> model already "knows" so much, why does it confidently make things up about *your* company's
> data?
>
> The answer is simple — it was never trained on your data. It's frozen in time, working only
> from what's in front of it right now.
>
> So the obvious fix is to just paste everything into the prompt — your whole knowledge base,
> every document. And that falls apart: it's slow, it's expensive, and the model gets lost in
> the noise.
>
> This module is about the technique that resolves that tension. Instead of handing the model
> everything, you hand it the *right few things*, at the *right moment* — just in time.
>
> That's retrieval-augmented generation. Before you learn how it works, sit with the problem
> it exists to solve. Once that clicks, every design decision ahead of you starts to make sense.

(~165 words. Title: "Why retrieval beats a bigger prompt." Tone: staff engineer, plain,
curiosity-first — no mechanics, that's what the reading is for.)
