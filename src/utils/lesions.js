import rawVesselData from '../assets/vessel-map.json';

const vesselSegments = Array.isArray(rawVesselData?.segments) ? rawVesselData.segments : [];
const vesselNames = new Map(vesselSegments.map((segment) => [segment.id, segment.name]));

export const sideFromVesselId = (id) => {
  const normalized = String(id || '').toLowerCase();
  if (normalized.startsWith('left_')) return 'Left';
  if (normalized.startsWith('right_')) return 'Right';
  return null;
};

export const vesselName = (id) => vesselNames.get(id) || String(id || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase());

export const territoryFromVesselId = (id) => {
  const normalized = String(id || '').toLowerCase();
  if (/metatarsal|plantar|dorsal_pedal/.test(normalized)) return 'pedal';
  if (/anterior_tib|posterior_tib|peroneal|tibioperoneal/.test(normalized)) return 'infrapopliteal';
  if (/superficial_femoral|popliteal/.test(normalized)) return 'femoropopliteal';
  if (/iliac|common_femoral|profunda|aorta/.test(normalized)) return 'inflow';
  return 'other';
};

const lengthLabel = (value) => ({
  '<3': '<3 cm',
  '3-10': '3–10 cm',
  '10-15': '10–15 cm',
  '15-20': '15–20 cm',
  '>20': '>20 cm',
}[value] || value || 'length not entered');

export const lesionLabel = (id, values = {}) => {
  const findings = [values.type, lengthLabel(values.length), values.calcium && `${values.calcium} calcium`]
    .filter(Boolean)
    .join(', ');
  return findings ? `${vesselName(id)} — ${findings}` : vesselName(id);
};

export const getLesionOptions = (segments = {}) => Object.entries(segments || {}).map(([id, values]) => ({
  value: id,
  label: lesionLabel(id, values),
  name: vesselName(id),
  side: sideFromVesselId(id),
  territory: territoryFromVesselId(id),
  findings: values,
}));

const idFor = (side, leftId, rightId = leftId) => (side === 'Left' ? `Left_${leftId}` : `Right_${rightId}`);

export const TARGET_PATH_OPTIONS = [
  {
    key: 'anterior',
    shortLabel: 'Anterior tibial',
    description: 'Anterior tibial → dorsalis pedis',
  },
  {
    key: 'posterior',
    shortLabel: 'Posterior tibial',
    description: 'Posterior tibial → plantar arch',
  },
  {
    key: 'peroneal',
    shortLabel: 'Peroneal',
    description: 'Peroneal → distal collateral outflow',
  },
];

export const buildTargetArterialPath = (side, targetKey) => {
  if (!['Left', 'Right'].includes(side)) return [];
  const common = [
    idFor(side, 'common_femoral_artery'),
    idFor(side, 'superficial_femoral_artery'),
    idFor(side, 'popliteal_artery_artery'),
  ];

  if (targetKey === 'anterior') {
    return [
      ...common,
      idFor(side, 'anterior_tibial_artery', 'anterior_tibital_artery'),
      idFor(side, 'dorsal_pedal_artery'),
    ];
  }
  if (targetKey === 'posterior') {
    return [
      ...common,
      idFor(side, 'tibioperoneal_trunk'),
      idFor(side, 'posterior_tibial_artery'),
      idFor(side, 'plantar_arch'),
    ];
  }
  if (targetKey === 'peroneal') {
    return [
      ...common,
      idFor(side, 'tibioperoneal_trunk'),
      idFor(side, 'peroneal_artery'),
    ];
  }
  return [];
};

export const inferTargetPathKey = (path = []) => {
  const joined = (Array.isArray(path) ? path : []).join(' ').toLowerCase();
  if (joined.includes('anterior_tib')) return 'anterior';
  if (joined.includes('posterior_tib')) return 'posterior';
  if (joined.includes('peroneal')) return 'peroneal';
  return '';
};

export const formatTargetArterialPath = (path = []) => (Array.isArray(path) ? path : [])
  .map(vesselName)
  .map((name) => name.replace(/^(Left|Right) /, ''))
  .join(' → ');
