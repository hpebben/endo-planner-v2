import { getWoundosomeAdvice, woundZoneLabel } from './woundosome';

describe('woundosome TAP advice', () => {
  test('checks both dorsalis pedis and medial plantar inflow for a hallux wound', () => {
    const advice = getWoundosomeAdvice(['hallux-first-ray']);
    expect(advice.primaryTapKeys).toEqual(['anterior', 'posterior']);
    expect(advice.routes[0]).toMatch(/both dorsalis pedis and medial plantar/i);
  });

  test('maps heel territories without silently selecting a TAP', () => {
    const advice = getWoundosomeAdvice(['medial-heel', 'lateral-heel']);
    expect(advice.primaryTapKeys).toEqual(['posterior', 'peroneal']);
    expect(advice.isSuggested('anterior')).toBe(false);
    expect(woundZoneLabel('medial-heel')).toBe('Medial heel');
  });
});
