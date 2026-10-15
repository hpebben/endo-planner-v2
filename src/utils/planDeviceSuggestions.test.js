import { separatePlanDeviceSuggestions, getSuggestedDeviceProfiles } from './planDeviceSuggestions';
import { createLesionScope, createTargetPathScope } from './planScopes';
import { analyzePlan } from './planAnalysis';

const lesionId = 'Left_superficial_femoral_artery';
const otherLesionId = 'Left_anterior_tibial_artery';
const base = {
  patencySegments: { [lesionId]: {}, [otherLesionId]: {} },
  targetArterialPath: [lesionId, otherLesionId],
};

describe('available devices versus the selected plan', () => {
  test('retains scoped and explicitly linked legacy devices and shared support', () => {
    const data = {
      ...base,
      navRows: [
        { id: 'old', lesionId, wire: { product: 'Chosen crossing wire' } },
        { id: 'shared', scope: createTargetPathScope(), catheter: { specific: 'Chosen support' } },
      ],
      therapyRows: [{ scope: createLesionScope([lesionId, otherLesionId]), stent: { product: 'Chosen stent' } }],
    };
    const result = separatePlanDeviceSuggestions(data);
    expect(result.navRows).toEqual(data.navRows);
    expect(result.therapyRows).toEqual(data.therapyRows);
    expect(result.planDeviceSuggestions).toEqual({ navigation: [], therapy: [] });
  });

  test('stores unlinked and removed-lesion devices as choices without blocking or exporting them as selected', () => {
    const wire = { product: 'Legacy local wire', platform: '0.018', length: '300 cm' };
    const balloon = { diameter: '5', length: '120', platform: '0.018' };
    const data = {
      ...base,
      navRows: [{ id: 'unlinked', wire }],
      therapyRows: [{ id: 'removed', scope: createLesionScope('Right_removed'), balloon }],
    };
    const result = separatePlanDeviceSuggestions(data);
    expect(result.navRows).toEqual([]);
    expect(result.therapyRows).toEqual([]);
    expect(getSuggestedDeviceProfiles(result.planDeviceSuggestions, 'wire')).toEqual([wire]);
    expect(getSuggestedDeviceProfiles(result.planDeviceSuggestions, 'balloon')).toEqual([balloon]);
    expect(analyzePlan(result).filter((item) => item.level === 'error')).toEqual([]);
    expect(data.navRows).toHaveLength(1);
    expect(separatePlanDeviceSuggestions(result)).toEqual(result);
  });

  test('retains existing choices and their full custom specifications through repeated restores', () => {
    const row = { id: 'old', catheter: { specific: 'Local catheter', length: '157 cm' }, device: 'Custom adjunct' };
    const result = separatePlanDeviceSuggestions({
      ...base,
      planDeviceSuggestions: { navigation: [row], therapy: [] },
      navRows: [row, { id: 'empty', wire: {} }],
    });
    expect(result.planDeviceSuggestions.navigation).toEqual([row]);
    expect(getSuggestedDeviceProfiles(result.planDeviceSuggestions, 'catheter')).toEqual([row.catheter]);
    expect(getSuggestedDeviceProfiles(result.planDeviceSuggestions, 'specialDevice')).toEqual(['Custom adjunct']);
    expect(result.navRows).toEqual([]);
  });
});
