import { getLesionExtent } from './lesionExtent';
import { lesionVesselName, getLesionOptions } from './lesions';
import { normalizeLesionPosition, normalizePoplitealSegments, moveLesionPosition, lesionPositionLabel, lesionMapDirection } from './lesionLocation';

const sfa = 'Left_superficial_femoral_artery';
const popliteal = 'Left_popliteal_artery_artery';

test('places a fixed-length lesion at either end without changing its length or exceeding its artery', () => {
  for (const position of [0, 0.25, 0.5, 0.75, 1]) {
    const extent = getLesionExtent(sfa, { measuredLengthCm: '5', positionFraction: position });
    expect(extent.fraction).toBeCloseTo(5 / 35);
    expect(extent.start).toBeGreaterThanOrEqual(0);
    expect(extent.start + extent.fraction).toBeLessThanOrEqual(1);
  }
  expect(getLesionExtent(sfa, { measuredLengthCm: '5', positionFraction: 0 }).start).toBe(0);
  expect(getLesionExtent(sfa, { measuredLengthCm: '5', positionFraction: 1 }).start).toBeCloseTo(30 / 35);
  expect(getLesionExtent(sfa, { measuredLengthCm: '80', positionFraction: 1 })).toMatchObject({ start: 0, fraction: 1 });
});

test('preserves centered legacy drawings without presenting an unrecorded position as a finding', () => {
  expect(getLesionExtent(sfa, { measuredLengthCm: '5' }).positionFraction).toBe(0.5);
  expect(lesionPositionLabel({})).toBe('');
  expect(lesionPositionLabel({ positionFraction: 0 })).toBe('schematic proximal position');
  expect(lesionPositionLabel({ positionFraction: 1 })).toBe('schematic distal position');
  for (const invalid of ['', '  ', null, undefined, 'invalid', true, [], {}, Infinity]) expect(normalizeLesionPosition(invalid)).toBeNull();
  expect(normalizeLesionPosition(-4)).toBe(0);
  expect(normalizeLesionPosition(4)).toBe(1);
});

test('drag placement follows pointer travel and clamps at both segment ends', () => {
  expect(moveLesionPosition(0.5, 0.2, 0.2)).toBeCloseTo(0.75);
  expect(moveLesionPosition(0.5, 0.2, 2)).toBe(1);
  expect(moveLesionPosition(0.5, 0.2, -2)).toBe(0);
  expect(moveLesionPosition(1, 1, 2)).toBe(0.5);
});

test('keeps proximal/distal direction correct in both limbs and medially directed iliac branches', () => {
  expect(lesionMapDirection('Left_common_iliac_artery', 'x')).toBe(1);
  expect(lesionMapDirection('Right_common_iliac_artery', 'x')).toBe(-1);
  expect(lesionMapDirection('Left_internal_iliac_artery', 'x')).toBe(-1);
  expect(lesionMapDirection('Right_internal_iliac_artery', 'x')).toBe(1);
  expect(lesionMapDirection('Right_superficial_femoral_artery', 'y')).toBe(1);
});

test('records multiple involved popliteal segments in anatomical order, without inventing equal segment lengths', () => {
  const values = { measuredLengthCm: '5', poplitealSegments: ['P3', 'P2', 'P2', 'invalid'] };
  expect(normalizePoplitealSegments(values.poplitealSegments)).toEqual(['P2', 'P3']);
  expect(lesionVesselName(popliteal, values)).toContain('(P2 + P3)');
  expect(lesionVesselName(sfa, values)).not.toContain('P2');
  expect(getLesionExtent(popliteal, values).referenceCm).toBe(18.4);
  expect(getLesionOptions({ [popliteal]: values })[0]).toMatchObject({ code: 'Lesion 1', name: expect.stringContaining('P2 + P3') });
});
