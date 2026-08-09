import {
  findClosureCompatibilityIssue,
  getClosureAdvice,
  getCompatibleClosureOptions,
} from './closureAdvice';

const accessRows = (frSize = '6 Fr', length = '25 cm') => [{
  sheaths: [{ frSize, length }],
}];

describe('closure advice', () => {
  test('recommends the size-matched 6F AngioSeal and not the 8F device', () => {
    const [advice] = getClosureAdvice(accessRows());
    expect(advice.recommended.map((device) => device.label)).toContain('6F AngioSeal');
    expect(advice.compatible.map((device) => device.label)).not.toContain('8F AngioSeal');
    expect(getCompatibleClosureOptions(accessRows())).not.toContain('8F AngioSeal');
  });

  test('applies maximum procedural-sheath length restrictions', () => {
    const [shortSheath] = getClosureAdvice(accessRows('6 Fr', '12 cm'));
    const [longSheath] = getClosureAdvice(accessRows('6 Fr', '25 cm'));
    expect(shortSheath.compatible.map((device) => device.label)).toContain('6F Exoseal');
    expect(longSheath.compatible.map((device) => device.label)).not.toContain('6F Exoseal');
  });

  test('flags an incompatible selected closure device', () => {
    expect(findClosureCompatibilityIssue('8F AngioSeal', accessRows())).toMatchObject({
      title: expect.stringMatching(/does not match/i),
    });
    expect(findClosureCompatibilityIssue('6F AngioSeal', accessRows())).toBeNull();
  });
});
