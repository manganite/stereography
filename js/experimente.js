// Erzeugte Experimente (crystallography-common#92, #114): je Art viele Aufgaben aus den Daten der App, wie die
// Generatoren im Quiz. Die Aussagen rechnet die App mit denselben Modulen wie die Darstellung; ein Test prüft sie für
// jeden Parameter (tests/ablauf.test.mjs). Die festen Experimente stehen in js/hilfetexte.js.
import { POINT_GROUPS, groupById, buildPointGroup } from './pointgroups.js';
import { wyckoffPositions, siteOf } from './sitesym.js';
import { CATALOG, entryById, formName } from './forms.js';
import { SYSTEM_OF } from './polyhedra.js';
import { createState, applyHashTo, hashOf, generalPole } from './scene.js';
import { hmHTML, hklHTML } from '../lib/common/js/format.js';

/** @import { Erzeugt, Schritt } from '../lib/common/js/ablauf.js' */
/** @import { Punktgruppe } from './pointgroups.js' */
/** @import { Formeintrag } from './forms.js' */

/** Ordnung einer Punktgruppe. @param {string} id */
export const ordnung = (id) => buildPointGroup(id).ops.length;
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

/**
 * Ort des Pols in Worten, nach seiner Lagesymmetrie.
 * @param {string} fs Lagesymmetrie (Flächensymmetrie der Wyckoff-Lage)
 */
export function ortText(fs) {
  const { n, spiegel } = lage(fs);
  if (n === 1) return spiegel ? 'auf einer Spiegelebene' : 'in allgemeiner Lage, also auf keinem Symmetrieelement';
  if (!spiegel) return `auf einer ${n}-zähligen Drehachse`;
  return `auf einer ${n}-zähligen Achse, in der sich ${spiegel} Spiegelebenen schneiden`;
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
  const phi = ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360;
  // Pol auf der Achse (theta = 0): ohne Azimut
  const rho = theta > 90 ? theta - 180 : theta;
  const hash = `#m=pg&g=${encodeURIComponent(id)}&rho=${genau(rho)}${Math.abs(rho) < 1e-9 ? '' : `&az=${genau(phi)}`}`;
  return { id, wy, fs: w.fs, mult: w.mult, n: ordnung(id), hash };
}

/** Lage, die die App zur Adresse zeigt (wie im Modus „Punktgruppen“). @param {string} hash */
export function lageInDerApp(hash) {
  const s = createState(); applyHashTo(s, hash, DEFAULTS);
  const info = buildPointGroup(s.pg.id);
  return siteOf(s.pg.id, info, generalPole(s));
}

/**
 * Parameter der Polzahl: Gruppe:Wyckoff-Lage, für Gruppen ab 4 Operationen. Nur Lagen, die die App an der
 * Adresse ebenso zeigt (bei den monoklinen Gruppen liegt der Vertreter aus dem Formenkatalog sonst anders).
 */
export const POLZAHL_PARAMS = POINT_GROUPS.filter((g) => ordnung(g.id) >= 4)
  .flatMap((g) => wyckoffPositions(g.id).map((w) => `${g.id}:${w.wy}`))
  .filter((p) => { const d = polzahlDaten(p); const a = lageInDerApp(d.hash); return a.mult === d.mult && lage(a.fs ?? '1').symbol === lage(d.fs).symbol; });

/** Zwei Ablenker aus typischen Fehlern, ohne die richtige Zahl, jede höchstens einmal. @param {number} richtig @param {number[]} kand */
function ablenker(richtig, kand) {
  /** @type {number[]} */
  const out = [];
  for (const x of kand) if (x !== richtig && Number.isInteger(x) && x >= 1 && !out.includes(x) && out.length < 2) out.push(x);
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
  params: () => POLZAHL_PARAMS,
  make(p) {
    const d = polzahlDaten(p);
    const g = /** @type {Punktgruppe} */ (groupById(d.id));
    const l = lage(d.fs), k = l.ordnung;
    // typische Fehler: Lage vergessen (Ordnung der Gruppe), Ordnung der Lagesymmetrie, doppelt bzw. halb so viele
    const a = antworten(d.mult, ablenker(d.mult, [d.n, d.mult * 2, d.mult / 2, k, 1]));
    /** @type {Schritt} */
    const s = {
      frage: `${symbol(g)} hat ${d.n} Operationen. Der Ausgangspol liegt ${ortText(d.fs)}. Wie viele Pole entstehen?`,
      ...a,
      handlung: { text: `${symbol(g)} mit diesem Pol zeigen`, hash: d.hash },
      beobachtung: d.mult === 1 ? 'Ein einziger Pol.' : `${d.mult} Pole.`,
      erklaerung: k === 1
        ? `Jede der ${d.n} Operationen bringt den Pol an eine andere Stelle.`
        : `Die Lagesymmetrie ${hmHTML(l.symbol)} hat ${k} Operationen; sie halten den Pol fest. Pole mal Ordnung der Lagesymmetrie ergibt die Ordnung der Gruppe: ${d.mult} · ${k} = ${d.n}.`,
      skript: 'multiplizitaet',
    };
    return [s];
  },
};

/** Adresse, die nur diese Form zeigt (offen: ohne Ergänzungsformen). @param {Formeintrag} e */
const formAdresse = (e) => `#m=form&sys=${SYSTEM_OF[e.pg]}&f=${e.id}&offen=1`;
/** Systeme der Flächenzahl: dreizählige Indizes ohne Bravais-Miller, damit {hkl} eindeutig lesbar ist. */
const FZ_SYSTEME = ['kubisch', 'tetragonal', 'orthorhombisch'];
/**
 * Parameter der Flächenzahl: Formen ab 3 Flächen in Gruppen ab 8 Operationen, in der Standardaufstellung. Ohne
 * Formen, die die App unter der Gruppe der Holoedrie zeigt (gleicher Körper, z. B. das Oktaeder {111} in 432):
 * Sonst nennte die App eine andere Gruppe als die Frage.
 */
export const FLAECHENZAHL_PARAMS = CATALOG
  .filter((e) => !e.aufst && e.mult >= 3 && e.mult <= 24 && ordnung(e.pg) >= 8 && FZ_SYSTEME.includes(SYSTEM_OF[e.pg]))
  .filter((e) => { const s = createState(); applyHashTo(s, formAdresse(e), DEFAULTS); return new URLSearchParams(hashOf(s, DEFAULTS).slice(1)).get('f') === e.id; })
  .map((e) => e.id);

/** @type {Erzeugt} */
export const FLAECHENZAHL = {
  id: 'flaechenzahl-n', modus: 'poly', titel: 'Wie viele Flächen hat die Form?',
  params: () => FLAECHENZAHL_PARAMS,
  make(id) {
    const e = /** @type {Formeintrag} */ (entryById(id));
    const g = /** @type {Punktgruppe} */ (groupById(e.pg));
    const n = ordnung(e.pg), k = n / e.mult;
    const form = hklHTML(e.hkl, false, ['{', '}']);
    const a = antworten(e.mult, ablenker(e.mult, [n, e.mult * 2, e.mult / 2, n / 2, k]));
    /** @type {Schritt} */
    const s = {
      frage: `Wie viele Flächen hat die Form ${form} in ${symbol(g)} (${n} Operationen)?`,
      ...a,
      handlung: { text: `${form} in ${symbol(g)} zeigen`, hash: formAdresse(e) },
      beobachtung: `${e.mult} Flächen: ${formName(e)}.`,
      erklaerung: k === 1
        ? `Die allgemeine Form: Jede der ${n} Operationen bringt die Fläche an eine andere Stelle.`
        : `Die Flächensymmetrie ${hmHTML(lage(e.fs).symbol)} hat ${k} Operationen. Flächenzahl = Ordnung der Gruppe / Ordnung der Flächensymmetrie = ${n}/${k} = ${e.mult}.`,
      skript: 'multiplizitaet',
    };
    return [s];
  },
};

/** Alle erzeugten Experimente. */
export const ERZEUGTE = [POLZAHL, FLAECHENZAHL];
