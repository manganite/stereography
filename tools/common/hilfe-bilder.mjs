// Bilder der Hilfeseite erzeugen (Leitfaden Abschn. 5.3, #24, #114): Ausschnitte der App im hellen Modus. Je Schritt
// einer Anleitung mit `zeige` das Bedienelement umrahmt, je Bereich zum Nachschlagen die Elemente mit nummerierten
// Marken (Nummer in der Reihenfolge der Einträge).
//
//   node tools/common/hilfe-bilder.mjs            (im Ordner der App)
//
// Liest die Daten der Hilfeseite aus js/hilfe-daten.js der App (Export HILFE, Typ HilfeDaten aus
// lib/common/js/hilfe-seite.js), öffnet die App je Bild mit seiner Adresse (`hilfeBilder`), klappt geschlossene
// Abschnitte um die Elemente auf (die Überschrift eines Abschnitts lässt ihn zu), führt `vorher` des Schritts aus
// (Klicks, Ziehen), markiert sie und schneidet den
// Ausschnitt aus: `ausschnitt` des Bereichs, sonst der Baustein um die Elemente (Karte, Tafel oder Kopfzeile), mit Rand.
// Ist der Ausschnitt höher als das Fenster oder hat er einen eigenen Scrollbereich (Seitenleiste), wird das Fenster so
// hoch, dass er ganz hineinpasst. Ausgabe unter <bilder> (Standard hilfe/); Bilder, die nicht mehr gebraucht werden oder
// nicht entstehen, löscht das Werkzeug. Breite 1280 px, deviceScaleFactor 2, Service Worker gesperrt.
// Fehlt links neben einem grossen nummerierten Baustein der Platz für seine Nummer (Übersichtsbild: Bausteine am Rand
// und dicht nebeneinander), bekommt die Seite nur für dieses Bild links Rand und grössere Abstände zwischen den Tafeln
// (RAUM), damit die Nummern links daneben stehen statt auf der Rahmenlinie (Thomas, 15.11.2026, #114).
//
// Braucht Playwright mit Chromium (wie tools/skript-pdf.mjs); mit CHROMIUM_PFAD=<Pfad> ein anderer Chromium.

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

/** Bausteine, deren Ausschnitt ein Bild zeigt (der nächste um das Element), wenn der Bereich keinen `ausschnitt` nennt. */
export const BAUSTEIN = '.card, .panel, header.top';
/** Rand um den Ausschnitt in CSS-Pixeln. */
const RAND = 12;
/** Farbe der Markierung (Akzent hell, wie --accent2 in base.css). */
const MARKE = '#bc3f0c';
/** Platz für eine Nummer links neben einem grossen Baustein (Durchmesser 20 px, Abstand 6 px, Rand 2 px). */
const RAUM = 30;
/** Fenster: Breite und Höhe, die das Fenster höchstens bekommt (für hohe Ausschnitte). */
const BREITE = 1280, HOEHE = 900, HOEHE_MAX = 4000;

/**
 * Bilder erzeugen. root: Ordner der App; daten: Daten der Hilfeseite; chrome: Pfad zu einem anderen Chromium.
 * Gibt die geschriebenen Dateien und die Fehler zurück (z. B. fehlendes Element).
 * @param {{ root: string, daten: HilfeDaten, chrome?: string }} o
 * @returns {Promise<{ dateien: string[], fehler: string[] }>}
 */
export async function hilfeBilderErzeugen({ root, daten, chrome = process.env.CHROMIUM_PFAD }) {
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
      const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: BREITE, height: HOEHE }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      /** @type {string[]} */
      const konsole = [];
      page.on('pageerror', (e) => konsole.push(e.message));
      try {
        await page.goto(basis + app + b.adresse, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        // 1. Abschnitte aufklappen, Ausschnitt bestimmen und die nötige Höhe des Fensters messen
        const vorbereitet = await page.evaluate(({ zeige, ausschnitt, baustein, nummern, raum }) => {
          /** @type {Element[]} */
          const els = [];
          for (const sel of zeige) {
            const el = document.querySelector(sel);
            if (!(el instanceof HTMLElement || el instanceof SVGElement)) return { fehlt: sel };
            // Abschnitte um das Element aufklappen; ist es die Überschrift eines Abschnitts, bleibt dieser zu (der
            // Schritt zeigt, wo man ihn öffnet)
            const start = el.tagName === 'SUMMARY' ? el.parentElement?.parentElement : el.parentElement;
            for (let d = start?.closest('details'); d; d = d.parentElement?.closest('details')) {
              if (d instanceof HTMLDetailsElement) d.open = true;
            }
            els.push(el);
          }
          // Platz links neben grossen Bausteinen für die Nummer: am Rand oder dicht an einem anderen Element fehlt er
          if (nummern) {
            const rs = els.map((el) => el.getBoundingClientRect());
            const eng = rs.some((r, i) => r.width > 140 && r.height > 80 && (r.left < raum
              || rs.some((o, j) => j !== i && o.right > r.left - raum && o.left < r.left && o.top < r.bottom && o.bottom > r.top)));
            if (eng) {
              const st = document.createElement('style');
              st.textContent = `html { padding-left: ${raum}px; } .layout { gap: ${raum + 6}px; }`;
              document.head.append(st);
            }
          }
          const rahmen = ausschnitt ? document.querySelector(ausschnitt) : null;
          if (ausschnitt && !rahmen) return { fehlt: ausschnitt };
          const boxen = rahmen ? [rahmen] : [...new Set(els.map((el) => el.closest(baustein) ?? el))];
          // Höhe, damit alle Bausteine samt eigenem Scrollbereich ganz ins Fenster passen
          let hoehe = 0;
          for (const box of boxen) {
            const r = box.getBoundingClientRect();
            const oben = r.top + scrollY;
            const voll = box instanceof HTMLElement && box.scrollHeight > box.clientHeight + 1 ? box.scrollHeight + (r.height - box.clientHeight) : r.height;
            hoehe = Math.max(hoehe, oben + voll);
          }
          return { hoehe: Math.ceil(hoehe + 40) };
        }, { zeige: b.zeige, ausschnitt: b.ausschnitt ?? null, baustein: BAUSTEIN, nummern: b.nummern, raum: RAUM });
        if ('fehlt' in vorbereitet) throw new Error(`kein Element ${vorbereitet.fehlt} unter ${b.adresse}`);
        if (vorbereitet.hoehe > HOEHE_MAX) fehler.push(`${b.quelle}: Ausschnitt ${vorbereitet.hoehe} px hoch, abgeschnitten bei ${HOEHE_MAX} px`);
        if (vorbereitet.hoehe > HOEHE) {
          await page.setViewportSize({ width: BREITE, height: Math.min(HOEHE_MAX, vorbereitet.hoehe) });
          await page.waitForTimeout(100);
        }
        // Bedienhandlungen für Zustand, der nicht in der Adresse steht (Werkzeug, Striche): nach dem Aufklappen und der
        // Grösse des Fensters, damit kein Neuzeichnen danach den Zustand ändert
        for (const h of b.vorher ?? []) {
          if ('klick' in h) { await page.click(h.klick, { timeout: 5000 }); continue; }
          if (h.punkte.length < 2) throw new Error(`Ziehen über ${h.ziehen} ohne mindestens zwei Punkte`);
          const ort = page.locator(h.ziehen);
          await ort.scrollIntoViewIfNeeded({ timeout: 5000 });
          const box = await ort.boundingBox();
          if (!box) throw new Error(`kein sichtbares Element ${h.ziehen} zum Ziehen unter ${b.adresse}`);
          const fenster = page.viewportSize() ?? { width: BREITE, height: HOEHE };
          const pt = (/** @type {[number, number]} */ [fx, fy]) => [box.x + fx * box.width, box.y + fy * box.height];
          const punkte = h.punkte.map(pt);
          if (punkte.some(([x, y]) => x < 0 || y < 0 || x > fenster.width || y > fenster.height)) throw new Error(`Ziehen über ${h.ziehen}: Punkte ausserhalb des Fensters`);
          await page.mouse.move(punkte[0][0], punkte[0][1]);
          await page.mouse.down();
          for (const [x, y] of punkte.slice(1)) await page.mouse.move(x, y, { steps: 8 });
          await page.mouse.up();
        }
        if (b.vorher) {
          // Zeiger weg, damit kein Tooltip ins Bild gerät
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        }
        // 2. an den Ausschnitt scrollen, Marken zeichnen, Ausschnitt in Koordinaten des Fensters zurückgeben
        const rahmen = await page.evaluate(({ zeige, nummern, ausschnitt, baustein, rand, marke }) => {
          const els = zeige.map((sel) => /** @type {Element} */ (document.querySelector(sel)));
          const rahmenEl = ausschnitt ? document.querySelector(ausschnitt) : null;
          const boxen = rahmenEl ? [rahmenEl] : [...new Set(els.map((el) => el.closest(baustein) ?? el))];
          const obenDoc = Math.min(...[...boxen, ...els].map((e) => e.getBoundingClientRect().top + scrollY));
          scrollTo(0, Math.max(0, obenDoc - rand - 20));
          /** @type {{ left: number, top: number, right: number, bottom: number }[]} */
          const teile = boxen.map((e) => e.getBoundingClientRect());
          const rects = els.map((el) => el.getBoundingClientRect());
          /** @type {{ left: number, top: number, right: number, bottom: number }[]} */
          /** @type {number[]} */
          const notfall = [];
          const belegt = rects.map((r) => ({ left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }));
          /** Marke, die das Element umschliesst (verschachtelte Einträge): ihre Fläche ist kein Hindernis. @param {{ left: number, top: number, right: number, bottom: number }} o @param {DOMRect} r */
          const umfasst = (o, r) => o.left <= r.left && o.top <= r.top && o.right >= r.right && o.bottom >= r.bottom;
          /** @param {{ left: number, top: number, right: number, bottom: number }} a @param {{ left: number, top: number, right: number, bottom: number }} b */
          const schneidet = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          els.forEach((el, i) => {
            const r = rects[i];
            const m = document.createElement('div');
            m.setAttribute('data-hilfe-marke', '');
            Object.assign(m.style, {
              position: 'fixed', left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px`,
              border: `${nummern ? 2 : 3}px solid ${marke}`, borderRadius: '8px', pointerEvents: 'none', zIndex: '2147483646', boxSizing: 'border-box',
            });
            document.body.append(m);
            teile.push({ left: r.left - 8, top: r.top - 8, right: r.right + 8, bottom: r.bottom + 8 });
          });
          if (nummern) els.forEach((_, i) => {
            const r = rects[i];
            // Nummer: Lagen der Reihe nach probieren, die erste, die keine andere Marke und keine Nummer überdeckt.
            // Grosse Elemente (z. B. Tafel): links davor nahe der oberen Ecke, sonst auf der oberen Rahmenlinie nahe der
            // linken, dann der rechten Ecke (dort kann die Nummer eine Überschrift darüber streifen); breite (z. B. Überschrift eines Abschnitts, nicht in einer anderen Marke): links davor; sonst darüber, darunter, links, rechts;
            // zuletzt innen in der Ecke oben links.
            const d = 20, h = d / 2;
            const gross = r.width > 140 && r.height > 80, breit = r.width > 140;
            /** @param {number} x @param {number} y @returns {[number, number]} */
            const p2 = (x, y) => [x, y];
            const lagen = gross ? [p2(r.left - 6 - h, r.top + 10 + h), p2(r.left + 10 + h, r.top - 4), p2(r.right - 10 - h, r.top - 4)]
              : [...(breit && !belegt.some((o, j) => j !== i && umfasst(o, r)) ? [p2(r.left - 6 - h, r.top + r.height / 2)] : []), p2(r.left + r.width / 2, r.top - 2 - h), p2(r.left + r.width / 2, r.bottom + 2 + h),
                p2(r.left - 6 - h, r.top + r.height / 2), p2(r.right + 6 + h, r.top + r.height / 2)];
            /** @param {[number, number]} p */
            const box = ([x, y]) => ({ left: x - h, top: y - h, right: x + h, bottom: y + h });
            const frei = lagen.find((p) => { const b = box(p); return b.left >= 2 && b.top >= 2 && b.right <= innerWidth - 2 && b.bottom <= innerHeight - 2 && belegt.every((o, j) => j === i || umfasst(o, r) || !schneidet(b, o)); });
            if (!frei) notfall.push(i + 1);
            // Notlösung: bei grossen Elementen auf der oberen Rahmenlinie (streift höchstens einen Nachbarrahmen), sonst innen
            const [x, y] = frei ?? (gross ? [r.left + 10 + h, Math.max(h + 2, r.top - 4)] : [r.left + h + 2, r.top + h + 2]);
            const cx = x, cy = y;
            const n = document.createElement('div');
            n.setAttribute('data-hilfe-marke', '');
            n.textContent = String(i + 1);
            Object.assign(n.style, {
              position: 'fixed', left: `${cx - h}px`, top: `${cy - h}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%',
              background: marke, color: '#fff', border: '2px solid #fff', boxSizing: 'border-box', zIndex: '2147483647', pointerEvents: 'none',
              font: '700 11px/16px system-ui, sans-serif', textAlign: 'center', boxShadow: '0 0 0 1px rgb(0 0 0 / 0.25)',
            });
            document.body.append(n);
            const b = box([cx, cy]);
            belegt.push(b);
            teile.push(b);
          });
          const links = Math.max(0, Math.min(...teile.map((t) => t.left)) - rand), oben = Math.max(0, Math.min(...teile.map((t) => t.top)) - rand);
          const rechts = Math.min(innerWidth, Math.max(...teile.map((t) => t.right)) + rand), unten = Math.min(innerHeight, Math.max(...teile.map((t) => t.bottom)) + rand);
          return { x: links, y: oben, width: rechts - links, height: unten - oben, notfall };
        }, { zeige: b.zeige, nummern: b.nummern, ausschnitt: b.ausschnitt ?? null, baustein: BAUSTEIN, rand: RAND, marke: MARKE });
        if (rahmen.width < 1 || rahmen.height < 1) throw new Error(`${b.zeige.join(', ')} ist nicht sichtbar`);
        if (rahmen.notfall.length) fehler.push(`${b.quelle}: Nummer ${rahmen.notfall.join(', ')} ohne freien Platz (Notlösung)`);
        await page.screenshot({ path: join(ordner, b.datei), clip: { x: rahmen.x, y: rahmen.y, width: rahmen.width, height: rahmen.height }, animations: 'disabled' });
        dateien.push(b.datei);
        if (konsole.length) fehler.push(`${b.quelle}: Fehler der Seite: ${konsole.join('; ')}`);
      } catch (e) {
        // ein altes Bild nicht stehen lassen: pruefeHilfe() meldet das fehlende, ein veraltetes bliebe unbemerkt
        rmSync(join(ordner, b.datei), { force: true });
        fehler.push(`${b.quelle}: ${e instanceof Error ? e.message : String(e)}`);
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
