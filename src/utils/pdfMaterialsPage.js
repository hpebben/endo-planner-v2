import { buildMaterialsList } from './materials';
import { cleanPdfText, drawReportHeader, findingColor, PDF_COLORS } from './pdfReportLayout';

export default function appendMaterialsPages(doc, data, findings = [], branding = {}) {
  const groups = buildMaterialsList(data);
  const width = doc.internal.pageSize.getWidth();
  const bodyWidth = width - 100;
  let y;
  const page = (continued = false) => {
    doc.addPage(); drawReportHeader(doc, `Materials preparation${continued ? ' - continued' : ''}`, branding);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(...PDF_COLORS.blue);
    doc.text('MATERIALS PREPARATION', 30, 104);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Tick when prepared. Enter quantity in QTY. Repeated plan entries may use the same device.', 30, 122);
    doc.text('Confirm quantities and reuse before opening; only selected case materials are listed.', 30, 134);
    y = 152;
  };
  page();
  const critical = findings.filter((item) => item.level === 'error').length;
  const warnings = findings.filter((item) => item.level === 'warning').length;
  if (critical || warnings) {
    doc.setFillColor(...(critical ? [255, 239, 243] : [255, 248, 231]));
    doc.roundedRect(28, y, width - 56, 33, 5, 5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...findingColor(critical ? 'error' : 'warning'));
    doc.text(`Plan review: ${critical} critical finding(s) | ${warnings} warning(s). See case summary before finalising preparation.`, 38, y + 20);
    y += 45;
  }
  if (!groups.length) {
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_COLORS.ink); doc.setFontSize(11);
    doc.text('No materials have been selected in this case.', 30, y + 12);
    return;
  }
  const categoryHeader = (group, index, continued = false) => {
    doc.setFillColor(...PDF_COLORS.blue); doc.roundedRect(28, y, width - 56, 22, 4, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
    doc.text(`${String(index + 1).padStart(2, '0')}  ${group.title.toUpperCase()}${continued ? ' (continued)' : ''}`, 39, y + 15);
    y += 27;
  };
  groups.forEach((group, groupIndex) => {
    let hasHeader = false;
    group.items.forEach((item) => {
      const fields = [
        { text: item.name, bold: true, font: 9.5, color: PDF_COLORS.ink },
        { text: item.sizes.join(' | '), bold: true, font: 10, color: PDF_COLORS.blue },
        { text: item.details.join(' | '), font: 7, color: PDF_COLORS.muted },
        { text: `Use: ${item.uses.join('; ')}`, font: 7, color: PDF_COLORS.muted },
        item.kind !== 'method' && item.occurrences > 1 && { text: `${item.occurrences} selected plan entries - confirm whether shared or separate units.`, font: 7.5, color: PDF_COLORS.blue },
        item.missing.length > 0 && { text: `Complete details: ${item.missing.join('; ')}`, font: 7.5, color: findingColor('warning') },
      ].filter((field) => field && field.text);
      const measured = fields.map((field) => {
        doc.setFont('helvetica', field.bold ? 'bold' : 'normal'); doc.setFontSize(field.font);
        return { ...field, lines: doc.splitTextToSize(cleanPdfText(field.text), bodyWidth - 62) };
      });
      const height = Math.max(49, measured.reduce((sum, field) => sum + field.lines.length * (field.font + 1.7) + 3, 14));
      if (!hasHeader) {
        if (y + 27 + Math.min(height, 580) > 780) page(true);
        categoryHeader(group, groupIndex);
        hasHeader = true;
      } else if (y + Math.min(height, 580) > 780) { page(true); categoryHeader(group, groupIndex, true); }
      let remaining = measured;
      do {
        // A very long product or usage list continues without losing entries.
        const available = 780 - y;
        let used = 10;
        const chunk = [];
        while (remaining.length) {
          const field = remaining[0];
          const room = Math.floor((available - used - 10) / (field.font + 1.7));
          if (room < 1) break;
          const count = Math.min(room, field.lines.length);
          chunk.push({ ...field, lines: field.lines.slice(0, count) });
          used += count * (field.font + 1.7) + 3;
          if (count === field.lines.length) remaining.shift();
          else { remaining[0] = { ...field, lines: field.lines.slice(count) }; break; }
        }
        const rowHeight = Math.max(49, used + 5);
        doc.setDrawColor(...PDF_COLORS.border); doc.setFillColor(249, 251, 255);
        doc.roundedRect(28, y, width - 56, rowHeight, 5, 5, 'FD');
        doc.setDrawColor(100, 124, 170); doc.setLineWidth(0.8); doc.rect(39, y + 12, 10, 10);
        if (item.kind !== 'method') {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...PDF_COLORS.muted); doc.text('QTY', width - 70, y + 16);
          doc.setDrawColor(148, 164, 194); doc.roundedRect(width - 75, y + 22, 32, 24, 3, 3, 'S');
        }
        let textY = y + 15;
        chunk.forEach((field) => {
          doc.setFont('helvetica', field.bold ? 'bold' : 'normal'); doc.setFontSize(field.font); doc.setTextColor(...field.color);
          doc.text(field.lines, 59, textY); textY += field.lines.length * (field.font + 1.7) + 3;
        });
        y += rowHeight + 5;
        if (remaining.length) { page(true); categoryHeader(group, groupIndex, true); }
      } while (remaining.length);
    });
    y += 4;
  });
}
