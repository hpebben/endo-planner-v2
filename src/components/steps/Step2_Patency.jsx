import React, { useState, useEffect, useRef } from 'react';
import VesselMap from '../VesselMap';
import ParameterPopup from '../UI/ParameterPopup';
import SegmentedControl from '../UI/SegmentedControl';
import { __ } from '@wordpress/i18n';
import rawVesselData from '../../assets/vessel-map.json';
import {
  buildTargetArterialPath,
  formatTargetArterialPath,
  inferTargetPathKey,
  sideFromVesselId,
  TARGET_PATH_OPTIONS,
} from '../../utils/lesions';

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
  const selectedTargetKey = data.targetArterialPathKey || inferTargetPathKey(savedTargetPath);

  useEffect(() => {
    if (!targetSide && selectedSides.length === 1) setTargetSide(selectedSides[0]);
  }, [selectedSides.join('|'), targetSide]);

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
  };

  const clearTargetPath = () => {
    setData((prev) => ({
      ...prev,
      targetArterialPath: [],
      targetArterialPathKey: '',
      targetArterialPathSide: '',
    }));
  };

  return (
    <div className="step2-patency">
      <div className="patency-container">
        <div className="vessel-column">
          <div className="svg-wrapper patency-svg vessel-map-wrapper">
            <VesselMap
              selectedSegments={selectedSegments}
              targetSegments={savedTargetPath}
              toggleSegment={(id) => openSegment(id)}
              setTooltip={handleTooltip}
            />
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

          <div className="target-path-panel" data-testid="target-path-selector">
            <div className="target-path-heading">
              <div>
                <h4>{__('Target arterial path', 'endoplanner')}</h4>
                <p>{__('Select the intended inline route to the foot. The blue outline is used for GLASS and lesion-linked planning.', 'endoplanner')}</p>
              </div>
              {savedTargetPath.length > 0 && (
                <button type="button" className="target-path-clear" onClick={clearTargetPath}>
                  {__('Clear', 'endoplanner')}
                </button>
              )}
            </div>

            {(selectedSides.length > 1 || !targetSide) && (
              <div className="target-path-side">
                <span>{__('Planned limb', 'endoplanner')}</span>
                <SegmentedControl
                  options={['Left', 'Right'].map((side) => ({ label: side, value: side }))}
                  value={targetSide}
                  onChange={(side) => {
                    setTargetSide(side);
                    if (selectedTargetKey) {
                      const path = buildTargetArterialPath(side, selectedTargetKey);
                      setData((prev) => ({
                        ...prev,
                        targetArterialPath: path,
                        targetArterialPathKey: selectedTargetKey,
                        targetArterialPathSide: side,
                      }));
                    }
                  }}
                  ariaLabel={__('Planned limb', 'endoplanner')}
                />
              </div>
            )}

            <div className="target-path-options" role="radiogroup" aria-label={__('Distal target artery', 'endoplanner')}>
              {TARGET_PATH_OPTIONS.map((option) => {
                const selected = selectedTargetKey === option.key && Boolean(savedTargetPath.length);
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`target-path-option${selected ? ' is-selected' : ''}`}
                    onClick={() => chooseTargetPath(option.key)}
                    disabled={!targetSide}
                  >
                    <strong>{option.shortLabel}</strong>
                    <span>{option.description}</span>
                  </button>
                );
              })}
            </div>

            {savedTargetPath.length > 0 ? (
              <div className="target-path-route" aria-live="polite">
                <span className="target-path-swatch" aria-hidden="true" />
                <span>{formatTargetArterialPath(savedTargetPath)}</span>
              </div>
            ) : (
              <p className="target-path-empty">{__('No target path selected. GLASS will remain incomplete.', 'endoplanner')}</p>
            )}
          </div>

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

          {showInstruction && (
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
