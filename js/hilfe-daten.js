// Daten der Hilfeseite (Leitfaden Abschn. 5.3): Modi der App, Erste Schritte als Anleitungen, Experimente als Liste.
// Texte in js/hilfetexte.js, erzeugte Experimente in js/experimente.js, Mechanik in lib/common/js/hilfe-seite.js.
// Bilder: node tools/common/hilfe-bilder.mjs (schreibt hilfe/<Ablauf>-<Nr>.png), geprüft in tests/common.test.mjs.

import { ERSTE_SCHRITTE, ABLAEUFE } from './hilfetexte.js';
import { ERZEUGTE } from './experimente.js';

/** @import { HilfeDaten } from '../lib/common/js/hilfe-seite.js' */
/** @import { Experiment } from '../lib/common/js/ablauf.js' */

/** Alle Experimente in der Reihenfolge der Liste (App und Hilfeseite): die festen, danach die erzeugten. @type {Experiment[]} */
export const EXPERIMENTE = [...ABLAEUFE, ...ERZEUGTE];

/** Modi: Kennung, Name wie auf dem Tab, Link-Adresse, die ihn wählt. @type {HilfeDaten} */
export const HILFE = {
  modi: [
    { id: 'pg', name: 'Punktgruppen', hash: '#m=pg' },
    { id: 'poly', name: 'Kristallformen', hash: '#m=form' },
  ],
  ersteSchritte: ERSTE_SCHRITTE,
  experimente: EXPERIMENTE,
};
