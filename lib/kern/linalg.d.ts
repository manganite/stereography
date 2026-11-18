/**
 * 3×3 linear algebra on Cartesian vectors and matrices. Matrices are row-major: `m[i][j]` is row
 * i, column j, and a matrix acts on a column vector from the left.
 */
/** A Cartesian vector. */
export type Vec3 = readonly [number, number, number];
/** A Cartesian 3×3 matrix, as three rows. */
export type Mat3 = readonly [Vec3, Vec3, Vec3];
export declare const IDENTITY: Mat3;
export declare const INVERSION: Mat3;
/** The product a·b. */
export declare function multiply(a: Mat3, b: Mat3): Mat3;
/** The matrix applied to a vector, m·v. */
export declare function apply(m: Mat3, v: Vec3): Vec3;
export declare function transpose(a: Mat3): Mat3;
export declare function det(a: Mat3): number;
export declare function trace(a: Mat3): number;
/** Proper rotation by `angleDeg` degrees about the z axis (counter-clockwise seen from +z). */
export declare function rotationZ(angleDeg: number): Mat3;
/** Proper rotation by `angleDeg` degrees about the x axis. */
export declare function rotationX(angleDeg: number): Mat3;
/** Proper rotation by `angleDeg` degrees about the y axis. */
export declare function rotationY(angleDeg: number): Mat3;
/** Replaces each entry within SNAP_EPSILON of an exact value by that value (this also turns −0 into 0). */
export declare function snap(a: Mat3): Mat3;
/** True if all entries agree within EPSILON. */
export declare function matricesEqual(a: Mat3, b: Mat3): boolean;
/** The inverse of a regular matrix (by the adjugate); throws for a singular one. */
export declare function inverse(a: Mat3): Mat3;
/** The transformed matrix s·a·sᵀ, for an orthogonal s. */
export declare function conjugate(a: Mat3, s: Mat3): Mat3;
