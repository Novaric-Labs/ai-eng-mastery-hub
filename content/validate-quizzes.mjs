// Validate quiz answer balance across all courses.
//
// Catches the "you can guess the answer from its length" tell (and structural
// bugs). For every question/module it flags:
//   - option count != 4 (prepItems hardcodes shuffle([0,1,2,3])),
//   - `a` out of range,
//   - LENGTH OUTLIER: the correct option is substantially longer than the longest
//     distractor (> LEN_RATIO x and >= MIN_GAP chars longer), or
//   - MODULE SKEW: the correct option is the single longest in more than
//     SKEW_RATE of a module's questions (a systematic "pick the longer one" tell).
//
// Note we deliberately do NOT flag "correct happens to be the single longest" on
// its own — with balanced options that occurs ~25% of the time by chance, so it
// is not a tell. Only a large per-question margin or a module-wide pattern is.
//
// Run: node content/validate-quizzes.mjs   (exit code 1 if anything fails)
import fs from 'fs';

const read = (file) => JSON.parse(fs.readFileSync(new URL('./' + file, import.meta.url)));

// Keep in sync with seed.mjs COURSES.
const COURSES = [
  { course: 'ai-eng', json: 'content.json' },
  { course: 'ai-foundations', json: 'ai-foundations.json' },
];

const LEN_RATIO = 1.15; // correct option may not exceed this x the longest distractor
const MIN_GAP = 10;     // ...and only if the absolute gap is at least this many chars
const SKEW_RATE = 0.6;  // correct may be the single longest in at most this share of a module

// Strip inline HTML/markup so length compares the visible text, not tags.
const visibleLen = (s) => String(s).replace(/<[^>]*>/g, '').trim().length;

let totalFail = 0;
let totalQ = 0;

for (const { course, json } of COURSES) {
  const d = read(json);
  const quiz = d.QUIZ || {};
  const fails = [];

  for (const m of d.MODULES) {
    const items = quiz[m.id] || [];
    if (!items.length) continue;

    let longestCount = 0;
    items.forEach((it, i) => {
      totalQ++;
      const where = `${course} / ${m.id} #${i}`;
      const o = it.o || [];

      if (o.length !== 4) { fails.push(`${where}: option count ${o.length} (must be 4)`); return; }
      if (typeof it.a !== 'number' || it.a < 0 || it.a >= o.length) {
        fails.push(`${where}: answer index ${it.a} out of range`); return;
      }

      const lens = o.map(visibleLen);
      const correctLen = lens[it.a];
      const maxDistractor = Math.max(...lens.filter((_, n) => n !== it.a));
      if (correctLen > maxDistractor) longestCount++;

      if (correctLen > maxDistractor * LEN_RATIO && correctLen - maxDistractor >= MIN_GAP) {
        fails.push(`${where}: length outlier — correct ${correctLen} vs longest distractor ${maxDistractor} (${(correctLen / maxDistractor).toFixed(2)}x)`);
      }
    });

    const rate = longestCount / items.length;
    if (rate > SKEW_RATE) {
      fails.push(`${course} / ${m.id}: module skew — correct is the longest in ${longestCount}/${items.length} questions (${(rate * 100).toFixed(0)}%)`);
    }
  }

  totalFail += fails.length;
  console.log(`\n=== ${course} (${json}) — ${fails.length} flagged ===`);
  for (const f of fails) console.log('  ✗ ' + f);
}

console.log(`\n${totalQ} questions checked, ${totalFail} issue(s) flagged.`);
process.exit(totalFail > 0 ? 1 : 0);
