#!/usr/bin/env python3
"""Validate locale completeness, factual numbers and exported language navigation."""
import json
import os
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = json.loads((root / 'lib/approved-copy.json').read_text())
target = json.loads((root / 'lib/locales/es-LA.json').read_text())
errors = []
if source.keys() != target.keys():
    errors.append('Translation dictionary keys differ from the approved source.')

def numbers(text):
    return re.findall(r'\d+(?:\.\d+)?', text.replace(',', '.'))

for key, text in target.items():
    if not text.strip() or text != unicodedata.normalize('NFC', text):
        errors.append(f'{key}: empty or non-normalized translation.')
    if key in source and numbers(text) != numbers(source[key]['text']):
        errors.append(f'{key}: factual numeric values changed.')
    if re.search(r'\b(tú|vos|vosotros|vuestro|vuestra|tus|eres|puedes|descubre|únete)\b', text, re.I):
        errors.append(f'{key}: unexpected informal address.')

photos = json.loads((root / 'lib/classic-photography.json').read_text())
image_source = set(json.loads((root / 'lib/image-alts.json').read_text()).values())
image_target = json.loads((root / 'lib/locales/es-LA-images.json').read_text())

def collect_alts(value):
    if isinstance(value, dict):
        if value.get('alt'):
            image_source.add(value['alt'])
        for child in value.values():
            collect_alts(child)
    elif isinstance(value, list):
        for child in value:
            collect_alts(child)

collect_alts(photos)
if image_source != image_target.keys():
    errors.append('Image alt translation keys differ from the photograph registry.')
if any(not text.strip() for text in image_target.values()):
    errors.append('Empty translated image description.')

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))

output = root / 'dist/client' / os.environ.get('NEXT_PUBLIC_BASE_PATH', '').strip('/')
checked = 0
for edition in ['classic', 'immersive']:
    for file in (output / edition / 'es-LA').glob('**/index.html'):
        checked += 1
        parser = Links()
        parser.feed(file.read_text())
        for link in parser.links:
            href = link.get('href', '')
            if re.search(r'/(classic|immersive)/', href) and not link.get('hreflang') and '/es-LA/' not in href:
                errors.append(f'{file}: navigation leaves the selected language: {href}')
if checked != 34:
    errors.append(f'Expected 34 Spanish edition routes, found {checked}.')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(target)} translated entries, {len(image_target)} image descriptions, numeric facts, usted register and language-preserving links on {checked} Spanish routes.')
