# Stereographische Projektion

**App: https://manganite.github.io/stereography/**

Interaktive Lern-App für die Kristallographie-Vorlesung. Sie zeigt

- die Stereogramme der **32 kristallographischen Punktgruppen** (Symmetriegerüst nach International Tables for Crystallography, Vol. A), inklusive der in ITA separat geführten Aufstellungen (monoklin Achse b/c, 321/312, 3m1/31m, 3̄m1/3̄1m, 4̄2m/4̄m2, 6̄m2/6̄2m),
- ein **Objekt in allgemeiner Lage**, auf das alle Symmetrieoperationen der Gruppe angewendet werden (Pol im Stereogramm ziehbar; Antippen des Ausgangspols wechselt die Halbkugel). Punktgruppen mit zwei Aufstellungen erscheinen im Auswahlfeld als ein Button, die Aufstellung wird darunter gewählt,
- **Kristallformen** aller 32 Punktgruppen: Auswahl nach Kristallsystem und Form, je Punktgruppe die allgemeine Form und die speziellen Grundformen nach ITA Tab. 10.1.2.2 (115 Formen, Namen deutsch, Eigensymmetrie nach Tab. 10.1.2.3), mit einblendbaren Indizes (hkl), bei hexagonalen Achsen wahlweise (hkil). Offene Formen werden durch Ergänzungsformen derselben Punktgruppe geschlossen (grau) oder wahlweise offen gezeigt. Optional liegt das Symmetriegerüst der Punktgruppe gedämpft unter den Polen. Ohne Flächensymmetrie (Standard) enthält die Auswahl je Punktgruppe die allgemeine Form und die Formen, deren Eigensymmetrie die Punktgruppe ist (67 Formen; z. B. Würfel nur unter m3̄m). Mit „Flächensymmetrie zeigen“ erscheinen alle 115 Formen, und die Flächen tragen ein Muster in allgemeiner Lage, das mit allen Operationen der Punktgruppe vervielfältigt ist; seine Anordnung zeigt die Flächensymmetrie (z. B. Würfel in 23: 2.., in m3̄m: 4m.m).
- **Zonen (Werkzeug „Zone“ am Stereogramm):** Zwei Pole antippen zeigt Zonenkreis (untere Hälfte gestrichelt), Zonenachse [uvw] = (h₁k₁l₁) × (h₂k₂l₂) mit ihrem Pol, alle Flächen der Zone nach dem Weiss'schen Zonengesetz, den Winkel zwischen den Polen und in 3D die zur Zonenachse parallelen Kanten. Weicht die Richtung [uvw] von der Normalen (uvw) ab (nicht kubische Gitter), wird die Abweichung angegeben.
- **Winkel (Werkzeug „Winkel“):** Zwei Pole oder Flächen antippen zeigt den Grosskreisbogen zwischen den Polen (im Stereogramm, auf der unteren Halbkugel gestrichelt, und auf der Lagekugel in 3D), den Winkel zwischen den Flächennormalen und den Ergänzungswinkel zwischen den Flächen.
- **Winkel im Punktgruppenmodus:** Mit dem Werkzeug „Winkel“ zwei Pole der allgemeinen Lage antippen; die Infobox nennt den Winkel und die Symmetrieoperation, die die beiden Pole ineinander überführt.
- **Tracht und Habitus** (Begriffe nach Borchardt-Ott & Sowa, Abschn. 5.2): Die Infobox nennt die auftretenden Formen und den Habitus-Grundtyp (isometrisch, planar oder taflig, prismatisch oder nadelig), bestimmt aus den Hauptausdehnungen L₁ ≥ L₂ ≥ L₃ des dargestellten Kristalls (zweite Momente des Körpers) mit der Grenze 2/3.
- **Links auf Ansichten:** Der Zustand steht lesbar in der Adresse (z. B. `#m=pg&g=4/mmm&rho=40`); „Link kopieren“ kopiert sie, etwa für Folien. Ein Link hat Vorrang vor dem gespeicherten Zustand.
- **Verzerrung in zwei Stufen:** Standardmässig sind nur die Gitterparameter frei, die das Kristallsystem zulässt; die Symmetrie bleibt erhalten. Mit „Symmetrie brechen“ sind alle Parameter frei; die App bestimmt dann die verbleibende Punktgruppe und zeigt, in welche Formen die gewählte Form zerfällt (farbig).
- **Blickrichtungen:** Die Symmetrieelemente werden den Positionen des vollen Hermann-Mauguin-Symbols zugeordnet (Klassen äquivalenter Richtungen, z. B. in m3̄m ⟨100⟩, ⟨111⟩, ⟨110⟩) und auf Wunsch in deren Farbe gezeichnet, im Stereogramm, in der 3D-Ansicht, im vollen Symbol und in der nach Blickrichtungen gegliederten Liste der Infobox. In der 3D-Ansicht lassen sich einzelne Blickrichtungen ausblenden. Ohne Farben entspricht das Stereogramm der schwarzen ITA-Darstellung.
- eine gekoppelte **3D-Konstruktion**: Projektionskugel, Flächennormalen, Projektionsstrahlen zum Süd- bzw. Nordpol und das Stereogramm in der Äquatorebene.

## Konventionen

- Blick entlang c (bzw. entlang der gewählten Richtung), a zeigt nach unten, b nach rechts (ITA).
- Pole oberhalb der Projektionsebene: Punkt; unterhalb: Kreis; beide an derselben Stelle: Kreis mit Punkt.
- Spiegelebenen als kräftige Linien; Spiegelebene senkrecht zur Blickrichtung als kräftiger Grundkreis.
- Symbole und ihre Lage nach ITA A (2006), Kap. 1.4.5 und Tab. 10.1.2.2: Linsen tangential (Achse ⊥ Projektionsebene: ∥ a), Quadrat auf der Spitze, Dreieck mit Spitze nach oben bzw. bei geneigten Achsen radial nach aussen, 4̄ als offenes Quadrat mit Linse zwischen zwei Ecken, 6̄ als offenes Sechseck mit einbeschriebenem Dreieck. Der Punkt für das Inversionszentrum (2/m, 4/m, 6/m) erscheint nur an der Achse senkrecht zur Projektionsebene.
- Dünne Linien für Symmetrieachsen in der Projektionsebene sowie, im kubischen System, für die Zonen {100} und {110}, soweit sie keine Spiegelebenen sind.
- Hexagonale und trigonale Formen mit hexagonalen Achsen. Standard sind drei Indizes (hkl); Miller-Bravais-Indizes (hkil) mit i = −(h+k) lassen sich zuschalten.

## Veröffentlichen mit GitHub Pages

1. Neues Repository anlegen und den Inhalt dieses Ordners hochladen (`index.html`, `js/`, `lib/`). Beim Hochladen über die Weboberfläche ganze Ordner hineinziehen, nicht einzelne Dateien, sonst geht die Ordnerstruktur verloren.
2. Im Repository: **Settings → Pages → Build and deployment**, Quelle „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die App erreichbar, für dieses Repository unter https://manganite.github.io/stereography/.

Es gibt keinen Build-Schritt. Lokal testen: im Ordner `python3 -m http.server` starten und `http://localhost:8000` öffnen (direktes Öffnen der Datei funktioniert wegen der ES-Module nicht).

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche und Gestaltung |
| `js/pointgroups.js` | Generatoren der Punktgruppen, Gruppenerzeugung, automatische Bestimmung der Symmetrieelemente |
| `js/forms.js` | Formenkatalog nach ITA Tab. 10.1.2.2/10.1.2.3 |
| `js/polyhedra.js` | Gitter aller Systeme, Flächenbahnen, Ergänzungsformen, Restsymmetrie, Halbraumschnitt, Lagen |
| `js/stereogram.js` | SVG-Stereogramm mit ITA-Symbolen und Wulffschem Netz |
| `js/view3d.js` | 3D-Ansicht (three.js) |
| `js/main.js` | Zustand und Bedienung |
| `js/format.js`, `js/linalg.js` | Hilfsfunktionen (Symbole, Indizes, Vektoren) |
| `manifest.webmanifest`, `icons/` | Favicon und Homescreen-Icons (iPad/iPhone: Teilen → Zum Home-Bildschirm; Android: Menü → Zum Startbildschirm hinzufügen) |
| `lib/fonts/` | Schriften IBM Plex Sans, IBM Plex Mono und Source Serif 4 (WOFF2, nur benötigte Schnitte, aus den npm-Paketen `@fontsource/*`), SIL Open Font License 1.1, siehe `lib/fonts/LICENSE-*.txt`. Selbst gehostet, damit die App ohne Verbindung zu Google auskommt. |
| `lib/three.bundle.js` | three.js r186 mit OrbitControls und CSS2DRenderer (MIT-Lizenz, siehe `lib/three-LICENSE.txt`) |

Die Flächenzahl jeder Katalogform wird beim Erzeugen mit der Multiplizität aus ITA verglichen (alle 115 stimmen überein); ebenso die Flächensymmetrie jeder Form mit dem berechneten Stabilisator der Fläche. Die Symmetrieelemente werden nicht von Hand eingetragen, sondern aus den Gruppenelementen berechnet (Drehachsen aus Spur und Eigenvektor, Spiegelebenen und Drehinversionsachsen aus −R).

## Lizenz

Die App steht unter der MIT-Lizenz (`LICENSE`). Die mitgelieferte Bibliothek three.js steht ebenfalls unter der MIT-Lizenz, mit eigenem Copyright-Vermerk der three.js-Autoren in `lib/three-LICENSE.txt`. Dieser Vermerk muss nach den Lizenzbedingungen mit der Bibliothek weitergegeben werden. Die Schriften in `lib/fonts/` stehen unter der SIL Open Font License 1.1 (Lizenztexte liegen bei).
