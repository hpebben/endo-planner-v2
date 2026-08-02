export const WIFI_STAGE_INFO = {
  1: { riskCategory: 'Very low', riskPercent: 0 },
  2: { riskCategory: 'Low', riskPercent: 8 },
  3: { riskCategory: 'Moderate', riskPercent: 11 },
  4: { riskCategory: 'High', riskPercent: 38 },
};

export const getWifiAction = (stage, ischemia) => {
  if (ischemia === 0) {
    return 'Revascularisation is generally not recommended without significant ischaemia, except for targetable poor perfusion with major tissue loss that progresses or fails to improve despite optimal wound care.';
  }
  if (stage === 1) {
    return 'Revascularisation is generally not recommended unless the wound progresses or fails to reduce by at least 50% within 4 weeks despite infection control, wound care and offloading.';
  }
  if (stage === 4 && (ischemia === 2 || ischemia === 3)) {
    return 'Offer revascularisation after assessment of patient risk, anatomy and conduit.';
  }
  if ((stage === 2 || stage === 3) && (ischemia === 2 || ischemia === 3)) {
    return 'Consider revascularisation after assessment of patient risk, anatomy and conduit.';
  }
  if (ischemia === 1) {
    return 'Consider revascularisation if the wound progresses or fails to reduce by at least 50% within 4 weeks despite infection control, wound care and offloading.';
  }
  return 'Integrate patient risk, limb severity and anatomic complexity before selecting a revascularisation strategy.';
};

export const getWifiRecommendations = (stage, ischemia) => {
  const recommendations = [getWifiAction(stage, ischemia)];
  if (stage >= 2) {
    recommendations.push('Obtain high-quality angiographic imaging, including dedicated ankle and foot views, when the patient is a candidate for revascularisation.');
  }
  recommendations.push('Repeat limb staging after drainage, debridement, minor amputation or correction of inflow disease, and whenever the clinical condition changes.');
  if (stage === 4 && (ischemia === 2 || ischemia === 3)) {
    recommendations.push('For high surgical-risk patients, offer an endovascular approach when technically feasible; for average-risk patients, choose endovascular treatment versus vein bypass using WIfI, GLASS and autologous-vein availability.');
  } else if (stage === 2 || stage === 3) {
    recommendations.push('For high surgical-risk patients with significant perfusion deficit, consider endovascular revascularisation when technically feasible.');
  }
  return recommendations;
};

export const GLASS_STAGE_INFO = {
  I: {
    complexity: 'Low complexity',
    technicalFailure: '<10%',
    oneYearPatency: '>70%',
    pattern: 'Short- to intermediate-length femoropopliteal disease and/or short infrapopliteal disease, with no or minimal popliteal disease.',
  },
  II: {
    complexity: 'Intermediate complexity',
    technicalFailure: '<20%',
    oneYearPatency: '50–70%',
    pattern: 'Intermediate- to long-length femoropopliteal disease, possibly including popliteal stenosis, and/or short- to intermediate-length infrapopliteal disease.',
  },
  III: {
    complexity: 'High complexity',
    technicalFailure: '>20%',
    oneYearPatency: '<50%',
    pattern: 'Extensive femoropopliteal or infrapopliteal occlusions, disease in both segments, or popliteal chronic total occlusion.',
  },
};

export const getGlassRecommendations = (stage) => {
  const common = [
    'Confirm the preferred target arterial path on high-quality angiographic imaging, including the ankle and foot.',
    'Base the intervention on the full PLAN assessment: patient risk, WIfI limb severity, GLASS anatomy and autologous-vein availability.',
  ];
  if (stage === 'I') {
    return [
      'This is a low-complexity endovascular pattern; an endovascular-first strategy is generally favoured when revascularisation is indicated.',
      ...common,
    ];
  }
  if (stage === 'II') {
    return [
      'This intermediate-complexity pattern does not determine a single treatment: weigh endovascular feasibility against expected durability and suitable-vein bypass.',
      ...common,
    ];
  }
  return [
    'This is a high-complexity endovascular pattern. In average-risk patients with advanced limb threat and suitable autologous vein, bypass may be favoured; in high-risk patients, consider an endovascular approach when technically feasible.',
    ...common,
  ];
};

export const GVG_CITATION = 'Conte MS, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. Eur J Vasc Endovasc Surg. 2019;58(1S):S1–S109.e33.';
