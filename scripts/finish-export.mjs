import { writeFile, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(
  /^\/+|\/+$/g,
  '',
);
if (base) {
  // Vinext puts the base-prefixed site in a nested directory; GitHub Pages mounts
  // the artifact at that prefix, so its deployable root must be the inner site.
  const source = path.join('dist/client', base);
  await rm('outputs/github-pages', { recursive: true, force: true });
  await mkdir('outputs/github-pages', { recursive: true });
  await cp(source, 'outputs/github-pages', { recursive: true });
  await cp('dist/client/404.html', 'outputs/github-pages/404.html');
  await writeFile('outputs/github-pages/.nojekyll', '');
  console.log('GitHub Pages artifact: outputs/github-pages');
} else await writeFile('dist/client/.nojekyll', '');
