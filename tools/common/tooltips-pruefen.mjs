// Tooltips im Browser prüfen (Leitfaden Abschn. 5.3, #114): Jedes sichtbare Bedienelement hat einen Tooltip, auch
// Elemente ohne `id` (z. B. Segmentknöpfe) und solche, die die App im Code erzeugt (`setTip`). Ergänzt
// `pruefeTooltips` aus js/help.js, das ohne Browser nur Elemente mit `id` in index.html sieht.
//
// Für die Browserläufe der Apps (in der App: tools/common/tooltips-pruefen.mjs), mit einer Seite von Playwright:
//
//   const fehlend = await fehlendeTooltips(page, { ohne: ['#mein-knopf'] });
//
// Ausnahmen nach Leitfaden Abschn. 5.3 (AUSNAHMEN): Links (sie sagen mit ihrem Text, wohin sie führen), Köpfe
// einklappbarer Abschnitte, Schliessen „×“ (Knopf mit aria-label „… schliessen“), Export-Menü, Knöpfe der Experimente und Erste Schritte
// (Liste und laufender Ablauf; ihr Text sagt, was sie tun). Ein Element gilt als erklärt, wenn es selbst oder ein
// Element um es herum `data-tip` trägt (so findet help.js den Tooltip, bei Eingaben z. B. die Zeile `.check`).
// `ohne` nennt weitere Ausnahmen der App als CSS-Selektoren (anders als bei pruefeTooltips, das IDs nimmt).

/** Selektoren der Ausnahmen; ein Element in einem solchen Element ist ebenfalls ausgenommen. */
export const AUSNAHMEN = ['a[href]', 'summary', '.intro-x', 'button[aria-label$="schliessen"]', '.exportknopf', '.exportmenue', '.ablauf-inhalt'];

/**
 * Sichtbare Bedienelemente ohne Tooltip, als kurze Beschreibung („button#id „Text““).
 * aufklappen: alle Abschnitte (details) öffnen, damit auch ihr Inhalt geprüft wird (Standard ja).
 * @param {import('playwright').Page} page
 * @param {{ ohne?: string[], aufklappen?: boolean }} [o]
 * @returns {Promise<string[]>}
 */
export async function fehlendeTooltips(page, { ohne = [], aufklappen = true } = {}) {
  return page.evaluate(({ ausnahmen, aufklappen }) => {
    if (aufklappen) for (const d of document.querySelectorAll('details')) /** @type {HTMLDetailsElement} */ (d).open = true;
    /** @param {Element} e */
    const sichtbar = (e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
    };
    const aus = ausnahmen.join(', ');
    return [...document.querySelectorAll('button, input:not([type="hidden"]), select, textarea')]
      .filter((e) => sichtbar(e) && !e.closest('[data-tip]') && !e.closest(aus))
      .map((e) => {
        const name = (e.getAttribute('aria-label') ?? e.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
        const ort = e.id ? `#${e.id}` : e.closest('[id]') ? ` in #${e.closest('[id]')?.id}` : '';
        return `${e.tagName.toLowerCase()}${ort} „${name}“`;
      });
  }, { ausnahmen: [...AUSNAHMEN, ...ohne], aufklappen });
}
