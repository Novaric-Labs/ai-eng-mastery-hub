"use client";

import { useCourseStore } from "./StoreProvider";
import Html from "./Html";
import { learnLabelsFor } from "@/lib/learn-labels";

export default function StartHere() {
  const { courseSlug, go } = useCourseStore((s) => ({
    courseSlug: s.courseSlug,
    go: s.go,
  }));
  const L = learnLabelsFor(courseSlug);
  return (
    <div className="page">
      <h2>Start Here</h2>
      <p className="tagline">{L.startTagline}</p>
      <div className="card" style={{ borderColor: "var(--teal)" }}>
        <b style={{ color: "var(--teal)" }}>{L.startWhatTitle}</b>
        <Html as="p" style={{ marginTop: 6 }} html={L.startWhatBody} />
      </div>
      <h3>{L.startInteractionTitle}</h3>
      <div className="card">
        <p>Every AI feature you&apos;ve ever used reduces to this exchange, repeated:</p>
        <p style={{ background: "var(--bg3)", borderRadius: 8, padding: "12px 16px", fontFamily: "ui-monospace,monospace", fontSize: 13 }}>
          YOU SEND → &quot;You are a helpful support agent for Acme Corp. [rules…] Customer asks: Where is my order #4521?&quot;
          <br /><br />
          MODEL RETURNS → &quot;Let me help you track order #4521…&quot;
        </p>
        <p>
          That&apos;s it. No memory between calls (you re-send the conversation every time), no internet
          access (unless you build it), no actions (unless you wire them up). The model is a brilliant
          text-completion engine, and the product is everything you construct around it.
        </p>
        <ul className="flat">
          <li><b>Tokens</b> — the model reads and writes in word-chunks (~¾ of a word each). You pay per token, limits are in tokens, speed is in tokens/second. It&apos;s the metric of everything.</li>
          <li><b>The context window</b> — the maximum text per call: the model&apos;s desk. If it&apos;s not on the desk right now, the model doesn&apos;t know it.</li>
          <li><b>Probabilistic</b> — the same question can get different answers. This breaks normal testing, which is why this field invented its own (evals).</li>
        </ul>
      </div>
      <h3>The cast of characters</h3>
      <div className="card">
        <ul className="flat">
          <li><b>Products vs models:</b> ChatGPT, Claude.ai, and Gemini are apps. Underneath are models (GPT-5.5, Claude Opus 4.8, Gemini 3.1 Pro) that you can also call directly via API — that&apos;s what you&apos;ll do.</li>
          <li><b>Model tiers:</b> every provider sells a cheap-fast model, a mid workhorse, and an expensive flagship. Picking the right tier per task is a core skill (and a 10–50× cost lever).</li>
          <li><b>Open weights:</b> some models (Llama, DeepSeek, Qwen) are downloadable to run on your own hardware. Cheaper at huge scale, much more work.</li>
          <li><b>The big shifts of 2025–26:</b> models became commodities that leapfrog quarterly; the differentiators moved to the scaffolding — context management, agents, harnesses, evals. That&apos;s why this curriculum spends most of its time there.</li>
        </ul>
      </div>
      <h3>{L.startPathTitle}</h3>
      <div className="card">
        <ul className="flat checks">
          {L.startPathItems.map((html, i) => (
            <li key={i}><Html as="span" html={html} /></li>
          ))}
        </ul>
        <Html as="p" style={{ color: "var(--dim)", fontSize: 13.5 }} html={L.startPathNote} />
        <p style={{ color: "var(--dim)", fontSize: 13.5 }}>
          Helpful background: basic programming (any language) and what an API is. Not needed: machine
          learning, math, or any prior AI experience.
        </p>
      </div>
      <div className="actionbar">
        <button className="btn" onClick={() => go("mod", L.startBeginMod)}>{L.startBeginBtn}</button>
        <button className="btn ghost" onClick={() => go("gloss")}>Browse the glossary</button>
      </div>
    </div>
  );
}
