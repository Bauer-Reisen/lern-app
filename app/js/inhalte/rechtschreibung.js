// Stufe 3: Rechtschreibung. Richtige Schreibung erkennen, geordnet nach Rechtschreib-Strategien
// (Mitsprechen, Nachdenken: Verlängern/Ableiten, Merken). Jede Stufe hat eine Lernstufe ls.
import { auswahl } from './werkzeug.js';

// [richtig, falsch …]
const L = {
  doppel: [['Ball', 'Bal'], ['Sonne', 'Sone'], ['Mutter', 'Muter'], ['Teller', 'Teler'], ['Puppe', 'Pupe'], ['Kanne', 'Kane'], ['Wasser', 'Waser'], ['Schiff', 'Schif'], ['Himmel', 'Himel'], ['Zimmer', 'Zimer'], ['Brille', 'Brile'], ['Tasse', 'Tase']],
  ie: [['Biene', 'Bine'], ['Spiegel', 'Spigel'], ['Brief', 'Brif'], ['Wiese', 'Wise'], ['tief', 'tif'], ['Ziege', 'Zige'], ['spielen', 'spilen'], ['fliegen', 'fligen'], ['Riese', 'Rise'], ['schief', 'schif']],
  ckz: [['Decke', 'Deke', 'Dekke'], ['Katze', 'Kaze', 'Kazze'], ['Glück', 'Glük', 'Glükk'], ['Mütze', 'Müze', 'Müzze'], ['Zucker', 'Zuker', 'Zukker'], ['Blitz', 'Bliz', 'Blizz'], ['Brücke', 'Brüke', 'Brükke'], ['Platz', 'Plaz', 'Plazz'], ['Stück', 'Stük', 'Stükk'], ['Hitze', 'Hize', 'Hizze']],
  auslaut: [['Hund', 'Hunt', 'die Hunde'], ['Berg', 'Berk', 'die Berge'], ['Korb', 'Korp', 'die Körbe'], ['Wald', 'Walt', 'die Wälder'], ['Zwerg', 'Zwerk', 'die Zwerge'], ['Kind', 'Kint', 'die Kinder'], ['gelb', 'gelp', 'gelbe'], ['Bild', 'Bilt', 'die Bilder'], ['Tag', 'Tak', 'die Tage'], ['rund', 'runt', 'runde']],
  ae: [['Bäume', 'Beume', 'Baum'], ['Hände', 'Hende', 'Hand'], ['Mäuse', 'Meuse', 'Maus'], ['Äpfel', 'Epfel', 'Apfel'], ['Gläser', 'Gleser', 'Glas'], ['läuft', 'leuft', 'laufen'], ['Häuser', 'Heuser', 'Haus'], ['kälter', 'kelter', 'kalt'], ['Bäcker', 'Becker', 'backen'], ['Zähne', 'Zehne', 'Zahn']],
  dehn: [['fahren', 'faren'], ['Zahl', 'Zal'], ['Stuhl', 'Stul'], ['Uhr', 'Ur'], ['wohnen', 'wonen'], ['Sohn', 'Son'], ['fühlen', 'fülen'], ['Lehrer', 'Lerer'], ['Kuh', 'Ku'], ['Mehl', 'Mel']],
  ss: [['Straße', 'Strasse', 'Strase'], ['Fluss', 'Fluß', 'Flus'], ['groß', 'gross', 'gros'], ['Kuss', 'Kuß', 'Kus'], ['Fuß', 'Fuss', 'Fus'], ['Schloss', 'Schloß', 'Schlos'], ['heißen', 'heissen', 'heisen'], ['essen', 'eßen', 'esen'], ['Gruß', 'Gruss', 'Grus'], ['müssen', 'müßen', 'müsen']],
  fremd: [['Rhythmus', 'Rytmus', 'Rhytmus'], ['Theater', 'Teater', 'Theather'], ['Computer', 'Kompjuter', 'Computa'], ['Chaos', 'Kaos', 'Chaoss'], ['Physik', 'Füsik', 'Fysik'], ['Ingenieur', 'Inschenjör', 'Ingenör'], ['Restaurant', 'Restorant', 'Restaurang'], ['Interesse', 'Intresse', 'Interese'], ['Rhabarber', 'Rabarber', 'Rhabarba'], ['Portemonnaie', 'Portmonee', 'Portemonee']],
};
const NOMEN = [['Hund', 'rennt', 'schnell', 'und'], ['Haus', 'groß', 'baut', 'mit'], ['Ball', 'rollt', 'rund', 'auf'], ['Blume', 'blüht', 'schön', 'im'], ['Schule', 'lernt', 'leise', 'bei'], ['Freund', 'lacht', 'lustig', 'von']];
const DASS = [
  ['Ich hoffe, _ du kommst.', 'dass'], ['Das Buch, _ auf dem Tisch liegt, ist neu.', 'das'], ['Weißt du, _ heute Ferien sind?', 'dass'],
  ['_ Fahrrad ist rot.', 'Das'], ['Er sagt, _ er müde ist.', 'dass'], ['Ich mag _ Lied, _ du singst.', 'das'],
];
const GROSS = [
  ['Beim Laufen wird mir warm.', 'Beim laufen wird mir warm.'], ['Das Schwimmen macht Spaß.', 'Das schwimmen macht Spaß.'],
  ['Wir haben viel Schönes erlebt.', 'Wir haben viel schönes erlebt.'], ['Zum Lesen brauche ich Licht.', 'Zum lesen brauche ich Licht.'],
  ['Ich wünsche dir alles Gute.', 'Ich wünsche dir alles gute.'], ['Sie hat nichts Neues erzählt.', 'Sie hat nichts neues erzählt.'],
];
const KOMMA = [
  ['Ich bleibe zu Hause, weil es regnet.', 'Ich bleibe zu Hause weil es regnet.', 'Ich bleibe, zu Hause weil es regnet.'],
  ['Sie weiß, dass er kommt.', 'Sie weiß dass er kommt.', 'Sie, weiß dass er kommt.'],
  ['Als es klingelte, lief Tom zur Tür.', 'Als es klingelte lief Tom zur Tür.', 'Als es, klingelte lief Tom zur Tür.'],
  ['Wir kaufen Äpfel, Birnen und Pflaumen.', 'Wir kaufen Äpfel Birnen und Pflaumen.', 'Wir kaufen Äpfel, Birnen, und Pflaumen.'],
  ['Der Hund, der bellt, heißt Rex.', 'Der Hund der bellt heißt Rex.', 'Der Hund, der bellt heißt Rex.'],
  ['Wenn du Zeit hast, komm vorbei.', 'Wenn du Zeit hast komm vorbei.', 'Wenn du, Zeit hast komm vorbei.'],
];
const TIPP = {
  doppel: ['Sprich das Wort deutlich: Ist der Laut vor dem Mitlaut kurz?', 'Nach einem kurzen Selbstlaut wird der Mitlaut oft verdoppelt.'],
  ie: ['Ist das i lang?', 'Ein langes i schreibt man meistens ie.'],
  ckz: ['Ist der Selbstlaut davor kurz?', 'Nach kurzem Selbstlaut schreibt man ck und tz (nie kk und zz).'],
  dehn: ['Ist der Selbstlaut lang?', 'Dieses Wort hat ein Dehnungs-h. Das muss man sich merken.'],
  ss: ['Ist der Selbstlaut vor dem s-Laut lang oder kurz?', 'Nach langem Selbstlaut oder ei/au: ß. Nach kurzem Selbstlaut: ss.'],
  fremd: ['Das Wort kommt aus einer anderen Sprache.', 'Fremdwörter schreibt man oft wie in ihrer Herkunftssprache. Merkwort!'],
};

const ARTEN = {
  liste(r, st) {
    const w = r.waehle(L[st.liste]); const richtig = w[0];
    const falsch = st.liste === 'auslaut' || st.liste === 'ae' ? [w[1]] : w.slice(1);
    const { wahl, antwort } = auswahl(r, richtig, falsch);
    let tipp = TIPP[st.liste], erkl;
    if (st.liste === 'auslaut') { tipp = ['Verlängere das Wort: Was hörst du dann am Ende?']; erkl = `Verlängern hilft: ${w[2]} – darum ${richtig}.`; }
    else if (st.liste === 'ae') { tipp = ['Gibt es ein verwandtes Wort mit a oder au?']; erkl = `Ableiten hilft: ${w[2]} – darum ${richtig}.`; }
    else erkl = `Richtig ist „${richtig}“. ${tipp[1]}`;
    return { text: 'Welches Wort ist richtig geschrieben?', sprech: 'Welches Wort ist richtig geschrieben? Lies genau.', art: 'wahl', wahl, antwort, hinweis: tipp[0], erklaerung: erkl };
  },
  nomen(r) {
    const [n, ...rest] = r.waehle(NOMEN);
    const { wahl, antwort } = auswahl(r, n, rest);
    return { text: 'Welches Wort schreibt man groß?', art: 'wahl', wahl: wahl.map(x => x.toLowerCase()), antwort, hinweis: 'Kann man „der“, „die“ oder „das“ davorsetzen?', erklaerung: `Man sagt „der/die/das ${n}“. Nomen schreibt man groß: ${n}.` };
  },
  dass(r) {
    const [s, a] = r.waehle(DASS);
    const zwei = s.split('_').length > 2;
    const satz = zwei ? s.replace('_', 'das').replace('_', '…') : s.replace('_', '…');
    const richtig = a === 'Das' ? 'Das' : a, wahl = a === 'Das' ? ['Das', 'Dass'] : ['das', 'dass'];
    return { text: `Was gehört in die Lücke? ${satz}`, sprech: 'Was gehört in die Lücke: das mit einem s oder dass mit zwei s?', art: 'wahl', wahl, antwort: wahl.indexOf(richtig), hinweis: 'Kann man „dieses“ oder „welches“ einsetzen? Dann „das“.', erklaerung: richtig.toLowerCase() === 'das' ? 'Hier passt „dieses“ oder „welches“, also „das“.' : '„dass“ leitet einen Nebensatz ein, für „dieses“ oder „welches“ passt es nicht.' };
  },
  gross(r) {
    const [richtig, falsch] = r.waehle(GROSS);
    const { wahl, antwort } = auswahl(r, richtig, [falsch]);
    return { text: 'Welcher Satz ist richtig geschrieben?', art: 'wahl', wahl, antwort, wahlLang: true, hinweis: 'Steht „beim“, „das“, „zum“, „viel“, „nichts“ oder „alles“ davor? Dann wird das Wort zum Nomen.', erklaerung: `Richtig: „${richtig}“ Mit Begleiter wird ein Verb oder Adjektiv zum Nomen und groß geschrieben.` };
  },
  komma(r) {
    const [richtig, ...falsch] = r.waehle(KOMMA);
    const { wahl, antwort } = auswahl(r, richtig, falsch);
    return { text: 'Wo stehen die Kommas richtig?', art: 'wahl', wahl, antwort, wahlLang: true, hinweis: 'Suche die Wörter „weil“, „dass“, „als“, „wenn“, „der“ oder eine Aufzählung.', erklaerung: `Richtig: „${richtig}“ Nebensätze und Aufzählungen werden mit Komma abgetrennt (vor „und“ nicht).` };
  },
};

export const RS_STUFEN = [
  { id: 'rs-nomen', art: 'nomen', ls: 12 },
  { id: 'rs-doppel', art: 'liste', liste: 'doppel', ls: 17 },
  { id: 'rs-ie', art: 'liste', liste: 'ie', ls: 21 },
  { id: 'rs-ckz', art: 'liste', liste: 'ckz', ls: 25 },
  { id: 'rs-auslaut', art: 'liste', liste: 'auslaut', ls: 29 },
  { id: 'rs-ae', art: 'liste', liste: 'ae', ls: 33 },
  { id: 'rs-dehn', art: 'liste', liste: 'dehn', ls: 37 },
  { id: 'rs-ss', art: 'liste', liste: 'ss', ls: 44 },
  { id: 'rs-dass', art: 'dass', ls: 52 },
  { id: 'rs-gross', art: 'gross', ls: 58 },
  { id: 'rs-komma', art: 'komma', ls: 63 },
  { id: 'rs-fremd', art: 'liste', liste: 'fremd', ls: 70 },
];

export function rsAufgabe(r, stufe) { return ARTEN[stufe.art](r, stufe); }
