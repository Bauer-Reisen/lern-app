// Kleiner Testserver für den Ordner app/ (nur zum Ausprobieren am PC)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORDNER = fileURLToPath(new URL('../app/', import.meta.url));
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const PORT = Number(process.env.PORT || 5830);

createServer(async (req, res) => {
  let pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pfad.endsWith('/')) pfad += 'index.html';
  const datei = normalize(join(ORDNER, pfad));
  if (!datei.startsWith(normalize(ORDNER))) { res.writeHead(403).end(); return; }
  try {
    const inhalt = await readFile(datei);
    res.writeHead(200, { 'Content-Type': TYPEN[extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(inhalt);
  } catch { res.writeHead(404).end('nicht gefunden'); }
}).listen(PORT, () => console.log(`Adaptive Lern-App läuft auf http://localhost:${PORT}`));
