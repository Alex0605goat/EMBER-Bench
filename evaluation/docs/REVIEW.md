# Evaluation release review — 2026-10-02

The supplied evaluator was copied into `evaluation/`; the original source directory/archive was preserved. This review covers code behavior and package documentation. It does not claim a rerun of the paper's 16 models or verification of the unreleased full dataset.

## Corrections

- Replaced arbitrary `eval(options)` with safe legacy-literal parsing and exact four-string validation.
- Validated catalog fields, selected local media and hashes, duplicate IDs, subset IDs, model output names, and transport URLs before requests.
- Removed action-log leakage from CoT. Main C prompts exclude textual candidate-interval annotations.
- Rejected ambiguous `Final Answer: [A/B/C/D]`, `[A, B]`, and `A or B` responses instead of incorrectly accepting A.
- Replaced the incorrect all-L2–L4 ablation default (343 P items) with an explicit matched-P list/flag (the paper uses 151 pairs).
- Bound resume/summarization to stable catalog/subset/config/code/condition/endpoint identities; checked journals against prompts and response validity.
- Made authentication/quota failures resumable after credentials are fixed; distinguished complete retries from partial/never-attempted questions.
- Corrected analysis to read the actual flat summary schema; validated candidate artifact hashes and recomputed scores.
- Used direct Gemini/OpenAI defaults rather than sending credentials to the original third-party gateways. Preserved configurable wire adapters and deployment overrides.
- Removed placeholder passing badges, setup-only tests, private server paths, incorrect output trees/key names, placeholder contact information, and acceptance-style citation language.

## Local verification

The tests exercise safe input parsing, answer ambiguity, CoT annotation isolation, matched-subset selection, media integrity, first-valid-answer scoring, unanswered denominators, stale/mixed journal rejection, resumable authorization failures, completion flags, export integrity, and recursive credential redaction.

The integration test generates tiny real media and uses loopback HTTP/SSE to exercise all three transport adapters. Across three mock models, 15 requests cover a 5→3 FPS fallback, followed by resume and summarize with zero extra requests. All candidates are marked synthetic and review-required. A purposely wrong answer demonstrates that first-valid selection does not retry for correctness.

Commands:

```bash
python -m unittest discover -s tests -v
python scripts/smoke.py --out runs/release-review
```

The release was checked on Python 3.12 with Requests 2.32.5 and imageio-ffmpeg 0.6.0. Test output is the source of truth for pass counts; the package does not display an unverified passing badge.

## Limits

No paid remote request was made. The full catalog/media, original pairing manifest, and frozen provider journals were not available in this package. Prepared-video temporal boundaries, action-log leakage, annotation correctness, provider availability, and actual research scores require those assets and independent review. Exported hashes prove consistency among local artifacts, not authenticity or provider execution. The unified runner deliberately remains distinct from the frozen paper leaderboard.
