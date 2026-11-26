// Vorlagen Rechnen (Skala RE) inkl. Muster und Algebra. Kompetenz-IDs nach recherche/3 (Z.., M..).
// Jede Stufe einer Vorlage ist eine Aufgabenfamilie. ls = Lernstufe (Klasse x 10), dls = Merkmalszuschlag.
// pruef.ausdruck wird im Prüfskript unabhängig ausgerechnet (eigener Rechner, nicht dieser Code).
import { zf, ggT, kgV, auswahl } from './werkzeug.js';

const R = (text, ausdruck, wert, mehr = {}) => ({ text, antwort: wert, art: 'zahl', pruef: { ausdruck }, ...mehr });
const hatUebertrag = (a, b) => { while (a || b) { if ((a % 10) + (b % 10) >= 10) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; };
const uebertraege = (a, b) => { let n = 0, c = 0; while (a || b) { const s = (a % 10) + (b % 10) + c; c = s >= 10 ? 1 : 0; n += c; a = Math.floor(a / 10); b = Math.floor(b / 10); } return n; };
const entbuendeln = (a, b) => { let n = 0, c = 0; while (a) { const d = (a % 10) - c - (b % 10); c = d < 0 ? 1 : 0; n += c; a = Math.floor(a / 10); b = Math.floor(b / 10); } return n; };
// Erklärung für Zahlenfolgen: die Regel nennen, nicht nur die Zahl (Befund 11)
function folgeRegel(f, art, ziel) {
  const L = f[f.length - 1], V = f[f.length - 2];
  if (art === '+n') return `Es kommt jedes Mal ${f[1] - f[0]} dazu: ${zf(L)} + ${f[1] - f[0]} = ${zf(ziel)}.`;
  if (art === '-n') return `Es wird jedes Mal ${f[0] - f[1]} weniger: ${zf(L)} − ${f[0] - f[1]} = ${zf(ziel)}.`;
  if (art === '*2') return `Jede Zahl ist ${f[1] / f[0]}-mal so groß wie die davor: ${zf(L)} · ${f[1] / f[0]} = ${zf(ziel)}.`;
  if (art === 'wechsel') return `Abwechselnd + ${f[1] - f[0]} und − ${f[1] - f[2]}: ${zf(L)} + ${f[1] - f[0]} = ${zf(ziel)}.`;
  if (art === 'diff') return `Der Abstand wird jedes Mal um 1 größer (${f.slice(1).map((x, i) => '+' + (x - f[i])).join(', ')}, dann +${ziel - L}): ${zf(L)} + ${ziel - L} = ${zf(ziel)}.`;
  if (art === 'quadrat') { const s = (f[1] - f[0] - 1) / 2, p = f[0] - s * s, n = s + f.length; return `Das sind Quadratzahlen${p ? ' plus ' + p : ''}: ${n} · ${n}${p ? ' + ' + p : ''} = ${zf(ziel)}.`; }
  if (art === 'fibo') return `Jede Zahl ist die Summe der beiden davor: ${zf(V)} + ${zf(L)} = ${zf(ziel)}.`;
  return `Die nächste Zahl ist ${zf(ziel)}.`;
}
const tg = (t1, t2, g, unb) => ({ schema: 'tg', w: { t1, t2, g }, unb });
const gr = (anzahl, je, gesamt, unb) => ({ schema: 'gr', w: { anzahl, je, gesamt }, unb });

function plusAufgabe(a, b, mehr = {}) {
  const s = a + b;
  const u = hatUebertrag(a, b);
  return R(`${zf(a)} + ${zf(b)} = ?`, `${a}+${b}`, s, {
    dls: (u ? 3 + 1.5 * Math.max(0, uebertraege(a, b) - 1) : 0),
    hinweis: u ? `Rechne zuerst bis zum nächsten Zehner: ${zf(a)} + ${zf(Math.min(b, (10 - a % 10) % 10 || 10))} …` : `Zähle von ${zf(Math.max(a, b))} aus weiter.`,
    erklaerung: `${zf(a)} + ${zf(b)} = ${zf(s)}.`,
    struktur: tg(a, b, s, 'g'),
    fehler: u ? { [s - 10]: 'Übertrag vergessen' } : {},
    ...mehr,
  });
}
function minusAufgabe(a, b, mehr = {}) {
  const d = a - b;
  const u = entbuendeln(a, b) > 0;
  const falsch = Number(String(a).padStart(4, '0').split('').map((x, i) => Math.abs(Number(x) - Number(String(b).padStart(4, '0')[i]))).join(''));
  return R(`${zf(a)} − ${zf(b)} = ?`, `${a}-${b}`, d, {
    dls: 1 + (u ? 3 + 1.5 * Math.max(0, entbuendeln(a, b) - 1) : 0),
    hinweis: u ? `Nimm erst so viel weg, dass du auf dem Zehner landest.` : `Zähle von ${zf(b)} bis ${zf(a)} hoch.`,
    erklaerung: `${zf(a)} − ${zf(b)} = ${zf(d)}, denn ${zf(d)} + ${zf(b)} = ${zf(a)}.`,
    struktur: tg(b, d, a, 't2'),
    fehler: u && falsch !== d ? { [falsch]: 'kleinere von größerer Ziffer abgezogen' } : {},
    ...mehr,
  });
}

export const RECHNEN = [
  {
    id: 're.punkte', skala: 'RE', kompetenz: 'Z01', titel: 'Anzahlen erfassen', anker: ['a'],
    stufen: [{ id: 'a', ls: 2, max: 5 }, { id: 'b', ls: 5, min: 6, max: 10 }, { id: 'c', ls: 8, min: 11, max: 20 }],
    erzeuge(r, st) {
      const n = r.zahl(st.min || 1, st.max);
      return { text: 'Wie viele Punkte siehst du?', antwort: n, art: 'zahl', bild: { typ: 'punkte', n }, pruef: { wert: n, zaehlen: n }, hinweis: 'Schau nach Fünfer-Gruppen.', erklaerung: `Es sind ${n} Punkte.` };
    },
  },
  {
    id: 're.nachbar', skala: 'RE', kompetenz: 'Z02', titel: 'Nachbarzahlen', anker: ['b'],
    stufen: [{ id: 'a', ls: 4, max: 9 }, { id: 'b', ls: 9, max: 19 }, { id: 'c', ls: 19, max: 99 }, { id: 'd', ls: 29, max: 999 }, { id: 'e', ls: 39, max: 99999 }],
    erzeuge(r, st) {
      const n = r.zahl(2, st.max); const vor = r.u() < 0.5;
      return R(vor ? `Welche Zahl kommt direkt vor ${zf(n)}?` : `Welche Zahl kommt direkt nach ${zf(n)}?`, vor ? `${n}-1` : `${n}+1`, vor ? n - 1 : n + 1, { dls: vor ? 1 : 0, hinweis: vor ? 'Zähle einen Schritt rückwärts.' : 'Zähle einen Schritt weiter.', erklaerung: vor ? `${zf(n - 1)} kommt vor ${zf(n)}.` : `${zf(n + 1)} kommt nach ${zf(n)}.` });
    },
  },
  {
    id: 're.groesser', skala: 'RE', kompetenz: 'Z06', titel: 'Zahlen vergleichen', anker: ['b'],
    stufen: [{ id: 'a', ls: 5, max: 10 }, { id: 'b', ls: 11, max: 20 }, { id: 'c', ls: 20, max: 100, dreh: true }, { id: 'd', ls: 30, max: 1000, dreh: true }, { id: 'e', ls: 41, max: 1000000, dreh: true }],
    erzeuge(r, st) {
      let a = r.zahl(1, st.max), b;
      if (st.dreh && a >= 10 && r.u() < 0.6) { const s = String(a).split('').reverse().join(''); b = Number(s); }
      if (!b || b === a || b > st.max) do { b = r.zahl(1, st.max); } while (b === a);
      const g = Math.max(a, b);
      const { wahl, antwort } = auswahl(r, zf(g), [zf(Math.min(a, b))]);
      return { text: `Welche Zahl ist größer?`, wahl, antwort, art: 'wahl', pruef: { groesser: [a, b], richtig: zf(g) }, hinweis: 'Vergleiche zuerst die höchste Stelle.', erklaerung: `${zf(g)} ist größer als ${zf(Math.min(a, b))}.` };
    },
  },
  {
    id: 're.plus10', skala: 'RE', kompetenz: 'Z04', titel: 'Plus und Minus bis 10', anker: ['b'],
    stufen: [{ id: 'a', ls: 9, op: '+', max: 5 }, { id: 'b', ls: 12, op: '+', max: 10 }, { id: 'c', ls: 12.5, op: '-', max: 10 }, { id: 'd', ls: 15, op: 'p', max: 10 }],
    erzeuge(r, st) {
      const s = r.zahl(3, st.max), a = r.zahl(1, s - 1), b = s - a;
      if (st.op === '+') return plusAufgabe(a, b);
      if (st.op === '-') return minusAufgabe(s, a);
      return R(`${a} + □ = ${s}`, `${s}-${a}`, b, { dls: 0, hinweis: `Wie viele fehlen von ${a} bis ${s}?`, erklaerung: `${a} + ${b} = ${s}.`, struktur: tg(a, b, s, 't2') });
    },
  },
  {
    id: 're.doppel', skala: 'RE', kompetenz: 'Z03', titel: 'Zerlegen, Verdoppeln, Halbieren', anker: ['a'],
    stufen: [{ id: 'a', ls: 13, art: 'zerl' }, { id: 'b', ls: 13, art: 'dop' }, { id: 'c', ls: 14.5, art: 'halb' }],
    erzeuge(r, st) {
      if (st.art === 'zerl') { const z = r.waehle([5, 6, 7, 8, 9, 10]); const a = r.zahl(1, z - 1); return R(`${z} = ${a} + □`, `${z}-${a}`, z - a, { hinweis: `Wie viel fehlt von ${a} bis ${z}?`, erklaerung: `${z} = ${a} + ${z - a}.`, struktur: tg(a, z - a, z, 't2') }); }
      if (st.art === 'dop') { const a = r.zahl(2, 10); return R(`Das Doppelte von ${a} ist?`, `${a}*2`, 2 * a, { sprech: `Was ist das Doppelte von ${a}?`, hinweis: `Doppelt heißt: ${a} + ${a}.`, erklaerung: `${a} + ${a} = ${2 * a}.`, struktur: tg(a, a, 2 * a, 'g') }); }
      const a = r.zahl(2, 10); return R(`Die Hälfte von ${2 * a} ist?`, `${2 * a}/2`, a, { sprech: `Was ist die Hälfte von ${2 * a}?`, hinweis: `Welche Zahl plus sich selbst ergibt ${2 * a}?`, erklaerung: `${a} + ${a} = ${2 * a}, also ist die Hälfte ${a}.`, struktur: gr(2, a, 2 * a, 'je') });
    },
  },
  {
    id: 're.plus20', skala: 'RE', kompetenz: 'Z05', titel: 'Plus und Minus bis 20', anker: ['a'],
    stufen: [{ id: 'a', ls: 16, op: '+', ueb: false }, { id: 'b', ls: 16, op: '+', ueb: true }, { id: 'c', ls: 16.5, op: '-', ueb: true }, { id: 'd', ls: 19, op: 'p', ueb: true }],
    erzeuge(r, st) {
      let a, b;
      if (st.ueb) { a = r.zahl(3, 9); b = r.zahl(10 - a + 1, 9); } else { a = r.zahl(11, 17); b = r.zahl(1, 19 - a); }
      if (st.op === '+') return plusAufgabe(a, b);
      if (st.op === '-') return minusAufgabe(a + b, b);
      return R(`${a} + □ = ${a + b}`, `${a + b}-${a}`, b, { hinweis: `Ergänze erst bis 10, dann weiter bis ${a + b}.`, erklaerung: `${a} + ${b} = ${a + b}.`, struktur: tg(a, b, a + b, 't2') });
    },
  },
  {
    id: 're.plus100', skala: 'RE', kompetenz: 'Z08', titel: 'Plus und Minus bis 100', anker: ['b'],
    stufen: [{ id: 'a', ls: 22, art: 'ZE+E' }, { id: 'b', ls: 22.5, art: 'ZE+ZE' }, { id: 'c', ls: 23, art: 'ZE-ZE' }, { id: 'd', ls: 26, art: 'p' }],
    erzeuge(r, st) {
      if (st.art === 'ZE+E') { const a = r.zahl(11, 89), b = r.zahl(2, 9); if (a + b > 99) return plusAufgabe(a - 10, b); return plusAufgabe(a, b); }
      const a = r.zahl(12, 78), b = r.zahl(11, 99 - a);
      if (st.art === 'ZE+ZE') return plusAufgabe(a, b);
      if (st.art === 'ZE-ZE') return minusAufgabe(a + b, b);
      return R(`${a} + □ = ${a + b}`, `${a + b}-${a}`, b, { dls: hatUebertrag(a, b) ? 3 : 0, hinweis: `Ergänze zuerst bis zum nächsten Zehner.`, erklaerung: `${a} + ${b} = ${a + b}.`, struktur: tg(a, b, a + b, 't2') });
    },
  },
  {
    id: 're.mal', skala: 'RE', kompetenz: 'Z10', titel: 'Einmaleins', anker: ['a'],
    stufen: [{ id: 'a', ls: 25, reihen: [1, 2, 5, 10] }, { id: 'b', ls: 26, reihen: [3, 4, 6, 7, 8, 9] }, { id: 'c', ls: 29, reihen: [2, 3, 4, 5, 6, 7, 8, 9], geteilt: true }, { id: 'd', ls: 30, reihen: [3, 4, 6, 7, 8, 9], platz: true }],
    erzeuge(r, st) {
      const a = r.waehle(st.reihen), b = r.zahl(2, 10), p = a * b;
      const schwer = (x) => x >= 6 && x <= 9;
      const dls = schwer(a) && schwer(b) ? 1.5 : 0;
      if (st.geteilt) return R(`${p} : ${a} = ?`, `${p}/${a}`, b, { dls, hinweis: `Welche Zahl mal ${a} ergibt ${p}?`, erklaerung: `${p} : ${a} = ${b}, denn ${b} · ${a} = ${p}.`, struktur: gr(a, b, p, 'je'), fehler: { [b + 1]: 'Nachbaraufgabe', [b - 1]: 'Nachbaraufgabe' } });
      if (st.platz) return R(`□ · ${a} = ${p}`, `${p}/${a}`, b, { dls, hinweis: `Zähle in ${a}er-Schritten bis ${p}.`, erklaerung: `${b} · ${a} = ${p}.`, struktur: gr(b, a, p, 'anzahl') });
      return R(`${b} · ${a} = ?`, `${b}*${a}`, p, { dls, hinweis: b > 5 ? `Rechne 5 · ${a} und dann noch ${b - 5} · ${a} dazu.` : `Rechne ${a} + ${a} + … (${b}-mal).`, erklaerung: `${b} · ${a} = ${p}.`, struktur: gr(b, a, p, 'gesamt'), fehler: { [p + a]: 'Nachbaraufgabe', [p - a]: 'Nachbaraufgabe', [a + b]: 'plus statt mal' } });
    },
  },
  {
    id: 're.rest', skala: 'RE', kompetenz: 'Z11', titel: 'Teilen mit Rest', anker: [],
    stufen: [{ id: 'a', ls: 32 }, { id: 'b', ls: 35, gross: true }],
    erzeuge(r, st) {
      const d = r.zahl(st.gross ? 6 : 3, 9), q = r.zahl(2, st.gross ? 12 : 9), rest = r.zahl(1, d - 1), a = d * q + rest;
      return { text: `${a} : ${d} = ? Rest ?`, art: 'zahlen', felder: ['Ergebnis', 'Rest'], antwort: [q, rest], pruef: { ausdruecke: [`floor(${a}/${d})`, `${a}%${d}`] }, hinweis: `Welche Zahl aus der ${d}er-Reihe liegt knapp unter ${a}?`, erklaerung: `${q} · ${d} = ${q * d}, bis ${a} fehlen noch ${rest}. Also ${q} Rest ${rest}.` };
    },
  },
  {
    id: 're.kopf1000', skala: 'RE', kompetenz: 'Z13', titel: 'Kopfrechnen bis 1000', anker: ['a'],
    stufen: [{ id: 'a', ls: 29, art: 'H+H' }, { id: 'b', ls: 33, art: 'Z*E' }, { id: 'c', ls: 34, art: 'HZ+HZ' }, { id: 'd', ls: 35, art: 'Z:E' }, { id: 'e', ls: 36, art: '1000-' }],
    erzeuge(r, st) {
      if (st.art === 'H+H') { const a = r.zahl(1, 8) * 100, b = r.zahl(1, (1000 - a) / 100 - 1) * 100; return plusAufgabe(a, b, { dls: 0, hinweis: `Rechne mit Hundertern wie mit Einern: ${a / 100} + ${b / 100}.` }); }
      if (st.art === 'Z*E') { const a = r.zahl(2, 9) * 10, b = r.zahl(2, 9); return R(`${a} · ${b} = ?`, `${a}*${b}`, a * b, { hinweis: `Rechne ${a / 10} · ${b} und hänge eine Null an.`, erklaerung: `${a / 10} · ${b} = ${a / 10 * b}, also ${a} · ${b} = ${a * b}.`, struktur: gr(b, a, a * b, 'gesamt') }); }
      if (st.art === 'HZ+HZ') { const a = r.zahl(11, 60) * 10, b = r.zahl(11, (990 - a) / 10) * 10; return plusAufgabe(a, b); }
      if (st.art === 'Z:E') { const d = r.zahl(2, 9), q = r.zahl(2, 9) * 10; return R(`${d * q} : ${d} = ?`, `${d * q}/${d}`, q, { hinweis: `Denke an ${d * q / 10} : ${d}.`, erklaerung: `${d * q / 10} : ${d} = ${q / 10}, also ${d * q} : ${d} = ${q}.`, struktur: gr(d, q, d * q, 'je') }); }
      const b = r.zahl(101, 899); return minusAufgabe(1000, b, { dls: 0, hinweis: `Ergänze ${b} erst bis zum nächsten Hunderter.` });
    },
  },
  {
    id: 're.schriftlich', skala: 'RE', kompetenz: 'Z14', titel: 'Schriftlich plus und minus', anker: ['a'],
    stufen: [{ id: 'a', ls: 34, op: '+', st: 3 }, { id: 'b', ls: 35, op: '-', st: 3 }, { id: 'c', ls: 37, op: '+', st: 4 }, { id: 'd', ls: 38, op: '-', st: 4 }],
    erzeuge(r, st) {
      const lo = st.st === 3 ? 100 : 1000, hi = st.st === 3 ? 999 : 9999;
      let a = r.zahl(lo, hi), b = r.zahl(lo, hi);
      if (st.op === '+') { while (a + b > (st.st === 3 ? 999 : 9999)) { a = Math.floor(a / 2); b = Math.floor(b / 2) + lo / 2; } return plusAufgabe(a, b, { hinweis: 'Schreibe die Zahlen stellengerecht untereinander und fange bei den Einern an.' }); }
      if (a < b) [a, b] = [b, a]; if (a === b) a += 1;
      return minusAufgabe(a, b, { hinweis: 'Schreibe die Zahlen stellengerecht untereinander. Reicht eine Ziffer nicht, entbündle.' });
    },
  },
  {
    id: 're.runden', skala: 'RE', kompetenz: 'Z15', titel: 'Runden', anker: ['a'],
    stufen: [{ id: 'a', ls: 33, auf: 10, max: 999 }, { id: 'b', ls: 38, auf: 100, max: 9999 }, { id: 'c', ls: 42, auf: 1000, max: 999999 }, { id: 'd', ls: 45, auf: 10000, max: 9999999 }],
    erzeuge(r, st) {
      let n; do { n = r.zahl(st.auf + 1, st.max); } while (n % st.auf === 0);
      const w = Math.round(n / st.auf) * st.auf;
      const name = { 10: 'Zehner', 100: 'Hunderter', 1000: 'Tausender', 10000: 'Zehntausender' }[st.auf];
      return R(`Runde ${zf(n)} auf ${name}.`, `round(${n}/${st.auf})*${st.auf}`, w, { dls: (n % st.auf) === st.auf / 2 ? 1 : 0, hinweis: `Schau auf die Ziffer rechts neben den ${name}n: ab 5 rundest du auf.`, erklaerung: `${zf(n)} liegt näher an ${zf(w)}.`, fehler: { [w === Math.floor(n / st.auf) * st.auf ? w + st.auf : w - st.auf]: 'falsch gerundet' } });
    },
  },
  {
    id: 're.schrmal', skala: 'RE', kompetenz: 'Z16', titel: 'Schriftlich multiplizieren', anker: ['a'],
    stufen: [{ id: 'a', ls: 43, a: [100, 999], b: [3, 9] }, { id: 'b', ls: 46, a: [100, 999], b: [12, 49] }, { id: 'c', ls: 49, a: [1000, 9999], b: [12, 99] }],
    erzeuge(r, st) {
      const a = r.zahl(...st.a), b = r.zahl(...st.b);
      return R(`${zf(a)} · ${zf(b)} = ?`, `${a}*${b}`, a * b, { hinweis: b > 9 ? `Rechne ${zf(a)} · ${Math.floor(b / 10) * 10} und ${zf(a)} · ${b % 10} und zähle zusammen.` : 'Fange bei den Einern an und merke dir die Überträge.', erklaerung: `${zf(a)} · ${zf(b)} = ${zf(a * b)}.`, struktur: gr(b, a, a * b, 'gesamt') });
    },
  },
  {
    id: 're.schrdiv', skala: 'RE', kompetenz: 'Z17', titel: 'Schriftlich dividieren', anker: ['a'],
    stufen: [{ id: 'a', ls: 46, d: [3, 9], q: [21, 199] }, { id: 'b', ls: 49, d: [3, 9], q: [201, 1999] }, { id: 'c', ls: 55, d: [12, 48], q: [12, 99] }],
    erzeuge(r, st) {
      const d = r.zahl(...st.d), q = r.zahl(...st.q), a = d * q;
      return R(`${zf(a)} : ${zf(d)} = ?`, `${a}/${d}`, q, { dls: String(q).includes('0') ? 1.5 : 0, hinweis: `Wie oft passt ${d} in die ersten Stellen von ${zf(a)}?`, erklaerung: `${zf(a)} : ${zf(d)} = ${zf(q)}, denn ${zf(q)} · ${zf(d)} = ${zf(a)}.`, struktur: gr(d, q, a, 'je') });
    },
  },
  {
    id: 're.teiler', skala: 'RE', kompetenz: 'Z19', titel: 'Teiler und Vielfache', anker: ['b'],
    stufen: [{ id: 'a', ls: 50, art: 'teilbar' }, { id: 'b', ls: 53, art: 'ggt' }, { id: 'c', ls: 55, art: 'kgv' }, { id: 'd', ls: 57, art: 'prim' }],
    erzeuge(r, st) {
      if (st.art === 'teilbar') {
        const t = r.waehle([3, 4, 6, 9]); const n = r.u() < 0.5 ? t * r.zahl(12, 120) : t * r.zahl(12, 120) + r.zahl(1, t - 1);
        const ja = n % t === 0;
        return { text: `Ist ${zf(n)} durch ${t} teilbar?`, art: 'wahl', wahl: ['ja', 'nein'], antwort: ja ? 0 : 1, pruef: { teilbar: [n, t] }, hinweis: t === 3 || t === 9 ? `Bilde die Quersumme.` : t === 4 ? 'Schau auf die letzten zwei Ziffern.' : 'Teilbar durch 6 heißt: durch 2 und durch 3.', erklaerung: `${zf(n)} : ${t} = ${ja ? zf(n / t) : zf(Math.floor(n / t)) + ' Rest ' + (n % t)}.` };
      }
      if (st.art === 'ggt') { const g = r.zahl(2, 12), a = g * r.zahl(2, 9), b = g * r.zahl(2, 9); const G = ggT(a, b); if (a === b) return this.erzeuge(r, st); return R(`Größter gemeinsamer Teiler von ${a} und ${b}?`, `ggt(${a},${b})`, G, { hinweis: `Schreibe die Teiler von ${a} auf und suche den größten, der auch ${b} teilt.`, erklaerung: `ggT(${a}, ${b}) = ${G}.` }); }
      if (st.art === 'kgv') { const a = r.zahl(3, 15), b = r.zahl(3, 15); if (a === b) return this.erzeuge(r, st); return R(`Kleinstes gemeinsames Vielfaches von ${a} und ${b}?`, `kgv(${a},${b})`, kgV(a, b), { hinweis: `Schreibe die Vielfachen von ${Math.max(a, b)} auf, bis eines durch ${Math.min(a, b)} teilbar ist.`, erklaerung: `kgV(${a}, ${b}) = ${kgV(a, b)}.` }); }
      const p = r.waehle([3, 5, 7, 11, 13]), q = r.waehle([7, 11, 13, 17, 19, 23]); const n = p * q;
      return R(`Was ist der kleinste Primteiler von ${n}?`, `kpt(${n})`, Math.min(p, q), { hinweis: 'Probiere 2, 3, 5, 7 … der Reihe nach.', erklaerung: `${n} = ${Math.min(p, q)} · ${Math.max(p, q)}.` });
    },
  },
  {
    id: 're.ganz', skala: 'RE', kompetenz: 'Z20', titel: 'Negative Zahlen', anker: ['a'],
    stufen: [{ id: 'a', ls: 52, art: 'a-b' }, { id: 'b', ls: 55, art: '-a+b' }, { id: 'c', ls: 58, art: 'a-(-b)' }, { id: 'd', ls: 62, art: '-a*b' }],
    erzeuge(r, st) {
      const a = r.zahl(2, 30), b = r.zahl(2, 30);
      if (st.art === 'a-b') { const x = Math.min(a, b), y = Math.max(a, b) + 1; return R(`${x} − ${y} = ?`, `${x}-${y}`, x - y, { hinweis: 'Gehe auf dem Zahlenstrahl über die Null hinaus nach links.', erklaerung: `${x} − ${y} = ${zf(x - y)}.` }); }
      if (st.art === '-a+b') return R(`−${a} + ${b} = ?`, `-${a}+${b}`, -a + b, { hinweis: 'Starte links von der Null und gehe nach rechts.', erklaerung: `−${a} + ${b} = ${zf(b - a)}.` });
      if (st.art === 'a-(-b)') return R(`${a} − (−${b}) = ?`, `${a}-(-${b})`, a + b, { hinweis: 'Minus eine negative Zahl ist wie plus.', erklaerung: `${a} − (−${b}) = ${a} + ${b} = ${a + b}.`, fehler: { [a - b]: 'Vorzeichenregel' } });
      const x = r.zahl(2, 12), y = r.zahl(2, 12); return R(`(−${x}) · ${y} = ?`, `-${x}*${y}`, -x * y, { hinweis: 'Minus mal Plus ergibt Minus.', erklaerung: `(−${x}) · ${y} = ${zf(-x * y)}.`, fehler: { [x * y]: 'Vorzeichenregel' } });
    },
  },
  {
    id: 're.klammer', skala: 'RE', kompetenz: 'Z21', titel: 'Punkt vor Strich, Klammern', anker: ['a'],
    stufen: [{ id: 'a', ls: 54, art: 'a+b*c' }, { id: 'b', ls: 56, art: '(a+b)*c' }, { id: 'c', ls: 58, art: 'a*b-c:d' }],
    erzeuge(r, st) {
      const a = r.zahl(2, 20), b = r.zahl(2, 9), c = r.zahl(2, 9);
      if (st.art === 'a+b*c') return R(`${a} + ${b} · ${c} = ?`, `${a}+${b}*${c}`, a + b * c, { hinweis: 'Punktrechnung geht vor Strichrechnung.', erklaerung: `Erst ${b} · ${c} = ${b * c}, dann ${a} + ${b * c} = ${a + b * c}.`, fehler: { [(a + b) * c]: 'von links nach rechts gerechnet' } });
      if (st.art === '(a+b)*c') return R(`(${a} + ${b}) · ${c} = ?`, `(${a}+${b})*${c}`, (a + b) * c, { hinweis: 'Was in der Klammer steht, rechnest du zuerst.', erklaerung: `${a} + ${b} = ${a + b}, dann · ${c} = ${(a + b) * c}.`, fehler: { [a + b * c]: 'Klammer übersehen' } });
      const d = r.zahl(2, 6), q = r.zahl(2, 9), e = d * q, x = a * b; return R(`${a} · ${b} − ${e} : ${d} = ?`, `${a}*${b}-${e}/${d}`, x - q, { hinweis: 'Erst beide Punktrechnungen, dann die Strichrechnung.', erklaerung: `${a} · ${b} = ${x}, ${e} : ${d} = ${q}, ${x} − ${q} = ${x - q}.` });
    },
  },
  {
    id: 're.potenz', skala: 'RE', kompetenz: 'Z22', titel: 'Quadratzahlen und Potenzen', anker: ['a'],
    stufen: [{ id: 'a', ls: 44, art: 'quadrat' }, { id: 'b', ls: 56, art: 'potenz' }, { id: 'c', ls: 88, art: 'gesetz' }, { id: 'd', ls: 93, art: 'wiss' }],
    erzeuge(r, st) {
      if (st.art === 'quadrat') { const a = r.zahl(3, 20); return R(`${a} · ${a} = ?`, `${a}*${a}`, a * a, { dls: a > 12 ? 2 : 0, hinweis: a > 10 ? `Rechne ${a} · 10 und dann ${a} · ${a - 10} dazu.` : 'Das ist eine Quadratzahl aus dem Einmaleins.', erklaerung: `${a} · ${a} = ${a * a}.` }); }
      if (st.art === 'potenz') { const a = r.zahl(2, 5), n = r.zahl(3, a === 2 ? 7 : 4); return R(`${a} hoch ${n} = ?`, `${a}^${n}`, a ** n, { text: `${a}${hoch(n)} = ?`, sprech: `${a} hoch ${n}`, hinweis: `Multipliziere ${a} genau ${n}-mal mit sich selbst.`, erklaerung: `${Array(n).fill(a).join(' · ')} = ${a ** n}.`, fehler: { [a * n]: 'mal statt hoch' } }); }
      if (st.art === 'gesetz') { const a = r.zahl(2, 9), m = r.zahl(2, 9), n = r.zahl(2, 9); return { text: `${a}${hoch(m)} · ${a}${hoch(n)} = ${a}${hoch('□')}`, sprech: `${a} hoch ${m} mal ${a} hoch ${n} ist ${a} hoch wie viel?`, art: 'zahl', antwort: m + n, pruef: { ausdruck: `${m}+${n}` }, hinweis: 'Bei gleicher Basis werden die Hochzahlen addiert.', erklaerung: `${a}${hoch(m)} · ${a}${hoch(n)} = ${a}${hoch(m + n)}.`, fehler: { [m * n]: 'Hochzahlen multipliziert' } }; }
      const z = r.zahl(11, 99), e = r.zahl(2, 6); const v = z * 10 ** (e - 1);
      return { text: `${zf(z / 10)} · 10${hoch(e)} = ?`, sprech: `${zf(z / 10)} mal 10 hoch ${e}`, art: 'zahl', antwort: v, pruef: { ausdruck: `${z}*10^${e - 1}` }, hinweis: `Verschiebe das Komma um ${e} Stellen nach rechts.`, erklaerung: `${zf(z / 10)} · 10${hoch(e)} = ${zf(v)}.` };
    },
  },
  {
    id: 're.bruch', skala: 'RE', kompetenz: 'Z24', titel: 'Brüche', anker: ['b'],
    stufen: [{ id: 'a', ls: 36, art: 'bild' }, { id: 'b', ls: 44, art: 'von' }, { id: 'c', ls: 60, art: 'kuerzen' }, { id: 'd', ls: 61, art: 'plusgleich' }, { id: 'e', ls: 64, art: 'plus' }, { id: 'f', ls: 66, art: 'mal' }, { id: 'g', ls: 68, art: 'durch' }],
    erzeuge(r, st) {
      const n = r.waehle([3, 4, 5, 6, 8]);
      if (st.art === 'bild') { const z = r.zahl(1, n - 1); const { wahl, antwort } = auswahl(r, `${z}/${n}`, [`${n - z}/${n}`, `${z}/${n + 1}`, `${n}/${z}`, `${z + 1}/${n}`]); return { text: 'Welcher Teil ist gefärbt?', art: 'wahl', wahl, antwort, bild: { typ: 'bruch', z, n }, pruef: { richtig: `${z}/${n}`, bruchbild: [z, n] }, hinweis: 'Zähle alle Teile (unten) und die gefärbten (oben).', erklaerung: `${z} von ${n} gleichen Teilen sind gefärbt: ${z}/${n}.` }; }
      if (st.art === 'von') { const z = r.zahl(1, n - 1), g = n * r.zahl(2, 12); return { text: `${z}/${n} von ${g} = ?`, sprech: `${z} ${n}tel von ${g}`, art: 'zahl', antwort: g / n * z, pruef: { ausdruck: `${g}/${n}*${z}` }, hinweis: `Teile ${g} erst durch ${n}.`, erklaerung: `${g} : ${n} = ${g / n}, mal ${z} ergibt ${g / n * z}.`, struktur: { schema: 'bt', w: { ganzes: g, z, n, teil: g / n * z }, unb: 'teil' } }; }
      if (st.art === 'kuerzen') { const zz = r.zahl(1, n - 1); const k = r.zahl(2, 6); const g = ggT(zz, n); const z0 = zz / g, n0 = n / g; return { text: `Kürze so weit wie möglich: ${zz * k}/${n * k}`, art: 'bruch', antwort: { z: z0, n: n0 }, kuerzen: true, pruef: { bruch: [zz * k, n * k], gekuerzt: true }, hinweis: `Suche eine Zahl, durch die ${zz * k} und ${n * k} beide teilbar sind.`, erklaerung: `${zz * k}/${n * k} = ${z0}/${n0} (gekürzt mit ${ggT(zz * k, n * k)}).` }; }
      if (st.art === 'plusgleich') { const a = r.zahl(1, n - 2), b = r.zahl(1, n - 1 - a); const g = ggT(a + b, n); return { text: `${a}/${n} + ${b}/${n} = ?`, art: 'bruch', antwort: { z: (a + b) / g, n: n / g }, pruef: { bruch: [a + b, n] }, hinweis: 'Gleicher Nenner: Zähler addieren, Nenner bleibt.', erklaerung: `${a}/${n} + ${b}/${n} = ${a + b}/${n}${g > 1 ? ` = ${(a + b) / g}/${n / g}` : ''}.`, fehler: { [`${a + b}/${2 * n}`]: 'Nenner addiert' } }; }
      if (st.art === 'plus') { const n1 = r.waehle([2, 3, 4, 5]), n2 = r.waehle([3, 4, 6, 8, 10].filter(x => x !== n1)); const a = r.zahl(1, n1 - 1), b = r.zahl(1, n2 - 1); const N = n1 * n2, Z = a * n2 + b * n1, g = ggT(Z, N); return { text: `${a}/${n1} + ${b}/${n2} = ?`, art: 'bruch', antwort: { z: Z / g, n: N / g }, pruef: { bruch: [Z, N], ausdruckBruch: `${a}/${n1}+${b}/${n2}` }, hinweis: `Bringe beide Brüche auf den Nenner ${kgV(n1, n2)}.`, erklaerung: `${a}/${n1} + ${b}/${n2} = ${Z / g}/${N / g}.`, fehler: { [`${a + b}/${n1 + n2}`]: 'Zähler und Nenner addiert' } }; }
      if (st.art === 'mal') { const a = r.zahl(1, 5), b = r.zahl(2, 7), c = r.zahl(1, 5), d = r.zahl(2, 7); const g = ggT(a * c, b * d); return { text: `${a}/${b} · ${c}/${d} = ?`, art: 'bruch', antwort: { z: a * c / g, n: b * d / g }, pruef: { bruch: [a * c, b * d], ausdruckBruch: `${a}/${b}*${c}/${d}` }, hinweis: 'Zähler mal Zähler, Nenner mal Nenner.', erklaerung: `${a}/${b} · ${c}/${d} = ${a * c}/${b * d}${g > 1 ? ` = ${a * c / g}/${b * d / g}` : ''}.` }; }
      const a = r.zahl(1, 5), b = r.zahl(2, 7), c = r.zahl(1, 5), d = r.zahl(2, 7); const g = ggT(a * d, b * c); return { text: `${a}/${b} : ${c}/${d} = ?`, art: 'bruch', antwort: { z: a * d / g, n: b * c / g }, pruef: { bruch: [a * d, b * c], ausdruckBruch: `(${a}/${b})/(${c}/${d})` }, hinweis: 'Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen.', erklaerung: `${a}/${b} · ${d}/${c} = ${a * d / g}/${b * c / g}.` };
    },
  },
  {
    id: 're.dezimal', skala: 'RE', kompetenz: 'Z28', titel: 'Dezimalzahlen', anker: ['a'],
    stufen: [{ id: 'a', ls: 60, art: 'mal10' }, { id: 'b', ls: 62, art: 'bruchdez' }, { id: 'c', ls: 63, art: 'plus' }, { id: 'd', ls: 65, art: 'malint' }, { id: 'e', ls: 68, art: 'maldez' }],
    erzeuge(r, st) {
      const d = (x) => zf(x);
      if (st.art === 'mal10') { const x = r.zahl(11, 999) / 100, f = r.waehle([10, 100, 1000]); return R(`${d(x)} · ${zf(f)} = ?`, `${Math.round(x * 100)}*${f}/100`, Math.round(x * f * 100) / 100, { hinweis: `Mal ${zf(f)}: Das Komma rückt ${String(f).length - 1} Stellen nach rechts.`, erklaerung: `${d(x)} · ${zf(f)} = ${d(Math.round(x * f * 100) / 100)}.` }); }
      if (st.art === 'bruchdez') { const [z, n] = r.waehle([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 10], [7, 10], [1, 20], [3, 20]]); return { text: `Schreibe ${z}/${n} als Dezimalzahl.`, art: 'zahl', antwort: z / n, pruef: { ausdruck: `${z}/${n}` }, hinweis: `Erweitere den Bruch auf Zehntel oder Hundertstel.`, erklaerung: `${z}/${n} = ${d(z / n)}.` }; }
      if (st.art === 'plus') { const a = r.zahl(11, 999), b = r.zahl(1, 99); const s = (a * 10 + b * 10) / 1000; const x = a / 100, y = b / 10; return R(`${d(x)} + ${d(y)} = ?`, `${a}/100+${b}/10`, Math.round((x + y) * 100) / 100, { hinweis: 'Schreibe Komma unter Komma.', erklaerung: `${d(x)} + ${d(y)} = ${d(Math.round((x + y) * 100) / 100)}.`, fehler: { [Math.round((a + b) / 100 * 100) / 100]: 'Stellen nicht untereinander' } }); }
      if (st.art === 'malint') { const a = r.zahl(11, 99), f = r.zahl(3, 9); return R(`${d(a / 10)} · ${f} = ?`, `${a}*${f}/10`, a * f / 10, { hinweis: `Rechne ${a} · ${f} und setze dann das Komma.`, erklaerung: `${a} · ${f} = ${a * f}, also ${d(a / 10)} · ${f} = ${d(a * f / 10)}.` }); }
      const a = r.zahl(2, 9), b = r.zahl(2, 9); return R(`${d(a / 10)} · ${d(b / 10)} = ?`, `${a}*${b}/100`, a * b / 100, { hinweis: 'Zähle die Nachkommastellen beider Zahlen zusammen.', erklaerung: `${a} · ${b} = ${a * b}, zwei Nachkommastellen: ${d(a * b / 100)}.`, fehler: { [a * b / 10]: 'Kommastellen falsch' } });
    },
  },
  {
    id: 're.prozent', skala: 'RE', kompetenz: 'Z30', titel: 'Prozent', anker: ['a'],
    stufen: [{ id: 'a', ls: 66, art: 'einfach' }, { id: 'b', ls: 69, art: 'wert' }, { id: 'c', ls: 72, art: 'satz' }, { id: 'd', ls: 75, art: 'grund' }, { id: 'e', ls: 77, art: 'aenderung' }],
    erzeuge(r, st) {
      if (st.art === 'einfach') { const p = r.waehle([10, 25, 50, 20]), g = (100 / ggT(100, p)) * r.zahl(2, 20); return R(`${p} % von ${zf(g)} = ?`, `${g}*${p}/100`, g * p / 100, { hinweis: p === 50 ? 'Die Hälfte.' : p === 25 ? 'Ein Viertel.' : p === 10 ? 'Ein Zehntel.' : 'Ein Fünftel.', erklaerung: `${p} % von ${zf(g)} sind ${zf(g * p / 100)}.`, struktur: { schema: 'pz', w: { grund: g, satz: p, wert: g * p / 100 }, unb: 'wert' } }); }
      const p = r.waehle([5, 15, 30, 35, 40, 45, 60, 75, 80, 12]); const g = (100 / ggT(100, p)) * r.zahl(2, 15); const w = g * p / 100;
      if (st.art === 'wert') return R(`${p} % von ${zf(g)} = ?`, `${g}*${p}/100`, w, { hinweis: `Berechne erst 1 % von ${zf(g)}.`, erklaerung: `1 % sind ${zf(g / 100)}, ${p} % sind ${zf(w)}.`, struktur: { schema: 'pz', w: { grund: g, satz: p, wert: w }, unb: 'wert' } });
      if (st.art === 'satz') return R(`${zf(w)} von ${zf(g)} sind wie viel Prozent?`, `${w}*100/${g}`, p, { hinweis: `Rechne ${zf(w)} : ${zf(g)} und nimm mal 100.`, erklaerung: `${zf(w)} : ${zf(g)} = ${zf(w / g)} = ${p} %.`, struktur: { schema: 'pz', w: { grund: g, satz: p, wert: w }, unb: 'satz' } });
      if (st.art === 'grund') return R(`${p} % sind ${zf(w)}. Wie viel sind 100 %?`, `${w}*100/${p}`, g, { hinweis: `Rechne erst aus, wie viel 1 % ist.`, erklaerung: `1 % = ${zf(w / p)}, 100 % = ${zf(g)}.`, struktur: { schema: 'pz', w: { grund: g, satz: p, wert: w }, unb: 'grund' } });
      const plus = r.u() < 0.5; const neu = plus ? g + w : g - w;
      return R(`Ein Preis von ${zf(g)} € wird um ${p} % ${plus ? 'erhöht' : 'gesenkt'}. Neuer Preis in €?`, plus ? `${g}+${g}*${p}/100` : `${g}-${g}*${p}/100`, neu, { hinweis: `Berechne erst ${p} % von ${zf(g)} €.`, erklaerung: `${p} % von ${zf(g)} € sind ${zf(w)} €, neuer Preis ${zf(neu)} €.`, fehler: { [w]: 'nur die Änderung berechnet' } });
    },
  },
  {
    id: 're.folge', skala: 'RE', kompetenz: 'M05', titel: 'Zahlenfolgen', anker: ['b'],
    stufen: [{ id: 'a', ls: 14, art: '+n', max: 20 }, { id: 'b', ls: 22, art: '+n', max: 100 }, { id: 'c', ls: 25, art: '-n', max: 100 }, { id: 'd', ls: 33, art: '*2' }, { id: 'e', ls: 38, art: 'wechsel' }, { id: 'f', ls: 48, art: 'diff' }, { id: 'g', ls: 54, art: 'quadrat' }, { id: 'h', ls: 60, art: 'fibo' }, { id: 'i', ls: 66, art: 'nte' }],
    erzeuge(r, st) {
      let f = [];
      if (st.art === '+n') { const d = st.max === 20 ? r.zahl(1, 3) : r.zahl(3, 12); const s = r.zahl(0, st.max - 5 * d); for (let i = 0; i < 5; i++) f.push(s + i * d); }
      else if (st.art === '-n') { const d = r.zahl(3, 12); const s = r.zahl(5 * d, 99); for (let i = 0; i < 5; i++) f.push(s - i * d); }
      else if (st.art === '*2') { const s = r.zahl(1, 6), q = r.waehle([2, 2, 3]); for (let i = 0; i < 5; i++) f.push(s * q ** i); }
      else if (st.art === 'wechsel') { const a = r.zahl(3, 9), b = r.zahl(1, a - 1); let x = r.zahl(2, 20); for (let i = 0; i < 6; i++) { f.push(x); x += i % 2 === 0 ? a : -b; } }
      else if (st.art === 'diff') { let x = r.zahl(1, 10), d = r.zahl(1, 3); for (let i = 0; i < 5; i++) { f.push(x); x += d; d += 1; } }
      else if (st.art === 'quadrat') { const s = r.zahl(1, 6), plus = r.zahl(0, 3); for (let i = 0; i < 5; i++) f.push((s + i) ** 2 + plus); }
      else if (st.art === 'fibo') { let a = r.zahl(1, 5), b = r.zahl(a, 8); for (let i = 0; i < 6; i++) { f.push(a); [a, b] = [b, a + b]; } }
      if (st.art === 'nte') {
        const m = r.zahl(2, 9), c = r.zahl(-3, 9), n = r.waehle([20, 25, 50, 100]); const g = (k) => m * k + c;
        return R(`Die Folge geht so: ${[1, 2, 3, 4].map(g).map(zf).join(', ')}, … Welche Zahl steht an der ${n}. Stelle?`, `${m}*${n}+(${c})`, g(n), { hinweis: `Um wie viel wächst die Folge jedes Mal? Was muss man an der 1. Stelle noch dazurechnen?`, erklaerung: `An der n-ten Stelle steht ${m} · n ${c >= 0 ? '+ ' + c : '− ' + (-c)}. Für n = ${n}: ${zf(g(n))}.` });
      }
      const ziel = f.pop();
      return { text: `Wie geht es weiter? ${f.map(zf).join(', ')}, ?`, sprech: `Wie geht die Zahlenfolge weiter? ${f.join(', ')}, und dann?`, art: 'zahl', antwort: ziel, pruef: { folge: f, art: st.art, ziel }, hinweis: 'Schau, wie sich die Zahlen von einer zur nächsten verändern.', erklaerung: folgeRegel(f, st.art, ziel) };
    },
  },
  {
    id: 're.gleichung', skala: 'RE', kompetenz: 'M12', titel: 'Gleichungen', anker: ['a'],
    stufen: [{ id: 'a', ls: 50, art: 'x+a' }, { id: 'b', ls: 52, art: 'ax' }, { id: 'c', ls: 64, art: 'ax+b' }, { id: 'd', ls: 76, art: 'beidseitig' }, { id: 'e', ls: 79, art: 'klammer' }],
    erzeuge(r, st) {
      const x = r.zahl(-3, 12) || 4, a = r.zahl(2, 9), b = r.zahl(-9, 20) || 5;
      const s = (v) => (v < 0 ? `− ${-v}` : `+ ${v}`);
      if (st.art === 'x+a') { const xx = Math.abs(x) + 2, aa = Math.abs(b) + 2; return R(`x + ${aa} = ${xx + aa}. x = ?`, `${xx + aa}-${aa}`, xx, { hinweis: `Rechne auf beiden Seiten − ${aa}.`, erklaerung: `x = ${xx + aa} − ${aa} = ${xx}.` }); }
      if (st.art === 'ax') { const xx = Math.abs(x) + 2; return R(`${a} · x = ${a * xx}. x = ?`, `${a * xx}/${a}`, xx, { hinweis: `Teile beide Seiten durch ${a}.`, erklaerung: `x = ${a * xx} : ${a} = ${xx}.`, struktur: gr(a, xx, a * xx, 'je') }); }
      if (st.art === 'ax+b') return R(`${a}x ${s(b)} = ${a * x + b}. x = ?`, `(${a * x + b}-(${b}))/${a}`, x, { hinweis: `Bringe erst die ${Math.abs(b)} auf die andere Seite, dann teile durch ${a}.`, erklaerung: `${a}x = ${a * x}, also x = ${x}.`, struktur: x > 0 && b > 0 ? { schema: 'gl', w: { x, a, b, c: a * x + b }, unb: 'x' } : undefined });
      if (st.art === 'beidseitig') { const c = r.zahl(1, a - 1), d = (a - c) * x + b; return R(`${a}x ${s(b)} = ${c}x ${s(d)}. x = ?`, `(${d}-(${b}))/(${a}-${c})`, x, { hinweis: `Bringe alle x auf eine Seite: − ${c}x.`, erklaerung: `${a - c}x = ${d - b}, also x = ${x}.` }); }
      const c = r.zahl(2, 6); return R(`${c} · (x ${s(b)}) = ${c * (x + b)}. x = ?`, `${c * (x + b)}/${c}-(${b})`, x, { hinweis: `Teile erst durch ${c}.`, erklaerung: `x ${s(b)} = ${x + b}, also x = ${x}.` });
    },
  },
  {
    id: 're.term', skala: 'RE', kompetenz: 'M11', titel: 'Terme', anker: ['a'],
    stufen: [{ id: 'a', ls: 70, art: 'wert' }, { id: 'b', ls: 73, art: 'ausm' }, { id: 'c', ls: 77, art: 'binom' }, { id: 'd', ls: 80, art: 'zusammen' }],
    erzeuge(r, st) {
      const a = r.zahl(2, 9), b = r.zahl(2, 9), x = r.zahl(2, 9), y = r.zahl(2, 9);
      if (st.art === 'wert') return R(`Berechne ${a}x + ${b}y für x = ${x} und y = ${y}.`, `${a}*${x}+${b}*${y}`, a * x + b * y, { hinweis: 'Setze die Zahlen für x und y ein, dann Punkt vor Strich.', erklaerung: `${a} · ${x} + ${b} · ${y} = ${a * x + b * y}.` });
      if (st.art === 'ausm') return { text: `${a} · (x + ${b}) = ${a}x + □`, sprech: `${a} mal Klammer x plus ${b} ist ${a} x plus wie viel?`, art: 'zahl', antwort: a * b, pruef: { ausdruck: `${a}*${b}` }, hinweis: 'Jeder Summand in der Klammer wird mit dem Faktor malgenommen.', erklaerung: `${a} · ${b} = ${a * b}.`, fehler: { [b]: 'nur den ersten Summanden malgenommen' } };
      if (st.art === 'binom') return { text: `(x + ${b})² = x² + □x + ${b * b}`, sprech: `Klammer x plus ${b} zum Quadrat ist x Quadrat plus wie viel x plus ${b * b}?`, art: 'zahl', antwort: 2 * b, pruef: { ausdruck: `2*${b}` }, hinweis: 'Erste binomische Formel: (a + b)² = a² + 2ab + b².', erklaerung: `2 · x · ${b} = ${2 * b}x.`, fehler: { [b]: 'Faktor 2 vergessen' } };
      const c = r.zahl(2, 9); return { text: `${a}x + ${b} + ${c}x − ${b + 1} = □x − 1`, sprech: `${a} x plus ${b} plus ${c} x minus ${b + 1} ist wie viel x minus 1?`, art: 'zahl', antwort: a + c, pruef: { ausdruck: `${a}+${c}` }, hinweis: 'Fasse die x-Glieder und die Zahlen getrennt zusammen.', erklaerung: `${a}x + ${c}x = ${a + c}x, ${b} − ${b + 1} = −1.` };
    },
  },
  {
    id: 're.funktion', skala: 'RE', kompetenz: 'M14', titel: 'Lineare Funktionen', anker: ['a'],
    stufen: [{ id: 'a', ls: 80, art: 'wert' }, { id: 'b', ls: 83, art: 'steigung' }, { id: 'c', ls: 86, art: 'null' }],
    erzeuge(r, st) {
      const m = r.zahl(-5, 6) || 2, c = r.zahl(-8, 9);
      const fs = `f(x) = ${m}x ${c < 0 ? '− ' + -c : '+ ' + c}`;
      if (st.art === 'wert') { const x = r.zahl(-4, 9); return R(`${fs}. Wie groß ist f(${x})?`, `${m}*(${x})+(${c})`, m * x + c, { hinweis: `Setze ${x} für x ein.`, erklaerung: `f(${x}) = ${m} · ${x < 0 ? '(' + x + ')' : x} ${c < 0 ? '− ' + -c : '+ ' + c} = ${m * x + c}.` }); }
      if (st.art === 'steigung') { const x1 = r.zahl(-3, 3), x2 = x1 + r.zahl(1, 4); const y1 = m * x1 + c, y2 = m * x2 + c; return R(`Eine Gerade geht durch (${x1} | ${y1}) und (${x2} | ${y2}). Wie groß ist die Steigung?`, `(${y2}-(${y1}))/(${x2}-(${x1}))`, m, { hinweis: 'Steigung = Unterschied der y-Werte geteilt durch Unterschied der x-Werte.', erklaerung: `(${y2} − ${y1 < 0 ? '(' + y1 + ')' : y1}) : (${x2} − ${x1 < 0 ? '(' + x1 + ')' : x1}) = ${m}.` }); }
      const x0 = r.zahl(-6, 6); const mm = m === 0 ? 2 : m; const cc = -mm * x0;
      return R(`f(x) = ${mm}x ${cc < 0 ? '− ' + -cc : '+ ' + cc}. Für welches x ist f(x) = 0?`, `-(${cc})/${mm}`, x0, { hinweis: `Setze ${mm}x ${cc < 0 ? '− ' + -cc : '+ ' + cc} = 0 und löse nach x auf.`, erklaerung: `x = ${x0}.` });
    },
  },
  {
    id: 're.lgs', skala: 'RE', kompetenz: 'M15', titel: 'Gleichungssysteme', anker: [],
    stufen: [{ id: 'a', ls: 86, art: 'einfach' }, { id: 'b', ls: 90, art: 'faktor' }],
    erzeuge(r, st) {
      const x = r.zahl(1, 12), y = r.zahl(1, 12);
      if (st.art === 'einfach') return R(`x + y = ${x + y} und x − y = ${x - y}. x = ?`, `((${x + y})+(${x - y}))/2`, x, { hinweis: 'Addiere beide Gleichungen: Dann fällt y weg.', erklaerung: `2x = ${2 * x}, also x = ${x} (und y = ${y}).` });
      const a = r.zahl(2, 5), b = r.zahl(2, 5);
      return R(`${a}x + y = ${a * x + y} und x + ${b}y = ${x + b * y}. y = ?`, `((${x + b * y})*${a}-(${a * x + y}))/(${a}*${b}-1)`, y, { hinweis: `Nimm die zweite Gleichung mal ${a} und ziehe die erste ab.`, erklaerung: `${a * b - 1}y = ${(a * b - 1) * y}, also y = ${y} (und x = ${x}).` });
    },
  },
  {
    id: 're.wurzel', skala: 'RE', kompetenz: 'K9', titel: 'Wurzeln und Pythagoras', anker: ['a'],
    stufen: [{ id: 'a', ls: 88, art: 'wurzel' }, { id: 'b', ls: 90, art: 'xquadrat' }, { id: 'c', ls: 93, art: 'pyth' }, { id: 'd', ls: 96, art: 'quadr' }],
    erzeuge(r, st) {
      if (st.art === 'wurzel') { const a = r.zahl(4, 25); return R(`√${a * a} = ?`, `sqrt(${a * a})`, a, { sprech: `Wurzel aus ${a * a}`, hinweis: `Welche Zahl mal sich selbst ergibt ${a * a}?`, erklaerung: `${a} · ${a} = ${a * a}.` }); }
      if (st.art === 'xquadrat') { const a = r.zahl(3, 15), b = r.zahl(1, 30); return R(`x² + ${b} = ${a * a + b}, x ist positiv. x = ?`, `sqrt(${a * a + b}-${b})`, a, { sprech: `x Quadrat plus ${b} ist ${a * a + b}. x ist positiv. Wie groß ist x?`, hinweis: `Erst − ${b}, dann die Wurzel ziehen.`, erklaerung: `x² = ${a * a}, x = ${a}.` }); }
      if (st.art === 'pyth') { const [p, q, h] = r.waehle([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const k = r.zahl(1, 4); const kat = r.u() < 0.5; return kat ? R(`Rechtwinkliges Dreieck: Hypotenuse ${h * k} cm, eine Kathete ${p * k} cm. Wie lang ist die andere Kathete in cm?`, `sqrt(${h * k}^2-${p * k}^2)`, q * k, { dls: 2, hinweis: 'a² + b² = c². Ziehe das Quadrat der bekannten Kathete vom Quadrat der Hypotenuse ab.', erklaerung: `${h * k}² − ${p * k}² = ${(q * k) ** 2}, Wurzel: ${q * k} cm.` }) : R(`Rechtwinkliges Dreieck: Katheten ${p * k} cm und ${q * k} cm. Wie lang ist die Hypotenuse in cm?`, `sqrt(${p * k}^2+${q * k}^2)`, h * k, { hinweis: 'a² + b² = c².', erklaerung: `${p * k}² + ${q * k}² = ${(h * k) ** 2}, Wurzel: ${h * k} cm.` }); }
      const x1 = r.zahl(1, 6), x2 = x1 + r.zahl(1, 6); const p = -(x1 + x2), q = x1 * x2;
      return R(`x² − ${-p}x + ${q} = 0. Wie heißt die kleinere Lösung?`, `kleinereLoesung(1,${p},${q})`, x1, { sprech: `x Quadrat minus ${-p} x plus ${q} gleich 0. Wie heißt die kleinere Lösung?`, hinweis: `Suche zwei Zahlen mit Produkt ${q} und Summe ${-p}.`, erklaerung: `(x − ${x1})(x − ${x2}) = 0, kleinere Lösung ${x1}.` });
    },
  },
];

function hoch(n) { const H = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '□': 'ˣ' }; return String(n).split('').map(c => H[c] || c).join(''); }
