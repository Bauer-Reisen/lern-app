// Stufe 2: Logik und Knobeln (induktives Denken nach Klauer: Folgen, Klassifikation, Analogien, Matrizen, Schlussfolgern).
// Jede Stufe hat eine Lernstufe ls (LS = Klasse x 10). Alle Aufgaben werden erzeugt, Lösungen ergeben sich aus der Regel.
import { auswahl } from './werkzeug.js';

const BILDER = ['🍎', '⭐', '🐟', '🌸', '⚽', '🚗', '🐸', '☀️', '🎈', '🍌'];
const GRUPPEN = {
  Tiere: [['Hund', '🐕'], ['Katze', '🐈'], ['Kuh', '🐄'], ['Pferd', '🐎'], ['Hase', '🐇'], ['Bär', '🐻'], ['Maus', '🐭']],
  Obst: [['Apfel', '🍎'], ['Banane', '🍌'], ['Birne', '🍐'], ['Kirsche', '🍒'], ['Erdbeere', '🍓'], ['Traube', '🍇']],
  Fahrzeuge: [['Auto', '🚗'], ['Bus', '🚌'], ['Zug', '🚂'], ['Fahrrad', '🚲'], ['Schiff', '🚢'], ['Flugzeug', '✈️']],
  Kleidung: [['Hose', '👖'], ['Mütze', '🧢'], ['Schuh', '👟'], ['Kleid', '👗'], ['Socke', '🧦'], ['Jacke', '🧥']],
};
// Feinere Gruppen: drei mit gemeinsamer Eigenschaft, eines ohne (Eigenschaft in der Erklärung)
const FEIN = [
  { ja: ['Adler', 'Spatz', 'Ente', 'Biene', 'Fledermaus'], nein: ['Pinguin', 'Strauß', 'Hund', 'Fisch'], was: 'können fliegen' },
  { ja: ['Wal', 'Delfin', 'Hai', 'Forelle', 'Krake'], nein: ['Kamel', 'Löwe', 'Eule', 'Ziege'], was: 'leben im Wasser' },
  { ja: ['Löffel', 'Gabel', 'Messer', 'Teller'], nein: ['Hammer', 'Schere', 'Kissen', 'Kamm'], was: 'braucht man beim Essen' },
  { ja: ['Geige', 'Gitarre', 'Harfe', 'Cello'], nein: ['Trommel', 'Flöte', 'Trompete', 'Klavierhocker'], was: 'haben Saiten' },
  { ja: ['Montag', 'Mittwoch', 'Freitag', 'Dienstag'], nein: ['Januar', 'Sommer', 'Mittag', 'Ostern'], was: 'sind Wochentage' },
  { ja: ['Rose', 'Tulpe', 'Nelke', 'Lilie'], nein: ['Eiche', 'Tanne', 'Moos', 'Kaktus'], was: 'sind Blumen' },
];
const WORT_ANALOGIE = [
  ['Hund', 'bellt', 'Katze', 'miaut', ['bellt', 'schläft', 'frisst']],
  ['Vogel', 'Nest', 'Biene', 'Bienenstock', ['Höhle', 'Honig', 'Blume']],
  ['Hand', 'Handschuh', 'Fuß', 'Socke', ['Zeh', 'Bein', 'Hut']],
  ['heiß', 'kalt', 'hell', 'dunkel', ['warm', 'Licht', 'laut']],
  ['Baum', 'Wald', 'Stern', 'Himmel', ['Mond', 'Licht', 'Sonne']],
  ['Auge', 'sehen', 'Ohr', 'hören', ['riechen', 'Kopf', 'laut']],
  ['Brot', 'Bäcker', 'Haare', 'Friseur', ['Schere', 'Kamm', 'Arzt']],
  ['Kuh', 'Kalb', 'Pferd', 'Fohlen', ['Stall', 'Hengst', 'Ferkel']],
  ['Buch', 'lesen', 'Lied', 'singen', ['hören', 'Musik', 'schreiben']],
  ['Tag', 'Nacht', 'Sommer', 'Winter', ['Herbst', 'Sonne', 'warm']],
];
const NAMEN = ['Lea', 'Ben', 'Mia', 'Tom', 'Ela', 'Jan', 'Ida', 'Max', 'Noa', 'Kim'];
const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const zahlWahl = (r, richtig, falsch) => auswahl(r, String(richtig), falsch.filter(z => z !== richtig && z >= 0).map(String));

const ARTEN = {
  // Bilderfolge: Muster erkennen und fortsetzen
  folge(r, st) {
    const b = r.mischen(BILDER).slice(0, 4);
    const muster = { ab: [0, 1], aab: [0, 0, 1], abc: [0, 1, 2], abbc: [0, 1, 1, 2], abcd: [0, 1, 2, 3, 2, 1] }[st.muster];
    const lang = muster.length * 2 + r.zahl(0, muster.length - 1);
    const reihe = Array.from({ length: lang }, (_, i) => b[muster[i % muster.length]]);
    const richtig = b[muster[lang % muster.length]];
    const { wahl, antwort } = auswahl(r, richtig, b.filter(x => x !== richtig));
    return { text: reihe.join(' ') + ' ❓', sprech: 'Schau dir die Reihe an. Welches Bild kommt als Nächstes?', art: 'wahl', wahl, antwort, bildWahl: true, hinweis: 'Suche den Teil, der sich wiederholt.', erklaerung: `Das Muster wiederholt sich: ${muster.map(i => b[i]).join(' ')}.` };
  },
  // Was passt nicht? (grob: Gruppen mit Bildern; fein: gemeinsame Eigenschaft)
  passt(r, st) {
    if (st.fein) {
      const g = r.waehle(FEIN); const drei = r.mischen(g.ja).slice(0, 3); const aus = r.waehle(g.nein);
      const { wahl, antwort } = auswahl(r, aus, drei);
      return { text: 'Was passt nicht zu den anderen?', art: 'wahl', wahl, antwort, hinweis: 'Was haben drei davon gemeinsam?', erklaerung: `${drei.join(', ')} ${g.was}. ${aus} nicht.` };
    }
    const [g1, g2] = r.mischen(Object.keys(GRUPPEN)).slice(0, 2);
    const drei = r.mischen(GRUPPEN[g1]).slice(0, 3), aus = r.waehle(GRUPPEN[g2]);
    const f = (x) => x[1] + ' ' + x[0];
    const { wahl, antwort } = auswahl(r, f(aus), drei.map(f));
    return { text: 'Was passt nicht zu den anderen?', art: 'wahl', wahl, antwort, hinweis: 'Drei gehören zusammen.', erklaerung: `${drei.map(x => x[0]).join(', ')} gehören zu: ${g1}. ${aus[0]} nicht.` };
  },
  // Zahlen: was passt nicht?
  passtZahl(r, st) {
    let drei, aus, regel;
    if (st.regel === 'gerade') { drei = r.mischen([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]).slice(0, 3); aus = 2 * r.zahl(1, 12) - 1; regel = `${drei.join(', ')} sind gerade Zahlen, ${aus} ist ungerade.`; }
    else if (st.regel === 'vielfach') { const t = r.waehle([3, 4, 6, 7, 9]); drei = r.mischen([...Array(12)].map((_, i) => t * (i + 2))).slice(0, 3); do aus = r.zahl(10, t * 13); while (aus % t === 0); regel = `${drei.join(', ')} sind in der ${t}er-Reihe, ${aus} nicht.`; }
    else { const prim = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]; drei = r.mischen(prim).slice(0, 3); aus = r.waehle([9, 15, 21, 25, 27, 33, 35, 39, 49, 51]); regel = `${drei.join(', ')} sind Primzahlen (nur durch 1 und sich selbst teilbar). ${aus} nicht.`; }
    const { wahl, antwort } = auswahl(r, String(aus), drei.map(String));
    return { text: 'Welche Zahl passt nicht zu den anderen?', art: 'wahl', wahl, antwort, hinweis: st.regel === 'prim' ? 'Durch welche Zahlen kann man sie teilen?' : 'Was haben drei Zahlen gemeinsam?', erklaerung: regel };
  },
  // Analogie: A verhält sich zu B wie C zu ?
  analogie(r, st) {
    if (!st.zahl) {
      const [a, b, c, d, falsch] = r.waehle(WORT_ANALOGIE);
      const { wahl, antwort } = auswahl(r, d, falsch);
      return { text: `${a} → ${b}, so wie ${c} → ?`, sprech: `${a} gehört zu ${b}. Was gehört genauso zu ${c}?`, art: 'wahl', wahl, antwort, hinweis: `Wie hängen ${a} und ${b} zusammen?`, erklaerung: `${a} und ${b} hängen so zusammen wie ${c} und ${d}.` };
    }
    let f, txt;
    if (st.zahl === 1) { const k = r.zahl(2, 9); f = (x) => x + k; txt = `plus ${k}`; }
    else if (st.zahl === 2) { const k = r.zahl(2, 5); f = (x) => x * k; txt = `mal ${k}`; }
    else { const k = r.zahl(1, 5); f = (x) => 2 * x + k; txt = `mal 2 und dann plus ${k}`; }
    const a = r.zahl(2, 9), c = r.zahl(3, 12); const d = f(c);
    const { wahl, antwort } = zahlWahl(r, d, [d + 1, d - 1, c + (f(a) - a), d + 2, 2 * c]);
    return { text: `${a} → ${f(a)}, so wie ${c} → ?`, sprech: `${a} wird zu ${f(a)}. Was wird nach derselben Regel aus ${c}?`, art: 'wahl', wahl, antwort, hinweis: `Was wurde mit ${a} gemacht?`, erklaerung: `Die Regel ist ${txt}: ${c} wird zu ${d}.` };
  },
  // Zahlenquadrat: jede Zeile folgt derselben Regel
  matrix(r, st) {
    let zeilen, richtig, erkl;
    if (st.regel === 'plus') { const k = r.zahl(2, 9); zeilen = [0, 1, 2].map(() => { const s = r.zahl(1, 20); return [s, s + k, s + 2 * k]; }); erkl = `In jeder Zeile kommt immer ${k} dazu.`; }
    else if (st.regel === 'summe') { zeilen = [0, 1, 2].map(() => { const a = r.zahl(2, 20), b = r.zahl(2, 20); return [a, b, a + b]; }); erkl = 'In jeder Zeile ist die dritte Zahl die Summe der beiden ersten.'; }
    else { zeilen = [0, 1, 2].map(() => { const a = r.zahl(2, 9), b = r.zahl(2, 9); return [a, b, a * b]; }); erkl = 'In jeder Zeile ist die dritte Zahl das Produkt der beiden ersten.'; }
    richtig = zeilen[2][2];
    const { wahl, antwort } = zahlWahl(r, richtig, [richtig + 1, richtig - 1, zeilen[2][0] + zeilen[2][1], zeilen[2][0] * zeilen[2][1], richtig + 10]);
    const tab = zeilen.map((z, i) => i === 2 ? [String(z[0]), String(z[1]), '?'] : z.map(String));
    return { text: 'Welche Zahl gehört an die Stelle mit dem Fragezeichen?', tabelle: { kopf: ['', '', ''], zeilen: tab }, sprech: 'Schau dir das Zahlenquadrat an. Jede Zeile hat dieselbe Regel. Welche Zahl fehlt?', art: 'wahl', wahl, antwort, hinweis: 'Was passiert in der ersten Zeile? Prüfe es an der zweiten.', erklaerung: erkl + ` Also ${richtig}.` };
  },
  // Reihenfolge erschließen (größer als ...)
  reihe(r, st) {
    const n = st.n, leute = r.mischen(NAMEN).slice(0, n); // leute[0] am größten
    const paare = []; for (let i = 0; i < n - 1; i++) paare.push(`${leute[i]} ist größer als ${leute[i + 1]}.`);
    const frageKlein = r.u() < 0.5; const richtig = frageKlein ? leute[n - 1] : leute[0];
    const { wahl, antwort } = auswahl(r, richtig, leute.filter(x => x !== richtig));
    return { text: r.mischen(paare).join(' ') + ` Wer ist am ${frageKlein ? 'kleinsten' : 'größten'}?`, art: 'wahl', wahl, antwort, hinweis: 'Stell die Kinder in Gedanken der Größe nach auf.', erklaerung: `Der Größe nach: ${leute.join(', ')}. Also ${richtig}.` };
  },
  // Wochentage rechnen
  tage(r, st) {
    const i = r.zahl(0, 6), vor = st.weit ? r.zahl(3, 6) : r.zahl(1, 2), nach = st.weit ? r.zahl(8, 20) : r.zahl(1, 2);
    const heuteI = (i + vor) % 7, ziel = (heuteI + nach) % 7;
    const vt = vor === 1 ? 'Gestern' : vor === 2 ? 'Vorgestern' : `Vor ${vor} Tagen`; const nt = nach === 1 ? 'morgen' : nach === 2 ? 'übermorgen' : `in ${nach} Tagen`;
    const { wahl, antwort } = auswahl(r, TAGE[ziel], r.mischen(TAGE.filter((_, j) => j !== ziel)).slice(0, 3));
    return { text: `${vt} war ${TAGE[i]}. Welcher Tag ist ${nt}?`, art: 'wahl', wahl, antwort, hinweis: 'Finde zuerst heraus, welcher Tag heute ist.', erklaerung: `Heute ist ${TAGE[heuteI]}. ${nt[0].toUpperCase() + nt.slice(1)} ist ${TAGE[ziel]}.` };
  },
  // Schlussfolgern: folgt das wirklich?
  schluss(r, st) {
    const F = [
      ['Alle Bären mögen Honig.', 'Brumm ist ein Bär.', 'Mag Brumm Honig?', 0, 'Alle Bären mögen Honig, und Brumm ist ein Bär.'],
      ['Alle Kinder der Klasse haben einen Ranzen.', 'Lea ist in der Klasse.', 'Hat Lea einen Ranzen?', 0, 'Alle in der Klasse haben einen, Lea ist in der Klasse.'],
      ['Alle Katzen haben Schnurrhaare.', 'Mimi hat Schnurrhaare.', 'Ist Mimi eine Katze?', 2, 'Auch Hunde oder Mäuse haben Schnurrhaare. Daraus folgt es nicht.'],
      ['Wenn es regnet, ist die Straße nass.', 'Die Straße ist nass.', 'Hat es geregnet?', 2, 'Die Straße kann auch aus einem anderen Grund nass sein (z. B. Rasensprenger).'],
      ['Wenn es regnet, ist die Straße nass.', 'Die Straße ist trocken.', 'Hat es geregnet?', 1, 'Hätte es geregnet, wäre die Straße nass. Sie ist trocken, also nein.'],
      ['Kein Fisch kann bellen.', 'Flossi ist ein Fisch.', 'Kann Flossi bellen?', 1, 'Kein Fisch kann bellen, Flossi ist ein Fisch.'],
      ['Einige Vögel können nicht fliegen.', 'Piep ist ein Vogel.', 'Kann Piep fliegen?', 2, '„Einige“ heißt: nicht alle. Ob Piep fliegen kann, weiß man nicht.'],
      ['Wer den Bus verpasst, kommt zu spät.', 'Tom ist pünktlich.', 'Hat Tom den Bus verpasst?', 1, 'Hätte Tom den Bus verpasst, wäre er zu spät. Er ist pünktlich, also nein.'],
      ['Alle Quadrate sind Rechtecke.', 'Diese Form ist ein Rechteck.', 'Ist sie ein Quadrat?', 2, 'Nicht jedes Rechteck ist ein Quadrat. Daraus folgt es nicht.'],
    ].filter(f => st.schwer ? f[3] === 2 || f[3] === 1 : f[3] !== 2);
    const [a, b, q, ant, erkl] = r.waehle(F);
    const wahl = ['Ja', 'Nein', 'Kann man nicht wissen'];
    return { text: `${a} ${b} ${q}`, art: 'wahl', wahl: st.schwer ? wahl : wahl.slice(0, 2), antwort: ant, hinweis: 'Nimm nur, was wirklich da steht.', erklaerung: erkl };
  },
};

// Stufen von leicht nach schwer (ls = Lernstufe)
export const KNOBEL_STUFEN = [
  { id: 'f-ab', art: 'folge', muster: 'ab', ls: 6 },
  { id: 'p-grob', art: 'passt', ls: 9 },
  { id: 'f-aab', art: 'folge', muster: 'aab', ls: 12 },
  { id: 'f-abc', art: 'folge', muster: 'abc', ls: 16 },
  { id: 'a-wort', art: 'analogie', ls: 20 },
  { id: 'f-abbc', art: 'folge', muster: 'abbc', ls: 22 },
  { id: 'p-fein', art: 'passt', fein: true, ls: 25 },
  { id: 'r-3', art: 'reihe', n: 3, ls: 28 },
  { id: 'z-gerade', art: 'passtZahl', regel: 'gerade', ls: 30 },
  { id: 'a-plus', art: 'analogie', zahl: 1, ls: 32 },
  { id: 's-leicht', art: 'schluss', ls: 34 },
  { id: 'f-abcd', art: 'folge', muster: 'abcd', ls: 36 },
  { id: 't-nah', art: 'tage', ls: 38 },
  { id: 'm-plus', art: 'matrix', regel: 'plus', ls: 40 },
  { id: 'r-4', art: 'reihe', n: 4, ls: 44 },
  { id: 'a-mal', art: 'analogie', zahl: 2, ls: 46 },
  { id: 'm-summe', art: 'matrix', regel: 'summe', ls: 50 },
  { id: 'z-vielfach', art: 'passtZahl', regel: 'vielfach', ls: 54 },
  { id: 't-weit', art: 'tage', weit: true, ls: 58 },
  { id: 'r-5', art: 'reihe', n: 5, ls: 60 },
  { id: 's-schwer', art: 'schluss', schwer: true, ls: 64 },
  { id: 'm-mal', art: 'matrix', regel: 'mal', ls: 68 },
  { id: 'a-zwei', art: 'analogie', zahl: 3, ls: 72 },
  { id: 'z-prim', art: 'passtZahl', regel: 'prim', ls: 78 },
];

export function knobelAufgabe(r, stufe) { return ARTEN[stufe.art](r, stufe); }
