// Punktgruppen, Lagesymmetrie, Wyckoff-Lagen, Kristallformen, Bahnen und die Bestimmung der Gruppe beliebiger
// Operationen aus dem Rechenkern symcrys (lib/kern/, crystallography-common#99, symcrys#24). Hier steht nur, was die App
// daraus macht: die Zuordnung ihrer Kennungen (Link `g=`) zu Gruppe und Aufstellung in symcrys, die Umrechnung in
// den kartesischen Rahmen der App und die Namen der Symmetrieelemente für die Zeichnung.
//
// Rahmen: symcrys legt bei hexagonalen Achsen a ∥ x, die App b ∥ y (a zeigt im Stereogramm nach links unten). Die
// App behält ihren Rahmen, damit Link-Adressen (Azimut `az`, von b gezählt) und Bilder gleich bleiben; die Drehung
// zwischen beiden folgt aus den beiden Gitterbasen (Thomas, 18.11.2026). Sonst sind die Rahmen gleich.

import {
  CRYSTAL_FORM_TYPES, allowsProperty, allowsPropertyOf, crystalFamily, crystalForms, describeOperationsOf, findPointGroup,
  holohedry, latticeBasis, latticeOperations, operations, orbit, orbitOf, pointGroup, pointGroupOf, settings, siteSymmetry,
  symbol, symmetryDirections, wyckoffPositionOf, wyckoffPositions,
} from '../lib/kern/index.js';

/** @import { Vec3, Mat3, Richtung, Normale } from '../lib/common/js/typen.js' */
/** @import { PointGroupKey } from '../lib/kern/index.js' */

const S3 = Math.sqrt(3);
/** Gitterbasis der App bei hexagonalen Achsen: a (kartesisch). @type {Vec3} */
export const HEX_A = [S3 / 2, -0.5, 0];
/** Gitterbasis der App bei hexagonalen Achsen: b ∥ y. @type {Vec3} */
export const HEX_B = [0, 1, 0];

/**
 * Gruppe und Aufstellung in symcrys zu einer Kennung der App. Monoklin: `2b`, `mc` usw. (eindeutige Achse b bzw. c),
 * sonst das Symbol der Aufstellung (`321`, `-4m2`, …). Angenommen wird alles, was `findPointGroup` von symcrys kennt
 * (auch volle Symbole); eine Kennung, die symcrys nicht kennt, ergibt einen Fehler.
 * @param {string} id
 * @returns {{ key: PointGroupKey, setting: number }}
 */
export function kernAufstellung(id) {
  const mono = /^(2|m|2\/m)([bc])$/.exec(id);
  if (mono) {
    const key = /** @type {PointGroupKey} */ (mono[1]);
    const s = settings(key).find((x) => x.uniqueAxis === mono[2]);
    if (s) return { key, setting: s.index };
  } else {
    const found = findPointGroup(id);
    if (found) return found;
  }
  throw new Error(`Punktgruppe ${id} fehlt in symcrys`);
}

/** @param {Mat3} a @param {Mat3} b @returns {Mat3} */
const mal = (a, b) => /** @type {Mat3} */ (a.map((r) => [0, 1, 2].map((j) => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j])));
/** @param {Mat3} a @returns {Mat3} */
const transponiert = (a) => /** @type {Mat3} */ ([0, 1, 2].map((i) => [0, 1, 2].map((j) => a[j][i])));
/** @param {readonly (readonly number[])[]} m @returns {Mat3} */
const kopie = (m) => /** @type {Mat3} */ (m.map((r) => [...r]));

/**
 * Drehung vom kartesischen Rahmen von symcrys in den der App bei hexagonalen Achsen: R = B_App · B_symcrys⁻¹ mit den
 * Gitterbasen als Spalten. Beide Basen haben c ∥ z, gleich lange a, b mit 120° dazwischen und dieselbe Händigkeit;
 * R ist deshalb eine Drehung um z, und ihre Inverse ist die Transponierte (Test: tests/kern.test.mjs).
 */
const R_HEX = (() => {
  const bk = kopie(latticeBasis('hexagonal'));
  /** @type {Mat3} */
  const ba = [[HEX_A[0], HEX_B[0], 0], [HEX_A[1], HEX_B[1], 0], [0, 0, 1]];
  // Inverse von bk (Block 2×2 und z)
  const d = bk[0][0] * bk[1][1] - bk[0][1] * bk[1][0];
  /** @type {Mat3} */
  const bkInv = [[bk[1][1] / d, -bk[0][1] / d, 0], [-bk[1][0] / d, bk[0][0] / d, 0], [0, 0, 1]];
  return mal(ba, bkInv);
})();

/** Rahmen der App für eine Gruppe: Drehung aus dem Rahmen von symcrys oder keine. @param {PointGroupKey} key */
const rahmen = (key) => (crystalFamily(pointGroup(key).crystalSystem) === 'hexagonal' ? R_HEX : null);

/**
 * Kennung der Gittersymmetrie zu einer Punktgruppe der App: die Holoedrie ihrer Kristallfamilie aus symcrys, im
 * trigonalen System also 6/mmm (hexagonale Achsen, wie die App sie für das Gitter nimmt), nicht 3̄m. Monoklin steht
 * die Kennung der App mit eindeutiger Achse b (`2/mb`), wie das Gitter der App.
 * @param {string} id
 */
export function kernGittersymmetrie(id) {
  const h = holohedry(crystalFamily(pointGroup(kernAufstellung(id).key).crystalSystem));
  return h === '2/m' ? '2/mb' : h;
}

/** Drehung aus dem Rahmen von symcrys in den der App bei hexagonalen Achsen (für Tests). @returns {Mat3} */
export const drehungHexagonal = () => kopie(R_HEX);

/** @param {Mat3 | null} r @param {Mat3} m @returns {Mat3} */
const matrixInApp = (r, m) => (r ? mal(mal(r, m), transponiert(r)) : m);
/** @param {Mat3 | null} r @param {readonly number[]} v @returns {Vec3} */
const vektorInApp = (r, v) => /** @type {Vec3} */ (r ? r.map((z) => z[0] * v[0] + z[1] * v[1] + z[2] * v[2]) : [...v]);

/**
 * Die Operationen einer Punktgruppe der App im kartesischen Rahmen der App, in der Reihenfolge von symcrys (wie ITA).
 * @param {string} id
 * @returns {Mat3[]}
 */
export function kernOperationen(id) {
  const { key, setting } = kernAufstellung(id);
  const r = rahmen(key);
  return operations(key, { setting }).map((o) => matrixInApp(r, kopie(o.matrix)));
}

/**
 * Name eines Symmetrieelements entlang einer Richtung für die Zeichnung: 6 und 4 vor 4̄, 6̄, 3̄, diese vor 3 und 2
 * (die höchste Zähligkeit, die das Symbol der Achse trägt). Null, wenn dort keine Achse liegt.
 * @param {{ rotation: number, rotoinversion: number }} e
 */
export function achsensymbol(e) {
  if (e.rotation === 6 || e.rotation === 4) return String(e.rotation);
  if (e.rotoinversion) return `-${e.rotoinversion}`;
  return e.rotation > 1 ? String(e.rotation) : null;
}

/**
 * Eigenschaften und Symmetrieelemente einer Punktgruppe der App, Richtungen im Rahmen der App. `klassen`: je Position
 * des vollen Symbols die Richtungen (kartesisch `dirs`, als [uvw] `gitter`, Vorzeichen nach ITA Tab. 2.1.3.1) und ihre
 * Elemente; `axes`, `mirrors`: alle Achsen und Spiegelnormalen, `mirrorCls`: Position je Spiegelnormale.
 * @param {string} id
 */
export function kernElemente(id) {
  const { key, setting } = kernAufstellung(id);
  const r = rahmen(key);
  const gruppe = pointGroup(key);
  const centro = gruppe.centrosymmetric;
  /** @type {{ dir: Vec3, symbol: string, centre: boolean, mirrorPerp: boolean, cls: number }[]} */
  const axes = [];
  /** @type {Vec3[]} */
  const mirrors = [];
  /** @type {number[]} */
  const mirrorCls = [];
  const klassen = symmetryDirections(key, { setting }).map((p, k) => {
    /** @type {typeof axes} */
    const kAxes = [];
    /** @type {Vec3[]} */
    const kMirrors = [];
    for (const d of p.directions) {
      const dir = vektorInApp(r, d.cartesian);
      const s = achsensymbol(d);
      if (s) kAxes.push({ dir, symbol: s, centre: centro && !s.startsWith('-'), mirrorPerp: d.mirror, cls: k });
      if (d.mirror) kMirrors.push(dir);
    }
    axes.push(...kAxes);
    mirrors.push(...kMirrors);
    mirrorCls.push(...kMirrors.map(() => k));
    return {
      pos: k, dirs: p.directions.map((d) => vektorInApp(r, d.cartesian)),
      gitter: p.directions.map((d) => /** @type {Richtung} */ (/** @type {unknown} */ ([...d.lattice]))),
      hm: p.symbol ?? null, axes: kAxes, mirrors: kMirrors,
    };
  });
  return {
    centro, chiral: gruppe.chiral, polar: gruppe.polar, piezo: allowsProperty(key, 'piezoelectric'), laue: gruppe.laueClass,
    full: symbol(key, { setting, form: 'full' }), sf: symbol(key, { form: 'schoenflies' }),
    axes, mirrors, mirrorCls, klassen,
  };
}

/** @param {Mat3 | null} r @param {readonly number[]} v @returns {Vec3} */
const vektorInKern = (r, v) => /** @type {Vec3} */ (r ? [0, 1, 2].map((j) => r[0][j] * v[0] + r[1][j] * v[1] + r[2][j] * v[2]) : [...v]);

/**
 * Operationen der App als Operationen von symcrys (`{ matrix }`: die kristallographische Schnittstelle kennt keine
 * Zeitumkehr), je Feld einmal, damit symcrys seine Produkte je Feld zwischenspeichert.
 * @type {WeakMap<readonly Mat3[], { matrix: Mat3 }[]>}
 */
const umhuellte = new WeakMap();

/**
 * Piezoelektrisch unter beliebigen Operationen (auch denen eines verzerrten Kristalls) aus symcrys: ob die benannte
 * Eigenschaft `'piezoelectric'` erlaubt ist (polarer Tensor dritter Stufe, symmetrisch in j, k). Rahmenunabhängig.
 * @param {readonly Mat3[]} ops
 */
export function kernPiezoelektrisch(ops) {
  return allowsPropertyOf(ops.map((m) => ({ matrix: m })), 'piezoelectric');
}

/**
 * Lagesymmetrie einer Richtung unter beliebigen Operationen (auch denen eines verzerrten Kristalls) aus symcrys: Indizes
 * der Operationen, die sie festhalten, und die Richtung auf deren Fixraum gesetzt. Rahmenunabhängig, weil Operationen
 * und Richtung im selben Rahmen stehen.
 * @param {readonly Mat3[]} ops @param {Vec3} p @param {number} toleranz
 * @returns {{ stab: number[], p: Vec3 }}
 */
export function kernLagesymmetrie(ops, p, toleranz) {
  let umhuellt = umhuellte.get(ops);
  if (!umhuellt) {
    umhuellt = ops.map((m) => ({ matrix: m }));
    umhuellte.set(ops, umhuellt);
  }
  const s = siteSymmetry(umhuellt, p, { tolerance: toleranz });
  return { stab: [...s.operations], p: /** @type {Vec3} */ ([...s.direction]) };
}

/**
 * Wyckoff-Lagen einer Punktgruppe der App aus symcrys (ITA, Konvention ITC), Vertreter im Rahmen der App. stab: Indizes
 * der Lagesymmetrie des Vertreters in `kernOperationen(id)` (dieselbe Reihenfolge wie in symcrys).
 * @param {string} id
 * @returns {{ wy: string, fs: string, mult: number, rep: Vec3, stab: number[] }[]}
 */
export function kernWyckoffLagen(id) {
  const { key, setting } = kernAufstellung(id);
  const r = rahmen(key);
  return wyckoffPositions(key, { setting }).map((w) => ({
    wy: w.letter, fs: w.siteSymmetry, mult: w.multiplicity, rep: vektorInApp(r, w.representative.cartesian),
    stab: [...w.siteSymmetryOperations],
  }));
}

/**
 * Wyckoff-Lage einer Richtung (Rahmen der App) in einer Punktgruppe der App, aus symcrys.
 * @param {string} id @param {Vec3} p @param {number} toleranz
 * @returns {{ wy: string, fs: string }}
 */
export function kernWyckoffLageVon(id, p, toleranz) {
  const { key, setting } = kernAufstellung(id);
  const w = wyckoffPositionOf(key, vektorInKern(rahmen(key), p), { setting, tolerance: toleranz });
  return { wy: w.letter, fs: w.siteSymmetry };
}

/**
 * Grundformen einer Punktgruppe der App aus symcrys (ITA 2016, Tab. 3.2.3.2), in der Reihenfolge von ITA: je Wyckoff-Lage
 * die Grundformen (Grenzformen nimmt der Katalog nicht auf). sym: Indexmuster in der Schreibweise der App (`hhl (h<l)`,
 * `h0-hl`), type: Nummer der Form (ITA Tab. 3.2.1.3).
 * @param {string} id
 * @returns {{ wy: string, fs: string, type: number, sym: string, mult: number }[]}
 */
export function kernGrundformen(id) {
  const { key, setting } = kernAufstellung(id);
  return crystalForms(key, { setting }).filter((f) => f.basic).map((f) => ({
    wy: f.letter, fs: f.siteSymmetry, type: f.formType, mult: f.multiplicity,
    sym: f.millerIndices.replace(/,/g, '') + (f.condition ? ` (${f.condition.replace(/\|/g, '')})` : ''),
  }));
}

/** Flächenzahl und Eigensymmetrie der 47 Formen (ITA Tab. 3.2.1.3) aus symcrys, nach Nummer. @type {Record<number, { faces: number, eig: string }>} */
export const KERN_FORMTYPEN = Object.fromEntries(CRYSTAL_FORM_TYPES.map((t) => [t.number, { faces: t.faces, eig: t.eigensymmetry }]));

/**
 * Ganzzahlige Operationen einer Punktgruppe der App in der Gitterbasis (Konvention ITC, Reihenfolge wie `kernOperationen`).
 * Rahmenunabhängig: die Gitterbasen von symcrys und der App bezeichnen dasselbe Gitter.
 * @param {string} id
 * @returns {Mat3[]}
 */
export function kernGitterOperationen(id) {
  const { key, setting } = kernAufstellung(id);
  return latticeOperations(key, { setting }).map((o) => kopie(o.matrix));
}

/**
 * Bahn einer Fläche (hkl) unter einer Punktgruppe der App aus symcrys, exakt: je Fläche die Indizes der Operationen
 * (wie `kernOperationen`), die die gegebene Fläche dorthin bringen.
 * @param {string} id @param {Normale} hkl
 * @returns {{ hkl: Normale, ops: number[] }[]}
 */
export function kernFlaechenbahn(id, hkl) {
  const { key, setting } = kernAufstellung(id);
  return orbit(key, { hkl }, { setting }).map((f) => ({ hkl: /** @type {Normale} */ ([...f.hkl]), ops: [...f.operations] }));
}

/**
 * Bahn einer Richtung (Pol) unter beliebigen Operationen aus symcrys: zusammenfallende Bilder zusammengefasst (Abstand
 * unter 10⁻⁶), je Pol der Einheitsvektor und die Indizes der Operationen dorthin. Rahmenunabhängig.
 * @param {readonly Mat3[]} ops @param {Vec3} p
 * @returns {{ p: Vec3, ops: number[] }[]}
 */
export function kernPolbahn(ops, p) {
  return orbitOf(ops.map((m) => ({ matrix: m })), p).map((q) => ({ p: /** @type {Vec3} */ ([...q.direction]), ops: [...q.operations] }));
}

/**
 * Punktgruppe beliebiger kartesischer Operationen (z. B. eines verzerrten Kristalls) aus symcrys: ihr Schlüssel oder null.
 * Toleranz die Vorgabe von symcrys (10⁻⁶); die Operationen aus dem Gitter sind auf Rundungsfehler genau orthogonal.
 * @param {readonly Mat3[]} ops
 * @returns {PointGroupKey | null}
 */
export function kernGruppeVon(ops) {
  return pointGroupOf(ops.map((m) => ({ matrix: m })))?.key ?? null;
}

/**
 * Polar unter beliebigen Operationen einer Gruppe (z. B. eines verzerrten Kristalls): das Feld `polar` der Punktgruppe, die
 * symcrys zu ihnen bestimmt (eine Richtung bleibt unter allen Operationen erhalten).
 * @param {readonly Mat3[]} ops
 */
export function kernPolar(ops) {
  const key = kernGruppeVon(ops);
  return key ? pointGroup(key).polar : false;
}

/**
 * Die Operationen einer beliebigen Liste geometrisch beschrieben (symcrys `describeOperationsOf`): Art, Zähligkeit,
 * kartesische Achse (erste von null verschiedene Komponente positiv) und Drehsinn.
 * @param {readonly Mat3[]} ops
 */
export function kernBeschreibung(ops) {
  return describeOperationsOf(ops.map((m) => ({ matrix: m })));
}
