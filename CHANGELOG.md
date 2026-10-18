# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

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
