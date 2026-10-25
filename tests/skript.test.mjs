// Skript: Kennzeichnung von Vorlesungsstoff, Vertiefungen und Hinweisen zur App.
// Vorlesungsstoff ist unmarkiert; Vertiefungen und App-Hinweise stehen in eigenen Kästen
// bzw. tragen data-level="vertiefung" am Abschnitt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');

// Inhalt eines <div class="box …"> bis zum passenden </div>
function boxes(kind) {
  const out = [];
  const re = new RegExp(`<div class="box ${kind}">`, 'g');
  let m;
  while ((m = re.exec(html))) {
    let depth = 1;
    let i = re.lastIndex;
    const tag = /<\/?div\b[^>]*>/g;
    tag.lastIndex = i;
    let t;
    while (depth && (t = tag.exec(html))) depth += t[0].startsWith('</') ? -1 : 1;
    out.push(html.slice(m.index, tag.lastIndex));
  }
  return out;
}

test('Vertiefungskästen: Themenzeile und ein Satz zum Bezug vor dem Inhalt', () => {
  const v = boxes('vertiefung');
  assert.ok(v.length >= 10, `nur ${v.length} Vertiefungskästen`);
  for (const b of v) {
    assert.match(b, /^<div class="box vertiefung">\s*<h4>Vertiefung · <b>[^<]+<\/b><\/h4>/, b.slice(0, 120));
    assert.ok((b.match(/<p>/g) || []).length >= 2, `Bezugssatz und Inhalt fehlen: ${b.slice(0, 120)}`);
  }
});

test('App-Kästen haben die Kopfzeile „In der App“', () => {
  const a = boxes('app');
  assert.ok(a.length >= 8);
  for (const b of a) assert.match(b, /^<div class="box app">\s*<h4>In der App<\/h4>/);
});

test('Kapitel 8 und 9 sind Vertiefungen mit Kasten „Bezug zur Vorlesung“', () => {
  for (const id of ['lagen', 'verzerrung']) {
    const start = html.indexOf(`<section id="${id}" data-level="vertiefung">`);
    assert.ok(start >= 0, `${id}: data-level fehlt`);
    const head = html.slice(start, html.indexOf('<div class="box ziele">', start));
    assert.match(head, /<div class="box bezug">\s*<h4>Bezug zur Vorlesung<\/h4>/, id);
  }
});

test('Vertiefungsabschnitte stehen im Inhaltsverzeichnis', () => {
  const ids = [...html.matchAll(/<section id="([^"]+)" data-level="vertiefung">/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['hkil', 'lagen', 'verzerrung']);
  for (const id of ids) assert.ok(html.includes(`<a href="#${id}">`), id);
});

test('Lernziele und Zusammenfassungen: „Zur Vertiefung“ nur nach dem Vorlesungsteil', () => {
  for (const kind of ['ziele', 'zusammen']) {
    for (const b of boxes(kind)) {
      const i = b.indexOf('<h5>Zur Vertiefung</h5>');
      if (i < 0) continue;
      assert.ok(b.slice(0, i).includes('<li>'), 'Vorlesungsteil fehlt vor „Zur Vertiefung“');
      assert.ok(b.slice(i).includes('<li>'), 'leere Vertiefungsliste');
    }
  }
});

test('Einleitung erklärt die Kennzeichnung', () => {
  const [a] = boxes('aufbau');
  assert.ok(a && a.includes('Vertiefung') && a.includes('In der App'));
});
