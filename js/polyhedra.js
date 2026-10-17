// Kristallformen als Polyeder: Gitter, Bahnen von Flächen unter der Punktgruppe,
// Schliessen offener Formen durch Ergänzungsformen derselben Punktgruppe,
// Restsymmetrie bei freier Verzerrung.
//
// Konventionen: Gittermatrix A (Spalten a, b, c) im kartesischen System, c ∥ z, b in der yz-Ebene
// (ITA: Blick entlang c, a nach unten, b nach rechts). Flächennormale G = B·h mit B = A⁻ᵀ.
// Symmetrieoperation im Gitter: W (ganzzahlig), kartesisch R = A W A⁻¹; Indizes: h' = W⁻ᵀ h.

import {
  fromColumns, inverse, transpose, mul, mulVec, dot, cross, normalize, scale, add, sub, norm,
  solve3, vecEq, fromRows, matEq,
} from './linalg.js';
import { buildPointGroup, groupById, analyzeGroup, POINT_GROUPS } from './pointgroups.js';
import { CATALOG, entryById, FORM_TYPES } from './forms.js';

const deg = Math.PI / 180;

export const SYSTEM_OF = Object.fromEntries(POINT_GROUPS.map((g) => [g.id, g.system]));
const HEX_SYSTEMS = new Set(['trigonal', 'hexagonal']);
export const isHexSystem = (sys) => HEX_SYSTEMS.has(sys);

/** Holoedrie je System (für Kandidaten der Restsymmetrie). */
const HOLOHEDRY = { triklin: '-1', monoklin: '2/mb', orthorhombisch: 'mmm', tetragonal: '4/mmm', trigonal: '6/mmm', hexagonal: '6/mmm', kubisch: 'm-3m' };

/** Voreinstellungen der Gitterparameter je System (a = 1). */
export const LATTICE_DEFAULTS = {
  triklin: { ba: 1.15, ca: 0.9, al: 82, be: 104, ga: 96 },
  monoklin: { ba: 1.2, ca: 0.85, al: 90, be: 105, ga: 90 },
  orthorhombisch: { ba: 1.25, ca: 0.8, al: 90, be: 90, ga: 90 },
  tetragonal: { ba: 1, ca: 1.3, al: 90, be: 90, ga: 90 },
  trigonal: { ba: 1, ca: 1.1, al: 90, be: 90, ga: 120 },
  hexagonal: { ba: 1, ca: 1.1, al: 90, be: 90, ga: 120 },
  kubisch: { ba: 1, ca: 1, al: 90, be: 90, ga: 90 },
};

/** Welche Parameter das System freilässt. */
export const FREE_PARAMS = {
  triklin: ['ba', 'ca', 'al', 'be', 'ga'],
  monoklin: ['ba', 'ca', 'be'],
  orthorhombisch: ['ba', 'ca'],
  tetragonal: ['ca'],
  trigonal: ['ca'],
  hexagonal: ['ca'],
  kubisch: [],
};

/** Parameter auf die Bedingungen des Systems setzen. */
export function constrainLattice(lat, sys) {
  const d = LATTICE_DEFAULTS[sys];
  const out = { ...d };
  for (const k of FREE_PARAMS[sys]) out[k] = lat[k] ?? d[k];
  return out;
}

/** Gittermatrix aus a = 1, b/a, c/a, α, β, γ. */
export function latticeFromParams(p) {
  const a = 1, b = p.ba, c = p.ca;
  const al = p.al * deg, be = p.be * deg, ga = p.ga * deg;
  const cv = [0, 0, c];
  const bv = [0, b * Math.sin(al), b * Math.cos(al)];
  const az = a * Math.cos(be);
  const ay = (a * (Math.cos(ga) - Math.cos(al) * Math.cos(be))) / Math.sin(al);
  const ax = Math.sqrt(Math.max(1e-9, a * a - ay * ay - az * az));
  return fromColumns([ax, ay, az], bv, cv);
}

/** Idealgitter des Systems, in dem die kartesischen Operationen aus pointgroups.js gelten. */
function idealLattice(sys) {
  return latticeFromParams({ ...LATTICE_DEFAULTS[sys], ba: 1, ca: 1, ...(sys === 'monoklin' || sys === 'triklin' ? { al: 90, be: 90, ga: 90 } : {}) });
}

const roundM = (M) => M.map((r) => r.map((x) => Math.round(x)));

/** Ganzzahlige Gitterdarstellungen W der Operationen einer Punktgruppe. */
export function latticeOps(groupId) {
  const sys = SYSTEM_OF[groupId];
  const A0 = idealLattice(sys);
  const A0i = inverse(A0);
  return buildPointGroup(groupId).ops.map((R) => roundM(mul(mul(A0i, R), A0)));
}

const hklKey = (h) => h.join(',');
const transformHKL = (W, h) => mulVec(transpose(inverse(W)), h).map((x) => Math.round(x) + 0);

/** Bahn eines Index-Tripels unter den Gitteroperationen. */
export function hklOrbit(Ws, h) {
  const out = [];
  const seen = new Set();
  for (const W of Ws) {
    const h2 = transformHKL(W, h);
    const k = hklKey(h2);
    if (!seen.has(k)) { seen.add(k); out.push(h2); }
  }
  return out;
}

/** Erhält W die Metrik M = AᵀA? */
const preservesMetric = (W, M) => matEq(mul(mul(transpose(W), M), W), M, 1e-6);

/** Halbraumschnitt → Ecken und Flächen. planes: [{n, t, ...}] (G·r ≤ t) */
export function intersectHalfspaces(planes) {
  const P = planes.map((p) => {
    const l = norm(p.n);
    return { ...p, u: scale(p.n, 1 / l), d: p.t / l };
  });
  const verts = [];
  for (let i = 0; i < P.length; i++)
    for (let j = i + 1; j < P.length; j++)
      for (let k = j + 1; k < P.length; k++) {
        const x = solve3(fromRows(P[i].u, P[j].u, P[k].u), [P[i].d, P[j].d, P[k].d]);
        if (!x) continue;
        if (P.every((p) => dot(p.u, x) <= p.d + 1e-7) && !verts.some((v) => vecEq(v, x, 1e-6))) verts.push(x);
      }
  const faces = [];
  for (const p of P) {
    const on = verts.filter((v) => Math.abs(dot(p.u, v) - p.d) < 1e-6);
    if (on.length < 3) continue;
    const c = scale(on.reduce((s, v) => add(s, v), [0, 0, 0]), 1 / on.length);
    const e1 = normalize(sub(on[0], c));
    const e2 = cross(p.u, e1);
    on.sort((a, b) => {
      const da = sub(a, c), db = sub(b, c);
      return Math.atan2(dot(da, e2), dot(da, e1)) - Math.atan2(dot(db, e2), dot(db, e1));
    });
    let area = 0;
    for (let i = 0; i < on.length; i++) area += dot(cross(sub(on[i], c), sub(on[(i + 1) % on.length], c)), p.u) / 2;
    if (area < 1e-9) continue;
    faces.push({ ...p, verts: on, center: c, area });
  }
  const volume = faces.reduce((s, f) => s + (f.area * f.d) / 3, 0);
  return { verts, faces, volume };
}

const BOX = 40;
const boxPlanes = () => [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((n) => ({ n, t: BOX, role: 'box' }));

/** Kandidaten für Ergänzungsformen: einfache Gitterrichtungen. */
const AUX_CANDIDATES = (() => {
  const out = [];
  for (let h = -1; h <= 1; h++) for (let k = -1; k <= 1; k++) for (let l = -1; l <= 1; l++) {
    if (h || k || l) out.push([h, k, l]);
  }
  return out.sort((a, b) => a.filter((x) => x).length - b.filter((x) => x).length);
})();

/**
 * Ergänzt eine offene Form durch Formen derselben Punktgruppe, bis das Polyeder geschlossen ist.
 * Gibt die Liste der Ergänzungsformen zurück: [{hkls}]
 */
function closeForm(mainHKL, Ws, B, tAux) {
  const used = new Set(mainHKL.map(hklKey));
  const aux = [];
  const planesOf = (list, t, role) => list.map((h) => ({ hkl: h, n: mulVec(B, h), t, role }));
  for (let iter = 0; iter < 8; iter++) {
    const planes = [...planesOf(mainHKL, 1, 'main'), ...aux.flatMap((a) => planesOf(a.hkls, tAux, 'aux')), ...boxPlanes()];
    const poly = intersectHalfspaces(planes);
    // offene Richtung: Mittel der Richtungen zu den Ecken am Hilfswürfel (bzw. fernste Ecke)
    const farV = poly.verts.filter((v) => Math.max(...v.map(Math.abs)) > BOX * 0.9);
    if (!farV.length) break; // geschlossen
    let u = normalize(farV.reduce((s, v) => add(s, normalize(v)), [0, 0, 0]));
    if (norm(farV.reduce((s, v) => add(s, normalize(v)), [0, 0, 0])) < 0.3 * farV.length) {
      u = normalize(farV.reduce((b, v) => (norm(v) > norm(b) ? v : b), farV[0]));
    }
    let best = null, bs = 0.2;
    for (const c of AUX_CANDIDATES) {
      if (used.has(hklKey(c))) continue;
      const orb = hklOrbit(Ws, c);
      if (orb.some((h) => used.has(hklKey(h)))) continue;
      const nz = c.filter((x) => x).length;
      const s = Math.max(...orb.map((h) => dot(normalize(mulVec(B, h)), u))) - 0.08 * (nz - 1) - 0.01 * orb.length;
      if (s > bs + 1e-6) { bs = s; best = orb; }
    }
    if (!best) break;
    best.forEach((h) => used.add(hklKey(h)));
    aux.push({ hkls: best });
  }
  return aux;
}

/** Erkennt die Restsymmetrie einer Gruppe unter einer (verzerrten) Metrik. */
function reducedOps(Ws, M) {
  return Ws.filter((W) => preservesMetric(W, M));
}

/** Bestimmt den Punktgruppentyp (HM-Symbol) zu kartesischen Operationen. */
export function identifyGroup(cartOps) {
  const info = analyzeGroup(cartOps);
  const sig = (inf) => {
    const counts = {};
    for (const a of inf.axes) counts[a.symbol] = (counts[a.symbol] || 0) + 1;
    return JSON.stringify([inf.order, inf.centro, inf.mirrors.length, Object.keys(counts).sort().map((k) => [k, counts[k]])]);
  };
  const s = sig(info);
  for (const g of POINT_GROUPS) {
    if (sig(buildPointGroup(g.id)) === s) return { hm: g.hm, id: g.id, info };
  }
  return { hm: '?', id: null, info };
}

/** Orientierungsvorgaben ("Lagen"). z: Blickrichtung [uvw], x: Richtung nach unten (oder null: ⊥ b). */
export function orientationPresets(sys) {
  if (sys === 'kubisch') {
    return [
      { id: '001', name: '[001] ∥ Blickrichtung', z: [0, 0, 1], x: [1, 0, 0] },
      { id: '111', name: '[111] ∥ Blickrichtung', z: [1, 1, 1], x: [1, 1, -2] },
      { id: '110', name: '[110] ∥ Blickrichtung', z: [1, 1, 0], x: [0, 0, -1] },
    ];
  }
  return [
    { id: 'c', name: 'c ∥ Blickrichtung', z: [0, 0, 1], x: null },
    { id: 'a', name: 'a ∥ Blickrichtung (c liegt)', z: [1, 0, 0], x: [0, 0, -1] },
    { id: 'b', name: 'b ∥ Blickrichtung (c liegt)', z: [0, 1, 0], x: [0, 0, -1] },
  ];
}

/** Orientierungsmatrix O (Zeilen: Bildschirmachsen x↓, y→, z⊙ im Kristallsystem). */
export function orientationMatrix(A, preset) {
  const zc = normalize(mulVec(A, preset.z));
  let xc = preset.x ? mulVec(A, preset.x) : cross(mulVec(A, [0, 1, 0]), zc);
  xc = normalize(sub(xc, scale(zc, dot(xc, zc))));
  const yc = cross(zc, xc);
  return fromRows(xc, yc, zc);
}

/**
 * Flächenmuster zur Anzeige der Flächensymmetrie: ein kleines asymmetrisches Dreieck in allgemeiner
 * Lage auf einer Fläche der Hauptform, vervielfältigt mit allen Operationen der Punktgruppe.
 * Auf jeder Fläche entstehen so |Flächensymmetrie| Muster in deren Anordnung.
 * Rückgabe: [{pts:[3 Punkte], det}] in Bildschirmkoordinaten (vor Grössenskalierung).
 */
export function faceMotifs(faces, ops) {
  const f0 = faces.find((f) => f.role === 'main');
  if (!f0) return [];
  const c = f0.center, n = f0.normal;
  // Inkreisradius-Abschätzung: kleinster Abstand vom Flächenmittelpunkt zu den Kanten
  let r = Infinity;
  for (let i = 0; i < f0.verts.length; i++) {
    const a = f0.verts[i], b = f0.verts[(i + 1) % f0.verts.length];
    const e = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(c, a), e) / dot(e, e)));
    r = Math.min(r, norm(sub(c, add(a, scale(e, t)))));
  }
  const e1 = normalize(sub(f0.verts[0], c));
  const e2 = cross(n, e1);
  const dir = (ang) => add(scale(e1, Math.cos(ang)), scale(e2, Math.sin(ang)));
  // allgemeine Lage: Winkel, die mit keiner kristallographischen Richtung zusammenfallen
  const p = add(c, scale(dir(0.31), 0.42 * r));
  const lift = scale(n, 0.004);
  const tri = [p, add(p, scale(dir(1.23), 0.38 * r)), add(p, scale(dir(2.61), 0.2 * r))].map((v) => add(v, lift));
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  return ops.map((R) => ({ pts: tri.map((v) => mulVec(R, v)), det: Math.sign(det3(R)) }));
}

/** Kanonischer Repräsentant einer Bahn (für die Anzeige): möglichst positive Indizes. */
function canonicalRep(hkls) {
  const score = (h) => h.reduce((s, x, i) => s + (x >= 0 ? 4 : 0) * (3 - i), 0) * 100 + h[0] * 9 + h[1] * 3 + h[2];
  return [...hkls].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Baut den Kristall zu einem Katalogeintrag.
 * params: { entryId, lat, broken, open, auxDist, presetId }
 */
export function buildCrystal(params) {
  const entry = entryById(params.entryId);
  const groupId = entry.pg;
  const sys = SYSTEM_OF[groupId];
  const hex = isHexSystem(sys);
  const lat = params.broken ? { ...params.lat } : constrainLattice(params.lat, sys);
  const A = latticeFromParams(lat);
  const Ai = inverse(A);
  const B = transpose(Ai);
  const M = mul(transpose(A), A);

  const Ws = latticeOps(groupId);
  const mainHKL = hklOrbit(Ws, entry.hkl);
  const tAux = params.auxDist ?? 1;
  const auxForms = closeForm(mainHKL, Ws, B, tAux);

  // Restsymmetrie bei freier Verzerrung
  const Wred = reducedOps(Ws, M);
  const isReduced = Wred.length < Ws.length;
  const cart = (W) => mul(mul(A, W), Ai);

  // Zerfall der Hauptform in Bahnen der Restgruppe
  const orbitsMain = [];
  const seen = new Set();
  for (const h of mainHKL) {
    const k = hklKey(h);
    if (seen.has(k)) continue;
    const orb = hklOrbit(Wred, h);
    orb.forEach((x) => seen.add(hklKey(x)));
    orbitsMain.push(orb);
  }
  const orbitIndex = new Map();
  orbitsMain.forEach((orb, i) => orb.forEach((h) => orbitIndex.set(hklKey(h), i)));

  const planes = [
    ...mainHKL.map((h) => ({ hkl: h, n: mulVec(B, h), t: 1, role: 'main', orbit: orbitIndex.get(hklKey(h)) })),
    ...auxForms.flatMap((a, ai) => a.hkls.map((h) => ({ hkl: h, n: mulVec(B, h), t: tAux, role: 'aux', aux: ai }))),
  ];
  const poly = intersectHalfspaces(planes);

  const presets = orientationPresets(sys);
  const preset = presets.find((p) => p.id === params.presetId) || presets[0];
  const O = orientationMatrix(A, preset);
  const Ot = transpose(O);

  const cen = scale(poly.verts.reduce((s, v) => add(s, v), [0, 0, 0]), 1 / Math.max(1, poly.verts.length));
  const sc = poly.volume > 1e-9 ? 1 / Math.cbrt(poly.volume) : 1;
  const tr = (v) => mulVec(O, scale(sub(v, cen), sc));
  const faces = poly.faces.map((f) => ({
    hkl: f.hkl, role: f.role, orbit: f.orbit, aux: f.aux,
    normal: normalize(mulVec(O, f.u)),
    verts: f.verts.map(tr),
    center: tr(f.center),
  }));
  // Flächen der Hauptform, die durch Ergänzungsformen ganz weggeschnitten wurden (sollte nicht vorkommen)
  const lostMain = mainHKL.length - faces.filter((f) => f.role === 'main').length;

  const axes = [
    { name: hex ? 'a₁' : 'a', dir: normalize(mulVec(O, mulVec(A, [1, 0, 0]))) },
    { name: hex ? 'a₂' : 'b', dir: normalize(mulVec(O, mulVec(A, [0, 1, 0]))) },
    { name: 'c', dir: normalize(mulVec(O, mulVec(A, [0, 0, 1]))) },
  ];
  if (hex && !params.broken) axes.push({ name: 'a₃', dir: normalize(mulVec(O, mulVec(A, [-1, -1, 0]))) });

  // Symmetrieoperationen in Bildschirmkoordinaten (für das Gerüst)
  const toScreen = (W) => mul(mul(O, cart(W)), Ot);
  const opsScreen = Wred.map(toScreen);
  const groupScreen = analyzeGroup(opsScreen);
  const motifs = faceMotifs(faces, opsScreen);
  const reduced = isReduced ? identifyGroup(Wred.map(cart)) : null;

  // Hauptachse der Restgruppe als Gitterrichtung (zur Anzeige)
  let reducedAxis = null;
  if (reduced) {
    const order = { '6': 6, '-6': 6, '4': 4, '-4': 4, '3': 3, '-3': 3, '2': 2 };
    const axs = reduced.info.axes;
    const maxO = Math.max(0, ...axs.map((a) => order[a.symbol]));
    const top = axs.filter((a) => order[a.symbol] === maxO);
    if (top.length === 1) {
      const u = mulVec(Ai, top[0].dir);
      const m = Math.max(...u.map(Math.abs));
      reducedAxis = { symbol: top[0].symbol, uvw: u.map((x) => Math.round(x / m)) };
    }
  }

  const zones = sys === 'kubisch'
    ? [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]].map((h) => normalize(mulVec(O, mulVec(B, h))))
    : [];

  return {
    entry, groupId, sys, hex, lat, A, O, faces, axes, preset, presets, zones,
    mainHKL, auxForms, lostMain,
    isReduced, reduced, reducedAxis, orbitsMain: orbitsMain.map((o) => ({ hkls: o, rep: canonicalRep(o) })),
    framework: groupScreen, motifs,
    motifsPerFace: Wred.length / Math.max(1, orbitsMain[0].length),
    auxReps: auxForms.map((a) => ({ hkls: a.hkls, rep: canonicalRep(a.hkls) })),
  };
}

const PRISM_TYPES = new Set([2, 6, 10, 15, 18, 22, 25, 30]);
const EIG_ALIAS = { '-6m2': '-62m', '-4m2': '-42m' };

/**
 * Geometrische Benennung einer Form (auch Grenzformen) nach ITA Tab. 10.1.2.3:
 * über Flächenzahl, Eigensymmetrie (Stabilisator in der Holoedrie) und offen/geschlossen.
 * Gibt { type, name } zurück oder null.
 */
export function auxFormName(groupId, hkls) {
  const sys = SYSTEM_OF[groupId];
  const n = hkls.length;
  const A0 = idealLattice(sys);
  const B0 = transpose(inverse(A0));
  const normals = hkls.map((h) => normalize(mulVec(B0, h)));
  if (n === 1) return { type: 1, name: FORM_TYPES[1].name };
  if (n === 2) {
    if (vecEq(normals[0], scale(normals[1], -1))) return { type: 2, name: FORM_TYPES[2].name };
    const W = latticeOps(groupId).find((w) => hklKey(transformHKL(w, hkls[0])) === hklKey(hkls[1]));
    const d = W ? Math.round(W[0][0] * (W[1][1] * W[2][2] - W[1][2] * W[2][1]) - W[0][1] * (W[1][0] * W[2][2] - W[1][2] * W[2][0]) + W[0][2] * (W[1][0] * W[2][1] - W[1][1] * W[2][0])) : 1;
    return { type: 3, name: d < 0 ? FORM_TYPES[3].alt : FORM_TYPES[3].name };
  }
  // offen (Prisma): alle Normalen senkrecht zu einer gemeinsamen Richtung
  let open = false;
  for (let i = 0; i < n && !open; i++) for (let j = i + 1; j < n && !open; j++) {
    const d = cross(normals[i], normals[j]);
    if (norm(d) < 1e-6) continue;
    const u = normalize(d);
    if (normals.every((v) => Math.abs(dot(v, u)) < 1e-6)) open = true;
  }
  if (sys === 'triklin' || sys === 'monoklin') return n === 4 && open ? { type: 6, name: FORM_TYPES[6].name } : null;
  const keys = new Set(hkls.map(hklKey));
  const Hs = latticeOps(HOLOHEDRY[sys]).filter((W) => hkls.every((h) => keys.has(hklKey(transformHKL(W, h)))));
  const eigId = identifyGroup(Hs.map((W) => mul(mul(A0, W), inverse(A0)))).hm;
  const eig = EIG_ALIAS[eigId] || eigId;
  const cands = Object.entries(FORM_TYPES).filter(([t, f]) => f.eig === eig && FACE_COUNT[t] === n && PRISM_TYPES.has(Number(t)) === open);
  if (cands.length === 1) return { type: Number(cands[0][0]), name: cands[0][1].name };
  return null;
}

/** Flächenzahl der 47 Formen (ITA Tab. 10.1.2.3). */
const FACE_COUNT = {
  1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 8, 8: 4, 9: 4, 10: 4, 11: 8, 12: 8, 13: 8, 14: 8, 15: 8, 16: 16,
  17: 3, 18: 3, 19: 6, 20: 6, 21: 6, 22: 6, 23: 6, 24: 6, 25: 6, 26: 12, 27: 12, 28: 12, 29: 12, 30: 12, 31: 12, 32: 24,
  33: 4, 34: 6, 35: 8, 36: 12, 37: 12, 38: 12, 39: 12, 40: 12, 41: 24, 42: 24, 43: 24, 44: 24, 45: 24, 46: 24, 47: 48,
};

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** Ganzzahliges Tripel durch ggT teilen. */
export const reduceInt = (v) => {
  const g = v.reduce((a, x) => gcd(a, Math.round(x)), 0) || 1;
  return v.map((x) => Math.round(x) / g + 0);
};

/** Richtung [uvw] (drei Achsen) → [UVTW] (Miller-Bravais). */
export function dirToFour([u, v, w]) {
  return reduceInt([2 * u - v, 2 * v - u, -(u + v), 3 * w]);
}

/**
 * Zone aus zwei Flächen i, j des Kristalls C (Weiss'sches Zonengesetz).
 * Rückgabe: { uvw, axis (Bildschirm, Einheitsvektor), inZone: [Flächenindizes], angle (Winkel der Pole, Grad),
 *   normalDev (Winkel zwischen Richtung [uvw] und Normale (uvw), Grad) } oder null, wenn die Flächen parallel sind.
 */
export function zoneOf(C, i, j) {
  const h1 = C.faces[i].hkl, h2 = C.faces[j].hkl;
  const raw = cross(h1, h2);
  if (raw.every((x) => Math.abs(x) < 1e-9)) return null;
  let uvw = reduceInt(raw);
  let axis = normalize(mulVec(C.O, mulVec(C.A, uvw)));
  // Darstellung mit der Achse in der oberen Halbkugel
  if (axis[2] < -1e-9 || (Math.abs(axis[2]) <= 1e-9 && (axis[1] < -1e-9 || (Math.abs(axis[1]) <= 1e-9 && axis[0] < 0)))) {
    uvw = uvw.map((x) => -x + 0); axis = scale(axis, -1);
  }
  const inZone = C.faces.map((f, k) => (dot(f.hkl, uvw) === 0 && !f.hidden ? k : -1)).filter((k) => k >= 0);
  const n1 = C.faces[i].normal, n2 = C.faces[j].normal;
  const angle = (Math.acos(Math.max(-1, Math.min(1, dot(n1, n2)))) * 180) / Math.PI;
  const B = transpose(inverse(C.A));
  const planeNormal = normalize(mulVec(C.O, mulVec(B, uvw)));
  const normalDev = (Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(planeNormal, axis))))) * 180) / Math.PI;
  return { uvw, axis, inZone, angle, normalDev, planeNormal };
}
