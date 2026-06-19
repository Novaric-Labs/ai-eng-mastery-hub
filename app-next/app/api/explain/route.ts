import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/entitlement";
import { anthropic, HAIKU, textOf } from "@/lib/anthropic";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Brief, on-the-spot feedback when a learner gets an exam question wrong:
// why the option they picked is wrong and why the correct one is right, in
// 2-3 sentences. Entitled-users-only (exams are paid); tiny token cap.
const TONE: Record<string, string> = {
  "ai-eng": "Keep it sharp and technically precise.",
  "ai-foundations": "Keep it warm, plain-English, and free of jargon.",
};

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!(await hasFullAccess(supabase, user)))
    return NextResponse.json({ error: "This is part of the full course." }, { status: 403 });

  const rl = await rateLimit(user.id, "explain");
  if (!rl.ok) return tooManyRequests(rl.retryAfter, "One moment — try again.");

  const client = anthropic();
  if (!client) return NextResponse.json({ error: "Explanations aren't configured yet." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const question = String(body.question ?? "").slice(0, 1000).trim();
  const options: string[] = Array.isArray(body.options)
    ? body.options.slice(0, 8).map((o: unknown) => String(o).slice(0, 400))
    : [];
  const correctIndex = Number(body.correctIndex);
  const chosenIndex = Number(body.chosenIndex);
  const course = String(body.course ?? "ai-eng") || "ai-eng";

  if (!question || options.length < 2 || !(correctIndex in options) || !(chosenIndex in options))
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  // Nothing to explain if they actually got it right.
  if (correctIndex === chosenIndex) return NextResponse.json({ explanation: "" });

  const letter = (i: number) => String.fromCharCode(65 + i);
  const system =
    "You give instant feedback on a multiple-choice question the user just answered incorrectly. " +
    "In 2-3 short sentences total, briefly explain why the answer they chose is wrong, then why the correct answer is right. " +
    "Address them directly as 'you'. Be concise — no preamble, no restating the question or the option text, no markdown. " +
    (TONE[course] ?? TONE["ai-eng"]);
  const prompt =
    `QUESTION:\n${question}\n\nOPTIONS:\n${options.map((o, i) => `${letter(i)}. ${o}`).join("\n")}\n\n` +
    `You chose: ${letter(chosenIndex)}\nCorrect answer: ${letter(correctIndex)}`;

  try {
    const message = await client.messages.create({
      model: HAIKU,
      max_tokens: 160,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return NextResponse.json({ explanation: textOf(message) });
  } catch {
    return NextResponse.json({ error: "Couldn't generate an explanation — try again." }, { status: 502 });
  }
}
