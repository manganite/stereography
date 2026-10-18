// Steuerung der App: Zustand, Bedienelemente, Verknüpfung von Stereogramm und 3D-Ansicht.

import {
  POINT_GROUPS, SYSTEMS, buildPointGroup, orbit, elementSummary, symmetryDirections, HEX_A, HEX_B,
} from './pointgroups.js';
import {
  buildCrystal, habitOf, zoneOf, dirToFour, orientationPresets, LATTICE_DEFAULTS, FREE_PARAMS, constrainLattice, SYSTEM_OF, isHexSystem, auxFormName,
} from './polyhedra.js';
import { CATALOG, formName, formEig, entryById, FORM_TYPES } from './forms.js';
import { buildSVG, unproject, project, symbolIcon, C } from './stereogram.js';
import { hmHTML, hmText, hklParts, hklHTML, indices } from './format.js';
import { cross, normalize, mulVec } from './linalg.js';
import { View3D } from './view3d.js';
import { EXAMPLES, exampleById } from './examples.js';

const $ = (id) => document.getElementById(id);
const deg = Math.PI / 180;
const coarse = window.matchMedia('(pointer: coarse)');
/** viewBox-Einheiten pro CSS-Pixel des Stereogramms. */
const svgUnit = () => { const w = $('stereo').getBoundingClientRect().width; return w > 0 ? 520 / w : 1; };
/** Trefferradius in viewBox-Einheiten: mit Finger mindestens 22 px (44 px Durchmesser). */
const touchRadius = (minUnits, px) => (coarse.matches ? Math.max(minUnits, px * svgUnit()) : minUnits);

// ------------------------------------------------------------------ Zustand
const state = {
  mode: 'pg',
  pg: { id: 'mm2', monoAxis: 'b', famPref: {}, showElements: true, showObject: true, theta: 59, phi: 14.5, colorful: false, hideDirs: [], tool: null },
  poly: {
    system: 'kubisch', entryBySys: {}, presetId: '001', lats: {}, broken: false, open: false, auxDist: 1,
    size: 0.75, labels: true, showLower: true, bravais: false, frame: false, faceSym: false, tool: null,
    example: null, exScale: {}, // Beispielkristall und Faktoren der Formabstände
  },
  view: { dirColors: true, wulff: false, wulffRot: 0, axes: false, sphere: true, plane: true, rays: true, normals: true },
  selected: null,
  zoneSel: [],
  pgSel: [], // Punktgruppenmodus: gewählte Pole (Werkzeug Winkel)
  fig: 'stereo', // Telefon: sichtbare Tafel
};
const DEFAULTS = JSON.parse(JSON.stringify(state));

// ------------------------------------------------------------------ Zustand in der URL
// Lesbarer Hash, z. B. #m=pg&g=4/mmm&rho=59 oder #m=form&sys=kubisch&f=m-3m:b35&w=winkel.
// Nur Abweichungen vom Startzustand werden geschrieben; ein Link stellt genau diese Ansicht her.
const B = (v) => (v ? '1' : '0');
const isOn = (s) => s === '1' || s === 'ja' || s === 'true';
const num = (s, lo, hi) => { const x = Number(s); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
const URL_VIEW = [
  ['farbe', 'dirColors'], ['wulff', 'wulff'], ['achsen', 'axes'], ['kugel', 'sphere'], ['ebene', 'plane'], ['strahlen', 'rays'], ['normalen', 'normals'],
];
const URL_PG = [['el', 'showElements'], ['obj', 'showObject'], ['hand', 'colorful']];
const URL_FORM = [['br', 'broken'], ['offen', 'open'], ['idx', 'labels'], ['unten', 'showLower'], ['hkil', 'bravais'], ['geruest', 'frame'], ['muster', 'faceSym']];
const LAT_KEYS = ['ba', 'ca', 'al', 'be', 'ga'];
const TOOL_NAMES = { zone: 'zone', angle: 'winkel' };
const TOOL_IDS = { zone: 'zone', winkel: 'angle' };

function stateToHash() {
  const q = new URLSearchParams();
  const d = DEFAULTS;
  const bools = (list, obj, def) => { for (const [k, key] of list) if (!!obj[key] !== !!def[key]) q.set(k, B(obj[key])); };
  if (state.mode === 'pg') {
    q.set('m', 'pg');
    q.set('g', state.pg.id);
    // volle Genauigkeit (auf 10⁻⁴° gekürzt), damit ein Link die Pole nicht verschiebt
    const exact = (x) => String(Number(x.toFixed(4)));
    if (Math.abs(state.pg.theta - d.pg.theta) > 1e-6) q.set('rho', exact(state.pg.theta));
    if (Math.abs(state.pg.phi - d.pg.phi) > 1e-6) q.set('phi', exact(state.pg.phi));
    bools(URL_PG, state.pg, d.pg);
    if (state.pg.hideDirs.length) q.set('aus', state.pg.hideDirs.map((k) => k + 1).join(','));
    if (state.pg.tool) q.set('w', TOOL_NAMES[state.pg.tool]);
  } else {
    q.set('m', 'form');
    const sys = state.poly.system;
    q.set('sys', sys);
    const ex = currentExample();
    if (ex) {
      q.set('bsp', ex.id);
      const fs = exFactors(ex);
      if (fs.some((x) => Math.abs(x - 1) > 1e-6)) q.set('ab', fs.map((x) => String(Math.round(x * 100) / 100)).join(','));
    } else q.set('f', currentEntryId());
    if (state.poly.presetId !== orientationPresets(sys)[0].id) q.set('lage', state.poly.presetId);
    const lat = currentLat(), l0 = { ...LATTICE_DEFAULTS[sys], ...(ex ? ex.lat : {}) };
    for (const k of LAT_KEYS) if (Math.abs(lat[k] - l0[k]) > 1e-6) q.set(k, String(Math.round(lat[k] * 100) / 100));
    bools(URL_FORM, state.poly, d.poly);
    if (Math.abs(state.poly.auxDist - d.poly.auxDist) > 1e-6) q.set('abstand', String(state.poly.auxDist));
    if (Math.abs(state.poly.size - d.poly.size) > 1e-6) q.set('gr', String(state.poly.size));
    if (state.poly.tool) q.set('w', TOOL_NAMES[state.poly.tool]);
  }
  bools(URL_VIEW, state.view, d.view);
  if (state.view.wulff && state.view.wulffRot) q.set('netz', String(state.view.wulffRot));
  return '#' + q.toString().replace(/%2F/g, '/').replace(/%2C/g, ',').replace(/%3A/g, ':');
}

/** Wendet einen Hash auf den Startzustand an. Gibt false zurück, wenn kein brauchbarer Hash vorliegt. */
function applyHash(hash) {
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
    state.poly.lats[state.poly.system] = lat;
    bools(URL_FORM, state.poly);
    if (q.has('abstand')) state.poly.auxDist = num(q.get('abstand'), 0.3, 3) ?? state.poly.auxDist;
    if (q.has('gr')) state.poly.size = num(q.get('gr'), 0.3, 1.2) ?? state.poly.size;
    state.poly.tool = TOOL_IDS[q.get('w')] || null;
  } else {
    state.mode = 'pg';
    if (POINT_GROUPS.some((g) => g.id === q.get('g'))) state.pg.id = q.get('g');
    if (q.has('rho')) state.pg.theta = num(q.get('rho'), 0, 180) ?? state.pg.theta;
    if (q.has('phi')) { const p = num(q.get('phi'), -1e6, 1e6); if (p != null) state.pg.phi = ((p % 360) + 360) % 360; }
    bools(URL_PG, state.pg);
    if (q.has('aus')) state.pg.hideDirs = q.get('aus').split(',').map((s) => Number(s) - 1).filter((k) => k >= 0 && k <= 2);
    state.pg.tool = q.get('w') === 'winkel' ? 'angle' : null;
  }
  bools(URL_VIEW, state.view);
  if (q.has('netz')) state.view.wulffRot = num(q.get('netz'), 0, 180) ?? 0;
  return true;
}

let lastHash = '';
// Ohne Hash geöffnet (oder nach „Alle Einstellungen zurücksetzen“): Adresse bleibt ohne Hash,
// bis etwas geändert wird. „Link kopieren“ erzeugt trotzdem immer einen vollständigen Link.
let hashActive = location.hash.length > 1;
let baseHash = null; // Zustand beim ersten Speichern; erst eine Abweichung davon schreibt den Hash
try {
  const saved = JSON.parse(localStorage.getItem('stereo-state') || 'null');
  if (saved && (saved.v === 2 || saved.v === 3)) {
    Object.assign(state.pg, saved.pg); Object.assign(state.view, saved.view);
    if (saved.v === 3) Object.assign(state.poly, saved.poly);
    if (saved.pg && typeof saved.pg.dirColors === 'boolean' && !('dirColors' in (saved.view || {}))) state.view.dirColors = saved.pg.dirColors;
    delete state.pg.dirColors;
    if (state.poly.zoneMode) state.poly.tool = 'zone'; // älterer Zustand
    delete state.poly.zoneMode;
    if (!['zone', 'angle'].includes(state.poly.tool)) state.poly.tool = null;
    if (state.pg.tool !== 'angle') state.pg.tool = null;
    state.mode = saved.mode === 'poly' ? 'poly' : 'pg';
    if (!POINT_GROUPS.some((g) => g.id === state.pg.id)) state.pg.id = 'mm2';
    if (!Array.isArray(state.pg.hideDirs)) state.pg.hideDirs = [];
    if (!exampleById(state.poly.example)) state.poly.example = null;
    if (!state.poly.exScale || typeof state.poly.exScale !== 'object') state.poly.exScale = {};
  }
} catch { /* Speicher nicht verfügbar */ }
if (location.hash.length > 1) applyHash(location.hash); // Link hat Vorrang
let resetting = false;
const save = () => {
  if (resetting) return;
  try { localStorage.setItem('stereo-state', JSON.stringify({ v: 3, mode: state.mode, pg: state.pg, poly: state.poly, view: state.view })); } catch { /* ignorieren */ }
  try {
    const h = stateToHash();
    if (baseHash === null) baseHash = h;
    if (!hashActive && h === baseHash) return;
    hashActive = true;
    if (h !== lastHash) { lastHash = h; history.replaceState(null, '', location.pathname + location.search + h); }
  } catch { /* z. B. in eingebetteten Vorschauen */ }
};
// Hash von aussen geändert (Link in derselben Seite geöffnet): neu laden
window.addEventListener('hashchange', () => { if (location.hash !== lastHash) location.reload(); });

// ------------------------------------------------------------------ Farben aus CSS-Tokens
function palette() {
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
const formColor = (col, i) => col.form[i % col.form.length];
function mixHex(a, b, t) {
  const p = (h) => { const x = h.replace('#', ''); const f = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((k) => parseInt(f.slice(k, k + 2), 16)); };
  try {
    const A = p(a), Bc = p(b);
    return '#' + A.map((v, k) => Math.round(v + (Bc[k] - v) * t).toString(16).padStart(2, '0')).join('');
  } catch { return a; }
}
const formFill = (col, i) => mixHex(formColor(col, i), col.paper, 0.38);
const FONT = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

// ------------------------------------------------------------------ Bedienelemente aufbauen
/** Punktgruppen mit zwei Aufstellungen in ITA: ein Button je Punktgruppe, die Aufstellung darunter. */
const FAMILIES = {
  '32': ['321', '312'], '3m': ['3m1', '31m'], '-3m': ['-3m1', '-31m'],
  '-42m': ['-42m', '-4m2'], '-6m2': ['-6m2', '-62m'],
};
const famOf = (id) => Object.keys(FAMILIES).find((k) => FAMILIES[k].includes(id)) || null;

function buildGroupPicker() {
  const box = $('pg-picker');
  box.innerHTML = '';
  for (const sys of SYSTEMS) {
    const row = document.createElement('div');
    row.className = 'sysrow';
    const name = (sys[0].toUpperCase() + sys.slice(1)).replace('Orthorhombisch', 'Ortho­rhombisch');
    let btns = '', sets = '';
    const seen = new Set();
    for (const g of POINT_GROUPS.filter((x) => x.system === sys)) {
      if (sys === 'monoklin') {
        if (seen.has(g.hm)) continue;
        seen.add(g.hm);
        btns += `<button class="pgb" data-mono="${g.hm}" type="button">${hmHTML(g.hm)}</button>`;
        continue;
      }
      const fam = famOf(g.id);
      if (!fam) {
        btns += `<button class="pgb" data-id="${g.id}" type="button">${hmHTML(g.hm)}</button>`;
      } else if (!seen.has(fam)) {
        seen.add(fam);
        btns += `<button class="pgb" data-fam="${fam}" type="button" title="Punktgruppe ${hmText(fam)}, zwei Aufstellungen">${hmHTML(fam)}</button>`;
        sets += `<span class="mono-axis setrow" data-setrow="${fam}" hidden><span>Aufstellung</span>${FAMILIES[fam].map((id) => {
          const m = groupOf(id);
          return `<button class="pgb" data-id="${id}" type="button" title="Punktgruppe ${hmText(fam)}, Aufstellung ${hmText(m.setting || m.hm)}">${hmHTML(m.setting || m.hm)}</button>`;
        }).join('')}</span>`;
      }
    }
    if (sys === 'monoklin') {
      sets += `<span class="mono-axis setrow" data-setrow="mono" hidden><span>Aufstellung: eindeutige Achse</span><button class="pgb" data-axis="b" type="button" aria-label="Achse b">b</button><button class="pgb" data-axis="c" type="button" aria-label="Achse c">c</button></span>`;
    }
    row.innerHTML = `<span class="sys">${name}</span><div class="btns">${btns}${sets}</div>`;
    box.appendChild(row);
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const cur = groupOf(state.pg.id);
    state.pg.hideDirs = []; // ausgeblendete Blickrichtungen gelten nur für die jeweilige Gruppe
    state.pgSel = [];
    if (b.dataset.fam) {
      const pref = state.pg.famPref[b.dataset.fam];
      state.pg.id = FAMILIES[b.dataset.fam].includes(pref) ? pref : FAMILIES[b.dataset.fam][0];
    } else if (b.dataset.id) state.pg.id = b.dataset.id;
    else if (b.dataset.mono) state.pg.id = monoId(b.dataset.mono, state.pg.monoAxis);
    else if (b.dataset.axis) {
      state.pg.monoAxis = b.dataset.axis;
      if (cur.system === 'monoklin') state.pg.id = monoId(cur.hm, state.pg.monoAxis);
    }
    syncPicker();
    render();
  });
  syncPicker();
}
const groupOf = (id) => POINT_GROUPS.find((g) => g.id === id);
const monoId = (hm, axis) => POINT_GROUPS.find((g) => g.system === 'monoklin' && g.hm === hm && g.setting === 'Achse ' + axis).id;
function syncPicker() {
  const g = groupOf(state.pg.id);
  if (g.system === 'monoklin') state.pg.monoAxis = g.setting.endsWith('c') ? 'c' : 'b';
  const fam = famOf(state.pg.id);
  if (!state.pg.famPref || typeof state.pg.famPref !== 'object') state.pg.famPref = {};
  if (fam) state.pg.famPref[fam] = state.pg.id;
  // Zeile „Aufstellung“ nur unter der gewählten Gruppe; monoklin wie die übrigen Gruppen mit Aufstellungen
  const row = g.system === 'monoklin' ? 'mono' : fam;
  for (const r of document.querySelectorAll('#pg-picker [data-setrow]')) r.hidden = r.dataset.setrow !== row;
  for (const b of document.querySelectorAll('#pg-picker button')) {
    let on = false;
    if (b.dataset.fam) on = b.dataset.fam === fam;
    else if (b.dataset.id) on = b.dataset.id === state.pg.id;
    else if (b.dataset.mono) on = g.system === 'monoklin' && g.hm === b.dataset.mono;
    else if (b.dataset.axis) on = (state.pg.monoAxis || 'b') === b.dataset.axis;
    b.setAttribute('aria-pressed', String(on));
  }
}

const SYSTEM_NAMES = { triklin: 'Triklin', monoklin: 'Monoklin', orthorhombisch: 'Orthorhombisch', tetragonal: 'Tetragonal', trigonal: 'Trigonal', hexagonal: 'Hexagonal', kubisch: 'Kubisch' };
const DEFAULT_ENTRY = {
  triklin: '-1:a2', monoklin: '2/mb:c6', orthorhombisch: 'mmm:g7', tetragonal: '4/mmm:f14',
  trigonal: '-3m1:c21', hexagonal: '6/mmm:e31', kubisch: 'm-3m:b35',
};
const sysOK = (sys) => Object.prototype.hasOwnProperty.call(SYSTEM_NAMES, sys);
if (!sysOK(state.poly.system)) state.poly.system = 'kubisch';
/**
 * Ohne „Flächensymmetrie zeigen“ enthält die Auswahl je Punktgruppe nur die allgemeine Form und die
 * Formen, deren Eigensymmetrie die Punktgruppe selbst ist (z. B. Würfel nur in m3̄m, Tetraeder nur
 * in 4̄3m). Geometrisch gleiche Formen anderer Punktgruppen unterscheiden sich erst durch die
 * Flächensymmetrie; sie erscheinen, sobald diese gezeigt wird. (Absprache mit dem Autor.)
 */
const EIG_SAME = { '-62m': '-6m2', '-4m2': '-42m' };
const groupOrder = new Map();
function formListed(e) {
  if (state.poly.faceSym) return true;
  const g = groupOf(e.pg);
  if (!groupOrder.has(g.id)) groupOrder.set(g.id, buildPointGroup(g.id).order);
  const norm = (s) => EIG_SAME[s] || s;
  return e.mult === groupOrder.get(g.id) || norm(formEig(e)) === norm(g.hm);
}
const currentEntryId = () => {
  const sys = state.poly.system;
  const id = state.poly.entryBySys[sys];
  const e = id && entryById(id);
  if (!e || SYSTEM_OF[e.pg] !== sys) return DEFAULT_ENTRY[sys];
  if (formListed(e)) return id;
  // ausgeblendete Form: dieselbe Form (gleicher Typ) dort zeigen, wo sie ihre Eigensymmetrie hat
  const same = CATALOG.find((x) => SYSTEM_OF[x.pg] === sys && x.type === e.type && formListed(x));
  return same ? same.id : DEFAULT_ENTRY[sys];
};
/** Beispielkristall (nur gültig, solange sein Kristallsystem gewählt ist). */
const currentExample = () => {
  const ex = exampleById(state.poly.example);
  return ex && ex.sys === state.poly.system ? ex : null;
};
const exFactors = (ex) => {
  const f = state.poly.exScale[ex.id];
  return ex.forms.map((_, i) => (Array.isArray(f) && Number.isFinite(f[i]) ? f[i] : 1));
};
/** Formen des Beispiels mit den eingestellten Abständen (die erste Form ist die Bezugsform). */
const exForms = (ex) => {
  const fs = exFactors(ex);
  return ex.forms.map((f, i) => (f.t != null ? { hkl: f.hkl, t: f.t * fs[i] } : { hkl: f.hkl, r: f.r * fs[i] }));
};
function setExample(id) {
  const ex = exampleById(id);
  state.poly.example = ex ? ex.id : null;
  state.selected = null; state.zoneSel = [];
  if (ex) {
    state.poly.system = ex.sys;
    state.poly.lats[ex.sys] = { ...LATTICE_DEFAULTS[ex.sys], ...(ex.lat || {}) };
    delete state.poly.exScale[ex.id];
    state.poly.broken = false; state.poly.open = false;
    state.poly.presetId = orientationPresets(ex.sys)[0].id;
    $('poly-broken').checked = false; $('poly-open').checked = false;
  }
  $('sys-select').value = state.poly.system;
  refreshPolyControls();
}

const currentLat = () => {
  const sys = state.poly.system;
  if (!state.poly.lats[sys]) state.poly.lats[sys] = { ...LATTICE_DEFAULTS[sys] };
  return state.poly.lats[sys];
};

function buildSystemSelect() {
  $('sys-select').innerHTML = Object.entries(SYSTEM_NAMES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  $('sys-select').value = state.poly.system;
}

function buildFormSelect() {
  const sys = state.poly.system;
  const hex4 = isHexSystem(sys) && state.poly.bravais;
  const groups = POINT_GROUPS.filter((g) => g.system === sys && CATALOG.some((e) => e.pg === g.id && formListed(e)));
  $('form-select').innerHTML = groups.map((g) => {
    const opts = CATALOG.filter((e) => e.pg === g.id && formListed(e))
      .map((e) => `<option value="${e.id}">${formName(e)} ${formLabelText(e.hkl, hex4)}</option>`).join('');
    return `<optgroup label="Punktgruppe ${hmText(g.hm)} (${g.sf})">${opts}</optgroup>`;
  }).join('');
  const ex = currentExample();
  if (ex) $('form-select').insertAdjacentHTML('afterbegin', `<option value="">Kombination: ${ex.name}</option>`);
  $('form-select').value = ex ? '' : currentEntryId();
}

function buildExampleSelect() {
  // Reihenfolge wie in examples.js (Galenit als Standardbeispiel zuerst), gruppiert nach System
  const order = [...new Set(EXAMPLES.map((x) => x.sys))];
  const bySys = order.map((sys) => [sys, EXAMPLES.filter((x) => x.sys === sys)]);
  $('ex-select').innerHTML = '<option value="">– keiner (einzelne Form) –</option>' + bySys.map(([sys, l]) =>
    `<optgroup label="${SYSTEM_NAMES[sys]}">${l.map((x) => `<option value="${x.id}">${x.name}${x.formula ? ' (' + x.formula + ')' : ''}, ${hmText(groupOf(x.pg).hm)}</option>`).join('')}</optgroup>`).join('');
  const ex = currentExample();
  $('ex-select').value = ex ? ex.id : '';
}

/** Schieberegler für die Abstände der Formen eines Beispielkristalls. */
function buildExDists() {
  const box = $('ctl-ex-dists');
  const ex = currentExample();
  box.hidden = !ex;
  if (!ex) { box.innerHTML = ''; return; }
  const col = palette();
  const fs = exFactors(ex);
  const hex4 = isHexSystem(ex.sys) && state.poly.bravais;
  box.innerHTML = '<p class="group-title">Abstände der Formen</p>' + ex.forms.slice(1).map((f, j) => {
    const i = j + 1;
    return `<div class="range exd"><label for="exd-${i}"><i class="sw" style="background:${formColor(col, i)}"></i>${hklHTML(f.hkl, hex4, ['{', '}'])}</label><output id="exd-${i}-out">${fs[i].toFixed(2)}</output>
      <input type="range" id="exd-${i}" min="0.5" max="2" step="0.01" value="${fs[i]}"></div>`;
  }).join('') + `<p class="hintline">Faktor auf den Zentralabstand der Form; ${hklHTML(ex.forms[0].hkl, hex4, ['{', '}'])} bleibt fest.</p>`;
  box.querySelectorAll('input[type=range]').forEach((el) => {
    el.addEventListener('input', () => {
      const i = Number(el.id.split('-')[1]);
      const arr = exFactors(ex);
      arr[i] = Number(el.value);
      state.poly.exScale[ex.id] = arr;
      $('exd-' + i + '-out').textContent = arr[i].toFixed(2);
      render();
    });
  });
}

function refreshPolyControls() {
  const sys = state.poly.system;
  buildExampleSelect();
  buildFormSelect();
  buildExDists();
  $('row-broken').hidden = !!currentExample();
  syncFormHint();
  const presets = orientationPresets(sys);
  $('preset-select').innerHTML = presets.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  if (!presets.some((p) => p.id === state.poly.presetId)) state.poly.presetId = presets[0].id;
  $('preset-select').value = state.poly.presetId;
  const free = new Set(state.poly.broken ? ['ba', 'ca', 'al', 'be', 'ga'] : FREE_PARAMS[sys]);
  for (const k of ['ba', 'ca', 'al', 'be', 'ga']) $('row-lat-' + k).hidden = !free.has(k);
  $('lat-fixed').hidden = free.size > 0;
  $('row-bravais').hidden = !isHexSystem(sys);
  syncLatSliders();
}

function syncLatSliders() {
  const lat = state.poly.broken ? currentLat() : constrainLattice(currentLat(), state.poly.system);
  for (const k of ['ba', 'ca', 'al', 'be', 'ga']) {
    $('lat-' + k).value = lat[k];
    $('lat-' + k + '-out').textContent = k.length === 2 && k !== 'ba' && k !== 'ca' ? lat[k].toFixed(0) + '°' : lat[k].toFixed(2);
  }
}

function formLabelText(hkl, hex) {
  return '{' + indices(hkl, hex).map((x) => (x < 0 ? Math.abs(x) + '̅' : String(x))).join('') + '}';
}

// ------------------------------------------------------------------ Stereogramm
const svg = $('stereo');
let current = null; // zuletzt gerenderte Daten

function generalPole() {
  const t = state.pg.theta * deg, p = state.pg.phi * deg;
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
}

function crystalAxesFor(hex) {
  return hex
    ? [{ name: 'a₁', dir: HEX_A }, { name: 'a₂', dir: HEX_B }, { name: 'a₃', dir: normalize([-HEX_A[0], -HEX_A[1] - 1, 0]) }, { name: 'c', dir: [0, 0, 1] }]
    : [{ name: 'a', dir: [1, 0, 0] }, { name: 'b', dir: [0, 1, 0] }, { name: 'c', dir: [0, 0, 1] }];
}

const CUBIC_ZONES = [[1, 0, 0], [0, 1, 0], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];

function renderPG() {
  const col = palette();
  const info = buildPointGroup(state.pg.id);
  const p0 = generalPole();
  const orb = orbit(info.ops, p0);
  const axisAlongZ = info.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6);
  const classes = symmetryDirections(info);
  state.pgSel = state.pg.tool && state.pg.showObject ? state.pgSel.filter((k) => k < orb.length) : [];
  const pgAngle = state.pgSel.length === 2 ? angleOf(orb[state.pgSel[0]].p, orb[state.pgSel[1]].p) : null;
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
    poles: state.pg.showObject ? orb.map((o, i) => ({ p: o.p, det: o.det, idx: i, gen: i === 0, selected: state.pgSel.includes(i) })) : [],
    hitR: touchRadius(13, 22),
    arc: pgAngle ? { a: pgAngle.a, b: pgAngle.b, label: pgAngle.deg.toFixed(1) + '°' } : null,
    colorByDet: state.pg.colorful,
    showLower: true,
    axisLabels: state.view.axes ? crystalAxesFor(info.hex) : [],
  };
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'pg', info, scene };
  updateLegendPG(info, col, classes);
  updateInfoPG(info, orb, col, classes, pgAngle);
  updateDirChips(classes, col);
  const tex = buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, gen: false, selected: false })) }, { standalone: true }).full;
  view3d.setStereoTexture(tex);
  view3d.showPointGroup(
    { ...info, orbit: state.pg.showObject ? orb : null, p0, crystalAxes: crystalAxesFor(info.hex) },
    col,
    { showElements: state.pg.showElements, showObject: state.pg.showObject, showRays: state.view.rays, showSphere: state.view.sphere, showPlane: state.view.plane, showAxes: state.view.axes,
      dirColors: state.view.dirColors ? col.dir : null, hiddenDirs: new Set(state.pg.hideDirs),
      arc: pgAngle ? { a: pgAngle.a, b: pgAngle.b, label: pgAngle.deg.toFixed(1) + '°' } : null },
  );
}

/** Schalter in der 3D-Ansicht: Symmetrieelemente einzelner Blickrichtungen ein-/ausblenden. */
function updateDirChips(classes, col) {
  const box = $('v3d-dirs');
  const used = classes.filter((c) => c.axes.length || c.mirrors.length);
  box.hidden = state.mode !== 'pg' || !state.pg.showElements || used.length < 1;
  if (box.hidden) { box.innerHTML = ''; return; }
  const hide = new Set(state.pg.hideDirs);
  const focused = box.contains(document.activeElement) ? document.activeElement.dataset.pos : null;
  box.innerHTML = '<span class="cap">Blickrichtungen:</span>' + used.map((c) => {
    const on = !hide.has(c.pos);
    const dc = state.view.dirColors ? `style="--dc:${col.dir[c.pos]}"` : '';
    return `<button type="button" data-pos="${c.pos}" aria-pressed="${on}" ${dc} title="${on ? 'Ausblenden' : 'Einblenden'}: Symmetrieelemente der Blickrichtung ${c.label.replace(/<[^>]+>/g, '')} in der 3D-Ansicht"><i class="sw"></i>${c.label}</button>`;
  }).join('');
  if (focused != null) box.querySelector(`button[data-pos="${focused}"]`)?.focus();
}

/** Richtung [uvw] als Teile für SVG-Text. */
function dirParts(v, hex4) {
  const w = hex4 ? dirToFour(v) : v;
  const big = w.some((x) => Math.abs(x) > 9);
  const out = [{ t: '[', bar: false }];
  w.forEach((x, i) => { if (big && i) out.push({ t: ' ', bar: false }); out.push({ t: String(Math.abs(x)), bar: x < 0 }); });
  out.push({ t: ']', bar: false });
  return out;
}

const ORBIT_COLORS = (col) => [col.accent, col.accent2, col.ax2, col.ax4, col.ax3, col.ax6];

function renderPoly() {
  const col = palette();
  const ex = currentExample();
  const C = buildCrystal(ex
    ? { groupId: ex.pg, forms: exForms(ex), lat: currentLat(), broken: false, auxDist: state.poly.auxDist, presetId: state.poly.presetId }
    : { entryId: currentEntryId(), lat: currentLat(), broken: state.poly.broken, auxDist: state.poly.auxDist, presetId: state.poly.presetId });
  C.example = ex;
  // Auswahl über die Indizes weiterführen: Flächen können wegfallen oder neu nummeriert werden
  // (Abstände, Gitter), ein Index allein würde dann eine andere Fläche treffen.
  if (current && current.kind === 'poly') {
    const key = (f) => (f ? f.role + ':' + f.hkl.join(',') : null);
    const map = new Map(C.faces.map((f, i) => [key(f), i]));
    const remap = (k) => { const i = map.get(key(current.C.faces[k])); return i === undefined ? null : i; };
    if (state.selected != null) state.selected = remap(state.selected);
    const zs = state.zoneSel.map(remap);
    state.zoneSel = zs.some((k) => k == null) ? [] : zs;
  }
  const hex4 = C.hex && state.poly.bravais;
  const oc = ORBIT_COLORS(col);
  const multi = C.isReduced && C.orbitsMain.length > 1;
  C.faces.forEach((f) => {
    f.hidden = state.poly.open && f.role === 'aux';
    f.color2d = f.role === 'aux' ? col.muted : ex ? formColor(col, f.form) : multi ? oc[f.orbit % oc.length] : null;
    f.color3d = f.role === 'aux' ? col.crystal2 : ex ? formFill(col, f.form) : multi ? oc[f.orbit % oc.length] : col.crystal;
  });
  if (state.selected != null && (!C.faces[state.selected] || C.faces[state.selected].hidden)) state.selected = null;
  state.zoneSel = state.zoneSel.filter((k) => C.faces[k] && !C.faces[k].hidden);
  if (!state.poly.tool) state.zoneSel = [];
  const two = state.zoneSel.length === 2;
  const zone = state.poly.tool === 'zone' && two ? zoneOf(C, state.zoneSel[0], state.zoneSel[1]) : null;
  C.zone = zone;
  const angle = state.poly.tool === 'angle' && two ? angleOf(C.faces[state.zoneSel[0]].normal, C.faces[state.zoneSel[1]].normal) : null;
  C.angle = angle;
  const inZone = new Set(zone ? zone.inZone : []);
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
      label: state.poly.labels ? hklParts(f.hkl, hex4) : null, selected: state.selected === i || state.zoneSel.includes(i), zone: inZone.has(i),
    })).filter(Boolean),
    showLower: state.poly.showLower,
    hitR: touchRadius(13, 22),
    labelSize: Math.max(14.5, 11 * svgUnit()), // mindestens ca. 11 px auf dem Bildschirm
    axisLabels: state.view.axes ? C.axes : [],
    zone: zone ? { axis: zone.axis, label: dirParts(zone.uvw, hex4) } : null,
    arc: angle ? { a: angle.a, b: angle.b, label: angle.deg.toFixed(1) + '°' } : null,
  };
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'poly', C, scene };
  updateLegendPoly(C, col, fwClasses);
  updateInfoPoly(C, col);
  $('ctl-poly-open').hidden = !C.auxForms.length;
  const tn = state.poly.tool === 'zone' ? 'Zone' : 'Winkel';
  $('v3d-hint').textContent = state.poly.tool
    ? [`${tn}: zwei Flächen oder Pole antippen`, `${tn}: zweite Fläche oder zweiten Pol antippen`, `${state.poly.tool === 'zone' ? 'Zone bestimmt' : 'Winkel gemessen'}; nächstes Antippen beginnt neu`][Math.min(state.zoneSel.length, 2)]
    : 'Fläche oder Pol antippen zum Hervorheben';
  $('stereo-sub').textContent = 'Blick ∥ ' + C.preset.name.replace(' ∥ Blickrichtung', '').replace(/ \(.*\)/, '');
  view3d.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, selected: false })) }, { standalone: true }).full);
  const labels3d = state.poly.labels ? C.faces.map((f) => hklHTML(f.hkl, hex4)) : null;
  view3d.showPolyhedron(C, col,
    { showRays: state.view.rays, showSphere: state.view.sphere, showPlane: state.view.plane, showAxes: state.view.axes, showNormals: state.view.normals, size: state.poly.size, planeOpacity: 0.55, motifs: state.poly.faceSym ? C.motifs : null, zone, arc: angle ? { a: angle.a, b: angle.b, label: angle.deg.toFixed(1) + '°' } : null, picked: state.poly.tool ? state.zoneSel : [] },
    state.selected, labels3d);
}

/** Winkel zwischen zwei Flächennormalen (= Winkel zwischen den Polen). */
function angleOf(a, b) {
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return { a, b, deg: Math.acos(d) / deg };
}

let syncToolBtns = () => {};
let syncFormHint = () => {};
let pending = false;
function render() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    if (state.mode === 'pg') renderPG(); else renderPoly();
    save();
  });
}

// ------------------------------------------------------------------ Legende und Info
/** Kurzbeschreibung eines Achsensymbols für die Legende. */
function axisLegendText(symbol, centre) {
  const n = symbol.replace('-', '');
  const base = symbol.startsWith('-') ? `${hmHTML(symbol)}-Achse` : `${n}-zählige Achse`;
  return base + (centre ? ' mit Inversionszentrum' : '');
}

function updateLegendPG(info, col, classes) {
  const items = [];
  if (state.pg.showObject) {
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Pol oben</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Pol unten</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/><circle r="4" fill="${col.ink}"/></svg>beide</span>`);
    items.push(`<span class="lg"><svg width="20" height="20" viewBox="-10 -10 20 20"><circle r="8" fill="none" stroke="${col.accent}" stroke-width="1.6" stroke-dasharray="2.6 2.2"/><circle r="3" fill="${col.ink}"/></svg>Ausgangspol</span>`);
  }
  if (state.pg.showElements) {
    if (info.mirrors.length) items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.ink}" stroke-width="3.2" stroke-linecap="round"/></svg>Spiegelebene</span>`);
    const icol = { ...col, axis: col.ink, paper: col.paper };
    // Wie im Stereogramm: Punkt für das Inversionszentrum nur im Symbol der Achse ∥ c
    const ORDER = ['6', '-6', '4', '-4', '3', '-3', '2'];
    const drawn = new Set(info.axes.map((a) => a.symbol + '|' + (a.centre && Math.abs(a.dir[2]) > 1 - 1e-6 ? 'c' : '')));
    for (const s of ORDER) {
      for (const c of [true, false]) {
        if (drawn.has(s + '|' + (c ? 'c' : ''))) items.push(`<span class="lg">${symbolIcon(s, c, icol, 24)}<span>${axisLegendText(s, c)}</span></span>`);
      }
    }
    if (current && current.scene && current.scene.centreAtOrigin) {
      items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="3.6" fill="${col.paper}" stroke="${col.ink}" stroke-width="1.3"/></svg>Inversionszentrum</span>`);
    }
    if (state.view.dirColors) {
      for (const c of classes) {
        if (!c.axes.length && !c.mirrors.length) continue;
        items.push(`<span class="lg"><i class="sw" style="background:${col.dir[c.pos]}"></i><span>Blickrichtung ${c.label}</span></span>`);
      }
    }
  }
  if (state.pg.colorful && state.pg.showObject) {
    items.push(`<span class="lg"><i class="sw" style="background:${col.upper}"></i>gleiche Händigkeit</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${col.accent2}"></i>Spiegelbild</span>`);
  }
  if (state.pg.showObject && state.pg.tool) {
    items.push(`<span class="lg hint">Winkel: zwei Pole antippen; liegen zwei übereinander, schaltet erneutes Antippen weiter („Winkel“ erneut drücken: beenden)</span>`);
  } else if (state.pg.showObject) {
    items.push(`<span class="lg hint"><span class="only-fine">Ausgangspol ziehen oder Stelle anklicken; Ausgangspol anklicken: Halbkugel wechseln</span><span class="only-coarse">Ausgangspol ziehen oder Stelle antippen; Ausgangspol antippen: Halbkugel wechseln</span></span>`);
  }
  $('legend').innerHTML = items.join('');
}
function updateLegendPoly(C, col, fwClasses) {
  const items = [
    `<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Flächenpol oben</span>`,
    `<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Flächenpol unten</span>`,
  ];
  if (C.example) {
    const hex4 = C.hex && state.poly.bravais;
    C.forms.forEach((F, i) => {
      const n = auxFormName(C.groupId, F.hkls);
      items.push(`<span class="lg"><i class="sw" style="background:${formColor(col, i)}"></i><span>${n ? n.name : 'Form'} ${hklHTML(F.rep, hex4, ['{', '}'])}</span></span>`);
    });
  }
  if (C.auxForms.length && !state.poly.open) items.push(`<span class="lg"><i class="sw" style="background:${col.muted}"></i>Ergänzungsform</span>`);
  for (const c of fwClasses || []) {
    if (c.axes.length || c.mirrors.length) items.push(`<span class="lg"><i class="sw" style="background:${col.dir[c.pos]}"></i><span>Gerüst ${c.label}</span></span>`);
  }
  if (C.zone) {
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="2.2"/></svg>Zonenkreis</span>`);
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="1.6" stroke-dasharray="5 4"/></svg>untere Hälfte</span>`);
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><path d="M-5,-5L5,5M-5,5L5,-5" stroke="${col.accent}" stroke-width="2"/></svg>Zonenachse</span>`);
  }
  if (C.angle) {
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="3"/></svg>Bogen (Grosskreis) zwischen den Polen</span>`);
  }
  const tn = state.poly.tool === 'zone' ? 'Zone' : 'Winkel';
  items.push(state.poly.tool
    ? `<span class="lg hint">${tn}: zwei Pole hier oder zwei Flächen in der 3D-Ansicht antippen („${tn}“ erneut drücken: beenden)</span>`
    : '<span class="lg hint">Pol oder Fläche antippen zum Hervorheben; liegen zwei Pole übereinander, schaltet erneutes Antippen weiter (mit Werkzeug auch auf beide) · Werkzeuge „Zone“ und „Winkel“</span>');
  $('legend').innerHTML = items.join('');
}

const yesno = (b) => (b ? 'ja' : 'nein');
const FORM_TYPES_EIG = Object.fromEntries(Object.entries(FORM_TYPES).map(([k, v]) => [k, v.eig]));

/** Name eines Achsensymbols, Mehrzahl mit n > 1. */
function axisName(symbol, n) {
  const k = symbol.replace('-', '');
  const base = symbol.startsWith('-') ? `${hmHTML(symbol)}-Achse` : `${k}-zählige Drehachse`;
  return n > 1 ? base + 'n' : base;
}

/** Beschreibung der Operation M (Bildschirm-/Kristallkoordinaten, orthogonal), die zwei Pole verknüpft. */
function describeOp(M, classes, col, axes) {
  const det = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const R = det > 0 ? M : M.map((r) => r.map((x) => -x)); // eigentlicher Anteil
  const tr = R[0][0] + R[1][1] + R[2][2];
  const ang = Math.round(Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2))) / deg);
  let ax = null;
  if (ang > 0) {
    const v = ang === 180
      ? [0, 1, 2].map((j) => [R[0][j] + (j === 0), R[1][j] + (j === 1), R[2][j] + (j === 2)]).sort((a, b) => Math.hypot(...b) - Math.hypot(...a))[0]
      : [R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]];
    ax = normalize(v);
  }
  const where = () => {
    const k = ax ? classes.findIndex((c) => c.dirs.some((d) => Math.abs(Math.abs(d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2]) - 1) < 1e-4)) : -1;
    return k >= 0 ? ` (Blickrichtung <span style="color:${state.view.dirColors ? col.dir[k] : 'inherit'}">${classes[k].label}</span>)` : '';
  };
  // Symmetrieelement, auf dem die Operation liegt (z. B. 180° um die 4-zählige Achse = 4²)
  const el = ax ? axes.find((a) => Math.abs(Math.abs(a.dir[0] * ax[0] + a.dir[1] * ax[1] + a.dir[2] * ax[2]) - 1) < 1e-4) : null;
  const elName = (fallback) => (el ? (el.symbol.startsWith('-') ? `die ${hmHTML(el.symbol)}-Achse` : `die ${el.symbol}-zählige Achse`) : fallback);
  if (det > 0) return ang === 0 ? 'die Identität' : `eine Drehung um ${ang}° um ${elName(`eine ${Math.round(360 / ang)}-zählige Achse`)}${where()}`;
  if (ang === 0) return `die Inversion am Zentrum ${hmHTML('-1')}`;
  if (ang === 180) return `die Spiegelung an einer Spiegelebene${where()}`;
  const elDat = el ? (el.symbol.startsWith('-') ? `der ${hmHTML(el.symbol)}-Achse` : `der ${el.symbol}-zähligen Achse`) : 'einer Drehinversionsachse';
  return `die Drehinversion ${hmHTML('-' + Math.round(360 / ang))} (Drehung um ${ang}° und Inversion) an ${elDat}${where()}`;
}

function pgAngleBox(info, orb, col, classes, pgAngle) {
  if (!state.pg.tool) return '';
  if (!state.pg.showObject) return '<div class="zonebox">Winkel messen: „Objekt in allgemeiner Lage“ einschalten.</div>';
  if (!pgAngle) return `<div class="zonebox">Winkel messen: ${state.pgSel.length ? 'einen zweiten Pol' : 'zwei Pole'} im Stereogramm antippen.</div>`;
  const [i, j] = state.pgSel;
  const A = info.ops[orb[i].op], B = info.ops[orb[j].op];
  // Operation, die Pol i auf Pol j abbildet: M = B · A⁻¹ (A orthogonal: A⁻¹ = Aᵀ)
  const M = [0, 1, 2].map((r) => [0, 1, 2].map((c) => B[r][0] * A[c][0] + B[r][1] * A[c][1] + B[r][2] * A[c][2]));
  const side = (k) => (orb[k].p[2] >= -1e-9 ? 'oben' : 'unten');
  return `<div class="zonebox"><strong>Winkel zwischen den Polen = <span class="num">${pgAngle.deg.toFixed(1)}°</span></strong>
    <p>Gewählt: zwei der ${info.order} symmetrieäquivalenten Pole (${side(i)}, ${side(j)}). Sie gehen durch ${describeOp(M, classes, col, info.axes)} ineinander über.</p>
    <p class="note">Mit dem Polabstand ρ und dem Azimut φ des Ausgangspols ändert sich der Winkel; die verknüpfende Operation bleibt dieselbe.</p></div>`;
}

function updateInfoPG(info, orb, col, classes, pgAngle) {
  const icol = { ...col, axis: col.ink, paper: col.paper };
  const dc = (k) => (state.view.dirColors ? col.dir[k] : col.ink);
  const mirrorIcon = (c) => `<svg class="sym-icon" width="22" height="22" viewBox="0 0 26 26"><line x1="3" y1="13" x2="23" y2="13" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></svg>`;
  // Volles Symbol: jede Position in der Farbe ihrer Blickrichtung
  const parts = info.full.split(' ');
  const fullHTML = parts.map((p, i) => (classes[i] && p !== '1' && state.view.dirColors
    ? `<span class="hmpos" style="--dc:${col.dir[i]}">${hmHTML(p)}</span>` : hmHTML(p))).join('&#8239;');
  // Symmetrieelemente nach Blickrichtung
  const rows = classes.map((c) => {
    const items = [];
    const bySym = new Map();
    for (const a of c.axes) bySym.set(a.symbol, (bySym.get(a.symbol) || 0) + 1);
    for (const [s, n] of bySym) items.push(`<li>${symbolIcon(s, false, { ...icol, axis: dc(c.pos) }, 26)}<span>${n}× ${axisName(s, n)}</span></li>`);
    if (c.mirrors.length) {
      const n = c.mirrors.length;
      items.push(`<li>${mirrorIcon(dc(c.pos))}<span>${n} Spiegelebene${n > 1 ? 'n' : ''} ⊥ ${n > 1 ? 'diesen Richtungen' : 'dieser Richtung'}</span></li>`);
    }
    const none = !items.length;
    if (none) items.push('<li><span class="muted">keine Symmetrieelemente (Symbol 1)</span></li>');
    const nd = c.dirs.length;
    return `<div class="dirrow${none ? ' none' : ''}" style="--dc:${dc(c.pos)}"><div class="dirhead"><span class="dirlab">${c.label}</span>${c.hm ? `<span class="dirhm">${hmHTML(c.hm)}</span>` : ''}<span class="dirn">${nd > 1 ? nd + ' äquivalente Richtungen' : '1 Richtung'}</span></div><ul>${items.join('')}</ul></div>`;
  }).filter((r, i) => classes[i].hm !== null || classes[i].axes.length || classes[i].mirrors.length);
  const free = [];
  if (info.centro) free.push(`<li><svg class="sym-icon" width="22" height="22" viewBox="-13 -13 26 26"><circle r="4.5" fill="${col.paper}" stroke="${col.ink}" stroke-width="1.4"/></svg><span>Inversionszentrum ${hmHTML('-1')} (im Ursprung)</span></li>`);
  if (!classes.length && !info.centro) free.push('<li><span>nur die Identität 1</span></li>');
  if (free.length) rows.push(`<div class="dirrow"><div class="dirhead"><span class="dirlab">ohne Richtung</span></div><ul>${free.join('')}</ul></div>`);
  const lower = orb.filter((o) => o.p[2] < -1e-9).length;
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big">${hmHTML(info.hm)}</div>
      <div class="hm-meta"><span>${info.system[0].toUpperCase() + info.system.slice(1)}${info.setting ? ' · Aufstellung ' + (info.setting.startsWith('Achse') ? info.setting : hmHTML(info.setting)) : ''}</span>
      <span>Schoenflies ${info.sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>')}</span></div>
    </div>
    ${pgAngleBox(info, orb, col, classes, pgAngle)}
    <dl class="facts">
      <div><dt>Volles Symbol</dt><dd>${fullHTML}</dd></div>
      <div><dt>Ordnung</dt><dd class="num">${info.order}</dd></div>
      <div><dt>Laue-Klasse</dt><dd>${hmHTML(info.laue)}</dd></div>
      <div><dt>Zentrosymmetrisch</dt><dd>${yesno(info.centro)}</dd></div>
      <div><dt>Enantiomorph</dt><dd>${yesno(info.chiral)}</dd></div>
      <div><dt>Polar</dt><dd>${yesno(info.polar)}</dd></div>
    </dl>
    <h3>Symmetrieelemente nach Blickrichtung</h3>
    <div class="dirlist">${rows.join('')}</div>
    ${classes.length ? '<p class="note">Jede Position im vollen Hermann-Mauguin-Symbol steht für eine Blickrichtung, d. h. eine Klasse symmetrisch äquivalenter Richtungen. Angegeben ist, was entlang dieser Richtungen liegt: Drehachsen parallel, Spiegelebenen senkrecht dazu. Elemente verschiedener Blickrichtungen sind nicht äquivalent. In der 3D-Ansicht lassen sich die Blickrichtungen oben links einzeln aus- und einblenden.</p>' : ''}
    ${state.pg.showObject ? `<p class="note">Allgemeine Lage: ${info.order} Pole (${info.order - lower} oben, ${lower} unten). Der gestrichelte Ring markiert den Ausgangspol; Antippen des Ausgangspols spiegelt ihn auf die andere Halbkugel (ρ → 180° − ρ).</p>` : ''}`;
}

function poleAngles(n) {
  const rho = Math.acos(Math.max(-1, Math.min(1, n[2]))) / deg;
  let phi = Math.atan2(n[1], n[0]) / deg;
  if (phi < 0) phi += 360;
  return { rho, phi };
}

function latticeText(lat, sys, broken) {
  const f2 = (x) => x.toFixed(2).replace('.', ',');
  const ang = (x) => `${x.toFixed(0)}°`;
  if (broken) return `a : b : c = 1 : ${f2(lat.ba)} : ${f2(lat.ca)}, α = ${ang(lat.al)}, β = ${ang(lat.be)}, γ = ${ang(lat.ga)}`;
  switch (sys) {
    case 'kubisch': return 'a = b = c, α = β = γ = 90°';
    case 'tetragonal': return `a = b, c/a = ${f2(lat.ca)}`;
    case 'trigonal': case 'hexagonal': return `hexagonale Achsen, c/a = ${f2(lat.ca)}`;
    case 'orthorhombisch': return `a : b : c = 1 : ${f2(lat.ba)} : ${f2(lat.ca)}`;
    case 'monoklin': return `a : b : c = 1 : ${f2(lat.ba)} : ${f2(lat.ca)}, β = ${ang(lat.be)}`;
    default: return `a : b : c = 1 : ${f2(lat.ba)} : ${f2(lat.ca)}, α = ${ang(lat.al)}, β = ${ang(lat.be)}, γ = ${ang(lat.ga)}`;
  }
}

function updateInfoPoly(C, col) {
  const e = C.entry;
  const g = POINT_GROUPS.find((x) => x.id === C.groupId);
  const hex4 = C.hex && state.poly.bravais;
  const brace = (h) => hklHTML(h, hex4, ['{', '}']);
  let sel = '';
  if (state.selected != null && C.faces[state.selected]) {
    const f = C.faces[state.selected];
    const { rho, phi } = poleAngles(f.normal);
    sel = `<div class="selbox"><div class="sel-hkl">${hklHTML(f.hkl, hex4)}${f.role === 'aux' ? ' <small>Ergänzungsform</small>' : ''}</div>
      <dl class="facts"><div><dt>ρ (Abstand vom Zentrum)</dt><dd class="num">${rho.toFixed(1)}°</dd></div>
      <div><dt>φ (Azimut ab ↓, Gegenuhrzeigersinn)</dt><dd class="num">${phi.toFixed(1)}°</dd></div></dl></div>`;
  }
  const auxList = C.auxReps.map((a) => {
    const n = auxFormName(C.groupId, a.hkls);
    return `<li>${brace(a.rep)} ${n ? n.name : 'Form'}, ${a.hkls.length} Fläche${a.hkls.length > 1 ? 'n' : ''}</li>`;
  }).join('');
  let aux = '';
  if (C.auxReps.length) {
    aux = state.poly.open
      ? `<h3>Offene Form</h3><p class="note">Die Form schliesst keinen Raum ein. Zur Darstellung wird sie von Ergänzungsformen abgeschnitten, die hier ausgeblendet sind:</p><ul class="auxlist">${auxList}</ul>`
      : `<h3>Ergänzungsformen</h3><p class="note">Die Form ist offen. Sie wird durch Formen derselben Punktgruppe geschlossen (grau):</p><ul class="auxlist">${auxList}</ul>`;
  }
  let broken = '';
  if (state.poly.broken) {
    if (C.isReduced) {
      const oc = ORBIT_COLORS(col);
      const ax = C.reducedAxis ? ` (${hmHTML(C.reducedAxis.symbol)} ∥ [${C.reducedAxis.uvw.map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join('')}])` : '';
      const parts = C.orbitsMain.map((o, i) => `<li><i class="sw" style="background:${C.orbitsMain.length > 1 ? oc[i % oc.length] : col.crystal}"></i>${brace(o.rep)}, ${o.hkls.length} Fläche${o.hkls.length > 1 ? 'n' : ''}</li>`).join('');
      broken = `<div class="warnbox"><strong>Symmetrie erniedrigt: ${hmHTML(g.hm)} → ${hmHTML(C.reduced.hm)}</strong>${ax}
        <p>${C.orbitsMain.length > 1 ? `Die Form ${brace(e.hkl)} zerfällt in ${C.orbitsMain.length} Formen:` : `Die Form ${brace(e.hkl)} bleibt eine Form der Restsymmetrie:`}</p><ul class="auxlist">${parts}</ul></div>`;
    } else {
      broken = `<div class="okbox">Die Verzerrung erhält die Punktgruppe ${hmHTML(g.hm)}.</div>`;
    }
  }
  let zoneBox = '';
  if (state.poly.tool === 'angle') {
    if (!C.angle) {
      zoneBox = `<div class="zonebox">Winkel messen: ${state.zoneSel.length === 0 ? 'zwei Pole' : 'einen zweiten Pol'} im Stereogramm oder zwei Flächen in der 3D-Ansicht antippen.</div>`;
    } else {
      const f1 = C.faces[state.zoneSel[0]].hkl, f2 = C.faces[state.zoneSel[1]].hkl;
      const w = C.angle.deg;
      zoneBox = `<div class="zonebox"><strong>Winkel ${hklHTML(f1, hex4)} ∠ ${hklHTML(f2, hex4)} = <span class="num">${w.toFixed(1)}°</span></strong>
        <p>Das ist der Winkel zwischen den beiden Flächennormalen, also der Bogen zwischen den Polen auf der Lagekugel (im Stereogramm als Grosskreisbogen eingezeichnet).</p>
        <p>Der Winkel zwischen den Flächen selbst, innen am Kristall gemessen (bei gemeinsamer Kante: der Kantenwinkel), ist der Ergänzungswinkel: 180° − ${w.toFixed(1)}° = <b class="num">${(180 - w).toFixed(1)}°</b>.</p>
        <p class="note">Mit dem Wulffschen Netz: Netz so drehen, dass beide Pole auf demselben Grosskreis (Meridian) liegen, dann die Teilstriche zwischen ihnen zählen.</p></div>`;
    }
  } else if (state.poly.tool === 'zone') {
    if (!C.zone) {
      zoneBox = state.zoneSel.length === 2
        ? '<div class="zonebox">Die beiden Flächen sind parallel und bestimmen keine Zone. Bitte eine andere Fläche wählen.</div>'
        : `<div class="zonebox">Zone bestimmen: ${state.zoneSel.length === 0 ? 'zwei Pole' : 'einen zweiten Pol'} im Stereogramm oder zwei Flächen in der 3D-Ansicht antippen.</div>`;
    } else {
      const z = C.zone;
      const f1 = C.faces[state.zoneSel[0]].hkl, f2 = C.faces[state.zoneSel[1]].hkl;
      const dir = (v) => '[' + (hex4 ? dirToFour(v) : v).map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join(Math.max(...v.map(Math.abs)) > 9 ? ' ' : '') + ']';
      const faces = z.inZone.map((k) => hklHTML(C.faces[k].hkl, hex4)).join(' ');
      const same = (a, b) => a.every((x, i) => x === b[i]); // Vorzeichen beachten: die Gegenfläche hat den Gegenpol
      const hasFace = C.faces.some((fc) => !fc.hidden && same(fc.hkl, z.uvw));
      const pl = hklHTML(z.uvw, false);
      const dev = z.normalDev > 0.05
        ? `In diesem Gitter steht die Zonenachse ${dir(z.uvw)} nicht senkrecht auf den Netzebenen ${pl} mit denselben Indizes (Abweichung ${z.normalDev.toFixed(1)}°). Der eingezeichnete Pol ist der Pol der Richtung ${dir(z.uvw)}, nicht der einer Fläche ${pl}.`
        : hasFace
          ? `Der Pol der Zonenachse ${dir(z.uvw)} fällt mit dem Pol der Fläche ${pl} zusammen, weil die Richtung ${dir(z.uvw)} in diesem Gitter senkrecht auf den Netzebenen ${pl} steht.`
          : `Der Pol der Zonenachse ${dir(z.uvw)} liegt dort, wo der Pol einer Fläche ${pl} läge; der dargestellte Kristall hat keine solche Fläche. Das gilt, weil die Richtung ${dir(z.uvw)} in diesem Gitter senkrecht auf den Netzebenen ${pl} steht, was nicht in jedem Gitter der Fall ist.`;
      zoneBox = `<div class="zonebox"><strong>Zone ${dir(z.uvw)}</strong>
        <p>Zonenachse ${dir(z.uvw)} = ${hklHTML(f1, false)} × ${hklHTML(f2, false)}. Winkel zwischen den Polen: <b class="num">${z.angle.toFixed(1)}°</b>.</p>
        <p>Flächen in dieser Zone (Weiss'sches Zonengesetz hu + kv + lw = 0), ${z.inZone.length}: ${faces}</p>
        <p class="note">${dev} Die Kanten zwischen Flächen der Zone verlaufen parallel zur Zonenachse (in 3D hervorgehoben).</p></div>`;
    }
  }
  const hab = habitOf(C.faces);
  const HABIT_NAMES = { isometrisch: 'isometrisch', planar: 'planar oder taflig', prismatisch: 'prismatisch oder nadelig' };
  const r2 = (x) => x.toFixed(2).replace('.', ',');
  const habitHTML = hab ? `${HABIT_NAMES[hab.type]} <span class="muted">(L₁ : L₂ : L₃ = 1 : ${r2(hab.L[1] / hab.L[0])} : ${r2(hab.L[2] / hab.L[0])})</span>` : '–';
  const sysName = SYSTEM_NAMES[C.sys];
  const habitNote = '<p class="note">Tracht: die Menge der am Kristall auftretenden Formen. Habitus: das relative Grössenverhältnis der Flächen, mit den drei Grundtypen isometrisch, planar oder taflig, prismatisch oder nadelig (nach Borchardt-Ott). Gleiche Tracht kann verschiedenen Habitus haben (z. B. über c/a oder die Abstände der Formen), verschiedene Tracht gleichen Habitus (Würfel, Oktaeder, Rhombendodekaeder: isometrisch). Die Einteilung hier: L₁ ≥ L₂ ≥ L₃ sind die Hauptausdehnungen des dargestellten Kristalls; isometrisch, wenn L₂/L₁ und L₃/L₂ beide mindestens 2/3 sind, sonst prismatisch (eine Richtung lang) oder planar (eine Richtung kurz).</p>';
  if (C.example) {
    const ex = C.example;
    const rows = C.forms.map((F, i) => {
      const n = auxFormName(C.groupId, F.hkls);
      const eig = n && FORM_TYPES_EIG[n.type];
      return `<tr class="${F.present ? '' : 'gone'}"><td><i class="sw" style="background:${formColor(col, i)}"></i>${n ? n.name : 'Form'}</td><td>${brace(F.rep)}</td>
        <td class="num">${F.present < F.hkls.length ? `${F.present} von ${F.hkls.length}` : F.hkls.length}</td><td>${eig ? hmHTML(eig) : '–'}</td></tr>`;
    }).join('');
    const gone = C.forms.some((F) => F.present < F.hkls.length);
    $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big form-sym ex-name">${ex.name}</div>
      <div class="hm-meta">${ex.formula ? `<span class="form-name">${ex.formula}</span>` : ''}<span>Punktgruppe <b>${hmHTML(groupOf(C.groupId).hm)}</b> (${groupOf(C.groupId).sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>')}), ${sysName.toLowerCase()}</span></div>
    </div>
    ${zoneBox}
    <h3>Tracht: ${C.forms.length} Formen</h3>
    <table class="formtab"><thead><tr><th>Form</th><th>Symbol</th><th>Flächen</th><th>Eigensymmetrie</th></tr></thead><tbody>${rows}</tbody></table>
    ${gone ? '<p class="note">Grau: Form ist bei diesen Abständen ganz oder teilweise weggeschnitten.</p>' : ''}
    <dl class="facts">
      <div><dt>Habitus</dt><dd>${habitHTML}</dd></div>
      <div><dt>Flächen insgesamt</dt><dd class="num">${C.faces.filter((f) => !f.hidden).length}</dd></div>
      <div><dt>Gitter</dt><dd>${latticeText(C.lat, C.sys, false)}</dd></div>
      <div><dt>Lage</dt><dd>${C.preset.name}</dd></div>
    </dl>
    ${ex.note ? `<p class="note">${ex.note}</p>` : ''}
    ${sel}
    ${aux}
    <p class="note">Quelle: ${ex.src}. Die Formen und das Gitter sind belegt; die Abstände der Formen (und damit der Habitus) sind nach den Abbildungen gewählt und lassen sich unter „Gitter und Gestalt“ ändern.</p>
    ${state.poly.faceSym ? '<p class="note">Die dunklen Dreiecke zeigen auf jeder Form die Flächensymmetrie, die sie in dieser Punktgruppe hat.</p>' : ''}
    ${habitNote}`;
    return;
  }
  // Tracht und Habitus (Begriffe nach Borchardt-Ott & Sowa, Abschn. 5.2)
  const trachtHTML = [`${formName(e)} ${brace(e.hkl)}`, ...C.auxReps.map((a) => {
    const n = auxFormName(C.groupId, a.hkls);
    return `${n ? n.name : 'Form'} ${brace(a.rep)}`;
  })].join(' + ') + (state.poly.open && C.auxReps.length ? ' <span class="muted">(Ergänzungsformen ausgeblendet)</span>' : '');
  // allgemeine Form mit höherer Eigensymmetrie: auf die geometrisch gleiche Form hinweisen
  let twinNote = '';
  const normE = (s) => EIG_SAME[s] || s;
  if (!groupOrder.has(g.id)) groupOrder.set(g.id, buildPointGroup(g.id).order);
  if (e.mult === groupOrder.get(g.id) && normE(formEig(e)) !== normE(g.hm)) {
    const tw = CATALOG.filter((x) => x.type === e.type && normE(groupOf(x.pg).hm) === normE(formEig(e)));
    if (tw.length) {
      const tg = groupOf(tw[0].pg);
      const fsList = [...new Set(tw.map((x) => x.fs))].map(hmHTML).join(' bzw. ');
      twinNote = `<p class="note">Die Eigensymmetrie der Form ist höher als die Punktgruppe: Geometrisch gleicht sie der Form „${formName(tw[0])}“ in ${hmHTML(tg.hm)}; der Unterschied liegt nur in der Flächensymmetrie (1 statt ${fsList}), sichtbar mit „Flächensymmetrie zeigen“ oder an der Lage der Pole zum Symmetriegerüst.</p>`;
    }
  }
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big form-sym">${brace(e.hkl)}</div>
      <div class="hm-meta"><span class="form-name">${formName(e)}</span><span>Punktgruppe <b>${hmHTML(g.hm)}</b> (${g.sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>')}), ${sysName.toLowerCase()}</span></div>
    </div>
    ${broken}
    ${zoneBox}
    <dl class="facts">
      <div class="wide"><dt>Tracht (auftretende Formen)</dt><dd>${trachtHTML}</dd></div>
      <div><dt>Habitus</dt><dd>${habitHTML}</dd></div>
      <div><dt>Flächen der Form</dt><dd class="num">${C.mainHKL.length}</dd></div>
      <div><dt>Indexmuster (ITA)</dt><dd>{${symText(e.sym, hex4)}}</dd></div>
      <div><dt>Wyckoff-Lage, Flächensymmetrie</dt><dd>${e.wy}, ${hmHTML(e.fs)}${state.poly.faceSym ? ` <span class="muted">(${C.motifsPerFace} Muster je Fläche)</span>` : ''}</dd></div>
      <div><dt>Eigensymmetrie der Form${state.poly.broken && C.isReduced ? ' (unverzerrt)' : ''}</dt><dd>${hmHTML(formEig(e))}</dd></div>
      <div><dt>Gitter</dt><dd>${latticeText(C.lat, C.sys, state.poly.broken)}</dd></div>
      <div><dt>Lage</dt><dd>${C.preset.name}</dd></div>
    </dl>
    ${twinNote}
    ${sel}
    ${aux}
    ${state.poly.faceSym ? `<p class="note">Die dunklen Dreiecke auf den Flächen sind ein Muster in allgemeiner Lage, vervielfältigt mit allen Operationen der Punktgruppe${C.isReduced ? ' (Restsymmetrie)' : ''}. Ihre Anordnung auf einer Fläche zeigt die Flächensymmetrie, z. B. wie Streifen oder Ätzfiguren auf realen Kristallen. Dieselbe Form kann so in verschiedenen Punktgruppen unterschiedliche Flächensymmetrie haben.</p>` : ''}
    <p class="note">Die Pole hängen nur von den Flächennormalen ab, also von Indizes und Gitter. Grösse und Abstand der Ergänzungsformen ändern die Gestalt des Kristalls, aber nicht das Stereogramm.</p>
    ${habitNote}`;
}

/** ITA-Indexmuster als HTML (z. B. h0-hl → h0h̄l); bei drei Indizes ohne i. */
const SYM3 = { hkil: 'hkl', hki0: 'hk0', 'h0-hl': 'h0l', 'hh-2hl': 'hhl', '0001': '001', '10-10': '100', '11-20': '110' };
function symText(sym, hex4) {
  const m = sym.match(/^(\S+)(?: \((.*)\))?$/);
  let t = m[1];
  if (!hex4 && SYM3[t]) t = SYM3[t];
  const html = t.replace(/-(2h|\d|[hkil])/g, '<span class="ov">$1</span>');
  return html + (m[2] ? ` (${m[2].replace('<', '&lt;').replace('>', '&gt;')})` : '');
}

// ------------------------------------------------------------------ Interaktion Stereogramm
function svgPoint(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function setPoleFromScreen(x, y) {
  const lower = state.pg.theta > 90;
  const p = unproject(x, y, lower);
  state.pg.theta = Math.acos(Math.max(-1, Math.min(1, p[2]))) / deg;
  let phi = Math.atan2(p[1], p[0]) / deg;
  if (phi < 0) phi += 360;
  state.pg.phi = phi;
  syncSliders();
  render();
}
function nearGenerator(e) {
  if (!current || current.kind !== 'pg' || !state.pg.showObject) return false;
  const q = project(generalPole());
  const s = svgPoint(e.touches ? e.touches[0] : e);
  return Math.hypot(s.x - q.x, s.y - q.y) < touchRadius(30, 28);
}
/** Ausgangspol auf die andere Halbkugel spiegeln (ρ → 180° − ρ, φ bleibt): Punkt ↔ Kreis. */
function toggleHemisphere() {
  state.pg.theta = 180 - state.pg.theta;
  syncSliders();
  render();
}
// Ausgangspol: ziehen verschiebt ihn, antippen ohne Bewegung wechselt die Halbkugel.
// Mit der Maus setzt ein Klick neben den Pol ihn an diese Stelle.
let dragging = false, moved = false, onGen = false, downAt = null;
svg.addEventListener('touchstart', (e) => { if (!state.pg.tool && nearGenerator(e)) e.preventDefault(); }, { passive: false });
svg.addEventListener('pointerdown', (e) => {
  moved = false; onGen = false;
  if (state.mode !== 'pg' || !state.pg.showObject || state.pg.tool) return;
  downAt = [e.clientX, e.clientY];
  onGen = nearGenerator(e);
  if (e.pointerType === 'mouse' || onGen) {
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    if (!onGen) { const s = svgPoint(e); setPoleFromScreen(s.x, s.y); }
  }
});
svg.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  if (!moved && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) return;
  moved = true;
  const s = svgPoint(e);
  setPoleFromScreen(s.x, s.y);
});
svg.addEventListener('pointerup', () => {
  // Hier statt im click-Ereignis: nach touchstart.preventDefault() feuert kein click.
  if (dragging && onGen && !moved && state.mode === 'pg') toggleHemisphere();
  dragging = false;
});
svg.addEventListener('pointercancel', () => { dragging = false; });
svg.addEventListener('click', (e) => {
  const s = svgPoint(e);
  if (state.mode === 'pg' && !state.pg.tool) {
    if (!state.pg.showObject || moved || onGen) return;
    if (Math.hypot(s.x - C, s.y - C) <= 212) setPoleFromScreen(s.x, s.y);
    return;
  }
  // Bei grossen (Touch-)Trefferkreisen können sich Kreise überlappen: den nächstgelegenen Pol nehmen.
  // Fallen Pole zusammen (oben und unten an derselben Stelle), schaltet wiederholtes Antippen weiter.
  const hits = [];
  for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
    if (!el.classList || !el.classList.contains('hit')) continue;
    const x = Number(el.getAttribute('cx')), y = Number(el.getAttribute('cy'));
    hits.push({ idx: Number(el.dataset.idx), upper: el.dataset.upper === '1', x, y, d: Math.hypot(s.x - x, s.y - y) });
  }
  if (!hits.length) { pickFace(null); return; }
  hits.sort((a, b) => a.d - b.d);
  const near = hits[0];
  const stack = hits.filter((h) => Math.hypot(h.x - near.x, h.y - near.y) < 2)
    .sort((a, b) => (b.upper - a.upper) || (a.idx - b.idx)).map((h) => h.idx);
  pickStack(stack);
});

/** Aktives Werkzeug und Auswahl je Modus (Punktgruppen: nur Winkel; Kristallformen: Zone/Winkel). */
const curTool = () => (state.mode === 'pg' ? state.pg.tool : state.poly.tool);
const getPicks = () => (state.mode === 'pg' ? state.pgSel : state.zoneSel);
const setPicks = (v) => { if (state.mode === 'pg') state.pgSel = v; else state.zoneSel = v; };

/** Antippen einer Stelle mit einem oder mehreren zusammenfallenden Polen:
 *  nichts gewählt → erster (oberer) Pol; sonst der nächste; nach dem letzten → keiner.
 *  Mit Werkzeug (Zone/Winkel) kommt bei zwei Polen zusätzlich „beide“ dazu. */
function pickStack(stack) {
  if (stack.length === 1) { pickFace(stack[0]); return; }
  if (curTool()) {
    // Folge: oberer → unterer → beide (bei zwei Polen) → keiner; so lässt sich auch der Winkel
    // bzw. die Zone zweier übereinanderliegender Pole allein im Stereogramm bestimmen.
    const options = [...stack.map((i) => [i]), ...(stack.length === 2 ? [stack.slice()] : []), []];
    const picks = getPicks();
    const sel = stack.filter((k) => picks.includes(k));
    const rest = picks.filter((k) => !stack.includes(k));
    const k = options.findIndex((o) => o.length === sel.length && o.every((x) => sel.includes(x)));
    const next = options[(k + 1) % options.length];
    setPicks([...rest, ...next].slice(-2));
    state.selected = null;
  } else {
    const k = stack.indexOf(state.selected);
    state.selected = k + 1 < stack.length ? stack[k + 1] : null;
  }
  render();
}

/** Fläche antippen: normale Auswahl oder, mit Werkzeug Zone/Winkel, bis zu zwei Flächen. */
function pickFace(idx) {
  if (curTool()) {
    const picks = getPicks();
    if (idx == null) setPicks([]);
    else if (picks.includes(idx)) setPicks(picks.filter((k) => k !== idx));
    else setPicks(picks.length >= 2 ? [idx] : [...picks, idx]);
    state.selected = null;
  } else {
    state.selected = idx === state.selected ? null : idx;
  }
  render();
}

// ------------------------------------------------------------------ 3D-Ansicht
const view3d = new View3D($('view3d'), {
  onSelect: (idx) => {
    if (state.mode !== 'poly') return;
    pickFace(idx);
  },
});
for (const b of document.querySelectorAll('[data-view]')) {
  b.addEventListener('click', () => view3d.setView(b.dataset.view));
}

// ------------------------------------------------------------------ Bedienelemente verbinden
function bindCheck(id, obj, key) {
  const el = $(id);
  el.checked = !!obj[key];
  el.addEventListener('change', () => { obj[key] = el.checked; render(); });
}
const sliders = [];
function bindRange(id, obj, key, fmt) {
  const el = $(id), out = $(id + '-out');
  const sync = () => { el.value = obj[key]; if (out) out.textContent = fmt(Number(obj[key])); };
  sync();
  sliders.push(sync);
  el.addEventListener('input', () => { obj[key] = Number(el.value); if (out) out.textContent = fmt(obj[key]); render(); });
}
function syncSliders() { sliders.forEach((s) => s()); }

function setMode(mode) {
  state.mode = mode;
  state.selected = null;
  $('tab-pg').setAttribute('aria-selected', String(mode === 'pg'));
  $('tab-poly').setAttribute('aria-selected', String(mode === 'poly'));
  for (const id of ['ctl-pg', 'ctl-pg-opts']) $(id).hidden = mode !== 'pg';
  for (const id of ['ctl-poly', 'ctl-poly-lat', 'row-normals', 'v3d-tools']) $(id).hidden = mode !== 'poly';
  $('stereo-tools').hidden = false;
  syncToolBtns();
  if (mode !== 'poly') $('v3d-hint').textContent = '';
  if (mode !== 'pg') $('v3d-dirs').hidden = true;
  $('stereo-sub').textContent = 'Blick ∥ c';
  render();
}

function init() {
  buildGroupPicker();
  refreshPolyControls();

  bindCheck('pg-elements', state.pg, 'showElements');
  bindCheck('pg-object', state.pg, 'showObject');
  bindCheck('pg-colorful', state.pg, 'colorful');
  bindCheck('v-dircolors', state.view, 'dirColors');
  $('v3d-dirs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-pos]');
    if (!b) return;
    const k = Number(b.dataset.pos);
    const hide = new Set(state.pg.hideDirs);
    if (hide.has(k)) hide.delete(k); else hide.add(k);
    state.pg.hideDirs = [...hide];
    render();
  });
  bindRange('pg-theta', state.pg, 'theta', (v) => v.toFixed(0) + '°');
  bindRange('pg-phi', state.pg, 'phi', (v) => v.toFixed(1) + '°');

  buildSystemSelect();
  $('sys-select').addEventListener('change', (e) => {
    state.poly.system = e.target.value; state.poly.example = null; state.selected = null; state.zoneSel = [];
    refreshPolyControls(); render();
  });
  $('form-select').addEventListener('change', (e) => {
    if (!e.target.value) return;
    state.poly.entryBySys[state.poly.system] = e.target.value; state.selected = null; state.zoneSel = [];
    if (state.poly.example) { state.poly.example = null; refreshPolyControls(); }
    render();
  });
  $('ex-select').addEventListener('change', (e) => { setExample(e.target.value); render(); });
  $('preset-select').addEventListener('change', (e) => { state.poly.presetId = e.target.value; render(); });
  for (const k of ['ba', 'ca', 'al', 'be', 'ga']) {
    $('lat-' + k).addEventListener('input', (ev) => {
      const lat = currentLat();
      if (!state.poly.broken) Object.assign(lat, constrainLattice(lat, state.poly.system));
      lat[k] = Number(ev.target.value);
      syncLatSliders(); render();
    });
  }
  $('poly-broken').checked = state.poly.broken;
  $('poly-broken').addEventListener('change', (ev) => {
    state.poly.broken = ev.target.checked;
    const sys = state.poly.system;
    state.poly.lats[sys] = constrainLattice(currentLat(), sys);
    refreshPolyControls(); render();
  });
  $('poly-reset').addEventListener('click', () => {
    const ex = currentExample();
    state.poly.lats[state.poly.system] = { ...LATTICE_DEFAULTS[state.poly.system], ...(ex ? ex.lat : {}) };
    if (ex) delete state.poly.exScale[ex.id];
    state.poly.auxDist = 1; state.poly.size = 0.75;
    syncLatSliders(); syncSliders(); buildExDists(); render();
  });
  bindCheck('poly-open', state.poly, 'open');
  bindRange('poly-aux', state.poly, 'auxDist', (v) => v.toFixed(2));
  bindRange('poly-size', state.poly, 'size', (v) => v.toFixed(2));
  bindCheck('poly-labels', state.poly, 'labels');
  bindCheck('poly-bravais', state.poly, 'bravais');
  $('poly-bravais').addEventListener('change', () => { buildFormSelect(); buildExDists(); });
  bindCheck('poly-lower', state.poly, 'showLower');
  bindCheck('poly-frame', state.poly, 'frame');
  bindCheck('poly-facesym', state.poly, 'faceSym');
  syncFormHint = () => { $('form-hint').hidden = state.poly.faceSym || !!currentExample(); };
  $('poly-facesym').addEventListener('change', () => { buildFormSelect(); syncFormHint(); });
  syncFormHint();
  // Werkzeuge „Zone“ und „Winkel“: je ein Button am Stereogramm und in der 3D-Ansicht,
  // gemeinsamer Zustand; höchstens ein Werkzeug aktiv
  syncToolBtns = () => {
    for (const b of document.querySelectorAll('.tool-toggle')) {
      b.setAttribute('aria-pressed', String(curTool() === b.dataset.tool));
      b.hidden = state.mode === 'pg' && b.dataset.tool !== 'angle'; // Zone nur bei Kristallformen
    }
  };
  for (const b of document.querySelectorAll('.tool-toggle')) {
    b.addEventListener('click', () => {
      const t = curTool() === b.dataset.tool ? null : b.dataset.tool;
      if (state.mode === 'pg') state.pg.tool = t; else state.poly.tool = t;
      setPicks([]); state.selected = null;
      syncToolBtns(); render();
    });
  }
  syncToolBtns();

  bindCheck('v-wulff', state.view, 'wulff');
  bindRange('v-wulffrot', state.view, 'wulffRot', (v) => v.toFixed(0) + '°');
  bindCheck('v-axes', state.view, 'axes');
  bindCheck('v-sphere', state.view, 'sphere');
  bindCheck('v-plane', state.view, 'plane');
  bindCheck('v-rays', state.view, 'rays');
  bindCheck('v-normals', state.view, 'normals');
  $('v-wulff').addEventListener('change', () => { $('row-wulffrot').hidden = !state.view.wulff; });
  $('row-wulffrot').hidden = !state.view.wulff;

  // Telefon: Umschalter Stereogramm/3D
  const setFig = (f) => {
    state.fig = f === '3d' ? '3d' : 'stereo';
    document.body.dataset.fig = state.fig;
    for (const b of document.querySelectorAll('.figswitch button')) b.setAttribute('aria-pressed', String(b.dataset.fig === state.fig));
  };
  for (const b of document.querySelectorAll('.figswitch button')) b.addEventListener('click', () => setFig(b.dataset.fig));
  setFig(state.fig);

  // Auf dem Telefon „Darstellung“ zunächst eingeklappt
  if (window.matchMedia('(max-width: 719px)').matches) $('sec-view').open = false;

  $('copy-link').addEventListener('click', async () => {
    const btn = $('copy-link');
    save();
    try { await navigator.clipboard.writeText(location.origin + location.pathname + location.search + stateToHash()); btn.textContent = 'Link kopiert'; }
    catch { btn.textContent = 'Nicht möglich'; }
    setTimeout(() => { btn.textContent = 'Link kopieren'; }, 1600);
  });

  $('reset-all').addEventListener('click', () => {
    resetting = true;
    try { localStorage.removeItem('stereo-state'); } catch { /* ignorieren */ }
    location.replace(location.pathname + location.search);
  });

  // Trefferradien hängen von der dargestellten Grösse ab
  let lastW = 0;
  new ResizeObserver(() => {
    const w = Math.round(svg.getBoundingClientRect().width);
    // Verborgen (Telefon, 3D-Ansicht aktiv): Breite vergessen, damit beim Wiedereinblenden neu gezeichnet wird
    if (!w) { lastW = 0; return; }
    if (Math.abs(w - lastW) > 4) { lastW = w; render(); }
  }).observe(svg);

  $('tab-pg').addEventListener('click', () => setMode('pg'));
  $('tab-poly').addEventListener('click', () => setMode('poly'));

  // SVG-Export
  const svgString = () => {
    const sc = { ...current.scene, poles: current.scene.poles.map((p) => ({ ...p, gen: false, selected: false })), bg: current.scene.col.paper };
    return buildSVG(sc, { standalone: true }).full;
  };
  $('copy-svg').addEventListener('click', async () => {
    const btn = $('copy-svg');
    try { await navigator.clipboard.writeText(svgString()); btn.textContent = 'Kopiert'; }
    catch { btn.textContent = 'Nicht möglich'; }
    setTimeout(() => { btn.textContent = 'SVG kopieren'; }, 1600);
  });
  if (window.STEREO_PREVIEW) $('save-svg').hidden = true;
  $('save-svg').addEventListener('click', () => {
    const blob = new Blob([svgString()], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const name = state.mode === 'pg' ? 'stereogramm-' + state.pg.id.replace(/\//g, '_') : 'stereogramm-' + currentEntryId().replace(/[/:]/g, '_');
    a.download = name + '.svg';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  // Farbwechsel des Systems (hell/dunkel) → neu zeichnen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  setMode(state.mode);
}

init();
