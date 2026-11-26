// Start der App: Einrichtung (PIN, Bilder-Codes), Startseite mit zwei Türen, Bilder-Code, Eltern-PIN.
import { h, knopf, zeige, welt, dialog } from './ui.js';
import { ladeZustand, z, sichere, KINDER, KIND_INFO, ROLLE, APP_VERSION, holeBank, namenFehlen, schuljahr, klasseHeute } from './zustand.js';
import { bitteDauerhaft, istHomescreen } from './speicher.js';
import { setzeTempo, sprich } from './sprache.js';
import { zeigeKind } from './kind.js';
import { zeigeEltern } from './eltern.js';
import { zeigeTour, ungeseheneNews, zeigeNews, pruefeUpdate } from './hilfe.js';
import { FUCHS, TELESKOP } from './welten.js';

export const BILDER = ['🐶', '🍎', '🚀', '🌻', '🐢', '⚽', '🎈', '🦋', '🍦'];

// PIN wird nur als Prüfwert gespeichert (nicht im Klartext)
export function pinHash(pin) {
  let x = 2166136261 >>> 0;
  const s = 'lernapp|' + pin + '|' + z().erstellt;
  for (let r = 0; r < 500; r++) for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i) + r; x = Math.imul(x, 16777619) >>> 0; }
  return x.toString(16);
}

function start() {
  ladeZustand();
  setzeTempo(z().sprachTempo || 0.9);
  if (!z().gesehen.news) { z().gesehen.news = APP_VERSION; sichere(); }
  bitteDauerhaft().then(ok => { z().dauerhaft = ok; sichere(); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  pruefeUpdate();
  setTimeout(() => holeBank(), 30); // Aufgabenbank vorbereiten
  if (!z().pin) return einrichten();
  if (namenFehlen()) return kinderEintragen(zeigeStart, true);
  zeigeStart();
}

// ---------- Einrichtung beim ersten Start ----------
function einrichten() {
  welt(null);
  zeige(h('h1', null, 'Willkommen in der Lern-App'), h('p', null, 'Diese App ist für zwei Kinder. Zuerst richtest du (als Elternteil) alles ein: eine Eltern-PIN, die Namen und Klassen der Kinder und für jedes Kind einen Bilder-Code.'),
    h('p', { class: 'leise' }, 'Alle Daten bleiben auf diesem Gerät. Es gibt kein Konto.'),
    knopf('Los geht’s', () => pinFestlegen(() => kinderEintragen(() => bildcodeFestlegen('insel', () => bildcodeFestlegen('sternwarte', einrichtungFertig)))), 'breit'));
}
// Namen und Klassen der Kinder – nur auf dem Gerät gespeichert. Auch für ältere Speicherstände ohne Namen.
export function kinderEintragen(weiter, nachtrag = false) {
  welt(null);
  const felder = KINDER.map(k => {
    const K = z().kinder[k];
    const name = h('input', { type: 'text', value: K.name || '', placeholder: 'Name des Kindes', maxlength: 30, autocomplete: 'off', 'aria-label': 'Name des Kindes (' + KIND_INFO[k].welt + ')' });
    const kl = h('select', { 'aria-label': 'Klasse' }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => h('option', { value: n, selected: n === klasseHeute(k) }, n + '. Klasse')));
    return { k, name, kl, el: h('div', { class: 'karte' }, h('h2', null, KIND_INFO[k].welt + ' – ' + ROLLE[k]),
      h('p', { class: 'leise' }, k === 'insel' ? 'Große Knöpfe, alles wird vorgelesen – für ein Kind, das noch nicht sicher liest.' : 'Für ein Kind, das schon selbst liest.'),
      h('label', null, 'Name', name), h('label', null, 'Klasse in diesem Schuljahr', kl)) };
  });
  const fehler = h('p', { class: 'leise', role: 'alert' });
  const ok = knopf('Weiter', () => {
    if (felder.some(f => !f.name.value.trim())) { fehler.textContent = 'Bitte für beide Kinder einen Namen eintragen.'; return; }
    for (const f of felder) { const K = z().kinder[f.k]; K.name = f.name.value.trim(); K.klasse = Number(f.kl.value); K.klasseSeit = schuljahr(); }
    sichere(); weiter();
  }, 'breit');
  zeige(h('h1', null, 'Die Kinder'), h('p', null, nachtrag ? 'Neu in dieser Version: Die Namen stehen nicht mehr in der App, sondern nur auf diesem Gerät. Bitte trage sie einmal ein.' : 'Trage die Namen ein. Sie bleiben nur auf diesem Gerät.'), ...felder.map(f => f.el), fehler, ok);
}
function pinFestlegen(weiter) {
  let erst = null;
  const frage = (titel) => pinEingabe(titel, 'Wähle 4 Ziffern, die die Kinder nicht kennen.', (p) => {
    if (erst === null) { erst = p; frage('PIN noch einmal eingeben'); return; }
    if (p !== erst) { erst = null; dialog('Die PINs sind verschieden', h('p', null, 'Bitte noch einmal.')).then(() => frage('Eltern-PIN festlegen')); return; }
    z().pin = pinHash(p); sichere(); weiter();
  });
  frage('Eltern-PIN festlegen');
}
export function pinEingabe(titel, text, fertig, abbrechen) {
  welt(null);
  let pin = '';
  const punkte = h('div', { class: 'punkte' });
  const male = () => { punkte.innerHTML = ''; for (let i = 0; i < 4; i++) punkte.appendChild(h('span', { class: i < pin.length ? 'voll' : '' })); };
  const tippe = (d) => { if (pin.length < 4) pin += d; male(); if (pin.length === 4) { const p = pin; pin = ''; setTimeout(() => { male(); fertig(p); }, 150); } };
  const feld = h('div', { class: 'pinfeld' }, ...'123456789'.split('').map(d => knopf(d, () => tippe(d))), knopf('⌫', () => { pin = pin.slice(0, -1); male(); }, '', { 'aria-label': 'Löschen' }), knopf('0', () => tippe('0')), abbrechen ? knopf('✕', abbrechen, '', { 'aria-label': 'Abbrechen' }) : h('span'));
  male();
  zeige(h('h1', { class: 'mitte' }, titel), h('p', { class: 'mitte leise' }, text), punkte, feld);
}
function bildcodeFestlegen(k, weiter) {
  welt(null);
  let wahl = [];
  const gitter = h('div', { class: 'bildgitter' });
  const punkte = h('div', { class: 'punkte' });
  const male = () => {
    gitter.innerHTML = ''; punkte.innerHTML = '';
    BILDER.forEach((b, i) => gitter.appendChild(knopf(b, () => { if (wahl.length < 3 && wahl.indexOf(i) < 0) { wahl.push(i); male(); } }, wahl.indexOf(i) >= 0 ? 'gewaehlt' : '', { 'aria-label': 'Bild ' + (i + 1) })));
    for (let i = 0; i < 3; i++) punkte.appendChild(h('span', { class: i < wahl.length ? 'voll' : '' }));
    ok.disabled = wahl.length !== 3;
    gewaehlt.textContent = wahl.map(i => BILDER[i]).join(' ');
  };
  const gewaehlt = h('div', { class: 'mitte', style: 'font-size:2em;min-height:1.4em' });
  const ok = knopf('Speichern', async () => {
    const anderes = KINDER.find(j => j !== k && z().kinder[j].bildcode && z().kinder[j].bildcode.join() === wahl.join());
    if (anderes && !(await dialog('Gleicher Code', h('p', null, `${KIND_INFO[anderes].name} hat schon genau diesen Bilder-Code. Dann könnte jedes Kind die Welt des anderen öffnen.`), [{ text: 'Anderen wählen', wert: false }, { text: 'Trotzdem', wert: true, klasse: 'zweit' }]))) { wahl = []; male(); return; }
    z().kinder[k].bildcode = wahl.slice(); sichere(); weiter();
  }, 'breit');
  zeige(h('h1', null, `Bilder-Code für ${KIND_INFO[k].name}`), h('p', null, `Tippe 3 Bilder in einer Reihenfolge. Zeige ${KIND_INFO[k].name} den Code. Damit öffnet das Kind die eigene Welt.`), gitter, punkte, gewaehlt,
    h('div', { class: 'zeile' }, knopf('Neu wählen', () => { wahl = []; male(); }, 'zweit'), ok));
  male();
}
function einrichtungFertig() {
  zeigeStart();
  zeigeTour(() => { if (!istHomescreen()) homescreenHinweis(); });
}
export function homescreenHinweis() {
  return dialog('Auf den Homescreen legen', h('div', null,
    h('p', null, 'So bleibt die App auch ohne Internet da und Safari löscht die Daten nicht nach 7 Tagen:'),
    h('ol', null, h('li', null, 'Unten in Safari auf das Teilen-Symbol (Quadrat mit Pfeil) tippen.'), h('li', null, '„Zum Home-Bildschirm" wählen.'), h('li', null, 'Oben rechts „Hinzufügen" tippen.')),
    h('p', { class: 'leise' }, 'Auf Android: im Browser-Menü (drei Punkte) „Zum Startbildschirm hinzufügen".')));
}

// ---------- Startseite ----------
export function zeigeStart() {
  welt(null);
  const tuer = (k) => h('button', { type: 'button', class: 'tuer ' + k, onclick: () => bildcodeEingabe(k) }, h('span', { html: k === 'insel' ? FUCHS : TELESKOP }), h('span', null, KIND_INFO[k].welt));
  zeige(h('h1', { class: 'mitte' }, 'Wer übt heute?'), h('div', { class: 'tueren' }, ...KINDER.map(tuer)),
    h('div', { class: 'mitte', style: 'margin-top:28px' }, knopf('Eltern', () => pinEingabe('Eltern-PIN', 'Bitte PIN eingeben.', pruefePin, zeigeStart), 'leise')));
  const neu = ungeseheneNews();
  if (neu.length) zeigeNews(neu);
}
let pinFehler = 0;
function pruefePin(p) {
  if (pinHash(p) === z().pin) { pinFehler = 0; return zeigeEltern(); }
  pinFehler++;
  dialog('Falsche PIN', h('p', null, pinFehler >= 3 ? 'Mehrmals falsch. Bitte warte kurz und versuche es dann noch einmal.' : 'Bitte noch einmal.')).then(() => {
    setTimeout(() => pinEingabe('Eltern-PIN', 'Bitte PIN eingeben.', pruefePin, zeigeStart), pinFehler >= 3 ? 10000 : 0);
  });
}
const codeFehler = {}, gesperrtBis = {}; // Befund 15: nach 3 Fehlversuchen kurz warten
function bildcodeEingabe(k) {
  welt(k);
  const K = z().kinder[k];
  if (!K.bildcode) return zeigeKind(k);
  let wahl = [];
  const punkte = h('div', { class: 'punkte' });
  const gitter = h('div', { class: 'bildgitter' });
  const male = () => { punkte.innerHTML = ''; for (let i = 0; i < 3; i++) punkte.appendChild(h('span', { class: i < wahl.length ? 'voll' : '' })); };
  const sperre = (ms) => { gitter.querySelectorAll('button').forEach(b => { b.disabled = true; }); hinweis.textContent = 'Kurz warten …'; setTimeout(() => { if (!gitter.isConnected) return; gitter.querySelectorAll('button').forEach(b => { b.disabled = false; }); hinweis.textContent = ''; }, ms); };
  const hinweis = h('p', { class: 'mitte leise', role: 'status' });
  BILDER.forEach((b, i) => gitter.appendChild(knopf(b, () => {
    if (wahl.length >= 3) return;
    wahl.push(i); male();
    if (wahl.length === 3) {
      const ok = wahl.every((x, j) => x === K.bildcode[j]);
      setTimeout(() => { if (ok) { codeFehler[k] = 0; zeigeKind(k); } else { wahl = []; male(); codeFehler[k] = (codeFehler[k] || 0) + 1; if (codeFehler[k] >= 3) { codeFehler[k] = 0; gesperrtBis[k] = Date.now() + 10000; sperre(10000); } if (k === 'insel') sprich('Das war nicht ganz richtig. Probier es noch einmal.'); } }, 200);
    }
  }, '', { 'aria-label': 'Bild ' + (i + 1) })));
  male();
  zeige(h('div', { class: 'kopf' }, h('div', { class: 'titel' }, KIND_INFO[k].welt), knopf('⌂', zeigeStart, 'symbolknopf', { 'aria-label': 'Zurück' })), h('p', { class: 'mitte' }, k === 'insel' ? 'Tippe deine drei Bilder.' : 'Gib deinen Bilder-Code ein.'), punkte, gitter, hinweis);
  if ((gesperrtBis[k] || 0) > Date.now()) sperre(gesperrtBis[k] - Date.now());
  if (k === 'insel') sprich('Hallo ' + KIND_INFO[k].name + '! Tippe deine drei Bilder.');
}

start();
