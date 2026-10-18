// Punktgruppen: Ordnungen und Zuordnung der Symmetrieelemente zu den Blickrichtungen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POINT_GROUPS, buildPointGroup, symmetryDirections } from '../js/pointgroups.js';

// Gruppenordnung je Punktgruppe (Hermann-Mauguin-Kurzsymbol), ITA Vol. A Tab. 10.1.2.2
const ORDER = {
  '1': 1, '-1': 2, '2': 2, 'm': 2, '2/m': 4, '222': 4, 'mm2': 4, 'mmm': 8,
  '4': 4, '-4': 4, '4/m': 8, '422': 8, '4mm': 8, '-42m': 8, '-4m2': 8, '4/mmm': 16,
  '3': 3, '-3': 6, '32': 6, '321': 6, '312': 6, '3m': 6, '3m1': 6, '31m': 6, '-3m': 12, '-3m1': 12, '-31m': 12,
  '6': 6, '-6': 6, '6/m': 12, '622': 12, '6mm': 12, '-6m2': 12, '-62m': 12, '6/mmm': 24,
  '23': 12, 'm-3': 24, '432': 24, '-43m': 24, 'm-3m': 48,
};

test('40 Einträge: 32 Punktgruppen mit ITA-Aufstellungen', () => {
  assert.equal(POINT_GROUPS.length, 40);
  assert.equal(new Set(POINT_GROUPS.map((g) => g.hm)).size >= 32, true);
});

test('Gruppenordnung jeder Punktgruppe', () => {
  for (const g of POINT_GROUPS) {
    assert.equal(buildPointGroup(g.id).order, ORDER[g.hm], `${g.id} (${g.hm})`);
  }
});

test('Symmetrieelemente passen zu den Positionen des vollen Symbols', () => {
  for (const g of POINT_GROUPS) {
    if (g.system === 'triklin') continue;
    const info = buildPointGroup(g.id);
    const classes = symmetryDirections(info);
    for (const c of classes) {
      const p = c.hm;
      if (!p || p === '1') {
        assert.equal(c.axes.length + c.mirrors.length, 0, `${g.id}: Position ${c.pos} sollte leer sein`);
        continue;
      }
      const wantMirror = p.includes('m') || p === '-6';
      assert.equal(c.mirrors.length > 0, wantMirror, `${g.id}: Spiegelebenen an Position ${c.pos} (${p})`);
      const ax = p === 'm' ? null : p.replace('/m', '');
      const syms = new Set(c.axes.map((a) => a.symbol));
      if (ax) assert.ok(syms.has(ax), `${g.id}: Achse ${ax} an Position ${c.pos}, gefunden ${[...syms]}`);
    }
  }
});

test('Polar und piezoelektrisch: 10 bzw. 20 der 32 Punktgruppen', () => {
  // je Kurzsymbol eine Aufstellung (32 Punktgruppen)
  const seen = new Map();
  const ALT = new Set(['-4m2', '-62m']); // zweite Aufstellung mit eigenem Kurzsymbol
  for (const g of POINT_GROUPS) if (!ALT.has(g.id) && !seen.has(g.hm)) seen.set(g.hm, buildPointGroup(g.id));
  const groups = [...seen.values()];
  assert.equal(groups.length, 32);
  const POLAR = ['1', '2', '3', '4', '6', 'm', 'mm2', '3m', '4mm', '6mm'];
  assert.deepEqual(groups.filter((i) => i.polar).map((i) => i.hm).sort(), POLAR.sort());
  const piezo = groups.filter((i) => i.piezo).map((i) => i.hm);
  assert.equal(piezo.length, 20);
  assert.deepEqual(groups.filter((i) => !i.centro && !i.piezo).map((i) => i.hm), ['432']);
  assert.ok(groups.every((i) => !(i.centro && i.piezo)), 'zentrosymmetrisch ⇒ nicht piezoelektrisch');
  // jede polare Gruppe ist piezoelektrisch; Quarz (32) ist piezoelektrisch, aber nicht polar
  assert.ok(groups.every((i) => !i.polar || i.piezo));
  const q = seen.get('32');
  assert.equal(q.piezo, true);
  assert.equal(q.polar, false);
});
