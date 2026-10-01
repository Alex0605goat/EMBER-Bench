# Leaderboard protocol and review

## Paper snapshot

The initial leaderboard transcribes **Table 2** of *EMBER-Bench: Benchmarking Cross-Event Causal Memory in Long-Horizon Embodied Tasks*, the ICLR 2027 submission manuscript. It contains 16 model rows and the mean of two human evaluators. All scores are accuracy percentages rounded to one decimal place as reported in the manuscript.

- **Overall:** micro accuracy across all 699 questions.
- **P:** next-action prediction, 548 questions across L1-L4.
- **C:** causal traceback, 151 questions across L2-L4.
- **Human:** reference only, excluded from model ranking.
- **Chance:** 25% for four-option multiple choice, not an evaluated model.

Subset sizes: P = L1 205, L2 113, L3 128, L4 102; C = L2 58, L3 60, L4 33. Verify these counts against the manuscript when revising the protocol. Sorting changes the displayed model order; the active score column determines model rank. Search and source filters limit visible rows and should not change rank over the full model set.

The paper snapshot uses the manuscript's frozen video-history setting. The provided unified runner preserves the benchmark task formulation but changes some historical model settings. New evaluations must disclose their protocol and should be reviewed separately from the frozen table.

## Submit a result for review

The full public dataset release is pending. You can run the offline synthetic smoke test to verify the toolchain; synthetic scores are not benchmark results. A scored benchmark submission requires the actual released catalog and media.

When the dataset is available, run the evaluator using the documented main condition and keep the manifest, per-item JSONL, and summary. Use the export command documented in [evaluation](../evaluation/README.md) to create a candidate result. Open a pull request containing that candidate and a short description with:

1. Exact model/version or deployment identifier and model availability/source class.
2. Dataset catalog checksum, item counts, input condition, and runner commit.
3. Prompt/media sampling settings, token limits, and provider-specific overrides.
4. Invalid-answer counts, retries, and any exclusions; unanswered items count as incorrect.
5. Evidence needed to reproduce the aggregate scores, with API keys and private media omitted.

Maintainers must check provenance, denominator completeness, duplicate question IDs, the expected 699-question main split, P/C and per-level scores, and any protocol differences. Candidate exports are **review required** and do not update the website automatically.

For a new protocol, add a clearly named and documented results section rather than mixing it into the paper table. A partial run, demo fixture, privileged cause-and-consequence ablation, or current-frame-only condition cannot be labeled a main leaderboard result.

## Edit the paper data

Edit `docs/data/leaderboard.json`, run `python scripts/sync_leaderboard.py` to regenerate CSV and the static HTML fallback, then run `python scripts/validate_site.py`. Include the supporting source in the pull request. The validator pins the reviewed Table 2 snapshot; deliberate paper corrections also require updating its verified fingerprint. The CSV download must contain the same underlying numbers shown in the table.
