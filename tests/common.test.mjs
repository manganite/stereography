// Gemeinsame Dateien der App-Familie (crystallography-common): Kopie unverändert, eingebunden, Name des Speichers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pruefen } from '../tools/common/check.mjs';
import { SPEICHER } from '../js/quiz-kapitel.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
/** @param {string} p */
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('lib/common und tools/common entsprechen dem Manifest (Änderungen gehören nach crystallography-common)', () => {
  assert.deepEqual(pruefen(ROOT), []);
});

test('jede Seite bindet Schriften, base.css und das Stylesheet ihres Seitentyps aus lib/common ein', () => {
  // die Hilfeseite sieht aus wie das Skript und lädt hilfe.css danach
  for (const [seite, ...typen] of [['index.html', 'app'], ['skript.html', 'skript'], ['quiz.html', 'quiz'], ['hilfe.html', 'skript', 'hilfe']]) {
    const html = read(seite);
    const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
    assert.deepEqual(links, ['lib/common/fonts/fonts.css', 'lib/common/css/base.css', ...typen.map((t) => `lib/common/css/${t}.css`)], seite);
    // eigene Stile der Seite stehen danach (überschreiben die gemeinsamen, nicht umgekehrt)
    const style = html.indexOf('<style>');
    if (style >= 0) assert.ok(style > html.indexOf(`lib/common/css/${typen.at(-1)}.css`), seite);
  }
});

test('Quiz: Speicher im Browser heisst wie festgelegt (Umbenennen verwirft den Lernstand, Leitfaden Abschn. 7)', () => {
  assert.equal(SPEICHER, 'stereo-quiz');
});

test('Experimente: Speicher im Browser heisst wie festgelegt und beginnt mit dem Präfix der App', () => {
  const main = read('js/main.js');
  assert.match(main, /ablaufKarte\(\$\('experimente'\), [^{]*\{[^}]*speicher: 'stereo-experimente'/);
  assert.match(main, /alleEinstellungenZuruecksetzen\('stereo'\)/);
});

test('keine Kopien gemeinsamer Module mehr in js/', () => {
  for (const f of ['format.js', 'help.js', 'quiz-core.js']) assert.throws(() => read(`js/${f}`), `js/${f}`);
});

test('Hilfeseite: Modi, abgebildete Bedienelemente und Bilder passen zur App (pruefeHilfe)', async () => {
  const { pruefeHilfe } = await import('../lib/common/js/hilfe-seite.js');
  const { HILFE } = await import('../js/hilfe-daten.js');
  const dateien = readdirSync(new URL('../hilfe/', import.meta.url));
  assert.deepEqual(pruefeHilfe(HILFE, { html: read('index.html'), dateien }), []);
  // „?“ führt zur Hilfeseite (Leitfaden Abschn. 5.3)
  assert.match(read('index.html'), /<a class="helpbtn" id="help-open" href="hilfe\.html"/);
});
