# Konzept: Skriptkapitel „Lagen, Flächensymmetrie und Multiplizität“

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Umgesetzt (PR #27). Das Kapitel ist heute **Kap. 10**, „Symmetrieändernde Verzerrungen“ ist Kap. 11 (Neuordnung v1.9.0); die Kapitelnummern im Text sind die alten. Der Kasten „Bezug zur Vorlesung“ heisst heute „Voraussetzungen“.
>
> Der Text darunter ist der Stand des Konzepts und wird nicht mehr nachgeführt. Was heute gilt, steht in `CLAUDE.md` und im `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 25.10.2026, abgestimmt mit Thomas (Entscheidungen in Abschnitt 7). Grundlage: Skript v1.6.0 (Kap. 1–8), Vorlesung HS 2026 (Kap. 3–5), Borchardt-Ott & Sowa (2018), Hoffmann (2016), ITA Vol. A (2006).

## 1. Anlass

- Die Themen allgemeine/spezielle Lage, Lagesymmetrie und Multiplizität stehen im Skript verstreut:
  - Kap. 2: allgemeine/spezielle Form, Grenzform, Flächensymmetrie, asymmetrische Flächeneinheit
  - Kap. 3: Bahn eines Pols in allgemeiner Lage, Pole auf Symmetrieelementen
  - Kap. 8: Zählung 48/16 = 3 usw.
- Der gemeinsame Kern fehlt: Ein Pol (oder eine Richtung) hat eine Lagesymmetrie, und daraus folgt die Multiplizität.
- Lücken im Einzelnen:
  - Die orientierten Symbole (4m.m, 2..) werden in Kap. 2 benutzt, aber nicht erklärt.
  - Richtungsfamilien ⟨uvw⟩ mit Multiplizität fehlen.
  - Der Zusammenhang zwischen Lage und Polygonform der Flächen fehlt.
  - „Eigensymmetrie“ wird nirgends definiert.
- Die App zeigt diese Begriffe schon in der Infobox: „Wyckoff-Lage, Flächensymmetrie“, „Flächen der Form“, „Eigensymmetrie der Form“.
- Die Vorlesung behandelt später Raumgruppen mit Wyckoff-Lagen. Das Kapitel bereitet darauf vor.

## 2. Platz und Rolle

- **Neues Kapitel 8**, nach „Hexagonale Achsen“. Das bisherige Kapitel 8 („Symmetrieändernde Verzerrungen“) wird **Kapitel 9**.
  - Die orientierten Symbole setzen die Blickrichtungen (Kap. 6) voraus.
  - Kap. 9 nutzt dann die hier eingeführte Zählung (Index der Untergruppe, Zahl gleichwertiger Geraden, Domänen).
- Wie die übrigen Kapitel: anschaulich, wenige Formeln, Begriffe nach Borchardt-Ott, Lernziele, Merksätze, Zusammenfassung, Quellen.
- Kap. 2 und 3 behalten ihre kurzen Definitionen. Sie verweisen auf Kap. 8; in Kap. 2 kommt eine kurze Erklärung der Punkte in 4m.m und 2.. dazu (oder ein Verweis).

## 3. Lernziele (Entwurf)

- für einen Pol oder eine Richtung die Lagesymmetrie angeben und entscheiden, ob die Lage allgemein oder speziell ist
- die Flächenzahl einer Form aus der Ordnung der Punktgruppe und der Flächensymmetrie berechnen
- ein orientiertes Symbol der Flächensymmetrie lesen (z. B. 4m.m, ..m)
- erklären, warum dieselbe Form in verschiedenen Punktgruppen verschiedene Flächensymmetrie, aber gleiche Flächenzahl haben kann
- Richtungsfamilien und Flächenformen als Lagen auf der Umkugel beschreiben

## 4. Gliederung

### 4.1 Die Lage eines Pols
- Allgemeine Lage: Nur die Identität bildet den Pol auf sich ab. Spezielle Lage: Mindestens eine weitere Operation hält ihn fest.
- Lagesymmetrie (bei Flächen: Flächensymmetrie) = die Operationen, die den Pol festhalten; sie bilden eine Untergruppe der Punktgruppe (Verbindung zu Vorlesung Kap. 5).
- Asymmetrische Flächeneinheit, Freiheitsgrade 2 / 1 / 0: Inneres, Seiten, Ecken. In mmm, 4/mmm, 6/mmm und m3̄m ist sie ein sphärisches Dreieck, dessen Seiten auf Spiegelebenen liegen. Beispiel 4/mmm: Ecken (001), (100), (110) mit 4mm, m2m., m.m2 (Borchardt-Ott S. 144).
- Sieben mögliche Lagen (Inneres, drei Seiten, drei Ecken). Gleichwertige Seiten fallen zu einer Wyckoff-Lage zusammen. Beispiel m3̄m (Ecken (100), (110), (111), Borchardt-Ott Abb. 9.15): Die Seiten (100)–(111) und (111)–(110) liegen auf konjugierten Spiegelebenen ..m. Deshalb gehören Trisoktaeder und Deltoidikositetraeder zur selben Wyckoff-Lage 24e, und m3̄m hat nur sechs Wyckoff-Lagen (ITA 10.1.2.2).
- Beispiel aus Vorlesung und App: die zwei tetragonalen Dipyramiden {111} und {113} (Beispielkristall „dipyramiden“). Beide liegen auf ..m (Wyckoff-Lage e) mit einem Freiheitsgrad und haben je 8 Flächen.

### 4.2 Das orientierte Symbol der Flächensymmetrie
- Die Positionen folgen den Blickrichtungen. Ein Punkt heisst: In dieser Blickrichtung geht kein Symmetrieelement durch die Fläche (Borchardt-Ott S. 143–144).
- Beispiele: 4m.m ({100} in m3̄m), .3m ({111}), m.m2 ({110}), ..m ({hhl}), 2.. ({100} in 23).
- Die Infobox der App zeigt genau diese Angabe.

### 4.3 Multiplizität
- Merksatz: **Flächenzahl = Ordnung der Punktgruppe / Ordnung der Flächensymmetrie** (ITA 10.1.2.2). Bei der allgemeinen Form ist die Flächensymmetrie 1, die Flächenzahl also gleich der Ordnung (Kap. 2).
- Anschaulich: Jede Operation bringt den Pol irgendwohin. Die Operationen, die ihn festhalten, liefern alle dasselbe Bild. Deshalb entstehen so viele verschiedene Pole, wie die Ordnung der Gruppe geteilt durch die Ordnung der Lagesymmetrie ergibt.
- Tabelle m3̄m (Ordnung 48), aus dem Formkatalog der App:

| Wyckoff | Flächensymmetrie (Ordnung) | Form | Flächen |
|---|---|---|---|
| 48f | 1 (1) | Hexakisoktaeder {hkl} | 48 |
| 24e | ..m (2) | Trisoktaeder {hhl}, h > l / Deltoidikositetraeder {hhl}, h < l | 24 |
| 24d | m.. (2) | Tetrakishexaeder {0kl} | 24 |
| 12c | m.m2 (4) | Rhombendodekaeder {110} | 12 |
| 8b | .3m (6) | Oktaeder {111} | 8 |
| 6a | 4m.m (8) | Würfel {100} | 6 |

- Vergleich über Punktgruppen: Der Würfel hat in m3̄m (48/8), 4̄3m (24/4, 2.mm) und 23 (12/2, 2..) immer 6 Flächen; die Gruppe wird kleiner, die Flächensymmetrie im selben Verhältnis. {111} dagegen hat in 4̄3m die Flächensymmetrie .3m wie in m3̄m, aber die Gruppe hat nur 24 Operationen: 24/6 = 4 Flächen, ein Tetraeder. Die zweite Hälfte bildet die Gegenform {1̄1̄1̄}. Zugehörigkeit zur Familie hängt von der Symmetrie ab.
- Grösse der asymmetrischen Flächeneinheit = Kugeloberfläche / Flächenzahl der allgemeinen Form (Borchardt-Ott Gl. 9.1). Halb so viele Operationen, doppelt so grosse Einheit (S. 148).

### 4.4 Richtungen
- Richtungen sind Punkte auf der Umkugel wie Flächenpole; für sie gelten dieselben Lagen und dieselbe Regel. Kubisch: ⟨100⟩ 6, ⟨111⟩ 8, ⟨110⟩ 12.
- Kristallform und Punktform (ITA 10.1.2.2): Eine Familie gleichwertiger Richtungen spannt ein Polyeder auf, das zum Polyeder der Flächenform dual ist. Die 8 Richtungen ⟨111⟩ zeigen auf die Ecken eines Würfels, die 8 Flächen {111} bilden ein Oktaeder.
- Richtung (Pfeil) und Gerade (Achse): ⟨111⟩ hat 8 Richtungen, aber 4 Geraden. Kap. 9 (Streckung) und die Zonenliste der App zählen Geraden; die Folien zählen Richtungen.
- Nur kubisch liegen Richtung [uvw] und Pol (uvw) an derselben Stelle (Kap. 4). Die Multiplizität einer speziellen Punktform ist aber immer gleich der der zugehörigen Flächenform (ITA 10.1.2.2).

### 4.5 Lage und Flächenform
- Die Operationen der Flächensymmetrie führen die Fläche in sich über. Ihr Umriss hat deshalb mindestens diese Symmetrie, sofern der ganze Kristall die Punktgruppe hat.
- Beispiele (Namen und Flächenformen beim Schreiben mit Borchardt-Ott Abb. 15.2 und Tab. 9.5–9.8 belegen):
  - Flächensymmetrie 1: ungleichseitige Dreiecke (Hexakisoktaeder)
  - ..m: gleichschenklige Dreiecke (Trisoktaeder) bzw. Deltoide (Deltoidikositetraeder)
  - .3m: gleichseitiges Dreieck (Oktaeder)
  - 4m.m: Quadrat (Würfel)
- Die Form kann symmetrischer aussehen, als die Flächensymmetrie verlangt: Die Würfelfläche ist auch in 23 ein Quadrat, obwohl die Flächensymmetrie nur 2.. ist. Dann zeigen erst Ätzfiguren und Streifung die Flächensymmetrie (ITA 10.1.2.3), in der App „Flächensymmetrie zeigen“.

### 4.6 Erzeugende Symmetrie und Eigensymmetrie
- Erzeugende Symmetrie: die Punktgruppe, in der die Form vorkommt. Eigensymmetrie: die volle Symmetrie des Polyeders für sich (ITA 10.1.2.2; Fundstelle bei Borchardt-Ott beim Schreiben bestimmen).
- Beispiele: Würfel in 23 (Eigensymmetrie m3̄m); tetragonale Pyramide in 4 (Eigensymmetrie 4mm). Die Infobox der App zeigt beides.
- Grenzformen haben die gleiche Lage (Wyckoff-Lage, Flächenzahl, Flächensymmetrie) wie die zugehörige Grundform, aber höhere Eigensymmetrie (Verbindung zu Kap. 2).

### 4.7 Ausblick: Punktlagen in Raumgruppen
- Dieselben Begriffe kehren bei den Raumgruppen wieder (Borchardt-Ott 10.4; Hoffmann 6.1.5):
  - Punktlage statt Flächenpol
  - Zähligkeit bzw. Multiplizität je Elementarzelle
  - Lagesymmetrie
  - Wyckoff-Buchstabe, z. B. 4a
  - asymmetrische Einheit (Gl. 10.3) statt asymmetrischer Flächeneinheit (Gl. 9.1)
- Neu dort: Gleitspiegelebenen und Schraubenachsen verringern die Zähligkeit nicht (Borchardt-Ott S. 216–217; Hoffmann S. 203).
- Nur als Ausblick, ohne Raumgruppen zu behandeln.

## 5. Abbildungen (aus der App, mit „In der App öffnen“)

- 4/mmm: Symmetriegerüst mit Polen der sieben Lagen; Vorbild Borchardt-Ott Abb. 9.7/9.9, eigene Version.
- Beispielkristall „dipyramiden“: {111} und {113} auf derselben Spiegelebene.
- Würfel in m3̄m, 4̄3m und 23 mit „Flächensymmetrie zeigen“ (gleiche Pole, verschiedene Muster).
- {111} in m3̄m (Oktaeder) und 4̄3m (Tetraeder).
- m3̄m: Trisoktaeder und Deltoidikositetraeder (gleiche Wyckoff-Lage, verschiedene Flächenform).
- Eigene SVG-Skizze: charakteristisches Dreieck mit Innerem, Seiten und Ecken; ggf. Würfel mit den Richtungen ⟨111⟩ und dazu das Oktaeder {111} (Dualität).

## 6. Fachliche Absicherung

- Quellen: Borchardt-Ott 9.2 (S. 142–150) und 10.4 (S. 214–218); Hoffmann 6.1.5 (S. 203–205); ITA 10.1.2.2–10.1.2.3 (Kristall- und Punktformen, Flächen- und Lagesymmetrie, Multiplizität, Wyckoff-Lagen, Eigensymmetrie, Grenzformen). Folien als Massstab für Umfang und Reihenfolge.
- Alle Zahlen (Ordnungen, Flächenzahlen, Wyckoff-Buchstaben) gegen den Formkatalog der App (js/forms.js) und einen Test nachrechnen; die Regel Ordnung / Ordnung der Flächensymmetrie für alle 115 Katalogformen als Test.
- Gegenlese-Durchgang gegen die Quellen wie bei Kap. 1–8, dann Durchsicht durch Thomas.

## 7. Entscheidungen (25.10.2026)

1. Raumgruppen mit Wyckoff-Lagen kommen später in der Vorlesung; das Kapitel bereitet ausdrücklich darauf vor (Abschnitt 4.7).
2. Platz: neues Kapitel 8 nach „Hexagonale Achsen“; „Symmetrieändernde Verzerrungen“ wird Kapitel 9.
3. In der App heisst die Auswahl „Lage“ jetzt „Projektionsrichtung“ (PR #25), damit „Lage“ für allgemeine und spezielle Lagen frei ist.

## 8. Weitere Entscheidungen (25.10.2026)

1. Die Infobox zeigt die Wyckoff-Lage mit Multiplizität („6a“ statt „a“), wie in ITA und später in der Vorlesung (PR #25).
2. Punktgruppenmodus: Der Ausgangspol rastet nahe an Achsen und Spiegelebenen immer ein (kein Schalter); „Objekt in allgemeiner Lage“ bleibt als Beschriftung; die Infobox zeigt Wyckoff-Lage, Lagesymmetrie und Polzahl; zusammenfallende Pole einmal, bei gemischter Händigkeit grau (PR #26). Das Kapitel kann darauf verweisen.
3. Links aus der Infobox („Wyckoff-Lage“, „Eigensymmetrie“, „Lage des Ausgangspols“) zum neuen Kapitel; umgesetzt mit dem Kapitel in PR #27.
