/**
 * Hermann–Mauguin symbols of the black-and-white point groups. The symbol of such a group in a
 * given frame is the symbol of its crystal class in that frame, each position carrying a prime if
 * the operation it names is combined with time reversal (ITC Vol. D, § 1.5.2.1, Table 1.5.2.3).
 * So no symbols are stored for these groups: they follow from the symbols of the class
 * (data.ts) and the operations (docs/conventions.md, "Symbols").
 */
import { type CrystalSystem } from '../lattice.js';
import type { Operation } from '../operations.js';
/**
 * The symbols of a black-and-white group in one frame: the short and the full symbol of its
 * crystal class in that frame, in the given convention, with primes taken from `ops`, the
 * operations of the group in that frame.
 */
export declare function primedSymbols(classSymbols: {
    readonly short: string;
    readonly full: string;
}, system: CrystalSystem, convention: 'itc' | 'birss', ops: readonly Operation[]): {
    short: string;
    full: string;
};
