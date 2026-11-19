/**
 * Row reduction of real vectors (any length): the reduced row echelon form of a spanning set, and
 * the rank. The tolerances are those of birss-app's `linalg.ts`, where the tensor code comes from.
 */
/** An entry below this (absolute) does not serve as a pivot: float noise is never a new direction. */
export const PIVOT_EPSILON = 1e-7;
/** An entry below this (absolute) is not eliminated, and is set to zero in the result. */
export const ELIMINATION_EPSILON = 1e-12;
/**
 * The reduced row echelon form of the span of `vectors` (all of length `dim`): one row per
 * independent direction, each with a 1 at its pivot and 0 at every other row's pivot, pivots
 * ascending. The rows are unique for a given span, so the pivots name the free parameters
 * unambiguously: each is the lowest-index component that is independent of the ones before it.
 */
export function reducedRowEchelon(vectors, dim) {
    const m = vectors.map((v) => Array.from(v));
    let row = 0;
    for (let c = 0; c < dim && row < m.length; c++) {
        let pivot = row;
        for (let r = row + 1; r < m.length; r++)
            if (Math.abs(m[r][c]) > Math.abs(m[pivot][c]))
                pivot = r;
        if (Math.abs(m[pivot][c]) < PIVOT_EPSILON)
            continue;
        [m[row], m[pivot]] = [m[pivot], m[row]];
        const p = m[row][c];
        for (let j = 0; j < dim; j++)
            m[row][j] /= p;
        for (let r = 0; r < m.length; r++) {
            if (r === row || Math.abs(m[r][c]) <= ELIMINATION_EPSILON)
                continue;
            const f = m[r][c];
            for (let j = 0; j < dim; j++)
                m[r][j] -= f * m[row][j];
        }
        row++;
    }
    const out = m.slice(0, row);
    for (const r of out)
        for (let j = 0; j < dim; j++)
            if (Math.abs(r[j]) < ELIMINATION_EPSILON)
                r[j] = 0;
    return out;
}
/** The number of independent vectors among `vectors` (all of length `dim`). */
export function rank(vectors, dim) {
    return reducedRowEchelon(vectors, dim).length;
}
