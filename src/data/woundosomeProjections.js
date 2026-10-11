import { FOOT_RAYS, FOOT_VIEWS, projectFootPoint } from './footArterialModel';

// Wounds are surface locations, not vessel paths or sharp perfusion boundaries.
// Project the same surface coordinates as the original patent arterial model.
// Dorsal/plantar locations overlap in AP; heel surfaces overlap laterally.
const location = (point, viewId, rx, ry, options = {}) => {
  const [x, y] = projectFootPoint(point, viewId);
  return { x, y, rx, ry, ...options };
};
const heel = location([0, 12, 18], 'lateral', 42, 37, { rotate: 25 });

export const WOUND_PROJECTIONS = [
  {
    id: 'ap',
    label: 'AP (dorsoplantar) · left foot',
    width: FOOT_VIEWS.ap.width,
    height: FOOT_VIEWS.ap.height,
    orientation: 'Hallux / first ray = medial; fifth ray = lateral. Dorsal and plantar surfaces overlap in AP; use the lateral oblique view to distinguish their depth.',
    landmarks: [
      { id: 'hallux', label: 'Hallux · medial', anchor: projectFootPoint(FOOT_RAYS[0].tip, 'ap'), box: [12, 539, 140, 28] },
      { id: 'fifth-ray', label: '5th ray · lateral', anchor: projectFootPoint(FOOT_RAYS[4].tip, 'ap'), box: [345, 507, 145, 28] },
    ],
    locations: {
      'dorsal-toes': location([14, 222, 32], 'ap', 100, 36, { marker: [276, 422] }),
      'hallux-first-ray': location([-51, 234, 27], 'ap', 25, 58, { rotate: 12, marker: [151, 453] }),
      dorsum: location([-2, 120, 68], 'ap', 64, 65, { marker: [255, 222] }),
      'lateral-ankle': location([35, 40, 85], 'ap', 25, 40, { marker: [358, 96] }),
      'plantar-toes': location([14, 225, 8], 'ap', 100, 36, { marker: [314, 493] }),
      'medial-plantar': location([-44, 120, 25], 'ap', 25, 55, { marker: [130, 285] }),
      'lateral-plantar': location([48, 135, 13], 'ap', 25, 55, { marker: [366, 295] }),
      'medial-heel': location([-29, 0, 14], 'ap', 24, 25, { marker: [150, 170] }),
      'lateral-heel': location([29, 0, 14], 'ap', 24, 25, { marker: [357, 170] }),
    },
  },
  {
    id: 'lateral',
    label: 'Lateral oblique · left foot',
    width: FOOT_VIEWS.lateral.width,
    height: FOOT_VIEWS.lateral.height,
    orientation: 'Dorsal vessels lie above the plantar vessels. Medial and lateral heel surfaces overlap: 8 and 9 are separate callouts to the same projected heel, not distinct perfusion territories.',
    landmarks: [],
    locations: {
      'dorsal-toes': location([14, 222, 32], 'lateral', 58, 25, { rotate: 25, marker: [526, 340] }),
      'hallux-first-ray': location([-51, 234, 27], 'lateral', 39, 22, { rotate: 25, marker: [532, 437] }),
      dorsum: location([-2, 120, 68], 'lateral', 65, 29, { rotate: 25, marker: [435, 245] }),
      'lateral-ankle': location([35, 40, 85], 'lateral', 35, 42, { rotate: 25, marker: [350, 167] }),
      'plantar-toes': location([14, 225, 8], 'lateral', 58, 25, { rotate: 25, marker: [492, 512] }),
      'medial-plantar': location([-44, 120, 25], 'lateral', 55, 22, { rotate: 25, marker: [190, 460] }),
      'lateral-plantar': location([48, 135, 13], 'lateral', 55, 22, { rotate: 25, marker: [315, 475] }),
      'medial-heel': { ...heel, marker: [46, 360], markerLabel: 'Medial heel' },
      'lateral-heel': { ...heel, marker: [56, 423], markerLabel: 'Lateral heel' },
    },
  },
];
