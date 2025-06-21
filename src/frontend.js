import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

// Mount the React wizard once the DOM is ready. In some cases the script
// is loaded after the DOMContentLoaded event has already fired, so check the
// current readyState and call the mount function immediately when possible.
const mount = () => {
  document.querySelectorAll('.endoplanner-root').forEach((container) => {
    ReactDOM.render(<Wizard />, container);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
