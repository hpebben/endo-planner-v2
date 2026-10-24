export const cleanPdfText = (value) => String(value ?? '').replace(/[–—]/g, '-').replace(/→/g, '->').replace(/×/g, 'x').replace(/≥/g, '>=').replace(/≤/g, '<=');
export const PDF_COLORS = { blue: [16, 44, 104], ink: [34, 47, 70], muted: [91, 108, 135], border: [216, 226, 242], pale: [244, 248, 255] };
export const findingColor = (level) => level === 'error' ? [173, 37, 60] : level === 'warning' ? [165, 91, 10] : PDF_COLORS.blue;

export const drawReportHeader = (doc, title = 'Case summary', { logoData, patientId = '' } = {}) => {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(...PDF_COLORS.blue); doc.rect(0, 0, width, 76, 'F');
  if (logoData) {
    doc.setFillColor(255, 255, 255); doc.roundedRect(25, 8, 210, 44, 5, 5, 'F');
    doc.addImage(logoData, 'PNG', 25, 3.5, 210, 52.5, 'endoplanner-brand', 'FAST');
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(title, 31, 65);
  doc.setFontSize(8); doc.text(new Date().toLocaleDateString(), width - 30, 21, { align: 'right' });
  if (patientId.trim()) {
    doc.setFontSize(8); doc.text('Patient ID', width - 30, 38, { align: 'right' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    const lines = doc.splitTextToSize(cleanPdfText(patientId.trim()), width - 295);
    doc.text(lines, width - 30, 53, { align: 'right', lineHeightFactor: 1.1 });
  }
};

const asParagraph = (value) => {
  if (typeof value === 'object') return value;
  if (value.startsWith('::')) return { heading: true, text: value.slice(2) };
  if (value.startsWith('PAT:')) return { text: value, bold: true };
  const colon = value.indexOf(':');
  return colon > 0 && colon < 90 ? { label: value.slice(0, colon), text: value.slice(colon + 1).trim(), bold: /^(Fontaine stage|WIfI|GLASS)/.test(value), badge: /^(Fontaine stage|WIfI|GLASS)/.test(value) } : { text: value };
};

// Labels and values are drawn separately, so bold / blue accents do not
// depend on HTML screenshots or compromise selectable, paginated text.
export default function createPdfReportLayout(doc, branding = {}) {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 92;
  const bottom = 780;
  const newPage = () => { doc.addPage(); y = 92; drawReportHeader(doc, 'Case summary', branding); };
  const measure = (paragraph, width) => {
    const p = asParagraph(paragraph);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(p.heading ? 10 : 8.5);
    const labelLines = p.label ? doc.splitTextToSize(cleanPdfText(p.label), width) : [];
    doc.setFont('helvetica', p.bold || p.heading ? 'bold' : 'normal'); doc.setFontSize(p.heading ? 10 : 9.5);
    const textLines = doc.splitTextToSize(cleanPdfText(p.text), width - (p.phase ? 36 : 0));
    return { ...p, labelLines, textLines, height: labelLines.length * 11 + textLines.length * 12.5 + (p.heading ? 12 : 10) };
  };
  const card = (title, lines, images = [], caption = '') => {
    const remaining = lines.map(asParagraph);
    let first = true;
    do {
      const hasImages = first && images.length > 0;
      const imageWidth = hasImages ? 215 : 0;
      const textX = 43 + (hasImages ? imageWidth + 16 : 0);
      const textWidth = pageWidth - 43 - textX;
      const paragraphs = remaining.map((p) => measure(p, textWidth - 12));
      const imageHeight = hasImages ? Math.min(238, Math.max(...images.map((img) => (imageWidth / images.length - 8) / img.ratio)) + 42) : 0;
      const totalText = paragraphs.reduce((sum, p) => sum + p.height, 0);
      if (y > 92 && 54 + Math.max(imageHeight, totalText) > bottom - y) newPage();
      const available = bottom - y - 54;
      const chunk = [];
      let used = 0;
      while (paragraphs.length) {
        const p = paragraphs[0];
        const nextHeight = p.heading && paragraphs[1] ? Math.min(paragraphs[1].height, 38) : 0;
        if (used + p.height + nextHeight > available && chunk.length) break;
        if (p.height > available) {
          const count = Math.max(1, Math.floor((available - p.labelLines.length * 11 - 10) / 12.5));
          chunk.push({ ...p, textLines: p.textLines.slice(0, count) });
          remaining[0] = { ...remaining[0], text: p.textLines.slice(count).join(' ') };
          used += p.labelLines.length * 11 + count * 12.5 + 10;
          break;
        }
        chunk.push(p); used += p.height; paragraphs.shift(); remaining.shift();
      }
      const height = 54 + Math.max(imageHeight, used);
      doc.setDrawColor(...PDF_COLORS.border); doc.setFillColor(255, 255, 255);
      doc.roundedRect(28, y, pageWidth - 56, height, 8, 8, 'FD');
      doc.setFillColor(...PDF_COLORS.pale); doc.roundedRect(29, y + 1, pageWidth - 58, 32, 7, 7, 'F');
      doc.setFillColor(...PDF_COLORS.blue); doc.roundedRect(28, y, 4, 33, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...PDF_COLORS.blue);
      doc.text(cleanPdfText(title + (first ? '' : ' (continued)')), 43, y + 21);
      if (hasImages) {
        images.forEach((img, index) => {
          const cellWidth = imageWidth / images.length;
          const h = Math.min(imageHeight - 42, (cellWidth - 8) / img.ratio);
          const w = h * img.ratio, x = 43 + index * cellWidth + (cellWidth - w) / 2;
          doc.addImage(img.data, 'PNG', x, y + 42, w, h, undefined, 'FAST');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...PDF_COLORS.muted);
          doc.text(cleanPdfText(img.label), 43 + index * cellWidth + cellWidth / 2, y + 42 + h + 10, { align: 'center' });
        });
        if (caption) { doc.setFontSize(6.5); doc.text(doc.splitTextToSize(cleanPdfText(caption), imageWidth), 43, y + imageHeight + 30); }
      }
      let textY = y + 46;
      chunk.forEach((p) => {
        if (p.phase) {
          doc.setFillColor(...PDF_COLORS.blue);
          doc.roundedRect(textX - 3, textY - 6, textWidth + 5, p.height - 4, 4, 4, 'F');
          doc.setFillColor(42, 69, 121);
          doc.roundedRect(textX + 3, textY - 3, 23, 15, 3, 3, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
          doc.text(p.phase, textX + 14.5, textY + 7, { align: 'center' });
          doc.setFontSize(10); doc.text(p.textLines, textX + 35, textY + 7);
          textY += p.height;
          return;
        }
        if (p.level || p.badge) {
          doc.setFillColor(...(p.level === 'error' ? [255, 241, 244] : p.level === 'warning' ? [255, 248, 235] : PDF_COLORS.pale));
          doc.roundedRect(textX - 3, textY - 10, textWidth + 5, p.height - 3, 4, 4, 'F');
        }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(p.heading ? 10 : 8.5); doc.setTextColor(...findingColor(p.level));
        if (p.labelLines.length) { doc.text(p.labelLines, textX + 3, textY); textY += p.labelLines.length * 11; }
        if (p.heading) { doc.setDrawColor(...PDF_COLORS.border); doc.line(textX + 3, textY + 4, textX + textWidth - 6, textY + 4); }
        doc.setFont('helvetica', p.bold || p.heading ? 'bold' : 'normal'); doc.setFontSize(p.heading ? 10 : 9.5);
        doc.setTextColor(...(p.heading ? PDF_COLORS.blue : PDF_COLORS.ink));
        doc.text(p.textLines, textX + 3, textY);
        textY += p.textLines.length * 12.5 + (p.heading ? 12 : 10);
      });
      y += height + 14; first = false;
      if (remaining.length) newPage();
    } while (remaining.length);
  };
  drawReportHeader(doc, 'Case summary', branding);
  return { card };
}
