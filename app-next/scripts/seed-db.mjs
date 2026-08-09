// Seed public.content directly via the Supabase API (service role), instead of
// pasting the large supabase/seed.sql into the SQL editor (which chokes on large
// statements). Same row split as content/seed.mjs — both share
// content/build-rows.mjs, so the prod seed path (seed-db.sh -> seed-db.mjs ->
// curl) runs the same validators and emits the same rows. Safe to re-run
// (upsert on course_id,id).
//
// Run from app-next/:  node --env-file=.env.local scripts/seed-db.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
//
// Multi-course: builds the payload for BOTH courses (ai-eng + ai-foundations),
// each row tagged with its course_id. The actual POST is done by scripts/seed-db.sh
// (Node's fetch/undici can't reliably establish the connection in some local envs).
import fs from "fs";
import { runValidators, loadCourses, buildRows } from "../../content/build-rows.mjs";

runValidators();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || /placeholder/i.test(`${url}${key}`)) {
  console.error("✗ Set real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app-next/.env.local first.");
  process.exit(1);
}

const ALL_COURSES = loadCourses();

// Optional: SEED_COURSE=<slug> limits the payload to a single course, so you can
// upsert just one course's rows without touching the others. Unset = both.
const only = process.env.SEED_COURSE;
const COURSES = only ? ALL_COURSES.filter((c) => c.course === only) : ALL_COURSES;
if (only && COURSES.length === 0) {
  console.error(`✗ SEED_COURSE='${only}' matched no course (known: ${ALL_COURSES.map((c) => c.course).join(", ")}).`);
  process.exit(1);
}

// buildRows emits course-agnostic rows; tag each with its course_id here.
const rows = COURSES.flatMap((c) => buildRows(c).map((r) => ({ course_id: c.course, ...r })));

// Write the upsert payload to a file. Node's fetch (undici) can't reliably
// establish the connection in some local environments, so the actual POST is
// done with curl by scripts/seed-db.sh.
const out = new URL("./seed-payload.json", import.meta.url);
fs.writeFileSync(out, JSON.stringify(rows));
const pub = rows.filter((r) => r.tier === "public").length;
const byCourse = COURSES.map((c) => `${c.course}:${rows.filter((r) => r.course_id === c.course).length}`).join(", ");
console.log(`Wrote ${rows.length}-row payload (${pub} public, ${rows.length - pub} paid) to scripts/seed-payload.json [${byCourse}]`);
