import { tooSoon } from "@/lib/anthropic";

// Shared, cross-instance rate limiting for the cost-bearing AI endpoints.
//
// PRIMARY: Upstash Redis (via @upstash/ratelimit) gives a single global limit
// across all serverless instances — the right tool for Vercel's many-lambda
// runtime, where the in-memory cooldown only bounds one instance.
//
// FALLBACK: if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are NOT set
// (dev/preview, or prod before infra is provisioned), this module NO-OPs the
// Redis layer and falls back to the existing in-memory per-user cooldown
// (`tooSoon`). It NEVER throws on missing env, and a Redis outage fails OPEN to
// the cooldown so the app keeps working. Merging this before infra exists is safe.

export type Kind = "tutor" | "explain" | "grade";

// Per-user sliding-window limits, chosen to be generous for real study sessions
// but to cap runaway/abusive cost. Tutor + explain are cheap, interactive, and
// bursty (a learner clicking through a lesson), so ~20/min. Grade is the most
// expensive call (largest prompt + output, server-side scenario fetch) and is
// inherently slower/deliberate, so it's tighter at ~10/min.
const LIMITS: Record<Kind, { tokens: number; window: `${number} m` }> = {
  tutor: { tokens: 20, window: "1 m" },
  explain: { tokens: 20, window: "1 m" },
  grade: { tokens: 10, window: "1 m" },
};

// In-memory cooldown spacing (ms) used by the fallback layer, mirroring the
// previous per-route `tooSoon` values.
const COOLDOWN_MS: Record<Kind, number> = {
  tutor: 1500,
  explain: 800,
  grade: 1500,
};

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

// Lazily-built limiters, keyed by Kind. Built once per instance, only when
// Upstash env is present. Typed loosely to avoid a hard dependency at import
// time and to keep the fallback path free of the Upstash SDK.
type Limiter = { limit: (id: string) => Promise<{ success: boolean; reset: number }> };
let limiters: Partial<Record<Kind, Limiter>> | null = null;
let upstashConfigured: boolean | null = null;

function getLimiters(): Partial<Record<Kind, Limiter>> | null {
  if (upstashConfigured === false) return null;
  if (limiters) return limiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashConfigured = false;
    return null;
  }

  try {
    // Require lazily so the fallback path never needs these modules installed/loaded.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Ratelimit } = require("@upstash/ratelimit");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis");
    const redis = new Redis({ url, token });
    limiters = {};
    for (const kind of Object.keys(LIMITS) as Kind[]) {
      const { tokens, window } = LIMITS[kind];
      limiters[kind] = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        prefix: `nv:rl:${kind}`,
        analytics: false,
      });
    }
    upstashConfigured = true;
    return limiters;
  } catch {
    // SDK missing or misconfigured — fail open to the cooldown fallback.
    upstashConfigured = false;
    return null;
  }
}

/**
 * Rate-limit one AI request for `userId`.
 *
 * - With Upstash configured: enforces the shared sliding-window limit and, on
 *   reject, returns the seconds until the window resets for `Retry-After`.
 * - Without Upstash (or on Redis error): falls back to the in-memory per-user
 *   cooldown and never throws.
 */
export async function rateLimit(userId: string, kind: Kind): Promise<RateResult> {
  const ls = getLimiters();
  if (ls && ls[kind]) {
    try {
      const { success, reset } = await ls[kind]!.limit(userId);
      if (success) return { ok: true };
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfter };
    } catch {
      // Redis hiccup: fail open to the cooldown rather than blocking users.
    }
  }

  // Fallback: in-memory per-user cooldown (per serverless instance).
  if (tooSoon(userId, COOLDOWN_MS[kind])) {
    return { ok: false, retryAfter: Math.ceil(COOLDOWN_MS[kind] / 1000) };
  }
  return { ok: true };
}

/** Standard 429 JSON response with a Retry-After header. */
export function tooManyRequests(retryAfter: number, message: string) {
  // Imported here to avoid pulling next/server into the limiter's type surface.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NextResponse } = require("next/server");
  return NextResponse.json(
    { error: message, retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
