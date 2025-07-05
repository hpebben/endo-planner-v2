export default function computeGlass(segments = {}) {
  const lengthMap = { '<3': 2, '3-10': 7, '10-15': 12, '15-20': 17, '>20': 25 };
  const fpSegs = [
    'Left superficial femoral artery',
    'Right superficial femoral artery',
    'Left popliteal artery',
    'Right popliteal artery',
    'Left profunda femoral artery',
    'Right profunda femoral artery',
  ];
  const ipSegs = [
    'Left anterior tibial artery',
    'Right anterior tibial artery',
    'Left posterior tibial artery',
    'Right posterior tibial artery',
    'Left peroneal artery',
    'Right peroneal artery',
    'Left tibioperoneal trunk',
    'Right tibioperoneal trunk',
    'Left metatarsal arteries',
    'Right metatarsal arteries',
    'Left plantar arch',
    'Right plantar arch',
    'Left lateral plantar artery',
    'Right lateral plantar artery',
    'Left medial plantar artery',
    'Right medial plantar artery',
    'Left dorsal pedal artery',
    'Right dorsal pedal artery',
  ];

  const calcGrade = (vals) => {
    if (!vals) return 0;
    let grade = 0;
    const len = lengthMap[vals.length] || 0;
    if (len > 20) grade += 3;
    else if (len > 15) grade += 2;
    else if (len > 10) grade += 1;
    if (vals.type === 'occlusion') grade += 1;
    if (vals.calcium === 'moderate') grade += 1;
    else if (vals.calcium === 'heavy') grade += 2;
    return Math.min(grade, 4);
  };

  let fpGrade = 0;
  let ipGrade = 0;
  Object.entries(segments).forEach(([id, vals]) => {
    const g = calcGrade(vals);
    if (fpSegs.includes(id)) fpGrade = Math.max(fpGrade, g);
    if (ipSegs.includes(id)) ipGrade = Math.max(ipGrade, g);
  });

  const stage = fpGrade <= 1 && ipGrade <= 1 ? 'I' : fpGrade <= 2 && ipGrade <= 2 ? 'II' : 'III';
  const successMap = { I: [95, 98], II: [85, 90], III: [65, 80] };
  const failureMap = { I: [2, 5], II: [6, 15], III: [16, 25] };
  const patencyMap = { I: [85, 90], II: [75, 85], III: [0, 65] };
  const riskCatMap = { I: 'Low', II: 'Moderate', III: 'High' };

  return {
    stage,
    successRange: successMap[stage],
    failureRange: failureMap[stage],
    patencyRange: patencyMap[stage],
    riskCategory: riskCatMap[stage],
  };
}
