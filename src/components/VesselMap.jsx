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
    const handlers = [];
    vesselSegments.forEach(({ id, name }) => {
      const group = document.getElementById(id);
      if (group) {
        console.log(`Found SVG element: ${id}`);
      }
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

        const clickHandler = () => {
          const newSelected = selectedSegments.includes(id)
            ? selectedSegments.filter((s) => s !== id)
            : [...selectedSegments, id];
          console.log('clicked: ' + id, newSelected);
          toggleSegment(id);
        };
        const enterHandler = (e) => {
          console.log('hover start: ' + id, e.clientX, e.clientY);
          setHoverSegment(id);
          setTooltip({ name, x: e.clientX, y: e.clientY });
        };
        const moveHandler = (e) =>
          setTooltip({ name, x: e.clientX, y: e.clientY });
        const leaveHandler = () => {
          console.log('hover end: ' + id);
          setHoverSegment(null);
          setTooltip(null);
        };

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
