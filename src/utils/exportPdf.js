import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import summaryCss from './summaryCss';

export async function exportCaseSummary() {
  const source = document.getElementById('case-summary') || document.querySelector('.case-summary-container');
  if (!source) return;

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.left = '-10000px';
  printFrame.style.top = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentDocument;
  doc.open();
  doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
  doc.close();

  const clone = source.cloneNode(true);
  doc.body.appendChild(clone);

  const style = doc.createElement('style');
  style.textContent = summaryCss;
  doc.head.appendChild(style);

  await doc.fonts.ready;
  const images = Array.from(doc.images);
  await Promise.all(images.map((img) => img.decode().catch(() => {})));

  const opt = {
    margin: 10,
    filename: 'CaseSummary.pdf',
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(opt).from(doc.body).save();
  printFrame.remove();
}

export default exportCaseSummary;
