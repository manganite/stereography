// Quiz: Auswahl, Ziehen, Auswerten und Fortschritt, ohne Zugriff auf die Seite (testbar mit Node).
// Die Seite (quiz.js) zeigt die Fragen an; die Fragen stehen in quiz-bank.js, die erzeugten in quiz-gen.js.

/** Die drei Stufen (Konzept „Quiz“, Abschnitt 2). */
export const STUFEN = {
  1: { name: 'Grundlagen', text: 'Hauptthemen der Vorlesung: ein Begriff, ein Schritt, ein Bild.' },
  2: { name: 'Anwendung', text: 'Nur Vorlesungsstoff, aber mehrschrittig; auch Randthemen der Vorlesung.' },
  3: { name: 'Vertiefung', text: 'Zusätzlich die Vertiefungen des Skripts.' },
};

/** Kapitel des Skripts mit Anker (skript.html#…). */
export const KAPITEL = [
  { nr: 1, titel: 'Die stereographische Projektion', anker: 'projektion' },
  { nr: 2, titel: 'Kristallformen im Stereogramm', anker: 'formen' },
  { nr: 3, titel: 'Symmetriegerüste im Stereogramm', anker: 'symmetrie' },
  { nr: 4, titel: 'Zonen', anker: 'zonen' },
  { nr: 5, titel: 'Tracht und Habitus', anker: 'habitus' },
  { nr: 6, titel: 'Blickrichtungen', anker: 'blickrichtungen' },
  { nr: 7, titel: 'Hexagonale Achsen und vierstellige Indizes', anker: 'hexagonal' },
  { nr: 8, titel: 'Lagen, Flächensymmetrie und Multiplizität', anker: 'lagen' },
  { nr: 9, titel: 'Symmetrieändernde Verzerrungen', anker: 'verzerrung' },
];

/** Anteile der Stufen in einem Quiz der gewählten Stufe (höchste Stufe zuerst). */
export const ANTEILE = { 1: { 1: 1 }, 2: { 2: 0.7, 1: 0.3 }, 3: { 3: 0.5, 2: 0.3, 1: 0.2 } };
/** Höchstens dieser Anteil eines Quiz stammt aus demselben Generator. */
export const GEN_ANTEIL = 0.3;

/** Reproduzierbarer Zufall (mulberry32), für Tests mit festem Startwert. */
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

export function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sichtbar = (status, entwurf) => status === 'geprüft' || entwurf;

/**
 * Alle Kandidaten für ein Quiz: handgeschriebene Fragen und je Generator eine Kandidatin je Parameter.
 * Kandidat: { key, stufe, kapitel, frage?: Frage, gen?: Generator, param? }.
 */
export function kandidaten(bank, gens, { entwurf = false } = {}) {
  const out = [];
  for (const q of bank) if (sichtbar(q.status, entwurf)) out.push({ key: q.id, stufe: q.stufe, kapitel: q.kapitel, frage: q });
  for (const g of gens) {
    if (!sichtbar(g.status, entwurf)) continue;
    for (const s of g.stufen) for (const param of g.params(s)) out.push({ key: `${g.id}:${param}`, stufe: s, kapitel: g.kapitel, gen: g, param });
  }
  return out;
}

/** Wie viele Kandidaten je Kapitel und Stufe (für die Startseite). */
export function zaehlen(kands) {
  const n = {};
  for (const k of kands) {
    n[k.kapitel] ??= { 1: 0, 2: 0, 3: 0 };
    n[k.kapitel][k.stufe] += 1;
  }
  return n;
}

/** Vorrang beim Ziehen: nie beantwortet, zuletzt falsch, dann der Rest (je Gruppe zufällig). */
function nachVorrang(list, progress, rand) {
  const rank = (k) => { const p = progress?.fragen?.[k.key]; return !p ? 0 : p.letzte ? 2 : 1; };
  return shuffle(list, rand).sort((a, b) => rank(a) - rank(b));
}

/**
 * Zieht n Kandidaten für ein Quiz der Stufe `stufe` aus den gewählten Kapiteln.
 * Stufe s enthält auch Fragen der niedrigeren Stufen (ANTEILE); fehlt Nachschub, füllen die anderen Stufen auf.
 * `nur`: nur diese Schlüssel (Wiederholen der falsch beantworteten Fragen).
 */
export function ziehen(kands, { stufe, kapitel = null, n = 10, progress = null, rand = Math.random, nur = null }) {
  let pool = kands.filter((k) => k.stufe <= stufe && (!kapitel || kapitel.includes(k.kapitel)));
  if (nur) pool = pool.filter((k) => nur.includes(k.key));
  const genMax = Math.max(1, Math.round(n * GEN_ANTEIL));
  const genZahl = {};
  const gewaehlt = [];
  const nimm = (k) => {
    if (gewaehlt.length >= n || gewaehlt.includes(k)) return false;
    if (k.gen && !nur) {
      if ((genZahl[k.gen.id] || 0) >= genMax) return false;
      genZahl[k.gen.id] = (genZahl[k.gen.id] || 0) + 1;
    }
    gewaehlt.push(k);
    return true;
  };
  const anteile = ANTEILE[stufe];
  for (const s of Object.keys(anteile).map(Number).sort((a, b) => b - a)) {
    const soll = Math.round(n * anteile[s]);
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

/** Konkrete Frage zu einem Kandidaten, mit gemischten Antworten (richtig und hinweise umnummeriert). */
export function stellen(kand, rand = Math.random) {
  const q0 = kand.frage || { ...kand.gen.make(kand.param, kand.stufe), id: kand.key, stufe: kand.stufe, kapitel: kand.gen.kapitel, status: kand.gen.status };
  const order = shuffle(q0.antworten.map((_, i) => i), rand);
  return {
    ...q0,
    key: kand.key,
    antworten: order.map((i) => q0.antworten[i]),
    hinweise: q0.hinweise ? order.map((i) => q0.hinweise[i]) : null,
    richtig: q0.richtig.map((i) => order.indexOf(i)).sort((a, b) => a - b),
  };
}

/** Richtig nur, wenn genau die richtigen Antworten gewählt sind. */
export function pruefen(q, gewaehlt) {
  const a = [...new Set(gewaehlt)].sort((x, y) => x - y);
  return a.length === q.richtig.length && a.every((x, i) => x === q.richtig[i]);
}

// ------------------------------------------------------------------ Fortschritt (lokal im Browser)
export const SPEICHER = 'stereo-quiz-v1';

export const leererFortschritt = () => ({ v: 1, fragen: {} });

/** Gespeicherten Fortschritt lesen; Unbrauchbares ergibt einen leeren Fortschritt. */
export function fortschrittAus(text) {
  try {
    const p = JSON.parse(text);
    if (p && p.v === 1 && p.fragen && typeof p.fragen === 'object') return p;
  } catch { /* leer weiter */ }
  return leererFortschritt();
}

/** Antwort vermerken: Zahl der Versuche n, davon richtig r, letzte Antwort richtig (1) oder falsch (0). */
export function vermerken(progress, key, ok, t = Date.now()) {
  const p = progress.fragen[key] || { n: 0, r: 0, letzte: 0, t: 0 };
  progress.fragen[key] = { n: p.n + 1, r: p.r + (ok ? 1 : 0), letzte: ok ? 1 : 0, t };
  return progress;
}

/** Je Kapitel: Zahl der Kandidaten und davon zuletzt richtig beantwortet. */
export function stand(kands, progress) {
  const out = {};
  for (const k of kands) {
    out[k.kapitel] ??= { gesamt: 0, richtig: 0 };
    out[k.kapitel].gesamt += 1;
    if (progress.fragen[k.key]?.letzte) out[k.kapitel].richtig += 1;
  }
  return out;
}
