# Release review

This checklist records the scope of the initial website and evaluation-code release. Detailed local test evidence is kept in `REVIEW.md` at repository root.

- [x] Compare all 170 score values in Table 2 against the paper, including the human row.
- [x] Keep website and repository copy free of conference submission and review-status promotion.
- [x] Keep the unpublished paper PDF, download links, and premature citation out of the public site.
- [x] Identify privileged annotation ablations and distinguish them from main results.
- [x] State the public dataset release status accurately; do not invent download links.
- [x] Run offline evaluation tests and synthetic transport smoke tests without paid APIs.
- [x] Check catalog parsing, resume provenance, answer parsing, and missing-answer denominators.
- [x] Check repository for credentials, private file paths, caches, and generated run artifacts.
- [x] Validate site links, data, project-path hosting, and CSV export.
- [x] Inspect desktop/mobile screenshots, sorting, filters, keyboard focus, and reduced motion.
- [x] Confirm repository owner and Pages deployment permissions.

Limitations: the released catalog and complete media are needed for an actual benchmark run. Offline tests validate the runner implementation and transport contracts; they do not reproduce or independently verify the manuscript's model results. Live provider availability is outside the offline test scope.
