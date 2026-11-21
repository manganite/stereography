// Lage eines Pols in einer Punktgruppe: allgemein oder speziell, Lagesymmetrie, Multiplizität und Wyckoff-Lage
// (ITA Vol. A, 2016, Abschn. 3.2.1.2.2 und Tab. 3.2.3.2). Gerechnet wird in symcrys (js/kern.js, symcrys#24 Punkt 1);
// hier bleibt, was die App daraus macht: die Toleranz für ihre gerundeten Link-Adressen, das Einrasten beim Ziehen und
// die Pole aus Miller-Indizes in ihrem Rahmen. Zusammenfallende Pole einer Bahn fasst symcrys zusammen (orbitOf,
// symcrys#24 Punkt 3).
//
// Ein Pol liegt speziell, wenn ausser der Identität mindestens eine Operation der Punktgruppe ihn festhält. Diese
// Operationen bilden seine Lagesymmetrie (bei Flächen: Flächensymmetrie); die Zahl der äquivalenten Pole ist Ordnung
// der Gruppe / Ordnung der Lagesymmetrie. Die Wyckoff-Lage fasst alle Pole zusammen, deren Lagesymmetrien zueinander
// konjugiert sind.

import { mulVec, dot, normalize, scale, sub, fromColumns, det } from './linalg.js';
import { latticeToCart } from './pointgroups.js';
import { kernLagesymmetrie, kernPolbahn, kernReziprok, kernWyckoffLagen, kernWyckoffLageVon } from './kern.js';

/** @import { Vec3, Mat3, Richtung, Normale } from '../lib/common/js/typen.js' */
/** @import { Analyse } from './pointgroups.js' */
/**
 * Wyckoff-Lage: Buchstabe, orientiertes Symbol der Lagesymmetrie, Multiplizität, Vertreter (Pol) und
 * Indizes der Operationen seiner Lagesymmetrie.
 * @typedef {{ wy: string, fs: string, mult: number, rep: Vec3, stab: number[] }} Wyckofflage
 */

const deg = Math.PI / 180;
/** Einrasten beim Ziehen: Abstand (Winkel auf der Kugel) zu einer Achse bzw. Spiegelebene. */
export const SNAP_AXIS = 4 * deg;
export const SNAP_MIRROR = 3 * deg;
/** Toleranz für „liegt auf dem Element“ (deckt die Rundung der Link-Adresse auf 4 Stellen ab). */
const ON_TOL = 1e-4;

/**
 * Pol (Flächennormale) zu Miller-Indizes im kartesischen System der Punktgruppen.
 * @param {string} system
 * @param {Normale} hkl
 */
export function poleOfHKL(system, hkl) {
  const toCart = latticeToCart(system);
  const [a, b, c] = /** @type {Richtung[]} */ ([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  const A = fromColumns(toCart(a), toCart(b), toCart(c));
  return normalize(mulVec(kernReziprok(A), hkl));
}

/** Indizes der Operationen, die p festhalten (symcrys). @param {Mat3[]} ops @param {Vec3} p @param {number} [tol] */
export function stabilizer(ops, p, tol = ON_TOL) {
  return kernLagesymmetrie(ops, p, tol).stab;
}

/** @type {Map<string, Wyckofflage[]>} */
const cache = new Map();
/**
 * Wyckoff-Lagen einer Punktgruppe aus symcrys: [{ wy, fs, mult, rep, stab }] (rep: ein Pol der Lage im Rahmen der App,
 * in monoklin und triklin die Normale für rechtwinklige Achsen, nicht der Pol im Gitter der App, mit richtiger
 * Lagesymmetrie; stab: Indizes der Operationen seiner Lagesymmetrie in info.ops).
 * @param {string} groupId
 * @returns {Wyckofflage[]}
 */
export function wyckoffPositions(groupId) {
  let rows = cache.get(groupId);
  if (!rows) {
    rows = kernWyckoffLagen(groupId);
    cache.set(groupId, rows);
  }
  return rows;
}

/** Symmetrieelemente, auf die ein Pol einrasten kann: Achsen (Punkte ±d) und Spiegelebenen (Grosskreise). @param {Pick<Analyse, 'axes' | 'mirrors'>} info */
function snapTargets(info) {
  return { axes: info.axes.map((a) => a.dir), mirrors: info.mirrors };
}

/**
 * Pol beim Ziehen einrasten: liegt p näher als SNAP_AXIS an einer Achse, wird er auf die Achse gesetzt,
 * sonst näher als SNAP_MIRROR an einer Spiegelebene auf deren Grosskreis. Rückgabe: { p, on }.
 * @param {Pick<Analyse, 'axes' | 'mirrors'>} info
 * @param {Vec3} p
 * @returns {{ p: Vec3, on: 'axis' | 'mirror' | null }}
 */
export function snapPole(info, p) {
  const { axes, mirrors } = snapTargets(info);
  /** @type {{ ang: number, p: Vec3 } | null} */
  let best = null;
  for (const d of axes) {
    const c = dot(d, p);
    const ang = Math.acos(Math.min(1, Math.abs(c)));
    if (ang < SNAP_AXIS && (!best || ang < best.ang)) best = { ang, p: c >= 0 ? /** @type {Vec3} */ (d.slice()) : scale(d, -1) };
  }
  if (best) return { p: best.p, on: 'axis' };
  for (const n of mirrors) {
    const s = dot(n, p);
    const ang = Math.asin(Math.min(1, Math.abs(s)));
    if (ang < SNAP_MIRROR && (!best || ang < best.ang)) best = { ang, p: normalize(sub(p, scale(n, s))) };
  }
  if (best) return { p: best.p, on: 'mirror' };
  return { p, on: null };
}

/**
 * Lage des Pols p in der Punktgruppe: { special, mult, stab (Indizes), wy, fs, p }.
 * p wird auf die Elemente seiner Lagesymmetrie gesetzt (entfernt Rundungsfehler, z. B. aus der Link-Adresse).
 * info.ops sind die Operationen der Gruppe groupId (Reihenfolge wie buildPointGroup).
 * @param {string} groupId
 * @param {Pick<Analyse, 'ops'>} info
 * @param {Vec3} p
 */
export function siteOf(groupId, info, p) {
  const { stab, p: pc } = kernLagesymmetrie(info.ops, p, ON_TOL);
  const { wy, fs } = kernWyckoffLageVon(groupId, pc, ON_TOL);
  return { special: stab.length > 1, mult: info.ops.length / stab.length, stab, wy, fs, p: pc };
}

/**
 * Bahn ohne Doppelte (symcrys `orbitOf`, Toleranz 10⁻⁶): je Stelle ein Eintrag { p, det, op (erste Operation), ops (alle
 * Operationen dorthin), mixed (Bild und Spiegelbild fallen zusammen) }. det und mixed sind Darstellung der App.
 * @param {readonly Mat3[]} ops @param {Vec3} p0
 */
export function distinctPoles(ops, p0) {
  return kernPolbahn(ops, p0).map((q) => {
    const dets = q.ops.map((k) => det(ops[k]));
    return { p: q.p, det: dets[0], op: q.ops[0], ops: q.ops, mixed: dets.some((d) => Math.sign(d) !== Math.sign(dets[0])) };
  });
}
