/**
 * Hermann–Mauguin symbols of the black-and-white point groups. The symbol of such a group in a
 * given frame is the symbol of its crystal class in that frame, each position carrying a prime if
 * the operation it names is combined with time reversal (ITC Vol. D, § 1.5.2.1, Table 1.5.2.3).
 * So no symbols are stored for these groups: they follow from the symbols of the class
 * (data.ts) and the operations (docs/conventions.md, "Symbols").
 */
import { matricesEqual } from '../linalg.js';
import { crystalFamily, latticeBasis } from '../lattice.js';
import { LATTICE_SYMMETRY_DIRECTIONS } from '../symmetryDirections.js';
/** The Cartesian direction of the first symmetry direction of each position of the full symbol. */
function positionDirections(family, convention) {
    const positions = LATTICE_SYMMETRY_DIRECTIONS[family];
    // Birss reads position 2 of the hexagonal family along y and position 3 along x
    // (docs/conventions.md, "Where ITC and Birss differ").
    const ordered = convention === 'birss' && family === 'hexagonal' ? [positions[0], positions[2], positions[1]] : positions;
    // Monoclinic: a, b, c along x, y, z, exact for the unique axis, the only one with an element.
    const b = family === 'monoclinic' || family === 'triclinic'
        ? [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]
        : latticeBasis(family);
    return ordered.map(([uvw]) => [
        b[0][0] * uvw[0] + b[0][1] * uvw[1] + b[0][2] * uvw[2],
        b[1][0] * uvw[0] + b[1][1] * uvw[1] + b[1][2] * uvw[2],
        b[2][0] * uvw[0] + b[2][1] * uvw[1] + b[2][2] * uvw[2],
    ]);
}
/** Proper rotation by 360°/n about the direction u (Rodrigues' formula), times `sign`. */
function rotation(u, n, sign) {
    const length = Math.hypot(u[0], u[1], u[2]);
    const [x, y, z] = [u[0] / length, u[1] / length, u[2] / length];
    const a = (2 * Math.PI) / n;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const t = 1 - c;
    const r = [
        [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
        [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
        [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
    ];
    return r.map((row) => row.map((v) => sign * v));
}
/** `'` if the operation with this matrix is combined with time reversal in `ops`, otherwise ``. */
function prime(ops, matrix, what) {
    const op = ops.find((x) => matricesEqual(x.matrix, matrix));
    if (!op)
        throw new Error(`${what}: the group does not contain the operation its symbol names`);
    return op.timeReversal ? "'" : '';
}
/** One position (`N`, `-N`, `N/m`, `m`, `1`) with the primes of the operations along `u`. */
function primedToken(token, u, ops, what) {
    if (token === '1')
        return token;
    const parts = /^(?:(-?)([1-6]))?(\/?m)?$/.exec(token);
    if (!parts || token === '')
        throw new Error(`${what}: unreadable position ${JSON.stringify(token)}`);
    const [, bar, n, mirror] = parts;
    let result = '';
    if (n) {
        // -1 is the inversion and needs no direction; every other axis lies along u.
        if (n === '1')
            result = `${bar}1${prime(ops, rotation([0, 0, 1], 1, -1), what)}`;
        else {
            if (!u)
                throw new Error(`${what}: no symmetry direction for position ${token}`);
            result = `${bar}${n}${prime(ops, rotation(u, Number(n), bar ? -1 : 1), what)}`;
        }
    }
    if (mirror) {
        if (!u)
            throw new Error(`${what}: no symmetry direction for position ${token}`);
        result += `${mirror}${prime(ops, rotation(u, 2, -1), what)}`;
    }
    return result;
}
/** The positions of a short symbol: `N`, `-N`, `N/m`, `m`. */
function shortTokens(symbol) {
    const list = symbol.match(/-?[1-6](\/m)?|m/g) ?? [];
    if (list.join('') !== symbol)
        throw new Error(`Unreadable symbol: ${symbol}`);
    return list;
}
/**
 * The symbols of a black-and-white group in one frame: the short and the full symbol of its
 * crystal class in that frame, in the given convention, with primes taken from `ops`, the
 * operations of the group in that frame.
 */
export function primedSymbols(classSymbols, system, convention, ops) {
    const family = crystalFamily(system);
    const directions = positionDirections(family, convention);
    const what = `Symbol ${classSymbols.short}`;
    const fullTokens = classSymbols.full.split(' ');
    const full = fullTokens.map((t, i) => primedToken(t, directions[i], ops, what)).join(' ');
    const tokens = shortTokens(classSymbols.short);
    // A monoclinic short symbol has one position: the one of the unique axis in the full symbol.
    const offset = family === 'monoclinic' && tokens.length === 1 ? fullTokens.findIndex((t) => t !== '1') : 0;
    const short = tokens.map((t, i) => primedToken(t, directions[i + offset], ops, what)).join('');
    return { short, full };
}
