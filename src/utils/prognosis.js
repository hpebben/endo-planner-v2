// SVS WIfI clinical stages for estimated 1-year major amputation risk.
// Matrix order: [wound][ischemia][foot infection].
// 1 = very low, 2 = low, 3 = moderate, 4 = high.
// Source: Global Vascular Guidelines, Table 3.5.
const WIFI_STAGE_MATRIX = [
  [
    [1, 1, 2, 3],
    [1, 2, 3, 4],
    [2, 2, 3, 4],
    [2, 3, 3, 4],
  ],
  [
    [1, 1, 2, 3],
    [1, 2, 3, 4],
    [2, 3, 4, 4],
    [3, 3, 4, 4],
  ],
  [
    [2, 2, 3, 4],
    [3, 3, 4, 4],
    [3, 4, 4, 4],
    [4, 4, 4, 4],
  ],
  [
    [3, 3, 4, 4],
    [4, 4, 4, 4],
    [4, 4, 4, 4],
    [4, 4, 4, 4],
  ],
];

const RISK_CATEGORY = {
  1: 'Very low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
};

const isGrade = (value) => Number.isInteger(value) && value >= 0 && value <= 3;

export const computeWifiStage = (wound, ischemia, infection) => {
  if (![wound, ischemia, infection].every(isGrade)) return null;
  return WIFI_STAGE_MATRIX[wound][ischemia][infection];
};

export default function computePrognosis(data = {}) {
  const clinical = data.clinical || {};
  const wound = clinical.wound ?? null;
  const ischemia = clinical.ischemia ?? null;
  const infection = clinical.infection ?? null;
  const wifiStage = computeWifiStage(wound, ischemia, infection);

  return {
    wound,
    ischemia,
    infection,
    wifiStage,
    riskCategory: wifiStage ? RISK_CATEGORY[wifiStage] : null,
    isComplete: wifiStage !== null,
  };
}

export { WIFI_STAGE_MATRIX, RISK_CATEGORY };
