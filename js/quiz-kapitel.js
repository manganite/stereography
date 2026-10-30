// Kapitel des Skripts für das Quiz (Auswahl, Stand, Links ins Skript) und Name des Speichers im Browser.
// Die Logik des Quiz steht in lib/common/js/quiz-core.js, die Seite in lib/common/js/quiz-seite.js.

/** Kapitel des Skripts mit Anker (skript.html#…); kurz: Name auf den Auswahlknöpfen des Quiz. */
export const KAPITEL = [
  { nr: 1, titel: 'Kristallflächen und Indizes', kurz: 'Indizes', anker: 'indizes' },
  { nr: 2, titel: 'Die stereographische Projektion', kurz: 'Projektion', anker: 'projektion' },
  { nr: 3, titel: 'Symmetrieoperationen und Punktgruppen', kurz: 'Punktgruppen', anker: 'punktgruppen' },
  { nr: 4, titel: 'Symmetriegerüste im Stereogramm', kurz: 'Symmetriegerüste', anker: 'symmetrie' },
  { nr: 5, titel: 'Blickrichtungen', kurz: 'Blickrichtungen', anker: 'blickrichtungen' },
  { nr: 6, titel: 'Kristallformen im Stereogramm', kurz: 'Kristallformen', anker: 'formen' },
  { nr: 7, titel: 'Zonen', kurz: 'Zonen', anker: 'zonen' },
  { nr: 8, titel: 'Tracht und Habitus', kurz: 'Tracht und Habitus', anker: 'habitus' },
  { nr: 9, titel: 'Trigonale und hexagonale Kristalle', kurz: 'Trigonal und hexagonal', anker: 'hexagonal' },
  { nr: 10, titel: 'Lagen, Flächensymmetrie und Multiplizität', kurz: 'Lagen und Multiplizität', anker: 'lagen' },
  { nr: 11, titel: 'Symmetrieändernde Verzerrungen', kurz: 'Verzerrungen', anker: 'verzerrung' },
];

/** Präfix der Einträge im Browser: <Präfix>-v1 (Fortschritt), -entwurf (Schalter), -lauf (laufendes Quiz).
 *  Nicht ändern, sonst verlieren Studierende ihren gespeicherten Stand. */
export const SPEICHER = 'stereo-quiz';
