// Rechenkern symcrys (lib/kern/, js/kern.js) gegen den bisherigen Code (js/pointgroups.js): gleiche Ergebnisse für alle
// 40 Einträge, bevor der alte Code fällt (crystallography-common#99). Verglichen werden Mengen; die Reihenfolge der
// Operationen folgt in symcrys ITA (Thomas, 18.11.2026) und ist deshalb nicht Teil des Vergleichs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEX_A, HEX_B, POINT_GROUPS, buildPointGroup, latticeToCart, symmetryDirections } from '../js/pointgroups.js';
import { drehungHexagonal, kernAufstellung, kernElemente, kernOperationen } from '../js/kern.js';

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
    // Rahmen mit Vorzeichen: jede Richtung aus symcrys, in den Rahmen der App gedreht, ist [uvw] mit der Gitterbasis der App
    const zuKart = latticeToCart(g.hex ? 'hexagonal' : 'andere');
    neu.klassen.forEach((k) => k.gitter.forEach((uvw, j) => {
      const v = zuKart(uvw);
      const n = Math.hypot(...v);
      assert.ok(k.dirs[j].every((x, i) => Math.abs(x - v[i] / n) < 1e-9), `[${uvw}] im Rahmen der App`);
    }));

    // Blickrichtungen: je Position dieselben Richtungen, dasselbe Symbol, dieselben Elemente
    const klassen = symmetryDirections(alt);
    // symmetryDirections() des bisherigen Codes setzt dabei alt.mirrorCls
    /** @param {{ m: Vec3, k: number }} x @param {typeof x} y */
    const gleicherSpiegel = (x, y) => parallel(x.m, y.m) && x.k === y.k;
    const paare = (/** @type {Vec3[]} */ ms, /** @type {number[]} */ ks) => ms.map((m, i) => ({ m, k: ks[i] }));
    assert.ok(gleicheMenge(paare(alt.mirrors, alt.mirrorCls ?? []), paare(neu.mirrors, neu.mirrorCls), gleicherSpiegel), 'Spiegelebenen je Position');

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

test('Rahmen: die Drehung aus symcrys in die App ist eine Drehung um z (orthogonal, det = 1, c fest)', () => {
  const r = drehungHexagonal();
  const rrt = r.map((z) => [0, 1, 2].map((j) => z[0] * r[j][0] + z[1] * r[j][1] + z[2] * r[j][2]));
  assert.ok(rrt.every((z, i) => z.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-12)), 'R·Rᵀ = 1');
  const det = r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1]) - r[0][1] * (r[1][0] * r[2][2] - r[1][2] * r[2][0])
    + r[0][2] * (r[1][0] * r[2][1] - r[1][1] * r[2][0]);
  assert.ok(Math.abs(det - 1) < 1e-12, 'det R = 1');
  assert.deepEqual(r[2], [0, 0, 1]);
});

test('Rahmen gegen ITA: in P321 führt (2) 3⁺ a in b über, (5) 2 x,0,0 hält a fest (ITA 5. Aufl., S. 506)', () => {
  // ITA: (2) -y, x-y, z bildet a = [100] auf [010] = b ab; (5) x-y, -y, -z hält [100] fest. Im Rahmen der App
  // sind a und b HEX_A und HEX_B.
  const ops = kernOperationen('321');
  /** @param {Mat3} m @param {Vec3} v */
  const mal = (m, v) => m.map((z) => z[0] * v[0] + z[1] * v[1] + z[2] * v[2]);
  /** @param {number[]} a @param {readonly number[]} b */
  const gleich = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
  assert.ok(gleich(mal(ops[1], HEX_A), HEX_B), '(2) a → b');
  assert.ok(gleich(mal(ops[4], HEX_A), HEX_A), '(5) a fest');
});

test('kernAufstellung: unbekannte Kennungen ergeben einen Fehler', () => {
  for (const id of ['2a', 'xyz', 'R3', '5']) assert.throws(() => kernAufstellung(id), /fehlt in symcrys/);
});
