import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import computeTasc from '../../utils/tasc';
import ReferenceLink from '../UI/ReferenceLink';
import ReferencePopup from '../UI/ReferencePopup';
import exportCaseSummary from '../../utils/exportPdf';
import { vesselSegments } from './Step2_Patency';

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
  const tasc = computeTasc(patencySegments);
  const [showRef1, setShowRef1] = useState(false);
  const [showRef2, setShowRef2] = useState(false);
  const [showRef3, setShowRef3] = useState(false);

  const wifiCode = `W${prog.wound}I${prog.ischemia}fI${prog.infection}`;

  const riskInfoMap = {
    1: { cat: 'Very Low', amp: [1, 3], mort: [5, 10] },
    2: { cat: 'Low', amp: [5, 10], mort: [10, 15] },
    3: { cat: 'Moderate', amp: [15, 25], mort: [15, 30] },
    4: { cat: 'Very High', amp: [30, 55], mort: [25, 40] },
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


  const approachLabel = accessRows[0]
    ? `${accessRows[0].approach || ''} via ${accessRows[0].side || ''} ${accessRows[0].vessel || ''}`.trim()
    : '';


  const renderSection = (title, items) =>
    items.length ? (
      <div className="plan-section">
        <div className="section-title subsection-title">{title}</div>
        <ul className="plan-list">
          {items.map((t, i) => (
            <li key={`${title}-${i}`} onClick={() => setStep && setStep(2)}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const accessItems = accessRows.flatMap((r) => [
    ...((r.needles || []).map(summarize)),
    ...((r.sheaths || []).map(summarize)),
    ...((r.catheters || []).map(summarize)),
  ]).filter(Boolean);
  const navItems = navRows.flatMap((r) => [summarize(r.wire), summarize(r.catheter), r.device]).filter(Boolean);
  const therapyItems = therapyRows.flatMap((r) => [summarize(r.balloon), summarize(r.stent), r.device]).filter(Boolean);
  const closureItems = closureRows.flatMap((r) => [r.method, r.device]).filter(Boolean);

  const vesselList = Object.keys(patencySegments).length ? (
    <ul className="vessel-summary">
      {Object.entries(patencySegments).map(([id, vals]) => {
        const lengthMap = { '<3': '<3cm', '3-10': '3–10cm', '10-15': '10–15cm', '15-20': '15–20cm', '>20': '>20cm' };
        const lengthLabel = lengthMap[vals.length] || vals.length;
        const calcLabel = vals.calcium
          ? `${vals.calcium.charAt(0).toUpperCase() + vals.calcium.slice(1)} calcium`
          : '';
        const summary = `${vals.type}, ${lengthLabel}, ${calcLabel}`;
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
        </div>
        <div className="summary-card">
          <div className="card-title">{__('Disease anatomy', 'endoplanner')}</div>
          {vesselList}
          <div>
            {__('GLASS stage', 'endoplanner')} {glass.stage}{' '}
            <span className="text-gray-500 text-xs">({glass.explanation}, see Table 5.4)</span>
          </div>
          {tasc && (
            <div>
              {`TASC II ${tasc.stage} `}
              <span className="text-gray-500 text-xs">({tasc.explanation}, see TASC II)</span>
            </div>
          )}
        </div>
      </div>

      <div className="summary-card evidence-card">
        <div className="card-title">{__('Evidence based considerations', 'endoplanner')}</div>
        <div>
          {`Based on WIfI stage ${prog.wifiStage}, the 1-year major amputation risk falls into the ${riskInfo.cat} category (${riskInfo.amp?.[0]}–${riskInfo.amp?.[1]}%).`}
          <ReferenceLink number={1} onClick={() => setShowRef1(true)} />
          <br />
          {`GLASS stage ${glass.stage} predicts a technical failure rate of ${glass.failureRange[0]}–${glass.failureRange[1]}% and a 1-year limb-based patency of ${glass.patencyRange[0]}–${glass.patencyRange[1]}%.`}
          <ReferenceLink number={2} onClick={() => setShowRef2(true)} />
          <br />
          <b>{__('Notice:', 'endoplanner')}</b>{' '}
          {__('If WIfI stage 3 or 4 and GLASS stage 3 are present, open bypass should be considered according to the Global Vascular Guidelines on CLTI Management.', 'endoplanner')}
          <ReferenceLink number={3} onClick={() => setShowRef3(true)} />
        </div>
      </div>

      <div className="summary-card intervention-plan">
        <div className="card-title main-plan-title">{__('Intervention plan', 'endoplanner')}</div>
        {approachLabel && (
          <div className="approach-chip">{approachLabel}</div>
        )}
        {renderSection(__('Access', 'endoplanner'), accessItems)}
        {renderSection(__('Navigation', 'endoplanner'), navItems)}
        {renderSection(__('Crossing / Therapy', 'endoplanner'), therapyItems)}
        {renderSection(__('Closure', 'endoplanner'), closureItems)}
        <div className="export-row">
          <button type="button" className="export-btn" onClick={() => exportCaseSummary(data)}>
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
