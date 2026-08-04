import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';
import SegmentedControl from '../UI/SegmentedControl';
import InlineDeviceSelect from '../UI/InlineDeviceSelect';
import InlineModal from '../UI/InlineModal';
import DeviceGlyph from '../UI/DeviceGlyph';
import VisualPlanWorkspace from '../VisualPlanWorkspace';
import { __ } from '@wordpress/i18n';
import DEFAULTS from '../Defaults';
import {
  CTO_PROFILES,
  getWireByLabel,
  getWireLengthOptions,
  getWireProductOptions,
  normalizeWireRole,
  WIRE_ROLES,
  WIRE_ROLE_INFO,
} from '../../data/wireCatalog';
import { getLesionOptions } from '../../utils/lesions';
import {
  buildScopeOptions,
  createLesionScope,
  createTargetPathScope,
  getPlanScope,
  hasPlanItemContent,
  migratePlanRowScopes,
  scopeFromValue,
  scopeKey,
  scopeToValue,
} from '../../utils/planScopes';
import {
  clearPreferenceProfile,
  loadPreferenceProfile,
  savePreferenceProfile,
  snapshotPreferenceProfile,
} from '../../utils/preferenceProfile';
import { analyzePlan } from '../../utils/planAnalysis';
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

const APPLICATION_VERSION = '1.6.169';

const closureDeviceOptions = [
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

const specialDeviceOptions = [
  'Re-entry device',
  'IVUS catheter',
  'Vascular plug',
  'Embolization coils',
  'Closure device',
  'Shockwave',
  'Scoring balloon',
  'Atherectomy device',
  'Thrombectomy device',
  'Custom',
];

const preferenceTypes = [
  { key: 'needle', legacyId: 'needleimg', label: __('Needle', 'endoplanner'), img: needleImg, modal: 'needle' },
  { key: 'sheath', legacyId: 'sheathimg', label: __('Sheath', 'endoplanner'), img: sheathImg, modal: 'sheath' },
  { key: 'catheter', legacyId: 'catheterimg', label: __('Catheter', 'endoplanner'), img: catheterImg, modal: 'catheter' },
  { key: 'wire', legacyId: 'wireimg', label: __('Wire', 'endoplanner'), img: wireImg, modal: 'wire', allowsMultiple: true },
  { key: 'balloon', legacyId: 'balloonimg', label: __('Balloon', 'endoplanner'), img: balloonImg, modal: 'balloon' },
  { key: 'stent', legacyId: 'stentimg', label: __('Stent', 'endoplanner'), img: stentImg, modal: 'stent' },
  { key: 'specialDevice', legacyId: 'specialdeviceimg', label: __('Special device', 'endoplanner'), img: deviceImg, modal: 'special' },
  { key: 'closureDevice', legacyId: 'closuredeviceimg', label: __('Closure device', 'endoplanner'), img: closureImg, modal: 'closure' },
];

const debugLog = (...args) => {
  if (typeof window !== 'undefined' && window.PLANNER_DEBUG) {
    console.debug('[Planner Debug]', ...args);
  }
};

// Simple utility to generate unique ids for dynamic rows
const uid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

const createEmptyPreferences = () =>
  preferenceTypes.reduce((acc, device) => {
    acc[device.key] = [{ id: uid(), value: null }];
    return acc;
  }, {});

const hasPreferenceValue = (value) => {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasPreferenceValue);
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key !== 'id')
      .some(([, nestedValue]) => hasPreferenceValue(nestedValue));
  }
  return Boolean(value);
};

// Simple wrapper using shared InlineModal (portal-based)
const SimpleModal = ({ title, isOpen, onRequestClose, children }) => (
  <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
    {children}
  </InlineModal>
);

SimpleModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Generic card-like button used for selecting a device.
function DeviceButton({ label, subtitle, img, glyphType, onClick, className, isSelected }) {
  return (
    <button
      type="button"
      className={`device-button${className ? ` ${className}` : ''}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {glyphType ? <DeviceGlyph type={glyphType} /> : <img src={img} alt="" />}
      <span className="device-button-label">{label}</span>
      {subtitle ? <span className="device-button-subtitle">{subtitle}</span> : null}
    </button>
  );
}

DeviceButton.propTypes = {
  label: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  img: PropTypes.string,
  glyphType: PropTypes.oneOf(['wire', 'catheter', 'balloon', 'stent', 'special']),
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  isSelected: PropTypes.bool,
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

const getDisplayLabel = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  return obj.label || obj.name || obj.title || obj.displayLabel || '';
};

const joinPreferenceParts = (parts) =>
  parts
    .map((part) => (typeof part === 'string' ? part.trim() : part))
    .filter((part) => part && String(part).trim().length > 0)
    .join(' • ');

const formatWireLabel = (value) => {
  const size = value.platform || '';
  const length = value.length || '';
  const role = normalizeWireRole(value.role || value.type);
  const product = value.product && value.product !== 'none' ? value.product : '';
  const modifierParts = [value.ctoProfile, value.technique].filter(Boolean);
  const productParts = [];
  if (role) productParts.push(role);
  if (product && product !== role) productParts.push(product);
  return joinPreferenceParts([size, length, ...productParts, ...modifierParts]);
};

const formatBalloonLabel = (value) => {
  const size = value.platform || '';
  const diameter = value.diameter ? `${value.diameter}mm` : '';
  const length = value.length ? `${value.length}mm` : '';
  const shaft = value.shaft || '';
  return joinPreferenceParts([size, diameter, length, shaft]);
};

const formatStentLabel = (value) => {
  const size = value.platform || '';
  const diameter = value.diameter ? `${value.diameter}mm` : '';
  const length = value.length ? `${value.length}mm` : '';
  const type = value.type || '';
  const material = value.material || '';
  const shaft = value.shaft || '';
  return joinPreferenceParts([size, diameter, length, type, material, shaft]);
};

const getPreferenceLabel = (type, value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const displayLabel = getDisplayLabel(value);
  if (displayLabel) return displayLabel;
  switch (type) {
    case 'needle':
      return joinPreferenceParts([value.size, value.length]);
    case 'sheath':
      return joinPreferenceParts([value.frSize, value.length]);
    case 'catheter':
      return joinPreferenceParts([value.specific, value.frSize, value.length]);
    case 'wire':
      return formatWireLabel(value);
    case 'balloon':
      return formatBalloonLabel(value);
    case 'stent':
      return formatStentLabel(value);
    default:
      return summarize(value);
  }
};

// Deserialize a saved profile payload into preference slots for the UI.
const normalizePreferences = (payload) => {
  const normalized = createEmptyPreferences();
  if (!payload || typeof payload !== 'object') return normalized;

  preferenceTypes.forEach((device) => {
    const slots = payload[device.key];
    if (!Array.isArray(slots) || slots.length === 0) return;
    normalized[device.key] = slots.map((slot) => {
      const value = slot.value ?? slot.data ?? slot;
      const migratedValue = device.key === 'wire' && value && typeof value === 'object'
        ? { ...value, role: normalizeWireRole(value.role || value.type) }
        : value;
      return { id: slot.id || uid(), value: migratedValue };
    });
  });

  return normalized;
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

function WireModal({ isOpen, anchor, onRequestClose, values, onSave, preferredProducts = [] }) {
  const [platform, setPlatform] = useState(values.platform || '');
  const [length, setLength] = useState(values.length || '');
  const [role, setRole] = useState(normalizeWireRole(values.role || values.type));
  const [ctoProfile, setCtoProfile] = useState(values.ctoProfile || '');
  const [technique, setTechnique] = useState(values.technique || '');
  const [product, setProduct] = useState(values.product || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setLength(values.length || '');
    setRole(normalizeWireRole(values.role || values.type));
    setCtoProfile(values.ctoProfile || '');
    setTechnique(values.technique || '');
    setProduct(values.product || '');
  }, [values]);
  const lengthOptions = getWireLengthOptions(platform, role, ctoProfile);
  const productOptions = getWireProductOptions(
    { platform, length, role, technique, ctoProfile },
    preferredProducts,
  );
  const selectedProduct = getWireByLabel(product, platform);
  const handleChange = (field, val) => {
    const newVals = {
      platform,
      length,
      role,
      ctoProfile,
      technique,
      product,
      [field]: val,
    };
    if (field === 'role' && val !== WIRE_ROLES.CTO) newVals.ctoProfile = '';
    if (field === 'platform' || field === 'role' || field === 'ctoProfile') {
      const validLengths = getWireLengthOptions(newVals.platform, newVals.role, newVals.ctoProfile);
      if (!validLengths.includes(newVals.length)) newVals.length = '';
    }
    if (['platform', 'length', 'role', 'technique', 'ctoProfile'].includes(field)) {
      const validProducts = getWireProductOptions(
        {
          platform: newVals.platform,
          length: newVals.length,
          role: newVals.role,
          technique: newVals.technique,
          ctoProfile: newVals.ctoProfile,
        },
        preferredProducts,
      );
      if (!validProducts.some((option) => option.value === newVals.product)) {
        newVals.product = '';
      }
    }
    switch(field){
      case 'platform': setPlatform(val); setLength(newVals.length); setProduct(newVals.product); break;
      case 'length': setLength(val); setProduct(newVals.product); break;
      case 'role': setRole(val); setCtoProfile(newVals.ctoProfile); setLength(newVals.length); setProduct(newVals.product); break;
      case 'ctoProfile': setCtoProfile(val); setLength(newVals.length); setProduct(newVals.product); break;
      case 'technique': setTechnique(val); setProduct(newVals.product); break;
      case 'product': setProduct(val); break;
      default: break;
    }
    onSave(newVals);
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
        options={[
          { label: __('Choose length', 'endoplanner'), value: '', disabled: true },
          ...lengthOptions.map(v => ({ label:v, value:v })),
        ]} onChange={(val)=>handleChange('length', val)}
      />
      <div className="wire-role-heading">{__('Functional role', 'endoplanner')}</div>
      <SegmentedControl
        options={[
          { label: __('Workhorse', 'endoplanner'), value: WIRE_ROLES.WORKHORSE },
          { label: __('Jacketed / hydrophilic', 'endoplanner'), value: WIRE_ROLES.JACKETED },
          { label: __('CTO crossing', 'endoplanner'), value: WIRE_ROLES.CTO },
          { label: __('Support / exchange', 'endoplanner'), value: WIRE_ROLES.SUPPORT },
        ]}
        value={role}
        onChange={(val)=>handleChange('role', val)}
        ariaLabel={__('Wire functional role', 'endoplanner')}
      />
      {role && (
        <div className="wire-role-explainer" data-testid="wire-role-explainer">
          <strong>{WIRE_ROLE_INFO[role]?.purpose}</strong>
          <span>{WIRE_ROLE_INFO[role]?.design}</span>
          <span className="wire-role-caution">{WIRE_ROLE_INFO[role]?.caution}</span>
        </div>
      )}
      {role === WIRE_ROLES.CTO && (
        <SelectControl
          label={__('CTO crossing behavior', 'endoplanner')}
          value={ctoProfile}
          options={[
            { label: __('All CTO crossing wires', 'endoplanner'), value: '' },
            ...Object.values(CTO_PROFILES).map((value) => ({ label: value, value })),
          ]}
          onChange={(val) => handleChange('ctoProfile', val)}
        />
      )}
      <div className="wire-role-heading">{__('Intended tracking technique', 'endoplanner')}</div>
      <SegmentedControl
          options={[
            {label:'Intraluminal tracking',value:'Intraluminal tracking'},
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
          ...productOptions,
        ]}
        onChange={(val)=>handleChange('product', val)}
        disabled={!platform || !length || !role || !technique}
      />
      {selectedProduct && (
        <div className="wire-product-profile">
          <div><b>{__('Role', 'endoplanner')}:</b> {selectedProduct.role}{selectedProduct.ctoProfile ? ` — ${selectedProduct.ctoProfile}` : ''}</div>
          <div><b>{__('Use', 'endoplanner')}:</b> {selectedProduct.purpose}</div>
          <div><b>{__('Caution', 'endoplanner')}:</b> {selectedProduct.caution}</div>
        </div>
      )}
      {platform && length && role && technique && !productOptions.length && (
        <p className="wire-catalog-empty">
          {__('No catalogued wire matches all selected filters. Change platform, length, role or CTO behavior.', 'endoplanner')}
        </p>
      )}
      <p className="wire-catalog-note">
        {__('Preferred local wires are marked with a star and listed first.', 'endoplanner')}
      </p>
      <div className="popup-close-row">
        <button type="button" className="planner-nav-btn wire-done-btn" onClick={onRequestClose}>
          {__('Done', 'endoplanner')}
        </button>
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
  preferredProducts: PropTypes.arrayOf(PropTypes.string),
};

function BalloonModal({ isOpen, anchor, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '');
  const [diameter, setDiameter] = useState(values.diameter || '');
  const [len, setLen] = useState(values.length || '');
  const [shaft, setShaft] = useState(values.shaft || '');
  const [deliveryMode, setDeliveryMode] = useState(values.deliveryMode || '');
  const [minimumSheathFr, setMinimumSheathFr] = useState(values.minimumSheathFr || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setDiameter(values.diameter || '');
    setLen(values.length || '');
    setShaft(values.shaft || '');
    setDeliveryMode(values.deliveryMode || '');
    setMinimumSheathFr(values.minimumSheathFr || '');
  }, [values]);
  const diameters = { '0.014':['1.5','2','2.5','3.5','4'], '0.018':['2','2.5','3','4','5','5.5','6','7'], '0.035':['3','4','5','6','7','8','9','10','12','14'] };
  const lengths = ['10','12','15','18','20','30','40','50','60','70','80','90','100','110','120'];
  const handleChange = (field, val) => {
    const newVals = {
      platform,
      diameter,
      length: len,
      shaft,
      deliveryMode,
      minimumSheathFr,
      [field]: val,
    };
    if (field === 'platform') {
      setPlatform(val);
      newVals.diameter = '';
      setDiameter('');
    }
    if (field === 'diameter') setDiameter(val);
    if (field === 'length') setLen(val);
    if (field === 'shaft') setShaft(val);
    if (field === 'deliveryMode') setDeliveryMode(val);
    if (field === 'minimumSheathFr') setMinimumSheathFr(val);
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
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
      <SelectControl
        label={__('Shaft length', 'endoplanner')}
        value={shaft}
        className="selector--sm"
        options={[
          { label: __('Choose shaft length', 'endoplanner'), value: '', disabled: true },
          { label: '80 cm', value: '80 cm' },
          { label: '135 cm', value: '135 cm' },
        ]}
        onChange={(val) => handleChange('shaft', val)}
      />
      <SegmentedControl
        options={[
          { label: __('Rapid-exchange', 'endoplanner'), value: 'Rapid-exchange' },
          { label: __('Over-the-wire', 'endoplanner'), value: 'Over-the-wire' },
        ]}
        value={deliveryMode}
        onChange={(val) => handleChange('deliveryMode', val)}
        ariaLabel={__('Delivery mode', 'endoplanner')}
      />
      <SelectControl
        label={__('Minimum sheath from product IFU', 'endoplanner')}
        value={minimumSheathFr}
        options={[
          { label: __('Choose sheath profile', 'endoplanner'), value: '' },
          ...['4 Fr', '5 Fr', '6 Fr', '7 Fr', '8 Fr', '9 Fr'].map((value) => ({ label: value, value })),
        ]}
        onChange={(val) => handleChange('minimumSheathFr', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="planner-nav-btn wire-done-btn" onClick={onRequestClose}>{__('Done', 'endoplanner')}</button>
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
  const [shaft, setShaft] = useState(values.shaft || '');
  const [deliveryMode, setDeliveryMode] = useState(values.deliveryMode || '');
  const [minimumSheathFr, setMinimumSheathFr] = useState(values.minimumSheathFr || '');
  useEffect(() => {
    setPlatform(values.platform || '');
    setType(values.type || '');
    setMat(values.material || '');
    setDia(values.diameter || '');
    setLen(values.length || '');
    setShaft(values.shaft || '');
    setDeliveryMode(values.deliveryMode || '');
    setMinimumSheathFr(values.minimumSheathFr || '');
  }, [values]);
  const handleChange = (field, val) => {
    const newVals = {
      platform,
      type,
      material: mat,
      diameter: dia,
      length: len,
      shaft,
      deliveryMode,
      minimumSheathFr,
      [field]: val,
    };
    switch(field){
      case 'platform':
        setPlatform(val);
        newVals.diameter = '';
        newVals.length = '';
        setDia('');
        setLen('');
        break;
      case 'type': setType(val); break;
      case 'material': setMat(val); break;
      case 'diameter': setDia(val); break;
      case 'length': setLen(val); break;
      case 'shaft': setShaft(val); break;
      case 'deliveryMode': setDeliveryMode(val); break;
      case 'minimumSheathFr': setMinimumSheathFr(val); break;
      default: break;
    }
    console.log('[Popup] Updated: ', newVals);
    onSave(newVals);
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
      <SelectControl
        label={__('Shaft length', 'endoplanner')}
        value={shaft}
        className="selector--sm"
        options={[
          { label: __('Choose shaft length', 'endoplanner'), value: '', disabled: true },
          { label: '80 cm', value: '80 cm' },
          { label: '135 cm', value: '135 cm' },
        ]}
        onChange={(val) => handleChange('shaft', val)}
      />
      <SegmentedControl
        options={[
          { label: __('Rapid-exchange', 'endoplanner'), value: 'Rapid-exchange' },
          { label: __('Over-the-wire', 'endoplanner'), value: 'Over-the-wire' },
        ]}
        value={deliveryMode}
        onChange={(val) => handleChange('deliveryMode', val)}
        ariaLabel={__('Delivery mode', 'endoplanner')}
      />
      <SelectControl
        label={__('Minimum sheath from product IFU', 'endoplanner')}
        value={minimumSheathFr}
        options={[
          { label: __('Choose sheath profile', 'endoplanner'), value: '' },
          ...['4 Fr', '5 Fr', '6 Fr', '7 Fr', '8 Fr', '9 Fr'].map((value) => ({ label: value, value })),
        ]}
        onChange={(val) => handleChange('minimumSheathFr', val)}
      />
      <div className="popup-close-row">
        <button type="button" className="planner-nav-btn wire-done-btn" onClick={onRequestClose}>{__('Done', 'endoplanner')}</button>
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
      <div className="row-inner">
        <SegmentedControl
          options={[{ label: 'Antegrade', value: 'Antegrade' }, { label: 'Retrograde', value: 'Retrograde' }]}
          value={data.approach || ''}
          onChange={(val) => { console.log('Access approach', val); onChange({ ...data, approach: val }); }}
          ariaLabel={__('Approach', 'endoplanner')}
        />
        <SegmentedControl
          options={[{ label: 'Left', value: 'Left' }, { label: 'Right', value: 'Right' }]}
          value={data.side || ''}
          onChange={(val) => onChange({ ...data, side: val })}
          ariaLabel="Side"
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

AccessRow.propTypes = {
  index: PropTypes.number.isRequired,
  values: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  showRemove: PropTypes.bool,
};

function ScopeChip({ value, options, onChange }) {
  const [editing, setEditing] = useState(false);
  const currentValue = scopeToValue(value || {});
  const currentOption = options.find((option) => option.value === currentValue);
  const shortLabel = currentOption?.shortLabel || __('UNASSIGNED', 'endoplanner');
  return (
    <div className="plan-scope-control" data-testid="plan-scope-control">
      <span className={`plan-scope-chip${!currentOption ? ' is-unassigned' : ''}`}>
        {shortLabel}
      </span>
      {(options.length > 1 || !currentOption) && options.length > 0 && (
        <button
          type="button"
          className="plan-scope-move"
          onClick={() => setEditing((open) => !open)}
          aria-expanded={editing}
        >
          {__('Move', 'endoplanner')}
        </button>
      )}
      {editing && (
        <label className="plan-scope-picker">
          <span>{__('Device scope', 'endoplanner')}</span>
          <select
            value={currentOption ? currentValue : ''}
            onChange={(event) => {
              const nextScope = scopeFromValue(event.target.value);
              if (nextScope) onChange(nextScope);
              setEditing(false);
            }}
            aria-label={__('Move device to scope', 'endoplanner')}
          >
            <option value="" disabled>{__('Choose scope', 'endoplanner')}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

ScopeChip.propTypes = {
  value: PropTypes.object,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
};

function NavRow({ index, values, onChange, onAdd, onRemove, showRemove, preferredWireProducts, scopeOptions }) {
  const [wireOpen, setWireOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [wireAnchor, setWireAnchor] = useState(null);
  const [catAnchor, setCatAnchor] = useState(null);
  const data = values || {};
  const wireLabel = shortLabel('wire', data.wire) || __('Wire', 'endoplanner');
  const catheterLabel = shortLabel('catheter', data.catheter) || __('Catheter', 'endoplanner');
  const devLabel = data.device || __('Choose', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-inner">
        <ScopeChip
          value={getPlanScope(data)}
          options={scopeOptions}
          onChange={(scope) => onChange({ ...data, scope })}
        />
        <div className="device-row">
        <DeviceButton
          label={wireLabel}
          glyphType="wire"
          onClick={(e) => {
            console.log('Open wire modal', index);
            setWireAnchor(e.currentTarget.getBoundingClientRect());
            setWireOpen(true);
          }}
        />
        <DeviceButton
          label={catheterLabel}
          glyphType="catheter"
          onClick={(e) => {
            console.log('Open catheter modal', index);
            setCatAnchor(e.currentTarget.getBoundingClientRect());
            setCatOpen(true);
          }}
        />
        <InlineDeviceSelect
          image={deviceImg}
          options={specialDeviceOptions}
          value={data.device}
          onChange={(val) => onChange({ ...data, device: val })}
          buttonLabel={__('Special', 'endoplanner')}
        />
      </div>
      <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} showAdd={false} />
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
        preferredProducts={preferredWireProducts}
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
      </div>
    </div>
  );
}

NavRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool, preferredWireProducts: PropTypes.arrayOf(PropTypes.string), scopeOptions: PropTypes.arrayOf(PropTypes.object).isRequired };

function TherapyRow({ index, values, onChange, onAdd, onRemove, showRemove, scopeOptions }) {
  const [ballOpen, setBallOpen] = useState(false);
  const [stentOpen, setStentOpen] = useState(false);
  const [ballAnchor, setBallAnchor] = useState(null);
  const [stentAnchor, setStentAnchor] = useState(null);
  const data = values || {};
  const balloonLabel = shortLabel('balloon', data.balloon) || __('Balloon', 'endoplanner');
  const stentLabel = shortLabel('stent', data.stent) || __('Stent', 'endoplanner');
  const devLabel = data.device || __('Choose', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-inner">
        <ScopeChip
          value={getPlanScope(data)}
          options={scopeOptions}
          onChange={(scope) => onChange({ ...data, scope })}
        />
        <div className="device-row">
        <DeviceButton
          label={balloonLabel}
          glyphType="balloon"
          onClick={(e) => {
            console.log('Open balloon modal', index);
            setBallAnchor(e.currentTarget.getBoundingClientRect());
            setBallOpen(true);
          }}
        />
        <DeviceButton
          label={stentLabel}
          glyphType="stent"
          onClick={(e) => {
            console.log('Open stent modal', index);
            setStentAnchor(e.currentTarget.getBoundingClientRect());
            setStentOpen(true);
          }}
        />
        <InlineDeviceSelect
          image={deviceImg}
          options={specialDeviceOptions}
          value={data.device}
          onChange={(val) => onChange({ ...data, device: val })}
          buttonLabel={__('Special', 'endoplanner')}
        />
      </div>
      <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} showAdd={false} />
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
      </div>
    </div>
  );
}

TherapyRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool, scopeOptions: PropTypes.arrayOf(PropTypes.object).isRequired };

function ClosureRow({ index, values, onChange, onAdd, onRemove, showRemove }) {
  const data = values || {};
  const method = data.method || '';
  const devLabel3 = data.device || __('Choose', 'endoplanner');
  return (
    <div className="intervention-row">
      <div className="row-inner">
        <SegmentedControl
          options={[{ label: 'Manual pressure', value: 'Manual pressure' }, { label: 'Closure device', value: 'Closure device' }]}
          value={method}
          onChange={(val) => { console.log('Closure method', val); onChange({ ...data, method: val }); }}
          ariaLabel={__('Method', 'endoplanner')}
        />
        <div className="device-row">
        {method === 'Closure device' && (
          <InlineDeviceSelect
            image={closureImg}
            options={closureDeviceOptions}
            value={data.device}
            onChange={(val) => onChange({ ...data, device: val })}
            buttonLabel={__('Choose', 'endoplanner')}
            showButton={false}
            alwaysOpen
          />
        )}
        </div>
        <RowControls onAdd={onAdd} onRemove={onRemove} showRemove={showRemove} />
      </div>
    </div>
  );
}

ClosureRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired, showRemove: PropTypes.bool };

// --- Main Step Component --------------------------------------------------
export default function Step4({ data, setData }) {
  const targetPath = data.targetArterialPath || [];
  const lesionOptions = getLesionOptions(data.patencySegments || {}, targetPath);
  const defaultLesionId = lesionOptions.length === 1 ? lesionOptions[0].value : '';
  const initRows = (arr, def) =>
    arr && arr.length
      ? arr.map((r) => ({
        id: r.id || uid(),
        ...r,
      }))
      : [{ id: uid(), ...def }];

  const defaultAccess = {
    needles: [DEFAULTS.access.needle],
    sheaths: [DEFAULTS.access.sheath],
    catheters: [DEFAULTS.access.catheter],
  };
  const defaultNav = { wire: DEFAULTS.navigation.wire };
  const defaultTherapy = { balloon: DEFAULTS.vesselPrep.balloon };
  const defaultClosure = { method: DEFAULTS.closure.method };

  const [accessRows, setAccessRows] = useState(initRows(data.accessRows, defaultAccess));
  const [navRows, setNavRows] = useState(() => migratePlanRowScopes(data.navRows || [], {
    defaultLesionId,
    targetPath,
    rowType: 'navigation',
  }).map((row) => ({ id: row.id || uid(), ...row })));
  const [therapyRows, setTherapyRows] = useState(() => migratePlanRowScopes(data.therapyRows || [], {
    defaultLesionId,
    targetPath,
    rowType: 'therapy',
  }).map((row) => ({ id: row.id || uid(), ...row })));
  const [closureRows, setClosureRows] = useState(initRows(data.closureRows, defaultClosure));
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsData, setPrefsData] = useState(createEmptyPreferences);
  const [savedPreferences, setSavedPreferences] = useState({});
  const [preferenceProfile, setPreferenceProfile] = useState(null);
  const [prefsPicker, setPrefsPicker] = useState(null);

  const preferenceValues = (preferences, key) =>
    (preferences?.[key] || [])
      .map((slot) => slot?.value ?? slot?.data ?? slot)
      .filter(hasPreferenceValue);

  const rowHasContent = (row) => hasPlanItemContent(row);

  const applyPreferencesToCase = (preferences, overwrite = false) => {
    const needles = preferenceValues(preferences, 'needle');
    const sheaths = preferenceValues(preferences, 'sheath');
    const catheters = preferenceValues(preferences, 'catheter');
    const wires = preferenceValues(preferences, 'wire');
    const balloons = preferenceValues(preferences, 'balloon');
    const stents = preferenceValues(preferences, 'stent');
    const specialDevices = preferenceValues(preferences, 'specialDevice');
    const closureDevices = preferenceValues(preferences, 'closureDevice');

    setAccessRows((previous) => {
      if (!overwrite && previous.some(rowHasContent)) return previous;
      const current = previous[0] || { id: uid() };
      return [{
        ...current,
        needles: needles.length ? needles : (current.needles || []),
        sheaths: sheaths.length ? sheaths : (current.sheaths || []),
        catheters: catheters.length ? catheters : (current.catheters || []),
      }];
    });

    setNavRows((previous) => {
      if (!overwrite && previous.some(rowHasContent)) return previous;
      if (!wires.length && !catheters.length && !specialDevices.length) return previous;
      const rows = wires.length ? wires.map((wireValue, index) => {
        const isSupportWire = normalizeWireRole(wireValue.role || wireValue.type) === WIRE_ROLES.SUPPORT;
        const preferredScope = isSupportWire && targetPath.length
          ? createTargetPathScope()
          : (defaultLesionId ? createLesionScope(defaultLesionId) : null);
        return {
          id: previous[index]?.id || uid(),
          ...(preferredScope ? { scope: preferredScope } : {}),
          wire: wireValue,
        };
      }) : [{
        id: previous[0]?.id || uid(),
        ...(targetPath.length
          ? { scope: createTargetPathScope() }
          : (defaultLesionId ? { scope: createLesionScope(defaultLesionId) } : {})),
      }];
      if (catheters[0]) rows[0].catheter = catheters[0];
      const reentryDevice = specialDevices.find((value) => String(value).toLowerCase().includes('re-entry'));
      if (reentryDevice) rows[0].device = reentryDevice;
      return rows;
    });

    setTherapyRows((previous) => {
      if (!overwrite && previous.some(rowHasContent)) return previous;
      if (!balloons.length && !stents.length && !specialDevices.length) return previous;
      const rowCount = Math.max(balloons.length, stents.length, 1);
      return Array.from({ length: rowCount }, (_, index) => ({
        id: previous[index]?.id || uid(),
        ...(defaultLesionId ? { scope: createLesionScope(defaultLesionId) } : {}),
        ...(balloons[index] ? { balloon: balloons[index] } : {}),
        ...(stents[index] ? { stent: stents[index] } : {}),
        ...(index === 0 && specialDevices[0] ? { device: specialDevices[0] } : {}),
      }));
    });

    setClosureRows((previous) => {
      if (!overwrite && previous.some(rowHasContent)) return previous;
      if (!closureDevices.length) return previous;
      return closureDevices.map((device, index) => ({
        id: previous[index]?.id || uid(),
        method: 'Closure device',
        device,
      }));
    });
  };

  useEffect(() => {
    const profile = loadPreferenceProfile(APPLICATION_VERSION);
    if (!profile) return;
    const normalized = normalizePreferences(profile.preferences);
    setPreferenceProfile(profile);
    setPrefsData(normalized);
    setSavedPreferences(normalized);
    applyPreferencesToCase(normalized, false);
    setData((previous) => ({
      ...previous,
      appliedPreferenceProfile: snapshotPreferenceProfile(profile),
    }));
    debugLog('Loaded local preference profile', profile);
  }, []);

  useEffect(() => {
    if (!prefsOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setPrefsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [prefsOpen]);

  const handleSavePreferences = () => {
    const serialized = preferenceTypes.reduce((acc, device) => {
      const slots = prefsData[device.key] || [];
      const cleaned = slots
        // Serialize slot metadata and selection payload into the versioned profile.
        .map((slot) => ({
          id: slot.id,
          label: getPreferenceLabel(device.key, slot.value),
          value: slot.value,
        }))
        .filter((slot) => hasPreferenceValue(slot.value));

      if (cleaned.length) acc[device.key] = cleaned;
      return acc;
    }, {});
    const profile = savePreferenceProfile(serialized, preferenceProfile, APPLICATION_VERSION);
    setPreferenceProfile(profile);
    setSavedPreferences(serialized);
    applyPreferencesToCase(serialized, true);
    setData((previous) => ({
      ...previous,
      appliedPreferenceProfile: snapshotPreferenceProfile(profile),
    }));
    debugLog('Saved local preference profile', profile);
    setPrefsOpen(false);
  };

  const handleResetPreferences = () => {
    clearPreferenceProfile();
    setPrefsData(createEmptyPreferences());
    setSavedPreferences({});
    setPreferenceProfile(null);
    setPrefsPicker(null);
    setData((previous) => ({ ...previous, appliedPreferenceProfile: null }));
    debugLog('Reset preference slots to defaults');
  };

  const updatePreferenceSlot = (typeKey, slotId, value) => {
    if (!slotId) return;
    debugLog('Preference slot updated', { typeKey, slotId, value });
    setPrefsData((prev) => ({
      ...prev,
      [typeKey]: prev[typeKey].map((slot) =>
        slot.id === slotId ? { ...slot, value } : slot,
      ),
    }));
  };

  const addPreferenceSlot = (typeKey) => {
    // Multi-slot behavior for preference devices (e.g., multiple wires).
    debugLog('Added preference slot', { typeKey });
    setPrefsData((prev) => ({
      ...prev,
      [typeKey]: [...(prev[typeKey] || []), { id: uid(), value: null }],
    }));
  };

  const removePreferenceSlot = (typeKey, slotId) => {
    setPrefsData((prev) => {
      const nextSlots = (prev[typeKey] || []).filter((slot) => slot.id !== slotId);
      return {
        ...prev,
        [typeKey]: nextSlots.length ? nextSlots : [{ id: uid(), value: null }],
      };
    });
    debugLog('Removed preference slot', { typeKey, slotId });
  };

  const openPreferencePicker = (typeKey, slotId, event) => {
    // Map preference buttons to the same selector popups used in the main workflow.
    debugLog('Preference slot clicked', { typeKey, slotId });
    setPrefsPicker({
      typeKey,
      slotId,
      anchor: event.currentTarget.getBoundingClientRect(),
    });
  };

  const closePreferencePicker = () => {
    setPrefsPicker(null);
  };

  const activePreferenceSlot = prefsPicker
    ? (prefsData[prefsPicker.typeKey] || []).find((slot) => slot.id === prefsPicker.slotId)
    : null;
  const preferredWireProducts = preferenceValues(savedPreferences, 'wire')
    .map((value) => value.product)
    .filter(Boolean);
  const navigationScopeOptions = buildScopeOptions(lesionOptions, targetPath, {
    includeTargetPath: true,
    includeTreatmentZones: true,
  });
  const therapyScopeOptions = buildScopeOptions(lesionOptions, targetPath, {
    includeTargetPath: false,
    includeTreatmentZones: true,
  });
  const allKnownScopeKeys = new Set([...navigationScopeOptions, ...therapyScopeOptions].map((option) => option.value));
  const zoneOptions = therapyScopeOptions.filter((option) => (
    option.scope.type === 'treatmentZone'
    && [...navRows, ...therapyRows].some((row) => scopeKey(row) === option.value)
  ));
  const unassignedNavRows = navRows.filter((row) => (
    hasPlanItemContent(row) && !allKnownScopeKeys.has(scopeKey(row))
  ));
  const unassignedTherapyRows = therapyRows.filter((row) => (
    hasPlanItemContent(row) && !allKnownScopeKeys.has(scopeKey(row))
  ));

  const addNavigationRow = (scope) => setNavRows((previous) => [
    ...previous,
    { id: uid(), ...defaultNav, scope },
  ]);
  const addTherapyRow = (scope) => setTherapyRows((previous) => [
    ...previous,
    { id: uid(), ...defaultTherapy, scope },
  ]);
  const renderNavigationRows = (rows) => rows.map((row) => (
    <NavRow
      key={row.id}
      index={Math.max(navRows.indexOf(row), 0)}
      values={row}
      onChange={(value) => setNavRows((previous) => previous.map((item) => (item.id === row.id ? value : item)))}
      onAdd={() => {}}
      onRemove={() => setNavRows((previous) => previous.filter((item) => item.id !== row.id))}
      showRemove
      preferredWireProducts={preferredWireProducts}
      scopeOptions={navigationScopeOptions}
    />
  ));
  const renderTherapyRows = (rows) => rows.map((row) => (
    <TherapyRow
      key={row.id}
      index={Math.max(therapyRows.indexOf(row), 0)}
      values={row}
      onChange={(value) => setTherapyRows((previous) => previous.map((item) => (item.id === row.id ? value : item)))}
      onAdd={() => {}}
      onRemove={() => setTherapyRows((previous) => previous.filter((item) => item.id !== row.id))}
      showRemove
      scopeOptions={therapyScopeOptions}
    />
  ));
  const currentPlanData = { ...data, accessRows, navRows, therapyRows, closureRows };
  const planFindings = analyzePlan(currentPlanData);

  useEffect(() => {
    setData((previous) => ({ ...previous, accessRows, navRows, therapyRows, closureRows }));
  }, [accessRows, navRows, therapyRows, closureRows]);

  return (
    <div className="step4-intervention">
      <div className="intervention-preferences">
        <div className="prefs-toggle-row">
          <button
            type="button"
            className="planner-nav-btn prefs-toggle-btn"
            onClick={() => setPrefsOpen((open) => !open)}
            aria-expanded={prefsOpen}
          >
            <span className="prefs-toggle-icon" aria-hidden="true">★</span>
            {__('Set local preferences', 'endoplanner')}
          </button>
        </div>
        {prefsOpen && (
          <div className="prefs-panel" role="dialog" aria-label={__('Local preferences', 'endoplanner')}>
            <button
              type="button"
              className="prefs-close-btn"
              onClick={() => setPrefsOpen(false)}
              aria-label={__('Close', 'endoplanner')}
            >
              &times;
            </button>
            <div className="prefs-panel-title">
              {__('Select preferred devices', 'endoplanner')}
              {preferenceProfile && (
                <span className="prefs-profile-version">
                  {`Profile v${preferenceProfile.schemaVersion} · revision ${preferenceProfile.revision}`}
                </span>
              )}
            </div>
            <div className="prefs-device-grid">
              {preferenceTypes.map((device) =>
                (prefsData[device.key] || []).map((slot) => {
                  const label = getPreferenceLabel(device.key, slot.value);
                  const showAdd = true;
                  return (
                    <div className="prefs-device-slot" key={`${device.key}-${slot.id}`}>
                      <div className="prefs-slot-button-wrapper">
                        {prefsData[device.key].length > 1 && (
                          <button
                            type="button"
                            className="prefs-slot-remove"
                            onClick={(event) => {
                              event.stopPropagation();
                              removePreferenceSlot(device.key, slot.id);
                            }}
                            aria-label={__('Remove preference', 'endoplanner')}
                          >
                            &minus;
                          </button>
                        )}
                        <DeviceButton
                          label={device.label}
                          subtitle=""
                          img={device.img}
                          onClick={(event) => openPreferencePicker(device.key, slot.id, event)}
                          className={`device-button--compact prefs-device-button${label ? ' is-selected' : ''}`}
                          isSelected={Boolean(label)}
                        />
                        {showAdd && (
                          <button
                            type="button"
                            className="prefs-slot-add"
                            onClick={(event) => {
                              event.stopPropagation();
                              addPreferenceSlot(device.key);
                            }}
                            aria-label={__('Add preference', 'endoplanner')}
                          >
                            +
                          </button>
                        )}
                      </div>
                      <div className="prefs-slot-description">
                        {label || __('Choose', 'endoplanner')}
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
            <div className="prefs-actions">
              <button type="button" className="planner-nav-btn prefs-reset-btn" onClick={handleResetPreferences}>
                {__('Reset setup', 'endoplanner')}
              </button>
              <button type="button" className="planner-nav-btn prefs-save-btn" onClick={handleSavePreferences}>
                {__('Save setup', 'endoplanner')}
              </button>
            </div>
          </div>
        )}
      </div>

      <NeedleModal
        isOpen={prefsPicker?.typeKey === 'needle'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('needle', prefsPicker?.slotId, val)}
      />
      <SheathModal
        isOpen={prefsPicker?.typeKey === 'sheath'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('sheath', prefsPicker?.slotId, val)}
      />
      <CatheterModal
        isOpen={prefsPicker?.typeKey === 'catheter'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('catheter', prefsPicker?.slotId, val)}
      />
      <WireModal
        isOpen={prefsPicker?.typeKey === 'wire'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('wire', prefsPicker?.slotId, val)}
        preferredProducts={preferredWireProducts}
      />
      <BalloonModal
        isOpen={prefsPicker?.typeKey === 'balloon'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('balloon', prefsPicker?.slotId, val)}
      />
      <StentModal
        isOpen={prefsPicker?.typeKey === 'stent'}
        anchor={prefsPicker?.anchor}
        onRequestClose={closePreferencePicker}
        values={activePreferenceSlot?.value || {}}
        onSave={(val) => updatePreferenceSlot('stent', prefsPicker?.slotId, val)}
      />
      <SimpleModal
        title={__('Special device', 'endoplanner')}
        isOpen={prefsPicker?.typeKey === 'specialDevice'}
        onRequestClose={closePreferencePicker}
      >
        <InlineDeviceSelect
          options={specialDeviceOptions}
          value={activePreferenceSlot?.value || ''}
          onChange={(val) => updatePreferenceSlot('specialDevice', prefsPicker?.slotId, val)}
          showButton={false}
          alwaysOpen
        />
        <div className="popup-close-row">
          <button type="button" className="circle-btn close-modal-btn" onClick={closePreferencePicker}>
            &times;
          </button>
        </div>
      </SimpleModal>
      <SimpleModal
        title={__('Closure device', 'endoplanner')}
        isOpen={prefsPicker?.typeKey === 'closureDevice'}
        onRequestClose={closePreferencePicker}
      >
        <InlineDeviceSelect
          options={closureDeviceOptions}
          value={activePreferenceSlot?.value || ''}
          onChange={(val) => updatePreferenceSlot('closureDevice', prefsPicker?.slotId, val)}
          showButton={false}
          alwaysOpen
        />
        <div className="popup-close-row">
          <button type="button" className="circle-btn close-modal-btn" onClick={closePreferencePicker}>
            &times;
          </button>
        </div>
      </SimpleModal>

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
          onAdd={() =>
            setAccessRows((prev) => [
              ...prev,
              { id: uid(), ...defaultAccess },
            ])
          }
          onRemove={() => {}}
          showRemove={false}
          label={__('Add another approach', 'endoplanner')}
        />
      </section>

      <section className="intervention-section scoped-plan-section" data-testid="scoped-intervention-plan">
        <div className="section-heading">{__('Visual device plan', 'endoplanner')}</div>
        <p className="scoped-plan-intro">
          {__('Select PATH or a lesion beside the arterial tree, then add the devices for that part of the procedure. Only one planning panel is shown at a time.', 'endoplanner')}
        </p>

        <VisualPlanWorkspace
          targetPath={targetPath}
          lesionOptions={lesionOptions}
          zoneOptions={zoneOptions}
          navRows={navRows}
          therapyRows={therapyRows}
          renderNavigationRows={renderNavigationRows}
          renderTherapyRows={renderTherapyRows}
          addNavigationRow={addNavigationRow}
          addTherapyRow={addTherapyRow}
        />

        {(unassignedNavRows.length > 0 || unassignedTherapyRows.length > 0) && (
          <details className="visual-plan-unassigned" data-testid="plan-scope-group-UNASSIGNED">
            <summary>{__('Assign unlinked preferred or legacy devices', 'endoplanner')}</summary>
            <p>{__('Use Move once to place each item on PATH, a lesion or a combined treatment zone.', 'endoplanner')}</p>
            {renderNavigationRows(unassignedNavRows)}
            {renderTherapyRows(unassignedTherapyRows)}
          </details>
        )}
      </section>

      <section className="intervention-section">
        <div className="section-heading">{__('Closure', 'endoplanner')}</div>
        {closureRows.map((row, i) => (
          <ClosureRow
            key={row.id}
            index={i}
            values={row}
            onChange={(val) => setClosureRows((prev) => prev.map((r) => (r.id === row.id ? val : r)))}
            onAdd={() =>
              setClosureRows((prev) => [
                ...prev,
                { id: uid(), ...defaultClosure },
              ])
            }
            onRemove={() => setClosureRows((prev) => prev.filter((r) => r.id !== row.id))}
            showRemove={closureRows.length > 1}
          />
        ))}
      </section>

      <section className="intervention-section plan-considerations" data-testid="live-plan-considerations">
        <div className="section-heading">{__('Recommendations & Considerations', 'endoplanner')}</div>
        <p className="plan-considerations-intro">
          {__('Resolve incompatibilities before export. Technique considerations are generated from the recorded lesion morphology and access strategy.', 'endoplanner')}
        </p>
        {planFindings.length ? (
          <div className="plan-considerations-list">
            {planFindings.map((item) => (
              <article key={item.id} className={`plan-consideration plan-consideration--${item.level}`}>
                <span>{item.level === 'error' ? __('Incompatible', 'endoplanner') : item.level}</span>
                <h4>{item.title}</h4>
                <p>{item.summary}</p>
                {(item.details.length > 0 || item.references.length > 0) && (
                  <details>
                    <summary>{__('Technique notes and sources', 'endoplanner')}</summary>
                    {item.details.length > 0 && <ol>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ol>}
                    {item.references.length > 0 && (
                      <ul>
                        {item.references.map((reference) => (
                          <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a></li>
                        ))}
                      </ul>
                    )}
                  </details>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="plan-considerations-clear">{__('No incompatibilities or anatomy-triggered considerations identified from the recorded data.', 'endoplanner')}</p>
        )}
      </section>
    </div>
  );
}

Step4.propTypes = { data: PropTypes.object.isRequired, setData: PropTypes.func.isRequired };
