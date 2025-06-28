import React, { useState, useEffect } from 'react';
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
  const [activeSegment, setActiveSegment] = useState(null);
  const [showInstruction, setShowInstruction] = useState(true);

  const selectedSegments = Object.keys(data.patencySegments || {});

  useEffect(() => {
    if (tooltip) {
      console.log('Render tooltip for', tooltip.name, tooltip);
    } else {
      console.log('Tooltip cleared');
    }
  }, [tooltip]);

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
              setTooltip={setTooltip}
            />
            {tooltip && (
              <div
                className={`vessel-tooltip ${tooltip.side}`}
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
