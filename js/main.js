// Steuerung der App: Zustand, Bedienelemente, Verknüpfung von Stereogramm und 3D-Ansicht.

import {
  POINT_GROUPS, SYSTEMS, buildPointGroup, orbit, elementSummary, HEX_A, HEX_B,
} from './pointgroups.js';
import { FORMS, buildPolyhedron, nfoldVariants, orientationPresets } from './polyhedra.js';
import { buildSVG, unproject, project, symbolIcon, C } from './stereogram.js';
import { hmHTML, hmText, hklParts, hklHTML, indices } from './format.js';
import { cross, normalize } from './linalg.js';
import { View3D } from './view3d.js';

const $ = (id) => document.getElementById(id);
const deg = Math.PI / 180;

// ------------------------------------------------------------------ Zustand
const state = {
  mode: 'pg',
  pg: { id: '4/mmm', monoAxis: 'b', showElements: true, showObject: true, theta: 59, phi: 14.5, colorful: false },
  poly: { formId: 'oktaeder', n: 4, variant: 0, ba: 1, ca: 1, height: 1.5, size: 0.75, presetId: '001', labels: true, showLower: true, bravais: false },
  view: { wulff: false, wulffRot: 0, axes: false, sphere: true, plane: true, rays: true, normals: true },
  selected: null,
};
try {
  const saved = JSON.parse(localStorage.getItem('stereo-state') || 'null');
  if (saved && saved.v === 2) {
    Object.assign(state.pg, saved.pg); Object.assign(state.poly, saved.poly); Object.assign(state.view, saved.view);
    state.mode = saved.mode === 'poly' ? 'poly' : 'pg';
    if (!POINT_GROUPS.some((g) => g.id === state.pg.id)) state.pg.id = '4/mmm';
    if (!FORMS.some((f) => f.id === state.poly.formId)) state.poly.formId = 'oktaeder';
  }
} catch { /* Speicher nicht verfügbar */ }
const save = () => {
  try { localStorage.setItem('stereo-state', JSON.stringify({ v: 2, mode: state.mode, pg: state.pg, poly: state.poly, view: state.view })); } catch { /* ignorieren */ }
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
function buildGroupPicker() {
  const box = $('pg-picker');
  box.innerHTML = '';
  for (const sys of SYSTEMS) {
    const row = document.createElement('div');
    row.className = 'sysrow';
    const name = (sys[0].toUpperCase() + sys.slice(1)).replace('Orthorhombisch', 'Ortho\u00ADrhombisch');
    let btns = '';
    const seen = new Set();
    for (const g of POINT_GROUPS.filter((x) => x.system === sys)) {
      if (sys === 'monoklin') {
        if (seen.has(g.hm)) continue;
        seen.add(g.hm);
        btns += `<button class="pgb" data-mono="${g.hm}" type="button">${hmHTML(g.hm)}</button>`;
      } else {
        const label = g.setting || g.hm;
        btns += `<button class="pgb" data-id="${g.id}" type="button" title="${g.setting ? 'Punktgruppe ' + hmText(g.hm) + ', Aufstellung ' + hmText(g.setting) : ''}">${hmHTML(label)}</button>`;
      }
    }
    if (sys === 'monoklin') {
      btns += `<span class="mono-axis"><span>eindeutige Achse</span><button class="pgb" data-axis="b" type="button" aria-label="Achse b">b</button><button class="pgb" data-axis="c" type="button" aria-label="Achse c">c</button></span>`;
    }
    row.innerHTML = `<span class="sys">${name}</span><div class="btns">${btns}</div>`;
    box.appendChild(row);
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const cur = groupOf(state.pg.id);
    if (b.dataset.id) state.pg.id = b.dataset.id;
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
  for (const b of document.querySelectorAll('#pg-picker button')) {
    let on = false;
    if (b.dataset.id) on = b.dataset.id === state.pg.id;
    else if (b.dataset.mono) on = g.system === 'monoklin' && g.hm === b.dataset.mono;
    else if (b.dataset.axis) on = (state.pg.monoAxis || 'b') === b.dataset.axis;
    b.setAttribute('aria-pressed', String(on));
  }
}

function buildFormSelect() {
  const sel = $('form-select');
  sel.innerHTML = FORMS.map((f) => `<option value="${f.id}">${f.name}</option>`).join('');
  sel.value = state.poly.formId;
}

function refreshPolyControls() {
  const form = FORMS.find((f) => f.id === state.poly.formId);
  const nfold = form.kind === 'nfold';
  $('row-n').hidden = !nfold;
  $('row-variant').hidden = !nfold;
  $('row-ba').hidden = form.kind !== 'cubic';
  $('row-height').hidden = !(nfold && form.type === 'prisma');
  $('row-ca').hidden = nfold && form.type === 'prisma';
  $('lbl-ca').textContent = form.kind === 'cubic' ? 'c/a' : 'c/a';
  for (const b of document.querySelectorAll('#seg-n button')) b.setAttribute('aria-pressed', String(Number(b.dataset.n) === state.poly.n));
  if (nfold) {
    const hex = state.poly.n !== 4;
    const vs = nfoldVariants(form.type, state.poly.n);
    $('variant-select').innerHTML = vs.map((s, i) => `<option value="${i}">${formLabelText(s, hex && state.poly.bravais)}</option>`).join('');
    if (state.poly.variant >= vs.length) state.poly.variant = 0;
    $('variant-select').value = String(state.poly.variant);
  }
  const presets = orientationPresets(form);
  $('preset-select').innerHTML = presets.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  if (!presets.some((p) => p.id === state.poly.presetId)) state.poly.presetId = presets[0].id;
  $('preset-select').value = state.poly.presetId;
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

function renderPoly() {
  const col = palette();
  const P = buildPolyhedron({
    formId: state.poly.formId, n: state.poly.n, variant: state.poly.variant,
    ratios: { ba: state.poly.ba, ca: state.poly.ca }, height: state.poly.height, presetId: state.poly.presetId,
  });
  if (state.selected != null && state.selected >= P.faces.length) state.selected = null;
  const labels = P.faces.map((f) => (state.poly.labels ? hklParts(f.hkl, P.hex && state.poly.bravais) : null));
  const scene = {
    col, fontFamily: FONT,
    wulff: { on: state.view.wulff, rot: state.view.wulffRot },
    primitiveBold: false, mirrors: [], axes: [],
    poles: P.faces.map((f, i) => ({ p: f.normal, det: 1, idx: i, label: labels[i], selected: state.selected === i })),
    showLower: state.poly.showLower,
    axisLabels: state.view.axes ? P.axes : [],
  };
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'poly', P, scene };
  updateLegendPoly();
  updateInfoPoly(P);
  $('row-bravais').hidden = !P.hex;
  $('stereo-sub').textContent = 'Blick ∥ ' + P.preset.name.replace(' ∥ Blickrichtung', '').replace(/ \(.*\)/, '');
  view3d.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, selected: false })) }, { standalone: true }).full);
  const labels3d = state.poly.labels ? P.faces.map((f) => hklHTML(f.hkl, P.hex && state.poly.bravais)) : null;
  view3d.showPolyhedron(P, col,
    { showRays: state.view.rays, showSphere: state.view.sphere, showPlane: state.view.plane, showAxes: state.view.axes, showNormals: state.view.normals, size: state.poly.size, planeOpacity: 0.55 },
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
function updateLegendPG(info, col) {
  const items = [];
  if (state.pg.showObject) {
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Pol oben</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Pol unten</span>`);
    items.push(`<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/><circle r="4" fill="${col.ink}"/></svg>beide</span>`);
  }
  if (state.pg.showElements && info.mirrors.length) items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.mirror}" stroke-width="3.2" stroke-linecap="round"/></svg>Spiegelebene</span>`);
  if (state.pg.colorful && state.pg.showObject) {
    items.push(`<span class="lg"><i class="sw" style="background:${col.upper}"></i>gleiche Händigkeit</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${col.accent2}"></i>Spiegelbild</span>`);
  }
  $('legend').innerHTML = items.join('');
}
function updateLegendPoly() {
  const col = palette();
  $('legend').innerHTML = [
    `<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Flächenpol oben</span>`,
    `<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Flächenpol unten</span>`,
    '<span class="lg hint">Pol oder Fläche antippen zum Hervorheben</span>',
  ].join('');
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
    ${state.pg.showObject ? `<p class="note">Allgemeine Lage: ${info.order} Pole (${info.order - lower} oben, ${lower} unten). Der gestrichelte Ring markiert den Ausgangspol.</p>` : ''}`;
}

function poleAngles(n) {
  const rho = Math.acos(Math.max(-1, Math.min(1, n[2]))) / deg;
  let phi = Math.atan2(n[1], n[0]) / deg;
  if (phi < 0) phi += 360;
  return { rho, phi };
}

function updateInfoPoly(P) {
  const form = P.form;
  const fs = P.faces.filter((f) => f.form === 'main');
  const extra = P.faces.filter((f) => f.form !== 'main');
  let sel = '';
  if (state.selected != null && P.faces[state.selected]) {
    const f = P.faces[state.selected];
    const { rho, phi } = poleAngles(f.normal);
    sel = `<div class="selbox"><div class="sel-hkl">${hklHTML(f.hkl, P.hex && state.poly.bravais)}</div>
      <dl class="facts"><div><dt>ρ (Abstand vom Zentrum)</dt><dd class="num">${rho.toFixed(1)}°</dd></div>
      <div><dt>φ (Azimut ab a↓)</dt><dd class="num">${phi.toFixed(1)}°</dd></div></dl></div>`;
  }
  const latText = P.hex
    ? `hexagonale Achsen, c/a = ${P.lat.c.toFixed(3)}`
    : form.kind === 'cubic'
      ? `a : b : c = 1 : ${P.lat.b.toFixed(2)} : ${P.lat.c.toFixed(2)}`
      : `tetragonal, c/a = ${P.lat.c.toFixed(3)}`;
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big form-sym">${hklHTML(P.formSymbol, P.hex && state.poly.bravais, ['{', '}'])}</div>
      <div class="hm-meta"><span>${form.name}${form.kind === 'nfold' ? ', ' + state.poly.n + '-zählig' : ''}</span><span>${latText}</span></div>
    </div>
    <dl class="facts">
      <div><dt>Flächen</dt><dd class="num">${P.faces.length}</dd></div>
      <div><dt>davon Hauptform</dt><dd class="num">${fs.length}</dd></div>
      ${extra.length ? `<div><dt>${extra[0].form === 'pedion' ? 'Pedion' : 'Pinakoid'}</dt><dd>${extra.map((f) => hklHTML(f.hkl, P.hex && state.poly.bravais)).join(' ')}</dd></div>` : ''}
      <div><dt>Lage</dt><dd>${P.preset.name}</dd></div>
    </dl>
    ${sel}
    <p class="note">Grösse und Seitenverhältnisse ändern das Polyeder. Die Lage der Pole hängt nur von den Flächennormalen ab, also von den Seitenverhältnissen, nicht von der Grösse.</p>`;
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
  return Math.hypot(s.x - q.x, s.y - q.y) < 30;
}
let dragging = false, moved = false;
svg.addEventListener('touchstart', (e) => { if (nearGenerator(e)) e.preventDefault(); }, { passive: false });
svg.addEventListener('pointerdown', (e) => {
  moved = false;
  if (state.mode !== 'pg' || !state.pg.showObject) return;
  if (e.pointerType === 'mouse' || nearGenerator(e)) {
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    const s = svgPoint(e);
    setPoleFromScreen(s.x, s.y);
  }
});
svg.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  moved = true;
  const s = svgPoint(e);
  setPoleFromScreen(s.x, s.y);
});
const endDrag = () => { dragging = false; };
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);
svg.addEventListener('click', (e) => {
  const s = svgPoint(e);
  if (state.mode === 'pg') {
    if (!state.pg.showObject || moved) return;
    if (Math.hypot(s.x - C, s.y - C) <= 212) setPoleFromScreen(s.x, s.y);
    return;
  }
  const hit = e.target.closest && e.target.closest('.hit');
  state.selected = hit ? (Number(hit.dataset.idx) === state.selected ? null : Number(hit.dataset.idx)) : null;
  render();
});

// ------------------------------------------------------------------ 3D-Ansicht
const view3d = new View3D($('view3d'), {
  onSelect: (idx) => {
    if (state.mode !== 'poly') return;
    state.selected = idx === state.selected ? null : idx;
    render();
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
  $('ctl-pg').hidden = mode !== 'pg';
  $('ctl-pg-opts').hidden = mode !== 'pg';
  $('ctl-poly').hidden = mode !== 'poly';
  $('row-normals').hidden = mode !== 'poly';
  $('stereo-sub').textContent = 'Blick ∥ c';
  render();
}

function init() {
  buildGroupPicker();
  buildFormSelect();
  refreshPolyControls();

  bindCheck('pg-elements', state.pg, 'showElements');
  bindCheck('pg-object', state.pg, 'showObject');
  bindCheck('pg-colorful', state.pg, 'colorful');
  bindRange('pg-theta', state.pg, 'theta', (v) => v.toFixed(0) + '°');
  bindRange('pg-phi', state.pg, 'phi', (v) => v.toFixed(1) + '°');

  $('form-select').addEventListener('change', (e) => {
    state.poly.formId = e.target.value; state.selected = null;
    const f = FORMS.find((x) => x.id === state.poly.formId);
    refreshPolyControls(); syncSliders(); render();
  });
  for (const b of document.querySelectorAll('#seg-n button')) {
    b.addEventListener('click', () => { state.poly.n = Number(b.dataset.n); state.selected = null; refreshPolyControls(); render(); });
  }
  $('variant-select').addEventListener('change', (e) => { state.poly.variant = Number(e.target.value); state.selected = null; render(); });
  $('preset-select').addEventListener('change', (e) => { state.poly.presetId = e.target.value; render(); });
  bindRange('poly-ba', state.poly, 'ba', (v) => v.toFixed(2));
  bindRange('poly-ca', state.poly, 'ca', (v) => v.toFixed(2));
  bindRange('poly-height', state.poly, 'height', (v) => v.toFixed(2));
  bindRange('poly-size', state.poly, 'size', (v) => v.toFixed(2));
  bindCheck('poly-labels', state.poly, 'labels');
  bindCheck('poly-bravais', state.poly, 'bravais');
  $('poly-bravais').addEventListener('change', () => refreshPolyControls());
  bindCheck('poly-lower', state.poly, 'showLower');
  $('poly-reset').addEventListener('click', () => {
    Object.assign(state.poly, { ba: 1, ca: 1, height: 1.5, size: 0.75 });
    syncSliders(); render();
  });

  bindCheck('v-wulff', state.view, 'wulff');
  bindRange('v-wulffrot', state.view, 'wulffRot', (v) => v.toFixed(0) + '°');
  bindCheck('v-axes', state.view, 'axes');
  bindCheck('v-sphere', state.view, 'sphere');
  bindCheck('v-plane', state.view, 'plane');
  bindCheck('v-rays', state.view, 'rays');
  bindCheck('v-normals', state.view, 'normals');
  $('v-wulff').addEventListener('change', () => { $('row-wulffrot').hidden = !state.view.wulff; });
  $('row-wulffrot').hidden = !state.view.wulff;

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
    const name = state.mode === 'pg' ? 'stereogramm-' + state.pg.id.replace(/\//g, '_') : 'stereogramm-' + state.poly.formId;
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
