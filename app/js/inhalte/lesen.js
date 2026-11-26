// Vorlagen Leseverständnis (Skala LV, als Hörversion HV vorgelesen). Erzeugte Texte mit Löser:
// jede Frage wird im Prüfskript unabhängig aus den "fakten" bzw. mit einem Löser (alle Möglichkeiten durchprobiert) beantwortet.
import { person, gross, auswahl, NAMEN } from './werkzeug.js';

export const NICHT_IM_TEXT = 'Das steht nicht im Text.';

const BILDWOERTER = [
  ['Haus', '🏠'], ['Baum', '🌳'], ['Ball', '⚽'], ['Hund', '🐕'], ['Maus', '🐭'], ['Auto', '🚗'], ['Mond', '🌙'], ['Fisch', '🐟'], ['Eis', '🍦'], ['Hut', '🎩'],
  ['Rad', '🚲'], ['Uhr', '⏰'], ['Kuh', '🐄'], ['Bär', '🐻'], ['Igel', '🦔'], ['Ente', '🦆'], ['Buch', '📖'], ['Herz', '❤️'], ['Zug', '🚂'], ['Brot', '🍞'],
  ['Katze', '🐈'], ['Sonne', '☀️'], ['Apfel', '🍎'], ['Stern', '⭐'], ['Blume', '🌸'], ['Schiff', '🚢'], ['Banane', '🍌'], ['Käse', '🧀'], ['Schuh', '👟'], ['Löwe', '🦁'],
  ['Pferd', '🐎'], ['Frosch', '🐸'], ['Schnecke', '🐌'], ['Rakete', '🚀'], ['Erdbeere', '🍓'], ['Regenschirm', '☂️'], ['Schmetterling', '🦋'], ['Schildkröte', '🐢'], ['Elefant', '🐘'], ['Hubschrauber', '🚁'],
];
const AEHNLICH = { Haus: 'Maus', Maus: 'Haus', Hut: 'Hund', Hund: 'Hut', Rad: 'Ball', Ball: 'Bär', Bär: 'Ball', Mond: 'Hund', Kuh: 'Uhr', Uhr: 'Kuh', Eis: 'Igel', Igel: 'Ente', Buch: 'Bär', Brot: 'Rad' };

const TIERE = [['Der Hund', '🐕', 'er'], ['Die Katze', '🐈', 'sie'], ['Der Hase', '🐇', 'er'], ['Die Ente', '🦆', 'sie'], ['Der Bär', '🐻', 'er'], ['Die Maus', '🐭', 'sie'], ['Der Frosch', '🐸', 'er'], ['Die Kuh', '🐄', 'sie']];
const TUN = ['schläft', 'springt', 'frisst', 'rennt', 'schwimmt', 'spielt'];
const FARBEN = ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß', 'braun', 'grau'];
const ORTE = [['im Garten', 'Garten'], ['im Park', 'Park'], ['am See', 'See'], ['im Wald', 'Wald'], ['auf dem Spielplatz', 'Spielplatz'], ['im Zoo', 'Zoo']];
const LAGE = [['unter dem Tisch', 'unter'], ['auf dem Tisch', 'auf'], ['neben dem Bett', 'neben'], ['hinter dem Sofa', 'hinter'], ['vor der Tür', 'vor'], ['in der Kiste', 'in']];
const DINGE = [['Der Ball', 'der Ball', 'er'], ['Die Tasche', 'die Tasche', 'sie'], ['Der Teddy', 'der Teddy', 'er'], ['Die Mütze', 'die Mütze', 'sie'], ['Das Buch', 'das Buch', 'es'], ['Der Schuh', 'der Schuh', 'er']];
const HAUSTIERE = [['einen Hund', 'Hund'], ['eine Katze', 'Katze'], ['einen Hasen', 'Hase'], ['einen Wellensittich', 'Wellensittich'], ['ein Meerschweinchen', 'Meerschweinchen'], ['einen Goldfisch', 'Goldfisch']];
const TIERNAMEN = ['Bello', 'Mimi', 'Flocke', 'Pünktchen', 'Rudi', 'Kiki', 'Struppi', 'Lotte'];
const HOBBYS = [['spielt Fußball', 'Fußball'], ['malt Bilder', 'Malen'], ['spielt Flöte', 'Flöte'], ['baut Höhlen', 'Höhlen bauen'], ['fährt Inliner', 'Inliner'], ['liest Comics', 'Comics']];
const REIME = [['Haus', 'Maus', 'Laus'], ['Baum', 'Traum', 'Schaum'], ['Hund', 'Mund', 'rund'], ['Ball', 'Stall', 'Knall'], ['Hose', 'Dose', 'Rose'], ['Tanne', 'Kanne', 'Pfanne'], ['Nase', 'Hase', 'Vase'], ['Tisch', 'Fisch'], ['Hand', 'Sand', 'Wand'], ['Bein', 'Stein', 'Schwein'], ['Topf', 'Kopf', 'Zopf'], ['Hut', 'Mut', 'gut'], ['Bach', 'Dach', 'Krach'], ['Kuchen', 'suchen', 'Buchen']];
const ZAEHLDINGE = [['Apfel', 'Äpfel', '🍎', 'ein'], ['Ball', 'Bälle', '⚽', 'ein'], ['Stern', 'Sterne', '⭐', 'ein'], ['Fisch', 'Fische', '🐟', 'ein'], ['Blume', 'Blumen', '🌸', 'eine'], ['Auto', 'Autos', '🚗', 'ein'], ['Ente', 'Enten', '🦆', 'eine'], ['Herz', 'Herzen', '❤️', 'ein']];
// [Satz mit _, richtig, falsch, falsch, falsch]
const LUECKE_SINN = [
  ['Der Fisch kann gut _.', 'schwimmen', 'fliegen', 'bellen', 'lesen'],
  ['Im Winter fällt oft _.', 'Schnee', 'Sand', 'Suppe', 'Saft'],
  ['Der Vogel sitzt auf dem _.', 'Ast', 'Teller', 'Wasser', 'Mond'],
  ['Mit der Schere kann man Papier _.', 'schneiden', 'trinken', 'singen', 'kochen'],
  ['Nachts scheint am Himmel der _.', 'Mond', 'Ball', 'Hund', 'Stuhl'],
  ['Die Kuh gibt uns _.', 'Milch', 'Eier', 'Holz', 'Steine'],
  ['Wenn es regnet, nehme ich einen _ mit.', 'Schirm', 'Ball', 'Teller', 'Hammer'],
  ['Zum Frühstück isst Lea ein _.', 'Brot', 'Haus', 'Auto', 'Bett'],
  ['Der Hund wedelt mit dem _.', 'Schwanz', 'Löffel', 'Buch', 'Fenster'],
  ['Im Sommer ist es oft _.', 'heiß', 'leise', 'eckig', 'hungrig'],
  ['Ben putzt sich die Zähne mit der _.', 'Zahnbürste', 'Gabel', 'Schaufel', 'Mütze'],
  ['Die Biene sammelt _.', 'Honig', 'Steine', 'Bücher', 'Schuhe'],
];
const LUECKE_FORM = [
  ['Die Kinder _ im Garten.', 'spielen', 'spielt', 'spiele', 'spielst'],
  ['Gestern _ Tim ins Kino.', 'ging', 'geht', 'gehen', 'gehst'],
  ['Ich _ heute Nudeln.', 'esse', 'isst', 'essen', 'esst'],
  ['Mia hat zwei _.', 'Brüder', 'Bruder', 'Brudern', 'Bruders'],
  ['Wir _ morgen ans Meer.', 'fahren', 'fährt', 'fahre', 'fährst'],
  ['Der Ball liegt unter _ Tisch.', 'dem', 'der', 'das', 'den'],
  ['Paul gibt _ Schwester das Buch.', 'seiner', 'seine', 'sein', 'seinen'],
  ['Das Wetter ist heute _ als gestern.', 'schöner', 'schön', 'schönste', 'am schönsten'],
  ['Du _ sehr schnell.', 'läufst', 'laufen', 'laufe', 'lauft'],
  ['Hast du _ Hund schon gefüttert?', 'den', 'die', 'das', 'dem'],
  ['Letzte Woche _ wir einen Ausflug.', 'machten', 'machen', 'macht', 'machst'],
  ['Die Äpfel sind _ als die Birnen.', 'süßer', 'süß', 'süßeste', 'am süßesten'],
];
const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const FUELLSAETZE = ['Die Sonne scheint.', 'Es ist ein warmer Tag.', 'Ein Vogel singt im Baum.', 'Von weitem hört man eine Glocke.', 'Der Himmel ist fast wolkenlos.', 'Es riecht nach frisch gemähtem Gras.'];

const opt = (r, richtig, falsch, n = 4) => auswahl(r, richtig, r.mischen(falsch).slice(0, n - 1));

export const LESEN = [
  // ---------- Erstes Lesen (Kl. 1): Anlaut, Wort zum Bild, Reim, Satz und Bild, Lückensatz ----------
  {
    id: 'le.anlaut', skala: 'LV', kompetenz: 'LF01', titel: 'Anlaut hören', anker: ['a'],
    stufen: [{ id: 'a', ls: 4, lsHV: 1 }, { id: 'b', ls: 6, lsHV: 2, bilder: true }],
    erzeuge(r, st) {
      if (st.bilder) {
        const pool = BILDWOERTER.filter(([x]) => !/^(Sch|Ei|Eu|Qu)/.test(x));
        const [w, e] = r.waehle(pool);
        const andere = r.einige(pool.filter(x => x[0][0] !== w[0]), 3).map(x => x[1]);
        const { wahl, antwort } = opt(r, e, andere);
        return { text: w[0], frage: `Welches Bild fängt mit ${w[0]} an?`, hvFrage: `Welches Bild fängt mit ${w[0]} an? Sag die Wörter leise vor dich hin.`, art: 'wahl', wahl, antwort, bildWahl: true, pruef: { anlautBild: { b: w[0], woerter: wahl.map(x => pool.find(p => p[1] === x)[0]) }, richtig: e } };
      }
      const [w, e] = r.waehle(BILDWOERTER.filter(([x]) => !/^(Sch|Ei|Eu|Qu)/.test(x)));
      const b = w[0];
      const andere = r.einige(['A', 'B', 'D', 'E', 'F', 'H', 'I', 'K', 'L', 'M', 'R', 'S', 'T', 'U', 'Z'].filter(x => x !== b), 3);
      const { wahl, antwort } = opt(r, b, andere);
      return { text: e, textBild: true, frage: 'Mit welchem Buchstaben fängt das Wort an?', hvFrage: `Hör gut zu: ${w}. Mit welchem Buchstaben fängt ${w} an?`, sprech: w, art: 'wahl', wahl, antwort, pruef: { anlaut: [w, b], richtig: b } };
    },
  },
  {
    id: 'le.wortwahl', skala: 'LV', kompetenz: 'LF02', titel: 'Wort zum Bild', anker: ['a'], hv: false,
    stufen: [{ id: 'a', ls: 6, kurz: true }, { id: 'b', ls: 9 }],
    erzeuge(r, st) {
      const pool = BILDWOERTER.filter(([w]) => (st.kurz ? w.length <= 4 : w.length >= 4 && w.length <= 7));
      const [w, e] = r.waehle(pool);
      const verdreht = w.length > 3 ? w[0] + w[2] + w[1] + w.slice(3) : null;
      const aehn = AEHNLICH[w];
      const echte = r.einige(BILDWOERTER.map(x => x[0]).filter(x => x !== w && x !== aehn && x.length <= w.length + 2), 3);
      const abl = [...(aehn ? [aehn] : []), ...(verdreht && !st.kurz && verdreht !== w ? [verdreht] : []), ...echte].slice(0, 3);
      const { wahl, antwort } = opt(r, w, abl);
      return { text: e, textBild: true, frage: 'Welches Wort passt zum Bild?', art: 'wahl', wahl, antwort, pruef: { wortbild: [w, e], richtig: w }, dls: aehn ? 1 : 0 };
    },
  },
  {
    id: 'le.reim', skala: 'LV', kompetenz: 'LF01', titel: 'Reimwörter', anker: [],
    stufen: [{ id: 'a', ls: 8, lsHV: 4 }],
    erzeuge(r) {
      const gi = r.zahl(0, REIME.length - 1);
      const [ziel, treffer] = r.einige(REIME[gi], 2);
      const andere = r.einige(REIME.filter((_, j) => j !== gi).reduce((x, g) => x.concat(g), []), 3);
      const { wahl, antwort } = opt(r, treffer, andere);
      return { text: ziel, frage: `Was reimt sich auf „${ziel}"?`, hvFrage: `Hör gut zu: ${ziel}. Was reimt sich auf ${ziel}?`, art: 'wahl', wahl, antwort, pruef: { reim: [ziel, treffer], richtig: treffer } };
    },
  },
  {
    id: 'le.satzstimmt', skala: 'LV', kompetenz: 'LV01', titel: 'Passt der Satz zum Bild?', anker: ['a'],
    stufen: [{ id: 'a', ls: 11, lsHV: 7 }, { id: 'b', ls: 15, lsHV: 10, mehr: true }],
    erzeuge(r, st) {
      const ZW = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf'];
      const nennen = (D, n) => (n === 1 ? `ist ${D[3]} ${D[0]}` : `sind ${ZW[n]} ${D[1]}`);
      for (;;) {
        const [A, B] = r.einige(ZAEHLDINGE, 2);
        const na = r.zahl(1, 5), nb = r.zahl(1, 5);
        if (!st.mehr) {
          const n = r.u() < 0.5 ? na : r.waehle([1, 2, 3, 4, 5].filter(x => x !== na));
          const stimmt = n === na;
          return { text: `Da ${nennen(A, n)}.`, bild: { typ: 'emoji', zeilen: [Array(na).fill(A[2]).join(' ')] }, frage: 'Passt der Satz zum Bild?', art: 'wahl', wahl: ['Ja', 'Nein'], antwort: stimmt ? 0 : 1, pruef: { bildZaehlen: { n: na, satzN: n }, richtig: stimmt ? 'Ja' : 'Nein' } };
        }
        if (na === nb) continue;
        const mehr = r.u() < 0.5;
        const stimmt = mehr ? na > nb : na < nb;
        return { text: `Es gibt ${mehr ? 'mehr' : 'weniger'} ${A[1]} als ${B[1]}.`, bild: { typ: 'emoji', zeilen: [Array(na).fill(A[2]).join(' '), Array(nb).fill(B[2]).join(' ')] }, frage: 'Passt der Satz zum Bild?', art: 'wahl', wahl: ['Ja', 'Nein'], antwort: stimmt ? 0 : 1, pruef: { bildVergleich: { na, nb, mehr }, richtig: stimmt ? 'Ja' : 'Nein' } };
      }
    },
  },
  {
    id: 'le.luecke', skala: 'LV', kompetenz: 'LV02', titel: 'Welches Wort passt?', anker: ['a'],
    stufen: [{ id: 'a', ls: 14, lsHV: 9, art: 'sinn' }, { id: 'b', ls: 18, lsHV: 12, art: 'form' }],
    erzeuge(r, st) {
      const [s, richtig, ...falsch] = r.waehle(st.art === 'sinn' ? LUECKE_SINN : LUECKE_FORM);
      const { wahl, antwort } = opt(r, richtig, falsch);
      return { text: s.replace('_', '…'), frage: 'Welches Wort passt in die Lücke?', hvFrage: `Hör gut zu: ${s.replace('_', 'hmm')} Welches Wort passt an die Stelle mit hmm?`, art: 'wahl', wahl, antwort, fakten: [s.replace('_', richtig)], pruef: { luecke: s, richtig } };
    },
  },
  {
    id: 'le.wortbild', skala: 'LV', kompetenz: 'LF02', titel: 'Wort und Bild', anker: ['a'],
    stufen: [{ id: 'a', ls: 5, lsHV: 0, kurz: true }, { id: 'b', ls: 8, lsHV: 2 }],
    erzeuge(r, st) {
      const pool = BILDWOERTER.filter(([w]) => (st.kurz ? w.length <= 4 : w.length >= 5));
      const [w, e] = r.waehle(pool);
      const aehn = BILDWOERTER.find(x => x[0] === AEHNLICH[w]);
      const andere = r.einige(BILDWOERTER.filter(x => x[0] !== w && x !== aehn), 3).map(x => x[1]);
      const { wahl, antwort } = opt(r, e, aehn ? [aehn[1], ...andere.slice(0, 2)] : andere);
      return { text: w, frage: 'Welches Bild passt zum Wort?', hvFrage: `Hör gut zu: ${w}. Welches Bild passt?`, art: 'wahl', wahl, antwort, bildWahl: true, pruef: { wortbild: [w, e] }, dls: aehn ? 1 : 0 };
    },
  },
  {
    id: 'le.satzbild', skala: 'LV', kompetenz: 'LV01', titel: 'Satz verstehen', anker: ['a'],
    stufen: [{ id: 'a', ls: 10, lsHV: 4, art: 'wer' }, { id: 'b', ls: 12, lsHV: 6, art: 'wo' }, { id: 'c', ls: 13, lsHV: 7, art: 'farbe' }],
    erzeuge(r, st) {
      if (st.art === 'wer') {
        const [T, e] = r.waehle(TIERE); const tun = r.waehle(TUN);
        const { wahl, antwort } = opt(r, e, TIERE.filter(t => t[1] !== e).map(t => t[1]));
        return { text: `${T} ${tun}.`, frage: `Wer ${tun}?`, art: 'wahl', wahl, antwort, bildWahl: true, fakten: [`${T} ${tun}.`], pruef: { frageNach: 'wer', richtig: e } };
      }
      if (st.art === 'wo') {
        const [D, d] = r.waehle(DINGE); const [lage] = r.waehle(LAGE);
        const { wahl, antwort } = opt(r, lage, LAGE.map(l => l[0]).filter(l => l !== lage));
        return { text: `${D} liegt ${lage}.`, frage: `Wo liegt ${d}?`, art: 'wahl', wahl, antwort, fakten: [`${D} liegt ${lage}.`], pruef: { richtig: lage } };
      }
      const [D, d] = r.waehle(DINGE); const f = r.waehle(FARBEN);
      const { wahl, antwort } = opt(r, f, FARBEN.filter(x => x !== f));
      const adj = { er: f + 'e', sie: f + 'e', es: f + 'e' }[DINGE.find(x => x[0] === D)[2]];
      return { text: `${D.split(' ')[0]} ${adj} ${D.split(' ')[1]} ist neu.`, frage: `Welche Farbe hat ${d}?`, art: 'wahl', wahl, antwort, pruef: { richtig: f } };
    },
  },
  {
    id: 'le.finden', skala: 'LV', kompetenz: 'LV02', titel: 'Angaben im Text finden', anker: ['b'], lt: true,
    stufen: [{ id: 'a', ls: 15, n: 3 }, { id: 'b', ls: 17, n: 5, ablenker: true }, { id: 'c', ls: 20, n: 7, zwei: true }, { id: 'd', ls: 24, n: 7, zwei: true, pronomen: true }, { id: 'e', ls: 28, n: 8, zwei: true, pronomen: true, verknuepft: true }],
    erzeuge(r, st) {
      const A = person(r), B = person(r, [A.name]);
      const [tierA, tierAn] = r.waehle(HAUSTIERE), tName = r.waehle(TIERNAMEN);
      const fA = r.waehle(FARBEN), fB = r.waehle(FARBEN.filter(x => x !== fA));
      const [ortA, ortAn] = r.waehle(ORTE); const tag = r.waehle(TAGE);
      const [hobA, hobAn] = r.waehle(HOBBYS), [hobB, hobBn] = r.waehle(HOBBYS.filter(h => h[0] !== hobA));
      const ER = st.pronomen ? A.Er : A.name;
      // Fakten: [Satz, Merkmal, Wert]
      void ortAn; void tag;
      const freund = B.g === 'f' ? 'die Freundin' : 'der Freund';
      const f = [
        [`${A.name} hat ${tierA}.`, 'tier', tierAn],
        [`Das Tier heißt ${tName}.`, 'name', tName],
        [`Am ${tag} geht ${A.name} mit ${tName} ${ortA} spazieren.`, 'ort', ortA],
      ];
      if (st.n >= 5) { f.push([`${ER} trägt eine ${fA}e Jacke.`, 'farbeA', fA]); f.push([`Die Leine von ${tName} ist ${fB}.`, 'leine', fB]); }
      if (st.zwei) { f.push([`${B.name} ist ${freund} von ${A.name}.`, 'freund', B.name]); f.push([`${st.pronomen ? B.Er : B.name} ${hobB}.`, 'hobbyB', hobBn]); }
      if (st.n >= 8) f.push([`${A.name} selbst ${hobA}.`, 'hobbyA', hobAn]);
      const fragen = [
        ['tier', `Was für ein Tier hat ${A.name}?`, HAUSTIERE.map(h => h[1])],
        ['ort', `Wo geht ${A.name} mit ${tName} spazieren?`, ORTE.map(o => o[0])],
      ];
      if (st.n >= 5) fragen.push(['farbeA', `Welche Farbe hat die Jacke von ${A.name}?`, FARBEN], ['leine', `Welche Farbe hat die Leine?`, FARBEN]);
      if (st.zwei) fragen.push(['hobbyB', st.verknuepft ? `Welches Hobby hat ${freund} von ${A.name}?` : `Welches Hobby hat ${B.name}?`, HOBBYS.map(h => h[1])]);
      let fr = r.waehle(fragen);
      if (st.zwei && st.verknuepft) fr = fragen[fragen.length - 1];
      const [merk, frage, alle] = fr;
      const fakt = f.find(x => x[1] === merk);
      const falsch = alle.filter(x => x !== fakt[2]);
      // ähnliche Ablenker: die andere Farbe aus dem Text zuerst
      const im = f.filter(x => x !== fakt && alle.includes(x[2])).map(x => x[2]);
      const { wahl, antwort } = auswahl(r, fakt[2], [...im, ...r.mischen(falsch.filter(x => !im.includes(x)))]);
      const saetze = f.map(x => x[0]);
      return { text: saetze.join(' '), frage, art: 'wahl', wahl, antwort, fakten: saetze, relevant: [saetze.indexOf(fakt[0])], pruef: { richtig: fakt[2], belegsatz: fakt[0] }, dls: im.length && st.ablenker ? 1 : 0 };
    },
  },
  {
    id: 'le.fuerwort', skala: 'LV', kompetenz: 'LV03', titel: 'Wer ist gemeint?', anker: ['a'],
    stufen: [{ id: 'a', ls: 18 }, { id: 'b', ls: 22, lang: true }],
    erzeuge(r, st) {
      const A = person(r); let B; do { B = person(r, [A.name]); } while (B.g === A.g);
      const [D, d] = r.waehle(DINGE);
      const T = st.lang
        ? [`${A.name} und ${B.name} spielen nach der Schule im Hof.`, `${A.Er} wirft ${d.replace(/^der/, 'den')} hoch in die Luft.`, `${B.Er} fängt ${DINGE.find(x => x[1] === d)[2] === 'er' ? 'ihn' : DINGE.find(x => x[1] === d)[2]} mit beiden Händen.`, `Dann lachen beide.`]
        : [`${A.name} gibt ${B.name} ${d.replace(/^der/, 'den')}.`, `${B.Er} freut sich sehr.`];
      const frage = st.lang ? `Wer fängt ${d.replace(/^der/, 'den')}?` : `Wer freut sich?`;
      const richtig = B.name;
      const { wahl, antwort } = auswahl(r, richtig, [A.name, 'beide', 'niemand']);
      return { text: T.join(' '), frage, art: 'wahl', wahl, antwort, pruef: { pronomen: { [A.Er]: A.name, [B.Er]: B.name }, richtig } };
    },
  },
  {
    id: 'le.deshalb', skala: 'LV', kompetenz: 'LV03', titel: 'Warum?', anker: [],
    stufen: [{ id: 'a', ls: 20, lsHV: 15 }, { id: 'b', ls: 24, umgekehrt: true }],
    erzeuge(r, st) {
      const P = person(r);
      const PAARE = [
        ['Es regnet stark.', 'nimmt einen Regenschirm mit', 'Weil es stark regnet.'],
        ['Die Suppe ist sehr heiß.', 'pustet auf den Löffel', 'Weil die Suppe sehr heiß ist.'],
        ['Draußen ist es dunkel geworden.', 'macht das Licht an', 'Weil es dunkel geworden ist.'],
        ['Der Bus fährt gleich ab.', 'rennt zur Haltestelle', 'Weil der Bus gleich abfährt.'],
        ['Die Pflanze lässt die Blätter hängen.', 'gießt die Pflanze', 'Weil die Pflanze die Blätter hängen lässt.'],
        ['Im Zimmer ist es sehr kalt.', 'zieht einen Pullover an', 'Weil es im Zimmer sehr kalt ist.'],
        ['Der Hund hat Hunger.', 'füllt den Napf', 'Weil der Hund Hunger hat.'],
        ['Die Musik ist sehr laut.', 'hält sich die Ohren zu', 'Weil die Musik sehr laut ist.'],
      ];
      const i = r.zahl(0, PAARE.length - 1); const [grund, tun, weil] = PAARE[i];
      const falsch = r.einige(PAARE.filter((_, j) => j !== i), 3).map(p => p[2]);
      const text = st.umgekehrt ? `${P.name} ${tun}. Das macht ${P.er}, denn ${grund.charAt(0).toLowerCase() + grund.slice(1)}` : `${grund} Deshalb ${tun.split(' ')[0]} ${P.name} ${tun.split(' ').slice(1).join(' ')}.`;
      const { wahl, antwort } = auswahl(r, weil, falsch);
      return { text, frage: `Warum ${tun.split(' ')[0]} ${P.name} ${tun.split(' ').slice(1).join(' ')}?`, art: 'wahl', wahl, antwort, pruef: { richtig: weil, paarIndex: i } };
    },
  },
  {
    id: 'le.reihe', skala: 'LV', kompetenz: 'LV04', titel: 'Reihenfolge', anker: ['a'],
    stufen: [{ id: 'a', ls: 20, misch: false }, { id: 'b', ls: 25, misch: true }, { id: 'c', ls: 30, misch: true, vier: true }],
    erzeuge(r, st) {
      const P = person(r);
      const SKRIPTE = [
        ['steht auf', 'putzt die Zähne', 'frühstückt', 'geht zur Schule'],
        ['holt das Mehl', 'rührt den Teig', 'backt den Kuchen', 'isst ein Stück'],
        ['packt die Tasche', 'fährt zum Schwimmbad', 'springt ins Wasser', 'trocknet sich ab'],
        ['kauft Samen', 'gräbt ein Loch', 'sät die Samen', 'gießt das Beet'],
        ['zieht die Schuhe an', 'läuft zum Park', 'spielt Fußball', 'geht nach Hause'],
      ];
      const sk = r.waehle(SKRIPTE).slice(0, st.vier ? 4 : 3);
      const n = sk.length;
      const wortZ = ['zuerst', 'als Zweites', 'als Drittes', 'zuletzt'];
      const v = (i) => { const [verb, ...rest] = sk[i].split(' '); return { verb, rest: rest.join(' ') }; };
      const inv = (i, wer) => `${v(i).verb} ${wer}${v(i).rest ? ' ' + v(i).rest : ''}`;
      const PART = ['auf', 'ein', 'los', 'ab', 'an', 'aus', 'mit', 'weg', 'zu'];
      const neben = (i) => { const { verb, rest } = v(i); if (!rest) return verb; const w = rest.split(' '); const last = w[w.length - 1]; return PART.includes(last) ? [...w.slice(0, -1), last + verb].join(' ') : rest + ' ' + verb; };
      let saetze;
      if (!st.misch) saetze = [`Zuerst ${inv(0, P.name)}.`, `Dann ${inv(1, P.er)}.`, ...(n === 4 ? [`Danach ${inv(2, P.er)}.`] : []), `Zum Schluss ${inv(n - 1, P.er)}.`];
      else {
        // vermischte Erzählreihenfolge: Nebensatz nur mit dem 3. Schritt (nie trennbares Verb)
        saetze = [`Bevor ${P.name} ${neben(2)}, ${inv(1, P.er)}.`, `Noch davor ${inv(0, P.er)}.`];
        if (n === 4) saetze.push(`Ganz am Ende ${inv(3, P.er)}.`);
      }
      const k = r.zahl(0, n - 1);
      const frage = `Was macht ${P.name} ${k === n - 1 ? 'zuletzt' : wortZ[k]}?`;
      const tex = (i) => `${P.Er} ${sk[i]}.`;
      const { wahl, antwort } = auswahl(r, tex(k), sk.map((_, i) => tex(i)));
      return { text: saetze.join(' '), frage, art: 'wahl', wahl, antwort, pruef: { reihenfolge: sk, frageIndex: k, richtig: tex(k) } };
    },
  },
  {
    id: 'le.wort', skala: 'LV', kompetenz: 'LV05', titel: 'Wort aus dem Zusammenhang', anker: ['a'],
    stufen: [{ id: 'a', ls: 25 }],
    erzeuge(r, st) {
      const W = r.waehle(['Bölk', 'Fimmel', 'Krosse', 'Plünse', 'Wudel', 'Zarp', 'Glimme', 'Trossel']);
      const RAHMEN = [
        [`Opa trinkt ein großes Glas kühlen ${W}.`, `Danach hat er keinen Durst mehr.`, 'ein Getränk'],
        [`Der ${W} bellt laut, als der Briefträger kommt.`, `Dann wedelt er mit dem Schwanz.`, 'ein Tier'],
        [`Mama schneidet das Brot mit dem ${W}.`, `Er ist sehr scharf.`, 'ein Werkzeug'],
        [`Lena zieht ihren warmen ${W} an.`, `Jetzt friert sie nicht mehr an den Ohren.`, 'ein Kleidungsstück'],
        [`Im ${W} wachsen hohe Bäume.`, `Man hört dort viele Vögel singen.`, 'ein Ort in der Natur'],
        [`Paul spielt auf seinem ${W} ein Lied.`, `Er bläst kräftig hinein.`, 'ein Musikinstrument'],
        [`Die ${W} schmeckt süß und saftig.`, `Sie wächst an einem Baum.`, 'eine Frucht'],
        [`Mit dem ${W} fährt die Familie in den Urlaub.`, `Er hat vier Räder und einen großen Kofferraum.`, 'ein Fahrzeug'],
      ];
      const i = r.zahl(0, RAHMEN.length - 1); const [s1, s2, kat] = RAHMEN[i];
      const andere = RAHMEN.filter((_, j) => j !== i).map(x => x[2]);
      const { wahl, antwort } = auswahl(r, kat, r.mischen(andere));
      return { text: st.zwei ? `${s1} ${s2}` : `${s1} ${s2}`, frage: `Was ist „${W}" wahrscheinlich?`, art: 'wahl', wahl, antwort, dls: st.zwei ? 0 : 0, pruef: { richtig: kat, rahmen: i } };
    },
  },
  {
    id: 'le.gefuehl', skala: 'LV', kompetenz: 'LV06', titel: 'Wie fühlt sich jemand?', anker: [],
    stufen: [{ id: 'a', ls: 27 }, { id: 'b', ls: 33, indirekt: true }],
    erzeuge(r, st) {
      const P = person(r);
      const S = [
        [`${P.name} hat den Teddy verloren. ${P.Er} sucht überall und kann ihn nicht finden.`, `${P.name} sitzt allein auf der Treppe und schaut auf den Boden.`, 'traurig'],
        [`Heute hat ${P.name} Geburtstag. Alle Freunde kommen zur Feier.`, `${P.name} hüpft durch die Wohnung und singt laut.`, 'fröhlich'],
        [`${P.name} hat das schwere Puzzle ganz allein fertig gemacht.`, `${P.name} zeigt das Puzzle jedem, der ins Zimmer kommt.`, 'stolz'],
        [`Im Dunkeln hört ${P.name} ein lautes Knacken im Flur.`, `${P.name} zieht die Decke bis über die Nase und hält die Luft an.`, 'ängstlich'],
        [`Der Bruder hat ${P.name} schon wieder das Fahrrad weggenommen, ohne zu fragen.`, `${P.name} stampft mit dem Fuß auf und schimpft laut.`, 'wütend'],
        [`${P.name} war den ganzen Tag wandern und ist spät nach Hause gekommen.`, `${P.name} gähnt und kann die Augen kaum noch offen halten.`, 'müde'],
      ];
      const i = r.zahl(0, S.length - 1);
      const andere = S.filter((_, j) => j !== i).map(x => x[2]);
      const { wahl, antwort } = auswahl(r, S[i][2], r.mischen(andere));
      return { text: st.indirekt ? S[i][1] : S[i][0], frage: `Wie fühlt sich ${P.name} wahrscheinlich?`, art: 'wahl', wahl, antwort, pruef: { richtig: S[i][2], situation: i } };
    },
  },
  {
    id: 'le.vergleich', skala: 'LV', kompetenz: 'LV13', titel: 'Vergleiche verknüpfen', anker: ['b'],
    stufen: [{ id: 'a', ls: 27, n: 3 }, { id: 'b', ls: 34, n: 4 }, { id: 'c', ls: 42, n: 4, neg: true }, { id: 'd', ls: 50, n: 5, neg: true }, { id: 'e', ls: 58, n: 5, neg: true, zweit: true }, { id: 'f', ls: 68, n: 6, neg: true, zweit: true }],
    erzeuge(r, st) {
      const ADJ = r.waehle([
        { komp: 'größer', gegen: 'kleiner', pos: 'groß', sup: 'am größten', supG: 'am kleinsten', rang: 'groß' },
        { komp: 'älter', gegen: 'jünger', pos: 'alt', sup: 'am ältesten', supG: 'am jüngsten', rang: 'alt' },
        { komp: 'schneller', gegen: 'langsamer', pos: 'schnell', sup: 'am schnellsten', supG: 'am langsamsten', rang: 'schnell' },
      ]);
      const namen = r.einige(NAMEN.map(n => n[0]), st.n);
      const ordnung = r.mischen(namen); // ordnung[0] ist "am größten"
      const aussagen = [];
      for (let i = 0; i < st.n - 1; i++) {
        const a = ordnung[i], b = ordnung[i + 1]; // a > b
        const art = st.neg ? r.zahl(0, 2) : r.zahl(0, 1);
        if (art === 0) aussagen.push({ t: `${a} ist ${ADJ.komp} als ${b}.`, a, b });
        else if (art === 1) aussagen.push({ t: `${b} ist ${ADJ.gegen} als ${a}.`, a, b });
        else aussagen.push({ t: `${b} ist nicht so ${ADJ.pos} wie ${a}.`, a, b });
      }
      const gemischt = r.mischen(aussagen);
      let frage, richtig;
      const t = r.zahl(0, st.zweit ? 2 : 1);
      if (t === 0) { frage = `Wer ist ${ADJ.sup}?`; richtig = ordnung[0]; }
      else if (t === 1) { frage = `Wer ist ${ADJ.supG}?`; richtig = ordnung[st.n - 1]; }
      else { frage = `Wer ist der oder die Zweit${ADJ.rang === 'groß' ? 'größte' : ADJ.rang === 'alt' ? 'älteste' : 'schnellste'}?`; richtig = ordnung[1]; }
      const { wahl, antwort } = auswahl(r, richtig, r.mischen(namen.filter(n => n !== richtig)));
      return { text: gemischt.map(x => x.t).join(' '), frage, art: 'wahl', wahl, antwort, pruef: { vergleich: { namen, paare: gemischt.map(x => [x.a, x.b]), frageTyp: t }, richtig } };
    },
  },
  {
    id: 'le.tabelle', skala: 'LV', kompetenz: 'LV09', titel: 'Tabelle und Text', anker: ['a'], lt: true,
    stufen: [{ id: 'a', ls: 36, k: 1 }, { id: 'b', ls: 42, k: 2 }, { id: 'c', ls: 48, k: 2, neg: true }, { id: 'd', ls: 56, k: 2, vergleich: true }, { id: 'e', ls: 62, k: 3, neg: true }, { id: 'f', ls: 70, k: 2, superlativ: true }, { id: 'g', ls: 80, k: 3, oder: true }],
    erzeuge(r, st) {
      for (let versuch = 0; versuch < 400; versuch++) {
        const namen = r.einige(NAMEN.map(n => n[0]), 5);
        const tiere = ['Katze', 'Hund', 'Hase', 'keins'], hob = ['Fußball', 'Malen', 'Lesen', 'Schwimmen'];
        const zeilen = namen.map(n => ({ name: n, alter: r.zahl(7, 12), tier: r.waehle(tiere), hobby: r.waehle(hob) }));
        const ART = { Katze: 'eine Katze', Hund: 'einen Hund', Hase: 'einen Hasen' };
        // satz: nach "Welches Kind …?", rel: nach "das …", neg: verneinte Form
        const B = {
          alt: () => { const x = r.zahl(8, 11); return { satz: `ist älter als ${x} Jahre`, rel: `älter als ${x} Jahre ist`, neg: `ist höchstens ${x} Jahre alt`, f: (z) => z.alter > x }; },
          tier: () => { const x = r.waehle(tiere.slice(0, 3)); return { satz: `hat ${ART[x]}`, rel: `${ART[x]} hat`, neg: `hat ${ART[x].replace(/^ein/, 'kein')}`, f: (z) => z.tier === x }; },
          hob: () => { const x = r.waehle(hob); return { satz: `mag ${x}`, rel: `${x} mag`, neg: `mag nicht ${x}`, f: (z) => z.hobby === x }; },
          keinTier: () => ({ satz: 'hat kein Haustier', rel: 'kein Haustier hat', neg: 'hat ein Haustier', f: (z) => z.tier === 'keins' }),
          nichtHob: () => { const x = r.waehle(hob); return { satz: `mag nicht ${x}`, rel: `nicht ${x} mag`, neg: `mag ${x}`, f: (z) => z.hobby !== x }; },
        };
        const arten = st.neg ? ['alt', 'tier', 'hob', 'keinTier', 'nichtHob'] : ['alt', 'tier', 'hob'];
        const gew = r.einige(arten, st.k).map(a => B[a]());
        let kand, frage;
        if (st.vergleich) {
          const ref = r.waehle(zeilen); const c = gew[0];
          kand = zeilen.filter(z => z.alter > ref.alter && c.f(z));
          frage = `Welches Kind ist älter als ${ref.name} und ${c.satz}?`;
        } else if (st.superlativ) {
          const c = gew[0]; const menge = zeilen.filter(c.f);
          if (menge.length < 2) continue;
          const min = Math.min(...menge.map(z => z.alter));
          kand = menge.filter(z => z.alter === min);
          frage = `Welches ist das jüngste Kind, das ${c.rel}?`;
        } else if (st.oder) {
          const [c1, c2, c3] = gew;
          kand = zeilen.filter(z => (c1.f(z) || c2.f(z)) && !c3.f(z));
          frage = `Welches Kind ${c1.satz} oder ${c2.satz} und ${c3.neg}?`;
        } else {
          kand = zeilen.filter(z => gew.every(c => c.f(z)));
          frage = `Welches Kind ${gew.map(c => c.satz).join(' und ')}?`;
        }
        if (kand.length !== 1) continue;
        const richtig = kand[0].name;
        const { wahl, antwort } = auswahl(r, richtig, r.mischen(namen.filter(n => n !== richtig)));
        const tabelle = { kopf: ['Name', 'Alter', 'Haustier', 'Hobby'], zeilen: zeilen.map(z => [z.name, String(z.alter), z.tier, z.hobby]) };
        const prosa = zeilen.map(z => `${z.name} ist ${z.alter} Jahre alt, hat ${z.tier === 'keins' ? 'kein Haustier' : (z.tier === 'Katze' ? 'eine Katze' : 'einen ' + (z.tier === 'Hase' ? 'Hasen' : 'Hund'))} und mag ${z.hobby}.`);
        return { text: 'Lies die Tabelle.', tabelle, prosa, frage, art: 'wahl', wahl, antwort, fakten: prosa, pruef: { tabelleZeilen: zeilen, richtig, bedingung: frage } };
      }
      throw new Error('tabelle: keine eindeutige Aufgabe');
    },
  },
  {
    id: 'le.logik', skala: 'LV', kompetenz: 'LV14', titel: 'Regeln und Schlüsse', anker: ['b', 'f'],
    stufen: [{ id: 'a', ls: 45, typ: 'mp' }, { id: 'b', ls: 52, typ: 'mt' }, { id: 'c', ls: 60, typ: 'fehl' }, { id: 'd', ls: 65, typ: 'mix1' }, { id: 'e', ls: 70, typ: 'kette' }, { id: 'f', ls: 76, typ: 'nurwer' }, { id: 'g', ls: 82, typ: 'mix2' }, { id: 'h', ls: 87, typ: 'xor' }, { id: 'i', ls: 92, typ: 'doppel' }, { id: 'j', ls: 97, typ: 'gross' }],
    erzeuge(r, st) { return logikAufgabe(r, st.typ); },
  },
];

// ---------- Logik-Lesen ----------
export const PRAEDIKATE = [
  { v: 'spielt', r: 'ein Instrument', rn: 'kein Instrument' }, { v: 'singt', r: 'im Chor' }, { v: 'hat', r: 'einen Hund', rn: 'keinen Hund' },
  { v: 'trägt', r: 'eine Brille', rn: 'keine Brille' }, { v: 'fährt', r: 'mit dem Bus zur Schule' }, { v: 'geht', r: 'in die Schwimm-AG' },
  { v: 'isst', r: 'gern Spinat' }, { v: 'wohnt', r: 'in der Stadt' }, { v: 'liest', r: 'jeden Abend' }, { v: 'malt', r: 'gern Bilder' },
  { v: 'hat', r: 'ein Fahrrad', rn: 'kein Fahrrad' }, { v: 'spielt', r: 'Schach', rn: 'kein Schach' },
];
const haupt = (p, n) => `${p.v} ${n ? (p.rn || 'nicht ' + p.r) : p.r}`;
const neben = (p, n) => `${n ? (p.rn || 'nicht ' + p.r) : p.r} ${p.v}`;
const inv = (p, n) => `${p.v} es ${n ? (p.rn || 'nicht ' + p.r) : p.r}`;
const frageP = (p, N) => `${gross(p.v)} ${N} ${p.r}?`;
export const LOGIK_ANTWORTEN = ['Ja', 'Nein', 'Das kann man nicht sicher wissen'];

// Regel: {art:'imp', a, na, b, nb} bedeutet (a xor na) -> (b xor nb); {art:'xor', a, b}
function regelText(R, P, r) {
  if (R.art === 'xor') return `Jedes Kind ${haupt(P[R.a], false)} oder ${haupt(P[R.b], false)}, aber nie beides.`;
  const A = P[R.a], B = P[R.b];
  const formen = [];
  formen.push(() => `Jedes Kind, das ${neben(A, R.na)}, ${haupt(B, R.nb)}.`);
  formen.push(() => `Wer ${neben(A, R.na)}, ${haupt(B, R.nb)}.`);
  formen.push(() => `Wenn ein Kind ${neben(A, R.na)}, dann ${inv(B, R.nb)}.`);
  if (R.nb && !R.na) formen.push(() => `Kein Kind, das ${neben(A, false)}, ${haupt(B, false)}.`);
  if (R.nurwer) return `Nur wer ${neben(B, R.nb)}, ${haupt(A, R.na)}.`;
  return r.waehle(formen)();
}
function faktText(f, P, N, doppelt) {
  if (doppelt) return `Es stimmt nicht, dass ${N} ${neben(P[f.p], !f.n)}.`;
  return `${N} ${haupt(P[f.p], f.n)}.`;
}
// Löser: alle Welten (Wahrheitswerte der Prädikate) durchprobieren
export function logikLoese(anzahl, regeln, fakten, frage) {
  let ja = 0, nein = 0;
  for (let m = 0; m < (1 << anzahl); m++) {
    const w = (i) => !!(m & (1 << i));
    let ok = true;
    for (const R of regeln) {
      if (R.art === 'xor') { if (w(R.a) === w(R.b)) { ok = false; break; } continue; }
      const vor = w(R.a) !== !!R.na, nach = w(R.b) !== !!R.nb;
      if (vor && !nach) { ok = false; break; }
    }
    if (!ok) continue;
    for (const f of fakten) if (w(f.p) === !!f.n) { ok = false; break; }
    if (!ok) continue;
    if (w(frage)) ja++; else nein++;
  }
  if (!ja && !nein) return null;
  return ja && !nein ? 0 : nein && !ja ? 1 : 2;
}

function logikAufgabe(r, typ) {
  for (let v = 0; v < 500; v++) {
    const P = r.einige(PRAEDIKATE, 4);
    const N = person(r).name;
    let regeln = [], fakten = [], frage, ziel = r.zahl(0, 2), doppelt = false, k = 2;
    const imp = (a, b, na = false, nb = false, x = {}) => ({ art: 'imp', a, b, na, nb, ...x });
    if (typ === 'mp') { regeln = [imp(0, 1)]; fakten = [{ p: 0, n: false }]; frage = 1; ziel = 0; }
    else if (typ === 'mt') { regeln = [imp(0, 1)]; fakten = [{ p: 1, n: true }]; frage = 0; ziel = 1; }
    else if (typ === 'fehl') { regeln = [imp(0, 1)]; if (r.u() < 0.5) { fakten = [{ p: 1, n: false }]; frage = 0; } else { fakten = [{ p: 0, n: true }]; frage = 1; } ziel = 2; }
    else if (typ === 'mix1') { regeln = [imp(0, 1, false, r.u() < 0.5)]; fakten = [{ p: r.zahl(0, 1), n: r.u() < 0.5 }]; frage = 1 - fakten[0].p; }
    else if (typ === 'kette') { k = 3; regeln = [imp(0, 1), imp(1, 2)]; fakten = r.u() < 0.5 ? [{ p: 0, n: false }] : [{ p: 2, n: true }]; frage = fakten[0].p === 0 ? 2 : 0; }
    else if (typ === 'nurwer') { regeln = [imp(0, 1, false, false, { nurwer: true })]; fakten = [{ p: r.zahl(0, 1), n: r.u() < 0.5 }]; frage = 1 - fakten[0].p; }
    else if (typ === 'mix2') { k = 3; regeln = [imp(0, 1, r.u() < 0.3, r.u() < 0.4), imp(r.zahl(1, 2) === 1 ? 1 : 2, r.u() < 0.5 ? 0 : 2, r.u() < 0.4, r.u() < 0.4)]; fakten = [{ p: r.zahl(0, 2), n: r.u() < 0.5 }]; frage = r.zahl(0, 2); }
    else if (typ === 'xor') { k = 3; regeln = [{ art: 'xor', a: 0, b: 1 }, imp(1, 2, false, r.u() < 0.5)]; fakten = [{ p: r.zahl(0, 2), n: r.u() < 0.5 }]; frage = r.zahl(0, 2); }
    else if (typ === 'doppel') { k = 3; doppelt = true; regeln = [imp(0, 1, false, r.u() < 0.5), imp(2, 0, r.u() < 0.5, false)]; fakten = [{ p: r.zahl(0, 2), n: r.u() < 0.5 }]; frage = r.zahl(0, 2); }
    else { k = 4; regeln = [imp(0, 1, false, r.u() < 0.4), imp(1, 2, r.u() < 0.4, false, { nurwer: r.u() < 0.4 }), imp(3, 0, false, r.u() < 0.5)]; fakten = [{ p: r.zahl(0, 3), n: r.u() < 0.5 }, { p: r.zahl(0, 3), n: r.u() < 0.5 }]; frage = r.zahl(0, 3); doppelt = r.u() < 0.5; }
    if (fakten.some(f => f.p === frage) || regeln.some(R => R.a === R.b)) continue;
    if (fakten.length === 2 && fakten[0].p === fakten[1].p) continue;
    const loes = logikLoese(k, regeln, fakten, frage);
    if (loes === null || loes !== ziel) continue;
    const text = ['Über die Kinder der Klasse 4b weiß man:', ...regeln.map(R => regelText(R, P, r)), ...fakten.map((f, i) => faktText(f, P, N, doppelt && i === 0))].join(' ');
    return { text, frage: frageP(P[frage], N), art: 'wahl', wahl: LOGIK_ANTWORTEN.slice(), antwort: loes, pruef: { logik: { k, regeln, fakten, frage }, richtig: LOGIK_ANTWORTEN[loes] } };
  }
  throw new Error('logik: keine Aufgabe ' + typ);
}

// ---------- Lese-Transfer (Sternwarte-Profil): dieselbe Frage in anderer Form ----------
// typ: 'ueb' überflüssige Sätze, 'feh' entscheidender Satz fehlt, 'dar' andere Darstellung
export function leseTransfer(a, typ, d, r) {
  const b = { ...a, wahl: a.wahl.slice(), lt: typ };
  const mitNichtImText = (richtigText) => {
    const w = b.wahl.filter(x => x !== NICHT_IM_TEXT).slice(0, 3);
    if (richtigText !== NICHT_IM_TEXT && !w.includes(richtigText)) w[0] = richtigText;
    w.push(NICHT_IM_TEXT);
    b.wahl = r.mischen(w); b.antwort = b.wahl.indexOf(richtigText);
  };
  const richtig = a.wahl[a.antwort];
  if (a.tabelle) {
    if (typ === 'dar') { b.text = a.prosa.join(' '); b.tabelle = null; mitNichtImText(richtig); }
    else if (typ === 'ueb') { b.tabelle = { kopf: [...a.tabelle.kopf, 'Lieblingsfarbe', 'Schuhgröße'], zeilen: a.tabelle.zeilen.map(z => [...z, r.waehle(FARBEN), String(r.zahl(28, 38))]) }; mitNichtImText(richtig); }
    else { // Spalte fehlt, die die Frage braucht
      const spalte = /Haustier|Katze|Hund|Hase/.test(a.frage) ? 2 : /Hobby|Fußball|Malen|Lesen|Schwimmen/.test(a.frage) ? 3 : 1;
      b.tabelle = { kopf: a.tabelle.kopf.filter((_, i) => i !== spalte), zeilen: a.tabelle.zeilen.map(z => z.filter((_, i) => i !== spalte)) };
      mitNichtImText(NICHT_IM_TEXT);
      b.pruef = { ...a.pruef, fehlendeSpalte: a.tabelle.kopf[spalte] };
    }
    return b;
  }
  const f = a.fakten.slice();
  if (typ === 'ueb') { const n = Math.max(1, d - 1); for (let i = 0; i < n; i++) f.splice(r.zahl(0, f.length), 0, FUELLSAETZE[(i + r.zahl(0, 5)) % FUELLSAETZE.length]); b.text = f.join(' '); mitNichtImText(richtig); }
  else if (typ === 'feh') { const weg = a.relevant[0]; b.text = f.filter((_, i) => i !== weg).join(' '); mitNichtImText(NICHT_IM_TEXT); b.pruef = { ...a.pruef, entfernt: f[weg] }; }
  else { b.text = null; b.liste = f; mitNichtImText(richtig); }
  return b;
}
