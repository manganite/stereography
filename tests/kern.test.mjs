// Rechenkern symcrys (lib/kern/, js/kern.js) gegen eine unabhängige Herleitung: die Erzeugenden, mit denen die App bis
// v1.20 ihre Punktgruppen erzeugte, hier als Referenz, abgeschlossen und mit analyzeGroup (js/pointgroups.js)
// ausgewertet. Für alle 40 Einträge müssen symcrys bzw. buildPointGroup dieselben Operationen (als Menge),
// Eigenschaften, Achsen, Spiegelebenen und Blickrichtungen ergeben (crystallography-common#99). Die Reihenfolge der
// Operationen folgt in symcrys ITA (Thomas, 18.11.2026) und ist nicht Teil des Vergleichs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEX_A, HEX_B, POINT_GROUPS, analyzeGroup, buildPointGroup, latticeToCart, symmetryDirections,
} from '../js/pointgroups.js';
import { drehungHexagonal, kernAufstellung, kernElemente, kernGittersymmetrie, kernOperationen } from '../js/kern.js';
import { SYSTEM_OF } from '../js/polyhedra.js';
import { I3, add, inversion, matEq, mirror, mul, normalize, rot, rotInv, rotation, scale, transpose } from '../js/linalg.js';

/** @import { Vec3, Mat3 } from '../lib/common/js/typen.js' */

/** @type {Vec3} */ const X = [1, 0, 0];
/** @type {Vec3} */ const Y = [0, 1, 0];
/** @type {Vec3} */ const Z = [0, 0, 1];
/** @type {Vec3} */ const D111 = [1, 1, 1];
const HEX_A_MINUS_B = normalize(add(HEX_A, scale(HEX_B, -1))); // [1-10]
const inv = inversion;
/** Erzeugende je Eintrag (kartesisch, Rahmen der App), wie bis v1.20 in js/pointgroups.js. @type {Record<string, Mat3[]>} */
const ERZEUGENDE = {
  '1': [], '-1': [inv()],
  '2b': [rot(Y, 2)], '2c': [rot(Z, 2)], 'mb': [mirror(Y)], 'mc': [mirror(Z)], '2/mb': [rot(Y, 2), inv()], '2/mc': [rot(Z, 2), inv()],
  '222': [rot(X, 2), rot(Y, 2)], 'mm2': [mirror(X), mirror(Y)], 'mmm': [rot(X, 2), rot(Y, 2), inv()],
  '4': [rot(Z, 4)], '-4': [rotInv(Z, 4)], '4/m': [rot(Z, 4), inv()], '422': [rot(Z, 4), rot(X, 2)], '4mm': [rot(Z, 4), mirror(X)],
  '-42m': [rotInv(Z, 4), rot(X, 2)], '-4m2': [rotInv(Z, 4), mirror(X)], '4/mmm': [rot(Z, 4), rot(X, 2), inv()],
  '3': [rot(Z, 3)], '-3': [rot(Z, 3), inv()], '321': [rot(Z, 3), rot(HEX_A, 2)], '312': [rot(Z, 3), rot(HEX_A_MINUS_B, 2)],
  '3m1': [rot(Z, 3), mirror(HEX_A)], '31m': [rot(Z, 3), mirror(HEX_A_MINUS_B)], '-3m1': [rot(Z, 3), mirror(HEX_A), inv()],
  '-31m': [rot(Z, 3), mirror(HEX_A_MINUS_B), inv()],
  '6': [rot(Z, 6)], '-6': [rotInv(Z, 6)], '6/m': [rot(Z, 6), inv()], '622': [rot(Z, 6), rot(HEX_A, 2)], '6mm': [rot(Z, 6), mirror(HEX_A)],
  '-6m2': [rotInv(Z, 6), mirror(HEX_A)], '-62m': [rotInv(Z, 6), rot(HEX_A, 2)], '6/mmm': [rot(Z, 6), rot(HEX_A, 2), inv()],
  '23': [rot(Z, 2), rot(X, 2), rot(D111, 3)], 'm-3': [rot(Z, 2), rot(X, 2), rot(D111, 3), inv()], '432': [rot(Z, 4), rot(D111, 3)],
  '-43m': [rotInv(Z, 4), rot(D111, 3)], 'm-3m': [rot(Z, 4), rot(D111, 3), inv()],
};
/** Abschluss der Erzeugenden. @param {Mat3[]} gens */
function erzeuge(gens) {
  const els = [I3()];
  for (let neu = [I3()]; neu.length; ) {
    /** @type {Mat3[]} */
    const next = [];
    for (const a of neu) for (const g of gens) { const p = mul(g, a); if (!els.some((e) => matEq(e, p))) { els.push(p); next.push(p); } }
    neu = next;
  }
  return els;
}

test('die Referenz deckt alle 40 Einträge ab', () => {
  assert.deepEqual(Object.keys(ERZEUGENDE).sort(), POINT_GROUPS.map((g) => g.id).sort());
});

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

/**
 * Unabhängige Referenz für „piezoelektrisch“ (früher der Code der App, jetzt aus symcrys): Anzahl der invarianten
 * Komponenten des Piezotensors d_ijk (symmetrisch in j, k) als Mittel des Charakters χ(R)·(χ(R)² + χ(R²))/2 über die
 * Gruppe, mit χ(R) = Spur von R. Ergibt die 20 Gruppen ohne Inversionszentrum ausser 432 (Borchardt-Ott & Sowa,
 * Abschn. 9.6.2).
 * @param {Mat3[]} ops
 */
function piezoReferenz(ops) {
  /** @param {Mat3} m */
  const spur = (m) => m[0][0] + m[1][1] + m[2][2];
  /** @param {Mat3} m */
  const quadrat = (m) => /** @type {Mat3} */ (m.map((r) => [0, 1, 2].map((j) => r[0] * m[0][j] + r[1] * m[1][j] + r[2] * m[2][j])));
  let n = 0;
  for (const m of ops) { const t = spur(m); n += (t * (t * t + spur(quadrat(m)))) / 2; }
  return Math.round(n / ops.length) > 0;
}

for (const g of POINT_GROUPS) {
  test(`${g.id}: symcrys gibt dieselben Operationen, Eigenschaften und Elemente wie die Referenz`, () => {
    const alt = { ...g, ...analyzeGroup(erzeuge(ERZEUGENDE[g.id])) };
    const neu = kernElemente(g.id);
    const app = buildPointGroup(g.id);
    assert.ok(gleicheMenge(alt.ops, kernOperationen(g.id), gleicheMatrix), 'Operationen');
    assert.deepEqual([neu.centro, neu.chiral, neu.polar], [alt.centro, alt.chiral, alt.polar]);
    assert.deepEqual([neu.full, neu.sf, neu.laue], [g.full, g.sf, g.laue]);
    /** @param {{ dir: Vec3, symbol: string, centre: boolean, mirrorPerp: boolean }} x @param {typeof x} y */
    const gleicheAchse = (x, y) => parallel(x.dir, y.dir) && x.symbol === y.symbol && x.centre === y.centre && x.mirrorPerp === y.mirrorPerp;
    assert.ok(gleicheMenge(alt.axes, neu.axes, gleicheAchse), 'Achsen');
    assert.ok(gleicheMenge(alt.mirrors, neu.mirrors, parallel), 'Spiegelebenen');
    // buildPointGroup (was die App nutzt) gibt dasselbe, mit kanonischem Vorzeichen wie analyzeGroup
    assert.ok(gleicheMenge(alt.ops, app.ops, gleicheMatrix), 'buildPointGroup: Operationen');
    // Die Identität steht zuerst (Ausgangspol: scene.js `gen`, view3d.js, hklOrbit in polyhedra.js)
    assert.ok(gleicheMatrix(app.ops[0], I3()), 'Identität zuerst');
    assert.deepEqual([app.centro, app.chiral, app.polar, app.piezo], [alt.centro, alt.chiral, alt.polar, alt.piezo]);
    // piezoelektrisch aus symcrys (allowsProperty bzw. allowsPropertyOf) gegen die Charakterformel
    assert.equal(neu.piezo, piezoReferenz(alt.ops), 'piezoelektrisch (allowsProperty)');
    assert.equal(alt.piezo, piezoReferenz(alt.ops), 'piezoelektrisch (analyzeGroup, tensorFormOf)');
    // auch in einem beliebig gedrehten Rahmen (wie die Operationen in Bildschirmkoordinaten, polyhedra.js)
    const R = rotation([1, 2, 3], (37 * Math.PI) / 180);
    const gedreht = alt.ops.map((m) => mul(mul(R, m), transpose(R)));
    assert.equal(analyzeGroup(gedreht).piezo, piezoReferenz(alt.ops), 'piezoelektrisch (gedrehter Rahmen)');
    /** @param {Vec3} a @param {Vec3} b */
    const gleich = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
    assert.ok(gleicheMenge(alt.axes, app.axes, (x, y) => gleich(x.dir, y.dir) && x.symbol === y.symbol && x.centre === y.centre && x.mirrorPerp === y.mirrorPerp), 'buildPointGroup: Achsen');
    assert.ok(gleicheMenge(alt.mirrors, app.mirrors, gleich), 'buildPointGroup: Spiegelebenen');
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

test('Gittersymmetrie je Eintrag (holohedry von symcrys) gleich der früheren Tabelle der App', () => {
  // Unabhängige Referenz: die Tabelle HOLOHEDRY, die bis v1.21 in js/polyhedra.js stand (Gittersymmetrie je System,
  // trigonal mit hexagonalen Achsen, monoklin mit der Kennung 2/mb der App).
  /** @type {Record<string, string>} */
  const referenz = { triklin: '-1', monoklin: '2/mb', orthorhombisch: 'mmm', tetragonal: '4/mmm', trigonal: '6/mmm', hexagonal: '6/mmm', kubisch: 'm-3m' };
  for (const id of Object.keys(SYSTEM_OF)) assert.equal(kernGittersymmetrie(id), referenz[SYSTEM_OF[id]], id);
});
