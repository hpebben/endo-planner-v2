export default function computeTasc(segments = {}) {
  const lengthMap = { '<3': 2, '3-10': 7, '10-15': 12, '15-20': 17, '>20': 25 };
  let target = null;
  let total = 0;
  let hasOcclusion = false;

  Object.entries(segments).forEach(([id, vals]) => {
    const name = id.toLowerCase();
    if (name.includes('iliac') || name.includes('femoral') || name.includes('popliteal')) {
      target = name.includes('iliac') ? 'iliac' : 'femoropopliteal';
      total += lengthMap[vals.length] || 0;
      if (vals.type === 'occlusion') hasOcclusion = true;
    }
  });

  if (!target) return null;

  let stage;
  if (total > 20 || (hasOcclusion && total > 10)) stage = 'D';
  else if (hasOcclusion || total > 10) stage = 'C';
  else if (total > 5) stage = 'B';
  else stage = 'A';

  const explanationMap = {
    A: 'Short focal lesion',
    B: 'Multiple short lesions or short occlusion',
    C: 'Longer occlusion or multiple lesions',
    D: 'Long complex occlusion',
  };

  return { stage, target, explanation: explanationMap[stage] };
}
