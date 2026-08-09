"use client";

import { useState } from "react";
import { Check, Clock, Wrench, Flag, ChevronDown, Copy } from "lucide-react";
import type { Lab } from "@/lib/course";
import { useCourseStore } from "./StoreProvider";
import Html from "./Html";

// Guided lab: the module's build exercise as a checkpointed, stepped walk
// instead of a one-paragraph dare. Every step pairs code with the exact
// output that proves it worked (`check`) and the concept it just taught
// (`why`) — the teaching lives inside the doing. Step completion persists to
// progress (S.labs) like any other study action.
export default function LabView({ modId, lab }: { modId: string; lab: Lab }) {
  const done = useCourseStore((s) => s.S.labs?.[modId] ?? {});
  const toggle = useCourseStore((s) => s.toggleLabStep);
  const [copied, setCopied] = useState(false);

  const total = lab.steps.length;
  const nDone = lab.steps.filter((_, i) => done[i]).length;

  const copyStarter = () => {
    void navigator.clipboard?.writeText(lab.starter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="labbox">
      <div className="lab-head">
        <b>Guided lab — </b>
        <Html as="span" html={lab.goal} />
        <div className="lab-meta">
          <span><Clock size={13} strokeWidth={2} /> {lab.time}</span>
          <span><Wrench size={13} strokeWidth={2} /> <Html as="span" html={lab.needs} /></span>
          <span className="lab-progress">
            <Check size={13} strokeWidth={2.5} /> {nDone}/{total} steps
          </span>
        </div>
      </div>

      <h4 className="lab-h">
        {(lab.lang ?? "python") === "python"
          ? "Starter — runs as-is, before you change anything"
          : "Template — copy it, then work through the steps"}
      </h4>
      <div className="lab-starter">
        <button className="lab-copy" onClick={copyStarter} type="button">
          <Copy size={12} strokeWidth={2} /> {copied ? "Copied" : "Copy"}
        </button>
        <pre className="codeblock">{lab.starter}</pre>
      </div>

      <h4 className="lab-h">Steps — check each off as its checkpoint passes</h4>
      <ol className="lab-steps">
        {lab.steps.map((st, i) => (
          <li key={i} className={done[i] ? "done" : undefined}>
            <label className="lab-step-row">
              <input
                type="checkbox"
                checked={!!done[i]}
                onChange={() => toggle(modId, i)}
                aria-label={`Mark step ${i + 1} complete`}
              />
              <Html as="span" className="lab-do" html={st.do} />
            </label>
            {st.code && <pre className="codeblock lab-code">{st.code}</pre>}
            <p className="lab-check">
              <b>Checkpoint:</b> <Html as="span" html={st.check} />
            </p>
            <p className="lab-why">
              <b>Why this works:</b> <Html as="span" html={st.why} />
            </p>
            {st.hint && (
              <details className="lab-hint">
                <summary><ChevronDown size={12} strokeWidth={2} /> Stuck? Hint</summary>
                <Html as="p" html={st.hint} />
              </details>
            )}
          </li>
        ))}
      </ol>

      <div className="lab-done">
        <b><Flag size={13} strokeWidth={2} /> Done when — </b>
        <Html as="span" html={lab.done} />
      </div>
      {lab.stretch && (
        <p className="lab-stretch">
          <b>Stretch:</b> <Html as="span" html={lab.stretch} />
        </p>
      )}
    </div>
  );
}
