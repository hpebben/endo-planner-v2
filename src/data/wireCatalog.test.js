import {
  CTO_PROFILES,
  WIRE_CATALOG,
  WIRE_ROLES,
  getWireLengthsForProduct,
  getWirePlatformsForProduct,
  getWireLengthOptions,
  getWireProductOptions,
  getWireProductVariants,
  normalizeWireRole,
} from './wireCatalog';

describe('wire catalogue filtering', () => {
  test('derives available lengths from platform and category', () => {
    expect(getWireLengthOptions('0.035', WIRE_ROLES.SUPPORT)).toEqual(expect.arrayContaining(['180 cm', '260 cm', '300 cm']));
  });

  test('returns only products matching platform, exact length and category', () => {
    const options = getWireProductOptions({
      platform: '0.018',
      length: '300 cm',
      role: WIRE_ROLES.CTO,
      ctoProfile: CTO_PROFILES.TORQUE,
      technique: 'Intraluminal tracking',
    });
    expect(options.length).toBeGreaterThan(3);
    options.forEach((option) => {
      const product = WIRE_CATALOG.find((item) => item.label === option.value && item.platform === '0.018');
      expect(product).toMatchObject({ platform: '0.018', role: WIRE_ROLES.CTO, ctoProfile: CTO_PROFILES.TORQUE });
      expect(product.lengths).toContain(300);
    });
  });

  test('places matching local preferences at the top', () => {
    const preferred = 'Cook Medical — Lunderquist';
    const options = getWireProductOptions({
      platform: '0.035',
      length: '300 cm',
      role: WIRE_ROLES.SUPPORT,
      technique: 'Intraluminal tracking',
    }, [preferred]);
    expect(options[0]).toMatchObject({ value: preferred, preferred: true });
    expect(options[0].label).toBe(preferred);
  });

  test('supports product-first browsing before filters are selected', () => {
    const preferred = 'Asahi Intecc — Halberd';
    const options = getWireProductOptions({}, [preferred]);
    expect(options[0]).toMatchObject({ value: preferred, preferred: true });
    expect(options.length).toBeGreaterThan(30);
    expect(new Set(options.map((option) => option.value)).size).toBe(options.length);
  });

  test('derives only valid platform and length chips for a selected product', () => {
    const product = 'Asahi Intecc — Halberd';
    expect(getWirePlatformsForProduct(product)).toEqual(['0.014', '0.018']);
    expect(getWireLengthsForProduct(product, { platform: '0.018' })).toEqual(['200 cm', '235 cm', '300 cm']);
    expect(getWireProductVariants(product, { platform: '0.035' })).toHaveLength(0);
  });

  test('migrates legacy category names to refined functional roles', () => {
    expect(normalizeWireRole('Glidewire')).toBe(WIRE_ROLES.JACKETED);
    expect(normalizeWireRole('CTO wire')).toBe(WIRE_ROLES.CTO);
    expect(normalizeWireRole('Support wire')).toBe(WIRE_ROLES.SUPPORT);
  });

  test('keeps workhorse, jacketed, CTO and support roles distinct', () => {
    expect(new Set(WIRE_CATALOG.map((item) => item.role))).toEqual(new Set(Object.values(WIRE_ROLES)));
    WIRE_CATALOG.forEach((item) => {
      expect(item.purpose).toBeTruthy();
      expect(item.caution).toBeTruthy();
    });
  });
});
