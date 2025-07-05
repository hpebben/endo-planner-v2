import React from 'react';
import PropTypes from 'prop-types';

export default function ReferenceLink({ number, onClick }) {
  return (
    <sup className="ref-link">
      <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }}>
        {number}
      </a>
    </sup>
  );
}

ReferenceLink.propTypes = {
  number: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};
