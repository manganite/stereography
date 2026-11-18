/**
 * Public API of symcrys. Everything exported here is covered by SemVer (see CLAUDE.md);
 * everything else is internal.
 */
export { VERSION } from './version.js';
export type { Mat3, Vec3 } from './linalg.js';
export type { Operation } from './operations.js';
export { crystalFamily, latticeBasis, type CrystalFamily, type CrystalSystem, type FixedAngleFamily, } from './lattice.js';
export { POINT_GROUP_KEYS, findPointGroup, generators, isPointGroupKey, operations, pointGroup, pointGroups, settings, symbol, type Convention, type PointGroup, type PointGroupInSetting, type PointGroupKey, type PointGroupType, type Setting, type SettingOptions, type SymbolOptions, } from './pointGroups/pointGroups.js';
export { isCentrosymmetric, isChiral, isPolar, laueClass } from './pointGroups/properties.js';
export { LATTICE_SYMMETRY_DIRECTIONS, type Uvw } from './symmetryDirections.js';
export { describeOperations, symmetryDirections, type Axis, type DirectionElements, type OperationDescription, type OperationKind, type SymmetryDirection, } from './pointGroups/elements.js';
