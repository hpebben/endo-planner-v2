// src/components/steps/Step2_Patency.jsx

import React, { useState } from 'react';
import VesselMap from '../VesselMap';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

// List every <g id="..."> exactly as it appears in the SVG
const vesselSegments = [
  { id: 'Aorta_Afbeelding', name: 'Aorta' },
  { id: 'iliac_Afbeelding', name: 'Iliac Artery' },
  { id: 'Left_common_iliac_Afbeelding', name: 'Left Common Iliac' },
  { id: 'Right_common_iliac_Afbeelding', name: 'Right Common Iliac' },
  { id: 'Left_external_iliac_Afbeelding', name: 'Left External Iliac' },
  // Note: there is a typo in the SVG id ("extrnal"), match it exactly
  { id: 'Right_extrnal_iliac_Afbeelding', name: 'Right External Iliac' },
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


export { vesselSegments };

export default function Step2_Patency({ data, setData }) {
  const blockProps = useBlockProps();
  const [tooltip, setTooltip] = useState(null);
  const selectedSegments = Object.keys(data.patencySegments || {});
  const selectedNames = selectedSegments.map(
    (id) => vesselSegments.find((s) => s.id === id)?.name || id
  );

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
              className="vessel-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.name}
            </div>
          )}
        </div>
        <div className="summary-box">
          {selectedNames.length ? (
            <ul>
              {selectedNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : (
            __('No segments selected.', 'endoplanner')
          )}
        </div>
      </div>
    </div>
  );
}
