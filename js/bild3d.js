// Feste räumliche Zeichnungen für Quiz und Moodle-Export: Kristall (Polyeder) und Symmetriegerüst einer
// Punktgruppe als SVG, ohne WebGL. Parallelprojektion aus einer festen Richtung wie in Lehrbuchzeichnungen:
// x zeigt zum Betrachter, y nach rechts, leicht von oben (x, y, z wie im Stereogramm: x nach unten, y nach rechts).
// In der Grundlage rechtwinkliger Systeme ist x ∥ a, hexagonal x ∥ a* (a₁ liegt 30° daneben); in anderen Lagen
// zeigt die Richtung, die im Stereogramm unten liegt, zum Betrachter. Die Projektionsrichtung (z) steht senkrecht.
//
// Bildangabe im Quiz: "3d" + Link-Adresse der App, z. B. "3d#m=form&sys=kubisch&f=m-3m:a34&lage=111".

import { stateForHash, polyCrystal, mixHex } from './scene.js';
import { buildPointGroup } from './pointgroups.js';
import { axisSymbolSVG } from './stereogram.js';
import { cross, normalize, dot } from './linalg.js';

/**
 * Richtung zur Kamera: um 18,4° (tan = 1/3) aus a herausgedreht, 25° von oben. Nicht die Standardansicht der
 * 3D-Ansicht (OBLIQUE in view3d.js): Diese liegt nur 15° neben [111], ein Tetraeder zeigte dort eine einzige Fläche.
 */
export const BLICK = [3, -1, 1.5];
const SIZE = 520, M = SIZE / 2;
const f = (x) => (Math.round(x * 100) / 100).toString();

/** Bildangabe einer räumlichen Zeichnung? */
export const istRaum = (spec) => typeof spec === 'string' && spec.startsWith('3d#');
/** Link-Adresse der App zu einer Bildangabe (räumlich oder Stereogramm). */
export const appHash = (spec) => (istRaum(spec) ? spec.slice(2).replace(/&blick=[^&]*/, '') : spec);
/**
 * Anderer Blickwinkel aus der Bildangabe: "&blick=45,30" heisst 45° von oben, 30° aus a herausgedreht. Für Körper,
 * deren Zähligkeit um die Projektionsrichtung sonst nicht zu erkennen wäre (Rhombendodekaeder mit [111] senkrecht).
 */
function blickAus(spec) {
  const m = /&blick=([\d.]+),([\d.]+)/.exec(spec);
  if (!m) return undefined;
  const R = Math.PI / 180, h = Number(m[1]) * R, d = Number(m[2]) * R;
  return [Math.cos(h) * Math.cos(d), -Math.cos(h) * Math.sin(d), Math.sin(h)];
}

/** Parallelprojektion: Bildschirmachsen rechts (r), oben (u) und Tiefe zur Kamera (d). */
function kamera(blick = BLICK) {
  const d = normalize(blick);
  const r = normalize(cross([-d[0], -d[1], -d[2]], [0, 0, 1]));
  const u = cross(r, [-d[0], -d[1], -d[2]]);
  return { d, r, u };
}

function projektor(k, s) {
  return (p) => ({ x: M + s * dot(p, k.r), y: M - s * dot(p, k.u), z: dot(p, k.d) });
}

const pfad = (pts) => 'M ' + pts.map((q) => `${f(q.x)},${f(q.y)}`).join(' L ');

/** Pfeil von oben nach unten (Blickrichtung des Stereogramms) zwischen zwei Bildpunkten. */
function pfeil(a, b, col, w = 1.6) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l, h = 11, br = 5;
  const tip = `${f(b.x)},${f(b.y)} ${f(b.x - ux * h - uy * br)},${f(b.y - uy * h + ux * br)} ${f(b.x - ux * h + uy * br)},${f(b.y - uy * h - ux * br)}`;
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x - ux * h * 0.6)}" y2="${f(b.y - uy * h * 0.6)}" stroke="${col.muted}" stroke-width="${w}"/>`
    + `<polygon points="${tip}" fill="${col.muted}"/>`;
}

/** Kreis in der Ebene ⊥ n mit Radius rho als Bildpunkte, in vordere und hintere Hälfte geteilt. */
function ring(n, rho, P, N = 120) {
  n = normalize(n);
  const a = normalize(cross(n, Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const b = cross(n, a);
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    pts.push(P([rho * (a[0] * Math.cos(t) + b[0] * Math.sin(t)), rho * (a[1] * Math.cos(t) + b[1] * Math.sin(t)), rho * (a[2] * Math.cos(t) + b[2] * Math.sin(t))]));
  }
  // zusammenhängende Stücke gleicher Seite (vorn: zur Kamera)
  const stuecke = [];
  for (let i = 0; i < N; i++) {
    const vorn = pts[i].z + pts[i + 1].z >= 0;
    const last = stuecke[stuecke.length - 1];
    if (last && last.vorn === vorn) last.pts.push(pts[i + 1]);
    else stuecke.push({ vorn, pts: [pts[i], pts[i + 1]] });
  }
  return { alle: pts, stuecke };
}

// ------------------------------------------------------------------ Kristall
/**
 * Kristall einer Link-Adresse als SVG (Inhalt eines viewBox 0 0 520 520).
 * opt: { ebene: true } Projektionsebene (Ring) und Blickpfeil; { blick } andere Kamerarichtung.
 */
export function koerperSVG(hash, col, opt = {}) {
  const st = stateForHash(hash);
  const C = polyCrystal(st, col);
  const k = kamera(opt.blick);
  const faces = C.faces.filter((x) => !x.hidden);
  const rmax = Math.max(...faces.flatMap((x) => x.verts.map((v) => Math.hypot(...v))));
  const P = projektor(k, 168 / rmax);
  // Licht von links oben vorn (in Bildschirmachsen)
  const L = normalize([0, 1, 2].map((i) => -0.35 * k.r[i] + 0.6 * k.u[i] + 0.75 * k.d[i]));
  const out = [];
  const ebene = opt.ebene !== false;
  const rho = 1.32 * rmax;
  let rg = null, oben = null, unten = null;
  if (ebene) {
    rg = ring([0, 0, 1], rho, P);
    // Austrittspunkte der z-Achse aus dem Kristall (konvex: kleinste Ebene in Richtung ±z)
    const austritt = (s) => Math.min(...faces.filter((x) => s * x.normal[2] > 1e-6).map((x) => dot(x.normal, x.verts[0]) / (s * x.normal[2])));
    oben = austritt(1); unten = austritt(-1);
    for (const s of rg.stuecke.filter((x) => !x.vorn)) out.push(`<path d="${pfad(s.pts)}" fill="none" stroke="${col.muted}" stroke-width="1.3" stroke-dasharray="5 4"/>`);
    if (Number.isFinite(unten)) {
      const a = P([0, 0, -unten]), b = P([0, 0, -1.55 * rmax]);
      out.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${col.muted}" stroke-width="1.3" stroke-dasharray="5 4"/>`);
    }
  }
  const flaeche = (x, hinten) => {
    const n = x.normal;
    const hell = 0.62 + 0.38 * Math.max(0, dot(n, L));
    const base = x.color3d || col.crystal;
    const fill = hinten ? mixHex(base, col.edge, 0.35) : mixHex(base, '#000000', 1 - hell);
    const pts = x.verts.map(P);
    return `<path d="${pfad(pts)} Z" fill="${fill}" stroke="${col.edge}" stroke-width="1.5" stroke-linejoin="round"/>`;
  };
  // konvexer Körper: alle Rückseiten liegen hinter allen Vorderseiten (Rückseiten nur bei offenen Formen sichtbar)
  if (faces.length < C.faces.length) for (const x of faces) if (dot(x.normal, k.d) <= 1e-9) out.push(flaeche(x, true));
  for (const x of faces) if (dot(x.normal, k.d) > 1e-9) out.push(flaeche(x, false));
  if (ebene) {
    for (const s of rg.stuecke.filter((x) => x.vorn)) out.push(`<path d="${pfad(s.pts)}" fill="none" stroke="${col.muted}" stroke-width="1.3"/>`);
    if (Number.isFinite(oben)) out.push(pfeil(P([0, 0, 1.62 * rmax]), P([0, 0, oben + 0.02 * rmax]), col));
  }
  return out.join('');
}

// ------------------------------------------------------------------ Symmetriegerüst
/** Drehwinkel (Grad) des Symbols am Achsenende: Linse quer zur Achse, Dreieck mit Spitze nach aussen. */
function symbolWinkel(symbol, dx, dy) {
  const w = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (symbol === '2') return w + 90;
  if (symbol === '3' || symbol === '-3') return w;
  return -90;
}

/**
 * Symmetriegerüst der Punktgruppe einer Link-Adresse (#m=pg&g=…) als SVG-Inhalt:
 * Umkugel, Spiegelebenen als Scheiben, Drehachsen mit Symbolen an beiden Enden, Inversionszentrum.
 * opt: { ebene: true } Äquatorebene (Ring) und Blickpfeil.
 */
export function geruestSVG(hash, col, opt = {}) {
  const st = stateForHash(hash);
  const info = buildPointGroup(st.pg.id);
  const k = kamera(opt.blick);
  const RS = 150;
  const P = projektor(k, RS);
  const out = [];
  const sym = (ax, s) => {
    const e = P(ax.dir.map((x) => x * 1.28 * s)), o = P([0, 0, 0]);
    const sc = opt.klein ? 0.95 : 0.68;
    return `<g transform="translate(${f(e.x)},${f(e.y)}) rotate(${f(symbolWinkel(ax.symbol, e.x - o.x, e.y - o.y))}) scale(${sc})">${axisSymbolSVG(ax.symbol, false, { ...col, axis: col.ink })}</g>`;
  };
  const achse = (ax, s) => {
    const a = P([0, 0, 0]), b = P(ax.dir.map((x) => x * 1.22 * s));
    return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${col.ink}" stroke-width="2.2" stroke-linecap="round"/>`;
  };
  // Umkugel
  out.push(`<circle cx="${M}" cy="${M}" r="${RS}" fill="${col.paper}" stroke="${col.muted}" stroke-width="1.2"/>`);
  const zSpiegel = info.mirrors.some((n) => Math.abs(n[2]) > 1 - 1e-6);
  const aeq = ring([0, 0, 1], 1, P);
  if (opt.ebene !== false && !zSpiegel) for (const s of aeq.stuecke.filter((x) => !x.vorn)) out.push(`<path d="${pfad(s.pts)}" fill="none" stroke="${col.muted}" stroke-width="1.1" stroke-dasharray="4 4"/>`);
  // Achsen: Hälfte und Symbol abgewandt (hinter den Scheiben) bzw. zur Kamera (davor)
  const ende = (ax, vorn) => (dot(ax.dir, k.d) >= 0 === vorn ? 1 : -1);
  for (const ax of info.axes) out.push(achse(ax, ende(ax, false)));
  for (const ax of info.axes) out.push(sym(ax, ende(ax, false)));
  // Spiegelebenen: Scheiben, Rand vorn kräftig, hinten schwächer
  const mc = col.mirror3d || col.mirror;
  for (const n of info.mirrors) {
    const rg = ring(n, 1, P);
    out.push(`<path d="${pfad(rg.alle)} Z" fill="${mc}" fill-opacity="0.13" stroke="none"/>`);
    for (const s of rg.stuecke) out.push(`<path d="${pfad(s.pts)}" fill="none" stroke="${mc}" stroke-width="${s.vorn ? 2 : 1.2}" stroke-opacity="${s.vorn ? 1 : 0.55}"/>`);
  }
  if (opt.ebene !== false && !zSpiegel) for (const s of aeq.stuecke.filter((x) => x.vorn)) out.push(`<path d="${pfad(s.pts)}" fill="none" stroke="${col.muted}" stroke-width="1.1" stroke-dasharray="4 4"/>`);
  for (const ax of info.axes) out.push(achse(ax, ende(ax, true)));
  if (info.centro) out.push(`<circle cx="${M}" cy="${M}" r="${opt.klein ? 9 : 6}" fill="${col.paper}" stroke="${col.ink}" stroke-width="1.8"/>`);
  for (const ax of info.axes) out.push(sym(ax, ende(ax, true)));
  // Blickpfeil in der Ecke oben links, frei von den Achsensymbolen (über der Kugel verdeckte er das Symbol der
  // Achse ∥ c, neben der Kugel wirkte er wie ein Teil einer liegenden Achse)
  if (opt.ebene !== false) out.push(pfeil({ x: 40, y: 22 }, { x: 40, y: 96 }, col));
  return out.join('');
}

/** Räumliche Zeichnung zu einer Bildangabe "3d#…" (Kristall oder Symmetriegerüst), Inhalt des viewBox. */
export function raumInner(spec, col, opt = {}) {
  const hash = appHash(spec);
  if (!opt.blick && blickAus(spec)) opt = { ...opt, blick: blickAus(spec) };
  const svg = stateForHash(hash).mode === 'pg' ? geruestSVG(hash, col, opt) : koerperSVG(hash, col, opt);
  // kleine Antwortbilder: Linien kräftiger, damit sie verkleinert lesbar bleiben
  return opt.klein ? svg.replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${f(w * 1.7)}"`).replace(/stroke-dasharray="([\d.]+) ([\d.]+)"/g, (m, a, b) => `stroke-dasharray="${f(a * 1.7)} ${f(b * 1.7)}"`) : svg;
}

/** Eigenständiges SVG (Moodle-Export). */
export function raumSVG(spec, col, opt = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${col.paper}"/>${raumInner(spec, col, opt)}</svg>`;
}
