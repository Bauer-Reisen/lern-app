// Die Welten der Kinder als SVG. Neue Dinge erscheinen nur bei Mess-Ereignissen (Expedition fertig, Knoten sicher).
export const FUCHS = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#fff3e0"/><path d="M22 30 L35 52 L50 44 L65 52 L78 30 L70 62 Q50 86 30 62 Z" fill="#e8742a"/><path d="M38 64 Q50 78 62 64 Q50 70 38 64Z" fill="#fff"/><circle cx="41" cy="55" r="4" fill="#222"/><circle cx="59" cy="55" r="4" fill="#222"/><circle cx="50" cy="66" r="3.5" fill="#222"/><path d="M22 30 L30 44 L35 40Z M78 30 L70 44 L65 40Z" fill="#7a3510"/></svg>`;
export const TELESKOP = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#262d63"/><circle cx="22" cy="24" r="2" fill="#fff"/><circle cx="76" cy="18" r="2.5" fill="#ffe680"/><circle cx="84" cy="44" r="1.6" fill="#fff"/><path d="M30 60 L70 34 L76 44 L36 70Z" fill="#cfd6ff"/><path d="M70 34 L82 27 L88 37 L76 44Z" fill="#f5c542"/><path d="M50 56 L40 84 M50 56 L60 84 M50 56 L50 86" stroke="#cfd6ff" stroke-width="4" stroke-linecap="round"/></svg>`;

const DINGE_R = [
  '<g transform="translate(70 128)"><path d="M0 0 l10 -34 l10 34Z" fill="#2e7d4f"/><rect x="8" y="0" width="4" height="8" fill="#7a4a1d"/></g>',
  '<g transform="translate(220 120)"><rect x="0" y="0" width="26" height="18" fill="#c9773a"/><path d="M-3 0 L13 -12 L29 0Z" fill="#a13b2a"/></g>',
  '<g transform="translate(150 70)"><circle r="7" fill="#ffd54a"/></g>',
  '<g transform="translate(255 138)"><path d="M0 0 q8 -14 16 0" stroke="#e84f8a" stroke-width="3" fill="none"/><circle cx="8" cy="-6" r="3" fill="#ffd54a"/></g>',
  '<g transform="translate(105 140)"><ellipse rx="10" ry="5" fill="#8d6e63"/><path d="M-4 -4 l4 -12 l4 12" fill="#fff"/></g>',
  '<g transform="translate(40 150)"><path d="M0 0 c4 -10 12 -10 16 0" fill="#4fc3f7"/></g>',
  '<g transform="translate(190 60)"><path d="M0 0 l6 -4 l6 4 l6 -4" stroke="#455a64" stroke-width="2" fill="none"/></g>',
  '<g transform="translate(130 120)"><rect x="0" y="-26" width="4" height="26" fill="#6d4c41"/><path d="M4 -26 l16 6 l-16 6Z" fill="#e8742a"/></g>',
];
const DINGE_I = [
  '<circle cx="60" cy="40" r="3" fill="#fff6c0"/>', '<circle cx="250" cy="30" r="3.5" fill="#ffe680"/>', '<circle cx="200" cy="70" r="2.5" fill="#fff"/>',
  '<path d="M90 60 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1z" fill="#f5c542"/>', '<circle cx="280" cy="80" r="9" fill="#b0bec5"/><circle cx="283" cy="77" r="2" fill="#90a4ae"/>',
  '<path d="M150 30 l40 14" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>', '<ellipse cx="40" cy="80" rx="14" ry="4" fill="none" stroke="#ffcc80" stroke-width="2"/><circle cx="40" cy="80" r="6" fill="#ff8a65"/>',
  '<path d="M230 100 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1z" fill="#80deea"/>',
];

export function weltSvg(kind, anzahl) {
  if (kind === 'insel') {
    const dinge = DINGE_R.slice(0, Math.min(anzahl, DINGE_R.length)).join('');
    return `<svg viewBox="0 0 320 180" role="img" aria-label="Die Insel"><rect width="320" height="180" fill="#9be3f7"/><rect y="120" width="320" height="60" fill="#3fb7c9"/><ellipse cx="160" cy="140" rx="140" ry="32" fill="#f4d58d"/><ellipse cx="160" cy="132" rx="110" ry="22" fill="#8bc34a"/><g transform="translate(150 98) scale(.42)">${FUCHS.replace('<svg viewBox="0 0 100 100" aria-hidden="true">', '').replace('</svg>', '')}</g>${dinge}</svg>`;
  }
  const dinge = DINGE_I.slice(0, Math.min(anzahl, DINGE_I.length)).join('');
  return `<svg viewBox="0 0 320 180" role="img" aria-label="Die Sternwarte"><rect width="320" height="180" fill="#141a3a"/><circle cx="20" cy="20" r="1.2" fill="#fff"/><circle cx="120" cy="16" r="1" fill="#fff"/><circle cx="300" cy="50" r="1.2" fill="#fff"/><path d="M0 150 q160 -40 320 0 v30 h-320z" fill="#232b5c"/><path d="M130 150 v-40 a30 30 0 0 1 60 0 v40z" fill="#3b4590"/><path d="M160 80 l30 -18 l5 9 l-30 18z" fill="#cfd6ff"/>${dinge}</svg>`;
}
