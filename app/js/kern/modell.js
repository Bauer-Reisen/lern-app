// Rasch-Modell mit fester Ratewahrscheinlichkeit, Gitter-Posterior (EAP), ML mit Zaeunen.
// Reine Funktionen, keine Node-Abhaengigkeit.

export const sig = (z) => 1 / (1 + Math.exp(-z));
export const logit = (p) => Math.log(p / (1 - p));

// Antwortzeit (Befund 1): t zählt ab Ende des Vorlesens; antwortet das Kind schon während des Vorlesens
// (oder kommt das Ende-Ereignis nie), zählt die Zeit ab Erscheinen. tAnz = immer ab Erscheinen.
export function antwortZeit(anzeigeMs, vorleseEndeMs, jetztMs) {
  const tAnz = Math.max(0, (jetztMs - anzeigeMs) / 1000);
  const t = vorleseEndeMs == null || vorleseEndeMs > jetztMs ? tAnz : Math.max(0, (jetztMs - vorleseEndeMs) / 1000);
  return { t, tAnz };
}
// „Geraten" nur, wenn die Antwort ab Ende des Vorlesens UND ab Erscheinen sehr schnell kam.
export const istGeraten = (r, tr) => r.t < tr && !(r.tAnz >= tr);

export function pKorrekt(theta, b, c = 0) {
  return c + (1 - c) * sig(theta - b);
}

// Ziel-Schwierigkeit, damit c + (1-c)*sig(theta-b) = p
export function bFuerZiel(theta, p, c = 0) {
  const q = (p - c) / (1 - c);
  const qq = Math.min(0.995, Math.max(0.005, q));
  return theta - logit(qq);
}

// ---------- Gitter ----------
export function erzeugeGitter(lo, hi, schritt) {
  const n = Math.round((hi - lo) / schritt) + 1;
  const g = new Float64Array(n);
  for (let i = 0; i < n; i++) g[i] = lo + i * schritt;
  return g;
}

export const GITTER_THETA = erzeugeGitter(-4.0, 9.0, 0.02);
export const GITTER_GAMMA = erzeugeGitter(-4.0, 4.0, 0.02);

// Log-Vorannahme N(mu; sd^2) auf dem Gitter
export function logPrior(gitter, mu, sd) {
  const l = new Float64Array(gitter.length);
  const k = 1 / (2 * sd * sd);
  for (let i = 0; i < gitter.length; i++) { const d = gitter[i] - mu; l[i] = -d * d * k; }
  return l;
}

// l(theta) += w * [x ln P + (1-x) ln(1-P)],  P = c + (1-c) sig(theta + off - b)
export function addiereAntwort(l, gitter, b, c, x, w, off = 0) {
  if (w === 0) return;
  for (let i = 0; i < gitter.length; i++) {
    const z = gitter[i] + off - b;
    let lp;
    if (c === 0) {
      // ln sig(z) und ln(1-sig(z)) numerisch stabil
      lp = x ? -softplus(-z) : -softplus(z);
    } else {
      const p = c + (1 - c) / (1 + Math.exp(-z));
      lp = x ? Math.log(p) : Math.log(1 - p);
    }
    l[i] += w * lp;
  }
}

function softplus(z) { return z > 30 ? z : Math.log1p(Math.exp(z)); }

// EAP und Posterior-SD
export function eap(l, gitter) {
  let m = -Infinity;
  for (let i = 0; i < l.length; i++) if (l[i] > m) m = l[i];
  let s = 0, s1 = 0, s2 = 0;
  for (let i = 0; i < l.length; i++) {
    const e = Math.exp(l[i] - m);
    s += e; s1 += e * gitter[i]; s2 += e * gitter[i] * gitter[i];
  }
  const mean = s1 / s;
  return { mean, sd: Math.sqrt(Math.max(1e-12, s2 / s - mean * mean)) };
}

// ML auf dem Gitter mit Zaeunen: Pseudoaufgaben b_min - 3,8 (richtig) und b_max + 3,8 (falsch)
export function mlMitZaun(antworten, gitter, zaun = 3.8) {
  let bmin = Infinity, bmax = -Infinity;
  for (const a of antworten) { if (a.w > 0) { if (a.b < bmin) bmin = a.b; if (a.b > bmax) bmax = a.b; } }
  if (!isFinite(bmin)) return NaN;
  const l = new Float64Array(gitter.length);
  for (const a of antworten) if (a.w > 0) addiereAntwort(l, gitter, a.b, a.c, a.x, a.w, a.off || 0);
  addiereAntwort(l, gitter, bmin - zaun, 0, 1, 1);
  addiereAntwort(l, gitter, bmax + zaun, 0, 0, 1);
  let best = 0;
  for (let i = 1; i < l.length; i++) if (l[i] > l[best]) best = i;
  return gitter[best];
}

// Fisher-Information einer Antwort am Punkt theta (mit Ratewahrscheinlichkeit)
export function information(theta, b, c = 0) {
  const s = sig(theta - b);
  const p = c + (1 - c) * s;
  const dp = (1 - c) * s * (1 - s);
  return (dp * dp) / (p * (1 - p));
}
