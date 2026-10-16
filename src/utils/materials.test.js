import { buildMaterialsList } from './materials';

const id = 'Left_superficial_femoral_artery';
const balloon = { product: 'Selected balloon', platform: '0.018', diameter: '5', length: '120', shaft: '135 cm', minimumSheathFr: '5 Fr' };
const fixture = () => ({
  patencySegments: { [id]: { type: 'occlusion', length: '10-15', calcium: 'heavy' } },
  targetArterialPath: [id],
  accessRows: [{ approach: 'Antegrade', side: 'Left', vessel: 'CFA', needles: [{ size: '21 Gauge', length: '7 cm' }], sheaths: [{ frSize: '6 Fr', length: '45 cm' }] }],
  navRows: [{ lesionId: id, wire: { product: 'Selected wire', platform: '0.018', length: '300 cm' }, balloon: { ...balloon } }],
  therapyRows: [{ lesionId: id, balloon: { ...balloon }, stent: { product: 'Selected stent', diameter: '6', length: '100', shaft: '120 cm', platform: '0.035' } }],
  closureRows: [{ method: 'Manual pressure', device: 'Unused closure device' }],
  planDeviceSuggestions: { therapy: [{ balloon: { product: 'Unused legacy balloon' } }] },
  appliedPreferenceProfile: { balloon: { product: 'Unused preferred balloon' } },
});

test('groups selected materials and preserves specifications, with no inferred unit quantities', () => {
  const groups = buildMaterialsList(fixture());
  expect(groups.map((group) => group.id)).toEqual(['access', 'wires', 'balloons', 'stents', 'closure']);
  const items = groups.flatMap((group) => group.items);
  const b = items.find((item) => item.name === 'Selected balloon');
  expect(b.sizes).toEqual(['5 x 120 mm', '0.018-inch']);
  expect(b.details).toContain('Shaft 135 cm');
  expect(b.details).toContain('Minimum sheath 5 Fr');
  expect(b.occurrences).toBe(2);
  expect(b.uses).toEqual([expect.stringContaining('Crossing'), expect.stringContaining('Treatment')]);
  expect(b.quantity).toBeUndefined();
  expect(items.map((item) => item.name)).not.toContain('Unused closure device');
  expect(JSON.stringify(groups)).not.toMatch(/Unused (legacy|preferred)/);
});

test('keeps different dimensions separate and excludes unlinked legacy selections', () => {
  const data = fixture();
  data.therapyRows[0].balloon.length = '200';
  data.navRows.push({ wire: { product: 'Unlinked wire' } });
  const groups = buildMaterialsList(data);
  expect(groups.find((group) => group.id === 'balloons').items).toHaveLength(2);
  expect(JSON.stringify(groups)).not.toContain('Unlinked wire');
});

test('flags incomplete product specifications without inventing missing material', () => {
  const data = fixture();
  data.therapyRows[0].stent = { diameter: '6' };
  const stent = buildMaterialsList(data).find((group) => group.id === 'stents').items[0];
  expect(stent.name).toBe('Stent / stent graft');
  expect(stent.missing).toEqual(expect.arrayContaining(['Product not recorded', 'Diameter / treatment length not recorded', 'Shaft length not recorded']));
  expect(buildMaterialsList({})).toEqual([]);
});

test('deduplicates a catheter selected in access and crossing using equivalent field names', () => {
  const data = fixture();
  data.accessRows[0].catheters = [{ specific: 'Selected catheter', size: '4 Fr', length: '135 cm' }];
  data.navRows[0].catheter = { product: 'Selected catheter', frSize: '4 Fr', length: '135 cm' };
  const catheters = buildMaterialsList(data).find((group) => group.id === 'catheters').items;
  expect(catheters).toHaveLength(1);
  expect(catheters[0].uses).toHaveLength(2);
});
