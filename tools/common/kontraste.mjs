// Kontraste nach WCAG 2.2 messen (Leitfaden Abschn. 5.4, #65): Text (1.4.3) und Grafik (1.4.11), hell und dunkel.
//
//   node tools/kontraste.mjs [Arbeitsordner] [Seite …]
//
// Arbeitsordner: absolut oder mit „.“ beginnend, Ordner mit den Repositories nebeneinander (Standard: der Ordner über
// crystallography-common bzw. über der App, wenn die Datei als tools/common/ in einer App liegt). Seiten relativ dazu, z. B. `stereography/` oder `plane-groups/skript.html`; ohne Angabe App,
// Skript und Quiz jeder App im Arbeitsordner (Ordner mit lib/common/); eine Seite darf einen Zustand tragen
// (`stereography/#m=form`). Ausgabe: je Seite und Farbschema die Befunde, gruppiert nach Farbpaar; Exitcode 1, wenn ein
// Text die Schwelle verfehlt (Grafik entscheidet die Durchsicht).
//
// Gemessen wird die gerenderte Seite (Chromium über Playwright): Textfarbe gegen den Hintergrund, der sich aus den
// Hintergrundfarben der Vorfahren ergibt (mit Transparenz und Deckkraft); Text in SVG gegen seinen Hof oder die Flächen,
// die ihn umschliessen, mit denselben Schwellen. Gesperrte Bedienelemente sind nach WCAG ausgenommen und werden nur
// gezählt. Grafik (SVG-Linien und -Flächen unter 3 : 1) wird als Liste zur Durchsicht ausgegeben: Ob eine Linie zum
// Verständnis nötig ist (1.4.11) oder nur stützt, entscheidet der Mensch.
// Grenzen: Text über Bildern, Verläufen oder Mustern wird als „unsicher“ gemeldet, nicht gemessen; Inhalte von
// <canvas> (3D), Pfeilspitzen (<marker>), <use>, Tooltips und Zustände nach Bedienung ausser den angegebenen Adressen
// fehlen; Abbildungen, die erst beim Hineinscrollen geladen werden, fehlen, wenn sie beim Messen nicht da sind. Flächen
// unter SVG-Text: nur solche, die ihn mit ihrem umschreibenden Rechteck ganz umfassen und Mausereignisse annehmen
// (`elementsFromPoint`, also nicht mit `pointer-events: none`). Die Deckkraft einer Gruppe wird je Element
// verrechnet, nicht auf das fertige Bild der Gruppe (bei abgeblendeten Gruppen mit Hof leicht abweichend).
//
// Braucht Playwright mit Chromium (wie tools/skript-pdf.mjs); mit KONTRASTE_CHROME=<Pfad> ein anderer Chromium.

import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { server } from './server.mjs';

/**
 * Schwellen nach WCAG 2.2: Text 4,5, grosser Text 3 (1.4.3), Grafik und Bedienelemente 3 (1.4.11). Beschriftungen in
 * Abbildungen (SVG-Text) sind Text und haben dieselben Schwellen (Leitfaden Abschn. 5.4, Entscheidung Thomas, 8.11.2026).
 */
export const SCHWELLE = { text: 4.5, gross: 3, grafik: 3 };

/** @typedef {[number, number, number, number]} RGBA */

/**
 * Relative Leuchtdichte nach WCAG (sRGB, Werte 0–255).
 * @param {RGBA | [number, number, number]} c
 */
export function leuchtdichte(c) {
  const k = c.slice(0, 3).map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
}

/**
 * Kontrastverhältnis zweier deckender Farben (1 bis 21).
 * @param {RGBA | [number, number, number]} a @param {RGBA | [number, number, number]} b
 */
export function kontrast(a, b) {
  const [x, y] = [leuchtdichte(a), leuchtdichte(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Farbe a (mit Deckkraft a[3], 0–1) über der deckenden Farbe b.
 * @param {RGBA} a @param {RGBA} b @returns {RGBA}
 */
export function ueber(a, b) {
  const t = a[3];
  return [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t), 1];
}

/** #rrggbb einer Farbe. @param {RGBA | number[]} c */
export const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/**
 * Im Browser: alle sichtbaren Texte und SVG-Grafiken mit Farbe, Hintergrund und Grösse. Läuft in der Seite
 * (page.evaluate); deshalb ohne Verweise nach aussen.
 */
function messenImBrowser() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d', { willReadFrequently: true }));
  /**
   * CSS-Farbe (jede Schreibweise, auch color-mix) mit zusätzlicher Deckkraft über eine deckende Farbe legen; die
   * Leinwand mischt, wie der Browser es tut. Ohne Umweg über eine Rückrechnung der Transparenz (ungenau bei kleinem
   * Alpha).
   * @param {string} css @param {number[]} unter @param {number} [deck]
   */
  const mische = (css, unter, deck = 1) => {
    ctx.globalAlpha = 1; ctx.fillStyle = `rgb(${unter.slice(0, 3).map(Math.round).join(',')})`; ctx.fillRect(0, 0, 1, 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, deck)); ctx.fillStyle = '#000'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], 1];
  };
  /** Ist eine Farbe ganz durchsichtig (jede Schreibweise, auch color(… / 0))? Muster url(…) zählen nicht dazu. @param {string} css */
  const leer = (css) => {
    if (css === 'none' || css.startsWith('url(')) return css === 'none';
    ctx.clearRect(0, 0, 1, 1); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
  };
  /** Muster oder Verlauf (url(…)): Farbe nicht bestimmbar. @param {string} css */
  const muster = (css) => css.startsWith('url(');
  /** Hintergrund hinter einem HTML-Element und ob ein Bild oder Verlauf darunter liegt. @param {Element} el */
  const hintergrund = (el) => {
    /** @type {Element[]} */
    const kette = [];
    for (let e = /** @type {Element | null} */ (el); e; e = e.parentElement) kette.unshift(e);
    let bg = [255, 255, 255, 1];
    let unsicher = false;
    for (const e of kette) {
      if (e instanceof SVGElement) continue;
      const cs = getComputedStyle(e);
      // eine deckende Farbe darüber macht ein Bild darunter bedeutungslos
      if (!leer(cs.backgroundColor)) {
        bg = mische(cs.backgroundColor, bg);
        if (mische(cs.backgroundColor, [0, 0, 0, 1]).every((v, i) => v === bg[i])) unsicher = false;
      }
      if (cs.backgroundImage !== 'none') unsicher = true;
    }
    return { bg, unsicher };
  };
  /** Produkt der Deckkraft über die Vorfahren. @param {Element} el */
  const deckkraft = (el) => { let o = 1; for (let e = /** @type {Element | null} */ (el); e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  const FORM = 'line, path, circle, ellipse, rect, polygon, polyline';
  /**
   * Hintergrund eines Texts in einer Grafik: die gefüllten Formen unter seiner Mitte, die ihn ganz umfassen, über dem
   * Hintergrund des HTML-Elements um die Grafik.
   * @param {Element} el @param {number} x @param {number} y
   */
  const grund = (el, x, y) => {
    const svg = el.closest('svg');
    // elementsFromPoint sieht nur den sichtbaren Ausschnitt: das Element vorher hineinrollen
    if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) {
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect(); x = r.x + r.width / 2; y = r.y + r.height / 2;
    }
    const html = hintergrund(svg?.parentElement ?? el);
    if (!svg) return html;
    // nur Flächen, die den Text ganz umfassen (z. B. ein Kreis hinter einer Ziffer), keine Linien, die ihn kreuzen
    const t = el.getBoundingClientRect();
    const umfasst = (/** @type {Element} */ e) => { const u = e.getBoundingClientRect(); return u.left <= t.left && u.right >= t.right && u.top <= t.top && u.bottom >= t.bottom; };
    const unter = document.elementsFromPoint(x, y).filter((e) => e !== el && !el.contains(e) && svg.contains(e) && e.matches(FORM) && umfasst(e));
    // von unten nach oben über den HTML-Hintergrund legen (deckende Flächen ersetzen, was darunter liegt)
    let bg = html.bg;
    let unsicher = html.unsicher;
    for (const e of unter.reverse()) {
      const cs = getComputedStyle(e);
      if (e.matches('line, polyline')) continue;
      if (muster(cs.fill)) { unsicher = true; continue; }
      if (leer(cs.fill)) continue;
      bg = mische(cs.fill, bg, Number(cs.fillOpacity) * deckkraft(e));
    }
    return { bg, unsicher };
  };
  /** Kurzer Selektor zur Wiedererkennung. @param {Element} el */
  const wo = (el) => {
    const teile = [];
    for (let e = /** @type {Element | null} */ (el); e && teile.length < 3; e = e.parentElement) {
      if (e.id) { teile.unshift('#' + e.id); break; }
      const k = [...e.classList].slice(0, 2).map((c) => '.' + c).join('');
      teile.unshift(e.tagName.toLowerCase() + k);
    }
    const fig = el.closest('figure[id], figure');
    const nr = fig?.querySelector('figcaption')?.textContent?.match(/Abb\.\s*[\d.]+[a-z]?/)?.[0];
    return (nr ? `${nr}: ` : '') + teile.join(' > ');
  };
  /** @param {Element} el */
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 && r.height <= 1) return false; // auch .sr (1 × 1 px)
    const cs = getComputedStyle(el);
    return cs.visibility === 'visible' && el.getClientRects().length > 0;
  };
  /** Nach WCAG ausgenommen: gesperrtes Bedienelement, auch die Beschriftung eines gesperrten Felds. @param {Element} el */
  const gesperrt = (el) => !!el.closest(':disabled, [aria-disabled="true"]')
    || (() => { const l = el.closest('label'); return !!(l && l.control && /** @type {HTMLInputElement} */ (l.control).disabled); })();
  /** @type {any[]} */
  const texte = [];
  const gesehen = new Set();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement;
    if (!el || gesehen.has(el) || !/\S/.test(n.textContent ?? '')) continue;
    gesehen.add(el);
    if (el.closest('script, style, noscript, option')) continue;
    if (!sichtbar(el)) continue;
    const cs = getComputedStyle(el);
    const svg = el instanceof SVGElement;
    const farbeText = svg ? cs.fill : cs.color;
    if (muster(farbeText)) { texte.push({ fg: [0, 0, 0, 1], bg: [0, 0, 0, 1], unsicher: true, svg, gross: false, gesperrt: false, wo: wo(el), text: '' }); continue; }
    if (leer(farbeText)) continue;
    const r = el.getBoundingClientRect();
    let { bg, unsicher } = svg ? grund(el, r.x + r.width / 2, r.y + r.height / 2) : hintergrund(el);
    // Text mit Hof (Strich unter der Füllung, paint-order: stroke): Grund ist der Hof
    const hof = svg && !leer(cs.stroke) && parseFloat(cs.strokeWidth) >= 1.5 && cs.paintOrder.startsWith('stroke');
    if (hof) bg = mische(cs.stroke, bg, Number(cs.strokeOpacity) * deckkraft(el));
    const groesse = parseFloat(cs.fontSize);
    const gewicht = Number(cs.fontWeight) || 400;
    texte.push({
      fg: mische(farbeText, bg, (svg ? Number(cs.fillOpacity) : 1) * deckkraft(el)), bg, unsicher, svg,
      gross: groesse >= 24 || (groesse >= 18.66 && gewicht >= 700),
      gesperrt: gesperrt(el), wo: wo(el), text: (n.textContent ?? '').trim().slice(0, 40),
    });
  }
  /** @type {any[]} */
  const grafik = [];
  let gleich = 0;
  for (const el of document.querySelectorAll(`svg :is(${FORM})`)) {
    if (!sichtbar(el) || el.closest('defs, marker, pattern, clipPath, mask')) continue;
    const cs = getComputedStyle(el);
    // Grafik gegen den Grund der Tafel bzw. Abbildung (Linien kreuzen einander; ein Vergleich mit dem, was gerade
    // darunter liegt, sagte nichts)
    const { bg } = hintergrund(el.closest('svg')?.parentElement ?? el);
    const o = deckkraft(el);
    for (const [art, wert, deck] of [['Strich', cs.stroke, cs.strokeOpacity], ['Fläche', cs.fill, cs.fillOpacity]]) {
      if (leer(wert)) continue;
      if (art === 'Strich' && parseFloat(cs.strokeWidth) <= 0) continue;
      if (art === 'Fläche' && el.matches('line')) continue; // eine Linie hat keine Fläche
      const fg = mische(wert, bg, Number(deck) * o);
      // in der Farbe des Grunds: Freistellung (Rand um Symbole) oder Abdeckung, keine Information
      if (fg.every((v, i) => Math.abs(v - bg[i]) < 1.5)) { gleich++; continue; }
      grafik.push({ fg, bg, art, wo: wo(el) });
    }
  }
  const leinwand = document.querySelectorAll('canvas').length;
  return { texte, grafik, gleich, leinwand };
}

/**
 * Seiten messen.
 * @param {{ root: string, seiten: string[], chrome?: string }} o
 */
export async function kontraste({ root, seiten, chrome = process.env.KONTRASTE_CHROME }) {
  const require = createRequire(import.meta.url);
  const { chromium } = require('playwright');
  const srv = await server(root);
  const port = /** @type {import('node:net').AddressInfo} */ (srv.address()).port;
  const browser = await chromium.launch({ ...(chrome ? { executablePath: chrome } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  /** @type {{ seite: string, schema: string, text: any[], gesperrt: number, unsicher: any[], grafik: any[], gleich: number, leinwand: number, fehler: string[] }[]} */
  const ergebnisse = [];
  try {
    for (const seite of seiten) {
      for (const schema of /** @type {const} */ (['light', 'dark'])) {
        const ctx = await browser.newContext({ colorScheme: schema, viewport: { width: 1400, height: 1000 }, serviceWorkers: 'block' });
        const page = await ctx.newPage();
        /** @type {string[]} */
        const fehler = [];
        page.on('pageerror', (e) => fehler.push(String(e)));
        const antwort = await page.goto(`http://127.0.0.1:${port}/${seite}`, { waitUntil: 'networkidle' }).catch(() => null);
        if (!antwort || !antwort.ok()) throw new Error(`kontraste: Seite ${seite} nicht gefunden (Arbeitsordner ${root})`);
        await page.evaluate(() => document.fonts.ready);
        // eingeklappte Abschnitte öffnen, damit ihr Inhalt mitgemessen wird
        await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; });
        await page.waitForTimeout(200);
        const m = await page.evaluate(messenImBrowser);
        const text = [];
        let gesperrt = 0;
        const unsicher = [];
        for (const t of m.texte) {
          if (t.gesperrt) { gesperrt++; continue; }
          if (t.unsicher) { unsicher.push(t); continue; }
          const k = kontrast(t.fg, t.bg);
          const soll = t.gross ? SCHWELLE.gross : SCHWELLE.text;
          if (k < soll) text.push({ ...t, k, soll });
        }
        const grafik = m.grafik.map((/** @type {any} */ g) => ({ ...g, k: kontrast(g.fg, g.bg) })).filter((/** @type {any} */ g) => g.k < SCHWELLE.grafik);
        ergebnisse.push({ seite, schema: schema === 'light' ? 'hell' : 'dunkel', text, gesperrt, unsicher, grafik, gleich: m.gleich, leinwand: m.leinwand, fehler });
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }
  return ergebnisse;
}

/**
 * Befunde nach Farbpaar zusammenfassen (je Paar Anzahl, Verhältnis und Beispiele).
 * @param {any[]} liste @param {(x: any) => string} [extra]
 */
function gruppiert(liste, extra = () => '') {
  /** @type {Map<string, { k: number, n: number, bsp: string[] }>} */
  const g = new Map();
  for (const x of liste) {
    const schl = `${hex(x.fg)} auf ${hex(x.bg)}${extra(x)}`;
    const e = g.get(schl) ?? { k: x.k, n: 0, bsp: /** @type {string[]} */ ([]) };
    e.n++; if (e.bsp.length < 3) e.bsp.push(`${x.wo}${x.text ? ` „${x.text}“` : ''}`);
    g.set(schl, e);
  }
  return [...g].sort((a, b) => a[1].k - b[1].k).map(([s, e]) => `  ${e.k.toFixed(2)} : 1  ${s}  (${e.n}×)  ${e.bsp.join(' | ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  // Arbeitsordner: absoluter oder mit „.“ beginnender Pfad; Seiten sind relativ zu ihm
  const hier = dirname(fileURLToPath(import.meta.url));
  // in crystallography-common: tools/ → Arbeitsordner zwei Ebenen höher; in einer App: tools/common/ → drei Ebenen
  const standard = join(hier, ...(hier.endsWith(join('tools', 'common')) ? ['..', '..', '..'] : ['..', '..']));
  const root = resolve(args[0] && (isAbsolute(args[0]) || args[0].startsWith('.')) ? args.shift() ?? '' : standard);
  const seiten = args.length ? args : readdirSync(root).filter((d) => existsSync(join(root, d, 'lib', 'common')))
    .flatMap((d) => [`${d}/`, `${d}/skript.html`, `${d}/quiz.html`].filter((s) => existsSync(join(root, s.endsWith('/') ? s + 'index.html' : s))));
  if (!seiten.length) {
    console.error(`kontraste: keine Seiten gefunden in ${root} (erwartet: Ordner mit lib/common/ und index.html)`);
    process.exit(2);
  }
  const erg = await kontraste({ root, seiten });
  let fehlt = 0;
  for (const e of erg) {
    console.log(`\n== ${e.seite} (${e.schema})`);
    if (e.fehler.length) console.log('  Fehler auf der Seite: ' + e.fehler.join('; '));
    if (e.text.length) { fehlt += e.text.length; console.log('Text unter der Schwelle:'); console.log(gruppiert(e.text, (x) => ` (Soll ${x.soll})`).join('\n')); }
    if (e.unsicher.length) console.log(`Text über Bild oder Verlauf, nicht gemessen: ${e.unsicher.length}`);
    if (e.grafik.length) { console.log('Grafik unter 3 : 1 (Durchsicht: nötig oder schmückend?):'); console.log(gruppiert(e.grafik, (x) => `, ${x.art}`).join('\n')); }
    console.log(`  gesperrte Elemente (ausgenommen): ${e.gesperrt}; Grafik in der Farbe des Grunds (Freistellung): ${e.gleich}; <canvas> nicht gemessen: ${e.leinwand}`);
  }
  process.exitCode = fehlt ? 1 : 0;
}
