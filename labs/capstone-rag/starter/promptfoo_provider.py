"""promptfoo custom provider: runs the agentic pipeline for one golden query.

promptfoo calls `call_api(prompt, options, context)` once per test case and treats the
returned `output` as the thing to assert against. We return a compact JSON string rather
than plain prose, because every downstream assertion needs more than the answer text:
the retrieved document ids (recall), the citations (validity), the abstention flag, and
the retrieved context (faithfulness judging).

That single decision is what lets the graders in asserts.py stay deterministic and lets
the faithfulness rubric see the answer and its evidence in one place.

You should not need to edit this file. If an assertion cannot find a field it needs, add
the field to `AnswerResult.to_dict()` in pipeline.py instead.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pipeline  # noqa: E402  (path setup must happen first)

_STORE: Any = None


def _store() -> Any:
    """One store for the whole suite. Re-opening SQLite per test is pure overhead."""
    global _STORE
    if _STORE is None:
        _STORE = pipeline.ChunkStore()
        if _STORE.count() == 0:
            raise RuntimeError(
                "index is empty - run `python starter/pipeline.py ingest` before evaluating"
            )
    return _STORE


def call_api(prompt: str, options: dict[str, Any] | None = None, context: dict[str, Any] | None = None) -> dict[str, Any]:
    ctx = context or {}
    variables = ctx.get("vars") or {}
    question = variables.get("query") or prompt

    started = time.time()
    try:
        result = pipeline.answer_question(question, _store())
    except Exception as exc:  # surfaced as a test error, not a silent pass
        return {"error": f"{type(exc).__name__}: {exc}"}

    elapsed = time.time() - started
    payload = result.to_dict()
    payload["latency_seconds"] = round(elapsed, 3)

    return {
        "output": json.dumps(payload, ensure_ascii=False),
        # promptfoo records these alongside the result; they are also what you would
        # forward to a tracing backend once you instrument this properly.
        "metadata": {
            "query_id": variables.get("id", ""),
            "abstained": result.abstained,
            "iterations": result.iterations,
            "llm_calls": result.trace.llm_calls,
            "latency_seconds": round(elapsed, 3),
            "retrieved_doc_ids": result.retrieved_doc_ids,
        },
    }
