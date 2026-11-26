// Heft-Bausteine (Handschrift auf echtem Papier): reine Logik ohne Oberfläche, auch von den Node-Tests benutzt.
// Grund: Freies Schreiben mit der Hand stärkt das Merken (Longcamp 2005; James & Engelhardt 2012).
import { thetaZuLs } from './kern/skala.js';

export const HEFT_NAME = { insel: 'Inselbuch', sternwarte: 'Sternenbuch' };
export const HEFT_HINWEIS_MIN = 4;
export const neuesHeft = () => ({ papier: {}, merk: null, abrufe: [], schreib: { n: 0, richtig: 0 }, rueckblickWoche: null });

// Passt diese Aufgabe als Heft-Aufgabe? Höchstens 1 je Sitzung, nur wenn das Kind sie voraussichtlich lösen kann (P >= 0,75).
export function heftPassend(app, auftrag, kind, zust) {
  if (!auftrag || auftrag.beispiel || zust.heftGemacht) return false;
  const a = auftrag.a;
  if (!a || a.transfer || a.teil === 'kt' || a.teil === 'schluss' || !a.node) return false;
  const sk = a.item.skala, art = a.item.a && a.item.a.art;
  if (kind === 'sternwarte' ? sk !== 'SA' : !(sk === 'RE' || sk === 'SA')) return false;
  if (art === 'wahl' || (a.item.a && a.item.a.fehlt)) return false;
  return app.vorhersage(a) >= 0.75;
}
// Neutrale Zeit für Heft-Antworten: gilt nie als geraten und nie als langsam (keine Zeitwertung).
export function heftNeutralT(app, item, kind) { return Math.max(kind === 'insel' ? item.t0Insel : item.t0Stern, app.tRapid(item) + 1); }

// Bildschirmminuten einer Sitzung: Wanduhr ohne Papierzeit, gedeckelt durch Aufgabenzeit + 5 Min.
export function sitzungsMinuten(startMs, jetztMs, papierMs, zeitSek) {
  const wand = Math.max(0, jetztMs - startMs - (papierMs || 0)) / 60000;
  return Math.min(Math.round(wand), Math.round(zeitSek / 60) + 5);
}

// Wochenschlüssel (Montag der Woche) für den Wochenrückblick
export function wochenSchluessel(d = new Date()) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(m.getDate()).padStart(2, '0')}`;
}
export const RUECKBLICK_FRAGEN = ['Welche Seite gefällt dir am besten?', 'Was davon kannst du jetzt ohne Heft?', 'Was war schwer?'];

// Wörter und Zahlen für die Schreibaufgabe im Insel-Profil, nach Lesestufe (LS, 10 = Anfang Kl. 1)
const WOERTER = [
  ['Oma', 'Opa', 'Mama', 'Papa', 'Ball', 'Hut', 'Sofa', 'Igel', 'Auto', 'Nase'],
  ['Haus', 'Maus', 'Baum', 'Hose', 'Rose', 'Tafel', 'Limo', 'Wolke', 'Insel', 'Fuchs'],
  ['Sonne', 'Schule', 'Fisch', 'Tisch', 'Blume', 'Kerze', 'Kirsche', 'Wasser', 'Schiff', 'Brille'],
  ['Freund', 'Spiel', 'Stern', 'Pferd', 'Fenster', 'Strand', 'Zwerg', 'Kröte', 'Brücke', 'Schwein'],
];
export function schreibAuftrag(app, zufall = Math.random) {
  const lsL = app.bereiche.L ? thetaZuLs(app.bereiche.L.theta, 'L') : 10;
  const lsM = app.bereiche.M ? thetaZuLs(app.bereiche.M.theta, 'M') : 10;
  if (zufall() < 0.3) { const max = lsM < 13 ? 10 : lsM < 17 ? 20 : 100; const zahl = 1 + Math.floor(zufall() * max); return { art: 'zahl', text: String(zahl) }; }
  const stufe = Math.max(0, Math.min(WOERTER.length - 1, Math.floor((lsL - 8) / 3)));
  const l = WOERTER[stufe];
  return { art: 'wort', text: l[Math.floor(zufall() * l.length)] };
}

// Behaltensquote der Merk-Seiten (Ja = 1, Fast = 0,5, Nein = 0); nur Elternbereich, nie Elo.
export function behaltensQuote(abrufe) {
  if (!abrufe.length) return null;
  return abrufe.reduce((s, a) => s + (a.urteil === 'ja' ? 1 : a.urteil === 'fast' ? 0.5 : 0), 0) / abrufe.length;
}

// Texte je nach Art des Inhalts (zahl / wort / rechnung). Eine Stelle für alle Bildschirme und das Vorlesen.
const ART = {
  zahl: { diese: 'diese Zahl', die: 'die Zahl' },
  wort: { diese: 'dieses Wort', die: 'das Wort' },
  rechnung: { diese: 'diese Rechnung mit Ergebnis', die: 'die Rechnung' },
};
export function heftTexte(inhalt, heft = 'Inselbuch') {
  const a = ART[inhalt.art] || ART.wort;
  const zeigen = inhalt.art === 'rechnung' ? `${inhalt.text} ${inhalt.loesung}` : inhalt.text;
  const kurz = inhalt.art === 'zahl' ? 'eine Zahl' : inhalt.art === 'rechnung' ? 'eine Rechnung' : 'ein Wort';
  return {
    zeigen,
    anweisung: `Schreib ${a.diese} ins ${heft}:`,
    vorlesen: `Schreib ${a.diese} ins ${heft}: ${zeigen}`,
    vergleich: `So schreibt man ${a.die}:`,
    abrufFrage: inhalt.art === 'rechnung'
      ? `Letztes Mal hast du diese Rechnung ins ${heft} geschrieben: ${inhalt.text} Was kommt heraus? Sag es oder schreib es.`
      : `Letztes Mal hast du ${kurz} ins ${heft} geschrieben. Hör zu: ${inhalt.text}. Wie schreibt man ${inhalt.art === 'zahl' ? 'sie' : 'es'}? Sag es oder schreib es.`,
    abrufSichtbar: inhalt.art === 'rechnung' ? `${inhalt.text} ?` : `Hör zu und schreib ${a.die}.`,
  };
}
