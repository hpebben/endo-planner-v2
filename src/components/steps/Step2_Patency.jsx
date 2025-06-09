// src/components/steps/Step2_Patency.jsx

import React, { useState, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import SliderModal from '../UI/SliderModal';
import VesselMap from '../VesselMap';

// List every <g id="..."> exactly as it appears in the SVG
const vesselSegments = [
  { id: 'Aorta_Afbeelding', name: __( 'Aorta', 'endoplanner' ) },
  { id: 'iliac_Afbeelding', name: __( 'Iliac Artery', 'endoplanner' ) },
  { id: 'Left_common_iliac_Afbeelding', name: __( 'Left Common Iliac', 'endoplanner' ) },
  { id: 'Right_common_iliac_Afbeelding', name: __( 'Right Common Iliac', 'endoplanner' ) },
  { id: 'Left_external_iliac_Afbeelding', name: __( 'Left External Iliac', 'endoplanner' ) },
  { id: 'Right_external_iliac_Afbeelding', name: __( 'Right External Iliac', 'endoplanner' ) },
  { id: 'Left_internal_iliac_Afbeelding', name: __( 'Left Internal Iliac', 'endoplanner' ) },
  { id: 'Right_internal_iliac_Afbeelding', name: __( 'Right Internal Iliac', 'endoplanner' ) },
  { id: 'Left_common_femoral_Afbeelding', name: __( 'Left Common Femoral', 'endoplanner' ) },
  { id: 'Right_common_femoral_Afbeelding', name: __( 'Right Common Femoral', 'endoplanner' ) },
  { id: 'Left_superficial_femoral_Afbeelding', name: __( 'Left Superficial Femoral', 'endoplanner' ) },
  { id: 'Right_superficial_femoral_Afbeelding', name: __( 'Right Superficial Femoral', 'endoplanner' ) },
  { id: 'Left_profunda_Afbeelding', name: __( 'Left Profunda', 'endoplanner' ) },
  { id: 'Right_profunda_Afbeelding', name: __( 'Right Profunda', 'endoplanner' ) },
  { id: 'Left_popliteal_artery_Afbeelding', name: __( 'Left Popliteal', 'endoplanner' ) },
  { id: 'Right_popliteal_artery_Afbeelding', name: __( 'Right Popliteal', 'endoplanner' ) },
  { id: 'Left_anterior_tibial_Afbeelding', name: __( 'Left Anterior Tibial', 'endoplanner' ) },
  { id: 'Right_anterior_tibital_Afbeelding', name: __( 'Right Anterior Tibial', 'endoplanner' ) },
  { id: 'Left_peroneal_Afbeelding', name: __( 'Left Peroneal', 'endoplanner' ) },
  { id: 'Right_peroneal_Afbeelding', name: __( 'Right Peroneal', 'endoplanner' ) },
  { id: 'Left_posterior_tibial2_Afbeelding', name: __( 'Left Posterior Tibial', 'endoplanner' ) },
  { id: 'Right_posterior_tibial_Afbeelding', name: __( 'Right Posterior Tibial', 'endoplanner' ) },
  { id: 'crural_Afbeelding', name: __( 'Crural Trunk', 'endoplanner' ) },
  { id: 'Left_dorsal_pedal_Afbeelding', name: __( 'Left Dorsal Pedal', 'endoplanner' ) },
  { id: 'Right_dorsal_pedal_Afbeelding', name: __( 'Right Dorsal Pedal', 'endoplanner' ) },
  { id: 'Left_medial_plantar_Afbeelding', name: __( 'Left Medial Plantar', 'endoplanner' ) },
  { id: 'Left_lateral_plantar_Afbeelding', name: __( 'Left Lateral Plantar', 'endoplanner' ) },
  { id: 'Left_plantar_arch_Afbeelding', name: __( 'Left Plantar Arch', 'endoplanner' ) },
  { id: 'Right_plantar_arch_Afbeelding', name: __( 'Right Plantar Arch', 'endoplanner' ) },
  { id: 'Left_metatarsal_Afbeelding', name: __( 'Left Metatarsal', 'endoplanner' ) },
  { id: 'Right_metatarsal_Afbeelding', name: __( 'Right Metatarsal', 'endoplanner' ) },
  { id: 'pedal_Afbeelding', name: __( 'Pedal Vessel', 'endoplanner' ) },
];

export default function Step2({ data, setData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const segments = data.patencySegments || {};

  // refs for each vessel segment
  const segmentRefs = useMemo(() => {
    const refs = {};
    vesselSegments.forEach((seg) => {
      refs[seg.id] = React.createRef();
    });
    return refs;
  }, []);

  const segmentColors = useMemo(() => {
    const colors = {};
    vesselSegments.forEach((seg) => {
      const vals = segments[seg.id] || { severity: 0 };
      colors[seg.id] =
        vals.severity >= 100 ? '#d63638' :
        vals.severity > 0   ? '#f5a623' :
                              '#7fc241';
    });
    return colors;
  }, [segments]);

  const handleSegmentClick = (id) => {
    setActiveSegment(id);
    setModalOpen(true);
  };

  // Called when user clicks “Save” in the SliderModal
  const handleSave = (values) => {
    const updated = {
      ...segments,
      [activeSegment]: values,
    };
    setData({ ...data, patencySegments: updated });
    setModalOpen(false);
    setActiveSegment(null);
  };

  return (
    <div className="step2-patency">
      <div className="vessel-map-wrapper">
          <VesselMap
            segmentRefs={segmentRefs}
            segmentColors={segmentColors}
            onSegmentClick={handleSegmentClick}
          />
      </div>

      <SliderModal
        isOpen={modalOpen}
        segment={activeSegment}
        values={segments[activeSegment] || {
          severity: 0,
          length: 0,
          calcium: 'none',
        }}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <aside className="patency-summary-sidebar">
        <h4>{ __( 'Selected Vessel Data', 'endoplanner' ) }</h4>
        <ul>
          {Object.entries(segments).map(([id, vals]) => (
            <li key={id}>
              <strong>
                {vesselSegments.find((s) => s.id === id)?.name || id}
              </strong>
              : {vals.severity}% stenosis, {vals.length} cm, {vals.calcium}{' '}
              <button
                onClick={() => {
                  setActiveSegment(id);
                  setModalOpen(true);
                }}
              >
                { __( 'Edit', 'endoplanner' ) }
              </button>
            </li>
          ))}
          {Object.keys(segments).length === 0 && <li>{ __( 'No segments set yet.', 'endoplanner' ) }</li>}
        </ul>
      </aside>
    </div>
  );
}
