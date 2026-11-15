// Bilder für das README erzeugen: das Bildschirmfoto der App (docs/screenshot.png) und kleine Bilder zu den Funktionen
// (docs/readme/). Jedes Bild ist eine Ansicht der App bzw. von Skript, Quiz oder Hilfeseite über ihre Adresse, wahlweise
// ein Ausschnitt (CSS-Selektor) und Bedienhandlungen davor (Klicks, Ziehen), die nicht in der Adresse stehen.
//
//   node tools/readme-bilder.mjs            (im Ordner der App)
//
// Braucht Playwright mit Chromium (wie tools/skript-pdf.mjs); mit CHROMIUM_PFAD=<Pfad> ein anderer Chromium.

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { server } from './common/server.mjs';

/**
 * datei: Pfad unter dem Ordner der App; seite: HTML-Seite (Standard index.html); adresse: Hash bzw. Query und Hash;
 * ausschnitt: Selektor, sonst das ganze Fenster; hoehe: höchstens so viele CSS-Pixel des Ausschnitts von oben;
 * vorher: Klick auf einen Selektor oder Ziehen über Punkte in Bruchteilen eines Elements.
 * @typedef {{ klick: string } | { ziehen: string, punkte: [number, number][] }} Handlung
 * @typedef {{ datei: string, seite?: string, adresse: string, ausschnitt?: string, hoehe?: number, breite?: number,
 *   vorher?: Handlung[] }} Bild
 */

/** @type {Bild[]} */
export const BILDER = [
  { datei: 'docs/screenshot.png', adresse: '#m=form&sys=kubisch&bsp=galenit' },
  // Punktgruppen
  { datei: 'docs/readme/pg-stereogramm.png', adresse: '#m=pg&g=4/mmm&hand=1', ausschnitt: '#stereo' },
  { datei: 'docs/readme/pg-3d.png', adresse: '#m=pg&g=4mm', ausschnitt: '.p-b' },
  { datei: 'docs/readme/pg-trigonal.png', adresse: '#m=pg&g=-3m1&hand=1', ausschnitt: '#stereo' },
  // Kristallformen
  { datei: 'docs/readme/form-quarz.png', adresse: '#m=form&sys=trigonal&bsp=quarz&idx=0', ausschnitt: '.p-b' },
  { datei: 'docs/readme/form-zonen.png', adresse: '#m=form&sys=kubisch&bsp=galenit&w=zone&zonen=0,0,1;1,1,1', ausschnitt: '#stereo' },
  { datei: 'docs/readme/form-brechen.png', adresse: '#m=form&sys=kubisch&str=111,1.6&idx=0', ausschnitt: '.p-b' },
  // Skript, Quiz, Hilfe
  { datei: 'docs/readme/skript.png', seite: 'skript.html', adresse: '#zonen', breite: 1280, hoehe: 800 },
  { datei: 'docs/readme/quiz.png', seite: 'quiz.html', adresse: '', breite: 1280, hoehe: 800 },
  { datei: 'docs/readme/hilfe.png', seite: 'hilfe.html', adresse: '#pg-stereogramm', breite: 1280, hoehe: 800 },
];

const BREITE = 1440, HOEHE = 860;

/** @param {string} root @param {Bild[]} bilder @param {string | undefined} chrome */
export async function readmeBilder(root, bilder, chrome = process.env.CHROMIUM_PFAD) {
  const require = createRequire(import.meta.url);
  /** @type {typeof import('playwright')} */
  const { chromium } = require('playwright');
  const srv = await server(root);
  const basis = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (srv.address()).port}/`;
  const browser = await chromium.launch({ ...(chrome ? { executablePath: chrome } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const b of bilder) {
      const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: b.breite ?? BREITE, height: HOEHE }, deviceScaleFactor: 1.5, serviceWorkers: 'block', reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      /** @type {string[]} */
      const fehler = [];
      page.on('pageerror', (e) => fehler.push(e.message));
      await page.goto(basis + (b.seite ?? 'index.html') + b.adresse, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // Erste Schritte nicht im Bild
      await page.evaluate(() => document.querySelectorAll('#intro').forEach((e) => e.remove()));
      await page.waitForTimeout(400);
      for (const h of b.vorher ?? []) {
        if ('klick' in h) { await page.click(h.klick, { timeout: 5000 }); continue; }
        const box = await page.locator(h.ziehen).boundingBox();
        if (!box) throw new Error(`${b.datei}: ${h.ziehen} nicht sichtbar`);
        const [x0, y0] = h.punkte[0];
        await page.mouse.move(box.x + x0 * box.width, box.y + y0 * box.height);
        await page.mouse.down();
        for (const [x, y] of h.punkte.slice(1)) await page.mouse.move(box.x + x * box.width, box.y + y * box.height, { steps: 8 });
        await page.mouse.up();
      }
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
      const pfad = join(root, b.datei);
      mkdirSync(dirname(pfad), { recursive: true });
      if (b.ausschnitt) {
        const el = page.locator(b.ausschnitt).first();
        await el.scrollIntoViewIfNeeded();
        const r = await el.boundingBox();
        if (!r) throw new Error(`${b.datei}: ${b.ausschnitt} nicht sichtbar`);
        const clip = { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, b.hoehe ?? r.height) };
        await page.screenshot({ path: pfad, clip, animations: 'disabled' });
      } else {
        await page.screenshot({ path: pfad, clip: { x: 0, y: 0, width: b.breite ?? BREITE, height: b.hoehe ?? HOEHE }, animations: 'disabled' });
      }
      if (fehler.length) throw new Error(`${b.datei}: ${fehler.join('; ')}`);
      await ctx.close();
      console.log(b.datei);
    }
  } finally {
    await browser.close();
    srv.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await readmeBilder(join(dirname(fileURLToPath(import.meta.url)), '..'), BILDER);
}
