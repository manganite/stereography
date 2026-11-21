/**
 * The geometry of a point group's operations: what each operation is (rotation, mirror, …), about
 * which axis and in which sense, and which symmetry elements lie along each symmetry direction of
 * the full Hermann–Mauguin symbol. Structured data only; symbols such as `3⁺ x,x,x` or `2_z` are
 * left to the applications (docs/conventions.md, "Symmetry directions and elements").
 */
import { det, trace } from '../linalg.js';
import { crystalFamily, latticeBasis } from '../lattice.js';
import { LATTICE_SYMMETRY_DIRECTIONS } from '../symmetryDirections.js';
import { operations, pointGroup, symbol, } from './pointGroups.js';
const AXIS_TOLERANCE = 1e-6;
function normalize(v) {
    const n = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / n, v[1] / n, v[2] / n];
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/**
 * The basis used to turn [uvw] into a Cartesian direction. Monoclinic and triclinic have no fixed
 * basis (`latticeBasis`); there the axes a, b, c are taken along x, y, z, which is exact for the
 * monoclinic unique axis, the only symmetry direction that carries an element in a symcrys frame.
 */
function basisOf(family) {
    if (family === 'monoclinic' || family === 'triclinic')
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ];
    return latticeBasis(family);
}
function axisOf(family, uvw) {
    const b = basisOf(family);
    const v = [
        b[0][0] * uvw[0] + b[0][1] * uvw[1] + b[0][2] * uvw[2],
        b[1][0] * uvw[0] + b[1][1] * uvw[1] + b[1][2] * uvw[2],
        b[2][0] * uvw[0] + b[2][1] * uvw[1] + b[2][2] * uvw[2],
    ];
    return Object.freeze({ lattice: uvw, cartesian: Object.freeze(normalize(v)) });
}
/**
 * The symmetry directions of a family, per position of the full symbol, in the reading of a
 * convention. Birss reads position 2 of the hexagonal family along y, a tertiary direction, and
 * position 3 along x, a secondary one (docs/conventions.md, "Where ITC and Birss differ").
 */
function positionsOf(family, c) {
    const p = LATTICE_SYMMETRY_DIRECTIONS[family];
    return c === 'birss' && family === 'hexagonal' ? [p[0], p[2], p[1]] : p;
}
/** The proper rotation part of a matrix and its order n (1 for the identity). */
function rotationPart(m) {
    const r = det(m) > 0 ? m : m.map((row) => row.map((v) => -v));
    const cos = Math.max(-1, Math.min(1, (trace(r) - 1) / 2));
    const angle = Math.acos(cos);
    const n = angle < 1e-6 ? 1 : Math.round((2 * Math.PI) / angle);
    if (![1, 2, 3, 4, 6].includes(n))
        throw new Error(`Not a crystallographic operation (rotation order ${n})`);
    return { r, n };
}
/** The axis of a proper rotation of order n ≥ 2 (sign arbitrary for n = 2). */
export function rotationAxis(r, n) {
    if (n === 2) {
        // r + 1 has rank 1; its columns are parallel to the axis.
        let best = [0, 0, 0];
        let size = 0;
        for (let j = 0; j < 3; j++) {
            const col = [r[0][j] + (j === 0 ? 1 : 0), r[1][j] + (j === 1 ? 1 : 0), r[2][j] + (j === 2 ? 1 : 0)];
            const l = Math.hypot(col[0], col[1], col[2]);
            if (l > size) {
                size = l;
                best = col;
            }
        }
        return normalize(best);
    }
    return normalize(axialVector(r));
}
/** (r − rᵀ)/2 as a vector: sin θ times the unit axis for a rotation by θ. */
export const axialVector = (r) => [
    (r[2][1] - r[1][2]) / 2,
    (r[0][2] - r[2][0]) / 2,
    (r[1][0] - r[0][1]) / 2,
];
function findAxis(axes, u, what) {
    const a = axes.find((x) => Math.abs(Math.abs(dot(x.cartesian, u)) - 1) < AXIS_TOLERANCE);
    if (!a)
        throw new Error(`${what}: axis [${u.map((v) => v.toFixed(4)).join(', ')}] is not a symmetry direction`);
    return a;
}
function describe(op, axes, what) {
    const proper = det(op.matrix) > 0;
    const { r, n } = rotationPart(op.matrix);
    const timeReversal = op.timeReversal;
    if (n === 1)
        return Object.freeze({ kind: proper ? 'identity' : 'inversion', order: 1, timeReversal });
    const axis = findAxis(axes, rotationAxis(r, n), what);
    const kind = proper ? 'rotation' : n === 2 ? 'mirror' : 'rotoinversion';
    if (n === 2)
        return Object.freeze({ kind, order: 2, axis, timeReversal });
    const sense = dot(axialVector(r), axis.cartesian) > 0 ? '+' : '-';
    return Object.freeze({ kind, order: n, axis, sense, timeReversal });
}
const cache = new Map();
function analysis(key, options) {
    const ops = operations(key, options); // checks key, convention and setting
    const c = options?.convention ?? 'itc';
    const setting = options?.setting ?? 0;
    const cacheKey = `${key}#${setting}#${c}`;
    const hit = cache.get(cacheKey);
    if (hit)
        return hit;
    const family = crystalFamily(pointGroup(key).crystalSystem);
    const positions = positionsOf(family, c).map((dirs) => dirs.map((d) => axisOf(family, d)));
    const all = positions.flat();
    const what = `Point group ${key}`;
    const descriptions = Object.freeze(ops.map((op) => describe(op, all, what)));
    // The full symbol of a grey group ends in 1', which is no position of the symbol.
    const tokens = family === 'triclinic'
        ? []
        : symbol(key, { ...options, form: 'full' })
            .split(' ')
            .filter((t) => t !== "1'");
    const directions = Object.freeze(positions.map((axes, i) => {
        const elements = axes.map((a) => {
            const on = descriptions.filter((d) => d.axis === a);
            const max = (kind, none) => on.filter((d) => d.kind === kind).reduce((m, d) => Math.max(m, d.order), none);
            return Object.freeze({
                ...a,
                rotation: max('rotation', 1),
                rotoinversion: max('rotoinversion', 0),
                mirror: on.some((d) => d.kind === 'mirror'),
            });
        });
        const position = tokens[i] === undefined
            ? { position: i + 1, directions: Object.freeze(elements) }
            : { position: i + 1, symbol: tokens[i], directions: Object.freeze(elements) };
        return Object.freeze(position);
    }));
    const result = {
        descriptions: c === 'birss' ? Object.freeze(descriptions.map(birssSigned)) : descriptions,
        directions,
    };
    cache.set(cacheKey, result);
    return result;
}
const flipped = new Map();
/**
 * The description with the axis signed as in birss-app (docs/conventions.md, "Birss convention and
 * birss-app"): its first non-zero Cartesian component, in the order x, y, z, is positive. If the
 * axis of ITA Table 2.1.3.1 points the other way, axis and sense are reversed; the rotation stays
 * the same.
 */
function birssSigned(d) {
    const a = d.axis;
    if (!a)
        return d;
    const first = a.cartesian.find((x) => Math.abs(x) > 1e-9) ?? 0;
    if (first > 0)
        return d;
    let axis = flipped.get(a);
    if (!axis) {
        axis = Object.freeze({
            lattice: Object.freeze(a.lattice.map((x) => (x === 0 ? 0 : -x))),
            cartesian: Object.freeze(a.cartesian.map((x) => (x === 0 ? 0 : -x))),
        });
        flipped.set(a, axis);
    }
    const sense = d.sense === '+' ? '-' : d.sense === '-' ? '+' : undefined;
    return Object.freeze({ ...d, axis, ...(sense ? { sense } : {}) });
}
/**
 * Each operation of the point group described geometrically, in the order of `operations` for
 * the same key and options. Axes are named by the symmetry direction they lie along: in the ITC
 * convention with the sign of ITA Table 2.1.3.1, in the Birss convention signed as birss-app signs
 * them (first non-zero Cartesian component positive); the sign fixes what the sense refers to.
 */
export function describeOperations(key, options) {
    return analysis(key, options).descriptions;
}
/**
 * The positions of the full Hermann–Mauguin symbol in the requested convention and setting, each
 * with its symmetry directions (ITA Table 2.1.3.1) and the symmetry elements along them. All
 * positions of the crystal family are listed, also those the symbol of the class leaves out (then
 * without `symbol`); the triclinic family has none. The directions keep the sign of Table 2.1.3.1
 * in both conventions; in the Birss convention an axis of `describeOperations` may be reversed, so
 * match it to a direction whose dot product with it is ±1, not by identity.
 */
export function symmetryDirections(key, options) {
    return analysis(key, options).directions;
}
