import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import ReferenceLink from '../UI/ReferenceLink';
import ReferencePopup from '../UI/ReferencePopup';
import { vesselSegments } from './Step2_Patency';
import exportCaseSummary from '../../utils/exportPdf';

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

export default function StepSummary({ data, setStep }) {
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
  const [showRef1, setShowRef1] = useState(false);
  const [showRef2, setShowRef2] = useState(false);
  const [showRef3, setShowRef3] = useState(false);
  const handleExport = () => exportCaseSummary(data);

  const wifiCode = `W${prog.wound}I${prog.ischemia}fI${prog.infection}`;

  const riskInfoMap = {
    1: { cat: 'Very Low', amp: [1, 3], mort: [5, 10] },
    2: { cat: 'Low', amp: [5, 10], mort: [10, 15] },
    3: { cat: 'Moderate', amp: [15, 25], mort: [15, 30] },
    4: { cat: 'High', amp: [30, 55], mort: [25, 40] },
  };
  const riskInfo = riskInfoMap[prog.wifiStage] || {};

  const table5Highlight = [];
  if (prog.lengthCategory) table5Highlight.push(prog.lengthCategory);
  if (prog.hasOcclusion) table5Highlight.push('occl');
  if (prog.maxCalcium === 'moderate') table5Highlight.push('modcalc');
  if (prog.maxCalcium === 'heavy') table5Highlight.push('heavycalc');

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

  const renderPill = (label, key) => (
    <span key={key} className="pill" onClick={() => setStep && setStep(2)}>
      {label}
    </span>
  );

  const pillsFromList = (list, prefix) =>
    (list || []).map((obj, idx) => {
      const lbl = summarize(obj);
      return lbl ? renderPill(lbl, `${prefix}${idx}`) : null;
    });

  const renderAccessPills = (row, i) => [
    ...pillsFromList(row.needles, `n${i}`),
    ...pillsFromList(row.sheaths, `s${i}`),
    ...pillsFromList(row.catheters, `c${i}`),
  ];

  const renderNavPills = (row, i) => [
    row.wire && renderPill(`Wire ${summarize(row.wire)}`, `w${i}`),
    row.catheter && renderPill(`Catheter ${summarize(row.catheter)}`, `c${i}`),
    row.device && renderPill(row.device, `d${i}`),
  ];

  const renderTherapyPills = (row, i) => [
    row.balloon && renderPill(`Balloon ${summarize(row.balloon)}`, `b${i}`),
    row.stent && renderPill(`Stent ${summarize(row.stent)}`, `s${i}`),
    row.device && renderPill(row.device, `d${i}`),
  ];

  const renderClosurePills = (row, i) => [
    row.method && renderPill(row.method, `m${i}`),
    row.device && renderPill(row.device, `d${i}`),
  ];

  const approachChips = accessRows.map((row, i) => (
    <span key={`ap${i}`} className="approach-chip" onClick={() => setStep && setStep(2)}>
      {`${row.approach || ''} ${__('via', 'endoplanner')} ${row.side || ''} ${vesselName(row.vessel || '')}`.trim()}
    </span>
  ));

  return (
    <div className="case-summary-container">
      <div className="summary-row">
        <div className="card">
          <div className="card-title">{__('Clinical indication', 'endoplanner')}</div>
          <div>{__('Fontaine stage', 'endoplanner')}: <b>{formatStage(stage)}</b></div>
          <div>{__('WIfI', 'endoplanner')}: <b>{`${wifiCode} (WIfI Stage ${prog.wifiStage})`}</b></div>
        </div>
        <div className="card">
          <div className="card-title">{__('Vessel patency', 'endoplanner')}</div>
          {Object.keys(patencySegments).length ? (
            <ul className="vessel-summary">
              {Object.entries(patencySegments).map(([id, vals]) => {
                const lengthMap = { '<3': '<3cm', '3-10': '3–10cm', '10-15': '10–15cm', '15-20': '15–20cm', '>20': '>20cm' };
                const lengthLabel = lengthMap[vals.length] || vals.length;
                const summary = `${vals.type} | ${lengthLabel} | ${vals.calcium}`;
                return <li key={id}><strong>{vesselName(id)}</strong> {summary}</li>;
              })}
            </ul>
          ) : (
            <p>{__('No vessel data entered.', 'endoplanner')}</p>
          )}
        </div>
      </div>

      <div className="card literature-card">
        <div className="card-title">{__('Evidence based considerations', 'endoplanner')}</div>
        <p>
          {`Based on WIfI stage ${prog.wifiStage}, the estimated 1-year major amputation risk is ${riskInfo.amp?.[0]}–${riskInfo.amp?.[1]}% and mortality risk ${riskInfo.mort?.[0]}–${riskInfo.mort?.[1]}% (${riskInfo.cat}). `}
          <ReferenceLink number={1} onClick={() => setShowRef1(true)} />
        </p>
        <p>
          {`Given a lesion length ${prog.totalLength > 20 ? '>20 cm' : prog.totalLength > 10 ? '10–20 cm' : '<10 cm'} (${lengthImpact}), ${prog.hasOcclusion ? 'occlusion' : 'stenosis'} (${occlImpact}), and ${prog.maxCalcium} calcification (${calcImpact}), the adjusted 1-year major amputation risk is ${prog.ampRange[0]}–${prog.ampRange[1]}% `}
          <ReferenceLink number={2} onClick={() => setShowRef2(true)} />
        </p>
        <p>
          {`Based on vessel patency selections, GLASS stage ${glass.stage} predicts a technical failure rate of ${100 - glass.successRange[1]}–${100 - glass.successRange[0]}% and a 1-year limb-based patency of ${glass.patencyRange[0]}–${glass.patencyRange[1]}%. `}
          <ReferenceLink number={3} onClick={() => setShowRef3(true)} />
        </p>
        {prog.wifiStage >= 3 && glass.stage === 'III' && (
          <p className="notice">
            {__('If WIfI stage 3 or 4 and GLASS stage III are present, an open bypass should be considered according to the Global (ESVS, SVS, WFVS) Vascular Guidelines on CLTI Management.', 'endoplanner')}<sup>[1]</sup>
          </p>
        )}
      </div>

      <div className="card intervention-plan-card">
        <div className="card-title">{__('Intervention plan', 'endoplanner')}</div>
        <div className="mb-3 approach-row">{approachChips}</div>
        {[accessRows, navRows, therapyRows, closureRows].every((arr) => !arr.length) ? (
          <p>{__('No intervention details.', 'endoplanner')}</p>
        ) : (
          <>
            {accessRows.length > 0 && (
              <div className="plan-section">
                <span className="section-label">{__('Access', 'endoplanner')}:</span>
                {accessRows.flatMap(renderAccessPills)}
              </div>
            )}
            {navRows.length > 0 && (
              <div className="plan-section">
                <span className="section-label">{__('Navigation', 'endoplanner')}:</span>
                {navRows.flatMap(renderNavPills)}
              </div>
            )}
            {therapyRows.length > 0 && (
              <div className="plan-section">
                <span className="section-label">{__('Crossing & Therapy', 'endoplanner')}:</span>
                {therapyRows.flatMap(renderTherapyPills)}
              </div>
            )}
            {closureRows.length > 0 && (
              <div className="plan-section">
                <span className="section-label">{__('Closure', 'endoplanner')}:</span>
                {closureRows.flatMap(renderClosurePills)}
              </div>
            )}
          </>
        )}
        <div className="text-right mt-6">
          <button type="button" className="export-btn" onClick={handleExport}>
            {__('Export PDF', 'endoplanner')}
          </button>
        </div>
      </div>

      <ReferencePopup
        isOpen={showRef1}
        onRequestClose={() => setShowRef1(false)}
        figure="table6"
        title="Global Vascular Guidelines, 2019 – Table 6"
        highlight={prog.wifiStage}
      />
      <ReferencePopup
        isOpen={showRef2}
        onRequestClose={() => setShowRef2(false)}
        figure="table5"
        title="Global Vascular Guidelines, 2019 – Table 5"
        highlight={table5Highlight}
      />
      <ReferencePopup
        isOpen={showRef3}
        onRequestClose={() => setShowRef3(false)}
        figure="table54"
        title="Global Vascular Guidelines, 2019 – Table 5.4"
        highlight={glass.stage}
      />
    </div>
  );
}
