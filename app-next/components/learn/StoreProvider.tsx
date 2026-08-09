"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ProgressState } from "@/lib/types";
import { mergeProgress, stableStringify } from "@/lib/progress-merge";
import { createCourseStore, type CourseState, type CourseStore, type StoreInit } from "@/lib/store";

const StoreContext = createContext<CourseStore | null>(null);
const LOCAL_KEY = "aihub_v2026";
// The offline cache is now per-course so progress in one course can't seed
// another (module/scenario ids collide across courses). ai-eng keeps reading the
// legacy un-suffixed key as a fallback so existing Mastery learners don't lose
// their offline cache after this change.
const localKey = (slug: string) => `${LOCAL_KEY}:${slug}`;

function readCache(slug: string): ProgressState | null {
  const tryKey = (k: string) => {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "null");
      return v && typeof v === "object" ? (v as ProgressState) : null;
    } catch {
      return null;
    }
  };
  return tryKey(localKey(slug)) ?? (slug === "ai-eng" ? tryKey(LOCAL_KEY) : null);
}

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
      const cached = readCache(init.courseSlug);
      if (cached) seed = cached;
    }
    ref.current = createCourseStore({ ...init, initialProgress: seed });
  }

  useEffect(() => {
    const store = ref.current!;
    const supabase = supabaseBrowser();
    const courseSlug = store.getState().courseSlug;
    const cacheKey = localKey(courseSlug);

    // apply persisted theme
    document.documentElement.setAttribute("data-theme", store.getState().theme);

    const cacheLocal = (S: ProgressState) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(S));
      } catch {}
    };
    // Merge with the live server row before every write. Sync is whole-blob,
    // so an unmerged upsert from a stale tab — or from a session whose initial
    // progress fetch failed and seeded empty — would erase progress made on
    // another device. With the union-merge a write can only add. If the merge
    // brings in progress this tab didn't know about, adopt it into the UI too.
    // `adopting` tells the subscriber below that a state change is sync, not
    // the user studying — it must never stamp an activity day.
    let adopting = false;
    const persist = async (state: CourseState) => {
      cacheLocal(state.S);
      try {
        const { data, error } = await supabase
          .from("progress")
          .select("state")
          .eq("course_id", state.courseSlug)
          .maybeSingle();
        // supabase-js reports failures via `error`, not by throwing — and a
        // failed read is NOT "no row yet". Writing unmerged over a row we
        // couldn't read is exactly the clobber this merge exists to prevent,
        // so skip this round; localStorage has the state and the next
        // debounced persist retries.
        if (error) return;
        const server = (data?.state ?? null) as ProgressState | null;
        let toWrite = state.S;
        if (server) {
          toWrite = mergeProgress(server, state.S);
          if (stableStringify(toWrite) !== stableStringify(state.S)) {
            // Adopt cross-device progress, re-merged against the store's
            // CURRENT state so nothing the user did during the fetch
            // round-trip is lost.
            adopting = true;
            try {
              store.setState((s) => {
                toWrite = mergeProgress(toWrite, s.S);
                return { S: toWrite };
              });
            } finally {
              adopting = false;
            }
            cacheLocal(toWrite);
          }
        }
        await supabase
          .from("progress")
          .upsert(
            { user_id: state.userId, course_id: state.courseSlug, state: toWrite, updated_at: new Date().toISOString() },
            { onConflict: "user_id,course_id" },
          );
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
      // stamp a genuine study action for today's streak/goal — but never for
      // a sync adoption, which is progress arriving, not the user studying
      const t = new Date().toISOString().slice(0, 10);
      if (!adopting && !(state.S.act ?? []).includes(t)) {
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
