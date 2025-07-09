import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

const mount = () => {
  document.querySelectorAll('.endoplanner-root').forEach((container) => {
    try {
      ReactDOM.render(<Wizard />, container);
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
