#!/usr/bin/env python3
"""Check exported copy against the source-linked production dictionary, not a second authored draft."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re,os,sys
root=Path(__file__).resolve().parents[1]
base=os.environ.get('NEXT_PUBLIC_BASE_PATH','').strip('/')
output=root/'dist/client'/base
entries=json.loads((root/'lib/approved-copy.json').read_text())
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.root=Node();self.stack=[self.root]
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in ['img','input','br','hr','meta','link','source','area','wbr','embed']:self.stack.append(n)
  if t=='br':n.children.append(' ')
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].children.append(s)
def norm(t):return re.sub(r'\s+',' ',t).strip()
def lowercase_start(t):
 # Standalone copy must start with a capital; contact addresses and URLs retain their spelling.
 if re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',t) or re.match(r'^(?:https?://|www\.)',t):return False
 return bool(re.match(r'^[\s\"\'“‘(]*[a-z]',t))
spanish=json.loads((root/'lib/locales/es-LA.json').read_text())
known={norm(x['text']):x for x in entries.values()}
# Factual destinations and operational structure, not marketing prose.
operational={'EN','ES','©','Vessyl','AKEN','AKEN Soul','Quantum','Wellness','All sessions','guestservices@thevessyl.com','reservations@akenhotels.com','+506 8608 0022','12 s ·','Sound off','Play film','Pause film','Page not found','Overview','Close','Vessyl navigation','Choose a page to explore.'}
ignored={'script','style','svg','template','noscript','head'}
semantic={'h1','h2','h3','h4','p','blockquote','a','button','summary','li','label','dt','dd','figcaption','span','small'}
def units(n):
 if n.tag in ignored or n.attrs.get('aria-hidden')=='true':return []
 if n.tag in semantic and not any(isinstance(c,Node) and c.tag in {'p','h1','h2','h3','li','a','button','div'} for c in n.children):
  return [norm(n.text())] if norm(n.text()) else []
 return sum((units(c) if isinstance(c,Node) else ([norm(c)] if norm(c) else []) for c in n.children),[])
def allnodes(n):
 yield n
 for c in n.children:
  if isinstance(c,Node):yield from allnodes(c)
def classify(t):
 if t in known:return known[t]['kind'],known[t]['source']
 if t in operational or re.fullmatch(r'[\d\s/·©]+',t):return 'functional-ui','interface-behavior'
 if t.startswith('© ') and re.fullmatch(r'© \d{4} Vessyl',t):return 'functional-ui','interface-behavior'
 # Card controls and media captions can concatenate their inner semantic labels.
 remaining=t
 for k in sorted(set(known)|operational,key=len,reverse=True):remaining=remaining.replace(k,'')
 if not re.sub(r'[\d\s/·©]+','',remaining):return 'composed-approved-labels','multiple documented entries'
 return 'UNSOURCED',None
errors=[];report={};main={}
for copy_key,entry in entries.items():
 if lowercase_start(entry['text']):errors.append('Lowercase copy start: '+copy_key+': '+entry['text'])
 if entry.get('kind')=='capitalization-corrected' and entry['text'].lower()!=entry.get('sourceText','').lower():
  errors.append('Capitalization edit changed wording: '+copy_key)
for edition in ['classic','immersive']:
 for f in sorted((output/edition).glob('**/index.html')):
  slug=str(f.parent.relative_to(output/edition));key=edition+'/'+('home' if slug=='.' else slug)
  localized='es-LA' in f.relative_to(output).parts
  known={norm(spanish[k] if localized else v['text']):v for k,v in entries.items()}
  p=Parser();p.feed(f.read_text());rows=[]
  for t in units(p.root):
   kind,source=classify(t);rows.append({'text':t,'kind':kind,'source':source})
   if kind=='UNSOURCED':errors.append(key+': '+t)
   if lowercase_start(t):errors.append('Lowercase rendered copy: '+key+': '+t)
  for n in allnodes(p.root):
   if 'brand-heading' in n.attrs.get('class','').split() and not any(x.tag=='picture' for x in allnodes(n)):
    errors.append('Missing Telugu artwork: '+key+': '+n.attrs.get('data-heading',''))
  report[key]=rows
  content=next(n for n in allnodes(p.root) if n.attrs.get('id')=='content')
  main[key]=[t for t in units(content) if t not in {'Loading','Interactive interpretation','Play','Pause'}]
# Founder has its own editorial copy. Shared navigation, names, attribution and
# short action labels remain consistent; prose and complete sentences must not
# be reused from another Classic page, even inside a longer paragraph.
def prose_sentences(text):
 return [norm(s).casefold() for s in re.split(r'(?<=[.!?])\s+',text)
         if len(re.findall(r"\b[\w']+\b",s))>=8
         # The Nature gallery repeats the activity's approved name. Its Spanish
         # title exceeds eight words; it is still a caption, not repeated prose.
         and norm(s) not in {entries['natureWalk']['text'],spanish['natureWalk']}]
founder_duplicates=[]
for locale_prefix in ['', 'es-LA/']:
 founder_page='classic/'+locale_prefix+'founder'
 for text in main.get(founder_page,[]):
  for sentence in prose_sentences(text):
   for page,texts in main.items():
    if not page.startswith('classic/') or page==founder_page or ('/es-LA/' in page)!=bool(locale_prefix):continue
    if any(sentence in norm(other).casefold() for other in texts):
     founder_duplicates.append({'page':page,'sentence':sentence})
     errors.append('Founder editorial copy repeats '+page+': '+sentence)
uniqueness_path=root/'docs/compliance/founder-uniqueness.json'
uniqueness_path.parent.mkdir(parents=True,exist_ok=True)
uniqueness_path.write_text(json.dumps({
 'scope':'Founder editorial sentences of at least eight words versus every other Classic page; shared navigation, names and short UI labels excluded.',
 'duplicates':founder_duplicates,
},ensure_ascii=False,indent=2)+'\n')
# Repeated functional labels stay consistent; complete editorial sentences must
# not repeat within a Classic page. Dialog disclosure is checked separately in UI QA.
classic_duplicates={}
for page,texts in main.items():
 if not page.startswith('classic/'):continue
 duplicates={t:n for t,n in Counter(sentence for t in texts
  for sentence in prose_sentences(t)).items() if n>1}
 if duplicates:classic_duplicates[page]=duplicates
 for text,count in duplicates.items():errors.append(f'{page} editorial sentence repeats {count} times: '+text)
(root/'docs/compliance/classic-uniqueness.json').write_text(json.dumps(classic_duplicates,ensure_ascii=False,indent=2)+'\n')
# Immersive must receive the same editorial cleanup, with no scene-control chrome.
immersive_duplicates={}
for page,texts in main.items():
 if not page.startswith('immersive/'):continue
 duplicates={t:n for t,n in Counter(sentence for t in texts for sentence in prose_sentences(t)).items() if n>1}
 if duplicates:immersive_duplicates[page]=duplicates
 for text,count in duplicates.items():errors.append(f'{page} editorial sentence repeats {count} times: '+text)
 for forbidden in ['Play', 'Pause', 'Scroll to enter', 'Interactive interpretation']:
  if any(row['text']==forbidden for row in report[page]):errors.append(page+': extraneous control '+forbidden)
for text in main.get('immersive/founder',[]):
 for sentence in prose_sentences(text):
  for page,texts in main.items():
   if page.startswith('immersive/') and page!='immersive/founder' and any(sentence in norm(other).casefold() for other in texts):
    errors.append('Immersive Founder editorial copy repeats '+page+': '+sentence)
(root/'docs/compliance/immersive-uniqueness.json').write_text(json.dumps(immersive_duplicates,ensure_ascii=False,indent=2)+'\n')
# Every selected container-aware display variant must exist with usable dimensions.
art=json.loads((root/'lib/typography-art.json').read_text())
for key,entry in art.items():
 for variant in entry.get('responsive',{}).values():
  path=root/'public/typography'/variant['file']
  if not path.is_file() or variant['width']<=0 or variant['height']<=0:
   errors.append('Invalid responsive heading artwork: '+key)
# The user requested separate compositions: wording stays source-linked, sequence may differ.
# Guard against accidentally routing Immersive back to the Classic layout.
for f in (output/'immersive').glob('**/index.html'):
 if 'data-renderer="independent-scroll-world"' not in f.read_text():errors.append('Missing independent immersive renderer: '+str(f))
for f in (output/'classic').glob('**/index.html'):
 if 'data-renderer="independent-scroll-world"' in f.read_text():errors.append('Immersive renderer leaked into Classic: '+str(f))
report_path=root/'docs/compliance/copy-coverage.json'
report_path.parent.mkdir(parents=True,exist_ok=True)
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(report)} routes; every rendered text unit is source-linked copy or documented interface behavior; all display headings have Telugu MN artwork; independent edition renderers verified.')
print('PASS: Founder editorial sentences do not repeat another Classic page.')
print('PASS: No repeated editorial sentences within any Classic page; responsive artwork references verified.')

print('PASS: No repeated Immersive editorial sentences, unique Founder copy, and no scene-control labels.')
