// Formenkatalog: die Grundformen jeder Punktgruppe aus symcrys (js/kern.js: Wyckoff-Lage, Flächensymmetrie, Formtyp,
// Indexmuster, Flächenzahl) mit den Zeilen aus js/formen.js (Kennung, Vertreter, Namensvariante) als Einträge mit Kennung
// (für Links) und Stelle im Katalog.

import { FORM_TYPES, FORMEN } from './formen.js';
import { KERN_FORMTYPEN, kernGrundformen } from './kern.js';

/** @import { Normale } from '../lib/common/js/typen.js' */
/**
 * Eintrag des Formenkatalogs. pg: Punktgruppe, wy: Wyckoff-Buchstabe, fs: Flächensymmetrie, type: Formtyp
 * (FORM_TYPES), sym: Indexmuster, hkl: Repräsentant, mult: Flächenzahl, alt: Namensvariante, aufst: 'B' bei
 * Aufstellung B, id: Kennung (Links), idx: Stelle im Katalog.
 * @typedef {{ pg: string, wy: string, fs: string, type: number, sym: string, hkl: Normale, mult: number, alt?: boolean, aufst?: 'B', id: string, idx: number }} Formeintrag
 */

/** @type {Formeintrag[]} */
export const CATALOG = FORMEN.flatMap(([pg, rows, aufst]) => {
  const formen = kernGrundformen(pg);
  // Kennungen und Reihenfolge sind Schnittstelle (Links f=): weicht symcrys ab, lieber laut scheitern als still umdeuten.
  if (formen.length !== rows.length || formen.some((f, i) => `${f.wy}${f.type}` !== rows[i][0])) {
    throw new Error(`Formen von ${pg}: symcrys gibt ${formen.map((f) => f.wy + f.type).join(' ')}, der Katalog ${rows.map((r) => r[0]).join(' ')}`);
  }
  return rows.map(([, hkl, alt], i) => {
    const { wy, fs, type, sym, mult } = formen[i];
    return { pg, wy, fs, type, sym, hkl: /** @type {Normale} */ (hkl), mult, alt, ...(aufst ? { aufst } : {}) };
  });
}).map((e, i) => ({ ...e, id: `${e.pg}:${e.wy}${e.type}`, idx: i }));

/** @param {Pick<Formeintrag, 'type' | 'alt'>} e */
export const formName = (e) => (e.alt && FORM_TYPES[e.type].alt ? FORM_TYPES[e.type].alt : FORM_TYPES[e.type].name);
/** @param {Pick<Formeintrag, 'type'>} e */
export const formEig = (e) => KERN_FORMTYPEN[e.type].eig;
/** @param {string} id */
export const entryById = (id) => CATALOG.find((e) => e.id === id);
