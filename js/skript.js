// Skript zur Vorlesung: Abbildungen aus dem Code der App, Projektionsskizze, Inhaltsverzeichnis.
// Eine Abbildung ist durch die Link-Adresse der App beschrieben (data-app="#m=form&…"); daraus entsteht
// mit scene.js genau das Stereogramm, das die App für diese Adresse zeigt.

import { buildSVG } from './stereogram.js';
import { createState, applyHashTo, palette, pgScene, polyCrystal, polyScene, normalizeZones } from './scene.js';
import { hklHTML } from './format.js';
import { VERSION } from './version.js';

const deg = Math.PI / 180;

/** Zustand der App für eine Link-Adresse. */
function stateFor(hash) {
  const st = createState();
  applyHashTo(st, hash, createState());
  st.poly.zones = normalizeZones(st.poly.zones);
  return st;
}

/** Stereogramm (SVG-Inhalt) für eine Link-Adresse der App. */
function stereoFor(hash, col) {
  const st = stateFor(hash);
  if (st.mode === 'pg') return { st, scene: pgScene(st, col).scene };
  const C = polyCrystal(st, col);
  return { st, C, scene: polyScene(st, C, col).scene };
}

const appLink = (hash) => 'index.html' + hash;

function renderStereo(fig, col) {
  const { scene } = stereoFor(fig.dataset.app, col);
  const box = fig.querySelector('.fig-art');
  box.innerHTML = `<svg viewBox="0 0 520 520" role="img" aria-label="${fig.dataset.alt || 'Stereogramm'}">${buildSVG(scene).inner}</svg>`;
}

// 3D-Abbildungen: three.js erst laden, wenn eine solche Abbildung in Sicht kommt
const views3d = new Map();
async function render3d(fig, col) {
  const { View3D } = await import('./view3d.js');
  const { st, C, scene } = stereoFor(fig.dataset.app, col);
  let v = views3d.get(fig);
  if (!v) {
    const box = fig.querySelector('.fig-art');
    box.innerHTML = '';
    v = new View3D(box, {});
    views3d.set(fig, v);
    v.setView(fig.dataset.view || 'oblique');
  }
  v.setStereoTexture(buildSVG(scene, { standalone: true }).full);
  // data-labels="aus": Indizes nur in dieser Abbildung ausblenden (der Link in die App behält sie)
  const labels = st.poly.labels && fig.dataset.labels !== 'aus' ? C.faces.map((f) => hklHTML(f.hkl, C.hex && st.poly.bravais)) : null;
  v.showPolyhedron(C, col, {
    showRays: st.view.rays, showSphere: st.view.sphere, showPlane: st.view.plane, showAxes: st.view.axes, showNormals: st.view.normals,
    size: st.poly.size, planeOpacity: 0.55, motifs: null, zones: C.selZones, arc: null, picked: [],
  }, null, labels);
}

function addAppLink(fig) {
  const cap = fig.querySelector('figcaption');
  if (!cap || cap.querySelector('.to-app')) return;
  const a = document.createElement('a');
  a.className = 'to-app';
  a.href = appLink(fig.dataset.app);
  a.textContent = 'In der App öffnen';
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
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      render3d(e.target, palette()).catch((err) => {
        e.target.querySelector('.fig-art').innerHTML = '<p class="fig-err">Die 3D-Ansicht konnte nicht geladen werden.</p>';
        console.error(err);
      });
    }
  }, { rootMargin: '200px' });
  figs.forEach((f) => io.observe(f));
}

// ------------------------------------------------------------------ Projektionsskizze (Kapitel 1)
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
