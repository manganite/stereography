/**
 * The order of the operations: as ITA numbers them. ITA bases the sequence of the coordinate
 * triplets on its "Generators selected" (Vol. A, 5th ed. 2006, § 2.2.11 (iv), p. 27; transcribed
 * for the symmorphic P group of every setting it lists in references/itc/vol-a-2006-symmetry-operations.md)
 * and takes the next generator as soon as a power of the current one lies in the group generated
 * so far (§ 8.3.5, p. 737). So, starting from the identity, each generator g extends that group H
 * by gH, g²H, … until a power of g lies in H. This gives ITA's numbering of the general
 * position (ITA 6th ed. Table 3.2.3.2), as `elements.reference.test.ts` checks for all 40 settings.
 * The generators are the printed triplets of Table 3.2.3.2, as matrices W in the conventional basis
 * (x̃ = W x); docs/conventions.md, "Order of the operations".
 */
import { type CrystalSystem } from '../lattice.js';
import { type Operation } from '../operations.js';
/** ITA's selected generators of a setting as Cartesian operations, in printed order, or undefined if ITA does not list it. */
export declare function itaGeneratorOperations(key: string, setting: number, system: CrystalSystem): Operation[] | undefined;
/**
 * The operations of a setting in ITA's order, built coset by coset from ITA's generators, or
 * undefined if ITA does not list the setting. `closed` (the closure of the stored generators) only
 * bounds the loop; the caller checks that the result is the same set.
 */
export declare function inItaOrder(key: string, setting: number, system: CrystalSystem, closed: readonly Operation[]): Operation[] | undefined;
