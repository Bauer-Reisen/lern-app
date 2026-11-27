// Notfall-Hinweis (klassisches Skript, kein Modul, damit es auch auf sehr alten Geräten läuft):
// Startet die App nach 8 Sekunden nicht, steht hier, was man tun kann.
setTimeout(function () {
  var m = document.getElementById('app');
  if (!m || !/wird geladen/.test(m.textContent)) return;
  m.innerHTML = '<h1>Die App startet nicht</h1>' +
    '<p>Bitte einmal neu laden. Hilft das nicht, braucht das Gerät wahrscheinlich ein Software-Update ' +
    '(iPad/iPhone: Einstellungen → Allgemein → Softwareupdate). Die Lern-App braucht iOS 15 oder neuer bzw. einen aktuellen Browser.</p>' +
    '<p><button type="button" id="neuLaden">Neu laden</button></p>';
  document.getElementById('neuLaden').addEventListener('click', function () { location.reload(); });
}, 8000);
