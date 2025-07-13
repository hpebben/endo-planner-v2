import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';
import InlineModal from './UI/InlineModal';
import SegmentedControl from './UI/SegmentedControl';
import { DEFAULTS } from './defaults';

const stentDia = { '0.014':['2','3','4','5'], '0.018':['4','5','6','7'], '0.035':['5','6','7','8','9','10'] };
const stentLen = { '0.014':['20','40','60','80'], '0.018':['40','60','80','100'], '0.035':['40','60','80','100','120'] };

export default function StentModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const def = DEFAULTS.therapy.stent;
  const [platform, setPlatform] = useState(values.platform || '');
  const [type, setType] = useState(values.type || '');
  const [mat, setMat] = useState(values.material || '');
  const [dia, setDia] = useState(values.diameter || '');
  const [len, setLen] = useState(values.length || '');
  const [shaft, setShaft] = useState(values.shaft || def.shaft || '');

  useEffect(() => {
    setPlatform(values.platform || '');
    setType(values.type || '');
    setMat(values.material || '');
    setDia(values.diameter || '');
    setLen(values.length || '');
    setShaft(values.shaft || def.shaft || '');
  }, [values]);

  const handleChange = (field, val) => {
    const newVals = { platform, type, material: mat, diameter: dia, length: len, shaft, [field]: val };
    switch(field){
      case 'platform':
        setPlatform(val);
        setDia(val ? stentDia[val][0] : '');
        setLen(val ? stentLen[val][0] : '');
        break;
      case 'type': setType(val); break;
      case 'material': setMat(val); break;
      case 'diameter': setDia(val); break;
      case 'length': setLen(val); break;
      case 'shaft': setShaft(val); break;
      default: break;
    }
    onSave({ platform: newVals.platform, type: newVals.type, material: newVals.material, diameter: newVals.diameter, length: newVals.length, shaft: newVals.shaft });
    if (newVals.platform && newVals.type && newVals.material && newVals.diameter && newVals.length && newVals.shaft) onRequestClose();
  };

  return (
    <InlineModal title="Stent" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SegmentedControl
        options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
        value={platform}
        onChange={(val)=>handleChange('platform', val)}
        ariaLabel="Platform"
      />
      <SegmentedControl
        options={[{label:'self expandable',value:'self expandable'},{label:'balloon expandable',value:'balloon expandable'}]}
        value={type}
        onChange={(val)=>handleChange('type', val)}
        ariaLabel="Stent type"
      />
      <SegmentedControl
        options={[{label:'bare metal',value:'bare metal'},{label:'covered',value:'covered'}]}
        value={mat}
        onChange={(val)=>handleChange('material', val)}
        ariaLabel="Stent material"
      />
      <SelectControl
        label="Diameter"
        value={dia}
        options={[{ label: 'Choose diameter', value: '', disabled: true }, ...(stentDia[platform] || []).map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('diameter', val)}
      />
      <SelectControl
        label="Length"
        value={len}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...(stentLen[platform] || []).map(v => ({ label: v, value: v }))]}
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

StentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
