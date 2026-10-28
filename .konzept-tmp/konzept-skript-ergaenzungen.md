# Konzept: Ergänzungen und Neuordnung des Skripts

Stand 28.10.2026 (fünfte Fassung, alle Schritte umgesetzt; wartet auf die Durchsicht durch Thomas), mit den Entscheidungen von Thomas vom 27. und 28.10.2026 (Abschnitt 8). Grundlage: Vorlesung HS 2026, Kap. 0–5 (Folien 1–109), Skript und App v1.8.1, Einstufung nach `konzept-vertiefung.md`. Umsetzung auf Branch `skript-neuordnung`, PR #41 (Entwurf).

## 1. Leitlinien

1. **App und Skript sind eigenständig.** Sie sind durch die Vorlesung motiviert und werden dort genutzt, müssen aber auch ohne sie verständlich sein. Das ersetzt den Grundsatz aus `konzept-skript.md`, dem Aufbau der Vorlesung zu folgen; Begriffe bleiben die der Vorlesung bzw. von Borchardt-Ott.
2. **Das Skript deckt die App fachlich vollständig ab.** Jeder Fachbegriff, den die App anzeigt (Infobox, Tooltips, Optionen, Beispiele), wird im Skript erklärt, notfalls als Vertiefung.
3. **Didaktik vor Aufwand.** Das Quiz wird ohnehin an die neuen Themen angepasst. Kapitelreihenfolge und Nummern dürfen sich deshalb ändern, wenn das Skript dadurch besser wird.
4. **Kastentyp „Grundlagen“** (`.box.grundlagen`, Kopfzeile „Grundlagen · Thema“, mit Anker): fasst Grundwissen kurz zusammen, auf dem der Text aufbaut (Miller-Indizes, Gruppe, Untergruppe). Kein Bezug auf die Vorlesung im Kasten. Gilt wie „Merke“ als Haupttext, nicht als Vertiefung. Kurz, höchstens eine kleine Abbildung. In der Legende „So ist das Skript aufgebaut“.
5. **Vertiefung statt Haupttext** (Entscheidung 28.10.): Neue Themen, die in erster Linie die App betreffen und nicht die Vorlesung, werden als Vertiefung gekennzeichnet; ebenso Themen, die in der Vorlesung nur eine untergeordnete Rolle spielen (z. B. Schoenflies-Symbole). Haupttext und Grundlagen bleiben dem Stoff der Vorlesung vorbehalten.
6. **Harmonisch einfügen** (Hinweis 28.10.): Ergänzungen passen sich in Sprachstil, Niveau und fachlicher Tiefe dem bestehenden Skript an: kurze Sätze, Begriffe beim ersten Auftreten hervorgehoben, wenige Formeln, Erklärung am Stereogramm, Abbildungen aus dem Code der App, Lernziele, Merke, Zusammenfassung und Quellen wie in den übrigen Kapiteln.

## 2. Befund und Einstufung

Spalte „Ebene“ nach Leitlinie 5: H = Haupttext, G = Grundlagen-Kasten (Haupttext), V = Vertiefung.

| Nr. | Thema | Ebene | Ort | Stand |
|---|---|---|---|---|
| 1 | Drehinversionsachsen 1̄–6̄, Kopplung und Kombination (Folien 65–67) | H | Kap. 3 | umgesetzt |
| 2 | Drehspiegelachsen, Schoenflies (68–69) | V (Kasten) | Kap. 3 | umgesetzt |
| 3 | 32 Kristallklassen, 7 Kristallsysteme (108) | H | Kap. 3 | umgesetzt |
| 4 | Gruppe, Verknüpfung, Erzeugende, Ordnung (92–100) | G | Kap. 3 | umgesetzt |
| 5 | Untergruppe (100, 104) | G | Kap. 3 | umgesetzt |
| 6 | Miller-Indizes (34–35, 48–52) | G | Kap. 1 | umgesetzt |
| 7 | Symmetrieoperation und -element (56–57) | H | Kap. 3 | umgesetzt |
| 8 | Multiplizität, Familien {hkl}, ⟨uvw⟩ (71–74) | H | Kap. 6 | umgesetzt |
| 9 | Indizes bei verändertem Gitter (44–46, 51) | H | Kap. 1 | umgesetzt |
| 10 | Quarz: Prisma und Rhomboeder (43) | H; Links-/Rechtsquarz V | Kap. 9 | umgesetzt |
| 11 | Würfel → Rhomboeder, 3̄m (107) | H | Kap. 9 | umgesetzt |
| 12 | Pyrit (30) | H; Flächensymmetrie und Streifung V | Kap. 6 | umgesetzt |
| 13 | App-Infobox: Laue-Klasse, zentrosymmetrisch, enantiomorph | V | Kap. 5 | umgesetzt |
| 14 | App-Infobox: polar, piezoelektrisch | V | Kap. 5, Kap. 11 verweist | umgesetzt |
| 15 | App: „Pole nach Händigkeit färben“ | V (Kasten) | Kap. 3 | umgesetzt |
| 16 | App: zwei Aufstellungen derselben Punktgruppe | V | Kap. 5 | umgesetzt |
| 17 | App: Symmetriebruch „Alle Parameter frei“ | V | Kap. 11 | umgesetzt |
| 18 | App-Beispiele Gips, Turmalin, Links-/Rechtsquarz | wie das Thema | Kap. 5, 9 | umgesetzt |
| 19 | Symmetriesätze I und II (Folien 63–64, 103) | H | Kap. 4 | umgesetzt (Abschnitt 9) |
| 20 | App: Werkzeug „Winkel“ | App-Kasten | Kap. 2 | umgesetzt |

## 3. Kapitelfolge (entschieden und umgesetzt 28.10.)

| neu | Kapitel | Inhalt | aus |
|---|---|---|---|
| 1 | Kristallflächen und Indizes | Aufstellung und Indizes mit Grundlagen Miller-Indizes, Indizes und Gitter, hexagonales Achsensystem | alt 2, alt 7 |
| 2 | Die stereographische Projektion | wie alt 1; App-Kasten „Winkel“ | alt 1 |
| 3 | Symmetrieoperationen und Punktgruppen | neu | — |
| 4 | Symmetriegerüste im Stereogramm | wie alt 3, dazu die Symmetriesätze | alt 3 |
| 5 | Blickrichtungen | wie alt 6; Vertiefungen Aufstellungen, Eigenschaften der Punktgruppen | alt 6 |
| 6 | Kristallformen im Stereogramm | wie alt 2; Multiplizität, Pyrit und Galenit | alt 2 |
| 7 | Zonen | wie alt 4 | alt 4 |
| 8 | Tracht und Habitus | wie alt 5 | alt 5 |
| 9 | Trigonale und hexagonale Kristalle | Rhomboeder, Quarz; Vertiefung (hkil) | alt 7 |
| 10 | Vertiefung: Lagen, Flächensymmetrie und Multiplizität | wie alt 8 | alt 8 |
| 11 | Vertiefung: Symmetrieändernde Verzerrungen | wie alt 9, ⟨111⟩ auf Kap. 9 abgestimmt; „Alle Parameter frei“ | alt 9 |

- Die Projektion bleibt vor der Symmetrie (anders als die Vorlesung), weil Kap. 3 die Operationen am Stereogramm zeigt (Bahnen).
- Anker bleiben gültig; neue Anker `#indizes`, `#miller`, `#indizes-gitter`, `#punktgruppen`, `#operationen`, `#drehinversion`, `#punktgruppe`, `#gruppe`, `#untergruppe`, `#kristallsysteme`, `#schoenflies`, `#symmetriesaetze`, `#aufstellung-pg`, `#eigenschaften`, `#pyrit`, `#rhomboeder`, `#quarz`.

## 4. Inhalte (umgesetzt)

### Kap. 1 Kristallflächen und Indizes
- **Grundlagen · Miller'sche Indizes** (`#miller`): Achsenabschnitte → Kehrwerte → kleinste ganze Zahlen; Beispiel (362) mit eigener Zeichnung (Abb. 1.1, nach B-O Abb. 3.9); Gesetz der rationalen Indizes (Haüy) nach Schwarzenbach 1.3.2. Index 0, negativer Index, [uvw], {hkl}, ⟨uvw⟩.
- **Indizes und Gitter** (`#indizes-gitter`, H): tetragonale Dipyramide {111} bei c/a = 0,64, 1 und 2 (Neigung 42,2°, 54,7°, 70,5°), Tabelle, Einheitsfläche und Achsenverhältnis am Beispiel „Zwei tetragonale Dipyramiden“ (Abb. 1.3).

### Kap. 3 Symmetrieoperationen und Punktgruppen
- Symmetrieoperation und -element, Kopplung und Kombination (4̄ gegenüber 4/m, die fünf n̄), Punktgruppen mit Grundlagen · Gruppe und Grundlagen · Untergruppe, Kristallsysteme und Kristallklassen.
- Vertiefungen: **Operationen erster und zweiter Art** (Begriffe nach Schwarzenbach 2.2.3, anschaulich mit der rechten Hand erklärt; Farben der Pole, Links- und Rechtsform), **Drehspiegelachsen und Schoenflies-Symbole** (`#schoenflies`).

### Kap. 5 Blickrichtungen, zwei Vertiefungsabschnitte
- **Zwei Aufstellungen derselben Punktgruppe** (`#aufstellung-pg`): 321/312 mit Stereogrammen und Kristallachsen (Abb. 5.7); {100} in 312 trigonales, in 321 hexagonales Prisma (mit `siteOf` nachgerechnet); Tabelle der fünf Paare; Drehung um 30° bzw. 45°; monoklin b/c, Gips. Quelle Schwarzenbach 2.5.9.
- **Was die Punktgruppe über den Kristall verrät** (`#eigenschaften`): Abb. 5.8 4/mmm, 422, 4mm nach Händigkeit; zentrosymmetrisch, Laue-Klasse (Schwarzenbach 2.5.7, Friedel), enantiomorph mit optischer Aktivität (B-O 9.5, 9.6.1), polar mit Pyroelektrizität und Turmalin (B-O 9.6.3), piezoelektrisch mit Quarzplatte (B-O 9.6.2); Unterschied „polare Achse“ (B-O S. 164) und polare Punktgruppe am Quarz; Tabelle der 11 Laue-Klassen mit den übrigen 21 Punktgruppen (e/p markiert).

### Kap. 6 Kristallformen
- **Multiplizität** (H, in `#allgemein`): Würfel 6, Oktaeder 8, Rhombendodekaeder 12, Hexakisoktaeder 48; ⟨111⟩ 8 Richtungen; Würfel gegenüber Quader (drei Pinakoide).
- **Gleicher Würfel, andere Symmetrie: Pyrit und Galenit** (`#pyrit`, nach „Andere Projektionsrichtung“, weil dort der Galenit eingeführt wird): siehe Abschnitt 5.

### Kap. 9 Trigonale und hexagonale Kristalle
- **Ein Beispiel: Quarz** (`#quarz`, H): Prisma {100}, positives Rhomboeder {101}, negatives {011}; je 6 Flächen, um 60° versetzt; oben sechs Pole bei ρ ≈ 51,8° (c/a = 1,10), unter jedem der Pol der unteren Fläche des anderen Rhomboeders (● im ○, mit den Operationen von 321 nachgerechnet); verschieden grosse Rhomboeder zeigen die trigonale Symmetrie (Abb. 9.5, Abstände über `ab=`). Vertiefung **Links- und Rechtsquarz** (Abb. 9.6). Indizes in (hkil) im Abschnitt `#hkil`.

### Kap. 11
- Absatz zu allen Gitterparametern: a lang → 4/mmm, a ≠ b ≠ c → mmm, + β → 2/m, alle verschieden → 1̄ (mit `buildCrystal` nachgerechnet); Zitat Schwarzenbach S. 61 „Die Symmetrie bestimmt die metrischen Zusammenhänge, nicht aber die Metrik die Symmetrie“. App-Kasten „Alle Parameter frei“.

## 5. Pyrit (Kap. 6, entschieden 28.10., umgesetzt)

- **Einstieg (H):** Pyrit m3̄ (2/m 3̄) und Galenit m3̄m; m3̄ als Untergruppe mit 24 Operationen; dritte Blickrichtung ⟨110⟩ leer (Abb. 6.8 Pyrit 3D und Stereogramm über m3̄).
- **Pentagondodekaeder {210} (H):** in m3̄ 12 Flächen, in m3̄m 24 (Tetrakishexaeder); (210) und (120) nur über die Spiegelung ⊥ [11̄0] verbunden (Abb. 6.9). Fünfecke nicht regelmässig: vier Kanten gleich, die fünfte nicht. Achtung: Hoffmann S. 271 schreibt „eine Seite kürzer, vier länger“; für {210} ist die einzelne Kante aber länger (0,5 gegenüber 0,382, nachgerechnet). Das Skript sagt deshalb nur „die fünfte nicht“.
- **Merke:** Multiplizität hängt von der Punktgruppe ab; der Würfel verrät sie nicht.
- **Vertiefung · Die Würfelfläche des Pyrits:** Flächensymmetrie 2mm.. statt 4m.m (Abb. 6.10, Würfel mit Muster), Streifung in nur einer Richtung je Fläche (B-O Tab. 9.4 Nr. 29, S. 141, und S. 168).

## 6. Quellen

- Folien nur als Massstab für Begriffe und Umfang, nicht als zitierte Quelle.
- Bestimmt (aus den PDFs in Zotero, Seitenzahlen gedruckt): Miller-Indizes B-O 3.4.2–3.4.3 (S. 14–17), Hoffmann 2.2 (S. 42–52); Gesetz der rationalen Indizes Schwarzenbach 1.3.2 (S. 11–12); Einheitsfläche B-O 5.7 (S. 54–55), Hoffmann S. 50–51; Symmetrieoperation und -element B-O S. 67–69, Hoffmann 3.1; Kopplung, Drehinversion, Drehspiegelung B-O 6.4 (S. 75–78), Hoffmann 3.2.4; Kristallsysteme B-O Kap. 8, Hoffmann 3.3.3, Schwarzenbach 2.5.8; Gruppe B-O 11.2, Hoffmann 6.4, Schwarzenbach 2.2.2; Operationen erster/zweiter Art Schwarzenbach 2.2.3; Symmetriesätze B-O 7.2 (S. 102), Hoffmann S. 101 und 114; Laue-Klassen Schwarzenbach 2.5.7; Aufstellungen Schwarzenbach 2.5.9; Enantiomorphie, optische Aktivität, Piezo- und Pyroelektrizität B-O 9.5–9.6 (S. 169–171), polare Drehachsen B-O S. 164; Pyrit B-O S. 141 und 168, Hoffmann S. 36–37 und 271; regelmässiges Pentagondodekaeder nicht kristallographisch B-O 9.7 (S. 175–176); Links-/Rechtsquarz B-O Tab. 9.4 Nr. 18 (S. 138).
- Quarz: Die Bücher nennen die Formen des Quarzes nicht mit Indizes. Grösse von positivem und negativem Rhomboeder und links/rechts nach Lexikon der Geowissenschaften (Spektrum), „Links-Quarz“; Indizes und Gitter wie im Beispielkristall der App (dort nach Wikipedia „Quarz“). Wenn Thomas eine Lehrbuchstelle mit den Indizes hat, sollte sie ergänzt werden.
- Alle Zahlen sind mit dem Code der App nachgerechnet.

## 7. Umsetzung (Branch `skript-neuordnung`, PR #41)

1. Kapitelfolge — erledigt.
2. Kap. 1 und 3, Symmetriesätze — erledigt.
3. Querstriche wie in der App, Gesetz der rationalen Indizes, Operationen erster und zweiter Art — erledigt.
4. Kap. 5 (Aufstellungen, Eigenschaften) — erledigt.
5. Kap. 6 (Multiplizität, Pyrit) — erledigt.
6. Kap. 9 und 11 (Quarz, alle Parameter frei) — erledigt.
7. **Infobox verlinkt ins Skript:** Jede Bezeichnung der Infobox, dazu „Aufstellung“, „Schoenflies“ und „Symmetrie erniedrigt“, ist ein Link auf den erklärenden Abschnitt (`js/skriptlinks.js`, gepunktet unterstrichen). Die bisherigen Links „Skript →“ sind darin aufgegangen. Test: jeder Begriff hat einen Verweis, jeder Anker liegt im genannten Kapitel.
8. **Quiz:** 31 neue Fragen als Entwurf (Kap. 1, 3, 4, 5, 6, 9, 11); Links „Lernziele prüfen“ für Kap. 3 und 9; Quellenangaben der bestehenden Fragen auf die neue Kapitelfolge umgestellt. Die Entwürfe erscheinen erst nach Durchsicht ohne den Schalter „Auch ungeprüfte Fragen zeigen“.
9. Offen: Durchsicht durch Thomas, danach Release.

## 8. Entscheidungen (Thomas)

27.10.2026:
1. Kastenname „Grundlagen“. App und Skript sollen auch ohne die Vorlesung funktionieren.
2. Rhomboeder (Folie 107) in den Haupttext des Kapitels zu den hexagonalen Achsen, abgestimmt mit dem Kapitel zu den Verzerrungen.
3. Laue-Klasse, enantiomorph, zentrosymmetrisch im Skript erklären; das Skript soll die gesamte App fachlich abdecken.
4. Gute didaktische Aufbereitung geht vor dem Aufwand für das Quiz.

28.10.2026:
5. Neue Kapitelfolge umsetzen (Abschnitt 3).
6. Pyrit wie in Abschnitt 5.
7. Neue Themen, die vor allem die App betreffen, und Themen mit untergeordneter Rolle in der Vorlesung (z. B. Schoenflies) als Vertiefung kennzeichnen (Leitlinie 5).
8. Die beiden Symmetriesätze an geeigneter Stelle mit guter Visualisierung ergänzen (Abschnitt 9).
9. Ergänzungen fügen sich in Sprachstil, Niveau und fachlicher Tiefe harmonisch ins bestehende Skript ein (Leitlinie 6).
10. Schwarzenbach „Kristallographie“ ist Quelle für das Gesetz der rationalen Indizes und für Operationen erster und zweiter Art; die Begriffe werden in der Vertiefung verwendet und anschaulich erklärt. Querstriche korrigieren.

## 9. Symmetriesätze (umgesetzt 28.10.)

- **Ort:** Kap. 4, Abschnitt `#symmetriesaetze`, direkt nach „Wohin ein Symmetrieelement einen Pol bringt“; die Sätze lassen sich mit den Regeln aus Abb. 4.1 am Stereogramm herleiten. Kap. 3, Kap. 5 (volles und gekürztes Symbol) und Kap. 11 verweisen darauf.
- **Inhalt:** Satz I und II als Merke (nach B-O S. 102). Herleitung am Stereogramm, Pole nach Händigkeit gefärbt: Satz I an 2/m (Abb. 4.2), Satz II an mm2 (Abb. 4.3). Umkehrungen, Einschränkung (m + 1̄ erzeugt nur 2), Folgen.
- **Quellen:** B-O 7.2 (S. 102, Abb. 7.14, 7.15), 9.1 (S. 128–129); Hoffmann 3.2.2 (S. 101), 3.3.2 (S. 114).
