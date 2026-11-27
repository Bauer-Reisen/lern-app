// Prüft die Knobel-Aufgaben (Stufe 2) und die Messung: gültige Antworten, Lösung eindeutig, Messung findet das Niveau.
import { KNOBEL_STUFEN, knobelAufgabe } from '../app/js/inhalte/logik.js';
import { GEO_STUFEN, geoAufgabe } from '../app/js/inhalte/geometrie.js';
import { RS_STUFEN, rsAufgabe } from '../app/js/inhalte/rechtschreibung.js';
import { EN_STUFEN, enAufgabe } from '../app/js/inhalte/englisch.js';
import { WW_STUFEN, wwAufgabe } from '../app/js/inhalte/welt.js';
import { zusatzAuftrag, zusatzVerbuche, zusatzBericht } from '../app/js/kern/knobel.js';
import { rngAus } from '../app/js/inhalte/werkzeug.js';
let fehler = 0;
for (const [stufen, erz] of [[KNOBEL_STUFEN, knobelAufgabe], [GEO_STUFEN, geoAufgabe], [RS_STUFEN, rsAufgabe], [EN_STUFEN, enAufgabe], [WW_STUFEN, wwAufgabe]]) for (const st of stufen) for (let j = 0; j < 200; j++) {
  const a = erz(rngAus('kt', st.id, j), st);
  const ok = (a.art === 'wort' ? typeof a.antwort === 'string' && a.antwort.length > 1 : a.art === 'wahl' && Array.isArray(a.wahl) && a.wahl.length >= 2 && a.antwort >= 0 && a.antwort < a.wahl.length && new Set(a.wahl).size === a.wahl.length) && a.text && a.erklaerung && (!a.sprache || a.sprech) && !/undefined|NaN/.test(a.text + (a.wahl || []).join() + a.erklaerung);
  if (!ok) { fehler++; if (fehler < 5) console.log('Fehler', st.id, JSON.stringify(a)); }
}
// Messung: Kind mit wahrer Stufe w, beginnt bei 20
const sig = (x) => 1 / (1 + Math.exp(-x));
for (const key of ['KN', 'GE', 'RS', 'EN', 'WW']) for (const w of [15, 40, 75]) {
  const app = { heute: 0 }; const r = rngAus('sim', w);
  for (let i = 0; i < 60; i++) {
    app.heute = Math.floor(i / 3);
    const { item } = zusatzAuftrag(app, key, 25);
    const p = item.c + (1 - item.c) * sig((w - item.ls) / 8);
    zusatzVerbuche(app, item, r.u() < p ? 1 : 0, 5, app.heute);
  }
  const b = zusatzBericht(app, key);
  const gut = Math.abs(b.ls - w) < 15 || (w > 70 && b.ls > (key === 'KN' ? 60 : 55));
  console.log(`${key} wahr ${w}: gemessen ${b.ls.toFixed(1)} (Spanne ${b.lo.toFixed(0)}–${b.hi.toFixed(0)}) ${gut ? 'ok' : 'FEHLER'}`);
  if (!gut) fehler++;
}
console.log(fehler ? `${fehler} Fehler` : 'Knobel-Test bestanden.');
if (fehler) process.exitCode = 1;
// Nachschub-Erkennung: starkes Kind an der Decke von Wissen und Welt, viele Wiederholungen
{
  const { nachschubZusatz } = await import('../app/js/kern/knobel.js');
  const app = { heute: 0 }; const r = rngAus('nach', 1);
  for (let i = 0; i < 400; i++) { app.heute = Math.floor(i / 5); const { item } = zusatzAuftrag(app, 'WW', 40); zusatzVerbuche(app, item, r.u() < 0.97 ? 1 : 0, 5, app.heute); }
  const nb = nachschubZusatz(app);
  console.log('Nachschub:', nb.length ? nb.slice(0, 2).join(' | ') : 'nichts');
  if (!nb.some(x => /oberste Stufe/.test(x))) { console.log('FEHLER Nachschub: Decke nicht erkannt'); process.exitCode = 1; }
  const leer = nachschubZusatz({ heute: 0 }); if (leer.length) { console.log('FEHLER Nachschub ohne Daten'); process.exitCode = 1; }
}
