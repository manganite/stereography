// Bilder der Hilfeseite erzeugen (Leitfaden Abschn. 5.3, #24): je Schritt der Erste Schritte mit `zeige` ein
// Ausschnitt der App im hellen Modus, das Bedienelement markiert.
//
//   node tools/common/hilfe-bilder.mjs            (im Ordner der App)
//
// Liest die Daten der Hilfeseite aus js/hilfe-daten.js der App (Export HILFE, Typ HilfeDaten aus
// lib/common/js/hilfe-seite.js), öffnet die App je Bild mit seiner Adresse (`hilfeBilder`: `bild` des Schritts,
// sonst die letzte davor), klappt geschlossene Abschnitte um das Element auf, umrahmt es und schneidet den
// umgebenden Baustein aus (Karte, Tafel oder Kopfzeile, mit Rand). Ausgabe: <bilder>/<Ablauf>-<Nr>.png (Standard hilfe/); Bilder, die nicht mehr
// gebraucht werden oder nicht entstehen, löscht das Werkzeug. Breite 1280 px, deviceScaleFactor 2, Service Worker gesperrt.
//
// Braucht Playwright mit Chromium (wie tools/skript-pdf.mjs); mit KONTRASTE_CHROME=<Pfad> ein anderer Chromium.

import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { server } from './server.mjs';

/** @import { HilfeDaten } from '../js/hilfe-seite.js' */

// hilfe-seite.js liegt in common unter js/, in einer App unter lib/common/js/ (diese Datei dort in tools/common/)
const hier = dirname(fileURLToPath(import.meta.url));
const kern = [join(hier, '../js/hilfe-seite.js'), join(hier, '../../lib/common/js/hilfe-seite.js')].find((p) => existsSync(p));
if (!kern) throw new Error('hilfe-seite.js nicht gefunden (weder ../js/ noch ../../lib/common/js/)');
/** @type {typeof import('../js/hilfe-seite.js')} */
const { hilfeBilder } = await import(pathToFileURL(kern).href);

/** Bausteine, deren Ausschnitt ein Bild zeigt (der nächste um das Element). */
export const BAUSTEIN = '.card, .panel, header.top';
/** Rand um den Ausschnitt in CSS-Pixeln. */
const RAND = 12;
/** Farbe der Markierung (Akzent hell, wie --accent2 in base.css). */
const MARKE = '#bc3f0c';

/**
 * Bilder erzeugen. root: Ordner der App; daten: Daten der Hilfeseite; chrome: Pfad zu einem anderen Chromium.
 * Gibt die geschriebenen Dateien und die Fehler zurück (z. B. fehlendes Element).
 * @param {{ root: string, daten: HilfeDaten, chrome?: string }} o
 * @returns {Promise<{ dateien: string[], fehler: string[] }>}
 */
export async function hilfeBilderErzeugen({ root, daten, chrome = process.env.KONTRASTE_CHROME }) {
  const require = createRequire(import.meta.url);
  /** @type {typeof import('playwright')} */
  const { chromium } = require('playwright');
  const app = daten.app ?? 'index.html';
  const ordner = join(root, daten.bilder ?? 'hilfe/');
  mkdirSync(ordner, { recursive: true });
  const srv = await server(root);
  const basis = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (srv.address()).port}/`;
  const browser = await chromium.launch({ ...(chrome ? { executablePath: chrome } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  /** @type {string[]} */
  const dateien = [], fehler = [];
  try {
    for (const b of hilfeBilder(daten)) {
      // je Bild ein neuer Kontext: leerer Speicher, damit kein Zustand aus dem vorigen Bild übrig bleibt
      const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      /** @type {string[]} */
      const konsole = [];
      page.on('pageerror', (e) => konsole.push(e.message));
      try {
        await page.goto(basis + app + b.adresse, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        const rahmen = await page.evaluate(({ sel, baustein, rand, marke }) => {
          const el = document.querySelector(sel);
          if (!(el instanceof HTMLElement || el instanceof SVGElement)) return null;
          // Abschnitte um das Element aufklappen; ist es die Überschrift eines Abschnitts, bleibt dieser zu (der
          // Schritt zeigt, wo man ihn öffnet)
          const start = el.tagName === 'SUMMARY' ? el.parentElement?.parentElement : el.parentElement;
          for (let d = start?.closest('details'); d; d = d.parentElement?.closest('details')) {
            if (d instanceof HTMLDetailsElement) d.open = true;
          }
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect();
          const box = (el.closest(baustein) ?? el).getBoundingClientRect();
          const m = document.createElement('div');
          m.setAttribute('data-hilfe-marke', '');
          Object.assign(m.style, {
            position: 'fixed', left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px`,
            border: `3px solid ${marke}`, borderRadius: '8px', pointerEvents: 'none', zIndex: '2147483647', boxSizing: 'border-box',
          });
          document.body.append(m);
          const links = Math.max(0, Math.min(box.left, r.left - 8) - rand), oben = Math.max(0, Math.min(box.top, r.top - 8) - rand);
          const rechts = Math.min(innerWidth, Math.max(box.right, r.right + 8) + rand), unten = Math.min(innerHeight, Math.max(box.bottom, r.bottom + 8) + rand);
          return { x: links, y: oben, width: rechts - links, height: unten - oben };
        }, { sel: b.zeige, baustein: BAUSTEIN, rand: RAND, marke: MARKE });
        if (!rahmen) throw new Error(`kein Element ${b.zeige} unter ${b.adresse}`);
        if (rahmen.width < 1 || rahmen.height < 1) throw new Error(`${b.zeige} ist nicht sichtbar`);
        await page.screenshot({ path: join(ordner, b.datei), clip: rahmen, animations: 'disabled' });
        dateien.push(b.datei);
        if (konsole.length) fehler.push(`${b.ablauf}, Schritt ${b.nr}: Fehler der Seite: ${konsole.join('; ')}`);
      } catch (e) {
        // ein altes Bild nicht stehen lassen: pruefeHilfe() meldet das fehlende, ein veraltetes bliebe unbemerkt
        rmSync(join(ordner, b.datei), { force: true });
        fehler.push(`${b.ablauf}, Schritt ${b.nr}: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }
  // nicht mehr gebrauchte Bilder entfernen, damit pruefeHilfe() keine überzähligen meldet
  const gebraucht = new Set(hilfeBilder(daten).map((b) => b.datei));
  for (const f of readdirSync(ordner)) if (f.endsWith('.png') && !gebraucht.has(f)) rmSync(join(ordner, f));
  return { dateien, fehler };
}

// Direkt gestartet: im Ordner der App
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = resolve('.');
  /** @type {{ HILFE?: HilfeDaten }} */
  const modul = await import(pathToFileURL(join(root, 'js/hilfe-daten.js')).href);
  if (!modul.HILFE) { console.error('js/hilfe-daten.js exportiert kein HILFE'); process.exit(2); }
  const { dateien, fehler } = await hilfeBilderErzeugen({ root, daten: modul.HILFE });
  console.log(`${dateien.length} Bilder in ${modul.HILFE.bilder ?? 'hilfe/'}`);
  for (const f of fehler) console.error(f);
  process.exit(fehler.length ? 1 : 0);
}
