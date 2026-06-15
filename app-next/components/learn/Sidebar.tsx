"use client";

import { useState } from "react";
import {
  Zap,
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
} from "lucide-react";
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
  async function redeem() {
    const code = prompt("Enter your access code");
    if (!code) return;
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.rpc("redeem_access_code", { p_code: code.trim() });
    if (error) return alert("Error: " + error.message);
    if (data === "ok") location.reload();
    else alert("Could not redeem that code.");
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

  return (
    <>
      <h1>
        <Zap size={17} strokeWidth={1.75} fill="currentColor" />
        AI Engineering Mastery Hub
      </h1>
      <div className="sub">2026 Edition · updated June 2026</div>

      <div className="sideprog">
        <div className="bar">
          <i className={mDone === mTot ? "g" : ""} style={{ width: `${(100 * mDone) / mTot}%` }} />
        </div>
        {mDone}/{mTot} modules mastered
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
        return (
          <div key={b.id}>
            <div className="blockhead">
              {b.name}
              <span className={`bm ${done ? "done" : ""}`}>{done ? "MASTERED" : ""}</span>
            </div>
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
          </div>
        );
      })}

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 14, paddingTop: 12 }}>
        {!entitled && (
          <>
            <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={busy} onClick={buy}>
              {busy ? "Opening checkout…" : <><Unlock size={15} strokeWidth={1.75} /> Unlock full access</>}
            </button>
            <button className="btn ghost" style={{ width: "100%", marginTop: 6 }} onClick={redeem}>
              I have a code
            </button>
          </>
        )}
        <button className="navbtn" style={{ marginTop: 6 }} onClick={signOut}>
          <LogOut size={16} strokeWidth={1.75} /> Sign out
        </button>
      </div>
    </>
  );
}
