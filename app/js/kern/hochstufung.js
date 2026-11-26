// Lernalltag: hierarchisches Elo, Hoch-/Rueckstufung, Wiederholungsplan, Sprungpruefung, Kontrolltest.
// Schiedsspruch §2(b) und (c). Reine Logik ohne Node-Abhaengigkeit und ohne wahre Werte.
// Varianten: H1 (Sieger), H2 (reine Mastery), H3 (H1 ohne Kaltabruf), H4 (Elo ohne Hysterese).

import { sig, logit, pKorrekt, bFuerZiel, erzeugeGitter, logPrior, addiereAntwort, eap, istGeraten } from './modell.js';
const GITTER_KT = erzeugeGitter(-4.0, 9.0, 0.05);

export const H1 = {
  name: 'H1', regel: 'modell', kalt: true, kaltPruefStart: true, sprung: true,
  Kk0: 0.6, KkMin: 0.2, KB0: 0.4, KBmin: 0.15, Kg0: 0.5, KgMin: 0.2, trendK: 1.5, trendB: 2.0, trendSchwelle: 0.2, KF0: 0.3, festK: null,
  pSicher: 0.90, untere: 0.80, nMinSicher: 8, tageMinSicher: 2, nTempo: 15, alphaSicher: 0.8,
  rueckP: 0.70, rueckMinAntw: 6, rueckBestaetigung: true,
  sprungProbe: 4, sprungKalt: 3,
  gaVoraussetzung: 'stufe', // 'stufe' (Hauptlauf): Tempo-Knoten mit b <= b_typ - 1,0; 'alle' (wortwoertlich): alle 8; false: keine
  kontrollAbstand: 20, nachtestSchwelle: 1.0, volltestTag: 120,
  leiter: { insel: [1, 2, 4, 7, 14, 30], sternwarte: [1, 3, 7, 14, 30, 60] },
  festigenTage: { insel: 4, sternwarte: 7 },
  maxArbeit: 3,
  zentrieren: 1.0, gaEigen: true, // nach Phase-3-Lauf 1 uebernommen (Startfehler-Korrektur, Insel-Profil nicht blockiert)
};
// APP: Sieger H1 mit Lauf-2-Korrekturen (Trend auf x-P, trendSchwelle 0,2, zentrieren 1, GA eigen)
// Befund 4: Start-Front näher am Kind – Knoten mit P(unten) ≥ 0,80 gelten vorläufig als sicher (Kaltprüfung bestätigt)
export const H_APP = { ...H1, name: "H_APP", startVorlP: 0.80 };
export const HVARIANTEN = {
  H1,
  H2: { ...H1, name: 'H2', regel: 'mastery', kalt: false, kaltPruefStart: false, sprung: false },
  H3: { ...H1, name: 'H3', kalt: false, kaltPruefStart: false },
  H4: { ...H1, name: 'H4', regel: 'elo', kalt: false, kaltPruefStart: false, sprung: false, festK: 0.4, pSicher: 0.85, rueckP: 0.85, nMinSicher: 0, tageMinSicher: 0, nTempo: 0 },
};

export const TYP_BASIS = { sig: 'SA', ueb: 'SA', feh: 'SA', sort: 'SA', dar: 'RE', fach: 'RE' };
const SICHER = new Set(['sicher', 'gefestigt']);
const istSicherIsh = (k) => SICHER.has(k.status) || k.status === 'vorlaeufig';

export class Alltag {
  // bank: App-Sicht (pools, familien); test: Ergebnis des Einstiegstests; kind 'insel'|'sternwarte'
  constructor(cfg, kind, bank, test, rngU, opt = {}) {
    this.cfg = cfg; this.kind = kind; this.bank = bank; this.u = rngU;
    this.G = test.G || (kind === 'insel' ? 1.2 : 0.8);
    this.ereignisse = [];  // {tag, art, knoten}
    this.cHat = new Map(); this.nF = new Map(); this.famEingefroren = new Set(); this.famZuletzt = new Map();
    this.pOffset = 0;
    this.quoten = []; // {tag, quote}
    this.pauseRuecksetzTage = 0;
    this.letzterUebungstag = null;
    this.uebungstage = 0;
    this.kt = { M: null, L: null };
    this.nachtest = null;
    this.zaehler = { kontrolltests: 0, ktKorrekturen: 0, nachtests: 0, volltest: 0, sprungProben: 0, sprungErfolg: 0 };
    // Bereiche
    const sk = test.skalen;
    const mW = 1 / sk.RE.seGes ** 2, sW = 1 / sk.SA.seGes ** 2;
    const thM = (sk.RE.theta * mW + sk.SA.theta * sW) / (mW + sW);
    const seM = Math.sqrt(1 / (mW + sW));
    const lese = kind === 'insel' ? 'HV' : 'LV';
    this.bereiche = {
      M: this._bereich('M', thM + (opt.startVersatz || 0), seM, sk.RE.n + sk.SA.n),
      L: this._bereich('L', sk[lese].theta + (opt.startVersatz || 0), sk[lese].seGes, sk[lese].n),
    };
    if (cfg.gaEigen) this.bereiche.G = this._bereich('G', this.bereiche.M.theta, this.bereiche.M.seTest, this.bereiche.M.n);
    this.leseSkala = lese;
    // Knoten
    this.knoten = [];
    const mItems = [...bank.pools.RE, ...bank.pools.SA];
    // APP: nur Knoten (Halbjahres-Baender) anlegen, fuer die es Aufgaben gibt
    for (let k = 0; k < 17; k++) { const its = mItems.filter(i => i.knoten === k); if (its.length) this._neuerKnoten('M', k, -1.5 + 0.5 * k, false, its); }
    for (let k = 0; k < 17; k++) { const its = bank.pools[lese].filter(i => i.knoten === k); if (its.length) this._neuerKnoten('L', k, -1.5 + 0.5 * k, false, its); }
    for (let k = 0; k < 8; k++) this._neuerKnoten(cfg.gaEigen ? 'G' : 'M', k, null, true, bank.pools.GA.filter(i => i.knoten === k));
    this.transferPools = bank.tpools || { SA: bank.pools.SA, RE: bank.pools.RE }; // APP: nur transferfaehige Zwillinge
    // Transfer-Achse
    const g0 = test.tm ? test.tm.gamma : 0;
    this.gamma = {};
    for (const a of ['sig', 'ueb', 'feh', 'dar', 'fach', 'sort']) this.gamma[a] = { g: g0, n: test.tm ? test.tm.n : 0, nEff: test.tm ? test.tm.n : 0, last: 0, hist: {} };
    // Startstatus
    const alpha = test.gaAlpha || {};
    for (const k of this.knoten) {
      if (k.tempo) k.alpha = (alpha[k.k] != null ? alpha[k.k] : 0);
      const B = this.bereiche[k.bereich];
      const pUnten = sig(B.theta - B.seTest - k.btyp);
      if ((!k.tempo && pUnten >= (cfg.startVorlP || 0.90)) || (k.tempo && k.alpha >= 0.8)) {
        if (cfg.kaltPruefStart) { k.status = 'vorlaeufig'; k.kaltPruef = { gefragt: 0, falsch: 0, tage: new Set(), ziel: 2 }; }
        else { k.status = 'sicher'; k.rung = Math.min(2, this._leiter().length - 1); k.lastAbruf = 0; }
      }
    }
    this._freigeben(0, true);
  }

  _leiter() { return this.cfg.leiter[this.kind]; }

  _bereich(name, theta, se, n) {
    return { name, theta, seTest: se, nEff: n, n, last: 0, T: 0, info: [] /* [tag, info] */ };
  }
  _neuerKnoten(bereich, k, btypGegeben, tempo, items) {
    items.sort((a, b) => a.b - b.b);
    const bs = items.map(i => i.b).sort((a, b) => a - b);
    const btyp = bs[bs.length >> 1];
    const node = {
      id: this.knoten.length, bereich, k, tempo, btyp, items,
      status: 'gesperrt', thetaK: 0, n: 0, nEff: 0, last: null, T: 0, hist: [], tage: new Set(), letzte: [],
      rung: 0, lastAbruf: null, alpha: 0, seitAenderung: 0, tiefTage: new Set(), kaltPruef: null, sprungBest: null,
      kaltFalschFolge: 0, pruef: null, beispiel: false, extraNeu: 0, ersteAntw: [], sprungVersucht: -99, abrufFalschFolge: 0,
      letzteAntwortTag: null,
    };
    this.knoten.push(node);
    return node;
  }

  // Voraussetzungen: k-1 im selben Bereich/Typ; Mathe-Knoten mit b_typ >= 0,5 brauchen alle Tempo-Knoten
  _voraus(node) {
    const v = [];
    const gleich = this.knoten.filter(n => n.bereich === node.bereich && n.tempo === node.tempo);
    const vor = gleich.find(n => n.k === node.k - 1);
    if (vor) v.push(vor);
    const ga = this.cfg.gaVoraussetzung;
    // Befund 4: Die Grundaufgaben-Tempo-Stufen sperren nur Stoff OBERHALB des gemessenen Mathe-Niveaus. Vorher blieb ein
    // starkes Kind, das die Grundaufgaben richtig, aber noch nicht blitzschnell kann, weit unter seinem Niveau stecken.
    const ueberNiveau = !this.bereiche || !this.bereiche.M || node.btyp > this.bereiche.M.theta;
    if (ga && node.bereich === 'M' && !node.tempo && node.btyp >= 0.5 && ueberNiveau) v.push(...this.knoten.filter(n => n.tempo && (ga === 'alle' || n.btyp <= node.btyp - 1.0)));
    return v;
  }

  _freigeben(tag, start = false) {
    for (const grp of [['M', false], ['L', false], [this.cfg.gaEigen ? 'G' : 'M', true]]) {
      const nodes = this.knoten.filter(n => n.bereich === grp[0] && n.tempo === grp[1]).sort((a, b) => a.k - b.k);
      let arbeit = nodes.filter(n => n.status === 'arbeit').length;
      for (const n of nodes) {
        if (arbeit >= this.cfg.maxArbeit) break;
        if (n.status !== 'gesperrt') continue;
        if (!this._voraus(n).every(istSicherIsh)) continue;
        if (start) {
          const B = this.bereiche[n.bereich];
          if (!n.tempo && sig(B.theta - n.btyp) < 0.5) continue;
        }
        n.status = 'arbeit'; n.seitAenderung = 0; arbeit++;
        if (!start) {
          const sicherN = this.knoten.filter(x => x.bereich === n.bereich && x.tempo === n.tempo && x.sicherSeit != null).sort((a, b) => b.sicherSeit - a.sicherSeit).slice(0, 5);
          n.thetaK = sicherN.length ? sicherN.reduce((s, x) => s + x.thetaK, 0) / sicherN.length : 0;
        }
      }
      // Notfall: keine Arbeitsfront -> niedrigsten gesperrten freigeben
      if (start && arbeit === 0) {
        const n = nodes.find(x => x.status === 'gesperrt' && this._voraus(x).every(istSicherIsh)) || nodes.find(x => x.status === 'gesperrt');
        if (n) { n.status = 'arbeit'; }
      }
    }
  }

  // ---------- Hilfen ----------
  cF(fam) { return this.cHat.get(fam) || 0; }
  pTyp(node) { return sig(this.bereiche[node.bereich].theta + node.thetaK - node.btyp); }
  seK(node) {
    let s = 0;
    for (const h of node.hist) s += h.w * h.p * (1 - h.p);
    return s > 0 ? 1 / Math.sqrt(s) : this.seB(node.bereich, this.heute || 0);
  }
  seB(bereich, tag) {
    const B = this.bereiche[bereich];
    let s = 0;
    for (const [t, v] of B.info) if (tag - t < 28) s += v;
    s += (1 / (B.seTest * B.seTest)) * Math.max(0, 1 - tag / 56);
    return s > 0 ? 1 / Math.sqrt(s) : 2;
  }
  tRapid(item) {
    const t0 = this.kind === 'insel' ? item.t0Insel : item.t0Stern;
    return Math.max(this.kind === 'insel' ? 1.0 : 0.7, 0.1 * t0, this.G);
  }
  ziel(p) { return Math.min(0.97, Math.max(0.65, p + this.pOffset)); }

  // Aufgabe aus Knoten mit b + c_f am naechsten an Ziel (Wahrscheinlichkeit p) waehlen
  _itemAusKnoten(node, p, gesperrt, extraOff = 0) {
    const B = this.bereiche[node.bereich];
    const th = B.theta + node.thetaK + extraOff;
    let best = null, bd = Infinity;
    for (const it of node.items) {
      if (gesperrt.has(it.id)) continue;
      const ziel = bFuerZiel(th, p, it.c);
      const d = Math.abs(it.b + this.cF(it.fam) - ziel);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }
  _itemTypisch(node, gesperrt) {
    let best = null, bd = Infinity;
    for (const it of node.items) {
      if (gesperrt.has(it.id)) continue;
      const d = Math.abs(it.b - node.btyp) + (it.c > 0 ? 0.05 : 0);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  // ---------- Sitzungsbeginn / Tagesende ----------
  tagBeginnen(tag) {
    if (this.heute === tag && this.sitzung) { // APP: zweite Sitzung am selben Tag
      this.sitzung = { gesperrt: new Set(this.sitzung.gesperrt), warm: new Set(), antworten: [], sprungProbe: null, kalteHeute: new Set(this.sitzung.kalteHeute), ktItems: [], antwortenKnoten: this.sitzung.antwortenKnoten };
      return;
    }
    this.heute = tag;
    if (this.letzterUebungstag !== null && tag - this.letzterUebungstag >= 8) this.pauseRuecksetzTage = 3;
    this.uebungstage++;
    this.sitzung = { gesperrt: new Set(), warm: new Set(), antworten: [], sprungProbe: null, kalteHeute: new Set(), ktItems: [] };
    // Steuerung alle 5 Uebungstage
    if (this.uebungstage % 5 === 0) {
      const q = this.quoten.filter(x => tag - x.tag < 14);
      if (q.length >= 3) {
        const r = q.reduce((s, x) => s + x.r, 0) / q.reduce((s, x) => s + x.n, 0);
        if (r < 0.70) this.pOffset = Math.max(-0.10, this.pOffset - 0.05);
        else if (r > 0.88) this.pOffset = Math.min(0.05, this.pOffset + 0.05);
      }
    }
    // Sprungbestaetigungen mit abgelaufener Frist
    for (const n of this.knoten) {
      if (n.status === 'vorlaeufig' && n.sprungBest && tag > n.sprungBest.bis) this._status(n, 'arbeit', tag, 'sprungFrist');
    }
    // Kontrolltest planen
    for (const b of ['M', 'L']) {
      if (!this.kt[b] && this.uebungstage > 1 && this.uebungstage % this.cfg.kontrollAbstand === 0) {
        this.kt[b] = { rest: [3, 3, 2], erwartet: 8, antw: [], prior: this.bereiche[b].theta, art: 'kt' };
      }
      if (!this.kt[b] && this.cfg.volltestTag && tag >= this.cfg.volltestTag && !this['volltest' + b]) {
        this['volltest' + b] = true;
        this.kt[b] = { rest: [10, 10], erwartet: 20, antw: [], prior: this.volltestPrior ? this.volltestPrior(b, tag) : this.bereiche[b].theta, art: 'voll' };
      }
    }
  }

  // Kontrolltest-/Nachtest-Aufgaben fuer heute
  pruefAufgabenHeute() {
    const out = [];
    for (const b of ['M', 'L']) {
      const kt = this.kt[b];
      if (!kt || !kt.rest.length) continue;
      const k = kt.rest.shift();
      for (let i = 0; i < k; i++) out.push({ bereich: b, kt });
    }
    return out;
  }
  waehleKtAufgabe(b, kt) {
    const B = this.bereiche[b];
    let pool = b === 'M' ? [...this.bank.pools.RE, ...this.bank.pools.SA] : this.bank.pools[this.leseSkala];
    let th = kt.antw.length >= 3 ? eapKt(kt).mean : kt.prior;
    const ziel = kt.art === 'kt' ? th - logit(0.60) : th - logit(0.70);
    const anker = kt.antw.filter(a => a.item.anker).length;
    const wantAnker = anker < 2 && kt.antw.length >= 0;
    let best = null, bd = Infinity;
    for (const it of pool) {
      if (Math.abs(it.b - ziel) > 1.6) continue;
      if (this.sitzung.gesperrt.has(it.id) || kt.antw.some(a => a.item.id === it.id)) continue;
      const zuletzt = this.famZuletzt.get(it.fam);
      if (zuletzt != null && this.heute - zuletzt < 14) continue;
      let d = Math.abs(it.b + this.cF(it.fam) - bFuerZiel(th, kt.art === 'kt' ? 0.6 : 0.7, it.c));
      if (wantAnker && it.anker) d -= 0.3;
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }
  ktAntwort(b, kt, item, x, w) {
    kt.antw.push({ item, x, w, off: this.cF(item.fam) });
    this.sitzung.gesperrt.add(item.id);
    this.famZuletzt.set(item.fam, this.heute);
    if (!kt.rest.length && kt.antw.length >= kt.erwartet) this._ktAuswerten(b, kt);
  }
  _ktAuswerten(b, kt) {
    const B = this.bereiche[b];
    const e = eapKt(kt);
    const seB = this.seB(b, this.heute);
    const diff = Math.abs(e.mean - B.theta);
    this.zaehler.kontrolltests++;
    if (kt.art === 'nach') {
      B.theta = e.mean; B.nEff = 10; this.kt[b] = null; this.zaehler.nachtests++;
      return;
    }
    if (diff > Math.max((this.cfg.ktMin != null ? this.cfg.ktMin : 0.6), (this.cfg.ktFaktor != null ? this.cfg.ktFaktor : 2) * Math.sqrt(e.sd ** 2 + seB ** 2))) {
      B.theta = (B.theta / seB ** 2 + e.mean / e.sd ** 2) / (1 / seB ** 2 + 1 / e.sd ** 2);
      B.nEff = 10; this.zaehler.ktKorrekturen++;
    }
    if (diff > this.cfg.nachtestSchwelle && kt.art === 'kt') {
      this.kt[b] = { rest: [8, 8], erwartet: 16, antw: [], prior: B.theta, art: 'nach' };
      return;
    }
    this.kt[b] = null;
  }

  tagBeenden(tag) {
    // Quote
    const a = this.sitzung.antworten.filter(x => x.gewertet);
    if (a.length) this.quoten.push({ tag, r: a.filter(x => x.x).length, n: a.length });
    // Nachtest, wenn 10 Uebungstage in Folge ausserhalb 0,60-0,90
    const letzte = this.quoten.slice(-10);
    if (letzte.length === 10 && letzte.every(q => q.r / q.n < 0.6 || q.r / q.n > 0.9) && !this.kt.M) {
      this.kt.M = { rest: [8, 8], erwartet: 16, antw: [], prior: this.bereiche.M.theta, art: 'nach' };
      this.quoten.push({ tag, r: 0, n: 0, marker: true });
    }
    // Rueckstufung (Hysterese) am Tagesende
    for (const n of this.knoten) {
      if (!SICHER.has(n.status)) continue;
      const p = this.pTyp(n);
      if (this.cfg.regel === 'elo') { if (p < this.cfg.rueckP) this._status(n, 'arbeit', tag, 'rueck'); continue; }
      if (this.cfg.regel !== 'modell') continue;
      if (this.pauseRuecksetzTage > 0) continue;
      if (p < this.cfg.rueckP) n.tiefTage.add(tag);
      if (n.tiefTage.size >= 2 && n.seitAenderung >= this.cfg.rueckMinAntw) this._status(n, 'arbeit', tag, 'rueck');
    }
    if (this.pauseRuecksetzTage > 0) this.pauseRuecksetzTage--;
    // Option (nicht in der Spezifikation): Knotenversaetze zentrieren, damit ein Startfehler nicht in theta_k "versteckt" bleibt
    if (this.cfg.zentrieren) {
      for (const b of ['M', 'L']) {
        const ns = this.knoten.filter(n => n.bereich === b && !n.tempo && n.n >= 5);
        if (ns.length < 2) continue;
        const m = this.cfg.zentrieren * ns.reduce((s, n) => s + n.thetaK, 0) / ns.length;
        this.bereiche[b].theta += m;
        for (const n of this.knoten) if (n.bereich === b) n.thetaK -= m;
      }
    }
    this.letzterUebungstag = tag;
    this._freigeben(tag);
  }

  // ---------- Aufgabenwahl je Teil ----------
  // Rueckgabe: { item, node, teil, p, transfer?, beispiel? }
  waehleGrundlage() {
    const S = this.sitzung;
    const ga = this.knoten.filter(n => n.tempo);
    let kand = ga.filter(n => n.status === 'arbeit' && n.alpha < 0.8);
    if (!kand.length) kand = ga.filter(n => n.status === 'arbeit');
    if (!kand.length) kand = ga.filter(n => SICHER.has(n.status) || n.status === 'vorlaeufig');
    if (!kand.length) return null;
    S.gaRR = (S.gaRR || 0) + 1;
    const node = kand[S.gaRR % kand.length];
    const it = this._itemAusKnoten(node, this.ziel(0.90), S.gesperrt);
    return it ? { item: it, node, teil: 'grund', p: 0.9 } : null;
  }

  // Abruf: Pruefaufgaben, Sprungbestaetigung, Kaltpruefung, faellige Wiederholung
  waehleAbruf(bereichFilter) {
    const S = this.sitzung, tag = this.heute;
    const ok = (n) => !S.kalteHeute.has(n.id) && (!bereichFilter || bereichFilter.includes(n.bereich));
    let node = this.knoten.find(n => n.pruef && n.pruef.tag <= tag && n.pruef.rest > 0 && !(S.gesperrtKnoten && S.gesperrtKnoten.has(n.id)) && (!bereichFilter || bereichFilter.includes(n.bereich)));
    let art = 'pruef';
    if (!node) { node = this.knoten.find(n => n.status === 'vorlaeufig' && n.sprungBest && ok(n)); art = 'sprungBest'; }
    if (!node) { node = this.knoten.find(n => n.status === 'vorlaeufig' && n.kaltPruef && ok(n) && !n.kaltPruef.tage.has(tag)); art = 'kaltPruef'; }
    if (!node) {
      const L = this._leiter();
      const f = this.knoten.filter(n => SICHER.has(n.status) && ok(n) && n.lastAbruf != null && tag - n.lastAbruf >= L[n.rung]);
      f.sort((a, b) => (tag - b.lastAbruf - L[b.rung]) - (tag - a.lastAbruf - L[a.rung]));
      node = f[0]; art = 'faellig';
    }
    if (!node) return null;
    const it = this._itemTypisch(node, S.gesperrt);
    if (!it) return null;
    S.kalteHeute.add(node.id);
    if (art === 'pruef') { S.gesperrtKnoten = S.gesperrtKnoten || new Set(); }
    return { item: it, node, teil: 'abruf', p: null, abrufArt: art };
  }

  waehleNeu(bereich) {
    const S = this.sitzung;
    // laufende Sprungprobe
    if (S.sprungProbe && S.sprungProbe.bereich === bereich && S.sprungProbe.rest > 0) {
      const z = S.sprungProbe.ziel;
      const famsBenutzt = S.sprungProbe.fams;
      let it = null, bd = Infinity;
      for (const c of z.items) {
        if (S.gesperrt.has(c.id)) continue;
        let d = Math.abs(c.b - z.btyp) + (famsBenutzt.size < 2 && famsBenutzt.has(c.fam) ? 1 : 0);
        if (d < bd) { bd = d; it = c; }
      }
      if (it) return { item: it, node: z, teil: 'neu', p: null, sprung: true };
    }
    const nodes = this.knoten.filter(n => n.bereich === bereich && !n.tempo && (n.status === 'arbeit' || n.extraNeu > 0)).sort((a, b) => a.k - b.k);
    if (!nodes.length) return null;
    // Sprungpruefung ausloesen?
    if (this.cfg.sprung && !S.sprungProbe) {
      const B = this.bereiche[bereich];
      for (const n of nodes) {
        if (n.n === 0 && this._voraus(n).every(x => SICHER.has(x.status)) && this.pTyp(n) >= 0.9 && this.seB(bereich, this.heute) <= 0.40 && this.heute - n.sprungVersucht > 10) {
          const ziel = this._sprungZiel(n);
          if (ziel) { n.sprungVersucht = this.heute; this._starteProbe(n, ziel, bereich); return this.waehleNeu(bereich); }
        }
      }
    }
    // Knoten mit Zusatzuebung zuerst, dann neue (Loesungsbeispiel), dann reihum
    let node = nodes.find(n => n.extraNeu > 0);
    if (!node) {
      S.neuRR = S.neuRR || {};
      const i = (S.neuRR[bereich] = (S.neuRR[bereich] || 0) + 1);
      // geblockt: nach Loesungsbeispiel 2 Aufgaben im gleichen Knoten
      if (S.geblockt && S.geblockt.rest > 0 && S.geblockt.node.bereich === bereich) node = S.geblockt.node;
      else {
        // Befund 4: Nach dem Test liegen die untersten Arbeitsknoten oft weit unter dem Kind (P ≈ 0,93), dort
        // erreicht keine Aufgabe das Ziel 0,75. Darum reihum vor allem Knoten, in denen das Ziel erreichbar ist;
        // die leichten nur jede 4. Runde, damit sie trotzdem Antworten zum Hochstufen sammeln.
        const fordernd = nodes.filter(n => this.pTyp(n) < 0.85);
        const leicht = nodes.filter(n => this.pTyp(n) >= 0.85);
        const liste = fordernd.length && leicht.length ? (i % 4 === 0 ? leicht : fordernd) : nodes;
        node = liste[Math.floor((i - 1) / (liste === leicht ? 4 : 1)) % liste.length];
      }
    }
    if (!node.beispiel) {
      node.beispiel = true;
      S.warm.add(node.id);
      S.geblockt = { node, rest: 2 };
      return { item: null, node, teil: 'neu', beispiel: true };
    }
    if (S.geblockt && S.geblockt.node === node) S.geblockt.rest--;
    if (node.extraNeu > 0) node.extraNeu--;
    const it = this._itemAusKnoten(node, this.ziel(0.75), S.gesperrt);
    return it ? { item: it, node, teil: 'neu', p: 0.75 } : null;
  }

  _sprungZiel(n) {
    const gleich = this.knoten.filter(x => x.bereich === n.bereich && !x.tempo).sort((a, b) => a.k - b.k);
    const z = gleich.find(x => x.k === n.k + 2) || gleich.find(x => x.k === n.k + 1);
    return z || null;
  }
  _starteProbe(n, ziel, bereich) {
    this.sitzung.sprungProbe = { von: n, ziel, bereich, rest: this.cfg.sprungProbe, richtig: 0, fams: new Set() };
    this.zaehler.sprungProben++;
  }

  waehleTransfer(typWunsch, p) {
    const S = this.sitzung;
    const typen = this.kind === 'insel' ? ['ueb', 'dar', 'fach', 'sig', 'sort'] : ['sig', 'ueb', 'feh', 'dar', 'fach', 'sort'];
    let typ = typWunsch;
    if (!typ) {
      let best = null, bv = Infinity;
      for (const a of typen) {
        if (a === 'sort' && this.kind === 'sternwarte') continue; // Sternwarte: eigener Sortier-Teil
        const v = this._erreicht(a) * 1e6 + (this.gamma[a].lastUse || 0);
        if (v < bv) { bv = v; best = a; }
      }
      typ = best;
    }
    const G = this.gamma[typ];
    this.nutzZaehler = (this.nutzZaehler || 0) + 1;
    G.lastUse = this.nutzZaehler;
    const d = Math.min(6, Math.max(2, this._erreicht(typ) + 1));
    const B = this.bereiche.M;
    const mu = -0.2 * d;
    const ziel = Math.min(B.theta - logit(0.85), B.theta + G.g + mu - logit(this.ziel(p)));
    const pool = this.transferPools[TYP_BASIS[typ]];
    let best = null, bd = Infinity;
    let lo = 0, hi = pool.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (pool[m].b < ziel) lo = m + 1; else hi = m; }
    for (let i = Math.max(0, lo - 40); i < Math.min(pool.length, lo + 40); i++) {
      const it = pool[i];
      if (S.gesperrt.has(it.id)) continue;
      const dd = Math.abs(it.b + this.cF(it.fam) - ziel);
      if (dd < bd) { bd = dd; best = it; }
    }
    if (!best) return null;
    const node = this.knoten.find(n => n.bereich === 'M' && !n.tempo && n.k === best.knoten);
    return { item: best, node, teil: 'transfer', p, transfer: { typ, d, mu, c: typ === 'sort' ? 0.25 : null } };
  }
  _erreicht(typ) {
    const h = this.gamma[typ].hist;
    let r = 1;
    for (let d = 2; d <= 6; d++) { const l = h[d] || []; if (l.length >= 3 && l.slice(-4).filter(x => x).length >= 3) r = d; }
    return r;
  }

  // leicht = true (ab 3. Versuch, Befund 14): Aufgabe aus der untersten gesicherten Stufe, damit die Runde mit einem Erfolg endet
  waehleSchluss(bereich, p, leicht = false) {
    const S = this.sitzung;
    const nodes = this.knoten.filter(n => n.bereich === bereich && !n.tempo && (n.status === 'arbeit' || SICHER.has(n.status)));
    if (!nodes.length) return null;
    nodes.sort((a, b) => a.k - b.k);
    const gesichert = nodes.filter(n => SICHER.has(n.status));
    const node = leicht ? (gesichert.find(n => n.status === 'gefestigt') || gesichert[0] || nodes[0]) : (nodes.find(n => n.status === 'arbeit') || nodes[nodes.length - 1]);
    const it = this._itemAusKnoten(node, p, S.gesperrt);
    return it ? { item: it, node, teil: 'schluss', p } : null;
  }

  // App-Vorhersage fuer eine Aufgabe
  vorhersage(a) {
    const B = this.bereiche[a.node.bereich];
    let z = B.theta + a.node.thetaK - a.item.b - this.cF(a.item.fam);
    if (a.transfer) z += this.gamma[a.transfer.typ].g + a.transfer.mu;
    return pKorrekt(z, 0, a.transfer && a.transfer.c != null ? a.transfer.c : a.item.c);
  }

  // ---------- Antwort verbuchen ----------
  // r = { x, t, wn, muede (Signal aktiv) }
  verbuche(a, r) {
    const S = this.sitzung, tag = this.heute, cfg = this.cfg;
    if (a.beispiel) return;
    const node = a.node, B = this.bereiche[node.bereich];
    const item = a.item;
    S.gesperrt.add(item.id);
    this.famZuletzt.set(item.fam, tag);
    const geraten = istGeraten(r, this.tRapid(item));
    let w = 1;
    if (geraten) w = 0.25;
    if (r.wn) w = Math.min(w, 0.5);
    if (r.muede) w *= 0.5;
    if (r.wFaktor != null) w *= r.wFaktor; // APP: Hilfestufen des Balkenmodells
    const warm = S.warm.has(node.id);
    if (warm) w *= 0.5;
    const x = r.wn ? 0 : r.x;
    const P = this.vorhersage(a);
    const e = x - P;
    const kalt = !(S.antwortenKnoten && S.antwortenKnoten.has(node.id)) && node.letzteAntwortTag != null && node.letzteAntwortTag < tag;
    S.antwortenKnoten = S.antwortenKnoten || new Set(); S.antwortenKnoten.add(node.id);
    S.antworten.push({ x, gewertet: true, p: P, teil: a.teil, geraten, lnres: Math.log(r.t) - (Math.log(this.kind === 'insel' ? item.t0Insel : item.t0Stern) + 0.1 * (item.b - B.theta - node.thetaK)) });

    // Elo
    const pause = (last) => Math.max(0, tag - last - 1);
    const effN = (u) => Math.max(0, u.nEff - 1.33 * pause(u.last));
    node.nEff = effN(node); B.nEff = effN(B);
    // Trend = gleitender Mittelwert des Restfehlers e (nicht sign(e): das waere bei Trefferquote != 50 % verzerrt)
    node.T = 0.9 * node.T + 0.1 * e; B.T = 0.9 * B.T + 0.1 * e;
    let Kk, KB;
    if (cfg.festK != null) { Kk = cfg.festK; KB = cfg.festK; }
    else {
      Kk = Math.max(cfg.KkMin, cfg.Kk0 / (1 + 0.05 * node.nEff)) * (Math.abs(node.T) > cfg.trendSchwelle ? cfg.trendK : 1);
      KB = Math.max(cfg.KBmin, cfg.KB0 / (1 + 0.02 * B.nEff)) * (Math.abs(B.T) > cfg.trendSchwelle ? cfg.trendB : 1);
    }
    if (a.transfer) {
      const G = this.gamma[a.transfer.typ];
      G.nEff = Math.max(0, G.nEff - 1.33 * pause(G.last));
      const Kg = Math.max(cfg.KgMin, cfg.Kg0 / (1 + 0.05 * G.nEff));
      G.g += w * Kg * e; G.nEff += w; G.n++; G.last = tag;
      node.thetaK += 0.5 * w * Kk * e;
      (G.hist[a.transfer.d] = G.hist[a.transfer.d] || []).push(x);
    } else {
      node.thetaK += w * Kk * e;
      B.theta += w * KB * e;
    }
    node.nEff += w; B.nEff += w; node.last = tag; B.last = tag;
    if (!item.anker && !this.famEingefroren.has(item.fam)) {
      const nf = this.nF.get(item.fam) || 0;
      const KF = cfg.KF0 / (1 + 0.05 * nf);
      let c = this.cF(item.fam) - w * KF * e;
      if (Math.abs(c) > 1.0) { c = Math.sign(c) * 1.0; this.famEingefroren.add(item.fam); }
      this.cHat.set(item.fam, c); this.nF.set(item.fam, nf + 1);
    }
    // Information fuer SE_B
    const infoTag = B.info.length && B.info[B.info.length - 1][0] === tag ? B.info[B.info.length - 1] : (B.info.push([tag, 0]), B.info[B.info.length - 1]);
    if (!a.transfer) infoTag[1] += w * P * (1 - P);
    while (B.info.length && tag - B.info[0][0] >= 28) B.info.shift();

    node.letzteAntwortTag = tag;
    if (a.transfer) return { P, w, geraten, kalt };
    // Knotenstatistik (nur Wissensaufgaben)
    node.n++; node.seitAenderung++; node.tage.add(tag);
    node.hist.push({ w, p: P }); if (node.hist.length > 30) node.hist.shift();
    node.letzte.push({ x, fam: item.fam, kalt, warm, geraten }); if (node.letzte.length > 5) node.letzte.shift();
    if (node.ersteAntw.length < 5 && !a.transfer) node.ersteAntw.push({ x, p: this.pTyp(node) });
    if (node.tempo && !a.transfer) {
      const z = x && r.t <= this.G + (this.kind === 'insel' ? 2.0 : 1.5) ? 1 : 0;
      node.alpha = 0.85 * node.alpha + 0.15 * z;
    }

    // Statuslogik
    this._nachAntwort(node, a, x, kalt, tag);
    return { P, w, geraten, kalt };
  }

  _nachAntwort(node, a, x, kalt, tag) {
    const cfg = this.cfg, S = this.sitzung;
    // Sprungprobe
    if (a.sprung && S.sprungProbe) {
      const P = S.sprungProbe;
      P.rest--; P.fams.add(a.item.fam); if (x) P.richtig++;
      if (!x) { P.rest = 0; P.fertig = true; }
      else if (P.rest === 0 && P.richtig === cfg.sprungProbe && P.fams.size >= 2) {
        this.zaehler.sprungErfolg++;
        const gleich = this.knoten.filter(n => n.bereich === P.ziel.bereich && !n.tempo && n.k >= P.von.k && n.k <= P.ziel.k);
        for (const n of gleich) if (!SICHER.has(n.status)) {
          this._status(n, 'vorlaeufig', tag, 'sprung');
          n.sprungBest = { bis: tag + 7, richtig: 0, tage: new Set() }; n.kaltPruef = null;
        }
      }
      return;
    }
    if (a.teil === 'abruf' && a.abrufArt) {
      if (a.abrufArt === 'pruef' && node.pruef) {
        node.pruef.rest--; if (!x) node.pruef.falsch++;
        if (node.pruef.rest === 0) {
          if (node.pruef.falsch >= 1 && SICHER.has(node.status)) this._status(node, 'arbeit', tag, 'rueck');
          node.pruef = null;
        }
        return;
      }
      if (a.abrufArt === 'sprungBest' && node.sprungBest) {
        const sb = node.sprungBest;
        if (!x) { node.sprungBest = null; this._status(node, 'arbeit', tag, 'sprungFehl'); return; }
        sb.richtig++; sb.tage.add(tag);
        if (sb.richtig >= cfg.sprungKalt && sb.tage.size >= 2) { node.sprungBest = null; this._status(node, 'sicher', tag, 'sprungOk'); node.rung = 0; node.lastAbruf = tag; }
        return;
      }
      if (a.abrufArt === 'kaltPruef' && node.kaltPruef) {
        const kp = node.kaltPruef;
        kp.gefragt++; kp.tage.add(tag); if (!x) { kp.falsch++; if (kp.falsch === 1) kp.ziel = 4; }
        if (kp.falsch >= 2) { node.kaltPruef = null; this._status(node, 'arbeit', tag, 'kaltPruefFehl'); return; }
        if (kp.gefragt >= kp.ziel) { node.kaltPruef = null; this._status(node, 'sicher', tag, 'kaltPruefOk'); node.rung = Math.min(2, this._leiter().length - 1); node.lastAbruf = tag; }
        return;
      }
      if (a.abrufArt === 'faellig' && SICHER.has(node.status)) {
        const L = this._leiter();
        const delta = tag - (node.vorigeAntwortTag != null ? node.vorigeAntwortTag : node.lastAbruf != null ? node.lastAbruf : tag);
        if (x) {
          node.rung = Math.min(L.length - 1, node.rung + 1);
          node.kaltFalschFolge = 0; node.abrufFalschFolge = 0;
          if (node.status === 'sicher' && kalt && tag - (node.lastAbruf != null ? node.lastAbruf : tag) >= cfg.festigenTage[this.kind]) this._status(node, 'gefestigt', tag, 'festigen');
        } else {
          node.rung = Math.max(0, node.rung - 2); node.extraNeu += 2;
          node.kaltFalschFolge++; node.abrufFalschFolge++;
          if (cfg.regel === 'mastery' && node.abrufFalschFolge >= 2) { this._status(node, 'arbeit', tag, 'rueck'); node.abrufFalschFolge = 0; }
          if (cfg.regel === 'modell' && cfg.rueckBestaetigung && node.kaltFalschFolge >= 2 && !node.pruef && this.pauseRuecksetzTage === 0) {
            node.pruef = { tag: tag + 1, rest: 2, falsch: 0 }; node.kaltFalschFolge = 0;
          }
          if (cfg.regel === 'modell' && !cfg.rueckBestaetigung && node.kaltFalschFolge >= 2 && this.pauseRuecksetzTage === 0) {
            this._status(node, 'arbeit', tag, 'rueck'); node.kaltFalschFolge = 0;
          }
        }
        node.lastAbruf = tag;
        return;
      }
    }
    // Hochstufung pruefen
    if (node.status === 'arbeit') {
      if (this._hochstufbar(node)) {
        this._status(node, 'sicher', tag, 'hoch');
        node.rung = 0; node.lastAbruf = tag; node.sicherSeit = tag;
        this._freigeben(tag);
      } else if (cfg.sprung && !a.transfer && node.ersteAntw.length === 5 && !node.sprungB) {
        node.sprungB = true;
        const alle = node.ersteAntw.every(v => v.x);
        const pm = node.ersteAntw.reduce((s, v) => s + v.p, 0) / 5;
        if (alle && pm < 0.75 && !node.tempo && !S.sprungProbe) {
          const ziel = this._sprungZiel(node);
          if (ziel) this._starteProbe(node, ziel, node.bereich);
        }
      }
    } else if (SICHER.has(node.status) && cfg.regel === 'elo' && this.pTyp(node) < cfg.rueckP) {
      this._status(node, 'arbeit', tag, 'rueck');
    }
  }

  _hochstufbar(node) {
    const cfg = this.cfg;
    const L = node.letzte.slice(-3);
    if (node.tempo && node.alpha < cfg.alphaSicher) return false;
    if (cfg.regel === 'mastery') {
      return L.length === 3 && L.every(v => v.x && !v.geraten) && new Set(L.map(v => v.fam)).size >= 2;
    }
    const P = this.pTyp(node);
    if (cfg.regel === 'elo') return P >= cfg.pSicher;
    if (P < cfg.pSicher) return false;
    if (cfg.untere > 0) {
      const B = this.bereiche[node.bereich];
      if (sig(B.theta + node.thetaK - this.seK(node) - node.btyp) < cfg.untere) return false;
    }
    if (L.length < 3 || !L.every(v => v.x && !v.warm)) return false;
    if (new Set(L.map(v => v.fam)).size < 2) return false;
    if (cfg.kalt && !L.some(v => v.kalt)) return false;
    if (node.n < cfg.nMinSicher || node.tage.size < cfg.tageMinSicher) return false;
    if (node.tempo && node.n < cfg.nTempo) return false;
    return true;
  }

  _status(node, neu, tag, grund) {
    const alt = node.status;
    if (alt === neu) return;
    node.status = neu; node.seitAenderung = 0; node.tiefTage = new Set();
    if (neu === 'arbeit') { node.kaltPruef = null; node.sprungBest = null; node.letzte = []; }
    this.ereignisse.push({ tag, knoten: node.id, von: alt, nach: neu, grund });
  }
}

function eapKt(kt) {
  const l = logPrior(GITTER_KT, kt.prior, 2.0);
  for (const a of kt.antw) addiereAntwort(l, GITTER_KT, a.item.b + a.off, a.item.c, a.x, a.w);
  return eap(l, GITTER_KT);
}
