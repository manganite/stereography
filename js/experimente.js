// Erzeugte Experimente (crystallography-common#92, #114): je Art viele Aufgaben aus den Daten der App, wie die
// Generatoren im Quiz. Die Aussagen rechnet die App mit denselben Modulen wie die Darstellung; ein Test prüft sie für
// jeden Parameter (tests/ablauf.test.mjs). Die festen Experimente stehen in js/hilfetexte.js.
import { POINT_GROUPS, groupById, buildPointGroup } from './pointgroups.js';
import { wyckoffPositions, siteOf } from './sitesym.js';
import { CATALOG, entryById, formName } from './forms.js';
import { SYSTEM_OF } from './polyhedra.js';
import { createState, applyHashTo, hashOf, generalPole, rhoOf } from './scene.js';
import { hmHTML, hklHTML } from '../lib/common/js/format.js';

/** @import { Erzeugt, Schritt } from '../lib/common/js/ablauf.js' */
/** @import { Punktgruppe } from './pointgroups.js' */
/** @import { Formeintrag } from './forms.js' */

/** @type {Map<string, number>} */
const ORDNUNGEN = new Map();
/** Ordnung einer Punktgruppe. @param {string} id */
export const ordnung = (id) => { let n = ORDNUNGEN.get(id); if (n === undefined) { n = buildPointGroup(id).ops.length; ORDNUNGEN.set(id, n); } return n; };
/**
 * Ergebnis beim ersten Aufruf berechnen und merken (die Parameter erst bei Bedarf, nicht beim Laden).
 * @template T @param {() => T} f @returns {() => T}
 */
function einmal(f) {
  /** @type {{ v: T } | null} */
  let c = null;
  return () => (c ??= { v: f() }).v;
}
/** Symbol wie in der Auswahl der App (trigonale Gruppen in ihrer Aufstellung). @param {Punktgruppe} g */
const symbol = (g) => hmHTML(g.system === 'trigonal' && g.setting ? g.setting : g.hm);
const DEFAULTS = createState();
/** Zahl auf vier Stellen wie in der Link-Adresse der App. @param {number} x */
const genau = (x) => String(Number(x.toFixed(4)));
/**
 * Lagesymmetrie eines Pols ohne Blickrichtungen (die Wyckoff-Tabellen schreiben sie orientiert, z. B. „..m“,
 * „4m.m“): n-zählige Achse und ob Spiegelebenen hindurchgehen; Symbol und Ordnung.
 * @param {string} fs
 */
export function lage(fs) {
  const s = fs.replace(/\./g, '');
  const n = Math.max(1, ...[...s].filter((c) => /\d/.test(c)).map(Number));
  const m = s.includes('m');
  const spiegel = !m ? 0 : n === 1 ? 1 : n === 2 ? 2 : n;
  const symbol = !m ? String(n) : n === 1 ? 'm' : n === 2 ? 'mm2' : n === 3 ? '3m' : `${n}mm`;
  return { n, spiegel, symbol, ordnung: n * (spiegel ? 2 : 1) };
}

/** Drehanteil einer Drehinversionsachse, der den Pol festhält: Text. @type {Record<string, string>} */
const DREHANTEIL = { '-3': 'halten nur die Drehungen um 120° und 240°', '-4': 'hält nur die Drehung um 180°', '-6': 'halten nur die Drehungen um 120° und 240°' };

/**
 * Achse der Gruppe entlang des Pols, wie die App sie in den Kenndaten nennt (z. B. „-4“), oder null.
 * @param {string} id Punktgruppe @param {import('../lib/common/js/typen.js').Vec3} p
 */
export function achseAmPol(id, p) {
  const a = buildPointGroup(id).axes.find((x) => Math.abs(x.dir[0] * p[0] + x.dir[1] * p[1] + x.dir[2] * p[2]) > 1 - 1e-6);
  return a ? a.symbol : null;
}

/**
 * Ort des Pols in Worten: nach dem Symmetrieelement, wie es die App zeigt (eine Drehinversionsachse heisst so, auch
 * wenn den Pol nur ihr Drehanteil festhält), dazu die Spiegelebenen durch den Pol aus der Lagesymmetrie.
 * @param {string} fs Lagesymmetrie (Flächensymmetrie der Wyckoff-Lage) @param {string | null} achse Symbol der Achse am Pol
 */
export function ortText(fs, achse) {
  const { n, spiegel } = lage(fs);
  const ebenen = spiegel ? `, in der sich ${spiegel} Spiegelebenen schneiden` : '';
  if (achse && achse.startsWith('-')) return `auf einer <span class="ov">${achse.slice(1)}</span>-Achse${ebenen}`;
  if (n === 1) return spiegel ? 'auf einer Spiegelebene' : 'in allgemeiner Lage, also auf keinem Symmetrieelement';
  if (!spiegel) return `auf einer ${n}-zähligen Drehachse`;
  return `auf einer ${n}-zähligen Achse${ebenen}`;
}


/**
 * Adresse und Kenndaten zu einem Parameter der Polzahl.
 * @param {string} p Gruppe:Wyckoff-Lage
 */
export function polzahlDaten(p) {
  const i = p.lastIndexOf(':');
  const id = p.slice(0, i), wy = p.slice(i + 1);
  const w = /** @type {import('./sitesym.js').Wyckofflage} */ (wyckoffPositions(id).find((x) => x.wy === wy));
  const [x, y, z] = w.rep;
  const theta = Math.acos(Math.max(-1, Math.min(1, z))) * 180 / Math.PI;
  // Azimut wie in der App (generalPole in scene.js): von b zur a-Achse gemessen
  const phi = ((Math.atan2(x, y) * 180 / Math.PI) % 360 + 360) % 360;
  const rho = rhoOf(theta);
  // Pol auf der Achse (theta = 0): ohne Azimut
  const hash = `#m=pg&g=${encodeURIComponent(id)}&rho=${genau(rho)}${Math.abs(rho) < 1e-9 ? '' : `&az=${genau(phi)}`}`;
  return { id, wy, fs: w.fs, mult: w.mult, n: ordnung(id), hash, achse: achseAmPol(id, w.rep) };
}

/** Lage, die die App zur Adresse zeigt (wie im Modus „Punktgruppen“). @param {string} hash */
export function lageInDerApp(hash) {
  const s = createState(); applyHashTo(s, hash, DEFAULTS);
  const info = buildPointGroup(s.pg.id);
  return siteOf(s.pg.id, info, generalPole(s));
}

/** Frage der Polzahl zu einem Parameter. @param {string} p */
const polzahlFrage = (p) => {
  const d = polzahlDaten(p);
  return `${symbol(/** @type {Punktgruppe} */ (groupById(d.id)))} hat ${d.n} Operationen. Der Ausgangspol liegt ${ortText(d.fs, d.achse)}. Wie viele Pole entstehen?`;
};

/**
 * Parameter der Polzahl: Gruppe:Wyckoff-Lage, für Gruppen ab 4 Operationen. Lagen mit gleichem Wortlaut der Frage
 * (z. B. die drei 2-zähligen Achsen in 222, beide Aufstellungen von 2/m) nur einmal.
 */
export const POLZAHL_PARAMS = einmal(/** @returns {string[]} */ () => {
  const gesehen = new Set();
  return POINT_GROUPS.filter((g) => ordnung(g.id) >= 4)
    .flatMap((g) => wyckoffPositions(g.id).map((w) => `${g.id}:${w.wy}`))
    .filter((p) => { const f = polzahlFrage(p); if (gesehen.has(f)) return false; gesehen.add(f); return true; });
});

/**
 * Zwei Ablenker aus typischen Fehlern, ohne die richtige Zahl, jede höchstens einmal und nicht grösser als die
 * Ordnung der Gruppe (die die Frage nennt).
 * @param {number} richtig @param {number} n Ordnung der Gruppe @param {number[]} kand
 */
function ablenker(richtig, n, kand) {
  /** @type {number[]} */
  const out = [];
  for (const x of kand) if (x !== richtig && Number.isInteger(x) && x >= 1 && x <= n && !out.includes(x) && out.length < 2) out.push(x);
  return out;
}

/** Antworten aufsteigend, die richtige darunter; Rückgabe Texte und Index der richtigen. @param {number} richtig @param {number[]} falsch */
function antworten(richtig, falsch) {
  const alle = [richtig, ...falsch].sort((a, b) => a - b);
  return { vermutung: alle.map(String), richtig: alle.indexOf(richtig) };
}

/** @type {Erzeugt} */
export const POLZAHL = {
  id: 'polzahl', modus: 'pg', titel: 'Wie viele Pole?',
  params: POLZAHL_PARAMS,
  make(p) {
    const d = polzahlDaten(p);
    const g = /** @type {Punktgruppe} */ (groupById(d.id));
    const k = lage(d.fs).ordnung;
    // typische Fehler: Lage vergessen (Ordnung der Gruppe), Ordnung der Lagesymmetrie, doppelt bzw. halb so viele
    const a = antworten(d.mult, ablenker(d.mult, d.n, [d.n, d.mult * 2, d.mult / 2, k, 1]));
    const dreh = d.achse && d.achse.startsWith('-') ? `Von der <span class="ov">${d.achse.slice(1)}</span>-Achse ${DREHANTEIL[d.achse]} den Pol fest. ` : '';
    /** @type {Schritt} */
    const s = {
      frage: polzahlFrage(p),
      ...a,
      handlung: { text: `${symbol(g)} mit diesem Pol zeigen`, hash: d.hash },
      beobachtung: d.mult === 1 ? 'Ein einziger Pol.' : `${d.mult} Pole.`,
      erklaerung: k === 1
        ? `Jede der ${d.n} Operationen bringt den Pol an eine andere Stelle.`
        : `${dreh}Die Lagesymmetrie ${hmHTML(d.fs)} hat ${k} Operationen; sie halten den Pol fest. Pole mal Ordnung der Lagesymmetrie ergibt die Ordnung der Gruppe: ${d.mult} · ${k} = ${d.n}.`,
      skript: 'multiplizitaet',
    };
    return [s];
  },
};

/** Adresse, die nur diese Form zeigt (offen: ohne Ergänzungsformen). @param {Formeintrag} e */
const formAdresse = (e) => `#m=form&sys=${SYSTEM_OF[e.pg]}&f=${e.id}&offen=1`;
/** Form, die die App zur Adresse eines Katalogeintrags zeigt (id). @param {Formeintrag} e */
export const gezeigteForm = (e) => { const s = createState(); applyHashTo(s, formAdresse(e), DEFAULTS); return new URLSearchParams(hashOf(s, DEFAULTS).slice(1)).get('f'); };
/** Kandidaten der Flächenzahl: Formen ab 3 Flächen in Gruppen ab 4 Operationen, in der Standardaufstellung. */
export const FZ_KANDIDATEN = einmal(/** @returns {Formeintrag[]} */ () => CATALOG.filter((e) => !e.aufst && e.mult >= 3 && ordnung(e.pg) >= 4));
/**
 * Parameter der Flächenzahl: die Kandidaten ohne die Formen, die die App unter der Gruppe der Holoedrie zeigt
 * (gleicher Körper, z. B. das Oktaeder {111} in 432 als Oktaeder von m3̄m): Sonst nennte die App eine andere
 * Gruppe als die Frage.
 */
export const FLAECHENZAHL_PARAMS = einmal(/** @returns {string[]} */ () => FZ_KANDIDATEN().filter((e) => gezeigteForm(e) === e.id).map((e) => e.id));

/** @type {Erzeugt} */
export const FLAECHENZAHL = {
  id: 'flaechenzahl-form', modus: 'poly', titel: 'Flächenzahl einer Form',
  params: FLAECHENZAHL_PARAMS,
  make(id) {
    const e = /** @type {Formeintrag} */ (entryById(id));
    const g = /** @type {Punktgruppe} */ (groupById(e.pg));
    const n = ordnung(e.pg), k = n / e.mult;
    const form = hklHTML(e.hkl, false, ['{', '}']);
    const a = antworten(e.mult, ablenker(e.mult, n, [n, e.mult * 2, e.mult / 2, n / 2, k, n / 4]));
    /** @type {Schritt} */
    const s = {
      frage: `Wie viele Flächen hat die Form ${form} in ${symbol(g)} (${n} Operationen)?`,
      ...a,
      handlung: { text: `${form} in ${symbol(g)} zeigen`, hash: formAdresse(e) },
      beobachtung: `${e.mult} Flächen: ${formName(e)}.`,
      erklaerung: k === 1
        ? `Die allgemeine Form: Jede der ${n} Operationen bringt die Fläche an eine andere Stelle.`
        : `Die Flächensymmetrie ${hmHTML(e.fs)} hat ${k} Operationen. Flächenzahl = Ordnung der Gruppe / Ordnung der Flächensymmetrie = ${n}/${k} = ${e.mult}.`,
      skript: 'multiplizitaet',
    };
    return [s];
  },
};

/** Alle erzeugten Experimente. */
export const ERZEUGTE = [POLZAHL, FLAECHENZAHL];
