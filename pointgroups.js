// Die 32 kristallographischen Punktgruppen (inkl. der in ITA A separat
// aufgeführten Aufstellungen). Alle Operationen sind als 3×3-Matrizen im
// kartesischen Kristallsystem gegeben.
//
// Konvention (ITA A): Projektionsrichtung c (z, zum Betrachter),
// a zeigt im Stereogramm nach unten, b nach rechts.
// Kartesisch: x ∥ a (orthogonale Systeme), y ∥ b, z ∥ c.
// Hexagonale Achsen: b ∥ y, a schliesst mit b 120° ein.

import {
  I3, rot, rotInv, mirror, inversion, mul, mulVec, det, trace, matEq, neg, normalize,
  add, scale, cross, EPS,
} from './linalg.js';

const S3 = Math.sqrt(3);
export const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
// hexagonale Gitterrichtungen (kartesisch, normiert)
export const HEX_A = [S3 / 2, -0.5, 0];          // [100]
export const HEX_B = [0, 1, 0];                  // [010]
export const HEX_A_MINUS_B = normalize(add(HEX_A, scale(HEX_B, -1))); // [1-10]
const D111 = [1, 1, 1];
const D110 = [1, 1, 0];

const inv = inversion;

/**
 * Gruppenliste. hm: Kurzsymbol ('-' setzt einen Querstrich über das folgende Zeichen),
 * setting: Aufstellung (falls ITA mehrere führt), full: volles HM-Symbol (Leerzeichen trennen
 * Symmetrierichtungen), sf: Schoenflies, laue: Laue-Klasse, gens: Generatoren.
 */
export const POINT_GROUPS = [
  // --- triklin
  { id: '1', hm: '1', system: 'triklin', sf: 'C1', full: '1', laue: '-1', gens: () => [] },
  { id: '-1', hm: '-1', system: 'triklin', sf: 'Ci', full: '-1', laue: '-1', gens: () => [inv()] },
  // --- monoklin
  { id: '2b', hm: '2', setting: 'Achse b', system: 'monoklin', sf: 'C2', full: '1 2 1', laue: '2/m', gens: () => [rot(Y, 2)] },
  { id: '2c', hm: '2', setting: 'Achse c', system: 'monoklin', sf: 'C2', full: '1 1 2', laue: '2/m', gens: () => [rot(Z, 2)] },
  { id: 'mb', hm: 'm', setting: 'Achse b', system: 'monoklin', sf: 'Cs', full: '1 m 1', laue: '2/m', gens: () => [mirror(Y)] },
  { id: 'mc', hm: 'm', setting: 'Achse c', system: 'monoklin', sf: 'Cs', full: '1 1 m', laue: '2/m', gens: () => [mirror(Z)] },
  { id: '2/mb', hm: '2/m', setting: 'Achse b', system: 'monoklin', sf: 'C2h', full: '1 2/m 1', laue: '2/m', gens: () => [rot(Y, 2), inv()] },
  { id: '2/mc', hm: '2/m', setting: 'Achse c', system: 'monoklin', sf: 'C2h', full: '1 1 2/m', laue: '2/m', gens: () => [rot(Z, 2), inv()] },
  // --- orthorhombisch
  { id: '222', hm: '222', system: 'orthorhombisch', sf: 'D2', full: '2 2 2', laue: 'mmm', gens: () => [rot(X, 2), rot(Y, 2)] },
  { id: 'mm2', hm: 'mm2', system: 'orthorhombisch', sf: 'C2v', full: 'm m 2', laue: 'mmm', gens: () => [mirror(X), mirror(Y)] },
  { id: 'mmm', hm: 'mmm', system: 'orthorhombisch', sf: 'D2h', full: '2/m 2/m 2/m', laue: 'mmm', gens: () => [rot(X, 2), rot(Y, 2), inv()] },
  // --- tetragonal
  { id: '4', hm: '4', system: 'tetragonal', sf: 'C4', full: '4', laue: '4/m', gens: () => [rot(Z, 4)] },
  { id: '-4', hm: '-4', system: 'tetragonal', sf: 'S4', full: '-4', laue: '4/m', gens: () => [rotInv(Z, 4)] },
  { id: '4/m', hm: '4/m', system: 'tetragonal', sf: 'C4h', full: '4/m', laue: '4/m', gens: () => [rot(Z, 4), inv()] },
  { id: '422', hm: '422', system: 'tetragonal', sf: 'D4', full: '4 2 2', laue: '4/mmm', gens: () => [rot(Z, 4), rot(X, 2)] },
  { id: '4mm', hm: '4mm', system: 'tetragonal', sf: 'C4v', full: '4 m m', laue: '4/mmm', gens: () => [rot(Z, 4), mirror(X)] },
  { id: '-42m', hm: '-42m', system: 'tetragonal', sf: 'D2d', full: '-4 2 m', laue: '4/mmm', gens: () => [rotInv(Z, 4), rot(X, 2)] },
  { id: '-4m2', hm: '-4m2', system: 'tetragonal', sf: 'D2d', full: '-4 m 2', laue: '4/mmm', gens: () => [rotInv(Z, 4), mirror(X)] },
  { id: '4/mmm', hm: '4/mmm', system: 'tetragonal', sf: 'D4h', full: '4/m 2/m 2/m', laue: '4/mmm', gens: () => [rot(Z, 4), rot(X, 2), inv()] },
  // --- trigonal (hexagonale Achsen)
  { id: '3', hm: '3', system: 'trigonal', hex: true, sf: 'C3', full: '3', laue: '-3', gens: () => [rot(Z, 3)] },
  { id: '-3', hm: '-3', system: 'trigonal', hex: true, sf: 'C3i', full: '-3', laue: '-3', gens: () => [rot(Z, 3), inv()] },
  { id: '321', hm: '32', setting: '321', system: 'trigonal', hex: true, sf: 'D3', full: '3 2 1', laue: '-3m', gens: () => [rot(Z, 3), rot(HEX_A, 2)] },
  { id: '312', hm: '32', setting: '312', system: 'trigonal', hex: true, sf: 'D3', full: '3 1 2', laue: '-3m', gens: () => [rot(Z, 3), rot(HEX_A_MINUS_B, 2)] },
  { id: '3m1', hm: '3m', setting: '3m1', system: 'trigonal', hex: true, sf: 'C3v', full: '3 m 1', laue: '-3m', gens: () => [rot(Z, 3), mirror(HEX_A)] },
  { id: '31m', hm: '3m', setting: '31m', system: 'trigonal', hex: true, sf: 'C3v', full: '3 1 m', laue: '-3m', gens: () => [rot(Z, 3), mirror(HEX_A_MINUS_B)] },
  { id: '-3m1', hm: '-3m', setting: '-3m1', system: 'trigonal', hex: true, sf: 'D3d', full: '-3 2/m 1', laue: '-3m', gens: () => [rot(Z, 3), mirror(HEX_A), inv()] },
  { id: '-31m', hm: '-3m', setting: '-31m', system: 'trigonal', hex: true, sf: 'D3d', full: '-3 1 2/m', laue: '-3m', gens: () => [rot(Z, 3), mirror(HEX_A_MINUS_B), inv()] },
  // --- hexagonal
  { id: '6', hm: '6', system: 'hexagonal', hex: true, sf: 'C6', full: '6', laue: '6/m', gens: () => [rot(Z, 6)] },
  { id: '-6', hm: '-6', system: 'hexagonal', hex: true, sf: 'C3h', full: '-6', laue: '6/m', gens: () => [rotInv(Z, 6)] },
  { id: '6/m', hm: '6/m', system: 'hexagonal', hex: true, sf: 'C6h', full: '6/m', laue: '6/m', gens: () => [rot(Z, 6), inv()] },
  { id: '622', hm: '622', system: 'hexagonal', hex: true, sf: 'D6', full: '6 2 2', laue: '6/mmm', gens: () => [rot(Z, 6), rot(HEX_A, 2)] },
  { id: '6mm', hm: '6mm', system: 'hexagonal', hex: true, sf: 'C6v', full: '6 m m', laue: '6/mmm', gens: () => [rot(Z, 6), mirror(HEX_A)] },
  { id: '-6m2', hm: '-6m2', system: 'hexagonal', hex: true, sf: 'D3h', full: '-6 m 2', laue: '6/mmm', gens: () => [rotInv(Z, 6), mirror(HEX_A)] },
  { id: '-62m', hm: '-62m', system: 'hexagonal', hex: true, sf: 'D3h', full: '-6 2 m', laue: '6/mmm', gens: () => [rotInv(Z, 6), rot(HEX_A, 2)] },
  { id: '6/mmm', hm: '6/mmm', system: 'hexagonal', hex: true, sf: 'D6h', full: '6/m 2/m 2/m', laue: '6/mmm', gens: () => [rot(Z, 6), rot(HEX_A, 2), inv()] },
  // --- kubisch
  { id: '23', hm: '23', system: 'kubisch', sf: 'T', full: '2 3', laue: 'm-3', gens: () => [rot(Z, 2), rot(X, 2), rot(D111, 3)] },
  { id: 'm-3', hm: 'm-3', system: 'kubisch', sf: 'Th', full: '2/m -3', laue: 'm-3', gens: () => [rot(Z, 2), rot(X, 2), rot(D111, 3), inv()] },
  { id: '432', hm: '432', system: 'kubisch', sf: 'O', full: '4 3 2', laue: 'm-3m', gens: () => [rot(Z, 4), rot(D111, 3)] },
  { id: '-43m', hm: '-43m', system: 'kubisch', sf: 'Td', full: '-4 3 m', laue: 'm-3m', gens: () => [rotInv(Z, 4), rot(D111, 3)] },
  { id: 'm-3m', hm: 'm-3m', system: 'kubisch', sf: 'Oh', full: '4/m -3 2/m', laue: 'm-3m', gens: () => [rot(Z, 4), rot(D111, 3), inv()] },
];

export const SYSTEMS = ['triklin', 'monoklin', 'orthorhombisch', 'tetragonal', 'trigonal', 'hexagonal', 'kubisch'];

export const groupById = (id) => POINT_GROUPS.find((g) => g.id === id);

/** Erzeugt alle Elemente der Gruppe aus den Generatoren (Identität zuerst). */
export function generateGroup(gens) {
  const els = [I3()];
  const has = (m) => els.some((e) => matEq(e, m));
  let frontier = [I3()];
  while (frontier.length) {
    const next = [];
    for (const a of frontier) {
      for (const g of gens) {
        const p = mul(g, a);
        if (!has(p)) { els.push(p); next.push(p); }
      }
    }
    frontier = next;
    if (els.length > 48) throw new Error('Gruppe zu gross – Generatoren prüfen');
  }
  return els;
}

/** Ordnung einer eigentlichen Drehung aus der Spur. */
function rotationOrder(R) {
  const t = trace(R);
  const c = (t - 1) / 2;
  const ang = Math.acos(Math.max(-1, Math.min(1, c)));
  if (ang < 1e-6) return 1;
  return Math.round((2 * Math.PI) / ang);
}

/** Drehachse einer eigentlichen Drehung (beliebiges Vorzeichen). */
function rotationAxis(R) {
  const n = rotationOrder(R);
  if (n === 2) {
    // R + I hat Rang 1, Spalten ∥ Achse
    const M = [0, 1, 2].map((i) => [0, 1, 2].map((j) => R[i][j] + (i === j ? 1 : 0)));
    let best = [0, 0, 0], bn = 0;
    for (let j = 0; j < 3; j++) {
      const col = [M[0][j], M[1][j], M[2][j]];
      const l = Math.hypot(...col);
      if (l > bn) { bn = l; best = col; }
    }
    return normalize(best);
  }
  return normalize([R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]]);
}

/** Kanonisches Vorzeichen einer Richtung: z > 0, sonst y > 0, sonst x > 0. */
export function canonicalDir(d) {
  const t = 1e-7;
  if (d[2] < -t) return scale(d, -1);
  if (Math.abs(d[2]) <= t) {
    if (d[1] < -t) return scale(d, -1);
    if (Math.abs(d[1]) <= t && d[0] < 0) return scale(d, -1);
  }
  return d;
}

/**
 * Analysiert eine Liste von Operationen und bestimmt die Symmetrieelemente.
 * Rückgabe: { ops, order, centro, chiral, polar, axes:[{dir, symbol, centre}], mirrors:[normal] }
 * symbol ∈ '2','3','4','6','-3','-4','-6'
 */
export function analyzeGroup(ops) {
  const centro = ops.some((m) => matEq(m, neg(I3())));
  const chiral = ops.every((m) => det(m) > 0);
  // polar, falls ein Vektor existiert, der unter allen Operationen invariant ist
  const P = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const m of ops) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) P[i][j] += m[i][j] / ops.length;
  const polar = P.some((r) => r.some((x) => Math.abs(x) > 1e-6));

  const axisMap = [];
  const findAxis = (d) => {
    const c = canonicalDir(d);
    let e = axisMap.find((a) => Math.abs(Math.abs(a.dir[0] * c[0] + a.dir[1] * c[1] + a.dir[2] * c[2]) - 1) < 1e-6);
    if (!e) { e = { dir: c, rot: new Set([1]), rotinv: new Set(), mirror: false }; axisMap.push(e); }
    return e;
  };
  for (const m of ops) {
    const d = det(m);
    if (d > 0) {
      const n = rotationOrder(m);
      if (n > 1) findAxis(rotationAxis(m)).rot.add(n);
    } else {
      const P2 = neg(m);
      const n = rotationOrder(P2);
      if (n === 1) continue; // Inversion
      const e = findAxis(rotationAxis(P2));
      if (n === 2) e.mirror = true; else e.rotinv.add(n);
    }
  }
  const axes = [];
  const mirrors = [];
  for (const e of axisMap) {
    if (e.mirror) mirrors.push(e.dir);
    const maxRot = Math.max(...e.rot);
    let symbol = null;
    if (maxRot === 6 || maxRot === 4) symbol = String(maxRot);
    else if (e.rotinv.has(4)) symbol = '-4';
    else if (e.rotinv.has(6)) symbol = '-6';
    else if (e.rotinv.has(3)) symbol = '-3';
    else if (maxRot > 1) symbol = String(maxRot);
    if (symbol) {
      const centre = centro && !symbol.startsWith('-');
      axes.push({ dir: e.dir, symbol, centre, mirrorPerp: e.mirror });
    }
  }
  return { ops, order: ops.length, centro, chiral, polar, axes, mirrors };
}

/** Vollständige Daten zu einer Punktgruppe. */
export function buildPointGroup(id) {
  const g = groupById(id);
  const ops = generateGroup(g.gens());
  return { ...g, ...analyzeGroup(ops) };
}

/** Bahn (Orbit) eines Punktes unter der Gruppe: [{p, det, op}] */
export function orbit(ops, p0) {
  return ops.map((m, i) => ({ p: mulVec(m, p0), det: det(m), op: i }));
}

/** Zusammenfassung der Symmetrieelemente für die Anzeige. */
export function elementSummary(info) {
  const order = ['6', '-6', '4', '-4', '3', '-3', '2'];
  const counts = {};
  for (const a of info.axes) {
    const key = a.symbol + (a.centre ? '/c' : '');
    counts[key] = (counts[key] || 0) + 1;
  }
  const out = [];
  for (const s of order) {
    for (const c of [false, true]) {
      const key = s + (c ? '/c' : '');
      if (counts[key]) out.push({ symbol: s, centre: c, count: counts[key] });
    }
  }
  return { axes: out, mirrors: info.mirrors.length, centre: info.centro };
}

export { cross, EPS };
