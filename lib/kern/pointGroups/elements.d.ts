/**
 * The geometry of a point group's operations: what each operation is (rotation, mirror, …), about
 * which axis and in which sense, and which symmetry elements lie along each symmetry direction of
 * the full Hermann–Mauguin symbol. Structured data only; symbols such as `3⁺ x,x,x` or `2_z` are
 * left to the applications (docs/conventions.md, "Symmetry directions and elements").
 */
import { type Vec3 } from '../linalg.js';
import { type Uvw } from '../symmetryDirections.js';
import { type MagneticPointGroupKey, type SettingOptions } from './pointGroups.js';
/** What a point operation is; a rotoinversion n̄ is the inversion times the rotation n (n = 3, 4, 6). */
export type OperationKind = 'identity' | 'inversion' | 'rotation' | 'rotoinversion' | 'mirror';
/** A symmetry direction: as a lattice direction [uvw] and as a Cartesian unit vector. */
export interface Axis {
    /**
     * Integer coordinates in the conventional basis. ITC convention: sign as in ITA Table 2.1.3.1;
     * Birss convention, in `describeOperations`: first non-zero Cartesian component positive.
     */
    readonly lattice: Uvw;
    /**
     * Unit vector in the Cartesian frame of symcrys. Monoclinic: a, b, c taken along x, y, z, exact for
     * the unique axis only (docs/conventions.md, "Symmetry directions and elements").
     */
    readonly cartesian: Vec3;
}
/** One point operation described geometrically. */
export interface OperationDescription {
    readonly kind: OperationKind;
    /**
     * The n of the symbol n or n̄: 1 for the identity and the inversion, 2 for a mirror (m = 2̄),
     * otherwise the order of the rotation part.
     */
    readonly order: number;
    /** Rotation axis, rotoinversion axis or mirror normal; absent for the identity and the inversion. */
    readonly axis?: Axis;
    /**
     * For n ≥ 3: `'+'` if the rotation part turns by +360°/n about `axis` (counter-clockwise seen
     * from the tip of `axis` looking towards the origin), `'-'` if by −360°/n.
     */
    readonly sense?: '+' | '-';
    readonly timeReversal: boolean;
}
/** The symmetry elements along one symmetry direction. */
export interface DirectionElements extends Axis {
    /**
     * Highest n of a rotation n about this direction; 1 if there is none. In a magnetic group
     * rotations, rotoinversions and mirrors count with and without time reversal;
     * `describeOperations` tells them apart.
     */
    readonly rotation: number;
    /** Highest n of a rotoinversion n̄ (n = 3, 4, 6) about this direction; 0 if there is none. */
    readonly rotoinversion: number;
    /** True if a mirror plane is perpendicular to this direction. */
    readonly mirror: boolean;
}
/** One position of the full Hermann–Mauguin symbol: its symbol and its symmetry directions. */
export interface SymmetryDirection {
    /** 1-based position in the full symbol. */
    readonly position: number;
    /**
     * The symbol at this position of the full symbol, if the full symbol has this position; for a
     * magnetic group with its primes (`4'/m`).
     */
    readonly symbol?: string;
    readonly directions: readonly DirectionElements[];
}
/**
 * Each operation of the point group described geometrically, in the order of `operations` for
 * the same key and options. Axes are named by the symmetry direction they lie along: in the ITC
 * convention with the sign of ITA Table 2.1.3.1, in the Birss convention signed as birss-app signs
 * them (first non-zero Cartesian component positive); the sign fixes what the sense refers to.
 */
export declare function describeOperations(key: MagneticPointGroupKey, options?: SettingOptions): readonly OperationDescription[];
/**
 * The positions of the full Hermann–Mauguin symbol in the requested convention and setting, each
 * with its symmetry directions (ITA Table 2.1.3.1) and the symmetry elements along them. All
 * positions of the crystal family are listed, also those the symbol of the class leaves out (then
 * without `symbol`); the triclinic family has none. The directions keep the sign of Table 2.1.3.1
 * in both conventions; in the Birss convention an axis of `describeOperations` may be reversed, so
 * match it to a direction by |dot| = 1, not by identity.
 */
export declare function symmetryDirections(key: MagneticPointGroupKey, options?: SettingOptions): readonly SymmetryDirection[];
