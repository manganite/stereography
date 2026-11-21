/**
 * Operations in the lattice basis and orbits of faces and directions (docs/conventions.md,
 * "Lattice basis and orbits"). Shared by both entry points.
 */
import { type Mat3, type Vec3 } from '../linalg.js';
import { type Operation } from '../operations.js';
import type { Uvw } from '../symmetryDirections.js';
import { type MagneticPointGroupKey, type SettingOptions } from './pointGroups.js';
import type { Hkl } from './wyckoff.js';
/**
 * The operations of a point group in the conventional lattice basis (a, b, c; for the trigonal
 * classes the hexagonal axes), in the order and with the time reversal of `operations` for the same
 * setting and convention: integer matrices W acting on the coordinates of a lattice vector [uvw],
 * W = B⁻¹·R·B with the basis B of `latticeBasis` and the Cartesian matrix R. They do not depend on
 * the cell angles, so they exist for every family; for the monoclinic and triclinic families a, b,
 * c are taken along x, y, z, as for the Wyckoff positions. In the ITC convention they are the
 * matrices of ITA's general position (6th ed., Table 3.2.3.2). Not orthogonal in general: pass
 * them to no function that takes Cartesian operations (docs/conventions.md, "Lattice basis and
 * orbits").
 */
export declare function latticeOperations(key: MagneticPointGroupKey, options?: SettingOptions): readonly Operation[];
/** One face of the orbit of a face: its Miller indices and the operations that map the given face onto it. */
export interface FaceOrbitEntry {
    /** Miller indices (hkl) of the face, in the conventional basis (hexagonal axes: without i). */
    readonly hkl: Hkl;
    /** Indices into `operations` (same setting and convention) of the operations that map the given face onto this one, ascending. */
    readonly operations: readonly number[];
}
/** One direction of the orbit of a lattice direction: its indices and the operations that map the given direction onto it. */
export interface DirectionOrbitEntry {
    /** The lattice direction [uvw] in the conventional basis. */
    readonly uvw: Uvw;
    /** Indices into `operations` (same setting and convention) of the operations that map the given direction onto this one, ascending. */
    readonly operations: readonly number[];
}
/**
 * The orbit of a face (hkl) or of a lattice direction [uvw] under a point group, exactly, in the
 * lattice basis: the distinct faces (directions), in the order in which the operations reach them
 * (so in the ITC convention the given face first), each with the indices of the operations that map
 * the given one onto it. A face transforms with the inverse transpose of a lattice operation,
 * h' = W⁻ᵀ·h, a direction with the operation itself, u' = W·u. The number of entries is the
 * multiplicity of the face (direction), and the operations of the first entry, if it is the given
 * one, are its site symmetry. Time reversal plays no part. Throws a RangeError unless exactly one of
 * `hkl` and `uvw` is given, as three integers not all zero (hexagonal axes: three indices, without
 * i).
 */
export declare function orbit(key: MagneticPointGroupKey, indices: {
    readonly hkl: Hkl;
}, options?: SettingOptions): readonly FaceOrbitEntry[];
export declare function orbit(key: MagneticPointGroupKey, indices: {
    readonly uvw: Uvw;
}, options?: SettingOptions): readonly DirectionOrbitEntry[];
export declare function orbit(key: MagneticPointGroupKey, indices: {
    readonly hkl: Hkl;
} | {
    readonly uvw: Uvw;
}, options?: SettingOptions): readonly FaceOrbitEntry[] | readonly DirectionOrbitEntry[];
/** Options of `orbitOf`. */
export interface OrbitOptions {
    /**
     * Two images count as one pole if their unit vectors are closer than this (Euclidean distance).
     * Default 10⁻⁶; a caller whose directions carry rounding errors passes a larger value.
     */
    readonly tolerance?: number;
}
/** One pole of the orbit of a direction under a list of operations. */
export interface OrbitPole {
    /** The image of the given direction as a Cartesian unit vector (the first operation's image where several coincide). */
    readonly direction: Vec3;
    /** Indices into the given operations of those that map the direction here, ascending. */
    readonly operations: readonly number[];
}
/**
 * The orbit of a direction (any non-zero vector, Cartesian, e.g. a face normal) under a list of
 * operations, for instance those of a distorted crystal: the images of its unit vector under each
 * operation, coinciding images merged (closer than `tolerance`, default `EPSILON`, as for
 * `siteSymmetry`), in the order in which the operations reach them, each with the indices of the
 * operations that map the direction there. The list is taken as it is, not closed into a group.
 * Time reversal is ignored. Throws a RangeError for a zero vector and for a matrix that is not
 * orthogonal (Cartesian; not one of `latticeOperations`).
 */
export declare function orbitOf(operations: readonly {
    readonly matrix: Mat3;
}[], direction: Vec3, options?: OrbitOptions): readonly OrbitPole[];
