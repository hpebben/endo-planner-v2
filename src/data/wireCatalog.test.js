import { WIRE_CATALOG, getWireLengthOptions, getWireProductOptions } from './wireCatalog';

describe('wire catalogue filtering', () => {
  test('derives available lengths from platform and category', () => {
    expect(getWireLengthOptions('0.035', 'Support wire')).toEqual(expect.arrayContaining(['180 cm', '260 cm', '300 cm']));
  });

  test('returns only products matching platform, exact length and category', () => {
    const options = getWireProductOptions({
      platform: '0.018',
      length: '300 cm',
      category: 'CTO wire',
      technique: 'Intimal Tracking',
    });
    expect(options.length).toBeGreaterThan(3);
    options.forEach((option) => {
      const product = WIRE_CATALOG.find((item) => item.label === option.value && item.platform === '0.018');
      expect(product).toMatchObject({ platform: '0.018', category: 'CTO wire' });
      expect(product.lengths).toContain(300);
    });
  });

  test('places matching local preferences at the top', () => {
    const preferred = 'Cook Medical — Lunderquist';
    const options = getWireProductOptions({
      platform: '0.035',
      length: '300 cm',
      category: 'Support wire',
      technique: 'Intimal Tracking',
    }, [preferred]);
    expect(options[0]).toMatchObject({ value: preferred, preferred: true });
    expect(options[0].label).toMatch(/^★/);
  });
});
