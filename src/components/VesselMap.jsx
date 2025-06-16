import React, { useEffect } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setTooltip = () => {},
}) {

  useEffect(() => {
    const handlers = [];
    vesselSegments.forEach(({ id, name }) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.querySelectorAll('path').forEach((el) => {
        el.classList.add('segment');
        el.classList.toggle('selected', selectedSegments.includes(id));

        const title = el.querySelector('title');
        if (title) {
          title.textContent = name;
        } else {
          const t = document.createElement('title');
          t.textContent = name;
          el.appendChild(t);
        }

        const clickHandler = () => toggleSegment(id);
        const enterHandler = (e) =>
          setTooltip({ name, x: e.clientX, y: e.clientY });
        const moveHandler = (e) =>
          setTooltip({ name, x: e.clientX, y: e.clientY });
        const leaveHandler = () => setTooltip(null);

        el.addEventListener('click', clickHandler);
        el.addEventListener('mouseenter', enterHandler);
        el.addEventListener('mousemove', moveHandler);
        el.addEventListener('mouseleave', leaveHandler);
        handlers.push({ el, clickHandler, enterHandler, moveHandler, leaveHandler });
      });
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
