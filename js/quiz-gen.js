// Erzeugte Fragen: aus den Daten der App, die schon getestet sind, mit sicherer richtiger Antwort.
// Ein Generator: { id, kapitel, stufen, status, params(stufe) → Parameter, make(param, stufe) → Frage }.
// Die Frage hat denselben Aufbau wie in quiz-bank.js (ohne id, stufe, kapitel, status; die setzt quiz-core.js).

import { POINT_GROUPS, groupById, buildPointGroup, symmetryDirections, elementSummary } from './pointgroups.js';
import { hmHTML } from './format.js';
import { CATALOG, entryById } from './forms.js';
import { SYSTEM_OF } from './polyhedra.js';
import { poleOfHKL, stabilizer } from './sitesym.js';
import { mulVec } from './linalg.js';

// ------------------------------------------------------------------ Symmetriegerüst → Punktgruppe
// Je Punktgruppe eine Aufstellung wie im Formenkatalog (monoklin Achse b, 321, 3m1, 3̄m1, 4̄2m, 6̄m2),
// damit kein HM-Symbol doppelt vorkommt.
const GERUEST_ALLE = ['1', '-1', '2b', 'mb', '2/mb', '222', 'mm2', 'mmm', '4', '-4', '4/m', '422', '4mm', '-42m', '4/mmm',
  '3', '-3', '321', '3m1', '-3m1', '6', '-6', '6/m', '622', '6mm', '-6m2', '6/mmm', '23', 'm-3', '432', '-43m', 'm-3m'];
// Stufe 1: Gerüste aus Vorlesung (Folie 64: 2, 2mm; Folie 90: mmm, 4/mmm, 6/mmm, m3̄m) und Skript Kap. 3
// (1̄, 2, m, 4, 4̄); die übrigen sind Stufe 2.
const GERUEST_STUFE1 = ['2b', 'mb', '-1', 'mm2', 'mmm', '4', '-4', '4/mmm', '6/mmm', 'm-3m'];
// Ablenker aus demselben Kristallsystem; reicht das nicht, aus diesen Nachbarsystemen
const NACHBARN = { triklin: ['monoklin'], monoklin: ['orthorhombisch', 'triklin'], orthorhombisch: ['monoklin', 'tetragonal'], trigonal: ['hexagonal'] };

const ZAHL = ['keine', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const ACHSE = { 6: '6-zählige Drehachse', '-6': '6-zählige Drehinversionsachse', 4: '4-zählige Drehachse', '-4': '4-zählige Drehinversionsachse',
  3: '3-zählige Drehachse', '-3': '3-zählige Drehinversionsachse', 2: '2-zählige Drehachse' };
const ACHSEN = { 6: '6-zählige Drehachsen', '-6': '6-zählige Drehinversionsachsen', 4: '4-zählige Drehachsen', '-4': '4-zählige Drehinversionsachsen',
  3: '3-zählige Drehachsen', '-3': '3-zählige Drehinversionsachsen', 2: '2-zählige Drehachsen' };

/** Symmetrieelemente als Satzteil, z. B. „eine 4-zählige Drehachse, vier 2-zählige Drehachsen, fünf Spiegelebenen und ein Inversionszentrum“. */
export function elementeText(info) {
  const s = elementSummary(info);
  const teile = [];
  const n = {};
  for (const a of s.axes) n[a.symbol] = (n[a.symbol] || 0) + a.count;
  for (const sym of ['6', '-6', '4', '-4', '3', '-3', '2']) if (n[sym]) teile.push(`${ZAHL[n[sym]]} ${n[sym] === 1 ? ACHSE[sym] : ACHSEN[sym]}`);
  if (s.mirrors) teile.push(`${ZAHL[s.mirrors]} ${s.mirrors === 1 ? 'Spiegelebene' : 'Spiegelebenen'}`);
  if (s.centre) teile.push('ein Inversionszentrum');
  if (!teile.length) return 'keine Symmetrieelemente ausser der Identität';
  return teile.length === 1 ? teile[0] : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`;
}

/**
 * Satz zu Blickrichtungen und Symbol. Positionen ohne Symmetrieelement (Platzhalter 1) werden nicht genannt; sie
 * sind im Skript Vertiefung. Monoklin nennt die Richtung b der Standardaufstellung (Skript Kap. 6). Trigonale Gruppen mit zwei
 * Aufstellungen behalten im gekürzten Symbol die Ziffer 1 (3m1, nicht 3m), wie in ITA.
 */
function symbolText(g, cls) {
  const echt = cls.filter((c) => c.hm !== '1');
  if (!echt.length) return '';
  const blick = ` Blickrichtung${echt.length > 1 ? 'en' : ''}: ${echt.map((c) => `${c.label}: ${hmHTML(c.hm)}`).join(' · ')}.`;
  if (g.system === 'monoklin') return `${blick} Symbol ${hmHTML(g.hm)} (Standardaufstellung mit b als eindeutiger Achse; gebräuchlich ist auch c).`;
  const kurz = g.system === 'trigonal' && g.setting ? `${hmHTML(g.setting)} (Punktgruppe ${hmHTML(g.hm)})` : hmHTML(g.hm);
  return g.full.replace(/ /g, '') === g.hm ? `${blick} Symbol ${kurz}.` : `${blick} Volles Symbol ${hmHTML(g.full)}, gekürzt ${kurz}.`;
}

/** Elemente des Ablenkers im Vergleich zum gezeigten Gerüst: was im Bild fehlt bzw. zusätzlich zu sehen ist. */
function zaehle(info) {
  const s = elementSummary(info);
  const n = {};
  for (const a of s.axes) n[a.symbol] = (n[a.symbol] || 0) + a.count;
  if (s.mirrors) n.m = s.mirrors;
  if (s.centre) n.c = 1;
  return n;
}
const NAME = { ...ACHSEN, m: 'Spiegelebenen', c: 'Inversionszentrum' };
const NAME1 = { ...ACHSE, m: 'Spiegelebene', c: 'Inversionszentrum' };
/** Hinweis zu einem Ablenker: was sein Gerüst gegenüber dem Bild zusätzlich hat bzw. was ihm fehlt. */
export function unterschied(gezeigt, x) {
  const a = zaehle(gezeigt), b = zaehle(buildPointGroup(x.id));
  const und = (l) => (l.length === 1 ? l[0] : `${l.slice(0, -1).join(', ')} und ${l[l.length - 1]}`);
  const teil = (p, q) => Object.keys({ ...p, ...q }).filter((k) => (p[k] || 0) > (q[k] || 0))
    .map((k) => { const d = (p[k] || 0) - (q[k] || 0); return `${k === 'c' ? 'ein' : ZAHL[d]} ${d === 1 ? NAME1[k] : NAME[k]}`; });
  const mehr = teil(b, a), weniger = teil(a, b);
  const verb = (l) => (l.length === 1 && /^(ein|eine) /.test(l[0]) ? 'fehlt' : 'fehlen');
  const name = hmHTML(x.hm);
  if (mehr.length && weniger.length) return `Das Gerüst von ${name} hat zusätzlich ${und(mehr)}; dafür ${verb(weniger)} ihm ${und(weniger)}.`;
  if (mehr.length) return `Das Gerüst von ${name} hat zusätzlich ${und(mehr)}.`;
  if (weniger.length) return `Dem Gerüst von ${name} ${verb(weniger)} ${und(weniger)}.`;
  return `Das Gerüst von ${name} hat dieselben Elemente in anderer Anordnung.`;
}

/** Bis zu drei Ablenker (verschiedene HM-Symbole), zuerst aus demselben Kristallsystem. */
export function geruestAblenker(id) {
  const g = groupById(id);
  const kand = (sys) => GERUEST_ALLE.map(groupById).filter((x) => x.system === sys && x.hm !== g.hm);
  const out = [...kand(g.system)];
  for (const sys of NACHBARN[g.system] || []) if (out.length < 3) out.push(...kand(sys));
  return out;
}

export const GERUEST = {
  id: 'gen-geruest', kapitel: 3, stufen: [1, 2], status: 'geprüft',
  params: (stufe) => (stufe === 1 ? GERUEST_STUFE1 : GERUEST_ALLE.filter((id) => !GERUEST_STUFE1.includes(id))),
  /** Ablenker deterministisch aus dem Parameter (die Reihenfolge mischt quiz-core.js). */
  make(id) {
    const g = groupById(id);
    const info = buildPointGroup(id);
    const cls = symmetryDirections(info).filter((c) => c.hm);
    const abl = geruestAblenker(id);
    // gleichmässig über die Kandidaten verteilt, damit nicht immer dieselben Ablenker kommen
    const step = Math.max(1, Math.floor(abl.length / 3));
    const wahl = [0, 1, 2].map((k) => abl[(k * step) % abl.length]).filter((x, i, a) => a.indexOf(x) === i);
    for (const x of abl) if (wahl.length < 3 && !wahl.includes(x)) wahl.push(x);
    const blick = symbolText(g, cls);
    return {
      typ: 'bild-text',
      lernziel: 'ein Stereogramm einer Symmetrie zuordnen',
      frage: 'Welche Punktgruppe hat dieses Symmetriegerüst? Die c-Achse zeigt in Projektionsrichtung.',
      bild: `#m=pg&g=${encodeURIComponent(id)}&obj=0&farbe=0`,
      bildAlt: 'Stereogramm eines Symmetriegerüsts',
      antworten: [hmHTML(g.hm), ...wahl.map((x) => hmHTML(x.hm))],
      richtig: [0],
      hinweise: [null, ...wahl.map((x) => unterschied(info, x))],
      erklaerung: `Das Gerüst enthält ${elementeText(info)} (Kristallsystem ${g.system}).${blick}`,
      skript: 'elemente',
      app: `#m=pg&g=${encodeURIComponent(id)}&obj=0`,
      quelle: 'Folien 88–91, 102; nach Borchardt-Ott & Sowa (2018), Aufg. 9.9 (S. 180) und Abb. 7.8–7.13',
    };
  },
};

// ------------------------------------------------------------------ Flächenzahl und Flächensymmetrie (Kap. 8, Stufe 3)
// Daten aus dem Formenkatalog (js/forms.js): Wyckoff-Lage, Flächensymmetrie, Flächenzahl je Form; die Tests rechnen
// Flächenzahl und Flächensymmetrie aus den Gruppenoperationen nach.
const indizes = (hkl) => `{${hkl.map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : x)).join('')}}`;
const ORDNUNG = (id) => buildPointGroup(id).ops.length;
/** Symbol der Punktgruppe; trigonal mit Aufstellung (3m1, 31m), damit die Positionen der Flächensymmetrie lesbar sind. */
const gruppenSymbol = (g) => hmHTML(g.system === 'trigonal' && g.setting ? g.setting : g.hm);
/** Formen mit spezieller Lage (Flächensymmetrie ≠ 1) in Gruppen mit mindestens 8 Operationen. */
const SPEZIELL = CATALOG.filter((e) => e.fs !== '1' && e.mult > 1 && ORDNUNG(e.pg) >= 8);
/** Varianten, die eine handgeschriebene Frage schon stellt (lag-3-01, lag-3-03). */
const SCHON_GEFRAGT = { 'gen-flaechenzahl': ['-43m:a33'], 'gen-flaechensym': ['4/mmm:a2'] };

/** Operationen (Indizes), die den Pol einer Form festhalten. */
function stab(e) {
  const info = buildPointGroup(e.pg);
  return { info, s: new Set(stabilizer(info.ops, poleOfHKL(groupById(e.pg).system, e.hkl))) };
}
/** Liegt ein Pol der Form x auch auf allen Elementen, die durch den Pol von e gehen, aber nicht umgekehrt? */
function enthalten(e, x) {
  const { info, s } = stab(e);
  const p = poleOfHKL(groupById(x.pg).system, x.hkl);
  return info.ops.some((W) => { const t = new Set(stabilizer(info.ops, mulVec(W, p))); return [...t].every((i) => s.has(i)) && t.size < s.size; });
}

export const FLAECHENZAHL = {
  id: 'gen-flaechenzahl', kapitel: 8, stufen: [3], status: 'entwurf',
  params: () => SPEZIELL.map((e) => e.id).filter((id) => !SCHON_GEFRAGT['gen-flaechenzahl'].includes(id)),
  make(id) {
    const e = entryById(id);
    const g = groupById(e.pg);
    const n = ORDNUNG(e.pg), k = n / e.mult;
    const fs = hmHTML(e.fs);
    // typische Fehler: Flächensymmetrie vergessen, Ordnung der Flächensymmetrie, Flächenzahl einer anderen Form
    const kand = [[n, `So viele Flächen hat nur die allgemeine Form mit der Flächensymmetrie 1. Hier halten die ${k} Operationen von ${fs} jeden Pol fest; je ${k} Bilder fallen zusammen.`],
      [k, `${k} ist die Ordnung der Flächensymmetrie ${fs}, nicht die Flächenzahl.`]];
    for (const x of SPEZIELL.filter((y) => y.pg === e.pg && y.fs !== e.fs)) {
      kand.push([x.mult, `So viele Flächen hat die Form ${indizes(x.hkl)} mit der Flächensymmetrie ${hmHTML(x.fs)} (${n}/${n / x.mult}). Hier: ${n}/${k} = ${e.mult}.`]);
    }
    if (k % 2 === 0) kand.push([e.mult * 2, `So viele Flächen hätte die Form bei einer halb so grossen Flächensymmetrie. Hier: ${n}/${k} = ${e.mult}.`]);
    if (e.mult % 2 === 0) kand.push([e.mult / 2, `So viele Flächen hätte die Form bei einer doppelt so grossen Flächensymmetrie. Hier: ${n}/${k} = ${e.mult}.`]);
    kand.push([1, `Eine einzige Fläche bliebe nur, wenn alle ${n} Operationen den Pol festhielten. Hier sind es ${k}: ${n}/${k} = ${e.mult}.`]);
    kand.push([n / 2, `Das ist die halbe Ordnung der Punktgruppe; geteilt wird aber durch die Ordnung der Flächensymmetrie: ${n}/${k} = ${e.mult}.`]);
    const abl = [];
    for (const [x, h] of kand) if (x !== e.mult && Number.isInteger(x) && x > 0 && x <= n && !abl.some(([y]) => y === x) && abl.length < 3) abl.push([x, h]);
    const sys = SYSTEM_OF[e.pg];
    return {
      typ: 'einfach',
      lernziel: 'die Flächenzahl einer Form aus der Ordnung der Punktgruppe und der Flächensymmetrie berechnen',
      frage: `Wie viele Flächen hat die Form ${indizes(e.hkl)} in der Punktgruppe ${gruppenSymbol(g)} (${n} Operationen), wenn ihre Flächensymmetrie <b>${fs}</b> ist?`,
      antworten: [String(e.mult), ...abl.map(([x]) => String(x))],
      richtig: [0],
      hinweise: [null, ...abl.map(([, h]) => h)],
      erklaerung: `Die Flächensymmetrie ${fs} hat ${k} Operationen. Flächenzahl = Ordnung der Punktgruppe / Ordnung der Flächensymmetrie = ${n}/${k} = ${e.mult}. Die Form gehört zur Wyckoff-Lage ${e.mult}<i>${e.wy}</i>.`,
      skript: 'multiplizitaet',
      app: `#m=form&sys=${sys}&f=${encodeURIComponent(e.id)}&muster=1`,
      quelle: 'Borchardt-Ott & Sowa (2018), Abschn. 9.2.1, S. 142–150, Tab. 9.5–9.8 (S. 152–157); International Tables Vol. A (2006), Tab. 10.1.2.2',
    };
  },
};

/** Flächensymmetrie wählen: Gruppen mit mindestens vier verschiedenen speziellen Flächensymmetrien. */
const FS_GRUPPEN = [...new Set(SPEZIELL.map((e) => e.pg))].filter((pg) => new Set(SPEZIELL.filter((e) => e.pg === pg).map((e) => e.fs)).size >= 4);
export const FLAECHENSYM = {
  id: 'gen-flaechensym', kapitel: 8, stufen: [3], status: 'entwurf',
  params: () => SPEZIELL.filter((e) => FS_GRUPPEN.includes(e.pg)).map((e) => e.id).filter((id) => !SCHON_GEFRAGT['gen-flaechensym'].includes(id)),
  make(id) {
    const e = entryById(id);
    const g = groupById(e.pg);
    const n = ORDNUNG(e.pg), k = n / e.mult;
    // Ablenker: andere Flächensymmetrien derselben Gruppe, zuerst gleicher Ordnung, dann nach Abstand der Ordnung
    const andere = [];
    for (const x of SPEZIELL.filter((y) => y.pg === e.pg && y.fs !== e.fs)) if (!andere.some((y) => y.fs === x.fs)) andere.push(x);
    const abstand = (x) => Math.abs(Math.log((n / x.mult) / k));
    const abl = andere.map((x, i) => [x, i]).sort((a, b) => abstand(a[0]) - abstand(b[0]) || a[1] - b[1]).slice(0, 3).map(([x]) => x);
    const labels = symmetryDirections(buildPointGroup(e.pg)).map((c) => c.label).join(', ');
    const sys = SYSTEM_OF[e.pg];
    const hinweis = (x) => (enthalten(e, x)
      ? `${hmHTML(x.fs)} ist die Flächensymmetrie der Form ${indizes(x.hkl)} (${x.mult} Flächen). Die Pole von ${indizes(e.hkl)} liegen auch auf diesen Elementen, aber zusätzlich auf weiteren; das Symbol nennt alle Elemente durch die Fläche.`
      : `${hmHTML(x.fs)} ist die Flächensymmetrie der Form ${indizes(x.hkl)} (${x.mult} Flächen). Die Pole von ${indizes(e.hkl)} liegen auf anderen Symmetrieelementen.`);
    return {
      typ: 'bild-text',
      lernziel: 'ein orientiertes Symbol der Flächensymmetrie lesen, z. B. 4m.m oder ..m',
      frage: `Das Stereogramm zeigt die Form ${indizes(e.hkl)} der Punktgruppe ${gruppenSymbol(g)} über ihrem Symmetriegerüst. Welche Flächensymmetrie haben ihre Flächen?`,
      bild: `#m=form&sys=${sys}&f=${encodeURIComponent(e.id)}&geruest=1&idx=0&muster=1`,
      bildAlt: `Stereogramm einer Form der Punktgruppe ${g.hm} über dem Symmetriegerüst`,
      antworten: [hmHTML(e.fs), ...abl.map((x) => hmHTML(x.fs))],
      richtig: [0],
      hinweise: [null, ...abl.map(hinweis)],
      erklaerung: `Das orientierte Symbol nennt je Blickrichtung (${labels}) die Symmetrieelemente, die durch die Fläche gehen; ein Punkt steht für keines. Für ${indizes(e.hkl)} ergibt das ${hmHTML(e.fs)} mit ${k} Operationen, also ${n}/${k} = ${e.mult} Flächen (Wyckoff-Lage ${e.mult}<i>${e.wy}</i>).`,
      skript: 'lagesymbol',
      app: `#m=form&sys=${sys}&f=${encodeURIComponent(e.id)}&geruest=1&muster=1`,
      quelle: 'Borchardt-Ott & Sowa (2018), Abschn. 9.2.1, S. 142–150, Tab. 9.5–9.8 (S. 152–157); International Tables Vol. A (2006), Tab. 10.1.2.2',
    };
  },
};

// ------------------------------------------------------------------ Räumliche Zeichnungen (js/bild3d.js)
// Bildangabe "3d#…": feste Zeichnung des Kristalls bzw. Symmetriegerüsts; die Projektionsrichtung ist darin senkrecht.
const ov = (d) => `<span class="ov">${d}</span>`;
const PFEIL = 'Die Projektionsrichtung ist in den Zeichnungen senkrecht (Pfeil).';
/** Regel aus der Zusammenfassung von Kap. 2. */
const REGEL = 'Flächen parallel zur Projektionsrichtung haben ihre Pole auf dem Grundkreis, Flächen senkrecht dazu im Mittelpunkt.';
const GRAU = ' Grau: das Pinakoid, mit dem die App das offene Prisma schliesst.';

/**
 * Kristalle für Körper ↔ Stereogramm. form: Link-Adresse ohne "#m=form&"; der, des, den: Name mit Artikel;
 * muster: Stereogramm in Worten; pole: Zählung, die der Test aus dem Stereogramm nachrechnet
 * (mitte: Pol im Mittelpunkt, rand: Pole auf dem Grundkreis, doppelt: Punkt im Kreis, einzeln: nur ● oder ○).
 */
export const KOERPER = {
  wuerfel: { form: 'sys=kubisch&f=m-3m:a34', der: 'der Würfel {100}', des: 'des Würfels {100}', den: 'den Würfel {100}',
    muster: 'ein Punkt im Kreis in der Mitte (Deck- und Grundfläche) und vier Pole auf dem Grundkreis', pole: { mitte: 1, rand: 4, doppelt: 0, einzeln: 0 } },
  oktaeder: { form: 'sys=kubisch&f=m-3m:b35', der: 'das Oktaeder {111}', des: 'des Oktaeders {111}', den: 'das Oktaeder {111}',
    muster: 'vier Punkte im Kreis auf den Diagonalen, bei ρ = 54,7°', pole: { mitte: 0, rand: 0, doppelt: 4, einzeln: 0 }, rho: [54.7] },
  rhombendodekaeder: { form: 'sys=kubisch&f=m-3m:c40', der: 'das Rhombendodekaeder {110}', des: 'des Rhombendodekaeders {110}', den: 'das Rhombendodekaeder {110}',
    muster: 'vier Pole auf dem Grundkreis auf den Diagonalen und vier Punkte im Kreis oben, unten, links und rechts, bei ρ = 45°', pole: { mitte: 0, rand: 4, doppelt: 4, einzeln: 0 }, rho: [45] },
  tetraeder: { form: 'sys=kubisch&f=-43m:a33', der: 'das Tetraeder {111}', des: 'des Tetraeders {111}', den: 'das Tetraeder {111}',
    muster: 'vier Pole auf den Diagonalen, abwechselnd ● (obere Halbkugel) und ○ (untere Halbkugel)', pole: { mitte: 0, rand: 0, doppelt: 0, einzeln: 4 } },
  tetrPrisma: { form: 'sys=tetragonal&f=4/mmm:c10', der: 'das tetragonale Prisma {100} mit Pinakoid {001}', des: 'des tetragonalen Prismas {100} mit Pinakoid {001}', grau: true,
    muster: 'vier Pole auf dem Grundkreis im Abstand von 90° und der graue Punkt im Kreis des Pinakoids in der Mitte', pole: { mitte: 1, rand: 4, doppelt: 0, einzeln: 0 } },
  hexPrisma: { form: 'sys=hexagonal&f=6/mmm:c25', der: 'das hexagonale Prisma {100} mit Pinakoid {001}', des: 'des hexagonalen Prismas {100} mit Pinakoid {001}', grau: true,
    muster: 'sechs Pole auf dem Grundkreis im Abstand von 60° und der graue Punkt im Kreis des Pinakoids in der Mitte', pole: { mitte: 1, rand: 6, doppelt: 0, einzeln: 0 } },
  tetrDipyr: { form: 'sys=tetragonal&f=4/mmm:e14', der: 'die tetragonale Dipyramide {111}', des: 'der tetragonalen Dipyramide {111}',
    muster: 'vier Punkte im Kreis auf den Diagonalen, bei ρ = 61,5° (c/a = 1,3)', pole: { mitte: 0, rand: 0, doppelt: 4, einzeln: 0 }, rho: [61.5] },
  hexDipyr: { form: 'sys=hexagonal&f=6/mmm:e31', der: 'die hexagonale Dipyramide {101}', des: 'der hexagonalen Dipyramide {101}',
    muster: 'sechs Punkte im Kreis im Abstand von 60°', pole: { mitte: 0, rand: 0, doppelt: 6, einzeln: 0 } },
  rhomboeder: { form: 'sys=trigonal&f=-3m1:c21', der: 'das Rhomboeder {101}', des: 'des Rhomboeders {101}',
    muster: 'sechs Pole im Abstand von 60°, abwechselnd ● und ○', pole: { mitte: 0, rand: 0, doppelt: 0, einzeln: 6 } },
  trigPrisma: { form: 'sys=hexagonal&f=-6m2:b18', der: 'das trigonale Prisma {100} mit Pinakoid {001}', des: 'des trigonalen Prismas {100} mit Pinakoid {001}', grau: true,
    muster: 'drei Pole auf dem Grundkreis im Abstand von 120° und der graue Punkt im Kreis des Pinakoids in der Mitte', pole: { mitte: 1, rand: 3, doppelt: 0, einzeln: 0 } },
  rhombDipyr: { form: 'sys=orthorhombisch&f=mmm:g7', der: 'die rhombische Dipyramide {111}', des: 'der rhombischen Dipyramide {111}',
    muster: 'vier Punkte im Kreis, nicht auf den Diagonalen, weil a ≠ b', pole: { mitte: 0, rand: 0, doppelt: 4, einzeln: 0 } },
};
/** Aufgaben: Kristall, Stufe, drei Ablenker (Kristalle mit ähnlichem, aber unterscheidbarem Stereogramm). */
const KOERPER_AUFGABEN = [
  ['wuerfel', 1, ['oktaeder', 'rhombendodekaeder', 'hexPrisma']],
  ['oktaeder', 1, ['wuerfel', 'tetraeder', 'rhombendodekaeder']],
  ['rhombendodekaeder', 1, ['wuerfel', 'oktaeder', 'tetraeder']],
  ['tetraeder', 1, ['oktaeder', 'wuerfel', 'rhombendodekaeder']],
  ['tetrPrisma', 1, ['hexPrisma', 'tetrDipyr', 'hexDipyr']],
  ['hexPrisma', 1, ['tetrPrisma', 'hexDipyr', 'trigPrisma']],
  ['tetrDipyr', 1, ['hexDipyr', 'tetrPrisma', 'rhombendodekaeder']],
  ['hexDipyr', 1, ['tetrDipyr', 'hexPrisma', 'rhombendodekaeder']],
  // Stufe 2: Ablenker, die sich nur in einer Einzelheit unterscheiden (●/○, Abstand vom Mittelpunkt, Azimut)
  ['rhomboeder', 2, ['hexDipyr', 'trigPrisma', 'tetraeder']],
  ['trigPrisma', 2, ['hexPrisma', 'tetrPrisma', 'rhomboeder']],
  ['rhombDipyr', 2, ['tetrDipyr', 'oktaeder', 'hexDipyr']],
  ['oktaeder', 2, ['tetrDipyr', 'rhombDipyr', 'tetraeder']],
].map(([k, stufe, abl]) => ({ id: stufe === 1 ? k : `${k}-2`, k, stufe, abl }));

const formHash = (k, lage) => `#m=form&${KOERPER[k].form}${lage && lage !== '001' ? `&lage=${lage}` : ''}`;
const stereo = (k, lage) => ({ app: `${formHash(k, lage)}&idx=0`, alt: 'Stereogramm' });
const zeichnung = (k, lage) => ({ app: `3d${formHash(k, lage)}`, alt: 'Räumliche Zeichnung eines Kristalls' });
const QUELLE_FORM = 'Folie 91 (Lernziel); Formen nach Borchardt-Ott & Sowa (2018), Abschn. 5.2 (S. 35), 5.4 (Abb. 5.13, S. 43) und Abb. 15.2 (S. 358–360)';

export const KOERPER_STEREO = {
  id: 'gen-koerper', kapitel: 2, stufen: [1, 2], status: 'entwurf',
  /** k:… Kristall → Stereogramm, s:… Stereogramm → Kristall */
  params: (stufe) => KOERPER_AUFGABEN.filter((a) => a.stufe === stufe).flatMap((a) => [`k:${a.id}`, `s:${a.id}`]),
  make(param) {
    const [richtung, id] = param.split(':');
    const a = KOERPER_AUFGABEN.find((x) => x.id === id);
    const e = KOERPER[a.k];
    const alle = [a.k, ...a.abl];
    const grau = e.grau ? GRAU : '';
    const gemeinsam = {
      lernziel: 'das Stereogramm einfacher Kristallformen zeichnen und ein Stereogramm einem Körper zuordnen',
      richtig: [0],
      erklaerung: `Der Kristall ist ${e.der}. Stereogramm dazu: ${e.muster}.${/Grundkreis|Mitte/.test(e.muster) ? ` ${REGEL}` : ''}${grau}`,
      skript: 'form',
      app: formHash(a.k),
      quelle: QUELLE_FORM,
    };
    if (richtung === 'k') {
      return {
        ...gemeinsam,
        typ: 'bild-bild',
        frage: `Welches Stereogramm zeigt die Flächenpole dieses Kristalls? ${PFEIL.replace('in den Zeichnungen', 'im Bild')}`,
        bild: zeichnung(a.k).app,
        bildAlt: 'Räumliche Zeichnung eines Kristalls',
        antworten: alle.map((k) => stereo(k)),
        hinweise: [null, ...a.abl.map((k) => `Das ist das Stereogramm ${KOERPER[k].des}: ${KOERPER[k].muster}.`)],
      };
    }
    return {
      ...gemeinsam,
      typ: 'bild-bild',
      frage: `Zu welchem Kristall gehört dieses Stereogramm? ${PFEIL}`,
      bild: stereo(a.k).app,
      bildAlt: 'Stereogramm der Flächenpole eines Kristalls',
      antworten: alle.map((k) => zeichnung(k)),
      hinweise: [null, ...a.abl.map((k) => `Das ist ${KOERPER[k].der}. Stereogramm dazu: ${KOERPER[k].muster}.`)],
    };
  },
};

// ------------------------------------------------------------------ Lage: Kristall in drei Projektionsrichtungen
/** Stereogramm je Lage in Worten (kubisch: [001], [111], [110] ∥ Projektionsrichtung) und Zählung für den Test. */
export const LAGE_MUSTER = {
  wuerfel: {
    '001': [KOERPER.wuerfel.muster, KOERPER.wuerfel.pole],
    111: ['sechs Pole im Abstand von 60°, abwechselnd ● und ○, bei ρ = 54,7°; in der Mitte liegt eine Ecke, kein Pol', { mitte: 0, rand: 0, doppelt: 0, einzeln: 6 }, [54.7]],
    110: ['zwei Pole auf dem Grundkreis (oben und unten) und zwei Punkte im Kreis (links und rechts), bei ρ = 45°', { mitte: 0, rand: 2, doppelt: 2, einzeln: 0 }, [45]],
  },
  oktaeder: {
    '001': [KOERPER.oktaeder.muster, KOERPER.oktaeder.pole, KOERPER.oktaeder.rho],
    111: ['ein Punkt im Kreis in der Mitte und sechs Pole im Abstand von 60°, abwechselnd ● und ○, bei ρ = 70,5°', { mitte: 1, rand: 0, doppelt: 0, einzeln: 6 }, [0, 70.5]],
    110: ['vier Pole auf dem Grundkreis und zwei Punkte im Kreis (oben und unten), bei ρ = 35,3°', { mitte: 0, rand: 4, doppelt: 2, einzeln: 0 }, [35.3]],
  },
  rhombendodekaeder: {
    '001': [KOERPER.rhombendodekaeder.muster, KOERPER.rhombendodekaeder.pole, KOERPER.rhombendodekaeder.rho],
    111: ['sechs Pole auf dem Grundkreis und sechs Pole im Abstand von 60°, abwechselnd ● und ○, bei ρ = 35,3°', { mitte: 0, rand: 6, doppelt: 0, einzeln: 6 }, [35.3]],
    110: ['ein Punkt im Kreis in der Mitte, zwei Pole auf dem Grundkreis (links und rechts) und vier Punkte im Kreis bei ρ = 60°', { mitte: 1, rand: 2, doppelt: 4, einzeln: 0 }, [0, 60]],
  },
};
const LAGE_ANDERER = { wuerfel: 'oktaeder', oktaeder: 'wuerfel', rhombendodekaeder: 'wuerfel' };
const LAGEN = ['001', '111', '110'];
const lageText = (l) => `[${l}]`;
/** Was die Lage sichtbar macht (Skript Kap. 2, „Andere Projektionsrichtung, gleicher Kristall“). */
const LAGE_SYMMETRIE = { '001': 'die vierzählige Symmetrie', 111: 'die dreizählige Symmetrie', 110: 'die zweizählige Symmetrie' };

export const LAGE = {
  id: 'gen-lage', kapitel: 2, stufen: [2], status: 'entwurf',
  params: () => Object.keys(LAGE_MUSTER).flatMap((k) => LAGEN.flatMap((l) => [`k:${k}:${l}`, `s:${k}:${l}`])),
  make(param) {
    const [richtung, k, lage] = param.split(':');
    const e = KOERPER[k], x = LAGE_ANDERER[k];
    const andere = LAGEN.filter((l) => l !== lage);
    const muster = (kk, l) => LAGE_MUSTER[kk][l][0];
    const gemeinsam = {
      typ: 'bild-bild',
      lernziel: 'erklären, was sich bei einer anderen Projektionsrichtung am Stereogramm ändert und was gleich bleibt',
      richtig: [0],
      erklaerung: `Hier ist ${lageText(lage)} die Projektionsrichtung; man sieht ${LAGE_SYMMETRIE[lage]} um diese Richtung. Stereogramm ${e.des}: ${muster(k, lage)}. `
        + 'Eine andere Projektionsrichtung dreht den Kristall auf der Umkugel: Das Stereogramm sieht anders aus, die Winkel zwischen den Flächennormalen bleiben gleich.',
      skript: 'lage',
      app: formHash(k, lage),
      quelle: 'Folie 91 (Lernziel); Borchardt-Ott & Sowa (2018), Abschn. 5.6 (Drehung eines Oktaeders, Abb. 5.23, S. 49)',
    };
    if (richtung === 'k') {
      return {
        ...gemeinsam,
        frage: `Welches Stereogramm zeigt die Flächenpole dieses Kristalls in der gezeichneten Lage? ${PFEIL.replace('in den Zeichnungen', 'im Bild')}`,
        bild: zeichnung(k, lage).app,
        bildAlt: 'Räumliche Zeichnung eines gedrehten Kristalls',
        antworten: [stereo(k, lage), ...andere.map((l) => stereo(k, l)), stereo(x, lage)],
        hinweise: [null, ...andere.map((l) => `Das ist das Stereogramm ${e.des} mit ${lageText(l)} als Projektionsrichtung: ${muster(k, l)}.`),
          `Das ist das Stereogramm ${KOERPER[x].des} in derselben Lage: ${muster(x, lage)}.`],
      };
    }
    return {
      ...gemeinsam,
      frage: `Welche Zeichnung zeigt den Kristall in der Lage, zu der dieses Stereogramm gehört? ${PFEIL}`,
      bild: stereo(k, lage).app,
      bildAlt: 'Stereogramm der Flächenpole eines Kristalls',
      antworten: [zeichnung(k, lage), ...andere.map((l) => zeichnung(k, l)), zeichnung(x, lage)],
      hinweise: [null, ...andere.map((l) => `Das ist ${e.der} mit ${lageText(l)} senkrecht. Stereogramm dazu: ${muster(k, l)}.`),
        `Das ist ${KOERPER[x].der} in derselben Lage. Stereogramm dazu: ${muster(x, lage)}.`],
    };
  },
};

// ------------------------------------------------------------------ Räumliches Symmetriegerüst ↔ Stereogramm
/** Kubische Gerüste mit vielen Elementen sind als feste Zeichnung nicht lesbar; sie bleiben bei gen-geruest. */
export const GERUEST3D_OHNE = ['m-3m', '432', '-43m', 'm-3'];
const geruest3d = (id) => ({ app: `3d#m=pg&g=${encodeURIComponent(id)}`, alt: 'Räumliche Zeichnung eines Symmetriegerüsts' });
const geruest2d = (id) => ({ app: `#m=pg&g=${encodeURIComponent(id)}&obj=0&farbe=0`, alt: 'Stereogramm eines Symmetriegerüsts' });

/** Ablenker wie bei gen-geruest, ohne die unlesbaren kubischen Gerüste (23 hat damit keine). */
const abl3d = (id) => geruestAblenker(id).filter((x) => !GERUEST3D_OHNE.includes(x.id));

export const GERUEST3D = {
  id: 'gen-geruest3d', kapitel: 3, stufen: [1, 2], status: 'entwurf',
  /** r:… Zeichnung → Stereogramm, s:… Stereogramm → Zeichnung */
  params: (stufe) => GERUEST.params(stufe).filter((id) => !GERUEST3D_OHNE.includes(id) && abl3d(id).length >= 3).flatMap((id) => [`r:${id}`, `s:${id}`]),
  make(param) {
    const [richtung, id] = param.split(':');
    const g = groupById(id);
    const info = buildPointGroup(id);
    const abl = abl3d(id);
    const step = Math.max(1, Math.floor(abl.length / 3));
    const wahl = [0, 1, 2].map((k) => abl[(k * step) % abl.length]).filter((x, i, a) => a.indexOf(x) === i);
    for (const x of abl) if (wahl.length < 3 && !wahl.includes(x)) wahl.push(x);
    const gemeinsam = {
      typ: 'bild-bild',
      richtig: [0],
      hinweise: [null, ...wahl.map((x) => unterschied(info, x))],
      erklaerung: `Das ist das Symmetriegerüst von ${hmHTML(g.hm)}: ${elementeText(info)}. Im Stereogramm erscheinen die Drehachsen als Durchstosspunkte mit ihrem Symbol und die Spiegelebenen als Grosskreise.`,
      skript: 'elemente',
      app: `#m=pg&g=${encodeURIComponent(id)}&obj=0`,
      quelle: 'Folien 89–91; nach Borchardt-Ott & Sowa (2018), Abschn. 5.4 (S. 43) und Abb. 7.8–7.13',
    };
    if (richtung === 'r') {
      return {
        ...gemeinsam,
        lernziel: 'die Symmetrieelemente einer Punktgruppe ins Stereogramm einzeichnen',
        frage: 'Welches Stereogramm zeigt dieses Symmetriegerüst? Die c-Achse zeigt in Projektionsrichtung, im Bild senkrecht (Pfeil).',
        bild: geruest3d(id).app,
        bildAlt: 'Räumliche Zeichnung eines Symmetriegerüsts',
        antworten: [geruest2d(id), ...wahl.map((x) => geruest2d(x.id))],
      };
    }
    return {
      ...gemeinsam,
      lernziel: 'ein Stereogramm einer Symmetrie zuordnen',
      frage: 'Welche räumliche Zeichnung zeigt das Symmetriegerüst zu diesem Stereogramm? Die c-Achse zeigt in Projektionsrichtung, in den Zeichnungen senkrecht (Pfeil).',
      bild: geruest2d(id).app,
      bildAlt: 'Stereogramm eines Symmetriegerüsts',
      antworten: [geruest3d(id), ...wahl.map((x) => geruest3d(x.id))],
    };
  },
};

export const GENERATOREN = [GERUEST, FLAECHENZAHL, FLAECHENSYM, KOERPER_STEREO, LAGE, GERUEST3D];
export { GERUEST_ALLE, GERUEST_STUFE1, POINT_GROUPS, SPEZIELL };
