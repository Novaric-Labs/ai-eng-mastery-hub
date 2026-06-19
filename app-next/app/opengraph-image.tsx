import { ImageResponse } from "next/og";

// Default sitewide Open Graph / Twitter card image, generated at the edge so we
// don't need a hand-made static asset. 1200x630 is the standard OG size.
export const runtime = "edge";
export const alt = "Novacademy — Learn AI Skills: RAG, Agents & Evals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0b",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 30,
            color: "#9aa0aa",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {/* Brand mark — the Novacademy star, matching app/icon.svg. */}
          <svg width="44" height="44" viewBox="0 0 24 24">
            <path
              d="M12 4.2C12.6 8.5 14.8 10.7 19.1 11.3C14.8 11.9 12.6 14.1 12 18.4C11.4 14.1 9.2 11.9 4.9 11.3C9.2 10.7 11.4 8.5 12 4.2Z"
              fill="#5b8cff"
            />
          </svg>
          <span>Novacademy</span>
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 36,
            maxWidth: 980,
            letterSpacing: "-0.02em",
          }}
        >
          Master the skills behind modern AI.
        </div>
        <div style={{ fontSize: 34, color: "#c4c8cf", marginTop: 28, maxWidth: 940 }}>
          RAG, agents, evals, and the judgment to ship. One membership unlocks every course.
        </div>
      </div>
    ),
    { ...size },
  );
}
