# Contributing

Open reproducible bug reports and pull requests at [Alex0605goat/EMBER-Bench](https://github.com/Alex0605goat/EMBER-Bench). Include the Python version, condition, schema example, observed behavior, and a small redacted diagnostic. Do not include API keys, `.env` files, provider authorization headers, or private benchmark assets.

```bash
cd evaluation
python -m pip install -r requirements-dev.txt
python -m pytest tests -q
```

The same tests can run without pytest using `python -m unittest discover -s tests -v`. They include actual offline HTTP/SSE and FFmpeg integration. `python scripts/smoke.py --out runs/my-new-smoke` gives an inspectable synthetic output; use a fresh directory.

For protocol changes, add behavior tests for the affected input/selection/retry rule and document the difference from frozen paper results. Keep catalogs as data, keys in environment variables, and safe local model IDs separate from wire deployment names. Add an explicit registry entry or custom registry rather than changing prompts by model ID.

Do not silently merge synthetic, incomplete, current-frame, ablation, or unified-runner scores into frozen Table 2. Export candidates for the repository's human [leaderboard review process](../docs/LEADERBOARD.md). By contributing evaluation code, you agree to the package's [MIT license](LICENSE).
