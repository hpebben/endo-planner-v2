import { FOOT_ARTERIES, FOOT_NODES, arteryRoutePath } from './footArterialModel';
import { buildPedalRoute, defaultPedalTarget, footArteryIdForVessel, getPedalRouteHighlights, getPedalTargetOptions, getSimplePedalTargetOptions, pedalVesselId } from './pedalRoutes';
import { buildTargetArterialPath, inferTargetPathKey, upgradeLegacyTargetPath, validateTargetArterialPath } from '../utils/lesions';

describe('continuous tibial-to-pedal routes', () => {
  test.each(['Left', 'Right'])('connects posterior inflow to the plantar arch through lateral plantar on the %s side', (side) => {
    const path = buildTargetArterialPath(side, 'posterior', { pedalTarget: 'plantar-metatarsal-3' });
    expect(path.slice(-3)).toEqual([`${side}_lateral_plantar_artery`, `${side}_plantar_arch`, `${side}_pedal_plantar_metatarsal_3`]);
    expect(validateTargetArterialPath(path).isValid).toBe(true);
    expect(inferTargetPathKey(path)).toBe('posterior');
  });

  test('follows dorsal hallux outflow beyond dorsalis pedis into the digital branch', () => {
    const path = buildTargetArterialPath('Left', 'anterior', { pedalTarget: 'dorsal-digital-1-medial' });
    expect(path.slice(-3)).toEqual(['Left_dorsal_pedal_artery', 'Left_pedal_dorsal_metatarsal_1', 'Left_pedal_dorsal_digital_1_medial']);
    expect(validateTargetArterialPath(path).isValid).toBe(true);
    expect(getPedalRouteHighlights(path)['dorsal-metatarsal-1']).toEqual([0, 2]);
  });

  test('routes heel and medial instep targets to their named feeding branches', () => {
    expect(buildPedalRoute('posterior', 'medial-calcaneal')).toEqual(['posterior-tibial', 'medial-calcaneal']);
    expect(buildPedalRoute('peroneal', 'lateral-calcaneal')).toEqual(['peroneal', 'lateral-calcaneal']);
    expect(buildPedalRoute('posterior', 'medial-plantar-superficial')).toEqual(['posterior-tibial', 'medial-plantar', 'medial-plantar-superficial']);
    expect(buildPedalRoute('peroneal', 'medial-calcaneal')).toEqual([]);
    expect(defaultPedalTarget('peroneal', ['lateral-heel'])).toBe('lateral-calcaneal');
    expect(defaultPedalTarget('posterior', ['medial-heel'])).toBe('medial-calcaneal');
    expect(defaultPedalTarget('posterior', ['lateral-plantar'])).toBe('lateral-plantar');
  });

  test.each(['anterior', 'posterior', 'peroneal'])('every %s option is continuous in both projections and retains its chosen inflow', (key) => {
    for (const option of getPedalTargetOptions(key)) {
      const route = buildPedalRoute(key, option.value);
      const path = buildTargetArterialPath('Right', key, { pedalTarget: option.value });
      expect(route.length).toBeGreaterThan(1);
      expect(footArteryIdForVessel(path[path.length - 1])).toBe(option.value);
      expect(validateTargetArterialPath(path).isValid).toBe(true);
      expect(inferTargetPathKey(path)).toBe(key);
      const highlights = getPedalRouteHighlights(path);
      for (let index = 0; index < route.length; index += 1) {
        const artery = FOOT_ARTERIES.find((item) => item.id === route[index]);
        const range = highlights[artery.id];
        expect(range).toBeDefined();
        expect(range[1]).toBeGreaterThan(range[0]);
        for (const view of ['ap', 'lateral']) expect(arteryRoutePath(artery, view, range)).not.toMatch(/NaN|undefined/);
        if (index > 0) {
          const previous = FOOT_ARTERIES.find((item) => item.id === route[index - 1]);
          expect(artery.nodeIds.some((node) => previous.nodeIds.includes(node) && FOOT_NODES[node])).toBe(true);
        }
      }
    }
  });

  test('upgrades a saved DP endpoint without losing lesion or device data', () => {
    const original = { stage: 'iv', clinical: { woundLocations: ['hallux-first-ray'] }, targetArterialPath: ['Left_common_femoral_artery', 'Left_superficial_femoral_artery', 'Left_popliteal_artery_artery', 'Left_anterior_tibial_artery', 'Left_dorsal_pedal_artery'], navRows: [{ id: 'wire', lesionId: 'Left_superficial_femoral_artery' }] };
    const migrated = upgradeLegacyTargetPath(original);
    expect(migrated.targetArterialPath[migrated.targetArterialPath.length - 1]).toBe('Left_pedal_dorsal_metatarsal_1');
    expect(migrated.navRows).toEqual(original.navRows);
    expect(upgradeLegacyTargetPath(migrated)).toEqual(migrated);
  });

  test('repairs the legacy posterior-to-arch shortcut and rejects disconnected or wrong-side routes', () => {
    const legacy = { targetArterialPath: ['Left_common_femoral_artery', 'Left_superficial_femoral_artery', 'Left_popliteal_artery_artery', 'Left_tibioperoneal_trunk', 'Left_posterior_tibial_artery', 'Left_plantar_arch'] };
    const migrated = upgradeLegacyTargetPath(legacy);
    expect(migrated.targetArterialPath.slice(-3)).toEqual(['Left_posterior_tibial_artery', 'Left_lateral_plantar_artery', 'Left_plantar_arch']);
    expect(validateTargetArterialPath(migrated.targetArterialPath).isValid).toBe(true);
    expect(validateTargetArterialPath(legacy.targetArterialPath).isValid).toBe(false);
    const path = buildTargetArterialPath('Left', 'anterior');
    expect(validateTargetArterialPath([...path, pedalVesselId('Right', 'dorsal-metatarsal-1')]).isValid).toBe(false);
    expect(validateTargetArterialPath([...path, path[path.length - 1]]).isValid).toBe(false);
  });
});


test('simplifies general pedal targets while retaining wound branches and saved detailed endpoints', () => {
  const simple = getSimplePedalTargetOptions('anterior', ['dorsum']);
  expect(simple.filter((item) => !item.suggested).length).toBeLessThanOrEqual(7);
  expect(simple.some((item) => item.value === 'dorsal-digital-4-medial')).toBe(false);
  expect(getSimplePedalTargetOptions('anterior', ['hallux-first-ray']).some((item) => item.value === 'dorsal-digital-1-medial' && item.suggested)).toBe(true);
  expect(getSimplePedalTargetOptions('anterior', [], 'dorsal-digital-4-medial')).toContainEqual(expect.objectContaining({ value: 'dorsal-digital-4-medial', group: 'Saved target' }));
});
