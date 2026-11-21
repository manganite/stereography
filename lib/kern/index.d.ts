/**
 * Public API of symcrys: the crystallographic API, for the 32 crystal classes and without time
 * reversal. The magnetic point groups, time-odd tensors and operations with time reversal are in
 * the magnetic API, `symcrys/magnetic` (`magnetic.ts`), under the same function names
 * (docs/conventions.md, "Two entry points"). Everything exported here and there is covered by
 * SemVer (see CLAUDE.md); everything else is internal.
 */
export { VERSION } from './version.js';
export type { Mat3, Vec3 } from './linalg.js';
export { crystalFamily, latticeBasis, type CrystalFamily, type CrystalSystem, type FixedAngleFamily, } from './lattice.js';
export type { Convention, PointGroupKey, Setting, SettingOptions, SymbolOptions } from './pointGroups/pointGroups.js';
export { LATTICE_SYMMETRY_DIRECTIONS, type Uvw } from './symmetryDirections.js';
export type { Axis, DirectionElements, OperationKind, SymmetryDirection } from './pointGroups/elements.js';
export type { SiteSymmetry, SiteSymmetryOptions } from './siteSymmetry.js';
export type { Hkl, WyckoffOptions, WyckoffPosition } from './pointGroups/wyckoff.js';
export type { CrystalForm, CrystalFormType } from './pointGroups/crystalForms.js';
export type { DirectionOrbitEntry, FaceOrbitEntry, OrbitOptions, OrbitPole } from './pointGroups/orbits.js';
export type { CartesianAxis, PointGroupOfOptions } from './pointGroups/identify.js';
export type { IntrinsicSymmetry, TensorForm, TensorParity, TensorRank } from './tensors/tensorForm.js';
export { CRYSTAL_FORM_TYPES, POINT_GROUP_KEYS, TENSOR_PROPERTIES, allowedProperties, allowedPropertiesOf, allowsProperty, allowsPropertyOf, crystalForms, describeOperations, describeOperationsOf, findPointGroup, generators, holohedry, isCentrosymmetricOf, isChiralOf, isPointGroupKey, latticeOperations, operations, orbit, orbitOf, pointGroup, pointGroupOf, pointGroups, rotateTensor, settings, siteSymmetry, symbol, symmetryDirections, tensorForm, tensorFormOf, wyckoffPositionOf, wyckoffPositions, type CartesianOperationDescription, type IdentifiedPointGroup, type Operation, type OperationDescription, type PointGroup, type PointGroupInSetting, type TensorProperty, type TensorPropertyName, type TensorSpec, } from './crystalClasses.js';
