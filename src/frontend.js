import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';
import exportCaseSummaryToPDF from './utils/exportCaseSummaryToPDF';

// Mount the React wizard once the DOM is ready. In some cases the script
// is loaded after the DOMContentLoaded event has already fired, so check the
// current readyState and call the mount function immediately when possible.
const attachExport = () => {
  const btn = document.getElementById('export-pdf-btn');
  if (btn) {
    btn.addEventListener('click', exportCaseSummaryToPDF);
  }
};

const mount = () => {
  document.querySelectorAll('.endoplanner-root').forEach((container) => {
    try {
      ReactDOM.render(<Wizard />, container);
    } catch (err) {
      console.error('Error rendering Endoplanner wizard:', err);
    }
  });
  attachExport();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
