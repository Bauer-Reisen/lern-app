// Elternbereich (hinter PIN): Profil je Kind, Verlauf, Fehler, Nutzung, Einstellungen mit Empfehlung,
// Test neu starten, lautes Lesen messen, Sicherung.
import { h, knopf, zeige, welt, dialog, einmal } from './ui.js';
import { knobelBericht } from './kern/knobel.js';
import { z, sichere, KINDER, KIND_INFO, EMPFEHLUNG, testErgebnis, testNeuStarten, holeAlltag, holeTest, heute, tageZwischen, ersetzeZustand, holeBank, datumText, namenFehlen } from './zustand.js';
import { berichtTest, klasseText, klasseKurz, spanneText, tempoText } from './ablauf.js';
import { thetaZuLs } from './kern/skala.js';
import { exportiere, importiere, istHomescreen, bitteDauerhaft, loescheAlles } from './speicher.js';
import { zeigeStart, pinEingabe, pinHash, homescreenHinweis, BILDER, kinderEintragen } from './main.js';
import { zeigeTour, zeigeNews, NEWS } from './hilfe.js';
import { LF_TEXTE, LF_RICHTWERTE, woerter } from './inhalte/lesefluss.js';
import { TRANSFER_NAMEN } from './inhalte/transfer.js';
import { setzeTempo } from './sprache.js';
import { behaltensQuote, HEFT_NAME, HEFT_HINWEIS_MIN } from './heft.js';

let reiter = 'uebersicht';
export function zeigeEltern(r) {
  welt(null);
  if (r) reiter = r;
  const R = [['uebersicht', 'Übersicht'], ...KINDER.map(k => [k, KIND_INFO[k].name]), ['lesen', 'Lautes Lesen'], ['einst', 'Einstellungen'], ['sicherung', 'Sicherung'], ['hilfe', 'Hilfe']];
  const leiste = h('div', { class: 'reiter', role: 'tablist' }, ...R.map(([id, t]) => knopf(t, () => zeigeEltern(id), reiter === id ? 'aktiv' : '', { role: 'tab', 'aria-selected': reiter === id ? 'true' : 'false' })));
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, 'Elternbereich'), knopf('Schließen', zeigeStart, 'leise'));
  const inhalt = h('div');
  zeige(kopf, sicherungsBanner(), leiste, inhalt);
  ({ uebersicht, insel: (el) => profil('insel', el), sternwarte: (el) => profil('sternwarte', el), lesen: lautLesen, einst: einstellungen, sicherung, hilfe })[reiter](inhalt);
}
function sicherungsBanner() {
  const l = z().letzteSicherung;
  const tage = l ? tageZwischen(l.slice(0, 10), heute()) : null;
  if (tage !== null && tage < 7) return null;
  return h('div', { class: 'banner' + (tage === null || tage > 14 ? ' rot' : '') }, tage === null ? 'Noch keine Sicherung gemacht. ' : `Letzte Sicherung vor ${tage} Tagen. `, 'Bitte einmal pro Woche sichern: ', knopf('Jetzt sichern', () => { sicherJetzt(); zeigeEltern(); }, 'zweit'));
}
function sicherJetzt() { exportiere(z()); z().letzteSicherung = heute() + new Date().toISOString().slice(10); sichere(); } // Datum in Ortszeit (Befund 16)

// ---------- Übersicht ----------
function uebersicht(el) {
  for (const k of KINDER) {
    const K = z().kinder[k];
    const zeilen = [h('h2', null, KIND_INFO[k].name)];
    if (K.phase !== 'ueben') zeilen.push(h('p', null, `Expedition (Einstiegstest): ${K.testTage.length} Tag(e) bisher. Die Einstufung erscheint, wenn die Expedition fertig ist (meist nach 3–7 kurzen Tagen).`));
    else for (const b of einstufung(k)) zeilen.push(spanneZeile(b));
    const letzte = K.verlauf.slice(-1)[0];
    zeilen.push(h('p', { class: 'leise' }, letzte ? `Zuletzt geübt: ${letzte.datum} (${letzte.minuten} Min., ${letzte.aufgaben} Aufgaben)` : 'Noch keine Übungsrunde.'));
    zeilen.push(knopf('Mehr zu ' + KIND_INFO[k].name, () => zeigeEltern(k), 'zweit'));
    el.appendChild(h('div', { class: 'karte' }, ...zeilen));
  }
  const e = einmal('eltern-start', 'Die Einstufung ist eine Schätzung mit Spanne. Am Anfang ist sie breit und wird mit jeder Übungsrunde genauer. Ein Niveau von Hand setzen geht absichtlich nicht.');
  if (e) el.insertBefore(e, el.firstChild);
}
const sicherheit = (se) => (se < 0.35 ? 'hoch' : se < 0.6 ? 'mittel' : 'niedrig');
function einstufung(k) {
  const K = z().kinder[k];
  const erg = testErgebnis(k); if (!erg) return [];
  const out = [];
  if (K.alltag || K.phase === 'ueben') {
    const app = holeAlltag(k);
    const tag = Math.max(0, tageZwischen(K.alltagStart || heute(), heute()));
    for (const [b, name] of [['M', 'Mathe'], ['L', k === 'insel' ? 'Lesen (Hörverstehen)' : 'Lesen']]) {
      const B = app.bereiche[b]; const se = app.seB ? app.seB(b, tag) : B.seTest;
      out.push({ name, ls: thetaZuLs(B.theta, b), lo: thetaZuLs(B.theta - 1.64 * se, b), hi: thetaZuLs(B.theta + 1.64 * se, b), se });
    }
    const kb = knobelBericht(app);
    if (kb) out.push({ name: 'Logik und Knobeln', ls: kb.ls, lo: kb.lo, hi: kb.hi, se: (kb.hi - kb.ls) / (1.64 * 8), unsicher: kb.grob });
  }
  return out;
}
function spanneZeile(b) {
  const pos = (ls) => Math.max(0, Math.min(100, (ls - 5) / 0.95)); // LS 5..100
  const band = h('div', { class: 'spanne' }, ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map(l => h('div', { class: 'klasse', style: `left:${pos(l)}%` })),
    h('div', { class: 'band', style: `left:${pos(b.lo)}%;width:${Math.max(1, pos(b.hi) - pos(b.lo))}%` }), h('div', { class: 'punkt', style: `left:${pos(b.ls)}%` }));
  return h('div', null, h('div', null, h('strong', null, b.name + ': '), `etwa ${klasseText(b.ls)}, wahrscheinlich ${spanneText(b.lo, b.hi)}. Sicherheit ${sicherheit(b.se)}${b.unsicher ? ' (noch unsicher)' : ''}.`), band,
    h('div', { class: 'skalaleiste' }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => h('span', null, 'Kl. ' + k))));
}

// ---------- Profil eines Kindes ----------
function profil(k, el) {
  if (!el) return;
  const K = z().kinder[k];
  const teile = [];
  if (K.phase !== 'ueben') {
    const T = K.test ? holeTest(k) : null;
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Expedition läuft'), h('p', null, `${K.testTage.length} Testtag(e): ${K.testTage.join(', ') || '–'}.`),
      T ? h('p', { class: 'leise' }, `Bisher ${T.antworten.length} Antworten. Raten erkannt: ${T.events.rateBloecke}×, Müdigkeit: ${T.events.muedeFlags}×, schwache Tage: ${T.events.schwacheTage}.`) : null));
  } else {
    const erg = testErgebnis(k);
    const kopf = h('div', { class: 'karte' }, h('h2', null, 'Einstufung je Bereich'), ...einstufung(k).map(spanneZeile));
    if (erg && erg.events && erg.events.rateBloecke >= 2) kopf.appendChild(h('div', { class: 'banner' }, 'Hinweis: In der Expedition gab es auffällig viele sehr schnelle Antworten (Raten). Die Einstufung wurde trotzdem freigegeben, ist aber weniger sicher. Sie wird beim Üben genauer.'));
    teile.push(kopf);
    // Getrennte Kennwerte
    const bericht = berichtTest(erg);
    const zeilen = bericht.map(r => h('tr', null, h('td', null, r.name), h('td', null, `${klasseText(r.ls)}${r.rater ? ' (noch unsicher – zu viele schnelle Antworten)' : r.zusatz ? ' (Zusatzwert, nur grob)' : r.unsicher ? ' (noch unsicher)' : ''}`), h('td', null, r.genau == null ? '–' : Math.round(100 * r.genau) + ' %')));
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Wissen und Genauigkeit (Expedition)'), h('table', { class: 'einfach' }, h('tr', null, h('th', null, 'Bereich'), h('th', null, 'Wissen'), h('th', null, 'Genauigkeit*')), ...zeilen),
      h('p', { class: 'leise' }, '* Anteil richtig bei Aufgaben, die eigentlich sicher klappen sollten. Niedrige Werte deuten auf Flüchtigkeit hin, nicht auf fehlendes Wissen.'), bericht.some(r => r.zusatz) && h('p', { class: 'leise' }, 'Zusatzwert: Dieser Bereich wird in der Expedition nur mit wenigen Aufgaben gestreift (zum Vergleich mit dem Hauptbereich, z. B. Hören gegen selbst Lesen). Er bleibt deshalb grob und fließt nicht in die Einstufung oben ein.')));
    const app = holeAlltag(k);
    const tempo = tempoText(erg);
    const ga = app.knoten.filter(n => n.tempo);
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Tempo'), h('p', null, `Arbeitstempo in der Expedition: ${tempo}.`),
      h('p', null, `Grundaufgaben (abrufen statt abzählen): ${ga.filter(n => n.status === 'sicher' || n.status === 'gefestigt').length} von ${ga.length} Stufen sitzen.`)));
    const tr = Object.keys(app.gamma).map(t => { const g = app.gamma[t]; const n = Object.values(g.hist || {}).reduce((s, l) => s + l.length, 0); return h('tr', null, h('td', null, TRANSFER_NAMEN[t]), h('td', null, n ? (g.g > -0.3 ? 'gut' : g.g > -0.8 ? 'mittel' : 'noch schwer') : '–'), h('td', null, String(n))); });
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Transfer (Wissen in neuer Form anwenden)'), h('table', { class: 'einfach' }, h('tr', null, h('th', null, 'Art'), h('th', null, 'Stand'), h('th', null, 'Aufgaben')), ...tr)));
    // Knoten
    const st = { gesperrt: 'noch nicht dran', arbeit: 'wird geübt', vorlaeufig: 'vorläufig sicher', sicher: 'sicher', gefestigt: 'gefestigt' };
    const zeile = (n) => h('tr', null, h('td', null, n.tempo ? 'Grundaufgaben ' + (n.k + 1) : (() => { const l = thetaZuLs(n.btyp, n.bereich); return `${n.bereich === 'M' ? 'Mathe' : 'Lesen'} ${klasseText(l)}${l < 10 || l >= 100 ? ' (' + klasseKurz(l) + ')' : ''}`; })()), h('td', null, st[n.status] || n.status), h('td', null, String(n.n)));
    const sichtbar = app.knoten.filter(n => n.status !== 'gesperrt' || n.n > 0);
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Lernstufen'), h('table', { class: 'einfach' }, h('tr', null, h('th', null, 'Stufe'), h('th', null, 'Stand'), h('th', null, 'Antworten')), ...sichtbar.map(zeile)),
      h('p', { class: 'leise' }, `Kontrolltests bisher: ${app.zaehler.kontrolltests} (alle 20 Übungstage, unauffällig in der Runde).`)));
  }
  // Verlauf
  const v = K.verlauf.slice(-14).reverse();
  teile.push(h('div', { class: 'karte' }, h('h2', null, 'Verlauf'), v.length ? h('table', { class: 'einfach' }, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Min.'), h('th', null, 'Aufgaben'), h('th', null, 'richtig')),
    ...v.map(x => h('tr', null, h('td', null, x.datum), h('td', null, String(x.minuten)), h('td', null, String(x.aufgaben)), h('td', null, x.aufgaben ? Math.round(100 * x.richtig / x.aufgaben) + ' %' : '–')))) : h('p', { class: 'leise' }, 'Noch keine Übungsrunden.')));
  // Nutzungszeiten (14 Tage)
  const tage = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); tage.push(datumText(d)); }
  const maxMin = Math.max(10, ...tage.map(t => K.tagesMinuten[t] || 0));
  teile.push(h('div', { class: 'karte' }, h('h2', null, 'Nutzungszeit (14 Tage)'), h('div', { class: 'balkendiag', role: 'img', 'aria-label': 'Minuten pro Tag' }, ...tage.map(t => h('div', { title: `${t}: ${K.tagesMinuten[t] || 0} Min.`, style: `height:${100 * (K.tagesMinuten[t] || 0) / maxMin}%` }))),
    h('p', { class: 'leise' }, `Summe: ${tage.reduce((s, t) => s + (K.tagesMinuten[t] || 0), 0)} Minuten. Empfehlung: höchstens ${EMPFEHLUNG[k].tagMin} Min. pro Tag.`)));
  // Heft (Papierzeit, getrennt von der Bildschirmzeit)
  { const H = K.heft, pm = (t) => Math.round((H.papier[t] || 0) / 60), woche = tage.slice(-7).reduce((s, t) => s + (H.papier[t] || 0), 0), q = behaltensQuote(H.abrufe);
    teile.push(h('div', { class: 'karte' }, h('h2', null, 'Heft: ' + HEFT_NAME[k] + ' (Papierzeit)'),
      h('p', { class: 'leise' }, 'Papierzeit zählt nicht zur Bildschirmzeit und nicht zur Tagesgrenze.'),
      h('ul', null, h('li', null, 'Heute: ' + pm(heute()) + ' Min. Papier, ' + (K.tagesMinuten[heute()] || 0) + ' Min. Bildschirm'), h('li', null, 'Letzte 7 Tage: ' + Math.round(woche / 60) + ' Min. Papier, ' + tage.slice(-7).reduce((s, t) => s + (K.tagesMinuten[t] || 0), 0) + ' Min. Bildschirm'),
        h('li', null, 'Behaltensquote Merk-Seiten: ' + (q == null ? 'noch keine' : Math.round(100 * q) + ' % aus ' + H.abrufe.length + ' Abrufen (Selbsteinschätzung, Fast = halb)')),
        k === 'insel' ? h('li', null, 'Schreibaufgaben: ' + H.schreib.richtig + ' von ' + H.schreib.n + ' richtig geschrieben') : null),
      h('p', { class: 'leise' }, 'Die Heft-Bausteine gehen nicht in die Einstufung ein und bringen keine Belohnung.')));
  }
  // Typische Fehler
  const f = Object.entries(K.fehler).sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  const V = holeBank().vorlagen;
  teile.push(h('div', { class: 'karte' }, h('h2', null, 'Typische Fehler'), f.length ? h('ul', null, ...f.map(([vid, x]) => h('li', null, `${(V.get(vid) || {}).titel || vid}: ${x.n}× – ${Object.entries(x.arten).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([a, n]) => `${a} (${n})`).join(', ')}`))) : h('p', { class: 'leise' }, 'Noch keine.')));
  // Lautes Lesen
  if (K.wcpm.length) teile.push(h('div', { class: 'karte' }, h('h2', null, 'Lautes Lesen'), h('ul', null, ...K.wcpm.slice(-6).map(m => h('li', null, `${m.datum}: ${m.wcpm} Wörter pro Minute richtig (${m.fehler} Fehler)`)))));
  // Neustart
  teile.push(h('div', { class: 'karte' }, h('h2', null, 'Expedition neu starten'), h('p', { class: 'leise' }, 'Nur nötig, wenn die Einstufung offensichtlich falsch ist (z. B. ein Geschwister hat gespielt). Der Lernverlauf bleibt im Verlauf stehen, die Lernstufen werden neu bestimmt.'),
    knopf('Expedition neu starten', async () => {
      const w = await dialog('Wirklich neu starten?', h('p', null, `Die Expedition von ${KIND_INFO[k].name} beginnt von vorn. Die bisherige Einstufung wird ersetzt.`), [{ text: 'Neu starten', wert: true }, { text: 'Abbrechen', wert: false, klasse: 'zweit' }]);
      if (w) { testNeuStarten(k); zeigeEltern(k); }
    }, 'zweit')));
  for (const t of teile) el.appendChild(t);
}

// ---------- Lautes Lesen (WCPM) ----------
function lautLesen(el) {
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Lautes Lesen messen'), h('p', null, 'Das Kind liest 60 Sekunden laut vor. Du tippst Wörter an, die falsch gelesen werden. Am Ende tippst du das letzte gelesene Wort an.'),
    ...KINDER.map(k => knopf(`Mit ${KIND_INFO[k].name} messen`, () => lesenWaehlen(k), 'breit zweit'))));
}
function lesenWaehlen(k) {
  const K = z().kinder[k];
  const ber = einstufung(k).filter(b => b.name.indexOf('Lesen') === 0)[0];
  const ls = ber ? ber.ls : (k === 'insel' ? 12 : 42);
  const stufe = LF_TEXTE.map(t => t.ls).filter((x, i, a) => a.indexOf(x) === i).reduce((best, x) => (x <= ls + 3 ? x : best), 10);
  const benutzt = K.wcpm.map(m => m.text);
  const text = LF_TEXTE.filter(t => t.ls === stufe).sort((a, b) => (benutzt.indexOf(a.id) >= 0) - (benutzt.indexOf(b.id) >= 0))[0];
  const ws = text.t.split(/\s+/);
  const fehler = new Set(); let letztes = null, startZeit = null, endZeit = null, phase = 'bereit', timer = null;
  const tafel = h('div', { class: 'lesetext karte' });
  ws.forEach((w, i) => tafel.appendChild(h('span', { onclick: () => tippe(i) }, w + ' ')));
  const info = h('p', { class: 'leise' }, `Text auf Stufe ${klasseText(stufe)}, ${woerter(text.t)} Wörter.`);
  const uhr = h('p', { class: 'wert' }, '');
  const startK = knopf('Start (60 Sekunden)', () => { phase = 'liest'; startZeit = Date.now(); startK.disabled = true; stoppK.disabled = false; timer = setInterval(tick, 500); tick(); }, 'breit');
  const stoppK = knopf('Fertig gelesen', () => ende(), 'zweit breit', { disabled: true });
  function tick() { const s = Math.floor((Date.now() - startZeit) / 1000); uhr.textContent = `${s} s (nur für dich sichtbar)`; if (s >= 60) ende(); }
  function ende() { clearInterval(timer); if (phase !== 'liest') return; endZeit = Date.now(); phase = 'letztes'; uhr.textContent = 'Tippe jetzt das letzte gelesene Wort an.'; stoppK.disabled = true; }
  function tippe(i) {
    const sp = tafel.children[i];
    if (phase === 'liest') { if (fehler.has(i)) { fehler.delete(i); sp.classList.remove('fehler'); } else { fehler.add(i); sp.classList.add('fehler'); } }
    else if (phase === 'letztes') {
      letztes = i; sp.classList.add('letztes'); phase = 'fertig';
      const sek = Math.max(5, Math.min(60, ((endZeit || Date.now()) - startZeit) / 1000));
      const gelesen = ws.slice(0, i + 1).filter(w => /[A-Za-zÄÖÜäöüß0-9]/.test(w)).length;
      const f = [...fehler].filter(j => j <= i).length;
      const wcpm = Math.round((gelesen - f) / (sek / 60));
      if (sek < 15 || wcpm > 250) { uhr.textContent = ''; el2.appendChild(h('div', { class: 'rueck hinweis' }, `Diese Messung ist nicht plausibel (${Math.round(sek)} s, ${wcpm} Wörter pro Minute) und wird nicht gespeichert. Bitte das Kind mindestens 15 Sekunden lesen lassen und dann das zuletzt gelesene Wort antippen.`), knopf('Noch einmal', () => lesenWaehlen(k), 'zweit')); return; }
      K.wcpm.push({ datum: heute(), text: text.id, stufe, wcpm, fehler: f, gelesen, sek: Math.round(sek) });
      sichere();
      const richt = LF_RICHTWERTE.filter(([l]) => l > 10).map(([l, w]) => `Ende Kl. ${l / 10 - 1}: ${w}`).join(' · ');
      uhr.textContent = '';
      el2.appendChild(h('div', { class: 'rueck gut' }, `${wcpm} richtig gelesene Wörter pro Minute (${f} Fehler in ${Math.round(sek)} s).`));
      el2.appendChild(h('p', { class: 'leise' }, 'Richtwerte (Wörter pro Minute): ' + richt + '. Wichtiger als ein einzelner Wert ist die Entwicklung über Wochen.'));
    }
  }
  const el2 = h('div');
  zeige(h('div', { class: 'kopf' }, h('div', { class: 'titel' }, `Lautes Lesen – ${KIND_INFO[k].name}`), knopf('Zurück', () => zeigeEltern('lesen'), 'leise')), info, startK, stoppK, uhr, tafel, el2);
}

// ---------- Einstellungen mit Empfehlung ----------
const GRUND = {
  sitzungMin: 'Kurz und verteilt wirkt besser als lang und geballt (Cepeda 2006).',
  tagMin: 'Leitlinie: Freizeit-Bildschirm mit 6–9 Jahren 30–45 Min. an einzelnen Tagen, mit 9–12 Jahren 45–60 Min. (AWMF 2023). Die Grenze liegt darunter.',
  ruhetage: '5 Übungstage mit 2 Ruhetagen verteilen das Üben, ohne jeden Tag Bildschirm.',
  sperreAb: 'Kein Bildschirm in der letzten Stunde vor dem Schlafen (AAP).',
  zweite: 'Insel (jüngeres Kind): nur auf Elternknopf. Sternwarte (älteres Kind): freiwillig, höchstens 10 Minuten.',
  vorlesen: 'So misst die App in Mathe das Rechnen und nicht das Lesetempo; die Zeit zählt erst ab Ende des Vorlesens. Lesen-Aufgaben liest das Kind weiter selbst.',
  heft: 'Freies Schreiben mit der Hand stärkt das Merken stärker als Tippen (Longcamp 2005; James & Engelhardt 2012). Höchstens 1 Heft-Aufgabe pro Runde, Merk-Seite am Ende, Abruf aus dem Kopf beim nächsten Mal.',
  heftHinweisMin: 'Nach dieser Zeit kommt einmal freundlich „Fertig genug – eine Skizze reicht“ (kein Abbruch, keine Uhr sichtbar).',
  ferien: 'In den Ferien 3 Tage pro Woche, eine Ferienwoche ganz frei.',
};
function einstellungen(el) {
  for (const k of KINDER) {
    const K = z().kinder[k], E = K.einstellungen, Em = EMPFEHLUNG[k];
    const zahl = (key, min, max, einheit) => { const i = h('input', { type: 'number', min, max, value: E[key], style: 'width:6em' }); i.addEventListener('change', () => { E[key] = Math.max(min, Math.min(max, Number(i.value) || Em[key])); sichere(); }); return h('div', null, h('label', null, `${einheit}`), i, h('div', { class: 'leise' }, `Empfehlung: ${Em[key]} – ${GRUND[key]}`)); };
    const tage = h('div', { class: 'zeile' }, ...['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((t, i) => { const c = h('input', { type: 'checkbox', checked: E.ruhetage.indexOf(i) >= 0, style: 'min-height:auto' }); c.addEventListener('change', () => { E.ruhetage = c.checked ? E.ruhetage.concat([i]) : E.ruhetage.filter(x => x !== i); sichere(); }); return h('label', { style: 'display:inline-flex;gap:4px;align-items:center' }, c, t); }));
    const zeit = h('input', { type: 'time', value: E.sperreAb }); zeit.addEventListener('change', () => { E.sperreAb = zeit.value || Em.sperreAb; sichere(); });
    const zweite = h('select', null, ...[['eltern', 'nur auf Elternknopf'], ['frei', 'freiwillig (≤ 10 Min.)'], ['nie', 'nie']].map(([v, t]) => h('option', { value: v, selected: E.zweite === v }, t))); zweite.addEventListener('change', () => { E.zweite = zweite.value; sichere(); });
    const ferien = h('select', null, ...[[false, 'Schulzeit'], ['ferien', 'Ferien (3 Tage pro Woche)'], ['frei', 'Ferienpause (ganz frei)']].map(([v, t]) => h('option', { value: String(v), selected: String(K.ferien) === String(v) }, t))); ferien.addEventListener('change', () => { K.ferien = ferien.value === 'false' ? false : ferien.value; sichere(); });
    el.appendChild(h('div', { class: 'karte' }, h('h2', null, KIND_INFO[k].name),
      zahl('sitzungMin', 5, 30, 'Länge einer Runde (Minuten)'), zahl('tagMin', 5, 60, 'Höchstens pro Tag (Minuten)'),
      h('label', null, 'Ruhetage'), tage, h('div', { class: 'leise' }, 'Empfehlung: Mi und So – ' + GRUND.ruhetage),
      h('label', null, 'Gesperrt ab'), zeit, h('div', { class: 'leise' }, `Empfehlung: ${Em.sperreAb} – ${GRUND.sperreAb}`),
      h('label', null, 'Zweite Runde am Tag'), zweite, h('div', { class: 'leise' }, GRUND.zweite),
      knopf('Heute eine Extra-Runde erlauben', () => { K.extraSitzung = heute(); sichere(); dialog('Erlaubt', h('p', null, `${KIND_INFO[k].name} darf heute noch eine Runde machen (auch an einem Ruhetag).`)); }, 'zweit'),
      h('label', null, h("input", { type: 'checkbox', checked: E.heft !== false, style: 'min-height:auto', onchange: (e) => { E.heft = e.target.checked; sichere(); } }), ' Heft-Bausteine (' + HEFT_NAME[k] + ')'), h('div', { class: 'leise' }, 'Empfehlung: ein – ' + GRUND.heft),
      zahl('heftHinweisMin', 1, 15, 'Heft-Hinweis nach (Minuten)'),
      k === 'sternwarte' ? h('label', null, h('input', { type: 'checkbox', checked: E.vorlesen !== false, style: 'min-height:auto', onchange: (e) => { E.vorlesen = e.target.checked; sichere(); } }), ' Mathe-Aufgaben automatisch vorlesen') : null,
      k === 'sternwarte' ? h('div', { class: 'leise' }, 'Empfehlung: ein – ' + GRUND.vorlesen) : null,
      h('label', null, 'Ferien'), ferien, h('div', { class: 'leise' }, GRUND.ferien),
      knopf('Bilder-Code ändern', () => neuerBildcode(k), 'leise'),
      knopf('Alles auf Empfehlung', () => { K.einstellungen = JSON.parse(JSON.stringify(Em)); sichere(); zeigeEltern('einst'); }, 'leise')));
  }
  const tempo = h('input', { type: 'range', min: '0.6', max: '1.2', step: '0.1', value: String(z().sprachTempo || 0.9) });
  tempo.addEventListener('change', () => { z().sprachTempo = Number(tempo.value); setzeTempo(z().sprachTempo); sichere(); });
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Allgemein'), h('label', null, 'Vorlese-Tempo'), tempo,
    knopf('Namen und Klassen ändern', () => kinderEintragen(() => zeigeEltern('einst')), 'zweit'),
    knopf('Eltern-PIN ändern', () => pinEingabe('Neue PIN', '4 Ziffern', (p) => pinEingabe('Neue PIN wiederholen', '', (p2) => { if (p === p2) { z().pin = pinHash(p); sichere(); } zeigeEltern('einst'); }, () => zeigeEltern('einst')), () => zeigeEltern('einst')), 'zweit')));
}
function neuerBildcode(k) {
  let wahl = [];
  const g = h('div', { class: 'bildgitter' });
  const anz = h('div', { class: 'mitte', style: 'font-size:2em;min-height:1.4em' });
  BILDER.forEach((b, i) => g.appendChild(knopf(b, () => { if (wahl.length < 3 && wahl.indexOf(i) < 0) { wahl.push(i); anz.textContent = wahl.map(j => BILDER[j]).join(' '); } })));
  zeige(h('h1', null, `Neuer Bilder-Code für ${KIND_INFO[k].name}`), g, anz, h('div', { class: 'zeile' }, knopf('Neu', () => { wahl = []; anz.textContent = ''; }, 'zweit'), knopf('Speichern', () => { if (wahl.length === 3) { z().kinder[k].bildcode = wahl; sichere(); zeigeEltern('einst'); } })));
}

// ---------- Sicherung ----------
function sicherung(el) {
  const Z = z();
  const l = Z.letzteSicherung;
  const datei = h('input', { type: 'file', accept: '.json,application/json' });
  datei.addEventListener('change', async () => {
    if (!datei.files[0]) return;
    try {
      const daten = await importiere(datei.files[0]);
      const w = await dialog('Sicherung einspielen?', h('p', null, 'Alle Daten auf diesem Gerät werden durch die Sicherung ersetzt.'), [{ text: 'Einspielen', wert: true }, { text: 'Abbrechen', wert: false, klasse: 'zweit' }]);
      if (w) { ersetzeZustand(daten); await dialog('Fertig', h('p', null, 'Die Sicherung ist eingespielt.')); if (namenFehlen()) kinderEintragen(() => zeigeEltern('uebersicht'), true); else zeigeEltern('uebersicht'); }
    } catch (e) { dialog('Das hat nicht geklappt', h('p', null, e.message)); }
  });
  const status = h('p', { class: 'leise' }, 'Speicher wird geprüft …');
  bitteDauerhaft().then(ok => { status.textContent = `Dauerhafter Speicher: ${ok ? 'ja' : 'nein'} · Vom Homescreen geöffnet: ${istHomescreen() ? 'ja' : 'nein'}`; });
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Sicherung'), h('p', null, l ? `Letzte Sicherung: ${l.slice(0, 10)}` : 'Noch keine Sicherung.'),
    h('p', null, 'Die Sicherung ist eine Datei mit allen Daten beider Kinder. Bewahre sie z. B. in „Dateien" oder per Mail an dich selbst auf.'),
    knopf('Sicherung speichern', () => { sicherJetzt(); zeigeEltern('sicherung'); }, 'breit'),
    h('label', null, 'Sicherung einspielen'), datei));
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Warum sichern?'), h('p', null, 'Safari löscht nach 7 Tagen ohne Besuch alle Daten einer Webseite. Apps, die auf dem Homescreen liegen, sind davon ausgenommen. Die App bittet zusätzlich um dauerhaften Speicher. Trotzdem kann ein Geräte-Wechsel oder Aufräumen Daten kosten – deshalb wöchentlich sichern.'), status,
    istHomescreen() ? null : knopf('Wie lege ich die App auf den Homescreen?', homescreenHinweis, 'zweit')));
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Alles löschen'), h('p', { class: 'leise' }, 'Löscht alle Daten auf diesem Gerät. Vorher sichern!'),
    knopf('Alle Daten löschen', async () => {
      const w = await dialog('Wirklich alles löschen?', h('p', null, 'Alle Fortschritte beider Kinder sind danach weg. Das kann man nicht rückgängig machen (außer mit einer Sicherung).'), [{ text: 'Ja, alles löschen', wert: true }, { text: 'Abbrechen', wert: false, klasse: 'zweit' }]);
      if (w) { loescheAlles(); location.reload(); }
    }, 'leise')));
}

// ---------- Hilfe ----------
function hilfe(el) {
  el.appendChild(h('div', { class: 'karte' }, h('h2', null, 'Hilfe'),
    knopf('Rundgang ansehen', () => zeigeTour(), 'breit zweit'), knopf('Was ist neu?', () => zeigeNews(NEWS), 'breit zweit'), knopf('Auf den Homescreen legen', homescreenHinweis, 'breit zweit'),
    h('h2', null, 'Kurz erklärt'),
    h('ul', null, h('li', null, 'Einstufung: Lernstand in „Klasse, Anfang/Mitte/Ende" mit Spanne. Je mehr geübt wird, desto schmaler die Spanne.'),
      h('li', null, 'Sicher: Eine Lernstufe gilt als sicher, wenn sie zu mindestens 90 % klappt, auch an einem neuen Tag.'),
      h('li', null, 'Transfer: Eine bekannte Aufgabe in neuer Verkleidung, z. B. mit überflüssiger oder fehlender Angabe.'),
      h('li', null, 'Kontrolltest: Alle 20 Übungstage prüft die App unauffällig, ob die Einstufung noch stimmt.')),
    h('p', { class: 'leise' }, 'Version ' + (NEWS[0] && NEWS[0].version))));
}
