import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import computePrognosis from './prognosis';
import computeGlass from './glass';
import { vesselSegments } from '../components/steps/Step2_Patency';

const formatStage = (val) => {
  const map = { i: 'I', iia: 'IIa', iib: 'IIb', iii: 'III', iv: 'IV' };
  return map[val] || val || '';
};

const vesselName = (id) =>
  vesselSegments.find((s) => s.id === id)?.name || id.replace(/_/g, ' ');

const summarize = (obj) =>
  obj && typeof obj === 'object' ? Object.values(obj).filter(Boolean).join(' ') : '';

const summarizeList = (arr) =>
  Array.isArray(arr) ? arr.map(summarize).filter(Boolean).join('; ') : '';

export default function exportCaseSummary(data) {
  const prog = computePrognosis(data);
  const glass = computeGlass(data.patencySegments || {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 40;

  doc.setFontSize(18);
  doc.text('EndoPlanner Case Summary', 40, y);
  y += 30;

  doc.setFontSize(14);
  doc.text('Clinical indication', 40, y);
  y += 20;
  const clinical = data.clinical || {};
  [
    `Fontaine stage: ${formatStage(data.stage)}`,
    `WIfI: W${prog.wound}I${prog.ischemia}fI${prog.infection}`,
    `Overall WIfI stage ${prog.wifiStage}`,
  ].forEach((line) => { doc.text(line, 60, (y += 16)); });
  y += 10;

  doc.text('Disease anatomy', 40, y);
  y += 10;
  if (data.patencySegments && Object.keys(data.patencySegments).length) {
    const rows = Object.entries(data.patencySegments).map(([id, v]) => [
      vesselName(id),
      v.type,
      v.length,
      v.calcium,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Segment', 'Type', 'Length', 'Calcification']],
      body: rows,
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('- No data entered', 60, (y += 16));
    y += 10;
  }

  doc.text('Evidence based considerations', 40, y);
  y += 20;
  const riskMap = {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'Very High',
  };

  doc.text(
    `WIfI stage ${prog.wifiStage} (${riskMap[prog.wifiStage]}): ${prog.baseAmpRange[0]}–${prog.baseAmpRange[1]}% major amputation risk`,
    60,
    y
  );
  y += 16;
  doc.text(
    `Adjusted risk ${prog.ampRange[0]}–${prog.ampRange[1]}%`,
    60,
    y
  );
  y += 16;
  doc.text(
    `GLASS ${glass.stage} (${glass.riskCategory}) failure ${glass.failureRange[0]}–${glass.failureRange[1]}%, patency ${glass.patencyRange[0]}–${glass.patencyRange[1]}%`,
    60,
    y
  );
  y += 20;

  doc.text('Intervention plan', 40, y);
  y += 20;
  const sections = [
    ['Access', data.accessRows || [], (r) => `via ${r.vessel} ${summarizeList(r.needles)} ${summarizeList(r.sheaths)}`],
    ['Navigation & Crossing', data.navRows || [], (r) => `${summarize(r.wire)} ${summarize(r.catheter)} ${r.device || ''}`],
    ['Vessel preparation & therapy', data.therapyRows || [], (r) => `${summarize(r.balloon)} ${summarize(r.stent)} ${r.device || ''}`],
    ['Closure', data.closureRows || [], (r) => `${r.method || ''} ${r.device || ''}`],
  ];
  sections.forEach(([title, rows, fn]) => {
    if (rows.length) {
      doc.text(title, 60, y);
      y += 16;
      rows.forEach((row, i) => {
        doc.text(`- ${fn(row)}`, 80, y);
        y += 14;
      });
      y += 10;
    }
  });

  doc.save('EndoPlanner_Report.pdf');
}
