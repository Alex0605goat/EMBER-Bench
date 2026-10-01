# Synthetic fixture

`catalog.json`, `current.jpg`, and `history.mp4` are generated artificial fixtures, not EMBER-Bench data. The four toy questions exercise schema, media hashing, transport packaging, retry, and scoring. The video is a one-second test pattern and the image a solid color. The CB fixture has no meaningful benchmark incident or candidate labels; no visual/causal benchmark validity is implied.

The offline server in `scripts/smoke.py` deliberately answers one question incorrectly and initially returns an invalid format for another. The resulting 75% mock score is arbitrary and never enters the website leaderboard. Smoke-generated model configurations mark `_synthetic: true`, and exports preserve `synthetic: true`.

To regenerate an equivalent fixture (hashes may vary with FFmpeg build):

```bash
python scripts/make_synthetic_fixture.py --out fixtures/synthetic
```

To run the full offline pipeline against newly generated fixtures:

```bash
python scripts/smoke.py --out runs/new-synthetic-session
```

The synthetic catalog is an input-schema example only. Use a fresh smoke output directory.
