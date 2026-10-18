// Hilfen: Tooltips (Laptop: Maus oder Tastaturfokus) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Texte stehen nur hier; Begriffe nach Borchardt-Ott & Sowa, Kristallographie (2018).

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  // Kopfzeile
  'tab-pg': 'Symmetriegerüste der 32 Punktgruppen und wie ihre Operationen einen Pol vervielfältigen.',
  'tab-poly': 'Kristallformen und Beispielkristalle: Flächen, ihre Pole im Stereogramm und der Kristall in 3D.',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren, z. B. für Folien.',
  'help-open': 'Erste Schritte: kurze Einführung in die App.',
  // Punktgruppen
  'pg-elements': 'Symmetrieelemente im Stereogramm: Drehachsen als Symbole an ihren Durchstosspunkten, Spiegelebenen als kräftige Grosskreise.',
  'pg-object': 'Ein Pol, der auf keinem Symmetrieelement liegt. Alle Operationen der Gruppe wirken auf ihn; die Zahl der Pole ist die Ordnung der Gruppe.',
  'pg-colorful': 'Pole, die durch eine Drehung aus dem Ausgangspol entstehen, in einer Farbe; Spiegelbilder (aus Spiegelung, Inversion oder Drehinversion) in der anderen.',
  'pg-theta': 'Poldistanz ρ: Winkel des Ausgangspols vom Nordpol, also vom Zentrum des Stereogramms. Negative Werte: untere Halbkugel, vom Südpol gezählt.',
  'pg-phi': 'Azimut φ: Drehwinkel um die Blickrichtung, ab dem rechten Rand im Uhrzeigersinn.',
  // Kristallformen
  'ex-select': 'Kristalle aus Vorlesung und Lehrbuch: mehrere Formen derselben Punktgruppe, jede in eigener Farbe.',
  'sys-select': 'Bestimmt das Achsensystem und die Punktgruppen, deren Formen zur Auswahl stehen.',
  'form-select': 'Eine Form ist die Menge der Flächen, die die Operationen der Punktgruppe aus einer Fläche erzeugen.',
  'preset-select': 'Welche Kristallrichtung zum Betrachter zeigt. Das Stereogramm dreht sich mit, die Winkel zwischen den Polen bleiben gleich.',
  'poly-labels': 'Schreibt die Indizes (hkl) an jeden Flächenpol und an die Flächen in 3D.',
  'poly-bravais': 'Miller-Bravais-Indizes (hkil) mit i = −(h + k); sie zeigen die Gleichwertigkeit der drei a-Achsen.',
  'poly-lower': 'Pole von Flächen, die vom Betrachter wegzeigen, als Kreise. Ausgeschaltet nur die obere Halbkugel, wie in vielen Lehrbuchabbildungen.',
  'poly-facesym': 'Ein asymmetrisches Muster auf jeder Fläche; seine Wiederholung auf einer Fläche zeigt deren Flächensymmetrie, ähnlich wie Ätzfiguren. Die Formauswahl zeigt dann alle 115 Formen.',
  'poly-frame': 'Legt die Symmetrieelemente der Punktgruppe unter die Pole. Liegt ein Pol auf einem Symmetrieelement, gehört er zu einer speziellen Form.',
  // Gitter und Gestalt
  'lat-ba': 'Achsenverhältnis b/a. Es ändert die Winkel zwischen den Flächen und damit die Lage der Pole.',
  'lat-ca': 'Achsenverhältnis c/a. Es ändert die Winkel zwischen den Flächen und damit die Lage der Pole.',
  'lat-al': 'Winkel α zwischen den Achsen b und c.',
  'lat-be': 'Winkel β zwischen den Achsen a und c.',
  'lat-ga': 'Winkel γ zwischen den Achsen a und b.',
  'poly-broken': 'Gibt alle Gitterparameter frei und zeigt, welche Punktgruppe übrig bleibt und in welche Formen die Form zerfällt.',
  'poly-size': 'Grösse des Kristalls in 3D. Das Stereogramm hängt nicht davon ab: Die Pole hängen nur von den Flächennormalen ab.',
  'ctl-ex-dists': 'Zentralabstand der Formen. Er ändert die Gestalt und damit den Habitus, aber nicht das Stereogramm.',
  'poly-open': 'Pyramiden, Prismen, Pedien und Pinakoide schliessen allein keinen Raum ein. Ausgeschaltet schliessen graue Ergänzungsformen den Körper.',
  'poly-aux': 'Abstand der grauen Ergänzungsformen vom Zentrum. Er ändert nur die Gestalt, nicht das Stereogramm.',
  'poly-reset': 'Gitterparameter, Grösse und Abstände auf die Ausgangswerte zurücksetzen.',
  // Darstellung
  'v-dircolors': 'Farbe der Symmetrieelemente nach ihrer Position im vollen Hermann-Mauguin-Symbol (1., 2., 3. Blickrichtung). Ausgeschaltet schwarz wie in den International Tables.',
  'v-wulff': 'Wulffsches Netz: projiziertes Gradnetz. Winkel zwischen Polen nur auf Grosskreisen (Längenkreisen) ablesen.',
  'v-wulffrot': 'Netz drehen, bis zwei Pole auf demselben Längenkreis liegen, dann die Teilstriche dazwischen zählen.',
  'v-axes': 'Richtungen der Kristallachsen a, b, c (hexagonal a₁, a₂, a₃, c) im Stereogramm und in 3D.',
  'v-sphere': 'Lagekugel um den Kristall; ihre Durchstosspunkte mit den Flächennormalen sind die Flächenpole.',
  'v-plane': 'Das Stereogramm in der Äquatorebene der Kugel, wie es die Projektion erzeugt.',
  'v-rays': 'Verbindung vom Pol zum Südpol (bei Polen der unteren Halbkugel zum Nordpol). Ihr Schnittpunkt mit der Äquatorebene ist der Punkt im Stereogramm.',
  'v-normals': 'Flächennormalen. Ihr Durchstosspunkt durch die Kugel ist der Flächenpol.',
  'reset-all': 'Alle Einstellungen und den gespeicherten Zustand löschen und die App neu starten.',
  // Stereogramm und 3D
  'zone-btn': 'Zone: zwei Flächen oder Pole antippen. Zonenkreis, Zonenachse [uvw] und alle Flächen, die die Zonengleichung hu + kv + lw = 0 erfüllen.',
  'zone-btn-3d': 'Zone: zwei Flächen oder Pole antippen. Zonenkreis, Zonenachse [uvw] und alle Flächen, die die Zonengleichung hu + kv + lw = 0 erfüllen.',
  'angle-btn': 'Winkel: zwei Pole oder Flächen antippen. Normalenwinkel als Grosskreisbogen; bei Punktgruppen auch die Operation, die den einen Pol in den anderen überführt.',
  'angle-btn-3d': 'Winkel: zwei Pole oder Flächen antippen. Normalenwinkel als Grosskreisbogen und Flächenwinkel.',
  'copy-svg': 'Stereogramm als SVG in die Zwischenablage kopieren.',
  'save-svg': 'Stereogramm als SVG-Datei speichern.',
  'view-oblique': 'Schräger Blick auf Kugel, Kristall und Äquatorebene.',
  'view-top': 'Blick entlang c von oben, wie im Stereogramm.',
  'view-side': 'Blick senkrecht zu c: Die Projektionsstrahlen zum Süd- bzw. Nordpol werden sichtbar.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  {
    heading: '#ctl-pg > h2',
    intro: 'Punktgruppe antippen: Das Stereogramm zeigt ihr Symmetriegerüst. Gruppen mit zwei Aufstellungen (z. B. 32) bieten darunter die Wahl der Aufstellung an.',
    ids: [],
  },
  { heading: '#ctl-pg-opts > summary', ids: ['pg-elements', 'pg-object', 'pg-colorful', 'pg-theta', 'pg-phi', 'angle-btn'] },
  {
    heading: '#ctl-poly > h2',
    intro: 'Pol oder Fläche antippen hebt beide hervor: Jede Fläche hat genau einen Pol.',
    ids: ['ex-select', 'sys-select', 'form-select', 'preset-select', 'poly-labels', 'poly-bravais', 'poly-lower', 'poly-facesym', 'poly-frame'],
  },
  { heading: '#ctl-poly-lat > summary', ids: ['lat-ba', 'lat-ca', 'lat-al', 'lat-be', 'lat-ga', 'poly-broken', 'poly-size', 'ctl-ex-dists', 'poly-open', 'poly-aux'] },
  {
    heading: '#sec-view > summary',
    ids: ['v-dircolors', 'v-wulff', 'v-wulffrot', 'v-axes', 'v-sphere', 'v-plane', 'v-rays', 'v-normals', 'zone-btn', 'angle-btn-3d', 'view-side'],
  },
];

const LABELS = {
  'zone-btn': 'Zone', 'angle-btn': 'Winkel', 'angle-btn-3d': 'Winkel', 'view-side': '3D seitlich', 'ctl-ex-dists': 'Abstände der Formen',
};

let tipEl = null, tipFor = null, showTimer = 0;
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

/** Tooltip an einem Element zeigen. */
function showFor(el) {
  tipFor = el;
  tipEl.innerHTML = el.dataset.tip;
  tipEl.hidden = false;
  el.setAttribute('aria-describedby', 'tip');
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
  if (tipFor) tipFor.removeAttribute('aria-describedby');
  tipFor = null;
}

function buildHelpBox(sec) {
  const box = document.createElement('div');
  box.className = 'helpbox';
  const rows = sec.ids.map((id) => {
    const a = anchorOf(id);
    if (!a || a.closest('[hidden]')) return '';
    const lab = LABELS[id] || (a.querySelector('label') || a).textContent.trim().replace(/\s+/g, ' ').replace(/\d[\d.,]*\s*°?$/, '').trim();
    return `<dt>${lab}</dt><dd>${TIPS[id]}</dd>`;
  }).join('');
  box.innerHTML = `${sec.intro ? `<p>${sec.intro}</p>` : ''}${rows ? `<dl>${rows}</dl>` : ''}`;
  return box;
}

/** Tooltips und ⓘ-Erklärungen einrichten. */
export function initHelp() {
  tipEl = document.createElement('div');
  tipEl.id = 'tip';
  tipEl.className = 'tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.hidden = true;
  document.body.appendChild(tipEl);
  for (const [id, text] of Object.entries(TIPS)) setTip(anchorOf(id), text);

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
    if (el && e.target.matches(':focus-visible') && hoverMQ.matches) showFor(el);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('scroll', hideTip, true);

  // Touch: ⓘ an den Abschnittsüberschriften klappt die Erklärungen des Abschnitts auf
  for (const sec of SECTIONS) {
    const h = document.querySelector(sec.heading);
    if (!h) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'infobtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Erklärungen zu diesem Abschnitt');
    btn.innerHTML = '<span aria-hidden="true">i</span>';
    let box = null;
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); // in <summary>: nicht auf- oder zuklappen
      if (box) { box.remove(); box = null; btn.setAttribute('aria-expanded', 'false'); return; }
      const details = h.closest('details');
      if (details) details.open = true;
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
