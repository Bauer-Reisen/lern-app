// App-Zustand: Profile, Einstellungen, Test und Lernalltag je Kind. Alles bleibt auf dem Gerät.
import { baueBank } from './bank.js';
import { lade, speichere, zuJson, ausJson, belebe } from './speicher.js';
import { Einstiegstest } from './kern/test.js';
import { Alltag } from './kern/hochstufung.js';
import { neuerTest, neuerAlltag, T_APP, H_APP } from './ablauf.js';
import { neuesHeft } from './heft.js';

export const APP_VERSION = '1.12.0';
export const KINDER = ['insel', 'sternwarte'];
// Zwei neutrale Profile: „insel“ (jüngeres Kind: große Knöpfe, alles wird vorgelesen) und „sternwarte“ (älteres Kind).
// Die Namen trägt ein Elternteil bei der Einrichtung auf dem Gerät ein – sie stehen nie im Code.
export const ROLLE = { insel: 'jüngeres Kind', sternwarte: 'älteres Kind' };
export const KLASSE_VORGABE = { insel: 1, sternwarte: 4 };
export const kindName = (k) => (Z && Z.kinder[k] && Z.kinder[k].name) || (k === 'insel' ? 'Insel-Kind' : 'Sternwarte-Kind');
export const KIND_INFO = {
  insel: { get name() { return kindName('insel'); }, welt: 'Die Insel', figur: 'Funki' },
  sternwarte: { get name() { return kindName('sternwarte'); }, welt: 'Die Sternwarte', figur: 'Nova' },
};
// Schuljahr beginnt am 1. September; die Klasse steigt jedes Schuljahr um eins.
export const schuljahr = (d = new Date()) => (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1);
export function klasseHeute(k, d = new Date()) { const K = Z.kinder[k]; return Math.max(1, Math.min(10, (K.klasse || KLASSE_VORGABE[k]) + schuljahr(d) - (K.klasseSeit || schuljahr(d)))); }
export const namenFehlen = () => KINDER.some(k => !Z.kinder[k].name);
// Empfehlungen aus KONZEPT §3 (mit Begründung im Elternbereich)
export const EMPFEHLUNG = {
  insel: { sitzungMin: 10, tagMin: 20, ruhetage: [3, 0], sperreAb: '19:00', zweite: 'eltern', ferienTage: 3, heft: true, heftHinweisMin: 4 },
  sternwarte: { sitzungMin: 18, tagMin: 30, ruhetage: [3, 0], sperreAb: '19:30', zweite: 'frei', ferienTage: 3, heft: true, heftHinweisMin: 4, vorlesen: true },
};

let Z = null, bank = null;
const live = { insel: { test: null, alltag: null }, sternwarte: { test: null, alltag: null } };

export function holeBank() { if (!bank) bank = baueBank(); return bank; }
export function z() { return Z; }

function neuesKind(k) {
  return {
    name: '', klasse: KLASSE_VORGABE[k], klasseSeit: schuljahr(), bildcode: null, phase: 'neu', test: null, testTage: [], testStart: null, testErg: null, testEnde: null,
    alltag: null, alltagStart: null, sitzung: null, verlauf: [], fehler: {}, wcpm: [], belohnungen: [], tagesMinuten: {},
    einstellungen: JSON.parse(JSON.stringify(EMPFEHLUNG[k])), ferien: false, extraSitzung: null, letzteEreignisse: 0, testNeustarts: 0, heft: neuesHeft(),
  };
}
export function ladeZustand() {
  Z = lade();
  if (Z) migriere(Z);
  if (!Z) Z = { version: APP_VERSION, erstellt: new Date().toISOString(), pin: null, kinder: { insel: neuesKind('insel'), sternwarte: neuesKind('sternwarte') }, letzteSicherung: null, gesehen: { tour: false, news: null, hinweise: {} }, sprachTempo: 0.9 };
  for (const k of KINDER) Z.kinder[k] = Object.assign(neuesKind(k), Z.kinder[k] || {}); for (const k of KINDER) Z.kinder[k].einstellungen = Object.assign(JSON.parse(JSON.stringify(EMPFEHLUNG[k])), Z.kinder[k].einstellungen);
  return Z;
}
export function sichere() { return speichere(Z); }
export function ersetzeZustand(neu) { Z = migriere(neu); live.insel = { test: null, alltag: null }; live.sternwarte = { test: null, alltag: null }; ladeZustandNachImport(); sichere(); }
function ladeZustandNachImport() { for (const k of KINDER) Z.kinder[k] = Object.assign(neuesKind(k), Z.kinder[k] || {}); for (const k of KINDER) Z.kinder[k].einstellungen = Object.assign(JSON.parse(JSON.stringify(EMPFEHLUNG[k])), Z.kinder[k].einstellungen); }

// Alte Speicherstände und Sicherungen (bis 1.2.x) hatten die Profil-Schlüssel 'R' und 'I'.
const ALT = { R: 'insel', I: 'sternwarte' };
export function migriere(Z) {
  if (!Z || !Z.kinder) return Z;
  for (const [alt, neu] of Object.entries(ALT)) {
    if (Z.kinder[alt] && !Z.kinder[neu]) {
      const K = Z.kinder[neu] = Z.kinder[alt]; delete Z.kinder[alt];
      if (K.klasseSeit == null) { K.klasse = KLASSE_VORGABE[neu]; K.klasseSeit = 2026; }
      const geh = (o, ges) => {
        if (!o || typeof o !== 'object' || ges.has(o)) return; ges.add(o);
        for (const key of Object.keys(o)) { if (key === 'kind' && o[key] === alt) o[key] = neu; else geh(o[key], ges); }
      };
      geh(K, new Set());
    }
  }
  const hw = Z.gesehen && Z.gesehen.hinweise;
  if (hw) for (const key of Object.keys(hw)) { const n = key.replace(/-(R|I)(-|$)/, (m, a, b) => '-' + ALT[a] + b); if (n !== key) { hw[n] = hw[key]; delete hw[key]; } }
  return Z;
}

// ---------- Engine-Objekte ----------
const rngU = () => Math.random();
export function holeTest(k) {
  const K = Z.kinder[k];
  if (live[k].test) return live[k].test;
  if (K.test) { const { wert } = ausJson(K.test, holeBank()); live[k].test = belebe(Einstiegstest, wert, holeBank(), T_APP, rngU); }
  else { live[k].test = neuerTest(k, holeBank(), rngU, new Date(), klasseHeute(k)); K.testStart = heute(); }
  return live[k].test;
}
export function sichereTest(k) { if (live[k].test) Z.kinder[k].test = zuJson(live[k].test, holeBank()); sichere(); }
export function holeAlltag(k) {
  const K = Z.kinder[k];
  if (live[k].alltag) return live[k].alltag;
  if (K.alltag) { const { wert } = ausJson(K.alltag, holeBank()); live[k].alltag = belebe(Alltag, wert, holeBank(), H_APP, rngU); }
  else { const { wert } = ausJson(K.testErg, holeBank()); live[k].alltag = neuerAlltag(k, holeBank(), wert, rngU); K.alltagStart = heute(); }
  return live[k].alltag;
}
export function sichereAlltag(k) { if (live[k].alltag) Z.kinder[k].alltag = zuJson(live[k].alltag, holeBank()); sichere(); }
export function testFertigMachen(k) {
  const K = Z.kinder[k], T = holeTest(k);
  T.beenden();
  const erg = T.ergebnis();
  K.testErg = zuJson(erg, holeBank());
  K.testEnde = heute();
  K.phase = 'ueben';
  K.test = zuJson(T, holeBank());
  K.alltag = null; live[k].alltag = null;
  K.belohnungen.push({ datum: heute(), art: 'expedition' });
  sichere();
  return erg;
}
export function testErgebnis(k) { const K = Z.kinder[k]; return K.testErg ? ausJson(K.testErg, holeBank()).wert : null; }
export function testNeuStarten(k) {
  const K = Z.kinder[k];
  K.test = null; K.testTage = []; K.testErg = null; K.phase = 'test'; K.sitzung = null; K.testNeustarts++;
  live[k].test = null;
  sichere();
}

// ---------- Datum ----------
export const datumText = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const heute = () => datumText(new Date());
export function tageZwischen(a, b) { const t = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((t(b) - t(a)) / 864e5); }
export const appTag = (k) => (Z.kinder[k].alltagStart ? tageZwischen(Z.kinder[k].alltagStart, heute()) : 0);
