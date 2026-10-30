// Gemeinsame Dateien in eine App übernehmen: eine Kopie mit fester Version, kein Build-Schritt.
//
//   node tools/sync.mjs <App-Ordner>                     (im Ordner crystallography-common)
//   node tools/common/sync.mjs <crystallography-common>   (im Ordner der App)
//
// Kopiert css/, js/, fonts/ nach <App>/lib/common/ (wird veröffentlicht) und tools/ nach <App>/tools/common/
// (nur für die Entwicklung). Vorhandene Kopien werden ersetzt. lib/common/MANIFEST.json hält Version, Commit
// und eine Prüfsumme je Datei fest; tools/common/check.mjs prüft damit, dass die Kopie unverändert ist.
// Übernehmen nur von einem Release-Tag (git checkout vX.Y.Z); bei anderem Stand warnt das Werkzeug.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Was wohin kommt (Quelle im gemeinsamen Repository → Ziel in der App). */
export const TEILE = [
  { quelle: 'css', ziel: 'lib/common/css' },
  { quelle: 'js', ziel: 'lib/common/js' },
  { quelle: 'fonts', ziel: 'lib/common/fonts' },
  { quelle: 'tools', ziel: 'tools/common' },
];
export const MANIFEST = 'lib/common/MANIFEST.json';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
export function dateien(dir) {
  return readdirSync(dir).sort().flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });
}
const git = (cwd, ...args) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
};

/** Version des gemeinsamen Repositories (js/version.js). */
export function versionVon(quelle) {
  const m = readFileSync(join(quelle, 'js/version.js'), 'utf8').match(/COMMON_VERSION = '([^']+)'/);
  if (!m) throw new Error(`keine COMMON_VERSION in ${join(quelle, 'js/version.js')}`);
  return m[1];
}

/** Kopie anlegen; gibt das Manifest zurück. */
export function sync(quelle, app) {
  quelle = resolve(quelle);
  app = resolve(app);
  if (!existsSync(join(quelle, 'js/version.js'))) throw new Error(`${quelle} ist kein Ordner von crystallography-common`);
  if (!existsSync(join(app, 'index.html'))) throw new Error(`${app} sieht nicht nach einer App aus (index.html fehlt)`);
  const version = versionVon(quelle);
  const commit = git(quelle, 'rev-parse', 'HEAD');
  const tag = git(quelle, 'describe', '--tags', '--exact-match');
  const sauber = git(quelle, 'status', '--porcelain') === '';
  const files = {};
  for (const t of TEILE) {
    const ziel = join(app, t.ziel);
    rmSync(ziel, { recursive: true, force: true });
    mkdirSync(dirname(ziel), { recursive: true });
    cpSync(join(quelle, t.quelle), ziel, { recursive: true });
    for (const p of dateien(ziel)) files[relative(app, p).split('\\').join('/')] = sha(p);
  }
  const manifest = { name: 'crystallography-common', version, tag, commit, files };
  writeFileSync(join(app, MANIFEST), JSON.stringify(manifest, null, 2) + '\n');
  const warn = [];
  if (tag !== `v${version}`) warn.push(`Stand ist nicht der Release-Tag v${version} (Tag: ${tag ?? 'keiner'}).`);
  if (commit && !sauber) warn.push('Das gemeinsame Repository hat ungespeicherte Änderungen.');
  return { manifest, warn };
}

// Aufruf von der Kommandozeile: Ziel ist das Argument; läuft das Skript in einer App (tools/common/), ist das
// Argument die Quelle.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const hier = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const arg = process.argv[2];
  if (!arg) {
    console.error('Aufruf: node tools/sync.mjs <App-Ordner>  bzw. in der App: node tools/common/sync.mjs <crystallography-common>');
    process.exit(2);
  }
  // im gemeinsamen Repository: <hier> ist dessen Wurzel; in einer App: <hier> ist <App>/tools
  const imCommon = existsSync(join(hier, 'js/version.js')) && existsSync(join(hier, 'css/base.css'));
  const [quelle, app] = imCommon ? [hier, arg] : [arg, resolve(hier, '..')];
  const { manifest, warn } = sync(quelle, app);
  console.log(`crystallography-common ${manifest.version} (${manifest.tag ?? manifest.commit?.slice(0, 7) ?? 'ohne git'}) nach ${app}: ${Object.keys(manifest.files).length} Dateien.`);
  for (const w of warn) console.warn(`Warnung: ${w}`);
}
