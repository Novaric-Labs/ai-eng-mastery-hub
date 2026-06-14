"use client";

import { useState } from "react";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";

export default function Glossary() {
  const { course, go } = useCourseStore((s) => ({ course: s.course, go: s.go }));
  const [f, setF] = useState("");

  const q = f.toLowerCase();
  const hits = course.glossary.filter(
    (g) => !q || g[0].toLowerCase().includes(q) || g[1].toLowerCase().includes(q),
  );

  return (
    <div className="page">
      <h2>Glossary</h2>
      <p className="tagline">
        {course.glossary.length} terms in plain English. Click a term&apos;s module to see it in depth.
      </p>
      <input
        placeholder="Type to filter… (e.g. 'token', 'agent', 'rag')"
        value={f}
        onChange={(e) => setF(e.target.value)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)",
          background: "var(--bg2)", color: "var(--text)", fontSize: 14.5, marginBottom: 16, outline: "none",
        }}
      />
      <div>
        {hits.length === 0 ? (
          <div className="card" style={{ color: "var(--dim)" }}>No matches — try a shorter fragment.</div>
        ) : (
          hits.map((g) => {
            const m = course.catalog.find((x) => x.id === g[2]);
            return (
              <div className="res-item" key={g[0]}>
                <b style={{ color: "var(--text)" }}>{g[0]}</b>
                <span className="when">
                  <Html as="span" html={g[1]} />
                  {m && (
                    <>
                      {" "}
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); go("mod", g[2]); }}
                        style={{ color: "var(--accent)" }}
                      >
                        → {m.title}
                      </a>
                    </>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
