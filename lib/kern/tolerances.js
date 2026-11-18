/**
 * Numeric tolerances, in one place. The values differ on purpose: each gates a different quantity.
 */
/** Two matrix entries (or vector components) closer than this are equal. */
export const EPSILON = 1e-6;
/**
 * During group closure, an entry closer than this to one of the exact values in `SNAP_VALUES`
 * (linalg.ts) is replaced by it, so rounding errors cannot accumulate over repeated products.
 */
export const SNAP_EPSILON = 1e-9;
