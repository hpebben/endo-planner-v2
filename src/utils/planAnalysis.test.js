import { analyzePlan, getBlockingPlanFindings, wireLengthRequired } from './planAnalysis';
import { WIRE_ROLES } from '../data/wireCatalog';

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
  test('detects platform and sheath incompatibilities', () => {
    const blocking = getBlockingPlanFindings(baseCase);
    expect(blocking.map((item) => item.title)).toEqual(expect.arrayContaining([
      'Balloon platform has no matching lesion wire',
      'Balloon requires a larger sheath',
    ]));
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
