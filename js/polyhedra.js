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

/**
 * Richtungen, entlang derer der Kristall gestreckt werden kann: je Blickrichtung des Kristallsystems
 * (Positionen des Hermann-Mauguin-Symbols, Borchardt-Ott Tab. 7.3) eine Gitterrichtung [uvw], aber nur
 * dort, wo die Streckung die Symmetrie ändert. Streckungen entlang c (tetragonal, trigonal, hexagonal)
 * und entlang der Achsen orthorhombischer und monokliner Gitter ändern nur Gitterparameter, die das
 * System ohnehin freilässt; sie entfallen (Absprache mit dem Autor, 20.10.2026).
 * Kubisch ⟨100⟩ als [001], damit die verbleibende 4-zählige Achse wie im tetragonalen System ∥ c liegt.
 */
export const STRETCH_DIRS = {
  triklin: [],
  monoklin: [],
  orthorhombisch: [],
  tetragonal: [{ id: '100', uvw: [1, 0, 0], cls: '⟨100⟩' }, { id: '110', uvw: [1, 1, 0], cls: '⟨110⟩' }],
  trigonal: [{ id: '100', uvw: [1, 0, 0], cls: '⟨100⟩' }, { id: '210', uvw: [2, 1, 0], cls: '⟨210⟩' }],
  hexagonal: [{ id: '100', uvw: [1, 0, 0], cls: '⟨100⟩' }, { id: '210', uvw: [2, 1, 0], cls: '⟨210⟩' }],
  kubisch: [{ id: '001', uvw: [0, 0, 1], cls: '⟨100⟩' }, { id: '111', uvw: [1, 1, 1], cls: '⟨111⟩' }, { id: '110', uvw: [1, 1, 0], cls: '⟨110⟩' }],
};
/** Gültige Streckrichtung eines Systems (sonst die erste). */
export const stretchDir = (sys, id) => STRETCH_DIRS[sys].find((d) => d.id === id) || STRETCH_DIRS[sys][0] || null;

/**
 * Streckung des Gitters um den Faktor s entlang der Gitterrichtung uvw: r → r + (s − 1)(r·n)n.
 * Die Flächen einer Form liegen in Bruchkoordinaten fest (h·x = t), der Körper wird daher affin mitgestreckt.
 */
export function stretchLattice(A, uvw, s) {
  const n = normalize(mulVec(A, uvw));
  const S = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? 1 : 0) + (s - 1) * n[i] * n[j]));
  return mul(S, A);
}

/** Gitterparameter (a = 1, b/a, c/a, α, β, γ) einer Gittermatrix. */
export function paramsOfLattice(A) {
  const [a, b, c] = [0, 1, 2].map((j) => [A[0][j], A[1][j], A[2][j]]);
  const ang = (u, w) => Math.acos(Math.max(-1, Math.min(1, dot(u, w) / (norm(u) * norm(w))))) / deg;
  return { ba: norm(b) / norm(a), ca: norm(c) / norm(a), al: ang(b, c), be: ang(a, c), ga: ang(a, b) };
}

/**
 * Hexagonale Achsen einer trigonalen Restgruppe mit 3 ∥ [uvw] (u, v, w = ±1) im kubischen Gitter
 * (rhomboedrische Basis a_R, b_R, c_R = ±a, ±b, ±c mit a_R + b_R + c_R = [uvw]):
 * a₁ = a_R − b_R, a₂ = b_R − c_R, c = a_R + b_R + c_R (obverse Aufstellung). Für [111]:
 * c ∥ [111], a₁ ∥ [11̄0], a₂ ∥ [011̄]; der Würfel {100} wird zum Rhomboeder {101} = {101̄1}.
 * Rückgabe: { a1, a2, c (kubische Richtungen), toHex(hkl) → (hkl) in hexagonalen Achsen } oder null.
 */
export function hexSettingOf(uvw) {
  if (!uvw || !uvw.every((x) => Math.abs(x) === 1)) return null;
  let R = [[uvw[0], 0, 0], [0, uvw[1], 0], [0, 0, uvw[2]]];
  // linkshändige Basis (ungerade Zahl negativer Komponenten): b_R und c_R tauschen
  if (uvw[0] * uvw[1] * uvw[2] < 0) R = [R[0], R[2], R[1]];
  const a1 = sub(R[0], R[1]), a2 = sub(R[1], R[2]), c = add(add(R[0], R[1]), R[2]);
  return { a1, a2, c, toHex: (h) => reduceInt([dot(h, a1), dot(h, a2), dot(h, c)]) };
}

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
 * Ergänzt eine offene Form (oder Kombination) durch Formen derselben Punktgruppe, bis das Polyeder
 * geschlossen ist. basePlanes: Ebenen der vorhandenen Formen. Rückgabe: [{hkls}]
 */
function closeForm(basePlanes, Ws, B, tAux) {
  const used = new Set(basePlanes.map((p) => hklKey(p.hkl)));
  const aux = [];
  const planesOf = (list, t, role) => list.map((h) => ({ hkl: h, n: mulVec(B, h), t, role }));
  for (let iter = 0; iter < 8; iter++) {
    const planes = [...basePlanes, ...aux.flatMap((a) => planesOf(a.hkls, tAux, 'aux')), ...boxPlanes()];
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

/** Orientierungsvorgaben (Projektionsrichtungen). name: Richtung ∥ Projektionsrichtung (Anzeige unter „Projektionsrichtung“);
 *  z: Projektionsrichtung [uvw], x: Richtung nach unten (oder null: ⊥ b). */
export function orientationPresets(sys) {
  if (sys === 'kubisch') {
    return [
      { id: '001', name: '[001]', z: [0, 0, 1], x: [1, 0, 0] },
      { id: '111', name: '[111]', z: [1, 1, 1], x: [1, 1, -2] },
      { id: '110', name: '[110]', z: [1, 1, 0], x: [0, 0, -1] },
    ];
  }
  return [
    { id: 'c', name: 'c', z: [0, 0, 1], x: null },
    { id: 'a', name: 'a (c liegt)', z: [1, 0, 0], x: [0, 0, -1] },
    { id: 'b', name: 'b (c liegt)', z: [0, 1, 0], x: [0, 0, -1] },
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
  const out = [];
  const done = new Set();
  // je Form und (bei erniedrigter Symmetrie) je Teilform eine Keimfläche: die Restoperationen erreichen
  // die übrigen Teilformen nicht
  for (const f0 of faces) {
    const key = `${f0.form || 0}:${f0.orbit || 0}`;
    if (f0.role !== 'main' || done.has(key)) continue;
    done.add(key);
    out.push(...motifsOn(f0, ops));
  }
  return out;
}

function motifsOn(f0, ops) {
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
 * Beispielkristall (Kombination): statt entryId { groupId, forms: [{hkl, r | t}] };
 * r: Zentralabstand der Flächen, t: Abschnittsform h·x + k·y + l·z = t (Bruchkoordinaten).
 */
export function buildCrystal(params) {
  const combo = params.forms && params.forms.length ? params.forms : null;
  const entry = combo ? null : entryById(params.entryId);
  const groupId = combo ? params.groupId : entry.pg;
  const sys = SYSTEM_OF[groupId];
  const hex = isHexSystem(sys);
  const lat0 = params.broken ? { ...params.lat } : constrainLattice(params.lat, sys);
  // Streckung entlang einer Blickrichtung (nur wirksam, wenn s ≠ 1)
  const st = params.stretch && params.stretch.uvw && Math.abs(params.stretch.s - 1) > 1e-9 ? params.stretch : null;
  const A = st ? stretchLattice(latticeFromParams(lat0), st.uvw, st.s) : latticeFromParams(lat0);
  const lat = st ? paramsOfLattice(A) : lat0;
  const Ai = inverse(A);
  const B = transpose(Ai);
  const M = mul(transpose(A), A);

  const Ws = latticeOps(groupId);
  // Formen: eine (Katalog) oder mehrere (Beispielkristall); doppelte Bahnen werden übersprungen
  const formList = [];
  const taken = new Set();
  for (const f of combo || [{ hkl: entry.hkl, t: 1 }]) {
    const hkls = hklOrbit(Ws, f.hkl);
    if (hkls.some((h) => taken.has(hklKey(h)))) continue;
    hkls.forEach((h) => taken.add(hklKey(h)));
    formList.push({ hkls, rep: f.hkl, tOf: (h) => (f.t != null ? f.t : f.r * norm(mulVec(B, h))) });
  }
  const mainHKL = formList[0].hkls;
  const tAux = params.auxDist ?? 1;
  const formPlanes = formList.flatMap((F, fi) => F.hkls.map((h) => ({ hkl: h, n: mulVec(B, h), t: F.tOf(h), role: 'main', form: fi })));
  const auxForms = closeForm(formPlanes, Ws, B, tAux);

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
    ...formPlanes.map((p) => ({ ...p, orbit: p.form === 0 ? orbitIndex.get(hklKey(p.hkl)) : 0 })),
    ...auxForms.flatMap((a, ai) => a.hkls.map((h) => ({ hkl: h, n: mulVec(B, h), t: tAux, role: 'aux', aux: ai }))),
  ];
  const poly = intersectHalfspaces(planes);

  const presets = orientationPresets(sys);
  const preset = presets.find((p) => p.id === params.presetId) || presets[0];
  const O = orientationMatrix(A, preset);
  const Ot = transpose(O);

  const cen = scale(poly.verts.reduce((s, v) => add(s, v), [0, 0, 0]), 1 / Math.max(1, poly.verts.length));
  // Grösse nach dem Volumen; sehr gestreckte Körper zusätzlich so begrenzt, dass sie nicht weit aus der Kugel ragen
  const maxR = Math.max(1e-9, ...poly.verts.map((v) => norm(sub(v, cen))));
  const sc = Math.min(poly.volume > 1e-9 ? 1 / Math.cbrt(poly.volume) : 1, 1.3 / maxR);
  const tr = (v) => mulVec(O, scale(sub(v, cen), sc));
  const faces = poly.faces.map((f) => ({
    hkl: f.hkl, role: f.role, orbit: f.orbit, aux: f.aux, form: f.form,
    normal: normalize(mulVec(O, f.u)),
    verts: f.verts.map(tr),
    center: tr(f.center),
  }));
  // Flächen der Hauptform, die durch Ergänzungsformen ganz weggeschnitten wurden (sollte nicht vorkommen)
  const lostMain = mainHKL.length - faces.filter((f) => f.role === 'main' && f.form === 0).length;

  const axes = [
    { name: hex ? 'a₁' : 'a', dir: normalize(mulVec(O, mulVec(A, [1, 0, 0]))) },
    { name: hex ? 'a₂' : 'b', dir: normalize(mulVec(O, mulVec(A, [0, 1, 0]))) },
    { name: 'c', dir: normalize(mulVec(O, mulVec(A, [0, 0, 1]))) },
  ];
  if (hex && !params.broken && !isReduced) axes.push({ name: 'a₃', dir: normalize(mulVec(O, mulVec(A, [-1, -1, 0]))) });

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

  // Trigonale Restgruppe eines kubischen Kristalls (3 ∥ ⟨111⟩): Indizes in hexagonalen Achsen, Formnamen
  let hexSetting = null;
  if (sys === 'kubisch' && reducedAxis && (reducedAxis.symbol === '3' || reducedAxis.symbol === '-3')) {
    const hs = hexSettingOf(reducedAxis.uvw);
    if (hs) {
      const len = (u) => norm(mulVec(A, u));
      hexSetting = {
        ...hs, ca: len(hs.c) / len(hs.a1),
        orbits: orbitsMain.map((o) => {
          const hkls = o.map(hs.toHex);
          const n = auxFormName('-3m1', hkls);
          return { rep: canonicalRep(hkls), name: n ? n.name : null };
        }),
      };
    }
  }

  const zones = sys === 'kubisch'
    ? [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]].map((h) => normalize(mulVec(O, mulVec(B, h))))
    : [];

  return {
    entry, groupId, sys, hex, lat, A, O, faces, axes, preset, presets, zones,
    stretched: !!st, stretch: st, hexSetting,
    mainHKL, auxForms, lostMain,
    isReduced, reduced, reducedAxis, orbitsMain: orbitsMain.map((o) => ({ hkls: o, rep: canonicalRep(o) })),
    framework: groupScreen, motifs, latOps: Wred,
    motifsPerFace: Wred.length / Math.max(1, orbitsMain[0].length),
    auxReps: auxForms.map((a) => ({ hkls: a.hkls, rep: canonicalRep(a.hkls) })),
    forms: formList.map((F, fi) => ({ hkls: F.hkls, rep: F.rep, present: faces.filter((f) => f.role === 'main' && f.form === fi).length })),
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
 * Zone aus zwei Flächen i, j des Kristalls C (Zonengleichung hu + kv + lw = 0).
 * Rückgabe: { uvw, axis (Bildschirm, Einheitsvektor), inZone: [Flächenindizes], angle (Winkel der Pole, Grad),
 *   normalDev (Winkel zwischen Richtung [uvw] und Normale (uvw), Grad) } oder null, wenn die Flächen parallel sind.
 */
export function zoneOf(C, i, j) {
  const h1 = C.faces[i].hkl, h2 = C.faces[j].hkl;
  const raw = cross(h1, h2);
  if (raw.every((x) => Math.abs(x) < 1e-9)) return null;
  const z = zoneByUvw(C, raw);
  const n1 = C.faces[i].normal, n2 = C.faces[j].normal;
  z.angle = (Math.acos(Math.max(-1, Math.min(1, dot(n1, n2)))) * 180) / Math.PI;
  return z;
}

/**
 * Zone zur Richtung [uvw] (ganzzahlig, beliebiges Vorzeichen): Achse in der oberen Halbkugel,
 * sichtbare Flächen der Zone, Abweichung zwischen Richtung [uvw] und Normale (uvw).
 */
export function zoneByUvw(C, raw) {
  let uvw = reduceInt(raw);
  let axis = normalize(mulVec(C.O, mulVec(C.A, uvw)));
  // Darstellung mit der Achse in der oberen Halbkugel
  if (axis[2] < -1e-9 || (Math.abs(axis[2]) <= 1e-9 && (axis[1] < -1e-9 || (Math.abs(axis[1]) <= 1e-9 && axis[0] < 0)))) {
    uvw = uvw.map((x) => -x + 0); axis = scale(axis, -1);
  }
  const inZone = C.faces.map((f, k) => (dot(f.hkl, uvw) === 0 && !f.hidden ? k : -1)).filter((k) => k >= 0);
  const B = transpose(inverse(C.A));
  const planeNormal = normalize(mulVec(C.O, mulVec(B, uvw)));
  const normalDev = (Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(planeNormal, axis))))) * 180) / Math.PI;
  return { uvw, key: zoneKey(uvw), axis, inZone, normalDev, planeNormal };
}

/** Schlüssel einer Zone unabhängig von der Lage: teilerfremd, erste von null verschiedene Komponente positiv. */
export function zoneKey(raw) {
  const u = reduceInt(raw);
  const s = u.find((x) => x !== 0) < 0 ? -1 : 1;
  return u.map((x) => s * x + 0).join(',');
}

/** Mindestzahl der Flächen einer Zone (Borchardt-Ott & Sowa, Abschn. 5.2: drei oder mehr Flächen mit parallelen Kanten). */
export const ZONE_MIN_FACES = 3;

/**
 * Alle Zonen des dargestellten Kristalls mit mindestens ZONE_MIN_FACES sichtbaren Flächen, gruppiert nach
 * symmetrisch gleichwertigen Zonenachsen (Operationen der wirksamen Punktgruppe, Richtung und Gegenrichtung gleich).
 * Rückgabe: [{ rep: [u,v,w], zones: [zone…], faces: Flächen je Zone }], nach Flächenzahl und Indexgrösse sortiert.
 */
export function zonesOf(C) {
  const vis = C.faces.map((f, i) => ({ f, i })).filter(({ f }) => !f.hidden);
  const byKey = new Map();
  for (let a = 0; a < vis.length; a++) {
    for (let b = a + 1; b < vis.length; b++) {
      const raw = cross(vis[a].f.hkl, vis[b].f.hkl);
      if (raw.every((x) => x === 0)) continue;
      const u = reduceInt(raw);
      const k1 = u.join(','), k2 = u.map((x) => -x + 0).join(',');
      if (byKey.has(k1) || byKey.has(k2)) continue;
      const z = zoneByUvw(C, u);
      byKey.set(z.key, z);
    }
  }
  const zones = [...byKey.values()].filter((z) => z.inZone.length >= ZONE_MIN_FACES);
  // Klassen: Bahn der Richtung unter den Gitteroperationen (Richtungen transformieren mit W)
  const keyOf = (u) => { const v = reduceInt(u); const w = v.map((x) => -x + 0); return [v.join(','), w.join(',')]; };
  const classOf = new Map();
  const classes = [];
  for (const z of zones) {
    if (classOf.has(z.key)) continue;
    const orbit = new Set();
    for (const W of C.latOps) for (const k of keyOf(mulVec(W, z.uvw).map((x) => Math.round(x)))) orbit.add(k);
    const members = zones.filter((y) => orbit.has(y.key));
    members.forEach((y) => classOf.set(y.key, classes.length));
    // Repräsentant: möglichst wenige negative Indizes, dann die grössten Indizes vorn (⟨100⟩, ⟨110⟩, ⟨211⟩)
    const neg = (u) => u.filter((x) => x < 0).length;
    const desc = (p, q) => (q[0] - p[0]) || (q[1] - p[1]) || (q[2] - p[2]);
    const rep = members.map((y) => y.uvw).sort((p, q) => neg(p) - neg(q) || desc(p, q))[0];
    classes.push({ rep, zones: members, faces: z.inZone.length });
  }
  const size = (u) => u.reduce((s, x) => s + Math.abs(x), 0);
  classes.sort((p, q) => q.faces - p.faces || size(p.rep) - size(q.rep));
  return classes;
}

/**
 * Habitus nach Borchardt-Ott & Sowa (Kristallographie, Abschn. 5.2): drei Grundtypen
 * isometrisch, planar oder taflig, prismatisch oder nadelig.
 * Bestimmt aus dem Trägheitstensor (zweite Momente) des Kristallkörpers: Hauptausdehnungen
 * L = √(12 λ) (bei einem Quader genau die Kantenlängen), L₁ ≥ L₂ ≥ L₃. Kubische Formen haben
 * einen isotropen Tensor und sind damit stets isometrisch. Grenze 2/3 (wie bei Zingg).
 * faces: [{verts:[[x,y,z],…]}] eines geschlossenen konvexen Polyeders.
 */
export const HABIT_LIMIT = 2 / 3;
export function habitOf(faces) {
  // Zerlegung in Tetraeder (Bezugspunkt: Mittel der Ecken), Volumen, Schwerpunkt, zweite Momente
  const all = faces.flatMap((f) => f.verts);
  if (all.length < 4) return null;
  const o = all.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]).map((x) => x / all.length);
  let V = 0;
  const S = [0, 0, 0];
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const f of faces) {
    const p = f.verts.map((v) => [v[0] - o[0], v[1] - o[1], v[2] - o[2]]);
    for (let j = 1; j < p.length - 1; j++) {
      const a = p[0], b = p[j], c = p[j + 1];
      const vol = Math.abs(a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
      if (vol < 1e-12) continue;
      V += vol;
      const sum = [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]];
      for (let i = 0; i < 3; i++) {
        S[i] += (vol / 4) * sum[i];
        for (let k = 0; k < 3; k++) M[i][k] += (vol / 20) * (a[i] * a[k] + b[i] * b[k] + c[i] * c[k] + sum[i] * sum[k]);
      }
    }
  }
  if (V < 1e-12) return null;
  const cen = S.map((x) => x / V);
  const C = M.map((r, i) => r.map((x, k) => x / V - cen[i] * cen[k]));
  const L = jacobiEigen(C).map((l) => Math.sqrt(12 * Math.max(0, l))).sort((x, y) => y - x);
  const e = L[1] / L[0], p = L[2] / L[1];
  // isometrisch nur, wenn auch L₃/L₁ ≥ 2/3 (daraus folgen L₂/L₁ ≥ 2/3 und L₃/L₂ ≥ 2/3); sonst
  // prismatisch (eine Richtung lang) oder planar (eine Richtung kurz), bei Zweifel entscheidet das kleinere Verhältnis
  let type;
  if (L[2] / L[0] >= HABIT_LIMIT) type = 'isometrisch';
  else if (e < HABIT_LIMIT && p >= HABIT_LIMIT) type = 'prismatisch';
  else if (e >= HABIT_LIMIT && p < HABIT_LIMIT) type = 'planar';
  else type = e < p ? 'prismatisch' : 'planar';
  return { type, L, e, p };
}

/** Eigenwerte einer symmetrischen 3×3-Matrix (Jacobi-Verfahren). */
function jacobiEigen(A) {
  const a = A.map((r) => r.slice());
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) off += a[i][j] * a[i][j];
    if (off < 1e-20) break;
    for (let pI = 0; pI < 2; pI++) {
      for (let q = pI + 1; q < 3; q++) {
        if (Math.abs(a[pI][q]) < 1e-15) continue;
        const th = (a[q][q] - a[pI][pI]) / (2 * a[pI][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < 3; k++) {
          const akp = a[k][pI], akq = a[k][q];
          a[k][pI] = c * akp - s * akq; a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 3; k++) {
          const apk = a[pI][k], aqk = a[q][k];
          a[pI][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk;
        }
      }
    }
  }
  return [a[0][0], a[1][1], a[2][2]];
}
