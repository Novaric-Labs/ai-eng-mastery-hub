"use client";

import { useCallback, useEffect, useState } from "react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import Paywall from "./Paywall";
import {
  cardState,
  dueCards,
  lockedCardCount,
  unlockedCards,
} from "@/lib/course";

type QItem = { c: { m: string; f: string; b: string }; i: number };
type Sess = { again: number; hard: number; good: number; easy: number; n: number; done: boolean };

// Leitner boxes 1–4. Each box reviews on a wider interval (see INTERVALS in
// lib/course): new cards start in Box 1 and climb to Box 4 as you get them right.
const BOX_META = [
  { label: "New", color: "var(--red)", note: "seen daily" },
  { label: "Learning", color: "var(--amber)", note: "~1 day apart" },
  { label: "Familiar", color: "var(--teal)", note: "~3 days apart" },
  { label: "Mastered", color: "var(--green)", note: "~7 days apart" },
];

export default function Flashcards() {
  const { course, S, gradeCard } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    gradeCard: s.gradeCard,
  }));

  const [queue, setQueue] = useState<QItem[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [sess, setSess] = useState<Sess | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const start = useCallback(() => {
    const due = dueCards(course, S, today);
    // shuffle
    const q = due.slice();
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q[i], q[j]] = [q[j], q[i]];
    }
    setQueue(q);
    setFlipped(false);
    setSess({ again: 0, hard: 0, good: 0, easy: 0, n: 0, done: false });
  }, [course, S, today]);

  const grade = useCallback(
    (grade: number) => {
      const cur = queue[0];
      if (!cur) return;
      gradeCard(cur.i, grade, today);
      setSess((p) =>
        p
          ? {
              ...p,
              n: p.n + 1,
              [(["again", "hard", "good", "easy"] as const)[grade]]:
                p[(["again", "hard", "good", "easy"] as const)[grade]] + 1,
              done: queue.length === 1,
            }
          : p,
      );
      setQueue((q) => q.slice(1));
      setFlipped(false);
    },
    [queue, gradeCard, today],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!queue.length) return;
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "1" && flipped) grade(0);
      else if (e.key === "2" && flipped) grade(1);
      else if ((e.key === "3" || e.key === "g" || e.key === "G") && flipped) grade(2);
      else if ((e.key === "4" || e.key === "e" || e.key === "E") && flipped) grade(3);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue, flipped, grade]);

  if (!course.cards) {
    return (
      <div className="page">
        <h2>Flashcards</h2>
        <p className="tagline">Spaced-repetition flashcards across all 21 modules.</p>
        <Paywall heading="Flashcards are part of the full course" />
      </div>
    );
  }

  const due = dueCards(course, S, today);
  const unlocked = unlockedCards(course, S);
  const locked = lockedCardCount(course, S);
  const totalMods = course.catalog.length;
  const readMods = Object.keys(S.read ?? {}).filter((k) => S.read?.[k]).length;
  const boxes = [0, 0, 0, 0];
  unlocked.forEach((c) => {
    const gi = course.cards!.indexOf(c);
    boxes[cardState(S, gi, today).box]++;
  });
  const pct = Math.round((readMods / totalMods) * 100);

  // session summary
  if (sess && sess.done && !queue.length) {
    const tile = (n: number, l: string, c: string) => (
      <div className="stat">
        <div className="big" style={{ color: c }}>{n}</div>
        <div className="lbl">{l}</div>
      </div>
    );
    const more = due.length;
    return (
      <div className="page">
        <h2>Flashcards</h2>
        <div className="card" style={{ borderColor: "var(--green)", textAlign: "center", padding: 26 }}>
          <div style={{ fontSize: 34, lineHeight: 1 }}>✅</div>
          <b style={{ fontSize: 18, display: "block", marginTop: 6 }}>Session complete</b>
          <p style={{ color: "var(--dim)" }}>Reviewed {sess.n} card{sess.n !== 1 ? "s" : ""}</p>
          <div className="statgrid" style={{ margin: "12px 0" }}>
            {tile(sess.again, "Again", "var(--red)")}
            {tile(sess.hard, "Hard", "var(--amber)")}
            {tile(sess.good, "Good", "var(--green)")}
            {tile(sess.easy, "Easy", "#6464f0")}
          </div>
          <button className="btn ghost" onClick={() => setSess(null)}>Done</button>
          {more > 0 && (
            <button className="btn green" onClick={start}>Review {more} more</button>
          )}
        </div>
      </div>
    );
  }

  const header = (
    <>
      <h2>Flashcards</h2>
      <div data-tour="cards-progress" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13.5 }}>
          <span style={{ fontWeight: 600 }}>Your deck</span>
          <span style={{ color: "var(--dim)" }}>
            {unlocked.length} card{unlocked.length === 1 ? "" : "s"} in rotation
            {locked > 0 && <> · {locked} more added as you progress</>}
          </span>
        </div>
        <div style={{ background: "var(--border)", borderRadius: 4, height: 6 }}>
          <div style={{ background: "var(--green)", borderRadius: 4, height: 6, width: `${pct}%`, transition: "width .3s" }} />
        </div>
      </div>
      <div className="statgrid" data-tour="cards-boxes">
        {boxes.map((n, b) => {
          const meta = BOX_META[b];
          return (
            <div className="stat" key={b} style={{ borderLeft: `3px solid ${meta.color}` }}>
              <div className="big" style={{ color: meta.color }}>{n}</div>
              <div className="lbl" style={{ fontWeight: 600, color: "var(--dim2)" }}>
                Box {b + 1} · {meta.label}
              </div>
              <div className="lbl">{meta.note}</div>
            </div>
          );
        })}
      </div>
    </>
  );

  if (!queue.length) {
    return (
      <div className="page">
        {header}
        {unlocked.length === 0 ? (
          <div className="card">
            <b>No cards in your deck yet.</b>
            <br />
            <span style={{ color: "var(--dim)" }}>
              Read a module and mark it read on its Learn tab — its flashcards are
              added to your deck automatically.
            </span>
          </div>
        ) : due.length ? (
          <>
            <div className="card">{due.length} card(s) due for review.</div>
            <button className="btn" onClick={start}>Start session</button>
          </>
        ) : (
          <div className="card" style={{ borderColor: "var(--green)" }}>
            <b style={{ color: "var(--green)" }}>All caught up.</b> No cards due today — come back
            tomorrow. Spacing is the point: recall is strengthened by the gap.
          </div>
        )}
        {locked > 0 && (
          <div className="card" style={{ marginTop: 12, padding: "12px 14px", color: "var(--dim)", fontSize: 13.5 }}>
            <b style={{ color: "var(--text)" }}>Your deck keeps growing.</b> As you
            progress through the course, more flashcards are added automatically —
            and cards rotate back in periodically to keep testing your recall over time.
          </div>
        )}
      </div>
    );
  }

  const cur = queue[0];
  const st = cardState(S, cur.i, today);
  const mod = course.catalog.find((m) => m.id === cur.c.m);

  return (
    <div className="page">
      {header}
      <div className="qnum">
        {queue.length} remaining · {mod ? mod.title : cur.c.m} · box {st.box + 1}
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard (Space or Enter)"
        className={`flipwrap${flipped ? " flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flipinner">
          <div className="face front">
            <div>
              <Html as="span" html={cur.c.f} />
              <br />
              <span className="boxtag" style={{ display: "inline", margin: 0 }}>
                click or press <span className="kbd">Space</span> to flip
              </span>
            </div>
          </div>
          <div className="face back">
            <Html as="div" html={cur.c.b} />
          </div>
        </div>
      </div>
      <div id="gradebtns" style={{ visibility: flipped ? "visible" : "hidden" }}>
        <button className="btn red" onClick={() => grade(0)}>Again <span className="kbd">1</span></button>
        <button className="btn" style={{ background: "var(--amber)", color: "#000" }} onClick={() => grade(1)}>
          Hard <span className="kbd">2</span>
        </button>
        <button className="btn green" onClick={() => grade(2)}>Good <span className="kbd">3</span></button>
        <button className="btn" style={{ background: "#6464f0", color: "#fff" }} onClick={() => grade(3)}>
          Easy <span className="kbd">4</span>
        </button>
      </div>
    </div>
  );
}
