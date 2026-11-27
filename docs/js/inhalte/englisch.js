// Stufe 3: Englisch. Vom Hören (englische Stimme) über Wortschatz zu Satzverständnis und Grammatik.
// Aufgaben mit Feld sprache: 'en-GB' werden mit englischer Stimme vorgelesen (nur der englische Sprechtext).
import { auswahl } from './werkzeug.js';

const EN = 'en-GB';
// [englisch, deutsch, Bild]
const WORT = [
  ['dog', 'Hund', '🐕'], ['cat', 'Katze', '🐈'], ['apple', 'Apfel', '🍎'], ['house', 'Haus', '🏠'], ['car', 'Auto', '🚗'], ['sun', 'Sonne', '☀️'],
  ['tree', 'Baum', '🌳'], ['fish', 'Fisch', '🐟'], ['book', 'Buch', '📖'], ['ball', 'Ball', '⚽'], ['bird', 'Vogel', '🐦'], ['horse', 'Pferd', '🐎'],
  ['banana', 'Banane', '🍌'], ['moon', 'Mond', '🌙'], ['flower', 'Blume', '🌸'], ['cake', 'Kuchen', '🎂'], ['train', 'Zug', '🚂'], ['bike', 'Fahrrad', '🚲'],
  ['mouse', 'Maus', '🐭'], ['bear', 'Bär', '🐻'], ['milk', 'Milch', '🥛'], ['shoe', 'Schuh', '👟'], ['star', 'Stern', '⭐'], ['frog', 'Frosch', '🐸'],
];
const FARBEN = [['red', 'rot', '🟥'], ['blue', 'blau', '🟦'], ['green', 'grün', '🟩'], ['yellow', 'gelb', '🟨'], ['black', 'schwarz', '⬛'], ['white', 'weiß', '⬜'], ['orange', 'orange', '🟧'], ['purple', 'lila', '🟪']];
const ZAHLEN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const MEHR = [['school', 'Schule'], ['teacher', 'Lehrerin'], ['friend', 'Freund'], ['kitchen', 'Küche'], ['breakfast', 'Frühstück'], ['weather', 'Wetter'], ['holiday', 'Ferien'], ['birthday', 'Geburtstag'], ['brother', 'Bruder'], ['sister', 'Schwester'], ['to swim', 'schwimmen'], ['to read', 'lesen'], ['to sleep', 'schlafen'], ['to buy', 'kaufen'], ['happy', 'fröhlich'], ['tired', 'müde'], ['hungry', 'hungrig'], ['Wednesday', 'Mittwoch'], ['always', 'immer'], ['tomorrow', 'morgen']];
const FRAGEN = [
  ['What is your name?', 'My name is Tom.', ['I am fine.', 'I am nine.', 'It is blue.']],
  ['How old are you?', 'I am nine years old.', ['My name is Lea.', 'I like pizza.', 'It is Monday.']],
  ['How are you?', 'I am fine, thank you.', ['I am ten.', 'Yes, I have.', 'It is a dog.']],
  ['Where do you live?', 'I live in a small town.', ['I like football.', 'I am happy.', 'At seven o’clock.']],
  ['What is your favourite colour?', 'My favourite colour is green.', ['I have a cat.', 'It is raining.', 'I am eight.']],
  ['Have you got a pet?', 'Yes, I have got a hamster.', ['Yes, I am.', 'No, it is red.', 'I like apples.']],
  ['What time is it?', 'It is three o’clock.', ['It is Tuesday.', 'I am three.', 'It is sunny.']],
  ['Can you swim?', 'Yes, I can.', ['Yes, I am.', 'Yes, I have.', 'No, it isn’t.']],
];
const SAETZE = [
  ['The cat is under the table.', 'Die Katze ist unter dem Tisch.', ['Die Katze ist auf dem Tisch.', 'Der Hund ist unter dem Tisch.', 'Die Katze ist neben dem Bett.']],
  ['I have got two brothers.', 'Ich habe zwei Brüder.', ['Ich habe zwei Schwestern.', 'Ich habe drei Brüder.', 'Ich bin zwei Jahre alt.']],
  ['She likes apples but not bananas.', 'Sie mag Äpfel, aber keine Bananen.', ['Sie mag Bananen, aber keine Äpfel.', 'Sie mag Äpfel und Bananen.', 'Er mag Äpfel, aber keine Bananen.']],
  ['We go to school by bus.', 'Wir fahren mit dem Bus zur Schule.', ['Wir gehen zu Fuß zur Schule.', 'Wir fahren mit dem Bus nach Hause.', 'Wir fahren mit dem Rad zur Schule.']],
  ['It is cold and it is snowing.', 'Es ist kalt und es schneit.', ['Es ist warm und die Sonne scheint.', 'Es ist kalt und es regnet.', 'Es ist windig und warm.']],
  ['My dad cooks dinner every Sunday.', 'Mein Papa kocht jeden Sonntag das Abendessen.', ['Meine Mama kocht jeden Sonntag.', 'Mein Papa kocht jeden Samstag.', 'Mein Papa isst jeden Sonntag Frühstück.']],
];
// [Satz mit _, richtig, falsch …, Regel]
const GRAMMATIK = {
  s: [['She _ football every day.', 'plays', 'play', 'playing'], ['He _ to school.', 'goes', 'go', 'going'], ['My sister _ milk.', 'likes', 'like', 'liking'], ['Tom _ a dog.', 'has', 'have', 'haves'], ['The bird _ in the tree.', 'sings', 'sing', 'singing']],
  plural: [['one child – two _', 'children', 'childs', 'childrens'], ['one mouse – three _', 'mice', 'mouses', 'mices'], ['one foot – two _', 'feet', 'foots', 'feets'], ['one box – four _', 'boxes', 'boxs', 'boxies'], ['one man – five _', 'men', 'mans', 'mens'], ['one baby – two _', 'babies', 'babys', 'babyes']],
  past: [['Yesterday I _ to the zoo.', 'went', 'go', 'goed'], ['Last week we _ a film.', 'saw', 'see', 'seed'], ['She _ a cake yesterday.', 'made', 'make', 'maked'], ['They _ football yesterday.', 'played', 'play', 'plaied'], ['I _ a letter last night.', 'wrote', 'write', 'writed']],
  do: [['_ you like pizza?', 'Do', 'Does', 'Are'], ['_ she play the piano?', 'Does', 'Do', 'Is'], ['_ they live in London?', 'Do', 'Does', 'Are'], ['_ he speak English?', 'Does', 'Do', 'Is'], ['_ your cat sleep a lot?', 'Does', 'Do', 'Is']],
  komp: [['An elephant is _ than a mouse.', 'bigger', 'more big', 'biggest'], ['This is the _ day of the year.', 'hottest', 'hotter', 'most hot'], ['My bag is _ than yours.', 'heavier', 'heavyer', 'more heavy'], ['This book is _ than that one.', 'more interesting', 'interestinger', 'most interesting'], ['Tom is the _ boy in class.', 'tallest', 'taller', 'most tall']],
};
const REGEL = { s: 'he/she/it: an das Verb kommt ein -s.', plural: 'Diese Mehrzahl ist unregelmäßig oder hat eine Sonderregel – merken!', past: 'Gestern/letzte Woche: Vergangenheit (past simple). Viele Verben sind unregelmäßig.', do: 'Fragen mit he/she/it: Does, sonst Do.', komp: 'Kurze Wörter: -er/-est. Lange Wörter: more/most.' };

const SPRECHSAETZE = ['My name is Ben.', 'I am nine years old.', 'I like apples.', 'I have got a dog.', 'Can I have some water, please?', 'It is sunny today.', 'Where is the bathroom?', 'Thank you very much.', 'My favourite colour is blue.', 'I live in Germany.'];
const ARTEN = {
  // Sprechen: Kind hört, spricht nach; ein Erwachsener bewertet mit 3 Tasten (Auftrag: Eltern-Bestätigung)
  sprechen(r, st) {
    const satz = st.saetze ? r.waehle(SPRECHSAETZE) : r.waehle(WORT)[0];
    const wahl = ['👍 Gut gesagt', '👌 Fast', '🔁 Noch üben'];
    return { text: `🗣️ Hör zu und sprich laut nach: „${satz}“`, sprech: satz, sprache: EN, art: 'wahl', wahl, antwort: 0, wahlLang: true, elternTaste: true, hinweis: 'Tippe auf 🔊, hör noch einmal genau hin und sprich langsam nach.', erklaerung: `So klingt es: „${satz}“. Hör es dir mit 🔊 noch einmal an.` };
  },
  hoerBild(r, st) {
    const pool = st.farben ? FARBEN : WORT; const w = r.waehle(pool);
    const { wahl, antwort } = auswahl(r, w[2], r.mischen(pool.filter(x => x !== w)).slice(0, 3).map(x => x[2]));
    return { text: '🎧 Hör zu und tippe auf das passende Bild.', sprech: w[0], sprache: EN, art: 'wahl', wahl, antwort, bildWahl: true, hinweis: 'Tippe auf 🔊 und hör noch einmal genau hin.', erklaerung: `„${w[0]}“ heißt ${w[1]}.` };
  },
  hoerZahl(r) {
    const n = r.zahl(0, 20);
    const { wahl, antwort } = auswahl(r, String(n), [n + 1, n - 1, n + 10, n - 10, n + 2].filter(x => x >= 0 && x <= 30).map(String));
    return { text: '🎧 Hör zu: Welche Zahl ist das?', sprech: ZAHLEN[n], sprache: EN, art: 'wahl', wahl, antwort, hinweis: 'Tippe auf 🔊 und hör noch einmal hin.', erklaerung: `„${ZAHLEN[n]}“ ist ${n}.` };
  },
  leseBild(r) {
    const w = r.waehle(WORT);
    const { wahl, antwort } = auswahl(r, w[2], r.mischen(WORT.filter(x => x !== w)).slice(0, 3).map(x => x[2]));
    return { text: `Welches Bild passt zu „${w[0]}“?`, sprech: w[0], sprache: EN, art: 'wahl', wahl, antwort, bildWahl: true, hinweis: 'Lies das Wort leise und denk an ähnliche deutsche Wörter.', erklaerung: `„${w[0]}“ heißt ${w[1]}.` };
  },
  bildWort(r) {
    const w = r.waehle(WORT);
    const { wahl, antwort } = auswahl(r, w[0], r.mischen(WORT.filter(x => x !== w)).slice(0, 3).map(x => x[0]));
    return { text: `${w[2]}  Wie heißt das auf Englisch?`, sprech: wahl.join('. '), sprache: EN, art: 'wahl', wahl, antwort, hinweis: 'Tippe auf 🔊, dann hörst du alle vier Wörter.', erklaerung: `${w[1]} heißt auf Englisch „${w[0]}“.` };
  },
  vokabel(r) {
    const w = r.waehle(MEHR);
    const { wahl, antwort } = auswahl(r, w[0], r.mischen(MEHR.filter(x => x !== w)).slice(0, 3).map(x => x[0]));
    return { text: `Was heißt „${w[1]}“ auf Englisch?`, sprech: wahl.join('. '), sprache: EN, art: 'wahl', wahl, antwort, hinweis: 'Tippe auf 🔊 und hör dir die Wörter an.', erklaerung: `„${w[1]}“ heißt „${w[0]}“.` };
  },
  frage(r) {
    const [f, a, falsch] = r.waehle(FRAGEN);
    const { wahl, antwort } = auswahl(r, a, falsch);
    return { text: `Welche Antwort passt? „${f}“`, sprech: f, sprache: EN, art: 'wahl', wahl, antwort, wahlLang: true, hinweis: 'Achte auf das Fragewort: what, how, where …', erklaerung: `Auf „${f}“ passt „${a}“.` };
  },
  satz(r) {
    const [e, d, falsch] = r.waehle(SAETZE);
    const { wahl, antwort } = auswahl(r, d, falsch);
    return { text: `Was bedeutet der Satz? „${e}“`, sprech: e, sprache: EN, art: 'wahl', wahl, antwort, wahlLang: true, hinweis: 'Geh Wort für Wort durch.', erklaerung: `„${e}“ heißt: ${d}` };
  },
  grammatik(r, st) {
    const [s, richtig, ...falsch] = r.waehle(GRAMMATIK[st.regel]);
    const { wahl, antwort } = auswahl(r, richtig, falsch);
    return { text: `Was gehört in die Lücke? ${s.replace('_', '…')}`, sprech: s.replace('_', '…'), sprache: EN, art: 'wahl', wahl, antwort, hinweis: REGEL[st.regel], erklaerung: `${s.replace('_', richtig)} – ${REGEL[st.regel]}` };
  },
};

export const EN_STUFEN = [
  { id: 'en-hoer', art: 'hoerBild', ls: 8 },
  { id: 'en-farbe', art: 'hoerBild', farben: true, ls: 11 },
  { id: 'en-zahl', art: 'hoerZahl', ls: 15 },
  { id: 'en-lese', art: 'leseBild', ls: 20 },
  { id: 'en-bildwort', art: 'bildWort', ls: 25 },
  { id: 'en-sprechWort', art: 'sprechen', ls: 18 },
  { id: 'en-frage', art: 'frage', ls: 32 },
  { id: 'en-sprechSatz', art: 'sprechen', saetze: true, ls: 40 },
  { id: 'en-vokabel', art: 'vokabel', ls: 37 },
  { id: 'en-s', art: 'grammatik', regel: 's', ls: 42 },
  { id: 'en-satz', art: 'satz', ls: 46 },
  { id: 'en-plural', art: 'grammatik', regel: 'plural', ls: 52 },
  { id: 'en-do', art: 'grammatik', regel: 'do', ls: 57 },
  { id: 'en-past', art: 'grammatik', regel: 'past', ls: 62 },
  { id: 'en-komp', art: 'grammatik', regel: 'komp', ls: 67 },
];

export function enAufgabe(r, stufe) { return ARTEN[stufe.art](r, stufe); }
