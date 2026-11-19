/**
 * The Wyckoff positions of the crystal classes as ITA prints them (6th ed., 2016, Table 3.2.3.2,
 * pp. 745–769), one entry per printed setting: letter, multiplicity, oriented site-symmetry symbol,
 * the first coordinate triplet and the Miller indices of the first face. The same rows are in
 * references/itc/vol-a-table-3.2.3.2-wyckoff-positions.md, which the reference test re-parses and
 * compares with this file; change both only by transcription from print.
 *
 * Notation: a leading `-` is an overbar; components separated by commas; Bravais–Miller indices
 * (four components) for hexagonal axes. The origin (letter o) has no face (`''`).
 */
/** [letter, multiplicity, oriented site symmetry, coordinates, Miller indices]. */
export type WyckoffRow = readonly [string, number, string, string, string];
export interface WyckoffEntry {
    /** ITC short symbol of the setting as in the headline of the entry. */
    readonly symbol: string;
    /** Monoclinic: the unique axis of the entry. */
    readonly uniqueAxis?: 'b' | 'c';
    /** Printed page. */
    readonly page: number;
    /** In printed order, general position first. */
    readonly rows: readonly WyckoffRow[];
}
export declare const ITA_WYCKOFF: readonly WyckoffEntry[];
