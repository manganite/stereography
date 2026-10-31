// Lage eines Pols: Lagesymmetrie, Multiplizität und Wyckoff-Lage (ITA Vol. A, Abschn. 10.1.2.2), Einrasten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POINT_GROUPS, buildPointGroup, orbit, groupById } from '../js/pointgroups.js';
import { CATALOG } from '../js/forms.js';
import { wyckoffPositions, siteOf, snapPole, distinctPoles, poleOfHKL } from '../js/sitesym.js';
import { normalize, cross, scale, add } from '../js/linalg.js';
import { createState, applyHashTo, hashOf, pgScene } from '../js/scene.js';

const deg = Math.PI / 180;
const pole = (rho, phi) => [Math.sin(rho * deg) * Math.sin(phi * deg), Math.sin(rho * deg) * Math.cos(phi * deg), Math.cos(rho * deg)];

/** Stichproben: Pole auf jeder Achse, auf jeder Spiegelebene und ein allgemeiner Pol. */
function samples(info) {
  const out = [normalize([0.31, 0.17, 0.83])];
  for (const a of info.axes) out.push(a.dir, scale(a.dir, -1));
  for (const n of info.mirrors) {
    const t = normalize(cross(n, [0.3, 0.7, 0.2])), u = cross(n, t);
    for (const k of [0.1, 0.37, 0.9, 2.2]) out.push(normalize(add(scale(t, Math.cos(k)), scale(u, Math.sin(k)))));
  }
  return out;
}

test('Wyckoff-Lagen aller 40 Einträge: Multiplizität × Ordnung der Lagesymmetrie = Ordnung der Gruppe', () => {
  for (const g of POINT_GROUPS) {
    const info = buildPointGroup(g.id);
    const rows = wyckoffPositions(g.id);
    assert.ok(rows.length >= 1, g.id);
    assert.equal(new Set(rows.map((r) => r.wy)).size, rows.length, `${g.id}: Buchstaben eindeutig`);
    for (const r of rows) assert.equal(r.mult * r.stab.length, info.order, `${g.id} ${r.wy}`);
    assert.equal(rows.filter((r) => r.stab.length === 1).length, 1, `${g.id}: genau eine allgemeine Lage`);
  }
});

test('Jeder Pol gehört zu genau einer Wyckoff-Lage, jede Lage wird erreicht', () => {
  for (const g of POINT_GROUPS) {
    const info = buildPointGroup(g.id);
    const rows = wyckoffPositions(g.id);
    const seen = new Set();
    for (const p of samples(info)) {
      const s = siteOf(g.id, info, p);
      assert.ok(s.wy, `${g.id}: Pol ${p.map((x) => x.toFixed(3))} ohne Wyckoff-Lage`);
      assert.equal(s.mult, rows.find((r) => r.wy === s.wy).mult, `${g.id} ${s.wy}`);
      // die Bahn hat so viele verschiedene Pole wie die Multiplizität
      assert.equal(distinctPoles(orbit(info.ops, s.p)).length, s.mult, `${g.id} ${s.wy}: Polzahl`);
      seen.add(s.wy);
    }
    assert.deepEqual([...seen].sort(), rows.map((r) => r.wy).sort(), `${g.id}: alle Lagen erreichbar`);
  }
});

test('Katalog: Pol jeder Form ergibt deren Wyckoff-Lage und Flächensymmetrie (ITA Tab. 10.1.2.2)', () => {
  let n = 0;
  for (const e of CATALOG) {
    const info = buildPointGroup(e.pg);
    const s = siteOf(e.pg, info, poleOfHKL(groupById(e.pg).system, e.hkl));
    assert.equal(s.wy, e.wy, `${e.pg} {${e.hkl}}`);
    assert.equal(s.fs, e.fs, `${e.pg} {${e.hkl}}`);
    assert.equal(s.mult, e.mult, `${e.pg} {${e.hkl}}`);
    n++;
  }
  assert.equal(n, 134);
});

test('Aufstellungen mit eigener Lagentabelle (ALT_SETTINGS): Lagen nach ITA Tab. 10.1.2.2', () => {
  const list = (id) => wyckoffPositions(id).map((r) => `${r.mult}${r.wy} ${r.fs}`).join(' | ');
  assert.equal(list('312'), '6c 1 | 3b ..2 | 2a 3..');
  assert.equal(list('31m'), '6c 1 | 3b ..m | 1a 3.m');
  assert.equal(list('-31m'), '12d 1 | 6c ..m | 6b ..2 | 2a 3.m');
  assert.equal(list('-4m2'), '8d 1 | 4c .m. | 4b ..2 | 2a 2mm.');
  assert.equal(list('-62m'), '12e 1 | 6d m.. | 6c ..m | 3b m2m | 2a 3.m');
  assert.equal(list('2/mc'), '4c 1 | 2b m | 2a 2');
  // 4̄m2: Pol auf der 2-zähligen Achse [110] liegt in 4b (..2), auf der Spiegelebene ⊥ [100] in 4c (.m.)
  const info = buildPointGroup('-4m2');
  assert.equal(siteOf('-4m2', info, normalize([1, 1, 0])).wy, 'b');
  assert.equal(siteOf('-4m2', info, normalize([0, 1, 2])).wy, 'c');
});

test('Einrasten: nahe an Spiegelebene bzw. Achse, sonst frei', () => {
  const info = buildPointGroup('m-3m');
  const s1 = snapPole(info, pole(40, 2)); // 2° neben der Spiegelebene ⊥ a
  assert.equal(s1.on, 'mirror');
  assert.equal(siteOf('m-3m', info, s1.p).wy, 'd');
  const s2 = snapPole(info, pole(40, 12));
  assert.equal(s2.on, null);
  assert.equal(siteOf('m-3m', info, s2.p).wy, 'f');
  const s3 = snapPole(info, pole(52, 44)); // rund 3° neben [111]
  assert.equal(s3.on, 'axis');
  const s = siteOf('m-3m', info, s3.p);
  assert.equal(`${s.mult}${s.wy} ${s.fs}`, '8b .3m');
  // ohne Symmetrieelemente rastet nichts ein
  assert.equal(snapPole(buildPointGroup('-1'), pole(40, 2)).on, null);
});

test('Link-Adresse: eingerasteter Pol bleibt nach dem Runden auf 4 Stellen speziell', () => {
  const D = createState(), a = createState();
  applyHashTo(a, '#m=pg&g=m-3m', D);
  const info = buildPointGroup('m-3m');
  const p = snapPole(info, pole(50, 47)).p; // auf ..m (h h l)
  a.pg.theta = Math.acos(p[2]) / deg;
  a.pg.phi = ((Math.atan2(p[0], p[1]) / deg) + 360) % 360;
  const b = createState();
  applyHashTo(b, hashOf(a, D), D);
  const { site, distinct, scene } = pgScene(b, new Proxy({}, { get: () => '#000' }));
  assert.equal(`${site.mult}${site.wy} ${site.fs}`, '24e ..m');
  assert.equal(distinct.length, 24);
  assert.equal(scene.poles.length, 24);
});

test('Skript, Kapitel 8: Abbildungen zeigen die genannten Lagen', () => {
  const col = new Proxy({}, { get: () => '#000' });
  const expect = {
    '#m=pg&g=4/mmm&rho=40&az=20': '16g 1', '#m=pg&g=4/mmm&rho=40&az=0': '8f .m.', '#m=pg&g=4/mmm&rho=40&az=45': '8e ..m',
    '#m=pg&g=4/mmm&rho=90&az=20': '8d m..', '#m=pg&g=4/mmm&rho=90&az=0': '4c m2m.', '#m=pg&g=4/mmm&rho=90&az=45': '4b m.m2',
    '#m=pg&g=4/mmm&rho=0': '2a 4mm', '#m=pg&g=m-3m&rho=54.7356&az=45': '8b .3m', '#m=pg&g=23&rho=54.7356&az=45': '4a .3.',
  };
  for (const [h, want] of Object.entries(expect)) {
    const st = createState();
    applyHashTo(st, h, createState());
    const { site, distinct } = pgScene(st, col);
    assert.equal(`${site.mult}${site.wy} ${site.fs}`, want, h);
    assert.equal(distinct.length, site.mult, h);
  }
});
