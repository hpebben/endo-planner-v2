export const WOUNDOSOME_REFERENCE = {
  label: 'Patrone et al. — The woundosome concept (2024)',
  url: 'https://orbi.uliege.be/bitstream/2268/322037/1/L.Patrone%20Journal%20of%20Endovascular%20Therapy%20%282024%29%201-2.pdf',
};

export const FOOT_ANATOMY_REFERENCE = {
  label: 'Manzi et al. — Vascular imaging of the foot (RadioGraphics, 2011)',
  url: 'https://pubs.rsna.org/doi/10.1148/rg.316115511',
};

export const WOUND_ZONES = [
  {
    id: 'dorsal-toes',
    color: '#dc334c',
    label: 'Dorsal toes / forefoot',
    shortLabel: 'Dorsal toes',
    view: 'dorsal',
    primaryTapKeys: ['anterior'],
    alternativeTapKeys: ['posterior'],
    route: 'Anterior tibial artery → dorsalis pedis → dorsal/metatarsal branches',
  },
  {
    id: 'hallux-first-ray',
    color: '#b87b00',
    label: 'Hallux / first ray',
    shortLabel: 'Hallux',
    view: 'dorsal',
    primaryTapKeys: ['anterior', 'posterior'],
    alternativeTapKeys: [],
    route: 'Assess both dorsalis pedis and posterior tibial inflow: first dorsal metatarsal, medial plantar deep branch, or lateral plantar → plantar arch → first plantar metatarsal may supply the hallux',
  },
  {
    id: 'dorsum',
    color: '#087dcb',
    label: 'Dorsum of foot',
    shortLabel: 'Dorsum',
    view: 'dorsal',
    primaryTapKeys: ['anterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Anterior tibial artery → dorsalis pedis; evaluate peroneal perforating collateral supply',
  },
  {
    id: 'lateral-ankle',
    color: '#8555cf',
    label: 'Lateral ankle',
    shortLabel: 'Lateral ankle',
    view: 'dorsal',
    primaryTapKeys: ['peroneal'],
    alternativeTapKeys: ['anterior'],
    route: 'Peroneal artery → anterior perforating/lateral ankle branches',
  },
  {
    id: 'plantar-toes',
    color: '#bf3c8b',
    label: 'Plantar toes / forefoot',
    shortLabel: 'Plantar toes',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['anterior'],
    route: 'Posterior tibial artery → plantar arch → metatarsal/digital branches',
  },
  {
    id: 'medial-plantar',
    color: '#008b86',
    label: 'Medial plantar foot / instep',
    shortLabel: 'Medial plantar',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['anterior'],
    route: 'Posterior tibial artery → medial plantar artery',
  },
  {
    id: 'lateral-plantar',
    color: '#dc6b1b',
    label: 'Lateral plantar foot / fifth-ray side',
    shortLabel: 'Lateral plantar',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Posterior tibial artery → lateral plantar artery along the fifth-ray side → plantar arch (turns medially toward the first interspace)',
  },
  {
    id: 'medial-heel',
    color: '#318541',
    label: 'Medial heel',
    shortLabel: 'Medial heel',
    view: 'plantar',
    primaryTapKeys: ['posterior'],
    alternativeTapKeys: ['peroneal'],
    route: 'Posterior tibial artery → medial calcaneal branches',
  },
  {
    id: 'lateral-heel',
    color: '#4c56ad',
    label: 'Lateral heel',
    shortLabel: 'Lateral heel',
    view: 'plantar',
    primaryTapKeys: ['peroneal'],
    alternativeTapKeys: ['posterior'],
    route: 'Peroneal artery → lateral calcaneal branches',
  },
];

const TAP_LABELS = {
  anterior: 'Anterior tibial → dorsalis pedis target arterial path',
  posterior: 'Posterior tibial → plantar arch target arterial path',
  peroneal: 'Peroneal → distal collateral target arterial path',
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
