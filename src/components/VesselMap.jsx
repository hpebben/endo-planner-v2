import React, { useEffect } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({
  onSegmentClick = () => {},
  onSegmentMouseEnter = () => {},
  onSegmentMouseLeave = () => {},
  onSegmentMouseMove = () => {},
  segmentColors = {},
}) {
  useEffect(() => {
    const handlers = [];
    vesselSegments.forEach(({ id, name }) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.querySelectorAll('path').forEach((el) => {
        if (!el.querySelector('title')) {
          const t = document.createElement('title');
          t.textContent = name;
          el.appendChild(t);
        } else {
          el.querySelector('title').textContent = name;
        }

        const clickHandler = () => onSegmentClick(id);
        const enterHandler = (e) => onSegmentMouseEnter(id, name, e);
        const leaveHandler = () => onSegmentMouseLeave(id, name);
        const moveHandler = (e) => onSegmentMouseMove(id, name, e);

        el.addEventListener('click', clickHandler);
        el.addEventListener('mouseenter', enterHandler);
        el.addEventListener('mouseleave', leaveHandler);
        el.addEventListener('mousemove', moveHandler);

        handlers.push({ el, clickHandler, enterHandler, leaveHandler, moveHandler });
      });
    });
    return () => {
      handlers.forEach(({ el, clickHandler, enterHandler, leaveHandler, moveHandler }) => {
        el.removeEventListener('click', clickHandler);
        el.removeEventListener('mouseenter', enterHandler);
        el.removeEventListener('mouseleave', leaveHandler);
        el.removeEventListener('mousemove', moveHandler);
      });
    };
  }, [onSegmentClick, onSegmentMouseEnter, onSegmentMouseLeave, onSegmentMouseMove]);

  return <MapSvg />;
}
