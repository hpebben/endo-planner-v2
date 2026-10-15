import { getLesionExtent, lengthCategoryForCm, lesionExtentDescription } from './lesionExtent';

const sfa = 'Left_superficial_femoral_artery';
describe('schematic longitudinal lesion extent', () => {
  test('shows 5 cm as one seventh of a 35 cm SFA reference rather than a full red artery', () => {
    const extent = getLesionExtent(sfa, { length: '3-10', measuredLengthCm: '5' });
    expect(extent.fraction).toBeCloseTo(5 / 35);
    expect(extent.start).toBeCloseTo((1 - 5 / 35) / 2);
    expect(extent.kind).toBe('measured');
    expect(extent.basis).toBe('published model');
    expect(lesionExtentDescription(sfa, { measuredLengthCm: '5' })).toMatch(/5 cm.*14%.*35 cm.*schematic/);
  });
  test('distinguishes an entered reference, a range estimate and an open-ended minimum', () => {
    expect(getLesionExtent(sfa, { measuredLengthCm: '5', referenceLengthCm: '40' })).toMatchObject({ fraction: 0.125, basis: 'entered reference' });
    expect(getLesionExtent(sfa, { length: '3-10' })).toMatchObject({ lesionCm: 6.5, kind: 'range estimate' });
    expect(getLesionExtent(sfa, { length: '>20' })).toMatchObject({ lesionCm: 20, kind: 'lower-bound' });
    expect(lesionExtentDescription(sfa, { length: '>20' })).toMatch(/≥57%/);
  });
  test('caps the illustration, handles missing lengths and avoids inventing a group-artery reference', () => {
    expect(getLesionExtent(sfa, { measuredLengthCm: '80' })).toMatchObject({ fraction: 1, start: 0 });
    expect(getLesionExtent(sfa, {}).fraction).toBeNull();
    expect(getLesionExtent('Left_metatarsal_arteries', { length: '<3' }).fraction).toBeNull();
    expect(getLesionExtent(sfa, { measuredLengthCm: '-5' }).fraction).toBeNull();
    expect(getLesionExtent('Right_anterior_tibital_artery', { length: '<3' }).referenceCm).toBe(30);
  });
  test.each([[2.9, '<3'], [3, '3-10'], [10, '10-15'], [15, '15-20'], [20, '15-20'], [20.1, '>20'], [0, ''], [-1, '']])('keeps the clinical length category consistent with %s cm', (length, expected) => {
    expect(lengthCategoryForCm(length)).toBe(expected);
  });
});
