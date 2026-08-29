---
name: ai-architect-course
description: Authoring conventions and hard constraints for content/ai-architect.json (Advanced 12-module senior track), including the two hard rules and the quiz-balance trap
metadata:
  type: project
---

`ai-architect` ("AI Architect", Advanced, 12 modules / 4 blocks) is authored block-by-block
by concurrent agents against a shared brief, each writing a standalone fragment JSON that is
merged into `content/ai-architect.json` later. Agents must NOT write the course file directly.

**Why:** Multiple agents author blocks in parallel; the course's whole value proposition is
non-overlap with the existing 21-module `ai-eng` course, which is easy to violate accidentally.

**How to apply:**

- **Two hard rules.** (1) No module may *introduce* a component - only size, place, budget,
  sequence or authorize one; component references get one clause, never a concept entry.
  (2) Every `PATTERNS.code` is a stdlib-only calculator/simulator/register/linter - pure
  Python, deterministic, no SDK, no network, no `client.messages.create()`, runs clean under
  bare `python file.py`.
- **No hardcoded prices** outside the one dated table in the `budgets` module. Everything else
  takes prices as input parameters and states ratios/formulas.
- **Glossary exclusion list** (~46 ai-eng terms) is binding; also watch for *idiom* collisions
  that a term list misses - "one-way door / two-way door" belongs to ai-eng's `lead` module, so
  use reversible/irreversible + autonomy tiers instead.
- **Quiz balance is a hard gate.** `content/validate-quizzes.mjs` already lists `ai-architect`.
  Architecture answers run long, so write all four options as parallel equal-length decision
  statements (~10 chars of each other), put reasoning in `exp`, and deliberately vary which
  option is longest. Target: correct-is-longest in under ~40% of a module's questions.
- **Genre shifts from ai-eng:** CARDS are decision-prompts-with-numbers (not definitions);
  SCENARIOS are *decisions* (nothing on fire) rather than incidents, one per block in
  design-review mode; every `DEEP.worked` must contain executed arithmetic.
- **Word budget.** Roughly 4,000-4,800 authored prose words per module *excluding*
  `PATTERNS.code`; the code adds another 1,000-1,600 word-equivalents on top.

Related: [[course-content-schema]]
