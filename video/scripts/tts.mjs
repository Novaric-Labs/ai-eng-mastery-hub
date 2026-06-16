// TTS step: turn a video's `say` segments into narration audio + exact, audio-
// aligned slide timings + a captions VTT. Uses ElevenLabs' with-timestamps
// endpoint so timing comes from the real audio, not a guess.
//
// Outputs (relative to video/):
//   public/<id>/narration.mp3   - narration (referenced by the composition via staticFile)
//   public/<id>/props.json      - PrefaceProps (title, timed segments, audioSrc, vtt)
//   out/<id>/preface.en.vtt     - captions
//
// Run standalone:  node --env-file=.env scripts/tts.mjs rag
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
// Course narrator: "Tim — Solid and Enthusiastic" (Voice Library). Natural,
// warm, clean — no breathy mic realism. Requires a paid plan to use via API.
// Override per-run with ELEVENLABS_VOICE_ID or per-video via `voiceId`.
const DEFAULT_VOICE = "6psAnGNeDguzLyTxKYvI";

function fmtTime(s) {
  const ms = Math.round(s * 1000);
  const hh = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const mmm = String(ms % 1000).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${mmm}`;
}

// Group aligned characters into words, then into readable caption cues.
function buildCues(characters, starts, ends) {
  const words = [];
  let cur = null;
  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    if (/\s/.test(ch)) {
      if (cur) { words.push(cur); cur = null; }
      continue;
    }
    if (!cur) cur = { text: "", start: starts[i], end: ends[i] };
    cur.text += ch;
    cur.end = ends[i];
  }
  if (cur) words.push(cur);

  const cues = [];
  let group = [];
  const flush = () => {
    if (!group.length) return;
    cues.push({
      start: group[0].start,
      end: group[group.length - 1].end,
      text: group.map((w) => w.text).join(" "),
    });
    group = [];
  };
  for (const w of words) {
    group.push(w);
    const dur = w.end - group[0].start;
    const endsSentence = /[.?!]$/.test(w.text);
    if (group.length >= 9 || dur >= 4.5 || endsSentence) flush();
  }
  flush();
  return cues;
}

function toVtt(cues) {
  let out = "WEBVTT\n\n";
  for (const c of cues) out += `${fmtTime(c.start)} --> ${fmtTime(c.end)}\n${c.text}\n\n`;
  return out;
}

// ElevenLabs connections from some networks intermittently connect-timeout;
// retry transport-level failures (not HTTP error statuses) with backoff.
async function fetchWithRetry(url, opts, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      last = e;
      if (i < tries - 1) {
        const wait = 600 * (i + 1);
        console.log(`· network hiccup (${e.cause?.code ?? e.message}); retry ${i + 1}/${tries - 1} in ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw last;
}

export async function synth(id) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set (see video/.env.example).");

  const { PREFACES } = await import("../data/prefaces.mjs");
  const video = PREFACES[id];
  if (!video?.segments?.length) throw new Error(`No preface for "${id}" in data/prefaces.mjs.`);

  const voiceId = process.env.ELEVENLABS_VOICE_ID || video.voiceId || DEFAULT_VOICE;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  // Force the language so the multilingual model can't briefly drift into
  // another language/accent mid-sentence. Honored by turbo_v2_5 / flash_v2_5.
  const languageCode = process.env.ELEVENLABS_LANGUAGE || "en";

  const segJoin = " ";
  const fullText = video.segments.map((s) => s.say.trim()).join(segJoin);

  console.log(`· TTS: ${video.segments.length} segments, ${fullText.length} chars, voice ${voiceId}, model ${modelId}, lang ${languageCode}`);

  const res = await fetchWithRetry(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        text: fullText,
        model_id: modelId,
        // language_code is honored by the v2_5 (turbo/flash) models; the
        // higher-quality multilingual_v2 infers language and rejects the param.
        ...(/v2_5/.test(modelId) ? { language_code: languageCode } : {}),
        // Tunable: lower stability = more natural prosody (less "processed/flat"),
        // too low risks drift. Defaults aim for clean + naturally inflected.
        voice_settings: {
          stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.4),
          similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY ?? 0.8),
          style: Number(process.env.ELEVENLABS_STYLE ?? 0),
          use_speaker_boost: true,
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const a = json.alignment ?? json.normalized_alignment;
  if (!json.audio_base64 || !a) throw new Error("ElevenLabs response missing audio or alignment.");

  const characters = a.characters;
  const starts = a.character_start_times_seconds;
  const ends = a.character_end_times_seconds;
  const duration = ends[ends.length - 1];

  // Map each segment's start char offset (in fullText) -> a start time.
  let off = 0;
  const segStartChar = video.segments.map((s) => {
    const start = off;
    off += s.say.trim().length + segJoin.length;
    return start;
  });
  const startTimeAt = (charIdx) => starts[Math.min(charIdx, starts.length - 1)] ?? 0;

  const segments = video.segments.map((s, i) => {
    const start = i === 0 ? 0 : startTimeAt(segStartChar[i]);
    const end = i + 1 < video.segments.length ? startTimeAt(segStartChar[i + 1]) : duration;
    return { kicker: s.slide.kicker, lines: s.slide.lines, start, end };
  });

  // Write outputs.
  const pubDir = path.join(ROOT, "public", id);
  const outDir = path.join(ROOT, "out", id);
  fs.mkdirSync(pubDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(pubDir, "narration.mp3"), Buffer.from(json.audio_base64, "base64"));

  const vtt = toVtt(buildCues(characters, starts, ends));
  fs.writeFileSync(path.join(outDir, "preface.en.vtt"), vtt);

  const props = {
    title: video.title,
    segments,
    durationInSeconds: duration,
    audioSrc: `${id}/narration.mp3`,
    vtt: `${id}/preface.en.vtt`,
  };
  fs.writeFileSync(path.join(pubDir, "props.json"), JSON.stringify(props, null, 2));

  console.log(`✓ TTS done: ${duration.toFixed(1)}s audio, ${segments.length} timed segments, captions written.`);
  return props;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv[2] || "rag";
  synth(id).catch((e) => {
    console.error("✗", e.message);
    process.exit(1);
  });
}
