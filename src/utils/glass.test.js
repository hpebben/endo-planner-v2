import computeGlass, { GLASS_MATRIX, lesionGrade } from './glass';

describe('GLASS calculation', () => {
  test('contains the complete published FP/IP staging matrix', () => {
    expect(GLASS_MATRIX).toEqual([
      [null, 'I', 'I', 'II', 'III'],
      ['I', 'I', 'II', 'II', 'III'],
      ['I', 'II', 'II', 'II', 'III'],
      ['II', 'II', 'II', 'III', 'III'],
      ['III', 'III', 'III', 'III', 'III'],
    ]);
  });

  test('calculates a unilateral FP3/IP2 anatomy as GLASS II', () => {
    const result = computeGlass({
      Left_common_femoral_artery: { type: 'stenosis', length: '10-15', calcium: 'moderate' },
      Left_popliteal_artery_artery: { type: 'stenosis', length: '15-20', calcium: 'moderate' },
      Left_peroneal_artery: { type: 'stenosis', length: '3-10', calcium: 'moderate' },
    });
    expect(result).toMatchObject({
      stage: 'II',
      fpGrade: 3,
      ipGrade: 2,
      side: 'Left',
      isComplete: true,
      technicalFailure: '<20%',
      oneYearPatency: '50–70%',
    });
  });

  test('increments a segment grade for heavy calcification', () => {
    expect(lesionGrade({ type: 'stenosis', length: '10-15', calcium: 'moderate' }, 'FP')).toBe(2);
    expect(lesionGrade({ type: 'stenosis', length: '10-15', calcium: 'heavy' }, 'FP')).toBe(3);
  });

  test('rejects bilateral anatomy because GLASS is limb-specific', () => {
    const result = computeGlass({
      Left_superficial_femoral_artery: { type: 'stenosis', length: '3-10', calcium: 'none' },
      Right_superficial_femoral_artery: { type: 'stenosis', length: '3-10', calcium: 'none' },
    });
    expect(result.isComplete).toBe(false);
    expect(result.reason).toMatch(/limb-specific/i);
  });
});
