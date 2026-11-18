// Gemeinsame Dateien in eine App übernehmen: eine Kopie mit fester Version, kein Build-Schritt.
//
//   node tools/sync.mjs <App-Ordner>                     (im Ordner crystallography-common)
//   node tools/common/sync.mjs <crystallography-common>   (im Ordner der App)
//
// Kopiert css/, js/, fonts/ nach <App>/lib/common/ (wird veröffentlicht) und tools/ nach <App>/tools/common/
// (nur für die Entwicklung). Vorhandene Kopien werden ersetzt. lib/common/MANIFEST.json hält Version, Commit
// und eine Prüfsumme je Datei fest; tools/common/check.mjs prüft damit, dass die Kopie unverändert ist.
// Übernehmen nur von einem Release-Tag (git checkout vX.Y.Z); bei anderem Stand warnt das Werkzeug.
//
// Rechenkern symcrys (#99), im Ordner der App:
//
//   node tools/common/sync.mjs --kern <symcrys-X.Y.Z.tgz>   (Paket aus dem Release auf GitHub)
//   node tools/common/sync.mjs --kern ../symcrys            (Checkout eines Tags, mit npm run build gebaut)
//
// Kopiert die JavaScript-Dateien und Typen (.js, .d.ts) aus dist/ nach <App>/lib/kern/, ohne die Verweise auf
// Source-Maps, dazu die Lizenz als LICENSE.txt; lib/kern/MANIFEST.json hält Version, Herkunft und Prüfsummen fest,
// check.mjs prüft auch diese Kopie. Massgebend ist das Paket aus dem Release von symcrys auf GitHub; seine Prüfsumme
// steht im Manifest. Erst ab dieser Version von common kennt tools/common/sync.mjs die Option --kern.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Was wohin kommt (Quelle im gemeinsamen Repository → Ziel in der App). */
export const TEILE = [
  { quelle: 'css', ziel: 'lib/common/css' },
  { quelle: 'js', ziel: 'lib/common/js' },
  { quelle: 'fonts', ziel: 'lib/common/fonts' },
  { quelle: 'tools', ziel: 'tools/common' },
];
export const MANIFEST = 'lib/common/MANIFEST.json';

/** @param {string} p */
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
/**
 * Alle Dateien unter dir, sortiert.
 * @param {string} dir
 * @returns {string[]}
 */
export function dateien(dir) {
  return readdirSync(dir).sort().flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });
}
/** Ausgabe eines git-Befehls; null, wenn er scheitert. @param {string} cwd @param {...string} args */
const git = (cwd, ...args) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
};

/** Version des gemeinsamen Repositories (js/version.js). @param {string} quelle */
export function versionVon(quelle) {
  const m = readFileSync(join(quelle, 'js/version.js'), 'utf8').match(/COMMON_VERSION = '([^']+)'/);
  if (!m) throw new Error(`keine COMMON_VERSION in ${join(quelle, 'js/version.js')}`);
  return m[1];
}

/**
 * Kopie anlegen; gibt das Manifest zurück.
 * @param {string} quelle
 * @param {string} app
 */
export function sync(quelle, app) {
  quelle = resolve(quelle);
  app = resolve(app);
  if (!existsSync(join(quelle, 'js/version.js'))) throw new Error(`${quelle} ist kein Ordner von crystallography-common`);
  if (!existsSync(join(app, 'index.html'))) throw new Error(`${app} sieht nicht nach einer App aus (index.html fehlt)`);
  const version = versionVon(quelle);
  const commit = git(quelle, 'rev-parse', 'HEAD');
  const tag = git(quelle, 'describe', '--tags', '--exact-match');
  const sauber = git(quelle, 'status', '--porcelain') === '';
  /** @type {Record<string, string>} */
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

/** Ordner der Kopie von symcrys in einer App und ihr Manifest. */
export const KERN = 'lib/kern';
export const KERN_MANIFEST = 'lib/kern/MANIFEST.json';
/** Was aus dist/ von symcrys in die App kommt: der Code und seine Typen (Source-Maps nicht, src/ fehlt dort). */
export const istKerndatei = (/** @type {string} */ p) => p.endsWith('.js') || p.endsWith('.d.ts');
/**
 * Inhalt einer Datei von symcrys ohne den Verweis auf ihre Source-Map (letzte Zeile `//# sourceMappingURL=…`),
 * weil die Maps nicht mitkommen; sonst meldeten Browser und Editor eine fehlende Datei.
 * @param {string} text
 */
export const ohneSourceMap = (text) => text.replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n');

/**
 * symcrys in eine App übernehmen: aus einem Paket `symcrys-X.Y.Z.tgz` (Release auf GitHub, `npm pack`) oder aus
 * einem Checkout mit gebautem `dist/`. Gibt das Manifest und Warnungen zurück.
 * @param {string} quelle
 * @param {string} app
 */
export function syncKern(quelle, app) {
  quelle = resolve(quelle);
  app = resolve(app);
  if (!existsSync(join(app, 'index.html'))) throw new Error(`${app} sieht nicht nach einer App aus (index.html fehlt)`);
  const paket = quelle.endsWith('.tgz');
  let wurzel = quelle;
  let tmp = null;
  if (paket) {
    if (!existsSync(quelle)) throw new Error(`${quelle} fehlt`);
    tmp = mkdtempSync(join(tmpdir(), 'symcrys-'));
    // relativ zum Ordner des Pakets: GNU tar (z. B. aus Git for Windows) liest „C:…“ sonst als Rechnernamen
    execFileSync('tar', ['-xzf', basename(quelle), '-C', tmp], { cwd: dirname(quelle), stdio: ['ignore', 'ignore', 'inherit'] });
    wurzel = join(tmp, 'package'); // npm pack legt alles unter package/ ab
  }
  try {
    const pkgDatei = join(wurzel, 'package.json');
    if (!existsSync(pkgDatei)) throw new Error(`${quelle} ist kein Paket oder Ordner von symcrys (package.json fehlt)`);
    /** @type {{ name: string, version: string }} */
    const pkg = JSON.parse(readFileSync(pkgDatei, 'utf8'));
    if (pkg.name !== 'symcrys') throw new Error(`${quelle} ist nicht symcrys (Paket ${pkg.name})`);
    const dist = join(wurzel, 'dist');
    // alles prüfen, bevor die alte Kopie gelöscht wird
    for (const f of [join(dist, 'index.js'), join(dist, 'version.js'), join(wurzel, 'LICENSE')]) {
      if (!existsSync(f)) throw new Error(`${f} fehlt${f.endsWith('.js') && !paket ? ' (im Checkout erst npm run build)' : ''}`);
    }
    const warn = [];
    // dist/version.js nennt die Version, aus der dist gebaut wurde. Sie ändert sich nur mit einem Release, ein
    // veralteter Build fällt so also nur über Versionen hinweg auf; massgebend ist deshalb das Paket des Release.
    const gebaut = readFileSync(join(dist, 'version.js'), 'utf8').match(/VERSION = '([^']+)'/)?.[1];
    if (gebaut !== pkg.version) warn.push(`dist/ ist aus Version ${gebaut ?? '?'} gebaut, package.json nennt ${pkg.version}: neu bauen.`);
    const commit = paket ? null : git(wurzel, 'rev-parse', 'HEAD');
    // Ein Paket nennt keinen Tag: npm pack aus main heisst gleich wie das des Release. Die Prüfsumme im Manifest
    // lässt sich mit dem Paket im Release auf GitHub vergleichen.
    const tag = paket ? null : git(wurzel, 'describe', '--tags', '--exact-match');
    if (!paket) {
      if (tag !== `v${pkg.version}`) warn.push(`Stand ist nicht der Release-Tag v${pkg.version} (Tag: ${tag ?? 'keiner'}).`);
      if (commit && git(wurzel, 'status', '--porcelain') !== '') warn.push('symcrys hat ungespeicherte Änderungen.');
    }
    const ziel = join(app, KERN);
    rmSync(ziel, { recursive: true, force: true });
    mkdirSync(ziel, { recursive: true });
    /** @type {Record<string, string>} */
    const files = {};
    for (const p of dateien(dist).filter(istKerndatei)) {
      const z = join(ziel, relative(dist, p));
      mkdirSync(dirname(z), { recursive: true });
      writeFileSync(z, ohneSourceMap(readFileSync(p, 'utf8')));
    }
    cpSync(join(wurzel, 'LICENSE'), join(ziel, 'LICENSE.txt'));
    for (const p of dateien(ziel)) files[relative(app, p).split('\\').join('/')] = sha(p);
    const manifest = {
      name: 'symcrys',
      version: pkg.version,
      tag,
      commit,
      quelle: paket ? basename(quelle) : 'Checkout',
      ...(paket ? { paketSha256: sha(quelle) } : {}),
      files,
    };
    writeFileSync(join(app, KERN_MANIFEST), JSON.stringify(manifest, null, 2) + '\n');
    return { manifest, warn };
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

// Aufruf von der Kommandozeile: Ziel ist das Argument; läuft das Skript in einer App (tools/common/), ist das
// Argument die Quelle.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const hier = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  if (process.argv[2] === '--kern') {
    const quelle = process.argv[3];
    if (!quelle || existsSync(join(hier, 'js/version.js'))) {
      console.error('Aufruf im Ordner der App: node tools/common/sync.mjs --kern <symcrys-X.Y.Z.tgz | symcrys-Ordner>');
      process.exit(2);
    }
    const { manifest, warn } = syncKern(quelle, resolve(hier, '..'));
    console.log(`symcrys ${manifest.version} (${manifest.quelle}) nach ${KERN}: ${Object.keys(manifest.files).length} Dateien.`);
    for (const w of warn) console.warn(`Warnung: ${w}`);
    process.exit(0);
  }
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
