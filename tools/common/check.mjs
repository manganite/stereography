// Prüft die Kopie von crystallography-common in einer App gegen lib/common/MANIFEST.json und, wenn die App den
// Rechenkern symcrys nutzt, dessen Kopie gegen lib/kern/MANIFEST.json: keine Datei fehlt, keine ist verändert,
// keine ist dazugekommen. Änderungen gehören in das Repository, aus dem die Kopie stammt.
//
//   node tools/common/check.mjs            (im Ordner der App; auch als Test: tests/common.test.mjs)

import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEILE, MANIFEST, KERN, KERN_MANIFEST, dateien } from './sync.mjs';

/**
 * Liste der Abweichungen (leer, wenn die Kopie dem Manifest entspricht).
 * @param {string} app
 * @returns {string[]}
 */
export function pruefen(app) {
  const p = join(app, MANIFEST);
  if (!existsSync(p)) return [`${MANIFEST} fehlt`, ...pruefenKern(app)];
  /** @type {string[]} */
  const fehler = [];
  /** @type {string[]} */
  const da = [];
  for (const t of TEILE) {
    if (!existsSync(join(app, t.ziel))) { fehler.push(`Ordner fehlt: ${t.ziel}`); continue; }
    da.push(...dateien(join(app, t.ziel)));
  }
  return [...fehler, ...gegenManifest(app, MANIFEST, da), ...pruefenKern(app)];
}

/**
 * Abweichungen der Kopie von symcrys (lib/kern/) von ihrem Manifest; leer, wenn die App symcrys nicht nutzt.
 * @param {string} app
 * @returns {string[]}
 */
export function pruefenKern(app) {
  if (!existsSync(join(app, KERN))) return [];
  if (!existsSync(join(app, KERN_MANIFEST))) return [`${KERN_MANIFEST} fehlt`];
  return gegenManifest(app, KERN_MANIFEST, dateien(join(app, KERN)));
}

/**
 * Vergleicht vorhandene Dateien mit einem Manifest: fehlende, veränderte und nicht aufgeführte.
 * @param {string} app
 * @param {string} manifest Pfad des Manifests in der App
 * @param {string[]} vorhanden Pfade der vorhandenen Dateien
 * @returns {string[]}
 */
function gegenManifest(app, manifest, vorhanden) {
  /** @type {{ files: Record<string, string> }} */
  const m = JSON.parse(readFileSync(join(app, manifest), 'utf8'));
  const da = new Set(vorhanden.map((f) => relative(app, f).split('\\').join('/')));
  /** @type {string[]} */
  const fehler = [];
  for (const [f, h] of Object.entries(m.files)) {
    if (!da.has(f)) { fehler.push(`fehlt: ${f}`); continue; }
    if (createHash('sha256').update(readFileSync(join(app, f))).digest('hex') !== h) fehler.push(`verändert: ${f}`);
  }
  for (const f of da) if (!(f in m.files) && f !== manifest) fehler.push(`nicht im Manifest: ${f}`);
  return fehler;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const f = pruefen(app);
  const m = JSON.parse(readFileSync(join(app, MANIFEST), 'utf8'));
  if (f.length) { console.error(f.join('\n')); process.exit(1); }
  console.log(`crystallography-common ${m.version}: Kopie unverändert (${Object.keys(m.files).length} Dateien).`);
  if (existsSync(join(app, KERN_MANIFEST))) {
    const k = JSON.parse(readFileSync(join(app, KERN_MANIFEST), 'utf8'));
    console.log(`symcrys ${k.version}: Kopie unverändert (${Object.keys(k.files).length} Dateien).`);
  }
}
