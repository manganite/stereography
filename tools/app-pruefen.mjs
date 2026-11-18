// Browserlauf der App (#142): öffnet beide Modi, alle Beispielkristalle und das Telefon, bedient die Werkzeuge im Kopf
// der Tafeln, den Zoom der 3D-Konstruktion und die Tooltips je Modus und prüft die Konsole. Die Rechnung prüfen die Tests ohne Browser; hier geht es darum, dass die Seite
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
import { fehlendeTooltips } from './common/tooltips-pruefen.mjs';

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
  await p.evaluate(() => document.fonts.ready); // Breiten erst mit den eigenen Schriften messen
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
 * Zwei verschiedene Flächenpole im Stereogramm antippen (Trefferkreise .hit, verschiedene Stellen, nicht gegenüber auf
 * dem Grundkreis: zwei Gegenpole wie (100) und (1̄00) legen keine Zone fest). Welche Pole zuerst kommen, hängt von der
 * Reihenfolge der Operationen ab.
 * @param {Page} p
 */
async function zweiPole(p) {
  const pole = await p.evaluate(() => {
    const hits = /** @type {SVGGraphicsElement[]} */ ([...document.querySelectorAll('#stereo .hit')]);
    const k = (hits[0]?.ownerSVGElement ?? document.body).getBoundingClientRect();
    const m = { x: k.left + k.width / 2, y: k.top + k.height / 2 };
    /** @type {{ x: number, y: number }[]} */
    const out = [];
    for (const el of hits) {
      const r = el.getBoundingClientRect();
      const q = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const frei = out.every((o) => Math.hypot(o.x - q.x, o.y - q.y) > 30 && Math.hypot(o.x + q.x - 2 * m.x, o.y + q.y - 2 * m.y) > 30);
      if (frei) out.push(q);
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
  pruefe(await zweiPole(p) === 2, 'Punktgruppen: zwei Pole gefunden');
  await p.waitForFunction(() => /Winkel zwischen den Polen/.test(document.getElementById('info')?.innerText ?? ''), null, { timeout: 5000 }).catch(() => {});
  pruefe(/Winkel zwischen den Polen[\s\S]*ineinander über/.test(await info(p)), 'Punktgruppen: Winkel und verknüpfende Operation in den Kenndaten');
  await p.click('#angle-btn');
  pruefe(!await gedrueckt(p, '#angle-btn'), 'Punktgruppen: „Winkel“ wieder abgewählt');
  konsole(p, 'Punktgruppen, Werkzeug');

  // 3. Kristallformen: Zone und Winkel schliessen sich aus und wirken auf zwei Pole
  await oeffnen(p, '#m=form&sys=kubisch&bsp=galenit');
  await p.click('#zone-btn');
  pruefe(await gedrueckt(p, '#zone-btn') && !await gedrueckt(p, '#angle-btn'), 'Kristallformen: „Zone“ gewählt');
  pruefe(await zweiPole(p) === 2, 'Kristallformen: zwei Pole gefunden');
  pruefe(await p.waitForFunction(() => decodeURIComponent(location.hash).includes('zonen='), null, { timeout: 5000 }).then(() => true, () => false), 'Kristallformen: Zone in der Link-Adresse');
  await p.click('#angle-btn');
  pruefe(await gedrueckt(p, '#angle-btn') && !await gedrueckt(p, '#zone-btn'), 'Kristallformen: „Winkel“ wählt „Zone“ ab');
  await zweiPole(p);
  // gemessen ist erst, wenn der Hinweis „… antippen“ dem Ergebnis gewichen ist (Normalen- und Flächenwinkel)
  pruefe(await p.waitForFunction(() => /Normalenwinkel/.test(document.getElementById('info')?.innerText ?? ''), null, { timeout: 5000 }).then(() => true, () => false)
    && !/antippen/.test(await p.locator('#info .zonebox').innerText()), 'Kristallformen: Winkel gemessen (Normalen- und Flächenwinkel)');
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

  // 4b. Zoom der 3D-Konstruktion (#144): + bis zur Grenze, dann gesperrt; − gibt + wieder frei
  for (let i = 0; i < 40 && await p.locator('#zoom-3d-ein').isEnabled(); i++) await p.click('#zoom-3d-ein');
  pruefe(await p.locator('#zoom-3d-ein').isDisabled() && await p.locator('#zoom-3d-aus').isEnabled(), 'Zoom 3D: + an der Grenze gesperrt');
  await p.click('#zoom-3d-aus');
  pruefe(await p.locator('#zoom-3d-ein').isEnabled(), 'Zoom 3D: − gibt + wieder frei');
  konsole(p, 'Zoom 3D');

  // 4c. Tooltips aller sichtbaren Bedienelemente je Modus, auch ohne id (Leitfaden 5.3, fehlendeTooltips)
  for (const m of ['pg', 'form']) {
    await oeffnen(p, `#m=${m}`);
    const fehlend = await fehlendeTooltips(p);
    pruefe(fehlend.length === 0, `${m}: jedes Bedienelement hat einen Tooltip${fehlend.length ? ` (fehlt: ${fehlend.join(', ')})` : ''}`);
  }

  // 5. Alle Beispielkristalle, am Laptop und auf dem Telefon (390 px: nicht waagrecht scrollbar)
  const t = await seite({ width: 390, height: 844 }, true);
  for (const b of EXAMPLES) {
    const hash = `#m=form&sys=${b.sys}&bsp=${b.id}`;
    await oeffnen(p, hash);
    const zeilen = await p.locator('#info .formtab tbody tr').count();
    pruefe((await info(p)).includes(b.name) && zeilen === b.forms.length, `${b.id}: Beispiel geladen (Name, ${b.forms.length} Formen in der Tracht, gefunden ${zeilen})`);
    konsole(p, `${b.id}, Laptop`);
    await oeffnen(t, hash);
    pruefe(await quer(t) === 0, `${b.id}, Telefon: nicht waagrecht scrollbar`);
    konsole(t, `${b.id}, Telefon`);
  }
  for (const m of ['pg', 'form']) {
    await oeffnen(t, `#m=${m}`);
    pruefe(await quer(t) === 0, `${m}, Telefon: nicht waagrecht scrollbar`);
    pruefe(await t.locator('#export-stereo').isHidden() && await t.locator('#export-3d').isHidden(), `${m}, Telefon: kein Export (Leitfaden 5.2)`);
    await t.click('.figswitch button[data-fig="b"]');
    pruefe(await t.locator('#view3d').isVisible(), `${m}, Telefon: Umschalter zeigt die 3D-Konstruktion`);
    konsole(t, `${m}, Telefon`);
  }
} catch (e) {
  // Abbruch (z. B. die App startet nicht): die gesammelten Fehler der Seiten sind meist die Ursache
  fehler.push(String(e));
  console.error(e);
  for (const ctx of browser.contexts()) for (const s of ctx.pages()) {
    const k = KONSOLE.get(s) ?? [];
    if (k.length) console.error(`Fehler der Seite ${s.url()}:\n  ${k.join('\n  ')}`);
  }
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) {
  console.error(`\n${fehler.length} Prüfung(en) gescheitert.`);
  process.exit(1);
}
console.log('\nAlle Prüfungen bestanden.');
