import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist/client'),
  base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const pages = [
  '',
  'founder',
  'experience',
  'dome',
  'hearth',
  'nature',
  'sessions',
  'quantum',
  'wellness',
  'facilitators',
  'stay',
  'rancho',
  'app',
  'music',
  'press',
  'contact',
  'faq',
];
const errors = [];
let checked = 0;
const targets = new Set();
for (const edition of ['classic', 'immersive'])
  for (const page of pages) {
    const file = path.join(root, base, edition, page, 'index.html');
    let html;
    try {
      html = await readFile(file, 'utf8');
    } catch {
      errors.push('Missing ' + file);
      continue;
    }
    checked++;
    if ((html.match(/<h1[ >]/g) || []).length !== 1)
      errors.push('Invalid heading count: ' + file);
    if (!html.includes('akenhotels.com/en/vessyl-home/'))
      errors.push('Missing booking path: ' + file);
    for (const match of html.matchAll(/(?:href|src|poster)="([^"#]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&');
      if (!value.startsWith('/') || value.startsWith('//')) continue;
      if (base && !value.startsWith(base + '/'))
        errors.push('Unprefixed local URL: ' + value + ' in ' + file);
      targets.add(value.split(/[?#]/)[0]);
    }
  }
for (const target of targets) {
  const f = path.join(root, target);
  try {
    const s = await stat(f);
    if (s.isDirectory()) await stat(path.join(f, 'index.html'));
  } catch {
    errors.push('Missing linked resource: ' + target);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${checked} edition pages, one H1 each, booking routes, ${targets.size} unique internal links and assets. Base path: ${base || '/'}`,
  );
