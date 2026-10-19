// Serves site/ (pnpm build:pages) as GitHub Pages does: under the repository's path, a folder's index.html for its
// URL, and 404.html, with its status, for anything else.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = 'site';
const BASE = '/clair-obscur-expedition-cv/';
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4'
};

const fileFor = (pathname) => {
  if (!pathname.startsWith(BASE)) return null;
  const path = join(ROOT, normalize(decodeURIComponent(pathname.slice(BASE.length))));
  if (!path.startsWith(ROOT)) return null;
  if (existsSync(path) && statSync(path).isDirectory()) return join(path, 'index.html');
  return existsSync(path) ? path : null;
};

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const file = fileFor(pathname);
  const served = file && existsSync(file) ? file : join(ROOT, '404.html');
  response.writeHead(served === file ? 200 : 404, {
    'content-type': TYPES[extname(served)] ?? 'application/octet-stream'
  });
  createReadStream(served).pipe(response);
}).listen(PORT);
