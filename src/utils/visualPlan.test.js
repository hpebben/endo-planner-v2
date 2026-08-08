import { compactDeviceLabel, getVisualPlanItems, rowsForPlanScope } from './visualPlan';
import { createLesionScope, createTargetPathScope } from './planScopes';

describe('visual intervention plan', () => {
  test('uses clinically recognisable compact device labels', () => {
    expect(
      compactDeviceLabel('wire', {
        product: 'ASAHI Gladius MG 18 PV ES',
        role: 'CTO crossing',
      })
    ).toBe('ASAHI Gladius MG 18 PV ES');
    expect(compactDeviceLabel('balloon', { diameter: '5', length: '120' })).toBe('5 × 120 mm');
    expect(compactDeviceLabel('balloon', { product: 'Preferred PTA', diameter: '5', length: '120' })).toBe('Preferred PTA · 5 × 120 mm');
    expect(compactDeviceLabel('stent', { type: 'self expandable' })).toBe('self expandable');
  });

  test('builds a schematic sequence without empty device placeholders', () => {
    const items = getVisualPlanItems(
      [
        {
          wire: { role: 'CTO crossing' },
          catheter: {},
          device: 'Re-entry device',
        },
      ],
      [{ balloon: { diameter: '5', length: '120' }, stent: {} }]
    );
    expect(items).toEqual([
      { type: 'wire', label: 'CTO crossing' },
      { type: 'special', label: 'Re-entry device' },
      { type: 'balloon', label: '5 × 120 mm' },
    ]);
  });

  test('filters rows to the selected visual scope', () => {
    const lesionScope = createLesionScope('Left_superficial_femoral_artery');
    const rows = [
      {
        id: 'path',
        scope: createTargetPathScope(),
        wire: { role: 'Support / exchange' },
      },
      { id: 'lesion', scope: lesionScope, wire: { role: 'CTO crossing' } },
    ];
    expect(rowsForPlanScope(rows, lesionScope).map((row) => row.id)).toEqual(['lesion']);
  });
});
