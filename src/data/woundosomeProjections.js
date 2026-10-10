// Approximate projected wound locations on the reference left-foot angiograms.
// These are selectable location markers, not fixed angiosome boundaries or a
// claim about perfusion in the reference case. Medial/lateral tissues overlap
// in a lateral projection; dorsal/plantar tissues overlap in an AP projection.
export const WOUND_PROJECTIONS = [
  {
    id: 'ap',
    label: 'AP (dorsoplantar)',
    width: 382,
    height: 500,
    locations: {
      'dorsal-toes': { x: 237, y: 365, rx: 92, ry: 42, rotate: -40, marker: [268, 372] },
      'hallux-first-ray': { x: 332, y: 292, rx: 36, ry: 59, rotate: 36 },
      dorsum: { x: 236, y: 185, rx: 76, ry: 81, rotate: -20 },
      'lateral-ankle': { x: 108, y: 126, rx: 32, ry: 52, rotate: -8 },
      'plantar-toes': { x: 237, y: 365, rx: 92, ry: 42, rotate: -40, marker: [161, 448] },
      'medial-plantar': { x: 285, y: 257, rx: 35, ry: 76, rotate: -24 },
      'lateral-plantar': { x: 150, y: 284, rx: 32, ry: 83, rotate: 7 },
    },
  },
  {
    id: 'lateral',
    label: 'Lateral',
    width: 488,
    height: 500,
    locations: {
      'dorsal-toes': { x: 433, y: 429, rx: 48, ry: 38, rotate: 40, marker: [448, 431] },
      'hallux-first-ray': { x: 447, y: 471, rx: 36, ry: 20, rotate: 20 },
      dorsum: { x: 374, y: 311, rx: 35, ry: 74, rotate: -25 },
      'lateral-ankle': { x: 319, y: 174, rx: 32, ry: 43, rotate: -12 },
      'plantar-toes': { x: 403, y: 471, rx: 44, ry: 20, rotate: 20, marker: [384, 479] },
      'medial-plantar': { x: 284, y: 354, rx: 70, ry: 27, rotate: 38 },
      'lateral-plantar': { x: 260, y: 400, rx: 77, ry: 28, rotate: 39 },
      'medial-heel': { x: 78, y: 306, rx: 51, ry: 54, marker: [49, 274] },
      'lateral-heel': { x: 78, y: 306, rx: 51, ry: 54, marker: [112, 344] },
    },
  },
];
