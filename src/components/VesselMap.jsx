import React, { useEffect, useState } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setTooltip = () => {},
}) {
  const [hoverSegment, setHoverSegment] = useState(null);

  console.log('VesselMap state', { hoverSegment, selectedSegments });

  useEffect(() => {
    const svgRoot = document.querySelector('.vessel-map-wrapper svg');

    if (!svgRoot) return;

    // Ensure striped pattern exists
    if (!svgRoot.querySelector('#stripePattern')) {
      const defs =
        svgRoot.querySelector('defs') ||
        svgRoot.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svgRoot.firstChild);
      const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', 'stripePattern');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      pattern.setAttribute('width', '6');
      pattern.setAttribute('height', '6');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M0 0 l6 6 M6 0 l-6 6');
      path.setAttribute('stroke', '#007cba');
      path.setAttribute('stroke-width', '1');
      pattern.appendChild(path);
      defs.appendChild(pattern);
    }

    const allEls = Array.from(svgRoot.querySelectorAll('[id]'));
    console.log('🔍 All SVG IDs:', allEls.map((e) => e.id));

    const segments = allEls.map((el) => {
      const raw = el.id.split('__').pop();
      return { id: raw, el };
    });
    console.log('💡 Mapped segments:', segments.map((s) => s.id));

    const handlers = [];

    segments.forEach(({ id, el }) => {
      const pathEl = el.tagName.toLowerCase() === 'path' ? el : el.querySelector('path');
      if (pathEl) {
        pathEl.classList.add('segment');
        pathEl.classList.toggle('highlighted', selectedSegments.includes(id));
        const nameAttr = el.getAttribute('data-name');
        const name =
          vesselSegments.find((s) => s.id === id)?.name ||
          (nameAttr ? nameAttr.replace(/\u00a0?Afbeelding/, '') : id);
        const title = pathEl.querySelector('title');
        if (title) title.textContent = name;
        else {
          const t = document.createElement('title');
          t.textContent = name;
          pathEl.appendChild(t);
        }

        const clickHandler = () => {
          console.log('🖱️ click:', id);
          toggleSegment(id);
        };
        const enterHandler = (e) => {
          console.log('🐭 hover:', id);
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

        handlers.push({ el, clickHandler, enterHandler, moveHandler, leaveHandler });
      }
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
