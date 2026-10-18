# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Korrigiert

- **Formnamen in 4̄3m:** {112} heisst jetzt Tristetraeder (Dreiecksflächen), {221} Deltoiddodekaeder (Deltoide); die Namen waren vertauscht. Die Kennungen in Links (`f=-43m:c38` = {112}, `c39` = {221}) bleiben wie in v1.0.0. Ein Test prüft die Flächenform der kubischen Formen.
- **Quellenangabe der Beispielkristalle:** Der Satz „Die Formen und das Gitter sind belegt“ entfällt; rekonstruierte Formen und frei gewählte Gitter stehen bei der jeweiligen Quelle. Magnesium: Seitenangabe Hoffmann S. 125–127.
- **Turmalin:** Begründung der Hemimorphie vervollständigt (keine Operation von 3m führt c in −c über).
- **Zone mit vier Indizes:** Zonenachse zuerst dreiindiziert berechnet, vierindiziert angegeben; Zonengleichung hu + kv + it + lw = 0.

### Geändert

- **Azimut φ nach Borchardt-Ott & Sowa (Tab. 5.1):** ab dem rechten Rand (→, bei orthogonalen Achsen b) im Uhrzeigersinn, (100) bei 90°; bisher ab ↓ im Gegenuhrzeigersinn. Die Adresse verwendet `az=`; alte Links mit `phi=` und gespeicherte Einstellungen werden umgerechnet, der Pol bleibt an derselben Stelle.
- **Poldistanz ρ nach Borchardt-Ott & Sowa (Abschn. 5.6):** Pole der unteren Halbkugel zählen vom Südpol mit negativem Vorzeichen (bisher ρ > 90°), in Anzeige und Adresse; alte Links mit `rho=` über 90° gelten weiter.
- **Begriffe nach Borchardt-Ott & Sowa:** Poldistanz ρ, Normalenwinkel n und Flächenwinkel f, Zonengleichung, erzeugende Symmetrie; kubische Formnamen (Tetraedrisches Pentagondodekaeder, Tristetraeder, Trisoktaeder, Diploid, Gyroid), abweichende ITA-Namen in Klammern.
- Quarz: Hinweis zu linken und rechten Formen präzisiert; Habitus: Fall mit zwei Verhältnissen unter 2/3 erklärt.

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

[Unreleased]: https://github.com/manganite/stereography/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/manganite/stereography/releases/tag/v1.0.0
