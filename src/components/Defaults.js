// centralised defaults – tweak anytime
export default {
  access: {
    needle:   { gauge: '19 G', length: '7 cm' },
    sheath:   { fr: '6 F',    length: '12 cm' },
    catheter: { model: 'BER2', fr: '4 F', length: '65 cm' }
  },
  navigation: {
    wire: {
      core: '0.018', length: '180 cm',
      coating: 'Glidewire', tip: 'Intimal tracking'
    }
  },
  vesselPrep: {
    balloon: {
      platform: '0.018',
      diameter: '5 mm',
      length: '100 mm',
      shaft: '80 cm'
    }
  },
  closure: { method: 'Manual' }
};
