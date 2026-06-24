// Seed public.content directly via the Supabase API (service role), instead of
// pasting the large supabase/seed.sql into the SQL editor (which chokes on large
// statements). Same row split as content/seed.mjs. Safe to re-run (upsert on
// course_id,id).
//
// Run from app-next/:  node --env-file=.env.local scripts/seed-db.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
//
// Multi-course: builds the payload for BOTH courses (ai-eng + ai-foundations),
// each row tagged with its course_id. The actual POST is done by scripts/seed-db.sh
// (Node's fetch/undici can't reliably establish the connection in some local envs).
import fs from "fs";
import { execSync } from "child_process";
import { VIDEOS as AI_ENG_VIDEOS } from "../../content/videos.mjs";
import { VIDEOS as AI_FOUNDATIONS_VIDEOS } from "../../content/videos-ai-foundations.mjs";

// Guardrail: refuse to build/seed if any quiz is unbalanced (correct option a
// length outlier or always the longest). Mirrors content/seed.mjs so the prod
// seed path (seed-db.sh -> seed-db.mjs -> curl) is gated too, not just the
// supabase/seed.sql generator.
try {
  const validator = new URL("../../content/validate-quizzes.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  execSync(`node "${validator}"`, { stdio: "inherit" });
} catch {
  console.error("\nseed aborted: quiz validation failed (see flags above). Run `node content/validate-quizzes.mjs`.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || /placeholder/i.test(`${url}${key}`)) {
  console.error("✗ Set real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app-next/.env.local first.");
  process.exit(1);
}

const read = (file) => JSON.parse(fs.readFileSync(new URL("../../content/" + file, import.meta.url)));

// One descriptor per course (mirrors content/seed.mjs). `sample` = the single
// module offered free; every other module is paid.
const ALL_COURSES = [
  { course: "ai-eng", json: "content.json", sample: "llm", videos: AI_ENG_VIDEOS },
  { course: "ai-foundations", json: "ai-foundations.json", sample: "whatai", videos: AI_FOUNDATIONS_VIDEOS },
];

// Optional: SEED_COURSE=<slug> limits the payload to a single course, so you can
// upsert just one course's rows without touching the others. Unset = both.
const only = process.env.SEED_COURSE;
const COURSES = only ? ALL_COURSES.filter((c) => c.course === only) : ALL_COURSES;
if (only && COURSES.length === 0) {
  console.error(`✗ SEED_COURSE='${only}' matched no course (known: ${ALL_COURSES.map((c) => c.course).join(", ")}).`);
  process.exit(1);
}

function buildRows({ course, json, sample, videos }) {
  const d = read(json);
  const rows = [];
  const add = (id, tier, data) => rows.push({ course_id: course, id, tier, data });

  add("meta:blocks", "public", d.BLOCKS);
  add("meta:catalog", "public", d.MODULES.map((m) => ({
    id: m.id, block: m.block, title: m.title, tag: m.tag, why: m.why,
    isNew: !!m.isNew, isUpd: !!m.isUpd, estMin: m.estMin,
  })));
  add("glossary", "public", d.GLOSSARY);
  add("plain", "public", d.PLAIN);
  add("videos", "public", videos); // sparse preface-video registry (free teasers)

  for (const m of d.MODULES) {
    const tier = m.id === sample ? "public" : "paid";
    add("module:" + m.id, tier, {
      mod: m,
      deep: d.DEEP[m.id] || null,
      depth: d.DEPTH[m.id] || null,
      patterns: d.PATTERNS[m.id] || null,
    });
    add("quiz:" + m.id, tier, d.QUIZ[m.id] || []);
  }

  add("cards", "paid", d.CARDS);
  add("scenarios", "paid", d.SCENARIOS);
  return rows;
}

const rows = COURSES.flatMap(buildRows);

// Write the upsert payload to a file. Node's fetch (undici) can't reliably
// establish the connection in some local environments, so the actual POST is
// done with curl by scripts/seed-db.sh.
const out = new URL("./seed-payload.json", import.meta.url);
fs.writeFileSync(out, JSON.stringify(rows));
const pub = rows.filter((r) => r.tier === "public").length;
const byCourse = COURSES.map((c) => `${c.course}:${rows.filter((r) => r.course_id === c.course).length}`).join(", ");
console.log(`Wrote ${rows.length}-row payload (${pub} public, ${rows.length - pub} paid) to scripts/seed-payload.json [${byCourse}]`);
