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
