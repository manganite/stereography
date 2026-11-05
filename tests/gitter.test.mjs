// Gitterparameter: Nur Winkel, die zusammen ein Gitter ergeben, werden angenommen (#95), und das erzeugte Gitter
// hat genau die eingestellten Parameter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LATTICE_DEFAULTS, GITTER_MIN, gitterGueltig, latticeFromParams, paramsOfLattice } from '../js/polyhedra.js';
import { EXAMPLES } from '../js/examples.js';
import { createState, applyHashTo, effectiveLat } from '../js/scene.js';

/** @import { Gitterparameter } from '../js/polyhedra.js' */

test('Gitter: Winkel 60°, 60°, 150° ergeben kein Gitter, Vorgaben und Beispiele schon', () => {
  assert.equal(gitterGueltig({ al: 60, be: 60, ga: 150 }), false);
  assert.equal(gitterGueltig({ al: 60, be: 60, ga: 120 }), false); // Achsen in einer Ebene
  assert.equal(gitterGueltig({ al: 90, be: 90, ga: 90 }), true);
  for (const [sys, p] of Object.entries(LATTICE_DEFAULTS)) assert.ok(gitterGueltig(p), sys);
  for (const ex of EXAMPLES) assert.ok(gitterGueltig({ ...LATTICE_DEFAULTS[ex.sys], ...(ex.lat || {}) }), ex.id);
});

test('Gitter: jede angenommene Kombination ergibt genau die eingestellten Parameter', () => {
  let angenommen = 0, abgelehnt = 0;
  for (let al = 60; al <= 150; al += 5) for (let be = 60; be <= 150; be += 5) for (let ga = 60; ga <= 150; ga += 5) {
    /** @type {Gitterparameter} */
    const p = { ba: 1.3, ca: 0.8, al, be, ga };
    if (!gitterGueltig(p)) { abgelehnt += 1; continue; }
    angenommen += 1;
    const r = paramsOfLattice(latticeFromParams(p));
    for (const k of /** @type {const} */ (['ba', 'ca', 'al', 'be', 'ga'])) assert.ok(Math.abs(r[k] - p[k]) < 1e-6, `${al}/${be}/${ga}: ${k} ${r[k]} statt ${p[k]}`);
  }
  assert.ok(angenommen > 0 && abgelehnt > 0);
});

test('Gitter: Grenze unabhängig von der Formel (Volumen der Zelle aus der Matrix)', () => {
  for (let al = 60; al <= 150; al += 5) for (let be = 60; be <= 150; be += 5) for (let ga = 60; ga <= 150; ga += 5) {
    const p = { ba: 1, ca: 1, al, be, ga };
    if (!gitterGueltig(p)) continue;
    const [[a, b, c], [d, e, f], [g, h, i]] = latticeFromParams(p);
    const vol = Math.abs(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
    assert.ok(vol >= GITTER_MIN - 1e-9, `${al}/${be}/${ga}: V = ${vol}`);
  }
});

test('Link: Winkel, die kein Gitter ergeben, werden durch die Winkel der Vorgabe ersetzt', () => {
  for (const extra of ['', '&br=1']) {
    const st = createState();
    assert.ok(applyHashTo(st, `#m=form&sys=triklin&al=60&be=60&ga=150${extra}`, createState()));
    const lat = effectiveLat(st);
    assert.ok(gitterGueltig(lat), extra);
    assert.deepEqual([lat.al, lat.be, lat.ga], [LATTICE_DEFAULTS.triklin.al, LATTICE_DEFAULTS.triklin.be, LATTICE_DEFAULTS.triklin.ga], extra);
  }
  // gültige Winkel bleiben
  const st = createState();
  assert.ok(applyHashTo(st, '#m=form&sys=triklin&al=70&be=80&ga=100&br=1', createState()));
  const lat = effectiveLat(st);
  assert.deepEqual([lat.al, lat.be, lat.ga], [70, 80, 100]);
});
