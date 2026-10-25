// Quiz: Aufbau der Fragen, Bezug zum Skript, nachgerechnete Antworten, erzeugte Fragen, Ablauf, Moodle-Export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BANK } from '../js/quiz-bank.js';
import { GENERATOREN, GERUEST, GERUEST_ALLE, GERUEST_STUFE1 } from '../js/quiz-gen.js';
import {
  KAPITEL, kandidaten, zaehlen, ziehen, stellen, pruefen, rng, GEN_ANTEIL,
  leererFortschritt, fortschrittAus, vermerken, stand,
} from '../js/quiz-core.js';
import { createState, applyHashTo, stereoForHash, stateForHash } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';
import { groupById, POINT_GROUPS, buildPointGroup, orbit, symmetryDirections, latticeToCart } from '../js/pointgroups.js';
import { CATALOG } from '../js/forms.js';
import { poleOfHKL } from '../js/sitesym.js';
import { hmHTML } from '../js/format.js';
import { moodleXML } from '../tools/moodle-export.mjs';

const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
const K = '#336699';
const col = new Proxy({ form: Array(8).fill(K), dir: [K, K, K] }, { get: (o, k) => (k in o ? o[k] : K) });
const svg = (hash) => buildSVG(stereoForHash(hash, col).scene).inner;
const text = (h) => h.replace(/<span class="ov">([^<]*)<\/span>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Indizes aus „[0<span class="ov">1</span>1]“ bzw. „(112)“ → [0, -1, 1]. */
function idx(h) {
  const s = h.replace(/<span class="ov">(\d)<\/span>/g, '-$1').replace(/[[\]()]/g, '');
  const m = s.match(/^-?\d(-?\d)(-?\d)$/);
  assert.ok(m, `keine Indizes: ${h}`);
  return [...s.matchAll(/-?\d/g)].map((x) => Number(x[0]));
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const parallel = (a, b) => cross(a, b).every((x) => x === 0) && a.some((x) => x !== 0);
const norm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const winkel = (a, b) => (Math.acos(Math.max(-1, Math.min(1, dot(norm(a), norm(b))))) * 180) / Math.PI;
const parallelF = (a, b) => Math.abs(Math.abs(dot(norm(a), norm(b))) - 1) < 1e-9;
/** Alle Richtungen [uvw] in einem Antworttext. */
const richtungen = (h) => [...h.replace(/<span class="ov">(\d)<\/span>/g, '-$1').matchAll(/\[(-?\d)(-?\d)(-?\d)\]/g)].map((m) => [1, 2, 3].map((k) => Number(m[k])));
const hex = latticeToCart('hexagonal');
// Bild eines Pols unter einer Abbildung (Beschreibung wie in quiz-bank.js)
const BILD = { z: ([x, y, z]) => [x, y, -z], xyz: ([x, y, z]) => [-x, -y, -z], xy: ([x, y, z]) => [-x, -y, z] };
const P0 = norm([0.31, 0.52, 0.79]);
const nah = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);

/** Abschnitt des Skripts zu einem Anker: Kapitel (Nummer) und ob er (oder ein umgebender) eine Vertiefung ist. */
function abschnitt(anker) {
  const i = skript.indexOf(`<section id="${anker}"`);
  if (i < 0) return null;
  // Kapitel: letzte Kapitelüberschrift <h2 …><span class="nr">n</span> vor dem Anker
  const vor = skript.slice(0, i + 400);
  const nrs = [...vor.matchAll(/<h2[^>]*><span class="nr">(\d+)<\/span>/g)];
  const kapitel = Number(nrs[nrs.length - 1][1]);
  // Vertiefung: offene <section … data-level="vertiefung"> vor dem Anker
  const stack = [];
  for (const m of skript.slice(0, i + 1).matchAll(/<(\/?)section\b([^>]*)>/g)) {
    if (m[1]) stack.pop(); else stack.push(m[2].includes('data-level="vertiefung"'));
  }
  const vertiefung = stack.some(Boolean) || skript.slice(i, i + 200).includes('data-level="vertiefung"');
  return { kapitel, vertiefung };
}

/** Lernziele und Zusammenfassungen eines Kapitels als Text. */
function zieleUndZusammenfassung(nr) {
  const k = KAPITEL.find((x) => x.nr === nr);
  const a = skript.indexOf(`<section id="${k.anker}"`);
  const next = KAPITEL.find((x) => x.nr === nr + 1);
  const b = next ? skript.indexOf(`<section id="${next.anker}"`) : skript.length;
  const kap = skript.slice(a, b);
  const boxes = [...kap.matchAll(/<div class="box (?:ziele|zusammen)">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
  return boxes.flatMap((bx) => [...bx.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => text(m[1])));
}

const TYPEN = ['einfach', 'mehrfach', 'bild-text', 'text-bild'];

test('Fragen: Pflichtfelder, eindeutige IDs, gültige Werte', () => {
  const ids = new Set();
  for (const q of BANK) {
    assert.ok(!ids.has(q.id), `doppelte ID ${q.id}`);
    ids.add(q.id);
    assert.ok([1, 2, 3].includes(q.stufe), q.id);
    assert.ok(KAPITEL.some((k) => k.nr === q.kapitel), q.id);
    assert.ok(TYPEN.includes(q.typ), q.id);
    assert.ok(['entwurf', 'geprüft'].includes(q.status), q.id);
    for (const f of ['frage', 'lernziel', 'erklaerung', 'skript', 'quelle']) assert.ok(typeof q[f] === 'string' && q[f].length > 2, `${q.id}: ${f}`);
    assert.ok(q.antworten.length >= 3 && q.antworten.length <= 6, q.id);
    assert.equal(q.typ === 'bild-text', !!q.bild, `${q.id}: Bild genau bei „bild-text“`);
  }
});

test('Fragen: richtige Antworten, keine doppelten Antworten, Hinweise zu jeder falschen Antwort', () => {
  for (const q of BANK) {
    assert.ok(q.richtig.length >= 1 && q.richtig.every((i) => Number.isInteger(i) && i >= 0 && i < q.antworten.length), q.id);
    if (q.typ === 'mehrfach') assert.ok(q.richtig.length < q.antworten.length, `${q.id}: nicht alle Antworten richtig`);
    else assert.equal(q.richtig.length, 1, `${q.id}: genau eine richtige Antwort`);
    const keys = q.antworten.map((a) => (typeof a === 'string' ? text(a.replace(/<span class="ov">/g, '‾')) : a.app));
    assert.equal(new Set(keys).size, keys.length, `${q.id}: doppelte Antwort`);
    assert.equal(q.hinweise.length, q.antworten.length, q.id);
    q.hinweise.forEach((h, i) => {
      if (q.richtig.includes(i)) assert.equal(h, null, `${q.id}: Hinweis bei richtiger Antwort ${i}`);
      else assert.ok(typeof h === 'string' && h.length > 10, `${q.id}: Hinweis zu Antwort ${i} fehlt`);
    });
  }
});

test('Fragen: Lernziel steht wörtlich in Lernzielen oder Zusammenfassung des Kapitels', () => {
  for (const q of BANK) {
    const liste = zieleUndZusammenfassung(q.kapitel);
    assert.ok(liste.includes(text(q.lernziel)), `${q.id}: „${q.lernziel}“ nicht in Kap. ${q.kapitel}`);
  }
  const g = GERUEST.make('mmm');
  assert.ok(zieleUndZusammenfassung(GERUEST.kapitel).includes(g.lernziel));
});

test('Fragen: Skript-Anker im richtigen Kapitel; Stufe 1 und 2 verweisen nicht auf Vertiefungen', () => {
  // Probe der Erkennung
  assert.deepEqual(abschnitt('hkil'), { kapitel: 7, vertiefung: true });
  assert.deepEqual(abschnitt('multiplizitaet'), { kapitel: 8, vertiefung: true });
  assert.deepEqual(abschnitt('zonengleichung'), { kapitel: 4, vertiefung: false });
  for (const k of KAPITEL) assert.ok(skript.includes(`<section id="${k.anker}"`), k.anker);
  const alle = [...BANK, ...GERUEST_ALLE.map((id) => ({ id: `gen:${id}`, ...GERUEST.make(id), kapitel: GERUEST.kapitel, stufe: GERUEST_STUFE1.includes(id) ? 1 : 2 }))];
  for (const q of alle) {
    const a = abschnitt(q.skript);
    assert.ok(a, `${q.id}: Anker #${q.skript} fehlt im Skript`);
    assert.equal(a.kapitel, q.kapitel, `${q.id}: #${q.skript} liegt in Kap. ${a.kapitel}`);
    if (q.stufe < 3) assert.ok(!a.vertiefung, `${q.id}: Stufe ${q.stufe} verweist auf eine Vertiefung (#${q.skript})`);
  }
});

test('Fragen: Ansichten der App sind gültig und ergeben Stereogramme', () => {
  for (const q of BANK) {
    const hashes = [q.app, q.bild, ...(q.typ === 'text-bild' ? q.antworten.map((a) => a.app) : [])].filter(Boolean);
    for (const h of hashes) {
      assert.ok(applyHashTo(createState(), h, createState()), `${q.id}: kein gültiger Link ${h}`);
      assert.match(svg(h), /<circle/, `${q.id}: ${h}`);
    }
    if (q.typ === 'text-bild') {
      const bilder = q.antworten.map((a) => svg(a.app));
      assert.equal(new Set(bilder).size, bilder.length, `${q.id}: zwei Antwortbilder sind gleich`);
    }
  }
});

test('Fragen: nachgerechnete Antworten (Zonenachsen, Zonengleichung, Lage eines Pols)', () => {
  let n = 0;
  for (const q of BANK.filter((x) => x.pruefung)) {
    const p = q.pruefung;
    n += 1;
    if (p.art === 'zonenachse') {
      const c = cross(...p.flaechen);
      assert.ok(parallel(c, p.achse), `${q.id}: Kreuzprodukt ${c} ∦ ${p.achse}`);
      for (const f of p.flaechen) assert.equal(dot(f, p.achse), 0, q.id);
      q.antworten.forEach((a, i) => {
        const r = q.richtig.includes(i);
        assert.equal(parallel(idx(a), c), r, `${q.id}: Antwort ${text(a)} ${r ? 'sollte' : 'darf nicht'} die Zonenachse sein`);
      });
      // Bild: die markierte Zone ist diese Zonenachse
      if (q.bild) assert.ok(stateForHash(q.bild).poly.zones.some((z) => parallel(z.split(',').map(Number), c)), q.id);
    } else if (p.art === 'zonengleichung') {
      assert.equal(dot(p.flaeche, p.achse) === 0, p.gehoert, q.id);
      assert.ok(text(q.antworten[q.richtig[0]]).startsWith(p.gehoert ? 'Ja' : 'Nein'), q.id);
    } else if (p.art === 'inZone') {
      const soll = p.achsen.map((a, i) => (dot(p.flaeche, a) === 0 ? i : -1)).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
      p.achsen.forEach((a, i) => assert.deepEqual(idx(q.antworten[i]), a, q.id));
    } else if (p.art === 'pol') {
      const st = stateForHash(q.antworten[q.richtig[0]].app);
      const rho = st.pg.theta > 90 ? st.pg.theta - 180 : st.pg.theta;
      assert.ok(Math.abs(rho - p.rho) < 1e-9 && Math.abs(st.pg.phi - p.phi) < 1e-9, q.id);
      // die übrigen Bilder zeigen einen anderen Pol
      for (const [i, a] of q.antworten.entries()) {
        if (q.richtig.includes(i)) continue;
        const s2 = stateForHash(a.app);
        assert.ok(s2.pg.theta !== st.pg.theta || s2.pg.phi !== st.pg.phi, q.id);
      }
    } else if (p.art === 'flaechenzahl') {
      const f = CATALOG.find((e) => e.id === p.form);
      assert.ok(f, `${q.id}: Form ${p.form} fehlt`);
      assert.equal(f.mult, p.anzahl, q.id);
      assert.equal(buildPointGroup(f.pg).ops.length, p.ordnung, q.id);
      if (/^\d+$/.test(text(q.antworten[q.richtig[0]]))) assert.equal(text(q.antworten[q.richtig[0]]), String(p.anzahl), q.id);
    } else if (p.art === 'abbildung') {
      const orb = orbit(buildPointGroup(p.gruppe).ops, P0).map((o) => o.p ?? o);
      assert.equal(orb.length, 2, q.id);
      assert.ok(orb.some((x) => nah(x, BILD[p.bild](P0))), `${q.id}: Bild nicht in der Bahn`);
    } else if (p.art === 'erzeugt') {
      const info = buildPointGroup(p.gruppe);
      assert.ok(info.axes.some((a) => a.symbol === p.achse && info.mirrors.filter((m) => Math.abs(dot(m, a.dir)) < 1e-9).length >= 2), q.id);
    } else if (p.art === 'bahn') {
      for (const [g, [oben, unten]] of Object.entries(p.gruppen)) {
        const orb = orbit(buildPointGroup(g).ops, P0).map((o) => o.p ?? o);
        assert.deepEqual([orb.filter((x) => x[2] > 0).length, orb.filter((x) => x[2] < 0).length], [oben, unten], `${q.id}: ${g}`);
      }
    } else if (p.art === 'lage') {
      const pol = poleOfHKL(p.system, p.hkl);
      assert.ok(buildPointGroup(p.gruppe).axes.some((a) => a.symbol === p.achse && parallelF(a.dir, pol)), q.id);
    } else if (p.art === 'gleichesBild') {
      assert.equal(svg(p.hashes[0]), svg(p.hashes[1]), q.id);
    } else if (p.art === 'blickrichtungen') {
      const labels = symmetryDirections(buildPointGroup(p.gruppe)).filter((c) => c.hm && c.hm !== '1').map((c) => c.label);
      const r0 = text(q.antworten[q.richtig[0]]);
      let pos = -1;
      for (const l of labels) { const k = r0.indexOf(l, pos + 1); assert.ok(k > pos, `${q.id}: ${l} fehlt oder steht falsch in „${r0}“`); pos = k; }
      q.antworten.forEach((a, i) => { if (!q.richtig.includes(i)) assert.notEqual(text(a), labels.join(', '), q.id); });
    } else if (p.art === 'position') {
      const c = symmetryDirections(buildPointGroup(p.gruppe))[p.nr - 1];
      assert.deepEqual([c.label, c.hm], [p.richtung, p.symbol], q.id);
    } else if (p.art === 'symbol') {
      const g = groupById(p.gruppe);
      assert.equal(g.full, p.voll, q.id);
      assert.equal(text(q.antworten[q.richtig[0]]), g.hm, q.id);
    } else if (p.art === 'kubischesSymbol') {
      for (const g of POINT_GROUPS) assert.equal(g.system === 'kubisch', ['3', '-3'].includes(g.full.split(' ')[1]), g.id);
    } else if (p.art === 'hexAchsen') {
      const ist120 = (ds) => ds.length === 3 && [[0, 1], [0, 2], [1, 2]].every(([i, j]) => Math.abs(winkel(hex(ds[i]), hex(ds[j])) - 120) < 1e-9);
      q.antworten.forEach((a, i) => assert.equal(ist120(richtungen(a)), q.richtig.includes(i), `${q.id}: ${text(a)}`));
    } else if (p.art === 'hexSenkrecht') {
      q.antworten.forEach((a, i) => assert.equal(Math.abs(dot(hex(idx(a)), hex(p.zu))) < 1e-9, q.richtig.includes(i), `${q.id}: ${text(a)}`));
    } else if (p.art === 'hexMitte') {
      const mitte = (d) => Math.abs(winkel(hex(d), hex(p.a)) - 60) < 1e-9 && Math.abs(winkel(hex(d), hex(p.b)) - 60) < 1e-9;
      q.antworten.forEach((a, i) => assert.equal(mitte(idx(a)), q.richtig.includes(i), `${q.id}: ${text(a)}`));
    } else if (p.art === 'hexPol') {
      assert.ok(parallelF(poleOfHKL('hexagonal', p.hkl), hex(p.richtung)), q.id);
      assert.ok(Math.abs(poleOfHKL('hexagonal', p.hkl)[2]) < 1e-9, `${q.id}: Pol nicht auf dem Grundkreis`);
    } else assert.fail(`${q.id}: unbekannte Prüfung ${p.art}`);
  }
  assert.ok(n >= 15);
});

test('Generator Symmetriegerüst: alle 32 Punktgruppen, Ablenker mit anderem Symbol und anderem Gerüst', () => {
  assert.equal(GERUEST_ALLE.length, 32);
  assert.equal(new Set(GERUEST_ALLE.map((id) => groupById(id).hm)).size, 32, 'jedes HM-Symbol einmal');
  const p1 = GERUEST.params(1), p2 = GERUEST.params(2);
  assert.deepEqual([...p1, ...p2].sort(), [...GERUEST_ALLE].sort(), 'Stufe 1 und 2 zusammen alle 32, ohne Überschneidung');
  for (const id of GERUEST_ALLE) {
    const q = GERUEST.make(id);
    assert.equal(q.antworten.length, 4, id);
    assert.equal(q.antworten[q.richtig[0]], hmHTML(groupById(id).hm), id);
    assert.equal(new Set(q.antworten).size, 4, `${id}: doppelte Antwort`);
    // jedes Ablenker-Gerüst sieht anders aus als das gezeigte
    const bild = svg(q.bild);
    for (const a of q.antworten.slice(1)) {
      const g = GERUEST_ALLE.map(groupById).find((x) => hmHTML(x.hm) === a);
      assert.notEqual(svg(`#m=pg&g=${encodeURIComponent(g.id)}&obj=0&farbe=0`), bild, `${id}: Ablenker ${g.hm} hat dasselbe Gerüst`);
    }
    assert.match(q.erklaerung, /Kristallsystem/, id);
  }
});

test('Ablauf: Stufe, Kapitel, Anzahl und Höchstanteil eines Generators', () => {
  const kands = kandidaten(BANK, GENERATOREN, { entwurf: true });
  const n = zaehlen(kands);
  assert.ok(n[1][1] >= 8 && n[4][1] >= 8);
  assert.equal(n[3][1], GERUEST_STUFE1.length + BANK.filter((q) => q.kapitel === 3 && q.stufe === 1).length);
  for (let seed = 1; seed <= 30; seed++) {
    const r = rng(seed);
    const z = ziehen(kands, { stufe: 1, n: 10, rand: r });
    assert.equal(z.length, 10);
    assert.equal(new Set(z.map((k) => k.key)).size, 10, 'keine Frage doppelt');
    assert.ok(z.every((k) => k.stufe === 1));
    assert.ok(z.filter((k) => k.gen).length <= Math.round(10 * GEN_ANTEIL));
    const z4 = ziehen(kands, { stufe: 1, kapitel: [4], n: 20, rand: r });
    assert.ok(z4.length === n[4][1] && z4.every((k) => k.kapitel === 4));
  }
  // ohne Freigabe (status 'geprüft') erscheint nichts
  assert.equal(kandidaten(BANK.map((q) => ({ ...q, status: 'entwurf' })), [], {}).length, 0);
  // Wiederholen: genau die angegebenen Fragen
  const nur = ['zon-1-05', 'proj-1-03', `${GERUEST.id}:mmm`];
  assert.deepEqual(ziehen(kands, { stufe: 3, n: 3, nur, rand: rng(3) }).map((k) => k.key).sort(), [...nur].sort());
});

test('Ablauf: gemischte Antworten behalten die richtige Lösung; Auswertung', () => {
  const kands = kandidaten(BANK, GENERATOREN, { entwurf: true });
  for (const [s, k] of kands.entries()) {
    const q0 = k.frage || GERUEST.make(k.param);
    const q = stellen(k, rng(s + 1));
    const richtig0 = q0.richtig.map((i) => JSON.stringify(q0.antworten[i])).sort();
    assert.deepEqual(q.richtig.map((i) => JSON.stringify(q.antworten[i])).sort(), richtig0, k.key);
    assert.ok(pruefen(q, q.richtig));
    assert.ok(!pruefen(q, [...q.richtig, ...[0, 1, 2, 3].filter((i) => !q.richtig.includes(i)).slice(0, 1)]), `${k.key}: zusätzliche falsche Antwort`);
    if (q.richtig.length > 1) assert.ok(!pruefen(q, q.richtig.slice(1)), `${k.key}: unvollständig`);
    if (q.hinweise) q.richtig.forEach((i) => assert.equal(q.hinweise[i], null, k.key));
  }
});

test('Fortschritt: vermerken, Stand je Kapitel, unbrauchbarer Speicher', () => {
  const kands = kandidaten(BANK, [], { entwurf: true });
  const p = leererFortschritt();
  vermerken(p, 'zon-1-05', true);
  vermerken(p, 'zon-1-06', true);
  vermerken(p, 'zon-1-06', false);
  assert.deepEqual({ n: p.fragen['zon-1-06'].n, r: p.fragen['zon-1-06'].r, letzte: p.fragen['zon-1-06'].letzte }, { n: 2, r: 1, letzte: 0 });
  assert.equal(stand(kands, p)[4].richtig, 1);
  for (const t of [null, '', 'x', '{"v":2}', '[]']) assert.deepEqual(fortschrittAus(t), leererFortschritt());
  assert.deepEqual(fortschrittAus(JSON.stringify(p)), p);
  // zuletzt falsch beantwortete Fragen kommen vor richtig beantworteten an die Reihe
  const p2 = leererFortschritt();
  for (const q of BANK.filter((x) => x.kapitel === 4)) vermerken(p2, q.id, q.id !== 'zon-1-07');
  const z = ziehen(kands, { stufe: 1, kapitel: [4], n: 1, progress: p2, rand: rng(9) });
  assert.equal(z[0].key, 'zon-1-07');
});

test('Moodle-Export: Kategorien, Bruchteile, eingebettete Bilder, nur geprüfte Fragen', () => {
  assert.equal(moodleXML().anzahl, BANK.filter((q) => q.status === 'geprüft').length
    + (GERUEST.status === 'geprüft' ? 32 : 0));
  const { xml, anzahl } = moodleXML({ entwurf: true });
  assert.equal(anzahl, BANK.length + 32);
  const qs = xml.split('<question type="multichoice">').slice(1);
  assert.equal(qs.length, anzahl);
  for (const q of qs) {
    const fr = [...q.matchAll(/<answer fraction="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    assert.ok(Math.abs(fr.filter((x) => x > 0).reduce((s, x) => s + x, 0) - 100) < 0.01, q.slice(0, 80));
    for (const m of q.matchAll(/@@PLUGINFILE@@\/([\w.]+)/g)) assert.ok(q.includes(`<file name="${m[1]}"`), `Datei ${m[1]} fehlt`);
    assert.ok(!q.includes('class="ov"'), 'Querstrich nicht umgesetzt');
  }
  assert.ok(xml.includes('$course$/top/Stereographische Projektion/Kap. 4 Zonen/Stufe 1'));
  // wohlgeformt genug: Tags ausgeglichen
  for (const t of ['question', 'answer', 'text', 'file']) assert.equal((xml.match(new RegExp(`<${t}[ >]`, 'g')) || []).length, (xml.match(new RegExp(`</${t}>`, 'g')) || []).length, t);
});

test('Seite: Links aus dem Quiz ins Skript und in die App öffnen einen neuen Tab', () => {
  const js = readFileSync(new URL('../js/quiz.js', import.meta.url), 'utf8');
  const links = [...js.matchAll(/<a href="(?:skript|index)\.html[^>]*>/g)].map((m) => m[0]);
  assert.ok(links.length >= 3);
  for (const a of links) assert.match(a, /target="_blank" rel="noopener"/, a);
  // laufendes Quiz: gesichert nach Start, Auswahl, Antwort und Weiter; gelöscht mit der Auswertung
  assert.ok((js.match(/laufSichern\(\);/g) || []).length >= 4);
  assert.match(js, /laufLoeschen\(\);\s*ansicht\('ende'\)/);
});
