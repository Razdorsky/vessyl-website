#!/usr/bin/env python3
"""Mirror source heading layouts for approved es-LA copy before glyph generation."""
from pathlib import Path
import json, copy
root=Path(__file__).resolve().parents[2]
source=json.loads((root/'lib/approved-copy.json').read_text())
target=json.loads((root/'lib/locales/es-LA.json').read_text())
translations={entry['text']:target[key] for key,entry in source.items()}
p=root/'lib/typography-art.json';manifest=json.loads(p.read_text())
def hash_key(s):
 h=2166136261
 for ch in s: h=((h^ord(ch))*16777619)&0xffffffff
 return format(h,'x')
added=0
for original_id,original in list(manifest.items()):
 if original.get('locale'):continue
 text=translations.get(original['text'])
 if not text or text==original['text']:continue
 prefixes=[original['style']+suffix for suffix in ['', '-center', '-bold','-bold-center','-regular','-regular-center']]
 prefix=next((s for s in prefixes if hash_key(s+'|'+original['text'])==original_id),None)
 assert prefix, (original_id,original['text'])
 localized_id=hash_key(prefix+'|'+text)
 entry=copy.deepcopy(original);entry.update(text=text,locale='es-LA',sourceHeading=original_id)
 entry.pop('mobileFlow',None) # Regenerated from translated words by generate.py.
 for device in ['desktop','mobile']:
  entry[device]=f'{localized_id}-{device}.svg'
  entry.get('layout',{}).get(device,{}).pop('text',None)
 for size,variant in entry.get('responsive',{}).items():variant['file']=f'{localized_id}-{size}.svg'
 manifest[localized_id]=entry;added+=1
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Prepared {added} localized heading layouts.')
