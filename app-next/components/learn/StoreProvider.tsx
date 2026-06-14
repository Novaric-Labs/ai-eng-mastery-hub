"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ProgressState } from "@/lib/types";
import { createCourseStore, type CourseState, type CourseStore, type StoreInit } from "@/lib/store";

const StoreContext = createContext<CourseStore | null>(null);
const LOCAL_KEY = "aihub_v2026";

function isEmptyProgress(s: ProgressState): boolean {
  const has = (o?: Record<string, unknown> | unknown[]) =>
    o && (Array.isArray(o) ? o.length : Object.keys(o).length);
  return !(has(s.read) || has(s.quiz) || has(s.exams) || has(s.cards) || has(s.scen));
}

export function StoreProvider({
  init,
  children,
}: {
  init: StoreInit;
  children: React.ReactNode;
}) {
  const ref = useRef<CourseStore | null>(null);
  if (!ref.current) {
    // Prefer server progress; fall back to the offline localStorage cache.
    let seed = init.initialProgress;
    if (typeof window !== "undefined" && isEmptyProgress(seed)) {
      try {
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
        if (cached && typeof cached === "object") seed = cached;
      } catch {}
    }
    ref.current = createCourseStore({ ...init, initialProgress: seed });
  }

  useEffect(() => {
    const store = ref.current!;
    const supabase = supabaseBrowser();

    // apply persisted theme
    document.documentElement.setAttribute("data-theme", store.getState().theme);

    const cacheLocal = (S: ProgressState) => {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(S));
      } catch {}
    };
    const persist = async (state: CourseState) => {
      cacheLocal(state.S);
      try {
        await supabase
          .from("progress")
          .upsert({ user_id: state.userId, state: state.S, updated_at: new Date().toISOString() });
      } catch {}
    };

    // record today's visit (passive — not a study "action")
    const today = new Date().toISOString().slice(0, 10);
    const s0 = store.getState().S;
    if (!(s0.visits ?? []).includes(today)) {
      store.setState({ S: { ...s0, visits: [...(s0.visits ?? []), today] } });
      void persist(store.getState());
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = store.subscribe((state, prev) => {
      if (state.S === prev.S) return; // only react to progress changes
      // stamp a genuine study action for today's streak/goal
      const t = new Date().toISOString().slice(0, 10);
      if (!(state.S.act ?? []).includes(t)) {
        store.setState({ S: { ...state.S, act: [...(state.S.act ?? []), t] } });
        return; // re-enters with act stamped; persistence runs on that pass
      }
      cacheLocal(state.S);
      clearTimeout(timer);
      timer = setTimeout(() => void persist(store.getState()), 600);
    });

    return () => {
      unsub();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StoreContext.Provider value={ref.current}>{children}</StoreContext.Provider>;
}

export function useCourseStore<T>(selector: (s: CourseState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useCourseStore must be used within StoreProvider");
  // useShallow guards against the v5 footgun where object selectors return a new
  // reference each render and trigger an infinite update loop.
  return useStore(store, useShallow(selector));
}

/** Fire a celebration toast + confetti (handled by the Celebrate component). */
export function celebrate(msg: string, big = false) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("aihub:celebrate", { detail: { msg, big } }));
}
