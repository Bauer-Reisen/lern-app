// Hilfsfunktionen für alle Vorlagen: Zufall mit festem Startwert, Zahlen schreiben, Namen.
import { erzeugeRng, mischSeed } from '../kern/rng.js';

export function rngAus(...teile) {
  const r = erzeugeRng(mischSeed(...teile));
  r.zahl = (lo, hi) => lo + Math.floor(r.u() * (hi - lo + 1)); // ganze Zahl lo..hi
  r.mischen = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r.u() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  r.einige = (arr, k) => r.mischen(arr).slice(0, k);
  return r;
}

// Deutsche Zahlschreibweise: 1234567 -> "1 234 567" (schmales Leerzeichen ab 5 Stellen), Dezimal mit Komma
export function zf(x) {
  if (typeof x !== 'number') return String(x);
  const neg = x < 0; let v = Math.abs(x);
  let s = Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6).replace('.', ',');
  const [ganz, nach] = s.split(',');
  let g = ganz;
  if (ganz.length >= 5) g = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + g + (nach ? ',' + nach : '');
}

// Eingabe des Kindes in Zahl umwandeln ("0,75", "1 200", "-3")
export function leseZahl(s) {
  if (s == null) return NaN;
  const t = String(s).replace(/[\s ]/g, '').replace('−', '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
// Zahlwort bis 99 (für das Transfer-Merkmal „Zahl als Wort"); sonst null
export function zahlwort(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return null;
  if (n < 20) return EINER[n];
  const z = Math.floor(n / 10), e = n % 10;
  if (!e) return ZEHNER[z];
  return (e === 1 ? 'ein' : EINER[e]) + 'und' + ZEHNER[z];
}

export const NAMEN = [
  ['Lena', 'f'], ['Tim', 'm'], ['Mia', 'f'], ['Ben', 'm'], ['Emma', 'f'], ['Paul', 'm'], ['Lea', 'f'], ['Jonas', 'm'],
  ['Sophie', 'f'], ['Felix', 'm'], ['Hanna', 'f'], ['Noah', 'm'], ['Ella', 'f'], ['Luis', 'm'], ['Clara', 'f'], ['Anton', 'm'],
  ['Frieda', 'f'], ['Emil', 'm'], ['Marie', 'f'], ['Oskar', 'm'], ['Ida', 'f'], ['Karl', 'm'], ['Nele', 'f'], ['Theo', 'm'],
];
export function person(rng, ausser = []) {
  const frei = NAMEN.filter(n => !ausser.includes(n[0]));
  const [name, g] = rng.waehle(frei);
  return { name, g, er: g === 'f' ? 'sie' : 'er', Er: g === 'f' ? 'Sie' : 'Er', ihr: g === 'f' ? 'ihr' : 'ihm', sein: g === 'f' ? 'ihre' : 'seine' };
}
export const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function ggT(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
export function kgV(a, b) { return a / ggT(a, b) * b; }

// Mehrfachauswahl aus richtiger Lösung + Ablenkern (eindeutig, gemischt). Liefert {wahl, antwort(index)}
export function auswahl(rng, richtig, ablenker) {
  const eindeutig = [];
  for (const a of ablenker) if (a !== richtig && !eindeutig.includes(a)) eindeutig.push(a);
  const opts = rng.mischen([richtig, ...eindeutig.slice(0, 3)]);
  return { wahl: opts, antwort: opts.indexOf(richtig) };
}
