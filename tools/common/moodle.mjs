// Export der Quizfragen als Moodle-XML (Fragentyp „Multiple Choice“), zum Import in die Fragensammlung eines
// Moodle-Kurses. Bilder werden als SVG-Dateien in die Fragen eingebettet. Gemeinsam für alle Apps der Familie;
// die App liefert Fragen, Kapitel, Kursname und die Bildfunktion (tools/moodle-export.mjs der App).
//
// Ohne entwurf nur geprüfte Fragen (status 'geprüft'); erzeugte Fragen einmal je Parameter.
// Kategorien: <Kurs> / Kap. n … / Stufe s.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Farben des hellen Modus aus base.css ({ Name ohne --: Wert }), für Bilder ohne Browser. */
export function helleFarben(cssPfad) {
  const css = readFileSync(cssPfad, 'utf8');
  const start = css.indexOf(':root, .theme-light {');
  const block = css.slice(start, css.indexOf('}', start));
  const v = {};
  for (const m of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) v[m[1]] = m[2].trim();
  return v;
}

export const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** HTML der App für Moodle: Querstrich als kombinierender Überstrich (Moodle kennt die CSS-Klasse nicht). */
export const html = (s) => String(s).replace(/<span class="ov">([^<]*)<\/span>/g, (m, t) => [...t].map((c) => c + '̅').join(''));
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

// Querstriche über negativen Indizes setzen die Apps nach den Laufweiten von IBM Plex Sans. Ohne diese Schrift
// (Moodle) stünden sie neben den Ziffern; deshalb wird die Schrift in Bilder mit Beschriftung eingebettet
// (SIL Open Font License, siehe fonts/LICENSE-ibm-plex-sans.txt).
const schriften = new Map();
export function mitSchrift(svg, fontsDir) {
  if (!svg.includes('<text')) return svg;
  if (!schriften.has(fontsDir)) {
    const face = (file, style) => `@font-face{font-family:'IBM Plex Sans';font-style:${style};font-weight:400;src:url(data:font/woff2;base64,${
      readFileSync(join(fontsDir, file)).toString('base64')}) format('woff2')}`;
    schriften.set(fontsDir, `<defs><style>${face('ibm-plex-sans-latin-400-normal.woff2', 'normal')}${face('ibm-plex-sans-latin-400-italic.woff2', 'italic')}</style></defs>`);
  }
  return svg.replace(/(<svg[^>]*>)/, `$1${schriften.get(fontsDir)}`);
}

const datei = (name, svg) => `<file name="${name}" path="/" encoding="base64">${Buffer.from(svg).toString('base64')}</file>`;

/** Bruchteile nach Moodle: richtige Antworten teilen sich 100 %, falsche bei Mehrfachauswahl −100 %. */
function anteil(n) {
  const x = 100 / n;
  return Number.isInteger(x) ? String(x) : x.toFixed(5);
}

/**
 * Eine Frage (Aufbau wie in quiz-core.js) als <question type="multichoice">.
 * kapitel: [{ nr, titel }]; bildSVG(angabe, opt): eigenständige SVG-Datei (Text) zu einer Bildangabe.
 */
export function frageXML(q, { kapitel, bildSVG }) {
  const einfach = q.richtig.length === 1;
  const files = [];
  let text = html(q.frage);
  if (q.bild) {
    text += `<p><img src="@@PLUGINFILE@@/bild.svg" alt="${xmlEsc(q.bildAlt || 'Stereogramm')}" width="320" height="320"></p>`;
    files.push(datei('bild.svg', bildSVG(q.bild, q.bildOpt)));
  }
  if (q.typ === 'mehrfach') text += '<p><i>Mehrere Antworten können richtig sein.</i></p>';
  const nFalsch = q.antworten.length - q.richtig.length;
  const answers = q.antworten.map((a, i) => {
    const ok = q.richtig.includes(i);
    const frac = ok ? anteil(q.richtig.length) : einfach ? '0' : `-${anteil(nFalsch)}`;
    const fb = q.hinweise?.[i] ? `<feedback format="html"><text>${cdata(html(q.hinweise[i]))}</text></feedback>` : '';
    if (q.typ === 'text-bild' || q.typ === 'bild-bild') {
      const name = `antwort${i + 1}.svg`;
      return `<answer fraction="${frac}" format="html"><text>${cdata(`<img src="@@PLUGINFILE@@/${name}" alt="${xmlEsc(a.alt)}" width="200" height="200">`)}</text>${datei(name, bildSVG(a.app, { ...q.bildOpt, klein: true }))}${fb}</answer>`;
    }
    return `<answer fraction="${frac}" format="html"><text>${cdata(html(a))}</text>${fb}</answer>`;
  });
  const kap = kapitel.find((k) => k.nr === q.kapitel);
  const ziel = q.lernziel ? `<p><small>Lernziel (Kap. ${kap.nr}): ${html(q.lernziel)}</small></p>` : '';
  const allgemein = `<p>${html(q.erklaerung)}</p>${ziel}<p><small>Skript: Kap. ${kap.nr} ${xmlEsc(kap.titel)} · Quelle: ${xmlEsc(q.quelle)}</small></p>`;
  return `<question type="multichoice">
<name><text>${xmlEsc(q.id)}</text></name>
<questiontext format="html"><text>${cdata(text)}</text>${files.join('')}</questiontext>
<generalfeedback format="html"><text>${cdata(allgemein)}</text></generalfeedback>
<defaultgrade>1</defaultgrade>
<single>${einfach ? 'true' : 'false'}</single>
<shuffleanswers>1</shuffleanswers>
<answernumbering>ABCD</answernumbering>
${answers.join('\n')}
</question>`;
}

/** Alle (geprüften) Fragen, nach Kapitel und Stufe in Kategorien unter dem Kursnamen. */
export function moodleXML({ bank, generatoren = [], kapitel, kurs, bildSVG, entwurf = false }) {
  const ok = (s) => s === 'geprüft' || entwurf;
  const fragen = bank.filter((q) => ok(q.status));
  for (const g of generatoren) {
    if (!ok(g.status)) continue;
    for (const s of g.stufen) for (const p of g.params(s)) fragen.push({ ...g.make(p, s), id: `${g.id}:${p}`, stufe: s, kapitel: g.kapitel, status: g.status });
  }
  fragen.sort((a, b) => a.kapitel - b.kapitel || a.stufe - b.stufe);
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<quiz>'];
  let kat = null;
  for (const q of fragen) {
    const kap = kapitel.find((k) => k.nr === q.kapitel);
    const k = `$course$/top/${kurs}/Kap. ${kap.nr} ${kap.titel}/Stufe ${q.stufe}`;
    if (k !== kat) {
      out.push(`<question type="category"><category><text>${xmlEsc(k)}</text></category></question>`);
      kat = k;
    }
    out.push(frageXML(q, { kapitel, bildSVG }));
  }
  out.push('</quiz>');
  return { xml: out.join('\n'), anzahl: fragen.length };
}
