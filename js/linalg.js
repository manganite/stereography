// Kleine Lineare-Algebra-Bibliothek für 3D-Vektoren und 3×3-Matrizen.
// Matrizen sind zeilenweise gespeicherte Arrays [[a,b,c],[d,e,f],[g,h,i]].

/** @import { Vec3, Mat3 } from '../lib/common/js/typen.js' */

export const EPS = 1e-9;

/** @param {number} x @param {number} y @param {number} z @returns {Vec3} */
export const v = (x, y, z) => [x, y, z];
/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** @param {Vec3} a @param {number} s @returns {Vec3} */
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
/** @param {Vec3} a @param {Vec3} b */
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
/** @param {Vec3} a */
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
/** @param {Vec3} a @returns {Vec3} */
export const normalize = (a) => {
  const n = norm(a);
  return n < EPS ? [0, 0, 0] : scale(a, 1 / n);
};
/** @param {Vec3} a @param {Vec3} b @param {number} [tol] */
export const vecEq = (a, b, tol = 1e-6) =>
  Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol && Math.abs(a[2] - b[2]) < tol;

// Mit [0, 1, 2].map(…) entstehen Arrays ohne feste Länge; die Umwandlung in Mat3 ist sicher, weil jede
// Zeile und jede Matrix genau drei Einträge hat.
/** @returns {Mat3} */
export const I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** @param {Mat3} m @returns {Mat3} */
export const neg = (m) => /** @type {Mat3} */ (m.map((r) => r.map((x) => -x)));
/** @param {Mat3} m @returns {Mat3} */
export const transpose = (m) => /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => m[j][i])));
/** @param {Mat3} a @param {Mat3} b @returns {Mat3} */
export const mul = (a, b) =>
  /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j])));
/** @param {Mat3} m @param {Vec3} p @returns {Vec3} */
export const mulVec = (m, p) => [
  m[0][0] * p[0] + m[0][1] * p[1] + m[0][2] * p[2],
  m[1][0] * p[0] + m[1][1] * p[1] + m[1][2] * p[2],
  m[2][0] * p[0] + m[2][1] * p[1] + m[2][2] * p[2],
];
/** @param {Mat3} m */
export const det = (m) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
/** @param {Mat3} m */
export const trace = (m) => m[0][0] + m[1][1] + m[2][2];
/** @param {Mat3} a @param {Mat3} b @param {number} [tol] */
export const matEq = (a, b, tol = 1e-6) =>
  a.every((r, i) => r.every((x, j) => Math.abs(x - b[i][j]) < tol));

/** @param {Mat3} m @returns {Mat3} */
export function inverse(m) {
  const d = det(m);
  /** @param {number} r1 @param {number} c1 @param {number} r2 @param {number} c2 */
  const c = (r1, c1, r2, c2) => m[r1][c1] * m[r2][c2] - m[r1][c2] * m[r2][c1];
  /** @type {Mat3} */
  const adj = [
    [c(1, 1, 2, 2), -c(0, 1, 2, 2), c(0, 1, 1, 2)],
    [-c(1, 0, 2, 2), c(0, 0, 2, 2), -c(0, 0, 1, 2)],
    [c(1, 0, 2, 1), -c(0, 0, 2, 1), c(0, 0, 1, 1)],
  ];
  return /** @type {Mat3} */ (adj.map((r) => r.map((x) => x / d)));
}

/** Matrix aus drei Spaltenvektoren. @param {Vec3} a @param {Vec3} b @param {Vec3} c @returns {Mat3} */
export const fromColumns = (a, b, c) => [
  [a[0], b[0], c[0]],
  [a[1], b[1], c[1]],
  [a[2], b[2], c[2]],
];
/** Matrix aus drei Zeilenvektoren. @param {Vec3} a @param {Vec3} b @param {Vec3} c @returns {Mat3} */
export const fromRows = (a, b, c) => /** @type {Mat3} */ ([a.slice(), b.slice(), c.slice()]);

/** Drehung um die (normierte) Achse um den Winkel phi (Rodrigues). @param {Vec3} axis @param {number} phi Bogenmass @returns {Mat3} */
export function rotation(axis, phi) {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(phi), s = Math.sin(phi), t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}
/** n-zählige Drehung um eine Achse. @param {Vec3} axis @param {number} n */
export const rot = (axis, n) => rotation(axis, (2 * Math.PI) / n);
/** n-zählige Drehinversion (n̄ = 1̄ ∘ n). @param {Vec3} axis @param {number} n */
export const rotInv = (axis, n) => neg(rot(axis, n));
/** Spiegelung an der Ebene mit Normale nrm. @param {Vec3} nrm @returns {Mat3} */
export function mirror(nrm) {
  const n = normalize(nrm);
  return /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? 1 : 0) - 2 * n[i] * n[j])));
}
export const inversion = () => neg(I3());

/** Löst A x = b für 3×3 (gibt null bei singulärer Matrix). @param {Mat3} A @param {Vec3} b @returns {Vec3 | null} */
export function solve3(A, b) {
  const d = det(A);
  if (Math.abs(d) < 1e-12) return null;
  const Ai = inverse(A);
  return mulVec(Ai, b);
}
