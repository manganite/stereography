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
  }
  // Aufstellung A und B wie in der Tabelle im Skript (Kap. 5, Aufstellungen A und B)
  /** @type {Record<string, string>} */
  const SKRIPT = { 321: 'A', 312: 'B', '3m1': 'A', '31m': 'B', '-3m1': 'A', '-31m': 'B', '-42m': 'A', '-4m2': 'B', '-6m2': 'A', '-62m': 'B' };
  assert.deepEqual(AUFSTELLUNG_AB, SKRIPT);
  for (const [a, b] of Object.values(FAMILIEN)) assert.deepEqual([SKRIPT[a], SKRIPT[b]], ['A', 'B'], 'Button der Familie zeigt zuerst Aufstellung A');
  assert.deepEqual(Object.keys(AUFSTELLUNG_TIPPS).sort(), [...alle].sort());
  assert.deepEqual(Object.keys(AUFSTELLUNG_AB).sort(), [...alle].sort());
  assert.deepEqual(Object.keys(MONO_ACHSE_TIPPS), ['b', 'c']);
});

test('Namen der Kristallsysteme: einer je System, in derselben Reihenfolge', () => {
  assert.deepEqual(Object.keys(SYSTEM_NAMEN), SYSTEMS);
  assert.deepEqual(Object.values(SYSTEM_NAMEN), ['Triklin', 'Monoklin', 'Orthorhombisch', 'Tetragonal', 'Trigonal', 'Hexagonal', 'Kubisch']);
});
