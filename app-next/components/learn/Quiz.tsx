"use client";

import { useEffect, useRef, useState } from "react";
import { Rocket } from "lucide-react";
import { useCourseStore, celebrate } from "./StoreProvider";
import Html from "./Html";
import { PASS_EXAM, PASS_QUIZ, blockMastered } from "@/lib/course";
import { runScore } from "@/lib/store";

// Per-question AI feedback for wrong EXAM answers: why your pick was wrong and
// why the correct one is right. Keyed by question index for the current run.
type AiExp = { loading: boolean; text?: string; failed?: boolean };

export default function Quiz() {
  const { course, courseSlug, S, Q, pick, nextQ, startQuiz, startExam, go } = useCourseStore((s) => ({
    course: s.course,
    courseSlug: s.courseSlug,
    S: s.S,
    Q: s.Q,
    pick: s.pick,
    nextQ: s.nextQ,
    startQuiz: s.startQuiz,
    startExam: s.startExam,
    go: s.go,
  }));

  // AI "why" feedback, only fetched for wrong answers during an exam.
  const [aiExp, setAiExp] = useState<Record<number, AiExp>>({});
  // Reset the cache whenever a new run starts (new id/mode or back to question 0).
  const runKey = Q ? `${Q.mode}:${Q.id}:${Q.items.length}` : "";
  const lastRun = useRef(runKey);
  if (runKey !== lastRun.current) {
    lastRun.current = runKey;
    if (Object.keys(aiExp).length) setAiExp({});
  }

  useEffect(() => {
    if (!Q || Q.done || Q.mode !== "exam") return;
    const idx = Q.i;
    const it = Q.items[idx];
    if (!it || it.sel === null || it.sel === it.a) return;
    if (aiExp[idx]) return; // already fetching/fetched for this question
    setAiExp((m) => ({ ...m, [idx]: { loading: true } }));
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: courseSlug,
        question: it.q,
        options: it.o,
        correctIndex: it.a,
        chosenIndex: it.sel,
      }),
    })
      .then((r) => r.json())
      .then((d) =>
        setAiExp((m) => ({ ...m, [idx]: { loading: false, text: d.explanation || undefined, failed: !d.explanation } })),
      )
      .catch(() => setAiExp((m) => ({ ...m, [idx]: { loading: false, failed: true } })));
  }, [Q, aiExp, courseSlug]);

  // keyboard: A–D / 1–9 to answer, Enter/Space to advance
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!Q || Q.done) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      const it = Q.items[Q.i];
      if (!it) return;
      let n = -1;
      if (/^[1-9]$/.test(e.key)) n = +e.key - 1;
      else if (/^[a-z]$/i.test(e.key)) n = e.key.toLowerCase().charCodeAt(0) - 97;
      if (n >= 0 && n < it.o.length && it.sel === null) {
        e.preventDefault();
        pick(n);
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && it.sel !== null) {
        e.preventDefault();
        nextQ();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [Q, pick, nextQ]);

  // celebrate exactly once when a run finishes as a pass
  const celebrated = useRef(false);
  useEffect(() => {
    if (!Q) return;
    if (!Q.done) {
      celebrated.current = false;
      return;
    }
    if (celebrated.current) return;
    celebrated.current = true;
    const score = runScore(Q);
    if (Q.mode === "quiz" && score >= PASS_QUIZ) celebrate("Liftoff — quiz passed at " + score + "% 🚀");
    else if (Q.mode === "exam" && score >= PASS_EXAM) {
      const blk = blockMastered(course, S, Q.id);
      celebrate(blk ? "Block mastered — another system charted! 🌟" : "Exam passed — " + score + "% 🚀", blk);
    }
  }, [Q, course, S]);

  if (!Q) return null;

  const title =
    Q.mode === "quiz"
      ? (course.catalog.find((m) => m.id === Q.id)?.title ?? "") + " — Quiz"
      : (course.blocks.find((b) => b.id === Q.id)?.name ?? "") + " — Mastery Exam";

  if (Q.done) {
    const correct = Q.items.filter((x) => x.sel === x.a).length;
    const score = runScore(Q);
    const pass = Q.mode === "quiz" ? score >= PASS_QUIZ : score >= PASS_EXAM;
    const missed = Q.items.filter((x) => x.sel !== x.a);
    return (
      <div className="page">
        <h2>{title}</h2>
        <div className={`card${pass ? " quizresult-pass" : ""}`} style={{ textAlign: "center", padding: 28 }}>
          {pass && <span className="stars" aria-hidden />}
          {pass && (
            <div className="quizresult-liftoff">
              <Rocket size={26} strokeWidth={1.75} style={{ transform: "rotate(45deg)" }} />
            </div>
          )}
          <div style={{ position: "relative", fontSize: 42, fontWeight: 700, color: pass ? "var(--green)" : "var(--red)" }}>
            {score}%
          </div>
          <p style={{ position: "relative" }}>
            {correct}/{Q.items.length} correct{" "}
            {pass ? (
              <span className="badge pass">
                {Q.mode === "quiz" ? "LIFTOFF — QUIZ PASSED" : "EXAM PASSED — BLOCK LOCKED IN"}
              </span>
            ) : (
              <span className="badge fail">
                BELOW {Q.mode === "quiz" ? PASS_QUIZ : PASS_EXAM}% — REVIEW &amp; RETRY
              </span>
            )}
          </p>
          <button className="btn" onClick={() => (Q.mode === "quiz" ? startQuiz(Q.id) : startExam(Q.id))}>
            Retake
          </button>
          {Q.mode === "quiz" && (
            <button className="btn ghost" onClick={() => go("mod", Q.id)}>Back to module</button>
          )}
          <button className="btn ghost" onClick={() => go("dash")}>Dashboard</button>
        </div>
        {missed.length > 0 && (
          <>
            <h3>Review missed questions</h3>
            {Q.items.map((it, n) =>
              it.sel !== it.a ? (
                <div className="card" key={n}>
                  <div className="qtext">
                    {n + 1}. <Html as="span" html={it.q} />
                  </div>
                  <p style={{ color: "var(--red)", fontSize: 13.5 }}>
                    Your answer: {it.sel === null ? "—" : <Html as="span" html={it.o[it.sel]} />}
                  </p>
                  <p style={{ color: "var(--green)", fontSize: 13.5 }}>
                    Correct: <Html as="span" html={it.o[it.a]} />
                  </p>
                  <Html className="exp" html={aiExp[n]?.text ?? it.exp} />
                </div>
              ) : null,
            )}
          </>
        )}
      </div>
    );
  }

  const it = Q.items[Q.i];
  const answered = it.sel !== null;
  const corr = Q.items.filter((x, idx) => idx <= Q.i && x.sel === x.a).length;

  return (
    <div className="page">
      <h2>{title}</h2>
      <div className="qnum">Question {Q.i + 1} of {Q.items.length}</div>
      <div className="bar">
        <i style={{ width: `${(100 * Q.i) / Q.items.length}%` }} />
      </div>
      <div className="qhint">
        Keys <span className="kbd">A</span>–<span className="kbd">D</span> or{" "}
        <span className="kbd">1</span>–<span className="kbd">4</span> to answer ·{" "}
        <span className="kbd">Enter</span> next ·{" "}
        <b style={{ color: "var(--green)" }}>✓ {corr}</b> correct so far
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <Html className="qtext" html={it.q} />
        {it.o.map((o, n) => {
          let cls = "opt";
          if (answered) {
            if (n === it.a) cls += " right";
            else if (n === it.sel) cls += " wrong";
          }
          return (
            <button className={cls} key={n} onClick={() => pick(n)}>
              <span className="chip">{String.fromCharCode(65 + n)}</span>
              <Html as="span" html={o} />
            </button>
          );
        })}
        {answered && (
          <>
            <div className="exp">
              {it.sel === it.a ? (
                <>✓ Correct. <Html as="span" html={it.exp} /></>
              ) : Q.mode === "exam" && aiExp[Q.i]?.loading ? (
                <>✗ <span style={{ opacity: 0.7 }}>Looking at why…</span></>
              ) : Q.mode === "exam" && aiExp[Q.i]?.text ? (
                <>✗ <Html as="span" html={aiExp[Q.i].text!} /></>
              ) : (
                // Quizzes, or exam fallback if the AI explanation failed.
                <>✗ <Html as="span" html={it.exp} /></>
              )}
            </div>
            <button className="btn" onClick={() => nextQ()}>
              {Q.i === Q.items.length - 1 ? "Finish" : "Next →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
