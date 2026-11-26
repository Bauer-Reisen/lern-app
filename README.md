# Lern-App adaptiv

Eine Lern-App für zwei Kinder (Mathe und Lesen, etwa Klasse 1 bis 9). Sie findet in einer kurzen „Expedition“ heraus, was ein Kind schon kann, und übt danach jeden Tag ein paar Minuten genau auf diesem Stand.

- Läuft im Browser und offline vom Homescreen (iPad, iPhone, Android, Windows).
- Alle Daten bleiben auf dem Gerät. Kein Konto, keine Werbung, keine Verbindung zu fremden Diensten.
- Zwei Profile: „Die Insel“ (jüngeres Kind: große Knöpfe, alles wird vorgelesen) und „Die Sternwarte“ (älteres Kind). Namen und Klassen trägt ein Elternteil bei der Einrichtung auf dem Gerät ein.
- Elternbereich hinter einer PIN: Einstufung mit Spanne, Tempo, Transfer, Verlauf, Einstellungen mit Empfehlung, Sicherung als Datei.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `app/` | die App (HTML, CSS, JavaScript ohne Fremdbibliotheken) |
| `docs/` | veröffentlichte Kopie von `app/` für GitHub Pages (wird von `tools/bauen.mjs` geschrieben) |
| `tools/` | Prüfskript für alle Aufgaben, Logik-Test, Bauen, Privat-Prüfung, kleiner Testserver |

Neue Aufgaben: siehe `ANLEITUNG-INHALTE.md`.

## Prüfen und bauen (Node.js)

```
node tools/pruefen.mjs      # alle Aufgaben-Vorlagen über viele Ziehungen
node tools/logik-test.mjs   # Einstiegstest und Lernalltag mit simulierten Kindern
node tools/bauen.mjs        # Privat-Prüfung, Offline-Liste, Version, Kopie nach docs/
```
