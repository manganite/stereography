// Gemeinsamer Kern (scene.js): Link-Adressen und die Abbildungen des Skripts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createState, hashOf, applyHashTo, pgScene, polyCrystal, polyScene, normalizeZones, currentEntryId } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';

// Farben ohne CSS (palette() liest sonst die CSS-Variablen der Seite)
const K = '#336699';
const col = new Proxy({ form: Array(8).fill(K), dir: [K, K, K] }, { get: (o, k) => (k in o ? o[k] : K) });

const sceneFor = (hash) => {
  const st = createState();
  assert.ok(applyHashTo(st, hash, createState()), `kein gültiger Link: ${hash}`);
  st.poly.zones = normalizeZones(st.poly.zones);
  if (st.mode === 'pg') return { st, scene: pgScene(st, col).scene };
  const C = polyCrystal(st, col);
  return { st, C, scene: polyScene(st, C, col).scene };
};

test('Link-Adresse: Zustand → Hash → Zustand ergibt denselben Hash', () => {
  for (const h of ['#m=pg&g=4/mmm&rho=30&az=20', '#m=form&sys=kubisch&bsp=galenit&w=zone&zonen=0,0,1;1,1,1',
    '#m=form&sys=hexagonal&f=6/mmm:e31&hkil=1&lage=a', '#m=pg&g=1&obj=0&wulff=1']) {
    const D = createState(), a = createState();
    applyHashTo(a, h, D);
    const h1 = hashOf(a, D);
    const b = createState();
    applyHashTo(b, h1, D);
    assert.equal(hashOf(b, D), h1, h);
  }
});

test('Link-Adresse: Links bis v1.0.0 (phi= ab ↓ im Gegenuhrzeigersinn, rho= über 90°) werden umgerechnet', () => {
  const D = createState();
  const lies = (h) => { const st = createState(); assert.ok(applyHashTo(st, h, D), h); return st; };
  // alte Zählung phi ab a (↓) im Gegenuhrzeigersinn, neue az ab b (→) im Uhrzeigersinn: az = 90° − phi
  assert.equal(lies('#m=pg&g=mm2&rho=40&phi=0').pg.phi, 90);
  assert.equal(lies('#m=pg&g=mm2&rho=40&phi=90').pg.phi, 0);
  assert.equal(lies('#m=pg&g=mm2&rho=40&phi=120').pg.phi, 330);
  // az hat Vorrang vor phi
  assert.equal(lies('#m=pg&g=mm2&az=10&phi=0').pg.phi, 10);
  // rho über 90° (vom Nordpol gezählt) ist die untere Halbkugel; neu geschrieben als negatives rho
  const unten = lies('#m=pg&g=mm2&rho=120&az=30');
  assert.equal(unten.pg.theta, 120);
  assert.match(hashOf(unten, D), /rho=-60(&|$)/);
  assert.equal(lies('#m=pg&g=mm2&rho=-60&az=30').pg.theta, 120);
});

test('Skript: jede Abbildung ist ein gültiger Link der App und ergibt ein Stereogramm', () => {
  const html = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
  const hashes = [...html.matchAll(/data-app="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  assert.ok(hashes.length >= 3);
  for (const h of hashes) {
    const { st, scene } = sceneFor(h);
    // eine verlinkte Form wird ohne Ersatz gezeigt (keine ausgeblendete Form)
    const f = new URLSearchParams(h.slice(1)).get('f');
    if (f) assert.equal(currentEntryId(st), f, h);
    const svg = buildSVG(scene).inner;
    assert.match(svg, /<circle/, h);
  }
  // Galenit (Abb. 1.3): 26 Flächen, (111) bei φ = 45°, ρ = 54,74° wie im Text
  const { C } = sceneFor('#m=form&sys=kubisch&bsp=galenit');
  assert.equal(C.faces.length, 26);
  const f = C.faces.find((x) => x.hkl.join(',') === '1,1,1');
  const phi = (Math.atan2(f.normal[0], f.normal[1]) * 180) / Math.PI;
  const rho = (Math.acos(f.normal[2]) * 180) / Math.PI;
  assert.ok(Math.abs(phi - 45) < 1e-6 && Math.abs(rho - 54.7356) < 1e-3);
});
