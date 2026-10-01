# Initial release review

Reviewed on **2026-10-02** before uploading the website and evaluation package to the aligned GitHub account, **Alex0605goat**.

## Paper and leaderboard

The paper is 26 pages. Its SHA-256 is `443f0b84a1af5f5e6c3fb94046bf866ad77926a2140d82a7d750cb7bf3ee1b1b`.

An independent paper audit visually checked the rendered Table 2 and checked the transcription against the extracted table. All **17 rows × 10 scores = 170 values** match the manuscript. The human mean is a separate reference, excluded from ranking. The complete JSON, CSV, and no-JavaScript HTML fallback agree exactly.

Verified counts: 189 tasks, 699 questions, 548 P questions, 151 C questions, and 151 matched pairs. Per-level P/C counts are documented in the leaderboard guide. The stale action-log gain of 1.7pp in the previous README was corrected to the final manuscript's **1.6pp**; the additional privileged-annotation gain is **13.0pp**. The Gemini 3.1 Pro **Preview** label now matches Table 2.

The paper's anonymous review URL states that review data and code are available. Its live contents could not be verified in this review. The public repository's complete dataset release remains **pending**; the website does not provide an invented dataset download or license.

## Website validation

- Original memory-field SVG illustration, event/state/action layout, and keyboard-accessible prediction/traceback explanation.
- Real browser rendering at 1440px desktop and 390px mobile widths; no page overflow, broken images, script errors, or HTTP resource errors.
- Local resource links checked under a project subpath; GitHub links align to `Alex0605goat/EMBER-Bench`.
- Search and empty state; 7 closed-source / 9 open-source filters; all ten score columns in both sort directions; global ranks and ties with an unranked human reference.
- Downloaded CSV checked against all 170 values; no-JavaScript table checked against the same values.
- Keyboard tabs, mobile menu/Escape handling, and reduced-motion behavior exercised.
- Dependency-free `scripts/validate_site.py` checks the paper snapshot, unpublished paper exclusion, public ownership configuration, and all local HTML links. `scripts/sync_leaderboard.py` regenerates CSV and static table from reviewed JSON.

The user subsequently supplied three original figure PDFs: `benchmark_overview_film.pdf`, `benchmark_diversity.pdf`, and `section4_analysis.pdf`. The website uses full-page, 3200px-wide PNG renders with the original aspect ratios, colors, labels, and content. Each figure links to its unmodified source PDF. Byte identity against the supplied files was verified; checksums and render dimensions are recorded in `docs/assets/figures/originals.json` and checked during CI. The overview, dataset coverage, and analysis sections use these original figures. The analysis caption distinguishes diagnostic paired-subset ablations from the main 699-question leaderboard.

## Evaluation review

The supplied evaluation package was audited and corrected. Material changes include:

- Replace arbitrary `eval` option parsing with safe parsing and strict four-option validation.
- Validate catalog IDs, split labels, media paths/hashes, and required condition inputs before API calls.
- Require an explicit matched P subset for paired experiments; 343 deep-level P items cannot stand in for the 151 paired items.
- Keep action logs and privileged annotations out of the CoT condition.
- Reject ambiguous multi-answer/template echoes and conflicting answer markers.
- Bind resume to catalog/subset/configuration/code/prompt/condition/endpoint identity, detect altered logs, and keep the first valid answer regardless of correctness.
- Recompute scoring from predictions; preserve unanswered items in denominators and use `null` for empty splits.
- Mark incomplete/quota-interrupted runs and export candidates as review required instead of publishing them automatically.
- Use direct provider endpoints by default for Gemini/OpenAI; custom gateways require explicit configuration.

**27 offline behavior tests passed**, including image-format MIME handling, real FFmpeg media processing, and a complete loopback smoke run through chat, Gemini, and streamed Responses transports. The smoke exercises 5→3 FPS fallback, scoring, resume, summaries, and candidate exports. It uses synthetic media and mock answers, requires no API key, and makes no paid requests.

Validation commands:

```bash
python scripts/validate_site.py
cd evaluation
python -m pytest tests -q
python scripts/smoke.py --out runs/synthetic-smoke
```

Use a fresh output directory for the smoke command. See the evaluation package's detailed review notes and catalog documentation for input boundaries.

## Light presentation and paper withdrawal

Both pages now use a spacious white presentation, graphite system sans-serif type, warm amber accents, and the continuous EMBER-Bench wordmark with a geometric flame icon. Real browser checks at 320, 390, 768, 1024, and 1440px verify that every visible button has at least a 16px label and a 44px target, with no page overflow, missing images, or script errors. Search, class filters, all score sorts, CSV export, keyboard tabs, mobile navigation, and the no-JavaScript table still pass.

The conceptual memory scene adds three signal paths, orbit layers, node activation, central echoes, and gentle pointer depth. Browser checks verify actual motion, reduced-motion reset and freeze, offscreen pause and resume, repeated back/forward-cache lifecycle, and terminal cleanup. Scientific figures and all 170 reported scores remain unchanged.

Conference submission and review-status promotion has been removed from public text. The unpublished paper PDF and its download links have been removed from the current release; no replacement preprint URL is advertised. Only the three user-approved original figure PDFs are allowed in the deployed site. The validator and ignore rule prevent reintroducing a paper PDF into the Pages assets.

## Practical limits

The complete real dataset/media, frozen paired-ID lists, and historical provider artifacts are not included. This review verifies an executable **unified runner**, not an exact reproduction or independent validation of the paper's 16-model scores. Live provider availability and deployment IDs were not tested. Media-prefix boundaries, option overlays, face blurring, and annotation leakage require review of the actual released inputs; hashes alone cannot establish those properties.

The code, website, documentation, and candidate-review process are ready for release with these boundaries stated. GitHub Actions performs the same website and offline test checks; Pages publishes only the `docs/` directory.
