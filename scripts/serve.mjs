import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist/client');
const port = Number(process.env.PORT || 4173);
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (
        base &&
        !(url.pathname === base || url.pathname.startsWith(base + '/'))
      ) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const rel = decodeURIComponent(url.pathname.slice(base.length));
      let file = path.resolve(root, '.' + rel);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let info;
      try {
        info = await stat(file);
      } catch {}
      if (info?.isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          res.writeHead(308, { location: url.pathname + '/' + url.search });
          res.end();
          return;
        }
        file = path.join(file, 'index.html');
      }
      let body;
      try {
        body = await readFile(file);
      } catch {
        const notFound = await readFile(path.join(root, '404.html')).catch(
          () => 'Not found',
        );
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(notFound);
        return;
      }
      const headers = {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes',
      };
      const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]),
          end = range[2]
            ? Math.min(Number(range[2]), body.length - 1)
            : body.length - 1;
        if (start > end || start >= body.length) {
          res.writeHead(416, { 'Content-Range': `bytes */${body.length}` });
          res.end();
          return;
        }
        res.writeHead(206, {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${body.length}`,
          'Content-Length': end - start + 1,
        });
        res.end(
          req.method === 'HEAD' ? undefined : body.subarray(start, end + 1),
        );
        return;
      }
      res.writeHead(200, { ...headers, 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      res.writeHead(400);
      res.end('Bad request');
    }
  })
  .listen(port, '127.0.0.1', () =>
    console.log(
      `Vessyl production preview: http://localhost:${port}${base}/classic/ and ${base}/immersive/`,
    ),
  );
