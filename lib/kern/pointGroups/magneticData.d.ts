/**
 * The 90 magnetic point groups with time reversal as data: the 32 grey groups (type II) and the 58
 * black-and-white groups (type III). With the 32 crystal classes (type I, data.ts) they are the 122
 * magnetic point groups.
 *
 * A grey group is its crystal class P together with all operations of P combined with time
 * reversal (ITC Vol. D, eq. (1.5.2.1)); its data follow from the class. A black-and-white group is
 * stored like a class: generators in the stored (Birss) frame, here those of birss-app, and the
 * frames of its settings. The symbols of a setting are not stored: they are the symbols of the
 * crystal class in that frame with the primes the operations carry (magneticSymbols.ts).
 * Print anchors and their tests: docs/conventions.md, "Sources".
 */
import { type Mat3 } from '../linalg.js';
import { type Operation } from '../operations.js';
import { type PointGroupKey } from './data.js';
/** Keys of the 32 grey groups: the key of the crystal class followed by `1'`. */
export type GreyPointGroupKey = `${PointGroupKey}1'`;
export declare const GREY_POINT_GROUP_KEYS: readonly GreyPointGroupKey[];
/**
 * Keys of the 58 black-and-white groups: the short Hermann–Mauguin symbol of ITC Vol. D
 * Table 1.5.2.3, in the order of the table (docs/conventions.md, "Keys").
 */
export declare const BLACK_WHITE_POINT_GROUP_KEYS: readonly ["-1'", "2'", "m'", "2'/m'", "2/m'", "2'/m", "2'2'2", "m'm'2", "2'm'm", "mm'm'", "m'm'm'", "mmm'", "4'", "-4'", "4'/m", "4/m'", "4'/m'", "4'22'", "42'2'", "4'mm'", "4m'm'", "-4'2m'", "-4'm2'", "-42'm'", "4'/mmm'", "4/mm'm'", "4/m'm'm'", "4/m'mm", "4'/m'm'm", "-3'", "32'", "3m'", "-3m'", "-3'm'", "-3'm", "6'", "-6'", "6'/m'", "6/m'", "6'/m", "6'22'", "62'2'", "6'mm'", "6m'm'", "-6'2m'", "-6'm2'", "-6m'2'", "6'/m'mm'", "6/mm'm'", "6/m'm'm'", "6/m'mm", "6'/mmm'", "m'-3'", "4'32'", "-4'3m'", "m-3m'", "m'-3'm'", "m'-3'm"];
export type BlackWhitePointGroupKey = (typeof BLACK_WHITE_POINT_GROUP_KEYS)[number];
/** Keys of all 122 magnetic point groups: the 32 crystal classes, the 32 grey groups, the 58 black-and-white groups. */
export type MagneticPointGroupKey = PointGroupKey | GreyPointGroupKey | BlackWhitePointGroupKey;
export declare const MAGNETIC_POINT_GROUP_KEYS: readonly MagneticPointGroupKey[];
/** The frame of a setting of a black-and-white group. */
export interface MagneticFrame {
    /** Orthogonal matrix s: the setting's operations are s·W·sᵀ for the stored operations W. */
    readonly frame: Mat3;
    /** Monoclinic: the unique axis; orthorhombic: the axis the stored z axis is carried to. */
    readonly uniqueAxis?: 'a' | 'b' | 'c';
}
export interface BlackWhiteData {
    readonly key: BlackWhitePointGroupKey;
    /** The crystal class the group becomes when every prime is dropped. */
    readonly crystalClass: PointGroupKey;
    readonly schoenflies: string;
    /** Generators in the stored (Birss) frame, which is setting 1. */
    readonly generators: readonly Operation[];
    /** Setting 1 first; its frame is the identity. */
    readonly settings: readonly MagneticFrame[];
    /** The ITC default setting (1-based). The Birss default is always setting 1. */
    readonly itcDefault: number;
}
/** Time reversal alone: the identity combined with time reversal (1'). */
export declare const TIME_REVERSAL: Operation;
/**
 * The 58 black-and-white groups. The generators are birss-app's (CLAUDE.md, "birss-app is the
 * reference where print leaves a choice open"); the group they generate is checked against Birss's
 * Table 6 and against ITC Vol. D Table 1.5.2.3. Setting frames as for the classes (data.ts), with three more for `2'm'm`; the
 * ITC default is the frame in which the key, read along ITA's symmetry directions, describes the
 * group, which is the frame of the operators printed in Table 1.5.2.3.
 */
export declare const BLACK_WHITE_DATA: readonly BlackWhiteData[];
/** Schoenflies symbol of a grey group: that of its class with the subscript R (ITC Vol. D, Table 1.5.2.1). */
export declare const greySchoenflies: (classSymbol: string) => string;
/** The data of the crystal class with this key. */
export declare function classData(key: PointGroupKey): import("./data.js").PointGroupData;
