/**
 * Public API for the point groups: the 32 crystallographic point groups (crystal classes) and the
 * 90 magnetic point groups with time reversal (32 grey, 58 black-and-white). Lookup, settings,
 * operations, generators and symbols, in the ITC convention (default) or the Birss convention.
 */
import { INVERSION, det, matricesEqual } from '../linalg.js';
import { EPSILON } from '../tolerances.js';
import { MAX_GROUP_ORDER, closeGroup, compose, operationsEqual, transformOperation, } from '../operations.js';
import { inItaOrder, itaGeneratorOperations } from './itaOrder.js';
import { POINT_GROUP_DATA, POINT_GROUP_KEYS } from './data.js';
import { BLACK_WHITE_DATA, MAGNETIC_POINT_GROUP_KEYS, TIME_REVERSAL, greySchoenflies, } from './magneticData.js';
import { primedSymbols } from './magneticSymbols.js';
export { POINT_GROUP_KEYS } from './data.js';
export { MAGNETIC_POINT_GROUP_KEYS } from './magneticData.js';
const BY_KEY = new Map();
for (const d of POINT_GROUP_DATA) {
    const self = {
        key: d.key,
        type: 'I',
        get crystalClass() {
            return self;
        },
        crystalSystem: d.crystalSystem,
        schoenflies: d.schoenflies,
        generators: d.generators,
        settings: d.settings,
        itcDefault: d.itcDefault,
        symbols: d.settings,
    };
    BY_KEY.set(d.key, self);
}
// Grey groups: the class and time reversal (ITC Vol. D, eq. (1.5.2.1)). birss-app generates them
// from the generators of the class followed by 1', without the identity generator of class 1.
for (const d of POINT_GROUP_DATA) {
    const crystalClass = BY_KEY.get(d.key);
    const key = `${d.key}1'`;
    BY_KEY.set(key, {
        key,
        type: 'II',
        crystalClass,
        crystalSystem: d.crystalSystem,
        schoenflies: greySchoenflies(d.schoenflies),
        generators: [...(d.key === '1' ? [] : d.generators), TIME_REVERSAL],
        settings: d.settings,
        itcDefault: d.itcDefault,
    });
}
for (const d of BLACK_WHITE_DATA) {
    const crystalClass = BY_KEY.get(d.crystalClass);
    BY_KEY.set(d.key, {
        key: d.key,
        type: 'III',
        crystalClass,
        crystalSystem: crystalClass.crystalSystem,
        schoenflies: d.schoenflies,
        generators: d.generators,
        settings: d.settings,
        itcDefault: d.itcDefault,
    });
}
/** True if `key` is the key of one of the 32 crystal classes. */
export function isPointGroupKey(key) {
    return BY_KEY.get(key)?.type === 'I';
}
/** True if `key` is the key of one of the 122 magnetic point groups (the 32 crystal classes included). */
export function isMagneticPointGroupKey(key) {
    return BY_KEY.has(key);
}
function data(key) {
    const d = BY_KEY.get(key);
    if (!d)
        throw new RangeError(`Unknown point group key: ${JSON.stringify(key)}`);
    return d;
}
function convention(options) {
    const c = options?.convention ?? 'itc';
    if (c !== 'itc' && c !== 'birss')
        throw new RangeError(`Unknown convention: ${JSON.stringify(c)}`);
    return c;
}
function defaultSetting(d, c) {
    return c === 'itc' ? d.itcDefault : 1;
}
/** The requested setting index, checked; the convention's default if none is given. */
function settingIndex(d, options) {
    const c = convention(options);
    const index = options?.setting ?? defaultSetting(d, c);
    if (!Number.isInteger(index) || index < 1 || index > d.settings.length) {
        throw new RangeError(`Point group ${d.key} has no setting ${String(index)} (settings 1 to ${d.settings.length})`);
    }
    return index;
}
function freezeOperation(op) {
    const [r0, r1, r2] = op.matrix;
    return Object.freeze({
        matrix: Object.freeze([Object.freeze([...r0]), Object.freeze([...r1]), Object.freeze([...r2])]),
        timeReversal: op.timeReversal,
    });
}
const generatorCache = new Map();
const operationCache = new Map();
/** The stored generators carried into the frame of a setting: the generators of the Birss convention. */
function settingGenerators(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = generatorCache.get(cacheKey);
    if (!result) {
        const frame = d.settings[index - 1].frame;
        result = Object.freeze(d.generators.map((g) => freezeOperation(transformOperation(g, frame))));
        generatorCache.set(cacheKey, result);
    }
    return result;
}
/** The operation of `ops` with the matrix of `op`, whatever its time reversal. */
function withMatrix(ops, op) {
    const found = ops.find((x) => matricesEqual(x.matrix, op.matrix));
    if (!found)
        throw new Error('Operation of the crystal class missing in the magnetic group');
    return found;
}
const classSettingCache = new Map();
/**
 * The setting of the crystal class whose frame is that of setting `index` of the group: the one
 * in which the class has the operations of the group without their time reversal. For a class and
 * a grey group it is `index` itself. A black-and-white group may have its settings in another
 * order than its class, and settings its class does not tell apart (docs/conventions.md,
 * "Settings").
 */
function classSetting(d, index) {
    if (d.type !== 'III')
        return index;
    const cacheKey = `${d.key}#${index}`;
    let result = classSettingCache.get(cacheKey);
    if (!result) {
        const ops = closeGroup(settingGenerators(d, index));
        const c = d.crystalClass;
        result =
            c.settings.findIndex((_, i) => {
                const classOps = settingOperations(c, i + 1);
                return (classOps.length === ops.length && classOps.every((x) => ops.some((y) => matricesEqual(x.matrix, y.matrix))));
            }) + 1;
        if (!result)
            throw new Error(`Point group ${d.key}, setting ${index}: no setting of class ${c.key} has this frame`);
        classSettingCache.set(cacheKey, result);
    }
    return result;
}
const itaGeneratorCache = new Map();
/**
 * ITA's generators of a setting (see `generators`); throws if setting 1 of a class has none. For a
 * magnetic group: ITA's generators of its class in the same frame, each with the time reversal it
 * has in the group; for a grey group followed by time reversal 1'.
 */
function settingItaGenerators(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = itaGeneratorCache.get(cacheKey);
    if (!result) {
        let gens;
        if (d.type === 'I') {
            const ita = itaGeneratorOperations(d.key, index, d.crystalSystem);
            if (ita)
                gens = ita;
            else {
                if (index === 1)
                    throw new Error(`Point group ${d.key}: no ITA generators for setting 1`);
                gens = settingItaGenerators(d, 1).map((op) => transformOperation(op, d.settings[index - 1].frame));
            }
        }
        else {
            const classGens = settingItaGenerators(d.crystalClass, classSetting(d, index));
            gens =
                d.type === 'II'
                    ? [...classGens, TIME_REVERSAL]
                    : classGens.map((g) => withMatrix(settingOperations(d, index), g));
        }
        result = Object.freeze(gens.map(freezeOperation));
        itaGeneratorCache.set(cacheKey, result);
    }
    return result;
}
const birssOperationCache = new Map();
/**
 * The operations of a setting in the Birss convention, in birss-app's order (docs/conventions.md,
 * "Birss convention and birss-app"): the generators of the setting first, then repeated passes
 * that append every new product g·h of two operations found before the pass, in the order of g,
 * then h, until a pass adds nothing.
 */
function birssOperations(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = birssOperationCache.get(cacheKey);
    if (!result) {
        const group = [...settingGenerators(d, index)];
        for (let changed = true; changed;) {
            changed = false;
            const size = group.length;
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const product = compose(group[i], group[j]);
                    if (!group.some((g) => operationsEqual(g, product))) {
                        if (group.length >= MAX_GROUP_ORDER)
                            throw new Error(`Point group ${d.key}: closure does not terminate`);
                        group.push(product);
                        changed = true;
                    }
                }
            }
        }
        if (!sameSet(group, settingOperations(d, index))) {
            throw new Error(`Point group ${d.key}, setting ${index}: Birss operations differ from the closure`);
        }
        result = Object.freeze(group.map(freezeOperation));
        birssOperationCache.set(cacheKey, result);
    }
    return result;
}
/**
 * The operations of a setting in ITA's order (docs/conventions.md, "Order of the operations"). A
 * crystal class: for a setting ITA lists, coset by coset from ITA's generators; for a setting ITA
 * does not list (today `mm2` settings 2 and 3), the order of setting 1, carried into the frame of
 * the setting. Setting 1 is always one ITA lists; throws if its generators are missing or do not
 * give the closure. A black-and-white group: the operations of its class in the same frame, in
 * that order, each with the time reversal it has in the group. A grey group: the operations of its
 * class, then the same sequence combined with time reversal.
 */
function settingOperations(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = operationCache.get(cacheKey);
    if (!result) {
        const closed = closeGroup(settingGenerators(d, index));
        let ordered;
        if (d.type === 'I') {
            ordered = inItaOrder(d.key, index, d.crystalSystem, closed);
            if (!ordered) {
                if (index === 1)
                    throw new Error(`Point group ${d.key}: no ITA generators for setting 1`);
                ordered = settingOperations(d, 1).map((op) => transformOperation(op, d.settings[index - 1].frame));
            }
        }
        else {
            const classOps = settingOperations(d.crystalClass, classSetting(d, index));
            ordered =
                d.type === 'II'
                    ? [...classOps, ...classOps.map((op) => compose(TIME_REVERSAL, op))]
                    : classOps.map((op) => withMatrix(closed, op));
        }
        if (!sameSet(ordered, closed)) {
            throw new Error(`Point group ${d.key}, setting ${index}: ordered operations differ from the closure`);
        }
        result = Object.freeze(ordered.map(freezeOperation));
        operationCache.set(cacheKey, result);
    }
    return result;
}
/** True if `a` is `b` in some order: equal length, no operation twice in `a`, every one of `a` in `b`. */
function sameSet(a, b) {
    return (a.length === b.length &&
        a.every((op, i) => b.some((x) => operationsEqual(x, op)) && !a.slice(0, i).some((x) => operationsEqual(x, op))));
}
const symbolCache = new Map();
/**
 * Short and full symbol of a setting in a convention. A crystal class: as stored. A grey group:
 * the symbols of its class followed by `1'`. A black-and-white group: the symbols of its class in
 * the same frame, with the primes of its operations (magneticSymbols.ts).
 */
function settingSymbols(d, index, c) {
    if (d.symbols)
        return d.symbols[index - 1][c];
    const cacheKey = `${d.key}#${index}#${c}`;
    let result = symbolCache.get(cacheKey);
    if (!result) {
        const classSymbols = settingSymbols(d.crystalClass, classSetting(d, index), c);
        result = Object.freeze(d.type === 'II'
            ? { short: `${classSymbols.short}1'`, full: `${classSymbols.full} 1'` }
            : primedSymbols(classSymbols, d.crystalSystem, c, settingOperations(d, index)));
        symbolCache.set(cacheKey, result);
    }
    return result;
}
// --- properties fixed by the operations (setting 1, the frame all stored data share) ---------------
/** Contains the inversion, not combined with time reversal. */
function hasInversion(ops) {
    return ops.some((op) => !op.timeReversal && matricesEqual(op.matrix, INVERSION));
}
/**
 * Some direction is left unchanged by every operation: the group average of the matrices, which
 * projects onto the invariant vectors, is not zero.
 */
function hasFixedDirection(ops) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let sum = 0;
            for (const op of ops)
                sum += op.matrix[i][j];
            if (Math.abs(sum / ops.length) > EPSILON)
                return true;
        }
    }
    return false;
}
const laueCache = new Map();
/** The centrosymmetric crystal class generated by a crystal class and the inversion. */
function laueClassOf(crystalClass) {
    const cached = laueCache.get(crystalClass.key);
    if (cached)
        return cached;
    const ops = settingOperations(crystalClass, 1);
    const inversion = { matrix: INVERSION, timeReversal: false };
    const withInversion = [...ops];
    for (const op of ops) {
        const product = compose(inversion, op);
        if (!withInversion.some((x) => operationsEqual(x, product)))
            withInversion.push(product);
    }
    const sameSet = (other) => other.length === withInversion.length && other.every((x) => withInversion.some((y) => operationsEqual(x, y)));
    const laue = POINT_GROUP_KEYS.find((key) => sameSet(settingOperations(data(key), 1)));
    if (!laue)
        throw new Error(`No centrosymmetric class matches ${crystalClass.key} with the inversion`);
    laueCache.set(crystalClass.key, laue);
    return laue;
}
const groupCache = new Map();
/**
 * The point group with this key: a crystal class or a magnetic point group. Throws a RangeError
 * for an unknown key.
 */
export function pointGroup(key) {
    const d = data(key);
    let g = groupCache.get(d.key);
    if (!g) {
        const ops = settingOperations(d, 1);
        g = Object.freeze({
            key: d.key,
            type: d.type,
            crystalClass: d.crystalClass.key,
            crystalSystem: d.crystalSystem,
            order: ops.length,
            centrosymmetric: hasInversion(ops),
            polar: hasFixedDirection(ops),
            chiral: ops.every((op) => det(op.matrix) > 0),
            laueClass: laueClassOf(d.crystalClass),
        });
        groupCache.set(d.key, g);
    }
    return g;
}
/** All 32 crystal classes, in the order of `POINT_GROUP_KEYS` (by crystal system, as in ITA). */
export function pointGroups() {
    return POINT_GROUP_KEYS.map((key) => pointGroup(key));
}
/**
 * All 122 magnetic point groups, in the order of `MAGNETIC_POINT_GROUP_KEYS`: the 32 crystal
 * classes (type I), the 32 grey groups (type II) in the same order, and the 58 black-and-white
 * groups (type III) in the order of ITC Vol. D Table 1.5.2.3.
 */
export function magneticPointGroups() {
    return MAGNETIC_POINT_GROUP_KEYS.map((key) => pointGroup(key));
}
/**
 * The key of the crystal class of a point group: the group itself for a class, otherwise the class
 * it becomes when time reversal is dropped from every operation. Internal (not exported from
 * index.ts).
 */
export function crystalClassOf(key) {
    return data(key).crystalClass.key;
}
/** The settings of a point group, with symbols and the default of the given convention (default `'itc'`). */
export function settings(key, conventionName = 'itc') {
    const d = data(key);
    const c = convention({ convention: conventionName });
    const def = defaultSetting(d, c);
    return d.settings.map((s, i) => {
        const symbols = settingSymbols(d, i + 1, c);
        return Object.freeze({
            index: i + 1,
            symbol: symbols.short,
            fullSymbol: symbols.full,
            ...(s.uniqueAxis ? { uniqueAxis: s.uniqueAxis } : {}),
            isDefault: i + 1 === def,
        });
    });
}
/**
 * All operations of the point group in the requested setting (default: the convention's default
 * setting). ITC convention: in ITA's order, identity first, then as ITA numbers the general
 * position of the crystal class; an operation of a magnetic group has the number it has in the
 * class, and a grey group lists the class first, then the same sequence with time reversal. Birss
 * convention: in birss-app's order (docs/conventions.md, "Order of the operations"). The matrices
 * are Cartesian (docs/conventions.md, "Cartesian frame").
 */
export function operations(key, options) {
    const d = data(key);
    const index = settingIndex(d, options);
    return convention(options) === 'birss' ? birssOperations(d, index) : settingOperations(d, index);
}
/**
 * Generators of the point group in the requested setting (docs/conventions.md, "Generators"). ITC
 * convention: ITA's selected generators in printed order, without the identity and ITA's lattice
 * translations, so the list is empty for `1`; for `mm2` settings 2 and 3, which ITA does not list,
 * those of setting 1 carried into their frame; for a magnetic group, those of its class with the
 * time reversal they have in the group, for a grey group followed by 1'. Birss convention:
 * birss-app's generators (for `1` the identity, as in birss-app).
 */
export function generators(key, options) {
    const d = data(key);
    const index = settingIndex(d, options);
    return convention(options) === 'birss' ? settingGenerators(d, index) : settingItaGenerators(d, index);
}
/** A symbol of the point group in the requested convention and setting. */
export function symbol(key, options) {
    const d = data(key);
    const form = options?.form ?? 'short';
    const s = settingSymbols(d, settingIndex(d, options), convention(options));
    if (form === 'schoenflies')
        return d.schoenflies;
    if (form === 'short')
        return s.short;
    if (form === 'full')
        return s.full;
    throw new RangeError(`Unknown symbol form: ${JSON.stringify(form)}`);
}
const compact = (s) => s.replace(/\s+/g, '');
function find(hm, conventionName, classesOnly) {
    const c = convention({ convention: conventionName });
    if (typeof hm !== 'string')
        return undefined;
    const target = compact(hm);
    const candidates = [...BY_KEY.values()].filter((d) => !classesOnly || d.type === 'I');
    /** The settings of `d` whose symbol of this form is the target. */
    const named = (d, form) => d.settings.map((_, j) => j + 1).filter((i) => compact(settingSymbols(d, i, c)[form]) === target);
    /** One setting named: that one. Several (a monoclinic short symbol) or none (a key): the default. */
    const pick = (d, settingsNamed) => ({
        key: d.key,
        setting: settingsNamed.length === 1 ? settingsNamed[0] : defaultSetting(d, c),
    });
    const byKey = candidates.find((d) => d.key === target);
    if (byKey)
        return pick(byKey, named(byKey, 'short'));
    for (const form of ['short', 'full']) {
        for (const d of candidates) {
            const settingsNamed = named(d, form);
            if (settingsNamed.length > 0)
                return pick(d, settingsNamed);
        }
    }
    return undefined;
}
/**
 * Finds a crystal class by a Hermann–Mauguin symbol in the given convention (default `'itc'`): the
 * short symbol of a setting, a full symbol, or the key (spaces are ignored). A symbol that names
 * one setting gives that setting; the key, and a short symbol that several settings share (the
 * monoclinic ones: `2` for unique axis b and c), give the default setting of the convention.
 * Returns undefined if nothing matches, also for a value that is not a string and for the
 * symbol of a magnetic group with time reversal (`findMagneticPointGroup`). Symbols are written as
 * in this library: `-` for the overbar, also in the Birss convention (`m-3m`, where Birss prints
 * `m3m`; docs/conventions.md, "Where ITC and Birss differ").
 */
export function findPointGroup(hm, conventionName = 'itc') {
    return find(hm, conventionName, true);
}
/**
 * Finds one of the 122 magnetic point groups (the 32 crystal classes included) by a symbol in the
 * given convention (default `'itc'`): the short symbol of a setting, a full symbol, or the key
 * (spaces are ignored). A prime `'` marks time reversal: `4'/mmm'`, `2221'`. A symbol that names
 * one setting gives that setting; the key, and a short symbol that several settings share (the
 * monoclinic ones: `2'` for unique axis b and c), give the default setting of the convention. In
 * the Birss convention two keys are the Birss symbol of a setting that is not the default
 * (`mm'm'` and `6'/mmm'`, setting 2; Birss prints `m'm'm` and `6'/mm'm` for these groups) and give
 * that setting, like any symbol. Returns undefined if nothing matches, also for a value that is
 * not a string. Symbols are written as in this library: `-` for the overbar, also in the Birss
 * convention (`m'-3'm`, where Birss prints `m'3m`; docs/conventions.md, "Where ITC and Birss
 * differ").
 */
export function findMagneticPointGroup(hm, conventionName = 'itc') {
    return find(hm, conventionName, false);
}
