// Katalog der Kristallformen (Datendatei nach Leitfaden Abschn. 9, #75: nur Literale; die Einträge mit
// Kennung und Stelle bildet js/forms.js) nach International Tables for Crystallography, Vol. A (2006),
// Tab. 10.1.2.2 (Formen je Punktgruppe) und Tab. 10.1.2.3 (die 47 Formen).
// Namen nach Borchardt-Ott & Sowa, Kristallographie (2018), Abb. 15.2 und Tab. 9.5–9.8;
// abweichende ITA-Namen in Klammern.
// Je Punktgruppe die allgemeine Form und die speziellen Grundformen, d. h. je Wyckoff-Lage
// die erste (fett gedruckte) Form; Grenzformen sind nicht aufgenommen.
// hkl: Repräsentant mit Zahlenwerten (bei hexagonalen Achsen drei Indizes h k l, i = −(h+k)).
// sym: Indexmuster nach ITA; mult: Flächenzahl (Multiplizität, dient als Prüfung).

/** @import { Vec3 } from '../lib/common/js/typen.js' */
/** Zeile: [Wyckoff, Flächensymmetrie, Formtyp, Indexmuster, Repräsentant, Multiplizität, Namensvariante]. @typedef {[string, string, number, string, Vec3, number, boolean?]} Zeile */
/** Formen einer Punktgruppe: [Punktgruppe, Zeilen, 'B' bei Aufstellung B]. @typedef {[string, Zeile[], 'B'?]} Formengruppe */

/** Die 47 Formen: deutscher Name (Borchardt-Ott, ITA-Name in Klammern) und Eigensymmetrie (ITA Tab. 10.1.2.3). @type {Record<number, { name: string, alt?: string, eig: string }>} */
export const FORM_TYPES = {
  1: { name: 'Pedion', eig: '∞m' },
  2: { name: 'Pinakoid', eig: '∞/mm' },
  3: { name: 'Sphenoid', alt: 'Doma', eig: 'mm2' },
  4: { name: 'Rhombisches Disphenoid', eig: '222' },
  5: { name: 'Rhombische Pyramide', eig: 'mm2' },
  6: { name: 'Rhombisches Prisma', eig: 'mmm' },
  7: { name: 'Rhombische Dipyramide', eig: 'mmm' },
  8: { name: 'Tetragonale Pyramide', eig: '4mm' },
  9: { name: 'Tetragonales Disphenoid', eig: '-42m' },
  10: { name: 'Tetragonales Prisma', eig: '4/mmm' },
  11: { name: 'Tetragonales Trapezoeder', eig: '422' },
  12: { name: 'Ditetragonale Pyramide', eig: '4mm' },
  13: { name: 'Tetragonales Skalenoeder', eig: '-42m' },
  14: { name: 'Tetragonale Dipyramide', eig: '4/mmm' },
  15: { name: 'Ditetragonales Prisma', eig: '4/mmm' },
  16: { name: 'Ditetragonale Dipyramide', eig: '4/mmm' },
  17: { name: 'Trigonale Pyramide', eig: '3m' },
  18: { name: 'Trigonales Prisma', eig: '-62m' },
  19: { name: 'Trigonales Trapezoeder', eig: '32' },
  20: { name: 'Ditrigonale Pyramide', eig: '3m' },
  21: { name: 'Rhomboeder', eig: '-3m' },
  22: { name: 'Ditrigonales Prisma', eig: '-62m' },
  23: { name: 'Hexagonale Pyramide', eig: '6mm' },
  24: { name: 'Trigonale Dipyramide', eig: '-62m' },
  25: { name: 'Hexagonales Prisma', eig: '6/mmm' },
  26: { name: 'Ditrigonales Skalenoeder', eig: '-3m' },
  27: { name: 'Hexagonales Trapezoeder', eig: '622' },
  28: { name: 'Dihexagonale Pyramide', eig: '6mm' },
  29: { name: 'Ditrigonale Dipyramide', eig: '-62m' },
  30: { name: 'Dihexagonales Prisma', eig: '6/mmm' },
  31: { name: 'Hexagonale Dipyramide', eig: '6/mmm' },
  32: { name: 'Dihexagonale Dipyramide', eig: '6/mmm' },
  33: { name: 'Tetraeder', eig: '-43m' },
  34: { name: 'Würfel (Hexaeder)', eig: 'm-3m' },
  35: { name: 'Oktaeder', eig: 'm-3m' },
  36: { name: 'Tetraedrisches Pentagondodekaeder (Tetartoid)', eig: '23' },
  37: { name: 'Pentagondodekaeder (Pyritoeder)', eig: 'm-3' },
  38: { name: 'Deltoiddodekaeder (Tetragon-Tritetraeder)', eig: '-43m' },
  39: { name: 'Tristetraeder (Trigon-Tritetraeder)', eig: '-43m' },
  40: { name: 'Rhombendodekaeder', eig: 'm-3m' },
  41: { name: 'Disdodekaeder (Diploid)', eig: 'm-3' },
  42: { name: 'Trisoktaeder (Trigon-Trioktaeder)', eig: 'm-3m' },
  43: { name: 'Deltoidikositetraeder (Tetragon-Trioktaeder)', eig: 'm-3m' },
  44: { name: 'Pentagonikositetraeder (Gyroid)', eig: '432' },
  45: { name: 'Hexakistetraeder (Hexatetraeder)', eig: '-43m' },
  46: { name: 'Tetrakishexaeder (Tetrahexaeder)', eig: 'm-3m' },
  47: { name: 'Hexakisoktaeder (Hexaoktaeder)', eig: 'm-3m' },
};

/** Flächenzahl der 47 Formen (ITA Tab. 10.1.2.3). @type {Record<number, number>} */
export const FACE_COUNT = {
  1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 8, 8: 4, 9: 4, 10: 4, 11: 8, 12: 8, 13: 8, 14: 8, 15: 8, 16: 16,
  17: 3, 18: 3, 19: 6, 20: 6, 21: 6, 22: 6, 23: 6, 24: 6, 25: 6, 26: 12, 27: 12, 28: 12, 29: 12, 30: 12, 31: 12, 32: 24,
  33: 4, 34: 6, 35: 8, 36: 12, 37: 12, 38: 12, 39: 12, 40: 12, 41: 24, 42: 24, 43: 24, 44: 24, 45: 24, 46: 24, 47: 48,
};

/** Formtypen der Prismen und des Pinakoids (offene Formen, deren Flächen alle zu einer Richtung parallel liegen). */
export const PRISMEN = [2, 6, 10, 15, 18, 22, 25, 30];

/**
 * Eigensymmetrie in der Schreibweise von FORM_TYPES: die zweite Aufstellung derselben Punktgruppe (4̄m2 wie 4̄2m,
 * 6̄m2 wie 6̄2m). Zum Vergleich einer Eigensymmetrie mit dem Symbol einer Punktgruppe.
 * @type {Record<string, string>}
 */
export const EIG_SCHREIBWEISE = { '-6m2': '-62m', '-4m2': '-42m' };

/** Formen je Punktgruppe, in der Reihenfolge des Katalogs: monoklin Achse b; beide Aufstellungen bei 32, 3m, 3̄m, 4̄2m und 6̄m2 (A: 321, 3m1, 3̄m1, 4̄2m, 6̄m2; B: 312, 31m, 3̄1m, 4̄m2, 6̄2m). @type {Formengruppe[]} */
export const FORMEN = [
  // triklin
  ['1', [['a', '1', 1, 'hkl', [1, 1, 1], 1]]],
  ['-1', [['a', '1', 2, 'hkl', [1, 1, 1], 2]]],
  // monoklin (eindeutige Achse b)
  ['2b', [['b', '1', 3, 'hkl', [1, 1, 1], 2], ['a', '2', 1, '010', [0, 1, 0], 1]]],
  ['mb', [['b', '1', 3, 'hkl', [1, 1, 1], 2, true], ['a', 'm', 1, 'h0l', [1, 0, 1], 1]]],
  ['2/mb', [['c', '1', 6, 'hkl', [1, 1, 1], 4], ['b', 'm', 2, 'h0l', [1, 0, 1], 2], ['a', '2', 2, '010', [0, 1, 0], 2]]],
  // orthorhombisch
  ['222', [['d', '1', 4, 'hkl', [1, 1, 1], 4], ['c', '..2', 2, '001', [0, 0, 1], 2], ['b', '.2.', 2, '010', [0, 1, 0], 2], ['a', '2..', 2, '100', [1, 0, 0], 2]]],
  ['mm2', [['d', '1', 5, 'hkl', [1, 1, 1], 4], ['c', 'm..', 3, '0kl', [0, 1, 1], 2, true], ['b', '.m.', 3, 'h0l', [1, 0, 1], 2, true], ['a', 'mm2', 1, '001', [0, 0, 1], 1]]],
  ['mmm', [['g', '1', 7, 'hkl', [1, 1, 1], 8], ['f', '..m', 6, 'hk0', [1, 1, 0], 4], ['e', '.m.', 6, 'h0l', [1, 0, 1], 4], ['d', 'm..', 6, '0kl', [0, 1, 1], 4],
    ['c', 'mm2', 2, '001', [0, 0, 1], 2], ['b', 'm2m', 2, '010', [0, 1, 0], 2], ['a', '2mm', 2, '100', [1, 0, 0], 2]]],
  // tetragonal
  ['4', [['b', '1', 8, 'hkl', [2, 1, 1], 4], ['a', '4..', 1, '001', [0, 0, 1], 1]]],
  ['-4', [['b', '1', 9, 'hkl', [2, 1, 1], 4], ['a', '2..', 2, '001', [0, 0, 1], 2]]],
  ['4/m', [['c', '1', 14, 'hkl', [2, 1, 1], 8], ['b', 'm..', 10, 'hk0', [2, 1, 0], 4], ['a', '4..', 2, '001', [0, 0, 1], 2]]],
  ['422', [['d', '1', 11, 'hkl', [2, 1, 1], 8], ['c', '.2.', 10, '100', [1, 0, 0], 4], ['b', '..2', 10, '110', [1, 1, 0], 4], ['a', '4..', 2, '001', [0, 0, 1], 2]]],
  ['4mm', [['d', '1', 12, 'hkl', [2, 1, 1], 8], ['c', '.m.', 8, 'h0l', [1, 0, 1], 4], ['b', '..m', 8, 'hhl', [1, 1, 1], 4], ['a', '4mm', 1, '001', [0, 0, 1], 1]]],
  ['-42m', [['d', '1', 13, 'hkl', [2, 1, 1], 8], ['c', '..m', 9, 'hhl', [1, 1, 1], 4], ['b', '.2.', 10, '100', [1, 0, 0], 4], ['a', '2.mm', 2, '001', [0, 0, 1], 2]]],
  ['-4m2', [['d', '1', 13, 'hkl', [2, 1, 1], 8], ['c', '.m.', 9, 'h0l', [1, 0, 1], 4], ['b', '..2', 10, '110', [1, 1, 0], 4], ['a', '2mm.', 2, '001', [0, 0, 1], 2]], 'B'],
  ['4/mmm', [['g', '1', 16, 'hkl', [2, 1, 1], 16], ['f', '.m.', 14, 'h0l', [1, 0, 1], 8], ['e', '..m', 14, 'hhl', [1, 1, 1], 8], ['d', 'm..', 15, 'hk0', [2, 1, 0], 8],
    ['c', 'm2m.', 10, '100', [1, 0, 0], 4], ['b', 'm.m2', 10, '110', [1, 1, 0], 4], ['a', '4mm', 2, '001', [0, 0, 1], 2]]],
  // trigonal (hexagonale Achsen)
  ['3', [['b', '1', 17, 'hkil', [2, 1, 1], 3], ['a', '3..', 1, '0001', [0, 0, 1], 1]]],
  ['-3', [['b', '1', 21, 'hkil', [2, 1, 1], 6], ['a', '3..', 2, '0001', [0, 0, 1], 2]]],
  ['321', [['c', '1', 19, 'hkil', [2, 1, 1], 6], ['b', '.2.', 18, '11-20', [1, 1, 0], 3], ['a', '3..', 2, '0001', [0, 0, 1], 2]]],
  ['312', [['c', '1', 19, 'hkil', [2, 1, 1], 6], ['b', '..2', 18, '10-10', [1, 0, 0], 3], ['a', '3..', 2, '0001', [0, 0, 1], 2]], 'B'],
  ['3m1', [['c', '1', 20, 'hkil', [2, 1, 1], 6], ['b', '.m.', 17, 'h0-hl', [1, 0, 1], 3], ['a', '3m.', 1, '0001', [0, 0, 1], 1]]],
  ['31m', [['c', '1', 20, 'hkil', [2, 1, 1], 6], ['b', '..m', 17, 'hh-2hl', [1, 1, 2], 3], ['a', '3.m', 1, '0001', [0, 0, 1], 1]], 'B'],
  ['-3m1', [['d', '1', 26, 'hkil', [2, 1, 1], 12], ['c', '.m.', 21, 'h0-hl', [1, 0, 1], 6], ['b', '.2.', 25, '11-20', [1, 1, 0], 6], ['a', '3m.', 2, '0001', [0, 0, 1], 2]]],
  ['-31m', [['d', '1', 26, 'hkil', [2, 1, 1], 12], ['c', '..m', 21, 'hh-2hl', [1, 1, 2], 6], ['b', '..2', 25, '10-10', [1, 0, 0], 6], ['a', '3.m', 2, '0001', [0, 0, 1], 2]], 'B'],
  // hexagonal
  ['6', [['b', '1', 23, 'hkil', [2, 1, 1], 6], ['a', '6..', 1, '0001', [0, 0, 1], 1]]],
  ['-6', [['c', '1', 24, 'hkil', [2, 1, 1], 6], ['b', 'm..', 18, 'hki0', [2, 1, 0], 3], ['a', '3..', 2, '0001', [0, 0, 1], 2]]],
  ['6/m', [['c', '1', 31, 'hkil', [2, 1, 1], 12], ['b', 'm..', 25, 'hki0', [2, 1, 0], 6], ['a', '6..', 2, '0001', [0, 0, 1], 2]]],
  ['622', [['d', '1', 27, 'hkil', [2, 1, 1], 12], ['c', '..2', 25, '10-10', [1, 0, 0], 6], ['b', '.2.', 25, '11-20', [1, 1, 0], 6], ['a', '6..', 2, '0001', [0, 0, 1], 2]]],
  ['6mm', [['d', '1', 28, 'hkil', [2, 1, 1], 12], ['c', '.m.', 23, 'h0-hl', [1, 0, 1], 6], ['b', '..m', 23, 'hh-2hl', [1, 1, 2], 6], ['a', '6mm', 1, '0001', [0, 0, 1], 1]]],
  ['-6m2', [['e', '1', 29, 'hkil', [2, 1, 1], 12], ['d', 'm..', 22, 'hki0', [2, 1, 0], 6], ['c', '.m.', 24, 'h0-hl', [1, 0, 1], 6], ['b', 'mm2', 18, '10-10', [1, 0, 0], 3],
    ['a', '3m.', 2, '0001', [0, 0, 1], 2]]],
  ['-62m', [['e', '1', 29, 'hkil', [2, 1, 1], 12], ['d', 'm..', 22, 'hki0', [2, 1, 0], 6], ['c', '..m', 24, 'hh-2hl', [1, 1, 2], 6], ['b', 'm2m', 18, '11-20', [1, 1, 0], 3],
    ['a', '3.m', 2, '0001', [0, 0, 1], 2]], 'B'],
  ['6/mmm', [['g', '1', 32, 'hkil', [2, 1, 1], 24], ['f', 'm..', 30, 'hki0', [2, 1, 0], 12], ['e', '.m.', 31, 'h0-hl', [1, 0, 1], 12], ['d', '..m', 31, 'hh-2hl', [1, 1, 2], 12],
    ['c', 'mm2', 25, '10-10', [1, 0, 0], 6], ['b', 'm2m', 25, '11-20', [1, 1, 0], 6], ['a', '6mm', 2, '0001', [0, 0, 1], 2]]],
  // kubisch
  ['23', [['c', '1', 36, 'hkl', [3, 2, 1], 12], ['b', '2..', 34, '100', [1, 0, 0], 6], ['a', '.3.', 33, '111', [1, 1, 1], 4]]],
  ['m-3', [['d', '1', 41, 'hkl', [3, 2, 1], 24], ['c', 'm..', 37, '0kl', [0, 2, 1], 12], ['b', '.3.', 35, '111', [1, 1, 1], 8], ['a', '2mm..', 34, '100', [1, 0, 0], 6]]],
  ['432', [['d', '1', 44, 'hkl', [3, 2, 1], 24], ['c', '..2', 40, '011', [0, 1, 1], 12], ['b', '.3.', 35, '111', [1, 1, 1], 8], ['a', '4..', 34, '100', [1, 0, 0], 6]]],
  ['-43m', [['d', '1', 45, 'hkl', [3, 2, 1], 24], ['c', '..m', 39, 'hhl (h<l)', [1, 1, 2], 12], ['c', '..m', 38, 'hhl (h>l)', [2, 2, 1], 12],
    ['b', '2.mm', 34, '100', [1, 0, 0], 6], ['a', '.3m', 33, '111', [1, 1, 1], 4]]],
  ['m-3m', [['f', '1', 47, 'hkl', [3, 2, 1], 48], ['e', '..m', 43, 'hhl (h<l)', [1, 1, 2], 24], ['e', '..m', 42, 'hhl (h>l)', [2, 2, 1], 24],
    ['d', 'm..', 46, '0kl', [0, 2, 1], 24], ['c', 'm.m2', 40, '011', [0, 1, 1], 12], ['b', '.3m', 35, '111', [1, 1, 1], 8], ['a', '4m.m', 34, '100', [1, 0, 0], 6]]],
];
