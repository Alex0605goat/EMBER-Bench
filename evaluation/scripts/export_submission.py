#!/usr/bin/env python3
"""Validate run artifacts and export a clearly marked candidate for human review."""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ember_eval import item_complete, load, sha, write_json


def validate_run(run_dir):
    run_dir = Path(run_dir)
    manifest = json.loads((run_dir / 'manifest.json').read_text(encoding='utf-8'))
    summary = json.loads((run_dir / 'summary.json').read_text(encoding='utf-8'))
    identity = manifest['identity']
    if identity.get('protocol') != 'unified-runner' or summary.get('protocol') != 'unified-runner':
        raise ValueError('this exporter accepts unified-runner results only')
    for name, key in (('manifest.json', 'manifest_sha256'), ('selected.jsonl', 'selected_sha256'),
                      ('attempts.jsonl', 'attempts_sha256')):
        if summary.get(key) != sha(run_dir / name):
            raise ValueError(f'{name} changed since summary; rebuild the summary before export')
    rows = load(run_dir / 'selected.jsonl')
    if not rows or [r.get('question_id') for r in rows] != manifest.get('question_ids'):
        raise ValueError('selected questions/order disagree with run manifest')
    if len(set(r['question_id'] for r in rows)) != len(rows):
        raise ValueError('duplicate selected question ids')
    if len(rows) != manifest.get('n_items') or len(rows) != summary.get('n'):
        raise ValueError('question counts disagree')
    for row in rows:
        if row.get('qa_type') not in ('NA', 'CB') or row.get('level') not in ('L1', 'L2', 'L3', 'L4'):
            raise ValueError('invalid selected task/split')
        if row['qa_type'] == 'CB' and row['level'] == 'L1':
            raise ValueError('CB does not have an L1 split')
        if row.get('gold') not in ('A', 'B', 'C', 'D') or type(row.get('valid')) is not bool:
            raise ValueError('invalid gold/valid fields')
        if row.get('prediction') not in (('A', 'B', 'C', 'D') if row['valid'] else ('',)):
            raise ValueError('prediction and validity disagree')
        if type(row.get('correct')) is not int or row['correct'] != int(row['valid'] and row['prediction'] == row['gold']):
            raise ValueError('correctness must be recomputed from prediction and gold')
    subsets = {'total': rows, 'NA': [r for r in rows if r['qa_type'] == 'NA'],
               'CB': [r for r in rows if r['qa_type'] == 'CB']}
    for task, levels in (('NA', ('L1', 'L2', 'L3', 'L4')), ('CB', ('L2', 'L3', 'L4'))):
        for level in levels:
            subsets[f'{task}_{level}'] = [r for r in subsets[task] if r['level'] == level]
    counts = {key: len(values) for key, values in subsets.items()}
    accuracy = {('overall' if key == 'total' else key + '_all' if key in ('NA', 'CB') else key):
                round(100 * sum(r['correct'] for r in values) / len(values), 1) if values else None
                for key, values in subsets.items()}
    if counts != summary.get('counts'):
        raise ValueError('split counts disagree with selected rows')
    mapping = {'overall': 'overall', 'NA_all': 'P', 'CB_all': 'C',
               **{f'NA_{l}': f'P_{l}' for l in ('L1', 'L2', 'L3', 'L4')},
               **{f'CB_{l}': f'C_{l}' for l in ('L2', 'L3', 'L4')}}
    if any(summary.get(mapping[k]) != v for k, v in accuracy.items()):
        raise ValueError('accuracies disagree with selected rows')
    if sum(not r['valid'] for r in rows) != summary.get('unanswered'):
        raise ValueError('unanswered count disagrees')
    if summary.get('model') != identity.get('model') or summary.get('condition') != identity.get('condition'):
        raise ValueError('summary model/condition disagrees with manifest')
    attempts = load(run_dir / 'attempts.jsonl')
    grouped = {r['question_id']: [] for r in rows}
    for attempt in attempts:
        qid = attempt.get('question_id')
        if qid not in grouped or attempt.get('model') != identity['model'] or attempt.get('condition') != identity['condition']:
            raise ValueError('attempts contain an unexpected model/condition/question')
        grouped[qid].append(attempt)
    ladder = [None] if identity['condition'] == 'V0M0' else manifest['defaults']['fps_ladder']
    incomplete = sum(not item_complete(values, ladder) for values in grouped.values())
    never_attempted = sum(not values for values in grouped.values())
    status = 'incomplete' if incomplete else 'complete'
    if (summary.get('incomplete_questions') != incomplete or summary.get('never_attempted') != never_attempted or
            summary.get('run_status') != status):
        raise ValueError('run completion status disagrees with attempts')
    return dict(schema_version=1, review_status='review-required', protocol='unified-runner',
                model=identity['model'], name=summary['name'], condition=identity['condition'],
                synthetic=identity.get('synthetic', False), catalog_sha256=identity['catalog_sha256'],
                selected_catalog_sha256=identity['selected_catalog_sha256'], counts=counts,
                accuracy=accuracy, unanswered=summary['unanswered'],
                run_status=status, incomplete_questions=incomplete, never_attempted=never_attempted,
                artifacts={k: summary[k] for k in ('manifest_sha256', 'selected_sha256', 'attempts_sha256')},
                run_manifest=manifest,
                note='Candidate only. Hash consistency does not establish dataset authenticity, leakage-free preprocessing, provider execution, or equivalence to paper Table 2.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run-dir', required=True, help='OUT/CONDITION/MODEL directory')
    parser.add_argument('--output', required=True, help='candidate JSON path; never auto-publishes a score')
    args = parser.parse_args()
    try:
        candidate = validate_run(args.run_dir)
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        write_json(args.output, candidate)
    except (ValueError, OSError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    print(f'Validated candidate written to {args.output} (review-required; synthetic={candidate["synthetic"]})')


if __name__ == '__main__':
    main()
