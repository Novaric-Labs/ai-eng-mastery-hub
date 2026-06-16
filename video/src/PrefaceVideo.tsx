import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NovaMark } from "./NovaMark";
import { theme } from "./theme";

export type Segment = {
  kicker: string;
  lines: string[];
  start: number; // seconds
  end: number; // seconds
};

export type PrefaceProps = {
  title: string;
  segments: Segment[];
  durationInSeconds: number;
  audioSrc?: string | null;
};

// Render *emphasis* (single asterisks) as a teal, heavier span.
function Emphasized({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{ color: theme.teal, fontWeight: 700 }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export const PrefaceVideo: React.FC<PrefaceProps> = ({
  title,
  segments,
  durationInSeconds,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Slow drifting brand glow for a sense of motion without distraction.
  const glowX = interpolate(t, [0, durationInSeconds], [-6, 6]);
  const glowY = interpolate(
    Math.sin((t / durationInSeconds) * Math.PI * 2),
    [-1, 1],
    [-4, 4],
  );

  const progress = durationInSeconds ? Math.min(t / durationInSeconds, 1) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.font }}>
      {/* drifting glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${50 + glowX}% ${18 + glowY}%, rgba(69,179,192,.18), transparent 60%), linear-gradient(160deg, ${theme.bg2}, ${theme.bg})`,
        }}
      />
      {/* faint vignette */}
      <AbsoluteFill
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.45))" }}
      />

      {/* top brand bar */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          right: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: theme.teal, display: "flex" }}>
            <NovaMark size={34} />
          </span>
          <span
            style={{
              color: theme.text,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Novacademy
          </span>
        </div>
        <span
          style={{
            color: theme.teal,
            border: `1px solid ${theme.teal}`,
            borderRadius: 999,
            padding: "7px 18px",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Preface
        </span>
      </div>

      {/* module title (subtle anchor under the brand bar) */}
      <div
        style={{
          position: "absolute",
          top: 124,
          left: 80,
          color: theme.dim,
          fontSize: 24,
          fontWeight: 500,
        }}
      >
        {title}
      </div>

      {/* segments, cross-faded */}
      {segments.map((seg, i) => {
        const fadeIn = interpolate(t, [seg.start, seg.start + 0.45], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const fadeOut = interpolate(t, [seg.end - 0.4, seg.end], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
        if (opacity <= 0) return null;
        const y = interpolate(t, [seg.start, seg.start + 0.55], [22, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        return (
          <AbsoluteFill
            key={i}
            style={{
              justifyContent: "center",
              padding: "0 80px",
              opacity,
              transform: `translateY(${y}px)`,
            }}
          >
            <div style={{ maxWidth: 1360 }}>
              <div
                style={{
                  color: theme.teal,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 26,
                }}
              >
                {seg.kicker}
              </div>
              {seg.lines.map((line, j) => (
                <div
                  key={j}
                  style={{
                    color: theme.text,
                    fontSize: 70,
                    lineHeight: 1.12,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                  }}
                >
                  <Emphasized text={line} />
                </div>
              ))}
            </div>
          </AbsoluteFill>
        );
      })}

      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${theme.teal}, ${theme.accent})`,
          }}
        />
      </div>

      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};
