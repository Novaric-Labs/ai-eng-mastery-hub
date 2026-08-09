// Course data model + assembly from server-gated `content` rows.
//
// The server (app/learn/page.tsx) fetches the `content` table under the user's
// RLS scope and passes the rows here. Public rows (blocks/catalog/glossary/plain
// + the sample module) always arrive; paid rows (other modules, quizzes, cards,
// scenarios) only arrive for entitled users — so `buildCourse` naturally yields
// a "locked" course for non-entitled visitors and the views render paywalls.

import type { ContentRow, ProgressState } from "./types";

export type Block = { id: string; name: string };

export type ModuleMeta = {
  id: string;
  block: string;
  title: string;
  tag: string;
  why: string;
  isNew?: boolean;
  isUpd?: boolean;
  estMin?: number;
};

export type ModuleFull = ModuleMeta & {
  mental: string;
  concepts: [string, string][];
  mistakes: string[];
  flags: string[];
  ask: string[];
};

export type Deep = {
  worked: string;
  good: string[];
  build: string;
  res: [string, string, string][];
};

export type Depth = {
  mech: string;
  trade: [string, string, string][];
  scale: string[];
  sec: string[];
  interview: string;
};

export type Patterns = {
  intro: string;
  code: string;
  notes: string[];
  debug: [string, string, string][];
};

export type ModuleBundle = {
  mod: ModuleFull;
  deep: Deep | null;
  depth: Depth | null;
  patterns: Patterns | null;
};

// Per-module preface video. Only modules that genuinely benefit get an entry,
// so `videos` is sparse. `src`/`poster` are object paths inside the private
// `course-video` Storage bucket (resolved to signed URLs by /api/video/[id]).
// `tier` mirrors the content model: "public" videos are free teasers shown even
// on locked modules; "paid" videos require an entitlement to play.
export type VideoMeta = {
  src: string;
  poster?: string;
  vtt?: string;
  duration?: number;
  title?: string;
  caption?: string;
  tier?: "public" | "paid";
};

export type QuizItem = { q: string; o: string[]; a: number; exp: string };
export type Card = { m: string; f: string; b: string };
export type Scenario = {
  id: string;
  block: string;
  title: string;
  sit: string;
  task: string;
  model: string;
  pts: string[];
};
export type GlossTerm = [string, string, string];

export type Course = {
  blocks: Block[];
  /** Every module's lightweight catalog entry (always present — drives nav). */
  catalog: ModuleMeta[];
  /** Full per-module bundles, keyed by id. Only entitled/sample ids are present. */
  modules: Record<string, ModuleBundle>;
  /** Quiz items keyed by module id. Only available for unlocked modules. */
  quizzes: Record<string, QuizItem[]>;
  /** null when the paid collection wasn't returned (locked). */
  cards: Card[] | null;
  scenarios: Scenario[] | null;
  glossary: GlossTerm[];
  plain: Record<string, string>;
  /** Preface videos keyed by module id. Sparse — only some modules have one. */
  videos: Record<string, VideoMeta>;
};

// Default per-module time estimates (minutes). The vanilla app seeds these at
// runtime; mirror them here so catalog entries without estMin still show a time.
const EST: Record<string, number> = {
  llm: 35, prompt: 30, context: 30, landscape: 25,
  rag: 40, embed: 30, vecdb: 30, memory: 30,
  agents: 35, tools: 30, harness: 40, multi: 30,
  design: 40, evals: 40, halluc: 35, lead: 35,
  finetune: 50, aisec: 45, mlops: 45, dataeng: 45, multimodal: 40,
};

export function buildCourse(rows: ContentRow[]): Course {
  const byId = new Map<string, unknown>();
  for (const r of rows) byId.set(r.id, r.data);

  const blocks = (byId.get("meta:blocks") as Block[]) ?? [];
  const catalog = ((byId.get("meta:catalog") as ModuleMeta[]) ?? []).map((m) => ({
    ...m,
    estMin: m.estMin || EST[m.id] || 30,
  }));
  const glossary = (byId.get("glossary") as GlossTerm[]) ?? [];
  const plain = (byId.get("plain") as Record<string, string>) ?? {};
  const videos = (byId.get("videos") as Record<string, VideoMeta>) ?? {};

  const modules: Record<string, ModuleBundle> = {};
  const quizzes: Record<string, QuizItem[]> = {};
  for (const [id, data] of byId) {
    if (id.startsWith("module:")) {
      modules[id.slice(7)] = data as ModuleBundle;
    } else if (id.startsWith("quiz:")) {
      quizzes[id.slice(5)] = (data as QuizItem[]) ?? [];
    }
  }

  return {
    blocks,
    catalog,
    modules,
    quizzes,
    cards: (byId.get("cards") as Card[]) ?? null,
    scenarios: (byId.get("scenarios") as Scenario[]) ?? null,
    glossary,
    plain,
    videos,
  };
}

/* ================= derived selectors (course + progress) ================= */

export const PASS_QUIZ = 80;
export const PASS_EXAM = 85;
export const INTERVALS = [0, 1, 3, 7]; // Leitner box → days until due

export function todayStr(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function blockMods(c: Course, b: string): ModuleMeta[] {
  return c.catalog.filter((m) => m.block === b);
}

export function modQuizBest(S: ProgressState, id: string): number {
  return (S.quiz?.[id]?.best as number) || 0;
}

export function modMastered(S: ProgressState, id: string): boolean {
  return !!S.read?.[id] && modQuizBest(S, id) >= PASS_QUIZ;
}

export function blockMastered(c: Course, S: ProgressState, b: string): boolean {
  return (
    blockMods(c, b).every((m) => modMastered(S, m.id)) &&
    !!S.exams?.[b]?.passed
  );
}

/** Whether a module's full content (and quiz) is unlocked for this user. */
export function moduleUnlocked(c: Course, id: string): boolean {
  return !!c.modules[id];
}

export function cardState(
  S: ProgressState,
  i: number,
  today: string,
): { box: number; due: string } {
  return (S.cards?.[i] as { box: number; due: string }) || { box: 0, due: today };
}

export function dueCards(
  c: Course,
  S: ProgressState,
  today: string,
): { c: Card; i: number }[] {
  if (!c.cards) return [];
  return c.cards
    .map((card, i) => ({ c: card, i }))
    .filter(({ c: card, i }) => S.read?.[card.m] && cardState(S, i, today).due <= today);
}

export function unlockedCards(c: Course, S: ProgressState): Card[] {
  if (!c.cards) return [];
  return c.cards.filter((card) => S.read?.[card.m]);
}

export function lockedCardCount(c: Course, S: ProgressState): number {
  if (!c.cards) return 0;
  return c.cards.filter((card) => !S.read?.[card.m]).length;
}

export function masteredCardCount(c: Course, S: ProgressState): number {
  if (!c.cards) return 0;
  return c.cards.filter((card, i) => S.read?.[card.m] && (S.cards?.[i]?.box ?? 0) >= 3).length;
}

/* ----- streak / XP / level (audit 3.2 parity) ----- */

export function currentStreak(S: ProgressState, now: Date): number {
  const set = new Set(S.visits ?? []);
  const d = new Date(now);
  if (!set.has(todayStr(d))) return 0;
  let n = 0;
  while (set.has(todayStr(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const XP = { read: 10, quiz: 25, exam: 50, card: 5, nailed: 15, partial: 8 };

export function totalXp(c: Course, S: ProgressState): number {
  let x = 0;
  c.catalog.forEach((m) => {
    if (S.read?.[m.id]) x += XP.read;
    if (modQuizBest(S, m.id) >= PASS_QUIZ) x += XP.quiz;
  });
  c.blocks.forEach((b) => {
    if (S.exams?.[b.id]?.passed) x += XP.exam;
  });
  (c.cards ?? []).forEach((card, i) => {
    if (S.read?.[card.m] && (S.cards?.[i]?.box ?? 0) >= 3) x += XP.card;
  });
  Object.values(S.scen ?? {}).forEach((g) => {
    if (g === "nailed") x += XP.nailed;
    else if (g === "partial") x += XP.partial;
  });
  return x;
}

export type LevelInfo = {
  lvl: number;
  total: number;
  into: number;
  need: number;
  pct: number;
};

export function levelInfo(c: Course, S: ProgressState): LevelInfo {
  const total = totalXp(c, S);
  let lvl = 1, need = 120, acc = 0;
  while (total >= acc + need) {
    acc += need;
    lvl++;
    need = Math.round(need * 1.35);
  }
  return { lvl, total, into: total - acc, need, pct: Math.round((100 * (total - acc)) / need) };
}

// A space-crew rank title derived from level — pure cosmetic flavor shown next
// to the level number in the dashboard hero and sidebar.
export function rankFor(lvl: number): string {
  if (lvl >= 12) return "Admiral";
  if (lvl >= 10) return "Voyager";
  if (lvl >= 8) return "Captain";
  if (lvl >= 6) return "Commander";
  if (lvl >= 4) return "Navigator";
  if (lvl >= 2) return "Pilot";
  return "Cadet";
}

export function fmtMin(min: number): string {
  if (min < 60) return "~" + min + " min";
  const h = Math.floor(min / 60), m = min % 60;
  return m ? "~" + h + "h " + m + "m" : "~" + h + "h";
}

export function blockRemaining(c: Course, S: ProgressState, b: string): number {
  return blockMods(c, b)
    .filter((m) => !modMastered(S, m.id))
    .reduce((s, m) => s + (m.estMin || 30), 0);
}

/* ----- course completion (certificate eligibility) ----- */

// A course is "complete" only when EVERY block is mastered — i.e. every module
// read + quiz passed AND every block mastery exam passed. This is proof of
// graded work, the basis a certificate attests to (not mere attendance).
export function courseComplete(c: Course, S: ProgressState): boolean {
  return c.blocks.length > 0 && c.blocks.every((b) => blockMastered(c, S, b.id));
}

// A snapshot of what was demonstrated, frozen onto the certificate at issue time.
export type CompletionSummary = {
  modulesMastered: number;
  modulesTotal: number;
  examsPassed: number;
  examsTotal: number;
  /** Average best score across the passed block exams. */
  examAvg: number;
  scenariosCompleted: number;
  level: number;
  xp: number;
};

export function completionSummary(c: Course, S: ProgressState): CompletionSummary {
  const passed = c.blocks.filter((b) => S.exams?.[b.id]?.passed);
  const examAvg = passed.length
    ? Math.round(
        passed.reduce((sum, b) => sum + (S.exams![b.id].best || 0), 0) / passed.length,
      )
    : 0;
  const li = levelInfo(c, S);
  return {
    modulesMastered: c.catalog.filter((m) => modMastered(S, m.id)).length,
    modulesTotal: c.catalog.length,
    examsPassed: passed.length,
    examsTotal: c.blocks.length,
    examAvg,
    scenariosCompleted: Object.keys(S.scen ?? {}).length,
    level: li.lvl,
    xp: li.total,
  };
}
