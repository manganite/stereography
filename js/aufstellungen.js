// Punktgruppen mit zwei Aufstellungen: Familien, Texte der Tooltips und Bezeichnung A/B im Formenkatalog.
// Datendatei nach Leitfaden Abschn. 9 (Daten getrennt vom Code, #75): nur Literale, die Logik steht in main.js.

/** Punktgruppen mit zwei Aufstellungen in ITA: ein Button je Familie, die Aufstellungen darunter. @type {Record<string, string[]>} */
export const FAMILIEN = {
  '32': ['321', '312'], '3m': ['3m1', '31m'], '-3m': ['-3m1', '-31m'],
  '-42m': ['-42m', '-4m2'], '-6m2': ['-6m2', '-62m'],
};

/** Unterschied der Aufstellungen (Tooltip). @type {Record<string, string>} */
export const AUFSTELLUNG_TIPPS = {
  '321': '2-zählige Achsen entlang a₁, a₂, a₃.',
  '312': '2-zählige Achsen zwischen den a-Achsen (um 30° gedreht).',
  '3m1': 'Spiegelebenen senkrecht zu a₁, a₂, a₃.',
  '31m': 'Spiegelebenen enthalten die a-Achsen (um 30° gedreht).',
  '-3m1': 'Spiegelebenen senkrecht zu a₁, a₂, a₃, 2-zählige Achsen entlang der a-Achsen.',
  '-31m': 'Spiegelebenen enthalten die a-Achsen, 2-zählige Achsen dazwischen.',
  '-42m': '2-zählige Achsen entlang a und b, Spiegelebenen diagonal.',
  '-4m2': 'Spiegelebenen senkrecht zu a und b, 2-zählige Achsen diagonal.',
  '-6m2': 'Spiegelebenen senkrecht zu a₁, a₂, a₃.',
  '-62m': '2-zählige Achsen entlang a₁, a₂, a₃.',
};

/** Monokline Gruppen: eindeutige Achse (Tooltip der Knöpfe b und c). @type {Record<'b' | 'c', string>} */
export const MONO_ACHSE_TIPPS = {
  b: 'Eindeutige Achse b (Standard der International Tables): 2-zählige Achse bzw. Normale der Spiegelebene entlang b.',
  c: 'Eindeutige Achse c: 2-zählige Achse bzw. Normale der Spiegelebene entlang c.',
};

/** Aufstellungen A und B im Formenkatalog (Skript Kap. 5, Tabelle der Aufstellungen). @type {Record<string, 'A' | 'B'>} */
export const AUFSTELLUNG_AB = { 321: 'A', 312: 'B', '3m1': 'A', '31m': 'B', '-3m1': 'A', '-31m': 'B', '-42m': 'A', '-4m2': 'B', '-6m2': 'A', '-62m': 'B' };
