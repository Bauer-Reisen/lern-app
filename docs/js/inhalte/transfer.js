// Transfer-Verkleidungen (KONZEPT §5): aus einer Zwillingsaufgabe (Struktur) wird eine Aufgabe in fremder Form.
// typ: sig (Signalwort-Falle), ueb (überflüssige Angabe), feh (fehlende Angabe), dar (Darstellung/Balkenmodell),
//      fach (andere Einkleidung, Fachwechsel), sort (Struktur erkennen). d = Abstand 2..6 (mehr Merkmale).
import { SCHEMAS, SCHEMA_NAMEN, KONTEXTE, kontext, geschichte, nackt, balkenModell, loese } from './schema.js';
import { zieheWerte } from './sach.js';
import { zf, rngAus } from './werkzeug.js';

export const TRANSFER_NAMEN = { sig: 'Signalwort-Falle', ueb: 'Überflüssige Angabe', feh: 'Fehlende Angabe', dar: 'Andere Darstellung', fach: 'Neue Einkleidung', sort: 'Struktur erkennen' };
export const ES_FEHLT_NICHTS = 'Es fehlt nichts.';
const HINWEIS = {
  sig: 'Vorsicht: „mehr", „dazu" oder „zusammen" heißt nicht immer plus. Überlege, was du weißt und was gesucht ist.',
  ueb: 'Nicht jede Zahl wird gebraucht. Welche Angabe hat mit der Frage nichts zu tun?',
  feh: 'Kannst du die Frage mit den Angaben wirklich beantworten? Wenn nicht: Tippe auf „Geht nicht – es fehlt …".',
  dar: 'Das Bild zeigt dieselbe Aufgabe wie eine Rechnung. Was gehört an die Stelle mit dem Fragezeichen?',
  fach: 'Die Aufgabe sieht neu aus, aber die Struktur kennst du.',
  sort: 'Achte nicht auf die Dinge in der Geschichte, sondern darauf, wie man rechnet.',
};
const UNTERSTUETZT = ['tg', 'vg', 'vd', 'gr', 'gr2', 'vgm', 'ds', 'bt', 'pz', 'gl'];
export const transferFaehig = (item) => !!(item.a && item.a.struktur && UNTERSTUETZT.includes(item.a.struktur.schema) && SCHEMAS[item.a.struktur.schema].keys.filter(k => k !== 'z' && k !== 'n').every(k => item.a.struktur.w[k] >= 2));

function zahlraum(st) {
  const m = Math.max(...SCHEMAS[st.schema].keys.map(k => st.w[k]).filter(v => typeof v === 'number'));
  return m <= 10 ? 10 : m <= 20 ? 20 : m <= 100 ? 100 : 1000;
}
function merkmale(d) { return { kontext: d >= 6 ? 2 : d >= 3 ? 1 : 0, zahlwort: d >= 4, extraStoer: d >= 5 ? 1 : 0 }; }

// kind: 'insel' | 'sternwarte' (Sortieren im Insel-Profil als „Welche Rechnung passt?")
export function transferAufgabe(item, transfer, kind = 'sternwarte', salz = '') {
  const r = rngAus('tr', item.id, transfer.typ, transfer.d, salz);
  const st0 = item.a.struktur;
  const st = { schema: st0.schema, w: { ...st0.w }, unb: st0.unb };
  const M = merkmale(transfer.d);
  const ktxTwin = st0.ktx ? kontext(st0.ktx) : null;
  const S = SCHEMAS[st.schema];
  const name = SCHEMA_NAMEN[st.schema];
  const basis = { typ: transfer.typ, d: transfer.d, schema: st.schema, zwilling: nackt(st), hinweis: HINWEIS[transfer.typ], balken: true };
  const ktxAndererFach = () => r.waehle(KONTEXTE.filter(k => !ktxTwin || k.fach !== ktxTwin.fach)).id;

  if (transfer.typ === 'dar') {
    const g = M.kontext ? geschichte(st, r, { kontext: 1 }) : null;
    const modell = balkenModell(st, g ? g.P : { name: 'A' }, g ? g.Q : { name: 'B' });
    const wert = loese(st);
    return { ...basis, text: 'Was gehört an die Stelle mit dem Fragezeichen?', bild: { typ: 'balken', modell, zahlwort: M.zahlwort }, unterschrift: M.extraStoer ? `Das Bild ist ${r.zahl(6, 15)} Zentimeter breit.` : null, art: 'zahl', antwort: wert, struktur: st, pruef: { ausdruck: S.ausdruck(st.w, st.unb) }, erklaerung: `${name}: ${nackt(st).replace('?', zf(wert))}.` };
  }
  if (transfer.typ === 'sort') {
    const ref = geschichte(st, r, { ktx: st0.ktx || undefined });
    const refOp = S.op(st.w, st.unb);
    if (kind === 'insel') {
      const zahlen = S.keys.filter(k => k !== st.unb && typeof st.w[k] === 'number').map(k => st.w[k]);
      const [a, b] = zahlen.length >= 2 ? [Math.max(zahlen[0], zahlen[1]), Math.min(zahlen[0], zahlen[1])] : [zahlen[0], 2];
      const richtigWert = loese(st);
      const kand = [`${zf(a)} + ${zf(b)}`, `${zf(a)} − ${zf(b)}`, `${zf(a)} · ${zf(b)}`, ...(a % b === 0 ? [`${zf(a)} : ${zf(b)}`] : [])];
      const werte = { '+': a + b, '−': a - b, '·': a * b, ':': a / b };
      const richtig = nackt(st).replace(' = ?', '');
      const falsch = kand.filter(k => werte[k.split(' ')[1]] !== richtigWert);
      const wahl = r.mischen([richtig, ...falsch.slice(0, 3)]);
      return { ...basis, text: ref.text, saetze: ref.saetze.map(s => s.t), frage: 'Welche Rechnung passt zu der Geschichte?', art: 'wahl', wahl, antwort: wahl.indexOf(richtig), struktur: st, pruef: { sortRechnung: { richtigWert, optionen: wahl } }, erklaerung: `Passend ist ${richtig} = ${zf(richtigWert)}.` };
    }
    const zr = zahlraum(st);
    const richtigSt = { schema: st.schema, unb: st.unb, w: zieheWerte(r, st.schema, st.unb, zr) };
    const richtig = geschichte(richtigSt, r, { ktx: ktxAndererFach() }).text;
    const paare = [['tg', 'g'], ['tg', 't2'], ['vd', 'ende'], ['vg', 'klein'], ['vg', 'gross'], ['gr', 'gesamt'], ['gr', 'je'], ['gr2', 'gesamt'], ['vgm', 'gross']];
    const falsch = [];
    for (const [sc, u] of r.mischen(paare)) {
      if (falsch.length >= 3) break;
      const w = zieheWerte(r, sc, u, Math.max(20, zr));
      if (SCHEMAS[sc].op(w, u) === refOp) continue;
      if (sc === st.schema || SCHEMA_NAMEN[sc] === name) continue; // Befund 8: keine Ablenker mit derselben Struktur
      falsch.push({ text: geschichte({ schema: sc, w, unb: u }, r, { ktx: ref.ktx }).text, op: SCHEMAS[sc].op(w, u), schema: sc });
    }
    const wahl = r.mischen([richtig, ...falsch.map(f => f.text)]);
    return { ...basis, text: ref.text, saetze: ref.saetze.map(s => s.t), frage: 'Welche dieser Aufgaben wird genauso gerechnet wie die Geschichte oben?', art: 'wahl', wahl, wahlLang: true, antwort: wahl.indexOf(richtig), struktur: st, pruef: { sortGeschichten: { refOp, refName: name, ops: wahl.map(t => (t === richtig ? refOp : falsch.find(f => f.text === t).op)), namen: wahl.map(t => (t === richtig ? name : SCHEMA_NAMEN[falsch.find(f => f.text === t).schema])) } }, erklaerung: `Beide sind „${name}": ${nackt(st).replace('?', zf(loese(st)))} und ${nackt(richtigSt).replace('?', zf(loese(richtigSt)))}.` };
  }
  // Geschichten-Typen
  const opt = { kontext: M.kontext, zahlwort: M.zahlwort, stoerer: M.extraStoer };
  if (transfer.typ === 'sig') opt.sig = true;
  if (transfer.typ === 'ueb') opt.stoerer = 1 + M.extraStoer + (transfer.d >= 6 ? 1 : 0);
  if (transfer.typ === 'feh') opt.fehlt = true;
  if (transfer.typ === 'fach' || !ktxTwin) opt.ktx = ktxAndererFach(); else opt.ktx = ktxTwin.id;
  if (transfer.typ === 'sig' || transfer.typ === 'ueb' || transfer.typ === 'feh') opt.ktx = r.u() < 0.5 && ktxTwin ? ktxTwin.id : ktxAndererFach();
  const g = geschichte(st, r, opt);
  const stNeu = { ...st, unb: g.unb };
  const wert = SCHEMAS[st.schema].loese(st.w, g.unb);
  const stoerSaetze = g.saetze.filter(s => s.stoer).map(s => s.t);
  const out = { ...basis, text: g.text, saetze: g.saetze.map(s => s.t), frage: g.frage, struktur: { ...stNeu, ktx: g.ktx, P: g.P.name, Q: g.Q.name }, stoerSaetze, kannFehlen: true };
  if (transfer.typ === 'feh' && g.fehltKey) {
    const wahlFehlt = r.mischen([g.fehltOptionen.richtig, ...g.fehltOptionen.falsch.slice(0, 2), ES_FEHLT_NICHTS]);
    return { ...out, art: 'zahl', antwort: null, fehlt: { richtig: g.fehltOptionen.richtig, wahl: wahlFehlt }, pruef: { fehltKey: g.fehltKey, ausdruck: S.ausdruck(st.w, g.unb) }, erklaerung: `Man kann es nicht ausrechnen. Es fehlt, ${g.fehltOptionen.richtig}.` };
  }
  // Schema, bei dem kein Satz wegfallen kann (z. B. Dreisatz): stattdessen überflüssige Angabe
  if (transfer.typ === 'feh') return transferAufgabe(item, { ...transfer, typ: 'ueb' }, kind, salz);
  return {
    ...out, art: 'zahl', antwort: wert, pruef: { ausdruck: S.ausdruck(st.w, g.unb), stoer: g.saetze.filter(s => s.stoer).map(s => s.wert) },
    erklaerung: `${name}: ${nackt(stNeu).replace('?', zf(wert))}.` + (stoerSaetze.length ? ` Nicht gebraucht: „${stoerSaetze.join('“, „')}“` : ''),
  };
}
