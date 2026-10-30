// Hilfen: Tooltips (Laptop: Maus oder Tastaturfokus) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Texte liefert die App (initHelp); hier steht nur die Mechanik. Stile in css/app.css (.tip, .infobtn, .helpbox).

let cfg = { tips: {}, sections: [], labels: {} };
let tipEl = null, tipFor = null, tipDesc = null, showTimer = 0;
const hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Element, an dem der Tooltip einer ID erscheint (bei Eingaben die ganze Zeile). */
function anchorOf(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.matches('input, select, output') ? el.closest('.check, .range, .field') || el : el;
}

/** Tooltip-Text eines Elements setzen (auch für dynamisch erzeugte Buttons). HTML erlaubt. */
export function setTip(el, html) {
  if (!el) return;
  el.dataset.tip = html;
  el.removeAttribute('title'); // sonst zwei Tooltips
}

function place(x, y, below) {
  const r = tipEl.getBoundingClientRect();
  const m = 8;
  let left = Math.min(Math.max(m, x - r.width / 2), window.innerWidth - r.width - m);
  let top = below.top - r.height - 10;
  if (top < m) top = below.bottom + 10;
  tipEl.style.left = `${left}px`;
  tipEl.style.top = `${top}px`;
}

/** Tooltip an einem Element zeigen; die Beschreibung erhält das bediente Element (bei Fokus das Eingabefeld). */
function showFor(el, desc = el) {
  tipFor = el;
  tipDesc = desc;
  tipEl.innerHTML = el.dataset.tip;
  tipEl.hidden = false;
  desc.setAttribute('aria-describedby', 'tip');
  const b = el.getBoundingClientRect();
  place(b.left + b.width / 2, b.top, b);
}

/** Tooltip an einer Bildschirmposition zeigen (z. B. über einem Pol). */
export function showTipAt(html, x, y) {
  if (!tipEl || !hoverMQ.matches) return;
  clearTimeout(showTimer);
  tipFor = null;
  tipEl.innerHTML = html;
  tipEl.hidden = false;
  place(x, y, { top: y - 6, bottom: y + 14 });
}

export function hideTip() {
  clearTimeout(showTimer);
  if (!tipEl) return;
  tipEl.hidden = true;
  if (tipDesc) tipDesc.removeAttribute('aria-describedby');
  tipFor = null; tipDesc = null;
}

function buildHelpBox(sec) {
  const box = document.createElement('div');
  box.className = 'helpbox';
  const rows = sec.ids.map((id) => {
    const a = anchorOf(id);
    if (!a || a.closest('[hidden]')) return '';
    const lab = cfg.labels[id] || (a.querySelector('label') || a).textContent.trim().replace(/\s+/g, ' ').replace(/\d[\d.,]*\s*°?$/, '').trim();
    return `<dt>${lab}</dt><dd>${cfg.tips[id]}</dd>`;
  }).join('');
  box.innerHTML = `${sec.intro ? `<p>${sec.intro}</p>` : ''}${rows ? `<dl>${rows}</dl>` : ''}`;
  return box;
}

/**
 * Tooltips und ⓘ-Erklärungen einrichten.
 * tips: Tooltip-Text (HTML) je Element-ID; bei Eingabefeldern erscheint er an der ganzen Zeile (.check, .range, .field).
 * sections: je Abschnitt { heading: Selektor der Überschrift (h2 oder summary), intro?: Einleitungssatz, ids: [Element-IDs] }.
 * labels: Beschriftung je ID in der ⓘ-Erklärung, wo der Text des Elements nicht passt.
 */
export function initHelp({ tips = {}, sections = [], labels = {} } = {}) {
  cfg = { tips, sections, labels };
  tipEl = document.createElement('div');
  tipEl.id = 'tip';
  tipEl.className = 'tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.hidden = true;
  document.body.appendChild(tipEl);
  for (const [id, text] of Object.entries(tips)) setTip(anchorOf(id), text);

  // Laptop: Maus (verzögert) und Tastaturfokus
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || !hoverMQ.matches) return;
    const el = e.target.closest('[data-tip]');
    if (el === tipFor) return;
    hideTip();
    if (el) showTimer = setTimeout(() => showFor(el), 450);
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest('[data-tip]');
    if (el && !el.contains(e.relatedTarget)) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest('[data-tip]');
    if (el && e.target.matches(':focus-visible') && hoverMQ.matches) showFor(el, e.target);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('scroll', hideTip, true);

  // Touch: ⓘ an den Abschnittsüberschriften klappt die Erklärungen des Abschnitts auf
  for (const sec of sections) {
    const h = document.querySelector(sec.heading);
    if (!h) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'infobtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Erklärungen zu diesem Abschnitt');
    btn.innerHTML = '<span aria-hidden="true">i</span>';
    let box = null, openedByHelp = false;
    const details = h.closest('details');
    // Ein Abschnitt, den die Erklärung aufklappt, wird beim Schliessen wieder zugeklappt und nicht gemerkt
    // (data-quiet: ein toggle-Listener der App, der offene Abschnitte merkt, soll diese Änderung nicht speichern).
    const setOpenQuietly = (open) => { if (details.open !== open) { details.dataset.quiet = '1'; details.open = open; } };
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
      const label = document.createElement('span');
      label.className = 'sumlabel';
      label.append(...h.childNodes);
      label.append(btn);
      h.append(label);
    } else h.append(btn);
  }
}
