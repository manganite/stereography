// Skript zur Vorlesung: Abbildungen aus dem Code der App, Projektionsskizze, Inhaltsverzeichnis.
// Eine Abbildung ist durch die Link-Adresse der App beschrieben (data-app="#m=form&…"); daraus entsteht
// mit scene.js genau das Stereogramm, das die App für diese Adresse zeigt.

import { buildSVG } from './stereogram.js';
import { palette, pgScene, crystalAxesFor, stateForHash as stateFor, stereoForHash as stereoFor } from './scene.js';
import { hklHTML } from './format.js';
import { VERSION } from './version.js';

const deg = Math.PI / 180;

const appLink = (hash) => 'index.html' + hash;

function renderStereo(fig, col) {
  const dirs = fig.dataset.dirs ? fig.dataset.dirs.split(',').map(Number) : null;
  const { scene } = stereoFor(fig.dataset.app, col, dirs);
  const box = fig.querySelector('.fig-art');
  box.innerHTML = `<svg viewBox="0 0 520 520" role="img" aria-label="${fig.dataset.alt || 'Stereogramm'}">${buildSVG(scene).inner}</svg>`;
}

// 3D-Abbildungen: three.js erst laden, wenn eine solche Abbildung in Sicht kommt. Jede Ansicht braucht einen
// eigenen WebGL-Kontext, und Browser halten nur wenige (Safari auf iPhone/iPad etwa 8) gleichzeitig; das Skript
// hat mehr 3D-Abbildungen. Deshalb leben nur Ansichten in der Nähe des sichtbaren Bereichs; beim Verlassen wird
// der Kontext freigegeben und die Kameraposition gemerkt.
const views3d = new Map();
const live3d = new Set();
const cams3d = new Map();
function release3d(fig) {
  live3d.delete(fig);
  const v = views3d.get(fig);
  if (!v) return;
  cams3d.set(fig, v.camera.position.clone());
  v.destroy();
  views3d.delete(fig);
}
async function render3d(fig, col) {
  const { View3D } = await import('./view3d.js');
  if (!live3d.has(fig)) return; // inzwischen aus dem Bild gescrollt
  let v = views3d.get(fig);
  if (!v) {
    const box = fig.querySelector('.fig-art');
    box.innerHTML = '';
    v = new View3D(box, {});
    views3d.set(fig, v);
    v.setView(fig.dataset.view || 'oblique');
    // vom Leser gedrehte Ansicht wiederherstellen
    const cam = cams3d.get(fig);
    if (cam) { v.camera.position.copy(cam); v.controls.update(); }
  }
  const st0 = stateFor(fig.dataset.app);
  if (st0.mode === 'pg') {
    // Symmetriegerüst in 3D wie in der App (renderPG in main.js)
    const { info, p0, orb, scene } = pgScene(st0, col);
    v.setStereoTexture(buildSVG({ ...scene, poles: scene.poles.map((p) => ({ ...p, gen: false, selected: false })) }, { standalone: true }).full);
    v.showPointGroup(
      { ...info, orbit: st0.pg.showObject ? orb : null, p0, crystalAxes: crystalAxesFor(info.hex) },
      col,
      { showElements: st0.pg.showElements, showObject: st0.pg.showObject, showPoles: st0.pg.showPoles, showRays: st0.view.rays, showSphere: st0.view.sphere, showGlobe: st0.view.globe, showPlane: st0.view.plane, showAxes: st0.view.axes,
        dirColors: st0.view.dirColors ? col.dir : null, hiddenDirs: new Set(st0.pg.hideDirs), arc: null },
    );
    return;
  }
  const { st, C, scene } = stereoFor(fig.dataset.app, col);
  v.setStereoTexture(buildSVG(scene, { standalone: true }).full);
  // data-labels="aus": Indizes nur in dieser Abbildung ausblenden (der Link in die App behält sie)
  const labels = st.poly.labels && st.poly.showPoles && fig.dataset.labels !== 'aus' ? C.faces.map((f) => hklHTML(f.hkl, C.hex && st.poly.bravais)) : null;
  v.showPolyhedron(C, col, {
    showPoles: st.poly.showPoles, showRays: st.view.rays, showSphere: st.view.sphere, showGlobe: st.view.globe, showPlane: st.view.plane, showAxes: st.view.axes, showNormals: st.view.normals,
    size: st.poly.size, planeOpacity: 0.55, motifs: st.poly.faceSym ? C.motifs : null, // Flächenmuster wie in der App (muster=1) zones: C.selZones, arc: null, picked: [],
  }, null, labels);
}

function addAppLink(fig) {
  const cap = fig.querySelector('figcaption');
  if (!cap || cap.querySelector('.to-app')) return;
  const a = document.createElement('a');
  a.className = 'to-app';
  a.href = appLink(fig.dataset.app);
  a.textContent = fig.closest('.fig-grid5') ? 'App' : 'In der App öffnen';
  cap.append(' ', a);
}

function renderFigures() {
  const col = palette();
  for (const fig of document.querySelectorAll('figure[data-app]')) {
    addAppLink(fig);
    if (fig.dataset.kind === '3d') { if (views3d.has(fig)) render3d(fig, col); } else renderStereo(fig, col);
  }
  for (const f of projFigures) f.draw();
}

function watch3d() {
  const figs = [...document.querySelectorAll('figure[data-kind="3d"]')];
  if (!figs.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) { release3d(e.target); continue; }
      if (live3d.has(e.target)) continue;
      live3d.add(e.target);
      render3d(e.target, palette()).catch((err) => {
        e.target.querySelector('.fig-art').innerHTML = '<p class="fig-err">Die 3D-Ansicht konnte nicht geladen werden.</p>';
        console.error(err);
      });
    }
  }, { rootMargin: '300px 0px' });
  figs.forEach((f) => io.observe(f));
}

// ------------------------------------------------------------------ Projektionsskizze (Kapitel 2)
// Links ein Schnitt durch die Umkugel (N oben, S unten, Äquatorebene von der Seite), rechts der Blick
// von oben auf die Projektionsebene. Ein Regler stellt die Poldistanz ρ ein (Borchardt-Ott: obere
// Halbkugel vom Nordpol, untere vom Südpol aus negativ).
const projFigures = [];
function projectionSketch(fig) {
  const svg = fig.querySelector('svg');
  const input = fig.querySelector('input[type="range"]');
  const out = fig.querySelector('output');
  const R = 120, L = { x: 165, y: 175 };
  let T = { x: 485, y: 175 };
  const draw = () => {
    // schmal (Telefon): Schnitt und Stereogramm untereinander, damit die Schrift lesbar bleibt
    const narrow = fig.clientWidth > 0 && fig.clientWidth < 540;
    T = narrow ? { x: 165, y: 175 + 345 } : { x: 485, y: 175 };
    svg.setAttribute('viewBox', narrow ? '0 0 330 700' : '0 0 650 335');
    const rho = Number(input.value);
    const upper = rho >= 0;
    const theta = upper ? rho : 180 + rho; // Winkel zum Nordpol
    const t = theta * deg;
    const P = { x: L.x + R * Math.sin(t), y: L.y - R * Math.cos(t) };
    const target = upper ? { x: L.x, y: L.y + R } : { x: L.x, y: L.y - R }; // S bzw. N
    const r = upper ? R * Math.tan(t / 2) : R * Math.tan((Math.PI - t) / 2);
    const Pp = { x: L.x + r, y: L.y };
    const onEq = Math.abs(Math.abs(rho) - 90) < 1e-9;
    // Kristallfläche: kurze Strecke senkrecht zur Normalen nahe dem Mittelpunkt
    const n = [Math.sin(t), -Math.cos(t)], q = [-n[1], n[0]], d = 26, h = 20;
    const F1 = { x: L.x + n[0] * d + q[0] * h, y: L.y + n[1] * d + q[1] * h };
    const F2 = { x: L.x + n[0] * d - q[0] * h, y: L.y + n[1] * d - q[1] * h };
    // Bogen für ρ vom Bezugspol aus
    const a0 = upper ? -90 : 90, a1 = upper ? -90 + theta : 90 - (180 - theta);
    const arcR = 46;
    const pt = (a) => ({ x: L.x + arcR * Math.cos(a * deg), y: L.y + arcR * Math.sin(a * deg) });
    const A0 = pt(a0), A1 = pt(a1);
    const sweep = upper ? 1 : 0;
    const lab = { x: L.x + (arcR + 16) * Math.cos(((a0 + a1) / 2) * deg), y: L.y + (arcR + 16) * Math.sin(((a0 + a1) / 2) * deg) };
    const marker = (x, y, filled) => (filled || onEq
      ? `<circle class="pt" cx="${x}" cy="${y}" r="6"/>`
      : `<circle class="pt-open" cx="${x}" cy="${y}" r="6"/>`);
    svg.innerHTML = `
      <text class="cap" x="${L.x}" y="22" text-anchor="middle">Schnitt durch die Umkugel</text>
      <text class="cap" x="${T.x}" y="${T.y - 153}" text-anchor="middle">Stereogramm (Blick von oben)</text>
      <circle class="sphere" cx="${L.x}" cy="${L.y}" r="${R}"/>
      <line class="plane" x1="${L.x - R - 22}" y1="${L.y}" x2="${L.x + R + 22}" y2="${L.y}"/>
      <text class="small" x="${L.x - R - 20}" y="${L.y + 16}">Äquatorebene</text>
      <circle class="pole-ns" cx="${L.x}" cy="${L.y - R}" r="3.5"/><text class="lbl" x="${L.x - 8}" y="${L.y - R - 8}" text-anchor="end">N</text>
      <circle class="pole-ns" cx="${L.x}" cy="${L.y + R}" r="3.5"/><text class="lbl" x="${L.x - 8}" y="${L.y + R + 18}" text-anchor="end">S</text>
      <line class="axis" x1="${L.x}" y1="${L.y - R}" x2="${L.x}" y2="${L.y + R}"/>
      ${Math.abs(theta) > 0.5 && Math.abs(theta - 180) > 0.5 ? `<path class="arc" d="M${A0.x},${A0.y} A${arcR},${arcR} 0 0 ${sweep} ${A1.x},${A1.y}"/>` : ''}
      <text class="rho" x="${lab.x}" y="${lab.y + 4}" text-anchor="middle">ρ</text>
      <line class="face" x1="${F1.x}" y1="${F1.y}" x2="${F2.x}" y2="${F2.y}"/>
      <line class="normal" x1="${L.x}" y1="${L.y}" x2="${P.x}" y2="${P.y}"/>
      ${onEq ? '' : `<line class="ray" x1="${P.x}" y1="${P.y}" x2="${target.x}" y2="${target.y}"/>`}
      <circle class="pole" cx="${P.x}" cy="${P.y}" r="5"/>
      <text class="lbl" x="${P.x + 10}" y="${P.y + (upper ? -6 : 16)}">P</text>
      ${marker(Pp.x, Pp.y, upper)}
      <text class="lbl" x="${Pp.x + (onEq ? 10 : 4)}" y="${Pp.y + (upper ? 20 : -10)}">P′</text>
      <circle class="base" cx="${T.x}" cy="${T.y}" r="${R}"/>
      <line class="tick" x1="${T.x - 5}" y1="${T.y}" x2="${T.x + 5}" y2="${T.y}"/><line class="tick" x1="${T.x}" y1="${T.y - 5}" x2="${T.x}" y2="${T.y + 5}"/>
      ${marker(T.x + r, T.y, upper)}
      <text class="lbl" x="${T.x + r + (onEq ? 10 : 4)}" y="${T.y + (upper ? 20 : -10)}">P′</text>
      <text class="small" x="${T.x}" y="${T.y + R + 22}" text-anchor="middle">Grundkreis = Äquator der Umkugel</text>`;
    const where = onEq ? 'auf dem Äquator: Der Pol liegt auf dem Grundkreis'
      : upper ? 'obere Halbkugel: Strahl zum Südpol, Punkt ●' : 'untere Halbkugel: Strahl zum Nordpol, Kreis ○';
    out.textContent = `ρ = ${rho < 0 ? '−' : ''}${Math.abs(rho)}° (${where}). Abstand vom Mittelpunkt: ${Math.round((r / R) * 100)} % des Radius.`;
  };
  input.addEventListener('input', draw);
  let wasNarrow = null;
  new ResizeObserver(() => { const n = fig.clientWidth < 540; if (n !== wasNarrow) { wasNarrow = n; draw(); } }).observe(fig);
  draw();
  projFigures.push({ draw });
}

// ------------------------------------------------------------------ Inhaltsverzeichnis
function initToc() {
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const secs = [...document.querySelectorAll('main section[id]')].filter((s) => byId.has(s.id));
  if (!secs.length) return;
  // Vertiefungen im Inhaltsverzeichnis kennzeichnen; die Einstufung steht nur am Abschnitt (data-level)
  for (const s of secs) {
    if (s.dataset.level !== 'vertiefung') continue;
    // ganze Kapitel: Randlinie am Eintrag (unter der Zwischenüberschrift „Vertiefungen“)
    if (s.parentElement.tagName === 'ARTICLE') { byId.get(s.id).parentElement.classList.add('vertiefung'); continue; }
    const tag = document.createElement('span');
    tag.className = 'etikett';
    tag.textContent = 'Vertiefung';
    byId.get(s.id).append(tag);
  }
  const io = new IntersectionObserver(() => {
    // aktueller Abschnitt: der letzte, dessen Anfang oberhalb der Bildschirmmitte liegt
    let cur = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top < window.innerHeight * 0.35) cur = s;
    for (const a of links) a.removeAttribute('aria-current');
    byId.get(cur.id)?.setAttribute('aria-current', 'true');
  }, { threshold: [0, 1], rootMargin: '0px 0px -60% 0px' });
  secs.forEach((s) => io.observe(s));
  // Telefon: Inhaltsverzeichnis nach Auswahl schliessen
  const det = document.querySelector('.toc details');
  if (det && window.matchMedia('(max-width: 899px)').matches) det.open = false;
  for (const a of links) a.addEventListener('click', () => { if (det && window.matchMedia('(max-width: 899px)').matches) det.open = false; });
}

function init() {
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = VERSION; });
  document.querySelectorAll('figure.proj').forEach(projectionSketch);
  renderFigures();
  watch3d();
  initToc();
  // Farbschema gewechselt: Abbildungen mit den neuen Farben neu zeichnen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => renderFigures());
}
init();

// Offline wie die App (derselbe Service Worker, auch wenn das Skript zuerst geöffnet wird)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Betrieb weiter */ });
}
