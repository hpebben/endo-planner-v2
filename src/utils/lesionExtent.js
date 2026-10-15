// Drawing references, not patient measurements or universal population means.
// Study-derived values and illustrative defaults are distinguished in the UI.
export const SEGMENT_LENGTH_REFERENCES = [
  { pattern: /superficial_femoral/, cm: 35, basis: 'published model', url: 'https://doi.org/10.1177/1708538115586939' },
  { pattern: /common_femoral/, cm: 4, basis: 'illustrative reference' },
  { pattern: /profunda_femoral/, cm: 25, basis: 'illustrative reference' },
  { pattern: /common_iliac/, cm: 6.1, basis: 'study mean (rounded)', url: 'https://journals.viamedica.pl/folia_morphologica/article/download/FM.a2020.0109/51817' },
  { pattern: /external_iliac|extrnal_iliac/, cm: 10, basis: 'study mean (rounded)', url: 'https://pubmed.ncbi.nlm.nih.gov/30595337/' },
  { pattern: /internal_iliac/, cm: 3.7, basis: 'study mean', url: 'https://doi.org/10.1155/2014/597103' },
  { pattern: /tibioperoneal/, cm: 3.2, basis: 'study mean', url: 'https://doi.org/10.26650/IUITFD.1266936' },
  { pattern: /popliteal/, cm: 18.4, basis: 'study mean', url: 'https://www.worldwidejournals.com/international-journal-of-scientific-research-(IJSR)/recent_issues_pdf/2023/March/a-cadaveric-study-of-length-of-popliteal-artery_March_2023_8164473206_2319940.pdf' },
  { pattern: /anterior_tib|posterior_tib|peroneal_artery/, cm: 30, basis: 'illustrative reference' },
  { pattern: /dorsal_pedal/, cm: 6.7, basis: 'study mean (rounded)', url: 'https://www.jlmc.edu.np/index.php/JLMC/article/view/559' },
  { pattern: /lateral_plantar/, cm: 10, basis: 'illustrative reference' },
  { pattern: /medial_plantar/, cm: 8, basis: 'illustrative reference' },
  { pattern: /plantar_arch/, cm: 6, basis: 'illustrative reference' },
];

export const positiveLength = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
export const lengthCategoryForCm = (value) => {
  const cm = positiveLength(value);
  if (cm === null) return '';
  return cm < 3 ? '<3' : cm < 10 ? '3-10' : cm < 15 ? '10-15' : cm <= 20 ? '15-20' : '>20';
};
const rangeEstimates = { '<3': 1.5, '3-10': 6.5, '10-15': 12.5, '15-20': 17.5, '>20': 20 };

export const getLesionExtent = (segmentId, values = {}) => {
  const reference = SEGMENT_LENGTH_REFERENCES.find((item) => item.pattern.test(String(segmentId).toLowerCase()));
  const customReference = positiveLength(values.referenceLengthCm);
  const referenceCm = customReference || reference?.cm || null;
  const measuredCm = positiveLength(values.measuredLengthCm);
  const lesionCm = measuredCm || rangeEstimates[values.length] || null;
  const fraction = referenceCm && lesionCm ? Math.min(1, lesionCm / referenceCm) : null;
  const position = 'middle';
  const start = fraction === null ? 0 : (1 - fraction) / 2;
  const kind = measuredCm ? 'measured' : values.length === '>20' ? 'lower-bound' : lesionCm ? 'range estimate' : 'not entered';
  return { referenceCm, lesionCm, fraction, start, kind, position, basis: customReference ? 'entered reference' : reference?.basis || '', sourceUrl: customReference ? '' : reference?.url || '' };
};

export const lesionExtentDescription = (segmentId, values) => {
  const extent = getLesionExtent(segmentId, values);
  if (extent.fraction === null) return 'Affected segment outlined; lesion extent is not estimated.';
  const sign = extent.kind === 'lower-bound' ? '≥' : '≈';
  return `${extent.lesionCm} cm (${extent.kind}); ${sign}${Math.round(extent.fraction * 100)}% of a ${extent.referenceCm} cm drawing reference. Position is schematic.${extent.lesionCm > extent.referenceCm ? ' Length exceeds the drawing reference; fill is capped at the whole segment.' : ''}`;
};
