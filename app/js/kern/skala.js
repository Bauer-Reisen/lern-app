// Skala Lernstufe (LS = Klasse x 10) <-> Logit, Schiedsspruch §2(d).
// Reine Funktionen, direkt in die App uebernehmbar.

export const LS_STUETZ = [10, 20, 30, 40, 50, 60, 70, 80, 90];
export const THETA_STUETZ = {
  M: [0, 1.14, 2.17, 3.06, 3.58, 4.14, 4.55, 4.85, 5.17], // Mathe: RE, SA, TM, GA
  L: [0, 1.52, 2.49, 3.09, 3.45, 3.85, 4.17, 4.40, 4.66], // Lesen: LV, HV
};
const STEIGUNG_UNTEN = { M: 0.114, L: 0.152 };
const STEIGUNG_OBEN = { M: 0.032, L: 0.026 };

export function bereichVonSkala(skala) {
  return (skala === 'LV' || skala === 'HV') ? 'L' : 'M';
}

// theta(LS) mit Skalenfaktor lambda (theta(10) = 0, also theta_lambda = lambda * theta)
export function lsZuTheta(ls, bereich, lambda = 1) {
  const th = THETA_STUETZ[bereich];
  let t;
  if (ls <= 10) t = th[0] + (ls - 10) * STEIGUNG_UNTEN[bereich];
  else if (ls >= 90) t = th[8] + (ls - 90) * STEIGUNG_OBEN[bereich];
  else {
    const i = Math.floor((ls - 10) / 10);
    const f = (ls - LS_STUETZ[i]) / 10;
    t = th[i] + f * (th[i + 1] - th[i]);
  }
  return th[0] + lambda * (t - th[0]);
}

export function thetaZuLs(theta, bereich, lambda = 1) {
  const th = THETA_STUETZ[bereich];
  const t = th[0] + (theta - th[0]) / lambda;
  if (t <= th[0]) return 10 + (t - th[0]) / STEIGUNG_UNTEN[bereich];
  if (t >= th[8]) return 90 + (t - th[8]) / STEIGUNG_OBEN[bereich];
  for (let i = 0; i < 8; i++) {
    if (t <= th[i + 1]) return LS_STUETZ[i] + 10 * (t - th[i]) / (th[i + 1] - th[i]);
  }
  return 90;
}

// Erwartete Lernstufe am Datum: LS_K = 10*Klasse + 10*min(1; M/10,5), M = Monate seit 15.09.
export function lsKlasse(klasse, datum) {
  const j = datum.getUTCMonth() >= 8 ? datum.getUTCFullYear() : datum.getUTCFullYear() - 1;
  const start = Date.UTC(j, 8, 15);
  const monate = Math.max(0, (datum.getTime() - start) / (86400000 * 30.4375));
  return 10 * klasse + 10 * Math.min(1, monate / 10.5);
}

// Elternwort: "etwa Mitte 3. Klasse"
export function elternwort(ls) {
  const k = Math.floor(ls / 10);
  const rest = ls - 10 * k;
  const teil = rest < 3.4 ? 'Anfang' : rest < 6.7 ? 'Mitte' : 'Ende';
  if (k < 1) return 'vor der 1. Klasse';
  return `etwa ${teil} ${k}. Klasse`;
}
