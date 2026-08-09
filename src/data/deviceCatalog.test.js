import {
  BALLOON_CATALOG,
  CATHETER_CATALOG,
  getCatalogFilterOptions,
  getCatalogProductOptions,
  PTA_BALLOON_CATALOG,
  reconcileCatalogProduct,
  SPECIAL_DEVICE_CATALOG,
  STENT_CATALOG,
} from './deviceCatalog';

describe('European device catalogues', () => {
  test('keeps the familiar catheter options and product-specific specifications', () => {
    expect(CATHETER_CATALOG.map((item) => item.label)).toEqual([
      'BER2',
      'BHW',
      'Cobra 1',
      'Cobra 2',
      'Cobra 3',
      'Cobra Glidecath',
      'CXI 0.018',
      'CXI 0.014',
      'Navicross 0.018',
      'Navicross 0.035',
      'MultiPurpose',
      'PIER',
      'Pigtail Flush',
      'Straight Flush',
      'Universal Flush',
      'Rim',
      'Simmons 1',
      'Simmons 2',
      'Simmons 3',
      'Vertebral',
    ]);

    CATHETER_CATALOG.forEach((item) => {
      expect(item.sizes.length).toBeGreaterThan(0);
      expect(item.lengths.length).toBeGreaterThan(0);
    });
    expect(CATHETER_CATALOG.find((item) => item.label === 'PIER')).toMatchObject({
      sizes: ['5 Fr'],
      lengths: ['65 cm'],
    });
    expect(CATHETER_CATALOG.find((item) => item.label === 'Cobra 3')).toMatchObject({
      sizes: ['5 Fr'],
      lengths: ['65 cm'],
    });

    const form = reconcileCatalogProduct(CATHETER_CATALOG, {
      size: '5 Fr',
      length: '40 cm',
    }, 'Navicross 0.018', { mirrorSpecific: true });

    expect(form).toMatchObject({
      product: 'Navicross 0.018',
      specific: 'Navicross 0.018',
      platform: '0.018',
      size: '2.6 Fr',
      length: '',
      minimumSheathFr: '2.6 Fr',
    });
    expect(getCatalogFilterOptions(CATHETER_CATALOG, form, 'size')).toEqual(['2.6 Fr']);
    expect(getCatalogFilterOptions(CATHETER_CATALOG, form, 'length')).toEqual([
      '65 cm',
      '90 cm',
      '135 cm',
      '150 cm',
    ]);
    expect(getCatalogProductOptions(CATHETER_CATALOG)
      .find((item) => item.value === 'Navicross 0.018').specs).toContain('L 65–150 cm');
  });

  test('contains every PTA balloon row from the linked European guide', () => {
    expect(PTA_BALLOON_CATALOG).toHaveLength(119);
    expect(new Set(PTA_BALLOON_CATALOG.map((item) => item.label))).toHaveProperty('size', 119);
    expect(PTA_BALLOON_CATALOG.map((item) => item.label)).toEqual(expect.arrayContaining([
      'Q3 Medical Group — 014 PTA Balloon Catheter (PVQ)',
      'Boston Scientific Corporation — XXL Balloon Dilatation Catheter',
    ]));
  });

  test('filters products before a product is selected', () => {
    const options = getCatalogProductOptions(BALLOON_CATALOG, {
      category: 'Drug-coated',
      platform: '0.014',
    });

    expect(options.length).toBeGreaterThan(0);
    expect(options.map((option) => option.value)).toEqual(
      expect.arrayContaining(['iVascular — Luminor 14 DCB']),
    );
    expect(options.map((option) => option.value)).not.toContain('Medtronic — IN.PACT Admiral DCB');
  });

  test('narrows every specification to a selected commercial product', () => {
    const form = reconcileCatalogProduct(BALLOON_CATALOG, {
      diameter: '12',
      shaft: '135 cm',
    }, 'BD Interventional — Lutonix 018 DCB');

    expect(form).toMatchObject({
      product: 'BD Interventional — Lutonix 018 DCB',
      platform: '0.018',
      diameter: '',
      shaft: '',
      deliveryMode: 'Over-the-wire',
    });
    expect(getCatalogFilterOptions(BALLOON_CATALOG, form, 'diameter')).toEqual(['4', '5', '6', '7']);
    expect(getCatalogFilterOptions(BALLOON_CATALOG, form, 'shaft')).toEqual(['100 cm', '130 cm']);
    expect(getCatalogFilterOptions(BALLOON_CATALOG, form, 'minimumSheathFr')).toEqual(['4 Fr', '5 Fr']);
  });

  test('covers each requested intervention category with expanded products', () => {
    expect(CATHETER_CATALOG.length).toBeGreaterThanOrEqual(20);
    expect(BALLOON_CATALOG.length).toBeGreaterThanOrEqual(20);
    expect(STENT_CATALOG.length).toBeGreaterThanOrEqual(20);
    expect(SPECIAL_DEVICE_CATALOG.length).toBeGreaterThanOrEqual(15);
  });
});
