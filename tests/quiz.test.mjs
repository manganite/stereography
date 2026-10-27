// Quiz: Aufbau der Fragen, Bezug zum Skript, nachgerechnete Antworten, erzeugte Fragen, Ablauf, Moodle-Export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BANK } from '../js/quiz-bank.js';
import {
  GENERATOREN, GERUEST, GERUEST_ALLE, GERUEST_STUFE1, FLAECHENZAHL, FLAECHENSYM,
  KOERPER, KOERPER_STEREO, LAGE, LAGE_MUSTER, GERUEST3D, GERUEST3D_OHNE,
} from '../js/quiz-gen.js';
import { istRaum, appHash, raumInner, raumSVG } from '../js/bild3d.js';
import {
  KAPITEL, kandidaten, zaehlen, ziehen, stellen, pruefen, rng, GEN_ANTEIL, GEN_GESAMT,
  leererFortschritt, fortschrittAus, vermerken, stand,
} from '../js/quiz-core.js';
import { createState, applyHashTo, stereoForHash, stateForHash, currentEntryId } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';
import { groupById, POINT_GROUPS, buildPointGroup, orbit, symmetryDirections, latticeToCart } from '../js/pointgroups.js';
import { CATALOG, formEig } from '../js/forms.js';
import { poleOfHKL, stabilizer } from '../js/sitesym.js';
import { hmHTML } from '../js/format.js';
import { moodleXML } from '../tools/moodle-export.mjs';
import { project, C as SC, R as SR } from '../js/stereogram.js';
import { latticeFromParams, LATTICE_DEFAULTS, orientationPresets, orientationMatrix, identifyGroup } from '../js/polyhedra.js';
import { inverse, transpose, mulVec, mul, matEq, neg, I3, vecEq } from '../js/linalg.js';

const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
const K = '#336699';
const col = new Proxy({ form: Array(8).fill(K), dir: [K, K, K] }, { get: (o, k) => (k in o ? o[k] : K) });
/** Abbildung einer Bildangabe wie im Quiz: räumliche Zeichnung ("3d#…") oder Stereogramm. */
const svg = (hash) => (istRaum(hash) ? raumInner(hash, col) : buildSVG(stereoForHash(hash, col).scene).inner);
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
const BILD = { z: ([x, y, z]) => [x, y, -z], xyz: ([x, y, z]) => [-x, -y, -z], xy: ([x, y, z]) => [-x, -y, z], y: ([x, y, z]) => [-x, y, -z] };
const P0 = norm([0.31, 0.52, 0.79]);
const nah = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
// Metrik der App (Startwerte je System): Richtung [uvw] und Flächennormale (hkl) kartesisch
const gitter = (sys) => latticeFromParams(LATTICE_DEFAULTS[sys]);
const richtungK = (sys, uvw) => norm(mulVec(gitter(sys), uvw));
const normaleK = (sys, hkl) => norm(mulVec(transpose(inverse(gitter(sys))), hkl));
/** φ und ρ eines Einheitsvektors, abgelesen am Bildpunkt der App (φ ab rechts im Uhrzeigersinn, ρ < 0 unten). */
function phiRho(p) {
  const b = project(norm(p));
  const dx = (b.x - SC) / SR, dy = (b.y - SC) / SR;
  const phi = (((Math.atan2(dy, dx) * 180) / Math.PI) % 360 + 360) % 360;
  return { phi, rho: ((2 * Math.atan(Math.hypot(dx, dy)) * 180) / Math.PI) * (b.upper ? 1 : -1), b };
}
/** Einheitsvektor aus φ und ρ (Konventionen wie oben). */
function ausPhiRho(phi, rho) {
  const t = ((rho >= 0 ? rho : 180 + rho) * Math.PI) / 180, f = (phi * Math.PI) / 180;
  return [Math.sin(t) * Math.sin(f), Math.sin(t) * Math.cos(f), Math.cos(t)];
}
const zahl = (s) => Number(s.replace('−', '-').replace(',', '.'));
/** „φ = 210°, ρ = −40°“ → { phi, rho } */
function phiRhoText(h) {
  const m = text(h).match(/φ = (−?[\d,]+)°, ρ = (−?[\d,]+)°/);
  assert.ok(m, `keine Winkelkoordinaten: ${text(h)}`);
  return { phi: zahl(m[1]), rho: zahl(m[2]) };
}
/** Alle Flächen (hkl) in einem Antworttext. */
const flaechenIn = (h) => [...h.replace(/<span class="ov">(\d)<\/span>/g, '-$1').matchAll(/\((-?\d)(-?\d)(-?\d)\)/g)].map((m) => [1, 2, 3].map((k) => Number(m[k])));
const gleich = (a, b) => a.every((x, i) => x === b[i]);
/** Operationen von m3̄m, die eine Richtung als Gerade (pfeil = false) bzw. als Pfeil (pfeil = true) erhalten. */
function rest(richtung, pfeil) {
  const n = norm(richtung);
  return buildPointGroup('m-3m').ops.filter((W) => { const v = mulVec(W, n); return vecEq(v, n) || (!pfeil && vecEq(v, n.map((x) => -x))); });
}
/** Bahnen einer Menge von Einheitsvektoren unter Operationen (Grössen, sortiert). */
function bahnen(punkte, ops) {
  const rest0 = [...punkte], gr = [];
  while (rest0.length) {
    const p = rest0.shift();
    const bild = ops.map((W) => mulVec(W, p));
    const n0 = rest0.length;
    for (let i = rest0.length - 1; i >= 0; i--) if (bild.some((b) => vecEq(b, rest0[i]))) rest0.splice(i, 1);
    gr.push(1 + n0 - rest0.length);
  }
  return gr.sort((a, b) => a - b);
}
/** Text mit Querstrichen (‾3 statt 3), damit 3̄m und 3m verschieden bleiben. */
const tq = (h) => text(h.replace(/<span class="ov">/g, '‾'));
const eindeutig = (vs) => vs.filter((v, i) => vs.findIndex((w) => vecEq(v, w)) === i);

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

const TYPEN = ['einfach', 'mehrfach', 'bild-text', 'text-bild', 'bild-bild'];
const BILDANTWORT = ['text-bild', 'bild-bild'];

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
    assert.equal(q.typ.startsWith('bild-'), !!q.bild, `${q.id}: Bild genau bei „bild-text“ und „bild-bild“`);
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
  assert.deepEqual(abschnitt('hkil'), { kapitel: 9, vertiefung: true });
  assert.deepEqual(abschnitt('multiplizitaet'), { kapitel: 10, vertiefung: true });
  assert.deepEqual(abschnitt('zonengleichung'), { kapitel: 7, vertiefung: false });
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
    pruefeBilder(q);
  }
});

/** Bildangaben einer Frage: gültige Links der App, ohne Ersatz der Form, Antwortbilder verschieden. */
function pruefeBilder(q) {
  const hashes = [q.app, q.bild, ...(BILDANTWORT.includes(q.typ) ? q.antworten.map((a) => a.app) : [])].filter(Boolean);
  assert.ok(!istRaum(q.app), `${q.id}: „In der App öffnen“ braucht eine Link-Adresse der App`);
  for (const h of hashes) {
    const a = appHash(h);
    assert.ok(applyHashTo(createState(), a, createState()), `${q.id}: kein gültiger Link ${h}`);
    // eine verlinkte Form wird ohne Ersatz gezeigt (sonst zeigte das Bild eine andere Form als die Frage meint)
    const f = new URLSearchParams(a.slice(1)).get('f');
    if (f) assert.equal(currentEntryId(stateForHash(a)), f, `${q.id}: ${h} zeigt eine andere Form`);
    assert.match(svg(h), istRaum(h) ? /<path/ : /<circle/, `${q.id}: ${h}`);
  }
  if (BILDANTWORT.includes(q.typ)) {
    const bilder = q.antworten.map((a) => svg(a.app));
    assert.equal(new Set(bilder).size, bilder.length, `${q.id}: zwei Antwortbilder sind gleich`);
  }
}

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
      // mit Metrik: Die Richtung liegt in der Fläche (steht senkrecht auf ihrer Normalen)
      if (p.system) assert.equal(Math.abs(dot(richtungK(p.system, p.achse), normaleK(p.system, p.flaeche))) < 1e-9, p.gehoert, q.id);
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
      // Stereogramme als Antworten: Antwort i zeigt die i-te Gruppe, die richtige ist p.soll
      // (Gruppen als Liste von Paaren, wenn die Reihenfolge zählt: Objektschlüssel wie '4' sortiert JS um)
      const paare = Array.isArray(p.gruppen) ? p.gruppen : Object.entries(p.gruppen);
      if (q.typ === 'text-bild') {
        assert.deepEqual(q.antworten.map((x) => new URLSearchParams(x.app.slice(1)).get('g')), paare.map(([g]) => g), q.id);
        assert.equal(paare[q.richtig[0]][0], p.soll, q.id);
      }
      for (const [g, [oben, unten]] of paare) {
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
    } else if (p.art === 'hexFamilie') {
      const c = symmetryDirections(buildPointGroup(p.gruppe))[p.position - 1];
      assert.ok(c.dirs.some((d) => parallelF(d, hex(p.richtung))), `${q.id}: ${p.richtung} nicht in ${c.label}`);
    } else if (p.art === 'zoneUndFlaeche') {
      const c = cross(...p.flaechen);
      assert.ok(parallel(c, p.achse), q.id);
      const gehoert = dot(p.flaeche, c) === 0;
      q.antworten.forEach((a, i) => {
        const r = parallel(richtungen(a)[0], c) && /gehört nicht/.test(text(a)) !== gehoert;
        assert.equal(r, q.richtig.includes(i), `${q.id}: ${text(a)}`);
      });
    } else if (p.art === 'schnitt') {
      const f = cross(...p.zonen);
      assert.ok(parallel(f, p.flaeche), q.id);
      q.antworten.forEach((a, i) => {
        const fl = flaechenIn(a);
        const r = fl.length === 2 && fl.some((x) => gleich(x, p.flaeche)) && fl.some((x) => gleich(x, p.flaeche.map((y) => -y)));
        assert.equal(r, q.richtig.includes(i), `${q.id}: ${text(a)}`);
      });
    } else if (p.art === 'zonenpol') {
      const soll = p.faelle.map(([sys, u], i) => (parallelF(richtungK(sys, u), normaleK(sys, u)) ? i : -1)).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
      p.faelle.forEach(([sys, u], i) => assert.ok(text(q.antworten[i]).startsWith(`${sys}: [${u.join('')}] und (${u.join('')})`), q.id));
    } else if (p.art === 'zonenzahl') {
      const n = p.achsen.filter((a) => dot(a, p.flaeche) === 0).length;
      assert.equal(text(q.antworten[q.richtig[0]]), String(n), q.id);
    } else if (p.art === 'zonenbild') {
      q.antworten.forEach((a, i) => {
        const z = stateForHash(a.app).poly.zones.map((k) => k.split(',').map(Number));
        assert.equal(z.length, 1, q.id);
        assert.equal(parallel(z[0], p.achse), q.richtig.includes(i), `${q.id}: ${a.app}`);
      });
    } else if (p.art === 'phirho') {
      const v = p.hkl ? normaleK('kubisch', p.hkl) : ausPhiRho(p.gegen.phi, p.gegen.rho).map((x) => -x);
      if (p.gegen) { const g = phiRho(ausPhiRho(p.gegen.phi, p.gegen.rho)); assert.ok(Math.abs(g.phi - p.gegen.phi) < 1e-6 && Math.abs(g.rho - p.gegen.rho) < 1e-6, q.id); }
      const soll = phiRho(v);
      q.antworten.forEach((a, i) => {
        const t = phiRhoText(a);
        const r = Math.abs(t.phi - soll.phi) < 0.01 && Math.abs(t.rho - soll.rho) < 0.01;
        assert.equal(r, q.richtig.includes(i), `${q.id}: ${text(a)} (soll φ = ${soll.phi}, ρ = ${soll.rho})`);
      });
    } else if (p.art === 'polHKL') {
      const soll = phiRho(normaleK('kubisch', p.hkl));
      q.antworten.forEach((a, i) => {
        const st = stateForHash(a.app);
        const rho = st.pg.theta > 90 ? st.pg.theta - 180 : st.pg.theta;
        const r = Math.abs(rho - soll.rho) < 0.01 && Math.abs(st.pg.phi - soll.phi) < 0.01;
        assert.equal(r, q.richtig.includes(i), `${q.id}: ${a.app} (soll φ = ${soll.phi}, ρ = ${soll.rho})`);
      });
    } else if (p.art === 'radius') {
      const rho = (2 * Math.atan(p.r) * 180) / Math.PI;
      const b = phiRho(ausPhiRho(0, rho)).b;
      assert.ok(Math.abs(Math.hypot(b.x - SC, b.y - SC) / SR - p.r) < 1e-9, q.id);
      assert.ok(text(q.antworten[q.richtig[0]]).includes(`${Math.round(rho)}°`), q.id);
    } else if (p.art === 'deckung') {
      // Pol (hkl) und Pol (hkl̄) am selben Ort, nicht auf dem Grundkreis; (hkl̄) ist am Galenit eine Fläche
      const galenit = ['001', '011', '111'];
      const soll = p.flaechen.map((f, i) => {
        const g = [f[0], f[1], -f[2]];
        const a = project(norm(f)), b = project(norm(g));
        const deckt = !a.onPrimitive && Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9 && a.upper !== b.upper;
        return deckt && galenit.includes(g.map(Math.abs).sort().join('')) ? i : -1;
      }).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
      p.flaechen.forEach((f, i) => assert.deepEqual(flaechenIn(q.antworten[i])[0], f, q.id));
    } else if (p.art === 'grundkreis') {
      const O = orientationMatrix(gitter('kubisch'), orientationPresets('kubisch').find((x) => x.id === p.lage));
      const soll = p.flaechen.map((f, i) => (Math.abs(mulVec(O, normaleK('kubisch', f))[2]) < 1e-9 ? i : -1)).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
      p.flaechen.forEach((f, i) => assert.deepEqual(flaechenIn(q.antworten[i])[0], f, q.id));
      assert.equal(stateForHash(q.app).poly.presetId, p.lage, q.id);
    } else if (p.art === 'winkel') {
      const w = winkel(normaleK('kubisch', p.a), normaleK('kubisch', p.b));
      q.antworten.forEach((a, i) => assert.equal(Math.abs(zahl(text(a).replace('°', '')) - w) < 0.005, q.richtig.includes(i), `${q.id}: ${text(a)} (soll ${w})`));
    } else if (p.art === 'gleicherOrt') {
      const [a, b] = p.rhos.map((r) => phiRho(ausPhiRho(p.phi, r)).b);
      assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9 && a.upper !== b.upper, q.id);
      assert.ok(a.x > SC && Math.abs(a.y - SC) < 1e-9, `${q.id}: φ = 0° liegt rechts`);
    } else if (p.art === 'flaechen') {
      // Flächenzahl = Ordnung / Zahl der Operationen, die den Pol festhalten; allgemein: keine ausser der Identität
      const info = buildPointGroup(p.gruppe);
      const pol = poleOfHKL(p.system, p.hkl);
      const st = stabilizer(info.ops, pol).length;
      assert.equal(info.ops.length / st, p.anzahl, `${q.id}: Flächenzahl`);
      assert.equal(st === 1, p.allgemein, `${q.id}: allgemein/speziell`);
      if (p.aufAchse === false) {
        assert.ok(!info.axes.some((a) => parallelF(a.dir, pol)), `${q.id}: Pol auf einer Achse`);
        assert.ok(info.mirrors.some((m) => Math.abs(dot(m, pol)) < 1e-9), `${q.id}: Pol auf keiner Spiegelebene`);
      }
      const zahl0 = text(q.antworten[q.richtig[0]]).match(/\d+(?= Flächen|$| \()/);
      if (zahl0) assert.equal(Number(zahl0[0]), p.anzahl, `${q.id}: Zahl in der richtigen Antwort`);
      const t0 = text(q.antworten[q.richtig[0]]);
      if (/allgemein|speziell/i.test(t0)) assert.equal(/allgemein/i.test(t0), p.allgemein, `${q.id}: ${t0}`);
    } else if (p.art === 'ordnungen' && p.nurOrdnung) {
      assert.equal(buildPointGroup(p.gruppen[0]).ops.length, p.anzahl, q.id);
    } else if (p.art === 'ordnungen') {
      const soll = p.gruppen.map((g, i) => (buildPointGroup(g).ops.length === p.anzahl ? i : -1)).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
      p.gruppen.forEach((g, i) => assert.equal(text(q.antworten[i]), text(hmHTML(groupById(g).hm)), q.id));
    } else if (p.art === 'drehung') {
      // Drehung um die Achse: Der Winkel des Pols zur Achse bleibt gleich (Kleinkreis), er ist nicht 90°
      const a = norm(p.achse), v = norm(p.pol);
      const w0 = winkel(a, v);
      for (const t of [30, 77, 150, 260]) {
        const c = Math.cos((t * Math.PI) / 180), sn = Math.sin((t * Math.PI) / 180);
        const axv = cross(a, v), ad = dot(a, v);
        const r = [0, 1, 2].map((k) => v[k] * c + axv[k] * sn + a[k] * ad * (1 - c));
        assert.ok(Math.abs(winkel(a, r) - w0) < 1e-9, q.id);
      }
      assert.ok(Math.abs(w0 - 90) > 1, `${q.id}: Grosskreis`);
      assert.ok(text(q.erklaerung).includes(`${w0.toFixed(2).replace('.', ',')}°`), `${q.id}: ${w0}`);
    } else if (p.art === 'bahnStellen') {
      const orb = orbit(buildPointGroup(p.gruppe).ops, P0).map((o) => o.p ?? o);
      const stellen = new Set(orb.map((x) => { const b = project(x); return `${b.x.toFixed(6)},${b.y.toFixed(6)}`; }));
      assert.deepEqual([orb.filter((x) => x[2] > 0).length, orb.filter((x) => x[2] < 0).length, stellen.size], [p.oben, p.unten, p.stellen], q.id);
      assert.ok(text(q.antworten[q.richtig[0]]).startsWith(['', 'Eine', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs'][p.stellen]), q.id);
    } else if (p.art === 'zentrum') {
      // Drehung um 180° und Spiegelung senkrecht dazu ergeben die Inversion
      const op = (g) => buildPointGroup(g).ops.find((m) => !matEq(m, I3()));
      assert.ok(matEq(mul(op(p.spiegel), op(p.achse)), neg(I3())), q.id);
    } else if (p.art === 'vollSymbol' || p.art === 'kurzSymbol') {
      const g = groupById(p.gruppe);
      const t = (h) => text(h.replace(/<span class="ov">/g, '‾')).replace(/\s+/g, '');
      const soll = (p.art === 'vollSymbol' ? g.full : g.hm).replace(/-(\d)/g, '‾$1').replace(/\s+/g, '');
      q.antworten.forEach((a, i) => assert.equal(t(a) === soll, q.richtig.includes(i), `${q.id}: ${t(a)} gegen ${soll}`));
    } else if (p.art === 'elemente') {
      const info = buildPointGroup(p.gruppe);
      const soll = p.faelle.map(([art, sym, d], i) => {
        const v = norm(d);
        const da = art === 'achse' ? info.axes.some((a) => a.symbol === sym && parallelF(a.dir, v)) : info.mirrors.some((m) => parallelF(m, v));
        return da ? i : -1;
      }).filter((i) => i >= 0);
      assert.deepEqual(q.richtig, soll, q.id);
    } else if (p.art === 'hexFamilieMehr') {
      const c = symmetryDirections(buildPointGroup(p.gruppe))[p.position - 1];
      q.antworten.forEach((a, i) => assert.equal(c.dirs.some((d) => parallelF(d, hex(idx(a)))), q.richtig.includes(i), `${q.id}: ${text(a)}`));
    } else if (p.art === 'wachstum') {
      // Würfel {100} im Abstand d₁, Oktaeder {111} im Abstand d₂: Oktaederflächen gibt es, solange d₂/d₁ < √3,
      // Würfelflächen, solange d₂/d₁ > 1/√3 (Ecke (d₁, d₁, d₁) bzw. Spitze √3·d₂ auf der Achse)
      const [d1, d2] = p.abstand, [v1, v2] = p.geschwindigkeit;
      const r = (t) => (d2 + v2 * t) / (d1 + v1 * t);
      assert.ok(r(0) > 1 / Math.sqrt(3) && r(0) < Math.sqrt(3), `${q.id}: anfangs beide Formen`);
      assert.ok(v2 / v1 > Math.sqrt(3), `${q.id}: Oktaederflächen verschwinden nicht`);
      const t = (Math.sqrt(3) * d1 - d2) / (v2 - Math.sqrt(3) * v1);
      assert.ok(t > 0 && Math.abs(r(t) - Math.sqrt(3)) < 1e-9, q.id);
      assert.match(text(q.antworten[q.richtig[0]]), /verschwinden/, q.id);
    } else if (p.art === 'lagesym') {
      const info = buildPointGroup(p.gruppe);
      const v = norm(latticeToCart(p.system)(p.richtung));
      const st = stabilizer(info.ops, v).map((i) => info.ops[i]);
      assert.equal(identifyGroup(st).hm, p.symbol, q.id);
      assert.equal(tq(q.antworten[q.richtig[0]]), tq(hmHTML(p.symbol)), q.id);
    } else if (p.art === 'katalog') {
      const e = CATALOG.find((x) => x.id === p.form);
      assert.equal(e.fs, p.fs, q.id);
      const info = buildPointGroup(e.pg);
      assert.equal(info.ops.length / stabilizer(info.ops, poleOfHKL(groupById(e.pg).system, e.hkl)).length, e.mult, q.id);
      assert.equal(tq(q.antworten[q.richtig[0]]), tq(hmHTML(p.fs)), q.id);
    } else if (p.art === 'richtungszahl') {
      const ops = buildPointGroup(p.gruppe).ops, n = norm(p.richtung);
      const st = ops.filter((W) => { const v = mulVec(W, n); return vecEq(v, n) || (p.gerade && vecEq(v, n.map((x) => -x))); });
      assert.equal(ops.length / st.length, p.anzahl, q.id);
      assert.equal(tq(q.antworten[q.richtig[0]]), String(p.anzahl), q.id);
    } else if (p.art === 'wyckoff') {
      p.formen.forEach((id, i) => { const e = CATALOG.find((x) => x.id === id); assert.equal(e.wy, p.lagen[i], `${q.id}: ${id}`); assert.equal(e.mult, p.anzahl, q.id); });
    } else if (p.art === 'eigen') {
      assert.equal(formEig(CATALOG.find((x) => x.id === p.form)), p.eig, q.id);
      assert.ok(tq(q.antworten[q.richtig[0]]).endsWith(tq(hmHTML(p.eig))), q.id);
    } else if (p.art === 'restgruppe') {
      assert.equal(identifyGroup(rest(p.richtung, p.pfeil)).hm, groupById(p.gruppe).hm, q.id);
      assert.equal(tq(q.antworten[q.richtig[0]]), tq(hmHTML(groupById(p.gruppe).hm)), q.id);
    } else if (p.art === 'zerfall') {
      const pole = eindeutig(buildPointGroup('m-3m').ops.map((W) => mulVec(W, norm(p.hkl))));
      assert.deepEqual(bahnen(pole, rest(p.richtung, false)), p.teile, q.id);
    } else if (p.art === 'polar') {
      // polar: eine Richtung bleibt unter allen Operationen fest (Mittel der Matrizen ≠ 0)
      const polar = (g) => { const ops = buildPointGroup(g).ops; const m = ops.reduce((a, W) => a.map((r, i) => r.map((x, j) => x + W[i][j])), [[0, 0, 0], [0, 0, 0], [0, 0, 0]]); return m.flat().some((x) => Math.abs(x) > 1e-9); };
      assert.deepEqual(q.richtig, p.gruppen.map((g, i) => (polar(g) ? i : -1)).filter((i) => i >= 0), q.id);
      p.gruppen.forEach((g, i) => assert.equal(tq(q.antworten[i]), tq(hmHTML(groupById(g).hm)), q.id));
    } else if (p.art === 'domaenen') {
      assert.equal(48 / rest(p.richtung, p.pfeil).length, p.anzahl, q.id);
      assert.equal(tq(q.antworten[q.richtig[0]]), String(p.anzahl), q.id);
    } else if (p.art === 'zonenpol90') {
      // kubisch: Zonenpol = Richtung der Zonenachse; jeder Pol der Zone 90° davon entfernt
      for (const f of p.flaechen) { assert.equal(dot(f, p.achse), 0, q.id); assert.ok(Math.abs(winkel(f, p.achse) - 90) < 1e-9, q.id); }
      assert.equal(text(q.antworten[q.richtig[0]]), '90°', q.id);
    } else if (p.art === 'komplikation') {
      const [a, b] = p.aus;
      for (const f of p.aus) assert.equal(dot(f, p.achse), 0, q.id);
      const summe = a.map((x, i) => x + b[i]);
      q.antworten.forEach((h, i) => {
        const f = flaechenIn(h)[0];
        assert.equal(dot(f, p.achse) === 0, q.richtig.includes(i), `${q.id}: ${text(h)}`);
      });
      assert.deepEqual(flaechenIn(q.antworten[q.richtig[0]])[0], summe, q.id);
    } else if (p.art === 'musterSpiegel') {
      // Bahn eines allgemeinen Pols: invariant unter den Spiegelungen an den Ebenen durch c und einen Pol
      const orb = orbit(buildPointGroup(p.gruppe).ops, P0).map((o) => o.p ?? o);
      for (const x of orb) {
        const nrm = norm(cross([0, 0, 1], x));
        const sp = (v) => { const d = dot(v, nrm); return v.map((c, i) => c - 2 * d * nrm[i]); };
        assert.ok(orb.every((y) => orb.some((z) => vecEq(sp(y), z))), q.id);
      }
      assert.ok(orb.every((x) => x[2] > 0), `${q.id}: alle Pole oben`);
    } else if (p.art === 'hkil') {
      const [h, k, l] = p.hkl;
      const vier = (s0) => { const t = s0.replace(/<span class="ov">(\d)<\/span>/g, '-$1').replace(/[()]/g, ''); return [...t.matchAll(/-?\d/g)].map((m) => Number(m[0])); };
      q.antworten.forEach((a, i) => assert.equal(gleich(vier(a), [h, k, -(h + k), l]), q.richtig.includes(i), `${q.id}: ${text(a)}`));
    } else if (p.art === 'hexWinkel') {
      const w = winkel(hex(p.a), hex(p.b));
      q.antworten.forEach((a, i) => assert.equal(Math.abs(zahl(text(a).replace('°', '')) - w) < 0.005, q.richtig.includes(i), `${q.id}: ${text(a)} (soll ${w})`));
    } else assert.fail(`${q.id}: unbekannte Prüfung ${p.art}`);
  }
  assert.ok(n >= 15);
});

test('Generatoren Flächenzahl und Flächensymmetrie: Werte aus den Gruppenoperationen, gültige Fragen', () => {
  for (const g of [FLAECHENZAHL, FLAECHENSYM]) {
    assert.deepEqual(g.stufen, [3]);
    const ps = g.params(3);
    assert.ok(ps.length >= 20, g.id);
    for (const id of ps) {
      const q = g.make(id);
      const e = CATALOG.find((x) => x.id === id);
      const info = buildPointGroup(e.pg);
      const pol = poleOfHKL(groupById(e.pg).system, e.hkl);
      const st = stabilizer(info.ops, pol);
      // Flächenzahl = Ordnung / Ordnung der Flächensymmetrie; die Flächensymmetrie hat die Ordnung des Stabilisators
      assert.equal(info.ops.length / st.length, e.mult, `${g.id}:${id}`);
      assert.ok(st.length > 1, `${g.id}:${id} speziell`);
      assert.equal(q.antworten.length, 4, `${g.id}:${id}`);
      const keys = q.antworten.map((a) => text(a.replace(/<span class="ov">/g, '‾')));
      assert.equal(new Set(keys).size, 4, `${g.id}:${id}: doppelte Antwort`);
      assert.equal(q.hinweise.length, 4);
      q.hinweise.slice(1).forEach((h) => assert.ok(h.length > 10));
      assert.ok(zieleUndZusammenfassung(g.kapitel).includes(q.lernziel), q.lernziel);
      assert.equal(abschnitt(q.skript).kapitel, g.kapitel);
      for (const h of [q.app, q.bild].filter(Boolean)) {
        assert.equal(currentEntryId(stateForHash(h)), id, `${g.id}: ${h}`);
        assert.match(svg(h), /<circle/);
      }
      if (g === FLAECHENZAHL) {
        assert.equal(q.antworten[0], String(e.mult));
        assert.ok(q.antworten.slice(1).every((a) => Number(a) !== e.mult && Number(a) > 0));
      } else {
        assert.equal(text(q.antworten[0]), text(hmHTML(e.fs)));
        // Ablenker: Flächensymmetrien anderer Formen derselben Gruppe
        const fsGruppe = CATALOG.filter((x) => x.pg === e.pg).map((x) => text(hmHTML(x.fs)));
        assert.ok(q.antworten.every((a) => fsGruppe.includes(text(a))), `${g.id}:${id}`);
        // Hinweis: „auch auf diesen Elementen“ genau dann, wenn ein Pol der Ablenkerform nur Elemente durch den Pol von e hat
        const se = new Set(st);
        q.antworten.slice(1).forEach((a, i) => {
          const x = CATALOG.find((y) => y.pg === e.pg && tq(hmHTML(y.fs)) === tq(a));
          const px = poleOfHKL(groupById(e.pg).system, x.hkl);
          const drin = info.ops.some((W) => stabilizer(info.ops, mulVec(W, px)).every((j) => se.has(j)));
          assert.equal(q.hinweise[i + 1].includes('auch auf diesen'), drin, `${g.id}:${id}: Hinweis zu ${text(a)}`);
        });
      }
    }
  }
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

// ------------------------------------------------------------------ Räumliche Zeichnungen
/** Erzeugte Fragen eines Generators, mit id, stufe, kapitel und status wie in quiz-core.js. */
const erzeugt = (g) => g.stufen.flatMap((st) => g.params(st).map((p) => ({ ...g.make(p, st), id: `${g.id}:${p}`, stufe: st, kapitel: g.kapitel, status: g.status })));

/** Pole eines Stereogramms gezählt (Mittelpunkt, Grundkreis, Punkt im Kreis, nur ● oder ○) und ihre Poldistanzen ρ. */
function polZahl(hash) {
  const stellen = [];
  for (const p of stereoForHash(hash, col).scene.poles) {
    const [x, y, z] = p.p;
    const rand = Math.abs(z) < 1e-6;
    const d = rand ? 1 : 1 + Math.abs(z);
    const q = [x / d, y / d];
    let t = stellen.find((u) => Math.hypot(u.q[0] - q[0], u.q[1] - q[1]) < 1e-6);
    if (!t) stellen.push((t = { q, rand, n: 0, rho: (Math.acos(Math.min(1, Math.abs(z))) * 180) / Math.PI }));
    t.n += 1;
  }
  const mitte = stellen.filter((t) => Math.hypot(...t.q) < 1e-6);
  const rest = stellen.filter((t) => !mitte.includes(t));
  return {
    pole: { mitte: mitte.length, rand: rest.filter((t) => t.rand).length, doppelt: rest.filter((t) => !t.rand && t.n === 2).length, einzeln: rest.filter((t) => !t.rand && t.n === 1).length },
    rho: [...new Set(stellen.filter((t) => !t.rand).map((t) => Math.round(t.rho * 10) / 10))],
  };
}
/** ρ-Werte in einem Text („bei ρ = 54,7°“). */
const rhoImText = (t) => [...t.matchAll(/ρ = (\d+(?:,\d)?)°/g)].map((m) => Number(m[1].replace(',', '.')));

test('Räumliche Zeichnungen: Bildangabe, eigenständiges SVG, Kristall und Gerüst', () => {
  assert.ok(istRaum('3d#m=pg&g=mmm') && !istRaum('#m=pg&g=mmm'));
  assert.equal(appHash('3d#m=pg&g=mmm'), '#m=pg&g=mmm');
  assert.equal(appHash('#m=pg&g=mmm'), '#m=pg&g=mmm');
  const s = raumSVG('3d#m=form&sys=kubisch&f=m-3m:a34', col);
  assert.match(s, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  // Würfel: drei sichtbare Flächen (Vierecke) aus dieser Blickrichtung, keine Rückseiten
  assert.equal((raumInner('3d#m=form&sys=kubisch&f=m-3m:a34', col).match(/<path d="M [^"]* Z"/g) || []).length, 3);
  // Tetraeder: zwei sichtbare Flächen (nicht nur eine wie aus der Standardansicht der 3D-Ansicht)
  assert.equal((raumInner('3d#m=form&sys=kubisch&f=-43m:a33', col).match(/<path d="M [^"]* Z"/g) || []).length, 2);
  // Gerüst 4/mmm: fünf Spiegelebenen (Scheiben), je Achse zwei Symbole
  const g = raumInner('3d#m=pg&g=4/mmm', col);
  assert.equal((g.match(/fill-opacity="0.13"/g) || []).length, 5);
  assert.equal((g.match(/<g transform/g) || []).length, 2 * buildPointGroup('4/mmm').axes.length);
});

test('Kristalle ↔ Stereogramm: Zählung und ρ der Beschreibungen stimmen mit den Stereogrammen', () => {
  for (const [k, e] of Object.entries(KOERPER)) {
    const z = polZahl(`#m=form&${e.form}`);
    assert.deepEqual(z.pole, e.pole, k);
    for (const r of rhoImText(e.muster)) assert.ok(z.rho.includes(r), `${k}: ρ = ${r}° nicht im Stereogramm (${z.rho})`);
  }
  for (const [k, lagen] of Object.entries(LAGE_MUSTER)) {
    for (const [lage, [muster, pole]] of Object.entries(lagen)) {
      const z = polZahl(`#m=form&${KOERPER[k].form}${lage === '001' ? '' : `&lage=${lage}`}`);
      assert.deepEqual(z.pole, pole, `${k} ${lage}`);
      for (const r of rhoImText(muster)) assert.ok(z.rho.includes(r), `${k} ${lage}: ρ = ${r}° nicht im Stereogramm (${z.rho})`);
    }
  }
});

test('Hinweise zu Gerüsten: kein Element zugleich „zusätzlich“ und „fehlt“', () => {
  const qs = [...GERUEST_ALLE.map((id) => GERUEST.make(id)), ...erzeugt(GERUEST3D)];
  for (const q of qs) {
    for (const h of q.hinweise.slice(1)) {
      const t = text(h);
      const [vor, nach = ''] = t.split('dafür');
      const namen = (x) => new Set([...x.matchAll(/\d-zählige Dreh(?:inversions)?achse|Spiegelebene|Inversionszentrum/g)].map((m) => m[0]));
      const A = namen(vor.replace(/an (?:derselben Stelle|denselben Stellen) [^;]*/g, '')), B = namen(nach);
      for (const n of A) assert.ok(!B.has(n), `${t}`);
    }
  }
  // dieselbe Achse ∥ c mit anderem Charakter: „statt“
  const h = text(GERUEST.make('-3').hinweise[GERUEST.make('-3').antworten.indexOf(hmHTML('3'))] || '');
  assert.match(h, /an derselben Stelle eine 3-zählige Drehachse statt der 3-zähligen Drehinversionsachse/);
});

test('Generatoren mit Bildantworten: gültige Fragen, richtige Antwort passt zum Bild', () => {
  for (const g of [KOERPER_STEREO, LAGE, GERUEST3D]) {
    const qs = erzeugt(g);
    assert.ok(qs.length >= 18, g.id);
    for (const q of qs) {
      assert.equal(q.typ, 'bild-bild', q.id);
      assert.equal(q.antworten.length, 4, q.id);
      assert.deepEqual(q.richtig, [0], q.id);
      assert.equal(q.hinweise.length, 4, q.id);
      assert.equal(q.hinweise[0], null, q.id);
      q.hinweise.slice(1).forEach((h, i) => assert.ok(typeof h === 'string' && h.length > 10, `${q.id}: Hinweis ${i + 1}`));
      for (const f of ['frage', 'erklaerung', 'quelle']) assert.ok(q[f].length > 10, `${q.id}: ${f}`);
      assert.ok(zieleUndZusammenfassung(q.kapitel).includes(q.lernziel), `${q.id}: ${q.lernziel}`);
      const a = abschnitt(q.skript);
      assert.equal(a.kapitel, q.kapitel, q.id);
      assert.ok(!a.vertiefung, q.id);
      pruefeBilder(q);
      // Bild und Antworten in verschiedener Darstellung (Zeichnung ↔ Stereogramm), Antworten alle gleich
      assert.ok(q.antworten.every((x) => istRaum(x.app) === istRaum(q.antworten[0].app)), q.id);
      assert.notEqual(istRaum(q.bild), istRaum(q.antworten[0].app), q.id);
      // Alternativtexte beschreiben das jeweilige Bild: verschieden je Antwort, Fragebild wie die richtige Antwort beschrieben
      assert.equal(new Set(q.antworten.map((x) => x.alt)).size, 4, `${q.id}: gleiche Alternativtexte`);
      assert.ok(!/"/.test(q.bildAlt + q.antworten.map((x) => x.alt).join('')), q.id);
      // richtige Antwort: derselbe Kristall bzw. dieselbe Punktgruppe in derselben Lage wie das Bild
      const ohne = (h) => appHash(h).replace('&idx=0', '').replace('&obj=0&farbe=0', '');
      assert.equal(ohne(q.antworten[0].app), ohne(q.bild), q.id);
      q.antworten.slice(1).forEach((x) => assert.notEqual(ohne(x.app), ohne(q.bild), q.id));
    }
  }
  // Gerüste: keine unlesbaren kubischen Gerüste, auch nicht als Ablenker
  for (const q of erzeugt(GERUEST3D)) {
    for (const x of q.antworten) assert.ok(!GERUEST3D_OHNE.includes(decodeURIComponent(new URLSearchParams(appHash(x.app).slice(1)).get('g'))), q.id);
  }
  // Lage: drei Lagen desselben Kristalls und ein anderer Kristall in der gefragten Lage
  for (const q of erzeugt(LAGE)) {
    const lagen = q.antworten.map((x) => stateForHash(appHash(x.app)).poly.presetId);
    assert.deepEqual(new Set(lagen.slice(0, 3)).size, 3, q.id);
    assert.equal(lagen[3], lagen[0], q.id);
  }
});

test('Ablauf: Stufe, Kapitel, Anzahl und Höchstanteil eines Generators', () => {
  const kands = kandidaten(BANK, GENERATOREN, { entwurf: true });
  const n = zaehlen(kands);
  assert.ok(n[2][1] >= 8 && n[7][1] >= 8);
  const gen31 = GENERATOREN.filter((g) => g.kapitel === 4 && g.stufen.includes(1)).reduce((m, g) => m + g.params(1).length, 0);
  assert.equal(n[4][1], gen31 + BANK.filter((q) => q.kapitel === 4 && q.stufe === 1).length);
  assert.ok(gen31 > GERUEST_STUFE1.length);
  for (let seed = 1; seed <= 30; seed++) {
    const r = rng(seed);
    const z = ziehen(kands, { stufe: 1, n: 10, rand: r });
    assert.equal(z.length, 10);
    assert.equal(new Set(z.map((k) => k.key)).size, 10, 'keine Frage doppelt');
    assert.ok(z.every((k) => k.stufe === 1));
    for (const g of GENERATOREN) assert.ok(z.filter((k) => k.gen === g).length <= Math.round(10 * GEN_ANTEIL), g.id);
    // alle erzeugten Fragen zusammen höchstens die Hälfte, auch in Kapiteln mit vielen erzeugten Fragen
    for (const [kap, st, n] of [[null, 1, 10], [[4], 2, 10], [[6], 2, 5], [[10], 3, 20], [[6, 4], 1, 20]]) {
      const zz = ziehen(kands, { stufe: st, kapitel: kap, n, rand: r });
      const g = zz.filter((k) => k.gen).length;
      assert.ok(g <= Math.floor(n * GEN_GESAMT) && g <= zz.length * GEN_GESAMT, `Kap. ${kap}, Stufe ${st}, n = ${n}: ${g} von ${zz.length}`);
    }
    const z7 = ziehen(kands, { stufe: 1, kapitel: [7], n: 20, rand: r });
    assert.ok(z7.length === n[7][1] && z7.every((k) => k.kapitel === 7));
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
    const q0 = k.frage || k.gen.make(k.param, k.stufe);
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
  assert.equal(stand(kands, p)[7].richtig, 1);
  for (const t of [null, '', 'x', '{"v":2}', '[]']) assert.deepEqual(fortschrittAus(t), leererFortschritt());
  assert.deepEqual(fortschrittAus(JSON.stringify(p)), p);
  // zuletzt falsch beantwortete Fragen kommen vor richtig beantworteten an die Reihe
  const p2 = leererFortschritt();
  for (const q of BANK.filter((x) => x.kapitel === 7)) vermerken(p2, q.id, q.id !== 'zon-1-07');
  const z = ziehen(kands, { stufe: 1, kapitel: [7], n: 1, progress: p2, rand: rng(9) });
  assert.equal(z[0].key, 'zon-1-07');
});

test('Moodle-Export: Kategorien, Bruchteile, eingebettete Bilder, nur geprüfte Fragen', () => {
  const genZahl = (alle) => GENERATOREN.filter((g) => alle || g.status === 'geprüft').reduce((n, g) => n + g.stufen.reduce((m, st) => m + g.params(st).length, 0), 0);
  assert.equal(moodleXML().anzahl, BANK.filter((q) => q.status === 'geprüft').length + genZahl(false));
  const { xml, anzahl } = moodleXML({ entwurf: true });
  assert.equal(anzahl, BANK.length + genZahl(true));
  const qs = xml.split('<question type="multichoice">').slice(1);
  assert.equal(qs.length, anzahl);
  for (const q of qs) {
    const fr = [...q.matchAll(/<answer fraction="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    assert.ok(Math.abs(fr.filter((x) => x > 0).reduce((s, x) => s + x, 0) - 100) < 0.01, q.slice(0, 80));
    for (const m of q.matchAll(/@@PLUGINFILE@@\/([\w.]+)/g)) assert.ok(q.includes(`<file name="${m[1]}"`), `Datei ${m[1]} fehlt`);
    assert.ok(!q.includes('class="ov"'), 'Querstrich nicht umgesetzt');
  }
  assert.ok(xml.includes('$course$/top/Stereographische Projektion/Kap. 7 Zonen/Stufe 1'));
  // wohlgeformt genug: Tags ausgeglichen
  for (const t of ['question', 'answer', 'text', 'file']) assert.equal((xml.match(new RegExp(`<${t}[ >]`, 'g')) || []).length, (xml.match(new RegExp(`</${t}>`, 'g')) || []).length, t);
});

test('Skript: „Lernziele prüfen“ am Ende jedes Kapitels führt ins Quiz mit Kapitel und Stufe', () => {
  const n = zaehlen(kandidaten(BANK, GENERATOREN, { entwurf: true }));
  // Kapitel ohne Fragen (z. B. ein neues Kapitel) haben noch keinen Link
  KAPITEL.forEach((kap, i) => {
    const nr = kap.nr;
    const a = skript.indexOf(`<section id="${kap.anker}"`);
    const b = i + 1 < KAPITEL.length ? skript.indexOf(`<section id="${KAPITEL[i + 1].anker}"`) : skript.length;
    const ls = [...skript.slice(a, b).matchAll(/<p class="quizlink">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
    const hatFragen = [1, 2, 3].some((st) => n[nr]?.[st]);
    assert.equal(ls.length, hatFragen ? 1 : 0, `Kap. ${nr}: ${ls.length} Links`);
    if (!hatFragen) return;
    const l = ls[0];
    const ziele = [...l.matchAll(/href="quiz\.html\?kap=(\d+)&amp;stufe=(\d)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    assert.ok(ziele.length >= 1, `Kap. ${nr}`);
    for (const [k, st] of ziele) {
      assert.equal(k, nr, `Kap. ${nr}: Link auf Kap. ${k}`);
      assert.ok(n[nr]?.[st] > 0, `Kap. ${nr}, Stufe ${st}: keine Fragen`);
    }
    // jede Stufe mit eigenen Fragen hat einen Link
    for (const st of [1, 2, 3]) if (n[nr]?.[st]) assert.ok(ziele.some(([, s0]) => s0 === st), `Kap. ${nr}: Link Stufe ${st} fehlt`);
    assert.ok(!/<a (?![^>]*target="_blank")/.test(l), `Kap. ${nr}: neuer Tab`);
  });
  const js = readFileSync(new URL('../js/quiz.js', import.meta.url), 'utf8');
  assert.match(js, /START\.get\('kap'\)/);
  assert.match(js, /START\.get\('stufe'\)/);
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

test('Seite: Schalter „Auch ungeprüfte Fragen zeigen“ für alle, im Browser gemerkt, ?entwurf schaltet ein', () => {
  const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../js/quiz.js', import.meta.url), 'utf8');
  assert.match(html, /<input type="checkbox" id="entwurf-schalter">/);
  assert.match(js, /let entwurf = START\.has\('entwurf'\);/);
  assert.match(js, /localStorage\.getItem\(ENTWURF\) === '1'/);
  assert.match(js, /localStorage\.setItem\(ENTWURF/);
  // ohne Schalter nur geprüfte Fragen, mit Schalter alle
  const ohne = kandidaten(BANK, GENERATOREN, {}), mit = kandidaten(BANK, GENERATOREN, { entwurf: true });
  assert.ok(ohne.every((k) => (k.frage ? k.frage.status : k.gen.status) === 'geprüft'));
  assert.ok(mit.length > ohne.length);
});

test('Seite: Kapitel mit Namen, Schalter unter der Auswahl, Stand für die gewählte Stufe', () => {
  const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../js/quiz.js', import.meta.url), 'utf8');
  for (const k of KAPITEL) assert.ok(typeof k.kurz === 'string' && k.kurz.length > 3 && k.kurz.length <= 25, `Kap. ${k.nr}`);
  assert.match(js, /\$\{k\.nr\} \$\{k\.kurz\}/);
  // Schalter nach der Auswahl und ausserhalb des Formulars (bleibt erreichbar, wenn noch keine Frage geprüft ist)
  assert.ok(html.indexOf('id="entwurf-schalter"') > html.indexOf('</form>'));
  assert.match(js, /stand\(KANDS\.filter\(\(k\) => k\.stufe <= wahl\.stufe\)/);
  assert.match(html, /Ihr Stand · <span id="stand-stufe">/);
});
