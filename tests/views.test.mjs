// 3D-Konstruktion: Ansichten entlang der Blickrichtungen, abschaltbare Pole und Kugelmarken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createState, hashOf, applyHashTo, pgScene, polyCrystal, polyScene, pgViewDirections, polyViewDirections, viewDirections,
  pgPolesOn, polyLabelsOn,
} from '../js/scene.js';
import { POINT_GROUPS, SYSTEMS } from '../js/pointgroups.js';
import { CATALOG } from '../js/forms.js';
import { SYSTEM_OF } from '../js/polyhedra.js';

const K = '#336699';
const col = new Proxy({ form: Array(8).fill(K), dir: [K, K, K] }, { get: (o, k) => (k in o ? o[k] : K) });
const stateOf = (hash) => { const st = createState(); assert.ok(applyHashTo(st, hash, createState()), hash); return st; };
const uvw = (dirs) => dirs.map((d) => d.uvw.join(','));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

test('Ansichten: je Kristallsystem drei Richtungen, Positionen wie im Hermann-Mauguin-Symbol', () => {
  const want = {
    triklin: ['1,0,0', '0,1,0', '0,0,1'], monoklin: ['1,0,0', '0,1,0', '0,0,1'], orthorhombisch: ['1,0,0', '0,1,0', '0,0,1'],
    tetragonal: ['0,0,1', '1,0,0', '1,1,0'], trigonal: ['0,0,1', '1,0,0', '2,1,0'], hexagonal: ['0,0,1', '1,0,0', '2,1,0'],
    kubisch: ['0,0,1', '1,1,1', '1,1,0'], // ⟨100⟩ als [001]: Blick wie im Stereogramm
  };
  for (const sys of SYSTEMS) {
    const g = POINT_GROUPS.find((x) => x.system === sys);
    const st = stateOf(`#m=pg&g=${g.id}`);
    const d = pgViewDirections(st);
    assert.deepEqual(uvw(d), want[sys], sys);
    assert.deepEqual(d.map((x) => x.pos), sys === 'triklin' ? [-1, -1, -1] : [0, 1, 2], sys);
    for (const x of d) assert.ok(Math.abs(Math.hypot(...x.dir) - 1) < 1e-9 && x.dir[2] >= -1e-9, sys);
  }
});

test('Ansichten: hexagonal [210] steht senkrecht auf b, Richtung ∥ Projektionsrichtung heisst „proj“', () => {
  const d = pgViewDirections(stateOf('#m=pg&g=6/mmm'));
  assert.ok(Math.abs(dot(d[2].dir, [0, 1, 0])) < 1e-9);
  assert.deepEqual(d.map((x) => x.along), ['proj', 'side', 'side']);
});

test('Ansichten folgen der Lage: Familienmitglied ∥ bzw. ⊥ Projektionsrichtung', () => {
  const dirsFor = (h) => { const st = stateOf(h); return polyViewDirections(polyCrystal(st, col)); };
  // kubisch, [111] ∥ Projektionsrichtung: ⟨111⟩ von oben, ⟨110⟩ seitlich ([1-10] ⊥ [111])
  const c111 = dirsFor('#m=form&sys=kubisch&f=m-3m:b35&lage=111');
  assert.equal(c111[1].along, 'proj');
  assert.equal(c111[2].along, 'side');
  assert.deepEqual(c111[2].uvw, [1, -1, 0]);
  // kubisch, [110] ∥ Projektionsrichtung: ⟨100⟩ als [001] seitlich, ⟨110⟩ von oben
  const c110 = dirsFor('#m=form&sys=kubisch&f=m-3m:b35&lage=110');
  assert.deepEqual(c110[0].uvw, [0, 0, 1]);
  assert.equal(c110[0].along, 'side');
  assert.equal(c110[2].along, 'proj');
  // hexagonal, a ∥ Projektionsrichtung: [100] von oben, ⟨210⟩ als [120] (⊥ a)
  const ha = dirsFor('#m=form&sys=hexagonal&f=6/mmm:e31&lage=a');
  assert.equal(ha[1].along, 'proj');
  assert.deepEqual(ha[2].uvw, [1, 2, 0]);
  // Weltrichtung = Bildschirmsystem der Lage: c-Achse bei Lage c entlang z
  const tc = dirsFor('#m=form&sys=tetragonal&f=4/mmm:f14');
  assert.ok(Math.abs(tc[0].dir[2] - 1) < 1e-9);
});

test('Ansichten: alle Katalogformen und alle Lagen ergeben drei Einheitsrichtungen (Betrachter oben)', () => {
  for (const e of CATALOG) {
    for (const lage of SYSTEM_OF[e.pg] === 'kubisch' ? ['001', '111', '110'] : ['c', 'a', 'b']) {
      const st = stateOf(`#m=form&sys=${SYSTEM_OF[e.pg]}&f=${e.id}&lage=${lage}`);
      const d = polyViewDirections(polyCrystal(st, col));
      assert.equal(d.length, 3, e.id);
      for (const x of d) assert.ok(Math.abs(Math.hypot(...x.dir) - 1) < 1e-9 && x.dir[2] >= -1e-9, `${e.id} ${lage}`);
    }
  }
  assert.equal(viewDirections('unbekannt', (u) => u).length, 3);
});

test('Flächenpole aus: keine Pole und keine Indizes im Stereogramm; Link hin und zurück', () => {
  const pg = stateOf('#m=pg&g=4/mmm&pole=0&w=winkel');
  assert.equal(pgPolesOn(pg), false);
  assert.equal(pgScene(pg, col).scene.poles.length, 0);
  assert.equal(pgScene(pg, col).sel.length, 0);
  const form = stateOf('#m=form&sys=kubisch&bsp=galenit&pole=0');
  assert.equal(form.poly.labels, true); // Indizes bleiben eingestellt, wirken aber nicht
  assert.equal(polyLabelsOn(form), false);
  const C = polyCrystal(form, col);
  assert.equal(polyScene(form, C, col).scene.poles.length, 0);
  const on = stateOf('#m=form&sys=kubisch&bsp=galenit');
  assert.ok(polyScene(on, polyCrystal(on, col), col).scene.poles.length > 0);
  for (const h of ['#m=pg&g=4/mmm&pole=0', '#m=form&sys=kubisch&bsp=galenit&pole=0&idx=0', '#m=pg&g=m-3m&ns=0', '#m=form&sys=kubisch&f=m-3m:b35&ns=0&pole=0']) {
    const D = createState(), a = createState();
    applyHashTo(a, h, D);
    const h1 = hashOf(a, D);
    for (const k of new URLSearchParams(h.slice(1)).keys()) assert.ok(new URLSearchParams(h1.slice(1)).has(k), `${h}: ${k}`);
    const b = createState();
    applyHashTo(b, h1, D);
    assert.equal(hashOf(b, D), h1, h);
  }
  // Standard: Pole und Kugelmarken an, ohne Eintrag im Link
  const D = createState();
  assert.ok(D.pg.showPoles && D.poly.showPoles && D.view.globe);
  assert.ok(!/pole=|ns=/.test(hashOf(createState(), D)));
});

test('Oberfläche: jede Option hat ein Bedienelement und einen Tooltip', async () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const help = readFileSync(new URL('../js/help.js', import.meta.url), 'utf8');
  for (const id of ['pg-poles', 'poly-poles', 'v-globe', 'copy-stereo', 'save-svg', 'save-stereo-png', 'copy-3d', 'save-3d', 'view-oblique', 'view-dirs']) {
    assert.ok(html.includes(`id="${id}"`), id);
    if (id !== 'view-dirs') assert.ok(help.includes(`'${id}'`), id);
  }
  assert.ok(!/data-view="(top|side)"/.test(html), 'alte Ansichtsknöpfe');
});

test('Seitenleiste: Zusatzoptionen der Anzeige unter „Darstellung“, nach Tafel gegliedert', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const block = (id) => { const i = html.indexOf(`id="${id}"`); const j = html.indexOf('</details>', i); return html.slice(i, j); };
  const card = html.slice(html.indexOf('id="ctl-poly"'), html.indexOf('</section>', html.indexOf('id="ctl-poly"')));
  const view = block('sec-view');
  for (const id of ['pg-poles', 'poly-poles', 'pg-colorful', 'poly-lower', 'v-wulff', 'v-sphere', 'v-globe', 'v-rays']) {
    assert.ok(view.includes(`id="${id}"`), `${id} unter Darstellung`);
    assert.ok(!card.includes(`id="${id}"`), `${id} nicht in der Karte Kristallform`);
  }
  for (const id of ['poly-labels', 'poly-frame']) assert.ok(card.includes(`id="${id}"`), id);
  const g = [...view.matchAll(/class="group-title">([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(g, ['Stereogramm und 3D-Konstruktion', 'Stereogramm', '3D-Konstruktion']);
  // eingeklappte Abschnitte sagen, was man in ihnen findet
  for (const id of ['ctl-poly-lat', 'ctl-poly-shape', 'sec-view']) assert.ok(block(id).includes('class="sumhint"'), id);
});
