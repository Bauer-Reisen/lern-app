// Verzeichnis aller Vorlagen. Neue Inhalte: Datei in inhalte/ anlegen und hier eintragen (siehe ANLEITUNG-INHALTE.md).
import { RECHNEN } from './rechnen.js';
import { SACH } from './sach.js';
import { GRUND } from './grund.js';
import { LESEN } from './lesen.js';
import { LESETEXTE } from './lesetexte.js';

export const VORLAGEN = [...RECHNEN, ...SACH, ...GRUND, ...LESEN, ...LESETEXTE];
