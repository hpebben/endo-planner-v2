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
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    // Inject stripe pattern if not present
    const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg','defs'), svg.firstChild);
    if (!svg.querySelector('#stripePattern')) {
      const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', 'stripePattern');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      pattern.setAttribute('width', '8');
      pattern.setAttribute('height', '8');
      pattern.innerHTML = '<path d="M0 0L8 8" stroke="#ccc" stroke-width="2" />';
      defs.appendChild(pattern);
    }

    const segments = [];
    vesselList.forEach(({ id }) => {
      const baseEl = svg.querySelector(`[id$="${id}"]`);
      if (!baseEl) return;
      const paths =
        baseEl.tagName.toLowerCase() === 'path'
          ? [baseEl]
          : Array.from(baseEl.querySelectorAll('path'));
      if (paths.length === 0) return;
      const mouseenter = (e) => {
        setHoverSegment(id);
        setTooltip({ x: e.clientX, y: e.clientY });
      };
      const mouseleave = () => {
        setHoverSegment(null);
        setTooltip(null);
      };
      const mousemove = (e) => {
        setTooltip({ x: e.clientX, y: e.clientY });
      };
      const click = () => {
        setSelectedSegments((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      };
      paths.forEach((path) => {
        path.addEventListener('mouseenter', mouseenter);
        path.addEventListener('mouseleave', mouseleave);
        path.addEventListener('mousemove', mousemove);
        path.addEventListener('click', click);
        segments.push({ id, element: path, handlers: { mouseenter, mouseleave, mousemove, click } });
      });
    });

    segmentsRef.current = segments;
    console.log('\uD83D\uDD0D SVG IDs found:', segments.map((s) => s.id));
    console.log('\uD83D\uDD0D Missing IDs:', vesselList.map((v) => v.id).filter((id) => !segments.some((s) => s.id === id)));

    return () => {
      segments.forEach(({ element, handlers }) => {
        element.removeEventListener('mouseenter', handlers.mouseenter);
        element.removeEventListener('mouseleave', handlers.mouseleave);
        element.removeEventListener('mousemove', handlers.mousemove);
        element.removeEventListener('click', handlers.click);
      });
    };
  }, []);

  useEffect(() => {
    segmentsRef.current.forEach(({ id, element }) => {
      element.classList.toggle('selected-segment', selectedSegments.includes(id));
    });
  }, [selectedSegments]);

  const hoveredLabel = hoverSegment ? vesselList.find((v) => v.id === hoverSegment)?.label : null;

  return (
    <div className="vessel-map-wrapper" ref={wrapperRef}>
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
