# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **Ausgangspol in spezieller Lage (Punktgruppen):** Nahe an einer Achse (4°) oder Spiegelebene (3°) rastet der Ausgangspol beim Ziehen ein; weiter weg bleibt er frei. Die Infobox zeigt unter „Lage des Ausgangspols“, ob die Lage allgemein oder speziell ist, mit Wyckoff-Lage und Lagesymmetrie nach ITA Tab. 10.1.2.2 (z. B. „speziell (24*e*, Lagesymmetrie ..*m*)“ in *m*3̄*m*), und erklärt die Polzahl: Ordnung der Gruppe geteilt durch die Zahl der Operationen, die den Pol festhalten. Zusammenfallende Pole werden einmal gezeichnet; fallen Bild und Spiegelbild zusammen, ist der Pol bei „Pole nach Händigkeit färben“ grau, in der 3D-Konstruktion liegen die Objekte übereinander. Auch Werte von ρ und φ aus Reglern oder Links, die auf einem Symmetrieelement liegen, gelten als spezielle Lage. Die Wyckoff-Lagen der Aufstellungen ohne eigenen Formkatalog (monoklin Achse *c*, 312, 31*m*, 3̄1*m*, 4̄*m*2, 6̄2*m*) stammen aus ITA Tab. 10.1.2.2.
- **Skript, neues Kapitel 8 „Lagen, Flächensymmetrie und Multiplizität“:** allgemeine und spezielle Lage, Lagesymmetrie, die sieben Lagen eines Pols in 4/*mmm*, Wyckoff-Lagen, orientiertes Symbol der Flächensymmetrie, Flächenzahl = Ordnung der Punktgruppe / Ordnung der Flächensymmetrie (mit Tabelle für *m*3̄*m*), Richtungen und Punktformen, Lage und Flächenform, erzeugende Symmetrie und Eigensymmetrie, Ausblick auf die Punktlagen der Raumgruppen. Quellen: Borchardt-Ott & Sowa Abschn. 9.2 und 10.4, ITA Abschn. 10.1.2.2–10.1.2.3, Hoffmann Abschn. 6.1.5. Das Kapitel „Symmetrieändernde Verzerrungen“ ist jetzt Kapitel 9.
- **Links aus der Infobox ins Skript:** hinter „Wyckoff-Lage, Flächensymmetrie“, „Eigensymmetrie der Form“ und „Lage des Ausgangspols“ führt „Skript →“ zum passenden Abschnitt von Kapitel 8.

### Geändert

- **„Lage“ heisst jetzt „Projektionsrichtung“:** Die Auswahl in der Karte „Kristallform“ und die Zeile in der Infobox heissen „Projektionsrichtung“, wie seit 1.3.0 im Skript und in den Erklärtexten. Die Auswahlpunkte nennen nur noch die Richtung ([001], [111], [110] bzw. c, a, b). So bleibt „Lage“ frei für die allgemeine und spezielle Lage von Flächen und Richtungen (Wyckoff-Lage in der Infobox).
- **Skript: Vorlesungsstoff und Vertiefung unterscheidbar.** Der Text ohne Kennzeichnung behandelt, was in Vorlesung und Übungen vorkommt. Was darüber hinausgeht, steht in Kästen „Vertiefung“ mit Thema und einem ersten Satz dazu, woran die Vertiefung anknüpft und wozu man sie braucht; ganze Abschnitte und Kapitel (vierstellige Indizes, Kap. 8 und 9) tragen das Etikett „Vertiefung“, auch im Inhaltsverzeichnis. Der Abschnitt zu den vierstelligen Indizes ist als Ganzes wie ein Vertiefungskasten abgesetzt. Vor Kap. 8 steht ein Trenner „Vertiefungen“ (auch als Zwischenüberschrift im Inhaltsverzeichnis), Kap. 8 und 9 tragen eine durchgehende Randlinie und beginnen mit einem Kasten „Bezug zur Vorlesung“. Bedienhinweise stehen in Kästen „In der App“. Lernziele und Zusammenfassungen nennen zuerst den Vorlesungsstoff, darunter „Zur Vertiefung“; Merke-Kästen in Vertiefungen sind gekennzeichnet. Eine kurze Einleitung vor Kapitel 1 erklärt die Kennzeichnung. Kein Inhalt ist weggefallen; Absätze wurden nur innerhalb ihres Abschnitts umgestellt.
- **Wyckoff-Lage mit Multiplizität:** Die Infobox schreibt die Wyckoff-Lage wie die International Tables, mit der Multiplizität vor dem Buchstaben, z. B. „6*a*, 4*m*.*m*“ für den Würfel in *m*3̄*m* (vorher „a“).

## [1.6.0] - 2026-10-24

3D-Konstruktion: Ansichten entlang der Blickrichtungen, Bildexport immer hell und durchsichtig, Flächenpole abschaltbar; Seitenleiste nach dem Prinzip „weniger auf einmal“.

### Hinzugefügt

- **Ansichten der 3D-Konstruktion entlang der Blickrichtungen:** Unter der 3D-Ansicht stehen neben „Schräg“ drei Knöpfe, je einer für die drei Blickrichtungen des Kristallsystems (Positionen im vollen Hermann-Mauguin-Symbol), mit deren Farbe: kubisch [001], [111], [110]; tetragonal [001], [100], [110]; trigonal und hexagonal [001], [100], [210]; orthorhombisch und monoklin [100], [010], [001]. Triklin, ohne Blickrichtung im Symbol, blickt entlang der Kristallachsen *a*, *b*, *c*. Aus jeder Richtungsfamilie wird die Richtung parallel zur Projektionsrichtung gewählt (Bild wie im Stereogramm), sonst eine senkrecht dazu (seitlicher Blick, Äquatorebene von der Kante); bei Kristallformen folgt die Wahl der Lage, z. B. kubisch mit [111] ∥ Projektionsrichtung: [100], [111], [11̄0]. Die Knöpfe ersetzen „Von oben“ und „Seitlich“.
- **3D-Konstruktion kopieren und speichern:** „Kopieren“ und „PNG“ im Kopf der 3D-Ansicht liefern die gezeigte Ansicht als PNG (etwa 2000 Pixel breit) mit allen Beschriftungen (Indizes, N und S, Achsen, Winkel).
- **Stereogramm auch als PNG:** Im Kopf des Stereogramms „Kopieren“, „SVG“ und „PNG“ (2048 × 2048 Pixel).
- **Flächenpole abschaltbar** (unter „Darstellung“), bei Punktgruppen und bei Kristallformen: Die Pole verschwinden aus Stereogramm und 3D-Konstruktion, die Objekte bzw. der Kristall bleiben. So lässt sich das Stereogramm zu einem Körper selbst vorhersagen oder als leere Vorlage exportieren. Ohne Pole entfallen auch Indizes, Projektionsstrahlen, Pole der unteren Halbkugel und die Färbung nach Händigkeit; ihre Schalter sind dann gesperrt und behalten ihre Einstellung. Im Link: `pole=0`.
- **Nord- und Südpol und Äquator der Umkugel abschaltbar** (unter „Darstellung“). Im Link: `ns=0`.

### Geändert

- **Bildexport immer hell und mit durchsichtigem Hintergrund,** auch wenn die App im Dunkelmodus läuft; beim Stereogramm bleibt die Kreisfläche weiss. So passen die Bilder auf Folien mit beliebigem Hintergrund. Die 3D-Konstruktion wird dafür unsichtbar ein zweites Mal gezeichnet; die Anzeige ändert sich nicht. Die Exporte sind auf dem Telefon ausgeblendet.
- **Seitenleiste nach dem Prinzip „weniger auf einmal“ geordnet:** Sichtbar ist, was man aus Vorlesung und Lehrbuch von einem Stereogramm erwartet; alle weiteren Anzeigeoptionen stehen unter **Darstellung**, gegliedert nach Tafel: „Stereogramm und 3D-Konstruktion“ (Flächenpole, Farben nach Blickrichtung, Kristallachsen), „Stereogramm“ (Pole nach Händigkeit bzw. der unteren Halbkugel, Wulffsches Netz), „3D-Konstruktion“ (Umkugel, Nord- und Südpol mit Äquator, Äquatorebene, Projektionsstrahlen, Flächennormalen). In der Karte „Kristallform“ trennt die Überschrift „Anzeigen“ die Auswahl von Indizes und Symmetriegerüst; das Gerüst heisst dort „(im Stereogramm)“, weil es in 3D nicht erscheint. Eingeklappte Abschnitte nennen unter ihrer Überschrift, was man in ihnen findet. Ein gesperrter Schalter sagt darunter, warum (z. B. „nur mit Flächenpolen“); Poldistanz und Azimut sind ohne „Objekt in allgemeiner Lage“ gesperrt. Weicht unter „Darstellung“ etwas vom Standard ab (z. B. über einen Link), öffnet sich der Abschnitt beim Laden.
- **Kopieren legt beim Stereogramm ein Bild (PNG) in die Zwischenablage** statt des SVG-Quelltexts; es lässt sich so direkt in Folien und Dokumente einfügen. Das SVG gibt es weiterhin über „SVG“ als Datei.

## [1.5.0] - 2026-10-20

Seitenleiste neu geordnet: „Gitter“ und „Gestalt“ getrennt; „Symmetrie brechen“ als einziger Weg zur Symmetrieänderung, mit Streckung oder allen Parametern frei.

### Geändert

- **„Gitter und Gestalt“ aufgeteilt** in zwei Abschnitte: **Gitter** (alles, was das Gitter und damit das Stereogramm ändert) und darunter **Gestalt** (Grösse, Abstände der Formen, offene Form und Ergänzungsformen; ändert nur den Körper, nicht das Stereogramm).
- **Symmetrie brechen** ist der einzige Weg zu einer Symmetrieänderung: Ohne den Schalter bleibt die Symmetrie immer erhalten. Mit ihm wählt man **Streckung** (entlang einer Blickrichtung, bezogen auf das unverzerrte Gitter) oder **Alle Parameter frei**. Bei der Streckung zeigen die Gitterregler das gestreckte Gitter und sind gesperrt; der Wechsel zu „Alle Parameter frei“ übernimmt das gezeigte Gitter.
- **Streckung nur noch entlang symmetrieändernder Richtungen:** tetragonal ⟨100⟩, ⟨110⟩; trigonal und hexagonal ⟨100⟩, ⟨210⟩; kubisch ⟨100⟩, ⟨111⟩, ⟨110⟩. Entlang *c* sowie im orthorhombischen und monoklinen System entfällt sie, weil sie dort nur Gitterparameter ändert, die das System ohnehin freilässt.
- Links: `str=` schaltet „Symmetrie brechen“ mit Streckung ein (auch Faktor 1); `br=1` ohne `str` bedeutet wie bisher alle Gitterparameter frei. Links und gespeicherter Zustand aus früheren Versionen gelten weiter (Streckung entlang *c* oder in orthorhombischen und monoklinen Kristallen wird ignoriert).

## [1.4.0] - 2026-10-20

Streckung entlang einer Blickrichtung (Würfel → Rhomboeder) und Skript-Kapitel 8 „Symmetrieändernde Verzerrungen“.

### Hinzugefügt

- **Skript, Kapitel 8 „Symmetrieändernde Verzerrungen“:** Streckung des Würfels entlang ⟨100⟩, ⟨111⟩ und ⟨110⟩ mit Restgruppen 4/*mmm*, 3̄*m*, *mmm* (je Körper und Stereogramm über dem verbleibenden Symmetriegerüst), Unterschied zwischen Streckung und Polarisation (polare Gruppen 4*mm*, *mm*2, 3*m*) und als Beispiel aus der Natur die drei ferroelektrischen Phasen von BaTiO₃ mit Eigenschaften und Domänen. Ein Ausblick über den Stoff der Vorlesung hinaus, als Motivation gedacht.
- **Streckung entlang einer Blickrichtung** (unter „Gitter und Gestalt“): Richtung aus jeder Blickrichtung des Kristallsystems (kubisch [001], [111], [110]; tetragonal [001], [100], [110]; trigonal und hexagonal [001], [100], [210]; orthorhombisch a, b, c; monoklin b) und ein Faktor von 0,5 bis 2. Gitter und Kristall werden affin gestreckt oder gestaucht; die Infobox zeigt die verbleibende Punktgruppe und den Zerfall der Form, z. B. Würfel entlang [111]: m3̄m → 3̄m, Rhomboeder. Streckungen, die die Symmetrie erhalten (z. B. tetragonal entlang c), werden als solche benannt: Sie ändern nur Gitterparameter, die das System ohnehin freilässt. Ist die Restgruppe eines kubischen Kristalls trigonal, nennt die Infobox die hexagonalen Achsen (c ∥ [111], a₁ ∥ [11̄0], a₂ ∥ [011̄]), c/a und die Formen mit Namen und Indizes in hexagonalen Achsen (z. B. Würfel {100} → Rhomboeder {101} = {101̄1}; Oktaeder → Pinakoid {0001} + Rhomboeder {022̄1}). Die Streckung steht im Link (`str=111,1.3`); bei Beispielkristallen ist sie wie „Symmetrie brechen“ nicht verfügbar.

### Behoben

- „Flächensymmetrie zeigen“ bei erniedrigter Symmetrie: Zerfällt eine Form, erhält jetzt jede Teilform ihr Flächenmuster (bisher nur eine, auch bei „Symmetrie brechen“).

## [1.3.0] - 2026-10-19

Skript zur Vorlesung als eigene Seite mit sieben Kapiteln; Habitus-Regel verschärft; Begriffe wie in der Vorlesung.

### Hinzugefügt

- **Skript zur Vorlesung** als eigene Seite (`skript.html`, Link „Skript“ in der Kopfzeile der App): Text in der Reihenfolge der Vorlesung, Begriffe nach Borchardt-Ott & Sowa, Abbildungen mit dem Code der App erzeugt und jeweils mit „In der App öffnen“. Sieben Kapitel: 1 Die stereographische Projektion (mit interaktiver Schnittskizze), 2 Kristallformen im Stereogramm, 3 Symmetriegerüste im Stereogramm, 4 Zonen (Zonengleichung, Kreuzschema, Zonenachse und Flächennormale), 5 Tracht und Habitus, 6 Blickrichtungen (Hermann-Mauguin-Symbol, volles und gekürztes Symbol), 7 Hexagonale Achsen und vierstellige Indizes. Kapitel 2 zeigt zu jedem Stereogramm den Körper in derselben Lage in 3D, Kapitel 3 das Symmetriegerüst von *mmm* auch in 3D. Jedes Kapitel mit Lernzielen, Merksätzen, Zusammenfassung und Quellen; fachlich gegen Borchardt-Ott & Sowa gegengeprüft. Offline verfügbar wie die App.

### Geändert

- Habitus: isometrisch nur noch, wenn auch L₃/L₁ ≥ 2/3 (bisher genügten L₂/L₁ ≥ 2/3 und L₃/L₂ ≥ 2/3, womit L₃/L₁ bis 0,44 sinken konnte). Dadurch gelten z. B. die orthorhombischen Formen mit Standardgitter (1,24 : 1 : 0,80) und die triklinen Formen nicht mehr als isometrisch.
- Auf Laptops ohne Untertitel in der Kopfzeile, damit sie auf eine Zeile passt.
- Intern: Szenenberechnung und Link-Adresse in `js/scene.js`, gemeinsame Farben und Kopfzeile in `css/base.css` (von App und Skript genutzt; die App zeigt unverändert dasselbe).
- Begriffe wie in der Vorlesung: Die Lage heisst „[001] ∥ Projektionsrichtung“ (statt „Blickrichtung“, das für die Symmetrierichtungen des Hermann-Mauguin-Symbols reserviert bleibt), die Kugel der 3D-Ansicht „Umkugel“, und die dritte hexagonale Blickrichtung wird als ⟨210⟩ bezeichnet (Borchardt-Ott; dieselbe Richtungsfamilie wie ⟨11̄0⟩ in ITA).

## [1.2.0] - 2026-10-18

Zonen direkt wählen: alle Zonen des Kristalls in der Infobox, auch mehrere zugleich, jede in eigener Farbe.

### Hinzugefügt

- **Zonen direkt wählen:** Mit dem Werkzeug „Zone“ listet die Infobox alle Zonen des dargestellten Kristalls mit mindestens drei Flächen, gruppiert nach symmetrisch gleichwertigen Zonenachsen ⟨uvw⟩ (z. B. Galenit: ⟨100⟩, ⟨110⟩, ⟨111⟩, ⟨211⟩). Antippen einer Gruppe wählt alle ihre Zonen, Antippen einer Richtung nur diese; mehrere Zonen sind zugleich wählbar. Jede gewählte Zone erscheint in eigener Farbe mit Zonenkreis, Zonenachse, Flächen und Polen im Stereogramm und in 3D. Zwei angetippte Pole fügen ihre Zone der Auswahl hinzu. Die Auswahl steht im Link (`zonen=`).

## [1.1.0] - 2026-10-18

Hilfen für den Einstieg: Tooltips, ⓘ-Erklärungen auf Touch-Geräten, Karte „Erste Schritte“ und weniger gleichzeitig sichtbare Optionen.

### Hinzugefügt

- **Tooltips:** Am Laptop erklären Tooltips (Maus oder Tastaturfokus) jedes Bedienelement, die Punktgruppen-Buttons (Symbol, Schoenflies, System, Ordnung) und die Aufstellungen. Über einem Flächenpol zeigt ein Tooltip (hkl), ρ und φ, bei zusammenfallenden Polen beide.
- **ⓘ auf Touch-Geräten:** Auf iPad und Telefon klappt ein ⓘ an den Abschnittsüberschriften die Erklärungen des Abschnitts auf.
- **Erste Schritte:** Beim ersten Besuch ohne Link eine Karte mit vier Schritten (Galenit, Fläche und Pol, Projektion, Symmetriegerüst), wegklickbar und über „?“ wieder zu öffnen.

### Geändert

- „Gitter und Gestalt“ und „Darstellung“ starten zugeklappt; offen/zu wird je Abschnitt gemerkt. Vier Indizes (hkil) und „Flächensymmetrie zeigen“ liegen unter „Weitere Optionen“.
- Die längeren Erläuterungen der Infobox sind einklappbar; der Zustand wird gemerkt.

## [1.0.1] - 2026-10-18

Korrekturen nach dem Abgleich der Erklärtexte mit Borchardt-Ott & Sowa, Hoffmann und ITA; Zeile „Piezoelektrisch“ in der Infobox der Punktgruppen.

### Hinzugefügt

- **Piezoelektrisch:** Die Infobox der Punktgruppen zeigt neben „Polar“ (10 Gruppen, spontane Polarisation) auch „Piezoelektrisch“ (20 Gruppen: ohne Inversionszentrum, ausser 432), berechnet aus den Invarianten des Piezotensors. Bei Quarz (32): polar nein, piezoelektrisch ja.

### Geändert

- **Azimut φ nach Borchardt-Ott & Sowa (Tab. 5.1):** ab dem rechten Rand (→, bei orthogonalen Achsen b) im Uhrzeigersinn, (100) bei 90°; bisher ab ↓ im Gegenuhrzeigersinn. Die Adresse verwendet `az=`; alte Links mit `phi=` und gespeicherte Einstellungen werden umgerechnet, der Pol bleibt an derselben Stelle.
- **Poldistanz ρ nach Borchardt-Ott & Sowa (Abschn. 5.6):** Pole der unteren Halbkugel zählen vom Südpol mit negativem Vorzeichen (bisher ρ > 90°), in Anzeige und Adresse; alte Links mit `rho=` über 90° gelten weiter.
- **Begriffe nach Borchardt-Ott & Sowa:** Poldistanz ρ, Normalenwinkel n und Flächenwinkel f, Zonengleichung, erzeugende Symmetrie; kubische Formnamen (Tetraedrisches Pentagondodekaeder, Tristetraeder, Trisoktaeder, Diploid, Gyroid), abweichende ITA-Namen in Klammern.
- Quarz: Hinweis zu linken und rechten Formen präzisiert; Habitus: Fall mit zwei Verhältnissen unter 2/3 erklärt.

### Korrigiert

- **Formnamen in 4̄3m:** {112} heisst jetzt Tristetraeder (Dreiecksflächen), {221} Deltoiddodekaeder (Deltoide); die Namen waren vertauscht. Die Kennungen in Links (`f=-43m:c38` = {112}, `c39` = {221}) bleiben wie in v1.0.0. Ein Test prüft die Flächenform der kubischen Formen.
- **Quellenangabe der Beispielkristalle:** Der Satz „Die Formen und das Gitter sind belegt“ entfällt; rekonstruierte Formen und frei gewählte Gitter stehen bei der jeweiligen Quelle. Magnesium: Seitenangabe Hoffmann S. 125–127.
- **Turmalin:** Begründung der Hemimorphie vervollständigt (keine Operation von 3m führt c in −c über).
- **Zone mit vier Indizes:** Zonenachse zuerst dreiindiziert berechnet, vierindiziert angegeben; Zonengleichung hu + kv + it + lw = 0.

## [1.0.0] - 2026-10-18

Erste Version mit Versionsnummer. Sie fasst den Stand nach den Pull Requests #1 bis #5 zusammen.

### Hinzugefügt

- **Punktgruppen:** Stereogramme aller 32 kristallographischen Punktgruppen nach ITA Vol. A, mit den Aufstellungen 321/312, 3m1/31m, 3̄m1/3̄1m, 4̄2m/4̄m2, 6̄m2/6̄2m und monoklin Achse b/c. Objekt in allgemeiner Lage (Pol ziehen, Antippen wechselt die Halbkugel), Pole wahlweise nach Händigkeit gefärbt.
- **Blickrichtungen:** Symmetrieelemente den Positionen des vollen Hermann-Mauguin-Symbols zugeordnet und auf Wunsch farbig in Stereogramm, 3D, Legende und Infobox; Blickrichtungen in 3D einzeln ausblendbar.
- **Kristallformen:** 115 Formen nach ITA Tab. 10.1.2.2 mit Wyckoff-Lage, Flächen- und Eigensymmetrie. Ohne „Flächensymmetrie zeigen“ je Punktgruppe die allgemeine Form und die Formen mit der Punktgruppe als Eigensymmetrie (67 Formen); mit der Option alle Formen und ein Flächenmuster, das die Flächensymmetrie zeigt.
- **Beispielkristalle:** Galenit, Pyrit, zwei tetragonale Dipyramiden, Rutil, rhombisch-pyramidaler Kristall, Topas, Gips, triklin-pinakoidaler Kristall, Magnesium, Links- und Rechtsquarz, Turmalin, mit Quellenangabe.
- **Tracht und Habitus** nach Borchardt-Ott & Sowa in der Infobox.
- **Werkzeuge „Zone“ und „Winkel“** in Stereogramm und 3D-Ansicht; „Winkel“ auch im Punktgruppenmodus mit Name der verbindenden Symmetrieoperation.
- **Gitter und Gestalt:** Gitterparameter im Rahmen des Kristallsystems oder frei („Symmetrie brechen“, mit Restpunktgruppe und Zerfall der Form), Abstände der Formen, offene Formen mit Ergänzungsformen.
- **3D-Konstruktion** gekoppelt an das Stereogramm: Projektionskugel, Flächennormalen, Projektionsstrahlen, Stereogramm in der Äquatorebene.
- **Links auf Ansichten:** Zustand lesbar in der Adresse, Button „Link kopieren“ für Folien.
- **Oberfläche** für Laptop, iPad und Telefon: Seitenleiste, Telefon-Ansicht mit Umschalter, grosse Touch-Ziele, helles und dunkles Farbschema, selbst gehostete Schriften.
- **Offline-Betrieb:** Service Worker hält alle Dateien vor; die App läuft nach dem ersten Aufruf auch ohne Netz, auch als Web-App auf dem Homescreen.
- Versionsnummer im Fuss der App, automatische Tests (GitHub Actions) und Veröffentlichung über Release-Tags.

[Unreleased]: https://github.com/manganite/stereography/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/manganite/stereography/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/manganite/stereography/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/manganite/stereography/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/manganite/stereography/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/manganite/stereography/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/manganite/stereography/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/manganite/stereography/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manganite/stereography/releases/tag/v1.0.0
