// 3D-Konstruktion: Ansichten entlang der Blickrichtungen, abschaltbare Pole und Kugelmarken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createState, hashOf, applyHashTo, pgScene, polyCrystal, polyScene, pgViewDirections, polyViewDirections, viewDirections,
  pgPolesOn, polyLabelsOn,
} from '../js/scene.js';
import { POINT_GROUPS, blickklassen, buildPointGroup, latticeToCart } from '../js/pointgroups.js';
import { VIEW_FAMILIES_REFERENZ, symmetryDirectionsReferenz } from './blickrichtungen-referenz.mjs';
import { normalize } from '../js/linalg.js';
import { SYSTEMS } from '../js/punktgruppen.js';
import { CATALOG } from '../js/forms.js';
import { SYSTEM_OF } from '../js/polyhedra.js';

/** @import { Vec3, Richtung } from '../lib/common/js/typen.js' */
/** @import { Palette } from '../js/scene.js' */

const K = '#336699';
const col = /** @type {Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ form: Array(8).fill(K), dir: [K, K, K] }), { get: (o, k) => (k in o ? o[k] : K) })));
/** @param {string} hash */
const stateOf = (hash) => { const st = createState(); assert.ok(applyHashTo(st, hash, createState()), hash); return st; };
/** @param {{ uvw: number[] }[]} dirs */
const uvw = (dirs) => dirs.map((d) => d.uvw.join(','));
/** @param {number[]} a @param {number[]} b */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Gleiche Gerade (± gleich) im Gitter. @param {number[]} a @param {number[]} b */
const gleicheGerade = (a, b) => a.every((x, i) => x === b[i]) || a.every((x, i) => x === -b[i]);

test('Ansichten: je Kristallsystem drei Richtungen, Positionen und Familien wie die Referenz (v1.21)', () => {
  // Familie, Bezeichnung und Position stimmen mit den früheren Tabellen der App überein; nur der Vertreter darf ein
  // anderes Mitglied derselben Familie sein (stereography#111, Thomas, 21.11.2026: Vertreter von symcrys)
  for (const g of POINT_GROUPS) {
    const st = stateOf(`#m=pg&g=${g.id}`);
    const d = pgViewDirections(st);
    const ref = VIEW_FAMILIES_REFERENZ[g.system];
    assert.equal(d.length, 3, g.id);
    d.forEach((x, i) => {
      assert.equal(x.pos, ref[i].pos, `${g.id}: Position`);
      assert.equal(x.fam, ref[i].fam ?? null, `${g.id}: Bezeichnung der Familie`);
      assert.ok(ref[i].uvw.some((u) => gleicheGerade(u, x.uvw)), `${g.id}: [${x.uvw}] gehört zur Familie ${ref[i].fam ?? ref[i].uvw[0]}`);
      assert.ok(Math.abs(Math.hypot(...x.dir) - 1) < 1e-9 && x.dir[2] >= -1e-9, g.id);
    });
  }
});

test('Ansichten: Vertreter von symcrys (ITA Tab. 2.1.3.1) in der Standardlage, hier als Stichprobe festgehalten', () => {
  /** @type {Record<string, string[]>} */
  const want = {
    triklin: ['1,0,0', '0,1,0', '0,0,1'], monoklin: ['1,0,0', '0,1,0', '0,0,1'], orthorhombisch: ['1,0,0', '0,1,0', '0,0,1'],
    tetragonal: ['0,0,1', '1,0,0', '1,-1,0'], trigonal: ['0,0,1', '1,0,0', '1,-1,0'], hexagonal: ['0,0,1', '1,0,0', '1,-1,0'],
    kubisch: ['0,0,1', '1,1,1', '1,-1,0'], // ⟨100⟩ als [001]: Blick wie im Stereogramm
  };
  for (const sys of SYSTEMS) {
    const g = /** @type {typeof POINT_GROUPS[number]} */ (POINT_GROUPS.find((x) => x.system === sys));
    assert.deepEqual(uvw(pgViewDirections(stateOf(`#m=pg&g=${g.id}`))), want[sys], sys);
    assert.deepEqual(pgViewDirections(stateOf(`#m=pg&g=${g.id}`)).map((x) => x.pos), sys === 'triklin' ? [-1, -1, -1] : [0, 1, 2], sys);
  }
});

test('Blickrichtungsklassen der App (aus symcrys) wie die frühere Tabelle: Bezeichnung, Symbol, Richtungen, Elemente', () => {
  for (const g of POINT_GROUPS) {
    const info = buildPointGroup(g.id);
    const ref = symmetryDirectionsReferenz({ system: g.system, full: g.full, axes: info.axes.map((a) => ({ ...a })), mirrors: info.mirrors });
    const neu = blickklassen(info);
    assert.equal(neu.length, ref.length, g.id);
    neu.forEach((c, i) => {
      assert.equal(c.label, ref[i].label, `${g.id} Position ${i + 1}: Bezeichnung`);
      assert.equal(c.hm, ref[i].hm, `${g.id} Position ${i + 1}: Symbol`);
      assert.equal(c.dirs.length, ref[i].dirs.length, `${g.id} Position ${i + 1}: Zahl der Richtungen`);
      assert.ok(c.dirs.every((d) => ref[i].dirs.some((r) => Math.abs(Math.abs(d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) - 1) < 1e-9)), `${g.id} Position ${i + 1}: dieselben Geraden`);
      assert.equal(c.axes.length, ref[i].axes.length, `${g.id} Position ${i + 1}: Achsen`);
      assert.equal(c.mirrors.length, ref[i].mirrors.length, `${g.id} Position ${i + 1}: Spiegelebenen`);
    });
  }
});

test('Ansichten: die Richtung der dritten Klasse heisst ⟨210⟩, auch wenn symcrys [1-10] als Vertreter gibt (Bezeichnung der App)', () => {
  for (const id of ['3', '6/mmm']) {
    const d = pgViewDirections(stateOf(`#m=pg&g=${id}`));
    assert.equal(d[2].fam, '⟨210⟩', id);
    // ⟨210⟩ steht senkrecht auf einer der drei Richtungen ⟨100⟩ (mit a, b und a + b)
    const hex = [[1, 0, 0], [0, 1, 0], [1, 1, 0]].map((u) => normalize(latticeToCart('hexagonal')(/** @type {Richtung} */ (u))));
    assert.ok(hex.some((h) => Math.abs(dot(d[2].dir, h)) < 1e-9), id);
  }
  const d = pgViewDirections(stateOf('#m=pg&g=6/mmm'));
  assert.deepEqual(d.map((x) => x.along), ['proj', 'side', 'side']);
});

test('Ansichten folgen der Lage: Familienmitglied ∥ bzw. ⊥ Projektionsrichtung', () => {
  const dirsFor = (/** @type {string} */ h) => { const st = stateOf(h); return polyViewDirections(polyCrystal(st, col)); };
  // kubisch, [111] ∥ Projektionsrichtung: ⟨111⟩ von oben, ⟨110⟩ seitlich (ein Mitglied ⊥ [111])
  const c111 = dirsFor('#m=form&sys=kubisch&f=m-3m:b35&lage=111');
  assert.equal(c111[1].along, 'proj');
  assert.equal(c111[2].along, 'side');
  assert.ok(gleicheGerade(c111[2].uvw, [1, -1, 0]));
  // kubisch, [110] ∥ Projektionsrichtung: ⟨100⟩ als [001] seitlich, ⟨110⟩ von oben
  const c110 = dirsFor('#m=form&sys=kubisch&f=m-3m:b35&lage=110');
  assert.deepEqual(c110[0].uvw, [0, 0, 1]);
  assert.equal(c110[0].along, 'side');
  assert.equal(c110[2].along, 'proj');
  // hexagonal, a ∥ Projektionsrichtung: [100] von oben, ⟨210⟩ seitlich
  const ha = dirsFor('#m=form&sys=hexagonal&f=6/mmm:e31&lage=a');
  assert.equal(ha[1].along, 'proj');
  assert.equal(ha[2].along, 'side');
  assert.ok([[2, 1, 0], [1, 2, 0], [1, -1, 0]].some((u) => gleicheGerade(u, ha[2].uvw)), `[${ha[2].uvw}] ∈ ⟨210⟩`);
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
  assert.throws(() => viewDirections('unbekannt', (u) => u), /fehlt in symcrys/);
});

test('Schnittstelle zu plane-groups: blick=1–3 der Links in js/verweise.js blickt entlang der Polarachse, senkrecht auf die Fläche', () => {
  // Links von plane-groups (js/verweise.js, Stand 21.11.2026): Aufruf, Nummer der Blickrichtung, Gitterrichtung der Polarachse.
  // Tetragonal, trigonal, hexagonal: 1. Blickrichtung [001]; monoklin 2. Blickrichtung [010] (Achse b), orthorhombisch und
  // triklin 3. Blickrichtung [001]. Diese Zuordnung darf sich nicht ändern (Leitfaden Abschn. 8).
  /** @type {[string, number, Vec3][]} */
  const links = [
    ['#m=pg&g=1&blick=3', 3, [0, 0, 1]], ['#m=form&sys=monoklin&f=2b:a1&blick=2', 2, [0, 1, 0]], ['#m=pg&g=mb&blick=3', 3, [0, 0, 1]],
    ['#m=form&sys=orthorhombisch&f=mm2:a1&blick=3', 3, [0, 0, 1]], ['#m=form&sys=tetragonal&f=4:a1&blick=1', 1, [0, 0, 1]],
    ['#m=form&sys=tetragonal&f=4mm:a1&blick=1', 1, [0, 0, 1]], ['#m=form&sys=trigonal&f=3:a1&blick=1', 1, [0, 0, 1]],
    ['#m=form&sys=trigonal&f=3m1:a1&blick=1', 1, [0, 0, 1]], ['#m=form&sys=trigonal&f=31m:a1&blick=1', 1, [0, 0, 1]],
    ['#m=form&sys=hexagonal&f=6:a1&blick=1', 1, [0, 0, 1]], ['#m=form&sys=hexagonal&f=6mm:a1&blick=1', 1, [0, 0, 1]],
  ];
  for (const [h, n, polar] of links) {
    const st = stateOf(h);
    assert.equal(st.blick, n, h);
    if (st.mode === 'pg') {
      assert.deepEqual(pgViewDirections(st)[n - 1].uvw, polar, h);
    } else {
      const C = polyCrystal(st, col);
      const v = polyViewDirections(C)[n - 1];
      assert.deepEqual(v.uvw, polar, h);
      // Blick ∥ Projektionsrichtung (wie vor dem Umbau, nur der monokline Link blickt seitlich auf die Achse b)
      assert.equal(v.along, h.includes('sys=monoklin') ? 'side' : 'proj', `${h}: Lage der Blickrichtung zur Projektion`);
    }
  }
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
  const help = readFileSync(new URL('../js/hilfetexte.js', import.meta.url), 'utf8');
  for (const id of ['pg-poles', 'poly-poles', 'v-globe', 'export-stereo', 'export-3d', 'view-oblique', 'view-dirs', 'zoom-3d-ein', 'zoom-3d-aus']) {
    assert.ok(html.includes(`id="${id}"`), id);
    // ohne Tooltip: das Export-Menü sagt mit seinem Text, was es tut (Leitfaden Abschn. 5.3)
    if (!['view-dirs', 'export-stereo', 'export-3d'].includes(id)) assert.ok(help.includes(`'${id}'`), id);
  }
  assert.ok(!/data-view="(top|side)"/.test(html), 'alte Ansichtsknöpfe');
  // Zoom der 3D-Konstruktion (#144): im ⓘ von „Darstellung“
  const { SECTIONS } = await import('../js/hilfetexte.js');
  for (const id of ['zoom-3d-ein', 'zoom-3d-aus']) assert.ok(SECTIONS.some((s) => s.ids.includes(id)), id);
});

test('Seitenleiste: Zusatzoptionen der Anzeige unter „Darstellung“, nach Tafel gegliedert', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const block = (/** @type {string} */ id) => { const i = html.indexOf(`id="${id}"`); const j = html.indexOf('</details>', i); return html.slice(i, j); };
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

test('Blick im Link: blick=1–3 hin und zurück, ungültige Werte und Standard ohne Eintrag', () => {
  for (const h of ['#m=pg&g=31m&blick=1', '#m=form&sys=tetragonal&f=4mm:a1&muster=1&blick=1&kugel=0&ns=0&ebene=0&strahlen=0&normalen=0&achsen=1', '#m=form&sys=kubisch&bsp=galenit&blick=3']) {
    const D = createState(), a = createState();
    applyHashTo(a, h, D);
    const want = Number(new URLSearchParams(h.slice(1)).get('blick'));
    assert.equal(a.blick, want, h);
    const h1 = hashOf(a, D);
    assert.equal(new URLSearchParams(h1.slice(1)).get('blick'), String(want), h);
    const b = createState();
    applyHashTo(b, h1, D);
    assert.equal(b.blick, want, h);
  }
  for (const bad of ['0', '4', '-1', '1.5', 'x', '']) assert.equal(stateOf(`#m=pg&g=4mm&blick=${bad}`).blick, 0, bad);
  // ein Link ohne blick setzt einen vorherigen Blick zurück (der Link ist vollständig)
  const st = stateOf('#m=pg&g=4mm&blick=2');
  applyHashTo(st, '#m=pg&g=4mm', createState());
  assert.equal(st.blick, 0);
  assert.ok(!/blick=/.test(hashOf(createState(), createState())));
});
