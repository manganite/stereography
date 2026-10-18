// Beispielkristalle: alle Formen treten auf, Körper geschlossen, Angaben vollständig.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLES } from '../js/examples.js';
import { POINT_GROUPS } from '../js/pointgroups.js';
import { buildCrystal, LATTICE_DEFAULTS, SYSTEM_OF, habitOf, auxFormName } from '../js/polyhedra.js';

test('Beispiele: eindeutige Kennung, gültige Punktgruppe, Quelle', () => {
  assert.equal(new Set(EXAMPLES.map((x) => x.id)).size, EXAMPLES.length);
  for (const ex of EXAMPLES) {
    assert.ok(POINT_GROUPS.some((g) => g.id === ex.pg), `${ex.id}: Punktgruppe ${ex.pg}`);
    assert.equal(SYSTEM_OF[ex.pg], ex.sys, `${ex.id}: System`);
    assert.ok(ex.src && ex.src.length > 10, `${ex.id}: Quelle`);
    for (const f of ex.forms) assert.ok((f.r != null) !== (f.t != null), `${ex.id}: genau r oder t`);
  }
});

test('Beispiele: geschlossen ohne Ergänzungsformen, jede Form mit allen Flächen sichtbar und benannt', () => {
  for (const ex of EXAMPLES) {
    const lat = { ...LATTICE_DEFAULTS[ex.sys], ...(ex.lat || {}) };
    const C = buildCrystal({ groupId: ex.pg, forms: ex.forms, lat, broken: false, auxDist: 1, presetId: null });
    assert.equal(C.auxForms.length, 0, `${ex.id}: Ergänzungsformen nötig`);
    assert.equal(C.forms.length, ex.forms.length, `${ex.id}: doppelte Form`);
    C.forms.forEach((F, i) => {
      assert.equal(F.present, F.hkls.length, `${ex.id}: Form ${i} nur ${F.present}/${F.hkls.length} Flächen`);
      assert.ok(auxFormName(ex.pg, F.hkls), `${ex.id}: Form ${i} ohne Namen`);
    });
    assert.ok(habitOf(C.faces), `${ex.id}: Habitus`);
  }
});
