/**
 * The magnetic API of symcrys (`symcrys/magnetic`): the 122 magnetic point groups, with time
 * reversal. Everything exported here is covered by SemVer (see CLAUDE.md), like the exports of
 * `index.ts`.
 *
 * The functions have the names they have in the crystallographic API (`index.ts`); the import
 * decides which reading a key has. Here a key of type `'I'` (`'32'`) is a white (colourless)
 * group: the symmetry of a magnetically ordered crystal in which time reversal does not occur at
 * all. A crystal without magnetic order has the grey group of its class (quartz: `"321'"`), which
 * allows no time-odd property (docs/conventions.md, "Two entry points").
 */
export { VERSION } from './version.js';
export { crystalFamily, latticeBasis, } from './lattice.js';
export { MAGNETIC_POINT_GROUP_KEYS as POINT_GROUP_KEYS, findMagneticPointGroup as findPointGroup, generators, isMagneticPointGroupKey as isPointGroupKey, magneticPointGroups as pointGroups, operations, pointGroup, settings, symbol, } from './pointGroups/pointGroups.js';
export { holohedry, isCentrosymmetricOf, isChiralOf } from './pointGroups/properties.js';
export { LATTICE_SYMMETRY_DIRECTIONS } from './symmetryDirections.js';
export { describeOperations, symmetryDirections, } from './pointGroups/elements.js';
export { siteSymmetry } from './siteSymmetry.js';
export { rotateTensor, tensorForm, tensorFormOf, } from './tensors/tensorForm.js';
export { TENSOR_PROPERTIES } from './tensors/propertyTable.js';
export { allowedProperties, allowedPropertiesOf, allowsProperty, allowsPropertyOf, } from './tensors/tensorProperties.js';
