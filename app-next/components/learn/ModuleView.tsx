"use client";

import { BookOpen, Wrench, Library, Code, Lock, Zap, ArrowRight, Check } from "lucide-react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import Paywall from "./Paywall";
import SectionRail from "./SectionRail";
import {
  fmtMin,
  modMastered,
  modQuizBest,
  moduleUnlocked,
} from "@/lib/course";
import type { Tab } from "@/lib/store";

export default function ModuleView({ id }: { id: string }) {
  const { course, S, tab, go, goTab, startQuiz, markRead } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    tab: s.route.tab,
    go: s.go,
    goTab: s.goTab,
    startQuiz: s.startQuiz,
    markRead: s.markRead,
  }));

  const meta = course.catalog.find((m) => m.id === id);
  if (!meta) return <div className="page"><h2>Module not found</h2></div>;

  const idx = course.catalog.indexOf(meta);
  const next = course.catalog[idx + 1];
  const mastered = modMastered(S, id);
  const plain = course.plain[id];

  const header = (
    <>
      <h2>{meta.title}</h2>{" "}
      {meta.isNew && <span className="pill new">NEW IN 2026 EDITION</span>}
      {meta.isUpd && <span className="pill upd">UPDATED FOR 2026</span>}
      {mastered && <span className="badge pass">MASTERED</span>}
      <p className="tagline">{meta.tag}</p>
    </>
  );

  // Locked module → preview (plain-English + why) then paywall.
  if (!moduleUnlocked(course, id)) {
    return (
      <div className="page">
        {header}
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

  const railSections = [
    { id: "sec-why", label: "Why" },
    { id: "sec-mental", label: "Mental model" },
    ...(dp ? [{ id: "sec-mech", label: "How it works" }] : []),
    { id: "sec-concepts", label: "Concepts" },
    ...(dp ? [{ id: "sec-tradeoffs", label: "Tradeoffs" }] : []),
    { id: "sec-mistakes", label: "Mistakes" },
    { id: "sec-flags", label: "Red flags" },
    { id: "sec-ask", label: "Ask" },
    ...(dp ? [{ id: "sec-artic", label: "Articulation" }] : []),
  ];

  const learn = (
    <>
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
      <div className="card">
        {m.concepts.map((c, i) => (
          <div className="term" key={i}>
            <b>{c[0]}.</b> <Html as="span" html={c[1]} />
          </div>
        ))}
      </div>

      {dp && (
        <>
          <h3 id="sec-tradeoffs">Architectural tradeoffs</h3>
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
            <summary><Zap size={15} strokeWidth={1.75} /> Scale, cost &amp; latency notes</summary>
            <ul className="flat">
              {dp.scale.map((x, i) => <li key={i}><Html as="span" html={x} /></li>)}
            </ul>
          </details>
          <details className="deep">
            <summary><Lock size={15} strokeWidth={1.75} /> Security &amp; governance notes</summary>
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
      <h3 id="sec-ask">Questions to ask your engineers</h3>
      <div className="card">
        <ul className="flat">{m.ask.map((x, i) => <li key={i}>&quot;<Html as="span" html={x} />&quot;</li>)}</ul>
      </div>

      {p && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--dim)", margin: "16px 0 4px" }}>
          <Code size={15} strokeWidth={1.75} /> This module has implementation code in the{" "}
          <b style={{ color: "var(--accent2)" }}>Patterns</b> tab — runnable patterns, load-bearing line explanations, and a debugging guide.
        </div>
      )}

      {dp && (
        <>
          <h3 id="sec-artic">Say it like a staff engineer</h3>
          <div
            className="worked"
            style={{ borderLeftColor: "var(--accent2)", background: "linear-gradient(90deg,rgba(188,140,255,.06),transparent)" }}
          >
            <b>The two-minute articulation — </b>
            <Html as="span" html={dp.interview} />
          </div>
          <p style={{ color: "var(--dim)", fontSize: 13 }}>
            Practice saying this out loud, unscripted, in your own words. The articulation under pressure — in a design review, an interview, an incident call — is the staff-level skill the reading builds toward.
          </p>
        </>
      )}
    </>
  );

  const apply = d && (
    <>
      <h3>Worked example</h3>
      <Html className="worked" html={d.worked} />
      <h3>What good looks like in production</h3>
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
      <h3>Why these lines are load-bearing</h3>
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
    <div className="page">
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
        <SectionRail sections={railSections} />
      </div>
    );
  }
  return inner;
}
