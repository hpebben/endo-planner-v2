import { getPlanScope, hasPlanItemContent } from './planScopes';

// An unlinked device is an available choice, not an instruction to use it.
// Keep its original payload separately so old/custom specifications survive.
export const separatePlanDeviceSuggestions = (data = {}) => {
  const lesionIds = new Set(Object.keys(data.patencySegments || {}));
  const suggestions = {
    navigation: [...(data.planDeviceSuggestions?.navigation || [])],
    therapy: [...(data.planDeviceSuggestions?.therapy || [])],
  };
  const partition = (rows = [], kind) => rows.filter((row) => {
    const scope = getPlanScope(row);
    const linked = scope && (scope.type === 'targetPath'
      ? kind === 'navigation'
      : scope.ids.every((id) => lesionIds.has(id)));
    if (linked) return true;
    if (hasPlanItemContent(row) && !suggestions[kind].some((item) => JSON.stringify(item) === JSON.stringify(row))) {
      suggestions[kind].push(row);
    }
    return false;
  });
  return {
    ...data,
    navRows: partition(data.navRows, 'navigation'),
    therapyRows: partition(data.therapyRows, 'therapy'),
    planDeviceSuggestions: suggestions,
  };
};

export const getSuggestedDeviceProfiles = (suggestions = {}, type) => {
  const rows = type === 'wire' || type === 'catheter'
    ? suggestions.navigation || []
    : type === 'specialDevice' || type === 'balloon'
      ? [...(suggestions.navigation || []), ...(suggestions.therapy || [])]
      : suggestions.therapy || [];
  const field = type === 'specialDevice' ? 'device' : type;
  return rows.map((row) => row[field]).filter((value) => hasPlanItemContent({ device: value }));
};

export const mergeDeviceProfiles = (...groups) => {
  const seen = new Set();
  return groups.flat().filter((value) => {
    const key = typeof value === 'object'
      ? JSON.stringify(value, Object.keys(value).sort()) : String(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
