// Die 32 kristallographischen Punktgruppen (inkl. der in ITA A separat aufgeführten Aufstellungen):
// Symbole und Kenndaten, ohne Operationen.
// Datendatei nach Leitfaden Abschn. 9 (Daten getrennt vom Code, #75): nur Literale. Die Erzeugenden und alle
// Rechnungen stehen in js/pointgroups.js; tests/punktgruppen.test.mjs prüft, dass beide zusammenpassen.

/**
 * Zeile der Gruppenliste. hm: Kurzsymbol ('-' setzt einen Querstrich über das folgende Zeichen), setting:
 * Aufstellung (falls ITA mehrere führt), system: Kristallsystem, hex: hexagonale Achsen, sf: Schoenflies,
 * full: volles HM-Symbol (Leerzeichen trennen Symmetrierichtungen), laue: Laue-Klasse.
 * @typedef {{ id: string, hm: string, setting?: string, system: string, hex?: boolean, sf: string, full: string, laue: string }} Punktgruppenzeile
 */

/** @type {Punktgruppenzeile[]} */
export const PUNKTGRUPPEN = [
  // --- triklin
  { id: '1', hm: '1', system: 'triklin', sf: 'C1', full: '1', laue: '-1' },
  { id: '-1', hm: '-1', system: 'triklin', sf: 'Ci', full: '-1', laue: '-1' },
  // --- monoklin
  { id: '2b', hm: '2', setting: 'Achse b', system: 'monoklin', sf: 'C2', full: '1 2 1', laue: '2/m' },
  { id: '2c', hm: '2', setting: 'Achse c', system: 'monoklin', sf: 'C2', full: '1 1 2', laue: '2/m' },
  { id: 'mb', hm: 'm', setting: 'Achse b', system: 'monoklin', sf: 'Cs', full: '1 m 1', laue: '2/m' },
  { id: 'mc', hm: 'm', setting: 'Achse c', system: 'monoklin', sf: 'Cs', full: '1 1 m', laue: '2/m' },
  { id: '2/mb', hm: '2/m', setting: 'Achse b', system: 'monoklin', sf: 'C2h', full: '1 2/m 1', laue: '2/m' },
  { id: '2/mc', hm: '2/m', setting: 'Achse c', system: 'monoklin', sf: 'C2h', full: '1 1 2/m', laue: '2/m' },
  // --- orthorhombisch
  { id: '222', hm: '222', system: 'orthorhombisch', sf: 'D2', full: '2 2 2', laue: 'mmm' },
  { id: 'mm2', hm: 'mm2', system: 'orthorhombisch', sf: 'C2v', full: 'm m 2', laue: 'mmm' },
  { id: 'mmm', hm: 'mmm', system: 'orthorhombisch', sf: 'D2h', full: '2/m 2/m 2/m', laue: 'mmm' },
  // --- tetragonal
  { id: '4', hm: '4', system: 'tetragonal', sf: 'C4', full: '4', laue: '4/m' },
  { id: '-4', hm: '-4', system: 'tetragonal', sf: 'S4', full: '-4', laue: '4/m' },
  { id: '4/m', hm: '4/m', system: 'tetragonal', sf: 'C4h', full: '4/m', laue: '4/m' },
  { id: '422', hm: '422', system: 'tetragonal', sf: 'D4', full: '4 2 2', laue: '4/mmm' },
  { id: '4mm', hm: '4mm', system: 'tetragonal', sf: 'C4v', full: '4 m m', laue: '4/mmm' },
  { id: '-42m', hm: '-42m', system: 'tetragonal', sf: 'D2d', full: '-4 2 m', laue: '4/mmm' },
  { id: '-4m2', hm: '-4m2', system: 'tetragonal', sf: 'D2d', full: '-4 m 2', laue: '4/mmm' },
  { id: '4/mmm', hm: '4/mmm', system: 'tetragonal', sf: 'D4h', full: '4/m 2/m 2/m', laue: '4/mmm' },
  // --- trigonal (hexagonale Achsen)
  { id: '3', hm: '3', system: 'trigonal', hex: true, sf: 'C3', full: '3', laue: '-3' },
  { id: '-3', hm: '-3', system: 'trigonal', hex: true, sf: 'C3i', full: '-3', laue: '-3' },
  { id: '321', hm: '32', setting: '321', system: 'trigonal', hex: true, sf: 'D3', full: '3 2 1', laue: '-3m' },
  { id: '312', hm: '32', setting: '312', system: 'trigonal', hex: true, sf: 'D3', full: '3 1 2', laue: '-3m' },
  { id: '3m1', hm: '3m', setting: '3m1', system: 'trigonal', hex: true, sf: 'C3v', full: '3 m 1', laue: '-3m' },
  { id: '31m', hm: '3m', setting: '31m', system: 'trigonal', hex: true, sf: 'C3v', full: '3 1 m', laue: '-3m' },
  { id: '-3m1', hm: '-3m', setting: '-3m1', system: 'trigonal', hex: true, sf: 'D3d', full: '-3 2/m 1', laue: '-3m' },
  { id: '-31m', hm: '-3m', setting: '-31m', system: 'trigonal', hex: true, sf: 'D3d', full: '-3 1 2/m', laue: '-3m' },
  // --- hexagonal
  { id: '6', hm: '6', system: 'hexagonal', hex: true, sf: 'C6', full: '6', laue: '6/m' },
  { id: '-6', hm: '-6', system: 'hexagonal', hex: true, sf: 'C3h', full: '-6', laue: '6/m' },
  { id: '6/m', hm: '6/m', system: 'hexagonal', hex: true, sf: 'C6h', full: '6/m', laue: '6/m' },
  { id: '622', hm: '622', system: 'hexagonal', hex: true, sf: 'D6', full: '6 2 2', laue: '6/mmm' },
  { id: '6mm', hm: '6mm', system: 'hexagonal', hex: true, sf: 'C6v', full: '6 m m', laue: '6/mmm' },
  { id: '-6m2', hm: '-6m2', system: 'hexagonal', hex: true, sf: 'D3h', full: '-6 m 2', laue: '6/mmm' },
  { id: '-62m', hm: '-62m', system: 'hexagonal', hex: true, sf: 'D3h', full: '-6 2 m', laue: '6/mmm' },
  { id: '6/mmm', hm: '6/mmm', system: 'hexagonal', hex: true, sf: 'D6h', full: '6/m 2/m 2/m', laue: '6/mmm' },
  // --- kubisch
  { id: '23', hm: '23', system: 'kubisch', sf: 'T', full: '2 3', laue: 'm-3' },
  { id: 'm-3', hm: 'm-3', system: 'kubisch', sf: 'Th', full: '2/m -3', laue: 'm-3' },
  { id: '432', hm: '432', system: 'kubisch', sf: 'O', full: '4 3 2', laue: 'm-3m' },
  { id: '-43m', hm: '-43m', system: 'kubisch', sf: 'Td', full: '-4 3 m', laue: 'm-3m' },
  { id: 'm-3m', hm: 'm-3m', system: 'kubisch', sf: 'Oh', full: '4/m -3 2/m', laue: 'm-3m' },
];

/** Kristallsysteme in der Reihenfolge der Anzeige. */
export const SYSTEMS = ['triklin', 'monoklin', 'orthorhombisch', 'tetragonal', 'trigonal', 'hexagonal', 'kubisch'];
/** Namen der Kristallsysteme für die Anzeige (Auswahl, Kenndaten), in der Reihenfolge von SYSTEMS. @type {Record<string, string>} */
export const SYSTEM_NAMEN = { triklin: 'Triklin', monoklin: 'Monoklin', orthorhombisch: 'Orthorhombisch', tetragonal: 'Tetragonal', trigonal: 'Trigonal', hexagonal: 'Hexagonal', kubisch: 'Kubisch' };
