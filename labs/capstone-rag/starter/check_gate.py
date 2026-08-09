"""Reads promptfoo's JSON output and enforces the aggregate release gate.

promptfoo decides pass/fail per query. This decides whether the *system* ships. That
split is the whole point: one flaky query going red should not block a release, and a
suite that drifted down 8 points while every individual query stayed above its floor
absolutely should.

    npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json
    python starter/check_gate.py eval-results.json

Exits 0 if every aggregate threshold in gate_config.py holds, 1 otherwise. That exit code
is what you wire into CI - a green gate on a pull request is the artifact a reviewer
trusts, and "I ran it locally" is not.

Note on parsing: promptfoo's output schema has changed across major versions, so this
reader walks the JSON tolerantly rather than assuming one shape. If it cannot find named
scores it says so loudly instead of reporting a confident zero - a gate that silently
reads nothing and passes is worse than no gate.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parent))

import gate_config  # noqa: E402


def _iter_results(payload: Any) -> Iterable[dict[str, Any]]:
    """Yield per-test result objects from whatever shape promptfoo produced."""
    if isinstance(payload, dict):
        for key in ("results", "evalResults"):
            node = payload.get(key)
            if isinstance(node, list):
                yield from (r for r in node if isinstance(r, dict))
                return
            if isinstance(node, dict):
                inner = node.get("results")
                if isinstance(inner, list):
                    yield from (r for r in inner if isinstance(r, dict))
                    return
        # some versions nest one level deeper under "eval" or "data"
        for key in ("eval", "data"):
            node = payload.get(key)
            if isinstance(node, dict):
                yield from _iter_results(node)
                return
    elif isinstance(payload, list):
        yield from (r for r in payload if isinstance(r, dict))


def _named_scores(result: dict[str, Any]) -> dict[str, float]:
    scores = result.get("namedScores")
    if isinstance(scores, dict):
        return {k: float(v) for k, v in scores.items() if isinstance(v, (int, float))}
    # fall back to reconstructing from component assertion results
    grading = result.get("gradingResult") or {}
    components = grading.get("componentResults") or []
    out: dict[str, float] = {}
    for comp in components:
        if not isinstance(comp, dict):
            continue
        metric = (comp.get("assertion") or {}).get("metric")
        if metric and isinstance(comp.get("score"), (int, float)):
            out[str(metric)] = float(comp["score"])
    return out


def _vars(result: dict[str, Any]) -> dict[str, Any]:
    for key in ("vars", "testCase"):
        node = result.get(key)
        if isinstance(node, dict):
            return node.get("vars", node) if key == "testCase" else node
    return {}


def collect(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    results = list(_iter_results(payload))
    if not results:
        raise SystemExit(
            f"could not find any test results in {path}. Run "
            "`npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json` first, "
            "then open the file and check its top-level shape against _iter_results()."
        )

    recalls: list[float] = []
    faithfulness: list[float] = []
    keypoints: list[float] = []
    citation_scores: list[float] = []
    correct_abstentions = 0
    total_abstention_cases = 0
    false_abstentions = 0
    unknown_metrics = 0

    for result in results:
        scores = _named_scores(result)
        if not scores:
            unknown_metrics += 1
            continue
        variables = _vars(result)
        answerable = variables.get("answerable")
        if answerable is None:
            answerable = bool(variables.get("relevant_doc_ids"))

        if answerable:
            if "recall_at_5" in scores:
                recalls.append(scores["recall_at_5"])
            if "false_abstention" in scores:
                if scores["false_abstention"] < 1.0:
                    false_abstentions += 1
        else:
            total_abstention_cases += 1
            if scores.get("abstention", 0.0) >= 1.0:
                correct_abstentions += 1

        if "citation_validity" in scores:
            citation_scores.append(scores["citation_validity"])
        if "faithfulness" in scores:
            faithfulness.append(scores["faithfulness"])
        if "keypoint_coverage" in scores:
            keypoints.append(scores["keypoint_coverage"])

    def mean(values: list[float]) -> float:
        return sum(values) / len(values) if values else 0.0

    return {
        "tests": len(results),
        "unreadable": unknown_metrics,
        "mean_recall_at_5": mean(recalls),
        "recall_n": len(recalls),
        "mean_faithfulness": mean(faithfulness),
        "faithfulness_n": len(faithfulness),
        "citation_validity": mean(citation_scores),
        "citation_n": len(citation_scores),
        "correct_abstentions": correct_abstentions,
        "abstention_cases": total_abstention_cases,
        "false_abstentions": false_abstentions,
        "mean_keypoint_coverage": mean(keypoints),
        "keypoint_n": len(keypoints),
    }


def enforce(stats: dict[str, Any]) -> tuple[bool, list[str]]:
    checks: list[tuple[str, bool, str]] = [
        (
            "mean recall@5",
            stats["mean_recall_at_5"] >= gate_config.MEAN_RECALL_AT_5,
            f"{stats['mean_recall_at_5']:.3f} (need >= {gate_config.MEAN_RECALL_AT_5:.2f}, n={stats['recall_n']})",
        ),
        (
            "mean faithfulness",
            stats["mean_faithfulness"] >= gate_config.MEAN_FAITHFULNESS,
            f"{stats['mean_faithfulness']:.3f} (need >= {gate_config.MEAN_FAITHFULNESS:.2f}, n={stats['faithfulness_n']})",
        ),
        (
            "correct abstentions",
            stats["correct_abstentions"] >= gate_config.ABSTENTION_MIN_CORRECT,
            f"{stats['correct_abstentions']}/{stats['abstention_cases']} (need >= {gate_config.ABSTENTION_MIN_CORRECT})",
        ),
        (
            "citation validity",
            stats["citation_validity"] >= gate_config.CITATION_VALIDITY,
            f"{stats['citation_validity']:.3f} (need == {gate_config.CITATION_VALIDITY:.2f}, n={stats['citation_n']})",
        ),
        (
            "false abstentions",
            stats["false_abstentions"] <= gate_config.MAX_FALSE_ABSTENTIONS,
            f"{stats['false_abstentions']} (allowed <= {gate_config.MAX_FALSE_ABSTENTIONS})",
        ),
    ]

    lines = [f"tests evaluated: {stats['tests']}"]
    if stats["unreadable"]:
        lines.append(f"WARNING: {stats['unreadable']} results had no readable metrics")
    for name, ok, detail in checks:
        lines.append(f"  [{'PASS' if ok else 'FAIL'}] {name:<20} {detail}")
    lines.append(
        f"  [ -- ] {'keypoint coverage':<20} {stats['mean_keypoint_coverage']:.3f} "
        f"(reported only, target {gate_config.KEYPOINT_COVERAGE_TARGET:.2f}, n={stats['keypoint_n']})"
    )

    passed = all(ok for _, ok, _ in checks) and not stats["unreadable"]
    return passed, lines


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Enforce the aggregate eval gate")
    parser.add_argument("results", nargs="?", type=Path, default=Path("eval-results.json"))
    args = parser.parse_args(argv)

    if not args.results.exists():
        print(f"no results file at {args.results}", file=sys.stderr)
        print("run: npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json", file=sys.stderr)
        return 2

    stats = collect(args.results)
    passed, lines = enforce(stats)
    print("\n".join(lines))
    print()
    print("GATE PASSED" if passed else "GATE FAILED")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
