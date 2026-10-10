import {
  classifyPat,
  getPatMeasurementError,
  getPatMeasurements,
  getPatSummaryLines,
  parsePatMilliseconds,
} from './pedalAccelerationTime';
import { validateCaseStep } from '../utils/caseValidation';

const caseData = (patMeasurements) => ({
  stage: 'iii',
  clinical: { wound: 0, ischemia: 2, infection: 0, patMeasurements },
});

describe('pedal acceleration time', () => {
  test.each([[1, 1], [120, 1], [121, 2], [180, 2], [181, 3], [224, 3], [226, 4], [400, 4]])(
    'classifies %i ms as category %i',
    (milliseconds, category) => expect(classifyPat(milliseconds)?.category).toBe(category),
  );

  test('preserves the unassigned 225 ms publication boundary', () => {
    expect(classifyPat('225')).toMatchObject({ category: null, tone: 'boundary' });
    expect(getPatSummaryLines({ patMeasurements: [{ artery: 'dorsalis-pedis', milliseconds: '225' }] })[0])
      .toContain('225 ms — Boundary value');
  });

  test.each(['', ' ', null, undefined, true, [], {}, 'NaN', Infinity, -10, 0, 120.5])(
    'does not assign a category to an invalid value: %p',
    (value) => {
      expect(parsePatMilliseconds(value)).toBeNull();
      expect(classifyPat(value)).toBeNull();
    },
  );

  test('keeps PAT optional and does not require unused blank rows', () => {
    expect(validateCaseStep(0, caseData(undefined))).toEqual([]);
    expect(validateCaseStep(0, caseData([]))).toEqual([]);
    expect(validateCaseStep(0, caseData([{ artery: '', milliseconds: '' }]))).toEqual([]);
    expect(getPatMeasurements(null)).toEqual([]);
    expect(getPatMeasurements({ patMeasurements: [null, 'legacy', { artery: '' }] })).toEqual([{ artery: '' }]);
  });

  test('requires an artery and a valid time only when a measurement has been entered', () => {
    expect(validateCaseStep(0, caseData([{ milliseconds: '180' }]))).toContain('Choose the artery measured for PAT.');
    expect(validateCaseStep(0, caseData([{ artery: 'lateral-plantar', milliseconds: '180.5' }])))
      .toContain('Enter PAT as a positive whole number in milliseconds.');
    expect(getPatMeasurementError({ artery: 'unknown', milliseconds: '180' })).toBeTruthy();
    expect(validateCaseStep(0, caseData([{ artery: 'lateral-plantar', milliseconds: '180' }]))).toEqual([]);
  });

  test('summarizes each artery independently and derives categories from the time', () => {
    const data = caseData([
      { artery: 'dorsalis-pedis', milliseconds: '120', category: 4 },
      { artery: 'lateral-plantar', milliseconds: '200' },
      { artery: '', milliseconds: '' },
    ]);
    expect(getPatSummaryLines(data.clinical)).toEqual([
      'PAT: Dorsalis pedis artery — 120 ms — Category 1 — no ischemia',
      'PAT: Lateral plantar artery — 200 ms — Category 3 — moderate ischemia',
    ]);
    expect(data.clinical.ischemia).toBe(2);
  });
});
