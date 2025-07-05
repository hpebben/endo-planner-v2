export default function computePrognosis(data = {}) {
  const clinical = data.clinical || {};
  const { wound = 0, ischemia = 0, infection = 0 } = clinical;
  const wifiStage = Math.max(wound, ischemia, infection) + 1;

  const stageMap = {
    1: { amp: [1, 3], limb: 95 },
    2: { amp: [5, 10], limb: 90 },
    3: { amp: [15, 25], limb: 75 },
    4: { amp: [30, 55], limb: 60 },
  };

  const baseAmpRange = stageMap[wifiStage]?.amp || [5, 10];
  let ampRange = [...baseAmpRange];
  let limbSalvage = stageMap[wifiStage]?.limb || 90;

  const segments = data.patencySegments || {};
  const lengthMap = { '<3': 2, '3-10': 7, '10-15': 12, '15-20': 17, '>20': 25 };
  let totalLength = 0;
  let hasOcclusion = false;
  let maxCalcium = 'none';
  Object.values(segments).forEach(({ length, type, calcium }) => {
    totalLength += lengthMap[length] || 0;
    if (type === 'occlusion') hasOcclusion = true;
    if (calcium === 'heavy') maxCalcium = 'heavy';
    else if (calcium === 'moderate' && maxCalcium !== 'heavy') maxCalcium = 'moderate';
  });

  let min = ampRange[0];
  let max = ampRange[1];
  if (totalLength > 20) { min += 5; max += 7; limbSalvage -= 5; }
  else if (totalLength > 10) { min += 2; max += 5; limbSalvage -= 2; }
  if (hasOcclusion) { min += 3; max += 5; limbSalvage -= 5; }
  if (maxCalcium === 'heavy') { min += 3; max += 5; limbSalvage -= 5; }
  else if (maxCalcium === 'moderate') { min += 1; max += 3; limbSalvage -= 2; }

  ampRange = [Math.min(min, 95), Math.min(max, 95)];
  limbSalvage = Math.max(0, limbSalvage);

  return {
    wound,
    ischemia,
    infection,
    wifiStage,
    baseAmpRange,
    ampRange,
    limbSalvage,
    totalLength,
    hasOcclusion,
    maxCalcium,
  };
}
