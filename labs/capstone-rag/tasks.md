# Commands

Every command the lab needs, written out. The `Makefile` wraps these for convenience, but
`make` is not installed by default on Windows, so this file is the canonical list.

Run everything from the lab root (`labs/capstone-rag/`). Paths are relative to it.

Use `python` or `py -3` depending on your setup; the commands are otherwise identical in
PowerShell, cmd, and bash.

---

## Setup

| Task | Command |
|---|---|
| Install Python deps | `python -m pip install -r starter/requirements.txt` |
| Create your env file (PowerShell) | `Copy-Item .env.example .env` |
| Create your env file (bash) | `cp .env.example .env` |
| Check the golden set matches the corpus | `python starter/golden_tests.py` |

`python starter/golden_tests.py` is the cross-file integrity check: it fails loudly if any
`relevant_doc_ids` entry does not exist in `data/corpus/`, if an id is duplicated, or if a
required field is missing. Run it after touching either file.

## Build the index

| Task | Command |
|---|---|
| Chunk, embed, index | `python starter/pipeline.py ingest` |
| See what is indexed | `python starter/pipeline.py stats` |

Re-run `ingest` after any change to chunking or the embedder. The store refuses to serve
an index built by a different embedder rather than returning quietly wrong results.

## Ask questions

| Task | Command |
|---|---|
| Retrieval only, no generation | `python starter/pipeline.py search "how long do we have to submit dispute evidence?"` |
| Full agentic loop | `python starter/pipeline.py ask "can our marketplace sellers get instant payouts?"` |
| Full loop plus the whole trace | `python starter/pipeline.py trace "what does it cost to get money same day?"` |

`trace` is the one to reach for when the loop misbehaves. It prints every search, the
grade and its reason, every rewrite, the citation check, and the groundedness verdict,
with elapsed milliseconds on each step.

## Evaluate

| Task | Command | Costs money |
|---|---|---|
| Retrieval metrics | `python starter/eval_retrieval.py` | no |
| Retrieval metrics, hard queries only | `python starter/eval_retrieval.py --hard-only` | no |
| Retrieval gate (exit 1 on failure) | `python starter/eval_retrieval.py --gate` | no |
| Inspect one query's retrieval | `python starter/eval_retrieval.py --show gq-006` | no |
| Save the retrieval report | `python starter/eval_retrieval.py --json reports/retrieval.json` | no |
| Full eval suite | `npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json` | **yes** |
| Enforce the release gate | `python starter/check_gate.py eval-results.json` | no |
| Browse the last run in a UI | `npx promptfoo view` | no |

Work in the free loop until `--gate` passes. Retrieval is the ceiling on everything
downstream, and the paid suite cannot tell you anything useful while recall is low.

Pin the promptfoo version in your submission README, e.g. `npx promptfoo@x.y.z eval ...`,
so a reviewer reproduces your numbers rather than whatever ships that week.

## Tests

| Task | Command |
|---|---|
| Run your edge-case tests | `python -m pytest -q` |

## Clean up

| Task | Command |
|---|---|
| Delete the index (PowerShell) | `Remove-Item -Recurse -Force .data` |
| Delete the index (bash) | `rm -rf .data` |
| Delete eval output | `Remove-Item eval-results.json` / `rm -f eval-results.json` |

---

## The order to actually run them

```
python starter/golden_tests.py                 # 1. integrity check
python starter/pipeline.py ingest              # 2. build the index
python starter/eval_retrieval.py               # 3. see the baseline (~0.65 recall@5)
                                               # 4. build. re-run step 3 constantly.
python starter/eval_retrieval.py --gate        # 5. green? only now spend money
npx promptfoo eval -c promptfooconfig.yaml -o eval-results.json
python starter/check_gate.py eval-results.json # 6. the release decision
```
