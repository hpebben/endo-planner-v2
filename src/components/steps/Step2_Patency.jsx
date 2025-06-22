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

  const selectedSegments = Object.keys(data.patencySegments || {});

  useEffect(() => {
    if (tooltip) {
      console.log('Render tooltip for', tooltip.name, tooltip);
    } else {
      console.log('Tooltip cleared');
    }
  }, [tooltip]);

  const openSegment = (id) => setActiveSegment(id);

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
        <div className="svg-wrapper patency-svg vessel-map-wrapper">
          <VesselMap
            selectedSegments={selectedSegments}
            toggleSegment={openSegment}
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
        {activeSegment && (
          <ParameterPopup
            segmentName={
              vesselSegments.find((s) => s.id === activeSegment)?.name ||
              activeSegment
            }
            initialValues={data.patencySegments?.[activeSegment] || {}}
            onSave={saveSegment}
            onCancel={() => setActiveSegment(null)}
          />
        )}
        <div className="summary-box selected-segments">
          <h4>{__('Selected segments', 'endoplanner')}</h4>
          {selectedSegments.length ? (
            <ul className="vessel-summary arrow-list">
              {selectedSegments.map((id) => {
                const seg = vesselSegments.find((s) => s.id === id);
                const name = seg ? seg.name : id;
                const vals = data.patencySegments[id] || {};
                const summary = `${vals.type || ''} | ${vals.length} | ${vals.calcium}`;
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
          ) : (
            __('No segments selected.', 'endoplanner')
          )}
        </div>
      </div>
    </div>
  );
}
