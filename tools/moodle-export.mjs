// Export der Quizfragen als Moodle-XML (Fragentyp „Multiple Choice“), zum Import in die Fragensammlung
// eines Moodle-Kurses. Stereogramme werden als SVG-Dateien in die Fragen eingebettet.
//
//   node tools/moodle-export.mjs [Ausgabedatei] [--entwurf]
//
// Ohne --entwurf nur geprüfte Fragen (status 'geprüft'); erzeugte Fragen einmal je Parameter.
// Kategorien: Stereographische Projektion / Kap. n … / Stufe s.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANK } from '../js/quiz-bank.js';
import { GENERATOREN } from '../js/quiz-gen.js';
import { KAPITEL } from '../js/quiz-core.js';
import { stereoForHash } from '../js/scene.js';
import { buildSVG } from '../js/stereogram.js';

/** Farben des hellen Modus aus css/base.css (wie palette() in scene.js, ohne Browser). */
export function hellePalette() {
  const css = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');
  const block = css.slice(css.indexOf(':root, .theme-light {'), css.indexOf('}', css.indexOf(':root, .theme-light {')));
  const v = {};
  for (const m of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) v[m[1]] = m[2].trim();
  const g = (n) => v[n];
  return {
    paper: g('paper'), ink: g('ink'), muted: g('muted'), net: g('net'),
    mirror: g('ink'), axis: g('ink'), dir: [g('dir1'), g('dir2'), g('dir3')],
    upper: g('upper'), accent: g('accent'), accent2: g('accent2'),
    ray: g('ray'), crystal: g('crystal'), crystal2: g('crystal2'), edge: g('edge'),
    normal: g('normal'), sphere: g('muted'), mirror3d: g('mirror'),
    ax2: g('ax2'), ax3: g('ax3'), ax4: g('ax4'), ax6: g('ax6'),
    form: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => g('fc' + i)),
  };
}

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** HTML der App für Moodle: Querstrich als kombinierender Überstrich (Moodle kennt die CSS-Klasse nicht). */
const html = (s) => String(s).replace(/<span class="ov">([^<]*)<\/span>/g, (m, t) => [...t].map((c) => c + '̅').join(''));
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/** SVG einer Abbildung (Link-Adresse der App), wie im Quiz: ohne Ausgangspol-Markierung. */
function svgFor(hash, col, opt = {}) {
  const { scene } = stereoForHash(hash, col);
  scene.poles = (scene.poles || []).map((p) => ({ ...p, gen: false, selected: false }));
  if (opt.zonenachse === false && scene.zoneList) scene.zoneList = scene.zoneList.map((z) => ({ ...z, label: null, axisMark: false }));
  if (opt.klein) scene.poleScale = 2.2;
  return mitSchrift(buildSVG({ ...scene, bg: col.paper }, { standalone: true }).full);
}

// Die Querstriche über negativen Indizes setzt stereogram.js nach den Laufweiten von IBM Plex Sans. Ohne diese
// Schrift (Moodle) stünden sie neben den Ziffern; deshalb wird die Schrift in Bilder mit Beschriftung eingebettet
// (SIL Open Font License, siehe lib/fonts/LICENSE-ibm-plex-sans.txt).
let schrift = null;
function mitSchrift(svg) {
  if (!svg.includes('<text')) return svg;
  if (!schrift) {
    const face = (file, style) => `@font-face{font-family:'IBM Plex Sans';font-style:${style};font-weight:400;src:url(data:font/woff2;base64,${
      readFileSync(new URL(`../lib/fonts/${file}`, import.meta.url)).toString('base64')}) format('woff2')}`;
    schrift = `<defs><style>${face('ibm-plex-sans-latin-400-normal.woff2', 'normal')}${face('ibm-plex-sans-latin-400-italic.woff2', 'italic')}</style></defs>`;
  }
  return svg.replace(/(<svg[^>]*>)/, `$1${schrift}`);
}

const datei = (name, svg) => `<file name="${name}" path="/" encoding="base64">${Buffer.from(svg).toString('base64')}</file>`;

/** Bruchteile nach Moodle: richtige Antworten teilen sich 100 %, falsche bei Mehrfachauswahl −100 %. */
function anteil(n) {
  const x = 100 / n;
  return Number.isInteger(x) ? String(x) : x.toFixed(5);
}

/** Eine Frage (Aufbau wie in quiz-bank.js) als <question type="multichoice">. */
export function frageXML(q, col) {
  const einfach = q.richtig.length === 1;
  const files = [];
  let text = html(q.frage);
  if (q.bild) {
    text += `<p><img src="@@PLUGINFILE@@/bild.svg" alt="${xmlEsc(q.bildAlt || 'Stereogramm')}" width="320" height="320"></p>`;
    files.push(datei('bild.svg', svgFor(q.bild, col, q.bildOpt)));
  }
  if (q.typ === 'mehrfach') text += '<p><i>Mehrere Antworten können richtig sein.</i></p>';
  const nFalsch = q.antworten.length - q.richtig.length;
  const answers = q.antworten.map((a, i) => {
    const ok = q.richtig.includes(i);
    const frac = ok ? anteil(q.richtig.length) : einfach ? '0' : `-${anteil(nFalsch)}`;
    const fb = q.hinweise?.[i] ? `<feedback format="html"><text>${cdata(html(q.hinweise[i]))}</text></feedback>` : '';
    if (q.typ === 'text-bild') {
      const name = `antwort${i + 1}.svg`;
      return `<answer fraction="${frac}" format="html"><text>${cdata(`<img src="@@PLUGINFILE@@/${name}" alt="${xmlEsc(a.alt)}" width="200" height="200">`)}</text>${datei(name, svgFor(a.app, col, { ...q.bildOpt, klein: true }))}${fb}</answer>`;
    }
    return `<answer fraction="${frac}" format="html"><text>${cdata(html(a))}</text>${fb}</answer>`;
  });
  const kap = KAPITEL.find((k) => k.nr === q.kapitel);
  const allgemein = `<p>${html(q.erklaerung)}</p><p><small>Skript: Kap. ${kap.nr} ${xmlEsc(kap.titel)} · Quelle: ${xmlEsc(q.quelle)}</small></p>`;
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

/** Alle (geprüften) Fragen, nach Kapitel und Stufe in Kategorien. */
export function moodleXML({ entwurf = false } = {}) {
  const col = hellePalette();
  const ok = (s) => s === 'geprüft' || entwurf;
  const fragen = BANK.filter((q) => ok(q.status));
  for (const g of GENERATOREN) {
    if (!ok(g.status)) continue;
    for (const s of g.stufen) for (const p of g.params(s)) fragen.push({ ...g.make(p, s), id: `${g.id}:${p}`, stufe: s, kapitel: g.kapitel, status: g.status });
  }
  fragen.sort((a, b) => a.kapitel - b.kapitel || a.stufe - b.stufe);
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<quiz>'];
  let kat = null;
  for (const q of fragen) {
    const kap = KAPITEL.find((k) => k.nr === q.kapitel);
    const k = `$course$/top/Stereographische Projektion/Kap. ${kap.nr} ${kap.titel}/Stufe ${q.stufe}`;
    if (k !== kat) {
      out.push(`<question type="category"><category><text>${xmlEsc(k)}</text></category></question>`);
      kat = k;
    }
    out.push(frageXML(q, col));
  }
  out.push('</quiz>');
  return { xml: out.join('\n'), anzahl: fragen.length };
}

// Aufruf von der Kommandozeile
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const entwurf = args.includes('--entwurf');
  const ziel = args.find((a) => !a.startsWith('--')) || 'quiz-moodle.xml';
  const { xml, anzahl } = moodleXML({ entwurf });
  writeFileSync(ziel, xml);
  console.log(`${anzahl} Fragen nach ${ziel} geschrieben${entwurf ? ' (mit Entwürfen)' : ''}.`);
}
