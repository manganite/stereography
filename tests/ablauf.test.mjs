// Erste Schritte und Lernexperimente (js/hilfetexte.js, lib/common/js/ablauf.js): Daten vollständig, jede
// Adresse übersteht die Prüfung der App unverändert, und die Aussagen der Beobachtungen stimmen mit der App.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAblaeufe } from '../lib/common/js/ablauf.js';
import { ABLAEUFE, ERSTE_SCHRITTE } from '../js/hilfetexte.js';
import { ERZEUGTE, POLZAHL, FLAECHENZAHL, POLZAHL_PARAMS, FLAECHENZAHL_PARAMS, polzahlDaten, ordnung, lage, FZ_KANDIDATEN, gezeigteForm, ortText } from '../js/experimente.js';
import { variante } from '../lib/common/js/ablauf.js';
import { createState, applyHashTo, hashOf, generalPole, polyCrystal, effectiveLat } from '../js/scene.js';
import { buildPointGroup, orbit, POINT_GROUPS, symmetryDirections } from '../js/pointgroups.js';
import { siteOf, distinctPoles } from '../js/sitesym.js';
import { entryById, CATALOG, formName } from '../js/forms.js';
import { wyckoffPositions, poleOfHKL } from '../js/sitesym.js';
import { SYSTEM_OF } from '../js/polyhedra.js';
import { PUNKTGRUPPEN } from '../js/punktgruppen.js';

const ANKER = [...readFileSync(new URL('../skript.html', import.meta.url), 'utf8').matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const DEFAULTS = createState();
// Farben ohne CSS (palette() liest sonst die CSS-Variablen der Seite)
const FARBEN = /** @type {import('../js/scene.js').Palette} */ (/** @type {unknown} */ (new Proxy(/** @type {Record<string | symbol, unknown>} */ ({ form: Array(8).fill('#000'), dir: ['#000', '#000', '#000'] }), { get: (o, k) => (k in o ? o[k] : '#000') })));
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
const adresse = (id, i) => /** @type {string} */ (ABLAEUFE.find((a) => a.id === id)?.schritte?.[i].handlung?.hash);
/** @param {string} h */
const zustand = (h) => { const s = createState(); applyHashTo(s, h, DEFAULTS); return s; };

test('Lernexperimente und Erste Schritte: Daten vollständig, Adressen gültig, Modi und Anker bekannt', () => {
  const o = { hashGueltig: gueltig, modi: ['pg', 'poly'], anker: ANKER, aktionen: AKTIONEN };
  assert.deepEqual(pruefeAblaeufe([...ABLAEUFE, ...ERZEUGTE], o), []);
  assert.deepEqual(pruefeAblaeufe(ERSTE_SCHRITTE, o), []);
  for (const m of ['pg', 'poly']) {
    assert.ok(ABLAEUFE.filter((a) => a.modus === m).length >= 2, m);
    const e = ERSTE_SCHRITTE.filter((a) => a.modus === m);
    assert.equal(e.length, 1, m);
    const sch = e[0].schritte ?? [];
    assert.ok(sch.length >= 3 && sch.length <= 4 && sch.every((s) => !s.vermutung), m);
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

test('Lernexperimente (#115): Aussagen der neuen Experimente stimmen mit der App', () => {
  /** Pole (Stellen und Halbkugel) zum allgemeinen Pol der Adresse. @param {string} h */
  const pole = (h) => { const s = zustand(h); return distinctPoles(orbit(buildPointGroup(s.pg.id).ops, generalPole(s))).map((o) => o.p); };
  /** @param {import('../lib/common/js/typen.js').Vec3[]} p */
  const obenUnten = (p) => [p.filter((v) => v[2] > 1e-9).length, p.filter((v) => v[2] < -1e-9).length];
  const ops = (/** @type {string} */ id) => buildPointGroup(id).ops;
  const det = (/** @type {number[][]} */ m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const spur = (/** @type {number[][]} */ m) => m[0][0] + m[1][1] + m[2][2];
  // 2/m: 4 Pole, darunter der Gegenpol des Ausgangspols (Inversion)
  { const h = adresse('inversion-2m', 0), p = pole(h), p0 = generalPole(zustand(h));
    assert.equal(p.length, 4);
    assert.ok(p.some((v) => Math.hypot(v[0] + p0[0], v[1] + p0[1], v[2] + p0[2]) < 1e-9), 'Gegenpol');
    assert.equal(ops('2/mc').length, 4); }
  // 6mm hat keine 2-zählige Achse senkrecht zu c, 32 hat drei; 3 und 3m sind Untergruppen von 6mm, 32 nicht
  {
    /** Drehungen um 180° um eine Achse in der Ebene. @param {string} id */
    const zweiInEbene = (id) => ops(id).filter((m) => det(m) > 0 && Math.abs(spur(m) + 1) < 1e-9 && Math.abs(m[2][2] + 1) < 1e-9).length;
    assert.equal(zustand(adresse('untergruppe', 0)).pg.id, '6mm'); assert.equal(zweiInEbene('6mm'), 0);
    assert.equal(zustand(adresse('untergruppe', 1)).pg.id, '321'); assert.equal(zweiInEbene('321'), 3);
    /** @param {string} a @param {string} b */
    const teil = (a, b) => ops(a).every((m) => ops(b).some((n) => m.every((z, i) => z.every((x, j) => Math.abs(x - n[i][j]) < 1e-9))));
    assert.ok(teil('3', '6mm') && teil('3m1', '6mm') && !teil('321', '6mm')); }
  // 222: zwei oben, zwei unten
  assert.deepEqual(obenUnten(pole(adresse('oben-unten-222', 0))), [2, 2]);
  // 3̄: 6 Pole, keine Spiegelung (Operation zweiter Art mit Spur 1); 3̄m: 12 Pole
  { const p = pole(adresse('dreiquer', 0)).sort((a, b) => Math.atan2(a[0], a[1]) - Math.atan2(b[0], b[1]));
    assert.equal(p.length, 6);
    assert.ok(p.every((v, i) => Math.sign(v[2]) !== Math.sign(p[(i + 1) % 6][2])), 'abwechselnd oben und unten');
    // das Polmuster (Stellen im Stereogramm mit oben/unten) ist spiegelsymmetrisch zur Ebene durch einen Pol und die Achse
    const phi = Math.atan2(p[0][1], p[0][0]), c = Math.cos(2 * phi), s2 = Math.sin(2 * phi);
    const gespiegelt = p.map((v) => [c * v[0] + s2 * v[1], s2 * v[0] - c * v[1], v[2]]);
    assert.ok(gespiegelt.every((g) => p.some((v) => Math.hypot(g[0] - v[0], g[1] - v[1], g[2] - v[2]) < 1e-9)), 'Muster spiegelsymmetrisch'); }
  assert.ok(!ops('-3').some((m) => det(m) < 0 && Math.abs(spur(m) - 1) < 1e-9), '3̄ ohne Spiegelung');
  assert.equal(pole(adresse('dreiquer', 1)).length, 12);
  // 432: 2. Blickrichtung ⟨111⟩ mit vier 3-zähligen Achsen; 1. und 3. ausgeblendet
  { const c = symmetryDirections(buildPointGroup('432'))[1];
    assert.deepEqual([c.label, c.hm, c.axes.length], ['⟨111⟩', '3', 4]);
    assert.deepEqual(zustand(adresse('symbol-432', 0)).pg.hideDirs, [0, 2]); }
  // Händigkeit: 422 nur Drehungen, 4/mmm halb
  assert.ok([0, 1, 2].every((i) => zustand(adresse('chiral', i)).pg.colorful));
  assert.deepEqual([0, 1, 2].map((i) => zustand(adresse('chiral', i)).pg.id), ['422', '432', '4/mmm']);
  assert.deepEqual([ops('432').length, ops('432').filter((m) => det(m) > 0).length], [24, 24]);
  assert.equal(ops('422').filter((m) => det(m) > 0).length, 8); assert.equal(ops('422').length, 8);
  assert.deepEqual([ops('4/mmm').length, ops('4/mmm').filter((m) => det(m) > 0).length], [16, 8]);
  // Formen
  /** @param {string} id @param {number} i */
  const eintrag = (id, i) => { const s = zustand(adresse(id, i)); return /** @type {import('../js/forms.js').Formeintrag} */ (entryById(s.poly.entryBySys[s.poly.system])); };
  { const s = zustand(adresse('lage-111', 0)), e = eintrag('lage-111', 0);
    assert.deepEqual([formName(e), s.poly.presetId, s.poly.frame], ['Würfel (Hexaeder)', '111', true]);
    const C = polyCrystal(s, FARBEN);
    const rho = C.faces.map((f) => (Math.acos(Math.abs(f.normal[2])) * 180) / Math.PI);
    assert.equal(C.faces.length, 6); assert.ok(rho.every((r) => Math.abs(r - 54.7356) < 1e-3), 'alle 54,7°');
    assert.deepEqual(obenUnten(C.faces.map((f) => f.normal)), [3, 3]);
    // 3-zählig um die Mitte: Drehung um 120° um die Projektionsrichtung bildet die Pole aufeinander ab
    const [c3, s3] = [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)];
    assert.ok(C.faces.every((f) => { const [x, y, z] = f.normal, r = [c3 * x - s3 * y, s3 * x + c3 * y, z];
      return C.faces.some((g) => Math.hypot(g.normal[0] - r[0], g.normal[1] - r[1], g.normal[2] - r[2]) < 1e-9); }), '3-zählig'); }
  { const [a, b] = [0, 1].map((i) => eintrag('flaechensymmetrie', i));
    assert.deepEqual([a.pg, formName(a), a.fs, b.pg, formName(b), b.fs], ['m-3m', 'Würfel (Hexaeder)', '4m.m', '23', 'Würfel (Hexaeder)', '2..']);
    assert.ok(zustand(adresse('flaechensymmetrie', 0)).poly.faceSym && zustand(adresse('flaechensymmetrie', 1)).poly.faceSym); }
  // Zonen am Galenit: [001] enthält {100} und {110} (je 4), [1̄10] enthält (001), (110), (111)
  { const C = polyCrystal(zustand(adresse('zone', 0)), FARBEN);
    /** @param {number[]} uvw */
    const inZone = (uvw) => C.faces.filter((f) => Math.abs(f.hkl[0] * uvw[0] + f.hkl[1] * uvw[1] + f.hkl[2] * uvw[2]) < 1e-9).map((f) => [...f.hkl].map(Math.abs).sort().join(''));
    assert.deepEqual(inZone([0, 0, 1]).sort(), ['001', '001', '001', '001', '011', '011', '011', '011']);
    const z2 = new Set(C.faces.filter((f) => f.hkl[0] === f.hkl[1]).map((f) => f.hkl.join(',')));
    for (const k of ['0,0,1', '1,1,0', '1,1,1']) assert.ok(z2.has(k), k);
    assert.deepEqual(zustand(adresse('zone', 1)).poly.zones, ['-1,1,0']); }
  // Quarz: Punktgruppe 32, zwei Rhomboeder gleich weit von der Mitte
  { const s = zustand(adresse('quarz', 0)), C = polyCrystal(s, FARBEN);
    assert.equal(C.groupId, '321');
    const oben = C.faces.filter((f) => f.normal[2] > 1e-9 && f.normal[2] < 1 - 1e-9);
    const rho = new Set(oben.map((f) => ((Math.acos(f.normal[2]) * 180) / Math.PI).toFixed(3)));
    assert.deepEqual([oben.length, rho.size], [6, 1], 'sechs Pole oben, gleiches ρ');
    const az = oben.map((f) => (Math.atan2(f.normal[0], f.normal[1]) * 180) / Math.PI).sort((a, b) => a - b);
    assert.ok(az.every((a, i) => Math.abs((((az[(i + 1) % 6] - a) % 360) + 360) % 360 - 60) < 1e-6), 'Abstand 60°'); }
  // Streckung: c/a ändert die Gruppe nicht; [100] → mmm; Würfel [111] → 3̄m
  assert.equal(polyCrystal(zustand(adresse('streckung', 0)), FARBEN).isReduced, false);
  {
    /** ρ der Pole der Dipyramide. @param {string} h */
    const rho = (h) => (Math.acos(Math.abs(polyCrystal(zustand(h), FARBEN).faces[0].normal[2])) * 180) / Math.PI;
    assert.ok(rho(adresse('streckung', 0)) > rho('#m=form&sys=tetragonal&f=4/mmm:e14') + 5, 'Pole rücken zum Grundkreis'); }
  { const l = effectiveLat(zustand(adresse('streckung', 1)));
    assert.equal(new Set([1, l.ba, l.ca].map((x) => x.toFixed(3))).size, 3, 'a, b, c verschieden lang'); }
  assert.equal(polyCrystal(zustand(adresse('streckung', 1)), FARBEN).reduced?.hm, 'mmm');
  assert.equal(polyCrystal(zustand(adresse('streckung', 2)), FARBEN).reduced?.hm, '-3m');
});

test('Regler ρ reicht bis 0°, damit er einen Pol auf der Achse (z. B. rho=0 im Experiment) richtig anzeigt', () => {
  const r = /<input type="range" id="pg-theta" min="(\d+)"/.exec(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  assert.equal(r?.[1], '0');
  assert.equal(zustand(adresse('lage', 2)).pg.theta, 0);
});

test('Erzeugte Experimente: Polzahl stimmt für jede Gruppe und Lage mit der App', () => {
  // jede Lage jeder Gruppe ab 4 Operationen kommt vor, ausser bei gleichem Wortlaut der Frage
  const alle = POINT_GROUPS.filter((g) => ordnung(g.id) >= 4).flatMap((g) => wyckoffPositions(g.id).map((w) => `${g.id}:${w.wy}`));
  const fragen = new Set(POLZAHL_PARAMS().map((p) => variante(POLZAHL, p).schritte[0].frage));
  for (const p of alle) assert.ok(fragen.has(variante(POLZAHL, p).schritte[0].frage), `${p} fehlt`);
  assert.equal(fragen.size, POLZAHL_PARAMS().length, 'keine zwei gleichen Fragen');
  for (const p of alle) {
    const d = polzahlDaten(p);
    const s = zustand(d.hash);
    assert.equal(s.pg.id, d.id, p);
    const info = buildPointGroup(s.pg.id);
    const site = siteOf(s.pg.id, info, generalPole(s));
    assert.equal(site.fs, d.fs, `${p}: Lagesymmetrie (orientiert)`);
    // die Frage nennt das Element, das die App an dieser Stelle zeigt
    const achse = d.achse;
    if (achse?.startsWith('-')) assert.match(ortText(d.fs, achse), new RegExp(`<span class="ov">${achse.slice(1)}</span>-Achse`), p);
    else if (achse) assert.match(ortText(d.fs, achse), new RegExp(`${achse}-zählige`), p);
    else assert.doesNotMatch(ortText(d.fs, achse), /Achse/, p);
    assert.equal(lage(d.fs).ordnung, site.stab.length, `${p}: Ordnung der Lagesymmetrie ${d.fs}`);
    assert.equal(distinctPoles(orbit(info.ops, site.p)).length, d.mult, `${p}: Zahl der Pole`);
    assert.equal(site.stab.length * d.mult, ordnung(d.id), `${p}: Pole mal Lagesymmetrie`);
    const sch = variante(POLZAHL, p).schritte[0];
    assert.equal(sch.vermutung?.[/** @type {number} */ (sch.richtig)], String(d.mult), p);
    assert.equal(new Set(sch.vermutung).size, sch.vermutung?.length, `${p}: Antworten verschieden`);
    assert.ok(sch.vermutung?.every((x) => Number(x) >= 1 && Number(x) <= d.n), `${p}: Antworten zwischen 1 und der Ordnung`);
  }
  // jede Art der Lage kommt vor
  const arten = new Set(POLZAHL_PARAMS().map((p) => lage(polzahlDaten(p).fs).symbol));
  for (const fs of ['1', 'm', '2', '3', '4', '6', 'mm2', '3m', '4mm', '6mm']) assert.ok(arten.has(fs), fs);
});

test('Erzeugte Experimente: Flächenzahl stimmt für jede Form mit dem Katalog und der Bahn', () => {
  // ausgelassen sind genau die Formen, die die App unter der Holoedrie als denselben Körper zeigt
  for (const e of FZ_KANDIDATEN()) {
    if (FLAECHENZAHL_PARAMS().includes(e.id)) continue;
    const g = /** @type {import('../js/forms.js').Formeintrag} */ (entryById(/** @type {string} */ (gezeigteForm(e))));
    // dieselbe Form in der Gruppe ihrer Eigensymmetrie; trigonal gibt es dort keine, die App zeigt die Vorgabe (#118)
    if (['321:b18', '-3m1:b25'].includes(e.id)) { assert.equal(g.id, '-3m1:c21', e.id); continue; }
    assert.deepEqual([g.mult, formName(g)], [e.mult, formName(e)], `${e.id} als ${g.id}`);
  }
  assert.ok(FLAECHENZAHL_PARAMS().length >= 40, `${FLAECHENZAHL_PARAMS().length} Parameter`);
  for (const id of FLAECHENZAHL_PARAMS()) {
    const sch = variante(FLAECHENZAHL, id).schritte[0];
    const s = zustand(/** @type {string} */ (sch.handlung?.hash));
    const e = /** @type {import('../js/forms.js').Formeintrag} */ (entryById(s.poly.entryBySys[s.poly.system]));
    assert.equal(e.id, id, 'die Adresse zeigt diese Form');
    const n = distinctPoles(orbit(buildPointGroup(e.pg).ops, poleOfHKL(SYSTEM_OF[e.pg], e.hkl))).length;
    assert.equal(n, e.mult, `${id}: Bahn der Normalen`);
    assert.equal(sch.vermutung?.[/** @type {number} */ (sch.richtig)], String(e.mult), id);
    assert.equal(lage(e.fs).ordnung * e.mult, ordnung(e.pg), `${id}: Flächensymmetrie mal Flächenzahl`);
    assert.equal(new Set(sch.vermutung).size, sch.vermutung?.length, `${id}: Antworten verschieden`);
    assert.ok(sch.vermutung?.every((x) => Number(x) >= 1 && Number(x) <= ordnung(e.pg)), `${id}: Antworten zwischen 1 und der Ordnung`);
  }
});

