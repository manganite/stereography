/**
 * Operations in the lattice basis and orbits of faces and directions (docs/conventions.md,
 * "Lattice basis and orbits"). Shared by both entry points.
 */
import { crystalFamily, latticeBasis } from '../lattice.js';
import { apply, inverse, multiply } from '../linalg.js';
import { checkOrthogonal } from '../operations.js';
import { siteTolerance } from '../siteSymmetry.js';
import { operations as groupOperations, pointGroup, } from './pointGroups.js';
const IDENTITY = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];
/**
 * The conventional basis a, b, c (columns) in the Cartesian frame of a point group: that of
 * `latticeBasis`, and for the monoclinic and triclinic families a, b, c along x, y, z, as for the
 * Wyckoff positions (the integer matrices do not depend on the cell angles).
 */
function conventionalBasis(key) {
    const family = crystalFamily(pointGroup(key).crystalSystem);
    return family === 'monoclinic' || family === 'triclinic' ? IDENTITY : latticeBasis(family);
}
/** An integer matrix from one that should be one; throws if it is not (a data error). */
function integer(m, what) {
    const r = m.map((row) => row.map((v) => Math.round(v) + 0));
    if (!m.every((row, i) => row.every((v, j) => Math.abs(v - r[i][j]) < 1e-9))) {
        throw new Error(`${what} is not an integer matrix in the lattice basis: ${JSON.stringify(m)}`);
    }
    return r;
}
const deepFreeze = (m) => Object.freeze(m.map((row) => Object.freeze([...row])));
const latticeCache = new WeakMap();
/**
 * The operations of a point group in the conventional lattice basis (a, b, c; for the trigonal
 * classes the hexagonal axes), in the order and with the time reversal of `operations` for the same
 * setting and convention: integer matrices W acting on the coordinates of a lattice vector [uvw],
 * W = B⁻¹·R·B with the basis B of `latticeBasis` and the Cartesian matrix R. They do not depend on
 * the cell angles, so they exist for every family; for the monoclinic and triclinic families a, b,
 * c are taken along x, y, z, as for the Wyckoff positions. In the ITC convention they are the
 * matrices of ITA's general position (6th ed., Table 3.2.3.2). Not orthogonal in general: pass
 * them to no function that takes Cartesian operations (docs/conventions.md, "Lattice basis and
 * orbits").
 */
export function latticeOperations(key, options) {
    const ops = groupOperations(key, options);
    let result = latticeCache.get(ops);
    if (!result) {
        const b = conventionalBasis(key);
        const bInv = inverse(b);
        result = Object.freeze(ops.map((op, i) => Object.freeze({
            matrix: deepFreeze(integer(multiply(multiply(bInv, op.matrix), b), `Operation ${i} of ${key}`)),
            timeReversal: op.timeReversal,
        })));
        latticeCache.set(ops, result);
    }
    return result;
}
/** The inverse of an integer matrix of determinant ±1, exactly (the adjugate). */
function integerInverse(w) {
    return integer(inverse(w), 'The inverse of a lattice operation');
}
/** Indices of a face or a lattice direction, checked: three integers, not all zero. */
function indicesOf(value, name) {
    if (!Array.isArray(value) ||
        value.length !== 3 ||
        !value.every((x) => typeof x === 'number' && Number.isSafeInteger(x)) ||
        value.every((x) => x === 0)) {
        throw new RangeError(`${name} must be three (safe) integers, not all zero: ${JSON.stringify(value)}`);
    }
    return [value[0] + 0, value[1] + 0, value[2] + 0];
}
export function orbit(key, indices, options) {
    const given = (indices ?? {});
    const hasHkl = given.hkl !== undefined;
    const hasUvw = given.uvw !== undefined;
    if (hasHkl === hasUvw)
        throw new RangeError('orbit: give either hkl (a face) or uvw (a lattice direction)');
    const field = hasHkl ? 'hkl' : 'uvw';
    const v = indicesOf(hasHkl ? given.hkl : given.uvw, field);
    const ws = latticeOperations(key, options).map((op) => (hasHkl ? integerInverseTranspose(op.matrix) : op.matrix));
    const images = [];
    ws.forEach((w, i) => {
        const image = apply(w, v).map((x) => x + 0);
        const k = image.join(',');
        const entry = images.find((e) => e.key === k);
        if (entry)
            entry.operations.push(i);
        else
            images.push({ key: k, value: image, operations: [i] });
    });
    return Object.freeze(images.map((e) => Object.freeze({ [field]: Object.freeze(e.value), operations: Object.freeze(e.operations) })));
}
const inverseTransposeCache = new WeakMap();
function integerInverseTranspose(w) {
    let r = inverseTransposeCache.get(w);
    if (!r) {
        const inv = integerInverse(w);
        r = deepFreeze([0, 1, 2].map((i) => [0, 1, 2].map((j) => inv[j][i])));
        inverseTransposeCache.set(w, r);
    }
    return r;
}
/**
 * The orbit of a direction (any non-zero vector, Cartesian, e.g. a face normal) under a list of
 * operations, for instance those of a distorted crystal: the images of its unit vector under each
 * operation, coinciding images merged (closer than `tolerance`, default `EPSILON`, as for
 * `siteSymmetry`), in the order in which the operations reach them, each with the indices of the
 * operations that map the direction there. The list is taken as it is, not closed into a group.
 * Time reversal is ignored. Throws a RangeError for a zero vector and for a matrix that is not
 * orthogonal (Cartesian; not one of `latticeOperations`).
 */
export function orbitOf(operations, direction, options) {
    const tolerance = siteTolerance(options);
    operations.forEach((op, i) => checkOrthogonal(op.matrix, `Operation ${i}`));
    const n = Math.hypot(direction[0], direction[1], direction[2]);
    if (!(n > 0) || !Number.isFinite(n))
        throw new RangeError(`Not a direction: ${JSON.stringify(direction)}`);
    const u = [direction[0] / n, direction[1] / n, direction[2] / n];
    const poles = [];
    operations.forEach((op, i) => {
        const w = apply(op.matrix, u);
        const pole = poles.find((p) => Math.hypot(p.direction[0] - w[0], p.direction[1] - w[1], p.direction[2] - w[2]) < tolerance);
        if (pole)
            pole.operations.push(i);
        else
            poles.push({ direction: w, operations: [i] });
    });
    return Object.freeze(poles.map((p) => Object.freeze({
        direction: Object.freeze(p.direction),
        operations: Object.freeze(p.operations),
    })));
}
