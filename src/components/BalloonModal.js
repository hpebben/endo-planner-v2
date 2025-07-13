import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';
import InlineModal from './UI/InlineModal';
import SegmentedControl from './UI/SegmentedControl';
import { DEFAULTS } from './defaults';

export default function BalloonModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const def = DEFAULTS.therapy.balloon;
  const [platform, setPlatform] = useState(values.platform || def.platform || '');
  const [diameter, setDiameter] = useState(values.diameter || def.diameter || '');
  const [len, setLen] = useState(values.length || def.length || '');
  const [shaft, setShaft] = useState(values.shaft || def.shaft || '');

  useEffect(() => {
    setPlatform(values.platform || def.platform || '');
    setDiameter(values.diameter || def.diameter || '');
    setLen(values.length || def.length || '');
    setShaft(values.shaft || def.shaft || '');
  }, [values]);

  const diameters = {
    '0.014': ['1.5','2','2.5','3.5','4'],
    '0.018': ['2','2.5','3','4','5','5.5','6','7'],
    '0.035': ['3','4','5','6','7','8','9','10','12','14']
  };
  const lengths = ['10','12','15','18','20','30','40','50','60','70','80','90','100','110','120','250'];
  const handleChange = (field, val) => {
    const newVals = { platform, diameter, length: len, shaft, [field]: val };
    if (field === 'platform') {
      setPlatform(val);
      setDiameter(val ? diameters[val][0] : '');
    }
    if (field === 'diameter') setDiameter(val);
    if (field === 'length') setLen(val);
    if (field === 'shaft') setShaft(val);
    onSave({ platform: newVals.platform, diameter: newVals.diameter, length: newVals.length, shaft: newVals.shaft });
    if (newVals.platform && newVals.diameter && newVals.length && newVals.shaft) onRequestClose();
  };

  return (
    <InlineModal title="PTA Balloon" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SegmentedControl
        options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
        value={platform}
        onChange={(val) => handleChange('platform', val)}
        ariaLabel="Platform"
      />
      <SelectControl
        label="Diameter"
        value={diameter}
        options={(diameters[platform] || []).map(v => ({ label:v, value:v }))}
        onChange={(val)=>handleChange('diameter', val)}
      />
      <SelectControl
        label="Length (mm)"
        value={len}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <SelectControl
        label="Shaft length"
        value={shaft}
        className="selector--sm"
        options={[{ label: '80 cm', value: '80 cm' }, { label: '135 cm', value: '135 cm' }]}
        onChange={(val) => handleChange('shaft', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </InlineModal>
  );
}

BalloonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
