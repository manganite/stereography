// Gemeinsamer Kern von App (main.js) und Skript (skript.js): Zustand, Link-Adresse, Farben und die
// Szenen für das Stereogramm (buildSVG). Ohne Zugriff auf Bedienelemente; die App setzt die Auswahl,
// das Skript erzeugt aus einer Link-Adresse dieselbe Abbildung wie die App.

import { POINT_GROUPS, buildPointGroup, orbit, symmetryDirections, latticeToCart, HEX_A, HEX_B } from './pointgroups.js';
import {
  buildCrystal, zoneOf, zoneByUvw, zoneKey, zonesOf, dirToFour, orientationPresets, LATTICE_DEFAULTS, SYSTEM_OF,
  STRETCH_DIRS, stretchDir, constrainLattice, latticeFromParams, stretchLattice, paramsOfLattice, gitterGueltig,
  GITTER_BEREICH,
} from './polyhedra.js';
import { CATALOG, formEig, entryById } from './forms.js';
import { EIG_SCHREIBWEISE } from './formen.js';
import { hklParts } from '../lib/common/js/format.js';
import { normalize, mulVec } from './linalg.js';
import { exampleById } from './examples.js';
import { siteOf, distinctPoles } from './sitesym.js';

/** @import { Vec3, Richtung, Grad } from '../lib/common/js/typen.js' */
/** @import { Teil } from '../lib/common/js/format.js' */
/** @import { Punktgruppe, Achse } from './pointgroups.js' */
/** @import { Gitterparameter, Kristall, Kristallflaeche, Zone, Streckrichtung } from './polyhedra.js' */
/** @import { Formeintrag } from './forms.js' */
/** @import { ScenePol } from './stereogram.js' */
/** @import { Beispiel } from './examples.js' */
/**
 * Zustand der App (createState). Kristallformen: system Kristallsystem, entryBySys gewählte Form je System,
 * presetId Projektionsrichtung, lats Gitter je System, example Beispielkristall, exScale Faktoren der
 * Formabstände je Beispiel, zones gewählte Zonen als 'u,v,w'. Punktgruppen: theta, phi Lage des Pols in Grad.
 * @typedef {object} Zustand
 * @property {'pg' | 'poly'} mode
 * @property {{ id: string, monoAxis: string, famPref: Record<string, string>, showElements: boolean, showObject: boolean, showPoles: boolean, theta: number, phi: number, colorful: boolean, hideDirs: number[], tool: 'angle' | null }} pg
 * @property {Formzustand} poly
 * @property {{ dirColors: boolean, wulff: boolean, wulffRot: number, axes: boolean, sphere: boolean, globe: boolean, plane: boolean, rays: boolean, normals: boolean }} view
 * @property {number | null} selected
 * @property {number} blick
 * @property {number[]} zoneSel
 * @property {number[]} pgSel
 * @property {'a' | 'b'} fig
 */
/**
 * Zustand im Modus Kristallformen (siehe Zustand).
 * @typedef {object} Formzustand
 * @property {string} system
 * @property {Record<string, string>} entryBySys
 * @property {string} presetId
 * @property {Record<string, Gitterparameter>} lats
 * @property {boolean} broken
 * @property {boolean} open
 * @property {number} auxDist
 * @property {number} size
 * @property {boolean} labels
 * @property {boolean} showPoles
 * @property {boolean} showLower
 * @property {boolean} bravais
 * @property {boolean} frame
 * @property {boolean} faceSym
 * @property {'zone' | 'angle' | null} tool
 * @property {string | null} example
 * @property {Record<string, number[]>} exScale
 * @property {string[]} zones
 * @property {'stretch' | 'free'} breakMode
 * @property {Record<string, Gitterparameter>} freeLats
 * @property {{ dir: string, s: number }} stretch
 */
/** Farben aus base.css (palette). @typedef {ReturnType<typeof palette>} Palette */
/** Winkel zwischen zwei Polen (angleOf). @typedef {{ a: Vec3, b: Vec3, deg: number }} Winkel */
/** Fläche mit den Farben der App (polyCrystal). @typedef {Kristallflaeche & { color2d?: string | null, color3d?: string }} AppFlaeche */
/** Gewählte Zone mit Farbe. @typedef {Zone & { color: string }} FarbZone */
/**
 * Kristall mit dem, was die App ergänzt (polyCrystal, polyScene).
 * @typedef {Omit<Kristall, 'faces'> & { faces: AppFlaeche[], example?: Beispiel | null, zone?: Zone | null, zoneClasses?: ReturnType<typeof zonesOf>, selZones: FarbZone[], angle?: Winkel | null }} AppKristall
 */

const deg = Math.PI / 180;

// ------------------------------------------------------------------ Zustand
/**
 * Gesehene Erste Schritte aus dem gespeicherten Wert von `stereo-intro`: Modi, durch Komma getrennt.
 * Bis v1.12.1 hiess „zu“: die damals einzigen Ersten Schritte (Galenit, Modus „Kristallformen“) sind gesehen.
 * @param {string | null | undefined} value
 * @returns {Set<string>}
 */
export const introSeen = (value) => new Set(String(value ?? '').split(',').filter(Boolean).map((m) => (m === 'zu' ? 'poly' : m)));

/** Startzustand der App (auch Grundlage jeder Link-Adresse). @returns {Zustand} */
export function createState() {
  return {
    mode: 'pg',
    pg: { id: 'mm2', monoAxis: 'b', famPref: {}, showElements: true, showObject: true, showPoles: true, theta: 59, phi: 75.5, colorful: false, hideDirs: [], tool: null },
    poly: {
      system: 'kubisch', entryBySys: {}, presetId: '001', lats: {}, broken: false, open: false, auxDist: 1,
      size: 0.75, labels: true, showPoles: true, showLower: true, bravais: false, frame: false, faceSym: false, tool: null,
      example: null, exScale: {}, // Beispielkristall und Faktoren der Formabstände
      zones: [], // gewählte Zonen (Werkzeug „Zone“) als 'u,v,w'
      // Symmetrie brechen (broken): Art 'stretch' (Streckung entlang einer Blickrichtung, bezogen auf das
      // unverzerrte Gitter lats) oder 'free' (alle Gitterparameter frei, eigenes Gitter freeLats)
      breakMode: 'stretch', freeLats: {},
      stretch: { dir: '', s: 1 }, // Streckung: Kennung aus STRETCH_DIRS, Faktor
    },
    view: { dirColors: true, wulff: false, wulffRot: 0, axes: false, sphere: true, globe: true, plane: true, rays: true, normals: true },
    selected: null,
    // Blick der 3D-Konstruktion (nur Link, nicht gespeichert): 0 keine Vorgabe, 1–3 die Blickrichtung des Systems
    blick: 0,
    zoneSel: [],
    pgSel: [], // Punktgruppenmodus: gewählte Pole (Werkzeug Winkel)
    fig: 'a', // Telefon: sichtbare Tafel (a: Stereogramm, b: 3D)
  };
}

// Azimut und Poldistanz (siehe main.js)
/** Umrechnung aus der Zählung bis v1.0.0 (ab ↓, Gegenuhrzeigersinn). @param {number} p */
export const phiFromOld = (p) => ((((90 - p) % 360) + 360) % 360);
// Poldistanz ρ wie bei Borchardt-Ott (Abschn. 5.6): obere Halbkugel vom Nordpol (0 … 90°), untere vom Südpol
// mit negativem Vorzeichen (−90 … 0°). Intern bleibt theta der Winkel zum Nordpol (0 … 180°).
/** @param {number} theta */
export const rhoOf = (theta) => (theta > 90 + 1e-9 ? theta - 180 : theta);
/** @param {number} rho */
export const thetaOf = (rho) => (rho < 0 ? 180 + rho : rho);
/** ρ als Text mit echtem Minuszeichen. @param {number} theta @param {number} digits */
export const rhoText = (theta, digits) => (theta > 90 + 1e-9 ? '−' : '') + Math.abs(rhoOf(theta)).toFixed(digits) + '°';

// ------------------------------------------------------------------ Farben aus CSS-Tokens
/** @param {Element} [el] */
export function palette(el = document.documentElement) {
  const cs = getComputedStyle(el);
  /** @param {string} n */
  const g = (n) => cs.getPropertyValue('--' + n).trim();
  return {
    paper: g('paper'), ink: g('ink'), muted: g('muted'), net: g('net'),
    mirror: g('ink'), axis: g('ink'), dir: [g('dir1'), g('dir2'), g('dir3')],
    upper: g('upper'), accent: g('accent'), accent2: g('accent2'),
    ray: g('ray'), crystal: g('crystal'), crystal2: g('crystal2'), edge: g('edge'),
    normal: g('normal'), sphere: g('muted'), mirror3d: g('mirror'),
    ax2: g('ax2'), ax3: g('ax3'), ax4: g('ax4'), ax6: g('ax6'),
    form: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => g('fc' + i)),
  };
}
/** @type {HTMLElement | null} */
let lightEl = null;
/** Farben des hellen Modus, auch wenn die Seite dunkel ist (Bildexport immer hell). */
export function lightPalette() {
  if (!lightEl || !lightEl.isConnected) {
    lightEl = document.createElement('span');
    lightEl.className = 'theme-light';
    lightEl.hidden = true;
    document.body.appendChild(lightEl);
  }
  return palette(lightEl);
}
/** Farbe der i-ten Form eines Beispielkristalls (Pol) bzw. ihrer Flächen in 3D (aufgehellt). */
/** @param {Palette} col @param {number} i */
export const formColor = (col, i) => col.form[i % col.form.length];
/** Farbe zwischen a und b (Hex), Anteil t von b. @param {string} a @param {string} b @param {number} t */
export function mixHex(a, b, t) {
  /** @param {string} h */
  const p = (h) => { const x = h.replace('#', ''); const f = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((k) => parseInt(f.slice(k, k + 2), 16)); };
  try {
    const A = p(a), Bc = p(b);
    return '#' + A.map((v, k) => Math.round(v + (Bc[k] - v) * t).toString(16).padStart(2, '0')).join('');
  } catch { return a; }
}
/** @param {Palette} col @param {number} i */
export const formFill = (col, i) => mixHex(formColor(col, i), col.paper, 0.38);
/** Farbe der i-ten gewählten Zone: zuerst die Formfarben, danach weitere Farbtöne, keine Wiederholung. @param {Palette} col @param {number} i */
export function zoneColor(col, i) {
  if (i < col.form.length) return col.form[i];
  const dark = (() => { const x = col.paper.replace('#', ''); return x.length >= 6 && parseInt(x.slice(0, 2), 16) + parseInt(x.slice(2, 4), 16) + parseInt(x.slice(4, 6), 16) < 384; })();
  // zuerst Farbtöne, die die Formfarben nicht belegen (Grün, Violett, Gold, Himmelblau …), danach goldener Winkel
  const GAPS = [125, 265, 45, 195, 290, 95, 345, 235];
  const j = i - col.form.length;
  const h = j < GAPS.length ? GAPS[j] : (GAPS[0] + j * 137.508) % 360, sat = 0.6, l = dark ? 0.66 : 0.4;
  /** @param {number} n */
  const f = (n) => { const k = (n + h / 30) % 12; const c = l - sat * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
export const FONT = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

// ------------------------------------------------------------------ Kristallformen und Beispiele
/** Eintrag der Gruppenliste (id ist immer eine Gruppe der Liste). @param {string} id */
export const groupOf = (id) => /** @type {Punktgruppe} */ (POINT_GROUPS.find((g) => g.id === id));
/** @type {Record<string, string>} */
export const DEFAULT_ENTRY = {
  triklin: '-1:a2', monoklin: '2/mb:c6', orthorhombisch: 'mmm:g7', tetragonal: '4/mmm:f14',
  trigonal: '-3m1:c21', hexagonal: '6/mmm:e31', kubisch: 'm-3m:b35',
};
/** @type {Map<string, number>} */
export const groupOrder = new Map();
/** @param {string} s */
const eigNorm = (s) => EIG_SCHREIBWEISE[s] || s;
/** Kristallsystem einer Eigensymmetrie; null für die Grenzgruppen ∞m und ∞/mm (Pedion, Pinakoid). @param {string} eig */
const eigSystem = (eig) => POINT_GROUPS.find((g) => eigNorm(g.hm) === eigNorm(eig))?.system ?? null;
/**
 * Steht die Form ohne „Flächensymmetrie zeigen“ in der Liste? Die allgemeine Form jeder Punktgruppe, die Formen
 * unter der Gruppe ihrer Eigensymmetrie und die Formen, deren Eigensymmetrie zu einem anderen Kristallsystem gehört
 * (trigonales und hexagonales Prisma im trigonalen System, #118), unter ihrer Gruppe im Katalog.
 * @param {Zustand} state @param {Formeintrag} e
 */
export function formListed(state, e) {
  if (state.poly.faceSym) return true;
  const g = groupOf(e.pg);
  if (!groupOrder.has(g.id)) groupOrder.set(g.id, buildPointGroup(g.id).order);
  const eigSys = eigSystem(formEig(e));
  return e.mult === groupOrder.get(g.id) || eigNorm(formEig(e)) === eigNorm(g.hm) || (eigSys != null && eigSys !== g.system);
}
/** @param {Zustand} state @returns {string} */
export const currentEntryId = (state) => {
  const sys = state.poly.system;
  const id = state.poly.entryBySys[sys];
  const e = id && entryById(id);
  if (!e || SYSTEM_OF[e.pg] !== sys) return DEFAULT_ENTRY[sys];
  if (formListed(state, e)) return id;
  // ausgeblendete Form: dieselbe Form (gleicher Typ) dort zeigen, wo sie ihre Eigensymmetrie hat
  const same = CATALOG.find((x) => SYSTEM_OF[x.pg] === sys && x.type === e.type && formListed(state, x));
  return same ? same.id : DEFAULT_ENTRY[sys];
};
/** Beispielkristall (nur gültig, solange sein Kristallsystem gewählt ist). @param {Zustand} state */
export const currentExample = (state) => {
  const ex = exampleById(state.poly.example);
  return ex && ex.sys === state.poly.system ? ex : null;
};
/** @param {Zustand} state @param {Beispiel} ex */
export const exFactors = (state, ex) => {
  const f = state.poly.exScale[ex.id];
  return ex.forms.map((_, i) => (Array.isArray(f) && Number.isFinite(f[i]) ? f[i] : 1));
};
/** Formen des Beispiels mit den eingestellten Abständen (die erste Form ist die Bezugsform). @param {Zustand} state @param {Beispiel} ex */
export const exForms = (state, ex) => {
  const fs = exFactors(state, ex);
  // jede Form hat t oder r
  return ex.forms.map(({ hkl, r, t }, i) => (t != null ? { hkl, t: t * fs[i] } : { hkl, r: /** @type {number} */ (r) * fs[i] }));
};
/**
 * Art des Symmetriebruchs: null (Symmetrie bleibt), 'stretch' oder 'free'. Ohne Streckrichtung im System
 * (orthorhombisch, monoklin, triklin) gibt es nur 'free'. Beispielkristalle: kein Symmetriebruch.
 * @param {Zustand} state
 * @returns {'stretch' | 'free' | null}
 */
export function breakModeOf(state) {
  if (!state.poly.broken || currentExample(state)) return null;
  if (!STRETCH_DIRS[state.poly.system].length) return 'free';
  return state.poly.breakMode === 'free' ? 'free' : 'stretch';
}
/** Eingestellte Streckung { id, uvw, cls, s } im Modus 'stretch' (auch bei s = 1), sonst null. @param {Zustand} state @returns {(Streckrichtung & { s: number }) | null} */
export function stretchSetting(state) {
  if (breakModeOf(state) !== 'stretch') return null;
  const d = stretchDir(state.poly.system, state.poly.stretch && state.poly.stretch.dir);
  return d ? { ...d, s: state.poly.stretch.s } : null;
}
/** Wirksame Streckung (s ≠ 1) oder null. @param {Zustand} state */
export function currentStretch(state) {
  const st = stretchSetting(state);
  return st && Math.abs(st.s - 1) > 1e-9 ? st : null;
}
/** Gitter im Modus „alle frei“ (Startwert: unverzerrtes Gitter). @param {Zustand} state */
export const freeLat = (state) => {
  const sys = state.poly.system;
  if (!state.poly.freeLats || typeof state.poly.freeLats !== 'object') state.poly.freeLats = {};
  if (!state.poly.freeLats[sys]) state.poly.freeLats[sys] = constrainLattice(currentLat(state), sys);
  return state.poly.freeLats[sys];
};
/** Wirksame Gitterparameter (was die Gitterregler zeigen). @param {Zustand} state @returns {Gitterparameter} */
export function effectiveLat(state) {
  const sys = state.poly.system;
  const mode = breakModeOf(state);
  if (mode === 'free') return { ...freeLat(state) };
  const base = constrainLattice(currentLat(state), sys);
  const st = currentStretch(state);
  return st ? paramsOfLattice(stretchLattice(latticeFromParams(base), st.uvw, st.s)) : base;
}
/** @param {Zustand} state */
export const currentLat = (state) => {
  const sys = state.poly.system;
  if (!state.poly.lats[sys]) state.poly.lats[sys] = { ...LATTICE_DEFAULTS[sys] };
  return state.poly.lats[sys];
};

// ------------------------------------------------------------------ Zustand in der URL
/** @param {unknown} v */
export const B = (v) => (v ? '1' : '0');
/** @param {string | null} s */
export const isOn = (s) => s === '1' || s === 'ja' || s === 'true';
/** Zahl im Bereich [lo, hi] oder null. Leer oder nur Leerzeichen gilt als fehlend (`Number('') === 0`, #123).
 * @param {string | null} s @param {number} lo @param {number} hi */
export const num = (s, lo, hi) => {
  if (s == null || s.trim() === '') return null;
  const x = Number(s);
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null;
};
/** @type {[string, string][]} */
export const URL_VIEW = [
  ['farbe', 'dirColors'], ['wulff', 'wulff'], ['achsen', 'axes'], ['kugel', 'sphere'], ['ns', 'globe'], ['ebene', 'plane'], ['strahlen', 'rays'], ['normalen', 'normals'],
];
/** @type {[string, string][]} */
export const URL_PG = [['el', 'showElements'], ['obj', 'showObject'], ['pole', 'showPoles'], ['hand', 'colorful']];
/** @type {[string, string][]} */
export const URL_FORM = [['br', 'broken'], ['offen', 'open'], ['pole', 'showPoles'], ['idx', 'labels'], ['unten', 'showLower'], ['hkil', 'bravais'], ['geruest', 'frame'], ['muster', 'faceSym']];
/** @type {(keyof Gitterparameter)[]} */
export const LAT_KEYS = ['ba', 'ca', 'al', 'be', 'ga'];
/** @type {Record<string, string>} */
export const TOOL_NAMES = { zone: 'zone', angle: 'winkel' };
/** @type {Record<string, 'zone' | 'angle'>} */
export const TOOL_IDS = { zone: 'zone', winkel: 'angle' };
/** Teil des Zustands mit Schaltern bzw. Reglern (Listen URL_…; bindCheck, bindRange in main.js). @typedef {Record<string, unknown>} Schalter */

/** Link-Adresse (Hash) eines Zustands; nur Abweichungen vom Startzustand DEFAULTS. @param {Zustand} state @param {Zustand} DEFAULTS */
export function hashOf(state, DEFAULTS) {
  const q = new URLSearchParams();
  const d = DEFAULTS;
  /** @param {[string, string][]} list @param {Schalter} obj @param {Schalter} def */
  const bools = (list, obj, def) => { for (const [k, key] of list) if (!!obj[key] !== !!def[key]) q.set(k, B(obj[key])); };
  if (state.mode === 'pg') {
    q.set('m', 'pg');
    q.set('g', state.pg.id);
    // volle Genauigkeit (auf 10⁻⁴° gekürzt), damit ein Link die Pole nicht verschiebt
    /** @param {number} x */
    const exact = (x) => String(Number(x.toFixed(4)));
    if (Math.abs(state.pg.theta - d.pg.theta) > 1e-6) q.set('rho', exact(rhoOf(state.pg.theta)));
    if (Math.abs(state.pg.phi - d.pg.phi) > 1e-6) q.set('az', exact(state.pg.phi));
    bools(URL_PG, state.pg, d.pg);
    if (state.pg.hideDirs.length) q.set('aus', state.pg.hideDirs.map((k) => k + 1).join(','));
    if (state.pg.tool) q.set('w', TOOL_NAMES[state.pg.tool]);
  } else {
    q.set('m', 'form');
    const sys = state.poly.system;
    q.set('sys', sys);
    const ex = currentExample(state);
    if (ex) {
      q.set('bsp', ex.id);
      const fs = exFactors(state, ex);
      if (fs.some((x) => Math.abs(x - 1) > 1e-6)) q.set('ab', fs.map((x) => String(Math.round(x * 100) / 100)).join(','));
    } else q.set('f', currentEntryId(state));
    // Lage, die es im System nicht gibt (z. B. 001 ausser kubisch), gilt als die erste und wird nicht geschrieben
    const presets = orientationPresets(sys);
    if (presets.some((p) => p.id === state.poly.presetId) && state.poly.presetId !== presets[0].id) q.set('lage', state.poly.presetId);
    // Gitter: im Modus „alle frei“ das freie Gitter, sonst das unverzerrte (mit Streckung str=Richtung,Faktor)
    const mode = breakModeOf(state);
    const lat = mode === 'free' ? freeLat(state) : constrainLattice(currentLat(state), sys);
    /** @type {Gitterparameter} */
    const l0 = { ...LATTICE_DEFAULTS[sys], ...(ex ? ex.lat : {}) };
    for (const k of LAT_KEYS) if (Math.abs(lat[k] - l0[k]) > 1e-6) q.set(k, String(Math.round(lat[k] * 100) / 100));
    bools(URL_FORM, state.poly, d.poly);
    const st = stretchSetting(state);
    if (st) q.set('str', st.id + ',' + String(Math.round(st.s * 100) / 100));
    if (Math.abs(state.poly.auxDist - d.poly.auxDist) > 1e-6) q.set('abstand', String(state.poly.auxDist));
    if (Math.abs(state.poly.size - d.poly.size) > 1e-6) q.set('gr', String(state.poly.size));
    if (state.poly.tool) q.set('w', TOOL_NAMES[state.poly.tool]);
    if (state.poly.tool === 'zone' && state.poly.zones.length) q.set('zonen', state.poly.zones.join(';'));
  }
  bools(URL_VIEW, state.view, d.view);
  if (state.view.wulff && state.view.wulffRot) q.set('netz', String(state.view.wulffRot));
  if (state.blick >= 1 && state.blick <= 3) q.set('blick', String(state.blick));
  return '#' + q.toString().replace(/%2F/g, '/').replace(/%2C/g, ',').replace(/%3A/g, ':').replace(/%3B/g, ';');
}

/** Wendet einen Hash auf den Startzustand an. Gibt false zurück, wenn kein brauchbarer Hash vorliegt. @param {Zustand} state @param {string} hash @param {Zustand} DEFAULTS */
export function applyHashTo(state, hash, DEFAULTS) {
  const q = new URLSearchParams(hash.replace(/^#/, ''));
  /** Wert eines Schlüssels, dessen Vorhandensein geprüft ist. @param {string} k */
  const da = (k) => /** @type {string} */ (q.get(k));
  if (!q.has('m')) return false;
  // Darstellung und der Bereich des verlinkten Modus starten vom Startzustand (der Link ist vollständig);
  // der andere Modus behält den gespeicherten Zustand.
  /** @template T @param {T} o @returns {T} */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  state.view = clone(DEFAULTS.view);
  if (q.get('m') === 'form') state.poly = clone(DEFAULTS.poly);
  else state.pg = { ...clone(DEFAULTS.pg), famPref: state.pg.famPref || {} };
  /** @param {[string, string][]} list @param {Schalter} obj */
  const bools = (list, obj) => { for (const [k, key] of list) if (q.has(k)) obj[key] = isOn(q.get(k)); };
  if (q.get('m') === 'form') {
    state.mode = 'poly';
    const sys = q.get('sys');
    if (sys && Object.prototype.hasOwnProperty.call(LATTICE_DEFAULTS, sys)) state.poly.system = sys;
    if (q.has('f')) state.poly.entryBySys[state.poly.system] = da('f');
    const ex = exampleById(q.get('bsp'));
    if (ex && ex.sys === state.poly.system) {
      state.poly.example = ex.id;
      if (q.has('ab')) state.poly.exScale[ex.id] = da('ab').split(',').map((x) => num(x, 0.5, 2) ?? 1);
    }
    if (q.has('lage')) state.poly.presetId = da('lage');
    // ungültige Lage für das System (fehlt lage, bleibt die kubische Startlage 001): die erste des Systems
    const presets = orientationPresets(state.poly.system);
    if (!presets.some((p) => p.id === state.poly.presetId)) state.poly.presetId = presets[0].id;
    /** @type {Gitterparameter} */
    const lat = { ...LATTICE_DEFAULTS[state.poly.system], ...(ex && ex.sys === state.poly.system ? ex.lat : {}) };
    // Bereiche (GITTER_BEREICH) erst, wenn feststeht, ob das Gitter frei ist (weiter) oder unverzerrt
    for (const k of LAT_KEYS) {
      if (!q.has(k)) continue;
      const v = num(q.get(k), -Infinity, Infinity);
      if (v != null) lat[k] = v;
    }
    bools(URL_FORM, state.poly);
    // str=<Richtung>,<Faktor>, z. B. str=111,1.3 (Richtung als Gitterrichtung ohne Klammern): Symmetrie
    // brechen durch Streckung (auch ohne br=1, Links aus v1.4.0). Nur ohne Beispielkristall; ungültige
    // Richtung oder kein Faktor: keine Streckung; Faktor ausserhalb 0,5 … 2: nächster gültiger Wert (Leitfaden 5.2).
    let stretched = false;
    if (q.has('str') && !state.poly.example) {
      const [id, f] = da('str').split(',');
      const s = f != null && f.trim() !== '' ? Math.min(2, Math.max(0.5, Number(f))) : NaN;
      if (STRETCH_DIRS[state.poly.system].some((x) => x.id === id) && s >= 0.5 && s <= 2) {
        state.poly.stretch = { dir: id, s };
        state.poly.broken = true;
        stretched = true;
      }
    }
    // br=1 ohne gültige Streckung: alle Gitterparameter frei (Links bis v1.4.0 meinen genau das)
    const sysNow = state.poly.system;
    const frei = state.poly.broken && !state.poly.example && !stretched;
    state.poly.breakMode = frei ? 'free' : 'stretch';
    // Zahlen ausserhalb ihres Bereichs: nächster gültiger Wert (Leitfaden 5.2)
    const bereich = GITTER_BEREICH[frei ? 'frei' : 'unverzerrt'];
    for (const k of LAT_KEYS) lat[k] = Math.min(bereich[k][1], Math.max(bereich[k][0], lat[k]));
    if (frei) state.poly.freeLats = { [sysNow]: lat };
    // Winkel, die zusammen kein Gitter ergeben: die Winkel der Vorgabe (#95). Geprüft wird das verwendete Gitter:
    // alle Parameter frei oder auf die Bedingungen des Systems gesetzt (lat ist auch das freie Gitter).
    if (!gitterGueltig(state.poly.breakMode === 'free' ? lat : constrainLattice(lat, sysNow))) {
      const vorgabe = { ...LATTICE_DEFAULTS[sysNow], ...(ex && ex.sys === sysNow ? ex.lat : {}) };
      for (const k of /** @type {const} */ (['al', 'be', 'ga'])) lat[k] = vorgabe[k];
    }
    // unverzerrtes Gitter; beim freien Gitter (weitere Bereiche) in die Bereiche des unverzerrten gesetzt
    const unverzerrt = constrainLattice(lat, sysNow);
    for (const k of LAT_KEYS) { const [lo, hi] = GITTER_BEREICH.unverzerrt[k]; unverzerrt[k] = Math.min(hi, Math.max(lo, unverzerrt[k])); }
    state.poly.lats[sysNow] = unverzerrt;
    if (q.has('abstand')) state.poly.auxDist = num(q.get('abstand'), 0.3, 3) ?? state.poly.auxDist;
    if (q.has('gr')) state.poly.size = num(q.get('gr'), 0.3, 1.2) ?? state.poly.size;
    // nur eigene Schlüssel: w=toString o. ä. aus dem Prototyp gilt als kein Werkzeug
    const w = q.get('w');
    state.poly.tool = w != null && Object.hasOwn(TOOL_IDS, w) ? TOOL_IDS[w] : null;
    if (q.has('zonen')) state.poly.zones = da('zonen').split(';').filter((k) => /^-?\d+,-?\d+,-?\d+$/.test(k) && k !== '0,0,0');
  } else {
    state.mode = 'pg';
    if (POINT_GROUPS.some((g) => g.id === q.get('g'))) state.pg.id = da('g');
    // rho nach Borchardt-Ott (untere Halbkugel negativ); Werte über 90° aus Links bis v1.0.0 gelten weiter
    if (q.has('rho')) { const r = num(q.get('rho'), -90, 180); if (r != null) state.pg.theta = thetaOf(r); }
    // az: Azimut nach Borchardt-Ott (ab →, im Uhrzeigersinn); phi: alte Zählung bis v1.0.0 (ab ↓, Gegenuhrzeigersinn)
    if (q.has('az')) { const p = num(q.get('az'), -1e6, 1e6); if (p != null) state.pg.phi = ((p % 360) + 360) % 360; }
    else if (q.has('phi')) { const p = num(q.get('phi'), -1e6, 1e6); if (p != null) state.pg.phi = phiFromOld(p); }
    bools(URL_PG, state.pg);
    if (q.has('aus')) state.pg.hideDirs = da('aus').split(',').map((s) => Number(s) - 1).filter((k) => k >= 0 && k <= 2);
    state.pg.tool = q.get('w') === 'winkel' ? 'angle' : null;
  }
  bools(URL_VIEW, state.view);
  if (q.has('netz')) state.view.wulffRot = num(q.get('netz'), 0, 180) ?? 0;
  // blick=1, 2 oder 3: Blick der 3D-Konstruktion entlang der 1., 2. bzw. 3. Blickrichtung (Knöpfe unter der Ansicht)
  const b = Number(q.get('blick'));
  state.blick = q.has('blick') && Number.isInteger(b) && b >= 1 && b <= 3 ? b : 0;
  return true;
}

// ------------------------------------------------------------------ Szenen
/** Pol in allgemeiner Lage (kartesisch). @param {Zustand} state @returns {Vec3} */
export function generalPole(state) {
  // φ ab b (→, y) im Uhrzeigersinn, d. h. zur a-Achse (↓, x) hin
  const t = state.pg.theta * deg, p = state.pg.phi * deg;
  return [Math.sin(t) * Math.sin(p), Math.sin(t) * Math.cos(p), Math.cos(t)];
}

/** Kristallachsen für die Beschriftung im Stereogramm. @param {boolean | undefined} hex @returns {{ name: string, dir: Vec3 }[]} */
export function crystalAxesFor(hex) {
  return hex
    ? [{ name: 'a₁', dir: HEX_A }, { name: 'a₂', dir: HEX_B }, { name: 'a₃', dir: normalize([-HEX_A[0], -HEX_A[1] - 1, 0]) }, { name: 'c', dir: [0, 0, 1] }]
    : [{ name: 'a', dir: [1, 0, 0] }, { name: 'b', dir: [0, 1, 0] }, { name: 'c', dir: [0, 0, 1] }];
}

/** @type {Vec3[]} */
export const CUBIC_ZONES = [[1, 0, 0], [0, 1, 0], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];

/** Richtung [uvw] als Teile für SVG-Text. @param {Richtung} v @param {boolean} hex4 */
export function dirParts(v, hex4) {
  /** @type {number[]} */
  const w = hex4 ? dirToFour(v) : v;
  const big = w.some((x) => Math.abs(x) > 9);
  /** @type {Teil[]} */
  const out = [{ t: '[', bar: false }];
  w.forEach((x, i) => { if (big && i) out.push({ t: ' ', bar: false }); out.push({ t: String(Math.abs(x)), bar: x < 0 }); });
  out.push({ t: ']', bar: false });
  return out;
}

/** @param {Palette} col */
export const ORBIT_COLORS = (col) => [col.accent, col.accent2, col.ax2, col.ax4, col.ax3, col.ax6];

/** Winkel zwischen zwei Flächennormalen (= Winkel zwischen den Polen). @param {Vec3} a @param {Vec3} b @returns {Winkel} */
export function angleOf(a, b) {
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return { a, b, deg: Math.acos(d) / deg };
}

/**
 * Szene einer Punktgruppe für buildSVG. env: { hitR } (Trefferradius in viewBox-Einheiten).
 * Gibt auch die Bahn des Pols in allgemeiner Lage und die gültige Auswahl (Werkzeug Winkel) zurück.
 * @param {Zustand} state @param {Palette} col @param {{ hitR?: number }} [env]
 */
export function pgScene(state, col, env = {}) {
  const info = buildPointGroup(state.pg.id);
  // Lage des Ausgangspols: auf einem Symmetrieelement fallen Bilder zusammen (spezielle Lage)
  const site = siteOf(state.pg.id, info, generalPole(state));
  const p0 = site.p;
  const orb = orbit(info.ops, p0);
  const distinct = distinctPoles(orb);
  // je Stelle zählt die erste Operation (Pol wird einmal gezeichnet); Bild und Spiegelbild an derselben Stelle: mixed
  for (const u of distinct) for (const k of u.ops) Object.assign(orb[k], { rep: k === u.op, mixed: u.mixed });
  // jedes Bild der Bahn gehört zu einer Stelle in distinct
  /** @param {number} k */
  const repOf = (k) => (orb[k] ? /** @type {typeof distinct[number]} */ (distinct.find((u) => u.ops.includes(k))).op : k);
  const axisAlongZ = info.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6);
  const classes = symmetryDirections(info);
  const polesOn = pgPolesOn(state);
  const sel = state.pg.tool && polesOn ? [...new Set(state.pgSel.filter((k) => k < orb.length).map(repOf))] : [];
  const pgAngle = sel.length === 2 ? angleOf(orb[sel[0]].p, orb[sel[1]].p) : null;
  // Farbe nach Blickrichtung (Position im vollen HM-Symbol) oder einheitlich schwarz wie in ITA
  /** @param {number | undefined} k */
  const dcol = (k) => (state.view.dirColors && k != null && k >= 0 ? col.dir[k] : null);
  const mirrorCls = /** @type {number[]} */ (info.mirrorCls); // gesetzt von symmetryDirections()
  const zMirror = info.mirrors.findIndex((n) => Math.abs(n[2]) > 1 - 1e-6);
  const scene = {
    col, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: /** @type {Grad} */ (state.view.wulffRot) },
    primitiveBold: state.pg.showElements && zMirror >= 0,
    primitiveColor: zMirror >= 0 ? dcol(mirrorCls[zMirror]) : null,
    mirrors: state.pg.showElements ? info.mirrors.map((n, i) => ({ n, color: dcol(mirrorCls[i]) })) : [],
    axes: state.pg.showElements ? info.axes.map((a) => ({ ...a, color: dcol(a.cls) })) : [],
    centreAtOrigin: state.pg.showElements && info.centro && !axisAlongZ,
    zones: state.pg.showElements && info.system === 'kubisch' ? CUBIC_ZONES : [],
    poles: polesOn ? distinct.map((u) => ({ p: u.p, det: u.det, idx: u.op, gen: u.op === 0, selected: sel.includes(u.op), color: u.mixed && state.pg.colorful ? col.muted : undefined })) : [],
    hitR: env.hitR ?? 13,
    arc: pgAngle ? { a: pgAngle.a, b: pgAngle.b, label: pgAngle.deg.toFixed(1) + '°' } : null,
    colorByDet: state.pg.colorful,
    showLower: true,
    axisLabels: state.view.axes ? crystalAxesFor(info.hex) : [],
  };
  return { info, p0, orb, distinct, site, classes, sel, pgAngle, scene };
}

/** Punktgruppen: Pole sichtbar (Objekt in allgemeiner Lage und Flächenpole eingeschaltet). @param {Zustand} state */
export const pgPolesOn = (state) => !!(state.pg.showObject && state.pg.showPoles !== false);
/** Kristallformen: Indizes sichtbar (nur mit Polen, Abschnitt „Kristallform“). @param {Zustand} state */
export const polyLabelsOn = (state) => !!(state.poly.labels && state.poly.showPoles !== false);

/** Gespeicherte Zonenschlüssel lageunabhängig machen und Doppelte entfernen. @param {string[]} keys */
export const normalizeZones = (keys) => [...new Set(keys.map((k) => zoneKey(/** @type {Richtung} */ (k.split(',').map(Number)))))];

/** Kristall des Zustands (Form oder Beispielkristall) mit Sichtbarkeit und Farben der Flächen. @param {Zustand} state @param {Palette} col */
export function polyCrystal(state, col) {
  const ex = currentExample(state);
  const C = /** @type {AppKristall} */ (buildCrystal(ex
    ? { groupId: ex.pg, forms: exForms(state, ex), lat: currentLat(state), broken: false, auxDist: state.poly.auxDist, presetId: state.poly.presetId }
    : breakModeOf(state) === 'free'
      ? { entryId: currentEntryId(state), lat: freeLat(state), broken: true, auxDist: state.poly.auxDist, presetId: state.poly.presetId }
      : { entryId: currentEntryId(state), lat: currentLat(state), broken: false, auxDist: state.poly.auxDist, presetId: state.poly.presetId, stretch: currentStretch(state) }));
  C.example = ex;
  const oc = ORBIT_COLORS(col);
  const multi = C.isReduced && C.orbitsMain.length > 1;
  C.faces.forEach((f) => {
    f.hidden = state.poly.open && f.role === 'aux';
    // Flächen eines Beispiels haben eine Formnummer, die der Hauptform eine Teilform
    const form = /** @type {number} */ (f.form), orbitNr = /** @type {number} */ (f.orbit);
    f.color2d = f.role === 'aux' ? col.muted : ex ? formColor(col, form) : multi ? oc[orbitNr % oc.length] : null;
    f.color3d = f.role === 'aux' ? col.crystal2 : ex ? formFill(col, form) : multi ? oc[orbitNr % oc.length] : col.crystal;
  });
  return C;
}

/**
 * Szene eines Kristalls für buildSVG. Die Auswahl (state.selected, state.zoneSel) muss zum Kristall passen.
 * Ergänzt C um zone, zoneClasses, selZones und angle (für Infobox und 3D-Ansicht).
 * env: { hitR, labelSize } in viewBox-Einheiten.
 * @param {Zustand} state @param {AppKristall} C @param {Palette} col @param {{ hitR?: number, labelSize?: number }} [env]
 */
export function polyScene(state, C, col, env = {}) {
  const hex4 = C.hex && state.poly.bravais;
  const two = state.zoneSel.length === 2;
  const zone = state.poly.tool === 'zone' && two ? zoneOf(C, state.zoneSel[0], state.zoneSel[1]) : null;
  C.zone = zone;
  // Zonenliste: alle Zonen des Kristalls (nur mit Werkzeug „Zone“) und die gewählten, je in eigener Farbe
  C.zoneClasses = state.poly.tool === 'zone' ? zonesOf(C) : [];
  C.selZones = state.poly.tool === 'zone'
    ? normalizeZones(state.poly.zones).map((k, i) => ({ ...zoneByUvw(C, /** @type {Richtung} */ (k.split(',').map(Number))), color: zoneColor(col, i) }))
    : [];
  /** @param {number} i */
  const zoneColorsOf = (i) => C.selZones.filter((z) => z.inZone.includes(i)).map((z) => z.color);
  const angle = state.poly.tool === 'angle' && two ? angleOf(C.faces[state.zoneSel[0]].normal, C.faces[state.zoneSel[1]].normal) : null;
  C.angle = angle;
  const fw = state.poly.frame ? C.framework : null;
  // Symmetriegerüst nach Blickrichtung färben (nicht bei erniedrigter Symmetrie: andere Gruppe, andere Aufstellung)
  /** @type {ReturnType<typeof symmetryDirections> | null} */
  let fwClasses = null;
  /** @type {number[]} */
  let fwMirrorCls = [];
  if (fw && state.view.dirColors && !C.isReduced) {
    /** @type {{ system: string, full: string, axes: Achse[], mirrors: Vec3[], mirrorCls?: number[] }} */
    const fwInfo = { system: C.sys, full: groupOf(C.groupId).full, axes: fw.axes, mirrors: fw.mirrors };
    fwClasses = symmetryDirections(fwInfo, (u) => mulVec(C.O, mulVec(C.A, u)));
    fwMirrorCls = /** @type {number[]} */ (fwInfo.mirrorCls); // gesetzt von symmetryDirections()
  }
  /** @param {number | undefined} k */
  const fcol = (k) => (fwClasses && k != null && k >= 0 ? col.dir[k] : null);
  const fwZ = fw ? fw.mirrors.findIndex((n) => Math.abs(n[2]) > 1 - 1e-6) : -1;
  const scene = {
    col: { ...col, mirror: col.ink }, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: /** @type {Grad} */ (state.view.wulffRot) },
    primitiveBold: !!fw && fwZ >= 0,
    primitiveColor: fwZ >= 0 && fwClasses ? fcol(fwMirrorCls[fwZ]) : null,
    mirrors: fw ? fw.mirrors.map((n, i) => ({ n, color: fwClasses ? fcol(fwMirrorCls[i]) : null })) : [],
    axes: fw ? fw.axes.map((a) => ({ ...a, color: fwClasses ? fcol(a.cls) : null })) : [],
    zones: fw && C.sys === 'kubisch' && !C.isReduced ? C.zones : [],
    faint: true,
    centreAtOrigin: !!fw && fw.centro && !fw.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6),
    poles: !state.poly.showPoles ? [] : /** @type {ScenePol[]} */ (C.faces.map((f, i) => (f.hidden ? null : {
      p: f.normal, det: 1, idx: i, color: f.color2d, aux: f.role === 'aux',
      label: polyLabelsOn(state) ? hklParts(f.hkl, hex4) : null, selected: state.selected === i || state.zoneSel.includes(i), zoneColors: zoneColorsOf(i),
    })).filter(Boolean)),
    showLower: state.poly.showLower,
    hitR: env.hitR ?? 13,
    labelSize: env.labelSize ?? 14.5,
    axisLabels: state.view.axes ? C.axes : [],
    zoneList: C.selZones.map((z) => ({ axis: z.axis, label: dirParts(z.uvw, hex4), color: z.color })),
    arc: angle ? { a: angle.a, b: angle.b, label: angle.deg.toFixed(1) + '°' } : null,
  };
  return { scene, fwClasses, hex4 };
}

// ------------------------------------------------------------------ Ansichten der 3D-Konstruktion
/**
 * Ansichten entlang der Blickrichtungen des Kristallsystems (Positionen im vollen Hermann-Mauguin-Symbol),
 * je Richtungsfamilie die Gitterrichtungen in bevorzugter Reihenfolge. Triklin hat keine Blickrichtung:
 * dort die Kristallachsen a, b, c (pos −1).
 */
/** @type {Record<string, { pos: number, fam?: string, uvw: Vec3[] }[]>} */
export const VIEW_FAMILIES = {
  triklin: [{ pos: -1, uvw: [[1, 0, 0]] }, { pos: -1, uvw: [[0, 1, 0]] }, { pos: -1, uvw: [[0, 0, 1]] }],
  monoklin: [{ pos: 0, uvw: [[1, 0, 0]] }, { pos: 1, uvw: [[0, 1, 0]] }, { pos: 2, uvw: [[0, 0, 1]] }],
  orthorhombisch: [{ pos: 0, uvw: [[1, 0, 0]] }, { pos: 1, uvw: [[0, 1, 0]] }, { pos: 2, uvw: [[0, 0, 1]] }],
  tetragonal: [{ pos: 0, fam: '[001]', uvw: [[0, 0, 1]] }, { pos: 1, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0]] }, { pos: 2, fam: '⟨110⟩', uvw: [[1, 1, 0], [1, -1, 0]] }],
  trigonal: [{ pos: 0, fam: '[001]', uvw: [[0, 0, 1]] }, { pos: 1, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0], [1, 1, 0]] }, { pos: 2, fam: '⟨210⟩', uvw: [[2, 1, 0], [1, 2, 0], [1, -1, 0]] }],
  kubisch: [
    { pos: 0, fam: '⟨100⟩', uvw: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
    { pos: 1, fam: '⟨111⟩', uvw: [[1, 1, 1], [1, -1, 1], [-1, 1, 1], [-1, -1, 1]] },
    { pos: 2, fam: '⟨110⟩', uvw: [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]] },
  ],
};
VIEW_FAMILIES.hexagonal = VIEW_FAMILIES.trigonal;

/**
 * Drei Ansichten für die 3D-Konstruktion: je Familie die Richtung parallel zur Projektionsrichtung
 * (Blick wie im Stereogramm), sonst eine senkrecht dazu (seitlicher Blick, Äquatorebene von der Kante),
 * sonst die erste. Der Betrachter sitzt auf der oberen Seite (Weltrichtung mit z ≥ 0).
 * toWorld: Gitterrichtung → Weltrichtung. Rückgabe: [{ pos, fam, uvw, dir (Einheitsvektor), along }],
 * along: 'proj' (∥ Projektionsrichtung), 'side' (⊥) oder null.
 * @param {string} system @param {(u: Richtung) => Vec3} toWorld
 */
export function viewDirections(system, toWorld) {
  const fams = VIEW_FAMILIES[system] || VIEW_FAMILIES.triklin;
  return fams.map((f) => {
    const cands = f.uvw.map((u) => ({ u, w: normalize(toWorld(/** @type {Richtung} */ (u))) }));
    const pick = cands.find((c) => Math.abs(c.w[2]) > 1 - 1e-6) || cands.find((c) => Math.abs(c.w[2]) < 1e-6) || cands[0];
    const flip = pick.w[2] < -1e-9;
    const uvw = /** @type {Vec3} */ (flip ? pick.u.map((x) => (x === 0 ? 0 : -x)) : pick.u);
    const dir = /** @type {Vec3} */ (flip ? pick.w.map((x) => -x) : pick.w);
    const along = Math.abs(dir[2]) > 1 - 1e-6 ? 'proj' : Math.abs(dir[2]) < 1e-6 ? 'side' : null;
    return { pos: f.pos, fam: f.fam || null, uvw, dir, along };
  });
}

/** Ansichten im Punktgruppenmodus (Welt = kartesisches Kristallsystem, c ∥ z). @param {Zustand} state */
export const pgViewDirections = (state) => viewDirections(groupOf(state.pg.id).system, latticeToCart(groupOf(state.pg.id).system));

/** Ansichten eines Kristalls (Welt = Bildschirmsystem der Lage: O·A). @param {Pick<Kristall, 'sys' | 'O' | 'A'>} C */
export const polyViewDirections = (C) => viewDirections(C.sys, (u) => mulVec(C.O, mulVec(C.A, u)));

// ------------------------------------------------------------------ Abbildungen aus Link-Adressen
// Skript und Quiz beschreiben eine Abbildung durch die Link-Adresse der App (z. B. "#m=form&…");
// daraus entsteht hier genau das Stereogramm, das die App für diese Adresse zeigt.

/** Zustand der App für eine Link-Adresse. @param {string} hash */
export function stateForHash(hash) {
  const st = createState();
  applyHashTo(st, hash, createState());
  st.poly.zones = normalizeZones(st.poly.zones);
  return st;
}

/** Szene des Stereogramms (für buildSVG) zu einer Link-Adresse. dirs = [1, 3]: im Punktgruppenmodus nur die
 *  Symmetrieelemente dieser Blickrichtungen (1. bis 3. Position im HM-Symbol).
 * @param {string} hash @param {Palette} col @param {number[] | null} [dirs]
 * @returns {{ st: Zustand, C?: AppKristall, scene: import('./stereogram.js').Szene }}
 */
export function stereoForHash(hash, col, dirs = null) {
  const st = stateForHash(hash);
  if (st.mode === 'pg') {
    const { info, scene } = pgScene(st, col);
    if (dirs) {
      const d = dirs;
      const mcls = /** @type {number[]} */ (info.mirrorCls); // gesetzt von symmetryDirections()
      /** @param {number | undefined} k */
      const keep = (k) => d.includes(/** @type {number} */ (k) + 1);
      scene.axes = scene.axes.filter((a) => keep(a.cls));
      scene.mirrors = scene.mirrors.filter((m, i) => keep(mcls[i]));
      const zm = info.mirrors.findIndex((n) => Math.abs(n[2]) > 1 - 1e-6);
      if (zm >= 0 && !keep(mcls[zm])) scene.primitiveBold = false;
      scene.centreAtOrigin = false;
      scene.zones = [];
    }
    return { st, scene };
  }
  const C = polyCrystal(st, col);
  return { st, C, scene: polyScene(st, C, col).scene };
}
