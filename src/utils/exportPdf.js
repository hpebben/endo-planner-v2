import html2pdf from 'html2pdf.js';
import '../styles/style.scss';

export default function exportCaseSummary() {
  const source = document.querySelector('.case-summary-container');
  if (!source) return;

  const clone = source.cloneNode(true);

  const wrapper = document.createElement('div');
  wrapper.className = 'pdf-wrapper';

  const header = document.createElement('div');
  const headerBtn = document.createElement('button');
  headerBtn.className = 'stage-btn';
  headerBtn.textContent = 'Case Summary';
  header.appendChild(headerBtn);
  wrapper.appendChild(header);

  wrapper.appendChild(clone);

  const footer = document.createElement('div');
  const footerBtn = document.createElement('button');
  footerBtn.className = 'stage-btn';
  footerBtn.textContent = 'Export PDF';
  footer.appendChild(footerBtn);
  wrapper.appendChild(footer);

  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';

  document.body.appendChild(wrapper);

  html2pdf()
    .from(wrapper)
    .set({ jsPDF: { format: 'a4' }, html2canvas: { scale: 2 } })
    .save('EndoPlanner_Report.pdf')
    .finally(() => {
      document.body.removeChild(wrapper);
    });
}
