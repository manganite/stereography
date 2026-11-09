// Gemeinsamer Kern (scene.js): Link-Adressen und die Abbildungen des Skripts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createState, hashOf, applyHashTo, pgScene, polyCrystal, polyScene, normalizeZones, currentEntryId, introSeen } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';

/** @import { Palette, AppKristall } from '../js/scene.js' */

// Farben ohne CSS (palette() liest sonst die CSS-Variablen der Seite)
const K = '#336699';
const col = /** @type {Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ form: Array(8).fill(K), dir: [K, K, K] }), { get: (o, k) => (k in o ? o[k] : K) })));

/** @param {string} hash @returns {{ st: import('../js/scene.js').Zustand, C?: AppKristall, scene: import('../js/stereogram.js').Szene }} */
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
  const lies = (/** @type {string} */ h) => { const st = createState(); assert.ok(applyHashTo(st, h, D), h); return st; };
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
  const C = /** @type {AppKristall} */ (sceneFor('#m=form&sys=kubisch&bsp=galenit').C);
  assert.equal(C.faces.length, 26);
  const f = /** @type {AppKristall['faces'][number]} */ (C.faces.find((x) => x.hkl.join(',') === '1,1,1'));
  const phi = (Math.atan2(f.normal[0], f.normal[1]) * 180) / Math.PI;
  const rho = (Math.acos(f.normal[2]) * 180) / Math.PI;
  assert.ok(Math.abs(phi - 45) < 1e-6 && Math.abs(rho - 54.7356) < 1e-3);
});

test('Link-Adresse: eine Lage, die es im System nicht gibt, gilt als die erste und wird nicht geschrieben (Issue #67)', () => {
  const D = createState();
  const lies = (/** @type {string} */ h) => { const st = createState(); assert.ok(applyHashTo(st, h, D), h); return st; };
  // ohne lage blieb die kubische Startlage 001 stehen und wurde als lage=001 zurückgeschrieben
  const t = lies('#m=form&sys=tetragonal&f=4/mmm:f14');
  assert.equal(t.poly.presetId, 'c');
  assert.doesNotMatch(hashOf(t, D), /lage=/);
  assert.doesNotMatch(hashOf(lies('#m=form&sys=hexagonal&lage=111'), D), /lage=/);
  // gültige Lagen bleiben erhalten
  assert.match(hashOf(lies('#m=form&sys=tetragonal&lage=a'), D), /lage=a(&|$)/);
  assert.match(hashOf(lies('#m=form&sys=kubisch&lage=111'), D), /lage=111(&|$)/);
  assert.doesNotMatch(hashOf(lies('#m=form&sys=kubisch'), D), /lage=/);
});

test('Link-Adresse: unbekanntes Werkzeug, auch ein Schlüssel aus dem Prototyp, gilt als keins (Issue #86)', () => {
  const D = createState();
  const lies = (/** @type {string} */ h) => { const st = createState(); assert.ok(applyHashTo(st, h, D), h); return st; };
  for (const w of ['toString', 'constructor', '__proto__', 'hasOwnProperty', 'unbekannt', '']) {
    const st = lies(`#m=form&sys=kubisch&w=${w}`);
    assert.equal(st.poly.tool, null, `w=${w}`);
    assert.doesNotMatch(hashOf(st, D), /w=/, `w=${w}`);
  }
  // gültige Werkzeuge bleiben erhalten
  assert.equal(lies('#m=form&sys=kubisch&w=zone').poly.tool, 'zone');
  assert.equal(lies('#m=form&sys=kubisch&w=winkel').poly.tool, 'angle');
  assert.match(hashOf(lies('#m=form&sys=kubisch&w=winkel'), D), /w=winkel(&|$)/);
});

test('Erste Schritte: gespeicherte Modi lesen, alter Wert „zu“ gilt als „poly“', () => {
  assert.deepEqual([...introSeen(null)], []);
  assert.deepEqual([...introSeen('')], []);
  assert.deepEqual([...introSeen('zu')], ['poly']);
  assert.deepEqual([...introSeen('zu,pg')].sort(), ['pg', 'poly']);
  assert.deepEqual([...introSeen('pg,poly')].sort(), ['pg', 'poly']);
});

test('Link auf ein Prisma im trigonalen System zeigt dieses Prisma (#118)', () => {
  // Eigensymmetrie 6̄2m bzw. 6/mmm liegt im hexagonalen System: Die Liste führt die Prismen unter ihrer Gruppe
  for (const f of ['321:b18', '312:b18', '-3m1:b25', '-31m:b25']) {
    const { st, C } = sceneFor(`#m=form&sys=trigonal&f=${f}`);
    assert.equal(currentEntryId(st), f, f);
    assert.equal(/** @type {AppKristall} */ (C).faces.filter((x) => Math.abs(x.normal[2]) < 1e-9).length, f.endsWith('b18') ? 3 : 6, `${f}: Prismenflächen`);
  }
  // Pedion und Pinakoid erscheinen nur mit „Flächensymmetrie zeigen“; ohne muster=1 die Vorgabe des Systems
  assert.equal(currentEntryId(sceneFor('#m=form&sys=tetragonal&f=4mm:a1').st), '4/mmm:f14');
  assert.equal(currentEntryId(sceneFor('#m=form&sys=tetragonal&f=4mm:a1&muster=1').st), '4mm:a1');
});

test('Pole über dem Symmetriegerüst mit Hof in der Papierfarbe, ohne Gerüst ohne (#119)', () => {
  const PAPIER = '#fefefe', POL = '#123456';
  const farben = /** @type {Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ paper: PAPIER, form: Array(8).fill(POL), dir: [K, K, K] }), { get: (o, k) => (k in o ? o[k] : K) })));
  /** @param {string} hash */
  const svg = (hash) => {
    const st = createState();
    assert.ok(applyHashTo(st, hash, createState()));
    return buildSVG(polyScene(st, polyCrystal(st, farben), farben).scene).inner;
  };
  /** Mittelpunkte von Kreisen mit Radius r und Füllung bzw. Strich c. @param {string} s @param {string} r @param {string} c */
  const kreise = (s, r, c) => [...s.matchAll(new RegExp(`<circle cx="([\\d.-]+)" cy="([\\d.-]+)" r="${r}" (?:fill|fill="none" stroke)="${c}"`, 'g'))].map((m) => `${m[1]},${m[2]}`);
  const mit = svg('#m=form&sys=kubisch&bsp=galenit&geruest=1&idx=0');
  const pole = kreise(mit, '4.2', POL);
  assert.ok(pole.length >= 13, `obere Pole: ${pole.length}`);
  assert.deepEqual(kreise(mit, '5.4', PAPIER).sort(), [...pole].sort(), 'jeder obere Pol mit Hof');
  const ohne = svg('#m=form&sys=kubisch&bsp=galenit&idx=0');
  assert.equal(kreise(ohne, '5.4', PAPIER).length, 0, 'ohne Gerüst kein Hof');
});
