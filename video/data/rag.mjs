// Source of truth for the RAG preface video.
//
// `say` strings are concatenated (in order, space-joined) into the narration
// sent to TTS; each segment's on-screen `slide` is shown while its narration
// plays (timing is derived from the audio alignment at render time). Use single
// *asterisks* in slide lines for teal emphasis.
//
// Keep it a PREFACE: hook -> the problem -> why it matters -> "now go learn how".
// No mechanics — that's what the module reading is for.
export const rag = {
  id: "rag",
  title: "Why retrieval beats a bigger prompt",
  // Optional: override the narrator voice for this video (ElevenLabs voice id).
  voiceId: undefined,
  segments: [
    {
      say: "Here's a question that quietly breaks most people's mental model of AI. If a language model already knows so much, why does it confidently make things up about your own company's data?",
      slide: { kicker: "The puzzle", lines: ["A model that knows so much —", "so why does it *invent* facts about *your* data?"] },
    },
    {
      say: "The answer is simple. It was never trained on your data. It's frozen in time, working only from what's in front of it right now.",
      slide: { kicker: "Why", lines: ["It was *never trained* on your data.", "Frozen in time — it only sees the prompt."] },
    },
    {
      say: "So the obvious fix is to just paste everything into the prompt. Your whole knowledge base, every document. And that falls apart. It's slow, it's expensive, and the model gets lost in the noise.",
      slide: { kicker: "The naive fix fails", lines: ["Paste in *everything*?", "Slow · expensive · lost in the noise."] },
    },
    {
      say: "This module is about the technique that resolves that tension. Instead of handing the model everything, you hand it the right few things, at the right moment. Just in time.",
      slide: { kicker: "The idea", lines: ["Not everything —", "the *right few things*, just in time."] },
    },
    {
      say: "That's retrieval augmented generation. Before you learn how it works, sit with the problem it exists to solve. Once that clicks, every design decision ahead of you starts to make sense.",
      slide: { kicker: "Retrieval-Augmented Generation", lines: ["Sit with the *problem* first.", "Then the how-it-works clicks."] },
    },
  ],
};

export default rag;
