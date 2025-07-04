import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, SelectControl } from '@wordpress/components';
import SegmentedControl from '../UI/SegmentedControl';
import { __ } from '@wordpress/i18n';
// miniature arterial tree icon used for vessel selector
import vesselTreeIcon from '../../assets/vessel-map.svg';
// device images for selector buttons
const needleImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2024/07/needle.png';
const sheathImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/sheath.jpg';
const catheterImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/catheter.jpg';
const wireImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/wire.jpg';
const balloonImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/pta.jpg';
const stentImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/stent.jpg';
const deviceImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2023/09/miscdevice.jpg';
const closureImg =
  'https://endoplanner.thesisapps.com/wp-content/uploads/2025/07/closuredeviceicon.png';

const closureDeviceOptions = [
  'Choose',
  '6F AngioSeal',
  '8F AngioSeal',
  'Perclose ProStyle',
  'Exoseal',
  'Starclose',
  '14F Manta',
  '18F Manta',
  'Mynx',
  'Custom',
];

// Simple utility to generate unique ids for dynamic rows
const uid = () => Math.random().toString(36).substr(2, 9);

// Accessible inline modal centered in the viewport. Previously this was anchored
// to the triggering element, but UX testing showed the popup should appear
// centered and scroll independently of the page.  The `anchor` prop is kept so
// existing calls do not break, but it is ignored.
const InlineModal = ({ title, isOpen, onRequestClose, children }) => {
  const ref = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      console.log(`[Popup] Opened: ${title}`);
      prevFocus.current = document.activeElement;
      setTimeout(() => ref.current?.focus(), 0);
    }

    return () => {
      if (isOpen) {
        console.log(`[Popup] Closed: ${title}`);
        prevFocus.current?.focus();
      }
    };
  }, [isOpen, title]);

  if (!isOpen) return null;

  return (
    <div className="inline-modal-overlay" onClick={onRequestClose}>
      <div
        className="inline-modal centered"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
        tabIndex="-1"
      >
        <div className="modal-header">{title}</div>
        {children}
      </div>
    </div>
  );
};

InlineModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Simple wrapper using InlineModal
const SimpleModal = (props) => <InlineModal {...props} />;

SimpleModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Generic card-like button used for selecting a device
// Generic card-like button used for selecting a device
function DeviceButton({ label, img, onClick }) {
  return (
    <button
      type="button"
      className="device-button"
      onClick={(e) => {
        console.log('Device button clicked', label);
        onClick(e);
      }}
    >
      <img src={img} alt="" />
      <span>{label}</span>
    </button>
  );
}

DeviceButton.propTypes = {
  label: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Helper to convert a selection object into a short label.  For the button text
// we only want the most recognisable parameter (gauge, platform, size, etc.).
const summarize = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  return Object.values(obj).filter(Boolean).join(' ');
};

const shortLabel = (type, obj) => {
  if (!obj || typeof obj !== 'object') return '';
  switch (type) {
    case 'needle':
      return obj.size ? obj.size.replace(' Gauge', 'G') : '';
    case 'sheath':
      return obj.frSize || '';
    case 'catheter':
      return obj.specific || '';
    case 'wire':
    case 'balloon':
    case 'stent':
      return obj.platform || '';
    default:
      return summarize(obj);
  }
};

// --- Popup Components -----------------------------------------------------
// Dropdown list of vessels displayed below the triggering button
function VesselDropdown({ isOpen, anchor, onRequestClose, value, onSave }) {
  const vessels = ['CFA', 'SFA', 'ATA', 'TTP', 'ATP', 'ADP'];
  if (!isOpen) return null;
  const handleSelect = (v) => {
    console.log('[Popup] Selected: ' + v);
    onSave(v);
    onRequestClose();
  };
  return (
    <SimpleModal
      title={__('Select Vessel', 'endoplanner')}
      isOpen={isOpen}
      anchor={anchor}
      placement="bottom"
      onRequestClose={onRequestClose}
    >
      <ul className="vessel-dropdown">
        <li>
          <button type="button" className="dropdown-item" disabled>
            {__('Choose vessel', 'endoplanner')}
          </button>
        </li>
        {vessels.map((v) => (
          <li key={v}>
            <button
              type="button"
              className={`dropdown-item${value === v ? ' selected' : ''}`}
              onClick={() => handleSelect(v)}
            >
              {v}
            </button>
          </li>
        ))}
      </ul>
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>
          &times;
        </button>
      </div>
    </SimpleModal>
  );
}

VesselDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  value: PropTypes.string,
  onSave: PropTypes.func.isRequired,
};

function NeedleModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [size, setSize] = useState(values.size || '');
  const [length, setLength] = useState(values.length || '');
  useEffect(() => { setSize(values.size || ''); setLength(values.length || ''); }, [values]);
  const handleChange = (field, val) => {
    const newVals = { size, length, [field]: val };
    if (field === 'size') setSize(val); else setLength(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
    if (newVals.size && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title={__('Needle', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label={__('Needle size', 'endoplanner')}
        value={size}
        options={[{ label: __('Choose size', 'endoplanner'), value: '', disabled: true }, ...['19 Gauge', '21 Gauge'].map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('size', val)}
      />
      <SelectControl
        label={__('Needle length', 'endoplanner')}
        value={length}
        options={[{ label: __('Choose length', 'endoplanner'), value: '', disabled: true }, ...['4cm', '7cm', '9cm'].map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function SheathModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [frSize, setFrSize] = useState(values.frSize || '');
  const [length, setLength] = useState(values.length || '');
  useEffect(() => { setFrSize(values.frSize || ''); setLength(values.length || ''); }, [values]);
  const sizes = ['4 Fr','5 Fr','6 Fr','7 Fr','8 Fr','9 Fr'];
  const lengths = ['10 cm','12 cm','25 cm'];
  const handleChange = (field, val) => {
    const newVals = { frSize, length, [field]: val };
    if (field === 'frSize') setFrSize(val); else setLength(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
    if (newVals.frSize && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title={__('Sheath', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label={__('French size', 'endoplanner')}
        value={frSize}
        options={[{ label: __('Choose size', 'endoplanner'), value: '', disabled: true }, ...sizes.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('frSize', val)}
      />
      <SelectControl
        label={__('Length', 'endoplanner')}
        value={length}
        options={[{ label: __('Choose length', 'endoplanner'), value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function CatheterModal({ isOpen, anchor, onRequestClose, values, onSave }) {
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
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
    if (newVals.size && newVals.length && newVals.specific) onRequestClose();
  };
  return (
    <SimpleModal title={__('Catheter', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label={__('Specific catheter', 'endoplanner')}
        value={specific}
        options={[{ label: __('Choose catheter', 'endoplanner'), value: '', disabled: true }, ...specifics.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('specific', val)}
      />
      <SelectControl
        label={__('French size', 'endoplanner')}
        value={size}
        options={[{ label: __('Choose size', 'endoplanner'), value: '', disabled: true }, ...sizes.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('size', val)}
      />
      <SelectControl
        label={__('Length', 'endoplanner')}
        value={length}
        options={[{ label: __('Choose length', 'endoplanner'), value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function WireModal({ isOpen, anchor, onRequestClose, values, onSave }) {
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
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
    if (newVals.platform && newVals.length && newVals.type && newVals.technique) onRequestClose();
  };
  return (
    <SimpleModal title={__('Wire', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
        <SegmentedControl
          options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
          value={platform}
          onChange={(val)=>handleChange('platform', val)}
          ariaLabel={__('Platform', 'endoplanner')}
        />
      <SelectControl label={__('Length', 'endoplanner')} value={length}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)}
      />
        <SegmentedControl
          options={[{label:'Glidewire',value:'Glidewire'},{label:'CTO wire',value:'CTO wire'},{label:'Support wire',value:'Support wire'}]}
          value={type}
          onChange={(val)=>handleChange('type', val)}
          ariaLabel={__('Type', 'endoplanner')}
        />
      {type === 'CTO wire' && (
        <SelectControl
          label={__('Body type', 'endoplanner')}
          value={body}
          options={[{ label: __('Choose body', 'endoplanner'), value: '', disabled: true }, ...bodyOpts.map(v => ({ label: v, value: v }))]}
          onChange={(val) => handleChange('body', val)}
        />
      )}
      {type === 'Support wire' && (
        <SelectControl
          label={__('Support wire', 'endoplanner')}
          value={support}
          options={[{ label: __('Choose wire', 'endoplanner'), value: '', disabled: true }, ...supportOpts.map(v => ({ label: v, value: v }))]}
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
          ariaLabel={__('Technique', 'endoplanner')}
        />
      <SelectControl
        label={__('Product', 'endoplanner')}
        value={product}
        options={[
          { label: __('Choose product', 'endoplanner'), value: '', disabled: true },
          { label: __('None', 'endoplanner'), value: 'none' }
        ]}
        onChange={(val)=>handleChange('product', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function BalloonModal({ isOpen, anchor, onRequestClose, values, onSave }) {
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
    console.log('[Popup] Updated: ', newVals);
    onSave({ platform: newVals.platform, diameter: newVals.diameter, length: newVals.length });
    if (newVals.platform && newVals.diameter && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title={__('PTA Balloon', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
        <SegmentedControl
          options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
          value={platform}
          onChange={(val) => handleChange('platform', val)}
          ariaLabel={__('Platform', 'endoplanner')}
        />
      <SelectControl label={__('Diameter', 'endoplanner')} value={diameter}
        options={(diameters[platform] || []).map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('diameter', val)}
      />
      <SelectControl
        label={__('Length (mm)', 'endoplanner')}
        value={len}
        options={[{ label: __('Choose length', 'endoplanner'), value: '', disabled: true }, ...lengths.map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function StentModal({ isOpen, anchor, onRequestClose, values, onSave }) {
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
    console.log('[Popup] Updated: ', newVals);
    onSave({ platform: newVals.platform, type: newVals.type, material: newVals.material, diameter: newVals.diameter, length: newVals.length });
    if (newVals.platform && newVals.type && newVals.material && newVals.diameter && newVals.length) onRequestClose();
  };
  return (
    <SimpleModal title={__('Stent', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SegmentedControl
        options={['0.014','0.018','0.035'].map(v => ({ label: v, value: v }))}
        value={platform}
        onChange={(val)=>handleChange('platform', val)}
        ariaLabel={__('Platform', 'endoplanner')}
      />
      <SegmentedControl
        options={[{label:'self expandable',value:'self expandable'},{label:'balloon expandable',value:'balloon expandable'}]}
        value={type}
        onChange={(val)=>handleChange('type', val)}
        ariaLabel={__('Stent type', 'endoplanner')}
      />
      <SegmentedControl
        options={[{label:'bare metal',value:'bare metal'},{label:'covered',value:'covered'}]}
        value={mat}
        onChange={(val)=>handleChange('material', val)}
        ariaLabel={__('Stent material', 'endoplanner')}
      />
      <SelectControl
        label={__('Diameter', 'endoplanner')}
        value={dia}
        options={[{ label: __('Choose diameter', 'endoplanner'), value: '', disabled: true }, ...(stentDia[platform] || []).map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('diameter', val)}
      />
      <SelectControl
        label={__('Length', 'endoplanner')}
        value={len}
        options={[{ label: __('Choose length', 'endoplanner'), value: '', disabled: true }, ...(stentLen[platform] || []).map(v => ({ label: v, value: v }))]}
        onChange={(val) => handleChange('length', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
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

function DeviceModal({ isOpen, anchor, onRequestClose, value, onSave, title = __('Special device', 'endoplanner'), options }) {
  const baseOptions = options || ['Re-entry device','IVUS catheter','Vascular plug','Embolization coils','Closure device','Shockwave','Scoring balloon','Atherectomy device','Thrombectomy device','Custom'];
  const optionList = baseOptions[0] === 'Choose' ? baseOptions : ['Choose', ...baseOptions];
  const initIsKnown = baseOptions.includes(value);
  const [device, setDevice] = useState(initIsKnown ? value : value ? 'Custom' : 'Choose');
  const [customText, setCustomText] = useState(initIsKnown || !value ? '' : value || '');
  useEffect(() => {
    const known = baseOptions.includes(value);
    setDevice(known ? value : value ? 'Custom' : 'Choose');
    setCustomText(known || !value ? '' : value || '');
  }, [value]);
  const handleSave = (val, customVal = customText) => {
    console.log('[Popup] Selected: ' + val);
    setDevice(val);
    if (val === 'Choose') {
      onSave('');
      return;
    }
    if (val !== 'Custom') {
      onSave(val);
      onRequestClose();
    } else {
      onSave(customVal);
      if (customVal) onRequestClose();
    }
  };
  return (
    <SimpleModal title={title} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl
        label={__('Device', 'endoplanner')}
        value={device}
        options={optionList.map(v => ({ label: v, value: v }))}
        onChange={(val)=> handleSave(val)}
      />
      {device === 'Custom' && (
        <input
          type="text"
          className="custom-device-input"
          value={customText}
          onChange={e => { setCustomText(e.target.value); console.log('[Popup] Custom text', e.target.value); handleSave('Custom', e.target.value); }}
          placeholder={__('Enter custom device', 'endoplanner')}
        />
      )}
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => { console.log('[Popup] X closed'); onRequestClose(); }}>&times;</button>
      </div>
    </SimpleModal>
  );
}

DeviceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  value: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
};

// --- Row components -------------------------------------------------------
const RowControls = ({ onAdd, onRemove, showRemove, label, showAdd = true }) => (
  <div className="row-controls">
    {label && <span className="row-add-label">{label}</span>}
    {showAdd && (
      <button
        type="button"
        className="circle-btn small-circle-btn add-row-btn"
        onClick={() => {
          console.log('Add row');
          onAdd();
        }}
      >
        +
      </button>
    )}
    {showRemove && (
      <button
        type="button"
        className="circle-btn small-circle-btn remove-row-btn"
        onClick={() => {
          console.log('Remove row');
          onRemove();
        }}
      >
        &minus;
      </button>
    )}
  </div>
);
RowControls.propTypes = { onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool, label: PropTypes.string, showAdd: PropTypes.bool };

function AccessRow({ index, values, onChange, onAdd, onRemove, showRemove }) {
  const [vesselOpen, setVesselOpen] = useState(false);
  const [needleOpen, setNeedleOpen] = useState(false);
  const [sheathOpen, setSheathOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [vesselAnchor, setVesselAnchor] = useState(null);
  const [needleAnchor, setNeedleAnchor] = useState(null);
  const [sheathAnchor, setSheathAnchor] = useState(null);
  const [catAnchor, setCatAnchor] = useState(null);
  const [needleIdx, setNeedleIdx] = useState(0);
  const [sheathIdx, setSheathIdx] = useState(0);
  const [catIdx, setCatIdx] = useState(0);
  const data = values || {};
  const vesselLabel = data.vessel || __('Vessel', 'endoplanner');
  const needles = data.needles || [{}];
  const sheaths = data.sheaths || [{}];
  const catheters = data.catheters || [{}];

  const updateArray = (arr, idx, val) => arr.map((d, i) => (i === idx ? val : d));

  const updateNeedle = (idx, val) => {
    console.log('Update needle', idx, val);
    onChange({ ...data, needles: updateArray(needles, idx, val) });
  };
  const addNeedle = () => {
    console.log('Add needle');
    onChange({ ...data, needles: [...needles, {}] });
  };
  const removeNeedle = (idx) => {
    console.log('Remove needle', idx);
    onChange({ ...data, needles: needles.filter((_, i) => i !== idx) });
  };

  const updateSheath = (idx, val) => {
    console.log('Update sheath', idx, val);
    onChange({ ...data, sheaths: updateArray(sheaths, idx, val) });
  };
  const addSheath = () => {
    console.log('Add sheath');
    onChange({ ...data, sheaths: [...sheaths, {}] });
  };
  const removeSheath = (idx) => {
    console.log('Remove sheath', idx);
    onChange({ ...data, sheaths: sheaths.filter((_, i) => i !== idx) });
  };

  const updateCatheter = (idx, val) => {
    console.log('Update catheter', idx, val);
    onChange({ ...data, catheters: updateArray(catheters, idx, val) });
  };
  const addCatheter = () => {
    console.log('Add catheter');
    onChange({ ...data, catheters: [...catheters, {}] });
  };
  const removeCatheter = (idx) => {
    console.log('Remove catheter', idx);
    onChange({ ...data, catheters: catheters.filter((_, i) => i !== idx) });
  };
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <SegmentedControl
          options={[{ label: 'Antegrade', value: 'Antegrade' }, { label: 'Retrograde', value: 'Retrograde' }]}
          value={data.approach || ''}
          onChange={(val) => { console.log('Access approach', val); onChange({ ...data, approach: val }); }}
          ariaLabel={__('Approach', 'endoplanner')}
        />
        <div className="device-grid">
          <div className="device-column">
            <DeviceButton
              label={vesselLabel}
              img={vesselTreeIcon}
              onClick={(e) => {
                console.log('Open vessel modal', index);
                setVesselAnchor(e.currentTarget.getBoundingClientRect());
                setVesselOpen(true);
              }}
            />
          </div>
          <div className="device-column">
            {needles.map((n, i) => (
              <div key={`n${i}`} className="device-wrapper">
                <DeviceButton
                  label={shortLabel('needle', n) || __('Needle', 'endoplanner')}
                  img={needleImg}
                  onClick={(e) => {
                    console.log('Open needle modal', index, i);
                    setNeedleIdx(i);
                    setNeedleAnchor(e.currentTarget.getBoundingClientRect());
                    setNeedleOpen(true);
                  }}
                />
                <div className="device-controls">
                  {i > 0 && (
                    <button type="button" className="device-inline-btn remove-btn" onClick={() => removeNeedle(i)}>
                      &minus;
                    </button>
                  )}
                  <button type="button" className="device-inline-btn add-btn" onClick={addNeedle}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="device-column">
            {sheaths.map((s, i) => (
              <div key={`s${i}`} className="device-wrapper">
                <DeviceButton
                  label={shortLabel('sheath', s) || __('Sheath', 'endoplanner')}
                  img={sheathImg}
                  onClick={(e) => {
                    console.log('Open sheath modal', index, i);
                    setSheathIdx(i);
                    setSheathAnchor(e.currentTarget.getBoundingClientRect());
                    setSheathOpen(true);
                  }}
                />
                <div className="device-controls">
                  {i > 0 && (
                    <button type="button" className="device-inline-btn remove-btn" onClick={() => removeSheath(i)}>
                      &minus;
                    </button>
                  )}
                  <button type="button" className="device-inline-btn add-btn" onClick={addSheath}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="device-column">
            {catheters.map((c, i) => (
              <div key={`c${i}`} className="device-wrapper">
                <DeviceButton
                  label={shortLabel('catheter', c) || __('Catheter', 'endoplanner')}
                  img={catheterImg}
                  onClick={(e) => {
                    console.log('Open catheter modal', index, i);
                    setCatIdx(i);
                    setCatAnchor(e.currentTarget.getBoundingClientRect());
                    setCatOpen(true);
                  }}
                />
                <div className="device-controls">
                  {i > 0 && (
                    <button type="button" className="device-inline-btn remove-btn" onClick={() => removeCatheter(i)}>
                      &minus;
                    </button>
                  )}
                  <button type="button" className="device-inline-btn add-btn" onClick={addCatheter}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <RowControls
          onAdd={onAdd}
          onRemove={onRemove}
          showRemove={showRemove}
          showAdd={false}
        />
        <VesselDropdown
          isOpen={vesselOpen}
        anchor={vesselAnchor}
        onRequestClose={() => {
          console.log('Close vessel dropdown');
          setVesselOpen(false);
          setVesselAnchor(null);
        }}
        value={data.vessel}
          onSave={(val) => onChange({ ...data, vessel: val })}
        />
        <NeedleModal
          isOpen={needleOpen}
          anchor={needleAnchor}
          onRequestClose={() => {
            console.log('Close needle modal');
            setNeedleOpen(false);
            setNeedleAnchor(null);
          }}
          values={needles[needleIdx] || {}}
          onSave={(val) => updateNeedle(needleIdx, val)}
        />
        <SheathModal
          isOpen={sheathOpen}
          anchor={sheathAnchor}
          onRequestClose={() => {
            console.log('Close sheath modal');
            setSheathOpen(false);
            setSheathAnchor(null);
          }}
          values={sheaths[sheathIdx] || {}}
          onSave={(val) => updateSheath(sheathIdx, val)}
        />
        <CatheterModal
          isOpen={catOpen}
          anchor={catAnchor}
          onRequestClose={() => {
            console.log('Close catheter modal');
            setCatOpen(false);
            setCatAnchor(null);
          }}
          values={catheters[catIdx] || {}}
          onSave={(val) => updateCatheter(catIdx, val)}
        />
      </div>
    </div>
  );
}

AccessRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool };

function NavRow({ index, values, onChange, onAdd, onRemove, showRemove }) {
  const [wireOpen, setWireOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [wireAnchor, setWireAnchor] = useState(null);
  const [catAnchor, setCatAnchor] = useState(null);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
  const wireLabel = shortLabel('wire', data.wire) || __('Wire', 'endoplanner');
  const catheterLabel = shortLabel('catheter', data.catheter) || __('Catheter', 'endoplanner');
  const devLabel = data.device || __('Device', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <div className="device-row">
        <DeviceButton
          label={wireLabel}
          img={wireImg}
          onClick={(e) => {
            console.log('Open wire modal', index);
            setWireAnchor(e.currentTarget.getBoundingClientRect());
            setWireOpen(true);
          }}
        />
        <DeviceButton
          label={catheterLabel}
          img={catheterImg}
          onClick={(e) => {
            console.log('Open catheter modal', index);
            setCatAnchor(e.currentTarget.getBoundingClientRect());
            setCatOpen(true);
          }}
        />
        <DeviceButton
          label={devLabel}
          img={deviceImg}
          onClick={(e) => {
            console.log('Open special device modal', index);
            setDevAnchor(e.currentTarget.getBoundingClientRect());
            setDevOpen(true);
          }}
        />
      </div>
      <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} />
      <WireModal
        isOpen={wireOpen}
        anchor={wireAnchor}
        onRequestClose={() => {
          console.log('Close wire modal');
          setWireOpen(false);
          setWireAnchor(null);
        }}
        values={data.wire || {}}
        onSave={(val) => onChange({ ...data, wire: val })}
      />
      <CatheterModal
        isOpen={catOpen}
        anchor={catAnchor}
        onRequestClose={() => {
          console.log('Close catheter modal');
          setCatOpen(false);
          setCatAnchor(null);
        }}
        values={data.catheter || {}}
        onSave={(val) => onChange({ ...data, catheter: val })}
      />
      <DeviceModal
        isOpen={devOpen}
        anchor={devAnchor}
        onRequestClose={() => {
          console.log('Close special device modal');
          setDevOpen(false);
          setDevAnchor(null);
        }}
        value={data.device}
        onSave={(val) => onChange({ ...data, device: val })}
      />
      </div>
    </div>
  );
}

NavRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool };

function TherapyRow({ index, values, onChange, onAdd, onRemove, showRemove }) {
  const [ballOpen, setBallOpen] = useState(false);
  const [stentOpen, setStentOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [ballAnchor, setBallAnchor] = useState(null);
  const [stentAnchor, setStentAnchor] = useState(null);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
  const balloonLabel = shortLabel('balloon', data.balloon) || __('Balloon', 'endoplanner');
  const stentLabel = shortLabel('stent', data.stent) || __('Stent', 'endoplanner');
  const devLabel = data.device || __('Device', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <div className="device-row">
        <DeviceButton
          label={balloonLabel}
          img={balloonImg}
          onClick={(e) => {
            console.log('Open balloon modal', index);
            setBallAnchor(e.currentTarget.getBoundingClientRect());
            setBallOpen(true);
          }}
        />
        <DeviceButton
          label={stentLabel}
          img={stentImg}
          onClick={(e) => {
            console.log('Open stent modal', index);
            setStentAnchor(e.currentTarget.getBoundingClientRect());
            setStentOpen(true);
          }}
        />
        <DeviceButton
          label={devLabel}
          img={deviceImg}
          onClick={(e) => {
            console.log('Open special device modal', index);
            setDevAnchor(e.currentTarget.getBoundingClientRect());
            setDevOpen(true);
          }}
        />
      </div>
      <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} />
        <BalloonModal
          isOpen={ballOpen}
          anchor={ballAnchor}
          onRequestClose={() => {
            console.log('Close balloon modal');
            setBallOpen(false);
            setBallAnchor(null);
          }}
          values={data.balloon || {}}
          onSave={(val) => onChange({ ...data, balloon: val })}
        />
        <StentModal
          isOpen={stentOpen}
          anchor={stentAnchor}
          onRequestClose={() => {
            console.log('Close stent modal');
            setStentOpen(false);
            setStentAnchor(null);
          }}
          values={data.stent || {}}
          onSave={(val) => onChange({ ...data, stent: val })}
        />
      <DeviceModal
        isOpen={devOpen}
        anchor={devAnchor}
        onRequestClose={() => {
          console.log('Close special device modal');
          setDevOpen(false);
          setDevAnchor(null);
        }}
        value={data.device}
        onSave={(val) => onChange({ ...data, device: val })}
      />
      </div>
    </div>
  );
}

TherapyRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool };

function ClosureRow({ index, values, onChange, onAdd, onRemove, showRemove }) {
  const [devOpen, setDevOpen] = useState(false);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
  const method = data.method || '';
  const devLabel3 = data.device || __('Device', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <SegmentedControl
          options={[{ label: 'Manual pressure', value: 'Manual pressure' }, { label: 'Closure device', value: 'Closure device' }]}
          value={method}
          onChange={(val) => { console.log('Closure method', val); onChange({ ...data, method: val }); }}
          ariaLabel={__('Method', 'endoplanner')}
        />
        <div className="device-row">
        {method === 'Closure device' && (
          <DeviceButton
            label={devLabel3}
            img={closureImg}
            onClick={(e) => {
              console.log('Open closure device modal', index);
              setDevAnchor(e.currentTarget.getBoundingClientRect());
              setDevOpen(true);
            }}
          />
        )}
        </div>
        <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} />
        <DeviceModal
          isOpen={devOpen}
          anchor={devAnchor}
          title={__('Closure device', 'endoplanner')}
          options={closureDeviceOptions}
        onRequestClose={() => {
          console.log('Close closure device modal');
          setDevOpen(false);
          setDevAnchor(null);
        }}
        value={data.device}
          onSave={(val) => onChange({ ...data, device: val })}
        />
      </div>
    </div>
  );
}

ClosureRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool };

// --- Main Step Component --------------------------------------------------
export default function Step4({ data, setData }) {
  const initRows = (arr) =>
    arr && arr.length ? arr.map((r) => ({ id: r.id || uid(), ...r })) : [{ id: uid() }];
  const [accessRows, setAccessRows] = useState(initRows(data.accessRows));
  const [navRows, setNavRows] = useState(initRows(data.navRows));
  const [therapyRows, setTherapyRows] = useState(initRows(data.therapyRows));
  const [closureRows, setClosureRows] = useState(initRows(data.closureRows));

  useEffect(() => {
    setData({ ...data, accessRows, navRows, therapyRows, closureRows });
  }, [accessRows, navRows, therapyRows, closureRows]);

  return (
    <div className="step4-intervention">

      <section className="intervention-section">
        <div className="section-heading">{__('Access', 'endoplanner')}</div>
        {accessRows.map((row, i) => (
          <AccessRow
            key={row.id}
            index={i}
            values={row}
            onChange={(val) => setAccessRows((prev) => prev.map((r) => (r.id === row.id ? val : r)))}
            onAdd={() => {}}
            onRemove={() => setAccessRows((prev) => prev.filter((r) => r.id !== row.id))}
            showRemove={accessRows.length > 1}
          />
        ))}
        <RowControls
          onAdd={() => setAccessRows((prev) => [...prev, { id: uid() }])}
          onRemove={() => {}}
          showRemove={false}
          label={__('Add another approach', 'endoplanner')}
        />
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Navigation & Crossing', 'endoplanner')}</div>
        {navRows.map((row, i) => (
          <NavRow
            key={row.id}
            index={i}
            values={row}
            onChange={(val) => setNavRows((prev) => prev.map((r) => (r.id === row.id ? val : r)))}
            onAdd={() => setNavRows((prev) => [...prev, { id: uid() }])}
            onRemove={() => setNavRows((prev) => prev.filter((r) => r.id !== row.id))}
            showRemove={navRows.length > 1}
          />
        ))}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Vessel preparation & therapy', 'endoplanner')}</div>
        {therapyRows.map((row, i) => (
          <TherapyRow
            key={row.id}
            index={i}
            values={row}
            onChange={(val) => setTherapyRows((prev) => prev.map((r) => (r.id === row.id ? val : r)))}
            onAdd={() => setTherapyRows((prev) => [...prev, { id: uid() }])}
            onRemove={() => setTherapyRows((prev) => prev.filter((r) => r.id !== row.id))}
            showRemove={therapyRows.length > 1}
          />
        ))}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Closure', 'endoplanner')}</div>
        {closureRows.map((row, i) => (
          <ClosureRow
            key={row.id}
            index={i}
            values={row}
            onChange={(val) => setClosureRows((prev) => prev.map((r) => (r.id === row.id ? val : r)))}
            onAdd={() => setClosureRows((prev) => [...prev, { id: uid() }])}
            onRemove={() => setClosureRows((prev) => prev.filter((r) => r.id !== row.id))}
            showRemove={closureRows.length > 1}
          />
        ))}
      </section>
    </div>
  );
}

Step4.propTypes = { data: PropTypes.object.isRequired, setData: PropTypes.func.isRequired };
