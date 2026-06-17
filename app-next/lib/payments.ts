// Whether paid membership checkout is live. Off until Stripe is configured in
// production (set NEXT_PUBLIC_PAYMENTS_ENABLED=true in Vercel, then redeploy).
//
// When off, the platform runs in invite/free mode: people start on the free
// sample content and unlock the rest with an access code/comp. The membership
// plans + Stripe checkout UI are hidden so no one hits a broken checkout.
//
// NEXT_PUBLIC_* is inlined at build time, so this is safe to read in both server
// and client components; changing it requires a redeploy.
export const paymentsEnabled =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
