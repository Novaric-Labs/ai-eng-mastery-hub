"""Deterministic graders for the promptfoo suite.

Everything in this file is free to run and gives the same answer every time. That is the
point: put the cheap deterministic checks in front of the expensive probabilistic ones,
so an LLM judge is only ever asked the questions that genuinely need judgement.

  recall@5           set arithmetic against the golden set
  citation validity  string membership against the corpus directory
  abstention         a boolean the pipeline already computed

None of these needs a model, and none of them can drift.

Each function returns promptfoo's GradingResult shape: {"pass", "score", "reason"}.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import gate_config  # noqa: E402

LAB_ROOT = Path(__file__).resolve().parent.parent
CORPUS_DIR = LAB_ROOT / "data" / "corpus"


def _corpus_doc_ids() -> set[str]:
    return {p.name for p in CORPUS_DIR.glob("*.md")}


def _parse_output(output: Any) -> dict[str, Any]:
    """The provider returns a JSON string. Be forgiving about what promptfoo hands back."""
    if isinstance(output, dict):
        return output
    if isinstance(output, str):
        try:
            parsed = json.loads(output)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "provider output was not JSON. promptfoo_provider.py must return a JSON "
                f"string built from AnswerResult.to_dict(). Got: {output[:200]!r}"
            ) from exc
        if not isinstance(parsed, dict):
            raise ValueError("provider output JSON must be an object")
        return parsed
    raise ValueError(f"unexpected provider output type: {type(output).__name__}")


def _vars(context: Any) -> dict[str, Any]:
    if isinstance(context, dict):
        return context.get("vars") or {}
    return getattr(context, "vars", {}) or {}


def _as_list(value: Any) -> list[str]:
    """Vars can arrive as a real list or as a JSON/comma string depending on the path."""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        if stripped.startswith("["):
            try:
                return [str(v) for v in json.loads(stripped)]
            except json.JSONDecodeError:
                pass
        return [part.strip() for part in stripped.split(",") if part.strip()]
    return [str(value)]


# --------------------------------------------------------------------------------------


def assert_recall_at_5(output: Any, context: Any = None) -> dict[str, Any]:
    """Fraction of required documents that made the top k.

    Macro-averaged per query by check_gate.py, so a query needing three documents counts
    exactly as much as one needing a single document. That is a choice - micro-averaging
    over document hits would weight the multi-doc queries higher. Either is defensible;
    say which you used when you report the number.
    """
    data = _parse_output(output)
    required = _as_list(_vars(context).get("relevant_doc_ids"))
    k = gate_config.TOP_K

    if not required:
        return {"pass": True, "score": 1.0, "reason": "unanswerable query - recall not applicable"}

    retrieved = [str(d) for d in data.get("retrieved_doc_ids", [])][:k]
    hits = [d for d in required if d in retrieved]
    score = len(hits) / len(required)
    missing = [d for d in required if d not in retrieved]
    ok = score >= gate_config.PER_QUERY_RECALL_FLOOR

    return {
        "pass": ok,
        "score": score,
        "reason": (
            f"recall@{k}={score:.2f} ({len(hits)}/{len(required)}); "
            f"missing={missing or 'none'}; retrieved={retrieved}"
        ),
    }


def assert_citations_resolve(output: Any, context: Any = None) -> dict[str, Any]:
    """Every cited document must exist, and must be something we actually retrieved.

    The second half matters more than it looks. A citation to a real file the pipeline
    never read is still a fabrication - the model recognised the filename and attached it
    to a claim it invented. Checking existence alone would pass that.
    """
    data = _parse_output(output)
    known = _corpus_doc_ids()
    citations = [str(c) for c in data.get("citations", [])]
    retrieved = {str(d) for d in data.get("retrieved_doc_ids", [])}

    if data.get("abstained"):
        if citations:
            return {
                "pass": False,
                "score": 0.0,
                "reason": f"abstained but still cited {citations} - an abstention cites nothing",
            }
        return {"pass": True, "score": 1.0, "reason": "abstained with no citations"}

    if not citations:
        return {
            "pass": False,
            "score": 0.0,
            "reason": "answered with no citations at all - nothing to verify against",
        }

    nonexistent = [c for c in citations if c not in known]
    unretrieved = [c for c in citations if c in known and c not in retrieved]
    valid = len(citations) - len(nonexistent) - len(unretrieved)
    score = valid / len(citations)

    problems = []
    if nonexistent:
        problems.append(f"not in corpus: {nonexistent}")
    if unretrieved:
        problems.append(f"cited but never retrieved: {unretrieved}")

    return {
        "pass": score >= gate_config.PER_QUERY_CITATION_VALIDITY,
        "score": score,
        "reason": "; ".join(problems) if problems else f"all {len(citations)} citations resolve",
    }


def assert_must_abstain(output: Any, context: Any = None) -> dict[str, Any]:
    """For the four queries the corpus cannot answer, refusing IS the correct output."""
    data = _parse_output(output)
    if data.get("abstained"):
        return {"pass": True, "score": 1.0, "reason": "correctly abstained"}
    answer = str(data.get("answer", ""))[:240]
    return {
        "pass": False,
        "score": 0.0,
        "reason": f"answered an unanswerable query - this is the fabrication case. Got: {answer!r}",
    }


def assert_must_answer(output: Any, context: Any = None) -> dict[str, Any]:
    """False abstention: the corpus does contain the answer and the system gave up.

    Tracked separately from correct abstention because the two failure modes pull in
    opposite directions. A pipeline that abstains on everything scores 4/4 on abstention
    and is useless.
    """
    data = _parse_output(output)
    if not data.get("abstained"):
        return {"pass": True, "score": 1.0, "reason": "answered, as expected"}
    return {
        "pass": False,
        "score": 0.0,
        "reason": "false abstention - the corpus contains this answer",
    }


if __name__ == "__main__":
    demo = json.dumps({
        "answer": "Growth is 2.6% + USD 0.25 [pricing-core-2026.md]",
        "abstained": False,
        "citations": ["pricing-core-2026.md"],
        "retrieved_doc_ids": ["pricing-core-2026.md", "support-tiers-sla.md"],
    })
    ctx = {"vars": {"relevant_doc_ids": ["pricing-core-2026.md"]}}
    for fn in (assert_recall_at_5, assert_citations_resolve, assert_must_answer):
        print(f"{fn.__name__}: {fn(demo, ctx)}")
