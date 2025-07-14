// centralised defaults – tweak anytime
export default {
  // Default selections used when starting a new case
  access: {
    needle:   { size: '19 Gauge', length: '7cm' },
    sheath:   { frSize: '6 Fr', length: '12 cm' },
    catheter: { specific: 'BER2', size: '4 Fr', length: '65 cm' },
  },
  navigation: {
    wire: {
      platform: '0.018',
      length: '180 cm',
      type: 'Glidewire',
      technique: 'Intimal Tracking',
    },
  },
  vesselPrep: {
    balloon: {
      platform: '0.018',
      diameter: '5',
      length: '100',
      shaft: '80 cm',
    },
  },
  closure: { method: 'Manual pressure' },
};
