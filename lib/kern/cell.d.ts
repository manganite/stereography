/**
 * Unit cell, metric and angles, for any cell (docs/conventions.md, "Cell, metric and indices").
 * Plain data in and out: a basis is a 3×3 matrix whose columns are a, b, c in Cartesian
 * coordinates, as `latticeBasis` gives it; lengths in any unit, angles in degrees.
 */
import { type Mat3, type Vec3 } from './linalg.js';
/** The lattice parameters of a cell: edge lengths and angles in degrees (α between b and c, β between a and c, γ between a and b). */
export interface LatticeParameters {
    /** Edge length a. */
    readonly a: number;
    /** Edge length b. */
    readonly b: number;
    /** Edge length c. */
    readonly c: number;
    /** Angle α between b and c, in degrees. */
    readonly alpha: number;
    /** Angle β between a and c, in degrees. */
    readonly beta: number;
    /** Angle γ between a and b, in degrees. */
    readonly gamma: number;
}
/** The three cell angles in degrees. */
export interface CellAngles {
    /** Angle α between b and c, in degrees. */
    readonly alpha: number;
    /** Angle β between a and c, in degrees. */
    readonly beta: number;
    /** Angle γ between a and b, in degrees. */
    readonly gamma: number;
}
/** An operation of a list given to `residualOperations`: at least its matrix; other fields are kept. */
export interface CellOperation {
    /** The 3×3 matrix W acting on lattice coordinates. */
    readonly matrix: Mat3;
}
/** Options of `isValidCell`. */
export interface IsValidCellOptions {
    /**
     * The smallest accepted ratio V/(abc) of the cell volume to the volume of the box of its edge
     * lengths; default 0, which accepts every cell that `isValidCell` otherwise accepts. A ratio near 0 is a nearly flat cell.
     */
    readonly minVolumeRatio?: number;
}
/** Options of `residualOperations`. */
export interface ResidualOperationsOptions {
    /** The largest accepted deviation of WᵀGW from G, relative to the largest entry of G; default `EPSILON`. */
    readonly tolerance?: number;
}
/**
 * Whether three angles (degrees) belong to a cell: each between 0° and 180°, and the three axes not
 * in one plane (the volume radicand 1 − cos²α − cos²β − cos²γ + 2 cos α cos β cos γ exceeds 10⁻¹², i.e.
 * V/(abc) > 10⁻⁶: a cell that is flat within rounding is refused). With
 * `minVolumeRatio` also refuses nearly flat cells, whose ratio V/(abc), the square root of the radicand, is smaller.
 */
export declare function isValidCell(angles: CellAngles, options?: IsValidCellOptions): boolean;
/**
 * The Cartesian basis of a cell as the columns of a 3×3 matrix, in the frame of this library for a
 * general cell: a along x, b in the xy plane (y > 0 for γ < 180°), c towards +z. It is the frame of
 * `latticeBasis` where that exists (hexagonal axes: x ∥ a, z ∥ c), so a cell with the angles of a
 * family has that family's basis scaled by the edge lengths. For the monoclinic family with unique
 * axis b, b lies along y (docs/conventions.md, "Cell, metric and indices"). The basis is
 * right-handed. Throws a RangeError for an edge that is not positive and for angles that give no cell.
 */
export declare function latticeFromParameters(p: LatticeParameters): Mat3;
/**
 * The lattice parameters of a basis given as the columns of a Cartesian matrix: the edge lengths and
 * the angles in degrees. Independent of the orientation of the basis in the Cartesian frame (and
 * of its handedness). Throws a RangeError for a singular matrix.
 */
export declare function latticeParameters(basis: Mat3): LatticeParameters;
/** The metric tensor G = AᵀA of a basis A (columns a, b, c): g_ij = a_i · a_j, in the unit of the edge lengths squared. */
export declare function metricTensor(basis: Mat3): Mat3;
/**
 * The reciprocal basis B = A⁻ᵀ of a basis A (columns a, b, c) as the columns a*, b*, c*, with
 * a_i · a*_j = δ_ij (no factor 2π), in the inverse unit of the edge lengths.
 */
export declare function reciprocalBasis(basis: Mat3): Mat3;
/** The angle in degrees between two lattice directions [uvw] (coordinates in the basis, columns a, b, c), 0° to 180°. Throws a RangeError for a zero vector. */
export declare function angleBetweenDirections(basis: Mat3, u: Vec3, v: Vec3): number;
/**
 * The angle in degrees between the normals of two planes (hkl), 0° to 180°: the angle between the
 * reciprocal vectors h·a* + k·b* + l·c*. For two faces this is 180° minus the interior dihedral
 * angle. Throws a RangeError for a zero vector.
 */
export declare function angleBetweenPlanes(basis: Mat3, h: Vec3, k: Vec3): number;
/**
 * The operations that leave the metric of a cell unchanged: those W (integer matrices on the
 * coordinates of a lattice direction, as `latticeOperations` gives them) with WᵀGW = G, G the metric
 * tensor of `basis`. It is the point symmetry of a distorted lattice among the operations of a group;
 * the list is taken as it is, not closed into a group, and the kept operations are the ones of the
 * list, in its order. The deviation counts relative to the largest entry of G (`tolerance`, default
 * `EPSILON`), so the result does not depend on the unit of the edge lengths.
 */
export declare function residualOperations<T extends CellOperation>(operations: readonly T[], basis: Mat3, options?: ResidualOperationsOptions): T[];
/** An operation of the magnetic API passed to `residualOperations`: its matrix and whether it is combined with time reversal. */
export interface MagneticCellOperation extends CellOperation {
    /** Whether the operation is combined with time reversal. */
    readonly timeReversal: boolean;
}
/**
 * The operations of a list that keep the metric of a cell: W with WᵀGW = G, G the metric tensor
 * of `basis`. The operations are integer matrices on lattice coordinates, as `latticeOperations`
 * gives them; the list is taken as it is and the kept operations are the ones of the list, in its
 * order. The deviation counts relative to the largest entry of G (`tolerance`, default `EPSILON`).
 * Every operation must say whether it is combined with time reversal (`timeReversal`), which is
 * kept; one that does not (an operation of the crystallographic API) is a RangeError.
 */
export declare function residualMagneticOperations<T extends MagneticCellOperation>(operations: readonly T[], basis: Mat3, options?: ResidualOperationsOptions): T[];
