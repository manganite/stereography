// Streckung entlang einer Blickrichtung: Restsymmetrie, Rhomboeder aus dem Würfel, hexagonale Achsen, Link.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../js/forms.js';
import { buildCrystal, LATTICE_DEFAULTS, SYSTEM_OF, STRETCH_DIRS, hexSettingOf } from '../js/polyhedra.js';
import { createState, hashOf, applyHashTo, currentStretch, breakModeOf, effectiveLat, freeLat, polyCrystal } from '../js/scene.js';

/** @import { Vec3, Richtung, Normale } from '../lib/common/js/typen.js' */
/** @import { Palette } from '../js/scene.js' */
/** @import { Gitterparameter, Kristall } from '../js/polyhedra.js' */
/** @typedef {NonNullable<ReturnType<typeof currentStretch>>} Streckung */
/** Kristall mit erniedrigter Symmetrie (im Test immer gestreckt). @typedef {Kristall & { reduced: NonNullable<Kristall['reduced']>, hexSetting: NonNullable<Kristall['hexSetting']> }} Gestreckt */

const deg = Math.PI / 180;
/**
 * Kristall einer Form, gestreckt entlang uvw um s (ohne uvw ungestreckt). Für die Prüfungen wie ein gestreckter Kristall
 * typisiert; die Tests lesen reduced und hexSetting nur, wo es sie gibt.
 * @param {string} entryId @param {number[] | null} uvw @param {number} s @param {Gitterparameter} [lat] @returns {Gestreckt}
 */
const build = (entryId, uvw, s, lat) => {
  const sys = SYSTEM_OF[/** @type {{ pg: string }} */ (CATALOG.find((e) => e.id === entryId)).pg];
  return /** @type {Gestreckt} */ (buildCrystal({ entryId, lat: lat || LATTICE_DEFAULTS[sys], broken: false, auxDist: 1, presetId: null, stretch: uvw ? { uvw: /** @type {Richtung} */ (uvw), s } : null }));
};
/** @param {number} a @param {number} b @param {number} [tol] */
const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;

/** Euler-Charakteristik V − E + F eines konvexen Polyeders aus seinen Flächen. */
/** @param {{ verts: Vec3[] }[]} faces */
function euler(faces) {
  /** @param {Vec3} v */
  const key = (v) => v.map((x) => x.toFixed(5)).join(',');
  const V = new Set(faces.flatMap((f) => f.verts.map(key))).size;
  const E = faces.reduce((s, f) => s + f.verts.length, 0) / 2;
  return V - E + faces.length;
}

test('Würfel entlang [111]: Rhomboeder, cos α = (s² − 1)/(s² + 2), c/a = s·√(3/2)', () => {
  for (const s of [0.6, 1.3, 1.8]) {
    const C = build('m-3m:a34', [1, 1, 1], s);
    assert.equal(C.reduced.hm, '-3m');
    assert.deepEqual(C.reducedAxis, { symbol: '-3', uvw: [1, 1, 1] });
    assert.equal(C.orbitsMain.length, 1, 'der Würfel bleibt eine Form');
    const al = Math.acos((s * s - 1) / (s * s + 2)) / deg;
    for (const k of /** @type {('al' | 'be' | 'ga')[]} */ (['al', 'be', 'ga'])) assert.ok(near(C.lat[k], al), `${k} = ${C.lat[k]}, erwartet ${al}`);
    assert.ok(near(C.lat.ba, 1) && near(C.lat.ca, 1), 'a = b = c');
    assert.ok(near(C.hexSetting.ca, s * Math.sqrt(1.5)), 'c/a');
    assert.deepEqual(C.hexSetting.orbits, [{ rep: [1, 0, 1], name: 'Rhomboeder' }]);
  }
});

test('hexagonale Achsen (obvers): c ∥ [111], a₁ ∥ [11̄0], a₂ ∥ [011̄]; rechtshändig auch für die übrigen ⟨111⟩', () => {
  const hs = /** @type {NonNullable<ReturnType<typeof hexSettingOf>>} */ (hexSettingOf(/** @type {Richtung} */ ([1, 1, 1])));
  assert.deepEqual([hs.a1, hs.a2, hs.c], [[1, -1, 0], [0, 1, -1], [1, 1, 1]]);
  assert.deepEqual(hs.toHex(/** @type {Normale} */ ([1, 0, 0])), [1, 0, 1]);
  assert.deepEqual(hs.toHex(/** @type {Normale} */ ([1, 1, 1])), [0, 0, 1]);
  for (const d of [[1, 1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, -1], [-1, -1, -1]]) {
    const h = /** @type {NonNullable<ReturnType<typeof hexSettingOf>>} */ (hexSettingOf(/** @type {Richtung} */ (d)));
    const det = h.a1[0] * (h.a2[1] * h.c[2] - h.a2[2] * h.c[1]) - h.a1[1] * (h.a2[0] * h.c[2] - h.a2[2] * h.c[0]) + h.a1[2] * (h.a2[0] * h.c[1] - h.a2[1] * h.c[0]);
    assert.ok(det > 0, `rechtshändig für [${d}]`);
    assert.deepEqual(h.c, d);
  }
});

test('Oktaeder entlang [111]: Pinakoid + Rhomboeder; Rhombendodekaeder: Rhomboeder + hexagonales Prisma', () => {
  const O = build('m-3m:b35', [1, 1, 1], 0.7);
  assert.deepEqual(O.orbitsMain.map((o) => o.hkls.length).sort(), [2, 6]);
  assert.deepEqual(O.hexSetting.orbits.map((o) => o.name).sort(), ['Pinakoid', 'Rhomboeder']);
  const R = build('m-3m:c40', [1, 1, 1], 1.4);
  assert.deepEqual(R.hexSetting.orbits.map((o) => o.name).sort(), ['Hexagonales Prisma', 'Rhomboeder']);
});

test('gestreckter Würfel = Rhomboeder {101̄1} in 3̄m1 mit c/a = s·√(3/2) (gleiche Flächenwinkel und Gestalt)', () => {
  const s = 1.45;
  const A = build('m-3m:a34', [1, 1, 1], s);
  const B = build('-3m1:c21', null, 1, { ...LATTICE_DEFAULTS.trigonal, ca: s * Math.sqrt(1.5) });
  /** @param {Kristall} C */
  const angles = (C) => {
    /** @type {number[]} */
    const out = [];
    for (let i = 0; i < C.faces.length; i++) for (let j = i + 1; j < C.faces.length; j++) {
      const a = C.faces[i].normal, b = C.faces[j].normal;
      out.push(Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) / deg);
    }
    return out.sort((x, y) => x - y);
  };
  /** @param {Kristall} C */
  const dists = (C) => {
    const vs = C.faces.flatMap((f) => f.verts);
    /** @type {number[]} */
    const out = [];
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) out.push(Math.hypot(vs[i][0] - vs[j][0], vs[i][1] - vs[j][1], vs[i][2] - vs[j][2]));
    const m = Math.max(...out);
    return out.map((x) => x / m).sort((x, y) => x - y);
  };
  assert.equal(A.faces.length, B.faces.length);
  angles(A).forEach((x, i) => assert.ok(near(x, angles(B)[i], 1e-6), 'Flächenwinkel'));
  dists(A).forEach((x, i) => assert.ok(near(x, dists(B)[i], 1e-6), 'Gestalt'));
});

test('Restsymmetrie je Blickrichtung der Holoedrien', () => {
  /** @type {Record<string, Record<string, string>>} */
  const expect = {
    'm-3m:a34': { '001': '4/mmm', 111: '-3m', 110: 'mmm' },
    '4/mmm:f14': { 100: 'mmm', 110: 'mmm' },
    '6/mmm:e31': { 100: 'mmm', 210: 'mmm' },
    '-3m1:c21': { 100: '2/m', 210: '2/m' },
  };
  for (const [id, m] of Object.entries(expect)) {
    const sys = SYSTEM_OF[/** @type {{ pg: string }} */ (CATALOG.find((e) => e.id === id)).pg];
    for (const d of STRETCH_DIRS[sys]) {
      const C = build(id, d.uvw, 1.3);
      assert.equal(C.reduced ? C.reduced.hm : null, m[d.id], `${id} entlang [${d.id}]`);
    }
  }
});

test('angebotene Streckrichtungen ändern die Symmetrie jeder Form ihres Systems; ohne Richtung: orthorhombisch, monoklin, triklin', () => {
  for (const sys of ['orthorhombisch', 'monoklin', 'triklin']) assert.equal(STRETCH_DIRS[sys].length, 0, sys);
  for (const e of CATALOG) {
    for (const d of STRETCH_DIRS[SYSTEM_OF[e.pg]]) assert.ok(build(e.id, d.uvw, 1.2).isReduced, `${e.id} entlang [${d.id}]`);
  }
});

test('alle Formen in allen Streckrichtungen ergeben geschlossene Körper', () => {
  for (const e of CATALOG) {
    const sys = SYSTEM_OF[e.pg];
    for (const d of STRETCH_DIRS[sys]) {
      for (const s of [0.6, 1.7]) {
        const C = build(e.id, d.uvw, s);
        assert.equal(C.lostMain, 0, `${e.id} [${d.id}] ${s}: Flächen verloren`);
        assert.equal(euler(C.faces), 2, `${e.id} [${d.id}] ${s}: Euler`);
      }
    }
  }
});

test('Link-Adresse: str=Richtung,Faktor hin und zurück; ungültige Werte werden verworfen oder begrenzt', () => {
  const D = createState();
  const a = createState();
  applyHashTo(a, '#m=form&sys=kubisch&f=m-3m:a34&str=111,1.3', D);
  assert.deepEqual(currentStretch(a) && [/** @type {Streckung} */ (currentStretch(a)).id, /** @type {Streckung} */ (currentStretch(a)).s], ['111', 1.3]);
  const h = hashOf(a, D);
  assert.match(h, /str=111,1\.3/);
  const b = createState();
  applyHashTo(b, h, D);
  assert.equal(hashOf(b, D), h);
  // str schaltet „Symmetrie brechen“ (Streckung) ein; Faktor 1 ist eine gültige Einstellung ohne Verzerrung
  assert.equal(breakModeOf(a), 'stretch');
  const one = createState();
  applyHashTo(one, '#m=form&sys=kubisch&f=m-3m:a34&str=111,1', D);
  assert.equal(breakModeOf(one), 'stretch');
  assert.equal(currentStretch(one), null);
  assert.match(hashOf(one, D), /br=1.*str=111,1(&|$)/);
  // Faktor ausserhalb 0,5 … 2: nächster gültiger Wert (Leitfaden 5.2)
  for (const [f, s] of [['-1', 0.5], ['3', 2]]) {
    const c = createState();
    applyHashTo(c, `#m=form&sys=kubisch&f=m-3m:a34&str=111,${f}`, D);
    assert.deepEqual([currentStretch(c)?.id, currentStretch(c)?.s], ['111', s], String(f));
  }
  // Richtung eines anderen Systems, symmetrieerhaltende Richtung, Beispielkristall, fehlender Faktor oder keine Zahl: keine Streckung
  for (const bad of ['#m=form&sys=kubisch&f=m-3m:a34&str=210,1.3', '#m=form&sys=tetragonal&f=4/mmm:f14&str=001,1.3',
    '#m=form&sys=kubisch&bsp=galenit&str=111,1.3', '#m=form&sys=kubisch&f=m-3m:a34&str=111,',
    '#m=form&sys=kubisch&f=m-3m:a34&str=111,x']) {
    const c = createState();
    applyHashTo(c, bad, D);
    assert.equal(currentStretch(c), null, bad);
    assert.doesNotMatch(hashOf(c, D), /str=/, bad);
    // auch nach Verlassen des Beispiels keine versteckte Streckung
    c.poly.example = null;
    assert.equal(currentStretch(c), null, bad + ' (ohne Beispiel)');
  }
});

test('Flächenmuster: jede Teilform erhält ein Muster, wenn die Form zerfällt', () => {
  const C = build('m-3m:b35', [1, 1, 1], 0.7); // Oktaeder → Pinakoid + Rhomboeder
  assert.equal(C.orbitsMain.length, 2);
  assert.equal(C.motifs.length, C.latOps.length * 2);
  const U = build('m-3m:b35', null, 1);
  assert.equal(U.motifs.length, U.latOps.length, 'ohne Verzerrung unverändert');
});

test('Symmetrie brechen: Streckung sperrt die Gitterregler und zeigt das gestreckte Gitter; „alle frei“ übernimmt es', () => {
  const D = createState();
  const st = createState();
  applyHashTo(st, '#m=form&sys=tetragonal&f=4/mmm:f14&ca=1.5&str=110,1.2', D);
  const eff = effectiveLat(st);
  assert.ok(Math.abs(eff.ca - 1.5 / Math.sqrt((1.2 ** 2 + 1) / 2)) < 1e-9, 'c/a bezogen auf das gestreckte a');
  assert.ok(Math.abs(eff.ga - 90) > 1, 'γ ≠ 90°');
  assert.equal(st.poly.lats.tetragonal.ca, 1.5, 'unverzerrtes Gitter bleibt erhalten');
  // Richtungswechsel: gleicher Faktor, gleiches unverzerrtes Gitter
  st.poly.stretch.dir = '100';
  const e100 = effectiveLat(st);
  assert.ok(Math.abs(e100.ba - 1 / 1.2) < 1e-9 && Math.abs(e100.ga - 90) < 1e-9);
  // Wechsel zu „alle frei“ (wie in main.js): freies Gitter = angezeigtes Gitter, Kristall unverändert
  const before = polyCrystal(st, /** @type {Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ form: [] }), { get: (o, k) => (k in o ? o[k] : '#000') })))).faces.map((f) => f.normal.map((x) => x.toFixed(9)).join());
  st.poly.freeLats.tetragonal = effectiveLat(st);
  st.poly.breakMode = 'free';
  assert.equal(breakModeOf(st), 'free');
  const after = polyCrystal(st, /** @type {Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ form: [] }), { get: (o, k) => (k in o ? o[k] : '#000') })))).faces.map((f) => f.normal.map((x) => x.toFixed(9)).join());
  assert.deepEqual(after, before);
  // Link im Modus „alle frei“: Gitterparameter ohne str, br=1; zurückgelesen wieder „alle frei“
  const h = hashOf(st, D);
  assert.doesNotMatch(h, /str=/);
  const back = createState();
  applyHashTo(back, h, D);
  assert.equal(breakModeOf(back), 'free');
  assert.ok(Math.abs(freeLat(back).ba - 1 / 1.2) < 0.006);
});

test('Links und Zustand bis v1.4.0: br=1 bedeutet alle Gitterparameter frei; str ohne br schaltet die Streckung ein', () => {
  const D = createState();
  const a = createState();
  applyHashTo(a, '#m=form&sys=kubisch&f=m-3m:a34&br=1&ba=1.2&ga=80', D);
  assert.equal(breakModeOf(a), 'free');
  assert.equal(freeLat(a).ba, 1.2);
  assert.equal(effectiveLat(a).ga, 80);
  assert.equal(a.poly.lats.kubisch.ba, 1, 'unverzerrtes Gitter kubisch');
  const b = createState();
  applyHashTo(b, '#m=form&sys=kubisch&f=m-3m:a34&str=001,1.3', D);
  assert.ok(b.poly.broken);
  assert.equal(breakModeOf(b), 'stretch');
  assert.ok(Math.abs(effectiveLat(b).ca - 1.3) < 1e-9);
});
