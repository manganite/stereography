/**
 * The symmetry directions of the crystal families: the lattice directions along which the
 * symmetry elements of a crystallographic point group lie, grouped by their position in the full
 * Hermann–Mauguin symbol. Data from ITA Table 2.1.3.1 (docs/conventions.md, "Symmetry
 * directions and elements"); `symmetryDirections.reference.test.ts` re-reads the transcription and requires the
 * same directions, in the same order and with the same signs.
 */
import type { CrystalFamily } from './lattice.js';
/** A lattice direction [uvw]: integer coordinates in the conventional basis a, b, c. */
export type Uvw = readonly [number, number, number];
/**
 * The directions of each position of the full symbol, per family, as printed in ITA Table 2.1.3.1
 * (hexagonal family: the row "Hexagonal", which also serves the trigonal classes with hexagonal
 * axes). Monoclinic: the full symbol reads along a, b, c (ITA 6th ed. § 2.1.3.15, p. 171), the
 * orthorhombic row. Triclinic: no symmetry direction.
 */
export declare const LATTICE_SYMMETRY_DIRECTIONS: Readonly<Record<CrystalFamily, readonly (readonly Uvw[])[]>>;
