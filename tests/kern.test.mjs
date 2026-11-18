// Rechenkern symcrys (lib/kern/, js/kern.js) gegen den bisherigen Code (js/pointgroups.js): gleiche Ergebnisse für alle
// 40 Einträge, bevor der alte Code fällt (crystallography-common#99). Verglichen werden Mengen; die Reihenfolge der
// Operationen folgt in symcrys ITA (Thomas, 18.11.2026) und ist deshalb nicht Teil des Vergleichs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POINT_GROUPS, buildPointGroup, symmetryDirections } from '../js/pointgroups.js';
import { kernOperationen, kernElemente } from '../js/kern.js';

/** @import { Vec3, Mat3 } from '../lib/common/js/typen.js' */

/** @param {Mat3} a @param {Mat3} b */
const gleicheMatrix = (a, b) => a.every((r, i) => r.every((x, j) => Math.abs(x - b[i][j]) < 1e-9));
/** Gleiche Gerade (Vorzeichen frei). @param {Vec3} a @param {Vec3} b */
const parallel = (a, b) => Math.abs(Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) - 1) < 1e-9;
/**
 * Zwei Listen enthalten dieselben Elemente, jedes genau einmal zugeordnet.
 * @template T @param {T[]} a @param {T[]} b @param {(x: T, y: T) => boolean} gleich
 */
function gleicheMenge(a, b, gleich) {
  if (a.length !== b.length) return false;
  const frei = b.slice();
  return a.every((x) => {
    const i = frei.findIndex((y) => gleich(x, y));
    if (i < 0) return false;
    frei.splice(i, 1);
    return true;
  });
}

for (const g of POINT_GROUPS) {
  test(`${g.id}: symcrys gibt dieselben Operationen, Eigenschaften und Elemente wie bisher`, () => {
    const alt = buildPointGroup(g.id);
    const neu = kernElemente(g.id);
    assert.ok(gleicheMenge(alt.ops, kernOperationen(g.id), gleicheMatrix), 'Operationen');
    assert.deepEqual([neu.centro, neu.chiral, neu.polar], [alt.centro, alt.chiral, alt.polar]);
    assert.deepEqual([neu.full, neu.sf, neu.laue], [g.full, g.sf, g.laue]);
    /** @param {{ dir: Vec3, symbol: string, centre: boolean, mirrorPerp: boolean }} x @param {typeof x} y */
    const gleicheAchse = (x, y) => parallel(x.dir, y.dir) && x.symbol === y.symbol && x.centre === y.centre && x.mirrorPerp === y.mirrorPerp;
    assert.ok(gleicheMenge(alt.axes, neu.axes, gleicheAchse), 'Achsen');
    assert.ok(gleicheMenge(alt.mirrors, neu.mirrors, parallel), 'Spiegelebenen');

    // Blickrichtungen: je Position dieselben Richtungen, dasselbe Symbol, dieselben Elemente
    const klassen = symmetryDirections(alt);
    assert.equal(neu.klassen.length, klassen.length);
    klassen.forEach((k, i) => {
      const n = neu.klassen[i];
      assert.equal(n.hm, k.hm, `Position ${i + 1}: Symbol`);
      assert.ok(gleicheMenge(k.dirs, n.dirs, parallel), `Position ${i + 1}: Richtungen`);
      assert.ok(gleicheMenge(k.axes, n.axes, gleicheAchse), `Position ${i + 1}: Achsen`);
      assert.ok(gleicheMenge(k.mirrors, n.mirrors, parallel), `Position ${i + 1}: Spiegelebenen`);
    });
  });
}
