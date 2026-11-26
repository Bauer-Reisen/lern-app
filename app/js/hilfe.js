// Hilfe für Eltern: Rundgang (beim ersten Öffnen, später wieder aufrufbar), „Was ist neu?", Update-Prüfung.
import { h, knopf } from './ui.js';
import { z, sichere, APP_VERSION, KIND_INFO } from './zustand.js';
import { BAU } from './version.js';

const N = (k) => KIND_INFO[k].name;
const tour = () => [
  ['Willkommen!', `Diese App übt mit ${N('insel')} und ${N('sternwarte')} Mathe und Lesen – jeden Tag ein bisschen, immer passend zum eigenen Können. Alles bleibt auf diesem Gerät. Es gibt kein Konto und keine Werbung.`],
  ['Zwei eigene Welten', `${N('insel')} hat „Die Insel“ mit dem Fuchs Funki: große Knöpfe, alles wird vorgelesen. ${N('sternwarte')} hat „Die Sternwarte“. Jedes Kind öffnet seine Welt mit einem Bilder-Code und sieht nur sich selbst.`],
  ['Zuerst die Expedition', 'An den ersten Tagen findet die App heraus, was jedes Kind schon kann. Das dauert mehrere kurze Tage. Es gibt dabei kein Richtig oder Falsch – Raten, Müdigkeit und schlechte Tage erkennt die App selbst.'],
  ['Dann jeden Tag eine Runde', `${N('insel')} übt etwa 10 Minuten, ${N('sternwarte')} etwa 18. Die Runde endet immer nach einer gelösten Aufgabe. Danach gibt es keinen „Weiter"-Knopf. Ruhetage und Abendruhe sind eingestellt.`],
  ['Fehler sind erlaubt', 'Bei einem Fehler kommt zuerst ein Hinweis, beim zweiten die Lösung mit kurzer Erklärung. Die Kinder sehen nie Prozente, Noten oder einen Vergleich mit dem Geschwister.'],
  ['Dein Heft', `Jedes Kind hat ein echtes Heft: ${N('insel')} das „Inselbuch“, ${N('sternwarte')} das „Sternenbuch“. Höchstens einmal pro Runde wird eine Aufgabe ins Heft geschrieben, am Ende kommt eine Merk-Seite, und beim nächsten Mal wird sie zuerst aus dem Kopf abgefragt. Während der Heft-Zeit steht die Uhr still – Papierzeit zählt nicht als Bildschirmzeit. Schreiben mit der Hand hilft beim Merken (Longcamp 2005; James & Engelhardt 2012).`],
  ['Der Elternbereich', 'Hinter der PIN siehst du für jedes Kind die Einstufung mit Spanne und Sicherheit, den Verlauf, typische Fehler und die Einstellungen – jeweils mit Empfehlung.'],
  ['Wichtig: Sicherung', 'Safari kann Daten von Webseiten löschen, die länger nicht geöffnet wurden. Lege die App deshalb auf den Homescreen und mache einmal pro Woche eine Sicherung (Elternbereich → Sicherung).'],
];

export function zeigeTour(fertig) {
  let i = 0; const TOUR = tour();
  const s = h('div', { class: 'schleier', role: 'dialog', 'aria-modal': 'true' });
  const box = h('div', { class: 'dialog' });
  s.appendChild(box); document.body.appendChild(s);
  const male = () => {
    box.innerHTML = '';
    box.appendChild(h('h2', null, TOUR[i][0]));
    box.appendChild(h('p', null, TOUR[i][1]));
    const punkte = h('div', { class: 'tourpunkte' });
    TOUR.forEach((_, j) => punkte.appendChild(h('button', { type: 'button', class: j === i ? 'aktiv' : '', 'aria-label': `Karte ${j + 1}`, onclick: () => { i = j; male(); } })));
    box.appendChild(punkte);
    box.appendChild(h('div', { class: 'unten' },
      knopf('Zurück', () => { i--; male(); }, 'zweit', { disabled: i === 0 }),
      knopf(i === TOUR.length - 1 ? 'Fertig' : 'Weiter', () => { if (i === TOUR.length - 1) { s.remove(); z().gesehen.tour = true; sichere(); if (fertig) fertig(); } else { i++; male(); } })));
  };
  male();
}

// Neuigkeiten je Version (neueste oben)
export const NEWS = [
  { version: '1.3.0', punkte: ['Die Namen und Klassen der Kinder trägst du einmal selbst ein (Elternbereich → Einstellungen → „Namen und Klassen ändern“). Sie bleiben nur auf diesem Gerät. Die Klasse steigt jedes Schuljahr von allein.', 'Zahlenfolgen: Die Erklärung nennt jetzt die Regel. Sachaufgaben mit besser passenden Verben.', 'Erneutes Vorlesen (🔊) hält die Zeit an. „Geht nicht – es fehlt …“ nur noch bei Geschichten. Nach 3 falschen Bilder-Codes kurz warten; Warnung bei gleichem Code.', 'Elternbereich: Zusatzwerte (z. B. Hören neben dem Lesen) sind als grob gekennzeichnet.'] },
  { version: '1.2.0', punkte: ['Neu für die Sternwarte: Mathe-Aufgaben werden automatisch vorgelesen (im Elternbereich abschaltbar). Lesen-Aufgaben liest das Kind weiter selbst.', 'Genauere Messung: schnelle richtige Antworten während des Vorlesens gelten nicht mehr als geraten. Rundenzeit zählt jetzt die ganze Zeit am Bildschirm (ohne Heft).', 'Elternbereich: Tempo wird angezeigt, Klassenangaben „vor Klasse 1“/„über Klasse 9“, Hinweis bei zu vielen schnellen Antworten.'] },
  { version: '1.1.0', punkte: ['Neu: Heft-Bausteine – Heft-Aufgabe, Merk-Seite am Ende, Abruf aus dem Kopf, Wochenrückblick; auf der Insel Schreibaufgaben an Lesetagen.', 'Heft-Zeit zählt nicht zur Bildschirmzeit und nicht ins Tempo. Elternbereich: Papierzeit, Behaltensquote, Einstellung je Kind.'] },
  { version: '1.0.0', punkte: ['Erste Version: Expedition (Einstiegstest), tägliche Übung, Balken-Hilfe, Elternbereich mit Sicherung.'] },
];
export function ungeseheneNews() {
  const gesehen = z().gesehen.news;
  if (!gesehen) return [];
  const idx = NEWS.findIndex(n => n.version === gesehen);
  return idx < 0 ? NEWS : NEWS.slice(0, idx);
}
export function zeigeNews(liste) {
  const s = h('div', { class: 'schleier', role: 'dialog' });
  s.appendChild(h('div', { class: 'dialog' }, h('h2', null, 'Was ist neu?'),
    ...liste.map(n => h('div', null, h('strong', null, 'Version ' + n.version), h('ul', null, n.punkte.map(p => h('li', null, p))))),
    h('div', { class: 'unten' }, knopf('Alles klar', () => { s.remove(); z().gesehen.news = APP_VERSION; sichere(); }))));
  document.body.appendChild(s);
}

// Update-Prüfung wie in der Film-App: version.json ohne Zwischenspeicher holen, bei neuer Version einmal neu laden
export async function pruefeUpdate() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    if (j.bau && j.bau !== BAU && sessionStorage.getItem('update-versucht') !== j.bau) {
      sessionStorage.setItem('update-versucht', j.bau);
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          // warten, bis der neue Offline-Speicher fertig ist – sonst lädt die Seite noch einmal die alte Fassung
          const neu = reg.installing || reg.waiting;
          if (neu) await new Promise((ok) => { const t = setTimeout(ok, 6000); neu.addEventListener('statechange', () => { if (neu.state === 'activated' || neu.state === 'redundant') { clearTimeout(t); ok(); } }); });
        }
      }
      location.replace(location.pathname + '?v=' + encodeURIComponent(j.bau));
    }
  } catch (e) { /* offline: nichts tun */ }
}
