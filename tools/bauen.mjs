// Baut die Zusatzdateien der App: Symbole (PNG), sw.js mit Dateiliste, version.json und js/version.js,
// und kopiert die fertige App nach docs/ (das veröffentlicht GitHub Pages).
// Vorher läuft die Privat-Prüfung (tools/check-privat.mjs) – bei Treffern wird NICHT gebaut.
// Nach jeder Änderung an app/ ausführen: node tools/bauen.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { pruefePrivat } from './check-privat.mjs';

const APP = fileURLToPath(new URL('../app/', import.meta.url));
const DOCS = fileURLToPath(new URL('../docs/', import.meta.url));

// Syntax-Prüfung aller App-Skripte: ein einziger Syntaxfehler legt die ganze App lahm („wird geladen …“).
{
  const { spawnSync } = await import('node:child_process');
  const alle = (d) => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? alle(p) : (n.endsWith('.js') ? [p] : []); });
  const kaputt = alle(join(APP, 'js')).filter(f => {
    const typ = f.endsWith('start-hinweis.js') ? 'commonjs' : 'module';
    const r = spawnSync(process.execPath, ['--input-type=' + typ, '--check'], { input: readFileSync(f) });
    if (r.status !== 0) { console.error('Syntaxfehler in ' + relative(APP, f) + ':\n' + String(r.stderr).split('\n').slice(0, 5).join('\n')); return true; }
    return false;
  });
  if (kaputt.length) { console.error('Abbruch: Syntaxfehler (nichts gebaut).'); process.exit(1); }
  console.log('Syntax-Prüfung: ok');
}
{ const p = pruefePrivat(); if (p.treffer.length) { console.error('Abbruch: Privates gefunden (nichts gebaut):'); p.treffer.forEach(x => console.error('   ' + x)); process.exit(1); } console.log(`Privat-Prüfung: ok (${p.dateien} Dateien, ${p.woerter} Suchwörter)`); }

// ---------- Symbole ----------
function png(n, male) {
  const px = Buffer.alloc(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const [r, g, b] = male(x / n, y / n); const i = 4 * (y * n + x); px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
  const roh = Buffer.alloc((n * 4 + 1) * n);
  for (let y = 0; y < n; y++) { roh[y * (n * 4 + 1)] = 0; px.copy(roh, y * (n * 4 + 1) + 1, y * n * 4, (y + 1) * n * 4); }
  const crcT = []; for (let k = 0; k < 256; k++) { let c = k; for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[k] = c >>> 0; }
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (typ, daten) => { const l = Buffer.alloc(4); l.writeUInt32BE(daten.length); const td = Buffer.concat([Buffer.from(typ), daten]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(n, 0); ihdr.writeUInt32BE(n, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(roh)), chunk('IEND', Buffer.alloc(0))]);
}
// Stern auf blauem Grund, links Insel-Grün
function symbol(u, v) {
  const dx = u - 0.5, dy = v - 0.52, r = Math.hypot(dx, dy), w = Math.atan2(dy, dx);
  const stern = r < 0.17 + 0.13 * Math.cos(5 * (w + Math.PI / 2));
  if (stern) return [245, 197, 66];
  if (v > 0.8) return [63, 183, 201];
  return [Math.round(47 + 30 * v), Math.round(80 + 40 * v), 190];
}
if (!existsSync(join(APP, 'icons'))) mkdirSync(join(APP, 'icons'));
for (const n of [180, 192, 512]) writeFileSync(join(APP, 'icons', `icon-${n}.png`), png(n, symbol));
writeFileSync(join(APP, 'icons', 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#3256c0"/><path d="M50 18l9 21 23 2-17 15 5 22-20-12-20 12 5-22-17-15 23-2z" fill="#f5c542"/></svg>');

// ---------- Dateiliste und Version ----------
const dateien = [];
(function geh(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) geh(p); else dateien.push(relative(APP, p).replace(/\\/g, '/')); } })(APP);
const liste = dateien.filter(f => f !== 'sw.js' && f !== 'version.json' && f !== 'js/version.js').sort();
const hash = createHash('sha256');
for (const f of liste) hash.update(f).update(readFileSync(join(APP, f)));
const bau = hash.digest('hex').slice(0, 10);
writeFileSync(join(APP, 'js', 'version.js'), `// Wird von tools/bauen.mjs geschrieben.\nexport const BAU = '${bau}';\n`);
writeFileSync(join(APP, 'version.json'), JSON.stringify({ bau, gebaut: new Date().toISOString() }) + '\n');
const cacheListe = ['./', ...liste, 'js/version.js'];
writeFileSync(join(APP, 'sw.js'), `// Speichert die App auf dem Gerät, damit sie ohne Internet läuft. Geschrieben von tools/bauen.mjs.
const VERSION = 'lernapp-adaptiv-${bau}';
const DATEIEN = ${JSON.stringify(cacheListe)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.indexOf('lernapp-adaptiv-') === 0 && x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('/version.json')) return; // immer frisch aus dem Netz
  e.respondWith(caches.open(VERSION).then((c) => c.match(e.request, { ignoreSearch: true }).then((t) => t || fetch(e.request).then((a) => { if (a.ok) c.put(e.request, a.clone()); return a; }).catch(() => c.match('./')))));
});
`);
// ---------- Veröffentlichte Fassung (GitHub Pages aus /docs) ----------
rmSync(DOCS, { recursive: true, force: true });
cpSync(APP, DOCS, { recursive: true });
writeFileSync(join(DOCS, '.nojekyll'), '');
{ const p = pruefePrivat({ still: true }); if (p.treffer.length) { rmSync(DOCS, { recursive: true, force: true }); console.error('Abbruch: Privates in docs/ gefunden – docs/ gelöscht:'); p.treffer.forEach(x => console.error('   ' + x)); process.exit(1); } }
console.log(`gebaut: ${bau}, ${cacheListe.length} Dateien im Offline-Speicher, Kopie in docs/`);
