import computePrognosis from './prognosis';
import computeGlass from './glass';
import rawVesselData from '../assets/vessel-map.json';
import { WIFI_STAGE_INFO, getWifiAction } from './guidelineRecommendations';
import { analyzePlan } from './planAnalysis';
import { formatTargetArterialPath, getLesionOptions, sideFromVesselId } from './lesions';
import { formatScopeLabel, getScopeLesionIds } from './planScopes';
import { getWoundosomeAdvice } from '../data/woundosome';

const vesselSegments = Array.isArray(rawVesselData?.segments) ? rawVesselData.segments : [];
const vesselName = (id) => vesselSegments.find((segment) => segment.id === id)?.name || id.replace(/_/g, ' ');

const clean = (value) => String(value ?? '')
  .replace(/[–—]/g, '-')
  .replace(/×/g, 'x')
  .replace(/≥/g, '>=')
  .replace(/≤/g, '<=');

const valuesOnly = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(valuesOnly).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    if (value.product) {
      const dimensions = value.diameter && value.length
        ? `${value.diameter} x ${value.length} mm`
        : value.length;
      const product = value.product === 'Product not specified' ? '' : value.product;
      return [
        product,
        value.platform,
        value.functionalRole || value.role,
        dimensions,
        value.shaft,
        value.type,
        value.material,
        value.technique || value.deliveryMode,
        value.ctoProfile,
        value.minimumSheathFr ? `minimum sheath ${value.minimumSheathFr}` : '',
      ]
        .filter(Boolean).join(' | ');
    }
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

const drawColumn = (doc, x, startY, width, title, lines, maxY = 780) => {
  let fontSize = 8.5;
  let lineHeight = 11;
  const estimatedLines = lines.reduce((count, line) => (
    count + (line.startsWith('::') ? 2 : Math.max(1, doc.splitTextToSize(clean(line), width - 20).length))
  ), 0);
  if (estimatedLines * lineHeight > maxY - startY - 55) {
    fontSize = 7;
    lineHeight = 9;
  }

  doc.setDrawColor(220, 226, 240);
  doc.setFillColor(249, 250, 253);
  doc.roundedRect(x, startY, width, maxY - startY, 8, 8, 'FD');
  doc.setTextColor(17, 49, 149);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, x + 12, startY + 22);
  doc.setDrawColor(17, 49, 149);
  doc.line(x + 12, startY + 29, x + width - 12, startY + 29);

  let y = startY + 46;
  lines.forEach((line) => {
    if (y > maxY - 12) return;
    if (line.startsWith('::')) {
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(Math.max(fontSize + 1, 8));
      doc.setTextColor(37, 99, 235);
      doc.text(clean(line.slice(2)), x + 12, y);
      y += lineHeight + 2;
      return;
    }
    doc.setFont('helvetica', line.startsWith('WIfI') || line.startsWith('GLASS') ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(35, 38, 45);
    const wrapped = doc.splitTextToSize(clean(line), width - 24);
    doc.text(wrapped, x + 12, y);
    y += wrapped.length * lineHeight;
  });
};

export default async function exportCaseSummaryToPDF(data = {}) {
  const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const wifi = computePrognosis(data);
  const glass = computeGlass(data.patencySegments || {}, data.targetArterialPath);
  const woundAdvice = getWoundosomeAdvice(data.clinical?.woundLocations || []);

  doc.setFillColor(17, 49, 149);
  doc.rect(0, 0, pageWidth, 54, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('EndoPlanner - Case summary', 34, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString(), pageWidth - 34, 33, { align: 'right' });

  const clinicalLines = [
    `Fontaine stage: ${formatStage(data.stage)}`,
    wifi.isComplete
      ? `WIfI: W${wifi.wound} I${wifi.ischemia} fI${wifi.infection} - clinical stage ${wifi.wifiStage}`
      : 'WIfI: incomplete',
  ];
  if (wifi.isComplete) {
    clinicalLines.push(`Estimated 1-year major amputation risk: approximately ${WIFI_STAGE_INFO[wifi.wifiStage].riskPercent}% (pooled observational estimate)`);
    clinicalLines.push(getWifiAction(wifi.wifiStage, wifi.ischemia));
  }
  if (woundAdvice.zones.length) {
    clinicalLines.push(`Wound location: ${woundAdvice.zones.map((zone) => zone.label).join(', ')}`);
    clinicalLines.push(`Wound-informed TAP to consider: ${woundAdvice.primaryLabels.join(' or ')}`);
    clinicalLines.push('Confirm direct wound-bed filling, pedal arch and collateral quality with AP and lateral foot angiography.');
  }

  const anatomyLines = Object.entries(data.patencySegments || {}).map(([id, values]) => (
    `${vesselName(id)}: ${[values.type, values.length ? `${values.length} cm` : '', values.calcium ? `${values.calcium} calcium` : ''].filter(Boolean).join(', ')}`
  ));
  if (!anatomyLines.length) anatomyLines.push('No vessel data entered.');
  anatomyLines.unshift('::DISEASE ANATOMY');
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

  drawColumn(doc, 28, 70, 260, 'CLINICAL & ANATOMY', [...clinicalLines, ...anatomyLines]);
  drawColumn(doc, 307, 70, 260, 'INTERVENTION PLAN', ['::ACCESS', ...planLines(data), ...recommendationLines]);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 105, 115);
  doc.text(
    'Clinical estimates support planning and should be confirmed against source imaging and the Global Vascular Guidelines.',
    28,
    806,
  );
  doc.text('EndoPlanner v1.6.172', pageWidth - 28, 806, { align: 'right' });

  doc.save(reportFilename(data));
}

export { reportFilename };
