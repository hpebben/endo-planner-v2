import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import ReferenceLink from '../UI/ReferenceLink';
import ReferencePopup from '../UI/ReferencePopup';

export default function StepSummary({ data }) {
  const { stage, clinical = {}, patencySegments = {}, accessRows = [], navRows = [], therapyRows = [], closureRows = [] } = data;
  const prog = computePrognosis(data);
  const glass = computeGlass(patencySegments);
  const [showRef1, setShowRef1] = useState(false);
  const [showRef2, setShowRef2] = useState(false);

  return (
    <div className="case-summary">
      <div className="summary-cards">
        <div className="summary-card">
          <h3>{__('Clinical indication', 'endoplanner')}</h3>
          <ul>
            <li><strong>{__('Stage', 'endoplanner')}:</strong> {stage || '—'}</li>
            <li><strong>{__('Wound', 'endoplanner')}:</strong> {clinical.wound ?? '—'}</li>
            <li><strong>{__('Ischemia', 'endoplanner')}:</strong> {clinical.ischemia ?? '—'}</li>
            <li><strong>{__('Infection', 'endoplanner')}:</strong> {clinical.infection ?? '—'}</li>
          </ul>
        </div>
        <div className="summary-card">
          <h3>{__('Vessel patency', 'endoplanner')}</h3>
          {Object.keys(patencySegments).length ? (
            <ul className="vessel-summary arrow-list">
              {Object.entries(patencySegments).map(([id, vals]) => {
                const lengthMap = {
                  '<3': '<3cm', '3-10': '3–10cm', '10-15': '10–15cm', '15-20': '15–20cm', '>20': '>20cm'
                };
                const lengthLabel = lengthMap[vals.length] || vals.length;
                const summary = `${vals.type} | ${lengthLabel} | ${vals.calcium}`;
                return <li key={id}><strong>{id}</strong> {summary}</li>;
              })}
            </ul>
          ) : (
            <p>{__('No vessel data entered.', 'endoplanner')}</p>
          )}
        </div>
        <div className="summary-card">
          <h3>{__('Intervention plan', 'endoplanner')}</h3>
          {[accessRows, navRows, therapyRows, closureRows].every(arr => !arr.length) ? (
            <p>{__('No intervention details.', 'endoplanner')}</p>
          ) : (
            <ul className="arrow-list">
              {accessRows.length > 0 && <li>{`${accessRows.length} access approach(es)`}</li>}
              {navRows.length > 0 && <li>{`${navRows.length} navigation step(s)`}</li>}
              {therapyRows.length > 0 && <li>{`${therapyRows.length} therapy row(s)`}</li>}
              {closureRows.length > 0 && <li>{`${closureRows.length} closure step(s)`}</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="literature-card">
        <h3>{__('Literature-based considerations', 'endoplanner')}</h3>
        <p>{__('WiFi Score', 'endoplanner')}:</p>
        <ul>
          <li>{`Wound: ${prog.wound}`}</li>
          <li>{`Ischemia: ${prog.ischemia}`}</li>
          <li>{`Foot infection: ${prog.infection}`}</li>
        </ul>
        <p>
          {__('Estimated 1-year major amputation risk', 'endoplanner')}: {`${prog.baseAmpRange[0]}–${prog.baseAmpRange[1]}% `}
          <ReferenceLink number={1} onClick={() => setShowRef1(true)} />
        </p>
        <p>
          {__('Adjusted for lesion length and calcification', 'endoplanner')}: {`${prog.ampRange[0]}–${prog.ampRange[1]}% `}
          <ReferenceLink number={1} onClick={() => setShowRef1(true)} />
        </p>
        <p>{__('GLASS staging', 'endoplanner')}: {`GLASS ${glass.stage}`}</p>
        <ul>
          <li>{`${__('Technical success', 'endoplanner')}: ${glass.successRange[0]}–${glass.successRange[1]}%`}</li>
          <li>
            {`${__('1-year patency', 'endoplanner')}: ${glass.patencyRange[0]}–${glass.patencyRange[1]}% `}
            <ReferenceLink number={2} onClick={() => setShowRef2(true)} />
          </li>
        </ul>
        <p>{__('References:', 'endoplanner')}</p>
        <ol className="reference-list">
          <li>
            <ReferenceLink number={1} onClick={() => setShowRef1(true)} /> CLTI Guidelines 2021, Table 4
          </li>
          <li>
            <ReferenceLink number={2} onClick={() => setShowRef2(true)} /> CLTI Guidelines 2021, Figure 6
          </li>
        </ol>
        <ReferencePopup
          isOpen={showRef1}
          onRequestClose={() => setShowRef1(false)}
          figure="table4"
          title="CLTI Guidelines 2021 – Table 4"
        />
        <ReferencePopup
          isOpen={showRef2}
          onRequestClose={() => setShowRef2(false)}
          figure="figure6"
          title="CLTI Guidelines 2021 – Figure 6"
        />
      </div>
    </div>
  );
}
