// Quiz-Seite: Auswahl, Fragen mit sofortiger Rückmeldung, Auswertung, Fortschritt im Browser.
// Die Logik steht in quiz-core.js, die Fragen in quiz-bank.js und quiz-gen.js.

import { buildSVG } from './stereogram.js';
import { palette, stereoForHash } from './scene.js';
import { VERSION } from './version.js';
import { BANK } from './quiz-bank.js';
import { GENERATOREN } from './quiz-gen.js';
import {
  STUFEN, KAPITEL, kandidaten, zaehlen, ziehen, stellen, pruefen,
  SPEICHER, fortschrittAus, leererFortschritt, vermerken, stand,
} from './quiz-core.js';

const $ = (id) => document.getElementById(id);
const START = new URLSearchParams(location.search);
const entwurf = START.has('entwurf');
// Links aus dem Skript („Lernziele prüfen“): quiz.html?kap=4&stufe=1 wählt Kapitel und Stufe vor
const startKap = (START.get('kap') || '').split(',').map(Number).filter((n) => KAPITEL.some((k) => k.nr === n));
const startStufe = Number(START.get('stufe'));
const KANDS = kandidaten(BANK, GENERATOREN, { entwurf });
const ANZ = zaehlen(KANDS);
const BU = ['A', 'B', 'C', 'D', 'E', 'F'];

// ------------------------------------------------------------------ Fortschritt (localStorage, abgesichert)
function laden() {
  try { return fortschrittAus(localStorage.getItem(SPEICHER)); } catch { return leererFortschritt(); }
}
function sichern(p) {
  try { localStorage.setItem(SPEICHER, JSON.stringify(p)); } catch { /* ohne Speicher weiter */ }
}
let fortschritt = laden();

// ------------------------------------------------------------------ Auswahl
const wahl = { stufe: [1, 2, 3].includes(startStufe) ? startStufe : 1, kapitel: null, n: 10 };

function anzahl(stufe, kap) {
  let n = 0;
  for (const k of KAPITEL) if (!kap || kap.includes(k.nr)) for (let s = 1; s <= stufe; s++) n += ANZ[k.nr]?.[s] || 0;
  return n;
}

function zeigeStufen() {
  const box = $('stufen');
  box.innerHTML = '';
  for (const s of [1, 2, 3]) {
    const eigene = KAPITEL.reduce((n, k) => n + (ANZ[k.nr]?.[s] || 0), 0);
    const lab = document.createElement('label');
    lab.className = 'stufe';
    lab.innerHTML = `<input type="radio" name="stufe" value="${s}"${eigene ? '' : ' disabled'}>
      <span class="nr">Stufe ${s}</span><b>${STUFEN[s].name}</b><span class="t">${STUFEN[s].text}</span>
      <span class="n">${eigene ? `${eigene} ${eigene === 1 ? 'Frage' : 'Fragen'}${s > 1 ? `, dazu die der Stufe${s > 2 ? 'n 1 und 2' : ' 1'}` : ''}` : 'folgt'}</span>`;
    box.append(lab);
  }
  if (!KAPITEL.some((k) => ANZ[k.nr]?.[wahl.stufe])) wahl.stufe = [1, 2, 3].find((s) => KAPITEL.some((k) => ANZ[k.nr]?.[s])) || 1;
  box.querySelector(`input[value="${wahl.stufe}"]`).checked = true;
  box.addEventListener('change', (e) => { wahl.stufe = Number(e.target.value); zeigeKapitel(); });
}

function zeigeKapitel() {
  const box = $('kapitel');
  const vorher = new Set([...box.querySelectorAll('input:checked')].map((i) => Number(i.value)));
  if (!box.children.length) startKap.forEach((n) => vorher.add(n));
  box.innerHTML = '';
  for (const k of KAPITEL) {
    const n = anzahl(wahl.stufe, [k.nr]);
    const lab = document.createElement('label');
    lab.className = 'chip';
    lab.title = k.titel;
    const an = n > 0 && (!vorher.size || vorher.has(k.nr));
    lab.innerHTML = `<input type="checkbox" value="${k.nr}"${n ? '' : ' disabled'}${an ? ' checked' : ''}> Kap. ${k.nr} <small>${n ? n : 'folgt'}</small>`;
    box.append(lab);
  }
  // Vorgewähltes Kapitel ohne Fragen in dieser Stufe: alle Kapitel mit Fragen wählen
  if (!box.querySelector('input:checked')) box.querySelectorAll('input:not(:disabled)').forEach((i) => { i.checked = true; });
  aktualisiereStart();
}

function gewaehlteKapitel() {
  return [...$('kapitel').querySelectorAll('input:checked')].map((i) => Number(i.value));
}

function aktualisiereStart() {
  const kap = gewaehlteKapitel();
  $('los').disabled = !kap.length || !anzahl(wahl.stufe, kap);
}

function zeigeStand() {
  const st = stand(KANDS, fortschritt);
  const ul = $('stand');
  ul.innerHTML = '';
  for (const k of KAPITEL) {
    const s = st[k.nr];
    if (!s) continue;
    const li = document.createElement('li');
    li.innerHTML = `<span>${k.nr} ${k.titel}</span><span class="bar"><i style="width:${(100 * s.richtig) / s.gesamt}%"></i></span><span class="z">${s.richtig} von ${s.gesamt}</span>`;
    ul.append(li);
  }
  $('stand-card').hidden = !ul.children.length;
}

// ------------------------------------------------------------------ Laufendes Quiz (nur dieser Tab)
// Das laufende Quiz übersteht so ein Neuladen, den Zurück-Knopf und einen Abstecher in App oder Skript im selben
// Tab (z. B. über die Links im Kopf). Es gilt nur für diesen Tab und endet mit der Auswertung.
const LAUF = 'stereo-quiz-lauf';
function laufSichern() {
  try { sessionStorage.setItem(LAUF, JSON.stringify({ v: 1, runde, gewaehlt: [...gewaehlt], beantwortet })); } catch { /* ohne Speicher weiter */ }
}
function laufLoeschen() {
  try { sessionStorage.removeItem(LAUF); } catch { /* ohne Speicher weiter */ }
}
function laufLaden() {
  try {
    const l = JSON.parse(sessionStorage.getItem(LAUF));
    const r = l?.runde;
    if (l?.v !== 1 || !Array.isArray(r?.fragen) || !Array.isArray(r.antworten) || !(r.i >= 0 && r.i < r.fragen.length)) return null;
    return l;
  } catch { return null; }
}

// ------------------------------------------------------------------ Ablauf
let runde = null; // { fragen: [Frage], i, antworten: [{ key, ok, gewaehlt }] }

function starten(nur = null) {
  const kap = nur ? null : gewaehlteKapitel();
  const auswahl = ziehen(KANDS, { stufe: nur ? 3 : wahl.stufe, kapitel: kap, n: nur ? nur.length : wahl.n, progress: fortschritt, nur });
  if (!auswahl.length) return;
  runde = { fragen: auswahl.map((k) => stellen(k)), i: 0, antworten: [] };
  ansicht('frage-view');
  zeigeFrage();
  laufSichern();
}

function ansicht(id) {
  for (const v of ['start', 'frage-view', 'ende']) $(v).hidden = v !== id;
  window.scrollTo({ top: 0 });
}

/** Stereogramm zu einer Link-Adresse; ohne Markierung des Ausgangspols (sie sähe aus wie ein zweites Polsymbol).
 *  opt.zonenachse = false: Zonenachse weder beschriften noch markieren (sie wäre die Antwort);
 *  opt.klein: grössere Polsymbole für kleine Bilder (Antworten als Stereogramme). */
function stereoSVG(hash, alt, opt = {}) {
  const { scene } = stereoForHash(hash, palette());
  scene.poles = (scene.poles || []).map((p) => ({ ...p, gen: false, selected: false }));
  if (opt.zonenachse === false && scene.zoneList) scene.zoneList = scene.zoneList.map((z) => ({ ...z, label: null, axisMark: false }));
  if (opt.klein) scene.poleScale = 2.2;
  return `<svg viewBox="0 0 520 520" role="img" aria-label="${alt || 'Stereogramm'}">${buildSVG(scene).inner}</svg>`;
}

let gewaehlt = new Set();
let beantwortet = false;

function zeigeFrage() {
  const q = runde.fragen[runde.i];
  const kap = KAPITEL.find((k) => k.nr === q.kapitel);
  gewaehlt = new Set();
  beantwortet = false;
  $('fort').style.width = `${(100 * runde.i) / runde.fragen.length}%`;
  $('zaehler').textContent = `Frage ${runde.i + 1} von ${runde.fragen.length}`;
  $('tag-kap').textContent = `Kap. ${kap.nr} · ${kap.titel}`;
  $('tag-stufe').textContent = `Stufe ${q.stufe}`;
  $('tag-entwurf').hidden = q.status === 'geprüft';
  $('frage').innerHTML = q.frage;
  const mehr = q.typ === 'mehrfach' || q.richtig.length > 1;
  $('mehrfach').hidden = !mehr;
  $('pruefen').hidden = !mehr;
  $('pruefen').disabled = true;
  const fig = $('bild');
  fig.hidden = !q.bild;
  if (q.bild) fig.querySelector('.fig-art').innerHTML = stereoSVG(q.bild, q.bildAlt, q.bildOpt);
  const ul = $('antworten');
  ul.className = `antworten${mehr ? ' mehrfach' : ''}${q.typ === 'text-bild' ? ' bilder' : ''}`;
  ul.innerHTML = '';
  q.antworten.forEach((a, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'antwort';
    b.dataset.i = i;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = q.typ === 'text-bild'
      ? `<span class="bu">${BU[i]}</span><div class="fig-art">${stereoSVG(a.app, a.alt, { ...q.bildOpt, klein: true })}</div>`
      : `<span class="bu">${BU[i]}</span><span>${a}</span>`;
    b.addEventListener('click', () => waehle(i));
    li.append(b);
    ul.append(li);
  });
  $('rueck').hidden = true;
  $('weiter').textContent = runde.i + 1 < runde.fragen.length ? 'Weiter' : 'Zur Auswertung';
}

function waehle(i) {
  if (beantwortet) return;
  const q = runde.fragen[runde.i];
  const mehr = q.typ === 'mehrfach' || q.richtig.length > 1;
  if (!mehr) { gewaehlt = new Set([i]); auswerten(); return; }
  if (gewaehlt.has(i)) gewaehlt.delete(i); else gewaehlt.add(i);
  for (const b of $('antworten').querySelectorAll('.antwort')) b.setAttribute('aria-pressed', String(gewaehlt.has(Number(b.dataset.i))));
  $('pruefen').disabled = !gewaehlt.size;
  laufSichern();
}

function auswerten() {
  const q = runde.fragen[runde.i];
  beantwortet = true;
  const ok = pruefen(q, [...gewaehlt]);
  runde.antworten.push({ key: q.key, ok, frage: q });
  vermerken(fortschritt, q.key, ok);
  sichern(fortschritt);
  zeigeRueckmeldung(q, ok);
  laufSichern();
  $('weiter').focus({ preventScroll: true });
  $('rueck').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/** Markierung der Antworten und Rückmeldung (auch beim Wiederherstellen eines laufenden Quiz). */
function zeigeRueckmeldung(q, ok) {
  for (const b of $('antworten').querySelectorAll('.antwort')) {
    const i = Number(b.dataset.i);
    const r = q.richtig.includes(i);
    b.disabled = true;
    b.setAttribute('aria-pressed', String(gewaehlt.has(i)));
    if (r && gewaehlt.has(i)) b.classList.add('richtig');
    else if (r) b.classList.add('richtig', 'verpasst');
    else if (gewaehlt.has(i)) b.classList.add('falsch');
  }
  $('pruefen').hidden = true;
  const teil = !ok && q.richtig.some((i) => gewaehlt.has(i));
  $('urteil').textContent = ok ? 'Richtig.' : teil ? 'Teilweise richtig.' : 'Nicht richtig.';
  $('rueck').classList.toggle('falsch', !ok);
  // Hinweise zu den gewählten falschen Antworten und zu verpassten richtigen
  const warum = [];
  for (const i of [...gewaehlt].sort()) {
    if (!q.richtig.includes(i) && q.hinweise?.[i]) warum.push(`<p><b>${BU[i]}:</b> ${q.hinweise[i]}</p>`);
  }
  const verpasst = q.richtig.filter((i) => !gewaehlt.has(i));
  if (!ok && verpasst.length) warum.push(`<p>Richtig ${verpasst.length === 1 ? 'ist' : 'sind'} ${verpasst.map((i) => BU[i]).join(' und ')}${q.richtig.length > verpasst.length ? ' ebenfalls' : ''}.</p>`);
  $('warum').innerHTML = warum.join('');
  $('erklaerung').innerHTML = q.erklaerung;
  const kap = KAPITEL.find((k) => k.nr === q.kapitel);
  const links = [`<a href="skript.html#${q.skript || kap.anker}" target="_blank" rel="noopener" title="Öffnet in einem neuen Tab; das Quiz bleibt hier offen">Im Skript nachlesen</a>`];
  if (q.app) links.push(`<a href="index.html${q.app}" target="_blank" rel="noopener" title="Öffnet in einem neuen Tab; das Quiz bleibt hier offen">In der App öffnen</a>`);
  $('links').innerHTML = links.join('');
  $('quelle').textContent = `Quelle: ${q.quelle}`;
  $('rueck').hidden = false;
  $('fort').style.width = `${(100 * (runde.i + 1)) / runde.fragen.length}%`;
}

function weiter() {
  if (runde.i + 1 < runde.fragen.length) { runde.i += 1; zeigeFrage(); ansicht('frage-view'); laufSichern(); return; }
  zeigeEnde();
}

function zeigeEnde() {
  const a = runde.antworten;
  const r = a.filter((x) => x.ok).length;
  $('ergebnis').textContent = `${r} von ${a.length} richtig`;
  const ul = $('ende-kap');
  ul.innerHTML = '';
  for (const k of KAPITEL) {
    const ak = a.filter((x) => x.frage.kapitel === k.nr);
    if (!ak.length) continue;
    const rk = ak.filter((x) => x.ok).length;
    const li = document.createElement('li');
    li.innerHTML = `<span>${k.nr} ${k.titel}</span><span class="bar"><i style="width:${(100 * rk) / ak.length}%"></i></span><span class="z">${rk} von ${ak.length}</span>`;
    ul.append(li);
  }
  const falsch = a.filter((x) => !x.ok);
  const ol = $('falschliste');
  ol.innerHTML = '';
  for (const x of falsch) {
    const kap = KAPITEL.find((k) => k.nr === x.frage.kapitel);
    const li = document.createElement('li');
    li.innerHTML = `${x.frage.frage} <a href="skript.html#${x.frage.skript || kap.anker}" target="_blank" rel="noopener" title="Öffnet in einem neuen Tab; das Quiz bleibt hier offen">Skript →</a>`;
    ol.append(li);
  }
  $('falsch-card').hidden = !falsch.length;
  $('wiederholen').hidden = !falsch.length;
  laufLoeschen();
  ansicht('ende');
  zeigeStand();
}

/** Ein laufendes Quiz dieses Tabs fortsetzen, an derselben Frage und mit der gegebenen Antwort. */
function wiederherstellen() {
  const l = laufLaden();
  if (!l) return;
  runde = l.runde;
  ansicht('frage-view');
  zeigeFrage();
  gewaehlt = new Set(l.gewaehlt);
  const q = runde.fragen[runde.i];
  const letzte = runde.antworten[runde.antworten.length - 1];
  if (l.beantwortet && letzte?.key === q.key) {
    beantwortet = true;
    zeigeRueckmeldung(q, letzte.ok);
  } else {
    for (const b of $('antworten').querySelectorAll('.antwort')) b.setAttribute('aria-pressed', String(gewaehlt.has(Number(b.dataset.i))));
    $('pruefen').disabled = !gewaehlt.size;
  }
}

// ------------------------------------------------------------------ Start
function init() {
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = VERSION; });
  $('vorschau').hidden = !entwurf;
  $('leer').hidden = KANDS.length > 0;
  $('auswahl').hidden = !KANDS.length;
  zeigeStufen();
  zeigeKapitel();
  zeigeStand();
  $('kapitel').addEventListener('change', aktualisiereStart);
  $('auswahl').addEventListener('change', (e) => { if (e.target.name === 'anzahl') wahl.n = Number(e.target.value); });
  $('auswahl').addEventListener('submit', (e) => { e.preventDefault(); starten(); });
  $('pruefen').addEventListener('click', auswerten);
  $('weiter').addEventListener('click', weiter);
  $('abbrechen').addEventListener('click', () => { if (runde?.antworten.length) zeigeEnde(); else { laufLoeschen(); ansicht('start'); zeigeStand(); } });
  $('neu').addEventListener('click', () => { ansicht('start'); zeigeStand(); });
  $('wiederholen').addEventListener('click', () => starten(runde.antworten.filter((x) => !x.ok).map((x) => x.key)));
  wiederherstellen();
  $('reset').addEventListener('click', () => {
    if (!confirm('Den gespeicherten Stand für alle Fragen löschen?')) return;
    fortschritt = leererFortschritt();
    sichern(fortschritt);
    zeigeStand();
  });
  // Tastatur: 1–6 bzw. A–F wählt, Enter prüft oder geht weiter
  document.addEventListener('keydown', (e) => {
    if ($('frage-view').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('a, input, textarea, select')) return;
    const q = runde.fragen[runde.i];
    let i = '123456'.indexOf(e.key);
    if (i < 0) i = 'abcdef'.indexOf(e.key.toLowerCase());
    if (i >= 0 && i < q.antworten.length && !beantwortet && e.key.length === 1) { e.preventDefault(); waehle(i); return; }
    if (e.key === 'Enter' && !e.target.closest('button')) {
      if (beantwortet) { e.preventDefault(); weiter(); }
      else if (gewaehlt.size && !$('pruefen').hidden) { e.preventDefault(); auswerten(); }
    }
  });
  // Farbschema gewechselt: Stereogramme der aktuellen Frage mit den neuen Farben neu zeichnen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ($('frage-view').hidden || !runde) return;
    const q = runde.fragen[runde.i];
    if (q.bild) $('bild').querySelector('.fig-art').innerHTML = stereoSVG(q.bild, q.bildAlt, q.bildOpt);
    if (q.typ === 'text-bild') $('antworten').querySelectorAll('.antwort .fig-art').forEach((el, i) => { el.innerHTML = stereoSVG(q.antworten[i].app, q.antworten[i].alt, { ...q.bildOpt, klein: true }); });
  });
}
init();

// Offline wie die App (derselbe Service Worker)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Betrieb weiter */ });
}
