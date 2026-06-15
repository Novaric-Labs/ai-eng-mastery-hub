"use client";

import { Check } from "lucide-react";
import { useCourseStore } from "./StoreProvider";
import Paywall from "./Paywall";
import { PASS_EXAM, PASS_QUIZ, blockMods, modMastered } from "@/lib/course";

export default function ExamPage({ bid }: { bid: string }) {
  const { course, S, startExam } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    startExam: s.startExam,
  }));

  const b = course.blocks.find((x) => x.id === bid);
  if (!b) return <div className="page"><h2>Exam not found</h2></div>;

  const mods = blockMods(course, bid);
  const ready = mods.every((m) => modMastered(S, m.id));
  const ex = S.exams?.[bid];
  const unlocked = mods.every((m) => !!course.quizzes[m.id]?.length);

  return (
    <div className="page">
      <h2>{b.name} — Mastery Exam</h2>
      <p className="tagline">
        20 questions sampled across all {mods.length} modules. Pass at ≥{PASS_EXAM}% to lock in the block.
      </p>
      <div className="card">
        <b>Modules covered</b>
        <ul className="flat">
          {mods.map((m) => (
            <li key={m.id}>
              {m.title}{" "}
              {modMastered(S, m.id) ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--green)" }}><Check size={13} strokeWidth={2} /> mastered</span>
              ) : (
                <span style={{ color: "var(--amber)" }}>not yet mastered</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {ex && (
        <div className="card">
          Best score:{" "}
          <b style={{ color: ex.passed ? "var(--green)" : "var(--amber)" }}>{ex.best}%</b> over{" "}
          {ex.attempts} attempt(s){" "}
          {ex.passed && <span className="badge pass">PASSED</span>}
        </div>
      )}
      {!unlocked ? (
        <Paywall heading="The mastery exam is part of the full course" />
      ) : (
        <>
          {!ready && (
            <div className="card" style={{ borderColor: "var(--amber)" }}>
              <b style={{ color: "var(--amber)" }}>Recommended:</b> master all {mods.length} modules first
              (read + quiz ≥{PASS_QUIZ}%). You can attempt the exam anyway — it&apos;s your study system.
            </div>
          )}
          <button className="btn" onClick={() => startExam(bid)}>Start exam</button>
        </>
      )}
    </div>
  );
}
