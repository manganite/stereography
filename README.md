# Stereographische Projektion

[![CI](https://github.com/manganite/stereography/actions/workflows/ci.yml/badge.svg)](https://github.com/manganite/stereography/actions/workflows/ci.yml)
[![Deploy](https://github.com/manganite/stereography/actions/workflows/deploy.yml/badge.svg)](https://github.com/manganite/stereography/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/manganite/stereography)](https://github.com/manganite/stereography/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Interaktive Lern-App für die Kristallographie-Vorlesung: Stereogramme der 32 kristallographischen Punktgruppen und ihrer Kristallformen, gekoppelt mit einer 3D-Konstruktion. Für Laptop, iPad und Telefon; läuft im Browser, als Web-App auf dem Homescreen und offline.

### [Zur App: manganite.github.io/stereography](https://manganite.github.io/stereography/)

![Stereogramm und 3D-Konstruktion eines Galenit-Kristalls (Würfel, Oktaeder, Rhombendodekaeder) mit Symmetriegerüst m3̄m](docs/screenshot.png)

## Funktionen

- **32 kristallographische Punktgruppen:** Stereogramme der Symmetriegerüste nach International Tables for Crystallography, Vol. A, inklusive der in ITA separat geführten Aufstellungen (monoklin Achse b/c, 321/312, 3m1/31m, 3̄m1/3̄1m, 4̄2m/4̄m2, 6̄m2/6̄2m).
- **Objekt in allgemeiner Lage:** Alle Symmetrieoperationen der Gruppe werden darauf angewendet (Pol im Stereogramm ziehbar; Antippen des Ausgangspols wechselt die Halbkugel). Punktgruppen mit zwei Aufstellungen erscheinen im Auswahlfeld als ein Button, die Aufstellung wird darunter gewählt.
- **Kristallformen aller 32 Punktgruppen:** Auswahl nach Kristallsystem und Form, je Punktgruppe die allgemeine Form und die speziellen Grundformen nach ITA Tab. 10.1.2.2 (115 Formen, Namen deutsch, Eigensymmetrie nach Tab. 10.1.2.3), mit einblendbaren Indizes (hkl), bei hexagonalen Achsen wahlweise (hkil). Offene Formen werden durch Ergänzungsformen derselben Punktgruppe geschlossen (grau) oder wahlweise offen gezeigt. Optional liegt das Symmetriegerüst der Punktgruppe gedämpft unter den Polen. Ohne Flächensymmetrie (Standard) enthält die Auswahl je Punktgruppe die allgemeine Form und die Formen, deren Eigensymmetrie die Punktgruppe ist (67 Formen; z. B. Würfel nur unter m3̄m). Mit „Flächensymmetrie zeigen“ erscheinen alle 115 Formen, und die Flächen tragen ein Muster in allgemeiner Lage, das mit allen Operationen der Punktgruppe vervielfältigt ist; seine Anordnung zeigt die Flächensymmetrie (z. B. Würfel in 23: 2.., in m3̄m: 4m.m).
- **Zonen (Werkzeug „Zone“ am Stereogramm):** Zwei Pole antippen zeigt Zonenkreis (untere Hälfte gestrichelt), Zonenachse [uvw] = (h₁k₁l₁) × (h₂k₂l₂) mit ihrem Pol, alle Flächen der Zone nach dem Weiss'schen Zonengesetz, den Winkel zwischen den Polen und in 3D die zur Zonenachse parallelen Kanten. Weicht die Richtung [uvw] von der Normalen (uvw) ab (nicht kubische Gitter), wird die Abweichung angegeben.
- **Winkel (Werkzeug „Winkel“):** Zwei Pole oder Flächen antippen zeigt den Grosskreisbogen zwischen den Polen (im Stereogramm, auf der unteren Halbkugel gestrichelt, und auf der Lagekugel in 3D), den Winkel zwischen den Flächennormalen und den Ergänzungswinkel zwischen den Flächen.
- **Winkel im Punktgruppenmodus:** Mit dem Werkzeug „Winkel“ zwei Pole der allgemeinen Lage antippen; die Infobox nennt den Winkel und die Symmetrieoperation, die die beiden Pole ineinander überführt.
- **Tracht und Habitus** (Begriffe nach Borchardt-Ott & Sowa, Abschn. 5.2): Die Infobox nennt die auftretenden Formen und den Habitus-Grundtyp (isometrisch, planar oder taflig, prismatisch oder nadelig), bestimmt aus den Hauptausdehnungen L₁ ≥ L₂ ≥ L₃ des dargestellten Kristalls (zweite Momente des Körpers) mit der Grenze 2/3.
- **Beispielkristalle:** Kombinationen mehrerer Formen derselben Punktgruppe aus Vorlesung und Lehrbüchern (Galenit, Pyrit, zwei tetragonale Dipyramiden, Rutil, ein rhombisch-pyramidaler Kristall, Topas, Gips, ein triklin-pinakoidaler Kristall, Magnesium, Links- und Rechtsquarz, Turmalin), mit Quelle. Jede Form hat eine eigene Farbe; die Infobox listet die Tracht mit Flächenzahl und Eigensymmetrie. Gitter und Abstände der Formen lassen sich unter „Gitter und Gestalt“ ändern; die Abstände sind nach den Abbildungen gewählt, nicht gemessen.
- **Links auf Ansichten:** Der Zustand steht lesbar in der Adresse (z. B. `#m=pg&g=4/mmm&rho=40`); „Link kopieren“ kopiert sie, etwa für Folien. Ein Link hat Vorrang vor dem gespeicherten Zustand.
- **Verzerrung in zwei Stufen:** Standardmässig sind nur die Gitterparameter frei, die das Kristallsystem zulässt; die Symmetrie bleibt erhalten. Mit „Symmetrie brechen“ sind alle Parameter frei; die App bestimmt dann die verbleibende Punktgruppe und zeigt, in welche Formen die gewählte Form zerfällt (farbig).
- **Blickrichtungen:** Die Symmetrieelemente werden den Positionen des vollen Hermann-Mauguin-Symbols zugeordnet (Klassen äquivalenter Richtungen, z. B. in m3̄m ⟨100⟩, ⟨111⟩, ⟨110⟩) und auf Wunsch in deren Farbe gezeichnet, im Stereogramm, in der 3D-Ansicht, im vollen Symbol und in der nach Blickrichtungen gegliederten Liste der Infobox. In der 3D-Ansicht lassen sich einzelne Blickrichtungen ausblenden. Ohne Farben entspricht das Stereogramm der schwarzen ITA-Darstellung.
- **3D-Konstruktion,** gekoppelt an das Stereogramm: Projektionskugel, Flächennormalen, Projektionsstrahlen zum Süd- bzw. Nordpol und das Stereogramm in der Äquatorebene.

## Nutzung

### Im Browser

Die App läuft in aktuellen Versionen von Safari, Chrome, Edge und Firefox: **https://manganite.github.io/stereography/**. Eine Installation ist nicht nötig. Einstellungen bleiben im Browser gespeichert; „Link kopieren“ erzeugt einen Link auf genau die aktuelle Ansicht, etwa für Folien.

### Als Web-App auf dem Homescreen

Die App lässt sich wie eine installierte App mit eigenem Symbol und ohne Browserleiste starten:

- **iPad und iPhone (Safari):** App öffnen, auf das Teilen-Symbol tippen (Quadrat mit Pfeil nach oben), dann **„Zum Home-Bildschirm“** und **„Hinzufügen“**.
- **Android (Chrome):** App öffnen, Menü **⋮** antippen, dann **„Zum Startbildschirm hinzufügen“** bzw. **„App installieren“**.
- **Laptop (Chrome oder Edge):** App öffnen, in der Adressleiste auf das Symbol **„App installieren“** klicken (Chrome) bzw. Menü **…** → **Apps** → **„Diese Website als App installieren“** (Edge).

### Offline

Nach dem ersten Aufruf hält ein Service Worker alle Dateien vor; die App funktioniert dann auch ohne Netz, im Browser wie auf dem Homescreen. Erscheint eine neue Version, lädt die App sie beim nächsten Öffnen mit Netz und startet einmal neu; Einstellungen bleiben erhalten.

### Lokal ausführen

Die App ist eine statische Webseite ohne Build-Schritt und ohne Abhängigkeiten.

1. Dateien holen: auf der [Release-Seite](https://github.com/manganite/stereography/releases/latest) unter „Assets“ **Source code (zip)** herunterladen und entpacken, oder
   ```bash
   git clone https://github.com/manganite/stereography.git
   ```
2. Im entpackten Ordner einen lokalen Webserver starten, zum Beispiel mit Python 3:
   ```bash
   cd stereography
   python3 -m http.server 8000
   ```
   (unter Windows `py -m http.server 8000`)
3. Im Browser **http://localhost:8000** öffnen.

Ein Doppelklick auf `index.html` genügt nicht: Browser laden die JavaScript-Module der App nicht von `file://`-Adressen.

## Konventionen

- Blick entlang c (bzw. entlang der gewählten Richtung), a zeigt nach unten, b nach rechts (ITA).
- Pole oberhalb der Projektionsebene: Punkt; unterhalb: Kreis; beide an derselben Stelle: Kreis mit Punkt.
- Spiegelebenen als kräftige Linien; Spiegelebene senkrecht zur Blickrichtung als kräftiger Grundkreis.
- Symbole und ihre Lage nach ITA A (2006), Kap. 1.4.5 und Tab. 10.1.2.2: Linsen tangential (Achse ⊥ Projektionsebene: ∥ a), Quadrat auf der Spitze, Dreieck mit Spitze nach oben bzw. bei geneigten Achsen radial nach aussen, 4̄ als offenes Quadrat mit Linse zwischen zwei Ecken, 6̄ als offenes Sechseck mit einbeschriebenem Dreieck. Der Punkt für das Inversionszentrum (2/m, 4/m, 6/m) erscheint nur an der Achse senkrecht zur Projektionsebene.
- Dünne Linien für Symmetrieachsen in der Projektionsebene sowie, im kubischen System, für die Zonen {100} und {110}, soweit sie keine Spiegelebenen sind.
- Hexagonale und trigonale Formen mit hexagonalen Achsen. Standard sind drei Indizes (hkl); Miller-Bravais-Indizes (hkil) mit i = −(h+k) lassen sich zuschalten.

## Entwicklung

### Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche und Gestaltung |
| `js/pointgroups.js` | Generatoren der Punktgruppen, Gruppenerzeugung, automatische Bestimmung der Symmetrieelemente |
| `js/forms.js` | Formenkatalog nach ITA Tab. 10.1.2.2/10.1.2.3 |
| `js/examples.js` | Beispielkristalle (Formen, Gitter, Abstände, Quellen) |
| `js/polyhedra.js` | Gitter aller Systeme, Flächenbahnen, Ergänzungsformen, Restsymmetrie, Halbraumschnitt, Lagen |
| `js/stereogram.js` | SVG-Stereogramm mit ITA-Symbolen und Wulffschem Netz |
| `js/view3d.js` | 3D-Ansicht (three.js) |
| `js/main.js` | Zustand und Bedienung |
| `js/version.js` | Versionsnummer der App |
| `sw.js` | Service Worker für den Offline-Betrieb |
| `tests/` | Automatische Tests (Node, ohne Abhängigkeiten) |
| `js/format.js`, `js/linalg.js` | Hilfsfunktionen (Symbole, Indizes, Vektoren) |
| `manifest.webmanifest`, `icons/` | Favicon und Homescreen-Icons (iPad/iPhone: Teilen → Zum Home-Bildschirm; Android: Menü → Zum Startbildschirm hinzufügen) |
| `lib/fonts/` | Schriften IBM Plex Sans, IBM Plex Mono und Source Serif 4 (WOFF2, nur benötigte Schnitte, aus den npm-Paketen `@fontsource/*`), SIL Open Font License 1.1, siehe `lib/fonts/LICENSE-*.txt`. Selbst gehostet, damit die App ohne Verbindung zu Google auskommt. |
| `lib/three.bundle.js` | three.js r186 mit OrbitControls und CSS2DRenderer (MIT-Lizenz, siehe `lib/three-LICENSE.txt`) |

Die Flächenzahl jeder Katalogform wird beim Erzeugen mit der Multiplizität aus ITA verglichen (alle 115 stimmen überein); ebenso die Flächensymmetrie jeder Form mit dem berechneten Stabilisator der Fläche. Die Symmetrieelemente werden nicht von Hand eingetragen, sondern aus den Gruppenelementen berechnet (Drehachsen aus Spur und Eigenvektor, Spiegelebenen und Drehinversionsachsen aus −R).

### Tests

```bash
node --test tests/*.test.mjs
```

Geprüft werden die Gruppenordnungen aller 40 Punktgruppen-Einträge, die Zuordnung der Symmetrieelemente zu den Blickrichtungen, die Flächenzahl aller 115 Formen gegen ITA, geschlossene Polyeder (Euler-Charakteristik 2), die Beispielkristalle sowie die Release-Konsistenz (Version, Changelog, Offline-Liste). Dieselben Tests laufen bei jedem Pull Request in GitHub Actions.

### Versionen und Releases

Die App folgt [Semantic Versioning](https://semver.org/lang/de/); Änderungen stehen im [CHANGELOG](CHANGELOG.md). Änderungen gehen über einen Branch und einen Pull Request nach `main`. Die Live-Seite wird nur bei einem Release aktualisiert:

1. Version in `js/version.js` und `sw.js` erhöhen (neue Funktion: zweite Stelle, Korrektur: dritte Stelle).
2. Einträge unter `## [Unreleased]` in `CHANGELOG.md` unter eine neue Überschrift `## [x.y.z] - JJJJ-MM-TT` verschieben, Links am Ende ergänzen.
3. Auf `main` taggen und pushen: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.

Der Tag startet zwei Workflows: `release.yml` legt das GitHub-Release mit den Notizen aus dem Changelog an, `deploy.yml` prüft und veröffentlicht den Stand auf GitHub Pages.

## Grundlagen und Quellen

- International Tables for Crystallography, Vol. A (2006), Kap. 1.4.5 und Tab. 10.1.2.2/10.1.2.3: Symbole, Formen, Eigensymmetrie.
- W. Borchardt-Ott, H. Sowa: *Kristallographie. Eine Einführung für Studierende der Naturwissenschaften*, Springer, Berlin 2018, [doi:10.1007/978-3-662-56816-3](https://doi.org/10.1007/978-3-662-56816-3): Begriffe (Tracht, Habitus, Flächensymmetrie), Beispielkristalle.
- F. Hoffmann: *Faszination Kristalle und Symmetrie. Einführung in die Kristallographie*, Springer Fachmedien, Wiesbaden 2016, [doi:10.1007/978-3-658-09581-9](https://doi.org/10.1007/978-3-658-09581-9): Beispielkristalle.

Die Quelle jedes Beispielkristalls steht in der App und in `js/examples.js`.

## Zitieren

Wer die App in Lehre oder Publikationen nennt, findet die Angaben in [`CITATION.cff`](CITATION.cff) bzw. auf GitHub unter „Cite this repository“.

## Lizenz

Die App steht unter der MIT-Lizenz (`LICENSE`). Die mitgelieferte Bibliothek three.js steht ebenfalls unter der MIT-Lizenz, mit eigenem Copyright-Vermerk der three.js-Autoren in `lib/three-LICENSE.txt`. Dieser Vermerk muss nach den Lizenzbedingungen mit der Bibliothek weitergegeben werden. Die Schriften in `lib/fonts/` stehen unter der SIL Open Font License 1.1 (Lizenztexte liegen bei).
