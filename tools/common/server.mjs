// Kleiner statischer Webserver für einen Ordner (für PDF-Erzeugung, Browser-Tests und lokales Arbeiten).
//   const srv = await server(ordner); const url = `http://127.0.0.1:${srv.address().port}/`; … srv.close();
// Ordner liefern ihre index.html aus (`/stereography/`), ohne Schrägstrich am Ende wird umgeleitet.
// Direkt gestartet bedient er den Arbeitsordner wie GitHub Pages:
//   node crystallography-common/tools/server.mjs [ordner] [port, Standard 8000]
// Standardordner: zwei Ebenen über dieser Datei, in common also der Arbeitsordner.
//   → http://127.0.0.1:8000/stereography/, …/plane-groups/

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

export function server(root, port = 0) {
  root = resolve(root);
  const srv = createServer(async (req, res) => {
    const adresse = new URL(req.url, 'http://x'), pfad = adresse.pathname;
    const path = normalize(decodeURIComponent(pfad)).replace(/^([/\\])+/, '');
    let file = resolve(root, path || 'index.html');
    // nur Dateien innerhalb von root (auch kein Nachbarordner mit gleichem Namensanfang wie root-privat)
    const rel = relative(root, file);
    if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) {
        // relative Links der Seite brauchen den Schrägstrich am Ende
        if (!pfad.endsWith('/')) { res.writeHead(301, { Location: pfad + '/' + adresse.search }).end(); return; }
        file = join(file, 'index.html');
      }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }).end(data);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((ok) => srv.listen(port, '127.0.0.1', () => ok(srv)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ordner = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
  const srv = await server(ordner, Number(process.argv[3] || 8000));
  console.log(`${ordner} unter http://127.0.0.1:${srv.address().port}/ (Ende mit Ctrl+C)`);
}
