/**
 * The 90 magnetic point groups with time reversal as data: the 32 grey groups (type II) and the 58
 * black-and-white groups (type III). With the 32 crystal classes (type I, data.ts) they are the 122
 * magnetic point groups.
 *
 * A grey group is its crystal class P together with all operations of P combined with time
 * reversal (ITC Vol. D, eq. (1.5.2.1)); its data follow from the class. A black-and-white group is
 * stored like a class: generators in the stored (Birss) frame, here those of birss-app, and the
 * frames of its settings. The symbols of a setting are not stored: they are the symbols of the
 * crystal class in that frame with the primes the operations carry (magneticSymbols.ts).
 * Print anchors and their tests: docs/conventions.md, "Sources".
 */
import { IDENTITY, INVERSION } from '../linalg.js';
import { operation } from '../operations.js';
import { MIRROR_X, MIRROR_Y, MIRROR_Z, MONOCLINIC_B, ORTHO_SWAP, ORTHO_TO_A, ORTHO_TO_A_SWAP, ORTHO_TO_B, ORTHO_TO_B_SWAP, POINT_GROUP_DATA, POINT_GROUP_KEYS, ROT2_X, ROT2_Y, ROT2_Z, ROT30_Z, ROT3_111, ROT3_Z, ROT45_Z, ROT4_Z, ROT6_Z, ROTINV4_Z, ROTINV6_Z, SAME, } from './data.js';
export const GREY_POINT_GROUP_KEYS = Object.freeze(POINT_GROUP_KEYS.map((key) => `${key}1'`));
/**
 * Keys of the 58 black-and-white groups: the short Hermann–Mauguin symbol of ITC Vol. D
 * Table 1.5.2.3, in the order of the table (docs/conventions.md, "Keys").
 */
export const BLACK_WHITE_POINT_GROUP_KEYS = Object.freeze([
    "-1'",
    "2'",
    "m'",
    "2'/m'",
    "2/m'",
    "2'/m",
    "2'2'2",
    "m'm'2",
    "2'm'm",
    "mm'm'",
    "m'm'm'",
    "mmm'",
    "4'",
    "-4'",
    "4'/m",
    "4/m'",
    "4'/m'",
    "4'22'",
    "42'2'",
    "4'mm'",
    "4m'm'",
    "-4'2m'",
    "-4'm2'",
    "-42'm'",
    "4'/mmm'",
    "4/mm'm'",
    "4/m'm'm'",
    "4/m'mm",
    "4'/m'm'm",
    "-3'",
    "32'",
    "3m'",
    "-3m'",
    "-3'm'",
    "-3'm",
    "6'",
    "-6'",
    "6'/m'",
    "6/m'",
    "6'/m",
    "6'22'",
    "62'2'",
    "6'mm'",
    "6m'm'",
    "-6'2m'",
    "-6'm2'",
    "-6m'2'",
    "6'/m'mm'",
    "6/mm'm'",
    "6/m'm'm'",
    "6/m'mm",
    "6'/mmm'",
    "m'-3'",
    "4'32'",
    "-4'3m'",
    "m-3m'",
    "m'-3'm'",
    "m'-3'm",
]);
export const MAGNETIC_POINT_GROUP_KEYS = Object.freeze([
    ...POINT_GROUP_KEYS,
    ...GREY_POINT_GROUP_KEYS,
    ...BLACK_WHITE_POINT_GROUP_KEYS,
]);
/** Time reversal alone: the identity combined with time reversal (1'). */
export const TIME_REVERSAL = Object.freeze({ matrix: IDENTITY, timeReversal: true });
/** An operation combined with time reversal (a primed operation). */
const primed = (matrix) => ({ matrix, timeReversal: true });
function blackWhite(key, crystalClass, schoenflies, generators, frames, itcDefault = 1, uniqueAxes) {
    const settings = frames.map((frame, i) => uniqueAxes ? { frame, uniqueAxis: uniqueAxes[i] } : { frame });
    return { key, crystalClass, schoenflies, generators, settings, itcDefault };
}
/**
 * The 58 black-and-white groups. The generators are birss-app's (CLAUDE.md, "birss-app is the
 * reference where print leaves a choice open"); the group they generate is checked against Birss's
 * Table 6 and against ITC Vol. D Table 1.5.2.3. Setting frames as for the classes (data.ts), with three more for `2'm'm`; the
 * ITC default is the frame in which the key, read along ITA's symmetry directions, describes the
 * group, which is the frame of the operators printed in Table 1.5.2.3.
 */
export const BLACK_WHITE_DATA = [
    blackWhite("-1'", '-1', 'Ci(C1)', [primed(INVERSION)], [SAME]),
    blackWhite("2'", '2', 'C2(C1)', [primed(ROT2_Z)], [SAME, MONOCLINIC_B], 2, ['c', 'b']),
    blackWhite("m'", 'm', 'Cs(C1)', [primed(MIRROR_Z)], [SAME, MONOCLINIC_B], 2, ['c', 'b']),
    blackWhite("2'/m'", '2/m', 'C2h(Ci)', [primed(ROT2_Z), operation(INVERSION)], [SAME, MONOCLINIC_B], 2, ['c', 'b']),
    blackWhite("2/m'", '2/m', 'C2h(C2)', [operation(ROT2_Z), primed(INVERSION)], [SAME, MONOCLINIC_B], 2, ['c', 'b']),
    blackWhite("2'/m", '2/m', 'C2h(Cs)', [primed(ROT2_Z), primed(INVERSION)], [SAME, MONOCLINIC_B], 2, ['c', 'b']),
    blackWhite("2'2'2", '222', 'D2(C2)', [operation(ROT2_Z), primed(ROT2_X)], [SAME, ORTHO_TO_A, ORTHO_TO_B], 1, [
        'c',
        'a',
        'b',
    ]),
    blackWhite("m'm'2", 'mm2', 'C2v(C2)', [operation(ROT2_Z), primed(MIRROR_X)], [SAME, ORTHO_TO_A, ORTHO_TO_B], 1, [
        'c',
        'a',
        'b',
    ]),
    // Its three elements all differ, so exchanging two axes gives another orientation: six settings.
    // Settings 1 to 3 are birss-app's; 4 to 6 exchange the other two axes at the same unique axis.
    blackWhite("2'm'm", 'mm2', 'C2v(Cs)', [operation(MIRROR_Z), primed(ROT2_X)], [SAME, ORTHO_TO_A, ORTHO_TO_B, ORTHO_SWAP, ORTHO_TO_A_SWAP, ORTHO_TO_B_SWAP], 1, ['c', 'a', 'b', 'c', 'a', 'b']),
    blackWhite("mm'm'", 'mmm', 'D2h(C2h)', [operation(ROT2_Z), operation(INVERSION), primed(ROT2_X)], [SAME, ORTHO_TO_A, ORTHO_TO_B], 2, ['c', 'a', 'b']),
    blackWhite("m'm'm'", 'mmm', 'D2h(D2)', [operation(ROT2_Z), operation(ROT2_X), primed(INVERSION)], [SAME]),
    blackWhite("mmm'", 'mmm', 'D2h(C2v)', [operation(ROT2_Z), operation(MIRROR_X), primed(INVERSION)], [SAME, ORTHO_TO_A, ORTHO_TO_B], 1, ['c', 'a', 'b']),
    blackWhite("4'", '4', 'C4(C2)', [primed(ROT4_Z)], [SAME]),
    blackWhite("-4'", '-4', 'S4(C2)', [primed(ROTINV4_Z)], [SAME]),
    blackWhite("4'/m", '4/m', 'C4h(C2h)', [primed(ROT4_Z), operation(INVERSION)], [SAME]),
    blackWhite("4/m'", '4/m', 'C4h(C4)', [operation(ROT4_Z), primed(INVERSION)], [SAME]),
    blackWhite("4'/m'", '4/m', 'C4h(S4)', [primed(ROT4_Z), primed(INVERSION)], [SAME]),
    blackWhite("4'22'", '422', 'D4(D2)', [primed(ROT4_Z), operation(ROT2_X)], [SAME, ROT45_Z]),
    blackWhite("42'2'", '422', 'D4(C4)', [operation(ROT4_Z), primed(ROT2_X)], [SAME]),
    blackWhite("4'mm'", '4mm', 'C4v(C2v)', [primed(ROT4_Z), operation(MIRROR_X)], [SAME, ROT45_Z]),
    blackWhite("4m'm'", '4mm', 'C4v(C4)', [operation(ROT4_Z), primed(MIRROR_X)], [SAME]),
    blackWhite("-4'2m'", '-42m', 'D2d(D2)', [primed(ROTINV4_Z), operation(ROT2_X)], [SAME, ROT45_Z]),
    blackWhite("-4'm2'", '-42m', 'D2d(C2v)', [primed(ROTINV4_Z), operation(MIRROR_Y)], [SAME, ROT45_Z]),
    blackWhite("-42'm'", '-42m', 'D2d(S4)', [operation(ROTINV4_Z), primed(ROT2_X)], [SAME, ROT45_Z]),
    blackWhite("4'/mmm'", '4/mmm', 'D4h(D2h)', [primed(ROT4_Z), operation(ROT2_X), operation(INVERSION)], [SAME, ROT45_Z]),
    blackWhite("4/mm'm'", '4/mmm', 'D4h(C4h)', [operation(ROT4_Z), operation(INVERSION), primed(ROT2_X)], [SAME]),
    blackWhite("4/m'm'm'", '4/mmm', 'D4h(D4)', [operation(ROT4_Z), operation(ROT2_X), primed(INVERSION)], [SAME]),
    blackWhite("4/m'mm", '4/mmm', 'D4h(C4v)', [operation(ROT4_Z), operation(MIRROR_X), primed(INVERSION)], [SAME]),
    blackWhite("4'/m'm'm", '4/mmm', 'D4h(D2d)', [operation(ROTINV4_Z), operation(ROT2_Y), primed(INVERSION)], [SAME, ROT45_Z]),
    blackWhite("-3'", '-3', 'C3i(C3)', [operation(ROT3_Z), primed(INVERSION)], [SAME]),
    blackWhite("32'", '32', 'D3(C3)', [operation(ROT3_Z), primed(ROT2_Y)], [SAME, ROT30_Z], 2),
    blackWhite("3m'", '3m', 'C3v(C3)', [operation(ROT3_Z), primed(MIRROR_Y)], [SAME, ROT30_Z], 2),
    blackWhite("-3m'", '-3m', 'D3d(C3i)', [operation(ROT3_Z), operation(INVERSION), primed(ROT2_Y)], [SAME, ROT30_Z], 2),
    blackWhite("-3'm'", '-3m', 'D3d(D3)', [operation(ROT3_Z), operation(ROT2_Y), primed(INVERSION)], [SAME, ROT30_Z], 2),
    blackWhite("-3'm", '-3m', 'D3d(C3v)', [operation(ROT3_Z), operation(MIRROR_Y), primed(INVERSION)], [SAME, ROT30_Z], 2),
    blackWhite("6'", '6', 'C6(C3)', [primed(ROT6_Z)], [SAME]),
    blackWhite("-6'", '-6', 'C3h(C3)', [primed(ROTINV6_Z)], [SAME]),
    blackWhite("6'/m'", '6/m', 'C6h(C3i)', [primed(ROT6_Z), operation(INVERSION)], [SAME]),
    blackWhite("6/m'", '6/m', 'C6h(C6)', [operation(ROT6_Z), primed(INVERSION)], [SAME]),
    blackWhite("6'/m", '6/m', 'C6h(C3h)', [primed(ROT6_Z), primed(INVERSION)], [SAME]),
    blackWhite("6'22'", '622', 'D6(D3)', [primed(ROT6_Z), operation(ROT2_Y)], [SAME, ROT30_Z], 2),
    blackWhite("62'2'", '622', 'D6(C6)', [operation(ROT6_Z), primed(ROT2_Y)], [SAME]),
    blackWhite("6'mm'", '6mm', 'C6v(C3v)', [primed(ROT6_Z), operation(MIRROR_Y)], [SAME, ROT30_Z], 2),
    blackWhite("6m'm'", '6mm', 'C6v(C6)', [operation(ROT6_Z), primed(MIRROR_Y)], [SAME]),
    blackWhite("-6'2m'", '-6m2', 'D3h(D3)', [primed(ROTINV6_Z), operation(ROT2_Y)], [SAME, ROT30_Z], 2),
    blackWhite("-6'm2'", '-6m2', 'D3h(C3v)', [primed(ROTINV6_Z), operation(MIRROR_Y)], [SAME, ROT30_Z], 2),
    blackWhite("-6m'2'", '-6m2', 'D3h(C3h)', [operation(ROTINV6_Z), primed(MIRROR_Y)], [SAME, ROT30_Z], 2),
    blackWhite("6'/m'mm'", '6/mmm', 'D6h(D3d)', [primed(ROT6_Z), operation(ROT2_Y), operation(INVERSION)], [SAME, ROT30_Z], 2),
    blackWhite("6/mm'm'", '6/mmm', 'D6h(C6h)', [operation(ROT6_Z), operation(INVERSION), primed(ROT2_Y)], [SAME]),
    blackWhite("6/m'm'm'", '6/mmm', 'D6h(D6)', [operation(ROT6_Z), operation(ROT2_Y), primed(INVERSION)], [SAME]),
    blackWhite("6/m'mm", '6/mmm', 'D6h(C6v)', [operation(ROT6_Z), operation(MIRROR_Y), primed(INVERSION)], [SAME]),
    blackWhite("6'/mmm'", '6/mmm', 'D6h(D3h)', [primed(ROT6_Z), operation(ROT2_Y), primed(INVERSION)], [SAME, ROT30_Z]),
    blackWhite("m'-3'", 'm-3', 'Th(T)', [operation(ROT2_Z), operation(ROT2_X), operation(ROT3_111), primed(INVERSION)], [SAME]),
    blackWhite("4'32'", '432', 'O(T)', [operation(ROT2_Z), operation(ROT2_X), operation(ROT3_111), primed(ROT4_Z)], [SAME]),
    blackWhite("-4'3m'", '-43m', 'Td(T)', [operation(ROT2_Z), operation(ROT2_X), operation(ROT3_111), primed(ROTINV4_Z)], [SAME]),
    blackWhite("m-3m'", 'm-3m', 'Oh(Th)', [operation(INVERSION), operation(ROT3_111), primed(ROT4_Z)], [SAME]),
    blackWhite("m'-3'm'", 'm-3m', 'Oh(O)', [operation(ROT4_Z), operation(ROT3_111), primed(INVERSION)], [SAME]),
    blackWhite("m'-3'm", 'm-3m', 'Oh(Td)', [operation(ROTINV4_Z), operation(ROT3_111), primed(INVERSION)], [SAME]),
];
/** Schoenflies symbol of a grey group: that of its class with the subscript R (ITC Vol. D, Table 1.5.2.1). */
export const greySchoenflies = (classSymbol) => `${classSymbol}R`;
/** The data of the crystal class with this key. */
export function classData(key) {
    const d = POINT_GROUP_DATA.find((x) => x.key === key);
    if (!d)
        throw new RangeError(`Unknown crystal class: ${JSON.stringify(key)}`);
    return d;
}
