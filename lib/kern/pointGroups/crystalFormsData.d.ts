/**
 * The crystal forms of the crystal classes as ITA prints them (6th ed., 2016): the 47 forms of
 * Table 3.2.1.3 (pp. 724–726: number, name, number of faces, eigensymmetry) and, per printed setting
 * of Table 3.2.3.2 (pp. 745–769), the face forms of each Wyckoff position, basic form first, then
 * the limiting forms. The same rows are in references/itc/vol-a-table-3.2.1.3-crystal-forms.md and
 * references/itc/vol-a-table-3.2.3.2-face-forms.md, which the reference test re-parses and compares
 * with this file; change both only by transcription from print.
 *
 * Notation as in wyckoffData.ts: a leading `-` is an overbar; components separated by commas;
 * Bravais–Miller indices (four components) for hexagonal axes.
 */
/** [number, name as printed, number of faces, eigensymmetry]. */
export type FormTypeRow = readonly [number, string, number, string];
/** The 47 crystal forms of ITA Table 3.2.1.3, in printed order. */
export declare const ITA_FORM_TYPES: readonly FormTypeRow[];
/**
 * [Wyckoff letter, basic (false: a limiting form), number in ITA_FORM_TYPES, Miller indices of the
 * first face, condition printed with the form (`|h|<|l|`)].
 */
export type FormRow = readonly [string, boolean, number, string, string?];
export interface FormEntry {
    /** ITC short symbol of the setting as in the headline of the entry. */
    readonly symbol: string;
    /** Monoclinic: the unique axis of the entry. */
    readonly uniqueAxis?: 'b' | 'c';
    /** Printed page. */
    readonly page: number;
    /** In printed order: general position first, each position's basic form before its limiting forms. */
    readonly rows: readonly FormRow[];
}
export declare const ITA_FORMS: readonly FormEntry[];
