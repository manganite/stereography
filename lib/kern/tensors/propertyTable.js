/**
 * Named tensor properties: physical properties of a crystal that a point group allows if and only
 * if it allows a non-zero tensor of a given kind. The table is data: a name, the kind of tensor
 * (`TensorSpec`) and the print source of that definition. `allowsProperty` and `tensorForm` look a
 * name up here (docs/conventions.md, "Named tensor properties").
 */
const property = (spec, description, source) => Object.freeze({ spec: Object.freeze(spec), description, source });
/**
 * The named tensor properties. Names are adjectives, one lower-case word each (maintainer,
 * 2026-11-19, #41). `'gyrotropic'` is optical activity.
 */
export const TENSOR_PROPERTIES = Object.freeze({
    pyroelectric: property({ rank: 1, parity: 'polar', timeParity: 'i', intrinsic: 'none' }, 'Spontaneous electric polarization, which changes with temperature: a polar vector p_i.', 'ITC Vol. D (2013), § 1.1.4.4.2, p. 12; classes: ITA (2016) Table 3.2.2.1, p. 738'),
    ferroaxial: property({ rank: 1, parity: 'axial', timeParity: 'i', intrinsic: 'none' }, 'Ferroaxial (ferro-rotational) order, e.g. a net rotation of structural units about an axis: an axial vector A_i.', 'Hlinka, Privratska, Ondrejkovic & Janovec, Phys. Rev. Lett. 116, 177602 (2016); classes: Birss (1966), Tables 4a and 4c, pp. 56–58'),
    piezoelectric: property({ rank: 3, parity: 'polar', timeParity: 'i', intrinsic: 'jk' }, 'Electric polarization linear in stress, P_i = d_ijk T_jk: a polar tensor of rank 3, symmetric in j, k.', 'ITC Vol. D (2013), § 1.1.4.4.3, p. 12; classes: ITA (2016) Table 3.2.2.1, p. 738'),
    gyrotropic: property({ rank: 2, parity: 'axial', timeParity: 'i', intrinsic: 'ij' }, 'Optical activity (optical rotation), G = g_ij α_i α_j: the symmetric part of the axial gyration tensor of rank 2.', 'ITC Vol. D (2013), § 1.1.4.10.7.2, p. 30; classes: ITA (2016) Table 3.2.2.1, p. 738'),
    ferromagnetic: property({ rank: 1, parity: 'axial', timeParity: 'c', intrinsic: 'none' }, 'Spontaneous magnetization M_s (ferromagnets, ferrimagnets, weak ferromagnets): an axial vector that changes sign under time reversal.', 'ITC Vol. D (2013), § 1.5.2.1 with Table 1.5.2.4, p. 113'),
    magnetoelectric: property({ rank: 2, parity: 'axial', timeParity: 'c', intrinsic: 'none' }, 'Linear magnetoelectric effect, P_i = α_ij H_j: an axial tensor of rank 2 that changes sign under time reversal.', 'ITC Vol. D (2013), § 1.5.8.1 with eqs. (1.5.8.2), (1.5.8.3) and Table 1.5.8.1, pp. 139–140'),
    piezomagnetic: property({ rank: 3, parity: 'axial', timeParity: 'c', intrinsic: 'jk' }, 'Magnetization linear in stress, M_i = Λ_ijk T_jk: an axial tensor of rank 3, symmetric in j, k, that changes sign under time reversal.', 'ITC Vol. D (2013), § 1.5.7.1 with eq. (1.5.7.2) and Table 1.5.7.1, pp. 134–135'),
});
/** The names of the tensor properties, in the order of `TENSOR_PROPERTIES`. */
export const TENSOR_PROPERTY_NAMES = Object.freeze(Object.keys(TENSOR_PROPERTIES));
/** The specification behind a property name; a specification is returned as it is. */
export function specOf(specOrName) {
    if (typeof specOrName !== 'string')
        return specOrName;
    if (!Object.hasOwn(TENSOR_PROPERTIES, specOrName)) {
        throw new RangeError(`Unknown tensor property: ${JSON.stringify(specOrName)} (known: ${TENSOR_PROPERTY_NAMES.join(', ')})`);
    }
    return TENSOR_PROPERTIES[specOrName].spec;
}
