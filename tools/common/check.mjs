// Prüft die Kopie von crystallography-common in einer App gegen lib/common/MANIFEST.json: keine Datei fehlt,
// keine ist verändert, keine ist dazugekommen. Änderungen gehören ins gemeinsame Repository, nicht in die Kopie.
//
//   node tools/common/check.mjs            (im Ordner der App; auch als Test: tests/common.test.mjs)

import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEILE, MANIFEST, dateien } from './sync.mjs';

/** Liste der Abweichungen (leer, wenn die Kopie dem Manifest entspricht). */
export function pruefen(app) {
  const p = join(app, MANIFEST);
  if (!existsSync(p)) return [`${MANIFEST} fehlt`];
  const m = JSON.parse(readFileSync(p, 'utf8'));
  const fehler = [];
  const da = new Set();
  for (const t of TEILE) {
    if (!existsSync(join(app, t.ziel))) { fehler.push(`Ordner fehlt: ${t.ziel}`); continue; }
    for (const f of dateien(join(app, t.ziel))) da.add(relative(app, f).split('\\').join('/'));
  }
  for (const [f, h] of Object.entries(m.files)) {
    if (!da.has(f)) { fehler.push(`fehlt: ${f}`); continue; }
    if (createHash('sha256').update(readFileSync(join(app, f))).digest('hex') !== h) fehler.push(`verändert: ${f}`);
  }
  for (const f of da) if (!(f in m.files) && f !== MANIFEST) fehler.push(`nicht im Manifest: ${f}`);
  return fehler;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const f = pruefen(app);
  const m = JSON.parse(readFileSync(join(app, MANIFEST), 'utf8'));
  if (f.length) { console.error(f.join('\n')); process.exit(1); }
  console.log(`crystallography-common ${m.version}: Kopie unverändert (${Object.keys(m.files).length} Dateien).`);
}
