// Prüft den Kopf einer Seite auf das, was Suchmaschinen und Vorschauen geteilter Links brauchen
// (Leitfaden Abschn. 9, „Auffindbarkeit“; crystallography-common#164): Sprache, Titel, Beschreibung,
// kanonische Adresse, Open Graph und strukturierte Daten (JSON-LD, schema.org). Ohne Browser: liest das
// HTML als Text. Aufruf im Test der App, je Seite:
//
//   assert.deepEqual(pruefeKopf(html, { adresse: 'https://manganite.github.io/<app>/skript.html' }), []);
//
// Attribute dürfen in beliebiger Reihenfolge und Schreibweise stehen; Entitäten werden vor dem Vergleich
// aufgelöst. Nicht geprüft: dass `og:site_name` auf allen Seiten einer App gleich ist, und der Inhalt der
// übrigen Felder im JSON-LD (nur, dass sie da sind).

/** Höchstlänge des Titels: Google zeigt etwa 60 Zeichen; was länger ist, wird abgeschnitten, nicht verworfen. */
export const TITEL_MAX = 80;
/** Länge der Beschreibung: kürzer sagt zu wenig, länger schneidet Google ab. */
export const BESCHREIBUNG_MIN = 50;
export const BESCHREIBUNG_MAX = 160;
/** Sprache und Region der Seiten (Open Graph; Schweizer Schreibung, Leitfaden Abschn. 3). */
export const OG_LOCALE = 'de_CH';
/** Das Vorschaubild geteilter Links, relativ zum Ordner der App. */
export const VORSCHAUBILD = 'icons/vorschau.png';
/** Felder, die das JSON-LD jeder Seite ausser Name, Beschreibung, Adresse und Sprache haben muss. */
export const LD_FELDER = ['learningResourceType', 'educationalLevel', 'author', 'license', 'isPartOf'];

/** @type {Record<string, string>} */
const BENANNT = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—' };

/**
 * Entitäten als Zeichen: die benannten, die in Köpfen vorkommen, und alle numerischen.
 * @param {string} s
 */
function entitaeten(s) {
  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (ganz, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isInteger(code) && code <= 0x10ffff ? String.fromCodePoint(code) : ganz;
    }
    return BENANNT[e.toLowerCase()] ?? ganz;
  });
}

/**
 * Die Attribute eines Tags, Namen klein geschrieben, Werte mit aufgelösten Entitäten.
 * @param {string} tag
 * @returns {Record<string, string>}
 */
function attribute(tag) {
  /** @type {Record<string, string>} */
  const a = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    a[m[1].toLowerCase()] = entitaeten(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return a;
}

/**
 * Befunde zum Kopf einer Seite; leer, wenn alles stimmt.
 * @param {string} html ganze Seite
 * @param {{ adresse: string }} optionen `adresse`: kanonische Adresse der Seite auf der Live-Seite
 *   (Startseite der App mit Schrägstrich am Ende, nicht `index.html`)
 * @returns {string[]}
 */
export function pruefeKopf(html, { adresse }) {
  /** @type {string[]} */
  const befunde = [];
  // Kommentare zählen nicht (zuerst entfernt, damit ein Kommentar mit „</head>“ den Kopf nicht abschneidet);
  // der Kopf endet mit </head> oder, wo es fehlt, mit <body>.
  // Bis nichts mehr zu entfernen ist, auch ein Kommentar ohne Ende (CodeQL: unvollständige Bereinigung).
  let ohneKommentare = html;
  for (let vorher = ''; vorher !== ohneKommentare; ) {
    vorher = ohneKommentare;
    ohneKommentare = ohneKommentare.replace(/<!--[\s\S]*?(?:-->|$)/g, '');
  }
  const kopf = ohneKommentare.split(/<\/head\s*>|<body\b/i)[0] ?? '';
  if (!/<html\b[^>]*\slang\s*=\s*["']?de["'\s>]/i.test(ohneKommentare)) befunde.push('<html lang="de"> fehlt');

  const titelTags = [...kopf.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  if (titelTags.length > 1) befunde.push(`<title> steht ${titelTags.length}-mal im Kopf`);
  const titel = entitaeten(titelTags[0]?.[1] ?? '').trim();
  if (!titel) befunde.push('<title> fehlt oder ist leer');
  else if (titel.length > TITEL_MAX) befunde.push(`Titel länger als ${TITEL_MAX} Zeichen (${titel.length}): ${titel}`);

  const metas = [...kopf.matchAll(/<meta\b[^>]*>/gi)].map((m) => attribute(m[0]));
  const links = [...kopf.matchAll(/<link\b[^>]*>/gi)].map((m) => attribute(m[0]));
  /**
   * Der eine Wert eines Elements; mehrere sind ein Befund.
   * @param {Record<string, string>[]} liste
   * @param {string} schluessel
   * @param {string} name
   * @param {string} wertattribut
   * @param {string} was
   */
  const einer = (liste, schluessel, name, wertattribut, was) => {
    // rel ist eine Liste von Wörtern (rel="canonical nofollow"), die übrigen Schlüssel ein Wert
    const passt = (/** @type {string | undefined} */ w) =>
      schluessel === 'rel' ? (w ?? '').toLowerCase().split(/\s+/).includes(name) : w?.toLowerCase() === name;
    const treffer = liste.filter((a) => passt(a[schluessel]));
    if (treffer.length > 1) befunde.push(`${was} steht ${treffer.length}-mal im Kopf`);
    return treffer[0]?.[wertattribut];
  };

  const beschreibung = (einer(metas, 'name', 'description', 'content', '<meta name="description">') ?? '').trim();
  if (!beschreibung) befunde.push('<meta name="description"> fehlt oder ist leer');
  else if (beschreibung.length < BESCHREIBUNG_MIN || beschreibung.length > BESCHREIBUNG_MAX) {
    befunde.push(`Beschreibung hat ${beschreibung.length} Zeichen, erwartet ${BESCHREIBUNG_MIN} bis ${BESCHREIBUNG_MAX}`);
  }

  const kanonisch = einer(links, 'rel', 'canonical', 'href', '<link rel="canonical">');
  if (kanonisch !== adresse) befunde.push(`<link rel="canonical"> ist ${kanonisch ?? 'nicht vorhanden'}, erwartet ${adresse}`);

  /** @param {string} name */
  const og = (name) => einer(metas, 'property', `og:${name}`, 'content', `og:${name}`);
  /** @type {[string, string][]} */
  const erwartet = [
    ['type', 'website'],
    ['locale', OG_LOCALE],
    ['title', titel],
    ['description', beschreibung],
    ['url', adresse],
    ['image', new URL(VORSCHAUBILD, adresse).href],
  ];
  for (const [name, wert] of erwartet) {
    const ist = og(name);
    if (ist !== wert) befunde.push(`og:${name} ist ${ist ?? 'nicht vorhanden'}, erwartet ${wert}`);
  }
  if (!og('site_name')) befunde.push('og:site_name fehlt');

  const bloecke = [...kopf.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)];
  if (bloecke.length !== 1) befunde.push(`erwartet genau ein <script type="application/ld+json">, gefunden ${bloecke.length}`);
  else {
    /** @type {unknown} */
    let daten;
    let gueltig = true;
    try {
      daten = JSON.parse(bloecke[0][1]);
    } catch (e) {
      gueltig = false;
      befunde.push(`JSON-LD ist kein gültiges JSON: ${/** @type {Error} */ (e).message}`);
    }
    if (gueltig && (daten === null || typeof daten !== 'object' || Array.isArray(daten))) {
      befunde.push('JSON-LD ist kein Objekt');
    } else if (gueltig) {
      const ld = /** @type {Record<string, unknown>} */ (daten);
      const typen = [ld['@type']].flat();
      if (ld['@context'] !== 'https://schema.org') befunde.push('JSON-LD: @context ist nicht https://schema.org');
      if (!typen.includes('LearningResource')) befunde.push(`JSON-LD: @type enthält nicht LearningResource (${typen.join(', ')})`);
      /** @type {[string, unknown][]} */
      const felder = [
        ['name', titel],
        ['description', beschreibung],
        ['url', adresse],
        ['inLanguage', 'de'],
      ];
      for (const [feld, wert] of felder) {
        if (ld[feld] !== wert) befunde.push(`JSON-LD: ${feld} ist ${JSON.stringify(ld[feld])}, erwartet ${JSON.stringify(wert)}`);
      }
      for (const feld of LD_FELDER) {
        if (ld[feld] === undefined || ld[feld] === '') befunde.push(`JSON-LD: ${feld} fehlt`);
      }
    }
  }
  return befunde;
}
