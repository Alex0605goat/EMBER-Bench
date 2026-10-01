# Website development and GitHub Pages

The website is plain HTML, CSS, JavaScript, SVG, and JSON. It requires no build step, account, or API key. Both pages work under a GitHub Pages project path.

## Preview locally

From the repository root:

```bash
python -m http.server 8000 --directory docs
```

Open `http://localhost:8000/` for the homepage and `http://localhost:8000/leaderboard.html` for the leaderboard. Serve the files over HTTP so the browser can load local JSON.

## Edit content

- `docs/index.html`: benchmark narrative and figures.
- `docs/leaderboard.html`: leaderboard layout and table fallback.
- `docs/assets/`: styles, interaction scripts, illustrations, and the submission manuscript.
- `docs/data/site.json`: repository ownership and repository links.
- `docs/data/leaderboard.json`: paper results. Check the file's provenance metadata and score field names before editing.

After a reviewed data edit, run `python scripts/sync_leaderboard.py` to regenerate the CSV and static HTML fallback from the JSON. `validate_site.py` pins the verified paper-table and manuscript fingerprints; an intentional correction or new manuscript revision also requires an evidence-backed fingerprint update. New protocols belong in a separately labeled results section.

The Table 2 paper snapshot is a separate protocol from new unified-runner evaluations. Do not replace paper numbers with a rerun or a synthetic test output. See [leaderboard review](LEADERBOARD.md).

## Publish with GitHub Pages

1. Push the reviewed repository to `Alex0605goat/EMBER-Bench`.
2. In **Settings > Pages > Build and deployment**, select **GitHub Actions**.
3. Run the **Publish benchmark website** workflow, or push a change under `docs/` to `main`.
4. Check the deployment job and open its reported URL. The expected project URL is `https://Alex0605goat.github.io/EMBER-Bench/`.

Only `docs/` is uploaded as the Pages artifact. Evaluation source is accessible through repository links. The workflow validates local links and paper data before publishing.

## Move to another owner

Edit the `owner` and `repository` values in `docs/data/site.json`, update repository and Pages links in the root README, and update the remote with `git remote set-url origin https://github.com/OWNER/EMBER-Bench.git`. Relative page and asset URLs do not need changing. Repository transfer or account renaming is a separate GitHub account operation.

## Validation

```bash
python scripts/validate_site.py
cd evaluation
python -m pytest tests -q
```

Before release, inspect both pages at desktop and mobile widths. Exercise search, source filtering, score sorting, CSV export, keyboard focus, and reduced motion. Confirm the human reference is excluded from model rank and missing data never displays as zero.

Design references: [SWE-bench](https://www.swebench.com/), [MMMU](https://mmmu-benchmark.github.io/), and [LongVideoBench](https://longvideobench.github.io/) informed the resource navigation, benchmark explanation, and results structure. Styling and memory illustrations are original to this site.
