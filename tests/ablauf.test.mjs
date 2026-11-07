// Erste Schritte und Lernexperimente (js/hilfetexte.js, lib/common/js/ablauf.js): Daten vollständig, jede
// Adresse übersteht die Prüfung der App unverändert, und die Aussagen der Beobachtungen stimmen mit der App.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAblaeufe } from '../lib/common/js/ablauf.js';
import { ABLAEUFE, ERSTE_SCHRITTE } from '../js/hilfetexte.js';
import { createState, applyHashTo, hashOf, generalPole } from '../js/scene.js';
import { buildPointGroup, orbit } from '../js/pointgroups.js';
import { siteOf, distinctPoles } from '../js/sitesym.js';
import { entryById, CATALOG } from '../js/forms.js';
import { PUNKTGRUPPEN } from '../js/punktgruppen.js';

const ANKER = [...readFileSync(new URL('../skript.html', import.meta.url), 'utf8').matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const DEFAULTS = createState();
const AKTIONEN = ['pg1', 'pg2', 'pg3', 'pg4', 'poly1', 'poly2', 'poly3', 'poly4'];

/** Adresse auf den Startzustand anwenden; gültig, wenn jede Angabe wieder genau so geschrieben wird. @param {string} h */
function gueltig(h) {
  const s = createState();
  if (!applyHashTo(s, h, DEFAULTS)) return false;
  const neu = new URLSearchParams(hashOf(s, DEFAULTS).slice(1));
  return [...new URLSearchParams(h.slice(1))].every(([k, v]) => neu.get(k) === v);
}
/** @param {string} id @param {number} i */
const adresse = (id, i) => /** @type {string} */ (ABLAEUFE.find((a) => a.id === id)?.schritte[i].handlung?.hash);
/** @param {string} h */
const zustand = (h) => { const s = createState(); applyHashTo(s, h, DEFAULTS); return s; };

test('Lernexperimente und Erste Schritte: Daten vollständig, Adressen gültig, Modi und Anker bekannt', () => {
  const o = { hashGueltig: gueltig, modi: ['pg', 'poly'], anker: ANKER, aktionen: AKTIONEN };
  assert.deepEqual(pruefeAblaeufe(ABLAEUFE, o), []);
  assert.deepEqual(pruefeAblaeufe(ERSTE_SCHRITTE, o), []);
  for (const m of ['pg', 'poly']) {
    assert.ok(ABLAEUFE.filter((a) => a.modus === m).length >= 2, m);
    const e = ERSTE_SCHRITTE.filter((a) => a.modus === m);
    assert.equal(e.length, 1, m);
    assert.ok(e[0].schritte.length >= 3 && e[0].schritte.length <= 4 && e[0].schritte.every((s) => !s.vermutung), m);
  }
});

test('Lernexperimente: Beobachtungen stimmen mit der App', () => {
  /** Zahl der gezeichneten Pole (Stellen) zur Adresse. @param {string} h */
  const pole = (h) => {
    const s = zustand(h); const info = buildPointGroup(s.pg.id);
    return distinctPoles(orbit(info.ops, siteOf(s.pg.id, info, generalPole(s)).p)).length;
  };
  assert.equal(pole(adresse('lage', 0)), 4);
  assert.equal(pole(adresse('lage', 1)), 1);
  assert.equal(pole(adresse('drehinversion', 0)), 4);
  assert.equal(pole(adresse('drehinversion', 1)), 8);
  // 4̄: abwechselnd oben und unten
  { const s = zustand(adresse('drehinversion', 0)); const info = buildPointGroup(s.pg.id);
    const z = orbit(info.ops, generalPole(s)).map((o) => Math.sign(o.p[2]));
    assert.equal(z.filter((x) => x > 0).length, 2); assert.equal(z.filter((x) => x < 0).length, 2); }
  assert.equal(PUNKTGRUPPEN.find((g) => g.id === zustand(adresse('laue', 0)).pg.id)?.laue, '4/m');
  // Formen: Lage der Pole und Flächenzahl
  /** @param {string} id @param {number} i */
  const eintrag = (id, i) => { const s = zustand(adresse(id, i)); return /** @type {import('../js/forms.js').Formeintrag} */ (entryById(s.poly.entryBySys[s.poly.system])); };
  assert.equal(eintrag('prisma', 0).hkl[2], 0, 'Prisma: l = 0, Pole auf dem Grundkreis');
  assert.match(eintrag('prisma', 1).pg, /^4mm$/); assert.ok(eintrag('prisma', 1).hkl[2] > 0, 'Pyramide');
  assert.equal(eintrag('prisma', 2).pg, '4/mmm');
  assert.equal(eintrag('flaechenzahl', 0).mult, 12);
  assert.equal(eintrag('flaechenzahl', 1).mult, 4);
  assert.equal(CATALOG.find((e) => e.id === 'm-3m:b35')?.mult, 8);
  // Prisma und Pyramide ohne Ergänzungsformen gezeigt (offen), damit nur ihre Pole erscheinen
  for (const i of [0, 1]) assert.ok(zustand(adresse('prisma', i)).poly.open);
});
