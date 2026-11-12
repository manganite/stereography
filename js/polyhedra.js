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
import { buildPointGroup, analyzeGroup, POINT_GROUPS } from './pointgroups.js';
import { entryById } from './forms.js';
import { FORM_TYPES, FACE_COUNT, PRISMEN, EIG_SCHREIBWEISE } from './formen.js';

/** @import { Vec3, Mat3, Richtung, Normale } from '../lib/common/js/typen.js' */
/** @import { Analyse } from './pointgroups.js' */
/** @import { Formeintrag } from './forms.js' */
/** Gitterparameter: a = 1, b/a, c/a, Winkel α, β, γ in Grad. @typedef {{ ba: number, ca: number, al: number, be: number, ga: number }} Gitterparameter */
/** Streckrichtung eines Systems. @typedef {{ id: string, uvw: Richtung, cls: string }} Streckrichtung */
/** Projektionsrichtung: z ∥ Projektionsrichtung, x nach unten (null: ⊥ b). @typedef {{ id: string, name: string, z: Richtung, x: Richtung | null }} Orientierung */
/**
 * Halbraum G·r ≤ t (G = n). hkl: Indizes der Fläche (fehlen beim Hilfswürfel), role: Hauptform, Ergänzungsform
 * oder Hilfswürfel; form, orbit, aux: Nummer der Form, der Teilform bzw. der Ergänzungsform.
 * @typedef {{ hkl?: Normale, n: Vec3, t: number, role: string, form?: number, orbit?: number, aux?: number }} Halbraum
 */
/**
 * Fläche des Kristalls in Bildschirmkoordinaten. hidden setzt die Anzeige (scene.js).
 * @typedef {{ hkl: Normale, role: string, orbit?: number, aux?: number, form?: number, normal: Vec3, verts: Vec3[], center: Vec3, hidden?: boolean }} Kristallflaeche
 */
/**
 * Zone: Zonenachse [uvw], Schlüssel, Achse (Bildschirm), Flächen der Zone, Abweichung Richtung/Normale (Grad),
 * Normale der Netzebene (uvw); angle: Winkel der beiden Pole, aus denen die Zone bestimmt wurde (Grad).
 * @typedef {{ uvw: Richtung, key: string, axis: Vec3, inZone: number[], normalDev: number, planeNormal: Vec3, angle?: number }} Zone
 */
/**
 * Angaben für buildCrystal: Katalogeintrag (entryId) oder Beispielkristall (groupId, forms mit Zentralabstand r
 * bzw. Abschnitt t).
 * @typedef {object} Kristallparameter
 * @property {string} [entryId]
 * @property {string} [groupId]
 * @property {{ hkl: Normale, r?: number, t?: number }[]} [forms]
 * @property {Partial<Gitterparameter>} lat
 * @property {boolean} [broken]
 * @property {number} [auxDist]
 * @property {string | null} [presetId]
 * @property {{ uvw: Richtung, s: number } | null} [stretch]
 */
/** Kristall, wie ihn buildCrystal liefert. @typedef {ReturnType<typeof buildCrystal>} Kristall */

const deg = Math.PI / 180;
/** Gitterrichtung [uvw] (das Array [u, v, w], gekennzeichnet für die Typprüfung). @param {number} u @param {number} v @param {number} w @returns {Richtung} */
const richtung = (u, v, w) => /** @type {Richtung} */ ([u, v, w]);

/** @type {Record<string, string>} */
export const SYSTEM_OF = Object.fromEntries(POINT_GROUPS.map((g) => [g.id, g.system]));
const HEX_SYSTEMS = new Set(['trigonal', 'hexagonal']);
/** @param {string} sys */
export const isHexSystem = (sys) => HEX_SYSTEMS.has(sys);

/** Gittersymmetrie je System, trigonal mit hexagonalen Achsen (für Kandidaten der Restsymmetrie). @type {Record<string, string>} */
const HOLOHEDRY = { triklin: '-1', monoklin: '2/mb', orthorhombisch: 'mmm', tetragonal: '4/mmm', trigonal: '6/mmm', hexagonal: '6/mmm', kubisch: 'm-3m' };

/** Voreinstellungen der Gitterparameter je System (a = 1). @type {Record<string, Gitterparameter>} */
export const LATTICE_DEFAULTS = {
  triklin: { ba: 1.15, ca: 0.9, al: 82, be: 104, ga: 96 },
  monoklin: { ba: 1.2, ca: 0.85, al: 90, be: 105, ga: 90 },
  orthorhombisch: { ba: 1.25, ca: 0.8, al: 90, be: 90, ga: 90 },
  tetragonal: { ba: 1, ca: 1.3, al: 90, be: 90, ga: 90 },
  trigonal: { ba: 1, ca: 1.1, al: 90, be: 90, ga: 120 },
  hexagonal: { ba: 1, ca: 1.1, al: 90, be: 90, ga: 120 },
  kubisch: { ba: 1, ca: 1, al: 90, be: 90, ga: 90 },
};

/** Welche Parameter das System freilässt. @type {Record<string, (keyof Gitterparameter)[]>} */
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
 * Bereiche der Gitterparameter in Reglern, Link und Speicher (#100, #106, Entscheidung Thomas 8.11.2026).
 * Unverzerrt: b/a 0,4–3, c/a 0,25–3, Winkel 60–150°. Mit Symmetriebruch (Streckung und „Alle Parameter frei“) weiter, sodass jede Streckung
 * eines unverzerrten Gitters mit s = 0,5 … 2 hineinpasst: c/a bis 0,25 / 2 bzw. 3 · 2 (Streckung ⊥ c), γ bis
 * 53,13° (⟨110⟩, s = 2). „Alle Parameter frei“ übernimmt das gestreckte Gitter, ohne dass es springt.
 * @type {{ unverzerrt: Record<keyof Gitterparameter, [number, number]>, frei: Record<keyof Gitterparameter, [number, number]> }}
 */
export const GITTER_BEREICH = {
  unverzerrt: { ba: [0.4, 3], ca: [0.25, 3], al: [60, 150], be: [60, 150], ga: [60, 150] },
  frei: { ba: [0.4, 3], ca: [0.125, 6], al: [50, 150], be: [50, 150], ga: [50, 150] },
};

/**
 * Richtungen, entlang derer der Kristall gestreckt werden kann: je Blickrichtung des Kristallsystems
 * (Positionen des Hermann-Mauguin-Symbols, Borchardt-Ott Tab. 7.3) eine Gitterrichtung [uvw], aber nur
 * dort, wo die Streckung die Symmetrie ändert. Streckungen entlang c (tetragonal, trigonal, hexagonal)
 * und entlang der Achsen orthorhombischer und monokliner Gitter ändern nur Gitterparameter, die das
 * System ohnehin freilässt; sie entfallen (Absprache mit dem Autor, 20.10.2026).
 * Kubisch ⟨100⟩ als [001], damit die verbleibende 4-zählige Achse wie im tetragonalen System ∥ c liegt.
 * @type {Record<string, Streckrichtung[]>}
 */
export const STRETCH_DIRS = {
  triklin: [],
  monoklin: [],
  orthorhombisch: [],
  tetragonal: [{ id: '100', uvw: richtung(1, 0, 0), cls: '⟨100⟩' }, { id: '110', uvw: richtung(1, 1, 0), cls: '⟨110⟩' }],
  trigonal: [{ id: '100', uvw: richtung(1, 0, 0), cls: '⟨100⟩' }, { id: '210', uvw: richtung(2, 1, 0), cls: '⟨210⟩' }],
  hexagonal: [{ id: '100', uvw: richtung(1, 0, 0), cls: '⟨100⟩' }, { id: '210', uvw: richtung(2, 1, 0), cls: '⟨210⟩' }],
  kubisch: [{ id: '001', uvw: richtung(0, 0, 1), cls: '⟨100⟩' }, { id: '111', uvw: richtung(1, 1, 1), cls: '⟨111⟩' }, { id: '110', uvw: richtung(1, 1, 0), cls: '⟨110⟩' }],
};
/** Gültige Streckrichtung eines Systems (sonst die erste). @param {string} sys @param {string} id */
export const stretchDir = (sys, id) => STRETCH_DIRS[sys].find((d) => d.id === id) || STRETCH_DIRS[sys][0] || null;

/**
 * Streckung des Gitters um den Faktor s entlang der Gitterrichtung uvw: r → r + (s − 1)(r·n)n.
 * Die Flächen einer Form liegen in Bruchkoordinaten fest (h·x = t), der Körper wird daher affin mitgestreckt.
 * @param {Mat3} A @param {Richtung} uvw @param {number} s
 */
export function stretchLattice(A, uvw, s) {
  const n = normalize(mulVec(A, uvw));
  const S = /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? 1 : 0) + (s - 1) * n[i] * n[j])));
  return mul(S, A);
}

/** Gitterparameter (a = 1, b/a, c/a, α, β, γ) einer Gittermatrix. @param {Mat3} A @returns {Gitterparameter} */
export function paramsOfLattice(A) {
  const [a, b, c] = [0, 1, 2].map((j) => /** @type {Vec3} */ ([A[0][j], A[1][j], A[2][j]]));
  /** @param {Vec3} u @param {Vec3} w */
  const ang = (u, w) => Math.acos(Math.max(-1, Math.min(1, dot(u, w) / (norm(u) * norm(w))))) / deg;
  return { ba: norm(b) / norm(a), ca: norm(c) / norm(a), al: ang(b, c), be: ang(a, c), ga: ang(a, b) };
}

/**
 * Hexagonale Achsen einer trigonalen Restgruppe mit 3 ∥ [uvw] (u, v, w = ±1) im kubischen Gitter
 * (rhomboedrische Basis a_R, b_R, c_R = ±a, ±b, ±c mit a_R + b_R + c_R = [uvw]):
 * a₁ = a_R − b_R, a₂ = b_R − c_R, c = a_R + b_R + c_R (obverse Aufstellung). Für [111]:
 * c ∥ [111], a₁ ∥ [11̄0], a₂ ∥ [011̄]; der Würfel {100} wird zum Rhomboeder {101} = {101̄1}.
 * Rückgabe: { a1, a2, c (kubische Richtungen), toHex(hkl) → (hkl) in hexagonalen Achsen } oder null.
 * @param {Richtung | null | undefined} uvw
 */
export function hexSettingOf(uvw) {
  if (!uvw || !uvw.every((x) => Math.abs(x) === 1)) return null;
  /** @type {Mat3} */
  let R = [[uvw[0], 0, 0], [0, uvw[1], 0], [0, 0, uvw[2]]];
  // linkshändige Basis (ungerade Zahl negativer Komponenten): b_R und c_R tauschen
  if (uvw[0] * uvw[1] * uvw[2] < 0) R = [R[0], R[2], R[1]];
  // Basisvektoren der hexagonalen Achsen als kubische Richtungen
  const [a1, a2, c] = /** @type {Richtung[]} */ ([sub(R[0], R[1]), sub(R[1], R[2]), add(add(R[0], R[1]), R[2])]);
  /** (hkl) kubisch → (hkl) hexagonal: h_hex = h · a_i. @param {Normale} h @returns {Normale} */
  const toHex = (h) => reduceInt(/** @type {Normale} */ ([dot(h, a1), dot(h, a2), dot(h, c)]));
  return { a1, a2, c, toHex };
}

/** Parameter auf die Bedingungen des Systems setzen. @param {Partial<Gitterparameter>} lat @param {string} sys @returns {Gitterparameter} */
export function constrainLattice(lat, sys) {
  const d = LATTICE_DEFAULTS[sys];
  const out = { ...d };
  for (const k of FREE_PARAMS[sys]) out[k] = lat[k] ?? d[k];
  return out;
}

/**
 * Kleinster zulässiger Wert von V / (a b c) = √(1 − cos²α − cos²β − cos²γ + 2 cosα cosβ cosγ). Die Wurzel ist 1 für
 * rechtwinklige Achsen und 0, wenn die drei Achsen in einer Ebene liegen. Nicht jede Kombination dreier Winkel
 * zwischen 60° und 150° ergibt ein Gitter (z. B. 60°, 60°, 150°); fast flache Zellen sind ausgeschlossen.
 */
export const GITTER_MIN = 0.1;

/** Ergeben die drei Winkel ein (nicht fast flaches) Gitter? @param {Pick<Gitterparameter, 'al' | 'be' | 'ga'>} p */
export function gitterGueltig(p) {
  const [ca, cb, cg] = [p.al, p.be, p.ga].map((w) => Math.cos(w * deg));
  return 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg >= GITTER_MIN * GITTER_MIN;
}

/**
 * Wert für den Parameter k, der dem Wunsch am nächsten kommt und ein Gitter ergibt: der Wunsch selbst, sonst der erste
 * gültige Wert auf dem Weg zurück zum alten Wert (Schritte des Reglers, zuletzt genau der alte Wert). Die gültigen Werte
 * eines Winkels bilden ein Intervall, das ist also die nächste Grenze. Ist auch der alte Wert ungültig, bleibt er.
 * @param {Gitterparameter} lat @param {keyof Gitterparameter} k @param {number} wunsch @param {number} [schritt]
 */
export function naechsterGueltiger(lat, k, wunsch, schritt = 1) {
  const alt = lat[k], richtung = Math.sign(alt - wunsch);
  const p = { ...lat, [k]: wunsch };
  while (Math.abs(p[k] - alt) > 1e-9 && !gitterGueltig(p)) p[k] = richtung * (alt - p[k]) <= schritt ? alt : p[k] + richtung * schritt;
  return p[k];
}

/** Gittermatrix aus a = 1, b/a, c/a, α, β, γ; die Winkel müssen ein Gitter ergeben (gitterGueltig). @param {Gitterparameter} p */
export function latticeFromParams(p) {
  const a = 1, b = p.ba, c = p.ca;
  const al = p.al * deg, be = p.be * deg, ga = p.ga * deg;
  /** @type {Vec3} */
  const cv = [0, 0, c];
  /** @type {Vec3} */
  const bv = [0, b * Math.sin(al), b * Math.cos(al)];
  const az = a * Math.cos(be);
  const ay = (a * (Math.cos(ga) - Math.cos(al) * Math.cos(be))) / Math.sin(al);
  const ax = Math.sqrt(Math.max(0, a * a - ay * ay - az * az)); // max nur gegen Rundungsfehler, siehe gitterGueltig
  return fromColumns([ax, ay, az], bv, cv);
}

/** Idealgitter des Systems, in dem die kartesischen Operationen aus pointgroups.js gelten. @param {string} sys */
function idealLattice(sys) {
  return latticeFromParams({ ...LATTICE_DEFAULTS[sys], ba: 1, ca: 1, ...(sys === 'monoklin' || sys === 'triklin' ? { al: 90, be: 90, ga: 90 } : {}) });
}

/** @param {Mat3} M @returns {Mat3} */
const roundM = (M) => /** @type {Mat3} */ (M.map((r) => r.map((x) => Math.round(x))));

/** Ganzzahlige Gitterdarstellungen W der Operationen einer Punktgruppe. @param {string} groupId */
export function latticeOps(groupId) {
  const sys = SYSTEM_OF[groupId];
  const A0 = idealLattice(sys);
  const A0i = inverse(A0);
  return buildPointGroup(groupId).ops.map((R) => roundM(mul(mul(A0i, R), A0)));
}

/** @param {Vec3} h */
const hklKey = (h) => h.join(',');
/** Indizes unter einer Gitteroperation W: h' = W⁻ᵀ h. @param {Mat3} W @param {Normale} h @returns {Normale} */
const transformHKL = (W, h) => /** @type {Normale} */ (mulVec(transpose(inverse(W)), h).map((x) => Math.round(x) + 0));

/** Bahn eines Index-Tripels unter den Gitteroperationen. @param {Mat3[]} Ws @param {Normale} h */
export function hklOrbit(Ws, h) {
  /** @type {Normale[]} */
  const out = [];
  const seen = new Set();
  for (const W of Ws) {
    const h2 = transformHKL(W, h);
    const k = hklKey(h2);
    if (!seen.has(k)) { seen.add(k); out.push(h2); }
  }
  return out;
}

/** Erhält W die Metrik M = AᵀA? @param {Mat3} W @param {Mat3} M */
const preservesMetric = (W, M) => matEq(mul(mul(transpose(W), M), W), M, 1e-6);

/**
 * Halbraumschnitt → Ecken und Flächen. planes: [{n, t, ...}] (G·r ≤ t)
 * @template {Halbraum} H
 * @param {H[]} planes
 */
export function intersectHalfspaces(planes) {
  const P = planes.map((p) => {
    const l = norm(p.n);
    return { ...p, u: scale(p.n, 1 / l), d: p.t / l };
  });
  /** @type {Vec3[]} */
  const verts = [];
  for (let i = 0; i < P.length; i++)
    for (let j = i + 1; j < P.length; j++)
      for (let k = j + 1; k < P.length; k++) {
        const x = solve3(fromRows(P[i].u, P[j].u, P[k].u), [P[i].d, P[j].d, P[k].d]);
        if (!x) continue;
        if (P.every((p) => dot(p.u, x) <= p.d + 1e-7) && !verts.some((v) => vecEq(v, x, 1e-6))) verts.push(x);
      }
  /** @type {(H & { u: Vec3, d: number, verts: Vec3[], center: Vec3, area: number })[]} */
  const faces = [];
  for (const p of P) {
    const on = verts.filter((v) => Math.abs(dot(p.u, v) - p.d) < 1e-6);
    if (on.length < 3) continue;
    const c = scale(on.reduce((s, v) => add(s, v), /** @type {Vec3} */ ([0, 0, 0])), 1 / on.length);
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
/** @returns {Halbraum[]} */
const boxPlanes = () => /** @type {Vec3[]} */ ([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]).map((n) => ({ n, t: BOX, role: 'box' }));

/** Kandidaten für Ergänzungsformen: einfache Gitterrichtungen. */
const AUX_CANDIDATES = (() => {
  /** @type {Normale[]} */
  const out = [];
  for (let h = -1; h <= 1; h++) for (let k = -1; k <= 1; k++) for (let l = -1; l <= 1; l++) {
    if (h || k || l) out.push(/** @type {Normale} */ ([h, k, l]));
  }
  return out.sort((a, b) => a.filter((x) => x).length - b.filter((x) => x).length);
})();

/**
 * Ergänzt eine offene Form (oder Kombination) durch Formen derselben Punktgruppe, bis das Polyeder
 * geschlossen ist. basePlanes: Ebenen der vorhandenen Formen. Rückgabe: [{hkls}]
 * @param {(Halbraum & { hkl: Normale })[]} basePlanes @param {Mat3[]} Ws @param {Mat3} B @param {number} tAux
 */
function closeForm(basePlanes, Ws, B, tAux) {
  const used = new Set(basePlanes.map((p) => hklKey(p.hkl)));
  /** @type {{ hkls: Normale[] }[]} */
  const aux = [];
  /** @param {Normale[]} list @param {number} t @param {string} role */
  const planesOf = (list, t, role) => list.map((h) => ({ hkl: h, n: mulVec(B, h), t, role }));
  for (let iter = 0; iter < 8; iter++) {
    const planes = [...basePlanes, ...aux.flatMap((a) => planesOf(a.hkls, tAux, 'aux')), ...boxPlanes()];
    const poly = intersectHalfspaces(planes);
    // offene Richtung: Mittel der Richtungen zu den Ecken am Hilfswürfel (bzw. fernste Ecke)
    const farV = poly.verts.filter((v) => Math.max(...v.map(Math.abs)) > BOX * 0.9);
    if (!farV.length) break; // geschlossen
    /** @type {Vec3} */
    const null3 = [0, 0, 0];
    let u = normalize(farV.reduce((s, v) => add(s, normalize(v)), null3));
    if (norm(farV.reduce((s, v) => add(s, normalize(v)), null3)) < 0.3 * farV.length) {
      u = normalize(farV.reduce((b, v) => (norm(v) > norm(b) ? v : b), farV[0]));
    }
    /** @type {Normale[] | null} */
    let best = null;
    let bs = 0.2;
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

/** Erkennt die Restsymmetrie einer Gruppe unter einer (verzerrten) Metrik. @param {Mat3[]} Ws @param {Mat3} M */
function reducedOps(Ws, M) {
  return Ws.filter((W) => preservesMetric(W, M));
}

/**
 * Bestimmt den Punktgruppentyp (HM-Symbol) zu kartesischen Operationen.
 * @param {Mat3[]} cartOps
 * @returns {{ hm: string, id: string | null, info: Analyse }}
 */
export function identifyGroup(cartOps) {
  const info = analyzeGroup(cartOps);
  /** @param {Analyse} inf */
  const sig = (inf) => {
    /** @type {Record<string, number>} */
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
 *  z: Projektionsrichtung [uvw], x: Richtung nach unten (oder null: ⊥ b).
 * @param {string} sys
 * @returns {Orientierung[]}
 */
export function orientationPresets(sys) {
  if (sys === 'kubisch') {
    return [
      { id: '001', name: '[001]', z: richtung(0, 0, 1), x: richtung(1, 0, 0) },
      { id: '111', name: '[111]', z: richtung(1, 1, 1), x: richtung(1, 1, -2) },
      { id: '110', name: '[110]', z: richtung(1, 1, 0), x: richtung(0, 0, -1) },
    ];
  }
  return [
    { id: 'c', name: 'c', z: richtung(0, 0, 1), x: null },
    { id: 'a', name: 'a (c liegt)', z: richtung(1, 0, 0), x: richtung(0, 0, -1) },
    { id: 'b', name: 'b (c liegt)', z: richtung(0, 1, 0), x: richtung(0, 0, -1) },
  ];
}

/** Orientierungsmatrix O (Zeilen: Bildschirmachsen x↓, y→, z⊙ im Kristallsystem). @param {Mat3} A @param {Orientierung} preset */
export function orientationMatrix(A, preset) {
  const zc = normalize(mulVec(A, preset.z));
  let xc = preset.x ? mulVec(A, preset.x) : cross(mulVec(A, richtung(0, 1, 0)), zc);
  xc = normalize(sub(xc, scale(zc, dot(xc, zc))));
  const yc = cross(zc, xc);
  return fromRows(xc, yc, zc);
}

/**
 * Flächenmuster zur Anzeige der Flächensymmetrie: ein kleines asymmetrisches Dreieck in allgemeiner
 * Lage auf einer Fläche der Hauptform, vervielfältigt mit allen Operationen der Punktgruppe.
 * Auf jeder Fläche entstehen so |Flächensymmetrie| Muster in deren Anordnung.
 * Rückgabe: [{pts:[3 Punkte], det}] in Bildschirmkoordinaten (vor Grössenskalierung).
 * @param {Kristallflaeche[]} faces @param {Mat3[]} ops
 */
export function faceMotifs(faces, ops) {
  /** @type {{ pts: Vec3[], det: number }[]} */
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

/** @param {Kristallflaeche} f0 @param {Mat3[]} ops */
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
  /** @param {number} ang Bogenmass */
  const dir = (ang) => add(scale(e1, Math.cos(ang)), scale(e2, Math.sin(ang)));
  // allgemeine Lage: Winkel, die mit keiner kristallographischen Richtung zusammenfallen
  const p = add(c, scale(dir(0.31), 0.42 * r));
  const lift = scale(n, 0.004);
  const tri = [p, add(p, scale(dir(1.23), 0.38 * r)), add(p, scale(dir(2.61), 0.2 * r))].map((v) => add(v, lift));
  /** @param {Mat3} m */
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  return ops.map((R) => ({ pts: tri.map((v) => mulVec(R, v)), det: Math.sign(det3(R)) }));
}

/** Kanonischer Repräsentant einer Bahn (für die Anzeige): möglichst positive Indizes. @param {Normale[]} hkls */
function canonicalRep(hkls) {
  /** @param {Normale} h */
  const score = (h) => h.reduce((s, x, i) => s + (x >= 0 ? 4 : 0) * (3 - i), 0) * 100 + h[0] * 9 + h[1] * 3 + h[2];
  return [...hkls].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Baut den Kristall zu einem Katalogeintrag.
 * params: { entryId, lat, broken, open, auxDist, presetId }
 * Beispielkristall (Kombination): statt entryId { groupId, forms: [{hkl, r | t}] };
 * r: Zentralabstand der Flächen, t: Abschnittsform h·x + k·y + l·z = t (Bruchkoordinaten).
 * @param {Kristallparameter} params
 */
export function buildCrystal(params) {
  const combo = params.forms && params.forms.length ? params.forms : null;
  // ohne forms ist entryId ein Eintrag des Katalogs, mit forms ist groupId gesetzt (sonst Fehler wie bisher)
  const entry = combo ? null : /** @type {Formeintrag} */ (entryById(/** @type {string} */ (params.entryId)));
  const groupId = /** @type {string} */ (combo ? params.groupId : /** @type {Formeintrag} */ (entry).pg);
  const sys = SYSTEM_OF[groupId];
  const hex = isHexSystem(sys);
  const lat0 = params.broken ? /** @type {Gitterparameter} */ ({ ...params.lat }) : constrainLattice(params.lat, sys);
  // Streckung entlang einer Blickrichtung (nur wirksam, wenn s ≠ 1)
  const st = params.stretch && params.stretch.uvw && Math.abs(params.stretch.s - 1) > 1e-9 ? params.stretch : null;
  const A = st ? stretchLattice(latticeFromParams(lat0), st.uvw, st.s) : latticeFromParams(lat0);
  const lat = st ? paramsOfLattice(A) : lat0;
  const Ai = inverse(A);
  const B = transpose(Ai);
  const M = mul(transpose(A), A);

  const Ws = latticeOps(groupId);
  // Formen: eine (Katalog) oder mehrere (Beispielkristall); doppelte Bahnen werden übersprungen
  /** @type {{ hkls: Normale[], rep: Normale, tOf: (h: Normale) => number }[]} */
  const formList = [];
  const taken = new Set();
  for (const f of combo || [{ hkl: /** @type {Formeintrag} */ (entry).hkl, t: 1, r: undefined }]) {
    const hkls = hklOrbit(Ws, f.hkl);
    if (hkls.some((h) => taken.has(hklKey(h)))) continue;
    hkls.forEach((h) => taken.add(hklKey(h)));
    formList.push({ hkls, rep: f.hkl, tOf: (h) => (f.t != null ? f.t : /** @type {number} */ (f.r) * norm(mulVec(B, h))) });
  }
  const mainHKL = formList[0].hkls;
  const tAux = params.auxDist ?? 1;
  const formPlanes = formList.flatMap((F, fi) => F.hkls.map((h) => ({ hkl: h, n: mulVec(B, h), t: F.tOf(h), role: 'main', form: fi })));
  const auxForms = closeForm(formPlanes, Ws, B, tAux);

  // Restsymmetrie bei freier Verzerrung
  const Wred = reducedOps(Ws, M);
  const isReduced = Wred.length < Ws.length;
  /** @param {Mat3} W */
  const cart = (W) => mul(mul(A, W), Ai);

  // Zerfall der Hauptform in Bahnen der Restgruppe
  /** @type {Normale[][]} */
  const orbitsMain = [];
  const seen = new Set();
  for (const h of mainHKL) {
    const k = hklKey(h);
    if (seen.has(k)) continue;
    const orb = hklOrbit(Wred, h);
    orb.forEach((x) => seen.add(hklKey(x)));
    orbitsMain.push(orb);
  }
  /** @type {Map<string, number>} */
  const orbitIndex = new Map();
  orbitsMain.forEach((orb, i) => orb.forEach((h) => orbitIndex.set(hklKey(h), i)));

  /** @type {(Halbraum & { hkl: Normale })[]} */
  const planes = [
    ...formPlanes.map((p) => ({ ...p, orbit: p.form === 0 ? orbitIndex.get(hklKey(p.hkl)) : 0 })),
    ...auxForms.flatMap((a, ai) => a.hkls.map((h) => ({ hkl: h, n: mulVec(B, h), t: tAux, role: 'aux', aux: ai }))),
  ];
  const poly = intersectHalfspaces(planes);

  const presets = orientationPresets(sys);
  const preset = presets.find((p) => p.id === params.presetId) || presets[0];
  const O = orientationMatrix(A, preset);
  const Ot = transpose(O);

  const cen = scale(poly.verts.reduce((s, v) => add(s, v), /** @type {Vec3} */ ([0, 0, 0])), 1 / Math.max(1, poly.verts.length));
  // Grösse nach dem Volumen; sehr gestreckte Körper zusätzlich so begrenzt, dass sie nicht weit aus der Kugel ragen
  const maxR = Math.max(1e-9, ...poly.verts.map((v) => norm(sub(v, cen))));
  const sc = Math.min(poly.volume > 1e-9 ? 1 / Math.cbrt(poly.volume) : 1, 1.3 / maxR);
  /** @param {Vec3} v */
  const tr = (v) => mulVec(O, scale(sub(v, cen), sc));
  /** @type {Kristallflaeche[]} */
  const faces = poly.faces.map((f) => ({
    hkl: f.hkl, role: f.role, orbit: f.orbit, aux: f.aux, form: f.form,
    normal: normalize(mulVec(O, f.u)),
    verts: f.verts.map(tr),
    center: tr(f.center),
  }));
  // Flächen der Hauptform, die durch Ergänzungsformen ganz weggeschnitten wurden (sollte nicht vorkommen)
  const lostMain = mainHKL.length - faces.filter((f) => f.role === 'main' && f.form === 0).length;

  const axes = [
    { name: hex ? 'a₁' : 'a', dir: normalize(mulVec(O, mulVec(A, richtung(1, 0, 0)))) },
    { name: hex ? 'a₂' : 'b', dir: normalize(mulVec(O, mulVec(A, richtung(0, 1, 0)))) },
    { name: 'c', dir: normalize(mulVec(O, mulVec(A, richtung(0, 0, 1)))) },
  ];
  if (hex && !params.broken && !isReduced) axes.push({ name: 'a₃', dir: normalize(mulVec(O, mulVec(A, richtung(-1, -1, 0)))) });

  // Symmetrieoperationen in Bildschirmkoordinaten (für das Gerüst)
  /** @param {Mat3} W */
  const toScreen = (W) => mul(mul(O, cart(W)), Ot);
  const opsScreen = Wred.map(toScreen);
  const groupScreen = analyzeGroup(opsScreen);
  const motifs = faceMotifs(faces, opsScreen);
  const reduced = isReduced ? identifyGroup(Wred.map(cart)) : null;

  // Hauptachse der Restgruppe als Gitterrichtung (zur Anzeige)
  /** @type {{ symbol: string, uvw: Richtung } | null} */
  let reducedAxis = null;
  if (reduced) {
    /** @type {Record<string, number>} */
    const order = { '6': 6, '-6': 6, '4': 4, '-4': 4, '3': 3, '-3': 3, '2': 2 };
    const axs = reduced.info.axes;
    const maxO = Math.max(0, ...axs.map((a) => order[a.symbol]));
    const top = axs.filter((a) => order[a.symbol] === maxO);
    if (top.length === 1) {
      const u = mulVec(Ai, top[0].dir);
      const m = Math.max(...u.map(Math.abs));
      reducedAxis = { symbol: top[0].symbol, uvw: /** @type {Richtung} */ (u.map((x) => Math.round(x / m))) };
    }
  }

  // Trigonale Restgruppe eines kubischen Kristalls (3 ∥ ⟨111⟩): Indizes in hexagonalen Achsen, Formnamen
  /** @type {(NonNullable<ReturnType<typeof hexSettingOf>> & { ca: number, orbits: { rep: Normale, name: string | null }[] }) | null} */
  let hexSetting = null;
  if (sys === 'kubisch' && reducedAxis && (reducedAxis.symbol === '3' || reducedAxis.symbol === '-3')) {
    const hs = hexSettingOf(reducedAxis.uvw);
    if (hs) {
      /** @param {Richtung} u */
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
    ? /** @type {Normale[]} */ ([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]]).map((h) => normalize(mulVec(O, mulVec(B, h))))
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

const PRISM_TYPES = new Set(PRISMEN);

/**
 * Geometrische Benennung einer Form (auch Grenzformen) nach ITA Tab. 10.1.2.3:
 * über Flächenzahl, Eigensymmetrie (Stabilisator in der Holoedrie) und offen/geschlossen.
 * Gibt { type, name } zurück oder null.
 * @param {string} groupId
 * @param {Normale[]} hkls
 * @returns {{ type: number, name: string } | null}
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
    return { type: 3, name: d < 0 ? /** @type {string} */ (FORM_TYPES[3].alt) : FORM_TYPES[3].name };
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
  const eig = EIG_SCHREIBWEISE[eigId] || eigId;
  const cands = Object.entries(FORM_TYPES).filter(([t, f]) => f.eig === eig && FACE_COUNT[Number(t)] === n && PRISM_TYPES.has(Number(t)) === open);
  if (cands.length === 1) return { type: Number(cands[0][0]), name: cands[0][1].name };
  return null;
}

/** @param {number} a @param {number} b @returns {number} */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/**
 * Ganzzahliges Tripel durch ggT teilen. Die Art (Richtung, Normale, vier Indizes) bleibt erhalten.
 * @template {number[]} T
 * @param {T} v
 * @returns {T}
 */
export const reduceInt = (v) => {
  const g = v.reduce((a, x) => gcd(a, Math.round(x)), 0) || 1;
  return /** @type {T} */ (v.map((x) => Math.round(x) / g + 0));
};

/** Richtung [uvw] (drei Achsen) → [UVTW] (Miller-Bravais). @param {Richtung} uvw */
export function dirToFour([u, v, w]) {
  return reduceInt([2 * u - v, 2 * v - u, -(u + v), 3 * w]);
}

/**
 * Zone aus zwei Flächen i, j des Kristalls C (Zonengleichung hu + kv + lw = 0).
 * Rückgabe: { uvw, axis (Bildschirm, Einheitsvektor), inZone: [Flächenindizes], angle (Winkel der Pole, Grad),
 *   normalDev (Winkel zwischen Richtung [uvw] und Normale (uvw), Grad) } oder null, wenn die Flächen parallel sind.
 * @param {Pick<Kristall, 'faces' | 'O' | 'A'>} C @param {number} i @param {number} j
 * @returns {Zone | null}
 */
export function zoneOf(C, i, j) {
  const h1 = C.faces[i].hkl, h2 = C.faces[j].hkl;
  // Zonenachse [uvw] = h₁ × h₂ (Zonengleichung hu + kv + lw = 0)
  const raw = /** @type {Richtung} */ (cross(h1, h2));
  if (raw.every((x) => Math.abs(x) < 1e-9)) return null;
  const z = zoneByUvw(C, raw);
  const n1 = C.faces[i].normal, n2 = C.faces[j].normal;
  z.angle = (Math.acos(Math.max(-1, Math.min(1, dot(n1, n2)))) * 180) / Math.PI;
  return z;
}

/**
 * Zone zur Richtung [uvw] (ganzzahlig, beliebiges Vorzeichen): Achse in der oberen Halbkugel,
 * sichtbare Flächen der Zone, Abweichung zwischen Richtung [uvw] und Normale (uvw).
 * @param {Pick<Kristall, 'faces' | 'O' | 'A'>} C @param {Richtung} raw
 * @returns {Zone}
 */
export function zoneByUvw(C, raw) {
  let uvw = reduceInt(raw);
  let axis = normalize(mulVec(C.O, mulVec(C.A, uvw)));
  // Darstellung mit der Achse in der oberen Halbkugel
  if (axis[2] < -1e-9 || (Math.abs(axis[2]) <= 1e-9 && (axis[1] < -1e-9 || (Math.abs(axis[1]) <= 1e-9 && axis[0] < 0)))) {
    uvw = /** @type {Richtung} */ (uvw.map((x) => -x + 0)); axis = scale(axis, -1);
  }
  const inZone = C.faces.map((f, k) => (dot(f.hkl, uvw) === 0 && !f.hidden ? k : -1)).filter((k) => k >= 0);
  const B = transpose(inverse(C.A));
  // Netzebene (uvw): dieselben Zahlen als Indizes einer Fläche
  const planeNormal = normalize(mulVec(C.O, mulVec(B, /** @type {Vec3} */ (uvw))));
  const normalDev = (Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(planeNormal, axis))))) * 180) / Math.PI;
  return { uvw, key: zoneKey(uvw), axis, inZone, normalDev, planeNormal };
}

/** Schlüssel einer Zone unabhängig von der Lage: teilerfremd, erste von null verschiedene Komponente positiv. @param {Richtung} raw */
export function zoneKey(raw) {
  const u = reduceInt(raw);
  const s = /** @type {number} */ (u.find((x) => x !== 0)) < 0 ? -1 : 1;
  return u.map((x) => s * x + 0).join(',');
}

/** Mindestzahl der Flächen einer Zone (Borchardt-Ott & Sowa, Abschn. 5.2: drei oder mehr Flächen mit parallelen Kanten). */
export const ZONE_MIN_FACES = 3;

/**
 * Alle Zonen des dargestellten Kristalls mit mindestens ZONE_MIN_FACES sichtbaren Flächen, gruppiert nach
 * symmetrisch gleichwertigen Zonenachsen (Operationen der wirksamen Punktgruppe, Richtung und Gegenrichtung gleich).
 * Rückgabe: [{ rep: [u,v,w], zones: [zone…], faces: Flächen je Zone }], nach Flächenzahl und Indexgrösse sortiert.
 * @param {Pick<Kristall, 'faces' | 'O' | 'A' | 'latOps'>} C
 */
export function zonesOf(C) {
  const vis = C.faces.map((f, i) => ({ f, i })).filter(({ f }) => !f.hidden);
  /** @type {Map<string, Zone>} */
  const byKey = new Map();
  for (let a = 0; a < vis.length; a++) {
    for (let b = a + 1; b < vis.length; b++) {
      const raw = /** @type {Richtung} */ (cross(vis[a].f.hkl, vis[b].f.hkl));
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
  /** @param {Vec3} u */
  const keyOf = (u) => { const v = reduceInt(u); const w = v.map((x) => -x + 0); return [v.join(','), w.join(',')]; };
  /** @type {Map<string, number>} */
  const classOf = new Map();
  /** @type {{ rep: Richtung, zones: Zone[], faces: number }[]} */
  const classes = [];
  for (const z of zones) {
    if (classOf.has(z.key)) continue;
    const orbit = new Set();
    for (const W of C.latOps) for (const k of keyOf(/** @type {Vec3} */ (mulVec(W, z.uvw).map((x) => Math.round(x))))) orbit.add(k);
    const members = zones.filter((y) => orbit.has(y.key));
    members.forEach((y) => classOf.set(y.key, classes.length));
    // Repräsentant: möglichst wenige negative Indizes, dann die grössten Indizes vorn (⟨100⟩, ⟨110⟩, ⟨211⟩)
    /** @param {Richtung} u */
    const neg = (u) => u.filter((x) => x < 0).length;
    /** @param {Richtung} p @param {Richtung} q */
    const desc = (p, q) => (q[0] - p[0]) || (q[1] - p[1]) || (q[2] - p[2]);
    const rep = members.map((y) => y.uvw).sort((p, q) => neg(p) - neg(q) || desc(p, q))[0];
    classes.push({ rep, zones: members, faces: z.inZone.length });
  }
  /** @param {Richtung} u */
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
/** @param {{ verts: Vec3[] }[]} faces */
export function habitOf(faces) {
  // Zerlegung in Tetraeder (Bezugspunkt: Mittel der Ecken), Volumen, Schwerpunkt, zweite Momente
  const all = faces.flatMap((f) => f.verts);
  if (all.length < 4) return null;
  const o = all.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]).map((x) => x / all.length);
  let V = 0;
  /** @type {Vec3} */
  const S = [0, 0, 0];
  /** @type {Mat3} */
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
  const C = /** @type {Mat3} */ (M.map((r, i) => r.map((x, k) => x / V - cen[i] * cen[k])));
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

/** Eigenwerte einer symmetrischen 3×3-Matrix (Jacobi-Verfahren). @param {Mat3} A */
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
