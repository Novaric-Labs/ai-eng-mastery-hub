// Shared types for content rows and progress.
export type ContentRow = { id: string; tier: "public" | "paid"; data: unknown };

export type ProgressState = {
  read?: Record<string, boolean>;
  quiz?: Record<string, { best: number; attempts: number }>;
  exams?: Record<string, { best: number; passed: boolean; attempts: number }>;
  cards?: Record<number, { box: number; due: string }>;
  scen?: Record<string, string>;
  visits?: string[];
  act?: string[];
  [k: string]: unknown;
};
