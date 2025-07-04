import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import SegmentedControl from './SegmentedControl';

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
        <SegmentedControl
          options={[
            { label: __('Stenosis', 'endoplanner'), value: 'stenosis' },
            { label: __('Occlusion', 'endoplanner'), value: 'occlusion' },
          ]}
          value={condition}
          onChange={(val) => {
            setCondition(val);
            setDirty(true);
          }}
        />
      </div>

      <div className="param-section">
        <div className="param-title">{__('Length', 'endoplanner')}</div>
        <SegmentedControl
          options={lengthValues.map((val, i) => ({ label: lengthLabels[i], value: val }))}
          value={length}
          onChange={(val) => { setLength(val); setDirty(true); }}
          ariaLabel={__('Length', 'endoplanner')}
        />
      </div>

      <div className="param-section">
        <div className="param-title">{__('Calcium', 'endoplanner')}</div>
        <SegmentedControl
          options={[
            { label: __('None', 'endoplanner'), value: 'none' },
            { label: __('Moderate', 'endoplanner'), value: 'moderate' },
            { label: __('Heavy', 'endoplanner'), value: 'heavy' },
          ]}
          value={calcium}
          onChange={(val) => { setCalcium(val); setDirty(true); }}
          ariaLabel={__('Calcium', 'endoplanner')}
        />
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
