// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Mechanik steht in lib/common/js/help.js; Begriffe nach Borchardt-Ott & Sowa, Kristallographie (2018).

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  // Kopfzeile
  'tab-pg': 'Symmetriegerüste der 32 Punktgruppen und wie ihre Operationen einen Pol vervielfältigen.',
  'tab-poly': 'Kristallformen und Beispielkristalle: Flächen, ihre Pole im Stereogramm und der Kristall in 3D.',
  'skript-link': 'Skript zur App: Indizes, Projektion, Symmetrie und Punktgruppen, Symmetriegerüste, Blickrichtungen, Kristallformen, Zonen, Tracht und Habitus, trigonale und hexagonale Kristalle.',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren, z. B. für Folien.',
  'help-open': 'Erste Schritte: kurze Einführung in die App.',
  // Punktgruppen
  'pg-elements': 'Symmetrieelemente im Stereogramm: Drehachsen als Symbole an ihren Durchstosspunkten, Spiegelebenen als kräftige Grosskreise.',
  'pg-object': 'Ein Pol, der auf keinem Symmetrieelement liegt. Alle Operationen der Gruppe wirken auf ihn; die Zahl der Pole ist die Ordnung der Gruppe.',
  'pg-poles': 'Die Pole der Objekte im Stereogramm und auf der Umkugel. Ausgeschaltet bleiben die Objekte in 3D sichtbar: So lässt sich das Stereogramm selbst vorhersagen.',
  'pg-colorful': 'Pole, die durch eine Drehung aus dem Ausgangspol entstehen, in einer Farbe; Spiegelbilder (aus Spiegelung, Inversion oder Drehinversion) in der anderen.',
  'pg-theta': 'Poldistanz ρ: Winkel des Ausgangspols vom Nordpol, also vom Zentrum des Stereogramms. Negative Werte: untere Halbkugel, vom Südpol gezählt.',
  'pg-phi': 'Azimut φ: Drehwinkel um die Projektionsrichtung, ab dem rechten Rand im Uhrzeigersinn.',
  // Kristallformen
  'ex-select': 'Kristalle aus Lehrbüchern: mehrere Formen derselben Punktgruppe, jede in eigener Farbe.',
  'sys-select': 'Bestimmt das Achsensystem und die Punktgruppen, deren Formen zur Auswahl stehen.',
  'form-select': 'Eine Form ist die Menge der Flächen, die die Operationen der Punktgruppe aus einer Fläche erzeugen.',
  'preset-select': 'Welche Kristallrichtung zum Betrachter zeigt. Das Stereogramm dreht sich mit, die Winkel zwischen den Polen bleiben gleich.',
  'poly-poles': 'Die Flächenpole im Stereogramm und auf der Umkugel. Ausgeschaltet zeigt das Stereogramm keine Pole (z. B. als Übung: Stereogramm zum Körper zeichnen); Indizes und Projektionsstrahlen entfallen dann ebenfalls.',
  'poly-labels': 'Schreibt die Indizes (hkl) an jeden Flächenpol und an die Flächen in 3D.',
  'poly-bravais': 'Miller-Bravais-Indizes (hkil) mit i = −(h + k); sie zeigen die Gleichwertigkeit der drei a-Achsen.',
  'poly-lower': 'Pole von Flächen, die vom Betrachter wegzeigen, als Kreise. Ausgeschaltet nur die obere Halbkugel, wie in vielen Lehrbuchabbildungen.',
  'poly-facesym': 'Ein asymmetrisches Muster auf jeder Fläche; seine Wiederholung auf einer Fläche zeigt deren Flächensymmetrie, ähnlich wie Ätzfiguren. Die Formauswahl zeigt dann alle 134 Formen.',
  'poly-frame': 'Legt die Symmetrieelemente der Punktgruppe im Stereogramm unter die Pole. Liegt ein Pol auf einem Symmetrieelement, gehört er zu einer speziellen Form.',
  // Gitter
  'lat-ba': 'Achsenverhältnis b/a. Es ändert die Winkel zwischen den Flächen und damit die Lage der Pole.',
  'lat-ca': 'Achsenverhältnis c/a. Es ändert die Winkel zwischen den Flächen und damit die Lage der Pole.',
  'lat-al': 'Winkel α zwischen den Achsen b und c.',
  'lat-be': 'Winkel β zwischen den Achsen a und c.',
  'lat-ga': 'Winkel γ zwischen den Achsen a und b.',
  'poly-broken': 'Ohne diesen Schalter bleibt die Symmetrie immer erhalten. Mit ihm lässt sich das Gitter so verzerren, dass sich die Punktgruppe ändert; die Infobox zeigt, welche übrig bleibt und in welche Formen die Form zerfällt.',
  'break-mode': 'Streckung: entlang einer Blickrichtung, bezogen auf das unverzerrte Gitter; die Gitterregler zeigen das Ergebnis. Alle Parameter frei: jeder Gitterparameter einzeln, ausgehend vom gerade gezeigten Gitter.',
  'lat-reset': 'Gitterparameter und Streckung auf die Ausgangswerte zurücksetzen.',
  'stretch-dir': 'Richtung der Streckung: Blickrichtungen des Kristallsystems (Positionen im Hermann-Mauguin-Symbol), entlang derer eine Streckung die Symmetrie ändert.',
  'stretch-s': 'Streckt (über 1) oder staucht (unter 1) Gitter und Kristall entlang der gewählten Richtung. Die Symmetrie quer dazu geht verloren; die Infobox zeigt die Restsymmetrie und den Zerfall der Form. Beispiel: Würfel entlang [111] → Rhomboeder.',
  'poly-size': 'Grösse des Kristalls in 3D. Das Stereogramm hängt nicht davon ab: Die Pole hängen nur von den Flächennormalen ab.',
  'ctl-ex-dists': 'Zentralabstand der Formen. Er ändert die Gestalt und damit den Habitus, aber nicht das Stereogramm.',
  'poly-open': 'Pyramiden, Prismen, Pedien und Pinakoide schliessen allein keinen Raum ein. Ausgeschaltet schliessen graue Ergänzungsformen den Körper.',
  'poly-aux': 'Abstand der grauen Ergänzungsformen vom Zentrum. Er ändert nur die Gestalt, nicht das Stereogramm.',
  // Gestalt
  'shape-reset': 'Grösse und Abstände auf die Ausgangswerte zurücksetzen.',
  // Darstellung
  'v-dircolors': 'Farbe der Symmetrieelemente nach ihrer Position im vollen Hermann-Mauguin-Symbol (1., 2., 3. Blickrichtung). Ausgeschaltet schwarz wie in den International Tables.',
  'v-wulff': 'Wulffsches Netz: projiziertes Gradnetz. Winkel zwischen Polen nur auf Grosskreisen (Längenkreisen) ablesen.',
  'v-wulffrot': 'Netz drehen, bis zwei Pole auf demselben Längenkreis liegen, dann die Teilstriche dazwischen zählen.',
  'v-axes': 'Richtungen der Kristallachsen a, b, c (hexagonal a₁, a₂, a₃, c) im Stereogramm und in 3D.',
  'v-sphere': 'Umkugel um den Kristall; ihre Durchstosspunkte mit den Flächennormalen sind die Flächenpole.',
  'v-globe': 'Nord- und Südpol der Umkugel (die Projektionszentren) und ihr Äquator, der Grundkreis des Stereogramms.',
  'v-plane': 'Das Stereogramm in der Äquatorebene der Kugel, wie es die Projektion erzeugt.',
  'v-rays': 'Verbindung vom Pol zum Südpol (bei Polen der unteren Halbkugel zum Nordpol). Ihr Schnittpunkt mit der Äquatorebene ist der Punkt im Stereogramm. Nur mit eingeblendeten Flächenpolen.',
  'v-normals': 'Flächennormalen. Ihr Durchstosspunkt durch die Kugel ist der Flächenpol.',
  'reset-alles': 'Alle Einstellungen und den gespeicherten Zustand löschen und die App neu starten (der Fortschritt im Quiz bleibt).',
  // Stereogramm und 3D
  'zone-btn': 'Zone: zwei Flächen oder Pole antippen. Zonenkreis, Zonenachse [uvw] und alle Flächen, die die Zonengleichung hu + kv + lw = 0 erfüllen. Die Infobox listet alle Zonen des Kristalls zum Auswählen, auch mehrere zugleich.',
  'zone-btn-3d': 'Zone: zwei Flächen oder Pole antippen. Zonenkreis, Zonenachse [uvw] und alle Flächen, die die Zonengleichung hu + kv + lw = 0 erfüllen. Die Infobox listet alle Zonen des Kristalls zum Auswählen, auch mehrere zugleich.',
  'angle-btn': 'Winkel: zwei Pole oder Flächen antippen. Normalenwinkel als Grosskreisbogen; bei Punktgruppen auch die Operation, die den einen Pol in den anderen überführt.',
  'angle-btn-3d': 'Winkel: zwei Pole oder Flächen antippen. Normalenwinkel als Grosskreisbogen und Flächenwinkel.',
  'copy-stereo': 'Stereogramm als Bild (PNG) in die Zwischenablage kopieren, z. B. zum Einfügen in Folien. Immer in hellen Farben, Hintergrund ausserhalb des Grundkreises durchsichtig.',
  'save-svg': 'Stereogramm als SVG-Datei speichern: Vektorgrafik, beliebig skalierbar und nachbearbeitbar. Immer in hellen Farben, ohne Hintergrund ausserhalb des Grundkreises.',
  'save-stereo-png': 'Stereogramm als PNG-Datei speichern (2048 × 2048 Pixel). Immer in hellen Farben, Hintergrund ausserhalb des Grundkreises durchsichtig.',
  'copy-3d': '3D-Konstruktion in der gezeigten Ansicht als Bild (PNG) in die Zwischenablage kopieren, z. B. für Folien. Immer in hellen Farben, Hintergrund durchsichtig.',
  'save-3d': '3D-Konstruktion in der gezeigten Ansicht als PNG-Datei speichern (etwa 2000 Pixel breit). Immer in hellen Farben, Hintergrund durchsichtig.',
  'view-oblique': 'Schräger Blick auf Kugel, Kristall und Äquatorebene. Die Knöpfe daneben blicken entlang der drei Blickrichtungen des Kristallsystems (triklin: entlang a, b, c); liegt eine davon parallel zur Projektionsrichtung, zeigt sie das Bild wie im Stereogramm. Eine gewählte Blickrichtung steht auch im kopierten Link.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  {
    heading: '#sec-experimente > summary',
    intro: 'Kleine Versuche: erst eine Vermutung wählen, dann per Knopf ausprobieren. „Vorher zeigen“ vergleicht mit der Ansicht davor.',
    ids: [],
  },
  {
    heading: '#ctl-pg > h2',
    intro: 'Punktgruppe antippen: Das Stereogramm zeigt ihr Symmetriegerüst. Gruppen mit zwei Aufstellungen (z. B. 32) bieten darunter die Wahl der Aufstellung an.',
    ids: [],
  },
  { heading: '#ctl-pg-opts > summary', ids: ['pg-elements', 'pg-object', 'pg-theta', 'pg-phi', 'angle-btn'] },
  {
    heading: '#ctl-poly > h2',
    intro: 'Pol oder Fläche antippen hebt beide hervor: Jede Fläche hat genau einen Pol.',
    ids: ['ex-select', 'sys-select', 'form-select', 'preset-select', 'poly-labels', 'poly-frame', 'poly-bravais', 'poly-facesym'],
  },
  {
    heading: '#ctl-poly-lat > summary',
    intro: 'Alles in diesem Abschnitt ändert das Gitter und damit die Winkel zwischen den Flächen, also auch das Stereogramm.',
    ids: ['lat-ba', 'lat-ca', 'lat-al', 'lat-be', 'lat-ga', 'poly-broken', 'break-mode', 'stretch-dir', 'stretch-s'],
  },
  {
    heading: '#ctl-poly-shape > summary',
    intro: 'Die Gestalt ändert nur den Körper, nicht das Stereogramm.',
    ids: ['poly-size', 'ctl-ex-dists', 'poly-open', 'poly-aux'],
  },
  {
    heading: '#sec-view > summary',
    intro: 'Weitere Optionen, nach Tafel geordnet: was Stereogramm und 3D-Konstruktion gemeinsam betrifft, nur das Stereogramm oder nur die 3D-Konstruktion.',
    ids: ['pg-poles', 'poly-poles', 'v-dircolors', 'v-axes', 'pg-colorful', 'poly-lower', 'v-wulff', 'v-wulffrot', 'v-sphere', 'v-globe', 'v-plane', 'v-rays', 'v-normals', 'zone-btn', 'angle-btn-3d', 'view-oblique'],
  },
];

/** Beschriftung in der ⓘ-Erklärung, wo der Text des Elements nicht passt. */
export const LABELS = {
  'zone-btn': 'Zone', 'angle-btn': 'Winkel', 'angle-btn-3d': 'Winkel', 'view-oblique': 'Ansichten in 3D', 'ctl-ex-dists': 'Abstände der Formen', 'break-mode': 'Art des Symmetriebruchs',
};

/** @import { Ablauf } from '../lib/common/js/ablauf.js' */
/**
 * Erste Schritte (lib/common/js/ablauf.js mit liste: false, Leitfaden Abschn. 5.3): je Modus vier kurze
 * Schritte zur Bedienung, ohne Vermutung. Die Handlungen sind Aktionen der App (js/main.js), weil sie Ansichten
 * und die Auswahl einer Fläche setzen, die nicht in der Adresse stehen. Der letzte Schritt nennt die Experimente.
 * @type {Ablauf[]}
 */
export const ERSTE_SCHRITTE = [
  {
    id: 'einstieg-pg', modus: 'pg', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Punktgruppe wählen.</b> Das Stereogramm zeigt ihr Symmetriegerüst: Drehachsen als Symbole, Spiegelebenen als kräftige Grosskreise.', handlung: { text: '4<i>mm</i> wählen', aktion: 'pg1' } },
      { frage: '<b>Ausgangspol ziehen.</b> Alle Operationen der Gruppe wirken auf ihn; in allgemeiner Lage entstehen so viele Pole, wie die Gruppe Operationen hat, bei 4<i>mm</i> acht. Nahe einer Spiegelebene oder Achse rastet er ein: spezielle Lage, weniger Pole.', handlung: { text: 'Auf eine Spiegelebene setzen', aktion: 'pg2' } },
      { frage: '<b>Drehung oder Spiegelung?</b> Farbig erscheinen die Pole gleicher Händigkeit (aus Drehungen) in einer Farbe, die Spiegelbilder in der anderen.', handlung: { text: 'Farben einschalten', aktion: 'pg3' } },
      { frage: '<b>Symbol lesen.</b> Das Symbol nennt die Symmetrie entlang der Blickrichtungen, bei 4<i>mm</i> [001], ⟨100⟩ und ⟨110⟩. Mit „Blick“ unter der 3D-Ansicht schaut man entlang einer von ihnen. Kleine Versuche dazu stehen unter „Experimente“.', handlung: { text: 'Entlang [001] sehen', aktion: 'pg4' } },
    ],
  },
  {
    id: 'einstieg-poly', modus: 'poly', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Kristall wählen.</b> Der Galenit (PbS) steht im Zentrum einer Kugel; jede Fläche hat eine Normale.', handlung: { text: 'Galenit laden', aktion: 'poly1' } },
      { frage: '<b>Fläche antippen.</b> Eine Fläche in der 3D-Ansicht antippen: Ihr Pol im Stereogramm leuchtet auf, und umgekehrt.', handlung: { text: 'Fläche (001) zeigen', aktion: 'poly2' } },
      { frage: '<b>Projektion verfolgen.</b> Die Normale trifft die Kugel im Flächenpol; der Strahl zum Südpol schneidet die Äquatorebene im Punkt des Stereogramms. Pol oben: Punkt, unten: Kreis.', handlung: { text: 'Seitlich ansehen', aktion: 'poly3' } },
      { frage: '<b>Symmetrie erkennen.</b> Das Symmetriegerüst von <i>m</i><span class="ov">3</span><i>m</i> erklärt, warum die Pole so liegen. Im Tab „Punktgruppen“ wirkt es auf einen einzelnen Pol. Kleine Versuche dazu stehen unter „Experimente“.', handlung: { text: 'Gerüst einblenden', aktion: 'poly4' } },
    ],
  },
];

/**
 * Lernexperimente im Abschnitt „Experimente“ (lib/common/js/ablauf.js, Leitfaden Abschn. 5.3): erst vermuten,
 * dann die Handlung (Link-Adresse), dann Beobachtung und Erklärung. Themen: Pole in allgemeiner und spezieller
 * Lage, Drehinversion 4̄ gegen 4/m, Laue-Klasse, Lage der Pole bei Prisma, Pyramide und Dipyramide,
 * Flächenzahl einer Form. tests/ablauf.test.mjs prüft Adressen, Anker und Aussagen gegen die App.
 * @type {Ablauf[]}
 */
export const ABLAEUFE = [
  {
    id: 'lage', modus: 'pg', titel: 'Allgemeine und spezielle Lage',
    schritte: [
      {
        frage: '4<i>mm</i> hat 8 Operationen. Wie viele Pole ergibt ein Ausgangspol in allgemeiner Lage, also auf keinem Symmetrieelement?',
        vermutung: ['4', '8', '16'], richtig: 1,
        handlung: { text: '4<i>mm</i> wählen', hash: '#m=pg&g=4mm' },
        beobachtung: '8 Pole.',
        erklaerung: 'Jede Operation bringt den Pol an eine andere Stelle: so viele Pole wie Operationen.',
        skript: 'allgemein',
      },
      {
        frage: 'Wie viele sind es, wenn der Pol auf einer Spiegelebene liegt?',
        vermutung: ['8', '4', '2'], richtig: 1,
        handlung: { text: 'Pol auf eine Spiegelebene setzen', hash: '#m=pg&g=4mm&az=0' },
        beobachtung: '4 Pole: Je zwei fallen auf der Spiegelebene zusammen.',
        erklaerung: 'Die Spiegelung hält den Pol fest. Zahl der Pole mal Ordnung der Lagesymmetrie ergibt die Ordnung der Gruppe: 4 · 2 = 8.',
        skript: 'multiplizitaet',
      },
      {
        frage: 'Und auf der 4-zähligen Drehachse, in der Mitte des Stereogramms?',
        vermutung: ['4', '2', '1'], richtig: 2,
        handlung: { text: 'Pol auf die Drehachse setzen', hash: '#m=pg&g=4mm&rho=0' },
        beobachtung: 'Ein einziger Pol: Alle 8 Operationen halten ihn fest.',
        erklaerung: 'Das ist die Form {001}, ein Pedion.',
        skript: 'lage-pol',
      },
    ],
  },
  {
    id: 'drehinversion', modus: 'pg', titel: 'Drehinversion <span class="ov">4</span> und 4/<i>m</i>',
    schritte: [
      {
        frage: 'Wie viele Pole erzeugt die Drehinversionsachse <span class="ov">4</span> aus einem allgemeinen Pol?',
        vermutung: ['2', '4', '8'], richtig: 1,
        handlung: { text: '<span class="ov">4</span> wählen', hash: '#m=pg&g=-4' },
        beobachtung: '4 Pole, abwechselnd oben (Punkt) und unten (Kreis).',
        erklaerung: 'Jede Anwendung dreht um 90° und invertiert: Der Pol wechselt dabei die Halbkugel.',
        skript: 'drehinversion',
      },
      {
        frage: 'Und 4/<i>m</i>, eine 4-zählige Drehachse mit Spiegelebene senkrecht dazu?',
        vermutung: ['4', '8'], richtig: 1,
        handlung: { text: '4/<i>m</i> wählen', hash: '#m=pg&g=4/m' },
        beobachtung: '8 Pole: Über jedem Punkt liegt ein Kreis, das Spiegelbild in der unteren Halbkugel.',
        erklaerung: '4/<i>m</i> hat 8 Operationen: die 4 von <span class="ov">4</span> und dazu die Drehungen um 90° und 270°, die Spiegelung <i>m</i> und die Inversion <span class="ov">1</span>. Deshalb sind es doppelt so viele Pole.',
        skript: 'untergruppe',
      },
    ],
  },
  {
    id: 'laue', modus: 'pg', titel: 'Laue-Klasse',
    schritte: [
      {
        frage: 'Die Laue-Klasse ist die Punktgruppe zusammen mit dem Inversionszentrum. Zu welcher Laue-Klasse gehört <span class="ov">4</span>?',
        vermutung: ['<span class="ov">4</span>', '4/<i>m</i>', '4/<i>mmm</i>'], richtig: 1,
        handlung: { text: '<span class="ov">4</span> wählen', hash: '#m=pg&g=-4' },
        beobachtung: 'Die Kenndaten nennen die Laue-Klasse 4/<i>m</i>.',
        erklaerung: '<span class="ov">4</span> zusammen mit <span class="ov">1</span> ergibt 4/<i>m</i>; ebenso 4 und 4/<i>m</i> selbst. Drei Punktgruppen, eine Laue-Klasse.',
        skript: 'eigenschaften',
      },
    ],
  },
  {
    id: 'prisma', modus: 'poly', titel: 'Prisma, Pyramide, Dipyramide',
    schritte: [
      {
        frage: 'Wo liegen im Stereogramm die Pole der Flächen eines tetragonalen Prismas?',
        vermutung: ['auf dem Grundkreis', 'nur in der oberen Halbkugel', 'oben und unten'], richtig: 0,
        handlung: { text: 'Tetragonales Prisma zeigen', hash: '#m=form&sys=tetragonal&f=4/mmm:c10&offen=1' },
        beobachtung: 'Auf dem Grundkreis: Die Flächen sind parallel zur 4-zähligen Achse, ihre Normalen liegen in der Äquatorebene.',
        skript: 'form',
      },
      {
        frage: 'Und die Pole der tetragonalen Pyramide {111} in 4<i>mm</i>?',
        vermutung: ['auf dem Grundkreis', 'nur in der oberen Halbkugel', 'oben und unten'], richtig: 1,
        handlung: { text: 'Tetragonale Pyramide zeigen', hash: '#m=form&sys=tetragonal&f=4mm:b8&offen=1' },
        beobachtung: 'Nur oben (Punkte).',
        erklaerung: 'Ohne Spiegelebene senkrecht zur Achse bleibt jede Fläche auf ihrer Seite; die Pyramide {111} liegt ganz oben, {11<span class="ov">1</span>} läge ganz unten.',
        skript: 'form',
      },
      {
        frage: 'Und die Pole der tetragonalen Dipyramide {111} in 4/<i>mmm</i>?',
        vermutung: ['auf dem Grundkreis', 'nur in der oberen Halbkugel', 'oben und unten'], richtig: 2,
        handlung: { text: 'Tetragonale Dipyramide zeigen', hash: '#m=form&sys=tetragonal&f=4/mmm:e14' },
        beobachtung: 'Oben und unten: Über jedem Punkt liegt ein Kreis.',
        erklaerung: 'Die Spiegelebene senkrecht zur Achse bildet die obere Pyramide auf die untere ab.',
        skript: 'form',
      },
    ],
  },
  {
    id: 'flaechenzahl', modus: 'poly', titel: 'Wie viele Flächen?',
    schritte: [
      {
        frage: 'Wie viele Flächen hat die Form {110} in <i>m</i><span class="ov">3</span><i>m</i>?',
        vermutung: ['6', '8', '12'], richtig: 2,
        handlung: { text: '{110} zeigen', hash: '#m=form&sys=kubisch&f=m-3m:c40' },
        beobachtung: '12 Flächen: das Rhombendodekaeder.',
        erklaerung: 'Alle Vertauschungen und Vorzeichen von 1, 1, 0 ergeben 12 Normalen.',
        skript: 'multiplizitaet',
      },
      {
        frage: '{111} ist in <i>m</i><span class="ov">3</span><i>m</i> ein Oktaeder mit 8 Flächen. Wie viele Flächen hat {111} in <span class="ov">4</span>3<i>m</i>?',
        vermutung: ['8', '4'], richtig: 1,
        handlung: { text: '{111} in <span class="ov">4</span>3<i>m</i> zeigen', hash: '#m=form&sys=kubisch&f=-43m:a33' },
        beobachtung: '4 Flächen: ein Tetraeder.',
        erklaerung: 'Die Operationen von <span class="ov">4</span>3<i>m</i> vertauschen die Indizes und ändern immer eine gerade Zahl von Vorzeichen. Flächen wie (<span class="ov">1</span><span class="ov">1</span><span class="ov">1</span>) mit einer ungeraden Zahl gehören deshalb nicht zur Form von (111); sie bilden ein zweites Tetraeder.',
        skript: 'multiplizitaet',
      },
    ],
  },
];
