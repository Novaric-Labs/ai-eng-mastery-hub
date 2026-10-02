// Preface scripts + slides for the AI Foundations course, keyed by module id.
// Same shape and rules as video/data/prefaces.mjs (the Mastery Hub prefaces):
//
// Each `say` string is narration (concatenated, space-joined, sent to TTS);
// the matching `slide` is shown while it plays (timing derived from the audio
// at render time). Use single *asterisks* in slide lines for teal emphasis.
//
// Design rule: a PREFACE, not a summary. Hook -> the tension/why -> the core
// idea (use the module's own mental model) -> "now go read." Grounded in the
// lesson so it's accurate and consistent, but it sets the reader up rather than
// restating the content. `title`/`caption` feed the in-app player meta.
//
// Voice: clean-narration — smooth, studio-clean, natural inflection, written to
// be read aloud. Spell out symbols/numbers; keep sentences short. This course is
// for total beginners, so keep it warm and free of jargon.
export const PREFACES = {
  whatai: {
    title: "It's simpler than it looks",
    caption: "A short preface — what an AI model really is, before any of the details.",
    segments: [
      { say: "AI can feel like magic, or like something you'll never quite understand. Here's the good news: underneath, it's doing one simple thing.",
        slide: { kicker: "Start here", lines: ["It feels like magic.", "Underneath, it's *one simple thing*."] } },
      { say: "When you ask it something, it writes the answer one small piece at a time, each piece just a guess at what word is most likely to come next.",
        slide: { kicker: "What it does", lines: ["It writes one piece at a time —", "each piece a *guess at what's next*."] } },
      { say: "That's the whole trick. Think of it as a very, very well-read autocomplete. Not a mind, not a search engine. A text-prediction machine.",
        slide: { kicker: "The mental model", lines: ["A *very well-read autocomplete* —", "not a mind, not a search engine."] } },
      { say: "And this one idea explains everything that surprises people. Why it's so helpful. And why it can be confidently, completely wrong.",
        slide: { kicker: "Why it matters", lines: ["Explains why it's *amazing* —", "and why it's sometimes *confidently wrong*."] } },
      { say: "Get this one picture in your head, and the rest of AI stops being mysterious. So let's start right here. Go in.",
        slide: { kicker: "What AI Actually Is", lines: ["Get *this* picture first.", "The rest stops being mysterious."] } },
    ],
  },
  tokens: {
    title: "How the model really reads",
    caption: "A short preface — why the model reads text in puzzle pieces, not words.",
    segments: [
      { say: "Here's a small thing that quietly explains a lot about AI. The model doesn't read words the way you do. Not really.",
        slide: { kicker: "A small thing", lines: ["The model *doesn't read words*", "the way you do."] } },
      { say: "Before it does anything, it chops your text into little pieces. Common words become one piece. Longer or stranger words get split into several.",
        slide: { kicker: "What it does", lines: ["It chops text into *pieces* —", "common words, word-bits, spaces."] } },
      { say: "Those pieces are called tokens. Picture the model reading in puzzle pieces, not letters. That one image is the whole lesson.",
        slide: { kicker: "The mental model", lines: ["These pieces are *tokens*.", "Puzzle pieces, not letters."] } },
      { say: "And it explains three mysteries at once. Why AI costs what it costs. Why it runs out of room. And why it fumbles things that look easy, like counting the letters in a word.",
        slide: { kicker: "Why it matters", lines: ["Explains the *cost*, the *limits*,", "and the odd little *quirks*."] } },
      { say: "You'll never count these by hand. You just need to see them once. So let's go look at a token. Go in.",
        slide: { kicker: "Tokens & How Models Read Text", lines: ["See a token *once*.", "It all clicks."] } },
    ],
  },
  context: {
    title: "The model's tiny desk",
    caption: "A short preface — why the model forgets, and what you can do about it.",
    segments: [
      { say: "Ever had an AI forget something you told it just a few minutes ago? It's the most common frustration people have. And it's completely predictable.",
        slide: { kicker: "Sound familiar?", lines: ["\"Why did it *forget*", "what I just told it?\""] } },
      { say: "Here's the secret: the model has no memory of its own. Every time you hit send, it's handed the whole conversation as one big block of text, and it reads only that.",
        slide: { kicker: "The secret", lines: ["The model has *no memory*.", "Each turn, it reads one block."] } },
      { say: "But that block has a size limit. Think of it as the model's desk, not its filing cabinet. Only what's on the desk right now can be used.",
        slide: { kicker: "The mental model", lines: ["It's a *desk*, not a cabinet —", "and the desk has an *edge*."] } },
      { say: "When a conversation gets too long, the oldest things slide right off the edge of the desk, and they're simply gone. The model isn't choosing to forget. It never sees them.",
        slide: { kicker: "Why it forgets", lines: ["Too long, and old messages", "*slide off the edge*."] } },
      { say: "The good news? You decide what goes on the desk. And that turns out to be the most useful skill in this whole course. So let's go learn it. Go in.",
        slide: { kicker: "The Context Window", lines: ["*You* control the desk.", "That's the real skill."] } },
    ],
  },
  prompting: {
    title: "The words are the steering wheel",
    caption: "A short preface — why how you ask changes everything you get back.",
    segments: [
      { say: "Here's something that catches people off guard. The very same AI can give you a useless, generic answer, or a perfect one. And the only thing that changed was how you asked.",
        slide: { kicker: "Surprising truth", lines: ["Same AI. Same task.", "*How you ask* changes everything."] } },
      { say: "The text you give it is called a prompt. And the model takes it completely literally. It can't read your mind, and it can't see your screen.",
        slide: { kicker: "What's a prompt?", lines: ["The text you give it —", "and it takes it *literally*."] } },
      { say: "So picture briefing a brilliant new assistant on their first day. Tell them the task. Give them the background. Say what a good result looks like.",
        slide: { kicker: "The mental model", lines: ["Brief it like a *new assistant* —", "task, context, what 'good' means."] } },
      { say: "And here's the part people miss. If the first answer is close but not quite right, you don't start over. You just tell it what to change. Prompting is a conversation.",
        slide: { kicker: "The key habit", lines: ["Close but not right?", "*Refine* — don't restart."] } },
      { say: "No clever tricks. No secret phrases. Just clear instructions. This is the highest-leverage skill in the whole course. So let's go practice it. Go in.",
        slide: { kicker: "Prompting Basics", lines: ["No magic phrases.", "Just *clear instructions*."] } },
    ],
  },
  chat: {
    title: "The memory that isn't there",
    caption: "A short preface — how a chat fakes memory with a model that has none.",
    segments: [
      { say: "When you chat with an AI, it really feels like there's someone in there, following along, remembering what you said. Here's the twist. There isn't.",
        slide: { kicker: "The twist", lines: ["It feels like it *remembers*.", "There's no one in there."] } },
      { say: "The model itself has no memory between messages. None. Each thing you send, it sees completely fresh, as if it were the very first.",
        slide: { kicker: "The secret", lines: ["The model has *no memory*", "between messages. None."] } },
      { say: "So how does a conversation hold together? The app does the remembering. Every single turn, it quietly re-sends the entire chat so far, glued together, with your new message on the end.",
        slide: { kicker: "How it works", lines: ["The *app* re-sends the whole", "conversation — every turn."] } },
      { say: "Picture a brilliant expert with no memory, handed the full transcript before every reply. The continuity you feel isn't in the model. It's in that transcript.",
        slide: { kicker: "The mental model", lines: ["An expert with no memory,", "handed the *transcript* each time."] } },
      { say: "Once you see that, a lot of confusing things click. Why a new chat starts blank. Why memory is a separate feature. So let's go look behind the curtain. Go in.",
        slide: { kicker: "How Chat Works", lines: ["See behind the curtain.", "It all *clicks*."] } },
    ],
  },
  limits: {
    title: "Where it goes wrong",
    caption: "A short preface — the two failures you should always expect.",
    segments: [
      { say: "An AI that's right most of the time, and sounds confident all of the time, is genuinely risky. If you don't know where the wrong answers hide.",
        slide: { kicker: "The risk", lines: ["Right *most* of the time.", "Confident *all* of the time."] } },
      { say: "There are two big, predictable failures. And both come from the one idea you already know. The model predicts likely-sounding text. It doesn't look anything up.",
        slide: { kicker: "Two failures", lines: ["Both come from *one idea*:", "it predicts, it doesn't look up."] } },
      { say: "First, when it doesn't really know, it doesn't stop. It makes up something that sounds true. Fake quotes, invented statistics. That's called hallucination.",
        slide: { kicker: "Failure one", lines: ["It *makes things up* —", "convincingly. *Hallucination*."] } },
      { say: "Second, it was trained once, in the past. So its knowledge just stops at a certain date. Ask about anything recent, and it may answer from an out-of-date world.",
        slide: { kicker: "Failure two", lines: ["Trained once, in the past —", "the *knowledge cutoff*."] } },
      { say: "Picture a brilliant expert locked in a room since last year, who'd rather smoothly make something up than say I don't know. Learn to spot both, and you're safe. Go in.",
        slide: { kicker: "What Models Get Wrong", lines: ["Spot both failures —", "and you're *safe*."] } },
    ],
  },
  tools: {
    title: "An engine, and a car",
    caption: "A short preface — how a text engine ends up doing so much more than text.",
    segments: [
      { say: "By now you know the core model only does one thing. It predicts text. So here's a fair question. How can it look at a photo? Read your PDF? Search the web?",
        slide: { kicker: "Fair question", lines: ["It only predicts *text*.", "So how does it do all that?"] } },
      { say: "The answer is that modern AI products bundle extra abilities around that text engine. The engine is the same. The product is what adds the rest.",
        slide: { kicker: "The answer", lines: ["Extra abilities are *bundled*", "around the text engine."] } },
      { say: "Picture the model as an engine, and the app you use as a car built around it. Seeing images, reading files, searching the internet. Those are features the car adds on.",
        slide: { kicker: "The mental model", lines: ["The model is an *engine*.", "The app is the *car* around it."] } },
      { say: "And when the model needs something it can't do, it calls a tool. A separate piece of software that does the real work, and hands the result back as text.",
        slide: { kicker: "How it does more", lines: ["It *calls a tool* —", "real work, returned as text."] } },
      { say: "So can this AI do X? It almost always means, does this product give the model a tool for X? Same engine, different cars, different powers. So let's go look. Go in.",
        slide: { kicker: "Beyond Text", lines: ["Same engine, *different cars*.", "Different powers."] } },
    ],
  },
  actions: {
    title: "An intern with your keys",
    caption: "A short preface — what changes when AI stops answering and starts doing.",
    segments: [
      { say: "So far, this course has been about AI that answers. You ask, it writes, and you decide what happens next. But more and more, AI doesn't stop at answering. It acts.",
        slide: { kicker: "Something new", lines: ["Until now, AI *answered*.", "Now it can *act*."] } },
      { say: "It can spend several minutes researching a question for you. It can click through websites, fill in forms, and send the email. And along the way, a web page it reads might be quietly whispering instructions of its own.",
        slide: { kicker: "The catch", lines: ["It clicks, fills in, *sends*.", "And pages can *whisper back*."] } },
      { say: "Here's the surprise. There's no new kind of mind behind it. It's the same engine you already know, given tools and a goal, and left to work in a loop. Plan a step. Do it. Look at what happened. Decide what's next.",
        slide: { kicker: "The core idea", lines: ["Same engine, plus *tools* and a *goal*,", "working in a *loop*."] } },
      { say: "So picture a fast, tireless intern, holding your keys. It gets real work done. But it can be wrong at any step, and it might follow instructions from anything it reads. So you decide which doors it can open, and you check the work.",
        slide: { kicker: "The mental model", lines: ["A tireless intern", "*holding your keys*."] } },
      { say: "Used well, an agent takes tedious, easy-to-check chores off your plate. Used carelessly, it puts your money and your accounts at risk. The difference is a handful of simple habits. So let's learn them. Go in.",
        slide: { kicker: "When AI Takes Action", lines: ["Hand it the *chores*.", "Keep the *keys* that matter."] } },
    ],
  },
  safely: {
    title: "Staying in charge",
    caption: "A short preface — what happens to what you type, and the habits that keep you in charge.",
    segments: [
      { say: "By now you know how AI works. What it is, how it reads, where it goes wrong, and how it can even take actions for you. This lesson is different. This one is about you.",
        slide: { kicker: "This one's about you", lines: ["You know how AI *works*.", "Now, how to use it *safely*."] } },
      { say: "Because three things are true at once. What you type goes somewhere. The AI tends to tell you what you want to hear. And the same technology that writes your emails can copy a voice you trust.",
        slide: { kicker: "Three things are true", lines: ["What you type *goes somewhere*.", "It *flatters*. And fakes are *easy*."] } },
      { say: "So here's a picture to hold onto. An AI app is a brilliant helper who works for a company you've never met. Glad to help, fast, and tireless. But you decide what to share with it, and what to believe.",
        slide: { kicker: "The mental model", lines: ["A *brilliant helper*,", "from a company you've *never met*."] } },
      { say: "And the good news? You don't need to be technical, and you don't need to be afraid. A handful of simple habits prevents nearly every bad outcome, from a leaked secret to a scam phone call.",
        slide: { kicker: "Why it matters", lines: ["A few *simple habits*", "prevent nearly every *bad outcome*."] } },
      { say: "So let's build those habits together, and get all the benefits of AI, without getting burned. Go in.",
        slide: { kicker: "Using AI Responsibly", lines: ["All the *benefits*.", "Without getting *burned*."] } },
    ],
  },
  using: {
    title: "Putting it all together",
    caption: "A short preface — turning everything you've learned into one simple habit.",
    segments: [
      { say: "You've learned a lot. What the engine is. How it reads. What it forgets. Where it fails. Now let's turn all of it into one simple habit you can actually use.",
        slide: { kicker: "The payoff", lines: ["Everything you've learned —", "into *one habit*."] } },
      { say: "It comes down to a single idea. Match the model, and your own effort, to what the task actually needs. You don't bring the biggest tool to the smallest job.",
        slide: { kicker: "The core idea", lines: ["*Right-size* the tool", "to the task."] } },
      { say: "So before any task, ask two quick questions. How capable does the model need to be? And how much does being wrong actually cost me?",
        slide: { kicker: "Two questions", lines: ["How *capable* must it be?", "What does *wrong* cost me?"] } },
      { say: "Cheap and fast for the low-stakes stuff. Careful and double-checked for the things that matter. Trust it to draft and brainstorm. Verify it on facts and numbers.",
        slide: { kicker: "The habit", lines: ["*Trust* it to draft.", "*Verify* it on facts."] } },
      { say: "Get this, and you're not just using AI. You're using it well. And when you're ready to start building with it, the Engineering Mastery course is your next step. Go in.",
        slide: { kicker: "Putting It Together", lines: ["Use AI *well*.", "Then go *build*."] } },
    ],
  },
};

export default PREFACES;
