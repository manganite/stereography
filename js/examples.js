// Beispielkristalle: Kombinationen mehrerer Formen derselben Punktgruppe, wie sie in der Vorlesung
// und den Lehrbüchern vorkommen. hkl mit drei Indizes (hexagonal: h k l, i = −(h+k)).
// r: Zentralabstand der Flächen (relativ; nur die Verhältnisse zählen), oder
// t: Lage über die Achsenabschnitte, Fläche h·x/a + k·y/b + l·z/c = t (t = 1: Einheitsfläche).
// Die Abstände bestimmen den Habitus und sind nach den Abbildungen gewählt, nicht gemessen;
// Formen und Gitter sind belegt, sofern nicht anders vermerkt.
// lat: Gitterparameter (a = 1) wie in polyhedra.js; fehlende Werte vom System.

export const EXAMPLES = [
  {
    id: 'galenit', name: 'Galenit', formula: 'PbS', sys: 'kubisch', pg: 'm-3m',
    forms: [
      { hkl: [1, 0, 0], r: 1 },
      { hkl: [1, 1, 1], r: 1.45 },
      { hkl: [1, 1, 0], r: 1.3 },
    ],
    src: 'Borchardt-Ott & Sowa, Abb. 5.1 und 9.4',
  },
  {
    id: 'pyrit', name: 'Pyrit', formula: 'FeS₂', sys: 'kubisch', pg: 'm-3',
    forms: [
      { hkl: [1, 0, 0], r: 1 },
      { hkl: [2, 1, 0], r: 1.08 },
    ],
    src: 'Hoffmann, S. 36–37 (Würfel, Pentagondodekaeder)',
    note: 'Der Würfel hat hier nur die Flächensymmetrie mm2 (nicht 4mm wie beim Galenit); sichtbar mit „Flächensymmetrie zeigen“.',
  },
  {
    id: 'dipyramiden', name: 'Zwei tetragonale Dipyramiden', sys: 'tetragonal', pg: '4/mmm',
    lat: { ca: 2 },
    forms: [
      { hkl: [1, 1, 1], t: 1 },  // Einheitsfläche: Abschnitte 1a, 1b, 1c
      { hkl: [1, 1, 3], t: 2 },  // Abschnitte 2a, 2b, 2/3 c
    ],
    src: 'Hoffmann, Abb. 2.22 und 2.23, S. 51 (c/a nach der Abbildung geschätzt)',
    note: 'Die Fläche (113) schneidet die Achsen bei 2a, 2b und ⅔c. Die Kehrwerte ½, ½, ³⁄₂ ergeben ganzzahlig (113).',
  },
  {
    id: 'rutil', name: 'Rutil', formula: 'TiO₂', sys: 'tetragonal', pg: '4/mmm',
    lat: { ca: 0.64 },
    forms: [
      { hkl: [1, 1, 0], r: 1 },
      { hkl: [1, 0, 0], r: 1.12 },
      { hkl: [1, 1, 1], r: 1.6 },
    ],
    src: 'Borchardt-Ott & Sowa, S. 159; Gitter a = 4,59 Å, c = 2,96 Å',
  },
  {
    id: 'mm2', name: 'Rhombisch-pyramidaler Kristall', sys: 'orthorhombisch', pg: 'mm2',
    lat: { ba: 1.3, ca: 1.2 },
    forms: [
      { hkl: [0, 0, -1], r: 0.7 },  // Pedion unten
      { hkl: [4, 0, 1], r: 0.6 },   // Doma, steil (vorn/hinten)
      { hkl: [0, 4, 1], r: 1 },     // Doma, steil (seitlich)
      { hkl: [0, 1, 1], r: 1.35 },  // Doma, flacher (seitlich oben)
      { hkl: [1, 1, 1], r: 1.15 },  // rhombische Pyramide (Ecken oben)
      { hkl: [0, 0, 1], r: 1.2 },   // Pedion oben
    ],
    src: 'nach Hoffmann, Abb. 3.27 und 3.28, S. 113–114 (Formen aus der Abbildung rekonstruiert)',
    note: 'Die Pedien {001} und {00<span class="ov">1</span>} sind verschiedene Formen: Die 2-zählige Achse ist polar, oben und unten sind nicht symmetrieäquivalent.',
  },
  {
    id: 'topas', name: 'Topas', formula: 'Al₂SiO₄(F,OH)₂', sys: 'orthorhombisch', pg: 'mmm',
    lat: { ba: 1.89, ca: 1.81 },
    forms: [
      { hkl: [1, 1, 0], r: 1 },
      { hkl: [1, 2, 0], r: 1.06 },
      { hkl: [0, 0, 1], r: 2.04 },
      { hkl: [0, 1, 1], r: 1.83 },
      { hkl: [0, 2, 1], r: 1.49 },
      { hkl: [1, 0, 1], r: 1.45 },
      { hkl: [1, 1, 1], r: 1.45 },
      { hkl: [1, 1, 2], r: 1.78 },
    ],
    src: 'Borchardt-Ott & Sowa, Tab. 5.1 und Abb. 5.28; a : b : c = 0,529 : 1 : 0,954',
  },
  {
    id: 'gips', name: 'Gips', formula: 'CaSO₄ · 2 H₂O', sys: 'monoklin', pg: '2/mb',
    lat: { ba: 2.67, ca: 1.11, be: 113.8 },
    forms: [
      { hkl: [0, 1, 0], r: 0.4 },
      { hkl: [1, 2, 0], r: 1 },
      { hkl: [1, 1, 1], r: 1 },
    ],
    src: 'Hoffmann, Abb. 3.22–3.25, S. 110–112; Formen und Gitter (A2/a: a = 5,68 Å, b = 15,18 Å, c = 6,29 Å, β = 113,8°) nach webmineral.com, auf das Hoffmann verweist',
  },
  {
    id: 'triklin', name: 'Triklin-pinakoidaler Kristall', sys: 'triklin', pg: '-1',
    forms: [
      { hkl: [0, 0, 1], r: 0.55 },
      { hkl: [1, 0, 0], r: 1 },
      { hkl: [0, 1, 0], r: 0.8 },
      { hkl: [1, -1, 0], r: 0.95 },
    ],
    src: 'nach Hoffmann, Abb. 3.20 und 3.21, S. 109–110 (Formen aus der Abbildung rekonstruiert)',
    note: 'Alle Formen sind Pinakoide: Das Inversionszentrum ist das einzige Symmetrieelement, jede Fläche hat nur ihre Gegenfläche als Partner.',
  },
  {
    id: 'magnesium', name: 'Magnesium', formula: 'Mg', sys: 'hexagonal', pg: '6/mmm',
    lat: { ca: 1.62 },
    forms: [
      { hkl: [0, 0, 1], r: 15 },
      { hkl: [1, 0, 0], r: 8 },
      { hkl: [1, 0, 1], r: 11 },
    ],
    src: 'Hoffmann, S. 125–126 („Nano-Weinfass“, Abstände 15, 8 und 11 Å)',
  },
  {
    id: 'quarz', name: 'Linksquarz', formula: 'SiO₂', sys: 'trigonal', pg: '321',
    lat: { ca: 1.1 },
    forms: [
      { hkl: [1, 0, 0], r: 1 },      // m, hexagonales Prisma {10-10}
      { hkl: [1, 0, 1], r: 1.33 },   // r, positives Rhomboeder (Hauptrhomboeder) {10-11}
      { hkl: [0, 1, 1], r: 1.44 },   // z, negatives Rhomboeder {01-11}
      { hkl: [2, -1, 1], r: 1.33 },  // s, linke trigonale Dipyramide {2-1-11}
      { hkl: [6, -1, 1], r: 1.12 },  // x, linkes trigonales Trapezoeder {6-1-51}
    ],
    src: 'Formen und Händigkeit nach Wikipedia „Quarz“ (Morphologie); Raumgruppe P3₁21; Gitter a = 4,91 Å, c = 5,40 Å',
    note: 'Beim Linksquarz liegen die Flächen der trigonalen Dipyramide und des Trapezoeders links von den Flächen des Hauptrhomboeders {10-11} (Blick auf eine Prismenfläche, c nach oben). Dipyramide und Trapezoeder gibt es in 32 je als linke und rechte Form; ein unverzwillingter Kristall zeigt nur eine Sorte. Vergleiche „Rechtsquarz“.',
  },
  {
    id: 'rechtsquarz', name: 'Rechtsquarz', formula: 'SiO₂', sys: 'trigonal', pg: '321',
    lat: { ca: 1.1 },
    forms: [
      { hkl: [1, 0, 0], r: 1 },      // m, hexagonales Prisma {10-10}
      { hkl: [1, 0, 1], r: 1.33 },   // r, positives Rhomboeder (Hauptrhomboeder) {10-11}
      { hkl: [0, 1, 1], r: 1.44 },   // z, negatives Rhomboeder {01-11}
      { hkl: [1, 1, 1], r: 1.33 },   // s, rechte trigonale Dipyramide {11-21}
      { hkl: [5, 1, 1], r: 1.12 },   // x, rechtes trigonales Trapezoeder {51-61}
    ],
    src: 'Formen und Händigkeit nach Wikipedia „Quarz“ (Morphologie); Raumgruppe P3₂21; Gitter a = 4,91 Å, c = 5,40 Å',
    note: 'Beim Rechtsquarz liegen die Flächen der trigonalen Dipyramide und des Trapezoeders rechts von den Flächen des Hauptrhomboeders {10-11} (Blick auf eine Prismenfläche, c nach oben); das Stereogramm ist das Spiegelbild des Linksquarzes. Vergleiche „Linksquarz“.',
  },
  {
    id: 'turmalin', name: 'Turmalin', sys: 'trigonal', pg: '3m1',
    lat: { ca: 0.45 },
    forms: [
      { hkl: [1, 0, 0], r: 1 },     // trigonales Prisma {10-10}
      { hkl: [1, 1, 0], r: 1.32 },  // hexagonales Prisma {11-20}
      { hkl: [1, 0, 1], r: 1.8 },   // oben: trigonale Pyramide {10-11}
      { hkl: [0, 2, 1], r: 1.83 },   // oben: trigonale Pyramide {02-21}
      { hkl: [0, 0, -1], r: 1.84 },  // unten: Pedion {000-1}
      { hkl: [1, 0, -1], r: 1.92 },  // unten: trigonale Pyramide {10-1-1}
    ],
    src: 'Borchardt-Ott & Sowa, Tab. 9.4 Nr. 19 (Punktgruppe 3m); Formen aus der Abbildung rekonstruiert, abgeglichen mit webmineral.com (Schorl, R3m: a = 15,99 Å, c = 7,20 Å)',
    note: 'Hemimorph: Oben und unten treten verschiedene Formen auf, weil 3m keine Spiegelebene ⊥ c und kein Inversionszentrum hat. Die 3-zählige Achse ist polar (Pyroelektrizität).',
  },
];

export const exampleById = (id) => EXAMPLES.find((x) => x.id === id) || null;
