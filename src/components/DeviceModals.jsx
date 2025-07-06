import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';
import InlineModal from './UI/InlineModal';
import SegmentedControl from './UI/SegmentedControl';

const SimpleModal = (props) => <InlineModal {...props} />;
SimpleModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export function NeedleModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [size, setSize] = useState(values.size || '');
  const [length, setLength] = useState(values.length || '');
  useEffect(() => { setSize(values.size || ''); setLength(values.length || ''); }, [values]);
  const handleChange = (field, val) => {
    const newVals = { size, length, [field]: val };
    if (field === 'size') setSize(val); else setLength(val);
    onSave(newVals);
    if (newVals.size && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title="Needle" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label="Needle size"
        value={size}
        options={[{ label: 'Choose size', value: '', disabled: true }, ...['19 Gauge', '21 Gauge'].map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('size', val)}
      />
      <SelectControl
        label="Needle length"
        value={length}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...['4cm', '7cm', '9cm'].map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </SimpleModal>
  );
}
NeedleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export function SheathModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [frSize, setFrSize] = useState(values.frSize || '');
  const [length, setLength] = useState(values.length || '');
  useEffect(() => { setFrSize(values.frSize || ''); setLength(values.length || ''); }, [values]);
  const sizes = ['4 Fr','5 Fr','6 Fr','7 Fr','8 Fr','9 Fr'];
  const lengths = ['10 cm','12 cm','25 cm'];
  const handleChange = (field, val) => {
    const newVals = { frSize, length, [field]: val };
    if (field === 'frSize') setFrSize(val); else setLength(val);
    onSave(newVals);
    if (newVals.frSize && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title="Sheath" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label="French size"
        value={frSize}
        options={[{ label: 'Choose size', value: '', disabled: true }, ...sizes.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('frSize', val)}
      />
      <SelectControl
        label="Length"
        value={length}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </SimpleModal>
  );
}
SheathModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export function CatheterModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const sizes = ['2.3 Fr','2.6 Fr','4 Fr','5 Fr','6 Fr','7 Fr'];
  const lengths = ['40 cm','65 cm','80 cm','90 cm','105 cm','110 cm','125 cm','135 cm','150 cm'];
  const [size, setSize] = useState('');
  const [length, setLength] = useState('');
  const [specific, setSpecific] = useState('');
  useEffect(() => {
    setSize(values.size || '');
    setLength(values.length || '');
    setSpecific(values.specific || '');
  }, [values]);
  const specifics = ['BER2','BHW','Cobra 1','Cobra 2','Cobra 3','Cobra Glidecath','CXI 0.018','CXI 0.014','Navicross 0.018','Navicross 0.035','MultiPurpose','PIER','Pigtail Flush','Straight Flush','Universal Flush','Rim','Simmons 1','Simmons 2','Simmons 3','Vertebral'];
  const handleChange = (field, val) => {
    const newVals = { size, length, specific, [field]: val };
    if (field === 'size') setSize(val);
    if (field === 'length') setLength(val);
    if (field === 'specific') setSpecific(val);
    onSave(newVals);
    if (newVals.size && newVals.length && newVals.specific) onRequestClose();
  };
  return (
    <SimpleModal title="Catheter" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label="Specific catheter"
        value={specific}
        options={[{ label: 'Choose catheter', value: '', disabled: true }, ...specifics.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('specific', val)}
      />
      <SelectControl
        label="French size"
        value={size}
        options={[{ label: 'Choose size', value: '', disabled: true }, ...sizes.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('size', val)}
      />
      <SelectControl
        label="Length"
        value={length}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </SimpleModal>
  );
}
CatheterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export function WireModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '');
  const [length, setLength] = useState(values.length || '');
  const [type, setType] = useState(values.type || '');
  const [body, setBody] = useState(values.body || '');
  const [support, setSupport] = useState(values.support || '');
  const [technique, setTechnique] = useState(values.technique || '');
  const [product, setProduct] = useState(values.product || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setLength(values.length || '');
    setType(values.type || '');
    setBody(values.body || '');
    setSupport(values.support || '');
    setTechnique(values.technique || '');
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
    <SimpleModal title="Wire" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
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
    </SimpleModal>
  );
}
WireModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export function BalloonModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '');
  const [diameter, setDiameter] = useState(values.diameter || '');
  const [len, setLen] = useState(values.length || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setDiameter(values.diameter || '');
    setLen(values.length || '');
  }, [values]);
  const diameters = { '0.014':['1.5','2','2.5','3.5','4'], '0.018':['2','2.5','3','4','5','5.5','6','7'], '0.035':['3','4','5','6','7','8','9','10','12','14'] };
  const lengths = ['10','12','15','18','20','30','40','50','60','70','80','90','100','110','120'];
  const handleChange = (field, val) => {
    const newVals = { platform, diameter, length: len, [field]: val };
    if (field === 'platform') {
      setPlatform(val);
      setDiameter(val ? diameters[val][0] : '');
    }
    if (field === 'diameter') setDiameter(val);
    if (field === 'length') setLen(val);
    onSave({ platform: newVals.platform, diameter: newVals.diameter, length: newVals.length });
    if (newVals.platform && newVals.diameter && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title="PTA Balloon" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SegmentedControl
        options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
        value={platform}
        onChange={(val) => handleChange('platform', val)}
        ariaLabel="Platform"
      />
      <SelectControl label="Diameter" value={diameter} options={(diameters[platform] || []).map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('diameter', val)} />
      <SelectControl
        label="Length (mm)"
        value={len}
        options={[{ label: 'Choose length', value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </SimpleModal>
  );
}
BalloonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

const stentDia = { '0.014':['2','3','4','5'], '0.018':['4','5','6','7'], '0.035':['5','6','7','8','9','10'] };
const stentLen = { '0.014':['20','40','60','80'], '0.018':['40','60','80','100'], '0.035':['40','60','80','100','120'] };

export function StentModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '');
  const [type, setType] = useState(values.type || '');
  const [mat, setMat] = useState(values.material || '');
  const [dia, setDia] = useState(values.diameter || '');
  const [len, setLen] = useState(values.length || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setType(values.type || '');
    setMat(values.material || '');
    setDia(values.diameter || '');
    setLen(values.length || '');
  }, [values]);
  const handleChange = (field, val) => {
    const newVals = { platform, type, material: mat, diameter: dia, length: len, [field]: val };
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
      default: break;
    }
    onSave({ platform: newVals.platform, type: newVals.type, material: newVals.material, diameter: newVals.diameter, length: newVals.length });
    if (newVals.platform && newVals.type && newVals.material && newVals.diameter && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title="Stent" isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
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
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>&times;</button>
      </div>
    </SimpleModal>
  );
}
StentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

