// Einstiegstest (Schiedsspruch §2a) als reine Zustandsmaschine.
// Keine Node-Abhaengigkeit, keine wahren Werte: die App ruft tagBeginnen() -> naechste() -> antwort() ... auf.
// Varianten T1 (Sieger), T1w, T2 (klassischer CAT), T3 (Spielvariante C), T4 (ohne leichte), T5 (ohne SE_fam).

import { GITTER_THETA, GITTER_GAMMA, logPrior, addiereAntwort, eap, mlMitZaun, information, bFuerZiel, pKorrekt, sig, logit, istGeraten } from './modell.js';
import { lsZuTheta, bereichVonSkala } from './skala.js';

export const T1 = {
  name: 'T1',
  leiter: true, leiterS0: 1.0, leiterWechsel: 2, leiterN: 6, gipfelMax: 12,
  startVersatzLS: -5,
  zielP: 0.70, kontrollJede: 5, kontrollP: 0.90, schluss: true, schlussP: 0.95,
  seStop: 0.55, seFam: true, sigmaF: 0.5, sigmaFAnker: 0.2,
  nMin: 10, nMax: 24, nachblock: 8, tageMin: 2,
  zaun: true, zaunTol: 0.5, zaunExtra: 4,
  sprungMax: 1.0, randomesque: 3, famRegeln: true, famMaxAnteil: 0.25,
  priorSD: 2.0,
  rateF: { insel: 1.0, sternwarte: 0.7 }, rateT0: 0.10, rte: 0.90,
  muedeD6: -0.25, muedeZeit: Math.log(1.3),
  tagesprobe: true, tf: 0.35, blockvergleich: true,
  tmModus: 'eingestreut', muD: -0.2, seGammaStop: 0.45, gammaNmin: 10, gammaNmax: 20, tmR: 8,
  deutlich: 2, hinweis: 1,
  maxTage: { insel: 7, sternwarte: 6 }, kappeSkala: { insel: 8, sternwarte: 12 }, kappeBlock: { insel: 15, sternwarte: 24 },
  zusatzGroesse: { insel: 6, sternwarte: 8 }, zusatzMax: 2,
  versatzN: { insel: 8, sternwarte: 6 },
  wetter: false,
};

export const VARIANTEN = {
  T1,
  T1w: { ...T1, name: 'T1w', wetter: true },
  T2: {
    ...T1, name: 'T2', leiter: false, kontrollJede: 0, schluss: false, tagesprobe: false, blockvergleich: false,
    seFam: false, seStop: 0.50, tageMin: 1, zaun: false, nachblock: 0, tmModus: 'block', zielP: 0.5,
    sprungMax: Infinity, randomesque: 1, famRegeln: false,
  },
  T3: { ...T1, name: 'T3', kontrollJede: 4, kontrollP: 0.92, nMin: 12, nMax: 26, nachblock: 10 },
  T4: { ...T1, name: 'T4', kontrollJede: 0, schluss: false },
  T5: { ...T1, name: 'T5', seFam: false, seStop: 0.50 },
};

// APP: Siegerparameter Phase 3 (T1-Geruest, T4-Ablauf ohne gewertete Kontrollaufgaben, priorSD 1,5, mu_d -0,1).
// Schlussaufgabe bleibt (Gewicht 0, nur fuer das Erfolgserlebnis, KONZEPT §2). Rater: hoechstens 2 Rate-Zusatzbloecke.
// Befund 5 (Prüfung 26.11.): priorSD 1,5 zog Kinder weit über der Klassenstufe um 7–8 LS nach unten (Schrumpfung zur
// Klassenstufe). priorSD 3 und erste Leiterstufe 1,5 Logit: weit voraus −8 → −3 LS, typische Kinder unverändert (pruefung/_diag5.mjs).
export const T_APP = { ...T1, name: 'T_APP', kontrollJede: 0, schluss: true, priorSD: 3, leiterS0: 1.5, muD: -0.1, rateMaxBloecke: 2 };

const TM_QUOTE = {
  sternwarte: { sig: 4, ueb: 4, feh: 3, dar: 4, fach: 3, sort: 2 },   // je 20
  insel: { ueb: 2, dar: 2, fach: 2, sig: 1, sort: 1 },             // je 8
};
const TM_BASIS = { sig: 'SA', ueb: 'SA', feh: 'SA', sort: 'SA', dar: 'RE', fach: 'RE' };
const T2_TYPEN = ['sig', 'ueb', 'dar', 'feh', 'sig', 'ueb', 'dar', 'sort'];
const LT_TYPEN = ['dar', 'ueb', 'dar', 'feh', 'dar', 'ueb'];
const T2_LT_TYPEN = ['dar', 'ueb', 'dar', 'feh'];

export class Einstiegstest {
  // bank: { pools: {RE,SA,HV,LV,GA}, familien }, kind: 'insel'|'sternwarte', lsK: erwartete LS bei Teststart
  constructor(cfg, kind, bank, rngU, lsK) {
    this.cfg = cfg; this.kind = kind; this.bank = bank; this.u = rngU; this.lsK = lsK;
    this.tag = 0;            // Anzahl gelaufener Testtage
    this.block = null;
    this.antworten = [];     // alle Antworten (fuer Bericht)
    this.benutzt = new Set();
    this.G = null; this.tippZeiten = [];
    this.ga = { runde: 0, fakten: [], ergebnis: {} };
    this.tagesproben = {};   // tag -> {schwach}
    this.events = { rateBloecke: 0, muedeFlags: 0, schwacheTage: 0, zusatzbloecke: 0, gestrichen: 0, pausen: 0, wetter: 0 };
    const haupt = kind === 'insel' ? ['RE', 'SA', 'HV'] : ['RE', 'SA', 'LV'];
    const versatz = kind === 'insel' ? { name: 'LV', basis: 'HV' } : { name: 'HV', basis: 'LV' };
    this.skalen = {};
    for (const s of haupt) this.skalen[s] = this._neueSkala(s, 'haupt');
    this.skalen[versatz.name] = this._neueSkala(versatz.name, 'versatz', versatz.basis);
    this.tm = this._neueTransfer('TM', null);
    this.lt = kind === 'sternwarte' ? this._neueTransfer('LT', 'LV') : null;
    this.reihenfolge = [...haupt, versatz.name];
  }

  // ---------- Aufbau ----------
  _neueSkala(name, art, basis = null) {
    const bereich = bereichVonSkala(name);
    const mu0 = lsZuTheta(this.lsK, bereich, 1);
    const s = {
      name, art, basis, bereich, pool: this.bank.pools[name], mu0, prior: null, l: null, tagL: new Map(),
      antw: [], n: 0, gestellt: 0, tage: new Set(), laufTage: [], blockZahl: 0,
      leiter: { aktiv: this.cfg.leiter && art === 'haupt', z: lsZuTheta(this.lsK + this.cfg.startVersatzLS, bereich, 1), s: this.cfg.leiterS0, W: 0, r0: 0, nL: 0 },
      fertig: false, unsicher: false, gestartet: false,
      zusatzRest: 0, zusatzZahl: 0, sperreTag: -1, zaunVersuch: false, nachblockGenutzt: false, bvExtra: false, gestrichen: false, wnZusatz: false,
      famCount: new Map(), fams: new Set(), anker: 0, letzteFams: [], bVorige: null, wn: 0,
      est: { mean: mu0, sd: this.cfg.priorSD }, verlauf: {}, decke: false,
    };
    if (art === 'haupt') this._initPrior(s, mu0, this.cfg.priorSD);
    return s;
  }
  _initPrior(s, mu, sd) {
    s.prior = logPrior(GITTER_THETA, mu, sd);
    s.l = Float64Array.from(s.prior);
    s.priorMu = mu; s.priorSd = sd;
    s.est = { mean: mu, sd };
    s.gestartet = true;
  }
  _neueTransfer(name, basisFest) {
    const prior = logPrior(GITTER_GAMMA, 0, 1);
    return { name, basisFest, l: Float64Array.from(prior), antw: [], n: 0, d: 3, typZahl: {}, fertig: false, unsicher: false, est: { mean: 0, sd: 1 }, gestellt: 0, laufTage: [], blockZahl: 0, sperreTag: -1 };
  }

  // ---------- Tagessteuerung ----------
  fertig() {
    const alle = Object.values(this.skalen).every(s => s.fertig) && this.tm.fertig && (!this.lt || this.lt.fertig);
    return alle || this.tag >= this.cfg.maxTage[this.kind];
  }

  tagBeginnen() {
    if (this.fertig()) return null;
    this.tag += 1;
    const t = this.tag;
    const vorab = [];
    if (t === 1) {
      for (let i = 0; i < 5; i++) vorab.push({ rolle: 'tipp' });
      vorab.push(...this._gaRunde());
    }
    if (t === 3) vorab.push(...this._gaRunde());
    const skalen = this._waehleSkalen(t);
    for (const s of skalen) this._starteSkala(s);
    this.block = {
      tag: t, skalen, vorab, pos: 0, gestellt: new Map(skalen.map(s => [s.name, 0])), antw: [], wechsel: 0,
      schlussPhase: false, schlussZahl: 0, letzteSchlussFalsch: false, endeNachRichtig: false, kontrollErzwingen: false,
      muede: false, rateFolge: 0, pauseEnde: false, letzteSkala: null, letzteWarTM: false, tmIndex: 0,
    };
    for (const s of skalen) { s.blockZahl += 1; s.laufTage.push(t); }
    return { tag: t, skalen: skalen.map(s => s.name) };
  }

  // Simulation: Tag ausfallen lassen (Expeditionswetter) -> zaehlt nicht als Testtag
  tagVerschieben() { this.tag -= 1; this.block = null; this.events.wetter++; }

  _offen(s) {
    if (s.fertig) return false;
    if (s.art === 'versatz') return this.skalen[s.basis].fertig;
    return true;
  }
  _tmSlotOffen() {
    if (this.tm.fertig) return false;
    if (this.cfg.tmModus === 'block') return this.skalen.RE.fertig && this.skalen.SA.fertig;
    return this.skalen.RE.fertig && this.skalen.SA.fertig; // eingestreut: als eigener Slot erst, wenn RE und SA fertig sind
  }
  _waehleSkalen(t) {
    const gestern = (s) => s.laufTage.includes(t - 1);
    const kand = [];
    const haupt = Object.values(this.skalen).filter(s => s.art === 'haupt' && this._offen(s));
    const nichtGestern = haupt.filter(s => !gestern(s)).sort((a, b) => this._seGes(b) - this._seGes(a));
    const jaGestern = haupt.filter(s => gestern(s)).sort((a, b) => this._seGes(b) - this._seGes(a));
    kand.push(...nichtGestern);
    const vs = Object.values(this.skalen).filter(s => s.art === 'versatz' && this._offen(s));
    kand.push(...vs);
    if (this._tmSlotOffen()) kand.push(this.tm);
    if (this.lt && !this.lt.fertig && this.skalen.LV.fertig) kand.push(this.lt);
    kand.push(...jaGestern);
    return kand.slice(0, 2);
  }
  _starteSkala(s) {
    if (s.art === 'versatz' && !s.gestartet) {
      const b = this.skalen[s.basis];
      this._initPrior(s, b.est.mean, 1.5);
    }
  }

  // ---------- GA-Inventar ----------
  _gaRunde() {
    this.ga.runde += 1;
    const out = [];
    const pool = this.bank.pools.GA;
    for (let k = 0; k < 8; k++) {
      const kand = pool.filter(it => it.knoten === k && !this.benutzt.has(it.id));
      for (let j = 0; j < 2; j++) {
        const it = kand.splice(Math.floor(this.u() * kand.length), 1)[0];
        this.benutzt.add(it.id);
        out.push({ rolle: 'ga', item: it });
      }
    }
    return out;
  }

  // ---------- Aufgabenwahl ----------
  naechste() {
    const B = this.block;
    if (!B) return null;
    if (B.vorab.length) { const a = B.vorab.shift(); a.tag = B.tag; return a; }
    if (!B.schlussPhase) {
      const kappe = this.cfg.kappeBlock[this.kind] - (this.cfg.schluss ? 1 : 0);
      if (B.pos >= kappe || B.pauseEnde) B.schlussPhase = true;
    }
    if (!B.schlussPhase) {
      const a = this._naechsteImBlock();
      if (a) { a.tag = B.tag; return a; }
      B.schlussPhase = true;
    }
    // Schlussaufgabe(n)
    if (this.cfg.schluss && B.schlussZahl < 3 && (B.schlussZahl === 0 || B.letzteSchlussFalsch)) {
      const s = B.letzteSkala && B.letzteSkala.pool ? B.letzteSkala : B.skalen.find(x => x.pool) || this.skalen.RE;
      if (s.gestartet) {
        const b = s.est.mean - 2.944 - 0.5 * B.schlussZahl;
        const it = this._waehleItem(s, b, { kontroll: true, schluss: true });
        if (it) { B.schlussZahl++; return { rolle: 'schluss', skala: s.name, item: it, tag: B.tag }; }
      }
    }
    this._blockAbschluss();
    return null;
  }

  _aktiv(s) {
    const B = this.block;
    if (s.fertig || s.sperreTag === B.tag) return false;
    if (s.pool === undefined) return !s.fertig; // Transfer-Slot
    return B.gestellt.get(s.name) < this.cfg.kappeSkala[this.kind];
  }

  _naechsteImBlock() {
    const B = this.block;
    // eingestreute TM-Aufgabe
    if (this.cfg.tmModus === 'eingestreut' && !this.tm.fertig && !B.letzteWarTM && (B.pos + 1) % 3 === 0 && !B.kontrollErzwingen) {
      const rs = B.skalen.filter(s => (s.name === 'RE' || s.name === 'SA') && s.blockZahl >= 2);
      if (rs.length && rs.some(s => this._aktiv(s))) return this._tmAufgabe(this.tm);
    }
    // aktive Skalen, abwechselnd
    let aktive = B.skalen.filter(s => this._aktiv(s));
    if (aktive.length < B.skalen.length) {
      // fertige Skala im Block ersetzen, wenn noch Platz ist (>= 4 Aufgaben)
      const rest = this.cfg.kappeBlock[this.kind] - B.pos;
      if (rest >= 5) {
        const ersatz = this._waehleSkalen(B.tag).filter(s => !B.skalen.includes(s) && s.sperreTag !== B.tag);
        if (ersatz.length) {
          const s = ersatz[0];
          this._starteSkala(s);
          B.skalen.push(s); B.gestellt.set(s.name, 0);
          if (!s.laufTage.includes(B.tag)) { s.laufTage.push(B.tag); s.blockZahl += 1; }
          aktive = B.skalen.filter(x => this._aktiv(x));
        }
      }
    }
    if (!aktive.length) return null;
    let s;
    if (B.kontrollErzwingen && B.letzteSkala && this._aktiv(B.letzteSkala)) s = B.letzteSkala;
    else { s = aktive[B.wechsel % aktive.length]; B.wechsel++; }
    if (s.pool === undefined) return this._tmAufgabe(s);
    return this._wissensAufgabe(s);
  }

  _wissensAufgabe(s) {
    const B = this.block;
    const cfg = this.cfg;
    let it, rolle = 'normal';
    if (s.leiter.aktiv) {
      it = this._waehleItem(s, s.leiter.z, { leiter: true });
      rolle = 'leiter';
    } else {
      const kontroll = B.kontrollErzwingen || (s.art === 'haupt' && cfg.kontrollJede > 0 && (s.gestellt + 1) % cfg.kontrollJede === 0);
      const p = kontroll ? cfg.kontrollP : cfg.zielP;
      it = this._waehleItem(s, null, { p, kontroll });
      rolle = kontroll ? 'kontroll' : 'normal';
      B.kontrollErzwingen = false;
    }
    if (!it) { s.fertig = true; s.unsicher = true; return this._naechsteImBlock(); }
    return { rolle, skala: s.name, item: it };
  }

  // Randomesque-Auswahl. zielB gegeben (Leiter/Schluss) oder aus p und theta-Hat je c berechnet.
  _waehleItem(s, zielB, o) {
    const cfg = this.cfg;
    const pool = s.pool;
    const th = s.est.mean;
    const zielFuer = (c) => {
      let b = zielB !== null ? zielB : bFuerZiel(th, o.p, c);
      if (!o.kontroll && !o.leiter && zielB === null && s.bVorige !== null && isFinite(cfg.sprungMax)) {
        b = Math.min(s.bVorige + cfg.sprungMax, Math.max(s.bVorige - cfg.sprungMax, b));
      }
      return b;
    };
    const z0 = zielFuer(0), z25 = zielFuer(0.25);
    const nGes = s.gestellt;
    const famRegeln = cfg.famRegeln;
    const sperrFams = o.leiter ? s.letzteFams.slice(-2) : s.letzteFams.slice(-1);
    const vielfalt = famRegeln && nGes >= 12 && (s.fams.size < 5 || s.anker < 2);
    // Binaersuche
    let lo = 0, hi = pool.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (pool[m].b < z0) lo = m + 1; else hi = m; }
    let i = lo - 1, j = lo;
    const besteJeFam = new Map();
    const k = cfg.randomesque;
    let dritt = Infinity;
    const pruefe = (it) => {
      if (this.benutzt.has(it.id)) return;
      if (famRegeln && !o.schluss) {
        if (sperrFams.includes(it.fam)) return;
        if (nGes >= 8) { const fc = s.famCount.get(it.fam) || 0; if (fc + 1 > cfg.famMaxAnteil * (nGes + 1)) return; }
      }
      let d = Math.abs(it.b - (it.c > 0 ? z25 : z0));
      if (vielfalt && ((s.fams.size < 5 && !s.fams.has(it.fam)) || (s.anker < 2 && it.anker))) d -= 0.3;
      const key = famRegeln ? it.fam : it.id;
      const alt = besteJeFam.get(key);
      if (!alt || d < alt.d) besteJeFam.set(key, { it, d });
    };
    let schritt = 0;
    while (i >= 0 || j < pool.length) {
      const di = i >= 0 ? z0 - pool[i].b : Infinity;
      const dj = j < pool.length ? pool[j].b - z0 : Infinity;
      const dd = Math.min(di, dj);
      if (besteJeFam.size >= k && (schritt++ % 8 === 0)) {
        // k-beste Distanz bestimmen (nur alle 8 Schritte, spart Zeit)
        let a1 = Infinity, a2 = Infinity, a3 = Infinity;
        for (const v of besteJeFam.values()) {
          const d = v.d;
          if (d < a1) { a3 = a2; a2 = a1; a1 = d; } else if (d < a2) { a3 = a2; a2 = d; } else if (d < a3) a3 = d;
        }
        dritt = k === 1 ? a1 : k === 2 ? a2 : a3;
        if (dd - 0.8 > dritt) break;
      }
      if (di <= dj) { pruefe(pool[i]); i--; } else { pruefe(pool[j]); j++; }
    }
    if (!besteJeFam.size) return null;
    const arr = [...besteJeFam.values()].sort((a, b) => a.d - b.d).slice(0, k);
    return arr[Math.floor(this.u() * arr.length)].it;
  }

  _tmAufgabe(T) {
    const B = this.block;
    const cfg = this.cfg;
    let typ, basisName, bZwilling, d;
    if (T.name === 'LT') {
      const liste = cfg.tmModus === 'block' ? T2_LT_TYPEN : LT_TYPEN;
      typ = liste[T.gestellt % liste.length];
      basisName = 'LV';
    } else if (cfg.tmModus === 'block') {
      typ = T2_TYPEN[T.gestellt % T2_TYPEN.length];
      basisName = TM_BASIS[typ];
    } else {
      const q = TM_QUOTE[this.kind];
      const tot = Object.values(q).reduce((a, b) => a + b, 0);
      let best = null, bestR = -Infinity;
      for (const [ty, v] of Object.entries(q)) {
        const r = v * (T.gestellt + 1) / tot - (T.typZahl[ty] || 0);
        if (r > bestR + 1e-9) { bestR = r; best = ty; }
      }
      typ = best; basisName = TM_BASIS[typ];
    }
    const basis = this.skalen[basisName];
    const thG = basis.est.mean;
    if (cfg.tmModus === 'block') { bZwilling = thG - 0.6; d = 3; }
    else { bZwilling = thG - logit(0.85); d = T.d; }
    // naechste unbenutzte Aufgabe der Basisskala
    const pool = (this.bank.tpools && this.bank.tpools[basisName]) || basis.pool; // APP: nur transferfaehige Zwillinge
    let lo = 0, hi = pool.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (pool[m].b < bZwilling) lo = m + 1; else hi = m; }
    let i = lo - 1, j = lo, it = null;
    while (i >= 0 || j < pool.length) {
      const di = i >= 0 ? bZwilling - pool[i].b : Infinity;
      const dj = j < pool.length ? pool[j].b - bZwilling : Infinity;
      const cand = di <= dj ? pool[i--] : pool[j++];
      if (!this.benutzt.has(cand.id)) { it = cand; break; }
    }
    B.letzteWarTM = true;
    return { rolle: 'tm', skala: T.name, item: it, transfer: { typ, d, basis: basisName, thetaGrund: thG, c: typ === 'sort' ? 0.25 : null } };
  }

  // ---------- Antwort verarbeiten ----------
  tRapid(item) {
    const t0 = this.kind === 'insel' ? item.t0Insel : item.t0Stern;
    return Math.max(this.cfg.rateF[this.kind], this.cfg.rateT0 * t0, this.G || 0);
  }

  // r = { x: 0|1, t: Sekunden, wn: "weiss ich noch nicht" }
  antwort(a, r) {
    const B = this.block;
    if (a.rolle === 'tipp') { this.tippZeiten.push(r.t); if (this.tippZeiten.length === 5) this.G = median(this.tippZeiten); return {}; }
    if (a.rolle === 'ga') {
      const thr = (this.G || 1) + (this.kind === 'insel' ? 2.0 : 1.5);
      const z = r.x && r.t <= thr ? 1 : 0;
      const k = a.item.knoten;
      (this.ga.ergebnis[k] = this.ga.ergebnis[k] || []).push(z);
      this.benutzt.add(a.item.id);
      return {};
    }
    this.benutzt.add(a.item.id);
    const geraten = istGeraten(r, this.tRapid(a.item));
    const rec = { rolle: a.rolle, skala: a.skala, item: a.item, x: r.x, t: r.t, wn: !!r.wn, geraten, tag: B.tag, blockPos: B.pos, fm: 1, rm: 1, tm: 1, strike: 1 };
    this.antworten.push(rec);
    B.antw.push(rec);
    if (a.rolle !== 'schluss') B.pos++;
    B.letzteWarTM = a.rolle === 'tm';
    const out = {};

    // Rate-Folge
    if (geraten) { B.rateFolge++; if (B.rateFolge >= 3) { B.rateFolge = 0; out.pause = true; this.events.pausen++; } }
    else B.rateFolge = 0;

    if (a.rolle === 'schluss') {
      const s = this.skalen[a.skala];
      rec.p = pKorrekt(s.est.mean, a.item.b, a.item.c);
      rec.lnres = Math.log(r.t) - (Math.log(this.kind === 'insel' ? a.item.t0Insel : a.item.t0Stern) + 0.1 * (a.item.b - s.est.mean));
      rec.wBasis = 0; rec.w = 0;
      B.letzteSchlussFalsch = !r.x;
      return out;
    }

    if (a.rolle === 'tm') { this._tmAntwort(a, r, rec); this._muedePruefung(rec); return out; }

    const s = this.skalen[a.skala];
    B.letzteSkala = s;
    B.gestellt.set(s.name, (B.gestellt.get(s.name) || 0) + 1);
    s.gestellt++;
    rec.p = pKorrekt(s.est.mean, a.item.b, a.item.c);
    rec.lnres = Math.log(r.t) - (Math.log(this.kind === 'insel' ? a.item.t0Insel : a.item.t0Stern) + 0.1 * (a.item.b - s.est.mean));
    rec.wBasis = geraten ? 0 : (r.wn ? 0.5 : 1);
    rec.xEff = r.wn ? 0 : r.x;
    rec.b = a.item.b; rec.c = a.item.c;
    if (B.muede) rec.fm = 0.5;
    rec.w = this._gewicht(rec);
    if (r.wn) s.wn++;
    s.antw.push(rec);
    if (!geraten) {
      s.famCount.set(a.item.fam, (s.famCount.get(a.item.fam) || 0) + 1);
      if (!s.fams.has(a.item.fam)) { s.fams.add(a.item.fam); if (a.item.anker) s.anker++; }
      s.letzteFams.push(a.item.fam);
    }
    if (rec.w > 0) {
      addiereAntwort(s.l, GITTER_THETA, a.item.b, a.item.c, rec.xEff, rec.w);
      this._tagL(s, B.tag, rec, rec.w);
      s.n++; s.tage.add(B.tag);
      s.est = eap(s.l, GITTER_THETA);
      if (s.art === 'haupt') for (const m of [5, 10, 15, 20, 24]) if (s.n === m) s.verlauf[m] = s.est.mean;
    }
    if (a.rolle !== 'kontroll' && !geraten) s.bVorige = a.item.b;
    if (s.zusatzRest > 0 && !geraten) s.zusatzRest--;

    // Leiter
    if (s.leiter.aktiv && !geraten) {
      const L = s.leiter;
      const rr = rec.xEff ? 1 : -1;
      if (L.r0 !== 0 && rr !== L.r0) { L.W++; L.s = Math.max(0.25, L.s / 2); }
      L.z = a.item.b + rr * L.s; L.r0 = rr; L.nL++;
      if (L.W >= this.cfg.leiterWechsel || (L.nL >= this.cfg.leiterN && L.W >= 1) || L.nL >= this.cfg.gipfelMax) L.aktiv = false;
    }
    // Ende nach Muedigkeitsflag
    if (B.endeNachRichtig && rec.xEff) B.schlussPhase = true;
    this._muedePruefung(rec);
    // "Weiss nicht"-Anteil
    if (!s.wnZusatz && s.gestellt >= 8 && s.wn / s.gestellt > 0.25) { s.wnZusatz = true; this._zusatz(s, 'weissnicht'); }
    if (s.art === 'haupt') this._pruefeStopp(s);
    else if (s.art === 'versatz' && s.n >= this.cfg.versatzN[this.kind] && s.zusatzRest <= 0) s.fertig = true;
    return out;
  }

  pauseEntscheid(weiter) { if (!weiter) this.block.pauseEnde = true; }

  _gewicht(rec) {
    if (rec.wBasis === 0 || rec.strike === 0) return 0;
    return Math.max(0.25, rec.wBasis * rec.fm * rec.rm * rec.tm);
  }
  _tagL(s, tag, rec, dw) {
    if (!this.cfg.blockvergleich) return;
    let l = s.tagL.get(tag);
    if (!l) { l = logPrior(GITTER_THETA, s.priorMu, 2.0); s.tagL.set(tag, l); }
    addiereAntwort(l, GITTER_THETA, rec.b, rec.c, rec.xEff, dw);
  }
  _setzeGewicht(rec, aenderung) {
    const alt = rec.w;
    Object.assign(rec, aenderung);
    const neu = this._gewicht(rec);
    if (neu === alt) return;
    rec.w = neu;
    const dw = neu - alt;
    if (rec.rolle === 'tm') {
      const T = rec.skala === 'LT' ? this.lt : this.tm;
      addiereAntwort(T.l, GITTER_GAMMA, rec.bG, rec.c, rec.xEff, dw);
      T.est = eap(T.l, GITTER_GAMMA);
      return;
    }
    if (rec.rolle === 'schluss') return;
    const s = this.skalen[rec.skala];
    addiereAntwort(s.l, GITTER_THETA, rec.b, rec.c, rec.xEff, dw);
    this._tagL(s, rec.tag, rec, dw);
    if (alt === 0 && neu > 0) s.n++;
    if (alt > 0 && neu === 0) s.n--;
    s.est = eap(s.l, GITTER_THETA);
  }

  _tmAntwort(a, r, rec) {
    const T = a.skala === 'LT' ? this.lt : this.tm;
    const cfg = this.cfg;
    const mu = cfg.tmModus === 'block' ? 0 : cfg.muD * a.transfer.d;
    T.gestellt++;
    T.typZahl[a.transfer.typ] = (T.typZahl[a.transfer.typ] || 0) + 1;
    rec.b = a.item.b; rec.c = a.transfer.c != null ? a.transfer.c : a.item.c; // APP: Sortieraufgabe = Auswahl
    rec.bG = a.item.b - a.transfer.thetaGrund - mu; // P = c+(1-c) sig(gamma - bG)
    rec.p = pKorrekt(T.est.mean, rec.bG, rec.c);
    rec.lnres = Math.log(r.t) - (Math.log(this.kind === 'insel' ? a.item.t0Insel : a.item.t0Stern) + 0.1 * (a.item.b - a.transfer.thetaGrund));
    rec.wBasis = rec.geraten ? 0 : (r.wn ? 0.5 : 1);
    rec.xEff = r.wn ? 0 : r.x;
    rec.typ = a.transfer.typ;
    if (this.block.muede) rec.fm = 0.5;
    rec.w = this._gewicht(rec);
    T.antw.push(rec);
    if (rec.w > 0) {
      addiereAntwort(T.l, GITTER_GAMMA, rec.bG, rec.c, rec.xEff, rec.w);
      T.n++;
      T.est = eap(T.l, GITTER_GAMMA);
    }
    if (cfg.tmModus !== 'block' && !rec.geraten) T.d = rec.xEff ? Math.min(6, T.d + 1) : Math.max(2, T.d - 1);
    // Stopp
    if (T.name === 'LT') { if (T.gestellt >= (cfg.tmModus === 'block' ? 4 : 6)) T.fertig = true; }
    else if (cfg.tmModus === 'block' || this.kind === 'insel') { if (T.n >= cfg.tmR || T.gestellt >= cfg.tmR + 4) T.fertig = true; }
    else if ((T.n >= cfg.gammaNmin && T.est.sd <= cfg.seGammaStop) || T.n >= cfg.gammaNmax) T.fertig = true;
  }

  _muedePruefung(rec) {
    const B = this.block;
    if (B.muede || rec.w === 0 && rec.wBasis === 0) return;
    const gew = B.antw.filter(a => a.rolle !== 'schluss' && a.wBasis > 0);
    if (gew.length < 6) return;
    const letzte6 = gew.slice(-6);
    const D6 = letzte6.reduce((s, a) => s + (a.xEff - a.p), 0) / 6;
    if (D6 >= this.cfg.muedeD6) return;
    const erste5 = gew.slice(0, 5).map(a => a.lnres), letzte5 = gew.slice(-5).map(a => a.lnres);
    if (median(letzte5) - median(erste5) <= this.cfg.muedeZeit) return;
    B.muede = true; this.events.muedeFlags++;
    for (const a of letzte6) this._setzeGewicht(a, { fm: 0.5 });
    B.kontrollErzwingen = true; B.endeNachRichtig = true;
  }

  _zusatz(s, grund) {
    if (s.zusatzZahl >= this.cfg.zusatzMax) return;
    s.zusatzZahl++; this.events.zusatzbloecke++;
    s.zusatzRest = Math.max(s.zusatzRest, this.cfg.zusatzGroesse[this.kind]);
    s.sperreTag = this.block ? this.block.tag : -1;
    s.fertig = false;
  }

  _seFam(s) {
    if (!this.cfg.seFam) return 0;
    const th = s.est.mean;
    const If = new Map(); let I = 0;
    for (const a of s.antw) {
      if (a.w <= 0) continue;
      const v = a.w * information(th, a.b, a.c);
      If.set(a.item.fam, (If.get(a.item.fam) || 0) + v); I += v;
    }
    if (I <= 0) return this.cfg.sigmaF;
    let q = 0;
    for (const [f, v] of If) {
      const fam = this.bank.familien[f];
      const sf = fam.anker ? this.cfg.sigmaFAnker : this.cfg.sigmaF;
      q += (v / I) * (v / I) * sf * sf;
    }
    return Math.sqrt(q);
  }
  _seGes(s) {
    if (!s.gestartet) return this.cfg.priorSD;
    const f = this._seFam(s);
    return Math.sqrt(s.est.sd * s.est.sd + f * f);
  }

  _pruefeStopp(s) {
    const cfg = this.cfg;
    if (s.fertig || s.leiter.aktiv || s.zusatzRest > 0) return;
    const se = this._seGes(s);
    const ok = s.n >= cfg.nMin && s.tage.size >= cfg.tageMin && se <= cfg.seStop;
    if (ok) {
      if (cfg.zaun && !s.zaunVersuch) {
        const ml = mlMitZaun(s.antw, GITTER_THETA);
        if (Math.abs(ml - s.est.mean) > cfg.zaunTol) { s.zaunVersuch = true; s.zusatzRest = cfg.zaunExtra; return; }
      }
      if (cfg.blockvergleich) {
        const r = this._blockvergleich(s);
        if (r === 'extra' || r === 'gestrichen') return;
      }
      s.fertig = true;
      return;
    }
    if (s.n >= cfg.nMax) {
      if (cfg.nachblock > 0 && !s.nachblockGenutzt) {
        s.nachblockGenutzt = true; s.zusatzRest = cfg.nachblock; s.sperreTag = this.block.tag;
      } else { s.fertig = true; s.unsicher = true; }
    }
  }

  _blockvergleich(s) {
    const tage = [];
    for (const [tag, l] of s.tagL) {
      const n = s.antw.filter(a => a.tag === tag && a.w > 0).length;
      if (n >= 3) { const e = eap(l, GITTER_THETA); tage.push({ tag, m: e.mean, se: e.sd }); }
    }
    if (tage.length === 2 && !s.bvExtra) {
      const [a, b] = tage;
      if (Math.abs(a.m - b.m) > 2 * Math.sqrt(a.se * a.se + b.se * b.se)) {
        s.bvExtra = true; s.zusatzRest = this.cfg.zusatzGroesse[this.kind]; s.sperreTag = this.block.tag;
        this.events.zusatzbloecke++;
        return 'extra';
      }
    }
    if (tage.length >= 3 && !s.gestrichen) {
      const ms = tage.map(t => t.m).sort((a, b) => a - b);
      const med = ms[Math.floor(ms.length / 2)];
      let schlecht = null, abw = -1;
      for (const t of tage) { const d = Math.abs(t.m - med); if (d > abw) { abw = d; schlecht = t; } }
      const andere = tage.filter(t => t !== schlecht);
      const seMed = median(andere.map(t => t.se));
      if (abw > 2 * Math.sqrt(schlecht.se * schlecht.se + seMed * seMed)) {
        s.gestrichen = true; this.events.gestrichen++;
        for (const a of s.antw) if (a.tag === schlecht.tag) this._setzeGewicht(a, { strike: 0 });
        return 'gestrichen';
      }
    }
    return 'ok';
  }

  // ---------- Blockende ----------
  _blockAbschluss() {
    const B = this.block;
    if (!B || B.abgeschlossen) return;
    B.abgeschlossen = true;
    const echte = B.antw;
    // Rateanteil (RTE)
    if (echte.length) {
      const rte = echte.filter(a => !a.geraten).length / echte.length;
      if (rte < this.cfg.rte) {
        this.events.rateBloecke++;
        for (const a of echte) this._setzeGewicht(a, { rm: 0.5 });
        const betroffen = new Set(echte.filter(a => a.geraten && this.skalen[a.skala]).map(a => a.skala));
        // APP (KONZEPT §7.4): nach 2 Rate-Bloecken keine weiteren Zusatzbloecke, Ergebnis mit Hinweis
        if (this.events.rateBloecke <= (this.cfg.rateMaxBloecke || Infinity)) for (const n of betroffen) this._zusatz(this.skalen[n], 'rate');
      }
    }
    // Tagesprobe
    if (this.cfg.tagesprobe && B.tag >= 2) {
      this._tagesprobe(B.tag);
      if (B.tag === 2 && this.tagesproben[1] === undefined) this._tagesprobe(1);
    }
    // nicht fertige Skalen nach dem Block erneut pruefen
    for (const s of Object.values(this.skalen)) if (s.art === 'haupt' && !s.fertig) this._pruefeStopp(s);
    this.block = null;
    if (this.fertig()) this._abschluss();
  }

  _tagesprobe(tag) {
    const tagA = this.antworten.filter(a => a.tag === tag && a.lnres !== undefined && !a.geraten);
    const andere = this.antworten.filter(a => a.tag !== tag && a.lnres !== undefined && !a.geraten && a.x && a.rolle !== 'tm');
    if (andere.length < 5) { this.tagesproben[tag] = { schwach: false, ungeprueft: true }; return; }
    const tau = -andere.reduce((s, a) => s + a.lnres, 0) / andere.length;
    let basis = tagA.filter(a => a.rolle !== 'schluss' && a.wBasis > 0);
    if (basis.length < 10) basis = tagA;
    if (!basis.length) return;
    const TF = median(basis.map(a => a.lnres + tau));
    const leicht = tagA.filter(a => a.p >= 0.90);
    const leichtSchwach = leicht.length >= 3 && leicht.filter(a => a.x).length < (2 / 3) * leicht.length;
    const schwach = TF > this.cfg.tf || leichtSchwach;
    this.tagesproben[tag] = { schwach, TF };
    if (schwach) {
      this.events.schwacheTage++;
      const betroffen = new Set();
      for (const a of tagA) { this._setzeGewicht(a, { tm: 0.5 }); if (this.skalen[a.skala]) betroffen.add(a.skala); }
      for (const n of betroffen) this._zusatz(this.skalen[n], 'tag');
    }
  }

  _abschluss() {
    for (const s of Object.values(this.skalen)) if (!s.fertig) { s.fertig = true; s.unsicher = true; }
    if (!this.tm.fertig) { this.tm.fertig = true; this.tm.unsicher = true; }
    if (this.lt && !this.lt.fertig) { this.lt.fertig = true; this.lt.unsicher = true; }
  }

  // Test von aussen beenden (Simulation: Tage aufgebraucht)
  beenden() { if (this.block) this._blockAbschluss(); this._abschluss(); }

  // ---------- Ergebnis ----------
  ergebnis() {
    const sk = {};
    for (const s of Object.values(this.skalen)) {
      const seF = s.gestartet ? this._seFam(s) : 0;
      const seStat = s.est.sd;
      const seGes = Math.sqrt(seStat * seStat + seF * seF);
      const topB = s.pool[s.pool.length - 1].b;
      const richtigOben = s.antw.filter(a => a.w > 0 && a.xEff).slice(-3);
      const decke = s.gestartet && (s.est.mean > topB - 1.0 || (richtigOben.length === 3 && richtigOben.every(a => a.item.famIdx >= 31)));
      // Genauigkeit: Anteil richtig unter Aufgaben mit P(theta_end) >= 0,85
      const leicht = this.antworten.filter(a => a.skala === s.name && a.rolle !== 'tm' && !a.geraten && pKorrekt(s.est.mean, a.item.b, a.item.c) >= 0.85);
      // Befund 9: Bei auffälligem Raten (≥ 2 Rate-Blöcke) gelten auch knapp über der Schwelle liegende Antworten
      // (< 1,5 × Rate-Schwelle) als verdächtig. Liegt ihr Anteil in der Skala ≥ 25 %, wird ohne sie neu geschätzt,
      // die Spanne umfasst beide Schätzungen, und das Ergebnis heißt „noch unsicher – zu viele schnelle Antworten".
      let theta = s.est.mean, seOut = this.cfg.seFam ? seGes : seStat, rater = false;
      if (s.gestartet && this.events.rateBloecke >= 2 && s.antw.length) {
        const schnell = new Set(s.antw.filter(a => a.t < 1.5 * this.tRapid(a.item)));
        if (schnell.size / s.antw.length >= 0.25) {
          rater = true;
          const l = logPrior(GITTER_THETA, s.mu0, this.cfg.priorSD);
          for (const a of s.antw) if (!schnell.has(a) && a.w > 0) addiereAntwort(l, GITTER_THETA, a.item.b, a.item.c, a.xEff ? 1 : 0, a.w);
          const e2 = eap(l, GITTER_THETA);
          const lo = Math.min(theta - 1.64 * seOut, e2.mean - 1.64 * e2.sd), hi = Math.max(theta + 1.64 * seOut, e2.mean + 1.64 * e2.sd);
          theta = (lo + hi) / 2; seOut = (hi - lo) / (2 * 1.64);
        }
      }
      sk[s.name] = {
        theta, seStat, seFam: seF, seGes: seOut, rater,
        n: s.n, gestellt: s.gestellt, tage: s.tage.size, unsicher: s.unsicher || rater, decke, gestartet: s.gestartet,
        verlauf: s.verlauf, art: s.art,
        genau: leicht.length >= 6 ? leicht.filter(a => a.x).length / leicht.length : null,
        genauItems: leicht.map(a => a.item.id),
      };
    }
    const tmE = (T) => {
      if (!T) return null;
      const basisSE = T.name === 'LT' ? sk.LV.seStat : Math.sqrt((sk.SA.seStat ** 2 + sk.RE.seStat ** 2) / 2);
      const seG = Math.sqrt(T.est.sd ** 2 + basisSE ** 2);
      const g = T.est.mean;
      return { gamma: g, se: T.est.sd, seGes: seG, n: T.n, unsicher: T.unsicher, deutlich: Math.abs(g) > this.cfg.deutlich * seG, hinweis: Math.abs(g) > this.cfg.hinweis * seG };
    };
    const gaAlpha = {};
    for (const [k, v] of Object.entries(this.ga.ergebnis)) gaAlpha[k] = v.reduce((a, b) => a + b, 0) / v.length;
    const echte = this.antworten.filter(a => a.rolle !== 'ga');
    const tauHat = (() => { const r = echte.filter(a => a.x && !a.geraten && a.rolle !== 'tm'); return r.length ? -r.reduce((s, a) => s + a.lnres, 0) / r.length : 0; })();
    return {
      skalen: sk, tm: tmE(this.tm), lt: tmE(this.lt), gaAlpha, G: this.G, tau: tauHat,
      tage: this.tag, aufgaben: echte.length,
      quote: echte.length ? echte.filter(a => a.x).length / echte.length : null,
      events: this.events,
    };
  }
}

export function median(arr) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : 0.5 * (a[m - 1] + a[m]);
}

// ---------- Leseflüssigkeit (Elternknopf, kein Rasch) ----------
// Start Text der Klassenstufe, +-1 Stufe je Text, 3 Texte je Termin. Ergebnis: hoechste Stufe mit >= 95 % Genauigkeit.
export function lfNaechsteStufe(stufe, genauigkeit) { return genauigkeit >= 95 ? stufe + 10 : stufe - 10; }
export function lfErgebnis(messungen) {
  // messungen: [{stufe, genau, wcpm}]
  const ok = messungen.filter(m => m.genau >= 95);
  if (!ok.length) { const m = Math.min(...messungen.map(x => x.stufe)); return { ls: m - 10, wcpm: null }; }
  const top = Math.max(...ok.map(m => m.stufe));
  const w = ok.filter(m => m.stufe === top).map(m => m.wcpm);
  return { ls: top, wcpm: w.reduce((a, b) => a + b, 0) / w.length };
}
