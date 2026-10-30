// Quiz der App: Fragen, Kapitel und Bilder. Ablauf, Rückmeldung und Fortschritt kommen aus
// lib/common/js/quiz-seite.js (gemeinsam mit den anderen Apps der Familie).

import { buildSVG } from './stereogram.js';
import { istRaum, raumInner } from './bild3d.js';
import { palette, stereoForHash } from './scene.js';
import { VERSION } from './version.js';
import { BANK } from './quiz-bank.js';
import { GENERATOREN } from './quiz-gen.js';
import { KAPITEL, SPEICHER } from './quiz-kapitel.js';
import { initQuiz } from '../lib/common/js/quiz-seite.js';
import { versionEintragen, offline } from '../lib/common/js/seite.js';

/** Abbildung einer Bildangabe: räumliche Zeichnung ("3d#…") oder Stereogramm (Link-Adresse der App), ohne
 *  Markierung des Ausgangspols (sie sähe aus wie ein zweites Polsymbol).
 *  opt.zonenachse = false: Zonenachse weder beschriften noch markieren (sie wäre die Antwort);
 *  opt.klein: grössere Polsymbole für kleine Bilder (Antworten als Stereogramme). */
function stereoSVG(hash, alt, opt = {}) {
  if (istRaum(hash)) return `<svg viewBox="0 0 520 520" role="img" aria-label="${alt || 'Räumliche Zeichnung'}">${raumInner(hash, palette(), opt)}</svg>`;
  const { scene } = stereoForHash(hash, palette());
  scene.poles = (scene.poles || []).map((p) => ({ ...p, gen: false, selected: false }));
  if (opt.zonenachse === false && scene.zoneList) scene.zoneList = scene.zoneList.map((z) => ({ ...z, label: null, axisMark: false }));
  if (opt.klein) scene.poleScale = 2.2;
  return `<svg viewBox="0 0 520 520" role="img" aria-label="${alt || 'Stereogramm'}">${buildSVG(scene).inner}</svg>`;
}

versionEintragen(VERSION);
initQuiz({ bank: BANK, generatoren: GENERATOREN, kapitel: KAPITEL, speicher: SPEICHER, bild: stereoSVG });
// Offline wie die App (derselbe Service Worker)
offline();
