// Hilfen für Tests (#121, Leitfaden Abschn. 4): Querstriche nur in Symbolen aus format.js.

/** Text ohne die Symbole aus format.js (role="img" mit Ansagetext, darin nur Zeichen und .ov). @param {string} s */
export const ohneSymbole = (s) => s.replace(/<span role="img" aria-label="[^"]*">(?:<span class="ov">[^<]*<\/span>|[^<])*<\/span>/g, '');
/** Alle Zeichenketten in einem Wert (Frage, Antworten, Erklärungen …). @param {unknown} v @returns {string[]} */
export const texte = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(texte) : []);
