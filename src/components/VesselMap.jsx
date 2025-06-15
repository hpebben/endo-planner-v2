import React, { useEffect } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setHoverLabel = () => {},
}) {
  useEffect(() => {
    const handlers = [];
    vesselSegments.forEach(({ id, name }) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.querySelectorAll('path').forEach((el) => {
        el.classList.add('segment');
        el.classList.toggle('selected', selectedSegments.includes(id));

        if (!el.querySelector('title')) {
          const t = document.createElement('title');
          t.textContent = name;
          el.appendChild(t);
        } else {
          el.querySelector('title').textContent = name;
        }

        const clickHandler = () => toggleSegment(id);
        const enterHandler = () => setHoverLabel(name);
        const leaveHandler = () => setHoverLabel('');

        el.addEventListener('click', clickHandler);
        el.addEventListener('mouseenter', enterHandler);
        el.addEventListener('mouseleave', leaveHandler);

        handlers.push({ el, clickHandler, enterHandler, leaveHandler });
      });
    });
    return () => {
      handlers.forEach(({ el, clickHandler, enterHandler, leaveHandler }) => {
        el.removeEventListener('click', clickHandler);
        el.removeEventListener('mouseenter', enterHandler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, [selectedSegments, toggleSegment, setHoverLabel]);

  return <MapSvg />;
}
