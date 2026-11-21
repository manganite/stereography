/**
 * Miller and Miller–Bravais indices, the zone law and the change of axes
 * (docs/conventions.md, "Cell, metric and indices"). Plain integers and matrices in and out.
 */
import { det, inverse, transpose } from './linalg.js';
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b)
        [a, b] = [b, a % b];
    return a;
}
function integers(v, who, length) {
    if (!Array.isArray(v) ||
        (length !== undefined && v.length !== length) ||
        v.length === 0 ||
        !v.every((x) => Number.isSafeInteger(x))) {
        throw new RangeError(`${who}: ${length === undefined ? 'a list of' : length} integers expected, not ${JSON.stringify(v)}`);
    }
}
/** The indices divided by their greatest common divisor, signs kept. Throws a RangeError for non-integers and for all zeros. */
export function reduceIndices(indices) {
    integers(indices, 'reduceIndices');
    const g = indices.reduce(gcd, 0);
    if (g === 0)
        throw new RangeError('reduceIndices: all indices are zero');
    return indices.map((x) => x / g + 0);
}
/** The plane (hkl) of hexagonal axes as (hkil) with i = −(h + k). */
export function planeToFourIndices(hkl) {
    integers(hkl, 'planeToFourIndices', 3);
    if (hkl.every((x) => x === 0))
        throw new RangeError('planeToFourIndices: zero vector');
    return [hkl[0] + 0, hkl[1] + 0, -(hkl[0] + hkl[1]) + 0, hkl[2] + 0];
}
/** The plane (hkil) as (hkl); throws a RangeError unless i = −(h + k). */
export function planeFromFourIndices(hkil) {
    integers(hkil, 'planeFromFourIndices', 4);
    if (hkil[2] !== -(hkil[0] + hkil[1]))
        throw new RangeError(`planeFromFourIndices: i must be −(h + k) in ${JSON.stringify(hkil)}`);
    return [hkil[0] + 0, hkil[1] + 0, hkil[3] + 0];
}
/**
 * The direction [uvw] of hexagonal axes as [UVTW], reduced: U = (2u − v)/3, V = (2v − u)/3,
 * T = −(U + V), W = w, scaled to the smallest integers.
 */
export function directionToFourIndices(uvw) {
    integers(uvw, 'directionToFourIndices', 3);
    const [u, v, w] = uvw;
    if (u === 0 && v === 0 && w === 0)
        throw new RangeError('directionToFourIndices: zero vector');
    return reduceIndices([2 * u - v, 2 * v - u, -(u + v), 3 * w]);
}
/** The direction [UVTW] as [uvw], reduced: u = U − T, v = V − T, w = W; throws a RangeError unless T = −(U + V). */
export function directionFromFourIndices(uvtw) {
    integers(uvtw, 'directionFromFourIndices', 4);
    if (uvtw.every((x) => x === 0))
        throw new RangeError('directionFromFourIndices: zero vector');
    const [U, V, T, W] = uvtw;
    if (T !== -(U + V))
        throw new RangeError(`directionFromFourIndices: T must be −(U + V) in ${JSON.stringify(uvtw)}`);
    return reduceIndices([U - T, V - T, W]);
}
/**
 * The zone axis [uvw] of two planes (hkl), which must not be zero vectors: the solution of the zone law hu + kv + lw = 0, the
 * cross product h₁ × h₂ reduced (so its sign follows the order of the planes), or `null` for parallel planes.
 */
export function zoneAxis(h1, h2) {
    integers(h1, 'zoneAxis', 3);
    integers(h2, 'zoneAxis', 3);
    if (h1.every((x) => x === 0) || h2.every((x) => x === 0))
        throw new RangeError('zoneAxis: zero vector');
    const c = [h1[1] * h2[2] - h1[2] * h2[1], h1[2] * h2[0] - h1[0] * h2[2], h1[0] * h2[1] - h1[1] * h2[0]];
    if (!c.every((x) => Number.isSafeInteger(x)))
        throw new RangeError('zoneAxis: the cross product exceeds the safe integers');
    if (c.every((x) => x === 0))
        return null;
    return reduceIndices(c);
}
/**
 * The transformation of indices for a change of basis (a′, b′, c′) = (a, b, c)·P (ITA Vol. A, 2006,
 * Section 5.1.3): the columns of `P` are the new basis vectors in the old one. The coordinates of a
 * direction transform with Q = P⁻¹, the indices of a plane with Pᵀ, so that hu + kv + lw is the same in
 * both bases. Throws a RangeError unless det P > 0 (a right-handed basis).
 */
export function changeOfAxes(P) {
    if (!Array.isArray(P) ||
        P.length !== 3 ||
        !P.every((r) => Array.isArray(r) && r.length === 3 && r.every((x) => Number.isFinite(x)))) {
        throw new RangeError('changeOfAxes: P must be a 3×3 matrix of finite numbers');
    }
    if (!(det(P) > 0))
        throw new RangeError('changeOfAxes: det P must be positive (a right-handed basis)');
    const clean = (m) => m.map((r) => r.map((x) => x + 0)); // no −0
    return { direction: clean(inverse(P)), plane: clean(transpose(P)) };
}
