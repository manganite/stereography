# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **Skript zur Vorlesung** als eigene Seite (`skript.html`, Link „Skript“ in der Kopfzeile der App): Text in der Reihenfolge der Vorlesung, Begriffe nach Borchardt-Ott & Sowa, Abbildungen mit dem Code der App erzeugt und jeweils mit „In der App öffnen“. Erstes Kapitel „Die stereographische Projektion“ (Umkugel und Flächenpole, Normalen- und Flächenwinkel, Projektion mit interaktiver Schnittskizze, φ und ρ, Kreis- und Winkeltreue, Wulffsches Netz); weitere Kapitel folgen. Offline verfügbar wie die App.

### Geändert

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

[Unreleased]: https://github.com/manganite/stereography/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/manganite/stereography/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/manganite/stereography/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/manganite/stereography/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manganite/stereography/releases/tag/v1.0.0
