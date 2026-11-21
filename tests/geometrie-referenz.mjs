// Frühere Rechnungen der App zur Geometrie der Zelle (bis symcrys 0.8.0 in js/polyhedra.js), unverändert übernommen.
// Sie dienen in tests/kern.test.mjs als unabhängige Referenz für das, was jetzt aus symcrys kommt (symcrys#24 Punkt 4).

/** @import { Mat3, Vec3 } from '../lib/common/js/typen.js' */

const deg = Math.PI / 180;
/** @param {Vec3} u @param {Vec3} v */
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
/** @param {Vec3} u */
const norm = (u) => Math.hypot(u[0], u[1], u[2]);

/** Gittermatrix aus a = 1, b/a, c/a, α, β, γ: c ∥ z, b in der yz-Ebene. @param {{ ba: number, ca: number, al: number, be: number, ga: number }} p @returns {Mat3} */
export function latticeFromParamsAlt(p) {
  const b = p.ba, c = p.ca, al = p.al * deg, be = p.be * deg, ga = p.ga * deg;
  const bv = [0, b * Math.sin(al), b * Math.cos(al)];
  const az = Math.cos(be);
  const ay = (Math.cos(ga) - Math.cos(al) * Math.cos(be)) / Math.sin(al);
  const ax = Math.sqrt(Math.max(0, 1 - ay * ay - az * az));
  return [[ax, bv[0], 0], [ay, bv[1], 0], [az, bv[2], c]];
}

/** @param {Mat3} A */
export function paramsOfLatticeAlt(A) {
  const [a, b, c] = /** @type {Vec3[]} */ ([0, 1, 2].map((j) => [A[0][j], A[1][j], A[2][j]]));
  /** @param {Vec3} u @param {Vec3} w */
  const ang = (u, w) => Math.acos(Math.max(-1, Math.min(1, dot(u, w) / (norm(u) * norm(w))))) / deg;
  return { ba: norm(b) / norm(a), ca: norm(c) / norm(a), al: ang(b, c), be: ang(a, c), ga: ang(a, b) };
}

/** @param {{ al: number, be: number, ga: number }} p @param {number} min */
export function gitterGueltigAlt(p, min) {
  const [ca, cb, cg] = [p.al, p.be, p.ga].map((w) => Math.cos(w * deg));
  return 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg >= min * min;
}

/** WᵀMW = M mit M = AᵀA, absolute Toleranz 10⁻⁶. @param {Mat3} W @param {Mat3} A */
export function preservesMetricAlt(W, A) {
  /** @param {Mat3} X @param {Mat3} Y @returns {Mat3} */
  const mul = (X, Y) => /** @type {Mat3} */ (X.map((r) => [0, 1, 2].map((j) => r[0] * Y[0][j] + r[1] * Y[1][j] + r[2] * Y[2][j])));
  /** @param {Mat3} X @returns {Mat3} */
  const tr = (X) => /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => X[j][i])));
  const M = mul(tr(A), A);
  const R = mul(mul(tr(W), M), W);
  return R.every((r, i) => r.every((x, j) => Math.abs(x - M[i][j]) <= 1e-6));
}

/** @param {number} a @param {number} b @returns {number} */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** @param {number[]} v */
export const reduceIntAlt = (v) => { const g = v.reduce((a, x) => gcd(a, Math.round(x)), 0) || 1; return v.map((x) => Math.round(x) / g + 0); };
/** @param {number[]} uvw */
export const dirToFourAlt = ([u, v, w]) => reduceIntAlt([2 * u - v, 2 * v - u, -(u + v), 3 * w]);
