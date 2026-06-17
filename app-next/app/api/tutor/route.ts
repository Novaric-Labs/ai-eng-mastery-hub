import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/entitlement";
import { anthropic, HAIKU, tooSoon, textOf } from "@/lib/anthropic";

export const runtime = "nodejs";

// Per-course tutor identity: the course it speaks for, the subjects it will
// answer, and the register to answer in. Keyed by course slug; defaults to
// ai-eng so a missing/unknown course still gets a sensible tutor.
type TutorCfg = { title: string; scope: string; persona: string };

const TUTORS: Record<string, TutorCfg> = {
  "ai-eng": {
    title: "AI Engineering Mastery Hub",
    scope:
      "LLM fundamentals (tokens, context, sampling, cost/latency), prompt & context engineering, the current model " +
      "landscape, RAG, embeddings, vector databases, memory systems, agents, tool/function calling, harnesses, " +
      "multi-agent systems, production design (gateways, caching, fallbacks), evals & LLM-as-judge, hallucination & " +
      "guardrails, prompt injection / AI security, MLOps & observability, data engineering for retrieval, multimodal, " +
      "fine-tuning, and AI engineering leadership/judgment.",
    persona:
      "Answer like a staff engineer giving a colleague a quick, direct answer.",
  },
  "ai-foundations": {
    title: "AI Foundations",
    scope:
      "what AI and large language models actually are, tokens and how models read text, the context window, " +
      "prompting basics, how chat works (statelessness, conversation history), what models get wrong (hallucination, " +
      "knowledge cutoff), going beyond text (images, files, web search, tools), and how to choose and use a model — " +
      "all at a beginner, no-prior-knowledge level.",
    persona:
      "Answer like a friendly, patient mentor explaining to a curious beginner — plain language, no jargon (or " +
      "define it if you must use it), encouraging and concrete.",
  },
};

const tutorFor = (slug: string): TutorCfg => TUTORS[slug] ?? TUTORS["ai-eng"];

const buildSystem = (cfg: TutorCfg): string =>
  `You are the Novacademy AI Tutor for the '${cfg.title}' course. ` +
  `Only answer questions about the course's subjects: ${cfg.scope} ` +
  "If a question is clearly outside these topics (e.g. personal advice, unrelated coding, current " +
  "events, math homework), politely decline in one sentence and steer them back to the course material. " +
  "Keep answers SHORT by default: directly answer the question in 1–3 sentences (or a few tight bullets), in plain " +
  "language. Do NOT add background, caveats, examples, or step-by-step depth unless the user explicitly asks for " +
  `more (e.g. 'explain more', 'give an example', 'go deeper'). ${cfg.persona} ` +
  "Do not invent course features or claim to access their progress.";

type Turn = { role: "user" | "assistant"; content: string };

// Course-scoped AI tutor. Entitled-users-only; short history; tight token cap.
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!(await hasFullAccess(supabase, user)))
    return NextResponse.json({ error: "The tutor is part of the full course." }, { status: 403 });

  if (tooSoon(user.id)) return NextResponse.json({ error: "One moment — try again in a sec." }, { status: 429 });

  const client = anthropic();
  if (!client) return NextResponse.json({ error: "The tutor isn't configured yet." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const question = String(body.question ?? "").slice(0, 1500).trim();
  if (!question) return NextResponse.json({ error: "Ask a question first." }, { status: 400 });

  // Speak as the caller's course; default ai-eng for back-compat.
  const SYSTEM = buildSystem(tutorFor(String(body.course ?? "ai-eng") || "ai-eng"));

  // Keep only the last few turns, each capped, to bound input cost.
  const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const messages = [
    ...history
      .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
      .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) })),
    { role: "user" as const, content: question },
  ];

  try {
    const message = await client.messages.create({
      model: HAIKU,
      max_tokens: 450,
      system: SYSTEM,
      messages,
    });
    return NextResponse.json({ answer: textOf(message) });
  } catch {
    return NextResponse.json({ error: "Couldn't answer that right now — try again." }, { status: 502 });
  }
}
