import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasFullAccess } from "@/lib/entitlement";
import { anthropic, HAIKU, textOf } from "@/lib/anthropic";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";
import type { Scenario } from "@/lib/course";

export const runtime = "nodejs";

// AI grading of a scenario response: returns a 0–10 score with what the learner
// got right and where to improve. Entitled-users-only; tight token cap.
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!(await hasFullAccess(supabase, user)))
    return NextResponse.json({ error: "This is a paid feature." }, { status: 403 });

  const rl = await rateLimit(user.id, "grade");
  if (!rl.ok) return tooManyRequests(rl.retryAfter, "Slow down a moment and try again.");

  const client = anthropic();
  if (!client) return NextResponse.json({ error: "AI grading isn't configured yet." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const scenarioId = String(body.scenarioId ?? "");
  const answer = String(body.answer ?? "").slice(0, 4000).trim(); // cap input
  // Scope to the caller's course (content is keyed by course_id,id); default
  // ai-eng for back-compat with clients that don't send it.
  const course = String(body.course ?? "ai-eng") || "ai-eng";
  if (!scenarioId || !answer) return NextResponse.json({ error: "Missing scenario or answer." }, { status: 400 });

  // Fetch the scenario server-side (don't trust the client for the model answer).
  // Read via the service role: access is already authorized by hasFullAccess
  // above, and the row's tier RLS would otherwise hide a course the user can use
  // but isn't DB-entitled to (e.g. an admin/owner, who is app-level not row-level
  // entitled). The model answer is used only to grade and never returned.
  const { data: row } = await supabaseAdmin().from("content").select("data").eq("course_id", course).eq("id", "scenarios").maybeSingle();
  const scenarios = (row?.data as Scenario[] | undefined) ?? [];
  const sc = scenarios.find((s) => s.id === scenarioId);
  if (!sc) return NextResponse.json({ error: "Scenario not found." }, { status: 404 });

  // Grader persona + rubric scale to the course (encouraging beginner coach for
  // Foundations, rigorous instructor for Mastery); default ai-eng.
  const GRADERS: Record<string, { persona: string; rubric: string }> = {
    "ai-eng": {
      persona: "a senior AI-engineering instructor",
      rubric: "production judgment",
    },
    "ai-foundations": {
      persona: "a warm, encouraging tutor coaching a beginner",
      rubric: "clear thinking and grasp of the core idea",
    },
  };
  const grader = GRADERS[course] ?? GRADERS["ai-eng"];

  const system =
    `You are ${grader.persona} grading the user's answer to a practice scenario. ` +
    "Grade ONLY against the situation, the model answer, and the key points provided. Be fair but rigorous, and encouraging. " +
    "Address the user directly as 'you' throughout — say 'You correctly…', 'You could strengthen…' — never 'the learner', 'they', or 'the answer'. " +
    "Reply with ONLY a JSON object, no prose, no markdown fences, in exactly this shape: " +
    '{"score": <integer 0-10>, "summary": "<one or two sentences>", "strengths": ["..."], "improvements": ["..."]}. ' +
    `score 0-10 reflects how well your answer covers the key points and ${grader.rubric}. ` +
    "summary speaks to you directly. strengths = what you got right (specific). improvements = what you missed or should add (specific, actionable).";

  const prompt =
    `SITUATION:\n${sc.sit}\n\nTASK:\n${sc.task}\n\n` +
    `MODEL ANSWER:\n${sc.model}\n\nKEY POINTS THE ANSWER SHOULD HIT:\n${sc.pts.map((p) => `- ${p}`).join("\n")}\n\n` +
    `THE USER'S ANSWER:\n${answer}`;

  try {
    const message = await client.messages.create({
      model: HAIKU,
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = textOf(message);
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as {
      score: number;
      summary: string;
      strengths: string[];
      improvements: string[];
    };
    const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) || 0)));
    return NextResponse.json({
      score,
      summary: String(parsed.summary ?? ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6).map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6).map(String) : [],
    });
  } catch {
    return NextResponse.json({ error: "Couldn't grade that right now — try again." }, { status: 502 });
  }
}
