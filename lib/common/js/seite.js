// Kleine Helfer für alle Seiten einer App (App, Skript, Quiz): Elemente der Seite, Versionsnummer eintragen,
// „Alle Einstellungen zurücksetzen“, Offline-Betrieb, Bildexport (Knopf mit Menü), Moduswahl als Tabs.

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
 * „<praefix>-“ beginnen, ausser dem Lernstand (Quiz „<praefix>-quiz…“, Experimente „<praefix>-experimente“),
 * und lädt die Seite ohne Hash neu. So ist der
 * Startzustand sicher erreicht, auch für Zustand und Einträge, die die App später dazubekommt, und die
 * Erste-Schritte-Karte erscheint wieder. Andere Apps derselben Adresse (manganite.github.io) haben eigene Präfixe.
 * Was die App beim Verlassen der Seite bis pagehide noch speichert, löscht pagehide wieder; danach (visibilitychange,
 * unload) darf sie nicht speichern.
 * @param {string} praefix Präfix der App, z. B. 'stereo' (Leitfaden Abschn. 5.2)
 */
export function alleEinstellungenZuruecksetzen(praefix) {
  const eigene = praefix + '-', quiz = praefix + '-quiz', experimente = praefix + '-experimente'; // Lernstand bleibt
  const loeschen = () => {
    try {
      const weg = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k !== null && k.startsWith(eigene) && !k.startsWith(quiz) && k !== experimente) weg.push(k);
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

// ------------------------------------------------------------------ Bildexport: ein Knopf mit Menü

/**
 * Ein Eintrag des Export-Menüs. tun läuft noch in der Klick-Behandlung (Safari verlangt das für die Zwischenablage);
 * scheitert es (Fehler oder abgelehntes Promise), zeigt der Knopf kurz „Nicht möglich“, sonst erfolg, falls angegeben.
 * @typedef {{ text: string, tun: () => (void | Promise<unknown>), erfolg?: string }} ExportEintrag
 */

/**
 * Export als ein Knopf mit Menü (Leitfaden Abschn. 4 und 5.1; Muster „Menu Button“ der WAI-ARIA Authoring
 * Practices): Der Knopf (in einem Element .tools.export) öffnet ein Menü mit den Einträgen, z. B. Kopieren, SVG, PNG.
 * Tastatur: Enter, Leertaste oder Pfeil ab öffnen auf dem ersten Eintrag, Pfeil auf auf dem letzten; im Menü Pfeile
 * (mit Umlauf), Pos1 und Ende; Esc schliesst und gibt den Fokus dem Knopf zurück, Tab schliesst. Ein Klick ausserhalb
 * schliesst ebenso. Rückmeldung („Kopiert“, „Nicht möglich“) kurz im Text des Knopfs, weil das Menü dann zu ist, und
 * für Screenreader in einer Statusmeldung; der Name des Knopfs (aria-label) bleibt dabei die Beschriftung.
 * Einmal je Knopf aufrufen (das Menü lebt so lange wie die Seite). Das Menü hängt unter dem Knopf in der Tafel, die mit
 * overflow: hidden abschneidet: für wenige Einträge gedacht, wie die drei des Bildexports.
 * @param {HTMLButtonElement} knopf Knopf mit id und nur Text als Inhalt (die Rückmeldung ersetzt ihn kurz); das Menü
 *   entsteht als nächstes Geschwister (id: <knopf-id>-menue)
 * @param {ExportEintrag[]} eintraege mindestens einer
 * @returns {{ menue: HTMLElement, schliessen: () => void }}
 */
export function exportMenue(knopf, eintraege) {
  if (!knopf.id) throw new Error('exportMenue: der Knopf braucht eine id');
  if (knopf.hasAttribute('aria-controls')) throw new Error(`exportMenue: #${knopf.id} hat schon ein Menü`);
  if (!eintraege.length) throw new Error('exportMenue: keine Einträge');
  const menue = document.createElement('div');
  menue.className = 'exportmenue';
  menue.id = `${knopf.id}-menue`;
  menue.setAttribute('role', 'menu');
  menue.setAttribute('aria-labelledby', knopf.id);
  menue.hidden = true;
  const punkte = eintraege.map((e) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitem');
    b.tabIndex = -1;
    b.textContent = e.text;
    return b;
  });
  menue.append(...punkte);
  const status = document.createElement('span');
  status.className = 'sr';
  status.setAttribute('role', 'status');
  knopf.after(menue, status);
  knopf.setAttribute('aria-haspopup', 'menu');
  knopf.setAttribute('aria-controls', menue.id);
  knopf.setAttribute('aria-expanded', 'false');

  const beschriftung = knopf.textContent ?? '';
  knopf.setAttribute('aria-label', beschriftung);
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let uhr;
  /** Rückmeldung im Text des Knopfs und als Statusmeldung, nach 1,6 s wieder die Beschriftung. @param {string} text */
  const melden = (text) => {
    clearTimeout(uhr);
    knopf.textContent = text;
    status.textContent = text;
    uhr = setTimeout(() => { knopf.textContent = beschriftung; status.textContent = ''; }, 1600);
  };
  const offen = () => !menue.hidden;
  /** @param {number} i */
  const fokus = (i) => punkte[(i + punkte.length) % punkte.length]?.focus();
  /** @param {number} [i] Eintrag, der den Fokus bekommt */
  const oeffnen = (i = 0) => {
    menue.hidden = false;
    knopf.setAttribute('aria-expanded', 'true');
    // rechtsbündig unter dem Knopf; reicht der Platz links nicht (Knopf am Anfang einer Zeile), linksbündig, damit die
    // Tafel (overflow: hidden) nichts abschneidet
    menue.classList.remove('links');
    const rahmen = (knopf.closest('.panel') ?? document.documentElement).getBoundingClientRect();
    if (menue.getBoundingClientRect().left < rahmen.left) menue.classList.add('links');
    fokus(i);
  };
  const schliessen = () => {
    if (!offen()) return;
    menue.hidden = true;
    knopf.setAttribute('aria-expanded', 'false');
  };

  knopf.addEventListener('click', () => { if (offen()) schliessen(); else oeffnen(); });
  knopf.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      oeffnen(e.key === 'ArrowDown' ? 0 : -1);
    }
  });
  menue.addEventListener('keydown', (e) => {
    const i = punkte.findIndex((b) => b === document.activeElement);
    /** @type {Record<string, number>} */
    const ziel = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: -1 };
    if (e.key in ziel) { e.preventDefault(); fokus(ziel[e.key]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliessen(); knopf.focus(); }
    else if (e.key === 'Tab') schliessen();
  });
  // Fokus verlässt Knopf und Menü (z. B. Klick oder Tippen anderswo): schliessen
  menue.addEventListener('focusout', (e) => {
    const nach = /** @type {Node | null} */ (e.relatedTarget);
    if (nach && (menue.contains(nach) || nach === knopf)) return;
    if (nach) schliessen();
  });
  document.addEventListener('pointerdown', (e) => {
    const t = /** @type {Node} */ (e.target);
    if (offen() && !menue.contains(t) && !knopf.contains(t)) schliessen();
  });
  punkte.forEach((b, i) => b.addEventListener('click', () => {
    schliessen();
    knopf.focus();
    const { tun, erfolg } = eintraege[i];
    /** @type {void | Promise<unknown>} */
    let ergebnis;
    try { ergebnis = tun(); } catch { melden('Nicht möglich'); return; }
    Promise.resolve(ergebnis).then(() => { if (erfolg) melden(erfolg); }, () => melden('Nicht möglich'));
  }));
  return { menue, schliessen };
}

/** Datei herunterladen (Bildexport). @param {Blob} blob @param {string} name */
export function herunterladen(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/**
 * PNG in die Zwischenablage (Bildexport; fügt sich in Folien als Bild ein). Aufruf noch in der Klick-Behandlung: Safari
 * verlangt das, und das PNG geht deshalb als Promise an ClipboardItem. png erzeugt es erst, wenn die Zwischenablage da
 * ist (sonst bliebe ein Fehler beim Erzeugen unbehandelt).
 * @param {() => Promise<Blob>} png
 */
export function inZwischenablage(png) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return Promise.reject(new Error('keine Zwischenablage für Bilder'));
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': png() })]);
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
