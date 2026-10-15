// SVG-Stereogramm nach den Konventionen der International Tables (Vol. A):
// Blick entlang z (c), a (x) zeigt nach unten, b (y) nach rechts.
// Pole der oberen Halbkugel: Punkt; der unteren: Kreis; beide zusammen: Kreis mit Punkt.
// Spiegelebenen: kräftige Linien (Grosskreise); Spiegelebene ⊥ z: kräftiger Grundkreis.

import { cross, normalize, dot, scale } from './linalg.js';
import { hklParts } from './format.js';

export const SIZE = 520;
export const C = SIZE / 2;
export const R = 210;
const SYM = 14; // Grösse der Achsensymbole

const f = (x) => (Math.round(x * 100) / 100).toString();

/** Stereographische Projektion eines Einheitsvektors → Bildschirmkoordinaten. */
export function project(p) {
  const upper = p[2] >= -1e-9;
  const d = upper ? 1 + p[2] : 1 - p[2];
  const px = p[0] / d, py = p[1] / d;
  return { x: C + R * py, y: C + R * px, upper, onPrimitive: Math.abs(p[2]) < 1e-6 };
}

/** Umkehrung: Bildschirmpunkt → Einheitsvektor (obere oder untere Halbkugel). */
export function unproject(sx, sy, lower = false) {
  const py = (sx - C) / R, px = (sy - C) / R;
  let r2 = px * px + py * py;
  let qx = px, qy = py;
  if (r2 > 1) { const r = Math.sqrt(r2); qx /= r; qy /= r; r2 = 1; }
  const z = (1 - r2) / (1 + r2);
  const s = 1 + z;
  const p = [qx * s, qy * s, z];
  return lower ? [p[0], p[1], -p[2]] : p;
}

/** Bildschirmwinkel (Grad, SVG-Drehsinn) einer Richtung in der Ebene. */
const screenAngle = (d) => (Math.atan2(d[0], d[1]) * 180) / Math.PI;

function polyPoints(n, r, startDeg) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    pts.push(`${f(r * Math.cos(a))},${f(r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

const lensPath = (s) => {
  const h = s * 0.62;
  return `M ${f(-s)} 0 Q 0 ${f(-h * 2)} ${f(s)} 0 Q 0 ${f(h * 2)} ${f(-s)} 0 Z`;
};

/** SVG eines Achsensymbols (lokales Koordinatensystem, Referenzrichtung = +x lokal). */
function axisSymbolSVG(symbol, centre, col) {
  const ink = col.axis, paper = col.paper;
  const filled = `fill="${ink}" stroke="${ink}" stroke-width="0.8"`;
  const open = `fill="${paper}" stroke="${ink}" stroke-width="1.6"`;
  const dotC = (r) => `<circle r="${f(r)}" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>`;
  const s = SYM;
  switch (symbol) {
    case '2': return `<path d="${lensPath(s * 0.95)}" ${filled}/>` + (centre ? dotC(s * 0.27) : '');
    case '3': return `<polygon points="${polyPoints(3, s, 0)}" ${filled}/>`;
    case '4': return `<polygon points="${polyPoints(4, s * 0.95, 45)}" ${filled}/>` + (centre ? dotC(s * 0.3) : '');
    case '6': return `<polygon points="${polyPoints(6, s, 0)}" ${filled}/>` + (centre ? dotC(s * 0.32) : '');
    case '-3': return `<polygon points="${polyPoints(3, s * 1.05, 0)}" ${filled}/>` + dotC(s * 0.27);
    case '-4': return `<polygon points="${polyPoints(4, s * 0.95, 45)}" ${open}/><path d="${lensPath(s * 0.55)}" ${filled}/>`;
    case '-6': return `<polygon points="${polyPoints(6, s * 1.08, 0)}" ${open}/><polygon points="${polyPoints(3, s * 0.62, 0)}" ${filled}/>`;
    default: return '';
  }
}

/** Kleines eigenständiges SVG eines Achsensymbols (für Legenden). */
export function symbolIcon(symbol, centre, col, size = 26) {
  return `<svg class="sym-icon" viewBox="-14 -14 28 28" width="${size}" height="${size}" aria-hidden="true"><g transform="rotate(90)">${axisSymbolSVG(symbol, centre, col)}</g></svg>`;
}

/** Polylinie eines Grosskreises (obere Hälfte) mit Normale n. */
function greatCirclePath(n) {
  n = normalize(n);
  if (Math.abs(n[2]) > 1 - 1e-9) return null; // = Grundkreis
  const u = normalize(cross(n, [0, 0, 1]));
  let w = cross(n, u);
  if (w[2] < 0) w = scale(w, -1);
  const pts = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const t = (Math.PI * i) / N;
    const p = [u[0] * Math.cos(t) + w[0] * Math.sin(t), u[1] * Math.cos(t) + w[1] * Math.sin(t), u[2] * Math.cos(t) + w[2] * Math.sin(t)];
    const q = project(p);
    pts.push(`${f(q.x)},${f(q.y)}`);
  }
  return 'M ' + pts.join(' L ');
}

/** Kleinkreis um die Achse ax (Einheitsvektor) mit Öffnungswinkel rho, nur obere Halbkugel. */
function smallCirclePath(ax, rho) {
  ax = normalize(ax);
  const u = normalize(Math.abs(ax[2]) < 0.9 ? cross(ax, [0, 0, 1]) : cross(ax, [1, 0, 0]));
  const w = cross(ax, u);
  const segs = [];
  let cur = [];
  const N = 180;
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const p = [0, 1, 2].map((k) => ax[k] * Math.cos(rho) + Math.sin(rho) * (u[k] * Math.cos(t) + w[k] * Math.sin(t)));
    if (p[2] >= -1e-9) { const q = project(p); cur.push(`${f(q.x)},${f(q.y)}`); }
    else if (cur.length) { segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs.map((s) => 'M ' + s.join(' L ')).join(' ');
}

const rotZ = (p, deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
};

/** Wulffsches Netz (Grosskreise durch die Pole N/S oben/unten, Kleinkreise) gedreht um rot Grad. */
function wulffNet(rot, col) {
  let main = '', fine = '';
  for (let deg = 2; deg < 180; deg += 2) {
    if (deg === 90) continue;
    const psi = (deg * Math.PI) / 180;
    // Grosskreise, die die Nord-Süd-Achse (x) enthalten
    const n = rotZ([0, Math.cos(psi), Math.sin(psi)], rot);
    const gp = greatCirclePath(n);
    // Kleinkreise um die Nord-Süd-Achse
    const sp = smallCirclePath(rotZ([1, 0, 0], rot), psi);
    if (deg % 10 === 0) main += gp + ' ' + sp + ' '; else fine += gp + ' ' + sp + ' ';
  }
  const ax = rotZ([1, 0, 0], rot), ay = rotZ([0, 1, 0], rot);
  const pa = project(ax), pb = project(scale(ax, -1)), pc = project(ay), pd = project(scale(ay, -1));
  main += `M ${f(pa.x)},${f(pa.y)} L ${f(pb.x)},${f(pb.y)} M ${f(pc.x)},${f(pc.y)} L ${f(pd.x)},${f(pd.y)}`;
  return `<g fill="none" stroke-linecap="round">
    <path d="${fine}" stroke="${col.net}" stroke-width="0.35" opacity="0.55"/>
    <path d="${main}" stroke="${col.net}" stroke-width="0.8"/></g>`;
}

function textWithBars(parts, x, y, attrs) {
  const ts = parts.map((p) => (p.bar ? `<tspan text-decoration="overline">${p.t}</tspan>` : `<tspan>${p.t}</tspan>`)).join('');
  return `<text x="${f(x)}" y="${f(y)}" ${attrs}>${ts}</text>`;
}

/**
 * Baut das komplette SVG.
 * scene = {
 *   col: Farben {paper, ink, muted, net, mirror, axis, upper, lower, accent, accent2},
 *   wulff: {on, rot}, primitiveBold, mirrors:[n], axes:[{dir, symbol, centre}], centreAtOrigin,
 *   poles:[{p, label(parts)|null, det, idx, gen, selected, faint}], colorByDet, showLower,
 *   axisLabels:[{name, dir}], fontFamily
 * }
 */
export function buildSVG(scene, { standalone = false } = {}) {
  const col = scene.col;
  const out = [];
  const font = scene.fontFamily || 'Helvetica, Arial, sans-serif';
  out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="${col.paper}"/>`);
  if (scene.wulff?.on) out.push(wulffNet(scene.wulff.rot || 0, col));

  // Spiegelebenen
  let mirr = '';
  for (const n of scene.mirrors || []) {
    const p = greatCirclePath(n);
    if (p) mirr += p + ' ';
  }
  if (mirr) out.push(`<path d="${mirr}" fill="none" stroke="${col.mirror}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${scene.primitiveBold ? col.mirror : col.ink}" stroke-width="${scene.primitiveBold ? 2.8 : 1.2}"/>`);
  out.push(`<g stroke="${col.ink}" stroke-width="1"><line x1="${C - 5}" y1="${C}" x2="${C + 5}" y2="${C}"/><line x1="${C}" y1="${C - 5}" x2="${C}" y2="${C + 5}"/></g>`);

  // Kristallachsen-Beschriftung
  for (const a of scene.axisLabels || []) {
    const d = a.dir;
    if (d[2] < -1e-6) continue;
    const q = project(d);
    if (q.onPrimitive || Math.hypot(q.x - C, q.y - C) > R - 2) {
      const ux = (q.x - C) / R, uy = (q.y - C) / R;
      out.push(`<line x1="${f(C + ux * (R + 3))}" y1="${f(C + uy * (R + 3))}" x2="${f(C + ux * (R + 11))}" y2="${f(C + uy * (R + 11))}" stroke="${col.muted}" stroke-width="1.4"/>`);
      out.push(`<text x="${f(C + ux * (R + 24) - uy * 14)}" y="${f(C + uy * (R + 24) + ux * 14 + 5)}" font-family="${font}" font-style="italic" font-size="16" fill="${col.muted}" text-anchor="middle">${a.name}</text>`);
    } else {
      out.push(`<g stroke="${col.muted}" stroke-width="1.4"><line x1="${f(q.x - 5)}" y1="${f(q.y - 5)}" x2="${f(q.x + 5)}" y2="${f(q.y + 5)}"/><line x1="${f(q.x - 5)}" y1="${f(q.y + 5)}" x2="${f(q.x + 5)}" y2="${f(q.y - 5)}"/></g>`);
      out.push(`<text x="${f(q.x + 8)}" y="${f(q.y - 7)}" font-family="${font}" font-style="italic" font-size="15" fill="${col.muted}">${a.name}</text>`);
    }
  }

  // Achsensymbole
  const refZ = scene.refDirZ || [1, 0, 0];
  for (const ax of scene.axes || []) {
    const ends = Math.abs(ax.dir[2]) < 1e-6 ? [ax.dir, scale(ax.dir, -1)] : [ax.dir];
    for (const d of ends) {
      const q = project(d);
      let ang;
      if (Math.abs(d[2]) > 1 - 1e-6) ang = screenAngle(refZ);
      else ang = Math.atan2(q.y - C, q.x - C) * 180 / Math.PI;
      out.push(`<g transform="translate(${f(q.x)},${f(q.y)}) rotate(${f(ang)})">${axisSymbolSVG(ax.symbol, ax.centre, col)}</g>`);
    }
  }
  if (scene.centreAtOrigin) out.push(`<circle cx="${C}" cy="${C}" r="${f(SYM * 0.38)}" fill="${col.paper}" stroke="${col.axis}" stroke-width="1.4"/>`);

  // Pole
  const poles = (scene.poles || []).map((P) => ({ ...P, q: project(P.p) }));
  const drawn = [];
  for (const P of poles) {
    if (!P.q.upper && !scene.showLower) continue;
    const cU = scene.colorByDet ? (P.det > 0 ? col.upper : col.accent2) : col.ink;
    const op = P.faint ? ' opacity="0.45"' : '';
    if (P.q.upper) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="4.2" fill="${cU}"${op}/>`);
    else out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="6.2" fill="none" stroke="${cU}" stroke-width="1.6"${op}/>`);
    drawn.push(P);
  }
  // Markierungen (Auswahl, Ausgangspunkt)
  for (const P of drawn) {
    if (P.gen) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="11" fill="none" stroke="${col.accent}" stroke-width="2" stroke-dasharray="3 2.5"/>`);
    if (P.selected) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="11.5" fill="none" stroke="${col.accent}" stroke-width="2.6"/>`);
  }
  // Beschriftungen: zusammenfallende Pole (oben/unten) werden gestapelt beschriftet
  const clusters = [];
  for (const P of drawn) {
    if (!P.label) continue;
    let cl = clusters.find((c) => Math.hypot(c.x - P.q.x, c.y - P.q.y) < 2);
    if (!cl) { cl = { x: P.q.x, y: P.q.y, items: [] }; clusters.push(cl); }
    cl.items.push(P);
  }
  for (const cl of clusters) {
    cl.items.sort((a, b) => (b.q.upper ? 1 : 0) - (a.q.upper ? 1 : 0));
    let dx = cl.x - C, dy = cl.y - C;
    const l = Math.hypot(dx, dy);
    if (l < 1) { dx = 0.6; dy = 0.8; } else { dx /= l; dy /= l; }
    const off = 16;
    const lh = 16;
    const anchor = dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
    let by = cl.y + dy * off + 4.5;
    if (dy < -0.35) by -= (cl.items.length - 1) * lh;
    else if (Math.abs(dy) <= 0.35) by -= ((cl.items.length - 1) * lh) / 2;
    cl.items.forEach((P, k) => {
      const fill = P.q.upper ? col.ink : col.muted;
      const lab = P.q.upper ? P.label : P.label;
      out.push(textWithBars(lab, cl.x + dx * off, by + k * lh, `font-family="${font}" font-size="14.5" fill="${fill}" text-anchor="${anchor}" paint-order="stroke" stroke="${col.paper}" stroke-width="3" stroke-linejoin="round"${P.q.upper ? '' : ' font-style="italic"'}`));
    });
  }
  // Treffer-Flächen für Klick/Tippen
  if (!standalone) {
    for (const P of drawn) {
      out.push(`<circle class="hit" data-idx="${P.idx}" cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="13" fill="transparent"/>`);
    }
  }
  const inner = out.join('\n');
  const vb = `0 0 ${SIZE} ${SIZE}`;
  return {
    inner,
    full: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${SIZE}" height="${SIZE}">${standalone && scene.bg ? `<rect width="100%" height="100%" fill="${scene.bg}"/>` : ''}${inner}</svg>`,
  };
}
