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

    // Inject stripe pattern if not present
    const defs =
      svg.querySelector('defs') ||
      svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild);
    if (!svg.querySelector('#stripePattern')) {
      const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', 'stripePattern');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      pattern.setAttribute('width', '6');
      pattern.setAttribute('height', '6');
      pattern.setAttribute('patternTransform', 'rotate(45)');
      pattern.innerHTML = '<rect width="3" height="6" fill="rgba(255,0,0,0.3)" />';
      defs.appendChild(pattern);
    }

    const segmentElements = vesselList.flatMap((segment) => {
      const paths = Array.from(svg.querySelectorAll(`path[id$="${segment.id}"]`));
      if (paths.length === 0) {
        console.warn(`⚠️ No paths found for segment ${segment.id}`);
      } else {
        console.log(`✅ ${paths.length} path(s) for ${segment.id}`);
      }
      return paths.map((pathEl) => ({ id: segment.id, label: segment.label, element: pathEl }));
    });

    segmentElements.forEach(({ id, element }) => {
      element.dataset.segId = id;
      const mouseenter = (e) => {
        console.log('🔍 hover on', id);
        setHoverSegment(id);
        setTooltip({ x: e.clientX, y: e.clientY });
      };
      const mouseleave = () => {
        console.log('🔍 leave', id);
        setHoverSegment(null);
        setTooltip(null);
      };
      const mousemove = (e) => {
        setTooltip({ x: e.clientX, y: e.clientY });
      };
      const click = () => {
        console.log('🖱️ click on', id);
        setSelectedSegments((prev) => {
          const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
          console.log('➡️ selectedSegments now', next);
          element.classList.toggle('selected-segment', next.includes(id));
          return next;
        });
      };
      element.addEventListener('mouseenter', mouseenter);
      element.addEventListener('mouseleave', mouseleave);
      element.addEventListener('mousemove', mousemove);
      element.addEventListener('click', click);
      // store handlers to clean up later
      element.__handlers = { mouseenter, mouseleave, mousemove, click };
    });

    segmentsRef.current = segmentElements;
    console.log('📈 total paths wired:', segmentElements.length);

    return () => {
      segmentElements.forEach(({ element }) => {
        const h = element.__handlers;
        if (!h) return;
        element.removeEventListener('mouseenter', h.mouseenter);
        element.removeEventListener('mouseleave', h.mouseleave);
        element.removeEventListener('mousemove', h.mousemove);
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
      <div style={{ border: '1px solid red', padding: '0.5em' }}>
        <strong>DEBUG:</strong>
        <br />
        Found {segmentElements.length} path elements.
        <br />
        Selected IDs: {JSON.stringify(selectedSegments)}
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
