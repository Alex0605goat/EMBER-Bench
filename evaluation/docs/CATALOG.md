# Catalog schema and preprocessing boundaries

`--catalog` accepts a nonempty UTF-8 JSON array. The runner validates question IDs, answer/task fields, optional annotations, selected media existence, and SHA-256 before any provider calls. See [the executable synthetic example](../fixtures/synthetic/catalog.json).

## Required fields

| Field | Type and meaning |
|---|---|
| `question_id` | Unique nonempty string; keep stable across runs |
| `qa_type` | `NA` for next-action prediction (paper P), `CB` for causal traceback (paper C) |
| `level` | `L1`–`L4`; CB permits only `L2`–`L4` |
| `gold` | Exactly `A`, `B`, `C`, or `D` |
| `objective` | Task instruction string; legacy `task_name_zh` is accepted as a fallback |
| `options` | NA only: exactly four nonempty strings ordered A–D; JSON array recommended |
| `known_action` | CB only: nonempty string specifying the provided next action |
| `current_frame` | Local decision-frame image path (JPEG/PNG/WebP/GIF; MIME inferred from bytes; provider support may vary) |
| `current_sha256` | 64-digit SHA-256 of the image |
| `history_video` | Prepared local visual-prefix video path; not needed for `V0M0` |
| `history_sha256` | SHA-256 of that prefix; not needed for `V0M0` |

Legacy `options` strings containing a Python list literal are parsed with `ast.literal_eval`; expressions and code execution are rejected. Missing/duplicate IDs, invalid answer letters, unknown requested question IDs, and an empty filtered subset fail early. The optional `--no-verify-sha` removes hash requirements/checks and is recorded in the run identity; use it only for exploratory inputs, not a verified submission.

Relative media paths resolve against the catalog directory. `--path-map OLD_PREFIX=NEW_PREFIX` applies the first matching mapping at a path-component boundary, not to arbitrary string prefixes. Quote mappings that contain spaces. Remote URLs are not media paths.

## Memory/ablation fields

- `m3_text`: nonempty completed-action log for `V1M3`, `V1M3C`, and `V1M3CC`.
- `incidents`: list of objects for `V1M3C`/`V1M3CC`. An explicit empty list means no annotated incident. Each incident has `subtask` (string or integer) and `action` (string); optional `accident_cause` and `accident_consequence` are rendered only in their designated conditions.
- `is_paired`: explicit boolean `true` on matched P questions, if selecting paired conditions without `--questions`. The flag must come from genuine pairing metadata, not a level-based guess.
- `option_labels`: optional A–D string mapping retained for adapter compatibility. Main `V1M0` C prompts do not render these labels as event descriptions.

For paired studies, prefer a released matched-P ID list passed through `--questions`. The runner validates that IDs exist and selects P questions. It does **not** prove those questions correspond to the original 151 matched pairs. Record the source of the ID list. A supplied full benchmark catalog should contain 548 NA + 151 CB items; that denominator alone cannot identify an authentic dataset.

## Upstream preparation is part of the protocol

This evaluator starts from **prepared prefixes and frames**. It is not a raw-task-video dataset builder. Before generating a catalog, the dataset maintainer must ensure:

1. The prefix spans the beginning of the task through the intended decision boundary, without future footage, and the current image is the designated decision frame.
2. CB candidate intervals are marked with OPTION A–D in the history video, following the benchmark's interval assignment. Main C inputs must not reveal the contents of those intervals through privileged annotation text.
3. The action log includes only completed subtasks before the decision. Basic `V1M3` logs omit anomaly stage, obligation, cause, and consequence. Cause/consequence variants expose only their named fields for completed incidents and do not state the next action.
4. NA options, gold answers, levels, task IDs, and P–C pairing are generated from the authoritative annotation release rather than inferred by the runner.

The runner uniformly resamples the **entire supplied history file** and drops audio. It cannot infer a decision time or trim future frames without original task metadata. Hash equality checks bytes, not whether a file obeys temporal/annotation boundaries. Synthetic clips exercise plumbing and do not validate these semantics.

## Trust boundary

Treat catalogs and response bodies as data. Safe option parsing prevents the original expression-execution risk; no shell command is constructed from media paths. Endpoint configuration is trusted configuration controlling where media and credentials are sent. HTTPS is required for remote endpoints; plain HTTP is allowed only for loopback development. Custom URL destinations and model deployment IDs require the operator's review.

This package does not ship the full dataset, original pairing manifest, or frozen provider journals. Without those assets, it cannot independently verify leakage-free preparation or reproduce the paper's historical model results.
