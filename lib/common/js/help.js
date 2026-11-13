// Hilfen: Tooltips (Laptop: Maus oder Tastaturfokus) und ⓘ-Erklärungen je Abschnitt (alle Geräte, #140).
// Die Texte liefert die App (initHelp); hier steht nur die Mechanik. Stile in css/app.css (.tip, .infobtn, .helpbox).
// Das zuletzt benutzte Zeigegerät steht als `data-zeiger` (maus | touch) an <html>; danach richten sich die Texte für
// Maus und Touch (.only-fine, .only-coarse), auch im ⓘ, und die Grösse des ⓘ (28 px mit der Maus, 40 px mit Touch). Ein Stift zählt als Touch (kein Tooltip,
// Texte „antippen“). pruefeTooltips() ist für die Tests der App.

import { esc } from './format.js';

/**
 * Erklärungen eines Abschnitts: heading Selektor der Überschrift (h2 oder summary), intro Einleitungssatz,
 * ids Element-IDs der Bedienelemente.
 * @typedef {{ heading: string, intro?: string, ids: string[] }} Abschnitt
 */
/** Element mit Tooltip (data-tip), auch in SVG. @typedef {HTMLElement | SVGElement} MitTip */
/**
 * Texte der Hilfen (HTML) je Element-ID.
 * @typedef {{ tips?: Record<string, string>, sections?: Abschnitt[], labels?: Record<string, string> }} Hilfetexte
 */

/**
 * Höchstlänge eines Tooltips in Zeichen (ohne Auszeichnung). Richtwert der Regel ist ein Satz (Leitfaden Abschn. 5.3,
 * Entscheidung Thomas, 9.11.2026, #114); geprüft wird nur die Länge, Ausführlicheres gehört ins ⓘ und auf die Hilfeseite.
 */
export const TIP_MAX = 120;

/**
 * Tags, die als Bedienelement einen Tooltip brauchen (mit id; input ausser type="hidden"). Attributwerte in
 * Anführungszeichen dürfen `>` enthalten. Ein HTML-Kommentar wird als Ganzes gefunden und übergangen (ohne Tag).
 */
const BEDIENELEMENT = /<!--[\s\S]*?-->|<(button|input|select|textarea|a)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
/** Wert eines Attributs (in Anführungszeichen oder ohne), nicht eines gleich endenden wie data-id. @param {string} attrs @param {string} name */
const attribut = (attrs, name) => {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(attrs);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};

/**
 * Prüft die Tooltips einer App, für ihre Tests: Jedes Bedienelement mit id in `html` (button, input, select,
 * textarea, a) hat einen Eintrag in `tips`, ausser es steht in `ohne` (Ausnahmen nach Leitfaden 5.3: selbsterklärende
 * Links, Schliessen „×“, Export-Knöpfe mit Text). Jede Ausnahme muss im HTML vorkommen und darf keinen Tooltip haben,
 * damit die Liste nicht veraltet. Ein Element mit Tooltip hat kein `title` (der Browser zeigte sonst zwei). Kein Tooltip
 * ist länger als `max` Zeichen (ohne Auszeichnung; Entitäten und Zeichen mit Querstrich als eines). Elemente ohne id,
 * Elemente in Kommentaren und solche, die die App erst im Code erzeugt (`setTip`), sieht diese Prüfung nicht.
 * Rückgabe: Liste der Fehler (leer, wenn alles stimmt).
 * @param {string} html Inhalt von index.html
 * @param {Record<string, string>} tips Texte der Tooltips je id (TIPS der App)
 * @param {{ ohne?: string[], max?: number }} [o]
 * @returns {string[]}
 */
export function pruefeTooltips(html, tips, { ohne = [], max = TIP_MAX } = {}) {
  /** @type {string[]} */
  const f = [];
  /** @type {Set<string>} */
  const ids = new Set();
  for (const [, tag, attrs] of html.matchAll(BEDIENELEMENT)) {
    if (tag === undefined) continue; // Kommentar
    const id = attribut(attrs, 'id');
    if (!id || attribut(attrs, 'type')?.toLowerCase() === 'hidden') continue;
    ids.add(id);
    if (!(id in tips) && !ohne.includes(id)) f.push(`${tag.toLowerCase()}#${id}: kein Tooltip`);
    if (id in tips && attribut(attrs, 'title') !== undefined) f.push(`${tag.toLowerCase()}#${id}: title und Tooltip (title entfernen)`);
  }
  for (const id of ohne) {
    if (!ids.has(id)) f.push(`${id}: Ausnahme, aber kein Bedienelement mit dieser id im HTML`);
    if (id in tips) f.push(`${id}: Ausnahme, hat aber einen Tooltip`);
  }
  for (const [id, text] of Object.entries(tips)) {
    // nur zum Zählen: Tags wiederholt entfernen, bis nichts mehr zu entfernen ist (wie ohneHTML in ablauf.js), dann
    // verbliebene spitze Klammern; Entitäten zählen als ein Zeichen, kombinierende Zeichen (x̄) nicht extra
    let t = text;
    for (let alt = ''; alt !== t;) { alt = t; t = t.replace(/<[^<>]*>/g, ''); }
    const n = [...t.replace(/[<>]/g, '').replace(/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi, '_').replace(/\p{M}/gu, '')].length;
    if (n > max) f.push(`${id}: Tooltip mit ${n} Zeichen, länger als ${max}`);
  }
  return f;
}

/** @type {Required<Hilfetexte>} */
let cfg = { tips: {}, sections: [], labels: {} };
/** @type {HTMLElement | null} */
let tipEl = null;
/** @type {MitTip | null} */
let tipFor = null;
/** @type {Element | null} */
let tipDesc = null;
/** @type {ReturnType<typeof setTimeout> | undefined} */
let showTimer;
// Ob Tooltips erscheinen, entscheidet das zuletzt benutzte Gerät, nicht das primäre Zeigegerät des Browsers
// (Media Query): Laptops mit Touchscreen melden unter Windows oft `pointer: coarse`, auch mit angeschlossener Maus
// (#114). Maus: Tooltip beim Überfahren; Tastatur: beim Fokus; Tippen auf dem Touchscreen: keiner.
/** Kam die letzte Zeigerbewegung von einer Maus? @type {boolean} */
let maus = false;
/** Wurde seit dem letzten Tippen oder Klicken die Tastatur benutzt? @type {boolean} */
let tastatur = false;

/**
 * Element, an dem der Tooltip einer ID erscheint (bei Eingaben die ganze Zeile).
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function anchorOf(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.matches('input, select, output') ? el.closest('.check, .range, .field') || el : el;
}

/**
 * Tooltip-Text eines Elements setzen (auch für dynamisch erzeugte Buttons). HTML erlaubt.
 * @param {MitTip | null} el
 * @param {string} html
 */
export function setTip(el, html) {
  if (!el) return;
  el.dataset.tip = html;
  el.removeAttribute('title'); // sonst zwei Tooltips
}

/**
 * Tooltip über (sonst unter) dem Bereich below an der Stelle x zeigen.
 * @param {HTMLElement} tipEl
 * @param {number} x
 * @param {number} y
 * @param {{ top: number, bottom: number }} below
 */
function place(tipEl, x, y, below) {
  const r = tipEl.getBoundingClientRect();
  const m = 8;
  let left = Math.min(Math.max(m, x - r.width / 2), window.innerWidth - r.width - m);
  let top = below.top - r.height - 10;
  if (top < m) top = below.bottom + 10;
  tipEl.style.left = `${left}px`;
  tipEl.style.top = `${top}px`;
}

/**
 * Tooltip an einem Element zeigen; die Beschreibung erhält das bediente Element (bei Fokus das Eingabefeld).
 * @param {MitTip} el
 * @param {Element} [desc]
 */
function showFor(el, desc = el) {
  if (!tipEl) return;
  tipFor = el;
  tipDesc = desc;
  tipEl.innerHTML = el.dataset.tip ?? '';
  tipEl.hidden = false;
  desc.setAttribute('aria-describedby', 'tip');
  const b = el.getBoundingClientRect();
  place(tipEl, b.left + b.width / 2, b.top, b);
}

/**
 * Tooltip an einer Bildschirmposition zeigen (z. B. über einem Pol).
 * @param {string} html
 * @param {number} x
 * @param {number} y
 */
export function showTipAt(html, x, y) {
  if (!tipEl || !maus) return;
  clearTimeout(showTimer);
  tipFor = null;
  tipEl.innerHTML = html;
  tipEl.hidden = false;
  place(tipEl, x, y, { top: y - 6, bottom: y + 14 });
}

export function hideTip() {
  clearTimeout(showTimer);
  if (!tipEl) return;
  tipEl.hidden = true;
  if (tipDesc) tipDesc.removeAttribute('aria-describedby');
  tipFor = null; tipDesc = null;
}

/**
 * Element mit Tooltip, in dem ein Ereignis stattfand (das Ziel ist bei Zeiger und Fokus immer ein Element).
 * @param {EventTarget | null} ziel
 */
const tipVon = (ziel) => /** @type {MitTip | null} */ (/** @type {Element} */ (ziel).closest('[data-tip]'));

/** @param {Abschnitt} sec */
function buildHelpBox(sec) {
  const box = document.createElement('div');
  box.className = 'helpbox';
  const rows = sec.ids.map((id) => {
    const a = anchorOf(id);
    if (!a || a.closest('[hidden]')) return '';
    // cfg.labels: HTML der App; sonst der sichtbare Text des Bedienelements, als Text maskiert
    const lab = cfg.labels[id] || esc((a.querySelector('label') || a).textContent.trim().replace(/\s+/g, ' ').replace(/\d[\d.,]*\s*°?$/, '').trim());
    return `<dt>${lab}</dt><dd>${cfg.tips[id]}</dd>`;
  }).join('');
  box.innerHTML = `${sec.intro ? `<p>${sec.intro}</p>` : ''}${rows ? `<dl>${rows}</dl>` : ''}`;
  return box;
}

/**
 * Hängt das ⓘ an das letzte Wort eines Titels, in einem Element, das nicht umbricht (`.nobr`): Bricht der Titel um,
 * steht das ⓘ mit dem letzten Wort in der neuen Zeile, nie allein (Bedingung Thomas, #140). Endet der Titel mit einem
 * Element (z. B. einem Symbol), wird dieses als Ganzes mit dem ⓘ zusammengehalten; der Titel einer `summary` steht
 * deshalb als Text darin, nicht ganz in einem Element (sonst bräche er nicht mehr um).
 * @param {HTMLElement} titel
 * @param {HTMLElement} btn
 */
function anheften(titel, btn) {
  const nobr = document.createElement('span');
  nobr.className = 'nobr';
  let letzter = titel.lastChild;
  // Leerraum und Kommentare am Ende überspringen
  while (letzter && (letzter.nodeType === Node.COMMENT_NODE || (letzter.nodeType === Node.TEXT_NODE && !letzter.textContent?.trim()))) {
    const davor = letzter.previousSibling;
    letzter.remove();
    letzter = davor;
  }
  if (letzter && letzter.nodeType === Node.TEXT_NODE) {
    const text = /** @type {Text} */ (letzter);
    const t = text.data.trimEnd();
    const i = t.search(/\S+$/);
    text.data = t.slice(0, i);
    nobr.append(t.slice(i));
    if (!text.data) text.remove();
  } else if (letzter) nobr.append(letzter);
  nobr.append(btn);
  titel.append(nobr);
}

/**
 * Tooltips und ⓘ-Erklärungen einrichten.
 * tips: Tooltip-Text (HTML) je Element-ID; bei Eingabefeldern erscheint er an der ganzen Zeile (.check, .range, .field).
 * sections: je Abschnitt { heading: Selektor der Überschrift (h2 oder summary), intro?: Einleitungssatz, ids: [Element-IDs] }.
 * labels: Beschriftung je ID in der ⓘ-Erklärung, wo der Text des Elements nicht passt.
 * @param {Hilfetexte} [texte]
 */
export function initHelp({ tips = {}, sections = [], labels = {} } = {}) {
  cfg = { tips, sections, labels };
  const tip = document.createElement('div');
  tip.id = 'tip';
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);
  tipEl = tip;
  for (const [id, text] of Object.entries(tips)) setTip(anchorOf(id), text);

  // Laptop: Maus (verzögert) und Tastaturfokus. Das Gerät zählt je Ereignis, nicht die Media Query.
  /** @param {PointerEvent} e */
  const geraet = (e) => {
    maus = e.pointerType === 'mouse';
    // für CSS (.only-fine, .only-coarse, Grösse des ⓘ): nur bei einem Wechsel schreiben
    const zeiger = maus ? 'maus' : 'touch';
    const d = document.documentElement.dataset;
    if (d.zeiger !== zeiger) d.zeiger = zeiger;
  };
  document.addEventListener('pointerdown', (e) => { geraet(e); tastatur = false; }, true);
  document.addEventListener('keydown', () => { tastatur = true; }, true);
  document.addEventListener('pointermove', geraet, true);
  document.addEventListener('pointerover', (e) => {
    geraet(e);
    if (!maus) return;
    const el = tipVon(e.target);
    if (el === tipFor) return;
    hideTip();
    if (el) showTimer = setTimeout(() => showFor(el), 450);
  });
  document.addEventListener('pointerout', (e) => {
    const el = tipVon(e.target);
    if (el && !el.contains(/** @type {Node | null} */ (e.relatedTarget))) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const ziel = /** @type {Element} */ (e.target);
    const el = tipVon(ziel);
    if (el && ziel.matches(':focus-visible') && (maus || tastatur)) showFor(el, ziel);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('scroll', hideTip, true);

  // ⓘ an den Abschnittsüberschriften klappt die Erklärungen des Abschnitts auf (auf allen Geräten, #140)
  for (const sec of sections) {
    const h = document.querySelector(sec.heading);
    if (!h) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'infobtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Erklärungen zu diesem Abschnitt');
    setTip(btn, 'Erklärungen zu diesem Abschnitt ein- und ausklappen.');
    btn.innerHTML = '<span aria-hidden="true">i</span>';
    /** @type {HTMLElement | null} */
    let box = null;
    let openedByHelp = false;
    const details = h.closest('details');
    // Ein Abschnitt, den die Erklärung aufklappt, wird beim Schliessen wieder zugeklappt und nicht gemerkt
    // (data-quiet: ein toggle-Listener der App, der offene Abschnitte merkt, soll diese Änderung nicht speichern).
    /** @param {boolean} open */
    const setOpenQuietly = (open) => { if (details && details.open !== open) { details.dataset.quiet = '1'; details.open = open; } };
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); // Klick auf ⓘ in <summary>: nicht als Auf-/Zuklappen werten
      if (box) {
        box.remove(); box = null; btn.setAttribute('aria-expanded', 'false');
        if (details && openedByHelp) setOpenQuietly(false);
        openedByHelp = false;
        return;
      }
      // Die Erklärungen beziehen sich auf die Bedienelemente; der Abschnitt wird daher vorübergehend aufgeklappt
      if (details && !details.open) { openedByHelp = true; setOpenQuietly(true); }
      box = buildHelpBox(sec);
      h.after(box);
      btn.setAttribute('aria-expanded', 'true');
    });
    if (h.tagName === 'SUMMARY') {
      // Titel (ohne .sumhint) in einem eigenen Element, das ⓘ fest am letzten Wort (#140)
      const titel = document.createElement('span');
      titel.className = 'sumtitel';
      const hinweise = [...h.childNodes].filter((n) => n instanceof Element && n.classList.contains('sumhint'));
      titel.append(...[...h.childNodes].filter((n) => !hinweise.includes(n)));
      anheften(titel, btn);
      const label = document.createElement('span');
      label.className = 'sumlabel';
      label.append(titel, ...hinweise);
      h.append(label);
    } else h.append(btn);
  }
}
