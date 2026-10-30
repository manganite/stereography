// Kleiner statischer Webserver für einen Ordner, auf einem freien Port (für PDF-Erzeugung und Browser-Tests).
//   const srv = await server(ordner); const url = `http://127.0.0.1:${srv.address().port}/`; … srv.close();

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, normalize, relative, resolve, sep } from 'node:path';

export const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

export function server(root) {
  root = resolve(root);
  const srv = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const file = resolve(root, path || 'index.html');
    // nur Dateien innerhalb von root (auch kein Nachbarordner mit gleichem Namensanfang wie root-privat)
    const rel = relative(root, file);
    if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) { res.writeHead(403).end(); return; }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }).end(data);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}
