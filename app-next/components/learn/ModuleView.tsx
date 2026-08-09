"use client";

import { BookOpen, Wrench, Library, Code, Lock, Zap, ArrowRight, Check } from "lucide-react";
import { useCourseStore } from "./StoreProvider";
import HtmlRaw from "./Html";
import Paywall from "./Paywall";
import SectionRail from "./SectionRail";
import VideoPreface from "./VideoPreface";
import {
  fmtMin,
  modMastered,
  modQuizBest,
  moduleUnlocked,
} from "@/lib/course";
import type { Tab } from "@/lib/store";

const TAB_OF: Record<string, Tab> = {
  learn: "learn",
  apply: "apply",
  resources: "res",
  patterns: "code",
};

// Course-aware section labels. The same ModuleView renders every course, but a
// handful of section titles are written for the engineer/staff audience of the
// Mastery Hub ('ai-eng') and read wrong for a beginner course. We keep the
// Mastery wording as the default and override only the audience-flavored strings
// per course slug. Only the human-readable titles change here — which fields
// render and their guarding logic are untouched.
type SectionLabels = {
  tradeoffs: string; // DEPTH: "Architectural tradeoffs" table heading
  scaleNotes: string; // DEPTH: <details> summary over dp.scale
  secNotes: string; // DEPTH: <details> summary over dp.sec
  ask: string; // MOD: heading over m.ask ("Questions to ask …")
  articulate: string; // DEPTH: heading over dp.interview
  articulatePractice: string; // DEPTH: practice prose under dp.interview
  goodInProd: string; // DEEP: heading over d.good
  loadBearing: string; // PATTERNS: heading over p.notes
};

// Default = the existing Mastery ('ai-eng') copy, byte-for-byte. Any unknown or
// future course falls back to this, so ai-eng stays visually identical.
const DEFAULT_LABELS: SectionLabels = {
  tradeoffs: "Architectural tradeoffs",
  scaleNotes: "Scale, cost & latency notes",
  secNotes: "Security & governance notes",
  ask: "Questions to ask your engineers",
  articulate: "Say it like a staff engineer",
  articulatePractice:
    "Practice saying this out loud, unscripted, in your own words. The articulation under pressure — in a design review, an interview, an incident call — is the staff-level skill the reading builds toward.",
  goodInProd: "What good looks like in production",
  loadBearing: "Why these lines are load-bearing",
};

// Per-course overrides. Beginner reframes for 'ai-foundations'; the content was
// authored to fit these plainer framings.
const LABELS_BY_COURSE: Record<string, SectionLabels> = {
  "ai-foundations": {
    tradeoffs: "Trade-offs to weigh",
    scaleNotes: "Speed & cost notes",
    secNotes: "Privacy & safety notes",
    ask: "Questions to ask yourself",
    articulate: "Explain it to a friend",
    articulatePractice:
      "Practice saying this out loud, unscripted, in your own words. Being able to explain it simply — to a friend, a coworker, or your future self — is the sign it has actually clicked.",
    goodInProd: "What good looks like",
    loadBearing: "Why these lines matter",
  },
};

function labelsFor(courseSlug: string): SectionLabels {
  return LABELS_BY_COURSE[courseSlug] ?? DEFAULT_LABELS;
}

// Turn textual "<Tab> tab" mentions in authored content into clickable buttons
// that jump to that tab (handled by delegation in ModuleView). We wrap only the
// tab name so the surrounding sentence is untouched.
function linkifyTabs(html: string): string {
  return html.replace(
    /\b(Learn|Apply|Resources|Patterns)(?=\s+tab\b)/g,
    (name) => `<button type="button" class="tablink" data-tab="${TAB_OF[name.toLowerCase()]}">${name}</button>`,
  );
}

// All authored HTML in this view flows through here, so tab mentions become
// clickable everywhere without touching each call site.
function Html(props: React.ComponentProps<typeof HtmlRaw>) {
  return <HtmlRaw {...props} html={linkifyTabs(props.html)} />;
}

const RAIL_BASE = [
  { id: "sec-why", label: "Why" },
  { id: "sec-mental", label: "Mental model" },
  { id: "sec-concepts", label: "Concepts" },
  { id: "sec-mistakes", label: "Mistakes" },
  { id: "sec-flags", label: "Red flags" },
  { id: "sec-ask", label: "Ask" },
];

const RAIL_DEEP = [
  { id: "sec-why", label: "Why" },
  { id: "sec-mental", label: "Mental model" },
  { id: "sec-mech", label: "How it works" },
  { id: "sec-concepts", label: "Concepts" },
  { id: "sec-tradeoffs", label: "Tradeoffs" },
  { id: "sec-mistakes", label: "Mistakes" },
  { id: "sec-flags", label: "Red flags" },
  { id: "sec-ask", label: "Ask" },
  { id: "sec-artic", label: "Articulation" },
];

export default function ModuleView({ id }: { id: string }) {
  const { course, courseSlug, S, tab, go, goTab, startQuiz, markRead } = useCourseStore((s) => ({
    course: s.course,
    courseSlug: s.courseSlug,
    S: s.S,
    tab: s.route.tab,
    go: s.go,
    goTab: s.goTab,
    startQuiz: s.startQuiz,
    markRead: s.markRead,
  }));

  const L = labelsFor(courseSlug);

  // Delegated handler: a click on any linkified tab mention jumps to that tab.
  const onContentClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("button.tablink[data-tab]");
    const t = el?.dataset.tab as Tab | undefined;
    if (t) goTab(t);
  };

  const meta = course.catalog.find((m) => m.id === id);
  if (!meta) return <div className="page"><h2>Module not found</h2></div>;

  const idx = course.catalog.indexOf(meta);
  const next = course.catalog[idx + 1];
  const mastered = modMastered(S, id);
  const plain = course.plain[id];

  // Preface video, shown at the top of a module. On a locked module we only
  // surface a "public" video — a free teaser; a "paid" one would 403 on play,
  // so it stays hidden there. `key={id}` forces a fresh mount per module so the
  // player resets (stops playback, clears the prior source) when switching lessons.
  const video = course.videos[id];
  const videoEl = video ? <VideoPreface key={id} id={id} meta={video} courseSlug={courseSlug} /> : null;
  const teaserEl = video && (video.tier ?? "public") === "public" ? videoEl : null;

  const header = (
    <>
      <h2>{meta.title}</h2>{" "}
      {mastered && <span className="badge pass">MASTERED</span>}
      <p className="tagline">{meta.tag}</p>
    </>
  );

  // Locked module → preview (plain-English + why) then paywall.
  if (!moduleUnlocked(course, id)) {
    return (
      <div className="page">
        {header}
        {teaserEl}
        {plain && (
          <div className="card" style={{ borderColor: "var(--teal)" }}>
            <b style={{ color: "var(--teal)" }}>In plain English</b>
            <Html style={{ marginTop: 6 }} html={plain} />
          </div>
        )}
        <div className="card">
          <b>Why this matters</b>
          <Html style={{ marginTop: 6, color: "var(--dim)" }} html={meta.why} />
        </div>
        <Paywall heading={`“${meta.title}” is part of the full course`} />
      </div>
    );
  }

  const bundle = course.modules[id];
  const m = bundle.mod;
  const d = bundle.deep;
  const dp = bundle.depth;
  const p = bundle.patterns;
  const best = modQuizBest(S, id);

  const tabBtn = (t: Tab, label: React.ReactNode, disabled = false) => (
    <button
      data-tour={`tab-${t}`}
      className={`tab${tab === t ? " active" : ""}`}
      onClick={() => !disabled && goTab(t)}
      disabled={disabled}
      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
    >
      {label}
    </button>
  );

  const railSections = dp ? RAIL_DEEP : RAIL_BASE;

  const learn = (
    <>
      {videoEl}
      {plain && (
        <div id="sec-why" className="card" style={{ borderColor: "var(--teal)" }}>
          <b style={{ color: "var(--teal)" }}>In plain English</b>
          <Html style={{ marginTop: 6 }} html={plain} />
        </div>
      )}
      <div id={plain ? undefined : "sec-why"} className="card">
        <b>Why this matters</b>
        <Html style={{ marginTop: 6, color: "var(--dim)" }} html={m.why} />
      </div>
      <div id="sec-mental" className="mental">
        <b>Mental model — </b>
        <Html as="span" html={m.mental} />
      </div>

      {dp && (
        <>
          <h3 id="sec-mech">How it actually works</h3>
          <Html className="card mech" html={dp.mech} />
        </>
      )}

      <h3 id="sec-concepts">Core concepts</h3>
      <div className="card concepts">
        {m.concepts.map((c, i) => (
          <div className="concept" key={i}>
            <span className="concept-term">{c[0]}</span>
            <Html as="p" className="concept-def" html={c[1]} />
          </div>
        ))}
      </div>

      {dp && (
        <>
          <h3 id="sec-tradeoffs">{L.tradeoffs}</h3>
          <div className="card" style={{ padding: "10px 14px" }}>
            <table>
              <tbody>
                <tr>
                  <th>Decision</th>
                  <th>The lever</th>
                  <th>Cost of getting it wrong</th>
                </tr>
                {dp.trade.map((t, i) => (
                  <tr key={i}>
                    <td><b>{t[0]}</b></td>
                    <td><Html as="span" html={t[1]} /></td>
                    <td style={{ color: "var(--dim)" }}><Html as="span" html={t[2]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <details className="deep">
            <summary><Zap size={15} strokeWidth={1.75} /> {L.scaleNotes}</summary>
            <ul className="flat">
              {dp.scale.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}
            </ul>
          </details>
          <details className="deep">
            <summary><Lock size={15} strokeWidth={1.75} /> {L.secNotes}</summary>
            <ul className="flat">
              {dp.sec.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}
            </ul>
          </details>
        </>
      )}

      <h3 id="sec-mistakes">Common mistakes</h3>
      <div className="card">
        <ul className="flat">{m.mistakes.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}</ul>
      </div>
      <h3 id="sec-flags">Red flags in the wild</h3>
      <div className="card">
        <ul className="flat flags">{m.flags.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}</ul>
      </div>
      <h3 id="sec-ask">{L.ask}</h3>
      <div className="card">
        <ul className="flat">{m.ask.map((x, i) => <li key={i}>&quot;<Html as="span" html={x} />&quot;</li>)}</ul>
      </div>

      {p && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--dim)", margin: "16px 0 4px" }}>
          <Code size={15} strokeWidth={1.75} /> This module has implementation code in the{" "}
          <button type="button" className="tablink" data-tab="code">Patterns</button> tab — runnable patterns, load-bearing line explanations, and a debugging guide.
        </div>
      )}

      {dp && (
        <>
          <h3 id="sec-artic">{L.articulate}</h3>
          <div
            className="worked"
            style={{ borderLeftColor: "var(--accent2)", background: "linear-gradient(90deg,rgba(188,140,255,.06),transparent)" }}
          >
            <b>The two-minute articulation — </b>
            <Html as="span" html={dp.interview} />
          </div>
          <p style={{ color: "var(--dim)", fontSize: 13 }}>
            {L.articulatePractice}
          </p>
        </>
      )}
    </>
  );

  const apply = d && (
    <>
      <h3>Worked example</h3>
      <Html className="worked" html={d.worked} />
      <h3>{L.goodInProd}</h3>
      <div className="card">
        <ul className="flat checks">{d.good.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}</ul>
      </div>
      <h3>Build it</h3>
      <div className="buildbox">
        <b>Hands-on exercise — </b>
        <Html as="span" html={d.build} />
      </div>
      <p style={{ color: "var(--dim)", fontSize: 13.5 }}>
        Building is where concepts become intuition. A pipeline you struggled with teaches more than one you read about three times.
      </p>
    </>
  );

  const res = d && (
    <>
      <h3>Curated resources</h3>
      <p style={{ color: "var(--dim)", fontSize: 13.5, marginBottom: 14 }}>
        Each entry says when to reach for it — don&apos;t read these front-to-back; pull them at the moment of need.
      </p>
      {d.res.map((r, i) => (
        <div className="res-item" key={i}>
          {r[1] === "#" ? (
            <b style={{ color: "var(--accent)" }}>{r[0]}</b>
          ) : (
            <a href={r[1]} target="_blank" rel="noopener noreferrer">{r[0]} ↗</a>
          )}
          <span className="when">
            <b>Use when:</b> <Html as="span" html={r[2]} />
          </span>
        </div>
      ))}
    </>
  );

  const code = p && (
    <>
      <h3>Implementation pattern</h3>
      <Html as="p" style={{ color: "var(--dim)", fontSize: 13.5 }} html={p.intro} />
      <pre className="codeblock">{p.code}</pre>
      <h3>{L.loadBearing}</h3>
      <div className="card">
        <ul className="flat">{p.notes.map((n, i) => <li key={i}><Html as="span" html={n} /></li>)}</ul>
      </div>
      <h3>Debugging guide</h3>
      <div className="card" style={{ padding: "10px 14px" }}>
        <table>
          <tbody>
            <tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
            {p.debug.map((dd, i) => (
              <tr key={i}>
                <td><b>{dd[0]}</b></td>
                <td><Html as="span" html={dd[1]} /></td>
                <td style={{ color: "var(--dim)" }}><Html as="span" html={dd[2]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: "var(--dim)", fontSize: 13 }}>
        Pseudocode-level Python: adapt names/SDKs to your stack. Type it out rather than copy it — the friction is the learning.
      </p>
    </>
  );

  const body =
    tab === "apply" ? apply : tab === "res" ? res : tab === "code" ? code : learn;

  const inner = (
    <div className="page" onClick={onContentClick}>
      {header}
      <span className={`est-meta${mastered ? " est-meta-done" : ""}`}>
        {meta.estMin ? fmtMin(meta.estMin) : ""}
      </span>
      <div className="tabs">
        {tabBtn("learn", <><BookOpen size={15} strokeWidth={1.75} /> Learn</>)}
        {tabBtn("apply", <><Wrench size={15} strokeWidth={1.75} /> Apply</>)}
        {tabBtn("res", <><Library size={15} strokeWidth={1.75} /> Resources</>)}
        {tabBtn("code", p
          ? <><Code size={15} strokeWidth={1.75} /> Patterns</>
          : <><Code size={15} strokeWidth={1.75} /> Patterns <Lock size={13} strokeWidth={1.75} /></>, !p)}
      </div>
      {body}
      <div className="actionbar">
        {S.read?.[id] ? (
          <button className="btn green" disabled><Check size={15} strokeWidth={2} /> Read</button>
        ) : (
          <button className="btn green" onClick={() => markRead(id)}>Mark as read</button>
        )}
        <button data-tour="quiz" className="btn" onClick={() => startQuiz(id)}>
          Take quiz {best ? `(best: ${best}%)` : ""}
        </button>
        {next && (
          <button className="btn ghost" onClick={() => go("mod", next.id)}>
            Next: {next.title} <ArrowRight size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );

  // Learn tab gets the wayfinding rail alongside the content.
  if (tab !== "apply" && tab !== "res" && tab !== "code") {
    return (
      <div className="mlw">
        {inner}
        {/* key remounts the rail per module: its scroll-spy effect keys on the
            sections array, which is now a stable constant shared across
            same-depth modules — without the key the spy wouldn't re-run on
            navigation and could highlight a section from the previous module */}
        <SectionRail key={id} sections={railSections} />
      </div>
    );
  }
  return inner;
}
