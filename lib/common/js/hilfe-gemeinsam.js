// Gemeinsame Texte der Hilfeseite (Leitfaden Abschn. 5.3, #114): was für alle Apps der Familie gleich ist. Datendatei
// (Leitfaden Abschn. 9): nur Literale, HTML erlaubt. Die App ergänzt einen Text mit `HilfeDaten.ergaenzungen[id]`
// oder lässt ihn mit `HilfeDaten.ohne` weg; die Mechanik steht in js/hilfe-seite.js.
//
// Die Hilfeseite erklärt die Bedienung, nicht die Fachinhalte; für diese verweist sie ins Skript.

/** @import { HilfeText } from './hilfe-seite.js' */

/** Überblick: Teile der App und die Familie (eine neue App ergänzt sich dort, Leitfaden Abschn. 10), nach dem Zweck der App. @type {readonly HilfeText[]} */
export const UEBERBLICK = [
  {
    id: 'teile',
    titel: 'App, Skript, Quiz und Hilfe',
    text: `<p>Die <b>App</b> ist eine Werkbank: In der Seitenleiste wählt man, was dargestellt wird, die beiden Tafeln
      zeigen es, die Kenndaten darunter fassen zusammen, was man sieht. Das <b>Skript</b> erklärt die Begriffe und
      Konventionen; jede Abbildung öffnet mit „In der App öffnen“ genau diese Ansicht. Das <b>Quiz</b> übt die Lernziele
      des Skripts in drei Stufen, mit Rückmeldung, Link ins Skript und, wo sinnvoll, in die App. Die <b>Hilfe</b> (diese
      Seite) erklärt die Bedienung. Skript, Quiz und Hilfe („?“) stehen in der Kopfzeile der App.</p>`,
  },
  {
    id: 'familie',
    titel: 'Die App-Familie',
    text: `<p>Die App gehört zu einer Familie von Lern-Apps zur Kristallographie mit derselben Bedienung. Bisher sind
      es <a href="../stereography/">Stereographische Projektion</a> und <a href="../plane-groups/">Symmetrie in der Ebene</a>.
      Wo ein Thema in einer anderen App weitergeht, führt ein Link dorthin, z. B. von einer Ebenengruppe zu ihrer
      Punktgruppe im Stereogramm.</p>`,
  },
];

/** Bedienkonzepte, die in allen Apps gelten (vor denen der App). @type {readonly HilfeText[]} */
export const KONZEPTE = [
  {
    id: 'seitenleiste-tafel',
    titel: 'Seitenleiste, Tafeln und Kenndaten',
    text: `<p>Die <b>Seitenleiste</b> sagt, <em>was</em> dargestellt ist: Gruppe, Objekt und seine Eigenschaften, Gitter,
      Darstellung. Was man <em>mit der Zeichnung tut</em>, steht in der <b>Tafel</b> oder nahe daran, etwa die Werkzeuge
      im Kopf der Tafel. Die <b>Legende</b> unter einer Zeichnung nennt ihre Zeichen und sagt, was ein Klick oder Tippen
      auf die Zeichnung bewirkt. Die <b>Kenndaten</b> unter den Tafeln fassen zusammen, was die Darstellung zeigt, auch
      als Text; Begriffe darin führen ins Skript.</p>`,
  },
  {
    id: 'abschnitte',
    titel: 'Abschnitte, Tooltips und ⓘ',
    text: `<p>Oben in der Seitenleiste steht, was man meist braucht; Weiteres liegt in einklappbaren Abschnitten, unter
      deren Überschrift steht, was sie enthalten. Mit der Maus oder der Tastatur zeigt jedes Bedienelement einen
      <b>Tooltip</b>, einen kurzen Satz zu seiner Funktion. Das <b>ⓘ</b> an einer Überschrift klappt die Erklärungen
      des Abschnitts auf: eine Einleitung und die Sätze aller Bedienelemente, auf jedem Gerät. „Mehr in der Hilfe“ am
      Ende führt an die passende Stelle dieser Seite.</p>`,
  },
  {
    id: 'werkzeuge',
    titel: 'Werkzeuge, Schalter und Handlungen',
    text: `<p>Ein <b>Werkzeug</b> bestimmt, was ein Klick oder Tippen auf die Zeichnung tut, z. B. messen oder zeichnen.
      Von mehreren Werkzeugen ist höchstens eines gewählt; wählt man ein anderes, ist das erste abgewählt. Ein
      <b>Schalter</b> (ein Kontrollkästchen oder ein Knopf, der eingedrückt bleibt) blendet etwas ein oder aus oder
      ändert, wie die App reagiert. Eine <b>Handlung</b> (z. B. Rückgängig, Löschen, Zurücksetzen) wirkt sofort und hat
      keinen eigenen Zustand.</p>`,
  },
  {
    id: 'gesperrt',
    titel: 'Gesperrte Bedienelemente',
    text: `<p>Ein Schalter, der gerade nicht wirken kann, ist blass und gesperrt, bleibt aber gewählt; darunter oder bei
      der Tafel steht kurz, warum (z. B. weil das Kristallsystem einen Winkel festlegt). Fällt der Grund weg, wirkt er
      wieder. Ein Werkzeug, das gerade ausgeschlossen ist, ist abgewählt und gesperrt. Eine Handlung ist gesperrt,
      solange es nichts zu tun gibt, etwa „Rückgängig“ vor der ersten Änderung. Was es für das gewählte Objekt gar
      nicht gibt, fehlt.</p>`,
  },
  {
    id: 'farben',
    titel: 'Zeichen und Farben',
    text: `<p>Die Zeichen der Symmetrieelemente folgen den <i>International Tables for Crystallography</i>. Farben haben
      in allen Apps der Familie dieselbe Bedeutung: Drehachsen bzw. Drehpunkte nach ihrer Zähligkeit, die drei
      Blickrichtungen des Hermann-Mauguin-Symbols (wo man danach färben lässt) und unterscheidbare Formen oder Motive.
      Die Farbe trägt die Bedeutung nie allein; Symbole, Linienarten und die Legende sagen dasselbe. Was die Zeichen
      fachlich bedeuten, erklärt das Skript.</p>`,
  },
  {
    id: 'einstieg',
    titel: 'Erste Schritte und Experimente',
    text: `<p>Beim ersten Aufruf eines Modus führt die Karte <b>„Erste Schritte“</b> in wenigen Schritten durch die
      Bedienung; ein Knopf in jedem Schritt bringt die App in den passenden Zustand. Die Karte lässt sich schliessen und
      erscheint nach „Alle Einstellungen zurücksetzen“ wieder. Der Abschnitt <b>„Experimente“</b> enthält kleine
      Versuche: erst eine Vermutung wählen, dann per Knopf ausprobieren und die Beobachtung mit der Erklärung
      vergleichen. In der Liste heisst ✓, dass die Vermutungen zuletzt zutrafen, ○, dass das Experiment durchgespielt
      wurde; mit ↻ markierte stellen jedes Mal eine neue Aufgabe.</p>`,
  },
];

/** Link, Speicher, offline, Export, Geräte und Tastatur (am Ende der Seite). @type {readonly HilfeText[]} */
export const TECHNIK = [
  {
    id: 'link',
    titel: 'Link auf eine Ansicht',
    text: `<p>Die Adresse der App enthält die Ansicht in lesbarer Form (nach dem Zeichen #). „Link kopieren“ legt sie in
      die Zwischenablage, etwa für Folien, Moodle oder ein Lesezeichen; wer den Link öffnet, sieht genau diese Ansicht.
      Ein Link hat Vorrang vor dem, was der Browser gespeichert hat. Die Apps sind noch in Entwicklung: Ändert sich das
      Format der Adresse, gilt ein alter Link nicht mehr, und die App zeigt ihren Startzustand.</p>`,
  },
  {
    id: 'speicher',
    titel: 'Was die App speichert',
    text: `<p>Die App merkt sich im Browser die letzte Ansicht, je nach App weitere Einstellungen der Seite und den
      Stand von Quiz und Experimenten. Nichts davon verlässt das Gerät; es gibt kein Konto. Ein anderer Browser oder ein anderes Gerät
      beginnt leer. Ändert sich in der Entwicklung das Format, geht der gespeicherte Stand verloren.</p>`,
  },
  {
    id: 'zuruecksetzen',
    titel: 'Zurücksetzen',
    text: `<p>„Zurücksetzen“ in einem Abschnitt stellt nur dessen Einstellungen zurück. „Alle Einstellungen
      zurücksetzen“ ganz unten in der Seitenleiste löscht alles, was die App gespeichert hat, ausser dem Stand von Quiz
      und Experimenten, und lädt sie im Startzustand neu; die Erste Schritte erscheinen wieder.</p>`,
  },
  {
    id: 'offline',
    titel: 'Offline und als Web-App',
    text: `<p>Nach dem ersten Aufruf funktionieren App, Skript, Quiz und Hilfe auch ohne Netz; eine neue Version lädt die
      App beim nächsten Öffnen mit Netz. Über das Menü des Browsers lässt sie sich auf dem Home-Bildschirm ablegen
      (Safari: „Zum Home-Bildschirm“) bzw. als App installieren und dann wie eine App starten. Die App lädt keine
      Schriften oder Skripte von Dritten und sendet keine Daten.</p>`,
  },
  {
    id: 'export',
    titel: 'Bilder exportieren',
    text: `<p>Der Knopf „Export“ im Kopf einer Tafel öffnet ein Menü: „Kopieren (PNG)“ legt das Bild in die
      Zwischenablage, „SVG-Datei speichern“ und „PNG-Datei speichern“ laden es herunter. Was eine Tafel nicht kann,
      fehlt im Menü. Exportiert wird immer in den hellen Farben mit durchsichtigem Hintergrund, auch wenn die App dunkel
      angezeigt wird.</p>`,
  },
  {
    id: 'geraete',
    titel: 'Maus, Touch und Telefon',
    text: `<p>Gedacht sind die Apps für Laptop und iPad; auf dem Telefon lassen sie sich ebenfalls bedienen. Mit der Maus
      erscheint der Tooltip nach kurzem Verweilen; mit Touch steht dieselbe Erklärung im ⓘ. Hinweise, die nur für Maus
      oder Touch gelten, richten sich nach dem zuletzt benutzten Gerät. Auf dem Telefon steht eine Tafel oben, der
      Umschalter in ihrem Kopf wechselt zur anderen; Export und „Link kopieren“ gibt es dort nicht.</p>`,
  },
  {
    id: 'tastatur',
    titel: 'Tastatur und Screenreader',
    text: `<p>Die Tabulatortaste führt durch die Bedienelemente; das Element mit dem Fokus zeigt seinen Tooltip, Escape
      schliesst ihn und ein offenes Menü. Liegt der Fokus auf einem Modus in der Kopfzeile, wechseln die Pfeiltasten den
      Modus, Pos1 und Ende springen zum ersten bzw. letzten. Für Screenreader werden Symbole Zeichen für Zeichen
      angesagt, ein Querstrich als „quer“; die Kenndaten fassen die Darstellung als Text zusammen.</p>`,
  },
];
