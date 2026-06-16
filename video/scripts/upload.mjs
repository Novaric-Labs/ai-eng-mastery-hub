// Upload step: push a rendered video's files to the private `course-video`
// Storage bucket at the paths the app expects (see content/videos.mjs):
//   out/<id>/preface.mp4     -> course-video/<id>/preface.mp4
//   out/<id>/preface.jpg     -> course-video/<id>/preface.jpg
//   out/<id>/preface.en.vtt  -> course-video/<id>/preface.en.vtt
//
// Ensures the bucket exists first. Uses the Storage REST API with the service
// role (raw fetch — avoids supabase-js' realtime WebSocket, which can't init on
// Node < 22; see app-next/scripts/seed-db.mjs for the same approach).
//
//   node --env-file=../app-next/.env.local scripts/upload.mjs rag
//   ai-foundations:  node --env-file=../app-next/.env.local scripts/upload.mjs --course=ai-foundations whatai
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { courseFromArgs } from "./courses.mjs";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const BUCKET = "course-video";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || /placeholder/i.test(`${url}${key}`)) {
  console.error("✗ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. --env-file=../app-next/.env.local).");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

// Retry transport-level failures (intermittent connect timeouts to Supabase).
async function fetchRetry(u, opts, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(u, opts);
    } catch (e) {
      last = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw last;
}

const MIME = { ".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".vtt": "text/vtt" };

async function ensureBucket() {
  const res = await fetchRetry(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  });
  if (res.ok) {
    console.log(`· Created private bucket "${BUCKET}".`);
    return;
  }
  const body = await res.text().catch(() => "");
  if (res.status === 409 || /already exists|Duplicate/i.test(body)) {
    console.log(`· Bucket "${BUCKET}" already exists.`);
    return;
  }
  throw new Error(`Create bucket failed (${res.status}): ${body.slice(0, 200)}`);
}

async function uploadFile(localPath, objectPath) {
  const data = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const res = await fetchRetry(`${url}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { ...headers, "content-type": MIME[ext] ?? "application/octet-stream", "x-upsert": "true" },
    body: data,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload ${objectPath} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  console.log(`✓ ${objectPath}  (${(data.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const course = courseFromArgs();
  const id = process.argv.slice(2).find((a) => !a.startsWith("--")) || "rag";
  const dir = course.dir(id); // <id> for Mastery, af-<id> for Foundations
  const outDir = path.join(ROOT, "out", dir);
  const files = [
    ["preface.mp4", `${dir}/preface.mp4`],
    ["preface.jpg", `${dir}/preface.jpg`],
    ["preface.en.vtt", `${dir}/preface.en.vtt`],
  ].filter(([local]) => fs.existsSync(path.join(outDir, local)));

  if (!files.length) {
    console.error(`✗ Nothing to upload — run the render first (out/${dir}/preface.mp4 missing).`);
    process.exit(1);
  }

  await ensureBucket();
  for (const [local, obj] of files) await uploadFile(path.join(outDir, local), obj);

  console.log(`\nDone. Regenerate the videos registries, then re-seed the '${course.slug}' videos row:`);
  console.log(`  node scripts/gen-videos.mjs`);
  console.log(`  cd ../app-next && SEED_COURSE=${course.slug} bash scripts/seed-db.sh`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
