import type { NextConfig } from "next";

// --- Content-Security-Policy (REPORT-ONLY) ---------------------------------
// Shipped as Content-Security-Policy-Report-Only so violations are *reported*
// but nothing is blocked. The owner verifies a clean report on preview/prod,
// then flips it to enforcing (see the "FLIP TO ENFORCING" note below).
//
// It's a STATIC header (set here in headers(), not via a nonce in middleware)
// on purpose: a nonce-based CSP forces every page to render dynamically, which
// would regress the static generation of the marketing/SEO pages. The tradeoff
// is that script-src must allow 'unsafe-inline' (Next.js emits per-build inline
// bootstrap/hydration scripts that can't be hashed statically across builds,
// and our own pre-paint theme script is inline). We still pin the theme script
// by hash so a future strict policy can drop 'unsafe-inline' for scripts once a
// nonce/middleware approach is adopted. style-src keeps 'unsafe-inline' because
// Next/React inject inline styles (geist font vars, styled-jsx).
//
// SHA-256 of the inline pre-paint theme script in app/layout.tsx (THEME_SCRIPT).
const THEME_SCRIPT_HASH = "'sha256-rQOJOhwYX6N5VtbHsaZV0hfAja9vghrWWG1NMkbMAGU='";

const csp = [
  // Default: only same-origin unless a more specific directive overrides.
  "default-src 'self'",
  // Scripts: our app + Vercel Analytics/Speed Insights beacons. 'unsafe-inline'
  // covers Next's per-build inline runtime; the theme-script hash is listed so
  // a stricter future policy can keep that script while dropping 'unsafe-inline'.
  `script-src 'self' 'unsafe-inline' ${THEME_SCRIPT_HASH} https://va.vercel-scripts.com https://*.vercel-insights.com`,
  // Styles: Next/React + geist inject inline styles, so 'unsafe-inline' is required.
  "style-src 'self' 'unsafe-inline'",
  // Images: self, inline data: URIs (icons/og fallbacks), Supabase Storage
  // (course/user assets), and https blobs for the OG image route.
  "img-src 'self' data: blob: https://*.supabase.co",
  // Fonts: self-hosted via geist/next-font (no external font CDN), plus data:.
  "font-src 'self' data:",
  // XHR/fetch/websocket: our own API, Supabase (REST + realtime WS + storage),
  // Stripe API (only if Stripe.js is ever loaded client-side), and Vercel beacons.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://va.vercel-scripts.com https://*.vercel-insights.com",
  // Frames we embed. Checkout/portal are top-level redirects today (not framed),
  // but allow Stripe frames so adopting embedded Checkout/Elements won't break.
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  // Allow loading Stripe.js if embedded checkout is ever added (script-src above
  // covers our own scripts; this keeps the option open without re-tuning later).
  "script-src-elem 'self' 'unsafe-inline' https://va.vercel-scripts.com https://*.vercel-insights.com https://js.stripe.com",
  // No plugins/objects.
  "object-src 'none'",
  // Lock the document base URI to same-origin (blocks <base> tag injection).
  "base-uri 'self'",
  // Restrict where forms can POST (self + Stripe-hosted pages we redirect to).
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  // This site is never meant to be framed (matches X-Frame-Options: DENY).
  "frame-ancestors 'none'",
].join("; ");

// Baseline security response headers applied to every route. These are all
// behavior-preserving for legitimate clients. CSP is Report-Only (above) so it
// observes without blocking until the owner flips it.
const securityHeaders = [
  // CSP in REPORT-ONLY mode — observes violations, blocks nothing.
  //
  // ===== FLIP TO ENFORCING =====
  // Change the key below from "Content-Security-Policy-Report-Only" to
  // "Content-Security-Policy" (one-line change). That's the only edit needed.
  { key: "Content-Security-Policy-Report-Only", value: csp },
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
