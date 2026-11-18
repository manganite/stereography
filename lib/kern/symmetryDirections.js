/**
 * The symmetry directions of the crystal families: the lattice directions along which the
 * symmetry elements of a crystallographic point group lie, grouped by their position in the full
 * Hermann–Mauguin symbol. Data from ITA Table 2.1.3.1 (docs/conventions.md, "Symmetry
 * directions and elements"); `symmetryDirections.reference.test.ts` re-reads the transcription and requires the
 * same directions, in the same order and with the same signs.
 */
const frozen = (rows) => Object.freeze(rows.map((dirs) => Object.freeze(dirs.map((d) => Object.freeze(d)))));
/**
 * The directions of each position of the full symbol, per family, as printed in ITA Table 2.1.3.1
 * (hexagonal family: the row "Hexagonal", which also serves the trigonal classes with hexagonal
 * axes). Monoclinic: the full symbol reads along a, b, c (ITA 6th ed. § 2.1.3.15, p. 171), the
 * orthorhombic row. Triclinic: no symmetry direction.
 */
export const LATTICE_SYMMETRY_DIRECTIONS = Object.freeze({
    triclinic: frozen([]),
    monoclinic: frozen([[[1, 0, 0]], [[0, 1, 0]], [[0, 0, 1]]]),
    orthorhombic: frozen([[[1, 0, 0]], [[0, 1, 0]], [[0, 0, 1]]]),
    tetragonal: frozen([
        [[0, 0, 1]],
        [
            [1, 0, 0],
            [0, 1, 0],
        ],
        [
            [1, -1, 0],
            [1, 1, 0],
        ],
    ]),
    hexagonal: frozen([
        [[0, 0, 1]],
        [
            [1, 0, 0],
            [0, 1, 0],
            [-1, -1, 0],
        ],
        [
            [1, -1, 0],
            [1, 2, 0],
            [-2, -1, 0],
        ],
    ]),
    cubic: frozen([
        [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ],
        [
            [1, 1, 1],
            [1, -1, -1],
            [-1, 1, -1],
            [-1, -1, 1],
        ],
        [
            [1, -1, 0],
            [1, 1, 0],
            [0, 1, -1],
            [0, 1, 1],
            [-1, 0, 1],
            [1, 0, 1],
        ],
    ]),
});
