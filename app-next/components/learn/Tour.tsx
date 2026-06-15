"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCourseStore } from "./StoreProvider";

// First-login guided tour. Walks through every tool (Start Here, Dashboard, Path,
// modules + their tabs, exams, flashcards, scenarios, glossary, progress).
// Theme-aware via CSS (popover uses our --vars). Skippable, runs once.
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

    const welcome: DriveStep = {
      popover: {
        title: "Welcome to Novacademy 👋",
        description:
          "A 60-second tour of the tools and how to use them. Skip anytime — it won't show again.",
      },
    };
    const closing: DriveStep = {
      popover: {
        title: "You're all set 🚀",
        description:
          "Have an access code? Use “I have a code” at the bottom of the sidebar to unlock everything. Then start with Block 1. Happy learning!",
      },
    };

    let steps: DriveStep[];

    if (isMobile) {
      // Sidebar is in a slide-in drawer on mobile, so describe the tools centered.
      steps = [
        welcome,
        { popover: { title: "Your menu", description: "Tap ☰ (top-left) to open navigation: Start Here, Dashboard, Path, all 21 modules by block, Flashcards, Scenarios, and the Glossary." } },
        { popover: { title: "Inside each module", description: "Four tabs: <b>Learn</b> (concepts + how it works), <b>Apply</b> (worked example + a build exercise), <b>Resources</b> (curated links), and <b>Patterns</b> (runnable code). Read them, then take the <b>quiz</b> — score ≥80% to master the module." } },
        { popover: { title: "Lock in each block", description: "Once a block's modules are mastered, pass its <b>Mastery Exam</b> (≥85%). Keep <b>Flashcards</b> in daily rotation, and test judgment with <b>Scenarios</b>." } },
        closing,
      ];
    } else {
      const anchored = ([
        { element: '[data-tour="start"]', popover: { title: "Start Here", description: "New to AI engineering? A 15-minute orientation that makes everything else click.", side: "right", align: "start" } },
        { element: '[data-tour="dash"]', popover: { title: "Dashboard", description: "Your home base — streak, XP/level, and overall mastery across the course.", side: "right", align: "start" } },
        { element: '[data-tour="path"]', popover: { title: "Path", description: "Not sure what's next? Path always points you to the single best next action.", side: "right", align: "start" } },
        { element: '[data-tour="modules"]', popover: { title: "Modules & their tabs", description: "21 modules across 5 blocks. Each module has <b>Learn</b> (concepts + how it works), <b>Apply</b> (worked example + build exercise), <b>Resources</b>, and <b>Patterns</b> (runnable code). Read them, then take the <b>quiz</b> — ≥80% masters it.", side: "right", align: "start" } },
        { element: '[data-tour="exam"]', popover: { title: "Mastery Exam", description: "After a block's modules are mastered, pass its exam (≥85%) to lock the block in.", side: "right", align: "start" } },
        { element: '[data-tour="cards"]', popover: { title: "Flashcards", description: "Spaced-repetition (Leitner) cards — a few minutes daily cements what you learn.", side: "right", align: "start" } },
        { element: '[data-tour="scen"]', popover: { title: "Scenarios", description: "Real-world production dilemmas with model answers — this is where senior judgment forms.", side: "right", align: "start" } },
        { element: '[data-tour="gloss"]', popover: { title: "Glossary", description: "Every term in plain English — search it anytime you hit an unfamiliar word.", side: "right", align: "start" } },
        { element: ".sideprog", popover: { title: "Your progress", description: "Overall mastery lives here, with your streak, level, and XP just below.", side: "right", align: "start" } },
      ] as DriveStep[]).filter((s) => !s.element || document.querySelector(s.element as string));

      steps = [welcome, ...anchored, closing];
    }

    const d = driver({
      showProgress: true,
      popoverClass: "nova-tour",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Start learning",
      steps,
      onDestroyed: () => markToured(),
    });

    const t = setTimeout(() => d.drive(), 450);
    return () => clearTimeout(t);
  }, [toured, page, markToured]);

  return null;
}
