// Stufe 2: Geometrie und Daten (ergänzt „Umfang und Fläche“, „Durchschnitt“, „Kombinieren“ aus Mathe).
// Formen und Körper, Symmetrie, Richtungen und Drehungen, Winkel, Koordinaten, Maßstab, Volumen,
// Tabellen und Diagramme lesen, Zentralwerte, Wahrscheinlichkeit. Jede Stufe hat eine Lernstufe ls.
import { auswahl } from './werkzeug.js';

const zw = (r, richtig, falsch) => auswahl(r, String(richtig), [...new Set(falsch.filter(z => z !== richtig && z >= 0))].map(String));
const FORMEN = [['Dreieck', 3], ['Viereck', 4], ['Fünfeck', 5], ['Sechseck', 6], ['Achteck', 8]];
const KOERPER = [['ein Würfel', 8, 12, 6], ['ein Quader', 8, 12, 6], ['eine Pyramide mit viereckiger Grundfläche', 5, 8, 5], ['ein Dreiecksprisma', 6, 9, 5]];
const SYM_JA = ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'];
const SYM_NEIN = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'];
const RICHT = ['Norden', 'Osten', 'Süden', 'Westen'];
const DINGE = [['Äpfel', '🍎'], ['Birnen', '🍐'], ['Bananen', '🍌'], ['Kirschen', '🍒'], ['Trauben', '🍇']];
const TIERE = ['Hund', 'Katze', 'Hase', 'Pferd', 'Meerschweinchen'];

const ARTEN = {
  ecken(r) {
    const [f, n] = r.waehle(FORMEN);
    const { wahl, antwort } = zw(r, n, [n - 1, n + 1, n + 2, n - 2]);
    return { text: `Wie viele Ecken hat ein ${f}?`, art: 'wahl', wahl, antwort, hinweis: 'Der Name verrät es.', erklaerung: `Ein ${f} hat ${n} Ecken und ${n} Seiten.` };
  },
  koerper(r) {
    const [k, e, ka, fl] = r.waehle(KOERPER); const was = r.waehle([['Ecken', e], ['Kanten', ka], ['Flächen', fl]]);
    const { wahl, antwort } = zw(r, was[1], [e, ka, fl, was[1] + 2, was[1] - 1]);
    return { text: `Wie viele ${was[0]} hat ${k}?`, art: 'wahl', wahl, antwort, hinweis: 'Stell dir den Körper vor und zähle von vorne nach hinten.', erklaerung: `${k[0].toUpperCase() + k.slice(1)} hat ${e} Ecken, ${ka} Kanten und ${fl} Flächen.` };
  },
  wuerfel(r) {
    const a = r.zahl(1, 6);
    const { wahl, antwort } = zw(r, 7 - a, [1, 2, 3, 4, 5, 6].filter(x => x !== a));
    return { text: `Bei einem Spielwürfel liegt die ${a} oben. Welche Zahl liegt unten?`, art: 'wahl', wahl, antwort, hinweis: 'Gegenüberliegende Seiten ergeben zusammen immer dieselbe Zahl.', erklaerung: `Gegenüberliegende Seiten ergeben zusammen 7: ${a} + ${7 - a} = 7.` };
  },
  symmetrie(r) {
    const ja = r.waehle(SYM_JA), nein = r.mischen(SYM_NEIN).slice(0, 3);
    const { wahl, antwort } = auswahl(r, ja, nein);
    return { text: 'Welcher Buchstabe ist achsensymmetrisch (man kann ihn so falten, dass beide Hälften genau aufeinanderpassen)?', sprech: 'Welcher Buchstabe ist achsensymmetrisch? Man kann ihn so falten, dass beide Hälften genau aufeinanderpassen.', art: 'wahl', wahl, antwort, hinweis: 'Stell dir einen Spiegel in der Mitte vor.', erklaerung: `${ja} hat eine Spiegelachse. ${nein.join(', ')} nicht.` };
  },
  drehen(r, st) {
    const start = r.zahl(0, 3), schritte = st.halb ? r.waehle([1, 2, 3]) : 1, rechts = r.u() < 0.5;
    const ziel = (start + (rechts ? schritte : 4 - schritte)) % 4;
    const dreh = schritte === 1 ? 'eine Vierteldrehung' : schritte === 2 ? 'eine halbe Drehung' : 'eine Dreivierteldrehung';
    const { wahl, antwort } = auswahl(r, RICHT[ziel], RICHT.filter((_, i) => i !== ziel));
    return { text: `Du schaust nach ${RICHT[start]} und machst ${dreh} nach ${rechts ? 'rechts' : 'links'}. Wohin schaust du jetzt?`, art: 'wahl', wahl, antwort, hinweis: 'Norden, Osten, Süden, Westen – so geht es rechts herum.', erklaerung: `Rechts herum: Norden → Osten → Süden → Westen. Du schaust nach ${RICHT[ziel]}.` };
  },
  winkelArt(r) {
    const g = r.waehle([30, 45, 60, 80, 90, 100, 120, 135, 150, 170]);
    const richtig = g < 90 ? 'spitzer Winkel' : g === 90 ? 'rechter Winkel' : 'stumpfer Winkel';
    const { wahl, antwort } = auswahl(r, richtig, ['spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel']);
    return { text: `Ein Winkel hat ${g}°. Was für ein Winkel ist das?`, sprech: `Ein Winkel hat ${g} Grad. Was für ein Winkel ist das?`, art: 'wahl', wahl, antwort, hinweis: 'Ein rechter Winkel hat genau 90°.', erklaerung: `Unter 90° spitz, genau 90° recht, zwischen 90° und 180° stumpf. ${g}° ist ein ${richtig}.` };
  },
  winkelSumme(r) {
    const a = r.zahl(30, 90), b = r.zahl(20, 150 - a), c = 180 - a - b;
    const { wahl, antwort } = zw(r, c, [c + 10, c - 10, 360 - a - b, 90 - a > 0 ? 90 - a : c + 20]);
    return { text: `In einem Dreieck sind zwei Winkel ${a}° und ${b}° groß. Wie groß ist der dritte Winkel (in °)?`, sprech: `In einem Dreieck sind zwei Winkel ${a} Grad und ${b} Grad groß. Wie groß ist der dritte Winkel?`, art: 'wahl', wahl, antwort, hinweis: 'Alle Winkel im Dreieck ergeben zusammen 180°.', erklaerung: `180° − ${a}° − ${b}° = ${c}°.` };
  },
  koordinaten(r) {
    const x = r.zahl(1, 4), y = r.zahl(1, 4);
    const zeilen = [4, 3, 2, 1].map(yy => [String(yy), ...[1, 2, 3, 4].map(xx => (xx === x && yy === y ? '⭐' : ''))]);
    // Ablenker: vertauscht, daneben
    const f = [`(${y}|${x})`, `(${x + 1}|${y})`, `(${x}|${y === 1 ? 2 : y - 1})`, `(${x === 1 ? 2 : x - 1}|${y})`];
    const { wahl, antwort } = auswahl(r, `(${x}|${y})`, f);
    return { text: 'Wo liegt der Stern? Zuerst die Zahl oben (Spalte), dann die Zahl links (Zeile).', tabelle: { kopf: ['', '1', '2', '3', '4'], zeilen }, sprech: 'Wo liegt der Stern? Zuerst die Zahl oben, dann die Zahl links.', art: 'wahl', wahl, antwort, hinweis: 'Fahre mit dem Finger vom Stern nach oben zur Zahl, dann vom Stern nach links zur Zahl.', erklaerung: `Über dem Stern steht ${x}, links daneben ${y}. Also (${x}|${y}).` };
  },
  massstab(r) {
    const m = r.waehle([100, 1000, 10000, 25000]), cm = r.zahl(2, 9); const echtCm = cm * m;
    const ein = (v) => (v >= 100000 ? `${(v / 100000).toLocaleString('de-DE')} km` : `${(v / 100).toLocaleString('de-DE')} m`);
    const txt = ein(echtCm), fal = [echtCm * 10, echtCm / 10, echtCm * 100].map(ein);
    const { wahl, antwort } = auswahl(r, txt, fal);
    return { text: `Eine Karte hat den Maßstab 1 : ${m.toLocaleString('de-DE')}. Auf der Karte sind zwei Orte ${cm} cm voneinander entfernt. Wie weit ist es in Wirklichkeit?`, art: 'wahl', wahl, antwort, hinweis: `1 cm auf der Karte sind ${m.toLocaleString('de-DE')} cm in Wirklichkeit.`, erklaerung: `${cm} cm · ${m.toLocaleString('de-DE')} = ${echtCm.toLocaleString('de-DE')} cm = ${txt}.` };
  },
  volumen(r) {
    const a = r.zahl(2, 6), b = r.zahl(2, 5), c = r.zahl(2, 4), v = a * b * c;
    const { wahl, antwort } = zw(r, v, [a * b + c, 2 * (a * b + b * c + a * c), a + b + c, v + a * b]);
    return { text: `Ein Quader aus Würfeln ist ${a} Würfel lang, ${b} Würfel breit und ${c} Würfel hoch. Aus wie vielen Würfeln besteht er?`, art: 'wahl', wahl, antwort, hinweis: 'Wie viele Würfel liegen in der untersten Schicht? Wie viele Schichten gibt es?', erklaerung: `Eine Schicht: ${a} · ${b} = ${a * b}. ${c} Schichten: ${a * b} · ${c} = ${v}.` };
  },
  tabelle(r, st) {
    const ds = r.mischen(DINGE).slice(0, 4), werte = ds.map(() => r.zahl(st.gross ? 12 : 2, st.gross ? 60 : 12));
    if (new Set(werte).size < 4) return this.tabelle(r, st);
    const max = Math.max(...werte), min = Math.min(...werte), iMax = werte.indexOf(max), iMin = werte.indexOf(min);
    const tab = { kopf: ['Obst', 'Anzahl'], zeilen: ds.map((d, i) => [d[1] + ' ' + d[0], st.strich ? '|'.repeat(werte[i]) : String(werte[i])]) };
    if (st.frage === 'meist') {
      const { wahl, antwort } = auswahl(r, ds[iMax][0], ds.filter((_, i) => i !== iMax).map(d => d[0]));
      return { text: 'Im Laden wurde gezählt. Wovon gibt es am meisten?', tabelle: tab, sprech: 'Im Laden wurde gezählt. Schau in die Tabelle. Wovon gibt es am meisten?', art: 'wahl', wahl, antwort, hinweis: 'Vergleiche die Anzahlen.', erklaerung: `${ds[iMax][0]}: ${max}, das ist am meisten.` };
    }
    const d = max - min;
    const { wahl, antwort } = zw(r, d, [max + min, max, d + 1, d - 1]);
    return { text: `Im Laden wurde gezählt. Wie viele ${ds[iMax][0]} gibt es mehr als ${ds[iMin][0]}?`, tabelle: tab, art: 'wahl', wahl, antwort, hinweis: 'Suche beide Zahlen und rechne den Unterschied.', erklaerung: `${max} − ${min} = ${d}.` };
  },
  diagramm(r) {
    const tiere = r.mischen(TIERE).slice(0, 4), w = tiere.map(() => r.zahl(1, 8));
    if (new Set(w).size < 4) return this.diagramm(r);
    const summe = w.reduce((a, b) => a + b, 0);
    const tab = { kopf: ['Lieblingstier', 'Stimmen'], zeilen: tiere.map((t, i) => [t, '▇'.repeat(w[i]) + ' ' + w[i]]) };
    const { wahl, antwort } = zw(r, summe, [summe + 1, summe - 2, Math.max(...w) * 4, summe + 4]);
    return { text: 'Eine Klasse hat abgestimmt. Wie viele Kinder haben insgesamt abgestimmt?', tabelle: tab, sprech: 'Eine Klasse hat über ihr Lieblingstier abgestimmt. Wie viele Kinder haben insgesamt abgestimmt?', art: 'wahl', wahl, antwort, hinweis: 'Zähle alle Stimmen zusammen.', erklaerung: `${w.join(' + ')} = ${summe}.` };
  },
  zentral(r, st) {
    const n = 5, zahlen = Array.from({ length: n }, () => r.zahl(1, 30)).sort((a, b) => a - b);
    if (new Set(zahlen).size < n) return this.zentral(r, st);
    const gezeigt = r.mischen(zahlen);
    if (st.was === 'median') {
      const m = zahlen[2];
      const { wahl, antwort } = zw(r, m, [gezeigt[2], Math.round(zahlen.reduce((a, b) => a + b, 0) / n), zahlen[1], zahlen[3]]);
      return { text: `Der Zentralwert (Median) ist die Zahl in der Mitte, wenn man der Größe nach sortiert. Wie heißt der Zentralwert von ${gezeigt.join(', ')}?`, art: 'wahl', wahl, antwort, hinweis: 'Zuerst sortieren!', erklaerung: `Sortiert: ${zahlen.join(', ')}. In der Mitte steht ${m}.` };
    }
    const sp = zahlen[n - 1] - zahlen[0];
    const { wahl, antwort } = zw(r, sp, [zahlen[n - 1], gezeigt[n - 1] - gezeigt[0], sp + 1, zahlen[n - 1] + zahlen[0]]);
    return { text: `Die Spannweite ist der Unterschied zwischen der größten und der kleinsten Zahl. Wie groß ist die Spannweite von ${gezeigt.join(', ')}?`, art: 'wahl', wahl, antwort, hinweis: 'Suche die größte und die kleinste Zahl.', erklaerung: `${zahlen[n - 1]} − ${zahlen[0]} = ${sp}.` };
  },
  zufall(r, st) {
    if (!st.bruch) {
      const F = [['Morgen geht die Sonne auf.', 'sicher'], ['Mit einem normalen Würfel würfelst du eine 7.', 'unmöglich'], ['Mit einem Würfel würfelst du eine 6.', 'möglich'], ['Aus einer Tüte mit nur roten Kugeln ziehst du eine rote.', 'sicher'], ['Aus einer Tüte mit nur roten Kugeln ziehst du eine blaue.', 'unmöglich'], ['Eine geworfene Münze zeigt Kopf.', 'möglich']];
      const [s, a] = r.waehle(F); const wahl = ['sicher', 'möglich', 'unmöglich'];
      return { text: `${s} Ist das sicher, möglich oder unmöglich?`, art: 'wahl', wahl, antwort: wahl.indexOf(a), hinweis: 'Kann es passieren? Muss es passieren?', erklaerung: `Das ist ${a}.` };
    }
    const rot = r.zahl(1, 6), blau = r.zahl(1, 6), ges = rot + blau;
    const { wahl, antwort } = auswahl(r, `${rot} von ${ges}`, [`${blau} von ${ges}`, `${rot} von ${blau}`, `1 von ${ges}`, `1 von 2`]);
    return { text: `In einer Tüte sind ${rot} rote und ${blau} blaue Kugeln. Wie groß ist die Chance, ohne Hinsehen eine rote zu ziehen?`, art: 'wahl', wahl, antwort, hinweis: 'Wie viele Kugeln sind es insgesamt? Wie viele davon sind rot?', erklaerung: `${rot} der ${ges} Kugeln sind rot: Die Chance ist ${rot} von ${ges}.` };
  },
};

export const GEO_STUFEN = [
  { id: 'g-ecken', art: 'ecken', ls: 10 },
  { id: 'd-tab-meist', art: 'tabelle', frage: 'meist', strich: true, ls: 13 },
  { id: 'g-wuerfel', art: 'wuerfel', ls: 17 },
  { id: 'd-zufall', art: 'zufall', ls: 20 },
  { id: 'd-tab-diff', art: 'tabelle', frage: 'diff', ls: 23 },
  { id: 'g-dreh', art: 'drehen', ls: 26 },
  { id: 'g-sym', art: 'symmetrie', ls: 28 },
  { id: 'd-diagramm', art: 'diagramm', ls: 30 },
  { id: 'g-koerper', art: 'koerper', ls: 34 },
  { id: 'g-dreh2', art: 'drehen', halb: true, ls: 37 },
  { id: 'g-koord', art: 'koordinaten', ls: 40 },
  { id: 'd-tab-gross', art: 'tabelle', frage: 'diff', gross: true, ls: 43 },
  { id: 'g-volumen', art: 'volumen', ls: 46 },
  { id: 'g-winkel', art: 'winkelArt', ls: 50 },
  { id: 'd-spann', art: 'zentral', was: 'spann', ls: 53 },
  { id: 'd-chance', art: 'zufall', bruch: true, ls: 56 },
  { id: 'g-massstab', art: 'massstab', ls: 60 },
  { id: 'd-median', art: 'zentral', was: 'median', ls: 63 },
  { id: 'g-winkelsumme', art: 'winkelSumme', ls: 66 },
];

export function geoAufgabe(r, stufe) { return ARTEN[stufe.art](r, stufe); }
