// Gemeinsamer Kern (scene.js): Link-Adressen und die Abbildungen des Skripts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createState, hashOf, applyHashTo, pgScene, polyCrystal, polyScene, normalizeZones } from '../js/scene.js';
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

test('Skript: jede Abbildung ist ein gültiger Link der App und ergibt ein Stereogramm', () => {
  const html = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
  const hashes = [...html.matchAll(/data-app="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  assert.ok(hashes.length >= 3);
  for (const h of hashes) {
    const { scene } = sceneFor(h);
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
