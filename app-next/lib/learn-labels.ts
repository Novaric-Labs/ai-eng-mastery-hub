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
  startBeginMod: "llm",

  tutorHint:
    "Ask anything about the course — how LLMs work, tokens, prompts, what to trust… I only answer on course topics.",
};

const LABELS_BY_COURSE: Record<string, LearnLabels> = {
  "ai-foundations": AI_FOUNDATIONS_LABELS,
};

export function learnLabelsFor(courseSlug: string): LearnLabels {
  return LABELS_BY_COURSE[courseSlug] ?? DEFAULT_LABELS;
}
