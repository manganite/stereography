/**
 * Site symmetry of a direction under any list of point operations: which operations leave it
 * fixed (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
import { type Vec3 } from './linalg.js';
import type { Operation } from './operations.js';
export interface SiteSymmetryOptions {
    /**
     * A direction counts as fixed by an operation if the operation moves its unit vector by less
     * than this (Euclidean distance). Default `EPSILON` (10⁻⁶); a caller whose directions carry
     * rounding errors (e.g. read from a rounded link) passes a larger value.
     */
    readonly tolerance?: number;
}
/** The site symmetry of a direction. */
export interface SiteSymmetry {
    /**
     * Indices into the given operations of those that leave the direction fixed, ascending: for a group,
     * a subgroup (the operations fixing within the tolerance, closed under products, see `siteSymmetry`).
     */
    readonly operations: readonly number[];
    /**
     * The unit vector of the direction, set onto the fixed space of its site symmetry (the mean of
     * its images under the site symmetry, normalised), which removes rounding errors within the
     * tolerance.
     */
    readonly direction: Vec3;
    /** Number of operations divided by the order of the site symmetry: the number of equivalent directions. */
    readonly multiplicity: number;
    /** True if no operation other than the identity leaves the direction fixed (general position). */
    readonly general: boolean;
}
/** The tolerance of the options, checked. */
export declare function siteTolerance(options?: SiteSymmetryOptions): number;
/**
 * The site symmetry of `direction` (any non-zero vector, Cartesian) under `operations`, which may
 * be any list of point operations (for instance those of a distorted crystal). Time reversal is
 * ignored: a direction or a face normal is not changed by it. The operations fixing the direction
 * within the tolerance are closed under the products found in the list and the direction is set onto
 * their fixed space, repeated until stable, so that for a group the result is a subgroup and the
 * set direction lies exactly on its elements. For a list that is not a group, `multiplicity` may
 * not be an integer. Throws a RangeError for a zero vector, and if the closed operations fix no
 * common direction (a tolerance far too large, e.g. 0.5).
 */
export declare function siteSymmetry(operations: readonly Operation[], direction: Vec3, options?: SiteSymmetryOptions): SiteSymmetry;
