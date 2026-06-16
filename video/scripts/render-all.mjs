// Batch render: TTS + MP4 + poster for many modules. Bundles the Remotion
// project ONCE (after all narration is generated) and renders each module
// against it. Captions (.vtt) come from the TTS step.
//
//   node --env-file=.env scripts/render-all.mjs                 # all modules in prefaces.mjs
//   node --env-file=.env scripts/render-all.mjs context embed   # just these
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill, ensureBrowser } from "@remotion/renderer";
import { synth } from "./tts.mjs";
import { PREFACES } from "../data/prefaces.mjs";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const targets = ids.length ? ids : Object.keys(PREFACES);

const bad = targets.filter((id) => !PREFACES[id]);
if (bad.length) {
  console.error(`✗ Unknown module id(s): ${bad.join(", ")}`);
  process.exit(1);
}

async function main() {
  console.log(`· Rendering ${targets.length} module(s): ${targets.join(", ")}`);

  // 1. TTS for every target first, so all narration is on disk before bundling.
  const jobs = [];
  for (const id of targets) {
    console.log(`\n— TTS ${id} —`);
    jobs.push({ id, props: await synth(id) });
  }

  // 2. Bundle once (captures every public/<id>/narration.mp3).
  console.log("\n· Ensuring headless browser…");
  await ensureBrowser();
  console.log("· Bundling once…");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    publicDir: path.join(ROOT, "public"),
  });

  // 3. Render each module against the shared bundle.
  for (const { id, props } of jobs) {
    const composition = await selectComposition({ serveUrl, id: "PrefaceVideo", inputProps: props });
    const outDir = path.join(ROOT, "out", id);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: path.join(outDir, "preface.mp4"),
      inputProps: props,
    });
    const last = props.segments[props.segments.length - 1];
    const frame = Math.min(
      composition.durationInFrames - 1,
      Math.round((last.start + 0.6) * composition.fps),
    );
    await renderStill({
      composition,
      serveUrl,
      output: path.join(outDir, "preface.jpg"),
      frame,
      inputProps: props,
      imageFormat: "jpeg",
      jpegQuality: 90,
    });
    console.log(`✓ ${id}: ${props.durationInSeconds.toFixed(0)}s  → out/${id}/preface.{mp4,jpg,en.vtt}`);
  }

  console.log(`\nDone (${jobs.length}). Next: upload each, then regenerate videos + reseed.`);
}

main().catch((e) => {
  console.error("\n✗", e.message);
  process.exit(1);
});
