import { WOUND_PROJECTIONS } from './woundosomeProjections';
import { WOUND_ZONES } from './woundosome';
import { FOOT_RAYS, projectFootPoint } from './footArterialModel';

const ap = WOUND_PROJECTIONS.find((view) => view.id === 'ap');
const lateral = WOUND_PROJECTIONS.find((view) => view.id === 'lateral');
const marker = (location) => location.marker || [location.x, location.y];
const center = (location) => [location.x, location.y];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Regression for the previous first/fifth-ray inversion, plus the new full
// forefoot fields. Surface locations are checked against the actual anatomy.
describe('wounds on the complete patent reference left foot', () => {
  const halluxTip = projectFootPoint(FOOT_RAYS[0].tip, 'ap');
  const fifthTip = projectFootPoint(FOOT_RAYS[4].tip, 'ap');

  test('anchors the orientation labels to the anatomical first and fifth rays', () => {
    expect(ap.landmarks.find((landmark) => landmark.id === 'hallux').anchor).toEqual(halluxTip);
    expect(ap.landmarks.find((landmark) => landmark.id === 'fifth-ray').anchor).toEqual(fifthTip);
    expect(halluxTip[0]).toBeLessThan(fifthTip[0]);
  });

  test('keeps hallux wounds medial, with option 7 on the lateral fifth-ray side', () => {
    const hallux = marker(ap.locations['hallux-first-ray']);
    const lateralSole = marker(ap.locations['lateral-plantar']);
    expect(distance(hallux, halluxTip)).toBeLessThan(65);
    expect(distance(hallux, fifthTip)).toBeGreaterThan(200);
    expect(distance(lateralSole, halluxTip)).toBeGreaterThan(distance(lateralSole, fifthTip));
    expect(ap.locations['lateral-plantar'].x).toBeGreaterThan(ap.locations.dorsum.x);
    expect(ap.locations['medial-plantar'].x).toBeLessThan(ap.locations.dorsum.x);
  });

  test('shows the whole forefoot, including hallux and both instep sides, in both views', () => {
    WOUND_PROJECTIONS.forEach((view) => {
      expect(Object.keys(view.locations).sort()).toEqual(WOUND_ZONES.map((zone) => zone.id).sort());
      FOOT_RAYS.forEach((ray) => {
        const [x, y] = projectFootPoint(ray.tip, view.id);
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(view.width);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(view.height);
      });
    });
  });

  test('distinguishes dorsal and plantar depth in the lateral projection', () => {
    expect(lateral.locations['dorsal-toes'].y).toBeLessThan(lateral.locations['plantar-toes'].y);
    expect(distance(center(lateral.locations['dorsal-toes']), center(lateral.locations['plantar-toes']))).toBeGreaterThan(35);
  });

  test('uses separate heel controls for the same superimposed lateral heel area', () => {
    const { marker: medialMarker, markerLabel: medialLabel, ...medialArea } = lateral.locations['medial-heel'];
    const { marker: lateralMarker, markerLabel: lateralLabel, ...lateralArea } = lateral.locations['lateral-heel'];
    expect(medialArea).toEqual(lateralArea);
    expect(distance(medialMarker, lateralMarker)).toBeGreaterThan(44);
    expect(medialLabel).toBe('Medial heel');
    expect(lateralLabel).toBe('Lateral heel');
  });

  test('keeps the selectable marker targets inside each field and separated', () => {
    WOUND_PROJECTIONS.forEach((view) => {
      const points = Object.values(view.locations).map(marker);
      points.forEach(([x, y], i) => {
        expect(x).toBeGreaterThanOrEqual(22);
        expect(x).toBeLessThanOrEqual(view.width - 22);
        expect(y).toBeGreaterThanOrEqual(22);
        expect(y).toBeLessThanOrEqual(view.height - 22);
        points.slice(i + 1).forEach((other) => expect(distance([x, y], other)).toBeGreaterThan(44));
      });
    });
  });
});
