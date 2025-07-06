export default function computePrognosis(data = {}) {
  const clinical = data.clinical || {};
  const { wound = 0, ischemia = 0, infection = 0 } = clinical;
  // WIfI stage is determined by the highest score among wound, ischemia
  // and infection without the previous +1 offset.
  const wifiStage = Math.max(wound, ischemia, infection);

  const stageMap = {
    0: { amp: [1, 3], limb: 95 },
    1: { amp: [5, 10], limb: 90 },
    2: { amp: [15, 25], limb: 75 },
    3: { amp: [30, 55], limb: 60 },
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

  let lengthCategory = totalLength > 20 ? 'len20' : totalLength > 10 ? 'len10' : null;

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
    lengthCategory,
  };
}
