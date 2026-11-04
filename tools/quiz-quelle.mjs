// Quelle der Quizfragen dieser App für die gemeinsame Fragenliste der App-Familie
// (crystallography-common, fragenliste/extract.mjs): Fragen, Generatoren, Kapitel und die Bilder,
// mit denselben Funktionen wie im Moodle-Export, aber ohne eingebettete Schriften.
import { BANK } from '../js/quiz-bank.js';
import { GENERATOREN } from '../js/quiz-gen.js';
import { KAPITEL } from '../js/quiz-kapitel.js';
import { stereoForHash } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';
import { istRaum, raumSVG, appHash } from '../js/bild3d.js';
import { hellePalette } from './moodle-export.mjs';

/** @import { BildOptionen } from '../lib/common/js/quiz-core.js' */

export function quizQuelle() {
  const col = hellePalette();
  /** @param {string} angabe @param {BildOptionen} [opt] */
  const bild = (angabe, opt = {}) => {
    if (!angabe) return null;
    if (istRaum(angabe)) return raumSVG(angabe, col, opt);
    const { scene } = stereoForHash(angabe, col);
    scene.poles = (scene.poles || []).map((p) => ({ ...p, gen: false, selected: false }));
    if (opt.zonenachse === false && scene.zoneList) scene.zoneList = scene.zoneList.map((z) => ({ ...z, label: null, axisMark: false }));
    if (opt.klein) scene.poleScale = 2.2;
    return buildSVG({ ...scene, bg: col.paper }, { standalone: true }).full;
  };
  return {
    app: 'stereography', titel: 'Stereographische Projektion', kurz: 'Stereo',
    kapitel: KAPITEL, bank: BANK, generatoren: GENERATOREN,
    bild, adresse: (/** @type {string} */ angabe) => (angabe ? appHash(angabe) : null),
  };
}
