// Ablauf ohne Oberfläche: Sitzungsplan, Müdigkeitssignale, Aufgabe aus Engine-Auftrag, Testtage.
// Wird von der App UND von den Node-Tests benutzt (gleicher Code).
import { Einstiegstest, T_APP } from './kern/test.js';
import { Alltag, H_APP } from './kern/hochstufung.js';
import { lsKlasse, thetaZuLs } from './kern/skala.js';
import { transferAufgabe } from './inhalte/transfer.js';
import { leseTransfer } from './inhalte/lesen.js';
import { rngAus } from './inhalte/werkzeug.js';
import { heftNeutralT } from './heft.js';
import { istGeraten } from './kern/modell.js';
import { zusatzAuftrag, zusatzVerbuche } from './kern/knobel.js';
const ZUSATZ_TEIL = { knobel: 'KN', geo: 'GE', rs: 'RS', en: 'EN' };
// Startwert der Zusatzbereiche: Knobeln/Geometrie an Mathe, Rechtschreibung an Lesen, Englisch an der Klasse (Englisch beginnt in Bayern in Kl. 3)
function zusatzStart(app, key) {
  if (key === 'RS') return Math.max(5, thetaZuLs(app.bereiche.L.theta, 'L') - 8);
  if (key === 'EN') return app.kind === 'insel' ? 8 : 25;
  return Math.max(5, thetaZuLs(app.bereiche.M.theta, 'M') - 5);
}

export { T_APP, H_APP };
export const KLASSE = { insel: 1, sternwarte: 4 };
export const lsKlasseHeute = (kind, datum = new Date(), klasse = KLASSE[kind]) => lsKlasse(klasse, datum);
export const neuerTest = (kind, bank, rngU, datum, klasse) => new Einstiegstest(T_APP, kind, bank, rngU, lsKlasseHeute(kind, datum, klasse));
export function neuerAlltag(kind, bank, testErg, rngU) {
  const app = new Alltag(H_APP, kind, bank, testErg, rngU, {});
  return app;
}

// ---------- Aufgabe zum Anzeigen bauen ----------
// a = Auftrag aus Test oder Alltag ({item, transfer?, rolle?/teil?})
export function aufgabeAus(a, kind, salz = '', vorlesenAuto = true) {
  const it = a.item;
  let auf;
  if (a.transfer) {
    if (it.skala === 'LV' || it.skala === 'HV') auf = { ...leseTransfer(it.a, a.transfer.typ, a.transfer.d, rngAus('lt', it.id, a.transfer.typ, a.transfer.d, salz)), typ: a.transfer.typ, d: a.transfer.d };
    else auf = transferAufgabe(it, a.transfer, kind, salz);
    auf.istTransfer = true;
  } else auf = it.a;
  return { ...auf, itemId: it.id, skala: it.skala, vorlage: it.vorlage, vorlesen: vorlesenArt(it.skala, kind, vorlesenAuto) };
}
// Was wird vorgelesen? 'alles' (Insel-Profil, Hörverstehen, Mathe), 'frage' (Lesen: nur Frage und Antworten nicht)
// Befund 7: Sternwarte-Profil bekommt Mathe automatisch vorgelesen (Eltern können es abschalten: vorlesenAuto = false)
export function vorlesenArt(skala, kind, vorlesenAuto = true) {
  if (skala === 'LV') return 'nichts'; // Lesetext und Frage selbst lesen
  if (skala === 'HV') return 'alles';
  return kind === 'insel' || vorlesenAuto !== false ? 'alles' : 'aufWunsch';
}

// ---------- Antwort prüfen ----------
import { leseZahl } from './inhalte/werkzeug.js';
export function istRichtig(auf, eingabe) {
  if (auf.fehlt) return eingabe && eingabe.fehlt === auf.fehlt.richtig;
  if (eingabe && eingabe.fehlt) return false;
  switch (auf.art) {
    case 'wahl': return eingabe && eingabe.wahl === auf.antwort;
    case 'zahl': { const z = leseZahl(eingabe && eingabe.text); return Number.isFinite(z) && Math.abs(z - auf.antwort) < 1e-9 + (Number.isInteger(auf.antwort) ? 0 : 0.0051); }
    case 'zahlen': return eingabe && Array.isArray(eingabe.felder) && auf.antwort.every((v, i) => Math.abs(leseZahl(eingabe.felder[i]) - v) < 1e-9);
    case 'bruch': {
      const z = leseZahl(eingabe && eingabe.z), n = leseZahl(eingabe && eingabe.n);
      if (!(n > 0) || !Number.isInteger(z)) return false;
      if (Math.abs(z / n - auf.antwort.z / auf.antwort.n) > 1e-12) return false;
      if (auf.kuerzen) { let g = 1; for (let d = 2; d <= Math.min(Math.abs(z), n); d++) if (z % d === 0 && n % d === 0) g = d; return g === 1; }
      return true;
    }
    default: return false;
  }
}
// Typischer Fehler (für Elternbereich)
export function fehlerArt(auf, eingabe) {
  if (!auf.fehler || !eingabe) return null;
  const k = auf.art === 'bruch' ? `${eingabe.z}/${eingabe.n}` : String(leseZahl(eingabe.text));
  return auf.fehler[k] || null;
}

// ---------- Sitzungsplan (Schiedsspruch §2c, wie Simulation) ----------
// wd: Wochentag 0=So..6=Sa ; Insel-Profil: Mathe Mo/Do/Sa, sonst Lesen
export function planeSitzung(kind, wd, sitzungNr, app) {
  const plan = [];
  if (kind === 'insel') {
    const mathe = wd === 1 || wd === 4 || wd === 6 || wd === 0 || wd === 3;
    for (let i = 0; i < (mathe ? 12 : 8); i++) plan.push({ teil: 'grund' });
    for (const x of app.pruefAufgabenHeute()) plan.push({ teil: 'kt', ...x });
    for (let i = 0; i < 3; i++) plan.push({ teil: 'abruf', bereich: mathe ? 'M' : 'L' });
    // Stufe 2 und 3 im Wechsel: je Runde 2 Zusatzaufgaben aus Knobeln, Geometrie, Rechtschreibung, Englisch
    const zi = [['knobel', 'en'], ['geo', 'rs'], ['en', 'knobel'], ['rs', 'geo']][sitzungNr % 4];
    plan.push({ teil: zi[0] }, { teil: zi[1] });
    if (mathe) { for (let i = 0; i < 4; i++) plan.push({ teil: 'neu', bereich: 'M' }); for (let i = 0; i < 3; i++) plan.push({ teil: 'transfer', p: 0.75 }); }
    else { for (let i = 0; i < 4; i++) plan.push({ teil: 'lesen', bereich: 'L' }); plan.push({ teil: 'transfer', p: 0.75 }); }
    plan.push({ teil: 'schluss', bereich: mathe ? 'M' : 'L' });
  } else {
    for (let i = 0; i < 6; i++) plan.push({ teil: 'grund' });
    for (const x of app.pruefAufgabenHeute()) plan.push({ teil: 'kt', ...x });
    for (let i = 0; i < 4; i++) plan.push({ teil: 'abruf', bereich: null });
    for (let i = 0; i < 4; i++) plan.push({ teil: 'neu', bereich: 'M' });
    for (let i = 0; i < 2; i++) plan.push({ teil: 'neu', bereich: 'L' });
    plan.push({ teil: 'knobel' }, { teil: 'en' }, { teil: 'geo' }, { teil: 'rs' }, { teil: sitzungNr % 2 ? 'en' : 'rs' }); // Stufe 2 und 3 (Englisch etwas öfter)
    plan.push({ teil: 'transfer', p: 0.70, typ: 'ueb' });
    if (sitzungNr % 2 === 0) plan.push({ teil: 'transfer', p: 0.70, typ: 'feh' });
    while (plan.filter(p => p.teil === 'transfer').length < 6) plan.push({ teil: 'transfer', p: 0.70 });
    plan.push({ teil: 'transfer', p: 0.70, typ: 'sort' });
    plan.push({ teil: 'schluss', bereich: 'M' });
  }
  return plan;
}
export const SOLL_SEKUNDEN = { insel: 600, sternwarte: 1080 };

// Nächsten Auftrag aus dem Plan holen; liefert {a, p} oder null (Plan zu Ende)
export function naechsterAuftrag(app, zust) {
  while (zust.pi < zust.plan.length) {
    const p = zust.plan[zust.pi];
    const zuEnde = bildSek(zust) >= zust.soll || zust.endeGewuenscht;
    if (p.teil !== 'schluss' && p.teil !== 'kt' && zuEnde) { zust.pi = zust.plan.length - 1; continue; }
    let a = null;
    if (p.teil === 'kt') {
      zust.pi++;
      const it = app.waehleKtAufgabe(p.bereich, p.kt);
      if (it) { const n = app.knoten.find(x => x.bereich === p.bereich && !x.tempo && x.k === it.knoten); return { a: { item: it, node: n, teil: 'kt', kt: p.kt, bereich: p.bereich }, p }; }
      continue;
    }
    if (ZUSATZ_TEIL[p.teil]) a = zusatzAuftrag(app, ZUSATZ_TEIL[p.teil], zusatzStart(app, ZUSATZ_TEIL[p.teil]));
    else if (p.teil === 'grund') a = app.waehleGrundlage();
    else if (p.teil === 'abruf') { a = app.waehleAbruf(p.bereich ? [p.bereich] : null); if (!a) a = app.waehleNeu(p.bereich || 'M'); }
    else if (p.teil === 'neu' || p.teil === 'lesen') a = app.waehleNeu(p.bereich);
    else if (p.teil === 'transfer') a = app.waehleTransfer(p.typ || null, p.p);
    else if (p.teil === 'schluss') a = app.waehleSchluss(p.bereich, zust.schlussVersuche === 0 ? 0.92 : zust.schlussVersuche === 1 ? 0.97 : 0.99, zust.schlussVersuche >= 2);
    if (p.teil !== 'schluss') zust.pi++;
    if (!a) { if (p.teil === 'schluss') zust.pi++; continue; }
    if (a.beispiel) return { a, p, beispiel: true };
    return { a, p };
  }
  return null;
}
// Antwort im Alltag verbuchen; liefert {weiter, angebot}
export function verbucheAntwort(app, zust, auftrag, r, kind) {
  const { a, p } = auftrag;
  if (a.teil === 'kt') {
    const geraten = istGeraten(r, app.tRapid(a.item));
    app.ktAntwort(a.bereich, a.kt, a.item, r.wn ? 0 : r.x, geraten ? 0.25 : 1);
    zust.zeit += r.t; zust.bild = bildSek(zust) - r.t + (r.tBild != null ? r.tBild : r.t);
    return {};
  }
  if (ZUSATZ_TEIL[a.teil]) {
    zusatzVerbuche(app, a.item, r.wn ? 0 : r.x, r.t, app.heute || 0);
    zust.zeit += r.t; zust.bild = bildSek(zust) + (r.tBild != null ? r.tBild : r.t);
    return {};
  }
  if (r.heft) {
    // Heft-Aufgabe: zählt fürs Wissen, aber ohne Zeitwertung – nicht in Sitzungszeit, Tempo, Rateerkennung, Müdigkeit
    const vb = app.verbuche(a, { x: r.x, t: heftNeutralT(app, a.item, kind), wn: r.wn, muede: false, wFaktor: r.wFaktor });
    zust.heftGemacht = true;
    if (r.tBild != null) zust.bild = bildSek(zust) + r.tBild; // Eintippen am Bildschirm zählt, die Papierzeit nicht
    return { angebot: false, vb };
  }
  const vb = app.verbuche(a, { x: r.x, t: r.t, tAnz: r.tAnz, wn: r.wn, muede: zust.muedeAktiv, wFaktor: r.wFaktor });
  const t0 = kind === 'insel' ? a.item.t0Insel : a.item.t0Stern;
  zust.antw.push({ x: r.wn ? 0 : r.x, P: vb ? vb.P : 0.7, geraten: vb ? vb.geraten : false, lnres: Math.log(Math.max(0.3, r.t)) - Math.log(t0) });
  zust.bild = bildSek(zust) + (r.tBild != null ? r.tBild : r.t);
  zust.zeit += r.t;
  if (p.teil === 'schluss') {
    zust.schlussVersuche++;
    if (r.x || zust.schlussVersuche >= 6) { zust.pi = zust.plan.length; zust.fertig = true; } // Befund 14: ab dem 3. Versuch leichte Aufgaben, Notbremse nach 6
  }
  let angebot = false;
  if (!zust.angeboten && zust.antw.length >= 6) {
    const s = muedeSignale(zust.antw, H_APP.muedeS3 != null ? H_APP.muedeS3 : -0.35);
    const zahl = s.s1 + s.s2 + s.s3;
    if (zahl >= 1) zust.muedeAktiv = true;
    angebot = kind === 'insel' ? ((zust.zeit >= 480 && s.s3) || zahl >= 2) : zahl >= 2;
    if (angebot) zust.angeboten = true;
  }
  return { angebot, vb };
}
// Befund 6: Bildschirmzeit der Runde (Vorlesen, Rückmeldung, Hinweis, Lösung eingeschlossen; Heft-Papierzeit und Pausen nicht).
// zust.zeit bleibt die reine Antwortzeit (nur fürs Tempo). Alte Sitzungen ohne zust.bild: Antwortzeit.
export const bildSek = (zust) => (zust.bild != null ? zust.bild : zust.zeit);
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function muedeSignale(antw, s3Schwelle = -0.35) {
  const l5 = antw.slice(-5), l6 = antw.slice(-6);
  return {
    s1: l5.filter(v => v.geraten).length >= 3,
    s2: antw.length >= 10 && median(l5.map(v => v.lnres)) - median(antw.slice(0, 5).map(v => v.lnres)) > Math.log(1.5),
    s3: l6.reduce((s, v) => s + v.x - v.P, 0) / 6 < s3Schwelle,
  };
}
export function neueSitzung(kind, wd, sitzungNr, app) {
  return { plan: planeSitzung(kind, wd, sitzungNr, app), pi: 0, zeit: 0, soll: SOLL_SEKUNDEN[kind], antw: [], muedeAktiv: false, angeboten: false, endeGewuenscht: false, schlussVersuche: 0, fertig: false, gezeigt: 0, bild: 0 };
}

// ---------- Elternbericht aus Testergebnis / Alltag ----------
const SKALA_NAME = { KN: 'Logik und Knobeln', GE: 'Geometrie und Daten', RS: 'Rechtschreibung', EN: 'Englisch', RE: 'Rechnen', SA: 'Sachrechnen', LV: 'Lesen (selbst gelesen)', HV: 'Hörverstehen (vorgelesen)', GA: 'Grundaufgaben' };
export function berichtTest(erg) {
  const zeilen = [];
  for (const [k, s] of Object.entries(erg.skalen)) {
    if (!s.gestartet) continue;
    const bereich = k === 'LV' || k === 'HV' ? 'L' : 'M';
    const ls = thetaZuLs(s.theta, bereich), lo = thetaZuLs(s.theta - 1.64 * s.seGes, bereich), hi = thetaZuLs(s.theta + 1.64 * s.seGes, bereich);
    zeilen.push({ skala: k, name: SKALA_NAME[k], ls, lo, hi, unsicher: s.unsicher || s.seGes > 0.75, rater: !!s.rater, zusatz: s.art === 'versatz', decke: s.decke, genau: s.genau, n: s.n });
  }
  return zeilen;
}
// Befund 3: unter LS 10 „vor Klasse 1", ab LS 100 „über Klasse 9"; Spanne immer von unten nach oben
export const klasseText = (ls) => { if (ls < 10) return 'vor Klasse 1'; if (ls >= 100) return 'über Klasse 9'; const k = ls / 10; const kl = Math.floor(k); const teil = k - kl; return `Klasse ${kl}, ${teil < 0.34 ? 'Anfang' : teil < 0.67 ? 'Mitte' : 'Ende'}`; };
export const spanneText = (lo, hi) => { const a = klasseText(Math.min(lo, hi)), b = klasseText(Math.max(lo, hi)); return a === b ? a : `zwischen ${a} und ${b}`; };
// Befund 2: Tempo aus erg.tau (vorher fälschlich erg.tauHat)
export const tempoText = (erg) => (erg && typeof erg.tau === 'number' ? (erg.tau > 0.15 ? 'eher schnell' : erg.tau < -0.15 ? 'eher langsam' : 'durchschnittlich') : '–');
export const klasseKurz = (ls) => `Kl. ${(ls / 10).toFixed(1).replace('.', ',')}`;
