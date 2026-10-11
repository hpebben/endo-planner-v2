// Anatomical basis: Manzi et al., RadioGraphics 2011;31:1623–1636,
// doi:10.1148/rg.316115511, Figs 2–7. Image coordinates refer to the
// unmirrored LEFT-foot panels in Patrone et al. (2024), Fig. 3B and 3A.
// In this AP panel the hallux is lower-left and the fifth ray is upper-right.
// Markers locate wounds, not proven perfusion territories. Dorsal/plantar
// surfaces superimpose in AP; medial/lateral heel surfaces superimpose laterally.
// The lateral panel crops the toes, so it must not pretend to locate the hallux.
const heelProjection = { x: 82, y: 307, rx: 63, ry: 49, rotate: 12 };

export const WOUND_PROJECTIONS = [
  {
    id: 'ap',
    label: 'AP · left foot',
    width: 382,
    height: 500,
    orientation: 'Hallux / first ray = medial; fifth ray = lateral. Dorsal and plantar surfaces overlap in AP. Use the lateral view for ankle and heel wounds.',
    landmarks: [
      { id: 'hallux', label: 'Hallux · medial', anchor: [193, 470], box: [12, 399, 128, 28] },
      { id: 'fifth-ray', label: '5th ray · lateral', anchor: [367, 298], box: [240, 391, 132, 28] },
    ],
    locations: {
      'dorsal-toes': { x: 288, y: 302, rx: 64, ry: 29, rotate: -39, marker: [302, 310] },
      'hallux-first-ray': { x: 180, y: 426, rx: 35, ry: 61, rotate: -18, marker: [184, 456] },
      dorsum: { x: 217, y: 163, rx: 62, ry: 77, rotate: -24, marker: [207, 164] },
      'plantar-toes': { x: 288, y: 302, rx: 64, ry: 29, rotate: -39, marker: [253, 357] },
      'medial-plantar': { x: 117, y: 232, rx: 27, ry: 68, rotate: 2 },
      'lateral-plantar': { x: 294, y: 179, rx: 33, ry: 71, rotate: -32, marker: [316, 188] },
    },
  },
  {
    id: 'lateral',
    label: 'Lateral · left foot',
    width: 488,
    height: 500,
    orientation: 'Medial and lateral heel wounds project onto the same heel: 8 and 9 are callouts, not separate territories in this view. The toes are outside this image; use AP or the color key for forefoot and instep wounds.',
    landmarks: [
      { id: 'dorsal', label: 'Dorsal', anchor: [420, 343], box: [358, 202, 91, 28] },
      { id: 'plantar', label: 'Plantar', anchor: [277, 386], box: [308, 438, 92, 28] },
    ],
    locations: {
      dorsum: { x: 374, y: 315, rx: 30, ry: 74, rotate: -27, marker: [414, 278] },
      'lateral-ankle': { x: 252, y: 177, rx: 55, ry: 46, rotate: -12, marker: [392, 120] },
      'medial-heel': { ...heelProjection, marker: [46, 409], markerLabel: 'Medial heel' },
      'lateral-heel': { ...heelProjection, marker: [120, 453], markerLabel: 'Lateral heel' },
    },
  },
];
