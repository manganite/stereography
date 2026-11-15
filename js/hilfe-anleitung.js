// Texte der Hilfeseite (Leitfaden Abschn. 5.3, crystallography-common#114): Zweck, Modi, Bedienkonzepte der App,
// Bereiche zum Nachschlagen, weitere Anleitungen, typische Fragen und Ergänzungen der gemeinsamen Texte. Datendatei
// (Leitfaden Abschn. 9). Zusammengestellt in js/hilfe-daten.js; gemeinsame Texte in lib/common/js/hilfe-gemeinsam.js.
// Die Hilfeseite erklärt die Bedienung; für die Fachbegriffe verweist sie ins Skript.
//
// Bereiche: Die Einträge mit `zeige` bekommen im Bild eine Nummer (Reihenfolge der Liste); `id` ist der Anker
// `<Modus>-<id>`, Ziel der Verweise aus dem ⓘ (`hilfe` in SECTIONS, js/hilfetexte.js).

/** @import { HilfeBereich, HilfeFrage, HilfeText } from '../lib/common/js/hilfe-seite.js' */
/** @import { Ablauf } from '../lib/common/js/ablauf.js' */

/** Zweck der App (Überblick). */
export const ZWECK = `<p>Die App zeigt, wie die stereographische Projektion einen Kristall in ein ebenes Bild übersetzt: jede Fläche als
  Pol, jedes Symmetrieelement als Zeichen. Man kann damit die Symmetriegerüste der 32 Punktgruppen ansehen, Kristallformen
  und Beispielkristalle mit ihren Polen vergleichen, Winkel und Zonen bestimmen und sehen, was eine Verzerrung des
  Gitters an der Symmetrie ändert. Neben jedem Stereogramm steht die räumliche Konstruktion, aus der es entsteht.</p>`;

/** Wozu die Modi dienen (Kennung wie in hilfe-daten.js). */
export const MODI_ZWECK = {
  pg: 'Die Symmetriegerüste der 32 Punktgruppen: wie ihre Operationen einen Pol in allgemeiner oder spezieller Lage vervielfältigen.',
  poly: 'Kristallformen und Beispielkristalle: Flächen und ihre Pole, Zonen und Winkel, Tracht und Habitus, Verzerrungen des Gitters.',
};

/** Bedienkonzepte der App (nach den gemeinsamen). @type {HilfeText[]} */
export const KONZEPTE = [
  {
    id: 'stereogramm-3d',
    titel: 'Stereogramm und 3D-Konstruktion',
    text: `<p>Beide Tafeln zeigen denselben Zustand: links das Stereogramm, rechts die räumliche Konstruktion mit Umkugel,
      Flächennormalen, Projektionsstrahlen und dem Stereogramm in der Äquatorebene. Was man in einer Tafel wählt, ist in der
      anderen ebenfalls hervorgehoben; ein Pol und seine Fläche gehören immer zusammen. Welche Kristallrichtung zum
      Betrachter zeigt, bestimmt die <b>Projektionsrichtung</b>; die <b>Blickrichtungen</b> sind die Richtungen des
      Hermann-Mauguin-Symbols (siehe <a href="skript.html#blickrichtungen">Skript, Kap. 5</a>).</p>`,
  },
  {
    id: 'einrasten',
    titel: 'Einrasten des Ausgangspols',
    text: `<p>Im Modus „Punktgruppen“ lässt sich der Ausgangspol im Stereogramm ziehen. Kommt er einer Drehachse (4°) oder einer
      Spiegelebene (3°) nahe, rastet er ein: Er liegt dann in einer speziellen Lage, und mehrere Pole fallen zusammen. Einen
      Schalter dafür gibt es nicht. Genau einstellen lässt er sich mit den Reglern ρ und φ; die Kenndaten nennen seine Lage.</p>`,
  },
  {
    id: 'symmetrie-brechen',
    titel: 'Symmetrie brechen',
    text: `<p>„Symmetrie brechen“ im Abschnitt „Gitter“ gibt es bei Formen, nicht bei Beispielkristallen. Ohne den Schalter sind nur die Gitterparameter frei, die das Kristallsystem zulässt; die Punktgruppe bleibt
      erhalten. Mit dem Schalter lässt sich das Gitter so verzerren, dass sich die Punktgruppe ändert, auf einem von zwei
      Wegen: <b>Streckung</b> entlang einer Blickrichtung (z. B. der Würfel entlang [111] zum Rhomboeder) oder <b>Alle
      Parameter frei</b>. Die Kenndaten nennen dann die verbleibende Punktgruppe und in welche Formen die Form zerfällt.
      Hintergrund im <a href="skript.html#verzerrung">Skript, Kap. 11</a>.</p>`,
  },
];

/** Bereiche zum Nachschlagen (je Modus). @type {HilfeBereich[]} */
export const BEREICHE = [
  // Punktgruppen
  {
    id: 'seitenleiste', modus: 'pg', titel: 'Seitenleiste',
    eintraege: [
      { id: 'experimente', zeige: '#sec-experimente > summary', name: 'Experimente', text: 'Kleine Versuche zu Punktgruppen: erst vermuten, dann ausprobieren.' },
      { id: 'punktgruppe', zeige: '#ctl-pg > h2', name: 'Punktgruppe', text: 'Ein Knopf je Punktgruppe, geordnet nach Kristallsystem. Gruppen mit zwei Aufstellungen (z. B. 32) bieten darunter die Wahl der Aufstellung an.' },
      { id: 'lage', zeige: '#ctl-pg-opts > summary', name: 'Symmetrie und allgemeine Lage', text: 'Symmetriegerüst und Objekt in allgemeiner Lage ein- und ausblenden; Poldistanz ρ und Azimut φ des Ausgangspols.' },
      { id: 'darstellung', zeige: '#sec-view > summary', name: 'Darstellung', text: 'Pole, Farben nach Blickrichtung und Händigkeit, Kristallachsen, Wulffsches Netz und die Teile der 3D-Konstruktion.' },
      { zeige: '#reset-alles', name: 'Alle Einstellungen zurücksetzen', text: 'Startzustand der App; Quiz und Experimente bleiben.' },
    ],
  },
  {
    id: 'stereogramm', modus: 'pg', titel: 'Tafel Stereogramm', ausschnitt: '.p-a',
    eintraege: [
      { zeige: '#angle-btn', name: 'Winkel', text: 'Werkzeug: zwei Pole antippen; die Kenndaten nennen den Winkel zwischen ihnen und die Operation, die den einen in den anderen überführt.' },
      { zeige: '#export-stereo', name: 'Export', text: 'Stereogramm kopieren oder als SVG- bzw. PNG-Datei speichern.' },
      { zeige: '#stereo', name: 'Stereogramm', text: 'Ausgangspol ziehen oder eine Stelle antippen; den Ausgangspol antippen wechselt die Halbkugel.' },
      { zeige: '#legend', name: 'Legende', text: 'Pole oben (Punkt) und unten (Kreis), Zeichen der Symmetrieelemente und ihre Farben; was sie fachlich bedeuten, erklärt das <a href="skript.html#symmetrie">Skript, Kap. 4</a>.' },
    ],
  },
  {
    id: 'konstruktion', modus: 'pg', titel: 'Tafel 3D-Konstruktion', ausschnitt: '.p-b',
    eintraege: [
      { zeige: '.p-b .zoomtools', name: 'Zoom', text: 'Für die Tastatur: + und − zoomen wie Mausrad oder zwei Finger; an den Grenzen gesperrt.' },
      { zeige: '#export-3d', name: 'Export', text: 'Ansicht kopieren oder als PNG-Datei speichern (kein SVG).' },
      { zeige: '#v3d-dirs', name: 'Blickrichtungen ausblenden', text: 'Je Blickrichtung des Symbols ein Knopf: blendet ihre Symmetrieelemente in 3D aus und wieder ein.' },
      { zeige: '.p-b .viewbar', name: 'Blick', text: '„Schräg“ zeigt Kugel, Kristall und Äquatorebene schräg von oben (Startansicht); die übrigen Knöpfe blicken entlang einer der drei Blickrichtungen. Liegt sie parallel zur Projektionsrichtung, sieht man das Bild wie im Stereogramm.' },
      { zeige: '.p-b .panel-foot', name: 'Drehen und zoomen', text: 'Ziehen dreht die Konstruktion, Mausrad oder zwei Finger zoomen.' },
    ],
  },
  {
    id: 'kenndaten', modus: 'pg', titel: 'Kenndaten', ausschnitt: '#info',
    eintraege: [
      { zeige: '#info .info-head', name: 'Symbol', text: 'Hermann-Mauguin-Symbol, Kristallsystem und Schoenflies-Symbol der Punktgruppe.' },
      { zeige: '#info .facts', name: 'Eckdaten', text: 'Volles Symbol, Ordnung, Laue-Klasse, physikalische Eigenschaften und die Lage des Ausgangspols mit Wyckoff-Lage. Jeder Begriff führt ins Skript.' },
      { zeige: '#info .dirlist', name: 'Symmetrieelemente nach Blickrichtung', text: 'Was entlang jeder Blickrichtung liegt: Drehachsen parallel, Spiegelebenen senkrecht dazu.' },
      { zeige: '#info .explain > summary', name: 'Erläuterungen', text: 'Ausführlichere Erklärungen zu den Angaben, eingeklappt.' },
      { name: 'Winkel', text: 'Mit dem Werkzeug „Winkel“ stehen hier der gemessene Winkel und die Operation zwischen den beiden Polen.' },
    ],
  },
  // Kristallformen
  {
    id: 'seitenleiste', modus: 'poly', titel: 'Seitenleiste', adresse: '#m=form&sys=orthorhombisch&bsp=topas',
    eintraege: [
      { id: 'experimente', zeige: '#sec-experimente > summary', name: 'Experimente', text: 'Kleine Versuche zu Formen, Zonen und Verzerrungen.' },
      { id: 'kristallform', zeige: '#ctl-poly > h2', name: 'Kristallform', text: 'Beispielkristall oder Kristallsystem und Form wählen, die Projektionsrichtung, Indizes und das Symmetriegerüst unter den Polen.' },
      { zeige: '#sec-more > summary', name: 'Weitere Optionen', text: 'Vier Indizes (hkil) bei hexagonalen Achsen und „Flächensymmetrie zeigen“: ein Muster auf jeder Fläche, dazu alle Formen in der Auswahl.' },
      { id: 'gitter', zeige: '#ctl-poly-lat > summary', name: 'Gitter', text: 'Achsenverhältnisse und Winkel, soweit das Kristallsystem sie freigibt, und „Symmetrie brechen“ (nur bei Formen, nicht bei Beispielkristallen).' },
      { id: 'gestalt', zeige: '#ctl-poly-shape > summary', name: 'Gestalt', text: 'Grösse des Kristalls, Abstände der Formen und offene Formen; ändert den Körper, nicht das Stereogramm.' },
      { id: 'darstellung', zeige: '#sec-view > summary', name: 'Darstellung', text: 'Pole, Pole der unteren Halbkugel, Farben nach Blickrichtung, Kristallachsen, Wulffsches Netz und die Teile der 3D-Konstruktion.' },
      { zeige: '#reset-alles', name: 'Alle Einstellungen zurücksetzen', text: 'Startzustand der App; Quiz und Experimente bleiben.' },
    ],
  },
  {
    id: 'stereogramm', modus: 'poly', titel: 'Tafel Stereogramm', ausschnitt: '.p-a', adresse: '#m=form&sys=orthorhombisch&bsp=topas',
    eintraege: [
      { zeige: '#zone-btn', name: 'Zone', text: 'Werkzeug: zwei Pole antippen; zeigt Zonenkreis, Zonenachse [uvw] und alle Flächen der Zone.' },
      { zeige: '#angle-btn', name: 'Winkel', text: 'Werkzeug: zwei Pole antippen; die Kenndaten nennen Normalen- und Flächenwinkel.' },
      { zeige: '#export-stereo', name: 'Export', text: 'Stereogramm kopieren oder als SVG- bzw. PNG-Datei speichern.' },
      { zeige: '#stereo', name: 'Stereogramm', text: 'Pol antippen hebt ihn und seine Fläche hervor; liegen zwei Pole übereinander, schaltet erneutes Antippen weiter. Mit der Maus nennt der Tooltip über einem Pol (hkl), ρ und φ.' },
      { zeige: '#legend', name: 'Legende', text: 'Flächenpole oben (Punkt) und unten (Kreis), Farben der Formen.' },
    ],
  },
  {
    id: 'konstruktion', modus: 'poly', titel: 'Tafel 3D-Konstruktion', ausschnitt: '.p-b', adresse: '#m=form&sys=orthorhombisch&bsp=topas',
    eintraege: [
      { zeige: '#zone-btn-3d', name: 'Zone', text: 'Dasselbe Werkzeug wie über dem Stereogramm; Flächen statt Pole antippen.' },
      { zeige: '#angle-btn-3d', name: 'Winkel', text: 'Dasselbe Werkzeug wie über dem Stereogramm.' },
      { zeige: '.p-b .zoomtools', name: 'Zoom', text: 'Für die Tastatur: + und − zoomen wie Mausrad oder zwei Finger; an den Grenzen gesperrt.' },
      { zeige: '#export-3d', name: 'Export', text: 'Ansicht kopieren oder als PNG-Datei speichern (kein SVG).' },
      { zeige: '.p-b .viewbar', name: 'Blick', text: '„Schräg“ zeigt Kugel, Kristall und Äquatorebene schräg von oben (Startansicht); die übrigen Knöpfe blicken entlang der Blickrichtungen des Kristallsystems.' },
      { zeige: '.p-b .panel-foot', name: 'Drehen und zoomen', text: 'Ziehen dreht den Kristall, Mausrad oder zwei Finger zoomen.' },
    ],
  },
  {
    id: 'kenndaten', modus: 'poly', titel: 'Kenndaten', ausschnitt: '#info', adresse: '#m=form&sys=orthorhombisch&bsp=topas&w=zone',
    eintraege: [
      { zeige: '#info .info-head', name: 'Form bzw. Beispiel', text: 'Name der Form oder des Beispielkristalls und seine Punktgruppe.' },
      { zeige: '#info .zlist', name: 'Zonen dieses Kristalls', text: 'Nur mit dem Werkzeug „Zone“: alle Zonen mit mindestens drei Flächen, gruppiert nach gleichwertigen Zonenachsen; antippen wählt eine Gruppe oder eine Zone.' },
      { zeige: '#info .facts', name: 'Eckdaten', text: 'Bei einer Form: Tracht, Habitus, Flächenzahl, Indexmuster, Wyckoff-Lage und Flächensymmetrie, Eigensymmetrie, Gitter und Projektionsrichtung. Bei einem Beispielkristall (wie im Bild): Habitus, Flächenzahl, Gitter und Projektionsrichtung; die Tracht steht dann als Tabelle der Formen darüber. Jeder Begriff führt ins Skript.' },
      { zeige: '#info .explain > summary', name: 'Erläuterungen', text: 'Ausführlichere Erklärungen zu den Angaben, eingeklappt.' },
      { name: 'Symmetrie gebrochen', text: 'Mit „Symmetrie brechen“ nennen die Kenndaten die verbleibende Punktgruppe und die Formen, in die die Form zerfällt.' },
    ],
  },
];

/** Weitere Anleitungen (nur auf der Hilfeseite). @type {Ablauf[]} */
export const ANLEITUNGEN = [
  {
    id: 'winkel-pg', modus: 'pg', titel: 'Winkel und Operation zwischen zwei Polen',
    schritte: [
      { frage: '<b>Werkzeug „Winkel“ wählen.</b> Es steht im Kopf des Stereogramms.', handlung: { text: 'Winkel in 4<i>mm</i> wählen', hash: '#m=pg&g=4mm&w=winkel' }, zeige: '#angle-btn' },
      { frage: '<b>Zwei Pole antippen.</b> Der Bogen zwischen ihnen erscheint im Stereogramm und in 3D.', zeige: '#stereo' },
      { frage: '<b>Ergebnis lesen.</b> Die Kenndaten nennen den Winkel und die Symmetrieoperation, die den ersten Pol in den zweiten überführt.' },
    ],
  },
  {
    id: 'zone', modus: 'poly', titel: 'Zone bestimmen',
    schritte: [
      { frage: '<b>Werkzeug „Zone“ wählen.</b>', handlung: { text: 'Zone am Galenit wählen', hash: '#m=form&bsp=galenit&w=zone' }, zeige: '#zone-btn' },
      { frage: '<b>Zwei Pole antippen.</b> Die App zeigt den Zonenkreis, die Zonenachse [uvw] und alle Flächen der Zone.', zeige: '#stereo' },
      { frage: '<b>Oder eine Zone aus der Liste wählen.</b> Die Kenndaten listen alle Zonen mit mindestens drei Flächen; mehrere lassen sich zugleich wählen, jede in eigener Farbe.', zeige: '#info .zlist' },
    ],
  },
  {
    id: 'winkel-poly', modus: 'poly', titel: 'Winkel zwischen zwei Flächen messen',
    schritte: [
      { frage: '<b>Werkzeug „Winkel“ wählen.</b>', handlung: { text: 'Winkel am Topas wählen', hash: '#m=form&sys=orthorhombisch&bsp=topas&w=winkel' }, zeige: '#angle-btn' },
      { frage: '<b>Zwei Pole oder zwei Flächen antippen.</b> Der Grosskreisbogen zwischen den Polen erscheint im Stereogramm und auf der Umkugel.', zeige: '#stereo' },
      { frage: '<b>Ergebnis lesen.</b> Die Kenndaten nennen den Normalenwinkel <i>n</i> und den Flächenwinkel <i>f</i> = 180° − <i>n</i>.' },
    ],
  },
  {
    id: 'brechen', modus: 'poly', titel: 'Symmetrie brechen: einen Kristall strecken',
    schritte: [
      { frage: '<b>„Symmetrie brechen“ einschalten.</b> Der Schalter steht im Abschnitt „Gitter“; darunter wählt man „Streckung“ oder „Alle Parameter frei“.', handlung: { text: 'Symmetrie brechen', hash: '#m=form&str=001,1' }, zeige: '#poly-broken' },
      { frage: '<b>Richtung und Faktor wählen.</b> Gestreckt wird entlang einer Blickrichtung, die die Symmetrie ändert.', handlung: { text: 'Entlang [111] strecken', hash: '#m=form&str=111,1.5' }, zeige: '#stretch-dir' },
      { frage: '<b>Restsymmetrie ablesen.</b> Die Kenndaten nennen die verbleibende Punktgruppe und in welche Formen die Form zerfällt.', zeige: '#info' },
    ],
  },
];

/** Typische Fragen. @type {HilfeFrage[]} */
export const FRAGEN = [
  {
    id: 'weniger-pole', frage: 'Warum sehe ich weniger Pole als erwartet?',
    antwort: '<p>Der Ausgangspol liegt auf einem Symmetrieelement (spezielle Lage); dann fallen Pole zusammen, und es erscheinen weniger als die Ordnung der Gruppe. Die Kenndaten nennen die Lage mit Wyckoff-Lage und Lagesymmetrie. Den Pol mehr als einige Grad vom Element wegziehen (sonst rastet er wieder ein) oder ρ und φ mit den Reglern einstellen.</p>',
    app: '#m=pg&g=4mm&rho=0', skript: 'lage-pol',
  },
  {
    id: 'kreise', frage: 'Warum sind manche Pole Kreise?',
    antwort: '<p>Ein Kreis ist ein Pol auf der unteren Halbkugel, ein Punkt einer auf der oberen. Im Modus „Kristallformen“ blendet „Pole der unteren Halbkugel“ in der Darstellung die Kreise aus.</p>',
    skript: 'projizieren',
  },
  {
    id: 'regler-gesperrt', frage: 'Warum fehlen Gitterregler, oder warum sind sie gesperrt?',
    antwort: '<p>Ohne Symmetriebruch zeigt der Abschnitt „Gitter“ nur die Parameter, die das Kristallsystem freigibt (im kubischen System keinen). Mit „Symmetrie brechen“ und „Streckung“ legt die Streckung das Gitter fest: Die Regler zeigen das Ergebnis und sind gesperrt. Einzeln ändern lassen sich alle Parameter mit „Alle Parameter frei“; dann ändert sich die Punktgruppe.</p>',
    app: '#m=form&str=111,1.5', skript: 'kristallsysteme',
  },
  {
    id: 'stereogramm-gleich', frage: 'Warum ändert sich das Stereogramm nicht, wenn ich die Grösse oder die Abstände ändere?',
    antwort: '<p>Die Pole hängen nur von den Richtungen der Flächennormalen ab, also von Indizes und Gitter. Grösse und Abstände ändern die Gestalt des Körpers (den Habitus), nicht die Normalen.</p>',
    app: '#m=form&bsp=galenit', skript: 'habitus-stereo',
  },
  {
    id: 'uebereinander', frage: 'Zwei Pole liegen übereinander. Wie wähle ich den unteren?',
    antwort: '<p>Erneut antippen: Bei übereinanderliegenden Polen schaltet jedes Antippen zum nächsten weiter. Mit einem Werkzeug lassen sich so auch beide wählen.</p>',
  },
  {
    id: 'zurueck', frage: 'Wie komme ich zur Ausgangsansicht zurück?',
    antwort: '<p>In der 3D-Konstruktion stellt „Schräg“ die Startansicht wieder her, auch den Zoom. „Gitter zurücksetzen“ und „Gestalt zurücksetzen“ wirken auf ihren Abschnitt, „Alle Einstellungen zurücksetzen“ ganz unten in der Seitenleiste auf die ganze App.</p>',
  },
];

/** Ergänzungen der gemeinsamen Texte (nach Kennung in hilfe-gemeinsam.js). */
export const ERGAENZUNGEN = {
  export: '<p>Hier: Stereogramm als Kopie, SVG oder PNG (2048 × 2048 Pixel); 3D-Konstruktion als Kopie oder PNG, ohne SVG.</p>',
  tastatur: '<p>Den Ausgangspol stellen statt des Ziehens die Regler ρ und φ im Abschnitt „Symmetrie und allgemeine Lage“ ein.</p>',
};
