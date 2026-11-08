// Formatierung von Hermann-Mauguin-Symbolen und Millerschen Indizes.
// Negative Zahlen bzw. Drehinversionen werden mit Querstrich dargestellt.

/** @import { Vec3 } from './typen.js' */

/** Ein Zeichen und ob es einen Querstrich trägt. @typedef {{ t: string, bar: boolean }} Teil */

/**
 * Zerlegt ein HM-Symbol ('-' vor einem Zeichen = Querstrich) in Teile [{t, bar}].
 * @param {string} sym
 * @returns {Teil[]}
 */
export function hmParts(sym) {
  /** @type {Teil[]} */
  const parts = [];
  for (let i = 0; i < sym.length; i++) {
    if (sym[i] === '-' && i + 1 < sym.length) { parts.push({ t: sym[i + 1], bar: true }); i++; }
    else parts.push({ t: sym[i], bar: false });
  }
  return parts;
}

/** @type {Record<string, string>} */
const ENTITAET = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/**
 * Text für HTML maskieren, für Inhalt und Attributwerte (in "…" und '…'). Text, der nicht aus den Daten
 * der App stammt, kommt nur so oder über textContent in die Seite (Leitfaden Abschn. 9). Kein Schutz für
 * Adressen (href, src, z. B. javascript:), on…-Attribute und style.
 * @param {unknown} s
 */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENTITAET[c]);

/**
 * Ansagetext eines HM-Symbols für Screenreader (#82, Leitfaden Abschn. 4): Zeichen einzeln mit Komma, Querstrich als
 * „quer“, Bruchstrich als „über“, Punkt (orientiertes Symbol) als „Punkt“; Leerzeichen trennen nur. So wird 222 nicht
 * als Zahl gelesen. Beispiele: -42m → „4 quer, 2, m“; 4/mmm → „4 über m, m, m“; ..m → „Punkt, Punkt, m“.
 * @param {string} sym
 */
export function hmLabel(sym) {
  let out = '';
  let bindend = true; // nach Anfang oder „über“: ohne Komma anschliessen
  for (const p of hmParts(sym)) {
    if (p.t === ' ') continue;
    if (p.t === '/' && !p.bar) { out += ' über '; bindend = true; continue; }
    const wort = p.t === '.' ? 'Punkt' : p.bar ? `${p.t} quer` : p.t;
    out += (bindend ? '' : ', ') + wort;
    bindend = false;
  }
  return out;
}

/**
 * Sichtbares Symbol als Grafik mit Ansagetext (role="img", #82). Innen steht nur Darstellung (Querstriche über .ov).
 * @param {string} innen HTML @param {string} label Klartext
 */
const symbolHTML = (innen, label) => `<span role="img" aria-label="${esc(label)}">${innen}</span>`;

/**
 * HM-Symbol als HTML (Querstrich via CSS-Klasse .ov), für Screenreader mit Ansagetext aus `hmLabel`; leeres Symbol:
 * leere Zeichenkette (keine Grafik ohne Namen).
 * @param {string} sym
 */
export const hmHTML = (sym) => (sym === '' ? '' :
  symbolHTML(hmParts(sym).map((p) => (p.bar ? `<span class="ov">${esc(p.t)}</span>` : esc(p.t))).join(''), hmLabel(sym)));

/** HM-Symbol als Klartext mit kombinierendem Überstrich (für <option>). @param {string} sym */
export const hmText = (sym) => hmParts(sym).map((p) => (p.bar ? p.t + '̅' : p.t)).join('');

/**
 * Indizes; bei hexagonalen Achsen Miller-Bravais (hkil).
 * @param {Vec3} hkl
 * @param {boolean} [hex]
 * @returns {number[]}
 */
export function indices(hkl, hex) {
  const [h, k, l] = hkl;
  return hex ? [h, k, -(h + k), l] : [h, k, l];
}

/**
 * Indizes als Teile [{t, bar}] für SVG.
 * @param {Vec3} hkl
 * @param {boolean} [hex]
 * @returns {Teil[]}
 */
export function hklParts(hkl, hex) {
  const idx = indices(hkl, hex);
  const big = idx.some((x) => Math.abs(x) > 9);
  /** @type {Teil[]} */
  const out = [];
  idx.forEach((x, i) => {
    if (big && i > 0) out.push({ t: ' ', bar: false });
    out.push({ t: String(Math.abs(x)), bar: x < 0 });
  });
  return out;
}

/**
 * Ansagetext von Indizes für Screenreader (#82): einzeln mit Komma, negative als „quer“, ohne Klammern (Entscheidung
 * Thomas, 8.11.2026: die Art ergibt sich aus dem Satz). Beispiel: (1̄10) → „1 quer, 1, 0“.
 * @param {Vec3} hkl
 * @param {boolean} [hex]
 */
export const hklLabel = (hkl, hex) =>
  indices(hkl, hex).map((x) => (x < 0 ? `${Math.abs(x)} quer` : String(x))).join(', ');

/**
 * (hkl) als HTML; br: Klammern, z. B. ['[', ']'] für eine Richtung. Die Ziffern stehen als Grafik mit Ansagetext aus
 * `hklLabel` (#82); die Klammern bleiben Text.
 * @param {Vec3} hkl
 * @param {boolean} [hex]
 * @param {[string, string]} [br]
 */
export function hklHTML(hkl, hex, br = ['(', ')']) {
  return br[0] + symbolHTML(hklParts(hkl, hex).map((p) => (p.bar ? `<span class="ov">${p.t}</span>` : p.t)).join(''), hklLabel(hkl, hex)) + br[1];
}
