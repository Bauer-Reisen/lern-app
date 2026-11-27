// Längere Lesetexte für Klasse 5–9 (LS 50–90): Erzählungen (ausgedacht) und Sachtexte (mit Quelle).
// Fragen: wörtlich → schlussfolgern → Absicht/Aufbau → kritisch bewerten.
export const TEXTE_MEHR = [
  {
    id: 'leuchtturm', titel: 'Die letzte Nacht im Leuchtturm',
    t: 'Seit vierzig Jahren hatte Hinnerk jeden Abend die Treppe des Leuchtturms erklommen, 117 Stufen, egal ob Sturm oder Sonne. Nun sollte eine automatische Lampe seine Arbeit übernehmen. Die Männer vom Amt waren freundlich gewesen, fast zu freundlich, als sie ihm die Urkunde überreichten. In seiner letzten Nacht zog ein Unwetter auf. Gegen Mitternacht flackerte die neue Lampe und erlosch. Hinnerk zögerte keinen Augenblick. Er holte die alte Petroleumlampe aus dem Schrank, putzte das Glas und stieg die Stufen hinauf, langsamer als früher, aber ohne anzuhalten. Draußen kämpfte ein Fischkutter gegen die Wellen. Als das Licht über das Wasser strich, drehte das Boot ab, weg von den Felsen. Am Morgen kam ein Techniker und reparierte die Automatik in zehn Minuten. Hinnerk sagte nichts. Er stellte die Petroleumlampe zurück in den Schrank – aber er schloss die Tür nicht ab.',
    fragen: [
      { ls: 50, f: 'Warum musste Hinnerk die alte Lampe benutzen?', r: 'Die neue automatische Lampe war ausgefallen.', a: ['Die alte Lampe war heller.', 'Der Techniker hatte es ihm befohlen.', 'Er wollte sich verabschieden.'] },
      { ls: 60, f: 'Was bewirkte Hinnerks Licht?', r: 'Ein Fischkutter konnte den Felsen ausweichen.', a: ['Der Sturm hörte auf.', 'Der Techniker kam schneller.', 'Die Männer vom Amt bedankten sich.'] },
      { ls: 70, f: 'Was bedeutet es wohl, dass Hinnerk den Schrank nicht abschließt?', r: 'Er rechnet damit, dass die Technik wieder versagen kann, und will bereit sein.', a: ['Er hat den Schlüssel verloren.', 'Er will die Lampe verkaufen.', 'Er ist wütend auf den Techniker.'] },
      { ls: 80, f: 'Was deutet die Formulierung „fast zu freundlich“ an?', r: 'Hinnerk spürte, dass die Freundlichkeit seinen Abschied nur leichter machen sollte.', a: ['Die Männer waren sehr unhöflich.', 'Hinnerk freute sich sehr über die Urkunde.', 'Die Männer kannten Hinnerk nicht.'] },
    ],
  },
  {
    id: 'bienen', titel: 'Warum Bienen tanzen', sach: true, quelle: 'Karl von Frisch, Nobelpreis 1973 (nobelprize.org)',
    t: 'Wenn eine Honigbiene eine ergiebige Futterquelle gefunden hat, fliegt sie zurück in den Stock und „erzählt“ den anderen davon – ohne ein einziges Wort. Sie tanzt. Liegt das Futter nah am Stock, läuft sie im Kreis, den sogenannten Rundtanz. Ist es weiter entfernt, tanzt sie eine Acht und wackelt dabei auf der geraden Strecke in der Mitte mit dem Hinterleib. Dieser Schwänzeltanz verrät zweierlei: Die Richtung der geraden Strecke zeigt, in welchem Winkel zur Sonne die Bienen fliegen müssen. Und je länger die Biene schwänzelt, desto weiter ist der Weg. Entschlüsselt hat diese Sprache der österreichische Forscher Karl von Frisch. Für seine Arbeit erhielt er 1973 den Nobelpreis.',
    fragen: [
      { ls: 52, f: 'Welchen Tanz tanzt eine Biene, wenn das Futter nah ist?', r: 'den Rundtanz', a: ['den Schwänzeltanz', 'eine Acht', 'gar keinen'] },
      { ls: 62, f: 'Was verrät die Dauer des Schwänzelns?', r: 'wie weit die Futterquelle entfernt ist', a: ['wie viel Futter es gibt', 'welche Farbe die Blüten haben', 'wie spät es ist'] },
      { ls: 72, f: 'Warum steht „erzählt“ in Anführungszeichen?', r: 'Weil Bienen nicht mit Worten erzählen, sondern mit Bewegungen.', a: ['Weil es ein Zitat von Karl von Frisch ist.', 'Weil Bienen sehr laut summen.', 'Weil das Wort falsch geschrieben ist.'] },
      { ls: 82, f: 'Eine Biene schwänzelt lange, die gerade Strecke zeigt nach oben. Was bedeutet das?', r: 'Das Futter ist weit weg, in Richtung der Sonne.', a: ['Das Futter ist ganz nah, von der Sonne weg.', 'Es gibt kein Futter mehr.', 'Die Biene ist müde.'] },
    ],
  },
  {
    id: 'wettbewerb', titel: 'Der Wettbewerb',
    t: 'Mira hatte drei Wochen an ihrem Modell der Brücke gearbeitet. Sie hatte die Kräfte berechnet, Streichhölzer zu Dreiecken verleimt und jeden Fehler geduldig korrigiert. Am Tag des Wettbewerbs stand neben ihrem Tisch Leon mit einer glänzenden Brücke aus dem 3D-Drucker. „Hat mein Onkel konstruiert“, sagte er beiläufig. Bei der Belastungsprobe trug Leons Brücke zwei Kilogramm, dann brach sie in der Mitte. Miras Streichholzbrücke trug vier. Die Jury gab Leon trotzdem den zweiten Platz – „für die beeindruckende Optik“. Mira wurde Dritte. Auf dem Heimweg war sie still. Dann holte sie ihr Notizheft heraus und begann zu zeichnen: eine Brücke, die noch leichter war.',
    fragen: [
      { ls: 54, f: 'Wie viel trug Miras Brücke?', r: 'vier Kilogramm', a: ['zwei Kilogramm', 'drei Kilogramm', 'nichts, sie brach sofort'] },
      { ls: 64, f: 'Was legt der Text über Leons Brücke nahe?', r: 'Sie war vor allem von seinem Onkel gebaut worden.', a: ['Leon hatte drei Wochen daran gearbeitet.', 'Sie war die stabilste Brücke.', 'Mira hatte ihm geholfen.'] },
      { ls: 74, f: 'Wie reagiert Mira auf die Enttäuschung?', r: 'Sie nutzt sie als Antrieb, eine noch bessere Brücke zu planen.', a: ['Sie beschwert sich bei der Jury.', 'Sie gibt das Bauen auf.', 'Sie macht Leons Brücke kaputt.'] },
      { ls: 84, f: 'Welche Kritik an der Jury steckt im Text?', r: 'Sie bewertete das Aussehen höher als die eigentliche Leistung.', a: ['Sie hat zu streng gemessen.', 'Sie kannte Mira nicht.', 'Sie hat die Brücken falsch gewogen.'] },
    ],
  },
  {
    id: 'plastik', titel: 'Plastik im Meer', sach: true, quelle: 'Umweltbundesamt (umweltbundesamt.de), Meeresmüll; EU-Richtlinie 2019/904 (Einwegkunststoff)',
    t: 'Plastik ist leicht, billig und hält lange – genau das macht es im Meer zum Problem. Ein großer Teil des Mülls im Meer besteht aus Kunststoff. Er gelangt über Flüsse, durch Wind oder direkt von Schiffen ins Wasser. Dort zerfällt er nicht wie Holz oder Papier, sondern zerbricht unter Sonne und Wellen in immer kleinere Stücke. Teilchen, die kleiner als fünf Millimeter sind, nennt man Mikroplastik. Seevögel, Fische und Schildkröten halten Plastikteile oft für Nahrung. Mit einem Magen voller Plastik fühlen sie sich satt und können verhungern. Viele Länder versuchen deshalb, Einwegplastik zu verringern. In der Europäischen Union sind zum Beispiel Trinkhalme und Wattestäbchen aus Plastik seit 2021 verboten.',
    fragen: [
      { ls: 50, f: 'Wie nennt man Plastikteilchen, die kleiner als fünf Millimeter sind?', r: 'Mikroplastik', a: ['Makroplastik', 'Plankton', 'Sand'] },
      { ls: 58, f: 'Warum ist Plastik im Meer so ein Problem?', r: 'Es zersetzt sich nicht, sondern zerbricht nur in immer kleinere Teile.', a: ['Es löst sich sofort auf.', 'Es macht das Wasser warm.', 'Es sinkt immer auf den Grund.'] },
      { ls: 68, f: 'Warum können Tiere mit Plastik im Magen verhungern?', r: 'Sie fühlen sich satt, obwohl sie keine Nahrung aufgenommen haben.', a: ['Plastik ist giftig für Wasser.', 'Sie können nicht mehr schwimmen.', 'Plastik macht sie zu schwer zum Fliegen.'] },
      { ls: 78, f: 'Welche Aussage passt zum Aufbau des Textes?', r: 'Erst die Ursache, dann die Folgen, zuletzt eine Gegenmaßnahme.', a: ['Erst eine Geschichte, dann ein Rezept.', 'Nur Meinungen ohne Fakten.', 'Erst die Lösung, dann das Problem.'] },
    ],
  },
  {
    id: 'brief', titel: 'Ein Brief an die Bürgermeisterin',
    t: 'Sehr geehrte Frau Bürgermeisterin, wir sind die Klasse 6b und schreiben Ihnen wegen des Radwegs an der Schulstraße. Jeden Morgen fahren dort über achtzig Kinder zur Schule. Der Weg ist schmal, und an der Einmündung zum Supermarkt parken oft Lieferwagen auf dem Radweg. Dann müssen wir auf die Straße ausweichen. Im letzten Monat ist ein Kind dabei gestürzt. Wir schlagen vor, an der Einmündung Poller aufzustellen und den Radweg rot zu markieren. In der Stadt nebenan hat das gut funktioniert. Gern zeigen wir Ihnen die Stelle bei einem Ortstermin. Mit freundlichen Grüßen, die Klasse 6b',
    fragen: [
      { ls: 52, f: 'Was ist das Problem an der Einmündung?', r: 'Lieferwagen parken auf dem Radweg.', a: ['Es gibt keine Ampel.', 'Der Supermarkt ist zu laut.', 'Dort ist eine Baustelle.'] },
      { ls: 62, f: 'Was will die Klasse mit dem Brief erreichen?', r: 'dass die Stadt den Radweg sicherer macht', a: ['dass der Supermarkt schließt', 'dass sie mit dem Bus fahren dürfen', 'dass der Unterricht später beginnt'] },
      { ls: 72, f: 'Warum erwähnt die Klasse den Sturz eines Kindes?', r: 'um zu zeigen, dass die Gefahr echt ist', a: ['um das Kind zu beschuldigen', 'weil sie Mitleid für sich wollen', 'weil es mit dem Radweg nichts zu tun hat'] },
      { ls: 82, f: 'Welches Argument stützt den Vorschlag besonders gut?', r: 'In der Nachbarstadt hat die gleiche Lösung schon funktioniert.', a: ['Die Klasse heißt 6b.', 'Der Brief ist höflich geschrieben.', 'Die Kinder fahren gern Rad.'] },
    ],
  },
  {
    id: 'mond', titel: 'Warum der Mond seine Form ändert', sach: true, quelle: 'NASA (science.nasa.gov), Moon Phases',
    t: 'Der Mond leuchtet nicht selbst. Wir sehen ihn nur, weil die Sonne ihn anstrahlt – immer genau eine Hälfte. Während der Mond in etwa 29,5 Tagen einmal um die Erde wandert, schauen wir von der Erde aus mal mehr, mal weniger auf seine beleuchtete Seite. Steht der Mond zwischen Erde und Sonne, ist die beleuchtete Seite von uns abgewandt: Es ist Neumond, und wir sehen fast nichts. Steht die Erde zwischen Sonne und Mond, blicken wir voll auf die helle Seite: Vollmond. Dazwischen nimmt der Mond zu oder ab. Eine einfache Merkhilfe: Sieht die Sichel aus wie der Bogen eines kleinen a (für „abnehmend“), wird der Mond kleiner. Mit dem Erdschatten hat das übrigens nichts zu tun – der fällt nur bei einer Mondfinsternis auf den Mond.',
    fragen: [
      { ls: 54, f: 'Warum können wir den Mond sehen?', r: 'weil die Sonne ihn anstrahlt', a: ['weil er selbst leuchtet', 'weil die Erde ihn anstrahlt', 'weil er aus Eis ist'] },
      { ls: 64, f: 'Wann ist Vollmond?', r: 'wenn die Erde zwischen Sonne und Mond steht', a: ['wenn der Mond zwischen Erde und Sonne steht', 'jeden Sonntag', 'wenn der Erdschatten auf den Mond fällt'] },
      { ls: 76, f: 'Welche falsche Vorstellung räumt der letzte Satz aus?', r: 'dass die Mondphasen durch den Erdschatten entstehen', a: ['dass der Mond um die Erde kreist', 'dass die Sonne den Mond beleuchtet', 'dass es Vollmond gibt'] },
      { ls: 86, f: 'Wie lange dauert es ungefähr von einem Vollmond zum nächsten?', r: 'etwa einen Monat', a: ['etwa eine Woche', 'etwa ein Jahr', 'einen Tag'] },
    ],
  },
];
