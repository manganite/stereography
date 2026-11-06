// Gitterparameter: Nur Winkel, die zusammen ein Gitter ergeben, werden angenommen (#95), und das erzeugte Gitter
// hat genau die eingestellten Parameter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LATTICE_DEFAULTS, GITTER_MIN, STRETCH_DIRS, gitterGueltig, naechsterGueltiger, latticeFromParams, paramsOfLattice } from '../js/polyhedra.js';
import { EXAMPLES } from '../js/examples.js';
import { createState, applyHashTo, effectiveLat } from '../js/scene.js';
import { zustandPruefen } from '../js/zustand.js';

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

test('Gitter: Grenzfälle nahe der Grenze, unabhängig berechnet über die Determinante des metrischen Tensors', () => {
  assert.equal(gitterGueltig({ al: 60, be: 60, ga: 119 }), true);
  assert.equal(gitterGueltig({ al: 60, be: 60, ga: 120 }), false);
  /** det G / (a²b²c²) mit G_ij = cos(Winkel), allgemeine 3×3-Determinante @param {number} al @param {number} be @param {number} ga */
  const detG = (al, be, ga) => {
    const c = (/** @type {number} */ w) => Math.cos(w * Math.PI / 180);
    const G = [[1, c(ga), c(be)], [c(ga), 1, c(al)], [c(be), c(al), 1]];
    return G[0][0] * (G[1][1] * G[2][2] - G[1][2] * G[2][1]) - G[0][1] * (G[1][0] * G[2][2] - G[1][2] * G[2][0]) + G[0][2] * (G[1][0] * G[2][1] - G[1][1] * G[2][0]);
  };
  for (let al = 60; al <= 150; al += 1) for (let be = 60; be <= 150; be += 3) for (let ga = 60; ga <= 150; ga += 3) {
    const d = detG(al, be, ga), ok = gitterGueltig({ al, be, ga });
    assert.equal(ok, d >= GITTER_MIN ** 2 - 1e-12, `${al}/${be}/${ga}`);
    // ohne Mindestabstand genau die Bedingungen im Hinweistext: jeder Winkel < Summe der anderen, alle < 360°
    if (Math.abs(d) > 1e-9) assert.equal(d > 0, al < be + ga && be < al + ga && ga < al + be && al + be + ga < 360, `${al}/${be}/${ga}`);
  }
});

test('Regler: nächster gültiger Wert an der Grenze, Endlichkeit, alter Wert neben dem Raster oder ungültig', () => {
  const lat = { ba: 1, ca: 1, al: 60, be: 60, ga: 100 };
  assert.equal(naechsterGueltiger(lat, 'ga', 115), 115); // gültig: unverändert
  assert.equal(naechsterGueltiger(lat, 'ga', 150), 119); // an der Grenze stehen
  assert.equal(naechsterGueltiger({ ...lat, ga: 100.4 }, 'ga', 150, 1), 119); // alt neben dem Raster: Zwischenwerte von 150 aus
  assert.equal(naechsterGueltiger({ ...lat, ga: 118.9 }, 'ga', 119.8, 1), 118.9); // Grenze bei 119,5°: nur alt (118,9) ist gültig
  assert.equal(naechsterGueltiger({ ...lat, ga: 150 }, 'ga', 140), 150); // alt ungültig: bleibt (kein Fortschritt ins Ungültige)
  // Ergebnis immer gültig (wenn alt gültig war) und zwischen alt und Wunsch
  for (let alt = 60; alt <= 150; alt += 7) for (let w = 60; w <= 150; w += 5) {
    const l = { ...lat, ga: alt };
    if (!gitterGueltig(l)) continue;
    const r = naechsterGueltiger(l, 'ga', w);
    assert.ok(gitterGueltig({ ...l, ga: r }) && Math.min(alt, w) <= r && r <= Math.max(alt, w), `${alt} → ${w}: ${r}`);
  }
});

test('Link: Winkel, die im verwendeten Gitter nicht gelten, bleiben (monoklin ohne br)', () => {
  const st = createState();
  assert.ok(applyHashTo(st, '#m=form&sys=monoklin&al=60&be=62&ga=150', createState()));
  assert.equal(effectiveLat(st).be, 62);
});

test('Speicher: Gitter mit ungültigen Winkeln werden verworfen, gültige bleiben', () => {
  const st = createState();
  st.poly.lats = { triklin: { ba: 1.2, ca: 0.9, al: 60, be: 60, ga: 150 }, monoklin: { ba: 1.3, ca: 0.8, al: 60, be: 100, ga: 150 } };
  st.poly.freeLats = { kubisch: { ba: 1, ca: 1, al: 60, be: 60, ga: 150 }, tetragonal: { ba: 1, ca: 1.2, al: 80, be: 90, ga: 95 } };
  zustandPruefen(st);
  assert.deepEqual(Object.keys(st.poly.lats), ['monoklin']); // α, γ gelten monoklin nicht
  assert.deepEqual(Object.keys(st.poly.freeLats), ['tetragonal']);
});

test('Streckung: jede Richtung und jeder Faktor ergibt ein gültiges Gitter', () => {
  for (const [sys, dirs] of Object.entries(STRETCH_DIRS)) for (const d of dirs) for (const s of [0.5, 0.75, 1.5, 2]) {
    const st = createState();
    st.poly.system = sys; st.poly.broken = true; st.poly.breakMode = 'stretch'; st.poly.stretch = { dir: d.id, s };
    assert.ok(gitterGueltig(effectiveLat(st)), `${sys} [${d.id}] ${s}`);
  }
});
