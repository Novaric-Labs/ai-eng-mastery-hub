// Seed public.content directly via the Supabase API (service role), instead of
// pasting the 560 KB supabase/seed.sql into the SQL editor (which chokes on large
// statements). Same row split as content/seed.mjs. Safe to re-run (upsert on id).
//
// Run from app-next/:  node --env-file=.env.local scripts/seed-db.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
//
// Uses the PostgREST REST endpoint via fetch (not supabase-js, which initializes
// a realtime WebSocket client that Node < 22 can't construct).
import fs from "fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || /placeholder/i.test(`${url}${key}`)) {
  console.error("✗ Set real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app-next/.env.local first.");
  process.exit(1);
}

const d = JSON.parse(fs.readFileSync(new URL("../../content/content.json", import.meta.url)));
const SAMPLE = "llm"; // the one module offered free as a sample

const rows = [];
const add = (id, tier, data) => rows.push({ id, tier, data });

add("meta:blocks", "public", d.BLOCKS);
add("meta:catalog", "public", d.MODULES.map((m) => ({
  id: m.id, block: m.block, title: m.title, tag: m.tag, why: m.why,
  isNew: !!m.isNew, isUpd: !!m.isUpd, estMin: m.estMin,
})));
add("glossary", "public", d.GLOSSARY);
add("plain", "public", d.PLAIN);

for (const m of d.MODULES) {
  const tier = m.id === SAMPLE ? "public" : "paid";
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

// Write the upsert payload to a file. Node's fetch (undici) can't reliably
// establish the connection in some local environments, so the actual POST is
// done with curl by scripts/seed-db.sh.
const out = new URL("./seed-payload.json", import.meta.url);
fs.writeFileSync(out, JSON.stringify(rows));
const pub = rows.filter((r) => r.tier === "public").length;
console.log(`Wrote ${rows.length}-row payload (${pub} public, ${rows.length - pub} paid) to scripts/seed-payload.json`);
