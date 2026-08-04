import React from 'react';
import PropTypes from 'prop-types';

export default function DeviceGlyph({ type = 'special', className = '' }) {
  const commonProps = {
    className: `device-glyph device-glyph--${type}${className ? ` ${className}` : ''}`,
    viewBox: '0 0 84 34',
    'aria-hidden': 'true',
    focusable: 'false',
  };

  if (type === 'wire') {
    return (
      <svg {...commonProps}>
        <path d="M5 24 C28 24 42 19 59 14 L77 6" />
        <circle cx="5" cy="24" r="2.2" />
      </svg>
    );
  }
  if (type === 'catheter') {
    return (
      <svg {...commonProps}>
        <path d="M5 23 H55 C67 23 73 18 77 10" />
        <path d="M5 27 H56 C70 27 78 20 80 11" />
        <rect x="2" y="20" width="8" height="10" rx="2" />
      </svg>
    );
  }
  if (type === 'balloon') {
    return (
      <svg {...commonProps}>
        <path d="M3 17 H24 M60 17 H81" />
        <path d="M24 17 C28 7 32 7 36 7 H48 C52 7 56 7 60 17 C56 27 52 27 48 27 H36 C32 27 28 27 24 17 Z" />
      </svg>
    );
  }
  if (type === 'stent') {
    return (
      <svg {...commonProps}>
        <path d="M4 17 H17 M67 17 H80" />
        <rect x="17" y="7" width="50" height="20" rx="3" />
        <path d="M17 7 L29 27 L41 7 L53 27 L67 7 M17 27 L29 7 L41 27 L53 7 L67 27" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 17 H29 M55 17 H80" />
      <circle cx="42" cy="17" r="12" />
      <path d="M42 9 V25 M34 17 H50 M36 11 L48 23 M48 11 L36 23" />
    </svg>
  );
}

DeviceGlyph.propTypes = {
  type: PropTypes.oneOf(['wire', 'catheter', 'balloon', 'stent', 'special']),
  className: PropTypes.string,
};
