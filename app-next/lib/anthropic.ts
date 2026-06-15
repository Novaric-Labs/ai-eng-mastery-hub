import Anthropic from "@anthropic-ai/sdk";

// Cheap, fast model for grading + tutoring. Guardrails (entitled-only, tight
// max_tokens, input truncation, per-user cooldown) keep cost bounded.
export const HAIKU = "claude-haiku-4-5";

let client: Anthropic | null = null;

/** Returns the Anthropic client, or null if ANTHROPIC_API_KEY isn't configured. */
export function anthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || /placeholder/i.test(key)) return null;
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
}

// Best-effort per-user cooldown (per serverless instance — not a hard global
// limit, but enough to stop a single user spamming requests). The hard cost
// levers are entitled-only access + small max_tokens on every call.
const lastCall = new Map<string, number>();
export function tooSoon(userId: string, ms = 1500): boolean {
  const now = Date.now();
  if (now - (lastCall.get(userId) ?? 0) < ms) return true;
  lastCall.set(userId, now);
  return false;
}

/** Concatenate the model's text output blocks into a single string. */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
