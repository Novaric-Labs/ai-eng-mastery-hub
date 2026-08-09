// Validate the PATTERNS code blocks across all courses.
//
// Born from the Aug 2026 audit (docs/CURRICULUM_AUDIT_2026-08.md): a content-
// pipeline bug stripped regex backslashes and let literal control characters
// and raw newlines into code strings, silently breaking the flagship code
// patterns of five modules — learners pasting the course's canonical code hit
// an immediate SyntaxError. This gate makes that defect class un-shippable.
//
//   HARD FAIL  control characters in any pattern code (e.g. a literal
//              backspace 0x08 where a \b regex escape was meant), any course.
//   HARD FAIL  Python patterns that don't compile, for courses declared
//              patterns:'python' in courses.mjs ('pseudo' courses are exempt).
//   WARN       likely stripped regex escapes (bare s+/d+/w+ inside re.* call
//              strings) and '#' placeholder resource links.
//
// Run: node content/validate-patterns.mjs   (exit code 1 on any hard failure)
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { COURSES } from './courses.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL('./' + file, import.meta.url)));

// Control chars that have no business in course code. \n (0x0a) and \t (0x09)
// are fine; \r (0x0d) tolerated for Windows line endings.
const CONTROL = /[\x00-\x08\x0b\x0c\x0e-\x1f]/;

// Heuristic for the backslash-stripping corruption: a bare s+/d+/w+ glued to a
// word character inside a re.* pattern string ("ignores+" was "ignore\s+").
// Warn-only: legitimate patterns can rarely look like this.
// The char class excludes backslash so the alternation is unambiguous —
// `(?!\1).` would let a backslash run backtrack exponentially on exactly the
// malformed (unterminated-string) input this gate exists to catch.
const RE_CALL = /re\.(?:compile|search|match|fullmatch|findall|finditer|sub|split)\(\s*r?(["'])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const STRIPPED = /[A-Za-z][sdw]\+/;

// Find a Python 3 to compile with: Windows launcher first, then PATH names.
function findPython() {
  for (const cmd of [['py', '-3'], ['python3'], ['python']]) {
    const r = spawnSync(cmd[0], [...cmd.slice(1), '--version'], { stdio: 'pipe', shell: false });
    if (r.status === 0) return cmd;
  }
  return null;
}

const python = findPython();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-patterns-'));

let fails = 0;
let warns = 0;

for (const { course, json, patterns } of COURSES) {
  const d = read(json);
  const PATTERNS = d.PATTERNS || {};
  console.log(`\n=== ${course} (${json}) — patterns: ${patterns} ===`);

  for (const id of Object.keys(PATTERNS)) {
    const code = PATTERNS[id]?.code;
    if (typeof code !== 'string' || !code.trim()) continue;
    const where = `${course} / ${id}`;
    // A pattern can override the course default via a `lang` field — some
    // blocks are YAML / SQL / prose templates by design (prompt, vecdb,
    // design, lead) and must not be fed to the Python compiler.
    const lang = PATTERNS[id]?.lang ?? patterns;

    // 1. Control characters — the corruption class, hard fail everywhere.
    const ctl = code.match(CONTROL);
    if (ctl) {
      fails++;
      const cp = ctl[0].codePointAt(0).toString(16).padStart(2, '0');
      console.log(`  ✗ ${where}: control character 0x${cp} in code (stripped-escape corruption?)`);
    }

    // 2. Compile gate for real-Python blocks.
    if (lang === 'python') {
      if (!python) {
        fails++;
        console.log(`  ✗ ${where}: no Python 3 found to compile with (install python, or the py launcher on Windows)`);
      } else {
        const file = path.join(tmp, `${course}-${id}.py`);
        fs.writeFileSync(file, code);
        const r = spawnSync(python[0], [...python.slice(1), '-m', 'py_compile', file], { stdio: 'pipe', shell: false });
        if (r.status !== 0) {
          fails++;
          const err = String(r.stderr).trim().split(/\r?\n/).pop();
          console.log(`  ✗ ${where}: does not compile — ${err}`);
        }
      }
    }

    // 3. Stripped-escape heuristic inside re.* pattern strings (warn only).
    for (const m of code.matchAll(RE_CALL)) {
      if (STRIPPED.test(m[2])) {
        warns++;
        console.log(`  ⚠ ${where}: possible stripped regex escape in ${JSON.stringify(m[2]).slice(0, 60)} (bare s+/d+/w+)`);
      }
    }
  }

  // 4. Placeholder resource links in DEEP res lists (warn only).
  for (const [id, deep] of Object.entries(d.DEEP || {})) {
    for (const r of deep?.res || []) {
      if (Array.isArray(r) && r[1] === '#') {
        warns++;
        console.log(`  ⚠ ${course} / ${id}: '#' placeholder resource link ("${r[0]}")`);
      }
    }
  }
}

console.log(`\n${fails} failure(s), ${warns} warning(s).`);
process.exit(fails > 0 ? 1 : 0);
