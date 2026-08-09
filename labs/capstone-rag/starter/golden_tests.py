"""Turns data/golden-queries.json into promptfoo test cases.

promptfoo loads this through `tests: file://starter/golden_tests.py:load_golden_tests`.
Keeping the golden set in its own JSON file - rather than inlining cases in the YAML -
means one artifact defines the truth, and the eval config, the retrieval scorer, and
your own debugging scripts all read it. When you add a query, you add it in one place.

Per-test assertions are attached here rather than in the YAML because answerable and
unanswerable queries are graded on different things: one must answer, the other must
refuse. The assertions that apply to every query live in `defaultTest` in the YAML.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

LAB_ROOT = Path(__file__).resolve().parent.parent
GOLDEN_PATH = LAB_ROOT / "data" / "golden-queries.json"
CORPUS_DIR = LAB_ROOT / "data" / "corpus"

REQUIRED_FIELDS = {"id", "query", "relevant_doc_ids", "expected_answer_keypoints", "hard", "notes"}


def load_golden(path: Path = GOLDEN_PATH, corpus_dir: Path = CORPUS_DIR) -> list[dict[str, Any]]:
    """Load and validate the golden set.

    Validation lives here rather than in a separate script so that every consumer - the
    eval config, the retrieval scorer, your debugging one-liners - gets it for free. A
    golden set that points at a document you renamed is the quietest way to make an eval
    suite lie to you: recall silently drops, nothing errors, and you go looking for the
    bug in your retriever.
    """
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, list):
        raise ValueError("golden-queries.json must be a JSON array of query objects")

    known_docs = {p.name for p in corpus_dir.glob("*.md")}
    if not known_docs:
        raise ValueError(f"no corpus documents found in {corpus_dir}")

    problems: list[str] = []
    seen_ids: set[str] = set()
    for i, item in enumerate(data):
        label = item.get("id", f"index {i}") if isinstance(item, dict) else f"index {i}"
        if not isinstance(item, dict):
            problems.append(f"{label}: not an object")
            continue
        missing = REQUIRED_FIELDS - set(item)
        if missing:
            problems.append(f"{label}: missing fields {sorted(missing)}")
            continue
        if item["id"] in seen_ids:
            problems.append(f"{label}: duplicate id")
        seen_ids.add(item["id"])
        if not isinstance(item["hard"], bool):
            problems.append(f"{label}: 'hard' must be a boolean")
        if not item["expected_answer_keypoints"]:
            problems.append(f"{label}: expected_answer_keypoints is empty")
        for doc_id in item["relevant_doc_ids"]:
            if doc_id not in known_docs:
                problems.append(f"{label}: relevant_doc_id {doc_id!r} is not in data/corpus/")

    if problems:
        raise ValueError("golden set failed validation:\n  " + "\n  ".join(problems))
    return data


def load_golden_tests() -> list[dict[str, Any]]:
    tests: list[dict[str, Any]] = []
    for item in load_golden():
        answerable = bool(item["relevant_doc_ids"])
        test: dict[str, Any] = {
            "description": f"{item['id']}: {item['query'][:70]}",
            "vars": {
                "id": item["id"],
                "query": item["query"],
                "relevant_doc_ids": item["relevant_doc_ids"],
                "keypoints": "\n".join(f"- {kp}" for kp in item["expected_answer_keypoints"]),
                "hard": item["hard"],
                "answerable": answerable,
            },
            "assert": [],
        }
        if answerable:
            test["assert"].append({
                "type": "python",
                "value": "file://starter/asserts.py:assert_must_answer",
                "metric": "false_abstention",
            })
        else:
            test["assert"].append({
                "type": "python",
                "value": "file://starter/asserts.py:assert_must_abstain",
                "metric": "abstention",
            })
        tests.append(test)
    return tests


if __name__ == "__main__":
    generated = load_golden_tests()
    print(f"{len(generated)} test cases")
    answerable = sum(1 for t in generated if t["vars"]["answerable"])
    print(f"  answerable: {answerable}   must-abstain: {len(generated) - answerable}")
    print(f"  hard: {sum(1 for t in generated if t['vars']['hard'])}")
