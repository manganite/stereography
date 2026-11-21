/**
 * Miller and Miller–Bravais indices, the zone law and the change of axes
 * (docs/conventions.md, "Cell, metric and indices"). Plain integers and matrices in and out.
 */
import { type Mat3, type Vec3 } from './linalg.js';
/** A direction [UVTW] or a plane (hkil) in four indices (Miller–Bravais). */
export type FourIndices = readonly [number, number, number, number];
/** The indices divided by their greatest common divisor, signs kept. Throws a RangeError for non-integers and for all zeros. */
export declare function reduceIndices(indices: readonly number[]): number[];
/** The plane (hkl) of hexagonal axes as (hkil) with i = −(h + k). */
export declare function planeToFourIndices(hkl: Vec3): FourIndices;
/** The plane (hkil) as (hkl); throws a RangeError unless i = −(h + k). */
export declare function planeFromFourIndices(hkil: FourIndices): Vec3;
/**
 * The direction [uvw] of hexagonal axes as [UVTW], reduced: U = (2u − v)/3, V = (2v − u)/3,
 * T = −(U + V), W = w, scaled to the smallest integers.
 */
export declare function directionToFourIndices(uvw: Vec3): FourIndices;
/** The direction [UVTW] as [uvw], reduced: u = U − T, v = V − T, w = W; throws a RangeError unless T = −(U + V). */
export declare function directionFromFourIndices(uvtw: FourIndices): Vec3;
/**
 * The zone axis [uvw] of two planes (hkl), which must not be zero vectors: the solution of the zone law hu + kv + lw = 0, the
 * cross product h₁ × h₂ reduced (so its sign follows the order of the planes), or `null` for parallel planes.
 */
export declare function zoneAxis(h1: Vec3, h2: Vec3): Vec3 | null;
/** The matrices that carry coordinates of a direction and indices of a plane to a new basis. */
export interface AxisChange {
    /** Q = P⁻¹: the coordinates [uvw]′ = Q·[uvw] of a direction in the new basis. */
    readonly direction: Mat3;
    /** Pᵀ: the indices (hkl)′ = Pᵀ·(hkl) of a plane, i.e. (h′ k′ l′) = (h k l)·P. */
    readonly plane: Mat3;
}
/**
 * The transformation of indices for a change of basis (a′, b′, c′) = (a, b, c)·P (ITA Vol. A, 2006,
 * Section 5.1.3): the columns of `P` are the new basis vectors in the old one. The coordinates of a
 * direction transform with Q = P⁻¹, the indices of a plane with Pᵀ, so that hu + kv + lw is the same in
 * both bases. Throws a RangeError unless det P > 0 (a right-handed basis).
 */
export declare function changeOfAxes(P: Mat3): AxisChange;
