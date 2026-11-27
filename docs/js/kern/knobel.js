// Zusatzbereiche (Stufe 2: Logik und Knobeln, Geometrie und Daten): eigene, einfache Messung je Bereich,
// getrennt von Mathe und Lesen (beeinflusst deren Werte nicht).
// Elo auf der Lernstufen-Skala: p = c + (1 - c) * sig((ls_Kind - ls_Aufgabe) / S). Ziel p ≈ 0,70, jede 5. Aufgabe leicht.
// Zustand liegt in app.knobel (KN) bzw. app.geo (GE) und wird mit dem Alltag gespeichert.
import { KNOBEL_STUFEN, knobelAufgabe } from '../inhalte/logik.js';
import { GEO_STUFEN, geoAufgabe } from '../inhalte/geometrie.js';
import { RS_STUFEN, rsAufgabe } from '../inhalte/rechtschreibung.js';
import { EN_STUFEN, enAufgabe } from '../inhalte/englisch.js';
import { WW_STUFEN, wwAufgabe } from '../inhalte/welt.js';
import { rngAus } from '../inhalte/werkzeug.js';

export const ZUSATZ = {
  KN: { feld: 'knobel', teil: 'knobel', name: 'Logik und Knobeln', stufen: KNOBEL_STUFEN, erzeuge: knobelAufgabe },
  GE: { feld: 'geo', teil: 'geo', name: 'Geometrie und Daten', stufen: GEO_STUFEN, erzeuge: geoAufgabe },
  RS: { feld: 'rs', teil: 'rs', name: 'Rechtschreibung', stufen: RS_STUFEN, erzeuge: rsAufgabe },
  EN: { feld: 'en', teil: 'en', name: 'Englisch', stufen: EN_STUFEN, erzeuge: enAufgabe },
  WW: { feld: 'ww', teil: 'ww', name: 'Wissen und Welt', stufen: WW_STUFEN, erzeuge: wwAufgabe },
};
// Einmal-Erklärung je Aufgabenart (mit Beispiel): erklärt nur das Format, nicht die Lösung
const KARTEN = {
  'KN:folge': 'So geht’s: Die Bilder wiederholen sich in einem Muster. Beispiel: 🍎 ⭐ 🍎 ⭐ 🍎 … als Nächstes kommt ⭐.',
  'KN:analogie': 'So geht’s: Zwei Dinge gehören auf eine bestimmte Art zusammen. Finde das Ding, das genauso zum dritten passt. Beispiel: Vogel → fliegt, so wie Fisch → schwimmt. Bei Zahlen: 2 → 4 (plus 2), so wie 5 → 7.',
  'KN:matrix': 'So geht’s: In jeder Zeile gilt dieselbe Rechen-Regel. Finde sie in den vollen Zeilen und rechne damit die letzte aus. Beispiel: 2 | 3 | 5 und 4 | 1 | 5 – die dritte Zahl ist die Summe der ersten beiden.',
  'KN:schluss': 'So geht’s: Nimm nur, was in den Sätzen steht – nicht, was du sonst weißt. „Kann man nicht wissen“ heißt: Aus den Sätzen folgt es nicht sicher.',
  'KN:reihe': 'So geht’s: Stell dir die Kinder in einer Reihe vor, vom größten zum kleinsten. Beispiel: Lea ist größer als Ben, Ben größer als Mia → Lea, Ben, Mia.',
  'GE:koordinaten': 'So geht’s: Jeder Platz im Gitter hat zwei Zahlen. Zuerst die Zahl oben über der Spalte, dann die Zahl links neben der Zeile. Beispiel: (3|2) heißt Spalte 3, Zeile 2.',
  'GE:drehen': 'So geht’s: Rechts herum geht es Norden → Osten → Süden → Westen. Eine Vierteldrehung ist ein Schritt, eine halbe Drehung zwei Schritte.',
  'GE:massstab': 'So geht’s: 1 : 1 000 heißt: 1 cm auf der Karte sind 1 000 cm in echt, also 10 m.',
  'GE:zentral': 'So geht’s: Erst die Zahlen der Größe nach sortieren. Beispiel: 7, 2, 9 → 2, 7, 9. Die Mitte ist 7, die Spannweite ist 9 − 2 = 7.',
  'EN:hoerBild': 'So geht’s: Tippe auf 🔊 und hör das englische Wort. Dann tippe auf das passende Bild. Du darfst so oft hören, wie du willst.',
  'EN:sprechen': 'Für Erwachsene: Das Kind hört das Englische und spricht es laut nach. Danach tippt ein Erwachsener, wie gut es geklappt hat: „Gut gesagt“, „Fast“ oder „Noch üben“. Ohne Erwachsenen bitte „Weiß ich noch nicht“ tippen.',
  'EN:grammatik': 'So geht’s: In dem englischen Satz fehlt ein Wort (…). Wähle die Form, die richtig passt.',
  'RS:dass': 'So geht’s: Kannst du „dieses“ oder „welches“ einsetzen? Dann schreibt man „das“. Sonst „dass“.',
};
const S = 8;          // Lernstufen je Logit
const ZIEL = 0.70;
const sig = (x) => 1 / (1 + Math.exp(-x));
const pRichtig = (lsKind, lsAuf, c) => c + (1 - c) * sig((lsKind - lsAuf) / S);

export function zusatzStand(app, key, lsStart) {
  const f = ZUSATZ[key].feld;
  if (!app[f]) app[f] = { ls: lsStart, n: 0, tage: [], verlauf: [], nr: 0, zuletzt: [] };
  return app[f];
}

// Nächste Aufgabe (Auftrag im Format des Alltags: {item, teil})
export function zusatzAuftrag(app, key, lsStart) {
  const Z = ZUSATZ[key], K = zusatzStand(app, key, lsStart);
  K.nr++;
  const leicht = K.nr % 5 === 0;
  // Schwierigkeit, bei der p ≈ ZIEL (mit c = 1/4): sig(d/S) = (ZIEL - c)/(1 - c)
  const c = 0.25, q = (ZIEL - c) / (1 - c);
  const ziel = leicht ? K.ls - 15 : K.ls - S * Math.log(q / (1 - q));
  const r = rngAus(Z.feld, K.nr, Math.round(K.ls * 10));
  const kand = Z.stufen.map(st => ({ st, d: Math.abs(st.ls - ziel) + 4 * r.u() + (K.zuletzt.includes(st.id) ? 6 : 0) })).sort((a, b) => a.d - b.d);
  const st = kand[0].st;
  K.zuletzt = [st.id, ...K.zuletzt].slice(0, 3);
  K.nutz = K.nutz || {}; K.nutz[st.id] = (K.nutz[st.id] || 0) + 1;
  const a = Z.erzeuge(r, st);
  const karte = KARTEN[key + ':' + st.art]; if (karte) a.karte = karte;
  const item = { id: Z.feld + ':' + st.id + '#' + K.nr, skala: key, vorlage: Z.feld + '-' + st.art, ls: st.ls, c: a.wahl ? 1 / a.wahl.length : 0, a };
  return { item, teil: Z.teil };
}

// Antwort verbuchen. t in Sekunden, tag = App-Tag (Zahl)
export function zusatzVerbuche(app, item, x, t, tag) {
  const K = app[ZUSATZ[item.skala].feld]; if (!K) return;
  const p = pRichtig(K.ls, item.ls, item.c);
  const geraten = !x && t < 1.5;            // sehr schnell und falsch: kaum gewertet
  const w = geraten ? 0.25 : 1;
  const kls = Math.max(2, 16 / (1 + 0.1 * K.n));
  K.ls = Math.max(0, Math.min(100, K.ls + w * kls * ((x ? 1 : 0) - p)));
  K.n++;
  if (!K.tage.includes(tag)) K.tage.push(tag);
  const letzte = K.verlauf[K.verlauf.length - 1];
  if (letzte && letzte[0] === tag) letzte[1] = Math.round(K.ls * 10) / 10; else K.verlauf.push([tag, Math.round(K.ls * 10) / 10]);
}

// Für den Elternbereich: Lernstufe mit grober Spanne (wird mit mehr Aufgaben enger)
export function zusatzBericht(app, key) {
  const K = app && app[ZUSATZ[key].feld]; if (!K || K.n === 0) return null;
  const breite = Math.max(4, 30 / Math.sqrt(1 + K.n / 4));
  return { name: ZUSATZ[key].name, ls: K.ls, lo: K.ls - breite, hi: K.ls + breite, n: K.n, tage: K.tage.length, grob: K.n < 20 || K.tage.length < 3 };
}

// Nachschub-Bedarf (für den Elternbereich): Decke erreicht oder feste Fragenlisten oft wiederholt
const FESTE_LISTEN = new Set(['WW', 'RS', 'EN']);
export function nachschubZusatz(app) {
  const out = [];
  for (const [key, Z] of Object.entries(ZUSATZ)) {
    const K = app && app[Z.feld]; if (!K || K.n < 15) continue;
    const maxLs = Math.max(...Z.stufen.map(s => s.ls));
    if (K.ls >= maxLs - 6) out.push(`${Z.name}: oberste Stufe fast erreicht (Kind LS ${Math.round(K.ls)}, schwerste Aufgabe LS ${maxLs}) – schwerere Aufgaben nötig`);
    if (FESTE_LISTEN.has(key)) for (const [id, n] of Object.entries(K.nutz || {})) if (n >= 30) out.push(`${Z.name}: Stufe ${id} schon ${n}-mal dran – mehr Fragen dieser Stufe nötig`);
  }
  return out;
}

// Kurzformen für Knobeln (ältere Aufrufe und Tests)
export const knobelStand = (app, ls) => zusatzStand(app, 'KN', ls);
export const knobelAuftrag = (app, ls) => zusatzAuftrag(app, 'KN', ls);
export const knobelVerbuche = (app, item, x, t, tag) => zusatzVerbuche(app, item, x, t, tag);
export const knobelBericht = (app) => zusatzBericht(app, 'KN');
