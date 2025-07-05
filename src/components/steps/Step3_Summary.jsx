import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import computeTasc from '../../utils/tasc';
import ReferenceLink from '../UI/ReferenceLink';
import ReferencePopup from '../UI/ReferencePopup';
import ReferenceModal from '../UI/ReferenceModal';
import { getReference } from '../../utils/references';
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
  const [activeRef, setActiveRef] = useState(null);
  const [showRefGlass, setShowRefGlass] = useState(false);
  const [showRefTasc, setShowRefTasc] = useState(false);

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


  const renderSection = (title, items, approachText = '') =>
    items.length || approachText ? (
      <div className="plan-section">
        <div className="section-title subsection-title">{title}</div>
        {approachText && <div className="approach-label">{approachText}</div>}
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
          <div className="card-title">{__('Disease Anatomy', 'endoplanner')}</div>
          {vesselList}
          <div>
            {__('GLASS stage', 'endoplanner')} {glass.stage}{' '}
            <span className="row-add-label">
              {glass.explanation}
              <ReferenceLink number={1} onClick={() => showReference(1)} />.{' '}
              <a href="#" onClick={() => setShowRefGlass(true)}>Read more about GLASS</a>
            </span>
          </div>
          {tasc && (
            <div>
              {`TASC II ${tasc.stage} `}
              <span className="row-add-label">
                {tasc.explanation}
                <ReferenceLink number={3} onClick={() => showReference(3)} />.{' '}
                <a href="#" onClick={() => setShowRefTasc(true)}>Read more about TASC II</a>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="summary-card evidence-card">
        <div className="card-title">{__('Evidence based considerations', 'endoplanner')}</div>
        <div>
          {`Based on WIfI stage ${prog.wifiStage}, the 1-year major amputation risk falls into the ${riskInfo.cat} category (${riskInfo.amp?.[0]}–${riskInfo.amp?.[1]}%).`}
          <ReferenceLink number={1} onClick={() => showReference(1)} />
          <br />
          {`GLASS stage ${glass.stage} predicts a technical failure rate of ${glass.failureRange[0]}–${glass.failureRange[1]}% and a 1-year limb-based patency of ${glass.patencyRange[0]}–${glass.patencyRange[1]}%.`}
          <ReferenceLink number={1} onClick={() => showReference(1)} />
          {prog.wifiStage >= 3 && glass.stage === 'III' && (
            <>
              <br />
              <span id="open-bypass-notice" className="row-add-label text-red-500">
                {__('For WIfI stage 3 or 4 and GLASS stage 3, open bypass should be considered according to the Global Vascular Guidelines on CLTI Management.', 'endoplanner')}
                <ReferenceLink number={1} onClick={() => showReference(1)} />
              </span>
            </>
          )}
        </div>
      </div>

      <div className="summary-card intervention-plan">
        <div className="card-title main-plan-title">{__('Intervention plan', 'endoplanner')}</div>
        {renderSection(__('Access', 'endoplanner'), accessItems, approachLabel)}
        {renderSection(__('Navigation', 'endoplanner'), navItems)}
        {renderSection(__('Crossing / Therapy', 'endoplanner'), therapyItems)}
        {renderSection(__('Closure', 'endoplanner'), closureItems)}
        <div className="export-row">
          <button type="button" className="export-btn" onClick={() => exportCaseSummary(data)}>
            {__('Export PDF', 'endoplanner')}
          </button>
        </div>
      </div>

      <ReferenceModal
        isOpen={!!activeRef}
        reference={getReference(activeRef)}
        onRequestClose={() => setActiveRef(null)}
      />
      <ReferencePopup
        isOpen={showRefGlass}
        onRequestClose={() => setShowRefGlass(false)}
        figure="glass-table"
        title="Global Vascular Guidelines, 2019 – Table 5.4 (p. S44)"
        citation="Conte MS, Bradbury AW, Kolh P, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. Eur J Vasc Endovasc Surg. 2019;58(1S):S1-S109."
        page="S44"
        link="https://esvs.org/wp-content/uploads/2021/08/CLTI-Guidelines-ESVS-SVS-WFVS.pdf"
      />
      <ReferencePopup
        isOpen={showRefTasc}
        onRequestClose={() => setShowRefTasc(false)}
        figure="tasc-table"
        title="TASC II – Figure 6"
        citation="Norgren L, Hiatt WR, Dormandy JA, et al. Inter-Society Consensus for the Management of Peripheral Arterial Disease (TASC II). J Vasc Surg. 2007;45(Suppl S):S5-S67."
        page="?"
      />
    </div>
  );
}
