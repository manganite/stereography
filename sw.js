// Service Worker: hält alle Dateien der App für den Offline-Betrieb vor (z. B. im Hörsaal ohne WLAN).
// Je Version ein eigener Cache; eine neue Version wird beim nächsten Öffnen geladen, alte Caches
// werden entfernt. VERSION muss mit js/version.js übereinstimmen (tests/release.test.mjs).
const VERSION = '1.21.0';
const CACHE = `stereogramm-${VERSION}`; // Präfix je App eindeutig wählen und nicht ändern: activate löscht alte Caches nach dem Präfix
const FILES = [
  './',
  'index.html',
  'skript.html',
  'quiz.html',
  'hilfe.html',
  'lib/common/css/app.css',
  'lib/common/css/base.css',
  'lib/common/css/hilfe.css',
  'lib/common/css/quiz.css',
  'lib/common/css/skript.css',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/favicon.ico',
  'icons/favicon.svg',
  'hilfe/aufbau.png',
  'hilfe/brechen-1.png',
  'hilfe/brechen-2.png',
  'hilfe/brechen-3.png',
  'hilfe/einstieg-pg-1.png',
  'hilfe/einstieg-pg-2.png',
  'hilfe/einstieg-pg-3.png',
  'hilfe/einstieg-pg-4.png',
  'hilfe/einstieg-poly-1.png',
  'hilfe/einstieg-poly-2.png',
  'hilfe/einstieg-poly-3.png',
  'hilfe/einstieg-poly-4.png',
  'hilfe/pg-kenndaten.png',
  'hilfe/pg-konstruktion.png',
  'hilfe/pg-seitenleiste.png',
  'hilfe/pg-stereogramm.png',
  'hilfe/poly-kenndaten.png',
  'hilfe/poly-konstruktion.png',
  'hilfe/poly-seitenleiste.png',
  'hilfe/poly-stereogramm.png',
  'hilfe/winkel-pg-1.png',
  'hilfe/winkel-pg-2.png',
  'hilfe/winkel-poly-1.png',
  'hilfe/winkel-poly-2.png',
  'hilfe/zone-1.png',
  'hilfe/zone-2.png',
  'hilfe/zone-3.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'js/aufstellungen.js',
  'js/bild3d.js',
  'js/examples.js',
  'js/experimente.js',
  'js/formen.js',
  'js/forms.js',
  'js/hilfe-anleitung.js',
  'js/hilfe-daten.js',
  'js/hilfe.js',
  'js/hilfetexte.js',
  'js/kern.js',
  'js/linalg.js',
  'js/main.js',
  'js/pointgroups.js',
  'js/polyhedra.js',
  'js/punktgruppen.js',
  'js/quiz-bank.js',
  'js/quiz-gen.js',
  'js/quiz-kapitel.js',
  'js/quiz.js',
  'js/scene.js',
  'js/sitesym.js',
  'js/skript.js',
  'js/skriptlinks.js',
  'js/stereogram.js',
  'js/version.js',
  'js/view3d.js',
  'js/zustand.js',
  'lib/common/js/ablauf.js',
  'lib/common/js/format.js',
  'lib/common/js/help.js',
  'lib/common/js/hilfe-gemeinsam.js',
  'lib/common/js/hilfe-seite.js',
  'lib/common/js/quiz-core.js',
  'lib/common/js/quiz-seite.js',
  'lib/common/js/seite.js',
  'lib/common/js/skript-kern.js',
  'lib/common/js/typen.js',
  'lib/common/js/version.js',
  'lib/three.bundle.js',
  'lib/common/fonts/fonts.css',
  'lib/common/fonts/ibm-plex-mono-latin-400-normal.woff2',
  'lib/common/fonts/ibm-plex-mono-latin-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-400-italic.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-400-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-600-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-400-italic.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-400-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-600-normal.woff2',
  'lib/common/fonts/source-serif-4-latin-500-normal.woff2',
  'lib/common/fonts/source-serif-4-latin-600-normal.woff2',
  'lib/kern/crystalClasses.js',
  'lib/kern/index.js',
  'lib/kern/lattice.js',
  'lib/kern/linalg.js',
  'lib/kern/magnetic.js',
  'lib/kern/operations.js',
  'lib/kern/pointGroups/crystalForms.js',
  'lib/kern/pointGroups/crystalFormsData.js',
  'lib/kern/pointGroups/data.js',
  'lib/kern/pointGroups/elements.js',
  'lib/kern/pointGroups/identify.js',
  'lib/kern/pointGroups/itaOrder.js',
  'lib/kern/pointGroups/magneticData.js',
  'lib/kern/pointGroups/magneticSymbols.js',
  'lib/kern/pointGroups/orbits.js',
  'lib/kern/pointGroups/pointGroups.js',
  'lib/kern/pointGroups/properties.js',
  'lib/kern/pointGroups/wyckoff.js',
  'lib/kern/pointGroups/wyckoffData.js',
  'lib/kern/siteSymmetry.js',
  'lib/kern/symmetryDirections.js',
  'lib/kern/tensors/propertyTable.js',
  'lib/kern/tensors/rowEchelon.js',
  'lib/kern/tensors/tensorForm.js',
  'lib/kern/tensors/tensorProperties.js',
  'lib/kern/tolerances.js',
  'lib/kern/version.js',
];

/** Eigenständige Seiten; jeder andere Seitenaufruf (z. B. ./ oder ?sw) führt zur App. */
const PAGES = ['index.html', 'skript.html', 'quiz.html', 'hilfe.html'];

self.addEventListener('install', (event) => {
  // cache: 'reload' umgeht den HTTP-Cache des Browsers, damit keine Dateien der Vorversion übernommen werden
  const reqs = FILES.map((f) => new Request(f, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(reqs)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('stereogramm-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Seitenaufrufe (auch mit Suchparametern) liefern ihre Seite, sonst index.html; alles andere aus dem Cache, sonst Netz
  const path = new URL(req.url).pathname;
  const page = PAGES.find((p) => path.endsWith('/' + p));
  // Dateien wie skript.pdf kommen aus dem Netz, nicht als index.html
  const datei = /\.[a-z0-9]+$/i.test(path) && !path.endsWith('.html');
  const key = req.mode === 'navigate' && !datei ? page || 'index.html' : req;
  event.respondWith(
    caches.open(CACHE)
      .then((c) => c.match(key, { ignoreSearch: true }))
      .then((hit) => hit || fetch(req)),
  );
});
