// Export der Quizfragen als Moodle-XML (Fragentyp „Multiple Choice“), zum Import in die Fragensammlung
// eines Moodle-Kurses. Stereogramme werden als SVG-Dateien in die Fragen eingebettet.
// Die Arbeit macht tools/common/moodle.mjs; hier Fragen, Kapitel und Bilder dieser App.
//
//   node tools/moodle-export.mjs [Ausgabedatei] [--entwurf]
//
// Ohne --entwurf nur geprüfte Fragen (status 'geprüft'); erzeugte Fragen einmal je Parameter.
// Kategorien: Stereographische Projektion / Kap. n … / Stufe s.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANK } from '../js/quiz-bank.js';
import { GENERATOREN } from '../js/quiz-gen.js';
import { KAPITEL } from '../js/quiz-kapitel.js';
import { stereoForHash } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';
import { istRaum, raumSVG } from '../js/bild3d.js';
import { helleFarben, mitSchrift, moodleXML as moodleXMLCommon } from './common/moodle.mjs';

const FONTS = fileURLToPath(new URL('../lib/common/fonts/', import.meta.url));

/** Farben des hellen Modus aus base.css (wie palette() in scene.js, ohne Browser). */
export function hellePalette() {
  const v = helleFarben(fileURLToPath(new URL('../lib/common/css/base.css', import.meta.url)));
  const g = (n) => v[n];
  return {
    paper: g('paper'), ink: g('ink'), muted: g('muted'), net: g('net'),
    mirror: g('ink'), axis: g('ink'), dir: [g('dir1'), g('dir2'), g('dir3')],
    upper: g('upper'), accent: g('accent'), accent2: g('accent2'),
    ray: g('ray'), crystal: g('crystal'), crystal2: g('crystal2'), edge: g('edge'),
    normal: g('normal'), sphere: g('muted'), mirror3d: g('mirror'),
    ax2: g('ax2'), ax3: g('ax3'), ax4: g('ax4'), ax6: g('ax6'),
    form: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => g('fc' + i)),
  };
}

/** SVG einer Abbildung (Link-Adresse der App), wie im Quiz: ohne Ausgangspol-Markierung. */
function svgFor(hash, col, opt = {}) {
  if (istRaum(hash)) return raumSVG(hash, col, opt);
  const { scene } = stereoForHash(hash, col);
  scene.poles = (scene.poles || []).map((p) => ({ ...p, gen: false, selected: false }));
  if (opt.zonenachse === false && scene.zoneList) scene.zoneList = scene.zoneList.map((z) => ({ ...z, label: null, axisMark: false }));
  if (opt.klein) scene.poleScale = 2.2;
  return mitSchrift(buildSVG({ ...scene, bg: col.paper }, { standalone: true }).full, FONTS);
}

/** Alle (geprüften) Fragen, nach Kapitel und Stufe in Kategorien. */
export function moodleXML({ entwurf = false } = {}) {
  const col = hellePalette();
  return moodleXMLCommon({
    bank: BANK, generatoren: GENERATOREN, kapitel: KAPITEL, kurs: 'Stereographische Projektion', entwurf,
    bildSVG: (angabe, opt) => svgFor(angabe, col, opt),
  });
}

// Aufruf von der Kommandozeile
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const entwurf = args.includes('--entwurf');
  const ziel = args.find((a) => !a.startsWith('--')) || 'quiz-moodle.xml';
  const { xml, anzahl } = moodleXML({ entwurf });
  writeFileSync(ziel, xml);
  console.log(`${anzahl} Fragen nach ${ziel} geschrieben${entwurf ? ' (mit Entwürfen)' : ''}.`);
}
