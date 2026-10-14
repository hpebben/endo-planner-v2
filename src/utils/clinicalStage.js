// Case-specific visibility; retain entered assessments when the stage changes.
export const isFontaineIV = (stage) => String(stage || '').toLowerCase() === 'iv';

export const getActiveWoundLocations = (data = {}) => (
  isFontaineIV(data.stage) && Array.isArray(data.clinical?.woundLocations)
    ? data.clinical.woundLocations
    : []
);
