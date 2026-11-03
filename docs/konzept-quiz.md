# Konzept: Quiz zur stereographischen Projektion

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Umgesetzt (v1.8.0; Stand v1.12.0: 153 Bankfragen und 6 Generatoren, alle „geprüft“; Moodle-Export `tools/moodle-export.mjs`; Anteile erzeugter Fragen 50 % bzw. 30 % je Generator in `js/quiz.js`). Abweichungen vom Text:
> - Stufen 1 und 2 beziehen sich nicht mehr auf „die Vorlesung“, sondern auf den Grundstoff des Skripts; Foliennummern sind aus den Quellenangaben entfernt.
> - Kapitelnummern: Die Vertiefungskapitel heissen heute 10 und 11 (im Text 8 und 9).
>
> Der Text darunter ist der Stand des Konzepts und wird nicht mehr nachgeführt. Was heute gilt, steht in `CLAUDE.md` und im `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 25.10.2026, Entwurf zur Abstimmung (offene Fragen in Abschnitt 10). Grundlage: App v1.7.0 mit Skript (Kap. 1–9, Kennzeichnung Vorlesung/Vertiefung aus PR #28), Folien HS 2026 Kap. 0–5, Borchardt-Ott & Sowa (2018), Hoffmann (2016).

## 1. Ziel und Rolle

- Ein **Übungsquiz mit Multiple-Choice-Fragen**, mit dem Studierende selbst prüfen, ob sie die Lernziele des Skripts erreichen.
- Es **prüft nur, was App und Skript behandeln**: Projektion, Kristallformen, Symmetriegerüste, Zonen, Tracht und Habitus, Blickrichtungen, hexagonale Achsen, Lagen, Verzerrungen. Gruppentafeln, Erzeugende, Kristallstruktur, Gitter, Beugung usw. kommen nicht vor, auch wenn sie in der Vorlesung stehen.
- **Kein Ersatz für das Moodle-Quiz** der Vorlesung (Notenbonus) und keine Aussage zur Klausur, wie im Skript entschieden. Das App-Quiz ist ein freies Übungsangebot ohne Wertung nach aussen.
- **Lernen statt Prüfen:** Nach jeder Antwort eine kurze Erklärung, ein Link zur passenden Stelle im Skript und, wo sinnvoll, „In der App öffnen“ mit genau der Ansicht, an der man die Antwort nachvollziehen kann.

## 2. Drei Schwierigkeitsstufen

Die Stufen bauen auf der Einstufung V/T aus dem Konzept „Vorlesungsstoff und Vertiefung“ auf. Damit lässt sich jede Frage eindeutig einer Stufe zuordnen.

| Stufe | Inhalt | Quelle der Einstufung | Fragetyp |
|---|---|---|---|
| **1 Grundlagen** | Hauptthemen der Vorlesung | unmarkierter Text Kap. 1–7, Lernziele „Aus der Vorlesung“, „Das sollten Sie können“ | ein Begriff, ein Schritt, ein Bild |
| **2 Anwendung** | nur Vorlesungsstoff, aber mehrschrittig; auch Randthemen der Vorlesung | wie Stufe 1, zusätzlich V-Inhalte am Rand (Beispiele unten) | mehrere Schritte, Bild + Rechnung, Fallen |
| **3 Vertiefung** | zusätzlich die Vertiefungen des Skripts | Kästen und Abschnitte „Vertiefung“, Kap. 8 und 9 | wie Stufe 2, Inhalte aus T |

Randthemen der Vorlesung für Stufe 2 (Vorschlag, aus der Einstufungstabelle):
- andere Projektionsrichtung (Kap. 2), Pol von (100) in Richtung [210] (Kap. 7)
- Fläche als Schnittpunkt zweier Zonen indizieren (Galenit)
- [uvw] und (uvw) fallen nur kubisch zusammen
- volles ↔ gekürztes HM-Symbol, implizite Achsen in m3̄m
- Symmetriesatz m ⊥ m → 2 am Stereogramm
- Würfel → Rhomboeder entlang [111] mit 3̄m
- Multiplizität von Familien {100}, {110}, {111}, ⟨111⟩

Beispiele je Stufe (Entwürfe, noch nicht geprüft):
- **1:** „Ein Pol wird als offener Kreis ○ gezeichnet. Was bedeutet das?“ – Flächenpol auf der unteren Halbkugel / auf der oberen Halbkugel / auf dem Äquator / Fläche parallel zur Projektionsebene.
- **1:** Stereogramm eines Symmetriegerüsts aus der App → „Welche Punktgruppe?“ (4/mmm, 4mm, 422, 4/m).
- **2:** „Welche Zonenachse haben (110) und (011)? Liegt (101̄) in dieser Zone?“ (Antworten mit Vorzeichenfehlern als Ablenker)
- **2:** „Ein tetragonaler Kristall, Projektion ∥ [100]. Welches Stereogramm zeigt das tetragonale Prisma {100} mit Pinakoid?“ (vier Bilder)
- **3:** „Wie viele Flächen hat {111} in 4̄3m, und welche Flächensymmetrie haben sie?“ (4 und .3m / 8 und .3m / 4 und 3m / 8 und 3m.)
- **3:** „Ein Würfel wird entlang [110] gestreckt. Welche Punktgruppe bleibt?“

## 3. Fragetypen

Alle Fragen sind Multiple Choice, in fünf Varianten:
1. **Einfachauswahl** mit 4 Antworten (Standard)
2. **Mehrfachauswahl** „Alle zutreffenden wählen“, z. B. welche Flächen zur Zone [001] gehören (nach Borchardt-Ott Aufg. 5.4)
3. **Bild → Text:** Die Frage zeigt ein Stereogramm oder eine räumliche Zeichnung aus den Daten der App, die Antworten sind Begriffe oder Symbole (nach Aufg. 5.5 und 9.9)
4. **Text → Bild:** Die Antworten sind vier Stereogramme (Lernziel „das Stereogramm zeichnen“, so weit es sich als Auswahl prüfen lässt)
5. **Bild → Bilder:** Die Frage zeigt ein Bild, die Antworten sind vier Bilder der anderen Darstellung: Kristall ↔ Stereogramm, Lage eines Kristalls ↔ Stereogramm, räumliches Symmetriegerüst ↔ Stereogramm, je in beide Richtungen (Wunsch Thomas 25.10.2026). Die räumlichen Bilder sind feste Zeichnungen (Abschnitt 11, Nr. 8).

Ablenker bilden **typische Fehler** ab, nicht beliebige falsche Antworten: ● und ○ verwechselt, Spiegelebene statt ihrer Normalen in die Blickrichtung gelegt, Richtungen statt Geraden gezählt (⟨111⟩: 8 vs. 4), [hkl] ⊥ (hkl) auch nichtkubisch angenommen, Vorzeichen im Kreuzprodukt, Positionen im HM-Symbol vertauscht. Die Erklärung nach der Antwort benennt den jeweiligen Fehler.

## 4. Woher die Fragen kommen

**Zwei Arten von Fragen:**

**A. Handgeschriebene Fragen** (Kern des Quiz): Begriffe, Begründungen, Bildzuordnungen. Jede mit Quelle.

**B. Erzeugte Fragen** aus den Daten der App, die schon getestet sind. Dadurch ist die richtige Antwort sicher und es gibt beliebig viele Varianten:
- Flächenzahl einer Form in einer Punktgruppe (115 Formen in `js/forms.js`)
- Symmetriegerüst → Punktgruppe, Ablenker aus demselben Kristallsystem (`js/pointgroups.js`, SVG über `js/scene.js` wie im Skript)
- Zonenachse aus zwei Flächen, Zugehörigkeit einer Fläche zu einer Zone
- Stufe 3: Wyckoff-Lage und Flächensymmetrie (`js/sitesym.js`), Restgruppe nach Streckung
- Bildzuordnungen mit räumlichen Zeichnungen (`js/bild3d.js`): Kristall ↔ Stereogramm (`gen-koerper`, Kap. 2), Lage ↔ Stereogramm (`gen-lage`, Kap. 2, Stufe 2), räumliches Symmetriegerüst ↔ Stereogramm (`gen-geruest3d`, Kap. 3). Die Tests zählen die Pole der beschriebenen Stereogramme nach.

**Vorlagen in den Büchern** (in Zotero geprüft):
- **Borchardt-Ott & Sowa:** Übungsaufgaben am Ende der Kapitel, Lösungen in Kap. 16 (S. 373 ff.). Passend sind vor allem 3.6 (S. 22 f.: Zonen, [uvw] ⊥ (hkl)), 5.9 (S. 58–65: Pole eintragen, Stereogramme deuten, Zonen, Wulff'sches Netz, Galenit), 7.5 (S. 118 ff.: Symmetrie der Gitter, Blickrichtungen) und 9.8 (S. 176 ff.: Kristallsystem aus dem HM-Symbol, Punktgruppe aus dem Stereogramm, Kombination von Symmetrieelementen, Formen).
  - Die Aufgaben sind überwiegend **Zeichen- und Konstruktionsaufgaben**, keine MC-Fragen. Sie dienen als Vorlage und werden zu MC-Fragen umgebaut (z. B. aus „Zeichnen Sie …“ wird „Welches der vier Stereogramme …“).
  - Die Lösungen verweisen oft nur auf Abbildungen („Vgl. Abb. 7.13e“). Die richtige Antwort jeder abgeleiteten Frage muss deshalb selbst nachgerechnet werden (mit der App oder einem Test).
  - Viele Aufgaben stehen im PDF nur als Bild; beim Schreiben lese ich die Seiten als Bild.
- **Hoffmann:** Laut Inhaltsverzeichnis enden Kap. 1 und 2 mit Zusammenfassung und Literatur, ohne Übungsaufgaben. Die übrigen Kapitel habe ich noch nicht geprüft (Inhaltsverzeichnis im PDF ist ein Scan). Hoffmann dient vor allem für anschauliche Beispiele (z. B. Dipyramiden {111}/{113}).
- **Bildrechte:** Keine Abbildungen aus Büchern oder Folien; alle Bilder kommen aus der App. Wo eine Aufgabe Vorbild ist, steht „nach Borchardt-Ott Aufg. …“.

## 5. Ablauf für Studierende

1. **Start:** Stufe wählen (1/2/3), optional Kapitel eingrenzen, Anzahl Fragen (5 / 10 / 20).
2. **Fragen** werden zufällig gezogen, Antworten gemischt. Stufe 2 enthält auch Fragen der Stufe 1, Stufe 3 alle (Anteile z. B. 30/70 bzw. 20/30/50).
3. **Rückmeldung sofort** nach jeder Frage: richtig/falsch, Erklärung, „Im Skript nachlesen“, ggf. „In der App öffnen“.
4. **Auswertung:** Anteil richtig je Kapitel, Liste der falschen Fragen zum Wiederholen.
5. **Fortschritt** nur lokal im Browser (localStorage, abgesichert wie im Skript); kein Konto, kein Server, keine Daten an Dritte. Offline nutzbar.

## 6. Form und Einbindung

- **Eigene Seite `quiz.html`** wie `skript.html`: gleiche Kopfzeile, Schriften, Farben, Dunkelmodus; im Kopf ein vierter Eintrag „Quiz“.
- **Verbindungen:**
  - Quiz → Skript über die vorhandenen Anker (z. B. `skript.html#zonengleichung`)
  - Quiz → App über die Link-Adresse (`index.html#m=form&…`)
  - Skript → Quiz: am Kapitelende „Lernziele prüfen“ (öffnet das Quiz mit Kapitel und Stufe 1 vorgewählt)
- **Layout** für Laptop, iPad und Telefon; Antworten als grosse Schaltflächen; Tastatur (1–4, Enter).

## 7. Datenformat

Fragen in `js/quiz-bank.js` (oder JSON), je Frage:

| Feld | Inhalt |
|---|---|
| `id` | stabil, z. B. `zon-1-03` |
| `stufe` | 1, 2 oder 3 |
| `kapitel`, `lernziel` | Kapitel des Skripts und zugehöriges Lernziel |
| `typ` | einfach / mehrfach / bild-text / text-bild / bild-bild |
| `frage`, `bild` | Text; Bild als App-Ansicht (Link-Adresse), wird über `scene.js` als Stereogramm erzeugt; „3d“ + Link-Adresse ergibt eine räumliche Zeichnung (`bild3d.js`) |
| `antworten`, `richtig` | Antworten, Index bzw. Indizes der richtigen |
| `erklaerung` | Erklärung, auch zu den Ablenkern |
| `skript`, `app` | Anker im Skript, Ansicht in der App |
| `quelle` | z. B. „nach Borchardt-Ott Aufg. 5.4“, „eigene“ |
| `status` | entwurf / geprüft (nur geprüfte erscheinen in der App) |

Erzeugte Fragen stehen als kleine Funktionen in `js/quiz-gen.js` mit denselben Feldern.

## 8. Fachliche Absicherung

- Arbeitsweise wie beim Skript: Quelle lesen → Frage schreiben → Antwort nachrechnen → Gegenlesen ohne Kenntnis des Entwurfs → Durchsicht durch Thomas. Erst dann `status: geprüft`.
- **Tests** (`tests/quiz.test.mjs`):
  - eindeutige IDs, jede Frage hat Stufe, Kapitel, Quelle, Erklärung
  - Skript-Anker und App-Ansichten existieren
  - jede Frage hat genau eine richtige Antwort (Einfachauswahl) bzw. mindestens eine (Mehrfachauswahl), keine doppelten Antworten
  - Zahlen in handgeschriebenen Fragen (Flächenzahlen, Zonenachsen, Punktgruppen) gegen die App-Daten
  - Stufe 1 und 2 enthalten keine Vertiefungsinhalte (Kapitel 8/9 bzw. Anker mit `data-level="vertiefung"` nur in Stufe 3)
  - Mindestzahl Fragen je Kapitel und Stufe

## 9. Umsetzung in Schritten

1. **Prototyp:** Seite, Ablauf, Datenformat, Tests; Stufe 1 für Kap. 1 und 4 (je ca. 8 Fragen) plus ein Generator (Symmetriegerüst → Punktgruppe). Durchsicht durch Thomas.
2. **Stufe 1 und 2** für Kap. 1–7.
3. **Stufe 3** (Vertiefungen, Kap. 8 und 9), Links „Lernziele prüfen“ im Skript.
4. **Bildzuordnungen** mit räumlichen Zeichnungen (Fragetyp 5).
5. **Release** (v1.8.0).

Richtwert Umfang: je Kapitel und Stufe 6–10 handgeschriebene Fragen, zusammen etwa 120–150, dazu die Generatoren.

## 10. Offene Fragen

1. **Moodle:** Soll die Fragenbank zusätzlich als Moodle-XML exportierbar sein, damit du Fragen auch im Moodle-Quiz verwenden kannst? Oder bleiben beide bewusst getrennt?
2. **Rückmeldung:** sofort nach jeder Frage (Vorschlag) oder optional ein Modus „erst am Ende“?
3. **Stufe 2:** Passt die Liste der Randthemen in Abschnitt 2?
4. **Fortschritt** lokal speichern: ja oder lieber gar nichts speichern?
5. **Erzeugte Fragen:** einverstanden, oder nur handgeschriebene, von dir durchgesehene Fragen?
6. **Umfang** für den ersten Release: alle drei Stufen, oder zuerst Stufe 1 und 2?

## 11. Entscheidungen (25.10.2026)

1. **Moodle:** Die Fragenbank wird zusätzlich als Moodle-XML exportierbar (Skript im Repository, nur geprüfte Fragen; Bilder als eingebettete SVG).
2. **Rückmeldung** sofort nach jeder Frage; kein Modus „erst am Ende“.
3. **Stufe 2:** Liste der Randthemen in Abschnitt 2 passt.
4. **Fortschritt** wird lokal im Browser gespeichert.
5. **Erzeugte Fragen** sind in Ordnung.
6. **Erster Release** mit allen drei Stufen.
7. **Prototyp** wie in Abschnitt 9, Schritt 1 vorgeschlagen.
8. **Räumliche Bilder** (Rückfrage zu den Bildzuordnungen, Antwort „Feste Zeichnung“): statisches SVG aus den Daten der App mit fester Blickrichtung, nicht drehbar. So funktionieren die Bilder im Moodle-Export, offline, in den Tests und als vier Antwortbilder, und Lagefragen lassen sich nicht durch Drehen lösen. Blickrichtung [3, −1, 1,5]: *a* zum Betrachter, *b* nach rechts, 25° von oben, Projektionsrichtung senkrecht mit Pfeil. Bewusst nicht die Standardansicht der 3D-Ansicht: Sie liegt nur 15° neben [111], dort zeigte das Tetraeder eine einzige Fläche. Die kubischen Symmetriegerüste ausser 23 sind als Zeichnung zu dicht und kommen nur als Stereogramm vor; 23 fällt mangels Ablenker ebenfalls weg.
9. **Anteil erzeugter Fragen:** höchstens 50 % eines Quiz, alle Generatoren zusammen; je Generator höchstens 30 %. Reichen die handgeschriebenen Fragen nicht, wird das Quiz kürzer.
10. **Offene Formen** erscheinen in den Bildfragen wie in der App mit grau ergänzter Form (Prisma mit grauem Pinakoid, im Stereogramm grauer Punkt im Kreis).
