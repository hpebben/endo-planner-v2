// src/components/steps/Step2_Patency.jsx

import React, { useState, useEffect } from 'react';
import VesselMap from '../VesselMap';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import rawVesselData from '../../assets/vessel-map.json';

// Parse vessel-map JSON in the same way as the map component
const parseVesselData = (data) => {
  if (Array.isArray(data?.segments)) {
    return data.segments;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return null;
};

const vesselSegments = parseVesselData(rawVesselData) || [];


export { vesselSegments };

export default function Step2_Patency({ data, setData }) {
  const blockProps = useBlockProps();
  const [tooltip, setTooltip] = useState(null);
  const selectedSegments = Object.keys(data.patencySegments || {});

  useEffect(() => {
    if (tooltip) {
      console.log('Render tooltip for', tooltip.name, tooltip);
    } else {
      console.log('Tooltip cleared');
    }
  }, [tooltip]);

  const toggleSegment = (id) => {
    setData((prev) => {
      const segs = prev.patencySegments || {};
      if (segs[id]) {
        const updated = { ...segs };
        delete updated[id];
        return { ...prev, patencySegments: updated };
      }
      return {
        ...prev,
        patencySegments: {
          ...segs,
          [id]: { severity: 0, length: 0, calcium: 'none' },
        },
      };
    });
  };

  return (
    <div {...blockProps} className="step2-patency">
      <div className="patency-container">
        <div className="svg-wrapper patency-svg vessel-map-wrapper">
          <VesselMap
            selectedSegments={selectedSegments}
            toggleSegment={toggleSegment}
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
        <div className="summary-box selected-segments">
          <h4>{__('Selected segments', 'endoplanner')}</h4>
          {selectedSegments.length ? (
            <ul className="vessel-summary arrow-list">
              {selectedSegments.map((id) => {
                const seg = vesselSegments.find((s) => s.id === id);
                const name = seg ? seg.name : id;
                return <li key={id}>{name}</li>;
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
