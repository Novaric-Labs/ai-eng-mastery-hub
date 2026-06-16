// Preface scripts + slides for every module, keyed by module id.
//
// Each `say` string is narration (concatenated, space-joined, sent to TTS);
// the matching `slide` is shown while it plays (timing derived from the audio
// at render time). Use single *asterisks* in slide lines for teal emphasis.
//
// Design rule: a PREFACE, not a summary. Hook -> the tension/why -> the core
// idea (use the module's own mental model) -> "now go read." Grounded in the
// lesson so it's accurate and consistent, but it sets the reader up rather than
// restating the content. `title`/`caption` feed the in-app player meta.
export const PREFACES = {
  llm: {
    title: "What an LLM actually is",
    caption: "A short preface — what an LLM really is, before the cost, latency, and model-choice details.",
    segments: [
      { say: "Before you build anything on top of a language model, you need an honest picture of what it actually is, not the magic the demos imply.",
        slide: { kicker: "The foundation", lines: ["Before the magic,", "an *honest* picture of the model."] } },
      { say: "Underneath, it's a single function call to a service that is stateless, slow, expensive, probabilistic, and context-bounded.",
        slide: { kicker: "What it really is", lines: ["A *stateless, slow, expensive,*", "*probabilistic* text service."] } },
      { say: "Five adjectives. And almost every architecture decision you will ever make flows directly out of them.",
        slide: { kicker: "Five adjectives", lines: ["Every architecture decision", "flows from *these five words*."] } },
      { say: "Stateless means you carry the history yourself. Expensive means cost discipline. Probabilistic means you will need evals and guardrails.",
        slide: { kicker: "So...", lines: ["Stateless → carry the history.", "Expensive → *cost discipline.* Probabilistic → evals."] } },
      { say: "This is the vocabulary layer. Learn these five words first, and everything else in the course has somewhere solid to stand.",
        slide: { kicker: "LLM Fundamentals", lines: ["Learn the *vocabulary layer* —", "the rest of the course stands on it."] } },
    ],
  },

  prompt: {
    title: "The cheapest quality lever you own",
    caption: "A short preface — why prompting is the first lever to pull, before the techniques.",
    segments: [
      { say: "Before you reach for a bigger model or fine-tuning, there is a lever that is free, instant, and routinely worth ten to thirty points of accuracy.",
        slide: { kicker: "The cheapest lever", lines: ["Free. Instant.", "Worth *10 to 30 points* of accuracy."] } },
      { say: "It is the prompt, the instructions you send the model. And most teams write them by trial and error, hoping something sticks.",
        slide: { kicker: "Yet most teams", lines: ["Write prompts by *trial and error*", "and hope something sticks."] } },
      { say: "Here is the reframe: a prompt is a program. Written in plain English, but executed by a probabilistic interpreter that needs structure, examples, and a clear output contract.",
        slide: { kicker: "The reframe", lines: ["A prompt is a *program* —", "run by a probabilistic interpreter."] } },
      { say: "And like any program, it can regress. Change one line, quietly break a case you cannot see. So it needs versions and tests, just like code.",
        slide: { kicker: "It fails silently", lines: ["Change a line, break a case.", "It needs *versions and tests*."] } },
      { say: "This module turns prompting from guesswork into engineering. Pull this lever first, before you add cost or complexity anywhere else.",
        slide: { kicker: "Prompt Engineering", lines: ["From *guesswork* to *engineering*.", "Pull this lever first."] } },
    ],
  },

  context: {
    title: "Curating what the model sees",
    caption: "A short preface — why what the model sees matters more than how you phrase it.",
    segments: [
      { say: "There is a discipline that, in just the last year, quietly ate prompt engineering. And it is not about how you phrase your instructions.",
        slide: { kicker: "The shift", lines: ["The discipline that *ate*", "prompt engineering."] } },
      { say: "It is about what else is in the room when the model reads them. Agents, retrieval, memory: they are all really this one problem.",
        slide: { kicker: "The real problem", lines: ["Agents, retrieval, memory —", "all *one problem*: what's in the window."] } },
      { say: "Picture the context window as the model's desk. Anything not on the desk does not exist to it. And the desk is small.",
        slide: { kicker: "The model's desk", lines: ["If it is not on the desk,", "it *does not exist* to the model."] } },
      { say: "So treat the window like RAM, and yourself as the operating system: deciding what loads, what gets summarized away, and what is fetched only when needed.",
        slide: { kicker: "You are the OS", lines: ["The window is *RAM*.", "You decide what loads and what pages out."] } },
      { say: "It sounds mundane. Curating what the model sees turns out to be most of the job. Sit with that before the mechanics.",
        slide: { kicker: "Context Engineering", lines: ["Sounds mundane.", "It is *most of the job*."] } },
    ],
  },

  landscape: {
    title: "How to choose, when the lineup keeps changing",
    caption: "A short preface — how to choose a model in a lineup that changes every quarter.",
    segments: [
      { say: "The list of frontier models changes every few months. Chasing launch-day hype is a great way to rebuild your stack four times a year.",
        slide: { kicker: "Moving target", lines: ["The lineup shifts *quarterly*.", "The hype resets every launch."] } },
      { say: "Yet model choice is still the highest-impact cost and quality decision you will make. So you need a way to choose that outlives this quarter's leaderboard.",
        slide: { kicker: "Highest-impact call", lines: ["Biggest *cost and quality* lever.", "Leaderboards expire fast."] } },
      { say: "The durable move is to treat models as interchangeable commodities behind a gateway. Your moat is not the model. It is the harness, the evals, and the data around it.",
        slide: { kicker: "The durable view", lines: ["Models are *commodities*.", "Your moat is harness, evals, data."] } },
      { say: "Pick per-task tiers, re-benchmark on your own evals rather than public ones, and keep your switching cost near zero.",
        slide: { kicker: "The framework", lines: ["Tier by task. Benchmark on *your* evals.", "Keep switching cost *near zero*."] } },
      { say: "This module covers who is who right now, but the part that lasts is the framework. Learn to choose without getting swept up.",
        slide: { kicker: "2026 Model Landscape", lines: ["Who is who *today* —", "how to choose *for keeps*."] } },
    ],
  },

  rag: {
    title: "Why retrieval beats a bigger prompt",
    caption: "A short preface — the problem RAG actually solves, before we get into how it works.",
    segments: [
      { say: "Here's a question that quietly breaks most people's mental model of AI. If a language model already knows so much, why does it confidently make things up about your own company's data?",
        slide: { kicker: "The puzzle", lines: ["A model that knows so much —", "so why does it *invent* facts about *your* data?"] } },
      { say: "The answer is simple. It was never trained on your data. It's frozen in time, working only from what's in front of it right now.",
        slide: { kicker: "Why", lines: ["It was *never trained* on your data.", "Frozen in time — it only sees the prompt."] } },
      { say: "So the obvious fix is to just paste everything into the prompt. Your whole knowledge base, every document. And that falls apart. It's slow, it's expensive, and the model gets lost in the noise.",
        slide: { kicker: "The naive fix fails", lines: ["Paste in *everything*?", "Slow, expensive, lost in the noise."] } },
      { say: "This module is about the technique that resolves that tension. Instead of handing the model everything, you hand it the right few things, at the right moment. Just in time.",
        slide: { kicker: "The idea", lines: ["Not everything —", "the *right few things*, just in time."] } },
      { say: "That's retrieval augmented generation. Before you learn how it works, sit with the problem it exists to solve. Once that clicks, every design decision ahead of you starts to make sense.",
        slide: { kicker: "Retrieval-Augmented Generation", lines: ["Sit with the *problem* first.", "Then the how-it-works clicks."] } },
    ],
  },

  embed: {
    title: "Meaning as geometry",
    caption: "A short preface — the intuition behind meaning-as-geometry, before the engineering.",
    segments: [
      { say: "How does a computer tell that two sentences mean the same thing, even when they share no words at all?",
        slide: { kicker: "The trick", lines: ["Same *meaning*, different words.", "How does a machine see that?"] } },
      { say: "The answer under search, recommendations, and most of retrieval is the same: turn each piece of text into a list of numbers, a single point in space.",
        slide: { kicker: "Meaning as geometry", lines: ["Turn text into a *point in space*", "where *distance* is similarity."] } },
      { say: "Closeness in that space means closeness in meaning. Suddenly, similarity is just distance, something a computer can measure in an instant.",
        slide: { kicker: "Why it works", lines: ["Nearby points,", "*nearby meanings*."] } },
      { say: "But it is a lossy compression of meaning, tuned for a domain, like an audio codec. And here is the rule people break: never mix vectors from two different models in the same index without re-encoding everything.",
        slide: { kicker: "The catch", lines: ["A *lossy codec* for meaning.", "Never *mix models' vectors* in one index."] } },
      { say: "Embeddings are the substrate under every retrieval and memory system. Get the intuition for the space first, then the engineering lands.",
        slide: { kicker: "Embeddings", lines: ["The *substrate* under retrieval.", "Get the *space* first."] } },
    ],
  },

  vecdb: {
    title: "A search index, not a database of record",
    caption: "A short preface — what a vector database really is, and when you need one.",
    segments: [
      { say: "You have turned millions of text snippets into points in space. Now you need the closest matches to a question, in milliseconds.",
        slide: { kicker: "The problem", lines: ["Millions of vectors.", "Find the nearest *in milliseconds*."] } },
      { say: "That is what a vector database does. But the first instinct, to reach for a shiny dedicated one, is often the wrong call.",
        slide: { kicker: "The reflex", lines: ["A dedicated vector DB?", "Often *overkill*."] } },
      { say: "The key shift is this: a vector database is a search index, not your database of record. Your source of truth lives somewhere else.",
        slide: { kicker: "What it really is", lines: ["A *search index* —", "not your source of truth."] } },
      { say: "It trades perfect accuracy for speed: approximately right, very fast. And because the index is rebuildable, it is disposable infrastructure.",
        slide: { kicker: "The trade", lines: ["*Approximately* right, *very* fast.", "Rebuildable. Disposable."] } },
      { say: "This module covers when a plain database does the job and when you truly need a specialized one. That choice locks in your cost and scale ceiling.",
        slide: { kicker: "Vector Databases", lines: ["When you need one —", "and when you *don't*."] } },
    ],
  },

  memory: {
    title: "State across the stateless",
    caption: "A short preface — why remembering is a write-path problem you engineer.",
    segments: [
      { say: "Every AI assistant forgets you the moment the conversation ends. So how does any of them ever seem to remember?",
        slide: { kicker: "The illusion", lines: ["The model *forgets* everything.", "So how does it *remember* you?"] } },
      { say: "Because someone engineered a memory system around it: code that decides what to save, and what to bring back later.",
        slide: { kicker: "Engineered, not given", lines: ["Every memory is code —", "deciding what to *save* and *retrieve*."] } },
      { say: "And the hard part is not retrieving notes. Anyone can read. The hard part is deciding what is even worth writing down.",
        slide: { kicker: "The real difficulty", lines: ["Reading is easy.", "*What to write* is the hard part."] } },
      { say: "It is a write-path problem disguised as a read-path problem. Save the wrong things, and you quietly poison every future answer.",
        slide: { kicker: "The hidden trap", lines: ["A *write-path* problem in disguise.", "Bad memories *poison* the future."] } },
      { say: "This module is how memory systems are built, and how they go wrong. Hold that write-versus-read framing as you read.",
        slide: { kicker: "Memory Systems", lines: ["State across the *stateless*.", "Mind the *write path*."] } },
    ],
  },

  agents: {
    title: "An LLM in a loop",
    caption: "A short preface — what an agent is, and why reliability comes from the loop.",
    segments: [
      { say: "Everyone is reaching for agents right now. It is also the pattern people misuse the most.",
        slide: { kicker: "The hype magnet", lines: ["The pattern everyone reaches for —", "and *misuses* most."] } },
      { say: "An agent is just a language model in a loop: it decides, acts with a tool, observes the result, and repeats toward a goal.",
        slide: { kicker: "What it is", lines: ["An LLM in a *while-loop*", "with tools and a goal."] } },
      { say: "Sounds simple, but the math is brutal. Ninety-five percent success per step works out to roughly thirty-six percent over twenty steps.",
        slide: { kicker: "The brutal math", lines: ["95% per step becomes", "about *36%* over 20 steps."] } },
      { say: "So reliability does not come from the model being clever. It comes from how you engineer the loop. And often, a plain workflow beats an agent outright.",
        slide: { kicker: "Where reliability lives", lines: ["Not a *clever model* —", "a well-engineered *loop*."] } },
      { say: "This module is the senior-level judgment: when an agent earns its keep, and what actually makes one reliable.",
        slide: { kicker: "AI Agents", lines: ["When agents *earn* it —", "and what makes them hold."] } },
    ],
  },

  tools: {
    title: "The hands of the model",
    caption: "A short preface — why most agent bugs are really tool-design bugs.",
    segments: [
      { say: "Most so-called agent bugs are not agent bugs at all. They are tool-design bugs in disguise.",
        slide: { kicker: "The misdiagnosis", lines: ["Most agent bugs", "are *tool* bugs."] } },
      { say: "Tools are how a model reaches into the world. You describe a set of actions, and the model asks your code to run them. It never acts directly.",
        slide: { kicker: "How models act", lines: ["The model *requests*.", "Your code *decides*."] } },
      { say: "So defining a tool is really API design, where your client is a brilliant but easily confused intern.",
        slide: { kicker: "The reframe", lines: ["Tool design is *API design*", "for a *probabilistic intern*."] } },
      { say: "And that intern rereads your documentation on every single call. Vague names, fuzzy parameters, unhelpful errors: all of it shows up as bad behavior.",
        slide: { kicker: "Why wording matters", lines: ["It rereads the docs *every call*.", "Vague tools make bad agents."] } },
      { say: "Get this layer right and agents start to feel reliable. This module is how to design tools a model can actually use well.",
        slide: { kicker: "Tool / Function Calling", lines: ["The model's *hands*.", "Design them with care."] } },
    ],
  },

  harness: {
    title: "Where capability actually comes from",
    caption: "A short preface — why the harness, not the model, is where capability lives.",
    segments: [
      { say: "Here is a result that should reshape how you think about AI: the same model, in different harnesses, can produce accuracy gaps of thirty points or more.",
        slide: { kicker: "A 30-point gap", lines: ["Same model.", "*30+ points* apart."] } },
      { say: "Identical weights. The only thing that changed was the software wrapped around the model. That wrapper is the harness.",
        slide: { kicker: "What changed", lines: ["Only the *wrapper* changed.", "That wrapper is the *harness*."] } },
      { say: "If the model is the engine, the harness is the rest of the car: what it sees each turn, which tools it gets, when a human has to approve.",
        slide: { kicker: "The mental model", lines: ["Model is the *engine*.", "Harness is *the rest of the car*."] } },
      { say: "Which means a huge share of capability does not come from the model at all. It comes from this layer that you design.",
        slide: { kicker: "Where capability lives", lines: ["Capability is not only the model.", "It is the *layer you build*."] } },
      { say: "In 2026, harness engineering is AI engineering. This module is that defining layer. Do not skim it.",
        slide: { kicker: "Agent Harnesses", lines: ["Harness engineering", "*is* AI engineering."] } },
    ],
  },

  multi: {
    title: "An org chart for context windows",
    caption: "A short preface — when adding more agents pays off, and when it just adds cost.",
    segments: [
      { say: "When one AI is not enough, the instinct is to add more. Sometimes that is brilliant. Often it just multiplies your bill.",
        slide: { kicker: "The instinct", lines: ["Add *more* agents?", "Sometimes genius. Often *waste*."] } },
      { say: "Think of it as an org chart for context windows. You hire another agent for the same reason you hire another person: the work will not fit in one head.",
        slide: { kicker: "The framing", lines: ["An *org chart*", "for context windows."] } },
      { say: "And like any org, every new hire brings overhead: communication, coordination, drift, and real cost.",
        slide: { kicker: "The coordination tax", lines: ["Every hire adds", "*overhead, drift, cost*."] } },
      { say: "Multi-agent shines on genuinely parallel, context-heavy work, and wastes money on everything else. The skill is telling the two apart.",
        slide: { kicker: "When it pays", lines: ["Great for *parallel* work.", "Waste *everywhere* else."] } },
      { say: "This module is about paying that coordination tax only when it actually buys you something.",
        slide: { kicker: "Multi-Agent Systems", lines: ["Pay the *coordination tax*", "only when it *earns* it."] } },
    ],
  },

  design: {
    title: "The model call is 5% of the system",
    caption: "A short preface — why the model call is only 5% of a real AI system.",
    segments: [
      { say: "The model call is about five percent of a real AI system. The other ninety-five percent is what pages you at three in the morning.",
        slide: { kicker: "The 5%", lines: ["The model call is *5%*.", "The rest *wakes you at 3am*."] } },
      { say: "A working demo and a reliable product are separated by a lot of unglamorous plumbing: gateways, caches, queues, and fallbacks.",
        slide: { kicker: "Demo versus product", lines: ["Demo to product", "is a lot of *plumbing*."] } },
      { say: "The trick is to design around one hard truth: at the core sits a dependency that is flaky, expensive, and slow.",
        slide: { kicker: "The core truth", lines: ["A *flaky, expensive, slow*", "dependency at the center."] } },
      { say: "So every classic pattern applies, timeouts, retries, circuit breakers, plus new ones: token budgets, eval gates, and semantic caching.",
        slide: { kicker: "Old patterns, new ones", lines: ["Timeouts, retries, *circuit breakers* —", "plus *token budgets, eval gates, semantic caching*."] } },
      { say: "This module is the production engineering around the model call. It is what separates a demo from something you can actually trust.",
        slide: { kicker: "AI System Design", lines: ["The *95%* that matters.", "Engineer the system, not the call."] } },
    ],
  },

  evals: {
    title: "Shipping, not guessing",
    caption: "A short preface — why evals are what separate shipping from guessing.",
    segments: [
      { say: "How do you know a change made your AI better, and not quietly worse for the cases you forgot to check?",
        slide: { kicker: "The question", lines: ["Did that change *help* —", "or *silently* break things?"] } },
      { say: "You cannot unit-test your way to certainty here. The same input can give different outputs, and correct is often a judgment call.",
        slide: { kicker: "Why testing fails", lines: ["Same input, *different output*.", "Correct is a *judgment call*."] } },
      { say: "Evals are the answer: a curated set of questions with known-good answers, run automatically against every change you make.",
        slide: { kicker: "The answer", lines: ["A *golden set* of cases,", "run on *every change*."] } },
      { say: "Think of it as a test suite for behavior. Golden data are your fixtures, scorers your assertions, the harness your CI. No eval, no deploy.",
        slide: { kicker: "The mental model", lines: ["A *test suite* for behavior.", "*No eval, no deploy.*"] } },
      { say: "No single discipline separates serious AI teams from everyone else more clearly. This module is how you stop guessing.",
        slide: { kicker: "Evaluation", lines: ["Shipping versus *guessing*.", "This is the line."] } },
    ],
  },

  halluc: {
    title: "Engineering around confidently wrong",
    caption: "A short preface — why hallucination is intrinsic, and how to engineer around it.",
    segments: [
      { say: "AI models will state false things with total confidence: invented facts, fake citations, wrong numbers.",
        slide: { kicker: "Confidently wrong", lines: ["Invented facts. Fake citations.", "Stated with *total confidence*."] } },
      { say: "And this is not a bug waiting for a patch. It is intrinsic. The model is rewarded for sounding fluent, not for being true.",
        slide: { kicker: "Not a bug", lines: ["*Intrinsic*, not a defect.", "Rewarded for *fluent*, not *true*."] } },
      { say: "So you cannot eliminate it. You have to engineer around it. Treat every output as a claim from a brilliant, fearless intern.",
        slide: { kicker: "The reframe", lines: ["You cannot *delete* it.", "Treat each output as a *claim*."] } },
      { say: "Trust comes from the system, not the model: grounding in sources, verification against truth, and hard constraints on the output.",
        slide: { kicker: "Where trust comes from", lines: ["*Grounding, verification, constraint.*", "The *system* earns trust."] } },
      { say: "This module is how to keep confident fabrications away from your users, plus the injection attacks that exploit the very same trust.",
        slide: { kicker: "Hallucination & Guardrails", lines: ["Engineer *around* the failure.", "Protect the *trust*."] } },
    ],
  },

  lead: {
    title: "The judgment layer",
    caption: "A short preface — the judgment layer that matters past senior level.",
    segments: [
      { say: "Past a certain level, your value stops being the code you write. It becomes the calls you make.",
        slide: { kicker: "The shift", lines: ["Not the *code* you write —", "the *calls* you make."] } },
      { say: "Build or buy. Which risks are acceptable. What to tell the executives. How to keep a team current in a field that reinvents itself quarterly.",
        slide: { kicker: "The real job", lines: ["Build or buy? Risk or ship? Exec comms?", "*Judgment*, not syntax."] } },
      { say: "The organizing idea is this: you are managing a portfolio of irreversibility. Most decisions are reversible. A few are one-way doors.",
        slide: { kicker: "The frame", lines: ["Manage a *portfolio*", "of *irreversibility*."] } },
      { say: "Let teams move fast on the reversible things, prompts, models behind a gateway. Slow down hard on one-way doors: data contracts, vendor lock-in, broken trust.",
        slide: { kicker: "The rule", lines: ["*Fast* on reversible.", "*Slow* on one-way doors."] } },
      { say: "This module is the judgment layer on top of everything technical you have learned. It is the real differentiator.",
        slide: { kicker: "AI Leadership", lines: ["The *judgment* layer.", "Where seniority *shows*."] } },
    ],
  },

  finetune: {
    title: "Surgery versus clothing",
    caption: "A short preface — when reshaping weights beats reshaping prompts.",
    segments: [
      { say: "When a model is not behaving, fine-tuning feels like the serious fix. Usually, it is the wrong first move.",
        slide: { kicker: "The temptation", lines: ["Fine-tuning *feels* serious.", "Usually it is the *wrong* first move."] } },
      { say: "Here is the difference: prompting is clothing, you can re-dress the model in thirty seconds. Fine-tuning is surgery on the weight space.",
        slide: { kicker: "Clothing versus surgery", lines: ["Prompting is *clothing*.", "Fine-tuning is *surgery*."] } },
      { say: "And surgery is permanent. You cannot un-train a model on bad data. A mis-scoped fine-tune can quietly destroy abilities it used to have.",
        slide: { kicker: "It is permanent", lines: ["You cannot *un-train* it.", "Bad data leaves *lasting* damage."] } },
      { say: "Reach for it only with a real volume, latency, or consistency problem, a clean labeled dataset, and a regression suite ready to run.",
        slide: { kicker: "When it is worth it", lines: ["*Volume, latency, or consistency* problem.", "Clean data. *Regression suite* ready."] } },
      { say: "This module is when the economics actually work, and how to operate without trading one problem for three. Respect the scalpel.",
        slide: { kicker: "Fine-Tuning", lines: ["When the math *works* —", "and how not to *wreck* the model."] } },
    ],
  },

  aisec: {
    title: "A new attack surface",
    caption: "A short preface — why every AI feature is a new attack surface.",
    segments: [
      { say: "Every AI feature you ship is a brand-new attack surface. And these attacks are strange: they turn the model's own intelligence against you.",
        slide: { kicker: "New surface", lines: ["Every feature you ship is", "a new *attack surface*."] } },
      { say: "Someone hides instructions inside a document, an email, or a web page, and your model dutifully follows them.",
        slide: { kicker: "The attack", lines: ["Hidden instructions in", "docs, emails, web pages."] } },
      { say: "Picture your system as a trusted executive who reads every email, including the ones written by attackers.",
        slide: { kicker: "The mental model", lines: ["A *trusted executive*", "who reads the *attacker's* email."] } },
      { say: "So design as if the model can never be made adversarially robust, because it cannot. The controls that hold are structural, never the model's own judgment.",
        slide: { kicker: "What actually holds", lines: ["Assume the model *can* be fooled.", "Defenses must be *structural*."] } },
      { say: "This module is the threat classes that are real today, and the controls that survive contact with a determined attacker.",
        slide: { kicker: "AI Security", lines: ["Real threats, real defenses.", "Build it to *hold*."] } },
    ],
  },

  mlops: {
    title: "AI systems fail silently",
    caption: "A short preface — why AI systems fail silently, and what to instrument first.",
    segments: [
      { say: "An AI system can be failing badly while every dashboard stays green. Wrong answers come back with a two hundred, OK.",
        slide: { kicker: "Silent failure", lines: ["Wrong answers,", "returned with *200 OK*."] } },
      { say: "Quality drifts over weeks. Costs run away with no error at all. Standard monitoring sees none of it.",
        slide: { kicker: "Invisible to APM", lines: ["Quality *drifts*. Cost *climbs*.", "Your monitoring sees *nothing*."] } },
      { say: "Latency and error rate tell you the HTTP layer is fine. They tell you nothing about whether the model is hallucinating at twelve percent.",
        slide: { kicker: "The blind spot", lines: ["Latency is green.", "Hallucination is at *12%*."] } },
      { say: "So treat the quality metric as the heartbeat. Every AI system needs three instruments: traces, quality scores, and drift alerts.",
        slide: { kicker: "Three instruments", lines: ["*Traces, quality, drift.*", "Quality is the *heartbeat*."] } },
      { say: "Retrofitting this after the first incident always costs more. This module is the instrumentation you build before you ship.",
        slide: { kicker: "AI Observability", lines: ["Build the instrumentation *before* you ship.", "Not after the *first* incident."] } },
    ],
  },

  dataeng: {
    title: "The invisible quality ceiling",
    caption: "A short preface — why the data pipeline sets your retrieval ceiling.",
    segments: [
      { say: "You can have the best model and the sharpest prompts and still be stuck at sixty percent quality. The cause is upstream.",
        slide: { kicker: "The ceiling", lines: ["Best model, best prompts —", "stuck at *60%*."] } },
      { say: "Bad chunking, stale indexes, mixed embedding versions. The data pipeline quietly caps your quality before you write a single prompt.",
        slide: { kicker: "The hidden cap", lines: ["Bad chunking. Stale data.", "A cap you never *see*."] } },
      { say: "Everything downstream, better models, rerankers, prompts, only operates on whatever your pipeline hands it.",
        slide: { kicker: "Why it dominates", lines: ["Everything downstream runs on", "what the *pipeline* hands it."] } },
      { say: "A table split across two chunks produces plausible-looking garbage, with no error signal at all. Retrieval quality is pipeline correctness first, model second.",
        slide: { kicker: "The mental model", lines: ["The pipeline is the", "*invisible quality ceiling*."] } },
      { say: "This module is how to build the pipeline so retrieval improves on its own, with the ceiling set by content, not plumbing.",
        slide: { kicker: "Data Engineering for AI", lines: ["Raise the *ceiling*.", "Let retrieval *improve itself*."] } },
    ],
  },

  multimodal: {
    title: "When vision earns its cost",
    caption: "A short preface — when vision earns its cost, and when to skip it.",
    segments: [
      { say: "Not every document is text. Scanned PDFs, tables, charts, and audio all carry information that a text-only pipeline misses entirely.",
        slide: { kicker: "Beyond text", lines: ["Scans, tables, charts, audio —", "text pipelines *miss* them."] } },
      { say: "The reflex is to route everything through a vision model. That is also a fast path to an enormous bill.",
        slide: { kicker: "The reflex", lines: ["Send *everything* to vision?", "A fast path to a *huge bill*."] } },
      { say: "The real question is never whether the model can see images. It can. It is whether what vision recovers is worth three to five times the cost.",
        slide: { kicker: "The real question", lines: ["Not *can* it see images —", "is it *worth 3 to 5 times* the cost?"] } },
      { say: "For clean digital PDFs, the answer is usually no. The discipline is to route by document type first, and reach for vision second.",
        slide: { kicker: "The discipline", lines: ["*Route* first.", "*Vision* second."] } },
      { say: "This module is when multimodal earns its cost, when it is expensive theater, and how to send each document down the right path.",
        slide: { kicker: "Multimodal Systems", lines: ["Value versus *expensive theater*.", "Route each document *right*."] } },
    ],
  },
};

export default PREFACES;
