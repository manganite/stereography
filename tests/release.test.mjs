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
