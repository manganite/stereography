// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (alle Geräte).
// Die Mechanik steht in lib/common/js/help.js; Begriffe nach Borchardt-Ott & Sowa, Kristallographie (2018).

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  // Kopfzeile
  'tab-pg': 'Symmetriegerüste der 32 Punktgruppen und wie ihre Operationen einen Pol vervielfältigen.',
  'tab-poly': 'Kristallformen und Beispielkristalle: Flächen, ihre Pole im Stereogramm und der Kristall in 3D.',
  'skript-link': 'Skript zur App: Indizes, Projektion, Symmetrie und Punktgruppen, Symmetriegerüste, Blickrichtungen, Kristallformen, Zonen, Tracht und Habitus, trigonale und hexagonale Kristalle.',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren, z. B. für Folien.',
  'help-open': 'Hilfe: was man mit der App machen kann und wie, mit Anleitungen und den Experimenten.',
  // Punktgruppen
  'pg-elements': 'Symmetrieelemente im Stereogramm: Drehachsen als Symbole an ihren Durchstosspunkten, Spiegelebenen als kräftige Grosskreise.',
  'pg-object': 'Ein Pol, der auf keinem Symmetrieelement liegt. Alle Operationen der Gruppe wirken auf ihn; die Zahl der Pole ist die Ordnung der Gruppe.',
  'pg-poles': 'Die Pole der Objekte im Stereogramm und auf der Umkugel. Ausgeschaltet bleiben die Objekte in 3D sichtbar: So lässt sich das Stereogramm selbst vorhersagen.',
  'pg-colorful': 'Pole, die durch eine Drehung aus dem Ausgangspol entstehen, in einer Farbe; Spiegelbilder (aus Spiegelung, Inversion oder Drehinversion) in der anderen.',
  'pg-theta': 'Poldistanz ρ: Winkel des Ausgangspols vom Nordpol, also vom Zentrum des Stereogramms. Negative Werte: untere Halbkugel, vom Südpol gezählt.',
  'pg-phi': 'Azimut φ: Drehwinkel um die Projektionsrichtung, ab dem rechten Rand im Uhrzeigersinn; (100) liegt bei 90°.',
  // Kristallformen
  'ex-select': 'Kristalle aus Lehrbüchern: mehrere Formen derselben Punktgruppe, jede in eigener Farbe.',
  'sys-select': 'Bestimmt das Achsensystem und die Punktgruppen, deren Formen zur Auswahl stehen.',
  'form-select': 'Angeboten: allgemeine Form und Formen mit der Punktgruppe als Eigensymmetrie; alle mit „Flächensymmetrie zeigen“.',
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
  'reset-alles': 'Alle Einstellungen und den gespeicherten Zustand löschen und die App neu starten (der Fortschritt im Quiz und der Stand der Experimente bleiben).',
  // Stereogramm und 3D
  'zone-btn': 'Zone bestimmen: zwei Pole oder Flächen wählen. Zeigt Zonenkreis, Zonenachse [uvw] und alle Flächen der Zone.',
  'zone-btn-3d': 'Zone bestimmen: zwei Pole oder Flächen wählen. Zeigt Zonenkreis, Zonenachse [uvw] und alle Flächen der Zone.',
  'angle-btn': 'Winkel messen: zwei Pole oder Flächen wählen. Zeigt den Normalenwinkel, bei Punktgruppen auch die Operation.',
  'angle-btn-3d': 'Winkel messen: zwei Pole oder Flächen wählen. Zeigt Normalen- und Flächenwinkel.',
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
    intro: 'Nach der Wahl einer Punktgruppe zeigt das Stereogramm ihr Symmetriegerüst. Gruppen mit zwei Aufstellungen (z. B. 32) bieten darunter die Wahl der Aufstellung an.',
    ids: [],
  },
  {
    heading: '#ctl-pg-opts > summary',
    intro: 'Zählweise wie bei Borchardt-Ott: ρ auf der oberen Halbkugel vom Nordpol (Zentrum), auf der unteren vom Südpol mit negativem Vorzeichen; φ vom rechten Rand (→, bei orthogonalen Achsen die b-Achse) im Uhrzeigersinn, (100) liegt bei 90°. Im Stereogramm lässt sich der Ausgangspol ziehen; nahe einer Achse oder Spiegelebene rastet er ein (spezielle Lage).',
    ids: ['pg-elements', 'pg-object', 'pg-theta', 'pg-phi', 'angle-btn'],
  },
  {
    heading: '#ctl-poly > h2',
    intro: 'Pol oder Fläche anklicken oder antippen hebt beide hervor: Jede Fläche hat genau einen Pol. Die Auswahl „Form“ bietet je Punktgruppe die allgemeine Form und die Formen mit der Punktgruppe als Eigensymmetrie an, im trigonalen System auch das trigonale und das hexagonale Prisma (Eigensymmetrie hexagonal); alle Formen mit „Flächensymmetrie zeigen“.',
    ids: ['ex-select', 'sys-select', 'form-select', 'preset-select', 'poly-labels', 'poly-frame', 'poly-bravais', 'poly-facesym'],
  },
  {
    heading: '#ctl-poly-lat > summary',
    intro: 'Alles in diesem Abschnitt ändert das Gitter und damit die Winkel zwischen den Flächen, also auch das Stereogramm.',
    ids: ['lat-ba', 'lat-ca', 'lat-al', 'lat-be', 'lat-ga', 'poly-broken', 'break-mode', 'stretch-dir', 'stretch-s'],
  },
  {
    heading: '#ctl-poly-shape > summary',
    intro: 'Die Gestalt ändert nur den Körper, nicht das Stereogramm: Die Pole hängen nur von den Flächennormalen ab.',
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
 * und die Auswahl einer Fläche setzen, die nicht in der Adresse stehen, und auf dem Telefon die passende Tafel zeigen.
 * Der letzte Schritt nennt die Experimente. Zugleich die Anleitungen der Hilfeseite (js/hilfe-daten.js): zeige =
 * Bedienelement, das ihr Bild markiert, bild = Zustand im Bild (Aktionen wirken nicht auf die Bilder;
 * tools/common/hilfe-bilder.mjs).
 * @type {Ablauf[]}
 */
export const ERSTE_SCHRITTE = [
  {
    id: 'einstieg-pg', modus: 'pg', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Punktgruppe wählen.</b> Das Stereogramm zeigt ihr Symmetriegerüst: Drehachsen als Symbole, Spiegelebenen als kräftige Grosskreise.', handlung: { text: '4<i>mm</i> wählen', aktion: 'pg1' }, zeige: '#pg-picker' },
      { frage: '<b>Ausgangspol ziehen.</b> Alle Operationen der Gruppe wirken auf ihn; in allgemeiner Lage entstehen so viele Pole, wie die Gruppe Operationen hat, bei 4<i>mm</i> acht. Nahe einer Spiegelebene oder Achse rastet er ein: spezielle Lage, weniger Pole.', handlung: { text: 'Auf eine Spiegelebene setzen', aktion: 'pg2' }, zeige: '#stereo', bild: '#m=pg&g=4mm' },
      { frage: '<b>Drehung oder Spiegelung?</b> Farbig erscheinen die Pole gleicher Händigkeit (aus Drehungen) in einer Farbe, die Spiegelbilder in der anderen.', handlung: { text: 'Farben einschalten', aktion: 'pg3' }, zeige: '#row-pg-colorful', bild: '#m=pg&g=4mm&az=0' },
      { frage: '<b>Symbol lesen.</b> Das Symbol nennt die Symmetrie entlang der Blickrichtungen, bei 4<i>mm</i> [001], ⟨100⟩ und ⟨110⟩. Mit „Blick“ unter der 3D-Ansicht schaut man entlang einer von ihnen. Kleine Versuche dazu stehen unter „Experimente“.', handlung: { text: 'Entlang [001] sehen', aktion: 'pg4' }, zeige: '#inhalt .p-b .viewbar', bild: '#m=pg&g=4mm&hand=1' },
    ],
  },
  {
    id: 'einstieg-poly', modus: 'poly', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Kristall wählen.</b> Der Galenit (PbS) steht im Zentrum einer Kugel; jede Fläche hat eine Normale.', handlung: { text: 'Galenit laden', aktion: 'poly1' }, zeige: '#ex-select' },
      { frage: '<b>Fläche wählen.</b> Eine Fläche in der 3D-Ansicht anklicken oder antippen: Ihr Pol im Stereogramm leuchtet auf, und umgekehrt.', handlung: { text: 'Fläche (001) zeigen', aktion: 'poly2' }, zeige: '#view3d', bild: '#m=form&sys=kubisch&bsp=galenit' },
      { frage: '<b>Projektion verfolgen.</b> Die Normale trifft die Kugel im Flächenpol; der Strahl zum Südpol schneidet die Äquatorebene im Punkt des Stereogramms. Pol oben: Punkt, unten: Kreis.', handlung: { text: 'Seitlich ansehen', aktion: 'poly3' }, zeige: '#inhalt .p-b .viewbar', bild: '#m=form&sys=kubisch&bsp=galenit' },
      { frage: '<b>Symmetrie erkennen.</b> Das Symmetriegerüst von <i>m</i><span class="ov">3</span><i>m</i> erklärt, warum die Pole so liegen. Im Tab „Punktgruppen“ wirkt es auf einen einzelnen Pol. Kleine Versuche dazu stehen unter „Experimente“.', handlung: { text: 'Gerüst einblenden', aktion: 'poly4' }, zeige: '#ctl-poly label:has(#poly-frame)', bild: '#m=form&sys=kubisch&bsp=galenit&blick=3' },
    ],
  },
];

/**
 * Lernexperimente im Abschnitt „Experimente“ (lib/common/js/ablauf.js, Leitfaden Abschn. 5.3): erst vermuten,
 * dann die Handlung (Link-Adresse), dann Beobachtung und Erklärung. Je Modus in der Reihenfolge des Skripts (Anker des
 * ersten Schritts; #115; Gliederung der Liste nach Kapitel: crystallography-common#107). Jedes Experiment spricht eine
 * Fehlvorstellung an. tests/ablauf.test.mjs prüft Adressen, Anker und Aussagen gegen die App.
 * @type {Ablauf[]}
 */
export const ABLAEUFE = [
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
    id: 'untergruppe', modus: 'pg', titel: 'Untergruppe oder nicht?',
    schritte: [
      {
        frage: 'Die 6-zählige Achse von 6<i>mm</i> enthält eine 3-zählige. Ist 32 deshalb eine Untergruppe von 6<i>mm</i>?',
        vermutung: ['ja', 'nein'], richtig: 1,
        handlung: { text: '6<i>mm</i> wählen', hash: '#m=pg&g=6mm' },
        beobachtung: 'Sechs Spiegelebenen durch die Achse, aber keine 2-zählige Achse in der Projektionsebene.',
        erklaerung: '32 braucht drei 2-zählige Achsen senkrecht zur 3-zähligen. 6<i>mm</i> hat keine; 32 ist also keine Untergruppe. Mit 3-zähliger Achse sind 3 und 3<i>m</i> Untergruppen von 6<i>mm</i>.',
        skript: 'untergruppe',
      },
      {
        frage: 'Zum Vergleich: das Symmetriegerüst von 32.',
        handlung: { text: '32 wählen', hash: '#m=pg&g=321' },
        beobachtung: 'Drei 2-zählige Achsen in der Projektionsebene, keine Spiegelebene.',
        skript: 'untergruppe',
      },
    ],
  },
  {
    id: 'oben-unten-222', modus: 'pg', titel: 'Oben oder unten? (222)',
    schritte: [
      {
        frage: '222 hat drei 2-zählige Achsen: eine senkrecht zur Projektionsebene, zwei in ihr. Der Ausgangspol liegt oben. Wo liegen die übrigen Pole?',
        vermutung: ['alle oben', 'einer oben, zwei unten', 'alle unten'], richtig: 1,
        handlung: { text: '222 wählen', hash: '#m=pg&g=222' },
        beobachtung: '4 Pole: zwei oben (Punkte), zwei unten (Kreise).',
        erklaerung: 'Die Drehung um die senkrechte Achse lässt den Pol oben. Die Drehungen um die beiden Achsen in der Projektionsebene bringen ihn auf die untere Halbkugel.',
        skript: 'abbilden',
      },
    ],
  },
  {
    id: 'inversion-2m', modus: 'pg', titel: '2/<i>m</i> und die Inversion',
    schritte: [
      {
        frage: '2/<i>m</i> hat eine 2-zählige Drehachse und eine Spiegelebene senkrecht dazu. Wie viele Operationen hat die Gruppe?',
        vermutung: ['2', '3', '4'], richtig: 2,
        handlung: { text: '2/<i>m</i> (Achse c) wählen', hash: '#m=pg&g=2/mc' },
        beobachtung: '4 Pole: an zwei gegenüberliegenden Stellen je ein Punkt über einem Kreis.',
        erklaerung: 'Zum Ausgangspol gehört ein Kreis genau gegenüber, durch die Mitte gespiegelt: die Inversion <span class="ov">1</span>. Sie entsteht, wenn man 2 und <i>m</i> nacheinander ausführt. 2/<i>m</i> hat also vier Operationen: 1, 2, <i>m</i> und <span class="ov">1</span>.',
        skript: 'symmetriesaetze',
      },
    ],
  },
  {
    id: 'dreiquer', modus: 'pg', titel: '<span class="ov">3</span> und die Spiegelebenen',
    schritte: [
      {
        frage: 'Die 6 Pole von <span class="ov">3</span> bilden ein Sechseck, abwechselnd oben und unten; das Muster sieht spiegelsymmetrisch aus. Hat <span class="ov">3</span> Spiegelebenen?',
        vermutung: ['ja', 'nein'], richtig: 1,
        handlung: { text: '<span class="ov">3</span> wählen', hash: '#m=pg&g=-3' },
        beobachtung: 'Das Symmetriegerüst zeigt nur die <span class="ov">3</span>-Achse in der Mitte, keine Spiegelebene.',
        erklaerung: 'Die Pole einer einzigen Form können symmetrischer liegen als die Punktgruppe: Das Muster gleicht dem eines Rhomboeders in <span class="ov">3</span><i>m</i>. <span class="ov">3</span> hat 6 Operationen: die Identität, zwei Drehungen um 120°, die Inversion und zwei Drehinversionen <span class="ov">3</span>; keine davon ist eine Spiegelung.',
        skript: 'speziell',
      },
      {
        frage: 'Wie viele Pole ergibt derselbe Ausgangspol in <span class="ov">3</span><i>m</i>, das Spiegelebenen hat?',
        vermutung: ['6', '12'], richtig: 1,
        handlung: { text: '<span class="ov">3</span><i>m</i> wählen', hash: '#m=pg&g=-3m1' },
        beobachtung: '12 Pole.',
        erklaerung: '<span class="ov">3</span><i>m</i> hat 12 Operationen. Hätte <span class="ov">3</span> Spiegelebenen, ergäbe ein Pol in allgemeiner Lage auch dort 12 Pole.',
        skript: 'bahn',
      },
    ],
  },
  {
    id: 'symbol-432', modus: 'pg', titel: 'Was bedeutet die 3 in 432?',
    schritte: [
      {
        frage: 'Wofür steht die 3 im Symbol 432?',
        vermutung: ['eine 3-zählige Achse entlang c', 'vier 3-zählige Achsen entlang der Raumdiagonalen', 'drei 3-zählige Achsen entlang a, b und c'], richtig: 1,
        handlung: { text: '432 wählen, nur die 2. Blickrichtung in 3D', hash: '#m=pg&g=432&aus=1,3' },
        beobachtung: 'In der 3D-Ansicht bleiben vier 3-zählige Achsen entlang der Raumdiagonalen; im Stereogramm haben sie die Farbe der 2. Blickrichtung.',
        erklaerung: 'Jede Stelle des Symbols gehört zu einer Blickrichtung, kubisch der Reihe nach ⟨100⟩, ⟨111⟩ und ⟨110⟩. Die 3 an zweiter Stelle steht also für die Achsen entlang ⟨111⟩.',
        skript: 'symbol',
      },
    ],
  },
  {
    id: 'chiral', modus: 'pg', titel: 'Chiral trotz viel Symmetrie',
    schritte: [
      {
        frage: '422 hat 8 Operationen. Färbt man die Pole nach Händigkeit, wie viele haben die Händigkeit des Ausgangspols?',
        vermutung: ['alle 8', '4', '1'], richtig: 0,
        handlung: { text: '422, Pole nach Händigkeit gefärbt', hash: '#m=pg&g=422&hand=1' },
        beobachtung: 'Alle 8 Pole in derselben Farbe.',
        erklaerung: '422 enthält nur Drehungen, also nur Operationen erster Art: Die Punktgruppe ist enantiomorph (chiral). Viel Symmetrie und Chiralität schliessen sich nicht aus.',
        skript: 'eigenschaften',
      },
      {
        frage: 'Und 432, mit 24 Operationen?',
        vermutung: ['alle 24', '12', '1'], richtig: 0,
        handlung: { text: '432, Pole nach Händigkeit gefärbt', hash: '#m=pg&g=432&hand=1' },
        beobachtung: 'Alle 24 Pole in derselben Farbe.',
        erklaerung: 'Auch 432 enthält nur Drehungen und ist enantiomorph, obwohl es die Hälfte der Würfelsymmetrie hat.',
        skript: 'eigenschaften',
      },
      {
        frage: 'Und in 4/<i>mmm</i>, mit 16 Operationen?',
        vermutung: ['alle 16', '8', '4'], richtig: 1,
        handlung: { text: '4/<i>mmm</i>, Pole nach Händigkeit gefärbt', hash: '#m=pg&g=4/mmm&hand=1' },
        beobachtung: '8 Pole in der Farbe des Ausgangspols, 8 in der anderen.',
        erklaerung: 'Die 8 Drehungen erhalten die Händigkeit; die 8 Spiegelungen, Drehinversionen und die Inversion bilden Spiegelbilder.',
        skript: 'eigenschaften',
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
    id: 'flaechensymmetrie', modus: 'poly', titel: 'Gleiche Form, andere Flächensymmetrie',
    schritte: [
      {
        frage: 'Der Würfel kommt in allen fünf kubischen Punktgruppen vor, die Pole liegen immer gleich. Zuerst der Würfel in <i>m</i><span class="ov">3</span><i>m</i>; „Flächensymmetrie zeigen“ trägt auf jede Fläche ein Muster.',
        handlung: { text: 'Würfel in <i>m</i><span class="ov">3</span><i>m</i> mit Flächenmuster', hash: '#m=form&sys=kubisch&f=m-3m:a34&muster=1' },
        beobachtung: 'Das Muster auf jeder Fläche hat eine 4-zählige Achse und Spiegelebenen (4<i>m</i>.<i>m</i>).',
        skript: 'allgemein',
      },
      {
        frage: 'Hat der Würfel in 23 dieselbe Flächensymmetrie wie in <i>m</i><span class="ov">3</span><i>m</i>?',
        vermutung: ['ja', 'nein'], richtig: 1,
        handlung: { text: 'Würfel in 23 mit Flächenmuster', hash: '#m=form&sys=kubisch&f=23:b34&muster=1' },
        beobachtung: 'Das Muster hat nur noch eine 2-zählige Achse (2..); die Pole liegen wie vorher.',
        erklaerung: 'Die Form allein legt die Punktgruppe nicht fest. Erst die Flächensymmetrie unterscheidet die Würfel, an realen Kristallen z. B. Ätzfiguren oder Streifung.',
        skript: 'allgemein',
      },
    ],
  },
  {
    id: 'lage-111', modus: 'poly', titel: 'Würfel mit [111] senkrecht',
    schritte: [
      {
        frage: 'Der Würfel wird so gedreht, dass die Raumdiagonale [111] senkrecht zur Projektionsebene steht. Welche Zähligkeit hat die Drehachse in der Mitte des Stereogramms?',
        vermutung: ['4', '3', '2'], richtig: 1,
        handlung: { text: 'Würfel mit [111] senkrecht zeigen', hash: '#m=form&sys=kubisch&f=m-3m:a34&lage=111&geruest=1' },
        beobachtung: 'In der Mitte eine <span class="ov">3</span>-Achse (3-zählig); drei Würfelpole liegen oben, drei unten dazwischen, alle gleich weit von der Mitte (ρ = 54,7° bzw. −54,7°).',
        erklaerung: 'Gleicher Kristall, andere Projektionsrichtung: Das Stereogramm ändert sich, die Punktgruppe nicht. Entlang der Raumdiagonalen liegen beim Würfel <span class="ov">3</span>-Achsen.',
        skript: 'lage',
      },
    ],
  },
  {
    id: 'zone', modus: 'poly', titel: 'Zone und Zonenachse',
    schritte: [
      {
        frage: 'Welche Flächen des Galenits gehören zur Zone [001]?',
        vermutung: ['die Flächen parallel zu [001]', 'die Flächen senkrecht zu [001]', 'die Flächen mit Pol nahe [001]'], richtig: 0,
        handlung: { text: 'Zone [001] zeigen', hash: '#m=form&sys=kubisch&bsp=galenit&w=zone&zonen=0,0,1' },
        beobachtung: 'Der Zonenkreis ist der Grundkreis; auf ihm liegen die Pole von {100} und {110}.',
        erklaerung: 'Zur Zone [<i>uvw</i>] gehören die Flächen, die parallel zu [<i>uvw</i>] liegen: <i>hu</i> + <i>kv</i> + <i>lw</i> = 0. Ihre Normalen stehen senkrecht auf der Zonenachse und liegen auf einem Grosskreis.',
        skript: 'zone',
      },
      {
        frage: 'Liegen (001), (110) und (111) in einer gemeinsamen Zone?',
        vermutung: ['ja', 'nein'], richtig: 0,
        handlung: { text: 'Zone durch (001) und (110) zeigen', hash: '#m=form&sys=kubisch&bsp=galenit&w=zone&zonen=-1,1,0' },
        beobachtung: 'Ja: Alle drei liegen auf dem Zonenkreis der Zone [<span class="ov">1</span>10], einer Geraden durch die Mitte.',
        erklaerung: 'Für alle drei gilt <i>h</i> = <i>k</i>, also −<i>h</i> + <i>k</i> = 0. Ein Grosskreis durch die Projektionsrichtung erscheint im Stereogramm als Gerade.',
        skript: 'zonenkreis',
      },
    ],
  },
  {
    id: 'quarz', modus: 'poly', titel: 'Quarz sieht hexagonal aus',
    schritte: [
      {
        frage: 'Im Stereogramm des Quarzes liegen oben sechs Pole im Abstand von 60°, alle gleich weit von der Mitte. Ist Quarz deshalb hexagonal?',
        vermutung: ['ja', 'nein'], richtig: 1,
        handlung: { text: 'Quarz mit Prisma und zwei Rhomboedern zeigen', hash: '#m=form&sys=trigonal&bsp=quarz&ab=1,1.25,1.15,2,2&geruest=1' },
        beobachtung: 'Das Symmetriegerüst hat in der Mitte eine 3-zählige Achse; die Punktgruppe ist 32.',
        erklaerung: 'Die sechs Pole gehören zu zwei Rhomboedern, {101} und {011}, um 60° gegeneinander gedreht. Zwei trigonale Formen ergeben zusammen ein sechszähliges Polmuster.',
        skript: 'quarz',
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
  {
    id: 'streckung', modus: 'poly', titel: 'Strecken ändert die Symmetrie',
    schritte: [
      {
        frage: 'Die tetragonale Dipyramide {111} hat die Punktgruppe 4/<i>mmm</i>. Ändert sie sich, wenn man <i>c</i>/<i>a</i> von 1,3 auf 2 erhöht?',
        vermutung: ['nein, nur die Lage der Pole', 'ja, sie wird orthorhombisch'], richtig: 0,
        handlung: { text: '<i>c</i>/<i>a</i> = 2', hash: '#m=form&sys=tetragonal&f=4/mmm:e14&ca=2' },
        beobachtung: 'Die Pole rücken zum Grundkreis; die Punktgruppe bleibt 4/<i>mmm</i>.',
        erklaerung: '<i>c</i>/<i>a</i> ist im tetragonalen System frei: Die Symmetrie bleibt, nur die Winkel zwischen den Flächen ändern sich.',
        skript: 'verzerrung',
      },
      {
        frage: 'Und wenn man den Kristall (weiter mit <i>c</i>/<i>a</i> = 2) entlang [100] streckt?',
        vermutung: ['4/<i>mmm</i> bleibt', 'es bleibt <i>mmm</i>', 'es bleibt 4<i>mm</i>'], richtig: 1,
        handlung: { text: 'Entlang [100] strecken', hash: '#m=form&sys=tetragonal&f=4/mmm:e14&ca=2&br=1&str=100,1.3' },
        beobachtung: 'Die 4-zählige Achse geht verloren; die Infobox nennt <i>mmm</i>.',
        erklaerung: 'Die Streckung macht <i>a</i> und <i>b</i> verschieden lang. Erhalten bleiben nur die Operationen, die die Streckrichtung auf sich selbst oder ihre Gegenrichtung abbilden.',
        skript: 'verzerrung',
      },
      {
        frage: 'Ein Würfel wird entlang der Raumdiagonalen [111] gestreckt. Welche Punktgruppe bleibt?',
        vermutung: ['<i>m</i><span class="ov">3</span><i>m</i>', '<span class="ov">3</span><i>m</i>', '4/<i>mmm</i>'], richtig: 1,
        handlung: { text: 'Würfel entlang [111] strecken', hash: '#m=form&sys=kubisch&f=m-3m:a34&br=1&str=111,1.3' },
        beobachtung: 'Der Würfel wird zum Rhomboeder; die Infobox nennt <span class="ov">3</span><i>m</i>.',
        erklaerung: 'Von den vier <span class="ov">3</span>-Achsen bleibt nur die entlang der Streckrichtung, dazu die drei Spiegelebenen, die sie enthalten, und die drei 2-zähligen Achsen senkrecht zu ihr.',
        skript: 'streck-111',
      },
    ],
  },
];
