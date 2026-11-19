/**
 * Wyckoff positions of the crystal classes for directions (face normals), in the ITC convention:
 * ITA's letters, multiplicities and oriented site-symmetry symbols, a representative face, and the
 * Wyckoff position of any direction (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
import { type Vec3 } from '../linalg.js';
import { type PointGroupKey, type SettingOptions } from './pointGroups.js';
import { type SiteSymmetryOptions } from '../siteSymmetry.js';
/** A face (hkl): three Miller indices in the conventional basis (for hexagonal axes without i = −(h + k)). */
export type Hkl = readonly [number, number, number];
/** One Wyckoff position of a point group for directions. */
export interface WyckoffPosition {
    /** ITA's Wyckoff letter. */
    readonly letter: string;
    /** Number of equivalent directions (faces of the form). */
    readonly multiplicity: number;
    /** Oriented site-symmetry symbol as ITA prints it, e.g. `..m`, `4m.m`, `1`. */
    readonly siteSymmetry: string;
    /** ITA's representative point as printed, e.g. `x,x,z` (a leading `-` is an overbar). */
    readonly coordinates: string;
    /**
     * ITA's representative face as printed, components separated by commas, e.g. `h,h,l`, or
     * `h,h,-2h,l` (Bravais–Miller indices) for hexagonal axes.
     */
    readonly millerIndices: string;
    /** A representative face with numbers: `millerIndices` with h = 3, k = 2, l = 1. */
    readonly representative: {
        readonly hkl: Hkl;
        /**
         * Its face normal, a Cartesian unit vector. Monoclinic and triclinic: the normal for a, b, c along
         * x, y, z (no cell angles), exact for the unique axis only, but with the correct site symmetry.
         */
        readonly cartesian: Vec3;
    };
    /** Indices into `operations` (same setting, ITC convention) of the site symmetry of the representative. */
    readonly siteSymmetryOperations: readonly number[];
}
export type WyckoffOptions = SettingOptions & SiteSymmetryOptions;
/**
 * The Wyckoff positions of a point group for directions, in ITA's printed order (general position
 * first), in the ITC convention only (throws a RangeError for `'birss'`). The point at the origin
 * (letter o) is not a direction and is left out. For `mm2` settings 2 and 3 (`2mm`, `m2m`), which
 * ITA does not print, the positions of setting 1 carried into their frame.
 */
export declare function wyckoffPositions(key: PointGroupKey, options?: SettingOptions): readonly WyckoffPosition[];
/**
 * The Wyckoff position of a direction (any non-zero Cartesian vector) in a point group, ITC
 * convention only: the position whose representative has a site symmetry conjugate to that of the
 * direction (ITA's definition). `tolerance` as for `siteSymmetry`; throws a RangeError if the
 * operations found within it do not match any position (a tolerance too large).
 */
export declare function wyckoffPositionOf(key: PointGroupKey, direction: Vec3, options?: WyckoffOptions): WyckoffPosition;
