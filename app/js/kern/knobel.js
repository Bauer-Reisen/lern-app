// Zusatzbereiche (Stufe 2: Logik und Knobeln, Geometrie und Daten): eigene, einfache Messung je Bereich,
// getrennt von Mathe und Lesen (beeinflusst deren Werte nicht).
// Elo auf der Lernstufen-Skala: p = c + (1 - c) * sig((ls_Kind - ls_Aufgabe) / S). Ziel p ≈ 0,70, jede 5. Aufgabe leicht.
// Zustand liegt in app.knobel (KN) bzw. app.geo (GE) und wird mit dem Alltag gespeichert.
import { KNOBEL_STUFEN, knobelAufgabe } from '../inhalte/logik.js';
import { GEO_STUFEN, geoAufgabe } from '../inhalte/geometrie.js';
import { rngAus } from '../inhalte/werkzeug.js';

export const ZUSATZ = {
  KN: { feld: 'knobel', teil: 'knobel', name: 'Logik und Knobeln', stufen: KNOBEL_STUFEN, erzeuge: knobelAufgabe },
  GE: { feld: 'geo', teil: 'geo', name: 'Geometrie und Daten', stufen: GEO_STUFEN, erzeuge: geoAufgabe },
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
  const a = Z.erzeuge(r, st);
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

// Kurzformen für Knobeln (ältere Aufrufe und Tests)
export const knobelStand = (app, ls) => zusatzStand(app, 'KN', ls);
export const knobelAuftrag = (app, ls) => zusatzAuftrag(app, 'KN', ls);
export const knobelVerbuche = (app, item, x, t, tag) => zusatzVerbuche(app, item, x, t, tag);
export const knobelBericht = (app) => zusatzBericht(app, 'KN');
