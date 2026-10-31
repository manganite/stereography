// Lage eines Pols in einer Punktgruppe: allgemein oder speziell, Lagesymmetrie, Multiplizität und
// Wyckoff-Lage (ITA Vol. A, 2006, Abschn. 10.1.2.2 und Tab. 10.1.2.2).
//
// Ein Pol liegt speziell, wenn ausser der Identität mindestens eine Operation der Punktgruppe ihn
// festhält. Diese Operationen bilden seine Lagesymmetrie (bei Flächen: Flächensymmetrie); die Zahl
// der äquivalenten Pole ist Ordnung der Gruppe / Ordnung der Lagesymmetrie. Die Wyckoff-Lage fasst
// alle Pole zusammen, deren Lagesymmetrien zueinander konjugiert sind. Buchstabe und orientiertes
// Symbol stammen aus dem Formkatalog (forms.js, nach ITA); für die Aufstellungen monoklin Achse c, 312,
// 31m, 3̄1m, 4̄m2 und 6̄2m stehen sie in ALT_SETTINGS. Die Aufstellungen B (312 … 6̄2m) haben inzwischen auch
// Katalogeinträge; die Lagentabelle hier bleibt als unabhängige Angabe nach ITA, gegen die die Tests sie prüfen.

import { mulVec, dot, normalize, scale, sub, inverse, transpose, fromColumns, rotation, mul, matEq } from './linalg.js';
import { buildPointGroup, latticeToCart, groupById } from './pointgroups.js';
import { CATALOG } from './forms.js';

const deg = Math.PI / 180;
/** Einrasten beim Ziehen: Abstand (Winkel auf der Kugel) zu einer Achse bzw. Spiegelebene. */
export const SNAP_AXIS = 4 * deg;
export const SNAP_MIRROR = 3 * deg;
/** Toleranz für „liegt auf dem Element“ (deckt die Rundung der Link-Adresse auf 4 Stellen ab). */
const ON_TOL = 1e-4;

/**
 * Aufstellungen, deren Lagen aus der Standardaufstellung abgeleitet werden: Standardaufstellung und Wyckoff-Lagen nach ITA Tab. 10.1.2.2
 * (Buchstabe → orientiertes Symbol). Die Buchstaben stimmen mit der Standardaufstellung überein,
 * in den Symbolen sind die Positionen der 2. und 3. Blickrichtung vertauscht.
 */
const ALT_SETTINGS = {
  '2c': { std: '2b', fs: { b: '1', a: '2' } },
  mc: { std: 'mb', fs: { b: '1', a: 'm' } },
  '2/mc': { std: '2/mb', fs: { c: '1', b: 'm', a: '2' } },
  '312': { std: '321', fs: { c: '1', b: '..2', a: '3..' } },
  '31m': { std: '3m1', fs: { c: '1', b: '..m', a: '3.m' } },
  '-31m': { std: '-3m1', fs: { d: '1', c: '..m', b: '..2', a: '3.m' } },
  '-4m2': { std: '-42m', fs: { d: '1', c: '.m.', b: '..2', a: '2mm.' } },
  '-62m': { std: '-6m2', fs: { e: '1', d: 'm..', c: '..m', b: 'm2m', a: '3.m' } },
};

/** Pol (Flächennormale) zu Miller-Indizes im kartesischen System der Punktgruppen. */
export function poleOfHKL(system, hkl) {
  const toCart = latticeToCart(system);
  const A = fromColumns(toCart([1, 0, 0]), toCart([0, 1, 0]), toCart([0, 0, 1]));
  return normalize(mulVec(transpose(inverse(A)), hkl));
}

/** Indizes der Operationen, die p festhalten. */
export function stabilizer(ops, p, tol = ON_TOL) {
  const out = [];
  ops.forEach((m, i) => {
    const q = mulVec(m, p);
    if (Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < tol) out.push(i);
  });
  return out;
}

/** Drehung R mit R·G_std·R⁻¹ = G_alt (Achsen des Kristallsystems bleiben dabei Achsen). */
function settingRotation(stdOps, altOps) {
  const cands = [];
  for (let k = 1; k < 24; k++) cands.push(rotation([0, 0, 1], k * 15 * deg));
  for (const a of [[1, 0, 0], [0, 1, 0]]) for (const s of [1, -1]) cands.push(rotation(a, s * 90 * deg));
  for (const R of cands) {
    const Rt = transpose(R);
    if (stdOps.every((m) => { const c = mul(mul(R, m), Rt); return altOps.some((n) => matEq(n, c)); })) return R;
  }
  throw new Error('keine Drehung zwischen den Aufstellungen gefunden');
}

const cache = new Map();
/**
 * Wyckoff-Lagen einer Punktgruppe: [{ wy, fs, mult, rep, stab }] (rep: Pol der Lage,
 * stab: Indizes der Operationen seiner Lagesymmetrie in info.ops).
 */
export function wyckoffPositions(groupId) {
  if (cache.has(groupId)) return cache.get(groupId);
  const info = buildPointGroup(groupId);
  const alt = ALT_SETTINGS[groupId];
  const srcId = alt ? alt.std : groupId;
  const src = groupById(srcId);
  const R = alt ? settingRotation(buildPointGroup(srcId).ops, info.ops) : null;
  const rows = [];
  for (const e of CATALOG) {
    if (e.pg !== srcId || rows.some((r) => r.wy === e.wy)) continue;
    let rep = poleOfHKL(src.system, e.hkl);
    if (R) rep = mulVec(R, rep);
    const fs = alt ? alt.fs[e.wy] : e.fs;
    if (fs == null) throw new Error(`Wyckoff-Lage ${e.wy} fehlt für ${groupId}`);
    rows.push({ wy: e.wy, fs, mult: e.mult, rep, stab: stabilizer(info.ops, rep) });
  }
  cache.set(groupId, rows);
  return rows;
}

/** Symmetrieelemente, auf die ein Pol einrasten kann: Achsen (Punkte ±d) und Spiegelebenen (Grosskreise). */
function snapTargets(info) {
  return { axes: info.axes.map((a) => a.dir), mirrors: info.mirrors };
}

/**
 * Pol beim Ziehen einrasten: liegt p näher als SNAP_AXIS an einer Achse, wird er auf die Achse gesetzt,
 * sonst näher als SNAP_MIRROR an einer Spiegelebene auf deren Grosskreis. Rückgabe: { p, on }.
 */
export function snapPole(info, p) {
  const { axes, mirrors } = snapTargets(info);
  let best = null;
  for (const d of axes) {
    const c = dot(d, p);
    const ang = Math.acos(Math.min(1, Math.abs(c)));
    if (ang < SNAP_AXIS && (!best || ang < best.ang)) best = { ang, p: c >= 0 ? d.slice() : scale(d, -1) };
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
 */
export function siteOf(groupId, info, p) {
  const stab = stabilizer(info.ops, p);
  let pc = p;
  if (stab.length > 1) {
    // auf den gemeinsamen Fixraum projizieren: Mittel der Bilder unter der Lagesymmetrie
    const s = stab.reduce((acc, i) => { const q = mulVec(info.ops[i], p); return [acc[0] + q[0], acc[1] + q[1], acc[2] + q[2]]; }, [0, 0, 0]);
    pc = normalize(s);
  }
  const mult = info.ops.length / stab.length;
  const key = (list) => list.slice().sort((a, b) => a - b).join(',');
  let row = null;
  const rows = wyckoffPositions(groupId);
  if (stab.length === 1) row = rows.find((r) => r.stab.length === 1) || null;
  else {
    // konjugiert: Für ein g der Gruppe hat g·p dieselbe Lagesymmetrie wie der Vertreter der Lage
    const targets = rows.filter((r) => r.stab.length === stab.length);
    for (const m of info.ops) {
      const k = key(stabilizer(info.ops, mulVec(m, pc)));
      row = targets.find((r) => key(r.stab) === k);
      if (row) break;
    }
  }
  return { special: stab.length > 1, mult, stab, wy: row ? row.wy : null, fs: row ? row.fs : null, p: pc };
}

/**
 * Bahn ohne Doppelte: je Stelle ein Eintrag { p, det, op (erste Operation), ops (alle Operationen
 * dorthin), mixed (Bild und Spiegelbild fallen zusammen) }. orbit: Ausgabe von pointgroups.orbit.
 */
export function distinctPoles(orbit) {
  const out = [];
  for (const o of orbit) {
    const e = out.find((u) => Math.hypot(u.p[0] - o.p[0], u.p[1] - o.p[1], u.p[2] - o.p[2]) < 1e-6);
    if (e) { e.ops.push(o.op); if (Math.sign(e.det) !== Math.sign(o.det)) e.mixed = true; }
    else out.push({ p: o.p, det: o.det, op: o.op, ops: [o.op], mixed: false });
  }
  return out;
}
