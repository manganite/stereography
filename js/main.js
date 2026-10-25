// Steuerung der App: Zustand, Bedienelemente, Verknüpfung von Stereogramm und 3D-Ansicht.

import {
  POINT_GROUPS, SYSTEMS, buildPointGroup,
} from './pointgroups.js';
import {
  habitOf, zoneOf, dirToFour, orientationPresets, LATTICE_DEFAULTS, FREE_PARAMS, constrainLattice, isHexSystem, auxFormName,
  STRETCH_DIRS, stretchDir,
} from './polyhedra.js';
import { CATALOG, formName, formEig, FORM_TYPES } from './forms.js';
import { buildSVG, unproject, project, symbolIcon, C } from './stereogram.js';
import { hmHTML, hmText, hklHTML, indices } from './format.js';
import { normalize } from './linalg.js';
import { View3D, OBLIQUE } from './view3d.js';
import { EXAMPLES, exampleById } from './examples.js';
import { VERSION } from './version.js';
import { initHelp, setTip, showTipAt, hideTip } from './help.js';
import * as S from './scene.js';
import {
  createState, hashOf, applyHashTo, phiFromOld, rhoText, palette, formColor, groupOf, groupOrder, EIG_SAME, crystalAxesFor, ORBIT_COLORS, pgScene, polyCrystal, polyScene, normalizeZones,
  pgPolesOn, polyLabelsOn, pgViewDirections, polyViewDirections, lightPalette,
} from './scene.js';

const $ = (id) => document.getElementById(id);
const deg = Math.PI / 180;
const coarse = window.matchMedia('(pointer: coarse)');
/** viewBox-Einheiten pro CSS-Pixel des Stereogramms. */
const svgUnit = () => { const w = $('stereo').getBoundingClientRect().width; return w > 0 ? 520 / w : 1; };
/** Trefferradius in viewBox-Einheiten: mit Finger mindestens 22 px (44 px Durchmesser). */
const touchRadius = (minUnits, px) => (coarse.matches ? Math.max(minUnits, px * svgUnit()) : minUnits);

// ------------------------------------------------------------------ Zustand
const state = createState();
const DEFAULTS = JSON.parse(JSON.stringify(state));

// Azimut φ wie bei Borchardt-Ott & Sowa (Tab. 5.1): ab dem rechten Rand (→, bei orthogonalen Achsen b bzw. (010))
// im Uhrzeigersinn, so dass (100) bei 90° liegt. Kartesisch: x ∥ a (↓), y ∥ b (→).
/** Azimut φ (Grad, 0 … 360) eines Vektors. */
function azimuth(v) {
  const p = Math.atan2(v[0], v[1]) / deg;
  return p < 0 ? p + 360 : p;
}

// ------------------------------------------------------------------ Zustand in der URL
// Lesbarer Hash, z. B. #m=pg&g=4/mmm&rho=59 oder #m=form&sys=kubisch&f=m-3m:b35&w=winkel.
// Nur Abweichungen vom Startzustand werden geschrieben; ein Link stellt genau diese Ansicht her.

const stateToHash = () => hashOf(state, DEFAULTS);

/** Wendet einen Hash auf den Startzustand an. Gibt false zurück, wenn kein brauchbarer Hash vorliegt. */
const applyHash = (hash) => applyHashTo(state, hash, DEFAULTS);

let lastHash = '';
// Ohne Hash geöffnet (oder nach „Alle Einstellungen zurücksetzen“): Adresse bleibt ohne Hash,
// bis etwas geändert wird. „Link kopieren“ erzeugt trotzdem immer einen vollständigen Link.
let hashActive = location.hash.length > 1;
let baseHash = null; // Zustand beim ersten Speichern; erst eine Abweichung davon schreibt den Hash
try {
  const saved = JSON.parse(localStorage.getItem('stereo-state') || 'null');
  if (saved && saved.v >= 2 && saved.v <= 4) {
    Object.assign(state.pg, saved.pg); Object.assign(state.view, saved.view);
    if (saved.v >= 3) Object.assign(state.poly, saved.poly);
    if (saved.v < 4 && Number.isFinite(state.pg.phi)) state.pg.phi = phiFromOld(state.pg.phi); // alte Zählung von φ
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
    if (!Array.isArray(state.poly.zones)) state.poly.zones = [];
    const st = state.poly.stretch;
    if (!st || typeof st !== 'object' || typeof st.dir !== 'string' || !(st.s >= 0.5 && st.s <= 2)) state.poly.stretch = { dir: '', s: 1 };
    if (!state.poly.freeLats || typeof state.poly.freeLats !== 'object') state.poly.freeLats = {};
    if (saved.poly && !('breakMode' in saved.poly)) {
      // Zustand bis v1.4.0: „Symmetrie brechen“ bedeutete alle Gitterparameter frei, im Gitter selbst gespeichert
      state.poly.breakMode = state.poly.broken ? 'free' : 'stretch';
      if (state.poly.broken) {
        for (const [sys, lat] of Object.entries(state.poly.lats || {})) {
          if (!LATTICE_DEFAULTS[sys]) continue;
          state.poly.freeLats[sys] = { ...lat };
          state.poly.lats[sys] = constrainLattice(lat, sys);
        }
      }
    }
    if (state.poly.breakMode !== 'free') state.poly.breakMode = 'stretch';
  }
} catch { /* Speicher nicht verfügbar */ }
if (location.hash.length > 1) applyHash(location.hash); // Link hat Vorrang
let resetting = false;
const save = () => {
  if (resetting) return;
  try { localStorage.setItem('stereo-state', JSON.stringify({ v: 4, mode: state.mode, pg: state.pg, poly: state.poly, view: state.view })); } catch { /* ignorieren */ }
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

// ------------------------------------------------------------------ Bedienelemente aufbauen
/** Punktgruppen mit zwei Aufstellungen in ITA: ein Button je Punktgruppe, die Aufstellung darunter. */
const FAMILIES = {
  '32': ['321', '312'], '3m': ['3m1', '31m'], '-3m': ['-3m1', '-31m'],
  '-42m': ['-42m', '-4m2'], '-6m2': ['-6m2', '-62m'],
};
const famOf = (id) => Object.keys(FAMILIES).find((k) => FAMILIES[k].includes(id)) || null;
/** Unterschied der Aufstellungen (Tooltip). */
const SETTING_TIPS = {
  '321': '2-zählige Achsen entlang a₁, a₂, a₃.',
  '312': '2-zählige Achsen zwischen den a-Achsen (um 30° gedreht).',
  '3m1': 'Spiegelebenen senkrecht zu a₁, a₂, a₃.',
  '31m': 'Spiegelebenen enthalten die a-Achsen (um 30° gedreht).',
  '-3m1': 'Spiegelebenen senkrecht zu a₁, a₂, a₃, 2-zählige Achsen entlang der a-Achsen.',
  '-31m': 'Spiegelebenen enthalten die a-Achsen, 2-zählige Achsen dazwischen.',
  '-42m': '2-zählige Achsen entlang a und b, Spiegelebenen diagonal.',
  '-4m2': 'Spiegelebenen senkrecht zu a und b, 2-zählige Achsen diagonal.',
  '-6m2': 'Spiegelebenen senkrecht zu a₁, a₂, a₃.',
  '-62m': '2-zählige Achsen entlang a₁, a₂, a₃.',
};
/** Text für ein HTML-Attribut (Tooltip-Inhalt mit Markup). */
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
/** Tooltip eines Punktgruppen-Buttons: Symbol, Schoenflies, System, Ordnung (als Attributwert). */
function groupTip(id, extra) {
  const g = POINT_GROUPS.find((x) => x.id === id);
  const sf = g.sf.replace(/^([A-Z])(.*)$/, '$1<sub>$2</sub>');
  return attr(`Punktgruppe ${hmHTML(g.hm)} (${sf}), ${g.system}, Ordnung ${buildPointGroup(id).order}.${extra ? ' ' + extra : ''}`);
}

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
        btns += `<button class="pgb" data-mono="${g.hm}" type="button" data-tip="${groupTip(g.id, 'Aufstellung mit eindeutiger Achse b oder c darunter.')}">${hmHTML(g.hm)}</button>`;
        continue;
      }
      const fam = famOf(g.id);
      if (!fam) {
        btns += `<button class="pgb" data-id="${g.id}" type="button" data-tip="${groupTip(g.id)}">${hmHTML(g.hm)}</button>`;
      } else if (!seen.has(fam)) {
        seen.add(fam);
        btns += `<button class="pgb" data-fam="${fam}" type="button" data-tip="${groupTip(g.id, 'Zwei Aufstellungen, Auswahl darunter.')}">${hmHTML(fam)}</button>`;
        sets += `<span class="mono-axis setrow" data-setrow="${fam}" hidden><span>Aufstellung</span>${FAMILIES[fam].map((id) => {
          const m = groupOf(id);
          return `<button class="pgb" data-id="${id}" type="button" data-tip="${attr(`Aufstellung ${hmHTML(m.setting || m.hm)}: ${SETTING_TIPS[id]}`)}">${hmHTML(m.setting || m.hm)}</button>`;
        }).join('')}</span>`;
      }
    }
    if (sys === 'monoklin') {
      sets += `<span class="mono-axis setrow" data-setrow="mono" hidden><span>Aufstellung: eindeutige Achse</span><button class="pgb" data-axis="b" type="button" aria-label="Achse b" data-tip="Eindeutige Achse b (Standard der International Tables): 2-zählige Achse bzw. Normale der Spiegelebene entlang b.">b</button><button class="pgb" data-axis="c" type="button" aria-label="Achse c" data-tip="Eindeutige Achse c: 2-zählige Achse bzw. Normale der Spiegelebene entlang c.">c</button></span>`;
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
const sysOK = (sys) => Object.prototype.hasOwnProperty.call(SYSTEM_NAMES, sys);
if (!sysOK(state.poly.system)) state.poly.system = 'kubisch';
/**
 * Ohne „Flächensymmetrie zeigen“ enthält die Auswahl je Punktgruppe nur die allgemeine Form und die
 * Formen, deren Eigensymmetrie die Punktgruppe selbst ist (z. B. Würfel nur in m3̄m, Tetraeder nur
 * in 4̄3m). Geometrisch gleiche Formen anderer Punktgruppen unterscheiden sich erst durch die
 * Flächensymmetrie; sie erscheinen, sobald diese gezeigt wird. (Absprache mit dem Autor.)
 */
// Formen und Beispiele des aktuellen Zustands (Kern in scene.js)
const formListed = (e) => S.formListed(state, e);
const currentEntryId = () => S.currentEntryId(state);
const currentExample = () => S.currentExample(state);
const exFactors = (ex) => S.exFactors(state, ex);
function setExample(id) {
  const ex = exampleById(id);
  state.poly.example = ex ? ex.id : null;
  state.selected = null; state.zoneSel = []; state.poly.zones = [];
  if (ex) {
    state.poly.system = ex.sys;
    state.poly.lats[ex.sys] = { ...LATTICE_DEFAULTS[ex.sys], ...(ex.lat || {}) };
    delete state.poly.exScale[ex.id];
    state.poly.broken = false; state.poly.open = false;
    state.poly.stretch = { dir: '', s: 1 }; state.poly.breakMode = 'stretch';
    state.poly.presetId = orientationPresets(ex.sys)[0].id;
    $('poly-broken').checked = false; $('poly-open').checked = false;
  }
  $('sys-select').value = state.poly.system;
  refreshPolyControls();
}

const currentLat = () => S.currentLat(state);

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
  $('row-bravais').hidden = !isHexSystem(sys);
  $('sec-more').querySelector('.subhint').textContent = isHexSystem(sys) ? '(hkil), Flächensymmetrie' : 'Flächensymmetrie';
  syncLattice();
}

/**
 * Box „Gitter“: ohne Symmetriebruch nur die freien Parameter des Systems; mit Symmetriebruch alle
 * Parameter, bei „Streckung“ gesperrt (sie zeigen das gestreckte Gitter), bei „Alle Parameter frei“ bedienbar.
 */
function syncLattice() {
  const sys = state.poly.system;
  const mode = S.breakModeOf(state);
  const hasDirs = STRETCH_DIRS[sys].length > 0;
  $('poly-broken').checked = !!state.poly.broken;
  $('ctl-break').hidden = !mode;
  $('break-mode').hidden = !hasDirs;
  for (const b of $('break-mode').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
  $('ctl-stretch').hidden = mode !== 'stretch';
  if (mode === 'stretch') buildStretch();
  const free = new Set(mode ? ['ba', 'ca', 'al', 'be', 'ga'] : FREE_PARAMS[sys]);
  for (const k of ['ba', 'ca', 'al', 'be', 'ga']) {
    $('row-lat-' + k).hidden = !free.has(k);
    $('lat-' + k).disabled = mode === 'stretch';
  }
  $('lat-fixed').hidden = free.size > 0;
  $('lat-locked').hidden = mode !== 'stretch';
  $('lat-title').hidden = !mode;
  syncLatSliders();
}

/** Streckung entlang einer Blickrichtung: Auswahl der Richtung je System, Faktor. */
const stretchLabel = (d) => `[${d.id}]` + (/^[abc]$/.test(d.cls) ? ` = ${d.cls}` : `, Blickrichtung ${d.cls}`);
function buildStretch() {
  const dirs = STRETCH_DIRS[state.poly.system];
  if (!dirs.length) return;
  $('stretch-dir').innerHTML = dirs.map((d) => `<option value="${d.id}">${stretchLabel(d)}</option>`).join('');
  $('stretch-dir').value = stretchDir(state.poly.system, state.poly.stretch.dir).id;
  syncStretch();
}
function syncStretch() {
  $('stretch-s').value = state.poly.stretch.s;
  $('stretch-s-out').textContent = state.poly.stretch.s.toFixed(2);
}

function syncLatSliders() {
  const lat = S.effectiveLat(state);
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


const generalPole = () => S.generalPole(state);

function renderPG() {
  const col = palette();
  const { info, p0, orb, classes, sel, pgAngle, scene } = pgScene(state, col, { hitR: touchRadius(13, 22) });
  state.pgSel = sel;
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'pg', info, scene };
  updateLegendPG(info, col, classes);
  updateInfoPG(info, orb, col, classes, pgAngle);
  updateDirChips(classes, col);
  updateViews(pgViewDirections(state), col);
  syncDependentChecks();
  draw3dPG(view3d, col, { info, p0, orb, pgAngle, scene });
}

/** 3D-Konstruktion einer Punktgruppe in der Ansicht v zeichnen (Promise: Textur der Äquatorebene fertig). */
function draw3dPG(v, col, { info, p0, orb, pgAngle, scene }) {
  const tex = v.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, gen: false, selected: false })) }, { standalone: true }).full);
  v.showPointGroup(
    { ...info, orbit: state.pg.showObject ? orb : null, p0, crystalAxes: crystalAxesFor(info.hex) },
    col,
    { showElements: state.pg.showElements, showObject: state.pg.showObject, showPoles: state.pg.showPoles, showRays: state.view.rays, showSphere: state.view.sphere, showGlobe: state.view.globe, showPlane: state.view.plane, showAxes: state.view.axes,
      dirColors: state.view.dirColors ? col.dir : null, hiddenDirs: new Set(state.pg.hideDirs),
      arc: pgAngle ? { a: pgAngle.a, b: pgAngle.b, label: pgAngle.deg.toFixed(1) + '°' } : null },
  );
  return tex;
}

/** 3D-Konstruktion eines Kristalls in der Ansicht v zeichnen (Promise: Textur der Äquatorebene fertig). */
function draw3dPoly(v, col, C, scene, hex4) {
  const tex = v.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, selected: false })) }, { standalone: true }).full);
  const angle = C.angle;
  const labels3d = polyLabelsOn(state) ? C.faces.map((f) => hklHTML(f.hkl, hex4)) : null;
  v.showPolyhedron(C, col,
    { showPoles: state.poly.showPoles, showRays: state.view.rays, showSphere: state.view.sphere, showGlobe: state.view.globe, showPlane: state.view.plane, showAxes: state.view.axes, showNormals: state.view.normals, size: state.poly.size, planeOpacity: 0.55, motifs: state.poly.faceSym ? C.motifs : null, zones: C.selZones, arc: angle ? { a: angle.a, b: angle.b, label: angle.deg.toFixed(1) + '°' } : null, picked: state.poly.tool ? state.zoneSel : [] },
    state.selected, labels3d);
  return tex;
}

/** Schalter in der 3D-Ansicht: Symmetrieelemente einzelner Blickrichtungen ein-/ausblenden. */
/**
 * Infobox neu schreiben; hatte ein Bedienelement der Zonenliste den Fokus, erhält ihn danach dasselbe Element
 * (bzw. nach „Alle Zonen abwählen“ die erste Zonengruppe oder der Button „Zone“), damit die Tastatur ihren Platz behält.
 */
function setInfo(html) {
  const box = $('info');
  const a = box.contains(document.activeElement) ? document.activeElement : null;
  const sel = !a ? null
    : a.dataset.zone ? `[data-zone="${a.dataset.zone}"]`
      : a.dataset.zclass != null ? `[data-zclass="${a.dataset.zclass}"]`
        : a.hasAttribute('data-zclear') ? '[data-zclear]' : null;
  box.innerHTML = html;
  if (!sel) return;
  const t = box.querySelector(sel) || box.querySelector('[data-zclass]') || (state.mode === 'poly' ? $('zone-btn') : null);
  t?.focus({ preventScroll: true });
}

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
    return `<button type="button" data-pos="${c.pos}" aria-pressed="${on}" ${dc} data-tip="${on ? 'Ausblenden' : 'Einblenden'}: Symmetrieelemente der Blickrichtung ${c.label.replace(/<[^>]+>/g, '')} in der 3D-Ansicht"><i class="sw"></i>${c.label}</button>`;
  }).join('');
  if (focused != null) box.querySelector(`button[data-pos="${focused}"]`)?.focus();
}


/** Bedienelemente, die nur mit Polen wirken: gesperrt (nicht abgewählt), solange die Pole fehlen. */
function syncDependentChecks() {
  const pg = state.mode === 'pg';
  const OBJ = 'nur mit „Objekt in allgemeiner Lage“', POLES = 'nur mit Flächenpolen';
  const pgWhy = !state.pg.showObject ? OBJ : !state.pg.showPoles ? POLES : '';
  // Grund einer Sperre sichtbar unter dem Schalter (er steht oft in einem anderen Abschnitt als die Ursache)
  const set = (id, why) => {
    const el = $(id);
    el.disabled = !!why;
    const w = el.closest('.check').querySelector('.why');
    if (w) w.textContent = why;
  };
  set('pg-poles', state.pg.showObject ? '' : OBJ);
  $('pg-theta').disabled = $('pg-phi').disabled = !state.pg.showObject; // ρ, φ gehören zum Objekt
  set('pg-colorful', pgWhy);
  set('poly-labels', state.poly.showPoles ? '' : POLES + ' (unter „Darstellung“)');
  set('poly-lower', state.poly.showPoles ? '' : POLES);
  set('v-rays', pg ? pgWhy : state.poly.showPoles ? '' : POLES);
}

// ------------------------------------------------------------------ Ansichten der 3D-Konstruktion
// „Schräg“ und je eine Ansicht entlang der drei Blickrichtungen des Kristallsystems (triklin: a, b, c).
// Der gedrückte Knopf bleibt markiert, bis die Kamera gedreht wird oder sich die Richtung ändert.
let viewList = [];
let viewKey = 'oblique', viewVec = null;
const AXIS_OF = { '1,0,0': 'a', '0,1,0': 'b', '0,0,1': 'c' };
const angleBetween = (a, b) => {
  const n = Math.hypot(...a) * Math.hypot(...b);
  return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / n))) / deg;
};
function viewTip(d) {
  const lab = hklHTML(d.uvw, false, ['[', ']']);
  const ax = AXIS_OF[d.uvw.join()];
  const what = d.pos < 0
    ? `Blick entlang der Kristallachse ${ax ? `<i>${ax}</i> = ` : ''}${lab} (triklin: keine Blickrichtung im Hermann-Mauguin-Symbol).`
    : `Blick entlang ${lab}${ax ? ` = <i>${ax}</i>` : ''}, ${d.pos + 1}. Blickrichtung${d.fam ? ' ' + d.fam : ''} (${d.pos + 1}. Position im vollen Hermann-Mauguin-Symbol).`;
  const where = d.along === 'proj' ? ' Parallel zur Projektionsrichtung: das Bild wie im Stereogramm.'
    : d.along === 'side' ? ' Senkrecht zur Projektionsrichtung: Äquatorebene von der Kante, die Projektionsstrahlen werden sichtbar.' : '';
  return attr(what + where);
}
function updateViews(dirs, col) {
  viewList = dirs;
  if (viewKey && viewKey !== 'oblique') {
    const d = dirs[Number(viewKey.slice(1))];
    if (!d || angleBetween(d.dir, viewVec) > 1e-4) viewKey = null; // andere Richtung: Kamera bleibt, Markierung weg
  }
  const box = $('view-dirs');
  const html = dirs.map((d, k) => {
    const dc = state.view.dirColors && d.pos >= 0 ? ` style="--dc:${col.dir[d.pos]}"` : '';
    return `<button type="button" data-vdir="${k}" aria-pressed="false"${dc} data-tip="${viewTip(d)}">${hklHTML(d.uvw, false, ['[', ']'])}</button>`;
  }).join('');
  if (box.dataset.sig !== html) {
    const focused = box.contains(document.activeElement) ? document.activeElement.dataset.vdir : null;
    box.innerHTML = html;
    box.dataset.sig = html;
    if (focused != null) box.querySelector(`button[data-vdir="${focused}"]`)?.focus();
  }
  for (const b of box.querySelectorAll('button')) b.setAttribute('aria-pressed', String(viewKey === 'd' + b.dataset.vdir));
  $('view-oblique').setAttribute('aria-pressed', String(viewKey === 'oblique'));
}
function selectView(key) {
  if (key === 'oblique') { viewVec = OBLIQUE; view3d.setView('oblique'); }
  else {
    const d = viewList[Number(key.slice(1))];
    if (!d) return;
    viewVec = d.dir;
    view3d.setViewDir(d.dir);
  }
  viewKey = key;
  updateViews(viewList, palette());
}
/** Seitliche Ansicht (Richtung ⊥ Projektionsrichtung), sonst die erste Blickrichtung. */
const sideViewKey = () => { const k = viewList.findIndex((d) => d.along === 'side'); return 'd' + Math.max(0, k); };

function renderPoly() {
  const col = palette();
  const C = polyCrystal(state, col);
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
  if (state.selected != null && (!C.faces[state.selected] || C.faces[state.selected].hidden)) state.selected = null;
  state.zoneSel = state.zoneSel.filter((k) => C.faces[k] && !C.faces[k].hidden);
  if (!state.poly.tool) state.zoneSel = [];
  // gespeicherte Schlüssel lageunabhängig machen und Doppelte entfernen (ältere Zustände, Links)
  state.poly.zones = normalizeZones(state.poly.zones);
  const { scene, fwClasses, hex4 } = polyScene(state, C, col, { hitR: touchRadius(13, 22), labelSize: Math.max(14.5, 11 * svgUnit()) });
  const out = buildSVG(scene);
  svg.innerHTML = out.inner;
  current = { kind: 'poly', C, scene };
  updateLegendPoly(C, col, fwClasses);
  updateInfoPoly(C, col);
  $('ctl-poly-open').hidden = !C.auxForms.length;
  const tn = state.poly.tool === 'zone' ? 'Zone' : 'Winkel';
  const fp = state.poly.showPoles ? ' oder Pol' : '', fp2 = state.poly.showPoles ? ' oder zweiten Pol' : '';
  $('v3d-hint').textContent = state.poly.tool
    ? [`${tn}: zwei Flächen${state.poly.showPoles ? ' oder Pole' : ''} antippen`, `${tn}: zweite Fläche${fp2} antippen`, `${state.poly.tool === 'zone' ? 'Zone bestimmt' : 'Winkel gemessen'}; nächstes Antippen beginnt neu`][Math.min(state.zoneSel.length, 2)]
    : `Fläche${fp} antippen zum Hervorheben`;
  $('stereo-sub').textContent = 'Projektion ∥ ' + C.preset.name.replace(/ \(.*\)/, '');
  updateViews(polyViewDirections(C), col);
  syncDependentChecks();
  draw3dPoly(view3d, col, C, scene, hex4);
}


// ------------------------------------------------------------------ Bildexport (immer hell)
/** Szene des aktuellen Zustands in den hellen Farben (Stereogramm unabhängig von der Bildschirmgrösse). */
function lightScene() {
  const col = lightPalette();
  if (state.mode === 'pg') {
    const parts = pgScene(state, col, { hitR: 13 });
    return { col, kind: 'pg', parts, scene: parts.scene };
  }
  const C = polyCrystal(state, col);
  const { scene, hex4 } = polyScene(state, C, col, { hitR: 13, labelSize: 14.5 });
  return { col, kind: 'poly', C, scene, hex4 };
}
/** Stereogramm als SVG: helle Farben, ohne Hintergrund ausserhalb der Kreisfläche, ohne Hervorhebung. */
function stereoSvg() {
  const { scene } = lightScene();
  return buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, gen: false, selected: false })) }, { standalone: true }).full;
}
/** Schriften der App als data:-URLs, damit sie im gerasterten SVG wirken (ein Bild lädt keine fremden Dateien). */
let fontCss = null;
function embeddedFonts() {
  if (!fontCss) {
    const faces = [['400', 'normal', 'latin-400-normal'], ['400', 'italic', 'latin-400-italic'], ['600', 'normal', 'latin-600-normal']];
    fontCss = Promise.all(faces.map(async ([w, st, file]) => {
      const blob = await (await fetch(`lib/fonts/ibm-plex-sans-${file}.woff2`)).blob();
      const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
      return `@font-face{font-family:'IBM Plex Sans';font-style:${st};font-weight:${w};src:url(${url}) format('woff2');}`;
    })).then((x) => x.join('')).catch(() => '');
  }
  return fontCss;
}
/** Stereogramm als PNG (2048 px, durchsichtiger Hintergrund ausserhalb der Kreisfläche). */
async function stereoPng() {
  const px = 2048;
  const css = await embeddedFonts();
  const svgText = stereoSvg().replace(/^<svg([^>]*)>/, (m, a) => `<svg${a.replace(/ width="[^"]*" height="[^"]*"/, ` width="${px}" height="${px}"`)}><style>${css}</style>`);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText); });
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  cv.getContext('2d').drawImage(img, 0, 0, px, px);
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('PNG fehlgeschlagen'))), 'image/png'));
}
/**
 * 3D-Konstruktion als PNG in den hellen Farben mit durchsichtigem Hintergrund: eine zweite, unsichtbare
 * Ansicht gleicher Grösse und Kamera (die sichtbare Ansicht und die Seite wechseln die Farben nicht).
 */
async function snapshot3d() {
  const src = $('view3d');
  const w = src.clientWidth || 600, h = src.clientHeight || 600;
  const box = document.createElement('div');
  box.className = 'theme-light';
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = `position:fixed;left:-${w + 100}px;top:0;width:${w}px;height:${h}px;visibility:hidden;pointer-events:none;`;
  document.body.appendChild(box);
  const v = new View3D(box, { transparent: true });
  try {
    v.camera.position.copy(view3d.camera.position);
    v.controls.target.copy(view3d.controls.target);
    v.controls.update();
    const ex = lightScene();
    const ready = ex.kind === 'pg' ? draw3dPG(v, ex.col, ex.parts) : draw3dPoly(v, ex.col, ex.C, ex.scene, ex.hex4);
    await ready;
    return await v.snapshot();
  } finally {
    v.destroy();
    box.remove();
  }
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
  const polesOn = pgPolesOn(state);
  if (polesOn) {
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
  if (state.pg.colorful && polesOn) {
    items.push(`<span class="lg"><i class="sw" style="background:${col.upper}"></i>gleiche Händigkeit</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${col.accent2}"></i>Spiegelbild</span>`);
  }
  if (polesOn && state.pg.tool) {
    items.push(`<span class="lg hint">Winkel: zwei Pole antippen; liegen zwei übereinander, schaltet erneutes Antippen weiter („Winkel“ erneut drücken: beenden)</span>`);
  } else if (polesOn) {
    items.push(`<span class="lg hint"><span class="only-fine">Ausgangspol ziehen oder Stelle anklicken; Ausgangspol anklicken: Halbkugel wechseln</span><span class="only-coarse">Ausgangspol ziehen oder Stelle antippen; Ausgangspol antippen: Halbkugel wechseln</span></span>`);
  }
  $('legend').innerHTML = items.join('');
}
function updateLegendPoly(C, col, fwClasses) {
  const items = state.poly.showPoles ? [
    `<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" fill="${col.ink}"/></svg>Flächenpol oben</span>`,
    `<span class="lg"><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill="none" stroke="${col.ink}" stroke-width="1.6"/></svg>Flächenpol unten</span>`,
  ] : [];
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
  if (C.selZones.length || C.zone) {
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="2.2"/></svg>Zonenkreis</span>`);
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="1.6" stroke-dasharray="5 4"/></svg>untere Hälfte</span>`);
    items.push(`<span class="lg"><svg width="14" height="14" viewBox="-7 -7 14 14"><path d="M-5,-5L5,5M-5,5L5,-5" stroke="${col.accent}" stroke-width="2"/></svg>Zonenachse</span>`);
  }
  if (C.angle) {
    items.push(`<span class="lg"><svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="${col.accent}" stroke-width="3"/></svg>Bogen (Grosskreis) zwischen den Polen</span>`);
  }
  const tn = state.poly.tool === 'zone' ? 'Zone' : 'Winkel';
  if (!state.poly.showPoles) {
    items.push(`<span class="lg hint">Flächenpole ausgeblendet (einblenden unter „Darstellung“)${state.poly.tool ? ` · ${tn}: zwei Flächen in der 3D-Ansicht antippen` : ' · Fläche in der 3D-Ansicht antippen zum Hervorheben'}</span>`);
  } else items.push(state.poly.tool
    ? `<span class="lg hint">${tn}: zwei Pole hier oder zwei Flächen in der 3D-Ansicht antippen („${tn}“ erneut drücken: beenden)</span>`
    : '<span class="lg hint">Pol oder Fläche antippen zum Hervorheben; liegen zwei Pole übereinander, schaltet erneutes Antippen weiter (mit Werkzeug auch auf beide) · Werkzeuge „Zone“ und „Winkel“</span>');
  $('legend').innerHTML = items.join('');
}

const yesno = (b) => (b ? 'ja' : 'nein');
// Längere Erläuterungen der Infobox einklappbar; der Zustand bleibt beim Neuzeichnen und Neuladen erhalten
let explainOpen = false;
try { explainOpen = localStorage.getItem('stereo-explain') === 'offen'; } catch { /* Speicher nicht verfügbar */ }
const explain = (html) => (html ? `<details class="explain"${explainOpen ? ' open' : ''}><summary>Erläuterungen</summary>${html}</details>` : '');
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
  if (!pgPolesOn(state)) return '<div class="zonebox">Winkel messen: „Flächenpole“ unter „Darstellung“ einschalten.</div>';
  if (!pgAngle) return `<div class="zonebox">Winkel messen: ${state.pgSel.length ? 'einen zweiten Pol' : 'zwei Pole'} im Stereogramm antippen.</div>`;
  const [i, j] = state.pgSel;
  const A = info.ops[orb[i].op], B = info.ops[orb[j].op];
  // Operation, die Pol i auf Pol j abbildet: M = B · A⁻¹ (A orthogonal: A⁻¹ = Aᵀ)
  const M = [0, 1, 2].map((r) => [0, 1, 2].map((c) => B[r][0] * A[c][0] + B[r][1] * A[c][1] + B[r][2] * A[c][2]));
  const side = (k) => (orb[k].p[2] >= -1e-9 ? 'oben' : 'unten');
  return `<div class="zonebox"><strong>Winkel zwischen den Polen = <span class="num">${pgAngle.deg.toFixed(1)}°</span></strong>
    <p>Gewählt: zwei der ${info.order} symmetrieäquivalenten Pole (${side(i)}, ${side(j)}). Sie gehen durch ${describeOp(M, classes, col, info.axes)} ineinander über.</p>
    <p class="note">Mit der Poldistanz ρ und dem Azimut φ des Ausgangspols ändert sich der Winkel; die verknüpfende Operation bleibt dieselbe.</p></div>`;
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
  setInfo(`
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
      <div title="Eine Richtung bleibt unter allen Operationen erhalten; spontane Polarisation (Pyroelektrizität) möglich. 10 Punktgruppen."><dt>Polar</dt><dd>${yesno(info.polar)}</dd></div>
      <div title="Piezoelektrischer Effekt symmetrieerlaubt: alle 21 Punktgruppen ohne Inversionszentrum ausser 432."><dt>Piezoelektrisch</dt><dd>${yesno(info.piezo)}</dd></div>
    </dl>
    <h3>Symmetrieelemente nach Blickrichtung</h3>
    <div class="dirlist">${rows.join('')}</div>
    ${classes.length ? explain('<p class="note">Jede Position im vollen Hermann-Mauguin-Symbol steht für eine Blickrichtung, d. h. eine Klasse symmetrisch äquivalenter Richtungen. Angegeben ist, was entlang dieser Richtungen liegt: Drehachsen parallel, Spiegelebenen senkrecht dazu. Elemente verschiedener Blickrichtungen sind nicht äquivalent. In der 3D-Ansicht lassen sich die Blickrichtungen oben links einzeln aus- und einblenden.</p>') : ''}
    ${pgPolesOn(state) ? `<p class="note">Allgemeine Lage: ${info.order} Pole (${info.order - lower} oben, ${lower} unten). Der gestrichelte Ring markiert den Ausgangspol; Antippen des Ausgangspols spiegelt ihn auf die andere Halbkugel (ρ → −ρ).</p>`
    : state.pg.showObject ? `<p class="note">Allgemeine Lage: ${info.order} Objekte (${info.order - lower} oben, ${lower} unten). Die Flächenpole sind ausgeblendet (einblenden unter „Darstellung“); ρ und φ des Ausgangspols lassen sich weiter mit den Reglern einstellen.</p>` : ''}`);
}

function poleAngles(n) {
  const rho = Math.acos(Math.max(-1, Math.min(1, n[2]))) / deg;
  return { rho, phi: azimuth(n) };
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
      <dl class="facts"><div><dt>ρ (Poldistanz)</dt><dd class="num">${rhoText(rho, 1)}</dd></div>
      <div><dt>φ (Azimut ab →, im Uhrzeigersinn)</dt><dd class="num">${Math.hypot(f.normal[0], f.normal[1]) < 1e-6 ? '– (Pol im Zentrum)' : phi.toFixed(1) + '°'}</dd></div></dl></div>`;
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
  const st = C.stretch;
  if (state.poly.broken || st) {
    const stText = st ? `Streckung entlang ${dirHTML(st.uvw, false)} um den Faktor ${st.s.toFixed(2).replace('.', ',')}` : '';
    if (C.isReduced) {
      const oc = ORBIT_COLORS(col);
      const ax = C.reducedAxis ? ` (${hmHTML(C.reducedAxis.symbol)} ∥ ${dirHTML(C.reducedAxis.uvw, false)})` : '';
      const hs = C.hexSetting;
      // trigonale Restgruppe eines kubischen Kristalls: Formen auch in hexagonalen Achsen (drei und vier Indizes)
      const hexPart = (i) => {
        if (!hs) return '';
        const o = hs.orbits[i];
        return ` → ${o.name ? o.name + ' ' : ''}${hklHTML(o.rep, false, ['{', '}'])} = ${hklHTML(o.rep, true, ['{', '}'])}`;
      };
      const parts = C.orbitsMain.map((o, i) => `<li><i class="sw" style="background:${C.orbitsMain.length > 1 ? oc[i % oc.length] : col.crystal}"></i>${brace(o.rep)}, ${o.hkls.length} Fläche${o.hkls.length > 1 ? 'n' : ''}${hexPart(i)}</li>`).join('');
      const hexNote = hs
        ? `<p>Die Restgruppe ist trigonal. In hexagonalen Achsen gilt c ∥ ${dirHTML(hs.c, false)}, a₁ ∥ ${dirHTML(hs.a1, false)}, a₂ ∥ ${dirHTML(hs.a2, false)} (Richtungen im kubischen Gitter), c/a = ${hs.ca.toFixed(2).replace('.', ',')}; die Formen dort stehen hinter dem Pfeil.${hs.c.join('') === '111' && state.poly.presetId !== '111' ? ' Mit der Projektionsrichtung [111] blickt man entlang der neuen c-Achse.' : ''}</p>`
        : '';
      broken = `<div class="warnbox"><strong>Symmetrie erniedrigt: ${hmHTML(g.hm)} → ${hmHTML(C.reduced.hm)}</strong>${ax}
        ${st ? `<p>${stText}.</p>` : ''}
        <p>${C.orbitsMain.length > 1 ? `Die Form ${brace(e.hkl)} zerfällt in ${C.orbitsMain.length} Formen:` : `Die Form ${brace(e.hkl)} bleibt eine Form der Restsymmetrie:`}</p><ul class="auxlist">${parts}</ul>${hexNote}</div>`;
    } else if (S.breakModeOf(state) === 'stretch' && !st) {
      broken = `<div class="okbox">Faktor 1: Der Kristall ist unverzerrt, die Punktgruppe ${hmHTML(g.hm)} bleibt. Mit dem Faktor streckt oder staucht man ihn entlang der gewählten Richtung.</div>`;
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
        <p>Das ist der Normalenwinkel n, der Winkel zwischen den beiden Flächennormalen, also der Bogen zwischen den Polen auf der Umkugel (im Stereogramm als Grosskreisbogen eingezeichnet). Das Reflexionsgoniometer misst diesen Winkel.</p>
        <p>Der Flächenwinkel f zwischen den Flächen selbst, innen am Kristall gemessen, ergänzt ihn zu 180°: f = 180° − n = <b class="num">${(180 - w).toFixed(1)}°</b>.</p>
        <p class="note">Mit dem Wulffschen Netz: Netz so drehen, dass beide Pole auf demselben Grosskreis (Meridian) liegen, dann die Teilstriche zwischen ihnen zählen.</p></div>`;
    }
  } else if (state.poly.tool === 'zone') {
    if (!C.zone) {
      zoneBox = state.zoneSel.length === 2
        ? '<div class="zonebox">Die beiden Flächen sind parallel und bestimmen keine Zone. Bitte eine andere Fläche wählen.</div>'
        : `<div class="zonebox">Zone bestimmen: ${state.zoneSel.length === 0 ? 'zwei Pole' : 'einen zweiten Pol'} im Stereogramm oder zwei Flächen in der 3D-Ansicht antippen, oder unten Zonen wählen.</div>`;
    } else {
      const z = C.zone;
      const f1 = C.faces[state.zoneSel[0]].hkl, f2 = C.faces[state.zoneSel[1]].hkl;
      const dirN = (v, four) => { const w = four ? dirToFour(v) : v; return '[' + w.map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join(Math.max(...w.map(Math.abs)) > 9 ? ' ' : '') + ']'; };
      const dir = (v) => dirN(v, hex4), dir3 = (v) => dirN(v, false);
      const faces = z.inZone.map((k) => hklHTML(C.faces[k].hkl, hex4)).join(' ');
      const same = (a, b) => a.every((x, i) => x === b[i]); // Vorzeichen beachten: die Gegenfläche hat den Gegenpol
      const hasFace = C.faces.some((fc) => !fc.hidden && same(fc.hkl, z.uvw));
      const pl = hklHTML(z.uvw, false);
      const dev = z.normalDev > 0.05
        ? `In diesem Gitter steht die Zonenachse ${dir(z.uvw)} nicht senkrecht auf den Netzebenen ${pl} mit denselben Indizes (Abweichung ${z.normalDev.toFixed(1)}°). Der eingezeichnete Pol ist der Pol der Richtung ${dir(z.uvw)}, nicht der einer Fläche ${pl}.`
        : hasFace
          ? `Der Pol der Zonenachse ${dir(z.uvw)} fällt mit dem Pol der Fläche ${pl} zusammen, weil die Richtung ${dir(z.uvw)} in diesem Gitter senkrecht auf den Netzebenen ${pl} steht.`
          : `Der Pol der Zonenachse ${dir(z.uvw)} liegt dort, wo der Pol einer Fläche ${pl} läge; der dargestellte Kristall hat keine solche Fläche. Das gilt, weil die Richtung ${dir(z.uvw)} in diesem Gitter senkrecht auf den Netzebenen ${pl} steht, was nicht in jedem Gitter der Fall ist.`;
      const zc = C.selZones.find((y) => y.key === z.key);
      zoneBox = `<div class="zonebox"${zc ? ` style="border-color:${zc.color}"` : ''}><strong${zc ? ` style="color:${zc.color}"` : ''}>Zone ${dir(z.uvw)}</strong>
        <p>Zonenachse ${dir3(z.uvw)} = ${hklHTML(f1, false)} × ${hklHTML(f2, false)}${hex4 ? ` (drei Indizes), mit vier Indizes ${dir(z.uvw)}` : ''}. Winkel zwischen den Polen: <b class="num">${z.angle.toFixed(1)}°</b>.</p>
        <p>Flächen in dieser Zone (Zonengleichung ${hex4 ? 'hu + kv + it + lw = 0' : 'hu + kv + lw = 0'}), ${z.inZone.length}: ${faces}</p>
        <p class="note">${dev} Die Kanten zwischen Flächen der Zone verlaufen parallel zur Zonenachse (in 3D hervorgehoben).</p></div>`;
    }
    zoneBox += zoneListHTML(C, hex4);
  }
  const hab = habitOf(C.faces);
  const HABIT_NAMES = { isometrisch: 'isometrisch', planar: 'planar oder taflig', prismatisch: 'prismatisch oder nadelig' };
  const r2 = (x) => x.toFixed(2).replace('.', ',');
  const habitHTML = hab ? `${HABIT_NAMES[hab.type]} <span class="muted">(L₁ : L₂ : L₃ = 1 : ${r2(hab.L[1] / hab.L[0])} : ${r2(hab.L[2] / hab.L[0])})</span>` : '–';
  const sysName = SYSTEM_NAMES[C.sys];
  const habitNote = '<p class="note">Tracht: die Menge der am Kristall auftretenden Formen. Habitus: das relative Grössenverhältnis der Flächen, mit den drei Grundtypen isometrisch, planar oder taflig, prismatisch oder nadelig (nach Borchardt-Ott). Gleiche Tracht kann verschiedenen Habitus haben (z. B. über c/a oder die Abstände der Formen), verschiedene Tracht gleichen Habitus (Würfel, Oktaeder, Rhombendodekaeder: isometrisch). Die Einteilung hier: L₁ ≥ L₂ ≥ L₃ sind die Hauptausdehnungen des dargestellten Kristalls; isometrisch, wenn L₃/L₁ mindestens 2/3 ist (dann auch L₂/L₁ und L₃/L₂), sonst prismatisch (eine Richtung lang, L₂/L₁ &lt; 2/3) oder planar (eine Richtung kurz, L₃/L₂ &lt; 2/3); im Zweifel entscheidet das kleinere der beiden Verhältnisse.</p>';
  if (C.example) {
    const ex = C.example;
    const rows = C.forms.map((F, i) => {
      const n = auxFormName(C.groupId, F.hkls);
      const eig = n && FORM_TYPES_EIG[n.type];
      return `<tr class="${F.present ? '' : 'gone'}"><td><i class="sw" style="background:${formColor(col, i)}"></i>${n ? n.name : 'Form'}</td><td>${brace(F.rep)}</td>
        <td class="num">${F.present < F.hkls.length ? `${F.present} von ${F.hkls.length}` : F.hkls.length}</td><td>${eig ? hmHTML(eig) : '–'}</td></tr>`;
    }).join('');
    const gone = C.forms.some((F) => F.present < F.hkls.length);
    setInfo(`
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
      <div><dt>Projektionsrichtung</dt><dd>${C.preset.name}</dd></div>
    </dl>
    ${ex.note ? `<p class="note">${ex.note.replace(/\{hkl:(-?\d+),(-?\d+),(-?\d+)\}/g, (_, h, k, l) => brace([+h, +k, +l]))}</p>` : ''}
    ${sel}
    ${aux}
    <p class="note">Quelle: ${ex.src}. Die Abstände der Formen (und damit der Habitus) sind nach den Abbildungen gewählt, nicht gemessen; sie lassen sich unter „Gestalt“ ändern.</p>
    ${explain(`${state.poly.faceSym ? '<p class="note">Die dunklen Dreiecke zeigen auf jeder Form die Flächensymmetrie, die sie in dieser Punktgruppe hat.</p>' : ''}${habitNote}`)}`);
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
      twinNote = `<p class="note">Die Punktgruppe ${hmHTML(g.hm)} ist hier nur erzeugende Symmetrie; die Eigensymmetrie der Form (${hmHTML(formEig(e))}) ist höher (Begriffe nach Borchardt-Ott). Geometrisch gleicht die Form der Form „${formName(tw[0])}“ in ${hmHTML(tg.hm)}; der Unterschied liegt nur in der Flächensymmetrie (1 statt ${fsList}), sichtbar mit „Flächensymmetrie zeigen“ oder an der Lage der Pole zum Symmetriegerüst.</p>`;
    }
  }
  setInfo(`
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
      <div><dt>Wyckoff-Lage, Flächensymmetrie</dt><dd>${e.mult}<i>${e.wy}</i>, ${hmHTML(e.fs)}${state.poly.faceSym ? ` <span class="muted">(${C.motifsPerFace} Muster je Fläche)</span>` : ''}</dd></div>
      <div><dt>Eigensymmetrie der Form${C.isReduced ? ' (unverzerrt)' : ''}</dt><dd>${hmHTML(formEig(e))}</dd></div>
      <div><dt>Gitter</dt><dd>${latticeText(C.lat, C.sys, state.poly.broken || !!st)}</dd></div>
      <div><dt>Projektionsrichtung</dt><dd>${C.preset.name}</dd></div>
    </dl>
    ${twinNote}
    ${sel}
    ${aux}
    ${explain(`${state.poly.faceSym ? `<p class="note">Die dunklen Dreiecke auf den Flächen sind ein Muster in allgemeiner Lage, vervielfältigt mit allen Operationen der Punktgruppe${C.isReduced ? ' (Restsymmetrie)' : ''}. Ihre Anordnung auf einer Fläche zeigt die Flächensymmetrie, z. B. wie Streifen oder Ätzfiguren auf realen Kristallen. Dieselbe Form kann so in verschiedenen Punktgruppen unterschiedliche Flächensymmetrie haben.</p>` : ''}
    <p class="note">Die Pole hängen nur von den Flächennormalen ab, also von Indizes und Gitter. Grösse und Abstand der Ergänzungsformen ändern die Gestalt des Kristalls, aber nicht das Stereogramm.</p>
    ${habitNote}`)}`);
}

/** Richtung [uvw] (bei hexagonalen Achsen wahlweise [uvtw]) als HTML. */
function dirHTML(v, four, br = ['[', ']']) {
  const w = four ? dirToFour(v) : v;
  return br[0] + w.map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join(Math.max(...w.map(Math.abs)) > 9 ? ' ' : '') + br[1];
}

/** Zonenliste in der Infobox: Gruppen gleichwertiger Zonen, einzeln oder als Gruppe wählbar, und die gewählten Zonen. */
function zoneListHTML(C, hex4) {
  const sel = new Set(state.poly.zones);
  const colorOf = new Map(C.selZones.map((z) => [z.key, z.color]));
  const groups = C.zoneClasses.map((cl, ci) => {
    const n = cl.zones.filter((z) => sel.has(z.key)).length;
    const pressed = n === 0 ? 'false' : n === cl.zones.length ? 'true' : 'mixed';
    const members = cl.zones.map((z) => {
      const c = colorOf.get(z.key);
      return `<button type="button" class="zbtn" data-zone="${z.key}" aria-pressed="${sel.has(z.key)}"${c ? ` style="--zc:${c}"` : ''}>${dirHTML(z.uvw, hex4)}</button>`;
    }).join('');
    const count = cl.zones.length === 1 ? '1 Zone' : `${cl.zones.length} Zonen`;
    return `<div class="zclass"><button type="button" class="zgroup" data-zclass="${ci}" aria-pressed="${pressed}">${dirHTML(cl.rep, hex4, ['⟨', '⟩'])} <span>${count}, je ${cl.faces} Flächen</span></button><div class="zmembers">${members}</div></div>`;
  }).join('');
  const chosen = C.selZones.map((z) => `<li><i class="sw" style="background:${z.color}"></i><b style="color:${z.color}">${dirHTML(z.uvw, hex4)}</b>, ${z.inZone.length} Flächen: ${z.inZone.map((k) => hklHTML(C.faces[k].hkl, hex4)).join(' ')}</li>`).join('');
  return `<div class="zlist"><h3>Zonen dieses Kristalls</h3>
    ${groups ? `<p class="hintline">Zonen mit mindestens drei Flächen, gruppiert nach symmetrisch gleichwertigen Zonenachsen. Gruppe antippen: alle ihre Zonen; Richtung antippen: nur diese Zone.</p>${groups}`
    : '<p class="hintline">Keine Zone mit mindestens drei Flächen: An jeder Kante dieses Kristalls liegen nur zwei Flächen.</p>'}
    ${chosen ? `<h3>Gewählte Zonen</h3><ul class="zsel">${chosen}</ul><button type="button" class="linkbtn" data-zclear>Alle Zonen abwählen</button>` : ''}</div>`;
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
  state.pg.phi = azimuth(p);
  syncSliders();
  render();
}
function nearGenerator(e) {
  if (!current || current.kind !== 'pg' || !pgPolesOn(state)) return false;
  const q = project(generalPole());
  const s = svgPoint(e.touches ? e.touches[0] : e);
  return Math.hypot(s.x - q.x, s.y - q.y) < touchRadius(30, 28);
}
/** Ausgangspol auf die andere Halbkugel spiegeln (ρ → −ρ, φ bleibt): Punkt ↔ Kreis. */
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
  if (state.mode !== 'pg' || !pgPolesOn(state) || state.pg.tool) return;
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
    if (!pgPolesOn(state) || moved || onGen) return;
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

// Laptop: Tooltip über einem Flächenpol mit Indizes, Poldistanz und Azimut (zusammenfallende Pole gemeinsam)
svg.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || dragging || state.mode !== 'poly' || !current || current.kind !== 'poly') return;
  const hits = document.elementsFromPoint(e.clientX, e.clientY).filter((el) => el.classList && el.classList.contains('hit'));
  if (!hits.length) { hideTip(); return; }
  const s = svgPoint(e);
  const near = hits.map((el) => ({ el, d: Math.hypot(s.x - Number(el.getAttribute('cx')), s.y - Number(el.getAttribute('cy'))) })).sort((a, b) => a.d - b.d)[0].el;
  const cx = Number(near.getAttribute('cx')), cy = Number(near.getAttribute('cy'));
  const C = current.C, hex4 = C.hex && state.poly.bravais;
  const lines = hits.filter((el) => Math.hypot(Number(el.getAttribute('cx')) - cx, Number(el.getAttribute('cy')) - cy) < 2)
    .map((el) => C.faces[Number(el.dataset.idx)]).filter(Boolean).sort((f, g) => g.normal[2] - f.normal[2]) // oben zuerst
    .map((f) => {
      const { rho, phi } = poleAngles(f.normal);
      const az = Math.hypot(f.normal[0], f.normal[1]) < 1e-6 ? '–' : phi.toFixed(1) + '°';
      return `<b>${hklHTML(f.hkl, hex4)}</b>${f.role === 'aux' ? ' Ergänzungsform' : ''} · ρ ${rhoText(rho, 1)} · φ ${az}`;
    });
  if (lines.length) showTipAt(lines.join('<br>'), e.clientX, e.clientY);
});
svg.addEventListener('pointerleave', hideTip);

/** Aktives Werkzeug und Auswahl je Modus (Punktgruppen: nur Winkel; Kristallformen: Zone/Winkel). */
const curTool = () => (state.mode === 'pg' ? state.pg.tool : state.poly.tool);
const getPicks = () => (state.mode === 'pg' ? state.pgSel : state.zoneSel);
const setPicks = (v) => { if (state.mode === 'pg') state.pgSel = v; else state.zoneSel = v; };

/** Werkzeug „Zone“: Sind zwei Flächen gewählt, wird ihre Zone in die Zonenliste aufgenommen. */
function notePickedZone() {
  if (state.mode !== 'poly' || state.poly.tool !== 'zone' || state.zoneSel.length !== 2 || !current || current.kind !== 'poly') return;
  const z = zoneOf(current.C, state.zoneSel[0], state.zoneSel[1]);
  if (z && !state.poly.zones.includes(z.key)) state.poly.zones = [...state.poly.zones, z.key];
}

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
    notePickedZone();
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
    notePickedZone();
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
$('view-oblique').addEventListener('click', () => selectView('oblique'));
$('view-dirs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-vdir]');
  if (b) selectView('d' + b.dataset.vdir);
});
viewVec = OBLIQUE;
// Kamera gedreht (nicht nur gezoomt): Markierung der Ansicht aufheben
view3d.controls.addEventListener('change', () => {
  if (!viewKey || !viewVec) return;
  const want = viewKey === 'oblique' ? OBLIQUE : viewVec;
  if (angleBetween(view3d.viewDir(), want) > 0.5) {
    viewKey = null;
    for (const b of document.querySelectorAll('.viewbar button')) b.setAttribute('aria-pressed', 'false');
  }
});

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
  for (const id of ['ctl-poly', 'ctl-poly-lat', 'ctl-poly-shape', 'row-normals', 'row-poly-poles', 'row-poly-lower', 'v3d-tools']) $(id).hidden = mode !== 'poly';
  for (const id of ['row-pg-poles', 'row-pg-colorful']) $(id).hidden = mode !== 'pg';
  $('stereo-tools').hidden = false;
  syncToolBtns();
  if (mode !== 'poly') $('v3d-hint').textContent = '';
  if (mode !== 'pg') $('v3d-dirs').hidden = true;
  $('stereo-sub').textContent = 'Projektion ∥ c';
  render();
}

function init() {
  buildGroupPicker();
  initHelp();
  refreshPolyControls();

  bindCheck('pg-elements', state.pg, 'showElements');
  bindCheck('pg-object', state.pg, 'showObject');
  bindCheck('pg-poles', state.pg, 'showPoles');
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
  bindRange('pg-theta', state.pg, 'theta', (v) => rhoText(v, 0));
  bindRange('pg-phi', state.pg, 'phi', (v) => v.toFixed(1) + '°');

  buildSystemSelect();
  $('sys-select').addEventListener('change', (e) => {
    state.poly.system = e.target.value; state.poly.example = null; state.selected = null; state.zoneSel = []; state.poly.zones = [];
    state.poly.stretch = { dir: '', s: 1 }; state.poly.breakMode = 'stretch';
    refreshPolyControls(); render();
  });
  $('form-select').addEventListener('change', (e) => {
    if (!e.target.value) return;
    state.poly.entryBySys[state.poly.system] = e.target.value; state.selected = null; state.zoneSel = []; state.poly.zones = [];
    if (state.poly.example) { state.poly.example = null; refreshPolyControls(); }
    render();
  });
  $('ex-select').addEventListener('change', (e) => { setExample(e.target.value); render(); });
  $('preset-select').addEventListener('change', (e) => { state.poly.presetId = e.target.value; render(); });
  for (const k of ['ba', 'ca', 'al', 'be', 'ga']) {
    $('lat-' + k).addEventListener('input', (ev) => {
      const mode = S.breakModeOf(state);
      if (mode === 'stretch') return; // gesperrt: das Gitter legt die Streckung fest
      const lat = mode === 'free' ? S.freeLat(state) : currentLat();
      if (!mode) Object.assign(lat, constrainLattice(lat, state.poly.system));
      lat[k] = Number(ev.target.value);
      syncLatSliders(); render();
    });
  }
  $('poly-broken').checked = state.poly.broken;
  $('poly-broken').addEventListener('change', (ev) => {
    state.poly.broken = ev.target.checked;
    syncLattice(); render();
  });
  // Art des Symmetriebruchs: von „Streckung“ zu „Alle Parameter frei“ geht es mit dem gerade gezeigten Gitter weiter
  for (const b of $('break-mode').querySelectorAll('button')) {
    b.addEventListener('click', () => {
      const to = b.dataset.mode;
      if (to === S.breakModeOf(state)) return;
      if (to === 'free') state.poly.freeLats[state.poly.system] = S.effectiveLat(state);
      state.poly.breakMode = to;
      syncLattice(); render();
    });
  }
  $('stretch-dir').addEventListener('change', (ev) => { state.poly.stretch.dir = ev.target.value; syncLatSliders(); render(); });
  $('stretch-s').addEventListener('input', (ev) => {
    state.poly.stretch.dir = $('stretch-dir').value;
    state.poly.stretch.s = Number(ev.target.value);
    syncStretch(); syncLatSliders(); render();
  });
  $('lat-reset').addEventListener('click', () => {
    const ex = currentExample();
    const sys = state.poly.system;
    state.poly.lats[sys] = { ...LATTICE_DEFAULTS[sys], ...(ex ? ex.lat : {}) };
    delete state.poly.freeLats[sys];
    state.poly.stretch.s = 1;
    syncLattice(); render();
  });
  $('shape-reset').addEventListener('click', () => {
    const ex = currentExample();
    if (ex) delete state.poly.exScale[ex.id];
    state.poly.auxDist = 1; state.poly.size = 0.75;
    syncSliders(); buildExDists(); render();
  });
  bindCheck('poly-open', state.poly, 'open');
  bindRange('poly-aux', state.poly, 'auxDist', (v) => v.toFixed(2));
  bindRange('poly-size', state.poly, 'size', (v) => v.toFixed(2));
  bindCheck('poly-poles', state.poly, 'showPoles');
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
  bindCheck('v-globe', state.view, 'globe');
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

  // Zonenliste: einzelne Zone, ganze Gruppe oder alle abwählen
  $('info').addEventListener('click', (e) => {
    if (state.mode !== 'poly' || !current || current.kind !== 'poly') return;
    const zb = e.target.closest('[data-zone]'), zg = e.target.closest('[data-zclass]'), zx = e.target.closest('[data-zclear]');
    if (!zb && !zg && !zx) return;
    let zs = [...state.poly.zones];
    if (zb) zs = zs.includes(zb.dataset.zone) ? zs.filter((k) => k !== zb.dataset.zone) : [...zs, zb.dataset.zone];
    else if (zg) {
      const keys = (current.C.zoneClasses[Number(zg.dataset.zclass)] || { zones: [] }).zones.map((z) => z.key);
      zs = keys.every((k) => zs.includes(k)) ? zs.filter((k) => !keys.includes(k)) : [...zs, ...keys.filter((k) => !zs.includes(k))];
    } else zs = [];
    state.poly.zones = zs;
    state.zoneSel = []; // die Auswahl über zwei Pole beginnt neu
    render();
  });

  // Erläuterungen: offen/zu für alle Infoboxen merken (toggle bubbelt nicht, daher Capture)
  $('info').addEventListener('toggle', (e) => {
    if (!e.target.classList || !e.target.classList.contains('explain')) return;
    explainOpen = e.target.open;
    try { localStorage.setItem('stereo-explain', explainOpen ? 'offen' : 'zu'); } catch { /* ignorieren */ }
  }, true);
  // Abschnitte der Seitenleiste: zugeklappt starten, offen/zu je Abschnitt merken
  const SECT_KEY = 'stereo-sections';
  let sects = {};
  try { sects = JSON.parse(localStorage.getItem(SECT_KEY) || '{}') || {}; } catch { sects = {}; }
  for (const d of document.querySelectorAll('details.sect, details.subsect')) {
    if (typeof sects[d.id] === 'boolean') d.open = sects[d.id];
    d.addEventListener('toggle', () => {
      if (d.dataset.quiet) { delete d.dataset.quiet; return; } // von der ⓘ-Erklärung vorübergehend geöffnet
      sects[d.id] = d.open;
      try { localStorage.setItem(SECT_KEY, JSON.stringify(sects)); } catch { /* ignorieren */ }
    });
  }
  // „Weitere Optionen“ öffnen, wenn dort etwas eingeschaltet ist (z. B. über einen Link)
  if (state.poly.faceSym || state.poly.bravais) $('sec-more').open = true;
  // „Darstellung“ öffnen, wenn dort etwas vom Standard abweicht (z. B. Pole über einen Link ausgeblendet):
  // sonst fände man nicht, warum das Bild anders aussieht
  const viewChanged = Object.keys(DEFAULTS.view).some((k) => k !== 'wulffRot' && state.view[k] !== DEFAULTS.view[k])
    || state.pg.showPoles !== DEFAULTS.pg.showPoles || state.pg.colorful !== DEFAULTS.pg.colorful
    || state.poly.showPoles !== DEFAULTS.poly.showPoles || state.poly.showLower !== DEFAULTS.poly.showLower;
  if (viewChanged && !$('sec-view').open) { $('sec-view').dataset.quiet = '1'; $('sec-view').open = true; } // nicht als Wahl des Nutzers merken

  // Erste Schritte: beim ersten Besuch ohne Link sichtbar, wegklickbar, über „?“ wieder zu öffnen
  const INTRO_KEY = 'stereo-intro';
  const showIntro = (on) => { $('intro').hidden = !on; $('help-open').setAttribute('aria-expanded', String(on)); };
  let introClosed = false;
  try { introClosed = localStorage.getItem(INTRO_KEY) === 'zu'; } catch { /* Speicher nicht verfügbar */ }
  showIntro(!introClosed && !hashActive);
  $('intro-close').addEventListener('click', () => {
    showIntro(false);
    try { localStorage.setItem(INTRO_KEY, 'zu'); } catch { /* ignorieren */ }
  });
  $('help-open').addEventListener('click', () => {
    const on = $('intro').hidden;
    showIntro(on);
    if (on) { $('intro').closest('.side').scrollTop = 0; $('intro').scrollIntoView({ block: 'nearest' }); }
  });
  const isPhone = () => window.matchMedia('(max-width: 719px)').matches;
  const afterRender = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
  const galenaShown = () => state.mode === 'poly' && state.poly.example === 'galenit';
  const loadGalena = () => {
    setExample('galenit');
    state.poly.tool = null; state.zoneSel = []; state.poly.zones = [];
    state.poly.labels = true; $('poly-labels').checked = true;
    state.poly.showPoles = true; $('poly-poles').checked = true;
    for (const [id, key] of [['v-sphere', 'sphere'], ['v-globe', 'globe'], ['v-plane', 'plane'], ['v-rays', 'rays'], ['v-normals', 'normals']]) {
      state.view[key] = true; $(id).checked = true;
    }
    setMode('poly');
  };
  const selectFace = (hkl) => {
    const C = current && current.kind === 'poly' ? current.C : null;
    const i = C ? C.faces.findIndex((f) => f.role === 'main' && f.hkl.join() === hkl.join()) : -1;
    if (i >= 0) { state.selected = i; render(); }
  };
  const STEPS = {
    1: () => { loadGalena(); selectView('oblique'); if (isPhone()) setFig('3d'); },
    2: () => { if (!galenaShown()) loadGalena(); afterRender(() => selectFace([0, 0, 1])); if (isPhone()) setFig('stereo'); },
    3: () => {
      if (!galenaShown()) loadGalena();
      afterRender(() => { selectFace([0, 0, 1]); selectView(sideViewKey()); });
      if (isPhone()) setFig('3d');
    },
    4: () => {
      if (!galenaShown()) loadGalena();
      state.poly.frame = true; $('poly-frame').checked = true;
      render(); if (isPhone()) setFig('stereo');
    },
  };
  $('intro').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-step]');
    if (!b) return;
    STEPS[b.dataset.step]();
    b.closest('li').classList.add('done');
  });


  $('copy-link').addEventListener('click', async () => {
    const btn = $('copy-link');
    save();
    try { await navigator.clipboard.writeText(location.origin + location.pathname + location.search + stateToHash()); btn.textContent = 'Link kopiert'; }
    catch { btn.textContent = 'Nicht möglich'; }
    setTimeout(() => { btn.textContent = 'Link kopieren'; }, 1600);
  });

  $('reset-all').addEventListener('click', () => {
    resetting = true;
    try { for (const k of ['stereo-state', 'stereo-intro', 'stereo-sections', 'stereo-explain']) localStorage.removeItem(k); } catch { /* ignorieren */ }
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

  // Bildexport: immer in den hellen Farben, mit durchsichtigem Hintergrund (ausser der Kreisfläche des
  // Stereogramms). Kopieren legt ein PNG in die Zwischenablage (fügt sich in Folien als Bild ein).
  const baseName = () => (state.mode === 'pg' ? state.pg.id.replace(/\//g, '_')
    : (S.currentExample(state)?.id || currentEntryId()).replace(/[/:]/g, '_'));
  const flash = (btn) => {
    const back = btn.dataset.label || (btn.dataset.label = btn.textContent);
    return (text) => { btn.textContent = text; setTimeout(() => { btn.textContent = back; }, 1600); };
  };
  const download = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  /** Kopieren: Blob als Promise übergeben, Safari verlangt den Aufruf noch in der Klick-Behandlung. */
  const copyPng = async (btn, makeBlob) => {
    const say = flash(btn);
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': makeBlob() })]); say('Kopiert'); }
    catch { say('Nicht möglich'); }
  };
  const savePng = async (btn, makeBlob, name) => {
    try { download(await makeBlob(), name); } catch { flash(btn)('Nicht möglich'); }
  };
  $('copy-stereo').addEventListener('click', () => copyPng($('copy-stereo'), stereoPng));
  $('save-svg').addEventListener('click', () => download(new Blob([stereoSvg()], { type: 'image/svg+xml' }), 'stereogramm-' + baseName() + '.svg'));
  $('save-stereo-png').addEventListener('click', () => savePng($('save-stereo-png'), stereoPng, 'stereogramm-' + baseName() + '.png'));
  $('copy-3d').addEventListener('click', () => copyPng($('copy-3d'), snapshot3d));
  $('save-3d').addEventListener('click', () => savePng($('save-3d'), snapshot3d, '3d-konstruktion-' + baseName() + '.png'));
  if (window.STEREO_PREVIEW) for (const id of ['save-svg', 'save-stereo-png', 'save-3d']) $(id).hidden = true;

  // Farbwechsel des Systems (hell/dunkel) → neu zeichnen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  setMode(state.mode);
}

init();

// ------------------------------------------------------------------ Version und Offline-Betrieb
{
  const el = document.getElementById('app-version');
  if (el) el.innerHTML = `<a href="https://github.com/manganite/stereography/releases/tag/v${VERSION}">Version ${VERSION}</a> · <a href="https://github.com/manganite/stereography">Quellcode</a>`;
}
// Service Worker nur auf HTTPS (GitHub Pages), lokal zum Testen mit ?sw. Nach einem Update übernimmt
// die neue Version beim nächsten Öffnen; die Seite lädt dann einmal neu (Zustand bleibt gespeichert).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || new URLSearchParams(location.search).has('sw'))) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
  navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Betrieb weiter */ });
}
