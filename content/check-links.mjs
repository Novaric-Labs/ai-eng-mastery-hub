// Link-health sweep for both course JSONs. Maintenance tool, not a CI gate
// (network checks are flaky by nature) — run it as part of the quarterly
// content refresh ritual:  node content/check-links.mjs
//
// Extracts every URL with its JSON path, then HTTP-checks each once:
//   DEAD        0 / 4xx / 5xx after both HEAD and GET
//   REDIRECTED  2xx/3xx whose final URL differs meaningfully — decide per
//               link: chase renamed/moved targets to the final URL, but KEEP
//               durable roots (e.g. modelcontextprotocol.io, docs.ragas.io)
//               that intentionally redirect to versioned landings.
//   BLOCKED     403/405 on both methods — usually bot-blocking (openai.com
//               properties do this); verify in a real browser before touching.
//
// Code fields are skipped: PATTERNS code and lab starter/step code contain
// deliberate fictional endpoints (docs.internal, qdrant:6333) that are part
// of the teaching material, not references.
import { readFileSync, writeFileSync } from 'fs';
import { COURSES } from './courses.mjs';

const found = [];
function walk(node, path, course) {
  const key = path[path.length - 1];
  const inCode =
    (path[0] === 'PATTERNS' && key === 'code') ||
    (path.includes('lab') && (key === 'code' || key === 'starter'));
  if (typeof node === 'string') {
    if (inCode) return;
    for (const m of node.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
      found.push({ course, path: path.join('.'), url: m[0].replace(/[.,;:]+$/, '') });
    }
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, [...path, i], course));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, [...path, k], course);
  }
}
for (const { course, json } of COURSES) {
  walk(JSON.parse(readFileSync(new URL('./' + json, import.meta.url), 'utf8')), [], course);
}

const byUrl = new Map();
for (const f of found) {
  if (!byUrl.has(f.url)) byUrl.set(f.url, []);
  byUrl.get(f.url).push(`${f.course}:${f.path}`);
}
console.log(`${found.length} URL occurrences, ${byUrl.size} unique (code fields excluded)`);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(url, { method, redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: '*/*' } });
      clearTimeout(t);
      if (method === 'HEAD' && (r.status === 405 || r.status === 403 || r.status === 404)) continue;
      return { status: r.status, finalUrl: r.url };
    } catch (e) {
      if (method === 'GET') return { status: 0, error: String(e.cause?.code ?? e.name ?? e).slice(0, 60) };
    }
  }
  return { status: 0, error: 'unreachable' };
}

const urls = [...byUrl.keys()];
const results = [];
let idx = 0;
async function worker() {
  while (idx < urls.length) {
    const url = urls[idx++];
    results.push({ url, locations: byUrl.get(url), ...(await check(url)) });
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: 12 }, worker));
console.log('');

const norm = (u) => u.replace(/[?#].*$/, '').replace(/\/$/, '').replace(/^http:/, 'https:').replace(/:\/\/www\./, '://');
const dead = results.filter((r) => r.status === 0 || r.status >= 400);
const redirected = results.filter((r) => r.status >= 200 && r.status < 400 && r.finalUrl && norm(r.finalUrl) !== norm(r.url));
const ok = results.filter((r) => r.status >= 200 && r.status < 400 && (!r.finalUrl || norm(r.finalUrl) === norm(r.url)));

writeFileSync(new URL('./link-report.json', import.meta.url), JSON.stringify({ dead, redirected, ok }, null, 1));
console.log(`OK: ${ok.length}   REDIRECTED: ${redirected.length}   DEAD/BLOCKED: ${dead.length}   (details: content/link-report.json)`);
for (const r of dead) console.log(`  ✗ [${r.status || r.error}] ${r.url}\n      at ${r.locations.slice(0, 3).join(' , ')}`);
for (const r of redirected) console.log(`  ↪ ${r.url}\n      -> ${r.finalUrl}`);
process.exit(dead.length ? 1 : 0);
