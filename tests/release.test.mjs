// Release-Konsistenz: Version in App, Service Worker und Changelog; Offline-Liste vollständig.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION } from '../js/version.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const sw = read('sw.js');

test('Version: semver, gleich in js/version.js, sw.js und CHANGELOG.md', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
  assert.equal(sw.match(/const VERSION = '([^']+)'/)[1], VERSION, 'sw.js');
  assert.match(read('CHANGELOG.md'), new RegExp(`^## \\[${VERSION.replace(/\./g, '\\.')}\\] - \\d{4}-\\d{2}-\\d{2}$`, 'm'), 'CHANGELOG.md');
});

test('Service Worker: Offline-Liste deckt alle Dateien der App ab', () => {
  const listed = [...sw.matchAll(/^ {2}'([^']+)',$/gm)].map((m) => m[1]);
  const walk = (dir) => readdirSync(join(ROOT, dir)).flatMap((f) => {
    const p = join(dir, f);
    return statSync(join(ROOT, p)).isDirectory() ? walk(p) : [p];
  });
  const app = ['index.html', 'skript.html', 'manifest.webmanifest', ...['js', 'css', 'lib', 'icons'].flatMap(walk)]
    .map((p) => relative('.', p).split('\\').join('/'))
    .filter((p) => !p.endsWith('.txt'));
  for (const p of app) assert.ok(listed.includes(p), `fehlt in sw.js: ${p}`);
  for (const p of listed) if (p !== './') assert.ok(existsSync(join(ROOT, p)), `existiert nicht: ${p}`);
});

test('Service Worker: jede Seite wird bei Seitenaufrufen aus ihrem eigenen Cache-Eintrag geliefert', () => {
  const pages = JSON.parse(sw.match(/const PAGES = (\[[^\]]*\]);/)[1].replace(/'/g, '"'));
  const html = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  for (const p of html) assert.ok(pages.includes(p), `fehlt in PAGES (sw.js): ${p}`);
});

test('Deployment: der Schritt „Assemble site“ kopiert jede Datei der Offline-Liste', () => {
  // Fehlt eine Datei auf GitHub Pages, schlägt cache.addAll() fehl und der neue Service Worker installiert sich nicht.
  const cp = read('.github/workflows/deploy.yml').match(/^\s*cp -r (.+) _site\/$/m);
  assert.ok(cp, 'cp-Zeile in deploy.yml');
  const copied = cp[1].trim().split(/\s+/);
  const listed = [...sw.matchAll(/^ {2}'([^']+)',$/gm)].map((m) => m[1]).filter((p) => p !== './');
  for (const p of listed) assert.ok(copied.includes(p.split('/')[0]), `wird nicht veröffentlicht: ${p}`);
  assert.ok(copied.includes('sw.js'), 'sw.js');
});

test('Skript als PDF: Werkzeug, Link im Skript, Erzeugen bei Deploy und Release', () => {
  const tool = read('tools/skript-pdf.mjs');
  assert.match(tool, /outline: true/);
  assert.match(read('skript.html'), /<a class="linkcopy" href="skript\.pdf"/);
  assert.match(read('.github/workflows/deploy.yml'), /node tools\/skript-pdf\.mjs _site\/skript\.pdf/);
  const rel = read('.github/workflows/release.yml');
  assert.match(rel, /node tools\/skript-pdf\.mjs "Stereographische-Projektion-Skript-\$\{GITHUB_REF_NAME\}\.pdf"/);
  assert.match(rel, /files: Stereographische-Projektion-Skript-\$\{\{ github\.ref_name \}\}\.pdf/);
  // Der Service Worker liefert Dateien wie skript.pdf aus dem Netz, nicht die Startseite
  assert.match(sw, /const datei = /);
});
