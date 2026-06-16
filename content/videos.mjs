// Preface-video registry. SPARSE on purpose — only modules where a short visual
// preface genuinely helps (abstract/architectural topics), not every module.
//
// Each value is a VideoMeta (see app-next/lib/course.ts). `src`/`poster`/`vtt`
// are object paths inside the PRIVATE `course-video` Storage bucket; the
// /api/video/[id] route resolves them to short-lived signed URLs at play time.
// `tier: "public"` makes the clip a free TEASER (shown even on locked modules as
// a conversion hook); `tier: "paid"` would require an entitlement to play.
//
// Seeded as the single `videos` content row by both seed paths
// (content/seed.mjs and app-next/scripts/seed-db.mjs).
export const VIDEOS = {
  // Thin first slice: RAG only. Add more (embed, agents, context, vecdb, …) once
  // the format is proven. Upload the rendered files to the bucket at these paths.
  rag: {
    src: "rag/preface.mp4",
    poster: "rag/preface.jpg",
    vtt: "rag/preface.en.vtt",
    duration: 78, // seconds — update to the real runtime after rendering
    tier: "public",
    title: "Why retrieval beats a bigger prompt",
    caption: "A short preface — the problem RAG actually solves, before we get into how it works.",
  },
};
