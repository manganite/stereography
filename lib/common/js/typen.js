// Gemeinsame Typen der App-Familie für die Typprüfung (JSDoc, tsconfig.json; LEITFADEN.md, Abschn. 9).
// Nur Typen, kein Laufzeitcode; der Browser lädt diese Datei nie. Einbinden in einer App:
//
//   /** @import { Vec3, Mat3, Richtung, Normale } from '../lib/common/js/typen.js' */
//
// Vektoren und Matrizen sind Arrays fester Länge; Matrizen zeilenweise ([[a, b, c], [d, e, f], [g, h, i]]).
//
// Gekennzeichnete Typen (Richtung, Normale, Grad, Bogenmass, Fraktional, Kartesisch) unterscheiden Werte gleicher
// Form, die man leicht vertauscht. Sie tragen eine Kennzeichnung, die es nur für die Typprüfung gibt. Ein solcher
// Wert ist überall verwendbar, wo die Grundform verlangt ist (eine Richtung ist ein Vec3); umgekehrt braucht es
// eine ausdrückliche Umwandlung an der Stelle, an der die Bedeutung feststeht:
//
//   const n = /** @type {Normale} */ ([1, 1, 0]);
//   const phi = /** @type {Grad} */ (Number(params.get('phi')));
//
// Rechnen mit gekennzeichneten Werten ergibt wieder die Grundform (Grad + Grad ist eine Zahl).

export {};

/** Vektor in der Ebene. @typedef {[number, number]} Vec2 */
/** Vektor im Raum. @typedef {[number, number, number]} Vec3 */
/** 2×2-Matrix, zeilenweise. @typedef {[Vec2, Vec2]} Mat2 */
/** 3×3-Matrix, zeilenweise. @typedef {[Vec3, Vec3, Vec3]} Mat3 */

/** Richtung [uvw]: Komponenten bezüglich der Gittervektoren a, b, c. @typedef {Vec3 & { readonly __art: 'richtung' }} Richtung */
/** Flächennormale (hkl): Millersche Indizes, Komponenten bezüglich des reziproken Gitters. @typedef {Vec3 & { readonly __art: 'normale' }} Normale */

/** Winkel in Grad. @typedef {number & { readonly __einheit: 'grad' }} Grad */
/** Winkel im Bogenmass. @typedef {number & { readonly __einheit: 'bogenmass' }} Bogenmass */

/**
 * Koordinaten bezüglich der Gittervektoren (Bruchkoordinaten).
 * @template {Vec2 | Vec3} V
 * @typedef {V & { readonly __koord: 'fraktional' }} Fraktional
 */
/**
 * Kartesische Koordinaten (orthonormale Achsen).
 * @template {Vec2 | Vec3} V
 * @typedef {V & { readonly __koord: 'kartesisch' }} Kartesisch
 */
