// Kleine Bausteine für die Oberfläche.
import { z, sichere } from './zustand.js';
import { sprich, stopp } from './sprache.js';

export function h(tag, attr, ...kinder) {
  const el = document.createElement(tag);
  if (attr) for (const k of Object.keys(attr)) {
    const v = attr[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
    else if (k === 'style') el.setAttribute('style', v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kinder.flat ? kinder.flat(3) : kinder) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return el;
}
export const knopf = (text, klick, klasse = '', extra = {}) => h('button', Object.assign({ class: klasse, onclick: klick, type: 'button' }, extra), text);

const wurzel = () => document.getElementById('app');
export function zeige(...inhalt) {
  stopp();
  const w = wurzel();
  w.innerHTML = '';
  for (const c of inhalt) if (c) w.appendChild(c);
  window.scrollTo(0, 0);
}
export function welt(kind) { document.body.className = kind ? 'welt-' + kind : 'eltern'; }

// Vorlese-Knopf
export const vorleseKnopf = (text) => h('button', { class: 'vorlesen', type: 'button', 'aria-label': 'Vorlesen', onclick: () => sprich(text) }, '🔊');

// Dialog (modal)
export function dialog(titel, inhalt, knoepfe) {
  return new Promise((ok) => {
    const s = h('div', { class: 'schleier', role: 'dialog', 'aria-modal': 'true' });
    const zu = (wert) => { s.remove(); ok(wert); };
    const d = h('div', { class: 'dialog' }, titel ? h('h2', { text: titel }) : null, inhalt,
      h('div', { class: 'unten' }, ...(knoepfe || [{ text: 'OK', wert: true }]).map(k => knopf(k.text, () => zu(k.wert), k.klasse || ''))));
    s.appendChild(d);
    document.body.appendChild(s);
  });
}
// Einmal-Erklärung: erscheint, bis sie weggetippt wird
export function einmal(schluessel, text) {
  const Z = z();
  if (Z.gesehen.hinweise[schluessel]) return null;
  const box = h('div', { class: 'einmal' }, h('div', { style: 'flex:1' }, text), knopf('Verstanden', () => { Z.gesehen.hinweise[schluessel] = true; sichere(); box.remove(); }, 'zweit'));
  return box;
}
export function prozent(x) { return Math.round(100 * x) + ' %'; }
export const zeitText = (sek) => (sek < 90 ? `${Math.round(sek)} s` : `${Math.round(sek / 60)} Min.`);
