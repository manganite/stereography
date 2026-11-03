# Konzept: Skript zur stereographischen Projektion als Unterseite der App

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Umgesetzt mit v1.3.0, seither weitgehend überholt:
> - Ausrichtung: Das Skript „begleitet die Vorlesung“ und „folgt ihrer Reihenfolge“ gilt nicht mehr; App und Skript sind eigenständig (28.10.2026, `konzept-skript-ergaenzungen.md` Abschn. 1 und 12).
> - Kapitelplan (Abschn. 4): ersetzt durch die Kapitelfolge mit elf Kapiteln (`konzept-skript-ergaenzungen.md` Abschn. 3).
> - Druck/PDF „vorerst nicht“: Es gibt inzwischen ein PDF (`tools/skript-pdf.mjs`, auch im Release).
> - Gültig geblieben: Abbildungen aus dem Code der App (Weg B, `js/scene.js`), Begriffe (Abschn. 7), Arbeitsweise und Quellenregeln (Abschn. 6).
>
> Der Text darunter ist der Stand des Konzepts und wird nicht mehr nachgeführt. Was heute gilt, steht in `CLAUDE.md` und im `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 18.10.2026, abgestimmt mit Thomas (Entscheidungen in Abschnitt 9). Grundlage: Vorlesung HS 2026 (Kap. 2–5), Borchardt-Ott & Sowa (2018), App v1.2.0.

## 1. Ziel und Rolle

- Ein **Skript zu den Vorlesungsthemen**, keine Bedienungsanleitung: Es erklärt die Kristallographie, und die App liefert die Abbildungen und die Übungsumgebung. Die Bedienung erklären weiterhin die Tooltips und „Erste Schritte“.
- **Anschaulich, mit wenigen Formeln:** Formeln nur, wo die Vorlesung sie verwendet (z. B. Zonengleichung, h + k + i = 0); sonst Erklärung am Bild.
- Es **begleitet die Vorlesung und ersetzt sie nicht**: Es fasst zusammen, was in der Vorlesung eingeführt wird, in derselben Reihenfolge und mit denselben Begriffen. Damit kann man vor der Klausur nachlesen, und Studierende, die eine Vorlesung verpasst haben, können sie nacharbeiten.
- **Begriffe und Konventionen nach Borchardt-Ott & Sowa**, Symbole nach ITA. Abweichende Namen in Klammern, wie in der App.
- Jeder fachliche Satz ist durch eine Quelle gedeckt (siehe Abschnitt 6).

## 2. Form und Einbindung

- **Eigene Seite `skript.html`** im selben Repository, ohne Build-Schritt, mit Kopfzeile, Schriften, Farben und Dunkelmodus der App. Im Kopf führt ein dritter Eintrag „Skript“ neben „Punktgruppen | Kristallformen“ dorthin, und aus dem Skript führt er zurück in die App.
- **Gliederung:** links ein angehefteter Inhaltsbaum (wie die Seitenleiste der App), rechts der Text in Lesebreite (ca. 70 Zeichen), Abbildungen auch breiter. Auf dem Telefon ist das Inhaltsverzeichnis einklappbar.
- **Verankerte Abschnitte** (`skript.html#zonen`), damit Folien und Moodle direkt auf einen Abschnitt verweisen können.
- **Verbindung in beide Richtungen:**
  - Skript → App: Bei jeder Abbildung führt „In der App öffnen“ genau in diese Ansicht (die App versteht das schon über die Link-Adresse, z. B. `#m=form&sys=kubisch&bsp=galenit&w=zone`).
  - App → Skript: Die Infobox bekommt Links wie „Mehr dazu im Skript: Zonen“, und die Karte „Erste Schritte“ einen Link „Zum Skript“.
- **Offline** wie die App (Service Worker). Ein Druck-Layout bzw. PDF für Moodle vorerst nicht; ob es nötig wird, hängt vom Ergebnis und vom Interesse der Studierenden ab.

## 3. Bausteine eines Kapitels

1. **Lernziele** (2–4 Punkte, im Stil von „Das sollten Sie können“ der Folien)
2. **Text** in kurzen Abschnitten, mit Definitionen in hervorgehobenen Kästen (Merksätze wie in Borchardt-Ott)
3. **Abbildungen**, mit der App erzeugt, jeweils mit „In der App öffnen“
4. **Zusammenfassung** (3–5 Zeilen)
5. **Quellen** des Kapitels mit Abschnitt, Seite, Abbildung oder Tabelle

## 4. Kapitelplan

Die Reihenfolge folgt der Vorlesung: Kapitel 2 der Vorlesung (Morphologie) und Kapitel 4 (Stereographische Projektion), dazu Teile aus Kapitel 3 und 5.

### 4.1 Die stereographische Projektion
- **Lernziele:** Flächenpol konstruieren, Pol oben und unten unterscheiden, ρ und φ ablesen, Winkel nur auf Grosskreisen ablesen.
- **Inhalt:**
  - Kristall im Zentrum der Kugel; Flächennormale → Flächenpol; Pole der Nordhalbkugel werden zum Südpol hin auf die Äquatorebene projiziert, Pole der Südhalbkugel zum Nordpol hin.
  - Pol oben ● (Punkt), unten ○ (Kreis).
  - Normalenwinkel n = 180° − Flächenwinkel f.
  - Winkelkoordinaten φ (Azimut) und ρ (Poldistanz, auf der Südhalbkugel negativ vom Südpol aus); anschaulich: je weiter der Pol vom Nordpol entfernt, desto weiter aussen im Stereogramm (keine Formel).
  - Winkeltreu und kreistreu: Grosskreise werden zu Kreisbögen durch zwei Gegenpunkte des Grundkreises oder zu Durchmessern; Kleinkreise werden zu Kreisen, deren Mittelpunkt nicht der Projektion des Kreismittelpunkts entspricht.
  - Wulff'sches Netz kurz: Wozu dient es, und warum dürfen Winkel nur auf Grosskreisen abgetragen werden?
- **Abbildungen:**
  - eigene Schnittzeichnung (Kugel, N, S, Strahl, ρ, r) mit Regler für ρ
  - 3D-Konstruktion der App in Seitenansicht
  - ein Pol, der beim Ziehen über den Äquator vom Punkt zum Kreis wechselt
- **Quellen:** Borchardt-Ott Abschn. 5.4 (S. 40–43, Abb. 5.9–5.13), 5.6 (S. 45–46, Abb. 5.16–5.18).

### 4.2 Kristallformen im Stereogramm
- **Lernziele:** das Stereogramm eines einfachen Polyeders zeichnen und ein Stereogramm einem Körper zuordnen (Lernziel der Vorlesung).
- **Inhalt:**
  - Kristallform = Menge symmetrisch gleichwertiger Flächen {hkl}.
  - Prisma und Pinakoid, Pyramide und Pedion (Pole am Rand bzw. in gleichem Abstand vom Rand)
  - Würfel, Oktaeder, Rhombendodekaeder, Galenit
  - offene und geschlossene Formen
  - Die Lage (Projektionsrichtung) ändert das Bild, nicht den Kristall.
  - Allgemeine und spezielle Form, Flächenzahl.
- **Abbildungen:** tetragonales Prisma + Pinakoid, tetragonale Pyramide + Pedion (eigene Version der Situation von Abb. 5.13), Galenit in drei Lagen nebeneinander.
- **Quellen:** Borchardt-Ott 5.2 (S. 35), 5.4 (Abb. 5.11, 5.13), 9.2 (Tab. 9.5–9.8), Abb. 15.2; ITA Tab. 10.1.2.2.

### 4.3 Symmetriegerüste im Stereogramm
- **Lernziele:** die Symmetrieelemente einer Punktgruppe einzeichnen; einzeichnen, wohin sie einen beliebigen Punkt abbilden.
- **Inhalt:**
  - Projiziert werden die Durchstosspunkte der Dreh- und Drehinversionsachsen und die Grosskreise der Spiegelebenen (Borchardt-Ott weist ausdrücklich darauf hin, dass dies vom „üblichen Prinzip“ abweicht).
  - Symbole nach ITA.
  - Ein Pol in allgemeiner Lage ergibt eine Bahn mit so vielen Polen, wie die Gruppe Operationen hat. Pole in spezieller Lage liegen auf Symmetrieelementen (Galenit: {100} auf 4, {111} auf 3̄, {110} auf 2).
  - Symmetriesätze am Stereogramm: m ⊥ m erzeugt 2 (Abb. 9.1).
- **Abbildungen:** mmm (mit den erzeugten 2-zähligen Achsen), 4/mmm, m3̄m; Galenit-Pole über dem Gerüst von m3̄m.
- **Quellen:** Borchardt-Ott 5.4 (S. 43), 9.1 (Abb. 9.1, 9.2, Tab. 9.2), 9.2 (Abb. 9.4 Galenit); ITA Kap. 10.1.

### 4.4 Zonen
- **Lernziele:** Zonenachse aus zwei Flächen berechnen, mit der Zonengleichung prüfen, ob eine Fläche zu einer Zone gehört, und eine Fläche als Schnittpunkt zweier Zonen indizieren (Galenit).
- **Inhalt:**
  - Zone = Flächen mit parallelen Kanten, mindestens drei Flächen; tautozonal.
  - [uvw] = (h₁k₁l₁) × (h₂k₂l₂); Zonengleichung hu + kv + lw = 0.
  - Zonenkreis = Grosskreis senkrecht zur Zonenachse, Pol der Zonenachse.
  - (hkl) = [u₁v₁w₁] × [u₂v₂w₂].
  - Kubisch fällt [hkl] mit der Normalen auf (hkl) zusammen, sonst nicht.
  - Kurz als Ausblick: Reflexionsgoniometer misst Winkel innerhalb einer Zone.
- **Abbildungen:** Galenit mit den Zonen ⟨100⟩ und ⟨110⟩ (neue Zonenauswahl), eine Zone in 3D mit parallelen Kanten, ein orthorhombisches Beispiel (Topas) mit Abweichung zwischen [uvw] und (uvw).
- **Quellen:** Borchardt-Ott 3.5 (S. 18–21), 5.2 (S. 35), 5.4 (S. 41–42, Abb. 5.12), 5.5 (S. 43–45), 5.7 (Indizierung, S. 50 ff.).

### 4.5 Tracht und Habitus
- **Lernziele:** Tracht und Habitus unterscheiden; begründen, warum das Stereogramm vom Habitus nicht abhängt.
- **Inhalt:**
  - Kristallformen, Tracht (Menge der Formen), Habitus (relative Grösse; isometrisch, planar/tafelig, prismatisch/nadelig).
  - Habitus entsteht durch unterschiedliche Wachstumsgeschwindigkeiten.
  - **Kernaussage:** Parallelverschiebung der Flächen ändert keine Winkel (Winkelkonstanz) → gleiche Flächenpole bei verschiedenem Habitus.
  - Wie die App den Habitus bestimmt (Hauptausdehnungen, Grenze 2/3) als ausdrücklich gekennzeichnete Festlegung der App, nicht als Lehrbuchdefinition.
- **Abbildungen:** hexagonales Prisma + Pinakoid in drei Habitus mit identischem Stereogramm; Galenit mit veränderten Abständen der Formen.
- **Quellen:** Borchardt-Ott 5.2 (S. 35–36, Abb. 5.2), 5.3 (S. 36–39, Abb. 5.6, 5.7).

### 4.6 Blickrichtungen
- **Lernziele:** die Blickrichtungen eines Kristallsystems angeben; ein Hermann-Mauguin-Symbol Position für Position lesen.
- **Inhalt:**
  - Höchstens drei Klassen nicht äquivalenter Symmetrierichtungen.
  - Abfolge je System: orthorhombisch a, b, c; tetragonal c, ⟨100⟩, ⟨110⟩; hexagonal c, ⟨100⟩, ⟨210⟩; kubisch ⟨100⟩, ⟨111⟩, ⟨110⟩.
  - Achsen parallel, Spiegelebenen senkrecht zur Blickrichtung; volles und gekürztes Symbol.
  - Farbcodierung der App.
  - Hexagonal ⟨210⟩ wie in Vorlesung und Borchardt-Ott (bewusst gewählt, weil anschaulich); die App zeigt seit PR #14 ebenfalls ⟨210⟩. Eine Fussnote nennt die ITA-Schreibweise ⟨11̄0⟩ derselben Familie.
- **Abbildungen:** 4/mmm mit den drei Blickrichtungen einzeln (eigene Version der Situation von Abb. 7.21 b–d), m3̄m.
- **Quellen:** Borchardt-Ott 7.2.3–7.2.6 (S. 104–109, Tab. 7.3, Abb. 7.19, 7.21, 7.22), 9.1 (Tab. 9.2); ITA Kap. 2.1.

### 4.7 Hexagonale Achsen und vierstellige Indizes
- **Lernziele:** Richtungen und Flächen im hexagonalen Achsensystem angeben, (hkl) ↔ (hkil) umrechnen und begründen, wozu i dient.
- **Inhalt:**
  - a = b, γ = 120°, c ⊥; dritte gleichwertige Achse a₃.
  - Miller-Bravais-Indizes (hkil) mit h + k + i = 0.
  - Warum vier Indizes: Gleichwertige Flächen haben permutierte Indizes, z. B. {101̄0} = (101̄0), (011̄0), (1̄100) …, mit drei Indizes nicht erkennbar: (100), (010), (1̄10).
  - Dreistellig bleibt Standard wie in der Vorlesung.
  - Vierstellige Richtungen [uvtw] kommen nicht vor (nicht Teil der Vorlesung).
- **Abbildungen:** eigene Zeichnung a₁, a₂, a₃ in der Ebene mit [210] usw. (Situation wie Abb. 7.22), Magnesium oder hexagonales Prisma mit Umschalter (hkl)/(hkil).
- **Quellen:** Borchardt-Ott 7.2.5 (S. 107–109, Abb. 7.22), 9.2.2 (S. 151, Abb. 9.12, 9.13, Tab. 9.6).

## 5. Abbildungen: technische Umsetzung

Die Abbildungen sollen genau so aussehen wie die App und dieselben Konventionen haben. Zwei Wege:

**A. Einbettung der App:** Ein Einbettungsmodus der App (`index.html#…&embed=stereo`) zeigt nur das Stereogramm oder nur die 3D-Ansicht; das Skript lädt ihn in Rahmen, erst wenn die Abbildung ins Bild scrollt.
- **Vorteile:** wenig neuer Code, immer identisch mit der App, voll interaktiv.
- **Nachteile:** schwer (jede Abbildung lädt die ganze App), druckt schlecht, Telefone vertragen nur wenige 3D-Ansichten gleichzeitig.

**B. Eigene Abbildungsfunktion (Empfehlung):**
- Die Berechnung der Szene wird aus `main.js` in ein Modul `js/scene.js` herausgelöst. App und Skript erzeugen damit dasselbe SVG.
- Stereogramme stehen als SVG direkt im Text: leicht, gestochen scharf im Druck, ohne Rahmen.
- Für 3D gibt es nur wenige gezielte Abbildungen (Projektion, Zone, Habitus). Sie starten beim Hineinscrollen und werden beim Herausscrollen wieder freigegeben.
- Ein Test vergleicht das SVG der App vor und nach der Umstellung, damit die App sich nicht verändert.
- Mehr Arbeit als A. Auch ohne Druck die bessere Wahl: leicht auf Telefon und iPad (A lädt je Abbildung die ganze App und viele 3D-Ansichten), und ein späteres PDF bleibt ohne Umbau möglich.

**Eigene Zeichnungen:** Schnittbild der Projektion und hexagonale Achsen werden als eigenes SVG gezeichnet. Abbildungen aus Büchern oder Folien werden nicht übernommen (Bildrechte); wo eine Abbildung als Vorbild dient, steht „nach Borchardt-Ott Abb. …“.

## 6. Fachliche Absicherung

- **Quellen:**
  - Hauptquelle: Borchardt-Ott & Sowa (2018).
  - Symbole und Formen: ITA Vol. A (2006).
  - Ergänzend: Hoffmann (2016), Abschnitte beim Schreiben bestimmen.
  - Die Folien nur als Massstab für Umfang und Reihenfolge, nicht als zitierte Quelle (sie ändern sich jährlich).
- **Arbeitsweise je Kapitel:**
  1. Quellen in Zotero lesen
  2. Text schreiben, jede Definition mit Fundstelle
  3. Rechenbeispiele im Text mit der App bzw. einem Test nachrechnen, z. B. Zonenachsen, (hkl) ↔ (hkil)
  4. kritischer Gegenlese-Durchgang ohne Kenntnis des Entwurfs gegen die Quellen
  5. Durchsicht durch dich als Fachautor
- Wo die App eigene Festlegungen trifft (Habitus-Grenze 2/3, Zonen erst ab drei Flächen, Farben), sagt das Skript das ausdrücklich.

## 7. Begriffe (entschieden, umgesetzt in PR #14)

1. **Projektionsrichtung** für die Lage („[001] ∥ Projektionsrichtung“, „Projektion ∥ c“); **Blickrichtung** nur für die Symmetrierichtungen des HM-Symbols (Borchardt-Ott Abschn. 7.2).
2. **Umkugel** wie in der Vorlesung (statt „Lagekugel“/„Projektionskugel“).
3. Dritte hexagonale Blickrichtung **⟨210⟩** wie in der Vorlesung (bewusst gewählt, weil anschaulich).

## 8. Umsetzung in Schritten

1. **PR „Skript: Gerüst“:**
   - Seite, Navigation, Stil, Abbildungsmodul (Weg B mit Vergleichstest)
   - Kapitel 4.1 als Muster

   → Durchsicht durch dich, dann Stil und Tiefe für die übrigen Kapitel festlegen.
2. **PR „Skript: Formen, Symmetriegerüste, Zonen“** (4.2–4.4)
3. **PR „Skript: Tracht und Habitus, Blickrichtungen, hexagonale Achsen“** (4.5–4.7), Links aus der App ins Skript
4. **Release v1.3.0**

## 9. Entscheidungen (18.10.2026)

1. **Druck/PDF:** vorerst nicht; später je nach Ergebnis und Interesse der Studierenden.
2. **Tiefe:** anschaulich, mit wenigen Formeln.
3. **Vierstellige Richtungen [uvtw]:** nicht im Skript (nicht Teil der Vorlesung).
4. **Aufträge „Selbst ausprobieren“:** nein.
5. **Begriffe:** Projektionsrichtung, Umkugel, ⟨210⟩ (Abschnitt 7).
