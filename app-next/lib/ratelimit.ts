import { tooSoon } from "@/lib/anthropic";

// Shared, cross-instance rate limiting for the cost-bearing AI endpoints.
//
// PRIMARY: Upstash Redis (via @upstash/ratelimit) gives a single global limit
// across all serverless instances — the right tool for Vercel's many-lambda
// runtime, where the in-memory cooldown only bounds one instance.
//
// FALLBACK: if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are NOT set
// (dev/preview, or prod before infra is provisioned), this module NO-OPs the
// Redis layer and falls back to an in-memory per-user sliding window at the
// same limits, plus the legacy cooldown spacing. It NEVER throws on missing
// env, and a Redis outage degrades to the per-instance window (worst case:
// limit × instance count) so the app keeps working without unbounded spend.

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
// Fallback sliding windows, per instance: `${kind}:${userId}` -> request
// timestamps inside the current window. Enforces the SAME tokens/window as the
// Redis path, so losing Redis degrades to "limit × instance count" instead of
// "unbounded minus a 1.5s spacing" — spacing alone allowed ~40 req/min/user
// per instance on the most expensive endpoint.
const fallbackWindows = new Map<string, number[]>();

function fallbackLimit(userId: string, kind: Kind): RateResult {
  const { tokens, window } = LIMITS[kind];
  const windowMs = parseInt(window) * 60_000;
  const key = `${kind}:${userId}`;
  const now = Date.now();

  // Occasional sweep so the map can't grow unbounded on a long-lived instance.
  if (fallbackWindows.size > 5000) {
    for (const [k, arr] of fallbackWindows) {
      if (!arr.length || now - arr[arr.length - 1] > windowMs) fallbackWindows.delete(k);
    }
  }

  const hits = (fallbackWindows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= tokens) {
    fallbackWindows.set(key, hits);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }
  if (tooSoon(userId, COOLDOWN_MS[kind])) {
    fallbackWindows.set(key, hits);
    return { ok: false, retryAfter: Math.ceil(COOLDOWN_MS[kind] / 1000) };
  }
  hits.push(now);
  fallbackWindows.set(key, hits);
  return { ok: true };
}

export async function rateLimit(userId: string, kind: Kind): Promise<RateResult> {
  const ls = getLimiters();
  if (ls && ls[kind]) {
    try {
      const { success, reset } = await ls[kind]!.limit(userId);
      if (success) return { ok: true };
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfter };
    } catch {
      // Redis hiccup: degrade to the in-memory window rather than blocking users.
    }
  }

  // Fallback: per-instance sliding window + cooldown spacing.
  return fallbackLimit(userId, kind);
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
