import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';
import InlineModal from './UI/InlineModal';
import SegmentedControl from './UI/SegmentedControl';
import { DEFAULTS } from './defaults';

export default function WireModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const defaults = DEFAULTS.navigation.wire;
  const [platform, setPlatform] = useState(values.platform || defaults.size || '');
  const [length, setLength] = useState(values.length || defaults.length || '');
  const [type, setType] = useState(values.type || defaults.brand || '');
  const [body, setBody] = useState(values.body || '');
  const [support, setSupport] = useState(values.support || '');
  const [technique, setTechnique] = useState(values.technique || defaults.track || '');
  const [product, setProduct] = useState(values.product || '');

  useEffect(() => {
    setPlatform(values.platform || defaults.size || '');
    setLength(values.length || defaults.length || '');
    setType(values.type || defaults.brand || '');
    setBody(values.body || '');
    setSupport(values.support || '');
    setTechnique(values.technique || defaults.track || '');
    setProduct(values.product || '');
  }, [values]);

  const lengths = ['180 cm','260 cm','300 cm'];
  const bodyOpts = ['Light bodied','Intermediate bodied','Heavy bodied'];
  const supportOpts = ['Rosen wire','Lunderquist wire','Amplatz wire','Bentson wire','Meier wire','Newton wire'];
  const handleChange = (field, val) => {
    const newVals = { platform, length, type, body, support, technique, product, [field]: val };
    switch(field){
      case 'platform': setPlatform(val); break;
      case 'length': setLength(val); break;
      case 'type': setType(val); break;
      case 'body': setBody(val); break;
      case 'support': setSupport(val); break;
      case 'technique': setTechnique(val); break;
      case 'product': setProduct(val); break;
      default: break;
    }
    onSave(newVals);
    if (newVals.platform && newVals.length && newVals.type && newVals.technique) onRequestClose();
  };
  return (
    <InlineModal title="Wire" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SegmentedControl
        options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
        value={platform}
        onChange={(val)=>handleChange('platform', val)}
        ariaLabel="Platform"
      />
      <SelectControl label="Length" value={length} options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)} />
      <SegmentedControl
        options={[{label:'Glidewire',value:'Glidewire'},{label:'CTO wire',value:'CTO wire'},{label:'Support wire',value:'Support wire'}]}
        value={type}
        onChange={(val)=>handleChange('type', val)}
        ariaLabel="Type"
      />
      {type === 'CTO wire' && (
        <SelectControl
          label="Body type"
          value={body}
          options={[{ label: 'Choose body', value: '', disabled: true }, ...bodyOpts.map(v => ({ label: v, value: v }))]}
          onChange={(val) => handleChange('body', val)}
        />
      )}
      {type === 'Support wire' && (
        <SelectControl
          label="Support wire"
          value={support}
          options={[{ label: 'Choose wire', value: '', disabled: true }, ...supportOpts.map(v => ({ label: v, value: v }))]}
          onChange={(val) => handleChange('support', val)}
        />
      )}
      <SegmentedControl
        options={[
          {label:'Intimal Tracking',value:'Intimal Tracking'},
          {label:'Limited sub-intimal dissection and re-entry',value:'Limited sub-intimal dissection and re-entry'}
        ]}
        value={technique}
        onChange={(val)=>handleChange('technique', val)}
        ariaLabel="Technique"
      />
      <SelectControl
        label="Product"
        value={product}
        options={[{ label: 'Choose product', value: '', disabled: true }, { label: 'None', value: 'none' }]}
        onChange={(val)=>handleChange('product', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </InlineModal>
  );
}

WireModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
