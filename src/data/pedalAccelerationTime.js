export const PAT_REFERENCES = [
  {
    label: 'Sommerset et al. (2019) — PAT classification',
    url: 'https://doi.org/10.1016/j.avsg.2019.03.002',
  },
  {
    label: 'Teso et al. (2021) — pedal acceleration time',
    url: 'https://doi.org/10.1016/j.avsg.2021.02.038',
  },
];

export const PAT_ARTERIES = [
  { id: 'dorsalis-pedis', label: 'Dorsalis pedis artery' },
  { id: 'lateral-plantar', label: 'Lateral plantar artery' },
  { id: 'medial-plantar', label: 'Medial plantar artery' },
  { id: 'deep-plantar', label: 'Deep plantar artery' },
  { id: 'arcuate', label: 'Arcuate artery' },
  { id: 'first-dorsal-metatarsal', label: 'First dorsal metatarsal artery' },
];

export const PAT_CATEGORIES = [
  { category: 1, label: 'No ischemia', range: '≤120 ms', tone: 'normal' },
  { category: 2, label: 'Mild ischemia', range: '121–180 ms', tone: 'mild' },
  { category: 3, label: 'Moderate ischemia', range: '181–224 ms', tone: 'moderate' },
  { category: 4, label: 'Severe ischemia', range: '>225 ms', tone: 'severe' },
];

export const parsePatMilliseconds = (value) => {
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '') return null;
  const milliseconds = Number(value);
  return Number.isFinite(milliseconds) && Number.isInteger(milliseconds) && milliseconds > 0
    ? milliseconds
    : null;
};

export const classifyPat = (value) => {
  const milliseconds = parsePatMilliseconds(value);
  if (milliseconds === null) return null;
  // The original publications specify 181–224 and >225, leaving exactly 225
  // unassigned. Preserve that boundary rather than inventing a clinical class.
  if (milliseconds === 225) {
    return { category: null, label: 'Boundary value — confirm classification', range: '225 ms', tone: 'boundary' };
  }
  const index = milliseconds <= 120 ? 0 : milliseconds <= 180 ? 1 : milliseconds <= 224 ? 2 : 3;
  return PAT_CATEGORIES[index];
};

export const patCategoryLabel = (result) => (result?.category
  ? `Category ${result.category} — ${result.label.toLowerCase()}`
  : result?.label || 'Not measured');

export const getPatMeasurements = (clinical = {}) => (
  Array.isArray(clinical?.patMeasurements)
    ? clinical.patMeasurements.filter((row) => row && typeof row === 'object')
    : []
);

export const hasPatMeasurementValue = (row) => Boolean(row.artery || String(row.milliseconds ?? '').trim());

export const getPatMeasurementError = (row) => {
  if (!hasPatMeasurementValue(row)) return '';
  if (!PAT_ARTERIES.some((artery) => artery.id === row.artery)) return 'Choose the artery measured for PAT.';
  if (parsePatMilliseconds(row.milliseconds) === null) return 'Enter PAT as a positive whole number in milliseconds.';
  return '';
};

export const getPatSummaryLines = (clinical = {}) => getPatMeasurements(clinical)
  .filter(hasPatMeasurementValue)
  .map((row) => {
    const artery = PAT_ARTERIES.find((option) => option.id === row.artery)?.label || 'Artery not selected';
    if (getPatMeasurementError(row)) return `PAT: ${artery} — incomplete measurement`;
    return `PAT: ${artery} — ${parsePatMilliseconds(row.milliseconds)} ms — ${patCategoryLabel(classifyPat(row.milliseconds))}`;
  });
