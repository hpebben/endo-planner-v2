import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import ReferenceLink from '../UI/ReferenceLink';
import ReferencePopup from '../UI/ReferencePopup';
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
  const [showRef1, setShowRef1] = useState(false);
  const [showRef2, setShowRef2] = useState(false);
  const [showRef3, setShowRef3] = useState(false);

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

  const renderAccess = (row, i) => {
    const needles = summarizeList(row.needles);
    const sheaths = summarizeList(row.sheaths);
    const cats = summarizeList(row.catheters);
    return (
      <li key={`a${i}`} onClick={() => setStep && setStep(2)}>
        <div>{`#${i + 1}: ${row.approach || ''} via ${row.side || ''} ${row.vessel || ''}`}</div>
        <ul>
          {needles && <li>{`Needle(s): ${needles}`}</li>}
          {sheaths && <li>{`Sheath(s): ${sheaths}`}</li>}
          {cats && <li>{`Catheter(s): ${cats}`}</li>}
        </ul>
      </li>
    );
  };

  const renderNav = (row, i) => {
    const wire = summarize(row.wire);
    const cath = summarize(row.catheter);
    const device = row.device;
    return (
      <li key={`n${i}`} onClick={() => setStep && setStep(2)}>
        <div>{`#${i + 1}`}</div>
        <ul>
          {wire && <li>{`Wire ${wire}`}</li>}
          {cath && <li>{`Catheter ${cath}`}</li>}
          {device && <li>{`Device ${device}`}</li>}
        </ul>
      </li>
    );
  };

  const renderTherapy = (row, i) => {
    const balloon = summarize(row.balloon);
    const stent = summarize(row.stent);
    const device = row.device;
    return (
      <li key={`t${i}`} onClick={() => setStep && setStep(2)}>
        <div>{`#${i + 1}`}</div>
        <ul>
          {balloon && <li>{`Balloon ${balloon}`}</li>}
          {stent && <li>{`Stent ${stent}`}</li>}
          {device && <li>{`Device ${device}`}</li>}
        </ul>
      </li>
    );
  };

  const renderClosure = (row, i) => {
    return (
      <li key={`c${i}`} onClick={() => setStep && setStep(2)}>
        <div>{`#${i + 1}`}</div>
        <ul>
          {row.method && <li>{row.method}</li>}
          {row.device && <li>{`Device ${row.device}`}</li>}
        </ul>
      </li>
    );
  };

  return (
    <div className="case-summary">
      <div className="summary-cards">
        <div className="summary-card">
          <h3>{__('Clinical indication', 'endoplanner')}</h3>
          <ul>
            <li><strong>{__('Fontaine stage', 'endoplanner')}:</strong> {formatStage(stage)}</li>
            <li><strong>{__('WIfI', 'endoplanner')}:</strong> {wifiCode}</li>
            <li><strong>{__('Overall WIfI stage', 'endoplanner')}:</strong> {`WIfI stage ${prog.wifiStage}`}</li>
          </ul>
        </div>
        <div className="summary-card">
          <h3>{__('Vessel patency', 'endoplanner')}</h3>
          {Object.keys(patencySegments).length ? (
            <ul className="vessel-summary arrow-list">
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
        <div className="summary-card">
          <h3>{__('Evidence based considerations', 'endoplanner')}</h3>
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
      </div>

      <div className="summary-card intervention-plan-card">
        <h3>{__('Intervention plan', 'endoplanner')}</h3>
        {[accessRows, navRows, therapyRows, closureRows].every((arr) => !arr.length) ? (
          <p>{__('No intervention details.', 'endoplanner')}</p>
        ) : (
          <>
            {accessRows.length > 0 && (
              <div>
                <strong>{__('Access', 'endoplanner')}</strong>
                <ul className="arrow-list">{accessRows.map(renderAccess)}</ul>
              </div>
            )}
            {navRows.length > 0 && (
              <div>
                <strong>{__('Navigation & Crossing', 'endoplanner')}</strong>
                <ul className="arrow-list">{navRows.map(renderNav)}</ul>
              </div>
            )}
            {therapyRows.length > 0 && (
              <div>
                <strong>{__('Vessel preparation & therapy', 'endoplanner')}</strong>
                <ul className="arrow-list">{therapyRows.map(renderTherapy)}</ul>
              </div>
            )}
            {closureRows.length > 0 && (
              <div>
                <strong>{__('Closure', 'endoplanner')}</strong>
                <ul className="arrow-list">{closureRows.map(renderClosure)}</ul>
              </div>
            )}
          </>
        )}
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
