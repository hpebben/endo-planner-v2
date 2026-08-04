import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import VesselMap from './VesselMap';
import DeviceGlyph from './UI/DeviceGlyph';
import { createLesionScope, createTargetPathScope, formatScopeLabel, scopeKey } from '../utils/planScopes';
import { formatTargetArterialPath } from '../utils/lesions';
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
    if (targetPath.length) {
      next.push({
        code: 'PATH',
        label: __('Target arterial path', 'endoplanner'),
        scope: createTargetPathScope(),
      });
    }
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
  }, [targetPath, lesionOptions, zoneOptions]);

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

  if (!options.length) {
    return <div className="visual-plan-empty">{__('Return to Disease anatomy and select at least one lesion or target arterial path.', 'endoplanner')}</div>;
  }

  return (
    <div className="visual-plan-workspace" data-testid="visual-intervention-planner">
      <div className="visual-plan-context">
        <div className="visual-plan-map" aria-label={__('Arterial map with planned devices', 'endoplanner')}>
          <VesselMap
            selectedSegments={lesionOptions.map((lesion) => lesion.value)}
            targetSegments={targetPath}
            planningMode
            planningSegmentIds={lesionOptions.map((lesion) => lesion.value)}
            activePlanningSegment={activeLesionId}
            toggleSegment={chooseLesionFromMap}
          />
          <div className="visual-plan-map-note">
            <span className="visual-plan-route-key" aria-hidden="true" />
            {__('Blue = target path · red = lesion · click a lesion to plan it', 'endoplanner')}
          </div>
        </div>

        <div className="visual-plan-schematic" aria-label={__('Device plan beside arterial tree', 'endoplanner')}>
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
      </div>

      <div className="visual-plan-composer" data-testid={`plan-scope-group-${activeOption.code}`}>
        <header className="visual-plan-composer-header">
          <span className="plan-scope-group-code">{activeOption.code}</span>
          <div>
            <span>{__('Now planning', 'endoplanner')}</span>
            <h3>{activeOption.label}</h3>
            <p>{scopeDescription(activeOption, targetPath)}</p>
          </div>
        </header>

        {activeOption.scope.type === 'targetPath' ? (
          <div className="quick-plan-stage">
            <div className="quick-plan-stage-heading">
              <span>1</span>
              <div>
                <h4>{__('Route support', 'endoplanner')}</h4>
                <p>{__('Support/exchange wire, support catheter or path-level device', 'endoplanner')}</p>
              </div>
            </div>
            {activeNavigationRows.length ? (
              renderNavigationRows(activeNavigationRows)
            ) : (
              <p className="plan-scope-empty">{__('No path-level support device selected.', 'endoplanner')}</p>
            )}
            <button type="button" className="planner-nav-btn scoped-add-btn" onClick={() => addNavigationRow(activeOption.scope)}>
              <span aria-hidden="true">+</span>
              {__('Add support device', 'endoplanner')}
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

VisualPlanWorkspace.propTypes = {
  targetPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  lesionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  zoneOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  navRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  therapyRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderNavigationRows: PropTypes.func.isRequired,
  renderTherapyRows: PropTypes.func.isRequired,
  addNavigationRow: PropTypes.func.isRequired,
  addTherapyRow: PropTypes.func.isRequired,
};
