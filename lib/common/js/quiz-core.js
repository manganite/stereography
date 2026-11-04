// Quiz: Auswahl, Ziehen, Auswerten und Fortschritt, ohne Zugriff auf die Seite (testbar mit Node).
// Die Seite (quiz-seite.js) zeigt die Fragen an. Fragen, Generatoren und Kapitel liefert die App.
//
// Frage (handgeschrieben, in der Fragenbank der App):
//   id, stufe (1–3), kapitel (Nummer im Skript), lernziel (wörtlich aus dem Skript), status ('entwurf' | 'geprüft'),
//   typ: 'einfach' | 'mehrfach' | 'bild-text' (Frage mit Bild) | 'text-bild' (Antworten sind Bilder)
//   | 'bild-bild' (Frage mit Bild, Antworten sind Bilder),
//   frage (HTML), bild (Bildangabe), bildAlt, bildOpt (an die Bildfunktion der App weitergereicht),
//   antworten (HTML bzw. bei 'text-bild' und 'bild-bild' { app: Bildangabe, alt }),
//   richtig (Indizes), hinweise (je Antwort: warum falsch; null bei richtigen),
//   erklaerung, skript (Anker im Skript), app (Link-Adresse einer Ansicht der App), quelle.
//   Bildangabe: was die Bildfunktion der App versteht, üblich eine Link-Adresse der App.
// Generator (erzeugte Fragen): { id, kapitel, status, stufen: [s], params(s) → [p], make(p, s) → Frage ohne
//   id, stufe, kapitel, status }; je Parameter entsteht eine Kandidatin.
//
// Die Typen dazu (Frage, Generator, Kapitel usw.) stehen unten; eine App bindet sie ein mit
//   /** @import { Frage, Generator, Kapitel } from '../lib/common/js/quiz-core.js' */

/** @typedef {1 | 2 | 3} Stufe */
/** @typedef {'entwurf' | 'geprüft'} Status */
/** @typedef {'einfach' | 'mehrfach' | 'bild-text' | 'text-bild' | 'bild-bild'} Fragetyp */
/** Was die Bildfunktion der App versteht, üblich eine Link-Adresse der App. @typedef {string} Bildangabe */
/** An die Bildfunktion der App weitergereicht; klein für Antwortbilder. @typedef {{ klein?: boolean, [name: string]: unknown }} BildOptionen */
/** Antwort als Bild (Fragetypen 'text-bild' und 'bild-bild'). @typedef {{ app: Bildangabe, alt: string }} Bildantwort */
/**
 * Inhalt einer Frage, ohne Einordnung (so liefert ihn ein Generator).
 * antworten: HTML bzw. bei 'text-bild' und 'bild-bild' Bilder; richtig: Indizes der richtigen Antworten;
 * hinweise: je Antwort, warum falsch (null bei richtigen); pruefung: Angaben für eine Nachrechnung in den Tests der
 * App (Aufbau legt die App fest; art, falls angegeben, nennt die Fragenliste als Art der Nachrechnung).
 * @typedef {object} Frageinhalt
 * @property {Fragetyp} typ
 * @property {string} frage
 * @property {string} [lernziel]
 * @property {Bildangabe} [bild]
 * @property {string} [bildAlt]
 * @property {BildOptionen} [bildOpt]
 * @property {(string | Bildantwort)[]} antworten
 * @property {number[]} richtig
 * @property {(string | null)[] | null} [hinweise]
 * @property {string} erklaerung
 * @property {string} [skript]
 * @property {string} [app]
 * @property {string} quelle
 * @property {{ art?: string, [name: string]: unknown }} [pruefung]
 */
/** Frage mit Einordnung. @typedef {Frageinhalt & { id: string, stufe: Stufe, kapitel: number, status: Status }} Frage */
/** Gestellte Frage: Antworten gemischt, key wie beim Kandidaten. @typedef {Frage & { key: string }} GestellteFrage */
/**
 * Erzeugte Fragen: je Stufe Parameter, je Parameter eine Frage.
 * @typedef {object} Generator
 * @property {string} id
 * @property {number} kapitel
 * @property {Status} status
 * @property {Stufe[]} stufen
 * @property {(s: Stufe) => string[]} params
 * @property {(p: string, s: Stufe) => Frageinhalt} make
 */
/** Kapitel des Skripts. @typedef {{ nr: number, titel: string, kurz: string, anker: string }} Kapitel */
/** Kandidat für ein Quiz: eine handgeschriebene Frage oder ein Parameter eines Generators. @typedef {{ key: string, stufe: Stufe, kapitel: number, frage?: Frage, gen?: Generator, param?: string }} Kandidat */
/** Antworten auf eine Frage: Versuche n, davon richtig r, letzte richtig (1) oder falsch (0), Zeitpunkt t. @typedef {{ n: number, r: number, letzte: 0 | 1, t: number }} Antwortstand */
/** Fortschritt im Browser. @typedef {{ v: 1, fragen: Record<string, Antwortstand> }} Fortschritt */

/** Die drei Stufen (Konzept „Quiz“, Abschnitt 2). @type {Record<Stufe, { name: string, text: string }>} */
export const STUFEN = {
  1: { name: 'Grundlagen', text: 'Hauptthemen des Grundstoffs: ein Begriff, ein Schritt, ein Bild.' },
  2: { name: 'Anwendung', text: 'Nur Grundstoff, aber mehrschrittig; auch Randthemen.' },
  3: { name: 'Vertiefung', text: 'Zusätzlich die Vertiefungen des Skripts.' },
};

/** Anteile der Stufen in einem Quiz der gewählten Stufe (höchste Stufe zuerst). @type {Record<Stufe, Partial<Record<Stufe, number>>>} */
export const ANTEILE = { 1: { 1: 1 }, 2: { 2: 0.7, 1: 0.3 }, 3: { 3: 0.5, 2: 0.3, 1: 0.2 } };
/** Höchstens dieser Anteil eines Quiz stammt aus demselben Generator. */
export const GEN_ANTEIL = 0.3;
/** Höchstens dieser Anteil eines Quiz sind erzeugte Fragen, alle Generatoren zusammen (Vorgabe 25.10.2026).
 *  Reichen die handgeschriebenen Fragen nicht, wird das Quiz kürzer. */
export const GEN_GESAMT = 0.5;

/**
 * Reproduzierbarer Zufall (mulberry32), für Tests mit festem Startwert.
 * @param {number} [seed]
 * @returns {() => number}
 */
export function rng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @template T
 * @param {readonly T[]} arr
 * @param {() => number} rand
 * @returns {T[]}
 */
export function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** @param {Status} status @param {boolean} entwurf */
const sichtbar = (status, entwurf) => status === 'geprüft' || entwurf;

/**
 * Alle Kandidaten für ein Quiz: handgeschriebene Fragen und je Generator eine Kandidatin je Parameter.
 * Kandidat: { key, stufe, kapitel, frage?: Frage, gen?: Generator, param? }.
 * @param {readonly Frage[]} bank
 * @param {readonly Generator[]} gens
 * @param {{ entwurf?: boolean }} [optionen]
 * @returns {Kandidat[]}
 */
export function kandidaten(bank, gens, { entwurf = false } = {}) {
  /** @type {Kandidat[]} */
  const out = [];
  for (const q of bank) if (sichtbar(q.status, entwurf)) out.push({ key: q.id, stufe: q.stufe, kapitel: q.kapitel, frage: q });
  for (const g of gens) {
    if (!sichtbar(g.status, entwurf)) continue;
    for (const s of g.stufen) for (const param of g.params(s)) out.push({ key: `${g.id}:${param}`, stufe: s, kapitel: g.kapitel, gen: g, param });
  }
  return out;
}

/**
 * Wie viele Kandidaten je Kapitel und Stufe (für die Startseite).
 * @param {readonly Kandidat[]} kands
 * @returns {Record<number, Record<Stufe, number>>}
 */
export function zaehlen(kands) {
  /** @type {Record<number, Record<Stufe, number>>} */
  const n = {};
  for (const k of kands) {
    n[k.kapitel] ??= { 1: 0, 2: 0, 3: 0 };
    n[k.kapitel][k.stufe] += 1;
  }
  return n;
}

/**
 * Vorrang beim Ziehen: nie beantwortet, zuletzt falsch, dann der Rest (je Gruppe zufällig).
 * @param {readonly Kandidat[]} list
 * @param {Fortschritt | null} progress
 * @param {() => number} rand
 */
function nachVorrang(list, progress, rand) {
  /** @param {Kandidat} k */
  const rank = (k) => { const p = progress?.fragen?.[k.key]; return !p ? 0 : p.letzte ? 2 : 1; };
  return shuffle(list, rand).sort((a, b) => rank(a) - rank(b));
}

/**
 * Zieht n Kandidaten für ein Quiz der Stufe `stufe` aus den gewählten Kapiteln.
 * Stufe s enthält auch Fragen der niedrigeren Stufen (ANTEILE); fehlt Nachschub, füllen die anderen Stufen auf.
 * `nur`: nur diese Schlüssel (Wiederholen der falsch beantworteten Fragen).
 * @param {readonly Kandidat[]} kands
 * @param {{ stufe: Stufe, kapitel?: number[] | null, n?: number, progress?: Fortschritt | null, rand?: () => number, nur?: string[] | null }} optionen
 * @returns {Kandidat[]}
 */
export function ziehen(kands, { stufe, kapitel = null, n = 10, progress = null, rand = Math.random, nur = null }) {
  let pool = kands.filter((k) => k.stufe <= stufe && (!kapitel || kapitel.includes(k.kapitel)));
  if (nur) pool = pool.filter((k) => nur.includes(k.key));
  const genMax = Math.max(1, Math.round(n * GEN_ANTEIL));
  // auch wenn das Quiz mangels handgeschriebener Fragen kürzer wird: g ≤ (h + g) · GEN_GESAMT, also g ≤ h · GEN_GESAMT / (1 − GEN_GESAMT)
  const hand = pool.filter((k) => !k.gen).length;
  const genGesamt = Math.min(Math.floor(n * GEN_GESAMT), Math.floor((hand * GEN_GESAMT) / (1 - GEN_GESAMT)));
  /** @type {Record<string, number>} */
  const genZahl = {};
  let genSumme = 0;
  /** @type {Kandidat[]} */
  const gewaehlt = [];
  /** @param {Kandidat} k */
  const nimm = (k) => {
    if (gewaehlt.length >= n || gewaehlt.includes(k)) return false;
    if (k.gen && !nur) {
      if ((genZahl[k.gen.id] || 0) >= genMax || genSumme >= genGesamt) return false;
      genZahl[k.gen.id] = (genZahl[k.gen.id] || 0) + 1;
      genSumme += 1;
    }
    gewaehlt.push(k);
    return true;
  };
  const anteile = ANTEILE[stufe];
  for (const s of /** @type {Stufe[]} */ (Object.keys(anteile).map(Number)).sort((a, b) => b - a)) {
    const soll = Math.round(n * /** @type {number} */ (anteile[s]));
    let genommen = 0;
    for (const k of nachVorrang(pool.filter((x) => x.stufe === s), progress, rand)) {
      if (genommen >= soll) break;
      if (nimm(k)) genommen += 1;
    }
  }
  // auffüllen, wenn eine Stufe zu wenige Fragen hat
  for (const k of nachVorrang(pool, progress, rand)) { if (gewaehlt.length >= n) break; nimm(k); }
  return shuffle(gewaehlt, rand);
}

/**
 * Konkrete Frage zu einem Kandidaten, mit gemischten Antworten (richtig und hinweise umnummeriert).
 * @param {Kandidat} kand
 * @param {() => number} [rand]
 * @returns {GestellteFrage}
 */
export function stellen(kand, rand = Math.random) {
  // ohne Frage stammt der Kandidat von einem Generator (kandidaten())
  const gen = /** @type {Generator} */ (kand.gen);
  const q0 = kand.frage || { ...gen.make(/** @type {string} */ (kand.param), kand.stufe), id: kand.key, stufe: kand.stufe, kapitel: gen.kapitel, status: gen.status };
  const order = shuffle(q0.antworten.map((_, i) => i), rand);
  const h = q0.hinweise;
  return {
    ...q0,
    key: kand.key,
    antworten: order.map((i) => q0.antworten[i]),
    hinweise: h ? order.map((i) => h[i]) : null,
    richtig: q0.richtig.map((i) => order.indexOf(i)).sort((a, b) => a - b),
  };
}

/**
 * Richtig nur, wenn genau die richtigen Antworten gewählt sind.
 * @param {{ richtig: readonly number[] }} q
 * @param {readonly number[]} gewaehlt
 */
export function pruefen(q, gewaehlt) {
  const a = [...new Set(gewaehlt)].sort((x, y) => x - y);
  return a.length === q.richtig.length && a.every((x, i) => x === q.richtig[i]);
}

// ------------------------------------------------------------------ Fortschritt (lokal im Browser)
/** @returns {Fortschritt} */
export const leererFortschritt = () => ({ v: 1, fragen: {} });

/**
 * Gespeicherten Fortschritt lesen; Unbrauchbares ergibt einen leeren Fortschritt.
 * @param {string | null} text
 * @returns {Fortschritt}
 */
export function fortschrittAus(text) {
  try {
    const p = JSON.parse(/** @type {string} */ (text)); // null (nichts gespeichert) ergibt null
    if (p && p.v === 1 && p.fragen && typeof p.fragen === 'object') return p;
  } catch { /* leer weiter */ }
  return leererFortschritt();
}

/**
 * Antwort vermerken: Zahl der Versuche n, davon richtig r, letzte Antwort richtig (1) oder falsch (0).
 * @param {Fortschritt} progress
 * @param {string} key
 * @param {boolean} ok
 * @param {number} [t]
 */
export function vermerken(progress, key, ok, t = Date.now()) {
  const p = progress.fragen[key] || { n: 0, r: 0, letzte: 0, t: 0 };
  progress.fragen[key] = { n: p.n + 1, r: p.r + (ok ? 1 : 0), letzte: ok ? 1 : 0, t };
  return progress;
}

/**
 * Je Kapitel: Zahl der Kandidaten und davon zuletzt richtig beantwortet.
 * @param {readonly Kandidat[]} kands
 * @param {Fortschritt} progress
 * @returns {Record<number, { gesamt: number, richtig: number }>}
 */
export function stand(kands, progress) {
  /** @type {Record<number, { gesamt: number, richtig: number }>} */
  const out = {};
  for (const k of kands) {
    out[k.kapitel] ??= { gesamt: 0, richtig: 0 };
    out[k.kapitel].gesamt += 1;
    if (progress.fragen[k.key]?.letzte) out[k.kapitel].richtig += 1;
  }
  return out;
}
