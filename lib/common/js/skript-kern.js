// Skript: gemeinsame Teile aller Apps der Familie. Inhaltsverzeichnis mit Kennzeichnung der Vertiefungen,
// Links „In der App öffnen“, Nachladen aufwendiger Abbildungen beim Hineinscrollen, Querstriche in SVG-Text.
// Die Abbildungen selbst zeichnet jede App mit ihrem eigenen Code. Stile in css/skript.css.

/** „In der App öffnen“ an die Bildunterschrift einer Abbildung mit data-app (Link-Adresse der App). */
export function appLink(fig, seite = 'index.html') {
  const cap = fig.querySelector('figcaption');
  if (!cap || cap.querySelector('.to-app')) return;
  const a = document.createElement('a');
  a.className = 'to-app';
  a.href = seite + fig.dataset.app;
  a.textContent = fig.closest('.fig-grid5') ? 'App' : 'In der App öffnen';
  cap.append(' ', a);
}

// ------------------------------------------------------------------ Nachladen beim Hineinscrollen
// Für Abbildungen, die viel kosten (z. B. 3D-Ansichten mit WebGL: Browser halten nur wenige Kontexte gleichzeitig,
// Safari auf iPhone/iPad etwa 8). Nur Abbildungen in der Nähe des sichtbaren Bereichs leben: beim Hineinscrollen
// zeigen(fig), beim Verlassen freigeben(fig). Rückgabe: lebt(fig), z. B. um nach einem asynchronen Laden zu prüfen,
// ob die Abbildung inzwischen wieder aus dem Bild gescrollt ist.
export function nachladen(figs, { zeigen, freigeben, fehlertext = 'Die Abbildung konnte nicht geladen werden.', rand = '300px 0px' }) {
  const live = new Set();
  const lebt = (fig) => live.has(fig);
  if (!figs.length) return { lebt };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) { live.delete(e.target); freigeben(e.target); continue; }
      if (live.has(e.target)) continue;
      live.add(e.target);
      let p;
      try { p = Promise.resolve(zeigen(e.target)); } catch (err) { p = Promise.reject(err); }
      p.catch((err) => {
        e.target.querySelector('.fig-art').innerHTML = `<p class="fig-err">${fehlertext}</p>`;
        console.error(err);
      });
    }
  }, { rootMargin: rand });
  figs.forEach((f) => io.observe(f));
  return { lebt };
}

// ------------------------------------------------------------------ Querstriche in gezeichneten Abbildungen
// In SVG-Text sitzt text-decoration: overline auf Höhe der Oberlänge, deutlich zu hoch, und läuft über
// benachbarte Ziffern durch. Deshalb eigene Striche knapp über jeder Ziffer
// (<tspan class="ovs">); Lage aus der gerenderten Schrift, Farbe wie der Text.
export function querstriche() {
  for (const old of document.querySelectorAll('.ovs-bar')) old.remove();
  for (const text of document.querySelectorAll('figure svg text')) {
    const marked = [...text.querySelectorAll('tspan.ovs')];
    if (!marked.length) continue;
    const cs = getComputedStyle(text);
    const fs = parseFloat(cs.fontSize);
    const h = Math.max(1, 0.075 * fs);
    const base = parseFloat(text.getAttribute('y'));
    let i = 0;
    for (const node of text.childNodes) {
      const n = [...node.textContent].length;
      if (node.nodeType === 1 && node.classList.contains('ovs')) {
        for (let k = 0; k < n; k++) {
          const e = text.getExtentOfChar(i + k);
          const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          r.setAttribute('class', 'ovs-bar');
          r.setAttribute('x', (e.x + 0.09 * fs).toFixed(1));
          r.setAttribute('y', (base - 0.82 * fs - h).toFixed(1));
          r.setAttribute('width', Math.max(1, e.width - 0.18 * fs).toFixed(1));
          r.setAttribute('height', h.toFixed(2));
          r.style.fill = cs.fill;
          text.after(r);
        }
      }
      i += n;
    }
  }
}

// ------------------------------------------------------------------ Inhaltsverzeichnis
export function inhaltsverzeichnis() {
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const secs = [...document.querySelectorAll('main section[id]')].filter((s) => byId.has(s.id));
  if (!secs.length) return;
  // Vertiefungen im Inhaltsverzeichnis kennzeichnen; die Einstufung steht nur am Abschnitt (data-level)
  for (const s of secs) {
    if (s.dataset.level !== 'vertiefung') continue;
    // ganze Kapitel: Randlinie am Eintrag (unter der Zwischenüberschrift „Vertiefungen“)
    if (s.parentElement.tagName === 'ARTICLE') { byId.get(s.id).parentElement.classList.add('vertiefung'); continue; }
    const tag = document.createElement('span');
    tag.className = 'etikett';
    tag.textContent = 'Vertiefung';
    byId.get(s.id).append(tag);
  }
  const io = new IntersectionObserver(() => {
    // aktueller Abschnitt: der letzte, dessen Anfang oberhalb der Bildschirmmitte liegt
    let cur = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top < window.innerHeight * 0.35) cur = s;
    for (const a of links) a.removeAttribute('aria-current');
    byId.get(cur.id)?.setAttribute('aria-current', 'true');
  }, { threshold: [0, 1], rootMargin: '0px 0px -60% 0px' });
  secs.forEach((s) => io.observe(s));
  // Telefon: Inhaltsverzeichnis nach Auswahl schliessen
  const det = document.querySelector('.toc details');
  if (det && window.matchMedia('(max-width: 899px)').matches) det.open = false;
  for (const a of links) a.addEventListener('click', () => { if (det && window.matchMedia('(max-width: 899px)').matches) det.open = false; });
}
