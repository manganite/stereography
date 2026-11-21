// Die 32 kristallographischen Punktgruppen (inkl. der in ITA A separat
// aufgeführten Aufstellungen). Alle Operationen sind als 3×3-Matrizen im
// kartesischen Kristallsystem gegeben. Operationen, Eigenschaften und
// Symmetrieelemente kommen aus dem Rechenkern symcrys (js/kern.js), auch für beliebige
// Operationen verzerrter Kristalle (analyzeGroup, symcrys#24 Punkt 3); hier steht,
// was die App daraus macht.
//
// Konvention (ITA A): Projektionsrichtung c (z, zum Betrachter),
// a zeigt im Stereogramm nach unten, b nach rechts.
// Kartesisch: x ∥ a (orthogonale Systeme), y ∥ b, z ∥ c.
// Hexagonale Achsen: b ∥ y, a schliesst mit b 120° ein.

import { mulVec, det, normalize, add, scale, cross, EPS } from './linalg.js';
import { PUNKTGRUPPEN } from './punktgruppen.js';
import { HEX_A, HEX_B, kernBeschreibung, kernElemente, kernOperationen, kernPiezoelektrisch, kernPolar } from './kern.js';

/** @import { Vec3, Mat3, Richtung } from '../lib/common/js/typen.js' */
/** Eintrag der Gruppenliste: Zeile aus js/punktgruppen.js (Bedeutung der Felder dort). @typedef {import('./punktgruppen.js').Punktgruppenzeile} Punktgruppe */
/**
 * Drehachse oder Drehinversionsachse (kartesische Richtung, kanonisches Vorzeichen). cls: Position im
 * HM-Symbol, gesetzt von symmetryDirections() (−1: keine).
 * @typedef {{ dir: Vec3, symbol: string, centre: boolean, mirrorPerp: boolean, cls?: number }} Achse
 */
/**
 * Ergebnis von analyzeGroup(). mirrors: Normalen der Spiegelebenen (kartesisch); mirrorCls: Position im
 * HM-Symbol je Spiegel, gesetzt von symmetryDirections().
 * @typedef {object} Analyse
 * @property {Mat3[]} ops
 * @property {number} order
 * @property {boolean} centro
 * @property {boolean} chiral
 * @property {boolean} polar
 * @property {boolean} piezo
 * @property {Achse[]} axes
 * @property {Vec3[]} mirrors
 * @property {number[]} [mirrorCls]
 */
/** Vollständige Daten einer Punktgruppe (buildPointGroup). @typedef {Punktgruppe & Analyse} Punktgruppeninfo */
/**
 * Klasse von Blickrichtungen (eine Position im HM-Symbol).
 * @typedef {{ pos: number, label: string, dirs: Vec3[], hm: string | null, axes: Achse[], mirrors: Vec3[] }} Blickrichtungsklasse
 */

/** @type {Vec3} */
export const X = [1, 0, 0];
/** @type {Vec3} */
export const Y = [0, 1, 0];
/** @type {Vec3} */
export const Z = [0, 0, 1];
// hexagonale Gitterrichtungen (kartesisch, normiert); a und b aus js/kern.js
export { HEX_A, HEX_B };

/** Gruppenliste: die Zeilen aus js/punktgruppen.js. @type {Punktgruppe[]} */
export const POINT_GROUPS = PUNKTGRUPPEN;

/** Gruppe zur id. Alle Aufrufer übergeben ids aus der Liste (eine unbekannte ergäbe undefined). @param {string} id */
export const groupById = (id) => /** @type {Punktgruppe} */ (POINT_GROUPS.find((g) => g.id === id));

/** Kanonisches Vorzeichen einer Richtung: z > 0, sonst y > 0, sonst x > 0. @param {Vec3} d */
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
 * Analysiert eine Liste von Operationen (eine Gruppe) und bestimmt die Symmetrieelemente: Art, Zähligkeit und Achse jeder
 * Operation aus symcrys (`describeOperationsOf`), daraus je Richtung das Achsensymbol der Zeichnung.
 * Rückgabe: { ops, order, centro, chiral, polar, piezo, axes:[{dir, symbol, centre}], mirrors:[normal] }
 * symbol ∈ '2','3','4','6','-3','-4','-6'
 * @param {Mat3[]} ops
 * @returns {Analyse}
 */
export function analyzeGroup(ops) {
  const beschrieben = kernBeschreibung(ops);
  const centro = beschrieben.some((d) => d.kind === 'inversion');
  const chiral = beschrieben.every((d) => d.kind === 'identity' || d.kind === 'rotation');

  /** @type {{ dir: Vec3, rot: Set<number>, rotinv: Set<number>, mirror: boolean }[]} */
  const axisMap = [];
  /** @param {Vec3} d */
  const findAxis = (d) => {
    const c = canonicalDir(d);
    let e = axisMap.find((a) => Math.abs(Math.abs(a.dir[0] * c[0] + a.dir[1] * c[1] + a.dir[2] * c[2]) - 1) < 1e-6);
    if (!e) { e = { dir: c, rot: new Set([1]), rotinv: new Set(), mirror: false }; axisMap.push(e); }
    return e;
  };
  for (const d of beschrieben) {
    if (!d.axis) continue; // Identität, Inversion
    const e = findAxis(/** @type {Vec3} */ ([...d.axis.cartesian]));
    if (d.kind === 'rotation') e.rot.add(d.order);
    else if (d.kind === 'mirror') e.mirror = true;
    else e.rotinv.add(d.order);
  }
  /** @type {Achse[]} */
  const axes = [];
  /** @type {Vec3[]} */
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
  // polar und piezo erst beim Lesen (einmal) berechnen: beide bestimmen bzw. schliessen die Gruppe in symcrys (bei m3̄m
  // rund 1,5 bzw. 4 ms), analyzeGroup läuft aber bei jedem buildCrystal; die Kenndaten nehmen sie aus buildPointGroup.
  /** @type {boolean | undefined} */
  let polar;
  /** @type {boolean | undefined} */
  let piezo;
  return {
    ops, order: ops.length, centro, chiral,
    get polar() { return (polar ??= kernPolar(ops)); },
    get piezo() { return (piezo ??= kernPiezoelektrisch(ops)); },
    axes, mirrors,
  };
}

/**
 * Vollständige Daten zu einer Punktgruppe aus symcrys: Operationen in der Reihenfolge von ITA, Eigenschaften,
 * Achsen und Spiegelnormalen (kanonisches Vorzeichen wie in analyzeGroup). @param {string} id
 * @returns {Punktgruppeninfo}
 */
export function buildPointGroup(id) {
  const g = groupById(id);
  if (!g) throw new Error(`Unbekannte Punktgruppe: ${id}`);
  const ops = kernOperationen(id);
  const e = kernElemente(id);
  const axes = e.axes.map((a) => ({ dir: canonicalDir(a.dir), symbol: a.symbol, centre: a.centre, mirrorPerp: a.mirrorPerp }));
  return {
    ...g, ops, order: ops.length, centro: e.centro, chiral: e.chiral, polar: e.polar, piezo: e.piezo,
    axes, mirrors: e.mirrors.map(canonicalDir),
  };
}

/** Bahn (Orbit) eines Punktes unter der Gruppe: [{p, det, op}] @param {Mat3[]} ops @param {Vec3} p0 */
export function orbit(ops, p0) {
  return ops.map((m, i) => ({ p: mulVec(m, p0), det: det(m), op: i }));
}

/**
 * Blickrichtungen (Symmetrierichtungen) nach ITA A, Tab. 2.1.3.1: Die Positionen im vollen
 * Hermann-Mauguin-Symbol stehen für Klassen äquivalenter Richtungen. Innerhalb einer Klasse sind
 * die Symmetrieelemente durch die Gruppe selbst ineinander überführbar (die charakteristische
 * Achse des Kristallsystems vertauscht die Richtungen), in verschiedenen Klassen nicht.
 * Rückgabe: [{ pos, label (HTML), dirs, hm, axes:[...], mirrors:[normale] }]; Triklin: [].
 * Jede Achse erhält zusätzlich axis.cls = pos, info.mirrorCls[i] = pos des i-ten Spiegels.
 */
/**
 * Positionen des HM-Symbols als Gitterrichtungen [uvw] je Kristallsystem.
 * @param {string} system
 * @returns {{ label: string, uvw: Richtung[] }[]}
 */
function directionPositions(system) {
  const R = /** @param {Vec3[]} l */ (l) => /** @type {Richtung[]} */ (l);
  switch (system) {
    case 'monoklin': case 'orthorhombisch':
      return [{ label: '[100]', uvw: R([[1, 0, 0]]) }, { label: '[010]', uvw: R([[0, 1, 0]]) }, { label: '[001]', uvw: R([[0, 0, 1]]) }];
    case 'tetragonal':
      return [{ label: '[001]', uvw: R([[0, 0, 1]]) }, { label: '⟨100⟩', uvw: R([[1, 0, 0], [0, 1, 0]]) }, { label: '⟨110⟩', uvw: R([[1, 1, 0], [1, -1, 0]]) }];
    case 'trigonal': case 'hexagonal':
      return [{ label: '[001]', uvw: R([[0, 0, 1]]) }, { label: '⟨100⟩', uvw: R([[1, 0, 0], [0, 1, 0], [-1, -1, 0]]) },
        { label: '⟨210⟩', uvw: R([[1, -1, 0], [1, 2, 0], [-2, -1, 0]]) }];
    case 'kubisch':
      return [{ label: '⟨100⟩', uvw: R([[1, 0, 0], [0, 1, 0], [0, 0, 1]]) },
        { label: '⟨111⟩', uvw: R([[1, 1, 1], [1, -1, 1], [-1, 1, 1], [-1, -1, 1]]) },
        { label: '⟨110⟩', uvw: R([[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]]) }];
    default: return [];
  }
}
/**
 * Gitterrichtung → kartesisch im Koordinatensystem dieser Datei (a ∥ x bzw. HEX_A, b ∥ y, c ∥ z).
 * @param {string} system
 * @returns {(u: Richtung) => Vec3}
 */
export function latticeToCart(system) {
  const hex = system === 'trigonal' || system === 'hexagonal';
  const a = hex ? HEX_A : X, b = hex ? HEX_B : Y;
  return (u) => add(add(scale(a, u[0]), scale(b, u[1])), scale(Z, u[2]));
}
/**
 * info: { system, full, axes, mirrors }; toCart: Gitterrichtung [uvw] → kartesische Richtung im
 * Koordinatensystem von axes/mirrors (Standard: Koordinatensystem der Punktgruppen dieser Datei).
 * @param {Pick<Punktgruppeninfo, 'system' | 'full' | 'axes' | 'mirrors' | 'mirrorCls'>} info
 * @param {(u: Richtung) => Vec3} [toCart]
 * @returns {Blickrichtungsklasse[]}
 */
export function symmetryDirections(info, toCart = latticeToCart(info.system)) {
  const pos = directionPositions(info.system);
  const parts = info.full.split(' ');
  /** @type {Blickrichtungsklasse[]} */
  const classes = pos.map((p, i) => ({ pos: i, label: p.label, dirs: p.uvw.map((u) => normalize(toCart(u))), hm: parts[i] || null, axes: [], mirrors: [] }));
  /** @param {Vec3} v */
  const find = (v) => classes.findIndex((c) => c.dirs.some((d) => Math.abs(Math.abs(d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) - 1) < 1e-6));
  for (const a of info.axes) {
    const k = find(a.dir);
    a.cls = k;
    if (k >= 0) classes[k].axes.push(a);
  }
  info.mirrorCls = info.mirrors.map((m) => {
    const k = find(m);
    if (k >= 0) classes[k].mirrors.push(m);
    return k;
  });
  return classes;
}

/** Zusammenfassung der Symmetrieelemente für die Anzeige. @param {Pick<Punktgruppeninfo, 'axes' | 'mirrors' | 'centro'>} info */
export function elementSummary(info) {
  const order = ['6', '-6', '4', '-4', '3', '-3', '2'];
  /** @type {Record<string, number>} */
  const counts = {};
  for (const a of info.axes) {
    const key = a.symbol + (a.centre ? '/c' : '');
    counts[key] = (counts[key] || 0) + 1;
  }
  /** @type {{ symbol: string, centre: boolean, count: number }[]} */
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
