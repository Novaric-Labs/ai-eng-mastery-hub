"use client";

import { useEffect, useRef, useState } from "react";

// Sticky in-page nav for the module Learn tab, with scroll-spy (audit 2.3 parity).
export default function SectionRail({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    function spy() {
      const ht = window.innerHeight * 0.33;
      let cur = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= ht) cur = s.id;
      }
      setActive(cur);
    }
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        spy();
        raf.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    spy();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav className="sec-rail" aria-label="Module sections">
      {sections.map((s) => (
        <button
          key={s.id}
          className={`sr-item${active === s.id ? " sr-active" : ""}`}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
