#!/usr/bin/env python3
"""Generate small artificial media and a four-question transport fixture."""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ember_eval import ffmpeg, sha


def make_fixture(destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    frame, history = destination / 'current.jpg', destination / 'history.mp4'
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=0x1a2634:s=96x64:r=5:d=1',
            '-frames:v', '1', '-update', '1', str(frame)])
    ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=s=96x64:r=5:d=1', '-an',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(history)])
    rows = []
    for index, (qa_type, level, gold) in enumerate((('NA', 'L1', 'A'), ('NA', 'L2', 'B'),
                                                  ('CB', 'L2', 'A'), ('NA', 'L3', 'D')), 1):
        row = dict(question_id=f'synthetic_{index}', objective=f'SYNTHETIC_SCENARIO_{index}: fixture only.',
                   qa_type=qa_type, level=level, gold=gold, current_frame='current.jpg',
                   history_video='history.mp4', current_sha256=sha(frame), history_sha256=sha(history),
                   m3_text='Completed subtask: moved a synthetic object.', incidents=[],
                   is_paired=index == 2)
        if qa_type == 'NA':
            row['options'] = ['Synthetic action A', 'Synthetic action B', 'Synthetic action C', 'Synthetic action D']
        else:
            row['known_action'] = 'Synthetic corrective action'
        rows.append(row)
    (destination / 'catalog.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
    return destination / 'catalog.json'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True)
    print(make_fixture(parser.parse_args().out))
