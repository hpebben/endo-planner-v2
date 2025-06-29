import React, { useState, useEffect, useRef } from 'react';
import VesselMap from '../VesselMap';
import ParameterPopup from '../UI/ParameterPopup';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import rawVesselData from '../../assets/vessel-map.json';

// Parse vessel-map JSON
const parseVesselData = (data) => {
  if (Array.isArray(data?.segments)) return data.segments;
  if (Array.isArray(data)) return data;
  return null;
};

const vesselSegments = parseVesselData(rawVesselData) || [];
export { vesselSegments };

export default function Step2_Patency({ data, setData }) {
  const blockProps = useBlockProps();
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

  return (
    <div {...blockProps} className="step2-patency">
      <div className="patency-container">
        <div className="vessel-column">
          <div className="svg-wrapper patency-svg vessel-map-wrapper">
            <VesselMap
              selectedSegments={selectedSegments}
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
                      <strong>{name}</strong>{' '}
                      <span
                        className="segment-summary"
                        onClick={() => openSegment(id)}
                      >
                        ({summary})
                      </span>
                    </li>
                  );
                })}
              </ul>
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
