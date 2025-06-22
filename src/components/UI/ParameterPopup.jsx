import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const lengthLabels = ['<3cm', '3–10cm', '10–15cm', '15–20cm', '>20cm'];
const lengthValues = ['<3', '3-10', '10-15', '15-20', '>20'];

export default function ParameterPopup({ segmentName, initialValues, onSave, onCancel }) {
  const [severity, setSeverity] = useState(initialValues.severity || 0);
  const [length, setLength] = useState(initialValues.length || '');
  const [calcium, setCalcium] = useState(initialValues.calcium || '');
  const boxRef = useRef(null);

  useEffect(() => {
    setSeverity(initialValues.severity || 0);
    setLength(initialValues.length || '');
    setCalcium(initialValues.calcium || '');
  }, [initialValues]);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onCancel]);

  const handleSave = () => {
    onSave({ severity, length, calcium });
  };

  return (
    <div className="param-box" ref={boxRef}>
      <h4>{segmentName}</h4>
      <label className="param-label">
        {__('% Stenosis/Occlusion', 'endoplanner')} {severity}%
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={severity}
        onChange={(e) => setSeverity(Number(e.target.value))}
      />

      <div className="length-options">
        {lengthValues.map((val, i) => (
          <button
            key={val}
            type="button"
            className={`stage-btn ${length === val ? 'active' : ''}`}
            onClick={() => setLength(val)}
          >
            {lengthLabels[i]}
          </button>
        ))}
      </div>

      <div className="calcium-options">
        {['none', 'moderate', 'heavy'].map((val) => (
          <button
            key={val}
            type="button"
            className={`stage-btn ${calcium === val ? 'active' : ''}`}
            onClick={() => setCalcium(val)}
          >
            {val === 'none' ? __('None', 'endoplanner') : val === 'moderate' ? __('Moderate', 'endoplanner') : __('Heavy', 'endoplanner')}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="stage-btn save-btn"
        onClick={handleSave}
      >
        {__('Save', 'endoplanner')}
      </button>
    </div>
  );
}

ParameterPopup.propTypes = {
  segmentName: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    severity: PropTypes.number,
    length: PropTypes.string,
    calcium: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
