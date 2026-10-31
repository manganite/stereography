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
  'reset-all': 'Alle Einstellungen und den gespeicherten Zustand löschen und die App neu starten.',
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
  'view-oblique': 'Schräger Blick auf Kugel, Kristall und Äquatorebene. Die Knöpfe daneben blicken entlang der drei Blickrichtungen des Kristallsystems (triklin: entlang a, b, c); liegt eine davon parallel zur Projektionsrichtung, zeigt sie das Bild wie im Stereogramm.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
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
