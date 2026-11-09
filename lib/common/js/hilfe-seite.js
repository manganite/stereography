// Hilfeseite einer App (Leitfaden Abschn. 5.3, #24): Anleitungen aus den Erste Schritten je Modus, mit Bildern der
// Bedienung und Knöpfen in die App, dazu die Experimente als Liste. Die Texte sind Daten der App (hilfetexte.js);
// die App beschreibt ihre Hilfeseite in js/hilfe-daten.js (Typ HilfeDaten), die Seite selbst in hilfe.html.
//
// Bilder: tools/hilfe-bilder.mjs erzeugt je Schritt mit `zeige` (Selektor des Bedienelements) einen Ausschnitt der
// App im hellen Modus, das Element markiert, unter hilfe/<Ablauf>-<Nr>.png. pruefeHilfe() ist für die Tests der App.

import { erzeugt, ohneHTML, nachKapitel, kapitelTitel } from './ablauf.js';

/** @import { Ablauf, Experiment, Schritt } from './ablauf.js' */
/** @import { Kapitel } from './quiz-core.js' */

/**
 * Modus der App: Kennung wie in `Ablauf.modus`, Name wie auf dem Tab, Link-Adresse, die ihn wählt (z. B. `#m=form`).
 * @typedef {{ id: string, name: string, hash: string }} HilfeModus
 */
/**
 * Daten der Hilfeseite. app: Seite der App (Standard index.html), bilder: Ordner der Bilder (Standard hilfe/),
 * kapitel: Kapitel des Skripts wie im Quiz; die Experimente eines Modus werden damit wie in der App gegliedert (#107).
 * @typedef {{ modi: HilfeModus[], ersteSchritte: Ablauf[], experimente: Experiment[], app?: string, bilder?: string,
 *   kapitel?: readonly Kapitel[] }} HilfeDaten
 */
/**
 * Ein Bild der Hilfeseite: Dateiname (ohne Ordner), Link-Adresse des Zustands vor dem Schritt, Selektor des
 * markierten Bedienelements, Ablauf und Nummer des Schritts (ab 1).
 * @typedef {{ datei: string, adresse: string, zeige: string, ablauf: string, nr: number }} HilfeBild
 */

/** Name des Parameters, mit dem die Hilfeseite ein Experiment in der App startet (`index.html?experiment=<id>#…`). */
export const EXPERIMENT_PARAM = 'experiment';

/** Attributwert maskieren. @param {string} s */
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** @param {HilfeDaten} d @param {string | undefined} id */
const modusVon = (d, id) => d.modi.find((m) => m.id === id) ?? d.modi[0];

/**
 * Die Bilder der Anleitungen: je Schritt mit `zeige` eines. Zustand im Bild: `bild` des Schritts, sonst die Adresse
 * des letzten Schritts davor, der eine hat (`handlung.hash` oder `bild`), sonst die des Modus. Aktionen der App
 * (`handlung.aktion`) wirken nicht auf die Bilder; ein Schritt nach einer Aktion braucht deshalb `bild`, wenn sein
 * Bild deren Wirkung zeigen soll.
 * @param {HilfeDaten} d
 * @returns {HilfeBild[]}
 */
export function hilfeBilder(d) {
  /** @type {HilfeBild[]} */
  const bilder = [];
  for (const a of d.ersteSchritte) {
    let adresse = modusVon(d, a.modus)?.hash ?? '';
    a.schritte.forEach((s, i) => {
      if (s.bild) adresse = s.bild;
      if (s.zeige) bilder.push({ datei: `${a.id}-${i + 1}.png`, adresse, zeige: s.zeige, ablauf: a.id, nr: i + 1 });
      if (s.handlung?.hash) adresse = s.handlung.hash;
    });
  }
  return bilder;
}

/** Erster Schritt eines Experiments (bei einem erzeugten der zum ersten Parameter, als Beispiel). @param {Experiment} e @returns {Schritt | undefined} */
const ersterSchritt = (e) => {
  if (!erzeugt(e)) return e.schritte[0];
  const p = e.params();
  return p.length ? e.make(p[0])[0] : undefined;
};

/**
 * Inhalt der Hilfeseite als HTML: je Modus ein Kapitel mit den Erste Schritten als Anleitung und den Experimenten als
 * Liste. Texte stammen aus den Daten der App (HTML erlaubt, Leitfaden Abschn. 9).
 * @param {HilfeDaten} d
 */
export function hilfeHTML(d) {
  const app = d.app ?? 'index.html', ordner = d.bilder ?? 'hilfe/';
  const bilder = new Map(hilfeBilder(d).map((b) => [`${b.ablauf}:${b.nr}`, b]));
  return d.modi.map((m) => {
    const anleitungen = d.ersteSchritte.filter((a) => (a.modus ?? d.modi[0].id) === m.id).map((a) => {
      const schritte = a.schritte.map((s, i) => {
        const bild = bilder.get(`${a.id}:${i + 1}`);
        const h = s.handlung;
        const alt = `Ausschnitt der App${h ? `: ${ohneHTML(h.text)}` : ''}, das Bedienelement ist markiert`;
        return `<li class="hilfe-schritt">
  <p>${s.frage}</p>
  ${bild ? `<figure class="hilfe-bild"><img src="${attr(ordner + bild.datei)}" alt="${attr(alt)}" loading="lazy"></figure>` : ''}
  ${h?.hash ? `<p><a class="to-app" href="${attr(app + h.hash)}">In der App zeigen</a></p>` : ''}
</li>`;
      }).join('\n');
      return `<section class="hilfe-anleitung" id="${attr(a.id)}">
<h3>${a.titel}</h3>
<p><a class="to-app" href="${attr(app + m.hash)}">App im Modus „${m.name}“ öffnen</a></p>
<ol class="hilfe-schritte">
${schritte}
</ol>
</section>`;
    }).join('\n');
    /** @param {Experiment} e */
    const punkt = (e) => {
      const s = ersterSchritt(e);
          const href = `${app}?${EXPERIMENT_PARAM}=${encodeURIComponent(e.id)}${m.hash}`;
      const neu = erzeugt(e) ? ' <span class="hilfe-erzeugt" aria-hidden="true">↻</span><span class="sr"> (immer neue Aufgaben)</span>' : '';
      return `<li><b>${e.titel}</b>${neu}${s ? `<br>${s.frage}` : ''}
  <br><a class="to-app" href="${attr(href)}">In der App ausprobieren</a></li>`;
    };
    // wie in der App ab GLIEDERN_AB Experimenten nach Kapiteln gegliedert (ablauf.js, #107)
    // ein Experiment ohne Modus erscheint wie in der App (ablaufKarte) in jedem Modus
    const gruppen = nachKapitel(d.experimente.filter((e) => e.modus === undefined || e.modus === m.id), d.kapitel);
    const liste = gruppen.some((g) => g.eintraege.length) ? gruppen.map((g) => `${gruppen.length > 1 || g.kapitel ? `<h4>${kapitelTitel(g.kapitel)}</h4>\n` : ''}<ul class="hilfe-liste">
${g.eintraege.map(punkt).join('\n')}
</ul>`).join('\n') : '';
    if (!anleitungen && !liste) return '';
    return `<section class="hilfe-modus" id="modus-${attr(m.id)}">
<h2>${m.name}</h2>
${anleitungen}
${liste ? `<section class="hilfe-experimente" id="experimente-${attr(m.id)}">
<h3>Experimente</h3>
<p>Erst vermuten, dann in der App ausprobieren. Die Auflösung zeigt die App.</p>
${liste}
</section>` : ''}
</section>`;
  }).filter(Boolean).join('\n');
}

/**
 * Inhaltsverzeichnis der Hilfeseite (Modi, darunter Anleitungen und Experimente) als HTML-Liste.
 * @param {HilfeDaten} d
 */
export function hilfeInhalt(d) {
  return `<ol>${d.modi.map((m) => {
    const unter = [
      ...d.ersteSchritte.filter((a) => (a.modus ?? d.modi[0].id) === m.id).map((a) => `<li><a href="#${attr(a.id)}">${a.titel}</a></li>`),
      ...(d.experimente.some((e) => e.modus === undefined || e.modus === m.id) ? [`<li><a href="#experimente-${attr(m.id)}">Experimente</a></li>`] : []),
    ];
    if (!unter.length) return '';
    return `<li><a href="#modus-${attr(m.id)}">${m.name}</a><ol>${unter.join('')}</ol></li>`;
  }).join('')}</ol>`;
}

/**
 * Hilfeseite füllen: Inhalt in `ziel`, Inhaltsverzeichnis in `inhalt` (falls angegeben).
 * @param {HTMLElement} ziel @param {HilfeDaten} d @param {HTMLElement} [inhalt]
 */
export function hilfeSeite(ziel, d, inhalt) {
  ziel.insertAdjacentHTML('beforeend', hilfeHTML(d));
  if (inhalt) inhalt.innerHTML = hilfeInhalt(d);
  // Bilder mit doppelter Auflösung (deviceScaleFactor 2) in ihrer Grösse in der App zeigen
  for (const img of ziel.querySelectorAll('.hilfe-bild img')) {
    if (!(img instanceof HTMLImageElement)) continue;
    const setzen = () => { if (img.naturalWidth) img.style.width = `${img.naturalWidth / 2}px`; };
    if (img.complete) setzen(); else img.addEventListener('load', setzen, { once: true });
  }
  // Sprung an einen Anker, nachdem der Inhalt steht (ein fehlerhafter Anker wird übergangen)
  let anker = location.hash.slice(1);
  try { anker = decodeURIComponent(anker); } catch { /* wie geschrieben */ }
  if (anker) document.getElementById(anker)?.scrollIntoView();
}

/**
 * In der App: Experiment aus der Adresse starten (`?experiment=<id>`, von der Hilfeseite). Entfernt den Parameter
 * aus der Adresse und gibt die gestartete Kennung zurück (sonst null). `ids`: Kennungen der Experimente der App;
 * `oeffnen`: macht die Karte sichtbar (Abschnitt „Experimente“ aufklappen), vor dem Start, damit der Fokus auf der
 * Frage landet.
 * @param {{ starte: (id: string) => void }} karte @param {string[]} ids @param {() => void} [oeffnen]
 * @returns {string | null}
 */
export function experimentAusAdresse(karte, ids, oeffnen) {
  const url = new URL(location.href);
  const id = url.searchParams.get(EXPERIMENT_PARAM);
  if (id === null) return null;
  url.searchParams.delete(EXPERIMENT_PARAM);
  history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  if (!ids.includes(id)) return null;
  oeffnen?.();
  karte.starte(id);
  return id;
}

/**
 * Prüft die Daten der Hilfeseite, für die Tests der App: Modi der Abläufe bekannt, Adressen der Modi, jedes `zeige`
 * beginnt mit `#id` und diese ID steht im HTML der App (der Rest des Selektors und Elemente, die erst das Programm
 * erzeugt, prüft erst tools/hilfe-bilder.mjs), zu jedem Bild eine Datei, keine überzähligen Bilder, erzeugte
 * Experimente mit Parametern. Rückgabe: Liste der Fehler. html: Inhalt von index.html; dateien: Namen der Dateien im
 * Ordner der Bilder.
 * @param {HilfeDaten} d @param {{ html: string, dateien: string[] }} o
 */
export function pruefeHilfe(d, { html, dateien }) {
  /** @type {string[]} */
  const fehler = [];
  const modi = new Set(d.modi.map((m) => m.id));
  for (const a of [...d.ersteSchritte, ...d.experimente]) {
    if (a.modus !== undefined && !modi.has(a.modus)) fehler.push(`${a.id}: unbekannter Modus ${a.modus}`);
  }
  for (const m of d.modi) if (!m.hash.startsWith('#')) fehler.push(`Modus ${m.id}: Adresse muss mit # beginnen`);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
  const bilder = hilfeBilder(d);
  for (const b of bilder) {
    const id = b.zeige.match(/^#([\w-]+)/)?.[1];
    if (!id) fehler.push(`${b.ablauf}, Schritt ${b.nr}: zeige muss mit #id beginnen (${b.zeige})`);
    else if (!ids.has(id)) fehler.push(`${b.ablauf}, Schritt ${b.nr}: Element #${id} fehlt in der App`);
    if (!dateien.includes(b.datei)) fehler.push(`${b.ablauf}, Schritt ${b.nr}: Bild ${b.datei} fehlt (node tools/common/hilfe-bilder.mjs)`);
  }
  for (const e of d.experimente) if (erzeugt(e) && !e.params().length) fehler.push(`${e.id}: keine Parameter`);
  const erwartet = new Set(bilder.map((b) => b.datei));
  for (const f of dateien) if (f.endsWith('.png') && !erwartet.has(f)) fehler.push(`überzähliges Bild ${f}`);
  return fehler;
}
