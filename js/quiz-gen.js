// Erzeugte Fragen: aus den Daten der App, die schon getestet sind, mit sicherer richtiger Antwort.
// Ein Generator: { id, kapitel, stufen, status, params(stufe) → Parameter, make(param, stufe) → Frage }.
// Die Frage hat denselben Aufbau wie in quiz-bank.js (ohne id, stufe, kapitel, status; die setzt quiz-core.js).

import { POINT_GROUPS, groupById, buildPointGroup, symmetryDirections, elementSummary } from './pointgroups.js';
import { hmHTML } from './format.js';

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
function elementeText(info) {
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
  if (g.system === 'monoklin') return `${blick} Symbol ${hmHTML(g.hm)} (Standardaufstellung mit b als ausgezeichneter Achse; gebräuchlich ist auch c).`;
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
function unterschied(gezeigt, x) {
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

export const GENERATOREN = [GERUEST];
export { GERUEST_ALLE, GERUEST_STUFE1, POINT_GROUPS };
