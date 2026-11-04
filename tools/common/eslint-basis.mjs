// Gemeinsame Regeln für ESLint (LEITFADEN.md, Abschn. 9), CI-Job `lint`. Jedes Repository hat eine eigene
// `eslint.config.mjs`, die diese Basis lädt (in den Apps aus `tools/common/`) und nur Ausnahmen ergänzt.
// ESLint wird wie TypeScript nur für die Prüfung installiert (Befehl in der CI); die Tests bleiben ohne
// Abhängigkeiten.
//
//   npm install --no-save eslint@10.14.0 @eslint/js@10.0.1 globals@17.14.0 && npx eslint .

import js from '@eslint/js';
import globals from 'globals';

/**
 * Konfiguration für ESLint: empfohlene Regeln, Module im Browser, Werkzeuge und Tests in Node.
 * @param {{ ignores?: string[] }} [optionen] zusätzlich nicht geprüfte Pfade (z. B. Fremdcode)
 * @returns {import('eslint').Linter.Config[]}
 */
export default function basis({ ignores = [] } = {}) {
  return [
    // Kopien der gemeinsamen Dateien werden in crystallography-common geprüft, nicht in der App
    { ignores: ['**/node_modules/**', 'lib/common/**', 'tools/common/**', ...ignores] },
    js.configs.recommended,
    {
      languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.browser } },
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      rules: {
        // Ein Unterstrich am Anfang kennzeichnet einen bewusst nicht genutzten Parameter (z. B. in Vorlagen)
        'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      },
    },
    { files: ['**/sw.js'], languageOptions: { sourceType: 'script', globals: { ...globals.serviceworker } } },
    { files: ['**/*.mjs', 'tools/**', 'tests/**'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  ];
}
