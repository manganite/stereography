/**
 * Verweise aus der App ins Skript: Anker eines Abschnitts (oder Kastens) in skript.html und das
 * Kapitel, in dem er steht. tests/skript.test.mjs prüft, dass jeder Anker existiert und im
 * angegebenen Kapitel liegt und dass jeder Begriff der Infobox einen Verweis hat.
 */
export const SKRIPT_ANCHORS = {
  'indizes-gitter': 1, // Gitter
  koordinaten: 2, // ρ und φ
  gruppe: 3, // Ordnung
  schoenflies: 3, // Schoenflies-Symbol
  kurz: 5, // volles Symbol
  'aufstellung-pg': 5, // Aufstellung
  eigenschaften: 5, // Laue-Klasse, zentrosymmetrisch, enantiomorph, polar, piezoelektrisch
  allgemein: 6, // Flächenzahl, Multiplizität, Indexmuster
  lage: 6, // Projektionsrichtung
  tracht: 8,
  'habitus-def': 8,
  'lage-pol': 10, // Lage, Wyckoff-Lage, Flächensymmetrie
  eigensymmetrie: 10,
  'verzerrung-prinzip': 11, // Symmetriebruch, Restgruppe
};

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Begriff als Link ins Skript (z. B. die Bezeichnung einer Zeile der Infobox). */
export function skriptTerm(label, anchor) {
  const kap = SKRIPT_ANCHORS[anchor];
  return `<a class="skript-term" href="skript.html#${anchor}" title="${attr(`Im Skript erklärt, Kapitel ${kap}`)}">${label}</a>`;
}
