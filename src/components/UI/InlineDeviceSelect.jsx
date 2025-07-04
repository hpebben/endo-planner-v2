import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SegmentedControl from './SegmentedControl';
import { __ } from '@wordpress/i18n';

export default function InlineDeviceSelect({
  options,
  value,
  onChange,
  buttonLabel = __('Choose', 'endoplanner'),
  image,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const baseOptions = options.filter((o) => o !== 'Custom');
  const hasCustom = options.includes('Custom');
  const isKnown = baseOptions.includes(value);
  const [selection, setSelection] = useState(isKnown ? value : hasCustom && value ? 'Custom' : '');
  const [customText, setCustomText] = useState(isKnown ? '' : value || '');

  useEffect(() => {
    const known = baseOptions.includes(value);
    setSelection(known ? value : hasCustom && value ? 'Custom' : '');
    setCustomText(known ? '' : value || '');
  }, [value, baseOptions, hasCustom]);

  useEffect(() => {
    if (!open) return undefined;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleSelect = (val) => {
    setSelection(val);
    if (val === 'Custom') {
      if (!customText) onChange('');
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  const handleCustom = (txt) => {
    setCustomText(txt);
    onChange(txt);
  };

  const label = value || buttonLabel;

  return (
    <div className="inline-device-select" ref={containerRef}>
      <button
        type="button"
        className="device-button"
        onClick={() => setOpen((o) => !o)}
      >
        {image && <img src={image} alt="" />}
        <span>{label}</span>
      </button>
      {open && (
        <div className="device-dropdown">
          <SegmentedControl
            options={[...baseOptions.map((v) => ({ label: v, value: v })), ...(hasCustom ? [{ label: __('Custom', 'endoplanner'), value: 'Custom' }] : [])]}
            value={selection}
            onChange={handleSelect}
            ariaLabel={__('Device', 'endoplanner')}
          />
          {selection === 'Custom' && (
            <input
              type="text"
              className="custom-device-input"
              value={customText}
              onChange={(e) => handleCustom(e.target.value)}
              placeholder={__('Enter custom device', 'endoplanner')}
            />
          )}
        </div>
      )}
    </div>
  );
}

InlineDeviceSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string,
  image: PropTypes.string,
};
