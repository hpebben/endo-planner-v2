import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export default function SegmentedControl({ options, value, onChange, ariaLabel }) {
  const buttonsRef = useRef([]);

  const focusButton = (idx) => {
    const btn = buttonsRef.current[idx];
    if (btn) btn.focus();
  };

  const handleKeyDown = (e, idx) => {
    const lastIndex = options.length - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx === lastIndex ? 0 : idx + 1;
      onChange(options[next].value);
      focusButton(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx === 0 ? lastIndex : idx - 1;
      onChange(options[prev].value);
      focusButton(prev);
    }
  };

  return (
    <div className="segmented-control" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          aria-pressed={value === opt.value}
          tabIndex={value === opt.value ? 0 : -1}
          className={value === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          ref={(el) => (buttonsRef.current[i] = el)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};
