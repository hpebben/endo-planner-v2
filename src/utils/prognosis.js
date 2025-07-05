export default function computePrognosis(data = {}) {
  const clinical = data.clinical || {};
  const { wound = 0, ischemia = 0, infection = 0 } = clinical;
  const wifiStage = Math.max(wound, ischemia, infection) + 1;

  const stageMap = {
    1: { amp: 5, limb: 95 },
    2: { amp: 10, limb: 90 },
    3: { amp: 25, limb: 75 },
    4: { amp: 40, limb: 60 },
  };

  let ampRisk = stageMap[wifiStage]?.amp || 10;
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

  if (totalLength > 20) { ampRisk += 5; limbSalvage -= 5; }
  else if (totalLength > 10) { ampRisk += 2; limbSalvage -= 2; }
  if (hasOcclusion) { ampRisk += 5; limbSalvage -= 5; }
  if (maxCalcium === 'heavy') { ampRisk += 5; limbSalvage -= 5; }
  else if (maxCalcium === 'moderate') { ampRisk += 2; limbSalvage -= 2; }

  ampRisk = Math.min(ampRisk, 90);
  limbSalvage = Math.max(0, limbSalvage);

  return { wound, ischemia, infection, wifiStage, ampRisk, limbSalvage, totalLength, hasOcclusion, maxCalcium };
}
