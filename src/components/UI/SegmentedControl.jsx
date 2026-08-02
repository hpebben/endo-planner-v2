import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export default function SegmentedControl({ options, value, onChange, ariaLabel }) {
  const buttonsRef = useRef([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const focusButton = (idx) => {
    const btn = buttonsRef.current[idx];
    if (btn) btn.focus();
  };

  const handleKeyDown = (event, idx) => {
    const lastIndex = options.length - 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = idx === lastIndex ? 0 : idx + 1;
      onChange(options[next].value);
      focusButton(next);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const previous = idx === 0 ? lastIndex : idx - 1;
      onChange(options[previous].value);
      focusButton(previous);
    }
  };

  return (
    <div className="segmented-control" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && index === 0) ? 0 : -1}
            className={selected ? 'active' : ''}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => (buttonsRef.current[index] = element)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired }),
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};
