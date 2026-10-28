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
  const re = new RegExp(`<div class="box ${kind}"[^>]*>`, 'g');
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
    assert.match(b, /^<div class="box vertiefung"(?: id="[a-z-]+")?>\s*<h4>Vertiefung · <b>[^<]+<\/b><\/h4>/, b.slice(0, 120));
    assert.ok((b.match(/<p>/g) || []).length >= 2, `Bezugssatz und Inhalt fehlen: ${b.slice(0, 120)}`);
  }
});

test('Grundlagen-Kästen: Kopfzeile „Grundlagen · Thema“, Anker und Legende', () => {
  const g = boxes('grundlagen');
  assert.ok(g.length >= 3, `nur ${g.length} Grundlagen-Kästen`);
  for (const b of g) assert.match(b, /^<div class="box grundlagen" id="[a-z-]+">\s*<h4>Grundlagen · <b>[^<]+<\/b><\/h4>/, b.slice(0, 120));
  const [a] = boxes('aufbau');
  assert.ok(a.includes('Grundlagen'));
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
  assert.deepEqual(ids, ['aufstellung-pg', 'eigenschaften', 'hkil', 'lagen', 'verzerrung']);
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

test('Vertiefungskapitel: Trenner „Vertiefungen“ vor Kapitel 8, auch im Inhaltsverzeichnis', () => {
  assert.match(html, /<div class="teil">\s*<p class="teil-titel">Vertiefungen<\/p>[\s\S]*?<\/div>\s*<section id="lagen" data-level="vertiefung">/);
  assert.match(html, /<li class="toc-teil">Vertiefungen<\/li>\s*<li><a href="#lagen">/);
});

test('Einleitung erklärt die Kennzeichnung', () => {
  const [a] = boxes('aufbau');
  assert.ok(a && a.includes('Vertiefung') && a.includes('In der App'));
});

// Verweise aus der App ins Skript (js/skriptlinks.js)
import { SKRIPT_ANCHORS } from '../js/skriptlinks.js';
const mainJs = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');

test('Skript-Verweise der App: Anker existiert und liegt im angegebenen Kapitel', () => {
  for (const [anchor, kap] of Object.entries(SKRIPT_ANCHORS)) {
    const at = html.indexOf(`id="${anchor}"`);
    assert.ok(at > 0, `Anker #${anchor} fehlt im Skript`);
    const nrs = [...html.slice(0, at).matchAll(/<h2><span class="nr">(\d+)<\/span>/g)];
    assert.equal(Number(nrs.at(-1)[1]), kap, `#${anchor} liegt nicht in Kapitel ${kap}`);
  }
});

test('Infobox: jeder Begriff ist ein Verweis ins Skript', () => {
  const bare = [...mainJs.matchAll(/<dt>(?!\$\{skriptTerm\()([^<]*)/g)].map((m) => m[1]);
  assert.deepEqual(bare, [], 'Begriffe ohne Verweis: ' + bare.join(', '));
  for (const m of mainJs.matchAll(/skriptTerm\('[^']*', '([^']+)'\)/g)) {
    assert.ok(m[1] in SKRIPT_ANCHORS, `unbekannter Anker ${m[1]}`);
  }
});
