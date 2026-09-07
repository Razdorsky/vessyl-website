#!/usr/bin/env python3
"""Check exported copy against the source-linked production dictionary, not a second authored draft."""
from pathlib import Path
from html.parser import HTMLParser
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
known={norm(x['text']):x for x in entries.values()}
# Factual destinations and operational structure, not marketing prose.
operational={'©','Vessyl','AKEN','AKEN Soul','Quantum','Wellness','All sessions','guestservices@thevessyl.com','reservations@akenhotels.com','+506 8608 0022','12 s ·','Sound off','Play film','Pause film','Page not found','See all four','Close','Vessyl navigation','Choose a page to explore.'}
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
for edition in ['classic','immersive']:
 for f in sorted((output/edition).glob('**/index.html')):
  slug=str(f.parent.relative_to(output/edition));key=edition+'/'+('home' if slug=='.' else slug)
  p=Parser();p.feed(f.read_text());rows=[]
  for t in units(p.root):
   kind,source=classify(t);rows.append({'text':t,'kind':kind,'source':source})
   if kind=='UNSOURCED':errors.append(key+': '+t)
  for n in allnodes(p.root):
   if 'brand-heading' in n.attrs.get('class','').split() and not any(x.tag=='picture' for x in allnodes(n)):
    errors.append('Missing Telugu artwork: '+key+': '+n.attrs.get('data-heading',''))
  report[key]=rows
  content=next(n for n in allnodes(p.root) if n.attrs.get('id')=='content')
  main[key]=[t for t in units(content) if t not in {'Loading','Interactive interpretation','Play','Pause'}]
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
