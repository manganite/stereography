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
 * match it to a direction by |dot| = 1, not by identity.
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
