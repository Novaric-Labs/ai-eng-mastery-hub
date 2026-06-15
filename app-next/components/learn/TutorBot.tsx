"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { useCourseStore } from "./StoreProvider";

type Turn = { role: "user" | "assistant"; content: string };

// Floating, course-scoped AI tutor. Entitled-only (also enforced server-side).
export default function TutorBot() {
  const entitled = useCourseStore((s) => s.entitled);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [turns, busy, open]);

  if (!entitled) return null;

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: q }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: turns.slice(-6) }),
      });
      const d = await res.json();
      setTurns([...next, { role: "assistant", content: res.ok ? d.answer : d.error || "Sorry, something went wrong." }]);
    } catch {
      setTurns([...next, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="tutor-fab" onClick={() => setOpen(true)} aria-label="Ask the AI tutor">
        <Sparkles size={22} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div className="tutor-panel" role="dialog" aria-label="AI tutor">
      <div className="tutor-head">
        <span><Sparkles size={15} strokeWidth={2} style={{ color: "var(--accent)", verticalAlign: "-2px" }} /> <b>AI Tutor</b></span>
        <button onClick={() => setOpen(false)} aria-label="Close tutor"><X size={18} /></button>
      </div>
      <div className="tutor-body" ref={bodyRef}>
        {turns.length === 0 && (
          <p className="tutor-hint">
            Ask anything about the course — LLMs, RAG, agents, evals, production engineering… I only answer
            on course topics.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`tutor-msg ${t.role}`}>{t.content}</div>
        ))}
        {busy && <div className="tutor-msg assistant tutor-typing">Thinking…</div>}
      </div>
      <div className="tutor-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask the tutor…"
          rows={1}
        />
        <button className="btn" disabled={busy || !input.trim()} onClick={send} aria-label="Send">
          <Send size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
