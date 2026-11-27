// Stufe 4: Wissen und Welt (HSU Bayern Kl. 1–4 als Untergrenze, darüber Natur und Technik / Geographie / Geschichte Gymnasium).
// Nur gesichertes Grundwissen. Jede Frage hat eine Quelle (Feld quelle); sie steht in der Erklärung.
// Format je Eintrag: [Frage, richtig, [falsch …], Erklärung, Quelle]
import { auswahl } from './werkzeug.js';

const Q = {
  lp: 'LehrplanPLUS Bayern, HSU (ISB)',
  lpg: 'LehrplanPLUS Bayern, Gymnasium (ISB)',
  dwd: 'Deutscher Wetterdienst (dwd.de)',
  destatis: 'Statistisches Bundesamt (destatis.de)',
  bpb: 'Bundeszentrale für politische Bildung (bpb.de)',
  nasa: 'NASA (science.nasa.gov)',
  bzga: 'Bundeszentrum für Ernährung / BZgA',
  eu: 'Europäische Union (european-union.europa.eu)',
};

const THEMEN = {
  koerper: [
    ['Womit riechen wir?', 'mit der Nase', ['mit den Ohren', 'mit der Zunge', 'mit den Augen'], 'Die Nase ist das Sinnesorgan zum Riechen.', Q.lp],
    ['Wie viele Sinne zählt man meistens beim Menschen?', '5', ['3', '7', '10'], 'Sehen, Hören, Riechen, Schmecken, Tasten.', Q.lp],
    ['Was pumpt das Blut durch den Körper?', 'das Herz', ['die Lunge', 'der Magen', 'die Leber'], 'Das Herz ist ein Muskel, der das Blut durch die Adern pumpt.', Q.lp],
    ['Wohin gelangt die Luft, die wir einatmen?', 'in die Lunge', ['in den Magen', 'ins Herz', 'in die Nieren'], 'Über die Luftröhre kommt die Luft in die Lunge.', Q.lp],
    ['Wie viele Milchzähne hat ein Kind normalerweise?', '20', ['32', '12', '28'], 'Das Milchgebiss hat 20 Zähne, das bleibende Gebiss 32.', Q.lp],
  ],
  tiere: [
    ['Wie nennt man ein junges Pferd?', 'Fohlen', ['Kalb', 'Ferkel', 'Lamm'], 'Ein junges Pferd heißt Fohlen.', Q.lp],
    ['Welches Tier hält Winterschlaf?', 'der Igel', ['der Fuchs', 'das Reh', 'die Amsel'], 'Igel schlafen im Winter, weil sie dann kaum Nahrung finden.', Q.lp],
    ['Was frisst eine Raupe am liebsten?', 'Blätter', ['Fleisch', 'Steine', 'Fische'], 'Die meisten Raupen fressen Blätter von Pflanzen.', Q.lp],
    ['Woraus entsteht ein Schmetterling?', 'aus einer Raupe, die sich verpuppt', ['aus einer Kaulquappe', 'aus einem Samen', 'aus einer Larve im Wasser'], 'Ei → Raupe → Puppe → Schmetterling.', Q.lp],
    ['Was wird aus einer Kaulquappe?', 'ein Frosch', ['ein Fisch', 'eine Schnecke', 'ein Vogel'], 'Kaulquappen leben im Wasser und entwickeln sich zu Fröschen.', Q.lp],
    ['Wie viele Beine hat eine Spinne?', '8', ['6', '4', '10'], 'Spinnen haben 8 Beine, Insekten 6.', Q.lp],
    ['Wie viele Beine hat ein Insekt?', '6', ['8', '4', '10'], 'Alle Insekten haben 6 Beine.', Q.lp],
    ['Welches Tier ist ein Säugetier?', 'der Wal', ['der Hai', 'die Forelle', 'der Pinguin'], 'Wale atmen mit Lungen und säugen ihre Jungen.', Q.lpg],
  ],
  pflanzen: [
    ['Was braucht eine Pflanze zum Wachsen?', 'Licht, Wasser und Erde (Nährstoffe)', ['nur Wasser', 'nur Dunkelheit', 'Zucker und Salz'], 'Pflanzen brauchen Licht, Wasser, Luft und Nährstoffe.', Q.lp],
    ['Welcher Baum ist ein Nadelbaum?', 'die Tanne', ['die Eiche', 'die Buche', 'die Linde'], 'Tannen, Fichten und Kiefern tragen Nadeln.', Q.lp],
    ['Welche Frucht wächst an der Eiche?', 'die Eichel', ['die Kastanie', 'die Haselnuss', 'der Zapfen'], 'Die Frucht der Eiche ist die Eichel.', Q.lp],
    ['Welchen Stoff geben Pflanzen bei Licht an die Luft ab?', 'Sauerstoff', ['Kohlenstoffdioxid', 'Stickstoff', 'Rauch'], 'Bei der Fotosynthese nehmen Pflanzen Kohlenstoffdioxid auf und geben Sauerstoff ab.', Q.lpg],
  ],
  wetter: [
    ['Bei wie viel Grad Celsius gefriert Wasser?', '0 °C', ['10 °C', '−10 °C', '100 °C'], 'Wasser gefriert bei 0 °C zu Eis.', Q.lp],
    ['Bei wie viel Grad Celsius kocht Wasser (auf Meereshöhe)?', '100 °C', ['50 °C', '80 °C', '200 °C'], 'Auf Meereshöhe siedet Wasser bei 100 °C.', Q.lp],
    ['Womit misst man die Temperatur?', 'mit einem Thermometer', ['mit einem Kompass', 'mit einer Waage', 'mit einem Lineal'], 'Das Thermometer zeigt die Temperatur an.', Q.dwd],
    ['Wie heißen die vier Jahreszeiten in der richtigen Reihenfolge ab Frühling?', 'Frühling, Sommer, Herbst, Winter', ['Frühling, Herbst, Sommer, Winter', 'Frühling, Winter, Sommer, Herbst', 'Frühling, Sommer, Winter, Herbst'], 'Auf den Frühling folgen Sommer, Herbst und Winter.', Q.lp],
    ['Woraus entsteht Regen?', 'aus Wassertröpfchen in den Wolken', ['aus Rauch', 'aus Wind', 'aus Sonnenstrahlen'], 'Wasser verdunstet, bildet Wolken, und die Tröpfchen fallen als Regen.', Q.dwd],
  ],
  erde: [
    ['Wie heißt der Planet, auf dem wir leben?', 'Erde', ['Mars', 'Venus', 'Jupiter'], 'Wir leben auf der Erde, dem dritten Planeten von der Sonne aus.', Q.nasa],
    ['Wie lange braucht die Erde für eine Runde um die Sonne?', 'etwa ein Jahr', ['einen Tag', 'einen Monat', 'eine Woche'], 'Ein Umlauf um die Sonne dauert etwa 365 Tage.', Q.nasa],
    ['Warum gibt es Tag und Nacht?', 'weil sich die Erde um sich selbst dreht', ['weil die Sonne ausgeht', 'weil der Mond die Sonne verdeckt', 'weil die Erde um den Mond kreist'], 'Die Erde dreht sich in etwa 24 Stunden einmal um sich selbst.', Q.nasa],
    ['Welcher Planet ist der größte in unserem Sonnensystem?', 'Jupiter', ['Erde', 'Mars', 'Saturn'], 'Jupiter ist der größte Planet unseres Sonnensystems.', Q.nasa],
    ['Wie heißt der Kontinent, auf dem Deutschland liegt?', 'Europa', ['Asien', 'Afrika', 'Amerika'], 'Deutschland liegt in Europa.', Q.lp],
    ['Welcher ist der größte Ozean der Erde?', 'der Pazifische Ozean', ['der Atlantische Ozean', 'der Indische Ozean', 'die Nordsee'], 'Der Pazifik ist der größte Ozean.', Q.lpg],
  ],
  heimat: [
    ['Wie heißt die Hauptstadt von Deutschland?', 'Berlin', ['München', 'Hamburg', 'Bonn'], 'Berlin ist die Hauptstadt Deutschlands.', Q.bpb],
    ['Wie heißt die Hauptstadt von Bayern?', 'München', ['Nürnberg', 'Würzburg', 'Augsburg'], 'München ist die Landeshauptstadt Bayerns.', Q.lp],
    ['Wie viele Bundesländer hat Deutschland?', '16', ['12', '10', '20'], 'Deutschland besteht aus 16 Bundesländern.', Q.bpb],
    ['Welcher Fluss fließt durch Regensburg?', 'die Donau', ['der Main', 'der Rhein', 'die Elbe'], 'Regensburg liegt an der Donau.', Q.lp],
    ['Wie heißt der höchste Berg Deutschlands?', 'die Zugspitze', ['der Watzmann', 'der Brocken', 'der Feldberg'], 'Die Zugspitze ist mit rund 2 962 m der höchste Berg Deutschlands.', Q.lp],
    ['Wie viele Regierungsbezirke hat Bayern?', '7', ['5', '10', '16'], 'Oberbayern, Niederbayern, Oberpfalz, Oberfranken, Mittelfranken, Unterfranken und Schwaben.', Q.lp],
    ['Wie heißt die Hauptstadt von Frankreich?', 'Paris', ['Rom', 'Madrid', 'London'], 'Paris ist die Hauptstadt Frankreichs.', Q.eu],
    ['Mit welchem Geld bezahlt man in Deutschland?', 'mit dem Euro', ['mit dem Dollar', 'mit der D-Mark', 'mit dem Franken'], 'Seit 2002 gibt es in Deutschland Euro-Bargeld.', Q.eu],
  ],
  technik: [
    ['Was zieht ein Magnet an?', 'eine Büroklammer aus Eisen', ['einen Holzlöffel', 'ein Gummiband', 'ein Blatt Papier'], 'Magnete ziehen Eisen an, Holz, Gummi und Papier nicht.', Q.lp],
    ['Welcher Stoff leitet elektrischen Strom gut?', 'Kupfer', ['Holz', 'Gummi', 'Glas'], 'Metalle wie Kupfer leiten Strom. Deshalb sind Kabel innen aus Kupfer und außen aus Kunststoff.', Q.lp],
    ['Was schwimmt auf Wasser?', 'ein Korken', ['ein Stein', 'ein Nagel', 'eine Münze'], 'Kork ist leichter als die gleiche Menge Wasser und schwimmt deshalb.', Q.lp],
    ['Welche Energiequelle ist erneuerbar?', 'Wind', ['Kohle', 'Erdöl', 'Erdgas'], 'Wind, Sonne und Wasser gehen nicht aus. Kohle, Öl und Gas sind irgendwann verbraucht.', Q.lpg],
    ['In welche Tonne gehört eine leere Joghurtbecher-Verpackung?', 'gelbe Tonne / gelber Sack', ['Biotonne', 'Papiertonne', 'Altglas'], 'Verpackungen aus Kunststoff kommen in den gelben Sack oder die gelbe Tonne.', Q.lp],
  ],
  zeit: [
    ['Wie viele Tage hat eine Woche?', '7', ['5', '10', '6'], 'Montag bis Sonntag: 7 Tage.', Q.lp],
    ['Wie viele Monate hat ein Jahr?', '12', ['10', '6', '52'], 'Januar bis Dezember: 12 Monate.', Q.lp],
    ['Wer lebte früher in Burgen?', 'Ritter und Burgherren', ['Dinosaurier', 'Astronauten', 'Steinzeitmenschen'], 'Burgen wurden vor allem im Mittelalter gebaut.', Q.lp],
    ['Wie lebten die Menschen in der Steinzeit?', 'als Jäger und Sammler, später als Bauern', ['in Hochhäusern', 'mit Autos', 'in Burgen'], 'Werkzeuge waren aus Stein, Knochen und Holz.', Q.lpg],
    ['Seit welchem Jahr ist Deutschland wiedervereinigt?', '1990', ['1949', '1989', '2000'], 'Am 3. Oktober 1990 wurde Deutschland wiedervereinigt (Tag der Deutschen Einheit). 1989 fiel die Mauer.', Q.bpb],
    ['Welches Volk baute die Pyramiden von Gizeh?', 'die alten Ägypter', ['die Römer', 'die Wikinger', 'die Griechen'], 'Die Pyramiden von Gizeh wurden vor über 4 500 Jahren im alten Ägypten gebaut.', Q.lpg],
  ],
  gesund: [
    ['Was ist ein gesundes Pausenbrot?', 'Vollkornbrot mit Gemüse', ['Gummibärchen', 'Schokoriegel', 'Chips'], 'Vollkorn und Gemüse machen lange satt und liefern Vitamine.', Q.bzga],
    ['Wie oft am Tag sollte man die Zähne putzen?', 'mindestens zweimal', ['einmal pro Woche', 'nie', 'nur am Wochenende'], 'Morgens und abends Zähne putzen schützt vor Karies.', Q.bzga],
    ['Was sollte man bei Rot an der Fußgängerampel tun?', 'stehen bleiben', ['schnell laufen', 'rennen', 'nur nach links schauen'], 'Bei Rot bleibt man stehen, bei Grün geht man – und schaut trotzdem.', Q.lp],
  ],
};

// Stufen: Themen nach Schwierigkeit (Einträge mit Quelle „Gymnasium“ sind schwerer)
function ausThema(r, st) {
  const pool = THEMEN[st.thema].filter(e => (st.schwer ? e[4] === Q.lpg || e[4] === Q.bpb || e[4] === Q.nasa : e[4] !== Q.lpg));
  const [frage, richtig, falsch, erkl, quelle] = r.waehle(pool.length ? pool : THEMEN[st.thema]);
  const { wahl, antwort } = auswahl(r, richtig, falsch);
  return { text: frage, art: 'wahl', wahl, antwort, wahlLang: wahl.some(w => w.length > 18), hinweis: 'Denk an das, was du schon darüber weißt. Was passt am besten?', erklaerung: `${erkl} (Quelle: ${quelle})`, quelle };
}

export const WW_STUFEN = [
  { id: 'ww-koerper', thema: 'koerper', ls: 12 },
  { id: 'ww-zeit', thema: 'zeit', ls: 14 },
  { id: 'ww-tiere', thema: 'tiere', ls: 17 },
  { id: 'ww-gesund', thema: 'gesund', ls: 19 },
  { id: 'ww-wetter', thema: 'wetter', ls: 22 },
  { id: 'ww-pflanzen', thema: 'pflanzen', ls: 25 },
  { id: 'ww-technik', thema: 'technik', ls: 30 },
  { id: 'ww-heimat', thema: 'heimat', ls: 34 },
  { id: 'ww-erde', thema: 'erde', ls: 38 },
  { id: 'ww-tiere2', thema: 'tiere', schwer: true, ls: 48 },
  { id: 'ww-pflanzen2', thema: 'pflanzen', schwer: true, ls: 52 },
  { id: 'ww-erde2', thema: 'erde', schwer: true, ls: 55 },
  { id: 'ww-technik2', thema: 'technik', schwer: true, ls: 58 },
  { id: 'ww-zeit2', thema: 'zeit', schwer: true, ls: 62 },
].map(s => ({ ...s, art: 'thema' }));

export function wwAufgabe(r, stufe) { return ausThema(r, stufe); }
