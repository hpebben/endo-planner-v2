import { WOUND_PROJECTIONS } from './woundosomeProjections';
import { WOUND_ZONES } from './woundosome';

const ap = WOUND_PROJECTIONS.find((view) => view.id === 'ap');
const lateral = WOUND_PROJECTIONS.find((view) => view.id === 'lateral');
const point = (location) => location.marker || [location.x, location.y];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('wound locations on the unmirrored reference left foot', () => {
  // These landmarks are independently identified in Patrone Fig. 3B,
  // using the first/fifth-ray anatomy in Manzi Figs 2–6; see asset README.
  const halluxTip = [193, 470];
  const fifthRayTip = [367, 298];

  test('places the hallux at the medial first toe, not at the lateral lesser toes', () => {
    expect(distance(point(ap.locations['hallux-first-ray']), halluxTip)).toBeLessThan(40);
    expect(distance(point(ap.locations['hallux-first-ray']), fifthRayTip)).toBeGreaterThan(200);
  });

  test('places option 7 on the fifth-ray side, away from the hallux', () => {
    const lateralSole = point(ap.locations['lateral-plantar']);
    expect(distance(lateralSole, fifthRayTip)).toBeLessThan(150);
    expect(distance(lateralSole, halluxTip)).toBeGreaterThan(250);
    expect(lateralSole[0]).toBeGreaterThan(ap.locations.dorsum.x);
    expect(ap.locations['medial-plantar'].x).toBeLessThan(ap.locations.dorsum.x);
  });

  test('does not invent toe or side-specific instep locations in the cropped lateral field', () => {
    ['dorsal-toes', 'hallux-first-ray', 'plantar-toes', 'medial-plantar', 'lateral-plantar'].forEach((id) => {
      expect(lateral.locations[id]).toBeUndefined();
      expect(ap.locations[id]).toBeDefined();
    });
  });

  test('shows medial/lateral heel callouts at the same projected heel, with separate controls', () => {
    const { marker: medialMarker, markerLabel: medialLabel, ...medialArea } = lateral.locations['medial-heel'];
    const { marker: lateralMarker, markerLabel: lateralLabel, ...lateralArea } = lateral.locations['lateral-heel'];
    expect(medialArea).toEqual(lateralArea);
    expect(distance(medialMarker, lateralMarker)).toBeGreaterThan(44);
    expect(medialLabel).toBe('Medial heel');
    expect(lateralLabel).toBe('Lateral heel');
  });

  test('keeps all nine saved wound IDs selectable in a suitable image and the color key', () => {
    const shown = new Set(WOUND_PROJECTIONS.flatMap((view) => Object.keys(view.locations)));
    expect([...shown].sort()).toEqual(WOUND_ZONES.map((zone) => zone.id).sort());
    WOUND_PROJECTIONS.forEach((view) => {
      Object.values(view.locations).forEach((location) => {
        const [x, y] = point(location);
        expect(x).toBeGreaterThanOrEqual(22);
        expect(x).toBeLessThanOrEqual(view.width - 22);
        expect(y).toBeGreaterThanOrEqual(22);
        expect(y).toBeLessThanOrEqual(view.height - 22);
      });
    });
  });
});
