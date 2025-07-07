import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import summaryCss from '../styles/summary.css?inline';
import variablesCss from '../styles/variables.css?inline';

export async function exportCaseSummary() {
  const src = document.getElementById('case-summary') || document.querySelector('.case-summary-container');
  if (!src) return;

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '100%';
  frame.style.width = frame.style.height = '0';
  document.body.appendChild(frame);

  const clone = src.cloneNode(true);
  frame.contentDocument.body.appendChild(clone);

  const styleTag = frame.contentDocument.createElement('style');
  styleTag.textContent = variablesCss + summaryCss;
  frame.contentDocument.head.appendChild(styleTag);

  await frame.contentDocument.fonts.ready;
  await Promise.all(
    Array.from(frame.contentDocument.images).map((img) => img.decode())
  );

  const opt = {
    margin: 10,
    filename: 'CaseSummary.pdf',
    html2canvas: { background: '#ffffff', scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(opt).from(clone).save();
  document.body.removeChild(frame);
}

export default exportCaseSummary;
