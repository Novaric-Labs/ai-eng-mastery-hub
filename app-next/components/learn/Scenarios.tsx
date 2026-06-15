"use client";

import { useState } from "react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import Paywall from "./Paywall";

export default function Scenarios() {
  const { course, S, setScen, setScenNote } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    setScen: s.setScen,
    setScenNote: s.setScenNote,
  }));

  const [open, setOpen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [ai, setAi] = useState<{ score: number; summary: string; strengths: string[]; improvements: string[] } | null>(null);

  function resetAi() {
    setAi(null);
    setAiErr(null);
    setGrading(false);
  }

  async function gradeAI(id: string, answer: string) {
    setGrading(true);
    setAi(null);
    setAiErr(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id, answer }),
      });
      const d = await res.json();
      if (!res.ok) setAiErr(d.error || "Couldn't grade that.");
      else setAi(d);
    } catch {
      setAiErr("Network error — try again.");
    } finally {
      setGrading(false);
    }
  }

  if (!course.scenarios) {
    return (
      <div className="page">
        <h2>Scenario Challenges</h2>
        <p className="tagline">Production-judgment challenges across all five blocks.</p>
        <Paywall heading="Scenarios are part of the full course" />
      </div>
    );
  }

  const grade = (id: string, g: "nailed" | "partial" | "missed") => {
    setScen(id, g);
    setOpen(null);
    setRevealed(false);
    resetAi();
  };

  return (
    <div className="page">
      <h2>Scenario Challenges</h2>
      <p className="tagline">
        Production judgment under realistic conditions. Write or speak your answer BEFORE revealing
        the model answer — retrieval practice is where mastery forms. Then self-grade honestly
        against the key points.
      </p>
      {course.blocks.map((b) => (
        <div key={b.id}>
          <h3>{b.name}</h3>
          {course.scenarios!
            .filter((x) => x.block === b.id)
            .map((s) => {
              const g = S.scen?.[s.id];
              if (open !== s.id) {
                return (
                  <div className="card" key={s.id}>
                    <b>{s.title}</b>{" "}
                    {g && (
                      <span className={`badge ${g === "nailed" ? "pass" : "fail"}`}>
                        {g === "nailed" ? "NAILED IT" : g === "partial" ? "PARTIAL" : "MISSED"}
                      </span>
                    )}
                    <p style={{ color: "var(--dim)", fontSize: 13.5, margin: "6px 0" }}>
                      {s.sit.slice(0, 140)}…
                    </p>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        setOpen(s.id);
                        setRevealed(false);
                        resetAi();
                      }}
                    >
                      Open scenario
                    </button>
                  </div>
                );
              }
              const note = S.scennote?.[s.id] ?? "";
              return (
                <div className="card" style={{ borderColor: "var(--accent)" }} key={s.id}>
                  <b>{s.title}</b>
                  <Html className="scenario-sit" style={{ marginTop: 8 }} html={s.sit} />
                  <p>
                    <b style={{ color: "var(--accent2)" }}>Your task:</b> <Html as="span" html={s.task} />
                  </p>
                  <p style={{ color: "var(--dim)", fontSize: 13 }}>
                    Think it through and write your answer first — then grade it to reveal the model answer and AI feedback.
                  </p>
                  {!revealed ? (
                    <>
                      <textarea
                        className="scen-note"
                        placeholder="Write your answer here first — retrieval practice is where mastery forms…"
                        value={note}
                        onChange={(e) => setScenNote(s.id, e.target.value)}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          setRevealed(true);
                          const a = note.trim();
                          if (a) gradeAI(s.id, a);
                        }}
                      >
                        ✨ Grade my answer &amp; reveal
                      </button>
                      <button className="btn ghost" onClick={() => { setOpen(null); setRevealed(false); resetAi(); }}>Close</button>
                      {!note.trim() && (
                        <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 6 }}>
                          Tip: write an answer to get an AI score — or grade to just reveal the model answer.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {note.trim() && (
                        <div className="your-ans">
                          <b>Your answer:</b>
                          <br />
                          {note.split("\n").map((line, i) => (
                            <span key={i}>{line}<br /></span>
                          ))}
                        </div>
                      )}
                      {note.trim() && (
                        <div style={{ margin: "12px 0" }}>
                          {grading && <p style={{ color: "var(--dim)" }}>✨ Grading your answer…</p>}
                          {aiErr && <p style={{ color: "var(--amber)", fontSize: 13.5 }}>{aiErr}</p>}
                          {ai && (
                            <div className="card" style={{ borderColor: "var(--accent2)" }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 30, fontWeight: 700, color: ai.score >= 8 ? "var(--green)" : ai.score >= 5 ? "var(--amber)" : "var(--red)" }}>
                                  {ai.score}/10
                                </span>
                                <span style={{ color: "var(--dim2)" }}>{ai.summary}</span>
                              </div>
                              {ai.strengths.length > 0 && (
                                <>
                                  <h4>What you got right</h4>
                                  <ul className="flat checks">{ai.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul>
                                </>
                              )}
                              {ai.improvements.length > 0 && (
                                <>
                                  <h4>Where to improve</h4>
                                  <ul className="flat">{ai.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul>
                                </>
                              )}
                              <p style={{ color: "var(--faint)", fontSize: 12, marginTop: 8 }}>AI-generated feedback — use your own judgment too.</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="model-ans">
                        <b>Model answer:</b>
                        <br />
                        <Html as="span" html={s.model} />
                      </div>
                      <p><b>Key points to have hit:</b></p>
                      <ul className="flat">
                        {s.pts.map((p, i) => <li key={i}><Html as="span" html={p} /></li>)}
                      </ul>
                      <p style={{ marginTop: 10 }}><b>Self-grade:</b></p>
                      <button className="btn green" onClick={() => grade(s.id, "nailed")}>Nailed it</button>
                      <button className="btn amber" onClick={() => grade(s.id, "partial")}>Partial</button>
                      <button className="btn red" onClick={() => grade(s.id, "missed")}>Missed it</button>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
