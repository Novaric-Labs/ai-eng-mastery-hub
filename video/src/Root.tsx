import { Composition } from "remotion";
import { PrefaceVideo, type PrefaceProps, type Segment } from "./PrefaceVideo";
import { fps, width, height } from "./theme";
import { rag } from "../data/rag.mjs";

// Estimate evenly-timed segments from word counts, so Studio shows a sensible
// preview BEFORE any TTS has run. The real render (scripts/render.mjs) replaces
// this with exact, audio-aligned timing from ElevenLabs.
function estimateProps(data: typeof rag): PrefaceProps {
  const WPS = 2.6; // spoken words per second (rough)
  const counts = data.segments.map((s) => s.say.trim().split(/\s+/).length);
  const durs = counts.map((c) => Math.max(2, c / WPS));
  let cursor = 0;
  const segments: Segment[] = data.segments.map((s, i) => {
    const start = cursor;
    cursor += durs[i];
    return { kicker: s.slide.kicker, lines: s.slide.lines, start, end: cursor };
  });
  return { title: data.title, segments, durationInSeconds: cursor, audioSrc: null };
}

export const RemotionRoot: React.FC = () => {
  const sample = estimateProps(rag);
  return (
    <Composition
      id="PrefaceVideo"
      component={PrefaceVideo}
      durationInFrames={Math.round(sample.durationInSeconds * fps)}
      fps={fps}
      width={width}
      height={height}
      defaultProps={sample}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(1, Math.round(props.durationInSeconds * fps)),
      })}
    />
  );
};
