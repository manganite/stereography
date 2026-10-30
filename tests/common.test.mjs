// Gemeinsame Dateien der App-Familie (crystallography-common): Kopie unverändert, eingebunden, Speicher stabil.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pruefen } from '../tools/common/check.mjs';
import { SPEICHER } from '../js/quiz-kapitel.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('lib/common und tools/common entsprechen dem Manifest (Änderungen gehören nach crystallography-common)', () => {
  assert.deepEqual(pruefen(ROOT), []);
});

test('jede Seite bindet Schriften, base.css und das Stylesheet ihres Seitentyps aus lib/common ein', () => {
  for (const [seite, typ] of [['index.html', 'app'], ['skript.html', 'skript'], ['quiz.html', 'quiz']]) {
    const html = read(seite);
    const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
    assert.deepEqual(links, ['lib/common/fonts/fonts.css', 'lib/common/css/base.css', `lib/common/css/${typ}.css`], seite);
    // eigene Stile der Seite stehen danach (überschreiben die gemeinsamen, nicht umgekehrt)
    const style = html.indexOf('<style>');
    if (style >= 0) assert.ok(style > html.indexOf(`lib/common/css/${typ}.css`), seite);
  }
});

test('Quiz: Speicher im Browser behält seinen Namen (sonst ginge der Stand der Studierenden verloren)', () => {
  assert.equal(SPEICHER, 'stereo-quiz');
});

test('keine Kopien gemeinsamer Module mehr in js/', () => {
  for (const f of ['format.js', 'help.js', 'quiz-core.js']) assert.throws(() => read(`js/${f}`), `js/${f}`);
});
