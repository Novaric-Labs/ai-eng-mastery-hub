"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";
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

export default function Flashcards() {
  const { course, S, go, gradeCard } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    go: s.go,
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
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13.5 }}>
          <span style={{ fontWeight: 600 }}>Unlock progress</span>
          <span style={{ color: "var(--dim)" }}>
            {readMods}/{totalMods} modules read · {unlocked.length} cards unlocked
            {locked > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--amber)" }}> · <Lock size={12} strokeWidth={1.75} /> {locked} locked</span>}
          </span>
        </div>
        <div style={{ background: "var(--border)", borderRadius: 4, height: 6 }}>
          <div style={{ background: "var(--green)", borderRadius: 4, height: 6, width: `${pct}%`, transition: "width .3s" }} />
        </div>
      </div>
      <div className="statgrid">
        {boxes.map((n, b) => (
          <div className="stat" key={b}>
            <div className="big">{n}</div>
            <div className="lbl">Box {b + 1}{b === 3 ? " (mastered)" : ""}</div>
          </div>
        ))}
      </div>
    </>
  );

  if (!queue.length) {
    return (
      <div className="page">
        {header}
        {unlocked.length === 0 ? (
          <div className="card">
            <b>No cards unlocked yet.</b>
            <br />
            <span style={{ color: "var(--dim)" }}>
              Mark a module as read on its Learn tab to unlock its flashcards.
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
          <div className="card" style={{ marginTop: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, marginBottom: 8 }}><Lock size={15} strokeWidth={1.75} /> Locked modules — read to unlock cards</div>
            {course.catalog
              .filter((m) => !S.read?.[m.id])
              .map((m) => (
                <button
                  key={m.id}
                  className="btn"
                  style={{ margin: "3px 4px", padding: "4px 12px", fontSize: 12 }}
                  onClick={() => go("mod", m.id)}
                >
                  {m.title}
                </button>
              ))}
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
