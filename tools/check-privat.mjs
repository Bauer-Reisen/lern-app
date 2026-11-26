// Prüft, dass nichts Privates in veröffentlichte Dateien gelangt (Namen, Wohnort, Schule, Geburtsdaten …).
// Läuft automatisch vor jedem Bauen (tools/bauen.mjs) und vor jedem Hochladen (git pre-push).
// Findet es etwas, bricht es ab.
//
// Die Suchwörter stehen in `.privat-woerter.txt` im Projektordner (ein Wort pro Zeile, # = Kommentar).
// Diese Datei wird selbst nie hochgeladen (.gitignore).
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = fileURLToPath(new URL('../', import.meta.url));
const MUSTER = [
  { name: 'E-Mail-Adresse', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, ausser: /noreply|example\./ },
  { name: 'Schlüssel/Token', re: /(api[_-]?key|secret|token|passwor[dt])\s*[:=]\s*['"][^'"]{8,}/i },
  { name: 'Langer Schlüssel (eyJ…)', re: /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/ },
  { name: 'Geburtsdatum?', re: /geb(oren|urtstag|\.)\s*(am\s*)?\d{1,2}\.\s*\d{1,2}\.\s*(19|20)\d\d/i },
];
const BILD = /\.(png|jpg|jpeg|ico|gif|webp)$/i;

function veroeffentlicht() {
  try {
    const liste = execSync('git ls-files --cached --others --exclude-standard', { cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
    if (liste.length) return liste;
  } catch { /* noch kein Git */ }
  // ohne Git: alles, was laut .gitignore ins Repository kommt
  const out = [];
  const geh = (d) => { for (const f of readdirSync(join(WURZEL, d))) { const p = d ? d + '/' + f : f; if (statSync(join(WURZEL, p)).isDirectory()) geh(p); else out.push(p); } };
  for (const d of ['app', 'docs', 'tools']) if (existsSync(join(WURZEL, d))) geh(d);
  for (const f of ['README.md', 'ANLEITUNG-INHALTE.md', '.gitignore']) if (existsSync(join(WURZEL, f))) out.push(f);
  return out;
}

export function pruefePrivat({ still = false } = {}) {
  const wf = join(WURZEL, '.privat-woerter.txt');
  const woerter = existsSync(wf) ? readFileSync(wf, 'utf8').split(/\r?\n/).map(w => w.trim()).filter(w => w && !w.startsWith('#')) : [];
  if (!woerter.length && !still) console.warn('Hinweis: .privat-woerter.txt fehlt oder ist leer – nur allgemeine Muster werden geprüft.');
  // Wortanfang muss eine Grenze sein (sonst träfe z. B. ein kurzer Name mitten in anderen Wörtern)
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const res = woerter.map(w => new RegExp('(?<![\\p{L}\\p{N}])' + esc(w), 'iu'));
  const dateien = veroeffentlicht().filter(f => !BILD.test(f) && f !== '.privat-woerter.txt');
  const treffer = [];
  for (const datei of dateien) {
    let text; try { text = readFileSync(join(WURZEL, datei), 'utf8'); } catch { continue; }
    text.split('\n').forEach((zeile, i) => {
      for (const m of MUSTER) if (m.re.test(zeile) && !(m.ausser && m.ausser.test(zeile))) treffer.push(`${datei}:${i + 1}  →  ${m.name}`);
      res.forEach((re) => { if (re.test(zeile)) treffer.push(`${datei}:${i + 1}  →  privates Wort aus der Liste`); });
      // Dateinamen selbst prüfen
    });
    res.forEach((re) => { if (re.test(datei)) treffer.push(`${datei}  →  privates Wort im Dateinamen`); });
  }
  return { treffer, dateien: dateien.length, woerter: woerter.length };
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  const { treffer, dateien, woerter } = pruefePrivat();
  if (treffer.length) {
    console.error('\nAchtung: Möglicherweise Privates gefunden – es wird nicht gebaut/hochgeladen.\n');
    treffer.forEach(t => console.error('   ' + t));
    process.exit(1);
  }
  console.log(`Privat-Prüfung: nichts gefunden (${dateien} Dateien, ${woerter} eigene Suchwörter).`);
}
