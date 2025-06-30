import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, SelectControl, RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import VesselMap from '../VesselMap';
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

// Simple wrapper for WordPress Modal
const SimpleModal = ({ title, isOpen, onRequestClose, children }) => {
  if (!isOpen) return null;
  return (
    <Modal title={title} onRequestClose={onRequestClose}>
      {children}
    </Modal>
  );
};

SimpleModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Generic card-like button used for selecting a device
function DeviceButton({ label, img, onClick }) {
  return (
    <button type="button" className="device-button" onClick={onClick}>
      <img src={img} alt="" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

DeviceButton.propTypes = {
  label: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

// --- Popup Components -----------------------------------------------------
function VesselModal({ isOpen, onRequestClose, value, onSave }) {
  const [selected, setSelected] = useState(value ? [value] : []);
  useEffect(() => { setSelected(value ? [value] : []); }, [value]);
  return (
    <SimpleModal
      title={__('Select Access Vessel', 'endoplanner')}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <VesselMap selectedSegments={selected} toggleSegment={(id) => setSelected([id])} />
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <Button isPrimary onClick={() => { onSave(selected[0] || null); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

VesselModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  value: PropTypes.string,
  onSave: PropTypes.func.isRequired,
};

function NeedleModal({ isOpen, onRequestClose, values, onSave }) {
  const [size, setSize] = useState(values.size || '19 Gauge');
  const [length, setLength] = useState(values.length || '4cm');
  useEffect(() => { setSize(values.size || '19 Gauge'); setLength(values.length || '4cm'); }, [values]);
  return (
    <SimpleModal title={__('Puncture Needle', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <SelectControl label={__('Needle size', 'endoplanner')} value={size}
        options={['19 Gauge','21 Gauge'].map(v => ({ label:v, value:v }))}
        onChange={setSize}
      />
      <SelectControl label={__('Needle length', 'endoplanner')} value={length}
        options={['4cm','7cm','9cm'].map(v => ({ label:v, value:v }))}
        onChange={setLength}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ size, length }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

NeedleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

function SheathModal({ isOpen, onRequestClose, values, onSave }) {
  const [frSize, setFrSize] = useState(values.frSize || '4 Fr');
  const [length, setLength] = useState(values.length || '10 cm');
  useEffect(() => { setFrSize(values.frSize || '4 Fr'); setLength(values.length || '10 cm'); }, [values]);
  const sizes = ['4 Fr','5 Fr','6 Fr','7 Fr','8 Fr','9 Fr'];
  const lengths = ['10 cm','12 cm','25 cm'];
  return (
    <SimpleModal title={__('Sheath', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <SelectControl label={__('French size', 'endoplanner')} value={frSize}
        options={sizes.map(v => ({ label:v, value:v }))} onChange={setFrSize}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={length}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={setLength}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ frSize, length }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

SheathModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

function CatheterModal({ isOpen, onRequestClose, values, onSave }) {
  const [size, setSize] = useState(values.size || '2.3 Fr');
  const [length, setLength] = useState(values.length || '40 cm');
  const [specific, setSpecific] = useState(values.specific || 'BER2');
  useEffect(() => { setSize(values.size || '2.3 Fr'); setLength(values.length || '40 cm'); setSpecific(values.specific || 'BER2'); }, [values]);
  const sizes = ['2.3 Fr','2.6 Fr','4 Fr','5 Fr','6 Fr','7 Fr'];
  const lengths = ['40 cm','65 cm','80 cm','90 cm','105 cm','110 cm','125 cm','135 cm','150 cm'];
  const specifics = ['BER2','BHW','Cobra 1','Cobra 2','Cobra 3','Cobra Glidecath','CXI 0.018','CXI 0.014','Navicross 0.018','Navicross 0.035','MultiPurpose','PIER','Pigtail Flush','Straight Flush','Universal Flush','Rim','Simmons 1','Simmons 2','Simmons 3','Vertebral'];
  return (
    <SimpleModal title={__('Catheter', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <SelectControl label={__('French size', 'endoplanner')} value={size} options={sizes.map(v => ({ label:v, value:v }))} onChange={setSize} />
      <SelectControl label={__('Length', 'endoplanner')} value={length} options={lengths.map(v => ({ label:v, value:v }))} onChange={setLength} />
      <SelectControl label={__('Specific catheter', 'endoplanner')} value={specific} options={specifics.map(v => ({ label:v, value:v }))} onChange={setSpecific} />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ size, length, specific }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

CatheterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

function WireModal({ isOpen, onRequestClose, values, onSave }) {
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
  return (
    <SimpleModal title={__('Wire', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={setPlatform}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={length}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={setLength}
      />
      <RadioControl label={__('Type', 'endoplanner')} selected={type}
        options={[{label:'Glidewire',value:'Glidewire'},{label:'CTO wire',value:'CTO wire'},{label:'Support wire',value:'Support wire'}]}
        onChange={setType}
      />
      {type === 'CTO wire' && (
        <SelectControl label={__('Body type', 'endoplanner')} value={body}
          options={bodyOpts.map(v => ({ label:v, value:v }))} onChange={setBody}
        />
      )}
      {type === 'Support wire' && (
        <SelectControl label={__('Support wire', 'endoplanner')} value={support}
          options={supportOpts.map(v => ({ label:v, value:v }))} onChange={setSupport}
        />
      )}
      <RadioControl label={__('Technique', 'endoplanner')} selected={technique}
        options={[{label:'Intimal Tracking',value:'Intimal Tracking'},{label:'Limited sub-intimal dissection and re-entry',value:'Limited sub-intimal dissection and re-entry'}]}
        onChange={setTechnique}
      />
      <SelectControl label={__('Product', 'endoplanner')} value={product}
        options={[{ label: __('None', 'endoplanner'), value: '' }]} onChange={setProduct}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ platform, length, type, body, support, technique, product }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

WireModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

function BalloonModal({ isOpen, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '0.014');
  const [diameter, setDiameter] = useState(values.diameter || '1.5');
  const [len, setLen] = useState(values.length || '10');
  useEffect(() => { setPlatform(values.platform || '0.014'); setDiameter(values.diameter || '1.5'); setLen(values.length || '10'); }, [values]);
  const diameters = { '0.014':['1.5','2','2.5','3.5','4'], '0.018':['2','2.5','3','4','5','5.5','6','7'], '0.035':['3','4','5','6','7','8','9','10','12','14'] };
  const lengths = ['10','12','15','18','20','30','40','50','60','70','80','90','100','110','120'];
  return (
    <SimpleModal title={__('PTA Balloon', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={val => { setPlatform(val); setDiameter(diameters[val][0]); }}
      />
      <SelectControl label={__('Diameter', 'endoplanner')} value={diameter}
        options={diameters[platform].map(v => ({ label:v, value:v }))} onChange={setDiameter}
      />
      <SelectControl label={__('Length (mm)', 'endoplanner')} value={len}
        options={lengths.map(v => ({ label:v, value:v }))} onChange={setLen}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ platform, diameter, length: len }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

BalloonModal.propTypes = { isOpen: PropTypes.bool.isRequired, onRequestClose: PropTypes.func.isRequired, values: PropTypes.object, onSave: PropTypes.func.isRequired };

const stentDia = { '0.014':['2','3','4','5'], '0.018':['4','5','6','7'], '0.035':['5','6','7','8','9','10'] };
const stentLen = { '0.014':['20','40','60','80'], '0.018':['40','60','80','100'], '0.035':['40','60','80','100','120'] };

function StentModal({ isOpen, onRequestClose, values, onSave }) {
  const [platform, setPlatform] = useState(values.platform || '0.014');
  const [type, setType] = useState(values.type || 'self expandable');
  const [mat, setMat] = useState(values.material || 'bare metal');
  const [dia, setDia] = useState(values.diameter || stentDia[platform][0]);
  const [len, setLen] = useState(values.length || stentLen[platform][0]);
  useEffect(() => { setPlatform(values.platform || '0.014'); setType(values.type || 'self expandable'); setMat(values.material || 'bare metal'); setDia(values.diameter || stentDia[values.platform || '0.014'][0]); setLen(values.length || stentLen[values.platform || '0.014'][0]); }, [values]);
  return (
    <SimpleModal title={__('Stent', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <RadioControl label={__('Platform', 'endoplanner')} selected={platform}
        options={['0.014','0.018','0.035'].map(v => ({ label:v, value:v }))}
        onChange={val => { setPlatform(val); setDia(stentDia[val][0]); setLen(stentLen[val][0]); }}
      />
      <RadioControl label={__('Stent type', 'endoplanner')} selected={type}
        options={[{label:'self expandable',value:'self expandable'},{label:'balloon expandable',value:'balloon expandable'}]}
        onChange={setType}
      />
      <RadioControl label={__('Stent material', 'endoplanner')} selected={mat}
        options={[{label:'bare metal',value:'bare metal'},{label:'covered',value:'covered'}]}
        onChange={setMat}
      />
      <SelectControl label={__('Diameter', 'endoplanner')} value={dia}
        options={stentDia[platform].map(v => ({ label:v, value:v }))} onChange={setDia}
      />
      <SelectControl label={__('Length', 'endoplanner')} value={len}
        options={stentLen[platform].map(v => ({ label:v, value:v }))} onChange={setLen}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave({ platform, type, material: mat, diameter: dia, length: len }); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

StentModal.propTypes = { isOpen: PropTypes.bool.isRequired, onRequestClose: PropTypes.func.isRequired, values: PropTypes.object, onSave: PropTypes.func.isRequired };

function DeviceModal({ isOpen, onRequestClose, value, onSave }) {
  const [device, setDevice] = useState(value || 'Re-entry device');
  useEffect(() => { setDevice(value || 'Re-entry device'); }, [value]);
  const options = ['Re-entry device','IVUS catheter','Vascular plug','Embolization coils','Closure device','Shockwave','Scoring balloon','Atherectomy device','Thrombectomy device','Miscellaneous'];
  return (
    <SimpleModal title={__('Special device', 'endoplanner')} isOpen={isOpen} onRequestClose={onRequestClose}>
      <SelectControl label={__('Device', 'endoplanner')} value={device}
        options={options.map(v => ({ label:v, value:v }))} onChange={setDevice}
      />
      <div style={{ textAlign:'right', marginTop:'1rem' }}>
        <Button isPrimary onClick={() => { onSave(device); onRequestClose(); }}>
          {__('Save', 'endoplanner')}
        </Button>
      </div>
    </SimpleModal>
  );
}

DeviceModal.propTypes = { isOpen: PropTypes.bool.isRequired, onRequestClose: PropTypes.func.isRequired, value: PropTypes.string, onSave: PropTypes.func.isRequired };

// --- Row components -------------------------------------------------------
const RowControls = ({ onRemove }) => (
  <button type="button" className="circle-btn remove-row-btn" onClick={onRemove}>
    &minus;
  </button>
);
RowControls.propTypes = { onRemove: PropTypes.func.isRequired };

function AccessRow({ index, values, onChange, onRemove }) {
  const [vesselOpen, setVesselOpen] = useState(false);
  const [needleOpen, setNeedleOpen] = useState(false);
  const [sheathOpen, setSheathOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const data = values || {};
  return (
    <div className="intervention-row">
      <div className="row-title">{__('Access', 'endoplanner')} {index + 1}</div>
      <RadioControl label={__('Approach', 'endoplanner')} selected={data.approach || 'Antegrade'}
        options={[{label:'Antegrade',value:'Antegrade'},{label:'Retrograde',value:'Retrograde'}]}
        onChange={val => onChange({ ...data, approach: val })}
      />
      <DeviceButton label={data.vessel || __('Select vessel', 'endoplanner')} img={needleImg} onClick={() => setVesselOpen(true)} />
      <DeviceButton label={__('Puncture needle', 'endoplanner')} img={needleImg} onClick={() => setNeedleOpen(true)} />
      <DeviceButton label={__('Sheath', 'endoplanner')} img={sheathImg} onClick={() => setSheathOpen(true)} />
      <DeviceButton label={__('Catheter', 'endoplanner')} img={catheterImg} onClick={() => setCatOpen(true)} />
      <RowControls onRemove={onRemove} />
      <VesselModal isOpen={vesselOpen} onRequestClose={() => setVesselOpen(false)} value={data.vessel} onSave={val => onChange({ ...data, vessel: val })} />
      <NeedleModal isOpen={needleOpen} onRequestClose={() => setNeedleOpen(false)} values={data.needle || {}} onSave={val => onChange({ ...data, needle: val })} />
      <SheathModal isOpen={sheathOpen} onRequestClose={() => setSheathOpen(false)} values={data.sheath || {}} onSave={val => onChange({ ...data, sheath: val })} />
      <CatheterModal isOpen={catOpen} onRequestClose={() => setCatOpen(false)} values={data.catheter || {}} onSave={val => onChange({ ...data, catheter: val })} />
    </div>
  );
}

AccessRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function NavRow({ index, values, onChange, onRemove }) {
  const [wireOpen, setWireOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const data = values || {};
  return (
    <div className="intervention-row">
      <div className="row-title">{__('Navigation & Crossing', 'endoplanner')} {index + 1}</div>
      <DeviceButton label={__('Wire', 'endoplanner')} img={wireImg} onClick={() => setWireOpen(true)} />
      <DeviceButton label={__('Catheter', 'endoplanner')} img={catheterImg} onClick={() => setCatOpen(true)} />
      <DeviceButton label={__('Special device', 'endoplanner')} img={deviceImg} onClick={() => setDevOpen(true)} />
      <RowControls onRemove={onRemove} />
      <WireModal isOpen={wireOpen} onRequestClose={() => setWireOpen(false)} values={data.wire || {}} onSave={val => onChange({ ...data, wire: val })} />
      <CatheterModal isOpen={catOpen} onRequestClose={() => setCatOpen(false)} values={data.catheter || {}} onSave={val => onChange({ ...data, catheter: val })} />
      <DeviceModal isOpen={devOpen} onRequestClose={() => setDevOpen(false)} value={data.device} onSave={val => onChange({ ...data, device: val })} />
    </div>
  );
}

NavRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function TherapyRow({ index, values, onChange, onRemove }) {
  const [ballOpen, setBallOpen] = useState(false);
  const [stentOpen, setStentOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const data = values || {};
  return (
    <div className="intervention-row">
      <div className="row-title">{__('Vessel preparation & therapy', 'endoplanner')} {index + 1}</div>
      <DeviceButton label={__('PTA balloon', 'endoplanner')} img={balloonImg} onClick={() => setBallOpen(true)} />
      <DeviceButton label={__('Stent', 'endoplanner')} img={stentImg} onClick={() => setStentOpen(true)} />
      <DeviceButton label={__('Special device', 'endoplanner')} img={deviceImg} onClick={() => setDevOpen(true)} />
      <RowControls onRemove={onRemove} />
      <BalloonModal isOpen={ballOpen} onRequestClose={() => setBallOpen(false)} values={data.balloon || {}} onSave={val => onChange({ ...data, balloon: val })} />
      <StentModal isOpen={stentOpen} onRequestClose={() => setStentOpen(false)} values={data.stent || {}} onSave={val => onChange({ ...data, stent: val })} />
      <DeviceModal isOpen={devOpen} onRequestClose={() => setDevOpen(false)} value={data.device} onSave={val => onChange({ ...data, device: val })} />
    </div>
  );
}

TherapyRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

function ClosureRow({ index, values, onChange, onRemove }) {
  const [devOpen, setDevOpen] = useState(false);
  const data = values || {};
  const method = data.method || 'Manual pressure';
  return (
    <div className="intervention-row">
      <div className="row-title">{__('Closure', 'endoplanner')} {index + 1}</div>
      <RadioControl label={__('Method', 'endoplanner')} selected={method}
        options={[{label:'Manual pressure',value:'Manual pressure'},{label:'Closure device',value:'Closure device'}]}
        onChange={val => onChange({ ...data, method: val })}
      />
      {method === 'Closure device' && (
        <DeviceButton label={__('Select device', 'endoplanner')} img={closureImg} onClick={() => setDevOpen(true)} />
      )}
      <RowControls onRemove={onRemove} />
      <DeviceModal isOpen={devOpen} onRequestClose={() => setDevOpen(false)} value={data.device} onSave={val => onChange({ ...data, device: val })} />
    </div>
  );
}

ClosureRow.propTypes = { index: PropTypes.number.isRequired, values: PropTypes.object, onChange: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };

// --- Main Step Component --------------------------------------------------
export default function Step4({ data, setData }) {
  const [accessRows, setAccessRows] = useState(data.accessRows || [{}]);
  const [navRows, setNavRows] = useState(data.navRows || [{}]);
  const [therapyRows, setTherapyRows] = useState(data.therapyRows || [{}]);
  const [closureRows, setClosureRows] = useState(data.closureRows || [{}]);

  useEffect(() => {
    setData({ ...data, accessRows, navRows, therapyRows, closureRows });
  }, [accessRows, navRows, therapyRows, closureRows]);

  return (
    <div className="step4-intervention">

      <section className="intervention-section">
        {accessRows.map((row, i) => (
          <AccessRow key={i} index={i} values={row}
            onChange={val => setAccessRows(prev => prev.map((r, idx) => idx === i ? val : r))}
            onRemove={() => setAccessRows(prev => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        <button type="button" className="circle-btn add-row-btn" onClick={() => setAccessRows(prev => [...prev, {}])}>+</button>
      </section>

      <section className="intervention-section">
        {navRows.map((row, i) => (
          <NavRow key={i} index={i} values={row}
            onChange={val => setNavRows(prev => prev.map((r, idx) => idx === i ? val : r))}
            onRemove={() => setNavRows(prev => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        <button type="button" className="circle-btn add-row-btn" onClick={() => setNavRows(prev => [...prev, {}])}>+</button>
      </section>

      <section className="intervention-section">
        {therapyRows.map((row, i) => (
          <TherapyRow key={i} index={i} values={row}
            onChange={val => setTherapyRows(prev => prev.map((r, idx) => idx === i ? val : r))}
            onRemove={() => setTherapyRows(prev => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        <button type="button" className="circle-btn add-row-btn" onClick={() => setTherapyRows(prev => [...prev, {}])}>+</button>
      </section>

      <section className="intervention-section">
        {closureRows.map((row, i) => (
          <ClosureRow key={i} index={i} values={row}
            onChange={val => setClosureRows(prev => prev.map((r, idx) => idx === i ? val : r))}
            onRemove={() => setClosureRows(prev => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        <button type="button" className="circle-btn add-row-btn" onClick={() => setClosureRows(prev => [...prev, {}])}>+</button>
      </section>
    </div>
  );
}

Step4.propTypes = { data: PropTypes.object.isRequired, setData: PropTypes.func.isRequired };
