"""Capstone 1 - agentic RAG over the Meridian Pay corpus.

This file is a SKELETON. It runs end to end today with deliberately naive strategy
internals, and it will fail the eval gate. Your job is to replace every function
marked `TODO(step N)` with a real implementation until `make gate` passes.

What is already done for you (do not rewrite unless you have a reason):
  - corpus loading, chunk persistence, a SQLite store, CLI plumbing
  - the agentic loop *orchestration*: iteration budget, query history, tracing,
    the abstention path, and deterministic citation validation
  - an offline hashing embedder so the pipeline runs with zero API keys

What is yours to build:
  - chunking strategy, real embeddings, lexical search, hybrid fusion, reranking,
    retrieval grading, query rewriting, answer generation, groundedness checking

Run order:
    python starter/pipeline.py ingest
    python starter/pipeline.py ask "how long do we have to submit dispute evidence?"
    python starter/pipeline.py trace "can our marketplace sellers get instant payouts?"

Design note: nothing here imports a vendor SDK. `call_llm()` is the single seam where
a provider enters the system. Keep it that way - the eval harness, the graders, and
your own cost controls all depend on there being exactly one place to swap models.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import sqlite3
import sys
import time
from array import array
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Sequence

# --------------------------------------------------------------------------------------
# Paths and configuration
# --------------------------------------------------------------------------------------

LAB_ROOT = Path(__file__).resolve().parent.parent
CORPUS_DIR = LAB_ROOT / "data" / "corpus"
GOLDEN_PATH = LAB_ROOT / "data" / "golden-queries.json"
INDEX_DIR = LAB_ROOT / ".data"
INDEX_PATH = INDEX_DIR / "index.sqlite3"

# EXAMPLE model identifiers. These are illustrations of the *shape* of a model id, not
# recommendations, and they go stale. Before you spend money: look up the current model
# list and price for whichever provider you are using, then set the values in .env.
# Never hardcode a model id anywhere except here.
EXAMPLE_ANSWER_MODEL = "claude-opus-5"  # EXAMPLE - verify the current id in provider docs
EXAMPLE_GRADER_MODEL = "<your-provider-fast-tier-model-id>"  # EXAMPLE - a cheap/fast tier
EXAMPLE_EMBED_MODEL = "bge-small-en-v1.5"  # EXAMPLE - local sentence-transformers model

# Retrieval and loop budgets. Every one of these is a lever you should be able to defend
# in the walkthrough: why this k, why this many iterations, what it costs.
TOP_K = int(os.environ.get("RAG_TOP_K", "5"))
CANDIDATE_K = int(os.environ.get("RAG_CANDIDATE_K", "25"))
MAX_ITERATIONS = int(os.environ.get("RAG_MAX_ITERATIONS", "3"))
MAX_LLM_CALLS = int(os.environ.get("RAG_MAX_LLM_CALLS", "12"))
DEADLINE_SECONDS = float(os.environ.get("RAG_DEADLINE_SECONDS", "60"))
EMBED_DIM = int(os.environ.get("RAG_EMBED_DIM", "512"))

ABSTAIN_TEXT = (
    "I can't answer that from the Meridian Pay documentation I have. "
    "Nothing in the provided corpus covers it, so anything I said would be a guess. "
    "Please escalate to a human who can check a source outside this documentation set."
)

_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for",
    "from", "has", "have", "how", "i", "if", "in", "is", "it", "its", "long", "of", "on",
    "or", "our", "so", "that", "the", "their", "then", "there", "they", "this", "to",
    "us", "was", "we", "what", "when", "where", "which", "who", "will", "with", "you",
}


# --------------------------------------------------------------------------------------
# Data model
# --------------------------------------------------------------------------------------


@dataclass
class Chunk:
    """One retrievable unit. `doc_id` is the corpus filename, e.g. 'pricing-core-2026.md'.

    The golden set keys on `doc_id`, so whatever chunking you choose, a chunk must always
    be able to name the file it came from.
    """

    chunk_id: str
    doc_id: str
    ordinal: int
    heading: str
    text: str

    @property
    def token_estimate(self) -> int:
        # Crude but stable: good enough for budgeting, useless for billing.
        return max(1, len(self.text) // 4)


@dataclass
class Scored:
    chunk: Chunk
    score: float
    source: str = ""  # "dense" | "lexical" | "fused" | "rerank"


@dataclass
class RetrievalGrade:
    """Verdict from the grading step of the agentic loop."""

    sufficient: bool
    reason: str
    missing: str = ""  # what the grader thinks is absent, feeds the rewrite step
    confidence: float = 0.0


@dataclass
class GroundednessCheck:
    grounded: bool
    reason: str
    unsupported_claims: list[str] = field(default_factory=list)


@dataclass
class TraceStep:
    step: str
    detail: dict[str, Any]
    elapsed_ms: int


@dataclass
class AgentTrace:
    question: str
    steps: list[TraceStep] = field(default_factory=list)
    llm_calls: int = 0
    started: float = field(default_factory=time.time)

    def record(self, step: str, **detail: Any) -> None:
        self.steps.append(
            TraceStep(step=step, detail=detail, elapsed_ms=int((time.time() - self.started) * 1000))
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "question": self.question,
            "llm_calls": self.llm_calls,
            "total_ms": int((time.time() - self.started) * 1000),
            "steps": [{"step": s.step, "elapsed_ms": s.elapsed_ms, **s.detail} for s in self.steps],
        }


@dataclass
class AnswerResult:
    question: str
    answer: str
    abstained: bool
    citations: list[str]
    retrieved_doc_ids: list[str]
    context: str
    iterations: int
    trace: AgentTrace

    def to_dict(self) -> dict[str, Any]:
        return {
            "question": self.question,
            "answer": self.answer,
            "abstained": self.abstained,
            "citations": self.citations,
            "retrieved_doc_ids": self.retrieved_doc_ids,
            "context": self.context,
            "iterations": self.iterations,
            "llm_calls": self.trace.llm_calls,
        }


# --------------------------------------------------------------------------------------
# Corpus loading and chunking
# --------------------------------------------------------------------------------------


def load_corpus(corpus_dir: Path = CORPUS_DIR) -> list[tuple[str, str]]:
    """Return [(doc_id, text)] for every markdown file in the corpus, sorted by name."""
    if not corpus_dir.is_dir():
        raise FileNotFoundError(f"corpus not found at {corpus_dir}")
    docs: list[tuple[str, str]] = []
    for path in sorted(corpus_dir.glob("*.md")):
        docs.append((path.name, path.read_text(encoding="utf-8")))
    if not docs:
        raise RuntimeError(f"no .md files in {corpus_dir}")
    return docs


def corpus_doc_ids(corpus_dir: Path = CORPUS_DIR) -> set[str]:
    """Every legal citation target. Used to reject hallucinated sources."""
    return {p.name for p in corpus_dir.glob("*.md")}


def chunk_document(doc_id: str, text: str) -> list[Chunk]:
    """TODO(step 1): decide how this corpus should be split.

    Contract:
      - returns a non-empty list of Chunk, each carrying the correct `doc_id`
      - `chunk_id` is unique across the whole corpus and stable across re-ingests
        (stable ids let you diff two indexes; random uuids do not)
      - no chunk should exceed roughly 1,000 characters, and none should be so small
        it carries no standalone meaning

    The naive default below splits on markdown headings and nothing else. That is a
    real strategy, not a placeholder, and on this corpus it is defensible - but it has
    a specific failure you can find with the golden set: gq-011 asks about a retention
    number that lives inside a table under one heading, while related numbers sit in
    adjacent rows. Run the retrieval eval, look at what gq-011 and gq-014 retrieve,
    and decide whether heading-level chunks are the right unit.

    Things worth trying and measuring (do not guess - measure):
      - fixed-size windows with overlap, on top of or instead of heading splits
      - prepending the document title and heading path to every chunk's text so that a
        chunk about "1.25%" still carries the word "Instant Payouts"
      - keeping whole small documents as single chunks (these docs are 150-350 words)
    """
    parts: list[Chunk] = []
    current_heading = ""
    buffer: list[str] = []
    ordinal = 0

    def flush() -> None:
        nonlocal ordinal, buffer
        body = "\n".join(buffer).strip()
        buffer = []
        if not body:
            return
        parts.append(
            Chunk(
                chunk_id=f"{doc_id}::{ordinal}",
                doc_id=doc_id,
                ordinal=ordinal,
                heading=current_heading,
                text=body,
            )
        )
        ordinal += 1

    for line in text.splitlines():
        if line.startswith("#"):
            flush()
            current_heading = line.lstrip("#").strip()
            buffer.append(line)
        else:
            buffer.append(line)
    flush()

    if not parts:  # a document with no headings at all
        parts.append(Chunk(f"{doc_id}::0", doc_id, 0, "", text.strip()))
    return parts


# --------------------------------------------------------------------------------------
# Embeddings
# --------------------------------------------------------------------------------------


def tokenize(text: str) -> list[str]:
    """Lowercase tokens, keeping percentages and money intact.

    Compound tokens are emitted twice: once whole and once split on separators, so that
    "card-testing" matches "card testing" and "X-Meridian-Sig-V1" still matches itself.
    Tokenisation choices like this move retrieval numbers more than most people expect -
    if you replace this, re-run the retrieval eval before and after and keep the diff.
    """
    tokens: list[str] = []
    for raw in re.findall(r"[a-z0-9][a-z0-9_.%$/-]*", text.lower()):
        tokens.append(raw)
        if any(sep in raw for sep in "-/_"):
            tokens.extend(p for p in re.split(r"[-/_]+", raw) if p)
    return tokens


class HashingEmbedder:
    """Offline fallback embedder. No API key, no model download, fully deterministic.

    This is a hashed bag-of-words: it captures term overlap and nothing else. It has no
    idea that "chargeback" and "dispute" are the same concept, which is exactly why your
    first eval run will look bad. That is the point - it gives you a running baseline and
    a number to beat, not a system to ship.
    """

    name = "hashing-bow"

    def __init__(self, dim: int = EMBED_DIM) -> None:
        self.dim = dim

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        return [self._one(t) for t in texts]

    def _one(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        for token in tokenize(text):
            if token in _STOPWORDS:
                continue
            h = int(hashlib.blake2b(token.encode("utf-8"), digest_size=8).hexdigest(), 16)
            vec[h % self.dim] += 1.0
        # sublinear term frequency, then L2 normalise so dot product == cosine
        vec = [1.0 + math.log(v) if v > 0 else 0.0 for v in vec]
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]


class LocalModelEmbedder:
    """TODO(step 2a): a real local embedding model.

    Contract: `.embed(texts) -> list[list[float]]`, same dimension for every call,
    L2-normalised (or fix `cosine()` accordingly), and deterministic for a given text.

    The intended implementation is sentence-transformers, which runs on CPU and costs
    nothing per query:

        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(EXAMPLE_EMBED_MODEL)
        return self._model.encode(list(texts), normalize_embeddings=True).tolist()

    Add `sentence-transformers` to requirements.txt if you take this path. Note that
    changing embedder invalidates the index - re-run ingest, and say so in your README.
    """

    name = "local-model"

    def __init__(self, model_id: str = EXAMPLE_EMBED_MODEL) -> None:
        self.model_id = model_id

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        raise NotImplementedError(
            "LocalModelEmbedder is a TODO. Set RAG_EMBEDDER=hashing to use the offline "
            "fallback, or implement this against sentence-transformers."
        )


class RemoteEmbedder:
    """TODO(step 2b): a hosted embedding API, if you would rather pay than download.

    Same contract as above. Two things that will bite you and belong in DESIGN.md:
      - batch: one HTTP call per chunk is slow and expensive; batch 64-256 at a time
      - the query and the documents must be embedded by the *same* model, and some
        providers require an asymmetric prefix for queries vs passages
    """

    name = "remote"

    def __init__(self, model_id: str = "") -> None:
        self.model_id = model_id or os.environ.get("EMBED_MODEL", "")

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        raise NotImplementedError("RemoteEmbedder is a TODO. See requirements.txt.")


def get_embedder() -> Any:
    kind = os.environ.get("RAG_EMBEDDER", "hashing").strip().lower()
    if kind == "hashing":
        return HashingEmbedder()
    if kind == "local":
        return LocalModelEmbedder()
    if kind == "remote":
        return RemoteEmbedder()
    raise ValueError(f"unknown RAG_EMBEDDER={kind!r} (expected hashing|local|remote)")


def cosine(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


# --------------------------------------------------------------------------------------
# Store
# --------------------------------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS chunks (
    chunk_id      TEXT PRIMARY KEY,
    doc_id        TEXT NOT NULL,
    ordinal       INTEGER NOT NULL,
    heading       TEXT NOT NULL DEFAULT '',
    text          TEXT NOT NULL,
    embedding     BLOB,
    embedding_dim INTEGER
);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""


class ChunkStore:
    """SQLite-backed store. Brute-force similarity over a few hundred chunks is fine.

    This is the documented local fallback so the lab runs with no Postgres. The
    production target is pgvector: same table shape, `embedding vector(N)`, an HNSW or
    IVFFlat index, and `ORDER BY embedding <=> :query_vec LIMIT :k` instead of the Python
    loop in `dense_search`. Porting it is a stretch goal in the README, and being able to
    say out loud why brute force is correct at 24 documents and wrong at 24 million is a
    question you will be asked in the walkthrough.
    """

    def __init__(self, path: Path = INDEX_PATH) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def reset(self) -> None:
        self.conn.execute("DELETE FROM chunks")
        self.conn.execute("DELETE FROM meta")
        self.conn.commit()

    def set_meta(self, key: str, value: str) -> None:
        self.conn.execute(
            "INSERT INTO meta(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, value),
        )
        self.conn.commit()

    def get_meta(self, key: str, default: str = "") -> str:
        row = self.conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default

    def add(self, chunks: Sequence[Chunk], vectors: Sequence[Sequence[float]]) -> None:
        rows = []
        for chunk, vec in zip(chunks, vectors):
            blob = array("f", vec).tobytes()
            rows.append(
                (chunk.chunk_id, chunk.doc_id, chunk.ordinal, chunk.heading, chunk.text, blob, len(vec))
            )
        self.conn.executemany(
            "INSERT OR REPLACE INTO chunks"
            "(chunk_id, doc_id, ordinal, heading, text, embedding, embedding_dim)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            rows,
        )
        self.conn.commit()

    def count(self) -> int:
        return int(self.conn.execute("SELECT COUNT(*) AS n FROM chunks").fetchone()["n"])

    def all_chunks(self) -> list[tuple[Chunk, list[float]]]:
        out: list[tuple[Chunk, list[float]]] = []
        for row in self.conn.execute("SELECT * FROM chunks ORDER BY doc_id, ordinal"):
            vec = array("f")
            if row["embedding"] is not None:
                vec.frombytes(row["embedding"])
            chunk = Chunk(
                chunk_id=row["chunk_id"],
                doc_id=row["doc_id"],
                ordinal=row["ordinal"],
                heading=row["heading"],
                text=row["text"],
            )
            out.append((chunk, list(vec)))
        return out


# --------------------------------------------------------------------------------------
# Ingest
# --------------------------------------------------------------------------------------


def ingest(corpus_dir: Path = CORPUS_DIR, index_path: Path = INDEX_PATH) -> dict[str, Any]:
    embedder = get_embedder()
    store = ChunkStore(index_path)
    store.reset()

    docs = load_corpus(corpus_dir)
    all_chunks: list[Chunk] = []
    for doc_id, text in docs:
        all_chunks.extend(chunk_document(doc_id, text))

    vectors = embedder.embed([c.text for c in all_chunks])
    if len(vectors) != len(all_chunks):
        raise RuntimeError("embedder returned the wrong number of vectors")
    store.add(all_chunks, vectors)
    store.set_meta("embedder", embedder.name)
    store.set_meta("embed_dim", str(len(vectors[0]) if vectors else 0))
    store.set_meta("ingested_at", str(int(time.time())))

    return {
        "documents": len(docs),
        "chunks": len(all_chunks),
        "embedder": embedder.name,
        "dim": len(vectors[0]) if vectors else 0,
        "index": str(index_path),
        "avg_chunk_chars": round(sum(len(c.text) for c in all_chunks) / max(1, len(all_chunks))),
    }


# --------------------------------------------------------------------------------------
# Retrieval
# --------------------------------------------------------------------------------------


def dense_search(query: str, store: ChunkStore, k: int = CANDIDATE_K) -> list[Scored]:
    """Vector similarity. Implemented for you: brute-force cosine over every chunk."""
    embedder = get_embedder()
    if store.get_meta("embedder") and store.get_meta("embedder") != embedder.name:
        raise RuntimeError(
            f"index was built with embedder {store.get_meta('embedder')!r} but "
            f"{embedder.name!r} is configured - re-run ingest"
        )
    qvec = embedder.embed([query])[0]
    scored = [
        Scored(chunk=chunk, score=cosine(qvec, vec), source="dense")
        for chunk, vec in store.all_chunks()
        if vec
    ]
    scored.sort(key=lambda s: s.score, reverse=True)
    return scored[:k]


def lexical_search(query: str, store: ChunkStore, k: int = CANDIDATE_K) -> list[Scored]:
    """TODO(step 3): real lexical retrieval.

    Contract: same shape as `dense_search` - descending `score`, at most `k` results,
    `source="lexical"`.

    Why this matters more than it looks: dense retrieval is bad at exact tokens, and this
    corpus is full of them - "R10", "SAQ D", "X-Meridian-Sig-V1", "0.9%". Query gq-008
    hinges on a header name and a hash algorithm. Lexical search is what finds those.

    Two reasonable implementations:
      - BM25 over the chunk table, computed in Python (k1 ~1.2-1.5, b ~0.75). Roughly 60
        lines. You need document frequency per term, so build it once at ingest.
      - SQLite FTS5: create a virtual table over chunk text at ingest time and query it
        with `MATCH`, which gives you BM25 for free. Check `sqlite3` was compiled with
        FTS5 first, and fall back if not - not every Python build ships it.

    The naive default is unweighted term overlap. It is barely better than nothing and it
    ignores document length entirely, which means long chunks always win.
    """
    q_terms = {t for t in tokenize(query) if t not in _STOPWORDS}
    if not q_terms:
        return []
    scored: list[Scored] = []
    for chunk, _vec in store.all_chunks():
        terms = set(tokenize(chunk.text))
        overlap = len(q_terms & terms)
        if overlap:
            scored.append(Scored(chunk=chunk, score=float(overlap), source="lexical"))
    scored.sort(key=lambda s: s.score, reverse=True)
    return scored[:k]


def hybrid_search(query: str, store: ChunkStore, k: int = CANDIDATE_K) -> list[Scored]:
    """TODO(step 4): fuse dense and lexical results.

    Contract: at most `k` results, descending score, no duplicate `chunk_id`.

    The default below is dense-only, which is not hybrid search - it is a placeholder that
    keeps the pipeline running. Replace it.

    Reciprocal Rank Fusion is the usual first choice because it needs no score
    normalisation across two retrievers whose scores are not comparable:

        score(chunk) = sum over retrievers of 1 / (rank_constant + rank_in_that_list)

    with rank_constant around 60. The alternative is weighted score fusion, which needs
    min-max normalisation per retriever and one more tunable. Whichever you pick, record
    the recall@5 before and after in DESIGN.md - "hybrid search helped" is not a finding,
    "+0.14 recall@5, entirely on the 6 exact-token queries" is.
    """
    return dense_search(query, store, k)


def rerank(query: str, candidates: Sequence[Scored], k: int = TOP_K) -> list[Scored]:
    """TODO(step 5): reorder candidates by true relevance and cut to `k`.

    Contract: returns at most `k` Scored, descending, `source="rerank"`. Must be a pure
    function of (query, candidates) - no hidden state.

    Retrieval optimises for recall over a wide net (`CANDIDATE_K`); reranking optimises
    for precision in the small window the model actually reads (`TOP_K`). They are
    different jobs and the second one is where most of the quality on this corpus lives,
    because the near-miss documents are lexically almost identical to the right ones.

    Options, cheapest first:
      - a local cross-encoder (sentence-transformers CrossEncoder), no API cost, ~50ms
      - a hosted rerank endpoint, one call per query
      - an LLM asked to score each candidate 0-10 against the query; simple, works, and
        is the most expensive of the three - measure it before you keep it

    The default is identity: it takes the top `k` in their existing order, which means
    your rerank stage currently does nothing at all.
    """
    return list(candidates[:k])


def build_context(chunks: Sequence[Scored], max_chars: int = 8000) -> str:
    """Render retrieved chunks into the string the model reads. Implemented for you.

    Note the citation markers. Every chunk is labelled with its doc_id so the model can
    cite it and so `validate_citations` can check the claim. If you change this format,
    change the answer prompt and the citation parser together or you will silently break
    the citation gate.
    """
    parts: list[str] = []
    used = 0
    for s in chunks:
        header = f"[{s.chunk.doc_id}]" + (f" ({s.chunk.heading})" if s.chunk.heading else "")
        block = f"{header}\n{s.chunk.text}\n"
        if used + len(block) > max_chars:
            break
        parts.append(block)
        used += len(block)
    return "\n---\n".join(parts)


# --------------------------------------------------------------------------------------
# Model seam
# --------------------------------------------------------------------------------------


def llm_configured() -> bool:
    return bool(os.environ.get("ANSWER_MODEL")) and bool(
        os.environ.get("ANTHROPIC_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
        or os.environ.get("LLM_API_KEY")
        or os.environ.get("LLM_BASE_URL")
    )


def call_llm(system: str, user: str, *, model: str = "", max_tokens: int = 1024) -> str:
    """TODO(step 6): the single place a provider SDK enters this codebase.

    Contract: returns the model's text response, raises on transport failure. Keep it
    synchronous and keep it stateless.

    Deliberately not implemented, because which provider you use is your decision and the
    rest of the pipeline must not care. Whatever you wire in:
      - read the model id from the environment (ANSWER_MODEL / GRADER_MODEL), never inline
      - set a timeout and a retry with backoff; a hung provider call should not hang a loop
      - count tokens or at least calls, and put the number in the trace - you cannot claim
        a cost per query in your README if you never measured one
      - route the cheap steps (grading, rewriting) to a fast tier and keep the frontier
        model for the final answer. This is the single biggest cost lever in the lab.

    Until you implement it, the pipeline runs in offline stub mode: retrieval is real,
    generation is extractive, and faithfulness will not pass the gate.
    """
    raise NotImplementedError(
        "call_llm is a TODO. Wire your provider here, or leave it and run in offline "
        "stub mode (retrieval works, generation does not)."
    )


# --------------------------------------------------------------------------------------
# Agentic loop: strategy internals
# --------------------------------------------------------------------------------------


def grade_retrieval(question: str, results: Sequence[Scored], trace: AgentTrace) -> RetrievalGrade:
    """TODO(step 7): decide whether what we retrieved can actually answer the question.

    Contract: returns a RetrievalGrade. `sufficient=False` sends the loop to a rewrite;
    `missing` should describe what is absent, in words, because that string is the input
    to the rewrite step. A grader that returns `missing=""` makes rewriting a coin flip.

    This is the step that turns a RAG pipeline into an agentic one, and it is the step
    most candidates hand-wave. Get concrete about the failure it prevents: on gq-006 the
    retriever happily returns the card refund policy alone. It looks perfectly relevant.
    It answers the question wrongly, because the question is ambiguous and a second
    document exists. A good grader notices the question has two possible readings and
    only one is covered.

    Implementation sketch: one LLM call, low temperature, structured output, with the
    question and the numbered chunk headers plus first ~200 chars of each. Ask for
    {sufficient, missing, confidence}. Do not ask it to answer - graders that answer
    become expensive and lenient.

    Cheap deterministic signals worth combining with (or trying before) the LLM call:
      - top score below a floor -> almost certainly insufficient
      - all top-k chunks from a single document, for a question with two subjects
      - the question names an entity that appears in no retrieved chunk

    The default accepts anything with a positive score, which means the loop never
    iterates and you have built single-pass RAG with extra steps.
    """
    top = results[0].score if results else 0.0
    return RetrievalGrade(
        sufficient=bool(results) and top > 0.0,
        reason="naive default: accepted because at least one chunk scored above zero",
        missing="",
        confidence=0.0,
    )


def rewrite_query(question: str, grade: RetrievalGrade, history: Sequence[str], trace: AgentTrace) -> Optional[str]:
    """TODO(step 8): produce a better search query, or None to stop looping.

    Contract: return a *new* query string that is not in `history`, or None. Returning a
    near-duplicate burns an iteration and a model call for nothing, which is exactly the
    runaway-loop failure mode interviewers ask about - so check before returning.

    What actually helps on this corpus:
      - swapping user vocabulary for corpus vocabulary ("chargeback" -> "dispute",
        "same day" -> "instant payout", "marketplace sellers" -> "connected accounts")
      - splitting a two-subject question into the subject that `grade.missing` names
      - adding the qualifier the question implied but never said (region, tier, method)

    Returning None is a legitimate and often correct decision. A loop that always finds
    something to rewrite is a loop that never abstains.
    """
    return None


def generate_answer(question: str, context: str, trace: AgentTrace) -> str:
    """TODO(step 9): write the answer from the retrieved context.

    Contract: returns prose that answers `question` using only `context`, and cites the
    documents it used as bare filenames in square brackets, e.g. [pricing-core-2026.md].
    `validate_citations` and the eval harness both depend on that marker format.

    Prompt requirements that map directly to gate metrics:
      - "use only the provided context" (faithfulness)
      - "cite the filename after each claim" (citation validity)
      - "if the context does not contain the answer, say so" (abstention)
      - "if the question is ambiguous, say which reading you answered" (gq-006, gq-021)

    The offline stub below returns the top chunk verbatim with a citation. It is honest
    about being extractive, it exercises the whole pipeline without an API key, and it
    will score badly on any question that needs two documents combined.
    """
    if llm_configured():
        return call_llm(
            system="You answer strictly from the provided context.",
            user=f"Context:\n{context}\n\nQuestion: {question}",
            model=os.environ.get("ANSWER_MODEL", ""),
        )
    first_doc = ""
    match = re.search(r"\[([^\]]+\.md)\]", context)
    if match:
        first_doc = match.group(1)
    body = context.split("\n---\n")[0].strip() if context else ""
    return (
        "[offline stub - no ANSWER_MODEL configured] Closest passage found:\n\n"
        f"{body}\n\n"
        + (f"[{first_doc}]" if first_doc else "")
    )


def check_groundedness(answer: str, context: str, trace: AgentTrace) -> GroundednessCheck:
    """TODO(step 10): verify the answer against the context before returning it.

    Contract: returns GroundednessCheck. `grounded=False` means the caller either repairs
    (one more loop) or abstains - never returns the answer as-is.

    This is the last line of defence and the one that makes the abstention queries
    (gq-027 to gq-030) pass. gq-029 is the case to think about: the retriever will return
    the support SLA document with high confidence, the generator will be tempted to
    reshape "4 hour first response" into an uptime commitment, and only a groundedness
    check that looks for the *specific claim* in the *specific text* will catch it.

    Implementation sketch: decompose the answer into atomic claims, then for each claim
    ask whether the context entails it. One call for decomposition plus one for
    verification is the accurate version; a single call with both instructions is the
    cheap version. Measure both - the cheap one is often good enough at this corpus size,
    and that is a defensible finding to write up.

    The default returns grounded=True unconditionally, which is the same as not having a
    groundedness check.
    """
    return GroundednessCheck(grounded=True, reason="naive default: no verification performed")


# --------------------------------------------------------------------------------------
# Agentic loop: orchestration (implemented - this is the reference structure)
# --------------------------------------------------------------------------------------


def extract_citations(answer: str) -> list[str]:
    """Pull [doc-id.md] markers out of an answer, in order, deduplicated."""
    seen: list[str] = []
    for match in re.findall(r"\[([^\]\n]+?\.md)\]", answer):
        if match not in seen:
            seen.append(match)
    return seen


def validate_citations(answer: str, corpus_dir: Path = CORPUS_DIR) -> tuple[list[str], list[str]]:
    """Split cited doc ids into (valid, invalid). Deterministic, no model involved.

    A citation to a file that does not exist is a fabrication you can detect for free,
    every time, with no judge and no threshold. Cheap deterministic checks belong in front
    of expensive probabilistic ones - that ordering is worth saying out loud in your
    walkthrough.
    """
    known = corpus_doc_ids(corpus_dir)
    cited = extract_citations(answer)
    return [c for c in cited if c in known], [c for c in cited if c not in known]


def abstain(question: str, trace: AgentTrace, reason: str, retrieved: Sequence[Scored]) -> AnswerResult:
    trace.record("abstain", reason=reason)
    return AnswerResult(
        question=question,
        answer=ABSTAIN_TEXT,
        abstained=True,
        citations=[],
        retrieved_doc_ids=ordered_doc_ids(retrieved),
        context="",
        iterations=len([s for s in trace.steps if s.step == "search"]),
        trace=trace,
    )


def ordered_doc_ids(results: Sequence[Scored]) -> list[str]:
    """Chunk-level results collapsed to a ranked, deduplicated document list.

    The golden set scores documents, not chunks, so this is the bridge between what the
    retriever returns and what recall@5 measures. Note that five chunks can collapse to
    two documents - which is a retrieval quality problem worth noticing, not a bug here.
    """
    out: list[str] = []
    for s in results:
        if s.chunk.doc_id not in out:
            out.append(s.chunk.doc_id)
    return out


def retrieve(question: str, store: ChunkStore, k: int = TOP_K) -> list[Scored]:
    """Single retrieval pass: hybrid search over a wide net, then rerank down to k."""
    candidates = hybrid_search(question, store, CANDIDATE_K)
    return rerank(question, candidates, k)


def answer_question(
    question: str,
    store: Optional[ChunkStore] = None,
    *,
    k: int = TOP_K,
    max_iterations: int = MAX_ITERATIONS,
) -> AnswerResult:
    """The agentic loop. Orchestration is complete; every strategy call inside is a TODO.

        search -> rerank -> grade -> (rewrite -> search again) -> generate -> verify
                                                                      |
                                                                  abstain

    Read this before you change anything, because the shape is the deliverable: budgets
    are enforced in one place, every branch is traced, and there is exactly one exit that
    returns an answer and one that abstains. When an interviewer asks "what stops it
    looping forever", the answer should be a line number.
    """
    store = store or ChunkStore()
    trace = AgentTrace(question=question)
    deadline = time.time() + DEADLINE_SECONDS

    query = question
    history: list[str] = [question]
    results: list[Scored] = []
    grade = RetrievalGrade(sufficient=False, reason="not yet searched")

    # DESIGN DECISION, already made for you - understand it, because you will be asked.
    # Evidence accumulates across iterations instead of the newest search replacing the
    # previous one. If pass 1 finds the dispute deadline and pass 2 finds the fee, an
    # answer needing both is only possible if we kept pass 1. The cost is that the final
    # candidate pool is larger than `k`, so `rerank` has to choose - which is precisely
    # why an identity reranker hurts here. If you prefer last-pass-wins, change it and
    # justify it in DESIGN.md with the recall numbers for both.
    collected: dict[str, Scored] = {}

    for iteration in range(1, max_iterations + 1):
        if time.time() > deadline:
            trace.record("budget_exhausted", kind="deadline", iteration=iteration)
            break

        pass_results = retrieve(query, store, k)
        for scored in pass_results:
            existing = collected.get(scored.chunk.chunk_id)
            if existing is None or scored.score > existing.score:
                collected[scored.chunk.chunk_id] = scored
        # Rerank against the ORIGINAL question, not the rewritten query: the rewrite is a
        # search tactic, the question is what the answer has to satisfy.
        results = rerank(question, list(collected.values()), k)
        trace.record(
            "search",
            iteration=iteration,
            query=query,
            docs=ordered_doc_ids(pass_results),
            collected_chunks=len(collected),
            top_score=round(pass_results[0].score, 4) if pass_results else 0.0,
        )

        grade = grade_retrieval(question, results, trace)
        trace.record(
            "grade",
            iteration=iteration,
            sufficient=grade.sufficient,
            reason=grade.reason,
            missing=grade.missing,
        )
        if grade.sufficient:
            break

        if iteration == max_iterations:
            trace.record("budget_exhausted", kind="iterations", iteration=iteration)
            break

        rewritten = rewrite_query(question, grade, history, trace)
        if not rewritten:
            trace.record("rewrite", iteration=iteration, result="stop", reason="no rewrite proposed")
            break
        if rewritten in history:
            # Guard against the runaway-loop failure mode: a rewriter that keeps
            # proposing the same query burns budget and changes nothing.
            trace.record("rewrite", iteration=iteration, result="stop", reason="duplicate query", query=rewritten)
            break
        trace.record("rewrite", iteration=iteration, result="retry", query=rewritten)
        history.append(rewritten)
        query = rewritten

    if not results or not grade.sufficient:
        return abstain(question, trace, f"retrieval judged insufficient: {grade.reason}", results)

    context = build_context(results)
    answer = generate_answer(question, context, trace)
    trace.record("generate", chars=len(answer), context_chars=len(context))

    valid, invalid = validate_citations(answer)
    if invalid:
        # Fabricated source: never return it. Repairing in place is a legitimate
        # alternative - if you go that way, do it once and then abstain, not in a loop.
        trace.record("citation_check", valid=valid, invalid=invalid, action="abstain")
        return abstain(question, trace, f"answer cited unknown documents: {invalid}", results)
    trace.record("citation_check", valid=valid, invalid=[], action="accept")

    check = check_groundedness(answer, context, trace)
    trace.record("groundedness", grounded=check.grounded, reason=check.reason,
                 unsupported=check.unsupported_claims)
    if not check.grounded:
        return abstain(question, trace, f"answer not grounded: {check.reason}", results)

    return AnswerResult(
        question=question,
        answer=answer,
        abstained=False,
        citations=valid,
        retrieved_doc_ids=ordered_doc_ids(results),
        context=context,
        iterations=len([s for s in trace.steps if s.step == "search"]),
        trace=trace,
    )


# --------------------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------------------


def _require_index() -> ChunkStore:
    store = ChunkStore()
    if store.count() == 0:
        print("index is empty - run: python starter/pipeline.py ingest", file=sys.stderr)
        raise SystemExit(2)
    return store


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Agentic RAG over the Meridian Pay corpus")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("ingest", help="chunk, embed, and index the corpus")
    sub.add_parser("stats", help="show what is currently indexed")

    p_ask = sub.add_parser("ask", help="answer one question")
    p_ask.add_argument("question", nargs="+")
    p_ask.add_argument("--k", type=int, default=TOP_K)

    p_trace = sub.add_parser("trace", help="answer one question and print the full trace")
    p_trace.add_argument("question", nargs="+")

    p_search = sub.add_parser("search", help="retrieval only, no generation")
    p_search.add_argument("question", nargs="+")
    p_search.add_argument("--k", type=int, default=TOP_K)

    args = parser.parse_args(argv)

    if args.command == "ingest":
        print(json.dumps(ingest(), indent=2))
        return 0

    if args.command == "stats":
        store = ChunkStore()
        print(json.dumps({
            "chunks": store.count(),
            "embedder": store.get_meta("embedder", "<none>"),
            "dim": store.get_meta("embed_dim", "0"),
            "index": str(INDEX_PATH),
            "corpus_docs": len(corpus_doc_ids()),
            "llm_configured": llm_configured(),
        }, indent=2))
        return 0

    question = " ".join(args.question)

    if args.command == "search":
        store = _require_index()
        for i, s in enumerate(retrieve(question, store, args.k), start=1):
            print(f"{i:>2}. {s.score:>8.4f}  {s.chunk.doc_id}  ({s.chunk.heading or 'no heading'})")
        return 0

    store = _require_index()
    result = answer_question(question, store)

    if args.command == "trace":
        print(json.dumps({"result": result.to_dict(), "trace": result.trace.to_dict()}, indent=2))
        return 0

    print(result.answer)
    print()
    print(f"abstained: {result.abstained}  citations: {result.citations or '-'}")
    print(f"retrieved: {result.retrieved_doc_ids}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
