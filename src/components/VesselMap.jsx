import React, { useEffect } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap({ onSegmentClick = () => {}, segmentColors = {} }) {
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
        const handler = () => onSegmentClick(id);
        el.addEventListener('click', handler);
        handlers.push({ el, handler });
      });
    });
    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
    };
  }, [onSegmentClick]);

  return <MapSvg />;
}
