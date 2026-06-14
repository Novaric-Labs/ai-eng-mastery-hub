import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep type-checking on (that's our build-time validation); skip ESLint setup.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
