// Kleine Helfer für alle Seiten einer App (App, Skript, Quiz): Versionsnummer eintragen, Offline-Betrieb.

/** Versionsnummer in alle Elemente mit data-version schreiben. */
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
