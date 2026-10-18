import guide from './deviceGuideProducts.json';
import { SHEATH_CATALOG, STENT_CATALOG, SPECIAL_DEVICE_CATALOG, BALLOON_CATALOG, catalogItemMatches, getCatalogProduct, getCatalogFilterOptions, getCatalogFieldRanges } from './deviceCatalog';
import { getWireByLabel, getWireLengthsForProduct, getWireFilterOptions } from './wireCatalog';

test('covers all three sheath tables and deduplicates repeated product listings', () => {
  expect(guide.sources.filter(({ url }) => /\/(?:standard|reinforced|special-access)-sheaths-1$/.test(url)).reduce((sum, source) => sum + source.rows, 0)).toBe(145);
  expect(SHEATH_CATALOG).toHaveLength(118);
  expect(new Set(SHEATH_CATALOG.map((item) => item.label)).size).toBe(118);
  const halo = getCatalogProduct(SHEATH_CATALOG, 'BD Interventional — Halo One Thin-Walled Guiding Sheath');
  expect(halo.lengths).toEqual(['10 cm', '25 cm', '45 cm', '70 cm', '90 cm']);
  expect(catalogItemMatches(halo, { size: '6 Fr', length: '110 cm' })).toBe(false);
});

test('retains ranges for manual entry without inventing discrete sizes', () => {
  const product = 'Cook Medical — Flexor: Balkin';
  expect(getCatalogFilterOptions(SHEATH_CATALOG, { product }, 'size')).toEqual(['10 Fr', '12 Fr']);
  expect(getCatalogFieldRanges(SHEATH_CATALOG, { product }, 'size')).toEqual([{ min: 5.5, max: 8, unit: 'Fr' }]);
  expect(catalogItemMatches(getCatalogProduct(SHEATH_CATALOG, product), { size: '7 Fr', length: '40 cm' })).toBe(true);
  expect(catalogItemMatches(getCatalogProduct(SHEATH_CATALOG, product), { size: '9 Fr' })).toBe(false);
});

test('does not cross sizes and lengths from separate source rows', () => {
  const product = getCatalogProduct(SHEATH_CATALOG, 'Merit Medical Systems, Inc. — Prelude Sheath Introducers');
  expect(catalogItemMatches(product, { category: 'Special access', size: '8 Fr' })).toBe(false);
  expect(catalogItemMatches(product, { category: 'Standard', size: '8 Fr', length: '7 cm' })).toBe(false);
  expect(catalogItemMatches(product, { category: 'Special access', size: '6 Fr', length: '7 cm' })).toBe(true);
});

test('keeps diameter-dependent guidewire platforms linked in a covered stent', () => {
  const product = getCatalogProduct(STENT_CATALOG, 'Gore & Associates — Gore Viabahn Endoprosthesis With Propaten Bioactive Surface');
  expect(catalogItemMatches(product, { platform: '0.014', diameter: '13' })).toBe(false);
  expect(catalogItemMatches(product, { platform: '0.014', diameter: '8' })).toBe(true);
  expect(catalogItemMatches(product, { platform: '0.035', diameter: '13' })).toBe(true);
  expect(catalogItemMatches(product, { platform: '0.014', diameter: '6.5' })).toBe(false);
});

test('normalizes balloon lengths from centimetres into millimetres', () => {
  const product = getCatalogProduct(BALLOON_CATALOG, 'iVascular — Luminor 35');
  expect(product.lengths).toEqual(['20', '40', '60', '80', '120', '150']);
  expect(product.source).toContain('/drug-coated-balloons-1');
});

test('adds peripheral adjunct categories without adding coronary-only IVUS', () => {
  for (const category of ['IVUS', 'Embolic protection', 'Thrombectomy', 'Catheter-directed infusion', 'Snare / retrieval']) {
    expect(SPECIAL_DEVICE_CATALOG.some((item) => item.categories.includes(category))).toBe(true);
  }
  expect(SPECIAL_DEVICE_CATALOG.some((item) => /Refinity ST/.test(item.label))).toBe(false);
});

test('uses Abbott ordering-table lengths and tip variants for Command wires', () => {
  const st = 'Abbott — Hi-Torque Command 18 ST', lt = 'Abbott — Hi-Torque Command 18 LT';
  expect(getWireLengthsForProduct(st)).toEqual(['210 cm', '300 cm']);
  expect(getWireLengthsForProduct(lt)).toEqual(['210 cm', '300 cm']);
  expect(getWireByLabel(lt).design).toContain('25 cm nitinol');
  expect(getWireLengthsForProduct('Abbott — Hi-Torque Command ES')).toEqual(['190 cm', '250 cm', '300 cm']);
  expect(getWireFilterOptions({ product: 'Abbott — Hi-Torque Command 14 ST' }, 'tipShape')).toEqual(['Angled', 'Straight']);
});
