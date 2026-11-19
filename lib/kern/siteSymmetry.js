/**
 * Site symmetry of a direction under any list of point operations: which operations leave it
 * fixed (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
import { apply, matricesEqual, multiply } from './linalg.js';
import { EPSILON } from './tolerances.js';
function unit(v) {
    const n = Math.hypot(v[0], v[1], v[2]);
    if (!(n > 0) || !Number.isFinite(n))
        throw new RangeError(`Not a direction: ${JSON.stringify(v)}`);
    return [v[0] / n, v[1] / n, v[2] / n];
}
function fixes(op, v, tolerance) {
    const w = apply(op.matrix, v);
    return Math.hypot(w[0] - v[0], w[1] - v[1], w[2] - v[2]) < tolerance;
}
function isIdentity(op) {
    return op.matrix.every((row, i) => row.every((v, j) => Math.abs(v - (i === j ? 1 : 0)) < EPSILON));
}
/** Products already looked up, per list of operations: `i * n + j` → index of op[i]·op[j] in the list, or -1. */
const productTables = new WeakMap();
function productIndex(operations, i, j) {
    let table = productTables.get(operations);
    if (!table) {
        table = new Map();
        productTables.set(operations, table);
    }
    const key = i * operations.length + j;
    let k = table.get(key);
    if (k === undefined) {
        const product = multiply(operations[i].matrix, operations[j].matrix);
        k = operations.findIndex((op) => matricesEqual(op.matrix, product));
        table.set(key, k);
    }
    return k;
}
/** The indices plus those of every product of two of them that is itself in the list, until closed. */
function closeWithin(operations, indices) {
    const set = [...indices];
    const inSet = new Set(set);
    // Each element is multiplied with every element before it once, in both orders, as it is added.
    for (let i = 0; i < set.length; i++) {
        for (let j = 0; j <= i; j++) {
            for (const k of [productIndex(operations, set[i], set[j]), productIndex(operations, set[j], set[i])]) {
                if (k >= 0 && !inSet.has(k)) {
                    inSet.add(k);
                    set.push(k);
                }
            }
        }
    }
    return set.sort((x, y) => x - y);
}
/** The normalised mean of the images of v under the operations at `indices`; undefined if it vanishes. */
function meanImage(operations, indices, v) {
    if (indices.length === 0)
        return v;
    const sum = [0, 0, 0];
    for (const i of indices) {
        const w = apply(operations[i].matrix, v);
        sum[0] += w[0];
        sum[1] += w[1];
        sum[2] += w[2];
    }
    const n = Math.hypot(sum[0], sum[1], sum[2]);
    return n > 1e-9 * indices.length ? [sum[0] / n, sum[1] / n, sum[2] / n] : undefined;
}
const sameIndices = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
/** The tolerance of the options, checked. */
export function siteTolerance(options) {
    const t = options?.tolerance ?? EPSILON;
    if (!(typeof t === 'number' && t > 0 && t < 1))
        throw new RangeError(`Invalid tolerance: ${String(t)}`);
    return t;
}
/**
 * The site symmetry of `direction` (any non-zero vector, Cartesian) under `operations`, which may
 * be any list of point operations (for instance those of a distorted crystal). Time reversal is
 * ignored: a direction or a face normal is not changed by it. The operations fixing the direction
 * within the tolerance are closed under the products found in the list and the direction is set onto
 * their fixed space, repeated until stable, so that for a group the result is a subgroup and the
 * set direction lies exactly on its elements. For a list that is not a group, `multiplicity` may
 * not be an integer. Throws a RangeError for a zero vector, and if the closed operations fix no
 * common direction (a tolerance far too large, e.g. 0.5).
 */
export function siteSymmetry(operations, direction, options) {
    const tolerance = siteTolerance(options);
    const v = unit(direction);
    const fixing = (w) => {
        const out = [];
        operations.forEach((op, i) => {
            if (fixes(op, w, tolerance))
                out.push(i);
        });
        return out;
    };
    // Within the tolerance the operations fixing v need not form a group (near an axis a rotation can count
    // as fixing while its square does not). Close them under products found in the list, set v onto the
    // fixed space of the closure (the mean of its images, the projector for a group), and repeat on the
    // projected direction until the set is stable.
    let indices = fixing(v);
    let projected = v;
    let set = closeWithin(operations, indices);
    for (let pass = 0; pass < 8; pass++) {
        const mean = meanImage(operations, set, v);
        if (mean === undefined) {
            throw new RangeError(`No common fixed direction for the operations fixing ${JSON.stringify(direction)} within ${tolerance} (tolerance too large?)`);
        }
        const next = closeWithin(operations, fixing(mean));
        if (sameIndices(next, set)) {
            indices = set;
            projected = mean;
            break;
        }
        set = next;
    }
    return Object.freeze({
        operations: Object.freeze(indices),
        direction: Object.freeze(projected),
        multiplicity: indices.length > 0 ? operations.length / indices.length : operations.length,
        general: indices.every((i) => isIdentity(operations[i])),
    });
}
