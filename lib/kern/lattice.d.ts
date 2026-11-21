/**
 * Crystal systems and families, and how the conventional lattice basis sits in the Cartesian frame
 * of symcrys (docs/conventions.md, "Cartesian frame").
 */
import type { Mat3 } from './linalg.js';
/** One of the seven crystal systems. */
export type CrystalSystem = 'triclinic' | 'monoclinic' | 'orthorhombic' | 'tetragonal' | 'trigonal' | 'hexagonal' | 'cubic';
/** One of the six crystal families: the trigonal and the hexagonal system form the hexagonal family. */
export type CrystalFamily = 'triclinic' | 'monoclinic' | 'orthorhombic' | 'tetragonal' | 'hexagonal' | 'cubic';
/** The crystal family of a crystal system: trigonal and hexagonal form the hexagonal family. */
export declare function crystalFamily(system: CrystalSystem): CrystalFamily;
/** The families whose cell angles are fixed, so that their lattice basis is fixed up to edge lengths. */
export type FixedAngleFamily = 'orthorhombic' | 'tetragonal' | 'hexagonal' | 'cubic';
/**
 * The conventional basis vectors a, b, c as the **columns** of a Cartesian matrix, with unit edge
 * lengths. Hexagonal family (hexagonal axes): x ∥ a, z ∥ c, y = z × x, so b points at 120° from a.
 * Orthorhombic, tetragonal, cubic: x ∥ a, y ∥ b, z ∥ c.
 *
 * The edge lengths are set to 1 because the symmetry directions of these families, and so the
 * point operations, do not depend on them. For a direction [uvw] that is not a symmetry direction,
 * scale the columns by the real edge lengths first.
 *
 * @remarks The matrix is frozen and shared between calls.
 */
export declare function latticeBasis(family: FixedAngleFamily): Mat3;
