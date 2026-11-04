// ESLint (LEITFADEN.md, Abschn. 9): npx eslint .  (in der CI der Job „lint“; Pakete in tools/common/eslint-basis.mjs)
import basis from './tools/common/eslint-basis.mjs';

// three.js ist Fremdcode (wie in der CodeQL-Konfiguration ausgenommen)
export default basis({ ignores: ['lib/three.bundle.js'] });
