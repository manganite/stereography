// Datendatei js/punktgruppen.js (#75): jede Zeile eine Punktgruppe, die symcrys kennt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PUNKTGRUPPEN, SYSTEMS } from '../js/punktgruppen.js';
import { POINT_GROUPS, buildPointGroup } from '../js/pointgroups.js';

test('jede Zeile ist in symcrys bekannt, Kennungen eindeutig, System bekannt', () => {
  assert.equal(POINT_GROUPS.length, PUNKTGRUPPEN.length);
  assert.equal(new Set(PUNKTGRUPPEN.map((z) => z.id)).size, PUNKTGRUPPEN.length);
  for (const g of POINT_GROUPS) {
    assert.ok(buildPointGroup(g.id).ops.length >= 1, g.id);
    assert.ok(SYSTEMS.includes(g.system), g.id);
  }
});

test('32 Punktgruppen, dazu die zweiten Aufstellungen', () => {
  // ohne zweite Aufstellung (setting 'Achse c' und die B-Aufstellungen 312, 31m, -31m, -4m2, -62m)
  const zweite = new Set(['2c', 'mc', '2/mc', '312', '31m', '-31m', '-4m2', '-62m']);
  assert.equal(PUNKTGRUPPEN.filter((z) => !zweite.has(z.id)).length, 32);
});
