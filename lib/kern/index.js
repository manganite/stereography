/**
 * Public API of symcrys: the crystallographic API, for the 32 crystal classes and without time
 * reversal. The magnetic point groups, time-odd tensors and operations with time reversal are in
 * the magnetic API, `symcrys/magnetic` (`magnetic.ts`), under the same function names
 * (docs/conventions.md, "Two entry points"). Everything exported here and there is covered by
 * SemVer (see CLAUDE.md); everything else is internal.
 */
export { VERSION } from './version.js';
export { crystalFamily, latticeBasis, } from './lattice.js';
export { LATTICE_SYMMETRY_DIRECTIONS } from './symmetryDirections.js';
export { POINT_GROUP_KEYS, TENSOR_PROPERTIES, allowedProperties, allowedPropertiesOf, allowsProperty, allowsPropertyOf, describeOperations, findPointGroup, generators, holohedry, isCentrosymmetricOf, isChiralOf, isPointGroupKey, operations, pointGroup, pointGroups, rotateTensor, settings, siteSymmetry, symbol, symmetryDirections, tensorForm, tensorFormOf, wyckoffPositionOf, wyckoffPositions, } from './crystalClasses.js';
