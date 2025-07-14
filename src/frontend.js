import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';
import { WizardProvider } from './components/WizardContext';

const mount = () => {
  document.querySelectorAll('.endoplanner-root').forEach((container) => {
    try {
      ReactDOM.render(
        <WizardProvider>
          <Wizard />
        </WizardProvider>,
        container
      );
    } catch (err) {
      console.error('Error rendering Endoplanner wizard:', err);
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
