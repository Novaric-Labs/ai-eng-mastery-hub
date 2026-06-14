"use client";

import { useEffect, useState } from "react";

// Listens for `aihub:celebrate` events (dispatched by `celebrate()`) and shows a
// toast + confetti, respecting prefers-reduced-motion. Mounted once by LearnApp.
type Toast = { id: number; msg: string };
type Burst = { id: number };

export default function Celebrate() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seq = 0;
    function onCelebrate(e: Event) {
      const { msg, big } = (e as CustomEvent).detail as { msg: string; big?: boolean };
      const id = ++seq;
      setToasts((t) => [...t, { id, msg }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
      if (!reduce) {
        setBursts((b) => [...b, { id }]);
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 3200);
        if (big) {
          const id2 = ++seq;
          setTimeout(() => {
            setBursts((b) => [...b, { id: id2 }]);
            setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id2)), 3200);
          }, 180);
        }
      }
    }
    window.addEventListener("aihub:celebrate", onCelebrate);
    return () => window.removeEventListener("aihub:celebrate", onCelebrate);
  }, []);

  const cols = ["#58a6ff", "#bc8cff", "#3fb950", "#d29922", "#39c5cf", "#f85149"];

  return (
    <>
      {toasts.map((t) => (
        <div key={t.id} className="toast show" role="status">
          {t.msg}
        </div>
      ))}
      {bursts.map((b) => (
        <div key={b.id} className="confetti" aria-hidden>
          {Array.from({ length: 90 }, (_, i) => (
            <i
              key={i}
              style={{
                left: ((i * 37) % 100) + "vw",
                background: cols[i % cols.length],
                animationDelay: ((i % 7) * 0.035).toFixed(2) + "s",
                animationDuration: (1.6 + (i % 11) * 0.1).toFixed(2) + "s",
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}
