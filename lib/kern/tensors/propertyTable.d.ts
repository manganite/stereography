/**
 * Named tensor properties: physical properties of a crystal that a point group allows if and only
 * if it allows a non-zero tensor of a given kind. The table is data: a name, the kind of tensor
 * (`TensorSpec`) and the print source of that definition. `allowsProperty` and `tensorForm` look a
 * name up here (docs/conventions.md, "Named tensor properties").
 */
import type { TensorSpec } from './tensorForm.js';
export interface TensorProperty {
    /** The kind of tensor whose non-zero form means that the property is allowed. */
    readonly spec: TensorSpec;
    /** The physical quantity the tensor relates. */
    readonly description: string;
    /** Print source of the definition, with printed page. */
    readonly source: string;
}
/**
 * The named tensor properties. Names are adjectives, one lower-case word each (maintainer,
 * 2026-11-19, #41). `'gyrotropic'` is optical activity.
 */
export declare const TENSOR_PROPERTIES: Readonly<{
    pyroelectric: TensorProperty;
    ferroaxial: TensorProperty;
    piezoelectric: TensorProperty;
    gyrotropic: TensorProperty;
    ferromagnetic: TensorProperty;
    magnetoelectric: TensorProperty;
    piezomagnetic: TensorProperty;
}>;
/** Name of a tensor property in `TENSOR_PROPERTIES`. */
export type TensorPropertyName = keyof typeof TENSOR_PROPERTIES;
/** The names of the tensor properties, in the order of `TENSOR_PROPERTIES`. */
export declare const TENSOR_PROPERTY_NAMES: readonly TensorPropertyName[];
/** The specification behind a property name; a specification is returned as it is. */
export declare function specOf(specOrName: TensorSpec | TensorPropertyName): TensorSpec;
