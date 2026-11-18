/**
 * The 32 crystallographic point groups (crystal classes) as data: generators, settings and symbols.
 *
 * Generators are stored in the Birss frame (docs/conventions.md); every setting is a rotation of
 * that frame, and the ITC settings are among them. The print anchors and their tests are listed in
 * docs/conventions.md, "Sources"; never derive data here from symcrys output.
 */
import { type Mat3 } from '../linalg.js';
import { type Operation } from '../operations.js';
import type { CrystalSystem } from '../lattice.js';
/** Keys of the 32 crystal classes: the ITC short symbol of the class (docs/conventions.md, "Keys"). */
export declare const POINT_GROUP_KEYS: readonly ["1", "-1", "2", "m", "2/m", "222", "mm2", "mmm", "4", "-4", "4/m", "422", "4mm", "-42m", "4/mmm", "3", "-3", "32", "3m", "-3m", "6", "-6", "6/m", "622", "6mm", "-6m2", "6/mmm", "23", "m-3", "432", "-43m", "m-3m"];
export type PointGroupKey = (typeof POINT_GROUP_KEYS)[number];
/** A symbol in one convention: the short symbol of the setting and the full symbol, positions separated by spaces. */
interface SymbolForms {
    readonly short: string;
    readonly full: string;
}
export interface SettingData {
    /** Orthogonal matrix s: the setting's operations are s·W·sᵀ for the stored operations W. */
    readonly frame: Mat3;
    /** Monoclinic: the unique axis; orthorhombic mm2: the axis of the twofold rotation. */
    readonly uniqueAxis?: 'a' | 'b' | 'c';
    readonly itc: SymbolForms;
    readonly birss: SymbolForms;
}
export interface PointGroupData {
    readonly key: PointGroupKey;
    readonly crystalSystem: CrystalSystem;
    readonly schoenflies: string;
    /** Generators in the stored (Birss) frame, which is setting 1. */
    readonly generators: readonly Operation[];
    /** Setting 1 first; its frame is the identity. */
    readonly settings: readonly SettingData[];
    /** The ITC default setting (1-based). The Birss default is always setting 1. */
    readonly itcDefault: number;
}
export declare const POINT_GROUP_DATA: readonly PointGroupData[];
export {};
