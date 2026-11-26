// Seed-basierter Zufall (reproduzierbar). Keine Node-Abhaengigkeit.
// sfc32 mit Seed-Mischung ueber splitmix32.

function splitmix32(a) {
  return function () {
    a |= 0; a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15); t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0);
  };
}

export function erzeugeRng(seed) {
  const sm = splitmix32(seed >>> 0);
  let a = sm(), b = sm(), c = sm(), d = sm();
  let spare = null;
  function u() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
  function n(mu = 0, sd = 1) {
    if (spare !== null) { const s = spare; spare = null; return mu + sd * s; }
    let x, y, r;
    do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0);
    const f = Math.sqrt(-2 * Math.log(r) / r);
    spare = y * f;
    return mu + sd * x * f;
  }
  return {
    u,
    n,
    gleich: (lo, hi) => lo + (hi - lo) * u(),
    ganz: (k) => Math.floor(u() * k),
    bern: (p) => u() < p,
    waehle: (arr) => arr[Math.floor(u() * arr.length)],
  };
}

// Abgeleiteter Seed (z. B. je Lauf, je Zelle)
export function mischSeed(...teile) {
  let h = 2166136261 >>> 0;
  for (const t of teile) {
    const s = String(t);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= 0x5bd1e995; h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
