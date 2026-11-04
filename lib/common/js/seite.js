// Kleine Helfer für alle Seiten einer App (App, Skript, Quiz): Elemente der Seite, Versionsnummer eintragen,
// Offline-Betrieb.

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
