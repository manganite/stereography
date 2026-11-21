/**
 * Crystal forms of the crystal classes, in the ITC convention: for each Wyckoff position the basic
 * form and the limiting forms as ITA prints them, with the 47 forms of ITA Table 3.2.1.3
 * (docs/conventions.md, "Crystal forms").
 */
import type { Vec3 } from '../linalg.js';
import type { PointGroupKey, SettingOptions } from './pointGroups.js';
import { type Hkl } from './wyckoff.js';
/** One of the 47 crystal forms of ITA Table 3.2.1.3. */
export interface CrystalFormType {
    /** ITA's number of the form, 1 to 47. */
    readonly number: number;
    /** ITA's English name of the form as printed, e.g. `Tetragonal prism`, `Sphenoid, dome, or dihedron`. */
    readonly name: string;
    /** Number of faces. */
    readonly faces: number;
    /**
     * The eigensymmetry as printed: the point group of the form as a polyhedron, e.g. `4/mmm`, `-62m`;
     * `∞m` for the pedion and `∞/mm` for the pinacoid.
     */
    readonly eigensymmetry: string;
}
/** One crystal form of a crystal class: a set of faces equivalent under the class. */
export interface CrystalForm {
    /** ITA's letter of the Wyckoff position the faces belong to. */
    readonly letter: string;
    /** Number of faces: the multiplicity of the Wyckoff position. */
    readonly multiplicity: number;
    /** Oriented site-symmetry symbol of the Wyckoff position, e.g. `..m` (the face symmetry). */
    readonly siteSymmetry: string;
    /**
     * True for a basic form, a form of lowest eigensymmetry of the position (two at the faces (hhl) of
     * -43m and m-3m), false for a limiting form: its faces have the face symmetry of the position,
     * but the form has a higher eigensymmetry (ITA 6th ed., § 3.2.1.2.2, p. 723).
     */
    readonly basic: boolean;
    /** The number of the form in `CRYSTAL_FORM_TYPES` (ITA Table 3.2.1.3), 1 to 47. */
    readonly formType: number;
    /**
     * ITA's first face as printed, components separated by commas, e.g. `h,0,l`, or `h,h,-2h,l`
     * (Bravais–Miller indices) for hexagonal axes; a leading `-` is an overbar.
     */
    readonly millerIndices: string;
    /** The condition ITA prints with the form, `|h|<|l|` or `|h|>|l|` (cubic forms (hhl)); absent otherwise. */
    readonly condition?: string;
    /**
     * A face of the form with numbers: `millerIndices` with h = 3, k = 2, l = 1, and with h = 1, l = 3
     * where the condition is `|h|<|l|`.
     */
    readonly representative: {
        /** The Miller indices (hkl) of the face. */
        readonly hkl: Hkl;
        /**
         * Its face normal, a Cartesian unit vector. Monoclinic and triclinic: the normal for a, b, c along
         * x, y, z (no cell angles), exact for the unique axis only.
         */
        readonly cartesian: Vec3;
    };
}
/** The 47 crystal forms of ITA Table 3.2.1.3, in ITA's order: `CRYSTAL_FORM_TYPES[n - 1]` is form n. */
export declare const CRYSTAL_FORM_TYPES: readonly CrystalFormType[];
/**
 * The crystal forms of a crystal class in ITA's order: by Wyckoff position (general position
 * first), each position's basic forms before its limiting forms, as ITA 6th ed. Table 3.2.3.2
 * prints them. ITC convention only (throws a RangeError for `'birss'` and for a magnetic point
 * group with time reversal), like the Wyckoff positions. For `mm2` settings 2 and 3 (`2mm`, `m2m`),
 * which ITA does not print, the forms of setting 1 carried into their frame.
 */
export declare function crystalForms(key: PointGroupKey, options?: SettingOptions): readonly CrystalForm[];
