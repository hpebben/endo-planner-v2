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

const mount = document.querySelector('.endoplanner-root');

if (mount) {
  try {
    createRoot(mount).render(
      <WizardProvider>
        <Wizard />
      </WizardProvider>
    );
  } catch (err) {
    console.error('Error rendering Endoplanner wizard:', err);
  }
} else {
  console.error(
    '[EndoPlanner] .endoplanner-root not found – ' +
    'ensure the div exists **after** the block markup is rendered.'
  );
}
