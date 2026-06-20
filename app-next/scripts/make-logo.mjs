// Render the Novacademy brand mark (the four-point "nova" star) to a square PNG
// for the Google OAuth consent screen (and any other "app logo" slot).
// Brand tokens mirror video/src/theme.ts. Run from app-next/:  node scripts/make-logo.mjs
import sharp from "sharp";
import fs from "node:fs";

const STAR =
  "M12 1.5C12.9 8 16 11.1 22.5 12C16 12.9 12.9 16 12 22.5C11.1 16 8 12.9 1.5 12C8 11.1 11.1 8 12 1.5Z";

// 512px canvas: a brand blue→purple gradient rounded square with a white star.
// Star path is 24x24 centered at (12,12); scale 13.4 → ~281px, centered.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5b8cff"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="112" fill="url(#g)"/>
  <g transform="translate(256 256) scale(13.4) translate(-12 -12)">
    <path d="${STAR}" fill="#ffffff"/>
  </g>
</svg>`;

const dir = new URL("../../brand/", import.meta.url);
fs.mkdirSync(dir, { recursive: true });

for (const size of [512, 120]) {
  const out = new URL(`novacademy-logo-${size}.png`, dir);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out.pathname.replace(/^\//, ""));
  console.log(`✓ wrote brand/novacademy-logo-${size}.png`);
}
