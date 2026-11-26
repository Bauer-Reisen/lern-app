// Speichert die App auf dem Gerät, damit sie ohne Internet läuft. Geschrieben von tools/bauen.mjs.
const VERSION = 'lernapp-adaptiv-ccc0a0ab32';
const DATEIEN = ["./","css/app.css","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","icons/icon.svg","index.html","js/ablauf.js","js/aufgabe.js","js/bank.js","js/eltern.js","js/heft.js","js/hilfe.js","js/inhalte/grund.js","js/inhalte/index.js","js/inhalte/lesefluss.js","js/inhalte/lesen.js","js/inhalte/lesetexte.js","js/inhalte/rechnen.js","js/inhalte/sach.js","js/inhalte/schema.js","js/inhalte/transfer.js","js/inhalte/werkzeug.js","js/kern/hochstufung.js","js/kern/modell.js","js/kern/rng.js","js/kern/skala.js","js/kern/test.js","js/kind.js","js/main.js","js/speicher.js","js/sprache.js","js/ui.js","js/welten.js","js/zustand.js","manifest.webmanifest","js/version.js"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.indexOf('lernapp-adaptiv-') === 0 && x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('/version.json')) return; // immer frisch aus dem Netz
  e.respondWith(caches.open(VERSION).then((c) => c.match(e.request, { ignoreSearch: true }).then((t) => t || fetch(e.request).then((a) => { if (a.ok) c.put(e.request, a.clone()); return a; }).catch(() => c.match('./')))));
});
