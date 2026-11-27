// Zeigt eine Aufgabe an und liefert die Antwort. modus: 'test' (keine Rückmeldung) oder 'ueben'
// (erst Hinweis, dann Lösung mit kurzer Erklärung). Die Zeit läuft ab dem Ende des Vorlesens.
import { h, knopf, dialog } from './ui.js';
import { sprich, stopp, fuerStimme } from './sprache.js';
import { istRichtig } from './ablauf.js';
import { balkenModell, nackt } from './inhalte/schema.js';
import { zf } from './inhalte/werkzeug.js';
import { ES_FEHLT_NICHTS } from './inhalte/transfer.js';
import { antwortZeit } from './kern/modell.js';

// Lob: kurz und kindgerecht; nach einem Fehlversuch wird das Dranbleiben gelobt
const LOB = {
  insel: ['Super, das stimmt!', 'Ja, richtig!', 'Toll gemacht!', 'Prima, genau so!', 'Juhu, richtig!'],
  sternwarte: ['Richtig!', 'Stimmt genau.', 'Gut gemacht!', 'Ja, passt!', 'Richtig – gut überlegt.'],
  nochmal: ['Jetzt stimmt es – gut, dass du es nochmal versucht hast!', 'Richtig! Dranbleiben hat sich gelohnt.'],
  feier: {
    insel: ['WUHUUU! Das war vorher schwer – und jetzt kannst du es! 💪', 'YEAH! Mega! Genau das hat letztes Mal noch nicht geklappt!', 'Wahnsinn! Du hast es geknackt! Funki macht einen Freudensprung!', 'JAAA! Richtig stark – das hast du dir erkämpft!'],
    sternwarte: ['YES! Das hat vorher Probleme gemacht – jetzt sitzt es! 🔥', 'Mega! Genau diese Art Aufgabe hast du jetzt drauf!', 'Boom! Geknackt! Das war echt stark.', 'Wuhu! Dranbleiben zahlt sich aus – das ist jetzt deins!'],
  },
};

export function zeigeAufgabe(ziel, auf, opt) {
  // opt: { kind, modus, fertig(ergebnis), wnErlaubt }
  const kind = opt.kind;
  const istHV = auf.skala === 'HV';
  const sprechText = auf.sprache ? auf.sprech : baueSprechtext(auf); // Englisch: nur der englische Sprechtext, englische Stimme
  let start = null, versuche = 0, hilfe = 0, ersteRichtig = null, beendet = false, eingabeFehlt = null;
  const angezeigt = Date.now(); let tAnzMerk = null;
  let lauf = 0; // Befund 17: erneutes Vorlesen hält die Zeit an, bis es zu Ende ist
  const nach = (g) => () => { if (g === lauf && start === null) start = Date.now(); };
  const nachVorlesen = nach(0);
  const nochmal = () => { if (beendet) return; lauf++; if (versuche === 0) start = null; sprich(sprechText, nach(lauf), auf.sprache); };
  const nochmalKnopf = () => h('button', { class: 'vorlesen', type: 'button', 'aria-label': 'Vorlesen', onclick: nochmal }, '🔊');
  const sek = () => antwortZeit(angezeigt, start, Date.now());

  const kopf = h('div', { class: 'zeile', style: 'justify-content:flex-end' });
  const inhalt = h('div', { class: 'aufgabe' });
  const rueck = h('div');
  const bereich = h('div');

  // Text
  if (istHV) {
    inhalt.appendChild(h('p', { class: 'leise' }, 'Hör gut zu.'));
    inhalt.appendChild(knopf('🔊 Noch einmal hören', nochmal, 'zweit'));
    if (auf.bild) inhalt.appendChild(bild(auf.bild, auf));
    if (auf.tabelle) inhalt.appendChild(tabelle(auf.tabelle));
  } else {
    if (auf.textBild) inhalt.appendChild(h('div', { class: 'textbild', 'aria-hidden': 'true' }, auf.text));
    else if (auf.text) { let t = auf.text; if (auf.frage && t !== auf.frage && t.slice(-auf.frage.length) === auf.frage) t = t.slice(0, -auf.frage.length).trim(); inhalt.appendChild(h('div', { class: 'text' + (auf.skala === 'LV' ? ' lesetext' : '') }, t)); }
    if (auf.liste) inhalt.appendChild(h('ul', { class: 'liste' }, auf.liste.map(s => h('li', null, s))));
    if (auf.tabelle) inhalt.appendChild(tabelle(auf.tabelle));
    if (auf.bild) inhalt.appendChild(bild(auf.bild, auf));
    if (auf.unterschrift) inhalt.appendChild(h('p', { class: 'leise' }, auf.unterschrift));
  }
  if (auf.frage && !(istHV && auf.hvFrage)) inhalt.appendChild(h('div', { class: 'frage' }, auf.frage));
  if (istHV && auf.hvFrage) inhalt.appendChild(h('div', { class: 'frage' }, auf.frage || ''));
  if (opt.kind === 'sternwarte' && (auf.vorlesen === 'aufWunsch' || (auf.vorlesen === 'alles' && !istHV))) kopf.appendChild(nochmalKnopf());
  if (opt.kind === 'insel' && !istHV) kopf.appendChild(nochmalKnopf());

  // Balkenmodell (Sachaufgaben)
  let balken = null;
  const st = auf.struktur;
  if (opt.modus === 'ueben' && !auf.fehlt && auf.balken && st && st.schema && !(auf.bild && auf.bild.typ === 'balken') && auf.art !== 'wahl') {
    const zw = auf.zwilling || nackt({ schema: st.schema, w: st.w, unb: st.unb });
    balken = balkenHilfe(balkenModell(st, { name: st.P || 'A' }, { name: st.Q || 'B' }), Object.assign({}, auf, { zwilling: zw }), opt.modus === 'ueben', (stufe) => { hilfe = stufe; });
  }

  // Eingabe
  let leseEingabe = () => null;
  const eingabe = h('div');
  if (auf.art === 'wahl') {
    const bildWahl = auf.bildWahl;
    const kurz = auf.wahl.every(w => String(w).length <= 6);
    const box = h('div', { class: 'wahl' + (bildWahl ? ' bilder' : kurz && auf.wahl.length <= 4 ? ' zwei kurz' : '') });
    auf.wahl.forEach((w, i) => box.appendChild(knopf(String(w), () => abgeben({ wahl: i }, box.children[i]))));
    if (auf.elternTaste) eingabe.appendChild(h('p', { class: 'leise' }, 'Erwachsene tippen, wie gut es geklappt hat:'));
    eingabe.appendChild(box);
  } else if (auf.art === 'zahl') {
    const inp = h('input', { class: 'zahl', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Antwort' });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
    const ok = () => { if (inp.value.trim()) abgeben({ text: inp.value }); };
    eingabe.appendChild(h('div', { class: 'eingabe' }, inp, auf.einheit ? h('span', null, auf.einheit) : null, knopf('Fertig', ok)));
    leseEingabe = () => inp;
  } else if (auf.art === 'wort') {
    // Diktat: Autokorrektur und Rechtschreibprüfung des Geräts aus, sonst würde das Gerät die Schreibung verbessern
    const inp = h('input', { class: 'wort', type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Wort' });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
    const ok = () => { if (inp.value.trim()) abgeben({ text: inp.value }); };
    eingabe.appendChild(h('div', { class: 'eingabe' }, inp, knopf('Fertig', ok)));
    leseEingabe = () => inp;
  } else if (auf.art === 'zahlen') {
    const felder = auf.felder.map(f => h('input', { class: 'zahl', inputmode: 'decimal', 'aria-label': f }));
    const ok = () => { if (felder.every(f => f.value.trim())) abgeben({ felder: felder.map(f => f.value) }); };
    eingabe.appendChild(h('div', { class: 'eingabe' }, ...auf.felder.map((f, i) => h('label', null, f, h('br'), felder[i])), knopf('Fertig', ok)));
    leseEingabe = () => felder[0];
  } else if (auf.art === 'bruch') {
    const zz = h('input', { inputmode: 'numeric', 'aria-label': 'Zähler' }), nn = h('input', { inputmode: 'numeric', 'aria-label': 'Nenner' });
    const ok = () => { if (zz.value.trim() && nn.value.trim()) abgeben({ z: zz.value, n: nn.value }); };
    eingabe.appendChild(h('div', { class: 'eingabe' }, h('div', { class: 'bruchein' }, zz, h('div', { class: 'strich' }), nn), knopf('Fertig', ok)));
    leseEingabe = () => zz;
  }
  // „Geht nicht – es fehlt …" (bei allen Geschichten-Aufgaben wählbar, nicht bei reinen Rechnungen – Befund 13)
  const unten = h('div', { class: 'unten' });
  const geschichte = ((auf.text || '') + ' ' + (auf.frage || '')).split(/\s+/).filter(w => /[a-zäöüß]{2,}/i.test(w)).length >= 5;
  if (auf.fehlt || auf.kannFehlen || (auf.struktur && auf.art === 'zahl' && geschichte)) {
    unten.appendChild(knopf('Geht nicht – es fehlt …', async () => {
      if (auf.fehlt) {
        const w = await dialog('Was fehlt?', h('p', null, 'Welche Angabe brauchst du noch?'), auf.fehlt.wahl.map(x => ({ text: x === ES_FEHLT_NICHTS ? x : 'Es fehlt, ' + x + '.', wert: x })).concat([{ text: 'Zurück', wert: null, klasse: 'leise' }]));
        if (w === null) return;
        if (w === ES_FEHLT_NICHTS) { eingabeFehlt = null; return; }
        abgeben({ fehlt: w });
      } else {
        const w = await dialog('Fehlt wirklich etwas?', h('p', null, 'Kannst du die Frage mit den Angaben nicht beantworten?'), [{ text: 'Ja, es fehlt etwas', wert: true }, { text: 'Nein, ich rechne', wert: false, klasse: 'zweit' }]);
        if (w) abgeben({ fehlt: 'etwas' });
      }
    }, 'zweit'));
  }
  if (opt.wnErlaubt !== false) unten.appendChild(knopf('Weiß ich noch nicht', () => abgeben({ wn: true }), 'leise'));

  ziel.innerHTML = '';
  ziel.appendChild(h('div', { class: 'karte' }, kopf, inhalt, balken, eingabe, unten, rueck, bereich));
  // Vorlesen
  const lesen = (auf.vorlesen === 'alles') || istHV;
  if (lesen) sprich(sprechText, nachVorlesen, auf.sprache); else nachVorlesen();
  const f = leseEingabe(); if (f && !lesen) setTimeout(() => { try { f.focus(); } catch (e) { /* */ } }, 50);

  function abgeben(e, knopfEl) {
    if (beendet) return;
    stopp();
    const z = sek(), t = z.t; tAnzMerk = z.tAnz;
    if (e.wn) return fertig({ x: 0, t, wn: true, ersteRichtig: false });
    const richtig = istRichtig(auf, e);
    versuche++;
    if (ersteRichtig === null) ersteRichtig = richtig;
    if (opt.modus === 'test') return fertig({ x: richtig ? 1 : 0, t, eingabe: e });
    // Übung: Rückmeldung
    if (knopfEl) { for (const b of knopfEl.parentNode.children) b.classList.remove('gewaehlt', 'falsch'); knopfEl.classList.add(richtig ? 'richtig' : 'falsch'); }
    rueck.innerHTML = '';
    if (richtig) {
      // Durchbruch: Aufgabenart, die vorher Probleme gemacht hat, jetzt beim ersten Versuch geschafft → Extra-Jubel
      const feier = versuche === 1 && opt.durchbruch ? opt.durchbruch() : false;
      const liste = feier ? LOB.feier[kind === 'insel' ? 'insel' : 'sternwarte'] : versuche > 1 ? LOB.nochmal : (LOB[kind] || LOB.sternwarte);
      const lob = liste[Math.floor(Math.random() * liste.length)];
      rueck.appendChild(feier ? h('div', { class: 'rueck gut feier' }, h('div', { class: 'feier-bild' }, kind === 'insel' ? '🎉🌟🎉' : '🚀✨🚀'), lob) : h('div', { class: 'rueck gut' }, lob));
      if (kind === 'insel') sprich(lob);
      return weiterKnopf({ x: ersteRichtig ? 1 : 0, t, eingabe: e });
    }
    if (versuche === 1) {
      const hinw = (e.fehlt && !auf.fehlt) ? 'Hier fehlt nichts – alle nötigen Zahlen stehen da. Schau noch einmal genau.' : (auf.fehlt && !e.fehlt) ? 'Kannst du das wirklich ausrechnen? Prüfe, ob eine Angabe fehlt.' : (auf.hinweis || 'Schau noch einmal genau hin.');
      rueck.appendChild(h('div', { class: 'rueck hinweis' }, '💡 ', hinw));
      if (kind === 'insel') sprich(hinw);
      if (balken && balken.mehr) balken.mehr();
      const f2 = leseEingabe(); if (f2) { f2.value = ''; f2.focus(); }
      return;
    }
    // zweiter Fehler: Lösung zeigen
    rueck.appendChild(h('div', { class: 'rueck loesung' }, h('strong', null, 'Lösung: ' + loesungText(auf)), h('br'), erklaerungText(auf)));
    if (kind === 'insel') sprich('Die Lösung ist ' + loesungText(auf) + '. ' + erklaerungText(auf));
    for (const b of eingabe.querySelectorAll('button, input')) b.disabled = true;
    weiterKnopf({ x: 0, t, eingabe: e });
  }
  function weiterKnopf(erg) {
    beendet = true;
    for (const b of eingabe.querySelectorAll('button, input')) b.disabled = true;
    for (const b of unten.querySelectorAll('button')) b.disabled = true;
    bereich.appendChild(h('div', { class: 'unten', style: 'justify-content:flex-end' }, knopf('Weiter ➜', () => fertig(erg, true))));
  }
  function fertig(erg, schonBeendet) {
    if (beendet && !schonBeendet) return;
    beendet = true; stopp();
    if (tAnzMerk != null) erg.tAnz = tAnzMerk;
    erg.hilfe = hilfe; erg.wFaktor = hilfe >= 3 ? 0.25 : hilfe >= 1 ? 0.5 : 1;
    erg.versuche = versuche;
    opt.fertig(erg);
  }
}

// Kurze Erklärung; bei Lesefragen ohne eigene Erklärung die passende Textstelle (Befund 11)
export function erklaerungText(auf) {
  if (auf.erklaerung) return auf.erklaerung;
  if (!(auf.skala === 'LV' || auf.skala === 'HV') || !auf.text) return '';
  const loes = loesungText(auf);
  if (/nicht im Text/i.test(loes)) return 'Im Text steht dazu nichts.';
  let t = auf.text; if (auf.frage && t.endsWith(auf.frage)) t = t.slice(0, -auf.frage.length);
  const saetze = (t.match(/[^.!?]+[.!?]*/g) || []).map(x => x.trim()).filter(Boolean); // ohne Lookbehind (ältere Geräte)
  const woerter = loes.toLowerCase().split(/[^a-zäöüß0-9]+/).filter(w => w.length > 2);
  let best = null, bestN = 0;
  for (const sz of saetze) { const l = sz.toLowerCase(); const n = woerter.filter(w => l.includes(w)).length; if (n > bestN) { best = sz; bestN = n; } }
  return best && saetze.length > 1 ? 'Im Text steht: „' + best + '“' : '';
}
export function loesungText(auf) {
  if (auf.fehlt) return 'Es fehlt, ' + auf.fehlt.richtig + '.';
  if (auf.art === 'wahl') return String(auf.wahl[auf.antwort]);
  if (auf.art === 'zahlen') return auf.felder.map((f, i) => `${f}: ${zf(auf.antwort[i])}`).join(', ');
  if (auf.art === 'bruch') return `${auf.antwort.z}/${auf.antwort.n}`;
  return zf(auf.antwort) + (auf.einheit ? ' ' + auf.einheit : '');
}
function baueSprechtext(auf) {
  const teile = [];
  if (auf.skala === 'HV' && auf.hvFrage) return (auf.text && !auf.textBild && !/Hör gut zu/.test(auf.hvFrage) ? auf.text + ' ' : '') + auf.hvFrage + ' ' + (auf.wahl && !auf.bildWahl ? 'Die Antworten: ' + auf.wahl.join('. ') : '');
  if (auf.sprech) teile.push(auf.sprech);
  else if (auf.text && !auf.textBild) teile.push(auf.text);
  if (auf.liste) teile.push(auf.liste.join(' '));
  if (auf.tabelle && auf.skala === 'HV') teile.push(auf.tabelle.zeilen.map(z => z.join(', ')).join('. '));
  if (auf.frage && !(auf.text && !auf.sprech && auf.text.slice(-auf.frage.length) === auf.frage)) teile.push(auf.frage);
  if (auf.wahl && !auf.bildWahl && (auf.skala === 'HV' || !auf.wahlLang)) teile.push(auf.wahl.join('. '));
  return fuerStimme(teile.join(' '));
}

// ---------- Bilder ----------
function bild(b, auf) {
  if (b.typ === 'punkte') {
    const box = h('div', { class: 'punktbild', role: 'img', 'aria-label': b.n + ' Punkte' });
    for (let i = 0; i < b.n; i++) { box.appendChild(h('span')); if (i % 5 === 4 && i < b.n - 1) box.appendChild(h('span', { class: 'luecke' })); }
    return box;
  }
  if (b.typ === 'bruch') {
    const w = 300, hh = 60, sw = w / b.n;
    let s = `<svg viewBox="0 0 ${w + 4} ${hh + 4}" width="100%" style="max-width:340px" role="img" aria-label="Bruchbild">`;
    for (let i = 0; i < b.n; i++) s += `<rect x="${2 + i * sw}" y="2" width="${sw}" height="${hh}" fill="${i < b.z ? '#f2a33a' : '#fff'}" stroke="#333" stroke-width="2"/>`;
    return h('div', { class: 'mitte', html: s + '</svg>' });
  }
  if (b.typ === 'emoji') return h('div', { class: 'emojibild', role: 'img' }, ...b.zeilen.map(z => h('div', null, z)));
  if (b.typ === 'balken') return balkenZeichnen(b.modell, 5, null, b.zahlwort);
  return null;
}
function tabelle(t) {
  return h('div', { class: 'tabhuelle' }, h('table', { class: 'tabelle' }, h('thead', null, h('tr', null, t.kopf.map(k => h('th', null, k)))), h('tbody', null, t.zeilen.map(z => h('tr', null, z.map(c => h('td', null, c)))))));
}

// ---------- Balkenmodell ----------
// stufe 0..5: 1 Rahmen mit Namen, 2 Teile, 3 bekannte Zahlen, 4 Fragezeichen markiert, 5 Rechnung als Tipp
export function balkenZeichnen(m, stufe, eingabeErlaubt, zahlwort) {
  const alle = []; for (const z of m.zeilen) for (const s of z.segs) alle.push(s.wert);
  const zeilenSumme = m.zeilen.map(z => z.segs.reduce((a, s) => a + s.wert, 0));
  const max = Math.max.apply(null, zeilenSumme);
  const box = h('div', { class: 'balken' });
  for (const z of m.zeilen) {
    const reihe = h('div', { class: 'reihe' }, h('div', { class: 'name' }, stufe >= 1 ? z.name : ''));
    const segs = stufe >= 2 ? z.segs : [{ key: '_', wert: z.segs.reduce((a, s) => a + s.wert, 0), leer: true }];
    for (const s of segs) {
      const breite = Math.max(8, 100 * s.wert / max * 0.85);
      const istUnb = s.key === m.unb;
      const zeigWert = stufe >= 3 && !istUnb && s.key !== '_' && !(s.leer && s.key !== m.unb && stufe < 4);
      let inhalt = '';
      if (istUnb && stufe >= 2) inhalt = stufe >= 4 ? '?' : '';
      else if (zeigWert) inhalt = zf(s.wert);
      const cls = 'teil' + (istUnb && stufe >= 4 ? ' frage' : '') + (!inhalt && !eingabeErlaubt ? ' leer' : '');
      const seg = h('div', { class: cls, style: `width:${breite}%` + (s.markiert === false ? ';background:#fff' : '') });
      if (!inhalt && eingabeErlaubt && stufe >= 2 && !istUnb) seg.appendChild(h('input', { inputmode: 'decimal', 'aria-label': 'Zahl im Balken' }));
      else seg.textContent = inhalt || (stufe < 2 ? '' : ' ');
      reihe.appendChild(seg);
    }
    if (z.anzahl && stufe >= 2) reihe.appendChild(h('div', { class: 'leise', style: 'align-self:center;padding-left:6px' }, stufe >= 3 ? `${z.anzahl}×` : '…'));
    box.appendChild(reihe);
    if (z.summe && stufe >= 3) box.appendChild(h('div', { class: 'klammer' }, z.summe.key === m.unb ? 'gefärbt: ?' : 'gefärbt: ' + zf(z.summe.wert)));
  }
  void zahlwort;
  return box;
}
function balkenHilfe(modell, auf, aktiv, meldeStufe) {
  let stufe = 0;
  const flaeche = h('div');
  const knopfH = knopf('📊 Balken-Hilfe', () => mehr(), 'zweit');
  const info = h('span', { class: 'leise' });
  const TIPPS = ['', 'Zeichne die Geschichte als Balken. Welche Balken gibt es?', 'So sind die Balken aufgeteilt.', 'Das sind die bekannten Zahlen.', 'Das Fragezeichen ist gesucht.', 'Die Rechnung dazu: ' + (auf.zwilling || '')];
  function mehr() {
    if (stufe >= 5) return;
    stufe++; meldeStufe(stufe);
    flaeche.innerHTML = '';
    flaeche.appendChild(balkenZeichnen(modell, stufe, true));
    info.textContent = TIPPS[stufe];
    if (stufe >= 5 || (stufe >= 4 && !auf.zwilling)) knopfH.disabled = true;
  }
  const box = h('div', null, h('div', { class: 'hilfeleiste' }, knopfH, info), flaeche);
  box.mehr = () => { if (aktiv && stufe < 2) mehr(); };
  return box;
}
