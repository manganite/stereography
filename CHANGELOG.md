# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [1.10.0] - 2026-10-29

Das Skript gibt es jetzt auch als PDF: auf der Seite (Link „PDF“ im Kopf des Skripts) und als Anhang jedes Releases.

### Hinzugefügt

- **Skript als PDF:** `tools/skript-pdf.mjs` erzeugt eine PDF-Fassung (A4) mit Inhaltsverzeichnis, Lesezeichen, Kopf- und Fusszeile; 3D-Ansichten als Bilder, interaktive Abbildungen in einem festen Zustand mit Hinweis auf die Online-Version, Links in App und Quiz zeigen auf die veröffentlichte Seite. Bei jedem Release legt `deploy.yml` sie als `skript.pdf` auf die Seite (Link „PDF“ im Kopf des Skripts) und `release.yml` an das Release.

### Behoben

- **Offline-Speicher:** Aufrufe von Dateien wie `skript.pdf` lieferten die Startseite der App statt der Datei.

## [1.9.1] - 2026-10-29

Quiz und Skript besser aufeinander abgestimmt: Abbildungsverweise im Quiz korrigiert, Projektionsformel und Symbollegende im Skript, Stufe 3 als Stoffstufe erklärt.

### Hinzugefügt

- **Skript, Kapitel 2:** die Formel *r* = *R* · tan(ρ/2) für den Abstand eines Bildpunkts vom Mittelpunkt, begründet am Strahl zum Südpol in Abb. 2.1, mit Beispiel (ρ = 45° → *r* ≈ 0,41 *R*). Bisher stand sie nur in der Erklärung einer Quizfrage.
- **Skript, Kapitel 4:** Übersicht aller Symbole im Stereogramm (Drehachsen, Drehachsen mit Inversionszentrum, Drehinversionsachsen 3̄, 4̄, 6̄, Inversionszentrum, Spiegelebene, Pole oben, unten und übereinander), gezeichnet mit demselben Code wie die App.
- **Test:** Verweise der Quizfragen auf Abbildungen des Skripts müssen existieren und im Kapitel der Frage liegen, ausser die Angabe nennt ausdrücklich ein anderes Kapitel.

### Geändert

- **Quiz, Startseite und README:** Ein Satz erklärt, dass Stufe 3 mehr Stoff bedeutet (die Vertiefungen des Skripts), nicht unbedingt schwierigere Fragen.

### Behoben

- **Quiz, Abbildungsverweise:** 17 Verweise in 16 Fragen zeigten noch auf die Abbildungsnummern vor der Neuordnung der Kapitel (z. B. `zon-2-05` „Abb. 4.4“ statt 7.4, `sym-1-03` „Abb. 3.1e“ statt 4.1e, `form-1-08` „Abb. 2.5–2.7“ statt 6.5–6.7). Hinweis aus einer externen Durchsicht mit ChatGPT.

## [1.9.0] - 2026-10-29

Skript neu geordnet und erweitert (elf Kapitel, darunter neu Symmetrieoperationen und Punktgruppen, Symmetriesätze, Pyrit, Quarz, rhomboedrische Achsen und die interaktive Abb. 8.5 zum Wachstum), ohne Verweise auf die Vorlesung verständlich; Infobox der App verlinkt jeden Begriff ins Skript; alle Quizfragen durchgesehen und geprüft, mit Lernziel in der Rückmeldung.

### Hinzugefügt

- **Skript, Kapitel 3 „Symmetrieoperationen und Punktgruppen“:** Symmetrieoperation und Symmetrieelement, die Punktsymmetrieoperationen, Kopplung und Kombination am Beispiel 4̄ und 4/*m*, die fünf Drehinversionsachsen mit Stereogrammen und ihren Regeln, Punktgruppen mit den Kästen „Grundlagen · Gruppe“ und „Grundlagen · Untergruppe“ (Bahnen in 3*m*, *mmm*, *mm*2, 222), die 7 Kristallsysteme und 32 Kristallklassen in einer Tabelle; als Vertiefungen „Operationen erster und zweiter Art“ (Farben der Pole) sowie Drehspiegelachsen und Schoenflies-Symbole.
- **Skript, Kapitel 1:** Kasten „Grundlagen · Miller'sche Indizes“ mit eigener Zeichnung der Achsenabschnitte von (362) und dem Gesetz der rationalen Indizes und neuer Abschnitt „Indizes und Gitter: Was sich ändert und was nicht“: Die Fläche (111) behält ihre Indizes bei jedem Achsenverhältnis, ihre Neigung ändert sich (tetragonale Dipyramide bei *c*/*a* = 0,64, 1 und 2); Einheitsfläche und Achsenverhältnis am Kristall aus zwei Dipyramiden.
- **Skript, Kapitel 4, Abschnitt „Die Symmetriesätze“:** Symmetriesatz I und II, jeweils Schritt für Schritt am Stereogramm hergeleitet (2/*m* und *mm*2, Pole nach Händigkeit gefärbt), mit den Umkehrungen und den Folgen für die Symbole. Kapitel 5 und 11 verweisen darauf.
- **Skript, Kapitel 5, zwei Vertiefungen:** „Zwei Aufstellungen derselben Punktgruppe“ (321 und 312, 3*m*1 und 31*m*, 3̄*m*1 und 3̄1*m*, 4̄2*m* und 4̄*m*2, 6̄*m*2 und 6̄2*m*, monoklin *b* oder *c*; {100} in 321 und 312 als hexagonales bzw. trigonales Prisma) und „Was die Punktgruppe über den Kristall verrät“ (zentrosymmetrisch, Laue-Klasse, enantiomorph, polar, piezoelektrisch, mit Tabelle der 11 Laue-Klassen). Kapitel 11 verweist darauf.
- **Skript, Kapitel 6:** Multiplizität (Würfel 6, Oktaeder 8, Rhombendodekaeder 12, Hexakisoktaeder 48; Würfel gegenüber Quader) und neuer Abschnitt „Gleicher Würfel, andere Symmetrie: Pyrit und Galenit“ (*m*3̄ als Untergruppe von *m*3̄*m*, Pentagondodekaeder {210} mit 12 statt 24 Flächen); als Vertiefung die Flächensymmetrie der Würfelfläche des Pyrits und ihre Streifung.
- **Skript, Kapitel 9, Abschnitt „Ein Beispiel: Quarz“:** hexagonales Prisma mit positivem und negativem Rhomboeder in 32, warum das Stereogramm hexagonal aussieht; als Vertiefung Links- und Rechtsquarz.
- **Skript, Kapitel 11:** ein Absatz zu „Alle Parameter frei“; **Kapitel 2:** Hinweis auf das Werkzeug „Winkel“.
- **Skript, Kapitel 9, Vertiefung „Rhomboedrische Achsen“:** die Kanten des gestreckten Würfels als Achsen (*a* = *b* = *c*, α = β = γ ≠ 90°), Abbildung mit den Achsen in 3D und im Stereogramm, Tabelle der Indizes von Würfel, Oktaeder und Rhombendodekaeder in rhomboedrischen und hexagonalen Achsen, und warum man trigonale Kristalle trotzdem hexagonal beschreibt (Calcit und Quarz). Dazu eine Quizfrage als Entwurf.
- **Enantiomorph = chiral:** Skript (Kap. 5) und Tooltip der Infobox nennen beide Begriffe (nach International Tables Vol. A, 10.2.1.1); das Skript ergänzt, dass optische Aktivität auch in *m*, *mm*2, 4̄ und 4̄2*m* möglich ist.
- **Infobox: Begriffe verlinken ins Skript.** Jede Bezeichnung in der Infobox (Volles Symbol, Ordnung, Laue-Klasse, …, Tracht, Habitus, Gitter, Projektionsrichtung), dazu „Aufstellung“, „Schoenflies“ und „Symmetrie erniedrigt“, führt zum Abschnitt im Skript, der sie erklärt; ein Test prüft, dass jeder Begriff einen Verweis hat und jeder Anker im genannten Kapitel liegt. Die bisherigen Links „Skript →“ sind in diese Verweise aufgegangen.
- **Quiz: 31 neue Fragen als Entwurf** zu den neuen Themen: Miller'sche Indizes und Indizes und Gitter (Kap. 1), Symmetrieoperationen, Drehinversionsachsen, Gruppe, Untergruppe, Kristallsysteme, Operationen erster und zweiter Art, Drehspiegelachsen (Kap. 3), Symmetriesätze (Kap. 4), Aufstellungen und Eigenschaften der Punktgruppen (Kap. 5), Multiplizität und Pyrit (Kap. 6), Quarz (Kap. 9), alle Gitterparameter frei (Kap. 11). Kapitel 3 und 9 haben dazu Links „Lernziele prüfen“. Die Fragen zu Kapitel 3 und 9 sind durchgesehen und erscheinen im Quiz; die übrigen erscheinen erst nach der Durchsicht ohne den Schalter „Auch ungeprüfte Fragen zeigen“.
- **Skript, neuer Kastentyp „Grundlagen“** für Grundwissen, auf dem der Text aufbaut; er gehört zum Haupttext und steht in der Legende „So ist das Skript aufgebaut“.

- **Skript, Kapitel 6, Flächenzahl bestimmen:** am Stereogramm durch Abzählen der Bilder eines Pols und in *m*3̄*m* über die Indizes (Zahl der Reihenfolgen mal 2 je Index ungleich 0), mit Tabelle von {100} bis {321} und dem Hinweis, dass die Regel nur in *m*3̄*m* gilt; neues Lernziel und neue Quizfrage `form-2-08` (Entwurf).
- **Quiz, zwei Fragen zur Eigensymmetrie (Stufe 3):** Polmuster der trigonalen Pyramide in 3 (3*m*, mehr Symmetrie als die Punktgruppe) und des Tetraeders in 4̄3*m* (Muster und Punktgruppe stimmen überein), nach dem Muster von `sym-3-01`; die Symmetrie des Musters prüft ein Test nach (`musterGruppe`).
- **Quiz, Durchsicht der Entwürfe (erster Teil):** 30 Fragen von Thomas geprüft. Überarbeitet nach seinen Anmerkungen: `ind-1-02` (Ablenker (101) statt (11∞)), `sym-2-05` (jetzt {112} wie im Link, Erklärung über die Spiegelung, die zwei gleiche Indizes vertauscht, und die Zählung aus Kap. 6), `sym-3-03` (Tetraeder in seiner Eigensymmetrie 4̄3*m*), Generator `gen-geruest3d` (Ablenker mit ähnlich vielen Symmetrieelementen wie das gezeigte Gerüst, mindestens einer mit demselben Symbol in der Mitte und einer mit derselben Lage der Spiegelebene ⊥ c).
- **Quiz, Durchsicht der Entwürfe (zweiter Teil):** weitere Fragen und die Generatoren `gen-koerper` und `gen-geruest3d` geprüft; `form-1-11` → Stufe 2 (`form-2-09`), `form-2-07` → Stufe 3 (`form-3-04`); `form-2-04` spricht von „einer allgemeinen Form“; `sym-3-03` fragt nach dem Polmuster des Tetraeders ohne Punktgruppe. Skript Kap. 6: Es gibt in einer Punktgruppe viele allgemeine Formen; „die allgemeine Form“ meint den Typ.
- **Quiz, räumliche Zeichnungen:** Das Rhombendodekaeder mit [001] bzw. [111] senkrecht wird steiler von oben gezeichnet (45°, 30° gedreht), damit die 4 bzw. 3 Flächen um die Projektionsrichtung zu sehen sind; Bildangaben können dafür `&blick=Höhe,Drehung` tragen. Der Würfel mit [111] und mit [110] senkrecht sieht in der Zeichnung ähnlich aus; die beiden stehen deshalb nie zusammen in einer Frage (`gen-lage`), statt der zweiten Lage kommt das Rhombendodekaeder in derselben Lage.
- **Skript, Kap. 6 (Pyrit):** erklärt das orientierte Symbol 2*mm*.. (Stellen je Blickrichtung, Punkte für „kein Element“), ebenso 4*m*.*m*; die Quizfrage `form-3-03` nennt die Bedeutung der Punkte.
- **Skript, Kapitel 8, interaktive Abbildung 8.5 „Wachstum“:** Galenit aus Würfel und Oktaeder, anfangs gleich weit vom Mittelpunkt; ein Regler lässt eine der beiden Formen doppelt so schnell wachsen, bis sie verschwindet. Kristall (räumliche Zeichnung) und Stereogramm daneben; die Pole der verschwundenen Form fehlen dann auch im Stereogramm (Anregung Thomas zu `hab-2-01`). Eigener Abschnitt „Wenn eine Form verschwindet“ (`#form-verschwindet`) mit den Grenzen √3 und 1/√3; `hab-2-01` verweist dorthin.
- **Skript, unabhängige Durchsicht aller Kapitel:** fachlich präzisiert: Pole bei schiefwinkligen Achsen (nur einzelne weichen ab), Netzebenendichte „in der Regel“, Definition des Symmetrieelements passend zur Drehinversion, Blickrichtungen hängen auch von der Achsenwahl ab, Schoenflies *T*/*O* als Drehgruppen 23/432 mit *T*ₕ, *T*_d, *O*ₕ, *C*ᵢ, *C*ₛ, *C*₃ᵢ, Begründung, warum 6̄ kein Inversionszentrum hat, Streifung des Pyrits schliesst *m*3̄*m*, 432 und 4̄3*m* aus (passt zu *m*3̄ und 23), Domänenzahl der reinen Streckung (3, 6 bzw. 4), Wachstum beim Alaun (kubisch primitives Gitter, {100} am dichtesten). Ergänzt: alle gekürzten Symbole in Kap. 5, „Pol in allgemeiner Lage“ beim ersten Auftreten erklärt, Vorverweise auf (*hkil*). Abb. 9.3a zeigt jetzt wirklich gleich grosse Rhomboeder; Abb. 8.5 hat einen Starttext. Kleinere Korrekturen (Kapitelverweise, Bildunterschrift Abb. 4.3a, Tabellenköpfe „Aufstellung A/B“, Überschrift „Ein reales Beispiel: Bariumtitanat“, 394 K, Raumgruppe *P*3₁21, Querstriche). App: Hinweis zum Pyrit nennt die Flächensymmetrie 2*mm*.. wie das Skript.
- **Skript, Kapitel 10, orientiertes Symbol:** erklärt, in welcher Reihenfolge mehrere Zeichen innerhalb einer Position stehen (Reihenfolge der Richtungen nach International Tables, Tab. 2.2.4.1 und Abschn. 2.2.12): darum 2*mm*.. und *m*.*m*2. Die Angaben zu Borchardt-Ott (Kreuz für Pole der oberen Halbkugel, „1. und 2. Aufstellung“) sind am Buch geprüft und mit Fundstelle versehen.
- **Quiz, Durchsicht abgeschlossen:** alle Fragen und Generatoren von Thomas geprüft. Zuletzt überarbeitet: `gen-flaechensym` erklärt, wie man die Flächensymmetrie am Stereogramm abliest (Achsensymbol und Spiegellinien durch den Pol, je Blickrichtung); `hab-2-03` begründet, warum hoch indizierte Flächen meist schnell wachsen (Besetzungsdichte, Kaliumalaun nach Kleber); `lag-3-03` beginnt mit „Die Form {111}“; `lag-3-07` argumentiert mit (210) statt {0kl}; `verz-3-01` → `hex-2-06` (Kap. 9, Stufe 2), `verz-3-03` → `form-2-10`, `verz-3-09` → `form-2-11` (Kap. 6, Stufe 2). Skript Kap. 6: gestreckter Würfel entlang [001] (Pinakoid und tetragonales Prisma); Kap. 8: Wachstumsgeschwindigkeit und Besetzungsdichte als Regel mit dem Beispiel Kaliumalaun; Kap. 6 und 10: warum im orientierten Symbol gleichwertige Spiegelebenen nur einmal stehen (4*m*.*m* gegenüber 2*mm*..). Nach einer unabhängigen Prüfung präzisiert.
- **Quiz, Hinweise zu Symmetriegerüsten:** Spiegelebenen werden nach Lage verglichen (⊥ c, ∥ c, schräg) statt nur gezählt. Vorher hiess es z. B. bei 4*mm* gegenüber *mmm* „zusätzlich eine Spiegelebene“, obwohl zwei Ebenen ∥ c dazukommen und die Ebene ⊥ c fehlt (betrifft `gen-geruest` und `gen-geruest3d`).
- **Quiz, Lernziel in der Rückmeldung:** Nach jeder Antwort nennt die Rückmeldung in kleiner Schrift das Lernziel der Frage mit Kapitel (wörtlich aus dem Skript), damit sich die Frage einordnen lässt; ebenso das allgemeine Feedback im Moodle-Export.

### Geändert

- **Skript, neue Kapitelfolge:** Das Skript beginnt mit den Indizes und führt die Symmetrie ein, bevor Formen und HM-Symbole sie brauchen: 1 Kristallflächen und Indizes, 2 Die stereographische Projektion, 3 Symmetrieoperationen und Punktgruppen (neu), 4 Symmetriegerüste, 5 Blickrichtungen, 6 Kristallformen, 7 Zonen, 8 Tracht und Habitus, 9 Trigonale und hexagonale Kristalle, als Vertiefungen 10 Lagen und 11 Verzerrungen. „Aufstellung und Indizes“ und das hexagonale Achsensystem stehen jetzt in Kapitel 1; Kapitel 9 erklärt das Rhomboeder als entlang [111] gestreckten Würfel (3̄*m*, hexagonale Achsen) im Haupttext, Kapitel 11 verweist dorthin. Anker und Links aus App und Quiz bleiben gültig; Kapitel- und Abbildungsnummern, Quiz-Kapitel und Links „Lernziele prüfen“ sind angepasst.
- **Ohne Vorlesung verständlich:** Skript, App und Quiz verweisen nicht mehr auf Vorlesung, Übungen oder Folien. Im Skript heisst der unmarkierte Text jetzt Grundstoff, der Kasten am Anfang der Kapitel 10 und 11 „Voraussetzungen“; Hinweise auf spätere Vorlesungsteile verweisen auf die Strukturkristallographie bei Borchardt-Ott & Sowa (enantiomorphe Schraubenachsen, Abschn. 10.1; rhomboedrisches Gitter, Abschn. 7.1). Die Quellen der Quizfragen nennen keine Folien mehr; jede hatte schon eine Lehrbuch- oder Skriptquelle. Die Herkunft aus der Vorlesung Kristallographie an der ETH Zürich nennen Skript („So ist das Skript aufgebaut“), App (Fusszeile) und README. Ein Test prüft das.

### Behoben

- **Quiz, Quellenangaben:** Verweise auf Kapitel und Abbildungen des Skripts folgen der neuen Kapitelfolge.
- **Quiz, Frage zu vier Indizes (Kap. 9):** fragt jetzt nach (112), damit die Ansicht „In der App öffnen“ genau diese Fläche zeigt.
- **Quiz, Links „In der App öffnen“:** Alle Fragen auf Übereinstimmung von Frage und Ansicht geprüft; 18 Links zeigen jetzt das Gefragte: Zonen [11̄0] mit {112}, [1̄01] und [101] tetragonal, ⟨110⟩ in *m*3̄*m*, sechs Domänenrichtungen von BaTiO₃, verzerrter Würfel mit Restgruppe *mmm* (2 Fragen), Galenit nur aus Würfel und Oktaeder in gleichem Abstand, Pinakoid {001}, Pole auf dem Grundkreis in 4, {210} statt {221}, Achsen *a*₁, *a*₂, *a*₃ bei den hexagonalen Richtungsfragen (7 Fragen).
- **Skript, Layout:** Mehr Abstand zwischen den Quellen eines Kapitels und der Überschrift des nächsten.
- **Beispielkristalle Links- und Rechtsquarz, Quelle:** Formen, Indizes und Händigkeit sind jetzt mit Kleber u. a. (2020), Abb. 1.70, belegt statt mit Wikipedia; die Indizes waren bereits dieselben.
- **Skript, Querstriche:** Negative Indizes und Drehinversionen (1̄, 3̄, (h̄k̄l̄) …) haben ihren Querstrich jetzt genau über der Ziffer wie in der App, auch in den gezeichneten Abbildungen; vorher sass er bei manchen Schriften daneben. Ebenso in „Erste Schritte“ der App.

## [1.8.1] - 2026-10-26

Quiz-Startseite übersichtlicher: Kapitel mit Namen, Schalter für ungeprüfte Fragen unter der Auswahl, Stand passend zur gewählten Stufe.

### Geändert

- **Quiz, Startseite:** Die Kapitelknöpfe nennen das Thema (z. B. „3 Symmetriegerüste“ statt „Kap. 3“). Der Schalter „Auch ungeprüfte Fragen zeigen“ steht schlicht unter der Auswahl statt als Karte ganz oben. „Ihr Stand“ zählt jetzt wie die Auswahl darüber nur die Fragen der gewählten Stufe und der Stufen darunter; die Überschrift nennt die Stufe (bisher zählte er alle Stufen, und die Zahlen passten nicht zur Auswahl).

## [1.8.0] - 2026-10-26

Quiz zu den Lernzielen des Skripts: Multiple-Choice-Fragen in drei Stufen mit sofortiger Rückmeldung, darunter Bildfragen mit räumlichen Zeichnungen und Stereogrammen; ungeprüfte Fragen lassen sich auf der Startseite zuschalten. Dazu Moodle-Export und Links „Lernziele prüfen“ im Skript.

### Hinzugefügt

- **Quiz (`quiz.html`, erste Fragen):** Multiple-Choice-Fragen zu den Lernzielen des Skripts in drei Stufen (Grundlagen, Anwendung, Vertiefung), nach Kapitel und Anzahl wählbar. Nach jeder Antwort: richtig oder falsch, ein Hinweis, warum die gewählte Antwort falsch ist, die Erklärung mit Quelle, „Im Skript nachlesen“ und „In der App öffnen“. Fragetypen: Einfach- und Mehrfachauswahl, Frage mit Stereogramm, Stereogramme als Antworten, Bild mit Bildern als Antworten. Höchstens die Hälfte eines Quiz sind erzeugte Fragen, aus demselben Generator höchstens 30 %; reichen die handgeschriebenen Fragen nicht, wird das Quiz kürzer. Zuerst kommen Fragen, die noch nie oder zuletzt falsch beantwortet wurden; der Stand je Kapitel wird nur lokal im Browser gespeichert. Die Links ins Skript und in die App öffnen einen neuen Tab, damit das Quiz offen bleibt; ein laufendes Quiz übersteht ausserdem Neuladen und den Zurück-Knopf. Erste Fragen: Stufe 1 zu Kapitel 1 (Projektion) und Kapitel 4 (Zonen), dazu erzeugte Fragen „Symmetriegerüst → Punktgruppe“ für alle 32 Punktgruppen (Stufe 1: Gerüste aus Vorlesung und Skript, Stufe 2: die übrigen). Alle Fragen sind fachlich durchgesehen und freigegeben; neue Fragen erscheinen erst nach der Durchsicht (Vorschau mit `quiz.html?entwurf`). Link „Quiz“ im Kopf von App und Skript.
- **Quiz, Stufe 1 für die Kapitel 2, 3, 5, 6 und 7:** Fragen zu Kristallformen im Stereogramm (Zuordnung Stereogramm ↔ Körper, allgemeine und spezielle Form, andere Projektionsrichtung), Symmetriegerüsten (Darstellung der Symmetrieelemente, Bild eines Pols, 4 und 4̄), Tracht und Habitus, Blickrichtungen und Hermann-Mauguin-Symbolen sowie zum hexagonalen Achsensystem; dazu eine erste Frage der Stufe 2 (Pol von (100) in Richtung [210]). Die Tests rechnen die überprüfbaren Antworten nach (Flächenzahlen aus dem Formenkatalog, Bild eines Pols und Bahnen aus den Gruppenoperationen, Blickrichtungen, Winkel im hexagonalen Achsensystem).
- **Quiz, Stufe 2 für die Kapitel 1 und 4:** mehrschrittige Fragen mit typischen Fehlern als falschen Antworten, z. B. Winkelkoordinaten und Pol einer Fläche, Gegenfläche, Abstand eines Bildpunkts von der Mitte (nicht längentreu), Winkel zwischen zwei Polen, Zonenachse mit Probe, Grundkreis bei Projektion entlang [111], Fläche im Schnittpunkt zweier Zonen, Zonenpol und Flächenpol ausserhalb des kubischen Systems, Zonengleichung bei nichtkubischer Metrik. Die Tests rechnen auch diese Antworten mit der Projektion und den Gittern der App nach. Bei Fragen mit Stereogrammen als Antworten gilt die Option „Zonenachse ausblenden“ jetzt auch für die Antwortbilder.
- **Quiz, Stufe 2 für die Kapitel 2, 3, 5, 6 und 7:** z. B. Flächenzahl derselben Indizes in verschiedenen Punktgruppen ({110} in 4/*mmm*, {111} allgemein in 4/*m*, {211} in *m*3̄*m*), Ordnung und allgemeine Form, Bahn eines Pols unter einer Drehung des Kristalls, offene Formen am Stereogramm; Bahnen in 2/*m* (eindeutige Achse b), 4̄ und *mmm* als Bildauswahl, 2 ⊥ *m* erzeugt 1̄; Wachstum und Tracht; volles und gekürztes Symbol (*m*3̄*m*, *m*3̄), Positionen in 4*mm* am Symmetriegerüst und in *mm*2; Familie ⟨100⟩, Winkel und Flächenpole im hexagonalen Achsensystem. Neue Prüfungen in den Tests rechnen Flächenzahlen über die Lagesymmetrie, Gruppenordnungen, Bahnen und Symbole nach.
- **Quiz, Stufe 3 (Vertiefungen):** Fragen zu Kapitel 8 (Lagesymmetrie eines Pols, Flächenzahl bei gleicher Flächensymmetrie in kleinerer Gruppe, Richtungen und Geraden, Wyckoff-Lagen, erzeugende Symmetrie und Eigensymmetrie) und Kapitel 9 (Restgruppe des gestreckten Würfels, Zerfall von Würfel und Oktaeder, Polarisation und polare Gruppen, Domänen in BaTiO₃) sowie zu den Vertiefungen der Kapitel 1–4, 6 und 7 (Normalen- und Flächenwinkel, Winkel nur auf Grosskreisen, Reflexionsgoniometer, Grenzform, asymmetrische Flächeneinheit, Polmuster und Eigensymmetrie, Zonenpol, Komplikationsregel, Platzhalter 1, Schreibweise der International Tables, (hkil)). Zwei erzeugte Fragen zu Kapitel 8 aus dem Formenkatalog: Flächenzahl aus Ordnung und Flächensymmetrie, Flächensymmetrie einer Form am Symmetriegerüst. Die Tests rechnen Lagesymmetrien, Restgruppen, Zerfall und Domänenzahl mit den Gruppenoperationen der App nach.
- **Quiz, räumliche Zeichnungen:** neuer Fragetyp „Bild → Bilder“ mit festen räumlichen Zeichnungen (SVG aus den Daten der App, `js/bild3d.js`): Kristall leicht von oben, *a* zum Betrachter, *b* nach rechts, die Projektionsrichtung senkrecht mit Pfeil und Äquatorebene; Symmetriegerüst in der Umkugel mit Spiegelebenen als Scheiben und Achsensymbolen an beiden Enden. Die Zeichnungen funktionieren offline und im Moodle-Export. Drei erzeugte Fragengruppen, je in beide Richtungen: Kristall ↔ Stereogramm (Kap. 2; Stufe 1: Würfel, Oktaeder, Rhombendodekaeder, Tetraeder, tetragonales und hexagonales Prisma, tetragonale und hexagonale Dipyramide; Stufe 2: Rhomboeder, trigonales Prisma, rhombische Dipyramide, Oktaeder neben tetragonaler Dipyramide), Lage eines Kristalls ↔ Stereogramm (Kap. 2, Stufe 2: Würfel, Oktaeder und Rhombendodekaeder mit [001], [111] und [110] als Projektionsrichtung) und räumliches Symmetriegerüst ↔ Stereogramm (Kap. 3, 27 Punktgruppen; die kubischen ausser 23 sind als Zeichnung zu dicht, 23 hat ohne sie keine Ablenker). Die Tests zählen die Pole der beschriebenen Stereogramme nach und prüfen ρ.
- **Quiz, Schalter „Auch ungeprüfte Fragen zeigen“:** Auf der Startseite kann jede Nutzerin und jeder Nutzer die noch nicht durchgesehenen Fragen einschalten; sie erscheinen gekennzeichnet mit „Entwurf“. Die Wahl wird im Browser gemerkt, `quiz.html?entwurf` schaltet sie weiterhin ein. Ohne Schalter zeigt das Quiz nur geprüfte Fragen.
- **Skript → Quiz:** Am Ende jedes Kapitels führt „Lernziele prüfen im Quiz“ mit Kapitel und Stufe vorgewählt ins Quiz (`quiz.html?kap=4&stufe=1`, neuer Tab). Fehlen in der gewählten Stufe noch Fragen, wählt das Quiz die nächste Stufe bzw. alle Kapitel mit Fragen.
- **Moodle-Export der Quizfragen:** `node tools/moodle-export.mjs quiz.xml` schreibt die geprüften Fragen als Moodle-XML (Multiple Choice, Kategorien nach Kapitel und Stufe, Stereogramme als eingebettete SVG mit eingebetteter Schrift, damit die Querstriche über negativen Indizes stimmen).

### Geändert

- **Monokline Aufstellung einheitlich in App, Skript und Quiz:** Standard ist *b* als eindeutige Achse (*unique axis* der International Tables), gebräuchlich ist auch *c*. Der Begriff „eindeutige Achse“ der App gilt jetzt auch in Skript und Quiz. Das Skript (Kap. 6, Blickrichtungen) nennt beide Aufstellungen statt nur *b* und warnt vor den mehrdeutigen Bezeichnungen „1./2. Aufstellung“; die Quizfrage zur monoklinen Blickrichtung und die Erklärungen der erzeugten Fragen „Symmetriegerüst → Punktgruppe“ sagen dasselbe.
- **Hinweise der Fragen „Symmetriegerüst → Punktgruppe“:** Achsen werden nach ihrer Richtung verglichen. Liegt im Ablenker an derselben Stelle eine Achse anderen Charakters, heisst es jetzt „an derselben Stelle eine 3-zählige Drehachse statt der 3-zähligen Drehinversionsachse“ statt „zusätzlich eine 3-zählige Drehachse; dafür fehlt ihm eine 3-zählige Drehinversionsachse“; dieselbe Achse in anderer Richtung heisst „in anderer Richtung“.
- **Abbildungen aus Link-Adressen** werden jetzt in `js/scene.js` erzeugt (`stereoForHash`), gemeinsam für Skript und Quiz. Das Stereogramm kennt zwei neue Optionen: grössere Polsymbole (für kleine Bilder) und Zonen ohne Markierung der Zonenachse.

## [1.7.0] - 2026-10-25

Lagen und Multiplizität: Ausgangspol rastet in spezieller Lage ein, Wyckoff-Lage mit Multiplizität in der Infobox, neues Skriptkapitel 8; im Skript sind Vertiefungen jetzt vom Vorlesungsstoff unterschieden.

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

[Unreleased]: https://github.com/manganite/stereography/compare/v1.10.0...HEAD
[1.10.0]: https://github.com/manganite/stereography/compare/v1.9.1...v1.10.0
[1.9.1]: https://github.com/manganite/stereography/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/manganite/stereography/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/manganite/stereography/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/manganite/stereography/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/manganite/stereography/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/manganite/stereography/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/manganite/stereography/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/manganite/stereography/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/manganite/stereography/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/manganite/stereography/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/manganite/stereography/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/manganite/stereography/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manganite/stereography/releases/tag/v1.0.0
