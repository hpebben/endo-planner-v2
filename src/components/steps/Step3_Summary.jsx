import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import ReferenceLink from '../UI/ReferenceLink';
import ReferenceModal from '../UI/ReferenceModal';
import { getReference } from '../../utils/references';
import { vesselSegments } from './Step2_Patency';
import SegmentedControl from '../UI/SegmentedControl';
import InlineDeviceSelect from '../UI/InlineDeviceSelect';
import InlineModal from '../UI/InlineModal';
import {
  NeedleModal,
  SheathModal,
  CatheterModal,
  WireModal,
  BalloonModal,
  StentModal,
} from '../DeviceModals';

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

function AccessModal({ isOpen, values, onSave, onRequestClose }) {
  const [approach, setApproach] = useState(values.approach || '');
  const [side, setSide] = useState(values.side || '');
  const [vessel, setVessel] = useState(values.vessel || '');
  const [vesselOpen, setVesselOpen] = useState(false);

  return (
    <InlineModal
      title={__('Edit access', 'endoplanner')}
      isOpen={isOpen}
      onRequestClose={() => {
        onSave({ approach, side, vessel });
        onRequestClose();
      }}
    >
      <SegmentedControl
        options={[
          { label: 'Antegrade', value: 'Antegrade' },
          { label: 'Retrograde', value: 'Retrograde' },
        ]}
        value={approach}
        onChange={setApproach}
        ariaLabel={__('Approach', 'endoplanner')}
      />
      <SegmentedControl
        options={[
          { label: 'Left', value: 'Left' },
          { label: 'Right', value: 'Right' },
        ]}
        value={side}
        onChange={setSide}
        ariaLabel={__('Side', 'endoplanner')}
      />
      <button
        type="button"
        className="device-button"
        onClick={() => setVesselOpen(true)}
      >
        {vessel || __('Vessel', 'endoplanner')}
      </button>
      {vesselOpen && (
        <InlineModal
          title={__('Select Vessel', 'endoplanner')}
          isOpen={vesselOpen}
          onRequestClose={() => setVesselOpen(false)}
        >
          <ul className="vessel-dropdown">
            <li>
              <button type="button" className="dropdown-item" disabled>
                {__('Choose vessel', 'endoplanner')}
              </button>
            </li>
            {['CFA', 'SFA', 'ATA', 'TTP', 'ATP', 'ADP'].map((v) => (
              <li key={v}>
                <button
                  type="button"
                  className={`dropdown-item${vessel === v ? ' selected' : ''}`}
                  onClick={() => {
                    setVessel(v);
                    setVesselOpen(false);
                  }}
                >
                  {v}
                </button>
              </li>
            ))}
          </ul>
          <div className="popup-close-row">
            <button
              type="button"
              className="circle-btn close-modal-btn"
              onClick={() => setVesselOpen(false)}
            >
              &times;
            </button>
          </div>
        </InlineModal>
      )}
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => {
          onSave({ approach, side, vessel });
          onRequestClose();
        }}>
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

function ClosureModal({ isOpen, values, onSave, onRequestClose }) {
  const [method, setMethod] = useState(values.method || '');
  const [device, setDevice] = useState(values.device || '');

  return (
    <InlineModal
      title={__('Edit closure', 'endoplanner')}
      isOpen={isOpen}
      onRequestClose={() => {
        onSave({ method, device });
        onRequestClose();
      }}
    >
      <SegmentedControl
        options={[
          { label: 'Manual pressure', value: 'Manual pressure' },
          { label: 'Closure device', value: 'Closure device' },
        ]}
        value={method}
        onChange={setMethod}
        ariaLabel={__('Method', 'endoplanner')}
      />
      {method === 'Closure device' && (
        <InlineDeviceSelect
          options={closureDeviceOptions}
          value={device}
          onChange={setDevice}
        />
      )}
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={() => {
          onSave({ method, device });
          onRequestClose();
        }}>
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

// helper to format stage label using capital "I" characters
const formatStage = (val) => {
  if (!val) return '—';
  const map = { i: 'I', iia: 'IIa', iib: 'IIb', iii: 'III', iv: 'IV' };
  return map[val.toLowerCase()] || val;
};

// utility to join object values for device summaries
const summarize = (obj) =>
  obj && typeof obj === 'object' ? Object.values(obj).filter(Boolean).join(' ') : '';

const summarizeList = (arr) =>
  Array.isArray(arr) ? arr.map(summarize).filter(Boolean).join('; ') : '';

export default function StepSummary({ data, setData, setStep }) {
  const {
    stage,
    clinical = {},
    patencySegments = {},
    accessRows = [],
    navRows = [],
    therapyRows = [],
    closureRows = [],
  } = data;
  const prog = computePrognosis(data);
  const glass = computeGlass(patencySegments);
  const [activeRef, setActiveRef] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  const wifiCode = `W${prog.wound}I${prog.ischemia}fI${prog.infection}`;

  const showReference = (num) => {
    setActiveRef(num);
  };

  const riskInfoMap = {
    1: { cat: 'Very Low', amp: [1, 3], mort: [5, 10] },
    2: { cat: 'Low', amp: [5, 10], mort: [10, 15] },
    3: { cat: 'Moderate', amp: [15, 25], mort: [15, 30] },
    4: { cat: 'Very High', amp: [30, 55], mort: [25, 40] },
  };
  const riskInfo = riskInfoMap[prog.wifiStage] || {};


  const lengthImpact = prog.totalLength > 20 ? '+5–7%' : prog.totalLength > 10 ? '+2–5%' : 'no increase';
  const occlImpact = prog.hasOcclusion ? '+3–5%' : 'no increase';
  const calcImpact =
    prog.maxCalcium === 'heavy'
      ? '+3–5%'
      : prog.maxCalcium === 'moderate'
      ? '+1–3%'
      : 'no increase';

  const vesselName = (id) =>
    vesselSegments.find((s) => s.id === id)?.name || id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());


  const approachLabel = accessRows[0]
    ? `${accessRows[0].approach || ''} via ${accessRows[0].side || ''} ${accessRows[0].vessel || ''}`.trim()
    : '';

  const [editAccess, setEditAccess] = useState(false);


  const openItem = (item) => {
    if (!item.type) return;
    setModalInfo(item);
  };

  const renderSection = (title, items, approachText = '', editApproach = false) =>
    items.length || approachText ? (
      <div className="plan-section">
        <div className="section-title subsection-title">{title}</div>
        {approachText && (
          <div
            className="approach-label"
            onClick={() => editApproach && setEditAccess(true)}
          >
            {approachText}
          </div>
        )}
        <ul className="plan-list">
          {items.map((t, i) => (
            <li key={`${title}-${i}`} onClick={() => openItem(t)}>
              {t.type ? (
                <>
                  <div className="plan-item-subtitle">{t.type.toUpperCase()}</div>
                  <div className="plan-item-detail">{t.label}</div>
                </>
              ) : (
                t.label
              )}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const accessItems = accessRows.flatMap((r, row) => [
    ...((r.needles || []).map((n, i) => ({ label: summarize(n), type: 'needle', row, index: i }))),
    ...((r.sheaths || []).map((s, i) => ({ label: summarize(s), type: 'sheath', row, index: i }))),
    ...((r.catheters || []).map((c, i) => ({ label: summarize(c), type: 'access-catheter', row, index: i }))),
  ]).filter((i) => i.label);
  const navItems = navRows.flatMap((r, row) => [
    summarize(r.wire) ? { label: summarize(r.wire), type: 'wire', row } : null,
    summarize(r.catheter) ? { label: summarize(r.catheter), type: 'nav-catheter', row } : null,
  ]).filter(Boolean);
  const therapyItems = therapyRows.flatMap((r, row) => [
    summarize(r.balloon) ? { label: summarize(r.balloon), type: 'balloon', row } : null,
    summarize(r.stent) ? { label: summarize(r.stent), type: 'stent', row } : null,
  ]).filter(Boolean);
  const closureItems = closureRows
    .map((r, row) => ({
      label: `${r.method || ''}${r.device ? ' ' + r.device : ''}`.trim(),
      type: 'closure',
      row,
    }))
    .filter((i) => i.label);

  const handleSave = (val) => {
    if (!modalInfo) return;
    const { type, row, index } = modalInfo;
    setData((prev) => {
      const updated = { ...prev };
      if (type === 'needle') {
        const rows = [...(prev.accessRows || [])];
        const arr = [...(rows[row].needles || [])];
        arr[index] = val;
        rows[row] = { ...rows[row], needles: arr };
        updated.accessRows = rows;
      } else if (type === 'sheath') {
        const rows = [...(prev.accessRows || [])];
        const arr = [...(rows[row].sheaths || [])];
        arr[index] = val;
        rows[row] = { ...rows[row], sheaths: arr };
        updated.accessRows = rows;
      } else if (type === 'access-catheter') {
        const rows = [...(prev.accessRows || [])];
        const arr = [...(rows[row].catheters || [])];
        arr[index] = val;
        rows[row] = { ...rows[row], catheters: arr };
        updated.accessRows = rows;
      } else if (type === 'wire') {
        const rows = [...(prev.navRows || [])];
        rows[row] = { ...rows[row], wire: val };
        updated.navRows = rows;
      } else if (type === 'nav-catheter') {
        const rows = [...(prev.navRows || [])];
        rows[row] = { ...rows[row], catheter: val };
        updated.navRows = rows;
      } else if (type === 'balloon') {
        const rows = [...(prev.therapyRows || [])];
        rows[row] = { ...rows[row], balloon: val };
        updated.therapyRows = rows;
      } else if (type === 'stent') {
        const rows = [...(prev.therapyRows || [])];
        rows[row] = { ...rows[row], stent: val };
        updated.therapyRows = rows;
      } else if (type === 'closure') {
        const rows = [...(prev.closureRows || [])];
        rows[row] = { ...rows[row], ...val };
        updated.closureRows = rows;
      }
      return updated;
    });
    setModalInfo(null);
  };

  const vesselList = Object.keys(patencySegments).length ? (
    <ul className="vessel-summary">
      {Object.entries(patencySegments).map(([id, vals]) => {
        const lengthMap = { '<3': '<3cm', '3-10': '3–10cm', '10-15': '10–15cm', '15-20': '15–20cm', '>20': '>20cm' };
        const lengthLabel = lengthMap[vals.length] || vals.length;
        const calcLabel = vals.calcium ? `calcium: ${vals.calcium}` : '';
        const summary = `${vals.type}, ${lengthLabel}${calcLabel ? ', ' + calcLabel : ''}`;
        return (
          <li key={id} onClick={() => setStep && setStep(1)}>
            <strong>{vesselName(id)}</strong> {summary}
          </li>
        );
      })}
    </ul>
  ) : (
    <p>{__('No vessel data entered.', 'endoplanner')}</p>
  );

  return (
    <div className="case-summary-container">
      <div className="summary-row row1">
        <div className="summary-card">
          <div className="card-title">{__('Clinical indication', 'endoplanner')}</div>
          <div>{__('Fontaine stage', 'endoplanner')}: <b>{formatStage(stage)}</b></div>
          <div>{__('WIfI', 'endoplanner')}: <b>{wifiCode} (WIfI Stage {prog.wifiStage})</b></div>
          <div className="row-add-label">
            {`WIfI stage ${prog.wifiStage} predicts a ${riskInfo.cat?.toLowerCase()} risk of 1-year major amputation (${riskInfo.amp?.[0]}–${riskInfo.amp?.[1]}%) and mortality (${riskInfo.mort?.[0]}–${riskInfo.mort?.[1]}%).`}
            <ReferenceLink number={1} onClick={() => showReference(1)} />
          </div>
        </div>
        <div className="summary-card">
          <div className="card-title">{__('Disease Anatomy', 'endoplanner')}</div>
          {vesselList}
          <div>
            <div className="glass-line">
              {__('GLASS stage', 'endoplanner')} {glass.stage}{' '}
              <span className="glass-expl">
                {glass.explanation}
                <ReferenceLink number={2} onClick={() => showReference(2)} />
              </span>
            </div>
            <div className="row-add-label">
              {`GLASS stage ${glass.stage} predicts a technical failure rate of ${glass.failureRange[0]}–${glass.failureRange[1]}% and a 1-year limb-based patency of ${glass.patencyRange[0]}–${glass.patencyRange[1]}%.`}
              <ReferenceLink number={2} onClick={() => showReference(2)} />
            </div>
            {prog.wifiStage >= 3 && glass.stage === 'III' && (
              <div className="row-add-label text-red-500" id="open-bypass-notice">
                {__('For WIfI stage 3 or 4 and GLASS stage 3, open bypass should be considered according to the Global Vascular Guidelines on CLTI Management.', 'endoplanner')}
                <ReferenceLink number={2} onClick={() => showReference(2)} />
              </div>
            )}
          </div>
        </div>
        <div className="summary-card intervention-plan">
          <div className="card-title main-plan-title">{__('Intervention plan', 'endoplanner')}</div>
          {renderSection(__('Access', 'endoplanner'), accessItems, approachLabel, true)}
          {renderSection(__('Navigation', 'endoplanner'), navItems)}
          {renderSection(__('Crossing / Therapy', 'endoplanner'), therapyItems)}
          {renderSection(__('Closure', 'endoplanner'), closureItems)}
        </div>
      </div>

      <ReferenceModal
        isOpen={!!activeRef}
        reference={getReference(activeRef)}
        onRequestClose={() => setActiveRef(null)}
      />
      {modalInfo?.type === 'needle' && (
        <NeedleModal
          isOpen={true}
          anchor={null}
          values={accessRows[modalInfo.row].needles[modalInfo.index] || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'sheath' && (
        <SheathModal
          isOpen={true}
          anchor={null}
          values={accessRows[modalInfo.row].sheaths[modalInfo.index] || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'access-catheter' && (
        <CatheterModal
          isOpen={true}
          anchor={null}
          values={accessRows[modalInfo.row].catheters[modalInfo.index] || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'nav-catheter' && (
        <CatheterModal
          isOpen={true}
          anchor={null}
          values={navRows[modalInfo.row].catheter || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'wire' && (
        <WireModal
          isOpen={true}
          anchor={null}
          values={navRows[modalInfo.row].wire || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'balloon' && (
        <BalloonModal
          isOpen={true}
          anchor={null}
          values={therapyRows[modalInfo.row].balloon || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'stent' && (
        <StentModal
          isOpen={true}
          anchor={null}
          values={therapyRows[modalInfo.row].stent || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {modalInfo?.type === 'closure' && (
        <ClosureModal
          isOpen={true}
          values={closureRows[modalInfo.row] || {}}
          onRequestClose={() => setModalInfo(null)}
          onSave={handleSave}
        />
      )}
      {editAccess && (
        <AccessModal
          isOpen={true}
          values={accessRows[0] || {}}
          onRequestClose={() => setEditAccess(false)}
          onSave={(val) =>
            setData((prev) => {
              const rows = [...(prev.accessRows || [{}])];
              rows[0] = { ...rows[0], ...val };
              return { ...prev, accessRows: rows };
            })
          }
        />
      )}
    </div>
  );
}
