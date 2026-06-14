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
