// Hilfeseite einer App (Leitfaden Abschn. 5.3, #24, #114): eine Anleitung zur Bedienung. Aufbau (Entscheidung Thomas,
// 15.11.2026): Überblick (Zweck, Teile, Modi, Aufbau der Werkbank), Bedienkonzepte, je Modus Nachschlagen (Seitenleiste,
// Tafeln, Kenndaten), Anleitungen und Experimente, dann typische Fragen und zuletzt Link, Speicher, offline, Export,
// Geräte und Tastatur. Gemeinsame Texte in js/hilfe-gemeinsam.js, die der App in ihrer js/hilfe-daten.js (Typ HilfeDaten),
// die Seite selbst in hilfe.html.
//
// Bilder: tools/hilfe-bilder.mjs erzeugt sie im hellen Modus unter hilfe/: je Schritt einer Anleitung mit `zeige` einen
// Ausschnitt mit umrahmtem Bedienelement (<Ablauf>-<Nr>.png), je Bereich zum Nachschlagen einen Ausschnitt mit
// nummerierten Marken (<Modus>-<Bereich>.png, im Überblick <Bereich>.png). pruefeHilfe() ist für die Tests der App.

import { erzeugt, ohneHTML, nachKapitel, kapitelTitel } from './ablauf.js';
import { UEBERBLICK, KONZEPTE, TECHNIK } from './hilfe-gemeinsam.js';

/** @import { Ablauf, BildHandlung, Experiment, Schritt } from './ablauf.js' */
/** @import { Kapitel } from './quiz-core.js' */

/**
 * Modus der App: Kennung wie in `Ablauf.modus`, Name wie auf dem Tab, Link-Adresse, die ihn wählt (z. B. `#m=form`),
 * zweck: wozu er dient (HTML ohne Blockelemente, ein bis zwei Sätze; die Seite setzt ihn in ein `<p>` bzw. `<li>`).
 * @typedef {{ id: string, name: string, hash: string, zweck?: string }} HilfeModus
 */
/** Abschnitt mit Text (HTML): Bedienkonzept oder gemeinsamer Text. @typedef {{ id: string, titel: string, text: string }} HilfeText */
/**
 * Eintrag eines Bereichs: Name und Erklärung (HTML). zeige: Selektor des Elements, das im Bild eine nummerierte Marke
 * bekommt (möglichst mit `#id` am Anfang, dann prüft pruefeHilfe die ID; sonst z. B. `header.top`); Einträge ohne `zeige` stehen ohne Nummer darunter. id: Anker des Eintrags (auf der Seite
 * `<Modus>-<id>`), z. B. Ziel eines ⓘ.
 * @typedef {{ id?: string, zeige?: string, name: string, text: string }} HilfeEintrag
 */
/**
 * Bereich zum Nachschlagen (Seitenleiste, Tafel, Kenndaten) in einem Modus; ohne `modus` in jedem Modus, je mit eigenem
 * Bild. text: Einleitung (HTML mit Absätzen `<p>`); Name und Text eines Eintrags ohne Blockelemente. Anker auf der Seite `<Modus>-<id>`. Das Bild zeigt den Ausschnitt `ausschnitt` (Selektor; ohne: der Baustein um
 * die Marken, z. B. Karte oder Tafel) im Zustand `adresse` (ohne: die Adresse des Modus), die Einträge mit `zeige`
 * nummeriert in ihrer Reihenfolge.
 * @typedef {{ id: string, modus?: string, titel: string, text?: string, ausschnitt?: string, adresse?: string,
 *   eintraege: HilfeEintrag[] }} HilfeBereich
 */
/**
 * Typische Frage: Antwort (HTML), app: Link-Adresse, die es in der App zeigt, skript: Anker im Skript.
 * @typedef {{ id: string, frage: string, antwort: string, app?: string, skript?: string }} HilfeFrage
 */
/**
 * Daten der Hilfeseite. modi: Modi der App; zweck: Zweck der App (HTML mit Absätzen `<p>`); ueberblick: Bereich „Aufbau der App“ (Bild der
 * ganzen App, Anker `aufbau`); konzepte: Bedienkonzepte der App (nach den gemeinsamen); bereiche: zum Nachschlagen je
 * Modus; ersteSchritte und anleitungen: Anleitungen je Modus (gleicher Typ, die Erste Schritte auch als Karte in der
 * App, die anleitungen nur hier); experimente: wie in der App; fragen: typische Fragen. ergaenzungen: HTML, das an einen
 * gemeinsamen Text (js/hilfe-gemeinsam.js, nach Kennung) angehängt wird; ohne: gemeinsame Texte, die für die App nicht
 * gelten. repo: GitHub-Repository (`owner/name`) für Rückmeldungen. app: Seite der App (Standard index.html), skript:
 * Seite des Skripts (Standard skript.html), bilder: Ordner der Bilder (Standard hilfe/), kapitel: Kapitel des Skripts wie
 * im Quiz (#107).
 * @typedef {{ modi: HilfeModus[], ersteSchritte: Ablauf[], experimente: Experiment[], zweck?: string,
 *   ueberblick?: HilfeBereich, konzepte?: HilfeText[], bereiche?: HilfeBereich[], anleitungen?: Ablauf[],
 *   fragen?: HilfeFrage[], ergaenzungen?: Record<string, string>, ohne?: string[], repo?: string, app?: string,
 *   skript?: string, bilder?: string, kapitel?: readonly Kapitel[] }} HilfeDaten
 */
/**
 * Ein Bild der Hilfeseite: Dateiname (ohne Ordner), Link-Adresse des Zustands, Bedienhandlungen davor (`vorher` des
 * Schritts: Klick auf einen Selektor oder Ziehen über Punkte in Bruchteilen seiner Breite und Höhe), Selektoren der
 * markierten Elemente (nummeriert, wenn `nummern`, sonst umrahmt), Ausschnitt (Selektor) und Herkunft für Meldungen.
 * @typedef {{ datei: string, adresse: string, vorher?: BildHandlung[], zeige: string[], nummern: boolean, ausschnitt?: string,
 *   quelle: string }} HilfeBild
 */

/** Name des Parameters, mit dem die Hilfeseite ein Experiment in der App startet (`index.html?experiment=<id>#…`). */
export const EXPERIMENT_PARAM = 'experiment';

/** Attributwert maskieren. @param {string} s */
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** @param {HilfeDaten} d @param {string | undefined} id */
const modusVon = (d, id) => d.modi.find((m) => m.id === id) ?? d.modi[0];
/** Anleitungen eines Modus (ohne Modus: der erste). @param {HilfeDaten} d @param {HilfeModus} m */
const anleitungenIn = (d, m) => [...d.ersteSchritte, ...(d.anleitungen ?? [])].filter((a) => (a.modus ?? d.modi[0].id) === m.id);
/** Bereiche eines Modus (ohne Modus: jeder). @param {HilfeDaten} d @param {HilfeModus} m */
const bereicheIn = (d, m) => (d.bereiche ?? []).filter((b) => b.modus === undefined || b.modus === m.id);
/** Experimente eines Modus (ohne Modus: jeder, wie in der App). @param {HilfeDaten} d @param {HilfeModus} m */
const experimenteIn = (d, m) => d.experimente.filter((e) => e.modus === undefined || e.modus === m.id);
/** Gemeinsame Texte einer Gruppe ohne die ausgelassenen. @param {HilfeDaten} d @param {readonly HilfeText[]} liste */
const gemeinsam = (d, liste) => liste.filter((t) => !(d.ohne ?? []).includes(t.id));

/** Anker eines Bereichs bzw. Eintrags in einem Modus. @param {HilfeModus} m @param {string} id */
const imModus = (m, id) => `${m.id}-${id}`;
/** Dateiname des Bildes eines Bereichs (ohne Modus: der Überblick). @param {HilfeBereich} b @param {HilfeModus} [m] */
const bereichDatei = (b, m) => `${m ? imModus(m, b.id) : b.id}.png`;

/**
 * Die Bilder der Hilfeseite. Anleitungen: je Schritt mit `zeige` eines; Zustand `bild` des Schritts, sonst die Adresse
 * des letzten Schritts davor, der eine hat (`handlung.hash` oder `bild`), sonst die des Modus. Aktionen der App
 * (`handlung.aktion`) wirken nicht auf die Bilder; ein Schritt nach einer Aktion braucht deshalb `bild`, wenn sein
 * Bild deren Wirkung zeigen soll, und `vorher` für Zustand, der nicht in der Adresse steht (gilt nur für sein Bild). Bereiche: je Bereich und Modus eines, wenn er Einträge mit `zeige` hat.
 * @param {HilfeDaten} d
 * @returns {HilfeBild[]}
 */
export function hilfeBilder(d) {
  /** @type {HilfeBild[]} */
  const bilder = [];
  /** @param {HilfeBereich} b @param {HilfeModus} m @param {HilfeModus} [imm] */
  const bereich = (b, m, imm) => {
    const zeige = b.eintraege.flatMap((e) => (e.zeige ? [e.zeige] : []));
    if (zeige.length) bilder.push({ datei: bereichDatei(b, imm), adresse: b.adresse ?? m.hash, zeige, nummern: true, ...(b.ausschnitt ? { ausschnitt: b.ausschnitt } : {}), quelle: imm ? imModus(imm, b.id) : b.id });
  };
  if (d.ueberblick) bereich(d.ueberblick, d.modi[0]);
  for (const m of d.modi) for (const b of bereicheIn(d, m)) bereich(b, m, m);
  for (const a of [...d.ersteSchritte, ...(d.anleitungen ?? [])]) {
    let adresse = modusVon(d, a.modus)?.hash ?? '';
    a.schritte.forEach((s, i) => {
      if (s.bild) adresse = s.bild;
      if (s.zeige) bilder.push({ datei: `${a.id}-${i + 1}.png`, adresse, ...(s.vorher ? { vorher: s.vorher } : {}), zeige: [s.zeige], nummern: false, quelle: `${a.id}, Schritt ${i + 1}` });
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

/** Bild als HTML. @param {string} src @param {string} alt */
const bildHTML = (src, alt) => `<figure class="hilfe-bild"><img src="${attr(src)}" alt="${attr(alt)}"></figure>`;

/**
 * Gemeinsamer Text mit Ergänzung der App, als Abschnitt mit Überschrift (h3) und Anker `<praefix><id>`.
 * @param {HilfeDaten} d @param {HilfeText} t @param {string} praefix
 */
const textHTML = (d, t, praefix) => `<section class="hilfe-text" id="${attr(praefix + t.id)}">
<h3>${t.titel}</h3>
${t.text}${d.ergaenzungen?.[t.id] ?? ''}
</section>`;

/**
 * Bereich zum Nachschlagen: Text, Bild mit nummerierten Marken, nummerierte Liste (Einträge mit `zeige`), weitere
 * Einträge ohne Nummer. m: Modus (ohne: Überblick).
 * @param {HilfeDaten} d @param {HilfeBereich} b @param {HilfeModus} [m]
 */
function bereichHTML(d, b, m) {
  const anker = m ? imModus(m, b.id) : b.id;
  /** @param {HilfeEintrag} e */
  const li = (e) => `<li${e.id ? ` id="${attr(m ? imModus(m, e.id) : e.id)}"` : ''}><b>${e.name}</b>: ${e.text}</li>`;
  const nummeriert = b.eintraege.filter((e) => e.zeige), weitere = b.eintraege.filter((e) => !e.zeige);
  const bild = nummeriert.length ? bildHTML((d.bilder ?? 'hilfe/') + bereichDatei(b, m), `Ausschnitt der App: ${ohneHTML(b.titel)}, die Bedienelemente nummeriert wie in der Liste darunter`) : '';
  return `<section class="hilfe-bereich" id="${attr(anker)}">
<h3>${b.titel}</h3>
${b.text ?? ''}
${bild}
${nummeriert.length ? `<ol class="hilfe-marken">\n${nummeriert.map(li).join('\n')}\n</ol>` : ''}
${weitere.length ? `<ul class="hilfe-weitere">\n${weitere.map(li).join('\n')}\n</ul>` : ''}
</section>`;
}

/**
 * Anleitung (Erste Schritte oder weitere): je Schritt Text, Bild und, bei einer Link-Adresse, „In der App zeigen“.
 * @param {HilfeDaten} d @param {Ablauf} a @param {HilfeModus} m @param {Map<string, HilfeBild>} bilder
 */
function anleitungHTML(d, a, m, bilder) {
  const app = d.app ?? 'index.html', ordner = d.bilder ?? 'hilfe/';
  const schritte = a.schritte.map((s, i) => {
    const bild = bilder.get(`${a.id}-${i + 1}.png`);
    const h = s.handlung;
    const alt = `Ausschnitt der App${h ? `: ${ohneHTML(h.text)}` : ''}, das Bedienelement ist markiert`;
    return `<li class="hilfe-schritt">
  <p>${s.frage}</p>
  ${bild ? bildHTML(ordner + bild.datei, alt) : ''}
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
}

/**
 * Experimente eines Modus als Liste, nach Kapiteln wie in der App (nachKapitel in ablauf.js, #107); ein Experiment ohne
 * Modus erscheint wie in der App (ablaufKarte) in jedem Modus. Leer, wenn es keine gibt.
 * @param {HilfeDaten} d @param {HilfeModus} m
 */
function experimenteHTML(d, m) {
  const app = d.app ?? 'index.html';
  /** @param {Experiment} e */
  const punkt = (e) => {
    const s = ersterSchritt(e);
    const href = `${app}?${EXPERIMENT_PARAM}=${encodeURIComponent(e.id)}${m.hash}`;
    const neu = erzeugt(e) ? ' <span class="hilfe-erzeugt" aria-hidden="true">↻</span><span class="sr"> (immer neue Aufgaben)</span>' : '';
    return `<li><b>${e.titel}</b>${neu}${s ? `<br>${s.frage}` : ''}
  <br><a class="to-app" href="${attr(href)}">In der App ausprobieren</a></li>`;
  };
  const gruppen = nachKapitel(experimenteIn(d, m), d.kapitel);
  if (!gruppen.some((g) => g.eintraege.length)) return '';
  const liste = gruppen.map((g) => `${gruppen.length > 1 || g.kapitel ? `<h4>${kapitelTitel(g.kapitel)}</h4>\n` : ''}<ul class="hilfe-liste">
${g.eintraege.map(punkt).join('\n')}
</ul>`).join('\n');
  return `<section class="hilfe-experimente" id="experimente-${attr(m.id)}">
<h3>Experimente</h3>
<p>Erst vermuten, dann in der App ausprobieren. Die Auflösung zeigt die App.</p>
${liste}
</section>`;
}

/**
 * Inhalt der Hilfeseite als HTML (Aufbau oben). Texte stammen aus den Daten der App und aus js/hilfe-gemeinsam.js
 * (HTML erlaubt, Leitfaden Abschn. 9).
 * @param {HilfeDaten} d
 */
export function hilfeHTML(d) {
  const app = d.app ?? 'index.html', skript = d.skript ?? 'skript.html';
  const bilder = new Map(hilfeBilder(d).map((b) => [b.datei, b]));
  const teile = [];

  // Überblick: Zweck, Teile, Modi, Aufbau der Werkbank, Familie, Rückmeldung
  const [teileText, ...uebrige] = gemeinsam(d, UEBERBLICK);
  const modi = d.modi.some((m) => m.zweck) ? `<section class="hilfe-text" id="modi">
<h3>Die Modi</h3>
<ul class="hilfe-modi">
${d.modi.map((m) => `<li><a href="#modus-${attr(m.id)}"><b>${m.name}</b></a>${m.zweck ? `: ${m.zweck}` : ''}</li>`).join('\n')}
</ul>
</section>` : '';
  const rueckmeldung = d.repo ? `<section class="hilfe-text" id="rueckmeldung">
<h3>Rückmeldung</h3>
<p>Einen Fehler gefunden, einen fachlichen Hinweis oder einen Vorschlag? Über
<a href="https://github.com/${attr(d.repo)}/issues/new/choose">GitHub</a> gibt es dafür je eine Vorlage.</p>
</section>` : '';
  teile.push(`<section class="hilfe-teil" id="ueberblick">
<h2>Überblick</h2>
${d.zweck ?? ''}
${teileText ? textHTML(d, teileText, '') : ''}
${modi}
${d.ueberblick ? bereichHTML(d, d.ueberblick) : ''}
${uebrige.map((t) => textHTML(d, t, '')).join('\n')}
${rueckmeldung}
</section>`);

  // Bedienkonzepte: gemeinsame, dann die der App
  const konzepte = [...gemeinsam(d, KONZEPTE), ...(d.konzepte ?? [])];
  if (konzepte.length) teile.push(`<section class="hilfe-teil" id="konzepte">
<h2>Bedienkonzepte</h2>
${konzepte.map((t) => textHTML(d, t, 'konzept-')).join('\n')}
</section>`);

  // je Modus: Zweck, Nachschlagen, Anleitungen, Experimente
  for (const m of d.modi) {
    const inhalt = [
      ...bereicheIn(d, m).map((b) => bereichHTML(d, b, m)),
      ...anleitungenIn(d, m).map((a) => anleitungHTML(d, a, m, bilder)),
      experimenteHTML(d, m),
    ].filter(Boolean);
    if (!inhalt.length) continue;
    teile.push(`<section class="hilfe-modus" id="modus-${attr(m.id)}">
<h2>${m.name}</h2>
${m.zweck ? `<p>${m.zweck}</p>` : ''}
${inhalt.join('\n')}
</section>`);
  }

  // typische Fragen
  if (d.fragen?.length) teile.push(`<section class="hilfe-teil" id="fragen">
<h2>Typische Fragen</h2>
${d.fragen.map((f) => {
    const links = [
      ...(f.app ? [`<a class="to-app" href="${attr(app + f.app)}">In der App zeigen</a>`] : []),
      ...(f.skript ? [`<a href="${attr(`${skript}#${f.skript}`)}">Im Skript nachlesen</a>`] : []),
    ];
    return `<section class="hilfe-frage" id="frage-${attr(f.id)}">
<h3>${f.frage}</h3>
${f.antwort}
${links.length ? `<p class="hilfe-links">${links.join(' · ')}</p>` : ''}
</section>`;
  }).join('\n')}
</section>`);

  // Link, Speicher, offline, Export, Geräte, Tastatur
  const technik = gemeinsam(d, TECHNIK);
  if (technik.length) teile.push(`<section class="hilfe-teil" id="technik">
<h2>Link, Speicher, offline und Geräte</h2>
${technik.map((t) => textHTML(d, t, 'technik-')).join('\n')}
</section>`);
  return teile.join('\n');
}

/**
 * Inhaltsverzeichnis der Hilfeseite als HTML-Liste: die Teile, darunter ihre Abschnitte.
 * @param {HilfeDaten} d
 */
export function hilfeInhalt(d) {
  /** @param {string} anker @param {string} titel */
  const a = (anker, titel) => `<a href="#${attr(anker)}">${titel}</a>`;
  /** @param {string} anker @param {string} titel @param {string[]} unter */
  const punkt = (anker, titel, unter) => `<li>${a(anker, titel)}${unter.length ? `<ol>${unter.map((u) => `<li>${u}</li>`).join('')}</ol>` : ''}</li>`;
  const [teileText, ...uebrige] = gemeinsam(d, UEBERBLICK);
  const punkte = [punkt('ueberblick', 'Überblick', [
    ...(teileText ? [a(teileText.id, teileText.titel)] : []),
    ...(d.modi.some((m) => m.zweck) ? [a('modi', 'Die Modi')] : []),
    ...(d.ueberblick ? [a(d.ueberblick.id, d.ueberblick.titel)] : []),
    ...uebrige.map((t) => a(t.id, t.titel)),
    ...(d.repo ? [a('rueckmeldung', 'Rückmeldung')] : []),
  ])];
  const konzepte = [...gemeinsam(d, KONZEPTE), ...(d.konzepte ?? [])];
  if (konzepte.length) punkte.push(punkt('konzepte', 'Bedienkonzepte', konzepte.map((t) => a(`konzept-${t.id}`, t.titel))));
  for (const m of d.modi) {
    const unter = [
      ...bereicheIn(d, m).map((b) => a(imModus(m, b.id), b.titel)),
      ...anleitungenIn(d, m).map((x) => a(x.id, x.titel)),
      ...(experimenteIn(d, m).length ? [a(`experimente-${m.id}`, 'Experimente')] : []),
    ];
    if (unter.length) punkte.push(punkt(`modus-${m.id}`, m.name, unter));
  }
  if (d.fragen?.length) punkte.push(punkt('fragen', 'Typische Fragen', []));
  const technik = gemeinsam(d, TECHNIK);
  if (technik.length) punkte.push(punkt('technik', 'Link, Speicher, offline und Geräte', technik.map((t) => a(`technik-${t.id}`, t.titel))));
  return `<ol>${punkte.join('')}</ol>`;
}

/**
 * Alle Anker der Hilfeseite (Teile, Abschnitte, Bereiche, Einträge mit id, Anleitungen, Experimente, Fragen), z. B. für
 * die Verweise aus dem ⓘ (`Abschnitt.hilfe` in help.js), in der Reihenfolge der Seite; doppelte bleiben doppelt.
 * @param {HilfeDaten} d
 * @returns {string[]}
 */
export function hilfeAnker(d) {
  return [...hilfeHTML(d).matchAll(/\sid="([^"]+)"/g)].map((x) => x[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
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
  // Sprung an einen Anker, nachdem der Inhalt steht (ein fehlerhafter Anker wird übergangen). Die Bilder haben ihre Höhe
  // erst nach dem Laden; der Sprung wird deshalb wiederholt, bis alle geladen sind, solange man nicht selbst scrollt (die
  // Verweise aus dem ⓘ führen tief in die Seite; Safari hält die Lage beim Nachladen nicht)
  let anker = location.hash.slice(1);
  try { anker = decodeURIComponent(anker); } catch { /* wie geschrieben */ }
  const sprung = anker ? document.getElementById(anker) : null;
  if (sprung) {
    sprung.scrollIntoView();
    let selbst = false;
    const stopp = () => { selbst = true; };
    for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) addEventListener(ev, stopp, { once: true, passive: true });
    const offen = [...ziel.querySelectorAll('.hilfe-bild img')].filter((i) => i instanceof HTMLImageElement && !i.complete);
    for (const img of offen) img.addEventListener('load', () => { if (!selbst) sprung.scrollIntoView(); }, { once: true });
  }
}

/**
 * In der App: Experiment aus der Adresse starten (`?experiment=<id>`, von der Hilfeseite). Entfernt den Parameter aus
 * der Adresse und gibt die gestartete Kennung zurück (sonst null). experimente: die Experimente der App (Kennung und
 * Modus). o.modusWaehlen: wechselt in den Modus des Experiments, bevor es startet (sonst beendete der Abgleich der Karte
 * ein Experiment aus einem anderen Modus gleich wieder; #114); o.einstiegSchliessen: schliesst die Karte „Erste Schritte“,
 * die ohne Zustand in der Adresse sonst zugleich erschiene; o.oeffnen: macht die Karte der Experimente sichtbar
 * (Abschnitt aufklappen), vor dem Start, damit der Fokus auf der Frage landet.
 * @param {{ starte: (id: string) => void }} karte
 * @param {readonly { id: string, modus?: string }[]} experimente
 * @param {{ modusWaehlen?: (modus: string) => void, einstiegSchliessen?: () => void, oeffnen?: () => void }} [o]
 * @returns {string | null}
 */
export function experimentAusAdresse(karte, experimente, o = {}) {
  const url = new URL(location.href);
  const id = url.searchParams.get(EXPERIMENT_PARAM);
  if (id === null) return null;
  url.searchParams.delete(EXPERIMENT_PARAM);
  history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  const e = experimente.find((x) => x.id === id);
  if (!e) return null;
  if (e.modus !== undefined) o.modusWaehlen?.(e.modus);
  o.einstiegSchliessen?.();
  o.oeffnen?.();
  karte.starte(id);
  return id;
}

/**
 * Prüft die Daten der Hilfeseite, für die Tests der App: Modi der Abläufe und Bereiche bekannt, Adressen der Modi, jedes
 * `zeige` einer Anleitung beginnt mit `#id` (eines Bereichs: wenn es eine ID hat) und diese ID steht im HTML der App (der Rest des Selektors und Elemente, die erst das
 * Programm erzeugt, prüft erst tools/hilfe-bilder.mjs), zu jedem Bild eine Datei, keine überzähligen Bilder, kein Anker
 * doppelt, Ergänzungen und Auslassungen nur zu gemeinsamen Texten, Adressen der Fragen, erzeugte Experimente mit
 * Parametern, jeder Anker aus `verweise` (z. B. die Ziele der ⓘ, `Abschnitt.hilfe`; mit `{modus}` in mindestens einem
 * Modus) auf der Seite. Rückgabe: Liste der Fehler. html:
 * Inhalt von index.html; dateien: Namen der Dateien im Ordner der Bilder.
 * @param {HilfeDaten} d @param {{ html: string, dateien: string[], verweise?: string[] }} o
 */
export function pruefeHilfe(d, { html, dateien, verweise = [] }) {
  /** @type {string[]} */
  const fehler = [];
  const modi = new Set(d.modi.map((m) => m.id));
  for (const a of [...d.ersteSchritte, ...(d.anleitungen ?? []), ...d.experimente, ...(d.bereiche ?? [])]) {
    if (a.modus !== undefined && !modi.has(a.modus)) fehler.push(`${a.id}: unbekannter Modus ${a.modus}`);
  }
  for (const m of d.modi) if (!m.hash.startsWith('#')) fehler.push(`Modus ${m.id}: Adresse muss mit # beginnen`);
  for (const f of d.fragen ?? []) if (f.app !== undefined && !f.app.startsWith('#')) fehler.push(`Frage ${f.id}: Adresse muss mit # beginnen`);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
  // Anleitungen: Selektor beginnt mit #id (Leitfaden 5.3); Bereiche dürfen auch Bausteine ohne ID markieren (z. B.
  // header.top), geprüft wird dann nur die ID am Anfang, wo es eine gibt
  /** @param {string} sel @param {string} wo @param {boolean} streng */
  const element = (sel, wo, streng) => {
    const id = sel.match(/^#([\w-]+)/)?.[1];
    if (!id) { if (streng) fehler.push(`${wo}: Selektor muss mit #id beginnen (${sel})`); }
    else if (!ids.has(id)) fehler.push(`${wo}: Element #${id} fehlt in der App`);
  };
  const bilder = hilfeBilder(d);
  for (const b of bilder) {
    b.zeige.forEach((z) => element(z, b.quelle, !b.nummern));
    if (b.ausschnitt) element(b.ausschnitt, b.quelle, false);
    if (!dateien.includes(b.datei)) fehler.push(`${b.quelle}: Bild ${b.datei} fehlt (node tools/common/hilfe-bilder.mjs)`);
  }
  const namen = bilder.map((b) => b.datei);
  for (const n of new Set(namen.filter((n, i) => namen.indexOf(n) !== i))) fehler.push(`Bild ${n} doppelt`);
  for (const e of d.experimente) if (erzeugt(e) && !e.params().length) fehler.push(`${e.id}: keine Parameter`);
  const erwartet = new Set(namen);
  for (const f of dateien) if (f.endsWith('.png') && !erwartet.has(f)) fehler.push(`überzähliges Bild ${f}`);
  const anker = hilfeAnker(d);
  for (const a of new Set(anker.filter((a, i) => anker.indexOf(a) !== i))) fehler.push(`Anker ${a} doppelt`);
  const gemeinsameIds = new Set([...UEBERBLICK, ...KONZEPTE, ...TECHNIK].map((t) => t.id));
  for (const id of [...Object.keys(d.ergaenzungen ?? {}), ...(d.ohne ?? [])]) {
    if (!gemeinsameIds.has(id)) fehler.push(`kein gemeinsamer Text ${id} (ergaenzungen, ohne)`);
  }
  for (const id of Object.keys(d.ergaenzungen ?? {})) if ((d.ohne ?? []).includes(id)) fehler.push(`${id}: ergänzt und ausgelassen`);
  // Verweise mit {modus}: in mindestens einem Modus vorhanden (welche Modi einen Abschnitt zeigen, weiss nur die App)
  const vorhanden = new Set(anker);
  for (const v of verweise) {
    const ziele = v.includes('{modus}') ? d.modi.map((m) => v.replace('{modus}', m.id)) : [v];
    if (!ziele.some((z) => vorhanden.has(z))) fehler.push(`Verweis auf #${v}: kein solcher Anker auf der Hilfeseite`);
  }
  return fehler;
}
