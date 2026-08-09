"use client";

import { useCallback, useEffect, useState } from "react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import Paywall from "./Paywall";
import { dueCards, lockedCardCount, masteredCardCount, todayStr, unlockedCards } from "@/lib/course";

type QItem = { c: { m: string; f: string; b: string }; i: number };
type Sess = { knew: number; missed: number; n: number };

export default function Flashcards() {
  const { course, S, gradeCard } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    gradeCard: s.gradeCard,
  }));

  const [queue, setQueue] = useState<QItem[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [sess, setSess] = useState<Sess | null>(null);

  const today = todayStr(new Date());

  function start() {
    const due = dueCards(course, S, today);
    // shuffle
    const q = due.slice();
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q[i], q[j]] = [q[j], q[i]];
    }
    setQueue(q);
    setFlipped(false);
    setSess({ knew: 0, missed: 0, n: 0 });
  }

  // Two answers only. Behind the scenes this still drives the Leitner schedule:
  // "knew it" promotes the card a box (longer interval), "missed" sends it back
  // to the start so it returns soon. The user never has to think about boxes.
  const grade = useCallback(
    (knew: boolean) => {
      const cur = queue[0];
      if (!cur) return;
      gradeCard(cur.i, knew ? 2 : 0, today);
      setSess((p) =>
        p
          ? {
              ...p,
              n: p.n + 1,
              knew: p.knew + (knew ? 1 : 0),
              missed: p.missed + (knew ? 0 : 1),
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
      } else if (flipped && (e.key === "1" || e.key === "x" || e.key === "X")) grade(false);
      else if (flipped && e.key === "2") grade(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue, flipped, grade]);

  if (!course.cards) {
    return (
      <div className="page">
        <h2>Flashcards</h2>
        <p className="tagline">Spaced-repetition flashcards across all 23 modules.</p>
        <Paywall heading="Flashcards are part of the full course" />
      </div>
    );
  }

  const due = dueCards(course, S, today);
  const unlocked = unlockedCards(course, S);
  const locked = lockedCardCount(course, S);
  const totalMods = course.catalog.length;
  const readMods = Object.keys(S.read ?? {}).filter((k) => S.read?.[k]).length;
  const mastered = masteredCardCount(course, S);
  const pct = Math.round((readMods / totalMods) * 100);

  // session summary
  if (sess && !queue.length) {
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
            {tile(sess.knew, "Knew it", "var(--green)")}
            {tile(sess.missed, "Didn't know", "var(--red)")}
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
            {unlocked.length} card{unlocked.length === 1 ? "" : "s"} in rotation · {mastered} mastered
            {locked > 0 && <> · {locked} more added as you progress</>}
          </span>
        </div>
        <div style={{ background: "var(--border)", borderRadius: 4, height: 6 }}>
          <div style={{ background: "var(--green)", borderRadius: 4, height: 6, width: `${pct}%`, transition: "width .3s" }} />
        </div>
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
  const mod = course.catalog.find((m) => m.id === cur.c.m);

  return (
    <div className="page">
      {header}
      <div className="qnum">
        {queue.length} remaining · {mod ? mod.title : cur.c.m}
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
        <button className="btn red" onClick={() => grade(false)}>
          Didn&apos;t know <span className="kbd">1</span>
        </button>
        <button className="btn green" onClick={() => grade(true)}>
          Knew it <span className="kbd">2</span>
        </button>
      </div>
    </div>
  );
}
