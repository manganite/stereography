// Browserlauf der App (#142): öffnet beide Modi, alle Beispielkristalle und das Telefon, bedient die Werkzeuge im Kopf
// der Tafeln und prüft die Konsole. Die Rechnung prüfen die Tests ohne Browser; hier geht es darum, dass die Seite
// läuft und sich bedienen lässt (beim Entfernen eines Elements brach die App sonst unbemerkt ab, #141).
//
//   node tools/app-pruefen.mjs
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium);
// ein anderes Chromium mit CHROMIUM_PFAD=<Pfad>. Ende mit Code 1, wenn eine Prüfung scheitert. In der CI im Job „pdf“.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { EXAMPLES } from '../js/examples.js';
import { server } from './common/server.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
/** @type {typeof import('playwright')} */
const { chromium } = require('playwright');

/** @type {string[]} */
const fehler = [];
/** @param {boolean} ok @param {string} was */
const pruefe = (ok, was) => { console.log(`${ok ? '✓' : '✗'} ${was}`); if (!ok) fehler.push(was); };

const srv = await server(ROOT);
const basis = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (srv.address()).port}/`;
const chrome = process.env.CHROMIUM_PFAD;
// WebGL für die 3D-Konstruktion wie in tools/skript-pdf.mjs
const browser = await chromium.launch({ ...(chrome ? { executablePath: chrome } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

/** @typedef {import('playwright').Page} Page */
/** Fehler der Seite je Seite. @type {WeakMap<Page, string[]>} */
const KONSOLE = new WeakMap();

/**
 * Neue Seite in einem eigenen Kontext (Speicher leer, Erste Schritte gesehen).
 * @param {{ width: number, height: number }} viewport @param {boolean} [telefon]
 * @returns {Promise<Page>}
 */
async function seite(viewport, telefon = false) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: 'block', reducedMotion: 'reduce', ...(telefon ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('stereo-intro', 'pg,poly'); } catch { /* ohne Speicher */ } });
  const p = await ctx.newPage();
  /** @type {string[]} */
  const k = [];
  KONSOLE.set(p, k);
  p.on('pageerror', (e) => k.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') k.push(m.text()); });
  return p;
}
/** Link öffnen (neu laden, damit der Zustand aus der Adresse kommt). @param {Page} p @param {string} hash */
async function oeffnen(p, hash) {
  await p.goto('about:blank');
  await p.goto(`${basis}index.html${hash}`);
  await p.waitForSelector('#stereo *', { state: 'attached' });
  await p.waitForTimeout(300);
}
/** Neue Fehler in der Konsole seit dem letzten Aufruf. @param {Page} p @param {string} wo */
function konsole(p, wo) {
  const k = KONSOLE.get(p) ?? [];
  pruefe(k.length === 0, `${wo}: keine Fehler in der Konsole${k.length ? ` (${k.join(' | ')})` : ''}`);
  k.length = 0;
}
/** Waagrecht scrollbar? @param {Page} p */
const quer = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
/** Text der Kenndaten. @param {Page} p */
const info = (p) => p.locator('#info').innerText();
/** Gedrückt? @param {Page} p @param {string} sel */
const gedrueckt = async (p, sel) => (await p.locator(sel).getAttribute('aria-pressed')) === 'true';

/**
 * Zwei verschiedene Flächenpole im Stereogramm antippen (Trefferkreise .hit, verschiedene Stellen).
 * @param {Page} p
 */
async function zweiPole(p) {
  const pole = await p.evaluate(() => {
    /** @type {{ x: number, y: number }[]} */
    const out = [];
    for (const el of document.querySelectorAll('#stereo .hit')) {
      const r = el.getBoundingClientRect();
      const q = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      if (out.every((o) => Math.hypot(o.x - q.x, o.y - q.y) > 30)) out.push(q);
      if (out.length === 2) break;
    }
    return out;
  });
  for (const q of pole) await p.mouse.click(q.x, q.y);
  return pole.length;
}

try {
  // 1. Beide Modi am Laptop: Seite läuft, Tafeln gezeichnet, Werkzeuge im Kopf
  const p = await seite({ width: 1280, height: 900 });
  for (const m of ['pg', 'form']) {
    await oeffnen(p, `#m=${m}`);
    pruefe(await p.locator('#view3d canvas').count() === 1, `${m}: 3D-Konstruktion gezeichnet`);
    pruefe((await info(p)).trim().length > 0, `${m}: Kenndaten gefüllt`);
    konsole(p, `${m}, Laptop`);
  }

  // 2. Punktgruppen: nur das Werkzeug „Winkel“, ein- und ausschalten
  await oeffnen(p, '#m=pg');
  pruefe(await p.locator('#zone-btn').isHidden() && await p.locator('#angle-btn').isVisible(), 'Punktgruppen: nur „Winkel“ im Kopf');
  await p.click('#angle-btn');
  pruefe(await gedrueckt(p, '#angle-btn') && await gedrueckt(p, '#angle-btn-3d'), 'Punktgruppen: „Winkel“ gewählt, in beiden Tafeln');
  await p.click('#angle-btn');
  pruefe(!await gedrueckt(p, '#angle-btn'), 'Punktgruppen: „Winkel“ wieder abgewählt');
  konsole(p, 'Punktgruppen, Werkzeug');

  // 3. Kristallformen: Zone und Winkel schliessen sich aus und wirken auf zwei Pole
  await oeffnen(p, '#m=form&sys=kubisch&bsp=galenit');
  await p.click('#zone-btn');
  pruefe(await gedrueckt(p, '#zone-btn') && !await gedrueckt(p, '#angle-btn'), 'Kristallformen: „Zone“ gewählt');
  pruefe(await zweiPole(p) === 2, 'Kristallformen: zwei Pole gefunden');
  await p.waitForTimeout(200);
  pruefe(/zonen=/.test(await p.evaluate(() => decodeURIComponent(location.hash))), 'Kristallformen: Zone in der Link-Adresse');
  await p.click('#angle-btn');
  pruefe(await gedrueckt(p, '#angle-btn') && !await gedrueckt(p, '#zone-btn'), 'Kristallformen: „Winkel“ wählt „Zone“ ab');
  await zweiPole(p);
  await p.waitForTimeout(200);
  pruefe(/Winkel/i.test(await info(p)) && /°/.test(await info(p)), 'Kristallformen: Winkel in den Kenndaten');
  konsole(p, 'Kristallformen, Werkzeuge');

  // 4. Export: Menü je Tafel öffnet sich und schliesst mit Escape
  for (const id of ['export-stereo', 'export-3d']) {
    await p.click(`#${id}`);
    const menue = p.locator(`#${id} + .exportmenue, #${id} ~ .exportmenue`).first();
    pruefe(await menue.isVisible() && await menue.locator('button').count() >= 2, `Export ${id}: Menü offen`);
    await p.keyboard.press('Escape');
    pruefe(await menue.isHidden(), `Export ${id}: Escape schliesst`);
  }
  konsole(p, 'Export');

  // 5. Alle Beispielkristalle, am Laptop und auf dem Telefon (390 px: nicht waagrecht scrollbar)
  const t = await seite({ width: 390, height: 844 }, true);
  for (const b of EXAMPLES) {
    const hash = `#m=form&sys=${b.sys}&bsp=${b.id}`;
    await oeffnen(p, hash);
    pruefe(/Tracht/i.test(await info(p)), `${b.id}: Tracht in den Kenndaten`);
    konsole(p, `${b.id}, Laptop`);
    await oeffnen(t, hash);
    pruefe(await quer(t) === 0, `${b.id}, Telefon: nicht waagrecht scrollbar`);
    konsole(t, `${b.id}, Telefon`);
  }
  for (const m of ['pg', 'form']) {
    await oeffnen(t, `#m=${m}`);
    pruefe(await quer(t) === 0, `${m}, Telefon: nicht waagrecht scrollbar`);
    await t.click('.figswitch button[data-fig="b"]');
    pruefe(await t.locator('#view3d').isVisible(), `${m}, Telefon: Umschalter zeigt die 3D-Konstruktion`);
    konsole(t, `${m}, Telefon`);
  }
} catch (e) {
  fehler.push(String(e));
  console.error(e);
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) {
  console.error(`\n${fehler.length} Prüfung(en) gescheitert.`);
  process.exit(1);
}
console.log('\nAlle Prüfungen bestanden.');
