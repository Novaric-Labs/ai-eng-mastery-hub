"use client";

import { useCourseStore } from "./StoreProvider";
import {
  blockMastered,
  blockMods,
  modMastered,
  modQuizBest,
  type Block,
  type ModuleMeta,
} from "@/lib/course";

type Next =
  | { type: "read"; m: ModuleMeta; b: Block }
  | { type: "quiz"; m: ModuleMeta; b: Block }
  | { type: "exam"; b: Block }
  | { type: "done" };

export default function LearningPath() {
  const { course, S, go, startQuiz } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    go: s.go,
    startQuiz: s.startQuiz,
  }));

  const total = course.catalog.length;
  const nM = course.catalog.filter((m) => modMastered(S, m.id)).length;
  const pct = Math.round((100 * nM) / total);
  const nB = course.blocks.filter((b) => blockMastered(course, S, b.id)).length;

  // next recommended action
  let next: Next = { type: "done" };
  outer: for (const b of course.blocks) {
    for (const m of blockMods(course, b.id)) {
      if (!S.read?.[m.id]) { next = { type: "read", m, b }; break outer; }
      if (!modMastered(S, m.id)) { next = { type: "quiz", m, b }; break outer; }
    }
    if (!S.exams?.[b.id]?.passed) { next = { type: "exam", b }; break outer; }
  }

  return (
    <div className="page">
      <h2>Learning Path</h2>
      <p className="tagline">
        {nM}/{total} modules mastered · {nB}/{course.blocks.length} blocks complete
      </p>
      <div className="bar" style={{ height: 10, margin: "4px 0 22px" }}>
        <i className={pct === 100 ? "g" : ""} style={{ width: `${pct}%` }} />
      </div>

      {next.type === "done" ? (
        <div className="card" style={{ borderColor: "var(--green)", padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--green)", marginBottom: 6, fontWeight: 600 }}>
            Complete
          </div>
          <p style={{ marginBottom: 12 }}>All modules and exams finished. Keep the flashcards in rotation.</p>
          <button className="btn green" onClick={() => go("cards")}>Review flashcards →</button>
        </div>
      ) : (
        <div className="card" style={{ borderColor: "var(--accent)", padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--accent)", marginBottom: 6, fontWeight: 600 }}>
            Next
          </div>
          {next.type === "read" && (
            <>
              <p style={{ marginBottom: 12 }}>Read <b>{next.m.title}</b></p>
              <button className="btn" onClick={() => go("mod", next.m.id)}>Open module →</button>
            </>
          )}
          {next.type === "quiz" && (
            <>
              <p style={{ marginBottom: 12 }}>
                Take the <b>{next.m.title}</b> quiz
                {modQuizBest(S, next.m.id) ? ` — best so far: ${modQuizBest(S, next.m.id)}%` : ""}
              </p>
              <button className="btn" onClick={() => startQuiz(next.m.id)}>Start quiz →</button>
            </>
          )}
          {next.type === "exam" && (
            <>
              <p style={{ marginBottom: 12 }}>Take the <b>{next.b.name}</b> mastery exam — all modules done</p>
              <button className="btn" onClick={() => go("exam", next.b.id)}>Start exam →</button>
            </>
          )}
        </div>
      )}

      {course.blocks.map((b) => {
        const mods = blockMods(course, b.id);
        const nDone = mods.filter((m) => modMastered(S, m.id)).length;
        const bPct = Math.round((100 * nDone) / mods.length);
        const bM = blockMastered(course, S, b.id);
        const ex = S.exams?.[b.id];
        const isCur =
          (next.type === "read" || next.type === "quiz") ? next.m.block === b.id
          : next.type === "exam" ? next.b.id === b.id
          : false;
        const allM = mods.every((m) => modMastered(S, m.id));
        const eP = ex?.passed;
        const eA = (ex?.attempts ?? 0) > 0;

        return (
          <div className={`pblock ${bM ? "pb-done" : isCur ? "pb-cur" : ""}`} key={b.id}>
            <div className="pb-head">
              <span className="pb-name">{b.name}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--dim)" }}>{nDone}/{mods.length}</span>
                {bM ? (
                  <span className="pb-chip pb-chip-g">MASTERED</span>
                ) : isCur ? (
                  <span className="pb-chip pb-chip-a">IN PROGRESS</span>
                ) : null}
              </span>
            </div>
            <div className="bar" style={{ marginBottom: 10 }}>
              <i className={bPct === 100 ? "g" : ""} style={{ width: `${bPct}%` }} />
            </div>
            <div className="pb-rows">
              {mods.map((m) => {
                const mM = modMastered(S, m.id);
                const mR = S.read?.[m.id];
                const best = modQuizBest(S, m.id);
                const isCurM = (next.type === "read" || next.type === "quiz") && next.m.id === m.id;
                return (
                  <div className={`pb-row ${isCurM ? "pb-row-cur" : ""}`} key={m.id}>
                    <span className={`dot ${mM ? "mastered" : mR || best ? "read" : ""}`} />
                    <button className="pb-btn" onClick={() => go("mod", m.id)}>{m.title}</button>
                    {!mM && best > 0 && <span className="pb-stat pb-stat-a">quiz: {best}%</span>}
                    {!mM && !best && mR && <span className="pb-stat pb-stat-a">quiz needed</span>}
                    {!mM && !best && !mR && <span className="pb-stat">not started</span>}
                  </div>
                );
              })}
              <div className="pb-row pb-exam">
                <span className={`dot ${eP ? "mastered" : ""}`} />
                <button className="pb-btn" onClick={() => go("exam", b.id)}>Mastery Exam</button>
                <span className={`pb-stat ${eP ? "pb-stat-g" : eA ? "pb-stat-a" : ""}`}>
                  {eP ? `passed · ${ex!.best}%` : eA ? `best: ${ex!.best}%` : allM ? "ready" : "pending"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
