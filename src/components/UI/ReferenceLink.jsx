import React from 'react';
import PropTypes from 'prop-types';

export default function ReferenceLink({ number, onClick }) {
  return (
    <sup className="ref-link">
      <button type="button" className="ref-btn" onClick={onClick}>
        [{number}]
      </button>
    </sup>
  );
}

ReferenceLink.propTypes = {
  number: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};
