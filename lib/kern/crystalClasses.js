/**
 * The crystallographic API: the 32 crystal classes, without time reversal. It is what `index.ts`
 * exports. Nothing here mentions time reversal: an operation is its matrix, a tensor has no time
 * parity, and the named properties are those of time-even tensors. A question that involves time
 * reversal (a magnetic point group, a time-odd tensor or property, an operation combined with time
 * reversal) is a RangeError that names the magnetic API (`magnetic.ts`, `symcrys/magnetic`), where
 * the key `'32'` is the white group and a crystal without magnetic order has the grey group of its
 * class (`"321'"`; docs/conventions.md, "Two entry points").
 *
 * Everything is computed by the modules that serve both entry points; this module checks what
 * comes in and leaves time reversal out of what goes back.
 */
import * as elements from './pointGroups/elements.js';
import * as groups from './pointGroups/pointGroups.js';
import * as properties from './pointGroups/properties.js';
import * as forms from './pointGroups/crystalForms.js';
import * as identify from './pointGroups/identify.js';
import * as orbits from './pointGroups/orbits.js';
import * as wyckoff from './pointGroups/wyckoff.js';
import * as site from './siteSymmetry.js';
import { TENSOR_PROPERTIES as ALL_TENSOR_PROPERTIES } from './tensors/propertyTable.js';
import * as tensors from './tensors/tensorForm.js';
const USE_MAGNETIC = "the crystallographic API has no time reversal; use the magnetic API ('symcrys/magnetic', in Python symcrys.magnetic)";
/**
 * The named tensor properties of the crystal classes: those of time-even tensors. `'gyrotropic'`
 * is optical activity. The properties of time-odd tensors (`'ferromagnetic'`, …) are in the
 * magnetic API.
 */
export const TENSOR_PROPERTIES = Object.freeze(Object.fromEntries(Object.entries(ALL_TENSOR_PROPERTIES)
    .filter(([, p]) => p.spec.timeParity === 'i')
    .map(([name, { spec, description, source }]) => [
    name,
    Object.freeze({
        spec: Object.freeze({ rank: spec.rank, parity: spec.parity, intrinsic: spec.intrinsic }),
        description,
        source,
    }),
])));
const TENSOR_PROPERTY_NAMES = Object.freeze(Object.keys(TENSOR_PROPERTIES));
// --- what comes in ---------------------------------------------------------------------------------
/** The key of a crystal class, checked. */
function classKey(key) {
    if (groups.isPointGroupKey(key))
        return key;
    if (groups.isMagneticPointGroupKey(key)) {
        throw new RangeError(`${JSON.stringify(key)} is a magnetic point group, not a crystal class: ${USE_MAGNETIC}`);
    }
    throw new RangeError(`Unknown point group key: ${JSON.stringify(key)}`);
}
/** A name of the table of this API, checked. */
function propertyName(name) {
    if (typeof name === 'string') {
        if (Object.hasOwn(TENSOR_PROPERTIES, name))
            return name;
        if (Object.hasOwn(ALL_TENSOR_PROPERTIES, name)) {
            throw new RangeError(`${JSON.stringify(name)} is the property of a time-odd tensor: ${USE_MAGNETIC}`);
        }
    }
    throw new RangeError(`Unknown tensor property: ${JSON.stringify(name)} (known: ${TENSOR_PROPERTY_NAMES.join(', ')})`);
}
/** The time-even tensor of a specification or of a property name, as the shared modules take it. */
function timeEven(specOrName) {
    if (typeof specOrName === 'string')
        return propertyName(specOrName);
    if (typeof specOrName !== 'object' || specOrName === null) {
        throw new RangeError(`Not a tensor specification: ${JSON.stringify(specOrName)}`);
    }
    const timeParity = specOrName.timeParity;
    if (timeParity === 'c')
        throw new RangeError(`A time-odd tensor (timeParity 'c'): ${USE_MAGNETIC}`);
    if (timeParity !== undefined && timeParity !== 'i') {
        throw new RangeError(`Unknown time parity: ${JSON.stringify(timeParity)}`);
    }
    return { rank: specOrName.rank, parity: specOrName.parity, timeParity: 'i', intrinsic: specOrName.intrinsic };
}
/** Checks a list of operations of a caller: an operation with time reversal is an error. */
function checkUnitary(operations) {
    operations.forEach((op, i) => {
        const timeReversal = op.timeReversal;
        if (timeReversal === true) {
            throw new RangeError(`Operation ${i} is combined with time reversal: ${USE_MAGNETIC}`);
        }
        if (timeReversal !== undefined && timeReversal !== false) {
            throw new RangeError(`Operation ${i}: timeReversal must be false or absent, not ${JSON.stringify(timeReversal)}`);
        }
    });
}
/** A list of operations as the shared modules take it. */
function unitary(operations) {
    checkUnitary(operations);
    return operations.map((op) => ({ matrix: op.matrix, timeReversal: false }));
}
// --- what goes back --------------------------------------------------------------------------------
const withoutTimeCache = new WeakMap();
/** The operations as their matrices; the shared modules return the same frozen list for the same call. */
function matricesOnly(ops) {
    let result = withoutTimeCache.get(ops);
    if (!result) {
        result = Object.freeze(ops.map((op) => Object.freeze({ matrix: op.matrix })));
        withoutTimeCache.set(ops, result);
    }
    return result;
}
const descriptionCache = new WeakMap();
// --- point groups ----------------------------------------------------------------------------------
export { POINT_GROUP_KEYS } from './pointGroups/pointGroups.js';
/** True if `key` is the key of one of the 32 crystal classes. */
export function isPointGroupKey(key) {
    return groups.isPointGroupKey(key);
}
const groupCache = new Map();
/** The crystal class with this key. Throws a RangeError for an unknown key. */
export function pointGroup(key) {
    let g = groupCache.get(classKey(key));
    if (!g) {
        const { crystalSystem, order, centrosymmetric, polar, chiral, laueClass } = groups.pointGroup(key);
        g = Object.freeze({ key, crystalSystem, order, centrosymmetric, polar, chiral, laueClass });
        groupCache.set(key, g);
    }
    return g;
}
/** All 32 crystal classes, in the order of `POINT_GROUP_KEYS` (by crystal system, as in ITA). */
export function pointGroups() {
    return groups.POINT_GROUP_KEYS.map((key) => pointGroup(key));
}
/**
 * Finds a crystal class by a Hermann–Mauguin symbol in the given convention (default `'itc'`): the
 * short symbol of a setting, a full symbol, or the key (spaces are ignored). A symbol that names
 * one setting gives that setting; the key, and a short symbol that several settings share (the
 * monoclinic ones: `2` for unique axis b and c), give the default setting of the convention.
 * Returns undefined if nothing matches, also for a value that is not a string and for the
 * symbol of a magnetic group with time reversal. Symbols are written as in this library: `-` for
 * the overbar, also in the Birss convention (`m-3m`, where Birss prints `m3m`; docs/conventions.md,
 * "Where ITC and Birss differ").
 */
export function findPointGroup(hm, conventionName = 'itc') {
    return groups.findPointGroup(hm, conventionName);
}
/** The settings of a crystal class, with symbols and the default of the given convention (default `'itc'`). */
export function settings(key, conventionName = 'itc') {
    return groups.settings(classKey(key), conventionName);
}
/**
 * All operations of the crystal class in the requested setting (default: the convention's default
 * setting). ITC convention: in ITA's order, identity first, then as ITA numbers the general
 * position. Birss convention: in birss-app's order (docs/conventions.md, "Order of the
 * operations"). The matrices are Cartesian (docs/conventions.md, "Cartesian frame").
 */
export function operations(key, options) {
    return matricesOnly(groups.operations(classKey(key), options));
}
/**
 * Generators of the crystal class in the requested setting (docs/conventions.md, "Generators"). ITC
 * convention: ITA's selected generators in printed order, without the identity and ITA's lattice
 * translations, so the list is empty for `1`; for `mm2` settings 2 and 3, which ITA does not list,
 * those of setting 1 carried into their frame. Birss convention: birss-app's generators (for `1`
 * the identity, as in birss-app).
 */
export function generators(key, options) {
    return matricesOnly(groups.generators(classKey(key), options));
}
/** A symbol of the crystal class in the requested convention and setting. */
export function symbol(key, options) {
    return groups.symbol(classKey(key), options);
}
// --- properties that follow from operations ---------------------------------------------------------
export { holohedry } from './pointGroups/properties.js';
/**
 * True if the group generated by `operations` contains the inversion, e.g. for the operations of a
 * distorted crystal. A list that is not closed is closed first. For a crystal class, read
 * `pointGroup(key).centrosymmetric`.
 */
export function isCentrosymmetricOf(operations) {
    return properties.isCentrosymmetricOf(unitary(operations));
}
/**
 * True if the group generated by `operations` is chiral: proper rotations only. For a crystal
 * class, read `pointGroup(key).chiral`. Polar is the named property `'pyroelectric'`:
 * `allowsPropertyOf(operations, 'pyroelectric')`.
 */
export function isChiralOf(operations) {
    return properties.isChiralOf(unitary(operations));
}
/**
 * The crystal class generated by a list of Cartesian operations, for instance those left after
 * distorting a crystal: its key, and the setting whose operations it equals in the frame of symcrys
 * (absent if the group is the class in another orientation, e.g. a threefold axis along [111]). The
 * list is closed into a group first, two matrices being equal when no entry differs by `tolerance`
 * (default `EPSILON`) or more. Returns undefined if the operations generate no crystal class (an
 * operation of order 5, a group larger than 48). Throws a RangeError for a matrix that is not
 * orthogonal (within `tolerance`, at least `EPSILON`). The classes `1` and `-1` have no
 * orientation, so they always have setting 1. The first call builds a table of the groups (about
 * 0.1 s; docs/conventions.md, "Point group of a list of operations").
 */
export function pointGroupOf(operations, options) {
    return identify.pointGroupOf(unitary(operations), options);
}
/**
 * Each operation of a list described geometrically, in the order of the list: kind, n, the
 * Cartesian axis (rotation or rotoinversion axis, mirror normal) with its first non-zero component,
 * in the order x, y, z, positive, and for n ≥ 3 the sense about that axis. The axes are not named
 * by lattice directions, since the list need not belong to a setting; for a crystal class given by
 * its key, `describeOperations` names them. Throws a RangeError for a matrix that is not orthogonal
 * or not a crystallographic operation (a rotation part by an angle other than 360°/n, n = 1, 2, 3,
 * 4, 6), both within `tolerance` (default `EPSILON`, as for `pointGroupOf`).
 */
export function describeOperationsOf(operations, options) {
    return Object.freeze(identify.describeOperationsOf(unitary(operations), options).map((d) => {
        const { timeReversal: _timeReversal, ...rest } = d;
        return Object.freeze(rest);
    }));
}
// --- symmetry elements -----------------------------------------------------------------------------
/**
 * Each operation of the crystal class described geometrically, in the order of `operations` for
 * the same key and options. Axes are named by the symmetry direction they lie along: in the ITC
 * convention with the sign of ITA Table 2.1.3.1, in the Birss convention signed as birss-app signs
 * them (first non-zero Cartesian component positive); the sign fixes what the sense refers to.
 */
export function describeOperations(key, options) {
    const described = elements.describeOperations(classKey(key), options);
    let result = descriptionCache.get(described);
    if (!result) {
        result = Object.freeze(described.map(({ kind, order, axis, sense }) => Object.freeze({ kind, order, ...(axis ? { axis } : {}), ...(sense ? { sense } : {}) })));
        descriptionCache.set(described, result);
    }
    return result;
}
/**
 * The positions of the full Hermann–Mauguin symbol in the requested convention and setting, each
 * with its symmetry directions (ITA Table 2.1.3.1) and the symmetry elements along them. All
 * positions of the crystal family are listed, also those the symbol of the class leaves out (then
 * without `symbol`); the triclinic family has none. The directions keep the sign of Table 2.1.3.1
 * in both conventions; in the Birss convention an axis of `describeOperations` may be reversed, so
 * match it to a direction whose dot product with it is ±1, not by identity.
 */
export function symmetryDirections(key, options) {
    return elements.symmetryDirections(classKey(key), options);
}
// --- site symmetry and Wyckoff positions -----------------------------------------------------------
/**
 * The site symmetry of `direction` (any non-zero vector, Cartesian) under `operations`, which may
 * be any list of point operations (for instance those of a distorted crystal). The operations
 * fixing the direction within the tolerance are closed under the products found in the list and
 * the direction is set onto their fixed space, repeated until stable, so that for a group the
 * result is a subgroup and the set direction lies exactly on its elements. For a list that is not a
 * group, `multiplicity` may not be an integer. Throws a RangeError for a zero vector, and if the
 * closed operations fix no common direction (a tolerance far too large, e.g. 0.5).
 */
export function siteSymmetry(operations, direction, options) {
    checkUnitary(operations);
    // The shared function reads the matrices only, and it keeps the products of a list by the identity
    // of the list, so the list of the caller is passed on as it is.
    return site.siteSymmetry(operations, direction, options);
}
/**
 * The Wyckoff positions of a crystal class for directions, as ITA tabulates them (general position
 * first), in the ITC convention only (docs/conventions.md, "Site symmetry and Wyckoff positions").
 */
export function wyckoffPositions(key, options) {
    return wyckoff.wyckoffPositions(classKey(key), options);
}
/**
 * The Wyckoff position of a direction (Cartesian) in a crystal class: the position whose site
 * symmetry is conjugate to that of the direction (ITA's definition). `tolerance` as for
 * `siteSymmetry`.
 */
export function wyckoffPositionOf(key, direction, options) {
    return wyckoff.wyckoffPositionOf(classKey(key), direction, options);
}
// --- lattice basis and orbits ---------------------------------------------------------------------
/**
 * The operations of the crystal class in the conventional lattice basis (a, b, c; for the trigonal
 * classes the hexagonal axes), in the order of `operations` for the same setting and convention:
 * integer matrices W acting on the coordinates of a lattice direction [uvw], W = B⁻¹·R·B with the
 * basis B of `latticeBasis` and the Cartesian matrix R of `operations`. They do not depend on the
 * cell angles, so they exist for every family; for the monoclinic and triclinic families a, b, c
 * are taken along x, y, z, as for the Wyckoff positions. In the ITC convention they are the
 * matrices of ITA's general position (6th ed., Table 3.2.3.2). Not orthogonal in general: pass
 * them to no function that takes Cartesian operations (docs/conventions.md, "Lattice basis and
 * orbits").
 */
export function latticeOperations(key, options) {
    return matricesOnly(orbits.latticeOperations(classKey(key), options));
}
export function orbit(key, indices, options) {
    return orbits.orbit(classKey(key), indices, options);
}
/**
 * The orbit of a direction (any non-zero vector, Cartesian, e.g. a face normal) under a list of
 * operations, for instance those of a distorted crystal: the images of its unit vector under each
 * operation, coinciding images merged (closer than `tolerance`, default `EPSILON`, as for
 * `siteSymmetry`), in the order in which the operations reach them, each with the indices of the
 * operations that map the direction there. The list is taken as it is, not closed into a group.
 * Throws a RangeError for a zero vector and for a matrix that is not orthogonal.
 */
export function orbitOf(operations, direction, options) {
    checkUnitary(operations);
    return orbits.orbitOf(operations, direction, options);
}
// --- crystal forms ---------------------------------------------------------------------------------
/**
 * The 47 crystal forms of ITA Table 3.2.1.3 (6th ed., pp. 724–726) with ITA's numbers, English
 * names, numbers of faces and eigensymmetries: `CRYSTAL_FORM_TYPES[n - 1]` is form n. Each
 * crystal form of `crystalForms` names its form by this number (docs/conventions.md, "Crystal
 * forms").
 */
export const CRYSTAL_FORM_TYPES = forms.CRYSTAL_FORM_TYPES;
/**
 * The crystal forms of a crystal class, as ITA 6th ed. Table 3.2.3.2 prints them: for each Wyckoff
 * position (general position first) its basic form (two for the cubic faces (hhl) of -43m and
 * m-3m), then its limiting forms. In the ITC convention
 * only, like the Wyckoff positions (docs/conventions.md, "Crystal forms").
 */
export function crystalForms(key, options) {
    return forms.crystalForms(classKey(key), options);
}
// --- tensors ---------------------------------------------------------------------------------------
/**
 * The form of a tensor under a crystal class in the requested setting (default: the default
 * setting of the convention, `'itc'` unless given). The tensor is given by its specification or by
 * the name of a property in `TENSOR_PROPERTIES` (`'piezoelectric'`). The convention matters only
 * through the setting: the same setting index gives the same form in both conventions
 * (docs/conventions.md, "Tensors").
 */
export function tensorForm(key, spec, options) {
    return tensors.tensorForm(classKey(key), timeEven(spec), options);
}
/**
 * The form of a tensor under the group generated by `operations`, e.g. the site symmetry of a
 * surface normal (`siteSymmetry`) or the operations of a distorted crystal. The tensor is given by
 * its specification or by the name of a property in `TENSOR_PROPERTIES`. The operations are
 * Cartesian and orthogonal; a list that is not closed is closed first.
 */
export function tensorFormOf(operations, spec) {
    return tensors.tensorFormOf(unitary(operations), timeEven(spec));
}
/**
 * The components of `tensor` (length 3^rank, flat index) in a frame rotated by the orthogonal
 * matrix `rotation`: t′_{i…} = f·Σ R_{ia}…R_{…}·t_{a…}, with f = det(R) for an axial tensor and 1
 * for a polar one. To express a tensor in the frame of a surface, pass the matrix whose rows are
 * the new axes in the old frame. The kind of tensor is given by its specification or by the name
 * of a property in `TENSOR_PROPERTIES`.
 */
export function rotateTensor(tensor, rotation, specOrName) {
    return tensors.rotateTensor(tensor, rotation, timeEven(specOrName));
}
/**
 * True if the crystal class allows the named property, e.g. `allowsProperty('-6m2',
 * 'piezoelectric')`: the tensor that describes it (`TENSOR_PROPERTIES`) has a non-zero form under
 * the class. Symmetry only allows a property; whether a crystal shows it is a question of the
 * material. It does not depend on setting or convention. Throws a RangeError for an unknown key or
 * name.
 */
export function allowsProperty(key, name) {
    return tensors.tensorForm(classKey(key), propertyName(name), { setting: 1 }).basis.length > 0;
}
/** The named properties the crystal class allows, in the order of `TENSOR_PROPERTIES`. */
export function allowedProperties(key) {
    return TENSOR_PROPERTY_NAMES.filter((name) => allowsProperty(key, name));
}
/**
 * True if the group generated by `operations` allows the named property, e.g. for the site
 * symmetry of a surface normal or the operations of a distorted crystal.
 */
export function allowsPropertyOf(operations, name) {
    return tensors.tensorFormOf(unitary(operations), propertyName(name)).basis.length > 0;
}
/** The named properties the group generated by `operations` allows. */
export function allowedPropertiesOf(operations) {
    const ops = unitary(operations);
    return TENSOR_PROPERTY_NAMES.filter((name) => tensors.tensorFormOf(ops, name).basis.length > 0);
}
