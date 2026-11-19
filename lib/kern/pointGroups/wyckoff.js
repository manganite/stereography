/**
 * Wyckoff positions of the crystal classes for directions (face normals), in the ITC convention:
 * ITA's letters, multiplicities and oriented site-symmetry symbols, a representative face, and the
 * Wyckoff position of any direction (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
import { apply, inverse, transpose } from '../linalg.js';
import { crystalFamily, latticeBasis } from '../lattice.js';
import { POINT_GROUP_DATA } from './data.js';
import { operations, settings } from './pointGroups.js';
import { siteSymmetry, siteTolerance } from '../siteSymmetry.js';
import { ITA_WYCKOFF } from './wyckoffData.js';
/** The values substituted into ITA's Miller indices for the numeric representative. */
const VALUES = { h: 3, k: 2, l: 1 };
/** One printed index (`h`, `-2h`, `0`, `1`) as a number. */
function index(component) {
    const m = /^(-?)(\d*)([hkil]?)$/.exec(component);
    if (!m || (m[2] === '' && m[3] === ''))
        throw new Error(`Unreadable Miller index: ${component}`);
    const sign = m[1] ? -1 : 1;
    const factor = m[2] === '' ? 1 : Number(m[2]);
    if (m[3] === '')
        return sign * factor;
    if (m[3] === 'i')
        return sign * factor * -(VALUES.h + VALUES.k);
    return sign * factor * VALUES[m[3]];
}
/** Printed Miller indices (three, or four for hexagonal axes) as three numbers. */
function numericHkl(miller) {
    const parts = miller.split(',').map(index);
    if (parts.length === 3)
        return [parts[0], parts[1], parts[2]];
    if (parts.length === 4 && parts[2] === -(parts[0] + parts[1]))
        return [parts[0], parts[1], parts[3]];
    throw new Error(`Unreadable Miller indices: ${miller}`);
}
const IDENTITY = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];
/** The face normal of (hkl) as a Cartesian unit vector: h a* + k b* + l c* with the reciprocal basis B⁻ᵀ. */
function normal(basis, hkl) {
    const v = apply(transpose(inverse(basis)), hkl);
    const n = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / n, v[1] / n, v[2] / n];
}
const XYZ = 'xyz';
const HKL = 'hkl';
/**
 * A printed pattern carried by a signed permutation r of the axes (new axis i = r[i][j] × old axis j).
 * Only for components that are `0`, a number, or a plain letter with an optional `-` (as in `mm2`); a
 * letter is renamed after its new position. A factor such as `2x` throws.
 */
function permutePattern(pattern, r, letters) {
    const old = pattern.split(',');
    if (old.length !== 3)
        throw new Error(`Cannot carry ${pattern} into another setting`);
    return [0, 1, 2]
        .map((i) => {
        const j = [0, 1, 2].find((k) => Math.abs(r[i][k]) === 1);
        if (j === undefined)
            throw new Error('Not a signed permutation');
        const c = old[j];
        if (c === '0')
            return '0';
        const negative = c.startsWith('-') !== r[i][j] < 0;
        const body = c.replace(/^-/, '');
        if (!/^(\d+|[a-z])$/.test(body))
            throw new Error(`Cannot carry ${pattern} into another setting`);
        const renamed = /^\d+$/.test(body) ? body : letters[i];
        return (negative ? '-' : '') + renamed;
    })
        .join(',');
}
/** An oriented site-symmetry symbol with three positions, carried by r: new position i is old position j. */
function permuteSymbol(symbolText, r) {
    if (symbolText === '1')
        return symbolText;
    if (symbolText.length !== 3)
        throw new Error(`Cannot carry ${symbolText} into another setting`);
    return [0, 1, 2].map((i) => symbolText[[0, 1, 2].find((k) => Math.abs(r[i][k]) === 1) ?? -1]).join('');
}
function isSignedPermutation(r) {
    return r.every((row) => row.filter((v) => Math.abs(v) > 1e-9).length === 1 && row.some((v) => Math.abs(Math.abs(v) - 1) < 1e-9));
}
/** The printed rows of a setting; for a setting ITA does not print, those of setting 1 carried into its frame. */
function printedRows(key, setting) {
    const s = settings(key, 'itc')[setting - 1];
    const entry = ITA_WYCKOFF.find((e) => e.symbol === s.symbol && (e.uniqueAxis === undefined || e.uniqueAxis === s.uniqueAxis));
    if (entry)
        return entry.rows;
    if (setting === 1)
        throw new Error(`Point group ${key}: no printed Wyckoff positions for setting 1`);
    const d = POINT_GROUP_DATA.find((x) => x.key === key);
    if (!d)
        throw new RangeError(`Unknown point group key: ${JSON.stringify(key)}`);
    const f1 = d.settings[0].frame;
    const fk = d.settings[setting - 1].frame;
    const raw = fk.map((row) => [0, 1, 2].map((j) => row[0] * f1[j][0] + row[1] * f1[j][1] + row[2] * f1[j][2]));
    const r = raw.map((row) => row.map((v) => Math.round(v)));
    if (!isSignedPermutation(raw) ||
        !raw.every((row, i) => row.every((v, j) => Math.abs(v - r[i][j]) < 1e-9))) {
        throw new Error(`Point group ${key}, setting ${setting}: frame is not a permutation of setting 1`);
    }
    return printedRows(key, 1).map(([letter, mult, site, coords, miller]) => [
        letter,
        mult,
        permuteSymbol(site, r),
        permutePattern(coords, r, XYZ),
        miller === '' ? '' : permutePattern(miller, r, HKL),
    ]);
}
const cache = new Map();
function itcSetting(key, options) {
    if ((options?.convention ?? 'itc') !== 'itc') {
        throw new RangeError("Wyckoff positions exist in the ITC convention only (convention 'itc')");
    }
    const list = settings(key, 'itc');
    const index = options?.setting ?? list.find((s) => s.isDefault)?.index ?? 1;
    operations(key, { convention: 'itc', setting: index }); // validates the setting index
    return index;
}
/**
 * The Wyckoff positions of a point group for directions, in ITA's printed order (general position
 * first), in the ITC convention only (throws a RangeError for `'birss'`). The point at the origin
 * (letter o) is not a direction and is left out. For `mm2` settings 2 and 3 (`2mm`, `m2m`), which
 * ITA does not print, the positions of setting 1 carried into their frame.
 */
export function wyckoffPositions(key, options) {
    const setting = itcSetting(key, options);
    const cacheKey = `${key}#${setting}`;
    let result = cache.get(cacheKey);
    if (!result) {
        const ops = operations(key, { convention: 'itc', setting });
        const d = POINT_GROUP_DATA.find((x) => x.key === key);
        if (!d)
            throw new RangeError(`Unknown point group key: ${JSON.stringify(key)}`);
        const family = crystalFamily(d.crystalSystem);
        // Monoclinic and triclinic: a, b, c along x, y, z (docs/conventions.md, "Site symmetry and Wyckoff positions").
        const basis = family === 'monoclinic' || family === 'triclinic' ? IDENTITY : latticeBasis(family);
        result = Object.freeze(printedRows(key, setting)
            .filter(([letter]) => letter !== 'o')
            .map(([letter, multiplicity, site, coordinates, millerIndices]) => {
            const hkl = numericHkl(millerIndices);
            const cartesian = normal(basis, hkl);
            const stab = siteSymmetry(ops, cartesian);
            if (stab.multiplicity !== multiplicity) {
                throw new Error(`Point group ${key}, setting ${setting}, position ${letter}: multiplicity differs from print`);
            }
            return Object.freeze({
                letter,
                multiplicity,
                siteSymmetry: site,
                coordinates,
                millerIndices,
                representative: Object.freeze({
                    hkl: Object.freeze(hkl),
                    cartesian: Object.freeze(cartesian),
                }),
                siteSymmetryOperations: stab.operations,
            });
        }));
        cache.set(cacheKey, result);
    }
    return result;
}
const sortedKey = (list) => [...list].sort((a, b) => a - b).join(',');
/**
 * The Wyckoff position of a direction (any non-zero Cartesian vector) in a point group, ITC
 * convention only: the position whose representative has a site symmetry conjugate to that of the
 * direction (ITA's definition). `tolerance` as for `siteSymmetry`; throws a RangeError if the
 * operations found within it do not match any position (a tolerance too large).
 */
export function wyckoffPositionOf(key, direction, options) {
    const tolerance = siteTolerance(options);
    const setting = itcSetting(key, options);
    const ops = operations(key, { convention: 'itc', setting });
    const rows = wyckoffPositions(key, { convention: 'itc', setting });
    const site = siteSymmetry(ops, direction, { tolerance });
    const candidates = rows.filter((r) => r.siteSymmetryOperations.length === site.operations.length);
    for (const g of ops) {
        const k = sortedKey(siteSymmetry(ops, apply(g.matrix, site.direction), { tolerance }).operations);
        const row = candidates.find((r) => sortedKey(r.siteSymmetryOperations) === k);
        if (row)
            return row;
    }
    throw new RangeError(`Point group ${key}, setting ${setting}: no Wyckoff position for ${JSON.stringify(direction)} (tolerance too large?)`);
}
