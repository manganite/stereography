// Datendatei js/aufstellungen.js (#75): stimmt mit der Liste der Punktgruppen überein.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILIEN, AUFSTELLUNG_TIPPS, MONO_ACHSE_TIPPS, AUFSTELLUNG_AB } from '../js/aufstellungen.js';
import { POINT_GROUPS, SYSTEMS, SYSTEM_NAMEN } from '../js/pointgroups.js';

test('Aufstellungen: zwei bekannte Punktgruppen je Familie, Tooltip und A/B für jede', () => {
  const ids = new Set(POINT_GROUPS.map((g) => g.id));
  const alle = Object.values(FAMILIEN).flat();
  assert.equal(new Set(alle).size, alle.length, 'jede Aufstellung in nur einer Familie');
  for (const [fam, [a, b, ...rest]] of Object.entries(FAMILIEN)) {
    assert.equal(rest.length, 0, fam);
    for (const id of [a, b]) {
      assert.ok(ids.has(id), `${fam}: ${id} unbekannt`);
      assert.ok(typeof AUFSTELLUNG_TIPPS[id] === 'string' && AUFSTELLUNG_TIPPS[id].endsWith('.'), `${id}: Tooltip`);
    }
    // erste Aufstellung A, zweite B (Skript Kap. 5)
    assert.deepEqual([AUFSTELLUNG_AB[a], AUFSTELLUNG_AB[b]], ['A', 'B'], fam);
  }
  assert.deepEqual(Object.keys(AUFSTELLUNG_TIPPS).sort(), [...alle].sort());
  assert.deepEqual(Object.keys(AUFSTELLUNG_AB).sort(), [...alle].sort());
  assert.deepEqual(Object.keys(MONO_ACHSE_TIPPS), ['b', 'c']);
});

test('Namen der Kristallsysteme: einer je System, in derselben Reihenfolge', () => {
  assert.deepEqual(Object.keys(SYSTEM_NAMEN), SYSTEMS);
  for (const s of SYSTEMS) assert.equal(SYSTEM_NAMEN[s], s[0].toUpperCase() + s.slice(1));
});
