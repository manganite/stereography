// SVG-Stereogramm nach den Konventionen der International Tables (Vol. A):
// Blick entlang z (c), a (x) zeigt nach unten, b (y) nach rechts.
// Pole der oberen Halbkugel: Punkt; der unteren: Kreis; beide zusammen: Kreis mit Punkt.
// Spiegelebenen: kräftige Linien (Grosskreise); Spiegelebene ⊥ z: kräftiger Grundkreis.

import { cross, normalize, scale } from './linalg.js';

/** @import { Vec3, Grad, Bogenmass } from '../lib/common/js/typen.js' */
/** @import { Teil } from '../lib/common/js/format.js' */
/**
 * Farben des Stereogramms (aus base.css bzw. den hellen Farben für Bilder).
 * @typedef {{ paper: string, ink: string, muted: string, net: string, mirror: string, axis: string, upper: string, lower?: string, accent: string, accent2: string }} Farben
 */
/** Projizierter Punkt: Bildschirmkoordinaten, obere Halbkugel, auf dem Grundkreis. @typedef {{ x: number, y: number, upper: boolean, onPrimitive: boolean }} Bildpunkt */
/**
 * Pol in der Szene. label: Beschriftung in Teilen (hklParts), det: Determinante der erzeugenden Operation,
 * idx: Nummer für die Trefferfläche, gen: Ausgangspol, aux: Ergänzungsform, zoneColors: Ringe je Zone.
 * @typedef {object} ScenePol
 * @property {Vec3} p
 * @property {Teil[] | null} [label]
 * @property {number} [det]
 * @property {number} [idx]
 * @property {boolean} [gen]
 * @property {boolean} [selected]
 * @property {boolean} [faint]
 * @property {boolean} [aux]
 * @property {string | null} [color]
 * @property {string[]} [zoneColors]
 * @property {boolean} [zone]
 */
/** Zone: Zonenachse, Farbe, Beschriftung; axisMark: false ohne × am Zonenpol. @typedef {{ axis: Vec3, color?: string, label?: Teil[] | null, axisMark?: boolean }} SceneZone */
/**
 * Inhalt eines Stereogramms (buildSVG).
 * @typedef {object} Szene
 * @property {Farben} col
 * @property {{ on: boolean, rot?: Grad }} [wulff]
 * @property {boolean} [primitiveBold]
 * @property {string | null} [primitiveColor]
 * @property {(Vec3 | { n: Vec3, color?: string | null })[]} [mirrors]
 * @property {{ dir: Vec3, symbol: string, centre: boolean, color?: string | null }[]} [axes]
 * @property {Vec3[]} [zones]
 * @property {boolean} [centreAtOrigin]
 * @property {boolean} [faint]
 * @property {ScenePol[]} [poles]
 * @property {boolean} [colorByDet]
 * @property {boolean} [showLower]
 * @property {{ name: string, dir: Vec3 }[]} [axisLabels]
 * @property {string} [fontFamily]
 * @property {number} [poleScale]
 * @property {SceneZone[]} [zoneList]
 * @property {SceneZone} [zone]
 * @property {{ a: Vec3, b: Vec3, label: string } | null} [arc]
 * @property {number} [labelSize]
 * @property {number} [hitR]
 * @property {string} [bg]
 */

export const SIZE = 520;
export const C = SIZE / 2;
export const R = 210;
const SYM = 17; // Grösse der Achsensymbole

/** @param {number} x */
const f = (x) => (Math.round(x * 100) / 100).toString();

/** Stereographische Projektion eines Einheitsvektors → Bildschirmkoordinaten. @param {Vec3} p @returns {Bildpunkt} */
export function project(p) {
  const upper = p[2] >= -1e-9;
  const d = upper ? 1 + p[2] : 1 - p[2];
  const px = p[0] / d, py = p[1] / d;
  return { x: C + R * py, y: C + R * px, upper, onPrimitive: Math.abs(p[2]) < 1e-6 };
}

/** Umkehrung: Bildschirmpunkt → Einheitsvektor (obere oder untere Halbkugel). @param {number} sx @param {number} sy @param {boolean} [lower] @returns {Vec3} */
export function unproject(sx, sy, lower = false) {
  const py = (sx - C) / R, px = (sy - C) / R;
  let r2 = px * px + py * py;
  let qx = px, qy = py;
  if (r2 > 1) { const r = Math.sqrt(r2); qx /= r; qy /= r; r2 = 1; }
  const z = (1 - r2) / (1 + r2);
  const s = 1 + z;
  /** @type {Vec3} */
  const p = [qx * s, qy * s, z];
  return lower ? [p[0], p[1], -p[2]] : p;
}

/** @param {number} n @param {number} r @param {number} startDeg */
function polyPoints(n, r, startDeg) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    pts.push(`${f(r * Math.cos(a))},${f(r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

/** @param {number} s @param {number} [ratio] */
const lensPath = (s, ratio = 0.62) => {
  const h = s * ratio;
  return `M ${f(-s)} 0 Q 0 ${f(-h * 2)} ${f(s)} 0 Q 0 ${f(h * 2)} ${f(-s)} 0 Z`;
};

/**
 * SVG eines Achsensymbols nach ITA A, Kap. 1.4.5, im lokalen Koordinatensystem:
 * Linse mit langer Achse entlang +x, Polygone mit einer Ecke auf +x.
 * centre: Punkt für Inversionszentrum (nur bei Achse ⊥ Projektionsebene, 2/m, 4/m, 6/m).
 * halo: weisser Unterleger, der Linien um das Symbol herum aussetzt (wie in ITA).
 * @param {string} symbol
 * @param {boolean} centre
 * @param {Pick<Farben, 'axis' | 'paper'>} col
 * @param {boolean} [halo]
 */
export function axisSymbolSVG(symbol, centre, col, halo = false) {
  const ink = col.axis, paper = col.paper;
  const filled = halo ? `fill="${paper}" stroke="${paper}" stroke-width="7" stroke-linejoin="round"` : `fill="${ink}" stroke="${ink}" stroke-width="0.8"`;
  const open = halo ? filled : `fill="${paper}" stroke="${ink}" stroke-width="1.6"`;
  /** @param {number} r */
  const dotC = (r) => (halo ? '' : `<circle r="${f(r)}" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>`);
  const s = SYM;
  switch (symbol) {
    case '2': return `<path d="${lensPath(s * 0.95)}" ${filled}/>` + (centre ? dotC(s * 0.27) : '');
    case '3': return `<polygon points="${polyPoints(3, s, 0)}" ${filled}/>`;
    case '4': return `<polygon points="${polyPoints(4, s * 1.05, 0)}" ${filled}/>` + (centre ? dotC(s * 0.3) : '');
    case '6': return `<polygon points="${polyPoints(6, s, 0)}" ${filled}/>` + (centre ? dotC(s * 0.32) : '');
    case '-3': return `<polygon points="${polyPoints(3, s * 1.05, 0)}" ${filled}/>` + dotC(s * 0.27);
    // offenes Quadrat (auf der Spitze), Linse verbindet zwei gegenüberliegende Ecken
    case '-4': return `<polygon points="${polyPoints(4, s * 1.1, 0)}" ${open}/>` + (halo ? '' : `<path d="${lensPath(s * 0.88, 0.36)}" ${filled}/>`);
    // offenes Sechseck mit einbeschriebenem gefülltem Dreieck (Ecken auf Sechseckecken)
    case '-6': return `<polygon points="${polyPoints(6, s * 1.1, 0)}" ${open}/>` + (halo ? '' : `<polygon points="${polyPoints(3, s * 0.98, 0)}" ${filled}/>`);
    default: return '';
  }
}

/**
 * Drehwinkel (SVG, Grad) eines Achsensymbols im Stereogramm nach ITA A, Kap. 10.1:
 * Achse ⊥ Projektionsebene: Linse ∥ a (senkrecht), Quadrat auf der Spitze,
 * Dreieck mit Spitze nach oben, Sechseck mit Ecken oben/unten.
 * Liegende/geneigte Achsen: Linse tangential, Dreieck mit Spitze radial nach aussen,
 * 4-zählige Symbole in fester Lage (Spitze oben, Linse von 4̄ senkrecht).
 * @param {string} symbol
 * @param {{ x: number, y: number }} q
 * @param {boolean} alongZ
 */
function symbolAngle(symbol, q, alongZ) {
  const radial = alongZ ? 0 : (Math.atan2(q.y - C, q.x - C) * 180) / Math.PI;
  switch (symbol) {
    case '2': return alongZ ? 90 : radial + 90;
    case '4': case '-4': return 90;
    case '3': case '-3': return alongZ ? -90 : radial;
    case '6': return 90;
    case '-6': return -90;
    default: return 0;
  }
}

/**
 * Kleines eigenständiges SVG eines Achsensymbols (für Legenden), Lage wie Achse ⊥ Projektionsebene.
 * @param {string} symbol @param {boolean} centre @param {Pick<Farben, 'axis' | 'paper'>} col @param {number} [size]
 */
export function symbolIcon(symbol, centre, col, size = 26) {
  const a = symbolAngle(symbol, { x: C, y: C }, true);
  return `<svg class="sym-icon" viewBox="-21 -21 42 42" width="${size}" height="${size}" aria-hidden="true"><g transform="rotate(${a})">${axisSymbolSVG(symbol, centre, col)}</g></svg>`;
}

/**
 * Punkte auf dem kürzeren Grosskreisbogen von a nach b (Einheitsvektoren); bei a ≈ −b ein beliebiger Halbkreis.
 * @param {Vec3} a @param {Vec3} b @param {number} [n]
 * @returns {Vec3[]}
 */
export function arcPoints(a, b, n = 90) {
  a = normalize(a); b = normalize(b);
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(d);
  /** @type {Vec3} */
  let u;
  if (om > Math.PI - 1e-6) {
    u = cross(a, Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  } else {
    u = [b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]];
  }
  u = normalize(u);
  /** @type {Vec3[]} */
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (om * i) / n;
    pts.push([a[0] * Math.cos(t) + u[0] * Math.sin(t), a[1] * Math.cos(t) + u[1] * Math.sin(t), a[2] * Math.cos(t) + u[2] * Math.sin(t)]);
  }
  return pts;
}

/** Polylinie eines Grosskreises (obere Hälfte) mit Normale n. @param {Vec3} n */
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
    /** @type {Vec3} */
    const p = [u[0] * Math.cos(t) + w[0] * Math.sin(t), u[1] * Math.cos(t) + w[1] * Math.sin(t), u[2] * Math.cos(t) + w[2] * Math.sin(t)];
    const q = project(p);
    pts.push(`${f(q.x)},${f(q.y)}`);
  }
  return 'M ' + pts.join(' L ');
}

/** Kleinkreis um die Achse ax (Einheitsvektor) mit Öffnungswinkel rho, nur obere Halbkugel. @param {Vec3} ax @param {Bogenmass} rho */
function smallCirclePath(ax, rho) {
  ax = normalize(ax);
  const u = normalize(Math.abs(ax[2]) < 0.9 ? cross(ax, [0, 0, 1]) : cross(ax, [1, 0, 0]));
  const w = cross(ax, u);
  /** @type {string[][]} */
  const segs = [];
  /** @type {string[]} */
  let cur = [];
  const N = 180;
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const p = /** @type {Vec3} */ ([0, 1, 2].map((k) => ax[k] * Math.cos(rho) + Math.sin(rho) * (u[k] * Math.cos(t) + w[k] * Math.sin(t))));
    if (p[2] >= -1e-9) { const q = project(p); cur.push(`${f(q.x)},${f(q.y)}`); }
    else if (cur.length) { segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs.map((s) => 'M ' + s.join(' L ')).join(' ');
}

/** Drehung um z (Projektionsrichtung). @param {Vec3} p @param {Grad} deg @returns {Vec3} */
const rotZ = (p, deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
};

/** Wulffsches Netz (Grosskreise durch die Pole N/S oben/unten, Kleinkreise) gedreht um rot Grad. @param {Grad} rot @param {Farben} col */
function wulffNet(rot, col) {
  let main = '', fine = '';
  for (let deg = 2; deg < 180; deg += 2) {
    if (deg === 90) continue;
    const psi = /** @type {Bogenmass} */ ((deg * Math.PI) / 180);
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

/**
 * Text mit Querstrichen über einzelnen Teilen. Die Striche werden als eigene Rechtecke knapp über
 * den Ziffern gezeichnet (text-decoration: overline sitzt auf Höhe der Oberlänge, deutlich zu hoch).
 * Breiten nach IBM Plex Sans (Ziffern tabellarisch 0,6 em); o = { fs, anchor, italic, fill }.
 */
/** @type {Record<string, number>} */
const GLYPH_W = { ' ': 0.236, '[': 0.32, ']': 0.32, '(': 0.335, ')': 0.335, '{': 0.33, '}': 0.33 };
/** @param {string} ch */
const glyphW = (ch) => GLYPH_W[ch] ?? 0.6;
/**
 * @param {Teil[]} parts @param {number} x @param {number} y @param {string} attrs SVG-Attribute des Texts
 * @param {{ fs: number, anchor?: string, italic?: boolean, fill: string }} o
 */
function textWithBars(parts, x, y, attrs, o) {
  const ts = parts.map((p) => `<tspan>${p.t}</tspan>`).join('');
  let out = `<text x="${f(x)}" y="${f(y)}" ${attrs}>${ts}</text>`;
  if (!parts.some((p) => p.bar)) return out;
  const fs = o.fs;
  const widths = parts.map((p) => [...p.t].reduce((s, ch) => s + glyphW(ch), 0) * fs);
  const total = widths.reduce((s, w) => s + w, 0);
  let x0 = o.anchor === 'middle' ? x - total / 2 : o.anchor === 'end' ? x - total : x;
  const slant = o.italic ? 0.13 * fs : 0;
  const h = Math.max(1, 0.075 * fs);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].bar) {
      const inset = 0.09 * fs;
      out += `<rect x="${f(x0 + inset + slant)}" y="${f(y - 0.82 * fs - h)}" width="${f(widths[i] - 2 * inset)}" height="${f(h)}" fill="${o.fill}"/>`;
    }
    x0 += widths[i];
  }
  return out;
}

/**
 * Baut das komplette SVG.
 * scene = {
 *   col: Farben {paper, ink, muted, net, mirror, axis, upper, lower, accent, accent2},
 *   wulff: {on, rot}, primitiveBold, mirrors:[n], axes:[{dir, symbol, centre}], centreAtOrigin,
 *   poles:[{p, label(parts)|null, det, idx, gen, selected, faint}], colorByDet, showLower,
 *   axisLabels:[{name, dir}], fontFamily,
 *   poleScale (Grösse der Polsymbole, Standard 1; das Quiz vergrössert sie in kleinen Bildern),
 *   zoneList:[{axis, color, label, axisMark}] (axisMark: false ohne × am Zonenpol)
 * }
 * @param {Szene} scene
 * @param {{ standalone?: boolean }} [optionen]
 */
export function buildSVG(scene, { standalone = false } = {}) {
  const col = scene.col;
  const out = [];
  const font = scene.fontFamily || 'Helvetica, Arial, sans-serif';
  out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="${col.paper}"/>`);
  if (scene.wulff?.on) out.push(wulffNet(/** @type {Grad} */ (scene.wulff.rot || 0), col));

  // Symmetriegerüst in eigener Gruppe; scene.faint: gedämpft (unter Flächenpolen im Polyedermodus)
  const fc = scene.faint ? { ...col, ink: col.muted, mirror: col.muted, axis: col.muted } : col;
  /** @type {string[]} */
  const fw = [];
  // Dünne Linien (ITA): liegende Symmetrieachsen als Durchmesser, im kubischen System
  // zusätzlich die Zonen {100} und {110}, soweit sie keine Spiegelebenen sind.
  // Farben je Element (Blickrichtung) optional: axis.color, mirror {n, color}; sonst Tinte
  /** @type {Map<string, string>} */
  const byColor = new Map();
  /** @param {string} color @param {string} d */
  const addPath = (color, d) => byColor.set(color, (byColor.get(color) || '') + d + ' ');
  for (const ax of scene.axes || []) {
    if (Math.abs(ax.dir[2]) >= 1e-6) continue;
    const a = project(ax.dir), b = project(scale(ax.dir, -1));
    addPath(ax.color || fc.ink, `M ${f(a.x)},${f(a.y)} L ${f(b.x)},${f(b.y)}`);
  }
  for (const n of scene.zones || []) {
    const p = greatCirclePath(n);
    if (p) addPath(fc.ink, p);
  }
  for (const [color, d] of byColor) fw.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${scene.faint ? 0.9 : 1.1}"/>`);

  // Spiegelebenen (nach Farbe gruppiert)
  /** @type {Map<string, string>} */
  const mirrBy = new Map();
  for (const m of scene.mirrors || []) {
    const n = Array.isArray(m) ? m : m.n;
    const color = (!Array.isArray(m) && m.color) || fc.mirror;
    const p = greatCirclePath(n);
    if (p) mirrBy.set(color, (mirrBy.get(color) || '') + p + ' ');
  }
  for (const [color, d] of mirrBy) fw.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${scene.faint ? 2 : 2.8}" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (scene.primitiveBold) fw.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${scene.primitiveColor || fc.mirror}" stroke-width="${scene.faint ? 2 : 2.8}"/>`);
  out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${col.ink}" stroke-width="1.2"/>`);
  const centreTaken = scene.centreAtOrigin || (scene.axes || []).some((a) => Math.abs(a.dir[2]) > 1 - 1e-6);
  if (!centreTaken) out.push(`<g stroke="${col.ink}" stroke-width="1"><line x1="${C - 5}" y1="${C}" x2="${C + 5}" y2="${C}"/><line x1="${C}" y1="${C - 5}" x2="${C}" y2="${C + 5}"/></g>`);

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
  /** @type {{ ax: NonNullable<Szene['axes']>[number], q: Bildpunkt, ang: number, centre: boolean }[]} */
  const placed = [];
  for (const ax of scene.axes || []) {
    const inPlane = Math.abs(ax.dir[2]) < 1e-6;
    const alongZ = Math.abs(ax.dir[2]) > 1 - 1e-6;
    for (const d of inPlane ? [ax.dir, scale(ax.dir, -1)] : [ax.dir]) {
      const q = project(d);
      const ang = symbolAngle(ax.symbol, q, alongZ);
      placed.push({ ax, q, ang, centre: ax.centre && alongZ });
    }
  }
  /** @param {{ q: Bildpunkt, ang: number }} P */
  const tr = (P) => `translate(${f(P.q.x)},${f(P.q.y)}) rotate(${f(P.ang)})${scene.faint ? ' scale(0.8)' : ''}`;
  for (const P of placed) fw.push(`<g transform="${tr(P)}">${axisSymbolSVG(P.ax.symbol, false, fc, true)}</g>`);
  for (const P of placed) fw.push(`<g transform="${tr(P)}">${axisSymbolSVG(P.ax.symbol, P.centre, P.ax.color ? { ...fc, axis: P.ax.color } : fc)}</g>`);
  if (scene.centreAtOrigin) fw.push(`<circle cx="${C}" cy="${C}" r="${f(SYM * 0.38)}" fill="${col.paper}" stroke="${fc.axis}" stroke-width="1.4"/>`);
  if (fw.length) out.push(`<g${scene.faint ? ' opacity="0.55"' : ''}>${fw.join('')}</g>`);

  // Zonen: Zonenkreis (Grosskreis ⊥ Zonenachse) und Pol der Zonenachse, je Zone in ihrer Farbe
  const zoneList = scene.zoneList || (scene.zone ? [{ ...scene.zone, color: col.accent }] : []);
  for (const z of zoneList) {
    const zcol = z.color || col.accent;
    const zc = greatCirclePath(z.axis);
    if (zc) {
      // untere Hälfte des Zonenkreises (Projektion vom Nordpol): gespiegelter Bogen, gestrichelt
      const a = z.axis;
      const zl = scene.showLower !== false ? greatCirclePath([a[0], a[1], -a[2]]) : null;
      if (zl && Math.abs(a[2]) > 1e-6) out.push(`<path d="${zl}" fill="none" stroke="${zcol}" stroke-width="1.6" stroke-dasharray="6 5" stroke-linecap="round"/>`);
      out.push(`<path d="${zc}" fill="none" stroke="${zcol}" stroke-width="2.2" stroke-linecap="round"/>`);
    }
    else out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${zcol}" stroke-width="2.6"/>`);
    const q = project(z.axis);
    const s = 6;
    if (z.axisMark !== false) out.push(`<g stroke="${zcol}" stroke-width="2.2" stroke-linecap="round"><line x1="${f(q.x - s)}" y1="${f(q.y - s)}" x2="${f(q.x + s)}" y2="${f(q.y + s)}"/><line x1="${f(q.x - s)}" y1="${f(q.y + s)}" x2="${f(q.x + s)}" y2="${f(q.y - s)}"/></g>`);
    if (z.label) out.push(textWithBars(z.label, q.x + 10, q.y + 18, `font-family="${font}" font-size="13.5" font-weight="600" fill="${zcol}" paint-order="stroke" stroke="${col.paper}" stroke-width="3" stroke-linejoin="round"`, { fs: 13.5, anchor: 'start', fill: zcol }));
  }

  // Winkel: Grosskreisbogen zwischen zwei Polen; Abschnitte auf der unteren Halbkugel gestrichelt
  if (scene.arc) {
    const pts = arcPoints(scene.arc.a, scene.arc.b, 120);
    /** @type {Bildpunkt[]} */
    let run = [];
    /** @type {boolean | null} */
    let up = null;
    const flush = () => {
      if (run.length > 1) out.push(`<path d="M ${run.map((q) => `${f(q.x)},${f(q.y)}`).join(' L ')}" fill="none" stroke="${col.accent}" stroke-width="${up ? 3.2 : 2}" stroke-linecap="round"${up ? '' : ' stroke-dasharray="6 5"'}/>`);
    };
    for (const p of pts) {
      const q = project(p);
      if (up !== null && q.upper !== up) { flush(); run = [run[run.length - 1]]; }
      up = q.upper; run.push(q);
    }
    flush();
    // Beschriftung am Bogenmittelpunkt, nach aussen versetzt
    const m = project(pts[Math.floor(pts.length / 2)]);
    let dx = m.x - C, dy = m.y - C;
    const l = Math.hypot(dx, dy);
    if (l < 1) { dx = 0; dy = -1; } else { dx /= l; dy /= l; }
    const fs = (scene.labelSize || 14.5) * 1.05;
    out.push(`<text x="${f(m.x + dx * 14)}" y="${f(m.y + dy * 14 + fs * 0.35)}" font-family="${font}" font-size="${f(fs)}" font-weight="600" fill="${col.accent}" text-anchor="${dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle'}" paint-order="stroke" stroke="${col.paper}" stroke-width="4" stroke-linejoin="round">${scene.arc.label}</text>`);
  }

  // Pole
  const poles = (scene.poles || []).map((P) => ({ ...P, q: project(P.p) }));
  /** @type {(ScenePol & { q: Bildpunkt })[]} */
  const drawn = [];
  // Hof hinter ausgewählten Polen (deutlicher Kontrast zur übrigen Projektion)
  for (const P of poles) {
    if (P.selected && (P.q.upper || scene.showLower)) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="15" fill="${col.accent}" opacity="0.18"/>`);
  }
  for (const P of poles) {
    if (!P.q.upper && !scene.showLower) continue;
    const cU = P.selected ? col.accent : P.color || (scene.colorByDet ? ((P.det ?? 0) > 0 ? col.upper : col.accent2) : col.ink);
    const op = P.faint ? ' opacity="0.45"' : '';
    const ps = scene.poleScale || 1;
    if (P.q.upper) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="${f(4.2 * ps)}" fill="${cU}"${op}/>`);
    else out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="${f(6.2 * ps)}" fill="none" stroke="${cU}" stroke-width="${f(1.6 * ps)}"${op}/>`);
    drawn.push(P);
  }
  // Markierungen (Auswahl, Ausgangspunkt)
  for (const P of drawn) {
    if (P.gen) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="11" fill="none" stroke="${col.accent}" stroke-width="2" stroke-dasharray="3 2.5"/>`);
    // Pol in einer oder mehreren Zonen: je Zone ein Ring in ihrer Farbe (Schnittpunkte von Zonenkreisen fallen auf)
    const zc = P.zoneColors || (P.zone ? [col.accent] : []);
    zc.forEach((c, k) => out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="${f(9.5 + 2.6 * k)}" fill="none" stroke="${c}" stroke-width="2"/>`));
    if (P.selected) out.push(`<circle cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="${f(Math.max(12.5, 10.5 + 2.6 * zc.length))}" fill="none" stroke="${col.accent}" stroke-width="3"/>`);
  }
  // Beschriftungen: zusammenfallende Pole (oben/unten) werden gestapelt beschriftet
  /** @type {{ x: number, y: number, items: (ScenePol & { q: Bildpunkt })[] }[]} */
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
    const fs = scene.labelSize || 14.5;
    const off = fs * 1.1;
    const lh = fs * 1.1;
    const anchor = dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
    let by = cl.y + dy * off + fs * 0.31;
    if (dy < -0.35) by -= (cl.items.length - 1) * lh;
    else if (Math.abs(dy) <= 0.35) by -= ((cl.items.length - 1) * lh) / 2;
    cl.items.forEach((P, k) => {
      const fill = P.selected ? col.accent : P.aux ? col.muted : P.q.upper ? col.ink : col.muted;
      out.push(textWithBars(/** @type {Teil[]} */ (P.label), cl.x + dx * off, by + k * lh, `font-family="${font}" font-size="${f(fs)}" fill="${fill}"${P.selected ? ' font-weight="600"' : ''} text-anchor="${anchor}" paint-order="stroke" stroke="${col.paper}" stroke-width="3" stroke-linejoin="round"${P.q.upper ? '' : ' font-style="italic"'}`, { fs, anchor, italic: !P.q.upper, fill }));
    });
  }
  // Treffer-Flächen für Klick/Tippen
  if (!standalone) {
    for (const P of drawn) {
      out.push(`<circle class="hit" data-idx="${P.idx}" data-upper="${P.q.upper ? 1 : 0}" cx="${f(P.q.x)}" cy="${f(P.q.y)}" r="${f(scene.hitR || 13)}" fill="transparent"/>`);
    }
  }
  const inner = out.join('\n');
  const vb = `0 0 ${SIZE} ${SIZE}`;
  return {
    inner,
    full: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${SIZE}" height="${SIZE}">${standalone && scene.bg ? `<rect width="100%" height="100%" fill="${scene.bg}"/>` : ''}${inner}</svg>`,
  };
}
