/**
 * Named tensor properties: physical properties of a crystal that a point group allows if and only
 * if it allows a non-zero tensor of a given kind. The table is data: a name, the kind of tensor
 * (`TensorSpec`) and the print source of that definition. `allowsProperty` and `tensorForm` look a
 * name up here (docs/conventions.md, "Named tensor properties").
 */
import type { TensorSpec } from './tensorForm.js';
/** A named property: the tensor that describes it, what it is and where it is defined. */
export interface TensorProperty {
    /** The kind of tensor whose non-zero form means that the property is allowed. */
    readonly spec: TensorSpec;
    /** The physical quantity the tensor relates. */
    readonly description: string;
    /** Print source of the definition, with printed page. */
    readonly source: string;
}
/**
 * The named tensor properties. For each name, the tensor that describes the property, what it is,
 * and its print source. `'gyrotropic'` is optical activity.
 *
 * @remarks Names are adjectives, one lower-case word each (maintainer, 2026-11-19, #41).
 */
export declare const TENSOR_PROPERTIES: Readonly<{
    /** Spontaneous polarization: a time-even polar vector. */
    pyroelectric: TensorProperty;
    /** Ferroaxial order: a time-even axial vector. */
    ferroaxial: TensorProperty;
    /** The piezoelectric effect (and second-harmonic generation, which has the same tensor): polar, rank 3, symmetric in j, k. */
    piezoelectric: TensorProperty;
    /** Optical activity: the symmetric axial tensor of rank 2. */
    gyrotropic: TensorProperty;
    /** Spontaneous magnetization: a time-odd axial vector (magnetic API only). */
    ferromagnetic: TensorProperty;
    /** The linear magnetoelectric effect: a time-odd axial tensor of rank 2 (magnetic API only). */
    magnetoelectric: TensorProperty;
    /** The piezomagnetic effect: a time-odd axial tensor of rank 3, symmetric in j, k (magnetic API only). */
    piezomagnetic: TensorProperty;
}>;
/** Name of a tensor property in `TENSOR_PROPERTIES`. */
export type TensorPropertyName = keyof typeof TENSOR_PROPERTIES;
/** The names of the tensor properties, in the order of `TENSOR_PROPERTIES`. */
export declare const TENSOR_PROPERTY_NAMES: readonly TensorPropertyName[];
/** The specification behind a property name; a specification is returned as it is. */
export declare function specOf(specOrName: TensorSpec | TensorPropertyName): TensorSpec;
