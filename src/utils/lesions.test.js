import {
  buildTargetArterialPath,
  formatTargetArterialPath,
  getLesionOptions,
  inferTargetPathKey,
} from './lesions';

describe('target arterial path and lesion labels', () => {
  test('builds a continuous anterior target path using the legacy right ATA identifier', () => {
    const path = buildTargetArterialPath('Right', 'anterior');
    expect(path).toEqual([
      'Right_common_femoral_artery',
      'Right_superficial_femoral_artery',
      'Right_popliteal_artery_artery',
      'Right_anterior_tibital_artery',
      'Right_dorsal_pedal_artery',
    ]);
    expect(inferTargetPathKey(path)).toBe('anterior');
    expect(formatTargetArterialPath(path)).toMatch(/superficial femoral artery.*dorsal pedal artery/i);
  });

  test('turns anatomy entries into compact lesion choices', () => {
    const options = getLesionOptions({
      Left_superficial_femoral_artery: { type: 'occlusion', length: '>20', calcium: 'heavy' },
    });
    expect(options[0]).toMatchObject({
      value: 'Left_superficial_femoral_artery',
      side: 'Left',
      territory: 'femoropopliteal',
    });
    expect(options[0].label).toMatch(/occlusion.*>20 cm.*heavy calcium/i);
  });
});
