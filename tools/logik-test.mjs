// Logik-Test: Einstiegstest und Lernalltag mit der echten Aufgabenbank und simulierten Kindern.
// Prüft: läuft durch, Ergebnis nahe an der Wahrheit, Speichern/Laden mitten im Ablauf, jede Aufgabe lässt sich bauen
// und die richtige Antwort wird als richtig erkannt. Start: node tools/logik-test.mjs
import { baueBank } from '../app/js/bank.js';
import { neuerTest, neuerAlltag, aufgabeAus, istRichtig, neueSitzung, naechsterAuftrag, verbucheAntwort, berichtTest, bildSek, T_APP, H_APP, klasseText, spanneText, tempoText } from '../app/js/ablauf.js';
import { Einstiegstest } from '../app/js/kern/test.js';
import { Alltag } from '../app/js/kern/hochstufung.js';
import { zuJson, ausJson, belebe } from '../app/js/speicher.js';
import { pKorrekt, antwortZeit, istGeraten } from '../app/js/kern/modell.js';
import { vorleseDauerMs } from '../app/js/sprache.js';
import { lsZuTheta } from '../app/js/kern/skala.js';
import { erzeugeRng } from '../app/js/kern/rng.js';
import { heftPassend, sitzungsMinuten, heftNeutralT, heftTexte } from '../app/js/heft.js';
import { migriere } from '../app/js/zustand.js';

const B = baueBank();
let fehler = 0; const F = (m) => { fehler++; console.log('FEHLER', m); };
const rundreise = (obj, Klasse, cfg, u) => { const j = JSON.parse(JSON.stringify(zuJson(obj, B))); const { wert, fehlend } = ausJson(j, B); if (fehlend.length) F('fehlende Aufgaben ' + fehlend.length); return belebe(Klasse, wert, B, cfg, u); };

function richtigeEingabe(auf) {
  if (auf.fehlt) return { fehlt: auf.fehlt.richtig };
  if (auf.art === 'wahl') return { wahl: auf.antwort };
  if (auf.art === 'wort') return { text: ' ' + auf.antwort + ' ' };
  if (auf.art === 'zahl') return { text: String(auf.antwort).replace('.', ',') };
  if (auf.art === 'zahlen') return { felder: auf.antwort.map(String) };
  if (auf.art === 'bruch') return { z: String(auf.antwort.z), n: String(auf.antwort.n) };
  return null;
}
function pruefeAufgabe(a, kind) {
  const auf = aufgabeAus(a, kind);
  if (!istRichtig(auf, richtigeEingabe(auf))) F(`richtige Antwort nicht erkannt: ${a.item.id} ${a.transfer ? a.transfer.typ : ''}`);
  if (auf.art === 'wahl' && auf.wahl.length > 1 && istRichtig(auf, { wahl: (auf.antwort + 1) % auf.wahl.length })) F('falsche Wahl als richtig: ' + a.item.id);
  return auf;
}

const KINDER = [
  { kind: 'insel', name: 'Insel-Kind (typisch)', ls: { RE: 13, SA: 12, HV: 14, LV: 9, GA: 12 }, gamma: -0.3 },
  { kind: 'insel', name: 'Insel-Kind (stark)', ls: { RE: 22, SA: 18, HV: 20, LV: 15, GA: 20 }, gamma: 0 },
  { kind: 'sternwarte', name: 'Sternwarte-Kind (typisch)', ls: { RE: 42, SA: 40, LV: 45, HV: 46, GA: 30 }, gamma: -0.6 },
  { kind: 'sternwarte', name: 'Sternwarte-Kind (stark)', ls: { RE: 55, SA: 50, LV: 60, HV: 60, GA: 30 }, gamma: -0.2 },
];
const bereich = (s) => (s === 'LV' || s === 'HV' ? 'L' : 'M');

for (const [ki, K] of KINDER.entries()) {
  const rng = erzeugeRng(1000 + ki);
  const th = Object.fromEntries(Object.entries(K.ls).map(([s, l]) => [s, lsZuTheta(l, bereich(s))]));
  const antwort = (item, extra = 0) => { if (['KN', 'GE', 'RS', 'EN', 'WW'].includes(item.skala)) return { x: rng.u() < 0.7 ? 1 : 0, t: 8 }; const p = pKorrekt(th[item.skala] + extra - item.b, 0, item.c); const x = rng.u() < p ? 1 : 0; const t0 = K.kind === 'insel' ? item.t0Insel : item.t0Stern; return { x, t: t0 * Math.exp(0.3 * (rng.u() - 0.5)), wn: false }; };
  // ---- Einstiegstest ----
  let T = neuerTest(K.kind, B, rng.u, new Date(Date.UTC(2026, 11, 1)));
  let tage = 0, aufgaben = 0;
  const rollen = {};
  while (!T.fertig() && tage < 14) {
    if (tage === 2) T = rundreise(T, Einstiegstest, T_APP, rng.u); // Speichern/Laden zwischen Testtagen
    const plan = T.tagBeginnen(); if (!plan) break; tage++;
    let n = 0;
    for (;;) {
      const a = T.naechste(); if (!a) break;
      rollen[a.rolle] = (rollen[a.rolle] || 0) + 1;
      if (a.rolle === 'tipp') { T.antwort(a, { t: 1.0 }); continue; }
      pruefeAufgabe(a, K.kind); aufgaben++;
      const r = antwort(a.item, a.transfer ? K.gamma - 0.2 * a.transfer.d : 0);
      const o = T.antwort(a, r);
      if (o && o.pause) T.pauseEntscheid(true);
      if (++n === 7 && tage === 1) T = rundreise(T, Einstiegstest, T_APP, rng.u); // Speichern mitten im Block
    }
  }
  T.beenden();
  const erg = T.ergebnis();
  const ber = berichtTest(erg);
  const abw = ber.map(z => `${z.skala} ${z.ls.toFixed(0)} (wahr ${K.ls[z.skala]})${z.unsicher ? ' unsicher' : ''}`).join(', ');
  console.log(`${K.name}: Test ${tage} Tage, ${aufgaben} Aufgaben, Rollen ${JSON.stringify(rollen)}\n   ${abw}`);
  for (const [sk, s] of Object.entries(erg.skalen)) if (['RE', 'SA', K.kind === 'insel' ? 'HV' : 'LV'].includes(sk) && Math.abs(s.theta - th[sk]) > 2.5 * s.seGes) F(`${K.name} ${sk} außerhalb 2,5 SE: θ ${s.theta.toFixed(2)} ± ${s.seGes.toFixed(2)} statt ${th[sk].toFixed(2)}`);
  if (tage < 2) F('Test an weniger als 2 Tagen');
  if (tempoText(erg) === '–') F(K.name + ': Elternkarte Tempo ohne Wert');
  for (const z of ber) if (!klasseText(z.ls) || /zwischen (.+) und /.test(spanneText(z.lo, z.hi))) F('Elternanzeige Klasse leer/doppelt');

  // ---- Lernalltag (40 Übungstage, jeden Tag Speichern/Laden) ----
  let app = neuerAlltag(K.kind, B, erg, rng.u); let heftZahl = 0;
  const teile = {}; let transferJeSitzung = 0, ohneTransfer = 0, gezeigt = 0, schlussRichtig = 0, angebote = 0;
  for (let tag = 1; tag <= 40; tag++) {
    app = rundreise(app, Alltag, H_APP, rng.u);
    app.tagBeginnen(tag);
    const z = neueSitzung(K.kind, tag % 7, tag, app);
    let tr = 0, letzt = null;
    for (let schritt = 0; schritt < 80; schritt++) {
      const auf = naechsterAuftrag(app, z); if (!auf) break;
      if (auf.beispiel) { z.zeit += 45; continue; }
      teile[auf.a.teil] = (teile[auf.a.teil] || 0) + 1;
      if (auf.a.transfer) tr++;
      pruefeAufgabe(auf.a, K.kind); gezeigt++;
      const extra = auf.a.transfer ? K.gamma - 0.2 * auf.a.transfer.d : 0.2 * Math.min(tag, 20) / 20;
      const r = antwort(auf.a.item, extra);
      letzt = { teil: auf.a.teil, x: r.x };
      if (heftPassend(app, auf, K.kind, z)) {
        // Heft-Pause: 7 Min. am Papier, darf nicht in Sitzungszeit, Tempo, Rateerkennung oder Müdigkeit eingehen
        heftZahl++;
        if (app.vorhersage(auf.a) < 0.75) F('Heft-Aufgabe mit P < 0,75');
        const zeit0 = z.zeit, antw0 = z.antw.length;
        const o = verbucheAntwort(app, z, auf, { ...r, t: 420, heft: true }, K.kind);
        if (z.zeit !== zeit0) F('Heft-Pause zählt zur Sitzungszeit ' + auf.a.teil);
        if (z.antw.length !== antw0) F('Heft-Antwort geht in Müdigkeit/Tempo ein');
        if (o.vb && o.vb.geraten) F('Heft-Antwort als geraten gewertet');
        const lnres = app.sitzung.antworten[app.sitzung.antworten.length - 1].lnres;
        if (Math.abs(lnres) > 0.5) F('Heft-Antwort verändert Tempo-Wert: ' + lnres.toFixed(2));
        if (heftNeutralT(app, auf.a.item, K.kind) >= 420) F('neutrale Heft-Zeit unplausibel');
        if (heftPassend(app, auf, K.kind, z)) F('mehr als 1 Heft-Aufgabe je Sitzung');
        continue;
      }
      const o = verbucheAntwort(app, z, auf, r, K.kind);
      if (o.angebot) angebote++;
    }
    if (!letzt || letzt.teil !== 'schluss') F(`${K.name} Tag ${tag}: endet nicht mit Schlussaufgabe (${letzt && letzt.teil})`);
    else if (letzt.x) schlussRichtig++;
    if (tr) transferJeSitzung++; else ohneTransfer++;
    app.tagBeenden(tag);
  }
  const ev = app.ereignisse.reduce((m, e) => { m[e.nach] = (m[e.nach] || 0) + 1; return m; }, {});
  if (process.env.DIAG) console.log(app.knoten.filter(n => n.status !== "gesperrt").map(n => `${n.bereich}${n.tempo ? "t" : ""}${n.k}:${n.status}:${n.n}:${n.rung}`).join(" "));
  console.log(`   Alltag 40 Tage: ${gezeigt} Aufgaben, Teile ${JSON.stringify(teile)}\n   Sitzungen mit Transfer ${transferJeSitzung}/40, Schluss richtig ${schlussRichtig}/40, Ende-Angebote ${angebote}, Statuswechsel ${JSON.stringify(ev)}`);
  console.log('   Heft-Aufgaben in 40 Tagen: ' + heftZahl); if (!heftZahl) F(K.name + ': nie eine Heft-Aufgabe');
  if (ohneTransfer) F(`${K.name}: ${ohneTransfer} Sitzungen ohne Transfer`);
  if (!ev.sicher && !ev.gefestigt) console.log(`   Hinweis: in 40 Tagen noch keine Hochstufung`);
}
// Heft-Texte passen zur Art des Inhalts (Zahl / Wort / Rechnung)
{
  const tz = heftTexte({ art: 'zahl', text: '63' }), tw = heftTexte({ art: 'wort', text: 'Maus' }), tr = heftTexte({ art: 'rechnung', text: '3 + 4 =', loesung: '7' });
  const alle = (t) => [t.anweisung, t.vorlesen, t.vergleich, t.abrufFrage, t.abrufSichtbar].join(' | ');
  if (!/Zahl/.test(tz.anweisung) || !/die Zahl/.test(tz.vergleich) || /Wort/.test(alle(tz))) F('Zahl falsch benannt: ' + alle(tz));
  if (!/Wort/.test(tw.anweisung) || !/das Wort/.test(tw.vergleich) || /Zahl|Rechnung/.test(alle(tw))) F('Wort falsch benannt: ' + alle(tw));
  if (!/Rechnung/.test(tr.anweisung) || tr.zeigen !== '3 + 4 = 7' || /Wort|Zahl/.test(alle(tr))) F('Rechnung falsch benannt: ' + alle(tr));
}
// Papierzeit zählt nicht zur Bildschirmzeit
if (sitzungsMinuten(0, 20 * 60000, 8 * 60000, 12 * 60) !== 12) F('Papierzeit wird zur Bildschirmzeit gezählt');
if (sitzungsMinuten(0, 15 * 60000, 0, 6 * 60) !== 11) F('Deckel Bildschirmzeit falsch');
// Befund 3: Klassenangabe an den Rändern, Spanne von unten nach oben
if (klasseText(7) !== 'vor Klasse 1' || klasseText(135) !== 'über Klasse 9' || klasseText(15) !== 'Klasse 1, Mitte') F('klasseText an den Rändern falsch');
if (spanneText(18, 5) !== 'zwischen vor Klasse 1 und Klasse 1, Ende') F('Spanne verdreht: ' + spanneText(18, 5));
// Befund 1: Antwortzeit beim Vorlesen – richtige Antwort 2,5 s nach Erscheinen ist nie „geraten"
{
  const a1 = antwortZeit(0, null, 2500); // Kind antwortet, solange noch vorgelesen wird (Ende nie gemeldet)
  if (a1.t !== 2.5 || a1.tAnz !== 2.5) F('Antwort während des Vorlesens: Zeit nicht ab Erscheinen ' + JSON.stringify(a1));
  const a2 = antwortZeit(0, 2000, 2500); // kurz nach Ende des Vorlesens
  if (a2.t !== 0.5 || a2.tAnz !== 2.5) F('Zeit ab Ende des Vorlesens falsch ' + JSON.stringify(a2));
  if (istGeraten(a2, 1.0) || istGeraten(a1, 1.0)) F('Antwort 2,5 s nach Erscheinen als geraten gewertet');
  if (!istGeraten(antwortZeit(0, null, 400), 1.0)) F('Antwort 0,4 s nach Erscheinen nicht als geraten erkannt');
  if (!istGeraten({ t: 0.4 }, 1.0)) F('Alte Antwort ohne tAnz nicht mehr als geraten erkannt');
  if (!(vorleseDauerMs('x'.repeat(50), 0.5) > vorleseDauerMs('x'.repeat(50), 1))) F('Sicherheitsnetz Vorlesen beachtet Sprechtempo nicht');
  // durch die echte Engine: 12 richtige Antworten, je 0,5 s nach Vorlese-Ende, 2,5 s nach Erscheinen
  const rngB = erzeugeRng(77); const T1 = neuerTest('insel', B, rngB.u, new Date(Date.UTC(2026, 11, 1))); T1.tagBeginnen();
  let gz = 0, nz = 0; const app1 = neuerAlltag('insel', B, (() => { const T2 = neuerTest('insel', B, rngB.u, new Date(Date.UTC(2026, 11, 1))); T2.beenden(); return T2.ergebnis(); })(), rngB.u); app1.tagBeginnen(1);
  for (let i = 0; i < 40 && nz < 12; i++) { const a = T1.naechste(); if (!a) break; if (a.rolle === 'tipp') { T1.antwort(a, { t: 1 }); continue; } T1.antwort(a, { x: 1, t: 0.5, tAnz: 2.5 }); nz++; }
  gz = T1.antworten.filter(r => r.geraten).length;
  const z1 = neueSitzung('insel', 1, 1, app1); let gA = 0;
  for (let i = 0; i < 12; i++) { const au = naechsterAuftrag(app1, z1); if (!au || au.beispiel) continue; const o = verbucheAntwort(app1, z1, au, { x: 1, t: 0.5, tAnz: 2.5 }, 'insel'); if (o.vb && o.vb.geraten) gA++; }
  // Befund 6: Rundenzeit = Bildschirmzeit (inkl. Vorlesen/Rückmeldung), Antwortzeit getrennt
  { const z2 = neueSitzung('insel', 1, 2, app1); const au = naechsterAuftrag(app1, z2); verbucheAntwort(app1, z2, au, { x: 1, t: 5, tAnz: 9, tBild: 20 }, 'insel'); if (bildSek(z2) !== 20 || z2.zeit !== 5) F('Bildschirmzeit/Antwortzeit falsch: ' + bildSek(z2) + '/' + z2.zeit); z2.bild = 600; if (naechsterAuftrag(app1, z2).a.teil !== 'schluss') F('Runde endet nicht nach Bildschirm-Sollzeit'); }
  if (gz || gA) F(`Vorlesen: ${gz} Test- und ${gA} Übungsantworten fälschlich als geraten gewertet`);
}
// Migration alter Speicherstände/Sicherungen (Profil-Schlüssel 'R'/'I' bis 1.2.x → 'insel'/'sternwarte')
{
  const rngM = erzeugeRng(5); const Ti = neuerTest('insel', B, rngM.u, new Date(Date.UTC(2026, 11, 1))); Ti.tagBeginnen();
  for (let i = 0; i < 6; i++) { const a = Ti.naechste(); if (!a) break; Ti.antwort(a, a.rolle === 'tipp' ? { t: 1 } : { x: 1, t: 3 }); }
  const Ts = neuerTest('sternwarte', B, rngM.u, new Date(Date.UTC(2026, 11, 1)));
  const alt = (o) => JSON.parse(JSON.stringify(zuJson(o, B)).split('"kind":"insel"').join('"kind":"R"').split('"kind":"sternwarte"').join('"kind":"I"'));
  const Z0 = { pin: 'x', kinder: { R: { phase: 'test', test: alt(Ti), testTage: ['2026-12-01'], einstellungen: { sitzungMin: 12 } }, I: { phase: 'test', test: alt(Ts) } }, gesehen: { hinweise: { 'kind-R-start': true, 'transfer-I-sort': true, 'eltern-start': true } } };
  const Z1 = migriere(JSON.parse(JSON.stringify(Z0)));
  if (Z1.kinder.R || Z1.kinder.I || !Z1.kinder.insel || !Z1.kinder.sternwarte) F('Migration: Profil-Schlüssel nicht umbenannt');
  else {
    if (Z1.kinder.insel.einstellungen.sitzungMin !== 12 || Z1.kinder.insel.testTage.length !== 1) F('Migration: Daten verloren');
    if (JSON.stringify(Z1).includes('"kind":"R"') || JSON.stringify(Z1).includes('"kind":"I"')) F('Migration: alter kind-Wert übrig');
    const Tn = belebe(Einstiegstest, ausJson(Z1.kinder.insel.test, B).wert, B, T_APP, rngM.u);
    if (Tn.kind !== 'insel' || Tn.antworten.length !== Ti.antworten.length) F('Migration: Test nicht wiederhergestellt');
    if (!Tn.naechste()) F('Migration: Test läuft nach dem Laden nicht weiter');
    if (Z1.kinder.insel.klasse !== 1 || Z1.kinder.sternwarte.klasse !== 4 || Z1.kinder.insel.klasseSeit !== 2026) F('Migration: Klasse fehlt');
    const hw = Z1.gesehen.hinweise; if (!hw['kind-insel-start'] || !hw['transfer-sternwarte-sort'] || !hw['eltern-start'] || hw['kind-R-start']) F('Migration: Hinweis-Schlüssel ' + Object.keys(hw));
    if (migriere(JSON.parse(JSON.stringify(Z1))).kinder.insel.klasseSeit !== 2026) F('Migration nicht wiederholbar');
  }
}
console.log(fehler ? `\n${fehler} Fehler` : '\nAlle Logik-Tests bestanden.');
process.exit(fehler ? 1 : 0);
