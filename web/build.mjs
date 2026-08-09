// build.mjs — assemble the deployable, paywall-safe front-end.
// Strips the inline course content out of the app (so paid content is NOT in
// the bundle), adds Supabase + config + boot, writes web/index.html.
// Run: node web/build.mjs
import fs from "fs";

const SRC = new URL("../AI_ENG_1_v6.HTM", import.meta.url);
const OUT = new URL("./index.html", import.meta.url);
const BOOT = new URL("./boot.js", import.meta.url);

let html = fs.readFileSync(SRC, "utf8");
const before = html.length;

// The HTM's line endings depend on git autocrlf (LF in-repo, CRLF in a
// Windows working tree). Build every multi-line anchor with the file's own
// flavor so the build works from either checkout.
const NL = html.includes("\r\n") ? "\r\n" : "\n";

// --- string-aware bracket matcher (handles ' " ` strings + escapes) ---
function bracketEnd(src, openIdx) {
  const pair = { "[": "]", "{": "}", "(": ")" };
  if (!pair[src[openIdx]]) throw new Error("not a bracket at " + openIdx);
  let depth = 0, str = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (str) {
      if (c === "\\") { i++; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { str = c; continue; }
    if (c === "[" || c === "{" || c === "(") depth++;
    else if (c === "]" || c === "}" || c === ")") { depth--; if (depth === 0) return i; }
  }
  throw new Error("unmatched bracket from " + openIdx);
}

// Replace a top-level declaration `<marker>…<matching close>;` with `replacement`.
// marker must END at the opening bracket of the value (or call).
function replaceDecl(src, marker, replacement) {
  const m = src.indexOf(marker);
  if (m < 0) throw new Error("marker not found: " + marker);
  if (src.indexOf(marker, m + 1) >= 0) throw new Error("marker not unique: " + marker);
  const openIdx = m + marker.length - 1;       // the [ { or (
  let end = bracketEnd(src, openIdx);
  if (src[end + 1] === ";") end++;             // swallow trailing semicolon
  return src.slice(0, m) + replacement + src.slice(end + 1);
}

const strips = [
  ["const BLOCKS=[",        "let BLOCKS=[];"],
  ["const MODULES=[",       "let MODULES=[];"],
  ["const QUIZ={",          "let QUIZ={};"],
  ["const CARDS=[",         "let CARDS=[];"],
  ["const SCENARIOS=[",     "let SCENARIOS=[];"],
  ["const DEEP={",          "let DEEP={};"],
  ["const DEPTH={",         "let DEPTH={};"],
  ["const PLAIN={",         "let PLAIN={};"],
  ["const GLOSSARY=[",      "let GLOSSARY=[];"],
  ["const PATTERNS={",      "let PATTERNS={};"],
];
for (const [marker, repl] of strips) html = replaceDecl(html, marker, repl);
// remove the DEPTH extension call (Object.assign(DEPTH,{…})) entirely
html = replaceDecl(html, "Object.assign(", "");

// --- inject external deps before the engine <script>, boot after it ---
const ENGINE_OPEN = "<script>" + NL + "/* ================= DATA ================= */";
if (!html.includes(ENGINE_OPEN)) throw new Error("engine <script> anchor not found");
html = html.replace(
  ENGINE_OPEN,
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' + NL +
  '<script src="config.js"></script>' + NL +
  ENGINE_OPEN
);

const bootSrc = fs.readFileSync(BOOT, "utf8");
const bootStyle = `<style>
#bootcover{position:fixed;inset:0;z-index:1000;background:var(--bg,#0d1117);display:flex;align-items:center;justify-content:center;padding:24px}
#bootcover .bc-card{background:var(--bg2,#161b22);border:1px solid var(--border,#2d333b);border-radius:16px;padding:30px 28px;max-width:380px;width:100%;text-align:center}
#bootcover .bc-logo{font-size:18px;font-weight:700;margin-bottom:6px}
#bootcover .bc-sub{color:var(--dim,#9aa4af);font-size:13.5px;margin-bottom:16px}
#bootcover .bc-msg{background:var(--bg3,#1c2330);border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:14px;color:var(--text,#e6edf3)}
#bootcover input{width:100%;padding:11px 14px;border-radius:9px;border:1px solid var(--border,#2d333b);background:var(--bg3,#1c2330);color:var(--text,#e6edf3);font-size:14px;margin-bottom:10px;outline:none}
#bootcover .bc-btn{width:100%;padding:11px 14px;border:none;border-radius:9px;background:var(--accent,#58a6ff);color:#0d1117;font-weight:600;font-size:14px;cursor:pointer;margin-bottom:8px}
#bootcover .bc-ghost{background:var(--bg3,#1c2330);color:var(--text,#e6edf3);border:1px solid var(--border,#2d333b)}
#bootcover .bc-or{color:var(--dim,#9aa4af);font-size:12px;margin:6px 0}
#bootcover .bc-spin{width:34px;height:34px;border:3px solid var(--border,#2d333b);border-top-color:var(--accent,#58a6ff);border-radius:50%;animation:bcspin .8s linear infinite;margin:0 auto}
@keyframes bcspin{to{transform:rotate(360deg)}}
</style>`;
html = html.replace("</head>", bootStyle + NL + "</head>");
html = html.replace(
  "</script>" + NL + "</body>",
  "</script>" + NL + "<script>" + NL + bootSrc + NL + "</script>" + NL + "</body>"
);

fs.writeFileSync(OUT, html);
console.log(`web/index.html written: ${before} -> ${html.length} bytes (stripped ${before - html.length})`);
