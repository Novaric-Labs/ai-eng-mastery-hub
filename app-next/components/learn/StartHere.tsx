"use client";

import { useCourseStore } from "./StoreProvider";

export default function StartHere() {
  const go = useCourseStore((s) => s.go);
  return (
    <div className="page">
      <h2>Start Here</h2>
      <p className="tagline">
        No AI background needed. Fifteen minutes of orientation, then the curriculum will make sense.
      </p>
      <div className="card" style={{ borderColor: "var(--teal)" }}>
        <b style={{ color: "var(--teal)" }}>What this field actually is</b>
        <p style={{ marginTop: 6 }}>
          Companies like Anthropic, OpenAI, and Google spend months and billions training{" "}
          <b>large language models</b> — programs that predict the next word so well they can write,
          reason, and code. You will never train one. <b>AI engineering is building products on top
          of finished models</b>: you send them text over the internet, get text back, and everything
          else — making answers accurate, fast, affordable, safe, and connected to your data — is your
          job. That &apos;everything else&apos; is exactly what the 21 modules here teach.
        </p>
      </div>
      <h3>The one interaction that underlies everything</h3>
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
      <h3>Your path through this hub</h3>
      <div className="card">
        <ul className="flat checks">
          <li><b>Block 1 (Foundations)</b> teaches the model itself: tokens and cost, writing instructions, managing the window, choosing models. Everything else builds on it.</li>
          <li><b>Block 2 (RAG &amp; Knowledge)</b> connects models to YOUR data — the most common real-world AI product.</li>
          <li><b>Block 3 (Agents &amp; Harnesses)</b> gives models the ability to act, and the machinery that keeps them reliable.</li>
          <li><b>Block 4 (Production &amp; Leadership)</b> is shipping for real: testing, safety, architecture, judgment.</li>
        </ul>
        <p style={{ color: "var(--dim)", fontSize: 13.5 }}>
          Each module starts with an <b style={{ color: "var(--teal)" }}>In plain English</b> box — read
          just those across all 21 modules first if you want a fast aerial view. Any unfamiliar word lives
          in the <b>Glossary</b> (sidebar). When a &apos;How it actually works&apos; section feels deep on a
          first pass, skip it and return after the quiz — the layers are designed for multiple passes.
        </p>
        <p style={{ color: "var(--dim)", fontSize: 13.5 }}>
          Helpful background: basic programming (any language) and what an API is. Not needed: machine
          learning, math, or any prior AI experience.
        </p>
      </div>
      <div className="actionbar">
        <button className="btn" onClick={() => go("mod", "llm")}>Begin Block 1: LLM Fundamentals →</button>
        <button className="btn ghost" onClick={() => go("gloss")}>Browse the glossary</button>
      </div>
    </div>
  );
}
