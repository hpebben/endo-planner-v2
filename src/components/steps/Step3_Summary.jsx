import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import { vesselSegments } from './Step2_Patency';
import InlineModal from '../UI/InlineModal';
import {
  GVG_CITATION,
  GLASS_STAGE_INFO,
  WIFI_STAGE_INFO,
  getGlassRecommendations,
  getWifiAction,
  getWifiRecommendations,
} from '../../utils/guidelineRecommendations';

const formatStage = (value) => {
  if (!value) return 'Not assessed';
  const map = { i: 'I', iia: 'IIa', iib: 'IIb', iii: 'III', iv: 'IV' };
  return map[value.toLowerCase()] || value;
};

const summarize = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(summarize).filter(Boolean).join('; ');
  return Object.values(value).filter(Boolean).join(' ');
};

const formatTherapy = (value) => {
  if (!value || typeof value !== 'object') return '';
  if (value.diameter && value.length) return `${value.diameter} × ${value.length} mm`;
  return summarize(value);
};

const vesselName = (id) =>
  vesselSegments.find((segment) => segment.id === id)?.name ||
  id.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

function PlanSection({ title, rows }) {
  const items = rows.filter((row) => row.value);
  if (!items.length) return <p className="summary-empty">{__('Not entered.', 'endoplanner')}</p>;

  return (
    <div className="plan-section">
      <div className="section-title subsection-title">{title}</div>
      <div className="plan-grid">
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            <div className="plan-label">{item.label}</div>
            <div className="plan-value">{item.value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function GuidelineModal({ title, isOpen, onRequestClose, recommendations, details }) {
  return (
    <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      {details}
      <h3 className="guideline-modal-subtitle">{__('Guideline recommendations', 'endoplanner')}</h3>
      <ul className="guideline-recommendations">
        {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
      </ul>
      <p className="guideline-citation">{GVG_CITATION}</p>
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

GuidelineModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  recommendations: PropTypes.arrayOf(PropTypes.string).isRequired,
  details: PropTypes.node,
};

PlanSection.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string }),
  ).isRequired,
};

export default function StepSummary({ data, setStep }) {
  const [wifiGuidelineOpen, setWifiGuidelineOpen] = useState(false);
  const [glassGuidelineOpen, setGlassGuidelineOpen] = useState(false);
  const {
    stage,
    patencySegments = {},
    accessRows = [],
    navRows = [],
    therapyRows = [],
    closureRows = [],
  } = data;

  const wifi = computePrognosis(data);
  const glass = computeGlass(patencySegments, data.targetArterialPath);
  const wifiCode = wifi.isComplete
    ? `W${wifi.wound} I${wifi.ischemia} fI${wifi.infection}`
    : __('Incomplete', 'endoplanner');
  const wifiInfo = wifi.isComplete ? WIFI_STAGE_INFO[wifi.wifiStage] : null;
  const glassInfo = glass.stage ? GLASS_STAGE_INFO[glass.stage] : null;

  const accessItems = accessRows.flatMap((row) => [
    { label: 'APPROACH', value: [row.approach, row.side, row.vessel].filter(Boolean).join(' ') },
    { label: 'NEEDLE(S)', value: summarize(row.needles) },
    { label: 'SHEATH(S)', value: summarize(row.sheaths) },
    { label: 'CATHETER(S)', value: summarize(row.catheters) },
  ]);

  const navigationItems = navRows.flatMap((row) => [
    { label: 'WIRE', value: summarize(row.wire) },
    { label: 'CATHETER', value: summarize(row.catheter) },
    { label: 'SPECIAL', value: summarize(row.device) },
  ]);

  const therapyItems = therapyRows.flatMap((row) => [
    { label: 'BALLOON', value: formatTherapy(row.balloon) },
    { label: 'STENT', value: formatTherapy(row.stent) },
    { label: 'SPECIAL', value: summarize(row.device) },
  ]);

  const closureItems = closureRows.map((row) => ({
    label: 'CLOSURE',
    value: [row.method, row.device].filter(Boolean).join(' '),
  }));

  return (
    <div id="case-summary" className="summary-card-wrapper case-summary">
      <div className="case-summary-container">
        <h2 className="case-summary__title">{__('Case Summary', 'endoplanner')}</h2>

        <div className="summary-card case-summary__indication">
          <div className="card-title">{__('Clinical indication', 'endoplanner')}</div>
          <div>
            {__('Fontaine stage', 'endoplanner')}: <b>{formatStage(stage)}</b>
          </div>
          <div>
            {__('WIfI components', 'endoplanner')}: <b>{wifiCode}</b>
          </div>
          {wifi.isComplete ? (
            <div className="clinical-guidance wifi-prediction">
              <p>
                {`Clinical stage ${wifi.wifiStage}, approximately ${wifiInfo.riskPercent}% pooled estimated 1-year risk of major amputation. ${getWifiAction(wifi.wifiStage, wifi.ischemia)}`}
              </p>
              <button type="button" className="guideline-link" onClick={() => setWifiGuidelineOpen(true)}>
                {__('See other CLTI guideline recommendations for this WIfI stage', 'endoplanner')}
              </button>
            </div>
          ) : (
            <div className="row-add-label text-red-500">
              {__('Complete wound, ischemia and foot-infection grading before interpreting WIfI.', 'endoplanner')}
            </div>
          )}
          <button type="button" className="stage-btn" onClick={() => setStep?.(0)}>
            {__('Edit clinical assessment', 'endoplanner')}
          </button>
        </div>

        <div className="summary-card">
          <div className="card-title">{__('Disease anatomy', 'endoplanner')}</div>
          {Object.keys(patencySegments).length ? (
            <ul className="vessel-summary">
              {Object.entries(patencySegments).map(([id, values]) => (
                <li key={id}>
                  <span className="dash-bullet">–</span>
                  <span>
                    <strong>{vesselName(id)}</strong>{' '}
                    {[values.type, values.length, values.calcium].filter(Boolean).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{__('No vessel data entered.', 'endoplanner')}</p>
          )}

          <div className="glass-line">
            {__('GLASS stage', 'endoplanner')}: <b>{glass.stage || __('Not calculated', 'endoplanner')}</b>
          </div>
          {glass.isComplete ? (
            <div className="clinical-guidance glass-prediction">
              <div className="glass-metrics">
                <span><b>{__('Technical failure', 'endoplanner')}:</b> {glass.technicalFailure}</span>
                <span><b>{__('1-year limb-based patency', 'endoplanner')}:</b> {glass.oneYearPatency}</span>
                <span><b>{__('Pattern', 'endoplanner')}:</b> {glass.anatomicPattern}</span>
              </div>
              <p className="glass-rationale">{glass.reason}</p>
              <button type="button" className="guideline-link" onClick={() => setGlassGuidelineOpen(true)}>
                {__('See other CLTI guideline recommendations for this GLASS stage', 'endoplanner')}
              </button>
            </div>
          ) : (
            <div className="row-add-label glass-prediction">{glass.reason}</div>
          )}
          <button type="button" className="stage-btn" onClick={() => setStep?.(1)}>
            {__('Edit anatomy', 'endoplanner')}
          </button>
        </div>

        <div className="summary-card intervention-plan">
          <div className="card-title main-plan-title">{__('Intervention plan', 'endoplanner')}</div>
          <PlanSection title={__('ACCESS', 'endoplanner')} rows={accessItems} />
          <PlanSection title={__('NAVIGATION & CROSSING', 'endoplanner')} rows={navigationItems} />
          <PlanSection title={__('VESSEL PREPARATION & THERAPY', 'endoplanner')} rows={therapyItems} />
          <PlanSection title={__('CLOSURE', 'endoplanner')} rows={closureItems} />
          <button type="button" className="stage-btn" onClick={() => setStep?.(2)}>
            {__('Edit intervention plan', 'endoplanner')}
          </button>
        </div>
      </div>

      {wifi.isComplete && (
        <GuidelineModal
          title={`WIfI clinical stage ${wifi.wifiStage}`}
          isOpen={wifiGuidelineOpen}
          onRequestClose={() => setWifiGuidelineOpen(false)}
          recommendations={getWifiRecommendations(wifi.wifiStage, wifi.ischemia)}
          details={(
            <div className="guideline-stage-details">
              <b>{wifiInfo.riskCategory} limb-threat category.</b>
              <span>{` Pooled observational estimate: ${wifiInfo.riskPercent}% 1-year major amputation risk.`}</span>
            </div>
          )}
        />
      )}
      {glass.isComplete && (
        <GuidelineModal
          title={`GLASS stage ${glass.stage}`}
          isOpen={glassGuidelineOpen}
          onRequestClose={() => setGlassGuidelineOpen(false)}
          recommendations={getGlassRecommendations(glass.stage)}
          details={(
            <div className="guideline-stage-details glass-guideline-details">
              <div><b>{glassInfo.complexity}</b></div>
              <div>{`Expected immediate technical failure: ${glassInfo.technicalFailure}`}</div>
              <div>{`Expected 1-year limb-based patency: ${glassInfo.oneYearPatency}`}</div>
              <div>{glassInfo.pattern}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}

StepSummary.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func,
  setStep: PropTypes.func,
};
