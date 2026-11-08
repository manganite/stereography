// Geführte Abläufe (Experimente, Erste Schritte, später die geführte Bestimmung, #87): je Schritt
// Frage → Vermutung → Handlung → Beobachtung → Erklärung. Die App bleibt dabei normal bedienbar; die Handlung setzt
// den Zustand über die Link-Adresse (Ausnahme: eine benannte Aktion der App). Vor der Handlung merkt sich der
// Ablauf die Adresse; danach schaltet „Vorher/Nachher“ zwischen beiden um (#69).
// Die Abläufe selbst sind Daten der App (Leitfaden Abschn. 9); Texte dürfen einfaches HTML enthalten (<i>, <b>,
// <sub>), sie stammen aus der App und nicht aus Eingaben. pruefeAblaeufe() hilft den Tests der App.
// Der Stand der Experimente wird wie der Fortschritt im Quiz gespeichert (#91, gleicher Aufbau wie in quiz-core.js).

import { leererFortschritt, fortschrittAus, vermerken, vorrang } from './quiz-core.js';

/** @import { Fortschritt } from './quiz-core.js' */

/**
 * Handlung eines Schritts: Text des Knopfs und entweder eine Link-Adresse (`#…`, Regelfall, auch für die Hilfeseite)
 * oder der Name einer Aktion der App (für Bedienhandlungen, die nicht in der Adresse stehen).
 * @typedef {{ text: string, hash?: string, aktion?: string }} Handlung
 */
/**
 * Schritt. Drei Arten:
 * - Experiment: handlung, dazu meist vermutung (2–3 Antworten) mit richtig (Index der zutreffenden, nach der
 *   Beobachtung markiert, ohne Punkte). Mit Antworten ist die Handlung gesperrt, bis eine gewählt ist.
 * - Frage ohne Handlung: die Wahl beantwortet sie (z. B. Ja/Nein bei der Bestimmung); weiter führt je Antwort
 *   (Index als Schlüssel) zur id eines Schritts. Die Antwort lässt sich ändern.
 * - Text: nur frage (z. B. ein Ergebnis), dazu beobachtung oder erklaerung.
 * In einem Ablauf mit Verzweigung endet ein Schritt ohne weiter den Ablauf; sonst geht es der Reihe nach weiter.
 * skript: Anker im Skript (ohne #). Für die Hilfeseite (Erste Schritte, `hilfe-seite.js`; in der App ohne Wirkung):
 * zeige = CSS-Selektor des Bedienelements, das das Bild des Schritts markiert; bild = Link-Adresse des Zustands im
 * Bild, wo er nicht aus den Adressen der vorigen Schritte folgt (z. B. nach einer Aktion).
 * @typedef {{ id?: string, frage: string, vermutung?: string[], richtig?: number, handlung?: Handlung,
 *   beobachtung?: string, erklaerung?: string, skript?: string, weiter?: Record<string, string>, zeige?: string,
 *   bild?: string }} Schritt
 */
/**
 * Ablauf (Lernexperiment) mit festen Schritten. modus: Modus der App, in dem er angeboten wird. variante: bei
 * einem aus einem erzeugten Experiment gebildeten Ablauf dessen Parameter (setzt ablaufKarte).
 * @typedef {{ id: string, modus?: string, titel: string, schritte: Schritt[], variante?: string }} Ablauf
 */
/**
 * Erzeugtes Experiment (#92, wie ein Generator im Quiz): params() liefert die Parameter, make(p) die Schritte zu
 * einem Parameter. Es bietet am Ende „Neue Aufgabe“ an; sein Stand steht unter `<id>:<parameter>`.
 * @typedef {{ id: string, modus?: string, titel: string, params: () => string[], make: (p: string) => Schritt[] }} Erzeugt
 */
/** Eintrag der Karte: fester oder erzeugter Ablauf. @typedef {Ablauf | Erzeugt} Experiment */
/**
 * Stand eines laufenden Ablaufs. weg: Indizes der besuchten Schritte (für „Zurück“), gewaehlt: Antwort je
 * Schrittindex, erste: Antwort, die bei der Auflösung galt (zählt für das Ergebnis, auch wenn sie danach geändert
 * wird), gezeigt: Schritte, deren Beobachtung sichtbar ist, vorher/nachher: Adressen um die Handlung,
 * zurueck: Adresse beim Umschalten auf „Vorher“ (dorthin führt „Nachher“), vorherAktiv: „Vorher“ ist angewandt.
 * @typedef {{ ablauf: Ablauf, weg: number[], gewaehlt: Record<number, number>, erste: Record<number, number>, gezeigt: Set<number>,
 *   vorher: Record<number, string>, nachher: Record<number, string>, zurueck: string | null, vorherAktiv: boolean }} Stand
 */

/** Index eines Schritts nach id. @param {Ablauf} a @param {string} id */
const indexVon = (a, id) => a.schritte.findIndex((s) => s.id === id);
/** Hat der Ablauf Verzweigungen? @param {Ablauf} a */
const verzweigt = (a) => a.schritte.some((s) => s.weiter);
/** Wird der Ablauf erzeugt? @param {Experiment} a @returns {a is Erzeugt} */
export const erzeugt = (a) => 'params' in a;
/** Ablauf zu einem Parameter eines erzeugten Experiments. @param {Erzeugt} a @param {string} p @returns {Ablauf} */
export const variante = (a, p) => ({ id: a.id, modus: a.modus, titel: a.titel, variante: p, schritte: a.make(p) });
/** Schlüssel im Stand: id, bei erzeugten Abläufen id:parameter. @param {Ablauf} a */
export const schluessel = (a) => (a.variante === undefined ? a.id : `${a.id}:${a.variante}`);
/** Art eines Schritts. @param {Schritt} s @returns {'experiment' | 'frage' | 'text'} */
const art = (s) => (s.handlung ? 'experiment' : s.vermutung ? 'frage' : 'text');

/**
 * Nächster Schritt nach i (Index) oder -1 am Ende: bei Verzweigung nach der gewählten Antwort; in einem Ablauf mit
 * Verzweigung endet ein Schritt ohne weiter, sonst folgt der nächste.
 * @param {Ablauf} a @param {number} i @param {number | undefined} antwort
 */
export function naechster(a, i, antwort) {
  const s = a.schritte[i];
  if (s.weiter) return antwort === undefined || !(String(antwort) in s.weiter) ? -1 : indexVon(a, s.weiter[String(antwort)]);
  if (verzweigt(a)) return -1;
  return i + 1 < a.schritte.length ? i + 1 : -1;
}

/**
 * Prüft Abläufe auf Fehler in den Daten, für die Tests der App. hashGueltig: Prüffunktion der App für eine
 * Link-Adresse (z. B. Rundlauf durch die Prüffunktion des Zustands), aktionen: Namen der Aktionen der App,
 * modi: Modi der App, anker: Anker im Skript (ohne Angabe nicht geprüft).
 * Rückgabe: Liste der Fehler (leer, wenn alles stimmt).
 * @param {Experiment[]} ablaeufe
 * @param {{ hashGueltig?: (hash: string) => boolean, aktionen?: string[], modi?: string[], anker?: string[] }} [o]
 * @returns {string[]}
 */
export function pruefeAblaeufe(ablaeufe, { hashGueltig = () => true, aktionen = [], modi, anker } = {}) {
  /** @type {string[]} */
  const f = [];
  const ids = new Set();
  /** @type {Ablauf[]} */
  const konkret = [];
  for (const a of ablaeufe) {
    if (ids.has(a.id)) f.push(`${a.id}: id doppelt`);
    ids.add(a.id);
    if (a.id.includes(':')) f.push(`${a.id}: id mit Doppelpunkt`);
    if (modi && a.modus !== undefined && !modi.includes(a.modus)) f.push(`${a.id}: unbekannter Modus ${a.modus}`);
    if (erzeugt(a)) {
      if ('schritte' in a || typeof a.make !== 'function') { f.push(`${a.id}: erzeugt braucht params und make, keine schritte`); continue; }
      const ps = a.params();
      if (!ps.length) f.push(`${a.id}: keine Parameter`);
      if (new Set(ps).size !== ps.length) f.push(`${a.id}: Parameter doppelt`);
      for (const p of ps) konkret.push({ ...variante(a, p), id: `${a.id}:${p}` });
    } else if ('make' in a) f.push(`${a.id}: make ohne params`);
    else if (!a.schritte) f.push(`${a.id}: keine Schritte`);
    else konkret.push(a);
  }
  for (const a of konkret) {
    if (!a.schritte.length) { f.push(`${a.id}: keine Schritte`); continue; }
    const sids = a.schritte.map((s) => s.id).filter(Boolean);
    if (new Set(sids).size !== sids.length) f.push(`${a.id}: Schritt-id doppelt`);
    a.schritte.forEach((s, i) => {
      const w = `${a.id}, Schritt ${i + 1}`;
      const n = s.vermutung?.length ?? 0;
      const experiment = art(s) === 'experiment';
      if (s.vermutung && (n < 2 || ((experiment || s.richtig !== undefined) && n > 3))) f.push(`${w}: ${experiment || s.richtig !== undefined ? '2–3' : 'mindestens 2'} Antworten erwartet, ${n} gefunden`);
      if (s.richtig !== undefined && (!s.vermutung || !Number.isInteger(s.richtig) || s.richtig < 0 || s.richtig >= n)) f.push(`${w}: richtig ausserhalb der Antworten`);
      if (s.handlung) {
        const h = s.handlung;
        if ((h.hash === undefined) === (h.aktion === undefined)) f.push(`${w}: Handlung braucht genau eines von hash und aktion`);
        if (h.hash !== undefined && (!h.hash.startsWith('#') || !hashGueltig(h.hash))) f.push(`${w}: ungültige Adresse ${h.hash}`);
        if (h.aktion !== undefined && !aktionen.includes(h.aktion)) f.push(`${w}: unbekannte Aktion ${h.aktion}`);
        if (s.vermutung && !s.beobachtung) f.push(`${w}: Beobachtung fehlt`);
      } else if (!s.vermutung && !s.beobachtung && !s.erklaerung) f.push(`${w}: Text ohne Beobachtung oder Erklärung`);
      if (anker && s.skript !== undefined && !anker.includes(s.skript)) f.push(`${w}: unbekannter Anker ${s.skript}`);
      if (s.bild !== undefined && (!s.bild.startsWith('#') || !hashGueltig(s.bild))) f.push(`${w}: ungültige Adresse des Bildes ${s.bild}`);
      if (s.weiter) {
        if (s.handlung || !s.vermutung) f.push(`${w}: Verzweigung nur bei Antworten ohne Handlung`);
        for (const k of Object.keys(s.weiter)) if (String(Number(k)) !== k || Number(k) < 0 || Number(k) >= n) f.push(`${w}: Verzweigung für unbekannte Antwort ${k}`);
        for (let k = 0; k < n; k++) if (!(String(k) in s.weiter)) f.push(`${w}: Antwort ${k + 1} ohne Ziel`);
        for (const z of Object.values(s.weiter)) if (indexVon(a, z) < 0) f.push(`${w}: Ziel ${z} fehlt`);
      }
    });
    // jeder Weg endet (keine Schleifen) und jeder Schritt ist erreichbar: Tiefensuche über alle Antworten
    /** @type {Set<number>} */
    const erreicht = new Set();
    /** @param {number} i @param {Set<number>} pfad @returns {boolean} */
    const endet = (i, pfad) => {
      if (i < 0) return true;
      if (pfad.has(i)) return false;
      erreicht.add(i);
      const s = a.schritte[i];
      const p = new Set(pfad).add(i);
      return s.weiter ? Object.keys(s.weiter).every((k) => endet(naechster(a, i, Number(k)), p)) : endet(naechster(a, i, undefined), p);
    };
    if (!endet(0, new Set())) f.push(`${a.id}: Schleife im Ablauf`);
    a.schritte.forEach((_, i) => { if (!erreicht.has(i)) f.push(`${a.id}, Schritt ${i + 1}: nicht erreichbar`); });
  }
  return f;
}

/** Neuer Stand für einen Ablauf. @param {Ablauf} ablauf @returns {Stand} */
export const neuerStand = (ablauf) => ({ ablauf, weg: [0], gewaehlt: {}, erste: {}, gezeigt: new Set(), vorher: {}, nachher: {}, zurueck: null, vorherAktiv: false });

/**
 * Ergebnis eines abgeschlossenen Durchgangs wie im Quiz: richtig, wenn es auf dem gegangenen Weg mindestens eine
 * aufgelöste Vermutung gab und jede bei der Auflösung zutraf (erste). Schritte ohne Auflösung (Bedienschritte,
 * Fragen einer Verzweigung) zählen nicht; ein Ablauf ganz ohne Auflösung gilt nur als durchgespielt.
 * @param {Stand} st
 */
export function ergebnis(st) {
  const geprueft = st.weg.filter((i) => st.ablauf.schritte[i].richtig !== undefined);
  return geprueft.length > 0 && geprueft.every((i) => (st.erste[i] ?? st.gewaehlt[i]) === st.ablauf.schritte[i].richtig);
}

/** Stand der Experimente aus dem Speicher (gesperrt oder unbrauchbar: leer). @param {string} schluessel @returns {Fortschritt} */
export function standLesen(schluessel) {
  try { return fortschrittAus(localStorage.getItem(schluessel)); } catch { return leererFortschritt(); }
}
/** Stand der Experimente speichern (gesperrter Speicher: nichts). @param {string} schluessel @param {Fortschritt} f */
export function standSchreiben(schluessel, f) {
  try { localStorage.setItem(schluessel, JSON.stringify(f)); } catch { /* ohne Speicher weiter */ }
}

/** Zuletzt gespielter Parameter eines erzeugten Experiments (oder undefined). @param {Erzeugt} a @param {Fortschritt} stand */
export function zuletzt(a, stand) {
  /** @type {string | undefined} */
  let p;
  for (const q of a.params()) { const v = stand.fragen[`${a.id}:${q}`]; if (v && (p === undefined || v.t > stand.fragen[`${a.id}:${p}`].t)) p = q; }
  return p;
}

/**
 * Eintrag eines Experiments im Stand; bei einem erzeugten der des zuletzt gespielten Parameters.
 * @param {Experiment} a @param {Fortschritt} stand @returns {import('./quiz-core.js').Antwortstand | undefined}
 */
export function eintrag(a, stand) {
  if (!erzeugt(a)) return stand.fragen[a.id];
  const p = zuletzt(a, stand);
  return p === undefined ? undefined : stand.fragen[`${a.id}:${p}`];
}

/**
 * Parameter für die nächste Aufgabe eines erzeugten Ablaufs, wie im Quiz nach Vorrang: zuerst nie gespielte,
 * dann zuletzt falsche, dann die übrigen; innerhalb davon zufällig. ausser: zuletzt gestellter Parameter (nur
 * wenn es andere gibt).
 * @param {Erzeugt} a @param {Fortschritt} stand @param {() => number} [zufall] @param {string} [ausser]
 */
export function waehleParameter(a, stand, zufall = Math.random, ausser) {
  const alle = a.params();
  const ps = alle.length > 1 ? alle.filter((p) => p !== ausser) : alle;
  const rang = (/** @type {string} */ p) => vorrang(stand, `${a.id}:${p}`);
  const best = Math.min(...ps.map(rang));
  const wahl = ps.filter((p) => rang(p) === best);
  return wahl[Math.min(wahl.length - 1, Math.floor(zufall() * wahl.length))];
}

/**
 * HTML der Liste der Abläufe eines Modus (Knöpfe data-ablauf). Nach dem Stand (Fortschritt, Schlüssel = id):
 * zuletzt richtig ✓, durchgespielt ○, je mit Text für Screenreader (nicht nur über Farbe); darunter die Übersicht
 * und „Stand löschen“ (data-loeschen), sobald etwas durchgespielt ist.
 * @param {Experiment[]} liste @param {Fortschritt} [stand]
 */
export function listeHTML(liste, stand = leererFortschritt()) {
  if (!liste.length) return '';
  const fertig = liste.filter((a) => eintrag(a, stand));
  const richtig = fertig.filter((a) => eintrag(a, stand)?.letzte).length;
  const uebersicht = fertig.length
    ? `<p class="ablauf-stand">Stand: ${richtig} ✓ (zuletzt richtig), ${fertig.length - richtig} ○ (durchgespielt), ${liste.length - fertig.length} offen. <button class="linkbtn" type="button" data-loeschen="1">Stand löschen</button></p>` : '';
  return `<p class="ablauf-hinweis">Kleine Experimente: erst vermuten, dann ausprobieren.</p><ol class="ablauf-liste">${liste.map((a) => {
    const e = eintrag(a, stand);
    const marke = !e ? '' : e.letzte ? ' <span aria-hidden="true">✓</span><span class="sr"> (zuletzt richtig)</span>' : ' <span aria-hidden="true">○</span><span class="sr"> (durchgespielt)</span>';
    const neu = erzeugt(a) ? ' <span class="ablauf-neu" aria-hidden="true">↻</span><span class="sr"> (immer neue Aufgaben)</span>' : '';
    return `<li${e ? ` class="${e.letzte ? 'done' : 'gespielt'}"` : ''}><button class="linkbtn" type="button" data-ablauf="${a.id}">${a.titel}${neu}${marke}</button></li>`;
  }).join('')}</ol>${uebersicht}`;
}

/** Entitäten, die `esc()` erzeugt, und das geschützte Leerzeichen. @type {Record<string, string>} */
const ZEICHEN = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&amp;': '&' };

/** Symbol aus hmHTML/hklHTML (format.js): Grafik mit Ansagetext, innen Text und Querstriche. */
const SYMBOL = /<span role="img" aria-label="([^"]*)">(?:[^<]|<span class="ov">[^<]*<\/span>)*<\/span>/g;
/**
 * Querstrich im übrigen Text, auch mit Auszeichnung darin (koordHTML in plane-groups: `<i>x</i>`), in jeder
 * Attributform; `class="ovs"` (SVG) nicht. Grenze: ein weiteres `<span>` innerhalb des Querstrichs wird nicht erkannt
 * (dann ohne „quer“ angesagt).
 */
const QUERSTRICH = /<span\b[^>]*\bclass\s*=\s*["'](?:[^"']*\s)?ov(?:\s[^"']*)?["'][^>]*>((?:[^<]|<(?!\/?span\b)[^<>]*>)*)<\/span>/gi;

/**
 * Text ohne Auszeichnung für die Ansage, gesprochen wie in der Darstellung für Screenreader (Leitfaden Abschn. 4):
 * Symbole aus hmHTML/hklHTML mit ihrem Ansagetext (#82), andere Querstriche als „x quer“ (#90). Das Ergebnis geht nur
 * in textContent (nie in innerHTML); die Tags werden trotzdem wiederholt entfernt, bis nichts mehr zu entfernen ist,
 * und verbliebene spitze Klammern fallen weg. Danach werden die Entitäten aus `esc()` und `&nbsp;` zurückübersetzt
 * (andere bleiben stehen; die Apps schreiben Zeichen wie „−“ oder „½“ direkt) und Leerraum vereinheitlicht: kein
 * Leerzeichen innerhalb von Klammern und Anführungszeichen, vor . , ! ? und vor einem Bindestrich vor einem Wort
 * („4 quer-Achse“); „2 : 1“ bleibt.
 * @param {string} h
 */
export const ohneHTML = (h) => {
  let t = h.replace(SYMBOL, ' $1 ').replace(QUERSTRICH, ' $1 quer ');
  for (let alt = ''; alt !== t;) { alt = t; t = t.replace(/<[^<>]*>/g, ''); }
  return t.replace(/[<>]/g, '').replace(/&(?:lt|gt|quot|#39|nbsp|amp);/g, (e) => ZEICHEN[e])
    .replace(/\s+/g, ' ').replace(/([([{⟨„]) /g, '$1').replace(/ ([)\]}⟩“.,!?])/g, '$1').replace(/ -(?=\w)/g, '-').trim();
};

/**
 * Ansage nach Handlung oder Antwort (für die Live-Region): Auflösung der Vermutung und Beobachtung.
 * @param {Stand} st
 */
export function ansage(st) {
  const i = st.weg[st.weg.length - 1];
  const s = st.ablauf.schritte[i];
  if (!st.gezeigt.has(i) && art(s) !== 'text') return '';
  /** @type {string[]} */
  const teile = [];
  if (s.vermutung && s.richtig !== undefined) {
    teile.push(`Zutreffend: ${ohneHTML(s.vermutung[s.richtig])}.`);
    const w = st.gewaehlt[i];
    if (w !== undefined) teile.push(w === s.richtig ? 'Deine Vermutung trifft zu.' : `Deine Vermutung: ${ohneHTML(s.vermutung[w])}.`);
  }
  if (s.beobachtung) teile.push(ohneHTML(s.beobachtung));
  if (s.erklaerung) teile.push(ohneHTML(s.erklaerung));
  return teile.join(' ');
}

/**
 * HTML des aktuellen Schritts. skriptUrl: Adresse zu einem Anker im Skript (ohne Angabe kein Link); liste: false
 * ohne „Alle Experimente“ (geführter Einstieg mit nur einem Ablauf).
 * @param {Stand} st @param {{ skriptUrl?: (anker: string) => string, liste?: boolean }} [o]
 */
export function schrittHTML(st, { skriptUrl, liste = true } = {}) {
  const a = st.ablauf;
  const i = st.weg[st.weg.length - 1];
  const s = a.schritte[i];
  const typ = art(s);
  const gezeigt = st.gezeigt.has(i);
  const wahl = st.gewaehlt[i];
  const fortschritt = verzweigt(a) ? `Schritt ${st.weg.length}` : `Schritt ${i + 1} von ${a.schritte.length}`;
  // Antworten eines Experiments nach der Handlung: nicht mehr wählbar (aria-disabled, bleiben im Fokus-Ablauf)
  const fest = typ === 'experiment' && gezeigt;
  const aufgeloest = gezeigt && s.richtig !== undefined;
  const antworten = s.vermutung ? `<div class="ablauf-vermutung" role="group" aria-label="${typ === 'experiment' ? 'Deine Vermutung' : 'Deine Antwort'}">${s.vermutung.map((t, k) => {
    const kl = [aufgeloest && s.richtig === k ? 'richtig' : '', aufgeloest && wahl === k && s.richtig !== k ? 'falsch' : ''].filter(Boolean).join(' ');
    const marke = (aufgeloest && s.richtig === k ? ' <span class="ablauf-marke">✓ trifft zu</span>' : '')
      + (aufgeloest && wahl === k ? ' <span class="ablauf-deine">(deine Vermutung)</span>' : '');
    return `<button type="button" data-antwort="${k}" aria-pressed="${wahl === k}"${kl ? ` class="${kl}"` : ''}${fest ? ' aria-disabled="true"' : ''}>${t}${marke}</button>`;
  }).join('')}</div>` : '';
  const ohneVermutung = typ === 'experiment' && s.vermutung !== undefined && wahl === undefined;
  const handlung = typ === 'experiment' && !gezeigt
    ? `<p><button class="linkbtn ablauf-tun" type="button" data-tun="1"${ohneVermutung ? ' disabled aria-describedby="ablauf-warum"' : ''}>${s.handlung?.text}</button></p>`
      + (ohneVermutung ? '<p class="ablauf-why" id="ablauf-warum">Zuerst eine Vermutung wählen.</p>' : '') : '';
  const vergleich = gezeigt && st.vorher[i] !== undefined && st.vorher[i] !== st.nachher[i]
    ? `<p><button class="linkbtn" type="button" data-vergleich="1">${st.vorherAktiv ? 'Nachher zeigen' : 'Vorher zeigen'}</button></p>` : '';
  const skript = s.skript && skriptUrl ? ` <a href="${skriptUrl(s.skript)}">Im Skript nachlesen</a>` : '';
  const sichtbar = gezeigt || typ === 'text';
  const ergebnis = sichtbar && (s.beobachtung || s.erklaerung || skript)
    ? `${s.beobachtung ? `<p class="ablauf-beobachtung" tabindex="-1">${s.beobachtung}</p>` : ''}${s.erklaerung || skript ? `<p class="ablauf-erklaerung">${s.erklaerung ?? ''}${skript}</p>` : ''}` : '';
  // vor der Antwort einer Verzweigung: „Weiter“ (gesperrt), nicht „Fertig“
  const ende = s.weiter ? wahl !== undefined && naechster(a, i, wahl) < 0 : naechster(a, i, wahl) < 0;
  // ein Bedienschritt ohne Vermutung (Erste Schritte) darf man überspringen
  const weiterFrei = typ === 'text' || gezeigt || (typ === 'experiment' && !s.vermutung);
  // im geführten Einstieg steht der Titel schon über der Karte
  return `<div class="ablauf-kopf">${liste ? `<b>${a.titel}</b> ` : ''}<span class="ablauf-fortschritt">${fortschritt}</span></div>`
    + `<p class="ablauf-frage" tabindex="-1">${s.frage}</p>${antworten}${handlung}<div class="ablauf-ergebnis">${ergebnis}${vergleich}</div>`
    + `<div class="ablauf-nav"><button class="linkbtn" type="button" data-nav="zurueck"${st.weg.length > 1 ? '' : ' disabled'}>Zurück</button>`
    + (liste ? '<button class="linkbtn" type="button" data-nav="liste">Alle Experimente</button>' : '')
    + (liste && ende && a.variante !== undefined ? `<button class="linkbtn" type="button" data-nav="neu"${weiterFrei ? '' : ' disabled'}>Neue Aufgabe</button>` : '')
    + `<button class="linkbtn" type="button" data-nav="${ende ? 'fertig' : 'weiter'}"${weiterFrei ? '' : ' disabled'}>${ende ? 'Fertig' : 'Weiter'}</button></div>`;
}

/**
 * Karte mit den Abläufen der App (Abschnitt „Experimente“ oder Karte „Erste Schritte“); ein Klick ist eine
 * Handlung, Antwort oder Navigation (Ereignis-Delegation, Tastatur über die Knöpfe). Neu erscheinender Text wird
 * über eine bleibende Live-Region angesagt; nach jedem Klick liegt der Fokus auf einem passenden Element.
 * - anwenden(hash): Zustand der App aus einer Adresse setzen und zeichnen,
 * - adresse(): aktuelle Adresse (für Vorher/Nachher),
 * - aktionen: Aktionen der App nach Namen,
 * - skriptUrl(anker), beiAbschluss(id) (nach „Fertig“ und „Neue Aufgabe“): optional,
 * - speicher: Schlüssel im Browser für den Stand der Experimente, `<präfix>-experimente` (Leitfaden Abschn. 5.3;
 *   „Alle Einstellungen zurücksetzen“ verschont ihn wie das Quiz). Ohne Angabe gilt der Stand nur bis zum Neuladen.
 * - zufall: Zufallszahl in [0, 1) für die Wahl des Parameters erzeugter Abläufe (Vorgabe Math.random),
 * - liste: false für einen geführten Einstieg (Erste Schritte): je Modus ein Ablauf, ohne Liste und ohne Stand; nach
 *   „Fertig“ beginnt er wieder von vorn (beiAbschluss schliesst z. B. die Karte).
 * @param {HTMLElement} el
 * @param {Experiment[]} ablaeufe
 * @param {{ anwenden: (hash: string) => void, adresse: () => string, aktionen?: Record<string, () => void>,
 *   skriptUrl?: (anker: string) => string, beiAbschluss?: (id: string) => void, speicher?: string,
 *   liste?: boolean, zufall?: () => number }} o
 */
export function ablaufKarte(el, ablaeufe, o) {
  /** @type {string | undefined} */
  let modus;
  /** @type {Stand | null} */
  let st = null;
  /** @type {Fortschritt} */
  let fortschritt = o.speicher ? standLesen(o.speicher) : leererFortschritt();
  // vor jedem Schreiben neu lesen, damit ein zweiter offener Tab nichts überschreibt
  const frisch = () => { if (o.speicher) fortschritt = standLesen(o.speicher); };
  const speichern = () => { if (o.speicher) standSchreiben(o.speicher, fortschritt); };
  el.innerHTML = '<div class="ablauf-inhalt"></div><p class="sr ablauf-ansage" aria-live="polite"></p>';
  const inhalt = /** @type {HTMLElement} */ (el.firstElementChild);
  const ansageEl = /** @type {HTMLElement} */ (el.lastElementChild);
  const imModus = () => ablaeufe.filter((a) => a.modus === undefined || a.modus === modus);
  /** Zeichnen und den Fokus auf das Element zum Selektor legen (Tastatur, Screenreader). @param {string | null} [fokus] */
  const zeichnen = (fokus = null) => {
    if (!st && o.liste === false) { const a = imModus()[0]; st = a ? neuerStand(konkretVon(a)) : null; }
    inhalt.innerHTML = st ? schrittHTML(st, { skriptUrl: o.skriptUrl, liste: o.liste !== false }) : listeHTML(imModus(), fortschritt);
    const z = fokus ? inhalt.querySelector(fokus) : null;
    if (z instanceof HTMLElement) z.focus({ preventScroll: true });
  };
  /** @type {number | null} */
  let spaeter = null;
  /**
   * Ansage über die bleibende Live-Region (erst leeren, damit auch gleicher Text erneut angesagt wird). Eine noch
   * ausstehende frühere Ansage entfällt, damit sie nicht nach dem Leeren doch noch erscheint.
   * @param {string} t
   */
  const sagen = (t) => {
    if (spaeter !== null) { cancelAnimationFrame(spaeter); spaeter = null; }
    ansageEl.textContent = '';
    if (t) spaeter = requestAnimationFrame(() => { spaeter = null; ansageEl.textContent = t; });
  };
  /**
   * Ist „Vorher“ angewandt und hat seither niemand die App bedient, zurück zum Stand vor dem Umschalten, damit die
   * App nicht im alten Zustand bleibt; eine eigene Änderung bleibt.
   */
  const nachherHerstellen = () => {
    if (!st || !st.vorherAktiv) return;
    const i = st.weg[st.weg.length - 1];
    const zurueck = st.zurueck;
    st.vorherAktiv = false; st.zurueck = null;
    if (zurueck !== null && o.adresse() === st.vorher[i]) o.anwenden(zurueck);
  };
  /**
   * Ablauf zu einem Experiment: fest, oder zu einem nach Vorrang gewählten Parameter erzeugt, nie dieselbe Aufgabe
   * wie zuletzt (ausser: eben gestellt, sonst die zuletzt gespielte).
   * @param {Experiment} a @param {string} [ausser]
   */
  const konkretVon = (a, ausser) => (erzeugt(a) ? variante(a, waehleParameter(a, fortschritt, o.zufall, ausser ?? zuletzt(a, fortschritt))) : a);
  /** @param {string} id @param {{ fokus?: boolean }} [opt] fokus: false beim automatischen Start */
  const starte = (id, { fokus = true } = {}) => {
    const a = ablaeufe.find((x) => x.id === id);
    if (!a) throw new Error(`ablaufKarte: kein Ablauf „${id}“`);
    nachherHerstellen();
    st = neuerStand(konkretVon(a)); zeichnen(fokus ? '.ablauf-frage' : null); sagen('');
  };
  /** Zur Liste. @param {boolean} [fokus] */
  const zurListe = (fokus = false) => { nachherHerstellen(); st = null; zeichnen(fokus ? (o.liste === false ? '.ablauf-frage' : '[data-ablauf]') : null); sagen(''); };
  // ein anderer Tab hat den Stand geändert: die Liste neu zeichnen (ein laufender Ablauf bleibt)
  if (o.speicher && typeof window !== 'undefined') window.addEventListener('storage', (e) => {
    if (e.key !== o.speicher && e.key !== null) return;
    frisch(); if (!st) zeichnen();
  });
  el.addEventListener('click', (e) => {
    const b = /** @type {Element} */ (e.target).closest('button');
    if (!b || !(b instanceof HTMLButtonElement) || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    if (b.dataset.ablauf) { starte(b.dataset.ablauf); return; }
    if (b.dataset.loeschen) {
      if (!confirm('Den Stand aller Experimente in allen Modi löschen?')) return;
      fortschritt = leererFortschritt(); speichern(); zeichnen('[data-ablauf]'); sagen('Stand gelöscht'); return;
    }
    const stand = st;
    if (!stand) return;
    const i = stand.weg[stand.weg.length - 1];
    const s = stand.ablauf.schritte[i];
    if (b.dataset.antwort !== undefined) {
      const k = Number(b.dataset.antwort);
      if (!s.handlung) {
        // Frage ohne Handlung: die Wahl beantwortet sie; eine andere Antwort verwirft den Stand späterer Schritte
        if (stand.gewaehlt[i] !== k) {
          for (const m of [stand.gewaehlt, stand.erste, stand.vorher, stand.nachher]) for (const j of Object.keys(m).map(Number)) if (!stand.weg.includes(j)) delete m[j];
          for (const j of [...stand.gezeigt]) if (!stand.weg.includes(j)) stand.gezeigt.delete(j);
        }
        stand.gezeigt.add(i);
        stand.erste[i] ??= k; // aufgelöst: diese Antwort zählt
      }
      stand.gewaehlt[i] = k;
      zeichnen(`[data-antwort="${k}"]`); sagen(ansage(stand)); return;
    }
    if (b.dataset.tun && s.handlung) {
      if (stand.gewaehlt[i] !== undefined) stand.erste[i] ??= stand.gewaehlt[i];
      stand.vorher[i] = o.adresse();
      if (s.handlung.hash !== undefined) o.anwenden(s.handlung.hash);
      else o.aktionen?.[/** @type {string} */ (s.handlung.aktion)]?.();
      if (st !== stand) return; // die App hat den Ablauf beendet (z. B. Wechsel des Modus)
      stand.nachher[i] = o.adresse();
      stand.gezeigt.add(i); zeichnen('.ablauf-beobachtung'); sagen(ansage(stand)); return;
    }
    if (b.dataset.vergleich) {
      if (!stand.vorherAktiv) {
        stand.zurueck = o.adresse(); o.anwenden(stand.vorher[i]);
        if (st !== stand) return;
        stand.vorherAktiv = true;
      } else nachherHerstellen();
      zeichnen('[data-vergleich]'); sagen(stand.vorherAktiv ? 'Vorher' : 'Nachher'); return;
    }
    const nav = b.dataset.nav;
    if (nav === 'zurueck' && stand.weg.length > 1) {
      nachherHerstellen(); stand.weg.pop();
      // die App in den Zustand des vorigen Schritts, damit sein Text wieder passt
      const j = stand.weg[stand.weg.length - 1];
      if (stand.nachher[j] !== undefined && o.adresse() !== stand.nachher[j]) o.anwenden(stand.nachher[j]);
      if (st !== stand) return;
      zeichnen('.ablauf-frage'); sagen('');
    } else if (nav === 'weiter') {
      nachherHerstellen();
      const n = naechster(stand.ablauf, i, stand.gewaehlt[i]);
      if (n >= 0) { stand.weg.push(n); zeichnen('.ablauf-frage'); sagen(ansage(stand)); }
    } else if (nav === 'fertig' || nav === 'liste' || nav === 'neu') {
      if ((nav === 'fertig' || nav === 'neu') && o.liste !== false) {
        const ok = ergebnis(stand);
        frisch(); vermerken(fortschritt, schluessel(stand.ablauf), ok); speichern();
        nachherHerstellen();
        o.beiAbschluss?.(stand.ablauf.id); // auch bei „Neue Aufgabe“
        if (st !== stand) return; // die App hat die Karte umgestellt (z. B. Liste oder Modus)
        const text = ok ? 'Alle Vermutungen trafen zu.' : 'Durchgespielt.';
        const basis = ablaeufe.find((x) => x.id === stand.ablauf.id);
        if (nav === 'neu' && basis) {
          // neue Aufgabe derselben Art, nicht dieselbe wie eben
          st = neuerStand(konkretVon(basis, stand.ablauf.variante)); zeichnen('.ablauf-frage'); sagen(`${text} Neue Aufgabe.`);
          return;
        }
        st = null; zeichnen(`[data-ablauf="${stand.ablauf.id}"]`); sagen(text);
        return;
      }
      if (nav === 'fertig') o.beiAbschluss?.(stand.ablauf.id);
      zurListe(true);
    }
  });
  return {
    /**
     * Modus setzen: zeigt die Liste seiner Abläufe (ein laufender Ablauf eines anderen Modus endet). Bei einem Wechsel
     * wird die Live-Region geleert, damit sie nicht den Text des vorigen Modus behält (#90).
     * @param {string} m
     */
    modus(m) {
      // ein Wechsel des Modus ist eine eigene Handlung: „Vorher“ nicht mehr herstellen
      if (st && st.ablauf.modus !== undefined && st.ablauf.modus !== m) st = null;
      if (m !== modus) sagen('');
      modus = m; zeichnen();
    },
    starte,
    /** Erster Ablauf des aktuellen Modus (beim ersten Aufruf) oder null. */
    erster: () => imModus()[0]?.id ?? null,
    /** Läuft gerade ein Ablauf? */
    laeuft: () => st !== null,
    /** Zur Liste (z. B. beim Schliessen der Karte); stellt „Nachher“ her. */
    liste: () => zurListe(false),
  };
}
