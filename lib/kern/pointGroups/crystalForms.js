/**
 * Crystal forms of the crystal classes, in the ITC convention: for each Wyckoff position the basic
 * form and the limiting forms as ITA prints them, with the 47 forms of ITA Table 3.2.1.3
 * (docs/conventions.md, "Crystal forms").
 */
import { ITA_FORMS, ITA_FORM_TYPES } from './crystalFormsData.js';
import { REPRESENTATIVE_VALUES, faceBasis, itcSetting, normal, numericHkl, permutationFromSetting1, permutePattern, printedEntry, wyckoffPositions, } from './wyckoff.js';
/** The 47 crystal forms of ITA Table 3.2.1.3, in ITA's order: `CRYSTAL_FORM_TYPES[n - 1]` is form n. */
export const CRYSTAL_FORM_TYPES = Object.freeze(ITA_FORM_TYPES.map(([number, name, faces, eigensymmetry]) => Object.freeze({ number, name, faces, eigensymmetry })));
/** h, k, l of the representative for the condition |h| < |l|. */
const SMALL_H = Object.freeze({ h: 1, k: 2, l: 3 });
const HKL = 'hkl';
/** The printed rows of a setting; for a setting ITA does not print, those of setting 1 carried into its frame. */
function printedRows(key, setting) {
    const entry = printedEntry(ITA_FORMS, key, setting);
    if (entry)
        return entry.rows;
    if (setting === 1)
        throw new Error(`Point group ${key}: no printed crystal forms for setting 1`);
    const r = permutationFromSetting1(key, setting);
    return printedRows(key, 1).map(([letter, basic, type, miller, condition]) => {
        if (condition !== undefined)
            throw new Error(`Cannot carry the condition ${condition} into another setting`);
        return [letter, basic, type, permutePattern(miller, r, HKL)];
    });
}
const cache = new Map();
/**
 * The crystal forms of a crystal class in ITA's order: by Wyckoff position (general position
 * first), each position's basic forms before its limiting forms, as ITA 6th ed. Table 3.2.3.2
 * prints them. ITC convention only (throws a RangeError for `'birss'` and for a magnetic point
 * group with time reversal), like the Wyckoff positions. For `mm2` settings 2 and 3 (`2mm`, `m2m`),
 * which ITA does not print, the forms of setting 1 carried into their frame.
 */
export function crystalForms(key, options) {
    const setting = itcSetting(key, options, 'Crystal forms');
    const cacheKey = `${key}#${setting}`;
    let result = cache.get(cacheKey);
    if (!result) {
        const positions = wyckoffPositions(key, { convention: 'itc', setting });
        const basis = faceBasis(key);
        result = Object.freeze(printedRows(key, setting).map(([letter, basic, formType, millerIndices, condition]) => {
            const position = positions.find((p) => p.letter === letter);
            if (!position)
                throw new Error(`Point group ${key}, setting ${setting}: no Wyckoff position ${letter}`);
            if (CRYSTAL_FORM_TYPES[formType - 1].faces !== position.multiplicity) {
                throw new Error(`Point group ${key}, setting ${setting}: form ${formType} does not have the multiplicity of position ${letter}`);
            }
            const values = condition === '|h|<|l|' ? SMALL_H : REPRESENTATIVE_VALUES;
            const hkl = numericHkl(millerIndices, values);
            return Object.freeze({
                letter,
                multiplicity: position.multiplicity,
                siteSymmetry: position.siteSymmetry,
                basic,
                formType,
                millerIndices,
                ...(condition === undefined ? {} : { condition }),
                representative: Object.freeze({
                    hkl: Object.freeze(hkl),
                    cartesian: Object.freeze(normal(basis, hkl)),
                }),
            });
        }));
        cache.set(cacheKey, result);
    }
    return result;
}
