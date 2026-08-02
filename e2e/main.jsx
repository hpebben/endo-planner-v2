import React from 'react';
import { createRoot } from 'react-dom/client';
import Wizard from '../src/components/wizard';
import { WizardProvider } from '../src/components/WizardContext';
import '../src/styles/style.scss';

createRoot(document.querySelector('.endoplanner-root')).render(
  <WizardProvider>
    <Wizard />
  </WizardProvider>,
);
