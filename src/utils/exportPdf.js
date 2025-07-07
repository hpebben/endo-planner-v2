import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
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
  wrapper.style.left = '0';
  wrapper.style.top = '0';
  wrapper.style.width = '100%';
  wrapper.style.visibility = 'hidden';

  document.body.appendChild(wrapper);

  const options = {
    filename: 'EndoPlanner_Report.pdf',
    jsPDF: { format: 'a4' },
    html2canvas: { scale: 2, useCORS: true },
  };

  document.fonts.ready
    .then(() => html2pdf().set(options).from(wrapper).save())
    .finally(() => {
      document.body.removeChild(wrapper);
    });
}
