export const POPLITEAL_SEGMENTS = [
  { value: 'P1', description: 'Proximal: adductor hiatus to the upper border of the patella.' },
  { value: 'P2', description: 'Middle: upper border of the patella to the knee joint line.' },
  { value: 'P3', description: 'Distal: knee joint line to the anterior tibial artery origin.' },
];
export const POPLITEAL_SEGMENT_REFERENCE = 'https://epos.myesr.org/poster/esr/ecr2025/C-16124/findings%20and%20procedure%20details';
export const isPoplitealSegment = (id) => /popliteal/.test(String(id).toLowerCase());
export const normalizePoplitealSegments = (values) => POPLITEAL_SEGMENTS.map((part) => part.value).filter((part) => Array.isArray(values) && values.includes(part));
export const poplitealSegmentLabel = (id, values = {}) => isPoplitealSegment(id) ? normalizePoplitealSegments(values.poplitealSegments).join(' + ') : '';

// Placement is relative to the remaining space in the schematic artery:
// 0 = proximal end, 0.5 = centered, 1 = distal end. It does not change length.
export const normalizeLesionPosition = (value) => {
  if (!['string', 'number'].includes(typeof value) || (typeof value === 'string' && !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : null;
};
export const lesionPositionName = (fraction) => fraction < 1 / 3 ? 'proximal' : fraction > 2 / 3 ? 'distal' : 'middle';
export const lesionPositionLabel = (values = {}) => {
  const fraction = normalizeLesionPosition(values.positionFraction);
  return fraction === null ? '' : `schematic ${lesionPositionName(fraction)} position`;
};
export const moveLesionPosition = (position, extentFraction, delta) => {
  const remaining = Math.max(0, 1 - extentFraction);
  return remaining > 0 ? Math.max(0, Math.min(1, position + delta / remaining)) : 0.5;
};

// The paired transverse branches point in opposite screen directions. Internal
// iliac branches turn medially; common iliac and medial plantar branches run
// away from their proximal origin. Vertical arteries run proximal-to-distal down.
export const lesionMapDirection = (id, axis) => {
  if (axis !== 'x') return 1;
  const right = /^Right_/.test(id);
  return /internal_iliac/.test(id) ? (right ? 1 : -1) : (right ? -1 : 1);
};
