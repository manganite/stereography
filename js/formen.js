// Katalog der Kristallformen: was davon der App gehört (Datendatei nach Leitfaden Abschn. 9, #75: nur Literale; die
// Einträge bildet js/forms.js). Die Kristallographie der Formen kommt aus dem Rechenkern symcrys (js/kern.js, symcrys#24
// Punkt 2; ITA, 6. Aufl. 2016, Tab. 3.2.3.2 und 3.2.1.3): Wyckoff-Lage, Flächensymmetrie, Indexmuster, Flächenzahl und
// Eigensymmetrie. Hier stehen die deutschen Namen der 47 Formen, die Kennungen der Formen im Katalog (Link `f=`, mit ihrer
// Reihenfolge Schnittstelle der App), die Vertreter (hkl) und die Namensvarianten.
// Namen nach Borchardt-Ott & Sowa, Kristallographie (2018), Abb. 15.2 und Tab. 9.5–9.8; abweichende ITA-Namen in Klammern.
// Je Punktgruppe die allgemeine Form und die speziellen Grundformen, d. h. je Wyckoff-Lage die fett gedruckten Formen;
// Grenzformen sind nicht aufgenommen.

/** @import { Vec3 } from '../lib/common/js/typen.js' */
/**
 * Zeile: [Kennung, Vertreter, Namensvariante]. Kennung: Wyckoff-Buchstabe und Nummer der Form (ITA Tab. 3.2.1.3), wie in
 * der Link-Kennung `<Punktgruppe>:<Kennung>`; forms.js prüft sie gegen symcrys. Vertreter: Zahlenwerte (bei hexagonalen
 * Achsen drei Indizes h k l, i = −(h+k)).
 * @typedef {[string, Vec3, boolean?]} Zeile
 */
/** Formen einer Punktgruppe: [Punktgruppe, Zeilen, 'B' bei Aufstellung B]. @typedef {[string, Zeile[], 'B'?]} Formengruppe */

/** Die 47 Formen: deutscher Name (Borchardt-Ott, ITA-Name in Klammern) und Namensvariante (Doma statt Sphenoid in m und mm2). Flächenzahl und Eigensymmetrie: symcrys. @type {Record<number, { name: string, alt?: string }>} */
export const FORM_TYPES = {
  1: { name: 'Pedion' },
  2: { name: 'Pinakoid' },
  3: { name: 'Sphenoid', alt: 'Doma' },
  4: { name: 'Rhombisches Disphenoid' },
  5: { name: 'Rhombische Pyramide' },
  6: { name: 'Rhombisches Prisma' },
  7: { name: 'Rhombische Dipyramide' },
  8: { name: 'Tetragonale Pyramide' },
  9: { name: 'Tetragonales Disphenoid' },
  10: { name: 'Tetragonales Prisma' },
  11: { name: 'Tetragonales Trapezoeder' },
  12: { name: 'Ditetragonale Pyramide' },
  13: { name: 'Tetragonales Skalenoeder' },
  14: { name: 'Tetragonale Dipyramide' },
  15: { name: 'Ditetragonales Prisma' },
  16: { name: 'Ditetragonale Dipyramide' },
  17: { name: 'Trigonale Pyramide' },
  18: { name: 'Trigonales Prisma' },
  19: { name: 'Trigonales Trapezoeder' },
  20: { name: 'Ditrigonale Pyramide' },
  21: { name: 'Rhomboeder' },
  22: { name: 'Ditrigonales Prisma' },
  23: { name: 'Hexagonale Pyramide' },
  24: { name: 'Trigonale Dipyramide' },
  25: { name: 'Hexagonales Prisma' },
  26: { name: 'Ditrigonales Skalenoeder' },
  27: { name: 'Hexagonales Trapezoeder' },
  28: { name: 'Dihexagonale Pyramide' },
  29: { name: 'Ditrigonale Dipyramide' },
  30: { name: 'Dihexagonales Prisma' },
  31: { name: 'Hexagonale Dipyramide' },
  32: { name: 'Dihexagonale Dipyramide' },
  33: { name: 'Tetraeder' },
  34: { name: 'Würfel (Hexaeder)' },
  35: { name: 'Oktaeder' },
  36: { name: 'Tetraedrisches Pentagondodekaeder (Tetartoid)' },
  37: { name: 'Pentagondodekaeder (Pyritoeder)' },
  38: { name: 'Deltoiddodekaeder (Tetragon-Tritetraeder)' },
  39: { name: 'Tristetraeder (Trigon-Tritetraeder)' },
  40: { name: 'Rhombendodekaeder' },
  41: { name: 'Disdodekaeder (Diploid)' },
  42: { name: 'Trisoktaeder (Trigon-Trioktaeder)' },
  43: { name: 'Deltoidikositetraeder (Tetragon-Trioktaeder)' },
  44: { name: 'Pentagonikositetraeder (Gyroid)' },
  45: { name: 'Hexakistetraeder (Hexatetraeder)' },
  46: { name: 'Tetrakishexaeder (Tetrahexaeder)' },
  47: { name: 'Hexakisoktaeder (Hexaoktaeder)' },
};

/** Formtypen der Prismen und des Pinakoids (Flächen parallel zu einer gemeinsamen Richtung; Pedion und Sphenoid/Doma erfüllen das auch, gehören aber nicht dazu, auxFormName erkennt sie über die Flächenzahl). */
export const PRISMEN = [2, 6, 10, 15, 18, 22, 25, 30];

/**
 * Eigensymmetrie in der Schreibweise von ITA Tab. 3.2.1.3 (wie symcrys sie gibt): das Symbol der jeweils anderen
 * Aufstellung derselben Punktgruppe (6̄m2 → 6̄2m, 4̄m2 → 4̄2m). Für die Suche nach dem Formtyp (auxFormName) und den
 * Vergleich einer Eigensymmetrie mit dem Symbol einer Punktgruppe.
 * @type {Record<string, string>}
 */
export const EIG_SCHREIBWEISE = { '-6m2': '-62m', '-4m2': '-42m' };

/** Formen je Punktgruppe, in der Reihenfolge des Katalogs: monoklin Achse b; beide Aufstellungen bei 32, 3m, 3̄m, 4̄2m und 6̄m2 (A: 321, 3m1, 3̄m1, 4̄2m, 6̄m2; B: 312, 31m, 3̄1m, 4̄m2, 6̄2m). @type {Formengruppe[]} */
export const FORMEN = [
  // triklin
  ['1', [['a1', [1, 1, 1]]]],
  ['-1', [['a2', [1, 1, 1]]]],
  // monoklin (eindeutige Achse b)
  ['2b', [['b3', [1, 1, 1]], ['a1', [0, 1, 0]]]],
  ['mb', [['b3', [1, 1, 1], true], ['a1', [1, 0, 1]]]],
  ['2/mb', [['c6', [1, 1, 1]], ['b2', [1, 0, 1]], ['a2', [0, 1, 0]]]],
  // orthorhombisch
  ['222', [['d4', [1, 1, 1]], ['c2', [0, 0, 1]], ['b2', [0, 1, 0]], ['a2', [1, 0, 0]]]],
  ['mm2', [['d5', [1, 1, 1]], ['c3', [0, 1, 1], true], ['b3', [1, 0, 1], true], ['a1', [0, 0, 1]]]],
  ['mmm', [['g7', [1, 1, 1]], ['f6', [1, 1, 0]], ['e6', [1, 0, 1]], ['d6', [0, 1, 1]], ['c2', [0, 0, 1]], ['b2', [0, 1, 0]], ['a2', [1, 0, 0]]]],
  // tetragonal
  ['4', [['b8', [2, 1, 1]], ['a1', [0, 0, 1]]]],
  ['-4', [['b9', [2, 1, 1]], ['a2', [0, 0, 1]]]],
  ['4/m', [['c14', [2, 1, 1]], ['b10', [2, 1, 0]], ['a2', [0, 0, 1]]]],
  ['422', [['d11', [2, 1, 1]], ['c10', [1, 0, 0]], ['b10', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  ['4mm', [['d12', [2, 1, 1]], ['c8', [1, 0, 1]], ['b8', [1, 1, 1]], ['a1', [0, 0, 1]]]],
  ['-42m', [['d13', [2, 1, 1]], ['c9', [1, 1, 1]], ['b10', [1, 0, 0]], ['a2', [0, 0, 1]]]],
  ['-4m2', [['d13', [2, 1, 1]], ['c9', [1, 0, 1]], ['b10', [1, 1, 0]], ['a2', [0, 0, 1]]], 'B'],
  ['4/mmm', [['g16', [2, 1, 1]], ['f14', [1, 0, 1]], ['e14', [1, 1, 1]], ['d15', [2, 1, 0]], ['c10', [1, 0, 0]], ['b10', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  // trigonal (hexagonale Achsen)
  ['3', [['b17', [2, 1, 1]], ['a1', [0, 0, 1]]]],
  ['-3', [['b21', [2, 1, 1]], ['a2', [0, 0, 1]]]],
  ['321', [['c19', [2, 1, 1]], ['b18', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  ['312', [['c19', [2, 1, 1]], ['b18', [1, 0, 0]], ['a2', [0, 0, 1]]], 'B'],
  ['3m1', [['c20', [2, 1, 1]], ['b17', [1, 0, 1]], ['a1', [0, 0, 1]]]],
  ['31m', [['c20', [2, 1, 1]], ['b17', [1, 1, 2]], ['a1', [0, 0, 1]]], 'B'],
  ['-3m1', [['d26', [2, 1, 1]], ['c21', [1, 0, 1]], ['b25', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  ['-31m', [['d26', [2, 1, 1]], ['c21', [1, 1, 2]], ['b25', [1, 0, 0]], ['a2', [0, 0, 1]]], 'B'],
  // hexagonal
  ['6', [['b23', [2, 1, 1]], ['a1', [0, 0, 1]]]],
  ['-6', [['c24', [2, 1, 1]], ['b18', [2, 1, 0]], ['a2', [0, 0, 1]]]],
  ['6/m', [['c31', [2, 1, 1]], ['b25', [2, 1, 0]], ['a2', [0, 0, 1]]]],
  ['622', [['d27', [2, 1, 1]], ['c25', [1, 0, 0]], ['b25', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  ['6mm', [['d28', [2, 1, 1]], ['c23', [1, 0, 1]], ['b23', [1, 1, 2]], ['a1', [0, 0, 1]]]],
  ['-6m2', [['e29', [2, 1, 1]], ['d22', [2, 1, 0]], ['c24', [1, 0, 1]], ['b18', [1, 0, 0]], ['a2', [0, 0, 1]]]],
  ['-62m', [['e29', [2, 1, 1]], ['d22', [2, 1, 0]], ['c24', [1, 1, 2]], ['b18', [1, 1, 0]], ['a2', [0, 0, 1]]], 'B'],
  ['6/mmm', [['g32', [2, 1, 1]], ['f30', [2, 1, 0]], ['e31', [1, 0, 1]], ['d31', [1, 1, 2]], ['c25', [1, 0, 0]], ['b25', [1, 1, 0]], ['a2', [0, 0, 1]]]],
  // kubisch
  ['23', [['c36', [3, 2, 1]], ['b34', [1, 0, 0]], ['a33', [1, 1, 1]]]],
  ['m-3', [['d41', [3, 2, 1]], ['c37', [0, 2, 1]], ['b35', [1, 1, 1]], ['a34', [1, 0, 0]]]],
  ['432', [['d44', [3, 2, 1]], ['c40', [0, 1, 1]], ['b35', [1, 1, 1]], ['a34', [1, 0, 0]]]],
  ['-43m', [['d45', [3, 2, 1]], ['c39', [1, 1, 2]], ['c38', [2, 2, 1]], ['b34', [1, 0, 0]], ['a33', [1, 1, 1]]]],
  ['m-3m', [['f47', [3, 2, 1]], ['e43', [1, 1, 2]], ['e42', [2, 2, 1]], ['d46', [0, 2, 1]], ['c40', [0, 1, 1]], ['b35', [1, 1, 1]], ['a34', [1, 0, 0]]]],
];
