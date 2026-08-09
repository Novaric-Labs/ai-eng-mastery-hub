// Shared seed-row assembly for the two seed paths:
//   content/seed.mjs           -> supabase/seed.sql (SQL editor path)
//   app-next/scripts/seed-db.mjs -> scripts/seed-payload.json (API path)
// One source for the public/paid split, so a tier/row change can never ship a
// different split via one seed path than the other.
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'node:url';
import { VIDEOS as AI_ENG_VIDEOS } from './videos.mjs';
import { VIDEOS as AI_FOUNDATIONS_VIDEOS } from './videos-ai-foundations.mjs';
import { COURSES as COURSE_MANIFEST } from './courses.mjs';

// Guardrails: refuse to seed if any quiz is unbalanced ("guess the answer by
// its length") or any code pattern is broken (doesn't compile / contains
// stripped-escape corruption). Keeps those regressions from ever reaching the
// DB via either seed path.
export function runValidators() {
  for (const check of ['validate-quizzes.mjs', 'validate-patterns.mjs']) {
    try {
      const validator = fileURLToPath(new URL('./' + check, import.meta.url));
      execSync(`node "${validator}"`, { stdio: 'inherit' });
    } catch {
      console.error(`\nseed aborted: ${check} failed (see flags above). Run \`node content/${check}\`.`);
      process.exit(1);
    }
  }
}

const read = (file) => JSON.parse(fs.readFileSync(new URL('./' + file, import.meta.url)));

// Course registry lives in courses.mjs (shared with the validators, so a new
// course is validated the moment it is seedable). Attach each course's
// preface-video registry here.
const VIDEO_REGISTRY = { 'ai-eng': AI_ENG_VIDEOS, 'ai-foundations': AI_FOUNDATIONS_VIDEOS };
export function loadCourses() {
  return COURSE_MANIFEST.map((c) => {
    const videos = VIDEO_REGISTRY[c.course];
    if (!videos) {
      console.error(`✗ no video registry for course '${c.course}' — add it to VIDEO_REGISTRY in build-rows.mjs`);
      process.exit(1);
    }
    return { ...c, videos };
  });
}

// Build the flat (public/paid) row set for one course, same split the app's
// client-side reassembly relies on (row-id prefixes: meta:, module:, quiz:, ...).
// Rows carry no course_id — seed.mjs interpolates the course into the SQL
// itself, and seed-db.mjs maps course_id onto each row.
export function buildRows({ json, sample, videos }) {
  const d = read(json);
  const rows = [];
  const add = (id, tier, data) => rows.push({ id, tier, data });

  // ---- PUBLIC: browsable catalog + marketing copy + one full sample module ----
  add('meta:blocks', 'public', d.BLOCKS);
  add('meta:catalog', 'public', d.MODULES.map(m => ({
    id: m.id, block: m.block, title: m.title, tag: m.tag, why: m.why,
    isNew: !!m.isNew, isUpd: !!m.isUpd, estMin: m.estMin
  })));
  add('glossary', 'public', d.GLOSSARY);
  add('plain', 'public', d.PLAIN);
  add('videos', 'public', videos); // sparse preface-video registry (free teasers)

  // ---- per-module bundles (sample module is public, the rest are paid) ----
  for (const m of d.MODULES) {
    const tier = m.id === sample ? 'public' : 'paid';
    add('module:' + m.id, tier, {
      mod: m,
      deep: d.DEEP[m.id] || null,
      depth: d.DEPTH[m.id] || null,
      patterns: d.PATTERNS[m.id] || null
    });
    add('quiz:' + m.id, tier, d.QUIZ[m.id] || []);
  }

  // ---- shared paid collections ----
  add('cards', 'paid', d.CARDS);
  add('scenarios', 'paid', d.SCENARIOS);

  return rows;
}
