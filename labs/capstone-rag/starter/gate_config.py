"""Single source of truth for the eval gate.

Every threshold in the README, in promptfooconfig.yaml, and in the scripts comes from
here. If you change a number, change it once, here, and say why in DESIGN.md. A gate you
quietly lowered the night before submitting is worse than no gate, and it is the first
thing a reviewer checks in your git history.

Two layers, on purpose:

  PER-QUERY floors      catch a single catastrophic regression, and turn red in the
                        promptfoo output next to the query that broke.
  AGGREGATE thresholds  are the release gate. `check_gate.py` enforces these, and this
                        is what "the gate is green" means.

They are deliberately different numbers. A per-query floor set as high as the aggregate
would mean every query must pass individually, which is not what an aggregate threshold
says and not how you would run this in CI.
"""

from __future__ import annotations

# --- per-query floors (surfaced by promptfoo, one row per query) ----------------------

#: A query fails outright if fewer than half its required documents make the top 5.
PER_QUERY_RECALL_FLOOR = 0.5

#: Faithfulness judge score below this fails that individual query.
PER_QUERY_FAITHFULNESS_FLOOR = 0.9

#: Cited documents that do not exist are never acceptable, on any single query.
PER_QUERY_CITATION_VALIDITY = 1.0


# --- aggregate release gate (enforced by check_gate.py) -------------------------------

#: Mean recall@5 over the 26 answerable queries, macro-averaged per query.
#:
#: Calibrated against measured baselines on this corpus, not guessed. On the shipped
#: skeleton: hashing embedder alone scores ~0.65; a competent BM25-only implementation
#: reaches ~0.85; naive RRF fusion of the two lands ~0.83 - lower than BM25 alone,
#: because fusing a good retriever with a bad one averages them. The gate sits above all
#: three deliberately: no single technique clears it, and passing requires real
#: embeddings, fusion that is actually tuned, a reranker that does something, or a
#: retrieval loop that adds evidence on a second pass. Usually a combination.
MEAN_RECALL_AT_5 = 0.88

#: Mean faithfulness over every query that returned an answer.
MEAN_FAITHFULNESS = 0.90

#: Of the 4 unanswerable queries, how many must be abstained on.
#: Not 4/4. Four items is too small a sample to gate at 100% without inviting a
#: coin-flip pass, and pretending otherwise would be exactly the kind of eval theatre
#: this lab is about avoiding. Report all four outcomes in your README either way.
ABSTENTION_MIN_CORRECT = 3
ABSTENTION_TOTAL = 4

#: Fraction of answered queries whose citations all resolve to real corpus files.
#: This one is gated at 1.0 because it is deterministic and free to check - there is no
#: statistical excuse for citing a file that does not exist.
CITATION_VALIDITY = 1.0

#: False abstention: answerable queries the system refused to answer. Some slack is
#: allowed, because a system tuned to never abstain will fail the abstention gate.
MAX_FALSE_ABSTENTIONS = 2

#: k for recall@k. Changing this changes what the gate means - if you report recall@10,
#: say so everywhere, including your README headline number.
TOP_K = 5


# --- reported, not gated --------------------------------------------------------------

#: Keypoint coverage is judged and recorded but does not block a release. It measures
#: answer completeness against expected_answer_keypoints, which is a softer, more
#: subjective signal than groundedness. Treat a falling trend as a warning.
KEYPOINT_COVERAGE_TARGET = 0.70

#: Targets you should report in the README metrics table and be able to defend, but
#: which are not enforced here because they depend on your hardware and provider.
P95_LATENCY_SECONDS_TARGET = 10.0
COST_PER_QUERY_USD_TARGET = 0.05


GATE_SUMMARY = f"""
Release gate (all must hold):
  mean recall@{TOP_K}      >= {MEAN_RECALL_AT_5:.2f}   over answerable queries
  mean faithfulness        >= {MEAN_FAITHFULNESS:.2f}   over answered queries
  correct abstentions      >= {ABSTENTION_MIN_CORRECT}/{ABSTENTION_TOTAL}
  citation validity        == {CITATION_VALIDITY:.2f}
  false abstentions        <= {MAX_FALSE_ABSTENTIONS}
Reported, not gated:
  keypoint coverage target  {KEYPOINT_COVERAGE_TARGET:.2f}
  p95 latency target        {P95_LATENCY_SECONDS_TARGET:.0f}s
  cost per query target     ${COST_PER_QUERY_USD_TARGET:.2f}
""".strip()


if __name__ == "__main__":
    print(GATE_SUMMARY)
