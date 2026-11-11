// Zustand aus Link und Speicher: eine Prüfung für beide Wege (Leitfaden Abschn. 5.2, crystallography-common#63,
// #96). Der Speicher des Browsers ist Eingabe von aussen wie die Link-Adresse. ausSpeicher liest einen
// gespeicherten Stand der aktuellen Version (ein anderer wird verworfen, Leitfaden Abschn. 8), zustandPruefen prüft alle Felder mit ihren
// Abhängigkeiten (z. B. die Winkel eines Gitters gemeinsam, #95); main.js ruft sie auch nach dem Lesen eines Links.

import { POINT_GROUPS } from './pointgroups.js';
import { LATTICE_DEFAULTS, GITTER_BEREICH, constrainLattice, gitterGueltig, orientationPresets } from './polyhedra.js';
import { exampleById } from './examples.js';
import { createState, URL_VIEW, URL_PG, URL_FORM, LAT_KEYS } from './scene.js';

/** @import { Zustand } from './scene.js' */
/** @import { Gitterparameter } from './polyhedra.js' */

/** Version des gespeicherten Stands; ein Stand mit anderer Version wird verworfen (Leitfaden Abschn. 8). */
export const SPEICHER_VERSION = 4;
/** Zonen als 'u,v,w' (wie in der Link-Adresse). */
const ZONE = /^-?\d+,-?\d+,-?\d+$/;

/** Zahl (keine Zeichenkette, kein null) in [lo, hi] gesetzt wie num() in scene.js, sonst null. @param {unknown} v @param {number} lo @param {number} hi */
const num = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null);
/** @param {unknown} x @returns {x is Record<string, unknown>} */
const istObjekt = (x) => typeof x === 'object' && x !== null && !Array.isArray(x);
/** Nur die Felder von vorlage, aus quelle übernommen (keine fremden Schlüssel, kein __proto__). @param {object} ziel @param {unknown} quelle */
function felderUebernehmen(ziel, quelle) {
  if (!istObjekt(quelle)) return;
  const z = /** @type {Record<string, unknown>} */ (ziel);
  for (const k of Object.keys(z)) if (Object.hasOwn(quelle, k)) z[k] = quelle[k];
}

/**
 * Gitter eines Systems: alle fünf Parameter Zahlen und, auf die Bedingungen des Systems gesetzt, ein gültiges
 * Gitter (#95); sonst null. Zahlen werden in die Bereiche der Regler gesetzt (GITTER_BEREICH): das unverzerrte
 * Gitter in die engeren, das freie Gitter (frei) in die weiteren, in die jede Streckung passt (#100, #106).
 * @param {unknown} lat @param {string} sys @param {boolean} frei @returns {Gitterparameter | null}
 */
function gitterOderNull(lat, sys, frei) {
  if (!istObjekt(lat)) return null;
  const bereich = GITTER_BEREICH[frei ? 'frei' : 'unverzerrt'];
  /** @type {Record<string, number>} */
  const g = {};
  for (const k of LAT_KEYS) {
    const v = num(lat[k], ...bereich[k]);
    if (v == null) return null; // fehlt oder keine Zahl: das System beginnt mit seiner Vorgabe
    g[k] = v;
  }
  const p = /** @type {Gitterparameter} */ (/** @type {unknown} */ (g));
  return gitterGueltig(frei ? p : constrainLattice(p, sys)) ? p : null;
}

/**
 * Die eine Prüfung für Link und Speicher: alle Felder mit ihren Abhängigkeiten; Ungültiges wird zum Startwert.
 * Zahlen werden wie in der Link-Adresse auf den nächsten gültigen Wert gesetzt (Leitfaden 5.2). Neue Felder des
 * Zustands gehören hierher und in tests/rundlauf.test.mjs. Ändert state und gibt es zurück.
 * @param {Zustand} state
 */
export function zustandPruefen(state) {
  const d = createState();
  if (state.mode !== 'pg' && state.mode !== 'poly') state.mode = d.mode;
  // Punktgruppen
  const pg = state.pg;
  if (!POINT_GROUPS.some((g) => g.id === pg.id)) pg.id = d.pg.id;
  if (pg.monoAxis !== 'b' && pg.monoAxis !== 'c') pg.monoAxis = d.pg.monoAxis;
  pg.famPref = istObjekt(pg.famPref) ? Object.fromEntries(Object.entries(pg.famPref).filter(([, v]) => typeof v === 'string')) : {};
  for (const [, key] of URL_PG) if (typeof (/** @type {Record<string, unknown>} */ (pg))[key] !== 'boolean') (/** @type {Record<string, unknown>} */ (pg))[key] = (/** @type {Record<string, unknown>} */ (d.pg))[key];
  pg.theta = num(pg.theta, 0, 180) ?? d.pg.theta;
  const phi = num(pg.phi, -1e6, 1e6);
  pg.phi = phi == null ? d.pg.phi : ((phi % 360) + 360) % 360; // Azimut läuft um: modulo 360° statt begrenzt
  pg.hideDirs = Array.isArray(pg.hideDirs) ? pg.hideDirs.filter((k) => Number.isInteger(k) && k >= 0 && k <= 2) : [];
  if (pg.tool !== 'angle') pg.tool = null;
  // Kristallformen
  const p = state.poly;
  if (typeof p.system !== 'string' || !Object.hasOwn(LATTICE_DEFAULTS, p.system)) p.system = d.poly.system;
  p.entryBySys = istObjekt(p.entryBySys) ? Object.fromEntries(Object.entries(p.entryBySys).filter(([s, v]) => Object.hasOwn(LATTICE_DEFAULTS, s) && typeof v === 'string')) : {};
  const presets = orientationPresets(p.system);
  if (!presets.some((x) => x.id === p.presetId)) p.presetId = presets[0].id;
  /** @param {unknown} lats @param {boolean} frei */
  const gitter = (lats, frei) => Object.fromEntries(Object.entries(istObjekt(lats) ? lats : {}).filter(([s]) => Object.hasOwn(LATTICE_DEFAULTS, s))
    .map(([s, l]) => [s, gitterOderNull(l, s, frei)]).filter(([, l]) => l !== null));
  p.lats = /** @type {Record<string, Gitterparameter>} */ (gitter(p.lats, false));
  p.freeLats = /** @type {Record<string, Gitterparameter>} */ (gitter(p.freeLats, true));
  for (const [, key] of URL_FORM) if (typeof (/** @type {Record<string, unknown>} */ (p))[key] !== 'boolean') (/** @type {Record<string, unknown>} */ (p))[key] = (/** @type {Record<string, unknown>} */ (d.poly))[key];
  p.auxDist = num(p.auxDist, 0.3, 3) ?? d.poly.auxDist;
  p.size = num(p.size, 0.3, 1.2) ?? d.poly.size;
  if (p.tool !== 'zone' && p.tool !== 'angle') p.tool = null;
  if (!exampleById(p.example)) p.example = null;
  p.exScale = istObjekt(p.exScale) ? Object.fromEntries(Object.entries(p.exScale).filter(([id, f]) => exampleById(id) && Array.isArray(f))
    .map(([id, f]) => [id, /** @type {unknown[]} */ (f).map((x) => num(x, 0.5, 2) ?? 1)])) : {};
  p.zones = Array.isArray(p.zones) ? p.zones.filter((k) => typeof k === 'string' && ZONE.test(k) && k !== '0,0,0') : [];
  if (p.breakMode !== 'free') p.breakMode = 'stretch';
  const st = p.stretch;
  const sf = istObjekt(st) ? num(st.s, 0.5, 2) : null;
  if (!istObjekt(st) || typeof st.dir !== 'string' || sf == null) p.stretch = { dir: '', s: 1 };
  else st.s = sf;
  // Darstellung
  for (const [, key] of URL_VIEW) if (typeof (/** @type {Record<string, unknown>} */ (state.view))[key] !== 'boolean') (/** @type {Record<string, unknown>} */ (state.view))[key] = (/** @type {Record<string, unknown>} */ (d.view))[key];
  state.view.wulffRot = num(state.view.wulffRot, 0, 180) ?? 0;
  if (!(Number.isInteger(state.blick) && state.blick >= 0 && state.blick <= 3)) state.blick = 0;
  return state;
}

/**
 * Zustand aus dem Speicher des Browsers (JSON.parse von 'stereo-state'), danach zustandPruefen. Ohne Stand der
 * aktuellen Version (SPEICHER_VERSION) der Startzustand.
 * @param {unknown} saved @returns {Zustand}
 */
export function ausSpeicher(saved) {
  const state = createState();
  if (!istObjekt(saved) || saved.v !== SPEICHER_VERSION) return state;
  felderUebernehmen(state.pg, saved.pg);
  felderUebernehmen(state.poly, saved.poly);
  felderUebernehmen(state.view, saved.view);
  state.mode = saved.mode === 'poly' ? 'poly' : 'pg';
  return zustandPruefen(state);
}

/** Stand für den Speicher des Browsers (Gegenstück zu ausSpeicher). @param {Zustand} state */
export const speicherStand = (state) => ({ v: SPEICHER_VERSION, mode: state.mode, pg: state.pg, poly: state.poly, view: state.view });
