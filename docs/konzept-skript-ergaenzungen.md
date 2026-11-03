# Konzept: Ergänzungen und Neuordnung des Skripts

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Umgesetzt (v1.9.0, v1.9.1); Stand des Skripts heute v1.12.0. Offene Punkte aus dem Text: Werkzeug für die Fragenliste lag nur im Scratchpad (Issue #51); App-Hinweise bei Fragen wie `hex-2-02` (Issue #54); Option „rhomboedrische Achsen“ (Issue #57).
>
> Der Text darunter ist der Stand des Konzepts und wird nicht mehr nachgeführt. Was heute gilt, steht in `CLAUDE.md` und im `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 29.10.2026 (zehnte Fassung). Alle Schritte sind umgesetzt; Thomas hat das Skript am 28.10. gelesen und keine inhaltlichen Fehler gefunden. Danach ergänzt: enantiomorph = chiral, Prüfung aller Quiz-Links (Abschnitt 11), Verweise auf die Vorlesung entfernt (Abschnitt 12), Durchsicht aller Quiz-Entwürfe abgeschlossen und interaktive Abb. 8.5 „Wachstum“ (Abschnitt 13). Entscheidungen von Thomas vom 27. und 28.10.2026 in Abschnitt 8. Grundlage: Vorlesung HS 2026, Kap. 0–5, Skript und App v1.8.1, Einstufung nach `konzept-vertiefung.md`. Umsetzung auf Branch `skript-neuordnung`, PR #41, am 29.10.2026 zusammengeführt und als v1.9.0 veröffentlicht.

## 1. Leitlinien

1. **App und Skript sind eigenständig.** Sie sind durch die Vorlesung motiviert und werden dort genutzt, müssen aber auch ohne sie verständlich sein. Seit 28.10. verweisen sie nicht mehr auf Vorlesung, Übungen oder Folien; genannt wird nur die Herkunft (Abschnitt 12). Das ersetzt den Grundsatz aus `konzept-skript.md`, dem Aufbau der Vorlesung zu folgen; Begriffe bleiben die der Vorlesung bzw. von Borchardt-Ott.
2. **Das Skript deckt die App fachlich vollständig ab.** Jeder Fachbegriff, den die App anzeigt (Infobox, Tooltips, Optionen, Beispiele), wird im Skript erklärt, notfalls als Vertiefung.
3. **Didaktik vor Aufwand.** Das Quiz wird ohnehin an die neuen Themen angepasst. Kapitelreihenfolge und Nummern dürfen sich deshalb ändern, wenn das Skript dadurch besser wird.
4. **Kastentyp „Grundlagen“** (`.box.grundlagen`, Kopfzeile „Grundlagen · Thema“, mit Anker): fasst Grundwissen kurz zusammen, auf dem der Text aufbaut (Miller-Indizes, Gruppe, Untergruppe). Kein Bezug auf die Vorlesung im Kasten. Gilt wie „Merke“ als Haupttext, nicht als Vertiefung. Kurz, höchstens eine kleine Abbildung. In der Legende „So ist das Skript aufgebaut“.
5. **Vertiefung statt Haupttext** (Entscheidung 28.10.): Neue Themen, die in erster Linie die App betreffen und nicht die Vorlesung, werden als Vertiefung gekennzeichnet; ebenso Themen, die in der Vorlesung nur eine untergeordnete Rolle spielen (z. B. Schoenflies-Symbole) oder erst später vorkommen (rhomboedrische Achsen). Haupttext und Grundlagen bleiben dem Stoff der Vorlesung vorbehalten; im Skript heisst dieser Teil „Grundstoff“.
6. **Harmonisch einfügen** (Hinweis 28.10.): Ergänzungen passen sich in Sprachstil, Niveau und fachlicher Tiefe dem bestehenden Skript an: kurze Sätze, Begriffe beim ersten Auftreten hervorgehoben, wenige Formeln, Erklärung am Stereogramm, Abbildungen aus dem Code der App, Lernziele, Merke, Zusammenfassung und Quellen wie in den übrigen Kapiteln.

## 2. Befund und Einstufung

Spalte „Ebene“ nach Leitlinie 5: H = Haupttext, G = Grundlagen-Kasten (Haupttext), V = Vertiefung.

| Nr. | Thema | Ebene | Ort | Stand |
|---|---|---|---|---|
| 1 | Drehinversionsachsen 1̄–6̄, Kopplung und Kombination | H | Kap. 3 | umgesetzt |
| 2 | Drehspiegelachsen, Schoenflies  | V (Kasten) | Kap. 3 | umgesetzt |
| 3 | 32 Kristallklassen, 7 Kristallsysteme | H | Kap. 3 | umgesetzt |
| 4 | Gruppe, Verknüpfung, Erzeugende, Ordnung  | G | Kap. 3 | umgesetzt |
| 5 | Untergruppe  | G | Kap. 3 | umgesetzt |
| 6 | Miller-Indizes  | G | Kap. 1 | umgesetzt |
| 7 | Symmetrieoperation und -element | H | Kap. 3 | umgesetzt |
| 8 | Multiplizität, Familien {hkl}, ⟨uvw⟩ | H | Kap. 6 | umgesetzt |
| 9 | Indizes bei verändertem Gitter | H | Kap. 1 | umgesetzt |
| 10 | Quarz: Prisma und Rhomboeder  | H; Links-/Rechtsquarz V | Kap. 9 | umgesetzt |
| 11 | Würfel → Rhomboeder, 3̄m | H | Kap. 9 | umgesetzt |
| 12 | Pyrit  | H; Flächensymmetrie und Streifung V | Kap. 6 | umgesetzt |
| 13 | App-Infobox: Laue-Klasse, zentrosymmetrisch, enantiomorph | V | Kap. 5 | umgesetzt |
| 14 | App-Infobox: polar, piezoelektrisch | V | Kap. 5, Kap. 11 verweist | umgesetzt |
| 15 | App: „Pole nach Händigkeit färben“ | V (Kasten) | Kap. 3 | umgesetzt |
| 16 | App: zwei Aufstellungen derselben Punktgruppe | V | Kap. 5 | umgesetzt |
| 17 | App: Symmetriebruch „Alle Parameter frei“ | V | Kap. 11 | umgesetzt |
| 18 | App-Beispiele Gips, Turmalin, Links-/Rechtsquarz | wie das Thema | Kap. 5, 9 | umgesetzt |
| 19 | Symmetriesätze I und II | H | Kap. 4 | umgesetzt (Abschnitt 9) |
| 20 | App: Werkzeug „Winkel“ | App-Kasten | Kap. 2 | umgesetzt |
| 21 | Rhomboedrisches Achsensystem (in der Vorlesung erst bei den Bravais-Gittern) | V | Kap. 9 | umgesetzt (Abschnitt 10) |

## 3. Kapitelfolge (entschieden und umgesetzt 28.10.)

| neu | Kapitel | Inhalt | aus |
|---|---|---|---|
| 1 | Kristallflächen und Indizes | Aufstellung und Indizes mit Grundlagen Miller-Indizes, Indizes und Gitter, hexagonales Achsensystem | alt 2, alt 7 |
| 2 | Die stereographische Projektion | wie alt 1; App-Kasten „Winkel“ | alt 1 |
| 3 | Symmetrieoperationen und Punktgruppen | neu | — |
| 4 | Symmetriegerüste im Stereogramm | wie alt 3, dazu die Symmetriesätze | alt 3 |
| 5 | Blickrichtungen | wie alt 6; Vertiefungen Aufstellungen, Eigenschaften der Punktgruppen | alt 6 |
| 6 | Kristallformen im Stereogramm | wie alt 2; Multiplizität, Flächenzahl, Pyrit und Galenit | alt 2 |
| 7 | Zonen | wie alt 4 | alt 4 |
| 8 | Tracht und Habitus | wie alt 5; Wachstumsregel, Abb. 8.5 „Wachstum“ | alt 5 |
| 9 | Trigonale und hexagonale Kristalle | Rhomboeder, Quarz; Vertiefungen rhomboedrische Achsen, (hkil) | alt 7 |
| 10 | Vertiefung: Lagen, Flächensymmetrie und Multiplizität | wie alt 8 | alt 8 |
| 11 | Vertiefung: Symmetrieändernde Verzerrungen | wie alt 9, ⟨111⟩ auf Kap. 9 abgestimmt; „Alle Parameter frei“ | alt 9 |

- Die Projektion bleibt vor der Symmetrie (anders als die Vorlesung), weil Kap. 3 die Operationen am Stereogramm zeigt (Bahnen).
- Anker bleiben gültig; neue Anker `#indizes`, `#miller`, `#indizes-gitter`, `#punktgruppen`, `#operationen`, `#drehinversion`, `#punktgruppe`, `#gruppe`, `#untergruppe`, `#kristallsysteme`, `#schoenflies`, `#symmetriesaetze`, `#aufstellung-pg`, `#eigenschaften`, `#pyrit`, `#rhomboeder`, `#quarz`, `#rhomboedrisch`, `#fig-wachstum`.

## 4. Inhalte (umgesetzt)

### Kap. 1 Kristallflächen und Indizes
- **Grundlagen · Miller'sche Indizes** (`#miller`): Achsenabschnitte → Kehrwerte → kleinste ganze Zahlen; Beispiel (362) mit eigener Zeichnung (Abb. 1.1, nach B-O Abb. 3.9); Gesetz der rationalen Indizes (Haüy) nach Schwarzenbach 1.3.2. Index 0, negativer Index, [uvw], {hkl}, ⟨uvw⟩.
- **Indizes und Gitter** (`#indizes-gitter`, H): tetragonale Dipyramide {111} bei c/a = 0,64, 1 und 2 (Neigung 42,2°, 54,7°, 70,5°), Tabelle, Einheitsfläche und Achsenverhältnis am Beispiel „Zwei tetragonale Dipyramiden“ (Abb. 1.3).

### Kap. 3 Symmetrieoperationen und Punktgruppen
- Symmetrieoperation und -element, Kopplung und Kombination (4̄ gegenüber 4/m, die fünf n̄), Punktgruppen mit Grundlagen · Gruppe und Grundlagen · Untergruppe, Kristallsysteme und Kristallklassen.
- Vertiefungen: **Operationen erster und zweiter Art** (Begriffe nach Schwarzenbach 2.2.3, anschaulich mit der rechten Hand erklärt; Farben der Pole, Links- und Rechtsform), **Drehspiegelachsen und Schoenflies-Symbole** (`#schoenflies`).

### Kap. 5 Blickrichtungen, zwei Vertiefungsabschnitte
- **Zwei Aufstellungen derselben Punktgruppe** (`#aufstellung-pg`): 321/312 mit Stereogrammen und Kristallachsen (Abb. 5.7); {100} in 312 trigonales, in 321 hexagonales Prisma (mit `siteOf` nachgerechnet); Tabelle der fünf Paare; Drehung um 30° bzw. 45°; monoklin b/c, Gips. Quelle Schwarzenbach 2.5.9.
- **Was die Punktgruppe über den Kristall verrät** (`#eigenschaften`): Abb. 5.8 4/mmm, 422, 4mm nach Händigkeit; zentrosymmetrisch, Laue-Klasse (Schwarzenbach 2.5.7, Friedel), enantiomorph oder chiral (beide Begriffe, nach ITA 10.2.1.1, S. 804; Kleber S. 60 und 412; Schwarzenbach 2.5.3, S. 49) mit optischer Aktivität (B-O 9.5, 9.6.1; auch in m, mm2, 4̄ und 4̄2m möglich, B-O S. 170), Hinweis auf den engeren Gebrauch bei den Raumgruppen (enantiomorphe Schraubenachsen, B-O 10.1, S. 203), polar mit Pyroelektrizität und Turmalin (B-O 9.6.3), piezoelektrisch mit Quarzplatte (B-O 9.6.2); Unterschied „polare Achse“ (B-O S. 164) und polare Punktgruppe am Quarz; Tabelle der 11 Laue-Klassen mit den übrigen 21 Punktgruppen (e/p markiert).

### Kap. 6 Kristallformen
- **Multiplizität** (H, in `#allgemein`): Würfel 6, Oktaeder 8, Rhombendodekaeder 12, Hexakisoktaeder 48; ⟨111⟩ 8 Richtungen; Würfel gegenüber Quader (drei Pinakoide); gestreckter Würfel entlang [001] (Pinakoid und tetragonales Prisma). Es gibt in einer Punktgruppe viele allgemeine Formen; „die allgemeine Form“ meint den Typ.
- **Flächenzahl bestimmen** (H): Bilder eines Pols abzählen; in m3̄m über die Indizes (Zahl der Reihenfolgen 3!/k! mal 2 je Index ≠ 0), Tabelle {100} bis {321}, Hinweis, dass die Regel nur in m3̄m gilt.
- **Gleicher Würfel, andere Symmetrie: Pyrit und Galenit** (`#pyrit`, nach „Andere Projektionsrichtung“, weil dort der Galenit eingeführt wird): siehe Abschnitt 5. Dazu das orientierte Symbol 2mm.. gegenüber 4m.m (Stellen je Blickrichtung, Punkte für „kein Element“, gleichwertige Spiegelebenen nur einmal; ebenso in Kap. 10).

### Kap. 8 Tracht und Habitus
- **Wachstumsregel:** schnell wachsende Flächen verschwinden, langsame bleiben; hoch indizierte Flächen wachsen meist schnell (Besetzungsdichte der Netzebenen, Kleber 1.9.4, S. 102–106). Regel, kein Gesetz: Beispiel Kaliumalaun mit Wachstumsraten (Kleber 4.3, S. 280–281, Abb. 4.12); „Die konkreten Bedingungen, unter denen ein Kristall wächst, können die Rangfolge ändern; aus einer Lösung mit etwas Borax wächst Alaun sogar als Würfel“ (Formulierung nach Thomas, 29.10.).
- **Abb. 8.5 „Wachstum“** (`#fig-wachstum`, interaktiv, Idee Thomas zu `hab-2-01`): Galenit aus Würfel {100} und Oktaeder {111}, anfangs gleich weit vom Mittelpunkt. Auswahl, welche Form schneller wächst; ein Regler verschiebt sie doppelt so schnell nach aussen. Kristall (räumliche Zeichnung, auf gleiche Grösse gebracht) und Stereogramm nebeneinander, darunter das Abstandsverhältnis. Das Oktaeder verschwindet bei Oktaeder : Würfel = √3 ≈ 1,73, der Würfel bei 1/√3 ≈ 0,58; mit der Form verschwinden ihre Pole im Stereogramm. Code: `wachstumFigur` in `js/skript.js`, `koerperSVG(…, { state })` in `js/bild3d.js`.

### Kap. 9 Trigonale und hexagonale Kristalle
- Abbildungen in der Reihenfolge des Textes: 9.1 Rhomboeder, 9.2–9.4 Quarz, 9.5 rhomboedrische Achsen, 9.6–9.7 (hkil).
- **Ein Beispiel: Quarz** (`#quarz`, H): Prisma {100}, positives Rhomboeder {101}, negatives {011}; je 6 Flächen, um 60° versetzt; oben sechs Pole bei ρ ≈ 51,8° (c/a = 1,10), unter jedem der Pol der unteren Fläche des anderen Rhomboeders (● im ○, mit den Operationen von 321 nachgerechnet); Aufstellung so, dass das grosse Rhomboeder {101} heisst (Kleber); verschieden grosse Rhomboeder zeigen die trigonale Symmetrie (Abb. 9.3, Abstände über `ab=`). Vertiefung **Links- und Rechtsquarz** (Abb. 9.4) mit den Indizes nach Kleber Abb. 1.70 und dem Hinweis, dass die Benennung nicht einheitlich ist.
- **Rhomboedrische Achsen** (`#rhomboedrisch`, V): siehe Abschnitt 10.
- **Vier Indizes für Flächen** (`#hkil`, V): unverändert.

### Kap. 11
- Absatz zu allen Gitterparametern: a lang → 4/mmm, a ≠ b ≠ c → mmm, + β → 2/m, alle verschieden → 1̄ (mit `buildCrystal` nachgerechnet); Zitat Schwarzenbach S. 61 „Die Symmetrie bestimmt die metrischen Zusammenhänge, nicht aber die Metrik die Symmetrie“. App-Kasten „Alle Parameter frei“.

## 5. Pyrit (Kap. 6, entschieden 28.10., umgesetzt)

- **Einstieg (H):** Pyrit m3̄ (2/m 3̄) und Galenit m3̄m; m3̄ als Untergruppe mit 24 Operationen; dritte Blickrichtung ⟨110⟩ leer (Abb. 6.8 Pyrit 3D und Stereogramm über m3̄).
- **Pentagondodekaeder {210} (H):** in m3̄ 12 Flächen, in m3̄m 24 (Tetrakishexaeder); (210) und (120) nur über die Spiegelung ⊥ [11̄0] verbunden (Abb. 6.9). Fünfecke nicht regelmässig: vier Kanten gleich, die fünfte nicht; ihre Länge hängt von h : k ab (nachgerechnet): {210} 1,31-mal so lang wie die übrigen, {320} 0,87-mal; regelmässig nur bei h : k = Goldener Schnitt, irrational und deshalb nach dem Gesetz der rationalen Indizes ausgeschlossen (Verbindung zu Kap. 1 und 3). Hoffmann S. 271 („eine Seite kürzer“) gilt also nur für h : k < 1,618. Kleber Abb. 1.89m (S. 79) zeigt eine eher kürzere Kante, Thomas' Modell eine deutlich längere; beides passt dazu.
- **Merke:** Multiplizität hängt von der Punktgruppe ab; der Würfel verrät sie nicht.
- **Vertiefung · Die Würfelfläche des Pyrits:** Flächensymmetrie der Fläche (100) 2mm.. statt 4m.m (Abb. 6.10, Würfel mit Muster; ITA Tab. 10.1.2.2, Lage 6a in m3̄), Streifung in nur einer Richtung je Fläche (B-O Tab. 9.4 Nr. 29, S. 141, und S. 168).

## 6. Quellen

- Folien nur als Massstab für Begriffe und Umfang, nicht als zitierte Quelle.
- Bestimmt (aus den PDFs in Zotero, Seitenzahlen gedruckt): Miller-Indizes B-O 3.4.2–3.4.3 (S. 14–17), Hoffmann 2.2 (S. 42–52); Gesetz der rationalen Indizes Schwarzenbach 1.3.2 (S. 11–12); Einheitsfläche B-O 5.7 (S. 54–55), Hoffmann S. 50–51; Symmetrieoperation und -element B-O S. 67–69, Hoffmann 3.1; Kopplung, Drehinversion, Drehspiegelung B-O 6.4 (S. 75–78), Hoffmann 3.2.4; Kristallsysteme B-O Kap. 8, Hoffmann 3.3.3, Schwarzenbach 2.5.8; Gruppe B-O 11.2, Hoffmann 6.4, Schwarzenbach 2.2.2; Operationen erster/zweiter Art Schwarzenbach 2.2.3; Symmetriesätze B-O 7.2 (S. 102), Hoffmann S. 101 und 114; Laue-Klassen Schwarzenbach 2.5.7; Aufstellungen Schwarzenbach 2.5.9; Enantiomorphie, optische Aktivität, Piezo- und Pyroelektrizität B-O 9.5–9.6 (S. 169–171), polare Drehachsen B-O S. 164; Pyrit B-O S. 141 und 168, Hoffmann S. 36–37 und 271; regelmässiges Pentagondodekaeder nicht kristallographisch B-O 9.7 (S. 175–176); Links-/Rechtsquarz B-O Tab. 9.4 Nr. 18 (S. 138).
- **Kleber:** W. Kleber, J. Bohm, D. Klimm, M. Mühlberg, B. Winkler, *Einführung in die Kristallographie*, 20. Aufl., De Gruyter, Berlin/Boston 2020 (so jetzt auch in Zotero, Eintrag A4LNCUIS, mit vollständigem PDF; Kleber als erster Autor nach Entscheidung von Thomas). Hinweis Thomas: Kap. 1 ist eine sehr gute Quelle für indizierte Kristalle und Polyeder aller 32 Punktgruppen. Gedruckte Seite = PDF-Seite − 16.
- Quarz nach Kleber S. 70–71 (Abb. 1.70): Linksquarz s (2-1-11), x (6-1-51); Rechtsquarz s (11-21), x (51-61); r {10-11}, z {01-11}, m {10-10}, identisch mit den Beispielkristallen der App. Aufstellung so, dass {10-11} das grosse Rhomboeder ist; Unterscheidung nach Heaney u. a. (1994): Blick auf (10-10), Trapezoederfläche oben rechts = Rechtsquarz. Ersetzt die bisherigen Quellen Spektrum-Lexikon und Wikipedia (Skript, Quiz, examples.js).
- Pentagondodekaeder {hk0} und Pyrit: Kleber S. 79–80 (Abb. 1.89m, 1.90).
- Wachstum und Habitus: Kleber 1.9.4 (S. 102–106, Besetzungsdichte der Netzebenen) und 4.3 (S. 280–281, Abb. 4.12: Kaliumalaun, relative Wachstumsraten {111} 1,0, {110} 4,8, {001} 5,3, {221} 9,5, {112} 11,0; Alaun mit Borax als Würfel, NaCl mit Harnstoff als Oktaeder); B-O 5.3 (S. 38).
- Orientierte Lagesymbole: ITA (Vol. A), Tab. 10.1.2.2 (m3̄, Lage 6a „2mm..“).
- Rhomboedrische Achsen: Hoffmann 2.8 (S. 85–90, nach Thomas die anschaulichste Darstellung; Borchardt-Ott ist hier weniger eingängig); Schwarzenbach 2.5.8 (S. 62–63, IUCr-Terminologie trigonal/rhomboedrisch, Bild 2.22) und 2.9 (Calcit R3̄c, S. 91); Kleber 1.1.2 (S. 12), 1.6.5 (S. 68, hexagonale und rhomboedrische Achsen im trigonalen System, Gitter hR und hP), 1.9.4 (Quarz P3₁2, S. 106).
- Alle Zahlen sind mit dem Code der App bzw. eigenen Skripten nachgerechnet.

## 7. Umsetzung (Branch `skript-neuordnung`, PR #41)

1. Kapitelfolge — erledigt.
2. Kap. 1 und 3, Symmetriesätze — erledigt.
3. Querstriche wie in der App, Gesetz der rationalen Indizes, Operationen erster und zweiter Art — erledigt.
4. Kap. 5 (Aufstellungen, Eigenschaften) — erledigt.
5. Kap. 6 (Multiplizität, Pyrit) — erledigt.
6. Kap. 9 und 11 (Quarz, alle Parameter frei) — erledigt.
7. **Infobox verlinkt ins Skript:** Jede Bezeichnung der Infobox, dazu „Aufstellung“, „Schoenflies“ und „Symmetrie erniedrigt“, ist ein Link auf den erklärenden Abschnitt (`js/skriptlinks.js`, gepunktet unterstrichen). Die bisherigen Links „Skript →“ sind darin aufgegangen. Test: jeder Begriff hat einen Verweis, jeder Anker liegt im genannten Kapitel.
8. **Quiz:** 32 neue Fragen als Entwurf (Kap. 1, 3, 4, 5, 6, 9, 11); Links „Lernziele prüfen“ für Kap. 3 und 9; Quellenangaben der bestehenden Fragen auf die neue Kapitelfolge umgestellt.
9. **Fachliche Gegenprüfung** durch einen unabhängigen Agenten (Bücher und App-Code). Korrigiert: vertauschte Hinweise in `ind-2-01`; Quarzrhomboeder ist gestaucht, nicht gestreckt; Flächensymmetrie 2mm.. am Vertreter (100) statt (001) (orientiertes Symbol); „polar“: oben und unten *können* verschiedene Formen auftreten; höchstsymmetrische Punktgruppe trigonal nur beim rhomboedrischen Gitter; Definition Symmetrieelement passend zur Drehinversion; Hinweise in `sym-1-08` und `hex-1-07`.
10. **Kleber eingearbeitet** (28.10.): Quarz-Indizes und Händigkeit, Pentagondodekaeder mit von h : k abhängiger Kantenlänge; Zitierweise mit Kleber als erstem Autor.
11. **Durchsicht durch Thomas** (28.10.): keine inhaltlichen Fehler; Abstand vor den Kapitelüberschriften vergrössert (`article > section + section { margin-top: 64px }`).
12. **Rhomboedrische Achsen** (28.10., Abschnitt 10) — erledigt.
13. **Enantiomorph = chiral** (28.10.): Skript Kap. 5 und Tooltip der Infobox („Auch chiral genannt …“) nennen beide Begriffe; Zusammenfassung „Enantiomorph (chiral)“; optische Aktivität auch in m, mm2, 4̄, 4̄2m — erledigt.
14. **Quiz Kap. 3 und 9 von Thomas geprüft** (17 Fragen, Status „geprüft“); `hex-3-01` fragt jetzt nach (112) (richtig (112̄2), Antworten in vier Indizes), damit „In der App öffnen“ (`f=6/mmm:d31&hkil=1`) genau diese Fläche zeigt — erledigt.
15. **Quiz-Links geprüft** (Abschnitt 11) — erledigt.
16. **Verweise auf die Vorlesung entfernt** (Abschnitt 12) — erledigt.
17. **Durchsicht aller Quiz-Entwürfe** (28.–29.10., Abschnitt 13) — erledigt: 153 Bankfragen und 6 Generatoren „geprüft“.
18. **Interaktive Abb. 8.5 „Wachstum“** (29.10., Abschnitt 4, Kap. 8) — erledigt.
19. PR #41 am 29.10. aus dem Entwurfsstatus genommen, nach einer unabhängigen Durchsicht des ganzen Skripts (Befunde eingearbeitet, u. a. Reihenfolge im orientierten Symbol nach ITA Tab. 2.2.4.1 und Abschn. 2.2.12) zusammengeführt und als **v1.9.0** veröffentlicht (Tag von Thomas gesetzt; diese Sitzung darf keine Tags oder Releases anlegen).
20. **v1.9.1** (29.10., nach einer externen Durchsicht mit ChatGPT): 17 veraltete Abbildungsverweise in 16 Quizfragen korrigiert, Test dafür (Abbildung existiert und liegt im Kapitel der Frage); Skript Kap. 2 mit *r* = *R* · tan(ρ/2), Kap. 4 mit Übersicht aller Symbole; Quiz-Startseite: Stufe 3 bedeutet mehr Stoff, nicht unbedingt schwierigere Fragen.

## 8. Entscheidungen (Thomas)

27.10.2026:
1. Kastenname „Grundlagen“. App und Skript sollen auch ohne die Vorlesung funktionieren.
2. Rhomboeder in den Haupttext des Kapitels zu den hexagonalen Achsen, abgestimmt mit dem Kapitel zu den Verzerrungen.
3. Laue-Klasse, enantiomorph, zentrosymmetrisch im Skript erklären; das Skript soll die gesamte App fachlich abdecken.
4. Gute didaktische Aufbereitung geht vor dem Aufwand für das Quiz.

28.10.2026:
5. Neue Kapitelfolge umsetzen (Abschnitt 3).
6. Pyrit wie in Abschnitt 5.
7. Neue Themen, die vor allem die App betreffen, und Themen mit untergeordneter Rolle in der Vorlesung (z. B. Schoenflies) als Vertiefung kennzeichnen (Leitlinie 5).
8. Die beiden Symmetriesätze an geeigneter Stelle mit guter Visualisierung ergänzen (Abschnitt 9).
9. Ergänzungen fügen sich in Sprachstil, Niveau und fachlicher Tiefe harmonisch ins bestehende Skript ein (Leitlinie 6).
10. Schwarzenbach „Kristallographie“ ist Quelle für das Gesetz der rationalen Indizes und für Operationen erster und zweiter Art; die Begriffe werden in der Vertiefung verwendet und anschaulich erklärt. Querstriche korrigieren.
11. Kleber (2020) ist Quelle für die Quarzformen (S. 70) und eine gute Quelle für indizierte Kristalle und Polyeder aller 32 Punktgruppen (Kap. 1). Zitiert mit Kleber als erstem Autor, die vier Bearbeiter als weitere Autoren.
12. Rhomboedrisches Achsensystem als kurze Vertiefung in Kap. 9, im vorgeschlagenen Umfang (Abschnitt 10); Hoffmann ist dafür eine gute, anschauliche Quelle.
13. „Enantiomorph“ und „chiral“ in Skript und App als gleichbedeutend nennen.
14. **Link und Frage müssen immer zusammenpassen:** „In der App öffnen“ zeigt genau, wonach die Frage fragt (Abschnitt 11).
15. Verweise auf die Vorlesung entfernen; das Projekt soll auch für Leute nützlich sein, die die Vorlesung nicht kennen. Unmarkierter Text heisst „Grundstoff“, der Kasten in Kap. 10 und 11 „Voraussetzungen“, spätere Vorlesungsteile werden als Strukturkristallographie mit Verweis auf Borchardt-Ott & Sowa bezeichnet.
16. Die Herkunft aus der Vorlesung bleibt sichtbar: in App, Skript und in jedem Fall auf GitHub. Zielgruppe bleiben Studierende in einer Einführungsvorlesung Kristallographie oder mit vergleichbarem Hintergrund.

28.–29.10.2026 (Durchsicht der Quizfragen):
17. Themen, die Stoff der Vorlesung sind, gehören auf Stufe 2, nicht auf Stufe 3 bzw. in eine Vertiefung.
18. Erklärungen sollen sich aus dem verlinkten Skriptabschnitt herleiten lassen; was dort fehlt, wird im Skript ergänzt.
19. In räumlichen Zeichnungen soll die Zähligkeit um die Projektionsrichtung erkennbar sein. Leicht verwechselbare Körper (Würfel mit [111] bzw. [110] senkrecht) stehen nie zusammen in einer Frage.
20. Die Wachstumsregel ist eine Tendenz; Ausnahmen werden allgemein mit den konkreten Wachstumsbedingungen begründet, nicht mit Bedingungen, unter denen nicht jeder Kristall wächst.

## 9. Symmetriesätze (umgesetzt 28.10.)

- **Ort:** Kap. 4, Abschnitt `#symmetriesaetze`, direkt nach „Wohin ein Symmetrieelement einen Pol bringt“; die Sätze lassen sich mit den Regeln aus Abb. 4.1 am Stereogramm herleiten. Kap. 3, Kap. 5 (volles und gekürztes Symbol) und Kap. 11 verweisen darauf.
- **Inhalt:** Satz I und II als Merke (nach B-O S. 102). Herleitung am Stereogramm, Pole nach Händigkeit gefärbt: Satz I an 2/m (Abb. 4.2), Satz II an mm2 (Abb. 4.3). Umkehrungen, Einschränkung (m + 1̄ erzeugt nur 2), Folgen.
- **Quellen:** B-O 7.2 (S. 102, Abb. 7.14, 7.15), 9.1 (S. 128–129); Hoffmann 3.2.2 (S. 101), 3.3.2 (S. 114).

## 10. Rhomboedrische Achsen (umgesetzt 28.10.)

- **Ort:** Kap. 9, Vertiefungsabschnitt `#rhomboedrisch` nach dem Quarz und vor (hkil). Gehört eigentlich zu den Bravais-Gittern (Strukturkristallographie); der erste Satz sagt das.
- **Inhalt:**
  - Die Kanten des gestreckten Würfels als Achsen: a = b = c, α = β = γ ≠ 90°; Würfel α = 90°, Streckung 1,3 → α = 79,2°; keine Achse fällt mit einer Drehachse zusammen, die 3-zählige liegt zwischen ihnen.
  - Abb. 9.5: gestreckter Würfel mit Kristallachsen (`achsen=1`) in 3D und im Stereogramm über 3̄m; die Achsen liegen je auf einer Spiegelebene.
  - Indizes behalten sich beim Strecken (Kap. 1), also sind die Würfelindizes die rhomboedrischen. Tabelle (mit der App nachgerechnet, Umrechnung h = H − K, k = K − L, l = H + K + L): Würfel {100} → {101}; Oktaeder {111} → Pinakoid {001}, {11̄1} → Rhomboeder {021}; Rhombendodekaeder {110} → Rhomboeder {012}, {11̄0} → hexagonales Prisma {110}. Die Formel steht nicht im Skript.
  - Warum hexagonale Achsen: Morphologisch ginge jeder trigonale Kristall auch rhomboedrisch (Kleber S. 68); beim Gitter nur bei hR (Calcit, R3̄c), nicht bei hP (Quarz); hexagonale Achsen passen zu allen trigonalen Kristallen, Achse höchster Zähligkeit entlang c (Hoffmann S. 86–90). Deshalb trigonales Kristallsystem, aber kein rhomboedrisches (IUCr nach Schwarzenbach S. 62). Rhomboedrisch zentrierte Zelle nur als Hinweis auf die Bravais-Gitter (B-O 7.1, Abb. 7.12, S. 98).
  - App-Kasten: Streckung entlang ⟨111⟩, Infobox nennt kubische (= rhomboedrische) und hexagonale Indizes; „Kristallachsen“ zeigt die rhomboedrischen Achsen.
- **Bewusst weggelassen:** R-Zentrierung im Detail, obvers/revers, Umrechnungsmatrizen, eigene Option „rhomboedrische Achsen“ in der App (bleibt unter „Mögliche Erweiterungen“ der Spezifikation).
- **Quiz:** `hex-3-04` (Indizes des gestreckten Würfels in beiden Achsensystemen).

## 11. Prüfung der Quiz-Links (28.10.)

- **Regel (Thomas):** Link und Frage müssen immer zusammenpassen. Die Ansicht „In der App öffnen“ zeigt dieselbe Punktgruppe und Aufstellung, dieselbe Form, dasselbe System, denselben Beispielkristall und die Optionen, die die Frage braucht (Zone, Achsen, Gerüst, hkil), und widerspricht der richtigen Antwort nicht.
- **Vorgehen:** Skript dekodiert jeden Link mit dem App-Code (`applyHashTo`, `currentEntryId`, `currentExample`) in eine lesbare Beschreibung; ein unabhängiger Agent hat alle 150 Bankfragen und die 6 Generatoren (für alle Parameter) danach beurteilt; Korrekturen mit Screenshots bzw. nachgerechnet geprüft.
- **Ergebnis:** 18 Links geändert, Fragetexte unverändert; Generatoren ohne Befund. Fehler: `lag-3-06` (⟨110⟩: `rho=90&az=45`), `zon-1-05` ({112} mit Zone [11̄0] statt Galenit), `zon-2-04` (Zone [1̄01] gesetzt), `verz-3-07` (6 Richtungen in m3̄m statt 4mm mit 8 Polen), `verz-3-09` (verzerrter Würfel `br=1&ba=1.2&ca=0.8`), `hab-2-01` (Galenit nur Würfel und Oktaeder in gleichem Abstand, `ab=1,0.69,2`). Verbesserungen: `zon-2-03` (Zone [101] tetragonal), `form-1-04` (Pinakoid als Hauptform), `form-3-01` (Pole auf dem Grundkreis in 4), `form-2-06` (Quader mit drei Pinakoiden), `lag-3-07` ({210}), `achsen=1` bei `hex-1-04/05/06`, `hex-2-02/03/04`, `blick-3-02`.
- Davon waren `zon-1-05`, `zon-2-03`, `zon-2-04`, `form-1-04`, `hex-1-04/05/06` schon geprüft; nur der Link hat sich geändert.

## 12. Ohne Vorlesungsverweise (28.10.)

- **Skript:** Untertitel „Skript zur Einführung in die Kristallographie“; Kasten „So ist das Skript aufgebaut“ beginnt mit der Herkunft („Skript und App sind aus der Vorlesung Kristallographie an der ETH Zürich entstanden. Sie richten sich an alle, die eine Einführung in die Kristallographie hören oder einen vergleichbaren Hintergrund haben.“); unmarkierter Text = Grundstoff; Kasten „Voraussetzungen“ in Kap. 10 (mit Kapitelverweisen) und 11; „folgt in der Vorlesung“ → Strukturkristallographie (Raumgruppen: enantiomorphe Schraubenachsen 3₁/3₂, B-O 10.1, S. 203; rhomboedrisches Gitter, B-O 7.1, Abb. 7.12, S. 98; beide auch in den Kapitelquellen); „wie die Vorlesung“ → „dieses Skript“.
- **App:** Fusszeile „Entstanden aus der Vorlesung Kristallographie an der ETH Zürich“; „Erste Schritte“: „Begriffe nach Borchardt-Ott & Sowa (2018), Abschn. 5.4“; Tooltips „Skript zur App“, „Kristalle aus Lehrbüchern“ (alle Beispielkristalle haben eine Lehrbuchquelle).
- **Quiz:** Untertitel „Quiz zur Einführung in die Kristallographie“; Stufen 1 und 2 sprechen vom Grundstoff; Foliennummern aus 88 Quellenangaben entfernt (jede hatte schon eine Lehrbuch- oder Skriptquelle); ein Hinweis und eine Erklärung ohne Vorlesungs- bzw. Folienbezug.
- **README und GitHub:** „Interaktive Lern-App für eine Einführung in die Kristallographie, entstanden aus der Vorlesung Kristallographie an der ETH Zürich“; Kapitelliste auf elf Kapitel nachgeführt; Kurzbeschreibung des Repositorys von Thomas geändert („Entstanden aus der Vorlesung Kristallographie an der ETH Zürich.“).
- **Test** `tests/vorlesung.test.mjs`: keine „Vorlesung“, „Übungen“ oder Foliennummer in App, Skript, Quiz, `js/*.js` und README, ausser im Herkunftssatz; der Herkunftssatz steht in `index.html`, `skript.html` und README. CHANGELOG bleibt als Historie unverändert.

## 13. Durchsicht der Quiz-Entwürfe (28.–29.10., abgeschlossen)

- **Werkzeug:** Prüfliste als Artifact „Quiz-Prüfliste“ (alle Entwürfe und Beispiele der ungeprüften Generatoren, Lernziel, Urteil und Anmerkung je Eintrag, gespeichert im Artifact-Speicher, Sammlung `befunde`). Claude liest die Urteile aus, setzt „In Ordnung“ auf `geprüft` und arbeitet Anmerkungen ein; überarbeitete Einträge stehen danach wieder auf „offen“ mit einer Notiz, was geändert wurde. Seit 29.10. heisst das Artifact „Quiz-Fragenliste“ (gleiche Adresse): Es zeigt alle Fragen und Generatoren mit Status (geprüft/Entwurf), Suche nach Kennung oder Text, und je Eintrag ein Feld für Rückmeldungen (eigene oder von Dritten, mit „Von“). Gespeichert in der Sammlung `rueckmeldungen` ({notiz, von, stand: neu|erledigt, antwort, zeit}); Claude setzt nach dem Einarbeiten `stand: erledigt` und schreibt in `antwort`, was geändert wurde. Die Urteile der Durchsicht bleiben als Archiv in `befunde`. Neu erstellen mit `extract.py` (alle Fragen) und `vorlage.html` im Scratchpad-Ordner `pruefliste`.
- **Ergebnis:** Alle 153 Bankfragen und alle 6 Generatoren haben den Status „geprüft“. Der Schalter „Auch ungeprüfte Fragen zeigen“ bleibt für künftige Entwürfe; sein Test arbeitet mit einer künstlichen Entwurfsfrage.
- **Erster Teil (28.10.):** 30 Fragen geprüft. Überarbeitet: `ind-1-02` (Ablenker (101) statt (11∞)), `sym-2-05` (jetzt Kap. 6, {112} wie im Link, Erklärung über die Spiegelung, die zwei gleiche Indizes vertauscht), `sym-3-03` (Tetraeder in seiner Eigensymmetrie 4̄3m, Gegenfall zu `sym-3-01`), `gen-geruest3d` (Ablenker mit ähnlich vielen Elementen; Hinweise vergleichen Spiegelebenen nach Lage ⊥ c / ∥ c / schräg, betrifft auch `gen-geruest`). `sym-3-04` (Pentagondodekaeder in 23) entfernt: zu schwierig.
- **Neu auf Wunsch von Thomas:** `hex-2-01`/`hex-2-04` nennen jeweils den anderen Fall; Lernziel in der Quiz-Rückmeldung (und im Moodle-Feedback); Kap. 6 „Flächenzahl bestimmen“ (Bilder zählen; in m3̄m Reihenfolgen 3!/k! mal 2 je Index ≠ 0) mit Frage `form-2-08`; Stufe-3-Fragen `sym-3-02` (trigonale Pyramide, 3m) und `sym-3-03`.
- **Zweiter Teil (28.–29.10.):**
  - Stufen: `form-1-11` → `form-2-09`, `form-2-07` → `form-3-04`; `verz-3-01` → `hex-2-06` (Kap. 9), `verz-3-03` → `form-2-10`, `verz-3-09` → `form-2-11` (Kap. 6), jeweils mit passendem Skriptanker und Lernziel.
  - Wortlaut: `form-2-04` „eine allgemeine Form“ (Skript Kap. 6 ergänzt); `sym-3-03` fragt nach dem Polmuster des Tetraeders; `lag-3-03` beginnt mit „Die Form {111}“; `lag-3-07` argumentiert mit (210) statt {0kl}; `form-3-03` erklärt die Punkte in 2mm.. (Skript Kap. 6 und 10: orientiertes Symbol, gleichwertige Spiegelebenen nur einmal).
  - `gen-flaechensym`: Erklärung, wie man die Flächensymmetrie am Stereogramm abliest (Achsensymbol und Spiegellinien durch den Pol, je Blickrichtung; Drehinversionsachsen; Pole auf dem Grundkreis).
  - `hab-2-03`: warum hoch indizierte Flächen meist schnell wachsen und verschwinden (Besetzungsdichte; Regel mit Kaliumalaun nach Kleber); Ausnahmen über „die konkreten Bedingungen, unter denen ein Kristall wächst“ (Skript Kap. 8 gleich formuliert).
  - Räumliche Zeichnungen: Rhombendodekaeder mit [001] bzw. [111] senkrecht steiler von oben (`&blick=45,30`), damit die Zähligkeit um die Projektionsrichtung sichtbar ist; Würfel [111] und [110] nie zusammen in `gen-lage` (`aehnlich`).
  - Unabhängige Prüfung der überarbeiteten Fragen; Befunde eingearbeitet.
- **Aus der Durchsicht entstanden:** interaktive Abb. 8.5 „Wachstum“ (Abschnitt 4, Kap. 8; Idee Thomas zu `hab-2-01`).
- **Für später (Thomas):** Bei Fragen wie `hex-2-02` ist der App-Link nicht falsch, aber nicht jedem sofort einsichtig, was die Ansicht zur Frage sagt. Über diese Art App-Hinweise später nachdenken.
