// Formenkatalog und Polyeder: Flächenzahlen nach ITA, geschlossene Körper, reduzierte Formliste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, FORM_TYPES, formEig } from '../js/forms.js';
import { POINT_GROUPS, buildPointGroup } from '../js/pointgroups.js';
import { buildCrystal, latticeOps, hklOrbit, LATTICE_DEFAULTS, SYSTEM_OF, habitOf } from '../js/polyhedra.js';

const groupOf = (id) => POINT_GROUPS.find((g) => g.id === id);

/** Euler-Charakteristik V − E + F eines konvexen Polyeders aus seinen Flächen. */
function euler(faces) {
  const key = (v) => v.map((x) => x.toFixed(5)).join(',');
  const V = new Set(faces.flatMap((f) => f.verts.map(key))).size;
  const E = faces.reduce((s, f) => s + f.verts.length, 0) / 2;
  return V - E + faces.length;
}

test('115 Formen, je 47 Formtypen benannt', () => {
  assert.equal(CATALOG.length, 115);
  assert.equal(Object.keys(FORM_TYPES).length, 47);
  assert.equal(new Set(CATALOG.map((e) => e.id)).size, 115, 'eindeutige Kennungen');
});

test('Flächenzahl jeder Form = Multiplizität nach ITA', () => {
  for (const e of CATALOG) {
    assert.equal(hklOrbit(latticeOps(e.pg), e.hkl).length, e.mult, e.id);
  }
});

test('jede Form ergibt einen geschlossenen Körper (Euler = 2), keine Hauptfläche geht verloren', () => {
  for (const e of CATALOG) {
    const sys = SYSTEM_OF[e.pg];
    const C = buildCrystal({ entryId: e.id, lat: LATTICE_DEFAULTS[sys], broken: false, auxDist: 1, presetId: null });
    assert.equal(C.lostMain, 0, `${e.id}: Flächen verloren`);
    assert.equal(euler(C.faces), 2, `${e.id}: Euler`);
    assert.ok(habitOf(C.faces), `${e.id}: Habitus`);
  }
});

test('reduzierte Formliste ohne Flächensymmetrie: 67 Formen', () => {
  const EIG_SAME = { '-62m': '-6m2', '-4m2': '-42m' };
  const norm = (s) => EIG_SAME[s] || s;
  const listed = CATALOG.filter((e) => {
    const g = groupOf(e.pg);
    return e.mult === buildPointGroup(g.id).order || norm(formEig(e)) === norm(g.hm);
  });
  assert.equal(listed.length, 67);
});

test('Flächenform der kubischen Formen passt zum Namen (Drei- bzw. Vierecke)', () => {
  // Tristetraeder und Trisoktaeder: Dreiecke; Deltoiddodekaeder und Deltoidikositetraeder: Vierecke (Deltoide).
  // Borchardt-Ott & Sowa, Tab. 9.7; in 4̄3m und m3̄m ist die Zuordnung zu {hhl} h<l bzw. h>l vertauscht.
  const ECKEN = { 33: 3, 34: 4, 35: 3, 38: 4, 39: 3, 40: 4, 42: 3, 43: 4, 45: 3, 46: 3, 47: 3 };
  let checked = 0;
  for (const e of CATALOG.filter((x) => ECKEN[x.type])) {
    const C = buildCrystal({ entryId: e.id, lat: LATTICE_DEFAULTS.kubisch, broken: false, auxDist: 1, presetId: null });
    const main = C.faces.filter((f) => f.role === 'main');
    assert.equal(main.length, e.mult, e.id);
    for (const f of main) assert.equal(f.verts.length, ECKEN[e.type], `${e.id} ${FORM_TYPES[e.type].name}`);
    checked++;
  }
  assert.ok(checked >= 15);
});

test('Kennungen aus v1.0.0 zeigen dieselbe Form (4̄3m)', () => {
  const byId = (id) => CATALOG.find((e) => e.id === id);
  assert.deepEqual(byId('-43m:c38').hkl, [1, 1, 2]);
  assert.equal(FORM_TYPES[byId('-43m:c38').type].name.split(' ')[0], 'Tristetraeder');
  assert.deepEqual(byId('-43m:c39').hkl, [2, 2, 1]);
  assert.equal(FORM_TYPES[byId('-43m:c39').type].name.split(' ')[0], 'Deltoiddodekaeder');
});

test('Zonen des Kristalls: mindestens drei Flächen, nach Symmetrie gruppiert', async () => {
  const { zonesOf } = await import('../js/polyhedra.js');
  const { EXAMPLES } = await import('../js/examples.js');
  const summary = (C) => zonesOf(C).map((c) => `${c.rep.join('')}:${c.zones.length}x${c.faces}`);
  const ex = EXAMPLES.find((e) => e.id === 'galenit');
  const galenit = buildCrystal({ groupId: ex.pg, forms: ex.forms, lat: LATTICE_DEFAULTS.kubisch, broken: false, auxDist: 1, presetId: '001' });
  // Borchardt-Ott & Sowa S. 36: (100) liegt in den Zonen [010], [001], [011], [01-1]
  assert.deepEqual(summary(galenit), ['100:3x8', '110:6x8', '111:4x6', '211:12x4']);
  const cube = buildCrystal({ entryId: 'm-3m:a34', lat: LATTICE_DEFAULTS.kubisch, broken: false, auxDist: 1, presetId: null });
  assert.deepEqual(summary(cube), ['100:3x4']);
  const tetra = buildCrystal({ entryId: '-43m:a33', lat: LATTICE_DEFAULTS.kubisch, broken: false, auxDist: 1, presetId: null });
  assert.deepEqual(summary(tetra), [], 'am Tetraeder liegen an jeder Kante nur zwei Flächen');
  // jede Zone enthält nur Flächen mit hu + kv + lw = 0
  for (const c of zonesOf(galenit)) for (const z of c.zones) for (const k of z.inZone) {
    const h = galenit.faces[k].hkl;
    assert.equal(h[0] * z.uvw[0] + h[1] * z.uvw[1] + h[2] * z.uvw[2], 0);
  }
  // Schlüssel der Zonen hängen nicht von der Lage ab (Auswahl bleibt beim Wechsel der Blickrichtung gültig)
  const { zoneByUvw, zoneKey } = await import('../js/polyhedra.js');
  const cube110 = buildCrystal({ entryId: 'm-3m:a34', lat: LATTICE_DEFAULTS.kubisch, broken: false, auxDist: 1, presetId: '110' });
  assert.equal(zoneByUvw(cube, [0, 0, 1]).key, '0,0,1');
  assert.equal(zoneByUvw(cube110, [0, 0, 1]).key, '0,0,1');
  assert.equal(zoneKey([0, 0, -2]), '0,0,1');
  assert.deepEqual(zonesOf(cube110)[0].zones.map((z) => z.key).sort(), zonesOf(cube)[0].zones.map((z) => z.key).sort());
});

test('Habitus: isometrisch nur bei L₃/L₁ ≥ 2/3; hexagonales Prisma je nach Abstand des Pinakoids', async () => {
  const { createState, applyHashTo, polyCrystal } = await import('../js/scene.js');
  const K = '#000';
  const col = new Proxy({ form: Array(8).fill(K), dir: [K, K, K] }, { get: (o, k) => (k in o ? o[k] : K) });
  const habit = (hash) => {
    const st = createState();
    applyHashTo(st, hash, createState());
    return habitOf(polyCrystal(st, col).faces.filter((f) => !f.hidden));
  };
  // Abb. 5.1–5.3 des Skripts
  assert.equal(habit('#m=form&sys=hexagonal&f=6/mmm:c25&abstand=0.3').type, 'planar');
  assert.equal(habit('#m=form&sys=hexagonal&f=6/mmm:c25&abstand=0.8').type, 'isometrisch');
  assert.equal(habit('#m=form&sys=hexagonal&f=6/mmm:c25&abstand=2.5').type, 'prismatisch');
  assert.equal(habit('#m=form&sys=kubisch&bsp=galenit').type, 'isometrisch');
  // L₂/L₁ und L₃/L₂ je ≥ 2/3, aber L₃/L₁ < 2/3: nicht mehr isometrisch
  const h = habit('#m=form&sys=orthorhombisch&f=mmm:a2');
  assert.ok(h.e >= 2 / 3 && h.p >= 2 / 3 && h.L[2] / h.L[0] < 2 / 3);
  assert.notEqual(h.type, 'isometrisch');
});
