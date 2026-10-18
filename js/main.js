// Steuerung der App: Zustand, Bedienelemente, Verknüpfung von Stereogramm und 3D-Ansicht.

import {
  POINT_GROUPS, SYSTEMS, buildPointGroup, orbit, elementSummary, HEX_A, HEX_B,
} from './pointgroups.js';
import {
  buildCrystal, zoneOf, dirToFour, orientationPresets, LATTICE_DEFAULTS, FREE_PARAMS, constrainLattice, SYSTEM_OF, isHexSystem, auxFormName,
} from './polyhedra.js';
import { CATALOG, formName, formEig, entryById } from './forms.js';
import { buildSVG, unproject, project, symbolIcon, C } from './stereogram.js';
import { hmHTML, hmText, hklParts, hklHTML, indices } from './format.js';
import { cross, normalize } from './linalg.js';
import { View3D } from './view3d.js';

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
  pg: { id: 'mm2', monoAxis: 'b', famPref: {}, showElements: true, showObject: true, theta: 59, phi: 14.5, colorful: false },
  poly: {
    system: 'kubisch', entryBySys: {}, presetId: '001', lats: {}, broken: false, open: false, auxDist: 1,
    size: 0.75, labels: true, showLower: true, bravais: false, frame: false, faceSym: true, zoneMode: false,
  },
  view: { wulff: false, wulffRot: 0, axes: false, sphere: true, plane: true, rays: true, normals: true },
  selected: null,
  zoneSel: [],
  fig: 'stereo', // Telefon: sichtbare Tafel
};
try {
  const saved = JSON.parse(localStorage.getItem('stereo-state') || 'null');
  if (saved && (saved.v === 2 || saved.v === 3)) {
    Object.assign(state.pg, saved.pg); Object.assign(state.view, saved.view);
    if (saved.v === 3) Object.assign(state.poly, saved.poly);
    state.mode = saved.mode === 'poly' ? 'poly' : 'pg';
    if (!POINT_GROUPS.some((g) => g.id === state.pg.id)) state.pg.id = 'mm2';
  }
} catch { /* Speicher nicht verfügbar */ }
let resetting = false;
const save = () => {
  if (resetting) return;
  try { localStorage.setItem('stereo-state', JSON.stringify({ v: 3, mode: state.mode, pg: state.pg, poly: state.poly, view: state.view })); } catch { /* ignorieren */ }
};

// ------------------------------------------------------------------ Farben aus CSS-Tokens
function palette() {
  const cs = getComputedStyle(document.documentElement);
  const g = (n) => cs.getPropertyValue('--' + n).trim();
  const colorful = state.mode === 'pg' ? state.pg.colorful : false;
  return {
    paper: g('paper'), ink: g('ink'), muted: g('muted'), net: g('net'),
    mirror: colorful ? g('mirror') : g('ink'), axis: g('ink'),
    upper: g('upper'), accent: g('accent'), accent2: g('accent2'),
    ray: g('ray'), crystal: g('crystal'), crystal2: g('crystal2'), edge: g('edge'),
    normal: g('normal'), sphere: g('muted'), mirror3d: g('mirror'),
    ax2: g('ax2'), ax3: g('ax3'), ax4: g('ax4'), ax6: g('ax6'),
  };
}
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
      sets += `<span class="mono-axis"><span>eindeutige Achse</span><button class="pgb" data-axis="b" type="button" aria-label="Achse b">b</button><button class="pgb" data-axis="c" type="button" aria-label="Achse c">c</button></span>`;
    }
    row.innerHTML = `<span class="sys">${name}</span><div class="btns">${btns}${sets}</div>`;
    box.appendChild(row);
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const cur = groupOf(state.pg.id);
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
  for (const r of document.querySelectorAll('#pg-picker [data-setrow]')) r.hidden = r.dataset.setrow !== fam;
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
const currentEntryId = () => {
  const id = state.poly.entryBySys[state.poly.system];
  return id && entryById(id) && SYSTEM_OF[entryById(id).pg] === state.poly.system ? id : DEFAULT_ENTRY[state.poly.system];
};
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
  const groups = POINT_GROUPS.filter((g) => g.system === sys && CATALOG.some((e) => e.pg === g.id));
  $('form-select').innerHTML = groups.map((g) => {
    const opts = CATALOG.filter((e) => e.pg === g.id)
      .map((e) => `<option value="${e.id}">${formName(e)} ${formLabelText(e.hkl, hex4)}</option>`).join('');
    return `<optgroup label="Punktgruppe ${hmText(g.hm)} (${g.sf})">${opts}</optgroup>`;
  }).join('');
  $('form-select').value = currentEntryId();
}

function refreshPolyControls() {
  const sys = state.poly.system;
  buildFormSelect();
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
  const scene = {
    col, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: state.view.wulffRot },
    primitiveBold: state.pg.showElements && info.mirrors.some((n) => Math.abs(n[2]) > 1 - 1e-6),
    mirrors: state.pg.showElements ? info.mirrors : [],
    axes: state.pg.showElements ? info.axes : [],
    centreAtOrigin: state.pg.showElements && info.centro && !axisAlongZ,
    zones: state.pg.showElements && info.system === 'kubisch' ? CUBIC_ZONES : [],
    poles: state.pg.showObject ? orb.map((o, i) => ({ p: o.p, det: o.det, idx: i, gen: i === 0 })) : [],
    colorByDet: state.pg.colorful,
    showLower: true,
    axisLabels: state.view.axes ? crystalAxesFor(info.hex) : [],
  };
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'pg', info, scene };
  updateLegendPG(info, col);
  updateInfoPG(info, orb, col);
  const tex = buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, gen: false })) }, { standalone: true }).full;
  view3d.setStereoTexture(tex);
  view3d.showPointGroup(
    { ...info, orbit: state.pg.showObject ? orb : null, p0, crystalAxes: crystalAxesFor(info.hex) },
    col,
    { showElements: state.pg.showElements, showObject: state.pg.showObject, showRays: state.view.rays, showSphere: state.view.sphere, showPlane: state.view.plane, showAxes: state.view.axes },
  );
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
  const C = buildCrystal({
    entryId: currentEntryId(), lat: currentLat(), broken: state.poly.broken,
    auxDist: state.poly.auxDist, presetId: state.poly.presetId,
  });
  const hex4 = C.hex && state.poly.bravais;
  const oc = ORBIT_COLORS(col);
  const multi = C.isReduced && C.orbitsMain.length > 1;
  C.faces.forEach((f) => {
    f.hidden = state.poly.open && f.role === 'aux';
    f.color2d = f.role === 'aux' ? col.muted : multi ? oc[f.orbit % oc.length] : null;
    f.color3d = f.role === 'aux' ? col.crystal2 : multi ? oc[f.orbit % oc.length] : col.crystal;
  });
  if (state.selected != null && (!C.faces[state.selected] || C.faces[state.selected].hidden)) state.selected = null;
  state.zoneSel = state.zoneSel.filter((k) => C.faces[k] && !C.faces[k].hidden);
  if (!state.poly.zoneMode) state.zoneSel = [];
  const zone = state.zoneSel.length === 2 ? zoneOf(C, state.zoneSel[0], state.zoneSel[1]) : null;
  C.zone = zone;
  const inZone = new Set(zone ? zone.inZone : []);
  const fw = state.poly.frame ? C.framework : null;
  const scene = {
    col: { ...col, mirror: col.ink }, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: state.view.wulffRot },
    primitiveBold: !!fw && fw.mirrors.some((n) => Math.abs(n[2]) > 1 - 1e-6),
    mirrors: fw ? fw.mirrors : [], axes: fw ? fw.axes : [],
    zones: fw && C.sys === 'kubisch' && !C.isReduced ? C.zones : [],
    faint: true,
    centreAtOrigin: !!fw && fw.centro && !fw.axes.some((a) => Math.abs(a.dir[2]) > 1 - 1e-6),
    poles: C.faces.map((f, i) => (f.hidden ? null : {
      p: f.normal, det: 1, idx: i, color: f.color2d, aux: f.role === 'aux',
      label: state.poly.labels ? hklParts(f.hkl, hex4) : null, selected: state.selected === i || state.zoneSel.includes(i), zone: inZone.has(i),
    })).filter(Boolean),
    showLower: state.poly.showLower,
    hitR: touchRadius(13, 22),
    axisLabels: state.view.axes ? C.axes : [],
    zone: zone ? { axis: zone.axis, label: dirParts(zone.uvw, hex4) } : null,
  };
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'poly', C, scene };
  updateLegendPoly(C, col);
  updateInfoPoly(C, col);
  $('ctl-poly-open').hidden = !C.auxForms.length;
  $('stereo-sub').textContent = 'Blick ∥ ' + C.preset.name.replace(' ∥ Blickrichtung', '').replace(/ \(.*\)/, '');
  view3d.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, selected: false })) }, { standalone: true }).full);
  const labels3d = state.poly.labels ? C.faces.map((f) => hklHTML(f.hkl, hex4)) : null;
  view3d.showPolyhedron(C, col,
    { showRays: state.view.rays, showSphere: state.view.sphere, showPlane: state.view.plane, showAxes: state.view.axes, showNormals: state.view.normals, size: state.poly.size, planeOpacity: 0.55, motifs: state.poly.faceSym ? C.motifs : null, zone, picked: state.poly.zoneMode ? state.zoneSel : [] },
    state.selected, labels3d);
}

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

function updateLegendPG(info, col) {
  const items = [];
  if (state.pg.showObject) {
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Pol oben</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Pol unten</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/><circle r="4" fill="${col.ink}"/></svg>beide</span>`);
    items.push(`<span class="lg"><svg width="20" height="20" viewBox="-10 -10 20 20"><circle r="8" fill="none" stroke="${col.accent}" stroke-width="1.6" stroke-dasharray="2.6 2.2"/><circle r="3" fill="${col.ink}"/></svg>Ausgangspol</span>`);
  }
  if (state.pg.showElements) {
    if (info.mirrors.length) items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.mirror}" stroke-width="3.2" stroke-linecap="round"/></svg>Spiegelebene</span>`);
    const icol = { ...col, axis: col.ink, paper: col.paper };
    // Wie im Stereogramm: Punkt für das Inversionszentrum nur im Symbol der Achse ∥ c
    const ORDER = ['6', '-6', '4', '-4', '3', '-3', '2'];
    const drawn = new Set(info.axes.map((a) => a.symbol + '|' + (a.centre && Math.abs(a.dir[2]) > 1 - 1e-6 ? 'c' : '')));
    for (const s of ORDER) {
      for (const c of [true, false]) {
        if (drawn.has(s + '|' + (c ? 'c' : ''))) items.push(`<span class="lg">${symbolIcon(s, c, icol, 18)}${axisLegendText(s, c)}</span>`);
      }
    }
    if (current && current.scene && current.scene.centreAtOrigin) {
      items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="3.6" fill="${col.paper}" stroke="${col.ink}" stroke-width="1.3"/></svg>Inversionszentrum</span>`);
    }
  }
  if (state.pg.colorful && state.pg.showObject) {
    items.push(`<span class="lg"><i class="sw" style="background:${col.upper}"></i>gleiche Händigkeit</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${col.accent2}"></i>Spiegelbild</span>`);
  }
  if (state.pg.showObject) {
    items.push(`<span class="lg hint"><span class="only-fine">Ausgangspol ziehen oder Stelle anklicken; Ausgangspol anklicken: Halbkugel wechseln</span><span class="only-coarse">Ausgangspol ziehen oder Stelle antippen; Ausgangspol antippen: Halbkugel wechseln</span></span>`);
  }
  $('legend').innerHTML = items.join('');
}
function updateLegendPoly(C, col) {
  const items = [
    `<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Flächenpol oben</span>`,
    `<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Flächenpol unten</span>`,
  ];
  if (C.auxForms.length && !state.poly.open) items.push(`<span class="lg"><i class="sw" style="background:${col.muted}"></i>Ergänzungsform</span>`);
  if (C.zone) {
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="2.2"/></svg>Zonenkreis</span>`);
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="1.6" stroke-dasharray="5 4"/></svg>untere Hälfte</span>`);
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><path d="M-5,-5L5,5M-5,5L5,-5" stroke="${col.accent}" stroke-width="2"/></svg>Zonenachse</span>`);
  }
  items.push(state.poly.zoneMode ? '<span class="lg hint">Zwei Pole antippen: Zone bestimmen (Werkzeug „Zone“ beendet)</span>' : '<span class="lg hint">Pol oder Fläche antippen zum Hervorheben; liegen zwei Pole übereinander, schaltet erneutes Antippen weiter · Werkzeug „Zone“: Zonen bestimmen</span>');
  $('legend').innerHTML = items.join('');
}

const yesno = (b) => (b ? 'ja' : 'nein');

function updateInfoPG(info, orb, col) {
  const sum = elementSummary(info);
  const elems = sum.axes.map((a) => `<li>${symbolIcon(a.symbol, a.centre, { ...col, axis: col.ink, paper: col.paper })}<span>${a.count}× ${hmHTML(a.symbol)}${a.centre ? ' (mit Inversionszentrum)' : ''}</span></li>`);
  if (sum.mirrors) elems.push(`<li><svg class="sym-icon" width="26" height="26" viewBox="0 0 26 26"><line x1="3" y1="13" x2="23" y2="13" stroke="${col.ink}" stroke-width="3.2" stroke-linecap="round"/></svg><span>${sum.mirrors} Spiegelebene${sum.mirrors > 1 ? 'n' : ''}</span></li>`);
  if (sum.centre) elems.push(`<li><svg class="sym-icon" width="26" height="26" viewBox="-13 -13 26 26"><circle r="4.5" fill="${col.paper}" stroke="${col.ink}" stroke-width="1.4"/></svg><span>Inversionszentrum</span></li>`);
  if (!elems.length) elems.push('<li><span>nur die Identität 1</span></li>');
  const lower = orb.filter((o) => o.p[2] < -1e-9).length;
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big">${hmHTML(info.hm)}</div>
      <div class="hm-meta"><span>${info.system[0].toUpperCase() + info.system.slice(1)}${info.setting ? ' · Aufstellung ' + (info.setting.startsWith('Achse') ? info.setting : hmHTML(info.setting)) : ''}</span>
      <span>Schoenflies ${info.sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>')}</span></div>
    </div>
    <dl class="facts">
      <div><dt>Volles Symbol</dt><dd>${info.full.split(' ').map(hmHTML).join('&#8239;')}</dd></div>
      <div><dt>Ordnung</dt><dd class="num">${info.order}</dd></div>
      <div><dt>Laue-Klasse</dt><dd>${hmHTML(info.laue)}</dd></div>
      <div><dt>Zentrosymmetrisch</dt><dd>${yesno(info.centro)}</dd></div>
      <div><dt>Enantiomorph</dt><dd>${yesno(info.chiral)}</dd></div>
      <div><dt>Polar</dt><dd>${yesno(info.polar)}</dd></div>
    </dl>
    <h3>Symmetrieelemente</h3>
    <ul class="elems">${elems.join('')}</ul>
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
      <div><dt>φ (Azimut ab x↓)</dt><dd class="num">${phi.toFixed(1)}°</dd></div></dl></div>`;
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
  if (state.poly.zoneMode) {
    if (!C.zone) {
      zoneBox = state.zoneSel.length === 2
        ? '<div class="zonebox">Die beiden Flächen sind parallel und bestimmen keine Zone. Bitte eine andere Fläche wählen.</div>'
        : `<div class="zonebox">Zone bestimmen: ${state.zoneSel.length === 0 ? 'zwei Pole' : 'einen zweiten Pol'} im Stereogramm oder zwei Flächen in der 3D-Ansicht antippen.</div>`;
    } else {
      const z = C.zone;
      const f1 = C.faces[state.zoneSel[0]].hkl, f2 = C.faces[state.zoneSel[1]].hkl;
      const dir = (v) => '[' + (hex4 ? dirToFour(v) : v).map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join(Math.max(...v.map(Math.abs)) > 9 ? ' ' : '') + ']';
      const faces = z.inZone.map((k) => hklHTML(C.faces[k].hkl, hex4)).join(' ');
      const dev = z.normalDev > 0.05
        ? `Die Richtung ${dir(z.uvw)} fällt hier nicht mit der Normalen der Fläche ${hklHTML(z.uvw, hex4)} zusammen (Abweichung ${z.normalDev.toFixed(1)}°); der Pol der Zone ist die Richtung, nicht die Flächennormale.`
        : `In diesem Gitter fällt die Richtung ${dir(z.uvw)} mit der Normalen der Fläche ${hklHTML(z.uvw, hex4)} zusammen.`;
      zoneBox = `<div class="zonebox"><strong>Zone ${dir(z.uvw)}</strong>
        <p>Zonenachse ${dir(z.uvw)} = ${hklHTML(f1, false)} × ${hklHTML(f2, false)}. Winkel zwischen den Polen: <b class="num">${z.angle.toFixed(1)}°</b>.</p>
        <p>Flächen in dieser Zone (Weiss'sches Zonengesetz hu + kv + lw = 0), ${z.inZone.length}: ${faces}</p>
        <p class="note">${dev} Die Kanten zwischen Flächen der Zone verlaufen parallel zur Zonenachse (in 3D hervorgehoben).</p></div>`;
    }
  }
  const sysName = SYSTEM_NAMES[C.sys];
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big form-sym">${brace(e.hkl)}</div>
      <div class="hm-meta"><span class="form-name">${formName(e)}</span><span>Punktgruppe <b>${hmHTML(g.hm)}</b> (${g.sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>')}), ${sysName.toLowerCase()}</span></div>
    </div>
    ${broken}
    ${zoneBox}
    <dl class="facts">
      <div><dt>Flächen der Form</dt><dd class="num">${C.mainHKL.length}</dd></div>
      <div><dt>Indexmuster (ITA)</dt><dd>{${symText(e.sym, hex4)}}</dd></div>
      <div><dt>Wyckoff-Lage, Flächensymmetrie</dt><dd>${e.wy}, ${hmHTML(e.fs)}${state.poly.faceSym ? ` <span class="muted">(${C.motifsPerFace} Muster je Fläche)</span>` : ''}</dd></div>
      <div><dt>Eigensymmetrie der Form${state.poly.broken && C.isReduced ? ' (unverzerrt)' : ''}</dt><dd>${hmHTML(formEig(e))}</dd></div>
      <div><dt>Gitter</dt><dd>${latticeText(C.lat, C.sys, state.poly.broken)}</dd></div>
      <div><dt>Lage</dt><dd>${C.preset.name}</dd></div>
    </dl>
    ${sel}
    ${aux}
    ${state.poly.faceSym ? `<p class="note">Die dunklen Dreiecke auf den Flächen sind ein Muster in allgemeiner Lage, vervielfältigt mit allen Operationen der Punktgruppe${C.isReduced ? ' (Restsymmetrie)' : ''}. Ihre Anordnung auf einer Fläche zeigt die Flächensymmetrie, z. B. wie Streifen oder Ätzfiguren auf realen Kristallen. Dieselbe Form kann so in verschiedenen Punktgruppen unterschiedliche Flächensymmetrie haben.</p>` : ''}
    <p class="note">Die Pole hängen nur von den Flächennormalen ab, also von Indizes und Gitter. Grösse und Abstand der Ergänzungsformen ändern die Gestalt des Kristalls, aber nicht das Stereogramm.</p>`;
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
svg.addEventListener('touchstart', (e) => { if (nearGenerator(e)) e.preventDefault(); }, { passive: false });
svg.addEventListener('pointerdown', (e) => {
  moved = false; onGen = false;
  if (state.mode !== 'pg' || !state.pg.showObject) return;
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
  if (state.mode === 'pg') {
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

/** Antippen einer Stelle mit einem oder mehreren zusammenfallenden Polen:
 *  nichts gewählt → erster (oberer) Pol; sonst der nächste; nach dem letzten → keiner. */
function pickStack(stack) {
  if (stack.length === 1) { pickFace(stack[0]); return; }
  if (state.poly.zoneMode) {
    const sel = state.zoneSel.filter((k) => stack.includes(k));
    const rest = state.zoneSel.filter((k) => !stack.includes(k));
    const k = sel.length ? stack.indexOf(sel[sel.length - 1]) : -1;
    const next = k + 1 < stack.length ? [stack[k + 1]] : [];
    state.zoneSel = [...rest, ...next].slice(-2);
    state.selected = null;
  } else {
    const k = stack.indexOf(state.selected);
    state.selected = k + 1 < stack.length ? stack[k + 1] : null;
  }
  render();
}

/** Fläche antippen: normale Auswahl oder, im Zonenmodus, bis zu zwei Flächen für die Zone. */
function pickFace(idx) {
  if (state.poly.zoneMode) {
    if (idx == null) state.zoneSel = [];
    else if (state.zoneSel.includes(idx)) state.zoneSel = state.zoneSel.filter((k) => k !== idx);
    else state.zoneSel = state.zoneSel.length >= 2 ? [idx] : [...state.zoneSel, idx];
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
  for (const id of ['ctl-poly', 'ctl-poly-lat', 'row-normals', 'stereo-tools']) $(id).hidden = mode !== 'poly';
  $('stereo-sub').textContent = 'Blick ∥ c';
  render();
}

function init() {
  buildGroupPicker();
  refreshPolyControls();

  bindCheck('pg-elements', state.pg, 'showElements');
  bindCheck('pg-object', state.pg, 'showObject');
  bindCheck('pg-colorful', state.pg, 'colorful');
  bindRange('pg-theta', state.pg, 'theta', (v) => v.toFixed(0) + '°');
  bindRange('pg-phi', state.pg, 'phi', (v) => v.toFixed(1) + '°');

  buildSystemSelect();
  $('sys-select').addEventListener('change', (e) => {
    state.poly.system = e.target.value; state.selected = null;
    refreshPolyControls(); render();
  });
  $('form-select').addEventListener('change', (e) => {
    state.poly.entryBySys[state.poly.system] = e.target.value; state.selected = null; render();
  });
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
    state.poly.lats[state.poly.system] = { ...LATTICE_DEFAULTS[state.poly.system] };
    state.poly.auxDist = 1; state.poly.size = 0.75;
    syncLatSliders(); syncSliders(); render();
  });
  bindCheck('poly-open', state.poly, 'open');
  bindRange('poly-aux', state.poly, 'auxDist', (v) => v.toFixed(2));
  bindRange('poly-size', state.poly, 'size', (v) => v.toFixed(2));
  bindCheck('poly-labels', state.poly, 'labels');
  bindCheck('poly-bravais', state.poly, 'bravais');
  $('poly-bravais').addEventListener('change', () => buildFormSelect());
  bindCheck('poly-lower', state.poly, 'showLower');
  bindCheck('poly-frame', state.poly, 'frame');
  bindCheck('poly-facesym', state.poly, 'faceSym');
  // Werkzeug „Zone“ am Stereogramm
  const syncZoneBtn = () => $('zone-btn').setAttribute('aria-pressed', String(!!state.poly.zoneMode));
  $('zone-btn').addEventListener('click', () => {
    state.poly.zoneMode = !state.poly.zoneMode;
    state.zoneSel = []; state.selected = null;
    syncZoneBtn(); render();
  });
  syncZoneBtn();

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

  $('reset-all').addEventListener('click', () => {
    resetting = true;
    try { localStorage.removeItem('stereo-state'); } catch { /* ignorieren */ }
    location.reload();
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
