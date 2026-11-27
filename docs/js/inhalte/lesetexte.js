// Von Hand geschriebene Lesetexte (Skala LV/HV). Jeder Eintrag: Text, Fragen mit Lösung und Ablenkern.
// Sachwissen steht nur in Texten mit Feld "quelle". Erzählungen sind ausgedacht und brauchen keine Quelle.
import { auswahl } from './werkzeug.js';
import { TEXTE_MEHR } from './lesetexte-mehr.js';

// Kurze Texte für Textart und Absicht
const MINI = [
  { t: 'Der Wind singt leise Lieder, / die Blätter tanzen mit. / Der Herbst kommt immer wieder / mit seinem bunten Schritt.', art: 'ein Gedicht', absicht: 'unterhalten und Freude machen' },
  { t: 'Du brauchst: 200 g Mehl, 2 Eier, 300 ml Milch. Verrühre alles zu einem glatten Teig. Backe in einer heißen Pfanne dünne Pfannkuchen.', art: 'ein Rezept', absicht: 'erklären, wie man etwas macht' },
  { t: 'Liebe Ella, ich feiere am Samstag um 15 Uhr meinen Geburtstag. Kommst du? Bitte sag mir bis Donnerstag Bescheid. Dein Theo', art: 'eine Einladung', absicht: 'jemanden zu etwas einladen' },
  { t: 'Es war einmal ein armer Müller, der hatte drei Söhne. Eines Tages sprach eine Fee zu ihm: „Wünsch dir etwas, und es soll dir gehören."', art: 'ein Märchen', absicht: 'unterhalten und Freude machen' },
  { t: 'Nur diese Woche! Der neue Super-Flitzer-Roller: schneller als alle anderen, leuchtet im Dunkeln. Hol ihn dir jetzt!', art: 'eine Werbung', absicht: 'jemanden überzeugen, etwas zu kaufen' },
  { t: 'Am Dienstag hat die Klasse 3a das Stadtmuseum besucht. Die Kinder sahen alte Werkzeuge und durften eine Getreidemühle ausprobieren. Um 12 Uhr fuhren sie zurück.', art: 'ein Bericht', absicht: 'informieren, was passiert ist' },
  { t: 'Bitte die Tür immer leise schließen! Im ersten Stock schläft ein Baby.', art: 'ein Hinweisschild', absicht: 'jemanden zu einem Verhalten auffordern' },
];
const ARTEN = ['ein Gedicht', 'ein Rezept', 'eine Einladung', 'ein Märchen', 'eine Werbung', 'ein Bericht', 'ein Hinweisschild'];
const ABSICHTEN = ['unterhalten und Freude machen', 'erklären, wie man etwas macht', 'jemanden zu etwas einladen', 'jemanden überzeugen, etwas zu kaufen', 'informieren, was passiert ist', 'jemanden zu einem Verhalten auffordern'];

const FAKTEN = ['Der Zug fährt um 8.15 Uhr ab.', 'Das Schwimmbad hat am Montag geschlossen.', 'Im Klassenzimmer stehen 24 Stühle.', 'Der Kuchen wurde mit drei Eiern gebacken.', 'Die Bücherei liegt neben dem Rathaus.', 'Lena ist 9 Jahre alt.', 'Das Konzert dauerte zwei Stunden.', 'Auf dem Plakat steht der Eintrittspreis.', 'Der Weg zum See ist 3 Kilometer lang.', 'Paul hat im Mai Geburtstag.', 'Die Pause beginnt um 9.45 Uhr.', 'Das Fahrrad hat einen roten Rahmen.'];
const MEINUNGEN = ['Zugfahren ist langweilig.', 'Schwimmen ist der schönste Sport.', 'Das Klassenzimmer sieht hässlich aus.', 'Der Kuchen schmeckt viel zu süß.', 'Die Bücherei ist der gemütlichste Ort der Stadt.', 'Lena ist die netteste Nachbarin.', 'Das Konzert war viel zu lang.', 'Das Plakat ist das schönste der ganzen Schule.', 'Der Weg zum See ist zu anstrengend.', 'Mai ist der beste Monat für einen Geburtstag.', 'Die Pause ist immer zu kurz.', 'Rote Fahrräder sind die coolsten.'];

const REDEWENDUNGEN = [
  ['Tomaten auf den Augen haben', 'etwas Offensichtliches nicht sehen'],
  ['jemandem einen Bären aufbinden', 'jemandem etwas Unwahres erzählen'],
  ['ins Fettnäpfchen treten', 'aus Versehen etwas Peinliches sagen oder tun'],
  ['die Ohren spitzen', 'ganz genau zuhören'],
  ['auf dem Holzweg sein', 'sich irren'],
  ['jemandem die Daumen drücken', 'jemandem Glück wünschen'],
  ['kalte Füße bekommen', 'Angst bekommen und etwas doch nicht tun'],
  ['etwas an die große Glocke hängen', 'etwas überall herumerzählen'],
  ['mit dem linken Fuß zuerst aufgestanden sein', 'schlechte Laune haben'],
  ['Schwein haben', 'Glück haben'],
];
const QUELLE_RW = 'Duden Band 11: Redewendungen. Wörterbuch der deutschen Idiomatik, 5. Aufl. 2020';

// Längere Texte mit Fragen auf verschiedenen Stufen (ls je Frage)
const TEXTE = [
  {
    id: 'drachen', titel: 'Der Drachen',
    t: 'Jonas hatte seinen Drachen eine ganze Woche lang gebaut. Am Sonntag war endlich Wind. Er rannte über die Wiese, und der Drachen stieg höher und höher. Plötzlich riss die Schnur. Jonas blieb stehen und sah dem Drachen nach, bis er hinter dem Wald verschwand. Auf dem Heimweg sagte er kein einziges Wort. Am Abend holte er wortlos Papier und Leisten aus dem Keller.',
    fragen: [
      { ls: 22, f: 'Wann war endlich Wind?', r: 'am Sonntag', a: ['am Samstag', 'am Montag', 'die ganze Woche'] },
      { ls: 30, f: 'Warum sagt Jonas auf dem Heimweg nichts?', r: 'Er ist traurig, weil sein Drachen weg ist.', a: ['Er ist müde vom Rennen.', 'Er hat sich mit jemandem gestritten.', 'Er freut sich auf das Abendessen.'] },
      { ls: 40, f: 'Was hat Jonas am Abend wahrscheinlich vor?', r: 'Er will einen neuen Drachen bauen.', a: ['Er will den Keller aufräumen.', 'Er will ein Bild malen.', 'Er will den alten Drachen im Wald suchen.'] },
    ],
  },
  {
    id: 'igel', titel: 'Der Igel', sach: true, quelle: 'NABU – Naturschutzbund Deutschland: „Der Igel" (nabu.de, Tiere und Pflanzen › Säugetiere › Igel)',
    t: 'Igel sind vor allem in der Nacht unterwegs. Tagsüber schlafen sie in einem Versteck, zum Beispiel unter einer Hecke oder in einem Laubhaufen. Sie fressen am liebsten Käfer, Raupen und Regenwürmer. Wenn es im Herbst kalt wird und es kaum noch Insekten gibt, halten Igel Winterschlaf. Dafür fressen sie sich vorher ein Fettpolster an. Im Frühling wachen sie wieder auf.',
    fragen: [
      { ls: 25, f: 'Wann sind Igel vor allem unterwegs?', r: 'in der Nacht', a: ['am Mittag', 'am frühen Morgen', 'nur im Winter'] },
      { ls: 34, f: 'Warum fressen sich Igel ein Fettpolster an?', r: 'damit sie den Winterschlaf überstehen', a: ['damit sie schneller laufen können', 'damit ihre Stacheln wachsen', 'damit sie im Sommer nicht frieren'] },
      { ls: 45, f: 'Welche Überschrift passt am besten zu dem Text?', r: 'Wie Igel leben', a: ['Igel als Haustier', 'Die Hecke im Garten', 'Warum Käfer fliegen'] },
    ],
  },
  {
    id: 'flohmarkt', titel: 'Der Flohmarkt',
    t: 'Mia und ihr Bruder Ben wollten auf dem Flohmarkt ihre alten Spielsachen verkaufen. Ben hatte ein großes Schild gemalt: „Alles nur 1 Euro!" Mittags hatten sie fast nichts verkauft. Da nahm Mia einen Stift, strich die 1 durch und schrieb daneben: „Ein Spielzeug kaufen – ein zweites geschenkt!" Eine Stunde später war der Tisch beinahe leer. Ben zählte das Geld und grinste.',
    fragen: [
      { ls: 26, f: 'Was stand zuerst auf dem Schild?', r: 'Alles nur 1 Euro!', a: ['Alles kostenlos!', 'Ein Spielzeug kaufen – ein zweites geschenkt!', 'Heute geschlossen!'] },
      { ls: 38, f: 'Warum war der Tisch eine Stunde später fast leer?', r: 'Das neue Angebot hat die Leute angelockt.', a: ['Es fing an zu regnen.', 'Ben hat die Spielsachen weggeräumt.', 'Die Leute wollten nur das Schild sehen.'] },
      { ls: 52, f: 'Was zeigt Bens Grinsen am Ende?', r: 'Er ist zufrieden mit dem Ergebnis.', a: ['Er findet Mias Idee albern.', 'Er hat sich verzählt.', 'Er will nach Hause.'] },
    ],
  },
  {
    id: 'brief', titel: 'Ein Brief aus dem Zeltlager',
    t: 'Liebe Oma, das Zeltlager ist wirklich toll! Gestern hat es nur geregnet, und unser Zelt war innen ganz nass. Heute sind meine Schuhe immer noch nicht trocken. Das Essen ist auch toll: Es gab drei Tage hintereinander Nudeln ohne Soße. Und die Mücken lieben mich besonders. Ich zähle schon die Tage bis Samstag. Dein Felix',
    fragen: [
      { ls: 40, f: 'Wie ist es Felix im Zeltlager wirklich ergangen?', r: 'nicht gut', a: ['sehr gut', 'genauso wie zu Hause', 'Das erfährt man nicht.'] },
      { ls: 55, f: 'Warum schreibt Felix trotzdem „toll"?', r: 'Er meint es ironisch, also das Gegenteil.', a: ['Er hat sich verschrieben.', 'Er will die Oma beruhigen.', 'Er mag Regen und Nudeln wirklich.'] },
      { ls: 62, f: 'Was bedeutet „Ich zähle schon die Tage bis Samstag"?', r: 'Er freut sich darauf, nach Hause zu kommen.', a: ['Er übt Rechnen.', 'Am Samstag fängt das Zeltlager erst an.', 'Er hat am Samstag Geburtstag.'] },
    ],
  },
  {
    id: 'mond', titel: 'Der Mond', sach: true, quelle: 'Deutsches Zentrum für Luft- und Raumfahrt (DLR): „Der Mond" (dlr.de); NASA: „Apollo 11 Mission Overview" (nasa.gov)',
    t: 'Der Mond leuchtet nicht selbst. Wir sehen ihn, weil er vom Licht der Sonne angestrahlt wird. Er braucht etwa einen Monat, um einmal um die Erde zu kreisen. Dabei sehen wir immer einen anderen Teil seiner beleuchteten Seite: mal eine schmale Sichel, mal den vollen Mond. Im Jahr 1969 betraten zum ersten Mal Menschen den Mond.',
    fragen: [
      { ls: 36, f: 'Warum können wir den Mond sehen?', r: 'Er wird von der Sonne angestrahlt.', a: ['Er leuchtet selbst.', 'Er spiegelt die Lichter der Städte.', 'Er ist aus glühendem Gestein.'] },
      { ls: 48, f: 'Warum sieht der Mond nicht immer gleich aus?', r: 'Wir sehen immer einen anderen Teil seiner beleuchteten Seite.', a: ['Er wird kleiner und wieder größer.', 'Wolken verdecken ihn verschieden stark.', 'Er dreht sich jede Nacht einmal ganz.'] },
      { ls: 58, f: 'Welche Aussage passt NICHT zum Text?', r: 'Der Mond braucht ein Jahr für eine Runde um die Erde.', a: ['Menschen waren schon auf dem Mond.', 'Manchmal sieht man nur eine schmale Sichel.', 'Ohne Sonnenlicht würden wir den Mond nicht sehen.'] },
    ],
  },
  {
    id: 'wettlauf', titel: 'Der Wettlauf',
    t: 'Beim Sportfest lief Hanna wie immer als Schnellste los. Kurz vor dem Ziel sah sie, dass Ida hinter ihr gestolpert war und auf der Bahn saß. Hanna wurde langsamer, drehte um und half Ida auf. Gemeinsam liefen sie als Letzte über die Ziellinie. Die Zuschauer klatschten so laut wie bei keinem anderen Lauf an diesem Tag.',
    fragen: [
      { ls: 30, f: 'Was passierte mit Ida?', r: 'Sie war gestolpert.', a: ['Sie hat gewonnen.', 'Sie war gar nicht dabei.', 'Sie hat Hanna geschubst.'] },
      { ls: 46, f: 'Warum klatschten die Zuschauer so laut?', r: 'Sie fanden Hannas Hilfe besonders gut.', a: ['Hanna hatte einen Rekord aufgestellt.', 'Es war der letzte Lauf.', 'Ida hatte gewonnen.'] },
      { ls: 65, f: 'Was ist die wichtigste Aussage der Geschichte?', r: 'Anderen zu helfen kann wichtiger sein als zu gewinnen.', a: ['Wer schnell läuft, stolpert oft.', 'Beim Sportfest sollte man vorsichtig sein.', 'Zuschauer klatschen immer für die Letzten.'] },
    ],
  },
  {
    id: 'erfindung', titel: 'Die Wunder-Brille',
    t: 'Professor Klug stellte seine neue Erfindung vor: eine Brille, mit der man angeblich durch Wände sehen kann. „Sie funktioniert immer", erklärte er stolz. Als ein Kind sie aufsetzte und nichts sah, sagte der Professor schnell: „Bei Tageslicht funktioniert sie natürlich nicht." Später fragte eine Reporterin, ob sie die Brille im Dunkeln testen dürfe. „Im Dunkeln", meinte der Professor, „sieht man ja sowieso nichts."',
    fragen: [
      { ls: 50, f: 'Was behauptet der Professor zuerst?', r: 'Die Brille funktioniert immer.', a: ['Die Brille funktioniert nur nachts.', 'Die Brille ist noch nicht fertig.', 'Die Brille ist für Kinder verboten.'] },
      { ls: 68, f: 'Was fällt an den Aussagen des Professors auf?', r: 'Sie widersprechen sich.', a: ['Sie sind alle durch einen Test bewiesen.', 'Er sagt immer dasselbe.', 'Er lobt die Reporterin.'] },
      { ls: 78, f: 'Was sollte ein kluger Leser aus dem Text schließen?', r: 'Die Brille funktioniert wahrscheinlich gar nicht.', a: ['Die Brille funktioniert nur bei Kindern nicht.', 'Man muss die Brille länger tragen.', 'Die Reporterin hat die Brille kaputt gemacht.'] },
    ],
  },
  {
    id: 'umfrage', titel: 'Die Umfrage',
    t: 'In der Schülerzeitung stand: „Neun von zehn Kindern wollen, dass der Pausenhof grüner wird!" Weiter unten im Artikel erfuhr man: Befragt wurden zehn Kinder aus der Garten-AG. Die übrigen 300 Kinder der Schule wurden nicht gefragt.',
    fragen: [
      { ls: 60, f: 'Wer wurde befragt?', r: 'zehn Kinder aus der Garten-AG', a: ['alle Kinder der Schule', 'neun Lehrerinnen', '300 Eltern'] },
      { ls: 75, f: 'Warum ist die Überschrift irreführend?', r: 'Sie klingt, als hätten alle Kinder geantwortet, dabei wurden nur wenige gefragt.', a: ['Weil neun von zehn falsch gerechnet ist.', 'Weil der Pausenhof schon grün ist.', 'Weil Schülerzeitungen nie stimmen.'] },
      { ls: 85, f: 'Welche Umfrage wäre aussagekräftiger?', r: 'Viele zufällig ausgewählte Kinder aus allen Klassen fragen.', a: ['Noch einmal die Garten-AG fragen.', 'Nur die Lehrerinnen fragen.', 'Die Überschrift größer drucken.'] },
    ],
  },
];

export const LESETEXTE = [
  {
    id: 'lt.textart', skala: 'LV', kompetenz: 'LV08', titel: 'Textarten erkennen', anker: [], hand: true,
    stufen: [{ id: 'a', ls: 33 }],
    erzeuge(r) { const m = r.waehle(MINI); const { wahl, antwort } = auswahl(r, m.art, r.mischen(ARTEN.filter(a => a !== m.art))); return { text: m.t, frage: 'Was für ein Text ist das?', art: 'wahl', wahl, antwort, pruef: { richtig: m.art } }; },
  },
  {
    id: 'lt.absicht', skala: 'LV', kompetenz: 'LV12', titel: 'Absicht eines Textes', anker: [], hand: true,
    stufen: [{ id: 'a', ls: 47 }],
    erzeuge(r) { const m = r.waehle(MINI); const { wahl, antwort } = auswahl(r, m.absicht, r.mischen(ABSICHTEN.filter(a => a !== m.absicht))); return { text: m.t, frage: 'Was will dieser Text vor allem?', art: 'wahl', wahl, antwort, pruef: { richtig: m.absicht } }; },
  },
  {
    id: 'lt.meinung', skala: 'LV', kompetenz: 'LV14', titel: 'Tatsache oder Meinung', anker: ['a'], hand: true,
    stufen: [{ id: 'a', ls: 54, suche: 'meinung' }, { id: 'b', ls: 57, suche: 'fakt' }],
    erzeuge(r, st) {
      const richtigM = st.suche === 'meinung';
      const r1 = r.waehle(richtigM ? MEINUNGEN : FAKTEN);
      const andere = r.einige(richtigM ? FAKTEN : MEINUNGEN, 3);
      const { wahl, antwort } = auswahl(r, r1, andere);
      return { text: 'Lies die vier Sätze.', frage: richtigM ? 'Welcher Satz ist eine Meinung?' : 'Welcher Satz ist eine Tatsache, die man nachprüfen kann?', art: 'wahl', wahl, antwort, pruef: { richtig: r1, istMeinung: richtigM } };
    },
  },
  {
    id: 'lt.redewendung', skala: 'LV', kompetenz: 'LV10', titel: 'Bildhafte Sprache', anker: [], hand: true, quelle: QUELLE_RW, sachwissen: true,
    stufen: [{ id: 'a', ls: 40 }],
    erzeuge(r) {
      const i = r.zahl(0, REDEWENDUNGEN.length - 1); const [rw, bed] = REDEWENDUNGEN[i];
      const { wahl, antwort } = auswahl(r, bed, r.mischen(REDEWENDUNGEN.filter((_, j) => j !== i).map(x => x[1])));
      return { text: `Eine Redewendung: „${rw}"`, frage: `Was bedeutet „${rw}"?`, art: 'wahl', wahl, antwort, quelle: QUELLE_RW, pruef: { richtig: bed } };
    },
  },
  ...[...TEXTE, ...TEXTE_MEHR].map(T => ({
    id: 'lt.' + T.id, skala: 'LV', kompetenz: 'LV11', titel: T.titel, anker: [], hand: true, quelle: T.quelle, sachwissen: !!T.sach,
    stufen: T.fragen.map((q, i) => ({ id: String.fromCharCode(97 + i), ls: q.ls, q: i })),
    erzeuge(r, st) {
      const q = T.fragen[st.q];
      const { wahl, antwort } = auswahl(r, q.r, q.a);
      return { text: T.t, frage: q.f, art: 'wahl', wahl, antwort, quelle: T.quelle, titel: T.titel, pruef: { richtig: q.r } };
    },
  })),
];
