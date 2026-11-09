# CLAUDE.md – Stereographische Projektion

**Gemeinsame Regeln:** @../crystallography-common/CLAUDE.md (Arbeitsweise, Git, Releases,
gemeinsamer Code, Literaturregeln; bindet seinerseits `LEITFADEN.md` ein). Claude Code lädt beide mit
dieser Datei. Fehlt der Ordner, klonen: `https://github.com/manganite/crystallography-common`.
Aufbau und Link-Adressen der App: `README.md`. Hier steht nur, was zusätzlich für diese App
gilt.

**Zweck:** Stereogramme der Symmetriegerüste der 32 Punktgruppen mit optionalem Objekt in allgemeiner
Lage; Stereogramme einfacher Polyeder in verschiedenen Lagen, skalierbar in Grösse und
Seitenverhältnissen. Live: https://manganite.github.io/stereography/ (wird genutzt; Adressen und Links
stabil halten).

## Entscheidungen (mit Grund)

### Ausrichtung
- **Eigenständig** (28.10.2026): ohne die Vorlesung verständlich. Ersetzt die frühere Ausrichtung
  „Begleitung zur Vorlesung“ (`docs/spezifikation.md`, Stand v1.7.0).
- **Das Skript deckt die App vollständig ab** (27.10.): jeder Fachbegriff aus Infobox, Tooltips,
  Optionen und Beispielen, notfalls als Vertiefung.
- **Didaktik vor Aufwand** (27.10.): Kapitelfolge und Nummern dürfen sich ändern; das Quiz wird
  nachgezogen.
- **Vertiefung statt Haupttext** (28.10.): Themen, die vor allem die App betreffen, eine Nebenrolle
  spielen (z. B. Schoenflies) oder erst später kommen (rhomboedrische Achsen). Ergänzungen passen sich
  in Stil, Niveau und Tiefe dem Skript an. Grundstoff steht im Quiz auf Stufe 2, nicht 3.

### Begriffe
- **Projektionsrichtung** für die Lage des Kristalls; **Blickrichtung** nur für die Symmetrierichtungen
  des HM-Symbols („Lage“ bleibt frei für allgemeine und spezielle Lagen).
- **Umkugel.**
- **Dritte hexagonale Blickrichtung ⟨210⟩** statt ITA ⟨1̄10⟩ (anschaulicher); das Skript nennt die
  ITA-Schreibweise.
- **Enantiomorph = chiral**, in Skript und Tooltip beide Begriffe.
- **Formnamen** nach Borchardt-Ott (Abb. 15.2, Tab. 9.5–9.8), abweichende ITA-Namen in Klammern.
- **Kleber** mit Kleber als erstem Autor zitieren, die vier Bearbeiter als weitere Autoren.

### Bedienung
- **Kein globaler Einfach/Erweitert-Modus** (verdoppelt Zustände und Links).
- **Verzerrung zweistufig** (20.10.): „Symmetrie brechen“ ist der einzige Weg zur Symmetrieänderung,
  darin „Streckung“ oder „Alle Parameter frei“ (zwei unabhängige Wege waren verwirrend).
- **Streckung** nur entlang symmetrieändernder Blickrichtungen: kubisch [001], [111], [110];
  tetragonal [100], [110]; trigonal/hexagonal [100], [210]. Die Projektionsrichtung folgt der Streckung
  nicht. Bei Beispielkristallen ausgeblendet (Zentralabstände würden nicht affin mitgestreckt).
  Umschalten in die trigonale Form im Katalog bewusst nicht umgesetzt.
- **Winkel des Gitters gemeinsam geprüft** (5.11.2026, Thomas): Nicht jede Kombination dreier Winkel
  im Bereich der Regler (60–150°, mit Symmetriebruch 50–150°) ergibt ein Gitter; bisher entstand stillschweigend eine andere Geometrie. Ein Regler
  bleibt deshalb beim letzten gültigen Wert stehen, der Grund steht darunter; so entspricht das Eingestellte
  immer dem Dargestellten. Link mit solchen Winkeln: Winkel der Vorgabe; gespeicherter Zustand: Gitter der Vorgabe. Fast flache
  Zellen sind ausgeschlossen (`GITTER_MIN` in `js/polyhedra.js`: V/(abc) ≥ 0,1).
- **Eine Prüfung für Link und Speicher** (6.11.2026, #96, Leitfaden Abschn. 5.2): `zustandPruefen()` in
  `js/zustand.js` prüft jedes Feld des Zustands, für den Speicher (`ausSpeicher`, mit Übernahme der Stände v2–v4)
  und nach dem Lesen eines Links. Neue Felder gehören dorthin und in `tests/rundlauf.test.mjs`. Zahlen werden
  wie im Link seit jeher auf den nächsten gültigen Wert gesetzt, nach Leitfaden 5.2 (Entscheidung Thomas,
  6.11.2026, crystallography-common#84).
- **Bereiche der Gitterregler je Modus** (8.11.2026, Thomas, #100, #106): „Alle Parameter frei“ übernimmt das
  gestreckte Gitter, und das lag oft ausserhalb der Regler (c/a bis 0,125 bzw. 6, γ bis 53,13°). Statt das Gitter
  beim Umschalten zu begrenzen (der Kristall spränge) sind die Bereiche mit Symmetriebruch weiter: c/a 0,125–6,
  Winkel 50–150°, so weit wie eine Streckung des unverzerrten Gitters kommt; unverzerrt bleibt es bei c/a 0,25–3
  und 60–150° (gleiche Bereiche hätten das Problem nur verschoben: c/a = 6, s = 0,5 ergäbe 12). b/a 0,4–3 überall,
  im Link wie am Regler. Eine Quelle: `GITTER_BEREICH` in `js/polyhedra.js` für Regler, Link und Speicher; der
  Speicher setzt auch das freie Gitter in seine Bereiche. b/a und c/a mit logarithmischem Regler (Wert ln x), damit
  der übliche Bereich trotz 0,125–6 fein einstellbar bleibt; `aria-valuetext` nennt den Wert. Fallstrick: Die
  Schritte des Reglers zählen ab ln(Minimum) und treffen 1 nicht; der Wert wird deshalb auf 0,01 gerundet wie im
  Link, und der bewegte Regler wird danach nicht neu gesetzt (`reglerWert`, `syncLatSliders` in `js/main.js`).
- **Einrasten** des Ausgangspols immer (Achse 4°, Spiegelebene 3°), kein Schalter.
- **Bildexport** (24.10.): Stereogramm als Kopie (PNG), SVG, PNG (2048 px); 3D als Kopie und PNG. Kein
  Formatmenü; auf dem Telefon kein Export.
- **Beispielkristalle** sind nur Voreinstellungen; keine frei hinzufügbaren Formen. Eigene Indizes und
  freie Kombinationsformen bewusst zurückgestellt.
- **Startgruppe** mm2. **Erste Schritte je Modus** (4.11.2026, Issue #77): „Kristallformen“ nach Borchardt-Ott
  Abschn. 5.4 (Galenit); „Punktgruppen“ an 4*mm* (allgemeine und spezielle Lage, Händigkeit, Blick entlang [001]).
  Wer die App zum ersten Mal öffnet, sieht also zuerst die Schritte zu „Punktgruppen“. Die Handlungen bleiben
  Aktionen der App, auch für die Hilfeseite (Thomas, 8.11.2026, crystallography-common#24): Sie wählen Flächen und Ansichten,
  die nicht in der Adresse stehen, und zeigen auf dem Telefon die passende Tafel; die Bilder bekommen ihren Zustand
  über `bild`. Über Link-Adressen gäbe es auf der Hilfeseite „In der App zeigen“, dafür ginge das verloren.
- **Experimente, eigener Abschnitt** (7.11.2026, Thomas, crystallography-common#87): Lernexperimente
  (vermuten, ausprobieren, erklären) stehen im Abschnitt „Experimente“; die „Erste Schritte“ bleiben die
  vier Bedienschritte je Modus, mit derselben Mechanik aus `lib/common/js/ablauf.js`. Texte in
  `js/hilfetexte.js`; `tests/ablauf.test.mjs` prüft die Pol- und Flächenzahlen, die Lage der Pole (oben,
  unten, Grundkreis), Formen und Formnamen gegen `pointgroups.js` und `forms.js`. Neue Aussagen dort mitprüfen.
  Ausbau (8.11.2026, Thomas, #115): alle Ideen, die ohne neue Bedienelemente gehen (Ideen aus dem Kursmaterial);
  je Modus in der Reihenfolge des Skripts (Anker des ersten Schritts), bis die Liste nach Kapitel gegliedert ist
  (crystallography-common#107). Was neue Bedienelemente bräuchte, steht in #115.
- **Erzeugte Experimente** (7.11.2026, Thomas, #114, crystallography-common#92): Code in `js/experimente.js`
  (keine Datendatei, weil die Aufgaben aus Rechnungen entstehen). Die Frage nennt das Element so, wie es die App
  zeigt: Ein Pol auf einer 4̄-, 3̄- oder 6̄-Achse liegt „auf einer 4̄-Achse“, auch wenn ihn nur der Drehanteil
  festhält (die Erklärung sagt das). Polzahl: alle Lagen aller Gruppen ab 4 Operationen, gleicher Wortlaut nur
  einmal (z. B. die drei 2-zähligen Achsen von 222). Flächenzahl: ohne die Formen, die die App unter der Gruppe
  ihrer Eigensymmetrie zeigt (z. B. {111} in 432 als Oktaeder von m3̄m), sonst nennte die App eine andere Gruppe als
  die Frage. Die Lagesymmetrie steht in den
  Wyckoff-Tabellen orientiert („..m“, „4m.m“) und so auch in den Erklärungen; `lage()` liest daraus Achse, Zahl der
  Spiegelebenen und Ordnung. Fallstrick: Der Azimut der App zählt von b zur a-Achse (`generalPole`), also
  `atan2(x, y)`.

- **Kontraste der Abbildungen** (9.11.2026, #119, Leitfaden Abschn. 5.4): Das gedämpfte Symmetriegerüst unter den
  Flächenpolen (`geruest=1`) trägt Information (welcher Pol auf welchem Element liegt, Abb. 4.8), gilt also als nötige
  Grafik mit 3 : 1; Deckkraft `GERUEST_GEDAEMPFT` in `js/stereogram.js` (0,75 statt 0,55). Damit gingen Pole auf
  einem Achsensymbol unter, besonders rote auf Gold und Grün (Thomas, 9.11.2026); deshalb haben die Pole über dem
  Gerüst einen schmalen Hof in der Papierfarbe (Thomas wählte ihn unter vier Varianten: 0,55, 0,75 ohne Hof, mit
  breitem und mit schmalem Hof; der breite deckte kleine Symbole zu sehr ab). Erzeugte Zonenfarben ab
  der neunten Zone werden so dunkel bzw. hell gewählt, dass ihre Beschriftung auf Papier und `--surface` (Kenndaten)
  4,5 : 1 hat (`zoneColor` in `js/scene.js`). Beides prüft `tests/farben.test.mjs`. Die Tönung der Fläche in Abb. 1.1
  ist 14 %, weil Beschriftungen auf ihr liegen (bei 20 % 4,47 : 1). Als stützend unter 3 : 1 belassen: Tönungen mit
  eigenem Umriss (Abb. 1.1, 8.5, 11.5), Hilfslinien (Abb. 1.4, 2.1, 2.4) und die weisse Füllung des Inversionssymbols.

### Kristallformen
- **Aufstellung B im Formenmodus** (v1.12.0): 312, 31m, 3̄1m, 4̄m2, 6̄2m. Erzeugte Quizfragen bleiben
  auf Aufstellung A.
- **Formauswahl ohne „Flächensymmetrie zeigen“**: je Punktgruppe die allgemeine Form und die Formen mit der
  Punktgruppe als Eigensymmetrie; dazu die Formen, deren Eigensymmetrie zu einem anderen Kristallsystem gehört,
  unter ihrer Gruppe im Katalog (8.11.2026, Thomas, #118). Das betrifft nur das trigonale und das hexagonale
  Prisma im trigonalen System (Eigensymmetrie 6̄2m bzw. 6/mmm); sie erschienen vorher nirgends, und ein Link auf
  sie zeigte die Vorgabe. Pedion und Pinakoid (Eigensymmetrie ∞m, ∞/mm) bleiben bewusst nur mit „Flächensymmetrie
  zeigen“; ein Link ohne `muster=1` zeigt die Vorgabe des Systems (`formListed` in `js/scene.js`).
- **Monoklin** mit eindeutiger Achse b (Aufstellung „monoklin c“ im Formenmodus: Issue #58).
- **Hexagonal** standardmässig (hkl), (hkil) zuschaltbar; [uvtw] nicht.
- **Quarz** nach Kleber S. 70–71 (Abb. 1.70): {101} ist das grosse Rhomboeder. Links/Rechts ist nicht
  einheitlich benannt; das Skript sagt das.

### Skript
- **Kapitelfolge** (28.10.): 1 Indizes, 2 Projektion, 3 Symmetrieoperationen/Punktgruppen,
  4 Symmetriegerüste (mit Symmetriesätzen), 5 Blickrichtungen, 6 Formen, 7 Zonen, 8 Tracht/Habitus,
  9 trigonal/hexagonal; Vertiefungen 10 Lagen, 11 Verzerrungen. Projektion vor Symmetrie, weil Kap. 3
  die Operationen am Stereogramm zeigt.
- **Bezeichnungen:** unmarkierter Text = „Grundstoff“; Kasten in Kap. 10 und 11 = „Voraussetzungen“;
  spätere Themen = „Strukturkristallographie“ mit Lehrbuchverweis.
- Keine Aussage zur Klausur; keine Aufträge „Selbst ausprobieren“.
- **Wachstumsregel** als Tendenz; Ausnahmen allgemein mit „den konkreten Bedingungen, unter denen ein
  Kristall wächst“ begründen (Formulierung Thomas).
- **Pentagondodekaeder:** Kantenlänge hängt von h : k ab; regelmässig nur beim Goldenen Schnitt, also
  kristallographisch ausgeschlossen. Hoffmann S. 271 („eine Seite kürzer“) gilt nur für h : k < 1,618.

### Quiz
- **Räumliche Bilder** als feste SVG-Zeichnungen, nicht drehbar (Moodle, offline, Tests; Lagefragen
  nicht durch Drehen lösbar). Blickrichtung [3, −1, 1,5]: a zum Betrachter, b nach rechts, 25° von oben
  (die 3D-Standardansicht liegt nur 15° neben [111]).
- Kubische Symmetriegerüste ausser 23 nur als Stereogramm (als Zeichnung zu dicht); 23 fällt mangels
  Ablenker weg.
- **Zähligkeit um die Projektionsrichtung** muss in räumlichen Zeichnungen erkennbar sein (z. B.
  Rhombendodekaeder mit `&blick=45,30`). Würfel mit [111] bzw. [110] senkrecht nie zusammen in einer
  Frage (`aehnlich`).
- **Link und Frage passen zusammen:** „In der App öffnen“ zeigt genau, wonach gefragt wird, und
  widerspricht der Antwort nicht.
- **Erklärungen** lassen sich aus dem verlinkten Skriptabschnitt herleiten; was fehlt, kommt ins Skript.
- **Offene Formen** in Bildfragen wie in der App, mit grau ergänzter Form.
- **Prüfung und Rückmeldungen** in der gemeinsamen Fragenliste (`CLAUDE.md` von common, Abschnitt
  „Quiz“); diese App liefert ihre Fragen über `tools/quiz-quelle.mjs`.
- **Vorschau der App** (nicht öffentlich, angelegt 4.11.2026): Artifact
  https://claude.ai/artifact/3zax7EQn7ngSiQtqABDevW; Ablauf in der `CLAUDE.md` von common, Abschnitt
  „Vorschau einer App“.
- **Daten getrennt vom Code** (6.11.2026, #75, Leitfaden Abschn. 9): Datendateien sind `punktgruppen.js`
  (Kenndaten der Punktgruppen, Systeme), `formen.js` (Formtypen, Flächenzahlen, Prismen, Schreibweise der Eigensymmetrie, Formen je Punktgruppe),
  `aufstellungen.js`, `examples.js`, `quiz-bank.js`, `hilfetexte.js`. Die Erzeugenden der Punktgruppen
  (`ERZEUGENDE` in `pointgroups.js`) und der Aufbau des Katalogs mit Kennung und Stelle (`forms.js`) sind
  Code; Kennungen und Reihenfolge des Katalogs sind Schnittstelle (Links `f=…`). Je Fall entschieden, bleibt
  im Code: `HOLOHEDRY`, `LATTICE_DEFAULTS`, `FREE_PARAMS`, `STRETCH_DIRS`, `GITTER_BEREICH` in `polyhedra.js`
  (Rechengrundlagen und Voreinstellungen der App, an die Gitterparameter gebunden; `GITTER_BEREICH` folgt aus
  den Streckungen), `SKRIPT_ANCHORS` in `skriptlinks.js`
  (Zuordnung zur Seite, von `tests/skript.test.mjs` geprüft), die Vektoren in `pointgroups.js`,
  `ALT_SETTINGS` in `sitesym.js` (bewusst zweite, unabhängige Angabe nach ITA, gegen die die Tests den
  Katalog prüfen), `DEFAULT_ENTRY` in `scene.js` (Startform je System, Voreinstellung der App), die Tabellen
  in `quiz-gen.js` (Wortlisten und Auswahl des Generators, kein Fachinhalt), `VIEW_FAMILIES` in `scene.js`
  (Ansichten der 3D-Konstruktion; doppelt mit `symmetryDirections()`, Vereinheitlichung #111). `PRISMEN` und
  die Schreibweise der Eigensymmetrie (`EIG_SCHREIBWEISE`, vorher zweimal als `EIG_ALIAS` und `EIG_SAME`)
  stehen in `formen.js`. Weitere Texte
  in `main.js` (Kenndaten, Hinweise) gehören zu #104. `hilfe-daten.js` ist Code, keine Datendatei (Wahl beim Umsetzen,
  8.11.2026): Sie stellt Modi, Erste Schritte und Experimente für die Hilfeseite zusammen; App und Hilfeseite nehmen
  die Liste `EXPERIMENTE` von dort.

### Familie
- **`blick=1–3` als allgemeiner Link-Parameter** (31.10.): plane-groups verlinkt damit die 10 polaren
  Punktgruppen, die den 10 ebenen entsprechen (z. B. Pedion mit Flächenmuster von oben ohne Umkugel).
  Diese Link-Form ist Schnittstelle und bleibt stabil.

## Konventionen

- **Speicher im Browser, nie umbenennen:** `stereo-state` (Zustandsversion 4; ältere werden umgerechnet),
  `stereo-intro` (Wert: gesehene Modi, z. B. `pg,poly`; `zu` bis v1.12.1 gilt als `poly`), `stereo-sections`, `stereo-explain`; Quiz `stereo-quiz-v1`, `-entwurf`, `-lauf`; Stand der Experimente `stereo-experimente` (bleibt beim Zurücksetzen wie das Quiz). Jeder Eintrag heisst `stereo-…` (Leitfaden Abschn. 5.2, „Alle Einstellungen zurücksetzen“).
- **Cache des Service Workers:** `stereogramm-<Version>`.
- **Stabile Kennungen in Links:** `-43m:c38` = {112}, `-43m:c39` = {221} (wie in v1.0.0). Alte `phi=`
  (Zählung ab ↓, Gegenuhrzeigersinn) werden umgerechnet; `rho=` über 90° gilt weiter.
- **Weitere Link-Schlüssel:** `str=<Richtung>,<Faktor>` (immer im Modus „Streckung“, auch bei s = 1,
  ohne Beispiel; fehlt `str`, liest der Parser `br=1` als „Alle Parameter frei“, `js/scene.js`);
  `zonen=u,v,w;…` (nur mit `w=zone`); `pole=0`, `ns=0`, `bsp=`, `ab=`, `hkil=1`, `achsen=1`, `blick=`.
  Im Skript zusätzlich `data-view` (oblique/top/side), `data-dirs`, `data-labels="aus"`.
- **Skript-Anker** bleiben gültig (Quiz, Infobox `js/skriptlinks.js` und andere Apps verweisen darauf).
- **Quizfragen** in `js/quiz-bank.js`, Kennung `kapitel-stufe-nr` (z. B. `zon-1-03`); Felder `stufe`,
  `kapitel`, `lernziel` (wörtlich im Skript, Test), `typ`, `frage`, `bild`, `antworten`, `richtig`,
  `erklaerung`, `skript`, `app`, `quelle`, `status`. Generatoren in `js/quiz-gen.js`.
- **Ansicht entlang einer Blickrichtung** (24.10., von Thomas bestätigt 3.11.): zuerst die Richtung
  ∥ Projektionsrichtung, sonst eine ⊥ dazu, sonst die erste; Betrachter immer oben (`viewDirections` in
  `js/scene.js`). Steckt in `blick=1–3` und ist damit Teil der Schnittstelle.

## Fallstricke

- **Deploy:** `deploy.yml` kopiert ausdrücklich `index.html skript.html quiz.html hilfe.html manifest.webmanifest
  sw.js LICENSE js lib icons hilfe`. Neue Ordner oder Seiten dort und in der Offline-Liste von `sw.js`
  ergänzen (ein Test vergleicht beide; v1.3.0 hatte das Skript zuerst nicht veröffentlicht).
- **WebGL-Kontexte:** Browser erlauben nur wenige. Das Skript hält 3D nur nahe dem sichtbaren Bereich
  offen (`View3D.destroy`, Kamera gemerkt).
- **Safari:** Zwischenablage nur mit `ClipboardItem` und Promise. Natives `title` erscheint auf dem iPad
  nicht (deshalb ⓘ).
- **Link zur Laufzeit anwenden** (Experimente): Die Bedienelemente halten Verweise auf `state.pg`,
  `state.poly` und `state.view`. `anwenden` in `js/main.js` liest den Link deshalb in eine Kopie und
  überträgt die Felder mit `Object.assign`, statt die Objekte zu ersetzen; dazu `state.blick`. Danach
  Schalter, Regler, Auswahl (auch das Kristallsystem, das `refreshPolyControls` nicht setzt) neu abgleichen.
- **Vergleich berechneter Stile:** verschobene `<link>` im Kopf ausfiltern (weiteres in der
  `CLAUDE.md` von common).

## Literatur mit Fundstellen

Alle in Thomas' Zotero; Quellen je Kapitel auch in `skript.html`.

- **ITA Vol. A (2006):** 1.4.5 (Symbole); 2.1 (Blickrichtungen); Tab. 2.2.4.1 und 2.2.12 (Reihenfolge im
  orientierten Symbol); 10.1, Tab. 10.1.2.2 (Formen, Wyckoff-Lagen, Lagesymmetrie, Multiplizität,
  Eigensymmetrie, Grenzformen; Lage 6a „2mm..“ in m3̄), Tab. 10.1.2.3 (Eigen-, Flächensymmetrie);
  10.2.1.1, S. 804 (enantiomorph/chiral).
- **Borchardt-Ott & Sowa (2018):** 3.4.2–3.4.3, S. 14–17 (Miller-Indizes); 3.5, S. 18–21 (Zonen);
  Aufg. 3.6; 5.2, S. 35–36 (Zone, Tracht, Habitus); 5.3, S. 36–39; 5.4, S. 40–43 (Projektion);
  5.5–5.7 mit Tab. 5.1 (φ, ρ); 5.7, S. 50 ff. (Indizierung), S. 54–55 (Einheitsfläche); Aufg. 5.9;
  S. 67–69 (Symmetrieoperation und -element); 6.4, S. 75–78 (Kopplung, Drehinversion,
  Drehspiegelung); 7.1, Abb. 7.12, S. 98 (rhomboedrisch); 7.2, S. 102 (Symmetriesätze); 7.2.3–7.2.6,
  S. 104–109 (Blickrichtungen, Tab. 7.3); Aufg. 7.5; Kap. 8 (Kristallsysteme); 9.1, S. 128–129;
  9.2, S. 142–150 (Formen, Flächensymmetrie, orientiertes Symbol S. 143–144, Lagen in 4/mmm S. 144);
  Tab. 9.4 (Beispiele: Nr. 18 Quarz S. 138, Nr. 19 Turmalin, Nr. 29 Pyrit S. 141); Tab. 9.5–9.8
  (Formnamen); 9.2.2, S. 151; S. 164 (polare Achse); 9.5–9.6, S. 169–171 (Enantiomorphie, optische
  Aktivität, Piezo-, Pyroelektrizität); S. 168 (Pyrit); 9.7, S. 175–176 (Pentagondodekaeder);
  Aufg. 9.8; 10.1, S. 203 (Schraubenachsen); 10.4, S. 214–218 (Punktlagen); 11.2 (Gruppe);
  Abb. 15.2 (Formnamen); Lösungen Kap. 16, S. 373 ff.
- **Hoffmann (2016):** 2.2, S. 42–52 (Miller-Indizes), S. 50–51 (Einheitsfläche); 2.8, S. 85–90
  (rhomboedrische Achsen); Abb. 2.22/2.23 (Dipyramiden); 3.1; 3.2.2, S. 101 und 3.3.2, S. 114
  (Symmetriesätze); 3.2.4; 3.3.3; Abb. 3.20–3.28 (Beispielkristalle); S. 36–37 und 271 (Pyrit);
  S. 125–127 (Magnesium); 6.1.5, S. 203–205 (Punktlagen); 6.4 (Gruppe).
- **Schwarzenbach, *Kristallographie*:** 1.3.2, S. 11–12 (rationale Indizes); 2.2.2 (Gruppe); 2.2.3
  (Operationen erster und zweiter Art); 2.5.3, S. 49 (chiral); 2.5.7 (Laue-Klassen); 2.5.8, S. 61–63
  (Kristallsysteme, trigonal/rhomboedrisch); 2.5.9 (Aufstellungen); 2.9, S. 91 (Calcit).
- **Kleber, Bohm, Klimm, Mühlberg, Winkler, 20. Aufl., De Gruyter 2020** (Zotero A4LNCUIS): Kap. 1
  (indizierte Kristalle aller 32 Punktgruppen); 1.1.2, S. 12; 1.6.5, S. 68 (hR, hP); S. 60 und 412
  (chiral); S. 70–71, Abb. 1.70 (Quarz); S. 79–80, Abb. 1.89m, 1.90 (Pentagondodekaeder, Pyrit);
  1.9.4, S. 102–106 (Besetzungsdichte, Quarz P3₁2); 4.3, S. 280–281, Abb. 4.12 (Kaliumalaun).
- **Weitere:** Fu & Itoh, IntechOpen 2015, Fig. 2 (BaTiO₃); Heaney u. a. 1994 (Links-/Rechtsquarz);
  webmineral (Gips, Turmalin).

## Konzepte

In `docs/`, je mit Statuskopf: `spezifikation.md` (Funktionsbeschreibung bis v1.7.0, ausführlichste Beschreibung der Bedienung), `konzept-skript.md` (v1.3.0, weitgehend überholt), `konzept-quiz.md`,
`konzept-kapitel-lagen.md` (heute Kap. 10), `konzept-vertiefung.md` (Einstufung Grundstoff/Vertiefung,
alte Kapitelnummern mit Zuordnung), `konzept-skript-ergaenzungen.md` (Neuordnung v1.9.0). Das Konzept
der Familie liegt in crystallography-common `docs/konzept-familie.md`.
