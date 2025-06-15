import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.endoplanner-root').forEach((container) => {
    ReactDOM.render(<Wizard />, container);
  });
});
