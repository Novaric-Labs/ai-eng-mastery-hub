# Capstone 1 — Agentic RAG assistant, eval-gated

**AI Engineering Mastery · post-Block 2 · 12–20 hours over 3–7 days**

You are building the portfolio artifact that 2026 hiring loops actually screen for: a
deployed retrieval system with published metrics, a documented architecture, and an eval
suite that gates it. Not a notebook. Not a demo video of a chatbot.

The market context this lab is shaped around, in one paragraph. Roughly a third of
companies with a disclosed process use a take-home, and RAG builds are the single largest
category of them. The expected build order is evals first — YC startups describe *not*
starting with evals as a red flag. Submissions are increasingly defended live, so the
walkthrough is part of the format rather than a nicety. And on portfolios, a deployed
retrieval system with a measurable precision/recall benchmark outperforms a fine-tuned
model with no live endpoint. This lab makes you produce all of that.

---

## 1. Mission

Build an assistant that answers support and operations questions about **Meridian Pay**, a
fictional fintech, using only the 24 documents in `data/corpus/`.

The company, its products, its prices, and every policy in the corpus are **invented for
this lab**. That is deliberate: no model has memorised Meridian Pay, so an answer can only
come from retrieval. When your system states that the Growth tier costs 2.6% + USD 0.25,
it either read that or it made it up, and the eval suite can tell the difference.

The corpus is small on purpose and hard on purpose:

- **Multi-document questions.** 17 of the 26 answerable golden queries need two or three
  documents combined. The dispute deadline lives in one file, the tier that grants an
  extension in another, the fee in a third.
- **Near-miss distractors.** US ACH payouts and EU SEPA payouts. v2 webhooks and the
  deprecated v1 webhooks. Card refunds and bank-debit refunds. Each pair is lexically
  similar and factually different, and answering from the wrong one is confidently wrong.
- **Questions the corpus cannot answer.** Four of them. The correct output is a refusal.
  Each one has a document that looks like it should answer and does not.
- **Documents no query requires.** Not every file is a required source for something. A
  retriever that ranks by topical vibe will surface them.

Success is not "it answers questions." Success is: the eval gate is green, you can explain
every number in it, and you can defend the design decisions that produced them.

---

## 2. What is in the box

```
labs/capstone-rag/
├── README.md                     this spec
├── tasks.md                      every command, written out (make is optional)
├── Makefile                      convenience wrapper around tasks.md
├── .env.example                  configuration and EXAMPLE model ids
├── promptfooconfig.yaml          the eval harness, wired to the golden set
├── data/
│   ├── corpus/                   24 markdown documents, 150–350 words each
│   └── golden-queries.json       30 labelled queries
└── starter/
    ├── pipeline.py               the skeleton you will fill in
    ├── gate_config.py            every threshold, in one place
    ├── golden_tests.py           golden set -> promptfoo tests, plus validation
    ├── asserts.py                deterministic graders
    ├── promptfoo_provider.py     harness -> pipeline adapter
    ├── eval_retrieval.py         free retrieval scoring, no API key
    ├── check_gate.py             enforces the aggregate release gate
    └── requirements.txt
```

**Not provided, on purpose:** a reference solution, a chunking strategy, a prompt library.
Those are the assignment.

### Golden set schema

`data/golden-queries.json` is a JSON array of 30 objects:

| field | meaning |
|---|---|
| `id` | `gq-001` … `gq-030` |
| `query` | the user's question, phrased as a person would type it |
| `relevant_doc_ids` | corpus filenames that **must** be retrieved. **Empty means the correct behaviour is to abstain.** |
| `expected_answer_keypoints` | what a correct answer contains; judged as `keypoint_coverage` |
| `hard` | multi-hop, ambiguous, distractor-adjacent, or unanswerable |
| `notes` | why the query is in the set and what usually goes wrong — read these |

26 answerable, 4 must-abstain, 22 flagged hard.

`python starter/golden_tests.py` validates that every `relevant_doc_ids` entry exists in
`data/corpus/`. Run it after editing either file.

---

## 3. Quickstart

```bash
python -m pip install -r starter/requirements.txt
python starter/golden_tests.py            # integrity check: 30 test cases
python starter/pipeline.py ingest         # 24 documents -> ~125 chunks, no API key needed
python starter/eval_retrieval.py          # your baseline: recall@5 around 0.65
```

The skeleton runs today, with no key and no network, and it is **not good**. Retrieval is a
hashed bag of words, "hybrid" search is dense-only, the reranker is the identity function,
the retrieval grader accepts anything, and generation returns the top chunk verbatim. That
is the starting line, and the number it produces is the number you have to beat.

Then:

```bash
python starter/pipeline.py ask "can our marketplace sellers get instant payouts?"
python starter/pipeline.py trace "what does it cost to get money same day?"
python starter/eval_retrieval.py --show gq-006
```

Full command list: **`tasks.md`**.

---

## 4. Architecture requirements

Every requirement below is checked by the rubric, and most are visible in the metrics.

### 4.1 Retrieval backend

**pgvector on Postgres is the production target.** It is the 2026 default under roughly
10M vectors on a Postgres stack, and it is what a reviewer will expect you to name.

**The local fallback ships working, so the lab never requires Postgres.** `starter/pipeline.py`
stores chunks and embeddings in SQLite (`.data/index.sqlite3`) and scores them by
brute-force cosine in Python. At 125 chunks this is correct, fast, and completely
defensible. It is also a documented dead end at scale, and knowing exactly where it breaks
is the point.

You must do **one** of these and document it:

1. **Ship on the local store** and write, in `DESIGN.md`, at what corpus size brute force
   stops being viable, what you would move to, and what the migration costs. Be specific
   about numbers, not vibes.
2. **Port to pgvector.** Same table shape, `embedding vector(N)`, an HNSW index, and
   `ORDER BY embedding <=> :q LIMIT :k`. Report the recall difference (usually small at
   this size) and the latency difference (usually the interesting part).
3. **Add an ANN index to the local store** via `sqlite-vec`, and report what changed.

Option 1 is a full-credit answer. An unexamined choice is not, whichever you pick.

### 4.2 Hybrid retrieval — required

Dense retrieval alone is not sufficient and this corpus proves it. Queries turn on exact
tokens: `R10`, `SAQ D`, `X-Meridian-Sig-V1`, `0.9%`. Embeddings blur those; lexical search
finds them. Meanwhile "client timed out mid-charge" has to reach a document about
idempotency that never uses the word "timeout", which lexical search will never do.

Implement both retrievers and a fusion step. Reciprocal Rank Fusion is the usual first
choice because it needs no score normalisation between two retrievers whose scores are not
comparable. Weighted fusion works too and costs you a tunable.

**Measure each arm separately.** "Hybrid helped" is not a finding. Here are the numbers
this corpus produces, which you can check yourself:

| configuration | recall@5 | strict@5 |
|---|---|---|
| shipped skeleton (hashing dense only) | 0.647 | 0.538 |
| BM25 only, with doc title and heading prepended to each chunk | 0.853 | 0.769 |
| naive RRF over both of the above | 0.833 | 0.731 |

Read the third row carefully. Fusing a strong retriever with a weak one made things
*worse*. That is not a bug in RRF — it is what fusion does when one arm is bad. Your job
is not to add a hybrid step, it is to make hybrid earn its place.

### 4.3 Reranking — required

Retrieval maximises recall over a wide net (`RAG_CANDIDATE_K`, default 25). Reranking
maximises precision inside the small window the model actually reads (`RAG_TOP_K`,
default 5). Different jobs. On this corpus the second one carries a lot of the quality,
because the near-miss documents are exactly the ones a first-stage retriever cannot
separate.

Any of these is acceptable if you measure it: a local cross-encoder, a hosted rerank
endpoint, or an LLM scoring candidates. Report the recall@5 and latency delta, and the
cost per query if you chose the LLM.

### 4.4 The agentic loop — required

Single-pass retrieval is the thing this lab is teaching you to move past. Implement:

```
        search ──► rerank ──► grade ──┬── sufficient ──► generate ──► groundedness ──► answer
           ▲                          │                                    │
           └──── re-search ◄─ rewrite ┘                                    └──► abstain
```

- **Grade.** Judge whether what you retrieved can answer *this* question, and say what is
  missing. A grader that returns a bare boolean makes the rewrite step a coin flip.
- **Rewrite.** Turn the gap into a new query — user vocabulary into corpus vocabulary
  ("chargeback" → "dispute", "same day" → "instant payout", "marketplace sellers" →
  "connected accounts"), or split a two-subject question. Returning "no rewrite" is a
  legitimate decision; a loop that always finds something to rewrite never abstains.
- **Re-search** under a hard iteration budget.
- **Check groundedness** of the draft against the retrieved context, before the user sees
  it. This is what catches gq-029, where the retriever confidently returns a support-SLA
  document for a question about uptime guarantees.
- **Abstain** when grading or groundedness fails.

The orchestration is already written for you in `answer_question()` — budgets, query
history, tracing, and the abstention path. Read it before you change it. One decision is
made for you and marked in the code: evidence **accumulates** across iterations rather
than the newest search replacing the last. Understand why, because a reviewer will ask,
and if you disagree, change it and show both sets of numbers.

### 4.5 Abstention — required

Four queries have no answer in the corpus. Refusing is the correct output, and refusing
badly is its own failure: a system that abstains on everything scores 4/4 on abstention
and is worthless, which is why `false_abstention` is tracked separately and capped.

### 4.6 Observability — required

`AgentTrace` records every search, grade, rewrite, citation check, and groundedness
verdict with elapsed milliseconds. Keep it, and use it — `pipeline.py trace "..."` is the
fastest debugging tool in the lab. Exporting to a tracing platform is a stretch goal, not
a requirement.

---

## 5. The eval gate

**This is the deliverable that makes the rest credible.** Build the eval loop before you
optimise anything, and never move a threshold to make a run pass.

Two layers, both defined in `starter/gate_config.py`:

### Per-query floors — surfaced by promptfoo, one row per query

| check | floor |
|---|---|
| `recall_at_5` | ≥ 0.50 of that query's required documents in the top 5 |
| `faithfulness` | ≥ 0.90 judge score |
| `citation_validity` | = 1.00 — every cited file exists **and** was actually retrieved |
| `abstention` / `false_abstention` | binary, per query type |

### The release gate — enforced by `check_gate.py`, this is what "green" means

| metric | threshold | measured over |
|---|---|---|
| **mean recall@5** | **≥ 0.88** | the 26 answerable queries, macro-averaged per query |
| **mean faithfulness** | **≥ 0.90** | every query that returned an answer |
| **correct abstentions** | **≥ 3 of 4** | the 4 unanswerable queries |
| **citation validity** | **= 1.00** | every answered query |
| **false abstentions** | **≤ 2** | the 26 answerable queries |

Reported but **not** gated: `keypoint_coverage` (target 0.70), p95 latency (target 10s),
cost per query (target $0.05). Put all three in your metrics table anyway.

**Why 0.88 for recall.** Because it was calibrated against the measurements in §4.2, not
picked to sound good. The skeleton scores 0.647. The best single technique — BM25 with
title-and-heading enrichment — reaches 0.853. Naive fusion lands at 0.833. The gate sits
above all three so that no one trick clears it: passing needs real embeddings, or fusion
you actually tuned, or a reranker that does something, or a loop that adds evidence on a
second pass. In practice, a combination.

**Why abstention is 3 of 4 and not 4 of 4.** Four items is too small a sample to gate at
100% without inviting a coin-flip pass. Gating a 4-item metric at perfection is eval
theatre, and this lab is partly about learning to notice it. Report all four outcomes in
your README regardless.

**Why citation validity is gated at 1.00.** It is deterministic and free to check. There
is no statistical excuse for citing a file that does not exist.

### Running it

```bash
python starter/eval_retrieval.py --gate                          # free, run this constantly
npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json  # costs money
python starter/check_gate.py eval-results.json                   # the release decision
```

Retrieval is the ceiling on everything downstream — a generator cannot ground an answer in
a document that was never retrieved — so live in the free loop and only spend money once
`--gate` is green.

Pin the promptfoo version you used (`npx promptfoo@x.y.z ...`) in your submission README
so a reviewer reproduces your numbers instead of whatever ships that week.

---

## 6. What you submit

Mirrors current take-home practice: a repo, a written defence of your decisions, tests you
wrote without being told to, a recorded walkthrough, and a live URL.

### 6.1 `README.md` with metrics

Structure it as motivation → problem → approach → difficulties → trade-offs → results.
Lead with a metrics table from a real run:

| metric | result | gate | pass |
|---|---|---|---|
| mean recall@5 | | ≥ 0.88 | |
| strict@5 (all required docs) | | reported | |
| mean faithfulness | | ≥ 0.90 | |
| correct abstentions | | ≥ 3/4 | |
| citation validity | | = 1.00 | |
| false abstentions | | ≤ 2 | |
| keypoint coverage | | target 0.70 | |
| p95 latency | | target 10s | |
| cost per query | | target $0.05 | |

Include the exact commands, the model ids and promptfoo version you used, and the date.
A metrics table without a reproduction command is a screenshot.

### 6.2 `DESIGN.md` — decisions and trade-offs

The document that actually gets read. For each decision: what you chose, what you rejected,
and **the measurement that settled it**.

Cover at minimum:

1. Chunking strategy, and what the golden set told you about it.
2. Embedding model, and why. Include the ingest cost.
3. Hybrid fusion method, with per-arm recall@5 — dense alone, lexical alone, fused.
4. Reranker choice, with the recall/latency/cost delta it bought.
5. Retrieval grading: what signals, how many model calls, what it costs per query.
6. Rewrite strategy, and how you stop a runaway loop.
7. Groundedness checking: decomposed claims or single call, and what you gave up.
8. Where the local store stops working, and what you would move to (§4.1).
9. **One thing you got wrong and fixed.** Include the number before and after. This is the
   highest-signal paragraph in the document.
10. What you would do with two more weeks, ranked.

### 6.3 Edge-case tests — write these unprompted

`python -m pytest -q`. Minimum coverage:

- A query whose retrieval returns nothing.
- A query where the top document is a near-miss (the EU/US or v1/v2 pairs).
- Malformed or hostile input: empty string, 10,000 characters, a question in another
  language.
- An answer citing a document that does not exist — assert the system abstains rather
  than returning it. `validate_citations()` already does the detection.
- The loop hitting its iteration budget without ever grading sufficient.
- An abstention path that returns no citations.

### 6.4 Recorded walkthrough — 8 to 12 minutes

Screen recording, your voice. Suggested shape:

1. The problem and why the corpus is hard (60s)
2. Architecture, on one diagram (2 min)
3. A live run of a multi-doc query, showing the trace (2 min)
4. **A failure you found and fixed**, with the eval numbers either side (3 min)
5. Trade-offs, cost, and what you would change (2 min)

Part 4 is what separates submissions. "It works" is unremarkable; "here is what broke,
here is how the eval caught it, here is the number before and after" is the thing.

### 6.5 Deployed endpoint

A live URL a reviewer can hit in 60 seconds:

```
POST /ask     {"question": "..."}
              -> {"answer": str, "abstained": bool, "citations": [str],
                  "retrieved_doc_ids": [str], "latency_seconds": float}
GET  /healthz -> 200
```

Any host. Include the Dockerfile and the deploy command in your README, and rate-limit it
or put it behind a token — a public endpoint spending your money is a production hygiene
failure the rubric will notice.

If you reach this capstone before the Block 4 deployment module, ship the container plus a
documented `docker run`, and add the live URL when you get there. Say so explicitly rather
than leaving a dead link.

---

## 7. Grading rubric (0–100, published in advance)

The eval gate is a **precondition**, not a score. If the gate is red, the maximum is 60
regardless of everything else — with one exception: if you can demonstrate with evidence
that a threshold is unreachable and document the analysis, that argument is graded as
eval-rigor work rather than as a failure. Bring the measurements.

**Pass ≥ 70 with a green gate. Distinction ≥ 85.**

### Retrieval quality — 25

| | |
|---|---|
| 21–25 | Gate cleared with margin. Dense, lexical, and fused arms measured separately; chunking justified by evidence; reranker's contribution isolated; failure cases named with query ids |
| 15–20 | Gate cleared. Hybrid and reranking present and measured, but at least one choice is asserted rather than shown |
| 8–14 | Hybrid or reranking missing, or present but never measured independently |
| 0–7 | Single-pass dense retrieval, or recall reported without a reproducible command |

### Agentic loop — 20

| | |
|---|---|
| 17–20 | Grade, rewrite, re-search, and groundedness all do real work; iteration budget enforced and demonstrated; abstention correct on ≥3/4 with ≤2 false abstentions; trace makes each decision legible |
| 12–16 | Full loop implemented, one stage weak (e.g. a grader that rarely rejects) |
| 6–11 | Loop present but effectively single-pass — the grader almost never triggers a rewrite |
| 0–5 | No loop, or no abstention path |

### Eval rigor — 25

| | |
|---|---|
| 21–25 | Gate enforced in CI with a real exit code; per-arm and per-stage measurements; a documented case where the eval caught a regression; honest reporting of what still fails; judge choice justified |
| 15–20 | Suite runs, gate enforced locally, metrics reported honestly |
| 8–14 | Metrics reported but not gated, or aggregates given with no per-query detail |
| 0–7 | Numbers with no reproduction path — or a threshold lowered to make a run pass |

Lowering a threshold without documenting why caps this section at 7. Your git history is
part of the submission.

### Production hygiene — 15

| | |
|---|---|
| 13–15 | Deployed and reachable; secrets in env; timeouts, retries, and budgets on every model call; endpoint protected; container reproducible; cost per query measured, not estimated |
| 9–12 | Deployed and configured cleanly, one gap (no rate limit, unmeasured cost) |
| 4–8 | Runs locally only, or secrets/model ids hardcoded |
| 0–3 | Not runnable from the README instructions |

### Communication — 15

| | |
|---|---|
| 13–15 | DESIGN.md settles decisions with measurements; the "what I got wrong" section is specific and quantified; walkthrough is tight and defends choices under the follow-up questions |
| 9–12 | Clear docs and walkthrough; some decisions asserted rather than evidenced |
| 4–8 | Docs describe what the code does rather than why |
| 0–3 | Missing walkthrough or DESIGN.md |

### The walkthrough defence

Ten questions you should be able to answer without notes:

1. Why that chunk size, and what did the golden set say about it?
2. What does your reranker buy, in recall points and milliseconds?
3. Show me a query where hybrid beat dense alone, and one where it did not.
4. What does your retrieval grader do when the question is ambiguous — gq-006?
5. What stops the loop running forever? Point at the line.
6. Why does gq-029 abstain? What was retrieved, and what stopped the answer?
7. What does one query cost, and where does the money go?
8. When does your local store stop being the right choice?
9. What is your worst-performing query, and why haven't you fixed it?
10. Which part of this would break first at 100× the corpus size?

---

## 8. Cost

**Retrieval iteration is free and unlimited.** `eval_retrieval.py` makes no model calls.
The offline hashing embedder needs no key, and a local sentence-transformers model costs
one download and nothing per query. You can do most of this lab for $0.

Money starts when you wire `call_llm()` and run the judged suite.

### A worked estimate — check the arithmetic, do not trust the total

Per question, a full loop plus judging is roughly **16k input tokens and 1.2k output**:
grading (~1.5k in), an occasional rewrite (~0.5k), answer generation (~3k in / 400 out),
groundedness checking (~3.5k in), and two judge rubrics (~8k in / 300 out).

Across 30 queries that is roughly **500k input and 35k output tokens per full eval run**.

Now the part you must do yourself: **look up your provider's current published prices.**
Rates below are illustrative placeholders for the arithmetic, not real quotes.

| assumed blended rate | per full eval run |
|---|---|
| $3 / Mtok in, $15 / Mtok out | ≈ $2.00 |
| $15 / Mtok in, $75 / Mtok out | ≈ $10.00 |

Expect **10–20 full runs** across the lab.

- **Tiered routing** (grading, rewriting, groundedness, and judging on a fast tier;
  frontier model only for the final answer): **$20–40 total**.
- **Frontier model everywhere, including the judge**: **$100–200 total.**
- Embedding the whole corpus is negligible either way — 125 chunks is about 11k tokens,
  well under a cent even hosted, and free locally.

### Spending less without learning less

1. Get `eval_retrieval.py --gate` green before running the paid suite once. This is the
   single biggest saving available and it is free.
2. Route the loop steps to a cheap model. They are short, structured, and run several
   times per question — the exact profile a fast tier handles well. Measure whether it
   costs you accuracy; the answer is often no, and that is a finding worth writing up.
3. Develop against `--hard-only` and the 8 easy queries as a smoke subset. Run all 30 when
   you think you are done.
4. Instrument `AgentTrace.llm_calls` and put a real number in your README. You cannot
   claim a cost per query you never measured, and "cost per query" is a rubric line.

**Set a spend limit in your provider dashboard before your first paid run.** A loop bug
that retries without a budget is the classic way to turn a $2 eval run into a $200 one —
and `RAG_MAX_LLM_CALLS` exists precisely because that failure mode is common enough to
design against.

---

## 9. Stretch goals

Only after the gate is green.

- **pgvector migration** with a recall and latency comparison (§4.1).
- **Trace export** to an observability platform; show a real debugging session.
- **Prompt-injection hardening.** Corpus documents are *data*, not instructions. Add a
  document containing an embedded instruction, confirm your pipeline ignores it, and add
  the case to your tests. Prompt injection is OWASP's number one LLM risk and remains
  architecturally unsolved — a demonstrated defence is a strong interview artifact.
- **Answer-level caching** with a measured hit rate on repeated queries.
- **Grow the golden set** to 50 queries. Write the new ones from failures you observed,
  not from questions you already pass — an eval set you designed to pass is decoration.

---

## 10. Ground rules

Use AI assistants. Take-homes in 2026 assume you did, and the scored skill has moved from
producing code to judging it. Two conditions: you must be able to defend every line in the
walkthrough, and you must be able to explain why any generated code you kept is correct.
The fastest failure in an AI-assisted round is accepting a plausible-but-wrong suggestion
without reading it.

Do not edit `data/corpus/` or the labelled fields of `data/golden-queries.json`. Both are
the measuring instrument. Adding queries is encouraged; changing existing labels to make a
run pass is the one thing that invalidates the whole submission.
