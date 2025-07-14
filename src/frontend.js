import React from 'react';
import { createRoot } from 'react-dom/client';
import Wizard from './components/wizard';
// Import default and named exports in case the file exports differently
import * as WizardContextModule from './components/WizardContext';

// Support both default and named export styles
const WizardProvider =
        WizardContextModule?.WizardProvider   // named export
     || WizardContextModule?.default          // default export
     || (() => { throw new Error('WizardProvider not found'); });

const mount = () => {
  const containers = document.querySelectorAll('.endoplanner-root');

  if (!containers.length) {
    console.error(
      '[EndoPlanner] .endoplanner-root not found – ' +
        'ensure the div exists **after** the block markup is rendered.'
    );
    return;
  }

  containers.forEach((container) => {
    if (container.dataset.epInitialized) return;
    try {
      createRoot(container).render(
        <WizardProvider>
          <Wizard />
        </WizardProvider>
      );
      container.dataset.epInitialized = 'true';
    } catch (err) {
      console.error('Error rendering EndoPlanner wizard:', err);
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
