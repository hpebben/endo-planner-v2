import { analyzePlan, getBlockingPlanFindings, wireLengthRequired } from './planAnalysis';
import { WIRE_ROLES } from '../data/wireCatalog';
import { createLesionScope, createTargetPathScope } from './planScopes';

const lesionId = 'Left_superficial_femoral_artery';

const baseCase = {
  clinical: { wound: 1, ischemia: 1, infection: 0 },
  patencySegments: {
    [lesionId]: { type: 'occlusion', length: '>20', calcium: 'heavy' },
  },
  targetArterialPath: [
    'Left_common_femoral_artery',
    lesionId,
    'Left_popliteal_artery_artery',
    'Left_anterior_tibial_artery',
    'Left_dorsal_pedal_artery',
  ],
  accessRows: [{
    id: 'access-1',
    approach: 'Antegrade',
    side: 'Left',
    sheaths: [{ frSize: '5 Fr', length: '12 cm' }],
  }],
  navRows: [{
    id: 'nav-1',
    lesionId,
    wire: { platform: '0.018', length: '180 cm', role: WIRE_ROLES.CTO },
  }],
  therapyRows: [{
    id: 'therapy-1',
    lesionId,
    balloon: {
      platform: '0.035',
      diameter: '6',
      length: '120',
      shaft: '135 cm',
      deliveryMode: 'Over-the-wire',
      minimumSheathFr: '6 Fr',
    },
  }],
};

describe('compatibility and anatomy recommendations', () => {
  test('uses saved wound assessments only while Fontaine IV is selected', () => {
    const data = {
      ...baseCase,
      stage: 'iv',
      clinical: { wound: 3, ischemia: 3, infection: 3, woundLocations: ['lateral-plantar'] },
      targetArterialPath: [],
      targetArterialPathKey: 'anterior',
    };
    expect(analyzePlan(data).map((item) => item.id)).toEqual(expect.arrayContaining([
      'woundosome-tap-review', 'target-path-missing',
    ]));
    ['i', 'iia', 'iib', 'iii'].forEach((stage) => {
      expect(analyzePlan({ ...data, stage }).map((item) => item.id)).not.toEqual(expect.arrayContaining(['woundosome-tap-review']));
      expect(analyzePlan({ ...data, stage }).map((item) => item.id)).not.toEqual(expect.arrayContaining(['target-path-missing']));
    });
  });

  test('detects platform and sheath incompatibilities', () => {
    const blocking = getBlockingPlanFindings(baseCase);
    expect(blocking.map((item) => item.title)).toEqual(expect.arrayContaining([
      'Balloon platform has no matching scoped wire',
      'Balloon requires a larger sheath',
    ]));
  });

  test('uses a path-scoped support wire for downstream device compatibility', () => {
    const data = {
      ...baseCase,
      accessRows: [{ ...baseCase.accessRows[0], sheaths: [{ frSize: '6 Fr' }] }],
      navRows: [{
        id: 'nav-path',
        scope: createTargetPathScope(),
        wire: { platform: '0.018', length: '300 cm', role: WIRE_ROLES.SUPPORT },
      }],
      therapyRows: [{
        ...baseCase.therapyRows[0],
        lesionId: undefined,
        scope: createLesionScope(lesionId),
        balloon: { ...baseCase.therapyRows[0].balloon, platform: '0.018', minimumSheathFr: '5 Fr' },
      }],
    };
    expect(getBlockingPlanFindings(data).some((item) => /matching scoped wire/i.test(item.title))).toBe(false);
  });

  test('requires a path-scoped CTO wire to move to a lesion or crossing zone', () => {
    const data = {
      ...baseCase,
      navRows: [{
        id: 'nav-path-cto',
        scope: createTargetPathScope(),
        wire: { platform: '0.018', length: '300 cm', role: WIRE_ROLES.CTO },
      }],
    };
    expect(getBlockingPlanFindings(data).map((item) => item.title)).toContain(
      'CTO crossing wire needs a lesion-specific scope',
    );
  });

  test('validates over-the-wire exchange length against the linked wire', () => {
    const data = {
      ...baseCase,
      accessRows: [{ ...baseCase.accessRows[0], sheaths: [{ frSize: '6 Fr' }] }],
      therapyRows: [{
        ...baseCase.therapyRows[0],
        balloon: { ...baseCase.therapyRows[0].balloon, platform: '0.018', minimumSheathFr: '5 Fr' },
      }],
    };
    expect(wireLengthRequired(135, 'Over-the-wire')).toBe(290);
    expect(analyzePlan(data).some((item) => /working lengths are incompatible/i.test(item.title))).toBe(true);
  });

  test('recommends a pre-planned retrograde bailout for a long calcified SFA CTO', () => {
    const recommendation = analyzePlan(baseCase).find((item) => item.id.startsWith('retrograde-fp'));
    expect(recommendation).toBeTruthy();
    expect(recommendation.details.join(' ')).toMatch(/ultrasound.*rendezvous/i);
    expect(recommendation.references.length).toBeGreaterThanOrEqual(3);
  });

  test('does not trigger the antegrade-only recommendation when a retrograde plan exists', () => {
    const data = {
      ...baseCase,
      accessRows: [
        baseCase.accessRows[0],
        { id: 'access-2', approach: 'Retrograde', side: 'Left', vessel: 'Popliteal' },
      ],
    };
    expect(analyzePlan(data).some((item) => item.id.startsWith('retrograde-fp'))).toBe(false);
  });

  test('also pre-plans a bailout for a long heavily calcified SFA stenosis', () => {
    const data = {
      ...baseCase,
      patencySegments: {
        [lesionId]: { type: 'stenosis', length: '15-20', calcium: 'heavy' },
      },
    };
    const recommendation = analyzePlan(data).find((item) => item.id.startsWith('retrograde-fp'));
    expect(recommendation).toBeTruthy();
    expect(recommendation.summary).toMatch(/long, heavily calcified lesion/i);
  });
});


test('validates crossing balloons with scoped wires, sheath size and exchange length', () => {
  const data = { ...baseCase, therapyRows: [], navRows: [{ ...baseCase.navRows[0], balloon: { ...baseCase.therapyRows[0].balloon } }] };
  expect(getBlockingPlanFindings(data).map((item) => item.title)).toEqual(expect.arrayContaining(['Balloon platform has no matching scoped wire', 'Balloon requires a larger sheath']));
  data.navRows[0].wire = { platform: '0.035', length: '300 cm' };
  data.accessRows = [{ side: 'Left', sheaths: [{ frSize: '6 Fr' }] }];
  expect(getBlockingPlanFindings(data)).toEqual([]);
  data.navRows[0].wire.length = '180 cm';
  expect(getBlockingPlanFindings(data).map((item) => item.title)).toContain('Balloon and wire working lengths are incompatible');
  data.navRows[0].scope = createTargetPathScope();
  expect(getBlockingPlanFindings(data).map((item) => item.title)).toContain('Crossing balloon needs a lesion-specific scope');
});
