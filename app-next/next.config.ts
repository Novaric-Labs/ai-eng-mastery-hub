import type { NextConfig } from "next";

// Baseline security response headers applied to every route. These are all
// behavior-preserving for legitimate clients (no CSP here — a strict CSP needs
// per-app tuning for Next's inline runtime + analytics, so it's intentionally
// left for a dedicated, tested change rather than risking breakage site-wide).
const securityHeaders = [
  // Force HTTPS for two years and preload. Production is HTTPS-only behind
  // Vercel; this hardens against protocol-downgrade/SSL-strip attacks.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow MIME sniffing — responses are treated as their declared type only.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow framing to prevent clickjacking. App isn't embedded anywhere.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak full URLs (which can carry ids/tokens) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop powerful features the app doesn't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Keep type-checking on (that's our build-time validation); skip ESLint setup.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
