// Rundlauf-Tests nach Leitfaden Abschn. 9 (crystallography-common#63, #96): Zustand → Link → Zustand,
// Zustand → Speicher → Zustand, alte Speicherstände v2–v4 und verdorbene Stände → gültiger Zustand,
// Zurücksetzen vor und nach dem Neuladen gleich. Erwartungen fest im Test (Listen, Bereiche), nicht aus dem Code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, applyHashTo, hashOf, currentExample, effectiveLat } from '../js/scene.js';
import { ausSpeicher, speicherStand, zustandPruefen } from '../js/zustand.js';
import { POINT_GROUPS } from '../js/pointgroups.js';
import { EXAMPLES } from '../js/examples.js';
import { gitterGueltig, orientationPresets } from '../js/polyhedra.js';

/** @import { Zustand } from '../js/scene.js' */

const D = createState();
const SYSTEME = ['triklin', 'monoklin', 'orthorhombisch', 'tetragonal', 'trigonal', 'hexagonal', 'kubisch'];
/** Felder, die nur der Link oder nur die Sitzung kennt (nicht gespeichert). */
const FLUECHTIG = ['blick', 'selected', 'zoneSel', 'pgSel', 'fig'];

/** Link wie main.js: applyHashTo, dann zustandPruefen. @param {string} h */
const ausLink = (h) => { const s = createState(); if (applyHashTo(s, h, D)) zustandPruefen(s); return s; };
/** Neu laden über den Speicher (JSON wie im Browser). @param {Zustand} s */
const neuLaden = (s) => ausSpeicher(JSON.parse(JSON.stringify(speicherStand(s))));
/** Gespeicherter Teil des Zustands. @param {Zustand} s */
const gespeichert = (s) => JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => !FLUECHTIG.includes(k)))));

/** Gültig nach den festen Erwartungen. @param {Zustand} s */
function pruefeGueltig(s) {
  assert.ok(['pg', 'poly'].includes(s.mode), `mode ${s.mode}`);
  assert.ok(POINT_GROUPS.some((g) => g.id === s.pg.id), `pg.id ${s.pg.id}`);
  assert.ok(['b', 'c'].includes(s.pg.monoAxis), `monoAxis ${s.pg.monoAxis}`);
  assert.ok(s.pg.theta >= 0 && s.pg.theta <= 180 && s.pg.phi >= 0 && s.pg.phi < 360, `θ ${s.pg.theta}, φ ${s.pg.phi}`);
  for (const k of ['showElements', 'showObject', 'showPoles', 'colorful']) assert.equal(typeof /** @type {Record<string, unknown>} */ (s.pg)[k], 'boolean', `pg.${k}`);
  assert.ok(s.pg.hideDirs.every((k) => [0, 1, 2].includes(k)), 'hideDirs');
  assert.ok([null, 'angle'].includes(s.pg.tool), 'pg.tool');
  assert.ok(SYSTEME.includes(s.poly.system), `system ${s.poly.system}`);
  assert.ok(orientationPresets(s.poly.system).some((x) => x.id === s.poly.presetId), `presetId ${s.poly.presetId}`);
  for (const [sys, l] of Object.entries(s.poly.lats)) assert.ok(SYSTEME.includes(sys) && gitterGueltig(l), `lats.${sys}`);
  for (const [sys, l] of Object.entries(s.poly.freeLats)) assert.ok(SYSTEME.includes(sys) && gitterGueltig(l), `freeLats.${sys}`);
  assert.ok(gitterGueltig(effectiveLat(s)), 'wirksames Gitter');
  assert.ok(s.poly.auxDist >= 0.3 && s.poly.auxDist <= 3 && s.poly.size >= 0.3 && s.poly.size <= 1.2, 'auxDist, size');
  assert.ok([null, 'zone', 'angle'].includes(s.poly.tool), 'poly.tool');
  assert.ok(s.poly.example === null || EXAMPLES.some((e) => e.id === s.poly.example), 'example');
  assert.ok(Object.values(s.poly.exScale).every((f) => f.every((x) => x >= 0.5 && x <= 2)), 'exScale');
  assert.ok(s.poly.zones.every((z) => /^-?\d+,-?\d+,-?\d+$/.test(z)), 'zones');
  assert.ok(['stretch', 'free'].includes(s.poly.breakMode), 'breakMode');
  assert.ok(typeof s.poly.stretch.dir === 'string' && s.poly.stretch.s >= 0.5 && s.poly.stretch.s <= 2, 'stretch');
  assert.ok(s.view.wulffRot >= 0 && s.view.wulffRot <= 180, 'wulffRot');
  assert.equal(typeof hashOf(s, D), 'string');
}

/** Links über alle Gruppen, Systeme, Beispiele, Brüche der Symmetrie und Werkzeuge. */
function links() {
  const out = POINT_GROUPS.map((g) => `#m=pg&g=${encodeURIComponent(g.id)}&rho=-30&az=200&hand=1&aus=2&w=winkel&farbe=0`);
  for (const sys of SYSTEME) out.push(`#m=form&sys=${sys}&gr=0.9&abstand=1.4&w=zone&zonen=1,0,0;0,1,1`);
  out.push('#m=form&sys=triklin&ba=1.3&ca=0.7&al=80&be=100&ga=95', '#m=form&sys=monoklin&be=110');
  out.push('#m=form&sys=kubisch&str=111,1.3', '#m=form&sys=tetragonal&br=1&ba=1.2&ga=100', '#m=form&sys=hexagonal&str=210,0.8&blick=2');
  for (const e of EXAMPLES) out.push(`#m=form&sys=${e.sys}&bsp=${e.id}&ab=${e.forms.map(() => '1.2').join(',')}`);
  return out;
}

test('Rundlauf: Zustand → Link → Zustand (die Link-Adresse ist stabil)', () => {
  for (const h of links()) {
    const s = ausLink(h);
    pruefeGueltig(s);
    const h2 = hashOf(s, D);
    assert.equal(hashOf(ausLink(h2), D), h2, h);
  }
});

test('Rundlauf: Zustand → Speicher → Zustand (alles Gespeicherte bleibt)', () => {
  for (const h of links()) {
    const s = ausLink(h);
    assert.deepEqual(gespeichert(neuLaden(s)), gespeichert(s), h);
  }
});

test('Rundlauf: alte Speicherstände v2–v4 werden übernommen', () => {
  // v2: nur Punktgruppen, φ in alter Zählung (ab ↓, Gegenuhrzeigersinn), Blickrichtungsfarben unter pg
  const v2 = ausSpeicher({ v: 2, mode: 'pg', pg: { id: '4/mmm', theta: 40, phi: 30, dirColors: false }, view: {} });
  assert.deepEqual([v2.pg.id, v2.pg.theta, v2.pg.phi, v2.view.dirColors], ['4/mmm', 40, 60, false]);
  assert.ok(!('dirColors' in v2.pg));
  // v3 bis v1.4.0: Werkzeug zoneMode, „Symmetrie brechen“ = alle Gitterparameter frei im Gitter gespeichert
  const v3 = ausSpeicher({ v: 3, mode: 'poly', pg: {}, view: {}, poly: { system: 'tetragonal', broken: true, zoneMode: true, lats: { tetragonal: { ba: 1.1, ca: 1.3, al: 85, be: 95, ga: 92 } } } });
  assert.deepEqual([v3.mode, v3.poly.tool, v3.poly.breakMode], ['poly', 'zone', 'free']);
  assert.deepEqual(v3.poly.freeLats.tetragonal, { ba: 1.1, ca: 1.3, al: 85, be: 95, ga: 92 });
  assert.deepEqual(v3.poly.lats.tetragonal, { ba: 1, ca: 1.3, al: 90, be: 90, ga: 90 });
  assert.ok(!('zoneMode' in v3.poly));
  // v4 wie heute; unbekannte Version: Startzustand
  assert.equal(ausSpeicher({ v: 4, mode: 'poly', pg: {}, poly: { system: 'trigonal' }, view: {} }).poly.system, 'trigonal');
  for (const v of [1, 5, '4', null]) assert.deepEqual(gespeichert(ausSpeicher({ v, mode: 'poly' })), gespeichert(createState()), String(v));
});

test('Rundlauf: verdorbene Speicherstände → gültiger, stabiler Zustand (#96, #95)', () => {
  /** @type {unknown[]} */
  const staende = [
    null, 'x', 42, [], { v: 4 }, { v: 4, pg: 'x', poly: 7, view: null },
    {
      v: 4, mode: 'tafel',
      pg: { id: '<b>', monoAxis: 'x', famPref: { '32': 5, '3m': '31m' }, theta: null, phi: 'a', showElements: 'ja', hideDirs: [1, 7, 'a'], tool: 'zone', colorful: 1 },
      poly: {
        system: 'kristall', entryBySys: { kubisch: 3, fremd: 'x' }, presetId: '999', broken: 'ja', auxDist: 'weit', size: 99, tool: 'radierer',
        example: 'gibtsnicht', exScale: { galenit: [0.1, 'x', 9], fremd: [1] }, zones: ['1,0,0', '<b>', '0,0,0', 5], breakMode: 'alles',
        stretch: { dir: 5, s: 9 },
        lats: { kubisch: { ba: 'x' }, triklin: { ba: 1.2, ca: 0.9, al: 60, be: 60, ga: 150 }, monoklin: { ba: 1.3, ca: 0.8, al: 60, be: 100, ga: 150 }, fremd: {} },
        freeLats: { kubisch: { ba: 1, ca: 1, al: 60, be: 60, ga: 150 }, tetragonal: { ba: 1, ca: 1.2, al: 80, be: 90, ga: 95 }, trigonal: null },
      },
      view: { dirColors: 'nein', wulffRot: 900, fremd: 1 },
    },
    JSON.parse('{"v":4,"pg":{"__proto__":{"boese":1},"id":"6/mmm"},"poly":{"__proto__":{"boese":2}}}'),
  ];
  for (const st of staende) {
    const s = ausSpeicher(JSON.parse(JSON.stringify(st) ?? 'null'));
    pruefeGueltig(s);
    assert.deepEqual(gespeichert(neuLaden(s)), gespeichert(s), 'stabil beim erneuten Laden');
    assert.deepEqual(Object.keys(s.pg).sort(), Object.keys(D.pg).sort(), 'nur Felder von pg');
    assert.deepEqual(Object.keys(s.poly).sort(), Object.keys(D.poly).sort(), 'nur Felder von poly');
    assert.deepEqual(Object.keys(s.view).sort(), Object.keys(D.view).sort(), 'nur Felder von view');
    assert.ok(!('boese' in s.pg) && Object.getPrototypeOf(s.pg) === Object.prototype);
  }
  const s = ausSpeicher(staende[6]);
  // einzelne Erwartungen: Startwerte, Gitter nach #95, gültige Teile bleiben
  assert.deepEqual([s.mode, s.pg.id, s.pg.monoAxis, s.pg.theta, s.pg.phi, s.pg.tool], ['pg', 'mm2', 'b', 59, 75.5, null]);
  assert.deepEqual(s.pg.famPref, { '3m': '31m' });
  assert.deepEqual(s.pg.hideDirs, [1]);
  assert.deepEqual(Object.keys(s.poly.lats), ['monoklin']); // α, γ gelten monoklin nicht; triklin ungültig
  assert.deepEqual(Object.keys(s.poly.freeLats), ['tetragonal']);
  assert.deepEqual(s.poly.exScale, { galenit: [0.5, 1, 2] });
  assert.deepEqual(s.poly.zones, ['1,0,0']);
  assert.deepEqual([s.poly.system, s.poly.auxDist, s.poly.size, s.poly.tool, s.poly.example, s.poly.breakMode], ['kubisch', 1, 1.2, null, null, 'stretch']);
  assert.deepEqual(s.poly.stretch, { dir: '', s: 1 });
  assert.deepEqual(s.poly.entryBySys, {});
  assert.equal(s.view.wulffRot, 180);
});

test('Rundlauf: Zurücksetzen vor und nach dem Neuladen gleich (Speicher und Link)', () => {
  // „Gitter zurücksetzen“ und „Gestalt zurücksetzen“ hängen von System und Beispielkristall ab (main.js)
  for (const h of links().filter((x) => x.startsWith('#m=form'))) {
    const s = ausLink(h);
    for (const n of [neuLaden(s), ausLink(hashOf(s, D))]) {
      assert.equal(n.poly.system, s.poly.system, h);
      assert.equal(currentExample(n)?.id ?? null, currentExample(s)?.id ?? null, h);
    }
  }
});
