import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import VesselMap from './VesselMap';
import DeviceGlyph from './UI/DeviceGlyph';
import SelectedWoundosomeSummary from './SelectedWoundosomeSummary';
import PlanReviewButton from './PlanReviewButton';
import { createLesionScope, createTargetPathScope, formatScopeLabel, scopeKey } from '../utils/planScopes';
import { formatTargetArterialPath, sideFromVesselId } from '../utils/lesions';
import { getVisualPlanItems, rowsForPlanScope } from '../utils/visualPlan';

const scopeDescription = (option, targetPath) => {
  if (option.scope.type === 'targetPath') return formatTargetArterialPath(targetPath);
  if (option.lesion) {
    const findings = [
      option.lesion.findings?.type,
      option.lesion.findings?.length && `${option.lesion.findings.length} cm`,
      option.lesion.findings?.calcium && `${option.lesion.findings.calcium} calcium`,
    ].filter(Boolean);
    return findings.join(' • ') || option.lesion.name;
  }
  return option.label;
};

export default function VisualPlanWorkspace({
  targetPath,
  selectedWounds,
  findings,
  lesionOptions,
  zoneOptions,
  navRows,
  therapyRows,
  renderNavigationRows,
  renderTherapyRows,
  addNavigationRow,
  addTherapyRow,
}) {
  const options = useMemo(() => {
    const next = [];
    lesionOptions.forEach((lesion) => {
      next.push({
        code: lesion.code,
        label: lesion.name,
        lesion,
        scope: createLesionScope(lesion.value),
      });
    });
    zoneOptions.forEach((option) => {
      next.push({
        code: formatScopeLabel(option.scope, lesionOptions),
        label: __('Combined treatment zone', 'endoplanner'),
        scope: option.scope,
      });
    });
    return next;
  }, [lesionOptions, zoneOptions]);

  const defaultScopeKey = options.find((option) => option.lesion) ? scopeKey(options.find((option) => option.lesion).scope) : scopeKey(options[0]?.scope || {});
  const [activeScopeKey, setActiveScopeKey] = useState(defaultScopeKey);

  useEffect(() => {
    if (options.some((option) => scopeKey(option.scope) === activeScopeKey)) return;
    setActiveScopeKey(defaultScopeKey);
  }, [activeScopeKey, defaultScopeKey, options]);

  const activeOption = options.find((option) => scopeKey(option.scope) === activeScopeKey) || options[0];
  const activeNavigationRows = activeOption ? rowsForPlanScope(navRows, activeOption.scope) : [];
  const activeTherapyRows = activeOption ? rowsForPlanScope(therapyRows, activeOption.scope) : [];
  const activeLesionId = activeOption?.lesion?.value || '';

  const chooseLesionFromMap = (id) => {
    const option = options.find((item) => item.lesion?.value === id);
    if (option) setActiveScopeKey(scopeKey(option.scope));
  };

  const pathScope = createTargetPathScope();
  const sharedNavigationRows = rowsForPlanScope(navRows, pathScope);

  return (
    <div className="visual-plan-workspace" data-testid="visual-intervention-planner">
      <div className="visual-plan-context">
        <div className="visual-plan-map" aria-label={__('Arterial map with planned devices', 'endoplanner')}>
          <h3>{__('Disease anatomy', 'endoplanner')}</h3>
          <VesselMap
            selectedSegments={lesionOptions.map((lesion) => lesion.value)}
            targetSegments={targetPath}
            planningMode
            planningSegmentIds={lesionOptions.map((lesion) => lesion.value)}
            activePlanningSegment={activeLesionId}
            toggleSegment={chooseLesionFromMap}
          />
          <div className="visual-plan-map-legend" aria-label={__('Anatomy legend', 'endoplanner')}>
            <span><i className="visual-plan-legend-line visual-plan-legend-line--path" aria-hidden="true" />{__('Target path', 'endoplanner')}</span>
            <span><i className="visual-plan-legend-line visual-plan-legend-line--lesion" aria-hidden="true" />{__('Lesion', 'endoplanner')}</span>
          </div>
          <p className="visual-plan-map-note">{__('Select a red lesion to plan it', 'endoplanner')}</p>
        </div>
        <div className="visual-plan-foot-context">
          <SelectedWoundosomeSummary selectedIds={selectedWounds} />
          <section className="visual-plan-target" aria-label={__('Target arterial path information', 'endoplanner')}>
            <h3>{[sideFromVesselId(targetPath[0]), __('Target arterial path', 'endoplanner')].filter(Boolean).join(' · ')}</h3>
            <p>{targetPath.length ? formatTargetArterialPath(targetPath) : __('No target arterial path selected.', 'endoplanner')}</p>
            {(targetPath.length > 0 || sharedNavigationRows.length > 0) && (
              <details className="visual-plan-support" data-testid="shared-route-support">
                <summary>{__('Shared route support', 'endoplanner')}{sharedNavigationRows.length ? ` (${sharedNavigationRows.length})` : ''}</summary>
                <p>{__('Optional support/exchange wires or catheters used across the target route.', 'endoplanner')}</p>
                {renderNavigationRows(sharedNavigationRows)}
                {targetPath.length > 0 && <button type="button" className="planner-nav-btn scoped-add-btn" onClick={() => addNavigationRow(pathScope)}>+ {__('Add support device', 'endoplanner')}</button>}
              </details>
            )}
          </section>
        </div>
      </div>

      <div className="visual-plan-editing">

        <div className="visual-plan-schematic" aria-label={__('Lesion plans at a glance', 'endoplanner')}>
          <div className="visual-plan-schematic-heading">
            <strong>{__('Plan at a glance', 'endoplanner')}</strong>
            <span>{__('Select a row to edit', 'endoplanner')}</span>
          </div>
          {options.map((option) => {
            const scopedNavRows = rowsForPlanScope(navRows, option.scope);
            const scopedTherapyRows = rowsForPlanScope(therapyRows, option.scope);
            const items = getVisualPlanItems(scopedNavRows, scopedTherapyRows);
            const isActive = scopeKey(option.scope) === activeScopeKey;
            return (
              <button
                type="button"
                key={scopeKey(option.scope)}
                className={`visual-scope-summary${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveScopeKey(scopeKey(option.scope))}
                aria-pressed={isActive}
                data-testid={`visual-scope-${option.code.replace(/\s+/g, '-')}`}
              >
                <span className="visual-scope-code">{option.code}</span>
                <span className="visual-scope-body">
                  <strong>{option.label}</strong>
                  {items.length ? (
                    <span className="visual-device-sequence">
                      {items.slice(0, 4).map((item, index) => (
                        <span className="visual-device-chip" key={`${item.type}-${item.label}-${index}`} title={item.label}>
                          <DeviceGlyph type={item.type} />
                          <span>{item.label}</span>
                        </span>
                      ))}
                      {items.length > 4 && <span className="visual-device-more">+{items.length - 4}</span>}
                    </span>
                  ) : (
                    <span className="visual-scope-empty">{__('No devices yet', 'endoplanner')}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

      {activeOption ? <div className="visual-plan-composer" data-testid={`plan-scope-group-${activeOption.code}`}>
        <header className="visual-plan-composer-header">
          <span className="plan-scope-group-code">{activeOption.code}</span>
          <div>
            <span>{__('Now planning', 'endoplanner')}</span>
            <h3>{activeOption.label}</h3>
            <p>{scopeDescription(activeOption, targetPath)}</p>
          </div>
          <PlanReviewButton option={activeOption} description={scopeDescription(activeOption, targetPath)} navRows={activeNavigationRows} therapyRows={activeTherapyRows} findings={findings} />
        </header>

            <div className="quick-plan-stage">
              <div className="quick-plan-stage-heading">
                <span>1</span>
                <div>
                  <h4>{__('Cross', 'endoplanner')}</h4>
                  <p>{__('Wire, support catheter and optional crossing device', 'endoplanner')}</p>
                </div>
              </div>
              {activeNavigationRows.length ? (
                renderNavigationRows(activeNavigationRows)
              ) : (
                <p className="plan-scope-empty">{__('No crossing device selected.', 'endoplanner')}</p>
              )}
              <button type="button" className="planner-nav-btn scoped-add-btn" onClick={() => addNavigationRow(activeOption.scope)}>
                <span aria-hidden="true">+</span>
                {__('Add crossing device', 'endoplanner')}
              </button>
            </div>
            <div className="quick-plan-stage">
              <div className="quick-plan-stage-heading">
                <span>2</span>
                <div>
                  <h4>{__('Prepare & treat', 'endoplanner')}</h4>
                  <p>{__('Balloon, stent and optional adjunctive device', 'endoplanner')}</p>
                </div>
              </div>
              {activeTherapyRows.length ? (
                renderTherapyRows(activeTherapyRows)
              ) : (
                <p className="plan-scope-empty">{__('No treatment device selected.', 'endoplanner')}</p>
              )}
              <button type="button" className="planner-nav-btn scoped-add-btn" onClick={() => addTherapyRow(activeOption.scope)}>
                <span aria-hidden="true">+</span>
                {__('Add treatment device', 'endoplanner')}
              </button>
            </div>
      </div> : <div className="visual-plan-empty">
        <p>{__('Return to Disease anatomy and select a lesion to plan treatment.', 'endoplanner')}</p>
        <PlanReviewButton navRows={navRows} therapyRows={therapyRows} findings={findings} />
      </div>}
      </div>
    </div>
  );
}

VisualPlanWorkspace.propTypes = {
  targetPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedWounds: PropTypes.arrayOf(PropTypes.string).isRequired,
  findings: PropTypes.arrayOf(PropTypes.object).isRequired,
  lesionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  zoneOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  navRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  therapyRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderNavigationRows: PropTypes.func.isRequired,
  renderTherapyRows: PropTypes.func.isRequired,
  addNavigationRow: PropTypes.func.isRequired,
  addTherapyRow: PropTypes.func.isRequired,
};
