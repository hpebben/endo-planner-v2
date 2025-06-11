// src/components/steps/Step2_Patency.jsx

import React, { useState, useEffect } from 'react';
import VesselMap from '../VesselMap';
import SliderModal from '../UI/SliderModal';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const segments = data.patencySegments || {};

  const segmentColors = vesselSegments.reduce((acc, seg) => {
    const vals = segments[seg.id] || { severity: 0 };
    acc[seg.id] = vals.severity >= 100 ? '#d63638' : vals.severity > 0 ? '#f5a623' : '#7fc241';
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
    setActiveSegment(id);
    setModalOpen(true);
  };

  const handleSave = (values) => {
    setData({ ...data, patencySegments: { ...segments, [activeSegment]: values } });
    setModalOpen(false);
    setActiveSegment(null);
  };

  return (
    <div { ...blockProps } className="step2-patency vessel-patency-container">
      <div className="vessel-map-center">
        <VesselMap
          onSegmentClick={handleSegmentClick}
          segmentColors={segmentColors}
        />
      </div>
      <aside className="patency-summary-sidebar">
        <h4>Selected Vessel Data</h4>
        <ul>
          {Object.entries(segments).map(([id, vals]) => (
            <li key={id}>
              <strong>
                {vesselSegments.find((s) => s.id === id)?.name || id}
              </strong>
              : {vals.severity}% stenosis, {vals.length} cm, {vals.calcium}{' '}
              <Button isSecondary onClick={() => {
                setActiveSegment(id);
                setModalOpen(true);
              }}>
                Edit
              </Button>
            </li>
          ))}
          {Object.keys(segments).length === 0 && <li>No segments set yet.</li>}
        </ul>
      </aside>
      <SliderModal
        isOpen={modalOpen}
        segment={activeSegment}
        values={segments[activeSegment] || { severity:0, length:0, calcium:'none' }}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export { vesselSegments };
