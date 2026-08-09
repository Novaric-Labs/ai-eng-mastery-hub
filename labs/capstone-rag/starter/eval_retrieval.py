"""Retrieval-only evaluation. No model calls, no API key, no cost, runs in seconds.

This is the loop you should live in while you build. Retrieval quality is the ceiling on
everything downstream - a generator cannot ground an answer in a document that was never
retrieved - so tune here first, for free, and only spend money on the full promptfoo suite
once recall@5 clears the bar.

    python starter/eval_retrieval.py                 # full table
    python starter/eval_retrieval.py --hard-only     # just the 22 hard queries
    python starter/eval_retrieval.py --gate          # exit 1 if mean recall@5 is short
    python starter/eval_retrieval.py --show gq-006   # what one query actually retrieved

Metrics reported:
  recall@k     mean over answerable queries of (required docs found) / (required docs)
  strict@k     fraction of answerable queries where ALL required docs made the top k
  mrr          mean reciprocal rank of the first required doc

recall@k is the gated number. strict@k is the honest one - it is what "the model had
everything it needed" actually means, and it will be lower. Report both.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import gate_config  # noqa: E402
import pipeline  # noqa: E402
from golden_tests import load_golden  # noqa: E402


def evaluate(k: int = gate_config.TOP_K, hard_only: bool = False) -> dict[str, Any]:
    store = pipeline.ChunkStore()
    if store.count() == 0:
        raise SystemExit("index is empty - run: python starter/pipeline.py ingest")

    rows: list[dict[str, Any]] = []
    for item in load_golden():
        if hard_only and not item["hard"]:
            continue
        results = pipeline.retrieve(item["query"], store, k)
        retrieved = pipeline.ordered_doc_ids(results)[:k]
        required = list(item["relevant_doc_ids"])

        if required:
            hits = [d for d in required if d in retrieved]
            recall = len(hits) / len(required)
            strict = len(hits) == len(required)
            ranks = [retrieved.index(d) + 1 for d in required if d in retrieved]
            rr = 1.0 / min(ranks) if ranks else 0.0
        else:
            recall = strict = rr = None  # type: ignore[assignment]

        rows.append({
            "id": item["id"],
            "hard": item["hard"],
            "answerable": bool(required),
            "required": required,
            "retrieved": retrieved,
            "missing": [d for d in required if d not in retrieved],
            "recall": recall,
            "strict": strict,
            "rr": rr,
            "query": item["query"],
        })

    answerable = [r for r in rows if r["answerable"]]
    hard = [r for r in answerable if r["hard"]]
    easy = [r for r in answerable if not r["hard"]]

    def mean(values: list[float]) -> float:
        return sum(values) / len(values) if values else 0.0

    summary = {
        "k": k,
        "queries": len(rows),
        "answerable": len(answerable),
        "unanswerable": len(rows) - len(answerable),
        f"recall_at_{k}": round(mean([r["recall"] for r in answerable]), 4),
        f"strict_at_{k}": round(mean([1.0 if r["strict"] else 0.0 for r in answerable]), 4),
        "mrr": round(mean([r["rr"] for r in answerable]), 4),
        f"recall_at_{k}_hard": round(mean([r["recall"] for r in hard]), 4),
        f"recall_at_{k}_easy": round(mean([r["recall"] for r in easy]), 4),
        "threshold": gate_config.MEAN_RECALL_AT_5,
        "embedder": store.get_meta("embedder", "<none>"),
        "chunks": store.count(),
    }
    return {"summary": summary, "rows": rows}


def print_report(report: dict[str, Any]) -> None:
    summary = report["summary"]
    k = summary["k"]

    print(f"\nindex: {summary['chunks']} chunks, embedder={summary['embedder']}\n")
    print(f"{'query':<9} {'hard':<5} {'recall':>7} {'strict':>7}  missing")
    print("-" * 78)
    for row in report["rows"]:
        if not row["answerable"]:
            print(f"{row['id']:<9} {'yes':<5} {'  n/a':>7} {'  n/a':>7}  "
                  f"must abstain; top hit was {row['retrieved'][0] if row['retrieved'] else '-'}")
            continue
        flag = "yes" if row["hard"] else "-"
        strict = "yes" if row["strict"] else "no"
        missing = ", ".join(row["missing"]) or "-"
        print(f"{row['id']:<9} {flag:<5} {row['recall']:>7.2f} {strict:>7}  {missing}")

    print("-" * 78)
    print(f"recall@{k}        {summary[f'recall_at_{k}']:.3f}   (gate: >= {summary['threshold']:.2f})")
    print(f"strict@{k}        {summary[f'strict_at_{k}']:.3f}   all required docs retrieved")
    print(f"mrr             {summary['mrr']:.3f}")
    print(f"recall@{k} hard   {summary[f'recall_at_{k}_hard']:.3f}   ({len([r for r in report['rows'] if r['hard'] and r['answerable']])} queries)")
    print(f"recall@{k} easy   {summary[f'recall_at_{k}_easy']:.3f}   ({len([r for r in report['rows'] if not r['hard'] and r['answerable']])} queries)")
    print()


def show_query(query_id: str, k: int) -> int:
    store = pipeline.ChunkStore()
    for item in load_golden():
        if item["id"] != query_id:
            continue
        print(f"\n{item['id']}  hard={item['hard']}")
        print(f"query:    {item['query']}")
        print(f"required: {item['relevant_doc_ids'] or '(abstain)'}")
        print(f"notes:    {item['notes']}\n")
        for i, scored in enumerate(pipeline.retrieve(item["query"], store, k), start=1):
            mark = "*" if scored.chunk.doc_id in item["relevant_doc_ids"] else " "
            heading = scored.chunk.heading or "no heading"
            print(f" {mark}{i:>2}. {scored.score:>8.4f}  {scored.chunk.doc_id}  ({heading})")
        print()
        return 0
    print(f"no such query id: {query_id}", file=sys.stderr)
    return 2


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Deterministic retrieval evaluation")
    parser.add_argument("--k", type=int, default=gate_config.TOP_K)
    parser.add_argument("--hard-only", action="store_true")
    parser.add_argument("--gate", action="store_true", help="exit 1 if below the recall threshold")
    parser.add_argument("--json", type=Path, default=None, help="write the full report here")
    parser.add_argument("--show", metavar="QUERY_ID", default=None)
    args = parser.parse_args(argv)

    if args.show:
        return show_query(args.show, args.k)

    report = evaluate(k=args.k, hard_only=args.hard_only)
    print_report(report)

    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"wrote {args.json}")

    if args.gate:
        achieved = report["summary"][f"recall_at_{args.k}"]
        if achieved < gate_config.MEAN_RECALL_AT_5:
            print(
                f"GATE FAILED: recall@{args.k} {achieved:.3f} < {gate_config.MEAN_RECALL_AT_5:.2f}",
                file=sys.stderr,
            )
            return 1
        print(f"GATE PASSED: recall@{args.k} {achieved:.3f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
