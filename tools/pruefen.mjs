// Inhaltsprüfung: jede Vorlage über viele Zufallsziehungen, Transfer, Lesefragen, Abdeckung.
// Start: node tools/pruefen.mjs [ziehungenJeStufe=120]
// Die Lösungen werden hier UNABHÄNGIG nachgerechnet (eigener Rechner, eigene Löser), nicht mit dem Code der Vorlagen.
import { VORLAGEN } from '../app/js/inhalte/index.js';
import { rngAus, zahlwort } from '../app/js/inhalte/werkzeug.js';
import { transferAufgabe, transferFaehig, ES_FEHLT_NICHTS } from '../app/js/inhalte/transfer.js';
import { leseTransfer, NICHT_IM_TEXT } from '../app/js/inhalte/lesen.js';
import { baueBank } from '../app/js/bank.js';

const N = Number(process.argv[2]) || 120;
const fehler = [], warn = [];
let ziehungen = 0, tZiehungen = 0, lZiehungen = 0;
const F = (id, msg, a) => { if (fehler.length < 20000) fehler.push(`${id}: ${msg}${a ? '  | ' + JSON.stringify(a).slice(0, 260) : ''}`); };

// ---------- eigener Rechner ----------
function rechne(src) {
  const s = src.replace(/−/g, '-').replace(/·/g, '*').replace(/:/g, '/').replace(/\s/g, '');
  let i = 0;
  const FN = { floor: Math.floor, round: (x, n = 0) => Math.round(x * 10 ** n) / 10 ** n, sqrt: Math.sqrt,
    ggt: (a, b) => { for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d; return 1; },
    kgv: (a, b) => { for (let m = Math.max(a, b); ; m++) if (m % a === 0 && m % b === 0) return m; },
    kpt: (n) => { for (let d = 2; d <= n; d++) if (n % d === 0) return d; return n; },
    kleinereLoesung: (a, b, c) => { const D = b * b - 4 * a * c; return Math.min((-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)); } };
  const peek = () => s[i];
  function prim() {
    if (peek() === '(') { i++; const v = summe(); if (s[i++] !== ')') throw new Error('Klammer'); return v; }
    if (peek() === '-') { i++; return -potenz(); }
    const m = /^[a-zA-Z]+/.exec(s.slice(i));
    if (m) { i += m[0].length; if (s[i++] !== '(') throw new Error('Funktion'); const args = [summe()]; while (peek() === ',') { i++; args.push(summe()); } i++; if (!FN[m[0]]) throw new Error('unbekannt ' + m[0]); return FN[m[0]](...args); }
    const z = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!z) throw new Error('Zahl erwartet bei ' + s.slice(i));
    i += z[0].length; return Number(z[0]);
  }
  function potenz() { const b = prim(); if (peek() === '^') { i++; return b ** potenz(); } return b; }
  function produkt() { let v = potenz(); while ('*/%'.includes(peek()) && peek()) { const o = s[i++]; const w = potenz(); v = o === '*' ? v * w : o === '/' ? v / w : v % w; } return v; }
  function summe() { let v = produkt(); while ((peek() === '+' || peek() === '-')) { const o = s[i++]; const w = produkt(); v = o === '+' ? v + w : v - w; } return v; }
  const v = summe(); if (i !== s.length) throw new Error('Rest: ' + s.slice(i)); return v;
}
const gleich = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b)) || (Math.abs(a - b) <= 0.005 + 1e-9 && Math.abs(Math.round(b * 100) - b * 100) < 1e-6);

// Zahlen in einem Text (Ziffern mit Leerzeichen/Komma, Zahlwörter bis 99)
const WORT = new Map(); for (let n = 2; n <= 99; n++) WORT.set(zahlwort(n), n);
Object.entries({ doppelt: 2, zweimal: 2, dreimal: 3, viermal: 4, fünfmal: 5, sechsmal: 6, siebenmal: 7, achtmal: 8, neunmal: 9, zehnmal: 10, hälfte: 2, halb: 2, drittel: 3, viertel: 4, fünftel: 5, sechstel: 6, achtel: 8, zehntel: 10 }).forEach(([w, n]) => WORT.set(w, n));
function zahlenIm(text) {
  const out = [];
  const t = text.replace(/(\d)[\s  ](?=\d{3}\b)/g, '$1');
  for (const m of t.matchAll(/\d+(?:,\d+)?/g)) out.push(Number(m[0].replace(',', '.')));
  for (const w of t.toLowerCase().split(/[^a-zäöüß]+/)) if (WORT.has(w)) out.push(WORT.get(w));
  return out;
}
const zahlenImAusdruck = (a) => [...a.replace(/\^\d+/g, '').matchAll(/\d+(?:\.\d+)?/g)].map(m => Number(m[0]));

// ---------- unabhängige Beziehungen der Schemata ----------
const BEZ = {
  tg: (w) => w.t1 + w.t2 === w.g, vg: (w) => w.gross - w.klein === w.diff,
  vd: (w) => (w.plus ? w.start + w.delta : w.start - w.delta) === w.ende, gr: (w) => w.anzahl * w.je === w.gesamt,
  gr2: (w) => w.anzahl * w.je + w.extra === w.gesamt, vgm: (w) => w.klein * w.faktor === w.gross,
  ds: (w) => Math.abs(w.w1 * w.m2 - w.w2 * w.m1) < 1e-9, bt: (w) => Math.abs(w.ganzes * w.z - w.teil * w.n) < 1e-9,
  pz: (w) => Math.abs(w.grund * w.satz - w.wert * 100) < 1e-9, gl: (w) => w.a * w.x + w.b === w.c,
};

// ---------- unabhängige Löser fürs Lesen ----------
function logikEigen({ k, regeln, fakten, frage }) {
  // Welten, in denen alle Regeln und Fakten gelten; Ergebnis: immer wahr / immer falsch / beides
  const werte = new Set();
  for (let m = 0; m < 2 ** k; m++) {
    const W = Array.from({ length: k }, (_, j) => Math.floor(m / 2 ** j) % 2 === 1);
    const gilt = regeln.every(R => R.art === 'xor' ? W[R.a] !== W[R.b] : !((R.na ? !W[R.a] : W[R.a]) && !(R.nb ? !W[R.b] : W[R.b])))
      && fakten.every(f => (f.n ? !W[f.p] : W[f.p]));
    if (gilt) werte.add(W[frage]);
  }
  if (!werte.size) return -1;
  return werte.size === 2 ? 2 : werte.has(true) ? 0 : 1;
}
function vergleichEigen(text, frage) {
  // Aus dem TEXT: „A ist größer als B", „B ist kleiner als A", „B ist nicht so groß wie A"
  const kante = [];
  const GEG = { kleiner: 1, jünger: 1, langsamer: 1 };
  for (const satz of text.split('. ')) {
    let m = /^(\S+) ist (\S+) als ([^\s.]+)/.exec(satz);
    if (m) { kante.push(GEG[m[2]] ? [m[3], m[1]] : [m[1], m[3]]); continue; }
    m = /^(\S+) ist nicht so \S+ wie ([^\s.]+)/.exec(satz);
    if (m) { kante.push([m[2], m[1]]); continue; }
    return { fehler: 'Satz nicht erkannt: ' + satz };
  }
  const namen = [...new Set(kante.flat())];
  const ueber = (x) => namen.filter(y => y !== x && erreichbar(y, x)).length; // wie viele sind „mehr" als x
  function erreichbar(a, b) { const st = [a], ges = new Set(); while (st.length) { const v = st.pop(); for (const [p, q] of kante) if (p === v && !ges.has(q)) { if (q === b) return true; ges.add(q); st.push(q); } } return false; }
  const rang = namen.map(x => [x, ueber(x)]);
  const neg = /kleinsten|jüngsten|langsamsten/.test(frage), zweit = /Zweit/.test(frage);
  const ziel = zweit ? 1 : neg ? namen.length - 1 : 0;
  const treffer = rang.filter(([, r]) => r === ziel).map(([x]) => x);
  // eindeutig nur, wenn die Ordnung eine vollständige Kette ist
  const kette = new Set(rang.map(([, r]) => r)).size === namen.length;
  return { treffer, kette };
}
function tabelleEigen(tab, frage) {
  const Z = tab.zeilen.map(z => ({ name: z[0], alter: Number(z[1]), tier: z[2], hobby: z[3] }));
  const T = { Katze: 'Katze', Hund: 'Hund', Hasen: 'Hase' };
  const atom = (s) => {
    s = s.trim(); let m;
    if ((m = /^ist älter als (\d+) Jahre$/.exec(s)) || (m = /^älter als (\d+) Jahre ist$/.exec(s))) { const x = +m[1]; return z => z.alter > x; }
    if ((m = /^ist höchstens (\d+) Jahre alt$/.exec(s))) { const x = +m[1]; return z => z.alter <= x; }
    if (/^(hat kein Haustier|kein Haustier hat)$/.test(s)) return z => z.tier === 'keins';
    if (/^hat ein Haustier$/.test(s)) return z => z.tier !== 'keins';
    if ((m = /^hat (?:eine|einen) (Katze|Hund|Hasen)$/.exec(s)) || (m = /^(?:eine|einen) (Katze|Hund|Hasen) hat$/.exec(s))) { const x = T[m[1]]; return z => z.tier === x; }
    if ((m = /^hat (?:keine|keinen) (Katze|Hund|Hasen)$/.exec(s))) { const x = T[m[1]]; return z => z.tier !== x; }
    if ((m = /^mag nicht (\S+)$/.exec(s)) || (m = /^nicht (\S+) mag$/.exec(s))) { const x = m[1]; return z => z.hobby !== x; }
    if ((m = /^mag (\S+)$/.exec(s)) || (m = /^(\S+) mag$/.exec(s))) { const x = m[1]; return z => z.hobby === x; }
    throw new Error('Bedingung nicht erkannt: ' + s);
  };
  let m;
  if ((m = /^Welches Kind ist älter als (\w+) und (.+)\?$/.exec(frage))) { const ref = Z.find(z => z.name === m[1]); const c = atom(m[2]); return Z.filter(z => z.alter > ref.alter && c(z)); }
  if ((m = /^Welches ist das jüngste Kind, das (.+)\?$/.exec(frage))) { const c = atom(m[1]); const M = Z.filter(c); const min = Math.min(...M.map(z => z.alter)); return M.filter(z => z.alter === min); }
  if ((m = /^Welches Kind (.+) oder (.+) und (.+)\?$/.exec(frage))) { const [a, b, c] = [atom(m[1]), atom(m[2]), atom(m[3])]; return Z.filter(z => (a(z) || b(z)) && c(z)); }
  m = /^Welches Kind (.+)\?$/.exec(frage); const cs = m[1].split(' und ').map(atom); return Z.filter(z => cs.every(c => c(z)));
}

// ---------- Einzelprüfung einer Aufgabe ----------
function pruefeAufgabe(id, a, V, st) {
  const txt = [a.text, a.frage, ...(a.wahl || []), a.erklaerung, a.hinweis].filter(Boolean).join(' ');
  if (/undefined|NaN|null|\[object|Infinity/.test(txt)) F(id, 'kaputter Text', txt);
  { const tt = (a.text || '') + ' ' + (a.frage || ''); if (/ {2}|\s[.,]\D/.test(tt) || (/\s\?/.test(tt) && !/[=:]|Rest|, \?/.test(tt))) F(id, 'Leerzeichenfehler', JSON.stringify(tt)); }
  const p = a.pruef || {};
  if (!Object.keys(p).length) F(id, 'keine Prüfangabe');
  if (a.art === 'zahl') {
    if (typeof a.antwort !== 'number' || !Number.isFinite(a.antwort)) return F(id, 'Antwort keine Zahl', a);
    if (!['re.ganz', 're.gleichung', 're.term', 're.funktion', 're.lgs', 're.klammer'].includes(V.id)) { if (a.antwort < 0) F(id, 'negative Antwort unter Kl. 6', a); }
    if ((st.ls || 99) < 40 && !Number.isInteger(a.antwort)) F(id, 'Dezimalantwort unter Kl. 4', a);
    if (Math.abs(a.antwort) > 1e7) F(id, 'Antwort zu groß', a);
    if (p.ausdruck) { const v = rechne(p.ausdruck); if (!gleich(v, a.antwort)) F(id, `Nachrechnung ${p.ausdruck} = ${v} ≠ ${a.antwort}`); }
    if (p.wert != null && p.wert !== a.antwort) F(id, 'wert ≠ Antwort');
    if (p.zaehlen != null && a.bild && a.bild.typ === 'punkte' && a.bild.n !== a.antwort) F(id, 'Punkte ≠ Antwort');
    if (p.folge) { const f = p.folge; const d = f.map((x, j) => j ? x - f[j - 1] : 0).slice(1); const q = f.map((x, j) => j ? x / f[j - 1] : 0).slice(1);
      const nxt = d.every(x => x === d[0]) ? f[f.length - 1] + d[0] : q.every(x => x === q[0]) ? f[f.length - 1] * q[0] : d.length >= 3 && d.every((x, j) => x === d[j % 2]) ? f[f.length - 1] + d[d.length % 2] : d.slice(1).every((x, j) => x - d[j] === d[1] - d[0]) ? f[f.length - 1] + d[d.length - 1] + (d[1] - d[0]) : null;
      if (nxt == null) warn.push(`${id}: Folge nicht selbst erkannt (${p.art})`); else if (nxt !== a.antwort) F(id, `Folge ergibt ${nxt}`, a); }
    if (p.koepfeBeine) { const [k, b] = p.koepfeBeine; let n = 0, sol; for (let x = 0; x <= k; x++) if (2 * (k - x) + 4 * x === b) { n++; sol = x; } if (n !== 1 || sol !== a.antwort) F(id, 'Köpfe/Beine nicht eindeutig', a); }
    if (p.zaehlenZiffern) { const z = p.zaehlenZiffern; let n = 0; for (const x of z) for (const y of z) if (x !== y && x !== 0) n++; if (n !== a.antwort) F(id, 'Ziffern zählen ' + n); }
    if (p.angaben) { const im = zahlenIm(a.text); for (const v of p.angaben) if (!im.some(x => Math.abs(x - v) < 1e-9)) F(id, `Angabe ${v} fehlt im Text`, a.text);
      if (p.ausdruck) for (const v of zahlenImAusdruck(p.ausdruck)) if (!im.includes(v) && v !== 100 && v !== 2 && v !== 1) F(id, `Zahl ${v} der Rechnung steht nicht im Text`, a.text); }
    if (a.struktur) { const S = a.struktur; if (!BEZ[S.schema](S.w)) F(id, 'Schema-Werte widersprüchlich', S); if (Math.abs(S.w[S.unb] - a.antwort) > 1e-9) F(id, 'Unbekannte ≠ Antwort', S);
      const vals = Object.entries(S.w).filter(([k, v]) => typeof v === 'number' && k !== 'plus').map(([, v]) => v); if (vals.some(v => v <= 0)) F(id, 'Schema-Wert ≤ 0', S); }
  } else if (a.art === 'zahlen') {
    if (!p.ausdruecke || p.ausdruecke.length !== a.antwort.length) return F(id, 'zahlen ohne Ausdrücke');
    p.ausdruecke.forEach((x, j) => { if (!gleich(rechne(x), a.antwort[j])) F(id, `Feld ${j}: ${x} ≠ ${a.antwort[j]}`); });
    if (V.id === 're.rest' && !(a.antwort[1] >= 0 && a.antwort[1] < rechne(p.ausdruecke[0].replace(/^floor\((\d+)\/(\d+)\)$/, '$2')))) F(id, 'Rest zu groß');
  } else if (a.art === 'bruch') {
    const { z, n } = a.antwort; if (!(n > 0) || !Number.isInteger(z) || !Number.isInteger(n)) F(id, 'Bruch ungültig', a.antwort);
    if (p.ausdruckBruch && !gleich(rechne(p.ausdruckBruch), z / n)) F(id, 'Bruchrechnung falsch', a);
    if (p.gekuerzt) { const [z0, n0] = p.bruch; let g = 1; for (let d = 2; d <= Math.min(z, n); d++) if (z % d === 0 && n % d === 0) g = d; if (g !== 1) F(id, 'nicht ganz gekürzt'); if (Math.abs(z0 / n0 - z / n) > 1e-12) F(id, 'Kürzen ändert Wert'); }
    else if (p.bruch && Math.abs(p.bruch[0] / p.bruch[1] - z / n) > 1e-12) F(id, 'Bruch ≠ Prüfwert');
    const m = /^(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)/.exec(a.text); if (m) { const v = m[3] === '+' ? m[1] / m[2] + m[4] / m[5] : m[1] / m[2] - m[4] / m[5]; if (Math.abs(v - z / n) > 1e-12) F(id, 'Text-Bruchrechnung falsch'); }
  } else if (a.art === 'wahl') {
    if (!Array.isArray(a.wahl) || a.wahl.length < 2) return F(id, 'zu wenig Wahl');
    if (new Set(a.wahl).size !== a.wahl.length) F(id, 'doppelte Auswahl', a.wahl);
    if (!(a.antwort >= 0 && a.antwort < a.wahl.length)) return F(id, 'Antwortindex', a);
    const R = a.wahl[a.antwort];
    if (p.richtig != null && p.richtig !== R) F(id, `richtig „${p.richtig}" ≠ gewählt „${R}"`);
    if (p.groesser) { const mx = Math.max(...p.groesser); if (Number(R.replace(/\s/g, '').replace(',', '.')) !== mx) F(id, 'größer falsch'); }
    if (p.teilbar) { const [x, d] = p.teilbar; if (R !== (x % d === 0 ? 'ja' : 'nein')) F(id, 'Teilbarkeit falsch'); }
    if (p.bruchbild) { const [z, n] = p.bruchbild; const wert = (s) => { const q = s.split('/'); return q[0] / q[1]; };
      const gleichwertig = a.wahl.filter(w => /\//.test(w) && Math.abs(wert(w) - z / n) < 1e-12); if (gleichwertig.length !== 1 || gleichwertig[0] !== R) F(id, 'Bruchbild: nicht eindeutig', a.wahl); }
    if (/\d/.test(a.wahl.join('')) && a.wahl.every(w => /^[−-]?[\d\s ,]+$/.test(w))) { const vs = a.wahl.map(w => Number(w.replace(/[\s ]/g, '').replace(',', '.').replace('−', '-'))); if (new Set(vs).size !== vs.length) F(id, 'gleichwertige Zahlen in Auswahl', a.wahl); }
    if (p.logik) { const e = logikEigen(p.logik); if (e !== a.antwort) F(id, `Logik eigen ${e} ≠ ${a.antwort}`, a.text);
      if ((a.text.match(/\./g) || []).length < p.logik.regeln.length + p.logik.fakten.length) F(id, 'Logik: zu wenig Sätze'); }
    if (p.vergleich) { const e = vergleichEigen(a.text, a.frage); if (e.fehler) F(id, e.fehler); else if (!e.kette || e.treffer.length !== 1 || e.treffer[0] !== R) F(id, 'Vergleich nicht eindeutig', { e, R, t: a.text, f: a.frage }); }
    if (p.tabelleZeilen) { try { const k = tabelleEigen(a.tabelle, a.frage); if (k.length !== 1 || k[0].name !== R) F(id, 'Tabelle nicht eindeutig', { k: k.map(z => z.name), R, f: a.frage }); } catch (e) { F(id, e.message); }
      a.prosa.forEach((s, j) => { const z = a.tabelle.zeilen[j]; if (!s.startsWith(z[0] + ' ist ' + z[1] + ' Jahre') || !s.includes(z[3])) F(id, 'Prosa ≠ Tabelle', s); }); }
    if (p.belegsatz) { if (!(a.fakten || []).includes(p.belegsatz)) F(id, 'Belegsatz fehlt'); const bel = p.belegsatz.toLowerCase(); const st4 = (w) => w.toLowerCase().slice(0, Math.min(w.length, Math.max(3, w.length - 3)));
      if (!R.split(' ').filter(w => w.length >= 3).some(w => bel.includes(st4(w)))) F(id, 'Antwort nicht im Belegsatz', { R, b: p.belegsatz });
      for (const w of a.wahl) if (w !== R && w.split(' ').filter(x => x.length >= 3).some(x => new RegExp('(^|[^a-zäöüß])' + st4(x)).test(bel))) F(id, `Ablenker „${w}" steht im Belegsatz`, p.belegsatz); }
    if (p.pronomen) { const verb = a.frage.split(' ')[1]; const satz = a.text.split('. ').find(x => x.includes(' ' + verb + ' ') && /^(Er|Sie) /.test(x)); const pr = satz && /^(Er|Sie)/.exec(satz); if (!pr || p.pronomen[pr[1]] !== R) F(id, 'Fürwort-Zuordnung', a); const g = Object.values(p.pronomen); if (new Set(g).size !== 2) F(id, 'Fürwort: Namen nicht verschieden geschlechtlich'); }
    if (p.reihenfolge) { const idx = p.reihenfolge.map(s => a.text.indexOf(s.split(' ')[0])); void idx; if (!R.includes(p.reihenfolge[p.frageIndex])) F(id, 'Reihenfolge-Antwort passt nicht'); }
    if (p.wortbild && R !== p.wortbild[1] && R !== p.wortbild[0]) F(id, 'Wortbild');
    if (p.anlautBild) { const ok = p.anlautBild.woerter.filter(w => w[0] === p.anlautBild.b); if (ok.length !== 1 || a.wahl[p.anlautBild.woerter.indexOf(ok[0])] !== R) F(id, 'Anlaut-Bild nicht eindeutig', p.anlautBild); }
    if (p.anlaut) { if (p.anlaut[0][0] !== R) F(id, 'Anlaut falsch'); if (a.wahl.filter(w => w === p.anlaut[0][0]).length !== 1) F(id, 'Anlaut doppelt'); }
    if (p.reim) { const end = (w) => w.toLowerCase().replace(/^.*?([aeiouäöü]+[^aeiouäöü]*(e[^aeiouäöü]*)?)$/, '$1'); const z = end(p.reim[0]); const ok = a.wahl.filter(w => w.toLowerCase() !== p.reim[0].toLowerCase() && end(w) === z); if (ok.length !== 1 || ok[0] !== R) F(id, 'Reim nicht eindeutig', { z, w: a.wahl.map(end) }); }
    if (p.bildZaehlen) { const n = a.bild.zeilen[0].split(' ').length; const ZW = { ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, 'fünf': 5 }; const satzN = ZW[a.text.split(' ')[2]]; if ((n === satzN ? 'Ja' : 'Nein') !== R) F(id, 'Bild zählen falsch', a); }
    if (p.bildVergleich) { const [na, nb] = a.bild.zeilen.map(z => z.split(' ').length); const mehr = / mehr /.test(a.text); if (((mehr ? na > nb : na < nb) ? 'Ja' : 'Nein') !== R) F(id, 'Bild vergleichen falsch', a); }
  } else F(id, 'unbekannte Antwortart ' + a.art);
  if (V.sachwissen && !V.quelle) F(id, 'Sachwissen ohne Quelle');
}

// ---------- Transfer ----------
function pruefeTransfer(item, t, kind) {
  let a; try { a = transferAufgabe(item, t, kind, 'pruef'); } catch (e) { return F(item.id, 'Fehler: ' + e.message); }
  t = { ...t, typ: a.typ };
  const id = `${item.id}/${t.typ}${t.d}${kind}`;
  tZiehungen++;
  const txt = [a.text, a.frage, ...(a.wahl || []), a.erklaerung].filter(Boolean).join(' ');
  if (/undefined|NaN|null|\[object/.test(txt)) F(id, 'kaputter Text', txt);
  const st = a.struktur; if (st && st.w && !BEZ[st.schema](st.w)) F(id, 'Schema-Werte widersprüchlich', st);
  if (st && st.w && Object.entries(st.w).some(([k, v]) => typeof v === 'number' && k !== 'z' && k !== 'n' && v < 2)) F(id, 'Wert unter 2 in Geschichte', st.w);
  if (t.typ === 'sort') {
    if (a.pruef.sortRechnung) { const { richtigWert, optionen } = a.pruef.sortRechnung; const ok = optionen.filter(o => gleich(rechne(o), richtigWert)); if (ok.length !== 1 || ok[0] !== a.wahl[a.antwort]) F(id, 'Sortieren (Rechnung) nicht eindeutig', optionen); }
    else { const { refOp, ops, refName, namen } = a.pruef.sortGeschichten; if (ops.filter(o => o === refOp).length !== 1 || ops[a.antwort] !== refOp) F(id, 'Sortieren (Geschichten) nicht eindeutig', ops); if (!namen || namen.filter(n => n === refName).length !== 1) F(id, 'Struktur erkennen: Ablenker mit derselben Struktur', namen); if (new Set(a.wahl).size !== a.wahl.length) F(id, 'doppelte Geschichten'); }
    return;
  }
  const im = zahlenIm(a.text);
  if (t.typ === 'dar') { if (!gleich(rechne(a.pruef.ausdruck), a.antwort)) F(id, 'Balken-Nachrechnung'); const m = a.bild.modell; if (!m || JSON.stringify(m).includes('undefined')) F(id, 'Balkenmodell kaputt'); return; }
  if (t.typ === 'feh') {
    if (!a.fehlt) { F(id, 'fehlende Angabe nicht gebaut'); return; }
    const wert = a.pruef.fehltKey === 'zn' ? st.w.n : st.w[a.pruef.fehltKey];
    const imOhneStoer = zahlenIm(a.saetze.filter(s => !(a.stoerSaetze || []).includes(s)).join(' '));
    if (imOhneStoer.includes(wert) && !Object.entries(st.w).some(([k, v]) => k !== a.pruef.fehltKey && k !== st.unb && v === wert)) F(id, `fehlender Wert ${wert} steht doch im Text`, a.text);
    if (!zahlenImAusdruck(a.pruef.ausdruck).includes(wert)) F(id, 'fehlender Wert wird gar nicht gebraucht');
    if (a.fehlt.wahl.filter(w => w === a.fehlt.richtig).length !== 1 || !a.fehlt.wahl.includes(ES_FEHLT_NICHTS)) F(id, 'Fehlt-Auswahl');
    return;
  }
  if (!gleich(rechne(a.pruef.ausdruck), a.antwort)) F(id, `Nachrechnung ${a.pruef.ausdruck} ≠ ${a.antwort}`);
  for (const v of zahlenImAusdruck(a.pruef.ausdruck)) if (!im.includes(v) && v !== 100 && !(st.schema === 'bt')) F(id, `Zahl ${v} fehlt im Text`, a.text);
  if (t.typ === 'ueb') {
    if (!a.pruef.stoer.length) F(id, 'keine überflüssige Angabe');
    const gebraucht = zahlenImAusdruck(a.pruef.ausdruck);
    for (const v of a.pruef.stoer) { if (gebraucht.includes(v)) F(id, `überflüssige Zahl ${v} wird in der Rechnung gebraucht`); if (!im.includes(v)) F(id, `überflüssige Zahl ${v} nicht im Text`); }
  }
}
function pruefeLeseTransfer(item) {
  const a = item.a; if (!a.fakten && !a.tabelle) return;
  for (const typ of ['ueb', 'feh', 'dar']) for (const d of [2, 4, 6]) {
    const id = `${item.id}/L${typ}${d}`; lZiehungen++;
    if (typ === 'feh' && !a.tabelle && !(a.relevant && a.relevant.length)) continue;
    const b = leseTransfer(a, typ, d, rngAus('lt', item.id, typ, d));
    if (new Set(b.wahl).size !== b.wahl.length || b.wahl.filter(w => w === NICHT_IM_TEXT).length !== 1) F(id, 'Auswahl', b.wahl);
    const R = b.wahl[b.antwort];
    if (typ === 'feh') { if (R !== NICHT_IM_TEXT) F(id, 'feh: Antwort muss „nicht im Text" sein');
      const rest = (b.text || '') + JSON.stringify(b.tabelle || '') + JSON.stringify(b.liste || ''); const r0 = a.wahl[a.antwort];
      if (!a.tabelle && new RegExp('(^|[^a-zäöüß])' + r0.toLowerCase().slice(0, Math.max(3, r0.length - 1))).test(rest.toLowerCase())) F(id, 'feh: Antwort steht trotzdem im Text', rest);
      if (a.tabelle) { const sp = b.pruef.fehlendeSpalte; if (b.tabelle.kopf.includes(sp)) F(id, 'feh: Spalte noch da'); }
    } else if (R !== a.wahl[a.antwort]) F(id, 'Antwort geändert');
    if (typ === 'ueb' && !a.tabelle) { for (const w of a.wahl) if (w !== a.wahl[a.antwort] && b.text.toLowerCase().includes(w.toLowerCase()) && !a.text.toLowerCase().includes(w.toLowerCase())) F(id, `Füllsatz verrät Ablenker ${w}`); }
    if (typ === 'dar' && a.tabelle) { try { const k = tabelleEigen({ zeilen: a.tabelle.zeilen }, a.frage); if (k.length !== 1) F(id, 'dar: nicht eindeutig'); } catch (e) { F(id, e.message); } }
  }
}

// ---------- Lauf ----------
const t0 = Date.now();
const nurVorlage = process.argv[3];
const lsJeStufe = {};
for (const V of VORLAGEN) {
  if (nurVorlage && !V.id.startsWith(nurVorlage)) continue;
  if (!V.id || !V.skala || !V.stufen || !V.erzeuge) { F(V.id || '?', 'Vorlage unvollständig'); continue; }
  if (V.sachwissen && !V.quelle) F(V.id, 'Sachwissen ohne Quelle');
  for (const st of V.stufen) {
    const gross = [];
    for (let j = 0; j < N; j++) {
      const id = `${V.id}.${st.id}~${j}`;
      let a; try { a = V.erzeuge(rngAus('pruef', V.id, st.id, j), st); } catch (e) { F(id, 'Fehler: ' + e.message); continue; }
      ziehungen++;
      try { pruefeAufgabe(id, a, V, st); } catch (e) { F(id, 'Prüffehler: ' + e.message, a); }
      if (a.art === 'zahl' && V.skala === 'RE') gross.push(Math.max(...zahlenIm((a.text || '') + ' ').concat([Math.abs(a.antwort)])));
    }
    lsJeStufe[V.id + '.' + st.id] = { ls: V.skala === 'GA' ? null : st.ls, med: gross.length ? gross.sort((x, y) => x - y)[gross.length >> 1] : null };
  }
  // Schwierigkeit steigt mit der Stufe (Lernstufe nicht fallend)
  const ls = V.stufen.map(s => s.ls).filter(x => x != null);
  for (let j = 1; j < ls.length; j++) if (ls[j] < ls[j - 1]) F(V.id, `Stufen nicht aufsteigend: ${ls.join(', ')}`);
}

// Transfer und Lese-Transfer auf der Bank
const B = baueBank();
const tf = [...B.pools.RE, ...B.pools.SA].filter(transferFaehig);
const typen = ['sig', 'ueb', 'feh', 'dar', 'fach', 'sort'];
for (let j = 0; j < tf.length; j++) {
  const it = tf[j];
  for (const typ of typen) for (const d of [2, 3, 4, 5, 6]) { if ((j + d) % 2) continue; pruefeTransfer(it, { typ, d }, j % 3 ? 'sternwarte' : 'insel'); }
}
for (const it of B.tpools.LV) pruefeLeseTransfer(it);

// Abdeckung je Skala und Halbband: mind. 3 Familien, 30 Aufgaben, 1 Anker
const BAND = { RE: [-1.0, 5.0], SA: [0.5, 5.0], LV: [-1.0, 4.5], HV: [-1.5, 4.5], };
const abdeckung = [];
for (const [sk, [lo, hi]] of Object.entries(BAND)) {
  for (let b = lo; b < hi; b += 0.5) {
    const fams = Object.values(B.familien).filter(f => f.skala === sk && f.zentrum >= b && f.zentrum < b + 0.5);
    const items = B.pools[sk].filter(i => i.b >= b && i.b < b + 0.5).length;
    const anker = fams.filter(f => f.anker).length;
    const ok = fams.length >= 3 && items >= 30;
    abdeckung.push(`${sk} ${b.toFixed(1).padStart(4)}..${(b + 0.5).toFixed(1).padStart(4)}  Familien ${String(fams.length).padStart(3)}  Aufgaben ${String(items).padStart(4)}  Anker ${anker}${ok ? '' : '   <-- LÜCKE'}${ok && !anker ? '  (ohne Anker)' : ''}`);
    if (!ok) F(`Abdeckung ${sk} ${b.toFixed(1)}`, `nur ${fams.length} Familien / ${items} Aufgaben`);
  }
}

console.log(`Vorlagen ${VORLAGEN.length}, Stufen ${Object.keys(lsJeStufe).length}, Ziehungen ${ziehungen} (je Stufe ${N})`);
console.log(`Transfer-Ziehungen ${tZiehungen} (aus ${tf.length} Zwillingen), Lese-Transfer ${lZiehungen}`);
console.log(`Bank: ${B.items.size} Aufgaben in ${Object.keys(B.familien).length} Familien`);
console.log('\nAbdeckung:\n' + abdeckung.join('\n'));
if (warn.length) console.log(`\nHinweise (${warn.length}):\n` + [...new Set(warn)].slice(0, 20).join('\n'));
console.log(`\nFehler: ${fehler.length}${fehler.length >= 400 ? '+' : ''}`);
const gruppen = {}; for (const f of fehler) { const k = f.split(':')[0].replace(/[~#].*$/, '').replace(/\/([a-z]+?)\d.*$/, '/$1') + ' :: ' + f.split(':').slice(1).join(':').split('|')[0].replace(/\d+/g, '#').trim().slice(0, 70); gruppen[k] = (gruppen[k] || 0) + 1; }
for (const [k, n] of Object.entries(gruppen).slice(0, 60)) console.log(`${String(n).padStart(4)}× ${k}`);
const filt = process.argv[4];
console.log((filt ? fehler.filter(f => f.includes(filt)) : fehler).slice(0, filt ? 40 : 12).join('\n'));
console.log(`Dauer ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(fehler.length ? 1 : 0);
