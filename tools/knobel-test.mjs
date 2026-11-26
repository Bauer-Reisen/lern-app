// Prüft die Knobel-Aufgaben (Stufe 2) und die Messung: gültige Antworten, Lösung eindeutig, Messung findet das Niveau.
import { KNOBEL_STUFEN, knobelAufgabe } from '../app/js/inhalte/logik.js';
import { knobelAuftrag, knobelVerbuche, knobelBericht } from '../app/js/kern/knobel.js';
import { rngAus } from '../app/js/inhalte/werkzeug.js';
let fehler = 0;
for (const st of KNOBEL_STUFEN) for (let j = 0; j < 200; j++) {
  const a = knobelAufgabe(rngAus('kt', st.id, j), st);
  const ok = a.art === 'wahl' && Array.isArray(a.wahl) && a.wahl.length >= 2 && a.antwort >= 0 && a.antwort < a.wahl.length && new Set(a.wahl).size === a.wahl.length && a.text && a.erklaerung && !/undefined|NaN/.test(a.text + a.wahl.join() + a.erklaerung);
  if (!ok) { fehler++; if (fehler < 5) console.log('Fehler', st.id, JSON.stringify(a)); }
}
// Messung: Kind mit wahrer Stufe w, beginnt bei 20
const sig = (x) => 1 / (1 + Math.exp(-x));
for (const w of [15, 40, 75]) {
  const app = { heute: 0 }; const r = rngAus('sim', w);
  for (let i = 0; i < 60; i++) {
    app.heute = Math.floor(i / 3);
    const { item } = knobelAuftrag(app, 25);
    const p = item.c + (1 - item.c) * sig((w - item.ls) / 8);
    knobelVerbuche(app, item, r.u() < p ? 1 : 0, 5, app.heute);
  }
  const b = knobelBericht(app);
  const gut = Math.abs(b.ls - w) < 15 || (w > 70 && b.ls > 60);
  console.log(`wahr ${w}: gemessen ${b.ls.toFixed(1)} (Spanne ${b.lo.toFixed(0)}–${b.hi.toFixed(0)}) ${gut ? 'ok' : 'FEHLER'}`);
  if (!gut) fehler++;
}
console.log(fehler ? `${fehler} Fehler` : 'Knobel-Test bestanden.');
process.exit(fehler ? 1 : 0);
