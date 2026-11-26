// Grundaufgaben-Abruf (Skala GA): 8 Tempo-Knoten mit je 2 Familien. Hier zählt, ob abgerufen statt abgezählt wird
// (richtig und schneller als Tipp-Grundwert + 2,0 s im Insel-Profil / + 1,5 s im Sternwarte-Profil).
// Lernstufen nach recherche/3 (Z03, Z04, Z05, Z09, Z10).
export const GA_KNOTEN = [
  { k: 0, ls: 10, titel: 'Plus bis 5 und Zerlegen bis 5' },
  { k: 1, ls: 13, titel: 'Plus bis 10' },
  { k: 2, ls: 14.5, titel: 'Minus bis 10' },
  { k: 3, ls: 16, titel: 'Verdoppeln und Halbieren' },
  { k: 4, ls: 19, titel: 'Plus mit Zehnerübergang' },
  { k: 5, ls: 20.5, titel: 'Minus mit Zehnerübergang' },
  { k: 6, ls: 25, titel: 'Einmaleins mit 1, 2, 5, 10' },
  { k: 7, ls: 29, titel: 'Ganzes Einmaleins, auch geteilt' },
];
const R = (text, ausdruck, wert) => ({ text, antwort: wert, art: 'zahl', pruef: { ausdruck }, hinweis: 'Versuch, das Ergebnis zu wissen, ohne zu zählen.', erklaerung: `${text.replace('?', String(wert))}` });

export const GRUND = [
  { id: 'ga.0a', skala: 'GA', knoten: 0, titel: 'Plus bis 5', anker: ['a'], stufen: [{ id: 'a' }], erzeuge(r) { const s = r.zahl(2, 5), a = r.zahl(1, s - 1); return R(`${a} + ${s - a} = ?`, `${a}+${s - a}`, s); } },
  { id: 'ga.0b', skala: 'GA', knoten: 0, titel: 'Zerlegen bis 5', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const s = r.zahl(3, 5), a = r.zahl(1, s - 1); return R(`${s} = ${a} + ?`, `${s}-${a}`, s - a); } },
  { id: 'ga.1a', skala: 'GA', knoten: 1, titel: 'Plus bis 10', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const s = r.zahl(6, 10), a = r.zahl(1, s - 1); return R(`${a} + ${s - a} = ?`, `${a}+${s - a}`, s); } },
  { id: 'ga.1b', skala: 'GA', knoten: 1, titel: 'Ergänzen bis 10', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(1, 9); return R(`${a} + ? = 10`, `10-${a}`, 10 - a); } },
  { id: 'ga.2a', skala: 'GA', knoten: 2, titel: 'Minus bis 10', anker: ['a'], stufen: [{ id: 'a' }], erzeuge(r) { const s = r.zahl(4, 10), a = r.zahl(1, s - 1); return R(`${s} − ${a} = ?`, `${s}-${a}`, s - a); } },
  { id: 'ga.2b', skala: 'GA', knoten: 2, titel: 'Von 10 abziehen', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(1, 9); return R(`10 − ${a} = ?`, `10-${a}`, 10 - a); } },
  { id: 'ga.3a', skala: 'GA', knoten: 3, titel: 'Verdoppeln', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(2, 10); return R(`${a} + ${a} = ?`, `${a}+${a}`, 2 * a); } },
  { id: 'ga.3b', skala: 'GA', knoten: 3, titel: 'Halbieren', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(2, 10); return { ...R(`Die Hälfte von ${2 * a} = ?`, `${2 * a}/2`, a), sprech: `Was ist die Hälfte von ${2 * a}?` }; } },
  { id: 'ga.4a', skala: 'GA', knoten: 4, titel: 'Plus über 10', anker: ['a'], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(3, 9), b = r.zahl(11 - a, 9); return R(`${a} + ${b} = ?`, `${a}+${b}`, a + b); } },
  { id: 'ga.4b', skala: 'GA', knoten: 4, titel: 'Zehner plus Einer', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(1, 9); return R(`10 + ${a} = ?`, `10+${a}`, 10 + a); } },
  { id: 'ga.5a', skala: 'GA', knoten: 5, titel: 'Minus über 10', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(3, 9), b = r.zahl(11 - a, 9); return R(`${a + b} − ${b} = ?`, `${a + b}-${b}`, a); } },
  { id: 'ga.5b', skala: 'GA', knoten: 5, titel: 'Minus bis 20 ohne Übergang', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(12, 19), b = r.zahl(1, a - 11); return R(`${a} − ${b} = ?`, `${a}-${b}`, a - b); } },
  { id: 'ga.6a', skala: 'GA', knoten: 6, titel: 'Mal 2, 5, 10', anker: ['a'], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.waehle([2, 5, 10]), b = r.zahl(1, 10); return R(`${b} · ${a} = ?`, `${b}*${a}`, a * b); } },
  { id: 'ga.6b', skala: 'GA', knoten: 6, titel: 'Quadratzahlen bis 10 · 10', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(2, 10); return R(`${a} · ${a} = ?`, `${a}*${a}`, a * a); } },
  { id: 'ga.7a', skala: 'GA', knoten: 7, titel: 'Einmaleins 3, 4, 6, 7, 8, 9', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.waehle([3, 4, 6, 7, 8, 9]), b = r.zahl(2, 10); return R(`${b} · ${a} = ?`, `${b}*${a}`, a * b); } },
  { id: 'ga.7b', skala: 'GA', knoten: 7, titel: 'Geteilt im Einmaleins', anker: [], stufen: [{ id: 'a' }], erzeuge(r) { const a = r.zahl(2, 9), b = r.zahl(2, 10); return R(`${a * b} : ${a} = ?`, `${a * b}/${a}`, b); } },
];
