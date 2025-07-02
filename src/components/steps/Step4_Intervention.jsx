import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, SelectControl, RadioControl } from '@wordpress/components';
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
const closureImg = deviceImg;

// Simple utility to generate unique ids for dynamic rows
const uid = () => Math.random().toString(36).substr(2, 9);

// Accessible inline modal positioned relative to the triggering button
const InlineModal = ({ title, anchor, isOpen, onRequestClose, children, placement = 'top' }) => {
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

  if (!isOpen || !anchor) return null;

  const style = placement === 'top'
    ? { top: anchor.top + window.scrollY, left: anchor.left + anchor.width / 2 + window.scrollX }
    : { top: anchor.top + anchor.height + window.scrollY, left: anchor.left + anchor.width / 2 + window.scrollX };

  return (
    <div className="inline-modal-overlay">
      <div
        className={`inline-modal ${placement}`}
        style={style}
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
  anchor: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Simple wrapper using InlineModal
const SimpleModal = (props) => <InlineModal {...props} />;

SimpleModal.propTypes = {
  title: PropTypes.string.isRequired,
  anchor: PropTypes.object,
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

// Helper to convert a selection object into a short label
const summarize = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  return Object.values(obj).filter(Boolean).join(' ');
};

// --- Popup Components -----------------------------------------------------
// Dropdown list of vessels displayed below the triggering button
function VesselDropdown({ isOpen, anchor, onRequestClose, value, onSave }) {
  const vessels = ['CFA', 'SFA', 'ATA', 'TTP', 'ATP', 'ADP'];
  if (!isOpen) return null;
  const handleSelect = (v) => {
    console.log('[Popup] Selected: ' + v);
    onSave(v);
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
  const [size, setSize] = useState(values.size || '19 Gauge');
  const [length, setLength] = useState(values.length || '4cm');
  useEffect(() => { setSize(values.size || '19 Gauge'); setLength(values.length || '4cm'); }, [values]);
  const handleChange = (field, val) => {
    const newVals = { size, length, [field]: val };
    if (field === 'size') setSize(val); else setLength(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
  };
  return (
    <SimpleModal title={__('Needle', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl label={__('Needle size', 'endoplanner')} value={size}
        options={['19 Gauge','21 Gauge'].map(v => ({ label:v, value:v }))}
        onChange={(val) => handleChange('size', val)}
      />
      <SelectControl label={__('Needle length', 'endoplanner')} value={length}
        options={['4cm','7cm','9cm'].map(v => ({ label:v, value:v }))}
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
  const [frSize, setFrSize] = useState(values.frSize || '4 Fr');
  const [length, setLength] = useState(values.length || '10 cm');
  useEffect(() => { setFrSize(values.frSize || '4 Fr'); setLength(values.length || '10 cm'); }, [values]);
  const sizes = ['4 Fr','5 Fr','6 Fr','7 Fr','8 Fr','9 Fr'];
  const lengths = ['10 cm','12 cm','25 cm'];
  const handleChange = (field, val) => {
    const newVals = { frSize, length, [field]: val };
    if (field === 'frSize') setFrSize(val); else setLength(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
  };
  return (
    <SimpleModal title={__('Sheath', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl label={__('French size', 'endoplanner')} value={frSize}
        options={sizes.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('frSize', val)}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={length}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)}
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
  const [size, setSize] = useState(values.size || '2.3 Fr');
  const [length, setLength] = useState(values.length || '40 cm');
  const [specific, setSpecific] = useState(values.specific || 'BER2');
  useEffect(() => { setSize(values.size || '2.3 Fr'); setLength(values.length || '40 cm'); setSpecific(values.specific || 'BER2'); }, [values]);
  const sizes = ['2.3 Fr','2.6 Fr','4 Fr','5 Fr','6 Fr','7 Fr'];
  const lengths = ['40 cm','65 cm','80 cm','90 cm','105 cm','110 cm','125 cm','135 cm','150 cm'];
  const specifics = ['BER2','BHW','Cobra 1','Cobra 2','Cobra 3','Cobra Glidecath','CXI 0.018','CXI 0.014','Navicross 0.018','Navicross 0.035','MultiPurpose','PIER','Pigtail Flush','Straight Flush','Universal Flush','Rim','Simmons 1','Simmons 2','Simmons 3','Vertebral'];
  const handleChange = (field, val) => {
    const newVals = { size, length, specific, [field]: val };
    if (field === 'size') setSize(val);
    if (field === 'length') setLength(val);
    if (field === 'specific') setSpecific(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
  };
  return (
    <SimpleModal title={__('Catheter', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl label={__('French size', 'endoplanner')} value={size} options={sizes.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('size', val)} />
      <SelectControl label={__('Length', 'endoplanner')} value={length} options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)} />
      <SelectControl label={__('Specific catheter', 'endoplanner')} value={specific} options={specifics.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('specific', val)} />
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
  const [platform, setPlatform] = useState(values.platform || '0.014');
  const [length, setLength] = useState(values.length || '180 cm');
  const [type, setType] = useState(values.type || 'Glidewire');
  const [body, setBody] = useState(values.body || 'Light bodied');
  const [support, setSupport] = useState(values.support || 'Rosen wire');
  const [technique, setTechnique] = useState(values.technique || 'Intimal Tracking');
  const [product, setProduct] = useState(values.product || '');
  useEffect(() => { setPlatform(values.platform || '0.014'); setLength(values.length || '180 cm'); setType(values.type || 'Glidewire'); setBody(values.body || 'Light bodied'); setSupport(values.support || 'Rosen wire'); setTechnique(values.technique || 'Intimal Tracking'); setProduct(values.product || ''); }, [values]);
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
  };
  return (
    <SimpleModal title={__('Wire', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={(val)=>handleChange('platform', val)}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={length}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)}
      />
      <RadioControl label={__('Type', 'endoplanner')} selected={type}
        options={[{label:'Glidewire',value:'Glidewire'},{label:'CTO wire',value:'CTO wire'},{label:'Support wire',value:'Support wire'}]}
        onChange={(val)=>handleChange('type', val)}
      />
      {type === 'CTO wire' && (
        <SelectControl label={__('Body type', 'endoplanner')} value={body}
          options={bodyOpts.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('body', val)}
        />
      )}
      {type === 'Support wire' && (
        <SelectControl label={__('Support wire', 'endoplanner')} value={support}
          options={supportOpts.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('support', val)}
        />
      )}
      <RadioControl label={__('Technique', 'endoplanner')} selected={technique}
        options={[{label:'Intimal Tracking',value:'Intimal Tracking'},{label:'Limited sub-intimal dissection and re-entry',value:'Limited sub-intimal dissection and re-entry'}]}
        onChange={(val)=>handleChange('technique', val)}
      />
      <SelectControl label={__('Product', 'endoplanner')} value={product}
        options={[{ label: __('None', 'endoplanner'), value: '' }]} onChange={(val)=>handleChange('product', val)}
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
  const [platform, setPlatform] = useState(values.platform || '0.014');
  const [diameter, setDiameter] = useState(values.diameter || '1.5');
  const [len, setLen] = useState(values.length || '10');
  useEffect(() => { setPlatform(values.platform || '0.014'); setDiameter(values.diameter || '1.5'); setLen(values.length || '10'); }, [values]);
  const diameters = { '0.014':['1.5','2','2.5','3.5','4'], '0.018':['2','2.5','3','4','5','5.5','6','7'], '0.035':['3','4','5','6','7','8','9','10','12','14'] };
  const lengths = ['10','12','15','18','20','30','40','50','60','70','80','90','100','110','120'];
  const handleChange = (field, val) => {
    const newVals = { platform, diameter, length: len, [field]: val };
    if (field === 'platform'){ setPlatform(val); setDiameter(diameters[val][0]); }
    if (field === 'diameter') setDiameter(val);
    if (field === 'length') setLen(val);
    console.log('[Popup] Updated: ', newVals);
    onSave({ platform: newVals.platform, diameter: newVals.diameter, length: newVals.length });
  };
  return (
    <SimpleModal title={__('PTA Balloon', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={(val) => handleChange('platform', val)}
      />
      <SelectControl label={__('Diameter', 'endoplanner')} value={diameter}
        options={diameters[platform].map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('diameter', val)}
      />
      <SelectControl label={__('Length (mm)', 'endoplanner')} value={len}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)}
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
  const [platform, setPlatform] = useState(values.platform || '0.014');
  const [type, setType] = useState(values.type || 'self expandable');
  const [mat, setMat] = useState(values.material || 'bare metal');
  const [dia, setDia] = useState(values.diameter || stentDia[platform][0]);
  const [len, setLen] = useState(values.length || stentLen[platform][0]);
  useEffect(() => { setPlatform(values.platform || '0.014'); setType(values.type || 'self expandable'); setMat(values.material || 'bare metal'); setDia(values.diameter || stentDia[values.platform || '0.014'][0]); setLen(values.length || stentLen[values.platform || '0.014'][0]); }, [values]);
  const handleChange = (field, val) => {
    const newVals = { platform, type, material: mat, diameter: dia, length: len, [field]: val };
    switch(field){
      case 'platform': setPlatform(val); setDia(stentDia[val][0]); setLen(stentLen[val][0]); break;
      case 'type': setType(val); break;
      case 'material': setMat(val); break;
      case 'diameter': setDia(val); break;
      case 'length': setLen(val); break;
      default: break;
    }
    console.log('[Popup] Updated: ', newVals);
    onSave({ platform: newVals.platform, type: newVals.type, material: newVals.material, diameter: newVals.diameter, length: newVals.length });
  };
  return (
    <SimpleModal title={__('Stent', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={(val)=>handleChange('platform', val)}
      />
      <RadioControl label={__('Stent type', 'endoplanner')} selected={type}
        options={[{label:'self expandable',value:'self expandable'},{label:'balloon expandable',value:'balloon expandable'}]}
        onChange={(val)=>handleChange('type', val)}
      />
      <RadioControl label={__('Stent material', 'endoplanner')} selected={mat}
        options={[{label:'bare metal',value:'bare metal'},{label:'covered',value:'covered'}]}
        onChange={(val)=>handleChange('material', val)}
      />
      <SelectControl label={__('Diameter', 'endoplanner')} value={dia}
        options={stentDia[platform].map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('diameter', val)}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={len}
        options={stentLen[platform].map(v => ({ label:v, value:v }))} onChange={(val)=>handleChange('length', val)}
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

function DeviceModal({ isOpen, anchor, onRequestClose, value, onSave }) {
  const [device, setDevice] = useState(value || 'Re-entry device');
  useEffect(() => { setDevice(value || 'Re-entry device'); }, [value]);
  const options = ['Re-entry device','IVUS catheter','Vascular plug','Embolization coils','Closure device','Shockwave','Scoring balloon','Atherectomy device','Thrombectomy device','Miscellaneous'];
  return (
    <SimpleModal title={__('Special device', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
      <SelectControl label={__('Device', 'endoplanner')} value={device}
        options={options.map(v => ({ label:v, value:v }))}
        onChange={(val)=>{ setDevice(val); console.log('[Popup] Selected: ' + val); onSave(val); }}
      />
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
};

// --- Row components -------------------------------------------------------
const RowControls = ({ onAdd, onRemove }) => (
  <div className="row-controls">
    {/* debugging add/remove row clicks */}
    <button
      type="button"
      className="circle-btn add-row-btn"
      onClick={() => {
        console.log('Add row');
        onAdd();
      }}
    >
      +
    </button>
    <button
      type="button"
      className="circle-btn remove-row-btn"
      onClick={() => {
        console.log('Remove row');
        onRemove();
      }}
    >
      &minus;
    </button>
  </div>
);
RowControls.propTypes = { onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function AccessRow({ index, values, onChange, onAdd, onRemove }) {
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
  const devices = data.deviceGroups || [{ needle: data.needle, sheath: data.sheath, catheter: data.catheter }];
  const vesselLabel = data.vessel || __('Select vessel', 'endoplanner');

  const updateDevice = (idx, field, val) => {
    const newGroups = devices.map((g, i) => (i === idx ? { ...g, [field]: val } : g));
    console.log('Update device group', idx, field, val);
    onChange({ ...data, deviceGroups: newGroups });
  };

  const addDeviceGroup = () => {
    console.log('Add device to access row', index);
    onChange({ ...data, deviceGroups: [...devices, {}] });
  };
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <div className="selector-row">
          <RadioControl
            label={__('Approach', 'endoplanner')}
            selected={data.approach || 'Antegrade'}
          options={[{ label: 'Antegrade', value: 'Antegrade' }, { label: 'Retrograde', value: 'Retrograde' }]}
          onChange={(val) => { console.log('Access approach', val); onChange({ ...data, approach: val }); }}
        />
        </div>
        <div className="device-row">
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
        {devices.map((grp, di) => {
          const nLabel = summarize(grp.needle) || __('Needle', 'endoplanner');
          const sLabel = summarize(grp.sheath) || __('Sheath', 'endoplanner');
          const cLabel = summarize(grp.catheter) || __('Catheter', 'endoplanner');
          return (
            <div key={di} className="device-row-wrapper">
              <div className="device-row">
                <DeviceButton
                  label={nLabel}
                  img={needleImg}
                  onClick={(e) => {
                    console.log('Open needle modal', index, di);
                    setNeedleIdx(di);
                    setNeedleAnchor(e.currentTarget.getBoundingClientRect());
                    setNeedleOpen(true);
                  }}
                />
                <DeviceButton
                  label={sLabel}
                  img={sheathImg}
                  onClick={(e) => {
                    console.log('Open sheath modal', index, di);
                    setSheathIdx(di);
                    setSheathAnchor(e.currentTarget.getBoundingClientRect());
                    setSheathOpen(true);
                  }}
                />
                <DeviceButton
                  label={cLabel}
                  img={catheterImg}
                  onClick={(e) => {
                    console.log('Open catheter modal', index, di);
                    setCatIdx(di);
                    setCatAnchor(e.currentTarget.getBoundingClientRect());
                    setCatOpen(true);
                  }}
                />
              </div>
              {di === devices.length - 1 && (
                <button
                  type="button"
                  className="circle-btn add-device-btn"
                  onClick={addDeviceGroup}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
        <RowControls onAdd={onAdd} onRemove={onRemove} />
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
        values={devices[needleIdx]?.needle || {}}
        onSave={(val) => updateDevice(needleIdx, 'needle', val)}
        />
        <SheathModal
          isOpen={sheathOpen}
          anchor={sheathAnchor}
          onRequestClose={() => {
            console.log('Close sheath modal');
            setSheathOpen(false);
            setSheathAnchor(null);
          }}
        values={devices[sheathIdx]?.sheath || {}}
        onSave={(val) => updateDevice(sheathIdx, 'sheath', val)}
        />
        <CatheterModal
          isOpen={catOpen}
          anchor={catAnchor}
          onRequestClose={() => {
            console.log('Close catheter modal');
            setCatOpen(false);
            setCatAnchor(null);
          }}
        values={devices[catIdx]?.catheter || {}}
          onSave={(val) => updateDevice(catIdx, 'catheter', val)}
        />
      </div>
    </div>
  );
}

AccessRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function NavRow({ index, values, onChange, onAdd, onRemove }) {
  const [wireOpen, setWireOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [wireAnchor, setWireAnchor] = useState(null);
  const [catAnchor, setCatAnchor] = useState(null);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
  const wireLabel = summarize(data.wire) || __('Wire', 'endoplanner');
  const catheterLabel = summarize(data.catheter) || __('Catheter', 'endoplanner');
  const devLabel = data.device || __('Special device', 'endoplanner');
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
      <RowControls onAdd={onAdd} onRemove={onRemove} />
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

NavRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function TherapyRow({ index, values, onChange, onAdd, onRemove }) {
  const [ballOpen, setBallOpen] = useState(false);
  const [stentOpen, setStentOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [ballAnchor, setBallAnchor] = useState(null);
  const [stentAnchor, setStentAnchor] = useState(null);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
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
      <RowControls onAdd={onAdd} onRemove={onRemove} />
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

TherapyRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function ClosureRow({ index, values, onChange, onAdd, onRemove }) {
  const [devOpen, setDevOpen] = useState(false);
  const [devAnchor, setDevAnchor] = useState(null);
  const data = values || {};
  const method = data.method || 'Manual pressure';
  const devLabel3 = data.device || __('Select device', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-number">{index + 1}</div>
      <div className="row-inner">
        <div className="selector-row">
          <RadioControl
            label={__('Method', 'endoplanner')}
            selected={method}
          options={[{ label: 'Manual pressure', value: 'Manual pressure' }, { label: 'Closure device', value: 'Closure device' }]}
          onChange={(val) => { console.log('Closure method', val); onChange({ ...data, method: val }); }}
        />
        </div>
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
        <RowControls onAdd={onAdd} onRemove={onRemove} />
        <DeviceModal
          isOpen={devOpen}
          anchor={devAnchor}
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

ClosureRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

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
          <AccessRow key={row.id} index={i} values={row}
            onChange={val => setAccessRows(prev => prev.map(r => r.id === row.id ? val : r))}
            onAdd={() => setAccessRows(prev => [...prev, { id: uid() }])}
            onRemove={() => setAccessRows(prev => prev.filter(r => r.id !== row.id))}
          />
        ))}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Navigation & Crossing', 'endoplanner')}</div>
        {navRows.map((row, i) => (
          <NavRow key={row.id} index={i} values={row}
            onChange={val => setNavRows(prev => prev.map(r => r.id === row.id ? val : r))}
            onAdd={() => setNavRows(prev => [...prev, { id: uid() }])}
            onRemove={() => setNavRows(prev => prev.filter(r => r.id !== row.id))}
          />
        ))}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Vessel preparation & therapy', 'endoplanner')}</div>
        {therapyRows.map((row, i) => (
          <TherapyRow key={row.id} index={i} values={row}
            onChange={val => setTherapyRows(prev => prev.map(r => r.id === row.id ? val : r))}
            onAdd={() => setTherapyRows(prev => [...prev, { id: uid() }])}
            onRemove={() => setTherapyRows(prev => prev.filter(r => r.id !== row.id))}
          />
        ))}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Closure', 'endoplanner')}</div>
        {closureRows.map((row, i) => (
          <ClosureRow key={row.id} index={i} values={row}
            onChange={val => setClosureRows(prev => prev.map(r => r.id === row.id ? val : r))}
            onAdd={() => setClosureRows(prev => [...prev, { id: uid() }])}
            onRemove={() => setClosureRows(prev => prev.filter(r => r.id !== row.id))}
          />
        ))}
      </section>
    </div>
  );
}

Step4.propTypes = { data: PropTypes.object.isRequired, setData: PropTypes.func.isRequired };
