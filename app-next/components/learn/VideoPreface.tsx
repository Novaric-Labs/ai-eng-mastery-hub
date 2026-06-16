"use client";

import { useState } from "react";
import { Play, Loader2, Film } from "lucide-react";
import NovaMark from "@/components/NovaMark";
import type { VideoMeta } from "@/lib/course";

type Loaded = { url: string; poster: string | null; vtt: string | null };

// A short "preface" video at the top of a module — sets up the topic before the
// reading, rather than restating it. Click-to-play: the signed playback URL is
// fetched on demand (the file lives in a private bucket), so nothing streams
// until the learner chooses to watch.
export default function VideoPreface({ id, meta }: { id: string; meta: VideoMeta }) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [data, setData] = useState<Loaded | null>(null);

  async function play() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`/api/video/${id}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as Loaded;
      if (!json.url) throw new Error("no url");
      setData(json);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  const mins = meta.duration ? Math.max(1, Math.round(meta.duration / 60)) : null;
  const lengthLabel = meta.duration
    ? meta.duration < 90
      ? `${meta.duration}-second`
      : `${mins}-minute`
    : "short";

  return (
    <figure className="vpreface">
      <div className="vpreface-frame">
        {state === "ready" && data ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- <track> added when a vtt exists
          <video
            className="vpreface-video"
            controls
            autoPlay
            playsInline
            poster={data.poster ?? meta.poster ?? undefined}
          >
            <source src={data.url} type="video/mp4" />
            {data.vtt && <track kind="captions" src={data.vtt} srcLang="en" label="English" default />}
          </video>
        ) : (
          <button
            type="button"
            className="vpreface-cover"
            onClick={play}
            disabled={state === "loading"}
            aria-label={`Play the ${lengthLabel} preface video${meta.title ? `: ${meta.title}` : ""}`}
            style={meta.poster ? { backgroundImage: `url(${meta.poster})` } : undefined}
          >
            <span className="vpreface-eyebrow">
              <Film size={13} strokeWidth={2} /> Preface
            </span>
            {!meta.poster && <NovaMark size={30} className="vpreface-mark" />}
            <span className="vpreface-play">
              {state === "loading" ? (
                <Loader2 size={26} strokeWidth={2} className="vpreface-spin" />
              ) : (
                <Play size={26} strokeWidth={2} fill="currentColor" />
              )}
            </span>
            <span className="vpreface-label">
              {state === "error"
                ? "Couldn't load the video — tap to retry"
                : meta.title
                  ? meta.title
                  : `Watch the ${lengthLabel} preface`}
            </span>
          </button>
        )}
      </div>
      {meta.caption && <figcaption className="vpreface-cap">{meta.caption}</figcaption>}
    </figure>
  );
}
