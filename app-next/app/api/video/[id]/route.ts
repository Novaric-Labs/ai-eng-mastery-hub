import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasFullAccess } from "@/lib/entitlement";
import type { VideoMeta } from "@/lib/course";

export const runtime = "nodejs";

// Private Storage bucket holding the rendered preface MP4s + posters/captions.
const BUCKET = "course-video";
// Signed-URL lifetime. Short enough that a leaked URL expires quickly; long
// enough to watch a ~90s clip and scrub without the link dying mid-play.
const TTL = 60 * 60 * 2; // 2 hours

// Returns a signed playback URL for a module's preface video.
//
// Access model mirrors the content tiers: a "public" video is a free teaser
// (anyone, even logged-out, may watch — it's a conversion hook), while a "paid"
// video requires an active entitlement. The storage path is resolved from the
// trusted `videos` content row, never from the request, so a caller can't sign
// an arbitrary object in the bucket.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Resolve the video meta server-side via the service role (the `videos` row is
  // public, but signing the object requires the service role regardless).
  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("content")
    .select("data")
    .eq("id", "videos")
    .maybeSingle();

  const videos = (row?.data ?? {}) as Record<string, VideoMeta>;
  const meta = videos[id];
  if (!meta?.src) return NextResponse.json({ error: "No video." }, { status: 404 });

  // Paid videos require entitlement; public videos are open teasers.
  if ((meta.tier ?? "public") === "paid") {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!(await hasFullAccess(supabase, user)))
      return NextResponse.json({ error: "This video is part of the full course." }, { status: 403 });
  }

  // Sign the playback asset(s). Poster/captions are best-effort — a missing one
  // shouldn't fail the request.
  const sign = async (path?: string): Promise<string | null> => {
    if (!path) return null;
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, TTL);
    return data?.signedUrl ?? null;
  };

  const url = await sign(meta.src);
  if (!url) return NextResponse.json({ error: "Video not available." }, { status: 404 });

  const [poster, vtt] = await Promise.all([sign(meta.poster), sign(meta.vtt)]);

  // Let the browser/CDN cache for a fraction of the URL lifetime.
  return NextResponse.json(
    { url, poster, vtt, duration: meta.duration ?? null },
    { headers: { "Cache-Control": "private, max-age=600" } },
  );
}
