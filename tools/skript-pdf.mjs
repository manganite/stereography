// PDF-Fassung des Skripts (A4) aus skript.html; die Arbeit macht tools/common/skript-pdf.mjs.
//
//   node tools/skript-pdf.mjs [Ausgabedatei] [--base https://…/]
//
// Ausgabe ohne Angabe: skript.pdf im Projektordner. Hier nur, was diese App betrifft: Titel, Adresse und
// der Zustand der interaktiven Abbildungen 2.1 (Projektionsskizze) und 8.5 (Wachstum).
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skriptPDF } from './common/skript-pdf.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const bi = args.indexOf('--base');
const BASE = bi >= 0 ? args.splice(bi, 2)[1] : 'https://manganite.github.io/stereography/';
const OUT = args[0] || join(ROOT, 'skript.pdf');
const VERSION = readFileSync(join(ROOT, 'js/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];

const { anzahl, fehler } = await skriptPDF({
  root: ROOT, out: OUT, base: BASE, titel: 'Stereographische Projektion', version: VERSION,
  // Abb. 8.5: ein Zustand, in dem beide Formen noch zu sehen sind (Oktaeder : Würfel ≈ 1,44)
  vorbereiten: (page) => page.$eval('#w-zeit', (el) => { el.value = 20; el.dispatchEvent(new Event('input')); }),
  interaktiv: ['fig-proj', 'fig-wachstum'],
}).catch((e) => { console.error(e); process.exit(1); });
console.log(`${OUT}: Skript ${VERSION}, ${anzahl} 3D-Abbildungen als Bild`);
if (fehler.length) {
  console.error('Fehler auf der Seite:\n' + fehler.join('\n'));
  process.exit(1);
}
