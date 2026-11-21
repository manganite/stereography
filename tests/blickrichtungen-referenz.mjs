// Referenz für die Blickrichtungen: die Tabellen und die Zuordnung, mit denen die App bis v1.21 ihre Blickrichtungen selbst
// bestimmte (`directionPositions` und `symmetryDirections` in js/pointgroups.js, `VIEW_FAMILIES` in js/scene.js), hier als
// unabhängige Herleitung für tests/kern.test.mjs und tests/views.test.mjs (stereography#111). Seither kommen die
// Richtungen aus symcrys (`symmetryDirections`, über js/kern.js); die App behält nur die Bezeichnungen.
import { add, normalize, scale } from '../js/linalg.js';
import { HEX_A, HEX_B } from '../js/kern.js';

/** @import { Vec3, Richtung } from '../lib/common/js/typen.js' */

const X = /** @type {Vec3} */ ([1, 0, 0]), Y = /** @type {Vec3} */ ([0, 1, 0]), Z = /** @type {Vec3} */ ([0, 0, 1]);

/**
 * Positionen des HM-Symbols als Gitterrichtungen [uvw] je Kristallsystem, wie bis v1.21 in js/pointgroups.js.
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
 * Gitterrichtung → kartesisch im Rahmen der App (a ∥ x bzw. HEX_A, b ∥ y, c ∥ z).
 * @param {string} system
 * @returns {(u: Richtung) => Vec3}
 */
export function latticeToCartReferenz(system) {
  const hex = system === 'trigonal' || system === 'hexagonal';
  const a = hex ? HEX_A : X, b = hex ? HEX_B : Y;
  return (u) => add(add(scale(a, u[0]), scale(b, u[1])), scale(Z, u[2]));
}

/**
 * Klassen von Blickrichtungen wie bis v1.21: Bezeichnung, Richtungen, Symbol und die Achsen und Spiegelnormalen je Klasse;
 * setzt `axis.cls` und `info.mirrorCls` wie die frühere Funktion.
 * @param {{ system: string, full: string, axes: { dir: Vec3, symbol: string, centre: boolean, mirrorPerp: boolean, cls?: number }[], mirrors: Vec3[], mirrorCls?: number[] }} info
 */
export function symmetryDirectionsReferenz(info, toCart = latticeToCartReferenz(info.system)) {
  const pos = directionPositions(info.system);
  const parts = info.full.split(' ');
  const classes = pos.map((p, i) => ({
    pos: i, label: p.label, dirs: p.uvw.map((u) => normalize(toCart(u))), hm: parts[i] || null,
    axes: /** @type {typeof info.axes} */ ([]), mirrors: /** @type {Vec3[]} */ ([]),
  }));
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

/**
 * Familien der Ansichten der 3D-Konstruktion wie bis v1.21 (`VIEW_FAMILIES`): je Position die Gitterrichtungen in
 * bevorzugter Reihenfolge. Triklin: die Kristallachsen (pos −1).
 * @type {Record<string, { pos: number, fam?: string, uvw: Vec3[] }[]>}
 */
export const VIEW_FAMILIES_REFERENZ = {
  triklin: [{ pos: -1, uvw: [[1, 0, 0]] }, { pos: -1, uvw: [[0, 1, 0]] }, { pos: -1, uvw: [[0, 0, 1]] }],
  monoklin: [{ pos: 0, uvw: [[1, 0, 0]] }, { pos: 1, uvw: [[0, 1, 0]] }, { pos: 2, uvw: [[0, 0, 1]] }],
  orthorhombisch: [{ pos: 0, uvw: [[1, 0, 0]] }, { pos: 1, uvw: [[0, 1, 0]] }, { pos: 2, uvw: [[0, 0, 1]] }],
  tetragonal: [{ pos: 0, fam: '[001]', uvw: [[0, 0, 1]] }, { pos: 1, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0]] }, { pos: 2, fam: '⟨110⟩', uvw: [[1, 1, 0], [1, -1, 0]] }],
  trigonal: [{ pos: 0, fam: '[001]', uvw: [[0, 0, 1]] }, { pos: 1, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0], [1, 1, 0]] }, { pos: 2, fam: '⟨210⟩', uvw: [[2, 1, 0], [1, 2, 0], [1, -1, 0]] }],
  hexagonal: [{ pos: 0, fam: '[001]', uvw: [[0, 0, 1]] }, { pos: 1, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0], [1, 1, 0]] }, { pos: 2, fam: '⟨210⟩', uvw: [[2, 1, 0], [1, 2, 0], [1, -1, 0]] }],
  kubisch: [
    { pos: 0, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
    { pos: 1, fam: '⟨111⟩', uvw: [[1, 1, 1], [1, -1, 1], [-1, 1, 1], [-1, -1, 1]] },
    { pos: 2, fam: '⟨110⟩', uvw: [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]] },
  ],
};
