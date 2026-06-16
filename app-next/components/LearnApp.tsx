"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, BookOpen } from "lucide-react";
import NovaMark from "@/components/NovaMark";
import { buildCourse } from "@/lib/course";
import type { ContentRow, ProgressState } from "@/lib/types";
import { type Page, type Route, type Tab } from "@/lib/store";
import { StoreProvider, useCourseStore } from "./learn/StoreProvider";
import Sidebar from "./learn/Sidebar";
import Dashboard from "./learn/Dashboard";
import ModuleView from "./learn/ModuleView";
import Quiz from "./learn/Quiz";
import ExamPage from "./learn/ExamPage";
import Flashcards from "./learn/Flashcards";
import Scenarios from "./learn/Scenarios";
import Glossary from "./learn/Glossary";
import LearningPath from "./learn/LearningPath";
import StartHere from "./learn/StartHere";
import Celebrate from "./learn/Celebrate";
import Tour from "./learn/Tour";
import TutorBot from "./learn/TutorBot";
import NameModal from "./learn/NameModal";

const VALID: Page[] = ["dash", "mod", "quiz", "exam", "cards", "scen", "start", "gloss", "path"];

export default function LearnApp({
  content,
  courseSlug,
  entitled,
  admin,
  userId,
  initialProgress,
}: {
  content: ContentRow[];
  courseSlug: string;
  entitled: boolean;
  admin: boolean;
  userId: string;
  initialProgress: ProgressState;
}) {
  const course = useMemo(() => buildCourse(content), [content]);
  const init = useMemo(
    () => ({
      course,
      courseSlug,
      entitled,
      admin,
      userId,
      initialProgress,
      initialRoute: { page: "dash", tab: "learn" } as Route,
      theme:
        typeof window !== "undefined" && localStorage.getItem("aihub_theme") === "light"
          ? ("light" as const)
          : ("dark" as const),
    }),
    [course, courseSlug, entitled, admin, userId, initialProgress],
  );

  // No catalog rows → the content table hasn't been seeded (or RLS returned
  // nothing). Show a clear message instead of an empty, broken shell.
  if (!course.catalog.length) {
    return (
      <main className="wrap" style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 520, textAlign: "center" }}>
        <BookOpen size={40} strokeWidth={1.25} style={{ color: "var(--dim)" }} />
        <h1 style={{ fontSize: 24, margin: "10px 0 8px" }}>No course content yet</h1>
        <p style={{ color: "var(--dim)" }}>
          Your account is signed in, but the course catalog came back empty. If you&apos;re the
          operator, seed the <code>content</code> table; otherwise please try again shortly.
        </p>
      </main>
    );
  }

  return (
    <StoreProvider init={init}>
      <Shell />
      <Celebrate />
    </StoreProvider>
  );
}

function hashFor(r: Route): string {
  if (r.page === "mod") return "#/mod/" + r.arg + (r.tab && r.tab !== "learn" ? "/" + r.tab : "");
  if (r.page === "exam") return "#/exam/" + r.arg;
  return "#/" + r.page;
}

function Shell() {
  const { course, route, setRoute, Q } = useCourseStore((s) => ({
    course: s.course,
    route: s.route,
    setRoute: s.setRoute,
    Q: s.Q,
  }));
  const [mounted, setMounted] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // parse hash on mount + react to back/forward
  useEffect(() => {
    function parseHash(): Route | null {
      const raw = (location.hash || "").replace(/^#\/?/, "");
      if (!raw) return { page: "dash", tab: "learn" };
      const p = raw.split("/");
      if (!VALID.includes(p[0] as Page)) return { page: "dash", tab: "learn" };
      if (p[0] === "mod") {
        if (!course.catalog.some((m) => m.id === p[1])) return { page: "dash", tab: "learn" };
        return { page: "mod", arg: p[1], tab: (p[2] as Tab) || "learn" };
      }
      if (p[0] === "exam") {
        if (!course.blocks.some((b) => b.id === p[1])) return { page: "dash", tab: "learn" };
        return { page: "exam", arg: p[1], tab: "learn" };
      }
      if (p[0] === "quiz") return null; // no in-memory run → fall back
      return { page: p[0] as Page, tab: "learn" };
    }
    const initRoute = parseHash();
    if (initRoute) setRoute(initRoute);
    setMounted(true);

    function onHash() {
      const r = parseHash();
      if (r) {
        setRoute(r);
        window.scrollTo(0, 0);
      }
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the URL hash in sync with the active route. Assigning location.hash (vs
  // replaceState) records a history entry so the browser back/forward buttons walk
  // through in-app views; the resulting hashchange is a no-op (route already matches).
  useEffect(() => {
    if (!mounted) return;
    const want = hashFor(route);
    if (location.hash !== want) location.hash = want;
    window.scrollTo(0, 0);
  }, [route, mounted]);

  // close the mobile drawer whenever the route changes
  useEffect(() => setDrawer(false), [route]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
        <div className="spinner" />
      </div>
    );
  }

  let view: React.ReactNode;
  switch (route.page) {
    case "mod": view = <ModuleView id={route.arg!} />; break;
    case "quiz": view = Q ? <Quiz /> : <Dashboard />; break;
    case "exam": view = <ExamPage bid={route.arg!} />; break;
    case "cards": view = <Flashcards />; break;
    case "scen": view = <Scenarios />; break;
    case "start": view = <StartHere />; break;
    case "gloss": view = <Glossary />; break;
    case "path": view = <LearningPath />; break;
    default: view = <Dashboard />;
  }

  return (
    <>
      <header id="course-topbar">
        <button
          id="navtoggle"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawer}
          aria-controls="side"
          onClick={() => setDrawer((d) => !d)}
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
        <span className="tb-title brand">
          <NovaMark size={16} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </span>
      </header>
      <div id="app">
        <nav id="side" className={drawer ? "drawer-open" : ""}>
          <Sidebar />
        </nav>
        <main id="main">{view}</main>
      </div>
      <div id="scrim" className={drawer ? "show" : ""} onClick={() => setDrawer(false)} />
      <NameModal />
      <Tour />
      <TutorBot />
    </>
  );
}
