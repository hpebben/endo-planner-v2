import React from 'react';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';

export default function StepSummary({ data }) {
  const { stage, clinical = {}, patencySegments = {}, accessRows = [], navRows = [], therapyRows = [], closureRows = [] } = data;
  const prog = computePrognosis(data);

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
        <p>{__('Based on the entered WiFi score:', 'endoplanner')}</p>
        <ul>
          <li>{`Wound: ${prog.wound}`}</li>
          <li>{`Ischemia: ${prog.ischemia}`}</li>
          <li>{`Foot infection: ${prog.infection}`}</li>
        </ul>
        <p>{__('And the selected disease characteristics:', 'endoplanner')}</p>
        <ul>
          <li>{`${__('Lesion length', 'endoplanner')}: ${prog.totalLength}cm`}</li>
          <li>{`${__('Stenosis/occlusion', 'endoplanner')}: ${prog.hasOcclusion ? 'occlusion' : 'stenosis'}`}</li>
          <li>{`${__('Calcification', 'endoplanner')}: ${prog.maxCalcium}`}</li>
        </ul>
        <p>{__('Prognosis:', 'endoplanner')}</p>
        <ul>
          <li>{`${__('Estimated 1-year amputation risk', 'endoplanner')}: ${prog.ampRisk}%`}</li>
          <li>{`${__('Estimated 1-year limb salvage rate', 'endoplanner')}: ${prog.limbSalvage}%`}</li>
        </ul>
        <p>{__('Higher WiFi stage and longer, more calcified lesions are associated with poorer outcomes and higher risk, as described in both guidelines.', 'endoplanner')}</p>
        <p><em>{__('References: CLTI Guidelines 2021, IWGDF Guidelines 2023', 'endoplanner')}</em></p>
      </div>
    </div>
  );
}
