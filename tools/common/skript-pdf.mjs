// PDF-Fassung eines Skripts (A4) mit dem Browser Chromium über Playwright, für alle Apps der Familie.
// Die App ruft skriptPDF() aus ihrem eigenen tools/skript-pdf.mjs auf (Titel, Adresse, Vorbereitung).
//
// Die Seite wird über einen kleinen eingebauten Webserver geladen, die Abbildungen zeichnet derselbe Code wie online.
// Für das PDF:
// - Abbildungen mit WebGL (Selektor statisch) werden einzeln gezeichnet und als Bild eingesetzt;
// - interaktive Abbildungen (IDs in interaktiv) zeigen einen festen Zustand mit Hinweis auf die Online-Version;
// - relative Links (App, Quiz) zeigen auf die veröffentlichte Seite (base);
// - Inhaltsverzeichnis vorn, jedes Kapitel auf neuer Seite, Lesezeichen, Kopf- und Fusszeile.
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium).

import { createRequire } from 'node:module';
import { server } from './server.mjs';

const require = createRequire(import.meta.url);

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

/**
 * root: Ordner der App; out: Ausgabedatei; base: veröffentlichte Adresse (mit / am Ende); titel: Name der App;
 * version: Version der App; seite: Seite des Skripts; vorbereiten(page): App-spezifische Schritte vor dem Festhalten
 * (z. B. interaktive Abbildungen in einen Zustand bringen); statisch: Abbildungen, die als Bild eingesetzt werden;
 * reste: Elemente ausserhalb dieser Bilder, die danach entfernt werden (z. B. Beschriftungen der 3D-Ansichten);
 * interaktiv: IDs interaktiver Abbildungen (Hinweis auf die Online-Version); css: zusätzliche Druckstile.
 */
export async function skriptPDF({
  root, out, base, titel, version, seite = 'skript.html', vorbereiten = async () => {},
  statisch = 'figure[data-kind="3d"]', reste = '.lbl3d', interaktiv = [], css = '',
}) {
  const { chromium } = require('playwright');
  const srv = await server(root);
  const url = `http://127.0.0.1:${srv.address().port}/${seite}`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const fehler = [];
  let anzahl = 0;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => fehler.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await vorbereiten(page);

    // Abbildungen mit WebGL einzeln zeichnen lassen (die Seite hält nur die sichtbaren live) und festhalten
    const bilder = [];
    for (const fig of await page.$$(statisch)) {
      await fig.scrollIntoViewIfNeeded();
      const art = await fig.$('.fig-art');
      await page.waitForFunction((el) => el.querySelector('canvas'), art, { timeout: 20000 });
      await page.waitForTimeout(700);
      bilder.push((await art.screenshot({ type: 'png' })).toString('base64'));
    }
    anzahl = bilder.length;

    await page.evaluate(({ bilder, BASE, SEITE, PRINT_CSS, statisch, reste, interaktiv }) => {
      [...document.querySelectorAll(statisch)].forEach((fig, i) => {
        const neu = document.createElement('div');
        neu.className = 'fig-art static3d';
        const img = document.createElement('img');
        img.alt = fig.dataset.alt || '';
        img.src = `data:image/png;base64,${bilder[i]}`;
        neu.appendChild(img);
        fig.querySelector('.fig-art').replaceWith(neu);
        fig.removeAttribute('data-kind');
      });
      if (reste) document.querySelectorAll(reste).forEach((e) => { if (!e.closest('.static3d')) e.remove(); });
      for (const a of document.querySelectorAll('a[href]')) {
        const h = a.getAttribute('href');
        if (!h || h.startsWith('#') || /^[a-z]+:/i.test(h)) continue;
        a.setAttribute('href', BASE + h);
        a.removeAttribute('target');
      }
      for (const id of interaktiv) {
        const cap = document.querySelector(`#${id} figcaption`);
        if (cap) cap.insertAdjacentHTML('beforeend', ` <i class="pdfnote">Im PDF ein fester Zustand; interaktiv in der <a href="${BASE}${SEITE}#${id}">Online-Version</a>.</i>`);
      }
      const el = document.createElement('style');
      el.textContent = PRINT_CSS;
      document.head.appendChild(el);
      document.documentElement.dataset.theme = 'light';
    }, { bilder, BASE: base, SEITE: seite, PRINT_CSS: PRINT_CSS + css, statisch, reste, interaktiv });

    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.waitForTimeout(800);
    await page.pdf({
      path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true,
      displayHeaderFooter: true,
      headerTemplate: kopf(`${titel} · Skript`, `Version ${version}`),
      footerTemplate: kopf(base.replace(/^https?:\/\//, '').replace(/\/$/, ''), 'Seite <span class="pageNumber"></span> von <span class="totalPages"></span>'),
    });
  } finally {
    await browser.close();
    srv.close();
  }
  return { anzahl, fehler };
}
