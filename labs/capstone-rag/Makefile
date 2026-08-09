# Capstone 1 - agentic RAG over the Meridian Pay corpus.
#
# No make on your machine (common on Windows)? Every command below is written out
# verbatim in tasks.md. Nothing here is doing anything clever - it is a list of the
# commands you would otherwise be retyping.

PY ?= python
PROMPTFOO ?= npx promptfoo
RESULTS ?= eval-results.json
Q ?= how long do we have to submit dispute evidence?

.DEFAULT_GOAL := help
.PHONY: help setup validate ingest stats search ask trace retrieval retrieval-gate eval gate smoke test clean

help:
	@echo "setup           install python deps"
	@echo "validate        check the golden set against the corpus (run this after editing either)"
	@echo "ingest          chunk, embed, and index data/corpus into .data/index.sqlite3"
	@echo "stats           show what is currently indexed"
	@echo "search Q=\"...\"  retrieval only, no generation"
	@echo "ask Q=\"...\"     full agentic loop, prints the answer"
	@echo "trace Q=\"...\"   full agentic loop, prints the whole trace as JSON"
	@echo "retrieval       recall@5 / strict@5 / mrr over the golden set - free, no API key"
	@echo "retrieval-gate  same, but exits non-zero below the recall threshold"
	@echo "eval            full promptfoo suite - COSTS MONEY, see README"
	@echo "gate            eval + enforce the aggregate release gate"
	@echo "smoke           cheapest useful check: validate + ingest + retrieval"
	@echo "test            run your edge-case tests"
	@echo "clean           delete the index and eval output"

setup:
	$(PY) -m pip install -r starter/requirements.txt

validate:
	$(PY) starter/golden_tests.py

ingest:
	$(PY) starter/pipeline.py ingest

stats:
	$(PY) starter/pipeline.py stats

search:
	$(PY) starter/pipeline.py search "$(Q)"

ask:
	$(PY) starter/pipeline.py ask "$(Q)"

trace:
	$(PY) starter/pipeline.py trace "$(Q)"

retrieval:
	$(PY) starter/eval_retrieval.py

retrieval-gate:
	$(PY) starter/eval_retrieval.py --gate

# Costs money. Every question runs the full loop and is judged twice.
eval:
	$(PROMPTFOO) eval -c promptfooconfig.yaml -o $(RESULTS)

# The release gate. promptfoo may exit non-zero when individual queries fail their
# per-query floors; that is expected and is not the release decision, so we let the
# run finish and let check_gate.py make the call on the aggregates.
gate:
	-$(PROMPTFOO) eval -c promptfooconfig.yaml -o $(RESULTS)
	$(PY) starter/check_gate.py $(RESULTS)

smoke: validate ingest retrieval

test:
	$(PY) -m pytest -q

clean:
	$(PY) -c "import shutil, pathlib; shutil.rmtree(pathlib.Path('.data'), ignore_errors=True); [p.unlink() for p in [pathlib.Path('$(RESULTS)')] if p.exists()]"
	@echo "removed .data/ and $(RESULTS)"
