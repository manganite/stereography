// PDF-Fassung des Skripts (A4) aus skript.html, mit dem Browser Chromium über Playwright.
//
//   node tools/skript-pdf.mjs [Ausgabedatei] [--base https://…/]
//
// Ausgabe ohne Angabe: skript.pdf im Projektordner. Die Seite wird über einen kleinen eingebauten
// Webserver geladen, die Abbildungen zeichnet derselbe Code wie online. Für das PDF:
// - 3D-Ansichten (WebGL) werden einzeln gezeichnet und als Bild eingesetzt;
// - interaktive Abbildungen (2.1, 8.5) zeigen einen festen Zustand mit Hinweis auf die Online-Version;
// - relative Links (App, Quiz) zeigen auf die veröffentlichte Seite (--base, Standard GitHub Pages);
// - Inhaltsverzeichnis vorn, jedes Kapitel auf neuer Seite, Lesezeichen, Kopf- und Fusszeile.
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const bi = args.indexOf('--base');
const BASE = bi >= 0 ? args.splice(bi, 2)[1] : 'https://manganite.github.io/stereography/';
const OUT = args[0] || join(ROOT, 'skript.pdf');
const VERSION = readFileSync(join(ROOT, 'js/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

/** Statischer Server für den Projektordner, auf einem freien Port. */
function server() {
  const srv = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const file = join(ROOT, path || 'index.html');
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }).end(data);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const PRINT_CSS = `
  @page { size: A4; margin: 16mm 18mm 18mm 18mm; }
  html, body { background: #fff !important; }
  body { font-size: 10.5pt; line-height: 1.5; }
  article p, article li, article dd, .lead, figcaption, .fig-note { max-width: none !important; }
  header.top { position: static !important; box-shadow: none !important; border: 0 !important; padding: 0 0 6mm !important; }
  header.top .headtools { display: none !important; }
  header.top h1 { font-size: 24pt !important; }
  .page { display: block !important; max-width: none !important; padding: 0 !important; }
  .toc { position: static !important; max-height: none !important; overflow: visible !important; margin-bottom: 8mm; }
  .toc .card { border: 0 !important; background: none !important; padding: 0 !important; }
  .toc a { color: inherit !important; text-decoration: none !important; }
  main, article { max-width: none !important; margin: 0 !important; padding: 0 !important; }
  article > section { break-before: page; margin-top: 0 !important; }
  .teil { break-before: page; break-inside: avoid; }
  .teil + section { break-before: avoid; }
  h2, h3, h4, h5 { break-after: avoid; }
  figure, .fig-row, table, .tabwrap, .schema, .symlegende li, pre, .fig-note,
  .box.merke, .box.app, .box.ziele, .box.zusammen { break-inside: avoid; }
  p { orphans: 3; widows: 3; }
  .tabwrap { overflow: visible !important; }
  .static3d img { display: block; width: 100%; height: auto; }
  .pdfnote { color: #586472; }
  a { color: #0b63b6; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
`;

const kopf = (links, rechts) => `<div style="font: 7.5pt sans-serif; color:#7a8794; width:100%; padding:0 18mm; display:flex; justify-content:space-between;"><span>${links}</span><span>${rechts}</span></div>`;

async function main() {
  const srv = await server();
  const url = `http://127.0.0.1:${srv.address().port}/skript.html`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const fehler = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => fehler.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Abb. 8.5: ein Zustand, in dem beide Formen noch zu sehen sind (Oktaeder : Würfel ≈ 1,44)
    await page.$eval('#w-zeit', (el) => { el.value = 20; el.dispatchEvent(new Event('input')); });

    // 3D-Ansichten einzeln zeichnen lassen (die Seite hält nur die sichtbaren live) und festhalten
    const bilder = [];
    for (const fig of await page.$$('figure[data-kind="3d"]')) {
      await fig.scrollIntoViewIfNeeded();
      const art = await fig.$('.fig-art');
      await page.waitForFunction((el) => el.querySelector('canvas'), art, { timeout: 20000 });
      await page.waitForTimeout(700);
      bilder.push((await art.screenshot({ type: 'png' })).toString('base64'));
    }

    await page.evaluate(({ bilder, BASE, PRINT_CSS }) => {
      [...document.querySelectorAll('figure[data-kind="3d"]')].forEach((fig, i) => {
        const neu = document.createElement('div');
        neu.className = 'fig-art static3d';
        const img = document.createElement('img');
        img.alt = fig.dataset.alt || '';
        img.src = `data:image/png;base64,${bilder[i]}`;
        neu.appendChild(img);
        fig.querySelector('.fig-art').replaceWith(neu);
        fig.removeAttribute('data-kind');
      });
      // Beschriftungen der 3D-Ansichten, die ausserhalb der Bilder übrig bleiben
      document.querySelectorAll('.lbl3d').forEach((e) => { if (!e.closest('.static3d')) e.remove(); });
      for (const a of document.querySelectorAll('a[href]')) {
        const h = a.getAttribute('href');
        if (!h || h.startsWith('#') || /^[a-z]+:/i.test(h)) continue;
        a.setAttribute('href', BASE + h);
        a.removeAttribute('target');
      }
      for (const id of ['fig-proj', 'fig-wachstum']) {
        const cap = document.querySelector(`#${id} figcaption`);
        if (cap) cap.insertAdjacentHTML('beforeend', ` <i class="pdfnote">Im PDF ein fester Zustand; interaktiv in der <a href="${BASE}skript.html#${id}">Online-Version</a>.</i>`);
      }
      const css = document.createElement('style');
      css.textContent = PRINT_CSS;
      document.head.appendChild(css);
      document.documentElement.dataset.theme = 'light';
    }, { bilder, BASE, PRINT_CSS });

    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.waitForTimeout(800);
    await page.pdf({
      path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true,
      displayHeaderFooter: true,
      headerTemplate: kopf('Stereographische Projektion · Skript', `Version ${VERSION}`),
      footerTemplate: kopf(BASE.replace(/^https?:\/\//, '').replace(/\/$/, ''), 'Seite <span class="pageNumber"></span> von <span class="totalPages"></span>'),
    });
    console.log(`${OUT}: Skript ${VERSION}, ${bilder.length} 3D-Abbildungen als Bild`);
  } finally {
    await browser.close();
    srv.close();
  }
  if (fehler.length) {
    console.error('Fehler auf der Seite:\n' + fehler.join('\n'));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
