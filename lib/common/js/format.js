// Formatierung von Hermann-Mauguin-Symbolen und Millerschen Indizes.
// Negative Zahlen bzw. Drehinversionen werden mit Querstrich dargestellt.

/** Zerlegt ein HM-Symbol ('-' vor einem Zeichen = Querstrich) in Teile [{t, bar}]. */
export function hmParts(sym) {
  const parts = [];
  for (let i = 0; i < sym.length; i++) {
    if (sym[i] === '-' && i + 1 < sym.length) { parts.push({ t: sym[i + 1], bar: true }); i++; }
    else parts.push({ t: sym[i], bar: false });
  }
  return parts;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** HM-Symbol als HTML (Querstrich via CSS-Klasse .ov). */
export const hmHTML = (sym) =>
  hmParts(sym).map((p) => (p.bar ? `<span class="ov">${esc(p.t)}</span>` : esc(p.t))).join('');

/** HM-Symbol als Klartext mit kombinierendem Überstrich (für <option>). */
export const hmText = (sym) => hmParts(sym).map((p) => (p.bar ? p.t + '̅' : p.t)).join('');

/** Indizes; bei hexagonalen Achsen Miller-Bravais (hkil). */
export function indices(hkl, hex) {
  const [h, k, l] = hkl;
  return hex ? [h, k, -(h + k), l] : [h, k, l];
}

/** Indizes als Teile [{t, bar}] für SVG. */
export function hklParts(hkl, hex) {
  const idx = indices(hkl, hex);
  const big = idx.some((x) => Math.abs(x) > 9);
  const out = [];
  idx.forEach((x, i) => {
    if (big && i > 0) out.push({ t: ' ', bar: false });
    out.push({ t: String(Math.abs(x)), bar: x < 0 });
  });
  return out;
}

/** (hkl) als HTML. */
export function hklHTML(hkl, hex, br = ['(', ')']) {
  return br[0] + hklParts(hkl, hex).map((p) => (p.bar ? `<span class="ov">${p.t}</span>` : p.t)).join('') + br[1];
}
