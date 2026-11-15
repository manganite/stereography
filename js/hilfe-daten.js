// Daten der Hilfeseite (Leitfaden Abschn. 5.3): Modi der App, Erste Schritte als Anleitungen, Experimente als Liste.
// Texte in js/hilfetexte.js, erzeugte Experimente in js/experimente.js, Mechanik in lib/common/js/hilfe-seite.js.
// Bilder: node tools/common/hilfe-bilder.mjs (schreibt hilfe/<Ablauf>-<Nr>.png), geprüft in tests/common.test.mjs.

import { ERSTE_SCHRITTE, ABLAEUFE } from './hilfetexte.js';
import { ERZEUGTE } from './experimente.js';
import { KAPITEL } from './quiz-kapitel.js';

/** @import { HilfeDaten } from '../lib/common/js/hilfe-seite.js' */
/** @import { Experiment } from '../lib/common/js/ablauf.js' */

/**
 * Alle Experimente in der Reihenfolge der Liste (App und Hilfeseite): die festen, je erzeugtes nach dem letzten festen
 * desselben Modus aus seinem oder einem früheren Kapitel (Reihenfolge der Kapitel, Leitfaden Abschn. 5.3).
 * @type {Experiment[]}
 */
export const EXPERIMENTE = ERZEUGTE.reduce((liste, e) => {
  // Stelle nach dem letzten passenden Eintrag (ohne findLastIndex, das die Typprüfung mit ES2022 nicht kennt)
  const i = liste.reduce((j, a, k) => (a.modus === e.modus && (a.kapitel ?? 0) <= (e.kapitel ?? 0) ? k : j), -1);
  return [...liste.slice(0, i + 1), e, ...liste.slice(i + 1)];
}, /** @type {Experiment[]} */ ([...ABLAEUFE]));

/** Modi: Kennung, Name wie auf dem Tab, Link-Adresse, die ihn wählt. @type {HilfeDaten} */
export const HILFE = {
  modi: [
    { id: 'pg', name: 'Punktgruppen', hash: '#m=pg' },
    { id: 'poly', name: 'Kristallformen', hash: '#m=form' },
  ],
  ersteSchritte: ERSTE_SCHRITTE,
  experimente: EXPERIMENTE,
  kapitel: KAPITEL,
};
