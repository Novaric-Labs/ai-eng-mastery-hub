"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useCourseStore } from "./StoreProvider";

// First-login guided tour. Runs once (persisted via S.toured), only on the
// dashboard, after the shell has rendered. Skippable; never repeats.
export default function Tour() {
  const { toured, page, markToured } = useCourseStore((s) => ({
    toured: !!s.S.toured,
    page: s.route.page,
    markToured: s.markToured,
  }));
  const started = useRef(false);

  useEffect(() => {
    if (toured || started.current || page !== "dash") return;
    started.current = true;

    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    const sideSteps = isMobile
      ? []
      : [
          {
            element: "#side",
            popover: {
              title: "Your navigation",
              description:
                "Start Here for orientation, then work through 21 modules across 5 blocks. Flashcards & Scenarios live here too.",
              side: "right" as const,
            },
          },
          {
            element: ".sideprog",
            popover: {
              title: "Track your mastery",
              description:
                "A module is mastered when you read it and score ≥80% on its quiz. This bar shows overall progress.",
              side: "right" as const,
            },
          },
        ];

    const d = driver({
      showProgress: true,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Start learning",
      steps: [
        {
          popover: {
            title: "Welcome to Novacademy 👋",
            description:
              "Quick 30-second tour of how the course works. You can skip anytime — it won't show again.",
          },
        },
        ...sideSteps,
        {
          element: "#main",
          popover: {
            title: "Where you learn",
            description:
              "Each module has Learn / Apply / Resources / Patterns tabs. Read them, then take the quiz to lock in mastery.",
            side: isMobile ? ("bottom" as const) : ("left" as const),
          },
        },
        {
          popover: {
            title: "You're set 🚀",
            description:
              "Have an access code? Use “I have a code” at the bottom of the sidebar to unlock everything. Happy learning!",
          },
        },
      ],
      onDestroyed: () => markToured(),
    });

    const t = setTimeout(() => d.drive(), 450);
    return () => clearTimeout(t);
  }, [toured, page, markToured]);

  return null;
}
