"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCourseStore } from "./StoreProvider";

// First-login guided tour. On desktop it navigates into the sample module and
// walks the Learn/Apply/Resources/Patterns tabs live (switching each as it's
// highlighted), plus every sidebar tool. Mobile gets a centered descriptive
// version. Theme-aware via CSS. Skippable, runs once (persisted as S.toured).
export default function Tour() {
  const { toured, page, sampleId, go, goTab, markToured } = useCourseStore((s) => ({
    toured: !!s.S.toured,
    page: s.route.page,
    sampleId: s.course.modules["llm"] ? "llm" : Object.keys(s.course.modules)[0],
    go: s.go,
    goTab: s.goTab,
    markToured: s.markToured,
  }));
  const started = useRef(false);

  useEffect(() => {
    if (toured || started.current || page !== "dash") return;
    started.current = true;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const isMobile = window.matchMedia("(max-width: 860px)").matches;

    const welcome: DriveStep = {
      popover: {
        title: "Welcome to Novacademy 👋",
        description: "A quick tour of the tools and how to use them. Skip anytime — it won't show again.",
      },
    };
    const closing: DriveStep = {
      popover: {
        title: "You're all set 🚀",
        description:
          "Have an access code? Use “I have a code” at the bottom of the sidebar to unlock everything, then start with Block 1. Happy learning!",
      },
    };

    function desktopSteps(): DriveStep[] {
      const mid = [
        { element: '[data-tour="start"]', popover: { title: "Start Here", description: "New to AI engineering? A 15-minute orientation that makes everything else click.", side: "right", align: "start" } },
        { element: '[data-tour="dash"]', popover: { title: "Dashboard", description: "Your home base — streak, XP/level, and overall mastery across the course.", side: "right", align: "start" } },
        { element: '[data-tour="path"]', popover: { title: "Path", description: "Not sure what's next? Path always points to the single best next action.", side: "right", align: "start" } },
        { element: '[data-tour="modules"]', popover: { title: "21 modules, 5 blocks", description: "Each module teaches one topic in depth. Let's look inside the first one →", side: "right", align: "start" } },
        { element: '[data-tour="tab-learn"]', onHighlightStarted: () => goTab("learn"), popover: { title: "Learn tab", description: "Concepts, the mental model, and how the topic actually works under the hood.", side: "bottom", align: "start" } },
        { element: '[data-tour="tab-apply"]', onHighlightStarted: () => goTab("apply"), popover: { title: "Apply tab", description: "A worked example, a production checklist, and a hands-on build exercise.", side: "bottom", align: "start" } },
        { element: '[data-tour="tab-res"]', onHighlightStarted: () => goTab("res"), popover: { title: "Resources tab", description: "Curated links, each with a note on when to reach for it.", side: "bottom", align: "start" } },
        { element: '[data-tour="tab-code"]', onHighlightStarted: () => goTab("code"), popover: { title: "Patterns tab", description: "Runnable code patterns plus a debugging guide for the topic.", side: "bottom", align: "start" } },
        { element: '[data-tour="quiz"]', onHighlightStarted: () => goTab("learn"), popover: { title: "Take the quiz", description: "Once you've read the module, take its quiz — score ≥80% to master it.", side: "top", align: "start" } },
        { element: '[data-tour="exam"]', popover: { title: "Mastery Exam", description: "After a block's modules are mastered, pass its exam (≥85%) to lock the block in.", side: "right", align: "start" } },
        { element: '[data-tour="cards"]', popover: { title: "Flashcards", description: "Spaced-repetition cards — a few minutes daily cements what you learn.", side: "right", align: "start" } },
        { element: '[data-tour="scen"]', popover: { title: "Scenarios", description: "Real production dilemmas with model answers — where senior judgment forms.", side: "right", align: "start" } },
        { element: '[data-tour="gloss"]', popover: { title: "Glossary", description: "Every term in plain English — search it anytime.", side: "right", align: "start" } },
        { element: ".sideprog", popover: { title: "Your progress", description: "Overall mastery, streak, level, and XP live here.", side: "right", align: "start" } },
      ] as DriveStep[];
      return [welcome, ...mid.filter((s) => !s.element || document.querySelector(s.element as string)), closing];
    }

    function mobileSteps(): DriveStep[] {
      return [
        welcome,
        { popover: { title: "Your menu", description: "Tap ☰ (top-left) for navigation: Start Here, Dashboard, Path, all 21 modules by block, Flashcards, Scenarios, and the Glossary." } },
        { popover: { title: "Inside each module", description: "Four tabs — <b>Learn</b> (concepts + how it works), <b>Apply</b> (worked example + build exercise), <b>Resources</b> (curated links), and <b>Patterns</b> (runnable code). Read them, then take the <b>quiz</b> (≥80% to master)." } },
        { popover: { title: "Lock in each block", description: "Master a block's modules, then pass its <b>Mastery Exam</b> (≥85%). Keep <b>Flashcards</b> in daily rotation and test judgment with <b>Scenarios</b>." } },
        closing,
      ];
    }

    function begin() {
      if (cancelled) return;
      const d = driver({
        showProgress: true,
        popoverClass: "nova-tour",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Start learning",
        steps: isMobile ? mobileSteps() : desktopSteps(),
        onDestroyed: () => {
          goTab("learn");
          markToured();
        },
      });
      d.drive();
    }

    if (!isMobile && sampleId) {
      // Open the sample module so its tabs are in the DOM, then start once ready.
      go("mod", sampleId);
      let tries = 0;
      poll = setInterval(() => {
        if (cancelled) return clearInterval(poll);
        if (document.querySelector('[data-tour="tab-learn"]') || ++tries > 40) {
          clearInterval(poll);
          begin();
        }
      }, 100);
    } else {
      timer = setTimeout(begin, 300);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toured, sampleId, go, goTab, markToured]);

  return null;
}
