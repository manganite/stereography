/**
 * Unit cell, metric and angles, for any cell (docs/conventions.md, "Cell, metric and indices").
 * Plain data in and out: a basis is a 3×3 matrix whose columns are a, b, c in Cartesian
 * coordinates, as `latticeBasis` gives it; lengths in any unit, angles in degrees.
 */
import { apply, det, inverse, multiply, transpose } from './linalg.js';
import { checkTimeReversal } from './operations.js';
import { EPSILON } from './tolerances.js';
const DEG = Math.PI / 180;
/** Cosine of an angle in degrees, exact at the multiples of 30° that cells use (90°, 60°, 120°, 180°). */
function cosDeg(x) {
    const r = x % 360;
    const exact = { 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1, 240: -0.5, 270: 0, 300: 0.5 };
    const k = r < 0 ? r + 360 : r;
    return k in exact ? exact[k] : Math.cos(x * DEG);
}
/** The radicand of the volume, 1 − cos²α − cos²β − cos²γ + 2 cos α cos β cos γ. */
function radicand({ alpha, beta, gamma }) {
    const [ca, cb, cg] = [alpha, beta, gamma].map(cosDeg);
    return 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg;
}
function anglesOk({ alpha, beta, gamma }) {
    return [alpha, beta, gamma].every((x) => typeof x === 'number' && Number.isFinite(x) && x > 0 && x < 180);
}
/**
 * Whether three angles (degrees) belong to a cell: each between 0° and 180°, and the three axes not
 * in one plane (the volume radicand 1 − cos²α − cos²β − cos²γ + 2 cos α cos β cos γ exceeds 10⁻¹², i.e.
 * V/(abc) > 10⁻⁶: a cell that is flat within rounding is refused). With
 * `minVolumeRatio` also refuses nearly flat cells, whose ratio V/(abc), the square root of the radicand, is smaller.
 */
export function isValidCell(angles, options) {
    if (!anglesOk(angles))
        return false;
    const min = options?.minVolumeRatio ?? 0;
    if (typeof min !== 'number' || Number.isNaN(min))
        throw new RangeError('isValidCell: minVolumeRatio must be a number');
    const r = radicand(angles);
    if (!(r > 1e-12))
        return false;
    return Math.sqrt(r) >= min;
}
function checkEdges({ a, b, c }) {
    for (const [name, x] of [
        ['a', a],
        ['b', b],
        ['c', c],
    ]) {
        if (typeof x !== 'number' || !Number.isFinite(x) || x <= 0) {
            throw new RangeError(`latticeFromParameters: edge ${name} must be a positive number, not ${JSON.stringify(x)}`);
        }
    }
}
/**
 * The Cartesian basis of a cell as the columns of a 3×3 matrix, in the frame of this library for a
 * general cell: a along x, b in the xy plane (y > 0 for γ < 180°), c towards +z. It is the frame of
 * `latticeBasis` where that exists (hexagonal axes: x ∥ a, z ∥ c), so a cell with the angles of a
 * family has that family's basis scaled by the edge lengths. For the monoclinic family with unique
 * axis b, b lies along y (docs/conventions.md, "Cell, metric and indices"). The basis is
 * right-handed. Throws a RangeError for an edge that is not positive and for angles that give no cell.
 */
export function latticeFromParameters(p) {
    checkEdges(p);
    if (!isValidCell(p)) {
        throw new RangeError(`latticeFromParameters: angles ${p.alpha}°, ${p.beta}°, ${p.gamma}° give no cell`);
    }
    const ca = cosDeg(p.alpha);
    const cb = cosDeg(p.beta);
    const cg = cosDeg(p.gamma);
    const sg = Math.sqrt(1 - cg * cg);
    const volumeRatio = Math.sqrt(radicand(p));
    // columns: a = (a, 0, 0), b = (b cos γ, b sin γ, 0), c = (c cos β, c (cos α − cos β cos γ)/sin γ, c V/(abc sin γ))
    const cy = (p.c * (ca - cb * cg)) / sg;
    const cz = (p.c * volumeRatio) / sg;
    return [
        [p.a + 0, p.b * cg + 0, p.c * cb + 0],
        [0, p.b * sg + 0, cy + 0],
        [0, 0, cz + 0],
    ];
}
function columns(basis) {
    return [0, 1, 2].map((j) => [basis[0][j], basis[1][j], basis[2][j]]);
}
const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
function checkBasis(basis, who) {
    const ok = Array.isArray(basis) &&
        basis.length === 3 &&
        basis.every((r) => Array.isArray(r) && r.length === 3 && r.every((x) => typeof x === 'number' && Number.isFinite(x)));
    if (!ok)
        throw new RangeError(`${who}: the basis must be a 3×3 matrix of finite numbers`);
    const cols = columns(basis);
    const scale = Math.max(...cols.map(norm));
    if (!(Math.abs(det(basis)) > 1e-9 * scale ** 3))
        throw new RangeError(`${who}: singular basis`);
}
/**
 * The lattice parameters of a basis given as the columns of a Cartesian matrix: the edge lengths and
 * the angles in degrees. Independent of the orientation of the basis in the Cartesian frame (and
 * of its handedness). Throws a RangeError for a singular matrix.
 */
export function latticeParameters(basis) {
    checkBasis(basis, 'latticeParameters');
    const [a, b, c] = columns(basis);
    const angle = (u, v) => {
        const cross = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        return Math.atan2(norm(cross), dot(u, v)) / DEG + 0;
    };
    return { a: norm(a), b: norm(b), c: norm(c), alpha: angle(b, c), beta: angle(a, c), gamma: angle(a, b) };
}
/** The metric tensor G = AᵀA of a basis A (columns a, b, c): g_ij = a_i · a_j, in the unit of the edge lengths squared. */
export function metricTensor(basis) {
    checkBasis(basis, 'metricTensor');
    return multiply(transpose(basis), basis);
}
/**
 * The reciprocal basis B = A⁻ᵀ of a basis A (columns a, b, c) as the columns a*, b*, c*, with
 * a_i · a*_j = δ_ij (no factor 2π), in the inverse unit of the edge lengths.
 */
export function reciprocalBasis(basis) {
    checkBasis(basis, 'reciprocalBasis');
    return transpose(inverse(basis));
}
function vector(v, name) {
    if (!Array.isArray(v) || v.length !== 3 || !v.every((x) => typeof x === 'number' && Number.isFinite(x))) {
        throw new RangeError(`${name} must be three finite numbers`);
    }
    if (v.every((x) => x === 0))
        throw new RangeError(`${name} must not be the zero vector`);
    return v;
}
function angleOf(u, v) {
    const cross = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return Math.atan2(norm(cross), dot(u, v)) / DEG + 0;
}
/** The angle in degrees between two lattice directions [uvw] (coordinates in the basis, columns a, b, c), 0° to 180°. Throws a RangeError for a zero vector. */
export function angleBetweenDirections(basis, u, v) {
    checkBasis(basis, 'angleBetweenDirections');
    return angleOf(apply(basis, vector(u, 'u')), apply(basis, vector(v, 'v')));
}
/**
 * The angle in degrees between the normals of two planes (hkl), 0° to 180°: the angle between the
 * reciprocal vectors h·a* + k·b* + l·c*. For two faces this is 180° minus the interior dihedral
 * angle. Throws a RangeError for a zero vector.
 */
export function angleBetweenPlanes(basis, h, k) {
    checkBasis(basis, 'angleBetweenPlanes');
    const b = reciprocalBasis(basis);
    return angleOf(apply(b, vector(h, 'h')), apply(b, vector(k, 'k')));
}
/**
 * The operations that leave the metric of a cell unchanged: those W (integer matrices on the
 * coordinates of a lattice direction, as `latticeOperations` gives them) with WᵀGW = G, G the metric
 * tensor of `basis`. It is the point symmetry of a distorted lattice among the operations of a group;
 * the list is taken as it is, not closed into a group, and the kept operations are the ones of the
 * list, in its order. The deviation counts relative to the largest entry of G (`tolerance`, default
 * `EPSILON`), so the result does not depend on the unit of the edge lengths.
 */
export function residualOperations(operations, basis, options) {
    const g = metricTensor(basis);
    const tolerance = options?.tolerance ?? EPSILON;
    if (typeof tolerance !== 'number' || !Number.isFinite(tolerance) || tolerance < 0) {
        throw new RangeError(`residualOperations: tolerance must be a non-negative number, not ${JSON.stringify(tolerance)}`);
    }
    if (!Array.isArray(operations))
        throw new RangeError('residualOperations: operations must be a list');
    operations.forEach((op, i) => {
        const m = op?.matrix;
        const ok = Array.isArray(m) &&
            m.length === 3 &&
            m.every((r) => Array.isArray(r) && r.length === 3 && r.every((x) => typeof x === 'number' && Number.isFinite(x)));
        if (!ok)
            throw new RangeError(`residualOperations: operation ${i} has no 3×3 matrix of finite numbers`);
    });
    const scale = Math.max(...g.flat().map(Math.abs));
    return operations.filter((op) => {
        const m = multiply(multiply(transpose(op.matrix), g), op.matrix);
        return m.every((row, i) => row.every((x, j) => Math.abs(x - g[i][j]) <= tolerance * scale));
    });
}
/**
 * The operations of a list that keep the metric of a cell: W with WᵀGW = G, G the metric tensor
 * of `basis`. The operations are integer matrices on lattice coordinates, as `latticeOperations`
 * gives them; the list is taken as it is and the kept operations are the ones of the list, in its
 * order. The deviation counts relative to the largest entry of G (`tolerance`, default `EPSILON`).
 * Every operation must say whether it is combined with time reversal (`timeReversal`), which is
 * kept; one that does not (an operation of the crystallographic API) is a RangeError.
 */
export function residualMagneticOperations(operations, basis, options) {
    if (Array.isArray(operations))
        checkTimeReversal(operations);
    return residualOperations(operations, basis, options);
}
