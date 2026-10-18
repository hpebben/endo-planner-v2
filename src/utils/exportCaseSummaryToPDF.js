import computePrognosis from './prognosis';
import computeGlass from './glass';
import { WIFI_STAGE_INFO, getWifiAction } from './guidelineRecommendations';
import { analyzePlan } from './planAnalysis';
import { formatTargetArterialPath, getLesionOptions, sideFromVesselId, vesselName, lesionLengthLabel, calcificationLabel } from './lesions';
import { formatScopeLabel, getScopeLesionIds } from './planScopes';
import { getWoundosomeAdvice } from '../data/woundosome';
import { getPatSummaryLines } from '../data/pedalAccelerationTime';
import { getActiveWoundLocations } from './clinicalStage';
import createPdfReportLayout from './pdfReportLayout';
import appendMaterialsPages from './pdfMaterialsPage';
import { fullDeviceLabel } from './deviceLabel';

const valuesOnly = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(valuesOnly).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    if (value.product || value.specific || value.platform || value.frSize || value.diameter) return fullDeviceLabel(value);
    return Object.entries(value)
      .filter(([key, nested]) => key !== 'id' && nested)
      .map(([, nested]) => valuesOnly(nested))
      .filter(Boolean)
      .join(' | ');
  }
  return String(value);
};

const formatStage = (stage) => ({ i: 'I', iia: 'IIa', iib: 'IIb', iii: 'III', iv: 'IV' }[stage] || 'Not assessed');

const reportFilename = (data) => {
  const firstLesion = Object.keys(data.patencySegments || {})[0];
  const side = data.targetArterialPathSide
    || sideFromVesselId(data.targetArterialPath?.[0])
    || sideFromVesselId(firstLesion)
    || 'Case';
  const indication = ['iii', 'iv'].includes(String(data.stage || '').toLowerCase())
    ? 'CLTI'
    : `Fontaine-${formatStage(data.stage)}`;
  return `EndoPlanner-${side}-${indication}-${new Date().toISOString().slice(0, 10)}.pdf`;
};

const planLines = (data) => {
  const lines = [];
  const lesionOptions = getLesionOptions(data.patencySegments || {}, data.targetArterialPath || []);
  const scopeText = (row) => {
    const label = formatScopeLabel(row, lesionOptions);
    const ids = getScopeLesionIds(row);
    return ids.length === 1 ? `${label} ${vesselName(ids[0])}` : label;
  };
  (data.accessRows || []).forEach((row, index) => {
    lines.push(`Approach ${index + 1}: ${[row.approach, row.side, row.vessel].filter(Boolean).join(' ') || 'Not entered'}`);
    if (valuesOnly(row.needles)) lines.push(`Needle: ${valuesOnly(row.needles)}`);
    if (valuesOnly(row.sheaths)) lines.push(`Sheath: ${valuesOnly(row.sheaths)}`);
    if (valuesOnly(row.catheters)) lines.push(`Catheter: ${valuesOnly(row.catheters)}`);
  });
  lines.push('::NAVIGATION & CROSSING');
  (data.navRows || []).forEach((row) => {
    const scope = scopeText(row);
    if (valuesOnly(row.wire)) lines.push(`${scope} - wire: ${valuesOnly(row.wire)}`);
    if (valuesOnly(row.catheter)) lines.push(`${scope} - catheter: ${valuesOnly(row.catheter)}`);
    if (valuesOnly(row.balloon)) lines.push(`${scope} - crossing balloon: ${valuesOnly(row.balloon)}`);
    if (valuesOnly(row.device)) lines.push(`${scope} - special: ${valuesOnly(row.device)}`);
  });
  lines.push('::VESSEL PREPARATION & THERAPY');
  (data.therapyRows || []).forEach((row) => {
    const scope = scopeText(row);
    if (valuesOnly(row.balloon)) lines.push(`${scope} - balloon: ${valuesOnly(row.balloon)}`);
    if (valuesOnly(row.stent)) lines.push(`${scope} - stent: ${valuesOnly(row.stent)}`);
    if (valuesOnly(row.device)) lines.push(`${scope} - special: ${valuesOnly(row.device)}`);
  });
  lines.push('::CLOSURE');
  (data.closureRows || []).forEach((row) => {
    const closure = [row.method, valuesOnly(row.device)].filter(Boolean).join(' | ');
    if (closure) lines.push(`Closure: ${closure}`);
  });
  return lines;
};

export default async function exportCaseSummaryToPDF(data = {}) {
  const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const wifi = computePrognosis(data);
  const glass = computeGlass(data.patencySegments || {}, data.targetArterialPath);
  const woundAdvice = getWoundosomeAdvice(getActiveWoundLocations(data));

  const { default: renderSummaryImages } = await import('./summaryImages');
  const images = await renderSummaryImages(data);
  const layout = createPdfReportLayout(doc);

  const clinicalLines = [
    `Fontaine stage: ${formatStage(data.stage)}`,
  ];
  if (wifi.isApplicable) {
    clinicalLines.push(wifi.isComplete
      ? `WIfI: W${wifi.wound} I${wifi.ischemia} fI${wifi.infection} - clinical stage ${wifi.wifiStage}`
      : 'WIfI: incomplete');
  }
  if (wifi.isComplete) {
    clinicalLines.push(`Estimated 1-year major amputation risk: approximately ${WIFI_STAGE_INFO[wifi.wifiStage].riskPercent}% (pooled observational estimate)`);
    clinicalLines.push(getWifiAction(wifi.wifiStage, wifi.ischemia));
  }
  clinicalLines.push(...getPatSummaryLines(data.clinical));
  if (woundAdvice.zones.length) {
    clinicalLines.push(`Wound location: ${woundAdvice.zones.map((zone) => zone.label).join(', ')}`);
    clinicalLines.push(`Wound-informed TAP to consider: ${woundAdvice.primaryLabels.join(' or ')}`);
    clinicalLines.push('Confirm direct wound-bed filling, pedal arch and collateral quality with AP and lateral foot angiography.');
  }

  const anatomyLines = Object.entries(data.patencySegments || {}).map(([id, values]) => (
    `${vesselName(id)}: ${[values.type, lesionLengthLabel(values), calcificationLabel(values.calcium)].filter(Boolean).join(', ')}`
  ));
  if (!anatomyLines.length) anatomyLines.push('No vessel data entered.');
  anatomyLines.push(data.targetArterialPath?.length
    ? `Target path: ${formatTargetArterialPath(data.targetArterialPath)}`
    : 'Target path: not selected');
  if (data.targetArterialPathNote) anatomyLines.push(`Route note: ${data.targetArterialPathNote}`);
  if (glass.isComplete) {
    anatomyLines.push(`GLASS ${glass.stage}: FP ${glass.fpGrade}, IP ${glass.ipGrade}, ${glass.pedalModifier}`);
    anatomyLines.push(`Technical failure ${glass.technicalFailure}; 1-year limb-based patency ${glass.oneYearPatency}`);
    anatomyLines.push(glass.anatomicPattern);
  } else {
    anatomyLines.push(`GLASS: not calculated - ${glass.reason}`);
  }

  const findings = analyzePlan(data);
  const recommendationLines = findings.length
    ? ['::RECOMMENDATIONS & CONSIDERATIONS', ...findings.map((item) => `${item.level.toUpperCase()}: ${item.title} - ${item.summary}`)]
    : ['::RECOMMENDATIONS & CONSIDERATIONS', 'No incompatibilities or anatomy-triggered considerations identified from the recorded data.'];

  layout.card('CLINICAL INDICATION', clinicalLines, images.wounds,
    'Colors mark selected wound locations; blue marks the planned pedal route.');
  layout.card('DISEASE ANATOMY', anatomyLines, images.disease,
    'Red: lesion outline / estimated extent. Blue: target path. Schematic position.');
  layout.card('INTERVENTION PLAN', ['::ACCESS', ...planLines(data)]);
  layout.card('RECOMMENDATIONS & CONSIDERATIONS', findings.length
    ? findings.map((item) => ({ label: `${item.level === 'error' ? 'Critical' : item.level === 'warning' ? 'Warning' : 'Recommendation'} | ${item.title}`, text: item.summary, level: item.level }))
    : recommendationLines.slice(1));
  const materialsStartPage = doc.getNumberOfPages() + 1;
  appendMaterialsPages(doc, data, findings);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 105, 115);
    doc.text(page >= materialsStartPage ? 'Selected case materials: confirm quantities and missing specifications before opening.' : 'Reference anatomy and clinical estimates: confirm against source imaging and guidelines.', 28, 805);
    doc.text(`EndoPlanner v1.6.181 | ${page} / ${pageCount}`, pageWidth - 28, 805, { align: 'right' });
  }

  doc.save(reportFilename(data));
}

export { reportFilename };
