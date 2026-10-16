import computePrognosis from './prognosis';
import computeGlass from './glass';
import { WIFI_STAGE_INFO, getWifiAction } from './guidelineRecommendations';
import { analyzePlan } from './planAnalysis';
import { formatTargetArterialPath, getLesionOptions, sideFromVesselId, vesselName, lesionLengthLabel } from './lesions';
import { formatScopeLabel, getScopeLesionIds } from './planScopes';
import { getWoundosomeAdvice } from '../data/woundosome';
import { getPatSummaryLines } from '../data/pedalAccelerationTime';
import { getActiveWoundLocations } from './clinicalStage';

const clean = (value) => String(value ?? '')
  .replace(/[–—]/g, '-')
  .replace(/→/g, '->')
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

// Text remains selectable and paginates; diagrams share the screen's SVG model.
const reportLayout = (doc, pageWidth) => {
  let y = 72;
  const bottom = 780;
  const header = () => {
    doc.setFillColor(17, 49, 149);
    doc.rect(0, 0, pageWidth, 54, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(19);
    doc.text('EndoPlanner - Case summary', 28, 34);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString(), pageWidth - 28, 33, { align: 'right' });
  };
  const newPage = () => { doc.addPage(); y = 72; header(); };
  const card = (title, lines, images = [], caption = '') => {
    let remaining = [...lines], first = true;
    do {
      const hasImages = first && images.length > 0;
      const imageWidth = hasImages ? 224 : 0;
      const textX = 40 + (hasImages ? imageWidth + 16 : 0);
      const textWidth = pageWidth - 40 - textX;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      const paragraphs = remaining.map((line) => ({
        heading: line.startsWith('::'),
        lines: doc.splitTextToSize(clean(line.replace(/^::/, '')), textWidth),
      }));
      const imageHeight = hasImages ? Math.min(238, Math.max(...images.map((img) => (imageWidth / images.length - 6) / img.ratio)) + 40) : 0;
      const textHeight = paragraphs.reduce((n, p) => n + p.lines.length * 12 + (p.heading ? 8 : 5), 0);
      const desired = 48 + Math.max(imageHeight, textHeight);
      if (y > 72 && desired > bottom - y) newPage();
      const available = bottom - y - 48;
      const chunk = [];
      let used = 0;
      while (paragraphs.length) {
        const paragraph = paragraphs[0];
        const height = paragraph.lines.length * 12 + (paragraph.heading ? 8 : 5);
        if (used + height > available && chunk.length) break;
        if (height > available) {
          const count = Math.max(1, Math.floor((available - used - 8) / 12));
          chunk.push({ ...paragraph, lines: paragraph.lines.slice(0, count) });
          remaining[0] = paragraph.lines.slice(count).join(' ');
          used += count * 12 + 5;
          break;
        }
        chunk.push(paragraph); used += height; paragraphs.shift(); remaining.shift();
      }
      const height = 48 + Math.max(imageHeight, used);
      doc.setDrawColor(218, 226, 241); doc.setFillColor(249, 251, 255);
      doc.roundedRect(28, y, pageWidth - 56, height, 8, 8, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 49, 149);
      doc.text(clean(title + (first ? '' : ' (continued)')), 40, y + 22);
      if (hasImages) {
        images.forEach((img, index) => {
          const cellWidth = imageWidth / images.length;
          const h = Math.min(imageHeight - 40, (cellWidth - 8) / img.ratio);
          const w = h * img.ratio;
          const x = 40 + index * cellWidth + (cellWidth - w) / 2;
          doc.addImage(img.data, 'PNG', x, y + 38, w, h, undefined, 'FAST');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(75, 90, 115);
          doc.text(clean(img.label), 40 + index * cellWidth + cellWidth / 2, y + 38 + h + 10, { align: 'center' });
        });
        if (caption) { doc.setFontSize(6.5); doc.text(doc.splitTextToSize(clean(caption), imageWidth), 40, y + imageHeight + 26); }
      }
      let textY = y + 40;
      chunk.forEach((p) => {
        doc.setFont('helvetica', p.heading ? 'bold' : 'normal'); doc.setFontSize(9);
        doc.setTextColor(...(p.heading ? [17, 49, 149] : [38, 48, 66]));
        if (p.heading) textY += 3;
        doc.text(p.lines, textX, textY);
        textY += p.lines.length * 12 + (p.heading ? 5 : 5);
      });
      y += height + 14; first = false;
      if (remaining.length) newPage();
    } while (remaining.length);
  };
  header();
  return { card };
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
  const layout = reportLayout(doc, pageWidth);

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
    `${vesselName(id)}: ${[values.type, lesionLengthLabel(values), values.calcium ? `${values.calcium} calcium` : ''].filter(Boolean).join(', ')}`
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
  layout.card('RECOMMENDATIONS & CONSIDERATIONS', recommendationLines.slice(1));

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 105, 115);
    doc.text('Reference anatomy and clinical estimates: confirm against source imaging and guidelines.', 28, 805);
    doc.text(`EndoPlanner v1.6.179 | ${page} / ${pageCount}`, pageWidth - 28, 805, { align: 'right' });
  }

  doc.save(reportFilename(data));
}

export { reportFilename };
