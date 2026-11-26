# Neue Inhalte hinzufügen (kurz)

Inhalte sind **Vorlagen** in `app/js/inhalte/`. Eine Vorlage erzeugt mit Zufallswerten beliebig viele Aufgaben. Die App baut daraus beim Start die Aufgabenbank (30 Aufgaben je Stufe). Am Rechenkern muss nichts geändert werden.

## 1. Vorlage schreiben
In eine passende Datei (`rechnen.js`, `sach.js`, `lesen.js`, `lesetexte.js`) oder in eine neue Datei:

```js
{
  id: 're.beispiel',        // eindeutig, Präfix re./sa./le./lt./ga.
  skala: 'RE',              // RE Rechnen, SA Sachrechnen, LV Lesen (wird automatisch auch vorgelesen: HV), GA Grundaufgaben
  kompetenz: 'Z05', titel: 'Kurzer Name für die Eltern',
  anker: ['a'],             // Stufen, die als Anker gelten (gut belegte Schwierigkeit)
  stufen: [{ id: 'a', ls: 22 }, { id: 'b', ls: 30 }],   // ls = Lernstufe (Klasse × 10, 22 = Anfang/Mitte Kl. 2); lsHV optional
  erzeuge(r, st) {          // r.zahl(a,b), r.waehle(liste), r.mischen(liste), r.u()
    const a = r.zahl(2, 9), b = r.zahl(2, 9);
    return { text: `${a} + ${b} = ?`, art: 'zahl', antwort: a + b,
             pruef: { ausdruck: `${a}+${b}` },              // wird im Prüfskript unabhängig nachgerechnet
             hinweis: 'Tipp nach dem ersten Fehler', erklaerung: 'Kurze Erklärung zur Lösung' };
  },
}
```
Antwortarten: `zahl`, `zahlen` (mit `felder`), `bruch` (`antwort: {z, n}`), `wahl` (`wahl: [...]`, `antwort: Index`, `pruef.richtig`).
Sachwissen (Fakten über die Welt) braucht `sachwissen: true` und ein `quelle`-Feld.

## 2. Anmelden
Neue Datei: in `app/js/inhalte/index.js` in die Liste `VORLAGEN` aufnehmen.

## 3. Prüfen und bauen
```
node tools/pruefen.mjs     # jede Vorlage über viele Ziehungen + Abdeckung, muss "Fehler: 0" melden
node tools/logik-test.mjs  # Ablauf mit simulierten Kindern
node tools/bauen.mjs       # Privat-Prüfung, Offline-Liste und Version neu schreiben, Kopie nach docs/ (sonst bekommen Geräte das Update nicht)
```
Neue Prüfregeln für neue Aufgabenformen gehören in `tools/pruefen.mjs` (Funktion `pruefeAufgabe`).

Hinweis: Wird eine Vorlage geändert, ändern sich ihre Aufgaben. Gespeicherte Antworten auf weggefallene Aufgaben werden beim Laden übersprungen.
Hinweis: In Aufgaben keine echten Namen, Orte oder Daten der eigenen Familie verwenden – die Privat-Prüfung bricht das Bauen sonst ab.
