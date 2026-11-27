// Notfall-Hinweis (klassisches Skript, kein Modul, damit es auch auf sehr alten Geräten läuft):
// Sammelt Startfehler und zeigt sie an, falls die App nach 8 Sekunden nicht gestartet ist.
var startFehler = [];
window.addEventListener('error', function (e) {
  var t = e && e.target;
  if (t && t !== window && (t.src || t.href)) startFehler.push('Datei nicht geladen: ' + (t.src || t.href));
  else startFehler.push((e.message || 'Fehler') + (e.filename ? ' (' + e.filename.split('/').slice(-2).join('/') + ':' + e.lineno + ':' + e.colno + ')' : ''));
}, true);
window.addEventListener('unhandledrejection', function (e) { startFehler.push('Promise: ' + (e.reason && (e.reason.message || e.reason))); });
setTimeout(function () {
  var m = document.getElementById('app');
  if (!m || !/wird geladen/.test(m.textContent)) return;
  var info = navigator.userAgent.replace(/^Mozilla\/5\.0 /, '');
  m.innerHTML = '<h1>Die App startet nicht</h1>' +
    '<p>Bitte einmal neu laden. Hilft das nicht, mach bitte ein Bildschirmfoto von dieser Seite.</p>' +
    '<p><button type="button" id="neuLaden">Neu laden</button></p>' +
    '<pre id="fehlerText" style="white-space:pre-wrap;font-size:12px"></pre>';
  document.getElementById('fehlerText').textContent = (startFehler.length ? startFehler.join('\n') : 'Keine Fehlermeldung (Modul lädt nicht oder sehr langsam).') + '\n\nGerät: ' + info;
  document.getElementById('neuLaden').addEventListener('click', function () { location.reload(); });
}, 8000);
