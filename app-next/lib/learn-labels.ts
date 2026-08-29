// Course-aware copy for the learn shell (Dashboard, Tour, Scenarios, StartHere,
// TutorBot). The same components render every course, but much of the copy was
// written for the engineer/staff audience of the AI Engineering Mastery Hub
// ('ai-eng') and reads wrong for a beginner course. We keep the Mastery wording
// as the DEFAULT (byte-for-byte) and override only the audience-flavored strings
// per course slug, so 'ai-eng' — and any unknown/future slug — stays identical.
//
// This mirrors the per-course label pattern already used inside ModuleView.tsx.
// Only human-readable copy lives here; component layout/logic/data flow are
// untouched. Strings that may contain inline HTML (rendered through <Html/>) are
// noted; the rest are plain text. Keep `…` etc. as the same characters the
// original JSX used so the ai-eng DOM text is unchanged.

export type LearnLabels = {
  // ---- Dashboard ----
  /** "New to AI?" intro card body, before the Start Here link. */
  dashNewBefore: string;
  /** "New to AI?" intro card body, after the Start Here link. */
  dashNewAfter: string;
  /** Dashboard <h2> when the learner has no saved name. */
  dashTitle: string;
  /** Tagline under the dashboard title (inline HTML, takes pass marks). */
  dashTagline: (passQuiz: number, passExam: number) => string;
  /** "Overall mastery" card heading. */
  dashOverall: string;
  /** "Mastery exams passed" stat label. */
  dashExamsStat: string;
  /** Heading on the "How to use this hub" card. */
  dashHowTitle: string;
  /** "How to use" list — read-the-tabs line (inline HTML, takes pass mark). */
  dashHowRead: (passQuiz: number) => string;
  /** "How to use" list — build-it line (inline HTML). */
  dashHowBuild: string;
  /** "How to use" list — scenarios line (inline HTML). */
  dashHowScenarios: string;
  /** "How to use" list — exam line (inline HTML, takes pass mark). */
  dashHowExam: (passExam: number) => string;

  // ---- Tour ----
  /** dash tour: overall-progress step title. */
  tourOverallTitle: string;
  /** dash tour: "Overall mastery" step description (inline HTML). */
  tourOverallDesc: string;
  /** dash tour: blocks step title. */
  tourBlocksTitle: string;
  /** dash tour: blocks step description (mobile + desktop variants, inline HTML). */
  tourBlocksDesc: (isMobile: boolean) => string;
  /** mod tour: "Apply tab" step description. */
  tourApplyDesc: string;
  /** quiz step on the mod tour (inline HTML). */
  tourQuizDesc: string;
  /** scen tour description (inline HTML). */
  tourScenDesc: string;
  /** exam tour title. */
  tourExamTitle: string;
  /** exam tour description (inline HTML). */
  tourExamDesc: string;
  /** start tour description. */
  tourStartDesc: string;

  // ---- Scenarios ----
  /** Locked/paywall tagline. */
  scenLockedTagline: string;
  /** Unlocked intro tagline (plain text). */
  scenIntroTagline: string;
  /** Per-block hint telling the learner when to attempt that block's scenarios. */
  scenWhenHint: string;

  // ---- StartHere ----
  startTagline: string;
  startWhatTitle: string;
  /** "What this field actually is" body (inline HTML). */
  startWhatBody: string;
  startInteractionTitle: string;
  startPathTitle: string;
  /** Path list items (inline HTML each). */
  startPathItems: string[];
  /** First note paragraph under the path card (inline HTML). */
  startPathNote: string;
  /**
   * Optional replacement for the hardcoded "one interaction" orientation card.
   * Omit to keep the ai-eng JSX (what ai-eng and ai-foundations do). Inline HTML.
   */
  startInteraction?: { lead: string; mono: string; body: string; items: string[] };
  /** Optional replacement for the hardcoded "cast of characters" card. Inline HTML. */
  startCast?: { title: string; items: string[] };
  /** Optional replacement for the hardcoded prerequisites note. Inline HTML. */
  startPrereqNote?: string;
  /** Begin button label. */
  startBeginBtn: string;
  /** First module id the Begin button jumps to. */
  startBeginMod: string;

  // ---- TutorBot ----
  /** Empty-state hint in the tutor panel. */
  tutorHint: string;
};

// DEFAULT = the existing AI Engineering Mastery ('ai-eng') copy, byte-for-byte.
const DEFAULT_LABELS: LearnLabels = {
  dashNewBefore:
    "This hub assumes only basic programming knowledge. Take 15 minutes on",
  dashNewAfter:
    "first — it gives you the mental model everything else builds on, and every module opens with a plain-English intro.",
  dashTitle: "Your Mastery Dashboard",
  dashTagline: (passQuiz, passExam) =>
    `Mastery = read the module + score ≥${passQuiz}% on its quiz. Block mastery adds the exam at ≥${passExam}%.`,
  dashOverall: "Overall mastery",
  dashExamsStat: "Mastery exams passed",
  dashHowTitle: "How to use this hub",
  dashHowRead: (passQuiz) =>
    `<b>Read</b> each module's three tabs — <b>Learn</b> (concepts), <b>Apply</b> (worked example, production checklist, build exercise), <b>Resources</b> (curated, with when-to-use) — then take its <b>quiz</b> (≥${passQuiz}% to master). Work block by block.`,
  dashHowBuild:
    "Do the <b>Build it</b> exercise for each module. Quizzes verify understanding; building creates it. The portfolio that results is also your credibility artifact.",
  dashHowScenarios:
    "Do the <b>scenarios</b> once a block's modules are mastered — they test production judgment, the senior-level skill.",
  dashHowExam: (passExam) =>
    `Pass the <b>mastery exam</b> (20 questions sampled across the block, ≥${passExam}%) to lock in the block.`,

  tourOverallTitle: "Overall mastery",
  tourOverallDesc:
    "A module counts as <b>mastered</b> once you've read it and scored ≥80% on its quiz. This bar tracks the whole course.",
  tourBlocksTitle: "21 modules, 5 blocks",
  tourBlocksDesc: (isMobile) =>
    isMobile
      ? "The course is grouped into 5 blocks. Tap <b>Study</b> on a block to dive in, or use ☰ (top-left) to jump anywhere."
      : "The course is grouped into 5 blocks. Hit <b>Study</b> on a block to dive in, or use the menu on the left to jump anywhere.",
  tourApplyDesc:
    "A worked example, a production checklist, and a hands-on build exercise.",
  tourQuizDesc:
    "When you've worked through the tabs, mark the module read and take its quiz — score ≥80% to master it.",
  tourScenDesc:
    "Real production dilemmas. Write (or speak) your own answer <b>first</b>, then reveal the model answer and get AI feedback — retrieval practice is where senior judgment forms.",
  tourExamTitle: "Mastery exam",
  tourExamDesc:
    "An exam samples ~20 questions from across the whole block. Master the block's modules first, then pass at ≥85% to lock the block in.",
  tourStartDesc:
    "A ~15-minute orientation that gives you the mental model the rest of the course builds on. Worth doing first if you're newer to AI engineering.",

  scenLockedTagline: "Production-judgment challenges across all five blocks.",
  scenIntroTagline:
    "Production judgment under realistic conditions. Write or speak your answer BEFORE revealing the model answer — retrieval practice is where mastery forms. Then self-grade honestly against the key points.",
  scenWhenHint:
    "Attempt these once you've worked through this block's modules — they test whether the judgment stuck.",

  startTagline:
    "No AI background needed. Fifteen minutes of orientation, then the curriculum will make sense.",
  startWhatTitle: "What this field actually is",
  startWhatBody:
    "Companies like Anthropic, OpenAI, and Google spend months and billions training <b>large language models</b> — programs that predict the next word so well they can write, reason, and code. You will never train one. <b>AI engineering is building products on top of finished models</b>: you send them text over the internet, get text back, and everything else — making answers accurate, fast, affordable, safe, and connected to your data — is your job. That 'everything else' is exactly what the 21 modules here teach.",
  startInteractionTitle: "The one interaction that underlies everything",
  startPathTitle: "Your path through this hub",
  startPathItems: [
    "<b>Block 1 (Foundations)</b> teaches the model itself: tokens and cost, writing instructions, managing the window, choosing models. Everything else builds on it.",
    "<b>Block 2 (RAG & Knowledge)</b> connects models to YOUR data — the most common real-world AI product.",
    "<b>Block 3 (Agents & Harnesses)</b> gives models the ability to act, and the machinery that keeps them reliable.",
    "<b>Block 4 (Production & Leadership)</b> is shipping for real: testing, safety, architecture, judgment.",
  ],
  startPathNote:
    "Each module starts with an <b style=\"color:var(--teal)\">In plain English</b> box — read just those across all 21 modules first if you want a fast aerial view. Any unfamiliar word lives in the <b>Glossary</b> (sidebar). When a 'How it actually works' section feels deep on a first pass, skip it and return after the quiz — the layers are designed for multiple passes.",
  startBeginBtn: "Begin Block 1: LLM Fundamentals →",
  startBeginMod: "llm",

  tutorHint:
    "Ask anything about the course — LLMs, RAG, agents, evals, production engineering… I only answer on course topics.",
};

// Beginner reframes for 'ai-foundations'. Voice: warm, plain-English, no jargon
// (matches the ModuleView beginner mappings and the authored ai-foundations
// content, which is 8 modules across 2 blocks).
const AI_FOUNDATIONS_LABELS: LearnLabels = {
  dashNewBefore:
    "This course assumes no AI background at all. Take 15 minutes on",
  dashNewAfter:
    "first — it gives you the mental picture everything else builds on, and every lesson opens with a plain-English intro.",
  dashTitle: "Your Dashboard",
  dashTagline: (passQuiz, passExam) =>
    `Finished a lesson = read it + score ≥${passQuiz}% on its quiz. Finishing a block adds its review at ≥${passExam}%.`,
  dashOverall: "Overall progress",
  dashExamsStat: "Block reviews passed",
  dashHowTitle: "How to use this course",
  dashHowRead: (passQuiz) =>
    `<b>Read</b> each lesson's three tabs — <b>Learn</b> (the idea), <b>Apply</b> (a worked example and a small hands-on try-it), <b>Resources</b> (handpicked links, with when-to-use) — then take its <b>quiz</b> (≥${passQuiz}% to finish). Work through one block at a time.`,
  dashHowBuild:
    "Do the <b>Try it</b> exercise for each lesson. Quizzes check that it clicked; doing it yourself is what makes it stick. You'll come away with things you actually built.",
  dashHowScenarios:
    "Do the <b>scenarios</b> once a block's lessons are done — they let you practice making the call in a realistic situation.",
  dashHowExam: (passExam) =>
    `Pass the <b>block review</b> (20 questions sampled across the block, ≥${passExam}%) to wrap up the block.`,

  tourOverallTitle: "Overall progress",
  tourOverallDesc:
    "A lesson counts as <b>done</b> once you've read it and scored ≥80% on its quiz. This bar tracks the whole course.",
  tourBlocksTitle: "8 lessons, 2 blocks",
  tourBlocksDesc: (isMobile) =>
    isMobile
      ? "The course is grouped into 2 blocks. Tap <b>Study</b> on a block to dive in, or use ☰ (top-left) to jump anywhere."
      : "The course is grouped into 2 blocks. Hit <b>Study</b> on a block to dive in, or use the menu on the left to jump anywhere.",
  tourApplyDesc:
    "A worked example and a small, hands-on try-it exercise.",
  tourQuizDesc:
    "When you've worked through the tabs, mark the lesson read and take its quiz — score ≥80% to finish it.",
  tourScenDesc:
    "Real-world situations. Write (or speak) your own answer <b>first</b>, then reveal a strong answer and get AI feedback — trying it yourself first is where it really sinks in.",
  tourExamTitle: "Block review",
  tourExamDesc:
    "A review samples ~20 questions from across the whole block. Finish the block's lessons first, then pass at ≥85% to wrap it up.",
  tourStartDesc:
    "A ~15-minute orientation that gives you the mental picture the rest of the course builds on. Worth doing first if you're brand new to AI.",

  scenLockedTagline: "Real-world situations to practice on, across both blocks.",
  scenIntroTagline:
    "Realistic situations to think through. Write or speak your answer BEFORE revealing a strong answer — trying it yourself first is where it really sinks in. Then grade yourself honestly against the key points.",
  scenWhenHint:
    "Try these once you've finished this block's lessons — they let you practice using the ideas on a real-world situation.",

  startTagline:
    "No AI background needed. Fifteen minutes of orientation, then the rest of the course will make sense.",
  startWhatTitle: "What this is, in plain English",
  startWhatBody:
    "Companies like Anthropic, OpenAI, and Google spend months and billions training <b>large language models</b> — programs that predict the next word so well they can write, reason, and code. You'll never have to train one. <b>Using AI well is mostly about working with these finished models</b>: you send them text, you get text back, and the skill is in how you ask, what you give them to work with, and how you check their answers. That is exactly what the lessons here teach — no math or coding required.",
  startInteractionTitle: "The one interaction that underlies everything",
  startPathTitle: "Your path through this course",
  startPathItems: [
    "<b>Block 1 (Getting Started)</b> covers the model itself: what tokens are, how to write a good prompt, and what the model can and can't remember. Everything else builds on it.",
    "<b>Block 2 (Working With Models)</b> is about getting useful results: giving the model your own information, checking its answers, and knowing when to trust it.",
  ],
  startPathNote:
    "Each lesson starts with an <b style=\"color:var(--teal)\">In plain English</b> box — read just those across all the lessons first if you want a fast overview. Any unfamiliar word lives in the <b>Glossary</b> (sidebar). When a section feels deep on a first pass, skip it and come back after the quiz — it's fine to read things more than once.",
  startBeginBtn: "Begin Block 1: Getting Started →",
  startBeginMod: "whatai",

  tutorHint:
    "Ask anything about the course — how LLMs work, tokens, prompts, what to trust… I only answer on course topics.",
};

// Senior/architect reframes for 'ai-architect'. Voice: peer-to-peer, assumes the
// component knowledge the Mastery Hub teaches, and talks in artifacts and numbers
// rather than lessons (12 modules across 4 blocks). The DEFAULT copy above is
// written for ai-eng and states facts that are wrong here — 21 modules, 5 blocks,
// "no AI background needed", and a Begin button pointing at a module this course
// does not have — so every one of those is overridden.
const AI_ARCHITECT_LABELS: LearnLabels = {
  dashNewBefore:
    "This course assumes you already know how the components work. Take 15 minutes on",
  dashNewAfter:
    "first — it sets out the six numbers every later module consumes, and what the course assumes you bring.",
  dashTitle: "Your Architecture Dashboard",
  dashTagline: (passQuiz, passExam) =>
    `Mastery = read the module + score ≥${passQuiz}% on its quiz. Block mastery adds the exam at ≥${passExam}%.`,
  dashOverall: "Overall mastery",
  dashExamsStat: "Mastery exams passed",
  dashHowTitle: "How to use this course",
  dashHowRead: (passQuiz) =>
    `<b>Read</b> each module's four tabs — <b>Learn</b> (the decision and its mechanism), <b>Apply</b> (a worked example with the arithmetic shown, and the artifact to build), <b>Resources</b> (curated, with when-to-use), <b>Patterns</b> (a calculator you can run) — then take its <b>quiz</b> (≥${passQuiz}% to master). Work block by block.`,
  dashHowBuild:
    "Do the <b>Build it</b> exercise for each module against a system you actually own. Twelve modules produce twelve artifacts, and the capstone assembles them into one architecture document you can defend in review.",
  dashHowScenarios:
    "Do the <b>scenarios</b> once a block's modules are mastered — they put you at the design table with a decision to commit to, and one per block hands you someone else's architecture to review.",
  dashHowExam: (passExam) =>
    `Pass the <b>mastery exam</b> (20 questions sampled across the block, ≥${passExam}%) to lock in the block.`,

  tourOverallTitle: "Overall mastery",
  tourOverallDesc:
    "A module counts as <b>mastered</b> once you've read it and scored ≥80% on its quiz. This bar tracks the whole course.",
  tourBlocksTitle: "12 modules, 4 blocks",
  tourBlocksDesc: (isMobile) =>
    isMobile
      ? "The course is grouped into 4 blocks. Tap <b>Study</b> on a block to dive in, or use ☰ (top-left) to jump anywhere."
      : "The course is grouped into 4 blocks. Hit <b>Study</b> on a block to dive in, or use the menu on the left to jump anywhere.",
  tourApplyDesc:
    "A worked example with the arithmetic shown, and the artifact this module asks you to build.",
  tourQuizDesc:
    "When you've worked through the tabs, mark the module read and take its quiz — score ≥80% to master it.",
  tourScenDesc:
    "Decisions, not incidents — nothing is on fire yet and you have to commit. Write (or speak) your own answer <b>first</b>, then reveal the model answer and get AI feedback. Naming the number that justifies the call is the skill being practiced.",
  tourExamTitle: "Mastery exam",
  tourExamDesc:
    "An exam samples ~20 questions from across the whole block. Master the block's modules first, then pass at ≥85% to lock the block in.",
  tourStartDesc:
    "A short orientation: what this course assumes you already know, and the six numbers the rest of it is built on.",

  scenLockedTagline: "Design-table decisions and architecture reviews across all four blocks.",
  scenIntroTagline:
    "Design decisions under realistic constraints. Write or speak your answer BEFORE revealing the model answer — retrieval practice is where judgment forms. A good answer names the number that forced the call, not just the choice.",
  scenWhenHint:
    "Attempt these once you've worked through this block's modules — they test whether you can commit to a decision and defend it.",

  startTagline:
    "What this course assumes, and the six numbers everything after it depends on.",
  startWhatTitle: "What this course actually is",
  startWhatBody:
    "This is not a course about how the components work. It assumes you already know what retrieval, agents, tool calls and evals are — if you want the mechanics, the <b>AI Engineering Mastery Hub</b> teaches exactly that and this course picks up after it. <b>An architecture is a set of committed constraints</b> — expressed as budgets, seams, and failure containment — derived from requirements and defensible in review. Mastery teaches you what the boxes are; this teaches you which boxes you are allowed to draw, how big each one is, and what evidence justifies it. Every module ends in one artifact with real numbers in it.",
  startInteractionTitle: "The one question underneath every module",
  startPathTitle: "Your path through this course",
  startPathItems: [
    "<b>Block 1 (From Requirements to Architecture)</b> turns a vague ask into six binding numbers, allocates them across the pipeline as budgets, and picks the cheapest system shape those numbers permit.",
    "<b>Block 2 (Designing for Failure)</b> enumerates the failures a 200 OK hides, bounds what a compromised turn can reach, and writes the degradation ladder before the incident.",
    "<b>Block 3 (Architecture That Survives Change)</b> prices your exit from every vendor, writes the freshness contract for each derived copy of the truth, and makes changing the model a Tuesday.",
    "<b>Block 4 (Governing the System)</b> places the control points that are allowed to say no, draws the ownership boundaries you will ship anyway, and assembles the whole thing into a document that survives a hostile review.",
  ],
  startPathNote:
    "Each module starts with an <b style=\"color:var(--teal)\">In plain English</b> box, and ends with a <b>Patterns</b> tab holding a small program — a calculator, a register, or a linter — that takes your design facts and prints a number or a verdict. They are standard-library Python with no keys and no network, so you can run them against your own system today. Any unfamiliar term lives in the <b>Glossary</b> (sidebar).",
  startInteraction: {
    lead: "Every decision in this course reduces to the same question, asked at a different scale:",
    mono: "GIVEN &rarr; p95 3.5s &middot; $0.08 per task &middot; 92% quality &middot; 40k tasks/day &middot; worst case: an auto-closed ticket<br><br>DECIDE &rarr; which boxes exist, how big each one is, and what evidence justifies drawing them",
    body: "That is the whole job. The components are a solved problem you can look up; the sizing, the ordering, and the authorization are not. Three properties of this material make it behave unlike the systems architecture you already know:",
    items: [
      "<b>Budgets are allocated, never summed.</b> You start from the number you promised and subtract, because reliability composes multiplicatively and latency does not compose the way a spreadsheet suggests.",
      "<b>The worst failures return 200 OK.</b> Nothing raises. Every failure class needs a detector you designed, or a structure that makes it impossible — and you may not plan a mitigation for a failure you cannot observe.",
      "<b>Every capability the model has is a capability an attacker has.</b> So the question is never how to stop a bad generation, it is what the worst reachable action is once you assume one.",
    ],
  },
  startCast: {
    title: "What you will have at the end",
    items: [
      "<b>Twelve artifacts, one per module</b> — a spec card, three budget tables, an FMEA, an action inventory, a degradation ladder, an exit memo, a derived-state register, a migration runbook, a control-point map and an ownership matrix.",
      "<b>Twelve calculators</b> — each module's Patterns tab holds a small standard-library Python program (no keys, no network) that takes your design facts and prints a number or a verdict you can paste into a design doc.",
      "<b>One architecture document</b> — the capstone assembles the other eleven artifacts and lints them against each other for contradictions, which is the thing you actually defend in review.",
      "<b>The habit of writing down the constraint, not the conclusion</b> — so that in twelve months someone can tell whether the reason you chose this has expired.",
    ],
  },
  startPrereqNote:
    "Assumed: you have shipped something on top of a model and know what retrieval, agents, tool calls and evals are. Not needed: ML theory or math — the arithmetic here is composition, queueing and statistical power, and all of it ships as runnable code in the Patterns tab.",
  startBeginBtn: "Begin Block 1: From Requirements to Constraints →",
  startBeginMod: "reqs",

  tutorHint:
    "Ask anything about architecting AI systems — budgets, failure modes, blast radius, capacity, migrations, control points… I only answer on course topics.",
};

const LABELS_BY_COURSE: Record<string, LearnLabels> = {
  "ai-foundations": AI_FOUNDATIONS_LABELS,
  "ai-architect": AI_ARCHITECT_LABELS,
};

export function learnLabelsFor(courseSlug: string): LearnLabels {
  return LABELS_BY_COURSE[courseSlug] ?? DEFAULT_LABELS;
}
