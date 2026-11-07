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
import { entryById, CATALOG, formName } from '../js/forms.js';
import { PUNKTGRUPPEN } from '../js/punktgruppen.js';

const ANKER = [...readFileSync(new URL('../skript.html', import.meta.url), 'utf8').matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const DEFAULTS = createState();
// Aktionen, wie js/main.js sie an ablaufKarte gibt (main.js braucht das DOM und lässt sich hier nicht laden)
const AKTIONEN = [...(/const aktionen = \{([^}]*)\}/.exec(readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'))?.[1] ?? '')
  .matchAll(/(\w+):/g)].map((m) => m[1]);

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
  assert.equal(buildPointGroup('4mm').ops.length, 8, '4mm hat 8 Operationen');
  assert.equal(pole(adresse('lage', 0)), 8, 'allgemeine Lage');
  assert.equal(pole(adresse('lage', 1)), 4);
  assert.equal(pole(adresse('lage', 2)), 1);
  assert.equal(pole(adresse('drehinversion', 0)), 4);
  assert.equal(pole(adresse('drehinversion', 1)), 8);
  // 4̄: abwechselnd oben und unten
  { const s = zustand(adresse('drehinversion', 0)); const info = buildPointGroup(s.pg.id);
    const z = orbit(info.ops, generalPole(s)).map((o) => Math.sign(o.p[2]));
    assert.equal(z.filter((x) => x > 0).length, 2); assert.equal(z.filter((x) => x < 0).length, 2); }
  // 4/m: 8 Pole, je einer oben über einem unten (Spiegelbild an der Äquatorebene)
  { const s = zustand(adresse('drehinversion', 1)); const info = buildPointGroup(s.pg.id);
    const p = distinctPoles(orbit(info.ops, generalPole(s))).map((o) => o.p);
    assert.equal(p.length, 8);
    assert.ok(p.every((a) => p.some((b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] + b[2]) < 1e-9)), 'Paare oben/unten'); }
  assert.equal(PUNKTGRUPPEN.find((g) => g.id === zustand(adresse('laue', 0)).pg.id)?.laue, '4/m');
  // Formen: Lage der Pole und Flächenzahl
  /** @param {string} id @param {number} i */
  const eintrag = (id, i) => { const s = zustand(adresse(id, i)); return /** @type {import('../js/forms.js').Formeintrag} */ (entryById(s.poly.entryBySys[s.poly.system])); };
  /** Normalen der Form (tetragonal und kubisch: Indizes und Richtungen haben dieselben Vorzeichen). @param {import('../js/forms.js').Formeintrag} e */
  const flaechen = (e) => distinctPoles(orbit(buildPointGroup(e.pg).ops, /** @type {import('../lib/common/js/typen.js').Vec3} */ (e.hkl.map(Number)))).map((o) => o.p);
  const [prisma, pyramide, dipyramide] = [0, 1, 2].map((i) => eintrag('prisma', i));
  assert.deepEqual([prisma.pg, prisma.hkl.join('')], ['4/mmm', '100']);
  assert.ok(flaechen(prisma).every((p) => Math.abs(p[2]) < 1e-9), 'Prisma: alle Pole auf dem Grundkreis');
  assert.deepEqual([pyramide.pg, pyramide.hkl.join('')], ['4mm', '111']);
  assert.ok(flaechen(pyramide).every((p) => p[2] > 0), 'Pyramide {111}: alle Pole oben');
  assert.deepEqual([dipyramide.pg, dipyramide.hkl.join('')], ['4/mmm', '111']);
  { const p = flaechen(dipyramide);
    assert.equal(p.length, 8);
    assert.ok(p.every((a) => p.some((b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] + b[2]) < 1e-9)), 'Dipyramide: oben und unten, übereinander'); }
  const [f110, f111] = [0, 1].map((i) => eintrag('flaechenzahl', i));
  assert.deepEqual([f110.pg, [...f110.hkl].sort().join(''), f110.mult, formName(f110)], ['m-3m', '011', 12, 'Rhombendodekaeder']);
  assert.deepEqual([f111.pg, f111.hkl.join(''), f111.mult, formName(f111)], ['-43m', '111', 4, 'Tetraeder']);
  assert.equal(flaechen(f110).length, 12); assert.equal(flaechen(f111).length, 4);
  assert.equal(CATALOG.find((e) => e.id === 'm-3m:b35')?.mult, 8);
  // Prisma und Pyramide ohne Ergänzungsformen gezeigt (offen), damit nur ihre Pole erscheinen
  for (const i of [0, 1]) assert.ok(zustand(adresse('prisma', i)).poly.open);
});

test('Regler ρ reicht bis 0°, damit er einen Pol auf der Achse (z. B. rho=0 im Experiment) richtig anzeigt', () => {
  const r = /<input type="range" id="pg-theta" min="(\d+)"/.exec(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  assert.equal(r?.[1], '0');
  assert.equal(zustand(adresse('lage', 2)).pg.theta, 0);
});
