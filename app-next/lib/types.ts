// Shared types for content rows and progress.
export type ContentRow = { id: string; tier: "public" | "paid"; data: unknown };

export type ProgressState = {
  read?: Record<string, boolean>;
  quiz?: Record<string, { best: number; attempts: number }>;
  exams?: Record<string, { best: number; passed: boolean; attempts: number }>;
  cards?: Record<number, { box: number; due: string }>;
  scen?: Record<string, "nailed" | "partial" | "missed">;
  scennote?: Record<string, string>;
  /** Guided-lab step completion: module id -> step index -> done. */
  labs?: Record<string, Record<number, boolean>>;
  visits?: string[];
  act?: string[];
  toured?: boolean; // legacy single-tour flag (superseded by `tours`)
  tours?: Record<string, boolean>; // per-area tours already shown, keyed by page id
  name?: string;
  nameAsked?: boolean;
  [k: string]: unknown;
};
