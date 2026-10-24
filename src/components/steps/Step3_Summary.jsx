import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import computePrognosis from '../../utils/prognosis';
import computeGlass from '../../utils/glass';
import InlineModal from '../UI/InlineModal';
import SelectedWoundosomeSummary from '../SelectedWoundosomeSummary';
import DiseaseAnatomySummary from '../DiseaseAnatomySummary';
import RecommendationsPanel from '../PlanRecommendations';
import { analyzePlan } from '../../utils/planAnalysis';
import { getWoundosomeAdvice, WOUNDOSOME_REFERENCE } from '../../data/woundosome';
import { getPatSummaryLines } from '../../data/pedalAccelerationTime';
import { getActiveWoundLocations } from '../../utils/clinicalStage';
import { formatTargetArterialPath, getLesionOptions, lesionVesselName, lesionLengthLabel, calcificationLabel } from '../../utils/lesions';
import { lesionPositionLabel } from '../../utils/lesionLocation';
import {
  buildScopeOptions,
  hasPlanItemContent,
  scopeKey,
} from '../../utils/planScopes';
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
  if (value.product || value.specific) {
    return [
      value.product || value.specific,
      value.category,
      value.platform && `${value.platform}-inch`,
      value.size,
      value.diameter && value.length ? `${value.diameter} × ${value.length} mm` : value.length,
      value.shaft,
      value.minimumSheathFr && `min ${value.minimumSheathFr} sheath`,
    ].filter(Boolean).join(' • ');
  }
  return Object.entries(value)
    .filter(([key, nested]) => key !== 'id' && nested)
    .map(([, nested]) => summarize(nested))
    .filter(Boolean)
    .join(' • ');
};

const formatTherapy = (value) => {
  if (!value || typeof value !== 'object') return '';
  if (value.diameter && value.length) {
    return [
      value.product,
      `${value.diameter} × ${value.length} mm`,
      value.platform && `${value.platform}-inch`,
      value.shaft,
      value.deliveryMode,
      value.minimumSheathFr && `min ${value.minimumSheathFr} sheath`,
    ].filter(Boolean).join(' • ');
  }
  return summarize(value);
};

function PlanRows({ rows }) {
  const items = rows.filter((row) => row.value);
  if (!items.length) return <p className="summary-empty">{__('Not entered.', 'endoplanner')}</p>;

  return (
    <dl className="plan-grid">
      {items.map((item, index) => (
        <div className="plan-row" key={`${item.label}-${index}`}>
          <dt className="plan-label">{item.label}</dt>
          <dd className="plan-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PlanSection({ title, phase, rows = [], groups = [] }) {
  const headingId = useId();
  return (
    <section className="plan-section" aria-labelledby={headingId} data-plan-phase={phase}>
      <h3 className="plan-section-heading" id={headingId}>
        <span className="plan-section-number" aria-hidden="true">{phase}</span>
        <span>{title}</span>
      </h3>
      {groups.length ? groups.map((group) => (
        <div className={`lesion-plan-group${group.unlinked ? ' lesion-plan-group--unlinked' : ''}`} key={group.id}>
          <h4 className="lesion-plan-title">{group.label}</h4>
          <PlanRows rows={group.rows} />
        </div>
      )) : <PlanRows rows={rows} />}
    </section>
  );
}



function GuidelineModal({ title, isOpen, onRequestClose, recommendations, details, references = [] }) {
  return (
    <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      {details}
      <h3 className="guideline-modal-subtitle">{__('Guideline recommendations', 'endoplanner')}</h3>
      <ul className="guideline-recommendations">
        {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
      </ul>
      <h3 className="guideline-modal-subtitle">{__('References', 'endoplanner')}</h3>
      <p className="guideline-citation">{GVG_CITATION}</p>
      {references.map((reference) => (
        <p className="guideline-citation" key={reference.url}>
          <a href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>
        </p>
      ))}
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
  references: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })),
};

const planRowsType = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}));
PlanRows.propTypes = { rows: planRowsType.isRequired };
PlanSection.propTypes = {
  title: PropTypes.string.isRequired,
  phase: PropTypes.string.isRequired,
  rows: planRowsType,
  groups: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    rows: planRowsType.isRequired,
    unlinked: PropTypes.bool,
  })),
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
  const planFindings = analyzePlan(data);
  const woundAdvice = getWoundosomeAdvice(getActiveWoundLocations(data));
  const patLines = getPatSummaryLines(data.clinical);

  const accessItems = accessRows.flatMap((row) => [
    { label: 'APPROACH', value: [row.approach, row.side, row.vessel].filter(Boolean).join(' ') },
    { label: 'NEEDLE(S)', value: summarize(row.needles) },
    { label: 'SHEATH(S)', value: summarize(row.sheaths) },
    { label: 'CATHETER(S)', value: summarize(row.catheters) },
  ]);

  const navigationItems = (rows) => rows.flatMap((row) => [
    { label: 'WIRE', value: summarize(row.wire) },
    { label: 'CATHETER', value: summarize(row.catheter) },
    { label: 'CROSSING BALLOON', value: formatTherapy(row.balloon) },
    { label: 'SPECIAL', value: summarize(row.device) },
  ]);

  const therapyItems = (rows) => rows.flatMap((row) => [
    { label: 'BALLOON', value: formatTherapy(row.balloon) },
    { label: 'STENT', value: formatTherapy(row.stent) },
    { label: 'SPECIAL', value: summarize(row.device) },
  ]);

  const activeNavRows = navRows.filter(hasPlanItemContent);
  const activeTherapyRows = therapyRows.filter(hasPlanItemContent);
  const lesionOptions = getLesionOptions(patencySegments, data.targetArterialPath || []);
  const scopeOptions = buildScopeOptions(lesionOptions, data.targetArterialPath || [], {
    includeTargetPath: true,
    includeTreatmentZones: true,
  });
  const knownScopeKeys = new Set(scopeOptions.map((option) => option.value));
  const unlinkedNavRows = activeNavRows.filter((row) => !knownScopeKeys.has(scopeKey(row)));
  const unlinkedTherapyRows = activeTherapyRows.filter((row) => !knownScopeKeys.has(scopeKey(row)));
  const planGroups = (rows, describe, unlinked) => {
    const groups = scopeOptions.map((option) => ({
      id: option.value,
      label: option.label,
      rows: describe(rows.filter((row) => scopeKey(row) === option.value)).filter((item) => item.value),
    })).filter((group) => group.rows.length);
    const unlinkedItems = describe(unlinked).filter((item) => item.value);
    if (unlinkedItems.length) groups.push({ id: 'unlinked', label: __('Unlinked plan items', 'endoplanner'), rows: unlinkedItems, unlinked: true });
    return groups;
  };

  const closureItems = closureRows.map((row) => ({
    label: 'CLOSURE',
    value: [row.method, summarize(row.device)].filter(Boolean).join(' • '),
  }));

  return (
    <div id="case-summary" className="summary-card-wrapper case-summary">
      <div className="case-summary-container">
        <header className="case-summary-header">
          <h2 className="case-summary__title">{__('Case summary', 'endoplanner')}</h2>
          {data.patientId?.trim() && <div className="case-summary-patient-id"><span>{__('Patient ID', 'endoplanner')}</span><strong>{data.patientId.trim()}</strong></div>}
        </header>

        <div className="summary-card case-summary__indication">
          <header className="summary-card-heading"><div className="card-title">{__('Clinical indication', 'endoplanner')}</div><button type="button" className="summary-edit-button" aria-label="Edit clinical assessment" onClick={() => setStep?.(0)}>EDIT</button></header>
          <div className={`summary-media-layout${woundAdvice.zones.length ? '' : ' summary-media-layout--text-only'}`}>
            {woundAdvice.zones.length > 0 && <SelectedWoundosomeSummary selectedIds={getActiveWoundLocations(data)} targetPath={data.targetArterialPath || []} imagesOnly />}
            <div className="summary-media-text">
          <div>
            {__('Fontaine stage', 'endoplanner')}: <b>{formatStage(stage)}</b>
          </div>
          {wifi.isApplicable && (
            <div>
              {__('WIfI components', 'endoplanner')}: <b>{wifiCode}</b>
            </div>
          )}
          {patLines.length > 0 && (
            <div className="pat-summary" data-testid="pat-summary">
              {patLines.map((line, index) => <div key={index}>{line}</div>)}
            </div>
          )}
          {woundAdvice.zones.length > 0 && (
            <div className="woundosome-summary" data-testid="woundosome-summary">
              <div><b>{__('Wound location', 'endoplanner')}:</b> {woundAdvice.zones.map((zone) => zone.label).join(', ')}</div>
              <div><b>{__('Wound-informed target arterial path to consider', 'endoplanner')}:</b> {woundAdvice.primaryLabels.join(' or ')}</div>
            </div>
          )}
          {wifi.isApplicable && (wifi.isComplete ? (
            <div className="clinical-guidance wifi-prediction">
              <button type="button" className="guideline-link" onClick={() => setWifiGuidelineOpen(true)}>
                {__('See CLTI guideline prognosis and recommendations', 'endoplanner')}
              </button>
            </div>
          ) : (
            <div className="row-add-label text-red-500">
              {__('Complete wound, ischemia and foot-infection grading before interpreting WIfI.', 'endoplanner')}
            </div>
          ))}
            </div>
          </div>
        </div>

        <div className="summary-card case-summary__anatomy">
          <header className="summary-card-heading"><div className="card-title">{__('Disease anatomy', 'endoplanner')}</div><button type="button" className="summary-edit-button" aria-label="Edit anatomy" onClick={() => setStep?.(1)}>EDIT</button></header>
          <div className={`summary-media-layout${Object.keys(patencySegments).length || data.targetArterialPath?.length ? '' : ' summary-media-layout--text-only'}`}>
            <DiseaseAnatomySummary data={data} />
            <div className="summary-media-text">
          {Object.keys(patencySegments).length ? (
            <ul className="vessel-summary">
              {Object.entries(patencySegments).map(([id, values]) => (
                <li key={id}>
                  <span className="dash-bullet">–</span>
                  <span>
                    <strong>{lesionOptions.find((lesion) => lesion.value === id)?.code} · {lesionVesselName(id, values)}</strong>{' '}
                    {[values.type, lesionLengthLabel(values), calcificationLabel(values.calcium), lesionPositionLabel(values)].filter(Boolean).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{__('No vessel data entered.', 'endoplanner')}</p>
          )}

          <div className="target-path-summary">
            <b>{__('Target arterial path', 'endoplanner')}:</b>{' '}
            {data.targetArterialPath?.length
              ? formatTargetArterialPath(data.targetArterialPath)
              : __('Not selected', 'endoplanner')}
            {data.targetArterialPathNote && (
              <span className="target-path-summary-note">{` — ${data.targetArterialPathNote}`}</span>
            )}
          </div>

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
            </div>
          </div>
        </div>

        <div className="summary-card intervention-plan">
          <header className="summary-card-heading"><div className="card-title main-plan-title">{__('Intervention plan', 'endoplanner')}</div><button type="button" className="summary-edit-button" aria-label="Edit intervention plan" onClick={() => setStep?.(2)}>EDIT</button></header>
          <PlanSection title={__('Access', 'endoplanner')} phase="01" rows={accessItems} />
          <PlanSection title={__('Navigation & crossing', 'endoplanner')} phase="02" groups={planGroups(activeNavRows, navigationItems, unlinkedNavRows)} />
          <PlanSection title={__('Vessel preparation & therapy', 'endoplanner')} phase="03" groups={planGroups(activeTherapyRows, therapyItems, unlinkedTherapyRows)} />
          <PlanSection title={__('Closure', 'endoplanner')} phase="04" rows={closureItems} />

        </div>

        <RecommendationsPanel findings={planFindings} />
      </div>

      {wifi.isComplete && (
        <GuidelineModal
          title={`WIfI clinical stage ${wifi.wifiStage}`}
          isOpen={wifiGuidelineOpen}
          onRequestClose={() => setWifiGuidelineOpen(false)}
          recommendations={getWifiRecommendations(wifi.wifiStage, wifi.ischemia).slice(1)}
          references={woundAdvice.zones.length ? [WOUNDOSOME_REFERENCE] : []}
          details={(
            <div className="guideline-stage-details">
              <p>{`Clinical stage ${wifi.wifiStage}, approximately ${wifiInfo.riskPercent}% pooled estimated 1-year risk of major amputation. ${getWifiAction(wifi.wifiStage, wifi.ischemia)}`}</p>
              <p><b>{wifiInfo.riskCategory} limb-threat category.</b></p>
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
