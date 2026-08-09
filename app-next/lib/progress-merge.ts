import type { ProgressState } from "./types";

// Union-merge two progress states so a sync write can only ever ADD
// achievement, never erase it. Used before every server upsert: progress sync
// is whole-blob last-write-wins, so without this a stale open tab (or a
// session started after a failed initial fetch) would overwrite newer
// progress from another device with its old snapshot. Merging on both sides
// means concurrent writers converge instead of clobbering each other.
//
// Two deliberate exceptions to "only add":
//   - `reset` tombstone: a deliberate reset must not be resurrected by the
//     union — the newer reset stamp wins wholesale.
//   - scen / scennote / name: direct user input, local wins per key (the
//     device where the user just clicked must not see its choice revert).
export function mergeProgress(server: ProgressState, local: ProgressState): ProgressState {
  // Reset tombstone: resetProgress() stamps S.reset with an ISO timestamp.
  // Differing stamps mean one side reset after the other last synced — the
  // newer reset wins outright and pre-reset achievements stay dropped.
  const localReset = typeof local.reset === "string" ? local.reset : "";
  const serverReset = typeof server.reset === "string" ? server.reset : "";
  if (localReset !== serverReset) {
    return localReset > serverReset ? { ...local } : { ...server };
  }

  const merged: ProgressState = { ...server, ...local };
  const has = (k: keyof ProgressState) => server[k] !== undefined || local[k] !== undefined;

  // read: a module read anywhere is read.
  if (has("read")) merged.read = { ...(server.read ?? {}), ...(local.read ?? {}) };

  // quiz/exams: keep the best score, the most attempts, and passed-if-ever.
  if (has("quiz")) {
    const quiz: NonNullable<ProgressState["quiz"]> = { ...(server.quiz ?? {}) };
    for (const [k, v] of Object.entries(local.quiz ?? {})) {
      const s = quiz[k];
      quiz[k] = s
        ? { best: Math.max(s.best, v.best), attempts: Math.max(s.attempts, v.attempts) }
        : v;
    }
    merged.quiz = quiz;
  }

  if (has("exams")) {
    const exams: NonNullable<ProgressState["exams"]> = { ...(server.exams ?? {}) };
    for (const [k, v] of Object.entries(local.exams ?? {})) {
      const s = exams[k];
      exams[k] = s
        ? {
            best: Math.max(s.best, v.best),
            passed: s.passed || v.passed,
            attempts: Math.max(s.attempts, v.attempts),
          }
        : v;
    }
    merged.exams = exams;
  }

  // cards (spaced repetition): later due date = more recent review. On EQUAL
  // due, the LOWER box wins — failing a card due today writes {box:0,
  // due:today}, and that lapse must beat the pre-lapse box or the Leitner
  // schedule never resets.
  if (has("cards")) {
    const cards: NonNullable<ProgressState["cards"]> = { ...(server.cards ?? {}) };
    for (const [k, v] of Object.entries(local.cards ?? {})) {
      const key = Number(k);
      const s = cards[key];
      cards[key] = !s || v.due > s.due || (v.due === s.due && v.box < s.box) ? v : s;
    }
    merged.cards = cards;
  }

  // scenarios: direct self-assessment — local wins per key so an honest
  // downgrade ("nailed" -> "partial") sticks on the device that made it;
  // union still brings in verdicts this device never recorded.
  if (has("scen")) merged.scen = { ...(server.scen ?? {}), ...(local.scen ?? {}) };
  if (has("scennote")) merged.scennote = { ...(server.scennote ?? {}), ...(local.scennote ?? {}) };

  // day stamps: set union, sorted for stable output.
  if (has("visits"))
    merged.visits = [...new Set([...(server.visits ?? []), ...(local.visits ?? [])])].sort();
  if (has("act"))
    merged.act = [...new Set([...(server.act ?? []), ...(local.act ?? [])])].sort();

  // tours/toured/nameAsked: shown-or-answered anywhere is done. Only
  // materialized when either side has the field, so the merge of two states
  // that never touched it doesn't invent keys (that churn would defeat the
  // did-anything-change check in the sync layer).
  if (has("toured")) merged.toured = Boolean(server.toured || local.toured);
  if (has("tours")) merged.tours = { ...(server.tours ?? {}), ...(local.tours ?? {}) };
  if (has("nameAsked")) merged.nameAsked = Boolean(server.nameAsked || local.nameAsked);

  // name: an explicit local name wins; otherwise keep the server's.
  if (!(typeof local.name === "string" && local.name.trim()) && server.name) {
    merged.name = server.name;
  }

  return merged;
}

// JSON.stringify with recursively sorted object keys, for order-insensitive
// state comparison — Postgres jsonb returns keys in its own canonical order,
// which differs from local insertion order, so plain stringify equality would
// report a difference on every first sync of a session.
export function stableStringify(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(
          Object.entries(val as Record<string, unknown>).sort(([a], [b]) =>
            a < b ? -1 : a > b ? 1 : 0,
          ),
        )
      : val,
  );
}
