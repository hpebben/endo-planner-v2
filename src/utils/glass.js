import { GLASS_STAGE_INFO } from './guidelineRecommendations';

const GLASS_MATRIX = [
  [null, 'I', 'I', 'II', 'III'],
  ['I', 'I', 'II', 'II', 'III'],
  ['I', 'II', 'II', 'II', 'III'],
  ['II', 'II', 'II', 'III', 'III'],
  ['III', 'III', 'III', 'III', 'III'],
];

const LENGTH_RANK = { '<3': 0, '3-10': 1, '10-15': 2, '15-20': 3, '>20': 4 };

const normalizeId = (id) => String(id || '').toLowerCase();
const sideFromId = (id) => {
  const normalized = normalizeId(id);
  if (normalized.startsWith('left_')) return 'Left';
  if (normalized.startsWith('right_')) return 'Right';
  return null;
};

const isFp = (id) => /superficial_femoral|popliteal/.test(normalizeId(id));
const isIp = (id) => /anterior_tib|posterior_tib|peroneal|tibioperoneal/.test(normalizeId(id));
const isCruralTarget = (id) => /anterior_tib|posterior_tib|peroneal_artery/.test(normalizeId(id));
const isTibioperonealTrunk = (id) => /tibioperoneal_trunk/.test(normalizeId(id));
const isPedal = (id) => /dorsal_pedal|plantar|metatarsal/.test(normalizeId(id));
const isInflow = (id) => /aorta|iliac|common_femoral|profunda/.test(normalizeId(id));

const lesionGrade = (values = {}, territory = 'FP', id = '') => {
  const rank = LENGTH_RANK[values.length];
  if (!Number.isInteger(rank)) return 0;
  const occlusion = values.type === 'occlusion';
  const popliteal = /popliteal/.test(normalizeId(id));

  let grade;
  if (territory === 'FP') {
    if (popliteal && occlusion) grade = 4;
    else if (occlusion) grade = [1, 2, 3, 3, 4][rank];
    else grade = [1, 1, 2, 3, 3][rank];
  } else {
    grade = occlusion ? [2, 3, 4, 4, 4][rank] : [1, 2, 3, 3, 4][rank];
  }

  // In GLASS, severe calcification increases the segment grade by one.
  if (values.calcium === 'heavy') grade += 1;
  return Math.min(grade, 4);
};

const targetName = (id) => {
  const normalized = normalizeId(id);
  if (/anterior_tib/.test(normalized)) return 'anterior tibial artery';
  if (/posterior_tib/.test(normalized)) return 'posterior tibial artery';
  if (/peroneal/.test(normalized)) return 'peroneal artery';
  if (/tibioperoneal/.test(normalized)) return 'tibioperoneal pathway';
  return 'least-diseased infrapopliteal artery';
};

const pedalModifier = (entries) => {
  const pedalEntries = entries.filter(([id]) => isPedal(id));
  if (!pedalEntries.length) return 'P0';
  const hasDorsal = pedalEntries.some(([id]) => /dorsal_pedal/.test(normalizeId(id)));
  const hasPlantar = pedalEntries.some(([id]) => /plantar_arch|plantar_artery/.test(normalizeId(id)));
  return hasDorsal && hasPlantar ? 'P2' : 'P1';
};

const selectTargetPath = (entries, explicitTargetPath) => {
  const explicitIds = Array.isArray(explicitTargetPath)
    ? explicitTargetPath.filter(Boolean)
    : explicitTargetPath ? [explicitTargetPath] : [];
  if (!explicitIds.length) {
    return {
      id: null,
      grade: null,
      isComplete: false,
      description: 'Select an explicit target arterial path before calculating GLASS.',
    };
  }

  const targetId = [...explicitIds].reverse().find((id) => isCruralTarget(id));
  if (!targetId) {
    return {
      id: null,
      grade: null,
      isComplete: false,
      description: 'The selected target path must include an anterior tibial, posterior tibial or peroneal target artery.',
    };
  }

  const pathIds = new Set(explicitIds);
  const pathDisease = entries.filter(([id]) => pathIds.has(id) && isIp(id));
  const grade = pathDisease.reduce(
    (highest, [id, values]) => Math.max(highest, lesionGrade(values, 'IP', id)),
    0,
  );

  return {
    id: targetId,
    grade,
    inferred: false,
    isComplete: true,
    description: `Selected target path uses the ${targetName(targetId)}. Only disease on that explicit path contributes to the IP grade.`,
  };
};

export default function computeGlass(segments = {}, targetPath = null) {
  const entries = Object.entries(segments || {});
  const anatomicEntries = entries.filter(([id]) => isFp(id) || isIp(id) || isPedal(id));
  const sides = [...new Set(anatomicEntries.map(([id]) => sideFromId(id)).filter(Boolean))];
  const inflowEntries = entries.filter(([id]) => isInflow(id));

  if (!entries.length) {
    return {
      stage: null,
      fpGrade: null,
      ipGrade: null,
      pedalModifier: null,
      isComplete: false,
      hasAnatomy: false,
      reason: 'Enter affected arterial segments before calculating GLASS.',
    };
  }

  if (!anatomicEntries.length) {
    return {
      stage: null,
      fpGrade: null,
      ipGrade: null,
      pedalModifier: null,
      isComplete: false,
      hasAnatomy: true,
      reason: 'Only inflow or common femoral disease is recorded. Infrainguinal FP/IP disease is required for a GLASS stage.',
    };
  }

  if (sides.length !== 1) {
    return {
      stage: null,
      fpGrade: null,
      ipGrade: null,
      pedalModifier: null,
      isComplete: false,
      hasAnatomy: true,
      reason: 'GLASS is limb-specific. Record left and right limb anatomy in separate cases.',
    };
  }

  const side = sides[0];
  const explicitIds = Array.isArray(targetPath) ? targetPath.filter(Boolean) : [];
  const pathSide = sideFromId(explicitIds[0]);
  if (!explicitIds.length) {
    return {
      stage: null,
      fpGrade: null,
      ipGrade: null,
      pedalModifier: pedalModifier(anatomicEntries),
      isComplete: false,
      hasAnatomy: true,
      side,
      reason: 'Select an explicit target arterial path before calculating GLASS.',
    };
  }
  if (pathSide && pathSide !== side) {
    return {
      stage: null,
      fpGrade: null,
      ipGrade: null,
      pedalModifier: pedalModifier(anatomicEntries),
      isComplete: false,
      hasAnatomy: true,
      side,
      reason: `The ${pathSide.toLowerCase()} target path does not match the recorded ${side.toLowerCase()} limb anatomy.`,
    };
  }

  const limbEntries = anatomicEntries.filter(([id]) => sideFromId(id) === side);
  const pathIds = new Set(explicitIds);
  const fpEntries = limbEntries.filter(([id]) => isFp(id) && pathIds.has(id));
  const fpGrade = fpEntries.reduce(
    (highest, [id, values]) => Math.max(highest, lesionGrade(values, 'FP', id)),
    0,
  );
  const target = selectTargetPath(limbEntries.filter(([id]) => isIp(id)), targetPath);
  if (!target.isComplete) {
    return {
      stage: null,
      fpGrade,
      ipGrade: null,
      pedalModifier: pedalModifier(limbEntries),
      isComplete: false,
      hasAnatomy: true,
      side,
      reason: target.description,
    };
  }
  const ipGrade = target.grade;
  const stage = GLASS_MATRIX[fpGrade][ipGrade];

  if (!stage) {
    return {
      stage: null,
      fpGrade,
      ipGrade,
      pedalModifier: pedalModifier(limbEntries),
      isComplete: false,
      hasAnatomy: true,
      reason: 'No significant infrainguinal disease was recorded; GLASS stage is not applicable.',
    };
  }

  const stageInfo = GLASS_STAGE_INFO[stage];
  const inflowNote = inflowEntries.length
    ? ' Inflow/CFA disease is recorded separately and is not included in the infrainguinal stage.'
    : '';

  return {
    stage,
    fpGrade,
    ipGrade,
    pedalModifier: pedalModifier(limbEntries),
    targetArtery: targetName(target.id),
    targetPathInferred: target.inferred,
    side,
    isComplete: true,
    hasAnatomy: true,
    technicalFailure: stageInfo.technicalFailure,
    oneYearPatency: stageInfo.oneYearPatency,
    anatomicPattern: stageInfo.pattern,
    complexity: stageInfo.complexity,
    reason: `${side} FP grade ${fpGrade} + IP grade ${ipGrade} = GLASS ${stage}. ${target.description}${inflowNote}`,
  };
}

export { GLASS_MATRIX, lesionGrade };
