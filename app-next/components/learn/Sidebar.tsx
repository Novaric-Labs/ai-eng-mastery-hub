"use client";

import { useState } from "react";
import {
  Sparkles,
  BookA,
  LayoutDashboard,
  Route,
  Layers,
  Puzzle,
  GraduationCap,
  Lock,
  Sun,
  Moon,
  LogOut,
  Flame,
  Unlock,
  ChevronDown,
} from "lucide-react";
import NovaMark from "@/components/NovaMark";
import RedeemDialog from "./RedeemDialog";
import { useCourseStore } from "./StoreProvider";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  blockMastered,
  blockMods,
  currentStreak,
  dueCards,
  levelInfo,
  modMastered,
  moduleUnlocked,
} from "@/lib/course";

export default function Sidebar() {
  const { course, S, route, entitled, go, theme, toggleTheme } = useCourseStore((s) => ({
    course: s.course,
    S: s.S,
    route: s.route,
    entitled: s.entitled,
    go: s.go,
    theme: s.theme,
    toggleTheme: s.toggleTheme,
  }));
  const [busy, setBusy] = useState(false);

  async function buy() {
    setBusy(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const d = await res.json();
    if (d.url) location.href = d.url;
    else { setBusy(false); alert("Checkout error: " + (d.error ?? "unknown")); }
  }
  async function signOut() {
    await supabaseBrowser().auth.signOut();
    location.href = "/";
  }

  const today = new Date().toISOString().slice(0, 10);
  const mTot = course.catalog.length;
  const mDone = course.catalog.filter((m) => modMastered(S, m.id)).length;
  const due = dueCards(course, S, today).length;
  const li = levelInfo(course, S);
  const streak = currentStreak(S, new Date());

  const nav = (page: typeof route.page, arg?: string) =>
    `navbtn${route.page === page && route.arg === arg ? " active" : ""}`;
  const navP = (page: typeof route.page) =>
    `navbtn${route.page === page ? " active" : ""}`;

  // Collapsible sidebar blocks (default expanded; collapse state is per-session).
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleBlock = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      <h1 className="brand">
        <NovaMark size={19} className="brand-mark" />
        <span className="brand-word">Novacademy</span>
      </h1>
      <div className="sub">AI Engineering · 2026 Edition</div>

      <div className="sideprog">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="bar" style={{ flex: 1, margin: 0 }}>
            <i className={mDone === mTot ? "g" : ""} style={{ width: `${Math.round((100 * mDone) / mTot)}%` }} />
          </div>
          <span style={{ fontWeight: 600, color: mDone === mTot ? "var(--green)" : "var(--dim2)", fontVariantNumeric: "tabular-nums" }}>
            {Math.round((100 * mDone) / mTot)}%
          </span>
        </div>
        <div style={{ marginTop: 4 }}>{mDone}/{mTot} modules mastered</div>
      </div>

      <div className="xpbar">
        <span className="streak" title="Day streak"><Flame size={13} strokeWidth={1.75} /> {streak}</span>
        <span className="lvl">Lv {li.lvl}</span>
        <div className="xptrack">
          <i style={{ width: `${li.pct}%` }} />
        </div>
        <span className="xptxt">
          {li.into} / {li.need} XP
        </span>
      </div>

      <button className="themebtn" type="button" onClick={toggleTheme}>
        {theme === "dark" ? <Sun size={14} strokeWidth={1.75} /> : <Moon size={14} strokeWidth={1.75} />}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <button className={navP("start")} onClick={() => go("start")}><Sparkles size={16} strokeWidth={1.75} /> Start Here</button>
      <button className={navP("gloss")} onClick={() => go("gloss")}><BookA size={16} strokeWidth={1.75} /> Glossary</button>
      <button className={navP("dash")} onClick={() => go("dash")}><LayoutDashboard size={16} strokeWidth={1.75} /> Dashboard</button>
      <button className={navP("path")} onClick={() => go("path")}><Route size={16} strokeWidth={1.75} /> Path</button>
      <button className={navP("cards")} onClick={() => go("cards")}>
        <Layers size={16} strokeWidth={1.75} /> Flashcards <span className="boxtag" style={{ display: "inline", margin: "0 0 0 auto" }}>({due} due)</span>
      </button>
      <button className={navP("scen")} onClick={() => go("scen")}><Puzzle size={16} strokeWidth={1.75} /> Scenarios</button>

      {course.blocks.map((b) => {
        const done = blockMastered(course, S, b.id);
        const bmods = blockMods(course, b.id);
        const bdone = bmods.filter((m) => modMastered(S, m.id)).length;
        const isCollapsed = collapsed.has(b.id);
        return (
          <div key={b.id}>
            <button
              type="button"
              className="blockhead"
              aria-expanded={!isCollapsed}
              onClick={() => toggleBlock(b.id)}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <ChevronDown
                  size={13}
                  strokeWidth={2.25}
                  className="bh-chev"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : "none" }}
                />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>
              </span>
              <span className={`bm ${done ? "done" : ""}`} title={done ? "Block mastered" : `${bdone} of ${bmods.length} modules mastered`}>
                {done ? "MASTERED" : `${bdone}/${bmods.length}`}
              </span>
            </button>
            {!isCollapsed && (
              <>
                {blockMods(course, b.id).map((m) => {
                  const dot = modMastered(S, m.id) ? "mastered" : S.read?.[m.id] ? "read" : "";
                  const locked = !moduleUnlocked(course, m.id);
                  return (
                    <button key={m.id} className={nav("mod", m.id)} onClick={() => go("mod", m.id)}>
                      <span className={`dot ${dot}`} />
                      {m.title}
                      {m.isNew && <span className="pill new" style={{ marginLeft: 6 }}>NEW</span>}
                      {m.isUpd && <span className="pill upd" style={{ marginLeft: 6 }}>2026</span>}
                      {locked && <Lock size={12} strokeWidth={1.75} style={{ marginLeft: "auto", opacity: 0.6 }} />}
                    </button>
                  );
                })}
                <button className={nav("exam", b.id)} onClick={() => go("exam", b.id)}>
                  <span className={`dot ${S.exams?.[b.id]?.passed ? "mastered" : ""}`} />
                  <GraduationCap size={16} strokeWidth={1.75} /> Mastery Exam
                </button>
              </>
            )}
          </div>
        );
      })}

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 14, paddingTop: 12 }}>
        {!entitled && (
          <>
            <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={busy} onClick={buy}>
              {busy ? "Opening checkout…" : <><Unlock size={15} strokeWidth={1.75} /> Unlock full access</>}
            </button>
            <RedeemDialog className="btn ghost" style={{ width: "100%", marginTop: 6 }} />
          </>
        )}
        <button className="navbtn" style={{ marginTop: 6 }} onClick={signOut}>
          <LogOut size={16} strokeWidth={1.75} /> Sign out
        </button>
      </div>
    </>
  );
}
