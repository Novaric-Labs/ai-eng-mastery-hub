"use client";

import { Check, Flame } from "lucide-react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import {
  PASS_EXAM,
  PASS_QUIZ,
  blockMastered,
  blockMods,
  blockRemaining,
  currentStreak,
  fmtMin,
  levelInfo,
  modMastered,
  modQuizBest,
  unlockedCards,
} from "@/lib/course";

export default function Dashboard() {
  const { course, S, go, resetProgress } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    go: s.go,
    resetProgress: s.resetProgress,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const total = course.catalog.length;
  const mastered = course.catalog.filter((m) => modMastered(S, m.id)).length;
  const read = course.catalog.filter((m) => S.read?.[m.id]).length;
  const examsPassed = course.blocks.filter((b) => S.exams?.[b.id]?.passed).length;
  const unlockedTotal = unlockedCards(course, S).length;
  const cardsKnown = (course.cards ?? []).filter(
    (c, i) => S.read?.[c.m] && (S.cards?.[i]?.box ?? 0) >= 3,
  ).length;
  const scenDone = Object.keys(S.scen ?? {}).length;
  const scenTotal = course.scenarios?.length ?? 0;
  const pct = Math.round((100 * mastered) / total);
  const weak = course.catalog
    .filter((m) => S.quiz?.[m.id] && (S.quiz[m.id].best as number) < PASS_QUIZ)
    .map((m) => `${m.title} (${S.quiz![m.id].best}%)`);
  const anyRead = Object.keys(S.read ?? {}).length > 0;

  const li = levelInfo(course, S);
  const streak = currentStreak(S, new Date());
  const studiedToday = (S.act ?? []).includes(today);

  return (
    <>
      {!anyRead && (
        <div className="card" style={{ borderColor: "var(--teal)" }}>
          <b style={{ color: "var(--teal)" }}>New to AI?</b>{" "}
          <span style={{ color: "var(--dim)" }}>
            This hub assumes only basic programming knowledge. Take 15 minutes on
          </span>{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); go("start"); }} style={{ color: "var(--accent)", fontWeight: 600 }}>
            Start Here
          </a>{" "}
          <span style={{ color: "var(--dim)" }}>
            first — it gives you the mental model everything else builds on, and every module opens with a plain-English intro.
          </span>
        </div>
      )}

      <h2>{S.name ? `Welcome back, ${S.name}` : "Your Mastery Dashboard"}</h2>
      <p className="tagline">
        Mastery = read the module + score ≥{PASS_QUIZ}% on its quiz. Block mastery adds the exam at ≥{PASS_EXAM}%.
      </p>

      <div className="card herostat" data-tour="dash-hero">
        <div className="hs-cell">
          <div className="hs-big" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flame size={22} strokeWidth={1.75} /> {streak}</div>
          <div className="hs-lbl">day streak</div>
        </div>
        <div className="hs-cell">
          <div className="hs-big">Lv {li.lvl}</div>
          <div className="hs-lbl">{li.total} XP total</div>
        </div>
        <div className="hs-cell hs-grow">
          <div className="hs-lbl" style={{ marginBottom: 4 }}>
            {li.into} / {li.need} XP to next level
          </div>
          <div className="bar">
            <i style={{ width: `${li.pct}%` }} />
          </div>
          <div style={{ marginTop: 8 }}>
            {studiedToday ? (
              <span className="goalpill done"><Check size={13} strokeWidth={2} /> Studied today</span>
            ) : (
              <span className="goalpill">Goal: study today</span>
            )}
          </div>
        </div>
      </div>

      <div className="card" data-tour="dash-overall">
        <b>Overall mastery</b>
        <div className="bar">
          <i className={pct === 100 ? "g" : ""} style={{ width: `${pct}%` }} />
        </div>
        <span className="boxtag">
          {mastered}/{total} modules mastered · {read}/{total} read
        </span>
      </div>

      <div className="statgrid">
        <div className="stat">
          <div className="big">{examsPassed}/{course.blocks.length}</div>
          <div className="lbl">Mastery exams passed</div>
        </div>
        <div className="stat">
          <div className="big">{cardsKnown}/{unlockedTotal}</div>
          <div className="lbl">Mastered flashcards (unlocked)</div>
        </div>
        <div className="stat">
          <div className="big">{scenDone}/{scenTotal}</div>
          <div className="lbl">Scenarios completed</div>
        </div>
        <div className="stat">
          <div className="big">{(S.visits ?? []).length}</div>
          <div className="lbl">Study days logged</div>
        </div>
      </div>

      {weak.length > 0 && (
        <div className="card">
          <b style={{ color: "var(--amber)" }}>Needs review:</b>{" "}
          <span style={{ color: "var(--dim)" }}>{weak.join(" · ")}</span>
        </div>
      )}

      <h3 data-tour="dash-blocks">Blocks</h3>
      {course.blocks.map((b) => {
        const mods = blockMods(course, b.id);
        const bm = mods.filter((m) => modMastered(S, m.id)).length;
        const pct = Math.round((100 * bm) / mods.length);
        const ex = S.exams?.[b.id];
        const rem = blockRemaining(course, S, b.id);
        return (
          <div className="card" key={b.id}>
            <b>{b.name}</b>
            {rem > 0 && <span className="est-block">{fmtMin(rem)} left</span>}{" "}
            {blockMastered(course, S, b.id) && <span className="badge pass">BLOCK MASTERED</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 2px" }}>
              <div className="bar" style={{ flex: 1, margin: 0 }}>
                <i className={bm === mods.length ? "g" : ""} style={{ width: `${pct}%` }} />
              </div>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: bm === mods.length ? "var(--green)" : "var(--dim2)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 34,
                  textAlign: "right",
                }}
              >
                {pct}%
              </span>
            </div>
            <span className="boxtag">
              {bm}/{mods.length} modules mastered · exam:{" "}
              {ex ? (ex.passed ? `passed (${ex.best}%)` : `best ${ex.best}%`) : "not attempted"}
            </span>
            <br />
            <button className="btn ghost" onClick={() => go("mod", mods[0].id)}>Study</button>
            <button className="btn ghost" onClick={() => go("exam", b.id)}>Take exam</button>
          </div>
        );
      })}

      <div className="card" style={{ borderColor: "var(--accent2)" }}>
        <b>How to use this hub</b>
        <ul className="flat">
          <li>
            <Html as="span" html={`<b>Read</b> each module's three tabs — <b>Learn</b> (concepts), <b>Apply</b> (worked example, production checklist, build exercise), <b>Resources</b> (curated, with when-to-use) — then take its <b>quiz</b> (≥${PASS_QUIZ}% to master). Work block by block.`} />
          </li>
          <li>Do the <b>Build it</b> exercise for each module. Quizzes verify understanding; building creates it. The portfolio that results is also your credibility artifact.</li>
          <li>Run <b>flashcards daily</b> — spaced repetition (Leitner boxes) schedules each card at expanding intervals as you get it right.</li>
          <li>Do the <b>scenarios</b> once a block&apos;s modules are mastered — they test production judgment, the senior-level skill.</li>
          <li>Pass the <b>mastery exam</b> (20 questions sampled across the block, ≥{PASS_EXAM}%) to lock in the block.</li>
          <li>
            Progress saves to your account and syncs across devices.{" "}
            <button
              className="btn red"
              style={{ fontSize: 11, padding: "4px 10px" }}
              onClick={() => {
                if (confirm("Reset ALL progress?")) {
                  resetProgress();
                  go("dash");
                }
              }}
            >
              Reset progress
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
