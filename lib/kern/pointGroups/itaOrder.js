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
import { inverse, multiply, snap } from '../linalg.js';
import { crystalFamily, latticeBasis } from '../lattice.js';
import { IDENTITY_OPERATION, compose, operation, operationsEqual } from '../operations.js';
/** ITA's selected generators per setting (`key#setting`), in printed order (identity and translations left out). */
const ITA_GENERATORS = {
    // 1: P1 (No. 1), p. 113
    '1#1': [],
    // -1: P-1 (No. 2), p. 115
    '-1#1': [
        /* (2) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 2, unique axis b: P121 (No. 3), p. 117
    '2#2': [
        /* (2) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // 2, unique axis c: P112 (No. 3), p. 119
    '2#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // m, unique axis b: P1m1 (No. 6), p. 133
    'm#2': [
        /* (2) x,-y,z */ [
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // m, unique axis c: P11m (No. 6), p. 135
    'm#1': [
        /* (2) x,y,-z */ [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // 2/m, unique axis b: P12/m1 (No. 10), p. 161
    '2/m#2': [
        /* (2) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (3) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 2/m, unique axis c: P112/m (No. 10), p. 163
    '2/m#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 222: P222 (No. 16), p. 201
    '222#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // mm2: Pmm2 (No. 25), p. 219
    'mm2#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) x,-y,z */ [
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // mmm: Pmmm (No. 47), p. 263
    'mmm#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 4: P4 (No. 75), p. 332
    '4#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -y,x,z */ [
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // -4: P-4 (No. 81), p. 341
    '-4#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) y,-x,-z */ [
            [0, 1, 0],
            [-1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // 4/m: P4/m (No. 83), p. 345
    '4/m#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -y,x,z */ [
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
        /* (5) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 422: P422 (No. 89), p. 363
    '422#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -y,x,z */ [
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
        /* (5) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // 4mm: P4mm (No. 99), p. 383
    '4mm#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -y,x,z */ [
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
        /* (5) x,-y,z */ [
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // -42m: P-42m (No. 111), p. 407
    '-42m#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) y,-x,-z */ [
            [0, 1, 0],
            [-1, 0, 0],
            [0, 0, -1],
        ],
        /* (5) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // -4m2: P-4m2 (No. 115), p. 415
    '-42m#2': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) y,-x,-z */ [
            [0, 1, 0],
            [-1, 0, 0],
            [0, 0, -1],
        ],
        /* (5) x,-y,z */ [
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // 4/mmm: P4/mmm (No. 123), p. 431
    '4/mmm#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -y,x,z */ [
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
        /* (5) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (9) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 3: P3 (No. 143), p. 491
    '3#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
    ],
    // -3: P-3 (No. 147), p. 499
    '-3#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 312: P312 (No. 149), p. 505
    '32#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -y,-x,-z */ [
            [0, -1, 0],
            [-1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // 321: P321 (No. 150), p. 507
    '32#2': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // 3m1: P3m1 (No. 156), p. 521
    '3m#2': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -y,-x,z */ [
            [0, -1, 0],
            [-1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // 31m: P31m (No. 157), p. 523
    '3m#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) y,x,z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // -31m: P-31m (No. 162), p. 537
    '-3m#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -y,-x,-z */ [
            [0, -1, 0],
            [-1, 0, 0],
            [0, 0, -1],
        ],
        /* (7) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // -3m1: P-3m1 (No. 164), p. 541
    '-3m#2': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
        /* (7) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 6: P6 (No. 168), p. 553
    '6#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
    ],
    // -6: P-6 (No. 174), p. 561
    '-6#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) x,y,-z */ [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
    ],
    // 6/m: P6/m (No. 175), p. 563
    '6/m#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (7) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 622: P622 (No. 177), p. 567
    '622#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (7) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // 6mm: P6mm (No. 183), p. 579
    '6mm#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (7) -y,-x,z */ [
            [0, -1, 0],
            [-1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // -6m2: P-6m2 (No. 187), p. 587
    '-6m2#2': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) x,y,-z */ [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (7) -y,-x,z */ [
            [0, -1, 0],
            [-1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // -62m: P-62m (No. 189), p. 591
    '-6m2#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) x,y,-z */ [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (7) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // 6/mmm: P6/mmm (No. 191), p. 595
    '6/mmm#1': [
        /* (2) -y,x-y,z */ [
            [0, -1, 0],
            [1, -1, 0],
            [0, 0, 1],
        ],
        /* (4) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (7) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
        /* (13) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 23: P23 (No. 195), p. 603
    '23#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) z,x,y */ [
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0],
        ],
    ],
    // m-3: Pm-3 (No. 200), p. 615
    'm-3#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) z,x,y */ [
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0],
        ],
        /* (13) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
    // 432: P432 (No. 207), p. 635
    '432#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) z,x,y */ [
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0],
        ],
        /* (13) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
    ],
    // -43m: P-43m (No. 215), p. 657
    '-43m#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) z,x,y */ [
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0],
        ],
        /* (13) y,x,z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, 1],
        ],
    ],
    // m-3m: Pm-3m (No. 221), p. 673
    'm-3m#1': [
        /* (2) -x,-y,z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, 1],
        ],
        /* (3) -x,y,-z */ [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, -1],
        ],
        /* (5) z,x,y */ [
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0],
        ],
        /* (13) y,x,-z */ [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ],
        /* (25) -x,-y,-z */ [
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
        ],
    ],
};
/** ITA's selected generators of a setting as matrices in the conventional basis, or undefined if ITA does not list it. */
function itaGenerators(key, setting) {
    return ITA_GENERATORS[`${key}#${setting}`];
}
/**
 * W in the conventional basis as a Cartesian matrix B·W·B⁻¹. Monoclinic and triclinic: W itself,
 * without a basis (symcrys fixes none for them): their point operations are ±1 on the diagonal,
 * and the unique axis (y or z) is perpendicular to the other two axes, so W is the same in every
 * Cartesian frame with that axis along y or z.
 */
function cartesian(w, system) {
    const family = crystalFamily(system);
    if (family === 'monoclinic' || family === 'triclinic')
        return w;
    const b = latticeBasis(family);
    return multiply(multiply(b, w), inverse(b));
}
/** ITA's selected generators of a setting as Cartesian operations, in printed order, or undefined if ITA does not list it. */
export function itaGeneratorOperations(key, setting, system) {
    return itaGenerators(key, setting)?.map((w) => operation(snap(cartesian(w, system))));
}
/**
 * The operations of a setting in ITA's order, built coset by coset from ITA's generators, or
 * undefined if ITA does not list the setting. `closed` (the closure of the stored generators) only
 * bounds the loop; the caller checks that the result is the same set.
 */
export function inItaOrder(key, setting, system, closed) {
    const gens = itaGeneratorOperations(key, setting, system);
    if (!gens)
        return undefined;
    const has = (list, op) => list.some((x) => operationsEqual(x, op));
    const list = [IDENTITY_OPERATION];
    for (const g of gens) {
        const h = list.slice();
        for (let power = g; !has(h, power); power = compose(power, g)) {
            if (list.length > closed.length)
                break;
            for (const x of h)
                list.push(compose(power, x));
        }
    }
    return list;
}
