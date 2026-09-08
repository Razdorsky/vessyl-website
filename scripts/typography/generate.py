#!/usr/bin/env python3
"""Regenerate fixed Telugu MN heading artwork on macOS; normal builds use existing SVGs."""
from pathlib import Path
import argparse
import json
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--regular', type=Path, required=True)
parser.add_argument('--bold', type=Path, required=True)
parser.add_argument('--mobile-only', action='store_true', help='Regenerate flowing Classic mobile headings only')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
manifest_path = root / 'lib/typography-art.json'
manifest = json.loads(manifest_path.read_text())
sizes = {
    'desktop': {'h1': (96, 1100), 'h2': (60, 760), 'h3': (36, 400), 'quote': (42, 1050)},
    'mobile': {'h1': (44, 340), 'h2': (36, 340), 'h3': (28, 340), 'quote': (29, 340)},
}
jobs = []
for entry in manifest.values():
    for device, styles in sizes.items():
        if args.mobile_only:
            continue
        size, width = styles[entry['style']]
        size = entry.get('layout', {}).get(device, {}).get('size', size)
        width = entry.get('layout', {}).get(device, {}).get('width', width)
        jobs.append(dict(text=entry.get('layout', {}).get(device, {}).get('text', entry['text']), weight=entry.get('weight', 700 if entry['style'] == 'h1' else 400),
                         size=size, width=width, file=entry[device], align=entry.get('align', 'left')))
    for variant in entry.get('responsive', {}).values():
        if args.mobile_only:
            continue
        jobs.append(dict(text=entry['text'], weight=entry.get('weight', 400),
                         size=variant['size'], width=variant['width'], file=variant['file'],
                         align=entry.get('align', 'left'), preventWordSplit=True))
with tempfile.TemporaryDirectory(prefix='vessyl-type-') as temporary:
    job_path = Path(temporary) / 'jobs.json'
    job_path.write_text(json.dumps(jobs))
    result = subprocess.run(['swift', str(Path(__file__).with_name('outline.swift')),
                             str(job_path), str(root / 'public/typography'),
                             str(args.regular.resolve()), str(args.bold.resolve())],
                            check=True, capture_output=True, text=True)
    dimensions = {v['file']: v for v in json.loads(result.stdout)}
    flow_jobs = [dict(text=entry['text'], size=(entry.get('layout', {}).get('mobile', {}).get('size', 40) - 1 if entry['style'] == 'h1'
                                            else entry.get('responsive', {}).get('small', {}).get('size', sizes['mobile'][entry['style']][0])),
                      weight=entry.get('weight', 700 if entry['style'] == 'h1' else 400), file=f'{key}-flow.svg')
                 for key, entry in manifest.items()
                 if entry['style'] in ('h2', 'h3') or (entry['style'] == 'h1' and entry.get('weight') == 700)]
    job_path.write_text(json.dumps(flow_jobs))
    flow_result = subprocess.run(['swift', str(Path(__file__).with_name('mobile-flow.swift')),
                                  str(job_path), str(root / 'public/typography'),
                                  str(args.regular.resolve()), str(args.bold.resolve())],
                                 check=True, capture_output=True, text=True)
    flows = {v['file']: v for v in json.loads(flow_result.stdout)}
for key, entry in manifest.items():
    for device in sizes:
        if entry[device] not in dimensions:
            continue
        entry[device + 'Width'] = dimensions[entry[device]]['width']
        entry[device + 'Height'] = dimensions[entry[device]]['height']
    for variant in entry.get('responsive', {}).values():
        if variant['file'] not in dimensions:
            continue
        variant['width'] = dimensions[variant['file']]['width']
        variant['height'] = dimensions[variant['file']]['height']
    if f'{key}-flow.svg' in flows:
        entry['mobileFlow'] = flows[f'{key}-flow.svg']
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Regenerated {len(jobs)} renderings and {len(flows)} flowing mobile headings; no font binaries copied.')
