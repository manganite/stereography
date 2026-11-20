/**
 * The 32 crystallographic point groups (crystal classes) as data: generators, settings and symbols.
 * The 90 magnetic point groups built on them are in magneticData.ts.
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
export declare const ROT2_Z: Mat3;
export declare const ROT2_X: Mat3;
export declare const ROT2_Y: Mat3;
export declare const ROT4_Z: Mat3;
export declare const ROT3_Z: Mat3;
export declare const ROT6_Z: Mat3;
export declare const ROT4_X: Mat3;
export declare const ROTINV4_Z: Mat3;
export declare const ROTINV3_Z: Mat3;
export declare const ROTINV6_Z: Mat3;
export declare const MIRROR_X: Mat3;
export declare const MIRROR_Y: Mat3;
export declare const MIRROR_Z: Mat3;
/** Mirror with normal [1-10] (swaps x and y). */
export declare const MIRROR_XY: Mat3;
/** Threefold rotation about [111], mapping the vector x to y, y to z, z to x. */
export declare const ROT3_111: Mat3;
export declare const SAME: Mat3;
/** Monoclinic, c-unique (stored) → b-unique: z → y. Proper rotation. */
export declare const MONOCLINIC_B: Mat3;
/** Orthorhombic: the axis along z (stored) moves to x (cyclic x → y → z → x). */
export declare const ORTHO_TO_A: Mat3;
/** Orthorhombic: the axis along z (stored) moves to y (cyclic x → z → y → x). */
export declare const ORTHO_TO_B: Mat3;
/**
 * Orthorhombic, for a group whose three elements all differ: the frames above after exchanging the
 * other two axes (a rotation by 90° about the stored z axis), so the same axis stays unique.
 */
export declare const ORTHO_SWAP: Mat3;
export declare const ORTHO_TO_A_SWAP: Mat3;
export declare const ORTHO_TO_B_SWAP: Mat3;
export declare const ROT45_Z: Mat3;
export declare const ROT30_Z: Mat3;
export declare const POINT_GROUP_DATA: readonly PointGroupData[];
export {};
