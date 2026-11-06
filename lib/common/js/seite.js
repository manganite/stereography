// Kleine Helfer für alle Seiten einer App (App, Skript, Quiz): Elemente der Seite, Versionsnummer eintragen,
// „Alle Einstellungen zurücksetzen“, Offline-Betrieb.

// ------------------------------------------------------------------ Elemente der Seite
// Die Typprüfung kennt das HTML nicht. Die Helfer prüfen deshalb zur Laufzeit, ob das Element da ist und die
// erwartete Art hat, und werfen sonst einen Fehler, der die ID bzw. den Selektor nennt: Ein Fehler im HTML fällt
// so beim ersten Zugriff auf und nicht erst später an anderer Stelle. Gleiche Aufgabe, gleicher Name in allen Apps.
// Die Helfer suchen in der ganzen Seite; Suchen innerhalb eines Elements (z. B. einer Abbildung) bleiben in der Datei.

/**
 * Fehler für ein Element der falschen Art. Gleicher Name, aber andere Art: das Element stammt aus einem anderen
 * Fenster oder Dokument (z. B. einem iframe), dort gelten eigene Arten.
 * @param {string} wo @param {Element} el @param {Function} art
 */
const falscheArt = (wo, el, art) => new Error(`${wo} ist ${el.constructor.name}, erwartet ${art.name}`
  + (el.constructor.name === art.name ? ' (aus einem anderen Fenster oder Dokument)' : ''));

/**
 * Element der Seite nach ID, geprüft auf die erwartete Art.
 * @template {Element} T
 * @param {string} id
 * @param {{ new (): T }} art erwartete Art, z. B. HTMLInputElement
 * @returns {T}
 */
export function nachId(id, art) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} fehlt`);
  if (!(el instanceof art)) throw falscheArt(`Element #${id}`, el, art);
  return el;
}
/** HTML-Element nach ID. @param {string} id */
export const $ = (id) => nachId(id, HTMLElement);
/** Eingabefeld (input) nach ID. @param {string} id */
export const eingabe = (id) => nachId(id, HTMLInputElement);
/** Auswahlfeld (select) nach ID. @param {string} id */
export const auswahl = (id) => nachId(id, HTMLSelectElement);
/** Knopf (button) nach ID. @param {string} id */
export const knopf = (id) => nachId(id, HTMLButtonElement);
/** Aufklappbarer Abschnitt (details) nach ID. @param {string} id */
export const abschnitt = (id) => nachId(id, HTMLDetailsElement);
/** SVG-Grafik (svg) nach ID. @param {string} id */
export const grafik = (id) => nachId(id, SVGSVGElement);

/**
 * Erstes Element der Seite zum Selektor, geprüft auf die erwartete Art (ohne Angabe: HTML-Element).
 * @template {Element} [T=HTMLElement]
 * @param {string} sel
 * @param {{ new (): T }} [art]
 * @returns {T}
 */
export function element(sel, art = /** @type {{ new (): T }} */ (/** @type {unknown} */ (HTMLElement))) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Kein Element zu ${sel}`);
  if (!(el instanceof art)) throw falscheArt(`Element zu ${sel}`, el, art);
  return el;
}
/**
 * Alle Elemente der Seite zum Selektor (auch keins), jedes geprüft auf die erwartete Art (ohne Angabe: HTML-Element).
 * @template {Element} [T=HTMLElement]
 * @param {string} sel
 * @param {{ new (): T }} [art]
 * @returns {T[]}
 */
export function elemente(sel, art = /** @type {{ new (): T }} */ (/** @type {unknown} */ (HTMLElement))) {
  const liste = [...document.querySelectorAll(sel)];
  for (const el of liste) if (!(el instanceof art)) throw falscheArt(`Element zu ${sel}`, el, art);
  return /** @type {T[]} */ (liste);
}

/** Versionsnummer in alle Elemente mit data-version schreiben. @param {string} version */
export function versionEintragen(version) {
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = version; });
}

// ------------------------------------------------------------------ Alle Einstellungen zurücksetzen

/**
 * „Alle Einstellungen zurücksetzen“ (Leitfaden Abschn. 5.2): löscht im Speicher des Browsers alle Einträge, die mit
 * „<praefix>-“ beginnen, ausser denen des Quiz („<praefix>-quiz…“), und lädt die Seite ohne Hash neu. So ist der
 * Startzustand sicher erreicht, auch für Zustand und Einträge, die die App später dazubekommt, und die
 * Erste-Schritte-Karte erscheint wieder. Andere Apps derselben Adresse (manganite.github.io) haben eigene Präfixe.
 * Was die App beim Verlassen der Seite bis pagehide noch speichert, löscht pagehide wieder; danach (visibilitychange,
 * unload) darf sie nicht speichern.
 * @param {string} praefix Präfix der App, z. B. 'stereo' (Leitfaden Abschn. 5.2)
 */
export function alleEinstellungenZuruecksetzen(praefix) {
  const eigene = praefix + '-', quiz = praefix + '-quiz';
  const loeschen = () => {
    try {
      const weg = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k !== null && k.startsWith(eigene) && !k.startsWith(quiz)) weg.push(k);
      }
      for (const k of weg) localStorage.removeItem(k);
    } catch { /* ohne Speicher weiter */ }
  };
  loeschen();
  window.addEventListener('pagehide', loeschen);
  location.replace(location.pathname + location.search);
}

// ------------------------------------------------------------------ Offline-Betrieb

/**
 * Service Worker anmelden (Offline-Betrieb, z. B. im Hörsaal ohne WLAN). Nur über HTTPS (GitHub Pages);
 * mit lokal: true auch lokal, wenn die Adresse ?sw enthält (zum Testen).
 * neuLaden: Übernimmt eine neue Version die Seite, lädt sie einmal neu (die App selbst; Skript und Quiz nicht).
 */
export function offline({ datei = 'sw.js', lokal = false, neuLaden = false } = {}) {
  if (!('serviceWorker' in navigator)) return;
  if (!(location.protocol === 'https:' || (lokal && new URLSearchParams(location.search).has('sw')))) return;
  if (neuLaden) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
  }
  navigator.serviceWorker.register(datei).catch(() => { /* ohne Offline-Betrieb weiter */ });
}

// ------------------------------------------------------------------ Moduswahl als Tabs

/**
 * Moduswahl als vollständiges Tab-Muster (WAI-ARIA Authoring Practices, Tabs mit automatischer Aktivierung;
 * Leitfaden Abschn. 5.4): Knöpfe mit role="tab" in einem Element mit role="tablist", ein gemeinsames
 * Element mit role="tabpanel" für den Inhalt. Pfeiltasten links/rechts (mit Umlauf), Pos1 und Ende wählen
 * den nächsten nicht gesperrten Tab und lösen seinen click aus; die App reagiert wie bisher im click.
 * Nur der gewählte Tab ist im Fokus-Ablauf (tabindex); ist er gesperrt, der erste freie. Die App ruft
 * markieren(id) überall dort auf, wo ein Moduswechsel durchläuft (auch beim Laden aus Link oder Speicher),
 * statt aria-selected selbst zu setzen, und ruft modusTabs vor dem ersten Moduswechsel auf.
 * @param {HTMLElement} liste Element mit role="tablist"
 * @param {HTMLElement} inhalt Element mit role="tabpanel" (braucht eine id; nicht das <main>, sonst fehlt die
 *   Hauptlandmarke)
 * @returns {{ markieren: (id: string) => void }}
 */
export function modusTabs(liste, inhalt) {
  const tabs = /** @type {HTMLButtonElement[]} */ ([...liste.querySelectorAll('[role="tab"]')]);
  if (!inhalt.id) throw new Error('modusTabs: das Element mit role="tabpanel" braucht eine id');
  for (const t of tabs) t.setAttribute('aria-controls', inhalt.id);
  /** @param {string} id */
  const markieren = (id) => {
    const gewaehlt = tabs.find((t) => t.id === id);
    if (!gewaehlt) throw new Error(`modusTabs: kein Tab mit der id „${id}“`);
    // im Fokus-Ablauf: der gewählte Tab, wenn er gesperrt ist der erste freie
    const fokus = gewaehlt.disabled ? (tabs.find((t) => !t.disabled) ?? gewaehlt) : gewaehlt;
    for (const t of tabs) {
      t.setAttribute('aria-selected', String(t === gewaehlt));
      t.tabIndex = t === fokus ? 0 : -1;
    }
    inhalt.setAttribute('aria-labelledby', id);
  };
  liste.addEventListener('keydown', (ev) => {
    const e = /** @type {KeyboardEvent} */ (ev);
    if (e.altKey || e.ctrlKey || e.metaKey) return; // z. B. Alt+Pfeil links: zurück im Browser
    const frei = tabs.filter((t) => !t.disabled);
    const i = frei.findIndex((t) => t === document.activeElement);
    if (i < 0 || !frei.length) return;
    /** @type {Record<string, number>} */
    const ziel = { ArrowRight: (i + 1) % frei.length, ArrowLeft: (i - 1 + frei.length) % frei.length, Home: 0, End: frei.length - 1 };
    if (!(e.key in ziel)) return;
    e.preventDefault();
    const t = frei[ziel[e.key]];
    t.focus();
    if (t.getAttribute('aria-selected') !== 'true') t.click();
  });
  const gewaehlt = tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];
  if (gewaehlt) markieren(gewaehlt.id);
  return { markieren };
}
