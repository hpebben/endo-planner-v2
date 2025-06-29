import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const lengthLabels = ['<3cm', '3–10cm', '10–15cm', '15–20cm', '>20cm'];
const lengthValues = ['<3', '3-10', '10-15', '15-20', '>20'];

export default function ParameterPopup({ segmentName, initialValues, onSave, onCancel }) {
  const [condition, setCondition] = useState(initialValues.type || '');
  const [length, setLength] = useState(initialValues.length || '');
  const [calcium, setCalcium] = useState(initialValues.calcium || '');
  const [dirty, setDirty] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    setCondition(initialValues.type || '');
    setLength(initialValues.length || '');
    setCalcium(initialValues.calcium || '');
    setDirty(false);
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

  useEffect(() => {
    if (dirty && condition && length && calcium) {
      onSave({ type: condition, length, calcium });
    }
  }, [condition, length, calcium, dirty, onSave]);

  return (
    <div className="param-box" ref={boxRef}>
      <h4>{segmentName}</h4>

      <div className="param-section">
        {/* Updated label to remove trailing colon */}
        <div className="param-title">{__('Patency', 'endoplanner')}</div>
        <div className="condition-options">
          <label className="param-radio">
            <input
              type="radio"
              name="condition"
              value="stenosis"
              checked={condition === 'stenosis'}
              onChange={() => {
                setCondition('stenosis');
                setDirty(true);
              }}
            />
            <span>{__('Stenosis', 'endoplanner')}</span>
          </label>
          <label className="param-radio">
            <input
              type="radio"
              name="condition"
              value="occlusion"
              checked={condition === 'occlusion'}
              onChange={() => {
                setCondition('occlusion');
                setDirty(true);
              }}
            />
            <span>{__('Occlusion', 'endoplanner')}</span>
          </label>
        </div>
      </div>

      <div className="param-section">
        {/* Updated label to remove trailing colon */}
        <div className="param-title">{__('Length', 'endoplanner')}</div>
        <div className="length-options">
          {lengthValues.map((val, i) => (
            <button
              key={val}
              type="button"
              className={`param-option ${length === val ? 'active' : ''}`}
              onClick={() => {
                setLength(val);
                setDirty(true);
              }}
            >
              {lengthLabels[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="param-section">
        {/* Updated label to remove trailing colon */}
        <div className="param-title">{__('Calcium', 'endoplanner')}</div>
        <div className="calcium-options">
          {['none', 'moderate', 'heavy'].map((val) => (
            <button
              key={val}
              type="button"
              className={`param-option ${calcium === val ? 'active' : ''}`}
              onClick={() => {
                setCalcium(val);
                setDirty(true);
              }}
            >
              {val === 'none'
                ? __('None', 'endoplanner')
                : val === 'moderate'
                ? __('Moderate', 'endoplanner')
                : __('Heavy', 'endoplanner')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

ParameterPopup.propTypes = {
  segmentName: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    type: PropTypes.string,
    length: PropTypes.string,
    calcium: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
