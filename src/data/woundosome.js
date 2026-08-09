export const WOUNDOSOME_REFERENCE = {
  label: 'Patrone et al. — The woundosome concept (2024)',
  url: 'https://orbi.uliege.be/bitstream/2268/322037/1/L.Patrone%20Journal%20of%20Endovascular%20Therapy%20%282024%29%201-2.pdf',
};

export const WOUND_ZONES = [
  {
    id: 'dorsal-toes',
    label: 'Dorsal toes / forefoot',
    shortLabel: 'Dorsal toes',
    view: 'dorsal',
    primaryTapKeys: ['anterior'],
    alternativeTapKeys: ['posterior'],
    route: 'Anterior tibial artery → dorsalis pedis → dorsal/metatarsal branches',
  },
  {
    id: 'hallux-first-ray',
    label: 'Hallux / first ray',
    shortLabel: 'Hallux',
    view: 'dorsal',
    primaryTapKeys: ['anterior', 'posterior'],
    alternativeTapKeys: [],
    route: 'Assess both dorsalis pedis and medial plantar inflow; either may directly feed the first-toe wound bed',
  },
  {
    id: 'dorsum',
    label: 'Dorsum of foot',
    shortLabel: 'Dorsum',
    view: 'dorsal',
    primaryTapKeys: ['anterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Anterior tibial artery → dorsalis pedis; evaluate peroneal perforating collateral supply',
  },
  {
    id: 'lateral-ankle',
    label: 'Lateral ankle',
    shortLabel: 'Lateral ankle',
    view: 'dorsal',
    primaryTapKeys: ['peroneal'],
    alternativeTapKeys: ['anterior'],
    route: 'Peroneal artery → anterior perforating/lateral ankle branches',
  },
  {
    id: 'plantar-toes',
    label: 'Plantar toes / forefoot',
    shortLabel: 'Plantar toes',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['anterior'],
    route: 'Posterior tibial artery → plantar arch → metatarsal/digital branches',
  },
  {
    id: 'medial-plantar',
    label: 'Medial plantar foot / instep',
    shortLabel: 'Medial plantar',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['anterior'],
    route: 'Posterior tibial artery → medial plantar artery',
  },
  {
    id: 'lateral-plantar',
    label: 'Lateral plantar foot',
    shortLabel: 'Lateral plantar',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Posterior tibial artery → lateral plantar artery/plantar arch',
  },
  {
    id: 'medial-heel',
    label: 'Medial heel',
    shortLabel: 'Medial heel',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Posterior tibial artery → medial calcaneal branches',
  },
  {
    id: 'lateral-heel',
    label: 'Lateral heel',
    shortLabel: 'Lateral heel',
    view: 'plantar',
    primaryTapKeys: ['peroneal'],
    alternativeTapKeys: ['posterior'],
    route: 'Peroneal artery → lateral calcaneal branches',
  },
];

const TAP_LABELS = {
  anterior: 'Anterior tibial → dorsalis pedis TAP',
  posterior: 'Posterior tibial → plantar arch TAP',
  peroneal: 'Peroneal → distal collateral TAP',
};

const unique = (values) => [...new Set(values.filter(Boolean))];

export const getWoundZones = (selectedIds = []) => {
  const selected = new Set(Array.isArray(selectedIds) ? selectedIds : []);
  return WOUND_ZONES.filter((zone) => selected.has(zone.id));
};

export const getWoundosomeAdvice = (selectedIds = []) => {
  const zones = getWoundZones(selectedIds);
  const primaryTapKeys = unique(zones.flatMap((zone) => zone.primaryTapKeys));
  const alternativeTapKeys = unique(
    zones.flatMap((zone) => zone.alternativeTapKeys)
      .filter((key) => !primaryTapKeys.includes(key)),
  );

  return {
    zones,
    primaryTapKeys,
    alternativeTapKeys,
    primaryLabels: primaryTapKeys.map((key) => TAP_LABELS[key]),
    alternativeLabels: alternativeTapKeys.map((key) => TAP_LABELS[key]),
    routes: unique(zones.map((zone) => zone.route)),
    isSuggested: (tapKey) => primaryTapKeys.includes(tapKey),
    isAlternative: (tapKey) => alternativeTapKeys.includes(tapKey),
  };
};

export const woundZoneLabel = (id) => WOUND_ZONES.find((zone) => zone.id === id)?.label || id;
