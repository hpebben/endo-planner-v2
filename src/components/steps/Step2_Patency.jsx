import React, { useState, useEffect, useRef } from 'react';
import VesselMap from '../VesselMap';
import ParameterPopup from '../UI/ParameterPopup';
import SegmentedControl from '../UI/SegmentedControl';
import { __ } from '@wordpress/i18n';
import rawVesselData from '../../assets/vessel-map.json';
import {
  buildTargetArterialPath,
  buildTargetPathToSegment,
  getLesionOptions,
  inferTargetPathKey,
  shortVesselName,
  sideFromVesselId,
  TARGET_PATH_OPTIONS,
  TARGET_ROUTE_ENDPOINT_IDS,
  validateTargetArterialPath,
} from '../../utils/lesions';
import { getWoundosomeAdvice } from '../../data/woundosome';

// Parse vessel-map JSON
const parseVesselData = (data) => {
  if (Array.isArray(data?.segments)) return data.segments;
  if (Array.isArray(data)) return data;
  return null;
};

const vesselSegments = parseVesselData(rawVesselData) || [];
export { vesselSegments };

export default function Step2_Patency({ data, setData }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);

  const handleTooltip = (tip) => {
    if (tip) {
      setTooltip(tip);
      setTooltipVisible(true);
    } else {
      setTooltipVisible(false);
    }
  };
  const [activeSegment, setActiveSegment] = useState(null);
  const [showInstruction, setShowInstruction] = useState(true);

  const selectedSegments = Object.keys(data.patencySegments || {});
  const selectedSides = [...new Set(selectedSegments.map(sideFromVesselId).filter(Boolean))];
  const savedTargetPath = Array.isArray(data.targetArterialPath) ? data.targetArterialPath : [];
  const savedTargetSide = data.targetArterialPathSide || sideFromVesselId(savedTargetPath[0]);
  const [targetSide, setTargetSide] = useState(savedTargetSide || (selectedSides.length === 1 ? selectedSides[0] : ''));
  const [routeEditMode, setRouteEditMode] = useState(false);
  const [draftTargetPath, setDraftTargetPath] = useState(savedTargetPath);
  const [routeEditMessage, setRouteEditMessage] = useState('');
  const [routeNote, setRouteNote] = useState(data.targetArterialPathNote || '');
  const selectedTargetKey = data.targetArterialPathKey || inferTargetPathKey(savedTargetPath);
  const activeTargetPath = routeEditMode ? draftTargetPath : savedTargetPath;
  const activeTargetKey = routeEditMode ? inferTargetPathKey(draftTargetPath) : selectedTargetKey;
  const activePathValidation = validateTargetArterialPath(activeTargetPath);
  const lesionOptions = getLesionOptions(data.patencySegments || {}, savedTargetPath);
  const lesionById = new Map(lesionOptions.map((lesion) => [lesion.value, lesion]));
  const endpointCandidates = TARGET_ROUTE_ENDPOINT_IDS.filter((id) => sideFromVesselId(id) === targetSide);
  const woundAdvice = getWoundosomeAdvice(data.clinical?.woundLocations || []);

  useEffect(() => {
    if (!targetSide && selectedSides.length === 1) setTargetSide(selectedSides[0]);
  }, [selectedSides.join('|'), targetSide]);

  useEffect(() => {
    if (!routeEditMode) setDraftTargetPath(savedTargetPath);
  }, [savedTargetPath.join('|'), routeEditMode]);

  // Adjust tooltip position once it is rendered and handle fade out
  useEffect(() => {
    if (!tooltip) return;
    if (!tooltipVisible) {
      const timeout = setTimeout(() => setTooltip(null), 200);
      return () => clearTimeout(timeout);
    }

    if (tooltipRef.current) {
      const tipRect = tooltipRef.current.getBoundingClientRect();
      const { side, x, y } = tooltip;
      const { segRect, wrapperRect } = tooltip;
      const placement = {
        side,
        x,
        y,
      };

      // Recalculate with actual tooltip dimensions
      const margin = 8;
      if (side === 'left' && x - tipRect.width < 0) {
        if (segRect.right - wrapperRect.left + margin + tipRect.width <= wrapperRect.width) {
          placement.side = 'right';
          placement.x = segRect.right - wrapperRect.left + margin;
        } else {
          placement.x = tipRect.width;
        }
      } else if (side === 'right' && x + tipRect.width > wrapperRect.width) {
        if (segRect.left - wrapperRect.left - margin - tipRect.width >= 0) {
          placement.side = 'left';
          placement.x = segRect.left - wrapperRect.left - margin;
        } else {
          placement.x = wrapperRect.width - tipRect.width;
        }
      }

      if (placement.y - tipRect.height / 2 < 0) {
        placement.y = tipRect.height / 2;
      } else if (placement.y + tipRect.height / 2 > wrapperRect.height) {
        placement.y = wrapperRect.height - tipRect.height / 2;
      }

      if (
        placement.x !== tooltip.x ||
        placement.y !== tooltip.y ||
        placement.side !== tooltip.side
      ) {
        setTooltip((prev) => prev && { ...prev, ...placement });
      }
    }
  }, [tooltip, tooltipVisible]);

  const openSegment = (id) => {
    setActiveSegment(id);
    setShowInstruction(false);
  };

  const saveSegment = (vals) => {
    setData((prev) => ({
      ...prev,
      patencySegments: {
        ...(prev.patencySegments || {}),
        [activeSegment]: vals,
      },
    }));
    setActiveSegment(null);
  };

  const removeSegment = (id) => {
    setData((prev) => {
      const nextSegments = { ...(prev.patencySegments || {}) };
      delete nextSegments[id];
      return { ...prev, patencySegments: nextSegments };
    });
    if (activeSegment === id) setActiveSegment(null);
  };

  const chooseTargetPath = (targetKey) => {
    if (!targetSide) return;
    const path = buildTargetArterialPath(targetSide, targetKey);
    setData((prev) => ({
      ...prev,
      targetArterialPath: path,
      targetArterialPathKey: targetKey,
      targetArterialPathSide: targetSide,
    }));
    setRouteEditMode(false);
    setRouteEditMessage('');
  };

  const beginRouteEdit = () => {
    if (!targetSide) return;
    const initialPath = savedTargetPath.length
      ? savedTargetPath
      : buildTargetArterialPath(targetSide, selectedTargetKey || 'anterior');
    setDraftTargetPath(initialPath);
    setRouteNote(data.targetArterialPathNote || '');
    setRouteEditMessage('Choose the intended distal target directly on the arterial map.');
    setRouteEditMode(true);
    setActiveSegment(null);
  };

  const chooseRouteEndpoint = (endpointId) => {
    const path = buildTargetPathToSegment(targetSide, endpointId);
    if (!path.length) {
      setRouteEditMessage('Choose an infrapopliteal or pedal endpoint on the planned limb.');
      return;
    }
    setDraftTargetPath(path);
    setRouteEditMessage(`Proposed continuous route to ${shortVesselName(endpointId)}.`);
  };

  const saveEditedRoute = () => {
    const validation = validateTargetArterialPath(draftTargetPath);
    if (!validation.isValid) {
      setRouteEditMessage(validation.reason);
      return;
    }
    setData((prev) => ({
      ...prev,
      targetArterialPath: draftTargetPath,
      targetArterialPathKey: inferTargetPathKey(draftTargetPath),
      targetArterialPathSide: validation.side,
      targetArterialPathNote: routeNote.trim(),
    }));
    setRouteEditMode(false);
    setRouteEditMessage('');
  };

  const cancelRouteEdit = () => {
    setDraftTargetPath(savedTargetPath);
    setRouteNote(data.targetArterialPathNote || '');
    setRouteEditMode(false);
    setRouteEditMessage('');
  };

  const clearTargetPath = () => {
    setData((prev) => ({
      ...prev,
      targetArterialPath: [],
      targetArterialPathKey: '',
      targetArterialPathSide: '',
      targetArterialPathNote: '',
    }));
    setDraftTargetPath([]);
    setRouteEditMode(false);
    setRouteEditMessage('');
  };

  return (
    <div className="step2-patency">
      <div className="patency-container">
        <div className="vessel-column">
          <div className="svg-wrapper patency-svg vessel-map-wrapper">
            <VesselMap
              selectedSegments={selectedSegments}
              targetSegments={activeTargetPath}
              targetEndpointCandidates={endpointCandidates}
              routeEditMode={routeEditMode}
              toggleSegment={routeEditMode ? chooseRouteEndpoint : openSegment}
              setTooltip={handleTooltip}
            />
            {routeEditMode && (
              <div className="route-edit-map-badge" role="status">
                {__('Editing target route', 'endoplanner')}
              </div>
            )}
            {tooltip && (
              <div
                ref={tooltipRef}
                className={`vessel-tooltip ${tooltip.side} ${tooltipVisible ? 'visible' : ''}`}
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.name}
              </div>
            )}
          </div>
        </div>

        <div className="controls-column">
          {selectedSegments.length > 0 && (
            <div className="summary-box selected-segments">
              <h4>{__('Selected segments', 'endoplanner')}</h4>
              <ul className="vessel-summary arrow-list">
                {selectedSegments.map((id) => {
                  const seg = vesselSegments.find((s) => s.id === id);
                  const name = seg ? seg.name : id;
                  const lesion = lesionById.get(id);
                  const vals = data.patencySegments[id] || {};
                  const lengthMap = {
                    '<3': '<3cm',
                    '3-10': '3\u201310cm',
                    '10-15': '10\u201315cm',
                    '15-20': '15\u201320cm',
                    '>20': '>20cm',
                  };
                  const lengthLabel = lengthMap[vals.length] || vals.length;
                  const summary = `${vals.type || ''} | ${lengthLabel} | ${vals.calcium}`;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="segment-edit-trigger"
                        onClick={() => openSegment(id)}
                      >
                        <span className="lesion-code-chip">{lesion?.code}</span>
                        <strong>{name}</strong>{' '}
                        <span className="segment-summary">({summary})</span>
                      </button>
                      <button
                        type="button"
                        className="segment-delete-btn"
                        onClick={() => removeSegment(id)}
                        aria-label={`Remove ${name}`}
                        title={__('Remove segment', 'endoplanner')}
                      >
                        &times;
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {selectedSegments.length > 0 && (
          <div className="target-path-panel" data-testid="target-path-selector">
            <div className="target-path-heading">
              <div>
                <h4>{__('Target arterial path', 'endoplanner')}</h4>
                <p>{__('Select the intended inline route to the foot. The blue outline is used for GLASS and lesion-linked planning.', 'endoplanner')}</p>
              </div>
              <div className="target-path-actions">
                {routeEditMode ? (
                  <>
                    <button type="button" className="target-path-clear" onClick={cancelRouteEdit}>
                      {__('Cancel', 'endoplanner')}
                    </button>
                    <button
                      type="button"
                      className="target-path-save"
                      onClick={saveEditedRoute}
                      disabled={!activePathValidation.isValid}
                    >
                      {__('Use route', 'endoplanner')}
                    </button>
                  </>
                ) : (
                  <>
                    {targetSide && (
                      <button type="button" className="target-path-edit" onClick={beginRouteEdit}>
                        {__('Edit on map', 'endoplanner')}
                      </button>
                    )}
                    {savedTargetPath.length > 0 && (
                      <button type="button" className="target-path-clear" onClick={clearTargetPath}>
                        {__('Clear', 'endoplanner')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {(selectedSides.length > 1 || !targetSide) && (
              <div className="target-path-side">
                <span>{__('Planned limb', 'endoplanner')}</span>
                <SegmentedControl
                  options={['Left', 'Right'].map((side) => ({ label: side, value: side }))}
                  value={targetSide}
                  onChange={(side) => {
                    setTargetSide(side);
                    if (activeTargetKey) {
                      const path = buildTargetArterialPath(side, activeTargetKey);
                      setDraftTargetPath(path);
                      if (!routeEditMode) {
                        setData((prev) => ({
                          ...prev,
                          targetArterialPath: path,
                          targetArterialPathKey: activeTargetKey,
                          targetArterialPathSide: side,
                        }));
                      }
                    }
                  }}
                  ariaLabel={__('Planned limb', 'endoplanner')}
                />
              </div>
            )}

            <div className="target-path-options" role="radiogroup" aria-label={__('Distal target artery', 'endoplanner')}>
              {TARGET_PATH_OPTIONS.map((option) => {
                const selected = activeTargetKey === option.key && Boolean(activeTargetPath.length);
                const woundSuggested = woundAdvice.isSuggested(option.key);
                const woundAlternative = woundAdvice.isAlternative(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`target-path-option${selected ? ' is-selected' : ''}${woundSuggested ? ' is-wound-suggested' : ''}`}
                    onClick={() => chooseTargetPath(option.key)}
                    disabled={!targetSide || routeEditMode}
                  >
                    <strong>{option.shortLabel}</strong>
                    <span>{option.description}</span>
                    {woundSuggested && <em>{__('Woundosome route to consider', 'endoplanner')}</em>}
                    {!woundSuggested && woundAlternative && <em>{__('Collateral route to assess', 'endoplanner')}</em>}
                  </button>
                );
              })}
            </div>

            {routeEditMode && (
              <div className="target-path-editor" data-testid="target-path-editor">
                <strong>{__('Choose the distal endpoint on the map', 'endoplanner')}</strong>
                <span>{__('EndoPlanner will draw and validate the continuous route from the common femoral artery. Lesion editing is paused until the route is saved or cancelled.', 'endoplanner')}</span>
                <label>
                  <span>{__('Variant, bypass or route note (optional)', 'endoplanner')}</span>
                  <input
                    type="text"
                    value={routeNote}
                    onChange={(event) => setRouteNote(event.target.value)}
                    placeholder={__('e.g. prior bypass used as inflow', 'endoplanner')}
                  />
                </label>
                <p className={activePathValidation.isValid ? 'route-edit-valid' : 'route-edit-error'}>
                  {routeEditMessage || activePathValidation.reason}
                </p>
              </div>
            )}

            {activeTargetPath.length > 0 ? (
              <div className="target-path-route" aria-live="polite">
                <span className="target-path-swatch" aria-hidden="true" />
                <ol className="target-path-breadcrumb" aria-label={__('Selected target route', 'endoplanner')}>
                  {activeTargetPath.map((id) => <li key={id}>{shortVesselName(id)}</li>)}
                </ol>
              </div>
            ) : (
              <p className="target-path-empty">{__('No target path selected. GLASS will remain incomplete.', 'endoplanner')}</p>
            )}
            {!routeEditMode && data.targetArterialPathNote && (
              <p className="target-path-note"><b>{__('Route note', 'endoplanner')}:</b> {data.targetArterialPathNote}</p>
            )}
          </div>
          )}

          {activeSegment && (
            <ParameterPopup
              segmentName={
                vesselSegments.find((s) => s.id === activeSegment)?.name ||
                activeSegment
              }
              initialValues={data.patencySegments?.[activeSegment] || {}}
              onSave={saveSegment}
              onCancel={() => {
                setActiveSegment(null);
              }}
            />
          )}

          {(showInstruction || selectedSegments.length === 0) && !routeEditMode && selectedSegments.length === 0 && (
            <div className="instruction-box">
              {__(
                'Select affected segments and specify patency, length and level of calcification.',
                'endoplanner'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
