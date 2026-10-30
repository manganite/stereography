// App, Skript und Quiz sollen auch ohne die Vorlesung verständlich sein: keine Verweise auf
// Vorlesung, Übungen oder Folien. Erlaubt ist nur der Hinweis auf die Herkunft des Projekts
// („… Vorlesung Kristallographie an der ETH Zürich …“). „Folien“ ohne Nummer (z. B. „Bild für
// Folien kopieren“) ist kein Verweis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const files = [
  'index.html', 'skript.html', 'quiz.html', 'README.md',
  ...readdirSync(new URL('js/', root)).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`),
  ...readdirSync(new URL('lib/common/js/', root)).filter((f) => f.endsWith('.js')).map((f) => `lib/common/js/${f}`),
];
const HERKUNFT = /Vorlesung Kristallographie an der ETH Zürich/g;
// Wortgrenzen Unicode-fähig: \b sieht „Ü“ nicht als Wortzeichen, \bÜbungen\b fände „siehe Übungen“ nicht.
const VERWEIS = /Vorlesung|(?<![\p{L}\p{N}_])Übungen(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])Folien? \d/u;

test('das Suchmuster erkennt Verweise, auch mit Umlaut am Wortanfang', () => {
  for (const s of ['siehe Vorlesung', 'Übungen', 'siehe Übungen, Blatt 3', '(Übungen)', 'Folie 12', 'Folien 3–5']) assert.match(s, VERWEIS, s);
  for (const s of ['Übungsblatt', 'Bild für Folien kopieren', 'Kopierfolie 2']) assert.doesNotMatch(s, VERWEIS, s);
});

test('keine Verweise auf Vorlesung, Übungen oder Folien', () => {
  const funde = [];
  for (const f of files) {
    readFileSync(new URL(f, root), 'utf8').replace(HERKUNFT, '').split('\n').forEach((zeile, i) => {
      const m = zeile.match(VERWEIS);
      if (m) funde.push(`${f}:${i + 1}: „${m[0]}“`);
    });
  }
  assert.deepEqual(funde, []);
});

test('die Herkunft aus der Vorlesung ist in App, Skript und README genannt', () => {
  for (const f of ['index.html', 'skript.html', 'README.md']) {
    assert.match(readFileSync(new URL(f, root), 'utf8'), new RegExp(HERKUNFT.source), f);
  }
});
