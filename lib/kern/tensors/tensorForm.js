/**
 * Symmetry-reduced forms of property tensors: which Cartesian components of a tensor of rank 0 to 4
 * a point group allows, and how they depend on each other. Results are plain numbers (coefficient
 * matrices and index lists); formulas, LaTeX and diagrams stay in the applications (CLAUDE.md,
 * "Tensors").
 *
 * Components are numbered by their flat index: for indices (i₁, …, iₙ) with x, y, z = 0, 1, 2 the
 * flat index is i₁·3ⁿ⁻¹ + … + iₙ, so the first index varies slowest (row-major, the order of a
 * NumPy array of shape (3,)*n in C order). Moved from birss-app (`tensorForms.ts`,
 * `tensorProjection.ts`, `linalg.ts`, revision 2be5fe3).
 */
import { det } from '../linalg.js';
import { checkOrthogonal, checkTimeReversal, closeGroup } from '../operations.js';
import { operations, settings } from '../pointGroups/pointGroups.js';
import { specOf } from './propertyTable.js';
import { EPSILON, SNAP_EPSILON } from '../tolerances.js';
import { reducedRowEchelon } from './rowEchelon.js';
const RANKS = [0, 1, 2, 3, 4];
/** Checks a specification and returns the index permutations that generate its intrinsic symmetry. */
function checkSpec(spec) {
    const { rank, parity, timeParity, intrinsic } = spec;
    if (!RANKS.includes(rank))
        throw new RangeError(`Tensor rank must be 0 to 4, not ${JSON.stringify(rank)}`);
    if (parity !== 'polar' && parity !== 'axial')
        throw new RangeError(`Unknown tensor parity: ${JSON.stringify(parity)}`);
    if (timeParity !== 'i' && timeParity !== 'c')
        throw new RangeError(`Unknown time parity: ${JSON.stringify(timeParity)}`);
    const swap = (a, b) => {
        const p = Array.from({ length: rank }, (_, k) => k);
        [p[a], p[b]] = [p[b], p[a]];
        return p;
    };
    switch (intrinsic) {
        case 'none':
            return [];
        case 'ij':
        case 'jk':
            if (rank < 2)
                throw new RangeError(`Intrinsic symmetry '${intrinsic}' needs rank 2 or more, not ${rank}`);
            return [intrinsic === 'ij' ? swap(0, 1) : swap(rank - 2, rank - 1)];
        case 'ij_kl':
        case 'voigt':
            if (rank !== 4)
                throw new RangeError(`Intrinsic symmetry '${intrinsic}' needs rank 4, not ${rank}`);
            return intrinsic === 'ij_kl' ? [swap(0, 1), swap(2, 3)] : [swap(0, 1), swap(2, 3), [2, 3, 0, 1]];
        default:
            throw new RangeError(`Unknown intrinsic symmetry: ${JSON.stringify(intrinsic)}`);
    }
}
/** The indices (x, y, z = 0, 1, 2) of every flat index at a rank, first index first. */
const digitTables = new Map();
function digits(rank) {
    let table = digitTables.get(rank);
    if (!table) {
        table = Array.from({ length: 3 ** rank }, (_, flat) => Array.from({ length: rank }, (_, k) => Math.floor(flat / 3 ** (rank - 1 - k)) % 3));
        digitTables.set(rank, table);
    }
    return table;
}
/** The flat indices reached from `flat` by the index permutations (`out[k] = in[perm[k]]`). */
function orbit(flat, rank, perms) {
    const d = digits(rank);
    const seen = new Set([flat]);
    const stack = [flat];
    while (stack.length > 0) {
        const cur = stack.pop();
        for (const p of perms) {
            let next = 0;
            for (let k = 0; k < rank; k++)
                next = next * 3 + d[cur][p[k]];
            if (!seen.has(next)) {
                seen.add(next);
                stack.push(next);
            }
        }
    }
    return [...seen];
}
function freezeRows(rows) {
    return Object.freeze(rows.map((r) => Object.freeze([...r])));
}
/**
 * The form for a group given as its full list of operations. The group average of each seed
 * (a unit tensor on one orbit of the intrinsic symmetry) projects it onto the invariant subspace;
 * the projections span it, and the reduced row echelon form makes the basis minimal and canonical.
 */
function project(group, spec, perms) {
    const { rank } = spec;
    const dim = 3 ** rank;
    const d = digits(rank);
    const ops = group.map((op) => ({
        m: op.matrix.flat(),
        sign: (spec.parity === 'axial' ? Math.sign(det(op.matrix)) : 1) * (spec.timeParity === 'c' && op.timeReversal ? -1 : 1),
    }));
    const spanning = [];
    for (let seed = 0; seed < dim; seed++) {
        const members = orbit(seed, rank, perms);
        if (seed !== Math.min(...members))
            continue;
        const averaged = new Array(dim).fill(0);
        for (const { m, sign } of ops) {
            for (let out = 0; out < dim; out++) {
                const o = d[out];
                let acc = 0;
                for (const s of members) {
                    const i = d[s];
                    let p = 1;
                    for (let r = 0; r < rank; r++)
                        p *= m[o[r] * 3 + i[r]];
                    acc += p;
                }
                averaged[out] += sign * acc;
            }
        }
        for (let k = 0; k < dim; k++)
            averaged[k] /= ops.length;
        if (averaged.some((x) => Math.abs(x) >= EPSILON))
            spanning.push(averaged);
    }
    const basis = reducedRowEchelon(spanning, dim).map((row) => row.map(snapEntry));
    const pivots = basis.map((row) => row.findIndex((x) => x !== 0));
    const relations = [];
    for (let c = 0; c < dim; c++) {
        if (pivots.includes(c))
            continue;
        const row = new Array(dim).fill(0);
        row[c] = 1;
        basis.forEach((b, k) => {
            if (b[c] !== 0)
                row[pivots[k]] = -b[c];
        });
        relations.push(row);
    }
    return Object.freeze({
        rank,
        basis: freezeRows(basis),
        parameters: freezeRows(pivots.map((p) => d[p])),
        relations: freezeRows(relations),
    });
}
/**
 * An entry within 10⁻⁹ of a multiple of 1/12 is set to it, so that the exact values of the
 * crystallographic forms (0, ±1/2, ±1, ±2 for the 32 classes in all settings) come out exact instead
 * of with rounding errors of the order of 10⁻¹⁵; other values (e.g. for a rotated frame) are kept.
 */
function snapEntry(x) {
    const r = Math.round(x * 12) / 12;
    return Math.abs(x - r) < SNAP_EPSILON ? r + 0 : x;
}
function specKey(spec) {
    return `${spec.rank}:${spec.parity}:${spec.timeParity}:${spec.intrinsic}`;
}
const formCache = new Map();
/**
 * The form of a tensor under a point group, a crystal class or a magnetic point group, in the
 * requested setting (default: the default setting of the convention, `'itc'` unless given). The
 * tensor is given by its specification or by the name of a property in `TENSOR_PROPERTIES`
 * (`'piezoelectric'`). The convention matters only through the setting: the same setting index
 * gives the same form in both conventions (docs/conventions.md, "Tensors").
 */
export function tensorForm(key, spec, options) {
    const resolved = specOf(spec);
    const perms = checkSpec(resolved);
    const ops = operations(key, options); // checks key, convention and setting
    const index = options?.setting ?? settings(key, options?.convention).find((s) => s.isDefault).index;
    const cacheKey = `${key}#${index}#${specKey(resolved)}`;
    let form = formCache.get(cacheKey);
    if (!form) {
        form = project(ops, resolved, perms);
        formCache.set(cacheKey, form);
    }
    return form;
}
/**
 * The form of a tensor under the group generated by `operations`, e.g. the site symmetry of a
 * surface normal (`siteSymmetry`) or the operations of a distorted crystal. The tensor is given by
 * its specification or by the name of a property in `TENSOR_PROPERTIES`. The operations are
 * Cartesian and orthogonal, and each says whether it is combined with time reversal
 * (`timeReversal`, true or false); a list that is not closed is closed first.
 */
export function tensorFormOf(operations, spec) {
    const resolved = specOf(spec);
    const perms = checkSpec(resolved);
    operations.forEach((op, i) => checkOrthogonal(op.matrix, `Operation ${i}`));
    checkTimeReversal(operations);
    return project(closeGroup(operations), resolved, perms);
}
/**
 * The components of `tensor` (length 3^rank, flat index) in a frame rotated by the orthogonal
 * matrix `rotation`: t′_{i…} = f·Σ R_{ia}…R_{…}·t_{a…}, with f = det(R) for an axial tensor and 1
 * for a polar one. To express a tensor in the frame of a surface, pass the matrix whose rows are
 * the new axes in the old frame. Time parity plays no part. The kind of tensor is given by its
 * specification or by the name of a property in `TENSOR_PROPERTIES`.
 */
export function rotateTensor(tensor, rotation, specOrName) {
    const spec = specOf(specOrName);
    checkSpec(spec);
    checkOrthogonal(rotation, 'The rotation');
    const { rank } = spec;
    const dim = 3 ** rank;
    if (tensor.length !== dim)
        throw new RangeError(`A tensor of rank ${rank} has ${dim} components, not ${tensor.length}`);
    const d = digits(rank);
    const m = rotation.flat();
    const f = spec.parity === 'axial' ? Math.sign(det(rotation)) : 1;
    const out = new Array(dim).fill(0);
    for (let o = 0; o < dim; o++) {
        let acc = 0;
        for (let s = 0; s < dim; s++) {
            if (tensor[s] === 0)
                continue;
            let p = tensor[s];
            for (let r = 0; r < rank; r++)
                p *= m[d[o][r] * 3 + d[s][r]];
            acc += p;
        }
        out[o] = f * acc;
    }
    return out;
}
