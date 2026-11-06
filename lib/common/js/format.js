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

/** HM-Symbol als HTML (Querstrich via CSS-Klasse .ov). @param {string} sym */
export const hmHTML = (sym) =>
  hmParts(sym).map((p) => (p.bar ? `<span class="ov">${esc(p.t)}</span>` : esc(p.t))).join('');

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
 * (hkl) als HTML; br: Klammern, z. B. ['[', ']'] für eine Richtung.
 * @param {Vec3} hkl
 * @param {boolean} [hex]
 * @param {[string, string]} [br]
 */
export function hklHTML(hkl, hex, br = ['(', ')']) {
  return br[0] + hklParts(hkl, hex).map((p) => (p.bar ? `<span class="ov">${p.t}</span>` : p.t)).join('') + br[1];
}
