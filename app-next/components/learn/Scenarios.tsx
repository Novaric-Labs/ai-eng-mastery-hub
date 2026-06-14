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

  if (!course.scenarios) {
    return (
      <div className="page">
        <h2>Scenario Challenges</h2>
        <p className="tagline">Production-judgment challenges across all five blocks.</p>
        <Paywall heading="🔒 Scenarios are part of the full course" />
      </div>
    );
  }

  const grade = (id: string, g: "nailed" | "partial" | "missed") => {
    setScen(id, g);
    setOpen(null);
    setRevealed(false);
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
                    Think it through (out loud or on paper) as if you&apos;re in the room. Then reveal.
                  </p>
                  {!revealed ? (
                    <>
                      <textarea
                        className="scen-note"
                        placeholder="Write your answer here first — retrieval practice is where mastery forms…"
                        value={note}
                        onChange={(e) => setScenNote(s.id, e.target.value)}
                      />
                      <button className="btn" onClick={() => setRevealed(true)}>Reveal model answer</button>
                      <button className="btn ghost" onClick={() => { setOpen(null); setRevealed(false); }}>Close</button>
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
