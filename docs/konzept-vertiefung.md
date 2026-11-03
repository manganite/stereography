# Konzept: Vorlesungsstoff und Vertiefung im Skript unterscheiden

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Umgesetzt (PR #28), danach mit v1.9.0 geändert:
> - „Vorlesungsstoff“ heisst im Skript „Grundstoff“; Verweise auf Vorlesung und Folien sind entfernt; Lernziele „Aus der Vorlesung“ heissen entsprechend anders.
> - Die Kapitelnummern der Einstufungstabelle (Abschn. 2) sind die alten. Zuordnung alt → neu: 1 → 2, 2 → 6, 3 → 4, 4 → 7, 5 → 8, 6 → 5, 7 → 1 und 9, 8 → 10, 9 → 11.
> - Die Tabelle bleibt die Grundlage, wenn die Einstufung nachgeführt wird (Issue #55).
>
> Der Text darunter ist der Stand des Konzepts und wird nicht mehr nachgeführt. Was heute gilt, steht in `CLAUDE.md` und im `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 25.10.2026, mit den Entscheidungen von Thomas vom selben Tag (Abschnitt 5). Grundlage: Skript mit neun Kapiteln (Branch skript-lagen, PR #27) und Folien der Vorlesung HS 2026, Kap. 0–5. Spätere Vorlesungskapitel (Raumgruppen, Beugung, physikalische Eigenschaften) liegen noch nicht vor; die Einstufung muss nachgeführt werden, wenn sie kommen.

## 1. Ziel

- Studierende sollen beim Lesen sofort erkennen, was die Vorlesung abbildet und was darüber hinausgeht.
- Kein Inhalt fällt weg, und der Text bleibt ein durchgehender Text. Für Fortgeschrittene soll er sich weiter so lesen wie jetzt.
- Grundsatz: Der Vorlesungsstoff ist der unmarkierte Normaltext. Gekennzeichnet werden nur die Vertiefungen und die Hinweise zur Bedienung der App.

## 2. Befund

Grob nach Wortzahl gezählt bildet knapp die Hälfte des Skripts die Vorlesung ab; der Rest vertieft (vor allem Kap. 8 und 9) oder erklärt die App. Die Vertiefungen stecken an drei Stellen:

1. **Ganze Kapitel:** Kapitel 8 (Lagen) und 9 (Verzerrungen) gehen überwiegend über die Folien hinaus. Kapitel 9 sagt das schon selbst.
2. **Ganze Abschnitte:** z. B. „Allgemeine Form, spezielle Form, Grenzform“ (Kap. 2) und „Vier Indizes für Flächen“ (Kap. 7).
3. **Einzelne Absätze mitten im Vorlesungsstoff:** Das stört am meisten, weil man es dem Text nicht ansieht. Beispiele sind Normalen- und Flächenwinkel, das Reflexionsgoniometer, das Wulffsche Netz, die Komplikationsregel, der Topas-Vergleich und die 1 als Platzhalter im HM-Symbol.

Dazu kommen **Bedienhinweise zur App** („In der App …“), die über alle Kapitel verstreut im Fliesstext stehen. Sie sind weder Vorlesungsstoff noch Vertiefung.

### Einstufung je Abschnitt

V = Vorlesung, T = Vertiefung, A = Hinweis zur App.

| Kap. | Abschnitt | Einstufung |
|---|---|---|
| 1 | Einleitung (Winkelkonstanz) | V |
| 1 | Umkugel und Flächenpole | V; **T**: Normalenwinkel n und Flächenwinkel f = 180° − n, Oktaeder-Beispiel |
| 1 | Vom Pol zum Stereogramm | V, auch „nicht längentreu“ am Regler; **T**: Randbemerkung zum Kreuz bei Borchardt-Ott |
| 1 | Die Winkel φ und ρ | V; Konventionen für Vorzeichen und Zählrichtung nach Borchardt-Ott: V, weil die App sie braucht; **T**: Reflexionsgoniometer; **A**: Tooltip |
| 1 | Kreise, Winkel, Wulffsches Netz | V: Kreistreue, Grosskreis als Bogen oder Durchmesser, Winkeltreue; **T**: Mittelpunkt des Kleinkreises, zweiter Bogen der unteren Halbkugel, „Winkel nur auf Grosskreisen“, Wulffsches Netz (in den Folien nicht erwähnt) |
| 2 | Aufstellung und Indizes | V ([hkl] ⊥ (hkl) nur bei orthogonalen Achsen gleicher Länge) |
| 2 | Was ist eine Kristallform? | V; **A**: Ergänzungsformen |
| 2 | Allgemeine Form, spezielle Form, Grenzform | **T** als Ganzes (Flächensymmetrie, Freiheitsgrade, asymmetrische Flächeneinheit, Würfel in 23); der Kern „Pole liegen auf Symmetrieelementen“ ist V |
| 2 | Andere Projektionsrichtung | V (Vorlesung bzw. Übungen; Entscheidung Thomas) |
| 3 | Symmetrieelemente in der Projektion | V |
| 3 | Wohin ein Element einen Pol bringt | V („einzeichnen, wohin…“) |
| 3 | Vom Pol zur Bahn | V; **A**: Ausgangspol ziehen, Einrasten |
| 3 | Pole auf Symmetrieelementen | V; **T**: Schluss vom Polmuster auf die Punktgruppe, höhere Symmetrie des Polmusters |
| 4 | Was ist eine Zone? | V |
| 4 | Zonenkreis und Zonenpol | V: Zonenkreis; **T**: Zonenpol 90° vom Zonenkreis, Winkel zwischen Zonen, Wulffsches Netz |
| 4 | Die Zonengleichung | V |
| 4 | Flächen im Schnittpunkt zweier Zonen | V; **T**: Zonenbeziehung nach Borchardt-Ott, Komplikationsregel |
| 4 | Zonenachse und Flächennormale | V: kubisch fällt [uvw] mit (uvw) zusammen; **T**: Topas-Vergleich; **A**: Werkzeug „Zone“ |
| 5 | Tracht, Habitus, Wachstum | V |
| 5 | Was das Stereogramm zeigt | V (folgt aus der Winkelkonstanz, 39); **A**: Habitusregel der App (Grenze 2/3) |
| 6 | Was ist eine Blickrichtung? | V; **T**: ITA-Schreibweise ⟨1̄10⟩ |
| 6 | Das HM-Symbol lesen | V; **T**: 1 als Platzhalter (31m und 3m1); **A**: Farben nach Blickrichtung |
| 6 | Volles und gekürztes Symbol | V |
| 7 | Das hexagonale Achsensystem | V, auch der Pol von (100) in Richtung [210] (Übungen; Entscheidung Thomas) |
| 7 | Vier Indizes für Flächen | **T** (kommt in der Vorlesung voraussichtlich nicht) |
| 8 | ganzes Kapitel | **T**; Anknüpfung an V: Äquivalenz von Flächen, Multiplizität, Familien von Ebenen und Richtungen, Untergruppe, ebene Punktgruppen; **A**: Infobox, Einrasten |
| 9 | ganzes Kapitel | **T**, ausser Würfel → Rhomboeder entlang [111] mit 3̄m und hexagonalen Achsen (V); **A**: „In der App wählt man …“ |

Umgekehrt fehlen im Skript wenige Vorlesungsthemen, die zur Projektion gehören: Drehspiegelachsen und Schoenflies-Symbole. Für die Unterscheidung spielt das keine Rolle; ob eine kurze Erwähnung in Kap. 3 sinnvoll ist, kann man separat entscheiden.

## 3. Vorschlag zur Gestaltung

### 3.1 Drei Kennzeichnungen

1. **Vorlesungsstoff:** unmarkiert, wie jetzt.
2. **Vertiefung:**
   - Ganze Abschnitte bekommen neben der Überschrift ein kleines Etikett „Vertiefung“, auch im Inhaltsverzeichnis.
   - Einzelne Absätze kommen in einen dezenten Kasten mit der Kopfzeile „Vertiefung“ und einem kurzen Thema, z. B. „Vertiefung · Normalenwinkel und Flächenwinkel“. Farbe und Randlinie unterscheiden sich von „Merke“ und „Lernziele“, Schrift und Grösse bleiben gleich, damit er sich weiterlesen lässt.
   - Jede Vertiefung beginnt mit einem Satz, der sagt, welchen Vorlesungsinhalt sie weiterführt und wozu man das braucht, z. B. „Die Pole stehen für die Normalen. Wer Winkel am Kristall selbst misst, braucht den Zusammenhang mit dem Winkel an der Kante.“ Keine Aussage zur Klausur.
3. **In der App:**
   - Bedienhinweise kommen in einen kleinen grauen Kasten „In der App“, meist am Abschnittsende.
   - Das trennt Bedienung von Fachinhalt und kürzt den Fliesstext.

### 3.2 Kapitelebene

- Die Kapitel des Skripts folgen nicht den Kapiteln der Vorlesung. Der Kapitelkopf nennt deshalb keinen Vorlesungstitel.
- Kapitel 1–7 bleiben im Kopf unmarkiert (Vorlesungsstoff ist der Normalfall).
- Kapitel 8 und 9 tragen das Etikett „Vertiefung“ an der Überschrift und beginnen mit einem kurzen Kasten „Bezug zur Vorlesung“. Er nennt inhaltlich, woran sie anknüpfen und wohin sie führen (Kap. 8: Äquivalenz von Flächen, Multiplizität, Familien → Wyckoff-Lagen der Raumgruppen; Kap. 9: Würfel → Rhomboeder → Symmetrieabbau bei Phasenumwandlungen).
- Das Inhaltsverzeichnis markiert Vertiefungskapitel und -abschnitte mit demselben Etikett.

### 3.3 Lernziele, Merke, Zusammenfassung

- **Lernziele** in zwei Gruppen: „Aus der Vorlesung“ (möglichst in der Formulierung von „Das sollten Sie können“) und darunter „Zur Vertiefung“.
- **Merke-Kästen:** In Vertiefungsabschnitten bekommen sie dieselbe Kennzeichnung („Merke · Vertiefung“). Ein unmarkierter Merke-Kasten ist damit immer Vorlesungsstoff.
- **Zusammenfassung:** zuerst die Punkte aus der Vorlesung, danach abgesetzt die Vertiefungen.

### 3.4 Einleitung „So ist das Skript aufgebaut“

Am Anfang des Skripts, vor Kapitel 1, drei bis vier Sätze mit einer kleinen Legende der drei Kennzeichnungen. Sinngemäss: Der unmarkierte Text behandelt die Inhalte der Vorlesung und der Übungen; Vertiefungen zeigen, wie diese Inhalte weitergehen, und lassen sich beim ersten Lesen überspringen; „In der App“ erklärt die Bedienung. Nichts zur Klausur.

### 3.5 Wenig Unterbrechungen

- Damit nicht jeder zweite Absatz einen Kasten bekommt, stelle ich eingestreute Vertiefungen innerhalb ihres Abschnitts ans Ende und fasse sie zu einem Kasten zusammen. Am Inhalt ändert sich nichts. Betroffen wären:
  - Kap. 1, Umkugel: Normalen- und Flächenwinkel
  - Kap. 1, Kreise: Kleinkreis, „nur auf Grosskreisen“, Wulffsches Netz
  - Kap. 3, Pole auf Symmetrieelementen: Polmuster
  - Kap. 4, Zonenkreis: Zonenpol, Winkel
  - Kap. 4, Schnittpunkt: Komplikationsregel
  - Kap. 4, Zonenachse: Topas
  - Kap. 6: 1 als Platzhalter
- Abbildungen bleiben, wo sie sind. Eine Abbildung zu einer Vertiefung wandert in deren Kasten, z. B. Topas Abb. 4.6.
- Richtwert: höchstens ein Vertiefungskasten je Abschnitt.

## 4. Umsetzung

- **Technik:**
  - Markup mit `data-level="vertiefung"` an Abschnitten, Kästen `.box.vertiefung` und `.box.app`.
  - Das Etikett im Inhaltsverzeichnis setzt `skript.js` aus dem Attribut, damit es nicht doppelt gepflegt wird.
  - Druck und PDF behalten die Kennzeichnung.
- **Inhalt:** keine neuen Aussagen; nur Verschieben innerhalb von Abschnitten, Kopfzeilen, die Einleitung, die geteilten Lernziele und die Kästen „Bezug zur Vorlesung“.
- **Prüfung:**
  - ein Test, dass jeder Vertiefungskasten eine Themenzeile hat, dass Kap. 8 und 9 den Kasten „Bezug zur Vorlesung“ haben und dass Links und Abbildungen unverändert funktionieren
  - Browser bei Laptop- und Telefonbreite, hell und dunkel
  - ein PDF zur Durchsicht
- **Ablauf:** ein PR nach PR #27; vorher ein kurzer Prototyp an Kapitel 1 und 4 zur Abstimmung von Aussehen und Granularität.
- **Pflege:** Kommen neue Vorlesungskapitel hinzu (Raumgruppen, Beugung, physikalische Eigenschaften), wird die Einstufung nachgeführt. Wahrscheinlich wandern dann der Ausblick in Kap. 8 und Teile von Kap. 9 zum Vorlesungsstoff. Die Tabelle in Abschnitt 2 dient dafür als Liste.

## 5. Entscheidungen (Thomas, 25.10.2026)

1. Vierstellige Indizes (hkil) kommen in der Vorlesung voraussichtlich nicht → Abschnitt in Kap. 7 bleibt Vertiefung.
2. Keine Aussage zur Klausurrelevanz. Für Interessierte soll klar werden, wozu die Vertiefungen dienen und wie sie die Themen der Vorlesung weiterführen (Satz zu Beginn jeder Vertiefung, Abschnitt 3.1).
3. Die Kapitel des Skripts sind unabhängig von der Vorlesung. Im Kapitelkopf kein Vorlesungstitel; es soll nur der inhaltliche Bezug klar werden bzw. dass es eine Vertiefung ist (Abschnitt 3.2).
4. Kein Schalter zum Einklappen.
5. „Andere Projektionsrichtung“ (Kap. 2) und der Pol von (100) in Richtung [210] (Kap. 7) sind Vorlesungs- bzw. Übungsstoff.

## 6. Nächster Schritt

Prototyp an Kapitel 1 und 4 (Branch skript-vertiefung, auf skript-lagen aufbauend), zur Durchsicht als PDF. Danach Umstellung aller Kapitel in einem PR.

## 7. Umsetzung (PR #28, 25.10.2026)

- Prototyp an Kap. 1 und 4 von Thomas freigegeben („Das passt so!“), danach alle Kapitel umgestellt.
- Abweichungen von der Einstufungstabelle:
  - Kap. 2 „Allgemeine Form, spezielle Form, Grenzform“ nicht als Ganzes Vertiefung, weil Kap. 3 die Begriffe allgemeine und spezielle Form verwendet; Vertiefung sind Flächensymmetrie, Freiheitsgrade, Grenzform, asymmetrische Flächeneinheit und Würfel in 23.
  - Kap. 1: der gestrichelte zweite Bogen geneigter Grosskreise bleibt im Haupttext (nötig für die Zonen-Abbildungen in Kap. 4).
  - Kap. 4: Definition des Zonenpols bleibt im Haupttext; 90°-Konstruktion und Winkel zwischen Zonen sind Vertiefung.
- Kurze Hinweise darauf, was die App anzeigt (z. B. „Die App zeigt beide Symbole“), bleiben im Text; in Kästen „In der App“ stehen Bedienhinweise.
- Der Bezugskasten in Kap. 9 nennt den Abschnitt „Streckung entlang ⟨111⟩“ als Fall aus der Vorlesung.
