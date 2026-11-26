// Vorlagen Sachrechnen (Skala SA). Grundform: vorgelesene Geschichte ohne Transfer-Merkmale.
// Die Schema-Vorlagen erzeugen eine Struktur; daraus werden Geschichte, nackter Zwilling und Balkenmodell gebaut.
import { zf } from './werkzeug.js';
import { SCHEMAS, SCHEMA_NAMEN, geschichte, nackt } from './schema.js';

export const SCHEMA_HINWEIS = {
  tg: 'Was ist das Ganze, was sind die Teile? Ein Balkenmodell hilft: oben das Ganze, unten die Teile.',
  vg: 'Wer hat mehr, wer hat weniger? Zeichne zwei Balken untereinander und markiere den Unterschied.',
  vd: 'Was war am Anfang, was hat sich verändert, was ist am Ende?',
  gr: 'Gleich große Gruppen: Wie viele Gruppen, wie viele in jeder Gruppe, wie viele insgesamt?',
  gr2: 'Erst die vollen Gruppen, dann die einzelnen dazu – oder umgekehrt erst die einzelnen wegnehmen.',
  vgm: 'Ein Balken ist ein Vielfaches des anderen. Wie oft passt der kleine in den großen?',
  ds: 'Rechne erst aus, wie viel in einem Behälter ist.',
  bt: 'Teile das Ganze in gleich große Teile und nimm so viele, wie der Bruch sagt.',
  pz: 'Prozent heißt „von Hundert". Rechne erst 1 % oder 10 % aus.',
  gl: 'Rechne rückwärts: Mache die Schritte in umgekehrter Reihenfolge rückgängig.',
};

// Werte je Schema, Unbekannte und Zahlenraum ziehen (alle Werte ganzzahlig, ≥ 2, Angaben verschieden)
export function zieheWerte(r, schema, unb, zr) {
  for (let v = 0; v < 200; v++) {
    let w;
    if (schema === 'tg') { const g = r.zahl(Math.max(5, Math.floor(zr / 4)), zr); const t1 = r.zahl(2, g - 2); w = { t1, t2: g - t1, g }; }
    else if (schema === 'vd') { const plus = unb === 'start' ? true : r.u() < 0.5; const a = r.zahl(Math.max(4, Math.floor(zr / 4)), zr); const d = r.zahl(2, a - 2); w = plus ? { start: a - d, delta: d, ende: a, plus } : { start: a, delta: d, ende: a - d, plus }; }
    else if (schema === 'vg') { const gr = r.zahl(Math.max(5, Math.floor(zr / 4)), zr); const kl = r.zahl(2, gr - 2); w = { gross: gr, klein: kl, diff: gr - kl }; }
    else if (schema === 'gr') { const je = zr >= 1000 ? r.zahl(2, 9) * 10 : r.zahl(2, 10), anzahl = r.zahl(2, zr >= 1000 ? 9 : 10); w = { anzahl, je, gesamt: anzahl * je }; }
    else if (schema === 'gr2') { const je = r.zahl(3, 9), anzahl = r.zahl(2, 9), extra = r.zahl(2, je - 1); w = { anzahl, je, extra, gesamt: anzahl * je + extra }; }
    else if (schema === 'vgm') { const kl = r.zahl(2, zr >= 100 ? 25 : 10), f = r.zahl(2, 5); w = { klein: kl, faktor: f, gross: kl * f }; }
    else if (schema === 'ds') { const e = r.zahl(2, zr >= 1000 ? 40 : 12), m1 = r.zahl(2, 6), m2 = r.zahl(2, 9); w = { m1, w1: m1 * e, m2, w2: m2 * e }; }
    else if (schema === 'bt') { const n = zr === 1 ? r.waehle([2, 4]) : r.waehle([3, 4, 5, 6, 8, 10]); const z = n === 2 ? 1 : r.zahl(1, n - 1); const k = r.zahl(2, 12); w = { ganzes: n * k, z, n, teil: z * k }; }
    else if (schema === 'pz') { const satz = r.waehle(zr === 1 ? [10, 25, 50] : [5, 15, 20, 30, 40, 60, 75, 80]); const step = 100 / gcd(100, satz); const grund = step * r.zahl(2, Math.max(2, Math.floor(400 / step))); w = { grund, satz, wert: grund * satz / 100 }; }
    else if (schema === 'gl') { const x = r.zahl(2, 15), a = r.zahl(2, 7), b = r.zahl(2, 25); w = { x, a, b, c: a * x + b }; }
    const werte = SCHEMAS[schema].keys.filter(k => k !== 'z' && k !== 'n').map(k => w[k]);
    if (werte.some(x => !(x >= 2)) || new Set(werte).size < werte.length) continue;
    if (unb === 'start' && w.start < 2) continue;
    return w;
  }
  throw new Error('keine Werte für ' + schema);
}
function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }

function schemaVorlage(id, schema, unb, kompetenz, stufen, anker) {
  return {
    id, skala: 'SA', kompetenz, titel: `${SCHEMA_NAMEN[schema]} (Sachaufgabe)`, schema, anker,
    stufen,
    erzeuge(r, st) {
      const w = zieheWerte(r, schema, unb, st.zr);
      const struktur = { schema, w, unb };
      const g = geschichte(struktur, r, {});
      struktur.ktx = g.ktx; struktur.P = g.P.name; struktur.Q = g.Q.name;
      const wert = SCHEMAS[schema].loese(w, unb);
      // Merkmal Zehnerübergang bei Plus/Minus
      let dls = 0;
      if ((schema === 'tg' || schema === 'vd' || schema === 'vg') && st.zr <= 100) {
        const zahlen = SCHEMAS[schema].keys.map(k => w[k]);
        const mx = Math.max(...zahlen), rest = zahlen.filter(z => z !== mx);
        if (rest.length >= 2 && Math.floor(mx / 10) !== Math.floor(Math.max(...rest) / 10) && (rest[0] % 10) + (rest[1] % 10) >= 10) dls += 3;
      }
      return {
        text: g.text, saetze: g.saetze.map(s => s.t), frage: g.frage, art: 'zahl', antwort: wert, dls, struktur,
        pruef: { ausdruck: SCHEMAS[schema].ausdruck(w, unb), angaben: SCHEMAS[schema].keys.filter(k => k !== unb && k !== 'z' && k !== 'n' && k !== 'x').map(k => w[k]) },
        hinweis: SCHEMA_HINWEIS[schema],
        erklaerung: `Rechnung: ${nackt(struktur).replace('?', zf(wert))}.`,
        balken: true,
      };
    },
  };
}

export const SACH = [
  schemaVorlage('sa.tg.g', 'tg', 'g', 'G06', [{ id: 'k', ls: 11, zr: 6 }, { id: 'a', ls: 15, zr: 10 }, { id: 'b', ls: 17, zr: 20 }, { id: 'c', ls: 24, zr: 100 }, { id: 'd', ls: 33, zr: 1000 }], ['b']),
  schemaVorlage('sa.tg.t', 'tg', 't2', 'G06', [{ id: 'k', ls: 13, zr: 6 }, { id: 'a', ls: 17, zr: 10 }, { id: 'b', ls: 19, zr: 20 }, { id: 'c', ls: 26, zr: 100 }, { id: 'd', ls: 35, zr: 1000 }], []),
  schemaVorlage('sa.vd.e', 'vd', 'ende', 'G06', [{ id: 'k', ls: 10, zr: 6 }, { id: 'a', ls: 14, zr: 10 }, { id: 'b', ls: 17, zr: 20 }, { id: 'c', ls: 24, zr: 100 }, { id: 'd', ls: 32, zr: 1000 }], ['a']),
  schemaVorlage('sa.vd.d', 'vd', 'delta', 'G06', [{ id: 'a', ls: 21, zr: 20 }, { id: 'b', ls: 28, zr: 100 }], []),
  schemaVorlage('sa.vg.k', 'vg', 'klein', 'G07', [{ id: 'k', ls: 20, zr: 10 }, { id: 'a', ls: 24, zr: 20 }, { id: 'b', ls: 28, zr: 100 }, { id: 'c', ls: 36, zr: 1000 }], ['a']),
  schemaVorlage('sa.vg.d', 'vg', 'diff', 'G07', [{ id: 'k', ls: 19, zr: 10 }, { id: 'a', ls: 25, zr: 20 }, { id: 'b', ls: 30, zr: 100 }], []),
  schemaVorlage('sa.vg.g', 'vg', 'gross', 'G07', [{ id: 'k', ls: 21, zr: 10 }, { id: 'a', ls: 26, zr: 20 }, { id: 'b', ls: 31, zr: 100 }], []),
  schemaVorlage('sa.gr.g', 'gr', 'gesamt', 'G08', [{ id: 'a', ls: 29, zr: 100 }, { id: 'b', ls: 38, zr: 1000 }], ['a']),
  schemaVorlage('sa.gr.j', 'gr', 'je', 'G08', [{ id: 'a', ls: 32, zr: 100 }, { id: 'b', ls: 40, zr: 1000 }], []),
  schemaVorlage('sa.gr.a', 'gr', 'anzahl', 'G08', [{ id: 'a', ls: 33, zr: 100 }], []),
  schemaVorlage('sa.gr2.g', 'gr2', 'gesamt', 'G08', [{ id: 'a', ls: 35, zr: 100 }], ['a']),
  schemaVorlage('sa.gr2.a', 'gr2', 'anzahl', 'G08', [{ id: 'a', ls: 40, zr: 100 }], []),
  schemaVorlage('sa.vgm.g', 'vgm', 'gross', 'G11', [{ id: 'a', ls: 32, zr: 50 }, { id: 'b', ls: 37, zr: 100 }], []),
  schemaVorlage('sa.ds.w', 'ds', 'w2', 'G12', [{ id: 'a', ls: 46, zr: 100 }, { id: 'b', ls: 54, zr: 1000 }], ['a']),
  schemaVorlage('sa.bt.t', 'bt', 'teil', 'Z23', [{ id: 'a', ls: 40, zr: 1 }, { id: 'b', ls: 50, zr: 2 }], ['b']),
  schemaVorlage('sa.pz.w', 'pz', 'wert', 'Z29', [{ id: 'a', ls: 66, zr: 1 }, { id: 'b', ls: 70, zr: 2 }], ['a']),
  schemaVorlage('sa.pz.s', 'pz', 'satz', 'Z30', [{ id: 'a', ls: 73, zr: 2 }], []),
  schemaVorlage('sa.gl', 'gl', 'x', 'M13', [{ id: 'a', ls: 58, zr: 100 }], []),
  {
    id: 'sa.geld', skala: 'SA', kompetenz: 'G01', titel: 'Geld', anker: ['a'],
    stufen: [{ id: 'a', ls: 16, art: 'muenzen' }, { id: 'b', ls: 27, art: 'euroCent' }, { id: 'c', ls: 33, art: 'rueckgeld' }],
    erzeuge(r, st) {
      if (st.art === 'muenzen') { const a = r.zahl(1, 4), b = r.zahl(1, 4); return { text: `Mia hat ${a === 1 ? 'eine 2-Euro-Münze' : a + ' Zwei-Euro-Münzen'} und ${b === 1 ? 'eine 1-Euro-Münze' : b + ' Ein-Euro-Münzen'}. Wie viele Euro sind das zusammen?`, art: 'zahl', antwort: 2 * a + b, pruef: { ausdruck: `2*${a}+${b}` }, hinweis: 'Zähle erst die Zwei-Euro-Münzen in Zweierschritten.', erklaerung: `${a} · 2 € + ${b} · 1 € = ${2 * a + b} €.` }; }
      if (st.art === 'euroCent') { const e = r.zahl(1, 9), c = r.zahl(1, 19) * 5; return { text: `Wie viele Cent sind ${e} Euro und ${c} Cent?`, art: 'zahl', antwort: e * 100 + c, pruef: { ausdruck: `${e}*100+${c}` }, hinweis: '1 Euro hat 100 Cent.', erklaerung: `${e} · 100 + ${c} = ${e * 100 + c} Cent.`, fehler: { [e * 10 + c]: '1 € = 10 ct gedacht' } }; }
      const preis = r.zahl(21, 95) * 5, schein = preis < 500 ? 500 : 1000;
      return { text: `Ein Buch kostet ${zf(preis / 100)} €. Ben bezahlt mit einem ${schein / 100}-Euro-Schein. Wie viel Rückgeld bekommt er in Cent?`, art: 'zahl', antwort: schein - preis, pruef: { ausdruck: `${schein}-${preis}` }, hinweis: 'Ergänze den Preis bis zum vollen Euro und dann bis zum Schein.', erklaerung: `${schein} ct − ${preis} ct = ${schein - preis} ct.` };
    },
  },
  {
    id: 'sa.uhr', skala: 'SA', kompetenz: 'G05', titel: 'Uhrzeit und Zeitspannen', anker: ['b'],
    stufen: [{ id: 'a', ls: 24, art: 'stunden' }, { id: 'b', ls: 31, art: 'minuten' }, { id: 'c', ls: 36, art: 'spanne' }, { id: 'd', ls: 40, art: 'spanneH' }],
    erzeuge(r, st) {
      const pad = (m) => String(m).padStart(2, '0');
      if (st.art === 'stunden') { const h = r.zahl(7, 17), d = r.zahl(2, 5); return { text: `Es ist ${h} Uhr. Wie viel Uhr ist es in ${d} Stunden?`, art: 'zahl', antwort: h + d, einheit: 'Uhr', pruef: { ausdruck: `${h}+${d}` }, hinweis: 'Zähle die Stunden weiter.', erklaerung: `${h} + ${d} = ${h + d} Uhr.` }; }
      if (st.art === 'minuten') { const h = r.zahl(7, 18), m = r.zahl(2, 11) * 5, d = r.zahl(3, 11) * 5; const t = h * 60 + m + d; return { text: `Es ist ${h}:${pad(m)} Uhr. Wie spät ist es in ${d} Minuten?`, sprech: `Es ist ${h} Uhr ${m}. Wie spät ist es in ${d} Minuten?`, art: 'zahlen', felder: ['Stunde', 'Minuten'], antwort: [Math.floor(t / 60), t % 60], pruef: { ausdruecke: [`floor((${h}*60+${m}+${d})/60)`, `(${h}*60+${m}+${d})%60`] }, hinweis: 'Rechne erst bis zur vollen Stunde.', erklaerung: `${h}:${pad(m)} Uhr + ${d} min = ${Math.floor(t / 60)}:${pad(t % 60)} Uhr.` }; }
      const h1 = r.zahl(7, 14), m1 = r.zahl(0, 11) * 5, dauer = st.art === 'spanne' ? r.zahl(5, 23) * 5 : r.zahl(13, 47) * 5; const e = h1 * 60 + m1 + dauer;
      return { text: `Ein Ausflug beginnt um ${h1}:${pad(m1)} Uhr und endet um ${Math.floor(e / 60)}:${pad(e % 60)} Uhr. Wie viele Minuten dauert er?`, sprech: `Ein Ausflug beginnt um ${h1} Uhr ${m1 || ''} und endet um ${Math.floor(e / 60)} Uhr ${e % 60 || ''}. Wie viele Minuten dauert er?`, art: 'zahl', antwort: dauer, pruef: { ausdruck: `(${Math.floor(e / 60)}*60+${e % 60})-(${h1}*60+${m1})` }, hinweis: 'Gehe in Schritten: erst bis zur vollen Stunde, dann ganze Stunden, dann der Rest.', erklaerung: `Von ${h1}:${pad(m1)} bis ${Math.floor(e / 60)}:${pad(e % 60)} sind es ${dauer} Minuten.`, fehler: { [dauer + 40]: 'mit 100 Minuten pro Stunde gerechnet', [dauer - 40]: 'mit 100 Minuten pro Stunde gerechnet' } };
    },
  },
  {
    id: 'sa.einheit', skala: 'SA', kompetenz: 'G04', titel: 'Einheiten umrechnen', anker: ['a'],
    stufen: [{ id: 'a', ls: 36, art: 'm-cm' }, { id: 'b', ls: 40, art: 'km-m' }, { id: 'c', ls: 43, art: 'kg-g' }, { id: 'd', ls: 47, art: 'komma' }],
    erzeuge(r, st) {
      if (st.art === 'm-cm') { const m = r.zahl(1, 9), c = r.zahl(1, 99); return { text: `${m} m ${c} cm = ? cm`, sprech: `${m} Meter ${c} Zentimeter sind wie viele Zentimeter?`, art: 'zahl', antwort: m * 100 + c, pruef: { ausdruck: `${m}*100+${c}` }, hinweis: '1 m = 100 cm.', erklaerung: `${m} · 100 cm + ${c} cm = ${m * 100 + c} cm.`, fehler: { [m * 10 + c]: '1 m = 10 cm gedacht' } }; }
      if (st.art === 'km-m') { const k = r.zahl(1, 9), m = r.zahl(1, 999); return { text: `${k} km ${m} m = ? m`, sprech: `${k} Kilometer ${m} Meter sind wie viele Meter?`, art: 'zahl', antwort: k * 1000 + m, pruef: { ausdruck: `${k}*1000+${m}` }, hinweis: '1 km = 1000 m.', erklaerung: `${k} km = ${k * 1000} m, plus ${m} m = ${zf(k * 1000 + m)} m.` }; }
      if (st.art === 'kg-g') { const k = r.zahl(2, 12), g = r.zahl(1, 19) * 50; return { text: `${k} kg ${g} g = ? g`, sprech: `${k} Kilogramm ${g} Gramm sind wie viel Gramm?`, art: 'zahl', antwort: k * 1000 + g, pruef: { ausdruck: `${k}*1000+${g}` }, hinweis: '1 kg = 1000 g.', erklaerung: `${k} kg = ${k * 1000} g, plus ${g} g = ${zf(k * 1000 + g)} g.` }; }
      const x = r.zahl(11, 99); return { text: `${zf(x / 10)} kg = ? g`, sprech: `${zf(x / 10)} Kilogramm sind wie viel Gramm?`, art: 'zahl', antwort: x * 100, pruef: { ausdruck: `${x}*100` }, hinweis: '1 kg = 1000 g. Das Komma rückt drei Stellen nach rechts.', erklaerung: `${zf(x / 10)} · 1000 g = ${zf(x * 100)} g.` };
    },
  },
  {
    id: 'sa.flaeche', skala: 'SA', kompetenz: 'R12', titel: 'Umfang und Fläche', anker: ['a'],
    stufen: [{ id: 'a', ls: 44, art: 'umfang' }, { id: 'b', ls: 55, art: 'flaeche' }, { id: 'c', ls: 60, art: 'seite' }],
    erzeuge(r, st) {
      const a = r.zahl(3, 15), b = r.zahl(2, 12);
      if (st.art === 'umfang') return { text: `Ein rechteckiges Beet ist ${a} m lang und ${b} m breit. Wie viele Meter Zaun braucht man rundherum?`, art: 'zahl', antwort: 2 * (a + b), pruef: { ausdruck: `2*(${a}+${b})` }, hinweis: 'Rundherum heißt: alle vier Seiten zusammen.', erklaerung: `${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} m.`, fehler: { [a + b]: 'nur zwei Seiten', [a * b]: 'Fläche statt Umfang' } };
      if (st.art === 'flaeche') return { text: `Ein Zimmer ist ${a} m lang und ${b} m breit. Wie viele Quadratmeter Teppich braucht man?`, art: 'zahl', antwort: a * b, pruef: { ausdruck: `${a}*${b}` }, hinweis: 'Fläche = Länge mal Breite.', erklaerung: `${a} m · ${b} m = ${a * b} m².`, fehler: { [2 * (a + b)]: 'Umfang statt Fläche' } };
      return { text: `Ein Rechteck hat ${a * b} m² Fläche und ist ${a} m lang. Wie breit ist es in Metern?`, art: 'zahl', antwort: b, pruef: { ausdruck: `${a * b}/${a}` }, hinweis: 'Welche Zahl mal die Länge ergibt die Fläche?', erklaerung: `${a * b} : ${a} = ${b} m.` };
    },
  },
  {
    id: 'sa.kombi', skala: 'SA', kompetenz: 'G14', titel: 'Kombinieren', anker: [],
    stufen: [{ id: 'a', ls: 28, art: 'paare' }, { id: 'b', ls: 50, art: 'ziffern' }, { id: 'c', ls: 60, art: 'handschlag' }],
    erzeuge(r, st) {
      if (st.art === 'paare') { const a = r.zahl(2, 5), b = r.zahl(2, 5); return { text: `Lea hat ${a} T-Shirts und ${b} Hosen. Wie viele verschiedene Kombinationen aus einem T-Shirt und einer Hose kann sie anziehen?`, art: 'zahl', antwort: a * b, pruef: { ausdruck: `${a}*${b}`, zaehlen: a * b }, hinweis: 'Nimm ein T-Shirt und zähle, mit wie vielen Hosen es geht.', erklaerung: `Jedes der ${a} T-Shirts passt zu ${b} Hosen: ${a} · ${b} = ${a * b}.`, fehler: { [a + b]: 'addiert statt kombiniert' } }; }
      if (st.art === 'ziffern') { const n = r.zahl(3, 5); const zif = r.einige([1, 2, 3, 4, 5, 6, 7, 8, 9], n).sort((x, y) => x - y); return { text: `Wie viele verschiedene zweistellige Zahlen kann man aus den Ziffern ${zif.join(', ')} legen, wenn jede Ziffer höchstens einmal vorkommt?`, art: 'zahl', antwort: n * (n - 1), pruef: { ausdruck: `${n}*(${n}-1)`, zaehlenZiffern: zif }, hinweis: 'Für die Zehnerstelle gibt es so viele Möglichkeiten, wie es Ziffern gibt – und für die Einerstelle?', erklaerung: `${n} · ${n - 1} = ${n * (n - 1)}.` }; }
      const n = r.zahl(4, 12); return { text: `${n} Kinder geben sich zur Begrüßung alle gegenseitig die Hand. Wie viele Handschläge sind das?`, art: 'zahl', antwort: n * (n - 1) / 2, pruef: { ausdruck: `${n}*(${n}-1)/2` }, hinweis: 'Jedes Kind gibt allen anderen die Hand – aber jeder Handschlag zählt nur einmal.', erklaerung: `${n} · ${n - 1} : 2 = ${n * (n - 1) / 2}.`, fehler: { [n * (n - 1)]: 'doppelt gezählt' } };
    },
  },
  {
    id: 'sa.mittel', skala: 'SA', kompetenz: 'D07', titel: 'Durchschnitt', anker: ['a'],
    stufen: [{ id: 'a', ls: 62, n: 3 }, { id: 'b', ls: 65, n: 5 }],
    erzeuge(r, st) {
      let w; do { w = Array.from({ length: st.n }, () => r.zahl(2, 30)); } while (w.reduce((a, b) => a + b, 0) % st.n !== 0);
      const s = w.reduce((a, b) => a + b, 0);
      return { text: `${st.n} Kinder sammeln Kastanien: ${w.join(', ')} Stück. Wie viele sind das im Durchschnitt pro Kind?`, art: 'zahl', antwort: s / st.n, pruef: { ausdruck: `(${w.join('+')})/${st.n}` }, hinweis: 'Zähle alles zusammen und teile durch die Zahl der Kinder.', erklaerung: `${w.join(' + ')} = ${s}, ${s} : ${st.n} = ${s / st.n}.` };
    },
  },
  {
    id: 'sa.tempo', skala: 'SA', kompetenz: 'G15', titel: 'Geschwindigkeit', anker: ['a'],
    stufen: [{ id: 'a', ls: 60, art: 'v' }, { id: 'b', ls: 65, art: 't' }, { id: 'c', ls: 70, art: 'min' }],
    erzeuge(r, st) {
      const v = r.zahl(4, 24) * 5, t = r.zahl(2, 6);
      if (st.art === 'v') return { text: `Ein Zug fährt in ${t} Stunden ${v * t} km. Wie viele km fährt er in einer Stunde?`, art: 'zahl', antwort: v, pruef: { ausdruck: `${v * t}/${t}` }, hinweis: 'Teile die Strecke durch die Zeit.', erklaerung: `${v * t} km : ${t} h = ${v} km pro Stunde.` };
      if (st.art === 't') return { text: `Ein Auto fährt ${v} km pro Stunde. Wie viele Stunden braucht es für ${v * t} km?`, art: 'zahl', antwort: t, pruef: { ausdruck: `${v * t}/${v}` }, hinweis: 'Wie oft passt die Strecke einer Stunde in die ganze Strecke?', erklaerung: `${v * t} : ${v} = ${t} Stunden.` };
      const vv = r.waehle([30, 60, 90, 120]), km = vv / 60 * r.zahl(2, 9) * 10; return { text: `Ein Radfahrer fährt ${vv / 2} km pro Stunde. Wie viele Minuten braucht er für ${zf(km / 2)} km?`, art: 'zahl', antwort: km / 2 / (vv / 2) * 60, pruef: { ausdruck: `${km / 2}/${vv / 2}*60` }, hinweis: 'Wie viele Kilometer schafft er in einer Minute?', erklaerung: `${zf(km / 2)} km : ${vv / 2} km/h · 60 = ${km / 2 / (vv / 2) * 60} Minuten.` };
    },
  },
  {
    id: 'sa.anti', skala: 'SA', kompetenz: 'G16', titel: 'Umgekehrt proportional', anker: [],
    stufen: [{ id: 'a', ls: 78 }, { id: 'b', ls: 82, vorrat: true }],
    erzeuge(r, st) {
      const ges = r.waehle([24, 36, 48, 60, 72, 120]); const teiler = [2, 3, 4, 6, 8, 12].filter(d => ges % d === 0);
      const a = r.waehle(teiler); let b; do { b = r.waehle(teiler); } while (b === a);
      if (st.vorrat) return { text: `Ein Futtervorrat reicht für ${a} Pferde ${ges / a} Tage. Wie viele Tage reicht er für ${b} Pferde?`, art: 'zahl', antwort: ges / b, pruef: { ausdruck: `${a}*${ges / a}/${b}` }, hinweis: 'Mehr Pferde – weniger Tage. Rechne erst, wie lange er für ein Pferd reicht.', erklaerung: `Für 1 Pferd: ${ges} Tage, für ${b} Pferde: ${ges} : ${b} = ${ges / b} Tage.`, fehler: { [ges / a * b / a]: 'proportional gerechnet' } };
      return { text: `${a} Helfer brauchen ${ges / a} Stunden, um einen Garten umzugraben. Wie viele Stunden brauchen ${b} Helfer, wenn alle gleich schnell arbeiten?`, art: 'zahl', antwort: ges / b, pruef: { ausdruck: `${a}*${ges / a}/${b}` }, hinweis: 'Mehr Helfer – weniger Zeit. Wie lange bräuchte ein Helfer allein?', erklaerung: `1 Helfer: ${ges} Stunden, ${b} Helfer: ${ges} : ${b} = ${ges / b} Stunden.` };
    },
  },
  {
    id: 'sa.zins', skala: 'SA', kompetenz: 'Z30', titel: 'Zinsen', anker: [],
    stufen: [{ id: 'a', ls: 74, jahre: 1 }, { id: 'b', ls: 84, jahre: 2 }],
    erzeuge(r, st) {
      const k = r.zahl(2, 20) * 100, p = r.waehle([2, 3, 4, 5, 10]);
      if (st.jahre === 1) return { text: `Lisa legt ${zf(k)} € ein Jahr lang zu ${p} % Zinsen an. Wie viele Euro Zinsen bekommt sie?`, art: 'zahl', antwort: k * p / 100, pruef: { ausdruck: `${k}*${p}/100` }, hinweis: `${p} % von ${zf(k)} €.`, erklaerung: `${zf(k)} € · ${p} : 100 = ${zf(k * p / 100)} €.` };
      const k2 = 1000 * r.zahl(1, 5), p2 = r.waehle([10, 20, 5]); const e = k2 * (1 + p2 / 100) ** 2;
      return { text: `${zf(k2)} € werden 2 Jahre lang zu ${p2} % angelegt. Die Zinsen werden jedes Jahr mitverzinst. Wie viel Geld ist es nach 2 Jahren?`, art: 'zahl', antwort: Math.round(e * 100) / 100, pruef: { ausdruck: `${k2}*(1+${p2}/100)^2` }, hinweis: 'Rechne Jahr für Jahr: Nach dem ersten Jahr ist der neue Betrag die Grundlage.', erklaerung: `Nach 1 Jahr: ${zf(k2 * (1 + p2 / 100))} €, nach 2 Jahren: ${zf(Math.round(e * 100) / 100)} €.`, fehler: { [k2 + 2 * k2 * p2 / 100]: 'ohne Zinseszins' } };
    },
  },
  {
    id: 'sa.lgs', skala: 'SA', kompetenz: 'M13', titel: 'Gleichungen aufstellen', anker: ['a'],
    stufen: [{ id: 'a', ls: 70, art: 'alter' }, { id: 'b', ls: 82, art: 'summeDiff' }, { id: 'c', ls: 88, art: 'koepfe' }],
    erzeuge(r, st) {
      if (st.art === 'alter') { const x = r.zahl(3, 12), f = r.zahl(2, 4); return { text: `Tom ist ${f}-mal so alt wie seine Schwester Lisa. Zusammen sind sie ${x * (f + 1)} Jahre alt. Wie alt ist Lisa?`, art: 'zahl', antwort: x, pruef: { ausdruck: `${x * (f + 1)}/(${f}+1)` }, hinweis: `Lisas Alter ist ein Teil, Toms Alter sind ${f} solche Teile. Wie viele Teile sind es zusammen?`, erklaerung: `x + ${f}x = ${x * (f + 1)}, also ${f + 1}x = ${x * (f + 1)} und x = ${x}.` }; }
      if (st.art === 'summeDiff') { const a = r.zahl(10, 60), b = r.zahl(2, a - 2); return { text: `Zwei Zahlen haben zusammen ${a + b}. Die eine ist um ${a - b} größer als die andere. Wie heißt die größere Zahl?`, art: 'zahl', antwort: a, pruef: { ausdruck: `(${a + b}+${a - b})/2` }, hinweis: 'Nimm den Unterschied weg, dann sind beide gleich groß.', erklaerung: `(${a + b} − ${a - b}) : 2 = ${b}, die größere ist ${b} + ${a - b} = ${a}.` }; }
      const h = r.zahl(3, 20), k = r.zahl(3, 20); return { text: `Auf einem Hof leben Hühner und Kaninchen. Zusammen haben sie ${h + k} Köpfe und ${2 * h + 4 * k} Beine. Wie viele Kaninchen sind es?`, art: 'zahl', antwort: k, pruef: { ausdruck: `(${2 * h + 4 * k}-2*${h + k})/2`, koepfeBeine: [h + k, 2 * h + 4 * k] }, hinweis: 'Stell dir vor, alle wären Hühner. Wie viele Beine fehlen dann?', erklaerung: `Alle Hühner: ${2 * (h + k)} Beine, es fehlen ${4 * k + 2 * h - 2 * (h + k)}, jedes Kaninchen hat 2 Beine mehr: ${k} Kaninchen.` };
    },
  },
  {
    id: 'sa.pyth', skala: 'SA', kompetenz: 'K9', titel: 'Pythagoras im Alltag', anker: [],
    stufen: [{ id: 'a', ls: 94 }],
    erzeuge(r) {
      const [p, q, h] = r.waehle([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
      return { text: `Eine Leiter ist ${h} m lang. Ihr Fuß steht ${p} m von der Wand entfernt. In welcher Höhe in Metern lehnt sie an der Wand?`, art: 'zahl', antwort: q, pruef: { ausdruck: `sqrt(${h}^2-${p}^2)` }, hinweis: 'Wand, Boden und Leiter bilden ein rechtwinkliges Dreieck. Die Leiter ist die längste Seite.', erklaerung: `${h}² − ${p}² = ${q * q}, Wurzel: ${q} m.` };
    },
  },
];
