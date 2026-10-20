// Streckung entlang einer Blickrichtung: Restsymmetrie, Rhomboeder aus dem Würfel, hexagonale Achsen, Link.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../js/forms.js';
import { buildCrystal, LATTICE_DEFAULTS, SYSTEM_OF, STRETCH_DIRS, hexSettingOf } from '../js/polyhedra.js';
import { createState, hashOf, applyHashTo, currentStretch } from '../js/scene.js';

const deg = Math.PI / 180;
const build = (entryId, uvw, s, lat) => {
  const sys = SYSTEM_OF[CATALOG.find((e) => e.id === entryId).pg];
  return buildCrystal({ entryId, lat: lat || LATTICE_DEFAULTS[sys], broken: false, auxDist: 1, presetId: null, stretch: uvw ? { uvw, s } : null });
};
const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;

/** Euler-Charakteristik V − E + F eines konvexen Polyeders aus seinen Flächen. */
function euler(faces) {
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
    for (const k of ['al', 'be', 'ga']) assert.ok(near(C.lat[k], al), `${k} = ${C.lat[k]}, erwartet ${al}`);
    assert.ok(near(C.lat.ba, 1) && near(C.lat.ca, 1), 'a = b = c');
    assert.ok(near(C.hexSetting.ca, s * Math.sqrt(1.5)), 'c/a');
    assert.deepEqual(C.hexSetting.orbits, [{ rep: [1, 0, 1], name: 'Rhomboeder' }]);
  }
});

test('hexagonale Achsen (obvers): c ∥ [111], a₁ ∥ [11̄0], a₂ ∥ [011̄]; rechtshändig auch für die übrigen ⟨111⟩', () => {
  const hs = hexSettingOf([1, 1, 1]);
  assert.deepEqual([hs.a1, hs.a2, hs.c], [[1, -1, 0], [0, 1, -1], [1, 1, 1]]);
  assert.deepEqual(hs.toHex([1, 0, 0]), [1, 0, 1]);
  assert.deepEqual(hs.toHex([1, 1, 1]), [0, 0, 1]);
  for (const d of [[1, 1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, -1], [-1, -1, -1]]) {
    const h = hexSettingOf(d);
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
  const angles = (C) => {
    const out = [];
    for (let i = 0; i < C.faces.length; i++) for (let j = i + 1; j < C.faces.length; j++) {
      const a = C.faces[i].normal, b = C.faces[j].normal;
      out.push(Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) / deg);
    }
    return out.sort((x, y) => x - y);
  };
  const dists = (C) => {
    const vs = C.faces.flatMap((f) => f.verts);
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
  const expect = {
    'm-3m:a34': { '001': '4/mmm', 111: '-3m', 110: 'mmm' },
    '4/mmm:f14': { '001': null, 100: 'mmm', 110: 'mmm' },
    '6/mmm:e31': { '001': null, 100: 'mmm', 210: 'mmm' },
    '-3m1:c21': { '001': null, 100: '2/m', 210: '2/m' },
    'mmm:g7': { 100: null, '010': null, '001': null },
  };
  for (const [id, m] of Object.entries(expect)) {
    const sys = SYSTEM_OF[CATALOG.find((e) => e.id === id).pg];
    for (const d of STRETCH_DIRS[sys]) {
      const C = build(id, d.uvw, 1.3);
      assert.equal(C.reduced ? C.reduced.hm : null, m[d.id], `${id} entlang [${d.id}]`);
    }
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

test('Link-Adresse: str=Richtung,Faktor hin und zurück; ungültige Werte werden verworfen', () => {
  const D = createState();
  const a = createState();
  applyHashTo(a, '#m=form&sys=kubisch&f=m-3m:a34&str=111,1.3', D);
  assert.deepEqual(currentStretch(a) && [currentStretch(a).id, currentStretch(a).s], ['111', 1.3]);
  const h = hashOf(a, D);
  assert.match(h, /str=111,1\.3/);
  const b = createState();
  applyHashTo(b, h, D);
  assert.equal(hashOf(b, D), h);
  // Richtung eines anderen Systems, Faktor 1, Beispielkristall: keine Streckung
  for (const bad of ['#m=form&sys=kubisch&f=m-3m:a34&str=210,1.3', '#m=form&sys=kubisch&f=m-3m:a34&str=111,1',
    '#m=form&sys=kubisch&bsp=galenit&str=111,1.3', '#m=form&sys=kubisch&f=m-3m:a34&str=111,',
    '#m=form&sys=kubisch&f=m-3m:a34&str=111,-1', '#m=form&sys=kubisch&f=m-3m:a34&str=111,3', '#m=form&sys=kubisch&f=m-3m:a34&str=111,x']) {
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
