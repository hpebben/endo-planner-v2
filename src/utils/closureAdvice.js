export const CLOSURE_GUIDE_URL = 'https://evtoday.com/device-guide/european/closure-devices-1';

const closure = (label, compatibility) => ({ label, source: CLOSURE_GUIDE_URL, ...compatibility });

export const CLOSURE_CATALOG = [
  closure('6F AngioSeal', { minFr: 4, maxFr: 6, preferredFr: 6 }),
  closure('8F AngioSeal', { minFr: 7, maxFr: 8, preferredFr: 8 }),
  closure('5F Exoseal', { minFr: 5, maxFr: 5, preferredFr: 5, maxSheathLengthCm: 12 }),
  closure('6F Exoseal', { minFr: 6, maxFr: 6, preferredFr: 6, maxSheathLengthCm: 12 }),
  closure('7F Exoseal', { minFr: 7, maxFr: 7, preferredFr: 7, maxSheathLengthCm: 12 }),
  closure('FemoSeal (≤7F)', { minFr: 5, maxFr: 7 }),
  closure('5F Mynx Control', { minFr: 5, maxFr: 5, preferredFr: 5, maxSheathLengthCm: 12 }),
  closure('6F Mynx Control', { minFr: 6, maxFr: 6, preferredFr: 6, maxSheathLengthCm: 12 }),
  closure('7F Mynx Control', { minFr: 7, maxFr: 7, preferredFr: 7, maxSheathLengthCm: 12 }),
  closure('Perclose ProStyle', { minFr: 5, maxFr: 21 }),
  closure('StarClose SE', { minFr: 5, maxFr: 6 }),
  closure('5F Vascade', { minFr: 5, maxFr: 5, preferredFr: 5 }),
  closure('6F Vascade', { minFr: 6, maxFr: 6, preferredFr: 6 }),
  closure('7F Vascade', { minFr: 7, maxFr: 7, preferredFr: 7 }),
  closure('14F Manta', { minFr: 10, maxFr: 14, preferredFr: 14 }),
  closure('18F Manta', { minFr: 15, maxFr: 18, preferredFr: 18 }),
];

const numeric = (value) => {
  const parsed = Number.parseFloat(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const aliases = {
  Exoseal: '6F Exoseal',
  Mynx: '6F Mynx Control',
  Starclose: 'StarClose SE',
};

export const normalizeClosureLabel = (label) => aliases[label] || label || '';

export const getPlannedSheaths = (accessRows = []) => accessRows.flatMap((row, approachIndex) => (
  row.sheaths || []
).map((sheath, sheathIndex) => ({
  approachIndex,
  sheathIndex,
  fr: numeric(sheath.frSize),
  lengthCm: numeric(sheath.length),
  label: [sheath.frSize, sheath.length].filter(Boolean).join(' × '),
}))).filter((sheath) => sheath.fr);

export const isClosureCompatible = (device, sheath) => {
  if (!device || !sheath?.fr) return false;
  if (sheath.fr < device.minFr || sheath.fr > device.maxFr) return false;
  if (device.maxSheathLengthCm && sheath.lengthCm && sheath.lengthCm > device.maxSheathLengthCm) return false;
  return true;
};

const compatibilityScore = (device, sheath) => {
  if (!isClosureCompatible(device, sheath)) return Infinity;
  if (device.preferredFr === sheath.fr) return 0;
  if (device.maxFr === sheath.fr) return 1;
  return 2;
};

export const getClosureAdvice = (accessRows = []) => {
  const sheaths = getPlannedSheaths(accessRows);
  return sheaths.map((sheath) => {
    const compatible = CLOSURE_CATALOG
      .filter((device) => isClosureCompatible(device, sheath))
      .sort((left, right) => compatibilityScore(left, sheath) - compatibilityScore(right, sheath)
        || left.label.localeCompare(right.label));
    const bestScore = compatible.length ? compatibilityScore(compatible[0], sheath) : Infinity;
    return {
      sheath,
      compatible,
      recommended: compatible.filter((device) => compatibilityScore(device, sheath) === bestScore),
    };
  });
};

export const getCompatibleClosureOptions = (accessRows = [], selected = '') => {
  const advice = getClosureAdvice(accessRows);
  if (!advice.length) return [...CLOSURE_CATALOG.map((device) => device.label), 'Custom'];
  const labels = [...new Set(advice.flatMap((item) => item.compatible.map((device) => device.label)))];
  const normalizedSelected = normalizeClosureLabel(selected);
  if (normalizedSelected && !labels.includes(normalizedSelected)) labels.push(normalizedSelected);
  if (!labels.includes('Custom')) labels.push('Custom');
  return labels;
};

export const findClosureCompatibilityIssue = (label, accessRows = []) => {
  const normalized = normalizeClosureLabel(label);
  if (!normalized) return null;
  const device = CLOSURE_CATALOG.find((item) => item.label === normalized);
  if (!device) return null;
  const sheaths = getPlannedSheaths(accessRows);
  if (!sheaths.length) return {
    title: 'Closure compatibility cannot be assessed',
    summary: `${normalized} is selected, but no procedural sheath size is recorded.`,
  };
  if (sheaths.some((sheath) => isClosureCompatible(device, sheath))) return null;
  return {
    title: `${normalized} does not match the selected sheath`,
    summary: `${normalized} is not listed as compatible with ${sheaths.map((item) => item.label || `${item.fr} Fr`).join(', ')}. Select a size-matched closure option and confirm the current IFU.`,
  };
};
