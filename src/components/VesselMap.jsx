import React, { useEffect, useState } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setTooltip = () => {},
}) {
  const [hoverSegment, setHoverSegment] = useState(null);

  console.log('🐭 hover:', hoverSegment, '🖱️ selected:', selectedSegments);

  useEffect(() => {
    const svgRoot = document.querySelector('.vessel-map-wrapper svg');

    if (!svgRoot) return;

    // Ensure striped pattern exists
    const defs = svgRoot.querySelector('defs') || (() => {
      const d = document.createElementNS(svgRoot.namespaceURI, 'defs');
      svgRoot.prepend(d);
      return d;
    })();
    if (!svgRoot.querySelector('#stripePattern')) {
      defs.innerHTML += `
        <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,0 l8,8 M-2,2 l4,-4 M6,10 l4,-4" stroke="#000" stroke-width="1"/>
        </pattern>
      `;
    }

    const rawEls = svgRoot.querySelectorAll('[id$="_Afbeelding"]');
    const segments = Array.from(rawEls).map((el) => ({ id: el.id.split('__').pop(), el }));
    console.log('🔍 Found IDs:', segments.map((s) => s.id));

    const handlers = [];

    segments.forEach(({ id, el }) => {
      const nameAttr = el.getAttribute('data-name');
      const name =
        vesselSegments.find((s) => s.id === id)?.name ||
        (nameAttr ? nameAttr.replace(/\u00a0?Afbeelding/, '') : id);

      const title = el.querySelector('title');
      if (title) title.textContent = name;
      else {
        const t = document.createElement('title');
        t.textContent = name;
        el.appendChild(t);
      }

      const clickHandler = () => {
        toggleSegment(id);
        el.classList.toggle('selected');
      };
      const enterHandler = (e) => {
        setHoverSegment(id);
        setTooltip({ name, x: e.clientX, y: e.clientY });
      };
      const moveHandler = (e) => setTooltip({ name, x: e.clientX, y: e.clientY });
      const leaveHandler = () => {
        setHoverSegment(null);
        setTooltip(null);
      };

      el.style.cursor = 'pointer';
      el.addEventListener('click', clickHandler);
      el.addEventListener('mouseenter', enterHandler);
      el.addEventListener('mousemove', moveHandler);
      el.addEventListener('mouseleave', leaveHandler);

      el.classList.toggle('selected', selectedSegments.includes(id));

      handlers.push({ el, clickHandler, enterHandler, moveHandler, leaveHandler });
    });

    return () => {
      handlers.forEach(({ el, clickHandler, enterHandler, moveHandler, leaveHandler }) => {
        el.removeEventListener('click', clickHandler);
        el.removeEventListener('mouseenter', enterHandler);
        el.removeEventListener('mousemove', moveHandler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, [selectedSegments, toggleSegment, setTooltip]);

  return <MapSvg />;
}
