// Kleine Lineare-Algebra-Bibliothek für 3D-Vektoren und 3×3-Matrizen.
// Matrizen sind zeilenweise gespeicherte Arrays [[a,b,c],[d,e,f],[g,h,i]].

export const EPS = 1e-9;

export const v = (x, y, z) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a) => {
  const n = norm(a);
  return n < EPS ? [0, 0, 0] : scale(a, 1 / n);
};
export const vecEq = (a, b, tol = 1e-6) =>
  Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol && Math.abs(a[2] - b[2]) < tol;

export const I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const neg = (m) => m.map((r) => r.map((x) => -x));
export const transpose = (m) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => m[j][i]));
export const mul = (a, b) =>
  [0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]));
export const mulVec = (m, p) => [
  m[0][0] * p[0] + m[0][1] * p[1] + m[0][2] * p[2],
  m[1][0] * p[0] + m[1][1] * p[1] + m[1][2] * p[2],
  m[2][0] * p[0] + m[2][1] * p[1] + m[2][2] * p[2],
];
export const det = (m) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
export const trace = (m) => m[0][0] + m[1][1] + m[2][2];
export const matEq = (a, b, tol = 1e-6) =>
  a.every((r, i) => r.every((x, j) => Math.abs(x - b[i][j]) < tol));

export function inverse(m) {
  const d = det(m);
  const c = (r1, c1, r2, c2) => m[r1][c1] * m[r2][c2] - m[r1][c2] * m[r2][c1];
  const adj = [
    [c(1, 1, 2, 2), -c(0, 1, 2, 2), c(0, 1, 1, 2)],
    [-c(1, 0, 2, 2), c(0, 0, 2, 2), -c(0, 0, 1, 2)],
    [c(1, 0, 2, 1), -c(0, 0, 2, 1), c(0, 0, 1, 1)],
  ];
  return adj.map((r) => r.map((x) => x / d));
}

/** Matrix aus drei Spaltenvektoren. */
export const fromColumns = (a, b, c) => [
  [a[0], b[0], c[0]],
  [a[1], b[1], c[1]],
  [a[2], b[2], c[2]],
];
/** Matrix aus drei Zeilenvektoren. */
export const fromRows = (a, b, c) => [a.slice(), b.slice(), c.slice()];

/** Drehung um die (normierte) Achse um den Winkel phi (Rodrigues). */
export function rotation(axis, phi) {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(phi), s = Math.sin(phi), t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}
/** n-zählige Drehung um eine Achse. */
export const rot = (axis, n) => rotation(axis, (2 * Math.PI) / n);
/** n-zählige Drehinversion (n̄ = 1̄ ∘ n). */
export const rotInv = (axis, n) => neg(rot(axis, n));
/** Spiegelung an der Ebene mit Normale nrm. */
export function mirror(nrm) {
  const n = normalize(nrm);
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? 1 : 0) - 2 * n[i] * n[j]));
}
export const inversion = () => neg(I3());

/** Löst A x = b für 3×3 (gibt null bei singulärer Matrix). */
export function solve3(A, b) {
  const d = det(A);
  if (Math.abs(d) < 1e-12) return null;
  const Ai = inverse(A);
  return mulVec(Ai, b);
}
