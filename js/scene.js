// Gemeinsamer Kern von App (main.js) und Skript (skript.js): Zustand, Link-Adresse, Farben und die
// Szenen für das Stereogramm (buildSVG). Ohne Zugriff auf Bedienelemente; die App setzt die Auswahl,
// das Skript erzeugt aus einer Link-Adresse dieselbe Abbildung wie die App.

import { POINT_GROUPS, buildPointGroup, orbit, symmetryDirections, HEX_A, HEX_B } from './pointgroups.js';
import {
  buildCrystal, zoneOf, zoneByUvw, zoneKey, zonesOf, dirToFour, orientationPresets, LATTICE_DEFAULTS, SYSTEM_OF,
  STRETCH_DIRS, stretchDir, constrainLattice, latticeFromParams, stretchLattice, paramsOfLattice,
} from './polyhedra.js';
import { CATALOG, formEig, entryById } from './forms.js';
import { hklParts } from './format.js';
import { normalize, mulVec } from './linalg.js';
import { exampleById } from './examples.js';

const deg = Math.PI / 180;

// ------------------------------------------------------------------ Zustand
/** Startzustand der App (auch Grundlage jeder Link-Adresse). */
export function createState() {
  return {
    mode: 'pg',
    pg: { id: 'mm2', monoAxis: 'b', famPref: {}, showElements: true, showObject: true, theta: 59, phi: 75.5, colorful: false, hideDirs: [], tool: null },
    poly: {
      system: 'kubisch', entryBySys: {}, presetId: '001', lats: {}, broken: false, open: false, auxDist: 1,
      size: 0.75, labels: true, showLower: true, bravais: false, frame: false, faceSym: false, tool: null,
      example: null, exScale: {}, // Beispielkristall und Faktoren der Formabstände
      zones: [], // gewählte Zonen (Werkzeug „Zone“) als 'u,v,w'
      // Symmetrie brechen (broken): Art 'stretch' (Streckung entlang einer Blickrichtung, bezogen auf das
      // unverzerrte Gitter lats) oder 'free' (alle Gitterparameter frei, eigenes Gitter freeLats)
      breakMode: 'stretch', freeLats: {},
      stretch: { dir: '', s: 1 }, // Streckung: Kennung aus STRETCH_DIRS, Faktor
    },
    view: { dirColors: true, wulff: false, wulffRot: 0, axes: false, sphere: true, plane: true, rays: true, normals: true },
    selected: null,
    zoneSel: [],
    pgSel: [], // Punktgruppenmodus: gewählte Pole (Werkzeug Winkel)
    fig: 'stereo', // Telefon: sichtbare Tafel
  };
}

// Azimut und Poldistanz (siehe main.js)
/** Umrechnung aus der Zählung bis v1.0.0 (ab ↓, Gegenuhrzeigersinn). */
export const phiFromOld = (p) => ((((90 - p) % 360) + 360) % 360);
// Poldistanz ρ wie bei Borchardt-Ott (Abschn. 5.6): obere Halbkugel vom Nordpol (0 … 90°), untere vom Südpol
// mit negativem Vorzeichen (−90 … 0°). Intern bleibt theta der Winkel zum Nordpol (0 … 180°).
export const rhoOf = (theta) => (theta > 90 + 1e-9 ? theta - 180 : theta);
export const thetaOf = (rho) => (rho < 0 ? 180 + rho : rho);
/** ρ als Text mit echtem Minuszeichen. */
export const rhoText = (theta, digits) => (theta > 90 + 1e-9 ? '−' : '') + Math.abs(rhoOf(theta)).toFixed(digits) + '°';

// ------------------------------------------------------------------ Farben aus CSS-Tokens
export function palette() {
  const cs = getComputedStyle(document.documentElement);
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
/** Farbe der i-ten Form eines Beispielkristalls (Pol) bzw. ihrer Flächen in 3D (aufgehellt). */
export const formColor = (col, i) => col.form[i % col.form.length];
export function mixHex(a, b, t) {
  const p = (h) => { const x = h.replace('#', ''); const f = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((k) => parseInt(f.slice(k, k + 2), 16)); };
  try {
    const A = p(a), Bc = p(b);
    return '#' + A.map((v, k) => Math.round(v + (Bc[k] - v) * t).toString(16).padStart(2, '0')).join('');
  } catch { return a; }
}
export const formFill = (col, i) => mixHex(formColor(col, i), col.paper, 0.38);
/** Farbe der i-ten gewählten Zone: zuerst die Formfarben, danach weitere Farbtöne, keine Wiederholung. */
export function zoneColor(col, i) {
  if (i < col.form.length) return col.form[i];
  const dark = (() => { const x = col.paper.replace('#', ''); return x.length >= 6 && parseInt(x.slice(0, 2), 16) + parseInt(x.slice(2, 4), 16) + parseInt(x.slice(4, 6), 16) < 384; })();
  // zuerst Farbtöne, die die Formfarben nicht belegen (Grün, Violett, Gold, Himmelblau …), danach goldener Winkel
  const GAPS = [125, 265, 45, 195, 290, 95, 345, 235];
  const j = i - col.form.length;
  const h = j < GAPS.length ? GAPS[j] : (GAPS[0] + j * 137.508) % 360, sat = 0.6, l = dark ? 0.66 : 0.4;
  const f = (n) => { const k = (n + h / 30) % 12; const c = l - sat * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
export const FONT = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

// ------------------------------------------------------------------ Kristallformen und Beispiele
export const groupOf = (id) => POINT_GROUPS.find((g) => g.id === id);
export const DEFAULT_ENTRY = {
  triklin: '-1:a2', monoklin: '2/mb:c6', orthorhombisch: 'mmm:g7', tetragonal: '4/mmm:f14',
  trigonal: '-3m1:c21', hexagonal: '6/mmm:e31', kubisch: 'm-3m:b35',
};
export const EIG_SAME = { '-62m': '-6m2', '-4m2': '-42m' };
export const groupOrder = new Map();
export function formListed(state, e) {
  if (state.poly.faceSym) return true;
  const g = groupOf(e.pg);
  if (!groupOrder.has(g.id)) groupOrder.set(g.id, buildPointGroup(g.id).order);
  const norm = (s) => EIG_SAME[s] || s;
  return e.mult === groupOrder.get(g.id) || norm(formEig(e)) === norm(g.hm);
}
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
/** Beispielkristall (nur gültig, solange sein Kristallsystem gewählt ist). */
export const currentExample = (state) => {
  const ex = exampleById(state.poly.example);
  return ex && ex.sys === state.poly.system ? ex : null;
};
export const exFactors = (state, ex) => {
  const f = state.poly.exScale[ex.id];
  return ex.forms.map((_, i) => (Array.isArray(f) && Number.isFinite(f[i]) ? f[i] : 1));
};
/** Formen des Beispiels mit den eingestellten Abständen (die erste Form ist die Bezugsform). */
export const exForms = (state, ex) => {
  const fs = exFactors(state, ex);
  return ex.forms.map((f, i) => (f.t != null ? { hkl: f.hkl, t: f.t * fs[i] } : { hkl: f.hkl, r: f.r * fs[i] }));
};
/**
 * Art des Symmetriebruchs: null (Symmetrie bleibt), 'stretch' oder 'free'. Ohne Streckrichtung im System
 * (orthorhombisch, monoklin, triklin) gibt es nur 'free'. Beispielkristalle: kein Symmetriebruch.
 */
export function breakModeOf(state) {
  if (!state.poly.broken || currentExample(state)) return null;
  if (!STRETCH_DIRS[state.poly.system].length) return 'free';
  return state.poly.breakMode === 'free' ? 'free' : 'stretch';
}
/** Eingestellte Streckung { id, uvw, cls, s } im Modus 'stretch' (auch bei s = 1), sonst null. */
export function stretchSetting(state) {
  if (breakModeOf(state) !== 'stretch') return null;
  const d = stretchDir(state.poly.system, state.poly.stretch && state.poly.stretch.dir);
  return d ? { ...d, s: state.poly.stretch.s } : null;
}
/** Wirksame Streckung (s ≠ 1) oder null. */
export function currentStretch(state) {
  const st = stretchSetting(state);
  return st && Math.abs(st.s - 1) > 1e-9 ? st : null;
}
/** Gitter im Modus „alle frei“ (Startwert: unverzerrtes Gitter). */
export const freeLat = (state) => {
  const sys = state.poly.system;
  if (!state.poly.freeLats || typeof state.poly.freeLats !== 'object') state.poly.freeLats = {};
  if (!state.poly.freeLats[sys]) state.poly.freeLats[sys] = constrainLattice(currentLat(state), sys);
  return state.poly.freeLats[sys];
};
/** Wirksame Gitterparameter (was die Gitterregler zeigen). */
export function effectiveLat(state) {
  const sys = state.poly.system;
  const mode = breakModeOf(state);
  if (mode === 'free') return { ...freeLat(state) };
  const base = constrainLattice(currentLat(state), sys);
  const st = currentStretch(state);
  return st ? paramsOfLattice(stretchLattice(latticeFromParams(base), st.uvw, st.s)) : base;
}
export const currentLat = (state) => {
  const sys = state.poly.system;
  if (!state.poly.lats[sys]) state.poly.lats[sys] = { ...LATTICE_DEFAULTS[sys] };
  return state.poly.lats[sys];
};

// ------------------------------------------------------------------ Zustand in der URL
export const B = (v) => (v ? '1' : '0');
export const isOn = (s) => s === '1' || s === 'ja' || s === 'true';
export const num = (s, lo, hi) => { const x = Number(s); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
export const URL_VIEW = [
  ['farbe', 'dirColors'], ['wulff', 'wulff'], ['achsen', 'axes'], ['kugel', 'sphere'], ['ebene', 'plane'], ['strahlen', 'rays'], ['normalen', 'normals'],
];
export const URL_PG = [['el', 'showElements'], ['obj', 'showObject'], ['hand', 'colorful']];
export const URL_FORM = [['br', 'broken'], ['offen', 'open'], ['idx', 'labels'], ['unten', 'showLower'], ['hkil', 'bravais'], ['geruest', 'frame'], ['muster', 'faceSym']];
export const LAT_KEYS = ['ba', 'ca', 'al', 'be', 'ga'];
export const TOOL_NAMES = { zone: 'zone', angle: 'winkel' };
export const TOOL_IDS = { zone: 'zone', winkel: 'angle' };

/** Link-Adresse (Hash) eines Zustands; nur Abweichungen vom Startzustand DEFAULTS. */
export function hashOf(state, DEFAULTS) {
  const q = new URLSearchParams();
  const d = DEFAULTS;
  const bools = (list, obj, def) => { for (const [k, key] of list) if (!!obj[key] !== !!def[key]) q.set(k, B(obj[key])); };
  if (state.mode === 'pg') {
    q.set('m', 'pg');
    q.set('g', state.pg.id);
    // volle Genauigkeit (auf 10⁻⁴° gekürzt), damit ein Link die Pole nicht verschiebt
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
    if (state.poly.presetId !== orientationPresets(sys)[0].id) q.set('lage', state.poly.presetId);
    // Gitter: im Modus „alle frei“ das freie Gitter, sonst das unverzerrte (mit Streckung str=Richtung,Faktor)
    const mode = breakModeOf(state);
    const lat = mode === 'free' ? freeLat(state) : constrainLattice(currentLat(state), sys);
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
  return '#' + q.toString().replace(/%2F/g, '/').replace(/%2C/g, ',').replace(/%3A/g, ':').replace(/%3B/g, ';');
}

/** Wendet einen Hash auf den Startzustand an. Gibt false zurück, wenn kein brauchbarer Hash vorliegt. */
export function applyHashTo(state, hash, DEFAULTS) {
  const q = new URLSearchParams(hash.replace(/^#/, ''));
  if (!q.has('m')) return false;
  // Darstellung und der Bereich des verlinkten Modus starten vom Startzustand (der Link ist vollständig);
  // der andere Modus behält den gespeicherten Zustand.
  const clone = (o) => JSON.parse(JSON.stringify(o));
  state.view = clone(DEFAULTS.view);
  if (q.get('m') === 'form') state.poly = clone(DEFAULTS.poly);
  else state.pg = { ...clone(DEFAULTS.pg), famPref: state.pg.famPref || {} };
  const bools = (list, obj) => { for (const [k, key] of list) if (q.has(k)) obj[key] = isOn(q.get(k)); };
  if (q.get('m') === 'form') {
    state.mode = 'poly';
    const sys = q.get('sys');
    if (sys && Object.prototype.hasOwnProperty.call(LATTICE_DEFAULTS, sys)) state.poly.system = sys;
    if (q.has('f')) state.poly.entryBySys[state.poly.system] = q.get('f');
    const ex = exampleById(q.get('bsp'));
    if (ex && ex.sys === state.poly.system) {
      state.poly.example = ex.id;
      if (q.has('ab')) state.poly.exScale[ex.id] = q.get('ab').split(',').map((x) => num(x, 0.5, 2) ?? 1);
    }
    if (q.has('lage')) state.poly.presetId = q.get('lage');
    const lat = { ...LATTICE_DEFAULTS[state.poly.system], ...(ex && ex.sys === state.poly.system ? ex.lat : {}) };
    for (const k of LAT_KEYS) {
      if (!q.has(k)) continue;
      const v = k === 'ba' || k === 'ca' ? num(q.get(k), 0.25, 3) : num(q.get(k), 60, 150);
      if (v != null) lat[k] = v;
    }
    bools(URL_FORM, state.poly);
    // str=<Richtung>,<Faktor>, z. B. str=111,1.3 (Richtung als Gitterrichtung ohne Klammern): Symmetrie
    // brechen durch Streckung (auch ohne br=1, Links aus v1.4.0). Nur ohne Beispielkristall; ungültige
    // Richtung oder Faktor ausserhalb 0,5 … 2: keine Streckung.
    let stretched = false;
    if (q.has('str') && !state.poly.example) {
      const [id, f] = q.get('str').split(',');
      const s = f != null && f.trim() !== '' ? Number(f) : NaN;
      if (STRETCH_DIRS[state.poly.system].some((x) => x.id === id) && s >= 0.5 && s <= 2) {
        state.poly.stretch = { dir: id, s };
        state.poly.broken = true;
        stretched = true;
      }
    }
    // br=1 ohne gültige Streckung: alle Gitterparameter frei (Links bis v1.4.0 meinen genau das)
    const sysNow = state.poly.system;
    if (state.poly.broken && !state.poly.example && !stretched) {
      state.poly.breakMode = 'free';
      state.poly.freeLats = { [sysNow]: lat };
    } else state.poly.breakMode = 'stretch';
    state.poly.lats[sysNow] = constrainLattice(lat, sysNow);
    if (q.has('abstand')) state.poly.auxDist = num(q.get('abstand'), 0.3, 3) ?? state.poly.auxDist;
    if (q.has('gr')) state.poly.size = num(q.get('gr'), 0.3, 1.2) ?? state.poly.size;
    state.poly.tool = TOOL_IDS[q.get('w')] || null;
    if (q.has('zonen')) state.poly.zones = q.get('zonen').split(';').filter((k) => /^-?\d+,-?\d+,-?\d+$/.test(k) && k !== '0,0,0');
  } else {
    state.mode = 'pg';
    if (POINT_GROUPS.some((g) => g.id === q.get('g'))) state.pg.id = q.get('g');
    // rho nach Borchardt-Ott (untere Halbkugel negativ); Werte über 90° aus Links bis v1.0.0 gelten weiter
    if (q.has('rho')) { const r = num(q.get('rho'), -90, 180); if (r != null) state.pg.theta = thetaOf(r); }
    // az: Azimut nach Borchardt-Ott (ab →, im Uhrzeigersinn); phi: alte Zählung bis v1.0.0 (ab ↓, Gegenuhrzeigersinn)
    if (q.has('az')) { const p = num(q.get('az'), -1e6, 1e6); if (p != null) state.pg.phi = ((p % 360) + 360) % 360; }
    else if (q.has('phi')) { const p = num(q.get('phi'), -1e6, 1e6); if (p != null) state.pg.phi = phiFromOld(p); }
    bools(URL_PG, state.pg);
    if (q.has('aus')) state.pg.hideDirs = q.get('aus').split(',').map((s) => Number(s) - 1).filter((k) => k >= 0 && k <= 2);
    state.pg.tool = q.get('w') === 'winkel' ? 'angle' : null;
  }
  bools(URL_VIEW, state.view);
  if (q.has('netz')) state.view.wulffRot = num(q.get('netz'), 0, 180) ?? 0;
  return true;
}

// ------------------------------------------------------------------ Szenen
export function generalPole(state) {
  // φ ab b (→, y) im Uhrzeigersinn, d. h. zur a-Achse (↓, x) hin
  const t = state.pg.theta * deg, p = state.pg.phi * deg;
  return [Math.sin(t) * Math.sin(p), Math.sin(t) * Math.cos(p), Math.cos(t)];
}

export function crystalAxesFor(hex) {
  return hex
    ? [{ name: 'a₁', dir: HEX_A }, { name: 'a₂', dir: HEX_B }, { name: 'a₃', dir: normalize([-HEX_A[0], -HEX_A[1] - 1, 0]) }, { name: 'c', dir: [0, 0, 1] }]
    : [{ name: 'a', dir: [1, 0, 0] }, { name: 'b', dir: [0, 1, 0] }, { name: 'c', dir: [0, 0, 1] }];
}

export const CUBIC_ZONES = [[1, 0, 0], [0, 1, 0], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];

/** Richtung [uvw] als Teile für SVG-Text. */
export function dirParts(v, hex4) {
  const w = hex4 ? dirToFour(v) : v;
  const big = w.some((x) => Math.abs(x) > 9);
  const out = [{ t: '[', bar: false }];
  w.forEach((x, i) => { if (big && i) out.push({ t: ' ', bar: false }); out.push({ t: String(Math.abs(x)), bar: x < 0 }); });
  out.push({ t: ']', bar: false });
  return out;
}

export const ORBIT_COLORS = (col) => [col.accent, col.accent2, col.ax2, col.ax4, col.ax3, col.ax6];

/** Winkel zwischen zwei Flächennormalen (= Winkel zwischen den Polen). */
export function angleOf(a, b) {
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return { a, b, deg: Math.acos(d) / deg };
}

/**
 * Szene einer Punktgruppe für buildSVG. env: { hitR } (Trefferradius in viewBox-Einheiten).
 * Gibt auch die Bahn des Pols in allgemeiner Lage und die gültige Auswahl (Werkzeug Winkel) zurück.
 */
export function pgScene(state, col, env = {}) {
  const info = buildPointGroup(state.pg.id);
  const p0 = generalPole(state);
  const orb = orbit(info.ops, p0);
  const axisAlongZ = info.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6);
  const classes = symmetryDirections(info);
  const sel = state.pg.tool && state.pg.showObject ? state.pgSel.filter((k) => k < orb.length) : [];
  const pgAngle = sel.length === 2 ? angleOf(orb[sel[0]].p, orb[sel[1]].p) : null;
  // Farbe nach Blickrichtung (Position im vollen HM-Symbol) oder einheitlich schwarz wie in ITA
  const dcol = (k) => (state.view.dirColors && k >= 0 ? col.dir[k] : null);
  const zMirror = info.mirrors.findIndex((n) => Math.abs(n[2]) > 1 - 1e-6);
  const scene = {
    col, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: state.view.wulffRot },
    primitiveBold: state.pg.showElements && zMirror >= 0,
    primitiveColor: zMirror >= 0 ? dcol(info.mirrorCls[zMirror]) : null,
    mirrors: state.pg.showElements ? info.mirrors.map((n, i) => ({ n, color: dcol(info.mirrorCls[i]) })) : [],
    axes: state.pg.showElements ? info.axes.map((a) => ({ ...a, color: dcol(a.cls) })) : [],
    centreAtOrigin: state.pg.showElements && info.centro && !axisAlongZ,
    zones: state.pg.showElements && info.system === 'kubisch' ? CUBIC_ZONES : [],
    poles: state.pg.showObject ? orb.map((o, i) => ({ p: o.p, det: o.det, idx: i, gen: i === 0, selected: sel.includes(i) })) : [],
    hitR: env.hitR ?? 13,
    arc: pgAngle ? { a: pgAngle.a, b: pgAngle.b, label: pgAngle.deg.toFixed(1) + '°' } : null,
    colorByDet: state.pg.colorful,
    showLower: true,
    axisLabels: state.view.axes ? crystalAxesFor(info.hex) : [],
  };
  return { info, p0, orb, classes, sel, pgAngle, scene };
}

/** Gespeicherte Zonenschlüssel lageunabhängig machen und Doppelte entfernen. */
export const normalizeZones = (keys) => [...new Set(keys.map((k) => zoneKey(k.split(',').map(Number))))];

/** Kristall des Zustands (Form oder Beispielkristall) mit Sichtbarkeit und Farben der Flächen. */
export function polyCrystal(state, col) {
  const ex = currentExample(state);
  const C = buildCrystal(ex
    ? { groupId: ex.pg, forms: exForms(state, ex), lat: currentLat(state), broken: false, auxDist: state.poly.auxDist, presetId: state.poly.presetId }
    : breakModeOf(state) === 'free'
      ? { entryId: currentEntryId(state), lat: freeLat(state), broken: true, auxDist: state.poly.auxDist, presetId: state.poly.presetId }
      : { entryId: currentEntryId(state), lat: currentLat(state), broken: false, auxDist: state.poly.auxDist, presetId: state.poly.presetId, stretch: currentStretch(state) });
  C.example = ex;
  const oc = ORBIT_COLORS(col);
  const multi = C.isReduced && C.orbitsMain.length > 1;
  C.faces.forEach((f) => {
    f.hidden = state.poly.open && f.role === 'aux';
    f.color2d = f.role === 'aux' ? col.muted : ex ? formColor(col, f.form) : multi ? oc[f.orbit % oc.length] : null;
    f.color3d = f.role === 'aux' ? col.crystal2 : ex ? formFill(col, f.form) : multi ? oc[f.orbit % oc.length] : col.crystal;
  });
  return C;
}

/**
 * Szene eines Kristalls für buildSVG. Die Auswahl (state.selected, state.zoneSel) muss zum Kristall passen.
 * Ergänzt C um zone, zoneClasses, selZones und angle (für Infobox und 3D-Ansicht).
 * env: { hitR, labelSize } in viewBox-Einheiten.
 */
export function polyScene(state, C, col, env = {}) {
  const hex4 = C.hex && state.poly.bravais;
  const two = state.zoneSel.length === 2;
  const zone = state.poly.tool === 'zone' && two ? zoneOf(C, state.zoneSel[0], state.zoneSel[1]) : null;
  C.zone = zone;
  // Zonenliste: alle Zonen des Kristalls (nur mit Werkzeug „Zone“) und die gewählten, je in eigener Farbe
  C.zoneClasses = state.poly.tool === 'zone' ? zonesOf(C) : [];
  C.selZones = state.poly.tool === 'zone'
    ? normalizeZones(state.poly.zones).map((k, i) => ({ ...zoneByUvw(C, k.split(',').map(Number)), color: zoneColor(col, i) }))
    : [];
  const zoneColorsOf = (i) => C.selZones.filter((z) => z.inZone.includes(i)).map((z) => z.color);
  const angle = state.poly.tool === 'angle' && two ? angleOf(C.faces[state.zoneSel[0]].normal, C.faces[state.zoneSel[1]].normal) : null;
  C.angle = angle;
  const fw = state.poly.frame ? C.framework : null;
  // Symmetriegerüst nach Blickrichtung färben (nicht bei erniedrigter Symmetrie: andere Gruppe, andere Aufstellung)
  let fwClasses = null, fwMirrorCls = [];
  if (fw && state.view.dirColors && !C.isReduced) {
    const fwInfo = { system: C.sys, full: groupOf(C.groupId).full, axes: fw.axes, mirrors: fw.mirrors };
    fwClasses = symmetryDirections(fwInfo, (u) => mulVec(C.O, mulVec(C.A, u)));
    fwMirrorCls = fwInfo.mirrorCls;
  }
  const fcol = (k) => (fwClasses && k >= 0 ? col.dir[k] : null);
  const fwZ = fw ? fw.mirrors.findIndex((n) => Math.abs(n[2]) > 1 - 1e-6) : -1;
  const scene = {
    col: { ...col, mirror: col.ink }, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: state.view.wulffRot },
    primitiveBold: !!fw && fwZ >= 0,
    primitiveColor: fwZ >= 0 && fwClasses ? fcol(fwMirrorCls[fwZ]) : null,
    mirrors: fw ? fw.mirrors.map((n, i) => ({ n, color: fwClasses ? fcol(fwMirrorCls[i]) : null })) : [],
    axes: fw ? fw.axes.map((a) => ({ ...a, color: fwClasses ? fcol(a.cls) : null })) : [],
    zones: fw && C.sys === 'kubisch' && !C.isReduced ? C.zones : [],
    faint: true,
    centreAtOrigin: !!fw && fw.centro && !fw.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6),
    poles: C.faces.map((f, i) => (f.hidden ? null : {
      p: f.normal, det: 1, idx: i, color: f.color2d, aux: f.role === 'aux',
      label: state.poly.labels ? hklParts(f.hkl, hex4) : null, selected: state.selected === i || state.zoneSel.includes(i), zoneColors: zoneColorsOf(i),
    })).filter(Boolean),
    showLower: state.poly.showLower,
    hitR: env.hitR ?? 13,
    labelSize: env.labelSize ?? 14.5,
    axisLabels: state.view.axes ? C.axes : [],
    zoneList: C.selZones.map((z) => ({ axis: z.axis, label: dirParts(z.uvw, hex4), color: z.color })),
    arc: angle ? { a: angle.a, b: angle.b, label: angle.deg.toFixed(1) + '°' } : null,
  };
  return { scene, fwClasses, hex4 };
}
