// Datendatei js/punktgruppen.js (#75): passt zu den Erzeugenden in js/pointgroups.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PUNKTGRUPPEN, SYSTEMS } from '../js/punktgruppen.js';
import { POINT_GROUPS } from '../js/pointgroups.js';

test('jede Zeile hat Erzeugende, Kennungen eindeutig, System bekannt', () => {
  assert.equal(POINT_GROUPS.length, PUNKTGRUPPEN.length);
  assert.equal(new Set(PUNKTGRUPPEN.map((z) => z.id)).size, PUNKTGRUPPEN.length);
  for (const g of POINT_GROUPS) {
    assert.equal(typeof g.gens, 'function', g.id);
    assert.ok(Array.isArray(g.gens()), g.id);
    assert.ok(SYSTEMS.includes(g.system), g.id);
  }
});

test('32 Punktgruppen, dazu die zweiten Aufstellungen', () => {
  // ohne zweite Aufstellung (setting 'Achse c' und die B-Aufstellungen 312, 31m, -31m, -4m2, -62m)
  const zweite = new Set(['2c', 'mc', '2/mc', '312', '31m', '-31m', '-4m2', '-62m']);
  assert.equal(PUNKTGRUPPEN.filter((z) => !zweite.has(z.id)).length, 32);
});
