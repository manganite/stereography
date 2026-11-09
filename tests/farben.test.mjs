// Kontraste von Farben, die die App selbst berechnet (#119, Leitfaden Abschn. 5.4): erzeugte Zonenfarben als Text
// (4,5 : 1) und das gedämpfte Symmetriegerüst unter den Polen als nötige Grafik (3 : 1), hell und dunkel. Die Formel
// steht hier unabhängig vom Code; die Farben kommen aus base.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { zoneColor } from '../js/scene.js';
import { GERUEST_GEDAEMPFT } from '../js/stereogram.js';

/** @import { Palette } from '../js/scene.js' */

const css = readFileSync(new URL('../lib/common/css/base.css', import.meta.url), 'utf8');
/** Variablen eines Blocks von base.css. @param {string} kopf */
function block(kopf) {
  const i = css.indexOf(kopf);
  assert.ok(i >= 0, kopf);
  const text = css.slice(i, css.indexOf('}', i));
  return Object.fromEntries([...text.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toLowerCase()]));
}
const MODI = { hell: block(':root, .theme-light {'), dunkel: block(':root[data-theme="dark"] {') };

/** @param {string} h */
const rgb = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
/** @param {string} h */
const lum = (h) => { const [r, g, b] = rgb(h).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** @param {string} a @param {string} b */
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** Farbe a mit Deckkraft t auf b. @param {string} a @param {string} b @param {number} t */
const auf = (a, b, t) => '#' + rgb(a).map((v, k) => Math.round((v * t + rgb(b)[k] * (1 - t)) * 255).toString(16).padStart(2, '0')).join('');

test('Erzeugte Zonenfarben: Text mit 4,5 : 1 auf dem Papier (#119)', () => {
  for (const [modus, v] of Object.entries(MODI)) {
    const col = /** @type {Palette} */ (/** @type {unknown} */ ({ paper: v.paper, form: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => v['fc' + i]) }));
    const farben = Array.from({ length: 40 }, (_, i) => zoneColor(col, i));
    for (const [i, c] of farben.entries()) assert.ok(ratio(c, v.paper) >= 4.5, `${modus}, Zone ${i + 1}: ${c} ${ratio(c, v.paper).toFixed(2)} : 1`);
  }
});

test('Gedämpftes Symmetriegerüst unter den Polen: 3 : 1 auf dem Papier (#119)', () => {
  for (const [modus, v] of Object.entries(MODI)) for (const k of ['muted', 'dir1', 'dir2', 'dir3']) {
    const c = auf(v[k], v.paper, GERUEST_GEDAEMPFT);
    assert.ok(ratio(c, v.paper) >= 3, `${modus}, --${k}: ${c} ${ratio(c, v.paper).toFixed(2)} : 1`);
  }
});
