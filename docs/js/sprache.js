// Vorlesen mit den Stimmen des Geräts (de-DE, en-GB). Ruft fertig() auf, wenn das Vorlesen endet
// (oder sofort, wenn keine Stimme da ist) – ab dann zählt die Antwortzeit.
let stimmen = [];
let tempo = 0.9;
const hat = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
function ladeStimmen() { try { stimmen = hat() ? window.speechSynthesis.getVoices() || [] : []; } catch (e) { stimmen = []; } }
if (hat()) { ladeStimmen(); try { window.speechSynthesis.addEventListener('voiceschanged', ladeStimmen); } catch (e) { /* alt */ } }

export const hatSprache = hat;
export function setzeTempo(t) { tempo = t; }
export function stimmeFuer(sprache) {
  if (!stimmen.length) ladeStimmen();
  const genau = stimmen.filter(s => s.lang.replace('_', '-').toLowerCase() === sprache.toLowerCase());
  const grob = stimmen.filter(s => s.lang.toLowerCase().indexOf(sprache.slice(0, 2).toLowerCase()) === 0);
  const liste = genau.length ? genau : grob;
  return liste.find(s => /premium|enhanced|erweitert|neural/i.test(s.name)) || liste.find(s => s.localService) || liste[0] || null;
}
export function stopp() { try { if (hat()) window.speechSynthesis.cancel(); } catch (e) { /* nichts */ } }

let laufend = null;
export const LANGSAM = 0.7; // Schildkröten-Knopf: so viel langsamer als das eingestellte Tempo
export function sprich(text, fertig, sprache = 'de-DE', faktor = 1) {
  const rate = Math.max(0.4, tempo * faktor);
  const ende = () => { if (laufend === u) laufend = null; if (fertig) { const f = fertig; fertig = null; f(); } };
  let u = null;
  if (!hat() || !text) { ende(); return false; }
  stopp();
  u = new SpeechSynthesisUtterance(fuerStimme(text));
  u.lang = sprache;
  const st = stimmeFuer(sprache);
  if (st) u.voice = st;
  u.rate = rate;
  u.onend = ende; u.onerror = ende;
  laufend = u;
  // Sicherheitsnetz: manche Geräte melden das Ende nie
  setTimeout(ende, vorleseDauerMs(text, rate));
  try { window.speechSynthesis.speak(u); } catch (e) { ende(); return false; }
  return true;
}

// Geschätzte Vorlesedauer (Sicherheitsnetz, falls das Ende-Ereignis ausbleibt, z. B. iOS): langsameres Tempo → länger
export const vorleseDauerMs = (text, rate = 0.9) => Math.round((1500 + 90 * String(text).length) / Math.min(1, Math.max(0.3, rate)));

// Rechenzeichen vorlesen; x/y nur, wenn kein Buchstabe davorsteht.
// Ohne Lookbehind (?<!…): ältere iPads/iPhones (vor iOS 16.4) kennen das nicht und starten die App sonst gar nicht.
const rechen = (wort) => (m, a, off, str) => (/^[xy]$/.test(a) && off > 0 && /[A-Za-zÄÖÜäöüß]/.test(str[off - 1]) ? m : a + ' ' + wort + ' ');
export function fuerStimme(text) {
  return String(text)
    .replace(/(\d{1,2}):(\d{2})\s*Uhr/g, '$1 Uhr $2')
    .replace(/=\s*[?□]\s*$/g, ' = wie viel?')
    .replace(/[?□](?=\s*[+−–·×:=])/g, 'wie viel')
    .replace(/([+−–·×:=]\s*)[?□]/g, '$1wie viel')
    .replace(/(\d|viel|[xy])\s*[·×]\s*(?=\d|wie|[xy]\b)/g, rechen('mal'))
    .replace(/(\d|viel|[xy])\s*:\s*(?=\d|wie|[xy]\b)/g, rechen('geteilt durch'))
    .replace(/(\d|viel|[xy])\s*[−–]\s*(?=\d|wie|[xy]\b)/g, rechen('minus'))
    .replace(/(\d|viel|[xy])\s*\+\s*(?=\d|wie|[xy]\b)/g, rechen('plus'))
    .replace(/(\d|viel|[xy])\s*=\s*(?=\d|wie|[xy]\b)/g, rechen('ist'))
    .replace(/(\d+)\/(\d+)/g, (m, z, n) => `${z} ${({ 2: 'Halbe', 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 8: 'Achtel', 10: 'Zehntel' })[n] || n + 'tel'}`)
    .replace(/…/g, ' hmm ')
    .replace(/□/g, ' wie viel ')
    .replace(/[☀-➿]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]|️/g, '')
    .replace(/\s+/g, ' ').trim();
}
