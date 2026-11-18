/**
 * Public API for the crystallographic point groups: lookup, settings, operations, generators and
 * symbols, in the ITC convention (default) or the Birss convention.
 */
import { MAX_GROUP_ORDER, closeGroup, compose, operationsEqual, transformOperation, } from '../operations.js';
import { inItaOrder, itaGeneratorOperations } from './itaOrder.js';
import { POINT_GROUP_DATA, POINT_GROUP_KEYS } from './data.js';
export { POINT_GROUP_KEYS } from './data.js';
const BY_KEY = new Map(POINT_GROUP_DATA.map((d) => [d.key, d]));
/** True if `key` is the key of one of the 32 crystal classes. */
export function isPointGroupKey(key) {
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
const itaGeneratorCache = new Map();
/** ITA's generators of a setting (see `generators`); throws if setting 1 has none. */
function settingItaGenerators(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = itaGeneratorCache.get(cacheKey);
    if (!result) {
        let gens = itaGeneratorOperations(d.key, index, d.crystalSystem);
        if (!gens) {
            if (index === 1)
                throw new Error(`Point group ${d.key}: no ITA generators for setting 1`);
            gens = settingItaGenerators(d, 1).map((op) => transformOperation(op, d.settings[index - 1].frame));
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
 * The operations of a setting in ITA's order (docs/conventions.md, "Order of the operations"): for a
 * setting ITA lists, coset by coset from ITA's generators; for a setting ITA does not list (today
 * `mm2` settings 2 and 3), the order of setting 1, carried into the frame of the setting. Setting 1
 * is always one ITA lists; throws if its generators are missing or do not give the closure.
 */
function settingOperations(d, index) {
    const cacheKey = `${d.key}#${index}`;
    let result = operationCache.get(cacheKey);
    if (!result) {
        const closed = closeGroup(settingGenerators(d, index));
        let ordered = inItaOrder(d.key, index, d.crystalSystem, closed);
        if (!ordered) {
            if (index === 1)
                throw new Error(`Point group ${d.key}: no ITA generators for setting 1`);
            ordered = settingOperations(d, 1).map((op) => transformOperation(op, d.settings[index - 1].frame));
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
const groupCache = new Map();
/** The point group with this key. Throws a RangeError for an unknown key. */
export function pointGroup(key) {
    const d = data(key);
    let g = groupCache.get(d.key);
    if (!g) {
        g = Object.freeze({ key: d.key, type: 'I', crystalSystem: d.crystalSystem, order: settingOperations(d, 1).length });
        groupCache.set(d.key, g);
    }
    return g;
}
/** All 32 crystal classes, in the order of `POINT_GROUP_KEYS` (by crystal system, as in ITA). */
export function pointGroups() {
    return POINT_GROUP_KEYS.map(pointGroup);
}
/** The settings of a point group, with symbols and the default of the given convention (default `'itc'`). */
export function settings(key, conventionName = 'itc') {
    const d = data(key);
    const c = convention({ convention: conventionName });
    const def = defaultSetting(d, c);
    return d.settings.map((s, i) => Object.freeze({
        index: i + 1,
        symbol: s[c].short,
        fullSymbol: s[c].full,
        ...(s.uniqueAxis ? { uniqueAxis: s.uniqueAxis } : {}),
        isDefault: i + 1 === def,
    }));
}
/**
 * All operations of the point group in the requested setting (default: the convention's default
 * setting). ITC convention: in ITA's order, identity first, then as ITA numbers the general
 * position; Birss convention: in birss-app's order (docs/conventions.md, "Order of the
 * operations"). The matrices are Cartesian (docs/conventions.md, "Cartesian frame").
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
 * those of setting 1 carried into their frame. Birss convention: birss-app's generators (for `1`
 * the identity, as in birss-app).
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
    const s = d.settings[settingIndex(d, options) - 1][convention(options)];
    if (form === 'schoenflies')
        return d.schoenflies;
    if (form === 'short')
        return s.short;
    if (form === 'full')
        return s.full;
    throw new RangeError(`Unknown symbol form: ${JSON.stringify(form)}`);
}
const compact = (s) => s.replace(/\s+/g, '');
/**
 * Finds a point group by a Hermann–Mauguin symbol in the given convention (default `'itc'`): the
 * key (giving the default setting), the short symbol of a setting, or a full symbol (spaces are
 * ignored). Returns undefined if nothing matches, also for a value that is not a string. Symbols
 * are written as in this library: `-` for the overbar, also in the Birss convention (`m-3m`, where
 * Birss prints `m3m`; docs/conventions.md, "Where ITC and Birss differ").
 */
export function findPointGroup(hm, conventionName = 'itc') {
    const c = convention({ convention: conventionName });
    if (typeof hm !== 'string')
        return undefined;
    const target = compact(hm);
    const byKey = BY_KEY.get(target);
    if (byKey)
        return { key: byKey.key, setting: defaultSetting(byKey, c) };
    for (const form of ['short', 'full']) {
        for (const d of POINT_GROUP_DATA) {
            const i = d.settings.findIndex((s) => compact(s[c][form]) === target);
            if (i >= 0)
                return { key: d.key, setting: i + 1 };
        }
    }
    return undefined;
}
