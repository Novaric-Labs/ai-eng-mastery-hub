// Client-side course store (zustand). One store instance per LearnApp mount,
// created with server-provided course/entitlement/progress and wired to
// localStorage + Supabase persistence by StoreProvider.

import { createStore } from "zustand";
import type { ProgressState } from "./types";
import {
  type Course,
  type QuizItem,
  INTERVALS,
  PASS_EXAM,
  PASS_QUIZ,
  blockMods,
  cardState,
} from "./course";

export type QItem = { q: string; o: string[]; a: number; exp: string; sel: number | null };
export type QuizRun = {
  mode: "quiz" | "exam";
  id: string;
  items: QItem[];
  i: number;
  done: boolean;
};

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Shuffle question order AND option order so position carries no signal.
function prepItems(pool: QuizItem[]): QItem[] {
  return shuffle(pool).map((q) => {
    const ord = shuffle([0, 1, 2, 3]);
    return {
      q: q.q,
      o: ord.map((i) => q.o[i]),
      a: ord.indexOf(q.a),
      exp: q.exp,
      sel: null,
    };
  });
}

export type Page =
  | "dash" | "mod" | "quiz" | "exam"
  | "cards" | "scen" | "start" | "gloss" | "path";
export type Tab = "learn" | "apply" | "res" | "code";

export type Route = { page: Page; arg?: string; tab: Tab };

export type CourseState = {
  course: Course;
  /** Slug of the course this store instance is for (e.g. 'ai-eng'). */
  courseSlug: string;
  entitled: boolean;
  /** Owner/admin — used to gate not-yet-launched features (e.g. preface videos). */
  admin: boolean;
  userId: string;
  S: ProgressState;
  route: Route;
  theme: "dark" | "light";
  Q: QuizRun | null;
  // navigation
  go: (page: Page, arg?: string) => void;
  goTab: (tab: Tab) => void;
  setRoute: (r: Route) => void;
  toggleTheme: () => void;
  // quiz/exam runtime
  startQuiz: (id: string) => void;
  startExam: (bid: string) => void;
  pick: (n: number) => void;
  nextQ: () => void;
  // progress mutations (each persists via the subscribe in StoreProvider)
  markRead: (id: string) => void;
  recordQuiz: (id: string, score: number) => void;
  recordExam: (bid: string, score: number) => void;
  gradeCard: (idx: number, grade: number, today: string) => void;
  setScen: (id: string, grade: "nailed" | "partial" | "missed") => void;
  setScenNote: (id: string, note: string) => void;
  markTour: (key: string) => void;
  setName: (name: string) => void;
  markNameAsked: () => void;
  resetProgress: () => void;
};

function emptyProgress(): ProgressState {
  return { read: {}, quiz: {}, exams: {}, cards: {}, scen: {}, scennote: {}, visits: [], act: [] };
}

export type StoreInit = {
  course: Course;
  courseSlug: string;
  entitled: boolean;
  admin: boolean;
  userId: string;
  initialProgress: ProgressState;
  initialRoute: Route;
  theme: "dark" | "light";
};

export function createCourseStore(init: StoreInit) {
  return createStore<CourseState>()((set, get) => ({
    course: init.course,
    courseSlug: init.courseSlug,
    entitled: init.entitled,
    admin: init.admin,
    userId: init.userId,
    S: { ...emptyProgress(), ...init.initialProgress },
    route: init.initialRoute,
    theme: init.theme,
    Q: null,

    go: (page, arg) => set({ route: { page, arg, tab: "learn" } }),
    goTab: (tab) => set((s) => ({ route: { ...s.route, tab } })),
    setRoute: (route) => set({ route }),

    startQuiz: (id) => {
      const pool = get().course.quizzes[id];
      if (!pool || !pool.length) return;
      set({ Q: { mode: "quiz", id, items: prepItems(pool), i: 0, done: false }, route: { page: "quiz", tab: "learn" } });
    },
    startExam: (bid) => {
      const c = get().course;
      const pool: QuizItem[] = [];
      blockMods(c, bid).forEach((m) => (c.quizzes[m.id] ?? []).forEach((q) => pool.push(q)));
      if (!pool.length) return;
      set({ Q: { mode: "exam", id: bid, items: prepItems(shuffle(pool).slice(0, 20)), i: 0, done: false }, route: { page: "quiz", tab: "learn" } });
    },
    pick: (n) =>
      set((s) => {
        if (!s.Q) return {};
        const it = s.Q.items[s.Q.i];
        if (it.sel !== null) return {};
        const items = s.Q.items.slice();
        items[s.Q.i] = { ...it, sel: n };
        return { Q: { ...s.Q, items } };
      }),
    nextQ: () => {
      const Q = get().Q;
      if (!Q) return;
      if (Q.i < Q.items.length - 1) {
        set({ Q: { ...Q, i: Q.i + 1 } });
        return;
      }
      const score = Math.round((100 * Q.items.filter((x) => x.sel === x.a).length) / Q.items.length);
      if (Q.mode === "quiz") get().recordQuiz(Q.id, score);
      else get().recordExam(Q.id, score);
      set({ Q: { ...Q, done: true } });
    },
    toggleTheme: () =>
      set((s) => {
        const theme = s.theme === "dark" ? "light" : "dark";
        if (typeof document !== "undefined")
          document.documentElement.setAttribute("data-theme", theme);
        try {
          localStorage.setItem("aihub_theme", theme);
        } catch {}
        return { theme };
      }),

    markRead: (id) =>
      set((s) => ({ S: { ...s.S, read: { ...s.S.read, [id]: true } } })),

    recordQuiz: (id, score) =>
      set((s) => {
        const prev = s.S.quiz?.[id] ?? { best: 0, attempts: 0 };
        return {
          S: {
            ...s.S,
            quiz: {
              ...s.S.quiz,
              [id]: { best: Math.max(prev.best, score), attempts: prev.attempts + 1 },
            },
          },
        };
      }),

    recordExam: (bid, score) =>
      set((s) => {
        const prev = s.S.exams?.[bid] ?? { best: 0, passed: false, attempts: 0 };
        return {
          S: {
            ...s.S,
            exams: {
              ...s.S.exams,
              [bid]: {
                best: Math.max(prev.best, score),
                passed: prev.passed || score >= PASS_EXAM,
                attempts: prev.attempts + 1,
              },
            },
          },
        };
      }),

    gradeCard: (idx, grade, today) =>
      set((s) => {
        const st = cardState(s.S, idx, today);
        const box = grade === 0 ? 0 : grade === 1 ? Math.max(0, st.box) : grade === 2 ? Math.min(st.box + 1, 3) : 3;
        const d = new Date(today + "T00:00:00Z");
        d.setUTCDate(d.getUTCDate() + INTERVALS[box]);
        return {
          S: { ...s.S, cards: { ...s.S.cards, [idx]: { box, due: d.toISOString().slice(0, 10) } } },
        };
      }),

    setScen: (id, grade) =>
      set((s) => ({ S: { ...s.S, scen: { ...s.S.scen, [id]: grade } } })),

    setScenNote: (id, note) =>
      set((s) => ({ S: { ...s.S, scennote: { ...s.S.scennote, [id]: note } } })),

    markTour: (key) =>
      set((s) =>
        s.S.tours?.[key]
          ? {}
          : { S: { ...s.S, tours: { ...(s.S.tours ?? {}), [key]: true } } },
      ),

    setName: (name) => set((s) => ({ S: { ...s.S, name: name.trim().slice(0, 40), nameAsked: true } })),
    markNameAsked: () => set((s) => (s.S.nameAsked ? {} : { S: { ...s.S, nameAsked: true } })),

    resetProgress: () => set({ S: emptyProgress() }),
  }));
}

export type CourseStore = ReturnType<typeof createCourseStore>;

// Re-export constants used by views.
export { PASS_QUIZ, PASS_EXAM };
