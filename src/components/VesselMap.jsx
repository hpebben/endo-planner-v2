import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as VesselSVG } from '../assets/vessel-map.svg';
import '../styles/style.scss';

// List every segment id exactly as it appears in the SVG
const vesselList = [
  { id: 'Aorta_Afbeelding', label: 'Aorta' },
  { id: 'iliac_Afbeelding', label: 'Iliac Artery' },
  { id: 'Left_common_iliac_Afbeelding', label: 'Left Common Iliac' },
  { id: 'Right_common_iliac_Afbeelding', label: 'Right Common Iliac' },
  { id: 'Left_external_iliac_Afbeelding', label: 'Left External Iliac' },
  { id: 'Right_extrnal_iliac_Afbeelding', label: 'Right External Iliac' },
  { id: 'Left_internal_iliac_Afbeelding', label: 'Left Internal Iliac' },
  { id: 'Right_internal_iliac_Afbeelding', label: 'Right Internal Iliac' },
  { id: 'Left_common_femoral_Afbeelding', label: 'Left Common Femoral' },
  { id: 'Right_common_femoral_Afbeelding', label: 'Right Common Femoral' },
  { id: 'Left_superficial_femoral_Afbeelding', label: 'Left Superficial Femoral' },
  { id: 'Right_superficial_femoral_Afbeelding', label: 'Right Superficial Femoral' },
  { id: 'Left_profunda_Afbeelding', label: 'Left Profunda' },
  { id: 'Right_profunda_Afbeelding', label: 'Right Profunda' },
  { id: 'Left_popliteal_artery_Afbeelding', label: 'Left Popliteal' },
  { id: 'Right_popliteal_artery_Afbeelding', label: 'Right Popliteal' },
  { id: 'Left_anterior_tibial_Afbeelding', label: 'Left Anterior Tibial Artery' },
  { id: 'Right_anterior_tibital_Afbeelding', label: 'Right Anterior Tibial Artery' },
  { id: 'Left_peroneal_Afbeelding', label: 'Left Peroneal Artery' },
  { id: 'Right_peroneal_Afbeelding', label: 'Right Peroneal Artery' },
  { id: 'Left_posterior_tibial2_Afbeelding', label: 'Left Posterior Tibial Artery' },
  { id: 'Right_posterior_tibial_Afbeelding', label: 'Right Posterior Tibial Artery' },
  { id: 'Left_tibioperoneal_trunk_Afbeelding', label: 'Left Tibioperoneal Trunk' },
  { id: 'Right_tibioperoneal_trunk_Afbeelding', label: 'Right Tibioperoneal Trunk' },
  { id: 'crural_Afbeelding', label: 'Crural Trunk' },
  { id: 'Left_dorsal_pedal_Afbeelding', label: 'Left Dorsal Pedal Artery' },
  { id: 'Right_dorsal_pedal_Afbeelding', label: 'Right Dorsal Pedal Artery' },
  { id: 'Left_medial_plantar_Afbeelding', label: 'Left Medial Plantar Artery' },
  { id: 'Left_lateral_plantar_Afbeelding', label: 'Left Lateral Plantar Artery' },
  { id: 'Right_medial_plantar_Afbeelding', label: 'Right Medial Plantar Artery' },
  { id: 'Right_lateral_plantar_Afbeelding', label: 'Right Lateral Plantar Artery' },
  { id: 'Left_plantar_arch_Afbeelding', label: 'Left Plantar Arch' },
  { id: 'Right_plantar_arch_Afbeelding', label: 'Right Plantar Arch' },
  { id: 'Left_metatarsal_Afbeelding', label: 'Left Metatarsal Arteries' },
  { id: 'Right_metatarsal_Afbeelding', label: 'Right Metatarsal Arteries' },
  { id: 'pedal_Afbeelding', label: 'Pedal Vessel' },
  { id: 'fem-pop_Afbeelding', label: 'Fem-Pop' },
];

export default function VesselMap() {
  const wrapperRef = useRef(null);
  const segmentsRef = useRef([]);
  const [hoverSegment, setHoverSegment] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);

  useEffect(() => {
    console.log('📦 hoverSegment changed to', hoverSegment);
  }, [hoverSegment]);

  useEffect(() => {
    console.log('📦 selectedSegments changed to', selectedSegments);
  }, [selectedSegments]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    const wired = [];

    vesselList.forEach((seg) => {
      const groupEls = Array.from(
        document.querySelectorAll(`g[id$="${seg.id}"]`)
      );
      console.debug(`🔍 Found ${groupEls.length} <g> for “${seg.id}”`);

      const shapes = groupEls.flatMap((g) =>
        Array.from(g.querySelectorAll('path, polyline, polygon'))
      );
      console.debug(`📈 Found ${shapes.length} shapes for “${seg.id}”`);

      const color = selectedSegments.includes(seg.id) ? 'red' : 'green';

      shapes.forEach((shape) => {
        shape.setAttribute('fill', color);
        shape.style.cursor = 'pointer';

        const enter = () => {
          console.debug(`👀 hover on ${seg.id}`);
          setHoverSegment(seg.id);
        };
        const leave = () => {
          console.debug(`👋 leave ${seg.id}`);
          setHoverSegment(null);
        };
        const click = () => {
          console.debug(`🔴 click on ${seg.id}`);
          setSelectedSegments((prev) => {
            const hasIt = prev.includes(seg.id);
            return hasIt ? prev.filter((x) => x !== seg.id) : [...prev, seg.id];
          });
        };

        shape.addEventListener('mouseenter', enter);
        shape.addEventListener('mouseleave', leave);
        shape.addEventListener('click', click);

        shape.__handlers = { enter, leave, click };

        wired.push({ id: seg.id, element: shape });
      });
    });

    segmentsRef.current = wired;
    console.debug(
      `✅ Wiring complete: ${selectedSegments.length} pre-selected, hover=${hoverSegment}`
    );

    return () => {
      wired.forEach(({ element }) => {
        const h = element.__handlers;
        if (!h) return;
        element.removeEventListener('mouseenter', h.enter);
        element.removeEventListener('mouseleave', h.leave);
        element.removeEventListener('click', h.click);
      });
    };
  }, []);

  useEffect(() => {
    segmentsRef.current.forEach(({ id, element }) => {
      element.classList.toggle('selected-segment', selectedSegments.includes(id));
    });
  }, [selectedSegments]);

  const hoveredLabel = hoverSegment ? vesselList.find((v) => v.id === hoverSegment)?.label : null;
  const segmentElements = segmentsRef.current;

  return (
    <div className="vessel-map-wrapper" ref={wrapperRef}>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          background: 'rgba(255,255,255,0.9)',
          padding: '0.5em',
          fontSize: '0.8em',
          zIndex: 9999,
        }}
      >
        <strong>DEBUG:</strong>
        <br />
        Hover: {hoverSegment ? hoverSegment.label : '—'}
        <br />
        Selected: {JSON.stringify(selectedSegments)}
        <br />
        Total shapes: {segmentElements.length}
      </div>
      <VesselSVG />
      {hoverSegment && tooltip && (
        <div className="tooltip vessel-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {hoveredLabel}
        </div>
      )}
      <div className="vessel-summary">
        {selectedSegments.length === 0 ? (
          <p>No vessels selected</p>
        ) : (
          <ul>
            {selectedSegments.map((id) => {
              const seg = vesselList.find((v) => v.id === id);
              return <li key={id}>{seg ? seg.label : id}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
