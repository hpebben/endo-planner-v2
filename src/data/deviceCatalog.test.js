import {
  BALLOON_CATALOG,
  CATHETER_CATALOG,
  getCatalogFilterOptions,
  getCatalogProductOptions,
  reconcileCatalogProduct,
  SPECIAL_DEVICE_CATALOG,
  STENT_CATALOG,
} from './deviceCatalog';

describe('European device catalogues', () => {
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
