/**
 * Row reduction of real vectors (any length): the reduced row echelon form of a spanning set, and
 * the rank. The tolerances are those of birss-app's `linalg.ts`, where the tensor code comes from.
 */
/** An entry below this (absolute) does not serve as a pivot: float noise is never a new direction. */
export declare const PIVOT_EPSILON = 1e-7;
/** An entry below this (absolute) is not eliminated, and is set to zero in the result. */
export declare const ELIMINATION_EPSILON = 1e-12;
/**
 * The reduced row echelon form of the span of `vectors` (all of length `dim`): one row per
 * independent direction, each with a 1 at its pivot and 0 at every other row's pivot, pivots
 * ascending. The rows are unique for a given span, so the pivots name the free parameters
 * unambiguously: each is the lowest-index component that is independent of the ones before it.
 */
export declare function reducedRowEchelon(vectors: readonly (readonly number[])[], dim: number): number[][];
/** The number of independent vectors among `vectors` (all of length `dim`). */
export declare function rank(vectors: readonly (readonly number[])[], dim: number): number;
