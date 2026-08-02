const BOTH_TECHNIQUES = [
  'Intimal Tracking',
  'Limited sub-intimal dissection and re-entry',
];

const wire = (manufacturer, name, platform, lengths, category, techniques = BOTH_TECHNIQUES) => ({
  id: `${manufacturer}-${name}-${platform}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  manufacturer,
  name,
  platform,
  lengths,
  category,
  techniques,
  label: `${manufacturer} — ${name}`,
});

// Peripheral guidewires listed in the cited lower-extremity reviews and the
// Endovascular Today European Device Guide. The catalogue is deliberately
// data-driven so additional device classes can be added without changing the UI.
export const WIRE_CATALOG = [
  wire('Terumo', 'Radifocus Glidewire Advantage', '0.014', [180, 300], 'Glidewire'),
  wire('Terumo', 'Radifocus Glidewire Advantage Track', '0.014', [180, 300], 'Glidewire'),
  wire('Medtronic', 'Cougar LS', '0.014', [190, 300], 'Glidewire'),
  wire('Medtronic', 'Cougar XT', '0.014', [190, 300], 'Glidewire'),
  wire('Medtronic', 'Intuition', '0.014', [180, 300], 'Glidewire'),
  wire('Medtronic', 'Nitrex', '0.014', [180, 300], 'Glidewire'),
  wire('Medtronic', 'Zinger Light', '0.014', [180, 300], 'Glidewire'),
  wire('Boston Scientific', 'Thruway', '0.014', [190, 300], 'Glidewire'),
  wire('Boston Scientific', 'Platinum Plus', '0.014', [180, 260, 300], 'Glidewire'),
  wire('Cordis', 'Stabilizer', '0.014', [180, 300], 'Glidewire'),

  wire('Terumo', 'Radifocus Glidewire Advantage', '0.018', [180, 300], 'Glidewire'),
  wire('Terumo', 'Radifocus Glidewire Advantage Track', '0.018', [180, 300], 'Glidewire'),
  wire('Terumo', 'Radifocus Guide Wire M', '0.018', [180, 260, 300], 'Glidewire'),
  wire('Cook Medical', 'Roadrunner UniGlide', '0.018', [180, 260], 'Glidewire'),
  wire('Merit Medical', 'Splash Hydrophilic Guide Wire', '0.018', [180, 260], 'Glidewire'),
  wire('Medtronic', 'Nitrex', '0.018', [180, 300], 'Glidewire'),
  wire('Boston Scientific', 'Thruway', '0.018', [190, 300], 'Glidewire'),
  wire('Boston Scientific', 'Platinum Plus', '0.018', [180, 260, 300], 'Glidewire'),
  wire('Merit Medical', 'InQwire PTFE Coated', '0.018', [180, 260], 'Glidewire'),

  wire('Terumo', 'Radifocus Guide Wire M', '0.035', [180, 260, 300], 'Glidewire'),
  wire('Terumo', 'Radifocus Glidewire Advantage', '0.035', [180, 260], 'Glidewire'),
  wire('Cook Medical', 'Roadrunner PC', '0.035', [180, 260], 'Glidewire'),
  wire('Cook Medical', 'Roadrunner UniGlide', '0.035', [180, 260], 'Glidewire'),
  wire('Merit Medical', 'Splash Hydrophilic Guide Wire', '0.035', [180, 260], 'Glidewire'),
  wire('Medtronic', 'Wholey Guidewire System', '0.035', [175, 260, 300], 'Glidewire'),

  wire('Cook Medical', 'Approach CTO', '0.014', [190, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Gladius MG PV', '0.014', [200, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Halberd', '0.014', [200, 235, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Astato XS 20', '0.014', [180, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Astato XS 40', '0.014', [200, 300], 'CTO wire'),
  wire('Medtronic', 'ProVia 3', '0.014', [180, 300], 'CTO wire'),
  wire('Medtronic', 'ProVia 6', '0.014', [180, 300], 'CTO wire'),
  wire('Medtronic', 'ProVia 9', '0.014', [180, 300], 'CTO wire'),
  wire('Medtronic', 'ProVia 12', '0.014', [180, 300], 'CTO wire'),
  wire('Abbott', 'Hi-Torque Proceed', '0.014', [190, 300], 'CTO wire'),
  wire('Abbott', 'Hi-Torque Winn 40', '0.014', [190, 300], 'CTO wire'),
  wire('Abbott', 'Hi-Torque Winn 80', '0.014', [190, 300], 'CTO wire'),
  wire('Abbott', 'Hi-Torque Winn 200', '0.014', [190, 300], 'CTO wire'),
  wire('Boston Scientific', 'V-14 ControlWire', '0.014', [182, 300], 'CTO wire'),
  wire('Boston Scientific', 'Victory 14', '0.014', [195, 300], 'CTO wire'),

  wire('Asahi Intecc', 'Gaia PV', '0.018', [200, 235, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Gladius', '0.018', [200, 235, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Gladius MG PV', '0.018', [200, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Halberd', '0.018', [200, 235, 300], 'CTO wire'),
  wire('Asahi Intecc', 'Astato 30', '0.018', [180, 300], 'CTO wire'),
  wire('Abbott', 'Hi-Torque Connect 250T', '0.018', [145, 195, 300], 'CTO wire'),
  wire('Boston Scientific', 'V-18 ControlWire', '0.018', [200, 300], 'CTO wire'),
  wire('Boston Scientific', 'Victory 18', '0.018', [195, 300], 'CTO wire'),
  wire('Cook Medical', 'Roadrunner Extra-Support', '0.018', [180, 270, 300], 'CTO wire'),
  wire('Cordis', 'Jindo Steerable Guidewire', '0.035', [180, 300], 'CTO wire'),

  wire('Abbott', 'Hi-Torque Spartacore 14', '0.014', [190, 300], 'Support wire'),
  wire('Cordis', 'ATW Eco Pacs', '0.014', [195, 300], 'Support wire'),
  wire('Boston Scientific', 'Platinum Plus', '0.014', [180, 260, 300], 'Support wire'),
  wire('Abbott', 'Hi-Torque Steelcore 18', '0.018', [190, 300], 'Support wire'),
  wire('Abbott', 'Hi-Torque Steelcore 18 LT', '0.018', [190, 300], 'Support wire'),
  wire('Medtronic', 'Nitrex', '0.018', [180, 300], 'Support wire'),
  wire('Boston Scientific', 'Platinum Plus', '0.018', [180, 260, 300], 'Support wire'),
  wire('Cook Medical', 'Classic Bentson', '0.018', [180, 260], 'Support wire'),
  wire('Cook Medical', 'Amplatz Extra Stiff', '0.035', [180, 260, 300], 'Support wire'),
  wire('Cook Medical', 'Amplatz Stiff', '0.035', [180, 260], 'Support wire'),
  wire('Boston Scientific', 'Amplatz Super Stiff', '0.035', [180, 260], 'Support wire'),
  wire('Cook Medical', 'Amplatz Ultra Stiff', '0.035', [180, 260], 'Support wire'),
  wire('Boston Scientific', 'Back-up Meier', '0.035', [185, 300], 'Support wire'),
  wire('Cook Medical', 'Classic Rosen', '0.035', [180, 260], 'Support wire'),
  wire('Cook Medical', 'Lunderquist', '0.035', [180, 260, 300], 'Support wire'),
  wire('Medtronic', 'Nitrex Flexible Shaft', '0.035', [180, 260], 'Support wire'),
  wire('Medtronic', 'Nitrex Stiff Shaft', '0.035', [180, 260, 300], 'Support wire'),
  wire('Abbott', 'Hi-Torque Supra Core 35', '0.035', [190, 300], 'Support wire'),
  wire('Abbott', 'Hi-Torque Versacore', '0.035', [175, 260, 300], 'Support wire'),
  wire('Cordis', 'Storq', '0.035', [180, 300], 'Support wire'),
];

const numericLength = (value) => Number.parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);

export const getWireLengthOptions = (platform, category = '') => {
  if (!platform) return [];
  return [...new Set(
    WIRE_CATALOG
      .filter((item) => item.platform === platform && (!category || item.category === category))
      .flatMap((item) => item.lengths),
  )].sort((a, b) => a - b).map((length) => `${length} cm`);
};

export const getWireProductOptions = (
  { platform, length, category, technique },
  preferredProducts = [],
) => {
  const selectedLength = numericLength(length);
  const preferredOrder = new Map(
    preferredProducts.filter(Boolean).map((product, index) => [product, index]),
  );

  return WIRE_CATALOG
    .filter((item) => (
      item.platform === platform &&
      item.category === category &&
      item.lengths.includes(selectedLength) &&
      (!technique || item.techniques.includes(technique))
    ))
    .sort((a, b) => {
      const aPreferred = preferredOrder.has(a.label) ? preferredOrder.get(a.label) : Infinity;
      const bPreferred = preferredOrder.has(b.label) ? preferredOrder.get(b.label) : Infinity;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      return a.label.localeCompare(b.label);
    })
    .map((item) => ({
      label: preferredOrder.has(item.label) ? `★ ${item.label}` : item.label,
      value: item.label,
      preferred: preferredOrder.has(item.label),
    }));
};
