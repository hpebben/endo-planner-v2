import { getWoundosomeAdvice, woundZoneLabel } from './woundosome';

describe('woundosome TAP advice', () => {
  test('checks anterior and both plantar routes for the variable hallux supply described by Manzi', () => {
    const advice = getWoundosomeAdvice(['hallux-first-ray']);
    expect(advice.primaryTapKeys).toEqual(['anterior', 'posterior']);
    expect(advice.routes[0]).toMatch(/both dorsalis pedis and posterior tibial/i);
    expect(advice.routes[0]).toMatch(/medial plantar deep branch/i);
    expect(advice.routes[0]).toMatch(/lateral plantar → plantar arch → first plantar metatarsal/i);
  });

  test('keeps the lateral sole on posterior tibial inflow despite the plantar arch turning medially', () => {
    const advice = getWoundosomeAdvice(['lateral-plantar']);
    expect(advice.primaryTapKeys).toEqual(['posterior']);
    expect(advice.routes[0]).toMatch(/fifth-ray side/i);
    expect(advice.routes[0]).toMatch(/turns medially toward the first interspace/i);
  });

  test('maps heel territories without silently selecting a TAP', () => {
    const advice = getWoundosomeAdvice(['medial-heel', 'lateral-heel']);
    expect(advice.primaryTapKeys).toEqual(['posterior', 'peroneal']);
    expect(advice.isSuggested('anterior')).toBe(false);
    expect(woundZoneLabel('medial-heel')).toBe('Medial heel');
  });
});
