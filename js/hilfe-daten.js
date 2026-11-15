// Daten der Hilfeseite (Leitfaden Abschn. 5.3): Zweck, Modi, Bedienkonzepte, Bereiche zum Nachschlagen, Anleitungen
// (Erste Schritte und weitere), Experimente, typische Fragen. Texte in js/hilfe-anleitung.js und js/hilfetexte.js,
// erzeugte Experimente in js/experimente.js, gemeinsame Texte und Mechanik in lib/common/js/hilfe-gemeinsam.js und
// hilfe-seite.js. Bilder: node tools/common/hilfe-bilder.mjs (schreibt hilfe/), geprüft in tests/common.test.mjs.

import { ERSTE_SCHRITTE, ABLAEUFE } from './hilfetexte.js';
import { ZWECK, MODI_ZWECK, KONZEPTE, BEREICHE, ANLEITUNGEN, FRAGEN, ERGAENZUNGEN } from './hilfe-anleitung.js';
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

/** Modi: Kennung wie `state.mode`, Name wie auf dem Tab, Link-Adresse, die ihn wählt. @type {HilfeDaten} */
export const HILFE = {
  zweck: ZWECK,
  modi: [
    { id: 'pg', name: 'Punktgruppen', hash: '#m=pg', zweck: MODI_ZWECK.pg },
    { id: 'poly', name: 'Kristallformen', hash: '#m=form', zweck: MODI_ZWECK.poly },
  ],
  ueberblick: {
    id: 'aufbau', titel: 'Aufbau der App', ausschnitt: 'body',
    eintraege: [
      { zeige: 'header.top', name: 'Kopfzeile', text: 'Die beiden Modi, Skript, Quiz, „Link kopieren“ und die Hilfe („?“).' },
      { zeige: '#inhalt > .side', name: 'Seitenleiste', text: 'Was dargestellt wird: Punktgruppe bzw. Form, Gitter, Gestalt, Darstellung; oben die Experimente.' },
      { zeige: '#inhalt .p-a', name: 'Stereogramm', text: 'Die Projektion mit den Werkzeugen „Zone“ und „Winkel“.' },
      { zeige: '#inhalt .p-b', name: '3D-Konstruktion', text: 'Kristall, Umkugel und Projektion im Raum, drehbar.' },
      { zeige: '#info', name: 'Kenndaten', text: 'Was die Darstellung zeigt, als Text, mit Begriffen ins Skript.' },
    ],
  },
  konzepte: KONZEPTE,
  bereiche: BEREICHE,
  ersteSchritte: ERSTE_SCHRITTE,
  anleitungen: ANLEITUNGEN,
  experimente: EXPERIMENTE,
  fragen: FRAGEN,
  ergaenzungen: ERGAENZUNGEN,
  repo: 'manganite/stereography',
  kapitel: KAPITEL,
};
