// Kinderbereich: eigene Welt, Expedition (Einstiegstest) und tägliche Übung.
import { h, knopf, zeige, welt, dialog, einmal } from './ui.js';
import { z, sichere, KIND_INFO, holeTest, sichereTest, holeAlltag, sichereAlltag, testFertigMachen, heute, appTag, holeBank, datumText } from './zustand.js';
import { aufgabeAus, neueSitzung, naechsterAuftrag, verbucheAntwort, fehlerArt, bildSek } from './ablauf.js';
import { zeigeAufgabe, loesungText, erklaerungText } from './aufgabe.js';
import { weltSvg, FUCHS, TELESKOP } from './welten.js';
import { sprich } from './sprache.js';
import { HEFT_NAME, heftPassend, sitzungsMinuten, wochenSchluessel, RUECKBLICK_FRAGEN, schreibAuftrag, heftTexte } from './heft.js';
import { zeigeStart } from './main.js';
const vorTagen = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return datumText(d); }; // Ortszeit (Befund 16)

const BLOCK_MAX_MIN = { insel: 10, sternwarte: 15 };
const WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// ---------- Darf heute geübt werden? ----------
export function darfHeute(k, fuerTest = false) {
  const K = z().kinder[k], E = K.einstellungen, jetzt = new Date();
  const hhmm = String(jetzt.getHours()).padStart(2, '0') + ':' + String(jetzt.getMinutes()).padStart(2, '0');
  if (K.ferien === 'frei') return { ok: false, grund: 'Ferienpause. Genieß die freie Zeit!' };
  if (E.sperreAb && (hhmm >= E.sperreAb || hhmm < '06:00')) return { ok: false, grund: 'Jetzt ist Abendruhe. Morgen geht es weiter.' };
  if (E.ruhetage.indexOf(jetzt.getDay()) >= 0 && K.extraSitzung !== heute()) return { ok: false, grund: `Heute ist Ruhetag (${WOCHENTAG[jetzt.getDay()]}). Ausruhen hilft dem Kopf beim Merken.` };
  const min = (K.tagesMinuten[heute()] || 0);
  if (fuerTest) {
    if (K.testTage.indexOf(heute()) >= 0 && !(K.test && K.testLaeuftHeute === heute())) return { ok: false, grund: 'Für heute ist die Expedition geschafft. Morgen geht es weiter!' };
    return { ok: true };
  }
  const fertigHeute = K.verlauf.filter(v => v.datum === heute()).length;
  if (K.ferien === 'ferien' && !fertigHeute) {
    const grenze = vorTagen(6);
    const tage = new Set(K.verlauf.filter(v => v.datum >= grenze).map(v => v.datum)).size;
    if (tage >= (E.ferienTage || 3)) return { ok: false, grund: `Ferien: ${E.ferienTage || 3} Runden pro Woche sind geschafft. Genieß die freie Zeit!` };
  }
  if (K.sitzung && K.sitzung.datum === heute() && !K.sitzung.zust.fertig) return { ok: true, weiter: true };
  if (min >= E.tagMin) return { ok: false, grund: 'Für heute ist genug geübt. Bis morgen!' };
  if (fertigHeute >= 1) {
    if (K.extraSitzung === heute()) return { ok: true, zweite: true };
    if (E.zweite === 'frei' && fertigHeute < 2) return { ok: true, zweite: true, frage: true };
    return { ok: false, grund: 'Für heute geschafft! Morgen geht es weiter.' };
  }
  return { ok: true };
}

// ---------- Startseite des Kindes ----------
export function zeigeKind(k) {
  welt(k);
  const K = z().kinder[k], I = KIND_INFO[k];
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, I.welt), knopf('⌂', () => zeigeStart(), 'symbolknopf', { 'aria-label': 'Zur Startseite' }));
  if (K.phase !== 'ueben') return zeigeExpeditionStart(k, kopf);
  const sicher = zaehleKoennen(k);
  const teile = [kopf, h('div', { class: 'welt', html: weltSvg(k, K.belohnungen.length) })];
  const d = darfHeute(k);
  const begruessung = k === 'insel' ? `Hallo ${I.name}! Ich bin ${I.figur}.` : `Willkommen in der Sternwarte, ${I.name}.`;
  teile.push(h('p', null, begruessung));
  if (K.einstellungen.heft) teile.push(h('p', { class: 'leise' }, k === 'insel' ? 'Leg dein Inselbuch und einen Stift bereit – Funki ist gespannt.' : 'Leg dein Sternenbuch und einen Stift bereit.'));
  const neu = K.belohnungen.length - (K.belohnungGesehen || 0);
  if (neu > 0) { teile.push(h('div', { class: 'rueck gut' }, k === 'insel' ? `Auf deiner Insel ist etwas Neues aufgetaucht!` : `Am Himmel leuchtet etwas Neues!`)); K.belohnungGesehen = K.belohnungen.length; sichere(); }
  if (d.ok) {
    teile.push(knopf(d.weiter ? 'Weitermachen ➜' : d.zweite ? 'Noch eine kurze Runde' : 'Los geht’s ➜', () => starteSitzung(k, d.zweite), 'breit'));
  } else teile.push(h('div', { class: 'karte mitte' }, d.grund));
  teile.push(h('h2', null, k === 'insel' ? 'Das kannst du schon' : 'Deine Können-Karte'));
  teile.push(h('div', { class: 'koennen' },
    h('span', null, `🧭 Entdeckt: ${sicher.sicher}`),
    h('span', null, `⭐ Gefestigt: ${sicher.gefestigt}`),
    h('span', null, `🏆 Gemeistert: ${sicher.transfer}`)));
  const kapsel = zeitkapsel(k);
  if (kapsel) teile.push(h('div', { class: 'karte' }, h('strong', null, '⏳ Zeitkapsel'), h('br'), kapsel));
  const e1 = einmal('kind-' + k + '-start', k === 'insel' ? 'Tippe auf 🔊, dann liest Funki dir alles vor.' : 'Jeden Tag gibt es eine Runde. Neue Sterne leuchten, wenn du etwas sicher kannst.');
  if (e1) teile.splice(2, 0, e1);
  zeige(...teile);
  if (k === 'insel') sprich(begruessung + (d.ok ? (d.weiter ? ' Tippe auf Weitermachen.' : d.zweite ? ' Tippe auf Noch eine kurze Runde.' : ' Tippe auf Los geht’s.') : ' ' + d.grund));
}
function zaehleKoennen(k) {
  const K = z().kinder[k];
  if (!K.alltag) return { sicher: 0, gefestigt: 0, transfer: 0 };
  const app = holeAlltag(k);
  const r = { sicher: 0, gefestigt: 0, transfer: 0 };
  for (const n of app.knoten) { if (n.status === 'sicher') r.sicher++; if (n.status === 'gefestigt') { r.sicher++; r.gefestigt++; } }
  for (const g of Object.values(app.gamma)) { const hist = g.hist || {}; for (const d of Object.keys(hist)) if ((hist[d] || []).slice(-4).filter(Boolean).length >= 3) { r.transfer++; break; } }
  return r;
}
function zeitkapsel(k) {
  const K = z().kinder[k];
  if (!K.alltagStart) return null;
  const tage = Math.round((Date.now() - new Date(K.alltagStart).getTime()) / 864e5);
  if (tage < 21) return null;
  const grenze = vorTagen(21);
  const vorher = K.belohnungen.filter(b => b.datum <= grenze).length, jetzt = K.belohnungen.length;
  return `Vor drei Wochen ${k === 'insel' ? 'standen auf deiner Insel' : 'leuchteten'} ${vorher} ${k === 'insel' ? 'Dinge' : 'Lichter'}. Heute sind es ${jetzt}. Das hast du dir erarbeitet.`;
}

// ---------- Expedition (Einstiegstest) ----------
function zeigeExpeditionStart(k, kopf) {
  const K = z().kinder[k], I = KIND_INFO[k];
  if (K.phase === 'neu') { K.phase = 'test'; sichere(); }
  const d = darfHeute(k, true);
  const stuecke = h('div', { class: 'karte-exp', 'aria-label': 'Expeditionskarte' });
  for (let i = 0; i < 7; i++) stuecke.appendChild(h('span', { class: i < K.testTage.length ? 'da' : '' }, i < K.testTage.length ? (k === 'insel' ? '🌴' : '✨') : ''));
  const text = k === 'insel' ? `${I.figur} geht auf Expedition. Kommst du mit? Jeden Tag entdecken wir ein Stück der Karte.` : 'Die Sternwarte wird neu vermessen. An jedem Tag entdeckst du einen Teil des Himmels. Manche Aufgaben sind leicht, manche sehr schwer – das ist so gewollt.';
  const teile = [kopf, h('div', { class: 'mitte', html: k === 'insel' ? FUCHS : TELESKOP, style: 'width:120px;margin:0 auto' }), h('h1', { class: 'mitte' }, 'Die Expedition'), h('p', null, text), stuecke,
    einmal('exp-' + k, 'Bei der Expedition gibt es kein Richtig oder Falsch. Mach einfach, so gut du kannst. Wenn du etwas nicht weißt, tippe auf „Weiß ich noch nicht".')];
  if (d.ok) teile.push(knopf(K.testTage.length ? 'Expedition fortsetzen ➜' : 'Expedition starten ➜', () => starteTestTag(k), 'breit'));
  else teile.push(h('div', { class: 'karte mitte' }, d.grund));
  zeige(...teile);
  if (k === 'insel') sprich(text + (d.ok ? '' : ' ' + d.grund));
}

function starteTestTag(k) {
  const K = z().kinder[k];
  const T = holeTest(k);
  if (K.testLaeuftHeute !== heute()) {
    if (T.block) T._blockAbschluss();
    if (T.fertig()) return testFertig(k);
    const plan = T.tagBeginnen();
    if (!plan) return testFertig(k);
    K.testTage.push(heute()); K.testLaeuftHeute = heute(); K.blockStart = Date.now();
    sichereTest(k);
  }
  naechsteTestAufgabe(k);
}
function naechsteTestAufgabe(k) {
  const K = z().kinder[k], T = holeTest(k);
  // Zeitgrenze je Block: Insel 10, Sternwarte 15 Minuten (dann sanft beenden)
  if (T.block && !T.block.pauseEnde && Date.now() - (K.blockStart || Date.now()) > BLOCK_MAX_MIN[k] * 60000) T.pauseEntscheid(false);
  const a = T.naechste();
  if (!a) { K.testLaeuftHeute = null; sichereTest(k); if (T.fertig()) return testFertig(k); return testTagFertig(k); }
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, 'Expedition'), knopf('Pause', () => { sichereTest(k); zeigeKind(k); }, 'symbolknopf'));
  const flaeche = h('div');
  if (a.rolle === 'tipp') return tippSpiel(k, kopf, a);
  const auf = aufgabeAus(a, k, 'test', K.einstellungen.vorlesen !== false);
  zeige(kopf, a.rolle === 'ga' ? h('p', { class: 'leise' }, k === 'insel' ? 'Blitzrunde: Weißt du es gleich?' : 'Blitzrunde: Wie schnell weißt du es?') : null, flaeche);
  zeigeAufgabe(flaeche, auf, {
    kind: k, modus: 'test', fertig: (r) => {
      const o = T.antwort(a, { x: r.x, t: r.t, tAnz: r.tAnz, wn: !!r.wn });
      sichereTest(k);
      if (o && o.pause) return pauseFrage(k);
      naechsteTestAufgabe(k);
    },
  });
}
function tippSpiel(k, kopf, a) {
  const T = holeTest(k);
  const feld = h('div', { class: 'mitte', style: 'min-height:260px;position:relative' });
  zeige(kopf, h('p', null, k === 'insel' ? 'Tippe ganz schnell auf den Stern, wenn er kommt!' : 'Tippe so schnell wie möglich auf den Stern.'), feld);
  if (k === 'insel') sprich('Tippe ganz schnell auf den Stern, wenn er kommt!');
  setTimeout(() => {
    const t0 = Date.now();
    const x = 10 + Math.random() * 60, y = 20 + Math.random() * 140;
    feld.appendChild(h('button', { type: 'button', style: `position:absolute;left:${x}%;top:${y}px;font-size:2.4em;background:transparent;color:inherit;border:none`, 'aria-label': 'Stern', onclick: () => { T.antwort(a, { t: (Date.now() - t0) / 1000 }); sichereTest(k); naechsteTestAufgabe(k); } }, '⭐'));
  }, 900 + Math.random() * 1200);
}
async function pauseFrage(k) {
  const T = holeTest(k);
  const w = await dialog('Kurze Pause?', h('p', null, 'Du hast schon viel geschafft. Möchtest du noch ein bisschen weitermachen?'), [{ text: 'Weitermachen', wert: true }, { text: 'Für heute Schluss', wert: false, klasse: 'zweit' }]);
  T.pauseEntscheid(w);
  sichereTest(k);
  naechsteTestAufgabe(k);
}
function testTagFertig(k) {
  const K = z().kinder[k];
  const text = k === 'insel' ? 'Super! Heute haben wir ein neues Stück der Karte entdeckt. Morgen geht es weiter.' : 'Ein weiterer Teil des Himmels ist vermessen. Morgen geht es weiter.';
  zeige(h('div', { class: 'mitte', html: k === 'insel' ? FUCHS : TELESKOP, style: 'width:120px;margin:20px auto' }), h('h1', { class: 'mitte' }, 'Geschafft für heute!'), h('p', { class: 'mitte' }, text),
    h('div', { class: 'karte-exp' }, ...Array.from({ length: 7 }, (_, i) => h('span', { class: i < K.testTage.length ? 'da' : '' }, i < K.testTage.length ? (k === 'insel' ? '🌴' : '✨') : ''))),
    knopf('Zurück', () => zeigeStart(), 'breit zweit'));
  if (k === 'insel') sprich(text);
}
function testFertig(k) {
  testFertigMachen(k);
  const text = k === 'insel' ? 'Die Expedition ist zu Ende! Deine Insel ist jetzt bereit. Ab morgen übst du jeden Tag ein bisschen.' : 'Die Vermessung ist abgeschlossen. Deine Sternwarte ist bereit. Ab morgen gibt es jeden Tag eine Runde.';
  zeige(h('div', { class: 'welt', html: weltSvg(k, 1) }), h('h1', { class: 'mitte' }, 'Expedition geschafft! 🎉'), h('p', null, text), knopf('Zurück', () => zeigeStart(), 'breit'));
  if (k === 'insel') sprich(text);
}

// ---------- Tägliche Übung ----------
function starteSitzung(k, zweite) {
  const K = z().kinder[k], E = K.einstellungen;
  const app = holeAlltag(k);
  if (!(K.sitzung && K.sitzung.datum === heute() && !K.sitzung.zust.fertig)) {
    const tag = appTag(k);
    app.tagBeginnen(tag);
    const zust = neueSitzung(k, new Date().getDay(), K.verlauf.length + 1, app);
    zust.soll = (zweite && k === 'sternwarte' ? Math.min(10, E.sitzungMin) : E.sitzungMin) * 60;
    K.sitzung = { datum: heute(), tag, start: Date.now(), zust, richtig: 0, gezeigt: 0, letzteEingabe: Date.now() };
    sichereAlltag(k);
  }
  vorspann(k);
}
function naechsteUebung(k) {
  const K = z().kinder[k], S = K.sitzung, zust = S.zust, app = holeAlltag(k);
  // Tagesgrenze: dann nur noch die Schlussaufgabe
  const minHeute = (K.tagesMinuten[heute()] || 0) + bildSek(zust) / 60;
  if (minHeute >= K.einstellungen.tagMin) zust.endeGewuenscht = true;
  const E = K.einstellungen;
  if (k === 'insel' && E.heft && !zust.fertig && !zust.schreibGemacht && S.gezeigt >= 4 && zust.plan.some(p => p.teil === 'lesen')) { zust.schreibGemacht = true; sichere(); return schreibAufgabe(k); }
  const auftrag = zust.fertig ? null : naechsterAuftrag(app, zust);
  if (!auftrag) return sitzungEnde(k);
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, KIND_INFO[k].welt), knopf('Pause', () => { sichere(); zeigeKind(k); }, 'symbolknopf'));
  if (auftrag.beispiel) return zeigeBeispiel(k, kopf, auftrag);
  const auf = aufgabeAus(auftrag.a, k, String(S.gezeigt), E.vorlesen !== false);
  const heft = E.heft && heftPassend(app, auftrag, k, zust);
  if (heft) { zust.heftGemacht = true; sichere(); }
  const flaeche = h('div');
  const teilText = auftrag.a.teil === 'knobel' ? (k === 'insel' ? 'Rätsel' : 'Logik und Knobeln') : auftrag.a.teil === 'geo' ? (k === 'insel' ? 'Formen und Zählen' : 'Geometrie und Daten') : auftrag.a.transfer ? (k === 'insel' ? 'Knobel-Aufgabe' : 'Transfer: ' + (auf.typ === 'sort' ? 'Struktur erkennen' : 'neue Verkleidung')) : null;
  const stelle = () => {
  zeige(kopf, teilText ? h('p', { class: 'leise' }, teilText) : null, heft ? h('p', { class: 'leise' }, 'Jetzt das Ergebnis aus deinem ' + HEFT_NAME[k] + ' eintippen.') : null, auftrag.a.transfer && auf.typ ? einmal('transfer-' + k + '-' + auf.typ, auf.hinweis) : null, flaeche);
  const aufStart = Date.now(); // ab hier Bildschirmzeit (nach der Heft-Pause)
  zeigeAufgabe(flaeche, auf, {
    kind: k, modus: 'ueben', fertig: async (r) => {
      const tBild = Math.min(300, (Date.now() - aufStart) / 1000); // gedeckelt: lange Pausen zählen nicht
      S.gezeigt++; if (r.x) S.richtig++;
      if (!r.x && !r.wn) {
        const v = auftrag.a.item.vorlage; const fa = fehlerArt(auf, r.eingabe) || (auf.istTransfer ? 'Transfer: ' + auf.typ : 'falsch');
        K.fehler[v] = K.fehler[v] || { n: 0, arten: {} }; K.fehler[v].n++; K.fehler[v].arten[fa] = (K.fehler[v].arten[fa] || 0) + 1;
      }
      if (r.x) merkeTag(k, auf, auftrag.a.item);
      const lange = !heft && r.t > 120;
      const o = verbucheAntwort(app, zust, auftrag, { x: r.x, t: Math.min(r.t, 300), tAnz: r.tAnz, tBild, wn: !!r.wn, wFaktor: r.wFaktor, heft }, k);
      sichereAlltag(k);
      if ((o.angebot || (lange && !zust.angeboten)) && !zust.fertig) {
        zust.angeboten = true;
        const w = await dialog(k === 'insel' ? 'Bist du müde?' : 'Kurze Frage', h('p', null, 'Du hast heute schon gut gearbeitet. Möchtest du für heute bald aufhören?'), [{ text: 'Ja, bald aufhören', wert: true }, { text: 'Noch ein bisschen', wert: false, klasse: 'zweit' }]);
        if (w) zust.endeGewuenscht = true;
        sichere();
      }
      naechsteUebung(k);
    },
  });
  };
  if (heft) heftAufgabe(k, kopf, auf, stelle); else stelle();
}
function zeigeBeispiel(k, kopf, auftrag) {
  const node = auftrag.a.node, K = z().kinder[k];
  const it = node.items[Math.floor(node.items.length / 3)];
  const auf = it.a;
  zeige(kopf, h('div', { class: 'karte' }, h('h2', null, 'So geht es – ein Beispiel'), h('p', null, auf.text || ''), auf.frage ? h('p', { class: 'frage' }, auf.frage) : null,
    h('div', { class: 'rueck loesung' }, h('strong', null, 'Lösung: ' + loesungText(auf)), h('br'), erklaerungText(auf))),
    knopf('Verstanden ➜', () => { K.sitzung.zust.zeit += 45; K.sitzung.zust.bild = bildSek(K.sitzung.zust) + 45; sichere(); naechsteUebung(k); }, 'breit'));
  if (k === 'insel') sprich('Ein Beispiel. ' + (auf.text || '') + ' Die Lösung ist ' + loesungText(auf) + '. ' + erklaerungText(auf));
}
function sitzungEnde(k) {
  const K = z().kinder[k], S = K.sitzung, app = holeAlltag(k);
  if (!S.beendet && K.einstellungen.heft && !S.merkFertig) return merkSeite(k);
  if (!S.beendet) {
    const vorher = app.ereignisse.length;
    app.tagBeenden(S.tag);
    const neu = app.ereignisse.slice(vorher).filter(e => e.nach === 'sicher' || e.nach === 'gefestigt');
    for (const e of neu) K.belohnungen.push({ datum: heute(), art: e.nach, knoten: e.knoten });
    K.tagesMinuten[heute()] = (K.tagesMinuten[heute()] || 0) + sitzungsMinuten(S.start, Date.now(), S.papierMs || 0, bildSek(S.zust));
    K.verlauf.push({ datum: heute(), minuten: Math.round(S.zust.zeit / 60), aufgaben: S.gezeigt, richtig: S.richtig, neu: neu.length });
    if (K.extraSitzung === heute()) K.extraSitzung = null;
    S.beendet = true; S.zust.fertig = true;
    sichereAlltag(k);
  }
  void holeBank;
  const morgen = new Date(Date.now() + 864e5);
  const ruht = K.einstellungen.ruhetage.indexOf(morgen.getDay()) >= 0;
  const text = k === 'insel' ? `Toll gemacht! Für heute ist Schluss. ${ruht ? 'Morgen ist Ruhetag.' : 'Morgen wartet Funki mit neuen Aufgaben auf dich.'}` : `Für heute geschafft – du bist drangeblieben. ${ruht ? 'Morgen ist Ruhetag.' : 'Morgen geht es weiter.'}`;
  zeige(h('div', { class: 'welt', html: weltSvg(k, K.belohnungen.length) }), h('h1', { class: 'mitte' }, 'Für heute geschafft!'), h('p', { class: 'mitte' }, text),
    h('p', { class: 'leise mitte' }, 'Vorschau auf morgen: ' + vorschau(k)), knopf('Zur Startseite', () => zeigeStart(), 'breit zweit'));
  if (k === 'insel') sprich(text);
}
function vorschau(k) {
  const app = holeAlltag(k);
  const arbeit = app.knoten.filter(n => n.status === 'arbeit' && !n.tempo);
  if (!arbeit.length) return 'neue Aufgaben';
  const n = arbeit[0];
  const it = n.items[0];
  return it ? (holeBank().vorlagen.get(it.vorlage).titel || 'neue Aufgaben') : 'neue Aufgaben';
}

// ---------- Heft-Bausteine (Handschrift auf Papier; Uhr steht still, keine Belohnung) ----------
// Papier-Pause: Bildschirm zeigt nur Text + Knopf. Zeit zählt nicht zur Bildschirmzeit, Tempo oder Müdigkeit.
function papierPause(k, teile, knoepfe, mitHinweis = true) {
  const K = z().kinder[k], S = K.sitzung, t0 = Date.now();
  const hinweis = h('div', { class: 'rueck gut', style: 'display:none' }, 'Fertig genug – eine Skizze reicht.');
  const buche = () => { clearTimeout(uhr); const ms = Date.now() - t0; if (S) S.papierMs = (S.papierMs || 0) + ms; K.heft.papier[heute()] = (K.heft.papier[heute()] || 0) + Math.round(ms / 1000); sichere(); };
  const uhr = mitHinweis ? setTimeout(() => { if (!hinweis.isConnected) return; hinweis.style.display = ''; if (k === 'insel') sprich('Fertig genug. Eine Skizze reicht.'); }, (K.einstellungen.heftHinweisMin || 4) * 60000) : null;
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, '✏️ ' + HEFT_NAME[k]), knopf('Pause', () => { buche(); if (S && S.zust.fertig && !S.beendet) { S.merkFertig = true; sitzungEnde(k); } else zeigeKind(k); }, 'symbolknopf'));
  zeige(kopf, ...teile, hinweis, ...knoepfe.map(([text, wert, klasse]) => knopf(text, () => { buche(); wert(); }, 'breit ' + (klasse || ''), k === 'insel' ? { style: 'font-size:1.5em;min-height:84px' } : {})));
}
const figurWartet = (k) => h('p', { class: 'leise mitte' }, k === 'insel' ? 'Funki wartet, bis du fertig bist.' : 'Nova wartet geduldig.');
const istRechnung = (s) => /\d/.test(s) && /^[\d\s+−–·×:=?□().,]+$/.test(s);
function heftAufgabe(k, kopf, auf, weiter) {
  const text = [auf.text, auf.frage].filter(Boolean).join(' ');
  const auftrag = k === 'sternwarte' ? 'Zeichne das Balkenmodell und den Rechenweg ins Sternenbuch – eine schnelle Skizze reicht, wie ein Notizzettel.' : istRechnung(auf.frage || auf.text || '') ? 'Schreib die Rechnung ins Inselbuch.' : 'Schreib die Antwort ins Inselbuch.';
  papierPause(k, [h('div', { class: 'karte' }, h('p', null, auf.text || ''), auf.frage ? h('p', { class: 'frage' }, auf.frage) : null), h('p', null, h('strong', null, auftrag)), h('h2', { class: 'mitte' }, 'Ich schreibe ins Heft …'), figurWartet(k)], [['Fertig', weiter]]);
  if (k === 'insel') sprich(text + ' ' + auftrag + ' Tippe auf Fertig, wenn du fertig bist.');
}
// Merk-Sache des Tages merken (nur richtige Aufgaben)
function merkeTag(k, auf, item) {
  const S = z().kinder[k].sitzung; if (!S) return;
  const titel = (holeBank().vorlagen.get(item.vorlage) || {}).titel;
  if (k === 'sternwarte') { if (titel && item.skala !== 'GA') S.thema = titel; return; }
  const f = (auf.frage || auf.text || '').trim();
  if (item.skala === 'RE' && f && f.length <= 40 && istRechnung(f)) S.merkR = { art: 'rechnung', text: f, loesung: loesungText(auf) };
}
function merkSeite(k) {
  const K = z().kinder[k], S = K.sitzung;
  let merk;
  if (k === 'sternwarte') merk = { art: 'regel', text: S.thema || 'Was du heute gerechnet hast' };
  else merk = S.merkR || S.schreibWort || schreibAuftrag(holeAlltag(k));
  const fertig = (ok) => { S.merkFertig = true; if (ok) K.heft.merk = { datum: heute(), ...merk }; sichere(); sitzungEnde(k); };
  const anstoss = k === 'sternwarte' ? [h('p', null, 'Merk-Seite: Schreib die Regel von heute in deinen eigenen Worten ins Sternenbuch.'), h('div', { class: 'karte mitte' }, h('strong', null, 'Heute: ' + merk.text))]
    : [h('p', null, heftTexte(merk).anweisung), h('div', { class: 'karte mitte', style: 'font-size:2em' }, heftTexte(merk).zeigen)];
  papierPause(k, [...anstoss, h('h2', { class: 'mitte' }, 'Ich schreibe ins Heft …')], [['Geschrieben', () => fertig(true)], ['Heute nicht', () => fertig(false), 'zweit']], false);
  if (k === 'insel') sprich(heftTexte(merk).vorlesen + '. Tippe auf Geschrieben.');
}
// Vorspann am Sitzungsbeginn: erst Abruf aus dem Kopf, dann (einmal pro Woche) Wochenrückblick
function vorspann(k) {
  const K = z().kinder[k], S = K.sitzung, E = K.einstellungen;
  if (!E.heft || S.vorspannFertig) return naechsteUebung(k);
  const m = K.heft.merk;
  if (m && !m.abgefragt && m.datum !== heute()) return abrufAusDemKopf(k, m);
  const woche = wochenSchluessel();
  if (K.heft.rueckblickWoche !== woche && (K.heft.abrufe.length || Object.keys(K.heft.papier).length)) return wochenRueckblick(k, woche);
  S.vorspannFertig = true; sichere();
  naechsteUebung(k);
}
function abrufAusDemKopf(k, m) {
  const K = z().kinder[k];
  const kopf = h('div', { class: 'kopf' }, h('div', { class: 'titel' }, 'Aus dem Kopf'), knopf('Pause', () => zeigeKind(k), 'symbolknopf'));
  const frage = k === 'sternwarte' ? `Weißt du noch, was du letztes Mal ins Sternenbuch geschrieben hast? Thema: ${m.text}. Erkläre die Regel in deinen Worten – ohne ins Heft zu schauen.`
    : heftTexte(m).abrufFrage;
  const sichtbar = k === 'sternwarte' ? frage : heftTexte(m).abrufSichtbar;
  const feld = h('textarea', { rows: k === 'sternwarte' ? 3 : 1, 'aria-label': 'Deine Antwort (freiwillig)', style: 'width:100%;font-size:1.2em' });
  const pruefen = () => {
    const urteil = (u) => { K.heft.abrufe.push({ datum: heute(), urteil: u }); m.abgefragt = true; sichere(); vorspann(k); };
    zeige(kopf, h('h2', null, `Schau im ${HEFT_NAME[k]} nach – stimmt es?`), h('div', { class: 'unten' }, knopf('Ja', () => urteil('ja'), 'breit'), knopf('Fast', () => urteil('fast'), 'breit zweit'), knopf('Nein', () => urteil('nein'), 'breit zweit')));
    if (k === 'insel') sprich('Schau im Inselbuch nach. Stimmt es? Ja, fast oder nein?');
  };
  zeige(kopf, h('p', null, sichtbar), k === 'insel' ? h('button', { class: 'vorlesen', type: 'button', 'aria-label': 'Vorlesen', onclick: () => sprich(frage) }, '🔊') : null, feld, knopf('Weiter ➜', pruefen, 'breit'));
  if (k === 'insel') sprich(frage);
}
function wochenRueckblick(k, woche) {
  const K = z().kinder[k];
  const fertig = () => { K.heft.rueckblickWoche = woche; sichere(); vorspann(k); };
  papierPause(k, [h('h2', null, `Blättert zusammen im ${HEFT_NAME[k]}`), h('p', null, 'Am besten mit Mama oder Papa:'), h('ul', null, ...RUECKBLICK_FRAGEN.map(f => h('li', null, f)))], [['Gemacht', fertig]], false);
  if (k === 'insel') sprich('Blättert zusammen im Inselbuch. ' + RUECKBLICK_FRAGEN.join(' '));
}
// Schreibaufgabe im Insel-Profil (Lesetage): App liest vor, das Kind schreibt, dann Vergleich – zählt nicht in die Messung
function schreibAufgabe(k) {
  const K = z().kinder[k], S = K.sitzung;
  const w = schreibAuftrag(holeAlltag(k));
  const T = heftTexte(w), ansage = T.vorlesen;
  const zeigeLoesung = () => {
    const urteil = (ok) => { K.heft.schreib.n++; if (ok) K.heft.schreib.richtig++; S.schreibWort = { art: w.art, text: w.text }; sichere(); naechsteUebung(k); };
    zeige(h('h2', { class: 'mitte' }, T.vergleich), h('div', { class: 'karte mitte', style: 'font-size:3em' }, w.text),
      knopf('Richtig geschrieben ✓', () => urteil(true), 'breit', { style: 'font-size:1.4em;min-height:76px' }), knopf('Noch nicht ganz', () => urteil(false), 'breit zweit'));
    sprich(T.vergleich.replace(':', '.') + ' Hast du es richtig geschrieben?');
  };
  papierPause(k, [h('p', null, w.art === 'zahl' ? 'Hör gut zu und schreib die Zahl ins Inselbuch.' : 'Hör gut zu und schreib das Wort ins Inselbuch.'), h('button', { class: 'vorlesen', type: 'button', 'aria-label': 'Nochmal vorlesen', onclick: () => sprich(ansage) }, '🔊'), h('h2', { class: 'mitte' }, 'Ich schreibe ins Heft …'), figurWartet(k)], [['Fertig', zeigeLoesung]]);
  sprich(ansage + '. Tippe auf Fertig, wenn du fertig bist.');
}
