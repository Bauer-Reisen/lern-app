// Aufgabenbank: erzeugt aus allen Vorlagen feste Aufgaben (gleicher Startwert -> gleiche Aufgaben auf jedem Gerät).
// Jede Stufe einer Vorlage = eine Familie mit bis zu 30 Aufgaben. Schwierigkeit b = θ(Lernstufe + Merkmalszuschlag).
import { VORLAGEN } from './inhalte/index.js';
import { GA_KNOTEN } from './inhalte/grund.js';
import { lsZuTheta } from './kern/skala.js';
import { rngAus } from './inhalte/werkzeug.js';
import { transferFaehig } from './inhalte/transfer.js';

export const N_JE_FAMILIE = 30;
const t0Typ = (skala, b) => {
  if (skala === 'RE') return b < 0 ? [3.0, 2.0] : b < 1 ? [4.5, 2.5] : b < 2 ? [10, 6] : [30, 20];
  if (skala === 'SA') return b < 2 ? [20, 15] : [60, 45];
  if (skala === 'GA') return b < 0.8 ? [3.0, 2.0] : [4.5, 2.5];
  return [30, 25];
};
export const knotenVonB = (b) => Math.max(0, Math.min(16, Math.floor((b + 1.5) / 0.5)));
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const schluessel = (a) => JSON.stringify([a.text, a.frage, a.wahl && a.wahl.slice().sort(), a.antwort, a.tabelle && a.tabelle.zeilen]);

export function baueBank(vorlagen = VORLAGEN, n = N_JE_FAMILIE) {
  const items = new Map(), familien = {}, pools = { RE: [], SA: [], GA: [], LV: [], HV: [] }, vorlagenMap = new Map();
  for (const V of vorlagen) {
    vorlagenMap.set(V.id, V);
    const skalen = V.skala === 'LV' ? (V.hv === false ? ['LV'] : ['LV', 'HV']) : [V.skala];
    for (const st of V.stufen) {
      // Aufgaben einmal erzeugen (für LV und HV dieselben Texte)
      const auf = [], gesehen = new Set();
      for (let j = 0; auf.length < n && j < n * 3; j++) {
        const a = V.erzeuge(rngAus(V.id, st.id, j), st);
        const k = schluessel(a);
        if (gesehen.has(k)) continue;
        gesehen.add(k); auf.push(a);
      }
      for (const sk of skalen) {
        const bereich = sk === 'LV' || sk === 'HV' ? 'L' : 'M';
        const famId = (sk === 'HV' ? 'hv:' : '') + V.id + '.' + st.id;
        const lsBasis = V.skala === 'GA' ? GA_KNOTEN[V.knoten].ls : (sk === 'HV' ? (st.lsHV != null ? st.lsHV : st.ls < 30 ? st.ls - 3 : st.ls) : st.ls);
        const its = auf.map((a, j) => {
          const b = lsZuTheta(lsBasis + (a.dls || 0), bereich);
          return { id: famId + '#' + j, skala: sk, fam: famId, vorlage: V.id, stufe: st.id, kompetenz: V.kompetenz || null, b, c: a.art === 'wahl' ? 1 / a.wahl.length : 0, a, ls: lsBasis + (a.dls || 0) };
        });
        const med = median(its.map(i => i.b));
        const knoten = V.skala === 'GA' ? V.knoten : knotenVonB(med);
        familien[famId] = { id: famId, skala: sk, vorlage: V.id, stufe: st.id, anker: (V.anker || []).includes(st.id), zentrum: med, knoten, titel: V.titel, n: its.length };
        for (const it of its) {
          const [t0Insel, t0Stern] = t0Typ(sk, it.b);
          Object.assign(it, { anker: familien[famId].anker, knoten, famIdx: Math.round((med + 1.5) / 0.25), t0Insel, t0Stern });
          items.set(it.id, it);
          pools[sk].push(it);
        }
      }
    }
  }
  for (const k of Object.keys(pools)) pools[k].sort((a, b) => a.b - b.b);
  const tpools = {
    RE: pools.RE.filter(transferFaehig), SA: pools.SA.filter(transferFaehig),
    LV: pools.LV.filter(i => vorlagenMap.get(i.vorlage).lt),
  };
  return { items, pools, tpools, familien, vorlagen: vorlagenMap };
}
