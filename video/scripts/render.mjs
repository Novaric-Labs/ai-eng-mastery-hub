// Render step: TTS -> bundle the Remotion project -> render MP4 + poster.
// Captions (.vtt) are produced by the TTS step. Outputs land in out/<id>/.
//
//   node --env-file=.env scripts/render.mjs rag      # full render (needs ELEVENLABS_API_KEY)
//   node scripts/render.mjs --smoke                  # silent validation render (no key needed)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill, ensureBrowser } from "@remotion/renderer";
import { synth } from "./tts.mjs";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const args = process.argv.slice(2);
const smoke = args.includes("--smoke");
const id = args.find((a) => !a.startsWith("--")) || "rag";

// Mirror Root.tsx's estimator for the no-audio smoke render.
async function estimateProps(videoId) {
  const mod = await import(`../data/${videoId}.mjs`);
  const data = mod.default ?? mod[videoId];
  const WPS = 2.6;
  let cursor = 0;
  const segments = data.segments.map((s) => {
    const words = s.say.trim().split(/\s+/).length;
    const start = cursor;
    cursor += Math.max(2, words / WPS);
    return { kicker: s.slide.kicker, lines: s.slide.lines, start, end: cursor };
  });
  return { title: data.title, segments, durationInSeconds: cursor, audioSrc: null };
}

async function main() {
  const inputProps = smoke ? await estimateProps(id) : await synth(id);

  console.log("· Ensuring headless browser…");
  await ensureBrowser();

  console.log("· Bundling Remotion project…");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    publicDir: path.join(ROOT, "public"),
  });

  const composition = await selectComposition({ serveUrl, id: "PrefaceVideo", inputProps });
  console.log(`· Composition: ${composition.durationInFrames} frames @ ${composition.fps}fps`);

  const outDir = path.join(ROOT, "out", smoke ? "_smoke" : id);
  fs.mkdirSync(outDir, { recursive: true });
  const videoOut = path.join(outDir, smoke ? "smoke.mp4" : "preface.mp4");

  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: videoOut,
    inputProps,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct !== lastPct && pct % 10 === 0) {
        lastPct = pct;
        console.log(`· Rendering ${pct}%`);
      }
    },
  });

  if (!smoke) {
    // Poster: a frame on the final reveal slide.
    const last = inputProps.segments[inputProps.segments.length - 1];
    const frame = Math.min(
      composition.durationInFrames - 1,
      Math.round((last.start + 0.6) * composition.fps),
    );
    await renderStill({
      composition,
      serveUrl,
      output: path.join(outDir, "preface.jpg"),
      frame,
      inputProps,
      imageFormat: "jpeg",
      jpegQuality: 90,
    });
    console.log(`✓ Poster: out/${id}/preface.jpg (frame ${frame})`);
  }

  console.log(`✓ Video: ${path.relative(ROOT, videoOut)}`);
  if (!smoke) console.log(`\nNext: node --env-file=../app-next/.env.local scripts/upload.mjs ${id}`);
}

main().catch((e) => {
  console.error("\n✗", e.message);
  process.exit(1);
});
