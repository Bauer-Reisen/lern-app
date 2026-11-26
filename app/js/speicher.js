// Speichern auf dem Gerät (localStorage) und Sicherung als Datei.
// Der Zustand von Einstiegstest und Lernalltag wird allgemein umgewandelt:
// Aufgaben -> {$i: id}, Mengen/Maps/Zahlenfelder -> eigene Marken, mehrfach benutzte Objekte -> Verweis.
const SCHLUESSEL = 'lernapp-adaptiv-v1';
const AUSLASSEN = new Set(['bank', 'u', 'cfg', 'transferPools']);

export function zuJson(wurzel, bank) {
  const ids = new Map(); let n = 0;
  const geh = (v, key) => {
    if (v === null || v === undefined) return v === undefined ? { $u: 1 } : null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : { $n: String(v) };
    if (typeof v !== 'object') return typeof v === 'function' ? { $u: 1 } : v;
    if (v.id != null && v.fam && bank.items.get(v.id) === v) return { $i: v.id };
    if (key === 'pool' && Array.isArray(v)) { const name = Object.keys(bank.pools).find(k => bank.pools[k] === v); if (name) return { $pool: name }; }
    if (ids.has(v)) return { $r: ids.get(v) };
    const nr = n++; ids.set(v, nr);
    if (v instanceof Float64Array) return { $o: nr, $f: Array.from(v, x => Math.round(x * 1e6) / 1e6) };
    if (v instanceof Set) return { $o: nr, $set: [...v].map(x => geh(x)) };
    if (v instanceof Map) return { $o: nr, $map: [...v].map(([a, b]) => [geh(a), geh(b)]) };
    if (Array.isArray(v)) return { $o: nr, $a: v.map(x => geh(x)) };
    const o = { $o: nr };
    for (const k of Object.keys(v)) { if (AUSLASSEN.has(k)) continue; o[k] = geh(v[k], k); }
    return o;
  };
  return geh(wurzel);
}

export function ausJson(daten, bank) {
  const ref = new Map(), fehlend = [];
  const geh = (v) => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(geh);
    if (v.$u) return undefined;
    if (v.$n) return Number(v.$n);
    if (v.$i) { const it = bank.items.get(v.$i); if (!it) fehlend.push(v.$i); return it || null; }
    if (v.$pool) return bank.pools[v.$pool];
    if (v.$r != null) return ref.get(v.$r);
    let out;
    if (v.$f) { out = Float64Array.from(v.$f); ref.set(v.$o, out); return out; }
    if (v.$set) { out = new Set(); ref.set(v.$o, out); for (const x of v.$set) out.add(geh(x)); return out; }
    if (v.$map) { out = new Map(); ref.set(v.$o, out); for (const [a, b] of v.$map) out.set(geh(a), geh(b)); return out; }
    if (v.$a) { out = []; ref.set(v.$o, out); for (const x of v.$a) out.push(geh(x)); return out; }
    out = {}; if (v.$o != null) ref.set(v.$o, out);
    for (const k of Object.keys(v)) if (k !== '$o') { const w = geh(v[k]); if (w !== undefined) out[k] = w; }
    return out;
  };
  const ergebnis = geh(daten);
  // Aufgaben, die es in einer neuen Version nicht mehr gibt, aus Listen entfernen
  if (fehlend.length) entferneNull(ergebnis, new Set());
  return { wert: ergebnis, fehlend };
}
function entferneNull(o, ges) {
  if (!o || typeof o !== 'object' || ges.has(o)) return; ges.add(o);
  if (Array.isArray(o)) { o.forEach(x => entferneNull(x, ges)); return; }
  if (o instanceof Map || o instanceof Set || o instanceof Float64Array) return;
  for (const k of Object.keys(o)) { if (k === 'items' && Array.isArray(o[k])) o[k] = o[k].filter(Boolean); else entferneNull(o[k], ges); }
}

// Objekt einer Klasse wiederherstellen (Prototyp + gespeicherte Felder + Bank/Zufall/Einstellungen)
export function belebe(Klasse, felder, bank, cfg, rngU) {
  const o = Object.create(Klasse.prototype);
  Object.assign(o, felder);
  o.bank = bank; o.cfg = cfg; o.u = rngU;
  if ('leseSkala' in felder) o.transferPools = bank.tpools;
  return o;
}

// ---------- Gerätespeicher ----------
export function lade() {
  try { const s = localStorage.getItem(SCHLUESSEL); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
export function speichere(daten) {
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(daten)); return true; } catch (e) { return false; }
}
export function loescheAlles() { try { localStorage.removeItem(SCHLUESSEL); } catch (e) { /* nichts */ } }

// Dauerhafter Speicher (Safari löscht sonst nach 7 Tagen ohne Besuch, außer bei Homescreen-Apps)
export async function bitteDauerhaft() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const schon = navigator.storage.persisted ? await navigator.storage.persisted() : false;
      return schon || await navigator.storage.persist();
    }
  } catch (e) { /* nicht unterstützt */ }
  return false;
}
export const istHomescreen = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

// ---------- Sicherung als Datei ----------
export function exportiere(daten) {
  const text = JSON.stringify({ app: 'lernapp-adaptiv', version: 1, gespeichert: new Date().toISOString(), daten });
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  const d = new Date();
  a.href = URL.createObjectURL(blob);
  a.download = `lernapp-sicherung-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
export function importiere(datei) {
  return new Promise((ok, fehl) => {
    const r = new FileReader();
    r.onload = () => { try { const j = JSON.parse(r.result); if (j.app !== 'lernapp-adaptiv' || !j.daten) throw new Error('Das ist keine Sicherung dieser App.'); ok(j.daten); } catch (e) { fehl(e); } };
    r.onerror = () => fehl(new Error('Datei konnte nicht gelesen werden.'));
    r.readAsText(datei);
  });
}
