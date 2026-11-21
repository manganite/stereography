/**
 * Wyckoff positions of the crystal classes for directions (face normals), in the ITC convention:
 * ITA's letters, multiplicities and oriented site-symmetry symbols, a representative face, and the
 * Wyckoff position of any direction (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
import { type Mat3, type Vec3 } from '../linalg.js';
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
        /** The Miller indices (hkl) of the face. */
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
/** Convention and setting (`SettingOptions`) and the tolerance of `siteSymmetry` (`SiteSymmetryOptions`). */
export type WyckoffOptions = SettingOptions & SiteSymmetryOptions;
/** The values substituted into ITA's Miller indices for the numeric representative. */
export declare const REPRESENTATIVE_VALUES: Readonly<Record<'h' | 'k' | 'l', number>>;
/** Printed Miller indices (three, or four for hexagonal axes) as three numbers, with the given values of h, k, l. */
export declare function numericHkl(miller: string, values?: Readonly<Record<"h" | "k" | "l", number>>): Hkl;
export declare const IDENTITY: Mat3;
/** The face normal of (hkl) as a Cartesian unit vector: h a* + k b* + l c* with the reciprocal basis B⁻ᵀ. */
export declare function normal(basis: Mat3, hkl: Hkl): Vec3;
/**
 * A printed pattern carried by a signed permutation r of the axes (new axis i = r[i][j] × old axis j).
 * Only for components that are `0`, a number, or a plain letter with an optional `-` (as in `mm2`); a
 * letter is renamed after its new position. A factor such as `2x` throws.
 */
export declare function permutePattern(pattern: string, r: Mat3, letters: string): string;
/**
 * The signed permutation r that carries setting 1 of a class into `setting` (new axis i = r[i][j] ×
 * old axis j), for the settings ITA does not print (`mm2` settings 2 and 3). Throws if the frame of
 * the setting is not a permutation of that of setting 1.
 */
export declare function permutationFromSetting1(key: PointGroupKey, setting: number): Mat3;
/**
 * The entry of a table printed per setting (Wyckoff positions, face forms) for a setting of a class:
 * the one with the ITC short symbol (and unique axis) of the setting, or undefined if ITA does not
 * print the setting.
 */
export declare function printedEntry<E extends {
    readonly symbol: string;
    readonly uniqueAxis?: 'b' | 'c';
}>(table: readonly E[], key: PointGroupKey, setting: number): E | undefined;
/**
 * The lattice basis in which the Cartesian normals of the representatives are computed; monoclinic
 * and triclinic: a, b, c along x, y, z (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
export declare function faceBasis(key: PointGroupKey): Mat3;
/**
 * The setting index for a table that exists for the crystal classes in the ITC convention only
 * (`what`: 'Wyckoff positions', 'Crystal forms'); throws a RangeError for a magnetic point group
 * with time reversal and for another convention.
 */
export declare function itcSetting(key: PointGroupKey, options?: SettingOptions, what?: string): number;
/**
 * The Wyckoff positions of a point group for directions, in ITA's printed order (general position
 * first), for the 32 crystal classes and in the ITC convention only (throws a RangeError for a
 * magnetic point group with time reversal and for `'birss'`). The point at the origin
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
