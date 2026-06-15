// "Keep me signed in / trusted device" support.
//
// Auth is cookie-based (@supabase/ssr), so how long a login survives is set by
// the auth cookies' maxAge:
//   • trusted device   → persistent cookie. It's a SLIDING window: middleware
//     re-sets the cookie on every request, so the session stays alive as long as
//     the user visits within REMEMBER_MAX_AGE, and they don't need a fresh
//     magic link each time.
//   • untrusted device → session cookie (no maxAge), cleared when the browser is
//     fully closed.
//
// The choice is stored in a small, non-sensitive preference cookie set on the
// login page; the server client, middleware, and browser client all read it.

export const REMEMBER_COOKIE = "ai_remember";

// Longest practical "stay signed in" window. Kept reasonably long because it's a
// sliding window (renewed on each request) AND Supabase rotates refresh tokens,
// so a stolen stale cookie is invalidated the moment the real user refreshes.
// A hard cap can also be set in the Supabase dashboard (Auth → Sessions:
// "time-box user sessions" / inactivity timeout), which bounds this regardless.
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

// How long the preference cookie itself lives (just remembers the checkbox).
export const REMEMBER_PREF_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months

// Default to persistent unless the user explicitly opted out ("0"), so existing
// sessions (and links opened on another device) keep working.
export function isRemembered(value: string | undefined | null): boolean {
  return value !== "0";
}

// @supabase/ssr hardcodes a 400-day maxAge on every cookie it sets, so we adjust
// the per-cookie options inside our own setAll callbacks instead: persistent
// (REMEMBER_MAX_AGE) for a trusted device, or a session cookie (no maxAge /
// expires) otherwise.
export function applyRemember<T extends { maxAge?: number; expires?: Date }>(
  options: T,
  remember: boolean,
): T {
  // Deletion (sign-out / chunk cleanup) uses maxAge 0 — never rewrite it, or the
  // cookie would linger instead of being cleared.
  if (options.maxAge === 0) return options;
  if (remember) return { ...options, maxAge: REMEMBER_MAX_AGE };
  const next: Record<string, unknown> = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next as T;
}
