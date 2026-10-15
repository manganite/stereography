// Einfache Kristallpolyeder als Schnitt von Halbräumen G·r ≤ t.
// G = h a* + k b* + l c* (reziproker Gittervektor) ist die Flächennormale.

import {
  fromColumns, inverse, transpose, mulVec, dot, cross, normalize, scale, add, sub, norm,
  solve3, vecEq, fromRows,
} from './linalg.js';
import { buildPointGroup } from './pointgroups.js';

const S3 = Math.sqrt(3);

/** Gittermatrix (Spalten a, b, c) im kartesischen System nach ITA-Orientierung. */
export function latticeMatrix(lat) {
  if (lat.hex) {
    return fromColumns([lat.a * S3 / 2, -lat.a / 2, 0], [0, lat.a, 0], [0, 0, lat.c]);
  }
  return fromColumns([lat.a, 0, 0], [0, lat.b, 0], [0, 0, lat.c]);
}
/** Reziproke Matrix: G = B·(h,k,l). */
export const reciprocalMatrix = (A) => transpose(inverse(A));

/**
 * Formen. kind: 'cubic' | 'hex' | 'nfold'.
 * Für 'nfold' werden Zähligkeit n (3, 4, 6) und eine Startfläche gewählt.
 */
export const FORMS = [
  { id: 'wuerfel', name: 'Würfel / Quader', kind: 'cubic', group: 'm-3m', seed: [1, 0, 0] },
  { id: 'oktaeder', name: 'Oktaeder / Dipyramide', kind: 'cubic', group: 'm-3m', seed: [1, 1, 1] },
  { id: 'tetraeder', name: 'Tetraeder', kind: 'cubic', group: '23', seed: [1, 1, 1] },
  { id: 'rhombendodekaeder', name: 'Rhombendodekaeder', kind: 'cubic', group: 'm-3m', seed: [1, 1, 0] },
  { id: 'rhomboeder', name: 'Rhomboeder', kind: 'hex', group: '-3', seed: [1, 0, 1] },
  { id: 'prisma', name: 'Prisma', kind: 'nfold', type: 'prisma' },
  { id: 'pyramide', name: 'Pyramide', kind: 'nfold', type: 'pyramide' },
  { id: 'dipyramide', name: 'Dipyramide', kind: 'nfold', type: 'dipyramide' },
];

/** Startflächen (Varianten) für n-zählige Formen. */
export function nfoldVariants(type, n) {
  const hex = n !== 4;
  if (type === 'prisma') return hex ? [[1, 0, 0], [1, 1, 0]] : [[1, 0, 0], [1, 1, 0]];
  return hex ? [[1, 0, 1], [1, 1, 2]] : [[1, 0, 1], [1, 1, 1]];
}

function groupFor(form, n) {
  if (form.kind !== 'nfold') return form.group;
  if (form.type === 'dipyramide') return { 3: '-6', 4: '4/m', 6: '6/m' }[n];
  return String(n);
}

/** Erzeugt die (hkl)-Menge einer Form durch Anwenden der (idealen) Symmetrie. */
function generateHKL(seed, groupId, hex) {
  const A0 = latticeMatrix(hex ? { hex: true, a: 1, c: 1 } : { a: 1, b: 1, c: 1 });
  const B0 = reciprocalMatrix(A0);
  const A0T = transpose(A0);
  const g = buildPointGroup(groupId);
  const G0 = mulVec(B0, seed);
  const out = [];
  for (const m of g.ops) {
    const hkl = mulVec(A0T, mulVec(m, G0)).map((x) => Math.round(x * 1e6) / 1e6);
    if (!out.some((o) => vecEq(o, hkl))) out.push(hkl.map((x) => Math.round(x) + 0));
  }
  return out;
}

/** Orientierungsvorgaben ("Lagen"). z: Blickrichtung [uvw], x: Richtung nach unten (Hinweis). */
export function orientationPresets(form) {
  if (form.kind === 'cubic') {
    return [
      { id: '001', name: '[001] ∥ Blickrichtung', z: [0, 0, 1], x: [1, 0, 0] },
      { id: '111', name: '[111] ∥ Blickrichtung', z: [1, 1, 1], x: [1, 1, -2] },
      { id: '110', name: '[110] ∥ Blickrichtung', z: [1, 1, 0], x: [0, 0, -1] },
    ];
  }
  // hexagonal: x-Hinweis [210] ⊥ b, damit b wie in ITA nach rechts zeigt
  const hexo = form.kind === 'hex' || form.kind === 'nfold';
  return [
    { id: 'c', name: 'c ∥ Blickrichtung', z: [0, 0, 1], x: hexo ? null : [1, 0, 0] },
    { id: 'a', name: 'a ∥ Blickrichtung (c liegt)', z: [1, 0, 0], x: [0, 0, -1] },
  ];
}

/** Orientierungsmatrix O (Zeilen: Bildschirmachsen x↓, y→, z⊙ im Kristallsystem). */
export function orientationMatrix(A, preset) {
  const zc = normalize(mulVec(A, preset.z));
  // ohne x-Hinweis: x ⊥ b (so zeigt b nach rechts, wie in ITA)
  let xc = preset.x ? mulVec(A, preset.x) : cross(mulVec(A, [0, 1, 0]), zc);
  xc = normalize(sub(xc, scale(zc, dot(xc, zc))));
  const yc = cross(zc, xc);
  return fromRows(xc, yc, zc);
}

/** Halbraumschnitt → Ecken und Flächen. planes: [{n (nicht normiert), t, ...}] */
export function intersectHalfspaces(planes) {
  const P = planes.map((p) => {
    const l = norm(p.n);
    return { ...p, u: scale(p.n, 1 / l), d: p.t / l };
  });
  const verts = [];
  const tol = 1e-7;
  for (let i = 0; i < P.length; i++)
    for (let j = i + 1; j < P.length; j++)
      for (let k = j + 1; k < P.length; k++) {
        const x = solve3(fromRows(P[i].u, P[j].u, P[k].u), [P[i].d, P[j].d, P[k].d]);
        if (!x) continue;
        if (P.every((p) => dot(p.u, x) <= p.d + 1e-6) && !verts.some((v) => vecEq(v, x, 1e-6))) verts.push(x);
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
    // Fläche
    let area = 0;
    for (let i = 0; i < on.length; i++) area += dot(cross(sub(on[i], c), sub(on[(i + 1) % on.length], c)), p.u) / 2;
    if (area < tol) continue;
    faces.push({ ...p, verts: on, center: c, area });
  }
  const volume = faces.reduce((s, f) => s + (f.area * f.d) / 3, 0);
  return { verts, faces, volume };
}

/**
 * Baut ein Polyeder.
 * params: { formId, n, variant, ratios: {ba, ca}, height, presetId }
 */
export function buildPolyhedron(params) {
  const form = FORMS.find((f) => f.id === params.formId);
  const n = params.n || 4;
  const hex = form.kind === 'hex' || (form.kind === 'nfold' && n !== 4);
  const lat = hex
    ? { hex: true, a: 1, c: params.ratios.ca }
    : form.kind === 'cubic'
      ? { a: 1, b: params.ratios.ba, c: params.ratios.ca }
      : { a: 1, b: 1, c: params.ratios.ca };
  if (form.kind === 'nfold' && form.type === 'prisma') lat.c = 1;
  const A = latticeMatrix(lat);
  const B = reciprocalMatrix(A);

  let seed = form.seed;
  if (form.kind === 'nfold') seed = nfoldVariants(form.type, n)[params.variant || 0];
  const hkls = generateHKL(seed, groupFor(form, n), hex);
  const planes = hkls.map((hkl) => ({ hkl, n: mulVec(B, hkl), t: 1, form: 'main' }));
  if (form.kind === 'nfold') {
    if (form.type === 'prisma') {
      const H = params.height ?? 1.5; // Höhe in Einheiten von a
      planes.push({ hkl: [0, 0, 1], n: mulVec(B, [0, 0, 1]), t: H / 2, form: 'pinakoid' });
      planes.push({ hkl: [0, 0, -1], n: mulVec(B, [0, 0, -1]), t: H / 2, form: 'pinakoid' });
    } else if (form.type === 'pyramide') {
      planes.push({ hkl: [0, 0, -1], n: mulVec(B, [0, 0, -1]), t: 0, form: 'pedion' });
    }
  }
  const poly = intersectHalfspaces(planes);

  const presets = orientationPresets(form);
  const preset = presets.find((p) => p.id === params.presetId) || presets[0];
  const O = orientationMatrix(A, preset);

  // Zentrieren (Schwerpunkt der Ecken) und auf Volumen normieren
  const cen = scale(poly.verts.reduce((s, v) => add(s, v), [0, 0, 0]), 1 / poly.verts.length);
  const sc = 1 / Math.cbrt(poly.volume);
  const tr = (v) => mulVec(O, scale(sub(v, cen), sc));
  const faces = poly.faces.map((f) => ({
    hkl: f.hkl,
    form: f.form,
    normal: normalize(mulVec(O, f.u)),
    verts: f.verts.map(tr),
    center: tr(f.center),
  }));
  const axes = [
    { name: hex ? 'a₁' : 'a', dir: normalize(mulVec(O, mulVec(A, [1, 0, 0]))) },
    { name: hex ? 'a₂' : 'b', dir: normalize(mulVec(O, mulVec(A, [0, 1, 0]))) },
    { name: 'c', dir: normalize(mulVec(O, mulVec(A, [0, 0, 1]))) },
  ];
  if (hex) axes.push({ name: 'a₃', dir: normalize(mulVec(O, mulVec(A, [-1, -1, 0]))) });
  return {
    form, hex, lat, faces, verts: poly.verts.map(tr), axes, preset, presets,
    formSymbol: seed, faceCount: faces.length,
  };
}
