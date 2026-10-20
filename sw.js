// Service Worker: hält alle Dateien der App für den Offline-Betrieb vor (z. B. im Hörsaal ohne WLAN).
// Je Version ein eigener Cache; eine neue Version wird beim nächsten Öffnen geladen, alte Caches
// werden entfernt. VERSION muss mit js/version.js übereinstimmen (tests/release.test.mjs).
const VERSION = '1.5.0';
const CACHE = `stereogramm-${VERSION}`;
const FILES = [
  './',
  'index.html',
  'skript.html',
  'css/base.css',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/favicon.ico',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'js/examples.js',
  'js/format.js',
  'js/help.js',
  'js/forms.js',
  'js/linalg.js',
  'js/main.js',
  'js/scene.js',
  'js/skript.js',
  'js/pointgroups.js',
  'js/polyhedra.js',
  'js/stereogram.js',
  'js/version.js',
  'js/view3d.js',
  'lib/three.bundle.js',
  'lib/fonts/fonts.css',
  'lib/fonts/ibm-plex-mono-latin-400-normal.woff2',
  'lib/fonts/ibm-plex-mono-latin-500-normal.woff2',
  'lib/fonts/ibm-plex-sans-greek-400-italic.woff2',
  'lib/fonts/ibm-plex-sans-greek-400-normal.woff2',
  'lib/fonts/ibm-plex-sans-greek-500-normal.woff2',
  'lib/fonts/ibm-plex-sans-greek-600-normal.woff2',
  'lib/fonts/ibm-plex-sans-latin-400-italic.woff2',
  'lib/fonts/ibm-plex-sans-latin-400-normal.woff2',
  'lib/fonts/ibm-plex-sans-latin-500-normal.woff2',
  'lib/fonts/ibm-plex-sans-latin-600-normal.woff2',
  'lib/fonts/source-serif-4-latin-500-normal.woff2',
  'lib/fonts/source-serif-4-latin-600-normal.woff2',
];

/** Eigenständige Seiten; jeder andere Seitenaufruf (z. B. ./ oder ?sw) führt zur App. */
const PAGES = ['index.html', 'skript.html'];

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
  const page = PAGES.find((p) => new URL(req.url).pathname.endsWith('/' + p));
  const key = req.mode === 'navigate' ? page || 'index.html' : req;
  event.respondWith(
    caches.open(CACHE)
      .then((c) => c.match(key, { ignoreSearch: true }))
      .then((hit) => hit || fetch(req)),
  );
});
