// src/components/steps/Step2_Patency.jsx

import React, { useEffect, useState, useRef } from 'react';
import VesselMap from '../VesselMap';
import { Button } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

// List every <g id="..."> exactly as it appears in the SVG
const vesselSegments = [
  { id: 'Aorta_Afbeelding', name: 'Aorta' },
  { id: 'iliac_Afbeelding', name: 'Iliac Artery' },
  { id: 'Left_common_iliac_Afbeelding', name: 'Left Common Iliac' },
  { id: 'Right_common_iliac_Afbeelding', name: 'Right Common Iliac' },
  { id: 'Left_external_iliac_Afbeelding', name: 'Left External Iliac' },
  { id: 'Right_external_iliac_Afbeelding', name: 'Right External Iliac' },
  { id: 'Left_internal_iliac_Afbeelding', name: 'Left Internal Iliac' },
  { id: 'Right_internal_iliac_Afbeelding', name: 'Right Internal Iliac' },
  { id: 'Left_common_femoral_Afbeelding', name: 'Left Common Femoral' },
  { id: 'Right_common_femoral_Afbeelding', name: 'Right Common Femoral' },
  { id: 'Left_superficial_femoral_Afbeelding', name: 'Left Superficial Femoral' },
  { id: 'Right_superficial_femoral_Afbeelding', name: 'Right Superficial Femoral' },
  { id: 'Left_profunda_Afbeelding', name: 'Left Profunda' },
  { id: 'Right_profunda_Afbeelding', name: 'Right Profunda' },
  { id: 'Left_popliteal_artery_Afbeelding', name: 'Left Popliteal' },
  { id: 'Right_popliteal_artery_Afbeelding', name: 'Right Popliteal' },
  { id: 'Left_anterior_tibial_Afbeelding', name: 'Left Anterior Tibial' },
  { id: 'Right_anterior_tibital_Afbeelding', name: 'Right Anterior Tibial' },
  { id: 'Left_peroneal_Afbeelding', name: 'Left Peroneal' },
  { id: 'Right_peroneal_Afbeelding', name: 'Right Peroneal' },
  { id: 'Left_posterior_tibial2_Afbeelding', name: 'Left Posterior Tibial' },
  { id: 'Right_posterior_tibial_Afbeelding', name: 'Right Posterior Tibial' },
  { id: 'crural_Afbeelding', name: 'Crural Trunk' },
  { id: 'Left_dorsal_pedal_Afbeelding', name: 'Left Dorsal Pedal' },
  { id: 'Right_dorsal_pedal_Afbeelding', name: 'Right Dorsal Pedal' },
  { id: 'Left_medial_plantar_Afbeelding', name: 'Left Medial Plantar' },
  { id: 'Left_lateral_plantar_Afbeelding', name: 'Left Lateral Plantar' },
  { id: 'Left_plantar_arch_Afbeelding', name: 'Left Plantar Arch' },
  { id: 'Right_plantar_arch_Afbeelding', name: 'Right Plantar Arch' },
  { id: 'Left_metatarsal_Afbeelding', name: 'Left Metatarsal' },
  { id: 'Right_metatarsal_Afbeelding', name: 'Right Metatarsal' },
  { id: 'pedal_Afbeelding', name: 'Pedal Vessel' },
];

export default function Step2_Patency({ data, setData }) {
  const blockProps = useBlockProps();
  const wrapperRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const segments = data.patencySegments || {};

  const segmentColors = vesselSegments.reduce((acc, seg) => {
    acc[seg.id] = segments[seg.id] ? '#007cba' : '#ccc';
    return acc;
  }, {});

  useEffect(() => {
    Object.entries(segmentColors).forEach(([id, color]) => {
      document.querySelectorAll(`#${id} path`).forEach((el) => {
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', color);
        el.setAttribute('stroke-width', '4');
      });
    });
  }, [segmentColors]);

  const handleSegmentClick = (id) => {
    setData((prev) => {
      const segs = prev.patencySegments || {};
      const updated = { ...segs };
      if (segs[id]) {
        delete updated[id];
      } else {
        updated[id] = segs[id] || { severity: 0, length: 0, calcium: 'none' };
      }
      return { ...prev, patencySegments: updated };
    });
  };

  const handleHover = (id, name, e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      text: name,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top + 10,
    });
  };

  const handleLeave = () => setTooltip({ visible: false, text: '', x: 0, y: 0 });

  return (
    <div {...blockProps} className="step2-patency">
      <div className="patency-container">
        <div className="svg-wrapper" ref={wrapperRef}>
          <VesselMap
            onSegmentClick={handleSegmentClick}
            onSegmentMouseEnter={handleHover}
            onSegmentMouseLeave={handleLeave}
            onSegmentMouseMove={handleHover}
            segmentColors={segmentColors}
          />
          {tooltip.visible && (
            <div
              className="segment-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
        <aside className="patency-summary">
          <h4>Selected Segments</h4>
          <ul>
            {Object.keys(segments).length ? (
              Object.keys(segments).map((id) => (
                <li key={id}>
                  <strong>
                    {vesselSegments.find((s) => s.id === id)?.name || id}
                  </strong>
                  : {segments[id].severity}% / {segments[id].length} cm{' '}
                  <Button
                    isSecondary
                    onClick={() => handleSegmentClick(id)}
                  >
                    Remove
                  </Button>
                </li>
              ))
            ) : (
              <li>No segments selected.</li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export { vesselSegments };
