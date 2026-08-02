import computePrognosis, { computeWifiStage } from './prognosis';

describe('WIfI clinical staging', () => {
  test('maps every WIfI component combination to clinical stage 1-4', () => {
    for (let wound = 0; wound <= 3; wound += 1) {
      for (let ischemia = 0; ischemia <= 3; ischemia += 1) {
        for (let infection = 0; infection <= 3; infection += 1) {
          expect(computeWifiStage(wound, ischemia, infection)).toBeGreaterThanOrEqual(1);
          expect(computeWifiStage(wound, ischemia, infection)).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  test('calculates W2 I1 fI1 as stage 3', () => {
    expect(computePrognosis({ clinical: { wound: 2, ischemia: 1, infection: 1 } })).toMatchObject({
      wifiStage: 3,
      riskCategory: 'Moderate',
      isComplete: true,
    });
  });

  test('does not calculate a stage from missing components', () => {
    expect(computePrognosis({ clinical: { wound: 2, ischemia: null, infection: 1 } }).isComplete).toBe(false);
  });
});
