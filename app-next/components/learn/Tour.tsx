"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCourseStore } from "./StoreProvider";
import { learnLabelsFor, type LearnLabels } from "@/lib/learn-labels";

// Per-area guided tours. Rather than one long walkthrough on first login, each
// major page shows its own short tour the first time the user lands on it
// (persisted per-area in S.tours, keyed by page id). The dashboard tour runs
// first since dash is the landing page; the rest fire as the user navigates.
// Tours anchor to in-page content so they work on mobile too (the sidebar is
// behind a drawer there). Theme-aware via CSS, skippable, each runs once.

type TourDef = {
  // Selector that must be in the DOM before we start (page content mounted).
  // Omitted for tours made entirely of centered (element-less) steps.
  anchor?: string;
  steps: (isMobile: boolean) => DriveStep[];
  // Optional cleanup after the tour ends (e.g. reset a module's active tab).
  onEnd?: (goTab: (t: "learn" | "apply" | "res" | "code") => void) => void;
};

// Course-aware tour copy: most steps are course-agnostic, but a handful carry
// engineer/Mastery wording that reads wrong for a beginner course. Those strings
// come from the shared learn-labels map (L), which defaults to the existing
// ai-eng copy — so ai-eng (and any unknown slug) is unchanged.
const buildTours = (L: LearnLabels): Record<string, TourDef> => ({
  dash: {
    anchor: '[data-tour="dash-hero"]',
    steps: (isMobile) => [
      {
        popover: {
          title: "Welcome to Novacademy 👋",
          description:
            "This is your dashboard — your home base. Each area shows a quick guide the first time you open it, so you'll learn the tools as you go. Skip anytime.",
        },
      },
      {
        element: '[data-tour="dash-hero"]',
        popover: {
          title: "Your momentum",
          description:
            "Daily streak, level, and XP. Studying anything each day keeps the streak alive — small and consistent beats cramming.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="dash-overall"]',
        popover: {
          title: L.tourOverallTitle,
          description: L.tourOverallDesc,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="dash-blocks"]',
        popover: {
          title: L.tourBlocksTitle,
          description: L.tourBlocksDesc(isMobile),
          side: "top",
          align: "start",
        },
      },
      {
        popover: {
          title: "You're all set 🚀",
          description:
            "Tip: open <b>Path</b> anytime for the single best next step. Have an access code? Use “I have a code” in the sidebar to unlock everything.",
        },
      },
    ],
  },

  mod: {
    anchor: '[data-tour="tab-learn"]',
    onEnd: (goTab) => goTab("learn"),
    steps: () => [
      {
        element: '[data-tour="tab-learn"]',
        popover: {
          title: "Learn tab",
          description:
            "The concept, the mental model, and how the topic actually works under the hood.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="tab-apply"]',
        popover: {
          title: "Apply tab",
          description: L.tourApplyDesc,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="tab-res"]',
        popover: {
          title: "Resources tab",
          description: "Curated links, each with a note on when to reach for it.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="tab-code"]',
        popover: {
          title: "Patterns tab",
          description: "Runnable code patterns plus a debugging guide (where available).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="quiz"]',
        popover: {
          title: "Read it, then prove it",
          description: L.tourQuizDesc,
          side: "top",
          align: "start",
        },
      },
    ],
  },

  cards: {
    anchor: '[data-tour="cards-progress"]',
    steps: () => [
      {
        popover: {
          title: "How flashcards work",
          description:
            "Flip each card, then say whether you <b>knew it</b> or <b>didn't</b> — that's the only call you make. Cards you know come back less often; ones you miss come back soon. The spacing schedule runs automatically in the background.",
        },
      },
      {
        element: '[data-tour="cards-progress"]',
        popover: {
          title: "Your deck grows with you",
          description:
            "As you read more modules, their flashcards are added to your deck automatically — and cards rotate back in periodically to keep testing your recall over time.",
          side: "bottom",
          align: "start",
        },
      },
      {
        popover: {
          title: "A few minutes daily",
          description:
            "That's all it takes. Press <span class=\"kbd\">Space</span> to flip, then <span class=\"kbd\">1</span> (didn't know) or <span class=\"kbd\">2</span> (knew it).",
        },
      },
    ],
  },

  path: {
    steps: () => [
      {
        popover: {
          title: "Your next best move",
          description:
            "Path always points to the single best next action — the next module to read, the quiz to take, or the exam to pass. Whenever you're not sure what's next, come here.",
        },
      },
    ],
  },

  scen: {
    steps: () => [
      {
        popover: {
          title: "Scenario challenges",
          description: L.tourScenDesc,
        },
      },
    ],
  },

  exam: {
    steps: () => [
      {
        popover: {
          title: L.tourExamTitle,
          description: L.tourExamDesc,
        },
      },
    ],
  },

  start: {
    steps: () => [
      {
        popover: {
          title: "Start Here",
          description: L.tourStartDesc,
        },
      },
    ],
  },
});

export default function Tour() {
  const { tours, page, courseSlug, nameHandled, goTab, markTour } = useCourseStore((s) => ({
    tours: s.S.tours,
    page: s.route.page,
    courseSlug: s.courseSlug,
    nameHandled: !!(s.S.name || s.S.nameAsked),
    goTab: s.goTab,
    markTour: s.markTour,
  }));
  // Keys we've already kicked off this mount — guards against the run firing
  // twice before persistence (and React StrictMode's double-invoked effects).
  const started = useRef<Set<string>>(new Set());

  useEffect(() => {
    // The dashboard tour waits for the name prompt so the two modals don't collide.
    if (page === "dash" && !nameHandled) return;

    const key = page;
    const def = buildTours(learnLabelsFor(courseSlug))[key];
    if (!def || tours?.[key] || started.current.has(key)) return;

    let cancelled = false;
    const isMobile = window.matchMedia("(max-width: 860px)").matches;

    function begin() {
      if (cancelled || started.current.has(key)) return;
      const steps = def.steps(isMobile).filter(
        (s) => !s.element || document.querySelector(s.element as string),
      );
      // No anchored steps in the DOM yet (e.g. a locked module with no tabs) —
      // don't mark it seen; let it run next time the page mounts properly.
      if (!steps.length) return;
      started.current.add(key);
      const d = driver({
        showProgress: steps.length > 1,
        popoverClass: "nova-tour",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it",
        steps,
        onDestroyed: () => {
          def.onEnd?.(goTab);
          markTour(key);
        },
      });
      d.drive();
    }

    // Wait for the page's anchor to mount, then start.
    let tries = 0;
    const poll = setInterval(() => {
      if (cancelled) return clearInterval(poll);
      if (!def.anchor || document.querySelector(def.anchor) || ++tries > 40) {
        clearInterval(poll);
        begin();
      }
    }, 80);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [page, tours, courseSlug, nameHandled, goTab, markTour]);

  return null;
}
