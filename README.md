# Stereographische Projektion

**App: https://manganite.github.io/stereography/**

Interaktive Lern-App für die Kristallographie-Vorlesung. Sie zeigt

- die Stereogramme der **32 kristallographischen Punktgruppen** (Symmetriegerüst nach International Tables for Crystallography, Vol. A), inklusive der in ITA separat geführten Aufstellungen (monoklin Achse b/c, 321/312, 3m1/31m, 3̄m1/3̄1m, 4̄2m/4̄m2, 6̄m2/6̄2m),
- ein **Objekt in allgemeiner Lage**, auf das alle Symmetrieoperationen der Gruppe angewendet werden (Pol im Stereogramm ziehbar),
- Stereogramme einfacher **Polyeder** (Würfel/Quader, Oktaeder, Tetraeder, Rhombendodekaeder, Rhomboeder sowie 3-, 4- und 6-zählige Prismen, Pyramiden und Dipyramiden) mit einstellbarer Grösse, Seitenverhältnissen und Lage, mit einblendbaren Indizes (hkl) bzw. (hkil),
- eine gekoppelte **3D-Konstruktion**: Projektionskugel, Flächennormalen, Projektionsstrahlen zum Süd- bzw. Nordpol und das Stereogramm in der Äquatorebene.

## Konventionen

- Blick entlang c (bzw. entlang der gewählten Richtung), a zeigt nach unten, b nach rechts (ITA).
- Pole oberhalb der Projektionsebene: Punkt; unterhalb: Kreis; beide an derselben Stelle: Kreis mit Punkt.
- Spiegelebenen als kräftige Linien; Spiegelebene senkrecht zur Blickrichtung als kräftiger Grundkreis.
- Hexagonale und trigonale Formen mit hexagonalen Achsen und Miller-Bravais-Indizes (hkil).

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
| `js/polyhedra.js` | Formen, Gitter, Halbraumschnitt, Lagen |
| `js/stereogram.js` | SVG-Stereogramm mit ITA-Symbolen und Wulffschem Netz |
| `js/view3d.js` | 3D-Ansicht (three.js) |
| `js/main.js` | Zustand und Bedienung |
| `js/format.js`, `js/linalg.js` | Hilfsfunktionen (Symbole, Indizes, Vektoren) |
| `manifest.webmanifest`, `icons/` | Favicon und Homescreen-Icons (iPad/iPhone: Teilen → Zum Home-Bildschirm; Android: Menü → Zum Startbildschirm hinzufügen) |
| `lib/three.bundle.js` | three.js r186 mit OrbitControls und CSS2DRenderer (MIT-Lizenz, siehe `lib/three-LICENSE.txt`) |

Die Symmetrieelemente werden nicht von Hand eingetragen, sondern aus den Gruppenelementen berechnet (Drehachsen aus Spur und Eigenvektor, Spiegelebenen und Drehinversionsachsen aus −R).

## Lizenz

Die App steht unter der MIT-Lizenz (`LICENSE`). Die mitgelieferte Bibliothek three.js steht ebenfalls unter der MIT-Lizenz, mit eigenem Copyright-Vermerk der three.js-Autoren in `lib/three-LICENSE.txt`. Dieser Vermerk muss nach den Lizenzbedingungen mit der Bibliothek weitergegeben werden.
