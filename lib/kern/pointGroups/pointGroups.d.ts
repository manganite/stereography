/**
 * Public API for the crystallographic point groups: lookup, settings, operations, generators and
 * symbols, in the ITC convention (default) or the Birss convention.
 */
import { type Operation } from '../operations.js';
import type { CrystalSystem } from '../lattice.js';
import { type PointGroupKey } from './data.js';
export { POINT_GROUP_KEYS, type PointGroupKey } from './data.js';
/** `'itc'`: International Tables for Crystallography (default). `'birss'`: Birss, Symmetry and Magnetism (1966). */
export type Convention = 'itc' | 'birss';
/** Type I: crystallographic point group without time reversal (the only type so far). */
export type PointGroupType = 'I';
export interface PointGroup {
    readonly key: PointGroupKey;
    readonly type: PointGroupType;
    readonly crystalSystem: CrystalSystem;
    /** Number of operations. */
    readonly order: number;
}
export interface Setting {
    /** 1-based; the same physical frame in both conventions. */
    readonly index: number;
    /** Short symbol of the setting in the requested convention. */
    readonly symbol: string;
    /** Full symbol, symmetry directions separated by single spaces. */
    readonly fullSymbol: string;
    /** Monoclinic: the unique axis; orthorhombic mm2: the axis of the twofold rotation. */
    readonly uniqueAxis?: 'a' | 'b' | 'c';
    /** True for the default setting of the requested convention. */
    readonly isDefault: boolean;
}
export interface SettingOptions {
    /** Default `'itc'`. */
    readonly convention?: Convention;
    /** 1-based setting index; default: the default setting of the convention. */
    readonly setting?: number;
}
export interface SymbolOptions extends SettingOptions {
    /**
     * `'short'` (default): short symbol of the setting, e.g. `321` (ITC) for class `32`.
     * `'full'`: full symbol, positions separated by spaces, e.g. `-3 2/m 1`.
     * `'schoenflies'`: Schoenflies symbol, subscripts written inline (`C3v`, `D2d`, `Oh`).
     */
    readonly form?: 'short' | 'full' | 'schoenflies';
}
/** True if `key` is the key of one of the 32 crystal classes. */
export declare function isPointGroupKey(key: string): key is PointGroupKey;
/** The point group with this key. Throws a RangeError for an unknown key. */
export declare function pointGroup(key: PointGroupKey): PointGroup;
/** All 32 crystal classes, in the order of `POINT_GROUP_KEYS` (by crystal system, as in ITA). */
export declare function pointGroups(): readonly PointGroup[];
/** The settings of a point group, with symbols and the default of the given convention (default `'itc'`). */
export declare function settings(key: PointGroupKey, conventionName?: Convention): readonly Setting[];
/**
 * All operations of the point group in the requested setting (default: the convention's default
 * setting). ITC convention: in ITA's order, identity first, then as ITA numbers the general
 * position; Birss convention: in birss-app's order (docs/conventions.md, "Order of the
 * operations"). The matrices are Cartesian (docs/conventions.md, "Cartesian frame").
 */
export declare function operations(key: PointGroupKey, options?: SettingOptions): readonly Operation[];
/**
 * Generators of the point group in the requested setting (docs/conventions.md, "Generators"). ITC
 * convention: ITA's selected generators in printed order, without the identity and ITA's lattice
 * translations, so the list is empty for `1`; for `mm2` settings 2 and 3, which ITA does not list,
 * those of setting 1 carried into their frame. Birss convention: birss-app's generators (for `1`
 * the identity, as in birss-app).
 */
export declare function generators(key: PointGroupKey, options?: SettingOptions): readonly Operation[];
/** A symbol of the point group in the requested convention and setting. */
export declare function symbol(key: PointGroupKey, options?: SymbolOptions): string;
/** A point group in a given setting. */
export interface PointGroupInSetting {
    readonly key: PointGroupKey;
    readonly setting: number;
}
/**
 * Finds a point group by a Hermann–Mauguin symbol in the given convention (default `'itc'`): the
 * key (giving the default setting), the short symbol of a setting, or a full symbol (spaces are
 * ignored). Returns undefined if nothing matches, also for a value that is not a string. Symbols
 * are written as in this library: `-` for the overbar, also in the Birss convention (`m-3m`, where
 * Birss prints `m3m`; docs/conventions.md, "Where ITC and Birss differ").
 */
export declare function findPointGroup(hm: string, conventionName?: Convention): PointGroupInSetting | undefined;
