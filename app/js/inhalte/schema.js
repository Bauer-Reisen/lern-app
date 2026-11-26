// Strukturen ("Schemas") für Sachaufgaben und Transfer.
// Eine Aufgabe hat eine Struktur { schema, w: {Werte}, unb: gesuchter Wert }. Daraus entstehen:
//  - der nackte Zwilling (reine Rechnung), die Geschichte in einer Einkleidung (Kontext),
//  - Transfer-Verkleidungen (Signalwort-Falle, überflüssige/fehlende Angabe, Darstellung, Fachwechsel, Sortieren),
//  - das Soll-Balkenmodell.
// Alle Werte sind ganze Zahlen ≥ 2 (außer Prozent/Bruch-Anteile), damit Einzahl/Mehrzahl stimmt.
import { zf, zahlwort, person, gross } from './werkzeug.js';

export const SCHEMA_NAMEN = {
  tg: 'Teil und Ganzes', vg: 'Vergleich', vd: 'Veränderung', gr: 'Gleiche Gruppen', gr2: 'Gruppen und Rest',
  vgm: 'Mal-Vergleich', ds: 'Dreisatz', bt: 'Bruchteil', pz: 'Prozent', gl: 'Zahlenrätsel',
};

// ---------- Einkleidungen ----------
// adj: Stämme (weiß -> weiße / weißen / weiß); beh: Behälter [Einzahl, Mehrzahl, Geschlecht]
export const KONTEXTE = [
  { id: 'muscheln', fach: 'Natur', ding: 'Muscheln', adj: ['weiß', 'braun'], beh: ['Eimer', 'Eimer', 'm', 'Eimern'], verb: 'sammelt', dazu: 'findet', weg: 'verschenkt', einl: 'Am Strand ist es heute windig.', einl2: 'Die Wellen rauschen laut.', stoer: [['Der Strand ist {z} Meter breit.', 30, 90], ['Die Ebbe dauert {z} Stunden.', 3, 7]] },
  { id: 'aepfel', fach: 'Garten', ding: 'Äpfel', adj: ['rot', 'grün'], beh: ['Korb', 'Körbe', 'm', 'Körben'], verb: 'pflückt', dazu: 'pflückt', weg: 'verschenkt', einl: 'Im Herbst hängen viele Äpfel an den Bäumen.', einl2: 'Die Leiter wackelt ein bisschen.', stoer: [['Der Baum ist {z} Jahre alt.', 12, 40], ['Im Garten stehen {z} Bänke.', 2, 5]] },
  { id: 'baelle', fach: 'Sport', ding: 'Bälle', adj: ['groß', 'klein'], beh: ['Netz', 'Netze', 'n', 'Netzen'], verb: 'holt', dazu: 'holt', weg: 'verleiht', einl: 'Nach dem Training wird die Halle aufgeräumt.', einl2: 'Die Trainerin pfeift.', stoer: [['Die Halle hat {z} Fenster.', 6, 20], ['Das Training dauert {z} Minuten.', 45, 90]] },
  { id: 'lieder', fach: 'Musik', ding: 'Lieder', hat: 'kennt', legt: 'schreibt', adj: ['schnell', 'langsam'], beh: ['Heft', 'Hefte', 'n', 'Heften'], verb: 'übt', dazu: 'lernt', weg: 'streicht', einl: 'Der Chor probt für das Sommerfest.', einl2: 'Das Klavier ist frisch gestimmt.', stoer: [['Im Chor singen {z} Kinder.', 12, 30], ['Die Probe beginnt um {z} Uhr.', 3, 6]] },
  { id: 'sterne', fach: 'Weltall', ding: 'Sterne', hat: 'sieht', legt: 'ordnet', adj: ['hell', 'schwach leuchtend'], beh: ['Sternbild', 'Sternbilder', 'n', 'Sternbildern'], verb: 'zählt', dazu: 'entdeckt', weg: 'übersieht', einl: 'In der Nacht ist der Himmel klar.', einl2: 'Das Fernrohr steht auf dem Dach.', stoer: [['Das Fernrohr ist {z} Zentimeter lang.', 40, 95], ['Es ist {z} Grad kalt.', 2, 9]] },
  { id: 'kekse', fach: 'Küche', ding: 'Kekse', adj: ['rund', 'eckig'], beh: ['Dose', 'Dosen', 'f', 'Dosen'], verb: 'backt', dazu: 'backt', weg: 'verschenkt', einl: 'In der Küche riecht es nach Zimt.', einl2: 'Der Ofen ist schon heiß.', stoer: [['Der Ofen ist {z} Jahre alt.', 3, 15], ['Die Kekse backen {z} Minuten.', 10, 20]] },
  { id: 'steine', fach: 'Technik', ding: 'Bausteine', adj: ['rot', 'blau'], beh: ['Kiste', 'Kisten', 'f', 'Kisten'], verb: 'sortiert', dazu: 'bekommt', weg: 'verleiht', einl: 'Heute wird ein Turm gebaut.', einl2: 'Die Bauanleitung liegt auf dem Boden.', stoer: [['Die Anleitung hat {z} Seiten.', 8, 30], ['Der Tisch ist {z} Zentimeter hoch.', 60, 80]] },
  { id: 'buecher', fach: 'Lesen', ding: 'Bücher', legt: 'stellt', adj: ['dick', 'dünn'], beh: ['Regal', 'Regale', 'n', 'Regalen'], verb: 'leiht', dazu: 'leiht', weg: 'bringt|zurück', einl: 'Die Bücherei hat heute lange geöffnet.', einl2: 'Draußen regnet es.', stoer: [['Die Bücherei ist {z} Jahre alt.', 20, 90], ['Bis zur Bücherei sind es {z} Minuten.', 5, 15]] },
  { id: 'stifte', fach: 'Kunst', ding: 'Stifte', adj: ['lang', 'kurz'], beh: ['Schachtel', 'Schachteln', 'f', 'Schachteln'], verb: 'ordnet', dazu: 'bekommt', weg: 'verschenkt', einl: 'Im Kunstraum wird ein großes Bild gemalt.', einl2: 'Das Papier reicht fast bis zur Tür.', stoer: [['Das Bild hat {z} Farben.', 5, 12], ['Die Kunststunde dauert {z} Minuten.', 45, 90]] },
  { id: 'eier', fach: 'Tiere', ding: 'Eier', adj: ['braun', 'weiß'], beh: ['Karton', 'Kartons', 'm', 'Kartons'], verb: 'sammelt', dazu: 'findet', weg: 'verkauft', einl: 'Auf dem Bauernhof krähen die Hähne.', einl2: 'Der Hund bellt am Zaun.', stoer: [['Auf dem Hof leben {z} Kühe.', 3, 12], ['Der Stall ist {z} Meter lang.', 10, 40]] },
  { id: 'tulpen', fach: 'Garten', ding: 'Tulpen', legt: 'pflanzt', adj: ['gelb', 'rot'], beh: ['Beet', 'Beete', 'n', 'Beeten'], verb: 'pflanzt', dazu: 'pflanzt', weg: 'verschenkt', einl: 'Im Frühling wird der Garten bunt.', einl2: 'Die Erde ist noch feucht.', stoer: [['Der Garten ist {z} Meter lang.', 10, 30], ['Die Gießkanne fasst {z} Liter.', 5, 10]] },
  { id: 'fische', fach: 'Natur', ding: 'Fische', hat: 'sieht', legt: 'setzt', adj: ['gestreift', 'gepunktet'], beh: ['Becken', 'Becken', 'n', 'Becken'], verb: 'zählt', dazu: 'entdeckt', weg: 'verliert|aus den Augen', einl: 'Im Aquarium ist es dunkel und ruhig.', einl2: 'Ein Taucher putzt die Scheibe.', stoer: [['Das Wasser ist {z} Grad warm.', 22, 28], ['Das Aquarium hat {z} Räume.', 3, 9]] },
];
const KTX = KONTEXTE.reduce((m, k) => { m[k.id] = k; return m; }, {});
export const kontext = (id) => KTX[id];

const adjNom = (a) => a.split(' ').map((w, i, arr) => i === arr.length - 1 ? w + 'e' : w).join(' ');
const adjDat = (a) => a.split(' ').map((w, i, arr) => i === arr.length - 1 ? w + 'en' : w).join(' ');
const jedDat = (g) => (g === 'f' ? 'jeder' : 'jedem');
const jedAkk = (g) => (g === 'm' ? 'jeden' : g === 'f' ? 'jede' : 'jedes');
const einAkk = (g) => (g === 'm' ? 'einen' : g === 'f' ? 'eine' : 'ein');
const NENNER = { 2: 'Hälfte', 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 8: 'Achtel', 10: 'Zehntel' };
export function bruchwort(z, n) {
  if (n === 2 && z === 1) return 'die Hälfte';
  return (z === 1 ? 'ein' : zahlwort(z)) + ' ' + NENNER[n];
}
const malwort = (f) => (f === 2 ? 'doppelt' : zahlwort(f) + 'mal');

// ---------- Schemas ----------
// loese: unabhängige Formel für den gesuchten Wert; ausdruck: Rechnung als Text (wird im Prüfskript neu ausgewertet)
export const SCHEMAS = {
  tg: {
    keys: ['t1', 't2', 'g'],
    loese: (w, u) => (u === 'g' ? w.t1 + w.t2 : u === 't1' ? w.g - w.t2 : w.g - w.t1),
    ausdruck: (w, u) => (u === 'g' ? `${w.t1}+${w.t2}` : u === 't1' ? `${w.g}-${w.t2}` : `${w.g}-${w.t1}`),
    op: (w, u) => (u === 'g' ? '+' : '-'),
    sigUnb: () => 't2',
    geschichte(w, u, k, P, sig) {
      const [a0, a1] = k.adj;
      if (u === 'g') return {
        s: [{ t: `${P.name} ${k.verb} ${zf(w.t1)} ${adjNom(a0)} ${k.ding}.`, key: 't1' }, { t: `Außerdem ${k.verb} ${P.er} ${zf(w.t2)} ${adjNom(a1)} ${k.ding}.`, key: 't2' }],
        f: `Wie viele ${k.ding} sind es zusammen?`,
      };
      if (sig) return {
        s: [{ t: `${P.name} hat ${zf(w.t1)} ${adjNom(a0)} ${k.ding}.`, key: 't1' }, { t: `Zusammen mit den ${adjDat(a1)} sind es ${zf(w.g)} ${k.ding}.`, key: 'g' }],
        f: `Wie viele ${adjNom(a1)} ${k.ding} hat ${P.name}?`,
      };
      return {
        s: [{ t: `${P.name} ${k.hat || 'hat'} ${zf(w.g)} ${k.ding}.`, key: 'g' }, { t: `${zf(w.t1)} davon sind ${a0}.`, key: 't1', bezug: true }],
        f: `Wie viele ${k.ding} sind ${a1}?`,
      };
    },
    fehlt: (w, k, P) => ({ t1: `wie viele ${k.ding} ${k.adj[0]} sind`, t2: `wie viele ${k.ding} ${k.adj[1]} sind`, g: `wie viele ${k.ding} es insgesamt sind` }),
    balken: (w) => ({ zeilen: [{ name: 'Ganzes', segs: [{ key: 'g', wert: w.g }] }, { name: 'Teile', segs: [{ key: 't1', wert: w.t1 }, { key: 't2', wert: w.t2 }] }] }),
  },
  vg: {
    keys: ['gross', 'klein', 'diff'],
    loese: (w, u) => (u === 'gross' ? w.klein + w.diff : u === 'klein' ? w.gross - w.diff : w.gross - w.klein),
    ausdruck: (w, u) => (u === 'gross' ? `${w.klein}+${w.diff}` : u === 'klein' ? `${w.gross}-${w.diff}` : `${w.gross}-${w.klein}`),
    op: (w, u) => (u === 'gross' ? '+' : '-'),
    sigUnb: (rng) => (rng.u() < 0.5 ? 'gross' : 'klein'),
    geschichte(w, u, k, P, sig, Q) {
      if (u === 'diff') return {
        s: [{ t: `${P.name} hat ${zf(w.gross)} ${k.ding}.`, key: 'gross' }, { t: `${Q.name} hat ${zf(w.klein)} ${k.ding}.`, key: 'klein' }],
        f: `Wie viele ${k.ding} hat ${P.name} mehr als ${Q.name}?`,
      };
      if (u === 'klein') return sig ? {
        s: [{ t: `${P.name} hat ${zf(w.gross)} ${k.ding}.`, key: 'gross' }, { t: `Das sind ${zf(w.diff)} mehr als bei ${Q.name}.`, key: 'diff', bezug: true }],
        f: `Wie viele ${k.ding} hat ${Q.name}?`,
      } : {
        s: [{ t: `${P.name} hat ${zf(w.gross)} ${k.ding}.`, key: 'gross' }, { t: `${Q.name} hat ${zf(w.diff)} ${k.ding} weniger als ${P.name}.`, key: 'diff' }],
        f: `Wie viele ${k.ding} hat ${Q.name}?`,
      };
      return sig ? {
        s: [{ t: `${Q.name} hat ${zf(w.klein)} ${k.ding}.`, key: 'klein' }, { t: `Das sind ${zf(w.diff)} weniger als bei ${P.name}.`, key: 'diff', bezug: true }],
        f: `Wie viele ${k.ding} hat ${P.name}?`,
      } : {
        s: [{ t: `${Q.name} hat ${zf(w.klein)} ${k.ding}.`, key: 'klein' }, { t: `${P.name} hat ${zf(w.diff)} ${k.ding} mehr als ${Q.name}.`, key: 'diff' }],
        f: `Wie viele ${k.ding} hat ${P.name}?`,
      };
    },
    fehlt: (w, k, P, Q) => ({ gross: `wie viele ${k.ding} ${P.name} hat`, klein: `wie viele ${k.ding} ${Q.name} hat`, diff: `um wie viele ${k.ding} sich die beiden unterscheiden` }),
    balken: (w, P, Q) => ({ zeilen: [{ name: P.name, segs: [{ key: 'gross', wert: w.gross }] }, { name: Q.name, segs: [{ key: 'klein', wert: w.klein }, { key: 'diff', wert: w.diff, leer: true }] }] }),
  },
  vd: {
    keys: ['start', 'delta', 'ende'],
    loese: (w, u) => (u === 'ende' ? (w.plus ? w.start + w.delta : w.start - w.delta) : u === 'start' ? (w.plus ? w.ende - w.delta : w.ende + w.delta) : Math.abs(w.ende - w.start)),
    ausdruck: (w, u) => (u === 'ende' ? (w.plus ? `${w.start}+${w.delta}` : `${w.start}-${w.delta}`) : u === 'start' ? (w.plus ? `${w.ende}-${w.delta}` : `${w.ende}+${w.delta}`) : (w.plus ? `${w.ende}-${w.start}` : `${w.start}-${w.ende}`)),
    op: (w, u) => ((u === 'ende') === w.plus ? '+' : '-'),
    sigUnb: () => 'start',
    geschichte(w, u, k, P, sig) {
      const [wv, ws] = k.weg.split('|');
      const aend = w.plus ? `${k.dazu} ${P.er} ${zf(w.delta)} ${k.ding} dazu` : `${wv} ${P.er} ${zf(w.delta)} ${k.ding}${ws ? ' ' + ws : ''}`;
      if (u === 'ende') return { s: [{ t: `${P.name} hat ${zf(w.start)} ${k.ding}.`, key: 'start' }, { t: `Dann ${aend}.`, key: 'delta' }], f: `Wie viele ${k.ding} hat ${P.name} jetzt?` };
      if (u === 'delta') return {
        s: [{ t: `${P.name} hat zuerst ${zf(w.start)} ${k.ding}.`, key: 'start' }, { t: `Am Ende hat ${P.er} ${zf(w.ende)} ${k.ding}.`, key: 'ende' }],
        f: w.plus ? `Wie viele ${k.ding} sind dazugekommen?` : `Wie viele ${k.ding} sind weggekommen?`,
      };
      // Startwert gesucht (bei plus = Signalwort-Falle "dazu")
      const aend2 = w.plus ? `${P.name} ${k.dazu} ${zf(w.delta)} ${k.ding} dazu` : `${P.name} ${wv} ${zf(w.delta)} ${k.ding}${ws ? ' ' + ws : ''}`;
      return { s: [{ t: `${aend2}.`, key: 'delta' }, { t: `Jetzt hat ${P.er} ${zf(w.ende)} ${k.ding}.`, key: 'ende' }], f: `Wie viele ${k.ding} hatte ${P.name} vorher?` };
    },
    fehlt: (w, k, P) => ({ start: `wie viele ${k.ding} ${P.name} am Anfang hat`, delta: `wie viele ${k.ding} ${w.plus ? 'dazukommen' : 'weggehen'}`, ende: `wie viele ${k.ding} ${P.name} am Ende hat` }),
    balken: (w) => (w.plus
      ? { zeilen: [{ name: 'am Ende', segs: [{ key: 'ende', wert: w.ende }] }, { name: 'vorher + dazu', segs: [{ key: 'start', wert: w.start }, { key: 'delta', wert: w.delta }] }] }
      : { zeilen: [{ name: 'vorher', segs: [{ key: 'start', wert: w.start }] }, { name: 'am Ende + weg', segs: [{ key: 'ende', wert: w.ende }, { key: 'delta', wert: w.delta, leer: true }] }] }),
  },
  gr: {
    keys: ['anzahl', 'je', 'gesamt'],
    loese: (w, u) => (u === 'gesamt' ? w.anzahl * w.je : u === 'je' ? w.gesamt / w.anzahl : w.gesamt / w.je),
    ausdruck: (w, u) => (u === 'gesamt' ? `${w.anzahl}*${w.je}` : u === 'je' ? `${w.gesamt}/${w.anzahl}` : `${w.gesamt}/${w.je}`),
    op: (w, u) => (u === 'gesamt' ? '*' : '/'),
    sigUnb: () => 'anzahl',
    geschichte(w, u, k, P, sig) {
      const [b1, bn, bg] = k.beh;
      if (u === 'gesamt') return { s: [{ t: `${P.name} hat ${zf(w.anzahl)} ${bn}.`, key: 'anzahl' }, { t: `In ${jedDat(bg)} ${b1} sind ${zf(w.je)} ${k.ding}.`, key: 'je' }], f: `Wie viele ${k.ding} sind es insgesamt?` };
      if (u === 'je') return { s: [{ t: `${P.name} hat ${zf(w.gesamt)} ${k.ding}.`, key: 'gesamt' }, { t: `${gross(P.er)} verteilt sie gleichmäßig auf ${zf(w.anzahl)} ${bn}.`, key: 'anzahl', bezug: true }], f: `Wie viele ${k.ding} kommen in ${jedAkk(bg)} ${b1}?` };
      if (sig) return { s: [{ t: `${P.name} hat ${zf(w.gesamt)} ${k.ding}.`, key: 'gesamt' }, { t: `In ${jedAkk(bg)} ${b1} kommen je ${zf(w.je)} ${k.ding}.`, key: 'je' }], f: `Wie viele ${bn} braucht ${P.er}?` };
      return { s: [{ t: `${P.name} ${k.hat || 'hat'} ${zf(w.gesamt)} ${k.ding}.`, key: 'gesamt' }, { t: `${gross(P.er)} ${k.legt || 'legt'} immer ${zf(w.je)} ${k.ding} in ${einAkk(bg)} ${b1}.`, key: 'je' }], f: `Wie viele ${bn} braucht ${P.er}?` };
    },
    fehlt: (w, k) => ({ anzahl: `wie viele ${k.beh[1]} es sind`, je: `wie viele ${k.ding} in ${jedAkk(k.beh[2])} ${k.beh[0]} kommen`, gesamt: `wie viele ${k.ding} es insgesamt sind` }),
    balken: (w) => ({ zeilen: [{ name: 'Gruppen', segs: Array.from({ length: Math.min(w.anzahl, 12) }, () => ({ key: 'je', wert: w.je })), mehr: w.anzahl > 12 ? w.anzahl : 0, anzahlKey: 'anzahl', anzahl: w.anzahl }, { name: 'Ganzes', segs: [{ key: 'gesamt', wert: w.gesamt }] }] }),
  },
  gr2: {
    keys: ['anzahl', 'je', 'extra', 'gesamt'],
    loese: (w, u) => (u === 'gesamt' ? w.anzahl * w.je + w.extra : (w.gesamt - w.extra) / w.je),
    ausdruck: (w, u) => (u === 'gesamt' ? `${w.anzahl}*${w.je}+${w.extra}` : `(${w.gesamt}-${w.extra})/${w.je}`),
    op: (w, u) => (u === 'gesamt' ? '*+' : '-/'),
    sigUnb: () => 'anzahl',
    geschichte(w, u, k, P) {
      const [b1, bn, bg] = k.beh;
      if (u === 'gesamt') return { s: [{ t: `${P.name} hat ${zf(w.anzahl)} ${bn}.`, key: 'anzahl' }, { t: `In ${jedDat(bg)} ${b1} sind ${zf(w.je)} ${k.ding}.`, key: 'je' }, { t: `Dazu kommen noch ${zf(w.extra)} einzelne ${k.ding}.`, key: 'extra' }], f: `Wie viele ${k.ding} sind es insgesamt?` };
      return { s: [{ t: `${P.name} hat insgesamt ${zf(w.gesamt)} ${k.ding}.`, key: 'gesamt' }, { t: `${zf(w.extra)} davon liegen einzeln.`, key: 'extra', bezug: true }, { t: `Die anderen liegen zu je ${zf(w.je)} in ${k.beh[3]}.`, key: 'je', bezug: true }], f: `Wie viele ${bn} sind es?` };
    },
    fehlt: (w, k) => ({ anzahl: `wie viele ${k.beh[1]} es sind`, je: `wie viele ${k.ding} in ${jedAkk(k.beh[2])} ${k.beh[0]} sind`, extra: `wie viele ${k.ding} einzeln sind`, gesamt: `wie viele ${k.ding} es insgesamt sind` }),
    balken: (w) => ({ zeilen: [{ name: 'Gruppen + Rest', segs: [...Array.from({ length: Math.min(w.anzahl, 10) }, () => ({ key: 'je', wert: w.je })), { key: 'extra', wert: w.extra, leer: true }], anzahlKey: 'anzahl', anzahl: w.anzahl }, { name: 'Ganzes', segs: [{ key: 'gesamt', wert: w.gesamt }] }] }),
  },
  vgm: {
    keys: ['klein', 'faktor', 'gross'],
    loese: (w, u) => (u === 'gross' ? w.klein * w.faktor : w.gross / w.faktor),
    ausdruck: (w, u) => (u === 'gross' ? `${w.klein}*${w.faktor}` : `${w.gross}/${w.faktor}`),
    op: (w, u) => (u === 'gross' ? '*' : '/'),
    sigUnb: () => 'klein',
    geschichte(w, u, k, P, sig, Q) {
      if (u === 'gross') return { s: [{ t: `${Q.name} hat ${zf(w.klein)} ${k.ding}.`, key: 'klein' }, { t: `${P.name} hat ${malwort(w.faktor)} so viele ${k.ding} wie ${Q.name}.`, key: 'faktor' }], f: `Wie viele ${k.ding} hat ${P.name}?` };
      return { s: [{ t: `${P.name} hat ${zf(w.gross)} ${k.ding}.`, key: 'gross' }, { t: `Das sind ${malwort(w.faktor)} so viele wie bei ${Q.name}.`, key: 'faktor', bezug: true }], f: `Wie viele ${k.ding} hat ${Q.name}?` };
    },
    fehlt: (w, k, P, Q) => ({ klein: `wie viele ${k.ding} ${Q.name} hat`, faktor: `wievielmal so viele ${k.ding} ${P.name} hat`, gross: `wie viele ${k.ding} ${P.name} hat` }),
    balken: (w, P, Q) => ({ zeilen: [{ name: Q.name, segs: [{ key: 'klein', wert: w.klein }] }, { name: P.name, segs: Array.from({ length: w.faktor }, () => ({ key: 'klein', wert: w.klein })), anzahlKey: 'faktor', anzahl: w.faktor }] }),
  },
  ds: {
    keys: ['m1', 'w1', 'm2', 'w2'],
    loese: (w, u) => (u === 'w2' ? w.w1 / w.m1 * w.m2 : w.w2 / (w.w1 / w.m1)),
    ausdruck: (w, u) => (u === 'w2' ? `${w.w1}/${w.m1}*${w.m2}` : `${w.w2}/(${w.w1}/${w.m1})`),
    op: (w, u) => (u === 'w2' ? 'ds' : 'ds-1'),
    sigUnb: () => 'm2',
    geschichte(w, u, k, P) {
      const [b1, bn, bg, bd] = k.beh;
      const s1 = [{ t: `${P.name} hat ${zf(w.m1)} ${bn}.`, key: 'm1' }, { t: `Darin sind zusammen ${zf(w.w1)} ${k.ding}.`, key: 'w1', bezug: true }, { t: `In ${jedDat(bg)} ${b1} sind gleich viele.`, key: null, bezug: true }];
      if (u === 'w2') return { s: s1, f: `Wie viele ${k.ding} sind in ${zf(w.m2)} ${bd}?` };
      return { s: s1, f: `Wie viele ${bn} braucht man für ${zf(w.w2)} ${k.ding}?` };
    },
    fehlt: (w, k) => ({ m1: `wie viele ${k.beh[1]} es sind`, w1: `wie viele ${k.ding} es zusammen sind`, m2: `um wie viele ${k.beh[1]} es geht`, w2: `um wie viele ${k.ding} es geht` }),
    balken: (w) => ({ zeilen: [{ name: `${w.m1} Behälter`, segs: Array.from({ length: Math.min(w.m1, 12) }, () => ({ key: 'e', wert: w.w1 / w.m1 })), summe: { key: 'w1', wert: w.w1 } }, { name: `${w.m2} Behälter`, segs: Array.from({ length: Math.min(w.m2, 12) }, () => ({ key: 'e', wert: w.w1 / w.m1 })), summe: { key: 'w2', wert: w.w2 } }] }),
  },
  bt: {
    keys: ['ganzes', 'z', 'n', 'teil'],
    loese: (w, u) => (u === 'teil' ? w.ganzes / w.n * w.z : w.teil / w.z * w.n),
    ausdruck: (w, u) => (u === 'teil' ? `${w.ganzes}/${w.n}*${w.z}` : `${w.teil}/${w.z}*${w.n}`),
    op: (w, u) => (u === 'teil' ? 'bt' : 'bt-1'),
    sigUnb: () => 'ganzes',
    geschichte(w, u, k, P) {
      const bw = bruchwort(w.z, w.n);
      if (u === 'teil') return { s: [{ t: `${P.name} hat ${zf(w.ganzes)} ${k.ding}.`, key: 'ganzes' }, { bezug: true, t: `${gross(bw)} davon ${w.z > 1 ? 'sind' : 'ist'} ${k.adj[0]}.`, key: 'zn' }], f: `Wie viele ${k.ding} sind ${k.adj[0]}?` };
      return { s: [{ t: `${P.name} hat ${zf(w.teil)} ${adjNom(k.adj[0])} ${k.ding}.`, key: 'teil' }, { t: `Das ${w.z > 1 ? 'sind' : 'ist'} ${bw} aller ${k.ding} von ${P.name}.`, key: 'zn', bezug: true }], f: `Wie viele ${k.ding} hat ${P.name} insgesamt?` };
    },
    fehlt: (w, k) => ({ ganzes: `wie viele ${k.ding} es insgesamt sind`, zn: `welcher Anteil ${k.adj[0]} ist`, teil: `wie viele ${k.ding} ${k.adj[0]} sind` }),
    balken: (w) => ({ zeilen: [{ name: 'Ganzes', segs: [{ key: 'ganzes', wert: w.ganzes }] }, { name: `${w.n} gleiche Teile`, segs: Array.from({ length: w.n }, (_, i) => ({ key: i < w.z ? 'anteil' : 'rest', wert: w.ganzes / w.n, markiert: i < w.z })), summe: { key: 'teil', wert: w.teil, nurMarkiert: true } }] }),
  },
  pz: {
    keys: ['grund', 'satz', 'wert'],
    loese: (w, u) => (u === 'wert' ? w.grund * w.satz / 100 : u === 'grund' ? w.wert * 100 / w.satz : w.wert * 100 / w.grund),
    ausdruck: (w, u) => (u === 'wert' ? `${w.grund}*${w.satz}/100` : u === 'grund' ? `${w.wert}*100/${w.satz}` : `${w.wert}*100/${w.grund}`),
    op: (w, u) => 'pz-' + u,
    sigUnb: () => 'grund',
    geschichte(w, u, k, P) {
      if (u === 'wert') return { s: [{ t: `${P.name} hat ${zf(w.grund)} ${k.ding}.`, key: 'grund' }, { t: `${zf(w.satz)} Prozent davon sind ${k.adj[0]}.`, key: 'satz', bezug: true }], f: `Wie viele ${k.ding} sind ${k.adj[0]}?` };
      if (u === 'satz') return { s: [{ t: `${P.name} hat ${zf(w.grund)} ${k.ding}.`, key: 'grund' }, { t: `${zf(w.wert)} davon sind ${k.adj[0]}.`, key: 'wert', bezug: true }], f: `Wie viel Prozent der ${k.ding} sind ${k.adj[0]}?` };
      return { s: [{ t: `${P.name} hat ${zf(w.wert)} ${adjNom(k.adj[0])} ${k.ding}.`, key: 'wert' }, { t: `Das sind ${zf(w.satz)} Prozent aller ${k.ding} von ${P.name}.`, key: 'satz', bezug: true }], f: `Wie viele ${k.ding} hat ${P.name} insgesamt?` };
    },
    fehlt: (w, k) => ({ grund: `wie viele ${k.ding} es insgesamt sind`, satz: `wie viel Prozent ${k.adj[0]} sind`, wert: `wie viele ${k.ding} ${k.adj[0]} sind` }),
    balken: (w) => ({ zeilen: [{ name: '100 %', segs: [{ key: 'grund', wert: w.grund }] }, { name: `${w.satz} %`, segs: [{ key: 'wert', wert: w.wert }, { key: 'rest', wert: w.grund - w.wert, leer: true }] }] }),
  },
  gl: {
    keys: ['x', 'a', 'b', 'c'],
    loese: (w) => (w.c - w.b) / w.a,
    ausdruck: (w) => `(${w.c}-${w.b})/${w.a}`,
    op: () => 'gl',
    sigUnb: () => 'x',
    geschichte(w, u, k, P) {
      return { s: [{ t: `${P.name} denkt sich eine Zahl.`, key: null }, { t: `${gross(P.er)} nimmt sie mal ${zf(w.a)}.`, key: 'a' }, { t: `Dann zählt ${P.er} ${zf(w.b)} dazu.`, key: 'b' }, { t: `Heraus kommt ${zf(w.c)}.`, key: 'c' }], f: `Welche Zahl hat sich ${P.name} gedacht?`, ohneKontext: true };
    },
    fehlt: () => ({ a: 'womit die Zahl malgenommen wird', b: 'wie viel dazugezählt wird', c: 'was am Ende herauskommt' }),
    balken: (w) => ({ zeilen: [{ name: 'Ergebnis', segs: [{ key: 'c', wert: w.c }] }, { name: `${w.a}-mal die Zahl + ${w.b}`, segs: [...Array.from({ length: w.a }, () => ({ key: 'x', wert: w.x })), { key: 'b', wert: w.b }] }] }),
  },
};

// Nackter Zwilling: die reine Rechnung
const OPZ = { '+': '+', '-': '−', '*': '·', '/': ':' };
export function nackt(st) {
  const e = SCHEMAS[st.schema].ausdruck(st.w, st.unb);
  return e.replace(/\*/g, ' · ').replace(/\//g, ' : ').replace(/\+/g, ' + ').replace(/-/g, ' − ').replace(/(\d+)/g, (m) => zf(Number(m))) + ' = ?';
}
export const opTyp = (st) => SCHEMAS[st.schema].op(st.w, st.unb) + '|' + st.schema;
export const loese = (st) => SCHEMAS[st.schema].loese(st.w, st.unb);

// Soll-Balkenmodell mit "?" beim gesuchten Wert
export function balkenModell(st, P = { name: 'A' }, Q = { name: 'B' }) {
  const m = SCHEMAS[st.schema].balken(st.w, P, Q);
  m.unb = st.unb; m.schema = st.schema;
  return m;
}

// ---------- Geschichte erzeugen ----------
// opt: { ktx, sig, stoerer (Anzahl), fehlt (Schlüssel), kontext (Einleitungssätze 0..2), zahlwort (bool) }
export function geschichte(st, rng, opt = {}) {
  const S = SCHEMAS[st.schema];
  const k = opt.ktx ? kontext(opt.ktx) : rng.waehle(KONTEXTE);
  const P = opt.P || person(rng);
  const Q = opt.Q || person(rng, [P.name]);
  const unb = opt.sig ? (opt.sigUnb || S.sigUnb(rng)) : st.unb;
  const g = S.geschichte(st.w, unb, k, P, !!opt.sig, Q);
  let saetze = g.s.map(x => ({ ...x }));
  const werte = new Set(S.keys.map(key => st.w[key]).filter(v => typeof v === 'number'));
  // fehlende Angabe: einen gegebenen Satz streichen
  let fehltKey = null, fehltOptionen = null;
  if (opt.fehlt) {
    const kand = saetze.filter((x, i) => x.key && x.key !== unb && !x.key2 && !(saetze[i + 1] && saetze[i + 1].bezug));
    if (kand.length) {
      const weg = opt.fehlt === true ? rng.waehle(kand) : (kand.find(x => x.key === opt.fehlt) || rng.waehle(kand));
      saetze = saetze.filter(x => x !== weg);
      if (!saetze.some(x => x.t.includes(P.name))) {
        const re = new RegExp('\\b' + P.er + '\\b');
        const z = saetze.find(x => re.test(x.t));
        if (z) z.t = z.t.replace(re, P.name);
      }
      fehltKey = weg.key;
      const beschr = S.fehlt(st.w, k, P, Q);
      const andere = saetze.filter(x => x.key && x.key !== unb).map(x => x.key);
      fehltOptionen = { richtig: beschr[fehltKey], falsch: [...new Set(andere.map(a => beschr[a]).filter(Boolean))] };
    }
  }
  // Einleitung (Transfer-Merkmal: mehr Text)
  const vorne = [];
  if (opt.kontext >= 1 && !g.ohneKontext) vorne.push({ t: k.einl, key: null, kontext: true });
  if (opt.kontext >= 2 && !g.ohneKontext) saetze.splice(1, 0, { t: k.einl2, key: null, kontext: true });
  // Zahl als Wort
  if (opt.zahlwort) {
    const kand = saetze.filter(x => x.key && !x.key2 && typeof st.w[x.key] === 'number' && zahlwort(st.w[x.key]) && st.w[x.key] >= 2);
    if (kand.length) {
      const z = rng.waehle(kand); const v = st.w[z.key];
      z.t = z.t.replace(new RegExp(`(^|[^\\d,])${zf(v)}(?![\\d,])`), (m, a) => a + zahlwort(v));
      z.zahlwort = true;
    }
  }
  // überflüssige Angaben (Zahl, die nicht gebraucht wird)
  const stoer = [];
  const pool = [...k.stoer, [`${P.name} ist {z} Jahre alt.`, 6, 11], ['Es ist {z} Uhr.', 2, 6], [`Der Weg nach Hause dauert {z} Minuten.`, 5, 25]];
  const genutzt = new Set();
  for (let i = 0; i < (opt.stoerer || 0); i++) {
    const frei = pool.filter((_, j) => !genutzt.has(j));
    const j = pool.indexOf(rng.waehle(frei)); genutzt.add(j);
    const [tpl, lo, hi] = pool[j];
    let z, n = 0;
    do { z = rng.zahl(lo, hi); n++; } while ((werte.has(z) || stoer.some(s => s.wert === z)) && n < 50);
    stoer.push({ t: tpl.replace('{z}', zf(z)), key: null, stoer: true, wert: z });
  }
  for (const s of stoer) saetze.splice(rng.zahl(0, saetze.length), 0, s);
  const alle = [...vorne, ...saetze];
  return { saetze: alle, frage: g.f, unb, ktx: k.id, fach: k.fach, P, Q, fehltKey, fehltOptionen, text: alle.map(x => x.t).join(' ') + ' ' + g.f };
}
